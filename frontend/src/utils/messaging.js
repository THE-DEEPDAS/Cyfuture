import {
  socket,
  emitTyping,
  stopTyping,
  sendMessage as emitMessage,
  markMessagesAsRead as emitMarkRead,
} from "./socket";

export const initializeMessageHandlers = (dispatch) => {
  console.log("Initializing real message handlers");

  // Listen for new messages
  socket.on("receive_message", (message) => {
    dispatch({ type: "MESSAGE_RECEIVED", payload: message });
    // Trigger notification if needed
    if (Notification.permission === "granted") {
      new Notification("New Message", {
        body: `${message.sender.name}: ${message.content.substring(0, 50)}...`,
      });
    }
  });

  // Listen for typing indicators
  socket.on("user_typing", ({ userId, conversationId }) => {
    dispatch({
      type: "TYPING_STATUS_UPDATED",
      payload: { userId, conversationId, isTyping: true },
    });
  });

  socket.on("user_stopped_typing", ({ userId, conversationId }) => {
    dispatch({
      type: "TYPING_STATUS_UPDATED",
      payload: { userId, conversationId, isTyping: false },
    });
  });
  // Listen for read receipts
  socket.on("message_read", ({ messageId, userId }) => {
    dispatch({
      type: "MESSAGE_READ_STATUS_UPDATED",
      payload: { messageId, readBy: userId },
    });
  });
};

export const sendMessage = (message) => {
  return emitMessage(message);
};

export const markMessageAsRead = (messageId, conversationId) => {
  emitMarkRead(messageId, conversationId);
};

export const sendTypingStatus = (conversationId, isTyping) => {
  if (isTyping) {
    emitTyping(conversationId);
  } else {
    stopTyping(conversationId);
  }
};

// Message threading helpers
export const createMessageThread = (parentMessageId, message) => {
  return new Promise((resolve, reject) => {
    socket.emit("create_thread", { parentMessageId, message }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
};

export const getMessageThread = (threadId) => {
  return new Promise((resolve, reject) => {
    socket.emit("get_thread", { threadId }, (response) => {
      if (response.error) {
        reject(response.error);
      } else {
        resolve(response);
      }
    });
  });
};
