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
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons";
import { toast } from "react-toastify";
import BulkMessageModal from "../../components/company/BulkMessageModal";
import Loading from "../../components/common/Loading";
import Message from "../../components/common/Message";
import ErrorBoundary from "../../components/common/ErrorBoundary";
import api from "../../utils/api";

const CandidateReview = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobId = searchParams.get("job");

  const [selectedJob, setSelectedJob] = useState(jobId || "all");
  // Ensure applications is always an array
  const [applications, setApplications] = useState(
    /** @type {Array<{_id: string, candidate: any, job: any, status: string, createdAt: string}>} */ []
  );
  const [jobs, setJobs] = useState(
    /** @type {Array<{_id: string, title: string}>} */ []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showBulkMessageModal, setShowBulkMessageModal] = useState(false);
  const [shortlistedCandidates, setShortlistedCandidates] = useState([]);
  const [llmExplanations, setLlmExplanations] = useState({});
  const [matchingScores, setMatchingScores] = useState({});
  const [sortBy, setSortBy] = useState("score");
  const [sortDirection, setSortDirection] = useState("desc");
  const [actionLoading, setActionLoading] = useState(false);
  const [bulkActionInProgress, setBulkActionInProgress] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use Promise.allSettled for better error handling
        const [jobsResult, applicationsResult, llmResult, scoresResult] =
          await Promise.allSettled([
            api.get("/jobs/company/me"),
            selectedJob !== "all"
              ? api.get(`/applications/job/${selectedJob}`)
              : api.get("/applications/company"),
            selectedJob !== "all"
              ? api.get(`/applications/job/${selectedJob}/llm-analysis`)
              : Promise.resolve({ data: { explanations: {} } }),
            selectedJob !== "all"
              ? api.get(`/applications/job/${selectedJob}/matching-scores`)
              : Promise.resolve({ data: { scores: {} } }),
          ]);

        // Handle jobs result
        if (
          jobsResult.status === "fulfilled" &&
          Array.isArray(jobsResult.value?.data)
        ) {
          setJobs(jobsResult.value.data);
          if (selectedJob !== "all") {
            const jobDetails = jobsResult.value.data.find(
              (job) => job?._id === selectedJob
            );
            if (jobDetails?.shortlistedCandidates) {
              setShortlistedCandidates(jobDetails.shortlistedCandidates);
            }
          }
        } else {
          setJobs([]);
          toast.error("Failed to fetch jobs");
        }

        // Handle applications result
        if (
          applicationsResult.status === "fulfilled" &&
          applicationsResult.value?.data
        ) {
          const responseData = applicationsResult.value.data;

          if (Array.isArray(responseData)) {
            const validApplications = responseData.filter(
              (app) =>
                app &&
                typeof app === "object" &&
                app._id &&
                app.candidate &&
                app.job
            );

            setApplications(validApplications);

            if (validApplications.length < responseData.length) {
              console.warn(
                "Some applications were filtered out due to invalid data"
              );
            }
          } else {
            console.error("Invalid applications data received:", responseData);
            setApplications([]);
            toast.error("Received invalid applications data format");
          }
        } else {
          const error =
            applicationsResult.reason?.response?.data?.message ||
            applicationsResult.reason?.message ||
            "Failed to fetch applications";
          console.error("Applications fetch failed:", error);
          setApplications([]);
          toast.error(error);
        }

        // Handle LLM analysis result
        if (
          llmResult.status === "fulfilled" &&
          llmResult.value?.data?.explanations
        ) {
          setLlmExplanations(llmResult.value.data.explanations);
        } else {
          setLlmExplanations({});
        }

        // Handle matching scores result
        if (
          scoresResult.status === "fulfilled" &&
          scoresResult.value?.data?.scores
        ) {
          setMatchingScores(scoresResult.value.data.scores);
        } else {
          setMatchingScores({});
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
    if (actionLoading) return;

    try {
      setActionLoading(true);
      await api.post(`/applications/${applicationId}/shortlist`);
      setShortlistedCandidates((prev) => [...prev, applicationId]);
      toast.success("Candidate shortlisted successfully");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to shortlist candidate"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveShortlist = async (applicationId) => {
    if (actionLoading) return;

    try {
      setActionLoading(true);
      await api.delete(`/applications/${applicationId}/shortlist`);
      setShortlistedCandidates((prev) =>
        prev.filter((id) => id !== applicationId)
      );
      toast.success("Candidate removed from shortlist");
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to remove from shortlist"
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkAction = async (action, candidates) => {
    if (bulkActionInProgress) return;

    try {
      setBulkActionInProgress(true);
      const results = await Promise.allSettled(
        candidates.map((id) => api.post(`/applications/${id}/${action}`))
      );

      // Count successes and failures
      const successes = results.filter((r) => r.status === "fulfilled").length;
      const failures = results.filter((r) => r.status === "rejected").length;

      if (failures === 0) {
        toast.success(`Successfully ${action}ed all ${successes} candidates`);
      } else if (successes === 0) {
        toast.error(`Failed to ${action} any candidates`);
      } else {
        toast.warning(
          `${action} completed with ${successes} successes and ${failures} failures`
        );
      } // Refresh the data
      const freshData = await api.get(
        selectedJob !== "all"
          ? `/applications/job/${selectedJob}`
          : "/applications/company"
      );

      if (freshData?.data && Array.isArray(freshData.data)) {
        const validApplications = freshData.data.filter(
          (app) =>
            app &&
            typeof app === "object" &&
            app._id &&
            app.candidate &&
            app.job
        );
        setApplications(validApplications);
      } else {
        setApplications([]);
        console.error("Received invalid data format after bulk action");
      }
    } catch (err) {
      toast.error(`Failed to ${action} candidates: ${err.message}`);
    } finally {
      setBulkActionInProgress(false);
      setSelectedCandidates(new Set());
    }
  }; // Filter and sort applications with safety checks
  const safeApplications = Array.isArray(applications) ? applications : [];
  const filteredApplications = safeApplications
    .filter((app) => {
      if (!app || typeof app !== "object") return false;
      if (filterStatus === "all") return true;
      if (filterStatus === "shortlisted") {
        return (
          Array.isArray(shortlistedCandidates) &&
          shortlistedCandidates.includes(app._id)
        );
      }
      return app.status === filterStatus;
    })
    .sort((a, b) => {
      if (sortBy === "score") {
        const scoreA = matchingScores[a._id];
        const scoreB = matchingScores[b._id];
        return (
          (typeof scoreB === "number" ? scoreB : 0) -
          (typeof scoreA === "number" ? scoreA : 0)
        );
      }
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return isNaN(dateB) || isNaN(dateA) ? 0 : dateB - dateA;
    });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("desc");
    }
  };

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
  const handleStatusChange = async (applicationId, status) => {
    if (actionLoading) return;

    try {
      setActionLoading(true);
      await api.put(`/applications/${applicationId}/status`, { status });

      // Update the application status locally
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );

      toast.success(`Application marked as ${status}`);
    } catch (err) {
      toast.error(
        err.response?.data?.message || `Failed to update application status`
      );
    } finally {
      setActionLoading(false);
    }
  };
  const handleApplicationAction = async (applicationId, action) => {
    if (actionLoading) return;

    try {
      setActionLoading(true);
      let status;
      let endpoint;

      switch (action) {
        case "accept":
          status = "accepted";
          endpoint = "accept";
          break;
        case "reject":
          status = "rejected";
          endpoint = "reject";
          break;
        case "hire":
          status = "hired";
          endpoint = "hire";
          break;
        case "shortlist":
          status = "shortlisted";
          endpoint = "shortlist";
          break;
        default:
          throw new Error("Invalid action");
      }

      // Use the specific endpoint for each action
      await api.post(`/applications/${applicationId}/${endpoint}`);

      // Update application status locally
      setApplications((prevApplications) =>
        prevApplications.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );

      // Update shortlist if needed
      if (action === "shortlist") {
        setShortlistedCandidates((prev) => [...prev, applicationId]);
      } else if (status === "rejected") {
        setShortlistedCandidates((prev) =>
          prev.filter((id) => id !== applicationId)
        );
      }

      toast.success(`Candidate ${action}ed successfully`);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || `Failed to ${action} candidate`;
      console.error(`Error ${action}ing candidate:`, err);
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Message variant="error">{error}</Message>;

  return (
    <ErrorBoundary>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Add error handling for missing applications data */}
        {!Array.isArray(applications) && !loading && (
          <Message variant="error">
            Failed to load applications data. Please refresh the page.
          </Message>
        )}

        {/* Header Section */}
        <div className="mb-6 flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-white">Candidate Review</h1>
          <div className="flex flex-wrap items-center gap-4">
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

            {/* Bulk Actions */}
            {selectedCandidates.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleBulkAction(
                      "shortlist",
                      Array.from(selectedCandidates)
                    )
                  }
                  className="btn btn-success btn-sm"
                  disabled={bulkActionInProgress}
                >
                  <FontAwesomeIcon icon={faCheck} className="mr-2" />
                  Shortlist Selected
                </button>
                <button
                  onClick={() =>
                    handleBulkAction("reject", Array.from(selectedCandidates))
                  }
                  className="btn btn-error btn-sm"
                  disabled={bulkActionInProgress}
                >
                  <FontAwesomeIcon icon={faTimes} className="mr-2" />
                  Reject Selected
                </button>
              </div>
            )}

            {/* Bulk Message Button */}
            <button
              onClick={() => setShowBulkMessageModal(true)}
              className="btn btn-primary"
              disabled={bulkActionInProgress}
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
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.has(application._id)}
                      onChange={(e) => {
                        const newSelected = new Set(selectedCandidates);
                        if (e.target.checked) {
                          newSelected.add(application._id);
                        } else {
                          newSelected.delete(application._id);
                        }
                        setSelectedCandidates(newSelected);
                      }}
                      className="form-checkbox h-4 w-4"
                    />
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {application.candidate.name}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Applied for: {application.job.title}
                  </p>
                </div>
                <button
                  onClick={() =>
                    shortlistedCandidates.includes(application._id)
                      ? handleRemoveShortlist(application._id)
                      : handleShortlist(application._id)
                  }
                  disabled={actionLoading}
                  className="text-2xl focus:outline-none"
                >
                  <FontAwesomeIcon
                    icon={
                      shortlistedCandidates.includes(application._id)
                        ? farStar
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
                </div>{" "}
              </div>
              {renderMatchingScores(application._id)}
              {renderLLMExplanation(application._id)}
              {/* Actions */}
              <div className="flex justify-between items-center mt-4">
                <Link
                  to={`/company/applications/${application._id}`}
                  className="text-primary-400 hover:text-primary-300 text-sm flex items-center"
                >
                  <FontAwesomeIcon icon={faEye} className="mr-1" />
                  View Details
                </Link>
                {!["accepted", "rejected", "hired"].includes(
                  application.status
                ) && (
                  <div className="space-x-2">
                    <button
                      onClick={() =>
                        handleApplicationAction(application._id, "accept")
                      }
                      disabled={actionLoading}
                      className="btn btn-sm btn-success"
                    >
                      <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                      onClick={() =>
                        handleApplicationAction(application._id, "reject")
                      }
                      disabled={actionLoading}
                      className="btn btn-sm btn-error"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                )}
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
            applications={
              Array.from(selectedCandidates).length > 0
                ? applications.filter((app) => selectedCandidates.has(app._id))
                : applications
            }
            selectedJob={selectedJob === "all" ? null : selectedJob}
            shortlistedCandidates={shortlistedCandidates}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CandidateReview;
