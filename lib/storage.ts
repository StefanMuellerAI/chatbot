import "server-only";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { del, get, put } from "@vercel/blob";
import { inArray, lt } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { HttpError } from "@/lib/errors";

export type StorageMode = "blob" | "local";

/**
 * Zugang zu Vercel Blob. Ältere Stores liefern einen Token (BLOB_READ_WRITE_TOKEN), neuere melden
 * sich per OIDC an (BLOB_STORE_ID + das Vercel-OIDC-Token der Anfrage). Beim Verbinden eines Stores
 * lässt sich in Vercel ein eigenes Präfix wählen – daher wird auch nach solchen Variablen gesucht.
 */
export type BlobAuth = { kind: "token"; token: string; source: string } | { kind: "oidc"; storeId: string; source: string };

export function blobAuth(env: Record<string, string | undefined> = process.env): BlobAuth | null {
  const value = (name: string) => env[name]?.trim() || undefined;
  const token = value("BLOB_READ_WRITE_TOKEN");
  if (token) return { kind: "token", token, source: "BLOB_READ_WRITE_TOKEN" };
  const storeId = value("BLOB_STORE_ID");
  if (storeId) return { kind: "oidc", storeId, source: "BLOB_STORE_ID" };
  const names = Object.keys(env).sort();
  const tokenVar = names.find((n) => n.endsWith("_READ_WRITE_TOKEN") && value(n)?.startsWith("vercel_blob_rw_"));
  if (tokenVar) return { kind: "token", token: value(tokenVar)!, source: tokenVar };
  const storeVars = names.filter((n) => n.endsWith("_STORE_ID") && value(n)?.startsWith("store_"));
  if (storeVars.length === 1) return { kind: "oidc", storeId: value(storeVars[0])!, source: storeVars[0] };
  return null;
}

/** Zugangsdaten explizit an das SDK geben (wichtig bei Variablen mit eigenem Präfix). */
function blobOptions(): { token?: string; storeId?: string } {
  const auth = blobAuth();
  if (!auth) return {};
  return auth.kind === "token" ? { token: auth.token } : { storeId: auth.storeId };
}

export function storageMode(): StorageMode {
  return blobAuth() ? "blob" : "local";
}

/** Wie der Browser in Blob hochlädt: mit Client-Token (Token-Stores) oder vorsignierter URL (OIDC-Stores). */
export function blobUploadMode(): "token" | "presigned" | null {
  const auth = blobAuth();
  return auth ? (auth.kind === "token" ? "token" : "presigned") : null;
}

function localRoot(): string {
  return process.env.FREEBIE_FILES_DIR || (process.env.VERCEL ? "/tmp/freebie-files" : "./.data/files");
}

/** Erlaubt nur sichere Schlüssel wie "uploads/<uuid>/name.pdf". */
export function assertSafeKey(key: string): void {
  if (!/^(uploads|images|audio)\/[a-zA-Z0-9-]{8,64}\/[a-zA-Z0-9_-][a-zA-Z0-9._-]{0,119}$/.test(key)) {
    throw new HttpError(400, "Ungültiger Dateipfad.");
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
      ...blobOptions(),
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
    const result = await get(key, { ...blobOptions(), access: "private" });
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
    await del(keys, blobOptions());
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
