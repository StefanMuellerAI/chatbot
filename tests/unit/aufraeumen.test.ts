import { existsSync } from "node:fs";
import path from "node:path";
import { eq, inArray } from "drizzle-orm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/cron/cleanup/route";
import { getDb, schema } from "@/lib/db/client";
import { getSettings } from "@/lib/settings";
import { putFile } from "@/lib/storage";

const DAY = 86_400_000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY);
const uid = () => Math.random().toString(36).slice(2, 12);
const cron = (authorization?: string) =>
  GET(new Request("http://localhost/api/cron/cleanup", { headers: authorization === undefined ? {} : { authorization } }));

describe("Aufräumjob", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("U05 ohne gesetztes CRON_SECRET lehnt er jeden Aufruf ab", async () => {
    vi.stubEnv("CRON_SECRET", "");
    for (const auth of [undefined, "", "Bearer ", "Bearer undefined"]) expect((await cron(auth)).status, String(auth)).toBe(401);
  });

  it("U05/Q13 löscht abgelaufene Dateien, ausgelesene Texte, Transkripte und alte Aufträge – Neueres bleibt", async () => {
    vi.stubEnv("CRON_SECRET", "geheim-fuer-den-aufraeumtest");
    const db = await getDb();
    const { fileRetentionDays } = await getSettings({ fresh: true });
    const oldKey = `uploads/${uid()}/alt.txt`;
    const newKey = `uploads/${uid()}/neu.txt`;
    await putFile(oldKey, Buffer.from("alt"), "text/plain", "document", fileRetentionDays);
    await putFile(newKey, Buffer.from("neu"), "text/plain", "document", fileRetentionDays);
    await db.update(schema.storedFiles).set({ expiresAt: daysAgo(1) }).where(eq(schema.storedFiles.key, oldKey));
    const [oldSha, newSha] = [uid(), uid()];
    // Ein Tag vor bzw. nach Ablauf der Frist.
    const [expired, recent] = [daysAgo(fileRetentionDays + 1), daysAgo(fileRetentionDays - 1)];
    await db.insert(schema.fileCache).values([
      { sha256: oldSha, kind: "document", mime: "text/plain", extractedText: "alt", createdAt: expired },
      { sha256: newSha, kind: "document", mime: "text/plain", extractedText: "neu", createdAt: recent },
    ]);
    await db.insert(schema.transcriptCache).values([
      { sha256: oldSha, model: "whisper", text: "alt", createdAt: expired },
      { sha256: newSha, model: "whisper", text: "neu", createdAt: recent },
    ]);
    const [oldJob, newJob] = [uid(), uid()];
    await db.insert(schema.transcriptionJobs).values([
      { id: oldJob, sha256: oldSha, model: "whisper", sourceKey: oldKey, chunkKeys: [], chunkTexts: [], createdAt: daysAgo(2) },
      { id: newJob, sha256: newSha, model: "whisper", sourceKey: newKey, chunkKeys: [], chunkTexts: [], createdAt: new Date() },
    ]);

    const res = await cron("Bearer geheim-fuer-den-aufraeumtest");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, deletedFiles: 1, deletedTexts: 1, deletedTranscripts: 1 });

    const root = process.env.FREEBIE_FILES_DIR!;
    expect(existsSync(path.join(root, oldKey))).toBe(false);
    expect(existsSync(path.join(root, newKey))).toBe(true);
    const keys = (await db.select({ key: schema.storedFiles.key }).from(schema.storedFiles).where(inArray(schema.storedFiles.key, [oldKey, newKey]))).map((r) => r.key);
    expect(keys).toEqual([newKey]);
    const texts = await db.select({ sha: schema.fileCache.sha256 }).from(schema.fileCache).where(inArray(schema.fileCache.sha256, [oldSha, newSha]));
    expect(texts.map((r) => r.sha)).toEqual([newSha]);
    const transcripts = await db.select({ sha: schema.transcriptCache.sha256 }).from(schema.transcriptCache).where(inArray(schema.transcriptCache.sha256, [oldSha, newSha]));
    expect(transcripts.map((r) => r.sha)).toEqual([newSha]);
    const jobs = await db.select({ id: schema.transcriptionJobs.id }).from(schema.transcriptionJobs).where(inArray(schema.transcriptionJobs.id, [oldJob, newJob]));
    expect(jobs.map((r) => r.id)).toEqual([newJob]);
  });
});
