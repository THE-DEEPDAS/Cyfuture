import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary
 * @param {Buffer} fileBuffer - The file buffer to upload
 * @param {String} fileName - Original file name for reference
 * @param {String} folder - Optional folder path in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadFile = (fileBuffer, fileName, folder = "resumes") => {
  return new Promise((resolve, reject) => {
    // Create upload stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
        public_id: `${Date.now()}-${fileName.split(".")[0]}`, // Unique name
        use_filename: true,
        unique_filename: true,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Convert buffer to stream and pipe to uploadStream
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary
 * @param {String} publicId - Cloudinary public_id of the file
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
export const deleteFile = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    throw error;
  }
};

/**
 * Get optimized URL with transformations
 * @param {String} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {String} - Transformed URL
 */
export const getOptimizedUrl = (url, options = {}) => {
  // Extract public ID from the URL
  const parts = url.split("/");
  const uploadIndex = parts.findIndex((part) => part === "upload");

  if (uploadIndex === -1) return url;

  const publicIdWithExt = parts.slice(uploadIndex + 1).join("/");
  const publicId = publicIdWithExt.substring(
    0,
    publicIdWithExt.lastIndexOf(".")
  );

  // Default transformation options
  const defaultOptions = {
    quality: "auto",
    fetch_format: "auto",
    ...options,
  };

  // Build transformation string
  const transformations = Object.entries(defaultOptions)
    .map(([key, value]) => `${key}_${value}`)
    .join(",");

  return cloudinary.url(publicId, { transformation: transformations });
};

export default {
  uploadFile,
  deleteFile,
  getOptimizedUrl,
};
