import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { transporter } from "../config/email.js";

// helper: generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ✅ Register User (creates normal user by default)
export const registerUser = async (req, res) => {
  try {
    const { first_name, last_name, dob, gender, email, password, isAdmin } = req.body;

    // required checks (match your schema requirements)
    if (!first_name || !last_name || !dob || !gender || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(400).json({ message: "Email already exists." });

    // IMPORTANT SECURITY NOTE:
    // Never allow random people to create admins from the public register endpoint.
    // We'll force isAdmin to false, unless you are seeding from backend manually.
    const user = await User.create({
      first_name,
      last_name,
      dob,
      gender,
      email: email.toLowerCase(),
      password,
      isAdmin: false, // force false for public signup
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        dob: user.dob,
        gender: user.gender,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (err) {
    console.error("registerUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Login (works for BOTH user + admin)
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required." });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);

    return res.json({
      user: {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        dob: user.dob,
        gender: user.gender,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (err) {
    console.error("loginUser error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ USER ONLY: Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });

    // Security: don't reveal if email exists
    if (!user) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    // ✅ Block admin reset via email
    if (user.isAdmin) {
      return res.status(403).json({
        message: "Admin password cannot be reset here. Contact another admin.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: "no-reply@vtryfyp.com",
      to: user.email,
      subject: "Reset your password",
      html: `
        <h3>Password Reset</h3>
        <p>You requested a password reset.</p>
        <p><b>This link expires in 15 minutes.</b></p>
        <p>Click here: <a href="${resetLink}">${resetLink}</a></p>
        <p>If you did not request this, ignore this email.</p>
      `,
    });

    return res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("forgotPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ USER ONLY: Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token." });

    if (user.isAdmin) {
      return res.status(403).json({ message: "Admin password cannot be reset here." });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.json({ message: "Password reset successful. You can now login." });
  } catch (err) {
    console.error("resetPassword error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
