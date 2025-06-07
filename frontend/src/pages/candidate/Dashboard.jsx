import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../utils/api";

const CandidateDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    applications: 0,
    interviews: 0,
    shortlisted: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch real application data from API
        const response = await api.get("/applications/candidate");
        const applications = response.data;

        if (!Array.isArray(applications)) {
          console.error("Invalid application data received:", applications);
          return;
        }

        // Calculate real stats from applications
        const stats = {
          applications: applications.length,
          interviews: applications.filter((app) =>
            app.messages?.some(
              (m) => m.sender === "system" || m.sender === "company"
            )
          ).length,
          shortlisted: applications.filter(
            (app) => app.status === "shortlisted"
          ).length,
        };

        setStats(stats);

        // Sort applications by date and take most recent ones
        const recentApps = applications
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5); // Show only 5 most recent applications

        setRecentApplications(recentApps);

        // Fetch recommended jobs
        const jobsResponse = await api.get("/jobs/recommended");
        const recommendedJobs = jobsResponse.data;

        if (Array.isArray(recommendedJobs)) {
          setRecentJobs(recommendedJobs.slice(0, 4)); // Show only 4 recommended jobs
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format date to readable string
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";

    switch (status) {
      case "pending":
        return `${baseClasses} bg-warning-100 text-warning-800`;
      case "reviewing":
        return `${baseClasses} bg-primary-100 text-primary-800`;
      case "shortlisted":
        return `${baseClasses} bg-success-100 text-success-800`;
      case "rejected":
        return `${baseClasses} bg-error-100 text-error-800`;
      case "hired":
        return `${baseClasses} bg-accent-100 text-accent-800`;
      default:
        return baseClasses;
    }
  };

  // Get match score styling
  const getMatchScoreBadge = (score) => {
    const baseClasses = "text-sm font-medium";

    if (score >= 90) {
      return `${baseClasses} text-success-500`;
    } else if (score >= 75) {
      return `${baseClasses} text-primary-500`;
    } else if (score >= 60) {
      return `${baseClasses} text-warning-500`;
    } else {
      return `${baseClasses} text-error-500`;
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <FontAwesomeIcon
          icon="circle-notch"
          spin
          className="text-4xl text-primary-500"
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-primary-900 to-background-secondary rounded-lg p-6 shadow-custom-dark">
        <h1 className="text-2xl font-bold text-white mb-2">
          Welcome back, {user?.name || "Candidate"}!
        </h1>
        <p className="text-gray-300">
          Here's an overview of your job search progress.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-full bg-primary-700/30 p-3 mr-4">
              <FontAwesomeIcon
                icon="paper-plane"
                className="text-primary-500 text-xl"
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Applications</p>
              <h3 className="text-2xl font-bold text-white">
                {stats.applications}
              </h3>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-full bg-success-700/30 p-3 mr-4">
              <FontAwesomeIcon
                icon="user-check"
                className="text-success-500 text-xl"
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Shortlisted</p>
              <h3 className="text-2xl font-bold text-white">
                {stats.shortlisted}
              </h3>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-full bg-accent-700/30 p-3 mr-4">
              <FontAwesomeIcon
                icon="comments"
                className="text-accent-500 text-xl"
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Interviews</p>
              <h3 className="text-2xl font-bold text-white">
                {stats.interviews}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Recent applications */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            Recent Applications
          </h2>
          <Link
            to="/candidate/jobs"
            className="text-primary-400 hover:text-primary-300 text-sm"
          >
            View All
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-dark-700">
            <thead className="bg-background-secondary">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Job
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Company
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Date Applied
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {recentApplications.map((application) => (
                <tr
                  key={application._id}
                  className="hover:bg-background-light transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">
                      {application.job.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {application.job.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {application.job.company.companyName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300">
                      {formatDate(application.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(application.status)}>
                      {application.status.charAt(0).toUpperCase() +
                        application.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}

              {recentApplications.length === 0 && (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-4 text-center text-gray-400"
                  >
                    You haven't applied to any jobs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended jobs */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Recommended Jobs</h2>
          <Link
            to="/candidate/jobs"
            className="text-primary-400 hover:text-primary-300 text-sm"
          >
            Browse All Jobs
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recentJobs.map((job) => (
            <div
              key={job._id}
              className="bg-background-secondary rounded-lg p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between">
                <h3 className="font-medium text-white">{job.title}</h3>
                <span className={getMatchScoreBadge(job.matchScore)}>
                  {job.matchScore}% Match
                </span>
              </div>

              <div className="mt-2 flex items-center text-gray-400 text-sm">
                <FontAwesomeIcon icon="building" className="mr-1" />
                {job.company.companyName}
              </div>

              <div className="mt-1 flex items-center text-gray-400 text-sm">
                <FontAwesomeIcon icon="map-marker-alt" className="mr-1" />
                {job.location}
              </div>

              <div className="mt-1 flex items-center text-gray-400 text-sm">
                <FontAwesomeIcon icon="briefcase" className="mr-1" />
                {job.type}
              </div>

              <div className="mt-4 flex justify-between items-center">
                <span className="text-xs text-gray-400">
                  Posted {formatDate(job.createdAt)}
                </span>
                <Link
                  to={`/candidate/jobs/${job._id}`}
                  className="px-3 py-1 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm transition-colors"
                >
                  View Job
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
