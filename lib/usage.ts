import "server-only";
import { getDb, schema } from "@/lib/db/client";
import type { ModelRow } from "@/lib/models";
import type { UsageInfo } from "@/lib/shared/types";

export interface Prices {
  priceIn: number;
  priceOut: number;
  priceCacheRead: number;
  priceCacheWrite: number;
}

/** Kosten in USD aus Token-Zählung und Preisen pro 1 Mio. Tokens. */
export function costOf(usage: UsageInfo, p: Prices): number {
  return (
    (usage.inputTokens * p.priceIn +
      usage.outputTokens * p.priceOut +
      usage.cacheReadTokens * p.priceCacheRead +
      usage.cacheWriteTokens * p.priceCacheWrite) /
    1_000_000
  );
}

/** Ersparnis durch Prompt Caching: gelesene Tokens hätten sonst den vollen Input-Preis gekostet. */
export function promptCacheSavings(usage: UsageInfo, p: Prices): number {
  return (usage.cacheReadTokens * Math.max(0, p.priceIn - p.priceCacheRead)) / 1_000_000;
}

export async function logUsage(entry: {
  sessionHash: string;
  modelId: string;
  feature: "chat" | "title" | "image" | "transcription" | "dictation";
  usage?: UsageInfo;
  units?: number;
  costUsd: number;
  savedUsd?: number;
  answerCacheHit?: boolean;
}): Promise<void> {
  try {
    const db = await getDb();
    await db.insert(schema.usageLog).values({
      sessionHash: entry.sessionHash,
      modelId: entry.modelId,
      feature: entry.feature,
      inputTokens: entry.usage?.inputTokens ?? 0,
      outputTokens: entry.usage?.outputTokens ?? 0,
      cacheReadTokens: entry.usage?.cacheReadTokens ?? 0,
      cacheWriteTokens: entry.usage?.cacheWriteTokens ?? 0,
      units: entry.units ?? 0,
      costUsd: entry.costUsd,
      savedUsd: entry.savedUsd ?? 0,
      answerCacheHit: entry.answerCacheHit ?? false,
    });
  } catch (err) {
    // Statistik darf den Chat nie blockieren.
    console.error("usage log failed", err);
  }
}

export function modelPrices(model: ModelRow): Prices {
  return {
    priceIn: model.priceIn,
    priceOut: model.priceOut,
    priceCacheRead: model.priceCacheRead,
    priceCacheWrite: model.priceCacheWrite,
  };
}

/** Preise für Bilder (USD pro Bild, grob nach OpenAI-Leitfaden) und Transkription (pro Minute). */
export const IMAGE_PRICES: Record<string, Record<string, number>> = {
  low: { "1024x1024": 0.006, "1536x1024": 0.005, "1024x1536": 0.005 },
  medium: { "1024x1024": 0.053, "1536x1024": 0.041, "1024x1536": 0.041 },
  high: { "1024x1024": 0.211, "1536x1024": 0.165, "1024x1536": 0.165 },
};

export const TRANSCRIPTION_PRICE_PER_MIN: Record<string, number> = {
  "gpt-transcribe": 0.0045,
  "gpt-4o-transcribe": 0.006,
  "gpt-4o-mini-transcribe": 0.003,
  "whisper-1": 0.006,
};
