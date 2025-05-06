// src/api/orderApi.js

import axios from "axios";

// Fetch all orders for AdminDashboard
export const getAllOrders = async () => {
  const response = await axios.get("/api/get-orders");
  return response.data;
};

// Update order status (Admin action)
export const updateOrderStatus = async (orderId, newStatus) => {
  await axios.post("/api/update-order-status", {
    orderId,
    newStatus,
  });
};

// Submit new order for UserDashboard
export const submitOrder = async (order) => {
  const formData = new FormData();

  formData.append("user", order.user);
  formData.append("printType", order.printType);
  formData.append("sideOption", order.sideOption);
  formData.append("spiralBinding", order.spiralBinding);
  formData.append("totalCost", order.totalCost);
  formData.append("createdAt", order.createdAt);

  const pages = (order.files || []).map((f) => f.pages);
  formData.append("pageCounts", JSON.stringify(pages));

  (order.files || []).forEach((file) => {
    if (file.raw) {
      formData.append("files", file.raw);
    }
  });

  const response = await axios.post("/api/submit-order", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};
