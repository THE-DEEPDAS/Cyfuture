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

    // Show notification if permission is granted and message is not from current user
    if (
      Notification.permission === "granted" &&
      message.sender._id !== localStorage.getItem("userId")
    ) {
      const notification = new Notification("New Message", {
        body: `${message.sender.name}: ${message.content.substring(0, 50)}${
          message.content.length > 50 ? "..." : ""
        }`,
        icon: message.sender.profileImage || "/default-avatar.png",
        tag: `message-${message.conversation}`,
        renotify: true,
      });

      // Handle notification click
      notification.onclick = () => {
        window.focus();
        // Navigate to conversation if needed
        if (window.location.pathname !== `/messages/${message.conversation}`) {
          window.location.href = `/messages/${message.conversation}`;
        }
      };
    }

    // Request notification permission if not granted
    else if (Notification.permission === "default") {
      Notification.requestPermission();
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

  // Listen for message delivery status
  socket.on("message_delivery_status", ({ messageId, status, error }) => {
    dispatch({
      type: "MESSAGE_DELIVERY_STATUS_UPDATED",
      payload: { messageId, status, error },
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
