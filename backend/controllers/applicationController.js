import Application from "../models/Application.js";
import Job from "../models/Job.js";
import Resume from "../models/Resume.js";
import {
  analyzeCandidate,
  generateChatResponse,
  detectLanguage,
} from "../utils/llm.js";
import { notifyUser } from "../utils/notification.js";
import asyncHandler from "express-async-handler";

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private/Candidate
export const applyToJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { resumeId, coverLetter, screeningResponses } = req.body;

  // Check if job exists and is active
  const job = await Job.findById(jobId);
  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  }

  if (!job.isActive || new Date(job.expiresAt) < new Date()) {
    res.status(400);
    throw new Error("This job posting is no longer active");
  }

  // Validate screening responses
  if (job.screeningQuestions?.length > 0) {
    // Check if all required questions are answered
    const missingRequired = job.screeningQuestions
      .filter((q) => q.required)
      .some(
        (q) =>
          !screeningResponses.find(
            (r) => r.question.toString() === q._id.toString()
          )
      );

    if (missingRequired) {
      res.status(400);
      throw new Error("Please answer all required screening questions");
    }
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    job: jobId,
    candidate: req.user._id,
  });

  if (existingApplication) {
    res.status(400);
    throw new Error("You have already applied to this job");
  }

  // Find the resume
  const resume = await Resume.findOne({
    _id: resumeId,
    user: req.user._id,
  }).select("+parsedData");

  if (!resume) {
    res.status(404);
    throw new Error("Resume not found");
  }

  // Create initial messages from responses if any
  const initialMessages = [];

  if (responses && Array.isArray(responses)) {
    for (const response of responses) {
      // Detect language of the user response
      const language = await detectLanguage(response.answer);

      initialMessages.push({
        sender: "candidate",
        content: response.answer,
        language,
        createdAt: new Date(),
      });
    }
  }

  // Create the application
  const application = await Application.create({
    job: jobId,
    candidate: req.user._id,
    resume: resumeId,
    coverLetter,
    status: "pending",
    screeningResponses: screeningResponses.map((response) => ({
      question: response.question,
      response: response.response,
    })),
    messages: initialMessages,
  });

  // Get job and candidate details for analysis
  const populatedApp = await Application.findById(application._id)
    .populate("job")
    .populate("resume");

  // Perform LLM analysis
  const analysis = await analyzeCandidate(
    populatedApp.job.description,
    populatedApp.resume.parsedData
  );

  // Update application with analysis results
  application.matchScore = analysis.matchScore;
  application.llmRationale = analysis.rationale;

  // Store additional analysis details if available
  if (analysis.factorScores) {
    application.analysisDetails = {
      factorScores: analysis.factorScores,
      strengths: analysis.strengths,
      gaps: analysis.gaps,
      summary: analysis.summary,
    };
  }

  // Add system message with application confirmation
  application.messages.push({
    sender: "system",
    content:
      "Your application has been submitted successfully. The employer will review your application and get back to you soon.",
    language: "en",
    createdAt: new Date(),
  });

  // Evaluate screening responses with LLM if enabled
  if (job.llmEvaluation?.enabled) {
    try {
      const [screeningEval, overallEval] = await Promise.all([
        evaluateScreeningResponses(
          application,
          job,
          req.user.preferredLanguage
        ),
        generateOverallEvaluation(application, job),
      ]);

      // Update application with evaluations
      application.screeningResponses = application.screeningResponses.map(
        (response) => {
          const evaluation = screeningEval.responses.find(
            (r) => r.questionId.toString() === response.question.toString()
          )?.evaluation;

          if (evaluation) {
            response.llmEvaluation = {
              score: evaluation.score,
              feedback: evaluation.feedback,
              confidence: evaluation.confidence,
            };
          }
          return response;
        }
      );

      application.overallEvaluation = {
        totalScore: overallEval.totalScore,
        breakdown: overallEval.breakdown,
        flags: overallEval.flags,
        recommendationStrength: overallEval.recommendationStrength,
      };
    } catch (error) {
      console.error("LLM Evaluation Error:", error);
      // Continue with application submission even if LLM evaluation fails
    }
  }

  // Save the application
  await application.save();

  // Notify the company
  await notifyUser(job.company, {
    type: "NEW_APPLICATION",
    title: `New application for ${job.title}`,
    message: `${req.user.name} has applied for the ${job.title} position`,
    reference: {
      type: "Application",
      id: application._id,
    },
  });

  res.status(201).json(application);
});

// @desc    Get all applications for a candidate
// @route   GET /api/applications/candidate
// @access  Private/Candidate
export const getCandidateApplications = asyncHandler(async (req, res) => {
  const applications = await Application.find({ candidate: req.user._id })
    .populate({
      path: "job",
      select: "title company location type",
      populate: {
        path: "company",
        select: "companyName",
      },
    })
    .select("status matchScore createdAt messages")
    .sort({ createdAt: -1 });

  res.json(applications);
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
  let notificationTitle = "Application Status Updated";
  let notificationMessage = `Your application for ${application.job.title} has been updated to: ${status}`;

  if (status === "shortlisted") {
    notificationTitle = "Congratulations! You've Been Shortlisted";
    notificationMessage = `Great news! Your application for ${application.job.title} has been shortlisted. The employer may contact you soon for the next steps.`;
  } else if (status === "rejected") {
    notificationTitle = "Application Status Update";
    notificationMessage = `We regret to inform you that your application for ${application.job.title} has not been selected to move forward.`;
  } else if (status === "hired") {
    notificationTitle = "Congratulations! You've Been Hired";
    notificationMessage = `Excellent news! Your application for ${application.job.title} has been successful. The employer will contact you with further details.`;
  }

  await notifyUser(
    io,
    application.candidate.toString(),
    "status",
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
      type: "application_shortlisted",
      link: `/applications/${application._id}`,
    });
  }

  res.json({ shortlisted: application.shortlisted });
});

