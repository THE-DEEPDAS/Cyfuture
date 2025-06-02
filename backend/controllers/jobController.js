import Job from "../models/Job.js";
import Application from "../models/Application.js";
import Resume from "../models/Resume.js";
import { analyzeCandidate } from "../utils/llm.js";
import asyncHandler from "express-async-handler";
import { createNotification } from "../utils/notification.js";
import { getShortlistedCandidates } from "../utils/jobMatching.js";

/**
 * @desc    Create a new job posting
 * @route   POST /api/jobs
 * @access  Private/Company
 */
export const createJob = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    requirements,
    location,
    type,
    experience,
    skills,
    salary,
    shortlistCount,
    expiresAt,
  } = req.body;

  const job = await Job.create({
    company: req.user.id,
    title,
    description,
    requirements: Array.isArray(requirements)
      ? requirements
      : requirements.split("\n").filter((item) => item.trim() !== ""),
    location,
    type,
    experience,
    skills: Array.isArray(skills)
      ? skills
      : skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill !== ""),
    salary,
    shortlistCount: shortlistCount || 10,
    expiresAt,
  });

  res.status(201).json(job);
});

/**
 * @desc    Get all jobs
 * @route   GET /api/jobs
 * @access  Public
 */
export const getJobs = asyncHandler(async (req, res) => {
  const {
    search,
    location,
    type,
    experience,
    skills,
    page = 1,
    limit = 10,
  } = req.query;

  // Build filter object
  const filter = {};

  // Add search filter (title and description)
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (location) {
    filter.location = { $regex: location, $options: "i" };
  }

  if (type) {
    filter.type = type;
  }

  if (experience) {
    filter.experience = experience;
  }

  if (skills) {
    filter.skills = { $in: skills.split(",").map((skill) => skill.trim()) };
  }

  const total = await Job.countDocuments(filter);
  const jobs = await Job.find(filter)
    .populate("company", "name logo")
    .limit(limit)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 });

  res.json({
    jobs,
    page,
    pages: Math.ceil(total / limit),
    total,
  });
});

/**
 * @desc    Get job by ID
 * @route   GET /api/jobs/:id
 * @access  Public
 */
export const getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id).populate(
    "company",
    "name logo"
  );

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  res.json(job);
});

/**
 * @desc    Update job
 * @route   PUT /api/jobs/:id
 * @access  Private/Company
 */
export const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Verify company ownership
  if (job.company.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to update this job");
  }

  const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json(updatedJob);
});

/**
 * @desc    Delete job
 * @route   DELETE /api/jobs/:id
 * @access  Private/Company
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Verify company ownership
  if (job.company.toString() !== req.user.id) {
    res.status(403);
    throw new Error("Not authorized to delete this job");
  }

  await job.remove();
  res.json({ message: "Job removed" });
});

/**
 * @desc    Get company's jobs
 * @route   GET /api/jobs/company/me
 * @access  Private/Company
 */
export const getCompanyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ company: req.user.id }).sort({ createdAt: -1 });
  res.json(jobs);
});

/**
 * @desc    Match candidates for a job
 * @route   POST /api/jobs/:id/match
 * @access  Private/Company
 */
export const matchCandidates = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Verify company ownership
  if (job.company.toString() !== req.user.id.toString()) {
    res.status(403);
    throw new Error("Not authorized to match candidates for this job");
  }

  // Get all applications for this job
  const applications = await Application.find({ job: job._id })
    .populate({
      path: "resume",
      select: "parsedData",
    })
    .populate({
      path: "candidate",
      select: "name email preferredLanguage",
    });

  // Get shortlisted candidates using our matching logic
  const shortlisted = await getShortlistedCandidates(
    applications,
    job,
    job.matchingCriteria?.threshold || 70,
    job.matchingCriteria?.shortlistLimit || 10
  );

  // Update application statuses and save matches
  for (const application of shortlisted) {
    await Application.findByIdAndUpdate(application._id, {
      isShortlisted: true,
      matchingScores: application.scores,
      llmAnalysis: application.llmAnalysis,
    });

    // Send notification to shortlisted candidates
    await createNotification({
      user: application.candidate._id,
      type: "SHORTLISTED",
      title: `Shortlisted for ${job.title}`,
      message: `Congratulations! You've been shortlisted for the ${job.title} position.`,
      reference: {
        type: "Application",
        id: application._id,
      },
    });
  }

  res.json({
    shortlisted: shortlisted.map((app) => ({
      applicationId: app._id,
      candidateName: app.candidate.name,
      scores: app.scores,
      analysis: app.llmAnalysis,
    })),
  });
});
