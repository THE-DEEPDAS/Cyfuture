import multer from "multer";

// Multer error handler middleware
const multerErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        message: "File is too large. Maximum size is 5MB",
      });
    } else {
      res.status(400).json({
        message: "File upload error: " + err.message,
      });
    }
  } else if (err && err.message) {
    // Handle custom multer errors (like file type)
    res.status(400).json({
      message: err.message,
    });
  } else {
    next(err);
  }
};

export default multerErrorHandler;
