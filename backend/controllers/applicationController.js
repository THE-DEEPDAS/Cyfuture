import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import {
  analyzeCandidate,
  generateChatResponse,
  detectLanguage,
} from "../utils/llm.js";
import { calculateMatchScore } from "../services/enhancedJobMatching.js";
import { notifyUser } from "../utils/notification.js";
import asyncHandler from "express-async-handler";

// @desc    Submit job application
// @route   POST /api/applications/:jobId
// @access  Private/Candidate
export const applyToJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { resumeId, coverLetter, screeningResponses = [] } = req.body;

  // Validate required fields
  if (!resumeId) {
    res.status(400);
    throw new Error("Please select a resume");
  }

  // Find job and check if it exists and is active
  const job = await Job.findById(jobId).populate("company");

  // Check screening questions
  if (job.screeningQuestions?.length > 0) {
    if (
      !screeningResponses ||
      screeningResponses.length !== job.screeningQuestions.length
    ) {
      res.status(400);
      throw new Error("Please answer all screening questions");
    }
  }
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (!job.isActive) {
    res.status(400);
    throw new Error("This job is no longer accepting applications");
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    candidate: req.user._id,
  });

  if (existingApplication) {
    res.status(400);
    throw new Error("You have already applied for this job");
  }

  // Find the resume
  const resume = await Resume.findOne({
    _id: resumeId,
    user: req.user._id,
  });

  if (!resume) {
    res.status(404);
    throw new Error("Resume not found");
  }

  // Get match score and analysis
  const matchScore = await calculateMatchScore(job, resume.parsedData);
  let llmAnalysis = null;

  if (job.llmEvaluation?.enabled) {
    llmAnalysis = await analyzeCandidate(
      resume.parsedData,
      job,
      screeningResponses
    );
  }

  // Create application
  const application = await Application.create({
    job: jobId,
    candidate: req.user._id,
    resume: resumeId,
    coverLetter,
    screeningResponses,
    status: "pending",
    matchScore,
    llmAnalysis,
  });

  // Send application notification
  const sendApplicationNotification = async (application, job, analysis) => {
    // Notify company about new application
    await notifyUser(
      job.company._id,
      "APPLICATION_RECEIVED",
      "New Job Application",
      `${application.candidate.name} has applied for ${job.title}`,
      {
        jobId: job._id,
        applicationId: application._id,
        candidateId: application.candidate._id,
        score: analysis?.score || null,
      }
    );

    // Notify candidate about application status
    if (!analysis?.isRecommended) {
      await notifyUser(
        application.candidate._id,
        "APPLICATION_FEEDBACK",
        "Application Status Update",
        `Thank you for applying to ${
          job.title
        }. Based on our initial assessment, we regret to inform you that your profile may not be the best match for this role at this time. ${
          analysis.analysis.feedback || ""
        }`,
        {
          jobId: job._id,
          applicationId: application._id,
          status: "rejected",
          feedback: analysis.analysis.improvements || [],
        }
      );
    } else {
      await notifyUser(
        application.candidate._id,
        "APPLICATION_RECEIVED",
        "Application Received",
        `Your application for ${job.title} has been received and is under review.`,
        {
          jobId: job._id,
          applicationId: application._id,
          status: "reviewing",
        }
      );
    }
  };

  await sendApplicationNotification(application, job, llmAnalysis);

  res.status(201).json(application);
});

// @desc    Get all applications for a candidate
// @route   GET /api/applications/candidate
// @access  Private/Candidate
export const getCandidateApplications = asyncHandler(async (req, res) => {
  try {
    // Make sure we have a valid user ID
    if (!req.user?._id) {
      res.status(401);
      throw new Error("User not authenticated");
    }

    const applications = await Application.find({ candidate: req.user._id })
      .populate({
        path: "job",
        select: "title company location type status",
        populate: {
          path: "company",
          select: "companyName",
        },
      })
      .populate("resume", "fileUrl parsedData")
      .select(
        "status matchScore createdAt messages screeningResponses coverLetter llmAnalysis"
      )
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JS objects for better performance

    // If no applications found, return empty array instead of error
    if (!applications) {
      return res.json([]);
    }

    // Filter out any applications with missing job or company info
    const validApplications = applications.filter(
      (app) => app && app.job && app.job.company && app.job.title
    );

    res.json(validApplications);
  } catch (error) {
    console.error("Error in getCandidateApplications:", error);
    res.status(500);
    throw new Error(error.message || "Failed to fetch applications");
  }
});

