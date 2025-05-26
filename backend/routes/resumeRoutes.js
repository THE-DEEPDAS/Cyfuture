import express from 'express';
import {
  uploadResume,
  addChatbotResponse,
  getResumeById,
  getUserResumes,
} from '../controllers/resumeController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinaryConfig.js';

const router = express.Router();

router.route('/')
  .post(upload.single('resume'), uploadResume)
  .get(protect, getUserResumes);

router.route('/:id')
  .get(getResumeById);

router.route('/:id/chatbot-response')
  .post(addChatbotResponse);

export default router;