import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function AdminGuard() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const userRaw =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  // If no auth info -> go to admin login
  if (!token || !userRaw) {
    return <Navigate to="/admin/login" replace />;
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch (e) {
    // corrupted storage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    return <Navigate to="/admin/login" replace />;
  }

  // if logged in but not admin -> block
  if (!user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // allow all nested admin routes
  return <Outlet />;
}
