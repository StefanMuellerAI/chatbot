import { z } from "zod";
import { errorResponse, requireUser } from "@/lib/auth/session";
import { chatStream } from "@/lib/chat/run";
import { MAX_ATTACHMENTS, MAX_MESSAGE_CHARS } from "@/lib/files/limits";
import { ChatRequestSchema } from "@/lib/shared/schemas";
import type { ChatRequestBody } from "@/lib/shared/types";

// Lange Antworten (hoher Effort, Websuche) brauchen Zeit. Hobby-Tarif: max. 300 s.
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = ChatRequestSchema.parse(await readJson(request)) as ChatRequestBody;
    const stream = chatStream(body, session, request.signal);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: limitMessage(err) }, { status: 400 });
    }
    return errorResponse(err);
  }
}

/** Verständliche Meldung für überschrittene Grenzen, sonst eine allgemeine. */
function limitMessage(err: z.ZodError): string {
  for (const issue of err.issues) {
    if (issue.code !== "too_big") continue;
    const field = issue.path.at(-1);
    if (field === "text") return `Die Nachricht ist zu lang (höchstens ${MAX_MESSAGE_CHARS.toLocaleString("de-DE")} Zeichen).`;
    if (field === "attachments") return `Zu viele Anhänge (höchstens ${MAX_ATTACHMENTS} pro Nachricht).`;
    if (field === "messages") return "Der Chat ist zu lang. Bitte einen neuen Chat starten.";
  }
  return "Ungültige Anfrage.";
}

/** Liest JSON, optional gzip-komprimiert (große Verläufe). */
async function readJson(request: Request): Promise<unknown> {
  if (request.headers.get("x-freebie-encoding") === "gzip" && request.body) {
    const text = await new Response(request.body.pipeThrough(new DecompressionStream("gzip"))).text();
    return JSON.parse(text);
  }
  return request.json();
}
