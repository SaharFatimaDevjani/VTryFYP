import express from "express";
import {
  getProducts,
  getAdminProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategoryCounters,
} from "../controllers/productController.js";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * ✅ IMPORTANT:
 * /admin/list MUST be above "/:id"
 * otherwise "/:id" will catch "/admin/list"
 */

// ✅ Admin list (all products) - Admin only
router.get("/admin/list", protect, adminOnly, getAdminProducts);

// ✅ Public routes
router.get("/", getProducts);
router.get("/counters", getCategoryCounters);
router.get("/:id", getProductById);

// ✅ Admin-only CRUD routes
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
