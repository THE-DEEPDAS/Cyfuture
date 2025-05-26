import {
  MESSAGE_CREATE_REQUEST,
  MESSAGE_CREATE_SUCCESS,
  MESSAGE_CREATE_FAIL,
  MESSAGE_CREATE_RESET,
  MESSAGE_LIST_REQUEST,
  MESSAGE_LIST_SUCCESS,
  MESSAGE_LIST_FAIL,
  RESUME_MESSAGES_REQUEST,
  RESUME_MESSAGES_SUCCESS,
  RESUME_MESSAGES_FAIL,
} from '../constants/messageConstants';

export const messageCreateReducer = (state = {}, action) => {
  switch (action.type) {
    case MESSAGE_CREATE_REQUEST:
      return { loading: true };
    case MESSAGE_CREATE_SUCCESS:
      return { loading: false, success: true, message: action.payload };
    case MESSAGE_CREATE_FAIL:
      return { loading: false, error: action.payload };
    case MESSAGE_CREATE_RESET:
      return {};
    default:
      return state;
  }
};

export const messageListReducer = (state = { messages: [] }, action) => {
  switch (action.type) {
    case MESSAGE_LIST_REQUEST:
      return { loading: true, messages: [] };
    case MESSAGE_LIST_SUCCESS:
      return { loading: false, messages: action.payload };
    case MESSAGE_LIST_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const resumeMessagesReducer = (state = { messages: [] }, action) => {
  switch (action.type) {
    case RESUME_MESSAGES_REQUEST:
      return { loading: true, messages: [] };
    case RESUME_MESSAGES_SUCCESS:
      return { loading: false, messages: action.payload };
    case RESUME_MESSAGES_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};