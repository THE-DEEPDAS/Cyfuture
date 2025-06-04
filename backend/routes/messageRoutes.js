import express from "express";
import { protect, company } from "../middleware/authMiddleware.js";
import { messageLimiter } from "../utils/rateLimiter.js";
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getOrCreateConversation,
  searchMessages,
  getOnlineStatus,
  sendMessageToApplicants,
  getJobMessages,
  getResumeMessages,
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

router
  .route("/job/:jobId")
  .post(company, sendMessageToApplicants)
  .get(company, getJobMessages);

router.route("/resume/:resumeId").get(getResumeMessages);

export default router;
