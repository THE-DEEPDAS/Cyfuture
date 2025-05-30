import mongoose from 'mongoose';

const resumeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      enum: ['pdf', 'docx'],
    },
    cloudinaryId: {
      type: String,
      required: true,
    },
    parsedData: {
      name: String,
      email: String,
      phone: String,
      summary: String,
      skills: [String],
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          startDate: Date,
          endDate: Date,
        },
      ],
      experience: [
        {
          company: String,
          title: String,
          location: String,
          startDate: Date,
          endDate: Date,
          description: String,
        },
      ],
      certifications: [String],
      languages: [String],
    },
    rawText: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Resume = mongoose.model('Resume', resumeSchema);

export default Resume;