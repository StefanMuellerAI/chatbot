import { z } from "zod";
import { errorResponse, requireUser } from "@/lib/auth/session";
import { getModel, providerConfigured } from "@/lib/models";
import { anthropicTitle } from "@/lib/providers/anthropic";
import { openAITitle } from "@/lib/providers/openai";
import { getSettings } from "@/lib/settings";
import { costOf, logUsage, modelPrices } from "@/lib/usage";

const Body = z.object({ text: z.string().min(1).max(4000) });

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const { text } = Body.parse(await request.json());
    const fallback = fallbackTitle(text);
    if (process.env.FREEBIE_MOCK === "1") return Response.json({ title: fallback });
    const settings = await getSettings();
    const model = await getModel(settings.titleModelId);
    if (!model || !model.enabled || !providerConfigured(model.provider)) return Response.json({ title: fallback });
    const prompt = `Formuliere einen sehr kurzen deutschen Titel (maximal 5 Wörter, ohne Anführungszeichen, ohne Punkt) für ein Gespräch, das mit dieser Nachricht beginnt:\n\n${text.slice(0, 1500)}`;
    try {
      const res =
        model.provider === "anthropic"
          ? await anthropicTitle(model.modelId, prompt)
          : await openAITitle(model.modelId, prompt);
      const usage = { inputTokens: res.usage.input, outputTokens: res.usage.output, cacheReadTokens: 0, cacheWriteTokens: 0 };
      await logUsage({
        sessionHash: session.sessionHash,
        modelId: model.id,
        feature: "title",
        usage,
        costUsd: costOf(usage, modelPrices(model)),
      });
      const title = res.title.replace(/["„“]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
      return Response.json({ title: title || fallback });
    } catch {
      return Response.json({ title: fallback });
    }
  } catch (err) {
    return errorResponse(err);
  }
}

function fallbackTitle(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 40 ? `${clean.slice(0, 40)}…` : clean || "Neuer Chat";
}
