// Typen, die Browser und Server gemeinsam nutzen.

export type Provider = "anthropic" | "openai" | "mock";

export type Effort = "low" | "medium" | "high" | "max";

export const EFFORT_LEVELS: { value: Effort; label: string; hint: string }[] = [
  { value: "low", label: "Niedrig", hint: "Schnell und sparsam" },
  { value: "medium", label: "Mittel", hint: "Ausgewogen (Standard)" },
  { value: "high", label: "Hoch", hint: "Gründlich nachdenken" },
  { value: "max", label: "Maximal", hint: "Maximale Denktiefe, dauert länger" },
];

export interface ModelCapabilities {
  vision: boolean;
  pdf: boolean;
  webSearch: boolean;
  tools: boolean;
  /** Claude: adaptive thinking + output_config.effort; OpenAI: reasoning.effort */
  reasoning: boolean;
  /** Claude: Effort-Wechsel per Mid-Conversation-System-Nachricht ohne Cache-Verlust */
  perMessageEffort: boolean;
  /** Claude: role "system" mitten im Gespräch */
  systemMessages: boolean;
  /** Claude: serverseitiger Refusal-Fallback (fallbacks: "default") */
  fallbacks: boolean;
  /** Claude: "dynamic" = web_search_20260209 (Standard), "basic" = web_search_20250305 */
  anthropicWebTools?: "dynamic" | "basic";
}

/** Abbildung UI-Stufe -> API-Wert, pro Modell im Admin pflegbar. */
export type EffortMap = Partial<Record<Effort, string>>;

export interface PublicModel {
  id: string;
  provider: Provider;
  displayName: string;
  description: string;
  isDefault: boolean;
  capabilities: ModelCapabilities;
  efforts: Effort[];
  defaultEffort: Effort;
}

export interface PublicPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  defaultModelId: string | null;
}

export interface PublicConfig {
  models: PublicModel[];
  presets: PublicPreset[];
  features: FeatureFlags;
  notice: { full: string; short: string };
  paused: boolean;
  pausedMessage: string;
  imageDefaults: { size: string; quality: string };
  storage: "blob" | "local";
  /** Blob-Upload per Client-Token oder vorsignierter URL (OIDC-Stores). */
  blobUpload: "token" | "presigned" | null;
}

export interface FeatureFlags {
  webSearch: boolean;
  uploads: boolean;
  transcription: boolean;
  dictation: boolean;
  imageGeneration: boolean;
  artifacts: boolean;
  answerCache: boolean;
  showCacheBadge: boolean;
  showCost: boolean;
}

export type AttachmentKind = "image" | "document" | "transcript";

export interface Attachment {
  id: string;
  kind: AttachmentKind;
  name: string;
  mime: string;
  size: number;
  /** SHA-256 des Dateiinhalts (Basis für Hash-Caches und Antwort-Cache). */
  sha256: string;
  /** Speicher-Schlüssel der Originaldatei (Blob-Pfad bzw. lokaler Pfad). */
  storageKey: string;
  tokenEstimate?: number;
  /** Kurze Vorschau des extrahierten Texts für die UI. */
  preview?: string;
  /** PDF nativ an das Modell geben (Layout, Grafiken) statt nur Text. */
  native?: boolean;
}

export interface Citation {
  url: string;
  title: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
}

export interface UsageInfo {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheWriteTokens: number;
  webSearches?: number;
  costUsd?: number;
}

/** Native Provider-Daten eines Assistenten-Turns für den byte-genauen Replay. */
export interface NativeTurn {
  provider: Provider;
  model: string;
  /** Anthropic: angehängte Messages (assistant/user tool_result ...); OpenAI: Output-Items. */
  items: unknown[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  createdAt: number;
  // Nutzer-Nachricht
  attachments?: Attachment[];
  /** Datumskontext, einmal beim Senden festgelegt und danach unverändert mitgeschickt. */
  contextDate?: string;
  effort?: Effort;
  webSearch?: boolean;
  // Assistenten-Nachricht
  modelId?: string;
  thinking?: string;
  citations?: Citation[];
  images?: GeneratedImage[];
  native?: NativeTurn;
  fromCache?: boolean;
  usage?: UsageInfo;
  stopReason?: string;
  error?: string;
  fallbackModel?: string;
}

export interface ChatRequestBody {
  conversationId: string;
  modelId: string;
  presetId: string | null;
  messages: ChatMessage[];
  /** "Neu generieren": Antwort-Cache umgehen. */
  bypassCache?: boolean;
}

/** Events, die /api/chat als Server-Sent Events schickt. */
export type StreamEvent =
  | { type: "start"; modelId: string; fromCache: boolean }
  | { type: "text"; text: string }
  | { type: "thinking"; text: string }
  | { type: "status"; status: string | null }
  | { type: "citation"; citation: Citation }
  | { type: "image"; image: GeneratedImage }
  | { type: "fallback"; model: string }
  | {
      type: "done";
      native?: NativeTurn;
      usage?: UsageInfo;
      stopReason: string;
      fromCache: boolean;
    }
  | { type: "error"; message: string };
