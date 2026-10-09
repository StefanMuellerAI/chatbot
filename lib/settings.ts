import "server-only";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import type { FeatureFlags } from "@/lib/shared/types";

export interface AppSettings {
  features: FeatureFlags;
  imageModel: string;
  imageDefaultQuality: "low" | "medium" | "high";
  imageDefaultSize: "1024x1024" | "1536x1024" | "1024x1536";
  transcriptionModel: string;
  dictationModel: string;
  titleModelId: string;
  claudeCacheTtl: "5m" | "1h";
  answerCacheHours: number;
  fileRetentionDays: number;
  nativePdf: boolean;
  noticeText: string;
  noticeShort: string;
  paused: boolean;
  pausedMessage: string;
  systemPromptAddendum: string;
  /** Hash des im Admin gesetzten App-Passworts; null = Umgebungsvariable APP_PASSWORD. */
  appPasswordHash: string | null;
  /** Wird beim Passwortwechsel erhöht und meldet damit alle Sitzungen ab. */
  sessionVersion: number;
}

export const DEFAULT_NOTICE =
  "Freebie ist eine Spiel- und Übungsumgebung für unsere Schulungen. Alle Eingaben, Dateien und Sprachaufnahmen werden zur Verarbeitung an OpenAI und Anthropic in den USA übertragen. Die Anwendung läuft bei Vercel (USA). Identische Anfragen können zur Kostenersparnis aus einem gemeinsamen Zwischenspeicher beantwortet werden. Bitte gib keine personenbezogenen, vertraulichen oder geschäftskritischen Daten ein.";

export const DEFAULT_SETTINGS: AppSettings = {
  features: {
    webSearch: true,
    uploads: true,
    transcription: true,
    dictation: true,
    imageGeneration: true,
    artifacts: true,
    answerCache: true,
    showCacheBadge: true,
    showCost: false,
  },
  imageModel: "gpt-image-2",
  imageDefaultQuality: "medium",
  imageDefaultSize: "1024x1024",
  transcriptionModel: "gpt-transcribe",
  dictationModel: "gpt-transcribe",
  titleModelId: "claude-haiku-5-5",
  claudeCacheTtl: "5m",
  answerCacheHours: 24,
  fileRetentionDays: 7,
  nativePdf: false,
  noticeText: DEFAULT_NOTICE,
  noticeShort: "Spielumgebung – bitte keine vertraulichen oder personenbezogenen Daten eingeben.",
  paused: false,
  pausedMessage: "Freebie macht gerade eine kurze Pause. Bitte wende dich an die Kursleitung.",
  systemPromptAddendum: "",
  appPasswordHash: null,
  sessionVersion: 1,
};

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
