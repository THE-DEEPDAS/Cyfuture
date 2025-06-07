// Intelligent Interview Service
// This service handles the automated interview process and response evaluation
import { generateChatResponse } from "../utils/llm.js";
import Application from "../models/Application.js";

// Cache for interview responses
const interviewCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

// Add custom formatting for AI messages to ensure readability
const formatAIResponse = (response) => {
  // Format questions into a more readable structure
  return response
    .replace(/(\d+\.\s*[^.!?]+[.!?])\s*/g, "$1\n\n") // Add extra newline after numbered points
    .replace(/(\n{3,})/g, "\n\n") // Normalize multiple newlines
    .trim();
};

/**
 * Generates initial interview questions based on job details
 * @param {Object} job - Job details
 * @returns {String} - AI-generated introduction and questions
 */
export const generateInitialInterview = async (job) => {
  const prompt = `
    You are an AI interviewer for a job position. Please create an engaging introduction and set of questions
    for a candidate applying to this position:
    
    Job Title: "${job?.title || "unknown position"}"
    Company: "${job?.company?.companyName || "unknown company"}"
    Job Description: ${job?.description || "Not provided"}
    Required Skills: ${job?.requiredSkills?.join(", ") || "Not specified"}
    Experience Level: ${job?.experience?.years || "Not specified"} years in ${
    job?.experience?.field || "relevant field"
  }
    
    Your response should include:
    1. A friendly introduction as an AI interviewer (1-2 sentences)
    2. A brief explanation that this is an automated interview (1 sentence)
    3. 3-4 relevant interview questions

    Format your response with:
    - Clear spacing between introduction and questions
    - Numbered questions (1., 2., etc.)
    - Each question on a new line
    - Questions that assess both technical skills and job fit

    Make sure each question is specific and focuses on different aspects:
    - Technical skills and experience
    - Problem-solving abilities
    - Role-specific scenarios
    - Behavioral questions
    
    End with a brief encouraging note.
  `;

  const cacheKey = `initial-interview-${job._id}`;
  if (interviewCache.has(cacheKey)) {
    return formatAIResponse(interviewCache.get(cacheKey));
  }

  try {
    const response = await generateChatResponse(prompt, "", "en");
    const formattedResponse = formatAIResponse(response);
    interviewCache.set(cacheKey, formattedResponse);

    // Set cache expiration
    setTimeout(() => {
      interviewCache.delete(cacheKey);
    }, CACHE_TTL);

    return formattedResponse;
  } catch (error) {
    console.error("Error generating initial interview:", error);
    return "Hello! I'm the AI interviewer for this position. Let's start with a simple question: Could you tell me about your relevant experience and skills for this role?";
  }
};

/**
 * Evaluates a candidate's response and generates a follow-up question
 * @param {Object} application - The job application
 * @param {String} candidateResponse - The candidate's latest response
 * @param {Array} messageHistory - Previous messages in the conversation
 * @returns {Object} - Evaluation results and follow-up question
 */
