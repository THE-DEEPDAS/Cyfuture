import { expect } from "chai";
import { calculateMatchScore } from "../services/enhancedJobMatching.js";
import { analyzeCandidate } from "../utils/llm.js";

describe("Enhanced Job Matching System", () => {
  const sampleJob = {
    title: "Senior Software Engineer",
    requiredSkills: ["JavaScript", "Node.js", "React", "TypeScript"],
    preferredSkills: ["GraphQL", "AWS", "Docker"],
    experience: {
      min: 5,
      level: "Senior",
    },
    education: {
      degree: "Bachelor",
      field: "Computer Science",
    },
    description:
      "Looking for a senior developer with strong JavaScript and Node.js experience",
  };

  const sampleCandidate = {
    skills: ["JavaScript", "Node.js", "React", "Python", "AWS"],
    experience: [
      {
        title: "Senior Software Engineer",
        years: 3,
        description:
          "Developed full-stack applications using Node.js and React",
      },
    ],
    education: [
      {
        degree: "Bachelor of Science",
        field: "Computer Science",
      },
    ],
    projects: [
      {
        name: "E-commerce Platform",
        technologies: ["React", "Node.js", "GraphQL"],
        description: "Built a full-stack e-commerce platform",
      },
    ],
  };

  describe("Match Score Calculation", () => {
    it("should calculate overall match score", async () => {
      const result = await calculateMatchScore(sampleJob, sampleCandidate);
      expect(result).to.have.property("score").that.is.a("number");
      expect(result.score).to.be.within(0, 100);
    });

    it("should provide detailed breakdown of scores", async () => {
      const result = await calculateMatchScore(sampleJob, sampleCandidate);
      expect(result).to.have.property("breakdown");
      expect(result.breakdown).to.have.property("skillMatch");
      expect(result.breakdown).to.have.property("experienceMatch");
      expect(result.breakdown).to.have.property("educationMatch");
      expect(result.breakdown).to.have.property("projectMatch");
    });

    it("should handle missing job requirements gracefully", async () => {
      const incompleteJob = {
        title: "Developer",
        requiredSkills: ["JavaScript"],
      };
      const result = await calculateMatchScore(incompleteJob, sampleCandidate);
      expect(result).to.have.property("score").that.is.a("number");
    });

    it("should handle missing candidate information gracefully", async () => {
      const incompleteCandidate = {
        skills: ["JavaScript"],
      };
      const result = await calculateMatchScore(sampleJob, incompleteCandidate);
      expect(result).to.have.property("score").that.is.a("number");
    });
  });

  describe("Skills Matching", () => {
    it("should properly weight required vs preferred skills", async () => {
      const result = await calculateMatchScore(sampleJob, sampleCandidate);
      expect(result.breakdown.skillMatch).to.have.property("required");
      expect(result.breakdown.skillMatch).to.have.property("preferred");
      expect(result.breakdown.skillMatch.required).to.be.within(0, 100);
      expect(result.breakdown.skillMatch.preferred).to.be.within(0, 100);
    });

    it("should identify missing required skills", async () => {
      const result = await calculateMatchScore(sampleJob, sampleCandidate);
      expect(result.breakdown.skillMatch)
        .to.have.property("missingSkills")
        .that.is.an("array");
    });
  });

  describe("LLM Analysis Integration", () => {
    it("should include LLM analysis in the results", async () => {
      const result = await calculateMatchScore(sampleJob, sampleCandidate);
      expect(result.breakdown).to.have.property("llmInsights");
      expect(result.breakdown.llmInsights).to.have.property("score");
      expect(result.breakdown.llmInsights).to.have.property("strengths");
      expect(result.breakdown.llmInsights).to.have.property("gaps");
    });

    it("should generate meaningful match explanation", async () => {
      const result = await calculateMatchScore(sampleJob, sampleCandidate);
      expect(result).to.have.property("explanation").that.is.a("string");
      expect(result.explanation.length).to.be.greaterThan(0);
    });
  });

  describe("Experience and Education Matching", () => {
    it("should evaluate experience relevance", async () => {
      const result = await calculateMatchScore(sampleJob, sampleCandidate);
      expect(result.breakdown.experienceMatch).to.have.property("relevance");
      expect(result.breakdown.experienceMatch).to.have.property("years");
    });

    it("should evaluate education match", async () => {
      const result = await calculateMatchScore(sampleJob, sampleCandidate);
      expect(result.breakdown.educationMatch).to.have.property("degreeMatch");
      expect(result.breakdown.educationMatch).to.have.property("fieldMatch");
    });
  });

  describe("Project Evaluation", () => {
    it("should evaluate project relevance", async () => {
      const result = await calculateMatchScore(sampleJob, sampleCandidate);
      expect(result.breakdown.projectMatch).to.have.property(
        "relevantProjects"
      );
      expect(result.breakdown.projectMatch).to.have.property(
        "technologiesUsed"
      );
    });
  });
});
