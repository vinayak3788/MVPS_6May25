import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

const isEmailConfigured = EMAIL_USER && EMAIL_PASS;

export const sendOrderConfirmation = async (toEmail, subject, htmlContent) => {
  if (!isEmailConfigured) {
    console.warn(
      "⚠️ Missing EMAIL_USER or EMAIL_PASS in environment. Email not sent.",
    );
    console.warn(
      "📌 Tip: Set EMAIL_USER and EMAIL_PASS in your .env file to enable emails.",
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"MVPS Printing Services" <${EMAIL_USER}>`,
    to: toEmail,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("📧 Order confirmation email sent to", toEmail);
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
};
