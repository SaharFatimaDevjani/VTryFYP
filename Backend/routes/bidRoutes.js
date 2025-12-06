import express from "express";
import {
  createBid,
  createWishlist,
  getBids,
  getBidsGroupedByProduct,
  getBidsByProduct,
  getTopBidders,
  getBidsByProductId,
} from "../controllers/bidController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getBids);

// New route for grouped bids by product (table format)
router.get("/grouped", getBidsGroupedByProduct);

// Get bids for specific product
router.get("/product/:product", getBidsByProduct);

// Get top bidders
router.get("/top-bidders", getTopBidders);

// Original route (keeping for backward compatibility)
router.get("/:productId", getBidsByProductId);

// Protected routes (only logged-in users)
router.post("/wishlist", protect, createWishlist);
router.post("/", protect, createBid);

export default router;
