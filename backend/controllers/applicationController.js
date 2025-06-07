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

  if (!job) {
    res.status(404);
    throw new Error("Job not found");
  } // Check screening questions
  if (job.screeningQuestions?.length > 0) {
    // Verify we have responses array
    if (!Array.isArray(screeningResponses)) {
      res.status(400);
      throw new Error("Invalid screening responses format");
    }

    // Transform screeningResponses if they're in simple string format
    let formattedResponses = screeningResponses;

    // Check if we need to format responses (if they're just strings)
    if (
      screeningResponses.length === 0 ||
      typeof screeningResponses[0] === "string" ||
      !screeningResponses[0]?.question
    ) {
      formattedResponses = job.screeningQuestions.map((question, index) => ({
        question: question._id,
        questionText: question.question,
        response: (screeningResponses[index] || "").trim(),
      }));
    } else {
      // Add question text to properly formatted responses
      formattedResponses = screeningResponses.map((response) => {
        const questionObj = job.screeningQuestions.find(
          (q) => q._id.toString() === response.question.toString()
        );
        return {
          ...response,
          response: (response.response || "").trim(),
          questionText: questionObj?.question || "Unknown question",
        };
      });
    }

    // Validate all required questions are answered
    const missingResponses = job.screeningQuestions.filter(
      (question, index) => {
        if (!question.required) return false;
        const response = formattedResponses.find(
          (r) => r.question.toString() === question._id.toString()
        );
        return (
          !response || !response.response || response.response.trim() === ""
        );
      }
    );

    if (missingResponses.length > 0) {
      res.status(400);
      throw new Error(
        `Please answer the following required questions:\n${missingResponses
          .map((q) => q.question)
          .join("\n")}`
      );
    }

    // Replace with formatted responses
    req.body.screeningResponses = formattedResponses;

    // Validate required questions are answered
    for (let i = 0; i < job.screeningQuestions.length; i++) {
      const question = job.screeningQuestions[i];
      const response = screeningResponses.find(
        (resp) => resp.question.toString() === question._id.toString()
      );

      if (question.required && (!response || !response.response.trim())) {
        res.status(400);
        throw new Error(
          `Please answer the required question: ${question.question}`
        );
      }
    }
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

  try {
    // Find and validate the resume
    const resume = await Resume.findOne({
      _id: resumeId,
      user: req.user._id,
    }).select("+parsedData"); // Explicitly include parsedData

    if (!resume) {
      res.status(404);
      throw new Error("Resume not found");
    }

    if (!resume.parsedData) {
      res.status(400);
      throw new Error("Resume data is incomplete. Please update your resume.");
    } // Get match score and analysis
    let matchScore = 0;
    let matchingScores = null;
    let llmAnalysis = null;
    try {
      // Calculate match score safely with error handling
      const matchResult = await calculateMatchScore(job, resume.parsedData);
      if (matchResult && typeof matchResult.score === "number") {
        matchScore = Math.max(0, Math.min(100, matchResult.score)); // Ensure score is between 0-100
        matchingScores = {
          skills: Math.max(
            0,
            Math.min(100, matchResult.breakdown?.skillMatch?.total || 0)
          ),
          experience: Math.max(
            0,
            Math.min(100, matchResult.breakdown?.experienceMatch?.score || 0)
          ),
          total: Math.max(0, Math.min(100, matchResult.score)),
        };
      } else {
        // If match result is invalid, use moderate default score
        console.warn("Invalid match result structure:", matchResult);
        matchScore = 50;
        matchingScores = {
          skills: 50,
          experience: 50,
          total: 50,
        };
      }
    } catch (matchError) {
      console.error("Error calculating match score:", matchError);
      // Default to a moderate score if calculation fails
      matchScore = 50;
      matchingScores = {
        skills: 50,
        experience: 50,
        total: 50,
      };
    }

    // Get LLM analysis if enabled
    if (job.llmEvaluation?.enabled) {
      try {
        llmAnalysis = await analyzeCandidate(
          resume.parsedData,
          job,
          screeningResponses
        );
      } catch (analysisError) {
        console.error("Error generating LLM analysis:", analysisError);
        // Continue without LLM analysis
      }
    } // Create application with error handling
    let application;
    try {
      application = await Application.create({
        job: jobId,
        matchScore: typeof matchScore === "number" ? matchScore : 0,
        matchingScores: matchingScores,
        candidate: req.user._id,
        resume: resumeId,
        coverLetter: coverLetter || "",
        screeningResponses: req.body.screeningResponses || [],
        status: "pending",
        llmAnalysis: llmAnalysis || null,
        messages: [], // Initialize with empty messages array
      });
    } catch (createError) {
      console.error("Error creating application:", createError);

      // Check for specific MongoDB errors
      if (createError.name === "ValidationError") {
        res.status(400);
        throw new Error(
          "Invalid application data: " +
            Object.values(createError.errors)
              .map((e) => e.message)
              .join(", ")
        );
      } else if (createError.code === 11000) {
        res.status(400);
        throw new Error("You have already applied for this job");
      } else {
        res.status(500);
        throw new Error("Failed to submit application. Please try again.");
      }
    }

    // Send application notification
    try {
      // Update notification handling in sendApplicationNotification
      const sendApplicationNotification = async (
        application,
        job,
        analysis
      ) => {
        // Notify company about new application
        await notifyUser(
          job.company._id.toString(),
          "status", // Changed from "application" to "status"
          "New Job Application",
          `${req.user.name} has applied for ${job.title}`,
          {
            jobId: job._id.toString(),
            applicationId: application._id.toString(),
            candidateId: req.user._id.toString(),
            score: analysis?.score || null,
          }
        );

        // Notify candidate about application status
        if (analysis?.isRecommended === false) {
          await notifyUser(
            req.user._id.toString(),
            "status", // Changed from "APPLICATION_FEEDBACK" to "status"
            "Application Status Update",
            `Thank you for applying to ${
              job.title
            }. Based on our initial assessment, we regret to inform you that your profile may not be the best match for this role at this time. ${
              analysis?.analysis?.feedback || ""
            }`,
            {
              jobId: job._id.toString(),
              applicationId: application._id.toString(),
              status: "reviewing",
              feedback: analysis?.analysis?.improvements || [],
            }
          );
        } else {
          await notifyUser(
            req.user._id.toString(),
            "status", // Changed from "application" to "status"
            "Application Received",
            `Your application for ${job.title} has been received and is under review.`,
            {
              jobId: job._id.toString(),
              applicationId: application._id.toString(),
              status: "reviewing",
            }
          );
        }
      };

      await sendApplicationNotification(application, job, llmAnalysis);
    } catch (notificationError) {
      console.error("Error sending notifications:", notificationError);
      // Continue even if notifications fail
    }

    res.status(201).json(application);
  } catch (error) {
    console.error("Application submission error:", error);
    res.status(500);
    throw new Error(`Failed to submit application: ${error.message}`);
  }
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
        select: "title company location type status screeningQuestions",
        populate: {
          path: "company",
          select: "companyName",
        },
      })
      .populate({
        path: "resume",
        select: "fileUrl parsedData",
      })
      .populate({
        path: "messages.senderProfile",
        select: "name profilePicture",
      })
      .select(
        "status matchScore createdAt messages screeningResponses coverLetter llmAnalysis isShortlisted"
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

  if (!jobIds.length) {
    return res.json([]);
  }

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
      select:
        "title company description requirements location type screeningQuestions",
      populate: {
        path: "company",
        select: "companyName",
      },
    })
    .populate({
      path: "candidate",
      select:
        "name email phone profilePicture bio location skills education experience socialLinks",
    })
    .populate({
      path: "resume",
      select: "fileUrl parsedData",
    });

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check if user has permission to access this application
  const isCompany = req.user.role === "company";
  const isCandidate = req.user.role === "candidate";

  if (
    !(
      (isCandidate &&
        application.candidate._id.toString() === req.user._id.toString()) ||
      (isCompany &&
        application.job.company._id.toString() === req.user._id.toString())
    )
  ) {
    res.status(403);
    throw new Error("Not authorized to access this application");
  }

  // If this is a company user viewing the application, add additional analytics
  if (isCompany) {
    try {
      // Get detailed match analysis if not already present
      if (!application.matchingScores) {
        const matchScores = await calculateDetailedMatchScore(
          application.job,
          application.resume.parsedData
        );
        application.matchingScores = matchScores;
        await application.save();
      }

      // Make sure screening responses have question text
      if (
        application.screeningResponses &&
        application.screeningResponses.length > 0 &&
        application.job.screeningQuestions &&
        application.job.screeningQuestions.length > 0
      ) {
        // Map screening questions to responses for easier display
        application.screeningResponses = application.screeningResponses.map(
          (response, index) => {
            const questionObj = application.job.screeningQuestions[index] || {
              question: "Question not found",
            };
            return {
              ...response,
              question: questionObj,
            };
          }
        );
      }

      // Generate candidate profile summary if not already present
      if (
        !application.candidateProfileSummary &&
        application.resume.parsedData
      ) {
        try {
          const summaryPrompt = `
            Generate a brief professional summary of this candidate based on their resume data:
            
            Skills: ${
              application.resume.parsedData.skills?.join(", ") || "Not provided"
            }
            Experience: ${JSON.stringify(
              application.resume.parsedData.experience || []
            )}
            Education: ${JSON.stringify(
              application.resume.parsedData.education || []
            )}
            
            Provide a 2-3 sentence professional summary highlighting their key qualifications and potential fit for the role.
          `;

          const summary = await generateChatResponse(summaryPrompt, "", "en");
          application.candidateProfileSummary = summary;
          await application.save();
        } catch (error) {
          console.error("Error generating candidate profile summary:", error);
        }
      }
    } catch (error) {
      console.error(
        "Error enhancing application data for company view:",
        error
      );
    }
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
  let notificationType = "status"; // Using consistent type
  let notificationTitle = "Application Status Updated";
  let notificationMessage = `Your application for ${application.job.title} has been updated to: ${status}`;

  if (status === "shortlisted") {
    notificationTitle = "Congratulations! You've Been Shortlisted";
    notificationMessage = `Great news! Your application for ${application.job.title} has been shortlisted. The employer may contact you soon for the next steps.`;
  } else if (status === "rejected") {
    notificationTitle = "Application Status Update";
    // Generate AI explanation for rejection if possible
    let rejectionReason = "";
    try {
      // Get job and resume data
      const job = await Job.findById(application.job._id).populate(
        "company",
        "companyName"
      );
      const resume = await Resume.findById(application.resume).populate(
        "user",
        "name email"
      );

      if (job && resume) {
        // Detect language for appropriate response
        const language = "en"; // Default to English

        // Generate explanation using LLM with more detailed context
        const explanationPrompt = `
          The candidate ${resume.user.name} has been rejected for the job ${
          job.title
        } at ${job.company.companyName}. 
          Please provide a constructive and helpful explanation for why they might not be the best fit, based on this data:
          
          Job Requirements:
          - Title: ${job.title}
          - Required Skills: ${
            job.requiredSkills?.join(", ") || "Not specified"
          }
          - Experience Needed: ${
            job.experience?.years || "Not specified"
          } years in ${job.experience?.field || "relevant field"}
          - Education Required: ${job.education?.level || "Not specified"} in ${
          job.education?.field || "relevant field"
        }
          - Job Description: ${
            job.description?.substring(0, 200) || "Not provided"
          }...
          
          Candidate Profile:
          - Skills: ${resume.parsedData?.skills?.join(", ") || "Not provided"}
          - Experience: ${
            resume.parsedData?.experience
              ?.map(
                (exp) =>
                  `${exp.title} at ${exp.company} for ${
                    exp.durationYears || "unknown"
                  } years`
              )
              .join("; ") || "Not provided"
          }
          - Education: ${
            resume.parsedData?.education
              ?.map(
                (edu) => `${edu.degree} in ${edu.field} from ${edu.institution}`
              )
              .join("; ") || "Not provided"
          }
          
          Match Score: ${application.matchScore || 0}/100
          
          Provide a constructive, specific and empathetic explanation (3-4 sentences) that:
          1. Acknowledges the candidate's strengths
          2. Clearly explains the main gaps or mismatches (skills, experience, or education)
          3. Offers constructive advice for improving their chances for similar roles
          4. Ends on an encouraging note
          
          Do not be vague. Mention specific skills or qualifications that were missing. Be honest but kind.
        `;

        const explanation = await generateChatResponse(
          explanationPrompt,
          "",
          language
        );

        if (explanation) {
          rejectionReason = explanation;
          // Save the explanation to the application
          application.rejectionReason = explanation;
          await application.save();
        }
      }
    } catch (error) {
      console.error("Error generating rejection explanation:", error);
      // Continue without explanation if there's an error
    }

    // Add the explanation to the message if available
    notificationMessage = `We regret to inform you that your application for ${
      application.job.title
    } has not been selected to move forward.${
      rejectionReason ? "\n\n" + rejectionReason : ""
    }`;

    // Add a system message with the explanation
    if (rejectionReason) {
      application.messages.push({
        sender: "system",
        content: `Your application has been rejected. ${rejectionReason}`,
        language: "en",
        createdAt: new Date(),
      });
      await application.save();
    }
  } else if (status === "accepted") {
    notificationTitle = "Congratulations! Application Accepted";
    notificationMessage = `Great news! Your application for ${application.job.title} has been accepted.`;
  } else if (status === "hired") {
    notificationTitle = "Congratulations! You've Been Hired";
    notificationMessage = `Excellent news! Your application for ${application.job.title} has been successful. The employer will contact you with further details.`;
  }

  // Get the io object from the request
  const io = req.app.get("io");

  // Send notification to candidate
  try {
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
  } catch (notificationError) {
    console.error("Error sending notification:", notificationError);
    // Continue even if notification fails
  }

  res.json(updatedApplication);
});

