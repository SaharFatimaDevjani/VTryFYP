import React, { useState } from "react";
import { Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    setError("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Request failed");

      setMsg("If that email exists, a reset link has been sent.");
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
        <p className="text-zinc-300 mt-1 text-sm">
          Enter your email to receive a reset link.
        </p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200 text-sm">
            {error}
          </div>
        )}

        {msg && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-900/20 border border-emerald-800 text-emerald-200 text-sm">
            {msg}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm text-zinc-200">Email *</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>

          <button
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <p className="text-sm text-zinc-300 text-center">
            Back to{" "}
            <Link to="/login" className="text-amber-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
