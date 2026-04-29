import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { parseSession, SESSION_COOKIE_NAME } from "@/lib/auth/session";

export async function GET() {
  const cookieStore = await cookies();
  const tok = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const sess = parseSession(tok);
  if (!sess) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    label: sess.label,
  });
}
