import api from "../utils/api";

// Job Details Actions
export const getJobDetails = (jobId) => async (dispatch) => {
  try {
    dispatch({ type: "JOB_DETAILS_REQUEST" });
    const { data } = await api.get(`/jobs/${jobId}`);

    dispatch({
      type: "JOB_DETAILS_SUCCESS",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "JOB_DETAILS_FAIL",
      payload: error.response?.data?.message || error.message,
    });
  }
};

// Job Applications Actions
export const getJobApplications = (jobId) => async (dispatch) => {
  try {
    dispatch({ type: "JOB_APPLICATIONS_REQUEST" });
    const { data } = await api.get(`/jobs/${jobId}/applications`);

    dispatch({
      type: "JOB_APPLICATIONS_SUCCESS",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "JOB_APPLICATIONS_FAIL",
      payload: error.response?.data?.message || error.message,
    });
  }
};

export const updateApplicationStatus =
  (jobId, applicationId, status) => async (dispatch) => {
    try {
      dispatch({ type: "APPLICATION_UPDATE_REQUEST" });
      const { data } = await api.put(
        `/jobs/${jobId}/applications/${applicationId}`,
        {
          status,
        }
      );

      dispatch({
        type: "APPLICATION_UPDATE_SUCCESS",
        payload: data,
      });
    } catch (error) {
      dispatch({
        type: "APPLICATION_UPDATE_FAIL",
        payload: error.response?.data?.message || error.message,
      });
    }
  };
