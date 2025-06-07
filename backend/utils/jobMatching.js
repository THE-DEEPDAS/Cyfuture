import { analyzeCandidate } from "./llm.js";

const WEIGHTS = {
  skills: 0.4,
  experience: 0.3,
  education: 0.2,
  projects: 0.1,
};

/**
 * Calculate detailed matching scores between a job and a candidate's resume
 * @param {Object} job - Job posting data
 * @param {Object} resumeData - Parsed resume data
 * @returns {Object} - Detailed matching scores
 */
export const calculateDetailedMatchScore = (job, resumeData) => {
  const scores = {
    skills: calculateSkillsMatch(job.requiredSkills, resumeData.skills),
    experience: calculateExperienceMatch(
      job.requirements?.experience,
      resumeData.experience
    ),
    education: calculateEducationMatch(
      job.requirements?.education,
      resumeData.education
    ),
    projects: calculateProjectsMatch(
      job.requirements?.projectCount,
      resumeData.projects
    ),
    total: 0,
  };

  // Calculate weighted total score
  scores.total = Math.round(
    scores.skills * WEIGHTS.skills +
      scores.experience * WEIGHTS.experience +
      scores.education * WEIGHTS.education +
      scores.projects * WEIGHTS.projects
  );

  return scores;
};

/**
 * Calculate skills match score
 * @param {Array} requiredSkills - Required skills from job posting
 * @param {Array} candidateSkills - Candidate's skills from resume
 * @returns {number} - Match percentage (0-100)
 */
const calculateSkillsMatch = (requiredSkills = [], candidateSkills = []) => {
  if (!requiredSkills.length) return 100;

  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase());
  const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase());

  let matches = 0;
  for (const skill of normalizedRequired) {
    if (
      normalizedCandidate.some((s) => s.includes(skill) || skill.includes(s))
    ) {
      matches++;
    }
  }

  return Math.round((matches / normalizedRequired.length) * 100);
};

/**
 * Calculate experience match score
 * @param {number} requiredYears - Required years of experience
 * @param {Array} experiences - Candidate's experience entries
 * @returns {number} - Match percentage (0-100)
 */
const calculateExperienceMatch = (requiredYears = 0, experiences = []) => {
  if (!requiredYears) return 100;

  let totalYears = 0;

  // Handle both array and single object cases
  if (Array.isArray(experiences)) {
    totalYears = experiences.reduce((total, exp) => {
      try {
        const startDate = new Date(exp.startDate);
        const endDate = exp.endDate ? new Date(exp.endDate) : new Date();

        // Validate dates before calculation
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          return total;
        }

        const years = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
        return total + years;
      } catch (error) {
        console.warn("Error calculating experience duration:", error);
        return total;
      }
    }, 0);
  } else if (experiences && typeof experiences === "object") {
    // Handle single experience object
    try {
      const startDate = new Date(experiences.startDate);
      const endDate = experiences.endDate
        ? new Date(experiences.endDate)
        : new Date();

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        totalYears = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365);
      }
    } catch (error) {
      console.warn("Error calculating experience from single object:", error);
    }
  }

  const matchPercentage = (totalYears / requiredYears) * 100;
  return Math.round(Math.min(matchPercentage, 100));
};

/**
 * Calculate education match score
 * @param {Object} requiredEducation - Required education level and field
 * @param {Array} educationHistory - Candidate's education entries
 * @returns {number} - Match percentage (0-100)
 */
