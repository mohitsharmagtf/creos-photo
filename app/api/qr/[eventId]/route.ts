import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { eventQrPng } from "@/lib/qrcode";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ eventId: string }> }) {
  await requireAdmin();
  const { eventId } = await params;
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return NextResponse.json({ error: "Event not found." }, { status: 404 });
  const png = await eventQrPng(event.slug);
  const url = new URL(request.url);
  const headers: Record<string, string> = { "Content-Type": "image/png" };
  if (url.searchParams.get("download") === "1") {
    headers["Content-Disposition"] = `attachment; filename="${event.slug}-qr.png"`;
  }
  return new NextResponse(png, { headers });
}
