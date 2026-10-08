import { describe, expect, it } from "vitest";
import { buildAnthropicRequest, sanitizeForEcho, WEB_SEARCH_OFF_NOTE } from "@/lib/providers/anthropic";
import { assistant, request, seedModel, user } from "./helpers";

const sonnet = seedModel("claude-sonnet-5-5");
const haiku = seedModel("claude-haiku-5-5");

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
    expect(params.thinking).toEqual({ type: "adaptive", display: "summarized" });
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

  it("schaltet die Websuche per System-Nachricht nach der Nutzernachricht ab", () => {
    const { params } = buildAnthropicRequest(request(sonnet, [user("Ohne Suche", { webSearch: false })]));
    expect(params.messages[1]).toEqual({ role: "system", content: WEB_SEARCH_OFF_NOTE });
    // Tools bleiben trotzdem gleich (Cache-Präfix).
    expect((params.tools as { name: string }[]).map((t) => t.name)).toContain("web_search");
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
