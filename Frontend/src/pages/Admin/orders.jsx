import React from "react";

export default function Orders() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Orders</h2>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <p className="text-gray-600">No orders loaded yet.</p>
        <p className="text-sm text-gray-500 mt-1">
          Next step: we will fetch orders from your API and show them here.
        </p>
      </div>
    </div>
  );
}
