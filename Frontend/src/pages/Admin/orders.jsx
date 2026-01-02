import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Orders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  // modal/view
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // status update
  const [statusLoading, setStatusLoading] = useState(false);
  const [newStatus, setNewStatus] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiFetch(`${API_URL}/api/orders`);
      // Your swagger says it returns array, but keep safe:
      const list = Array.isArray(res) ? res : res?.data || [];
      setOrders(list);
    } catch (e) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const openView = (order) => {
    setSelected(order);
    setNewStatus(order?.status || "");
    setOpen(true);
  };

  const closeView = () => {
    setOpen(false);
    setSelected(null);
    setNewStatus("");
  };

  const updateStatus = async () => {
    if (!selected?._id) return;

    setStatusLoading(true);
    try {
      const updated = await apiFetch(`${API_URL}/api/orders/${selected._id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      // replace in list
      setOrders((prev) =>
        prev.map((o) => (o._id === selected._id ? updated : o))
      );
      setSelected(updated);
    } catch (e) {
      alert(e.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    const ok = confirm("Are you sure you want to cancel this order?");
    if (!ok) return;

    try {
      const updated = await apiFetch(`${API_URL}/api/orders/${orderId}/cancel`, {
        method: "POST",
      });

      // replace in list
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? updated : o))
      );

      if (selected?._id === orderId) setSelected(updated);
    } catch (e) {
      alert(e.message || "Failed to cancel order");
    }
  };

  const rows = useMemo(() => orders || [], [orders]);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Orders</h2>

        <button
          className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg"
          onClick={loadOrders}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700">
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
              <th className="py-3 pr-3">Payment</th>
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
                <tr key={o._id} className="border-b last:border-b-0">
                  <td className="py-3 pr-3 font-mono text-xs">
                    {o._id}
                  </td>
                  <td className="py-3 pr-3">
                    <span className="px-2 py-1 rounded-full bg-gray-100">
                      {o.status || "pending"}
                    </span>
                  </td>
                  <td className="py-3 pr-3">{o?.items?.length || 0}</td>
                  <td className="py-3 pr-3">{o.paymentMethod || "-"}</td>
                  <td className="py-3 pr-3">
                    {o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}
                  </td>
                  <td className="py-3 pr-3 text-right space-x-2">
                    <button
                      className="px-3 py-1 rounded bg-gray-900 text-white hover:bg-black"
                      onClick={() => openView(o)}
                    >
                      View
                    </button>

                    <button
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      onClick={() => cancelOrder(o._id)}
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

      {/* ✅ View / Update Status Modal */}
      {open && selected && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-lg overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h3 className="text-lg font-bold">Order Details</h3>
                <p className="text-xs text-gray-500 font-mono">{selected._id}</p>
              </div>

              <button
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200"
                onClick={closeView}
              >
                Close
              </button>
            </div>

            {/* body scroll fix */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                <Info label="Status" value={selected.status || "pending"} />
                <Info label="Payment Method" value={selected.paymentMethod || "-"} />
                <Info
                  label="Created At"
                  value={selected.createdAt ? new Date(selected.createdAt).toLocaleString() : "-"}
                />
                <Info label="Items Count" value={(selected?.items?.length || 0).toString()} />
              </div>

              <div className="mb-5">
                <h4 className="font-semibold mb-2">Items</h4>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-left">
                        <th className="p-3">Title</th>
                        <th className="p-3">Qty</th>
                        <th className="p-3">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selected.items || []).map((it, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="p-3">{it.title || it.product || "-"}</td>
                          <td className="p-3">{it.qty ?? "-"}</td>
                          <td className="p-3">{it.price ?? "-"}</td>
                        </tr>
                      ))}
                      {(selected.items || []).length === 0 && (
                        <tr>
                          <td className="p-3 text-gray-500" colSpan={3}>
                            No items
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Update Status</h4>

                <div className="flex flex-col md:flex-row gap-3">
                  <select
                    className="border rounded-xl px-3 py-2"
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <option value="pending">pending</option>
                    <option value="processing">processing</option>
                    <option value="shipped">shipped</option>
                    <option value="delivered">delivered</option>
                    <option value="cancelled">cancelled</option>
                  </select>

                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl disabled:opacity-60"
                    onClick={updateStatus}
                    disabled={statusLoading}
                  >
                    {statusLoading ? "Updating..." : "Update"}
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-2">
                  (PUT) /api/orders/:id/status — admin only on backend
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
