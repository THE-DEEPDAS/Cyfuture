import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "../controllers/messageController.js";

const router = express.Router();

// @route   GET /api/messages/conversations
router.get("/conversations", protect, getConversations);

// @route   POST /api/messages/conversations
router.post("/conversations", protect, getOrCreateConversation);

// @route   GET /api/messages/conversations/:id
router.get("/conversations/:id", protect, getMessages);

// @route   POST /api/messages
router.post("/", protect, sendMessage);

// @route   PUT /api/messages/read
router.put("/read", protect, markMessagesAsRead);

export default router;