// @desc    Send message in application thread
// @route   POST /api/applications/:id/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, language = "en" } = req.body;

  if (!content) {
    res.status(400);
    throw new Error("Message content is required");
  }

  const application = await Application.findById(id)
    .populate({
      path: "job",
      select: "company title",
      populate: {
        path: "company",
        select: "companyName",
      },
    })
    .populate({
      path: "candidate",
      select: "name email profilePicture",
    });

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check permissions
  const isCompany = req.user.role === "company";
  const isCandidate = req.user.role === "candidate";
  const companyId = application.job.company._id || application.job.company;

  if (
    isCandidate &&
    application.candidate._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to send messages for this application");
  }

  if (isCompany && companyId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to send messages for this application");
  }

  // Create and add new message
  const newMessage = {
    sender: req.user.role, // 'company' or 'candidate'
    senderProfile: req.user._id, // Set the senderProfile to the user's ID
    content: content,
    language: language,
    createdAt: new Date(),
  };

  // Initialize messages array if it doesn't exist
  if (!application.messages) {
    application.messages = [];
  }

  application.messages.push(newMessage);

  // Get recipient ID (if sender is company, recipient is candidate, and vice versa)
  const recipientId = isCompany
    ? application.candidate._id.toString()
    : companyId.toString();

  // Send notification
  try {
    await notifyUser(
      recipientId,
      "message",
      "New Message",
      `You have a new message regarding your application for ${application.job.title}`,
      {
        applicationId: application._id.toString(),
        jobId: application.job._id.toString(),
      }
    );
  } catch (err) {
    console.error("Error sending notification:", err);
    // Continue even if notification fails
  }

  // Save application and return updated messages with populated senderProfile
  await application.save();

  // Fetch the application again with populated senderProfile
  const updatedApplication = await Application.findById(id).populate(
    "messages.senderProfile"
  );

  res.json(updatedApplication.messages);
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
    await notifyUser(
      application.candidate._id.toString(),
      "status", // Changed from "application" to "status"
      "Application Shortlisted",
      `Your application for ${application.job.title} has been shortlisted!`,
      {
        applicationId: application._id.toString(),
        jobId: application.job._id.toString(),
        link: `/applications/${application._id}`,
      }
    );
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
  // Get applications with populated data, sorted by last message date
  const applications = await Application.aggregate([
    { $match: { job: mongoose.Types.ObjectId(jobId) } },
    // Add field for latest message date
    {
      $addFields: {
        lastMessageDate: {
          $cond: {
            if: { $isArray: "$messages" },
            then: { $max: "$messages.createdAt" },
            else: "$createdAt",
          },
        },
      },
    },
    // Sort by latest message date
    { $sort: { lastMessageDate: -1 } },
  ]);
  // Populate required fields
  await Application.populate(applications, [
    {
      path: "candidate",
      select: "name email phone",
    },
    {
      path: "job",
      select: "title company",
      populate: {
        path: "company",
        select: "companyName",
      },
    },
    {
      path: "resume",
      select: "fileUrl parsedData",
    },
  ]);

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
  await notifyUser({
    user: application.candidate,
    type: "status", // Changed to "status" for shortlist notification
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
  const application = await Application.findById(req.params.id).populate([
    {
      path: "job",
      select: "company title requiredSkills experience education description",
      populate: {
        path: "company",
        select: "companyName",
      },
    },
    {
      path: "candidate",
      select: "name email skills",
    },
    {
      path: "resume",
      select: "parsedData",
    },
  ]);

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check if the user is the company that posted the job
  if (application.job.company._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to reject this application");
  }

  // Update the status to rejected
  application.status = "rejected";

  // Import the service for generating rejection explanation
  const { generateRejectionExplanation } = await import(
    "../services/interviewService.js"
  );

  // Generate an AI explanation for the rejection
  let rejectionReason = "";
  try {
    // Prepare candidate data from resume for the explanation
    const candidateData = {
      skills: application.resume.parsedData?.skills || [],
      experience: application.resume.parsedData?.experience || [],
      education: application.resume.parsedData?.education || [],
    };

    rejectionReason = await generateRejectionExplanation(
      application.job,
      candidateData,
      application.matchScore || 60
    );

    // Save the explanation to the application
    application.rejectionReason = rejectionReason;
  } catch (error) {
    console.error("Error generating rejection explanation:", error);
    rejectionReason = `We appreciate your interest in the ${application.job.title} position. After careful review, we've decided to move forward with candidates whose skills and experience more closely align with our current needs. We encourage you to apply for future positions that match your qualifications.`;
  }

  // Add a system message about the status change with explanation
  application.messages.push({
    sender: "system",
    content: `Your application has been rejected. ${rejectionReason}`,
    language: "en",
    createdAt: new Date(),
  });

  const updatedApplication = await application.save();

  // Send notification to candidate with the explanation
  await notifyUser(
    application.candidate._id.toString(),
    "APPLICATION_REJECTED",
    "Application Status Update",
    `We regret to inform you that your application for ${application.job.title} has not been selected to move forward. ${rejectionReason}`,
    {
      applicationId: application._id.toString(),
      jobId: application.job._id.toString(),
      status: "rejected",
    }
  );

  res.json(updatedApplication);
});

