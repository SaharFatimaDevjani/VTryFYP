import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AdminGuard() {
  const location = useLocation();

  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const userRaw =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  // If no auth info -> go to admin login
  if (!token || !userRaw) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname, reason: "not_logged_in" }}
      />
    );
  }

  let user;
  try {
    user = JSON.parse(userRaw);
  } catch (e) {
    // corrupted storage -> cleanup
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname, reason: "corrupted_storage" }}
      />
    );
  }

  // if logged in but not admin -> block + cleanup
  if (!user?.isAdmin) {
    // optional cleanup so a normal user can't keep old token/user while trying admin routes
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname, reason: "not_admin" }}
      />
    );
  }

  // allow all nested admin routes
  return <Outlet />;
}
