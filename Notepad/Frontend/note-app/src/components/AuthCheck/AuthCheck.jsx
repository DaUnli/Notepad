import React from "react";
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

const AuthCheck = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // current time in seconds

    if (decoded.exp < currentTime) {
      // Token expired → remove token and redirect to login
      localStorage.removeItem("token");
      return <Navigate to="/login" replace />;
    }

    return children; // still valid, continue
  } catch (error) {
    // Token invalid or corrupt
    localStorage.removeItem("token");
    return <Navigate to="/login" replace />;
  }
};

export default AuthCheck;