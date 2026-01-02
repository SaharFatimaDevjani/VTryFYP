import React from "react";
import AdminGuard from "./AdminGuard";
import AdminLayout from "../Layout/Admin/index";
import DashboardLayout from "../Layout/Admin/Dashboard";

import Products from "../pages/Admin/product";
import Users from "../pages/Admin/users";
import Categories from "../pages/Admin/categories";
import Overview from "../pages/Admin/overview";
import Orders from "../pages/Admin/orders"; // ✅ add this

const AdminRoute = {
  path: "/admin",
  element: (
    <AdminGuard>
      <AdminLayout />
    </AdminGuard>
  ),
  children: [
    {
      element: <DashboardLayout />,
      children: [
        { index: true, element: <Overview /> },           // /admin
        { path: "products", element: <Products /> },      // /admin/products
        { path: "users", element: <Users /> },            // /admin/users
        { path: "categories", element: <Categories /> },  // /admin/categories
        { path: "orders", element: <Orders /> },          // ✅ /admin/orders
      ],
    },
  ],
};

export default AdminRoute;
