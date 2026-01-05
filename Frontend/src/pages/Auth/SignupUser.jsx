import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function SignupUser() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const Eye = ({ open }) => (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="opacity-80"
    >
      {open ? (
        <>
          <path
            d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </>
      ) : (
        <>
          <path
            d="M3 3l18 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10.5 10.7a3 3 0 0 0 4.1 4.1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M9.9 5.2A10.2 10.2 0 0 1 12 5c6.5 0 10 7 10 7a17.3 17.3 0 0 1-4.2 5.2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M6.7 6.7C3.7 9.1 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );

  const signup = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName || !lastName || !dob || !gender || !phone || !email) {
      setError("All fields are required.");
      return;
    }

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
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          dob,
          gender,
          phone,
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Signup failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/");
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-black">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow">
        <h1 className="text-2xl font-bold text-white">Create Account</h1>
        <p className="text-zinc-300 mt-1 text-sm">Sign up to continue</p>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-900/30 border border-red-800 text-red-200 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={signup} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-200">First Name *</label>
              <input
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-200">Last Name *</label>
              <input
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>

            <div>
              <label className="text-sm text-zinc-200">Date of Birth *</label>
              <input
                type="date"
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm text-zinc-200">Gender *</label>
              <select
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-zinc-200">Phone *</label>
              <input
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03xx-xxxxxxx"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-zinc-200">Email *</label>
              <input
                className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
              />
            </div>

            {/* Password */}
            <div className="md:col-span-2">
              <label className="text-sm text-zinc-200">Password *</label>
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

            {/* Confirm Password */}
            <div className="md:col-span-2">
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
          </div>

          <button
            disabled={loading}
            className="w-full mt-2 px-6 py-3 rounded-xl bg-amber-500 text-black font-semibold hover:opacity-95 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>

          <p className="text-sm text-zinc-300 text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-amber-400 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
