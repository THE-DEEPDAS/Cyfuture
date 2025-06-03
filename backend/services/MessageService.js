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
      });

      // Add to message queue for batch processing
      messageQueue.add(conversationId, message);

      return message;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }
  async sendMessagesBatch(messages) {
    try {
      // Save messages in batch
      await Message.insertMany(messages);

      // Update conversation last message
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        await Conversation.findByIdAndUpdate(lastMessage.conversation, {
          lastMessage: lastMessage._id,
          lastMessageAt: lastMessage.createdAt,
        });
      }
    } catch (error) {
      console.error("Error sending messages batch:", error);
      // Add failed messages to retry queue
      messages.forEach((message) => {
        retryManager.addToQueue(async () => {
          await this.sendMessage(
            message.conversation,
            message.sender,
            message.content,
            message.type,
            message.metadata
          );
        });
      });
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
