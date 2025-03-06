import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AuthGuard = () => {
  const token = localStorage.getItem('token');

  return token ? <Outlet /> : <Navigate to="/login" />;
};

export default AuthGuard;
