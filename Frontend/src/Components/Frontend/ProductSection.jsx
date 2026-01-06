import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

export default function ProductSection({title}) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data?.data || [];
        if (mounted) setProducts(list.slice(0, 8)); // show first 8
      } catch {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => (mounted = false);
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-6 py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
            Featured
          </p>
          <h2 className="text-2xl md:text-3xl font-bold text-black">
            {title || "Our Products"}
          </h2>
        </div>

        <button
          className="hidden md:inline-flex px-5 py-2 rounded-xl border text-sm font-semibold transition"
          style={{ borderColor: GOLD, color: GOLD }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = GOLD;
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = GOLD;
          }}
          onClick={() => navigate("/shop")}
        >
          View All
        </button>
      </div>

      <div className="mt-8">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-600">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((p) => {
              const img = getProductImage(p);
              const { base, sale, onSale } = getPrices(p);

              return (
                <div
                  key={p._id}
                  className="cursor-pointer group rounded-2xl border bg-white overflow-hidden transition hover:border-black/30"
                  onClick={() => navigate(`/product/${p._id}`)}
                >
                  <div className="relative aspect-square bg-gray-50 overflow-hidden">
                    <img
                      src={img}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition"
                    />

                    {onSale && (
                      <div
                        className="absolute top-3 left-3 text-[11px] font-bold px-3 py-1 rounded-full"
                        style={{ backgroundColor: GOLD, color: "#111" }}
                      >
                        SALE
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <div className="font-semibold text-sm line-clamp-1">
                      {p.title}
                    </div>

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

      <div className="mt-8 md:hidden">
        <button
          className="w-full px-5 py-3 rounded-xl border text-sm font-semibold transition"
          style={{ borderColor: GOLD, color: GOLD }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = GOLD;
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = GOLD;
          }}
          onClick={() => navigate("/shop")}
        >
          View All Products
        </button>
      </div>
    </section>
  );
}
