import axios from "axios";

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
    // Prepare prompt with job requirements and resume data
    const prompt = `
      I need to match a job candidate's resume with a job posting.
      
      Job Title: ${job.title}
      Company: ${job.company}
      Required Skills: ${job.skills.join(", ")}
      Experience Level: ${job.experience}
      Job Description: ${job.description}
      
      Candidate Skills: ${resumeData.skills.join(", ")}
      Candidate Experience: ${resumeData.experience
        .map((exp) => `${exp.title} at ${exp.company || "Company"}`)
        .join(", ")}
      Candidate Projects: ${resumeData.projects
        .map((proj) => proj.name)
        .join(", ")}
      
      Please analyze how well the candidate matches this job posting. 
      Provide a match percentage (0-100) and a brief explanation of the match.
    `;

    // This is where you would call your actual LLM service
    // For now, we'll simulate a response
    // const response = await axios.post('/api/llm/analyze', { prompt });

    // Simulate LLM response
    const simulatedResponse = {
      score: calculateMatchScore(job, resumeData), // Use our algorithm as fallback
      explanation: `This candidate has ${
        resumeData.skills.filter((skill) =>
          job.skills.some(
            (jobSkill) =>
              jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
              skill.toLowerCase().includes(jobSkill.toLowerCase())
          )
        ).length
      } matching skills out of ${
        job.skills.length
      } required skills. Their experience as ${
        resumeData.experience[0]?.title || "a professional"
      } aligns with the ${job.experience} level required for this position.`,
    };

    return simulatedResponse;
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
 * Get resume data for the current user
 * @returns {Promise<Object>} Resume data or null if no resume
 */
export const getUserResumeData = async () => {
  try {
    const response = await axios.get("/api/resumes/default");
    return response.data.parsedData;
  } catch (error) {
    console.error("Error fetching resume data:", error);
    // Return sample data for development/demo
    return {
      skills: [
        "JavaScript",
        "React",
        "Node.js",
        "TypeScript",
        "MongoDB",
        "Express",
        "HTML/CSS",
        "GraphQL",
        "AWS",
        "Docker",
      ],
      experience: [
        {
          title: "Senior Frontend Developer",
          company: "Tech Innovations Inc.",
          location: "San Francisco, CA",
          startDate: "2023-01-01",
          endDate: null,
          description:
            "Led a team of 5 developers to build a modern React-based application.",
        },
        {
          title: "Full Stack Developer",
          company: "Digital Solutions Co.",
          location: "Remote",
          startDate: "2021-03-01",
          endDate: "2022-12-31",
          description:
            "Developed and maintained multiple client applications using MERN stack.",
        },
      ],
      projects: [
        {
          name: "E-commerce Platform",
          description:
            "Built a full-featured e-commerce platform with React, Node.js, and MongoDB.",
          technologies: [
            "React",
            "Node.js",
            "Express",
            "MongoDB",
            "Stripe API",
          ],
        },
        {
          name: "Task Management System",
          description:
            "Developed a collaborative task management system with real-time updates.",
          technologies: ["React", "Socket.IO", "Express", "PostgreSQL"],
        },
      ],
    };
  }
};

// Functions are already exported individually above
// No need for additional exports
