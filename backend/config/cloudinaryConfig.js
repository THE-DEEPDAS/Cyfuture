import multer from "multer";
import path from "path";

// Configure multer for handling file uploads
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check file type
  const filetypes =
    /pdf|vnd.openxmlformats-officedocument.wordprocessingml.document/;
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and DOCX files are allowed!"), false);
  }
};

// Initialize multer with configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});