// @desc    Get all applications for a company
// @route   GET /api/applications/company
// @access  Private/Company
export const getCompanyApplications = asyncHandler(async (req, res) => {
  // Find all jobs posted by this company
  const jobs = await Job.find({ company: req.user._id }).select("_id");
  const jobIds = jobs.map((job) => job._id);

  // Get query parameters
  const { jobId, minMatchScore, status, sortBy = "matchScore" } = req.query;

  // Build query
  const query = { job: jobId ? jobId : { $in: jobIds } };

  // Add match score filter if provided
  if (minMatchScore && !isNaN(minMatchScore)) {
    query.matchScore = { $gte: parseInt(minMatchScore) };
  }

  // Add status filter if provided
  if (status && status !== "all") {
    query.status = status;
  }

  // Determine sort options
  let sortOptions = {};
  switch (sortBy) {
    case "recent":
      sortOptions = { createdAt: -1 };
      break;
    case "oldest":
      sortOptions = { createdAt: 1 };
      break;
    case "matchScore":
    default:
      sortOptions = { matchScore: -1 };
  }

  // Find all applications for these jobs
  const applications = await Application.find(query)
    .populate({
      path: "job",
      select: "title location type shortlistCount",
    })
    .populate({
      path: "candidate",
      select: "name email",
    })
    .populate({
      path: "resume",
      select: "parsedData",
    })
    .sort(sortOptions);

  res.json(applications);
});

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
export const getApplicationById = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate({
      path: "job",
      select: "title company description requirements location type",
      populate: {
        path: "company",
        select: "companyName",
      },
    })
    .populate({
      path: "candidate",
      select: "name email",
    })
    .populate({
      path: "resume",
      select: "fileUrl parsedData",
    });

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check if user has permission to view this application
  const isCompany = req.user.role === "company";
  const isCandidate = req.user.role === "candidate";

  if (
    (isCandidate &&
      application.candidate._id.toString() !== req.user._id.toString()) ||
    (isCompany &&
      application.job.company._id.toString() !== req.user._id.toString())
  ) {
    res.status(403);
    throw new Error("Not authorized to access this application");
  }

  res.json(application);
});

