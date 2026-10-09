import type { PreparedMessage } from "@/lib/chat/prepare";
import type { ModelRow } from "@/lib/models";
import type { Citation, GeneratedImage, NativeTurn, StreamEvent, UsageInfo } from "@/lib/shared/types";

export interface ToolSet {
  webSearch: boolean;
  generateImage: boolean;
}

export interface ImageToolInput {
  prompt: string;
  size: "1024x1024" | "1536x1024" | "1024x1536";
  quality: "low" | "medium" | "high";
  reference_image_ids: string[];
}

export type ToolExecutor = (input: ImageToolInput) => Promise<
  { ok: true; image: GeneratedImage } | { ok: false; error: string }
>;

export interface ProviderRequest {
  model: ModelRow;
  systemPrompt: string;
  presetPrompt: string | null;
  messages: PreparedMessage[];
  tools: ToolSet;
  cacheTtl: "5m" | "1h";
  /** Stabiler Schlüssel pro Gespräch (OpenAI prompt_cache_key). */
  conversationKey: string;
  signal: AbortSignal;
  generateImage: ToolExecutor;
  emit: (event: StreamEvent) => void;
}

export interface ProviderResult {
  text: string;
  thinking: string;
  citations: Citation[];
  images: GeneratedImage[];
  native?: NativeTurn;
  usage: UsageInfo;
  stopReason: string;
  fallbackModel?: string;
  /** Zusätzliche Kosten außerhalb der Token (z. B. Websuchen) in USD. */
  extraCostUsd: number;
}

export const IMAGE_TOOL_NAME = "generate_image";

export const IMAGE_TOOL_DESCRIPTION =
  "Erzeugt ein Bild mit einem Bildgenerierungsmodell und zeigt es der Nutzerin bzw. dem Nutzer an. " +
  "Nutze es nur, wenn ausdrücklich ein Bild, Foto, eine Illustration oder ein Logo-Konzept gewünscht ist. " +
  "Der Prompt sollte ausführlich und auf Englisch sein (Motiv, Stil, Komposition, Licht, Farben). " +
  "Für die Bearbeitung hochgeladener Bilder deren Bild-IDs in reference_image_ids übergeben, sonst eine leere Liste.";

/** JSON-Schema des Bild-Tools – für beide Anbieter identisch und strikt. */
export const IMAGE_TOOL_SCHEMA = {
  type: "object",
  properties: {
    prompt: { type: "string", description: "Ausführlicher englischer Bild-Prompt." },
    size: {
      type: "string",
      enum: ["1024x1024", "1536x1024", "1024x1536"],
      description: "Quadratisch, Querformat oder Hochformat.",
    },
    quality: {
      type: "string",
      enum: ["low", "medium", "high"],
      description: "Bildqualität. Standard ist medium.",
    },
    reference_image_ids: {
      type: "array",
      items: { type: "string" },
      description: "Bild-IDs hochgeladener Referenzbilder oder leere Liste.",
    },
  },
  required: ["prompt", "size", "quality", "reference_image_ids"],
  additionalProperties: false,
} as const;

export function emptyUsage(): UsageInfo {
  return { inputTokens: 0, outputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, webSearches: 0 };
}

export function addUsage(a: UsageInfo, b: Partial<UsageInfo>): UsageInfo {
  return {
    inputTokens: a.inputTokens + (b.inputTokens ?? 0),
    outputTokens: a.outputTokens + (b.outputTokens ?? 0),
    cacheReadTokens: a.cacheReadTokens + (b.cacheReadTokens ?? 0),
    cacheWriteTokens: a.cacheWriteTokens + (b.cacheWriteTokens ?? 0),
    webSearches: (a.webSearches ?? 0) + (b.webSearches ?? 0),
  };
}

/** Max-Output-Tokens je Effort-Stufe (gedeckelt durch das Modell). */
export function maxTokensFor(effort: string, modelMax: number): number {
  const byEffort: Record<string, number> = { low: 16000, medium: 32000, high: 64000, max: 64000 };
  return Math.min(byEffort[effort] ?? 32000, modelMax);
}

export class ProviderError extends Error {
  constructor(
    message: string,
    public userMessage: string,
  ) {
    super(message);
  }
}
