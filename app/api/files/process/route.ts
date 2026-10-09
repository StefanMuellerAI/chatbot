import { createHash, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { estimateTokens, extractText } from "@/lib/files/extract";
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

    const db = await getDb();
    const cached = await db.select().from(schema.fileCache).where(eq(schema.fileCache.sha256, sha256)).limit(1);
    let text: string;
    let tokens: number;
    const mime = file.contentType || "application/octet-stream";
    if (cached[0]) {
      text = cached[0].extractedText;
      tokens = cached[0].tokenEstimate;
      // Erneut genutzt: Aufbewahrungsfrist beginnt von vorn.
      await db.update(schema.fileCache).set({ createdAt: new Date() }).where(eq(schema.fileCache.sha256, sha256));
    } else {
      const isPdf = name.toLowerCase().endsWith(".pdf");
      try {
        text = await extractText(file.data, name, mime);
      } catch (err) {
        // Eingescannte PDFs ohne Textebene: mit „PDF nativ“ kann das Modell sie trotzdem lesen.
        if (!(isPdf && settings.nativePdf && err instanceof HttpError && err.message.startsWith("In der Datei wurde kein lesbarer Text"))) throw err;
        text = "[Eingescanntes PDF ohne Textebene – nur für Modelle mit nativer PDF-Verarbeitung lesbar.]";
      }
      tokens = estimateTokens(text);
      await db
        .insert(schema.fileCache)
        .values({ sha256, kind: "document", mime, extractedText: text, tokenEstimate: tokens })
        .onConflictDoNothing();
    }
    await registerFile(key, "document", mime, file.data.length, settings.fileRetentionDays);
    const headers = { "X-Freebie-Cache": cached[0] ? "hit" : "miss" };
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