// @desc    Get application statistics for a job
// @route   GET /api/applications/stats/:jobId
// @access  Private/Company
export const getJobApplicationStats = asyncHandler(async (req, res) => {
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
    throw new Error("Not authorized to view stats for this job");
  }

  // Get applications for this job
  const applications = await Application.find({ job: jobId });

  // Calculate stats
  const stats = {
    total: applications.length,
    byStatus: {
      pending: applications.filter((app) => app.status === "pending").length,
      reviewing: applications.filter((app) => app.status === "reviewing")
        .length,
      shortlisted: applications.filter((app) => app.status === "shortlisted")
        .length,
      rejected: applications.filter((app) => app.status === "rejected").length,
      hired: applications.filter((app) => app.status === "hired").length,
    },
    byMatchScore: {
      excellent: applications.filter((app) => app.matchScore >= 90).length,
      good: applications.filter(
        (app) => app.matchScore >= 75 && app.matchScore < 90
      ).length,
      average: applications.filter(
        (app) => app.matchScore >= 60 && app.matchScore < 75
      ).length,
      belowAverage: applications.filter((app) => app.matchScore < 60).length,
    },
  };

  // Calculate average match score
  if (applications.length > 0) {
    const totalScore = applications.reduce(
      (sum, app) => sum + (app.matchScore || 0),
      0
    );
    stats.averageMatchScore = Math.round(totalScore / applications.length);
  } else {
    stats.averageMatchScore = 0;
  }

  res.json(stats);
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Company
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = [
    "pending",
    "reviewing",
    "shortlisted",
    "rejected",
    "hired",
  ];

  if (!status || !validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Please provide a valid status");
  }

  const application = await Application.findById(req.params.id).populate({
    path: "job",
    select: "company",
  });

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check if the user is the company that posted the job
  if (application.job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to update this application");
  }

  // Update the status
  application.status = status;

  // Add a system message about the status change
  application.messages.push({
    sender: "system",
    content: `Application status updated to: ${status}`,
    language: "en",
    createdAt: new Date(),
  });

  const updatedApplication = await application.save();

  // Create status-specific notification messages
  let notificationType = "status"; // default type
  let notificationTitle = "Application Status Updated";
  let notificationMessage = `Your application for ${application.job.title} has been updated to: ${status}`;

  // For shortlisted status, we'll use "application" type since shortlisted is a valid application status
  if (status === "shortlisted") {
    notificationType = "application";
    notificationTitle = "Congratulations! You've Been Shortlisted";
    notificationMessage = `Great news! Your application for ${application.job.title} has been shortlisted. The employer may contact you soon for the next steps.`;
  } else if (status === "rejected") {
    notificationType = "APPLICATION_REJECTED";
    notificationTitle = "Application Status Update";
    notificationMessage = `We regret to inform you that your application for ${application.job.title} has not been selected to move forward.`;
  } else if (status === "accepted") {
    notificationType = "APPLICATION_ACCEPTED";
    notificationTitle = "Congratulations! Application Accepted";
    notificationMessage = `Great news! Your application for ${application.job.title} has been accepted.`;
  } else if (status === "hired") {
    notificationTitle = "Congratulations! You've Been Hired";
    notificationMessage = `Excellent news! Your application for ${application.job.title} has been successful. The employer will contact you with further details.`;
  }

  await notifyUser(
    io,
    application.candidate.toString(),
    notificationType,
    notificationTitle,
    notificationMessage,
    {
      applicationId: application._id.toString(),
      jobId: application.job._id.toString(),
      status,
    }
  );

  res.json(updatedApplication);
});

// @desc    Send message in application thread
// @route   POST /api/applications/:id/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, language = "en" } = req.body;

  const application = await Application.findById(id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check if user has permission to send messages
  const isCompany = req.user.role === "company";
  const isCandidate = req.user.role === "candidate";

  if (
    (isCandidate &&
      application.candidate.toString() !== req.user._id.toString()) ||
    (isCompany && application.job.toString() !== req.user._id.toString())
  ) {
    res.status(403);
    throw new Error("Not authorized to send messages to this application");
  }

  // Get previous messages for context
  const previousMessages = application.messages
    .slice(-5)
    .map((m) => `${m.sender}: ${m.content}`)
    .join("\n");

  // Add new message
  application.messages.push({
    sender: req.user.role,
    content,
    language,
  });

  // Get recipient ID (if sender is company, recipient is candidate, and vice versa)
  const recipientId =
    req.user.role === "company"
      ? application.candidate.toString()
      : application.job.company.toString();

  // Create notification for the recipient
  const io = req.app.get("io");
  await notifyUser(
    io,
    recipientId,
    "message",
    "New Message",
    `You have a new message regarding the application for ${
      application.job?.title || "a job position"
    }`,
    {
      applicationId: application._id.toString(),
      jobId: application.job.toString(),
    }
  );

  // If sender is candidate, generate AI response
  if (req.user.role === "candidate") {
    try {
      const aiResponse = await generateChatResponse(
        previousMessages,
        content,
        language
      );

      application.messages.push({
        sender: "system",
        content: aiResponse,
        language,
      });
    } catch (error) {
      console.error("Error generating AI response:", error);
      // Don't fail if AI response generation fails
    }
  }

  await application.save();
  res.json(application.messages);
});

/**
 * @desc    Send a message to all applicants for a job
 * @route   POST /api/applications/job/:jobId/message
 * @access  Private/Company
 */
