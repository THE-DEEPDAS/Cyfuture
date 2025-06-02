import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

/**
 * Analyze a candidate's fit for a job
 * @param {string} jobDescription - Full job description
 * @param {Object} candidateData - Parsed resume data
 * @param {string} language - Language code (e.g., 'en', 'es', 'fr')
 * @returns {Promise<Object>} - Analysis with score and rationale
 */
export const analyzeCandidate = async (
  jobDescription,
  candidateData,
  language = "en"
) => {
  try {
    // Extract job requirements for more focused matching
    const jobRequirements = jobDescription.includes("Requirements")
      ? jobDescription.split("Requirements")[1]
      : jobDescription;

    // Create a more structured prompt for better analysis
    const prompt = `
      You are an expert AI recruiter tasked with evaluating candidate-job fit. Analyze the following data carefully:

      ## JOB DESCRIPTION ##
      ${jobDescription}

      ## CANDIDATE INFORMATION ##
      Skills: ${candidateData.skills.join(", ")}
      
      Experience:
      ${candidateData.experience
        .map(
          (exp) =>
            `- ${exp.title} at ${exp.company}, ${exp.startDate} - ${exp.endDate}: ${exp.description}`
        )
        .join("\n")}
      
      Education:
      ${candidateData.education
        .map(
          (edu) =>
            `- ${edu.degree} in ${edu.field} from ${edu.institution}, ${edu.graduationYear}`
        )
        .join("\n")}

      ## EVALUATION INSTRUCTIONS ##
      1. Perform a structured analysis of this candidate for the job position
      2. Consider these key factors:
         - Skills match (weight: 40%)
         - Experience relevance (weight: 35%)
         - Education fit (weight: 15%)
         - Overall profile completeness (weight: 10%)
      3. For each factor, provide:
         - A score from 0-100
         - Brief justification (1-2 sentences)
      4. Provide an overall weighted match score (0-100)
      5. List 3 key strengths and 2 potential gaps
      
      ## OUTPUT FORMAT ##
      Return your analysis in the following JSON format:
      {
        "factorScores": {
          "skills": {"score": number, "justification": "string"},
          "experience": {"score": number, "justification": "string"},
          "education": {"score": number, "justification": "string"},
          "profileCompleteness": {"score": number, "justification": "string"}
        },
        "overallScore": number,
        "strengths": ["string", "string", "string"],
        "gaps": ["string", "string"],
        "summary": "string"
      }

      Respond in ${getLanguageName(language)} language.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    try {
      // Try to parse the JSON response
      const jsonStartIndex = text.indexOf("{");
      const jsonEndIndex = text.lastIndexOf("}") + 1;
      const jsonText = text.substring(jsonStartIndex, jsonEndIndex);
      const parsedResponse = JSON.parse(jsonText);

      // Calculate the overall score if not provided or as a fallback
      const overallScore =
        parsedResponse.overallScore ||
        calculateWeightedScore(parsedResponse.factorScores);

      // Construct the analysis result
      const analysis = {
        matchScore: Math.round(overallScore),
        factorScores: parsedResponse.factorScores || {},
        strengths: parsedResponse.strengths || [],
        gaps: parsedResponse.gaps || [],
        summary: parsedResponse.summary || "",
        rationale: text,
      };

      return analysis;
    } catch (parseError) {
      // Fallback if JSON parsing fails
      console.error("Error parsing LLM response:", parseError);
      return {
        matchScore: extractScore(text),
        rationale: text,
      };
    }
  } catch (error) {
    console.error("LLM Analysis Error:", error);
    throw new Error("Failed to analyze candidate fit");
  }
};

// Helper function to calculate weighted score from factor scores
const calculateWeightedScore = (factorScores) => {
  if (!factorScores) return 0;

  const weights = {
    skills: 0.4,
    experience: 0.35,
    education: 0.15,
    profileCompleteness: 0.1,
  };

  let totalScore = 0;
  let weightSum = 0;

  for (const [factor, weight] of Object.entries(weights)) {
    if (factorScores[factor] && factorScores[factor].score !== undefined) {
      totalScore += factorScores[factor].score * weight;
      weightSum += weight;
    }
  }

  return weightSum > 0 ? totalScore / weightSum : 0;
};

// Helper function to extract score from LLM response
const extractScore = (text) => {
  // This is a simple implementation - you might want to make it more robust
  const scoreMatch = text.match(/\b([0-9]{1,3})\b/);
  return scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 0;
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
