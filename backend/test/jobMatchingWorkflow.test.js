import { describe, expect, test } from "@jest/globals";
import { calculateMatchScore } from "../services/enhancedJobMatching.js";
import { analyzeCandidate } from "../utils/llm.js";

const sampleJobs = {
  relevantJobs: [
    {
      title: "Senior Full Stack Developer",
      description:
        "Looking for an experienced full stack developer with strong React and Node.js skills",
      requiredSkills: ["React", "Node.js", "JavaScript", "MongoDB"],
      preferredSkills: ["TypeScript", "AWS", "Docker"],
      experience: { minYears: 5 },
      education: {
        requiredDegree: "Bachelor's",
        preferredField: "Computer Science",
      },
    },
    {
      title: "Frontend Developer",
      description:
        "Frontend developer position focusing on React and modern JavaScript",
      requiredSkills: ["React", "JavaScript", "HTML", "CSS"],
      preferredSkills: ["TypeScript", "Redux", "Jest"],
      experience: { minYears: 3 },
      education: { requiredDegree: "Bachelor's" },
    },
    {
      title: "Backend Developer",
      description: "Backend developer with strong Node.js and database skills",
      requiredSkills: ["Node.js", "MongoDB", "Express", "REST APIs"],
      preferredSkills: ["GraphQL", "Kubernetes", "Microservices"],
      experience: { minYears: 4 },
      education: {
        requiredDegree: "Bachelor's",
        preferredField: "Computer Science",
      },
    },
  ],
  irrelevantJobs: [
    {
      title: "Data Scientist",
      description: "Looking for a data scientist with strong ML experience",
      requiredSkills: ["Python", "Machine Learning", "TensorFlow", "SQL"],
      preferredSkills: ["PyTorch", "Keras", "R"],
      experience: { minYears: 3 },
      education: { requiredDegree: "Master's", preferredField: "Data Science" },
    },
    {
      title: "DevOps Engineer",
      description:
        "Seeking DevOps engineer with strong infrastructure experience",
      requiredSkills: ["Kubernetes", "AWS", "Terraform", "CI/CD"],
      preferredSkills: ["Azure", "GCP", "Ansible"],
      experience: { minYears: 4 },
      education: { requiredDegree: "Bachelor's" },
    },
  ],
};

const candidateProfile = {
  name: "John Doe",
  skills: [
    "JavaScript",
    "React",
    "Node.js",
    "MongoDB",
    "Express",
    "TypeScript",
    "HTML",
    "CSS",
    "Git",
  ],
  experience: [
    {
      title: "Senior Frontend Developer",
      company: "Tech Corp",
      startDate: "2020-01",
      endDate: "2023-12",
      description: "Led frontend development using React and TypeScript",
    },
    {
      title: "Full Stack Developer",
      company: "Web Solutions Inc",
      startDate: "2017-06",
      endDate: "2019-12",
      description: "Developed full stack applications using MERN stack",
    },
  ],
  education: [
    {
      degree: "Bachelor's",
      field: "Computer Science",
      institution: "Tech University",
      graduationDate: "2017-05",
    },
  ],
  projects: [
    {
      name: "E-commerce Platform",
      description: "Built a full stack e-commerce platform",
      technologies: ["React", "Node.js", "MongoDB", "Express"],
    },
  ],
};

describe("Job Matching System Tests", () => {
  describe("Job Matching Algorithm", () => {
    test("should return high scores for relevant jobs", async () => {
      const results = await Promise.all(
        sampleJobs.relevantJobs.map(async (job) => {
          const result = await calculateMatchScore(job, candidateProfile);
          return {
            job: job.title,
            score: result.score,
            breakdown: result.breakdown,
          };
        })
      );

      results.forEach((result) => {
        expect(result.score).toBeGreaterThan(60);
        expect(result.breakdown).toBeDefined();
      });
    });

    test("should return low scores for irrelevant jobs", async () => {
      const results = await Promise.all(
        sampleJobs.irrelevantJobs.map(async (job) => {
          const result = await calculateMatchScore(job, candidateProfile);
          return {
            job: job.title,
            score: result.score,
            breakdown: result.breakdown,
          };
        })
      );

      results.forEach((result) => {
        expect(result.score).toBeLessThan(50);
        expect(result.breakdown).toBeDefined();
      });
    });
  });

  describe("Skill Matching", () => {
    test("should identify matching skills correctly", async () => {
      const job = sampleJobs.relevantJobs[0];
      const result = await calculateMatchScore(job, candidateProfile);

      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.skills).toBeDefined();
      expect(Array.isArray(result.breakdown.skills.matching)).toBe(true);
      expect(Array.isArray(result.breakdown.skills.missing)).toBe(true);
    });
  });

  describe("Experience Matching", () => {
    test("should evaluate years of experience", async () => {
      const job = sampleJobs.relevantJobs[0];
      const result = await calculateMatchScore(job, candidateProfile);

      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.experience).toBeDefined();
      expect(typeof result.breakdown.experience.score).toBe("number");
    });
  });

  describe("LLM Analysis", () => {
    test("should provide meaningful insights", async () => {
      const job = sampleJobs.relevantJobs[0];
      const analysis = await analyzeCandidate(job, candidateProfile);

      expect(analysis).toBeDefined();
      expect(analysis.recommendation).toBeDefined();
      expect(analysis.strengthsAndWeaknesses).toBeDefined();
    });
  });
});
