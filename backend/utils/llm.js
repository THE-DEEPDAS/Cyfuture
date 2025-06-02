import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// Language-specific analysis templates
const analysisTemplates = {
  en: {
    instruction: "Analyze this candidate's fit for the job position",
    strengthsLabel: "Key Strengths",
    weaknessesLabel: "Areas for Improvement",
    fitLabel: "Overall Fit",
    recommendationLabel: "Recommendation",
  },
  es: {
    instruction: "Analiza la idoneidad de este candidato para el puesto",
    strengthsLabel: "Puntos Fuertes",
    weaknessesLabel: "Áreas de Mejora",
    fitLabel: "Ajuste General",
    recommendationLabel: "Recomendación",
  },
  // Add more languages as needed
};

/**
 * Analyze a candidate's fit for a job with multi-language support
 * @param {Object} application - Job application with resume data
 * @param {Object} job - Job posting details
 * @param {string} language - Preferred language for analysis
 * @returns {Promise<Object>} - Detailed analysis with scores and explanations
 */
export const analyzeCandidate = async (application, job, language = "en") => {
  try {
    const template = analysisTemplates[language] || analysisTemplates.en;
    const candidateData = application.resume.parsedData;

    // Create a structured analysis prompt
    const prompt = `
      ${template.instruction}:

      JOB REQUIREMENTS:
      Title: ${job.title}
      Required Skills: ${job.requiredSkills.join(", ")}
      Experience Needed: ${
        job.requirements?.experience || "Not specified"
      } years
      Education: ${job.requirements?.education?.level || "Not specified"}
      
      CANDIDATE PROFILE:
      Skills: ${candidateData.skills.join(", ")}
      Experience: ${formatExperience(candidateData.experience)}
      Education: ${formatEducation(candidateData.education)}
      Projects: ${formatProjects(candidateData.projects)}

      Provide a detailed analysis with the following structure:
      1. ${template.strengthsLabel}
      2. ${template.weaknessesLabel}
      3. ${template.fitLabel}
      4. ${template.recommendationLabel}

      Focus on specific examples and provide clear rationale for your assessment.
      If possible, suggest potential interview questions based on any gaps or areas that need clarification.
    `;

    // Get LLM response
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Parse the structured response
    const analysis = parseStructuredResponse(response, template);

    return {
      ...analysis,
      language,
      confidence: calculateConfidenceScore(analysis),
      suggestedQuestions: extractSuggestedQuestions(response),
    };
  } catch (error) {
    console.error("LLM Analysis Error:", error);
    throw new Error("Failed to analyze candidate fit");
  }
};

/**
 * Format experience data for LLM prompt
 */
const formatExperience = (experience = []) => {
  return experience
    .map(
      (exp) =>
        `${exp.title} at ${exp.company} (${exp.startDate} - ${
          exp.endDate || "Present"
        }): ${exp.description}`
    )
    .join("\n");
};

/**
 * Format education data for LLM prompt
 */
const formatEducation = (education = []) => {
  return education
    .map((edu) => `${edu.degree} from ${edu.institution} (${edu.field})`)
    .join("\n");
};

/**
 * Format projects data for LLM prompt
 */
const formatProjects = (projects = []) => {
  return projects.map((proj) => `${proj.name}: ${proj.description}`).join("\n");
};

/**
 * Parse the structured response from LLM
 */
const parseStructuredResponse = (response, template) => {
  const sections = response.split(/\d\./g).filter(Boolean);

  return {
    strengths: sections[0]?.trim() || "",
    weaknesses: sections[1]?.trim() || "",
    overallFit: sections[2]?.trim() || "",
    recommendation: sections[3]?.trim() || "",
  };
};

/**
 * Calculate a confidence score based on the analysis
 */
const calculateConfidenceScore = (analysis) => {
  // Implementation of confidence scoring based on analysis completeness and specificity
  let score = 100;

  if (!analysis.strengths) score -= 25;
  if (!analysis.weaknesses) score -= 25;
  if (!analysis.overallFit) score -= 25;
  if (!analysis.recommendation) score -= 25;

  return score;
};

/**
 * Extract suggested interview questions from the LLM response
 */
const extractSuggestedQuestions = (response) => {
  const questionMatch = response.match(/Questions?:([\s\S]+?)(?=\n\n|$)/i);
  if (!questionMatch) return [];

  return questionMatch[1]
    .split(/\n/)
    .map((q) => q.trim())
    .filter((q) => q && q.includes("?"));
};

/**
 * Generate a chat response for user messages
 * @param {string} context - Previous conversation context
 * @param {string} message - User's message
 * @param {string} language - Language code (e.g., 'en', 'es', 'fr')
 * @returns {Promise<string>} - AI response
 */
export const generateChatResponse = async (
  context,
  message,
  language = "en"
) => {
  try {
    const prompt = `
      Context: You are a helpful AI assistant for a job application platform.
      Previous context: ${context}
      User message: ${message}
      
      Please provide a helpful and professional response in ${getLanguageName(
        language
      )} language.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Chat Response Error:", error);
    throw new Error("Failed to generate chat response");
  }
};

/**
 * Translate text to a specified language
 * @param {string} text - Text to translate
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<string>} - Translated text
 */
export const translateText = async (text, targetLanguage) => {
  try {
    const prompt = `
      Translate the following text to ${getLanguageName(targetLanguage)}:
      
      ${text}
      
      Provide only the translated text with no additional explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Translation Error:", error);
    throw new Error("Failed to translate text");
  }
};

/**
 * Detect the language of input text
 * @param {string} text - Text to analyze
 * @returns {Promise<string>} - Detected language code
 */
export const detectLanguage = async (text) => {
  try {
    const prompt = `
      Detect the language of the following text and return ONLY the ISO 639-1 language code (e.g., 'en' for English, 'es' for Spanish, etc.):
      
      ${text}
      
      Respond with only the two-letter language code and nothing else.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim().toLowerCase();
  } catch (error) {
    console.error("Language Detection Error:", error);
    return "en"; // Default to English if detection fails
  }
};

/**
 * Format job description for a specific locale
 * @param {Object} job - Job data
 * @param {string} targetLanguage - Target language code
 * @returns {Promise<Object>} - Job with translated fields
 */
export const localizeJobDescription = async (job, targetLanguage) => {
  if (targetLanguage === "en") return job; // Skip translation for English

  try {
    // Translate main fields
    const [title, description] = await Promise.all([
      translateText(job.title, targetLanguage),
      translateText(job.description, targetLanguage),
    ]);

    // Create a new object with translated fields
    return {
      ...job,
      title,
      description,
    };
  } catch (error) {
    console.error("Job Localization Error:", error);
    return job; // Return original job if translation fails
  }
};

/**
 * Get full language name from code
 * @param {string} code - ISO 639-1 language code
 * @returns {string} - Full language name
 */
const getLanguageName = (code) => {
  const languages = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    zh: "Chinese",
    ja: "Japanese",
    ko: "Korean",
    ar: "Arabic",
    hi: "Hindi",
  };

  return languages[code] || "English";
};

export default {
  analyzeCandidate,
  generateChatResponse,
  translateText,
  detectLanguage,
  localizeJobDescription,
};
