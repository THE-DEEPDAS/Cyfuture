import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const EmployerRoute = () => {
  const { userInfo, isAuthenticated, loading } = useSelector((state) => state.auth);
  const location = useLocation();
  
  // If still loading, don't redirect
  if (loading) return null;
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
  }
  
  // If authenticated but not employer or admin, redirect to home
  if (userInfo.role !== 'employer' && userInfo.role !== 'admin') {
    return <Navigate to="/\" replace />;
  }
  
  // If authenticated and employer/admin, render the child route component
  return <Outlet />;
};

export default EmployerRoute;