import React, { useEffect, useState } from "react";
import { apiFetch, getStoredAuth } from "../../utils/api";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const Eye = ({ open }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="opacity-80">
    {open ? (
      <>
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" strokeWidth="2" />
        <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
      </>
    ) : (
      <>
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.5 10.7a3 3 0 0 0 4.1 4.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M9.9 5.2A10.2 10.2 0 0 1 12 5c6.5 0 10 7 10 7a17.3 17.3 0 0 1-4.2 5.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M6.7 6.7C3.7 9.1 2 12 2 12s3.5 7 10 7c1 0 2-.2 2.9-.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    )}
  </svg>
);

function totalQty(order) {
  return (order?.items || []).reduce((sum, it) => sum + Number(it?.qty || 0), 0);
}

export default function Profile() {
  const { user } = getStoredAuth();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState("");

  // change password
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirmNew, setShowConfirmNew] = useState(false);

  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState("");
  const [pwError, setPwError] = useState("");

  const loadOrders = async () => {
    setLoadingOrders(true);
    setOrdersError("");
    try {
      const data = await apiFetch(`${API_URL}/api/orders`, { method: "GET" });
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setOrdersError(e.message || "Failed to load orders");
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const changePassword = async (e) => {
    e.preventDefault();
    setPwMsg("");
    setPwError("");

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setPwError("All password fields are required.");
      return;
    }

    if (newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPwError("New password and Confirm Password do not match.");
      return;
    }

    setPwLoading(true);
    try {
      const data = await apiFetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      setPwMsg(data?.message || "Password changed successfully");
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      setPwError(err.message || "Failed to change password");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">Profile</h1>
      <p className="text-gray-600 mt-1">
        {user ? `${user.first_name} ${user.last_name} (${user.email})` : "Not logged in"}
      </p>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders */}
        <div className="lg:col-span-2 bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold">My Orders</h2>

          {ordersError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
              {ordersError}
            </div>
          )}

          {loadingOrders ? (
            <p className="mt-4 text-gray-600">Loading...</p>
          ) : orders.length === 0 ? (
            <p className="mt-4 text-gray-600">No orders yet.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 border-b">
                    <th className="py-2 pr-3">Order ID</th>
                    <th className="py-2 pr-3">Status</th>
                    <th className="py-2 pr-3">Items</th>
                    <th className="py-2 pr-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o._id} className="border-b last:border-b-0">
                      <td className="py-2 pr-3 font-mono text-xs">{o._id}</td>
                      <td className="py-2 pr-3">{o.status}</td>
                      <td className="py-2 pr-3">{totalQty(o)}</td>
                      <td className="py-2 pr-3">Rs {Number(o.totalAmount || 0).toLocaleString("en-PK")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Change Password</h2>

          {pwError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 border border-red-200">
              {pwError}
            </div>
          )}

          {pwMsg && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
              {pwMsg}
            </div>
          )}

          <form onSubmit={changePassword} className="mt-4 space-y-4">
            <div>
              <label className="text-sm text-gray-700">Old Password *</label>
              <div className="mt-1 relative">
                <input
                  type={showOld ? "text" : "password"}
                  className="w-full border rounded-xl px-4 py-2 pr-12 outline-none focus:border-black"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowOld((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                >
                  <Eye open={showOld} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700">New Password *</label>
              <div className="mt-1 relative">
                <input
                  type={showNew ? "text" : "password"}
                  className="w-full border rounded-xl px-4 py-2 pr-12 outline-none focus:border-black"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                >
                  <Eye open={showNew} />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-700">Confirm New Password *</label>
              <div className="mt-1 relative">
                <input
                  type={showConfirmNew ? "text" : "password"}
                  className="w-full border rounded-xl px-4 py-2 pr-12 outline-none focus:border-black"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmNew((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-black"
                >
                  <Eye open={showConfirmNew} />
                </button>
              </div>

              {confirmNewPassword.length > 0 && newPassword !== confirmNewPassword && (
                <p className="text-xs text-red-600 mt-2">Passwords do not match.</p>
              )}
            </div>

            <button
              disabled={pwLoading}
              className="w-full px-6 py-3 rounded-xl bg-black text-white hover:opacity-90 disabled:opacity-60"
            >
              {pwLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
