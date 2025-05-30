// Analytics reducer
import {
  ANALYTICS_FETCH_REQUEST,
  ANALYTICS_FETCH_SUCCESS,
  ANALYTICS_FETCH_FAIL
} from '../constants';

export const analyticsReducer = (state = { loading: false, data: null, error: null }, action) => {
  switch (action.type) {
    case ANALYTICS_FETCH_REQUEST:
      return { ...state, loading: true };
    case ANALYTICS_FETCH_SUCCESS:
      return { loading: false, data: action.payload, error: null };
    case ANALYTICS_FETCH_FAIL:
      return { loading: false, data: null, error: action.payload };
    default:
      return state;
  }
};
