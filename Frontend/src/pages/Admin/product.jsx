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

  // form
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const [status, setStatus] = useState("published");
  const [stockQuantity, setStockQuantity] = useState(0);

  // images
  const [imageFiles, setImageFiles] = useState([]); // newly selected files
  const [imageUrls, setImageUrls] = useState([]); // saved cloud urls

  /* 🔒 lock background scroll while modal open */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  const imagePreviews = useMemo(() => {
    if (imageFiles.length) return imageFiles.map((f) => URL.createObjectURL(f));
    return imageUrls;
  }, [imageFiles, imageUrls]);

  // cleanup object urls
  useEffect(() => {
    return () => {
      if (imageFiles.length) {
        imagePreviews.forEach((u) => {
          try {
            URL.revokeObjectURL(u);
          } catch {}
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setBrand("");
    setPrice("");
    setSalePrice("");
    setCategory("");
    setDescription("");
    setStatus("published");
    setStockQuantity(0);
    setImageFiles([]);
    setImageUrls([]);
    setFormError("");
  };

  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  const openEdit = (p) => {
    setFormError("");
    setEditingId(p._id);

    setTitle(p.title || "");
    setBrand(p.brand || "");
    setPrice(p.price ?? "");
    setSalePrice(p.salePrice ?? "");
    setCategory(p.category || "");
    setDescription(p.description || "");

    setStatus(p.status || "published");
    setStockQuantity(Number(p.stockQuantity ?? 0));

    // handle old data too
    const imgs =
      Array.isArray(p.images) && p.images.length
        ? p.images
        : p.image
        ? [p.image]
        : [];

    setImageUrls(imgs);
    setImageFiles([]);
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    resetForm();
  };

  const fetchAll = async () => {
    setLoading(true);
    setPageError("");

    try {
      // ✅ admin list endpoint (all products)
      const prodRes = await apiFetch(`${API_URL}/api/products/admin/list`);
      const prodList = Array.isArray(prodRes?.data) ? prodRes.data : prodRes;
      setProducts(Array.isArray(prodList) ? prodList : []);

      const catRes = await apiFetch(`${API_URL}/api/categories`);
      const catList = Array.isArray(catRes?.data) ? catRes.data : catRes;
      setCategories(Array.isArray(catList) ? catList : []);
    } catch (e) {
      setPageError(e.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validateForm = () => {
    if (!title.trim()) return "Title is required.";
    if (!price || Number(price) <= 0) return "Price must be greater than 0.";
    if (!category) return "Please select a category.";
    if (salePrice && Number(salePrice) >= Number(price))
      return "Sale price must be less than price.";
    if (Number(stockQuantity) < 0) return "Stock cannot be negative.";
    return "";
  };

  // ✅ upload selected images automatically on submit
  const uploadImagesIfNeeded = async () => {
    // no new files, keep current urls
    if (!imageFiles.length) return imageUrls;

    const fd = new FormData();
    imageFiles.forEach((f) => fd.append("images", f)); // MUST match backend uploadRoutes

    // ✅ use apiFetch so token automatically goes
    const data = await apiFetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: fd,
    });

    const urls = Array.isArray(data.urls) ? data.urls : [];
    if (!urls.length) throw new Error("Upload failed: no URLs returned.");
    return urls;
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
      // ✅ 1) upload to cloudinary if files selected
      const urlsToSave = await uploadImagesIfNeeded();

      // ✅ 2) then save product in DB
      const payload = {
        title: title.trim(),
        brand: brand.trim(),
        price: Number(price),
        salePrice: salePrice === "" ? null : Number(salePrice),
        category,
        description: description.trim(),
        status,
        stockQuantity: Number(stockQuantity),
        images: urlsToSave,
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
      await fetchAll();
    } catch (err) {
      setFormError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Delete this product? This cannot be undone.");
    if (!ok) return;

    try {
      await apiFetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
      await fetchAll();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  const firstImage = (p) => {
    if (Array.isArray(p?.images) && p.images.length) return p.images[0];
    if (p?.image) return p.image;
    return "";
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Products</h2>
        <button
          onClick={openCreate}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          + Add Product
        </button>
      </div>

      {pageError && (
        <div className="mb-3 text-red-600 text-sm">{pageError}</div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">Image</th>
              <th className="p-2">Title</th>
              <th className="p-2">Price</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Status</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const img = firstImage(p);
              return (
                <tr key={p._id} className="border-b">
                  <td className="p-2">
                    {img ? (
                      <img
                        src={img}
                        className="w-12 h-12 object-cover rounded"
                        alt={p.title}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded" />
                    )}
                  </td>
                  <td className="p-2">{p.title}</td>
                  <td className="p-2">{p.price}</td>
                  <td className="p-2">
                    {Number(p.stockQuantity) === 0 ? "Out" : p.stockQuantity}
                  </td>
                  <td className="p-2">{p.status || "published"}</td>
                  <td className="p-2">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="px-3 py-1 bg-gray-800 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* ================= MODAL (SCROLL FIXED) ================= */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4">
          <div className="mx-auto w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between">
              <h3 className="font-semibold">
                {editingId ? "Edit Product" : "Add Product"}
              </h3>
              <button onClick={closeModal}>✕</button>
            </div>

            <div className="p-4 overflow-y-auto">
              {formError && (
                <div className="mb-3 text-red-600 text-sm">{formError}</div>
              )}

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Title</label>
                    <input
                      className="w-full mt-1 border p-2 rounded"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Brand</label>
                    <input
                      className="w-full mt-1 border p-2 rounded"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Price</label>
                    <input
                      type="number"
                      className="w-full mt-1 border p-2 rounded"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Sale Price</label>
                    <input
                      type="number"
                      className="w-full mt-1 border p-2 rounded"
                      placeholder="Optional"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Stock Quantity</label>
                    <input
                      type="number"
                      className="w-full mt-1 border p-2 rounded"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select
                      className="w-full mt-1 border p-2 rounded"
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                      className="w-full mt-1 border p-2 rounded"
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
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className="w-full mt-1 border p-2 rounded min-h-[90px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Images - no upload button, auto upload on save */}
                <div className="border p-3 rounded">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div>
                      <div className="font-medium text-sm">Images</div>
                      <div className="text-xs text-gray-500">
                        Select images. When you click Create/Update, they will
                        upload automatically.
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Saved images: <b>{imageUrls.length}</b>
                      </div>
                    </div>

                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) =>
                        setImageFiles(Array.from(e.target.files || []))
                      }
                    />
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                      {imagePreviews.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          className="h-20 w-full object-cover rounded"
                          alt={`preview-${i}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
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
