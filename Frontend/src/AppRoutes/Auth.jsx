import React from "react";
import AuthLayout from "../Layout/Auth/index";

import AdminLogin from '../pages/Auth/AdminLogin';

const AuthRoute = {
  element: <AuthLayout />,
  children: [
    {
      path: "/admin/login",
      element: <AdminLogin />,
    },
  ],
};

export default AuthRoute;
