import React from "react";
import { Navigate } from "react-router-dom";

const isTokenValid = () => {
  const token = localStorage.getItem("token");
  const expiry = localStorage.getItem("token_expiry");
  if (!token || !expiry) return false;

  return Date.now() < parseInt(expiry);
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const valid = isTokenValid();

  if (!valid) {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
