import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useAuth } from "../../context/AuthContext.jsx";

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch conversations on component mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/messages/conversations");
        setConversations(response.data);

        // Select first conversation if available
        if (response.data.length > 0 && !activeConversation) {
          setActiveConversation(response.data[0]);
        }
      } catch (error) {
        console.error("Error fetching conversations:", error);
        // Set sample data for development/demo
        const sampleConversations = [
          {
            _id: "1",
            participants: [
              {
                _id: "1",
                name: "TechCorp Recruiter",
                role: "company",
                profileImage: null,
              },
              {
                _id: user?._id || "2",
                name: user?.name || "Current User",
                role: "candidate",
                profileImage: null,
              },
            ],
            lastMessage: {
              content: "We would like to schedule an interview.",
              createdAt: new Date().toISOString(),
            },
            updatedAt: new Date().toISOString(),
            unreadCount: { [user?._id || "2"]: 0 },
          },
          {
            _id: "2",
            participants: [
              {
                _id: "3",
                name: "DataSystems HR",
                role: "company",
                profileImage: null,
              },
              {
                _id: user?._id || "2",
                name: user?.name || "Current User",
                role: "candidate",
                profileImage: null,
              },
            ],
            lastMessage: {
              content: "Thank you for your application.",
              createdAt: new Date(Date.now() - 86400000).toISOString(),
            },
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
            unreadCount: { [user?._id || "2"]: 2 },
          },
        ];

        setConversations(sampleConversations);
        if (!activeConversation) {
          setActiveConversation(sampleConversations[0]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user]);

  // Fetch messages when active conversation changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeConversation) return;

      try {
        const response = await axios.get(
          `/api/messages/conversations/${activeConversation._id}`
        );
        setMessages(response.data.messages.reverse()); // Reverse to show oldest first

        // Mark messages as read
        await axios.put("/api/messages/read", {
          conversationId: activeConversation._id,
        });

        // Update unread counts in conversations list
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
      } catch (error) {
        console.error("Error fetching messages:", error);
        // Set sample data for development/demo
        const otherParticipant = activeConversation.participants.find(
          (p) => p._id !== user?._id
        );

        const sampleMessages = [
          {
            _id: "1",
            content: `Hello! Thank you for your interest in our position.`,
            sender: otherParticipant,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            read: true,
          },
          {
            _id: "2",
            content:
              "Thank you for considering my application. I am very interested in this role.",
            sender: {
              _id: user?._id || "2",
              name: user?.name || "Current User",
              role: "candidate",
              profileImage: null,
            },
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            read: true,
          },
          {
            _id: "3",
            content:
              "We would like to schedule an interview with you. Are you available next week?",
            sender: otherParticipant,
            createdAt: new Date(Date.now() - 900000).toISOString(),
            read: activeConversation._id === "1",
          },
        ];

        setMessages(sampleMessages);
      }
    };

    fetchMessages();
  }, [activeConversation, user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Format date to readable time
  const formatMessageTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format date for conversation list
  const formatConversationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Get other participant in conversation
  const getOtherParticipant = (conversation) => {
    if (!conversation || !conversation.participants) return null;
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
      const otherParticipant = getOtherParticipant(activeConversation);

      const messageData = {
        content: newMessage,
        receiverId: otherParticipant._id,
        conversationId: activeConversation._id,
      };

      // Add optimistic message
      const optimisticMessage = {
        _id: Date.now().toString(),
        content: newMessage,
        sender: {
          _id: user?._id,
          name: user?.name,
          role: "candidate",
          profileImage: user?.profileImage,
        },
        createdAt: new Date().toISOString(),
        read: false,
        sending: true,
      };

      setMessages([...messages, optimisticMessage]);
      setNewMessage("");

      // Send message to API
      const response = await axios.post("/api/messages", messageData);

      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === optimisticMessage._id ? response.data : msg
        )
      );

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
    } catch (error) {
      console.error("Error sending message:", error);

      // If we're in development, still show the message
      if (process.env.NODE_ENV === "development") {
        // Update optimistic message to show error
        setMessages((prev) =>
          prev.map((msg) =>
            msg.sending ? { ...msg, sending: false, error: true } : msg
          )
        );
      } else {
        // Remove optimistic message
        setMessages((prev) => prev.filter((msg) => !msg.sending));
        alert("Failed to send message. Please try again.");
      }
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen-content">
        <div className="text-center">
          <FontAwesomeIcon
            icon="spinner"
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
          <div className="w-1/3 border-r border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-lg font-medium text-white">Conversations</h2>
            </div>

            {conversations.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400">No conversations yet</p>
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
                        activeConversation?._id === conversation._id
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
                              icon="user"
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
                          <div className="flex-shrink-0 ml-2">
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
          </div>

          {/* Message Area */}
          <div className="w-2/3 flex flex-col">
            {activeConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-700 flex items-center">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-800 flex items-center justify-center mr-3">
                    {getOtherParticipant(activeConversation)?.profileImage ? (
                      <img
                        src={
                          getOtherParticipant(activeConversation).profileImage
                        }
                        alt={getOtherParticipant(activeConversation).name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <FontAwesomeIcon
                        icon="user"
                        className="text-primary-300"
                      />
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium text-white">
                      {getOtherParticipant(activeConversation)?.name ||
                        "Unknown User"}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {getOtherParticipant(activeConversation)?.role ===
                      "company"
                        ? "Recruiter"
                        : "Candidate"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-400">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender._id === user?._id;

                      return (
                        <div
                          key={message._id}
                          className={`flex ${
                            isOwnMessage ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-lg px-4 py-2 ${
                              isOwnMessage
                                ? "bg-primary-700 text-white"
                                : "bg-gray-700 text-white"
                            } ${message.sending ? "opacity-70" : ""} ${
                              message.error ? "border border-error-500" : ""
                            }`}
                          >
                            <div className="flex flex-col">
                              <p className="text-sm">{message.content}</p>
                              <div className="flex items-center justify-end mt-1 space-x-1">
                                <span className="text-xs text-gray-300">
                                  {formatMessageTime(message.createdAt)}
                                </span>

                                {isOwnMessage && (
                                  <span className="text-xs">
                                    {message.sending ? (
                                      <FontAwesomeIcon
                                        icon="clock"
                                        className="text-gray-300"
                                      />
                                    ) : message.error ? (
                                      <FontAwesomeIcon
                                        icon="exclamation-circle"
                                        className="text-error-400"
                                      />
                                    ) : message.read ? (
                                      <FontAwesomeIcon
                                        icon="check-double"
                                        className="text-primary-300"
                                      />
                                    ) : (
                                      <FontAwesomeIcon
                                        icon="check"
                                        className="text-gray-300"
                                      />
                                    )}
                                  </span>
                                )}
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
                      {sendingMessage ? (
                        <FontAwesomeIcon icon="spinner" spin />
                      ) : (
                        <FontAwesomeIcon icon="paper-plane" />
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <FontAwesomeIcon
                    icon="comment"
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
