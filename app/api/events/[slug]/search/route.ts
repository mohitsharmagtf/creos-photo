import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { maybeDeleteSelfie, uploadObject } from "@/lib/aws";
import {
  prepareFaceServiceImage,
  recognizeSelfie,
  subjectBelongsToNamespace
} from "@/lib/compreface";
import { isSupportedImage } from "@/lib/images";
import { prisma } from "@/lib/prisma";

export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await prisma.event.findUnique({ where: { slug } });
  if (!event || event.status !== "live") {
    return NextResponse.json({ error: "This event is not live." }, { status: 404 });
  }

  if (event.pinCodeHash) {
    const cookieStore = await cookies();
    if (cookieStore.get(`creo_event_pin_${slug}`)?.value !== "ok") {
      return NextResponse.json({ error: "Please enter the event PIN first." }, { status: 401 });
    }
  }

  const formData = await request.formData();
  const consentAccepted = formData.get("consent") === "yes";
  const selfie = formData.get("selfie");

  if (!consentAccepted) {
    return NextResponse.json({ error: "Consent is required before selfie search." }, { status: 400 });
  }

  if (!(selfie instanceof File) || !isSupportedImage(selfie.type)) {
    return NextResponse.json({ error: "Upload a JPG, PNG, or WebP selfie." }, { status: 400 });
  }

  const buffer = Buffer.from(await selfie.arrayBuffer());
  const selfieKey = `events/${event.id}/selfies/${Date.now()}-${crypto.randomUUID()}-${selfie.name}`;
  await uploadObject(selfieKey, buffer, selfie.type);

  const result = await recognizeSelfie(await prepareFaceServiceImage(buffer), 100);
  const matchedSubjects = Array.from(
    new Set(
      (result.result || [])
        .flatMap((face) => face.subjects || [])
        .filter(
          (subject) =>
            subject.similarity >= 0.85 && subjectBelongsToNamespace(subject.subject, event.faceNamespace)
        )
        .map((subject) => subject.subject)
    )
  );

  const faces = matchedSubjects.length
    ? await prisma.face.findMany({
        where: { eventId: event.id, comprefaceSubject: { in: matchedSubjects } },
        select: { photoId: true }
      })
    : [];
  const matchedPhotoIds = Array.from(new Set(faces.map((face) => face.photoId)));
  const selfieDeleted = await maybeDeleteSelfie(selfieKey);

  const search = await prisma.guestSearch.create({
    data: {
      eventId: event.id,
      selfieKey: selfieDeleted ? null : selfieKey,
      consentAccepted,
      similarity: 85,
      matchedFaceIds: matchedSubjects,
      matchedPhotoIds,
      selfieDeleted
    }
  });

  return NextResponse.json({ searchId: search.id, matchCount: matchedPhotoIds.length });
}
