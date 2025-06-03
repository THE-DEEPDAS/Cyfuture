import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    type: {
      type: String,
      enum: ["individual", "group"],
      default: "individual",
    },
    title: {
      type: String,
      required: function () {
        return this.type === "group";
      },
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    metadata: {
      icon: String,
      description: String,
    },
  },
  {
    timestamps: true,
  }
);

// Create unique compound index for individual chats
conversationSchema.index(
  { participants: 1 },
  {
    unique: true,
    partialFilterExpression: { type: "individual" },
  }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;
