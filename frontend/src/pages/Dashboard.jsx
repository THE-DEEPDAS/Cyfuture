import React from "react";
import { useAuth } from "../context/AuthContext";
import AnalyticsDashboard from "../components/Dashboard/AnalyticsDashboard";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Please log in to view dashboard</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Company Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your recruitment activities and performance metrics
        </p>
      </div>

      <AnalyticsDashboard companyId={user._id} />
    </div>
  );
};

export default Dashboard;
