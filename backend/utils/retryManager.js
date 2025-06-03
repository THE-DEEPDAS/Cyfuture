class RetryManager {
  constructor(maxRetries = 3, baseDelay = 1000) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
    this.retryMap = new Map(); // operationId -> { attempts, lastAttempt }
  }

  async execute(operationId, operation) {
    if (!this.retryMap.has(operationId)) {
      this.retryMap.set(operationId, { attempts: 0, lastAttempt: 0 });
    }

    const retryInfo = this.retryMap.get(operationId);
    const now = Date.now();
    const timeSinceLastAttempt = now - retryInfo.lastAttempt;

    // Reset attempts if it's been a while
    if (timeSinceLastAttempt > this.baseDelay * 10) {
      retryInfo.attempts = 0;
    }

    if (retryInfo.attempts >= this.maxRetries) {
      throw new Error(
        `Maximum retry attempts (${this.maxRetries}) exceeded for operation ${operationId}`
      );
    }

    try {
      retryInfo.lastAttempt = now;
      retryInfo.attempts++;
      const result = await operation();

      // Success - reset attempts
      this.retryMap.delete(operationId);
      return result;
    } catch (error) {
      // Calculate delay with exponential backoff
      const delay = this.baseDelay * Math.pow(2, retryInfo.attempts - 1);

      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay + jitter));

      // Let it throw if we've exceeded max retries
      if (retryInfo.attempts >= this.maxRetries) {
        this.retryMap.delete(operationId);
        throw error;
      }

      // Retry
      return this.execute(operationId, operation);
    }
  }

  clearRetries(operationId) {
    this.retryMap.delete(operationId);
  }
}

export default RetryManager;
