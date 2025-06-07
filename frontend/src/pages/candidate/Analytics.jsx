import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../utils/api";
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

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("month");
  const [view, setView] = useState("overview");
  const [error, setError] = useState(null);

  // Fetch analytics data on component mount and timeframe change
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch analytics data from API with timeframe parameter
        const analyticsResponse = await api.get("/api/applications/analytics", {
          params: { timeframe },
        });

        // Validate analytics response data
        const analyticsData = analyticsResponse.data;
        if (!analyticsData) {
          throw new Error("Invalid analytics data received");
        }

        setAnalytics({
          totalApplications: analyticsData.totalApplications || 0,
          applicationsByStatus: analyticsData.applicationsByStatus || {
            pending: 0,
            reviewing: 0,
            shortlisted: 0,
            rejected: 0,
            hired: 0,
          },
          applicationsByMonth: analyticsData.applicationsByMonth || [],
          responseRate: analyticsData.responseRate || 0,
          averageMatchScore: analyticsData.averageMatchScore || 0,
          applicationsByIndustry: analyticsData.applicationsByIndustry || {},
          applicationsByJobType: analyticsData.applicationsByJobType || {},
          topSkillsInDemand: analyticsData.topSkillsInDemand || [],
        });

        // Fetch recent applications
        const applicationsResponse = await api.get("/api/applications");
        if (Array.isArray(applicationsResponse.data)) {
          const validApplications = applicationsResponse.data.filter(
            (app) => app && app.job && app.job.title && app.status
          );
          setApplications(validApplications);
        } else {
          setApplications([]);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [timeframe]);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status color mapping
  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-blue-600",
      reviewing: "bg-yellow-500",
      shortlisted: "bg-green-500",
      rejected: "bg-red-500",
      hired: "bg-purple-500",
    };

    return colors[status] || "bg-gray-500";
  };

  // Status text mapping
  const getStatusText = (status) => {
    const text = {
      pending: "Pending",
      reviewing: "Reviewing",
      shortlisted: "Shortlisted",
      rejected: "Rejected",
      hired: "Hired",
    };

    return text[status] || status;
  };

  // Chart data for application status
  const statusChartData = {
    labels: Object.keys(analytics?.applicationsByStatus || {}).map((status) =>
      getStatusText(status)
    ),
    datasets: [
      {
        label: "Applications by Status",
        data: Object.values(analytics?.applicationsByStatus || {}),
        backgroundColor: [
          "#3B82F6", // blue
          "#EAB308", // yellow
          "#22C55E", // green
          "#EF4444", // red
          "#A855F7", // purple
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart data for applications over time
  const timeChartData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Applications",
        data: analytics?.applicationsByMonth || [],
        fill: false,
        borderColor: "#3B82F6",
        tension: 0.1,
      },
    ],
  };

  // Chart data for skills in demand
  const skillsChartData = {
    labels: analytics?.topSkillsInDemand?.map((item) => item.skill) || [],
    datasets: [
      {
        label: "Demand Count",
        data: analytics?.topSkillsInDemand?.map((item) => item.count) || [],
        backgroundColor: "#3B82F6",
        borderColor: "#2563EB",
        borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-content">
        <div className="text-center">
          <FontAwesomeIcon
            icon="spinner"
            spin
            className="text-4xl text-primary-500 mb-4"
          />
          <p className="text-gray-300">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-background-secondary rounded-lg p-6 shadow-custom-dark">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">
              Job Application Analytics
            </h1>
            <p className="text-gray-300">
              Track your application progress and insights
            </p>
          </div>

          <div className="flex space-x-2">
            <select
              className="bg-background-secondary text-white border border-gray-700 rounded-lg px-3 py-2"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="week">Past Week</option>
              <option value="month">Past Month</option>
              <option value="quarter">Past 3 Months</option>
              <option value="year">Past Year</option>
            </select>

            <select
              className="bg-background-secondary text-white border border-gray-700 rounded-lg px-3 py-2"
              value={view}
              onChange={(e) => setView(e.target.value)}
            >
              <option value="overview">Overview</option>
              <option value="skills">Skills Analysis</option>
              <option value="history">Application History</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overview View */}
      {view === "overview" && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-5">
              <h3 className="text-gray-400 text-sm mb-1">Total Applications</h3>
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon="file-alt"
                  className="text-primary-500 mr-3 text-xl"
                />
                <span className="text-2xl font-bold text-white">
                  {analytics?.totalApplications || 0}
                </span>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-gray-400 text-sm mb-1">Response Rate</h3>
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon="reply"
                  className="text-green-500 mr-3 text-xl"
                />
                <span className="text-2xl font-bold text-white">
                  {analytics?.responseRate || 0}%
                </span>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-gray-400 text-sm mb-1">
                Average Match Score
              </h3>
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon="chart-pie"
                  className="text-yellow-500 mr-3 text-xl"
                />
                <span className="text-2xl font-bold text-white">
                  {analytics?.averageMatchScore || 0}%
                </span>
              </div>
            </div>

            <div className="card p-5">
              <h3 className="text-gray-400 text-sm mb-1">Interview Invites</h3>
              <div className="flex items-center">
                <FontAwesomeIcon
                  icon="user-tie"
                  className="text-purple-500 mr-3 text-xl"
                />
                <span className="text-2xl font-bold text-white">
                  {analytics?.applicationsByStatus?.shortlisted || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Applications by Status
              </h3>
              <div className="h-64">
                <Pie
                  data={statusChartData}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Applications Over Time
              </h3>
              <div className="h-64">
                <Line
                  data={timeChartData}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Recent Applications
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Job Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Applied On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Match Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {applications.slice(0, 5).map((application) => (
                    <tr key={application._id} className="hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {application.job.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {application.job.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {formatDate(application.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                            application.status
                          )} bg-opacity-20 text-white`}
                        >
                          {getStatusText(application.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                            <div
                              className={`h-2 rounded-full ${
                                application.matchScore >= 90
                                  ? "bg-green-500"
                                  : application.matchScore >= 70
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                              style={{ width: `${application.matchScore}%` }}
                            ></div>
                          </div>
                          <span className="text-gray-300">
                            {application.matchScore}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Skills Analysis View */}
      {view === "skills" && (
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Top Skills in Demand
            </h3>
            <div className="h-80">
              <Bar
                data={skillsChartData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Applications by Industry
              </h3>
              <div className="h-64">
                <Pie
                  data={{
                    labels: Object.keys(
                      analytics?.applicationsByIndustry || {}
                    ),
                    datasets: [
                      {
                        data: Object.values(
                          analytics?.applicationsByIndustry || {}
                        ),
                        backgroundColor: [
                          "#3B82F6", // blue
                          "#22C55E", // green
                          "#EAB308", // yellow
                          "#A855F7", // purple
                          "#EC4899", // pink
                        ],
                      },
                    ],
                  }}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Applications by Job Type
              </h3>
              <div className="h-64">
                <Pie
                  data={{
                    labels: Object.keys(analytics?.applicationsByJobType || {}),
                    datasets: [
                      {
                        data: Object.values(
                          analytics?.applicationsByJobType || {}
                        ),
                        backgroundColor: [
                          "#3B82F6", // blue
                          "#EAB308", // yellow
                          "#EC4899", // pink
                          "#A855F7", // purple
                        ],
                      },
                    ],
                  }}
                  options={{ maintainAspectRatio: false }}
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Skill Gap Analysis
            </h3>
            <p className="text-gray-300 mb-4">
              Based on your applications and job market trends, consider
              developing these skills:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">TypeScript</h4>
                <p className="text-sm text-gray-300">
                  70% of jobs in your field require TypeScript. Improving this
                  skill could increase your match rate.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">AWS</h4>
                <p className="text-sm text-gray-300">
                  Cloud skills are in high demand, with 60% of employers looking
                  for AWS experience.
                </p>
              </div>

              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium text-white mb-2">
                  Docker/Kubernetes
                </h4>
                <p className="text-sm text-gray-300">
                  DevOps skills can make you stand out, as containerization is
                  required in 45% of job postings.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application History View */}
      {view === "history" && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            Application History
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Match Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {applications.map((application) => (
                  <tr key={application._id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {application.job.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {application.job.company}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {application.job.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {formatDate(application.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          application.status
                        )} bg-opacity-20 text-white`}
                      >
                        {getStatusText(application.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              application.matchScore >= 90
                                ? "bg-green-500"
                                : application.matchScore >= 70
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${application.matchScore}%` }}
                          ></div>
                        </div>
                        <span className="text-gray-300">
                          {application.matchScore}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-400 hover:text-primary-300 mr-3">
                        <FontAwesomeIcon icon="eye" />
                      </button>
                      <button className="text-primary-400 hover:text-primary-300">
                        <FontAwesomeIcon icon="comment" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
