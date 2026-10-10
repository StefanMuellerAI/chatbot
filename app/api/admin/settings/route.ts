import { z } from "zod";
import { errorResponse, requireAdmin } from "@/lib/auth/session";
import { HttpError } from "@/lib/errors";
import { getModel } from "@/lib/models";
import { getSettings, updateSettings } from "@/lib/settings";
import { germanZodMessage } from "@/lib/validation";

const LABELS: Record<string, string> = {
  paused: "Freebie pausieren",
  pausedMessage: "Meldung während der Pause",
  claudeCacheTtl: "Claude Prompt-Cache (TTL)",
  answerCacheHours: "Antwort-Cache gültig (Stunden)",
  fileRetentionDays: "Dateien aufbewahren (Tage)",
  imageModel: "Bildmodell (OpenAI)",
  imageDefaultQuality: "Bildqualität (Standard)",
  imageDefaultSize: "Bildformat (Standard)",
  transcriptionModel: "Transkriptionsmodell (Audio-Dateien)",
  dictationModel: "Transkriptionsmodell (Spracheingabe)",
  titleModelId: "Modell für Chat-Titel",
  nativePdf: "PDFs nativ an das Modell schicken",
  noticeText: "Hinweis: vollständiger Text",
  noticeShort: "Hinweis: Kurzform",
  systemPromptAddendum: "Hinweise an das Modell",
  mailWelcomeSubject: "Begrüßungs-E-Mail: Betreff",
  mailWelcomeText: "Begrüßungs-E-Mail: Text",
};

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
        mailbox: z.boolean(),
      })
      .partial()
      .strict(),
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
    mailWelcomeSubject: z.string().max(200),
    mailWelcomeText: z.string().max(5000),
  })
  .partial()
  // Tippfehler im Feldnamen sollen auffallen statt still nichts zu ändern.
  .strict();

export async function GET() {
  try {
    await requireAdmin();
    return Response.json(await getSettings());
  } catch (err) {
    return errorResponse(err);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const patch = Patch.parse(await request.json());
    if (patch.titleModelId) {
      const model = await getModel(patch.titleModelId);
      if (!model || !model.enabled) throw new HttpError(400, "Modell für Chat-Titel: bitte ein aktives Modell wählen.");
    }
    await updateSettings(patch as Parameters<typeof updateSettings>[0]);
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: germanZodMessage(err, LABELS) }, { status: 400 });
    return errorResponse(err);
  }
}
