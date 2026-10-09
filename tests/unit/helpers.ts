import type { PreparedMessage } from "@/lib/chat/prepare";
import { SEED_MODELS } from "@/lib/db/seed";
import type { ModelRow } from "@/lib/models";
import type { ProviderRequest } from "@/lib/providers/types";
import type { NativeTurn } from "@/lib/shared/types";

export function seedModel(id: string): ModelRow {
  const m = SEED_MODELS.find((x) => x.id === id);
  if (!m) throw new Error(`unknown model ${id}`);
  return { ...m, isDefault: m.isDefault ?? false, enabled: true };
}

export function request(model: ModelRow, messages: PreparedMessage[], overrides: Partial<ProviderRequest> = {}): ProviderRequest {
  return {
    model,
    systemPrompt: "SYSTEM",
    presetPrompt: null,
    messages,
    tools: { webSearch: true, generateImage: true },
    cacheTtl: "5m",
    conversationKey: "freebie-test",
    signal: new AbortController().signal,
    generateImage: async () => ({ ok: false, error: "nicht im Test" }),
    emit: () => {},
    ...overrides,
  };
}

export function user(text: string, extra: Partial<Extract<PreparedMessage, { role: "user" }>> = {}): PreparedMessage {
  return { role: "user", parts: [{ type: "text", text }], effort: "medium", webSearch: true, ...extra };
}

export function assistant(text: string, native?: NativeTurn): PreparedMessage {
  return { role: "assistant", text, native };
}
