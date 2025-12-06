import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *       required:
 *         - title
 */
