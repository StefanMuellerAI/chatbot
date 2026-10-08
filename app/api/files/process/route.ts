import { createHash, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { estimateTokens, extractText } from "@/lib/files/extract";
import { categoryOf } from "@/lib/files/limits";
import { sniffImageMime } from "@/lib/files/sniff";
import { getSettings } from "@/lib/settings";
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
    const file = await getFile(key);
    if (!file) throw new HttpError(404, "Die hochgeladene Datei wurde nicht gefunden.");
    const settings = await getSettings();
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
    } else {
      try {
        text = await extractText(file.data, name, mime);
      } catch (err) {
        throw new HttpError(422, err instanceof Error ? err.message : "Die Datei konnte nicht gelesen werden.");
      }
      tokens = estimateTokens(text);
      await db
        .insert(schema.fileCache)
        .values({ sha256, kind: "document", mime, extractedText: text, tokenEstimate: tokens })
        .onConflictDoNothing();
    }
    await registerFile(key, "document", mime, file.data.length, settings.fileRetentionDays);
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
    };
    return Response.json(attachment);
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
    return errorResponse(err);
  }
}
