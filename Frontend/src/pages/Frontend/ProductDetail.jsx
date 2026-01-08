import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ProductDetails from "../../Components/Frontend/ProductDetails";
import DescriptionAndReviews from "../../Components/Frontend/DescriptionAndReviews";
import RelatedProducts from "../../Components/Frontend/RelatedProducts";

// ✅ Virtual Try-On
import TryOnModal from "../../Components/Frontend/TryOnModal";
import FaceTryOn from "../../Components/Frontend/FaceTryOn";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const FALLBACK_IMG = "https://via.placeholder.com/800x800?text=No+Image";

function ProductDetail() {
  const { productId } = useParams();

  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [selectedImg, setSelectedImg] = useState(FALLBACK_IMG);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // ✅ Try-on modal
  const [tryOnOpen, setTryOnOpen] = useState(false);

  const lastLoadedIdRef = useRef(null);

  const thumbnails = useMemo(() => {
    if (!product) return [FALLBACK_IMG];
    if (Array.isArray(product.images) && product.images.length) return product.images;
    if (product.image) return [product.image];
    return [FALLBACK_IMG];
  }, [product]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`${API_URL}/api/products/${productId}`);
        const json = await res.json();

        if (!res.ok) throw new Error(json?.message || "Failed to load product");

        const p = json?.data || json;
        if (!mounted) return;

        const currentId = String(p?._id || productId);

        if (lastLoadedIdRef.current === currentId) {
          setLoading(false);
          return;
        }

        lastLoadedIdRef.current = currentId;

        setProduct(p);

        const first =
          (Array.isArray(p?.images) && p.images[0]) ||
          p?.image ||
          FALLBACK_IMG;

        setSelectedImg(first || FALLBACK_IMG);
        setQuantity(1);
      } catch (e) {
        if (mounted) setErr(e?.message || "Something went wrong");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [productId]);

  const increaseQty = () => setQuantity((q) => q + 1);
  const decreaseQty = () => setQuantity((q) => (q > 1 ? q - 1 : 1));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center text-gray-600">Loading product…</div>
      </div>
    );
  }

  if (err || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="border rounded-2xl p-6 bg-white">
          <h2 className="text-xl font-semibold">Product not available</h2>
          <p className="text-gray-600 mt-2">{err || "Not found"}</p>

          <Link
            to="/shop"
            className="inline-block mt-4 px-5 py-2 rounded-xl border hover:bg-black hover:text-white transition"
          >
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const uiProduct = {
    _id: product._id,
    title: product.title,
    description: product.description,
    brand: product.brand,
    category: product.category,
    price: product.price,
    salePrice: product.salePrice,
    stockQuantity: product.stockQuantity,
    images: product.images,
    image: product.image,

    // ✅ Try-on fields
    tryOn: product.tryOn || {
      type: "glasses",
      overlayUrl: "",
      scaleMult: 1.15,
      yOffsetMult: -0.08,
      heightRatio: 0.40,
    },
  };

  const tryOnEnabled = Boolean(uiProduct?.tryOn?.overlayUrl);

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-6">
        <Link className="hover:text-black" to="/shop">
          Shop
        </Link>
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
        onTryOn={() => setTryOnOpen(true)}
        tryOnEnabled={tryOnEnabled}
      />

      {/* ✅ Try-on modal */}
      <TryOnModal open={tryOnOpen} onClose={() => setTryOnOpen(false)}>
        <FaceTryOn
          type={uiProduct?.tryOn?.type || "glasses"}
          overlayUrl={uiProduct?.tryOn?.overlayUrl || ""}
          // When meta info is provided on the product tryOn field, pass it through
          meta={uiProduct?.tryOn?.meta || null}
          // Tune these values as needed per product.  Since our improved
          // algorithm scales based on head width rather than eye distance, the
          // multiplier can be much smaller than before.  Height ratio depends
          // on the aspect ratio of the PNG.  yOffsetMult controls how far down
          // the glasses sit on the nose.
          scaleMult={uiProduct?.tryOn?.scaleMult || 1.15}
          heightRatio={uiProduct?.tryOn?.heightRatio || 0.40}
          yOffsetMult={uiProduct?.tryOn?.yOffsetMult || -0.08}
          smoothing={0.85}
        />
      </TryOnModal>









      {/* Reviews */}
      <div className="mt-10">
        <DescriptionAndReviews product={uiProduct} />
      </div>

      {/* ✅ Related (ONLY ONCE) */}
      <div className="mt-12">
        <RelatedProducts currentProduct={uiProduct} />
      </div>
    </div>
  );
}

export default ProductDetail;
