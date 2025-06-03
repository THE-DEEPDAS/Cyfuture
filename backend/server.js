import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";
import jwt from "jsonwebtoken";
import { initSocket } from "./socket.js";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// Error middleware
import { errorHandler } from "./middleware/errorMiddleware.js";

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io using the socket.js module
const io = initSocket(server);

// Make io instance available to the Express app
app.set("io", io);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Socket error handling middleware
  socket.use((packet, next) => {
    try {
      // Validate packet structure
      if (!Array.isArray(packet) || packet.length === 0) {
        throw new Error("Invalid packet structure");
      }
      next();
    } catch (err) {
      console.error("Socket middleware error:", err);
      socket.emit("error", {
        message: "An error occurred processing your request",
      });
    }
  });

  // Handle socket errors
  socket.on("error", (error) => {
    console.error("Socket error:", error);
    socket.emit("error", {
      message: "An error occurred in the WebSocket connection",
    });
  });

  // Authenticate user and join personal room
  socket.on("authenticate", async (token) => {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Join user's personal room for direct notifications
      socket.join(userId);
      console.log(`User ${userId} authenticated and joined personal room`);

      // Store user ID in socket for later use
      socket.userId = userId;

      // Set user as online in their rooms
      socket.broadcast.emit("user_status_change", {
        userId,
        status: "online",
      });

      // Notify the client that authentication was successful
      socket.emit("authenticated", { success: true });
    } catch (error) {
      console.error("Socket authentication error:", error);
      socket.emit("authenticated", {
        success: false,
        error: "Authentication failed",
      });
    }
  });

  // Handle typing indicators
  socket.on("typing_start", (data) => {
    socket.to(data.conversationId).emit("user_typing", {
      userId: socket.userId,
      conversationId: data.conversationId,
    });
  });

  socket.on("typing_end", (data) => {
    socket.to(data.conversationId).emit("user_stopped_typing", {
      userId: socket.userId,
      conversationId: data.conversationId,
    });
  });

  // Handle message read receipts
  socket.on("mark_read", (data) => {
    socket.to(data.conversationId).emit("message_read", {
      userId: socket.userId,
      messageId: data.messageId,
      conversationId: data.conversationId,
    });
  });

  // Join a conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    // Notify others in the conversation
    socket.to(conversationId).emit("user_joined", {
      userId: socket.userId,
      conversationId,
    });
  });

  // Leave a conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(conversationId);
    // Notify others in the conversation
    socket.to(conversationId).emit("user_left", {
      userId: socket.userId,
      conversationId,
    });
  });

  // Handle new message with notifications
  socket.on("send_message", async (messageData) => {
    try {
      // Broadcast the message to all users in the conversation
      io.to(messageData.conversationId).emit("receive_message", messageData);

      // Send push notifications to offline users in the conversation
      const offlineUsers = messageData.participants.filter(
        (userId) => !io.sockets.adapter.rooms.get(userId)
      );

      if (offlineUsers.length > 0) {
        // Emit notification event for offline users
        offlineUsers.forEach((userId) => {
          io.to(userId).emit("new_message_notification", {
            senderId: socket.userId,
            conversationId: messageData.conversationId,
            message: messageData.content.substring(0, 100), // Preview of message
            timestamp: new Date(),
          });
        });
      }
    } catch (error) {
      console.error("Error handling new message:", error);
      socket.emit("error", {
        message: "Failed to process message",
      });
    }
  });

  // Handle application status updates with notifications
  socket.on("update_application_status", (data) => {
    try {
      io.to(data.candidateId).emit("application_status_updated", data);

      // Send notification for status change
      io.to(data.candidateId).emit("notification", {
        type: "application_update",
        title: "Application Status Updated",
        message: `Your application status has been updated to: ${data.status}`,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      socket.emit("error", {
        message: "Failed to update application status",
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    if (socket.userId) {
      // Notify others that user went offline
      socket.broadcast.emit("user_status_change", {
        userId: socket.userId,
        status: "offline",
      });
    }
    console.log("User disconnected:", socket.id);
  });
});

// Middleware
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL
        : [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            process.env.FRONTEND_URL,
          ],
    credentials: true,
  })
);
app.use(express.json());

// Define routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/notifications", notificationRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  app.use(express.static(join(__dirname, "../frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(join(__dirname, "../frontend/dist/index.html"));
  });
}

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
