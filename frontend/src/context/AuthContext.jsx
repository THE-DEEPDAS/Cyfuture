import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import api from "../utils/api.js";
import { setUserInfo, clearUserInfo } from "../slices/authSlice";

// Create context
const AuthContext = createContext();

// Custom hook for using auth context
// Define as a named function for better Fast Refresh compatibility
function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth provider component
const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentUser, setCurrentUser] = useState(null);

  console.log("AuthProvider initialized");

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      console.log("AuthContext: Initializing auth");
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("token");
      console.log("Auth initialization - Token exists:", !!token);

      if (token) {
        try {
          // Set auth header with retry enabled
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Get user data with retry enabled
          console.log("Fetching user data...");
          const { data } = await api.get("/users/me", {
            retry: true,
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          });

          console.log("User data fetched:", data);
          dispatch(setUserInfo(data));
          setCurrentUser(data);
        } catch (error) {
          console.error("Auth initialization failed:", error);

          // Check for specific error types
          if (error.code === "ECONNREFUSED") {
            setError(
              "Unable to connect to server. Please check your connection."
            );
            toast.error("Connection failed. Retrying...");
          } else if (error.response?.status === 401) {
            // Invalid or expired token
            localStorage.removeItem("token");
            delete api.defaults.headers.common["Authorization"];
            toast.error("Session expired. Please login again.");
            navigate("/login");
          } else {
            setError("Authentication failed. Please try again later.");
            toast.error("Authentication failed");
          }

          // Clear auth state
          localStorage.removeItem("token");
          delete api.defaults.headers.common["Authorization"];
          dispatch(clearUserInfo());
          setCurrentUser(null);
        }
      }

      setLoading(false);
      console.log("AuthContext: Auth initialization complete");
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      const { data } = await api.post("/auth/login", credentials, {
        retry: true,
      });
      console.log("Login successful, user data:", data);

      localStorage.setItem("token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      dispatch(setUserInfo(data.user));
      setCurrentUser(data.user);

      console.log("User set in state:", data.user);
      toast.success("Login successful!");

      // Redirect based on user role
      if (data.user.role === "company") {
        console.log("Redirecting to company dashboard");
        navigate("/company");
      } else {
        console.log("Redirecting to candidate dashboard");
        navigate("/candidate");
      }

      return true;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.message ||
        (error.code === "ECONNREFUSED"
          ? "Unable to connect to server"
          : "Login failed. Please try again.");
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setError(null);
      const { data } = await api.post("/auth/register", userData, {
        retry: true,
      });

      localStorage.setItem("token", data.token);
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      dispatch(setUserInfo(data.user));
      setCurrentUser(data.user);

      toast.success("Registration successful!");

      // Redirect based on user role
      if (data.user.role === "company") {
        navigate("/company");
      } else {
        navigate("/candidate");
      }

      return true;
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage =
        error.response?.data?.message ||
        (error.code === "ECONNREFUSED"
          ? "Unable to connect to server"
          : "Registration failed. Please try again.");
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    delete api.defaults.headers.common["Authorization"];
    dispatch(clearUserInfo());
    setCurrentUser(null);
    setError(null);
    navigate("/login");
    toast.info("You have been logged out.");
  };

  const value = {
    user: currentUser,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    isCandidate: currentUser?.role === "candidate",
    isCompany: currentUser?.role === "company",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export both the provider component and the hook
export { AuthProvider, useAuth };
