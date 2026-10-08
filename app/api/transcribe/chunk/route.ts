import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { transcribeBuffer } from "@/lib/audio/transcribe";
import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { getFile } from "@/lib/storage";

export const maxDuration = 300;

const Body = z.object({ jobId: z.string().uuid(), index: z.number().int().min(0).max(1000) });

/** Schritt 2: Einen Abschnitt transkribieren. Der Browser ruft mehrere parallel auf. */
export async function POST(request: Request) {
  try {
    await requireUser();
    const { jobId, index } = Body.parse(await request.json());
    const db = await getDb();
    const rows = await db.select().from(schema.transcriptionJobs).where(eq(schema.transcriptionJobs.id, jobId)).limit(1);
    const job = rows[0];
    if (!job) throw new HttpError(404, "Transkriptionsauftrag nicht gefunden.");
    const keys = job.chunkKeys as string[];
    const texts = job.chunkTexts as (string | null)[];
    if (index >= keys.length) throw new HttpError(400, "Ungültiger Abschnitt.");
    if (typeof texts[index] === "string") return Response.json({ ok: true, cached: true });
    const file = await getFile(keys[index]);
    if (!file) throw new HttpError(404, "Abschnitt nicht gefunden.");
    const text = await transcribeBuffer(file.data, `teil-${index}.mp3`, "audio/mpeg", job.model);
    // Atomares Setzen eines Array-Elements – parallele Abschnitte überschreiben sich nicht.
    await db
      .update(schema.transcriptionJobs)
      .set({
        chunkTexts: sql`jsonb_set(${schema.transcriptionJobs.chunkTexts}, ${`{${index}}`}::text[], to_jsonb(${text}::text))`,
      })
      .where(eq(schema.transcriptionJobs.id, jobId));
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
    return errorResponse(err);
  }
}
