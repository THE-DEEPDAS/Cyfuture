import {
  MESSAGE_SEND_REQUEST,
  MESSAGE_SEND_SUCCESS,
  MESSAGE_SEND_FAIL,
  MESSAGES_FETCH_REQUEST,
  MESSAGES_FETCH_SUCCESS,
  MESSAGES_FETCH_FAIL,
  BULK_MESSAGE_PROGRESS,
  MESSAGE_RETRY_REQUEST,
  MESSAGE_RETRY_SUCCESS,
  MESSAGE_RETRY_FAIL,
} from "../constants/messageConstants";

const initialState = {
  messages: [],
  loading: false,
  error: null,
  bulkProgress: {
    processed: 0,
    total: 0,
    successful: 0,
    failed: 0,
  },
  retryStatus: {
    loading: false,
    error: null,
    successful: [],
    failed: [],
  },
};

export const messageReducer = (state = initialState, action) => {
  switch (action.type) {
    case MESSAGE_SEND_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case MESSAGE_SEND_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        messages: [...state.messages, action.payload],
      };

    case MESSAGE_SEND_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case MESSAGES_FETCH_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case MESSAGES_FETCH_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        messages: action.payload,
      };

    case MESSAGES_FETCH_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case BULK_MESSAGE_PROGRESS:
      return {
        ...state,
        bulkProgress: action.payload,
      };

    case MESSAGE_RETRY_REQUEST:
      return {
        ...state,
        retryStatus: {
          ...state.retryStatus,
          loading: true,
          error: null,
        },
      };

    case MESSAGE_RETRY_SUCCESS:
      return {
        ...state,
        retryStatus: {
          loading: false,
          error: null,
          successful: [
            ...state.retryStatus.successful,
            ...action.payload.successful,
          ],
          failed: action.payload.failed,
        },
      };

    case MESSAGE_RETRY_FAIL:
      return {
        ...state,
        retryStatus: {
          ...state.retryStatus,
          loading: false,
          error: action.payload,
        },
      };

    default:
      return state;
  }
};
