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
  USER_UPDATE_PROFILE_RESET,
  SAVE_JOB_SUCCESS,
  UNSAVE_JOB_SUCCESS,
  SAVED_JOBS_REQUEST,
  SAVED_JOBS_SUCCESS,
  SAVED_JOBS_FAIL,
} from '../constants';

export const authReducer = (
  state = { userInfo: null, isAuthenticated: false, savedJobs: [] },
  action
) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
    case USER_REGISTER_REQUEST:
      return { ...state, loading: true };
      
    case USER_LOGIN_SUCCESS:
    case USER_REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: action.payload,
        isAuthenticated: true,
        error: null,
      };
      
    case USER_LOGIN_FAIL:
    case USER_REGISTER_FAIL:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
      
    case USER_LOGOUT:
      return {
        userInfo: null,
        isAuthenticated: false,
        loading: false,
        error: null,
        savedJobs: [],
      };
      
    case USER_PROFILE_REQUEST:
      return {
        ...state,
        loadingProfile: true,
      };
      
    case USER_PROFILE_SUCCESS:
      return {
        ...state,
        loadingProfile: false,
        userProfile: action.payload,
        errorProfile: null,
      };
      
    case USER_PROFILE_FAIL:
      return {
        ...state,
        loadingProfile: false,
        errorProfile: action.payload,
      };
      
    case USER_UPDATE_PROFILE_REQUEST:
      return {
        ...state,
        loadingUpdateProfile: true,
      };
      
    case USER_UPDATE_PROFILE_SUCCESS:
      return {
        ...state,
        loadingUpdateProfile: false,
        userInfo: { ...state.userInfo, ...action.payload },
        userProfile: { ...state.userProfile, ...action.payload },
        successUpdateProfile: true,
      };
      
    case USER_UPDATE_PROFILE_FAIL:
      return {
        ...state,
        loadingUpdateProfile: false,
        errorUpdateProfile: action.payload,
      };
      
    case USER_UPDATE_PROFILE_RESET:
      return {
        ...state,
        loadingUpdateProfile: false,
        successUpdateProfile: false,
        errorUpdateProfile: null,
      };
      
    case SAVED_JOBS_REQUEST:
      return {
        ...state,
        loadingSavedJobs: true,
      };
      
    case SAVED_JOBS_SUCCESS:
      return {
        ...state,
        loadingSavedJobs: false,
        savedJobs: action.payload,
      };
      
    case SAVED_JOBS_FAIL:
      return {
        ...state,
        loadingSavedJobs: false,
        errorSavedJobs: action.payload,
      };
      
    case SAVE_JOB_SUCCESS:
      return {
        ...state,
        savedJobs: [...state.savedJobs, action.payload],
      };
      
    case UNSAVE_JOB_SUCCESS:
      return {
        ...state,
        savedJobs: state.savedJobs.filter(job => job._id !== action.payload),
      };
      
    default:
      return state;
  }
};