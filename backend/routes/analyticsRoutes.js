import express from 'express';
import {
  getEmployerAnalytics,
  getAdminAnalytics,
} from '../controllers/analyticsController.js';
import { protect, employer, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/employer').get(protect, employer, getEmployerAnalytics);
router.route('/admin').get(protect, admin, getAdminAnalytics);

export default router;