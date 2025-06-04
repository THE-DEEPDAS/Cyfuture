import axios from "axios";

// Create a custom axios instance
const api = axios.create({
  baseURL: "/api", // Will be proxied through Vite
  headers: {
    "Content-Type": "application/json",
  },
});

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
