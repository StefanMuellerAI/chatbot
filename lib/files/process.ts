import "server-only";
import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { HttpError } from "@/lib/errors";
import { estimateTokens, extractText } from "./extract";

export interface ExtractedDocument {
  sha256: string;
  text: string;
  tokens: number;
  /** Text kam aus dem Datei-Cache (gleiche Prüfsumme schon einmal ausgelesen). */
  cached: boolean;
}

/** Liest den Text eines Dokuments aus – mit Datei-Cache über die Prüfsumme (Uploads und Fundus). */
export async function extractDocument(data: Buffer, name: string, mime: string, opts: { nativePdf: boolean }): Promise<ExtractedDocument> {
  const sha256 = createHash("sha256").update(data).digest("hex");
  const db = await getDb();
  const cached = await db.select().from(schema.fileCache).where(eq(schema.fileCache.sha256, sha256)).limit(1);
  if (cached[0]) {
    // Erneut genutzt: Aufbewahrungsfrist beginnt von vorn.
    await db.update(schema.fileCache).set({ createdAt: new Date() }).where(eq(schema.fileCache.sha256, sha256));
    return { sha256, text: cached[0].extractedText, tokens: cached[0].tokenEstimate, cached: true };
  }
  const isPdf = name.toLowerCase().endsWith(".pdf");
  let text: string;
  try {
    text = await extractText(data, name, mime);
  } catch (err) {
    // Eingescannte PDFs ohne Textebene: mit „PDF nativ“ kann das Modell sie trotzdem lesen.
    if (!(isPdf && opts.nativePdf && err instanceof HttpError && err.message.startsWith("In der Datei wurde kein lesbarer Text"))) throw err;
    text = "[Eingescanntes PDF ohne Textebene – nur für Modelle mit nativer PDF-Verarbeitung lesbar.]";
  }
  const tokens = estimateTokens(text);
  await db.insert(schema.fileCache).values({ sha256, kind: "document", mime, extractedText: text, tokenEstimate: tokens }).onConflictDoNothing();
  return { sha256, text, tokens, cached: false };
}
