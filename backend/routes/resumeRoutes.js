import express from 'express';
import multer from 'multer';
import {
  uploadResume,
  getUserResume,
  getResumeById,
  deleteResume,
} from '../controllers/resumeController.js';
import { protect, employer, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${file.originalname.match(/\..*$/)[0]}`
    );
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    if (
      file.mimetype === 'application/pdf' ||
      file.mimetype ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'), false);
    }
  },
});

router.route('/').post(protect, upload.single('resume'), uploadResume);
router.route('/me').get(protect, getUserResume);
router
  .route('/:id')
  .get(protect, getResumeById)
  .delete(protect, deleteResume);

export default router;