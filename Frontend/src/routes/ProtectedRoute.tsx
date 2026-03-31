import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user?.token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // CASE-INSENSITIVE ROLE CHECK (THIS WAS THE BUG)
  if (
    !allowedRoles
      .map((r) => r?.toLowerCase())
      .includes(user?.role?.toLowerCase() || "")
  ) {
    switch (user?.role) {
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
