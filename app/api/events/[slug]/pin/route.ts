import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const formData = await request.formData();
  const pin = String(formData.get("pin") || "");
  const event = await prisma.event.findUnique({ where: { slug } });

  if (!event?.pinCodeHash) return NextResponse.json({ ok: true });
  const valid = await bcrypt.compare(pin, event.pinCodeHash);
  if (!valid) return NextResponse.json({ error: "Invalid PIN." }, { status: 401 });

  const response = NextResponse.json({ ok: true });
  response.cookies.set(`creo_event_pin_${slug}`, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: `/e/${slug}`,
    maxAge: 60 * 60 * 6
  });
  return response;
}
