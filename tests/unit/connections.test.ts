import { describe, expect, it } from "vitest";
import { MAILBOX_OFF_NOTE, MAILBOX_ON_NOTE, prepareMessages, type PreparedMessage } from "@/lib/chat/prepare";
import { buildSystemPrompt } from "@/lib/chat/system-prompt";
import { mailboxTools } from "@/lib/mail/tools";
import type { Mailbox } from "@/lib/mail/store";
import { buildAnthropicRequest } from "@/lib/providers/anthropic";
import { buildOpenAIRequest } from "@/lib/providers/openai";
import { DEFAULT_SETTINGS } from "@/lib/shared/settings-defaults";
import type { ChatMessage } from "@/lib/shared/types";
import { imageTool } from "@/lib/tools/image-tool";
import { request, seedModel } from "./helpers";

const sonnet = seedModel("claude-sonnet-5-5");
const sol = seedModel("gpt-6-1-sol");
const box: Mailbox = { owner: "g1", local: "fuchs27", role: "guest", guestId: "g1", eventId: "e1", groupId: "gr1" };

const userMsg = (id: string, text: string, mailbox: boolean): ChatMessage => ({
  id,
  role: "user",
  text,
  createdAt: 1,
  contextDate: "Samstag, 10. Oktober 2026",
  connections: mailbox ? ["mailbox"] : undefined,
});
const botMsg = (id: string, text: string): ChatMessage => ({ id, role: "assistant", text, createdAt: 2, modelId: "claude-sonnet-5-5" });

const textOf = (m: PreparedMessage) => (m.role === "user" ? m.parts.map((p) => (p.type === "text" ? p.text : "")).join("") : m.text);

function withTools(model: typeof sonnet, messages: PreparedMessage[], connected = false) {
  const tools = [imageTool(async () => ({ ok: false, error: "x" }), () => {}), ...mailboxTools({ box, connected, emit: () => {} })].sort((a, b) =>
    a.name < b.name ? -1 : 1,
  );
  return request(model, messages, { tools: { webSearch: true, generateImage: true, mailbox: true }, customTools: tools, mailboxConnected: connected });
}

describe("Verbindung „Posteingang“", () => {
  it("der Hinweis steht nur in der Nachricht, in der umgeschaltet wurde", async () => {
    const history = [
      userMsg("1", "Hallo", false),
      botMsg("2", "Hi"),
      userMsg("3", "Was ist neu?", true),
      botMsg("4", "Zwei Mails"),
      userMsg("5", "Und weiter?", true),
      botMsg("6", "Nichts"),
      userMsg("7", "Danke", false),
      botMsg("8", "Gern"),
      userMsg("9", "Tschüss", false),
    ];
    const prepared = await prepareMessages(history, sonnet, { nativePdf: false, mailbox: true });
    const users = prepared.filter((m) => m.role === "user").map(textOf);
    expect(users[0]).not.toContain("[Verbindung");
    expect(users[1]).toContain(MAILBOX_ON_NOTE);
    expect(users[2]).not.toContain("[Verbindung");
    expect(users[3]).toContain(MAILBOX_OFF_NOTE);
    expect(users[4]).not.toContain("[Verbindung");
    // Der eigene Text bleibt am Ende (Hinweise stehen davor).
    expect(users[1].endsWith("Was ist neu?")).toBe(true);
    // Ohne Posteingang gibt es keine Hinweise.
    const off = await prepareMessages(history, sonnet, { nativePdf: false, mailbox: false });
    expect(off.filter((m) => m.role === "user").map(textOf).join("")).not.toContain("[Verbindung");
  });

  it("Claude: Werkzeuge nach Namen sortiert und strikt; Umschalten ändert keinen früheren Teil", async () => {
    const turn1 = [userMsg("1", "Hallo", false)];
    const turn2 = [...turn1, botMsg("2", "Hi"), userMsg("3", "Was ist neu?", true)];
    const turn3 = [...turn2, botMsg("4", "Zwei Mails"), userMsg("5", "Danke", false)];
    const build = async (h: ChatMessage[], connected: boolean) =>
      buildAnthropicRequest(withTools(sonnet, await prepareMessages(h, sonnet, { nativePdf: false, mailbox: true }), connected)).params;
    const a = await build(turn1, false);
    const b = await build(turn2, true);
    const c = await build(turn3, false);
    const tools = a.tools as { name: string; strict?: boolean }[];
    expect(tools.map((t) => t.name)).toEqual(["generate_image", "mailbox_list", "mailbox_read", "mailbox_send", "web_fetch", "web_search"]);
    expect(tools.filter((t) => t.name.startsWith("mailbox_")).every((t) => t.strict === true)).toBe(true);
    for (const [x, y] of [
      [a, b],
      [b, c],
    ]) {
      expect(JSON.stringify(y.tools)).toBe(JSON.stringify(x.tools));
      expect(JSON.stringify(y.system)).toBe(JSON.stringify(x.system));
      expect(JSON.stringify(y.messages.slice(0, x.messages.length))).toBe(JSON.stringify(x.messages));
    }
  });

  it("GPT: dieselben Werkzeuge als strikte Funktionen, Präfix bleibt gleich", async () => {
    const turn2 = [userMsg("1", "Hallo", false), botMsg("2", "Hi"), userMsg("3", "Was ist neu?", true)];
    const turn3 = [...turn2, botMsg("4", "Zwei Mails"), userMsg("5", "Danke", false)];
    const a = buildOpenAIRequest(withTools(sol, await prepareMessages(turn2, sol, { nativePdf: false, mailbox: true }), true));
    const b = buildOpenAIRequest(withTools(sol, await prepareMessages(turn3, sol, { nativePdf: false, mailbox: true })));
    const names = (a.tools ?? []).map((t) => ("name" in t ? t.name : t.type));
    expect(names).toEqual(["generate_image", "mailbox_list", "mailbox_read", "mailbox_send", "web_search"]);
    expect((a.tools ?? []).filter((t) => "strict" in t).every((t) => (t as { strict: boolean }).strict)).toBe(true);
    expect(JSON.stringify(b.tools)).toBe(JSON.stringify(a.tools));
    const ai = a.input as unknown[];
    expect(JSON.stringify((b.input as unknown[]).slice(0, ai.length))).toBe(JSON.stringify(ai));
  });

  it("der System-Prompt erklärt den Posteingang nur, wenn er eingeschaltet ist", () => {
    const on = buildSystemPrompt(DEFAULT_SETTINGS.features, "");
    const off = buildSystemPrompt({ ...DEFAULT_SETTINGS.features, mailbox: false }, "");
    expect(on).toContain("# Posteingang (Verbindung)");
    expect(on).toContain("mailbox_send");
    expect(off).not.toContain("Posteingang");
    // Eingefroren: keine Namen oder Adressen einzelner Personen.
    expect(on).not.toMatch(/[a-z]+\d{2}@/);
  });
});
