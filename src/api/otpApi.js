// src/api/otpApi.js
import axios from "axios";

// Send OTP
export const sendOtp = async (mobileNumber) => {
  const response = await axios.post(
    "/api/send-otp",
    { mobileNumber },
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};

// Verify OTP
export const verifyOtp = async (sessionId, otp) => {
  // ✅ corrected field
  const response = await axios.post(
    "/api/verify-otp",
    { sessionId, otp }, // ✅ send "otp", not "otpCode"
    {
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
  return response.data;
};
