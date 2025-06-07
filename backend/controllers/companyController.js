import asyncHandler from "express-async-handler";
import Job from "../models/jobModel.js";
import User from "../models/userModel.js";
import Application from "../models/applicationModel.js";
import mongoose from "mongoose";

// @desc    Get company dashboard stats
// @route   GET /api/company/dashboard
// @access  Private/Company
const getCompanyDashboardStats = asyncHandler(async (req, res) => {
  // Get total active and closed jobs count
  const jobsStats = await Job.aggregate([
    {
      $match: {
        company: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $group: {
        _id: null,
        totalJobs: { $sum: 1 },
        openJobs: {
          $sum: {
            $cond: [{ $eq: ["$isActive", true] }, 1, 0],
          },
        },
      },
    },
  ]);

  const jobStats = jobsStats[0] || { totalJobs: 0, openJobs: 0 };
  const closedJobs = jobStats.totalJobs - jobStats.openJobs;

  // Get all jobs IDs for this company
  const jobs = await Job.find({ company: req.user._id }).select("_id");
  const jobIds = jobs.map((job) => job._id);

  // Default response if no jobs
  if (!jobIds.length) {
    return res.json({
      totalJobs: 0,
      openJobs: 0,
      closedJobs: 0,
      totalApplications: 0,
      applicationsByStatus: {
        pending: 0,
        reviewing: 0,
        shortlisted: 0,
        accepted: 0,
        rejected: 0,
        hired: 0,
      },
      averageMatchScore: 0,
    });
  }

  // Get application statistics using aggregation
  const applicationStats = await Application.aggregate([
    {
      $match: {
        job: { $in: jobIds },
      },
    },
    {
      $group: {
        _id: null,
        totalApplications: { $sum: 1 },
        applicationsByStatus: {
          $push: "$status",
        },
        validMatchScores: {
          $push: {
            $cond: [
              {
                $and: [
                  { $ne: ["$matchScore", null] },
                  { $ne: ["$matchScore", undefined] },
                  { $gte: ["$matchScore", 0] },
                  { $lte: ["$matchScore", 100] },
                ],
              },
              "$matchScore",
              null,
            ],
          },
        },
      },
    },
  ]);

  // Process application statistics
  const stats = applicationStats[0] || {
    totalApplications: 0,
    applicationsByStatus: [],
    validMatchScores: [],
  };

  // Count applications by status
  const applicationsByStatus = {
    pending: 0,
    reviewing: 0,
    shortlisted: 0,
    accepted: 0,
    rejected: 0,
    hired: 0,
  };

  stats.applicationsByStatus.forEach((status) => {
    if (applicationsByStatus.hasOwnProperty(status)) {
      applicationsByStatus[status]++;
    }
  });

  // Calculate average match score
  const validScores = stats.validMatchScores.filter((score) => score !== null);
  const averageMatchScore =
    validScores.length > 0
      ? parseFloat(
          (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(
            2
          )
        )
      : 0;

  // Return complete stats
  res.json({
    totalJobs: jobStats.totalJobs,
    openJobs: jobStats.openJobs,
    closedJobs,
    totalApplications: stats.totalApplications,
    applicationsByStatus,
    averageMatchScore,
  });
});

// @desc    Get all jobs for company
// @route   GET /api/company/jobs
// @access  Private/Company
const getCompanyJobs = asyncHandler(async (req, res) => {
  try {
    // Get jobs with essential fields
    const jobs = await Job.find({ company: req.user._id })
      .select("_id title location jobType status createdAt")
      .sort({ createdAt: -1 })
      .lean();

    if (!jobs.length) {
      return res.json([]);
    }

    // Get all applications for these jobs in one query
    const jobIds = jobs.map((job) => job._id);
    const applications = await Application.aggregate([
      { $match: { job: { $in: jobIds } } },
      {
        $group: {
          _id: "$job",
          applicationCount: { $sum: 1 },
          shortlistedCount: {
            $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] },
          },
        },
      },
    ]); // Create a map of application counts by job ID
    const applicationCountMap = new Map(
      applications.map((app) => [
        app._id.toString(),
        {
          applicationCount: app.applicationCount,
          shortlistedCount: app.shortlistedCount,
        },
      ])
    );

    // Combine job data with application counts
    const jobsWithCounts = jobs.map((job) => {
      const counts = applicationCountMap.get(job._id.toString()) || {
        applicationCount: 0,
        shortlistedCount: 0,
      };
      return {
        ...job,
        applicationCount: counts.applicationCount,
        shortlistedCount: counts.shortlistedCount,
      };
    });

    res.json(jobsWithCounts);
  } catch (error) {
    console.error("Error in getCompanyJobs:", error);
    res.status(500);
    throw new Error("Failed to fetch company jobs: " + error.message);
  }
});

// @desc    Update company profile
// @route   PUT /api/company/profile
// @access  Private/Company
const updateCompanyProfile = asyncHandler(async (req, res) => {
  const { companyName, companyLogo, companyDescription } = req.body;

  if (!companyName) {
    res.status(400);
    throw new Error("Company name is required");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  user.companyName = companyName;
  user.companyLogo = companyLogo || user.companyLogo;
  user.companyDescription = companyDescription || user.companyDescription;

  const updatedUser = await user.save();

  res.json({
    message: "Company profile updated",
    companyName: updatedUser.companyName,
    companyLogo: updatedUser.companyLogo,
    companyDescription: updatedUser.companyDescription,
  });
});

export { getCompanyDashboardStats, getCompanyJobs, updateCompanyProfile };
