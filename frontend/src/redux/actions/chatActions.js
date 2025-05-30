import {
  CHAT_FETCH_REQUEST,
  CHAT_FETCH_SUCCESS,
  CHAT_FETCH_FAIL,
  CHAT_SEND_REQUEST,
  CHAT_SEND_SUCCESS,
  CHAT_SEND_FAIL
} from '../constants';
import axios from 'axios';

export const fetchChatMessages = () => async (dispatch, getState) => {
  try {
    dispatch({ type: CHAT_FETCH_REQUEST });
    const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
      headers: { Authorization: `Bearer ${getState().auth.userInfo?.token}` },
    });
    dispatch({ type: CHAT_FETCH_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CHAT_FETCH_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const sendChatMessage = (message) => async (dispatch, getState) => {
  try {
    dispatch({ type: CHAT_SEND_REQUEST });
    const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, message, {
      headers: { Authorization: `Bearer ${getState().auth.userInfo?.token}` },
    });
    dispatch({ type: CHAT_SEND_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: CHAT_SEND_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
