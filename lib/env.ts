import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_S3_BUCKET: z.string().min(1),
  COMPREFACE_BASE_URL: z.string().url(),
  COMPREFACE_RECOGNITION_API_KEY: z.string().min(1),
  COMPREFACE_DETECTION_API_KEY: z.string().min(1),
  APP_BASE_URL: z.string().url(),
  SESSION_SECRET: z.string().min(32),
  DELETE_SELFIES_AFTER_SEARCH: z.string().default("true")
});

export function getEnv() {
  return envSchema.parse(process.env);
}

export function shouldDeleteSelfiesAfterSearch() {
  return (process.env.DELETE_SELFIES_AFTER_SEARCH || "true").toLowerCase() === "true";
}
