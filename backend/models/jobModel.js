import mongoose from 'mongoose';

const jobSchema = mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: String,
      required: true,
    },
    skills: [String],
    type: {
      type: String,
      required: true,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote'],
    },
    experience: {
      type: String,
      required: true,
    },
    salary: {
      min: {
        type: Number,
      },
      max: {
        type: Number,
      },
      currency: {
        type: String,
        default: 'USD',
      },
      isPublic: {
        type: Boolean,
        default: false,
      },
    },
    applicationDeadline: {
      type: Date,
    },
    status: {
      type: String,
      required: true,
      enum: ['Open', 'Closed', 'Draft'],
      default: 'Open',
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search functionality
jobSchema.index({ title: 'text', description: 'text', company: 'text', skills: 'text' });

const Job = mongoose.model('Job', jobSchema);

export default Job;