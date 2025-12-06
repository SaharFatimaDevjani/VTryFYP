import React from 'react'
import DashboardLayout from '../Layout/Admin/Dashboard'

import Products from '../pages/Admin/product'
import Users from '../pages/Admin/users'

const AdminRoute = {
    element: <DashboardLayout />,
    children: [
        {
            path: "/admin",
            element: <Products />
        },
        {
            path: "/admin/products",
            element: <Products />
        },
        {
            path: "/admin/users",
            element: <Users />
        }
    ]
}

export default AdminRoute