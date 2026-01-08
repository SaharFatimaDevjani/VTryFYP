import React from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const GOLD = "#E1C16E";

const formatPKR = (n) => {
  const num = Number(n);
  if (Number.isNaN(num)) return n || "—";
  return "Rs " + num.toLocaleString("en-PK");
};

export default function ProductDetails({
  product,
  thumbnails,
  setSelectedImg,
  selectedImg,
  increaseQty,
  decreaseQty,
  quantity,
  onTryOn,
  tryOnEnabled = false,
}) {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const hasSale =
    product?.salePrice &&
    Number(product.salePrice) < Number(product.price);

  const inStock = Number(product?.stockQuantity ?? 0) > 0;

  const addItemToCart = () => {
    if (!product?._id) return;
    addToCart({ ...product, selectedImg }, quantity);
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
    "px-6 py-3 rounded-xl border font-semibold transition flex items-center justify-center";

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
      <div className="grid grid-cols-1 md:grid-cols-2">
        {/* LEFT */}
        <div className="p-6 md:p-8 border-b md:border-b-0 md:border-r">
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 w-16">
              {(thumbnails || []).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  className="rounded-xl border p-1 bg-white"
                  style={{ borderColor: selectedImg === img ? GOLD : "#e5e7eb" }}
                  type="button"
                >
                  <img
                    src={img}
                    alt="thumb"
                    className="w-full h-14 object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>

            <div className="flex-1">
              <div className="border rounded-2xl overflow-hidden">
                <Zoom>
                  <img
                    src={selectedImg}
                    alt={product?.title}
                    className="w-full h-[420px] object-contain p-3"
                  />
                </Zoom>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold">
            {product?.title}
          </h1>

          <div className="mt-5">
            {hasSale ? (
              <div className="flex gap-3 items-end">
                <div className="text-3xl font-extrabold">
                  {formatPKR(product.salePrice)}
                </div>
                <div className="line-through text-gray-400">
                  {formatPKR(product.price)}
                </div>
              </div>
            ) : (
              <div className="text-3xl font-extrabold">
                {formatPKR(product.price)}
              </div>
            )}
          </div>

          {/* ACTION AREA */}
          <div className="mt-8 flex items-start gap-4">
            {/* ✅ FIXED QUANTITY (single row always) */}
            <div className="flex items-center border rounded-xl h-[56px] shrink-0">
              <button
                onClick={decreaseQty}
                className="px-4 text-lg font-bold"
                type="button"
              >
                -
              </button>
              <div className="px-4 font-semibold text-lg">
                {quantity}
              </div>
              <button
                onClick={increaseQty}
                className="px-4 text-lg font-bold"
                type="button"
              >
                +
              </button>
            </div>

            {/* BUTTONS */}
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className={goldBtnBase}
                  style={{ borderColor: GOLD, color: GOLD }}
                  {...(inStock ? goldBtnHandlers : {})}
                >
                  ADD TO CART
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={!inStock}
                  className={goldBtnBase}
                  style={{ borderColor: GOLD, color: GOLD }}
                  {...(inStock ? goldBtnHandlers : {})}
                >
                  BUY NOW
                </button>

                {/* TRY ON FULL WIDTH */}
                <button
                  onClick={onTryOn}
                  disabled={!tryOnEnabled}
                  className={goldBtnBase + " col-span-2"}
                  style={{
                    borderColor: GOLD,
                    color: GOLD,
                    opacity: tryOnEnabled ? 1 : 0.6,
                  }}
                  {...(tryOnEnabled ? goldBtnHandlers : {})}
                >
                  TRY ON
                </button>
              </div>
            </div>
          </div>

          {/* FEATURES */}
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
