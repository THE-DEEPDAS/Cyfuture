import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getConversations } from "../../actions/messageActions";
import Loader from "../common/Loader";
import Message from "../common/Message";

const ConversationList = ({ onSelectConversation, selectedConversation }) => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");

  const { user } = useSelector((state) => state.userLogin);
  const { loading, error, conversations } = useSelector(
    (state) => state.messageList
  );

  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  // Filter conversations based on search query
  const filteredConversations =
    conversations?.filter((conversation) => {
      const searchLower = searchQuery.toLowerCase();
      const participantName =
        conversation.participants.find((p) => p._id !== user._id)?.name || "";
      return participantName.toLowerCase().includes(searchLower);
    }) || [];

  const getLastMessage = (conversation) => {
    return conversation.lastMessage?.content || "No messages yet";
  };

  const getUnreadCount = (conversation) => {
    return conversation.unreadCount?.[user._id] || 0;
  };

  const isActive = (conversation) => {
    return conversation._id === selectedConversation?._id;
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Search Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FontAwesomeIcon
            icon="search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader />
          </div>
        ) : error ? (
          <Message variant="error">{error}</Message>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <FontAwesomeIcon icon="comments" className="text-4xl mb-2" />
            <p className="text-center px-4">
              {searchQuery
                ? "No conversations match your search"
                : "No conversations yet"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation._id}
                className={`w-full text-left p-4 hover:bg-gray-50 transition-colors duration-150 ${
                  isActive(conversation) ? "bg-primary-50" : ""
                }`}
                onClick={() => onSelectConversation(conversation)}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold mr-3">
                      {conversation.participants
                        .find((p) => p._id !== user._id)
                        ?.name.charAt(0) || "?"}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {conversation.participants.find(
                          (p) => p._id !== user._id
                        )?.name || "Unknown"}
                      </h3>
                      <p className="text-sm text-gray-500 truncate">
                        {getLastMessage(conversation)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(conversation.lastMessage?.createdAt)}
                    </span>
                    {getUnreadCount(conversation) > 0 && (
                      <span className="mt-1 px-2 py-1 text-xs bg-primary-500 text-white rounded-full">
                        {getUnreadCount(conversation)}
                      </span>
                    )}
                  </div>
                </div>
                {conversation.isTyping && (
                  <div className="mt-1">
                    <span className="text-xs text-primary-600 animate-pulse">
                      <FontAwesomeIcon icon="pen" className="mr-1" />
                      Typing...
                    </span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
