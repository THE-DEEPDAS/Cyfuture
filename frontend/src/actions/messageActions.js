import api from "../utils/api";
import { clientMessageQueue } from "../utils/messageQueue";
import { retryManager } from "../utils/retryManager";
import {
  MESSAGE_SEND_REQUEST,
  MESSAGE_SEND_SUCCESS,
  MESSAGE_SEND_FAIL,
  MESSAGES_FETCH_REQUEST,
  MESSAGES_FETCH_SUCCESS,
  MESSAGES_FETCH_FAIL,
  CONVERSATIONS_FETCH_REQUEST,
  CONVERSATIONS_FETCH_SUCCESS,
  CONVERSATIONS_FETCH_FAIL,
  CONVERSATION_CREATE_REQUEST,
  CONVERSATION_CREATE_SUCCESS,
  CONVERSATION_CREATE_FAIL,
  MESSAGE_MARK_READ_REQUEST,
  MESSAGE_MARK_READ_SUCCESS,
  MESSAGE_MARK_READ_FAIL,
} from "../constants/messageConstants";
import {
  socket,
  joinConversation,
  leaveConversation,
  emitTyping,
  stopTyping,
  sendMessage as emitMessage,
  markMessagesAsRead as emitMarkRead,
} from "../utils/socket";

// Initialize message queue handler
clientMessageQueue.setFlushHandler(async (messages) => {
  return await sendMessagesBatch(messages);
});

