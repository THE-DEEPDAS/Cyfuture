import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyForJob,
  getJobApplications,
  updateApplicationStatus,
} from '../controllers/jobController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, admin, createJob)
  .get(getJobs);

router.route('/:id')
  .get(getJobById)
  .put(protect, admin, updateJob)
  .delete(protect, admin, deleteJob);

router.route('/:id/apply')
  .post(applyForJob);

router.route('/:id/applications')
  .get(protect, admin, getJobApplications);

router.route('/:id/applications/:applicationId')
  .put(protect, admin, updateApplicationStatus);

export default router;