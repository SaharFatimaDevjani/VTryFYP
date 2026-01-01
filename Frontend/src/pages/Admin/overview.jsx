import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Overview() {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    categories: 0,
    orders: 0,
  });

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");

    const headers = {
      Authorization: `Bearer ${token}`,
    };

    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, categoriesRes, ordersRes] =
          await Promise.all([
            fetch(`${API_URL}/api/users`, { headers }),
            fetch(`${API_URL}/api/products`),
            fetch(`${API_URL}/api/categories`),
            fetch(`${API_URL}/api/orders`, { headers }),
          ]);

        const usersData = await usersRes.json();
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const ordersData = await ordersRes.json();

        setStats({
          users: Array.isArray(usersData?.data)
            ? usersData.data.length
            : 0,

          products: Array.isArray(productsData?.data)
            ? productsData.data.length
            : Array.isArray(productsData)
            ? productsData.length
            : 0,

          categories: Array.isArray(categoriesData?.data)
            ? categoriesData.data.length
            : 0,

          orders: Array.isArray(ordersData?.data)
            ? ordersData.data.length
            : Array.isArray(ordersData)
            ? ordersData.length
            : 0,
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard title="Users" value={stats.users} />
        <StatCard title="Products" value={stats.products} />
        <StatCard title="Categories" value={stats.categories} />
        <StatCard title="Orders" value={stats.orders} />
      </div>

      <div className="bg-white rounded-xl p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Recent Activity</h2>
        <p className="text-sm text-gray-600">No activity yet</p>
      </div>

      <div className="bg-white rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Logged in Admin</h2>
        <p className="text-sm text-gray-600">Admin account active</p>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
