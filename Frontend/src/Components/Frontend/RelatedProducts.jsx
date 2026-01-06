import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GOLD = "#E1C16E";
const FALLBACK_IMG = "https://via.placeholder.com/600x600?text=No+Image";

function getProductImage(p) {
  const img =
    (Array.isArray(p?.images) && p.images[0]) ||
    p?.image ||
    p?.selectedImg ||
    "";
  return img || FALLBACK_IMG;
}

function formatPKR(n) {
  return `Rs ${Number(n || 0).toLocaleString("en-PK")}`;
}

export default function RelatedProducts({ currentProduct }) {
  const navigate = useNavigate();
  const scrollerRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]);

  const category = currentProduct?.category;
  const currentId = String(currentProduct?._id || "");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setList([]);

        if (!category) {
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${API_URL}/api/products?category=${encodeURIComponent(category)}`
        );
        const json = await res.json();

        const arr = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];

        // remove current product + take at least 5 if available
        const filtered = arr
          .filter((p) => String(p?._id) !== currentId)
          .slice(0, 10);

        if (mounted) setList(filtered);
      } catch {
        if (mounted) setList([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [category, currentId]);

  const cards = useMemo(() => list || [], [list]);

  const scrollByCards = (dir = 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = 280; // approx
    el.scrollBy({ left: dir * cardWidth, behavior: "smooth" });
  };

  if (!category) return null;

  return (
    <section>
      <div className="flex items-end justify-between gap-4 mb-5">
        <div>
          <h3 className="text-2xl font-serif">Related Products</h3>
          <p className="text-sm text-gray-600 mt-1">
            More from <span className="font-medium">{category}</span>
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            className="w-10 h-10 rounded-xl border transition"
            style={{ borderColor: GOLD, color: GOLD }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = GOLD;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = GOLD;
            }}
            aria-label="Scroll left"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={() => scrollByCards(1)}
            className="w-10 h-10 rounded-xl border transition"
            style={{ borderColor: GOLD, color: GOLD }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = GOLD;
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = GOLD;
            }}
            aria-label="Scroll right"
          >
            ›
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-600">Loading…</p>
      ) : cards.length === 0 ? (
        <p className="text-gray-600">No related products found.</p>
      ) : (
        <div
          ref={scrollerRef}
          className="flex gap-5 overflow-x-auto pb-2 scroll-smooth"
          style={{ scrollbarWidth: "thin" }}
        >
          {cards.map((p) => {
            const hasSale =
              p?.salePrice !== null &&
              p?.salePrice !== undefined &&
              Number(p.salePrice) > 0 &&
              Number(p.salePrice) < Number(p.price);

            return (
              <div
                key={p._id}
                className="min-w-[240px] sm:min-w-[260px] md:min-w-[280px] cursor-pointer group rounded-2xl border bg-white overflow-hidden transition"
                onClick={() => navigate(`/product/${p._id}`)}
              >
                <div className="relative aspect-square bg-gray-50">
                  {hasSale ? (
                    <span
                      className="absolute top-3 left-3 text-xs px-2.5 py-1 rounded-full font-semibold border"
                      style={{
                        borderColor: GOLD,
                        color: "#111111",
                        backgroundColor: "rgba(225,193,110,0.18)",
                      }}
                    >
                      Sale
                    </span>
                  ) : null}

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

                  <div className="mt-1 text-sm">
                    {hasSale ? (
                      <>
                        <span className="font-semibold">{formatPKR(p.salePrice)}</span>
                        <span className="ml-2 text-gray-400 line-through">
                          {formatPKR(p.price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-700">{formatPKR(p.price)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
