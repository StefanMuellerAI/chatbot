import { createHash, randomUUID } from "node:crypto";
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
import { ADMIN, SERVERS, TEST_EVENT } from "./servers.mjs";

export { expect };

/** Gleicher Schlüssel wie in NoticeDialog.tsx (pro Konto) – damit der Hinweis vorab als gelesen gilt. */
export function noticeKey(text: string, accountKey: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return `freebie-notice-${h}-${accountKey}`;
}

/** Unbehandelte Fehler im Browser während des laufenden Tests (Kriterium „sauber“). */
const browserErrors: string[] = [];

/** Sammelt unbehandelte Ausnahmen aller Seiten eines Kontexts – der Test schlägt am Ende fehl. */
export function trackErrors(context: BrowserContext) {
  const watch = (page: Page) =>
    page.on("pageerror", (err) => {
      // Von der Sandbox blockierte Zugriffe aus Artefakten sind gewollt (K02), kein Fehler der App.
      if (/sandboxed/i.test(err.message)) return;
      // WebKit meldet Anfragen, die eine Navigation (z. B. zum Login) abbricht, als „access control checks“.
      if (/due to access control checks/i.test(err.message)) return;
      browserErrors.push(`${page.url()}: ${err.message}`);
    });
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
  /** Zugangsdaten des angemeldeten Gastes (falls über die Fixtures angelegt). */
  guest: Guest | null = null;
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

/** Zeitpunkt in so vielen Minuten (ISO). */
export const inMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000).toISOString();

export interface Guest {
  id: string;
  username: string;
  password: string;
}

// ---------------------------------------------------------------- Gäste für die Tests

/** Admin-Zugang je Worker und Server für Hilfsaufgaben (Gäste anlegen). */
const helpers = new Map<string, Promise<APIRequestContext>>();
/** Gruppe im Test-Termin je Server (wird bei Bedarf neu angelegt). */
const testGroups = new Map<string, Promise<string>>();

async function helperLogin(baseURL: string): Promise<APIRequestContext> {
  const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ipFor(`helfer-${process.pid}`) } });
  const res = await api.post("/api/auth/login", { data: ADMIN });
  expect(res.status(), await res.text()).toBe(200);
  return api;
}

/** Admin-Aufruf mit erneuter Anmeldung, falls ein Test alle Sitzungen beendet hat. */
async function helperCall<T>(baseURL: string, method: "GET" | "POST", url: string, data?: unknown): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    if (!helpers.has(baseURL)) helpers.set(baseURL, helperLogin(baseURL));
    const api = await helpers.get(baseURL)!;
    const res = await api.fetch(url, { method, data });
    if (res.status() === 401 && attempt === 0) {
      helpers.delete(baseURL);
      continue;
    }
    const body = await res.json().catch(() => ({}));
    if (!res.ok()) throw new Error(`${method} ${url}: ${res.status()} ${JSON.stringify(body)}`);
    return body as T;
  }
}

interface EventListItem {
  id: string;
  name: string;
  status: string;
  groups: { id: string; name: string }[];
}

async function findOrCreateTestGroup(baseURL: string): Promise<string> {
  const { events } = await helperCall<{ events: EventListItem[] }>(baseURL, "GET", "/api/admin/events");
  let event = events.find((e) => e.name === TEST_EVENT && e.status === "laeuft");
  if (!event) {
    const startsAt = new Date(Date.now() - 5 * 60_000).toISOString();
    const endsAt = new Date(Date.now() + 23 * 60 * 60_000).toISOString();
    const { id } = await helperCall<{ id: string }>(baseURL, "POST", "/api/admin/events", { name: TEST_EVENT, startsAt, endsAt });
    event = { id, name: TEST_EVENT, status: "laeuft", groups: [] };
  }
  const group = event.groups.find((g) => g.name === "E2E");
  if (group) return group.id;
  return (await helperCall<{ id: string }>(baseURL, "POST", "/api/admin/events/groups", { eventId: event.id, name: "E2E", count: 0 })).id;
}

/** Neuer Gast im laufenden Test-Termin des Servers (eigene Identität pro Test). */
export async function createGuest(baseURL: string): Promise<Guest> {
  for (let attempt = 0; ; attempt++) {
    if (!testGroups.has(baseURL)) testGroups.set(baseURL, findOrCreateTestGroup(baseURL));
    try {
      const groupId = await testGroups.get(baseURL)!;
      const { guests } = await helperCall<{ guests: Guest[] }>(baseURL, "POST", "/api/admin/events/guests", { groupId, count: 1 });
      return guests[0];
    } catch (err) {
      // Termin oder Gruppe von einem Test gelöscht: neu anlegen.
      testGroups.delete(baseURL);
      if (attempt > 0) throw err;
    }
  }
}