/**
 * Get messages for an application
 * @route GET /api/applications/:id/messages
 * @access Private
 */
export const getApplicationMessages = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const application = await Application.findById(id)
    .select("messages candidate job status")
    .populate({
      path: "job",
      select: "company title",
      populate: {
        path: "company",
        select: "companyName _id",
      },
    })
    .populate({
      path: "candidate",
      select: "name email profilePicture _id",
    })
    .populate("messages.senderProfile");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check permissions
  const isCompany = req.user.role === "company";
  const isCandidate = req.user.role === "candidate";
  const companyId = application.job.company._id || application.job.company;

  if (
    isCandidate &&
    application.candidate._id.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to access messages for this application");
  }

  if (isCompany && companyId.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to access messages for this application");
  }

  // Return messages array
  res.json(application.messages);
});

// @desc    Start an automated interview for a candidate
// @route   POST /api/applications/:id/interview
// @access  Private/Company
export const startAutomatedInterview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const application = await Application.findById(id)
    .populate({
      path: "job",
      select: "company title description requiredSkills experience",
      populate: {
        path: "company",
        select: "companyName",
      },
    })
    .populate({
      path: "candidate",
      select: "name email",
    });

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check if the user is the company that posted the job
  if (application.job.company._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to start interviews for this application");
  }

  try {
    // Import the interview service dynamically
    const { generateInitialInterview } = await import(
      "../services/interviewService.js"
    );
    // Generate interview introduction and questions
    const interviewContent = await generateInitialInterview(application.job);

    // Add a company message indicating interview start
    application.messages.push({
      sender: "company",
      content:
        "I've started an automated interview to help us learn more about your qualifications. Please respond to each question in detail.",
      language: "en",
      createdAt: new Date(),
    });

    // Add the AI interviewer message with questions
    application.messages.push({
      sender: "system",
      content: interviewContent,
      language: "en",
      createdAt: new Date(),
    });

    // Save the application with the new messages
    await application.save();

    // Notify the candidate about the interview
    const io = req.app.get("io");
    await notifyUser(
      io,
      application.candidate._id.toString(),
      "message",
      "Automated Interview Started",
      `${application.job.company.companyName} has started an automated interview for your application to ${application.job.title}.`,
      {
        applicationId: application._id.toString(),
        jobId: application.job._id.toString(),
      }
    );

    res.status(200).json({
      success: true,
      message: "Automated interview started successfully",
      messages: application.messages,
    });
  } catch (error) {
    console.error("Error starting automated interview:", error);
    res.status(500);
    throw new Error("Failed to start automated interview");
  }
});

