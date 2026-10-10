import { createHash, randomUUID } from "node:crypto";
import { z } from "zod";
import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { extractDocument } from "@/lib/files/process";
import { categoryOf } from "@/lib/files/limits";
import { sniffImageMime } from "@/lib/files/sniff";
import { requireFeature } from "@/lib/guards";
import type { Attachment } from "@/lib/shared/types";
import { assertSafeKey, getFile, registerFile } from "@/lib/storage";

export const maxDuration = 120;

const Body = z.object({ key: z.string().max(300), name: z.string().min(1).max(300) });

/** Verarbeitet eine hochgeladene Datei: Prüfsumme, Textextraktion (mit Hash-Cache), Metadaten. */
export async function POST(request: Request) {
  try {
    await requireUser();
    const { key, name } = Body.parse(await request.json());
    assertSafeKey(key);
    if (!key.startsWith("uploads/")) throw new HttpError(400, "Ungültiger Pfad.");
    const category = categoryOf(key);
    if (category !== "image" && category !== "document") throw new HttpError(400, "Dateityp nicht unterstützt.");
    const settings = await requireFeature("uploads");
    const file = await getFile(key);
    if (!file) throw new HttpError(404, "Die hochgeladene Datei wurde nicht gefunden.");
    const sha256 = createHash("sha256").update(file.data).digest("hex");

    if (category === "image") {
      const mime = sniffImageMime(file.data);
      if (!mime) throw new HttpError(400, "Das Bild konnte nicht gelesen werden (PNG, JPG, WEBP oder GIF).");
      await registerFile(key, "image", mime, file.data.length, settings.fileRetentionDays);
      const attachment: Attachment = {
        id: randomUUID(),
        kind: "image",
        name,
        mime,
        size: file.data.length,
        sha256,
        storageKey: key,
        tokenEstimate: 1600,
      };
      return Response.json(attachment);
    }

    const mime = file.contentType || "application/octet-stream";
    const { text, tokens, cached } = await extractDocument(file.data, name, mime, { nativePdf: settings.nativePdf });
    await registerFile(key, "document", mime, file.data.length, settings.fileRetentionDays);
    const headers = { "X-Freebie-Cache": cached ? "hit" : "miss" };
    const attachment: Attachment = {
      id: randomUUID(),
      kind: "document",
      name,
      mime: name.toLowerCase().endsWith(".pdf") ? "application/pdf" : mime,
      size: file.data.length,
      sha256,
      storageKey: key,
      tokenEstimate: tokens,
      preview: text.slice(0, 600),
      // PDFs dürfen nativ ans Modell, wenn „PDF nativ“ an ist und das Modell es kann (entscheidet prepare.ts).
      native: name.toLowerCase().endsWith(".pdf") || undefined,
    };
    return Response.json(attachment, { headers });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
    return errorResponse(err);
  }
}
