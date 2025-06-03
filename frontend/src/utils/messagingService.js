import api from "./api";

// Polling interval (in milliseconds)
const POLL_INTERVAL = 3000;

export class MessagingService {
  constructor() {
    this.pollingInterval = null;
    this.messageCallbacks = new Set();
    this.typingCallbacks = new Set();
    this.lastMessageTimestamp = Date.now();
  }

  init() {
    this.startPolling();
  }

  startPolling() {
    if (!this.pollingInterval) {
      this.pollingInterval = setInterval(
        () => this.pollMessages(),
        POLL_INTERVAL
      );
    }
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  async pollMessages() {
    try {
      const { data } = await api.get(
        `/api/messages/updates?since=${this.lastMessageTimestamp}`
      );

      if (data.messages && data.messages.length > 0) {
        this.lastMessageTimestamp = Date.now();
        data.messages.forEach((message) => {
          this.messageCallbacks.forEach((callback) => callback(message));
        });
      }

      if (data.typingUpdates) {
        data.typingUpdates.forEach((update) => {
          this.typingCallbacks.forEach((callback) => callback(update));
        });
      }
    } catch (error) {
      console.error("Error polling messages:", error);
    }
  }

  onMessage(callback) {
    this.messageCallbacks.add(callback);
    return () => this.messageCallbacks.delete(callback);
  }

  onTyping(callback) {
    this.typingCallbacks.add(callback);
    return () => this.typingCallbacks.delete(callback);
  }

  async sendMessage(message) {
    try {
      const { data } = await api.post("/api/messages", message);
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async markMessageRead(messageId) {
    try {
      await api.put(`/api/messages/${messageId}/read`);
    } catch (error) {
      console.error("Error marking message as read:", error);
      throw error;
    }
  }

  async sendTypingStatus(conversationId, isTyping) {
    try {
      await api.post(`/api/messages/typing`, {
        conversationId,
        isTyping,
      });
    } catch (error) {
      console.error("Error sending typing status:", error);
    }
  }
}

export const messagingService = new MessagingService();
