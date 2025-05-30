import express from 'express';
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getTopJobs,
} from '../controllers/jobController.js';
import { protect, employer } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').post(protect, employer, createJob).get(getJobs);
router.route('/employer').get(protect, employer, getEmployerJobs);
router.route('/top').get(getTopJobs);
router
  .route('/:id')
  .get(getJobById)
  .put(protect, employer, updateJob)
  .delete(protect, employer, deleteJob);

export default router;