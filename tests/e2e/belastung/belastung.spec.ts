import { spawn, type ChildProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import { rmSync } from "node:fs";
import path from "node:path";
import { request as playwrightRequest, type APIRequestContext, type Browser } from "@playwright/test";
import { AdminApi, ChatPage, expect, loginUser, openChat, test, trackErrors, uniq } from "../support/fixtures";

// W: Ausfälle und Last. Zeitbudgets sind großzügig gewählt (CI-Rechner sind langsamer),
// fangen aber echte Einbrüche wie Sekunden-Hänger oder Sperren ab.

// ---------------------------------------------------------------- W01 Neustart

const RESTART_PORT = 3110;
const restartUrl = `http://localhost:${RESTART_PORT}`;

async function startServer(keepData: boolean): Promise<ChildProcess> {
  const child = spawn(process.execPath, ["tests/e2e/support/serve.mjs", "neustart", String(RESTART_PORT), "mock"], {
    env: { ...process.env, E2E_KEEP_DATA: keepData ? "1" : "0" },
    stdio: "ignore",
  });
  await expect(async () => {
    const res = await fetch(`${restartUrl}/login`);
    expect(res.status).toBe(200);
  }).toPass({ timeout: 60_000, intervals: [250] });
  return child;
}

async function stopServer(child: ChildProcess) {
  const exited = new Promise((resolve) => child.once("exit", resolve));
  child.kill("SIGTERM");
  await exited;
}

test("W01 Server-Neustart: Anmeldung, Einstellungen, Antwort-Cache und Verlauf bleiben", async ({ browser, ip }) => {
  let server = await startServer(false);
  try {
    const chat = await openChat(browser, restartUrl, ip);
    const question = `Vor dem Neustart ${uniq()}`;
    await chat.ask(question);
    const admin = await AdminApi.create(restartUrl, `${ip}-a`);
    await admin.updateSettings({ noticeShort: "Neustart-Test: der Kurzhinweis bleibt." });
    await admin.api.dispose();

    await stopServer(server);
    server = await startServer(true);

    await chat.page.reload();
    await expect(chat.page).not.toHaveURL(/\/login/);
    await expect(chat.composer).toBeVisible();
    await expect(chat.page.getByText("Neustart-Test: der Kurzhinweis bleibt.")).toBeVisible();
    await expect(chat.page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: new RegExp(`^${question}`) })).toBeVisible();
    await chat.newChat();
    await expect((await chat.ask(question)).getByText("aus dem Cache")).toBeVisible();
    await chat.page.context().close();
  } finally {
    await stopServer(server);
    rmSync(path.resolve(".data/e2e/neustart"), { recursive: true, force: true });
  }
});

// ---------------------------------------------------------------- W02 Abbrüche

test("W02 Neuladen während einer Antwort: Hinweis mit „Neu generieren“, danach sauberer Verlauf", async ({ chat, page }) => {
  const question = `Neu laden mittendrin ${uniq()} #langsam`;
  await chat.send(question);
  await expect(chat.lastAnswer).toContainText("Testmodus", { timeout: 10_000 });
  await page.reload();
  await page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: /^Neu laden mittendrin/ }).click();
  await expect(chat.questions).toHaveCount(1);
  const missing = chat.lastAnswer.getByRole("alert");
  await expect(missing).toHaveText("Die Antwort fehlt – die Seite wurde während der Antwort neu geladen oder die Verbindung ist abgebrochen. Bitte „Neu generieren“ verwenden.");
  await chat.lastAnswer.getByRole("button", { name: "Neu generieren" }).click();
  await chat.waitForAnswer(1);
  await expect(chat.lastAnswer.getByRole("alert")).toHaveCount(0);
  await expect(chat.questions).toHaveCount(1);
  // Nach einem weiteren Neuladen bleibt der Verlauf vollständig.
  await page.reload();
  await page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: /^Neu laden mittendrin/ }).click();
  await expect(chat.answers).toHaveCount(1);
  await expect(chat.lastAnswer.getByRole("alert")).toHaveCount(0);
});

