import React from "react";
import { useAnalytics } from "../../hooks/useAnalytics";
import MetricCard from "./MetricCard";
import StatusChart from "./StatusChart";

const AnalyticsDashboard = ({ companyId }) => {
  const { dashboardData, loading, error } = useAnalytics(companyId);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <p className="text-gray-600">No analytics data available</p>
      </div>
    );
  }

  const { totalJobs, activeJobs, totalApplications, applicationsByStatus } =
    dashboardData;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <MetricCard
          title="Total Jobs"
          value={totalJobs}
          icon="📋"
          color="blue"
        />
        <MetricCard
          title="Active Jobs"
          value={activeJobs}
          icon="✅"
          color="green"
        />
        <MetricCard
          title="Total Applications"
          value={totalApplications}
          icon="👥"
          color="purple"
        />
        <MetricCard
          title="Pending Applications"
          value={applicationsByStatus?.pending || 0}
          icon="⏳"
          color="yellow"
        />
      </div>

      {/* Application Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">
            Application Status Overview
          </h3>
          <div className="space-y-3">
            {Object.entries(applicationsByStatus || {}).map(
              ([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="capitalize text-gray-600">{status}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              )
            )}
          </div>
        </div>

        <StatusChart data={applicationsByStatus} />
      </div>

      {/* Job Performance Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {applicationsByStatus?.hired || 0}
            </div>
            <div className="text-sm text-gray-600">Hired</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {applicationsByStatus?.interviewed || 0}
            </div>
            <div className="text-sm text-gray-600">Interviewed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {applicationsByStatus?.shortlisted || 0}
            </div>
            <div className="text-sm text-gray-600">Shortlisted</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {applicationsByStatus?.rejected || 0}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
