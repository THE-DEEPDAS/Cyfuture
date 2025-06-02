import express from "express";
import {
  getUserNotifications,
  markNotificationsRead,
  markAllNotificationsRead,
  deleteNotification,
  clearAllNotifications,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Get all notifications for the authenticated user
router.get("/", getUserNotifications);

// Mark specific notifications as read
router.put("/read", markNotificationsRead);

// Mark all notifications as read
router.put("/read-all", markAllNotificationsRead);

// Delete a specific notification
router.delete("/:id", deleteNotification);

// Clear all notifications
router.delete("/", clearAllNotifications);

export default router;
