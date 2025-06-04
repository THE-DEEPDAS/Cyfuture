import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import Loading from "./Loading.jsx";

const ProtectedRoute = ({ role }) => {
  const { user, loading, isAuthenticated } = useAuth();

  console.log("ProtectedRoute:", {
    user,
    loading,
    isAuthenticated,
    requiredRole: role,
  });

  if (loading) {
    return <Loading />;
  }

  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" />;
  }

  // If role is specified, check if user has that role
  if (role && user.role !== role) {
    console.log(`User role ${user.role} doesn't match required role ${role}`);
    // Redirect to appropriate dashboard based on actual role
    if (user.role === "candidate") {
      return <Navigate to="/candidate" />;
    } else if (user.role === "company") {
      return <Navigate to="/company" />;
    } else {
      return <Navigate to="/" />;
    }
  }

  console.log("Protected route passed, rendering children");
  // User is authenticated and has the correct role (or no role specified)
  return <Outlet />;
};

export default ProtectedRoute;
