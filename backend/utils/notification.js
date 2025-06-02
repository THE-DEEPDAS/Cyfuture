// Notification utility for sending real-time and email notifications
import User from "../models/User.js";

/**
 * Send a real-time notification via Socket.io
 * @param {Object} io - Socket.io instance
 * @param {String} userId - ID of the recipient user
 * @param {Object} notification - Notification data to send
 */
export const sendRealTimeNotification = (io, userId, notification) => {
  if (io && userId) {
    // Emit to user's room (users join their own userId room on connection)
    io.to(userId).emit("notification", {
      ...notification,
      timestamp: new Date(),
    });
  }
};

/**
 * Create a notification record in the database
 * @param {String} userId - ID of the recipient user
 * @param {String} type - Notification type (e.g., 'message', 'application', 'status')
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {Object} data - Additional notification data
 * @returns {Promise<Object>} - Created notification
 */
export const createNotification = async (
  userId,
  type,
  title,
  message,
  data = {}
) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error("User not found");
    }

    // If user doesn't have notifications array, create it
    if (!user.notifications) {
      user.notifications = [];
    }

    // Add notification
    user.notifications.push({
      type,
      title,
      message,
      data,
      isRead: false,
      createdAt: new Date(),
    });

    // Limit to most recent 50 notifications
    if (user.notifications.length > 50) {
      user.notifications = user.notifications.slice(-50);
    }

    await user.save();
    return user.notifications[user.notifications.length - 1];
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Send a notification to a user through all available channels
 * @param {Object} io - Socket.io instance
 * @param {String} userId - ID of the recipient user
 * @param {String} type - Notification type
 * @param {String} title - Notification title
 * @param {String} message - Notification message
 * @param {Object} data - Additional notification data
 */
export const notifyUser = async (
  io,
  userId,
  type,
  title,
  message,
  data = {}
) => {
  // Create database notification
  const notification = await createNotification(
    userId,
    type,
    title,
    message,
    data
  );

  // Send real-time notification if we have io instance
  if (notification) {
    sendRealTimeNotification(io, userId, notification);
  }
};

export default {
  sendRealTimeNotification,
  createNotification,
  notifyUser,
};
