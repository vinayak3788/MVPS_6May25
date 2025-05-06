// src/backend/routes/stationeryRoutes.js

import express from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import multer from "multer";
import { uploadImageToS3 } from "../../config/s3StationeryUploader.js";

const router = express.Router();

// Multer setup (memory storage for S3 upload)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Connect DB
async function connectDB() {
  return open({
    filename: "./data/orders.db",
    driver: sqlite3.Database,
  });
}

// Admin: Add new product
router.post(
  "/admin/stationery/add",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const db = await connectDB();
      const { name, description, price, discount } = req.body;
      const files = req.files;

      if (!name || !price) {
        return res.status(400).json({ error: "Name and Price are required" });
      }

      const uploadedUrls = [];
      if (files && files.length > 0) {
        for (const file of files) {
          const { s3Url } = await uploadImageToS3(
            file.buffer,
            file.originalname,
          );
          uploadedUrls.push(s3Url);
        }
      }

      const imagesJson = JSON.stringify(uploadedUrls);
      await db.run(
        `INSERT INTO stationery_products (name, description, price, discount, images) VALUES (?, ?, ?, ?, ?)`,
        [
          name,
          description || "",
          parseFloat(price),
          parseFloat(discount) || 0,
          imagesJson,
        ],
      );

      res.status(200).json({ message: "Product added successfully" });
    } catch (error) {
      console.error("❌ Error adding product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Admin: Update product (with support for keeping old + uploading new images)
router.put(
  "/admin/stationery/update/:id",
  upload.array("images", 5),
  async (req, res) => {
    try {
      const db = await connectDB();
      const { name, description, price, discount, existing } = req.body;
      const { id } = req.params;
      const files = req.files;

      if (!name || !price) {
        return res.status(400).json({ error: "Name and Price are required" });
      }

      let imageUrls = [];
      if (existing) {
        imageUrls = JSON.parse(existing);
      }

      if (files && files.length > 0) {
        for (const file of files) {
          const { s3Url } = await uploadImageToS3(
            file.buffer,
            file.originalname,
          );
          imageUrls.push(s3Url);
        }
      }

      const imagesJson = JSON.stringify(imageUrls);

      await db.run(
        `UPDATE stationery_products SET name = ?, description = ?, price = ?, discount = ?, images = ? WHERE id = ?`,
        [
          name,
          description || "",
          parseFloat(price),
          parseFloat(discount) || 0,
          imagesJson,
          id,
        ],
      );

      res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
      console.error("❌ Error updating product:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  },
);

// Admin: Delete product
router.delete("/admin/stationery/delete/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { id } = req.params;

    await db.run(`DELETE FROM stationery_products WHERE id = ?`, id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// User: Get all products
router.get("/stationery/products", async (req, res) => {
  try {
    const db = await connectDB();
    const products = await db.all(
      `SELECT * FROM stationery_products ORDER BY createdAt DESC`,
    );

    const formatted = products.map((p) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
    }));

    res.status(200).json(formatted);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
