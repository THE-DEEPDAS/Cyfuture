import asyncHandler from "express-async-handler";
import analyticsService from "../services/AnalyticsService.js";

// @desc    Get company hiring funnel metrics
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

// @desc    Get comprehensive analytics dashboard data
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
    matchScores: {
      average: matchScores.average,
      distribution: matchScores.distribution,
    },
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

/**
 * @desc    Get application insights for a specific job
 * @route   GET /api/analytics/job/:jobId
 * @access  Private/Company
 */
export const getJobAnalytics = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  // Find the job
  const job = await Job.findById(jobId);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Check if the user is the company that posted the job
  if (job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to view analytics for this job");
  }

  // Get all applications for this job
  const applications = await Application.find({ job: jobId });

  // Basic stats
  const stats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    reviewing: applications.filter((app) => app.status === "reviewing").length,
    shortlisted: applications.filter((app) => app.status === "shortlisted")
      .length,
    rejected: applications.filter((app) => app.status === "rejected").length,
    hired: applications.filter((app) => app.status === "hired").length,
  };

  // Calculate average match score
  let avgMatchScore = 0;
  const scoredApplications = applications.filter((app) => app.matchScore);

  if (scoredApplications.length > 0) {
    const totalScore = scoredApplications.reduce(
      (sum, app) => sum + app.matchScore,
      0
    );
    avgMatchScore = Math.round(totalScore / scoredApplications.length);
  }

  // Get top skills from high-scoring candidates
  const topCandidates = applications
    .filter((app) => app.matchScore >= 80)
    .slice(0, 5);

  // Return the analytics data
  res.json({
    jobDetails: {
      title: job.title,
      location: job.location,
      type: job.type,
      isActive: job.isActive,
      expiresAt: job.expiresAt,
    },
    stats,
    avgMatchScore,
    topCandidatesCount: topCandidates.length,
  });
});
