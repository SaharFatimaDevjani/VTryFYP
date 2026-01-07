import React, { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../../utils/api";
import $ from "jquery"; // Import jQuery
import "../../../../node_modules/datatables.net-dt/css/dataTables.dataTables.css";
import "../../../node_modules/datatables.net/js/jquery.dataTables.js";


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
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);

  /* lock background scroll while modal open */
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  const newFilePreviews = useMemo(() => {
    return imageFiles.map((f) => URL.createObjectURL(f));
  }, [imageFiles]);

  useEffect(() => {
    return () => {
      newFilePreviews.forEach((u) => {
        try {
          URL.revokeObjectURL(u);
        } catch {}
      });
    };
  }, [newFilePreviews]);

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
  }, []);

  useEffect(() => {
    // Initialize DataTable after products are loaded
    if (products.length > 0) {
      $("#productTable").DataTable();
    }
  }, [products]);

  const validateForm = () => {
    if (!title.trim()) return "Title is required.";
    if (!price || Number(price) <= 0) return "Price must be greater than 0.";
    if (!category) return "Please select a category.";
    if (salePrice && Number(salePrice) >= Number(price))
      return "Sale price must be less than price.";
    if (Number(stockQuantity) < 0) return "Stock cannot be negative.";
    return "";
  };

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

  const removeSavedImage = (url) => {
    setImageUrls((prev) => prev.filter((u) => u !== url));
  };

  const removeNewFileAt = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
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
      const newUrls = await uploadNewImagesIfAny();
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

      {pageError && <div className="mb-3 text-red-600 text-sm">{pageError}</div>}

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table id="productTable" className="w-full bg-white rounded shadow text-sm ">
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
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
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

      {/* MODAL */}
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
              {formError && <div className="mb-3 text-red-600 text-sm">{formError}</div>}

              <form onSubmit={handleSave} className="space-y-4">
                {/* Form inputs here */}
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
