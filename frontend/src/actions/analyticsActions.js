import {
  ANALYTICS_REQUEST,
  ANALYTICS_SUCCESS,
  ANALYTICS_FAIL,
  ANALYTICS_RESET,
} from "../constants/analyticsConstants";
import api from "../utils/api";

export const getJobAnalytics =
  ({ timeRange, jobId }) =>
  async (dispatch) => {
    try {
      dispatch({ type: ANALYTICS_REQUEST });

      const { data } = await api.get(`/analytics/jobs`, {
        params: { timeRange, jobId },
      });

      dispatch({
        type: ANALYTICS_SUCCESS,
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: ANALYTICS_FAIL,
        payload:
          error.response && error.response.data.message
            ? error.response.data.message
            : error.message,
      });
    }
  };

export const resetAnalytics = () => (dispatch) => {
  dispatch({ type: ANALYTICS_RESET });
};
