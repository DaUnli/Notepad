import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const Layout = () => {
  const token = localStorage.getItem('token');

  if (!token) {
    // If there's no token, redirect any request to the login page.
    return <Navigate to="/login" replace />;
  }

  // If there is a token, render the requested child route (e.g., Home/Dashboard).
  // The <Outlet /> component from react-router-dom does this.
  return <Outlet />;
};

export default Layout;