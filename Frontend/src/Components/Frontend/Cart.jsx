import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const formatPKR = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

export default function Cart() {
  const { items, subtotal, updateQty, removeFromCart, clearCart } = useCart();

  if (!items.length) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white border rounded-2xl p-8 text-center shadow-sm">
          <h2 className="text-2xl font-semibold">Your cart is empty</h2>
          <p className="text-gray-600 mt-2">Add some products to continue.</p>
          <Link
            to="/"
            className="inline-block mt-6 px-6 py-3 rounded-xl border border-black hover:bg-black hover:text-white transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex items-start justify-between gap-4 mb-6">
        <h1 className="text-3xl font-serif font-semibold">Shopping Cart</h1>
        <button
          onClick={clearCart}
          className="px-4 py-2 rounded-xl border hover:bg-gray-50"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white border rounded-2xl shadow-sm overflow-hidden">
          {items.map((it) => (
            <div key={it._id} className="p-5 border-b last:border-b-0 flex gap-4">
              <div className="w-24 h-24 rounded-xl bg-gray-50 border overflow-hidden flex items-center justify-center">
                {it.image ? (
                  <img src={it.image} alt={it.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-gray-500">No Image</div>
                )}
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{it.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{formatPKR(it.unitPrice)} each</p>
                    {Number(it.stockQuantity) > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        Stock: {it.stockQuantity}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(it._id)}
                    className="text-sm px-3 py-1 rounded-lg border hover:bg-gray-50"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-xl border overflow-hidden">
                    <button
                      onClick={() => updateQty(it._id, (it.qty || 1) - 1)}
                      className="px-3 py-2 font-bold hover:bg-gray-50"
                    >
                      −
                    </button>
                    <input
                      value={it.qty || 1}
                      onChange={(e) => updateQty(it._id, e.target.value)}
                      className="w-14 text-center outline-none"
                    />
                    <button
                      onClick={() => updateQty(it._id, (it.qty || 1) + 1)}
                      className="px-3 py-2 font-bold hover:bg-gray-50"
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
          ))}
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
              <span className="text-gray-500">Calculated at checkout</span>
            </div>

            <div className="border-t pt-3 mt-3 flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-bold">{formatPKR(subtotal)}</span>
            </div>
          </div>

          <button className="mt-6 w-full px-6 py-3 rounded-xl bg-black text-white hover:opacity-90 transition">
            Proceed to Checkout
          </button>

          <Link to="/" className="block text-center mt-3 text-sm text-gray-600 hover:text-black">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
