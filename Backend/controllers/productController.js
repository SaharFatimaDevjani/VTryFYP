import Product from "../models/Product.js";

// ✅ Public: Published products only
export const getProducts = async (req, res) => {
  try {
    const { category, inStock, search } = req.query;

    const query = { status: "published" };

    if (category && category !== "all") {
      query.category = category;
    }

    // optional: inStock=true
    if (inStock === "true") {
      query.stockQuantity = { $gt: 0 };
    }

    // optional: search by title
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || String(error),
    });
  }
};

// ✅ Admin: All products (draft + published)
export const getAdminProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || String(error),
    });
  }
};

// ✅ Get product by ID (public)
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || String(error),
    });
  }
};

// ✅ Create product (admin)
export const createProduct = async (req, res) => {
  try {
    const {
      title,
      images = [],
      description = "",
      brand = "",
      category = "",
      price,
      salePrice = null,
      stockQuantity = 0,
      status = "published",

      // ✅ NEW: tryOn support (optional)
      tryOn = { type: "glasses", overlayUrl: "" },
    } = req.body;

    if (!title || price === undefined || price === null) {
      return res.status(400).json({
        success: false,
        message: "Title and price are required",
      });
    }

    const product = await Product.create({
      title,
      images,
      description,
      brand,
      category,
      price,
      salePrice,
      stockQuantity,
      status,

      // ✅ save tryOn
      tryOn,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || String(error),
    });
  }
};

// ✅ Update product (admin)
export const updateProduct = async (req, res) => {
  try {
    const {
      title,
      images,
      description,
      brand,
      category,
      price,
      salePrice,
      stockQuantity,
      status,

      // ✅ NEW: tryOn support (optional)
      tryOn,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    // update only provided fields
    if (title !== undefined) product.title = title;
    if (images !== undefined) product.images = images;
    if (description !== undefined) product.description = description;
    if (brand !== undefined) product.brand = brand;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (salePrice !== undefined) product.salePrice = salePrice;
    if (stockQuantity !== undefined) product.stockQuantity = stockQuantity;
    if (status !== undefined) product.status = status;

    // ✅ set tryOn only if provided
    if (tryOn !== undefined) product.tryOn = tryOn;

    const updated = await product.save();
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || String(error),
    });
  }
};

// ✅ Delete product (admin)
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    await product.deleteOne();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || String(error),
    });
  }
};

// ✅ Category counters (published only)
export const getCategoryCounters = async (req, res) => {
  try {
    const counters = await Product.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { _id: 0, category: "$_id", count: 1 } },
    ]);

    res.json({ success: true, data: counters });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error?.message || String(error),
    });
  }
};
