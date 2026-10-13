import { after } from "next/server";
import { z } from "zod";
import { HttpError, requireUser } from "@/lib/auth/session";
import { requireGroupChats } from "@/lib/guards";
import { ChatId, groupChatError } from "@/lib/groupchat/api";
import { eventStream, runGroupAnswer } from "@/lib/groupchat/run";
import { actorFor, startAnswer } from "@/lib/groupchat/store";
import { getModel, providerConfigured } from "@/lib/models";

// Lange Antworten (hoher Effort, Websuche) brauchen Zeit. Hobby-Tarif: max. 300 s.
export const maxDuration = 300;

const Body = z
  .object({
    modelId: z.string().min(1).max(100),
    effort: z.enum(["low", "medium", "high", "max"]).optional(),
    webSearch: z.boolean().optional(),
    regenerate: z.boolean().optional(),
  })
  .strict();

/**
 * Freebie antwortet im Gruppenchat. Prüfungen (Modell, Mitgliedschaft, offene Frage, Sperre) kommen als
 * HTTP-Fehler; danach streamt die Antwort an die fragende Person. Gespeichert wird sie vom Server – auch
 * wenn die Verbindung abbricht (`after` hält die Funktion bis dahin am Leben).
 */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireUser();
    const settings = await requireGroupChats({ write: true });
    const id = ChatId.parse((await ctx.params).id);
    const body = Body.parse(await request.json());
    const model = await getModel(body.modelId);
    if (!model || !model.enabled) throw new HttpError(400, "Dieses Modell ist nicht (mehr) verfügbar. Bitte wähle ein anderes.");
    if (process.env.FREEBIE_MOCK !== "1" && !providerConfigured(model.provider)) {
      throw new HttpError(503, `Für ${model.provider === "anthropic" ? "Claude" : "OpenAI"} ist noch kein API-Schlüssel hinterlegt. Bitte in Vercel ergänzen.`);
    }
    const effort = body.effort ?? (model.defaultEffort as "low" | "medium" | "high" | "max");
    const job = await startAnswer(actorFor(session), id, {
      regenerate: Boolean(body.regenerate),
      modelId: model.id,
      effort,
      webSearch: body.webSearch ?? true,
    });
    const { stream, done } = eventStream((send) => runGroupAnswer(job, { session, settings, model, signal: request.signal, send }));
    after(() => done);
    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    return groupChatError(err);
  }
}
