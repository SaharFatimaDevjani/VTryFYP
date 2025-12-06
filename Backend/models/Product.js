import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    image: { type: String },
    description: { type: String },
    brand: { type: String },
    category: { type: String },
    price: { type: Number, required: true },
    // countInStock: { type: Number, default: 0 },
    endDate: { type: String },
    endHour: { type: String },
    endMinute: { type: String },
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
