import { z } from "zod";
import { errorResponse, HttpError, requireAdmin } from "@/lib/auth/session";
import { getModel } from "@/lib/models";
import { testAnthropic } from "@/lib/providers/anthropic";
import { testOpenAI } from "@/lib/providers/openai";
import { ProviderError } from "@/lib/providers/types";

export const maxDuration = 60;

const Body = z.object({ id: z.string() });

/** Schickt eine Mini-Anfrage an das Modell, um Schlüssel und Modell-ID zu prüfen. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { id } = Body.parse(await request.json());
    const model = await getModel(id);
    if (!model) throw new HttpError(404, "Modell nicht gefunden.");
    const started = Date.now();
    try {
      const answer = model.provider === "anthropic" ? await testAnthropic(model.modelId) : await testOpenAI(model.modelId);
      return Response.json({ ok: true, answer: answer.slice(0, 200), ms: Date.now() - started });
    } catch (err) {
      const message =
        err instanceof ProviderError ? err.userMessage : err instanceof Error ? err.message : "Unbekannter Fehler";
      return Response.json({ ok: false, error: message.slice(0, 400), ms: Date.now() - started });
    }
  } catch (err) {
    return errorResponse(err);
  }
}
