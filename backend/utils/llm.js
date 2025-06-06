import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Load environment variables
dotenv.config();

// Initialize Gemini API with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

/**
 * Send a prompt to the LLM and get a response
 * @param {string} prompt - The prompt to send to the LLM
 * @returns {Promise<string>} - The text response from the LLM
 */
export const getLLMResponse = async (prompt) => {
  try {
    console.log("Making request to Gemini API...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("LLM Response Error:", error);
    throw new Error(`Failed to get LLM response: ${error.message}`);
  }
};

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

    // Get LLM response using the working method
    const response = await getLLMResponse(prompt);

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
      
      Please provide a helpful and professional response in ${language} language.
    `;

    return await getLLMResponse(prompt);
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
      Translate the following text to ${targetLanguage}:
      
      ${text}
      
      Provide only the translated text with no additional explanations.
    `;

    return await getLLMResponse(prompt);
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

    return (await getLLMResponse(prompt)).trim().toLowerCase();
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
 * Evaluate a candidate's screening question responses
 * @param {Object} application - Job application with responses
 * @param {Object} job - Job posting with questions
 * @param {string} language - Preferred language for analysis
 * @returns {Promise<Object>} - Evaluation results for each response
 */
export const evaluateScreeningResponses = async (
  application,
  job,
  language = "en"
) => {
  const template = analysisTemplates[language] || analysisTemplates.en;
  const results = [];

  for (const response of application.screeningResponses) {
    const question = job.screeningQuestions.find(
      (q) => q._id.toString() === response.question.toString()
    );

    if (!question) continue;

    const prompt = `You are an AI evaluator that must output only valid JSON.
IMPORTANT: Your entire response must be a single valid JSON object with no additional text, comments, or explanations.

Evaluate this candidate's response to a job screening question:

Input Data:
- Job Position: "${job.title}"
- Question: "${question.question}"
- Response: "${response.response}"

INSTRUCTIONS:
Evaluate the response and output a JSON object with exactly these fields:
{
  "score": number between 0-100,
  "feedback": string with evaluation feedback,
  "confidence": number between 0-1,
  "flags": array of strings for concerns,
  "strengths": array of strings for positive points
}

REQUIREMENTS:
- Output must be parseable JSON
- Do not include any text before or after the JSON
- Do not include any explanations or comments
- All fields must be present`;

    try {
      const result = await getLLMResponse(prompt);
      
      // Extract JSON from the response by finding the first { and last }
      const jsonStart = result.indexOf('{');
      const jsonEnd = result.lastIndexOf('}') + 1;
      const jsonStr = result.slice(jsonStart, jsonEnd);
      
      try {
        const evaluation = JSON.parse(jsonStr);
        
        // Validate required fields
        const requiredFields = ['score', 'feedback', 'confidence', 'flags', 'strengths'];
        const missingFields = requiredFields.filter(field => !(field in evaluation));
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
        
        // Ensure score and confidence are in valid ranges
        evaluation.score = Math.max(0, Math.min(100, evaluation.score));
        evaluation.confidence = Math.max(0, Math.min(1, evaluation.confidence));
        
        results.push({
          questionId: question._id,
          evaluation: {
            score: evaluation.score,
            feedback: evaluation.feedback,
            confidence: evaluation.confidence,
            flags: evaluation.flags,
            strengths: evaluation.strengths,
          },
        });
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Raw Response:', result);
        console.error('Attempted JSON:', jsonStr);
        throw new Error('Failed to parse LLM response as JSON');
      }
    } catch (error) {
      console.error(
        `Error evaluating response for question ${question._id}:`,
        error
      );
      results.push({
        questionId: question._id,
        error: "Failed to evaluate response",
      });
    }
  }

  // Calculate overall screening score
  const validScores = results
    .filter((r) => r.evaluation?.score)
    .map((r) => r.evaluation.score);

  const overallScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
      : 0;

  return {
    responses: results,
    overallScore,
    confidence:
      results.reduce((acc, r) => acc + (r.evaluation?.confidence || 0), 0) /
      results.length,
  };
};

// Helper function to summarize all evaluations
export const generateOverallEvaluation = async (application, job) => {
  const screeningEval = await evaluateScreeningResponses(application, job);
  const resumeEval = await analyzeCandidate(application, job);

  // Calculate weighted scores
  const weights = {
    screening: 0.4,
    resume: 0.4,
    llmAnalysis: 0.2,
  };

  const totalScore = Math.round(
    screeningEval.overallScore * weights.screening +
      (application.matchingScores?.total || 0) * weights.resume +
      resumeEval.confidence * 100 * weights.llmAnalysis
  );

  // Determine recommendation strength
  let recommendationStrength = "maybe";
  if (totalScore >= 85) recommendationStrength = "strong_yes";
  else if (totalScore >= 70) recommendationStrength = "yes";
  else if (totalScore <= 30) recommendationStrength = "strong_no";
  else if (totalScore <= 50) recommendationStrength = "no";

  return {
    totalScore,
    breakdown: {
      screeningQuestionsScore: screeningEval.overallScore,
      resumeMatchScore: application.matchingScores?.total || 0,
      llmAnalysisScore: Math.round(resumeEval.confidence * 100),
    },
    flags: [
      ...new Set([
        ...screeningEval.responses.flatMap((r) => r.evaluation?.flags || []),
        ...(resumeEval.weaknesses ? ["weak_experience"] : []),
      ]),
    ],
    recommendationStrength,
    confidence: (screeningEval.confidence + resumeEval.confidence) / 2,
  };
};

export const analyzeCandidateMatch = async (job, resume) => {
  try {
    // Calculate match score based on various factors
    const skillsScore = calculateSkillsMatch(job.requiredSkills, resume.skills);
    const experienceScore = calculateExperienceMatch(
      job.experience,
      resume.experience
    );

    // Convert to 0-100 scale
    const score = Math.round((skillsScore * 0.7 + experienceScore * 0.3) * 100);

    return {
      score,
      confidence: 0.85, // Hardcoded for now since we're using deterministic matching
      reasons: generateMatchReasons(job, resume, {
        skillsScore,
        experienceScore,
      }),
    };
  } catch (error) {
    console.error("Error in LLM analysis:", error);
    return {
      score: 0,
      confidence: 0,
      reasons: ["Error analyzing match"],
    };
  }
};

const calculateSkillsMatch = (requiredSkills, candidateSkills) => {
  if (!requiredSkills || !candidateSkills) return 0;
  if (!requiredSkills.length) return 1;

  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase());
  const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase());

  const matchedSkills = normalizedRequired.filter((skill) =>
    normalizedCandidate.some((candSkill) => candSkill.includes(skill))
  );

  return matchedSkills.length / requiredSkills.length;
};

