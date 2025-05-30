// Chat reducer
import {
  CHAT_FETCH_REQUEST,
  CHAT_FETCH_SUCCESS,
  CHAT_FETCH_FAIL,
  CHAT_SEND_REQUEST,
  CHAT_SEND_SUCCESS,
  CHAT_SEND_FAIL
} from '../constants';

export const chatReducer = (state = { loading: false, messages: [], error: null }, action) => {
  switch (action.type) {
    case CHAT_FETCH_REQUEST:
    case CHAT_SEND_REQUEST:
      return { ...state, loading: true };
    case CHAT_FETCH_SUCCESS:
      return { loading: false, messages: action.payload, error: null };
    case CHAT_SEND_SUCCESS:
      return { loading: false, messages: [...state.messages, action.payload], error: null };
    case CHAT_FETCH_FAIL:
    case CHAT_SEND_FAIL:
      return { loading: false, messages: [], error: action.payload };
    default:
      return state;
  }
};
