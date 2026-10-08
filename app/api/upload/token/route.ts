import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { categoryOf, maxBytesFor } from "@/lib/files/limits";
import { getSettings } from "@/lib/settings";
import { assertSafeKey, registerFile } from "@/lib/storage";

/** Stellt kurzlebige Tokens für Direkt-Uploads vom Browser in Vercel Blob aus. */
export async function POST(request: Request) {
  try {
    await requireUser();
    const settings = await getSettings();
    if (!settings.features.uploads && !settings.features.transcription && !settings.features.dictation) {
      throw new HttpError(403, "Uploads sind deaktiviert.");
    }
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        assertSafeKey(pathname);
        if (!pathname.startsWith("uploads/")) throw new HttpError(400, "Ungültiger Upload-Pfad.");
        const category = categoryOf(pathname);
        if (!category) throw new HttpError(400, "Dieses Dateiformat wird nicht unterstützt.");
        // Schon jetzt vormerken, damit auch nie verarbeitete Uploads fristgerecht gelöscht werden.
        await registerFile(pathname, category, "application/octet-stream", 0, settings.fileRetentionDays);
        return {
          maximumSizeInBytes: maxBytesFor(category),
          addRandomSuffix: false,
          allowOverwrite: true,
        };
      },
    });
    return Response.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
