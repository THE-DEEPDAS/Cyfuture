import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { messageLimiter } from "../utils/rateLimiter.js";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getOrCreateConversation,
  searchMessages,
  getOnlineStatus,
} from "../controllers/messageController.js";

const router = express.Router();

router.use(protect);

router
  .route("/conversations")
  .get(getConversations)
  .post(getOrCreateConversation);

router
  .route("/conversations/:conversationId")
  .get(getMessages)
  .post(messageLimiter, sendMessage);

router.route("/conversations/:conversationId/read").put(markAsRead);

router.route("/conversations/:conversationId/search").get(searchMessages);

router.route("/status/:userId").get(getOnlineStatus);

export default router;
