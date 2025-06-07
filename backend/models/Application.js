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
    interviewEvaluation: {
      avgScore: Number,
      evaluations: [
        {
          question: String,
          response: String,
          evaluation: String,
          score: Number,
          timestamp: Date,
        },
      ],
      updatedAt: Date,
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
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        language: {
          type: String,
          default: "en",
        },
      },
    ],
    interview: {
      score: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
      status: {
        type: String,
        enum: ["not_started", "in_progress", "completed"],
        default: "not_started",
      },
      currentQuestionIndex: {
        type: Number,
        default: 0,
      },
      summary: String,
      strengths: [String],
      weaknesses: [String],
    },
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

// Get all interview messages
applicationSchema.methods.getInterviewMessages = function () {
  return this.messages.filter((msg) => msg.messageType === "interview");
};

// Get personal messages
applicationSchema.methods.getPersonalMessages = function () {
  return this.messages.filter((msg) => msg.messageType === "personal");
};

// Check if interview is active
applicationSchema.methods.isInterviewActive = function () {
  return this.interview.status === "in_progress";
};

// Get current interview question if any
applicationSchema.methods.getCurrentQuestion = function () {
  if (!this.isInterviewActive()) return null;
  return this.messages.find(
    (msg) =>
      msg.messageType === "interview" &&
      msg.metadata?.isInterviewQuestion &&
      !this.messages.find(
        (r) => r.sender === "candidate" && r.messageType === "interview"
      )
  );
};

const Application = mongoose.model("Application", applicationSchema);

export default Application;
