import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext.jsx";
import { testUserAuth } from "../../utils/apiTest.js";

const CompanyDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    hired: 0,
    interviewing: 0,
  });
  const [recentApplications, setRecentApplications] = useState([]);
  const [jobPostings, setJobPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authStatus, setAuthStatus] = useState(null);

  // Ensure the user is a company
  useEffect(() => {
    console.log("CompanyDashboard: Checking user role...", user);
    if (user && user.role !== "company") {
      console.log("User is not a company, redirecting to candidate dashboard");
      navigate("/candidate");
    }
  }, [user, navigate]);

  useEffect(() => {
    console.log(
      "CompanyDashboard mounted, user:",
      user,
      "isAuthenticated:",
      isAuthenticated
    );

    // Test authentication
    const checkAuth = async () => {
      const result = await testUserAuth();
      setAuthStatus(result);
      if (!result.success) {
        console.error("Authentication test failed in dashboard:", result);
      }
    };

    checkAuth();

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch real data from API
        const [statsResponse, applicationsResponse, jobsResponse] =
          await Promise.all([
            api.get("/applications/stats"),
            api.get("/applications/recent"),
            api.get("/jobs/active"),
          ]);

        const stats = statsResponse.data;
        const applications = applicationsResponse.data;
        const jobs = jobsResponse.data;

        setStats({
          activeJobs: jobs.length,
          totalApplications: stats.totalApplications || 0,
          shortlisted: stats.shortlisted || 0,
          hired: stats.hired || 0,
          interviewing: stats.interviewing || 0,
        });

        // Process applications to include message and interview status
        const processedApplications = applications.map((app) => ({
          ...app,
          hasMessages: app.messages?.length > 0,
          hasInterview: app.messages?.some((m) => m.sender === "system"),
          lastMessageAt: app.messages?.length
            ? new Date(app.messages[app.messages.length - 1].createdAt)
            : new Date(app.createdAt),
        }));

        // Sort by most recent message/activity
        const sortedApplications = processedApplications.sort(
          (a, b) => b.lastMessageAt - a.lastMessageAt
        );

        setRecentApplications(sortedApplications.slice(0, 5)); // Show 5 most recent
        setJobPostings(jobs);

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

  // Calculate days remaining until expiry
  const getDaysRemaining = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
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
      case "interviewing":
        return `${baseClasses} bg-info-100 text-info-800`;
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
          Welcome, {user?.companyName || "Company"}!
        </h1>
        <p className="text-gray-300">
          Manage your job postings and review candidates from your dashboard.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-full bg-primary-700/30 p-3 mr-4">
              <FontAwesomeIcon
                icon="briefcase"
                className="text-primary-500 text-xl"
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Active Jobs</p>
              <h3 className="text-2xl font-bold text-white">
                {stats.activeJobs}
              </h3>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-full bg-accent-700/30 p-3 mr-4">
              <FontAwesomeIcon
                icon="file-alt"
                className="text-accent-500 text-xl"
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Applications</p>
              <h3 className="text-2xl font-bold text-white">
                {stats.totalApplications}
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
            <div className="rounded-full bg-primary-700/30 p-3 mr-4">
              <FontAwesomeIcon
                icon="user-plus"
                className="text-primary-500 text-xl"
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Hired</p>
              <h3 className="text-2xl font-bold text-white">{stats.hired}</h3>
            </div>
          </div>
        </div>

        <div className="card hover:shadow-lg hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-center">
            <div className="rounded-full bg-info-700/30 p-3 mr-4">
              <FontAwesomeIcon
                icon="comments"
                className="text-info-500 text-xl"
              />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Interviews</p>
              <h3 className="text-2xl font-bold text-white">
                {stats.interviewing}
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
          {recentApplications.length > 0 && (
            <Link
              to="/company/candidates"
              className="text-primary-400 hover:text-primary-300 text-sm"
            >
              View All
            </Link>
          )}
        </div>

        {recentApplications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-dark-700">
              <thead className="bg-background-secondary">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Candidate
                  </th>
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
                    Match
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
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
                        {application.candidate.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {application.job.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={getMatchScoreBadge(application.matchScore)}
                      >
                        {application.matchScore}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusBadge(application.status)}>
                        {application.status.charAt(0).toUpperCase() +
                          application.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatDate(application.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        to={`/company/candidates/${application._id}`}
                        className="text-primary-400 hover:text-primary-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-background-secondary rounded-lg p-8 text-center">
            <div className="flex flex-col items-center">
              <FontAwesomeIcon
                icon="file-alt"
                className="text-4xl text-gray-600 mb-4"
              />
              <h3 className="text-lg font-medium text-white mb-2">
                No Applications Yet
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                Once you post jobs and candidates apply, their applications will
                appear here with AI-powered match scores.
              </p>
              {jobPostings.length === 0 ? (
                <Link
                  to="/company/jobs"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                >
                  <FontAwesomeIcon icon="plus-circle" className="mr-2" />
                  Post Your First Job
                </Link>
              ) : (
                <p className="text-sm text-gray-400">
                  You have active job postings. Wait for candidates to apply or
                  share your job links on social media.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Job postings */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">
            Your Job Postings
          </h2>
          <Link
            to="/company/jobs"
            className="flex items-center text-primary-400 hover:text-primary-300 text-sm"
          >
            <FontAwesomeIcon icon="plus-circle" className="mr-1" />
            Post New Job
          </Link>
        </div>

        <div className="space-y-4">
          {jobPostings.length > 0 ? (
            jobPostings.map((job) => (
              <div
                key={job._id}
                className="bg-background-secondary rounded-lg p-5 hover:shadow-lg transition-all"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-white">{job.title}</h3>

                    <div className="mt-2 flex items-center text-gray-400 text-sm">
                      <FontAwesomeIcon icon="map-marker-alt" className="mr-1" />
                      {job.location}
                    </div>

                    <div className="mt-1 flex items-center text-gray-400 text-sm">
                      <FontAwesomeIcon icon="briefcase" className="mr-1" />
                      {job.type}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="flex items-center text-sm text-white">
                      <FontAwesomeIcon
                        icon="users"
                        className="text-primary-500 mr-2"
                      />
                      <span>{job.applicants} Applicants</span>
                    </div>

                    <div className="mt-1 text-xs text-gray-400">
                      {getDaysRemaining(job.expiresAt)} days remaining
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <Link
                    to={`/company/jobs/${job._id}`}
                    className="px-3 py-1 rounded-md bg-transparent border border-primary-500 text-primary-400 hover:bg-primary-700/20 text-sm transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    to={`/company/candidates?job=${job._id}`}
                    className="px-3 py-1 rounded-md bg-primary-600 hover:bg-primary-700 text-white text-sm transition-colors"
                  >
                    View Candidates
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-background-secondary rounded-lg p-8 text-center">
              <div className="flex flex-col items-center">
                <FontAwesomeIcon
                  icon="briefcase"
                  className="text-4xl text-gray-600 mb-4"
                />
                <h3 className="text-lg font-medium text-white mb-2">
                  No Job Postings Yet
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Create your first job posting to start attracting candidates.
                  You'll be able to track applications and use AI matching here.
                </p>
                <Link
                  to="/company/jobs"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
                >
                  <FontAwesomeIcon icon="plus-circle" className="mr-2" />
                  Create Your First Job
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-background-secondary p-6 rounded-lg flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
          <div className="rounded-full bg-primary-700/30 p-4 mb-4">
            <FontAwesomeIcon
              icon="plus-circle"
              className="text-primary-500 text-2xl"
            />
          </div>
          <h3 className="font-medium text-white mb-2">Post New Job</h3>
          <p className="text-sm text-gray-400">
            Create a new job posting to attract the best talent
          </p>
        </div>

        <div className="bg-background-secondary p-6 rounded-lg flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer">
          <div className="rounded-full bg-accent-700/30 p-4 mb-4">
            <FontAwesomeIcon
              icon="search"
              className="text-accent-500 text-2xl"
            />
          </div>
          <h3 className="font-medium text-white mb-2">Search Candidates</h3>
          <p className="text-sm text-gray-400">
            Find candidates that match your job requirements
          </p>
        </div>

        <div
          className="bg-background-secondary p-6 rounded-lg flex flex-col items-center text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer"
          onClick={() => navigate("/company/analytics")}
        >
          <div className="rounded-full bg-success-700/30 p-4 mb-4">
            <FontAwesomeIcon
              icon="chart-line"
              className="text-success-500 text-2xl"
            />
          </div>
          <h3 className="font-medium text-white mb-2">Analytics</h3>
          <p className="text-sm text-gray-400">
            View hiring metrics and optimize your recruitment
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompanyDashboard;
