import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../utils/api";

// Async thunks
export const fetchJobs = createAsyncThunk(
  "jobs/fetchJobs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/jobs");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchJobMatches = createAsyncThunk(
  "jobs/fetchJobMatches",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/jobs/matching");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const applyForJob = createAsyncThunk(
  "jobs/applyForJob",
  async ({ jobId, resumeId, coverLetter }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/jobs/${jobId}/apply`, {
        resumeId,
        coverLetter,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Slice
const jobsSlice = createSlice({
  name: "jobs",
  initialState: {
    jobs: [],
    matchScores: {},
    loading: false,
    error: null,
    applying: false,
    applySuccess: false,
  },
  reducers: {
    resetApplyState: (state) => {
      state.applying = false;
      state.applySuccess = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Job Matches
      .addCase(fetchJobMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matchScores = action.payload.reduce((acc, match) => {
          acc[match.jobId] = match.score;
          return acc;
        }, {});
      })
      .addCase(fetchJobMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Apply for Job
      .addCase(applyForJob.pending, (state) => {
        state.applying = true;
        state.error = null;
      })
      .addCase(applyForJob.fulfilled, (state) => {
        state.applying = false;
        state.applySuccess = true;
      })
      .addCase(applyForJob.rejected, (state, action) => {
        state.applying = false;
        state.error = action.payload;
      });
  },
});

export const jobsReducer = jobsSlice.reducer;
export const { resetApplyState } = jobsSlice.actions;
export default jobsReducer;
