import bcrypt from "bcryptjs";
import { EventStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { uploadObject } from "@/lib/aws";
import { isSupportedImage } from "@/lib/images";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const formData = await request.formData();
  const name = String(formData.get("name") || "").trim();
  const eventType = String(formData.get("eventType") || "").trim();
  const eventDate = String(formData.get("eventDate") || "");
  const status = String(formData.get("status") || "draft") as EventStatus;
  const slug = slugify(String(formData.get("slug") || name));
  const pinCode = String(formData.get("pinCode") || "").trim();
  const coverImage = formData.get("coverImage");

  const data: {
    name: string;
    eventType: string;
    eventDate: Date;
    status: EventStatus;
    slug: string;
    pinCodeHash?: string;
    coverImageKey?: string;
  } = { name, eventType, eventDate: new Date(eventDate), status, slug };

  if (pinCode) data.pinCodeHash = await bcrypt.hash(pinCode, 12);

  if (coverImage instanceof File && coverImage.size > 0 && isSupportedImage(coverImage.type)) {
    const buffer = Buffer.from(await coverImage.arrayBuffer());
    const key = `events/${id}/cover-${Date.now()}-${coverImage.name}`;
    await uploadObject(key, buffer, coverImage.type);
    data.coverImageKey = key;
  }

  await prisma.event.update({ where: { id }, data });
  return NextResponse.redirect(new URL(`/admin/events/${id}`, request.url), 303);
}
