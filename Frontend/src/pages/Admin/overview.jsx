import React, { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ✅ helper: safely count array from different response shapes
function countFromResponse(json) {
  if (Array.isArray(json)) return json.length;                 // []
  if (Array.isArray(json?.data)) return json.data.length;      // { data: [] }
  if (Array.isArray(json?.data?.data)) return json.data.data.length; // { data: { data: [] } }
  return 0;
}

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

    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

    const safeJson = async (res) => {
      // if unauthorized or other error, return null instead of throwing
      if (!res.ok) return null;
      return await res.json().catch(() => null);
    };

    const fetchStats = async () => {
      try {
        const [usersRes, productsRes, categoriesRes, ordersRes] =
          await Promise.all([
            fetch(`${API_URL}/api/users`, { headers: authHeaders }), // protected admin
            fetch(`${API_URL}/api/products`),                        // public
            fetch(`${API_URL}/api/categories`),                      // public
            fetch(`${API_URL}/api/orders`, { headers: authHeaders }),// protected
          ]);

        const [usersJson, productsJson, categoriesJson, ordersJson] =
          await Promise.all([
            safeJson(usersRes),
            safeJson(productsRes),
            safeJson(categoriesRes),
            safeJson(ordersRes),
          ]);

        setStats({
          users: countFromResponse(usersJson),
          products: countFromResponse(productsJson),
          categories: countFromResponse(categoriesJson),
          orders: countFromResponse(ordersJson),
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
