import { transcribeBuffer } from "@/lib/audio/transcribe";
import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { DIRECT_UPLOAD_LIMIT } from "@/lib/files/limits";
import { getSettings } from "@/lib/settings";
import { logUsage, TRANSCRIPTION_PRICE_PER_MIN } from "@/lib/usage";

export const maxDuration = 120;

/** Spracheingabe: kurze Aufnahme direkt transkribieren, Text kommt ins Eingabefeld. */
export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const settings = await getSettings();
    if (!settings.features.dictation) throw new HttpError(403, "Die Spracheingabe ist deaktiviert.");
    const form = await request.formData();
    const file = form.get("file");
    const durationSec = Math.max(0, Math.min(3600, Number(form.get("durationSec") ?? 0)));
    if (!(file instanceof File)) throw new HttpError(400, "Keine Aufnahme erhalten.");
    if (file.size > DIRECT_UPLOAD_LIMIT) throw new HttpError(413, "Die Aufnahme ist zu lang für ein Diktat.");
    const mime = (file.type || "audio/webm").split(";")[0];
    const ext = mime.includes("mp4") ? "m4a" : mime.includes("ogg") ? "ogg" : mime.includes("mpeg") ? "mp3" : mime.includes("wav") ? "wav" : "webm";
    const text = await transcribeBuffer(Buffer.from(await file.arrayBuffer()), `diktat.${ext}`, mime, settings.dictationModel);
    await logUsage({
      sessionHash: session.sessionHash,
      modelId: settings.dictationModel,
      feature: "dictation",
      units: durationSec / 60,
      costUsd: process.env.FREEBIE_MOCK === "1" ? 0 : (durationSec / 60) * (TRANSCRIPTION_PRICE_PER_MIN[settings.dictationModel] ?? 0.006),
    });
    return Response.json({ text });
  } catch (err) {
    return errorResponse(err);
  }
}