// @desc    Get candidates for a company
// @route   GET /api/applications/candidates
// @access  Private/Company
export const getCandidates = asyncHandler(async (req, res) => {
  // Find all jobs posted by the company
  const jobs = await Job.find({ company: req.user._id }).select("_id");
  const jobIds = jobs.map((job) => job._id);
  // Find all applications for company's jobs and populate candidate and job info
  const applications = await Application.find({ job: { $in: jobIds } })
    .populate({
      path: "candidate",
      select: "name email skills profilePicture role",
    })
    .populate({
      path: "job",
      select: "title company",
      populate: {
        path: "company",
        select: "companyName",
      },
    })
    .populate({
      path: "resume",
      select: "fileUrl",
    })
    .lean();
  // Transform applications data to return candidate information
  const candidates = applications.map((app) => {
    const candidate = app.candidate || {};
    const job = app.job || {};
    return {
      _id: candidate._id,
      name: candidate.name,
      email: candidate.email,
      skills: candidate.skills,
      profilePicture: candidate.profilePicture,
      appliedJob: job.title,
      applicationId: app._id,
      messages: app.messages || [],
      hasInterviewChat: Boolean(
        app.messages?.some(
          (m) => m.sender === "system" || m.sender === "company"
        )
      ),
      lastMessageAt: app.messages?.length
        ? app.messages[app.messages.length - 1].createdAt
        : app.createdAt,
    };
  });

  res.json(candidates);
});