export const evaluateCandidateResponse = async (
  application,
  candidateResponse,
  messageHistory
) => {
  // Format the message history for context
  const formattedHistory = messageHistory
    .slice(-5)
    .map((m) => `${m.sender}: ${m.content}`)
    .join("\n");

  const job = application.job;

  const prompt = `
    You are an AI interviewer evaluating a candidate for a job position.
    
    Job Title: "${job?.title || "unknown position"}"
    Company: "${job?.company?.companyName || "unknown company"}"
    Job Description: ${job?.description || "Not provided"}
    Required Skills: ${job?.requiredSkills?.join(", ") || "Not specified"}
    
    Recent conversation:
    ${formattedHistory}
    
    Candidate's latest response: "${candidateResponse}"
    
    Please:
    1. Evaluate how well this response demonstrates the candidate's qualifications for the role
    2. Provide a score (0-100) based on relevance, clarity, and job fit
    3. Generate a natural follow-up question that probes deeper or explores a different relevant aspect
    4. Format your follow-up question to be clearly visible and engaging
    
    Return your response in JSON format:
    {
      "evaluation": "Brief analysis of the response (2-3 sentences)",
      "score": 85,
      "followUpQuestion": "Your follow-up question here? Make it specific and relevant to the job requirements."
    }
  `;

  const cacheKey = `response-eval-${
    application._id
  }-${candidateResponse.substring(0, 50)}`;
  if (interviewCache.has(cacheKey)) {
    return interviewCache.get(cacheKey);
  }

  try {
    const aiResponse = await generateChatResponse(prompt, "", "en");
    let result;

    try {
      // Try to extract JSON from the response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      result = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

      if (!result) {
        // Use regex to extract parts if JSON parsing fails
        const scoreMatch = aiResponse.match(/score["']?\s*:\s*(\d+)/i);
        const evaluationMatch = aiResponse.match(
          /evaluation["']?\s*:\s*["']([^"']+)["']/i
        );
        const questionMatch = aiResponse.match(
          /followUpQuestion["']?\s*:\s*["']([^"']+)["']/i
        );

        result = {
          evaluation: evaluationMatch
            ? evaluationMatch[1]
            : "Response evaluated.",
          score: scoreMatch ? parseInt(scoreMatch[1]) : 70,
          followUpQuestion: questionMatch
            ? questionMatch[1]
            : "Can you tell me more about your experience?",
        };
      }
    } catch (parseError) {
      console.error("Error parsing AI evaluation:", parseError);
      result = {
        evaluation: "Your response has been noted.",
        score: 70,
        followUpQuestion:
          "Can you elaborate on your skills and experience related to this position?",
      };
    }

    // Cap score between 0 and 100
    result.score = Math.min(100, Math.max(0, result.score));

    interviewCache.set(cacheKey, result);

    // Set cache expiration
    setTimeout(() => {
      interviewCache.delete(cacheKey);
    }, CACHE_TTL);

    return result;
  } catch (error) {
    console.error("Error evaluating candidate response:", error);
    return {
      evaluation: "Your response has been recorded.",
      score: 70,
      followUpQuestion:
        "Could you tell me more about how your skills align with this position?",
    };
  }
};

/**
 * Updates application match score based on interview responses
 * @param {Object} application - The job application
 * @param {Array} evaluations - Array of response evaluations
 * @returns {Number} - Updated match score
 */
export const updateMatchScoreFromInterview = async (
  application,
  evaluations
) => {
  if (!evaluations || evaluations.length === 0) {
    return application.matchScore;
  }

  // Calculate average interview score
  const avgInterviewScore =
    evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0) /
    evaluations.length;

  // Get current match score or default to 60
  const currentMatchScore = application.matchScore || 60;

  // Blend scores - 70% current match score, 30% interview score
  const updatedScore = Math.round(
    currentMatchScore * 0.7 + avgInterviewScore * 0.3
  );

  // Update application
  application.matchScore = updatedScore;
  application.interviewEvaluation = {
    avgScore: Math.round(avgInterviewScore),
    evaluations: evaluations.map((e) => ({
      evaluation: e.evaluation,
      score: e.score,
    })),
    updatedAt: new Date(),
  };

  await application.save();
  return updatedScore;
};

/**
 * Generates an explanation for a rejection decision
 * @param {Object} job - Job details
 * @param {Object} candidate - Candidate details
 * @param {Number} matchScore - Match score
 * @returns {String} - Explanation for rejection
 */
export const generateRejectionExplanation = async (
  job,
  candidate,
  matchScore
) => {
  const prompt = `
    You are an AI assistant helping a hiring manager provide constructive feedback to a rejected job candidate.
    
    Job Details:
    - Title: ${job.title}
    - Required Skills: ${job.requiredSkills?.join(", ") || "Not specified"}
    - Experience Needed: ${job.experience?.years || "Not specified"} years in ${
    job.experience?.field || "relevant field"
  }
    - Education Required: ${job.education?.level || "Not specified"} in ${
    job.education?.field || "relevant field"
  }
    
    Candidate Profile:
    - Skills: ${candidate.skills?.join(", ") || "Not provided"}
    - Experience: ${
      candidate.experience
        ? JSON.stringify(candidate.experience)
        : "Not provided"
    }
    - Education: ${
      candidate.education ? JSON.stringify(candidate.education) : "Not provided"
    }
    
    Match Score: ${matchScore}/100
    
    Create a personalized, constructive, and empathetic rejection explanation that:
    1. Acknowledges the candidate's strengths
    2. Identifies specific gaps relative to the job requirements (skills, experience, or qualifications)
    3. Offers 1-2 specific suggestions for improvement
    4. Ends on an encouraging note
    
    Keep your response between 150-200 words, be specific rather than vague, and maintain a supportive tone.
  `;

  try {
    const explanation = await generateChatResponse(prompt, "", "en");
    return explanation;
  } catch (error) {
    console.error("Error generating rejection explanation:", error);
    return `We appreciate your interest in this position. While your profile has several strengths, we're looking for candidates with more specific experience in ${
      job.requiredSkills?.join(", ") || "the required areas"
    }. We encourage you to continue developing your skills in these areas and wish you success in your job search.`;
  }
};
