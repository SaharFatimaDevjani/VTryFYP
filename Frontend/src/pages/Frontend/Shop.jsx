import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeroSection2 from "../../components/Frontend/HeroSection2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const FALLBACK_IMG = "https://via.placeholder.com/600x600?text=No+Image";
const GOLD = "#E1C16E";

function getProductImage(p) {
  const img =
    (Array.isArray(p?.images) && p.images[0]) ||
    p?.image ||
    p?.selectedImg ||
    "";
  return img || FALLBACK_IMG;
}

function getPrices(p) {
  const base = Number(p?.price || 0);
  const sale =
    Number(p?.salePrice || 0) ||
    Number(p?.discountPrice || 0) ||
    Number(p?.sale_price || 0);

  const onSale = sale > 0 && sale < base;
  return { base, sale: onSale ? sale : 0, onSale };
}

const formatPKR = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

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
        if (mounted) setProducts(Array.isArray(data) ? data : data?.data || []);
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
      <HeroSection2 subHeading="All Products" mainHeading="Shop" />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="text-sm text-gray-600">
            {loading ? "Loading..." : `${filtered.length} products`}
          </div>

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products..."
            className="w-full md:w-80 border rounded-xl px-4 py-2 outline-none focus:border-black"
          />
        </div>

        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-600">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filtered.map((p) => {
              const img = getProductImage(p);
              const { base, sale, onSale } = getPrices(p);

              return (
                <div
                  key={p._id}
                  className="cursor-pointer group rounded-2xl border bg-white overflow-hidden transition hover:border-black/30"
                  onClick={() => navigate(`/product/${p._id}`)}
                >
                  {/* Image */}
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={img}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition"
                    />

                    {/* SALE TAG */}
                    {onSale && (
                      <div
                        className="absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: GOLD, color: "#111" }}
                      >
                        SALE
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <div className="font-semibold text-sm line-clamp-1">
                      {p.title}
                    </div>

                    {/* Price */}
                    <div className="mt-1 text-sm flex items-center gap-2">
                      {onSale ? (
                        <>
                          <span className="font-semibold text-black">
                            {formatPKR(sale)}
                          </span>
                          <span className="text-gray-500 line-through text-xs">
                            {formatPKR(base)}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-800 font-semibold">
                          {formatPKR(base)}
                        </span>
                      )}
                    </div>

                    {/* Gold Button */}
                    <button
                      type="button"
                      className="mt-3 w-full text-sm font-semibold rounded-xl border px-4 py-2 transition"
                      style={{
                        borderColor: GOLD,
                        color: GOLD,
                        backgroundColor: "transparent",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = GOLD;
                        e.currentTarget.style.color = "#fff";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = GOLD;
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${p._id}`);
                      }}
                    >
                      View Product
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
