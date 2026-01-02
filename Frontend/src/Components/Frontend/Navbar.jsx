import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { getAuth, clearAuth } from "../../utils/Auth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = getAuth();

  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchCategories() {
      try {
        setCatLoading(true);
        const res = await fetch(`${API_URL}/api/categories`);
        const json = await res.json().catch(() => ({}));

        // your backend returns: { data: [...] }
        const list = Array.isArray(json?.data) ? json.data : [];

        if (mounted) setCategories(list);
      } catch (e) {
        if (mounted) setCategories([]);
      } finally {
        if (mounted) setCatLoading(false);
      }
    }

    fetchCategories();

    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleNameClick = () => {
    if (user?.isAdmin) navigate("/admin");
    else navigate("/profile");
  };

  return (
    <header className="flex justify-between items-center py-4 px-8 border-b text-sm font-medium">
      {/* ✅ LEFT: Dynamic Categories */}
      <nav className="flex space-x-6">
        {catLoading ? (
          <span className="text-gray-500">Loading...</span>
        ) : categories.length === 0 ? (
          // fallback if DB empty or server not running
          <>
            <Link to="category/69559745764b254a2e367953">RINGS</Link>
            <Link to="category/69559782764b254a2e367957">WATCHES</Link>
            <Link to="category/69581b687629fdd2abe8c40c">EARRINGS</Link>
            <Link to="category/69581b717629fdd2abe8c40f">NECKLACES</Link>
          </>
        ) : (
          categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/category/${cat._id}`}
              className="uppercase"
              title={cat.title}
            >
              {cat.title}
            </Link>
          ))
        )}
      </nav>

      {/* Center logo */}
      <div className="text-xl font-bold tracking-wide">
        <img src={logo} alt="logo" className="w-20 h-12" />
      </div>

      {/* ✅ RIGHT: Keep as is (with small admin/user name behavior) */}
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
            {/* Clicking name -> /profile for user, /admin for admin */}
            <button
              onClick={handleNameClick}
              className="px-3 py-1 rounded border hover:bg-black hover:text-white transition"
              type="button"
              title={user?.email || ""}
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
