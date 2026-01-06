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

  // ✅ Try-on
  onTryOn,
  tryOnEnabled = false,
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

  const goldBtnBase =
    "px-6 py-3 rounded-xl border font-semibold transition inline-flex items-center justify-center";

  const goldBtnHandlers = {
    onMouseEnter: (e) => {
      e.currentTarget.style.backgroundColor = GOLD;
      e.currentTarget.style.color = "#111";
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
                    className="w-full h-14 object-cover rounded-lg"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="flex-1">
              <div className="border rounded-2xl overflow-hidden bg-white">
                <Zoom>
                  <img
                    src={selectedImg || thumbnails?.[0]}
                    alt={product?.title || "Product"}
                    className="w-full h-[420px] object-contain p-3"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/800x800?text=No+Image";
                    }}
                  />
                </Zoom>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Tip: Click thumbnails to switch image • Scroll to zoom
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Info */}
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {product?.title}
          </h1>

          <div className="mt-2 text-sm text-gray-500">
            {product?.brand ? (
              <>
                Brand: <span className="text-gray-800">{product.brand}</span>
              </>
            ) : (
              " "
            )}
          </div>

          {/* Price */}
          <div className="mt-5">
            {hasSale ? (
              <div className="flex items-end gap-3">
                <div className="text-3xl font-extrabold text-gray-900">
                  {formatPKR(product?.salePrice)}
                </div>
                <div className="text-lg text-gray-400 line-through">
                  {formatPKR(product?.price)}
                </div>
                <div className="text-sm font-semibold px-3 py-1 rounded-full border">
                  SALE
                </div>
              </div>
            ) : (
              <div className="text-3xl font-extrabold text-gray-900">
                {formatPKR(product?.price)}
              </div>
            )}
          </div>

          {/* Stock */}
          <div className="mt-4">
            {inStock ? (
              <span className="inline-flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                ● In Stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-3 py-1 rounded-full">
                ● Out of Stock
              </span>
            )}
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed">
            {product?.description
              ? product.description.slice(0, 220)
              : "Premium quality product. Experience elegance and comfort with our collection."}
            {product?.description && product.description.length > 220 ? "…" : ""}
          </p>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Qty */}
            <div className="inline-flex items-center border rounded-xl overflow-hidden w-full sm:w-auto">
              <button
                onClick={decreaseQty}
                className="px-4 py-2 text-lg font-bold hover:bg-gray-50"
                type="button"
              >
                -
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
                {...(inStock ? goldBtnHandlers : {})}
              >
                ADD TO CART
              </button>

              {/* ✅ TRY ON */}
              <button
                type="button"
                disabled={!tryOnEnabled}
                onClick={() => onTryOn?.()}
                className={`${goldBtnBase} w-full sm:w-auto`}
                style={{
                  borderColor: GOLD,
                  color: GOLD,
                  backgroundColor: "transparent",
                  opacity: tryOnEnabled ? 1 : 0.6,
                  cursor: tryOnEnabled ? "pointer" : "not-allowed",
                }}
                {...(tryOnEnabled ? goldBtnHandlers : {})}
                title={
                  tryOnEnabled
                    ? "Open camera for virtual try-on"
                    : "Try-on not available (overlay missing)"
                }
              >
                TRY ON
              </button>

              <button
                type="button"
                disabled={!inStock}
                onClick={handleBuyNow}
                className={`${goldBtnBase} w-full sm:w-auto`}
                style={{ borderColor: GOLD, color: GOLD, backgroundColor: "transparent" }}
                {...(inStock ? goldBtnHandlers : {})}
              >
                BUY NOW
              </button>
            </div>
          </div>

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
