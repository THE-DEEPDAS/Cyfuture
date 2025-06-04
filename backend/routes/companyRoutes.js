import express from "express";
import {
  getCompanyDashboardStats,
  getCompanyJobs,
  updateCompanyProfile,
} from "../controllers/companyController.js";
import { protect, company } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, company, getCompanyDashboardStats);
router.get("/jobs", protect, company, getCompanyJobs);
router.put("/profile", protect, company, updateCompanyProfile);

export default router;
