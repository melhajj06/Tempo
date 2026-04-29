import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { buildGuestSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function POST() {
  const token = buildGuestSessionToken();

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
    secure: process.env.NODE_ENV === "production",
  });

  return NextResponse.json({ ok: true, guest: true });
}
