import Application from '../models/Application.js';
import { analyzeCandidate, generateChatResponse } from '../utils/llm.js';
import asyncHandler from 'express-async-handler';

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private/Candidate
export const applyToJob = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { resumeId, coverLetter } = req.body;
  
  const application = await Application.create({
    job: jobId,
    candidate: req.user._id,
    resume: resumeId,
    coverLetter,
    status: 'pending'
  });

  // Get job and candidate details for analysis
  const populatedApp = await Application.findById(application._id)
    .populate('job')
    .populate('resume');

  // Perform LLM analysis
  const analysis = await analyzeCandidate(
    populatedApp.job.description,
    populatedApp.resume.parsedData
  );

  // Update application with analysis results
  application.matchScore = analysis.matchScore;
  application.llmRationale = analysis.rationale;
  await application.save();

  res.status(201).json(application);
});

// @desc    Send message in application thread
// @route   POST /api/applications/:id/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content, language = 'en' } = req.body;

  const application = await Application.findById(id);
  
  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Get previous messages for context
  const previousMessages = application.messages
    .slice(-5)
    .map(m => `${m.sender}: ${m.content}`)
    .join('\n');

  // If sender is candidate, generate AI response
  let aiResponse;
  if (req.user.role === 'candidate') {
    aiResponse = await generateChatResponse(previousMessages, content, language);
  }

  // Add new message
  application.messages.push({
    sender: req.user.role,
    content,
    language
  });

  // Add AI response if applicable
  if (aiResponse) {
    application.messages.push({
      sender: 'system',
      content: aiResponse,
      language
    });
  }

  await application.save();
  res.json(application.messages);
});

// Other controller functions remain unchanged