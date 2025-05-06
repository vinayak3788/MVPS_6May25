// src/pages/Cart.jsx
import React, { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { auth } from "../config/firebaseConfig";
import { useCart } from "../context/CartContext";
import Layout from "../components/Layout";
import Button from "../components/Button";

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, clearCart, removeFromCart } = useCart();
  const printItems = Array.isArray(cartItems.print) ? cartItems.print : [];
  const stationeryItems = Array.isArray(cartItems.stationery)
    ? cartItems.stationery
    : [];

  const [placedPrint, setPlacedPrint] = useState([]);
  const [placedStationery, setPlacedStationery] = useState([]);
  const [showQR, setShowQR] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [upiAmount, setUpiAmount] = useState("0.00");
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    if (showQR) return;
    const printCost = printItems.reduce(
      (sum, i) => sum + (i.totalCost || 0),
      0,
    );
    const stationeryCost = stationeryItems.reduce(
      (sum, i) => sum + parseFloat(i.finalPrice || 0),
      0,
    );
    const total = printCost + stationeryCost;
    let latest = "ORD0000";
    [...printItems, ...stationeryItems].forEach((it) => {
      if (it.orderNumber) latest = it.orderNumber;
    });
    setUpiAmount(total.toFixed(2));
    setOrderNumber(latest);
  }, [printItems, stationeryItems, showQR]);

  const handlePlaceOrder = async () => {
    if (!printItems.length && !stationeryItems.length) {
      toast.error("Your cart is empty.");
      return;
    }
    setProcessing(true);
    try {
      const printCost = printItems.reduce(
        (sum, i) => sum + (i.totalCost || 0),
        0,
      );
      const stationeryCost = stationeryItems.reduce(
        (sum, i) => sum + parseFloat(i.finalPrice || 0),
        0,
      );
      const totalCost = printCost + stationeryCost;
      const userEmail = auth.currentUser?.email || "";
      const createdAt = new Date().toISOString();
      let data;
      if (printItems.length) {
        const formData = new FormData();
        formData.append("user", userEmail);
        formData.append("totalCost", totalCost);
        formData.append("createdAt", createdAt);
        formData.append("printType", printItems[0].printType);
        formData.append("sideOption", printItems[0].sideOption);
        formData.append(
          "spiralBinding",
          printItems[0].spiralBinding ? "true" : "false",
        );
        const pagesArray = printItems.map((o) => o.files.map((f) => f.pages));
        formData.append("pageCounts", JSON.stringify(pagesArray));
        printItems.forEach((order) =>
          order.files.forEach((f) => formData.append("files", f.raw, f.name)),
        );
        if (stationeryItems.length) {
          formData.append(
            "items",
            JSON.stringify(
              stationeryItems.map((i) => ({
                id: i.id,
                name: i.name,
                quantity: i.quantity || 1,
                price: i.finalPrice,
              })),
            ),
          );
        }
        const resp = await axios.post("/api/submit-order", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        data = resp.data;
      } else {
        const payload = {
          user: userEmail,
          items: stationeryItems.map((i) => ({
            id: i.id,
            name: i.name,
            quantity: i.quantity || 1,
            price: i.finalPrice,
          })),
          totalCost,
          createdAt,
        };
        const resp = await axios.post("/api/submit-stationery-order", payload);
        data = resp.data;
      }

      setPlacedPrint(printItems);
      setPlacedStationery(stationeryItems);
      setOrderNumber(data.orderNumber);
      setUpiAmount(Number(data.totalCost).toFixed(2));
      toast.success("✅ Order placed! Scan to pay now.");
      setShowQR(true);
      clearCart();
    } catch (err) {
      console.error("Order submission error:", err);
      toast.error("❌ Order submission failed.");
    } finally {
      setProcessing(false);
    }
  };

  const handlePaymentConfirmed = async () => {
    setPaymentConfirmed(true);
    try {
      await axios.post("/api/confirm-payment", { orderNumber });
      toast.success("🙏 Payment confirmed! Confirmation email on its way.");
    } catch (err) {
      console.error("Payment confirmation error:", err);
      toast.error("❌ Could not confirm payment.");
    }
  };

  const upiId = "9518916780@okbizaxis";
  const upiLink = `upi://pay?pa=${upiId}&pn=MVPS+Printing&am=${upiAmount}&tn=${encodeURIComponent(
    orderNumber,
  )}`;

  return (
    <Layout title="Cart Summary">
      <Toaster />
      {showQR ? (
        <div className="space-y-4 max-w-3xl mx-auto">
          {placedPrint.map((item, i) => (
            <div key={i} className="bg-white shadow rounded p-4">
              <p className="font-semibold">PRINT</p>
              <p>Cost: ₹{item.totalCost}</p>
              <p className="text-sm">
                Type: {item.printType === "color" ? "Color" : "B/W"},{" "}
                {item.sideOption === "double" ? "Back-to-Back" : "Single-Sided"}
                , Spiral: {item.spiralBinding ? "Yes" : "No"}
              </p>
            </div>
          ))}
          {placedStationery.map((item, i) => (
            <div
              key={i}
              className="bg-white shadow rounded p-4 flex justify-between"
            >
              <p className="font-semibold">STATIONERY</p>
              <p>
                {item.name} (₹{item.finalPrice}) ×{item.quantity || 1}
              </p>
            </div>
          ))}
          <p className="text-right font-semibold">Total: ₹{upiAmount}</p>
          <div className="text-center space-y-4">
            <p className="font-medium">
              Scan to pay ₹{upiAmount} (Order: {orderNumber})
            </p>
            <QRCode value={upiLink} size={180} className="mx-auto" />
            <a href={upiLink} className="block underline">
              Open in Payment App
            </a>
            {!paymentConfirmed ? (
              <Button
                onClick={handlePaymentConfirmed}
                className="bg-green-600 hover:bg-green-700"
              >
                I’ve completed the payment
              </Button>
            ) : (
              <p className="text-green-600 font-semibold">
                Payment confirmed—thank you!
              </p>
            )}
          </div>
          <div className="flex justify-between mt-10">
            <Button
              onClick={() => navigate("/userdashboard")}
              className="underline"
            >
              ← Back to Dashboard
            </Button>
            <Button onClick={() => navigate("/orders")} className="underline">
              View My Orders →
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl mx-auto">
          {printItems.map((item, i) => (
            <div
              key={i}
              className="bg-white shadow rounded p-4 flex justify-between"
            >
              <div>
                <p className="font-semibold">PRINT</p>
                <p>Cost: ₹{item.totalCost}</p>
                <p className="text-sm">
                  Type: {item.printType === "color" ? "Color" : "B/W"},{" "}
                  {item.sideOption === "double"
                    ? "Back-to-Back"
                    : "Single-Sided"}
                  , Spiral: {item.spiralBinding ? "Yes" : "No"}
                </p>
              </div>
              <Button
                onClick={() => removeFromCart("print", i)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Remove
              </Button>
            </div>
          ))}
          {stationeryItems.map((item, i) => (
            <div
              key={i}
              className="bg-white shadow rounded p-4 flex justify-between"
            >
              <div>
                <p className="font-semibold">STATIONERY</p>
                <p>
                  {item.name} (₹{item.finalPrice}) ×{item.quantity || 1}
                </p>
              </div>
              <Button
                onClick={() => removeFromCart("stationery", i)}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Remove
              </Button>
            </div>
          ))}
          <p className="text-right font-semibold">Total: ₹{upiAmount}</p>
          <div className="text-center mt-6">
            <Button
              onClick={handlePlaceOrder}
              disabled={processing}
              className="bg-purple-600 hover:bg-purple-700 w-full"
            >
              {processing ? "Processing…" : "Proceed to Pay via UPI"}
            </Button>
          </div>
          <div className="flex justify-between mt-10">
            <Button
              onClick={() => navigate("/userdashboard")}
              className="underline"
            >
              ← Back to Dashboard
            </Button>
            <Button onClick={() => navigate("/orders")} className="underline">
              View My Orders →
            </Button>
          </div>
        </div>
      )}
    </Layout>
  );
}
