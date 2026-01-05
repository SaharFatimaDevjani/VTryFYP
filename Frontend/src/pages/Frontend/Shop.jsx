import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection2 from "../../components/Frontend/HeroSection2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const FALLBACK_IMG = "https://via.placeholder.com/600x600?text=No+Image";

function getProductImage(p) {
  const img =
    (Array.isArray(p?.images) && p.images[0]) ||
    p?.image ||
    p?.selectedImg ||
    "";
  return img || FALLBACK_IMG;
}

export default function Shop() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        if (mounted) {
          setProducts(Array.isArray(data) ? data : data?.data || []);
        }
      } catch {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((p) =>
      (p.title || "").toLowerCase().includes(needle)
    );
  }, [products, q]);

  return (
    <>
      {/* ✅ Hero Section */}
      <HeroSection2
        subHeading="All Products"
        mainHeading="Shop"
      />

      {/* ✅ Shop Content */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Search */}
        <div className="flex justify-end mb-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full md:w-80 border rounded-xl px-4 py-2 outline-none focus:border-black"
          />
        </div>

        {/* Products */}
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((p) => (
              <div
                key={p._id}
                className="cursor-pointer group rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition"
                onClick={() => navigate(`/product/${p._id}`)}
              >
                <div className="aspect-square bg-gray-50">
                  <img
                    src={getProductImage(p)}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-[1.02] transition"
                  />
                </div>

                <div className="p-3">
                  <div className="font-semibold text-sm line-clamp-1">
                    {p.title}
                  </div>
                  <div className="text-gray-700 text-sm mt-1">
                    Rs {Number(p.price || 0).toLocaleString("en-PK")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
