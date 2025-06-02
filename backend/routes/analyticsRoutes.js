import express from "express";
import {
  getCompanyAnalytics,
  getJobAnalytics,
} from "../controllers/analyticsController.js";
import { protect, companyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes (requires authentication)
router.use(protect);

// Get company dashboard analytics
router.get("/company", companyOnly, getCompanyAnalytics);

// Get job-specific analytics
router.get("/job/:jobId", companyOnly, getJobAnalytics);

export default router;
