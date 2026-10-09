import "server-only";
import { createHash } from "node:crypto";
import { and, eq, gt, lt, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import type { ChatMessage, Citation, NativeTurn, UsageInfo } from "@/lib/shared/types";

export const ANSWER_CACHE_VERSION = 1;

export interface CachedAnswer {
  text: string;
  thinking: string;
  citations: Citation[];
  native?: NativeTurn;
  stopReason: string;
}

/** Stabile JSON-Serialisierung mit sortierten Schlüsseln. */
export function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
  return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(",")}}`;
}

/**
 * Schlüssel aus allem, was die Antwort beeinflusst: Modell (inkl. Einstellungen aus dem Admin),
 * System-Prompt-Version, Vorlage, Tool-Set und der komplette bisherige Verlauf (inkl. Datum, Effort,
 * Websuche, Datei-Hashes). Ändert der Admin etwa Bildverständnis oder Effort-Werte, gibt es neue Antworten.
 */
export function answerCacheKey(input: {
  modelRowId: string;
  apiModelId: string;
  /** Fähigkeiten, Effort-Zuordnung und Ausgabegrenze des Modells sowie „PDF nativ“. */
  modelConfig?: unknown;
  systemVersion: string;
  presetVersion: string | null;
  tools: { webSearch: boolean; generateImage: boolean };
  messages: ChatMessage[];
}): string {
  const history = input.messages.map((m) =>
    m.role === "user"
      ? {
          r: "u",
          t: m.text,
          d: m.contextDate ?? null,
          e: m.effort ?? "medium",
          w: m.webSearch ?? true,
          a: (m.attachments ?? []).map((a) => ({ k: a.kind, s: a.sha256, n: Boolean(a.native) })),
        }
      : { r: "a", t: m.text, m: m.modelId ?? null },
  );
  const payload = canonicalJson({
    v: ANSWER_CACHE_VERSION,
    model: [input.modelRowId, input.apiModelId],
    config: input.modelConfig ?? null,
    system: input.systemVersion,
    preset: input.presetVersion,
    tools: input.tools,
    history,
  });
  return createHash("sha256").update(payload).digest("hex");
}

export async function lookupAnswer(
  key: string,
): Promise<{ answer: CachedAnswer; usage: UsageInfo; costUsd: number } | null> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.answerCache)
    .where(and(eq(schema.answerCache.keyHash, key), gt(schema.answerCache.expiresAt, new Date())))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  await db
    .update(schema.answerCache)
    .set({ hits: sql`${schema.answerCache.hits} + 1` })
    .where(eq(schema.answerCache.keyHash, key));
  return { answer: row.answer as CachedAnswer, usage: row.usage as UsageInfo, costUsd: row.costUsd };
}

export async function storeAnswer(
  key: string,
  modelId: string,
  answer: CachedAnswer,
  usage: UsageInfo,
  costUsd: number,
  hours: number,
): Promise<void> {
  const db = await getDb();
  const expiresAt = new Date(Date.now() + hours * 3_600_000);
  // Die erste Antwort bleibt die gemeinsame – nur abgelaufene Einträge (vom Aufräumjob noch
  // nicht gelöscht) werden ersetzt, sonst ließe sich der Cache bis dahin nicht neu füllen.
  await db
    .insert(schema.answerCache)
    .values({ keyHash: key, modelId, answer, usage, costUsd, expiresAt })
    .onConflictDoUpdate({
      target: schema.answerCache.keyHash,
      set: { modelId, answer, usage, costUsd, expiresAt, hits: 0, createdAt: new Date() },
      setWhere: lt(schema.answerCache.expiresAt, new Date()),
    });
}

export async function deleteExpiredAnswers(): Promise<void> {
  const db = await getDb();
  await db.delete(schema.answerCache).where(lt(schema.answerCache.expiresAt, new Date()));
}
