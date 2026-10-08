import "server-only";
import OpenAI from "openai";
import { toResponseInputItems } from "openai/lib/responses/ResponseInputItems";
import type {
  Response as OpenAIResponse,
  ResponseCreateParamsStreaming,
  ResponseInputContent,
  ResponseInputItem,
  Tool,
} from "openai/resources/responses/responses";
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

const WEB_SEARCH_COST_USD = 0.01;
const MAX_ITERATIONS = 8;

export const WEB_SEARCH_OFF_NOTE =
  "Für diese Nachricht ist die Websuche ausgeschaltet. Nutze keine Websuche.";

const ImageInput = z.object({
  prompt: z.string().min(1),
  size: z.enum(["1024x1024", "1536x1024", "1024x1536"]),
  quality: z.enum(["low", "medium", "high"]),
  reference_image_ids: z.array(z.string()),
});

let client: OpenAI | null = null;
export function getOpenAI(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new ProviderError("OPENAI_API_KEY fehlt", "Für OpenAI ist noch kein API-Schlüssel hinterlegt.");
  }
  client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY, maxRetries: 2 });
  return client;
}

type ReasoningEffort = "none" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

function mapEffort(effort: Effort, map: Partial<Record<Effort, string>>): ReasoningEffort {
  return (map[effort] ?? effort) as ReasoningEffort;
}

/** Deterministischer Aufbau: gleiche Historie ergibt denselben Präfix. */
export function buildOpenAIRequest(req: ProviderRequest): Omit<ResponseCreateParamsStreaming, "stream"> {
  const { model } = req;
  const caps = model.capabilities;
  const instructions = req.presetPrompt
    ? `${req.systemPrompt}\n\n# Rolle für dieses Gespräch\n${req.presetPrompt}`
    : req.systemPrompt;

  const tools: Tool[] = [];
  if (req.tools.generateImage && caps.tools) {
    tools.push({
      type: "function",
      name: IMAGE_TOOL_NAME,
      description: IMAGE_TOOL_DESCRIPTION,
      parameters: IMAGE_TOOL_SCHEMA as unknown as Record<string, unknown>,
      strict: true,
    });
  }
  if (req.tools.webSearch && caps.webSearch) {
    tools.push({
      type: "web_search",
      user_location: { type: "approximate", country: "DE", timezone: "Europe/Berlin" },
    });
  }

  const users = req.messages.filter((m) => m.role === "user");
  const firstEffort: Effort = users[0]?.effort ?? model.defaultEffort;
  const currentEffort: Effort = users[users.length - 1]?.effort ?? firstEffort;
  const useUpdates = caps.reasoning && caps.perMessageEffort;
  const topEffort = useUpdates ? firstEffort : currentEffort;

  const input: ResponseInputItem[] = [];
  let lastEffort = firstEffort;
  for (const m of req.messages) {
    if (m.role === "assistant") {
      input.push(...assistantItems(m, model.modelId));
      continue;
    }
    if (useUpdates && m.effort !== lastEffort) {
      // Effort-Wechsel ohne Präfix-Änderung (GPT-6: configuration_update).
      input.push({
        type: "configuration_update",
        reasoning: { effort: mapEffort(m.effort, model.effortMap) },
      } as ResponseInputItem);
    }
    lastEffort = m.effort;
    input.push({ role: "user", content: userContent(m) });
    if (req.tools.webSearch && caps.webSearch && !m.webSearch) {
      input.push({ role: "developer", content: WEB_SEARCH_OFF_NOTE });
    }
  }

  const params: Omit<ResponseCreateParamsStreaming, "stream"> = {
    model: model.modelId,
    instructions,
    input,
    store: false,
    max_output_tokens: maxTokensFor(currentEffort, model.maxOutputTokens),
    prompt_cache_key: req.conversationKey,
  };
  if (tools.length) params.tools = tools;
  if (caps.reasoning) {
    params.reasoning = { effort: mapEffort(topEffort, model.effortMap), summary: "auto" };
    params.include = ["reasoning.encrypted_content"];
  }
  return params;
}

function userContent(m: Extract<PreparedMessage, { role: "user" }>): ResponseInputContent[] {
  return m.parts.map((p): ResponseInputContent => {
    if (p.type === "text") return { type: "input_text", text: p.text };
    if (p.type === "image") {
      return { type: "input_image", image_url: `data:${p.mime};base64,${p.base64}`, detail: "auto" };
    }
    return { type: "input_file", filename: p.name, file_data: `data:application/pdf;base64,${p.base64}` };
  });
}

function assistantItems(m: Extract<PreparedMessage, { role: "assistant" }>, modelId: string): ResponseInputItem[] {
  if (m.native && m.native.provider === "openai" && m.native.model === modelId && m.native.items.length) {
    return m.native.items as ResponseInputItem[];
  }
  return [{ role: "assistant", content: m.text.trim() ? m.text : "(Keine Antwort.)" }];
}

