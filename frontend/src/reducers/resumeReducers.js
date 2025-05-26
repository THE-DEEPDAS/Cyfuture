import {
  RESUME_UPLOAD_REQUEST,
  RESUME_UPLOAD_SUCCESS,
  RESUME_UPLOAD_FAIL,
  RESUME_UPLOAD_RESET,
  RESUME_DETAILS_REQUEST,
  RESUME_DETAILS_SUCCESS,
  RESUME_DETAILS_FAIL,
  RESUME_CHATBOT_RESPONSE_REQUEST,
  RESUME_CHATBOT_RESPONSE_SUCCESS,
  RESUME_CHATBOT_RESPONSE_FAIL,
  RESUME_CHATBOT_RESPONSE_RESET,
} from '../constants/resumeConstants';

export const resumeUploadReducer = (state = {}, action) => {
  switch (action.type) {
    case RESUME_UPLOAD_REQUEST:
      return { loading: true };
    case RESUME_UPLOAD_SUCCESS:
      return { loading: false, success: true, resume: action.payload };
    case RESUME_UPLOAD_FAIL:
      return { loading: false, error: action.payload };
    case RESUME_UPLOAD_RESET:
      return {};
    default:
      return state;
  }
};

export const resumeDetailsReducer = (state = { resume: {} }, action) => {
  switch (action.type) {
    case RESUME_DETAILS_REQUEST:
      return { ...state, loading: true };
    case RESUME_DETAILS_SUCCESS:
      return { loading: false, resume: action.payload };
    case RESUME_DETAILS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const resumeChatbotResponseReducer = (state = {}, action) => {
  switch (action.type) {
    case RESUME_CHATBOT_RESPONSE_REQUEST:
      return { loading: true };
    case RESUME_CHATBOT_RESPONSE_SUCCESS:
      return { loading: false, success: true, response: action.payload };
    case RESUME_CHATBOT_RESPONSE_FAIL:
      return { loading: false, error: action.payload };
    case RESUME_CHATBOT_RESPONSE_RESET:
      return {};
    default:
      return state;
  }
};