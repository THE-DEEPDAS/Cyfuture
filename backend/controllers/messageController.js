import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import messageService from "../services/MessageService.js";

// @desc    Get user conversations
// @route   GET /api/messages/conversations
// @access  Private
export const getConversations = asyncHandler(async (req, res) => {
  const conversations = await messageService.getUserConversations(req.user._id);
  res.json(conversations);
});

// @desc    Get conversation messages
// @route   GET /api/messages/conversations/:conversationId
// @access  Private
export const getMessages = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const { conversationId } = req.params;

  // Find conversation and verify user is a participant
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  if (!conversation.participants.includes(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to access this conversation");
  }

  // Get messages, newest first
  const messages = await Message.find({
    $or: [
      { sender: req.user._id, receiver: { $in: conversation.participants } },
      { receiver: req.user._id, sender: { $in: conversation.participants } },
    ],
    ...(conversation.application
      ? { application: conversation.application }
      : {}),
  })
    .sort({ createdAt: -1 })
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit))
    .populate("sender", "name email profileImage role");

  // Mark messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      receiver: req.user._id,
      read: false,
    },
    { read: true }
  );

  // Reset unread count for this user
  if (conversation.unreadCount.has(req.user._id.toString())) {
    conversation.unreadCount.set(req.user._id.toString(), 0);
    await conversation.save();
  }

  res.json({
    messages,
    page: parseInt(page),
    hasMore: messages.length === parseInt(limit),
  });
});

// @desc    Send message
// @route   POST /api/messages/conversations/:conversationId
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { content, type = "text", metadata = {} } = req.body;
    const { conversationId } = req.params;

    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId).session(
      session
    );
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(req.user._id)) {
      throw new Error("Not authorized to send messages in this conversation");
    }

    // Create message
    const [message] = await Message.create(
      [
        {
          sender: req.user._id,
          receiver: conversation.participants.find(
            (id) => !id.equals(req.user._id)
          ),
          content,
          type,
          metadata,
          conversation: conversationId,
        },
      ],
      { session }
    );

    // Update conversation
    conversation.lastMessage = message._id;
    conversation.unreadCount.set(
      conversation.participants
        .find((id) => !id.equals(req.user._id))
        .toString(),
      (conversation.unreadCount.get(
        conversation.participants
          .find((id) => !id.equals(req.user._id))
          .toString()
      ) || 0) + 1
    );

    await conversation.save({ session });

    // Populate and return message
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email profileImage role")
      .session(session);

    await session.commitTransaction();
    res.status(201).json(populatedMessage);
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// @desc    Create new conversation
// @route   POST /api/messages/conversations/create
// @access  Private
export const getOrCreateConversation = asyncHandler(async (req, res) => {
  const { receiverId, applicationId } = req.body;

  if (!receiverId) {
    res.status(400);
    throw new Error("Receiver ID is required");
  }

  // Validate receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    res.status(404);
    throw new Error("Receiver not found");
  }

  // Look for existing conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [req.user._id, receiverId] },
    ...(applicationId ? { application: applicationId } : {}),
  });

  // Create new conversation if none exists
  if (!conversation) {
    conversation = await Conversation.create({
      participants: [req.user._id, receiverId],
      application: applicationId || null,
      unreadCount: { [receiverId]: 0 },
    });
  }

  // Return populated conversation
  const populatedConversation = await Conversation.findById(conversation._id)
    .populate("participants", "name email profileImage role")
    .populate("application", "job");

  res.json(populatedConversation);
});

// @desc    Mark messages as read
// @route   PUT /api/messages/conversations/:conversationId/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Verify conversation exists and user is a participant
    const conversation = await Conversation.findById(conversationId).session(
      session
    );
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    if (!conversation.participants.includes(req.user._id)) {
      throw new Error("Not authorized to access this conversation");
    }

    // Batch update all unread messages
    const updateResult = await Message.updateMany(
      {
        conversation: conversationId,
        receiver: req.user._id,
        read: false,
      },
      { read: true },
      { session }
    );

    // Update conversation unread count atomically
    await Conversation.findByIdAndUpdate(
      conversationId,
      { $set: { [`unreadCount.${req.user._id}`]: 0 } },
      { session }
    );
    await session.commitTransaction();

    // Notify other participants about read status
    const io = req.app.get("io");
    io.to(conversationId).emit("messages_read", {
      userId: req.user._id,
      count: updateResult.modifiedCount,
    });

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// @desc    Search messages
// @route   GET /api/messages/conversations/:conversationId/search
// @access  Private
export const searchMessages = asyncHandler(async (req, res) => {
  const { query } = req.query;
  const { conversationId } = req.params;

  // Verify conversation exists and user is a participant
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    res.status(404);
    throw new Error("Conversation not found");
  }

  if (!conversation.participants.includes(req.user._id)) {
    res.status(403);
    throw new Error("Not authorized to access this conversation");
  }

  // Search messages
  const messages = await Message.find({
    conversation: conversationId,
    content: { $regex: query, $options: "i" },
  })
    .sort({ createdAt: -1 })
    .populate("sender", "name email profileImage role");

  res.json(messages);
});

// @desc    Get user online status
// @route   GET /api/messages/status/:userId
// @access  Private
export const getOnlineStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Get Socket.io instance
  const io = req.app.get("io");

  // Check if user has any active socket connections
  const userSockets = await io.in(userId).allSockets();
  const isOnline = userSockets.size > 0;

  res.json({
    userId,
    status: isOnline ? "online" : "offline",
    lastSeen: new Date(), // You might want to store and return actual last seen time from a database
  });
});
