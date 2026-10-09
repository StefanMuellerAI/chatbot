import { createHash, randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { splitAudio } from "@/lib/audio/ffmpeg";
import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { categoryOf } from "@/lib/files/limits";
import { requireFeature } from "@/lib/guards";
import { transcriptAttachment } from "@/lib/audio/attachment";
import { assertSafeKey, getFile, putFile, registerFile } from "@/lib/storage";

export const maxDuration = 300;

const Body = z.object({ key: z.string().max(300), name: z.string().min(1).max(300) });

/** Schritt 1: Cache prüfen, sonst Audio umwandeln und in Abschnitte teilen. */
export async function POST(request: Request) {
  try {
    await requireUser();
    const settings = await requireFeature("transcription");
    const { key, name } = Body.parse(await request.json());
    assertSafeKey(key);
    if (!key.startsWith("uploads/") || categoryOf(key) !== "audio") throw new HttpError(400, "Keine Audiodatei.");
    const file = await getFile(key);
    if (!file) throw new HttpError(404, "Die Audiodatei wurde nicht gefunden.");
    await registerFile(key, "audio", file.contentType, file.data.length, settings.fileRetentionDays);
    const sha256 = createHash("sha256").update(file.data).digest("hex");
    const model = settings.transcriptionModel;
    const db = await getDb();

    const cached = await db
      .select()
      .from(schema.transcriptCache)
      .where(and(eq(schema.transcriptCache.sha256, sha256), eq(schema.transcriptCache.model, model)))
      .limit(1);
    if (cached[0]) {
      await db
        .insert(schema.fileCache)
        .values({
          sha256,
          kind: "transcript",
          mime: "text/plain",
          extractedText: cached[0].text,
          tokenEstimate: Math.ceil(cached[0].text.length / 3.5),
        })
        .onConflictDoNothing();
      return Response.json({ done: true, cached: true, attachment: transcriptAttachment(sha256, key, name, cached[0].text) });
    }

    const { chunks, durationSec } = await splitAudio(file.data, name);
    const jobId = randomUUID();
    const chunkKeys: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunkKey = `audio/${jobId}/teil-${String(i).padStart(3, "0")}.mp3`;
      await putFile(chunkKey, chunks[i], "audio/mpeg", "audio-chunk", 1);
      chunkKeys.push(chunkKey);
    }
    await db.insert(schema.transcriptionJobs).values({
      id: jobId,
      sha256,
      model,
      sourceKey: key,
      chunkKeys,
      chunkTexts: chunkKeys.map(() => null),
      durationSec,
    });
    return Response.json({ done: false, jobId, chunks: chunkKeys.length, durationSec });
  } catch (err) {
    return errorResponse(err);
  }
}
