import {
  USER_APPLICATIONS_REQUEST,
  USER_APPLICATIONS_SUCCESS,
  USER_APPLICATIONS_FAIL,
  APPLICATION_DETAILS_REQUEST,
  APPLICATION_DETAILS_SUCCESS,
  APPLICATION_DETAILS_FAIL
} from '../constants';
import axios from 'axios';

export const fetchUserApplications = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_APPLICATIONS_REQUEST });
    const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/applications/user`, {
      headers: { Authorization: `Bearer ${getState().auth.userInfo?.token}` }
    });
    dispatch({ type: USER_APPLICATIONS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: USER_APPLICATIONS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const fetchApplicationDetails = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: APPLICATION_DETAILS_REQUEST });
    const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/applications/${id}`, {
      headers: { Authorization: `Bearer ${getState().auth.userInfo?.token}` }
    });
    dispatch({ type: APPLICATION_DETAILS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({
      type: APPLICATION_DETAILS_FAIL,
      payload: error.response?.data?.message || error.message,
    });
  }
};
