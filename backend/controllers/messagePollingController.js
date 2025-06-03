import { pollingMessageService } from "../services/PollingMessageService.js";
import asyncHandler from "express-async-handler";

// Get message updates (polling endpoint)
export const getMessageUpdates = asyncHandler(async (req, res) => {
  const { since } = req.query;
  const updates = await pollingMessageService.getMessageUpdates(
    req.user._id,
    since
  );
  res.json(updates);
});

// Send a new message
export const sendMessage = asyncHandler(async (req, res) => {
  const message = {
    ...req.body,
    sender: req.user._id,
  };
  const newMessage = await pollingMessageService.sendMessage(message);
  res.status(201).json(newMessage);
});

// Mark message as read
export const markMessageRead = asyncHandler(async (req, res) => {
  await pollingMessageService.markMessageRead(req.params.messageId);
  res.status(200).json({ success: true });
});

// Update typing status
export const updateTypingStatus = asyncHandler(async (req, res) => {
  const { conversationId, isTyping } = req.body;
  pollingMessageService.updateTypingStatus(
    conversationId,
    req.user._id,
    isTyping
  );
  res.status(200).json({ success: true });
});
