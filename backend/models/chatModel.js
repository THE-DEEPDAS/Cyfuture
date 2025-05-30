import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    sender: {
      type: String,
      required: true,
      enum: ['user', 'bot', 'admin'],
    },
    content: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

const chatSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    messages: [messageSchema],
    active: {
      type: Boolean,
      default: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;