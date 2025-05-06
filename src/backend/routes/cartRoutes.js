// src/backend/routes/cartRoutes.js

import express from "express";
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";

const router = express.Router();

const connectDB = async () => {
  return open({
    filename: path.resolve("data/orders.db"),
    driver: sqlite3.Database,
  });
};

// ✅ Create cart table if not exists
const ensureCartTable = async () => {
  const db = await connectDB();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userEmail TEXT,
      type TEXT, -- 'print' or 'stationery'
      itemId TEXT, -- file name or stationery product ID
      details TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

// 🛒 Add item to cart
router.post("/cart/add", async (req, res) => {
  const { userEmail, type, itemId, details } = req.body;
  if (!userEmail || !type || !itemId) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    await ensureCartTable();
    const db = await connectDB();
    await db.run(
      `INSERT INTO carts (userEmail, type, itemId, details) VALUES (?, ?, ?, ?)`,
      [userEmail, type, itemId, JSON.stringify(details)],
    );
    res.json({ message: "Added to cart" });
  } catch (err) {
    console.error("❌ Failed to add to cart:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// 🧾 Fetch cart for user
router.get("/cart", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    const db = await connectDB();
    const items = await db.all(`SELECT * FROM carts WHERE userEmail = ?`, [
      email,
    ]);
    res.json({ items });
  } catch (err) {
    console.error("❌ Failed to get cart:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// 🗑️ Remove item from cart (optional, for future)
router.post("/cart/remove", async (req, res) => {
  const { id } = req.body;
  try {
    const db = await connectDB();
    await db.run(`DELETE FROM carts WHERE id = ?`, [id]);
    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error("❌ Failed to remove item:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
