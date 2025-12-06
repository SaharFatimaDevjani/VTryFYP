import Category from "../models/Category.js";

export const getCategorys = async (req, res) => {
  const category = await Category.find();
  res.json({ data: category });
};

export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    category
      ? res.json({
          data: category,
        })
      : res.status(404).json({ message: "Category not found" });
  } catch (error) {
    res.status(400).json({ message: "Invalid category ID" });
  }
};

export const createCategory = async (req, res) => {
  const newCategory = new Category(req.body);
  const savedCategory = await newCategory.save();
  res.status(201).json(savedCategory);
};

export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    category
      ? res.json(category)
      : res.status(404).json({ message: "Category not found" });
  } catch (error) {
    res.status(400).json({ message: "Invalid update" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    category
      ? res.json({ message: "Category deleted" })
      : res.status(404).json({ message: "Category not found" });
  } catch (error) {
    res.status(400).json({ message: "Invalid delete" });
  }
};
