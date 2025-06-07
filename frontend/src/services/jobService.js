import api from "../utils/api";

// API endpoint constants
const API_ENDPOINTS = {
  jobs: {
    base: "/jobs",
    list: "/jobs",
    details: (id) => `/jobs/${id}`,
    apply: (id) => `/jobs/${id}/apply`,
    matchScore: (jobId, candidateId) =>
      `/jobs/${jobId}/match-score/${candidateId}`,
    search: (query) => `/jobs/search?q=${encodeURIComponent(query)}`,
    filters: "/jobs/filters",
    company: {
      list: "/jobs/company/me",
      stats: "/jobs/company/stats",
    },
  },
  applications: {
    base: "/applications",
    list: "/applications",
    candidate: "/applications/candidate",
    messages: (id) => `/applications/${id}/messages`,
    status: (id) => `/applications/${id}/status`,
    track: (id) => `/applications/${id}/track`,
    feedback: (id) => `/applications/${id}/feedback`,
  },
};

const handleApiError = (error) => {
  if (error.response) {
    // Server responded with an error
    if (error.response.status === 400) {
      throw new Error(
        error.response.data.message ||
          "Please check all required fields and try again"
      );
    } else if (error.response.status === 404) {
      throw new Error("This position is no longer available");
    } else if (error.response.status === 403) {
      throw new Error("You don't have permission to apply for this job");
    } else {
      throw new Error(
        error.response.data.message ||
          "An error occurred while submitting your application"
      );
    }
  } else if (error.message?.includes("already applied")) {
    throw error; // Pass through the duplicate application error
  } else {
    throw new Error(
      "Network error. Please check your connection and try again"
    );
  }
};

const formatSalaryRange = (min, max, currency = "USD") => {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  });
  return `${formatter.format(min)} - ${formatter.format(max)}`;
};

