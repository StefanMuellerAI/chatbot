import { issueSignedToken } from "@vercel/blob";
import { handleUpload, handleUploadPresigned, type HandleUploadBody, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { categoryOf, maxBytesFor } from "@/lib/files/limits";
import { requireFeature } from "@/lib/guards";
import { assertSafeKey, blobAuth, registerFile } from "@/lib/storage";

/**
 * Erlaubt Direkt-Uploads vom Browser in Vercel Blob: per Client-Token (Stores mit
 * BLOB_READ_WRITE_TOKEN) oder per vorsignierter URL (Stores mit OIDC-Anmeldung).
 */
export async function POST(request: Request) {
  try {
    await requireUser();
    const auth = blobAuth();
    if (!auth) throw new HttpError(400, "Es ist kein Blob-Speicher verbunden.");

    // Prüft den Pfad und merkt die Datei schon jetzt vor, damit auch nie verarbeitete Uploads fristgerecht gelöscht werden.
    const admit = async (pathname: string) => {
      assertSafeKey(pathname);
      if (!pathname.startsWith("uploads/")) throw new HttpError(400, "Ungültiger Upload-Pfad.");
      const category = categoryOf(pathname);
      if (!category) throw new HttpError(400, "Dieses Dateiformat wird nicht unterstützt.");
      const settings = await requireFeature(category === "audio" ? "transcription" : "uploads");
      await registerFile(pathname, category, "application/octet-stream", 0, settings.fileRetentionDays);
      return maxBytesFor(category);
    };

    if (auth.kind === "token") {
      const body = (await request.json()) as HandleUploadBody;
      if (body.type !== "blob.generate-client-token") throw new HttpError(400, "Ungültige Anfrage.");
      const result = await handleUpload({
        body,
        request,
        token: auth.token,
        onBeforeGenerateToken: async (pathname) => ({
          maximumSizeInBytes: await admit(pathname),
          addRandomSuffix: false,
          allowOverwrite: true,
        }),
      });
      return Response.json(result);
    }

    const body = (await request.json()) as HandleUploadPresignedBody;
    // Upload-Rückmeldungen (Webhooks) nutzt Freebie nicht – nur URLs ausstellen.
    if (body.type !== "blob.generate-presigned-url") throw new HttpError(400, "Ungültige Anfrage.");
    const result = await handleUploadPresigned({
      body,
      request,
      // Wird nur zum Prüfen von Webhooks gebraucht, die hier nie ankommen; das SDK verlangt ihn trotzdem.
      webhookPublicKey: process.env.BLOB_WEBHOOK_PUBLIC_KEY || "unused",
      getSignedToken: async (pathname) => {
        const maximumSizeInBytes = await admit(pathname);
        const validUntil = Date.now() + 60 * 60 * 1000;
        return {
          token: await issueSignedToken({ storeId: auth.storeId, pathname, operations: ["put"], validUntil, maximumSizeInBytes }),
          urlOptions: { validUntil, maximumSizeInBytes, addRandomSuffix: false, allowOverwrite: true },
        };
      },
    });
    return Response.json(result);
  } catch (err) {
    return errorResponse(err);
  }
}
