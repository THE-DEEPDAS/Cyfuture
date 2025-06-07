// Candidate's application detail view
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faFileAlt,
  faBuilding,
  faCalendarAlt,
  faTag,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../utils/api";
import { getApplicationById } from "../../services/applicationService";
import InterviewChat from "../interviews/InterviewChat";
import RejectionExplanation from "./RejectionExplanation";

const CandidateApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewing: "bg-blue-100 text-blue-800",
    shortlisted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    hired: "bg-purple-100 text-purple-800",
    accepted: "bg-green-100 text-green-800",
  };

  // Format date utility
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Fetch application data
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const data = await getApplicationById(id);
        setApplication(data);
      } catch (error) {
        console.error("Error fetching application:", error);
        toast.error("Failed to load application details");
        navigate("/applications");
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id, navigate]);

  // Handle new messages from the interview chat
  const handleNewMessages = (messages) => {
    if (application && messages) {
      setApplication((prev) => ({
        ...prev,
        messages,
      }));
    }
  };

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

  if (!application) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-gray-700">
          Application not found
        </h2>
        <button
          onClick={() => navigate("/applications")}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button
        onClick={() => navigate("/applications")}
        className="flex items-center mb-6 text-primary hover:text-primary-dark transition-colors"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to My Applications
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Application details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6 border-b">
              <h1 className="text-xl font-bold">Application Status</h1>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h2 className="font-semibold text-lg mb-2">
                  {application.job.title}
                </h2>
                <p className="text-gray-600">
                  {application.job.company.companyName}
                </p>
                <p className="text-gray-600">{application.job.location}</p>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    statusColors[application.status]
                  }`}
                >
                  {application.status.charAt(0).toUpperCase() +
                    application.status.slice(1)}
                </span>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Match Score</div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                    <div
                      className="bg-primary h-2.5 rounded-full"
                      style={{ width: `${application.matchScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">
                    {application.matchScore}%
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Applied on</div>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faCalendarAlt}
                    className="mr-2 text-gray-500"
                  />
                  {formatDate(application.createdAt)}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Job Type</div>
                <div className="flex items-center">
                  <FontAwesomeIcon
                    icon={faTag}
                    className="mr-2 text-gray-500"
                  />
                  {application.job.type || "Full-time"}
                </div>
              </div>

              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Company</div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="text-gray-500"
                    />
                  </div>
                  <div>
                    <div className="font-medium">
                      {application.job.company.companyName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {application.job.location}
                    </div>
                  </div>
                </div>
              </div>

              {application.coverLetter && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-1">
                    Your Cover Letter
                  </div>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {application.coverLetter}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rejection explanation */}
          <RejectionExplanation application={application} />

          {/* Resume link */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Submitted Resume</h2>
            </div>

            <div className="p-6">
              <a
                href={application.resume?.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                View Your Resume
              </a>
            </div>
          </div>
        </div>

        {/* Interview chat */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Interview Chat</h2>
              <div className="mt-2 text-sm text-gray-600">
                Communicate with the employer and respond to interview
                questions.
              </div>
            </div>

            <div
              className="flex-grow flex flex-col"
              style={{ height: "600px" }}
            >
              <InterviewChat
                applicationId={id}
                messages={application.messages || []}
                onNewMessage={handleNewMessages}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateApplicationDetail;
