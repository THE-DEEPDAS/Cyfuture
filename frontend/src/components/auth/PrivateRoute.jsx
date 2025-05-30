import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // If still loading, don't redirect
  if (loading) return null;
  
  // If not authenticated, redirect to login with the intended location
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }
  
  // If authenticated, render the child route component
  return <Outlet />;
};

export default PrivateRoute;