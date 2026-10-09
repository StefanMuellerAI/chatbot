import "server-only";
import { HttpError } from "@/lib/errors";
import { providerConfigured } from "@/lib/models";
import { type AppSettings, getSettings } from "@/lib/settings";
import type { FeatureFlags } from "@/lib/shared/types";

type GuardedFeature = "uploads" | "transcription" | "dictation" | "imageGeneration";

export const FEATURE_OFF_MESSAGE: Record<GuardedFeature, string> = {
  uploads: "Datei-Uploads sind deaktiviert.",
  transcription: "Die Transkription ist deaktiviert.",
  dictation: "Die Spracheingabe ist deaktiviert.",
  imageGeneration: "Die Bildgenerierung ist deaktiviert.",
};

/** Funktionen, die über OpenAI laufen (Bilder, Transkription, Diktat). */
const NEEDS_OPENAI: Partial<Record<keyof FeatureFlags, true>> = { transcription: true, dictation: true, imageGeneration: true };

/**
 * Prüft serverseitig Not-Aus, Funktionsschalter und – wo nötig – den OpenAI-Schlüssel.
 * Damit gilt jede Einstellung auch dann, wenn jemand die Oberfläche umgeht.
 */
export async function requireFeature(feature: GuardedFeature): Promise<AppSettings> {
  const settings = await getSettings();
  if (settings.paused) throw new HttpError(503, settings.pausedMessage);
  if (!settings.features[feature]) throw new HttpError(403, FEATURE_OFF_MESSAGE[feature]);
  if (NEEDS_OPENAI[feature] && process.env.FREEBIE_MOCK !== "1" && !providerConfigured("openai")) {
    throw new HttpError(503, "Für OpenAI ist noch kein API-Schlüssel hinterlegt.");
  }
  return settings;
}