export async function runOpenAI(req: ProviderRequest): Promise<ProviderResult> {
  const openai = getOpenAI();
  const params = buildOpenAIRequest(req);
  const appended: ResponseInputItem[] = [];
  let usage = emptyUsage();
  let text = "";
  let thinking = "";
  const citations: Citation[] = [];
  const seen = new Set<string>();
  const images: GeneratedImage[] = [];
  let stopReason = "end_turn";

  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    if (iteration > 0 && text && !text.endsWith("\n")) {
      text += "\n\n";
      req.emit({ type: "text", text: "\n\n" });
    }
    const stream = await openai.responses.create(
      { ...params, input: [...(params.input as ResponseInputItem[]), ...appended], stream: true },
      { signal: req.signal },
    );
    let final: OpenAIResponse | null = null;
    let refusal = "";
    for await (const event of stream) {
      switch (event.type) {
        case "response.output_text.delta":
          text += event.delta;
          req.emit({ type: "text", text: event.delta });
          break;
        case "response.refusal.delta":
          refusal += event.delta;
          break;
        case "response.reasoning_summary_text.delta":
          thinking += event.delta;
          req.emit({ type: "thinking", text: event.delta });
          break;
        case "response.reasoning_summary_part.added":
          if (thinking && !thinking.endsWith("\n")) {
            thinking += "\n\n";
            req.emit({ type: "thinking", text: "\n\n" });
          }
          break;
        case "response.web_search_call.in_progress":
        case "response.web_search_call.searching":
          req.emit({ type: "status", status: "Suche im Web …" });
          break;
        case "response.web_search_call.completed":
          req.emit({ type: "status", status: null });
          break;
        case "response.output_item.added":
          if (event.item.type === "function_call" && event.item.name === IMAGE_TOOL_NAME) {
            req.emit({ type: "status", status: "Erzeuge Bild …" });
          }
          break;
        case "response.output_text.annotation.added": {
          const a = event.annotation as { type?: string; url?: string; title?: string } | null;
          if (a?.type === "url_citation" && a.url && !seen.has(a.url)) {
            seen.add(a.url);
            const c = { url: a.url, title: a.title || a.url };
            citations.push(c);
            req.emit({ type: "citation", citation: c });
          }
          break;
        }
        case "response.completed":
        case "response.incomplete":
          final = event.response;
          break;
        case "response.failed":
          throw new ProviderError(
            event.response.error?.message ?? "OpenAI-Antwort fehlgeschlagen",
            "OpenAI konnte die Anfrage nicht beantworten.",
          );
        case "error":
          throw new ProviderError(event.message ?? "OpenAI-Fehler", "OpenAI meldet einen Fehler.");
      }
    }
    if (!final) throw new ProviderError("Stream ohne Abschluss", "Die Antwort von OpenAI ist abgebrochen.");

    const u = final.usage;
    if (u) {
      const cached = u.input_tokens_details?.cached_tokens ?? 0;
      const written = u.input_tokens_details?.cache_write_tokens ?? 0;
      usage = addUsage(usage, {
        inputTokens: Math.max(0, u.input_tokens - cached - written),
        outputTokens: u.output_tokens,
        cacheReadTokens: cached,
        cacheWriteTokens: written,
        webSearches: final.output.filter((o) => o.type === "web_search_call").length,
      });
    }

    if (refusal) {
      return {
        text: text ? `${text}\n\n${refusal}` : refusal,
        thinking,
        citations,
        images,
        native: undefined,
        usage,
        stopReason: "refusal",
        extraCostUsd: (usage.webSearches ?? 0) * WEB_SEARCH_COST_USD,
      };
    }

    appended.push(...toResponseInputItems(final.output as never));
    if (final.status === "incomplete") {
      stopReason = final.incomplete_details?.reason === "max_output_tokens" ? "max_tokens" : "incomplete";
      break;
    }

    const calls = final.output.filter((o) => o.type === "function_call") as {
      type: "function_call";
      call_id: string;
      name: string;
      arguments: string;
    }[];
    if (calls.length === 0) {
      stopReason = "end_turn";
      break;
    }
    stopReason = "tool_use";
    for (const call of calls) {
      let output: string;
      if (call.name !== IMAGE_TOOL_NAME) {
        output = "Fehler: Unbekanntes Werkzeug.";
      } else {
        let parsed: z.infer<typeof ImageInput> | null = null;
        try {
          const r = ImageInput.safeParse(JSON.parse(call.arguments));
          parsed = r.success ? r.data : null;
        } catch {
          parsed = null;
        }
        if (!parsed) {
          output = "Fehler: Die Werkzeug-Eingabe war ungültig. Bitte erneut versuchen.";
        } else {
          const result = await req.generateImage(parsed);
          req.emit({ type: "status", status: null });
          if (result.ok) {
            images.push(result.image);
            req.emit({ type: "image", image: result.image });
            output = `Bild erzeugt und angezeigt (Bild-ID: ${result.image.id}).`;
          } else {
            output = `Fehler: ${result.error}`;
          }
        }
      }
      appended.push({ type: "function_call_output", call_id: call.call_id, output });
    }
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
    native: { provider: "openai", model: req.model.modelId, items: appended },
    usage,
    stopReason,
    extraCostUsd: (usage.webSearches ?? 0) * WEB_SEARCH_COST_USD,
  };
}

export async function listOpenAIModels(): Promise<{ id: string; name: string }[]> {
  const openai = getOpenAI();
  const out: { id: string; name: string }[] = [];
  for await (const m of openai.models.list()) out.push({ id: m.id, name: m.id });
  return out.sort((a, b) => a.id.localeCompare(b.id));
}

export async function testOpenAI(modelId: string): Promise<string> {
  const openai = getOpenAI();
  const res = await openai.responses.create({
    model: modelId,
    input: "Antworte nur mit: OK",
    store: false,
    max_output_tokens: 2000,
  });
  return res.output_text || "(keine Textantwort)";
}

export async function openAITitle(modelId: string, prompt: string): Promise<{ title: string; usage: { input: number; output: number } }> {
  const openai = getOpenAI();
  const res = await openai.responses.create({
    model: modelId,
    input: prompt,
    store: false,
    max_output_tokens: 2000,
    reasoning: { effort: "low" },
  });
  return {
    title: res.output_text,
    usage: { input: res.usage?.input_tokens ?? 0, output: res.usage?.output_tokens ?? 0 },
  };
}
