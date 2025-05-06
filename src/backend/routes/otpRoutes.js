// src/backend/routes/otpRoutes.js

import dotenv from "dotenv";
dotenv.config({ path: ".env" }); // ✅ Add this at the top

import express from "express";
import axios from "axios";

const router = express.Router();

const TWOFACTOR_API_KEY = process.env.TWOFACTOR_API_KEY;

// 📨 Send OTP
router.post("/send-otp", async (req, res) => {
  const { mobileNumber } = req.body; // ✅ Corrected to expect "mobileNumber"
  if (!mobileNumber || !/^\d{10}$/.test(mobileNumber)) {
    return res
      .status(400)
      .json({ error: "Valid 10-digit mobile number required" });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/+91${mobileNumber}/AUTOGEN`,
    );
    const sessionId = response.data?.Details;
    res.json({ sessionId });
  } catch (err) {
    console.error("❌ Failed to send OTP:", err);
    res.status(500).json({ error: "Failed to send OTP." });
  }
});

// ✅ Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { sessionId, otp } = req.body;
  if (!sessionId || !otp) {
    return res.status(400).json({ error: "Session ID and OTP are required" });
  }

  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/VERIFY/${sessionId}/${otp}`,
    );

    const success = response.data?.Details === "OTP Matched";
    res.json({ success });
  } catch (err) {
    console.error("❌ Failed to verify OTP:", err);
    res.status(500).json({ error: "Failed to verify OTP." });
  }
});

export default router;
