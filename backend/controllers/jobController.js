import asyncHandler from 'express-async-handler';
import Job from '../models/jobModel.js';
import Resume from '../models/resumeModel.js';
import matchingAlgorithm from '../utils/matchingAlgorithm.js';

// @desc    Create a new job posting
// @route   POST /api/jobs
// @access  Private/Admin
const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requiredSkills,
    location,
    salary,
    jobType,
    experienceLevel,
    numberOfOpenings,
    numberOfCandidatesToShortlist,
    jobRequirements,
    chatbotQuestions,
  } = req.body;

  // Validate required fields
  if (!title || !description || !requiredSkills || !location || !jobType || !experienceLevel) {
    res.status(400);
    throw new Error('Please fill all required fields');
  }

  // Create job
  const job = await Job.create({
    admin: req.user._id,
    title,
    description,
    requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : requiredSkills.split(',').map(skill => skill.trim()),
    location,
    salary: salary || 'Not specified',
    jobType,
    experienceLevel,
    numberOfOpenings: numberOfOpenings || 1,
    numberOfCandidatesToShortlist: numberOfCandidatesToShortlist || 5,
    jobRequirements: Array.isArray(jobRequirements) ? jobRequirements : (jobRequirements ? jobRequirements.split(',').map(req => req.trim()) : []),
    chatbotQuestions: chatbotQuestions || [],
    status: 'Open',
  });

  if (job) {
    res.status(201).json(job);
  } else {
    res.status(400);
    throw new Error('Invalid job data');
  }
});

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
  // Get query parameters for filtering
  const { search, location, jobType, experienceLevel } = req.query;
  
  // Build filter object
  const filter = {};
  
  // Only show open jobs
  filter.status = 'Open';
  
  // Add search filter (title or description)
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  
  // Add location filter
  if (location) {
    filter.location = { $regex: location, $options: 'i' };
  }
  
  // Add job type filter
  if (jobType) {
    filter.jobType = jobType;
  }
  
  // Add experience level filter
  if (experienceLevel) {
    filter.experienceLevel = experienceLevel;
  }
  
  // Get jobs with pagination
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('admin', 'name companyName companyLogo');
  
  // Get total count for pagination
  const count = await Job.countDocuments(filter);
  
  res.json({
    jobs,
    page,
    pages: Math.ceil(count / limit),
    total: count,
  });
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('admin', 'name companyName companyLogo companyDescription');

  if (job) {
    res.json(job);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the user is the admin who created the job
  if (job.admin.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this job');
  }

  // Update job fields
  job.title = req.body.title || job.title;
  job.description = req.body.description || job.description;
  job.requiredSkills = req.body.requiredSkills || job.requiredSkills;
  job.location = req.body.location || job.location;
  job.salary = req.body.salary || job.salary;
  job.jobType = req.body.jobType || job.jobType;
  job.experienceLevel = req.body.experienceLevel || job.experienceLevel;
  job.numberOfOpenings = req.body.numberOfOpenings || job.numberOfOpenings;
  job.numberOfCandidatesToShortlist = req.body.numberOfCandidatesToShortlist || job.numberOfCandidatesToShortlist;
  job.jobRequirements = req.body.jobRequirements || job.jobRequirements;
  job.status = req.body.status || job.status;
  job.chatbotQuestions = req.body.chatbotQuestions || job.chatbotQuestions;

  const updatedJob = await job.save();
  
  res.json(updatedJob);
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the user is the admin who created the job
  if (job.admin.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to delete this job');
  }

  await job.remove();
  
  res.json({ message: 'Job removed' });
});

// @desc    Apply for a job with resume
// @route   POST /api/jobs/:id/apply
// @access  Public
const applyForJob = asyncHandler(async (req, res) => {
  const { resumeId } = req.body;

  if (!resumeId) {
    res.status(400);
    throw new Error('Please provide a resume ID');
  }

  const job = await Job.findById(req.params.id);
  const resume = await Resume.findById(resumeId);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }

  // Check if already applied
  const alreadyApplied = job.applications.find(
    (app) => app.resume.toString() === resumeId
  );

  if (alreadyApplied) {
    res.status(400);
    throw new Error('Already applied to this job');
  }

  // Calculate match score
  const matchResult = await matchingAlgorithm.calculateMatchScore(resume, job);

  // Add application to job
  job.applications.push({
    resume: resumeId,
    matchScore: matchResult.matchScore,
    skillMatchScore: matchResult.skillMatchScore,
    experienceMatchScore: matchResult.experienceMatchScore,
    educationMatchScore: matchResult.educationMatchScore,
    llmReasoning: matchResult.llmReasoning,
    status: 'Applied',
  });

  await job.save();

  res.status(201).json({
    message: 'Application submitted successfully',
    matchScore: matchResult.matchScore,
  });
});

// @desc    Get all applications for a job
// @route   GET /api/jobs/:id/applications
// @access  Private/Admin
const getJobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the user is the admin who created the job
  if (job.admin.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to view these applications');
  }

  // Populate resume data for each application
  await job.populate({
    path: 'applications.resume',
    select: 'name email skills education experience projects chatbotResponses preferredLanguage',
  });

  res.json(job.applications);
});

// @desc    Update application status
// @route   PUT /api/jobs/:id/applications/:applicationId
// @access  Private/Admin
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!status) {
    res.status(400);
    throw new Error('Please provide a status');
  }

  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the user is the admin who created the job
  if (job.admin.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to update this application');
  }

  // Find the application by ID
  const application = job.applications.id(req.params.applicationId);

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Update status
  application.status = status;

  await job.save();

  res.json({
    message: 'Application status updated',
    application,
  });
});

export {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  applyForJob,
  getJobApplications,
  updateApplicationStatus,
};