test("W02 Netz weg beim Senden: verständliche Meldung, danach geht es weiter", async ({ chat, context }) => {
  // Ein Abriss mitten im Stream ist in C11 abgedeckt (Chromium trennt laufende Verbindungen offline nicht).
  await context.setOffline(true);
  await chat.send(`Ohne Netz ${uniq()}`);
  await expect(chat.lastAnswer.getByRole("alert")).toHaveText("Keine Verbindung zu Freebie. Bitte prüfe die Internetverbindung und versuche es erneut.");
  await expect(chat.questions).toHaveCount(1);
  await context.setOffline(false);
  await chat.lastAnswer.getByRole("button", { name: "Neu generieren" }).click();
  await chat.waitForAnswer(1);
  await expect(chat.lastAnswer.getByRole("alert")).toHaveCount(0);
  await expect(chat.lastAnswer).toContainText("Testmodus");
});

// ---------------------------------------------------------------- W03 große Datenmengen

function bigExport(): { json: string; bigTitle: string } {
  const now = Date.now();
  const conversations = [];
  for (let i = 0; i < 499; i++) {
    const t = now - (i + 1) * 3_600_000;
    conversations.push({
      id: randomUUID(),
      title: `Archiv-Chat ${i}`,
      modelId: "claude-sonnet-5-5",
      presetId: null,
      createdAt: t,
      updatedAt: t,
      messages: [
        { id: randomUUID(), role: "user", text: `Frage ${i}`, createdAt: t },
        { id: randomUUID(), role: "assistant", text: `Antwort ${i}: ${"Text ".repeat(40)}`, createdAt: t + 1 },
      ],
    });
  }
  const bigTitle = `Großer Chat ${uniq()}`;
  const messages = [];
  for (let i = 0; i < 50; i++) {
    messages.push({ id: randomUUID(), role: "user", text: `Frage Nummer ${i}: ${"Inhalt ".repeat(30)}`, createdAt: now + i * 2 });
    messages.push({ id: randomUUID(), role: "assistant", text: `## Antwort ${i}\n\n${"- Punkt mit **Markdown**\n".repeat(8)}\n\`\`\`ts\nconst x = ${i};\n\`\`\``, createdAt: now + i * 2 + 1 });
  }
  conversations.push({ id: randomUUID(), title: bigTitle, modelId: "claude-sonnet-5-5", presetId: null, createdAt: now, updatedAt: now + 1000, messages });
  return { json: JSON.stringify({ app: "freebie", version: 1, conversations }), bigTitle };
}

async function timed<T>(label: string, budgetMs: number, action: () => Promise<T>): Promise<T> {
  const started = Date.now();
  const result = await action();
  const ms = Date.now() - started;
  test.info().annotations.push({ type: "Zeit", description: `${label}: ${ms} ms (Budget ${budgetMs} ms)` });
  expect(ms, `${label} dauerte ${ms} ms`).toBeLessThan(budgetMs);
  return result;
}

test("W03 500 Chats und ein Chat mit 100 Nachrichten bleiben flüssig", async ({ chat, page }) => {
  const { json, bigTitle } = bigExport();
  const nav = page.getByRole("navigation", { name: "Chatverlauf" });
  await timed("Import von 500 Chats", 10_000, async () => {
    const dialog = page.waitForEvent("dialog");
    await page.getByLabel("Export-Datei für den Import").setInputFiles({ name: "gross.json", mimeType: "application/json", buffer: Buffer.from(json) });
    const d = await dialog;
    expect(d.message()).toBe("500 Chats importiert.");
    await d.accept();
    await expect(nav.getByRole("button", { name: new RegExp(`^${bigTitle}`) })).toBeVisible();
  });

  await timed("Suche in 500 Chats", 2_000, async () => {
    await page.getByRole("searchbox", { name: "Chats durchsuchen" }).fill("Archiv-Chat 437");
    await expect(nav.getByRole("button", { name: /^Archiv-Chat 437/ })).toBeVisible();
    await expect(nav.getByRole("button", { name: /^Archiv-Chat 436/ })).toHaveCount(0);
  });
  await page.getByRole("searchbox", { name: "Chats durchsuchen" }).fill("");

  await timed("Großen Chat öffnen", 4_000, async () => {
    await nav.getByRole("button", { name: new RegExp(`^${bigTitle}`) }).click();
    await expect(chat.answers).toHaveCount(50);
    await expect(chat.lastAnswer).toContainText("Antwort 49");
  });

  await timed("Neue Frage im großen Chat", 15_000, async () => {
    await chat.ask(`Und noch eine Frage ${uniq()}`);
    await expect(chat.answers).toHaveCount(51);
  });

  await timed("Wechsel zu einem kleinen Chat und zurück", 4_000, async () => {
    await page.getByRole("searchbox", { name: "Chats durchsuchen" }).fill("Archiv-Chat 3");
    await nav.getByRole("button", { name: /^Archiv-Chat 3\b/ }).first().click();
    await expect(chat.answers).toHaveCount(1);
    await page.getByRole("searchbox", { name: "Chats durchsuchen" }).fill("");
    await nav.getByRole("button", { name: new RegExp(`^${bigTitle}`) }).click();
    await expect(chat.answers).toHaveCount(51);
  });
});

