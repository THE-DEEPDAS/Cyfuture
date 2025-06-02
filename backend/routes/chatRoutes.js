import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getChatResponse,
  translateContent,
  detectContentLanguage,
} from "../controllers/chatController.js";

const router = express.Router();

// @route   POST /api/chat
router.post("/", protect, getChatResponse);

// @route   POST /api/chat/translate
router.post("/translate", protect, translateContent);

// @route   POST /api/chat/detect-language
router.post("/detect-language", protect, detectContentLanguage);

export default router;
