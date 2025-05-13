// src/config/s3Uploader.js

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";
import { v4 as uuidv4 } from "uuid";

// Use your AWS_REGION from env
const bucketName = process.env.AWS_S3_BUCKET_NAME;
const region = process.env.AWS_REGION;
const s3 = new S3Client({ region });

/**
 * Uploads a file buffer to S3 under a unique key.
 * @param {Buffer} buffer      The raw file buffer
 * @param {string} originalName The original filename (to preserve extension)
 * @param {string} folder      Optional S3 “folder” prefix
 * @returns { cleanFileName: string } The S3 key that was written
 */
export async function uploadFileToS3(buffer, originalName, folder = "") {
  const ext = path.extname(originalName);
  const key = folder ? `${folder}/${uuidv4()}${ext}` : `${uuidv4()}${ext}`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType:
        ext === ".pdf"
          ? "application/pdf"
          : ext === ".png"
            ? "image/png"
            : ext === ".jpg" || ext === ".jpeg"
              ? "image/jpeg"
              : "application/octet-stream",
    }),
  );

  return { cleanFileName: key };
}

/**
 * Generates a presigned GET URL for an existing object.
 * @param {string} key The S3 key of the object
 * @returns {Promise<string>} A URL valid for one hour
 */
export async function getSignedUrl(key) {
  const cmd = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  return awsGetSignedUrl(s3, cmd, { expiresIn: 3600 });
}
