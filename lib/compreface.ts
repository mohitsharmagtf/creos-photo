import sharp from "sharp";
import { getEnv } from "@/lib/env";

type FaceBox = {
  probability?: number;
  x_max: number;
  y_max: number;
  x_min: number;
  y_min: number;
};

type DetectionFace = {
  box: FaceBox;
};

type DetectionResponse = {
  result?: DetectionFace[];
};

type AddFaceResponse = {
  image_id: string;
  subject: string;
};

type RecognitionSubject = {
  subject: string;
  similarity: number;
};

type RecognitionFace = {
  box?: FaceBox;
  subjects?: RecognitionSubject[];
};

type RecognitionResponse = {
  result?: RecognitionFace[];
};

function baseUrl() {
  return getEnv().COMPREFACE_BASE_URL.replace(/\/$/, "");
}

function imageBody(buffer: Buffer) {
  return JSON.stringify({ file: buffer.toString("base64") });
}

async function comprefaceFetch<T>(path: string, apiKey: string, buffer: Buffer) {
  const response = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey
    },
    body: imageBody(buffer)
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`CompreFace request failed: ${response.status} ${message}`);
  }

  return (await response.json()) as T;
}

export function eventFaceNamespace(eventId: string) {
  return `event_${eventId.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
}

export function faceSubject(namespace: string, photoId: string, faceIndex: number) {
  return `${namespace}__photo_${photoId}__face_${faceIndex}`;
}

export function subjectBelongsToNamespace(subject: string, namespace: string) {
  return subject.startsWith(`${namespace}__`);
}

export async function prepareFaceServiceImage(buffer: Buffer) {
  return sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 88 })
    .toBuffer();
}

export async function detectFaces(buffer: Buffer) {
  const env = getEnv();
  const response = await comprefaceFetch<DetectionResponse>(
    "/api/v1/detection/detect?limit=0&det_prob_threshold=0.8&status=false",
    env.COMPREFACE_DETECTION_API_KEY,
    buffer
  );
  return response.result || [];
}

export async function cropFace(buffer: Buffer, box: FaceBox) {
  const metadata = await sharp(buffer).metadata();
  const imageWidth = metadata.width || 0;
  const imageHeight = metadata.height || 0;
  const padding = 0.18;
  const width = Math.max(1, box.x_max - box.x_min);
  const height = Math.max(1, box.y_max - box.y_min);
  const padX = Math.round(width * padding);
  const padY = Math.round(height * padding);
  const left = Math.max(0, box.x_min - padX);
  const top = Math.max(0, box.y_min - padY);
  const right = Math.min(imageWidth, box.x_max + padX);
  const bottom = Math.min(imageHeight, box.y_max + padY);

  return sharp(buffer)
    .rotate()
    .extract({
      left,
      top,
      width: Math.max(1, right - left),
      height: Math.max(1, bottom - top)
    })
    .jpeg({ quality: 90 })
    .toBuffer();
}

export async function addFaceExample(subject: string, faceBuffer: Buffer) {
  const env = getEnv();
  const path = `/api/v1/recognition/faces?subject=${encodeURIComponent(
    subject
  )}&det_prob_threshold=0.8`;
  return comprefaceFetch<AddFaceResponse>(path, env.COMPREFACE_RECOGNITION_API_KEY, faceBuffer);
}

export async function recognizeSelfie(buffer: Buffer, predictionCount = 100) {
  const env = getEnv();
  const path = `/api/v1/recognition/recognize?limit=1&prediction_count=${predictionCount}&det_prob_threshold=0.8&status=false`;
  return comprefaceFetch<RecognitionResponse>(path, env.COMPREFACE_RECOGNITION_API_KEY, buffer);
}