export const sendMessageToAllApplicants = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { content, minMatchScore } = req.body;

  if (!content) {
    res.status(400);
    throw new Error("Message content is required");
  }

  // Find the job
  const job = await Job.findById(jobId);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Check if the user is the company that posted the job
  if (job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to send messages for this job");
  }

  // Find all applications for this job, optionally filtered by match score
  const query = { job: jobId };
  if (minMatchScore && !isNaN(minMatchScore)) {
    query.matchScore = { $gte: parseInt(minMatchScore) };
  }

  const applications = await Application.find(query);

  // Add message to each application
  const io = req.app.get("io");
  const updatePromises = applications.map(async (application) => {
    // Add message to application messages
    application.messages.push({
      sender: "company",
      content,
      language: "en",
      createdAt: new Date(),
    });

    // Send notification to the candidate
    await notifyUser(
      io,
      application.candidate.toString(),
      "message",
      "New Message from Employer",
      `You have a new message regarding your application for ${job.title}`,
      {
        applicationId: application._id.toString(),
        jobId: jobId,
      }
    );

    return application.save();
  });

  await Promise.all(updatePromises);

  res.json({
    message: `Message sent to ${applications.length} applicants`,
    count: applications.length,
  });
});

// @desc    Toggle shortlist status for an application
// @route   PUT /api/applications/:id/shortlist
// @access  Private/Company
export const toggleShortlist = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("job")
    .populate("candidate");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Verify the company owns this job
  if (application.job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to modify this application");
  }

  application.shortlisted = !application.shortlisted;
  await application.save();

  // Send notification to candidate
  if (application.shortlisted) {
    await notifyUser(application.candidate._id, {
      title: "Application Shortlisted",
      message: `Your application for ${application.job.title} has been shortlisted!`,
      type: "application", // Using valid type for shortlist notifications
      link: `/applications/${application._id}`,
    });
  }

  res.json({ shortlisted: application.shortlisted });
});

// @desc    Get all applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private/Company
export const getJobApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  // Find job and verify ownership
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Verify company ownership
  if (job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to view these applications");
  }

  // Get applications with populated data
  const applications = await Application.find({ job: jobId })
    .populate({
      path: "candidate",
      select: "name email phone",
    })
    .populate({
      path: "resume",
      select: "fileUrl parsedData",
    })
    .sort("-createdAt");

  res.json({
    applications,
    total: applications.length,
  });
});

/**
 * @desc    Shortlist a candidate
 * @route   POST /api/applications/:id/shortlist
 * @access  Private/Company
 */
export const shortlistCandidate = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check if the job belongs to the company
  const job = await Job.findById(application.job);
  if (job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to shortlist candidates for this job");
  }

  application.isShortlisted = true;
  await application.save();

  // Send notification to candidate
  await createNotification({
    user: application.candidate,
    type: "application", // Using valid type for shortlist notifications
    title: "Application Shortlisted",
    message: `Your application for ${job.title} has been shortlisted!`,
    reference: {
      type: "Application",
      id: application._id,
    },
  });

  res.json({ message: "Candidate shortlisted successfully" });
});

/**
 * @desc    Remove candidate from shortlist
 * @route   DELETE /api/applications/:id/shortlist
 * @access  Private/Company
 */
export const removeFromShortlist = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check if the job belongs to the company
  const job = await Job.findById(application.job);
  if (job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to modify shortlist for this job");
  }

  application.isShortlisted = false;
  await application.save();

  res.json({ message: "Candidate removed from shortlist successfully" });
});

/**
 * @desc    Get LLM analysis for job applications
 * @route   GET /api/applications/job/:jobId/llm-analysis
 * @access  Private/Company
 */
