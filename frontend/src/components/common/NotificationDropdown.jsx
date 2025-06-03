import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  // Fetch notifications on component mount and start polling
  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 10 seconds
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 10000);

    return () => {
      clearInterval(pollInterval);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/notifications");
      setNotifications(response.data);
      setUnreadCount(response.data.filter((notif) => !notif.isRead).length);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setLoading(false);
    }
  };

  // Mark a notification as read
  const markAsRead = async (notificationId) => {
    try {
      await api.put("/api/notifications/read", {
        notificationIds: [notificationId],
      });
      setNotifications((prevNotifs) =>
        prevNotifs.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");
      setNotifications((prevNotifs) =>
        prevNotifs.map((notif) => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }

    // Navigate based on notification type
    if (notification.type === "message") {
      navigate(`/messages/${notification.data.conversationId || ""}`);
    } else if (
      notification.type === "application" ||
      notification.type === "status"
    ) {
      if (notification.data.applicationId) {
        navigate(`/applications/${notification.data.applicationId}`);
      }
    }

    // Close dropdown
    setIsOpen(false);
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return "envelope";
      case "application":
        return "file-alt";
      case "status":
        return "sync-alt";
      case "match":
        return "percentage";
      default:
        return "bell";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-300 hover:text-white focus:outline-none"
      >
        <FontAwesomeIcon icon="bell" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-primary-500 text-xs text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-background-secondary rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-dark-700 flex justify-between items-center">
            <h3 className="text-white font-medium">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-primary-400 hover:text-primary-300"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center p-4">
              <FontAwesomeIcon
                icon="spinner"
                spin
                className="text-primary-500"
              />
            </div>
          ) : notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 border-b border-dark-700 hover:bg-background-light cursor-pointer ${
                    !notification.isRead ? "bg-background-light/30" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    <div
                      className={`mr-3 mt-1 text-${
                        notification.isRead ? "gray-400" : "primary-500"
                      }`}
                    >
                      <FontAwesomeIcon
                        icon={getNotificationIcon(notification.type)}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4
                          className={`text-sm font-medium ${
                            notification.isRead ? "text-gray-300" : "text-white"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <span className="text-xs text-gray-500 ml-2">
                          {formatTime(notification.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-400">
              <FontAwesomeIcon icon="bell-slash" className="text-2xl mb-2" />
              <p>No notifications yet</p>
            </div>
          )}

          {notifications.length > 5 && (
            <div className="p-2 text-center border-t border-dark-700">
              <button
                onClick={() => {
                  navigate("/notifications");
                  setIsOpen(false);
                }}
                className="text-sm text-primary-400 hover:text-primary-300"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
