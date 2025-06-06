import express from "express";
import multerErrorHandler from "../middleware/multerErrorHandler.js";
import {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
  setDefaultResume,
  getDefaultResume,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinaryConfig.js";

const router = express.Router();

// Apply multerErrorHandler after file upload middleware
router.post(
  "/",
  protect,
  upload.single("resume"),
  multerErrorHandler,
  uploadResume
);
router.get("/default", protect, getDefaultResume); // This needs to be before the :id route
router.get("/", protect, getResumes);
router.get("/:id", protect, getResume);
router.delete("/:id", protect, deleteResume);
router.patch("/:id/default", protect, setDefaultResume);

export default router;
