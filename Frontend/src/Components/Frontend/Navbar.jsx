import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { getAuth, clearAuth } from "../../utils/Auth";
import { useCart } from "../../context/CartContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🎨 Theme colors
const GOLD = "#C9A24D";       // Champagne Gold
const GOLD_HOVER = "#E1C16E";
const CHARCOAL = "#111111";

export default function Navbar() {
  const navigate = useNavigate();
  const { user } = getAuth();
  const { items } = useCart();

  const [categories, setCategories] = useState([]);
  const [catOpen, setCatOpen] = useState(false);

  const cartCount = useMemo(() => {
    return (items || []).reduce((sum, it) => sum + Number(it?.qty || 0), 0);
  }, [items]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const json = await res.json();
        if (mounted && Array.isArray(json?.data)) setCategories(json.data);
      } catch {
        if (mounted) setCategories([]);
      }
    })();
    return () => (mounted = false);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (!e.target.closest("#dn-cat-dd")) setCatOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleLogout = () => {
    clearAuth();
    navigate("/login");
  };

  const handleProfileClick = () => {
    user?.isAdmin ? navigate("/admin") : navigate("/profile");
  };

  // ✅ Underline animation that ALWAYS works (uses CSS variable)
  const navClass = ({ isActive }) =>
    [
      "relative px-2 py-1 text-[15px] font-semibold text-[#111111]",
      "transition-colors duration-300",
      "after:content-[''] after:absolute after:left-0 after:-bottom-2 after:h-[2px] after:w-full",
      "after:origin-left after:rounded-full after:transition-transform after:duration-300 after:ease-out",
      isActive ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
    ].join(" ");

  return (
    <header className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-start gap-3">
          <div className="w-12 h-12 flex items-center justify-center">
            <img
              src={logo}
              alt="VTry Icon"
              className="w-12 h-12 object-contain scale-[2.2] translate-y-[3px]"
            />
          </div>

          <div className="flex flex-col leading-[1.05] pt-[2px]">
            {/* ✅ VTry in gold */}
            <span className="text-xl font-extrabold" style={{ color: GOLD }}>
              VTry
            </span>
            <span className="text-sm text-gray-500">
              Virtual Try-On Accessories
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 h-full">
          {/* ✅ underline color via style */}
          <NavLink to="/" className={navClass} style={{ ["--u"]: GOLD }}>
            Home
          </NavLink>

          <NavLink to="/shop" className={navClass} style={{ ["--u"]: GOLD }}>
            Shop
          </NavLink>

          {/* Categories dropdown */}
          <div id="dn-cat-dd" className="relative h-full flex items-center">
            <button
              onClick={() => setCatOpen((s) => !s)}
              className="px-2 py-1 text-[15px] font-semibold text-[#111111]"
              type="button"
            >
              Categories{" "}
              <span
                className="text-xs ml-1 transition-colors"
                style={{ color: catOpen ? GOLD_HOVER : CHARCOAL }}
              >
                ▼
              </span>
            </button>

            {catOpen && (
              <div className="absolute right-0 top-full mt-3 w-64 bg-white border rounded-2xl z-50">
                <div className="px-4 py-3 text-xs font-semibold text-gray-500 border-b bg-gray-50">
                  Browse Categories
                </div>

                {categories.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-600">
                    No categories
                  </div>
                ) : (
                  categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => {
                        setCatOpen(false);
                        navigate(`/category/${cat._id}`);
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-[#111111] hover:bg-gray-50"
                      type="button"
                    >
                      {cat.title}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <NavLink to="/about" className={navClass} style={{ ["--u"]: GOLD }}>
            About
          </NavLink>

          <NavLink to="/contact" className={navClass} style={{ ["--u"]: GOLD }}>
            Contact
          </NavLink>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative px-2 py-1 text-[15px] font-semibold text-[#111111]"
          >
            Cart
            <span
              className="absolute -top-2 -right-3 min-w-[18px] h-[18px] px-1 rounded-full
                         text-[11px] flex items-center justify-center text-[#111111]"
              style={{ backgroundColor: GOLD }}
            >
              {cartCount}
            </span>
          </Link>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleProfileClick}
                className="px-4 py-2 rounded-xl border text-sm font-semibold
                           border-[rgba(201,162,77,0.55)] text-[#111111]
                           hover:bg-[rgba(201,162,77,0.12)] transition"
                type="button"
              >
                {user.isAdmin ? "Admin" : "Profile"}
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-red-600 hover:text-white transition"
                type="button"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded-xl border text-sm font-semibold hover:bg-gray-100 transition"
            >
              Login
            </Link>
          )}
        </nav>
      </div>

      {/* ✅ This style block makes the underline use the CSS variable */}
      <style>{`
        nav a::after {
          background: var(--u, ${GOLD});
        }
      `}</style>
    </header>
  );
}