export const getLLMAnalysis = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;
  const job = await Job.findById(jobId);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to view analysis for this job");
  }

  const applications = await Application.find({ job: jobId })
    .populate("candidate", "name")
    .populate("resume");

  const explanations = {};

  // Get LLM analysis for each application if not already present
  for (const application of applications) {
    if (!application.llmAnalysis?.explanation) {
      // This would be implemented in the LLM service
      const analysis = await analyzeCandidateWithLLM(application, job);

      application.llmAnalysis = {
        explanation: analysis.explanation,
        language: analysis.language,
        confidence: analysis.confidence,
      };
      await application.save();
    }

    explanations[application._id] = application.llmAnalysis.explanation;
  }

  res.json({ explanations });
});

/**
 * @desc    Get matching scores for job applications
 * @route   GET /api/applications/job/:jobId/matching-scores
 * @access  Private/Company
 */
export const getMatchingScores = asyncHandler(async (req, res) => {
  const jobId = req.params.jobId;
  const job = await Job.findById(jobId);

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to view scores for this job");
  }

  const applications = await Application.find({ job: jobId });
  const scores = {};

  for (const application of applications) {
    if (!application.matchingScores) {
      // Calculate scores if not already present
      const calculatedScores = await calculateMatchScore(
        job,
        application.resume.parsedData
      );
      application.matchingScores = calculatedScores;
      await application.save();
    }

    scores[application._id] = application.matchingScores;
  }

  res.json({ scores });
});

/**
 * @desc    Accept an application
 * @route   PUT /api/applications/:id/accept
 * @access  Private/Company
 */
export const acceptApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate({
    path: "job",
    select: "company title",
  });

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check if the user is the company that posted the job
  if (application.job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to accept this application");
  }

  // Update the status to accepted
  application.status = "accepted";

  // Add a system message about the status change
  application.messages.push({
    sender: "system",
    content: "Application has been accepted",
    language: "en",
    createdAt: new Date(),
  });

  const updatedApplication = await application.save();

  // Send notification to candidate
  await notifyUser(
    application.candidate.toString(),
    "APPLICATION_ACCEPTED",
    "Congratulations! Application Accepted",
    `Great news! Your application for ${application.job.title} has been accepted.`,
    {
      applicationId: application._id.toString(),
      jobId: application.job._id.toString(),
      status: "accepted",
    }
  );

  res.json(updatedApplication);
});

/**
 * @desc    Hire a candidate
 * @route   PUT /api/applications/:id/hire
 * @access  Private/Company
 */
export const hireCandidate = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate({
    path: "job",
    select: "company title",
  });

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check if the user is the company that posted the job
  if (application.job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to hire for this job");
  }

  // Update the status to hired
  application.status = "hired";

  // Add a system message about the status change
  application.messages.push({
    sender: "system",
    content: "Congratulations! You have been hired for this position.",
    language: "en",
    createdAt: new Date(),
  });

  const updatedApplication = await application.save();

  // Send notification to candidate
  await notifyUser(
    application.candidate.toString(),
    "status",
    "Congratulations! You've Been Hired",
    `Excellent news! Your application for ${application.job.title} has been successful. The employer will contact you with further details.`,
    {
      applicationId: application._id.toString(),
      jobId: application.job._id.toString(),
      status: "hired",
    }
  );

  res.json(updatedApplication);
});

/**
 * @desc    Reject an application
 * @route   PUT /api/applications/:id/reject
 * @access  Private/Company
 */
export const rejectApplication = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id).populate({
    path: "job",
    select: "company title",
  });

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check if the user is the company that posted the job
  if (application.job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to reject this application");
  }

  // Update the status to rejected
  application.status = "rejected";

  // Add a system message about the status change
  application.messages.push({
    sender: "system",
    content: "Application has been rejected",
    language: "en",
    createdAt: new Date(),
  });

  const updatedApplication = await application.save();

  // Send notification to candidate
  await notifyUser(
    application.candidate.toString(),
    "APPLICATION_REJECTED",
    "Application Status Update",
    `We regret to inform you that your application for ${application.job.title} has not been selected to move forward.`,
    {
      applicationId: application._id.toString(),
      jobId: application.job._id.toString(),
      status: "rejected",
    }
  );

  res.json(updatedApplication);
});
