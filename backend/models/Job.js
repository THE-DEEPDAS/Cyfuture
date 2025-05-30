import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required']
  },
  requirements: {
    type: [String],
    required: [true, 'Job requirements are required']
  },
  location: {
    type: String,
    required: [true, 'Job location is required']
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    required: [true, 'Job type is required']
  },
  experience: {
    type: String,
    enum: ['Entry', 'Junior', 'Mid-Level', 'Senior', 'Executive'],
    required: [true, 'Experience level is required']
  },
  skills: {
    type: [String],
    required: [true, 'Skills are required']
  },
  salary: {
    min: {
      type: Number
    },
    max: {
      type: Number
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  shortlistCount: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: [true, 'Job expiry date is required']
  }
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

export default Job;