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
  JOB_CREATE_RESET,
  JOB_UPDATE_REQUEST,
  JOB_UPDATE_SUCCESS,
  JOB_UPDATE_FAIL,
  JOB_UPDATE_RESET,
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

// Job list reducer
export const jobReducer = (
  state = { jobs: [], loading: false, error: null },
  action
) => {
  switch (action.type) {
    case JOB_LIST_REQUEST:
      return { ...state, loading: true };
      
    case JOB_LIST_SUCCESS:
      return {
        loading: false,
        jobs: action.payload.jobs,
        pages: action.payload.pages,
        page: action.payload.page,
        total: action.payload.total,
      };
      
    case JOB_LIST_FAIL:
      return { loading: false, error: action.payload };
      
    case JOB_CREATE_REQUEST:
      return { ...state, loading: true };
      
    case JOB_CREATE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
        job: action.payload,
      };
      
    case JOB_CREATE_FAIL:
      return { ...state, loading: false, error: action.payload };
      
    case JOB_CREATE_RESET:
      return { ...state, success: false, job: null };
      
    case JOB_DELETE_REQUEST:
      return { ...state, loading: true };
      
    case JOB_DELETE_SUCCESS:
      return {
        ...state,
        loading: false,
        success: true,
      };
      
    case JOB_DELETE_FAIL:
      return { ...state, loading: false, error: action.payload };
      
    default:
      return state;
  }
};

// Job details reducer
export const jobDetailsReducer = (
  state = { job: { skills: [] }, loading: true },
  action
) => {
  switch (action.type) {
    case JOB_DETAILS_REQUEST:
      return { ...state, loading: true };
      
    case JOB_DETAILS_SUCCESS:
      return { loading: false, job: action.payload };
      
    case JOB_DETAILS_FAIL:
      return { loading: false, error: action.payload };
      
    case JOB_UPDATE_REQUEST:
      return { ...state, loading: true };
      
    case JOB_UPDATE_SUCCESS:
      return { loading: false, success: true, job: action.payload };
      
    case JOB_UPDATE_FAIL:
      return { loading: false, error: action.payload };
      
    case JOB_UPDATE_RESET:
      return { job: { skills: [] } };
      
    default:
      return state;
  }
};

// Employer jobs reducer
export const employerJobsReducer = (
  state = { jobs: [] },
  action
) => {
  switch (action.type) {
    case EMPLOYER_JOBS_REQUEST:
      return { loading: true, jobs: [] };
      
    case EMPLOYER_JOBS_SUCCESS:
      return { loading: false, jobs: action.payload };
      
    case EMPLOYER_JOBS_FAIL:
      return { loading: false, error: action.payload };
      
    default:
      return state;
  }
};

// Top jobs reducer
export const topJobsReducer = (
  state = { jobs: [] },
  action
) => {
  switch (action.type) {
    case TOP_JOBS_REQUEST:
      return { loading: true, jobs: [] };
      
    case TOP_JOBS_SUCCESS:
      return { loading: false, jobs: action.payload };
      
    case TOP_JOBS_FAIL:
      return { loading: false, error: action.payload };
      
    default:
      return state;
  }
};