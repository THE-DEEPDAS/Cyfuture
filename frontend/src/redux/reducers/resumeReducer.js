// Resume reducer
import {
  RESUME_UPLOAD_REQUEST,
  RESUME_UPLOAD_SUCCESS,
  RESUME_UPLOAD_FAIL,
  RESUME_FETCH_REQUEST,
  RESUME_FETCH_SUCCESS,
  RESUME_FETCH_FAIL
} from '../constants';

export const resumeReducer = (state = { loading: false, resume: null, error: null }, action) => {
  switch (action.type) {
    case RESUME_UPLOAD_REQUEST:
    case RESUME_FETCH_REQUEST:
      return { ...state, loading: true };
    case RESUME_UPLOAD_SUCCESS:
    case RESUME_FETCH_SUCCESS:
      return { loading: false, resume: action.payload, error: null };
    case RESUME_UPLOAD_FAIL:
    case RESUME_FETCH_FAIL:
      return { loading: false, resume: null, error: action.payload };
    default:
      return state;
  }
};
