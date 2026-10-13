import type { APIRequestContext, Page } from "@playwright/test";
import { expect, type ChatPage } from "./fixtures";

// Gruppenchats (Plan: GRUPPENCHAT-PLAN.md): Seitenobjekt und API-Helfer für die Tests GC01–GC20.

export interface GroupSummary {
  id: string;
  title: string;
  owner: string;
  mine: boolean;
  left: boolean;
  unread: boolean;
  members: number;
}

export interface GroupMessage {
  id: string;
  seq: number;
  version: number;
  kind: "person" | "freebie" | "system";
  author: string | null;
  text: string;
  status?: "pending" | "done" | "stopped" | "error";
  askedBy?: string;
  error?: string;
  system?: { action: string; actor: string; targets?: string[]; title?: string };
}

export interface GroupDetail {
  id: string;
  title: string;
  owner: string;
  mine: boolean;
  members: string[];
  left: boolean;
  version: number;
  messages: GroupMessage[];
}

/** Gruppenchat über die API starten (mit den Cookies der Seite bzw. des Kontexts). */
export async function startGroupChat(api: APIRequestContext, title: string, members: string[], groupId?: string): Promise<GroupSummary> {
  const res = await api.post("/api/groupchats", { data: { title, members, ...(groupId ? { groupId } : {}) } });
  expect(res.status(), await res.text()).toBe(200);
  return ((await res.json()) as { chat: GroupSummary }).chat;
}

/** Beitrag über die API posten. */
export async function postMessage(api: APIRequestContext, chatId: string, text: string): Promise<GroupMessage> {
  const res = await api.post(`/api/groupchats/${chatId}/messages`, { data: { text } });
  expect(res.status(), await res.text()).toBe(200);
  return ((await res.json()) as { message: GroupMessage }).message;
}

export async function groupChatOf(api: APIRequestContext, chatId: string, since = 0): Promise<GroupDetail> {
  const res = await api.get(`/api/groupchats/${chatId}?since=${since}`);
  expect(res.status(), await res.text()).toBe(200);
  return ((await res.json()) as { chat: GroupDetail }).chat;
}

export async function groupChatsOf(api: APIRequestContext): Promise<GroupSummary[]> {
  const res = await api.get("/api/groupchats");
  expect(res.status(), await res.text()).toBe(200);
  return ((await res.json()) as { chats: GroupSummary[] }).chats;
}

/** Freebie über die API fragen und die SSE-Antwort ganz lesen (Text der Antwort). */
export async function askFreebie(api: APIRequestContext, chatId: string, modelId: string, extra: Record<string, unknown> = {}) {
  const res = await api.post(`/api/groupchats/${chatId}/freebie`, { data: { modelId, ...extra }, timeout: 60_000 });
  return { status: res.status(), body: await res.text() };
}

/** Seitenobjekt für Gruppenchats (analog zu ChatPage und MailPage). */
export class GroupChatPage {
  constructor(public readonly page: Page) {}

  static of(chat: ChatPage) {
    return new GroupChatPage(chat.page);
  }

  get newButton() {
    return this.page.getByRole("button", { name: "Neuer Gruppenchat" });
  }
  get section() {
    return this.page.getByRole("navigation", { name: "Chatverlauf" });
  }
  /** Eintrag in der Seitenleiste („Name“, „Name, neue Nachrichten“, „Name, verlassen“). */
  entry(title: string) {
    return this.section.getByRole("button", { name: new RegExp(`^${esc(title)}(, verlassen)?(, neue Nachrichten)?$`) });
  }
  get dialog() {
    return this.page.getByRole("dialog", { name: "Neuer Gruppenchat" });
  }
  get membersDialog() {
    return this.page.getByRole("dialog", { name: "Mitglieder" });
  }
  get heading() {
    return this.page.getByRole("heading", { level: 1 });
  }
  get composer() {
    return this.page.getByRole("textbox", { name: "Nachricht" });
  }
  get sendButton() {
    return this.page.getByRole("button", { name: "Senden", exact: true });
  }
  get conversation() {
    return this.page.getByRole("region", { name: "Gespräch" });
  }
  get answers() {
    return this.conversation.getByRole("article", { name: "Antwort von Freebie" });
  }
  get mine() {
    return this.conversation.getByRole("article", { name: "Deine Nachricht" });
  }
  from(name: string) {
    return this.conversation.getByRole("article", { name: `Nachricht von ${name}` });
  }
  get notes() {
    return this.conversation.getByRole("note");
  }
  /** Personen-Knopf der Kopfzeile (Desktop: Avatare, Handy: Symbol mit Zahl). */
  get membersButton() {
    return this.page.getByRole("button", { name: /^Mitglieder \(\d+\)$/ }).filter({ visible: true });
  }

  /** Über die Oberfläche starten: Name, Personen (Benutzernamen), optional Gruppe (Kursleitung). */
  async start(title: string, people: string[], group?: string) {
    await this.newButton.click();
    await expect(this.dialog).toBeVisible();
    await this.dialog.getByRole("textbox", { name: "Name" }).fill(title);
    if (group) await this.dialog.getByRole("combobox", { name: "Gruppe" }).selectOption({ label: group });
    for (const p of people) await this.dialog.getByRole("checkbox", { name: p }).check();
    await this.dialog.getByRole("button", { name: "Chat starten" }).click();
    await expect(this.dialog).toBeHidden();
    await expect(this.heading).toHaveText(title);
  }

  async open(title: string) {
    await this.entry(title).click();
    await expect(this.heading).toHaveText(title);
  }

  /** Beitrag schreiben und senden; wartet, bis er im Verlauf steht. */
  async post(text: string) {
    const before = await this.mine.count();
    await this.composer.fill(text);
    await expect(this.sendButton).toBeEnabled();
    await this.sendButton.click();
    await expect(this.mine).toHaveCount(before + 1);
  }

  /** Wartet, bis die letzte Antwort fertig ist (bei der fragenden Person und bei allen anderen). */
  async waitForAnswer(count: number) {
    await expect(this.answers).toHaveCount(count, { timeout: 30_000 });
    await expect(this.answers.last()).toHaveAttribute("aria-busy", "false", { timeout: 30_000 });
  }
}

export const esc = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
