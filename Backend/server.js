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
  ? process.env.CORS_ORIGIN.split(",")
  : [
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

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use("/uploads", express.static("uploads"));

// Swagger UI
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve a simple landing page from /public (shows link to /api-docs)
app.use(express.static("public"));

// Health endpoint used by the landing page
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

const upload = multer({ dest: "uploads/" });

// Ensure upload directory exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

app.post("/api/upload", upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const newPath = path.join("uploads", req.file.originalname);
    fs.renameSync(req.file.path, newPath);

    res.json({
      message: "File uploaded successfully",
      path: `/uploads/${req.file.originalname}`,
    });
  } catch (error) {
    console.error("Upload error:", error);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      error: "File processing failed",
      details: error.message,
    });
  }
});

// Root is served by `public/index.html` (see `public/index.html`)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
