// Message queue for batching messages before sending to server
export class MessageQueue {
  constructor(batchSize = 10, flushInterval = 5000) {
    this.queue = new Map(); // conversationId -> messages[]
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.timers = new Map(); // conversationId -> timer
    this.flushHandler = null; // Handler for processing flushed messages
  }

  add(conversationId, message) {
    if (!this.queue.has(conversationId)) {
      this.queue.set(conversationId, []);
      this.startFlushTimer(conversationId);
    }

    const messages = this.queue.get(conversationId);
    messages.push(message);

    if (messages.length >= this.batchSize) {
      this.flush(conversationId);
    }
  }

  startFlushTimer(conversationId) {
    if (this.timers.has(conversationId)) {
      clearTimeout(this.timers.get(conversationId));
    }

    const timer = setTimeout(() => {
      this.flush(conversationId);
    }, this.flushInterval);

    this.timers.set(conversationId, timer);
  }

  setFlushHandler(handler) {
    if (typeof handler !== "function") {
      throw new Error("Flush handler must be a function");
    }
    this.flushHandler = handler;
  }

  flush(conversationId) {
    if (!this.queue.has(conversationId)) {
      return [];
    }

    const messages = this.queue.get(conversationId);
    this.queue.delete(conversationId);

    if (this.timers.has(conversationId)) {
      clearTimeout(this.timers.get(conversationId));
      this.timers.delete(conversationId);
    }

    // If there's a flush handler, call it with the messages
    if (this.flushHandler && messages.length > 0) {
      this.flushHandler(conversationId, messages);
    }

    return messages;
  }

  getMessages(conversationId) {
    return this.queue.get(conversationId) || [];
  }

  clear(conversationId) {
    this.queue.delete(conversationId);
    if (this.timers.has(conversationId)) {
      clearTimeout(this.timers.get(conversationId));
      this.timers.delete(conversationId);
    }
  }
}

// Create and export a singleton instance
export const clientMessageQueue = new MessageQueue();
