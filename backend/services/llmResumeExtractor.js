/**
 * LLM-based Resume Extractor
 *
 * This module uses an LLM to extract structured information from resume text.
 * It passes the raw resume text to an LLM and asks it to return skills,
 * experience, and projects as JSON objects.
 */

import { getLLMResponse } from "../utils/llm.js";

/**
 * Extract structured information from resume text using an LLM
 * @param {string} resumeText - Raw text extracted from a resume
 * @returns {Promise<Object>} - Structured resume data
 */
async function extractResumeDataWithLLM(resumeText) {
  try {
    console.log("Starting LLM-based resume extraction");

    // Define the prompt for the LLM
    const prompt = `
      Extract the following information from this resume:
      1. Skills: Technical skills mentioned (only actual technical skills, 1-3 words each)
      2. Experience entries
      3. Project details
      
      Format your response as JSON with this structure:
      {
        "skills": ["skill1", "skill2"],
        "experience": [
          {
            "title": "role",
            "company": "company name",
            "duration": "date range",
            "description": "what they did"
          }
        ],
        "projects": [
          {
            "name": "project name",
            "technologies": ["tech1", "tech2"],
            "description": "what the project was about"
          }
        ]
      }

      IMPORTANT: Return ONLY the JSON object with no markdown formatting or code blocks.

      Resume text:
      ${resumeText}
    `;

    // Call the LLM with the prompt
    let llmResponse = await getLLMResponse(prompt);

    // Remove any markdown code block formatting if present
    llmResponse = llmResponse.replace(/^```json\s*/, "").replace(/\s*```$/, "");

    // Parse the response as JSON
    try {
      const parsedData = JSON.parse(llmResponse);
      console.log("Successfully extracted resume data using LLM");
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse LLM response as JSON:", parseError);
      throw new Error("Could not parse LLM response as JSON");
    }
  } catch (error) {
    console.error("Error extracting resume data with LLM:", error);
    // Return empty data if there's an error
    return {
      skills: [],
      experience: [],
      projects: [],
    };
  }
}

/**
 * Format experience entries from LLM output to match the expected format
 * @param {Array} experiences - Array of experience objects from LLM
 * @returns {Array} - Formatted experience array
 */
function formatExperienceEntries(experiences) {
  if (!experiences || !Array.isArray(experiences)) return [];

  return experiences
    .map((exp) => {
      if (typeof exp === "object") {
        // Format experience object into a string
        const parts = [];
        if (exp.title) parts.push(exp.title);
        if (exp.company) parts.push(exp.company);
        if (exp.date) parts.push(exp.date);

        let formattedExp = parts.join(" | ");

        if (exp.description) {
          formattedExp += ": " + exp.description;
        }

        return formattedExp;
      } else if (typeof exp === "string") {
        // Already a string
        return exp;
      }
      return "";
    })
    .filter((exp) => exp.length > 0);
}

/**
 * Format project entries from LLM output to match the expected format
 * @param {Array} projects - Array of project objects from LLM
 * @returns {Array} - Formatted projects array
 */
function formatProjectEntries(projects) {
  if (!projects || !Array.isArray(projects)) return [];

  return projects
    .map((proj) => {
      if (typeof proj === "object") {
        // Format project object into a string
        const parts = [];
        if (proj.name) parts.push(proj.name);

        if (proj.technologies && Array.isArray(proj.technologies)) {
          parts.push(proj.technologies.join(", "));
        }

        let formattedProj = parts.join(" | ");

        if (proj.description) {
          formattedProj += ": " + proj.description;
        }

        return formattedProj;
      } else if (typeof proj === "string") {
        // Already a string
        return proj;
      }
      return "";
    })
    .filter((proj) => proj.length > 0);
}

/**
 * Parse resume text using LLM and format the results
 * @param {Buffer|string} pdfBuffer - PDF buffer or text content
 * @returns {Promise<Object>} - Parsed resume data
 */
async function parseResumeWithLLM(pdfBuffer) {
  try {
    let rawText = "";

    // Extract text from the PDF or use the provided text
    if (Buffer.isBuffer(pdfBuffer)) {
      try {
        // Use PDF parsing library to get text
        const pdfParse = (await import("pdf-parse")).default;
        const fallbackData = await pdfParse(pdfBuffer, {
          max: 15 * 1024 * 1024, // 15MB limit
        });

        if (
          fallbackData &&
          fallbackData.text &&
          fallbackData.text.trim().length > 0
        ) {
          rawText = fallbackData.text;
          console.log(
            "PDF parsing successful, retrieved text length:",
            rawText.length
          );
        } else {
          // If the input might already be text, try to use it directly
          rawText = pdfBuffer.toString("utf8");
          console.log("Attempting to use buffer as text directly");
        }
      } catch (pdfError) {
        console.error("Error parsing PDF:", pdfError);
        // Try to use buffer as text directly as a last resort
        try {
          rawText = pdfBuffer.toString("utf8");
          console.log("Attempting to use buffer as text directly");
        } catch (textError) {
          console.error("Failed to extract text:", textError);
          return {
            skills: [],
            experience: [],
            projects: [],
            rawText: "",
          };
        }
      }
    } else if (typeof pdfBuffer === "string") {
      // The input is already text
      rawText = pdfBuffer;
      console.log(`Using provided text content, length: ${rawText.length}`);
    } else if (pdfBuffer && typeof pdfBuffer === "object" && pdfBuffer.text) {
      // This might be the result of pdf-parse directly
      rawText = pdfBuffer.text;
      console.log(
        `Using text from pdf-parse object, length: ${rawText.length}`
      );
    } else {
      console.error("Invalid input type");
      return {
        skills: [],
        experience: [],
        projects: [],
        rawText: "",
      };
    }

    // Extract data using LLM
    const extractedData = await extractResumeDataWithLLM(rawText);

    // Format the data to match the expected output structure
    return {
      skills: extractedData.skills || [],
      experience: formatExperienceEntries(extractedData.experience || []),
      projects: formatProjectEntries(extractedData.projects || []),
      rawText,
    };
  } catch (error) {
    console.error("Error parsing resume with LLM:", error);
    return {
      skills: [],
      experience: [],
      projects: [],
      rawText: "",
    };
  }
}

export {
  parseResumeWithLLM,
  extractResumeDataWithLLM,
  formatExperienceEntries,
  formatProjectEntries,
};
