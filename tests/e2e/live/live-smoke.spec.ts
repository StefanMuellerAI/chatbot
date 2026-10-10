import { request as playwrightRequest, type APIRequestContext, type Locator, type Page } from "@playwright/test";
import { expect, inMinutes, noticeKey, test, uniq } from "../support/fixtures";
import { attach, expectReady, payload } from "../support/files";

// X: Live-Smoke gegen die echte Installation (Standard: https://freebie.stefanai.de).
// Ändert keine Einstellungen. Legt einen Termin für eine Stunde mit einem Gast an und löscht ihn am Ende
// wieder (die Kosten bleiben in der Statistik). Kosten pro Lauf deutlich unter 0,10 $.
//
//   LIVE=1 LIVE_ADMIN_PASSWORD=… [LIVE_ADMIN_USERNAME=admin] npx playwright test

const ADMIN = { username: process.env.LIVE_ADMIN_USERNAME ?? "admin", password: process.env.LIVE_ADMIN_PASSWORD ?? "" };
const ANSWER_TIMEOUT = 120_000;

test.describe.configure({ mode: "serial", timeout: 240_000 });
test.skip(!ADMIN.password, "LIVE_ADMIN_PASSWORD fehlt – Live-Smoke übersprungen.");

let admin: APIRequestContext;
let eventId = "";
let guest = { username: "", password: "" };

test.beforeAll(async ({}, testInfo) => {
  if (!ADMIN.password) return;
  admin = await playwrightRequest.newContext({ baseURL: testInfo.project.use.baseURL });
  const res = await admin.post("/api/auth/login", { data: ADMIN });
  expect(res.status(), await res.text()).toBe(200);
  const event = await admin.post("/api/admin/events", { data: { name: `Live-Smoke ${uniq()}`, startsAt: inMinutes(-5), endsAt: inMinutes(60) } });
  expect(event.status(), await event.text()).toBe(200);
  eventId = ((await event.json()) as { id: string }).id;
  const group = await admin.post("/api/admin/events/groups", { data: { eventId, name: "Smoke", count: 1 } });
  expect(group.status(), await group.text()).toBe(200);
  guest = ((await group.json()) as { guests: { username: string; password: string }[] }).guests[0];
});

test.afterAll(async () => {
  if (!admin) return;
  // Gäste sind damit sofort abgemeldet und gelöscht; X07 hat den Termin evtl. schon entfernt.
  if (eventId) await admin.delete(`/api/admin/events?id=${eventId}`);
  await admin.dispose();
});

async function login(page: Page) {
  const res = await page.request.post("/api/auth/login", { data: guest });
  expect(res.status(), await res.text()).toBe(200);
  const { key: account } = (await res.json()) as { key: string };
  const config = await (await page.request.get("/api/config")).json();
  await page.addInitScript((k) => {
    // Nur im Hauptfenster: in den abgeschotteten Artefakt-iframes ist localStorage gesperrt.
    if (window === window.top) localStorage.setItem(k, "1");
  }, noticeKey(config.notice.full, account));
  await page.goto("/");
  await expect(page.getByRole("textbox", { name: "Nachricht" })).toBeVisible();
}

async function chooseModel(page: Page, name: string, effort = "Niedrig") {
  await page.getByRole("button", { name: /^Modell:/ }).click();
  await page.getByRole("listbox", { name: "Modell wählen" }).getByRole("option", { name: new RegExp(`^${name.replace(/\./g, "\\.")}`) }).click();
  const effortButton = page.getByRole("button", { name: /^Denktiefe:/ });
  if (await effortButton.count()) {
    await effortButton.click();
    await page.getByRole("menuitemradio", { name: new RegExp(`^${effort}`) }).click();
  }
}

/** Fragt und wartet auf eine fertige Antwort ohne Fehlermeldung. */
async function ask(page: Page, text: string): Promise<Locator> {
  const answers = page.getByRole("article", { name: "Antwort von Freebie" });
  const before = await answers.count();
  await page.getByRole("textbox", { name: "Nachricht" }).fill(text);
  await page.getByRole("button", { name: "Senden", exact: true }).click();
  await expect(answers).toHaveCount(before + 1, { timeout: ANSWER_TIMEOUT });
  const answer = answers.last();
  await expect(answer).toHaveAttribute("aria-busy", "false", { timeout: ANSWER_TIMEOUT });
  await expect(answer.getByRole("alert")).toHaveCount(0);
  await expect(answer).toContainText(/\p{L}{3,}/u);
  return answer;
}

const newChat = (page: Page) => page.getByRole("button", { name: "Neuer Chat" }).first().click();

test("X01 Systemstatus im Admin ist vollständig grün (inkl. Blob-Speicher)", async ({ page }) => {
  const res = await page.request.post("/api/auth/login", { data: ADMIN });
  expect(res.status(), await res.text()).toBe(200);
  const { status } = await (await page.request.get("/api/admin/overview")).json();
  expect(status).toMatchObject({
    anthropic: true,
    openai: true,
    database: "postgres",
    storage: "blob",
    onVercel: true,
    mock: false,
    cronSecret: true,
    sessionSecret: true,
    adminPassword: true,
    paused: false,
  });
  // Der Smoke-Termin läuft gerade.
  expect(status.runningEvents).toBeGreaterThanOrEqual(1);
  await page.goto("/admin");
  await expect(page.getByRole("heading", { name: "Systemstatus" })).toBeVisible();
  await expect(page.getByText(/Vercel Blob/)).toBeVisible();
});

