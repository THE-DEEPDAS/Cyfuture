import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import api from "../../utils/api";

const CandidateAnalysis = () => {
  const { id } = useParams(); // Application ID
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/applications/${id}`);
        setApplication(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching application:", err);
        setError("Failed to load candidate analysis. Please try again later.");
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  // Helper function to get color based on score
  const getScoreColor = (score) => {
    if (score >= 90) return "text-success-500";
    if (score >= 75) return "text-primary-500";
    if (score >= 60) return "text-warning-500";
    return "text-error-500";
  };

  // Helper function to get background color based on score
  const getScoreBgColor = (score) => {
    if (score >= 90) return "bg-success-500/20";
    if (score >= 75) return "bg-primary-500/20";
    if (score >= 60) return "bg-warning-500/20";
    return "bg-error-500/20";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper to render progress bar
  const renderProgressBar = (score, label) => (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-400">{label}</span>
        <span className={`text-sm font-medium ${getScoreColor(score)}`}>
          {score}%
        </span>
      </div>
      <div className="w-full bg-dark-700 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full ${getScoreBgColor(score)}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );

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

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <FontAwesomeIcon
          icon="exclamation-triangle"
          className="text-4xl text-error-500 mb-4"
        />
        <p className="text-error-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <FontAwesomeIcon
          icon="folder-open"
          className="text-4xl text-gray-500 mb-4"
        />
        <p className="text-gray-500">No application data found</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-background-secondary rounded-lg p-6 shadow-custom-dark">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Candidate Analysis
            </h1>
            <p className="text-gray-300">
              Detailed AI-powered analysis for{" "}
              {application.candidate?.name || "Candidate"} applying to{" "}
              {application.job?.title || "Job"}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-background-secondary text-white rounded-md hover:bg-background-light"
            >
              <FontAwesomeIcon icon="arrow-left" className="mr-2" />
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Match score and summary */}
        <div className="card col-span-1">
          <h2 className="text-xl font-semibold text-white mb-6">Match Score</h2>

          <div className="flex justify-center mb-6">
            <div
              className={`relative flex items-center justify-center w-36 h-36 rounded-full ${getScoreBgColor(
                application.matchScore || 0
              )}`}
            >
              <div className="w-28 h-28 rounded-full bg-background-secondary flex items-center justify-center">
                <span
                  className={`text-4xl font-bold ${getScoreColor(
                    application.matchScore || 0
                  )}`}
                >
                  {application.matchScore || 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-background-secondary mb-4">
            <h3 className="font-medium text-white mb-2">Application Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-white capitalize">
                  {application.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Applied:</span>
                <span className="text-white">
                  {formatDate(application.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Resume:</span>
                <a
                  href={application.resume?.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300"
                >
                  View Resume
                </a>
              </div>
            </div>
          </div>

          {application.analysisDetails?.summary && (
            <div>
              <h3 className="font-medium text-white mb-2">Summary</h3>
              <p className="text-gray-300 text-sm">
                {application.analysisDetails.summary}
              </p>
            </div>
          )}
        </div>

        {/* Center column - Factor scores */}
        <div className="card col-span-1">
          <h2 className="text-xl font-semibold text-white mb-6">
            Factor Analysis
          </h2>

          {application.analysisDetails?.factorScores ? (
            <div className="space-y-6">
              {application.analysisDetails.factorScores.skills && (
                <div>
                  {renderProgressBar(
                    application.analysisDetails.factorScores.skills.score,
                    "Skills Match"
                  )}
                  <p className="mt-2 text-sm text-gray-400">
                    {
                      application.analysisDetails.factorScores.skills
                        .justification
                    }
                  </p>
                </div>
              )}

              {application.analysisDetails.factorScores.experience && (
                <div>
                  {renderProgressBar(
                    application.analysisDetails.factorScores.experience.score,
                    "Experience Relevance"
                  )}
                  <p className="mt-2 text-sm text-gray-400">
                    {
                      application.analysisDetails.factorScores.experience
                        .justification
                    }
                  </p>
                </div>
              )}

              {application.analysisDetails.factorScores.education && (
                <div>
                  {renderProgressBar(
                    application.analysisDetails.factorScores.education.score,
                    "Education Fit"
                  )}
                  <p className="mt-2 text-sm text-gray-400">
                    {
                      application.analysisDetails.factorScores.education
                        .justification
                    }
                  </p>
                </div>
              )}

              {application.analysisDetails.factorScores.profileCompleteness && (
                <div>
                  {renderProgressBar(
                    application.analysisDetails.factorScores.profileCompleteness
                      .score,
                    "Profile Completeness"
                  )}
                  <p className="mt-2 text-sm text-gray-400">
                    {
                      application.analysisDetails.factorScores
                        .profileCompleteness.justification
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <FontAwesomeIcon
                icon="chart-bar"
                className="text-3xl text-gray-600 mb-3"
              />
              <p className="text-gray-400 text-center">
                Detailed factor analysis not available for this application.
              </p>
            </div>
          )}
        </div>

        {/* Right column - Strengths and gaps */}
        <div className="card col-span-1">
          <h2 className="text-xl font-semibold text-white mb-6">
            Strengths & Gaps
          </h2>

          {application.analysisDetails?.strengths?.length > 0 ||
          application.analysisDetails?.gaps?.length > 0 ? (
            <div className="space-y-6">
              {application.analysisDetails?.strengths?.length > 0 && (
                <div>
                  <h3 className="font-medium text-success-500 mb-3">
                    Key Strengths
                  </h3>
                  <ul className="space-y-2">
                    {application.analysisDetails.strengths.map(
                      (strength, index) => (
                        <li key={index} className="flex items-start">
                          <FontAwesomeIcon
                            icon="check-circle"
                            className="text-success-500 mt-1 mr-2"
                          />
                          <span className="text-gray-300">{strength}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {application.analysisDetails?.gaps?.length > 0 && (
                <div>
                  <h3 className="font-medium text-warning-500 mb-3">
                    Potential Gaps
                  </h3>
                  <ul className="space-y-2">
                    {application.analysisDetails.gaps.map((gap, index) => (
                      <li key={index} className="flex items-start">
                        <FontAwesomeIcon
                          icon="exclamation-circle"
                          className="text-warning-500 mt-1 mr-2"
                        />
                        <span className="text-gray-300">{gap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <FontAwesomeIcon
                icon="list"
                className="text-3xl text-gray-600 mb-3"
              />
              <p className="text-gray-400 text-center">
                Strengths and gaps analysis not available for this application.
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-dark-700">
            <h3 className="font-medium text-white mb-3">Actions</h3>
            <div className="space-y-2">
              <button
                onClick={() =>
                  navigate(`/company/candidates/${application._id}`)
                }
                className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md transition-colors"
              >
                <FontAwesomeIcon icon="eye" className="mr-2" />
                View Full Application
              </button>

              <button
                onClick={() =>
                  navigate(`/company/candidates/${application._id}/message`)
                }
                className="w-full py-2 px-4 bg-background-secondary hover:bg-background-light text-white rounded-md transition-colors"
              >
                <FontAwesomeIcon icon="envelope" className="mr-2" />
                Message Candidate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Full LLM rationale */}
      {application.llmRationale && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              AI Analysis Details
            </h2>
            <button
              className="text-sm text-primary-400 hover:text-primary-300"
              onClick={() => {
                // Copy to clipboard functionality
                navigator.clipboard.writeText(application.llmRationale);
                alert("Analysis copied to clipboard!");
              }}
            >
              <FontAwesomeIcon icon="copy" className="mr-1" />
              Copy
            </button>
          </div>
          <div className="bg-background-secondary p-4 rounded-lg">
            <pre className="text-gray-300 whitespace-pre-wrap text-sm font-mono">
              {application.llmRationale}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateAnalysis;
