import React from "react";
import { Navigate } from "react-router-dom";

// wraps every /admin route - bounces anyone without a valid admin
// session back to the admin login page before the layout even renders
export default function AdminGuard({ children }) {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  const userRaw = localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!token || !userRaw) {
    return <Navigate to="/admin/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    return <Navigate to="/admin/login" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}
