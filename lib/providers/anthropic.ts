import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import type {
  BetaContentBlock,
  BetaContentBlockParam,
  BetaMessageParam,
  BetaToolResultBlockParam,
  BetaToolUnion,
  MessageCreateParamsStreaming,
} from "@anthropic-ai/sdk/resources/beta/messages/messages";
import { z } from "zod";
import type { PreparedMessage } from "@/lib/chat/prepare";
import type { Citation, Effort, GeneratedImage } from "@/lib/shared/types";
import {
  addUsage,
  emptyUsage,
  IMAGE_TOOL_DESCRIPTION,
  IMAGE_TOOL_NAME,
  IMAGE_TOOL_SCHEMA,
  maxTokensFor,
  ProviderError,
  type ProviderRequest,
  type ProviderResult,
} from "./types";

const FALLBACK_BETA = "server-side-fallback-2026-07-01";
const EFFORT_BETA = "mid-conversation-output-config-2026-07-01";
const WEB_SEARCH_COST_USD = 0.01; // $10 pro 1.000 Suchen
const MAX_ITERATIONS = 8;

const ImageInput = z.object({
  prompt: z.string().min(1),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536"]),
  quality: z.enum(["low", "medium", "high"]),
  reference_image_ids: z.array(z.string()),
});

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new ProviderError("ANTHROPIC_API_KEY fehlt", "Für Claude ist noch kein API-Schlüssel hinterlegt.");
  }
  client ??= new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, maxRetries: 2 });
  return client;
}

export const WEB_SEARCH_OFF_NOTE =
  "Für diese Nachricht ist die Websuche ausgeschaltet. Nutze keine Websuche und keinen Webabruf.";

/**
 * Baut die Anfrage deterministisch auf. Reihenfolge und Inhalte hängen nur vom Verlauf ab,
 * damit jeder Folge-Request den bisherigen Präfix byte-genau wiederholt.
 */
export function buildAnthropicRequest(req: ProviderRequest): {
  params: Omit<MessageCreateParamsStreaming, "stream">;
  betas: string[];
} {
  const { model } = req;
  const caps = model.capabilities;
  const cacheControl =
    req.cacheTtl === "1h" ? ({ type: "ephemeral", ttl: "1h" } as const) : ({ type: "ephemeral" } as const);

  // System: globaler Prompt + optional Vorlage, jeweils mit eigenem Breakpoint.
  const system: { type: "text"; text: string; cache_control: typeof cacheControl }[] = [
    { type: "text", text: req.systemPrompt, cache_control: cacheControl },
  ];
  if (req.presetPrompt) {
    system.push({ type: "text", text: req.presetPrompt, cache_control: cacheControl });
  }

  // Tools: deterministisch nach Namen sortiert, pro Gespräch fest.
  const tools: BetaToolUnion[] = [];
  if (req.tools.generateImage && caps.tools) {
    tools.push({
      name: IMAGE_TOOL_NAME,
      description: IMAGE_TOOL_DESCRIPTION,
      input_schema: IMAGE_TOOL_SCHEMA as unknown as Anthropic.Beta.BetaTool.InputSchema,
      strict: true,
      eager_input_streaming: true,
    });
  }
  if (req.tools.webSearch && caps.webSearch) {
    const basic = caps.anthropicWebTools === "basic";
    tools.push({ type: basic ? "web_fetch_20250910" : "web_fetch_20260209", name: "web_fetch" } as BetaToolUnion);
    tools.push({
      type: basic ? "web_search_20250305" : "web_search_20260209",
      name: "web_search",
      user_location: { type: "approximate", country: "DE", timezone: "Europe/Berlin" },
    } as BetaToolUnion);
  }

  const users = req.messages.filter((m) => m.role === "user");
  const firstEffort: Effort = users[0]?.effort ?? model.defaultEffort;
  const currentEffort: Effort = users[users.length - 1]?.effort ?? firstEffort;
  const useMessageEffort = caps.reasoning && caps.perMessageEffort;
  const topEffort = useMessageEffort ? firstEffort : currentEffort;

  const messages: BetaMessageParam[] = [];
  let lastEffort: Effort = firstEffort;
  let usedEffortMessages = false;
  for (const m of req.messages) {
    if (m.role === "assistant") {
      messages.push(...assistantMessages(m, model.modelId));
      continue;
    }
    if (useMessageEffort && m.effort !== lastEffort) {
      // Effort-Wechsel ohne Änderung des Präfixes (kein Cache-Verlust).
      messages.push({
        role: "system",
        content: [],
        output_config: { effort: mapEffort(m.effort, model.effortMap) },
      } as BetaMessageParam);
      usedEffortMessages = true;
    }
    lastEffort = m.effort;
    const content = userContent(m);
    const searchOff = req.tools.webSearch && caps.webSearch && !m.webSearch;
    if (searchOff && !caps.systemMessages) {
      content.push({ type: "text", text: `(${WEB_SEARCH_OFF_NOTE})` });
    }
    messages.push({ role: "user", content });
    if (searchOff && caps.systemMessages) {
      messages.push({ role: "system", content: WEB_SEARCH_OFF_NOTE });
    }
  }

  const effortValue = mapEffort(topEffort, model.effortMap);
  const params: Omit<MessageCreateParamsStreaming, "stream"> = {
    model: model.modelId,
    max_tokens: maxTokensFor(currentEffort, model.maxOutputTokens),
    system,
    messages,
    // Automatisches Caching für den wachsenden Gesprächsteil.
    cache_control: cacheControl,
  };
  if (tools.length) params.tools = tools;
  if (caps.reasoning) {
    params.thinking = { type: "adaptive", display: "summarized" };
    params.output_config = { effort: effortValue as "low" | "medium" | "high" | "xhigh" | "max" };
  }
  const betas: string[] = [];
  if (caps.fallbacks) {
    params.fallbacks = "default";
    betas.push(FALLBACK_BETA);
  }
  if (usedEffortMessages) betas.push(EFFORT_BETA);
  return { params, betas };
}

