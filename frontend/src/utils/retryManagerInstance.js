// RetryManager instance for the frontend
import { RetryManager } from "./retryManager";

// Create and export the retryManager instance with default options
export const retryManager = new RetryManager({
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
});
