import Message from "../models/Message.js";

// In-memory store for typing indicators
const typingStatus = new Map(); // conversationId -> { userId, timestamp }

// Clear typing status after 5 seconds of inactivity
const TYPING_TIMEOUT = 5000;

class PollingMessageService {
  constructor() {
    // Cleanup typing status periodically
    setInterval(() => this.cleanupTypingStatus(), TYPING_TIMEOUT);
  }

  async getMessageUpdates(userId, since) {
    try {
      // Get new messages for user's conversations
      const messages = await Message.find({
        receiver: userId,
        createdAt: { $gt: new Date(since) },
      })
        .populate("sender", "name avatar")
        .sort({ createdAt: 1 });

      // Get typing status updates
      const typingUpdates = [];
      for (const [conversationId, status] of typingStatus) {
        if (status.timestamp > since) {
          typingUpdates.push({
            conversationId,
            userId: status.userId,
            isTyping: true,
          });
        }
      }

      return {
        messages,
        typingUpdates,
      };
    } catch (error) {
      console.error("Error getting message updates:", error);
      throw error;
    }
  }

  async sendMessage(message) {
    try {
      const newMessage = new Message(message);
      await newMessage.save();
      return newMessage;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async markMessageRead(messageId) {
    try {
      await Message.findByIdAndUpdate(messageId, { read: true });
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  updateTypingStatus(conversationId, userId, isTyping) {
    if (isTyping) {
      typingStatus.set(conversationId, {
        userId,
        timestamp: Date.now(),
      });
    } else {
      typingStatus.delete(conversationId);
    }
  }

  cleanupTypingStatus() {
    const now = Date.now();
    for (const [conversationId, status] of typingStatus) {
      if (now - status.timestamp > TYPING_TIMEOUT) {
        typingStatus.delete(conversationId);
      }
    }
  }
}

export const pollingMessageService = new PollingMessageService();
