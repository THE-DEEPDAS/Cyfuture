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
  getJobApplicationStats,
  updateApplicationStatus,
  sendMessage,
  sendMessageToAllApplicants,
  shortlistCandidate,
  removeFromShortlist,
  getLLMAnalysis,
  getMatchingScores,
  getJobApplications,
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

// @route   PUT /api/applications/:id/status
router.put("/:id/status", protect, companyOnly, updateApplicationStatus);

// @route   POST /api/applications/:id/shortlist
router.post("/:id/shortlist", protect, companyOnly, shortlistCandidate);

// @route   DELETE /api/applications/:id/shortlist
router.delete("/:id/shortlist", protect, companyOnly, removeFromShortlist);

// @route   POST /api/applications/:id/messages
router.post("/:id/messages", protect, sendMessage);

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

export default router;
