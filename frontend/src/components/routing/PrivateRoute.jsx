import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const { userInfo } = useSelector((state) => state.userLogin);

  return userInfo ? children : <Navigate to="/login" />;
};

export default PrivateRoute;