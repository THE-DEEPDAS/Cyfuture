import React from "react";

const StatusChart = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Application Distribution</h3>
        <p className="text-gray-500 text-center py-8">No data available</p>
      </div>
    );
  }

  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  const colors = {
    pending: "#FCD34D",
    shortlisted: "#60A5FA",
    interviewed: "#A78BFA",
    hired: "#34D399",
    rejected: "#F87171",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">Application Distribution</h3>
      <div className="space-y-3">
        {Object.entries(data).map(([status, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: colors[status] || "#6B7280" }}
                ></div>
                <span className="capitalize text-gray-700">{status}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {percentage.toFixed(1)}%
                </span>
                <span className="font-semibold">{count}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simple bar chart */}
      <div className="mt-4 space-y-2">
        {Object.entries(data).map(([status, count]) => {
          const percentage = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={status} className="flex items-center space-x-2">
              <span className="text-xs w-16 text-gray-600 capitalize">
                {status}
              </span>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: colors[status] || "#6B7280",
                  }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusChart;
