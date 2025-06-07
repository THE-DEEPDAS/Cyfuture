// Chat interface component for candidate's view of the interview
import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faSpinner,
  faUser,
  faBuilding,
  faRobot,
} from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import api from "../../utils/api";

const InterviewChat = ({ applicationId, messages = [], onNewMessage }) => {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!applicationId) return;

    const pollMessages = async () => {
      try {
        setIsPolling(true);
        const response = await api.get(
          `/applications/${applicationId}/messages`
        );

        if (response.data && Array.isArray(response.data)) {
          onNewMessage(response.data);
        }
      } catch (error) {
        console.error("Error polling messages:", error);
      } finally {
        setIsPolling(false);
      }
    };

    // Initial poll
    pollMessages();

    // Set up regular polling
    const interval = setInterval(pollMessages, 5000);
    return () => clearInterval(interval);
  }, [applicationId, onNewMessage]);

  // Handle sending message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!message.trim()) return;

    setSending(true);

    try {
      // Optimistic update
      const tempMessage = {
        sender: "candidate",
        content: message.trim(),
        createdAt: new Date().toISOString(),
      };

      onNewMessage([...messages, tempMessage]);
      setMessage("");

      // Send to server
      const response = await api.post(
        `/applications/${applicationId}/messages`,
        {
          content: message.trim(),
        }
      );

      if (response.data) {
        onNewMessage(
          Array.isArray(response.data)
            ? response.data
            : [...messages, response.data]
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      onNewMessage(messages); // Revert optimistic update
      setMessage(message); // Restore message input
    } finally {
      setSending(false);
    }
  };

  // Get sender icon based on message type
  const getSenderIcon = (sender) => {
    switch (sender) {
      case "system":
        return faRobot;
      case "company":
        return faBuilding;
      default:
        return faUser;
    }
  };

  // Format message time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Message Display Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "candidate" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.sender !== "candidate" && (
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                <FontAwesomeIcon
                  icon={getSenderIcon(msg.sender)}
                  className={`${
                    msg.sender === "system" ? "text-blue-600" : "text-gray-600"
                  }`}
                />
              </div>
            )}

            <div>
              <div
                className={`p-3 rounded-lg ${
                  msg.sender === "candidate"
                    ? "bg-primary text-white ml-auto"
                    : msg.sender === "system"
                    ? "bg-blue-100 text-blue-900"
                    : "bg-gray-100 text-gray-900"
                } max-w-lg`}
              >
                {msg.content}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatTime(msg.createdAt)}
              </div>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your response..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !message.trim()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {sending ? (
              <FontAwesomeIcon icon={faSpinner} spin />
            ) : (
              <FontAwesomeIcon icon={faPaperPlane} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default InterviewChat;
