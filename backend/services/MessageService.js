import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";
import { messageQueue } from "../utils/messageQueue.js";
import RetryManager from "../utils/retryManager.js";

// Create retryManager instance
const retryManager = new RetryManager(3, 1000);

class MessageService {
  constructor() {
    this.messageCache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    this.MAX_CACHE_SIZE = 1000;
    this.MAX_RETRIES = 3;
    this.RETRY_DELAY = 1000; // 1 second

    // Initialize message queue handler
    messageQueue.setFlushHandler(async (conversationId, messages) => {
      await this.sendMessagesBatch(messages);
    });

    console.log("MessageService initialized with polling");
  }

  async initialize() {
    console.log("MessageService initialized with polling-based system");
    return true;
  }

  async createConversation(participants, type = "individual", metadata = {}) {
    const conversation = await Conversation.create({
      participants,
      type,
      ...metadata,
    });
    return conversation;
  }
  async sendMessage(
    conversationId,
    senderId,
    content,
    type = "text",
    metadata = {}
  ) {
    try {
      const message = await Message.create({
        conversation: conversationId,
        sender: senderId,
        content,
        type,
        metadata,
        readBy: [senderId],
        deliveryStatus: "sending",
      });

      // Add to message queue for batch processing with retry logic
      messageQueue.add(conversationId, message);

      let retryCount = 0;
      const retryOperation = async () => {
        try {
          await this.processMessage(message);
          await Message.findByIdAndUpdate(message._id, {
            deliveryStatus: "delivered",
          });
          return message;
        } catch (error) {
          retryCount++;
          if (retryCount < this.MAX_RETRIES) {
            await new Promise((resolve) =>
              setTimeout(resolve, this.RETRY_DELAY * retryCount)
            );
            return retryOperation();
          }
          await Message.findByIdAndUpdate(message._id, {
            deliveryStatus: "failed",
            error: error.message,
          });
          throw error;
        }
      };

      return retryOperation();
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async processMessage(message) {
    try {
      // Update conversation
      await Conversation.findByIdAndUpdate(message.conversation, {
        lastMessage: message._id,
        lastMessageAt: message.createdAt,
        $inc: { messageCount: 1 },
      });

      // Emit real-time update through socket if available
      const io = global.io;
      if (io) {
        const room = `conversation:${message.conversation}`;
        io.to(room).emit("new_message", message);
      }

      return true;
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  }

  async sendMessagesBatch(messages) {
    try {
      // Save messages in batch
      const savedMessages = await Message.insertMany(
        messages.map((msg) => ({ ...msg, deliveryStatus: "sending" }))
      );

      const processingPromises = savedMessages.map(async (message) => {
        try {
          await this.processMessage(message);
          await Message.findByIdAndUpdate(message._id, {
            deliveryStatus: "delivered",
          });
        } catch (error) {
          console.error(`Failed to process message ${message._id}:`, error);
          await Message.findByIdAndUpdate(message._id, {
            deliveryStatus: "failed",
            error: error.message,
          });
        }
      });

      await Promise.allSettled(processingPromises);

      // Get final status of all messages
      const updatedMessages = await Message.find({
        _id: { $in: savedMessages.map((m) => m._id) },
      });

      return {
        successful: updatedMessages.filter(
          (m) => m.deliveryStatus === "delivered"
        ),
        failed: updatedMessages.filter((m) => m.deliveryStatus === "failed"),
      };
    } catch (error) {
      console.error("Error in batch message processing:", error);
      throw error;
    }
  }

  async markMessagesAsRead(conversationId, userId) {
    try {
      await Message.updateMany(
        {
          conversation: conversationId,
          readBy: { $ne: userId },
        },
        { $addToSet: { readBy: userId } }
      );

      await Conversation.findByIdAndUpdate(conversationId, {
        $set: { [`unreadCount.${userId}`]: 0 },
      });

      return { success: true };
    } catch (error) {
      console.error("Error marking messages as read:", error);
      throw error;
    }
  }

  async getMessages(userId, lastMessageTimestamp = 0) {
    try {
      // Get conversations where user is a participant
      const conversations = await Conversation.find({
        participants: userId,
      });

      const conversationIds = conversations.map((conv) => conv._id);

      // Get new messages across all conversations
      const messages = await Message.find({
        conversation: { $in: conversationIds },
        createdAt: { $gt: new Date(lastMessageTimestamp) },
      })
        .sort({ createdAt: -1 })
        .populate("sender", "name")
        .lean();

      return messages;
    } catch (error) {
      console.error("Error getting messages:", error);
      throw error;
    }
  }

  async getUnreadCount(userId) {
    try {
      // Get conversations where user is a participant
      const conversations = await Conversation.find({
        participants: userId,
      });

      const conversationIds = conversations.map((conv) => conv._id);

      // Count unread messages
      const unreadCount = await Message.countDocuments({
        conversation: { $in: conversationIds },
        readBy: { $ne: userId },
        sender: { $ne: userId },
      });

      return unreadCount;
    } catch (error) {
      console.error("Error getting unread count:", error);
      throw error;
    }
  }

  // Cache management functions
  addToCache(key, value) {
    if (this.messageCache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.messageCache.keys().next().value;
      this.messageCache.delete(firstKey);
    }
    this.messageCache.set(key, {
      data: value,
      timestamp: Date.now(),
    });
  }

  getFromCache(key) {
    const cached = this.messageCache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.messageCache.delete(key);
      return null;
    }

    return cached.data;
  }
}

export default new MessageService();
