import { NextResponse } from "next/server";
import { createSession, validateAdmin } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const user = await validateAdmin(email, password);

  if (!user) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }

  await createSession(user.id);
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
