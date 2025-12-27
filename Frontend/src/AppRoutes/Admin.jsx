import React from "react";
import AdminGuard from "./AdminGuard"; // adjust path if needed
import DashboardLayout from "../Layout/Admin/Dashboard";

import Products from "../pages/Admin/product";
import Users from "../pages/Admin/users";

const AdminRoute = {
  element: <AdminGuard />, // ✅ guard first
  children: [
    {
      element: <DashboardLayout />, // ✅ layout inside guard
      children: [
        {
          path: "/admin",
          element: <Products />,
        },
        {
          path: "/admin/products",
          element: <Products />,
        },
        {
          path: "/admin/users",
          element: <Users />,
        },
      ],
    },
  ],
};

export default AdminRoute;
