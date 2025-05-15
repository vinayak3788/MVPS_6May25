import dotenv from "dotenv";
import path from "path";
import express from "express";
import cors from "cors";

import stationeryRoutes from "./routes/stationeryRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

import { initDb } from "./db.js";

// Load environment variables
dotenv.config();

// Initialize the database (inside an IIFE so we avoid top-level await)
(async () => {
  try {
    await initDb();
    console.log("✅ Database initialized");
  } catch (err) {
    console.error("❌ Failed to initialize database:", err);
    process.exit(1);
  }
})();

const app = express();

// Standard middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── MOUNT YOUR ROUTES UNDER /api ───────────────────────────────────────────
app.use("/api/stationery", stationeryRoutes);
app.use("/api/users", userRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/orders", orderRoutes);

// Health-check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// Static file serving for built SPA and uploads
const distPath = path.resolve(process.cwd(), "dist");
const uploadDir = path.resolve(process.cwd(), "data/uploads");
app.use(express.static(distPath));
app.use("/uploads", express.static(uploadDir));

// ─── Content Security Policy Header ─────────────────────────────────────────
// Allow Google Auth, Firebase APIs, blob URLs for PDF preview, and HTTPS images
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://apis.google.com",
      "script-src-elem 'self' 'unsafe-inline' https://apis.google.com",
      "connect-src 'self' https://www.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com",
      "frame-src 'self' blob: https://apis.google.com https://*.firebaseapp.com",
      "object-src 'self' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://mvps-print-orders-s3.s3.ap-south-1.amazonaws.com",
    ].join("; "),
  );
  next();
});

// Serve SPA for non-API routes
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads")) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"));
});

// Start the HTTP server when not in Lambda
if (!process.env.LAMBDA_TASK_ROOT) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Server listening on 0.0.0.0:${PORT}`),
  );
}

export default app;
