// Backend/routes/userRoutes.js
import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Admin-only User management APIs
 */

/**
 * ✅ Admin-only Users CRUD
 * - Admin dashboard should control this
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only
 */
router.get("/", protect, adminOnly, getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User found
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: User not found
 */
router.get("/:id", protect, adminOnly, getUserById);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [first_name,last_name,dob,gender,email,password]
 *             properties:
 *               first_name: { type: string, example: "Test" }
 *               last_name: { type: string, example: "User" }
 *               dob: { type: string, example: "2003-01-01" }
 *               gender: { type: string, example: "female" }
 *               email: { type: string, example: "newuser@example.com" }
 *               password: { type: string, example: "123456" }
 *               isAdmin: { type: boolean, example: false }
 *     responses:
 *       201:
 *         description: User created
 *       400:
 *         description: Validation error / User already exists
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only
 */
router.post("/", protect, adminOnly, createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               dob: { type: string }
 *               gender: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               isAdmin: { type: boolean }
 *     responses:
 *       200:
 *         description: Updated user
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: User not found
 */
router.put("/:id", protect, adminOnly, updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Admin only
 *       404:
 *         description: User not found
 */
router.delete("/:id", protect, adminOnly, deleteUser);

export default router;
