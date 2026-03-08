import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // 🔥 Wait until auth restoration completes
  if (loading) {
    return <div>Loading...</div>; // You can replace with spinner
  }

  // 🔐 Not logged in
  if (!isAuthenticated || !user?.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🚫 Role not allowed
  if (!allowedRoles.includes(user.role)) {
    switch (user.role) {
      case "admin":
        return <Navigate to="/admin/dashboard" replace />;
      case "seller":
        return <Navigate to="/seller/dashboard" replace />;
      case "customer":
        return <Navigate to="/customer/dashboard" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;