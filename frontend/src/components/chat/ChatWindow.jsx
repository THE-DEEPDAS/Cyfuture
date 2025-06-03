import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  fetchMessages,
  sendMessage,
  markMessagesAsRead,
} from "../../actions/messageActions";
import { socket, connectSocket } from "../../utils/socket";
import {
  sendMessage,
  markMessageAsRead,
  sendTypingStatus,
  createMessageThread,
  getMessageThread,
} from "../../utils/messaging";

const ChatWindow = ({ conversationId, recipientId }) => {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showThreads, setShowThreads] = useState(false);
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const dispatch = useDispatch();

  const messages = useSelector(
    (state) => state.messages.messagesByConversation[conversationId] || []
  );
  const typingStatus = useSelector(
    (state) => state.messages.typingStatus[conversationId]
  );
  const user = useSelector((state) => state.auth.user);
  useEffect(() => {
    // Initialize socket connection when component mounts
    const token = localStorage.getItem("userToken");
    if (token) {
      connectSocket(token);
    }

    // Fetch initial messages
    dispatch(fetchMessages(conversationId));

    // Set up socket event listeners
    socket.on("new_message", (newMessage) => {
      if (newMessage.conversation === conversationId) {
        dispatch({ type: "MESSAGE_RECEIVED", payload: newMessage });
      }
    });

    socket.on(
      "typing_status_changed",
      ({ conversationId: convId, typingUsers }) => {
        if (convId === conversationId) {
          dispatch({
            type: "TYPING_STATUS_UPDATED",
            payload: { conversationId: convId, status: typingUsers },
          });
        }
      }
    );

    // Cleanup socket listeners on unmount
    return () => {
      socket.off("new_message");
      socket.off("typing_status_changed");
    };
  }, [conversationId, dispatch]);

  useEffect(() => {
    // Mark messages as read when conversation is opened or new messages arrive
    if (messages?.length > 0) {
      dispatch(markMessagesAsRead(conversationId));
    }

    // Scroll to bottom on new messages
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, conversationId, dispatch]);
  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", { conversationId, isTyping: true });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing", { conversationId, isTyping: false });
    }, 2000);
  };
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      dispatch(sendMessage(conversationId, message, "text"));
      setMessage("");
      setIsTyping(false);
      socket.emit("typing", { conversationId, isTyping: false });
    } catch (error) {
      console.error("Error sending message:", error);
      // Show error toast or notification
    }
  };

  const handleCreateThread = async (parentMessageId) => {
    if (!message.trim()) return;

    try {
      await createMessageThread(parentMessageId, {
        conversationId,
        recipientId,
        content: message,
      });
      setMessage("");
      setShowThreads(true);
    } catch (error) {
      console.error("Error creating thread:", error);
      // Show error toast
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-soft">
      {/* Chat Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <FontAwesomeIcon icon="user" className="text-gray-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Recipient Name</h3>
              {typingStatus && (
                <span className="text-sm text-gray-500">typing...</span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowThreads(!showThreads)}
            className="text-gray-500 hover:text-gray-700"
          >
            <FontAwesomeIcon icon={showThreads ? "comment" : "comments"} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`flex ${
              msg.senderId === user.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                msg.senderId === user.id
                  ? "bg-primary-100 text-primary-900"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              <div className="flex items-center justify-end space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </span>
                {msg.senderId === user.id && (
                  <FontAwesomeIcon
                    icon={
                      msg.readBy.includes(recipientId)
                        ? "check-double"
                        : "check"
                    }
                    className={
                      msg.readBy.includes(recipientId)
                        ? "text-primary-500"
                        : "text-gray-400"
                    }
                  />
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
      <form
        onSubmit={handleSendMessage}
        className="p-4 border-t border-gray-200"
      >
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
          <button
            type="submit"
            disabled={!message.trim()}
            className="p-2 text-white bg-primary-600 rounded-full hover:bg-primary-700 disabled:opacity-50"
          >
            <FontAwesomeIcon icon="paper-plane" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatWindow;
