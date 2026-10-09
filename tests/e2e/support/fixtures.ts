import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  test as base,
  expect,
  request as playwrightRequest,
  type APIRequestContext,
  type Browser,
  type BrowserContext,
  type Locator,
  type Page,
} from "@playwright/test";
import { PASSWORDS, SERVERS } from "./servers.mjs";

export { expect };

/** Gleicher Hash wie in NoticeDialog.tsx – damit der Hinweis vorab als gelesen gilt. */
export function noticeKey(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return `freebie-notice-${h}`;
}

/** Unbehandelte Fehler im Browser während des laufenden Tests (Kriterium „sauber“). */
const browserErrors: string[] = [];

/** Sammelt unbehandelte Ausnahmen aller Seiten eines Kontexts – der Test schlägt am Ende fehl. */
export function trackErrors(context: BrowserContext) {
  const watch = (page: Page) => page.on("pageerror", (err) => browserErrors.push(`${page.url()}: ${err.message}`));
  context.pages().forEach(watch);
  context.on("page", watch);
}

/** Eigene IP-Kennung pro Test, damit sich die Login-Bremse nicht zwischen Tests auswirkt. */
export function ipFor(id: string): string {
  const h = createHash("sha256").update(id).digest();
  return `10.${h[0]}.${h[1]}.${h[2] || 1}`;
}

/** Eindeutiger Zusatz, damit parallele Tests sich nicht gegenseitig den Antwort-Cache füllen. */
export const uniq = () => Math.random().toString(36).slice(2, 8);

export class ChatPage {
  constructor(public readonly page: Page) {}

  get composer() {
    return this.page.getByRole("textbox", { name: "Nachricht" });
  }
  get sendButton() {
    return this.page.getByRole("button", { name: "Senden", exact: true });
  }
  get stopButton() {
    return this.page.getByRole("button", { name: "Antwort stoppen" });
  }
  get answers() {
    return this.page.getByRole("article", { name: "Antwort von Freebie" });
  }
  get questions() {
    return this.page.getByRole("article", { name: "Deine Nachricht" });
  }
  get lastAnswer() {
    return this.answers.last();
  }

  async open() {
    await this.page.goto("/");
    await expect(this.composer).toBeVisible();
  }

  /** Tippt und sendet, ohne auf die Antwort zu warten. */
  async send(text: string) {
    await this.composer.fill(text);
    await expect(this.sendButton).toBeEnabled();
    await this.sendButton.click();
  }

  /** Sendet und wartet, bis die Antwort vollständig gespeichert ist. */
  async ask(text: string): Promise<Locator> {
    const before = await this.answers.count();
    await this.send(text);
    await this.waitForAnswer(before + 1);
    return this.lastAnswer;
  }

  async waitForAnswer(count?: number) {
    if (count !== undefined) await expect(this.answers).toHaveCount(count, { timeout: 30_000 });
    await expect(this.lastAnswer).toHaveAttribute("aria-busy", "false", { timeout: 30_000 });
    await expect(this.stopButton).toBeHidden();
  }

  async newChat() {
    await this.page.getByRole("button", { name: "Neuer Chat" }).first().click();
  }

  /** Wert einer Zeile aus der Diagnose-Tabelle des Mock-Providers. */
  async diagnosis(answer: Locator, row: string): Promise<string> {
    const cell = answer.getByRole("row").filter({ has: this.page.getByRole("cell", { name: row, exact: true }) }).getByRole("cell").nth(1);
    return (await cell.innerText()).trim();
  }
}

/** Meldet einen Browser-Kontext als Teilnehmer an und markiert den Hinweis als gelesen. */
export async function loginUser(page: Page, opts: { acknowledgeNotice?: boolean } = {}) {
  const res = await page.request.post("/api/auth/login", { data: { password: PASSWORDS.app } });
  expect(res.status(), await res.text()).toBe(200);
  if (opts.acknowledgeNotice !== false) {
    const config = await (await page.request.get("/api/config")).json();
    const key = noticeKey(config.notice.full);
    await page.addInitScript((k) => {
      // Nur im Hauptfenster: in den abgeschotteten Artefakt-iframes ist localStorage gesperrt.
      if (window === window.top) localStorage.setItem(k, "1");
    }, key);
  }
}

/** Zweiter Browser-Kontext als Teilnehmerin bzw. Teilnehmer – z. B. um Admin-Änderungen im Chat zu prüfen. */
export async function openChat(browser: Browser, baseURL: string, ip: string, opts: { acknowledgeNotice?: boolean } = {}): Promise<ChatPage> {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1280, height: 860 },
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
    extraHTTPHeaders: { "x-forwarded-for": ip },
  });
  trackErrors(context);
  const page = await context.newPage();
  await loginUser(page, opts);
  const chat = new ChatPage(page);
  if (opts.acknowledgeNotice === false) await page.goto("/");
  else await chat.open();
  return chat;
}

/** Öffnet den Admin-Bereich angemeldet (Anmeldung über die API, Ansicht im Browser). */
export async function openAdmin(page: Page, tab?: string) {
  const res = await page.request.post("/api/admin/login", { data: { password: PASSWORDS.admin } });
  expect(res.status(), await res.text()).toBe(200);
  await page.goto("/admin");
  await expect(page.getByRole("tablist", { name: "Admin-Bereiche" })).toBeVisible();
  if (tab) await page.getByRole("tab", { name: tab }).click();
}

