import asyncHandler from 'express-async-handler';
import Job from '../models/jobModel.js';
import Application from '../models/applicationModel.js';
import User from '../models/userModel.js';

// @desc    Get employer dashboard analytics
// @route   GET /api/analytics/employer
// @access  Private/Employer
const getEmployerAnalytics = asyncHandler(async (req, res) => {
  // Get total jobs posted by employer
  const totalJobs = await Job.countDocuments({ employer: req.user._id });
  
  // Get active jobs
  const activeJobs = await Job.countDocuments({ 
    employer: req.user._id,
    status: 'Open'
  });
  
  // Get total applications received
  const jobs = await Job.find({ employer: req.user._id });
  const jobIds = jobs.map(job => job._id);
  
  const totalApplications = await Application.countDocuments({
    job: { $in: jobIds }
  });
  
  // Get applications by status
  const applicationsByStatus = await Application.aggregate([
    { $match: { job: { $in: jobIds } } },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Get top performing jobs (most applications)
  const topJobs = await Job.aggregate([
    { $match: { employer: req.user._id } },
    { $sort: { applicationCount: -1 } },
    { $limit: 5 },
    { $project: { _id: 1, title: 1, company: 1, applicationCount: 1, viewCount: 1 } }
  ]);
  
  // Get recent applications
  const recentApplications = await Application.find({ job: { $in: jobIds } })
    .populate('candidate', 'name email')
    .populate('job', 'title company')
    .sort({ createdAt: -1 })
    .limit(5);
  
  res.json({
    totalJobs,
    activeJobs,
    totalApplications,
    applicationsByStatus: applicationsByStatus.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    topJobs,
    recentApplications
  });
});

// @desc    Get admin dashboard analytics
// @route   GET /api/analytics/admin
// @access  Private/Admin
const getAdminAnalytics = asyncHandler(async (req, res) => {
  // Get total users by role
  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ]);
  
  // Get total jobs
  const totalJobs = await Job.countDocuments();
  
  // Get jobs by status
  const jobsByStatus = await Job.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Get total applications
  const totalApplications = await Application.countDocuments();
  
  // Get applications by status
  const applicationsByStatus = await Application.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);
  
  // Get recent users
  const recentUsers = await User.find()
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(5);
  
  // Get recent jobs
  const recentJobs = await Job.find()
    .populate('employer', 'name company')
    .sort({ createdAt: -1 })
    .limit(5);
  
  // Get top employers (by job count)
  const topEmployers = await Job.aggregate([
    { $group: { _id: '$employer', jobCount: { $sum: 1 } } },
    { $sort: { jobCount: -1 } },
    { $limit: 5 }
  ]);
  
  // Populate employer details
  const populatedEmployers = await User.populate(topEmployers, {
    path: '_id',
    select: 'name company'
  });
  
  res.json({
    usersByRole: usersByRole.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    totalJobs,
    jobsByStatus: jobsByStatus.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    totalApplications,
    applicationsByStatus: applicationsByStatus.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {}),
    recentUsers,
    recentJobs,
    topEmployers: populatedEmployers.map(item => ({
      employer: item._id,
      jobCount: item.jobCount
    }))
  });
});

export { getEmployerAnalytics, getAdminAnalytics };