import api from "../utils/api";

export const submitJobApplication = (applicationData) => async (dispatch) => {
  try {
    dispatch({ type: "APPLICATION_SUBMIT_REQUEST" });
    const { data } = await api.post(`/jobs/${applicationData.jobId}/apply`, {
      resumeId: applicationData.resumeId,
      coverLetter: applicationData.coverLetter,
      responses: applicationData.responses,
    });

    dispatch({
      type: "APPLICATION_SUBMIT_SUCCESS",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "APPLICATION_SUBMIT_FAIL",
      payload: error.response?.data?.message || error.message,
    });
  }
};
