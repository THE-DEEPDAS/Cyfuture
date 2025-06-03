// Socket.io server instance for the application
import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.FRONTEND_URL
          : [
              "http://localhost:5173",
              "http://127.0.0.1:5173",
              process.env.FRONTEND_URL,
            ],
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });
  
  console.log("Socket.io initialized");
  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export { io };
