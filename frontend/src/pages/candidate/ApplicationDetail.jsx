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
} from "@fortawesome/free-solid-svg-icons";
import api from "../../utils/api";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const chatEndRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [application, setApplication] = useState(null);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

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

        // If this is a new application with no messages, initiate the chat
        if (
          user?.role === "candidate" &&
          (!response.data.messages || response.data.messages.length === 0)
        ) {
          try {
            // Show toast to indicate starting the interview
            toast.info("Starting your AI interview session...");

            // Send initial message to trigger AI interviewer
            await api.post(`/applications/${id}/messages`, {
              content:
                "Hello, I've applied for this position and I'm ready for the interview questions.",
            });

            // Fetch the updated application with messages
            const updatedResponse = await api.get(`/applications/${id}`);
            setApplication(updatedResponse.data);

            toast.success(
              "Interview started! Please respond to the questions from the AI interviewer."
            );
          } catch (chatError) {
            console.error("Error initiating interview chat:", chatError);
            toast.error(
              "There was a problem starting the interview. Please try refreshing the page."
            );
          }
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
  }, [id, navigate, user]);
  // Send a new message
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      setSending(true);
      const newMessage = {
        content: message,
        sender: user.role === "company" ? "company" : "candidate",
        createdAt: new Date().toISOString(),
      };

      // Show message optimistically
      setApplication((prev) => ({
        ...prev,
        messages: [...(prev.messages || []), newMessage],
      }));

      // Clear input
      setMessage(""); // Make API call
      const response = await api.post(`/applications/${id}/messages`, {
        content: message,
      });

      // Update with actual message data
      if (response.data && Array.isArray(response.data)) {
        setApplication((prev) => ({
          ...prev,
          messages: response.data,
        }));
      } else if (
        response.data &&
        response.data.messages &&
        Array.isArray(response.data.messages)
      ) {
        // Handle case where full application object is returned
        setApplication((prev) => ({
          ...prev,
          messages: response.data.messages,
        }));
      } else {
        console.warn(
          "Received unexpected message format from API:",
          response.data
        );
        // Attempt to fetch fresh application data
        const updatedApplication = await api.get(
          `/applications/${id}/messages`
        );
        if (updatedApplication.data && Array.isArray(updatedApplication.data)) {
          setApplication((prev) => ({
            ...prev,
            messages: updatedApplication.data,
          }));
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

  // Handle status updates (for company users)
  const handleStatusChange = async (newStatus) => {
    try {
      // Send status update request
      const response = await api.put(`/applications/${id}/status`, {
        status: newStatus,
      });

      // Update local state
      setApplication((prev) => ({
        ...prev,
        status: response.data.status,
        messages: response.data.messages, // API returns updated messages including system message
      }));

      toast.success(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update application status");
    }
  }; // Handle real-time updates
  useEffect(() => {
    // Poll for updates
    const pollInterval = setInterval(async () => {
      try {
        // Only poll if we have an application
        if (id) {
          const response = await api.get(`/applications/${id}/messages`);

          // Update messages if we have data
          if (response.data && Array.isArray(response.data)) {
            setApplication((prev) => ({
              ...prev,
              messages: response.data,
            }));
          }
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
      }
    }, 10000); // Poll every 10 seconds

    return () => {
      clearInterval(pollInterval);
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
        Back
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
                <div>{formatDate(application.createdAt)}</div>
              </div>{" "}
              {application.llmRationale && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-1">AI Analysis</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {application.llmRationale}
                  </div>
                </div>
              )}
              {application.rejectionReason &&
                application.status === "rejected" && (
                  <div className="mb-6">
                    <div className="text-sm text-gray-500 mb-1">
                      Rejection Feedback
                    </div>
                    <div className="text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                      {application.rejectionReason}
                    </div>
                  </div>
                )}
              {application.coverLetter && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Cover Letter</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {application.coverLetter}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resume preview */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Resume</h2>
            </div>

            <div className="p-6">
              <a
                href={application.resume.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                View Resume
              </a>

              {user.role === "company" && (
                <div className="mt-6">
                  <h3 className="font-semibold mb-2">Key Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {application.resume.parsedData.skills.map(
                      (skill, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-sm"
                        >
                          {skill}
                        </span>
                      )
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
            {" "}
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold flex items-center">
                Messages
                {application.messages.some(
                  (msg) => msg.sender === "system"
                ) && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center">
                    <FontAwesomeIcon icon={faRobot} className="mr-1" />
                    Interview Active
                  </span>
                )}
              </h2>
              {user?.role === "candidate" && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-1">
                    This is your interview chat. Answer the questions from the
                    AI interviewer to improve your chances of getting
                    shortlisted.
                  </p>
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-2 text-xs text-blue-700">
                    <strong>Tips:</strong> Be detailed in your responses. The AI
                    will evaluate your answers based on relevance to the job
                    requirements. If you see an interview question, make sure to
                    answer all parts of it.
                  </div>
                </div>
              )}
            </div>
            <div
              className="flex-grow overflow-y-auto p-6"
              style={{ maxHeight: "600px" }}
            >
              {" "}
              <div className="space-y-4">
                {application.messages.length > 0 ? (
                  application.messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${
                        msg.sender ===
                        (user.role === "company" ? "company" : "candidate")
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {msg.sender !==
                        (user.role === "company" ? "company" : "candidate") && (
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
                            msg.sender ===
                            (user.role === "company" ? "company" : "candidate")
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
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            </div>
            <div className="p-4 border-t">
              <div className="flex items-center">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
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
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetail;
