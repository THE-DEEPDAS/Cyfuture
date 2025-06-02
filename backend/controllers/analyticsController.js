import Application from "../models/Application.js";
import Job from "../models/Job.js";
import asyncHandler from "express-async-handler";

/**
 * @desc    Get company dashboard analytics
 * @route   GET /api/analytics/company
 * @access  Private/Company
 */
export const getCompanyAnalytics = asyncHandler(async (req, res) => {
  // Only company users can access this endpoint
  if (req.user.role !== "company") {
    res.status(403);
    throw new Error("Not authorized to access company analytics");
  }

  // Find all jobs posted by this company
  const jobs = await Job.find({ company: req.user._id });
  const jobIds = jobs.map((job) => job._id);

  // Get base statistics
  const activeJobs = jobs.filter(
    (job) => job.isActive && new Date(job.expiresAt) > new Date()
  ).length;
  const totalJobs = jobs.length;

  // Find all applications for these jobs
  const applications = await Application.find({ job: { $in: jobIds } });

  // Application counts by status
  const applicationStats = {
    total: applications.length,
    pending: applications.filter((app) => app.status === "pending").length,
    reviewing: applications.filter((app) => app.status === "reviewing").length,
    shortlisted: applications.filter((app) => app.status === "shortlisted")
      .length,
    rejected: applications.filter((app) => app.status === "rejected").length,
    hired: applications.filter((app) => app.status === "hired").length,
  };

  // Calculate time-to-hire (for hired applications)
  const hiredApplications = applications.filter(
    (app) => app.status === "hired"
  );
  let avgTimeToHire = 0;

  if (hiredApplications.length > 0) {
    const totalDays = hiredApplications.reduce((sum, app) => {
      const hireDate = new Date(app.updatedAt);
      const applyDate = new Date(app.createdAt);
      const days = Math.round((hireDate - applyDate) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    avgTimeToHire = Math.round(totalDays / hiredApplications.length);
  }

  // Get application count by job
  const applicationsByJob = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: "$job", count: { $sum: 1 } } },
  ]);

  // Create a map of job ID to job title
  const jobIdToTitleMap = {};
  jobs.forEach((job) => {
    jobIdToTitleMap[job._id] = job.title;
  });

  // Format the applications by job data with job titles
  const jobApplicationData = applicationsByJob.map((item) => ({
    jobId: item._id,
    jobTitle: jobIdToTitleMap[item._id] || "Unknown Job",
    applicationCount: item.count,
  }));

  // Match score distribution
  const matchScoreDistribution = {
    excellent: applications.filter((app) => app.matchScore >= 90).length,
    good: applications.filter(
      (app) => app.matchScore >= 75 && app.matchScore < 90
    ).length,
    average: applications.filter(
      (app) => app.matchScore >= 60 && app.matchScore < 75
    ).length,
    poor: applications.filter(
      (app) => app.matchScore < 60 && app.matchScore > 0
    ).length,
    unscored: applications.filter((app) => !app.matchScore).length,
  };

  // Application trends (by week for the last 10 weeks)
  const tenWeeksAgo = new Date();
  tenWeeksAgo.setDate(tenWeeksAgo.getDate() - 70); // 10 weeks ago

  const recentApplications = applications.filter(
    (app) => new Date(app.createdAt) >= tenWeeksAgo
  );

  // Group applications by week
  const applicationTrends = [];
  for (let i = 0; i < 10; i++) {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - i * 7 - 7);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    weekEnd.setHours(0, 0, 0, 0);

    const weekCount = recentApplications.filter(
      (app) =>
        new Date(app.createdAt) >= weekStart &&
        new Date(app.createdAt) < weekEnd
    ).length;

    applicationTrends.unshift({
      week: `Week ${10 - i}`,
      count: weekCount,
    });
  }

  // Return the analytics data
  res.json({
    jobStats: {
      total: totalJobs,
      active: activeJobs,
      inactive: totalJobs - activeJobs,
    },
    applicationStats,
    applicationsByJob: jobApplicationData,
    matchScoreDistribution,
    applicationTrends,
    avgTimeToHire,
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
