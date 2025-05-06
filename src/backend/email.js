// src/backend/email.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MVPS_EMAIL, // Your Gmail address
    pass: process.env.MVPS_EMAIL_PASS, // App password
  },
});

export const sendOrderConfirmation = async (order, userProfile) => {
  const {
    orderNumber,
    userEmail,
    fileNames,
    printType,
    sideOption,
    spiralBinding,
    totalCost,
    totalPages,
    createdAt,
  } = order;

  const { firstName = "User" } = userProfile;

  const subject = `\u{1F4E6} MVPS Printing - New Order Confirmation (${orderNumber})`;

  const body = `
Dear ${firstName},

Thank you for placing your order with MVPS Printing. Here's a summary of your order:

\u{1F9FE} Order Number: ${orderNumber}
\u{1F4E7} Email: ${userEmail}
\u{1F552} Date: ${new Date(createdAt).toLocaleString()}
\u{1F4B0} Total Cost: ₹${totalCost}
\u{1F4C4} Total Pages: ${totalPages}

\u{1F5A8}\uFE0F Print Preferences:
• Print Type: ${printType}
• Sides: ${sideOption}
• Spiral Binding: ${spiralBinding ? "Yes" : "No"}

\u{1F4CE} Files:
${fileNames
    .split(",")
    .map((f) => `• ${f.trim()}`)
    .join("\n")}

We are currently validating your UPI payment and will notify you when your order is processed.

For queries, feel free to reply to this email.

Warm regards,
MVPS Printing Services
✉️ mvpservices2310@gmail.com
  `;

  const mailOptions = {
    from: `MVPS Printing <${process.env.MVPS_EMAIL}>`,
    to: [userEmail, "mvpservices2310@gmail.com"],
    subject,
    text: body,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("✅ Order confirmation email sent.");
  } catch (err) {
    console.error("❌ Failed to send email:", err);
  }
};
