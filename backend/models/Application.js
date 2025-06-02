import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: true,
    },
    coverLetter: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "reviewing", "shortlisted", "rejected", "hired"],
      default: "pending",
    },
    shortlisted: {
      type: Boolean,
      default: false,
    },
    isShortlisted: {
      type: Boolean,
      default: false,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    matchingScores: {
      skills: Number,
      experience: Number,
      total: Number,
    },
    llmAnalysis: {
      explanation: String,
      language: String,
      confidence: Number,
    },
    llmRationale: {
      type: String,
    },
    analysisDetails: {
      factorScores: {
        skills: {
          score: Number,
          justification: String,
        },
        experience: {
          score: Number,
          justification: String,
        },
        education: {
          score: Number,
          justification: String,
        },
        profileCompleteness: {
          score: Number,
          justification: String,
        },
      },
      strengths: [String],
      gaps: [String],
      summary: String,
    },
    messages: [
      {
        sender: {
          type: String,
          enum: ["candidate", "company", "system"],
          required: true,
        },
        content: {
          type: String,
          required: true,
        },
        language: {
          type: String,
          default: "en",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    screeningResponses: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        response: {
          type: String,
          required: true,
        },
        llmEvaluation: {
          score: {
            type: Number,
            min: 0,
            max: 100,
          },
          feedback: String,
          confidence: Number,
        },
      },
    ],
    overallEvaluation: {
      totalScore: {
        type: Number,
        min: 0,
        max: 100,
      },
      breakdown: {
        screeningQuestionsScore: Number,
        resumeMatchScore: Number,
        llmAnalysisScore: Number,
      },
      flags: [
        {
          type: String,
          enum: [
            "insufficient_experience",
            "skill_mismatch",
            "education_mismatch",
            "low_response_quality",
          ],
        },
      ],
      recommendationStrength: {
        type: String,
        enum: ["strong_yes", "yes", "maybe", "no", "strong_no"],
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model("Application", applicationSchema);

export default Application;
