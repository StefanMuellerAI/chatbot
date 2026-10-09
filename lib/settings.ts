import "server-only";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { type AppSettings, DEFAULT_SETTINGS } from "@/lib/shared/settings-defaults";

export { DEFAULT_NOTICE, DEFAULT_SETTINGS, type AppSettings } from "@/lib/shared/settings-defaults";

const KEY = "app";

/** Kurzlebiger In-Memory-Cache, damit nicht jede Anfrage die DB fragt. */
let cached: { value: AppSettings; at: number } | null = null;
const TTL_MS = 5_000;

export async function getSettings(opts: { fresh?: boolean } = {}): Promise<AppSettings> {
  if (!opts.fresh && cached && Date.now() - cached.at < TTL_MS) return cached.value;
  const db = await getDb();
  const rows = await db.select().from(schema.settings).where(eq(schema.settings.key, KEY)).limit(1);
  const value = withDefaults((rows[0]?.value ?? {}) as Partial<AppSettings>);
  cached = { value, at: Date.now() };
  return value;
}

function withDefaults(stored: Partial<AppSettings>): AppSettings {
  return {
    ...DEFAULT_SETTINGS,
    ...stored,
    features: { ...DEFAULT_SETTINGS.features, ...(stored.features ?? {}) },
  };
}

/**
 * Führt die Änderung atomar in der Datenbank zusammen (auch die Funktionsschalter einzeln),
 * damit parallele Änderungen von verschiedenen Server-Instanzen nichts überschreiben.
 */
export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const db = await getDb();
  const json = JSON.stringify(patch);
  const res = (await db.execute(sql`
    INSERT INTO settings (key, value, updated_at) VALUES (${KEY}, ${json}::jsonb, now())
    ON CONFLICT (key) DO UPDATE SET
      value = (settings.value || (EXCLUDED.value - 'features'))
        || CASE WHEN EXCLUDED.value -> 'features' IS NOT NULL
             THEN jsonb_build_object('features', coalesce(settings.value -> 'features', '{}'::jsonb) || (EXCLUDED.value -> 'features'))
             ELSE '{}'::jsonb END,
      updated_at = now()
    RETURNING value
  `)) as unknown as { rows?: { value: unknown }[] } | { value: unknown }[];
  const rows = Array.isArray(res) ? res : (res.rows ?? []);
  const raw = rows[0]?.value;
  const stored = (typeof raw === "string" ? JSON.parse(raw) : raw ?? {}) as Partial<AppSettings>;
  const value = withDefaults(stored);
  cached = { value, at: Date.now() };
  return value;
}

export function invalidateSettingsCache() {
  cached = null;
}
