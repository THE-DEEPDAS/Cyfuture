import asyncHandler from "express-async-handler";
import Application from "../models/Application.js";
import {
  startInterview,
  evaluateResponse,
  generateRejectionExplanation,
} from "../services/interviewService.js";

/**
 * @desc    Start an automated interview
 * @route   POST /api/applications/:id/interview/start
 * @access  Private/Company
 */
export const beginInterview = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("job")
    .populate("candidate");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check permissions
  if (application.job.company.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to start interview");
  }

  if (application.interview.status !== "not_started") {
    res.status(400);
    throw new Error("Interview already in progress or completed");
  }

  const updatedApplication = await startInterview(application);
  res.json(updatedApplication);
});

/**
 * @desc    Handle interview response
 * @route   POST /api/applications/:id/interview/respond
 * @access  Private/Candidate
 */
export const submitResponse = asyncHandler(async (req, res) => {
  const { response } = req.body;
  if (!response) {
    res.status(400);
    throw new Error("Response is required");
  }

  const application = await Application.findById(req.params.id)
    .populate("job")
    .populate("candidate");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check permissions
  if (application.candidate._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error("Not authorized to submit interview response");
  }

  if (application.interview.status !== "in_progress") {
    res.status(400);
    throw new Error("No interview in progress");
  }

  const updatedApplication = await evaluateResponse(application, response);
  res.json(updatedApplication);
});

/**
 * @desc    Get interview details
 * @route   GET /api/applications/:id/interview
 * @access  Private
 */
export const getInterviewDetails = asyncHandler(async (req, res) => {
  const application = await Application.findById(req.params.id)
    .populate("job")
    .populate("candidate");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Check permissions
  const isCandidate =
    req.user._id.toString() === application.candidate._id.toString();
  const isCompany =
    req.user._id.toString() === application.job.company.toString();

  if (!isCandidate && !isCompany) {
    res.status(403);
    throw new Error("Not authorized to view interview details");
  }

  // Return interview-specific messages and status
  const interviewMessages = application.messages.filter(
    (m) => m.messageType === "interview"
  );

  res.json({
    status: application.interview.status,
    score: application.interview.score,
    summary: application.interview.summary,
    strengths: application.interview.strengths,
    weaknesses: application.interview.weaknesses,
    messages: interviewMessages,
  });
});
