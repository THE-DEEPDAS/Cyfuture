import express from 'express';
import {
  getAdminDashboardStats,
  getAdminJobs,
  updateCompanyProfile,
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', protect, admin, getAdminDashboardStats);
router.get('/jobs', protect, admin, getAdminJobs);
router.put('/company-profile', protect, admin, updateCompanyProfile);

export default router;