// @desc    Get applications for a specific job with matching scores and LLM analysis
// @route   GET /api/applications/job/:jobId
// @access  Private/Company
export const getJobApplications = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  // Find job and verify ownership
  const job = await Job.findById(jobId);
  if (!job || job.company.toString() !== req.user._id.toString()) {
    res.status(404);
    throw new Error("Job not found");
  }

  // Get all applications for this job
  const applications = await Application.find({ job: jobId })
    .populate("candidate", "name email phone")
    .populate("resume")
    .sort("-createdAt");

  // Calculate matching scores and get LLM analysis for each application
  const matchingScores = {};
  const llmExplanations = {};
  const shortlistedCandidates = [];

  for (const application of applications) {
    // Calculate matching score based on skills, experience, etc.
    const score = await calculateMatchingScore(
      application.resume.parsedData,
      job.requirements
    );
    matchingScores[application._id] = score;

    // Get LLM analysis if not already stored
    if (!application.llmAnalysis) {
      const analysis = await analyzeCandidate({
        resume: application.resume.parsedData,
        jobDescription: job.description,
        requirements: job.requirements,
      });

      application.llmAnalysis = analysis;
      await application.save();
    }

    llmExplanations[application._id] = application.llmAnalysis;

    if (application.shortlisted) {
      shortlistedCandidates.push(application._id);
    }
  }

  res.json({
    applications,
    matchingScores,
    llmExplanations,
    shortlistedCandidates,
  });
}); // Calculate matching score between resume and job requirements
const calculateMatchingScore = async (resumeData, jobRequirements) => {
  let score = 0;
  const weights = {
    skills: 0.5, // Combined required and preferred skills
    experience: 0.2, // Years and relevance of experience
    education: 0.2, // Education match
    projects: 0.1, // Relevant project experience
  };

  // Skills matching
  const candidateSkills = new Set(
    resumeData.skills?.map((s) => s.toLowerCase()) || []
  );

  // Get required and preferred skills from job requirements
  const requiredSkills = new Set(
    jobRequirements.requiredSkills?.map((s) => s.toLowerCase()) || []
  );
  const preferredSkills = new Set(
    jobRequirements.preferredSkills?.map((s) => s.toLowerCase()) || []
  );

  // Calculate required skills match (70% of skills weight)
  const requiredMatch =
    requiredSkills.size > 0
      ? Array.from(requiredSkills).filter((skill) => candidateSkills.has(skill))
          .length / requiredSkills.size
      : 1; // If no required skills specified, assume full match

  // Calculate preferred skills match (30% of skills weight)
  const preferredMatch =
    preferredSkills.size > 0
      ? Array.from(preferredSkills).filter((skill) =>
          candidateSkills.has(skill)
        ).length / preferredSkills.size
      : 0;

  // Combined skills match score
  const skillsMatch = requiredMatch * 0.7 + preferredMatch * 0.3;

  // Experience match (years)
  const experienceMatch = jobRequirements.minExperience
    ? Math.min(
        (resumeData.experience?.length || 0) / jobRequirements.minExperience,
        1
      )
    : 1; // If no minimum experience specified, assume full match

  // Education match
  const educationMatch = !jobRequirements.preferredDegree
    ? 1 // If no preferred degree specified, assume full match
    : (resumeData.education || []).some((edu) =>
        edu.degree
          ?.toLowerCase()
          .includes(jobRequirements.preferredDegree.toLowerCase())
      )
    ? 1
    : 0.5;

  // Project match (based on relevant keywords)
  const projectKeywords = new Set(
    [
      ...(jobRequirements.requiredSkills || []),
      ...(jobRequirements.preferredSkills || []),
    ].map((s) => s.toLowerCase())
  );

  const projectMatches = (resumeData.projects || []).filter((project) =>
    Array.from(projectKeywords).some(
      (keyword) =>
        project.description?.toLowerCase().includes(keyword) ||
        (project.technologies || []).some((tech) =>
          tech.toLowerCase().includes(keyword)
        )
    )
  ).length;

  const projectMatch = Math.min(projectMatches / 2, 1); // Normalize to max of 1

  // Calculate final skills score combining required and preferred
  const skillsScore = requiredMatch * 0.7 + preferredMatch * 0.3;

  // Calculate final score
  score =
    weights.skills * skillsScore +
    weights.experience * experienceMatch +
    weights.education * educationMatch +
    weights.projects * projectMatch;

  // Return score as percentage
  return Math.round(Math.min(Math.max(score * 100, 0), 100));
};

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
    type: "APPLICATION_SHORTLISTED",
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
      const calculatedScores = await calculateMatchingScores(application, job);
      application.matchingScores = calculatedScores;
      await application.save();
    }

    scores[application._id] = application.matchingScores;
  }

  res.json({ scores });
});
