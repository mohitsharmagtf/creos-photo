import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getSignedObjectUrl } from "@/lib/aws";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ photoId: string }> }) {
  await requireAdmin();
  const { photoId } = await params;
  const photo = await prisma.photo.findUnique({ where: { id: photoId } });
  if (!photo) return NextResponse.json({ error: "Photo not found." }, { status: 404 });
  return NextResponse.redirect(await getSignedObjectUrl(photo.originalKey, 120));
}