/** Admin-Zugang über die API (für Vorbereitung und Rücksetzen). */
export class AdminApi {
  constructor(public readonly api: APIRequestContext) {}

  static async create(baseURL: string, ip: string): Promise<AdminApi> {
    const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ip } });
    const res = await api.post("/api/admin/login", { data: { password: PASSWORDS.admin } });
    expect(res.status(), await res.text()).toBe(200);
    return new AdminApi(api);
  }

  async json<T = Record<string, unknown>>(method: "GET" | "POST" | "PUT" | "DELETE", url: string, data?: unknown): Promise<T> {
    const res = await this.api.fetch(url, { method, data });
    const body = await res.json().catch(() => ({}));
    expect(res.ok(), `${method} ${url}: ${res.status()} ${JSON.stringify(body)}`).toBeTruthy();
    return body as T;
  }

  settings() {
    return this.json<Record<string, unknown>>("GET", "/api/admin/settings");
  }
  updateSettings(patch: Record<string, unknown>) {
    return this.json("PUT", "/api/admin/settings", patch);
  }
  setFeatures(features: Record<string, boolean>) {
    return this.updateSettings({ features });
  }
  models() {
    return this.json<{ models: Record<string, unknown>[] }>("GET", "/api/admin/models").then((r) => r.models);
  }
  presets() {
    return this.json<{ presets: Record<string, unknown>[] }>("GET", "/api/admin/presets").then((r) => r.presets);
  }
  security(action: string, extra: Record<string, unknown> = {}) {
    return this.json("POST", "/api/admin/security", { action, ...extra });
  }

  /** Zustand direkt nach dem Serverstart (einmal pro Lauf gesichert). */
  async snapshot(file: string): Promise<Snapshot> {
    if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8")) as Snapshot;
    const snap: Snapshot = { settings: await this.settings(), models: await this.models(), presets: await this.presets() };
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify(snap));
    return snap;
  }

  /** Setzt Modelle, Vorlagen, Einstellungen, Passwort und Antwort-Cache zurück (Modelle zuerst: Einstellungen verweisen darauf). */
  async restore(snap: Snapshot) {
    const models = await this.models();
    // Das Standardmodell zuerst: es nimmt den anderen die Markierung ab.
    for (const m of [...snap.models].sort((a, b) => Number(b.isDefault) - Number(a.isDefault))) {
      const exists = models.some((x) => x.id === m.id);
      await this.json(exists ? "PUT" : "POST", "/api/admin/models", m);
    }
    const settings = { ...snap.settings };
    delete settings.appPasswordSet;
    delete settings.sessionVersion;
    await this.updateSettings(settings);
    for (const m of models) if (!snap.models.some((s) => s.id === m.id)) await this.json("DELETE", `/api/admin/models?id=${m.id}`);
    if ((await this.settings()).appPasswordSet) await this.security("reset-password");

    const presets = await this.presets();
    for (const p of presets) if (!snap.presets.some((s) => s.id === p.id)) await this.json("DELETE", `/api/admin/presets?id=${p.id}`);
    for (const p of snap.presets) {
      const exists = presets.some((x) => x.id === p.id);
      await this.json(exists ? "PUT" : "POST", "/api/admin/presets", p);
    }
    await this.security("clear-answer-cache");
  }
}

export interface Snapshot {
  settings: Record<string, unknown>;
  models: Record<string, unknown>[];
  presets: Record<string, unknown>[];
}

function serverNameFor(baseURL: string): string {
  const port = Number(new URL(baseURL).port);
  return Object.entries(SERVERS).find(([, s]) => s.port === port)?.[0] ?? "unbekannt";
}

interface Fixtures {
  ip: string;
  /** Angemeldeter Chat mit bestätigtem Hinweis. */
  chat: ChatPage;
  /** Admin-Zugang über die API. */
  admin: AdminApi;
  /** Auf seriellen Servern: Zustand nach jedem Test zurücksetzen (läuft automatisch). */
  serverReset: void;
}

export const test = base.extend<Fixtures>({
  ip: async ({}, use, testInfo) => {
    await use(ipFor(`${testInfo.testId}-${testInfo.repeatEachIndex}-${testInfo.retry}`));
  },
  context: async ({ context, ip }, use) => {
    await context.setExtraHTTPHeaders({ "x-forwarded-for": ip });
    browserErrors.length = 0;
    trackErrors(context);
    await use(context);
    expect(browserErrors, "unbehandelte Fehler im Browser").toEqual([]);
  },
  chat: async ({ page }, use) => {
    await loginUser(page);
    const chat = new ChatPage(page);
    await chat.open();
    await use(chat);
  },
  admin: async ({ baseURL, ip }, use) => {
    const admin = await AdminApi.create(baseURL!, ip);
    await use(admin);
    await admin.api.dispose();
  },
  serverReset: [
    async ({ baseURL }, use) => {
      const name = serverNameFor(baseURL!);
      if (!name.endsWith("serial")) return use();
      const ip = ipFor(`reset-${name}`);
      const before = await AdminApi.create(baseURL!, ip);
      const snap = await before.snapshot(path.resolve(".data/e2e", name, "snapshot.json"));
      await before.api.dispose();
      await use();
      // Neu anmelden: der Test kann alle Sitzungen abgemeldet haben.
      const after = await AdminApi.create(baseURL!, ip);
      await after.restore(snap);
      await after.api.dispose();
    },
    { auto: true },
  ],
});
