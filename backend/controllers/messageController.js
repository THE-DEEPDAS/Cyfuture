import { Message, Conversation } from "../models/Message.js";
import User from "../models/User.js";
import mongoose from "mongoose";

/**
 * @desc    Get all conversations for a user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .populate("participants", "name email profileImage role")
      .populate("lastMessage", "content createdAt")
      .populate("application", "job")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    res.status(500).json({ message: "Server error fetching conversations" });
  }
};

/**
 * @desc    Get or create a conversation between two users
 * @route   POST /api/messages/conversations
 * @access  Private
 */
export const getOrCreateConversation = async (req, res) => {
  try {
    const { receiverId, applicationId } = req.body;

    if (!receiverId) {
      return res.status(400).json({ message: "Receiver ID is required" });
    }

    // Validate that receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Look for an existing conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, receiverId] },
      ...(applicationId ? { application: applicationId } : {}),
    });

    // If no conversation exists, create one
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, receiverId],
        application: applicationId || null,
        unreadCount: {
          [receiverId.toString()]: 0,
        },
      });

      // Populate the conversation
      conversation = await Conversation.findById(conversation._id)
        .populate("participants", "name email profileImage role")
        .populate("application", "job");
    }

    res.json(conversation);
  } catch (error) {
    console.error("Get/create conversation error:", error);
    res.status(500).json({ message: "Server error with conversation" });
  }
};

/**
 * @desc    Get messages for a conversation
 * @route   GET /api/messages/conversations/:id
 * @access  Private
 */
export const getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Find conversation and verify user is a participant
    const conversation = await Conversation.findById(id);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this conversation" });
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
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("sender", "name email profileImage role");

    // Mark messages as read
    await Message.updateMany(
      {
        conversation: id,
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
      page,
      hasMore: messages.length === parseInt(limit),
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Server error fetching messages" });
  }
};

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      receiverId,
      content,
      conversationId,
      applicationId,
      attachments = [],
    } = req.body;

    if (!receiverId || !content) {
      return res
        .status(400)
        .json({ message: "Receiver ID and content are required" });
    }

    // Find or create conversation
    let conversation;

    if (conversationId) {
      conversation = await Conversation.findById(conversationId).session(
        session
      );

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      if (!conversation.participants.includes(req.user._id)) {
        return res
          .status(403)
          .json({
            message: "Not authorized to send messages in this conversation",
          });
      }
    } else {
      // Create new conversation
      conversation = await Conversation.findOne({
        participants: { $all: [req.user._id, receiverId] },
        ...(applicationId ? { application: applicationId } : {}),
      }).session(session);

      if (!conversation) {
        conversation = await Conversation.create(
          [
            {
              participants: [req.user._id, receiverId],
              application: applicationId || null,
              unreadCount: {
                [receiverId.toString()]: 0,
              },
            },
          ],
          { session }
        );
        conversation = conversation[0]; // Access the created document
      }
    }

    // Create message
    const message = await Message.create(
      [
        {
          sender: req.user._id,
          receiver: receiverId,
          content,
          application: applicationId || null,
          attachments,
        },
      ],
      { session }
    );

    // Update conversation with last message
    conversation.lastMessage = message[0]._id;

    // Increment unread count for receiver
    const currentCount =
      conversation.unreadCount.get(receiverId.toString()) || 0;
    conversation.unreadCount.set(receiverId.toString(), currentCount + 1);

    await conversation.save({ session });

    // Populate and return the message
    const populatedMessage = await Message.findById(message[0]._id)
      .populate("sender", "name email profileImage role")
      .session(session);

    await session.commitTransaction();
    session.endSession();

    res.status(201).json(populatedMessage);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Send message error:", error);
    res.status(500).json({ message: "Server error sending message" });
  }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/messages/read
 * @access  Private
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.body;

    if (!conversationId) {
      return res.status(400).json({ message: "Conversation ID is required" });
    }

    // Find conversation and verify user is a participant
    const conversation = await Conversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (!conversation.participants.includes(req.user._id)) {
      return res
        .status(403)
        .json({ message: "Not authorized to access this conversation" });
    }

    // Mark messages as read
    await Message.updateMany(
      {
        receiver: req.user._id,
        read: false,
        $or: [
          {
            sender: {
              $in: conversation.participants.filter(
                (p) => !p.equals(req.user._id)
              ),
            },
          },
        ],
      },
      { read: true }
    );

    // Reset unread count for this user
    if (conversation.unreadCount.has(req.user._id.toString())) {
      conversation.unreadCount.set(req.user._id.toString(), 0);
      await conversation.save();
    }

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({ message: "Server error marking messages as read" });
  }
};
