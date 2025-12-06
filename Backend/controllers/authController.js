import User from "../models/User.js";
import jwt from "jsonwebtoken";

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const registerUser = async (req, res) => {
  const { first_name, last_name, dob, gender, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({
    first_name,
    last_name,
    dob,
    gender,
    email,
    password,
  });
  const token = generateToken(user._id);
  res.status(201).json({ user, token });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    const token = generateToken(user._id);
    res.json({ user, token });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};
