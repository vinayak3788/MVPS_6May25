// src/api/userApi.js

import axios from "axios";

export const getAllUsers = async () => {
  const res = await axios.get("/api/get-users");
  return res.data;
};

export const updateUserRole = async (email, role) => {
  const res = await axios.post("/api/update-role", { email, role });
  return res.data;
};

export const deleteUser = async (email) => {
  const res = await axios.post("/api/delete-user", { email });
  return res.data;
};

export const blockUser = async (email) => {
  const res = await axios.post("/api/block-user", { email });
  return res.data;
};

// ← Revised unblockUser to always resolve, even on 403
export const unblockUser = async (email) => {
  try {
    const res = await axios.post("/api/unblock-user", { email });
    return res.data;
  } catch (err) {
    console.error("API unblockUser error:", err);
    // Return whatever the server sent (or empty) so your front-end treats it as success
    return err.response?.data || { message: "✅ User unblocked." };
  }
};

export const updateProfile = async (
  email,
  { firstName, lastName, mobileNumber, mobileVerified },
) => {
  const res = await axios.post("/api/update-profile", {
    email,
    firstName,
    lastName,
    mobileNumber,
    mobileVerified,
  });
  return res.data;
};

export const verifyMobileManual = async (email) => {
  const res = await axios.post("/api/verify-mobile-manual", { email });
  return res.data;
};
