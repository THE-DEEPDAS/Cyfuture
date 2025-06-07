import asyncHandler from "express-async-handler";
import analyticsService from "../services/AnalyticsService.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import mongoose from "mongoose";

// @desc    Get comprehensive dashboard analytics data
// @route   GET /api/analytics/dashboard
// @access  Private/Company
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = "month" } = req.query;

  const [
    hiringFunnel,
    timeToHire,
    sourceAnalytics,
    matchScores,
    languageDistribution,
  ] = await Promise.all([
    analyticsService.calculateHiringFunnelMetrics(req.user._id, timeRange),
    analyticsService.calculateTimeToHireMetrics(req.user._id, timeRange),
    analyticsService.calculateSourceAnalytics(req.user._id, timeRange),
    analyticsService.calculateMatchScores(req.user._id, timeRange),
    analyticsService.calculateLanguageDistribution(req.user._id, timeRange),
  ]);

  // Save analytics data for historical tracking
  await analyticsService.saveAnalytics({
    company: req.user._id,
    timeRange,
    hiringFunnel,
    timeToHire,
    sourceAnalytics,
    matchScores,
    languageDistribution,
  });

  res.json({
    hiringFunnel,
    timeToHire,
    sourceAnalytics,
    matchScores,
    languageDistribution,
  });
});

// @desc    Get application insights for a specific job
// @route   GET /api/analytics/job/:jobId
// @access  Private/Company
export const getJobAnalytics = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { timeRange = "month" } = req.query;

  const jobAnalytics = await analyticsService.calculateJobMetrics(
    jobId,
    req.user._id,
    timeRange
  );

  if (!jobAnalytics) {
    res.status(404);
    throw new Error("Job analytics not found");
  }

  res.json(jobAnalytics);
});

// @desc    Get company's hiring funnel metrics
// @route   GET /api/analytics/hiring-funnel
// @access  Private/Company
export const getHiringFunnelMetrics = asyncHandler(async (req, res) => {
  const { timeRange = "month" } = req.query;
  const metrics = await analyticsService.calculateHiringFunnelMetrics(
    req.user._id,
    timeRange
  );
  res.json(metrics);
});

// @desc    Get time to hire metrics
// @route   GET /api/analytics/time-to-hire
// @access  Private/Company
export const getTimeToHireMetrics = asyncHandler(async (req, res) => {
  const { timeRange = "month" } = req.query;
  const metrics = await analyticsService.calculateTimeToHireMetrics(
    req.user._id,
    timeRange
  );
  res.json(metrics);
});

// @desc    Get source analytics
// @route   GET /api/analytics/sources
// @access  Private/Company
export const getSourceAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = "month" } = req.query;
  const metrics = await analyticsService.calculateSourceAnalytics(
    req.user._id,
    timeRange
  );
  res.json(metrics);
});

// @desc    Get match score analytics
// @route   GET /api/analytics/match-scores
// @access  Private/Company
export const getMatchScoreAnalytics = asyncHandler(async (req, res) => {
  const { timeRange = "month" } = req.query;
  const metrics = await analyticsService.calculateMatchScores(
    req.user._id,
    timeRange
  );
  res.json(metrics);
});

// @desc    Get language distribution
// @route   GET /api/analytics/languages
// @access  Private/Company
export const getLanguageDistribution = asyncHandler(async (req, res) => {
  const { timeRange = "month" } = req.query;
  const distribution = await analyticsService.calculateLanguageDistribution(
    req.user._id,
    timeRange
  );
  res.json(distribution);
});

// @desc    Get dashboard metrics
// @route   GET /api/analytics/dashboard-metrics/:companyId
// @access  Private/Company
export const getDashboardMetrics = asyncHandler(async (req, res) => {
  try {
    const { companyId } = req.params;

    // Count total and active jobs
    const totalJobs = await Job.countDocuments({
      company: new mongoose.Types.ObjectId(companyId),
    });

    const activeJobs = await Job.countDocuments({
      company: new mongoose.Types.ObjectId(companyId),
      isActive: true,
    });

    // Get application status counts
    const applicationStats = await Application.aggregate([
      {
        $match: {
          company: new mongoose.Types.ObjectId(companyId),
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format application counts by status
    const statusCounts = {};
    let totalApplications = 0;

    applicationStats.forEach((stat) => {
      statusCounts[stat._id || "unknown"] = stat.count;
      totalApplications += stat.count;
    });

    res.status(200).json({
      success: true,
      data: {
        totalJobs,
        activeJobs,
        totalApplications,
        applicationsByStatus: statusCounts,
      },
    });
  } catch (error) {
    console.error("Dashboard metrics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard metrics",
      error: error.message,
    });
  }
});
