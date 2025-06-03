// MessageQueue instance for the frontend
import { ClientMessageQueue } from "./messageQueue";

// Create and export the clientMessageQueue instance with default options
export const clientMessageQueue = new ClientMessageQueue({
  batchSize: 10,
  flushInterval: 5000,
  maxRetries: 3,
});