function mapEffort(effort: Effort, map: Partial<Record<Effort, string>>): "low" | "medium" | "high" | "xhigh" | "max" {
  return (map[effort] ?? effort) as "low" | "medium" | "high" | "xhigh" | "max";
}

function userContent(m: Extract<PreparedMessage, { role: "user" }>): BetaContentBlockParam[] {
  return m.parts.map((p): BetaContentBlockParam => {
    if (p.type === "text") return { type: "text", text: p.text };
    if (p.type === "image") {
      return {
        type: "image",
        source: { type: "base64", media_type: p.mime as "image/png", data: p.base64 },
      };
    }
    return {
      type: "document",
      title: p.name,
      source: { type: "base64", media_type: "application/pdf", data: p.base64 },
    };
  });
}

function assistantMessages(
  m: Extract<PreparedMessage, { role: "assistant" }>,
  modelId: string,
): BetaMessageParam[] {
  // Gleiches Modell: native Blöcke byte-genau zurückgeben (Cache + Preserved Thinking).
  if (m.native && m.native.provider === "anthropic" && m.native.model === modelId && m.native.items.length) {
    return m.native.items as BetaMessageParam[];
  }
  return [{ role: "assistant", content: m.text.trim() ? m.text : "(Keine Antwort.)" }];
}

/**
 * Nach einem Fallback mitten in der Antwort dürfen Thinking-, Tool-Use- und ungepaarte
 * Server-Tool-Blöcke vor dem letzten fallback-Block nicht zurückgeschickt werden.
 */
export function sanitizeForEcho(content: BetaContentBlock[]): BetaContentBlockParam[] {
  const lastFallback = content.map((b) => b.type as string).lastIndexOf("fallback");
  if (lastFallback === -1) return content as unknown as BetaContentBlockParam[];
  const resultIds = new Set(
    content
      .filter((b) => (b.type as string).endsWith("_tool_result"))
      .map((b) => (b as { tool_use_id?: string }).tool_use_id),
  );
  return content.filter((b, i) => {
    const type = b.type as string;
    if (type === "fallback") return false;
    if (i > lastFallback) return true;
    if (type === "thinking" || type === "redacted_thinking" || type === "tool_use") return false;
    if (type === "server_tool_use") return resultIds.has((b as { id: string }).id);
    return type === "text" || type.endsWith("_tool_result");
  }) as unknown as BetaContentBlockParam[];
}

