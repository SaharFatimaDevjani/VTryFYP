import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    dob: { type: String, required: true },
    gender: { type: String, required: true },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // ✅ NEW
    phone: { type: String, trim: true, default: "" },

    password: { type: String, required: true },

    isAdmin: { type: Boolean, default: false },

    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

// hash password if changed
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
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
