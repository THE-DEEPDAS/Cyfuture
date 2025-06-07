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
    requiredSkills,
    salary,
    shortlistCount,
    expiresAt,
    screeningQuestions,
    preferredSkills,
    llmEvaluation,
  } = req.body; // Comprehensive validation
  if (
    !title ||
    !description ||
    !location ||
    !type ||
    !experience ||
    !skills ||
    !requirements
  ) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  if (salary) {
    if (!salary.min || !salary.max || salary.min > salary.max) {
      res.status(400);
      throw new Error("Invalid salary range");
    }
  }

  if (expiresAt && new Date(expiresAt) < new Date()) {
    res.status(400);
    throw new Error("Job expiry date must be in the future");
  }

  // Validate skills
  const skillsArray = Array.isArray(skills)
    ? skills
    : skills.split(",").map((skill) => skill.trim());

  // If requiredSkills is not provided, use skills as requiredSkills
  const requiredSkillsArray = Array.isArray(requiredSkills)
    ? requiredSkills
    : requiredSkills
    ? requiredSkills.split(",").map((skill) => skill.trim())
    : skillsArray;

  // Validate requirements
  const requirementsArray = Array.isArray(requirements)
    ? requirements
    : requirements.split("\n").filter((req) => req.trim());

  if (!requirementsArray.length) {
    res.status(400);
    throw new Error("At least one job requirement is required");
  }

  if (!skillsArray.length) {
    res.status(400);
    throw new Error("At least one skill is required");
  }

  // Create job with company reference
  const job = await Job.create({
    company: req.user._id,
    title,
    description,
    location,
    type,
    experience,
    salary,
    requirements: requirementsArray,
    skills: skillsArray,
    requiredSkills: requiredSkillsArray,
    shortlistCount,
    expiresAt,
    screeningQuestions,
    preferredSkills,
    llmEvaluation,
  });

  if (job) {
    res.status(201).json(job);
  } else {
    res.status(400);
    throw new Error("Invalid job data");
  }
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
  const filter = { isActive: true };

  // Add search filter (title and description)
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "company.companyName": { $regex: search, $options: "i" } },
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
    .populate({
      path: "company",
      select: "name email companyName companyLogo companyDescription industry",
    })
    .select(
      "title description location type experience salary skills requirements isActive createdAt"
    )
    .limit(parseInt(limit))
    .skip((parseInt(page) - 1) * parseInt(limit))
    .sort({ createdAt: -1 });

  res.json({
    jobs,
    page: parseInt(page),
    pages: Math.ceil(total / limit),
    total,
  });

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
    "name companyName companyLogo companyDescription"
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

  // Check if user is the job's company
  if (job.company.toString() !== req.user._id.toString()) {
    res.status(401);
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
 * * @route   DELETE /api/jobs/:id
 * @access  Private/Company
 */
export const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Check if user is the job's company
  if (job.company.toString() !== req.user._id.toString()) {
    res.status(401);
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
/*
export const getCompanyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ company: req.user._id }).sort({
    createdAt: -1,
  });
  res.json(jobs);
});
*/

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

/**
 * @desc    Apply for a job
 * @route   POST /api/jobs/:id/apply
 * @access  Private/Candidate
 */
export const applyForJob = asyncHandler(async (req, res) => {
  const { resumeId, coverLetter, questions } = req.body;

  // Validate resume
  if (!resumeId) {
    res.status(400);
    throw new Error("Please select a resume");
  }

  // Get job and check if it exists
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Check if job is still active
  if (!job.isActive) {
    res.status(400);
    throw new Error("This job is no longer accepting applications");
  }

  // Check if user has already applied
  const existingApplication = await Application.findOne({
    job: job._id,
    candidate: req.user._id,
  });

  if (existingApplication) {
    res.status(400);
    throw new Error("You have already applied for this job");
  }

  // Get the resume
  const resume = await Resume.findOne({
    _id: resumeId,
    user: req.user._id,
  });

  if (!resume) {
    res.status(404);
    throw new Error("Resume not found");
  }

  // Create application
  const application = await Application.create({
    job: job._id,
    company: job.company,
    candidate: req.user._id,
    resume: resume._id,
    coverLetter,
    screeningAnswers: questions,
  });

  if (application) {
    // Notify company about new application
    await createNotification({
      user: job.company,
      type: "NEW_APPLICATION",
      title: "New Job Application",
      message: `${req.user.name} has applied for ${job.title}`,
      reference: {
        type: "Application",
        id: application._id,
      },
    });

    // If LLM evaluation is enabled, analyze the candidate
    if (job.llmEvaluation) {
      const analysis = await analyzeCandidate(resume.parsedData, job);
      application.llmAnalysis = analysis;
      await application.save();
    }

    res.status(201).json(application);
  } else {
    res.status(400);
    throw new Error("Error submitting application");
  }
});

/**
 * @desc    Get applications for a specific job
 * @route   GET /api/jobs/:id/applications
 * @access  Private/Company
 */
export const getJobApplications = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Check if user is the job's company
  if (job.company.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error("Not authorized to view these applications");
  }

  const applications = await Application.find({ job: job._id })
    .populate({
      path: "candidate",
      select: "name email preferredLanguage",
    })
    .populate({
      path: "resume",
      select: "parsedData title",
    })
    .sort({ createdAt: -1 });

  res.json(applications);
});

