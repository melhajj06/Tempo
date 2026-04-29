import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

import { resolvedGeminiModel } from "@/lib/tempo/geminiModel";

export const runtime = "nodejs";

const TEMPO_AI_PREFIX = `You are TempoAI, embedded in the student's Tempo planning app.

You receive a verbatim data dump labelled "TEMPO APP DATA". Treat it as the single source of truth for their calendars, deadlines, blocks, overlaps, reminders, sticky notes, and archive. Answer using those facts:

- Prefer citing task titles and deadline dates exactly as shown when relevant.
- Distinguish "scheduled_calendar_day / block_start_hour" (where the task block sits on the calendar) vs "deadline_date" (assignment due date).
- If something is not listed in TEMPO APP DATA, say you do not see it rather than guessing.
- Be concise: short bullets or paragraphs; respectful, student-facing tone.

Never invent secrets (API keys, grades, passwords).`;

export async function POST(req: Request) {
  const key = process.env.GEMINI_API_KEY;
  if (!key?.trim()) {
    return NextResponse.json({ error: "Server missing GEMINI_API_KEY." }, { status: 500 });
  }

  let body: {
    prompt?: string;
    tempoAiContext?: string;
    /** Older clients */
    agendaContext?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  if (!prompt || prompt.length > 12_000) {
    return NextResponse.json({ error: "prompt is required (max ~12k chars)." }, { status: 400 });
  }

  let rawContext = "";
  if (typeof body.tempoAiContext === "string" && body.tempoAiContext.trim()) {
    rawContext = body.tempoAiContext.trim();
  } else if (typeof body.agendaContext === "string") {
    rawContext = body.agendaContext.trim();
  }

  /** Gemini 2.5 Flash accepts long context windows; cap defensively per request limits. */
  const truncatedContext = rawContext.slice(0, 400_000);

  const modelId = resolvedGeminiModel();

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: modelId });
    const fullPrompt =
      TEMPO_AI_PREFIX +
      (truncatedContext
        ? `\n\n---BEGIN TEMPO APP DATA---\n${truncatedContext}\n---END TEMPO APP DATA---\n\nStudent question:\n${prompt}`
        : `\n\n(No Tempo snapshot was sent yet; answer generally and briefly note missing data.)\n\nStudent question:\n${prompt}`);

    const result = await model.generateContent(fullPrompt);
    const text = result.response.text()?.trim();
    if (!text) {
      return NextResponse.json({ error: "Empty model response." }, { status: 502 });
    }
    return NextResponse.json({ text, model: modelId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Gemini request failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
