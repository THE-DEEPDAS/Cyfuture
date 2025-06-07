import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faBuilding,
  faPaperPlane,
  faSpinner,
  faComment,
  faRobot,
  faCheck,
  faCheckDouble,
  faClock,
  faExclamationCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../../context/AuthContext.jsx";
import api from "../../utils/api";
import toast from "react-hot-toast";

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageType, setMessageType] = useState("direct"); // "direct" or "application"
  const [applications, setApplications] = useState([]);
  const messagesEndRef = useRef(null);

  // Fetch conversations and applications on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [conversationsResponse, applicationsResponse] = await Promise.all(
          [api.get("/messages/conversations"), api.get("/applications")]
        );

        setConversations(conversationsResponse.data);
        setApplications(
          applicationsResponse.data.filter((app) => app.messages?.length > 0)
        );

        // Select first conversation if available
        if (conversationsResponse.data.length > 0 && !activeConversation) {
          setActiveConversation(conversationsResponse.data[0]);
          setMessageType("direct");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return;

      try {
        let response;
        if (messageType === "direct") {
          response = await api.get(
            `/messages/conversations/${activeConversation._id}`
          );
          setMessages(response.data);

          // Mark conversation as read
          await api.put(
            `/messages/conversations/${activeConversation._id}/read`
          );

          // Update unread count in conversations list
          setConversations((prev) =>
            prev.map((conv) =>
              conv._id === activeConversation._id
                ? {
                    ...conv,
                    unreadCount: { ...conv.unreadCount, [user?._id]: 0 },
                  }
                : conv
            )
          );
        } else {
          // For application chats
          response = await api.get(
            `/applications/${activeConversation._id}/messages`
          );
          setMessages(response.data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages");
      }
    };

    fetchMessages();
  }, [activeConversation, messageType, user?._id]);

  // Handle message synchronization
  useEffect(() => {
    let messageSync;

    const syncMessages = async () => {
      if (!activeConversation) return;

      try {
        let response;
        if (messageType === "direct") {
          response = await api.get(
            `/messages/conversations/${activeConversation._id}`
          );
          setMessages(response.data);
        } else {
          // For application chats
          response = await api.get(
            `/applications/${activeConversation._id}/messages`
          );
          setMessages(response.data.messages || response.data);
        }

        // Mark conversation as read if it's a direct message
        if (messageType === "direct" && response.data.length > 0) {
          await api.put(
            `/messages/conversations/${activeConversation._id}/read`
          );

          // Update unread count in conversations list
          setConversations((prev) =>
            prev.map((conv) =>
              conv._id === activeConversation._id
                ? {
                    ...conv,
                    unreadCount: { ...conv.unreadCount, [user?._id]: 0 },
                  }
                : conv
            )
          );
        }
      } catch (error) {
        console.error("Error syncing messages:", error);
      }
    };

    // Initial sync
    syncMessages();

    // Set up periodic sync every 10 seconds
    messageSync = setInterval(syncMessages, 10000);

    return () => {
      if (messageSync) {
        clearInterval(messageSync);
      }
    };
  }, [activeConversation, messageType, user?._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format date utilities
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatConversationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return formatMessageTime(dateString);
    }
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  };

  // Get other participant in conversation
  const getOtherParticipant = (conversation) => {
    if (!conversation?.participants) return null;
    return (
      conversation.participants.find((p) => p._id !== user?._id) ||
      conversation.participants[0]
    );
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation) return;

    try {
      setSendingMessage(true);
      let response;

      if (messageType === "direct") {
        const otherParticipant = getOtherParticipant(activeConversation);
        const messageData = {
          content: newMessage,
          receiverId: otherParticipant._id,
          conversationId: activeConversation._id,
        };

        response = await api.post("/messages", messageData);
      } else {
        // Send application message
        response = await api.post(
          `/applications/${activeConversation._id}/messages`,
          {
            content: newMessage,
          }
        );
      }

      // Update messages with response
      if (Array.isArray(response.data)) {
        setMessages(response.data);
      } else {
        setMessages([...messages, response.data]);
      }

      // Clear input
      setNewMessage("");

      if (messageType === "direct") {
        // Update conversation list
        setConversations((prev) =>
          prev
            .map((conv) =>
              conv._id === activeConversation._id
                ? {
                    ...conv,
                    lastMessage: {
                      content: newMessage,
                      createdAt: new Date().toISOString(),
                    },
                    updatedAt: new Date().toISOString(),
                  }
                : conv
            )
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    setMessageType("direct");
  };

  // Handle application selection
  const handleSelectApplication = (application) => {
    setActiveConversation(application);
    setMessageType("application");
  };

  // Render message type selector UI
  const renderMessageTypeSelector = () => (
    <div className="border-b border-gray-700 p-4">
      <div className="flex space-x-4">
        <button
          onClick={() => {
            setMessageType("direct");
            setActiveConversation(conversations[0]);
          }}
          className={`px-4 py-2 rounded-lg font-medium ${
            messageType === "direct"
              ? "bg-primary text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Direct Messages
        </button>
        <button
          onClick={() => {
            setMessageType("application");
            setActiveConversation(applications[0]);
          }}
          className={`px-4 py-2 rounded-lg font-medium ${
            messageType === "application"
              ? "bg-primary text-white"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Interview Chats
        </button>
      </div>
    </div>
  );

  // Render conversation list based on type
  const renderConversationList = () => (
    <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
      {renderMessageTypeSelector()}

      {messageType === "direct" ? (
        // Direct messages list
        <>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Direct Messages</h2>
          </div>

          {conversations.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No direct messages yet</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {conversations.map((conversation) => {
                const otherParticipant = getOtherParticipant(conversation);
                const unreadCount = conversation.unreadCount[user?._id] || 0;

                return (
                  <li
                    key={conversation._id}
                    className={`p-4 hover:bg-gray-800 cursor-pointer transition-colors ${
                      activeConversation?._id === conversation._id &&
                      messageType === "direct"
                        ? "bg-gray-800"
                        : ""
                    }`}
                    onClick={() => handleSelectConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center">
                        {otherParticipant?.profileImage ? (
                          <img
                            src={otherParticipant.profileImage}
                            alt={otherParticipant.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <FontAwesomeIcon
                            icon={faUser}
                            className="text-primary-300"
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="text-sm font-medium text-white truncate">
                            {otherParticipant?.name || "Unknown User"}
                          </h3>
                          <span className="text-xs text-gray-400">
                            {formatConversationDate(conversation.updatedAt)}
                          </span>
                        </div>

                        <p
                          className={`text-sm truncate ${
                            unreadCount > 0
                              ? "text-primary-300 font-medium"
                              : "text-gray-400"
                          }`}
                        >
                          {conversation.lastMessage?.content ||
                            "Start a conversation"}
                        </p>
                      </div>

                      {unreadCount > 0 && (
                        <div className="flex-shrink-0">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary-600 text-xs font-medium text-white">
                            {unreadCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      ) : (
        // Application chats list
        <>
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-medium text-white">Interview Chats</h2>
          </div>

          {applications.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400">No interview chats found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-700">
              {applications.map((app) => (
                <li
                  key={app._id}
                  className={`p-4 hover:bg-gray-800 cursor-pointer transition-colors ${
                    activeConversation?._id === app._id &&
                    messageType === "application"
                      ? "bg-gray-800"
                      : ""
                  }`}
                  onClick={() => handleSelectApplication(app)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center">
                      <FontAwesomeIcon
                        icon={faBuilding}
                        className="text-primary-300"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h3 className="text-sm font-medium text-white truncate">
                          {app.job.title}
                        </h3>
                        <span className="text-xs text-gray-400">
                          {formatConversationDate(app.updatedAt)}
                        </span>
                      </div>

                      <p className="text-sm truncate text-gray-400">
                        {app.job.company.companyName}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-content">
        <div className="text-center">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            className="text-4xl text-primary-500 mb-4"
          />
          <p className="text-gray-300">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-900 to-background-secondary rounded-lg p-6 shadow-custom-dark">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <p className="text-gray-300">
          Communicate with employers and track your job applications
        </p>
      </div>

      {/* Messages Interface */}
      <div className="card p-0 overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversation List */}
          {renderConversationList()}

          {/* Message Area */}
          <div className="w-2/3 flex flex-col">
            {activeConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center mr-3">
                      {messageType === "direct" ? (
                        <FontAwesomeIcon
                          icon={faUser}
                          className="text-primary-300"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={faBuilding}
                          className="text-primary-300"
                        />
                      )}
                    </div>

                    <div>
                      <h3 className="font-medium text-white">
                        {messageType === "direct"
                          ? getOtherParticipant(activeConversation)?.name
                          : activeConversation.job?.title}
                      </h3>
                      <p className="text-xs text-gray-400">
                        {messageType === "direct"
                          ? "Recruiter"
                          : activeConversation.job?.company?.companyName}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400">No messages yet</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      // Special handling for system/interview messages
                      if (message.sender === "system") {
                        return (
                          <div
                            key={
                              message._id ||
                              `${message.sender}-${message.createdAt}`
                            }
                            className="flex justify-center"
                          >
                            <div className="w-full max-w-lg bg-blue-100 text-blue-800 p-3 rounded-lg">
                              <div className="font-medium mb-1 flex items-center">
                                <FontAwesomeIcon
                                  icon={faRobot}
                                  className="mr-2"
                                />
                                AI Interviewer
                              </div>
                              <div className="whitespace-pre-line">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        );
                      }

                      const isOwnMessage =
                        messageType === "direct"
                          ? message.sender?._id === user?._id
                          : message.sender === "candidate";

                      return (
                        <div
                          key={
                            message._id ||
                            `${message.sender}-${message.createdAt}`
                          }
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                              isOwnMessage
                                ? "bg-primary-700 text-white"
                                : "bg-gray-700 text-white"
                            }`}
                          >
                            <div className="flex flex-col">
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-end mt-1">
                                <span className="text-xs text-gray-300">
                                  {formatMessageTime(message.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-700">
                  <form
                    onSubmit={handleSendMessage}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="text"
                      className="flex-1 bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sendingMessage}
                    />

                    <button
                      type="submit"
                      className="bg-primary-600 text-white rounded-lg p-2 hover:bg-primary-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      {" "}
                      {sendingMessage ? (
                        <FontAwesomeIcon icon={faSpinner} spin />
                      ) : (
                        <FontAwesomeIcon icon={faPaperPlane} />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  {" "}
                  <FontAwesomeIcon
                    icon={faComment}
                    className="text-4xl text-gray-600 mb-3"
                  />
                  <p className="text-gray-400">
                    Select a conversation to start messaging
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
