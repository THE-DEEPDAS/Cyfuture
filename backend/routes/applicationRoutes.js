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

// @route   POST /api/applications/:id/messages
router.post("/:id/messages", protect, sendMessage);

// @route   POST /api/applications/job/:jobId/message
router.post(
  "/job/:jobId/message",
  protect,
  companyOnly,
  sendMessageToAllApplicants
);

export default router;
