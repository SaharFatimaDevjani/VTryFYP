import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import HeroSection2 from "../../Components/Frontend/Herosection2";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CategoryProducts() {
  const { categoryId } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // find category by id (for banner heading)
  const currentCategory = useMemo(() => {
    return categories.find((c) => c._id === categoryId) || null;
  }, [categories, categoryId]);

  useEffect(() => {
    let mounted = true;

    async function fetchAll() {
      try {
        setLoading(true);
        setError("");

        // fetch categories + products in parallel
        const [catRes, prodRes] = await Promise.all([
          fetch(`${API_URL}/api/categories`),
          fetch(`${API_URL}/api/products`),
        ]);

        const catJson = await catRes.json().catch(() => ({}));
        const prodJson = await prodRes.json().catch(() => ({}));

        const catList = Array.isArray(catJson?.data) ? catJson.data : [];
        // products endpoint sometimes returns {data: []} or [] depending on backend
        const prodList = Array.isArray(prodJson?.data)
          ? prodJson.data
          : Array.isArray(prodJson)
          ? prodJson
          : [];

        if (!mounted) return;

        setCategories(catList);
        setProducts(prodList);
      } catch (e) {
        if (!mounted) return;
        setError("Failed to load category products.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchAll();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  // ✅ filter products by category
  const filtered = useMemo(() => {
    return products.filter((p) => {
      // case 1: category stored as string id
      if (typeof p.category === "string") return p.category === categoryId;

      // case 2: category populated object
      if (p.category && typeof p.category === "object") {
        return p.category._id === categoryId;
      }

      return false;
    });
  }, [products, categoryId]);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  const title = currentCategory?.title || "Category";
  const subHeading = "Browse Collection";

  return (
    <div>
      <HeroSection2 subHeading={subHeading} mainHeading={title} />

      <div className="max-w-6xl mx-auto px-4 py-10">
        {loading ? (
          <div className="text-center text-gray-600">Loading products...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-600">
            No products found in this category.
          </div>
        ) : (
          <>
            <div className="flex items-end justify-between mb-6">
              <h2 className="text-2xl font-serif">
                {title} <span className="text-gray-500 text-base">({filtered.length})</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {filtered.map((p) => (
                <div
                  key={p._id}
                  onClick={() => handleProductClick(p._id)}
                  className="group cursor-pointer rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    <img
                      src={
                        p.image
                          ? p.image.startsWith("http")
                            ? p.image
                            : `${API_URL}${p.image}`
                          : "https://via.placeholder.com/600x600?text=No+Image"
                      }
                      alt={p.title || "Product"}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="p-3">
                    <h4 className="text-sm font-medium line-clamp-1">
                      {p.title || "Untitled Product"}
                    </h4>
                    <p className="text-sm font-semibold mt-1">
                      {typeof p.price === "number" ? `Rs ${p.price}` : p.price || "—"}
                    </p>
                    <button
                      type="button"
                      className="mt-3 w-full rounded-xl border px-3 py-2 text-sm font-medium group-hover:bg-black group-hover:text-white transition"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductClick(p._id);
                      }}
                    >
                      View Product
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
