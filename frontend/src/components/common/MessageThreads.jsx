import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faRobot,
  faBuilding,
  faUser,
  faSpinner,
  faCircle,
  faChevronDown,
  faChevronUp,
} from "@fortawesome/free-solid-svg-icons";

const MessageThreads = ({ messages, user, loading, formatDate }) => {
  const [hasActiveInterview, setHasActiveInterview] = useState(false);
  const [showInterviewTips, setShowInterviewTips] = useState(true);

  useEffect(() => {
    // Check if there are any system messages (AI interviewer)
    setHasActiveInterview(messages.some((msg) => msg.sender === "system"));
  }, [messages]);

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

  const renderMessage = (msg) => {
    const isOwnMessage = msg.senderId === user._id || msg.sender === user.role;
    const isSystem = msg.sender === "system";

    return (
      <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
        {!isOwnMessage && (
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
              isSystem
                ? "bg-blue-100 text-blue-800 border border-blue-200"
                : isOwnMessage
                ? "bg-primary text-white ml-auto"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {isSystem ? (
              <div>
                <div className="font-medium text-blue-600 mb-1">
                  <span className="flex items-center">
                    <FontAwesomeIcon icon={faRobot} className="mr-1" />
                    AI Interviewer
                  </span>
                </div>
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>
            ) : (
              <div>
                {msg.senderName && (
                  <div className="text-xs opacity-75 mb-1">
                    {msg.senderName}
                  </div>
                )}
                <div className="whitespace-pre-line">{msg.content}</div>
              </div>
            )}
          </div>
          {msg.createdAt && (
            <div className="text-xs text-gray-500 mt-1">
              {formatDate(msg.createdAt)}
            </div>
          )}
        </div>

        {isOwnMessage && (
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center ml-2">
            <FontAwesomeIcon
              icon={getSenderIcon(msg.sender)}
              className="text-white"
            />
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <FontAwesomeIcon
          icon={faSpinner}
          spin
          className="text-primary text-2xl"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {hasActiveInterview && (
        <div className="mb-4">
          <div className="flex items-center justify-between bg-indigo-900 p-3 rounded-lg border border-indigo-700">
            <div className="flex items-center">
              <FontAwesomeIcon
                icon={faRobot}
                className="text-indigo-300 mr-2"
              />
              <span className="text-white font-medium">
                Active Interview Session
              </span>
            </div>
            <button
              onClick={() => setShowInterviewTips(!showInterviewTips)}
              className="text-indigo-300 hover:text-white"
            >
              <FontAwesomeIcon
                icon={showInterviewTips ? faChevronUp : faChevronDown}
              />
            </button>
          </div>

          {showInterviewTips && (
            <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700 text-sm">
              <h4 className="font-medium text-white mb-2">Interview Tips:</h4>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                <li>Answer questions thoroughly and specifically</li>
                <li>Highlight relevant experience and skills</li>
                <li>Use concrete examples from your past work</li>
                <li>Be professional and clear in your responses</li>
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        {messages.map((msg, index) => (
          <div key={msg._id || index}>{renderMessage(msg)}</div>
        ))}
      </div>
    </div>
  );
};

export default MessageThreads;
