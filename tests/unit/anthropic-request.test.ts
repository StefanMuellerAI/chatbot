import { describe, expect, it } from "vitest";
import { buildAnthropicRequest, sanitizeForEcho, WEB_SEARCH_OFF_NOTE } from "@/lib/providers/anthropic";
import { claudeVersion, isLegacyClaude } from "@/lib/shared/claude-models";
import { assistant, request, seedModel, user } from "./helpers";

const sonnet = seedModel("claude-sonnet-5-5");
const haiku = seedModel("claude-haiku-5-5");
// Wie ein im Admin angelegtes älteres Modell – mit Fähigkeiten, die es nicht hat.
const haiku45 = {
  ...seedModel("claude-haiku-5-5"),
  id: "claude-haiku-4-5",
  modelId: "claude-haiku-4-5",
  maxOutputTokens: 64000,
  capabilities: { ...seedModel("claude-sonnet-5-5").capabilities, anthropicWebTools: "dynamic" as const },
};

describe("buildAnthropicRequest", () => {
  it("setzt Cache-Breakpoints auf System, Vorlage und den Gesprächsrest", () => {
    const { params } = buildAnthropicRequest(request(sonnet, [user("Hallo")], { presetPrompt: "ROLLE" }));
    expect(params.system).toEqual([
      { type: "text", text: "SYSTEM", cache_control: { type: "ephemeral" } },
      { type: "text", text: "ROLLE", cache_control: { type: "ephemeral" } },
    ]);
    expect(params.cache_control).toEqual({ type: "ephemeral" });
  });

  it("nutzt die 1-Stunden-TTL überall, wenn eingestellt", () => {
    const { params } = buildAnthropicRequest(request(sonnet, [user("Hallo")], { cacheTtl: "1h" }));
    expect(params.cache_control).toEqual({ type: "ephemeral", ttl: "1h" });
    expect((params.system as { cache_control: unknown }[])[0].cache_control).toEqual({ type: "ephemeral", ttl: "1h" });
  });

  it("sortiert Tools deterministisch und wählt die passende Web-Tool-Version", () => {
    const { params } = buildAnthropicRequest(request(sonnet, [user("Hallo")]));
    const tools = params.tools as { name: string; type?: string }[];
    expect(tools.map((t) => t.name)).toEqual(["generate_image", "web_fetch", "web_search"]);
    expect(tools[2].type).toBe("web_search_20260209");
    const basic = buildAnthropicRequest(request(haiku, [user("Hallo")])).params.tools as { name: string; type?: string }[];
    expect(basic.find((t) => t.name === "web_search")?.type).toBe("web_search_20250305");
  });

  it("setzt adaptives Thinking mit Zusammenfassung und den Effort explizit", () => {
    const { params } = buildAnthropicRequest(request(sonnet, [user("Hallo")]));
    expect(params.thinking).toMatchObject({ type: "adaptive", display: "summarized" });
    expect(params.output_config).toEqual({ effort: "medium" });
    expect(params.max_tokens).toBe(32000);
  });

  it("aktiviert den Refusal-Fallback nur für Modelle, die ihn unterstützen", () => {
    const s = buildAnthropicRequest(request(sonnet, [user("Hallo")]));
    expect(s.params.fallbacks).toBe("default");
    expect(s.betas).toContain("server-side-fallback-2026-07-01");
    const h = buildAnthropicRequest(request(haiku, [user("Hallo")]));
    expect(h.params.fallbacks).toBeUndefined();
    expect(h.betas).not.toContain("server-side-fallback-2026-07-01");
  });

  it("wechselt den Effort per System-Nachricht, ohne den Präfix zu ändern", () => {
    const history = [user("Eins"), assistant("Antwort"), user("Zwei", { effort: "high" })];
    const { params, betas } = buildAnthropicRequest(request(sonnet, history));
    // Oberste Ebene bleibt beim Effort der ersten Nachricht.
    expect(params.output_config).toEqual({ effort: "medium" });
    expect(params.messages[2]).toEqual({ role: "system", content: [], output_config: { effort: "high" } });
    expect(betas).toContain("mid-conversation-output-config-2026-07-01");
    expect(params.max_tokens).toBe(64000);
  });

  it("schaltet die Websuche per Hinweis in der Nachricht ab – auch ohne folgende Antwort", () => {
    // Abgebrochene Antworten werden nicht mitgeschickt: zwei Nutzernachrichten folgen direkt aufeinander.
    const { params } = buildAnthropicRequest(request(sonnet, [user("Ohne Suche", { webSearch: false }), user("Weiter")]));
    expect(params.messages).toHaveLength(2);
    expect(params.messages[0]).toEqual({
      role: "user",
      content: [
        { type: "text", text: "Ohne Suche" },
        { type: "text", text: `(${WEB_SEARCH_OFF_NOTE})` },
      ],
    });
    expect(params.messages.some((m) => m.role === "system")).toBe(false);
    // Tools bleiben trotzdem gleich (Cache-Präfix).
    expect((params.tools as { name: string }[]).map((t) => t.name)).toContain("web_search");
  });

  it("verwirft nicht passende Thinking-Blöcke statt die Anfrage abzulehnen", () => {
    const { params, betas } = buildAnthropicRequest(request(sonnet, [user("Hallo")]));
    expect(params.thinking).toMatchObject({ block_binding: { prefix_mismatch_behavior: "drop_block" } });
    expect(betas).toContain("thinking-binding-controls-2026-08-01");
  });

  it("gibt native Blöcke beim gleichen Modell byte-genau zurück, sonst Text", () => {
    const nativeItems = [{ role: "assistant", content: [{ type: "thinking", thinking: "", signature: "sig" }, { type: "text", text: "A" }] }];
    const same = buildAnthropicRequest(
      request(sonnet, [user("Eins"), assistant("A", { provider: "anthropic", model: "claude-sonnet-5-5", items: nativeItems }), user("Zwei")]),
    );
    expect(same.params.messages[1]).toEqual(nativeItems[0]);
    const other = buildAnthropicRequest(
      request(sonnet, [user("Eins"), assistant("A", { provider: "openai", model: "gpt-6.1-sol", items: [{}] }), user("Zwei")]),
    );
    expect(other.params.messages[1]).toEqual({ role: "assistant", content: "A" });
  });

  it("hält den Präfix über mehrere Runden stabil (Voraussetzung für Prompt Caching)", () => {
    const turn1 = [user("Eins")];
    const turn2 = [...turn1, assistant("Antwort"), user("Zwei", { effort: "low", webSearch: false })];
    const turn3 = [...turn2, assistant("Antwort 2"), user("Drei")];
    const a = buildAnthropicRequest(request(sonnet, turn2)).params;
    const b = buildAnthropicRequest(request(sonnet, turn3)).params;
    expect(JSON.stringify(b.system)).toBe(JSON.stringify(a.system));
    expect(JSON.stringify(b.tools)).toBe(JSON.stringify(a.tools));
    expect(JSON.stringify(b.messages.slice(0, a.messages.length))).toBe(JSON.stringify(a.messages));
    expect(b.output_config).toEqual(a.output_config);
  });
});

