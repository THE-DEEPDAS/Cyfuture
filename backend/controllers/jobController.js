import asyncHandler from 'express-async-handler';
import Job from '../models/jobModel.js';

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private/Employer
const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    company,
    location,
    description,
    requirements,
    skills,
    type,
    experience,
    salary,
    applicationDeadline,
    status,
  } = req.body;

  const job = await Job.create({
    employer: req.user._id,
    title,
    company,
    location,
    description,
    requirements,
    skills: Array.isArray(skills) ? skills : skills.split(',').map(skill => skill.trim()),
    type,
    experience,
    salary,
    applicationDeadline,
    status: status || 'Open',
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
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  
  // Build query based on filters
  const query = {};
  
  // Filter by status (default to Open)
  query.status = req.query.status || 'Open';
  
  // Filter by job type
  if (req.query.type) {
    query.type = req.query.type;
  }
  
  // Filter by location
  if (req.query.location) {
    query.location = { $regex: req.query.location, $options: 'i' };
  }
  
  // Filter by company
  if (req.query.company) {
    query.company = { $regex: req.query.company, $options: 'i' };
  }
  
  // Search by keyword (searches title, description, and skills)
  if (req.query.keyword) {
    query.$or = [
      { title: { $regex: req.query.keyword, $options: 'i' } },
      { description: { $regex: req.query.keyword, $options: 'i' } },
      { skills: { $in: [new RegExp(req.query.keyword, 'i')] } },
    ];
  }
  
  const count = await Job.countDocuments(query);
  const jobs = await Job.find(query)
    .populate('employer', 'name company')
    .sort({ createdAt: -1 })
    .limit(pageSize)
    .skip(pageSize * (page - 1));

  res.json({
    jobs,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    'employer',
    'name company'
  );

  if (job) {
    // Increment view count
    job.viewCount += 1;
    await job.save();
    
    res.json(job);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private/Employer
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    // Check if user is the employer who created the job or an admin
    if (
      job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(401);
      throw new Error('Not authorized to update this job');
    }

    job.title = req.body.title || job.title;
    job.company = req.body.company || job.company;
    job.location = req.body.location || job.location;
    job.description = req.body.description || job.description;
    job.requirements = req.body.requirements || job.requirements;
    
    if (req.body.skills) {
      job.skills = Array.isArray(req.body.skills) 
        ? req.body.skills 
        : req.body.skills.split(',').map(skill => skill.trim());
    }
    
    job.type = req.body.type || job.type;
    job.experience = req.body.experience || job.experience;
    
    if (req.body.salary) {
      job.salary = {
        ...job.salary,
        ...req.body.salary,
      };
    }
    
    if (req.body.applicationDeadline) {
      job.applicationDeadline = req.body.applicationDeadline;
    }
    
    job.status = req.body.status || job.status;

    const updatedJob = await job.save();
    res.json(updatedJob);
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private/Employer
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (job) {
    // Check if user is the employer who created the job or an admin
    if (
      job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(401);
      throw new Error('Not authorized to delete this job');
    }

    await job.deleteOne();
    res.json({ message: 'Job removed' });
  } else {
    res.status(404);
    throw new Error('Job not found');
  }
});

// @desc    Get jobs posted by employer
// @route   GET /api/jobs/employer
// @access  Private/Employer
const getEmployerJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ employer: req.user._id }).sort({
    createdAt: -1,
  });
  
  res.json(jobs);
});

// @desc    Get top jobs (most viewed or applied to)
// @route   GET /api/jobs/top
// @access  Public
const getTopJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ status: 'Open' })
    .sort({ viewCount: -1, applicationCount: -1 })
    .limit(5)
    .populate('employer', 'name company');
  
  res.json(jobs);
});

export {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
  getEmployerJobs,
  getTopJobs,
};