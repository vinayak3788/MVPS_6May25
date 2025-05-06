// scripts/cleanupOldOrders.js
import { open } from "sqlite";
import sqlite3 from "sqlite3";
import path from "path";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// shim for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// load .env from project root
dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function main() {
  const dbPath = path.resolve(__dirname, "../data/orders.db");
  const db = await open({ filename: dbPath, driver: sqlite3.Database });

  // 1) Fetch orders with id ≤ 85
  const oldOrders = await db.all(
    `SELECT id, orderNumber, fileNames FROM orders WHERE id <= ?`,
    [85],
  );
  if (!oldOrders.length) {
    console.log("No orders with id ≤ 85 found. Exiting.");
    await db.close();
    return;
  }

  // 2) Initialize S3
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
  const bucket = process.env.AWS_S3_BUCKET_NAME;

  // 3) Delete each file from S3
  for (const { orderNumber, fileNames } of oldOrders) {
    const files = fileNames
      .split(", ")
      .map((f) => f.trim())
      .filter((f) => f);
    for (const key of files) {
      const objectKey = `${orderNumber}/${key}`;
      try {
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: objectKey,
          }),
        );
        console.log(`✅ Deleted S3 object: ${objectKey}`);
      } catch (err) {
        console.warn(`⚠️ Failed to delete ${objectKey}:`, err.message);
      }
    }
  }

  // 4) Remove rows from the DB
  const { changes } = await db.run(`DELETE FROM orders WHERE id <= ?`, [85]);
  console.log(`✅ Removed ${changes} orders (id ≤ 85) from the database.`);

  await db.close();
  console.log("🎉 Cleanup complete.");
}

main().catch((err) => {
  console.error("❌ Cleanup script failed:", err);
  process.exit(1);
});
