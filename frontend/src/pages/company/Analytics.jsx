import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faFileCirclePlus,
  faSpinner,
  faFileAlt,
  faBriefcase,
  faClock,
  faUsers,
  faLightbulb,
} from "@fortawesome/free-solid-svg-icons";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import api from "../../utils/api";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to determine empty state
const getEmptyState = (jobPostings, analytics, view) => {
  const empty = !jobPostings || jobPostings.length === 0 || !analytics;
  return empty ? (
    view === "overview" ? (
      <EmptyStateOverview
        onCreateJob={() => navigate("/company/jobs/create")}
      />
    ) : (
      <EmptyStateJobSpecific
        onCreateJob={() => navigate("/company/jobs/create")}
      />
    )
  ) : null;
};

// Empty state components
const EmptyStateOverview = ({ onCreateJob }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm min-h-[400px] text-center">
    <FontAwesomeIcon
      icon={faChartBar}
      className="text-gray-400 text-6xl mb-4"
    />
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      No Analytics Data Yet
    </h3>
    <p className="text-gray-600 mb-6 max-w-md">
      Start tracking your hiring performance by posting your first job. Once you
      receive applications, you'll see detailed analytics here.
    </p>
    <button
      onClick={onCreateJob}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      <FontAwesomeIcon icon={faFileCirclePlus} className="mr-2" />
      Post Your First Job
    </button>
  </div>
);

const EmptyStateJobSpecific = ({ onCreateJob }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm min-h-[400px] text-center">
    <FontAwesomeIcon
      icon={faChartBar}
      className="text-gray-400 text-6xl mb-4"
    />
    <h3 className="text-xl font-semibold text-gray-800 mb-2">
      No Job-Specific Analytics
    </h3>
    <p className="text-gray-600 mb-6 max-w-md">
      You haven't posted any jobs yet. Create your first job posting to start
      tracking job-specific performance metrics.
    </p>
    <button
      onClick={onCreateJob}
      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      <FontAwesomeIcon icon={faFileCirclePlus} className="mr-2" />
      Create Job Posting
    </button>
  </div>
);

const CompanyAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month");
  const [view, setView] = useState("overview");
  const [selectedJob, setSelectedJob] = useState("all");
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all required analytics data
        const [dashboardResponse, jobsResponse] = await Promise.all([
          api.get("/api/analytics/dashboard", {
            params: { timeRange: timeframe },
          }),
          api.get("/api/jobs/active"),
        ]);

        if (!dashboardResponse.data) {
          throw new Error("Invalid analytics data received");
        }

        setAnalytics(dashboardResponse.data);
        setJobPostings(jobsResponse.data || []);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe, selectedJob]);

  // Watch for job selection changes
  useEffect(() => {
    const fetchJobAnalytics = async () => {
      if (selectedJob === "all") return;
      try {
        setLoading(true);
        const response = await api.get(`/api/analytics/job/${selectedJob}`, {
          params: { timeRange: timeframe },
        });

        setAnalytics((prev) => ({
          ...prev,
          jobAnalytics: response.data,
        }));
      } catch (error) {
        console.error("Error fetching job analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedJob !== "all") {
      fetchJobAnalytics();
    }
  }, [selectedJob, timeframe]);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-4xl text-blue-600 mb-4"
          />
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  // Empty states
  if (!jobPostings || jobPostings.length === 0 || !analytics) {
    return view === "overview" ? (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm min-h-[400px] text-center">
        <FontAwesomeIcon
          icon={faChartBar}
          className="text-gray-400 text-6xl mb-4"
        />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Analytics Data Yet
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          Start tracking your hiring performance by posting your first job. Once
          you receive applications, you'll see detailed analytics here.
        </p>
        <button
          onClick={() => navigate("/company/jobs/create")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FontAwesomeIcon icon={faFileCirclePlus} className="mr-2" />
          Post Your First Job
        </button>
      </div>
    ) : (
      <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg shadow-sm min-h-[400px] text-center">
        <FontAwesomeIcon
          icon={faChartBar}
          className="text-gray-400 text-6xl mb-4"
        />
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          No Job-Specific Analytics
        </h3>
        <p className="text-gray-600 mb-6 max-w-md">
          You haven't posted any jobs yet. Create your first job posting to
          start tracking job-specific performance metrics.
        </p>
        <button
          onClick={() => navigate("/company/jobs/create")}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <FontAwesomeIcon icon={faFileCirclePlus} className="mr-2" />
          Create Job Posting
        </button>
      </div>
    );
  }

  // Regular content
  const renderContent = () => {
    switch (view) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Total Applications
                </h3>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faFileAlt}
                    className="text-blue-600 text-xl mr-3"
                  />
                  <span className="text-2xl font-bold">
                    {analytics?.applicationStats?.total || 0}
                  </span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Active Jobs
                </h3>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faBriefcase}
                    className="text-green-600 text-xl mr-3"
                  />
                  <span className="text-2xl font-bold">
                    {analytics?.activeJobs || 0}
                  </span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Avg. Time to Hire
                </h3>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faClock}
                    className="text-yellow-600 text-xl mr-3"
                  />
                  <span className="text-2xl font-bold">
                    {analytics?.avgTimeToHire || 0} days
                  </span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Shortlist Rate
                </h3>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faUsers}
                    className="text-purple-600 text-xl mr-3"
                  />
                  <span className="text-2xl font-bold">
                    {(
                      ((analytics?.applicationStats?.shortlisted || 0) /
                        (analytics?.applicationStats?.total || 1)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Resume Matching Analytics */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Resume Matching Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Match Score Distribution
                  </h4>
                  {analytics?.matchScores && (
                    <Bar
                      data={{
                        labels: [
                          "90-100%",
                          "80-89%",
                          "70-79%",
                          "60-69%",
                          "Below 60%",
                        ],
                        datasets: [
                          {
                            label: "Candidates",
                            data: analytics.matchScores,
                            backgroundColor: [
                              "#22C55E", // green
                              "#84CC16", // lime
                              "#EAB308", // yellow
                              "#F97316", // orange
                              "#EF4444", // red
                            ],
                          },
                        ],
                      }}
                      options={{ maintainAspectRatio: false }}
                    />
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Top Matching Skills
                  </h4>
                  {analytics?.topSkills && (
                    <Bar
                      data={{
                        labels: analytics.topSkills.map((s) => s.name),
                        datasets: [
                          {
                            label: "Match Rate",
                            data: analytics.topSkills.map((s) => s.matchRate),
                            backgroundColor: "#3B82F6",
                          },
                        ],
                      }}
                      options={{ maintainAspectRatio: false }}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* LLM Analysis Summary */}
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                AI Selection Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">
                    Selection Criteria Impact
                  </h4>
                  {analytics?.llmAnalysis?.criteria && (
                    <div className="space-y-3">
                      {Object.entries(analytics.llmAnalysis.criteria).map(
                        ([criterion, impact]) => (
                          <div
                            key={criterion}
                            className="flex items-center justify-between"
                          >
                            <span className="text-gray-600">{criterion}</span>
                            <div className="w-2/3 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${impact}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3">
                    Language Distribution
                  </h4>
                  {analytics?.llmAnalysis?.languages && (
                    <Pie
                      data={{
                        labels: Object.keys(analytics.llmAnalysis.languages),
                        datasets: [
                          {
                            data: Object.values(
                              analytics.llmAnalysis.languages
                            ),
                            backgroundColor: [
                              "#3B82F6", // blue
                              "#22C55E", // green
                              "#EAB308", // yellow
                              "#EC4899", // pink
                              "#8B5CF6", // purple
                            ],
                          },
                        ],
                      }}
                      options={{ maintainAspectRatio: false }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "job":
        return (
          <div className="space-y-6">
            {selectedJob !== "all" && analytics?.jobAnalytics ? (
              <>
                {/* Job-specific Analytics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Shortlist Progress
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-3xl font-bold">
                        {analytics.jobAnalytics.shortlisted}/
                        {analytics.jobAnalytics.shortlistTarget}
                      </span>
                      <div className="w-1/2 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{
                            width: `${
                              (analytics.jobAnalytics.shortlisted /
                                analytics.jobAnalytics.shortlistTarget) *
                              100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Average Match Score
                    </h3>
                    <div className="text-3xl font-bold">
                      {analytics.jobAnalytics.avgMatchScore.toFixed(1)}%
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      Applications
                    </h3>
                    <div className="text-3xl font-bold">
                      {analytics.jobAnalytics.totalApplications}
                    </div>
                  </div>
                </div>

                {/* Skill Match Analysis */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    Skill Match Analysis
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">
                        Required Skills Coverage
                      </h4>
                      {analytics.jobAnalytics.skillsCoverage && (
                        <Bar
                          data={{
                            labels: Object.keys(
                              analytics.jobAnalytics.skillsCoverage
                            ),
                            datasets: [
                              {
                                label: "Candidates with Skill",
                                data: Object.values(
                                  analytics.jobAnalytics.skillsCoverage
                                ),
                                backgroundColor: "#3B82F6",
                              },
                            ],
                          }}
                          options={{ maintainAspectRatio: false }}
                        />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">
                        Top Additional Skills
                      </h4>
                      {analytics.jobAnalytics.additionalSkills && (
                        <Bar
                          data={{
                            labels: analytics.jobAnalytics.additionalSkills.map(
                              (s) => s.name
                            ),
                            datasets: [
                              {
                                label: "Frequency",
                                data: analytics.jobAnalytics.additionalSkills.map(
                                  (s) => s.count
                                ),
                                backgroundColor: "#22C55E",
                              },
                            ],
                          }}
                          options={{ maintainAspectRatio: false }}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* LLM Insights */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">
                    AI Selection Insights
                  </h3>
                  <div className="space-y-4">
                    {analytics.jobAnalytics.llmInsights?.map(
                      (insight, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-700 mb-2">
                            {insight.title}
                          </h4>
                          <p className="text-gray-600">{insight.description}</p>
                          {insight.recommendation && (
                            <p className="text-blue-600 mt-2">
                              <FontAwesomeIcon
                                icon={faLightbulb}
                                className="mr-2"
                              />
                              {insight.recommendation}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-600">
                Please select a specific job to view detailed analytics.
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {view === "overview" ? "Analytics Overview" : "Job Analytics"}
            </h1>
            <p className="text-gray-600">
              Track your recruitment performance and gain valuable insights
            </p>
          </div>
          <div className="flex space-x-3">
            <select
              className="border border-gray-300 rounded-md px-3 py-2"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            {jobPostings.length > 0 && (
              <select
                className="border border-gray-300 rounded-md px-3 py-2"
                value={selectedJob}
                onChange={(e) => setSelectedJob(e.target.value)}
              >
                <option value="all">All Jobs</option>
                {jobPostings.map((job) => (
                  <option key={job._id} value={job._id}>
                    {job.title}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Analytics content goes here, using the existing chart components */}
        {renderContent()}

        {/* Job Matching Insights - New Section */}
        {view === "overview" && analytics && (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Job Matching Insights
            </h3>

            {/* Match Score Distribution */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">
                Match Score Distribution
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      range: "90-100",
                      count: analytics.matchScoreDistribution.excellent,
                    },
                    {
                      range: "75-89",
                      count: analytics.matchScoreDistribution.good,
                    },
                    {
                      range: "60-74",
                      count: analytics.matchScoreDistribution.fair,
                    },
                    {
                      range: "0-59",
                      count: analytics.matchScoreDistribution.poor,
                    },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D374D" />
                  <XAxis dataKey="range" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Skill Gaps Analysis */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">
                Skill Gaps Analysis
              </h4>
              <div className="grid gap-4">
                {analytics.skillGaps.slice(0, 5).map(({ skill, count }) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between"
                  >
                    <span className="text-gray-300">{skill}</span>
                    <div className="flex items-center gap-4">
                      <div className="w-48 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{
                            width: `${
                              (count / analytics.totalApplications) * 100
                            }%`,
                          }}
                        />
                      </div>
                      <span className="text-gray-400 w-16 text-right">
                        {count} apps
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performing Jobs */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">
                Top Performing Jobs
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Total Apps
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Qualified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Avg. Match
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {analytics.topPerformingJobs.map((job) => (
                      <tr key={job.jobId} className="hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {job.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {job.totalApplications}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {job.qualifiedCandidates}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span
                            className={`px-2 py-1 rounded-full ${
                              job.averageMatchScore >= 75
                                ? "bg-green-100 text-green-800"
                                : job.averageMatchScore >= 60
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {job.averageMatchScore}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Application Trends */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">
                Application Trends
              </h4>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={analytics.applicationTrends.map((count, index) => ({
                    day: index + 1,
                    applications: count,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D374D" />
                  <XAxis dataKey="day" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#1F2937",
                      border: "none",
                      borderRadius: "0.375rem",
                    }}
                  />
                  <Bar dataKey="applications" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Candidate Quality Metrics */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">
                Candidate Quality Metrics
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-2">
                    Average Match Score
                  </h5>
                  <div className="flex items-center gap-4">
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div
                        className={`h-4 rounded-full ${
                          analytics.candidateQualityMetrics.averageMatchScore >=
                          75
                            ? "bg-green-500"
                            : analytics.candidateQualityMetrics
                                .averageMatchScore >= 60
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{
                          width: `${analytics.candidateQualityMetrics.averageMatchScore}%`,
                        }}
                      />
                    </div>
                    <span className="text-gray-300 w-16 text-right">
                      {analytics.candidateQualityMetrics.averageMatchScore}%
                    </span>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-medium text-gray-300 mb-2">
                    Average Experience
                  </h5>
                  <p className="text-2xl font-bold text-primary-500">
                    {analytics.candidateQualityMetrics.averageExperienceYears}{" "}
                    years
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h5 className="text-sm font-medium text-gray-300 mb-2">
                  Most Common Skills
                </h5>
                <div className="flex flex-wrap gap-2">
                  {analytics.candidateQualityMetrics.topSkills.map(
                    ({ skill, count }) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-primary-900/30 text-primary-300 rounded-full text-sm"
                      >
                        {skill} ({count})
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyAnalytics;
