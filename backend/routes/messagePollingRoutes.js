import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { messageLimiter } from "../utils/rateLimiter.js";
import {
  getMessageUpdates,
  sendMessage,
  markMessageRead,
  updateTypingStatus,
} from "../controllers/messagePollingController.js";

const router = express.Router();

router.use(protect);

// Polling endpoint for message updates
router.get("/updates", getMessageUpdates);

// Send a new message
router.post("/", messageLimiter, sendMessage);

// Mark message as read
router.put("/:messageId/read", markMessageRead);

// Update typing status
router.post("/typing", updateTypingStatus);

export default router;
