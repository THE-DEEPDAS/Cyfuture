import api from "../utils/api";
import { messagingService } from "../utils/messagingService";
import store from "../store";
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

// Initialize messaging service
messagingService.init();

// Set up message handlers
messagingService.onMessage((message) => {
  store.dispatch({
    type: "MESSAGE_RECEIVED",
    payload: message,
  });
});

messagingService.onTyping((update) => {
  store.dispatch({
    type: update.isTyping ? "USER_TYPING" : "USER_STOPPED_TYPING",
    payload: {
      conversationId: update.conversationId,
      userId: update.userId,
    },
  });
});

// Fetch messages for a conversation
export const fetchMessages =
  (conversationId, page = 1) =>
  async (dispatch) => {
    try {
      dispatch({ type: MESSAGES_FETCH_REQUEST });

      const { data } = await api.get(
        `/messages/conversations/${conversationId}?page=${page}`
      );

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
export const sendMessage = (message) => async (dispatch) => {
  try {
    dispatch({ type: MESSAGE_SEND_REQUEST });

    const data = await messagingService.sendMessage(message);

    dispatch({
      type: MESSAGE_SEND_SUCCESS,
      payload: data,
    });

    return data;
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
  (participants, type = "individual") =>
  async (dispatch) => {
    try {
      dispatch({ type: CONVERSATION_CREATE_REQUEST });

      const { data } = await api.post("/messages/conversations", {
        participants,
        type,
      });

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
export const markMessagesAsRead = (messageId) => async (dispatch) => {
  try {
    dispatch({ type: MESSAGE_MARK_READ_REQUEST });

    await messagingService.markMessageRead(messageId);

    dispatch({
      type: MESSAGE_MARK_READ_SUCCESS,
      payload: { messageId },
    });
  } catch (error) {
    dispatch({
      type: MESSAGE_MARK_READ_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

// User typing indicator
export const setTypingStatus = (conversationId, isTyping) => async () => {
  await messagingService.sendTypingStatus(conversationId, isTyping);
};

// Send bulk messages
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

        // Process each recipient in the current batch
        const batchPromises = batch.map(async (recipient) => {
          try {
            const message = {
              ...messageTemplate,
              recipientId: recipient._id,
              content: messageTemplate.content.replace(
                /{name}/g,
                recipient.name || "candidate"
              ),
            };

            const data = await messagingService.sendMessage(message);
            return { success: true, data };
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
          } else if (result.status === "fulfilled") {
            results.failed.push(result.value);
          } else {
            results.failed.push({
              success: false,
              error: result.reason?.message || "Unknown error",
            });
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
export const retryFailedMessages = (failedMessages) => async (dispatch) => {
  try {
    dispatch({ type: "MESSAGE_RETRY_REQUEST" });

    const retryResults = {
      successful: [],
      failed: [],
    };

    for (const failedMessage of failedMessages) {
      try {
        const data = await messagingService.sendMessage({
          recipientId: failedMessage.recipientId,
          content: failedMessage.content,
          conversationId: failedMessage.conversationId,
        });

        retryResults.successful.push(data);
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
