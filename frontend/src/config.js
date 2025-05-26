// API base URL - Configurable for different environments
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Cloudinary configuration
export const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'resumes';
export const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'your_cloud_name';
export const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`;

// Available job types and experience levels for forms and filters
export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'];
export const EXPERIENCE_LEVELS = ['Entry-level', 'Mid-level', 'Senior', 'Executive'];

// Application status options
export const APPLICATION_STATUSES = ['Applied', 'Shortlisted', 'Rejected', 'Interviewing', 'Hired'];

// Message types
export const MESSAGE_TYPES = ['Invite', 'Rejection', 'Information', 'Other'];

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' },
];

// Default chatbot questions
export const DEFAULT_CHATBOT_QUESTIONS = [
  { question: 'What is your availability to start?', isRequired: true },
  { question: 'Do you have a preferred work location?', isRequired: true },
  { question: 'Are you willing to relocate?', isRequired: false },
  { question: 'What are your salary expectations?', isRequired: true },
];