const calculateEducationMatch = (
  requiredEducation = {},
  educationHistory = []
) => {
  if (!requiredEducation.level) return 100;

  const educationLevels = {
    "high school": 1,
    associate: 2,
    bachelor: 3,
    master: 4,
    doctorate: 5,
  };

  const requiredLevel =
    educationLevels[requiredEducation.level.toLowerCase()] || 1;

  let highestLevel = 0;
  let fieldMatch = false;

  for (const edu of educationHistory) {
    const level = Object.entries(educationLevels).find(([key]) =>
      edu.degree?.toLowerCase().includes(key)
    );

    if (level) {
      highestLevel = Math.max(highestLevel, level[1]);
    }

    if (requiredEducation.field && edu.field) {
      if (
        edu.field.toLowerCase().includes(requiredEducation.field.toLowerCase())
      ) {
        fieldMatch = true;
      }
    }
  }

  let score =
    highestLevel >= requiredLevel ? 100 : (highestLevel / requiredLevel) * 100;

  if (requiredEducation.field && !fieldMatch) {
    score *= 0.7; // Reduce score if field doesn't match
  }

  return Math.round(score);
};

/**
 * Calculate projects match score
 * @param {number} requiredCount - Required number of projects
 * @param {Array} projects - Candidate's projects
 * @returns {number} - Match percentage (0-100)
 */
const calculateProjectsMatch = (requiredCount = 0, projects = []) => {
  if (!requiredCount) return 100;

  const matchPercentage = (projects.length / requiredCount) * 100;
  return Math.round(Math.min(matchPercentage, 100));
};

/**
 * Use LLM to analyze resume-job match when available
 * @param {Object} job - Job posting with requirements
 * @param {Object} resumeData - Parsed resume data
 * @returns {Promise<Object>} - Score and explanation
 */
export const getLLMMatchAnalysis = async (job, resumeData) => {
  try {
    // Use our LLM utility to analyze the match
    const analysis = await analyzeCandidate(job.description, resumeData);

    return {
      score: analysis.matchScore,
      explanation: analysis.rationale,
    };
  } catch (error) {
    console.error("Error getting LLM match analysis:", error);
    // Fall back to algorithm-based matching
    return {
      score: calculateMatchScore(job, resumeData),
      explanation:
        "Match score calculated based on skills and experience alignment.",
    };
  }
};

/**
 * Match job with resume using both algorithmic and LLM approaches
 * @param {Object} job - Job posting data
 * @param {Object} resumeData - Parsed resume data
 * @param {number} threshold - Threshold for algorithmic matching before using LLM
 * @returns {Promise<Object>} - Match result with score and explanation
 */
export const matchJobWithResume = async (job, resumeData, threshold = 70) => {
  // First try algorithmic matching (faster)
  const algorithmicScore = calculateMatchScore(job, resumeData);

  // If score is above threshold, return it
  if (algorithmicScore >= threshold) {
    return {
      matchScore: algorithmicScore,
      llmRationale: `Candidate has a strong match based on skills and experience. Score: ${algorithmicScore}%`,
    };
  }

  // If score is below threshold, use LLM for deeper analysis
  try {
    const llmAnalysis = await getLLMMatchAnalysis(job, resumeData);
    return {
      matchScore: llmAnalysis.score,
      llmRationale: llmAnalysis.explanation,
    };
  } catch (error) {
    // If LLM fails, fall back to algorithmic score
    return {
      matchScore: algorithmicScore,
      llmRationale: `Algorithmic match score: ${algorithmicScore}%. (LLM analysis failed)`,
    };
  }
};

/**
 * Get shortlisted candidates based on threshold and limit
 * @param {Array} applications - List of job applications
 * @param {Object} job - Job posting data
 * @param {number} threshold - Minimum score threshold (0-100)
 * @param {number} limit - Maximum number of candidates to shortlist
 * @returns {Array} - Sorted and filtered applications
 */
export const getShortlistedCandidates = async (
  applications,
  job,
  threshold = 70,
  limit = 10
) => {
  const scored = await Promise.all(
    applications.map(async (application) => {
      const scores = calculateDetailedMatchScore(
        job,
        application.resume.parsedData
      );
      const llmAnalysis = await analyzeCandidate(application, job);

      return {
        ...application.toObject(),
        scores,
        llmAnalysis,
      };
    })
  );

  // Filter by threshold and sort by total score
  return scored
    .filter((app) => app.scores.total >= threshold)
    .sort((a, b) => b.scores.total - a.scores.total)
    .slice(0, limit);
};
