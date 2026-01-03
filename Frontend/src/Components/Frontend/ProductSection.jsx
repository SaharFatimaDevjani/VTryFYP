import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const FALLBACK_IMG = "https://via.placeholder.com/600x600?text=No+Image";

export default function ProductSection({ title }) {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleClick = (id) => {
    navigate(`/product/${id}`);
  };

  // ✅ pick correct image (new: images[], old: image)
  const getProductImage = (p) => {
    // New system: images array (Cloudinary URLs)
    if (Array.isArray(p?.images) && p.images.length > 0) {
      const first = p.images[0];
      if (typeof first === "string" && first.trim()) return first;
    }

    // Backward compatibility: old single image field
    if (p?.image && typeof p.image === "string" && p.image.trim()) {
      return p.image.startsWith("http") ? p.image : `${API_URL}${p.image}`;
    }

    // fallback
    return FALLBACK_IMG;
  };

  useEffect(() => {
    let mounted = true;

    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/products`);
        const json = await res.json().catch(() => ({}));

        const list = Array.isArray(json?.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];

        if (!mounted) return;

        // show first 8 for homepage section
        setProducts(list.slice(0, 8));
      } catch (e) {
        if (mounted) setProducts([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="py-10 text-center">
      <h2 className="text-2xl font-serif mb-2">{title}</h2>
      <div className="mx-auto w-16 border-b-2 border-black mb-6"></div>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-600">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
          {products.map((p) => {
            const imgSrc = getProductImage(p);

            return (
              <div
                key={p._id}
                className="text-left cursor-pointer group rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition"
                onClick={() => handleClick(p._id)}
              >
                <div className="aspect-square bg-gray-100 overflow-hidden">
                  <img
                    src={imgSrc}
                    alt={p.title || "Product"}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // prevent broken image icon
                      e.currentTarget.src = FALLBACK_IMG;
                    }}
                  />
                </div>

                <div className="p-3">
                  <h4 className="text-sm font-medium line-clamp-1">
                    {p.title || "Untitled Product"}
                  </h4>
                  <p className="text-sm font-semibold mt-1">
                    {typeof p.price === "number"
                      ? `Rs ${p.price}`
                      : p.price || "—"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
