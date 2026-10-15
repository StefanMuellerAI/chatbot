import { issueSignedToken } from "@vercel/blob";
import { handleUpload, handleUploadPresigned, type HandleUploadBody, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { categoryOf, maxBytesFor, unsupportedMessage } from "@/lib/files/limits";
import { requireFeature } from "@/lib/guards";
import { assertSafeKey, blobAuth, claimUploadKey } from "@/lib/storage";

/**
 * Erlaubt Direkt-Uploads vom Browser in Vercel Blob: per Client-Token (Stores mit
 * BLOB_READ_WRITE_TOKEN) oder per vorsignierter URL (Stores mit OIDC-Anmeldung).
 */
export async function POST(request: Request) {
  try {
    await requireUser();
    const auth = blobAuth();
    if (!auth) throw new HttpError(400, "Es ist kein Blob-Speicher verbunden.");

    // Prüft den Pfad und reserviert ihn: nur ein Token je Pfad (kein Überschreiben fremder Dateien). Die Datei ist damit
    // schon vorgemerkt, sodass auch nie verarbeitete Uploads fristgerecht gelöscht werden. „allowOverwrite“ bleibt an,
    // damit Wiederholungen des SDK für denselben Upload nicht scheitern – das Token gilt nur für diesen einen Pfad.
    const admit = async (pathname: string) => {
      assertSafeKey(pathname);
      if (!pathname.startsWith("uploads/")) throw new HttpError(400, "Ungültiger Upload-Pfad.");
      const category = categoryOf(pathname);
      if (!category) throw new HttpError(400, unsupportedMessage(pathname));
      const settings = await requireFeature(category === "audio" ? "transcription" : "uploads");
      await claimUploadKey(pathname, category, settings.fileRetentionDays);
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
