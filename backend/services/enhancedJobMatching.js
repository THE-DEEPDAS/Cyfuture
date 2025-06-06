import { analyzeCandidate } from "../utils/llm.js";

// Weight configurations for different aspects of matching
const WEIGHTS = {
  requiredSkills: 0.35,
  preferredSkills: 0.15,
  experience: 0.2,
  education: 0.1,
  projects: 0.1,
  llmAnalysis: 0.1,
};

// Helper functions
const calculateSkillsMatch = (job, candidate) => {
  // Ensure we have arrays to work with, even if empty
  const normalizedRequired = (job.requiredSkills || []).map((s) =>
    (s || "").toLowerCase()
  );
  const normalizedPreferred = (job.preferredSkills || []).map((s) =>
    (s || "").toLowerCase()
  );
  const normalizedCandidate = (candidate.skills || []).map((s) =>
    (s || "").toLowerCase()
  );

  // Filter out any empty strings
  const validRequired = normalizedRequired.filter(Boolean);
  const validPreferred = normalizedPreferred.filter(Boolean);
  const validCandidate = normalizedCandidate.filter(Boolean);

  const matchedRequired = validRequired.filter((skill) =>
    validCandidate.some(
      (candSkill) => candSkill.includes(skill) || skill.includes(candSkill)
    )
  );

  const matchedPreferred = validPreferred.filter((skill) =>
    validCandidate.some(
      (candSkill) => candSkill.includes(skill) || skill.includes(candSkill)
    )
  );

  const requiredScore =
    validRequired.length > 0
      ? matchedRequired.length / validRequired.length
      : 1;
  const preferredScore =
    validPreferred.length > 0
      ? matchedPreferred.length / validPreferred.length
      : 0;

  return {
    requiredScore: Math.max(0, Math.min(1, requiredScore)),
    preferredScore: Math.max(0, Math.min(1, preferredScore)),
    matchedSkills: [...new Set([...matchedRequired, ...matchedPreferred])], // Remove duplicates
    missingSkills: validRequired.filter(
      (skill) => !matchedRequired.includes(skill)
    ),
  };
};

const calculateExperienceMatch = (job, candidate) => {
  const requiredYears = job.experience?.minYears || 0;
  const candidateYears =
    candidate.experience?.reduce((total, exp) => {
      try {
        const start = new Date(exp.startDate);
        const end =
          exp.endDate === "Present" ? new Date() : new Date(exp.endDate);

        // Validate dates are valid before calculation
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return total;
        }

        // Use month-accurate calculation
        const months =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());
        return total + months / 12;
      } catch (error) {
        console.error("Error calculating experience duration:", error);
        return total;
      }
    }, 0) || 0;

  const yearsScore = Math.min(candidateYears / Math.max(requiredYears, 1), 1);
  const relevanceScore =
    candidate.experience?.reduce((score, exp) => {
      if (!exp.title || !job.title) return score;
      const titleRelevance = job.title
        .toLowerCase()
        .includes(exp.title.toLowerCase())
        ? 1
        : 0.5;
      return Math.max(score, titleRelevance);
    }, 0) || 0;

  return {
    score: yearsScore * 0.7 + relevanceScore * 0.3,
    years: Math.round(candidateYears * 10) / 10, // Round to 1 decimal place
    relevance: relevanceScore,
    insights: `${candidateYears.toFixed(1)} years of experience, ${
      relevanceScore >= 0.7 ? "highly" : "partially"
    } relevant`,
  };
};

