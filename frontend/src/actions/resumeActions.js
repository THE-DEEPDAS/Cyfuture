import api from "../utils/api";

export const getCandidateResumes = () => async (dispatch) => {
  try {
    dispatch({ type: "CANDIDATE_RESUMES_REQUEST" });

    const { data } = await api.get("/resumes");

    dispatch({
      type: "CANDIDATE_RESUMES_SUCCESS",
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: "CANDIDATE_RESUMES_FAIL",
      payload: error.response?.data?.message || error.message,
    });
  }
};
