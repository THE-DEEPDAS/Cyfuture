import { io } from "socket.io-client";

// Initialize socket connection
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";
export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Function to connect and authenticate socket
export const connectSocket = (token) => {
  if (!socket.connected) {
    socket.connect();

    // Authenticate once connected
    socket.on("connect", () => {
      console.log("Socket connected, authenticating...");
      socket.emit("authenticate", token);
    });

    // Listen for authentication result
    socket.on("authenticated", (response) => {
      if (response.success) {
        console.log("Socket authenticated successfully");
      } else {
        console.error("Socket authentication failed:", response.error);
        socket.disconnect();
      }
    });

    // Handle reconnection
    socket.on("reconnect", () => {
      console.log("Socket reconnected, re-authenticating...");
      socket.emit("authenticate", token);
    });

    // Handle errors
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }
};

// Function to disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
    console.log("Socket disconnected");
  }
};

export default {
  socket,
  connectSocket,
  disconnectSocket,
};
