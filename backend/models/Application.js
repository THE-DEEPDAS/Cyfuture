import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is required"],
      index: true,
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Candidate is required"],
      index: true,
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Resume",
      required: [true, "Resume is required"],
    },
    coverLetter: {
      type: String,
      required: false,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "reviewing",
        "shortlisted",
        "accepted",
        "rejected",
        "hired",
      ],
      default: "pending",
      required: true,
      index: true,
    },
    shortlisted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isShortlisted: {
      type: Boolean,
      default: false,
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
      index: true,
    },
    rejectionReason: {
      type: String,
      required: false,
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
      llmRationale: String,
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
          trim: true,
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
          ref: "Job.screeningQuestions",
          required: true,
        },
        questionText: {
          type: String,
          trim: true,
        },
        response: {
          type: String,
          required: true,
          trim: true,
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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add compound index for faster queries
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });
applicationSchema.index({ createdAt: -1 });
applicationSchema.index({ matchScore: -1 });
applicationSchema.index({ status: 1, createdAt: -1 });

// Add virtual fields
applicationSchema.virtual("isNew").get(function () {
  const hoursSinceCreated = (Date.now() - this.createdAt) / (1000 * 60 * 60);
  return hoursSinceCreated < 24;
});

// Add middleware to handle references
applicationSchema.pre("find", function () {
  this.populate({
    path: "job",
    select: "title company location type status",
  });
});

// Add middleware to ensure required fields
applicationSchema.pre("save", async function (next) {
  if (this.isNew) {
    if (!this.job || !this.candidate || !this.resume) {
      const err = new Error("Missing required fields");
      err.status = 400;
      return next(err);
    }
  }
  next();
});

const Application = mongoose.model("Application", applicationSchema);

export default Application;
