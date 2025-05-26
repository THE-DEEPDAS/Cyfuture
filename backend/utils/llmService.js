import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

/**
 * LLM Service for processing resume data and job matching
 */
class LLMService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  /**
   * Parse resume text and extract structured information
   * @param {string} resumeText - The text content of the resume
   */
  async parseResume(resumeText) {
    const prompt = `
      Parse the following resume and extract the structured information:
      - Full Name
      - Email
      - Phone Number (if available)
      - Skills (as a list)
      - Education (institution, degree, field, dates)
      - Experience (company, position, dates, description)
      - Projects (title, description, technologies used)
      
      Format the output as a JSON object.
      
      Resume Text:
      ${resumeText}
    `;

    try {
      const response = await this.sendRequest(prompt);
      return this.extractJsonFromResponse(response);
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw new Error('Failed to parse resume data');
    }
  }

  /**
   * Match resume against job description using LLM
   * @param {Object} resume - The structured resume data
   * @param {Object} job - The job posting data
   */
  async matchResumeToJob(resume, job) {
    const prompt = `
      Evaluate how well the candidate's resume matches the job requirements.
      
      Job Title: ${job.title}
      Job Description: ${job.description}
      Required Skills: ${job.requiredSkills.join(', ')}
      Job Requirements: ${job.jobRequirements.join(', ')}
      Experience Level: ${job.experienceLevel}
      
      Candidate's Resume:
      Name: ${resume.name}
      Skills: ${resume.skills.join(', ')}
      Experience: ${JSON.stringify(resume.experience)}
      Education: ${JSON.stringify(resume.education)}
      Projects: ${JSON.stringify(resume.projects)}
      
      Provide a detailed evaluation with the following:
      1. Overall match score (0-100)
      2. Skills match score (0-100)
      3. Experience match score (0-100) 
      4. Education match score (0-100)
      5. Detailed reasoning for your evaluation
      
      Format the output as a JSON object with fields: overallScore, skillsScore, experienceScore, educationScore, reasoning.
    `;

    try {
      const response = await this.sendRequest(prompt);
      return this.extractJsonFromResponse(response);
    } catch (error) {
      console.error('Error matching resume to job:', error);
      throw new Error('Failed to evaluate resume match');
    }
  }

  /**
   * Process candidate's response in their preferred language
   * @param {string} question - The question asked
   * @param {string} answer - The candidate's answer
   * @param {string} language - The preferred language code
   */
  async processCandidateResponse(question, answer, language = 'en') {
    const prompt = `
      The following is a response from a job candidate to a question.
      
      Question: ${question}
      Answer: ${answer}
      
      Analyze this response and provide feedback. The candidate's preferred language is ${language}, so please provide your response in that language.
      
      Your analysis should include:
      1. How well the answer addresses the question
      2. Any notable strengths or weaknesses in the response
      3. Suggestions for improvement (if any)
      
      Respond in the candidate's preferred language (${language}).
    `;

    try {
      const response = await this.sendRequest(prompt);
      return response.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error processing candidate response:', error);
      throw new Error('Failed to process candidate response');
    }
  }

  /**
   * Send request to Gemini API
   * @param {string} prompt - The prompt to send to the LLM
   */
  async sendRequest(prompt) {
    const url = `${this.apiUrl}?key=${this.apiKey}`;
    
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 2048
      }
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  /**
   * Extract JSON from the LLM response
   * @param {Object} response - The response from the LLM
   */
  extractJsonFromResponse(response) {
    try {
      const text = response.candidates[0].content.parts[0].text;
      
      // Find JSON content between triple backticks if present
      const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || 
                        text.match(/```\n([\s\S]*?)\n```/) ||
                        text.match(/{[\s\S]*?}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      
      // Clean up any non-JSON content
      const cleanedJsonString = jsonString.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      
      return JSON.parse(cleanedJsonString);
    } catch (error) {
      console.error('Error extracting JSON from response:', error);
      throw new Error('Failed to extract structured data from LLM response');
    }
  }
}

export default new LLMService();