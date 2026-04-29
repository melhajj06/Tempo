/**
 * App login password for the Tempo session gate (POST /api/auth/login).
 * Kept in source so local/prod behavior does not depend on TEMPO_APP_PASSWORD in .env.
 */
export const TEMPO_APP_PASSWORD = "dd567890";

/**
 * HMAC key for signing `tempo_session` cookies when `TEMPO_SESSION_SECRET` is not set.
 * For production, set `TEMPO_SESSION_SECRET` (≥16 chars) so session tokens are not derivable from the repo alone.
 */
export const DEFAULT_TEMPO_SESSION_SECRET = "tempo-default-session-hmac-key-min-32-chars";
