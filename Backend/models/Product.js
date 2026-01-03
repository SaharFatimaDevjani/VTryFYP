import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    // Multiple image URLs (Cloud)
    images: { type: [String], default: [] },

    description: { type: String, default: "" },
    brand: { type: String, default: "" },

    category: { type: String },

    price: { type: Number, required: true },

    // Sale price (optional)
    salePrice: { type: Number, default: null },

    // Stock
    stockQuantity: { type: Number, default: 0 },

    // Draft / Published
    status: { type: String, enum: ["draft", "published"], default: "published" },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;


/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         image:
 *           type: string
 *         description:
 *           type: string
 *         brand:
 *           type: string
 *         category:
 *           type: string
 *         price:
 *           type: number
 *         endDate:
 *           type: string
 *         endHour:
 *           type: string
 *         endMinute:
 *           type: string
 *       required:
 *         - title
 *         - price
 */
