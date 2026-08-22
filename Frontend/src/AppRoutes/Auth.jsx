import React from "react";
import AuthLayout from "../Layout/Auth/index";

import AdminLogin from "../pages/Auth/AdminLogin";
import LoginUser from "../pages/Auth/LoginUser";
import SignupUser from "../pages/Auth/SignupUser";

import ForgotPassword from "../pages/Auth/ForgotPassword";
import ResetPassword from "../pages/Auth/ResetPassword";

const AuthRoute = {
  element: <AuthLayout />,
  children: [
    // Admin login route
    {
      path: "/admin/login",
      element: <AdminLogin />,
    },

    // User auth routes
    {
      path: "/login",
      element: <LoginUser />,
    },
    {
      path: "/signup",
      element: <SignupUser />,
    },

    // password reset flow - admins don't have this, only regular users
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/reset-password/:token",
      element: <ResetPassword />,
    },
  ],
};

export default AuthRoute;
