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

const router = express.Router();

/**
 * ✅ IMPORTANT:
 * /admin/list MUST be above "/:id"
 * otherwise "/:id" will catch "/admin/list"
 */

// ✅ Admin list (all products) - Protected
router.get("/admin/list", protect, getAdminProducts);

// ✅ Public routes
router.get("/", getProducts);
router.get("/counters", getCategoryCounters);
router.get("/:id", getProductById);

// ✅ Protected CRUD routes
router.post("/", protect, createProduct);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