/**
 * @desc    Get application stats
 * @route   GET /api/applications/stats
 * @access  Private/Company
 */
export const getApplicationStats = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ company: req.user._id }).select("_id");
  const jobIds = jobs.map((job) => job._id);
  if (!jobIds.length) {
    return res.json({
      totalApplications: 0,
      shortlisted: 0,
      hired: 0,
      interviewing: 0,
      messageStats: { totalMessages: 0, avgMessagesPerApp: 0 },
    });
  }

  const stats = await Application.aggregate([
    {
      $match: {
        job: { $in: jobIds.map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ],
        byInterviewStatus: [
          {
            $addFields: {
              hasInterview: {
                $gt: [
                  {
                    $size: {
                      $filter: {
                        input: { $ifNull: ["$messages", []] },
                        cond: { $eq: ["$$this.sender", "system"] },
                      },
                    },
                  },
                  0,
                ],
              },
            },
          },
          {
            $group: {
              _id: "$hasInterview",
              count: { $sum: 1 },
            },
          },
        ],
        messageStats: [
          {
            $addFields: {
              messageCount: { $size: { $ifNull: ["$messages", []] } },
            },
          },
          {
            $group: {
              _id: null,
              totalMessages: { $sum: "$messageCount" },
              avgMessagesPerApp: { $avg: "$messageCount" },
            },
          },
        ],
      },
    },
  ]);

  // Process stats into a more usable format
  const statusCounts = stats[0].byStatus.reduce((acc, curr) => {
    acc[curr._id] = curr.count;
    return acc;
  }, {});

  res.json({
    totalApplications: await Application.countDocuments({
      job: { $in: jobIds },
    }),
    shortlisted: statusCounts.shortlisted || 0,
    hired: statusCounts.hired || 0,
    interviewing:
      stats[0].byInterviewStatus.find((s) => s._id === true)?.count || 0,
    messageStats: stats[0].messageStats[0] || {
      totalMessages: 0,
      avgMessagesPerApp: 0,
    },
  });
});