const currentBaseURL = () => String(test.info().project.use.baseURL);

/** Meldet einen Browser-Kontext an (als neuer Gast oder mit gegebenen Zugangsdaten) und bestätigt den Hinweis. */
export async function loginUser(
  page: Page,
  opts: { acknowledgeNotice?: boolean; baseURL?: string; guest?: { username: string; password: string } } = {},
): Promise<Guest | null> {
  const guest = opts.guest ?? (await createGuest(opts.baseURL ?? currentBaseURL()));
  const res = await page.request.post("/api/auth/login", { data: { username: guest.username, password: guest.password } });
  expect(res.status(), await res.text()).toBe(200);
  if (opts.acknowledgeNotice !== false) {
    const { key: account } = (await res.json()) as { key: string };
    const config = await (await page.request.get("/api/config")).json();
    const key = noticeKey(config.notice.full, account);
    await page.addInitScript((k) => {
      // Nur im Hauptfenster: in den abgeschotteten Artefakt-iframes ist localStorage gesperrt.
      if (window === window.top) localStorage.setItem(k, "1");
    }, key);
  }
  return "id" in guest ? (guest as Guest) : null;
}

/** Von openChat geöffnete Browser-Kontexte – werden nach jedem Test geschlossen. */
const extraContexts: BrowserContext[] = [];

/** Zweiter Browser-Kontext als Teilnehmerin bzw. Teilnehmer – z. B. um Admin-Änderungen im Chat zu prüfen. */
export async function openChat(
  browser: Browser,
  baseURL: string,
  ip: string,
  opts: { acknowledgeNotice?: boolean; guest?: { id?: string; username: string; password: string } } = {},
): Promise<ChatPage> {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1280, height: 860 },
    locale: "de-DE",
    timezoneId: "Europe/Berlin",
    extraHTTPHeaders: { "x-forwarded-for": ip },
  });
  trackErrors(context);
  extraContexts.push(context);
  const page = await context.newPage();
  const guest = await loginUser(page, { ...opts, baseURL });
  const chat = new ChatPage(page);
  chat.guest = guest ?? (opts.guest?.id ? (opts.guest as Guest) : null);
  if (opts.acknowledgeNotice === false) await page.goto("/");
  else await chat.open();
  return chat;
}

