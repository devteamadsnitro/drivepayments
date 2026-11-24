// Object storage on a Railway Bucket (S3-compatible).
//
// Railway provides the credentials through variable references on the service:
//   S3_BUCKET=${{documents.BUCKET}}            S3_ENDPOINT=${{documents.ENDPOINT}}
//   S3_REGION=${{documents.REGION}}            S3_ACCESS_KEY_ID=${{documents.ACCESS_KEY_ID}}
//   S3_SECRET_ACCESS_KEY=${{documents.SECRET_ACCESS_KEY}}
// Any other S3-compatible provider (AWS, R2, Backblaze) works with the same variables.

import { randomUUID } from "node:crypto";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { ENV } from "./_core/env";

let client: S3Client | null = null;

function getS3() {
  const { s3Bucket, s3Endpoint, s3Region, s3AccessKeyId, s3SecretAccessKey } = ENV;
  if (!s3Bucket || !s3AccessKeyId || !s3SecretAccessKey) {
    throw new Error(
      "Storage config missing: set S3_BUCKET, S3_ACCESS_KEY_ID and S3_SECRET_ACCESS_KEY",
    );
  }
  if (!client) {
    client = new S3Client({
      region: s3Region || "auto",
      endpoint: s3Endpoint || undefined,
      // Railway Buckets use virtual-hosted–style URLs (bucket as subdomain).
      forcePathStyle: ENV.s3ForcePathStyle,
      credentials: { accessKeyId: s3AccessKeyId, secretAccessKey: s3SecretAccessKey },
    });
  }
  return { s3: client, bucket: s3Bucket };
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  const { s3, bucket } = getS3();
  const key = appendHashSuffix(normalizeKey(relKey));
  const body = typeof data === "string" ? Buffer.from(data, "utf8") : data;
  await s3.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }),
  );
  return { key, url: await storageGetSignedUrl(key) };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: await storageGetSignedUrl(key) };
}

/** Short-lived presigned download URL (the bucket itself is private). */
export async function storageGetSignedUrl(relKey: string, expiresIn = 300): Promise<string> {
  const { s3, bucket } = getS3();
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: normalizeKey(relKey) }), {
    expiresIn,
  });
}
