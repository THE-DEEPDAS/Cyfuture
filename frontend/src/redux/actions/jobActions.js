import axios from 'axios';
import { toast } from 'react-toastify';
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
  EMPLOYER_JOBS_REQUEST,
  EMPLOYER_JOBS_SUCCESS,
  EMPLOYER_JOBS_FAIL,
  TOP_JOBS_REQUEST,
  TOP_JOBS_SUCCESS,
  TOP_JOBS_FAIL,
} from '../constants';
import { getApiUrl } from '../../utils/config';

// Get all jobs with filters
export const getJobs = (filters = {}, pageNumber = 1) => async (dispatch) => {
  try {
    dispatch({ type: JOB_LIST_REQUEST });

    // Build query string from filters
    const queryParams = new URLSearchParams();
    queryParams.append('pageNumber', pageNumber);
    
    if (filters.keyword) queryParams.append('keyword', filters.keyword);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.company) queryParams.append('company', filters.company);
    if (filters.status) queryParams.append('status', filters.status);

    const { data } = await axios.get(
      `${getApiUrl()}/api/jobs?${queryParams.toString()}`
    );

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

    const { data } = await axios.get(`${getApiUrl()}/api/jobs/${id}`);

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

// Create a job
export const createJob = (jobData) => async (dispatch, getState) => {
  try {
    dispatch({ type: JOB_CREATE_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.post(
      `${getApiUrl()}/api/jobs`,
      jobData,
      config
    );

    dispatch({
      type: JOB_CREATE_SUCCESS,
      payload: data,
    });
    
    toast.success('Job created successfully');
  } catch (error) {
    dispatch({
      type: JOB_CREATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    );
  }
};

// Update a job
export const updateJob = (id, jobData) => async (dispatch, getState) => {
  try {
    dispatch({ type: JOB_UPDATE_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.put(
      `${getApiUrl()}/api/jobs/${id}`,
      jobData,
      config
    );

    dispatch({
      type: JOB_UPDATE_SUCCESS,
      payload: data,
    });
    
    toast.success('Job updated successfully');
  } catch (error) {
    dispatch({
      type: JOB_UPDATE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    );
  }
};

// Delete a job
export const deleteJob = (id) => async (dispatch, getState) => {
  try {
    dispatch({ type: JOB_DELETE_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.delete(`${getApiUrl()}/api/jobs/${id}`, config);

    dispatch({
      type: JOB_DELETE_SUCCESS,
    });
    
    toast.success('Job deleted successfully');
  } catch (error) {
    dispatch({
      type: JOB_DELETE_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
    
    toast.error(
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message
    );
  }
};

// Get employer jobs
export const getEmployerJobs = () => async (dispatch, getState) => {
  try {
    dispatch({ type: EMPLOYER_JOBS_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(
      `${getApiUrl()}/api/jobs/employer`,
      config
    );

    dispatch({
      type: EMPLOYER_JOBS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: EMPLOYER_JOBS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};

// Get top jobs
export const getTopJobs = () => async (dispatch) => {
  try {
    dispatch({ type: TOP_JOBS_REQUEST });

    const { data } = await axios.get(`${getApiUrl()}/api/jobs/top`);

    dispatch({
      type: TOP_JOBS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: TOP_JOBS_FAIL,
      payload:
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message,
    });
  }
};