import { NextResponse } from "next/server";
import { getSignedObjectUrl } from "@/lib/aws";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ photoId: string }> }) {
  const { photoId } = await params;
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  const url = await getSignedObjectUrl(photo.previewKey, 120);
  return NextResponse.redirect(url);
}
