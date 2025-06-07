import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAnalytics } from "../hooks/useAnalytics";

const Analytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("month");
  const [hiringFunnelData, setHiringFunnelData] = useState(null);
  const [jobsData, setJobsData] = useState(null);
  const {
    dashboardData,
    loading,
    fetchHiringFunnelMetrics,
    fetchJobsOverview,
  } = useAnalytics(user?._id, timeRange);

  useEffect(() => {
    if (user?._id) {
      loadAnalyticsData();
    }
  }, [user?._id, timeRange]);

  const loadAnalyticsData = async () => {
    const [funnelData, jobsOverview] = await Promise.all([
      fetchHiringFunnelMetrics(),
      fetchJobsOverview(),
    ]);

    setHiringFunnelData(funnelData);
    setJobsData(jobsOverview);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive insights into your recruitment performance
            </p>
          </div>

          <div className="mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 3 Months</option>
              <option value="year">Last 12 Months</option>
            </select>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboardData?.totalJobs || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {dashboardData?.activeJobs || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Applications
                </p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {dashboardData?.totalApplications || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Hired Candidates
                </p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {dashboardData?.applicationsByStatus?.hired || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">🎯</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hiring Funnel */}
        {hiringFunnelData && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Hiring Funnel
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {hiringFunnelData.totalApplications}
                </div>
                <div className="text-sm text-gray-600 mt-1">Applications</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {hiringFunnelData.reviewed}
                </div>
                <div className="text-sm text-gray-600 mt-1">Reviewed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {hiringFunnelData.shortlisted}
                </div>
                <div className="text-sm text-gray-600 mt-1">Shortlisted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {hiringFunnelData.interviewed}
                </div>
                <div className="text-sm text-gray-600 mt-1">Interviewed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {hiringFunnelData.hired}
                </div>
                <div className="text-sm text-gray-600 mt-1">Hired</div>
              </div>
            </div>
          </div>
        )}

        {/* Application Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Application Status Distribution
            </h3>
            <div className="space-y-4">
              {dashboardData?.applicationsByStatus &&
                Object.entries(dashboardData.applicationsByStatus).map(
                  ([status, count]) => {
                    const total = Object.values(
                      dashboardData.applicationsByStatus
                    ).reduce((sum, c) => sum + c, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;
                    const statusColors = {
                      pending: "bg-yellow-500",
                      shortlisted: "bg-blue-500",
                      interviewed: "bg-purple-500",
                      hired: "bg-green-500",
                      rejected: "bg-red-500",
                    };

                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              statusColors[status] || "bg-gray-400"
                            }`}
                          ></div>
                          <span className="capitalize text-gray-700 font-medium">
                            {status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-500">
                              {percentage.toFixed(1)}%
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-gray-900 w-8 text-right">
                            {count}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          </div>

          {/* Jobs Performance */}
          {jobsData && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Jobs Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Total Jobs Posted
                  </span>
                  <span className="text-lg font-semibold text-gray-900">
                    {jobsData.totalJobs}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">
                    Currently Active
                  </span>
                  <span className="text-lg font-semibold text-green-600">
                    {jobsData.activeJobs}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    Recent Job Activity
                  </p>
                  {jobsData.jobs &&
                    jobsData.jobs.slice(0, 3).map((job) => (
                      <div
                        key={job.jobId}
                        className="flex justify-between items-center py-2"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {job.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {job.totalApplications} applications
                          </p>
                        </div>
                        <div
                          className={`px-2 py-1 text-xs rounded-full ${
                            job.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {job.isActive ? "Active" : "Inactive"}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
