// src/backend/routes/stationeryRoutes.js

import express from "express";
import multer from "multer";
import { runQuery } from "../db.js";
import { uploadImageToS3 } from "../../config/s3StationeryUploader.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Ensure stationery_products table exists
const initStationeryTable = async () => {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS stationery_products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      discount REAL DEFAULT 0,
      images JSON,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

// 🆕 Add a product
router.post(
  "/admin/stationery/add",
  upload.array("images", 5),
  async (req, res) => {
    try {
      await initStationeryTable();
      const { name, description, price, discount } = req.body;
      if (!name || !price)
        return res.status(400).json({ error: "Name and Price are required" });

      // upload to S3
      const files = req.files || [];
      const urls = [];
      for (const f of files) {
        const { s3Url } = await uploadImageToS3(f.buffer, f.originalname);
        urls.push(s3Url);
      }

      await runQuery(
        `INSERT INTO stationery_products
           (name, description, price, discount, images)
         VALUES ($1,$2,$3,$4,$5)`,
        [
          name,
          description || "",
          parseFloat(price),
          parseFloat(discount) || 0,
          JSON.stringify(urls),
        ],
      );

      res.json({ message: "Product added successfully" });
    } catch (err) {
      console.error("❌ Error adding product:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// ✏️ Update a product
router.put(
  "/admin/stationery/update/:id",
  upload.array("images", 5),
  async (req, res) => {
    try {
      await initStationeryTable();
      const { name, description, price, discount, existing } = req.body;
      const { id } = req.params;
      if (!name || !price)
        return res.status(400).json({ error: "Name and Price are required" });

      // parse existing JSON array of URLs
      const images = existing ? JSON.parse(existing) : [];
      for (const f of req.files || []) {
        const { s3Url } = await uploadImageToS3(f.buffer, f.originalname);
        images.push(s3Url);
      }

      await runQuery(
        `UPDATE stationery_products
           SET name=$1, description=$2, price=$3, discount=$4, images=$5
         WHERE id=$6`,
        [
          name,
          description || "",
          parseFloat(price),
          parseFloat(discount) || 0,
          JSON.stringify(images),
          id,
        ],
      );

      res.json({ message: "Product updated successfully" });
    } catch (err) {
      console.error("❌ Error updating product:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// 🗑️ Delete a product
router.delete("/admin/stationery/delete/:id", async (req, res) => {
  try {
    await initStationeryTable();
    const { id } = req.params;
    await runQuery(`DELETE FROM stationery_products WHERE id=$1`, [id]);
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting product:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// 📦 Fetch all products
router.get("/stationery/products", async (req, res) => {
  try {
    await initStationeryTable();
    const rows = await runQuery(
      `SELECT * FROM stationery_products ORDER BY createdAt DESC`,
    );
    // runQuery returns rows array
    const formatted = rows.map((p) => ({
      ...p,
      images: p.images || [],
    }));
    res.json(formatted);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
