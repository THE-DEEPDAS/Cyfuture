import asyncHandler from 'express-async-handler';
import cloudinary from 'cloudinary';
import Resume from '../models/resumeModel.js';
import User from '../models/userModel.js';
import { parsePdfResume, parseDocxResume } from '../utils/resumeParser.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// @desc    Upload resume
// @route   POST /api/resumes
// @access  Private
const uploadResume = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('Please upload a file');
    }

    // Get file extension
    const fileExtension = req.file.originalname.split('.').pop().toLowerCase();
    
    if (fileExtension !== 'pdf' && fileExtension !== 'docx') {
      res.status(400);
      throw new Error('Please upload a PDF or DOCX file');
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'resumes',
      resource_type: 'raw',
    });

    // Parse resume based on file type
    let parsedResume;
    if (fileExtension === 'pdf') {
      parsedResume = await parsePdfResume(result.secure_url);
    } else {
      parsedResume = await parseDocxResume(result.secure_url);
    }

    // Create resume in database
    const resume = await Resume.create({
      user: req.user._id,
      fileUrl: result.secure_url,
      fileType: fileExtension,
      cloudinaryId: result.public_id,
      parsedData: parsedResume.parsedData,
      rawText: parsedResume.rawText,
    });

    // Update user with resume ID
    await User.findByIdAndUpdate(req.user._id, { resumeId: resume._id });

    res.status(201).json(resume);
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500);
    throw new Error('Resume upload failed: ' + error.message);
  }
});

// @desc    Get user's resume
// @route   GET /api/resumes/me
// @access  Private
const getUserResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ user: req.user._id });

  if (resume) {
    res.json(resume);
  } else {
    res.status(404);
    throw new Error('Resume not found');
  }
});

// @desc    Get resume by ID
// @route   GET /api/resumes/:id
// @access  Private/Admin or Employer
const getResumeById = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (resume) {
    // Check if user is the owner, an admin, or an employer
    if (
      resume.user.toString() === req.user._id.toString() ||
      req.user.role === 'admin' ||
      req.user.role === 'employer'
    ) {
      res.json(resume);
    } else {
      res.status(401);
      throw new Error('Not authorized to view this resume');
    }
  } else {
    res.status(404);
    throw new Error('Resume not found');
  }
});

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (resume) {
    // Check if user is the owner or an admin
    if (
      resume.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(401);
      throw new Error('Not authorized to delete this resume');
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(resume.cloudinaryId);

    // Delete from database
    await resume.deleteOne();

    // Update user to remove resume reference
    await User.findByIdAndUpdate(req.user._id, { $unset: { resumeId: 1 } });

    res.json({ message: 'Resume removed' });
  } else {
    res.status(404);
    throw new Error('Resume not found');
  }
});

export { uploadResume, getUserResume, getResumeById, deleteResume };