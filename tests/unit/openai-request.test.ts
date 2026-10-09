import { describe, expect, it } from "vitest";
import { buildOpenAIRequest, WEB_SEARCH_OFF_NOTE } from "@/lib/providers/openai";
import { assistant, request, seedModel, user } from "./helpers";

const sol = seedModel("gpt-6-1-sol");

describe("buildOpenAIRequest", () => {
  it("baut eine zustandslose Responses-Anfrage mit Cache-Schlüssel", () => {
    const p = buildOpenAIRequest(request(sol, [user("Hallo")], { presetPrompt: "ROLLE" }));
    expect(p.store).toBe(false);
    expect(p.include).toEqual(["reasoning.encrypted_content"]);
    expect(p.prompt_cache_key).toBe("freebie-test");
    expect(p.instructions).toContain("SYSTEM");
    expect(p.instructions).toContain("ROLLE");
    expect(p.reasoning).toEqual({ effort: "medium", summary: "auto" });
    expect((p.tools ?? []).map((t) => ("name" in t ? t.name : t.type))).toEqual(["generate_image", "web_search"]);
  });

  it("wechselt den Effort per configuration_update statt den Präfix zu ändern", () => {
    const p = buildOpenAIRequest(request(sol, [user("Eins"), assistant("A"), user("Zwei", { effort: "max" })]));
    expect(p.reasoning).toEqual({ effort: "medium", summary: "auto" });
    const input = p.input as unknown[];
    expect(input[2]).toEqual({ type: "configuration_update", reasoning: { effort: "max" } });
  });

  it("schaltet die Websuche per Developer-Nachricht ab", () => {
    const p = buildOpenAIRequest(request(sol, [user("Ohne Suche", { webSearch: false })]));
    expect((p.input as unknown[])[1]).toEqual({ role: "developer", content: WEB_SEARCH_OFF_NOTE });
  });

  it("spielt native Output-Items beim gleichen Modell zurück", () => {
    const items = [{ type: "reasoning", id: "rs_1", encrypted_content: "x", summary: [] }, { type: "message", role: "assistant", content: [] }];
    const p = buildOpenAIRequest(request(sol, [user("Eins"), assistant("A", { provider: "openai", model: "gpt-6.1-sol", items }), user("Zwei")]));
    const input = p.input as unknown[];
    expect(input.slice(1, 3)).toEqual(items);
  });

  it("hält den Präfix über mehrere Runden stabil", () => {
    const t2 = [user("Eins"), assistant("A"), user("Zwei", { effort: "high" })];
    const t3 = [...t2, assistant("B"), user("Drei")];
    const a = buildOpenAIRequest(request(sol, t2));
    const b = buildOpenAIRequest(request(sol, t3));
    expect(b.instructions).toBe(a.instructions);
    expect(JSON.stringify(b.tools)).toBe(JSON.stringify(a.tools));
    const ai = a.input as unknown[];
    expect(JSON.stringify((b.input as unknown[]).slice(0, ai.length))).toBe(JSON.stringify(ai));
  });
});
