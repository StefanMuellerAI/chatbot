import { describe, expect, it } from "vitest";
import { answerCacheKey, canonicalJson } from "@/lib/chat/answer-cache";
import type { ChatMessage } from "@/lib/shared/types";

const base = {
  modelRowId: "claude-sonnet-5-5",
  apiModelId: "claude-sonnet-5-5",
  systemVersion: "abc",
  presetVersion: null,
  tools: { webSearch: true, generateImage: true },
};

const msg = (over: Partial<ChatMessage> = {}): ChatMessage => ({
  id: "x",
  role: "user",
  text: "Hallo",
  createdAt: 1,
  contextDate: "Donnerstag, 8. Oktober 2026",
  effort: "medium",
  webSearch: true,
  ...over,
});

describe("Antwort-Cache", () => {
  it("serialisiert Objekte mit sortierten Schlüsseln", () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe('{"a":{"c":3,"d":2},"b":1}');
  });

  it("ignoriert IDs und Zeitstempel, aber nicht den Inhalt", () => {
    const k1 = answerCacheKey({ ...base, messages: [msg({ id: "1", createdAt: 1 })] });
    const k2 = answerCacheKey({ ...base, messages: [msg({ id: "2", createdAt: 999 })] });
    expect(k1).toBe(k2);
    expect(answerCacheKey({ ...base, messages: [msg({ text: "Hallo!" })] })).not.toBe(k1);
  });

  it("trennt nach Datum, Effort, Websuche, Modell und Vorlage", () => {
    const k = answerCacheKey({ ...base, messages: [msg()] });
    expect(answerCacheKey({ ...base, messages: [msg({ contextDate: "Freitag, 9. Oktober 2026" })] })).not.toBe(k);
    expect(answerCacheKey({ ...base, messages: [msg({ effort: "high" })] })).not.toBe(k);
    expect(answerCacheKey({ ...base, messages: [msg({ webSearch: false })] })).not.toBe(k);
    expect(answerCacheKey({ ...base, modelRowId: "x", messages: [msg()] })).not.toBe(k);
    expect(answerCacheKey({ ...base, presetVersion: "p1", messages: [msg()] })).not.toBe(k);
  });
});
