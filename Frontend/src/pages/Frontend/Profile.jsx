import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, clearAuth } from "../../utils/auth";

export default function Profile() {
  const navigate = useNavigate();
  const { token, user } = getAuth();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  // Safety: if not logged in
  if (!token || !user) {
    navigate("/login");
    return null;
  }

  // block admin from this page (your requirement)
  if (user.isAdmin) {
    navigate("/admin");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Failed to change password.");

      setMsg("Password changed successfully. Please login again.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // force re-login (good security)
      clearAuth();
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900/70 border border-zinc-800 p-6 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-white">My Profile</h1>
          <p className="text-sm text-zinc-300 mt-1">
            {user.first_name} {user.last_name} • {user.email}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        {msg && (
          <div className="mb-4 rounded-lg border border-green-500/40 bg-green-500/10 px-3 py-2 text-sm text-green-200">
            {msg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-zinc-200">Old Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-200">New Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className="text-sm text-zinc-200">Confirm New Password</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 text-zinc-950 font-semibold py-2.5 hover:bg-amber-400 disabled:opacity-60"
            type="submit"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
