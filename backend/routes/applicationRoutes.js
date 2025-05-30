import express from 'express';
import {
  createApplication,
  getJobApplications,
  getUserApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
} from '../controllers/applicationController.js';
import { protect, employer } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, createApplication);
router.route('/me').get(protect, getUserApplications);
router.route('/job/:id').get(protect, employer, getJobApplications);
router
  .route('/:id')
  .get(protect, getApplicationById)
  .put(protect, employer, updateApplicationStatus)
  .delete(protect, deleteApplication);

export default router;