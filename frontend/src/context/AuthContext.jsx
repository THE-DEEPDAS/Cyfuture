import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api.js";

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  console.log("AuthProvider initialized");

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      console.log("AuthContext: Initializing auth");
      setLoading(true);
      const token = localStorage.getItem("token");
      console.log("Auth initialization - Token exists:", !!token);

      if (token) {
        try {
          // Set auth header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Get user data
          console.log("Fetching user data...");
          const { data } = await api.get(`/api/users/me`);
          console.log("User data fetched:", data);
          setUser(data);
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
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
      const { data } = await api.post(`/api/auth/login`, credentials);
      console.log("Login successful, user data:", data);

      localStorage.setItem("token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      setUser(data.user);

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
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const { data } = await api.post(`/api/auth/register`, userData);

      localStorage.setItem("token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      setUser(data.user);

      toast.success("Registration successful!");

      // Redirect based on user role
      if (data.user.role === "company") {
        navigate("/company");
      } else {
        navigate("/candidate");
      }

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Registration failed. Please try again."
      );
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    navigate("/login");
    toast.info("You have been logged out.");
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isCandidate: user?.role === "candidate",
    isCompany: user?.role === "company",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export both the provider component and the hook
export { AuthProvider, useAuth };
