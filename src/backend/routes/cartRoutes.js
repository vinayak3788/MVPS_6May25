// src/backend/routes/cartRoutes.js

import express from "express";
import { runQuery } from "../db.js";

const router = express.Router();

// Ensure carts table exists
const initCartTable = async () => {
  await runQuery(`
    CREATE TABLE IF NOT EXISTS carts (
      id SERIAL PRIMARY KEY,
      userEmail TEXT NOT NULL,
      type TEXT NOT NULL,        -- 'print' or 'stationery'
      itemId TEXT NOT NULL,      -- file name or stationery product ID
      details JSON,              -- any extra JSON details
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
};

// 🛒 Add to cart
router.post("/cart/add", async (req, res) => {
  const { userEmail, type, itemId, details } = req.body;
  if (!userEmail || !type || !itemId) {
    return res.status(400).json({ error: "Missing fields" });
  }
  try {
    await initCartTable();
    await runQuery(
      `INSERT INTO carts (userEmail, type, itemId, details)
       VALUES ($1, $2, $3, $4)`,
      [userEmail, type, itemId, JSON.stringify(details)],
    );
    res.json({ message: "Added to cart" });
  } catch (err) {
    console.error("❌ Failed to add to cart:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// 🧾 Fetch cart for a user
router.get("/cart", async (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: "Email required" });

  try {
    await initCartTable();
    const items = await runQuery(`SELECT * FROM carts WHERE userEmail = $1`, [
      email,
    ]);
    res.json({ items });
  } catch (err) {
    console.error("❌ Failed to get cart:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// 🧹 Clear entire cart for a user
router.post("/cart/clear", async (req, res) => {
  const { userEmail } = req.body;
  if (!userEmail) return res.status(400).json({ error: "Email required" });

  try {
    await initCartTable();
    await runQuery(`DELETE FROM carts WHERE userEmail = $1`, [userEmail]);
    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error("❌ Failed to clear cart:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

// 🗑️ Remove a single item
router.post("/cart/remove", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: "Item ID required" });

  try {
    await initCartTable();
    await runQuery(`DELETE FROM carts WHERE id = $1`, [id]);
    res.json({ message: "Removed from cart" });
  } catch (err) {
    console.error("❌ Failed to remove item:", err);
    res.status(500).json({ error: "Internal error" });
  }
});

export default router;