/** Öffnet den Admin-Bereich angemeldet (Anmeldung über die API, Ansicht im Browser). */
export async function openAdmin(page: Page, tab?: string) {
  const res = await page.request.post("/api/auth/login", { data: ADMIN });
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
    const res = await api.post("/api/auth/login", { data: ADMIN });
    expect(res.status(), await res.text()).toBe(200);
    return new AdminApi(api);
  }

  async json<T = Record<string, unknown>>(method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE", url: string, data?: unknown): Promise<T> {
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
  /** Termin von jetzt + start bis jetzt + end Minuten; liefert die ID. */
  async createEvent(name: string, start = -5, end = 120): Promise<string> {
    return (await this.json<{ id: string }>("POST", "/api/admin/events", { name, startsAt: inMinutes(start), endsAt: inMinutes(end) })).id;
  }
  createGroup(eventId: string, name: string, count: number) {
    return this.json<{ id: string; guests: Guest[] }>("POST", "/api/admin/events/groups", { eventId, name, count });
  }

  // ---------------------------------------------------------------- Fundus pflegen

  fundus() {
    return this.json<FundusOverview>("GET", "/api/admin/fundus");
  }
  /** Lädt eine Datei nach `fundus/` hoch (vorgemerkt, noch nicht gespeichert); liefert den Schlüssel. */
  async uploadFundusFile(name: string, data: Buffer): Promise<string> {
    const key = `fundus/${randomUUID()}/${name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "_").replace(/^[._]+/, "") || "datei"}`;
    const res = await this.api.post("/api/admin/fundus/local", { multipart: { key, file: { name, mimeType: "application/octet-stream", buffer: data } } });
    expect(res.status(), await res.text()).toBe(200);
    return key;
  }
  /** Lädt Dateien hoch und speichert sie als eigene Dokumente (mit Bestätigung). */
  async addDocuments(files: { name: string; data: Buffer; meta?: Partial<FundusMeta> }[]): Promise<string[]> {
    const refs = [];
    for (const f of files) refs.push({ key: await this.uploadFundusFile(f.name, f.data), name: f.name, ...fundusMeta(f.name, f.meta) });
    const { saved, failed } = await this.json<{ saved: string[]; failed: unknown[] }>("POST", "/api/admin/fundus/documents", { confirmed: true, files: refs });
    expect(failed).toEqual([]);
    return saved;
  }
  /** Lädt .eml-Dateien hoch und speichert sie als eigenen Verlauf. */
  async addThread(files: { name: string; data: Buffer }[], meta: Partial<FundusMeta> = {}): Promise<{ id: string; mails: number; attachments: number }> {
    const refs = [];
    for (const f of files) refs.push({ key: await this.uploadFundusFile(f.name, f.data), name: f.name });
    return this.json("POST", "/api/admin/fundus/threads", { confirmed: true, files: refs, ...fundusMeta("Verlauf", meta) });
  }
  async createCategory(name: string): Promise<string> {
    return (await this.json<{ id: string }>("POST", "/api/admin/fundus/categories", { name })).id;
  }
  async createPrompt(p: { title: string; categoryId: string; text: string; description?: string; placeholders?: Record<string, unknown>; enabled?: boolean }): Promise<string> {
    return (await this.json<{ id: string }>("POST", "/api/admin/fundus/prompts", p)).id;
  }
  updatePrompt(p: { id: string; title: string; categoryId: string; text: string; description?: string; placeholders?: Record<string, unknown>; enabled?: boolean }) {
    return this.json("PUT", "/api/admin/fundus/prompts", p);
  }
  deleteFundus(kind: "documents" | "threads" | "prompts" | "categories", id: string) {
    return this.json("DELETE", `/api/admin/fundus/${kind}?id=${encodeURIComponent(id)}`);
  }
  hide(id: string, hidden = true) {
    return this.json("PUT", "/api/admin/fundus/hidden", { id, hidden });
  }

  /** Zustand direkt nach dem Serverstart (einmal pro Lauf gesichert). */
  async snapshot(file: string): Promise<Snapshot> {
    if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8")) as Snapshot;
    const { categories, prompts } = await this.fundus();
    const snap: Snapshot = { settings: await this.settings(), models: await this.models(), presets: await this.presets(), categories, prompts };
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
    delete settings.sessionVersion;
    await this.updateSettings(settings);
    for (const m of models) if (!snap.models.some((s) => s.id === m.id)) await this.json("DELETE", `/api/admin/models?id=${m.id}`);
    // Termine aus den Tests entfernen – nur der gemeinsame Test-Termin bleibt.
    const { events } = await this.json<{ events: { id: string; name: string }[] }>("GET", "/api/admin/events");
    for (const e of events) if (e.name !== TEST_EVENT) await this.json("DELETE", `/api/admin/events?id=${e.id}`);

    const presets = await this.presets();
    for (const p of presets) if (!snap.presets.some((s) => s.id === p.id)) await this.json("DELETE", `/api/admin/presets?id=${p.id}`);
    for (const p of snap.presets) {
      const exists = presets.some((x) => x.id === p.id);
      await this.json(exists ? "PUT" : "POST", "/api/admin/presets", p);
    }
    await this.restoreFundus(snap);
    await this.security("clear-answer-cache");
  }

  /**
   * Fundus wie nach dem Start: eigene Einträge samt Dateien weg, alles eingeblendet, Kategorien und Prompts aus dem
   * Schnappschuss (Inhalt und Reihenfolge). Gelöschte Start-Einträge entstehen neu (mit neuer ID).
   */
  async restoreFundus(snap: Snapshot) {
    let now = await this.fundus();
    for (const t of now.threads) if (t.source === "eigen") await this.deleteFundus("threads", t.id);
    for (const d of now.documents) if (d.source === "eigen" && !d.threadId) await this.deleteFundus("documents", d.id);
    if (now.documents.some((d) => d.hidden) || now.threads.some((t) => t.hidden)) await this.json("PUT", "/api/admin/fundus/hidden", { all: true, hidden: false });

    // Kategorien: vorhandene per ID (sonst per Name), fehlende neu anlegen.
    const categoryId = new Map<string, string>();
    for (const c of snap.categories) {
      const match = now.categories.find((x) => x.id === c.id) ?? now.categories.find((x) => x.name.toLowerCase() === c.name.toLowerCase());
      if (!match) categoryId.set(c.id, await this.createCategory(c.name));
      else {
        categoryId.set(c.id, match.id);
        if (match.name !== c.name) await this.json("PUT", "/api/admin/fundus/categories", { id: match.id, name: c.name });
      }
    }
    const keep = new Set(snap.prompts.map((p) => p.id));
    const extra = now.prompts.filter((p) => !keep.has(p.id));
    for (let i = 0; i < extra.length; i += 10) await Promise.all(extra.slice(i, i + 10).map((p) => this.deleteFundus("prompts", p.id)));
    for (const p of snap.prompts) {
      const body = { title: p.title, categoryId: categoryId.get(p.categoryId)!, description: p.description, text: p.text, placeholders: p.placeholders, enabled: p.enabled };
      const current = now.prompts.find((x) => x.id === p.id);
      if (!current) await this.createPrompt(body);
      else if (
        JSON.stringify(body) !==
        JSON.stringify({ title: current.title, categoryId: current.categoryId, description: current.description, text: current.text, placeholders: current.placeholders, enabled: current.enabled })
      ) {
        await this.updatePrompt({ id: p.id, ...body });
      }
    }
    now = await this.fundus();
    const wanted = new Set(categoryId.values());
    for (const c of now.categories) if (!wanted.has(c.id)) await this.deleteFundus("categories", c.id);

    // Reihenfolge mit „eine Stelle nach oben“ herstellen.
    const reorder = async (current: string[], target: string[], move: (id: string) => Promise<unknown>) => {
      const list = current.filter((id) => target.includes(id));
      for (let i = 0; i < target.length; i++) {
        let j = list.indexOf(target[i]);
        while (j > i) {
          await move(target[i]);
          [list[j - 1], list[j]] = [list[j], list[j - 1]];
          j--;
        }
      }
    };
    now = await this.fundus();
    await reorder(
      now.categories.map((c) => c.id),
      snap.categories.map((c) => categoryId.get(c.id)!),
      (id) => this.json("PUT", "/api/admin/fundus/categories", { id, move: -1 }),
    );
    const idOf = new Map(now.prompts.map((p) => [p.id, p.id]));
    for (const c of snap.categories) {
      const target = snap.prompts.filter((p) => p.categoryId === c.id).map((p) => idOf.get(p.id) ?? p.id);
      const current = now.prompts.filter((p) => p.categoryId === categoryId.get(c.id)).map((p) => p.id);
      await reorder(current, target, (id) => this.json("PATCH", "/api/admin/fundus/prompts", { id, move: -1 }));
    }
  }
}

