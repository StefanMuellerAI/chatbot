import "server-only";
import { eq } from "drizzle-orm";
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

export async function getSettings(): Promise<AppSettings> {
  if (cached && Date.now() - cached.at < TTL_MS) return cached.value;
  const db = await getDb();
  const rows = await db.select().from(schema.settings).where(eq(schema.settings.key, KEY)).limit(1);
  const stored = (rows[0]?.value ?? {}) as Partial<AppSettings>;
  const value: AppSettings = {
    ...DEFAULT_SETTINGS,
    ...stored,
    features: { ...DEFAULT_SETTINGS.features, ...(stored.features ?? {}) },
  };
  cached = { value, at: Date.now() };
  return value;
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const next: AppSettings = {
    ...current,
    ...patch,
    features: { ...current.features, ...(patch.features ?? {}) },
  };
  const db = await getDb();
  await db
    .insert(schema.settings)
    .values({ key: KEY, value: next, updatedAt: new Date() })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: next, updatedAt: new Date() } });
  cached = { value: next, at: Date.now() };
  return next;
}

export function invalidateSettingsCache() {
  cached = null;
}
