// test-smtp.js

import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const testSmtp = async () => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.warn("❌ EMAIL_USER or EMAIL_PASS missing in .env file.");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const testOptions = {
    from: `"MVPS SMTP Test" <${EMAIL_USER}>`,
    to: EMAIL_USER, // send to self
    subject: "✅ SMTP Test Successful - MVPS",
    html: "<p>If you received this, your email config is working ✅</p>",
  };

  try {
    const info = await transporter.sendMail(testOptions);
    console.log("📧 Test email sent:", info.messageId);
  } catch (err) {
    console.error("❌ SMTP test failed:", err.message);
  }
};

testSmtp();
