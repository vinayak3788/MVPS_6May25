// src/backend/routes/otpRoutes.js

import dotenv from "dotenv";
dotenv.config({ path: ".env" });

import express from "express";
import axios from "axios";

const router = express.Router();
const KEY = process.env.TWOFACTOR_API_KEY;

// Send OTP
router.post("/send-otp", async (req, res) => {
  const { mobile } = req.body;
  if (!mobile) return res.status(400).json({ error: "Mobile required" });

  try {
    const { data } = await axios.get(
      `https://2factor.in/API/V1/${KEY}/SMS/${mobile}/AUTOGEN`,
    );
    res.json({ sessionId: data.Details });
  } catch (err) {
    console.error("❌ Failed to send OTP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { sessionId, otp } = req.body;
  if (!sessionId || !otp)
    return res.status(400).json({ error: "sessionId & otp required" });

  try {
    const { data } = await axios.get(
      `https://2factor.in/API/V1/${KEY}/SMS/VERIFY/${sessionId}/${otp}`,
    );
    res.json({ success: data.Details === "OTP Matched" });
  } catch (err) {
    console.error("❌ Failed to verify OTP:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
