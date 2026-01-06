import React from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const GOLD = "#E1C16E";

const formatPKR = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return n ?? "—";
  return `Rs ${num.toLocaleString("en-PK")}`;
};

export default function ProductDetails({
  product,
  thumbnails,
  setSelectedImg,
  selectedImg,
  increaseQty,
  decreaseQty,
  quantity,
}) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const hasSale =
    product?.salePrice !== null &&
    product?.salePrice !== undefined &&
    Number(product.salePrice) > 0 &&
    Number(product.salePrice) < Number(product.price);

  const inStock = Number(product?.stockQuantity ?? 0) > 0;

  const addItemToCart = () => {
    if (!product?._id) return;
    addToCart(
      {
        ...product,
        selectedImg,
      },
      quantity
    );
  };

  const handleAddToCart = () => {
    addItemToCart();
    navigate("/cart");
  };

  const handleBuyNow = () => {
    addItemToCart();
    navigate("/checkout");
  };

  // gold button helper styles
  const goldBtnBase =
    "px-8 py-3 rounded-xl border font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed";
  const goldBtnHandlers = {
    onMouseEnter: (e) => {
      e.currentTarget.style.backgroundColor = GOLD;
      e.currentTarget.style.color = "#fff";
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.backgroundColor = "transparent";
      e.currentTarget.style.color = GOLD;
    },
  };

  return (
    <div className="bg-white border rounded-2xl overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* LEFT: Images */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r">
          <div className="flex gap-4">
            {/* Thumbs */}
            <div className="flex flex-col gap-2 w-16">
              {(thumbnails || []).map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImg(img)}
                  className="rounded-xl border p-1 overflow-hidden bg-white"
                  style={{ borderColor: selectedImg === img ? GOLD : "#e5e7eb" }}
                  title="View"
                >
                  <img
                    src={img}
                    alt={`Thumb ${idx}`}
                    className="w-14 h-14 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </button>
              ))}
            </div>

            {/* Main */}
            <div className="flex-1 rounded-2xl bg-gray-50 border overflow-hidden flex items-center justify-center min-h-[380px]">
              <Zoom>
                <img
                  src={selectedImg}
                  alt={product?.title || "Product"}
                  className="w-full h-full object-contain p-6 cursor-zoom-in"
                />
              </Zoom>
            </div>
          </div>
        </div>

        {/* RIGHT: Details */}
        <div className="p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-serif font-semibold tracking-wide">
              {product?.title || "Untitled Product"}
            </h1>

            <span
              className="text-xs px-3 py-1 rounded-full border"
              style={{
                borderColor: inStock ? "rgba(34,197,94,0.35)" : "rgba(239,68,68,0.35)",
                color: inStock ? "#166534" : "#991b1b",
                backgroundColor: inStock ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
              }}
            >
              {inStock ? `In Stock (${product.stockQuantity})` : "Out of Stock"}
            </span>
          </div>

          {/* Brand / Category */}
          <div className="mt-3 text-sm text-gray-600">
            {product?.brand ? <span className="font-medium">{product.brand}</span> : null}
            {product?.brand && product?.category ? <span className="mx-2">•</span> : null}
            {product?.category ? <span>Category: {product.category}</span> : null}
          </div>

          {/* Price */}
          <div className="mt-6 flex items-end gap-3">
            {hasSale ? (
              <>
                <div className="text-2xl font-bold">{formatPKR(product.salePrice)}</div>
                <div className="text-sm text-gray-500 line-through">{formatPKR(product.price)}</div>
                <div
                  className="text-xs px-2 py-1 rounded-lg border font-semibold"
                  style={{ borderColor: GOLD, color: "#111111", backgroundColor: "rgba(225,193,110,0.18)" }}
                >
                  SALE
                </div>
              </>
            ) : (
              <div className="text-2xl font-bold">{formatPKR(product?.price)}</div>
            )}
          </div>

          <p className="mt-5 text-gray-700 leading-relaxed">
            {product?.description || "No description added yet."}
          </p>

          {/* Qty + Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="inline-flex items-center rounded-xl border overflow-hidden">
              <button
                onClick={decreaseQty}
                className="px-4 py-2 text-lg font-bold hover:bg-gray-50"
                type="button"
              >
                −
              </button>
              <div className="px-5 py-2 font-semibold">{quantity}</div>
              <button
                onClick={increaseQty}
                className="px-4 py-2 text-lg font-bold hover:bg-gray-50"
                type="button"
              >
                +
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <button
                type="button"
                disabled={!inStock}
                onClick={handleAddToCart}
                className={`${goldBtnBase} w-full sm:w-auto`}
                style={{ borderColor: GOLD, color: GOLD, backgroundColor: "transparent" }}
                {...goldBtnHandlers}
              >
                ADD TO CART
              </button>

              <button
                type="button"
                disabled={!inStock}
                onClick={handleBuyNow}
                className={`${goldBtnBase} w-full sm:w-auto`}
                style={{ borderColor: GOLD, color: GOLD, backgroundColor: "transparent" }}
                {...goldBtnHandlers}
              >
                BUY NOW
              </button>
            </div>
          </div>

          {/* Small perks */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="border rounded-xl p-3">✓ Premium Quality</div>
            <div className="border rounded-xl p-3">✓ Secure Payments</div>
            <div className="border rounded-xl p-3">✓ Easy Returns</div>
            <div className="border rounded-xl p-3">✓ Fast Delivery</div>
          </div>
        </div>
      </div>
    </div>
  );
}
