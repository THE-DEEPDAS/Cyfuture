import mongoose from 'mongoose';

const applicationSchema = mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Job',
    },
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Resume',
    },
    coverLetter: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Reviewed', 'Shortlisted', 'Rejected', 'Hired'],
      default: 'Pending',
    },
    matchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    matchDetails: {
      skillsMatch: {
        score: Number,
        matched: [String],
        missing: [String],
      },
      experienceMatch: {
        score: Number,
        details: String,
      },
      educationMatch: {
        score: Number,
        details: String,
      },
      overallAssessment: String,
    },
    notes: [
      {
        content: String,
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    interviewDate: Date,
  },
  {
    timestamps: true,
  }
);

const Application = mongoose.model('Application', applicationSchema);

export default Application;