import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Store files in memory (NOT local folder)
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", protect, upload.array("images", 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const uploadOne = (file) =>
      new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            { folder: "products", resource_type: "image" },
            (err, result) => {
              if (err) return reject(err);
              resolve(result.secure_url);
            }
          )
          .end(file.buffer);
      });

    const urls = await Promise.all(req.files.map(uploadOne));
    return res.json({ urls });
  } catch (error) {
    return res.status(500).json({
      message: "Upload failed",
      error: error?.message || String(error),
    });
  }
});

export default router;
