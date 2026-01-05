import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function formatDate(dt) {
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return "-";
  }
}

function formatPKR(n) {
  const num = Number(n || 0);
  return `Rs ${num.toLocaleString("en-PK")}`;
}

function totalQty(order) {
  const items = order?.items || [];
  return items.reduce((sum, it) => sum + Number(it?.qty || 0), 0);
}

function lineTotal(item) {
  return Number(item?.qty || 0) * Number(item?.price || 0);
}

function calcItemsTotal(order) {
  return (order?.items || []).reduce((sum, it) => sum + lineTotal(it), 0);
}

function badgeClass(status) {
  const s = (status || "pending").toLowerCase();
  if (s === "delivered") return "bg-emerald-50 border-emerald-200 text-emerald-800";
  if (s === "shipped") return "bg-blue-50 border-blue-200 text-blue-800";
  if (s === "confirmed") return "bg-indigo-50 border-indigo-200 text-indigo-800";
  if (s === "cancelled") return "bg-red-50 border-red-200 text-red-800";
  return "bg-gray-100 border-gray-200 text-gray-800";
}

function CardInfo({ label, children }) {
  return (
    <div className="bg-gray-50 rounded-2xl p-4 border">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="font-semibold text-gray-900 break-words">{children}</div>
    </div>
  );
}

function Lines({ lines }) {
  const clean = (lines || []).filter(Boolean);
  if (!clean.length) return <span className="text-gray-400 font-medium">-</span>;
  return (
    <div className="space-y-1">
      {clean.map((t, i) => (
        <div key={i} className="font-semibold text-gray-900">
          {t}
        </div>
      ))}
    </div>
  );
}

