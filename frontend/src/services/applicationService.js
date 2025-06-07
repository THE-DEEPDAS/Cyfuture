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
    // Validate inputs
    if (!jobId) throw new Error("Job ID is required");
    if (!resumeId) throw new Error("Resume ID is required");

    // Format screening responses if needed
    const formattedResponses = screeningResponses.map((response) => {
      // If it's already in the right format, return as is
      if (response.question && response.response !== undefined) {
        return response;
      }

      // If it's a string, assume we need the question ID which should be at the same index
      return {
        question:
          typeof response.question === "string" ? response.question : null,
        response:
          typeof response === "string" ? response : response.response || "",
      };
    });

    // Submit application
    const response = await api.post(`/applications/${jobId}`, {
      resumeId,
      coverLetter,
      screeningResponses: formattedResponses,
    });

    return response.data;
  } catch (error) {
    throw error;
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
