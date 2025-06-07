// Notification utility for database notifications
import mongoose from "mongoose";
import User from "../models/User.js";

/**
 * Store a notification for later polling
 * @param {String} userId - ID of the recipient user
 * @param {Object} notification - Notification data to store
 */
export const storeNotification = async (userId, notification) => {
  try {
    await User.findByIdAndUpdate(userId, {
      $push: {
        notifications: {
          ...notification,
          _id: new mongoose.Types.ObjectId(), // Add ObjectId for notification
          timestamp: new Date(),
          isRead: false,
        },
      },
    });
  } catch (error) {
    console.error("Error storing notification:", error);
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

    // Create a new notification with MongoDB ObjectId
    const notification = {
      _id: new mongoose.Types.ObjectId(), // Generate new ObjectId for notification
      type,
      title,
      message,
      data,
      isRead: false,
      createdAt: new Date(),
    };

    // Add notification
    user.notifications.push(notification);

    // Limit to most recent 50 notifications
    if (user.notifications.length > 50) {
      user.notifications = user.notifications.slice(-50);
    }

    await user.save();
    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

/**
 * Send a notification to a user through database storage for polling
 * @param {Object} io - Socket.io instance (optional)
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
  try {
    // Create database notification first
    const notification = await createNotification(
      userId,
      type,
      title,
      message,
      data
    );

    // If we have a socket.io instance and notification was created successfully, emit an event
    if (io && notification) {
      try {
        io.to(userId).emit("notification", {
          ...notification, // This includes the _id and other fields
          type,
          title,
          message,
          data,
        });
      } catch (socketError) {
        console.log(
          "Socket notification failed, continuing with database notification only",
          socketError
        );
      }
    }

    return notification;
  } catch (error) {
    console.error("Error in notifyUser:", error.message);
    return null;
  }
};