export default function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [statusLoading, setStatusLoading] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch(`${API_URL}/api/orders`, { method: "GET" });
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const rows = useMemo(() => orders || [], [orders]);

  const openView = (o) => {
    setSelected(o);
    setOpen(true);
  };

  const closeView = () => {
    setOpen(false);
    setSelected(null);
  };

  const updateStatus = async (orderId, status) => {
    try {
      setStatusLoading(true);
      const updated = await apiFetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      });

      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      if (selected?._id === orderId) setSelected(updated);
    } catch (e) {
      alert(e.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const updated = await apiFetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
      if (selected?._id === orderId) setSelected(updated);
    } catch (e) {
      alert(e.message || "Failed to cancel order");
    }
  };

  const copyId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      alert("Order ID copied!");
    } catch {
      alert("Copy failed. Please copy manually.");
    }
  };

  const customerLines = (o) => {
    // logged-in customer
    if (o?.user) {
      const name = `${o.user.first_name || ""} ${o.user.last_name || ""}`.trim();
      return [
        name || "User",
        o.user.email || "",
        o.user.phone || "",
      ];
    }

    // guest customer
    if (o?.guest?.email || o?.guest?.phone || o?.guest?.fullName) {
      return [
        o.guest.fullName || "Guest",
        o.guest.email || "",
        o.guest.phone || "",
      ];
    }

    return [];
  };

  const shippingLines = (o) => {
    const s = o?.shippingAddress || {};
    const line1 = [s.address].filter(Boolean).join("");
    const line2 = [s.city, s.postalCode].filter(Boolean).join(" • ");
    const line3 = [s.country].filter(Boolean).join("");
    const line0 = [s.fullName, s.phone].filter(Boolean).join(" • ");

    return [line0, line1, line2, line3].filter(Boolean);
  };

  const canCancel = (o) => {
    const st = (o?.status || "").toLowerCase();
    return st !== "cancelled" && st !== "delivered";
  };

  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Orders</h1>
          <p className="text-sm text-gray-600 mt-1">
            Items = total quantity (sum of qty), not item types.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="px-4 py-2 rounded-xl border bg-white hover:bg-gray-50"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-600 border-b">
              <th className="py-3 pr-3">Order ID</th>
              <th className="py-3 pr-3">Status</th>
              <th className="py-3 pr-3">Items</th>
              <th className="py-3 pr-3">Total</th>
              <th className="py-3 pr-3">Created</th>
              <th className="py-3 pr-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 text-gray-500" colSpan={6}>
                  Loading orders...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td className="py-4 text-gray-500" colSpan={6}>
                  No orders found.
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr key={o._id} className="border-b last:border-b-0 align-top">
                  <td className="py-3 pr-3">
                    <div className="font-mono text-xs">{o._id}</div>
                    <button
                      onClick={() => copyId(o._id)}
                      className="mt-2 text-xs px-3 py-1 rounded-lg border hover:bg-gray-50"
                    >
                      Copy
                    </button>
                  </td>

                  <td className="py-3 pr-3">
                    <span
                      className={`inline-block px-3 py-1 rounded-full border ${badgeClass(
                        o.status
                      )}`}
                    >
                      {o.status || "pending"}
                    </span>
                  </td>

                  <td className="py-3 pr-3">{totalQty(o)}</td>

                  <td className="py-3 pr-3">
                    {formatPKR(o.totalAmount ?? calcItemsTotal(o))}
                  </td>

                  <td className="py-3 pr-3">{formatDate(o.createdAt)}</td>

                  <td className="py-3 pr-3 text-right space-x-2">
                    <button
                      onClick={() => openView(o)}
                      className="px-4 py-2 rounded-xl bg-black text-white hover:opacity-90"
                    >
                      View
                    </button>

                    <button
                      onClick={() => cancelOrder(o._id)}
                      disabled={!canCancel(o)}
                      className={`px-4 py-2 rounded-xl text-white hover:opacity-90 disabled:opacity-50 ${canCancel(o) ? "bg-red-600" : "bg-gray-400"
                        }`}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {open && selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-start justify-between p-5 border-b">
              <div>
                <h3 className="text-lg font-bold">Order Details</h3>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-gray-500 font-mono">{selected._id}</p>
                  <button
                    onClick={() => copyId(selected._id)}
                    className="text-xs px-3 py-1 rounded-lg border hover:bg-gray-50"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <button
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={closeView}
              >
                Close
              </button>
            </div>

            <div className="p-5 max-h-[75vh] overflow-y-auto">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <CardInfo label="Status">
                  <span
                    className={`inline-block px-3 py-1 rounded-full border ${badgeClass(
                      selected.status
                    )}`}
                  >
                    {selected.status || "pending"}
                  </span>
                </CardInfo>
                <CardInfo label="Created At">{formatDate(selected.createdAt)}</CardInfo>
                <CardInfo label="Items (Total Qty)">{String(totalQty(selected))}</CardInfo>
                <CardInfo label="Total">
                  {formatPKR(selected.totalAmount ?? calcItemsTotal(selected))}
                </CardInfo>
              </div>

              {/* Customer + Shipping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <CardInfo label="Customer">
                  <Lines lines={customerLines(selected)} />
                </CardInfo>

                <CardInfo label="Shipping / Delivery">
                  <div className="space-y-2 text-sm">
                    <div className="flex">
                      <span className="w-28 text-gray-500">Full Name</span>
                      <span className="font-semibold text-gray-900">
                        {selected?.shippingAddress?.fullName || "-"}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-gray-500">Phone</span>
                      <span className="font-semibold text-gray-900">
                        {selected?.shippingAddress?.phone || "-"}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-gray-500">Address</span>
                      <span className="font-semibold text-gray-900">
                        {selected?.shippingAddress?.address || "-"}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-gray-500">City</span>
                      <span className="font-semibold text-gray-900">
                        {selected?.shippingAddress?.city || "-"}
                      </span>
                    </div>

                    <div className="flex">
                      <span className="w-28 text-gray-500">Country</span>
                      <span className="font-semibold text-gray-900">
                        {selected?.shippingAddress?.country || "-"}
                      </span>
                    </div>
                  </div>
                </CardInfo>

              </div>

              {/* Items Table */}
              <div className="mb-6">
                <div className="flex items-end justify-between mb-3">
                  <h4 className="font-semibold">Items</h4>
                  <div className="text-sm text-gray-600">
                    Items Total:{" "}
                    <span className="font-semibold text-gray-900">
                      {formatPKR(calcItemsTotal(selected))}
                    </span>
                  </div>
                </div>

                <div className="border rounded-2xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600">
                      <tr>
                        <th className="p-3 text-left">Title</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.items || []).map((it, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3">{it.title || "-"}</td>
                          <td className="p-3 text-center">{it.qty || 0}</td>
                          <td className="p-3 text-right">{formatPKR(it.price || 0)}</td>
                          <td className="p-3 text-right">{formatPKR(lineTotal(it))}</td>
                        </tr>
                      ))}

                      {(selected.items || []).length === 0 && (
                        <tr>
                          <td className="p-3 text-gray-500" colSpan={4}>
                            No items
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-sm text-gray-600">
                    Payment Method:{" "}
                    <span className="font-semibold text-gray-900">
                      {selected.paymentMethod || "-"}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600">
                    Grand Total:{" "}
                    <span className="font-bold text-gray-900">
                      {formatPKR(selected.totalAmount ?? calcItemsTotal(selected))}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status update */}
              <div className="border-t pt-5">
                <h4 className="font-semibold mb-3">Update Status</h4>

                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <select
                    className="border rounded-xl px-3 py-2 w-full md:w-64"
                    value={selected.status || "pending"}
                    onChange={(e) =>
                      setSelected((p) => ({ ...p, status: e.target.value }))
                    }
                    disabled={statusLoading}
                  >
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>

                  <button
                    onClick={() => updateStatus(selected._id, selected.status)}
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:opacity-90 disabled:opacity-60 w-full md:w-auto"
                    disabled={statusLoading}
                  >
                    {statusLoading ? "Updating..." : "Update"}
                  </button>

                  <button
                    onClick={() => cancelOrder(selected._id)}
                    disabled={!canCancel(selected)}
                    className={`px-5 py-2 rounded-xl text-white hover:opacity-90 disabled:opacity-50 w-full md:w-auto ${canCancel(selected) ? "bg-red-600" : "bg-gray-400"
                      }`}
                  >
                    Cancel Order
                  </button>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  Status update uses your backend endpoint: (PUT) /api/orders/:id/status
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
