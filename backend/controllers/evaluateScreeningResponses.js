// Route handler for evaluating screening responses with AI
// Path: d:\Cyfuture 3\backend\controllers\applicationController.js

import asyncHandler from "express-async-handler";
import Application from "../models/Application.js";
import Job from "../models/Job.js";
import { generateChatResponse } from "../utils/llm.js";

// @desc    Evaluate screening responses with AI (High Priority)
// @route   POST /api/applications/:id/evaluate-screening
// @access  Private/Company
// Cache to prevent repeated evaluations
const evaluationCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

// Priority settings for Gemini API calls
const EVALUATION_PRIORITY = {
  URGENT: {
    timeout: 30000, // 30 second timeout
    retries: 2, // Number of retries
    priority: "high",
  },
};

export const evaluateScreeningResponses = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Set a lock in the request to indicate this is a high-priority evaluation
  req.isEvaluationRequest = true;

  // Find the application
  const application = await Application.findById(id)
    .populate({
      path: "job",
      select: "title description requirements screeningQuestions",
    })
    .populate("resume", "parsedData");

  if (!application) {
    res.status(404);
    throw new Error("Application not found");
  }

  // Ensure user has permission to access this application
  if (
    req.user.role !== "company" ||
    application.job.company.toString() !== req.user._id.toString()
  ) {
    res.status(403);
    throw new Error("Not authorized to access this application");
  }

  // Ensure we have screening responses to evaluate
  if (
    !application.screeningResponses ||
    application.screeningResponses.length === 0
  ) {
    res.status(400);
    throw new Error("No screening responses to evaluate");
  }

  // Check if we already have evaluations and if they're recent
  const cacheKey = `evaluation-${id}`;
  if (evaluationCache.has(cacheKey)) {
    console.log("Using cached evaluation results");
    return res.json(evaluationCache.get(cacheKey));
  }

  // Check if responses are already evaluated
  const allEvaluated = application.screeningResponses.every(
    (response) => response.llmEvaluation && response.llmEvaluation.score
  );

  if (allEvaluated) {
    console.log("All responses already evaluated, returning current data");
    evaluationCache.set(cacheKey, application);

    // Set timeout to clear cache
    setTimeout(() => {
      evaluationCache.delete(cacheKey);
    }, CACHE_TTL);

    return res.json(application);
  }
  try {
    // Process all screening responses with AI in parallel for faster evaluation
    const evaluationPromises = application.screeningResponses.map(
      async (response, i) => {
        // Set high priority flag for Gemini API call
        const evaluationOptions = {
          priority: "high",
          timeout: 30000, // 30 second timeout for evaluation
        };

        // Get the question text
        const questionText =
          response.questionText ||
          (response.question &&
            application.job.screeningQuestions[i]?.question) ||
          "Unknown question";

        // Get the candidate's response
        const candidateResponse = response.response;

        // Create a prompt for the LLM
        const prompt = `
        You are an AI assistant helping evaluate a job candidate's screening response.
        
        Job Title: ${application.job.title}
        Job Description: ${application.job.description}
        Requirements: ${application.job.requirements.join(", ")}
        
        Question: ${questionText}
        
        Candidate's Response: "${candidateResponse}"
        
        Please evaluate this response on a scale of 0-100 based on:
        1. Relevance to the question
        2. Clarity and communication
        3. Job fit
        4. Specific expertise demonstrated
        
        Provide a score (0-100) and a brief constructive feedback paragraph (maximum 150 characters).
        
        Format your response as JSON:
        {
          "score": 85,
          "feedback": "Your feedback here"
        }
      `;

        // Get AI response
        const aiResponse = await generateChatResponse(prompt);

        // Parse the AI response (handling potential format issues)
        let evaluationData;
        try {
          // Try to extract JSON from the response
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
          evaluationData = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

          if (!evaluationData || typeof evaluationData.score !== "number") {
            // Fallback to regex parsing if JSON extraction fails
            const scoreMatch = aiResponse.match(/score["']?\s*:\s*(\d+)/i);
            const feedbackMatch = aiResponse.match(
              /feedback["']?\s*:\s*["']([^"']+)["']/i
            );

            evaluationData = {
              score: scoreMatch ? parseInt(scoreMatch[1]) : 70,
              feedback: feedbackMatch
                ? feedbackMatch[1]
                : "Response evaluated.",
            };
          }
        } catch (parseError) {
          console.error("Error parsing AI response:", parseError);
          evaluationData = { score: 70, feedback: "Response evaluated." };
        }

        // Cap score between 0 and 100
        const score = Math.min(100, Math.max(0, evaluationData.score));

        // Update the application with the evaluation
        application.screeningResponses[i].llmEvaluation = {
          score,
          feedback: evaluationData.feedback,
          confidence: 0.85,
        };
      }
    );

    // Calculate overall screening score
    if (application.screeningResponses.length > 0) {
      const totalScore = application.screeningResponses.reduce(
        (sum, response) => sum + (response.llmEvaluation?.score || 0),
        0
      );

      const averageScore = totalScore / application.screeningResponses.length;

      // Update the application's overall evaluation
      if (!application.overallEvaluation) {
        application.overallEvaluation = {};
      }

      if (!application.overallEvaluation.breakdown) {
        application.overallEvaluation.breakdown = {};
      }

      application.overallEvaluation.breakdown.screeningQuestionsScore =
        Math.round(averageScore);

      // Update total score if other scores exist
      const resumeMatchScore =
        application.overallEvaluation.breakdown.resumeMatchScore || 0;
      const llmAnalysisScore =
        application.overallEvaluation.breakdown.llmAnalysisScore || 0;

      // Calculate weighted total score
      application.overallEvaluation.totalScore = Math.round(
        averageScore * 0.4 + resumeMatchScore * 0.3 + llmAnalysisScore * 0.3
      );
    }

    // Save the updated application
    await application.save();

    // Return the updated application
    res.status(200).json(application);
  } catch (error) {
    console.error("Error evaluating screening responses:", error);
    res.status(500);
    throw new Error("Failed to evaluate screening responses");
  }
});
