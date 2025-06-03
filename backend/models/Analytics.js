import mongoose from "mongoose";

const analyticsSchema = mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    timeRange: {
      type: String,
      enum: ["day", "week", "month", "year"],
      required: true,
    },
    hiringFunnel: {
      totalApplications: Number,
      reviewed: Number,
      shortlisted: Number,
      interviewed: Number,
      hired: Number,
    },
    timeToHire: {
      averageDays: Number,
      byStage: {
        review: Number,
        interview: Number,
        offer: Number,
      },
    },
    sourceAnalytics: {
      totalBySource: Map,
      qualityBySource: Map,
      conversionBySource: Map,
    },
    matchScores: {
      average: Number,
      distribution: {
        low: Number,
        medium: Number,
        high: Number,
      },
    },
    languageDistribution: Map,
  },
  {
    timestamps: true,
  }
);

const Analytics = mongoose.model("Analytics", analyticsSchema);

export default Analytics;
