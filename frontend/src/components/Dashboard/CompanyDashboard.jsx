import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useAnalytics } from "../../hooks/useAnalytics";

const CompanyDashboard = () => {
  const { user } = useAuth();
  const { dashboardData, loading, error } = useAnalytics(user?._id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">
            Error Loading Dashboard
          </h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.companyName || user?.name}
          </h1>
          <p className="text-gray-600 mt-2">
            Here's an overview of your recruitment activities
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {dashboardData?.activeJobs || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  of {dashboardData?.totalJobs || 0} total jobs
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">💼</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  New Applications
                </p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {dashboardData?.applicationsByStatus?.pending || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">awaiting review</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">📋</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  {dashboardData?.applicationsByStatus?.shortlisted || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">candidates</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hired</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {dashboardData?.applicationsByStatus?.hired || 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">successful hires</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-yellow-600 text-xl">🎉</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Application Status Overview
            </h3>
            <div className="space-y-3">
              {dashboardData?.applicationsByStatus &&
                Object.entries(dashboardData.applicationsByStatus).map(
                  ([status, count]) => {
                    const total = Object.values(
                      dashboardData.applicationsByStatus
                    ).reduce((sum, c) => sum + c, 0);
                    const percentage = total > 0 ? (count / total) * 100 : 0;

                    return (
                      <div
                        key={status}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="capitalize text-gray-700 font-medium">
                            {status}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-900 w-8 text-right">
                            {count}
                          </span>
                        </div>
                      </div>
                    );
                  }
                )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Post New Job</div>
                <div className="text-sm text-gray-600">
                  Create a new job posting
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">
                  Review Applications
                </div>
                <div className="text-sm text-gray-600">
                  Check pending applications
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">View Analytics</div>
                <div className="text-sm text-gray-600">
                  Detailed performance metrics
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
