import express from "express";
import {
  protect,
  companyOnly,
  candidate,
} from "../middleware/authMiddleware.js";
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
  applyForJob,
} from "../controllers/jobController.js";

const router = express.Router();

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private
router.post("/", protect, companyOnly, createJob);

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public
router.get("/", getJobs);

// @desc    Get jobs by company
// @route   GET /api/jobs/company/me
// @access  Private
router.get("/company/me", protect, companyOnly, getCompanyJobs);

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
router.get("/:id", getJob);

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private
router.put("/:id", protect, companyOnly, updateJob);

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private
router.delete("/:id", protect, companyOnly, deleteJob);

// @desc    Apply for a job
// @route   POST /api/jobs/:id/apply
// @access  Private
router.post("/:id/apply", protect, candidate, applyForJob);

export default router;