// Fetch all conversations
export const fetchConversations = () => async (dispatch) => {
  try {
    dispatch({ type: CONVERSATIONS_FETCH_REQUEST });

    const operationId = "fetch_conversations";
    const data = await retryManager.execute(operationId, async () => {
      const { data } = await api.get("/messages/conversations");
      return data;
    });

    // Join socket rooms for each conversation
    data.forEach((conversation) => {
      joinConversation(conversation._id);
    });

    dispatch({
      type: CONVERSATIONS_FETCH_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: CONVERSATIONS_FETCH_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Fetch messages for a conversation
export const fetchMessages =
  (conversationId, page = 1) =>
  async (dispatch) => {
    try {
      dispatch({ type: MESSAGES_FETCH_REQUEST });

      const operationId = `fetch_messages_${conversationId}_${page}`;
      const data = await retryManager.execute(operationId, async () => {
        const { data } = await api.get(
          `/messages/conversations/${conversationId}?page=${page}`
        );
        return data;
      });

      dispatch({
        type: MESSAGES_FETCH_SUCCESS,
        payload: {
          conversationId,
          messages: data.messages,
          hasMore: data.hasMore,
          page: data.page,
        },
      });
    } catch (error) {
      dispatch({
        type: MESSAGES_FETCH_FAIL,
        payload: error.response?.data?.message || error.message,
      });
    }
  };

// Send a new message
export const sendMessage =
  (conversationId, content, type = "text", metadata = {}, options = {}) =>
  async (dispatch) => {
    try {
      dispatch({ type: MESSAGE_SEND_REQUEST });

      const message = {
        conversationId,
        content,
        type,
        metadata,
      };

      if (options.immediate) {
        // Send immediately
        const operationId = `send_message_${conversationId}_${Date.now()}`;
        const data = await retryManager.execute(operationId, async () => {
          const { data } = await api.post(
            `/messages/conversations/${conversationId}`,
            message
          );
          return data;
        });

        // Emit message via socket for real-time delivery
        emitMessage({
          ...data,
          conversationId,
        });

        dispatch({
          type: MESSAGE_SEND_SUCCESS,
          payload: data,
        });

        return data;
      } else {
        // Add to batch queue
        clientMessageQueue.add(message);
        dispatch({
          type: MESSAGE_SEND_SUCCESS,
          payload: { queued: true, message },
        });
        return { queued: true, message };
      }
    } catch (error) {
      dispatch({
        type: MESSAGE_SEND_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };

// Create a new conversation
export const createConversation =
  (participants, type = "individual", metadata = {}) =>
  async (dispatch) => {
    try {
      dispatch({ type: CONVERSATION_CREATE_REQUEST });

      const operationId = `create_conversation_${Date.now()}`;
      const data = await retryManager.execute(operationId, async () => {
        const { data } = await api.post("/messages/conversations", {
          participants,
          type,
          metadata,
        });
        return data;
      });

      // Join the new conversation room
      joinConversation(data._id);

      dispatch({
        type: CONVERSATION_CREATE_SUCCESS,
        payload: data,
      });

      return data;
    } catch (error) {
      dispatch({
        type: CONVERSATION_CREATE_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };

// Mark messages as read
export const markMessagesAsRead = (conversationId) => async (dispatch) => {
  try {
    dispatch({ type: MESSAGE_MARK_READ_REQUEST });

    const operationId = `mark_read_${conversationId}_${Date.now()}`;
    const data = await retryManager.execute(operationId, async () => {
      const { data } = await api.put(
        `/messages/conversations/${conversationId}/read`
      );
      return data;
    });

    // Emit read status via socket
    emitMarkRead(conversationId);

    dispatch({
      type: MESSAGE_MARK_READ_SUCCESS,
      payload: {
        conversationId,
        data,
      },
    });
  } catch (error) {
    dispatch({
      type: MESSAGE_MARK_READ_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// User typing indicator
export const setTypingStatus =
  (conversationId, isTyping) => async (dispatch) => {
    emitTyping(conversationId, isTyping);
  };

// Leave conversation
export const exitConversation = (conversationId) => async (dispatch) => {
  leaveConversation(conversationId);
};

// Bulk message sending
export const sendBulkMessages =
  (recipients, messageTemplate, batchSize = 10) =>
  async (dispatch) => {
    try {
      dispatch({ type: MESSAGE_SEND_REQUEST });

      const results = {
        successful: [],
        failed: [],
      };

      // Process recipients in batches
      for (let i = 0; i < recipients.length; i += batchSize) {
        const batch = recipients.slice(i, i + batchSize);
        const batchPromises = batch.map(async (recipient) => {
          const operationId = `bulk_message_${recipient._id}_${Date.now()}`;
          try {
            return await retryManager.execute(operationId, async () => {
              const message = {
                ...messageTemplate,
                recipientId: recipient._id,
              };

              const { data } = await api.post("/messages/send", message);
              emitMessage(data);
              return { success: true, data };
            });
          } catch (error) {
            return {
              success: false,
              recipientId: recipient._id,
              error: error.response?.data?.message || error.message,
            };
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);

        batchResults.forEach((result) => {
          if (result.status === "fulfilled" && result.value.success) {
            results.successful.push(result.value.data);
          } else {
            results.failed.push(result.value);
          }
        });

        // Update progress after each batch
        dispatch({
          type: "BULK_MESSAGE_PROGRESS",
          payload: {
            processed: Math.min(i + batchSize, recipients.length),
            total: recipients.length,
            successful: results.successful.length,
            failed: results.failed.length,
          },
        });
      }

      dispatch({
        type: MESSAGE_SEND_SUCCESS,
        payload: {
          successful: results.successful,
          failed: results.failed,
        },
      });

      // Retry failed messages if any
      if (results.failed.length > 0) {
        const retryResults = await dispatch(
          retryFailedMessages(results.failed)
        );
        results.successful.push(...retryResults.successful);
        results.failed = retryResults.failed;
      }

      return results;
    } catch (error) {
      dispatch({
        type: MESSAGE_SEND_FAIL,
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };

// Retry failed messages
export const retryFailedMessages =
  (failedMessages, maxRetries = 3) =>
  async (dispatch) => {
    try {
      dispatch({ type: "MESSAGE_RETRY_REQUEST" });

      const retryResults = {
        successful: [],
        failed: [],
      };

      for (const failedMessage of failedMessages) {
        const operationId = `retry_message_${
          failedMessage.recipientId
        }_${Date.now()}`;
        try {
          const data = await retryManager.execute(operationId, async () => {
            const { data } = await api.post("/messages/send", {
              recipientId: failedMessage.recipientId,
              content: failedMessage.content,
            });
            return data;
          });

          retryResults.successful.push(data);
          emitMessage(data);
        } catch (error) {
          retryResults.failed.push({
            ...failedMessage,
            error: error.response?.data?.message || error.message,
          });
        }
      }

      dispatch({
        type: "MESSAGE_RETRY_SUCCESS",
        payload: {
          successful: retryResults.successful,
          failed: retryResults.failed,
        },
      });

      return retryResults;
    } catch (error) {
      dispatch({
        type: "MESSAGE_RETRY_FAIL",
        payload: error.response?.data?.message || error.message,
      });
      throw error;
    }
  };
