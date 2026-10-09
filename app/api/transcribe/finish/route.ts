import { eq } from "drizzle-orm";
import { z } from "zod";
import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { deleteFiles } from "@/lib/storage";
import { logUsage, TRANSCRIPTION_PRICE_PER_MIN } from "@/lib/usage";
import { transcriptAttachment } from "@/lib/audio/attachment";

const Body = z.object({ jobId: z.string().uuid(), name: z.string().min(1).max(300) });

/** Schritt 3: Abschnitte zusammenfügen, Transkript cachen, Zwischenstände löschen. */
export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const { jobId, name } = Body.parse(await request.json());
    const db = await getDb();
    const rows = await db.select().from(schema.transcriptionJobs).where(eq(schema.transcriptionJobs.id, jobId)).limit(1);
    const job = rows[0];
    if (!job) throw new HttpError(404, "Transkriptionsauftrag nicht gefunden.");
    const texts = job.chunkTexts as (string | null)[];
    const missing = texts.findIndex((t) => typeof t !== "string");
    if (missing !== -1) throw new HttpError(409, `Abschnitt ${missing + 1} ist noch nicht fertig.`);
    const text = (texts as string[]).map((t) => t.trim()).filter(Boolean).join("\n\n");

    await db
      .insert(schema.transcriptCache)
      .values({ sha256: job.sha256, model: job.model, text, durationSec: job.durationSec })
      .onConflictDoNothing();
    await db
      .insert(schema.fileCache)
      .values({ sha256: job.sha256, kind: "transcript", mime: "text/plain", extractedText: text, tokenEstimate: Math.ceil(text.length / 3.5) })
      .onConflictDoNothing();
    await deleteFiles(job.chunkKeys as string[]);
    await db.delete(schema.transcriptionJobs).where(eq(schema.transcriptionJobs.id, jobId));

    const minutes = job.durationSec / 60;
    await logUsage({
      sessionHash: session.sessionHash,
      modelId: job.model,
      feature: "transcription",
      units: minutes,
      costUsd: process.env.FREEBIE_MOCK === "1" ? 0 : minutes * (TRANSCRIPTION_PRICE_PER_MIN[job.model] ?? 0.006),
    });
    return Response.json({ attachment: transcriptAttachment(job.sha256, job.sourceKey, name, text) });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
    return errorResponse(err);
  }
}
