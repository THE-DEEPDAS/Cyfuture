import axios from 'axios';
import {
  JOB_LIST_REQUEST,
  JOB_LIST_SUCCESS,
  JOB_LIST_FAIL,
  JOB_DETAILS_REQUEST,
  JOB_DETAILS_SUCCESS,
  JOB_DETAILS_FAIL,
  JOB_CREATE_REQUEST,
  JOB_CREATE_SUCCESS,
  JOB_CREATE_FAIL,
  JOB_UPDATE_REQUEST,
  JOB_UPDATE_SUCCESS,
  JOB_UPDATE_FAIL,
  JOB_DELETE_REQUEST,
  JOB_DELETE_SUCCESS,
  JOB_DELETE_FAIL,
} from '../constants/jobConstants';

const API_URL = import.meta.env.VITE_BACKEND_URL;

// List jobs
export const listJobs = () => async (dispatch) => {
  try {
    dispatch({ type: JOB_LIST_REQUEST });

    const { data } = await axios.get(`${API_URL}/api/jobs`);

    dispatch({
      type: JOB_LIST_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: JOB_LIST_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get job details
export const getJobDetails = (id) => async (dispatch) => {
  try {
    dispatch({ type: JOB_DETAILS_REQUEST });

    const { data } = await axios.get(`${API_URL}/api/jobs/${id}`);

    dispatch({
      type: JOB_DETAILS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: JOB_DETAILS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Create job
export const createJob = (jobData) => async (dispatch, getState) => {
  try {
    dispatch({ type: JOB_CREATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(`${API_URL}/api/jobs`, jobData, config);

    dispatch({
      type: JOB_CREATE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: JOB_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Update job
export const updateJob = (job) => async (dispatch, getState) => {
  try {
    dispatch({ type: JOB_UPDATE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(`${API_URL}/api/jobs/${job._id}`, job, config);

    dispatch({
      type: JOB_UPDATE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: JOB_UPDATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Delete job
export const deleteJob = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: JOB_DELETE_REQUEST });

    const {
      userLogin: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`${API_URL}/api/jobs/${id}`, config);

    dispatch({ type: JOB_DELETE_SUCCESS });
  } catch (error) {
    dispatch({
      type: JOB_DELETE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};
