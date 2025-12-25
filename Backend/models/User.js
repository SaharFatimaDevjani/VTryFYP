import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },

    // ✅ Optional (better UX; prevents signup failures)
    dob: { type: String, required: false, default: "" },
    gender: { type: String, required: false, default: "" },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    // 0: user, 1: super-admin, 2: vendor (you can expand later)
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Password hashing middleware
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});

// Password match method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *         dob:
 *           type: string
 *           description: Optional date of birth (YYYY-MM-DD)
 *         gender:
 *           type: string
 *           description: Optional gender (e.g., male/female)
 *         email:
 *           type: string
 *         isAdmin:
 *           type: boolean
 *       required:
 *         - first_name
 *         - last_name
 *         - email
 *
 *     AuthRequest:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *         password:
 *           type: string
 *       required:
 *         - email
 *         - password
 *
 *     AuthResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/User'
 *         token:
 *           type: string
 */
