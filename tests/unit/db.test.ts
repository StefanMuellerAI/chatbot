import { describe, expect, it } from "vitest";
import { lookupAnswer, storeAnswer } from "@/lib/chat/answer-cache";
import { getDb, schema } from "@/lib/db/client";
import { listModels } from "@/lib/models";
import { getSettings, updateSettings } from "@/lib/settings";

describe("Datenbank (PGlite im Speicher)", () => {
  it("legt Tabellen an und befüllt Modelle mit Sonnet 5.5 als Standard", async () => {
    const models = await listModels();
    const def = models.find((m) => m.isDefault);
    expect(def?.modelId).toBe("claude-sonnet-5-5");
    expect(def?.defaultEffort).toBe("medium");
    expect(models.map((m) => m.modelId)).toEqual(expect.arrayContaining(["claude-opus-5-5", "claude-haiku-5-5", "gpt-6.1-sol", "gpt-6-astra", "gpt-6-luna"]));
    const db = await getDb();
    expect((await db.select().from(schema.presets)).length).toBeGreaterThan(0);
  });

  it("speichert Einstellungen mit Standardwerten", async () => {
    const before = await getSettings();
    expect(before.features.answerCache).toBe(true);
    await updateSettings({ paused: true, features: { ...before.features, showCost: true } });
    const after = await getSettings();
    expect(after.paused).toBe(true);
    expect(after.features.showCost).toBe(true);
    expect(after.features.answerCache).toBe(true);
  });

  it("führt Funktionsschalter einzeln zusammen", async () => {
    await updateSettings({ features: { webSearch: false } as never });
    await updateSettings({ features: { artifacts: false } as never });
    await updateSettings({ appPasswordHash: null, noticeShort: "Kurz" });
    const s = await getSettings({ fresh: true });
    expect(s.features.webSearch).toBe(false);
    expect(s.features.artifacts).toBe(false);
    expect(s.features.showCost).toBe(true);
    expect(s.paused).toBe(true);
    expect(s.noticeShort).toBe("Kurz");
    expect(s.appPasswordHash).toBeNull();
  });

  it("liefert gespeicherte Antworten bis zum Ablauf und überschreibt sie nicht", async () => {
    const usage = { inputTokens: 1, outputTokens: 2, cacheReadTokens: 0, cacheWriteTokens: 0 };
    await storeAnswer("k1", "m", { text: "erste", thinking: "", citations: [], stopReason: "end_turn" }, usage, 0.5, 1);
    await storeAnswer("k1", "m", { text: "zweite", thinking: "", citations: [], stopReason: "end_turn" }, usage, 0.5, 1);
    expect((await lookupAnswer("k1"))?.answer.text).toBe("erste");
    await storeAnswer("k2", "m", { text: "alt", thinking: "", citations: [], stopReason: "end_turn" }, usage, 0.5, -1);
    expect(await lookupAnswer("k2")).toBeNull();
  });
});
