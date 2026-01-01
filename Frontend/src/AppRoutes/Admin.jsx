import React from "react";
import AdminGuard from "./AdminGuard";
import AdminLayout from "../Layout/Admin/index";         // the one that has <Outlet/>
import DashboardLayout from "../Layout/Admin/Dashboard"; // the one that has <Sidebar/> + <Outlet/>

import Products from "../pages/Admin/product";
import Users from "../pages/Admin/users";
import Categories from "../pages/Admin/categories"; // create this file
import Overview from "../pages/Admin/overview";

const AdminRoute = {
  path: "/admin",
  element: (
    <AdminGuard>
      <AdminLayout />
    </AdminGuard>
  ),
  children: [
    {
      element: <DashboardLayout />, // ✅ Sidebar + Outlet wrapper
      children: [
        { index: true, element: <Overview /> },            // /admin
        { path: "products", element: <Products /> },       // /admin/products
        { path: "users", element: <Users /> },             // /admin/users
        { path: "categories", element: <Categories /> },   // /admin/categories
      ],
    },
  ],
};

export default AdminRoute;
