// src/backend/routes/orderRoutes.js

import express from "express";
import multer from "multer";
import {
  createOrder,
  updateOrderFiles,
  getAllOrders,
  updateOrderStatus,
} from "../db.js";
import { uploadFileToS3, getSignedUrl } from "../../config/s3Uploader.js";
import { sendOrderConfirmation } from "../mailer.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ——— PRINT + FILE + MIXED FLOW ———
router.post("/submit-order", upload.array("files"), async (req, res) => {
  try {
    const {
      user, // user email
      printType,
      sideOption,
      spiralBinding,
      totalCost,
      createdAt,
      pageCounts,
      items, // optional stationery items alongside
    } = req.body;

    if (!user || !printType || !totalCost || !createdAt)
      return res.status(400).json({ error: "Missing required fields." });
    if (!req.files?.length)
      return res.status(400).json({ error: "No files uploaded." });

    const parsedPages = JSON.parse(pageCounts || "[]");

    // 1) create DB row (initial fileNames empty)
    const { id: orderId, orderNumber } = await createOrder({
      userEmail: user,
      fileNames: "",
      printType,
      sideOption,
      spiralBinding: spiralBinding === "true" ? 1 : 0,
      totalPages: 0,
      totalCost,
      createdAt,
    });

    // 2) upload PDFs
    let totalPagesCount = 0;
    const uploaded = [];
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const { cleanFileName, pageCount } = await uploadFileToS3(
        file.buffer,
        file.originalname,
        orderNumber,
      );
      uploaded.push(cleanFileName);
      totalPagesCount += parsedPages[i] || pageCount || 0;
    }

    // 2b) include stationery items if passed
    if (items) {
      JSON.parse(items).forEach((it) =>
        uploaded.push(`${it.name} × ${it.quantity || 1}`),
      );
    }

    // 3) update DB with filenames & page total
    await updateOrderFiles(orderId, {
      fileNames: uploaded.join(", "),
      totalPages: totalPagesCount,
    });

    // 4) (optional) return orderNumber + totalCost
    res.json({ orderNumber, totalCost });
  } catch (err) {
    console.error("❌ Error saving print order:", err);
    res.status(500).json({ error: "Failed to store print order." });
  }
});

// ——— STATIONERY-ONLY FLOW ———
router.post("/submit-stationery-order", async (req, res) => {
  try {
    const { user, items, totalCost, createdAt } = req.body;
    if (!user || !Array.isArray(items) || !items.length || !totalCost) {
      return res.status(400).json({ error: "Missing stationery order data." });
    }

    const fileNames = items
      .map((i) => `${i.name} × ${i.quantity || 1}`)
      .join(", ");

    const { id: orderId, orderNumber } = await createOrder({
      userEmail: user,
      fileNames,
      printType: "stationery",
      sideOption: "",
      spiralBinding: 0,
      totalPages: items.reduce((sum, i) => sum + (i.quantity || 1), 0),
      totalCost,
      createdAt,
    });

    res.json({ orderNumber, totalCost });
  } catch (err) {
    console.error("❌ Failed to store stationery order:", err);
    res.status(500).json({ error: "Failed to store stationery order." });
  }
});

// ——— CONFIRM PAYMENT & SEND EMAIL ———
router.post("/confirm-payment", async (req, res) => {
  try {
    const { orderNumber } = req.body;
    if (!orderNumber) {
      return res.status(400).json({ error: "Order number required." });
    }

    const { orders } = await getAllOrders();
    const order = orders.find((o) => o.orderNumber === orderNumber);
    if (!order) {
      return res.status(404).json({ error: "Order not found." });
    }

    // build email HTML
    let html = `<h2>🧾 Order Confirmation</h2>
      <p><strong>Order No:</strong> ${orderNumber}</p>
      <p><strong>Total:</strong> ₹${order.totalCost.toFixed(2)}</p>`;

    if (order.printType !== "stationery") {
      html += `
        <p><strong>Print Type:</strong> ${
          order.printType === "color" ? "Color" : "Black & White"
        }</p>
        <p><strong>Print Side:</strong> ${
          order.sideOption === "double" ? "Back to Back" : "Single Sided"
        }</p>
        <p><strong>Spiral Binding:</strong> ${
          order.spiralBinding ? "Yes" : "No"
        }</p>`;
    }

    const parts = order.fileNames.split(", ").filter(Boolean);
    const pdfs = parts.filter((p) => !p.includes("×"));
    const stationery = parts.filter((p) => p.includes("×"));

    if (pdfs.length) {
      html += `<p><strong>Files:</strong></p>
        <ul>${pdfs.map((n) => `<li>${n}</li>`).join("")}</ul>`;
    }
    if (stationery.length) {
      html += `<p><strong>Stationery Items:</strong></p>
        <ul>${stationery.map((n) => `<li>${n}</li>`).join("")}</ul>`;
    }

    await sendOrderConfirmation(
      `${order.userEmail}, mvpservices2310@gmail.com`,
      `📌 MVPS Order Confirmed - ${orderNumber}`,
      html,
    );

    res.json({ message: "Confirmation email sent." });
  } catch (err) {
    console.error("❌ Payment confirmation error:", err);
    res.status(500).json({ error: "Failed to confirm payment." });
  }
});

// ——— GET SIGNED URL ———
router.get("/get-signed-url", async (req, res) => {
  const { filename } = req.query;
  if (!filename) return res.status(400).json({ error: "Filename required" });
  try {
    const url = await getSignedUrl(filename);
    res.json({ url });
  } catch (err) {
    console.error("❌ Error generating signed URL:", err);
    res.status(500).json({ error: "Failed to generate signed URL" });
  }
});

// ——— FETCH ALL (OR USER-SCOPED) ORDERS ———
router.get("/get-orders", async (req, res) => {
  try {
    const userEmail = req.query.email;
    let { orders } = await getAllOrders();
    if (userEmail) {
      orders = orders.filter((o) => o.userEmail === userEmail);
    }
    const withFiles = orders.map((o) => ({
      ...o,
      attachedFiles: o.fileNames
        ? o.fileNames.split(", ").map((n) => ({ name: n }))
        : [],
    }));
    res.json({ orders: withFiles });
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ error: "Failed to fetch orders." });
  }
});

// ——— UPDATE ORDER STATUS ———
router.post("/update-order-status", async (req, res) => {
  const { orderId, newStatus } = req.body;
  if (!orderId || !newStatus) {
    return res.status(400).json({ error: "Order ID and new status required." });
  }
  try {
    await updateOrderStatus(orderId, newStatus);
    res.json({ message: "✅ Order status updated successfully." });
  } catch (err) {
    console.error("❌ Failed to update order status:", err);
    res.status(500).json({ error: "Failed to update order status." });
  }
});

export default router;
