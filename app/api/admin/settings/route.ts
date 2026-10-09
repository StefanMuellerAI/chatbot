import { z } from "zod";
import { errorResponse, requireAdmin } from "@/lib/auth/session";
import { getSettings, updateSettings } from "@/lib/settings";

const Patch = z
  .object({
    features: z
      .object({
        webSearch: z.boolean(),
        uploads: z.boolean(),
        transcription: z.boolean(),
        dictation: z.boolean(),
        imageGeneration: z.boolean(),
        artifacts: z.boolean(),
        answerCache: z.boolean(),
        showCacheBadge: z.boolean(),
        showCost: z.boolean(),
      })
      .partial(),
    imageModel: z.string().min(1).max(100),
    imageDefaultQuality: z.enum(["low", "medium", "high"]),
    imageDefaultSize: z.enum(["1024x1024", "1536x1024", "1024x1536"]),
    transcriptionModel: z.string().min(1).max(100),
    dictationModel: z.string().min(1).max(100),
    titleModelId: z.string().min(1).max(100),
    claudeCacheTtl: z.enum(["5m", "1h"]),
    answerCacheHours: z.number().min(1).max(24 * 30),
    fileRetentionDays: z.number().int().min(1).max(90),
    nativePdf: z.boolean(),
    noticeText: z.string().min(10).max(3000),
    noticeShort: z.string().min(5).max(300),
    paused: z.boolean(),
    pausedMessage: z.string().min(5).max(500),
    systemPromptAddendum: z.string().max(10000),
  })
  .partial();

export async function GET() {
  try {
    await requireAdmin();
    const { appPasswordHash, sessionVersion, ...rest } = await getSettings();
    return Response.json({ ...rest, appPasswordSet: Boolean(appPasswordHash), sessionVersion });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const patch = Patch.parse(await request.json());
    await updateSettings(patch as Parameters<typeof updateSettings>[0]);
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: err.issues[0]?.message ?? "Ungültige Eingabe." }, { status: 400 });
    return errorResponse(err);
  }
}
