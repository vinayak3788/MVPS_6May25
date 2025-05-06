// src/config/s3StationeryUploader.js

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import AWS from "aws-sdk";
import mime from "mime-types";
import { v4 as uuidv4 } from "uuid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;
const STATIONERY_FOLDER = "stationery"; // 🆕 Always stationery folder

// Upload only images for stationery products
export async function uploadImageToS3(buffer, originalFileName) {
  if (!BUCKET_NAME) {
    throw new Error("❌ AWS_S3_BUCKET_NAME is missing in environment");
  }

  const fileExtension = originalFileName.split(".").pop().toLowerCase();
  const mimeType = mime.lookup(fileExtension);

  if (!mimeType || !mimeType.startsWith("image/")) {
    throw new Error("❌ Only image files are allowed for stationery uploads.");
  }

  const cleanFileName = `${uuidv4()}.${fileExtension}`;
  const s3Key = `${STATIONERY_FOLDER}/${cleanFileName}`;

  const params = {
    Bucket: BUCKET_NAME,
    Key: s3Key,
    Body: buffer,
    ContentType: mimeType,
    //ACL: "public-read",
  };

  await s3.upload(params).promise();

  const s3Url = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

  console.log(`✅ Stationery Image uploaded to S3: ${s3Url}`);

  return { s3Url, cleanFileName };
}
