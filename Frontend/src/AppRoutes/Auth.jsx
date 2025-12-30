import React from "react";
import AuthLayout from "../Layout/Auth/index";

import AdminLogin from '../pages/Auth/AdminLogin';
import LoginUser from '../pages/Auth/LoginUser';
import SignupUser from '../pages/Auth/SignupUser';

const AuthRoute = {
  element: <AuthLayout />,
  children: [
    {
      path: "/admin/login",
      element: <AdminLogin />,
    },
    {
      path:"/login",
      element:<LoginUser />
    },
    {
      path:"/signup",
      element:<SignupUser />
    },
  ],
};

export default AuthRoute;
