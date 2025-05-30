import axios from 'axios';
import { toast } from 'react-toastify';
import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAIL,
  USER_LOGOUT,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAIL,
  USER_PROFILE_REQUEST,
  USER_PROFILE_SUCCESS,
  USER_PROFILE_FAIL,
  USER_UPDATE_PROFILE_REQUEST,
  USER_UPDATE_PROFILE_SUCCESS,
  USER_UPDATE_PROFILE_FAIL,
  SAVE_JOB_REQUEST,
  SAVE_JOB_SUCCESS,
  SAVE_JOB_FAIL,
  UNSAVE_JOB_REQUEST,
  UNSAVE_JOB_SUCCESS,
  UNSAVE_JOB_FAIL,
  SAVED_JOBS_REQUEST,
  SAVED_JOBS_SUCCESS,
  SAVED_JOBS_FAIL,
} from '../constants';
import { getApiUrl } from '../../utils/config';

// Check if user is already logged in
export const checkAuth = () => async (dispatch) => {
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));
  
  if (userInfo && userInfo.token) {
    try {
      // Verify the token is still valid
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      
      await axios.get(`${getApiUrl()}/api/users/profile`, config);
      
      // If no error, token is valid
      dispatch({
        type: USER_LOGIN_SUCCESS,
        payload: userInfo,
      });
    } catch (error) {
      // Token is invalid, log the user out
      dispatch(logout());
    }
  }
};

// Login user
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(
      `${getApiUrl()}/api/users/login`,
      { email, password },
      config
    );

    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    });

    localStorage.setItem('userInfo', JSON.stringify(data));
    
    toast.success('Login successful!');
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAIL,
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

// Register user
export const register = (userData) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });

    const config = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const { data } = await axios.post(
      `${getApiUrl()}/api/users`,
      userData,
      config
    );

    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: data,
    });

    // Auto login after registration
    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: data,
    });

    localStorage.setItem('userInfo', JSON.stringify(data));
    
    toast.success('Registration successful!');
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAIL,
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

// Logout user
export const logout = () => (dispatch) => {
  localStorage.removeItem('userInfo');
  dispatch({ type: USER_LOGOUT });
  toast.info('You have been logged out');
  
  // Redirect to login page
  window.location.href = '/login';
};

// Get user profile
export const getUserProfile = () => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_PROFILE_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`${getApiUrl()}/api/users/profile`, config);

    dispatch({
      type: USER_PROFILE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: USER_PROFILE_FAIL,
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

// Update user profile
export const updateUserProfile = (userData) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_UPDATE_PROFILE_REQUEST });

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
      `${getApiUrl()}/api/users/profile`,
      userData,
      config
    );

    dispatch({
      type: USER_UPDATE_PROFILE_SUCCESS,
      payload: data,
    });
    
    // Update localStorage with new info
    localStorage.setItem('userInfo', JSON.stringify({
      ...userInfo,
      ...data,
    }));
    
    toast.success('Profile updated successfully');
  } catch (error) {
    dispatch({
      type: USER_UPDATE_PROFILE_FAIL,
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

// Save a job
export const saveJob = (jobId) => async (dispatch, getState) => {
  try {
    dispatch({ type: SAVE_JOB_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.put(`${getApiUrl()}/api/users/save-job/${jobId}`, {}, config);

    dispatch({
      type: SAVE_JOB_SUCCESS,
      payload: jobId,
    });
    
    toast.success('Job saved successfully');
  } catch (error) {
    dispatch({
      type: SAVE_JOB_FAIL,
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

// Unsave a job
export const unsaveJob = (jobId) => async (dispatch, getState) => {
  try {
    dispatch({ type: UNSAVE_JOB_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    await axios.put(`${getApiUrl()}/api/users/unsave-job/${jobId}`, {}, config);

    dispatch({
      type: UNSAVE_JOB_SUCCESS,
      payload: jobId,
    });
    
    toast.success('Job removed from saved list');
  } catch (error) {
    dispatch({
      type: UNSAVE_JOB_FAIL,
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

// Get saved jobs
export const getSavedJobs = () => async (dispatch, getState) => {
  try {
    dispatch({ type: SAVED_JOBS_REQUEST });

    const {
      auth: { userInfo },
    } = getState();

    const config = {
      headers: {
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    const { data } = await axios.get(`${getApiUrl()}/api/users/saved-jobs`, config);

    dispatch({
      type: SAVED_JOBS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: SAVED_JOBS_FAIL,
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