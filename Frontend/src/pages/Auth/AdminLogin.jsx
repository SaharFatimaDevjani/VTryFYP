import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || "Admin login failed.");
      }

      // 🔒 IMPORTANT: Check admin BEFORE storing anything
      if (!data?.user?.isAdmin) {
        throw new Error("Access denied. Admins only.");
      }

      // ✅ Store token & user ONLY if admin
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/admin");
    } catch (err) {
      // 🧹 cleanup just in case
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Admin Login</h1>
          <p className="text-sm text-zinc-300 mt-1">
            Sign in to manage the dashboard
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-200">Email</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-200">Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 text-zinc-950 font-semibold py-2.5 hover:bg-amber-400 disabled:opacity-60"
            type="submit"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-zinc-300">
          Go to user login?{" "}
          <Link
            className="text-amber-400 hover:text-amber-300 font-semibold"
            to="/login"
          >
            User Login
          </Link>
        </div>
      </div>
    </div>
  );
}
