// src/backend/routes/userRoutes.js

import express from "express";
import {
  initDb,
  ensureUserRole,
  updateUserRole,
  getUserRole,
  blockUser,
  unblockUser,
  deleteUser,
  fetchData,
  runQuery,
} from "../db.js";

const router = express.Router();

// ——— GET USER ROLE ———
router.get("/get-role", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    const role = await getUserRole(email);
    res.json({ role });
  } catch (err) {
    console.error("❌ Failed to get user role:", err);
    res.status(500).json({ error: "Could not get user role." });
  }
});

// ——— LIST ALL USERS ———
router.get("/get-users", async (req, res) => {
  try {
    const result = await runQuery(
      `SELECT 
         u.email, u.role, u.blocked,
         p.firstName, p.lastName, p.mobileNumber
       FROM users u
       LEFT JOIN profiles p ON u.email = p.email
       ORDER BY u.email`,
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error("❌ Failed to list users:", err);
    res.status(500).json({ error: "Could not fetch users." });
  }
});

// ——— BLOCK USER ———
router.post("/block-user", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    await blockUser(email);
    res.json({ message: "✅ User blocked successfully." });
  } catch (err) {
    console.error("❌ Failed to block user:", err);
    res.status(500).json({ error: "Failed to block user." });
  }
});

// ——— UNBLOCK USER ———
router.post("/unblock-user", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    await unblockUser(email);
    res.json({ message: "✅ User unblocked successfully." });
  } catch (err) {
    console.error("❌ Failed to unblock user:", err);
    res.status(500).json({ error: "Failed to unblock user." });
  }
});

// ——— DELETE USER ———
router.post("/delete-user", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    await deleteUser(email);
    res.json({ message: "✅ User deleted successfully." });
  } catch (err) {
    console.error("❌ Failed to delete user:", err);
    res.status(500).json({ error: "Failed to delete user." });
  }
});

// ——— CREATE OR UPDATE PROFILE ———
router.post("/update-profile", async (req, res) => {
  const { email, firstName, lastName, mobileNumber } = req.body;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    await runQuery(
      `INSERT INTO profiles (email, firstName, lastName, mobileNumber)
       VALUES ($1,$2,$3,$4)
       ON CONFLICT (email)
       DO UPDATE SET
         firstName=$2, lastName=$3, mobileNumber=$4`,
      [email, firstName || "", lastName || "", mobileNumber || ""],
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to upsert profile:", err);
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// ——— FETCH PROFILE ———
router.get("/get-profile", async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: "Email required" });
  try {
    const profile = await fetchData(
      `SELECT p.*, u.blocked
         FROM profiles p
         JOIN users u ON p.email = u.email
        WHERE p.email = $1`,
      [email],
    );
    res.json(profile || {});
  } catch (err) {
    console.error("❌ Failed to fetch profile:", err);
    res.status(500).json({ error: "Failed to fetch profile." });
  }
});

export default router;
