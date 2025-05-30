import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Loading from './Loading.jsx';

const ProtectedRoute = ({ role }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return <Loading />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // If role is specified, check if user has that role
  if (role && user.role !== role) {
    // Redirect to appropriate dashboard based on actual role
    if (user.role === 'candidate') {
      return <Navigate to="/candidate" />;
    } else if (user.role === 'company') {
      return <Navigate to="/company" />;
    } else {
      return <Navigate to="/" />;
    }
  }
  
  // User is authenticated and has the correct role (or no role specified)
  return <Outlet />;
};

export default ProtectedRoute;