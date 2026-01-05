import React, { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const Eye = ({ open }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-80">
      {open ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
          <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
        </>
      ) : (
        <>
          <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M10.5 10.7a3 3 0 0 0 4.1 4.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M9.9 5.2A10.2 10.2 0 0 1 12 5c6.5 0 10 7 10 7a17.3 17.3 0 0 1-4.2 5.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M6.7 6.7C3.7 9.1 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  );

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMsg("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Reset failed");

      setMsg("Password reset successful. Redirecting to login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold text-white">Reset Password</h1>
        <p className="text-zinc-300 mt-1 text-sm">Enter your new password.</p>

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
            <label className="text-sm text-zinc-200">New Password *</label>
            <div className="mt-1 relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 pr-12 text-white outline-none focus:border-amber-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-white"
                aria-label="Toggle password visibility"
              >
                <Eye open={showPassword} />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm text-zinc-200">Confirm Password *</label>
            <div className="mt-1 relative">
              <input
                type={showConfirm ? "text" : "password"}
                className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 pr-12 text-white outline-none focus:border-amber-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-white"
                aria-label="Toggle confirm password visibility"
              >
                <Eye open={showConfirm} />
              </button>
            </div>

            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-xs text-red-200 mt-2">Passwords do not match.</p>
            )}
          </div>

          <button
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
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
