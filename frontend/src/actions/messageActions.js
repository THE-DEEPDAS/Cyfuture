import api from "../utils/api";
import { clientMessageQueue } from "../utils/messageQueue.js";
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
  MESSAGE_RETRY_REQUEST,
  MESSAGE_RETRY_SUCCESS,
  MESSAGE_RETRY_FAIL,
  BULK_MESSAGE_PROGRESS,
} from "../constants/messageConstants";

let pollInterval;
let offlineQueue = [];
let isOnline = navigator.onLine;

// Handle offline/online status
window.addEventListener("online", handleOnline);
window.addEventListener("offline", handleOffline);

function handleOnline() {
  isOnline = true;
  // Process queued messages
  while (offlineQueue.length > 0) {
    const { message, dispatch } = offlineQueue.shift();
    sendMessage(message)(dispatch);
  }
}

function handleOffline() {
  isOnline = false;
}

// Start polling for new messages with exponential backoff
export const startMessagePolling = (userId) => async (dispatch) => {
  if (pollInterval) {
    clearInterval(pollInterval);
  }

  let retryCount = 0;
  const maxRetries = 5;
  const baseDelay = 5000; // 5 seconds

  const pollMessages = async () => {
    if (!isOnline) {
      console.log("Offline - skipping poll");
      return;
    }

    try {
      const lastPoll = localStorage.getItem("lastMessagePoll") || 0;
      const { data } = await api.get(`/messages/updates?since=${lastPoll}`);

      if (data.messages && data.messages.length > 0) {
        dispatch({
          type: MESSAGES_FETCH_SUCCESS,
          payload: data.messages,
        });
      }

      localStorage.setItem("lastMessagePoll", Date.now());
      retryCount = 0; // Reset retry count on successful poll
    } catch (error) {
      console.error("Error polling messages:", error);
      retryCount++;

      if (retryCount >= maxRetries) {
        console.log("Max retries reached - stopping poll");
        clearInterval(pollInterval);
      }
    }
  };

  // Initial poll
  await pollMessages();

  // Set up polling with exponential backoff
  const getPollingDelay = () => {
    return baseDelay * Math.pow(2, Math.min(retryCount, 4)); // Max 80 seconds
  };

  pollInterval = setInterval(async () => {
    await pollMessages();
    // Adjust interval based on retry count
    if (retryCount > 0) {
      clearInterval(pollInterval);
      pollInterval = setInterval(pollMessages, getPollingDelay());
    }
  }, baseDelay);
};

// Send message with offline support
export const sendMessage = (message) => async (dispatch) => {
  try {
    dispatch({ type: MESSAGE_SEND_REQUEST });

    if (!isOnline) {
      // Queue message for later
      offlineQueue.push({ message, dispatch });

      dispatch({
        type: MESSAGE_SEND_SUCCESS,
        payload: { ...message, pending: true },
      });
      return;
    }

    const operationId = `send_message_${message.conversationId}_${Date.now()}`;
    const data = await retryManager.execute(operationId, async () => {
      const { data } = await api.post(
        `/messages/conversations/${message.conversationId}`,
        message
      );
      return data;
    });

    // Emit message via socket for real-time delivery
    emitMessage({
      ...data,
      conversationId: message.conversationId,
    });

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

// Retry failed messages
export const retryFailedMessages = (failedMessages) => async (dispatch) => {
  try {
    dispatch({ type: MESSAGE_RETRY_REQUEST });

    const results = await Promise.allSettled(
      failedMessages.map(async (message) => {
        const operationId = `retry_message_${message.id}_${Date.now()}`;
        try {
          const data = await retryManager.execute(operationId, async () => {
            const response = await api.post(
              `/messages/conversations/${message.conversationId}`,
              message
            );
            return response.data;
          });
          return { success: true, data };
        } catch (error) {
          return { success: false, error, message };
        }
      })
    );

    const successful = results
      .filter((result) => result.status === "fulfilled" && result.value.success)
      .map((result) => result.value.data);

    const failed = results
      .filter((result) => result.status === "rejected" || !result.value.success)
      .map((result) => result.value.message);

    dispatch({
      type: MESSAGE_RETRY_SUCCESS,
      payload: { successful, failed },
    });

    return { successful, failed };
  } catch (error) {
    dispatch({
      type: MESSAGE_RETRY_FAIL,
      payload: error.response?.data?.message || error.message,
    });
    throw error;
  }
};

// Send bulk messages with progress tracking and retry support
export const sendBulkMessages =
  (messages, options = {}) =>
  async (dispatch) => {
    try {
      const batchSize = options.batchSize || 10;
      const batches = [];

      // Split messages into batches
      for (let i = 0; i < messages.length; i += batchSize) {
        batches.push(messages.slice(i, i + batchSize));
      }

      const results = {
        successful: [],
        failed: [],
      };

      // Process each batch
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const current = i * batchSize;

        // Update progress
        dispatch({
          type: BULK_MESSAGE_PROGRESS,
          payload: {
            current,
            total: messages.length,
            successful: results.successful.length,
            failed: results.failed.length,
          },
        });

        // Send batch
        const batchResults = await Promise.allSettled(
          batch.map(async (message) => {
            try {
              const operationId = `bulk_msg_${
                message.recipientId
              }_${Date.now()}`;
              const response = await retryManager.execute(
                operationId,
                async () => {
                  const { data } = await api.post("/messages/bulk", message);
                  return data;
                }
              );
              return { success: true, data: response };
            } catch (error) {
              return { success: false, error, message };
            }
          })
        );

        // Process batch results
        batchResults.forEach((result) => {
          if (result.status === "fulfilled" && result.value.success) {
            results.successful.push(result.value.data);
          } else {
            results.failed.push(
              result.status === "rejected"
                ? result.reason.message
                : result.value.message
            );
          }
        });
      }

      // Final progress update
      dispatch({
        type: BULK_MESSAGE_PROGRESS,
        payload: {
          current: messages.length,
          total: messages.length,
          successful: results.successful.length,
          failed: results.failed.length,
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
