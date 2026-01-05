import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/logo2.png";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// 🎨 Theme colors
const GOLD = "#E1C16E";      // Champagne Gold (hover tone)
const CHARCOAL = "#111111";

export default function Footer() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/categories`);
        const json = await res.json().catch(() => ({}));
        const list = Array.isArray(json?.data) ? json.data : [];
        if (mounted) setCategories(list);
      } catch {
        if (mounted) setCategories([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <footer
      className="text-white/80 border-t"
      style={{
        backgroundColor: CHARCOAL,
        borderColor: "rgba(225,193,110,0.18)",
      }}
    >
      {/* Main container */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-10 gap-x-6">
          {/* Brand */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <img
                  src={logo}
                  alt="VTry"
                  className="w-12 h-12 object-contain scale-[2.2]"
                />
              </div>

              {/* Brand text with underline animation */}
              <Link
                to="/"
                className="relative group inline-block"
              >
                <div
                  className="text-lg font-extrabold"
                  style={{ color: GOLD }}
                >
                  VTry
                </div>

                <div className="text-white/60 text-sm -mt-0.5">
                  Virtual Try-On Accessories
                </div>

                {/* underline */}
                <span
                  className="absolute left-0 -bottom-1 h-[2px] w-full scale-x-0
                             transition-transform duration-300 origin-left group-hover:scale-x-100"
                  style={{ backgroundColor: GOLD }}
                />
              </Link>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-white/70 max-w-sm">
              Try accessories virtually and shop with confidence. Premium pieces
              for men and women — watches, jewelry, and curated essentials.
            </p>

            <div
              className="mt-6 h-[2px] w-24 rounded-full"
              style={{ backgroundColor: GOLD }}
            />
          </div>

          {/* Company */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold mb-3 tracking-wide">
              Company
            </h3>
            <ul className="space-y-2 text-sm">
              {["/", "/shop", "/about", "/contact"].map((path, i) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="relative inline-block group"
                  >
                    <span className="transition-colors group-hover:text-[#E1C16E]">
                      {["Home", "Shop", "About", "Contact"][i]}
                    </span>
                    <span
                      className="absolute left-0 -bottom-0.5 h-[1.5px] w-full scale-x-0
                                 transition-transform duration-300 origin-left group-hover:scale-x-100"
                      style={{ backgroundColor: GOLD }}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-3">
            <h3 className="text-white font-semibold mb-3 tracking-wide">
              Categories
            </h3>

            {categories.length === 0 ? (
              <p className="text-sm text-white/55">No categories yet.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {categories.slice(0, 8).map((cat) => (
                  <li key={cat._id}>
                    <Link
                      to={`/category/${cat._id}`}
                      className="relative inline-block group"
                    >
                      <span className="transition-colors group-hover:text-[#E1C16E]">
                        {cat.title}
                      </span>
                      <span
                        className="absolute left-0 -bottom-0.5 h-[1.5px] w-full scale-x-0
                                   transition-transform duration-300 origin-left group-hover:scale-x-100"
                        style={{ backgroundColor: GOLD }}
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h3 className="text-white font-semibold mb-3 tracking-wide">
              Contact
            </h3>

            <div className="text-sm text-white/70 space-y-3">
              <div>
                <span className="text-white/55">Email:</span>{" "}
                <a
                  href="mailto:contact@info.com"
                  className="relative inline-block group"
                >
                  <span className="group-hover:text-[#E1C16E]">
                    contact@info.com
                  </span>
                  <span
                    className="absolute left-0 -bottom-0.5 h-[1.5px] w-full scale-x-0
                               transition-transform duration-300 origin-left group-hover:scale-x-100"
                    style={{ backgroundColor: GOLD }}
                  />
                </a>
              </div>

              <div>
                <span className="text-white/55">Phone:</span>{" "}
                <a
                  href="tel:+19292426868"
                  className="group-hover:text-[#E1C16E]"
                >
                  929-242-6868
                </a>
              </div>

              <div>
                <span className="text-white/55">Address:</span>
                <div className="mt-1 leading-relaxed text-white/70">
                  123 Fifth Avenue, New York, NY 10160
                </div>
              </div>
            </div>

            <div
              className="mt-6 h-[2px] w-20 rounded-full"
              style={{ backgroundColor: GOLD }}
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid rgba(225,193,110,0.14)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-white/55">
          <div>
            © {new Date().getFullYear()}{" "}
            <span style={{ color: GOLD }} className="font-semibold">
              VTry
            </span>
            . All rights reserved.
          </div>

          <div>
            Powered by{" "}
            <span style={{ color: GOLD }} className="font-semibold">
              VTry
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
