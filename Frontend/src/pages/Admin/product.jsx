// Frontend/src/pages/Admin/product.jsx
import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/api";

export default function Products() {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [editingId, setEditingId] = useState(null);

  // form fields
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  // optional auction fields (because your model shows these)
  const [endDate, setEndDate] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");

  // image upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePath, setImagePath] = useState(""); // saved in DB e.g. /uploads/rings/gold.jpg
  const [uploading, setUploading] = useState(false);

  const imagePreview = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    if (imagePath) return `${API_URL}${imagePath}`;
    return "";
  }, [imageFile, imagePath, API_URL]);

  useEffect(() => {
    // cleanup objectURL
    return () => {
      if (imageFile) URL.revokeObjectURL(imagePreview);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBrand("");
    setPrice("");
    setCategory("");
    setDescription("");
    setEndDate("");
    setEndHour("");
    setEndMinute("");
    setImageFile(null);
    setImagePath("");
    setFormError("");
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (p) => {
    setFormError("");
    setEditingId(p?._id);

    setTitle(p?.title || "");
    setBrand(p?.brand || "");
    setPrice(p?.price ?? "");
    setCategory(p?.category || "");
    setDescription(p?.description || "");

    setEndDate(p?.endDate || "");
    setEndHour(p?.endHour || "");
    setEndMinute(p?.endMinute || "");

    setImageFile(null);
    setImagePath(p?.image || "");
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setFormError("");
    setImageFile(null);
  };

  const fetchAll = async () => {
    setLoading(true);
    setPageError("");
    try {
      // products
      const prodRes = await apiFetch(`${API_URL}/api/products`);
      // your controllers often return { data: [...] }
      const prodList = Array.isArray(prodRes?.data) ? prodRes.data : prodRes;
      setProducts(Array.isArray(prodList) ? prodList : []);

      // categories (public)
      const catRes = await apiFetch(`${API_URL}/api/categories`);
      const catList = Array.isArray(catRes?.data) ? catRes.data : catRes;
      setCategories(Array.isArray(catList) ? catList : []);
    } catch (e) {
      setPageError(e.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadImage = async () => {
    if (!imageFile) {
      setFormError("Please choose an image first.");
      return;
    }

    setUploading(true);
    setFormError("");
    try {
      const fd = new FormData();

      // ✅ IMPORTANT: backend expects field name = "image" (lowercase)
      fd.append("image", imageFile);

      // OPTIONAL: you can add folder query if you updated backend to support it
      // const res = await fetch(`${API_URL}/api/upload?folder=rings`, { method: "POST", body: fd });

      const res = await fetch(`${API_URL}/api/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Upload failed");
      }

      // your backend returns: { message, path: "/uploads/filename.ext" }
      setImagePath(data?.path || "");
    } catch (e) {
      setFormError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) return "Title is required.";
    if (!price || Number(price) <= 0) return "Price must be greater than 0.";
    if (!category) return "Please select a category.";
    // image optional, but recommended:
    // if (!imagePath) return "Upload an image first.";
    return "";
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");

    const v = validateForm();
    if (v) {
      setFormError(v);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        brand: brand.trim(),
        price: Number(price),
        category, // usually category id (string)
        description: description.trim(),
        image: imagePath || "",

        // optional
        endDate: endDate || "",
        endHour: endHour || "",
        endMinute: endMinute || "",
      };

      if (editingId) {
        await apiFetch(`${API_URL}/api/products/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`${API_URL}/api/products`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      closeModal();
      resetForm();
      await fetchAll();
    } catch (e2) {
      setFormError(e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Are you sure you want to delete this product?");
    if (!ok) return;

    try {
      await apiFetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
      await fetchAll();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  const categoryLabel = (catId) => {
    const c = categories.find((x) => x?._id === catId);
    return c ? c.title : catId || "-";
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-bold">Products</h2>

        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          onClick={openCreate}
        >
          + Add Product
        </button>
      </div>

      {pageError && (
        <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700">
          {pageError}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow p-6">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : products.length === 0 ? (
          <>
            <p className="text-gray-600">No products loaded yet.</p>
            <p className="text-gray-500 text-sm mt-1">
              Next step: we will fetch products from your API and show them here.
            </p>
          </>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Image</th>
                  <th className="py-2">Title</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Price</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id} className="border-b last:border-b-0">
                    <td className="py-3">
                      {p.image ? (
                        <img
                          src={`${API_URL}${p.image}`}
                          alt={p.title}
                          className="w-14 h-14 object-cover rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-lg border bg-gray-50 flex items-center justify-center text-gray-400">
                          —
                        </div>
                      )}
                    </td>
                    <td className="py-3 font-medium">{p.title}</td>
                    <td className="py-3">{categoryLabel(p.category)}</td>
                    <td className="py-3">{p.price}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          className="px-3 py-1.5 rounded-lg bg-gray-900 text-white hover:bg-gray-800"
                          onClick={() => openEdit(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-3 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700"
                          onClick={() => handleDelete(p._id)}
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

      {/* ✅ MODAL (FIXED SCROLL) */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto">
          <div className="min-h-screen flex items-start justify-center p-4">
            <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">
                  {editingId ? "Edit Product" : "Add Product"}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              {formError && (
                <div className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-sm font-semibold">Title *</label>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Gold Ring"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold">Brand</label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="Blingg"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold">Price *</label>
                    <input
                      type="number"
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="1200"
                      min="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold">Category *</label>
                  <select
                    className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    If your backend stores category as text (not id), tell me and I’ll adjust.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-semibold">Description</label>
                  <textarea
                    className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Details..."
                    rows={4}
                  />
                </div>

                {/* Optional fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-semibold">End Date</label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">End Hour</label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                      value={endHour}
                      onChange={(e) => setEndHour(e.target.value)}
                      placeholder="18"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">End Minute</label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                      value={endMinute}
                      onChange={(e) => setEndMinute(e.target.value)}
                      placeholder="30"
                    />
                  </div>
                </div>

                {/* Image uploader */}
                <div className="border rounded-2xl p-4">
                  <div className="font-semibold mb-2">Product Image</div>

                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    />

                    <button
                      type="button"
                      onClick={uploadImage}
                      disabled={uploading || !imageFile}
                      className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-60"
                    >
                      {uploading ? "Uploading..." : "Upload Image"}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Upload first, then it saves a path like <b>/uploads/filename.jpg</b> in DB.
                  </p>

                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full max-h-64 object-contain rounded-xl border bg-gray-50"
                      />
                      {imagePath && (
                        <div className="text-xs text-gray-600 mt-1">
                          Saved path: <code>{imagePath}</code>
                        </div>
                      )}
                    </div>
                  )}
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
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {saving ? "Saving..." : editingId ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
