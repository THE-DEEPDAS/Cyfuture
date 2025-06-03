class MessageQueue {
  constructor(batchSize = 10, flushInterval = 5000) {
    this.queue = new Map(); // conversationId -> messages[]
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.timers = new Map(); // conversationId -> timer
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

  async flush(conversationId) {
    if (!this.queue.has(conversationId)) {
      return;
    }

    const messages = this.queue.get(conversationId);
    this.queue.delete(conversationId);

    if (this.timers.has(conversationId)) {
      clearTimeout(this.timers.get(conversationId));
      this.timers.delete(conversationId);
    }

    if (messages.length > 0 && this.onFlush) {
      await this.onFlush(conversationId, messages);
    }
  }

  setFlushHandler(handler) {
    this.onFlush = handler;
  }

  async flushAll() {
    const conversationIds = Array.from(this.queue.keys());
    await Promise.all(conversationIds.map((id) => this.flush(id)));
  }
}

export const messageQueue = new MessageQueue();
