import React from "react";

export default function Users() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Users</h2>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-gray-600">No users loaded yet.</p>
        <p className="text-gray-500 text-sm mt-1">
          Next step: we will fetch users from your API and show them here.
        </p>
      </div>
    </div>
  );
}
