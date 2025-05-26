import {
  ADMIN_DASHBOARD_REQUEST,
  ADMIN_DASHBOARD_SUCCESS,
  ADMIN_DASHBOARD_FAIL,
  ADMIN_JOBS_REQUEST,
  ADMIN_JOBS_SUCCESS,
  ADMIN_JOBS_FAIL,
  ADMIN_COMPANY_PROFILE_UPDATE_REQUEST,
  ADMIN_COMPANY_PROFILE_UPDATE_SUCCESS,
  ADMIN_COMPANY_PROFILE_UPDATE_FAIL,
  ADMIN_COMPANY_PROFILE_UPDATE_RESET,
} from '../constants/adminConstants';

export const adminDashboardReducer = (state = { stats: {} }, action) => {
  switch (action.type) {
    case ADMIN_DASHBOARD_REQUEST:
      return { loading: true, stats: {} };
    case ADMIN_DASHBOARD_SUCCESS:
      return { loading: false, stats: action.payload };
    case ADMIN_DASHBOARD_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const adminJobsReducer = (state = { jobs: [] }, action) => {
  switch (action.type) {
    case ADMIN_JOBS_REQUEST:
      return { loading: true, jobs: [] };
    case ADMIN_JOBS_SUCCESS:
      return { loading: false, jobs: action.payload };
    case ADMIN_JOBS_FAIL:
      return { loading: false, error: action.payload };
    default:
      return state;
  }
};

export const adminCompanyProfileUpdateReducer = (state = {}, action) => {
  switch (action.type) {
    case ADMIN_COMPANY_PROFILE_UPDATE_REQUEST:
      return { loading: true };
    case ADMIN_COMPANY_PROFILE_UPDATE_SUCCESS:
      return { loading: false, success: true, company: action.payload };
    case ADMIN_COMPANY_PROFILE_UPDATE_FAIL:
      return { loading: false, error: action.payload };
    case ADMIN_COMPANY_PROFILE_UPDATE_RESET:
      return {};
    default:
      return state;
  }
};