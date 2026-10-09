import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";
import { inArray, lt } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";

export type StorageMode = "blob" | "local";

export function storageMode(): StorageMode {
  return process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "local";
}

function localRoot(): string {
  return process.env.FREEBIE_FILES_DIR || (process.env.VERCEL ? "/tmp/freebie-files" : "./.data/files");
}

/** Erlaubt nur sichere Schlüssel wie "uploads/<uuid>/name.pdf". */
export function assertSafeKey(key: string): void {
  if (!/^(uploads|images|audio)\/[a-zA-Z0-9-]{8,64}\/[a-zA-Z0-9_-][a-zA-Z0-9._-]{0,119}$/.test(key)) {
    throw new Error("Ungültiger Dateischlüssel");
  }
}

export function sanitizeFileName(name: string): string {
  const base = name.normalize("NFKD").replace(/[^\w.-]+/g, "_").replace(/_+/g, "_");
  return base.replace(/^[._]+/, "").slice(-100) || "datei";
}

export async function putFile(
  key: string,
  data: Buffer,
  contentType: string,
  kind: string,
  retentionDays: number,
): Promise<void> {
  assertSafeKey(key);
  if (storageMode() === "blob") {
    await put(key, data, {
      access: "private",
      contentType,
      addRandomSuffix: false,
      allowOverwrite: true,
    });
  } else {
    const file = path.join(localRoot(), key);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, data);
  }
  await registerFile(key, kind, contentType, data.length, retentionDays);
}

export async function registerFile(
  key: string,
  kind: string,
  mime: string,
  size: number,
  retentionDays: number,
): Promise<void> {
  const db = await getDb();
  const expiresAt = new Date(Date.now() + retentionDays * 86_400_000);
  await db
    .insert(schema.storedFiles)
    .values({ key, kind, mime, size, expiresAt })
    .onConflictDoUpdate({ target: schema.storedFiles.key, set: { expiresAt, size, mime } });
}

export async function getFile(key: string): Promise<{ data: Buffer; contentType: string } | null> {
  assertSafeKey(key);
  if (storageMode() === "blob") {
    const result = await get(key, { access: "private" });
    if (!result || result.statusCode !== 200) return null;
    const data = Buffer.from(await new Response(result.stream).arrayBuffer());
    return { data, contentType: result.blob.contentType };
  }
  try {
    const data = await readFile(path.join(localRoot(), key));
    const db = await getDb();
    const rows = await db
      .select({ mime: schema.storedFiles.mime })
      .from(schema.storedFiles)
      .where(inArray(schema.storedFiles.key, [key]))
      .limit(1);
    return { data, contentType: rows[0]?.mime ?? "application/octet-stream" };
  } catch {
    return null;
  }
}

export async function deleteFiles(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  if (storageMode() === "blob") {
    await del(keys);
  } else {
    await Promise.all(keys.map((k) => rm(path.join(localRoot(), k), { force: true })));
  }
  const db = await getDb();
  await db.delete(schema.storedFiles).where(inArray(schema.storedFiles.key, keys));
}

/** Löscht abgelaufene Dateien. Wird vom täglichen Cron-Job aufgerufen. */
export async function deleteExpiredFiles(): Promise<number> {
  const db = await getDb();
  const expired = await db
    .select({ key: schema.storedFiles.key })
    .from(schema.storedFiles)
    .where(lt(schema.storedFiles.expiresAt, new Date()))
    .limit(500);
  const keys = expired.map((r) => r.key);
  for (let i = 0; i < keys.length; i += 100) {
    await deleteFiles(keys.slice(i, i + 100));
  }
  return keys.length;
}
