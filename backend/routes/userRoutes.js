import express from 'express';
import { getCurrentUser, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/users/me
router.get('/me', protect, getCurrentUser);

// @route   PUT /api/users/me
router.put('/me', protect, updateUserProfile);

export default router;