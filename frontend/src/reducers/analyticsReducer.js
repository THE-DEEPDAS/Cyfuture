import {
  ANALYTICS_REQUEST,
  ANALYTICS_SUCCESS,
  ANALYTICS_FAIL,
  ANALYTICS_RESET,
} from "../constants/analyticsConstants";

export const analyticsReducer = (state = {}, action) => {
  switch (action.type) {
    case ANALYTICS_REQUEST:
      return { loading: true };

    case ANALYTICS_SUCCESS:
      return {
        loading: false,
        data: action.payload,
      };

    case ANALYTICS_FAIL:
      return {
        loading: false,
        error: action.payload,
      };

    case ANALYTICS_RESET:
      return {};

    default:
      return state;
  }
};
