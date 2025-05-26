import mongoose from 'mongoose';

const jobSchema = mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requiredSkills: [
      {
        type: String,
        required: true,
      },
    ],
    location: {
      type: String,
      required: true,
    },
    salary: {
      type: String,
    },
    jobType: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
      required: true,
    },
    experienceLevel: {
      type: String,
      enum: ['Entry-level', 'Mid-level', 'Senior', 'Executive'],
      required: true,
    },
    numberOfOpenings: {
      type: Number,
      required: true,
      default: 1,
    },
    numberOfCandidatesToShortlist: {
      type: Number,
      required: true,
      default: 5,
    },
    jobRequirements: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['Open', 'Closed', 'Draft'],
      default: 'Open',
    },
    applications: [
      {
        resume: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Resume',
        },
        matchScore: {
          type: Number,
          default: 0,
        },
        skillMatchScore: {
          type: Number,
          default: 0,
        },
        experienceMatchScore: {
          type: Number,
          default: 0,
        },
        educationMatchScore: {
          type: Number,
          default: 0,
        },
        llmReasoning: {
          type: String,
        },
        status: {
          type: String,
          enum: ['Applied', 'Shortlisted', 'Rejected', 'Interviewing', 'Hired'],
          default: 'Applied',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    chatbotQuestions: [
      {
        question: String,
        isRequired: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);

export default Job;