const calculateEducationMatch = (job, candidate) => {
  const requiredDegree = (job.education?.requiredDegree || "").toLowerCase();
  const preferredField = (job.education?.preferredField || "").toLowerCase();
  const candidateEducation = (candidate.education || [])
    .map((edu) => ({
      degree: (edu.degree || "").toLowerCase(),
      field: (edu.field || "").toLowerCase(),
    }))
    .filter((edu) => edu.degree || edu.field); // Filter out empty education entries

  // If no education requirements specified, return full score
  if (!requiredDegree && !preferredField) {
    return {
      score: 1,
      degreeMatch: true,
      fieldMatch: true,
    };
  }

  const degreeMatch =
    !requiredDegree ||
    candidateEducation.some(
      (edu) =>
        edu.degree.includes(requiredDegree) ||
        requiredDegree.includes(edu.degree)
    );
  const fieldMatch =
    !preferredField ||
    candidateEducation.some(
      (edu) =>
        edu.field.includes(preferredField) || preferredField.includes(edu.field)
    );

  return {
    score: degreeMatch ? (fieldMatch ? 1 : 0.7) : 0.3,
    degreeMatch,
    fieldMatch,
  };
};

const calculateProjectScore = (job, candidate) => {
  // Combine required and preferred skills, ensure we have arrays
  const relevantTechnologies = [
    ...(job.requiredSkills || []),
    ...(job.preferredSkills || []),
  ]
    .map((s) => (s || "").toLowerCase())
    .filter(Boolean); // Remove empty strings

  const projects = candidate.projects || [];
  const relevantProjects = projects.filter((project) => {
    if (!project?.technologies) return false;
    const technologies = project.technologies
      .map((t) => (t || "").toLowerCase())
      .filter(Boolean);
    return technologies.some((tech) =>
      relevantTechnologies.some(
        (relTech) => tech.includes(relTech) || relTech.includes(tech)
      )
    );
  });

  const score =
    projects.length > 0
      ? Math.min(relevantProjects.length / projects.length, 1)
      : 0;

  return {
    score: Math.max(0, score), // Ensure non-negative
    relevantProjects: relevantProjects
      .map((p) => p.name || "Unnamed Project")
      .filter(Boolean),
    technologiesUsed: [
      ...new Set(
        relevantProjects.flatMap((p) => (p.technologies || []).filter(Boolean))
      ),
    ],
  };
};

const generateMatchExplanation = ({
  job,
  candidateProfile,
  scores,
  llmAnalysis,
}) => {
  const skillsExplanation = scores.skillsScore.missingSkills.length
    ? `Candidate matches ${
        scores.skillsScore.matchedSkills.length
      } required skills but is missing ${scores.skillsScore.missingSkills.join(
        ", "
      )}.`
    : `Candidate matches all required skills.`;

  const experienceExplanation = `Has ${scores.experienceScore.years} years of ${
    scores.experienceScore.relevance >= 0.7 ? "relevant" : "related"
  } experience.`;

  return `${skillsExplanation} ${experienceExplanation} ${
    llmAnalysis.explanation || ""
  }`.trim();
};

