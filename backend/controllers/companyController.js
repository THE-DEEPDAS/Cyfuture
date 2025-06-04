import asyncHandler from "express-async-handler";
import Job from "../models/jobModel.js";
import User from "../models/userModel.js";

// @desc    Get company dashboard stats
// @route   GET /api/company/dashboard
// @access  Private/Company
const getCompanyDashboardStats = asyncHandler(async (req, res) => {
  // Get all jobs for this company
  const jobs = await Job.find({ admin: req.user._id });

  // Calculate statistics
  const totalJobs = jobs.length;
  const openJobs = jobs.filter((job) => job.status === "Open").length;
  const closedJobs = jobs.filter((job) => job.status === "Closed").length;

  // Get total applications across all jobs
  const totalApplications = jobs.reduce(
    (acc, job) => acc + job.applications.length,
    0
  );

  // Get applications by status
  const applicationsByStatus = {
    Applied: 0,
    Shortlisted: 0,
    Rejected: 0,
    Interviewing: 0,
    Hired: 0,
  };

  jobs.forEach((job) => {
    job.applications.forEach((app) => {
      if (applicationsByStatus[app.status] !== undefined) {
        applicationsByStatus[app.status]++;
      }
    });
  });

  // Calculate average match score
  let totalMatchScore = 0;
  let matchScoreCount = 0;

  jobs.forEach((job) => {
    job.applications.forEach((app) => {
      if (app.matchScore) {
        totalMatchScore += app.matchScore;
        matchScoreCount++;
      }
    });
  });

  const averageMatchScore =
    matchScoreCount > 0 ? (totalMatchScore / matchScoreCount).toFixed(2) : 0;

  // Return stats
  res.json({
    totalJobs,
    openJobs,
    closedJobs,
    totalApplications,
    applicationsByStatus,
    averageMatchScore,
  });
});

// @desc    Get all jobs for company
// @route   GET /api/company/jobs
// @access  Private/Company
const getCompanyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ admin: req.user._id }).sort({ createdAt: -1 });

  // Add application count to each job
  const jobsWithCounts = jobs.map((job) => {
    const applicationCount = job.applications.length;
    const shortlistedCount = job.applications.filter(
      (app) => app.status === "Shortlisted"
    ).length;

    return {
      _id: job._id,
      title: job.title,
      location: job.location,
      jobType: job.jobType,
      status: job.status,
      createdAt: job.createdAt,
      applicationCount,
      shortlistedCount,
    };
  });

  res.json(jobsWithCounts);
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