/**
 * @desc    Get jobs that match a resume
 * @route   GET /api/jobs/matching/:resumeId
 * @access  Private
 */
export const getMatchingJobsByResumeId = asyncHandler(async (req, res) => {
  try {
    const { resumeId } = req.params;

    // Verify the resume belongs to the current user
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Get active jobs
    const jobs = await Job.find({ status: "active" });

    // Use job matching utility to find matching jobs
    const matchingJobs = await getShortlistedCandidates(
      jobs,
      resume,
      70, // Threshold
      10 // Limit
    );

    res.json(matchingJobs);
  } catch (error) {
    console.error("Error finding matching jobs:", error);
    res.status(500).json({ message: "Error finding matching jobs" });
  }
});

/**
 * @desc    Get all matching jobs for the current user
 * @route   GET /api/jobs/matching
 * @access  Private
 */
import { calculateMatchScore } from "../services/enhancedJobMatching.js";

export const getMatchingJobs = asyncHandler(async (req, res) => {
  try {
    // Get active jobs
    const jobs = await Job.find({ isActive: true }).populate(
      "company",
      "name companyName"
    );

    // Get user's resume
    const resume = await Resume.findOne({
      user: req.user._id,
      isDefault: true,
    });

    if (!resume) {
      return res.status(404).json({ message: "No default resume found" });
    } // Process jobs in smaller batches to avoid overwhelming the LLM API
    const BATCH_SIZE = 3;
    const matchedJobs = [];

    for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
      const batch = jobs.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (job) => {
          const matchResult = await calculateMatchScore(job, resume.parsedData);
          return {
            jobId: job._id,
            score: matchResult.score,
            details: matchResult.details,
            explanation: matchResult.explanation,
          };
        })
      );
      matchedJobs.push(...batchResults);

      // Add a small delay between batches if not the last batch
      if (i + BATCH_SIZE < jobs.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    res.json(matchedJobs);
  } catch (error) {
    console.error("Error finding matching jobs:", error);
    res.status(500).json({ message: "Error finding matching jobs" });
  }
});

/**
 * @desc    Get all jobs with pagination and filters
 * @route   GET /api/jobs
 * @access  Public
 */
export const getAllJobs = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, location, type, industry } = req.query;

  // Build filter object
  const filter = { isActive: true };

  // Add search filter
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { "company.companyName": { $regex: search, $options: "i" } },
    ];
  }

  // Add location filter
  if (location) {
    filter.location = { $regex: location, $options: "i" };
  }

  // Add type filter
  if (type) {
    filter.type = type;
  }

  // Add industry filter
  if (industry) {
    filter["company.industry"] = industry;
  }

  // Calculate pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get total count for pagination
  const total = await Job.countDocuments(filter);

  // Fetch jobs with populated company data
  const jobs = await Job.find(filter)
    .populate({
      path: "company",
      select: "name email companyName companyLogo companyDescription industry",
    })
    .select(
      "title description location type experience salary skills requirements isActive createdAt"
    )
    .sort("-createdAt")
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    jobs,
    page: parseInt(page),
    pages: Math.ceil(total / parseInt(limit)),
    total,
  });
});

/**
 * @desc    Analyze screening responses
 * @route   POST /api/jobs/:id/analyze-responses
 * @access  Private/Company
 */
export const analyzeResponses = asyncHandler(async (req, res) => {
  const { responses, resumeId } = req.body;
  const job = await Job.findById(req.params.id);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (!job.screeningQuestions || job.screeningQuestions.length === 0) {
    return res.json({
      isRecommended: true,
      analysis: "No screening questions required for this position.",
      score: 100,
    });
  }

  // Get candidate resume
  const resume = await Resume.findById(resumeId);
  if (!resume) {
    res.status(404);
    throw new Error("Resume not found");
  }

  // Use LLM to analyze responses and resume against job requirements
  const analysis = await analyzeCandidate(resume.parsedData, job, responses);

  // Calculate recommendation
  const isRecommended = analysis.score >= 70;
  let feedback = "";

  if (isRecommended) {
    feedback =
      "Based on your responses and resume, you appear to be a strong fit for this role.";
  } else {
    feedback =
      "While we appreciate your interest, there may be some gaps between your profile and the job requirements.";
  }

  // Include specific feedback points
  const strengthPoints = analysis.strengths.slice(0, 3);
  const improvementPoints = analysis.weaknesses.slice(0, 3);

  res.json({
    isRecommended,
    analysis: {
      feedback,
      score: analysis.score,
      strengths: strengthPoints,
      improvements: improvementPoints,
      recommendation: analysis.recommendation,
    },
  });
});

/**
 * @desc    Get company's jobs
 * @route   GET /api/jobs/company/me
 * @access  Private/Company
 */
export const getCompanyJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ company: req.user._id }).sort({
    createdAt: -1,
  });

  // Enhance jobs with applicant counts
  const jobsWithApplicantCounts = await Promise.all(
    jobs.map(async (job) => {
      const applicantCount = await Application.countDocuments({ job: job._id });
      return {
        ...job.toObject(),
        applicants: applicantCount, // Add the dynamic applicant count
      };
    })
  );

  res.json(jobsWithApplicantCounts);
});
