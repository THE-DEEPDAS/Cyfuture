class RetryManager {
  constructor(options = {}) {
    this.maxRetries = options.maxRetries || 3;
    this.baseDelay = options.baseDelay || 1000;
    this.maxDelay = options.maxDelay || 10000;
    this.retryMap = new Map(); // operationId -> { attempts, lastAttempt }
  }

  async execute(operationId, operation) {
    // Initialize or reset retry info
    if (!this.retryMap.has(operationId)) {
      this.retryMap.set(operationId, { attempts: 0, lastAttempt: 0 });
    }

    const retryInfo = this.retryMap.get(operationId);
    const now = Date.now();
    const timeSinceLastAttempt = now - retryInfo.lastAttempt;

    // Reset attempts if it's been a while (prevent stale retry counts)
    if (timeSinceLastAttempt > this.baseDelay * 10) {
      retryInfo.attempts = 0;
    }

    // Check if we've exceeded max retries
    if (retryInfo.attempts >= this.maxRetries) {
      throw new Error(
        `Maximum retry attempts (${this.maxRetries}) exceeded for operation ${operationId}`
      );
    }

    try {
      retryInfo.lastAttempt = now;
      retryInfo.attempts++;
      const result = await operation();

      // Success - clean up retry info
      this.retryMap.delete(operationId);
      return result;
    } catch (error) {
      // Calculate delay with exponential backoff and jitter
      const delay = Math.min(
        this.baseDelay * Math.pow(2, retryInfo.attempts - 1) +
          Math.random() * 1000,
        this.maxDelay
      );

      // If we've not exceeded max retries, wait and retry
      if (retryInfo.attempts < this.maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.execute(operationId, operation);
      }

      // Clean up and throw if we're out of retries
      this.retryMap.delete(operationId);
      throw error;
    }
  }

  reset(operationId) {
    this.retryMap.delete(operationId);
  }

  clearAll() {
    this.retryMap.clear();
  }

  getRetryInfo(operationId) {
    return this.retryMap.get(operationId);
  }
}

// Create singleton instance
const defaultOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

export const retryManager = new RetryManager(defaultOptions);
