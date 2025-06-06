import { parseResumeText } from "./simplifiedResumeParser.js";
import { parseResumeWithLLM } from "./llmResumeExtractor.js";

// Tracking LLM API availability to avoid repeated failures
let llmApiAvailable = true;
let lastLlmApiCheck = 0;
const LLM_API_RETRY_INTERVAL = 60 * 60 * 1000; // 1 hour

/**
 * Parse a resume using the LLM-based approach with fallback to traditional parsing
 * @param {Buffer|string} pdfBuffer - PDF buffer or text content
 * @returns {Promise<Object>} - Parsed resume data
 */
export const parseResume = async (pdfBuffer) => {
  const currentTime = Date.now();
  
  // If LLM API was unavailable, only retry after a certain interval
  if (!llmApiAvailable && (currentTime - lastLlmApiCheck < LLM_API_RETRY_INTERVAL)) {
    console.log("Skipping LLM parsing due to previous API availability issues, using traditional parsing...");
    return await parseResumeText(pdfBuffer);
  }
  
  try {
    console.log("Attempting to parse resume with LLM...");
    // First try the LLM-based approach
    const llmResults = await parseResumeWithLLM(pdfBuffer);
    
    // Check if LLM parsing was successful (has skills)
    if (llmResults.skills && llmResults.skills.length > 0) {
      console.log(`LLM parsing successful: Found ${llmResults.skills.length} skills, ${llmResults.experience.length} experiences, ${llmResults.projects.length} projects`);
      // Update API status tracking
      llmApiAvailable = true;
      lastLlmApiCheck = currentTime;
      return llmResults;
    }
    
    // If LLM parsing failed to extract skills, fall back to traditional parsing
    console.log("LLM parsing did not return skills, falling back to traditional parsing...");
    return await parseResumeText(pdfBuffer);
  } catch (error) {
    // Check if the error is related to API key/availability
    if (error.message && (
        error.message.includes("API key") || 
        error.message.includes("Failed to get LLM response") ||
        error.message.includes("API_KEY_INVALID")
      )) {
      console.error("LLM API appears to be unavailable:", error.message);
      // Update API status tracking
      llmApiAvailable = false;
      lastLlmApiCheck = currentTime;
    } else {
      console.error("Error in LLM resume parsing:", error);
    }
    
    // Fall back to traditional parsing
    console.log("Falling back to traditional parsing...");
    return await parseResumeText(pdfBuffer);
  }
};