// API service functions
const jobService = {
  async getJobs() {
    try {
      const response = await api.get(API_ENDPOINTS.jobs.list);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getJobById(id) {
    try {
      const response = await api.get(API_ENDPOINTS.jobs.details(id));
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getCompanyJobs() {
    try {
      const response = await api.get(API_ENDPOINTS.jobs.company.list);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async applyToJob(jobId, applicationData) {
    try {
      const response = await api.post(
        API_ENDPOINTS.jobs.apply(jobId),
        applicationData
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getJobMatchScore(jobId, candidateId) {
    try {
      const response = await api.get(
        API_ENDPOINTS.jobs.matchScore(jobId, candidateId)
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async searchJobs(query, filters = {}) {
    try {
      const queryString = new URLSearchParams({
        q: query,
        ...filters,
      }).toString();
      const response = await api.get(
        `${API_ENDPOINTS.jobs.search("").split("?")[0]}?${queryString}`
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getJobFilters() {
    try {
      const response = await api.get(API_ENDPOINTS.jobs.filters);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async getCompanyJobStats() {
    try {
      const response = await api.get(API_ENDPOINTS.jobs.company.stats);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async trackApplication(applicationId) {
    try {
      const response = await api.get(
        API_ENDPOINTS.applications.track(applicationId)
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  async submitApplicationFeedback(applicationId, feedback) {
    try {
      const response = await api.post(
        API_ENDPOINTS.applications.feedback(applicationId),
        feedback
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
};

export default jobService;

// Format salary range with currency
export const formatSalary = (salaryObj) => {
  if (!salaryObj || (!salaryObj.min && !salaryObj.max))
    return "Salary not specified";

  try {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: salaryObj.currency || "USD",
      maximumFractionDigits: 0,
    });

    if (salaryObj.min && salaryObj.max) {
      return `${formatter.format(salaryObj.min)} - ${formatter.format(
        salaryObj.max
      )}`;
    } else if (salaryObj.min) {
      return `From ${formatter.format(salaryObj.min)}`;
    } else if (salaryObj.max) {
      return `Up to ${formatter.format(salaryObj.max)}`;
    }
  } catch (error) {
    console.error("Error formatting salary:", error);
    return "Salary not specified";
  }
};

// Retry wrapper for API calls
const withRetry = async (apiCall, maxRetries = 3) => {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      if (!error.response || error.response.status >= 500) {
        // Only retry on network errors or server errors
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  throw lastError;
};

// Helper function to ensure consistent API paths
const sanitizePath = (path) => {
  // Remove any duplicate /api prefixes
  let cleanPath = path
    .replace(/^\/api\/api\//, "/api/")
    .replace(/^\/api\//, "/");
  // Ensure path starts with /
  if (!cleanPath.startsWith("/")) {
    cleanPath = `/${cleanPath}`;
  }
  return cleanPath;
};

// Update all API calls to use sanitizePath
const callApi = async (method, path, data = null) => {
  try {
    const config = { method, url: sanitizePath(path) };
    if (data) {
      config.data = data;
    }
    const response = await api(config);
    return response.data;
  } catch (error) {
    return handleApiError(error);
  }
};

// Apply for a job
export const applyForJob = async (
  jobId,
  resumeId,
  coverLetter = "",
  screeningResponses = []
) => {
  try {
    // Validate required parameters
    if (!jobId) {
      throw new Error("Job ID is required");
    }

    if (!resumeId) {
      throw new Error("Resume ID is required");
    }

    // First check if already applied using retry wrapper
    const checkApplication = async () => {
      try {
        const applications = await callApi(
          "get",
          API_ENDPOINTS.applications.candidate
        );
        return applications?.some((app) => app?.job?._id === jobId);
      } catch (error) {
        if (error.response?.status === 404) {
          return false; // No applications found
        }
        console.warn("Error checking applications:", error);
        return false; // Continue with application if check fails
      }
    };

    try {
      const alreadyApplied = await withRetry(checkApplication);
      if (alreadyApplied) {
        throw new Error("You have already applied for this job");
      }
    } catch (checkError) {
      console.warn("Error during application check:", checkError);
      // Continue anyway to avoid blocking legitimate applications
    }

    // Submit application
    console.log(`Applying to job ${jobId} with resume ${resumeId}`);
    const data = await callApi("post", API_ENDPOINTS.jobs.apply(jobId), {
      resumeId,
      coverLetter,
      screeningResponses,
    });

    return data;
  } catch (error) {
    console.error("Application error:", error);
    throw error; // Let the caller handle the error
  }
};

// Fetch jobs with filters
export const fetchJobsWithFilters = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.location) params.append("location", filters.location);
    if (filters.industry) params.append("industry", filters.industry);
    if (filters.type) params.append("type", filters.type);
    if (filters.experience) params.append("experience", filters.experience);
    if (filters.skills?.length)
      params.append("skills", filters.skills.join(","));

    return await callApi(
      "get",
      `${API_ENDPOINTS.jobs.list}?${params.toString()}`
    );
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error;
  }
};

// Get style for match score
export const getMatchScoreStyle = (score) => {
  if (score >= 85) return { color: "text-green-500", text: "Excellent Match" };
  if (score >= 70) return { color: "text-yellow-500", text: "Good Match" };
  if (score >= 50) return { color: "text-orange-500", text: "Moderate Match" };
  return { color: "text-red-500", text: "Low Match" };
};

// Format date in a consistent way
export const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

// Get match score for job and resume
export const getJobMatchScore = async (jobId, candidateId) => {
  try {
    const data = await callApi(
      "get",
      API_ENDPOINTS.jobs.matchScore(jobId, candidateId)
    );
    return data.score;
  } catch (error) {
    console.error("Error calculating match score:", error);
    throw error;
  }
};

// Get application messages
export const getApplicationMessages = async (applicationId) => {
  try {
    const data = await callApi(
      "get",
      API_ENDPOINTS.applications.messages(applicationId)
    );
    return data.messages;
  } catch (error) {
    console.error("Error getting application messages:", error);
    throw error;
  }
};

// Send message in application
export const sendApplicationMessage = async (
  applicationId,
  content,
  senderId
) => {
  try {
    const data = await callApi(
      "post",
      API_ENDPOINTS.applications.messages(applicationId),
      {
        content,
        senderId,
        timestamp: new Date().toISOString(),
      }
    );
    return data.message;
  } catch (error) {
    console.error("Error sending application message:", error);
    throw error;
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    return await callApi(
      "put",
      API_ENDPOINTS.applications.status(applicationId),
      { status }
    );
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};

// Calculate match score between job and candidate
export const calculateMatchScore = (job, userSkills = [], filters = {}) => {
  const weights = {
    skills: 0.35,
    location: 0.15,
    experience: 0.2,
    industry: 0.1,
    workType: 0.1,
  };

  let score = 0;

  // Skills match
  if (Array.isArray(job.requiredSkills) && Array.isArray(userSkills)) {
    const matchedSkills = userSkills.filter((skill) =>
      job.requiredSkills.some((jobSkill) =>
        jobSkill.toLowerCase().includes(skill.toLowerCase())
      )
    );
    score +=
      (matchedSkills.length / Math.max(userSkills.length, 1)) *
      weights.skills *
      100;
  }

  // Location match
  if (filters.location && job.location) {
    if (job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      score += weights.location * 100;
    }
  }

  // Experience match
  if (filters.experience && job.experience) {
    if (job.experience.toLowerCase() === filters.experience.toLowerCase()) {
      score += weights.experience * 100;
    }
  }

  // Industry match
  if (filters.industry && job.company?.industry) {
    if (job.company.industry.toLowerCase() === filters.industry.toLowerCase()) {
      score += weights.industry * 100;
    }
  }

  // Work type match
  if (filters.workType && job.workType) {
    if (job.workType === filters.workType) {
      score += weights.workType * 100;
    }
  }

  return Math.round(score);
};
