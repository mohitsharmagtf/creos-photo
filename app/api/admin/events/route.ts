import bcrypt from "bcryptjs";
import { EventStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadObject } from "@/lib/aws";
import { eventFaceNamespace } from "@/lib/compreface";
import { isSupportedImage } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function POST(request: Request) {
  await requireAdmin();
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const eventType = String(formData.get("eventType") || "").trim();
  const eventDate = String(formData.get("eventDate") || "");
  const status = String(formData.get("status") || "draft") as EventStatus;
  const slug = slugify(String(formData.get("slug") || name));
  const pinCode = String(formData.get("pinCode") || "").trim();
  const coverImage = formData.get("coverImage");

  if (!name || !eventType || !eventDate || !slug) {
    return NextResponse.json({ error: "Missing event fields." }, { status: 400 });
  }

  const event = await prisma.event.create({
    data: {
      name,
      eventType,
      eventDate: new Date(eventDate),
      status,
      slug,
      faceNamespace: eventFaceNamespace(crypto.randomUUID()),
      pinCodeHash: pinCode ? await bcrypt.hash(pinCode, 12) : null
    }
  });

  await prisma.event.update({
    where: { id: event.id },
    data: { faceNamespace: eventFaceNamespace(event.id) }
  });

  if (coverImage instanceof File && coverImage.size > 0 && isSupportedImage(coverImage.type)) {
    const buffer = Buffer.from(await coverImage.arrayBuffer());
    const key = `events/${event.id}/cover-${Date.now()}-${coverImage.name}`;
    await uploadObject(key, buffer, coverImage.type);
    await prisma.event.update({ where: { id: event.id }, data: { coverImageKey: key } });
  }

  return NextResponse.redirect(new URL(`/admin/events/${event.id}`, request.url), 303);
}
