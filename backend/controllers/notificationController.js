// Notification controller
import User from "../models/User.js";
import asyncHandler from "express-async-handler";

/**
 * @desc    Get all notifications for the authenticated user
 * @route   GET /api/notifications
 * @access  Private
 */
export const getUserNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Return notifications sorted by most recent first
  const notifications = user.notifications || [];
  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(notifications);
});

/**
 * @desc    Mark notifications as read
 * @route   PUT /api/notifications/read
 * @access  Private
 */
export const markNotificationsRead = asyncHandler(async (req, res) => {
  const { notificationIds } = req.body;

  if (!notificationIds || !Array.isArray(notificationIds)) {
    res.status(400);
    throw new Error("Please provide an array of notification IDs");
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Mark specified notifications as read
  if (user.notifications && user.notifications.length > 0) {
    notificationIds.forEach((id) => {
      const notification = user.notifications.id(id);
      if (notification) {
        notification.isRead = true;
      }
    });

    await user.save();
  }

  res.json({ success: true });
});

/**
 * @desc    Mark all notifications as read
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Mark all notifications as read
  if (user.notifications && user.notifications.length > 0) {
    user.notifications.forEach((notification) => {
      notification.isRead = true;
    });

    await user.save();
  }

  res.json({ success: true });
});

/**
 * @desc    Delete a notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
export const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Find and remove the notification
  if (user.notifications && user.notifications.length > 0) {
    const notification = user.notifications.id(id);

    if (!notification) {
      res.status(404);
      throw new Error("Notification not found");
    }

    notification.remove();
    await user.save();
  }

  res.json({ success: true });
});

/**
 * @desc    Clear all notifications
 * @route   DELETE /api/notifications
 * @access  Private
 */
export const clearAllNotifications = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Clear all notifications
  user.notifications = [];
  await user.save();

  res.json({ success: true });
});

export default {
  getUserNotifications,
  markNotificationsRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
};
