import {
  RESUME_UPLOAD_REQUEST,
  RESUME_UPLOAD_SUCCESS,
  RESUME_UPLOAD_FAIL,
  RESUME_FETCH_REQUEST,
  RESUME_FETCH_SUCCESS,
  RESUME_FETCH_FAIL
} from '../constants';
import axios from 'axios';

export const uploadResume = (file) => async (dispatch, getState) => {
  try {
    dispatch({ type: RESUME_UPLOAD_REQUEST });
    const formData = new FormData();
    formData.append('resume', file);
    const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/resume/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${getState().auth.userInfo?.token}`,
      },
    });
    dispatch({ type: RESUME_UPLOAD_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: RESUME_UPLOAD_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const fetchResume = () => async (dispatch, getState) => {
  try {
    dispatch({ type: RESUME_FETCH_REQUEST });
    const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/resume`, {
      headers: { Authorization: `Bearer ${getState().auth.userInfo?.token}` },
    });
    dispatch({ type: RESUME_FETCH_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: RESUME_FETCH_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
