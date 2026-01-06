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
  const [imageUrls, setImageUrls] = useState([]); // saved cloud urls in DB

  // ✅ Try-On (overlay) fields
  const [tryOnType, setTryOnType] = useState("glasses");
  const [overlayUrl, setOverlayUrl] = useState(""); // saved overlay PNG url
  const [overlayFile, setOverlayFile] = useState(null); // newly selected overlay file

  /* lock background scroll while modal open */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  // previews for NEW files only
  const newFilePreviews = useMemo(() => {
    return imageFiles.map((f) => URL.createObjectURL(f));
  }, [imageFiles]);

  // preview for overlay file
  const overlayPreview = useMemo(() => {
    return overlayFile ? URL.createObjectURL(overlayFile) : "";
  }, [overlayFile]);

  // cleanup object urls
  useEffect(() => {
    return () => {
      newFilePreviews.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });

      if (overlayPreview) {
        try {
          URL.revokeObjectURL(overlayPreview);
        } catch {}
      }
    };
  }, [newFilePreviews, overlayPreview]);

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
    setTryOnType("glasses");
    setOverlayUrl("");
    setOverlayFile(null);
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

    // support old + new
    const imgs =
      Array.isArray(p.images) && p.images.length
        ? p.images
        : p.image
        ? [p.image]
        : [];

    setImageUrls(imgs);
    setImageFiles([]);

    // ✅ Try-on existing values (if any)
    setTryOnType(p?.tryOn?.type || "glasses");
    setOverlayUrl(p?.tryOn?.overlayUrl || "");
    setOverlayFile(null);

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

  // ✅ Upload only NEW selected files; keep already-saved urls
  const uploadNewImagesIfAny = async () => {
    if (!imageFiles.length) return [];

    const fd = new FormData();
    imageFiles.forEach((f) => fd.append("images", f));

    const data = await apiFetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: fd,
    });

    const urls = Array.isArray(data.urls) ? data.urls : [];
    if (!urls.length) throw new Error("Upload failed: no URLs returned.");
    return urls;
  };

  // ✅ Upload overlay PNG (single file) if selected
  const uploadOverlayIfAny = async () => {
    if (!overlayFile) return overlayUrl || "";

    const fd = new FormData();
    fd.append("images", overlayFile);

    const data = await apiFetch(`${API_URL}/api/upload`, {
      method: "POST",
      body: fd,
    });

    const urls = Array.isArray(data.urls) ? data.urls : [];
    if (!urls.length) throw new Error("Overlay upload failed: no URL returned.");
    return urls[0];
  };

  const handleRemoveSavedImage = (url) => {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const handleRemoveNewFile = (idx) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
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
      // 1) upload NEW files (if any)
      const newUrls = await uploadNewImagesIfAny();

      // 1b) upload overlay (if selected)
      const finalOverlayUrl = await uploadOverlayIfAny();

      // 2) final images array = remaining saved urls + new uploaded urls
      const finalImages = [...imageUrls, ...newUrls];

      const payload = {
        title: title.trim(),
        brand: brand.trim(),
        price: Number(price),
        salePrice: salePrice === "" ? null : Number(salePrice),
        category,
        description: description.trim(),
        status,
        stockQuantity: Number(stockQuantity),
        images: finalImages,
        tryOn: {
          type: tryOnType,
          overlayUrl: finalOverlayUrl || "",
        },
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
    const ok = window.confirm("Delete this product?");
    if (!ok) return;

    try {
      await apiFetch(`${API_URL}/api/products/${id}`, { method: "DELETE" });
      await fetchAll();
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">Products</h2>
        <button
          className="px-4 py-2 bg-black text-white rounded"
          onClick={openCreate}
        >
          + Add Product
        </button>
      </div>

      {pageError && <div className="mb-3 text-red-600 text-sm">{pageError}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full bg-white rounded shadow text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2">Image</th>
              <th className="p-2">Title</th>
              <th className="p-2">Category</th>
              <th className="p-2">Price</th>
              <th className="p-2">Stock</th>
              <th className="p-2">Status</th>
              <th className="p-2">Try-On</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const first =
                (Array.isArray(p.images) && p.images[0]) ||
                p.image ||
                "https://via.placeholder.com/80x80?text=No+Image";
              const tryOnOk = Boolean(p?.tryOn?.overlayUrl);

              return (
                <tr key={p._id} className="border-b">
                  <td className="p-2">
                    <img
                      src={first}
                      className="h-12 w-12 object-cover rounded border"
                      alt="product"
                    />
                  </td>
                  <td className="p-2">{p.title}</td>
                  <td className="p-2">{p.category}</td>
                  <td className="p-2">{p.price}</td>
                  <td className="p-2">{p.stockQuantity ?? 0}</td>
                  <td className="p-2">{p.status}</td>
                  <td className="p-2">
                    {tryOnOk ? (
                      <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                        Enabled
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded bg-gray-100 text-gray-600 text-xs">
                        Off
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 border rounded"
                        onClick={() => openEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 border rounded text-red-600"
                        onClick={() => handleDelete(p._id)}
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

      {/* MODAL */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 p-4">
          <div className="mx-auto w-full max-w-2xl bg-white rounded-xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">
                {editingId ? "Edit Product" : "Add Product"}
              </div>
              <button className="px-3 py-1 border rounded" onClick={closeModal}>
                X
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 overflow-auto">
              {formError && (
                <div className="mb-3 text-red-600 text-sm">{formError}</div>
              )}

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
                    className="w-full mt-1 border p-2 rounded"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Sale Price</label>
                  <input
                    className="w-full mt-1 border p-2 rounded"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    type="number"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    className="w-full mt-1 border p-2 rounded"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="">Select</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
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
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    className="w-full mt-1 border p-2 rounded"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Stock Quantity</label>
                  <input
                    className="w-full mt-1 border p-2 rounded"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    type="number"
                  />
                </div>
              </div>

              {/* ✅ Virtual Try-On (optional) */}
              <div className="border p-3 rounded mt-4">
                <div className="font-medium text-sm">Virtual Try-On</div>
                <div className="text-xs text-gray-500">
                  Upload a transparent PNG overlay (best for glasses). If empty, TRY ON button will be disabled.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-sm font-medium">Try-On Type</label>
                    <select
                      className="w-full mt-1 border p-2 rounded"
                      value={tryOnType}
                      onChange={(e) => setTryOnType(e.target.value)}
                    >
                      <option value="glasses">Glasses</option>
                      <option value="earring">Earring</option>
                      <option value="necklace">Necklace</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Overlay PNG</label>
                    <input
                      className="w-full mt-1"
                      type="file"
                      accept="image/png,image/*"
                      onChange={(e) => setOverlayFile(e.target.files?.[0] || null)}
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Overlay will upload when you click Create/Update.
                    </div>
                  </div>
                </div>

                {(overlayPreview || overlayUrl) && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold mb-2">Overlay Preview</div>
                    <div className="flex flex-col md:flex-row gap-3 items-start">
                      <img
                        src={overlayPreview || overlayUrl}
                        alt="overlay"
                        className="h-24 w-40 object-contain rounded border bg-gray-50 p-2"
                      />
                      <div className="flex-1">
                        <label className="text-xs font-medium">Overlay URL</label>
                        <input
                          className="w-full mt-1 border p-2 rounded text-xs"
                          value={overlayPreview ? "(will be uploaded on save)" : overlayUrl}
                          readOnly
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setOverlayFile(null);
                              setOverlayUrl("");
                            }}
                            className="px-3 py-2 border rounded text-sm"
                          >
                            Remove Overlay
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ✅ Images section with remove support */}
              <div className="border p-3 rounded mt-4">
                <div className="font-medium text-sm">Images</div>
                <div className="text-xs text-gray-500">
                  You can remove saved images below. New selected images will upload on Create/Update.
                </div>

                {/* Saved images */}
                {imageUrls.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold mb-2">Saved Images</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {imageUrls.map((url) => (
                        <div key={url} className="relative">
                          <img
                            src={url}
                            className="h-20 w-full object-cover rounded border"
                            alt="saved"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSavedImage(url)}
                            className="absolute top-1 right-1 bg-white/90 border rounded px-2 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New selected images */}
                <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div className="text-xs font-semibold">Add More Images</div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
                  />
                </div>

                {newFilePreviews.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-semibold mb-2">
                      New Selected (not uploaded yet)
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {newFilePreviews.map((src, idx) => (
                        <div key={src} className="relative">
                          <img
                            src={src}
                            className="h-20 w-full object-cover rounded border"
                            alt="new"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveNewFile(idx)}
                            className="absolute top-1 right-1 bg-white/90 border rounded px-2 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 mt-4">
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
                  className="px-4 py-2 bg-black text-white rounded"
                >
                  {saving ? "Saving..." : editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