const calculateExperienceMatch = (requiredExperience, candidateExperience) => {
  if (!requiredExperience || !candidateExperience) return 0;

  const experienceLevels = {
    Entry: 0,
    Junior: 1,
    "Mid-Level": 2,
    Senior: 3,
    Executive: 4,
  };

  // Calculate years of experience from candidate's experience entries
  const totalYears = candidateExperience.reduce((total, exp) => {
    const startYear = new Date(exp.period.start).getFullYear();
    const endYear =
      exp.period.end === "Present"
        ? new Date().getFullYear()
        : new Date(exp.period.end).getFullYear();
    return total + (endYear - startYear);
  }, 0);

  const candidateLevel =
    totalYears <= 2
      ? "Entry"
      : totalYears <= 4
      ? "Junior"
      : totalYears <= 7
      ? "Mid-Level"
      : totalYears <= 10
      ? "Senior"
      : "Executive";

  const requiredLevel = experienceLevels[requiredExperience] || 0;
  const candidateLevelValue = experienceLevels[candidateLevel] || 0;

  return candidateLevelValue >= requiredLevel
    ? 1
    : 1 -
        (requiredLevel - candidateLevelValue) /
          Object.keys(experienceLevels).length;
};

const generateMatchReasons = (job, resume, scores) => {
  const reasons = [];

  // Skills match analysis
  const skillMatchPercentage = Math.round(scores.skillsScore * 100);
  reasons.push(`Candidate matches ${skillMatchPercentage}% of required skills`);

  // Experience match analysis
  if (scores.experienceScore > 0.8) {
    reasons.push("Experience level exceeds job requirements");
  } else if (scores.experienceScore > 0.5) {
    reasons.push("Experience level meets job requirements");
  } else {
    reasons.push("Experience level is below job requirements");
  }

  return reasons;
};