import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function SignupUser() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // basic validation
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          dob,       // optional
          gender,    // optional
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Signup failed.");

      // optional: store token
      if (data?.token) localStorage.setItem("token", data.token);

      navigate("/login");
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
          <h1 className="text-2xl font-semibold text-white">Create account</h1>
          <p className="text-sm text-zinc-300 mt-1">Sign up to get started</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* First Name */}
          <div>
            <label className="text-sm text-zinc-200">First Name *</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="First name"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="text-sm text-zinc-200">Last Name *</label>
            <input
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Last name"
            />
          </div>

          {/* DOB */}
          <div>
            <label className="text-sm text-zinc-200">Date of Birth</label>
            <input
              type="date"
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="text-sm text-zinc-200">Gender</label>
            <select
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Email */}
          <div>
            <label className="text-sm text-zinc-200">Email *</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-zinc-200">Password *</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2 text-white outline-none focus:border-amber-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-amber-500 text-zinc-950 font-semibold py-2.5 hover:bg-amber-400 disabled:opacity-60"
            type="submit"
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-zinc-300">
          Already have an account?{" "}
          <Link className="text-amber-400 hover:text-amber-300 font-semibold" to="/login">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
