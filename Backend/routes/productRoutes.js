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

// note: /admin/list has to stay above /:id, otherwise express matches
// "admin" as the :id param and this route never gets hit
router.get("/admin/list", protect, adminOnly, getAdminProducts);

// public routes, anyone can browse the shop without logging in
router.get("/", getProducts);
router.get("/counters", getCategoryCounters);
router.get("/:id", getProductById);

// only admins should be able to touch the catalog
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

export default router;
