import asyncHandler from 'express-async-handler';
import Application from '../models/applicationModel.js';
import Job from '../models/jobModel.js';
import Resume from '../models/resumeModel.js';
import User from '../models/userModel.js';
import { calculateMatchScore } from '../utils/matchEngine.js';

// @desc    Create a new application
// @route   POST /api/applications
// @access  Private
const createApplication = asyncHandler(async (req, res) => {
  const { jobId, coverLetter } = req.body;

  // Check if job exists
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if job is open
  if (job.status !== 'Open') {
    res.status(400);
    throw new Error('This job is no longer accepting applications');
  }

  // Check if user has a resume
  const user = await User.findById(req.user._id);
  if (!user.resumeId) {
    res.status(400);
    throw new Error('Please upload a resume before applying');
  }

  // Check if user has already applied to this job
  const existingApplication = await Application.findOne({
    job: jobId,
    candidate: req.user._id,
  });

  if (existingApplication) {
    res.status(400);
    throw new Error('You have already applied to this job');
  }

  // Get resume
  const resume = await Resume.findById(user.resumeId);
  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }

  // Calculate match score
  const matchResult = await calculateMatchScore(job, resume);

  // Create application
  const application = await Application.create({
    job: jobId,
    candidate: req.user._id,
    resume: resume._id,
    coverLetter,
    matchScore: matchResult.matchScore,
    matchDetails: matchResult.matchDetails,
  });

  if (application) {
    // Increment job application count
    job.applicationCount += 1;
    await job.save();

    res.status(201).json(application);
  } else {
    res.status(400);
    throw new Error('Invalid application data');
  }
});

// @desc    Get all applications for a job
// @route   GET /api/applications/job/:id
// @access  Private/Employer
const getJobApplications = asyncHandler(async (req, res) => {
  const jobId = req.params.id;

  // Check if job exists and user is authorized
  const job = await Job.findById(jobId);
  
  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if user is the employer who posted the job or an admin
  if (
    job.employer.toString() !== req.user._id.toString() &&
    req.user.role !== 'admin'
  ) {
    res.status(401);
    throw new Error('Not authorized to view these applications');
  }

  const applications = await Application.find({ job: jobId })
    .populate('candidate', 'name email profileImage')
    .populate('resume')
    .sort({ matchScore: -1 });

  res.json(applications);
});

// @desc    Get user's applications
// @route   GET /api/applications/me
// @access  Private
const getUserApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate({
      path: 'job',
      select: 'title company location type status',
      populate: {
        path: 'employer',
        select: 'name company',
      },
    })
    .sort({ createdAt: -1 });

  res.json(applications);
});

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate('candidate', 'name email profileImage')
    .populate('resume')
    .populate({
      path: 'job',
      populate: {
        path: 'employer',
        select: 'name company',
      },
    });

  if (application) {
    // Check if user is the candidate, the employer, or an admin
    if (
      application.candidate._id.toString() === req.user._id.toString() ||
      application.job.employer._id.toString() === req.user._id.toString() ||
      req.user.role === 'admin'
    ) {
      res.json(application);
    } else {
      res.status(401);
      throw new Error('Not authorized to view this application');
    }
  } else {
    res.status(404);
    throw new Error('Application not found');
  }
});

// @desc    Update application status
// @route   PUT /api/applications/:id
// @access  Private/Employer
const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status, notes, interviewDate } = req.body;
  
  const application = await Application.findById(req.params.id)
    .populate({
      path: 'job',
      select: 'employer',
    });

  if (application) {
    // Check if user is the employer who posted the job or an admin
    if (
      application.job.employer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(401);
      throw new Error('Not authorized to update this application');
    }

    // Update status
    if (status) {
      application.status = status;
    }

    // Add note if provided
    if (notes) {
      application.notes.push({
        content: notes,
        author: req.user._id,
      });
    }

    // Update interview date if provided
    if (interviewDate) {
      application.interviewDate = interviewDate;
    }

    const updatedApplication = await application.save();
    res.json(updatedApplication);
  } else {
    res.status(404);
    throw new Error('Application not found');
  }
});

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
const deleteApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (application) {
    // Check if user is the candidate who applied or an admin
    if (
      application.candidate.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(401);
      throw new Error('Not authorized to delete this application');
    }

    await application.deleteOne();
    
    // Decrement job application count
    const job = await Job.findById(application.job);
    if (job) {
      job.applicationCount = Math.max(0, job.applicationCount - 1);
      await job.save();
    }

    res.json({ message: 'Application removed' });
  } else {
    res.status(404);
    throw new Error('Application not found');
  }
});

export {
  createApplication,
  getJobApplications,
  getUserApplications,
  getApplicationById,
  updateApplicationStatus,
  deleteApplication,
};