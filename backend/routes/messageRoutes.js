import express from 'express';
import {
  sendMessageToApplicants,
  getJobMessages,
  getResumeMessages,
} from '../controllers/messageController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/job/:jobId')
  .post(protect, admin, sendMessageToApplicants)
  .get(protect, admin, getJobMessages);

router.route('/resume/:resumeId')
  .get(getResumeMessages);

export default router;