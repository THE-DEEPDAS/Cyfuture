import express from "express";
import { protect, company } from "../middleware/authMiddleware.js";
import {
  createJob,
  getJobs,
  getJob,
  updateJob,
  deleteJob,
  getCompanyJobs,
  applyForJob,
  matchCandidates,
  getJobApplications,
  getMatchingJobs,
  getAllJobs,
} from "../controllers/jobController.js";

const router = express.Router();

// Public routes
router.route("/").post(protect, company, createJob).get(getAllJobs);

// Company routes
router.route("/company/me").get(protect, company, getCompanyJobs);

// Matching routes
router.route("/matching").get(protect, getMatchingJobs);

// Job specific routes
router
  .route("/:id")
  .get(getJob)
  .put(protect, company, updateJob)
  .delete(protect, company, deleteJob);

router.route("/:id/apply").post(protect, applyForJob);
router.route("/:id/applications").get(protect, company, getJobApplications);
router.route("/:id/match").post(protect, company, matchCandidates);

export default router;
