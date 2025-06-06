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
  }
  // Check screening questions
  if (job.screeningQuestions?.length > 0) {
    // Verify all screening questions are answered
    if (
      !screeningResponses ||
      screeningResponses.length !== job.screeningQuestions.length
    ) {
      res.status(400);
      throw new Error("Please answer all screening questions");
    }

    // Validate each screening response has required fields
    const hasInvalidResponses = screeningResponses.some(
      (response) => !response.question || !response.response
    );

    if (hasInvalidResponses) {
      res.status(400);
      throw new Error("Invalid format for screening responses");
    }

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
    let matchScore = 0;
    let llmAnalysis = null;

    try {
      // Calculate match score safely with error handling
      matchScore = await calculateMatchScore(job, resume.parsedData);
    } catch (matchError) {
      console.error("Error calculating match score:", matchError);
      // Default to a moderate score if calculation fails
      matchScore = 50;
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
      messages: [], // Initialize with empty messages array
    });

    // Send application notification
    try {
      const sendApplicationNotification = async (
        application,
        job,
        analysis
      ) => {
        // Notify company about new application
        await notifyUser(
          job.company._id,
          "APPLICATION_RECEIVED",
          "New Job Application",
          `${req.user.name} has applied for ${job.title}`,
          {
            jobId: job._id,
            applicationId: application._id,
            candidateId: req.user._id,
            score: analysis?.score || null,
          }
        );

        // Notify candidate about application status
        if (analysis?.isRecommended === false) {
          await notifyUser(
            req.user._id,
            "APPLICATION_FEEDBACK",
            "Application Status Update",
            `Thank you for applying to ${
              job.title
            }. Based on our initial assessment, we regret to inform you that your profile may not be the best match for this role at this time. ${
              analysis?.analysis?.feedback || ""
            }`,
            {
              jobId: job._id,
              applicationId: application._id,
              status: "reviewing",
              feedback: analysis?.analysis?.improvements || [],
            }
          );
        } else {
          await notifyUser(
            req.user._id,
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
  ); // If sender is candidate, generate AI response for interview questions
  if (req.user.role === "candidate") {
    try {
      // Check if it's a new application with minimal messages (first interaction)
      const isNewApplication = application.messages.length <= 2;
      let aiResponse;

      if (isNewApplication) {
        // For new applications, generate comprehensive interview questions based on job details
        // Fetch job details to use in prompt
        const job = await Job.findById(application.job).populate("company");

        // Create a detailed prompt using job information
        const jobPrompt = `
          This is a new job application for position: "${
            job?.title || "unknown position"
          }" at "${job?.company?.companyName || "unknown company"}".
          
          Job description: ${job?.description || "Not provided"}
          Required skills: ${job?.requiredSkills?.join(", ") || "Not specified"}
          Experience level: ${job?.experience || "Not specified"}
          
          You are an AI interviewer for this position. Please:
          1. Introduce yourself as an AI interviewer for this specific position
          2. Briefly explain the interview process
          3. Ask 3-5 relevant and specific interview questions that evaluate the candidate's skills, experience, and fit for this role
          
          Format your response clearly, with one question per paragraph.
        `;

        aiResponse = await generateChatResponse(jobPrompt, content, language);
      } else {
        // For ongoing conversations, generate a more contextual response based on conversation history
        // Create a context-aware prompt that understands this is part of an ongoing interview
        const contextPrompt = `
          This is an ongoing job interview conversation. 
          Previous messages: ${previousMessages}
          
          You are an AI interviewer evaluating a candidate. Based on their response, 
          provide constructive feedback and ask a relevant follow-up question that 
          helps assess their qualifications for the position.
        `;

        aiResponse = await generateChatResponse(
          contextPrompt,
          content,
          language
        );
      }

      // Add system message with AI response
      application.messages.push({
        sender: "system",
        content: aiResponse,
        language,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Error generating AI response:", error);
      // Add a more helpful fallback response if AI generation fails
      const fallbackResponses = [
        "Thanks for your response. What specific skills do you have that are relevant to this position?",
        "That's interesting. Could you tell me about a time when you demonstrated problem-solving skills in a previous role?",
        "Thank you for applying. Can you describe your experience with the technologies mentioned in the job description?",
        "I appreciate your interest in this position. What aspects of this role are you most excited about?",
        "Thanks for your application. How would your previous colleagues describe your work style and collaboration skills?",
      ];

      // Select a random fallback response
      const randomResponse =
        fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      application.messages.push({
        sender: "system",
        content: randomResponse,
        language,
        createdAt: new Date(),
      });
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
