/** Stable Gemini 2.5 Flash model ID (Google AI / Vertex naming). Override via GEMINI_MODEL in .env. */
export const DEFAULT_GEMINI_FLASH_MODEL = "gemini-2.5-flash" as const;

export function resolvedGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_FLASH_MODEL;
}
