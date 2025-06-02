import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../utils/api.js";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize auth state on app load
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");

      if (token) {
        try {
          // Set auth header
          axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

          // Get user data
          const { data } = await api.get(`/users/me`);
          setUser(data);
        } catch (error) {
          console.error("Auth initialization failed:", error);
          localStorage.removeItem("token");
          delete axios.defaults.headers.common["Authorization"];
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const { data } = await api.post(`/auth/login`, credentials);

      localStorage.setItem("token", data.token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      setUser(data.user);

      toast.success("Login successful!");

      // Redirect based on user role
      if (data.user.role === "company") {
        navigate("/company");
      } else {
        navigate("/candidate");
      }

      return true;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
      return false;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const { data } = await api.post(`/auth/register`, userData);

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
