import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const formatPKR = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

export default function Cart() {
  const navigate = useNavigate();
  const { items, subtotal, updateQty, removeFromCart, clearCart } = useCart();

  if (!items.length) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border rounded-2xl p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold">Your cart is empty</h2>
          <p className="text-gray-600 mt-2">Add some products to continue.</p>

          {/* ✅ go to shop */}
          <Link
            to="/shop"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-black text-white hover:opacity-90 transition"
          >
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Your Cart</h1>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((it) => (
            <div key={it._id} className="bg-white border rounded-2xl p-4 shadow-sm">
              <div className="flex gap-4">
                <img
                  src={it.image}
                  alt={it.title}
                  className="w-24 h-24 rounded-xl object-cover border"
                />

                <div className="flex-1">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{it.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{formatPKR(it.unitPrice)}</p>
                    </div>

                    <button
                      onClick={() => removeFromCart(it._id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        className="w-9 h-9 rounded-xl border hover:bg-gray-50"
                        onClick={() => updateQty(it._id, Math.max(1, Number(it.qty || 1) - 1))}
                      >
                        -
                      </button>

                      <div className="w-12 text-center font-semibold">{it.qty}</div>

                      <button
                        className="w-9 h-9 rounded-xl border hover:bg-gray-50"
                        onClick={() => updateQty(it._id, Number(it.qty || 1) + 1)}
                      >
                        +
                      </button>
                    </div>

                    <div className="font-semibold">
                      {formatPKR(Number(it.unitPrice) * Number(it.qty || 1))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-sm text-red-600 hover:underline"
          >
            Clear Cart
          </button>
        </div>

        {/* Summary */}
        <div className="bg-white border rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>

          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">{formatPKR(subtotal)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Delivery</span>
              <span className="text-gray-500">COD</span>
            </div>

            <div className="border-t pt-3 mt-3 flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{formatPKR(subtotal)}</span>
            </div>
          </div>

          {/* ✅ now goes to /checkout */}
          <button
            onClick={() => navigate("/checkout")}
            className="mt-6 w-full px-6 py-3 rounded-xl bg-black text-white hover:opacity-90 transition"
          >
            Proceed to Checkout
          </button>

          {/* ✅ go to /shop */}
          <Link to="/shop" className="block text-center mt-3 text-sm text-gray-600 hover:text-black">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
