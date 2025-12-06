// File: models/Wishlist.js

import mongoose from "mongoose";

const wishlistSchema = new mongoose.Schema(
  {
    email: { type: String, required: true },
    product: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
export default Wishlist;
