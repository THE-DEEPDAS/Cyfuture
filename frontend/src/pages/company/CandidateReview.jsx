import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFilter,
  faSort,
  faStar as farStar,
  faEnvelope,
  faChevronDown,
  faCheck,
  faTimes,
  faExternalLinkAlt,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";
import BulkMessageModal from "../../components/company/BulkMessageModal";
import Loading from "../../components/common/Loading";
import Message from "../../components/common/Message";
import api from "../../utils/api";

const CandidateReview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get("job");

  const [selectedJob, setSelectedJob] = useState(jobId || "all");
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showBulkMessageModal, setShowBulkMessageModal] = useState(false);
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [llmExplanations, setLlmExplanations] = useState({});
  const [matchingScores, setMatchingScores] = useState({});
  const [sortBy, setSortBy] = useState("score"); // 'score' or 'date'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch jobs for the company
        const jobsResponse = await api.get("/api/jobs/company/me");
        setJobs(jobsResponse.data);

        // If a specific job is selected, fetch its applications with LLM insights
        if (selectedJob && selectedJob !== "all") {
          const [applicationsResponse, llmResponse, scoresResponse] =
            await Promise.all([
              api.get(`/api/applications/job/${selectedJob}`),
              api.get(`/api/applications/job/${selectedJob}/llm-analysis`),
              api.get(`/api/applications/job/${selectedJob}/matching-scores`),
            ]);

          setApplications(applicationsResponse.data);
          setLlmExplanations(llmResponse.data.explanations);
          setMatchingScores(scoresResponse.data.scores);

          // Get shortlisted candidates from the job data
          const jobDetails = jobsResponse.data.find(
            (job) => job._id === selectedJob
          );
          if (jobDetails?.shortlistedCandidates) {
            setShortlistedCandidates(jobDetails.shortlistedCandidates);
          }
        } else {
          const applicationsResponse = await api.get(
            "/api/applications/company"
          );
          setApplications(applicationsResponse.data);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedJob]);

  const handleShortlist = async (applicationId) => {
    try {
      await api.post(`/api/applications/${applicationId}/shortlist`);
      setShortlistedCandidates((prev) => [...prev, applicationId]);
      // Show success message or update UI
    } catch (err) {
      setError(err.response?.data?.message || "Failed to shortlist candidate");
    }
  };

  const handleRemoveShortlist = async (applicationId) => {
    try {
      await api.delete(`/api/applications/${applicationId}/shortlist`);
      setShortlistedCandidates((prev) =>
        prev.filter((id) => id !== applicationId)
      );
      // Show success message or update UI
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to remove from shortlist"
      );
    }
  };

  // Filter and sort applications
  const filteredApplications = applications
    .filter((app) => {
      if (filterStatus === "all") return true;
      if (filterStatus === "shortlisted")
        return shortlistedCandidates.includes(app._id);
      return app.status === filterStatus;
    })
    .sort((a, b) => {
      if (sortBy === "score") {
        return (matchingScores[b._id] || 0) - (matchingScores[a._id] || 0);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const renderMatchingScores = (applicationId) => {
    const scores = matchingScores[applicationId];
    if (!scores) return null;

    return (
      <div className="mt-2 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">Skills Match:</span>
          <span className="text-primary-400">{scores.skills}%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Experience Match:</span>
          <span className="text-primary-400">{scores.experience}%</span>
        </div>
        <div className="flex justify-between font-medium">
          <span className="text-gray-300">Total Score:</span>
          <span className="text-primary-500">{scores.total}%</span>
        </div>
      </div>
    );
  };

  const renderLLMExplanation = (applicationId) => {
    const explanation = llmExplanations[applicationId];
    if (!explanation) return null;

    return (
      <div className="mt-3 p-3 bg-background-light rounded-lg">
        <h4 className="text-sm font-medium text-primary-400 mb-2">
          AI Analysis
        </h4>
        <p className="text-sm text-gray-300">{explanation}</p>
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <Message variant="error">{error}</Message>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Candidate Review</h1>
        <div className="flex items-center space-x-4">
          {/* Job Filter Dropdown */}
          <select
            value={selectedJob}
            onChange={(e) => setSelectedJob(e.target.value)}
            className="bg-background-light text-white border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="all">All Jobs</option>
            {jobs.map((job) => (
              <option key={job._id} value={job._id}>
                {job.title}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-background-light text-white border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="all">All Status</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-background-light text-white border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="score">Sort by Match Score</option>
            <option value="date">Sort by Date</option>
          </select>

          {/* Bulk Message Button */}
          <button
            onClick={() => setShowBulkMessageModal(true)}
            className="btn btn-primary"
          >
            <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
            Bulk Message
          </button>
        </div>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApplications.map((application) => (
          <div
            key={application._id}
            className="bg-background-secondary rounded-lg p-6 border border-gray-700"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">
                  {application.candidate.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  Applied for: {application.job.title}
                </p>
              </div>
              <button
                onClick={() => handleShortlist(application._id)}
                className="text-2xl focus:outline-none"
              >
                <FontAwesomeIcon
                  icon={
                    shortlistedCandidates.includes(application._id)
                      ? faStar
                      : faStarOutline
                  }
                  className={
                    shortlistedCandidates.includes(application._id)
                      ? "text-yellow-400"
                      : "text-gray-400 hover:text-yellow-400"
                  }
                />
              </button>
            </div>

            {/* Matching Score */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-400 mb-2">
                Match Score
              </h4>
              <div className="flex items-center space-x-2">
                <div
                  className={`text-lg font-semibold ${
                    (matchingScores[application._id] || 0) >= 0.8
                      ? "text-success-500"
                      : (matchingScores[application._id] || 0) >= 0.6
                      ? "text-warning-500"
                      : "text-error-500"
                  }`}
                >
                  {Math.round((matchingScores[application._id] || 0) * 100)}%
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      (matchingScores[application._id] || 0) >= 0.8
                        ? "bg-success-500"
                        : (matchingScores[application._id] || 0) >= 0.6
                        ? "bg-warning-500"
                        : "bg-error-500"
                    }`}
                    style={{
                      width: `${Math.round(
                        (matchingScores[application._id] || 0) * 100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {renderMatchingScores(application._id)}

            {/* LLM Explanation */}
            {renderLLMExplanation(application._id)}

            {/* Actions */}
            <div className="flex justify-between items-center mt-4">
              <Link
                to={`/applications/${application._id}`}
                className="text-primary-400 hover:text-primary-300 text-sm"
              >
                View Details
                <FontAwesomeIcon icon={faExternalLinkAlt} className="ml-1" />
              </Link>
              <div className="space-x-2">
                <button
                  onClick={() =>
                    handleUpdateStatus(application._id, "accepted")
                  }
                  className="btn btn-sm btn-success"
                >
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  onClick={() =>
                    handleUpdateStatus(application._id, "rejected")
                  }
                  className="btn btn-sm btn-error"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <FontAwesomeIcon
            icon={faFilter}
            className="text-4xl text-gray-600 mb-4"
          />
          <h3 className="text-xl font-medium text-gray-400 mb-2">
            No applications found
          </h3>
          <p className="text-gray-500">
            {filterStatus !== "all"
              ? "Try changing your filters"
              : "No applications have been submitted yet"}
          </p>
        </div>
      )}

      {/* Bulk Message Modal */}
      {showBulkMessageModal && (
        <BulkMessageModal
          onClose={() => setShowBulkMessageModal(false)}
          applications={applications}
          shortlistedCandidates={shortlistedCandidates}
        />
      )}
    </div>
  );
};

export default CandidateReview;
