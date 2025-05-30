import express from 'express';
import {
  getUserChat,
  sendMessage,
  getAdminChat,
  sendAdminMessage,
} from '../controllers/chatController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getUserChat);
router.route('/message').post(protect, sendMessage);
router.route('/admin/:userId').get(protect, admin, getAdminChat);
router.route('/admin/:userId').post(protect, admin, sendAdminMessage);

export default router;