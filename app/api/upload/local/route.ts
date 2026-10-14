import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { categoryOf, maxBytesFor, unsupportedMessage } from "@/lib/files/limits";
import { requireFeature } from "@/lib/guards";
import { assertSafeKey, claimUploadKey, putFile, storageMode } from "@/lib/storage";

/** Fallback ohne Vercel Blob (lokale Entwicklung): Datei geht über den Server. */
export async function POST(request: Request) {
  try {
    await requireUser();
    if (storageMode() !== "local") throw new HttpError(400, "Bitte den Direkt-Upload verwenden.");
    const form = await request.formData();
    const key = String(form.get("key") ?? "");
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "Keine Datei erhalten.");
    assertSafeKey(key);
    if (!key.startsWith("uploads/")) throw new HttpError(400, "Ungültiger Upload-Pfad.");
    const category = categoryOf(key);
    if (!category) throw new HttpError(400, unsupportedMessage(key));
    const settings = await requireFeature(category === "audio" ? "transcription" : "uploads");
    if (file.size === 0) throw new HttpError(400, "Die Datei ist leer.");
    if (file.size > maxBytesFor(category)) throw new HttpError(413, "Die Datei ist zu groß.");
    await claimUploadKey(key, category, settings.fileRetentionDays);
    await putFile(key, Buffer.from(await file.arrayBuffer()), file.type || "application/octet-stream", category, settings.fileRetentionDays);
    return Response.json({ key });
  } catch (err) {
    return errorResponse(err);
  }
}
