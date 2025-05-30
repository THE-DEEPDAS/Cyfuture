import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

export const analyzeCandidate = async (jobDescription, candidateData, language = 'en') => {
  try {
    const prompt = `
      Job Description:
      ${jobDescription}

      Candidate Information:
      Skills: ${candidateData.skills.join(', ')}
      Experience: ${JSON.stringify(candidateData.experience)}
      Education: ${JSON.stringify(candidateData.education)}

      Please analyze this candidate's fit for the position and provide:
      1. A match score (0-100)
      2. Detailed rationale for the score
      3. Key strengths and potential areas of concern
      
      Respond in ${language} language.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response to extract score and rationale
    // This is a simple implementation - you might want to add more structure
    const analysis = {
      matchScore: extractScore(text),
      rationale: text
    };

    return analysis;
  } catch (error) {
    console.error('LLM Analysis Error:', error);
    throw new Error('Failed to analyze candidate fit');
  }
};

// Helper function to extract score from LLM response
const extractScore = (text) => {
  // This is a simple implementation - you might want to make it more robust
  const scoreMatch = text.match(/\b([0-9]{1,3})\b/);
  return scoreMatch ? Math.min(100, Math.max(0, parseInt(scoreMatch[1]))) : 0;
};

export const generateChatResponse = async (context, message, language = 'en') => {
  try {
    const prompt = `
      Context: You are a helpful AI assistant for a job application platform.
      Previous context: ${context}
      User message: ${message}
      
      Please provide a helpful and professional response in ${language} language.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Chat Response Error:', error);
    throw new Error('Failed to generate chat response');
  }
};