import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faPaperPlane,
  faSpinner,
  faCheckCircle,
  faTimesCircle,
  faFileAlt,
  faUser,
  faBuilding,
  faRobot,
  faCircle,
  faStar,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import {
  getApplicationById,
  updateApplicationStatus,
  sendApplicationMessage,
  shortlistCandidate,
  removeFromShortlist,
  evaluateScreeningResponses,
} from "../../services/applicationService";

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const chatEndRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [resumePreview, setResumePreview] = useState(null);
  const [expandedSection, setExpandedSection] = useState("skills");

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    reviewing: "bg-blue-100 text-blue-800",
    shortlisted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    hired: "bg-purple-100 text-purple-800",
  };

  // Scroll chat to bottom whenever messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [application?.messages]);

  // Fetch application data
  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/applications/${id}`);
        setApplication(response.data);

        // Also fetch resume preview data if available
        if (response.data?.resume?.parsedData) {
          setResumePreview(response.data.resume.parsedData);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching application:", error);
        toast.error(
          error.response?.data?.message || "Failed to load application details"
        );
        navigate(-1);
      }
    };

    fetchApplication();
  }, [id, navigate]);
  // Send a new message
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      const newMessage = {
        content: message,
        sender: "company",
        createdAt: new Date().toISOString(),
      };

      // Show message optimistically
      setApplication((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage],
      }));

      // Clear input
      setMessage(""); // Make API call using service
      const updatedMessages = await sendApplicationMessage(id, message);

      // Update with actual message data
      if (updatedMessages && Array.isArray(updatedMessages)) {
        setApplication((prev) => ({
          ...prev,
          messages: updatedMessages,
        }));
      } else if (
        updatedMessages &&
        updatedMessages.messages &&
        Array.isArray(updatedMessages.messages)
      ) {
        // Handle case where full application object is returned
        setApplication((prev) => ({
          ...prev,
          messages: updatedMessages.messages,
        }));
      } else {
        console.warn(
          "Received unexpected message format from API:",
          updatedMessages
        );
        // Attempt to fetch fresh application data
        try {
          const response = await api.get(`/applications/${id}/messages`);
          if (response.data && Array.isArray(response.data)) {
            setApplication((prev) => ({
              ...prev,
              messages: response.data,
            }));
          } else {
            // If message-only endpoint fails, try full application
            const updatedApplication = await getApplicationById(id);
            setApplication(updatedApplication);
          }
        } catch (fetchError) {
          console.error("Error fetching updated messages:", fetchError);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(error.response?.data?.message || "Failed to send message");

      // Revert optimistic update
      setApplication((prev) => ({
        ...prev,
        messages: prev.messages.slice(0, -1),
      }));
      setMessage(message); // Restore message in input
    } finally {
      setSending(false);
    }
  };
  // Handle status updates
  const handleStatusChange = async (newStatus) => {
    try {
      toast.info(`Updating application status to ${newStatus}...`);

      // Send status update request using service
      const response = await updateApplicationStatus(id, newStatus);

      // Update local state with a short delay to ensure DOM updates properly
      setTimeout(() => {
        setApplication((prev) => ({
          ...prev,
          status: response.status,
          messages: response.messages, // API returns updated messages including system message
        }));

        // Force a re-render by triggering a small state change
        setSending(true);
        setTimeout(() => setSending(false), 50);

        toast.success(`Application status updated to ${newStatus}`);
      }, 300);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update application status");
    }
  }; // Handle real-time updates with polling
  useEffect(() => {
    let pollInterval;
    let isPolling = false;

    // Create a throttled polling function
    const pollForUpdates = async () => {
      // If already polling, skip this cycle
      if (isPolling) return;

      try {
        isPolling = true;

        // Only poll if we have an application
        if (id) {
          // Only poll for new messages, without triggering full application refresh
          const response = await api.get(`/applications/${id}/messages`);

          // Only update if there are changes in message count or content
          setApplication((prev) => {
            if (
              !prev ||
              !prev.messages ||
              !response.data ||
              prev.messages.length !== response.data.length
            ) {
              // If message count changed, update messages
              if (prev && response.data) {
                return {
                  ...prev,
                  messages: response.data,
                };
              }
            }
            return prev;
          });
        }
      } catch (error) {
        // Only log critical errors, not 403/401 which might happen during transitions
        if (
          error.response &&
          error.response.status !== 403 &&
          error.response.status !== 401
        ) {
          console.error("Error polling for updates:", error);
        }
      } finally {
        isPolling = false;
      }
    };

    // Initial poll after component mount but with a delay to prevent immediate polling
    const initialPollTimeout = setTimeout(pollForUpdates, 10000);

    // Set up polling interval with a longer interval to reduce API calls
    pollInterval = setInterval(pollForUpdates, 60000); // Poll every 60 seconds

    return () => {
      clearInterval(pollInterval);
      clearTimeout(initialPollTimeout);
    };
  }, [id]);

  // Format date utilities
  const formatDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // If today, show time only
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // If yesterday, show "Yesterday" and time
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Otherwise show full date and time
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Get icon for message sender
  const getSenderIcon = (sender) => {
    switch (sender) {
      case "candidate":
        return faUser;
      case "company":
        return faBuilding;
      case "system":
        return faRobot;
      default:
        return faUser;
    }
  };

  // Function to toggle expanded sections
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  // Function to handle AI evaluation of screening responses
  const handleEvaluateResponses = async () => {
    try {
      toast.info("Analyzing candidate responses with AI...");
      const updatedApplication = await evaluateScreeningResponses(id);

      if (updatedApplication) {
        setApplication(updatedApplication);
        toast.success("Screening responses evaluated successfully");
      }
    } catch (error) {
      console.error("Error evaluating responses:", error);
      toast.error("Failed to evaluate screening responses");
    }
  };

  // Function to start an automated interview
  const handleStartInterview = async () => {
    try {
      setSending(true);
      toast.info("Starting automated interview...");

      // First check if there's a simpler way - using the /interview command
      const messageResponse = await api.post(`/applications/${id}/messages`, {
        content: "/interview",
      });

      if (messageResponse.data) {
        // Update the messages in our application state
        if (Array.isArray(messageResponse.data)) {
          setApplication((prev) => ({
            ...prev,
            messages: messageResponse.data,
          }));
        } else if (messageResponse.data.messages) {
          setApplication((prev) => ({
            ...prev,
            messages: messageResponse.data.messages,
          }));
        }

        toast.success("Automated interview started successfully");
        return;
      }

      // If that fails, use the dedicated interview endpoint
      const response = await api.post(`/applications/${id}/interview`);

      if (response.data && response.data.messages) {
        // Update the messages in our application state
        setApplication((prev) => ({
          ...prev,
          messages: response.data.messages,
        }));

        toast.success("Automated interview started successfully");
      }
    } catch (error) {
      console.error("Error starting interview:", error);
      toast.error("Failed to start automated interview");
    } finally {
      setSending(false);
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-primary hover:text-primary-dark transition-colors"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        Back to Applications
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Application details */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6 border-b">
              <h1 className="text-xl font-bold">Application Details</h1>
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
              {/* Status change actions for company */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-2">Change Status</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange("reviewing")}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      application.status === "reviewing"
                        ? "bg-blue-500 text-white"
                        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                    }`}
                    disabled={application.status === "reviewing"}
                  >
                    Reviewing
                  </button>
                  <button
                    onClick={() => handleStatusChange("shortlisted")}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      application.status === "shortlisted"
                        ? "bg-green-500 text-white"
                        : "bg-green-100 text-green-800 hover:bg-green-200"
                    }`}
                    disabled={application.status === "shortlisted"}
                  >
                    Shortlist
                  </button>
                  <button
                    onClick={() => handleStatusChange("rejected")}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      application.status === "rejected"
                        ? "bg-red-500 text-white"
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                    }`}
                    disabled={application.status === "rejected"}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleStatusChange("hired")}
                    className={`px-3 py-1 rounded-md text-xs font-medium ${
                      application.status === "hired"
                        ? "bg-purple-500 text-white"
                        : "bg-purple-100 text-purple-800 hover:bg-purple-200"
                    }`}
                    disabled={application.status === "hired"}
                  >
                    Hire
                  </button>
                </div>
              </div>{" "}
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
                {application.interviewEvaluation && (
                  <div className="mt-2 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Resume Match:</span>
                      <span>
                        {application.matchingScores?.overallScore ||
                          Math.round(application.matchScore * 0.7)}
                        %
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Interview Score:</span>
                      <span>
                        {application.interviewEvaluation.avgScore || 0}%
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 italic">
                      * Match score combines resume match (70%) and interview
                      performance (30%)
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Applied on</div>
                <div>{formatDate(application.createdAt)}</div>
              </div>
              {application.llmRationale && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-1">AI Analysis</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {application.llmRationale}
                  </div>
                </div>
              )}
              {/* Candidate Information */}
              <div className="mb-6">
                <div className="text-sm text-gray-500 mb-1">Candidate</div>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                    <FontAwesomeIcon icon={faUser} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">
                      {application.candidate?.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {application.candidate?.email}
                    </div>
                  </div>
                </div>
              </div>
              {application.coverLetter && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-1">Cover Letter</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {application.coverLetter}
                  </div>
                </div>
              )}
              {/* Screening Responses Section */}
              {application.screeningResponses &&
                application.screeningResponses.length > 0 && (
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-1">
                      Screening Responses
                    </div>
                    <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                      {application.screeningResponses.map((response, index) => (
                        <div
                          key={index}
                          className="mb-3 last:mb-0 p-2 bg-white rounded border border-gray-100"
                        >
                          <div className="font-medium text-gray-700 mb-1">
                            Q{index + 1}:{" "}
                            {response.questionText ||
                              response.question?.question ||
                              "Question not available"}
                          </div>
                          <div className="text-gray-800 pl-2 border-l-2 border-blue-300 py-1">
                            {response.response}
                          </div>
                          {response.llmEvaluation && (
                            <div className="mt-1 text-xs text-gray-500 flex items-center">
                              <span className="mr-1">Score:</span>
                              <span
                                className={
                                  response.llmEvaluation.score >= 80
                                    ? "text-green-500"
                                    : response.llmEvaluation.score >= 60
                                    ? "text-yellow-500"
                                    : "text-red-500"
                                }
                              >
                                {response.llmEvaluation.score}/100
                              </span>
                              {response.llmEvaluation.feedback && (
                                <span className="ml-2 text-gray-500">
                                  - {response.llmEvaluation.feedback}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      ))}{" "}
                      {/* Add state variables for countdown timer */}
                      {(() => {
                        const [countdown, setCountdown] = useState(0);
                        const [isEvaluating, setIsEvaluating] = useState(false);

                        // Effect to handle countdown timer
                        useEffect(() => {
                          // Check if on cooldown
                          const cooldownKey = `ai_eval_cooldown_${id}`;
                          const lastEvalTime =
                            localStorage.getItem(cooldownKey);
                          const cooldownPeriod = 30000; // 30 seconds cooldown

                          if (lastEvalTime) {
                            const now = Date.now();
                            const elapsedTime = now - parseInt(lastEvalTime);

                            if (elapsedTime < cooldownPeriod) {
                              // Still on cooldown, start countdown
                              const remainingTime = Math.ceil(
                                (parseInt(lastEvalTime) +
                                  cooldownPeriod -
                                  now) /
                                  1000
                              );
                              setCountdown(remainingTime);
                              setIsEvaluating(true);

                              // Set up countdown interval
                              const countdownInterval = setInterval(() => {
                                setCountdown((prevCount) => {
                                  if (prevCount <= 1) {
                                    clearInterval(countdownInterval);
                                    setIsEvaluating(false);
                                    return 0;
                                  }
                                  return prevCount - 1;
                                });
                              }, 1000);

                              return () => clearInterval(countdownInterval);
                            }
                          }
                        }, [id]);

                        // Determine button state and text
                        const buttonText = isEvaluating
                          ? `Please wait ${countdown}s`
                          : sending
                          ? "Processing..."
                          : "Analyze Responses with AI";

                        const isDisabled = sending || isEvaluating;

                        return (
                          <button
                            onClick={() => {
                              // Check if evaluation already exists
                              const allEvaluated =
                                application.screeningResponses.every(
                                  (response) =>
                                    response.llmEvaluation &&
                                    response.llmEvaluation.score
                                );

                              // Check localStorage for cooldown
                              const cooldownKey = `ai_eval_cooldown_${id}`;
                              const lastEvalTime =
                                localStorage.getItem(cooldownKey);
                              const now = Date.now();
                              const cooldownPeriod = 30000; // 30 seconds cooldown

                              if (
                                lastEvalTime &&
                                now - parseInt(lastEvalTime) < cooldownPeriod
                              ) {
                                const remainingTime = Math.ceil(
                                  (parseInt(lastEvalTime) +
                                    cooldownPeriod -
                                    now) /
                                    1000
                                );
                                toast.info(
                                  `Please wait ${remainingTime} seconds before analyzing again.`
                                );
                                return;
                              }

                              if (allEvaluated && !lastEvalTime) {
                                toast.info(
                                  "Responses already analyzed. Please wait 30 seconds before analyzing again."
                                );
                                // Set cooldown in localStorage even if already evaluated
                                localStorage.setItem(
                                  cooldownKey,
                                  now.toString()
                                );
                                setIsEvaluating(true);
                                setCountdown(30);
                                return;
                              }

                              try {
                                // Set evaluating state to prevent multiple clicks
                                setSending(true);
                                setIsEvaluating(true);
                                setCountdown(30);

                                // Store evaluation timestamp in localStorage
                                localStorage.setItem(
                                  cooldownKey,
                                  now.toString()
                                );

                                toast.info(
                                  "Analyzing candidate responses with AI..."
                                );
                                api
                                  .post(
                                    `/applications/${id}/evaluate-screening`
                                  )
                                  .then((response) => {
                                    setApplication(response.data);
                                    toast.success(
                                      "Screening responses evaluated successfully"
                                    );
                                  })
                                  .catch((error) => {
                                    console.error(
                                      "Error evaluating responses:",
                                      error
                                    );
                                    toast.error(
                                      "Failed to evaluate screening responses"
                                    );
                                  })
                                  .finally(() => {
                                    // Reset sending state
                                    setSending(false);
                                    // Countdown will continue from the useEffect
                                  });
                              } catch (error) {
                                console.error("Error:", error);
                                toast.error("An error occurred");
                                setSending(false);
                                setIsEvaluating(false);
                              }
                            }}
                            disabled={isDisabled}
                            className={`mt-3 text-xs ${
                              isDisabled
                                ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                                : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                            } font-medium py-1 px-2 rounded border border-blue-200 transition-colors w-full flex justify-center items-center`}
                          >
                            {isEvaluating && (
                              <FontAwesomeIcon
                                icon={faSpinner}
                                spin
                                className="mr-1"
                              />
                            )}
                            {buttonText}
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Resume preview */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Resume</h2>
            </div>

            <div className="p-6">
              <a
                href={application.resume?.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors mb-4"
              >
                <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                View Full Resume
              </a>

              {resumePreview && (
                <div className="mt-2">
                  {/* Skills Section */}
                  <div className="mb-4">
                    <button
                      onClick={() => toggleSection("skills")}
                      className="flex justify-between items-center w-full py-2 text-left font-semibold text-gray-700 hover:text-primary focus:outline-none"
                    >
                      <span>Skills</span>
                      <FontAwesomeIcon
                        icon={
                          expandedSection === "skills" ? faCircle : faCircle
                        }
                        className={
                          expandedSection === "skills"
                            ? "text-primary"
                            : "text-gray-300"
                        }
                        size="xs"
                      />
                    </button>

                    {expandedSection === "skills" && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {resumePreview.skills &&
                        resumePreview.skills.length > 0 ? (
                          resumePreview.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
                            >
                              {skill}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No skills listed
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Experience Section */}
                  <div className="mb-4">
                    <button
                      onClick={() => toggleSection("experience")}
                      className="flex justify-between items-center w-full py-2 text-left font-semibold text-gray-700 hover:text-primary focus:outline-none"
                    >
                      <span>Experience</span>
                      <FontAwesomeIcon
                        icon={
                          expandedSection === "experience" ? faCircle : faCircle
                        }
                        className={
                          expandedSection === "experience"
                            ? "text-primary"
                            : "text-gray-300"
                        }
                        size="xs"
                      />
                    </button>

                    {expandedSection === "experience" && (
                      <div className="mt-2 space-y-3">
                        {resumePreview.experience &&
                        resumePreview.experience.length > 0 ? (
                          resumePreview.experience.map((exp, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-gray-200 pl-3"
                            >
                              <div className="font-medium">{exp.title}</div>
                              <div className="text-sm text-gray-600">
                                {exp.company}
                              </div>
                              <div className="text-xs text-gray-500">
                                {exp.startDate && exp.endDate
                                  ? `${exp.startDate} - ${exp.endDate}`
                                  : exp.durationYears
                                  ? `${exp.durationYears} years`
                                  : "Date not specified"}
                              </div>
                              {exp.description && (
                                <div className="text-sm mt-1 text-gray-700">
                                  {exp.description}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No experience listed
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Education Section */}
                  <div className="mb-4">
                    <button
                      onClick={() => toggleSection("education")}
                      className="flex justify-between items-center w-full py-2 text-left font-semibold text-gray-700 hover:text-primary focus:outline-none"
                    >
                      <span>Education</span>
                      <FontAwesomeIcon
                        icon={
                          expandedSection === "education" ? faCircle : faCircle
                        }
                        className={
                          expandedSection === "education"
                            ? "text-primary"
                            : "text-gray-300"
                        }
                        size="xs"
                      />
                    </button>

                    {expandedSection === "education" && (
                      <div className="mt-2 space-y-3">
                        {resumePreview.education &&
                        resumePreview.education.length > 0 ? (
                          resumePreview.education.map((edu, index) => (
                            <div
                              key={index}
                              className="border-l-2 border-gray-200 pl-3"
                            >
                              <div className="font-medium">{edu.degree}</div>
                              <div className="text-sm text-gray-600">
                                {edu.institution}
                              </div>
                              <div className="text-xs text-gray-500">
                                {edu.graduationDate ||
                                  edu.year ||
                                  "Graduation date not specified"}
                              </div>
                              {edu.field && (
                                <div className="text-sm mt-1 text-gray-700">
                                  {edu.field}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500 text-sm">
                            No education listed
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden h-full flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Interview Chat</h2>
              <div className="mt-2 text-sm text-gray-600">
                Communicate with the candidate and provide feedback on their
                application.
              </div>
            </div>

            <div
              className="flex-grow overflow-y-auto p-6"
              style={{ maxHeight: "600px" }}
            >
              {" "}
              <div className="space-y-4">
                {application.messages && application.messages.length > 0 ? (
                  <>
                    {/* Check if interview is in progress */}
                    {application.messages.some(
                      (msg) =>
                        msg.sender === "system" &&
                        (msg.content.includes("interview") ||
                          msg.content.includes("Interview"))
                    ) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
                        <FontAwesomeIcon
                          icon={faRobot}
                          className="text-blue-500 mr-2"
                        />
                        <div className="text-sm text-blue-700">
                          <strong>AI Interview in progress</strong>
                          <p className="text-xs">
                            The system is automatically evaluating candidate
                            responses.
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Messages list */}
                    {application.messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          msg.sender === "company"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {msg.sender !== "company" && (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                            <FontAwesomeIcon
                              icon={getSenderIcon(msg.sender)}
                              className="text-gray-500"
                            />
                          </div>
                        )}{" "}
                        <div>
                          <div
                            className={`max-w-md p-3 rounded-lg ${
                              msg.sender === "company"
                                ? "bg-primary text-white ml-auto"
                                : msg.sender === "system"
                                ? "bg-blue-100 text-gray-800 border border-blue-200"
                                : "bg-gray-200 text-gray-800"
                            }`}
                          >
                            {msg.sender === "system" ? (
                              <div>
                                <div className="font-medium text-blue-600 mb-1">
                                  <span className="flex items-center">
                                    <FontAwesomeIcon
                                      icon={faRobot}
                                      className="mr-1"
                                    />
                                    AI Interviewer
                                  </span>
                                </div>
                                <div className="whitespace-pre-line text-gray-800">
                                  {msg.content}
                                </div>
                              </div>
                            ) : (
                              msg.content
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {msg.createdAt && formatDate(msg.createdAt)}
                          </div>
                        </div>
                        {msg.sender === "company" && (
                          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ml-2">
                            <FontAwesomeIcon
                              icon={getSenderIcon(msg.sender)}
                              className="text-white"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No messages yet. Start the conversation with this candidate!
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message to the candidate..."
                    className="flex-grow p-3 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sending || !message.trim()}
                    className={`p-3 rounded-r-lg ${
                      sending || !message.trim()
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-primary text-white hover:bg-primary-dark"
                    } transition-colors`}
                  >
                    {sending ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faPaperPlane} />
                    )}
                  </button>{" "}
                </div>{" "}
                <div className="flex flex-col ml-2">
                  <button
                    onClick={handleStartInterview}
                    disabled={
                      sending ||
                      application.messages.some(
                        (msg) => msg.sender === "system"
                      )
                    }
                    className={`p-2 rounded-lg text-sm ${
                      sending
                        ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                        : application.messages.some(
                            (msg) => msg.sender === "system"
                          )
                        ? "bg-green-100 text-green-700 cursor-not-allowed"
                        : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    } border ${
                      application.messages.some(
                        (msg) => msg.sender === "system"
                      )
                        ? "border-green-300"
                        : "border-blue-300"
                    } transition-colors flex items-center justify-center mb-1`}
                    title={
                      application.messages.some(
                        (msg) => msg.sender === "system"
                      )
                        ? "AI interview is already in progress"
                        : "Start an automated AI interview with the candidate"
                    }
                  >
                    <FontAwesomeIcon icon={faRobot} className="mr-2" />
                    {application.messages.some((msg) => msg.sender === "system")
                      ? "AI Interview Active"
                      : "Start AI Interview"}
                  </button>
                  <div className="text-xs text-gray-500 px-1">
                    Automated interview questions will be sent to the candidate
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
