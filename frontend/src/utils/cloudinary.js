const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dler9jdjf";
const UPLOAD_PRESET =
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "talent_match_uploads";

/**
 * Direct upload to Cloudinary (for cases where backend upload is not possible)
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - Secure URL of the uploaded file
 */
export const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
};

/**
 * Get optimized URL with transformations
 * @param {string} url - Original Cloudinary URL
 * @param {Object} options - Transformation options
 * @returns {string} - Transformed URL for optimization
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || !url.includes("cloudinary.com")) {
    return url; // Return original URL if not a Cloudinary URL
  }

  // Parse the URL to identify components
  const urlParts = url.split("/");
  const uploadIndex = urlParts.findIndex((part) => part === "upload");

  if (uploadIndex === -1) return url;

  // Default transformation options
  const defaultOptions = {
    q: "auto", // quality
    f: "auto", // format
    ...options,
  };

  // Build transformation string
  const transformations = Object.entries(defaultOptions)
    .map(([key, value]) => `${key}_${value}`)
    .join(",");

  // Insert transformations after "upload"
  urlParts.splice(uploadIndex + 1, 0, transformations);

  return urlParts.join("/");
};

/**
 * Generate a thumbnail URL for a document
 * @param {string} fileUrl - Original document URL
 * @param {number} page - Page number to thumbnail (default: 1)
 * @returns {string} - Thumbnail URL
 */
export const getDocumentThumbnail = (fileUrl, page = 1) => {
  if (!fileUrl || !fileUrl.includes("cloudinary.com")) {
    // Return a default thumbnail if not a Cloudinary URL
    return "/assets/document-thumbnail.png";
  }

  return getOptimizedImageUrl(fileUrl, {
    pg: page,
    w: 400,
    h: 500,
    c: "thumb",
    b: "auto",
  });
};

export default {
  uploadToCloudinary,
  getOptimizedImageUrl,
  getDocumentThumbnail,
};
