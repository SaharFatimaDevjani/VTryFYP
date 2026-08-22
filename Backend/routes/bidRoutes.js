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

router.get("/", getBids);

// grouped/table view, used by the admin bids table
router.get("/grouped", getBidsGroupedByProduct);

router.get("/product/:product", getBidsByProduct);

router.get("/top-bidders", getTopBidders);

// this is the older by-id route, left it in so nothing that already
// depends on it breaks
router.get("/:productId", getBidsByProductId);

// need to be logged in to actually place a bid or wishlist something
router.post("/wishlist", protect, createWishlist);
router.post("/", protect, createBid);

export default router;
