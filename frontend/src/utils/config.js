// Get the API URL from environment or default to local development
export const getApiUrl = () => {
  // For production, this should be configured in your hosting environment
  return process.env.REACT_APP_API_URL || 'http://localhost:5000';
};

// Job types
export const JOB_TYPES = [
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Remote'
];

// Experience levels
export const EXPERIENCE_LEVELS = [
  'Entry Level',
  '1-2 years',
  '3-5 years',
  '5-7 years',
  '7+ years',
  'Senior Level',
  'Executive'
];

// Application statuses
export const APPLICATION_STATUSES = [
  'Pending',
  'Reviewed',
  'Shortlisted',
  'Rejected',
  'Hired'
];

// Languages
export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'ru', name: 'Russian' }
];

// Format salary range
export const formatSalary = (min, max, currency = 'USD') => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  });
  
  if (min && max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`;
  } else if (min) {
    return `${formatter.format(min)}+`;
  } else if (max) {
    return `Up to ${formatter.format(max)}`;
  }
  
  return 'Not specified';
};

// Format date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Calculate days ago
export const daysAgo = (date) => {
  const days = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
  
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  
  return `${days} days ago`;
};