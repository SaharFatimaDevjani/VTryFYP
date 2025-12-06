import User from "../models/User.js";

export const getUsers = async (req, res) => {
  const user = await User.find();
  res.json({ data: user });
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user
      ? res.json({
          data: user,
        })
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(400).json({ message: "Invalid user ID" });
  }
};

export const createUser = async (req, res) => {
  const { first_name, last_name, dob, gender, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: "User already exists" });

  const newUser = new User(req.body);
  const savedUser = await newUser.save();
  res.status(201).json(savedUser);
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    user ? res.json(user) : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(400).json({ message: "Invalid update" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    user
      ? res.json({ message: "User deleted" })
      : res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(400).json({ message: "Invalid delete" });
  }
};
