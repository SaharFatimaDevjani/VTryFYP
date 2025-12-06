// src/pages/Products.js
import React, { useState } from "react";

function Products() {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "iPhone 15",
      price: 250000,
      image: "https://via.placeholder.com/100",
    },
    {
      id: 2,
      name: "Samsung Galaxy S24",
      price: 200000,
      image: "https://via.placeholder.com/100",
    },
  ]);

  const [formData, setFormData] = useState({ name: "", price: "", image: "" });
  const [preview, setPreview] = useState(null);
  const [editId, setEditId] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  // Open Modal
  const openModal = () => {
    setIsOpen(true);
    setFormData({ name: "", price: "", image: "" });
    setPreview(null);
    setEditId(null);
  };

  // Close Modal
  const closeModal = () => {
    setIsOpen(false);
  };

  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle image input
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setPreview(imgURL);
      setFormData({ ...formData, image: imgURL });
    }
  };

  // Add or Update Product
  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      setProducts(
        products.map((product) =>
          product.id === editId
            ? {
                ...product,
                name: formData.name,
                price: Number(formData.price),
                image: formData.image || product.image,
              }
            : product
        )
      );
    } else {
      const newProduct = {
        id: Date.now(),
        name: formData.name,
        price: Number(formData.price),
        image: formData.image || "https://via.placeholder.com/100",
      };
      setProducts([...products, newProduct]);
    }
    closeModal();
  };

  // Edit product
  const handleEdit = (product) => {
    setIsOpen(true);
    setEditId(product.id);
    setFormData({
      name: product.name,
      price: product.price,
      image: product.image,
    });
    setPreview(product.image);
  };

  // Delete product
  const handleDelete = (id) => {
    setProducts(products.filter((product) => product.id !== id));
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-center mb-6">Products</h2>

      {/* Add Product Button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={openModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg shadow"
        >
          + Add Product
        </button>
      </div>

      {/* Product List */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-700">
          Product List
        </h3>

        {products.length > 0 ? (
          <div className="grid gap-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between border p-4 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center space-x-4">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-16 h-16 object-cover rounded-lg border"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">
                      {product.name}
                    </p>
                    <p className="text-gray-600">Rs. {product.price}</p>
                  </div>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No products available.</p>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">
              {editId ? "Edit Product" : "Add Product"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Product Name"
                value={formData.name}
                onChange={handleChange}
                className="border p-3 w-full rounded-lg"
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                className="border p-3 w-full rounded-lg"
                required
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="border p-2 w-full rounded-lg"
              />

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg shadow-md mt-2"
                />
              )}

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg w-full"
              >
                {editId ? "Update Product" : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Products;
