import Resume from "../models/Resume.js";
import { parseResumeText } from "../services/simplifiedResumeParser.js";
import { uploadFile } from "../utils/cloudinary.js";

/**
 * @desc    Upload a new resume
 * @route   POST /api/resumes
 * @access  Private/Candidate
 */
export const uploadResume = async (req, res) => {
  try {
    // Check if file exists
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // Upload file to Cloudinary
    const fileBuffer = req.file.buffer;
    const result = await uploadFile(fileBuffer, req.file.originalname);

    // Parse resume text
    const parsedData = await parseResumeText(fileBuffer);

    // Set all existing resumes to non-default if this is the first resume
    const existingResumes = await Resume.countDocuments({ user: req.user._id });
    const isDefault = existingResumes === 0 ? true : false;

    // Create resume record
    const resume = await Resume.create({
      user: req.user._id,
      title: req.body.title || req.file.originalname.split(".")[0],
      fileUrl: result.secure_url,
      fileType: req.file.originalname.split(".").pop().toLowerCase(),
      parsedData,
      isDefault,
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error("Resume upload error:", error);
    res.status(500).json({ message: "Server error during resume upload" });
  }
};

/**
 * @desc    Get all resumes for a user
 * @route   GET /api/resumes
 * @access  Private/Candidate
 */
export const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select("title fileUrl fileType createdAt updatedAt isDefault")
      .sort({ createdAt: -1 });

    res.json(resumes);
  } catch (error) {
    console.error("Get resumes error:", error);
    res.status(500).json({ message: "Server error fetching resumes" });
  }
};

/**
 * @desc    Get a single resume by id
 * @route   GET /api/resumes/:id
 * @access  Private/Candidate
 */
export const getResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.json(resume);
  } catch (error) {
    console.error("Get resume error:", error);
    res.status(500).json({ message: "Server error fetching resume" });
  }
};

/**
 * @desc    Get default resume or first resume
 * @route   GET /api/resumes/default
 * @access  Private/Candidate
 */
export const getDefaultResume = async (req, res) => {
  try {
    // Find default resume
    let resume = await Resume.findOne({
      user: req.user._id,
      isDefault: true,
    });

    // If no default, get the most recent resume
    if (!resume) {
      resume = await Resume.findOne({ user: req.user._id }).sort({
        createdAt: -1,
      });
    }

    if (!resume) {
      return res.status(404).json({ message: "No resumes found" });
    }

    res.json(resume);
  } catch (error) {
    console.error("Get default resume error:", error);
    res.status(500).json({ message: "Server error fetching default resume" });
  }
};

/**
 * @desc    Delete a resume
 * @route   DELETE /api/resumes/:id
 * @access  Private/Candidate
 */
export const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    const wasDefault = resume.isDefault;

    // Delete the resume
    await resume.deleteOne();

    // If deleted resume was default, set another resume as default
    if (wasDefault) {
      const newDefault = await Resume.findOne({ user: req.user._id }).sort({
        createdAt: -1,
      });

      if (newDefault) {
        newDefault.isDefault = true;
        await newDefault.save();
      }
    }

    res.json({ message: "Resume deleted successfully" });
  } catch (error) {
    console.error("Delete resume error:", error);
    res.status(500).json({ message: "Server error deleting resume" });
  }
};

/**
 * @desc    Set a resume as default
 * @route   PUT /api/resumes/:id/default
 * @access  Private/Candidate
 */
export const setDefaultResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    // Remove default status from all resumes for this user
    await Resume.updateMany({ user: req.user._id }, { isDefault: false });

    // Set this resume as default
    resume.isDefault = true;
    await resume.save();

    res.json({ message: "Resume set as default", resume });
  } catch (error) {
    console.error("Set default resume error:", error);
    res.status(500).json({ message: "Server error setting default resume" });
  }
};
