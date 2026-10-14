import { describe, expect, it } from "vitest";
import { longChatHint, MAX_CHAT_MESSAGES } from "@/lib/client/long-chat";
import type { ChatMessage } from "@/lib/shared/types";

// W08: Freebie rät rechtzeitig zu einem neuen Chat – vor 500 Nachrichten, 4,5 MB und dem Kontextfenster.

const chat = (count: number, text = "kurz"): ChatMessage[] =>
  Array.from({ length: count }, (_, i) => ({ id: `m${i}`, role: i % 2 ? "assistant" : "user", text, createdAt: i }));
const usage = (input: number) => ({ inputTokens: input, outputTokens: 10, cacheReadTokens: 0, cacheWriteTokens: 0 });

describe("Hinweis bei langen Chats", () => {
  it("kurze Chats: kein Hinweis", () => {
    expect(longChatHint(chat(20), usage(5_000))).toBeNull();
    expect(longChatHint(chat(399))).toBeNull();
  });

  it("ab 400 Nachrichten mit Zahl, bei 500 als Höchstzahl", () => {
    expect(longChatHint(chat(400))).toBe(
      "Dieser Chat ist schon sehr lang (400 von höchstens 500 Nachrichten). Für neue Fragen bitte einen neuen Chat starten – dort antwortet Freebie schneller, und dieser Chat bleibt im Verlauf erhalten.",
    );
    expect(longChatHint(chat(MAX_CHAT_MESSAGES))).toMatch(/^Dieser Chat hat die Höchstzahl von 500 Nachrichten erreicht\./);
  });

  it("auch bei großem Kontext oder großer Anfrage – dann ohne Zahl", () => {
    expect(longChatHint(chat(10), usage(160_000))).toMatch(/^Dieser Chat ist schon sehr lang\. Für neue Fragen/);
    expect(longChatHint(chat(4, "x".repeat(1024 * 1024)))).toMatch(/^Dieser Chat ist schon sehr lang\. Für neue Fragen/);
  });
});
