import express from "express";
import multer from "multer";
import { protect, candidate } from "../middleware/authMiddleware.js";
import {
  uploadResume,
  getResumes,
  getResume,
  deleteResume,
  setDefaultResume,
  getDefaultResume,
} from "../controllers/resumeController.js";

const router = express.Router();

// Setup multer for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === "application/pdf" ||
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOCX files are allowed"), false);
    }
  },
});

// Routes will be implemented with actual controller functions
// @route   POST /api/resumes
router.post("/", protect, candidate, upload.single("file"), uploadResume);

// @route   GET /api/resumes
router.get("/", protect, candidate, getResumes);

// @route   GET /api/resumes/default
router.get("/default", protect, candidate, getDefaultResume);

// @route   GET /api/resumes/:id
router.get("/:id", protect, candidate, getResume);

// @route   DELETE /api/resumes/:id
router.delete("/:id", protect, candidate, deleteResume);

// @route   PUT /api/resumes/:id/default
router.put("/:id/default", protect, candidate, setDefaultResume);

export default router;
