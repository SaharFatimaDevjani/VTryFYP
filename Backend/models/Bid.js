// File: models/Bid.js

import mongoose from "mongoose";

const bidSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    product: { type: String, required: true },
    bidAmount: { type: Number, required: true },
  },
  {
    timestamps: true,
  }
);

const Bid = mongoose.model("Bid", bidSchema);
export default Bid;
