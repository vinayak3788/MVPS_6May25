// Enhancement Notes
// 1. Enable UPI QR generation on user dashboard for each order
// 2. UPI ID: 9518916780@okbizaxis
// 3. Message: Order<Number>
// 4. Amount: Total cost of the order
// 5. Delete stationery images from S3 on deletion

// UPI Flow - QR + Deep Link Generation
// File: src/components/UPIPayment.js

import React from "react";
import QRCode from "qrcode.react";

const UPI_ID = "9518916780@okbizaxis";

export default function UPIPayment({ orderNumber, amount }) {
  if (!orderNumber || !amount) return null;

  const message = encodeURIComponent(orderNumber);
  const upiUrl = `upi://pay?pa=${UPI_ID}&pn=MVPS%20Printing&am=${amount}&cu=INR&tn=${message}`;

  return (
    <div className="text-center my-6">
      <h2 className="text-lg font-semibold mb-2">Scan & Pay via UPI</h2>
      <div className="inline-block p-4 bg-white shadow rounded">
        <QRCode value={upiUrl} size={160} />
      </div>
      <p className="mt-2 text-sm">
        Order: {orderNumber} | Amount: ₹{amount}
      </p>
      <a
        href={upiUrl}
        className="inline-block mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
      >
        💸 Pay via UPI App
      </a>
    </div>
  );
}
