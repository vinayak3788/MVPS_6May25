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

// Load environment variables
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

// Static file serving for built SPA and uploads
const distPath = path.resolve(__dirname, "../../dist");
const uploadDir = path.resolve(__dirname, "../../data/uploads");
app.use(express.static(distPath));
app.use("/uploads", express.static(uploadDir));

// ─── Content Security Policy Header ─────────────────────────────────────────────
// Allow Google Auth, Firebase APIs, blob URLs for PDF preview, and HTTPS images
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://apis.google.com",
      "connect-src 'self' https://www.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "frame-src 'self' blob: https://apis.google.com https://*.firebaseapp.com",
      "object-src 'self' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
    ].join("; "),
  );
  next();
});

// SPA fallback: serve index.html for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// Only start a real HTTP server when running locally
if (!process.env.LAMBDA_TASK_ROOT) {
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () =>
    console.log(`✅ Express API and SPA running at http://localhost:${PORT}`),
  );
}

// Export the app for Lambda
export default app;
