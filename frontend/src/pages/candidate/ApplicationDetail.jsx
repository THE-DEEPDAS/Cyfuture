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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching application:", error);
        toast.error("Failed to load application details");
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
      const response = await axios.post(`/api/applications/${id}/messages`, {
        content: message,
      });

      // Update application with new messages
      setApplication((prev) => ({
        ...prev,
        messages: response.data,
      }));

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
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
              </div>

              {application.llmRationale && (
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-1">AI Analysis</div>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                    {application.llmRationale}
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
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold">Messages</h2>
            </div>

            <div
              className="flex-grow overflow-y-auto p-6"
              style={{ maxHeight: "600px" }}
            >
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
                      )}

                      <div>
                        <div
                          className={`max-w-md p-3 rounded-lg ${
                            msg.sender ===
                            (user.role === "company" ? "company" : "candidate")
                              ? "bg-primary text-white ml-auto"
                              : msg.sender === "system"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {msg.content}
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
