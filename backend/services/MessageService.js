import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { getIO } from "../socket.js";
import mongoose from "mongoose";
import { messageQueue } from "../utils/messageQueue.js";
import RetryManager from "../utils/retryManager.js";

// Create retryManager instance
const retryManager = new RetryManager(3, 1000);

class MessageService {
  constructor() {
    this.connectedUsers = new Map(); // userId -> socketId
    this.userSockets = new Map(); // socketId -> userId
    this.typingUsers = new Map(); // conversationId -> Set of typing userIds

    // Message cache configuration
    this.messageCache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
    this.MAX_CACHE_SIZE = 1000; // Initialize message queue handler
    messageQueue.setFlushHandler(async (conversationId, messages) => {
      await this.sendMessagesBatch(messages);
    });

    console.log("MessageService initialized");
  }

  initialize(socket, userId) {
    console.log(`MessageService.initialize called for user: ${userId}`);

    // Store user connection
    this.connectedUsers.set(userId, socket.id);
    this.userSockets.set(socket.id, userId);

    // Setup socket disconnect handler
    socket.on("disconnect", () => {
      this.connectedUsers.delete(userId);
      this.userSockets.delete(socket.id);
    });

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
    metadata = {},
    options = {}
  ) {
    const message = {
      conversation: conversationId,
      sender: senderId,
      content,
      type,
      metadata,
      readBy: [senderId],
    };

    if (options.immediate) {
      // Send immediately without batching
      return this.sendSingleMessage(message);
    }

    // Add to batch queue
    messageQueue.add(conversationId, message);
    return { queued: true, message };
  }

  async sendSingleMessage(messageData) {
    const operationId = `send_message_${
      messageData.conversation
    }_${Date.now()}`;
    return retryManager.execute(operationId, async () => {
      const message = await Message.create(messageData);

      // Update conversation's last message
      await Conversation.findByIdAndUpdate(
        messageData.conversation,
        {
          lastMessage: message._id,
          $inc: { "unreadCount.$[elem]": 1 },
        },
        {
          arrayFilters: [{ elem: { $ne: messageData.sender } }],
        }
      );

      await message.populate("sender", "name profileImage"); // Notify participants
      const conversation = await this.getConversation(messageData.conversation);
      conversation.participants
        .filter((p) => p.toString() !== messageData.sender)
        .forEach((participantId) => {
          const socketId = this.connectedUsers.get(participantId.toString());
          if (socketId) {
            const io = getIO();
            io.to(socketId).emit("receive_message", message);
          }
        });

      return message;
    });
  }

  async markMessagesAsRead(conversationId, userId) {
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
  }

  async getConversationMessages(conversationId, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("sender", "name profileImage")
      .lean();

    return messages.reverse();
  }

  async getUserConversations(userId) {
    return await Conversation.find({ participants: userId })
      .populate("participants", "name profileImage")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });
  }

  async searchMessages(conversationId, query) {
    return await Message.find({
      conversation: conversationId,
      $text: { $search: query },
    })
      .sort({ score: { $meta: "textScore" }, createdAt: -1 })
      .populate("sender", "name profileImage");
  }

  async getConversation(conversationId) {
    const conversation = await Conversation.findById(conversationId)
      .populate("participants", "name profileImage")
      .lean();

    if (!conversation) {
      throw new Error("Conversation not found");
    }
    return conversation;
  }

  isUserOnline(userId) {
    return this.connectedUsers.has(userId.toString());
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

  // Enhanced message retrieval with caching
  async getUserConversationsWithCache(userId) {
    const cacheKey = `conversations:${userId}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    const conversations = await this.getUserConversations(userId);
    this.addToCache(cacheKey, conversations);
    return conversations;
  }

  // Batch message operations
  async markMessagesAsReadBatch(conversationId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const [updateResult, conversation] = await Promise.all([
        Message.updateMany(
          { conversation: conversationId, receiver: userId, read: false },
          { read: true },
          { session }
        ),
        Conversation.findByIdAndUpdate(
          conversationId,
          { $set: { [`unreadCount.${userId}`]: 0 } },
          { session, new: true }
        ),
      ]);

      await session.commitTransaction();
      return { updateResult, conversation };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Batch send messages
  async sendMessagesBatch(messages) {
    const operationId = `batch_send_${Date.now()}`;
    return retryManager.execute(operationId, async () => {
      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const createdMessages = [];
        const conversationUpdates = new Map();

        // Create all messages in batch
        for (const msg of messages) {
          const message = await Message.create([msg], { session });
          createdMessages.push(message[0]);

          if (!conversationUpdates.has(msg.conversation)) {
            conversationUpdates.set(msg.conversation, new Set());
          }
          conversationUpdates.get(msg.conversation).add(msg.sender);
        }

        // Update conversations in batch
        await Promise.all(
          Array.from(conversationUpdates.entries()).map(
            ([conversationId, senders]) =>
              Conversation.findByIdAndUpdate(
                conversationId,
                {
                  lastMessage: createdMessages
                    .filter((m) => m.conversation.toString() === conversationId)
                    .slice(-1)[0]._id,
                  $inc: { "unreadCount.$[elem]": 1 },
                },
                {
                  arrayFilters: [{ elem: { $nin: Array.from(senders) } }],
                  session,
                }
              )
          )
        );

        await session.commitTransaction();

        const populatedMessages = await Message.populate(createdMessages, {
          path: "sender",
          select: "name profileImage",
        });

        // Group and send notifications
        const notificationsByConversation = new Map();
        for (const message of populatedMessages) {
          if (
            !notificationsByConversation.has(message.conversation.toString())
          ) {
            notificationsByConversation.set(
              message.conversation.toString(),
              []
            );
          }
          notificationsByConversation
            .get(message.conversation.toString())
            .push(message);
        }

        await Promise.all(
          Array.from(notificationsByConversation.entries()).map(
            async ([conversationId, conversationMessages]) => {
              const conversation = await this.getConversation(conversationId);
              const senders = new Set(
                conversationMessages.map((m) => m.sender._id.toString())
              );

              conversation.participants
                .filter((p) => !senders.has(p.toString()))
                .forEach((participantId) => {
                  const socketId = this.connectedUsers.get(
                    participantId.toString()
                  );
                  if (socketId) {
                    const io = getIO();
                    io.to(socketId).emit(
                      "receive_message",
                      conversationMessages
                    );
                  }
                });
            }
          )
        );

        return populatedMessages;
      } catch (error) {
        await session.abortTransaction();
        throw error;
      } finally {
        session.endSession();
      }
    });
  }
}

export default new MessageService();
