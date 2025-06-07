// Service functions for handling application operations
import api from "../utils/api";

// Get an application by ID
export const getApplicationById = async (applicationId) => {
  try {
    const response = await api.get(`/applications/${applicationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update application status
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const response = await api.put(`/applications/${applicationId}/status`, {
      status,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Send message in application thread
export const sendApplicationMessage = async (applicationId, content) => {
  try {
    const response = await api.post(`/applications/${applicationId}/messages`, {
      content,
    });
    return response.data;
  } catch (error) {
    // Add specific error message for 403 errors
    if (error.response && error.response.status === 403) {
      error.customMessage =
        "You don't have permission to send messages for this application.";
    }
    throw error;
  }
};

// Shortlist a candidate
export const shortlistCandidate = async (applicationId) => {
  try {
    const response = await api.post(`/applications/${applicationId}/shortlist`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Remove candidate from shortlist
export const removeFromShortlist = async (applicationId) => {
  try {
    const response = await api.delete(
      `/applications/${applicationId}/shortlist`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Apply for a job with screening questions
export const applyWithScreening = async (
  jobId,
  resumeId,
  coverLetter = "",
  screeningResponses = []
) => {
  try {
    // Validate required fields
    if (!jobId) {
      throw new Error("Job ID is required");
    }
    if (!resumeId) {
      throw new Error("Resume ID is required");
    }

    // Validate screening responses format
    let formattedResponses = screeningResponses;

    // If responses are strings or not properly formatted, format them
    if (screeningResponses.length > 0) {
      formattedResponses = screeningResponses.map((response) => {
        if (typeof response === "string") {
          return {
            response: response.trim(),
          };
        }

        // If it's an object but missing required fields
        if (!response || typeof response !== "object") {
          return {
            response: "",
          };
        }

        // If it has the right structure, just ensure response is trimmed
        return {
          ...response,
          response: (response.response || "").trim(),
        };
      });
    }

    // Submit application
    const response = await api.post(`/applications/${jobId}`, {
      resumeId,
      coverLetter: (coverLetter || "").trim(),
      screeningResponses: formattedResponses,
    });

    return response.data;
  } catch (error) {
    // Format error message for better user feedback
    if (error.response) {
      // Server returned an error response
      throw new Error(
        error.response.data?.message || "Failed to submit application"
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        "Network error. Please check your connection and try again."
      );
    } else {
      // Something else went wrong
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
};

// Evaluate a candidate's screening responses with AI
export const evaluateScreeningResponses = async (applicationId) => {
  try {
    const response = await api.post(
      `/applications/${applicationId}/evaluate-screening`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get LLM analysis for an application
export const getLLMAnalysis = async (applicationId) => {
  try {
    const response = await api.get(
      `/applications/${applicationId}/llm-analysis`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get matching scores for an application
export const getMatchingScores = async (applicationId) => {
  try {
    const response = await api.get(
      `/applications/${applicationId}/matching-scores`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Accept an application
export const acceptApplication = async (applicationId) => {
  try {
    const response = await api.put(`/applications/${applicationId}/accept`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reject an application
export const rejectApplication = async (applicationId) => {
  try {
    const response = await api.put(`/applications/${applicationId}/reject`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Hire a candidate
export const hireCandidate = async (applicationId) => {
  try {
    const response = await api.put(`/applications/${applicationId}/hire`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
