import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { categoryOf, maxBytesFor } from "@/lib/files/limits";
import { getSettings } from "@/lib/settings";
import { assertSafeKey, putFile, storageMode } from "@/lib/storage";

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
    const category = categoryOf(key);
    if (!category) throw new HttpError(400, "Dieses Dateiformat wird nicht unterstützt.");
    if (file.size > maxBytesFor(category)) throw new HttpError(413, "Die Datei ist zu groß.");
    const settings = await getSettings();
    await putFile(key, Buffer.from(await file.arrayBuffer()), file.type || "application/octet-stream", category, settings.fileRetentionDays);
    return Response.json({ key });
  } catch (err) {
    return errorResponse(err);
  }
}
