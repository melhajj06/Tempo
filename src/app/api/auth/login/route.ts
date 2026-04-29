import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { TEMPO_APP_PASSWORD } from "@/lib/auth/appCredentials";
import { buildSessionToken, SESSION_COOKIE_NAME, verifyAppPassword } from "@/lib/auth/session";

export async function POST(req: Request) {
  const expectedPw = TEMPO_APP_PASSWORD;

  let body: { password?: string; label?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  const label = typeof body.label === "string" ? body.label.trim().slice(0, 128) : "";

  if (!verifyAppPassword(password, expectedPw)) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const token = buildSessionToken(label || null);

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ ok: true, label: label || null });
}
