import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Resume title is required"],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, "File URL is required"],
    },
    fileType: {
      type: String,
      enum: ["pdf", "docx"],
      required: [true, "File type is required"],
    },
    parsedData: {
      name: { type: String, required: false },
      email: { type: String, required: false },
      phone: { type: String, required: false },
      skills: [String],
      experience: [
        {
          title: { type: String, required: false },
          company: { type: String, required: false },
          location: { type: String, required: false },
          startDate: { type: String, required: false }, // Changed from Date to String
          endDate: { type: String, required: false }, // Changed from Date to String
          description: { type: String, required: false },
        },
      ],
      education: [
        {
          institution: { type: String, required: false },
          degree: { type: String, required: false },
          field: { type: String, required: false },
          startDate: { type: String, required: false }, // Changed from Date to String
          endDate: { type: String, required: false }, // Changed from Date to String
        },
      ],
      projects: [
        {
          name: { type: String, required: false },
          description: { type: String, required: false },
          technologies: [String],
          url: { type: String, required: false },
        },
      ],
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Resume", resumeSchema);
