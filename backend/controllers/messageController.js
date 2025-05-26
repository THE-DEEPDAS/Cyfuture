import asyncHandler from 'express-async-handler';
import Message from '../models/messageModel.js';
import Job from '../models/jobModel.js';

// @desc    Send a message to all applicants of a job
// @route   POST /api/messages/job/:jobId
// @access  Private/Admin
const sendMessageToApplicants = asyncHandler(async (req, res) => {
  const { subject, content, type } = req.body;

  if (!subject || !content) {
    res.status(400);
    throw new Error('Please provide subject and content');
  }

  const job = await Job.findById(req.params.jobId);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the user is the admin who created the job
  if (job.admin.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to send messages for this job');
  }

  // Check if there are any applicants
  if (job.applications.length === 0) {
    res.status(400);
    throw new Error('No applicants for this job yet');
  }

  // Create recipients array from job applications
  const recipients = job.applications.map((application) => ({
    resume: application.resume,
  }));

  // Create message
  const message = await Message.create({
    sender: req.user._id,
    job: job._id,
    recipients,
    subject,
    content,
    type: type || 'Other',
  });

  res.status(201).json({
    message: 'Message sent successfully',
    messageId: message._id,
    recipientsCount: recipients.length,
  });
});

// @desc    Get all messages for a specific job
// @route   GET /api/messages/job/:jobId
// @access  Private/Admin
const getJobMessages = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);

  if (!job) {
    res.status(404);
    throw new Error('Job not found');
  }

  // Check if the user is the admin who created the job
  if (job.admin.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Not authorized to view messages for this job');
  }

  const messages = await Message.find({ job: req.params.jobId })
    .sort({ createdAt: -1 });

  res.json(messages);
});

// @desc    Get all messages for a specific resume
// @route   GET /api/messages/resume/:resumeId
// @access  Public
const getResumeMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({
    'recipients.resume': req.params.resumeId,
  })
    .populate('sender', 'name companyName')
    .populate('job', 'title')
    .sort({ createdAt: -1 });

  // Mark messages as read
  for (const message of messages) {
    const recipient = message.recipients.find(
      (r) => r.resume.toString() === req.params.resumeId
    );
    
    if (recipient && !recipient.read) {
      recipient.read = true;
      await message.save();
    }
  }

  res.json(messages);
});

export { sendMessageToApplicants, getJobMessages, getResumeMessages };