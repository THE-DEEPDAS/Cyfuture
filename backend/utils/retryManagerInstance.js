import RetryManager from "./retryManager.js";

// Create and export the retryManager instance
export const retryManager = new RetryManager(3, 1000);
