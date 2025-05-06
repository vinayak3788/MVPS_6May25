// src/backend/index.js
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import cors from "cors";

import stationeryRoutes from "./routes/stationeryRoutes.js";
import userRoutes from "./routes/userRoutes.js"; // 👈 Import userRoutes early
import otpRoutes from "./routes/otpRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import { initDB } from "./setupDb.js"; // make sure this is correct

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Initialize DB
await initDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all API routes under /api, in the correct order:
app.use("/api", stationeryRoutes);
app.use("/api", userRoutes); // 👈 must come before otp and orders
app.use("/api", otpRoutes);
app.use("/api", orderRoutes);

// Static file serving
const uploadDir = path.resolve(__dirname, "../../data/uploads");
const distPath = path.resolve(__dirname, "../../dist");

app.use(express.static(distPath));
app.use("/uploads", express.static(uploadDir));

// CSP headers (if you need them)
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; img-src 'self' data: https:; " +
      "script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';",
  );
  next();
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`✅ Express API running at http://localhost:${PORT}`),
);