// ---------------------------------------------------------------- W04 Schulungssituation

interface ChatResult {
  status: number;
  fromCache: boolean;
  done: boolean;
  error?: string;
}

async function apiChat(api: APIRequestContext, text: string): Promise<ChatResult> {
  const res = await api.post("/api/chat", {
    data: {
      conversationId: randomUUID(),
      modelId: "claude-sonnet-5-5",
      presetId: null,
      messages: [{ id: randomUUID(), role: "user", text, createdAt: Date.now(), effort: "medium", webSearch: true }],
    },
    timeout: 60_000,
  });
  const events = (await res.text())
    .split("\n")
    .filter((l) => l.startsWith("data: "))
    .map((l) => JSON.parse(l.slice(6)) as { type: string; fromCache?: boolean; message?: string });
  return {
    status: res.status(),
    fromCache: events.some((e) => e.type === "start" && e.fromCache),
    done: events.some((e) => e.type === "done"),
    error: events.find((e) => e.type === "error")?.message,
  };
}

async function participants(baseURL: string, ip: string, count: number): Promise<APIRequestContext[]> {
  return Promise.all(Array.from({ length: count }, () => playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ip } })));
}

test("W04 25 Teilnehmende über eine IP: keine Sperre, keine Fehler, gemeinsamer Antwort-Cache", async ({ baseURL, ip, browser, admin }) => {
  // Eine echte Schulungsgruppe: ein Termin, eine Gruppe, 25 Gäste.
  const { id: eventId } = await admin.json<{ id: string }>("POST", "/api/admin/events", {
    name: `Schulung ${uniq()}`,
    startsAt: new Date(Date.now() - 60_000).toISOString(),
    endsAt: new Date(Date.now() + 3 * 3_600_000).toISOString(),
  });
  const { guests } = await admin.json<{ guests: { username: string; password: string }[] }>("POST", "/api/admin/events/groups", { eventId, name: "Gruppe A", count: 25 });
  expect(guests).toHaveLength(25);
  const group = await participants(baseURL!, ip, 25);
  try {
    // Ein paar Tippfehler gehören dazu …
    for (let i = 0; i < 5; i++) {
      expect((await group[i].post("/api/auth/login", { data: { username: guests[i].username, password: `tippfehler${i}` } })).status()).toBe(401);
    }
    // … und dann melden sich alle gleichzeitig an.
    const logins = await Promise.all(group.map((api, i) => api.post("/api/auth/login", { data: guests[i] })));
    expect(logins.map((r) => r.status())).toEqual(Array(25).fill(200));

    // Alle stellen gleichzeitig eine eigene Frage.
    const own = await Promise.all(group.map((api, i) => apiChat(api, `Eigene Frage ${i} ${uniq()}`)));
    for (const r of own) expect(r, JSON.stringify(r)).toMatchObject({ status: 200, done: true, error: undefined });

    // Die Kursleitung stellt eine Aufgabe, eine Person ist schneller – alle anderen bekommen den Cache.
    const task = `Schulungsaufgabe: Erkläre Prompt Engineering ${uniq()}`;
    expect(await apiChat(group[0], task)).toMatchObject({ status: 200, done: true, fromCache: false });
    const rest = await Promise.all(group.slice(1).map((api) => apiChat(api, task)));
    expect(rest.filter((r) => r.fromCache && r.done)).toHaveLength(24);

    // Auch im Browser: eine Person fragt zuerst, vier gleichzeitig hinterher.
    // (Exakt gleichzeitig gestellte Fragen verfehlen den Cache – es gibt noch keine Antwort.)
    const pages = await Promise.all(Array.from({ length: 5 }, (_, i) => browserChat(browser, baseURL!, ip, guests[i])));
    const browserTask = `Aufgabe im Browser ${uniq()}`;
    await pages[0].ask(browserTask);
    const answers = await Promise.all(pages.slice(1).map((c) => c.ask(browserTask)));
    for (const a of answers) await expect(a.getByText("aus dem Cache")).toBeVisible();
    await Promise.all(pages.map((c) => c.page.context().close()));
  } finally {
    await Promise.all(group.map((api) => api.dispose()));
  }
});