export async function runAnthropic(req: ProviderRequest): Promise<ProviderResult> {
  const anthropic = getClient();
  const { params, betas } = buildAnthropicRequest(req);
  const appended: BetaMessageParam[] = [];
  let usage = emptyUsage();
  let text = "";
  let thinking = "";
  const citations: Citation[] = [];
  const seenUrls = new Set<string>();
  const images: GeneratedImage[] = [];
  let stopReason = "end_turn";
  let fallbackModel: string | undefined;

  const addCitation = (url: string | undefined, title: string | undefined) => {
    if (!url || seenUrls.has(url)) return;
    seenUrls.add(url);
    const c = { url, title: title || url };
    citations.push(c);
    req.emit({ type: "citation", citation: c });
  };

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    if (iteration > 0 && text && !text.endsWith("\n")) {
      text += "\n\n";
      req.emit({ type: "text", text: "\n\n" });
    }
    const stream = anthropic.beta.messages.stream(
      { ...params, messages: [...params.messages, ...appended], ...(betas.length ? { betas } : {}) },
      { signal: req.signal },
    );
    for await (const event of stream) {
      if (event.type === "content_block_start") {
        const block = event.content_block as { type: string; name?: string; content?: unknown; to?: { model?: string } };
        if (block.type === "server_tool_use") {
          req.emit({ type: "status", status: block.name === "web_fetch" ? "Lese Webseite …" : "Suche im Web …" });
        } else if (block.type === "web_search_tool_result" && Array.isArray(block.content)) {
          for (const r of block.content as { type: string; url?: string; title?: string }[]) {
            if (r.type === "web_search_result") addCitation(r.url, r.title);
          }
          req.emit({ type: "status", status: null });
        } else if (block.type === "web_fetch_tool_result") {
          req.emit({ type: "status", status: null });
        } else if (block.type === "tool_use" && block.name === IMAGE_TOOL_NAME) {
          req.emit({ type: "status", status: "Erzeuge Bild …" });
        } else if (block.type === "fallback") {
          fallbackModel = block.to?.model;
          if (fallbackModel) req.emit({ type: "fallback", model: fallbackModel });
        }
      } else if (event.type === "content_block_delta") {
        const delta = event.delta as { type: string; text?: string; thinking?: string; citation?: { url?: string; title?: string } };
        if (delta.type === "text_delta" && delta.text) {
          text += delta.text;
          req.emit({ type: "text", text: delta.text });
        } else if (delta.type === "thinking_delta" && delta.thinking) {
          thinking += delta.thinking;
          req.emit({ type: "thinking", text: delta.thinking });
        } else if (delta.type === "citations_delta" && delta.citation?.url) {
          addCitation(delta.citation.url, delta.citation.title);
        }
      }
    }
    const final = await stream.finalMessage();
    const u = final.usage;
    usage = addUsage(usage, {
      inputTokens: u.input_tokens ?? 0,
      outputTokens: u.output_tokens ?? 0,
      cacheReadTokens: u.cache_read_input_tokens ?? 0,
      cacheWriteTokens: u.cache_creation_input_tokens ?? 0,
      webSearches: u.server_tool_use?.web_search_requests ?? 0,
    });
    stopReason = final.stop_reason ?? "end_turn";

    if (stopReason === "refusal") {
      // Abgelehnte Antworten werden nicht in den Verlauf übernommen.
      return {
        text: text || "",
        thinking,
        citations,
        images,
        native: undefined,
        usage,
        stopReason,
        fallbackModel,
        extraCostUsd: (usage.webSearches ?? 0) * WEB_SEARCH_COST_USD,
      };
    }

    appended.push({ role: "assistant", content: sanitizeForEcho(final.content) });

    if (stopReason === "pause_turn") continue;
    if (stopReason !== "tool_use") break;

    const toolUses = final.content.filter((b) => b.type === "tool_use") as {
      type: "tool_use";
      id: string;
      name: string;
      input: unknown;
    }[];
    if (toolUses.length === 0) break;
    const results: BetaToolResultBlockParam[] = await Promise.all(
      toolUses.map(async (tu): Promise<BetaToolResultBlockParam> => {
        if (tu.name !== IMAGE_TOOL_NAME) {
          return { type: "tool_result", tool_use_id: tu.id, is_error: true, content: "Unbekanntes Werkzeug." };
        }
        const parsed = ImageInput.safeParse(tu.input);
        if (!parsed.success) {
          return {
            type: "tool_result",
            tool_use_id: tu.id,
            is_error: true,
            content: "INVALID_JSON: Die Werkzeug-Eingabe war unvollständig. Bitte erneut versuchen.",
          };
        }
        const result = await req.generateImage(parsed.data);
        req.emit({ type: "status", status: null });
        if (!result.ok) {
          return { type: "tool_result", tool_use_id: tu.id, is_error: true, content: result.error };
        }
        images.push(result.image);
        req.emit({ type: "image", image: result.image });
        return {
          type: "tool_result",
          tool_use_id: tu.id,
          content: `Bild erzeugt und angezeigt (Bild-ID: ${result.image.id}).`,
        };
      }),
    );
    // Alle Tool-Ergebnisse in EINER Nutzer-Nachricht zurückgeben.
    appended.push({ role: "user", content: results });
  }

  if (stopReason === "max_tokens") {
    const note = "\n\n_(Die Antwort wurde wegen der Längenbegrenzung abgeschnitten.)_";
    text += note;
    req.emit({ type: "text", text: note });
  }

  return {
    text,
    thinking,
    citations,
    images,
    native: { provider: "anthropic", model: req.model.modelId, items: appended },
    usage,
    stopReason,
    fallbackModel,
    extraCostUsd: (usage.webSearches ?? 0) * WEB_SEARCH_COST_USD,
  };
}

export async function listAnthropicModels(): Promise<{ id: string; name: string }[]> {
  const anthropic = getClient();
  const out: { id: string; name: string }[] = [];
  for await (const m of anthropic.models.list({ limit: 100 })) {
    out.push({ id: m.id, name: m.display_name });
  }
  return out;
}

export async function testAnthropic(modelId: string): Promise<string> {
  const anthropic = getClient();
  const res = await anthropic.messages.create({
    model: modelId,
    max_tokens: 64,
    messages: [{ role: "user", content: "Antworte nur mit: OK" }],
  });
  const block = res.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "(keine Textantwort)";
}

export async function anthropicTitle(modelId: string, prompt: string): Promise<{ title: string; usage: { input: number; output: number } }> {
  const anthropic = getClient();
  const res = await anthropic.messages.create({
    model: modelId,
    max_tokens: 2000,
    output_config: { effort: "low" },
    messages: [{ role: "user", content: prompt }],
  });
  const block = res.content.find((b) => b.type === "text");
  return {
    title: block && block.type === "text" ? block.text : "",
    usage: { input: res.usage.input_tokens, output: res.usage.output_tokens },
  };
}