/** Angaben zu einem eigenen Dokument oder Verlauf. */
export interface FundusMeta {
  title: string;
  summary: string;
  date: string;
  tags: string[];
  keywords: string[];
}

export function fundusMeta(name: string, meta: Partial<FundusMeta> = {}): FundusMeta {
  return { title: name.replace(/\.[a-z]+$/i, ""), summary: "", date: "2026-10-14", tags: [], keywords: [], ...meta };
}

export interface FundusOverview {
  revision: number;
  libraryEnabled: boolean;
  documents: { id: string; source: "eigen" | "fundus"; title: string; type: string; enabled: boolean; hidden: boolean; threadId: string | null; fileName: string; tags: string[] }[];
  threads: { id: string; source: "eigen" | "fundus"; title: string; mails: number; attachments: number; enabled: boolean; hidden: boolean }[];
  categories: { id: string; name: string; prompts: number; activePrompts: number }[];
  prompts: { id: string; categoryId: string; title: string; description: string; text: string; placeholders: Record<string, unknown>; enabled: boolean }[];
}

export interface Snapshot {
  settings: Record<string, unknown>;
  models: Record<string, unknown>[];
  presets: Record<string, unknown>[];
  categories: FundusOverview["categories"];
  prompts: FundusOverview["prompts"];
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
  /** Schließt die zusätzlichen Chat-Fenster eines Tests (läuft automatisch). */
  closeChats: void;
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
    const guest = await loginUser(page);
    const chat = new ChatPage(page);
    chat.guest = guest;
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
  closeChats: [
    async ({}, use) => {
      await use();
      for (const context of extraContexts.splice(0)) await context.close().catch(() => {});
    },
    { auto: true },
  ],
});
