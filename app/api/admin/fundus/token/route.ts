import { issueSignedToken } from "@vercel/blob";
import { handleUpload, handleUploadPresigned, type HandleUploadBody, type HandleUploadPresignedBody } from "@vercel/blob/client";
import { HttpError, requireAdmin } from "@/lib/auth/session";
import { fundusError } from "@/lib/fundus/api";
import { assertFundusKey } from "@/lib/fundus/upload";
import { extensionOf, FUNDUS_LIMITS, OWN_DOC_EXTENSIONS } from "@/lib/shared/fundus";
import { blobAuth, registerFile } from "@/lib/storage";

/**
 * Direkt-Upload eigener Fundus-Dateien in Vercel Blob (nur Kursleitung, nur `fundus/…`). Die Datei ist zunächst für
 * einen Tag vorgemerkt; erst „Speichern“ macht sie dauerhaft – abgebrochene Uploads räumt der Aufräumjob weg.
 */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const auth = blobAuth();
    if (!auth) throw new HttpError(400, "Es ist kein Blob-Speicher verbunden.");
    const admit = async (pathname: string) => {
      assertFundusKey(pathname);
      const ext = extensionOf(pathname);
      if (!OWN_DOC_EXTENSIONS[ext] && ext !== "eml") throw new HttpError(400, "Dieses Format geht im Fundus nicht (Word, Excel, PowerPoint, PDF und .eml).");
      await registerFile(pathname, "fundus", "application/octet-stream", 0, 1);
      return FUNDUS_LIMITS.fileBytes;
    };
    if (auth.kind === "token") {
      const body = (await request.json()) as HandleUploadBody;
      if (body.type !== "blob.generate-client-token") throw new HttpError(400, "Ungültige Anfrage.");
      const result = await handleUpload({
        body,
        request,
        token: auth.token,
        onBeforeGenerateToken: async (pathname) => ({ maximumSizeInBytes: await admit(pathname), addRandomSuffix: false, allowOverwrite: false }),
      });
      return Response.json(result);
    }
    const body = (await request.json()) as HandleUploadPresignedBody;
    if (body.type !== "blob.generate-presigned-url") throw new HttpError(400, "Ungültige Anfrage.");
    const result = await handleUploadPresigned({
      body,
      request,
      webhookPublicKey: process.env.BLOB_WEBHOOK_PUBLIC_KEY || "unused",
      getSignedToken: async (pathname) => {
        const maximumSizeInBytes = await admit(pathname);
        const validUntil = Date.now() + 60 * 60 * 1000;
        return {
          token: await issueSignedToken({ storeId: auth.storeId, pathname, operations: ["put"], validUntil, maximumSizeInBytes }),
          urlOptions: { validUntil, maximumSizeInBytes, addRandomSuffix: false, allowOverwrite: false },
        };
      },
    });
    return Response.json(result);
  } catch (err) {
    return fundusError(err);
  }
}
