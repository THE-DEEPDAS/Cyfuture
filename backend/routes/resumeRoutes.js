import express from "express";
import multerErrorHandler from "../middleware/multerErrorHandler.js";
import {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
  setDefaultResume,
  getDefaultResume,
  addSkill,
  deleteSkill,
  addExperience,
  deleteExperience,
  addProject,
  deleteProject,
} from "../controllers/resumeController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../config/cloudinaryConfig.js";

const router = express.Router();

// Skills routes
router.post("/skills", protect, addSkill);
router.delete("/skills", protect, deleteSkill);

// Experience routes
router.post("/experience", protect, addExperience);
router.delete("/experience/:id", protect, deleteExperience);

// Project routes
router.post("/projects", protect, addProject);
router.delete("/projects/:id", protect, deleteProject);

// File upload and general resume routes
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
