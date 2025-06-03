// Frontend Socket.io client implementation
import { io } from "socket.io-client";
import store from "../store";
import {
  SOCKET_MESSAGE_RECEIVED,
  SOCKET_USER_TYPING,
  SOCKET_USER_STOP_TYPING,
  SOCKET_USER_ONLINE,
  SOCKET_USER_OFFLINE,
} from "../constants/messageConstants";
import { retryManager } from "./retryManager";
import { clientMessageQueue } from "./messageQueue";

// Initialize socket connection with message events
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
// Socket configuration with retry strategy and timeout
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  timeout: 10000,
  transports: ["websocket", "polling"],
  reconnectionDelayMax: 10000,
  randomizationFactor: 0.5,
});

// Connection management
let isConnecting = false;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const connectedRooms = new Set(); // Set up message queue handler
clientMessageQueue.setFlushHandler(async (messages) => {
  if (!socket.connected) return;

  for (const message of messages) {
    const { event, data } = message;
    try {
      await new Promise((resolve, reject) => {
        socket.emit(event, data, (response) => {
          if (response?.error) reject(new Error(response.error));
          else resolve(response);
        });
        setTimeout(() => reject(new Error("Operation timeout")), 5000);
      });
    } catch (error) {
      console.error(`Failed to process queued message: ${error.message}`);
      throw error; // Allow message queue to handle retry
    }
  }
}); // Function to connect and authenticate socket
export const connectSocket = (token) => {
  if (isConnecting) return;
  isConnecting = true;

  socket.auth = { token };

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
    isConnecting = false;
    reconnectAttempts = 0;

    // Rejoin rooms and process queue after reconnection
    connectedRooms.forEach((room) => {
      socket.emit("join_conversation", room);
    });
    clientMessageQueue.flushAll();
  });
  socket.on("connect_error", (error) => {
    console.error("Socket connection error:", error);
    isConnecting = false;
    reconnectAttempts++;

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
      console.error("Max reconnection attempts reached");
      socket.disconnect();
      store.dispatch({
        type: "SOCKET_CONNECTION_FAILED",
        payload:
          "Unable to establish connection. Please check your internet connection and try again.",
      });
    } else {
      const backoffDelay = Math.min(
        1000 * Math.pow(2, reconnectAttempts),
        10000
      );
      setTimeout(() => socket.connect(), backoffDelay);
    }
  });
  socket.on("disconnect", (reason) => {
    console.log("Socket disconnected:", reason);
    if (reason === "io server disconnect") {
      socket.connect();
    }
  });

  // Message event handlers
  socket.on("receive_message", (message) => {
    store.dispatch({
      type: SOCKET_MESSAGE_RECEIVED,
      payload: message,
    });
  });

  socket.on("user_typing", ({ conversationId, userId }) => {
    store.dispatch({
      type: SOCKET_USER_TYPING,
      payload: { conversationId, userId },
    });
  });
  socket.on("user_stopped_typing", ({ conversationId, userId }) => {
    store.dispatch({
      type: SOCKET_USER_STOP_TYPING,
      payload: { conversationId, userId },
    });
  });
  socket.on("user_status_change", ({ userId, status }) => {
    if (status === "online") {
      store.dispatch({ type: SOCKET_USER_ONLINE, payload: userId });
    } else {
      store.dispatch({ type: SOCKET_USER_OFFLINE, payload: userId });
    }
  });
  if (!socket.connected) {
    socket.connect();
  }
}; // Get the socket instance
export const getSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

// Enhanced room management
export const joinConversation = (conversationId) => {
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit("join_conversation", conversationId);
  connectedRooms.add(conversationId);
};

export const leaveConversation = (conversationId) => {
  socket.emit("leave_conversation", conversationId);
  connectedRooms.delete(conversationId);
};

// Enhanced message sending with retry and queueing
export const sendMessage = async (message) => {
  const operationId = `send_message_${message.conversationId}_${Date.now()}`;
  if (!socket.connected) {
    clientMessageQueue.add({ event: "send_message", data: message });
    return;
  }

  try {
    await retryManager.execute(operationId, () => {
      return new Promise((resolve, reject) => {
        socket.emit("send_message", message, (response) => {
          if (response?.error) {
            reject(new Error(response.error));
          } else {
            resolve(response);
          }
        });
        setTimeout(() => reject(new Error("Message send timeout")), 5000);
      });
    });
  } catch (error) {
    console.error("Failed to send message:", error);
    clientMessageQueue.add({ event: "send_message", data: message });
  }
};

// Export sendMessage as emitMessage for backward compatibility
export const emitMessage = sendMessage;

// Add typing indicator functions
export const emitTyping = (conversationId) => {
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit("typing_start", { conversationId });
};

export const stopTyping = (conversationId) => {
  socket.emit("typing_end", { conversationId });
};

// Mark messages as read
export const markMessagesAsRead = (messageId, conversationId) => {
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit("mark_read", { messageId, conversationId });
};

// Export markMessagesAsRead as emitMarkRead for backward compatibility
export const emitMarkRead = markMessagesAsRead;

// Clean up on unmount
export const cleanupSocket = () => {
  socket.removeAllListeners();
  socket.disconnect();
  connectedRooms.clear();
  clientMessageQueue.clearQueue();
};

// Export a socket manager object with all the methods
export default {
  socket,
  connectSocket,
  joinConversation,
  leaveConversation,
  sendMessage,
  emitTyping,
  markMessagesAsRead,
  cleanupSocket,
  getSocket,
};
