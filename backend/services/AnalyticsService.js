import Analytics from "../models/Analytics.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";
import mongoose from "mongoose";

class AnalyticsService {
  async calculateHiringFunnelMetrics(companyId, timeRange) {
    const startDate = this.getStartDate(timeRange);

    const pipeline = [
      {
        $match: {
          company: new mongoose.Types.ObjectId(companyId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          reviewed: {
            $sum: { $cond: [{ $ne: ["$status", "pending"] }, 1, 0] },
          },
          shortlisted: {
            $sum: { $cond: [{ $eq: ["$status", "shortlisted"] }, 1, 0] },
          },
          interviewed: {
            $sum: { $cond: [{ $eq: ["$status", "interviewed"] }, 1, 0] },
          },
          hired: {
            $sum: { $cond: [{ $eq: ["$status", "hired"] }, 1, 0] },
          },
        },
      },
    ];

    const result = await Application.aggregate(pipeline);

    return (
      result[0] || {
        totalApplications: 0,
        reviewed: 0,
        shortlisted: 0,
        interviewed: 0,
        hired: 0,
      }
    );
  }

  async calculateTimeToHireMetrics(companyId, timeRange) {
    const startDate = this.getStartDate(timeRange);

    const pipeline = [
      {
        $match: {
          company: new mongoose.Types.ObjectId(companyId),
          status: "hired",
          createdAt: { $gte: startDate },
        },
      },
      {
        $project: {
          timeToHire: {
            $divide: [
              { $subtract: ["$updatedAt", "$createdAt"] },
              1000 * 60 * 60 * 24, // Convert to days
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          averageDays: { $avg: "$timeToHire" },
          totalHired: { $sum: 1 },
        },
      },
    ];

    const result = await Application.aggregate(pipeline);

    return result[0] || { averageDays: 0, totalHired: 0 };
  }

  async calculateMatchScores(companyId, timeRange) {
    const startDate = this.getStartDate(timeRange);

    const pipeline = [
      {
        $match: {
          company: new mongoose.Types.ObjectId(companyId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          averageScore: { $avg: "$matchScore" },
          distribution: {
            $push: "$matchScore",
          },
        },
      },
    ];

    const result = await Application.aggregate(pipeline);

    if (!result.length) {
      return {
        average: 0,
        distribution: {
          low: 0,
          medium: 0,
          high: 0,
        },
      };
    }

    const scores = result[0].distribution;
    const distribution = {
      low: scores.filter((score) => score < 60).length,
      medium: scores.filter((score) => score >= 60 && score < 80).length,
      high: scores.filter((score) => score >= 80).length,
    };

    return {
      average: Math.round(result[0].averageScore),
      distribution,
    };
  }

  async calculateJobMetrics(jobId, companyId, timeRange) {
    const startDate = this.getStartDate(timeRange);

    const pipeline = [
      {
        $match: {
          job: new mongoose.Types.ObjectId(jobId),
          company: new mongoose.Types.ObjectId(companyId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          avgMatchScore: { $avg: "$matchScore" },
          statusDistribution: {
            $push: "$status",
          },
          qualifiedCandidates: {
            $sum: { $cond: [{ $gte: ["$matchScore", 70] }, 1, 0] },
          },
        },
      },
    ];

    const result = await Application.aggregate(pipeline);

    if (!result.length) {
      return {
        totalApplications: 0,
        avgMatchScore: 0,
        statusDistribution: {},
        qualifiedCandidates: 0,
      };
    }

    const metrics = result[0];
    const statusCount = metrics.statusDistribution.reduce((acc, status) => {
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return {
      totalApplications: metrics.totalApplications,
      avgMatchScore: Math.round(metrics.avgMatchScore),
      statusDistribution: statusCount,
      qualifiedCandidates: metrics.qualifiedCandidates,
    };
  }

  async calculateSourceAnalytics(companyId, timeRange) {
    const startDate = this.getStartDate(timeRange);

    const pipeline = [
      {
        $match: {
          company: new mongoose.Types.ObjectId(companyId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
        },
      },
    ];

    const results = await Application.aggregate(pipeline);
    const distribution = {};
    let totalApplications = 0;
    results.forEach(({ _id, count }) => {
      distribution[_id] = count;
      totalApplications += count;
    });

    return { totalApplications, distribution };
  }

  async calculateLanguageDistribution(companyId, timeRange) {
    const startDate = this.getStartDate(timeRange);

    const pipeline = [
      {
        $match: {
          company: new mongoose.Types.ObjectId(companyId),
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$language",
          count: { $sum: 1 },
        },
      },
    ];

    const results = await Application.aggregate(pipeline);
    const distribution = {};
    let totalApplications = 0;
    results.forEach(({ _id, count }) => {
      distribution[_id] = count;
      totalApplications += count;
    });

    return { totalApplications, distribution };
  }

  async calculateJobsStatusOverview(companyId, timeRange = "all") {
    const startDate = this.getStartDate(timeRange);

    // fetch all jobs for the company
    const jobs = await Job.find({
      company: new mongoose.Types.ObjectId(companyId),
    })
      .select("_id title isActive")
      .lean();
    if (!jobs.length) {
      return { totalJobs: 0, activeJobs: 0, jobs: [] };
    }

    const jobIds = jobs.map((j) => j._id);
    const matchConditions = {
      company: new mongoose.Types.ObjectId(companyId),
      job: { $in: jobIds },
      // only apply date filter when not "all"
      ...(timeRange !== "all" && { createdAt: { $gte: startDate } }),
    };

    const appStats = await Application.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: { job: "$job", status: "$status" },
          count: { $sum: 1 },
        },
      },
    ]);

    // build a lookup map: { jobId: { totalApplications, statusDistribution } }
    const statsMap = appStats.reduce((map, { _id, count }) => {
      const key = _id.job.toString();
      if (!map[key]) {
        map[key] = { totalApplications: 0, statusDistribution: {} };
      }
      map[key].statusDistribution[_id.status] = count;
      map[key].totalApplications += count;
      return map;
    }, {});

    const statuses = [
      "pending",
      "shortlisted",
      "interviewed",
      "hired",
      "rejected",
    ];
    const jobsMetrics = jobs.map((job) => {
      const sm = statsMap[job._id.toString()] || {
        totalApplications: 0,
        statusDistribution: {},
      };
      statuses.forEach((s) => {
        sm.statusDistribution[s] = sm.statusDistribution[s] || 0;
      });
      return {
        jobId: job._id,
        title: job.title,
        isActive: job.isActive,
        totalApplications: sm.totalApplications,
        statusDistribution: sm.statusDistribution,
      };
    });

    const activeJobs = jobsMetrics.filter((j) => j.isActive).length;
    return {
      totalJobs: jobsMetrics.length,
      activeJobs,
      jobs: jobsMetrics,
    };
  }

  getStartDate(timeRange) {
    const now = new Date();
    switch (timeRange) {
      case "week":
        return new Date(now.setDate(now.getDate() - 7));
      case "month":
        return new Date(now.setMonth(now.getMonth() - 1));
      case "quarter":
        return new Date(now.setMonth(now.getMonth() - 3));
      case "year":
        return new Date(now.setFullYear(now.getFullYear() - 1));
      default:
        return new Date(now.setMonth(now.getMonth() - 1)); // Default to last month
    }
  }

  async saveAnalytics(data) {
    return await Analytics.create({
      ...data,
      createdAt: new Date(),
    });
  }
}

export default new AnalyticsService();
