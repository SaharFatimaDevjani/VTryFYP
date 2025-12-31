import React from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { getAuth, clearAuth } from "../../utils/Auth";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = getAuth();

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  return (
    <header className="flex justify-between items-center py-4 px-8 border-b text-sm font-medium">
      <nav className="flex space-x-6">
        <Link to="/rings">RINGS</Link>
        <Link to="/bracelets">BRACELETS</Link>
        <Link to="/earrings">EARRINGS</Link>
        <Link to="/necklaces">NECKLACES</Link>
      </nav>

      <div className="text-xl font-bold tracking-wide">
        <img src={logo} alt="logo" className="w-20 h-12" />
      </div>

      <div className="flex items-center space-x-4">
        <Link to="/">HOME</Link>
        <Link to="/about">ABOUT</Link>
        <Link to="/contact">CONTACT</Link>

        <div className="relative">
          <Link to="/cart" className="mr-4">
            <span role="img" aria-label="cart">
              🛒
            </span>{" "}
            Cart
          </Link>
          <span className="absolute -top-2 -right-2 bg-black text-white text-xs px-1 rounded-full">
            1
          </span>
        </div>

        {/* ✅ Auth area */}
        {!user ? (
          <Link to="/login" className="px-3 py-1 rounded border">
            Login
          </Link>
        ) : (
          <div className="flex items-center gap-3">
            {/* Clicking name goes to profile page */}
            <button
              onClick={() => navigate("/profile")}
              className="px-3 py-1 rounded border hover:bg-black hover:text-white transition"
              type="button"
            >
              {user?.first_name || "User"}
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded border hover:bg-red-600 hover:text-white transition"
              type="button"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
