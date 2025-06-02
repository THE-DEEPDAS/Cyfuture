import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import http from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

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

// Initialize Socket.io
const io = new Server(server, {
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
});

// Make io instance available to the Express app
app.set("io", io);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Authenticate user and join personal room
  socket.on("authenticate", (token) => {
    try {
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      // Join user's personal room for direct notifications
      socket.join(userId);
      console.log(`User ${userId} authenticated and joined personal room`);

      // Store user ID in socket for later use
      socket.userId = userId;

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

  // Join a conversation room
  socket.on("join_conversation", (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${socket.id} joined conversation: ${conversationId}`);
  });

  // Leave a conversation room
  socket.on("leave_conversation", (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${socket.id} left conversation: ${conversationId}`);
  });

  // Handle new message
  socket.on("send_message", (messageData) => {
    // Broadcast the message to all users in the conversation
    io.to(messageData.conversationId).emit("receive_message", messageData);
  });

  // Handle application status updates
  socket.on("update_application_status", (data) => {
    io.to(data.candidateId).emit("application_status_updated", data);
  });

  // Mark notifications as read
  socket.on("mark_notifications_read", async (notificationIds) => {
    if (socket.userId) {
      try {
        // Update notifications in database (this would be implemented in a controller)
        socket.emit("notifications_marked_read", {
          success: true,
          notificationIds,
        });
      } catch (error) {
        console.error("Error marking notifications as read:", error);
        socket.emit("notifications_marked_read", {
          success: false,
          error: error.message,
        });
      }
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
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
