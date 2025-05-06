// makePublic.js

// make S3 product images publicly readable.

import AWS from "aws-sdk";
import dotenv from "dotenv";
dotenv.config();
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

async function listAndMakePublic(continuationToken) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    ContinuationToken: continuationToken,
  };
  const { Contents, IsTruncated, NextContinuationToken } = await s3
    .listObjectsV2(params)
    .promise();

  await Promise.all(
    Contents.map((obj) =>
      s3
        .putObjectAcl({
          Bucket: params.Bucket,
          Key: obj.Key,
          ACL: "public-read",
        })
        .promise()
        .then(() => console.log("Made public:", obj.Key)),
    ),
  );

  if (IsTruncated) {
    await listAndMakePublic(NextContinuationToken);
  }
}

listAndMakePublic().catch((err) => {
  console.error("Error updating ACLs:", err);
  process.exit(1);
});
