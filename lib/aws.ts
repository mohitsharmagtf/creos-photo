import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv, shouldDeleteSelfiesAfterSearch } from "@/lib/env";

export const s3 = new S3Client({ region: process.env.AWS_REGION });

export async function uploadObject(key: string, body: Buffer, contentType: string) {
  const env = getEnv();
  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );
}

export async function deleteObject(key: string) {
  const env = getEnv();
  await s3.send(new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }));
}

export async function getSignedObjectUrl(key: string, expiresIn = 300) {
  const env = getEnv();
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }),
    { expiresIn }
  );
}

export async function maybeDeleteSelfie(key: string) {
  if (shouldDeleteSelfiesAfterSearch()) {
    await deleteObject(key);
    return true;
  }
  return false;
}