// ---------------------------------------------------------------- W05 Posteingang unter Last

test("W05 25 Personen einer Gruppe schreiben sich gleichzeitig Mails, alle fragen ihr Postfach ab", async ({ baseURL, ip, admin }) => {
  const { id: eventId } = await admin.json<{ id: string }>("POST", "/api/admin/events", {
    name: `Mail-Schulung ${uniq()}`,
    startsAt: new Date(Date.now() - 60_000).toISOString(),
    endsAt: new Date(Date.now() + 3 * 3_600_000).toISOString(),
  });
  const { guests } = await admin.json<{ guests: { username: string; password: string }[] }>("POST", "/api/admin/events/groups", { eventId, name: "Gruppe A", count: 25 });
  const group = await participants(baseURL!, ip, 25);
  try {
    const logins = await Promise.all(group.map((api, i) => api.post("/api/auth/login", { data: guests[i] })));
    expect(logins.map((r) => r.status())).toEqual(Array(25).fill(200));

    const started = Date.now();
    const tag = uniq();
    // Jede Person schreibt der nächsten; währenddessen fragen alle ihr Postfach ab (wie der Browser alle 15 s).
    const [sends, polls] = await Promise.all([
      Promise.all(
        group.map((api, i) =>
          api.post("/api/mail", { data: { to: [guests[(i + 1) % 25].username], cc: [], subject: `Kette ${tag} von ${i}`, body: "Hallo!" } }),
        ),
      ),
      Promise.all(group.flatMap((api) => [api.get("/api/mail/status"), api.get("/api/mail?folder=inbox")])),
    ]);
    expect(sends.map((r) => r.status())).toEqual(Array(25).fill(200));
    expect(polls.map((r) => r.status())).toEqual(Array(50).fill(200));
    // Und eine Rundmail an alle gleichzeitig mit den nächsten Abfragen.
    const [round] = await Promise.all([
      group[0].post("/api/mail", { data: { to: guests.slice(1).map((g) => g.username), cc: [], subject: `Rundmail ${tag}`, body: "An alle" } }),
      ...group.map((api) => api.get("/api/mail/status")),
    ]);
    expect(round.status()).toBe(200);

    const inboxes = await Promise.all(group.map(async (api) => (await (await api.get("/api/mail?folder=inbox")).json()) as { mails: { subject: string }[] }));
    inboxes.forEach((inbox, i) => {
      const subjects = inbox.mails.map((m) => m.subject);
      expect(subjects, `Postfach ${i}`).toContain(`Kette ${tag} von ${(i + 24) % 25}`);
      if (i > 0) expect(subjects, `Postfach ${i}`).toContain(`Rundmail ${tag}`);
    });
    // Alles zusammen deutlich unter dem Abfrage-Takt des Browsers.
    expect(Date.now() - started).toBeLessThan(20_000);
  } finally {
    await Promise.all(group.map((api) => api.dispose()));
  }
});

async function browserChat(browser: Browser, baseURL: string, ip: string, guest: { username: string; password: string }): Promise<ChatPage> {
  const context = await browser.newContext({ baseURL, locale: "de-DE", timezoneId: "Europe/Berlin", extraHTTPHeaders: { "x-forwarded-for": ip } });
  trackErrors(context);
  const page = await context.newPage();
  await loginUser(page, { guest });
  const chat = new ChatPage(page);
  await chat.open();
  return chat;
}
