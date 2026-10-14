import { describe, expect, it } from "vitest";
import { normalizeConversation } from "@/lib/client/db";
import { ChatMessageSchema } from "@/lib/shared/schemas";

// E11: Wie kaputt eine Import-Datei auch ist – was übernommen wird, zeigt die Oberfläche an und nimmt der Server an.

let seed = 7;
const rand = (n: number) => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed % n;
};
const pick = <T>(list: T[]): T => list[rand(list.length)];

/** Zufälliger JSON-Wert: mal passend, mal falscher Typ, mal leer. */
function junk(depth = 0): unknown {
  const simple = [null, true, 0, -1, 3.5, "", "x", "a".repeat(150), [], {}];
  if (depth > 2) return pick(simple);
  switch (rand(4)) {
    case 0:
      return pick(simple);
    case 1:
      return Array.from({ length: rand(4) }, () => junk(depth + 1));
    case 2:
      return Object.fromEntries(Array.from({ length: rand(4) }, () => [pick(["name", "kind", "url", "title", "id", "items", "provider"]), junk(depth + 1)]));
    default:
      return pick(["document", "image", "anthropic", "low", "mailbox", "https://example.com"]);
  }
}

const SHA = "a".repeat(64);
const goodAttachment = { id: "a1", kind: "document", name: "notiz.txt", mime: "text/plain", size: 3, sha256: SHA, storageKey: "uploads/abcdefgh-1/notiz.txt" };

function randomMessage(): Record<string, unknown> {
  const m: Record<string, unknown> = { role: pick(["user", "assistant"]) };
  for (const key of ["id", "text", "createdAt", "attachments", "citations", "images", "native", "usage", "thinking", "error", "effort", "webSearch", "fromCache", "modelId", "contextDate", "connections", "mails", "stopReason"]) {
    if (rand(2)) m[key] = junk();
  }
  // Manchmal gültige Teile dazwischen, damit auch das Übernehmen geprüft wird.
  if (rand(3) === 0) m.attachments = [goodAttachment, junk(), { ...goodAttachment, sha256: "kurz" }];
  if (rand(3) === 0) m.citations = [{ url: "https://stefanai.de", title: "StefanAI" }, junk()];
  if (rand(4) === 0) m.native = { provider: pick(["anthropic", "openai", "fremd"]), model: "m", items: rand(2) ? [] : "keine Liste" };
  return m;
}

describe("Import: Normalisierung beliebiger Dateien", () => {
  it("2000 zufällige Chats: nichts wirft, jede übernommene Nachricht besteht die Server-Prüfung", () => {
    for (let i = 0; i < 2000; i++) {
      const raw = { id: `c-${i}`, title: junk(), modelId: junk(), presetId: junk(), messages: Array.from({ length: 1 + rand(4) }, randomMessage) };
      const conv = normalizeConversation(raw);
      expect(conv, JSON.stringify(raw)).not.toBeNull();
      expect(typeof conv!.title).toBe("string");
      for (const m of conv!.messages) {
        const result = ChatMessageSchema.safeParse(m);
        expect(result.success, `${JSON.stringify(m).slice(0, 400)}\n${result.error?.message}`).toBe(true);
        // Was die Anzeige als Liste liest, ist eine Liste (oder fehlt).
        for (const key of ["attachments", "citations", "images"] as const) {
          const value = (m as unknown as Record<string, unknown>)[key];
          expect(value === undefined || Array.isArray(value), key).toBe(true);
        }
      }
    }
  });

  it("gültige Teile bleiben erhalten, ungültige fallen weg", () => {
    const conv = normalizeConversation({
      id: "c",
      messages: [
        { role: "user", text: "Frage", attachments: [goodAttachment, null, { name: 5 }], effort: "extrem" },
        { role: "assistant", text: "Antwort", citations: [{ url: "https://stefanai.de", title: "StefanAI" }, "x"], images: "y", usage: 5 },
      ],
    })!;
    expect(conv.messages[0].attachments).toEqual([expect.objectContaining({ name: "notiz.txt", sha256: SHA })]);
    expect(conv.messages[0].effort).toBeUndefined();
    expect(conv.messages[1].citations).toEqual([{ url: "https://stefanai.de", title: "StefanAI" }]);
    expect(conv.messages[1].images).toBeUndefined();
    expect(conv.messages[1].usage).toBeUndefined();
  });
});
