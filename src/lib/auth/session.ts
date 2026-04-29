import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE_NAME = "tempo_session";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export type SessionPayload = {
  v: 1;
  /** Milliseconds expiry */
  exp: number;
  /** Optional nickname shown after login */
  label: string | null;
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

function getSecret(): string | null {
  const s = process.env.TEMPO_SESSION_SECRET?.trim();
  return s && s.length >= 16 ? s : null;
}

function sign(payload: SessionPayload, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  const sig = createHmac("sha256", secret).update(body).digest("hex");
  return `${body.toString("base64url")}.${sig}`;
}

/** Parse cookie value or null */
export function parseSession(cookieValue: string | undefined): SessionPayload | null {
  const secret = getSecret();
  if (!secret || !cookieValue) return null;
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
  const secret = getSecret();
  if (!secret) {
    throw new Error("TEMPO_SESSION_SECRET must be set (min 16 characters).");
  }
  return secret;
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
