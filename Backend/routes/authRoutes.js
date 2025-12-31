import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  changePassword,
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// forgot/reset (users only)
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// change password (logged in users only)
router.put("/change-password", protect, changePassword);

export default router;