// Main export function
export const calculateMatchScore = async (job, candidateProfile) => {
  try {
    // 1. Calculate skills match
    const skillsScore = calculateSkillsMatch(job, candidateProfile);

    // 2. Calculate experience match with detail
    const experienceScore = calculateExperienceMatch(job, candidateProfile);

    // 3. Calculate education match
    const educationScore = calculateEducationMatch(job, candidateProfile);

    // 4. Calculate project relevance
    const projectScore = calculateProjectScore(job, candidateProfile);

    // 5. Get LLM analysis for qualitative matching
    let llmAnalysis;
    try {
      llmAnalysis = await analyzeCandidate(job, candidateProfile);
    } catch (llmError) {
      console.error("LLM analysis failed:", llmError);
      llmAnalysis = {
        score: 0,
        strengths: [],
        weaknesses: [],
        recommendation: "Unable to perform detailed analysis",
        confidence: 0,
      };
    }

    // Calculate weighted score
    const algorithmicScore =
      skillsScore.requiredScore * WEIGHTS.requiredSkills +
      skillsScore.preferredScore * WEIGHTS.preferredSkills +
      experienceScore.score * WEIGHTS.experience +
      educationScore.score * WEIGHTS.education +
      projectScore.score * WEIGHTS.projects +
      (llmAnalysis.score ? llmAnalysis.score / 100 : 0) * WEIGHTS.llmAnalysis;

    // Create the score data
    const skillData = {
      matching: skillsScore.matchedSkills,
      missing: skillsScore.missingSkills,
      score: Math.round(
        ((skillsScore.requiredScore * WEIGHTS.requiredSkills +
          skillsScore.preferredScore * WEIGHTS.preferredSkills) *
          100) /
          (WEIGHTS.requiredSkills + WEIGHTS.preferredSkills)
      ),
    };

    const experienceData = {
      score: Math.round(experienceScore.score * 100),
      years: experienceScore.years,
      relevance: experienceScore.relevance,
      insights: experienceScore.insights,
    };

    const educationData = {
      score: Math.round(educationScore.score * 100),
      degreeMatch: educationScore.degreeMatch,
      fieldMatch: educationScore.fieldMatch,
    };

    const projectData = {
      score: Math.round(projectScore.score * 100),
      relevantProjects: projectScore.relevantProjects,
      technologiesUsed: projectScore.technologiesUsed,
    };

    const strengthsAndWeaknessesData = {
      strengths: llmAnalysis.strengths || [],
      gaps: llmAnalysis.weaknesses || [],
      recommendation: llmAnalysis.recommendation || "",
    };

    // Generate detailed breakdown and insights with both old and new property names
    const breakdown = {
      // New property names (for jobMatching.test.js)
      skillMatch: {
        required: Math.round(skillsScore.requiredScore * 100),
        preferred: Math.round(skillsScore.preferredScore * 100),
        missingSkills: skillsScore.missingSkills,
        total: skillData.score,
      },
      experienceMatch: experienceData,
      educationMatch: educationData,
      projectMatch: projectData,
      strengthsAndWeaknesses: strengthsAndWeaknessesData,

      // Old property names (for jobMatchingWorkflow.test.js)
      skills: skillData,
      experience: experienceData,
      education: educationData,
      projects: projectData,

      // Keep llmInsights for compatibility
      llmInsights: {
        score: llmAnalysis.score || 0,
        confidence: llmAnalysis.confidence || 0,
        recommendation: llmAnalysis.recommendation || "",
        strengths: llmAnalysis.strengths || [],
        gaps: llmAnalysis.weaknesses || [],
        analysis: llmAnalysis.overallFit || "",
      },
    };

    // Calculate final score (0-100)
    const finalScore = Math.round(algorithmicScore * 100);

    return {
      score: finalScore,
      details: {
        skills: skillsScore,
        experience: experienceScore,
        education: educationScore,
        projects: projectScore,
        llmAnalysis,
      },
      breakdown,
      explanation: generateMatchExplanation({
        job,
        candidateProfile,
        scores: { skillsScore, experienceScore, educationScore, projectScore },
        llmAnalysis,
      }),
    };
  } catch (error) {
    console.error("Error calculating match score:", error);
    // Return a safe fallback with zero scores
    return {
      score: 0,
      details: {},
      breakdown: {
        // New property names
        skillMatch: { required: 0, preferred: 0, missingSkills: [], total: 0 },
        experienceMatch: {
          score: 0,
          years: 0,
          relevance: 0,
          insights: "Error calculating experience",
        },
        educationMatch: { score: 0, degreeMatch: false, fieldMatch: false },
        projectMatch: { score: 0, relevantProjects: [], technologiesUsed: [] },
        strengthsAndWeaknesses: {
          strengths: [],
          gaps: [],
          recommendation: "Error calculating strengths and weaknesses",
        },

        // Old property names
        skills: { matching: [], missing: [], score: 0 },
        experience: {
          score: 0,
          years: 0,
          relevance: 0,
          insights: "Error calculating experience",
        },
        education: { score: 0, degreeMatch: false, fieldMatch: false },
        projects: { score: 0, relevantProjects: [], technologiesUsed: [] },

        // Keep llmInsights
        llmInsights: {
          score: 0,
          confidence: 0,
          recommendation: "Error in analysis",
          strengths: [],
          gaps: [],
          analysis: "Failed to calculate match score",
        },
      },
      explanation: "Error calculating match score",
    };
  }
};

// No duplicate functions needed since they are already defined above
