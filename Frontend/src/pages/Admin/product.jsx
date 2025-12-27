import React from "react";

export default function Products() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Products</h2>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          onClick={() => alert("Later: open Add Product modal")}
        >
          + Add Product
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-gray-600">
          No products loaded yet.
        </p>
        <p className="text-gray-500 text-sm mt-1">
          Next step: we will fetch products from your API and show them here.
        </p>
      </div>
    </div>
  );
}
