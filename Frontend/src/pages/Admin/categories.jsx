import React, { useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function getAuthToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

function Categories() {
  const token = useMemo(() => getAuthToken(), []);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // modal/form state
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit"
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEditingId(null);
  };

  const openCreate = () => {
    setError("");
    setMode("create");
    resetForm();
    setIsOpen(true);
  };

  const openEdit = (cat) => {
    setError("");
    setMode("edit");
    setEditingId(cat._id);
    setTitle(cat.title || "");
    setDescription(cat.description || "");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setMode("create");
    resetForm();
  };

  const fetchCategories = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/categories`);
      const data = await res.json().catch(() => ({}));

      // your controller returns { data: [...] }
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setItems(list);
    } catch (e) {
      setError(e.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this category?")) return;

    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/categories/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Delete failed");

      // update UI
      setItems((prev) => prev.filter((x) => x._id !== id));
    } catch (e) {
      setError(e.message || "Delete failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    setSaving(true);
    try {
      const isEdit = mode === "edit";
      const url = isEdit
        ? `${API_URL}/api/categories/${editingId}`
        : `${API_URL}/api/categories`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Save failed");

      // Backend responses:
      // - POST returns savedCategory (object)
      // - PUT returns updated category (object)
      const saved = data?.data ? data.data : data;

      if (isEdit) {
        setItems((prev) => prev.map((x) => (x._id === editingId ? saved : x)));
      } else {
        setItems((prev) => [saved, ...prev]);
      }

      closeModal();
    } catch (e) {
      setError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Categories</h2>
          <p className="text-sm text-gray-600">Manage categories (Admin only)</p>
        </div>

        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700"
        >
          + Add Category
        </button>
      </div>

      {/* Errors */}
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow border">
        {loading ? (
          <div className="p-6 text-gray-600">Loading categories...</div>
        ) : items.length === 0 ? (
          <div className="p-6 text-gray-600">No categories found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Title</th>
                  <th className="text-left px-4 py-3 font-semibold">Description</th>
                  <th className="text-right px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((cat) => (
                  <tr key={cat._id} className="border-t">
                    <td className="px-4 py-3 font-medium">{cat.title}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {cat.description || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          disabled={saving}
                          onClick={() => openEdit(cat)}
                          className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          disabled={saving}
                          onClick={() => handleDelete(cat._id)}
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <h3 className="font-bold text-lg">
                {mode === "edit" ? "Edit Category" : "Add Category"}
              </h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="e.g. Rings"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  disabled={saving}
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : mode === "edit" ? "Update" : "Create"}
                </button>
              </div>

              {!token && (
                <p className="text-xs text-red-600">
                  No token found. Login as admin first.
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Categories;
