import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { apiFetch, getStoredAuth } from "../../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const GOLD = "#E1C16E";
const formatPKR = (n) => `Rs ${Number(n || 0).toLocaleString("en-PK")}`;

export default function Checkout() {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const { token, user } = getStoredAuth();

  const isLoggedIn = Boolean(token && user?._id);

  const initialFullName = isLoggedIn
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim()
    : "";
  const initialEmail = isLoggedIn ? user.email || "" : "";
  const initialPhone = isLoggedIn ? user.phone || "" : "";

  const [fullName, setFullName] = useState(initialFullName);
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState(initialPhone);

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Pakistan");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const orderItems = useMemo(() => {
    return items.map((it) => ({
      product: it._id,
      qty: Number(it.qty || 1),
    }));
  }, [items]);

  const goldOutlineHover = {
    borderColor: GOLD,
    color: GOLD,
    backgroundColor: "transparent",
  };

  const handleEnter = (e) => {
    e.currentTarget.style.backgroundColor = GOLD;
    e.currentTarget.style.color = "#fff";
  };

  const handleLeave = (e) => {
    e.currentTarget.style.backgroundColor = "transparent";
    e.currentTarget.style.color = GOLD;
  };

  const validate = () => {
    if (!items.length) return "Cart is empty.";

    if (!isLoggedIn) {
      if (!fullName || !email || !phone)
        return "Guest: full name, email, phone are required.";
    } else {
      if (!phone) return "Phone is required for delivery.";
    }

    if (!address || !city || !country)
      return "Shipping address fields are required.";

    return "";
  };

  const placeOrder = async () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setError("");
    setLoading(true);

    try {
      const payload = {
        items: orderItems,
        paymentMethod: "COD",
        shippingAddress: {
          fullName: fullName || initialFullName,
          phone,
          address,
          city,
          postalCode,
          country,
        },
      };

      let created;

      if (isLoggedIn) {
        created = await apiFetch(`${API_URL}/api/orders`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        created = await apiFetch(`${API_URL}/api/orders/guest`, {
          method: "POST",
          body: JSON.stringify({
            ...payload,
            guest: { fullName, email, phone },
          }),
        });
      }

      clearCart();

      if (isLoggedIn) {
        navigate("/profile");
      } else {
        alert(`Order placed successfully! Order ID: ${created._id}`);
        navigate("/shop");
      }
    } catch (e) {
      setError(e.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="bg-white border rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-semibold">Your cart is empty</h2>
          <p className="text-gray-600 mt-2">Add products before checkout.</p>

          <Link
            to="/shop"
            className="inline-block mt-6 px-8 py-3 rounded-xl font-semibold border transition"
            style={goldOutlineHover}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="text-gray-600 mt-1">
        {isLoggedIn
          ? "You are logged in. Confirm delivery details."
          : "Guest checkout (or login/signup)."}
      </p>

      {!isLoggedIn && (
        <div className="mt-4 p-4 border rounded-2xl bg-gray-50">
          <div className="text-sm text-gray-700">
            Want faster checkout?{" "}
            <Link className="font-semibold underline" to="/login">
              Login
            </Link>{" "}
            or{" "}
            <Link className="font-semibold underline" to="/signup">
              Sign up
            </Link>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6">
          <h2 className="text-xl font-semibold">Delivery Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
            <div>
              <label className="text-sm text-gray-700">Full Name *</label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full border rounded-xl px-4 py-2 outline-none focus:border-black"
                placeholder="Your name"
                disabled={isLoggedIn && Boolean(initialFullName)}
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Email *</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border rounded-xl px-4 py-2 outline-none focus:border-black"
                placeholder="you@email.com"
                disabled={isLoggedIn}
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Phone *</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full border rounded-xl px-4 py-2 outline-none focus:border-black"
                placeholder="03xx-xxxxxxx"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">City *</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="mt-1 w-full border rounded-xl px-4 py-2 outline-none focus:border-black"
                placeholder="Karachi"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm text-gray-700">Address *</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full border rounded-xl px-4 py-2 outline-none focus:border-black"
                placeholder="House/Street/Area"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Postal Code</label>
              <input
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="mt-1 w-full border rounded-xl px-4 py-2 outline-none focus:border-black"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="text-sm text-gray-700">Country *</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 w-full border rounded-xl px-4 py-2 outline-none focus:border-black"
                placeholder="Pakistan"
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border rounded-2xl p-6">
          <h2 className="text-xl font-semibold">Order Summary</h2>

          <div className="mt-4 space-y-3 text-sm">
            {items.map((it) => (
              <div key={it._id} className="flex justify-between">
                <span className="text-gray-700">
                  {it.title} × {it.qty}
                </span>
                <span className="font-semibold">
                  {formatPKR(Number(it.unitPrice) * Number(it.qty || 1))}
                </span>
              </div>
            ))}

            <div className="border-t pt-3 mt-3 flex justify-between">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-semibold">{formatPKR(subtotal)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Delivery</span>
              <span>COD</span>
            </div>

            <div className="border-t pt-3 flex justify-between text-base">
              <span className="font-bold">Total</span>
              <span className="font-bold">{formatPKR(subtotal)}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={loading}
            className="mt-6 w-full px-6 py-3 rounded-xl font-semibold border transition disabled:opacity-60"
            style={goldOutlineHover}
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            {loading ? "Placing Order..." : "Place Order (COD)"}
          </button>

          <Link
            to="/shop"
            className="block text-center mt-3 text-sm font-semibold"
            style={{ color: GOLD }}
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