describe("buildAnthropicRequest für ältere Modelle (vor 4.6)", () => {
  it("nutzt Thinking mit Budget statt adaptivem Thinking und Effort", () => {
    const { params, betas } = buildAnthropicRequest(request(haiku45, [user("Hallo")]));
    expect(params.thinking).toEqual({ type: "enabled", budget_tokens: 8192 });
    expect(params.output_config).toBeUndefined();
    expect(params.max_tokens).toBe(32000);
    expect(betas).toEqual([]);
  });

  it("schickt keinen Fallback, keine Effort-System-Nachricht und die Basis-Web-Tools", () => {
    const history = [user("Eins"), assistant("Antwort"), user("Zwei", { effort: "high" })];
    const { params } = buildAnthropicRequest(request(haiku45, history));
    expect(params.fallbacks).toBeUndefined();
    expect(params.messages.some((m) => m.role === "system")).toBe(false);
    expect(params.thinking).toEqual({ type: "enabled", budget_tokens: 16384 });
    const tools = params.tools as { name: string; type?: string }[];
    expect(tools.find((t) => t.name === "web_search")?.type).toBe("web_search_20250305");
    expect(tools.find((t) => t.name === "web_fetch")?.type).toBe("web_fetch_20250910");
  });

  it("hält das Budget unter max_tokens und lässt Thinking bei sehr kleinem Limit weg", () => {
    const small = buildAnthropicRequest(request({ ...haiku45, maxOutputTokens: 4000 }, [user("Hallo")])).params;
    expect(small.thinking).toEqual({ type: "enabled", budget_tokens: 2000 });
    const tiny = buildAnthropicRequest(request({ ...haiku45, maxOutputTokens: 1500 }, [user("Hallo")])).params;
    expect(tiny.thinking).toBeUndefined();
  });

  it("schickt hochgeladene Bilder als Bildblock", () => {
    const msg = user("Was siehst du?", {
      parts: [
        { type: "image", mime: "image/png", base64: "AAAA" },
        { type: "text", text: "Was siehst du?" },
      ],
    });
    const { params } = buildAnthropicRequest(request(haiku45, [msg]));
    expect(params.messages[0].content).toEqual([
      { type: "image", source: { type: "base64", media_type: "image/png", data: "AAAA" } },
      { type: "text", text: "Was siehst du?" },
    ]);
  });
});

