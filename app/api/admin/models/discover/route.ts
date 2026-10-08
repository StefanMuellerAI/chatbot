import { z } from "zod";
import { errorResponse, requireAdmin } from "@/lib/auth/session";
import { listAnthropicModels } from "@/lib/providers/anthropic";
import { listOpenAIModels } from "@/lib/providers/openai";
import { ProviderError } from "@/lib/providers/types";

const Body = z.object({ provider: z.enum(["anthropic", "openai"]) });

/** Listet die beim Anbieter verfügbaren Modelle (Models-API). */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { provider } = Body.parse(await request.json());
    const models = provider === "anthropic" ? await listAnthropicModels() : await listOpenAIModels();
    return Response.json({ models });
  } catch (err) {
    if (err instanceof ProviderError) return Response.json({ error: err.userMessage }, { status: 400 });
    return errorResponse(err);
  }
}
