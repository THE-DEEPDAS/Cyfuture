import { useState, useEffect, useRef } from "react";
import api from "../utils/api.js";

// Default fallback data for demo purposes
const getDefaultData = () => ({
  totalJobs: Math.floor(Math.random() * 20) + 5, // 5-25
  activeJobs: Math.floor(Math.random() * 15) + 3, // 3-18
  totalApplications: Math.floor(Math.random() * 100) + 20, // 20-120
  applicationsByStatus: {
    pending: Math.floor(Math.random() * 30) + 5,
    shortlisted: Math.floor(Math.random() * 15) + 2,
    interviewed: Math.floor(Math.random() * 10) + 1,
    hired: Math.floor(Math.random() * 8) + 1,
    rejected: Math.floor(Math.random() * 12) + 2,
  },
});

// Function to ensure the path is relative to the /api base
const cleanApiPath = (path) => {
  let cleanPath = path;
  // Remove leading slash if present
  if (cleanPath.startsWith("/")) {
    cleanPath = cleanPath.substring(1);
  }
  // If the path segment itself starts with 'api/', remove it
  // as the baseURL in api.js already includes /api
  if (cleanPath.startsWith("api/")) {
    cleanPath = cleanPath.substring(4); // Remove 'api/'
  }
  // The result should be like 'analytics/dashboard/...'
  return cleanPath;
};

export const useAnalytics = (companyId, timeRange = "month") => {
  const [dashboardData, setDashboardData] = useState(getDefaultData());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const hasFetched = useRef(false);

  const fetchDashboardMetrics = async () => {
    if (!companyId || hasFetched.current) return;

    try {
      setLoading(true);
      setError(null);
      hasFetched.current = true;

      const relativePath = `analytics/dashboard/${companyId}`;
      const finalPath = cleanApiPath(relativePath);
      console.log("Calling API for dashboard metrics with path:", finalPath); // Debug log
      const response = await api.get(finalPath);

      if (response.data.success) {
        setDashboardData(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch data");
      }
    } catch (err) {
      setError("Failed to fetch analytics data");
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHiringFunnelMetrics = async () => {
    if (!companyId)
      return {
        totalApplications: Math.floor(Math.random() * 100) + 20,
        reviewed: Math.floor(Math.random() * 80) + 15,
        shortlisted: Math.floor(Math.random() * 40) + 8,
        interviewed: Math.floor(Math.random() * 20) + 3,
        hired: Math.floor(Math.random() * 10) + 1,
      };

    try {
      const relativePath = `analytics/hiring-funnel/${companyId}`;
      const finalPath = cleanApiPath(relativePath);
      console.log("Calling API for hiring funnel with path:", finalPath); // Debug log
      const response = await api.get(finalPath, {
        params: { range: timeRange },
      });
      return response.data;
    } catch (err) {
      console.error("Hiring funnel fetch error:", err);
      return {
        totalApplications: Math.floor(Math.random() * 100) + 20,
        reviewed: Math.floor(Math.random() * 80) + 15,
        shortlisted: Math.floor(Math.random() * 40) + 8,
        interviewed: Math.floor(Math.random() * 20) + 3,
        hired: Math.floor(Math.random() * 10) + 1,
      };
    }
  };

  const fetchJobsOverview = async () => {
    if (!companyId)
      return {
        totalJobs: Math.floor(Math.random() * 20) + 5,
        activeJobs: Math.floor(Math.random() * 15) + 3,
        jobs: [],
      };

    try {
      const relativePath = `analytics/jobs/${companyId}`;
      const finalPath = cleanApiPath(relativePath);
      console.log("Calling API for jobs overview with path:", finalPath); // Debug log
      const response = await api.get(finalPath, {
        params: { range: timeRange },
      });
      return response.data;
    } catch (err) {
      console.error("Jobs overview fetch error:", err);
      return {
        totalJobs: Math.floor(Math.random() * 20) + 5,
        activeJobs: Math.floor(Math.random() * 15) + 3,
        jobs: [],
      };
    }
  };

  useEffect(() => {
    if (companyId && !hasFetched.current) {
      fetchDashboardMetrics();
    }
  }, [companyId]);

  return {
    dashboardData,
    loading,
    error,
    refetch: () => {
      hasFetched.current = false;
      fetchDashboardMetrics();
    },
    fetchHiringFunnelMetrics,
    fetchJobsOverview,
  };
};
