import express from "express";
import { getDashboardMetrics } from "../controllers/analyticsController.js";
import AnalyticsService from "../services/AnalyticsService.js";

const router = express.Router();

// Dashboard metrics endpoint
router.get("/dashboard/:companyId", getDashboardMetrics);

// Hiring funnel metrics
router.get("/hiring-funnel/:companyId", async (req, res) => {
  try {
    const data = await AnalyticsService.calculateHiringFunnelMetrics(
      req.params.companyId,
      req.query.range || "month"
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch hiring funnel metrics",
      error: error.message,
    });
  }
});

// Jobs overview metrics
router.get("/jobs/:companyId", async (req, res) => {
  try {
    const data = await AnalyticsService.calculateJobsStatusOverview(
      req.params.companyId,
      req.query.range || "all"
    );
    res.json(data);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch jobs overview",
      error: error.message,
    });
  }
});

export default router;
