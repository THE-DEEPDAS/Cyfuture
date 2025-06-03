// Mock socket implementation to avoid socket-related errors
const noop = () => {};

// Create a dummy socket object that won't throw errors
const dummySocket = {
  connected: false,
  id: "mock-socket-id",
  connect: noop,
  disconnect: noop,
  on: (event, callback) => {
    console.log(`Mock socket registered handler for event: ${event}`);
    return dummySocket;
  },
  off: noop,
  emit: (event, data, callback) => {
    console.log(`Mock socket emit: ${event}`, data);
    if (typeof callback === "function") {
      setTimeout(() => callback({ success: true }), 100);
    }
    return true;
  },
  to: () => ({ emit: noop }),
  join: noop,
  leave: noop,
};

// Mock message queue that logs but doesn't attempt to send messages
export class ClientMessageQueue {
  constructor() {
    this.queue = [];
    console.log("Using mock socket implementation");
  }

  add(message) {
    this.queue.push(message);
    console.log("Message queued (mock):", message);
  }

  flushAll() {
    console.log("Flushing messages (mock):", this.queue.length);
    this.queue = [];
  }

  setFlushHandler() {
    // Do nothing
  }

  clearQueue() {
    this.queue = [];
  }
}

export const clientMessageQueue = new ClientMessageQueue();

// Mock socket connection
export const connectSocket = () => {
  console.log("Mock socket connection");
  return Promise.resolve();
};

export const joinConversation = () => {
  console.log("Mock join conversation");
};

export const leaveConversation = () => {
  console.log("Mock leave conversation");
};

export const sendMessage = () => {
  console.log("Mock send message");
  return Promise.resolve({ success: true });
};

export const markAsRead = () => {
  console.log("Mock mark as read");
};

export const getSocket = () => dummySocket;

export default {
  socket: dummySocket,
  connectSocket,
  joinConversation,
  leaveConversation,
  sendMessage,
  markAsRead,
  getSocket,
  clientMessageQueue,
};
