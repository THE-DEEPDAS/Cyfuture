import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faMapMarkerAlt,
  faCalendarAlt,
  faCheckCircle,
  faTimesCircle,
  faHourglassHalf,
  faSpinner,
  faFileAlt,
  faSearch,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/api";
import { toast } from "react-toastify";

const ApplicationDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Status indicators with colors
  const statusInfo = {
    pending: {
      icon: faHourglassHalf,
      color: "text-yellow-500",
      bg: "bg-yellow-100",
    },
    reviewing: { icon: faSpinner, color: "text-blue-500", bg: "bg-blue-100" },
    shortlisted: {
      icon: faCheckCircle,
      color: "text-green-500",
      bg: "bg-green-100",
    },
    rejected: { icon: faTimesCircle, color: "text-red-500", bg: "bg-red-100" },
    hired: {
      icon: faCheckCircle,
      color: "text-purple-500",
      bg: "bg-purple-100",
    },
  };

  // Fetch applications on component mount
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const response = await api.get("/applications/candidate");
        if (!response.data) {
          toast.error("Failed to fetch applications");
          setApplications([]);
          return;
        }
        // Validate and filter out any malformed application data
        const validApplications = response.data.filter(
          (app) => app && app.job && app.job.company && app.job.title
        );
        setApplications(validApplications);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error(
          error.response?.data?.message || "Failed to fetch applications"
        );
        setApplications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Filter applications based on status and search term
  const filteredApplications = applications.filter((app) => {
    const matchesFilter = filter === "all" || app.status === filter;
    const matchesSearch =
      app.job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.company.companyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      app.job.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-20">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          size="3x"
          className="text-primary"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-2xl font-bold mb-4 md:mb-0">My Applications</h1>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg w-full sm:w-60"
            />
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg appearance-none w-full sm:w-44"
            >
              <option value="all">All Applications</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
            <FontAwesomeIcon
              icon={faFilter}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>
      </div>

      {filteredApplications.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApplications.map((application) => (
            <Link
              key={application._id}
              to={`/candidate/applications/${application._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h2 className="text-xl font-semibold">
                    {application.job.title}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusInfo[application.status].bg
                    } ${statusInfo[application.status].color}`}
                  >
                    <FontAwesomeIcon
                      icon={statusInfo[application.status].icon}
                      className="mr-1"
                    />
                    {application.status.charAt(0).toUpperCase() +
                      application.status.slice(1)}
                  </span>
                </div>

                <div className="mt-2 text-gray-600">
                  <div className="flex items-center mt-2">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="text-gray-400 mr-2"
                    />
                    {application.job.company.companyName}
                  </div>

                  <div className="flex items-center mt-2">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="text-gray-400 mr-2"
                    />
                    {application.job.location}
                  </div>

                  <div className="flex items-center mt-2">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="text-gray-400 mr-2"
                    />
                    Applied on {formatDate(application.createdAt)}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      Match Score
                    </span>
                    <span className="text-sm font-medium text-gray-700">
                      {application.matchScore}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${application.matchScore}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-6 flex justify-center">
                  <span className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                    View Details
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="text-gray-500 mb-4">
            {searchTerm || filter !== "all"
              ? "No applications found matching your filters."
              : "You haven't applied to any jobs yet."}
          </div>
          <Link
            to="/candidate/jobs"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
          >
            Browse Available Jobs
          </Link>
        </div>
      )}
    </div>
  );
};

export default ApplicationDashboard;
