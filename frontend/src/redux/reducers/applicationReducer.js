// Application reducers
import {
  APPLICATION_CREATE_REQUEST,
  APPLICATION_CREATE_SUCCESS,
  APPLICATION_CREATE_FAIL,
  JOB_APPLICATIONS_REQUEST,
  JOB_APPLICATIONS_SUCCESS,
  JOB_APPLICATIONS_FAIL,
  USER_APPLICATIONS_REQUEST,
  USER_APPLICATIONS_SUCCESS,
  USER_APPLICATIONS_FAIL
} from '../constants';

export const applicationReducer = (state = { loading: false, success: false, error: null }, action) => {
  switch (action.type) {
    case APPLICATION_CREATE_REQUEST:
      return { ...state, loading: true };
    case APPLICATION_CREATE_SUCCESS:
      return { loading: false, success: true, error: null };
    case APPLICATION_CREATE_FAIL:
      return { loading: false, success: false, error: action.payload };
    default:
      return state;
  }
};

export const jobApplicationsReducer = (state = { loading: false, applications: [], error: null }, action) => {
  switch (action.type) {
    case JOB_APPLICATIONS_REQUEST:
      return { ...state, loading: true };
    case JOB_APPLICATIONS_SUCCESS:
      return { loading: false, applications: action.payload, error: null };
    case JOB_APPLICATIONS_FAIL:
      return { loading: false, applications: [], error: action.payload };
    default:
      return state;
  }
};

export const userApplicationsReducer = (state = { loading: false, applications: [], error: null }, action) => {
  switch (action.type) {
    case USER_APPLICATIONS_REQUEST:
      return { ...state, loading: true };
    case USER_APPLICATIONS_SUCCESS:
      return { loading: false, applications: action.payload, error: null };
    case USER_APPLICATIONS_FAIL:
      return { loading: false, applications: [], error: action.payload };
    default:
      return state;
  }
};