describe("claudeVersion / isLegacyClaude", () => {
  it("erkennt die Generation an der Modell-ID", () => {
    expect(claudeVersion("claude-haiku-4-5")).toBe(4.5);
    expect(claudeVersion("claude-haiku-4-5-20251001")).toBe(4.5);
    expect(claudeVersion("claude-sonnet-4-20250514")).toBe(4);
    expect(claudeVersion("claude-3-7-sonnet-20250219")).toBe(3.7);
    expect(claudeVersion("anthropic.claude-opus-4-1")).toBe(4.1);
    expect(claudeVersion("claude-opus-5-5")).toBe(5.5);
    expect(claudeVersion("claude-fable-5-1")).toBeNull();
    expect(isLegacyClaude("claude-haiku-4-5")).toBe(true);
    expect(isLegacyClaude("claude-sonnet-4-5")).toBe(true);
    expect(isLegacyClaude("claude-opus-4-5")).toBe(true);
    expect(isLegacyClaude("claude-sonnet-4-6")).toBe(false);
    expect(isLegacyClaude("claude-haiku-5-5")).toBe(false);
    expect(isLegacyClaude("claude-fable-5-1")).toBe(false);
  });
});

describe("sanitizeForEcho", () => {
  it("lässt Inhalte ohne Fallback unverändert", () => {
    const content = [{ type: "text", text: "x" }] as never;
    expect(sanitizeForEcho(content)).toBe(content);
  });

  it("entfernt Thinking und Tool-Use vor dem letzten Fallback-Block", () => {
    const content = [
      { type: "thinking", thinking: "", signature: "s" },
      { type: "text", text: "Teil 1" },
      { type: "server_tool_use", id: "a", name: "web_search", input: {} },
      { type: "web_search_tool_result", tool_use_id: "a", content: [] },
      { type: "server_tool_use", id: "b", name: "web_search", input: {} },
      { type: "fallback", from: { model: "x" }, to: { model: "y" } },
      { type: "thinking", thinking: "", signature: "t" },
      { type: "text", text: "Teil 2" },
    ] as never;
    const out = sanitizeForEcho(content) as { type: string; id?: string }[];
    expect(out.map((b) => b.type)).toEqual(["text", "server_tool_use", "web_search_tool_result", "thinking", "text"]);
    expect(out[1].id).toBe("a");
  });
});
