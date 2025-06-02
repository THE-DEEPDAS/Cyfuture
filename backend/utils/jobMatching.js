import { analyzeCandidate } from "./llm.js";

/**
 * Calculate match score between a job and a candidate's resume
 * @param {Object} job - Job posting data with requirements
 * @param {Object} resumeData - Parsed resume data with skills, experience, etc.
 * @returns {number} - Match score percentage (0-100)
 */
export const calculateMatchScore = (job, resumeData) => {
  if (!job || !resumeData) return 0;

  // Get candidate skills (case-insensitive)
  const candidateSkills = (resumeData.skills || []).map((skill) =>
    skill.toLowerCase()
  );

  // Get job required skills (case-insensitive)
  const jobSkills = (job.skills || []).map((skill) => skill.toLowerCase());

  // Match skills
  let skillMatchCount = 0;
  for (const jobSkill of jobSkills) {
    if (
      candidateSkills.some(
        (skill) => skill.includes(jobSkill) || jobSkill.includes(skill)
      )
    ) {
      skillMatchCount++;
    }
  }

  // Calculate skill match percentage
  const skillMatchPercentage =
    jobSkills.length > 0 ? (skillMatchCount / jobSkills.length) * 100 : 0;

  // Experience level match (Junior, Mid-Level, Senior)
  let experienceMatch = 0;
  const jobExperience = job.experience ? job.experience.toLowerCase() : "";

  // Check candidate experience based on years or positions
  if (resumeData.experience && resumeData.experience.length > 0) {
    const candidateExperiences = resumeData.experience;
    const seniorTitles = [
      "senior",
      "lead",
      "principal",
      "architect",
      "manager",
      "head",
    ];
    const midTitles = ["mid", "intermediate", "developer", "engineer"];
    const juniorTitles = ["junior", "entry", "associate", "intern"];

    // Determine candidate's highest experience level
    let candidateLevel = "junior";

    for (const exp of candidateExperiences) {
      const title = exp.title ? exp.title.toLowerCase() : "";
      if (seniorTitles.some((term) => title.includes(term))) {
        candidateLevel = "senior";
        break;
      } else if (midTitles.some((term) => title.includes(term))) {
        candidateLevel = "mid-level";
      }
    }

    // Match experience level
    if (jobExperience.includes("senior") && candidateLevel === "senior") {
      experienceMatch = 100;
    } else if (
      jobExperience.includes("mid") &&
      (candidateLevel === "mid-level" || candidateLevel === "senior")
    ) {
      experienceMatch = 100;
    } else if (jobExperience.includes("junior") && candidateLevel !== "") {
      experienceMatch = 100;
    } else if (candidateLevel === "senior") {
      experienceMatch = 75; // Senior candidates can do mid/junior roles
    } else if (
      candidateLevel === "mid-level" &&
      jobExperience.includes("junior")
    ) {
      experienceMatch = 75; // Mid-level can do junior roles
    } else {
      experienceMatch = 25; // Experience mismatch
    }
  }

  // Calculate overall match score (weighted)
  const skillWeight = 0.7;
  const experienceWeight = 0.3;

  const overallScore =
    skillMatchPercentage * skillWeight + experienceMatch * experienceWeight;

  return Math.round(overallScore);
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
