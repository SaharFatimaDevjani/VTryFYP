import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";

// Importing routes
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import bidRoutes from "./routes/bidRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// CORS configuration - allow multiple origins
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : [
      "http://localhost:5000",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ✅ Ensure base uploads directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads", { recursive: true });
}

// ✅ Serve uploaded images publicly
app.use("/uploads", express.static("uploads"));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve a simple landing page from /public (shows link to /api-docs)
app.use(express.static("public"));

// Health endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/bids", bidRoutes);
app.use("/api/orders", orderRoutes);

/**
 * ✅ UPLOAD ROUTE (supports folders)
 * Use:
 * POST http://localhost:5000/api/upload?folder=rings
 * form-data:
 *   image: <file>
 *
 * Response:
 *   { path: "/uploads/rings/170....-filename.jpg" }
 */

// ✅ Multer storage with folder support + unique filename
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = (req.query.folder || "general").toString().trim();
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, ""); // safety
    const uploadPath = path.join("uploads", safeFolder);

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`.replace(/\s+/g, "-");
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// ✅ Upload endpoint
app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const folder = (req.query.folder || "general").toString().trim();
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");

    return res.json({
      message: "File uploaded successfully",
      path: `/uploads/${safeFolder}/${req.file.filename}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({
      error: "File processing failed",
      details: error.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