test("X02 kurze Fragen an Claude Haiku und GPT-6 Luna", async ({ page }) => {
  await login(page);
  await chooseModel(page, "Claude Haiku 5.5");
  await page.getByRole("button", { name: "Websuche" }).click();
  await ask(page, `Antworte nur mit dem Wort „bereit“. (Smoke ${uniq()})`);
  await newChat(page);
  await chooseModel(page, "GPT-6 Luna");
  await page.getByRole("button", { name: "Websuche" }).click();
  await ask(page, `Antworte nur mit dem Wort „bereit“. (Smoke ${uniq()})`);
});

test("X03 kleines PDF über den Blob-Speicher hochladen und befragen", async ({ page }) => {
  await login(page);
  await chooseModel(page, "Claude Haiku 5.5");
  const pdf = payload("bericht.pdf");
  await attach(page, pdf);
  await expectReady(page, "bericht.pdf", /Tokens/);
  await ask(page, `Worum geht es in dem PDF? Ein Satz. (Smoke ${uniq()})`);
});

test("X04 kurze MP3 transkribieren", async ({ page }) => {
  await login(page);
  await chooseModel(page, "Claude Haiku 5.5");
  // Zufällige Bytes am Ende: neue Prüfsumme, damit wirklich transkribiert wird (kein Cache-Treffer).
  const audio = payload("ton.mp3");
  const unique = { ...audio, name: `smoke-${uniq()}.mp3`, buffer: Buffer.concat([audio.buffer, Buffer.from(uniq())]) };
  await attach(page, unique);
  await expectReady(page, unique.name, /Tokens|Transkript/);
  await ask(page, `Was hörst du in der Aufnahme? Ein Satz. (Smoke ${uniq()})`);
});

test("X05 ein Bild in Entwurfsqualität", async ({ page }) => {
  await login(page);
  await page.getByRole("button", { name: "Bild-Modus" }).click();
  const dialog = page.getByRole("dialog");
  const prompt = `Ein einfacher roter Kreis auf weißem Grund (Smoke ${uniq()})`;
  await dialog.getByLabel("Bildbeschreibung").fill(prompt);
  await dialog.getByLabel("Format").selectOption({ label: "Quadratisch" });
  await dialog.getByLabel("Qualität").selectOption({ label: "Entwurf (schnell, günstig)" });
  await dialog.getByRole("button", { name: "Bild erzeugen" }).click();
  await expect(page.getByRole("article", { name: "Antwort von Freebie" }).last().getByRole("img", { name: prompt })).toBeVisible({ timeout: ANSWER_TIMEOUT });
});

test("X06 Websuche mit Quellen und ein kleines Artefakt", async ({ page }) => {
  await login(page);
  await chooseModel(page, "Claude Haiku 5.5");
  const answer = await ask(page, `Suche im Web: Was ist die Hauptstadt von Australien? Kurz, mit Quelle. (Smoke ${uniq()})`);
  await expect(answer.getByRole("navigation", { name: "Quellen" }).getByRole("link").first()).toBeVisible();

  await newChat(page);
  await chooseModel(page, "Claude Haiku 5.5");
  await page.getByRole("button", { name: "Websuche" }).click();
  await ask(page, `Erstelle als Artefakt ein kleines SVG mit einem blauen Quadrat. Sonst nichts. (Smoke ${uniq()})`);
  await expect(page.getByRole("region", { name: /^Artefakt:/ })).toBeVisible();
});

test("X07 Gast-Zugang: Anmeldung über das Formular, nur Chat; Termin gelöscht – sofort abgemeldet", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Benutzername").fill(guest.username);
  await page.getByLabel("Passwort").fill(guest.password);
  await page.getByLabel("Passwort").press("Enter");
  await expect(page).toHaveURL(/\/$/);
  const notice = page.getByRole("dialog", { name: "Wichtiger Hinweis" });
  await notice.getByRole("button", { name: "Verstanden" }).click();
  await expect(page.getByText(`Angemeldet als ${guest.username}`)).toContainText("gültig bis");
  await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
  expect((await page.request.get("/api/admin/overview")).status()).toBe(403);

  const res = await admin.delete(`/api/admin/events?id=${eventId}`);
  expect(res.status(), await res.text()).toBe(200);
  eventId = "";
  // Andere Server-Instanzen merken es spätestens nach 15 Sekunden.
  await expect(async () => {
    await page.reload();
    await expect(page).toHaveURL(/\/login/, { timeout: 2_000 });
  }).toPass({ timeout: 30_000 });
  await expect(page.getByText("Dein Zugang ist abgelaufen.")).toBeVisible();
  expect((await page.request.get("/api/config")).status()).toBe(401);
});
