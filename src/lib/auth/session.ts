import { createHash, createHmac, timingSafeEqual } from "node:crypto";

import { DEFAULT_TEMPO_SESSION_SECRET } from "./appCredentials";

export const SESSION_COOKIE_NAME = "tempo_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SessionPayload = {
  v: 1;
  /** Milliseconds expiry */
  exp: number;
  /** Optional nickname shown after login */
  label: string | null;
  /** Session created via “Continue as guest”. */
  guest?: boolean;
};

/** Constant-time compare without leaking lengths (SHA-256 hashed). */
export function verifyAppPassword(candidate: string, expected: string): boolean {
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function getSessionSecret(): string {
  const s = process.env.TEMPO_SESSION_SECRET?.trim();
  if (s && s.length >= 16) return s;
  return DEFAULT_TEMPO_SESSION_SECRET;
}

function sign(payload: SessionPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const sig = createHmac("sha256", secret).update(body).digest("hex");
  return `${body.toString("base64url")}.${sig}`;
}

/** Parse cookie value or null */
export function parseSession(cookieValue: string | undefined): SessionPayload | null {
  const secret = getSessionSecret();
  if (!cookieValue) return null;
  const dot = cookieValue.indexOf(".");
  if (dot < 1) return null;
  const bodyB64 = cookieValue.slice(0, dot);
  const sig = cookieValue.slice(dot + 1);
  const body = Buffer.from(bodyB64, "base64url");
  const expectedSig = createHmac("sha256", secret).update(body).digest("hex");
  let ok = false;
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expectedSig, "hex");
    ok = a.length === b.length && timingSafeEqual(a, b);
  } catch {
    ok = false;
  }
  if (!ok) return null;
  try {
    const payload = JSON.parse(body.toString("utf8")) as SessionPayload;
    if (payload.v !== 1 || typeof payload.exp !== "number") return null;
    if (payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requireSessionSecret(): string {
  return getSessionSecret();
}

export function buildSessionToken(label: string | null): string {
  const secret = requireSessionSecret();
  const payload: SessionPayload = {
    v: 1,
    exp: Date.now() + MAX_AGE_MS,
    label: label?.trim().slice(0, 128) || null,
  };
  return sign(payload, secret);
}

/** Signed session for guest access (passwordless). Label shown as “Guest”. */
export function buildGuestSessionToken(): string {
  const secret = requireSessionSecret();
  const payload: SessionPayload = {
    v: 1,
    exp: Date.now() + MAX_AGE_MS,
    label: "Guest",
    guest: true,
  };
  return sign(payload, secret);
}
