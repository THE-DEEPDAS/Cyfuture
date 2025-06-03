import express from "express";
import {
  getHiringFunnelMetrics,
  getTimeToHireMetrics,
  getSourceAnalytics,
  getMatchScoreAnalytics,
  getLanguageDistribution,
  getDashboardAnalytics,
} from "../controllers/analyticsController.js";
import { protect, companyOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// Protected routes (requires authentication)
router.use(protect);

// Analytics dashboard routes
router.get("/hiring-funnel", companyOnly, getHiringFunnelMetrics);
router.get("/time-to-hire", companyOnly, getTimeToHireMetrics);
router.get("/sources", companyOnly, getSourceAnalytics);
router.get("/match-scores", companyOnly, getMatchScoreAnalytics);
router.get("/languages", companyOnly, getLanguageDistribution);
router.get("/dashboard", companyOnly, getDashboardAnalytics);

export default router;
