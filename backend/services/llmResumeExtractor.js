/**
 * LLM-based Resume Extractor
 * 
 * This module uses an LLM to extract structured information from resume text.
 * It passes the raw resume text to an LLM and asks it to return skills, 
 * experience, and projects as JSON objects.
 */

import { getLLMResponse } from '../utils/llm.js';

/**
 * Extract structured information from resume text using an LLM
 * @param {string} resumeText - Raw text extracted from a resume
 * @returns {Promise<Object>} - Structured resume data
 */
async function extractResumeDataWithLLM(resumeText) {
  try {
    console.log("Starting LLM-based resume extraction");
    
    // Define the prompt for the LLM
    const prompt = `You are a resume parsing assistant that must output ONLY valid JSON.
STRICT REQUIREMENTS:
- Output must be a single valid JSON object
- Do not include any text or comments before or after the JSON
- Do not include any explanations
- All fields must be present in the output
- Each skill should be 1-3 words maximum
- Try to extract as many skills as possible

Parse the following resume text and output a JSON object with exactly this structure:
{
  "skills": [
    "skill1",
    "skill2"
  ],
  "experience": [
    {
      "title": "exact job title",
      "company": "company name",
      "startDate": "YYYY-MM or YYYY",
      "endDate": "YYYY-MM or YYYY or null if current",
      "description": "role description"
    }
  ],
  "projects": [
    {
      "name": "project name",
      "technologies": ["tech1", "tech2"],
      "description": "project description"
    }
  ]
}

Resume text to parse:
${resumeText}`;

    // Call the LLM with the prompt
    const llmResponse = await getLLMResponse(prompt);
    
    // Extract JSON from the response
    const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON object found in LLM response");
      throw new Error("No JSON object found in LLM response");
    }

    try {
      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const requiredFields = ['skills', 'experience', 'projects'];
      const missingFields = requiredFields.filter(field => !(field in parsedData));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Validate data types
      if (!Array.isArray(parsedData.skills)) throw new Error('Skills must be an array');
      if (!Array.isArray(parsedData.experience)) throw new Error('Experience must be an array');
      if (!Array.isArray(parsedData.projects)) throw new Error('Projects must be an array');

      console.log("Successfully extracted resume data using LLM");
      return parsedData;
    } catch (parseError) {
      console.error("Failed to parse or validate LLM response:", parseError);
      console.error("Raw Response:", llmResponse);
      throw new Error("Failed to parse valid JSON from LLM response");
    }
  } catch (error) {
    console.error("Error extracting resume data with LLM:", error);
    // Return empty data structure if there's an error
    return {
      skills: [],
      experience: [],
      projects: []
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
  
  return experiences.map(exp => {
    if (typeof exp === 'object') {
      // Format experience object into a string
      const parts = [];
      if (exp.title) parts.push(exp.title);
      if (exp.company) parts.push(exp.company);
      if (exp.date) parts.push(exp.date);
      
      let formattedExp = parts.join(' | ');
      
      if (exp.description) {
        formattedExp += ': ' + exp.description;
      }
      
      return formattedExp;
    } else if (typeof exp === 'string') {
      // Already a string
      return exp;
    }
    return '';
  }).filter(exp => exp.length > 0);
}

/**
 * Format project entries from LLM output to match the expected format
 * @param {Array} projects - Array of project objects from LLM
 * @returns {Array} - Formatted projects array
 */
function formatProjectEntries(projects) {
  if (!projects || !Array.isArray(projects)) return [];
  
  return projects.map(proj => {
    if (typeof proj === 'object') {
      // Format project object into a string
      const parts = [];
      if (proj.name) parts.push(proj.name);
      
      if (proj.technologies && Array.isArray(proj.technologies)) {
        parts.push(proj.technologies.join(', '));
      }
      
      let formattedProj = parts.join(' | ');
      
      if (proj.description) {
        formattedProj += ': ' + proj.description;
      }
      
      return formattedProj;
    } else if (typeof proj === 'string') {
      // Already a string
      return proj;
    }
    return '';
  }).filter(proj => proj.length > 0);
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
        const pdfParse = (await import('pdf-parse')).default;
        const fallbackData = await pdfParse(pdfBuffer, {
          max: 15 * 1024 * 1024, // 15MB limit
        });

        if (fallbackData && fallbackData.text && fallbackData.text.trim().length > 0) {
          rawText = fallbackData.text;
          console.log("PDF parsing successful, retrieved text length:", rawText.length);
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
      console.log(`Using text from pdf-parse object, length: ${rawText.length}`);
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
      rawText
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
  formatProjectEntries
};
