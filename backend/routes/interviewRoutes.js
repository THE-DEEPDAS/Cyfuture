import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  beginInterview,
  submitResponse,
  getInterviewDetails,
} from "../controllers/interviewController.js";

const router = express.Router();

router.route("/:id/start").post(protect, beginInterview);
router.route("/:id/respond").post(protect, submitResponse);
router.route("/:id").get(protect, getInterviewDetails);

export default router;
