import { FaceProcessingStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadObject } from "@/lib/aws";
import {
  addFaceExample,
  cropFace,
  detectFaces,
  faceSubject,
  prepareFaceServiceImage
} from "@/lib/compreface";
import { createPreview, isSupportedImage } from "@/lib/images";
import { prisma } from "@/lib/prisma";

export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const event = await prisma.event.findUnique({ where: { id } });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });

  const formData = await request.formData();
  const files = formData.getAll("photos").filter((file): file is File => file instanceof File);

  for (const file of files) {
    if (!isSupportedImage(file.type)) continue;

    const buffer = Buffer.from(await file.arrayBuffer());
    const { preview, width, height } = await createPreview(buffer);
    const stamp = `${Date.now()}-${crypto.randomUUID()}`;
    const originalKey = `events/${event.id}/originals/${stamp}-${file.name}`;
    const previewKey = `events/${event.id}/previews/${stamp}.jpg`;

    const facePlaceholder = await prisma.face.create({
      data: {
        eventId: event.id,
        photoId: await createPhoto(event.id, originalKey, previewKey, file.name, file.type, width, height),
        processingStatus: FaceProcessingStatus.processing
      }
    });

    try {
      await uploadObject(originalKey, buffer, file.type);
      await uploadObject(previewKey, preview, "image/jpeg");
      const photoId = facePlaceholder.photoId;
      const faceServiceImage = await prepareFaceServiceImage(buffer);
      const detectedFaces = await detectFaces(faceServiceImage);

      if (detectedFaces.length === 0) {
        await prisma.face.update({
          where: { id: facePlaceholder.id },
          data: { processingStatus: FaceProcessingStatus.completed, confidence: 0 }
        });
      } else {
        await prisma.face.delete({ where: { id: facePlaceholder.id } });
        for (const [faceIndex, detectedFace] of detectedFaces.entries()) {
          const subject = faceSubject(event.faceNamespace, photoId, faceIndex);
          const faceBuffer = await cropFace(faceServiceImage, detectedFace.box);
          const savedFace = await addFaceExample(subject, faceBuffer);
          await prisma.face.create({
            data: {
              eventId: event.id,
              photoId,
              comprefaceImageId: savedFace.image_id,
              comprefaceSubject: savedFace.subject,
              boundingBox: detectedFace.box,
              confidence: detectedFace.box.probability,
              processingStatus: FaceProcessingStatus.completed
            }
          });
        }
      }
    } catch (error) {
      await prisma.face.update({
        where: { id: facePlaceholder.id },
        data: {
          processingStatus: FaceProcessingStatus.failed,
          failureReason: error instanceof Error ? error.message : "Unknown processing error"
        }
      });
    }
  }

  return NextResponse.redirect(new URL(`/admin/events/${event.id}/photos`, request.url), 303);
}

async function createPhoto(
  eventId: string,
  originalKey: string,
  previewKey: string,
  fileName: string,
  mimeType: string,
  width?: number,
  height?: number
) {
  const photo = await prisma.photo.create({
    data: { eventId, originalKey, previewKey, fileName, mimeType, width, height }
  });
  return photo.id;
}
