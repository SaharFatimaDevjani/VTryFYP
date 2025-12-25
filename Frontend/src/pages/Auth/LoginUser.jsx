import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginUser() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);

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
      // ✅ change endpoint if your backend uses something else
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Login failed.");

      // ✅ store token if backend returns it
      if (data?.token) {
        if (remember) localStorage.setItem("token", data.token);
        else sessionStorage.setItem("token", data.token);
      }

      navigate("/"); // ✅ where user should go after login
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white/5 border border-white/10 p-6 shadow-xl backdrop-blur">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
          <p className="text-sm text-zinc-300 mt-1">Login to continue</p>
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
              className="mt-1 w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-200">Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-zinc-300 select-none">
              <input
                type="checkbox"
                className="accent-amber-500"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() => alert("Hook this to your forgot-password flow later")}
              className="text-sm text-amber-400 hover:text-amber-300"
            >
              Forgot password?
            </button>
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 text-zinc-950 font-semibold py-2.5 hover:bg-amber-400 disabled:opacity-60"
            type="submit"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-zinc-300">
          Don’t have an account?{" "}
          <Link className="text-amber-400 hover:text-amber-300 font-semibold" to="/signup">
            Sign up
          </Link>
        </div>

        <div className="mt-2 text-center text-xs text-zinc-400">
          Admin?{" "}
          <Link className="text-zinc-200 hover:text-white" to="/admin/login">
            Go to Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
}
