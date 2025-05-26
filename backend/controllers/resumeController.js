import asyncHandler from 'express-async-handler';
import Resume from '../models/resumeModel.js';
import resumeParser from '../utils/resumeParser.js';
import llmService from '../utils/llmService.js';

// @desc    Upload and parse resume
// @route   POST /api/resumes
// @access  Public
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a resume file');
  }

  try {
    // Get the uploaded file URL from Cloudinary
    const resumeUrl = req.file.path;
    
    // Parse resume to extract structured data
    const parsedResume = await resumeParser.process(resumeUrl);
    
    // Create resume in database
    const resume = await Resume.create({
      user: req.user ? req.user._id : null,
      name: parsedResume.name || 'Unknown',
      email: parsedResume.email || 'unknown@example.com',
      phone: parsedResume.phone || '',
      resumeUrl,
      skills: parsedResume.skills || [],
      education: parsedResume.education || [],
      experience: parsedResume.experience || [],
      projects: parsedResume.projects || [],
    });

    res.status(201).json({
      _id: resume._id,
      name: resume.name,
      email: resume.email,
      skills: resume.skills,
      resumeUrl: resume.resumeUrl,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500);
    throw new Error('Resume parsing failed. Please try again.');
  }
});

// @desc    Add chatbot response to resume
// @route   POST /api/resumes/:id/chatbot-response
// @access  Public
const addChatbotResponse = asyncHandler(async (req, res) => {
  const { question, answer, language } = req.body;
  
  if (!question || !answer) {
    res.status(400);
    throw new Error('Please provide both question and answer');
  }

  const resume = await Resume.findById(req.params.id);

  if (!resume) {
    res.status(404);
    throw new Error('Resume not found');
  }

  // Process the response with the LLM service
  try {
    // Add the response to the resume
    resume.chatbotResponses.push({
      question,
      answer,
      language: language || 'en',
    });
    
    // Update preferred language if provided
    if (language) {
      resume.preferredLanguage = language;
    }

    await resume.save();

    res.status(200).json({
      message: 'Response added successfully',
      resumeId: resume._id,
    });
  } catch (error) {
    console.error('Error adding chatbot response:', error);
    res.status(500);
    throw new Error('Failed to process response');
  }
});

// @desc    Get resume by ID
// @route   GET /api/resumes/:id
// @access  Private
const getResumeById = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);

  if (resume) {
    res.json(resume);
  } else {
    res.status(404);
    throw new Error('Resume not found');
  }
});

// @desc    Get all resumes for a user
// @route   GET /api/resumes/user
// @access  Private
const getUserResumes = asyncHandler(async (req, res) => {
  const resumes = await Resume.find({ user: req.user._id });
  res.json(resumes);
});

export { uploadResume, addChatbotResponse, getResumeById, getUserResumes };