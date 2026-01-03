// Frontend/src/pages/Frontend/ProductDetail.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";

import ProductDetails from "../../components/Frontend/ProductDetails";
import DescriptionAndReviews from "../../components/Frontend/DescriptionAndReviews";
import RelatedProducts from "../../components/Frontend/RelatedProducts";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const FALLBACK_IMG = "https://via.placeholder.com/800x800?text=No+Image";

export default function ProductDetail() {
  const { productId } = useParams();

  const [quantity, setQuantity] = useState(1);

  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(FALLBACK_IMG);

  const [relatedProducts, setRelatedProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const thumbnails = useMemo(() => {
    if (!product) return [FALLBACK_IMG];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    // backward compat: old field "image"
    if (product.image) return [product.image];
    return [FALLBACK_IMG];
  }, [product]);

  useEffect(() => {
    let mounted = true;

    async function fetchProduct() {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`${API_URL}/api/products/${productId}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json?.message || "Failed to load product");

        const p = json?.data || json; // supports {success,data} or direct object
        if (!mounted) return;

        setProduct(p);

        // set main image
        const first =
          (Array.isArray(p?.images) && p.images[0]) ||
          p?.image ||
          FALLBACK_IMG;
        setSelectedImg(first || FALLBACK_IMG);
      } catch (e) {
        if (mounted) setErr(e.message || "Something went wrong");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchProduct();

    return () => {
      mounted = false;
    };
  }, [productId]);

  // basic related products: same category (optional)
  useEffect(() => {
    let mounted = true;

    async function fetchRelated() {
      try {
        if (!product?.category) return;
        const res = await fetch(`${API_URL}/api/products?category=${product.category}`);
        const json = await res.json().catch(() => ({}));
        const list = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];

        if (!mounted) return;

        // remove current product & take top 4
        const filtered = list.filter((x) => x._id !== product._id).slice(0, 4);
        setRelatedProducts(filtered);
      } catch {
        if (mounted) setRelatedProducts([]);
      }
    }

    fetchRelated();
    return () => {
      mounted = false;
    };
  }, [product?.category, product?._id]);

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-6 w-40 bg-gray-200 rounded" />
          <div className="h-80 bg-gray-200 rounded-2xl" />
          <div className="h-6 w-72 bg-gray-200 rounded" />
          <div className="h-4 w-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (err || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="border rounded-2xl p-6 bg-white shadow-sm">
          <h2 className="text-xl font-semibold">Product not available</h2>
          <p className="text-gray-600 mt-2">{err || "Not found"}</p>
          <Link
            to="/"
            className="inline-block mt-4 px-5 py-2 rounded-xl border hover:bg-black hover:text-white transition"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // shape for your existing UI component
  const uiProduct = {
    _id: product._id,
    title: product.title,
    description: product.description,
    brand: product.brand,
    category: product.category,
    price: product.price,
    salePrice: product.salePrice,
    stockQuantity: product.stockQuantity,
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link className="hover:text-black" to="/">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800">{uiProduct.title}</span>
      </div>

      <ProductDetails
        product={uiProduct}
        thumbnails={thumbnails}
        setSelectedImg={setSelectedImg}
        selectedImg={selectedImg}
        increaseQty={increaseQty}
        decreaseQty={decreaseQty}
        quantity={quantity}
      />

      <DescriptionAndReviews product={uiProduct} />

      <RelatedProducts relatedProducts={relatedProducts} />
    </div>
  );
}
