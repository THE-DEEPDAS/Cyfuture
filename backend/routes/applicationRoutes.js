import express from 'express';
import { protect, candidate, company } from '../middleware/authMiddleware.js';

// Controller functions will be implemented later
// import { 
//   applyToJob, 
//   getCandidateApplications, 
//   getCompanyApplications,
//   getApplicationById, 
//   updateApplicationStatus,
//   sendMessage
// } from '../controllers/applicationController.js';

const router = express.Router();

// Routes will be implemented with actual controller functions
// @route   POST /api/applications/:jobId
router.post('/:jobId', protect, candidate, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// @route   GET /api/applications/candidate
router.get('/candidate', protect, candidate, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// @route   GET /api/applications/company
router.get('/company', protect, company, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// @route   GET /api/applications/:id
router.get('/:id', protect, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// @route   PUT /api/applications/:id/status
router.put('/:id/status', protect, company, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

// @route   POST /api/applications/:id/messages
router.post('/:id/messages', protect, (req, res) => {
  res.status(501).json({ message: 'Not implemented yet' });
});

export default router;