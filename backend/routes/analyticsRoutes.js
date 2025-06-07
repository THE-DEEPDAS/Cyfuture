import express from "express";
import {
  getHiringFunnelMetrics,
  getJobAnalytics,
  getDashboardAnalytics,
} from "../controllers/analyticsController.js";
import { protect, companyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes (requires authentication)
router.use(protect);
router.use(companyOnly);

// Analytics dashboard routes
router.get("/dashboard", getDashboardAnalytics);
router.get("/hiring-funnel", getHiringFunnelMetrics);
router.get("/job/:jobId", getJobAnalytics);

export default router;
