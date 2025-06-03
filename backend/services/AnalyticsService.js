import Analytics from "../models/Analytics.js";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

class AnalyticsService {
  async calculateHiringFunnelMetrics(companyId, timeRange) {
    const startDate = this.getStartDate(timeRange);

    const pipeline = [
      {
        $match: {
          company: companyId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $lookup: {
          from: "applications",
          localField: "_id",
          foreignField: "job",
          as: "applications",
        },
      },
      {
        $project: {
          totalApplications: { $size: "$applications" },
          reviewedApplications: {
            $size: {
              $filter: {
                input: "$applications",
                as: "app",
                cond: { $ne: ["$$app.status", "pending"] },
              },
            },
          },
          shortlistedCandidates: {
            $size: {
              $filter: {
                input: "$applications",
                as: "app",
                cond: { $eq: ["$$app.status", "shortlisted"] },
              },
            },
          },
          interviewedCandidates: {
            $size: {
              $filter: {
                input: "$applications",
                as: "app",
                cond: { $eq: ["$$app.status", "interviewed"] },
              },
            },
          },
          hiredCandidates: {
            $size: {
              $filter: {
                input: "$applications",
                as: "app",
                cond: { $eq: ["$$app.status", "hired"] },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: "$totalApplications" },
          reviewedApplications: { $sum: "$reviewedApplications" },
          shortlistedCandidates: { $sum: "$shortlistedCandidates" },
          interviewedCandidates: { $sum: "$interviewedCandidates" },
          hiredCandidates: { $sum: "$hiredCandidates" },
        },
      },
    ];

    const [result] = await Job.aggregate(pipeline);
    return (
      result || {
        totalApplications: 0,
        reviewedApplications: 0,
        shortlistedCandidates: 0,
        interviewedCandidates: 0,
        hiredCandidates: 0,
      }
    );
  }

  async calculateTimeToHireMetrics(companyId, timeRange) {
    const startDate = this.getStartDate(timeRange);

    const pipeline = [
      {
        $match: {
          company: companyId,
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
          stages: "$statusHistory",
        },
      },
    ];

    const applications = await Application.aggregate(pipeline);

    if (applications.length === 0) {
      return {
        average: 0,
        stages: {},
        bottlenecks: [],
      };
    }

    const stageDurations = {
      applied: [],
      reviewed: [],
      shortlisted: [],
      interviewed: [],
      hired: [],
    };

    let totalTimeToHire = 0;

    applications.forEach((app) => {
      totalTimeToHire += app.timeToHire;

      let prevDate = app.stages[0].date;
      for (let i = 1; i < app.stages.length; i++) {
        const stage = app.stages[i];
        const duration =
          (new Date(stage.date) - new Date(prevDate)) / (1000 * 60 * 60 * 24);
        stageDurations[app.stages[i - 1].status].push(duration);
        prevDate = stage.date;
      }
    });

    const average = totalTimeToHire / applications.length;
    const stages = {};
    const bottlenecks = [];

    Object.entries(stageDurations).forEach(([stage, durations]) => {
      if (durations.length > 0) {
        const avgDuration =
          durations.reduce((a, b) => a + b, 0) / durations.length;
        stages[stage] = Math.round(avgDuration * 10) / 10;

        if (avgDuration > 7) {
          bottlenecks.push({
            stage,
            severity: avgDuration > 14 ? "high" : "medium",
            description: `Average ${Math.round(
              avgDuration
            )} days in ${stage} stage`,
          });
        }
      }
    });

    return {
      average: Math.round(average * 10) / 10,
      stages,
      bottlenecks,
    };
  }

  async calculateSourceAnalytics(companyId, timeRange) {
    const startDate = this.getStartDate(timeRange);

    const pipeline = [
      {
        $match: {
          company: companyId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
          averageMatchScore: { $avg: "$matchScore" },
          qualifiedCandidates: {
            $sum: {
              $cond: [{ $gte: ["$matchScore", 70] }, 1, 0],
            },
          },
        },
      },
    ];

    const results = await Application.aggregate(pipeline);

    const applicationSources = {};
    const qualityBySource = {};

    results.forEach((result) => {
      applicationSources[result._id || "direct"] = result.count;
      qualityBySource[result._id || "direct"] = Math.round(
        (result.qualifiedCandidates / result.count) * 100
      );
    });

    return {
      applicationSources,
      qualityBySource,
    };
  }

  async calculateMatchScores(companyId, timeRange) {
    const startDate = this.getStartDate(timeRange);

    const pipeline = [
      {
        $match: {
          company: companyId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: null,
          average: { $avg: "$matchScore" },
          low: {
            $sum: {
              $cond: [{ $lte: ["$matchScore", 50] }, 1, 0],
            },
          },
          medium: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$matchScore", 50] },
                    { $lte: ["$matchScore", 75] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          high: {
            $sum: {
              $cond: [{ $gt: ["$matchScore", 75] }, 1, 0],
            },
          },
        },
      },
    ];

    const [result] = await Application.aggregate(pipeline);

    return (
      result || {
        average: 0,
        distribution: {
          low: 0,
          medium: 0,
          high: 0,
        },
      }
    );
  }

  async calculateLanguageDistribution(companyId, timeRange) {
    const startDate = this.getStartDate(timeRange);

    const pipeline = [
      {
        $match: {
          company: companyId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $lookup: {
          from: "resumes",
          localField: "resume",
          foreignField: "_id",
          as: "resumeData",
        },
      },
      {
        $unwind: "$resumeData",
      },
      {
        $group: {
          _id: "$resumeData.preferredLanguage",
          count: { $sum: 1 },
        },
      },
    ];

    const results = await Application.aggregate(pipeline);

    const distribution = {};
    results.forEach((result) => {
      distribution[result._id || "en"] = result.count;
    });

    return distribution;
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
        return new Date(now.setMonth(now.getMonth() - 1));
    }
  }

  async saveAnalytics(data) {
    return await Analytics.create({
      ...data,
      date: new Date(),
    });
  }
}

export default new AnalyticsService();
