import express from "express";
import {
  protect,
  candidate,
  companyOnly,
} from "../middleware/authMiddleware.js";
import {
  applyToJob,
  getCandidateApplications,
  getCompanyApplications,
  getApplicationById,
  getApplicationMessages,
  getJobApplicationStats,
  updateApplicationStatus,
  sendMessage,
  sendMessageToAllApplicants,
  shortlistCandidate,
  removeFromShortlist,
  getLLMAnalysis,
  getMatchingScores,
  getJobApplications,
  acceptApplication,
  rejectApplication,
  hireCandidate,
  startAutomatedInterview,
  getCandidates,
} from "../controllers/applicationController.js";

const router = express.Router();

// @route   POST /api/applications/:jobId
router.post("/:jobId", protect, candidate, applyToJob);

// @route   GET /api/applications/candidate
router.get("/candidate", protect, candidate, getCandidateApplications);

// @route   GET /api/applications/company
router.get("/company", protect, companyOnly, getCompanyApplications);

// @route   GET /api/applications/stats/:jobId
router.get("/stats/:jobId", protect, companyOnly, getJobApplicationStats);

// @route   GET /api/applications/:id
router.get("/:id", protect, getApplicationById);

// @route   GET /api/applications/:id/messages
router.get("/:id/messages", protect, getApplicationMessages);

// @route   PUT /api/applications/:id/status
router.put("/:id/status", protect, companyOnly, updateApplicationStatus);

// @route   POST /api/applications/:id/accept
router.post("/:id/accept", protect, companyOnly, acceptApplication);

// @route   POST /api/applications/:id/reject
router.post("/:id/reject", protect, companyOnly, rejectApplication);

// @route   POST /api/applications/:id/hire
router.post("/:id/hire", protect, companyOnly, hireCandidate);

// @route   POST /api/applications/:id/shortlist
router.post("/:id/shortlist", protect, companyOnly, shortlistCandidate);

// @route   DELETE /api/applications/:id/shortlist
router.delete("/:id/shortlist", protect, companyOnly, removeFromShortlist);

// @route   POST /api/applications/:id/messages
router.post("/:id/messages", protect, sendMessage);

// @route   POST /api/applications/:id/interview
router.post("/:id/interview", protect, companyOnly, startAutomatedInterview);

// @route   GET /api/applications/job/:jobId
router.get("/job/:jobId", protect, companyOnly, getJobApplications);

// @route   POST /api/applications/job/:jobId/message
router.post(
  "/job/:jobId/message",
  protect,
  companyOnly,
  sendMessageToAllApplicants
);

// @route   GET /api/applications/job/:jobId/llm-analysis
router.get("/job/:jobId/llm-analysis", protect, companyOnly, getLLMAnalysis);

// @route   GET /api/applications/job/:jobId/matching-scores
router.get(
  "/job/:jobId/matching-scores",
  protect,
  companyOnly,
  getMatchingScores
);

// @route   GET /api/applications/candidates
router.get("/candidates", protect, companyOnly, getCandidates);

export default router;
