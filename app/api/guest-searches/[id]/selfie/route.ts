import { NextResponse } from "next/server";
import { deleteObject } from "@/lib/aws";
import { prisma } from "@/lib/prisma";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const search = await prisma.guestSearch.findUnique({ where: { id } });
  if (!search) return NextResponse.json({ error: "Search not found." }, { status: 404 });

  if (search.selfieKey && !search.selfieDeleted) {
    await deleteObject(search.selfieKey);
  }

  await prisma.guestSearch.update({
    where: { id },
    data: { selfieKey: null, selfieDeleted: true }
  });

  return NextResponse.json({ ok: true });
}
