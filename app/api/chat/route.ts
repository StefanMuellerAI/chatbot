import { z } from "zod";
import { errorResponse, requireUser } from "@/lib/auth/session";
import { chatStream } from "@/lib/chat/run";
import { ChatRequestSchema } from "@/lib/shared/schemas";
import type { ChatRequestBody } from "@/lib/shared/types";

// Lange Antworten (hoher Effort, Websuche) brauchen Zeit. Hobby-Tarif: max. 300 s.
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = ChatRequestSchema.parse(await request.json()) as ChatRequestBody;
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
      return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
    }
    return errorResponse(err);
  }
}
