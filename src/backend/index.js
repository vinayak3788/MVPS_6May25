// src/backend/index.js
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import cors from "cors";

import stationeryRoutes from "./routes/stationeryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import { initDB } from "./setupDb.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env vars
dotenv.config();

// Initialize the database
await initDB();

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount API routes under /api
app.use("/api", stationeryRoutes);
app.use("/api", userRoutes);
app.use("/api", otpRoutes);
app.use("/api", orderRoutes);

// Static file serving
const uploadDir = path.resolve(__dirname, "../../data/uploads");
const distPath = path.resolve(__dirname, "../../dist");
app.use(express.static(distPath));
app.use("/uploads", express.static(uploadDir));

// ─── Expanded CSP HEADER ───────────────────────────────────────────────────────
// Allows Google’s auth script, Firebase token & identity APIs, embedded frames, etc.
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://apis.google.com",
      "connect-src 'self' https://www.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "frame-src 'self' https://apis.google.com https://*.firebaseapp.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
    ].join("; "),
  );
  next();
});

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () =>
  console.log(`✅ Express API running at http://localhost:${PORT}`),
);
