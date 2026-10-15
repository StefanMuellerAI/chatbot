import { HttpError, requireAdmin } from "@/lib/auth/session";
import { fundusError } from "@/lib/fundus/api";
import { assertFundusKey } from "@/lib/fundus/upload";
import { extensionOf, FUNDUS_LIMITS, OWN_DOC_EXTENSIONS } from "@/lib/shared/fundus";
import { putFile, storageMode } from "@/lib/storage";

/** Upload eigener Fundus-Dateien ohne Vercel Blob (lokale Entwicklung, Tests): Datei geht über den Server. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    if (storageMode() !== "local") throw new HttpError(400, "Bitte den Direkt-Upload verwenden.");
    const form = await request.formData().catch(() => {
      throw new HttpError(400, "Keine Datei erhalten.");
    });
    const key = String(form.get("key") ?? "");
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "Keine Datei erhalten.");
    assertFundusKey(key);
    const ext = extensionOf(key);
    if (!OWN_DOC_EXTENSIONS[ext] && ext !== "eml") throw new HttpError(400, "Dieses Format geht im Fundus nicht (Word, Excel, PowerPoint, PDF und .eml).");
    if (file.size === 0) throw new HttpError(400, "Die Datei ist leer.");
    if (file.size > FUNDUS_LIMITS.fileBytes) throw new HttpError(413, "Die Datei ist zu groß.");
    // Vorgemerkt für einen Tag; „Speichern“ macht sie dauerhaft.
    await putFile(key, Buffer.from(await file.arrayBuffer()), file.type || "application/octet-stream", "fundus", 1);
    return Response.json({ key });
  } catch (err) {
    return fundusError(err);
  }
}
