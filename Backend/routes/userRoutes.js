import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route
router.get("/", getUsers);
router.get("/:id", getUserById);

// Protected routes (only logged-in users)
router.post("/", protect, createUser);
router.put("/:id", protect, updateUser);
router.delete("/:id", protect, deleteUser);

export default router;
