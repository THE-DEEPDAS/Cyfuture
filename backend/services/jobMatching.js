import { analyzeCandidateMatch } from "../utils/llm.js";

/**
 * Find matching jobs using both requirements and LLM matching
 */
export const findMatchingJobs = async (jobs, parsedData) => {
  const matchingJobs = await Promise.all(
    activeJobs.map(async (job) => {
      // Traditional matching
      const skillsMatch = calculateSkillsMatch(
        job.requiredSkills || [],
        parsedData.skills || []
      );
      const experienceMatch = calculateExperienceMatch(
        job.experience,
        parsedData.experience
      );
      const traditionalScore = Math.round(
        (skillsMatch * 0.7 + experienceMatch * 0.3) * 100
      );

      // LLM matching
      const llmMatch = await calculateLLMMatch(job, parsedData);

      return {
        job,
        traditionalScore,
        llmScore: llmMatch.score,
        llmConfidence: llmMatch.confidence,
        llmExplanation: llmMatch.explanation,
      };
    })
  );

  // Filter and sort matches
  return matchingJobs
    .filter((match) => match.traditionalScore >= 50 || match.llmScore >= 50)
    .sort((a, b) => {
      const scoreA = a.traditionalScore * 0.6 + a.llmScore * 0.4;
      const scoreB = b.traditionalScore * 0.6 + b.llmScore * 0.4;
      return scoreB - scoreA;
    });
};

/**
 * Calculate skills match score
 */
const calculateSkillsMatch = (requiredSkills, candidateSkills) => {
  if (!requiredSkills.length) return 1;

  const normalizedRequired = requiredSkills.map((s) => s.toLowerCase());
  const normalizedCandidate = candidateSkills.map((s) => s.toLowerCase());

  const matchedSkills = normalizedRequired.filter((skill) =>
    normalizedCandidate.includes(skill)
  );

  return matchedSkills.length / requiredSkills.length;
};

/**
 * Calculate experience match score
 */
const calculateExperienceMatch = (requiredExperience, candidateExperience) => {
  const experienceLevels = {
    Entry: 0,
    Junior: 1,
    "Mid-Level": 2,
    Senior: 3,
    Executive: 4,
  };

  if (!requiredExperience || !candidateExperience.length) return 0;

  // Calculate years of experience from candidate's experience entries
  const totalYears = candidateExperience.reduce((total, exp) => {
    const startYear = new Date(exp.startDate).getFullYear();
    const endYear =
      exp.endDate === "Present"
        ? new Date().getFullYear()
        : new Date(exp.endDate).getFullYear();
    return total + (endYear - startYear);
  }, 0);

  // Map years to experience level
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

  // Calculate match score
  return candidateLevelValue >= requiredLevel
    ? 1
    : 1 -
        (requiredLevel - candidateLevelValue) /
          Object.keys(experienceLevels).length;
};

/**
 * Calculate LLM-based match score
 */
const calculateLLMMatch = async (job, parsedData) => {
  const prompt = `
    Job Requirements:
    Title: ${job.title}
    Description: ${job.description}
    Required Skills: ${job.requiredSkills.join(", ")}
    Experience Level: ${job.experience}
    Requirements:
    ${job.requirements.join("\n")}
    
    Candidate Profile:
    Skills: ${parsedData.skills.join(", ")}
    Experience:
    ${parsedData.experience
      .map(
        (exp) =>
          `${exp.title} at ${exp.company} (${exp.period.start} - ${exp.period.end})`
      )
      .join("\n")}
    
    Based on the above information:
    1. Evaluate how well the candidate's skills match the job requirements
    2. Assess if the candidate's experience level is appropriate
    3. Determine overall suitability
    
    Return your evaluation as:
    1. A score between 0-100 indicating the match quality
    2. A confidence level between 0-1 for your assessment
    3. A brief explanation of your reasoning
  `;

  try {
    const llmResponse = await analyzeCandidateMatch(prompt);
    return {
      score: llmResponse.score,
      confidence: llmResponse.confidence,
      explanation: llmResponse.explanation,
    };
  } catch (error) {
    console.error("LLM matching error:", error);
    return {
      score: 0,
      confidence: 0,
      explanation: "Error in LLM analysis",
    };
  }
};
