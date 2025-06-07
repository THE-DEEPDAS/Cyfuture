import axios from "axios";

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api", // Use environment variable or default
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 60 second timeout
});

// Add retry interceptor for timeout errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is a timeout and we haven't retried yet
    if (error.code === "ECONNABORTED" && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("Retrying request after timeout...");
      return api(originalRequest);
    }

    // Add more context to 403 errors related to applications
    if (error.response && error.response.status === 403) {
      if (originalRequest.url.includes("/applications/")) {
        if (error.response.data && error.response.data.message) {
          error.response.data.message = `Access denied: ${error.response.data.message}. If this is unexpected, please refresh the page and try again.`;
        }
      }
    }

    return Promise.reject(error);
  }
);

// Add a request interceptor to include authentication token
api.interceptors.request.use(
  (config) => {
    // Get token directly from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add it to the authorization header
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle authentication errors
    if (error.response && error.response.status === 401) {
      // Clear token on auth error
      localStorage.removeItem("token");
      // Redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
