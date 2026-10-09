import type { Locator, Page } from "@playwright/test";
import { expect, noticeKey, test, uniq } from "../support/fixtures";
import { attach, expectReady, payload } from "../support/files";

// X: Live-Smoke gegen die echte Installation (Standard: https://freebie.stefanai.de).
// Ändert keine Einstellungen. Kosten pro Lauf deutlich unter 0,10 $.
//
//   LIVE=1 LIVE_PASSWORD=… LIVE_ADMIN_PASSWORD=… npx playwright test
//
// Ohne LIVE_ADMIN_PASSWORD wird der Systemstatus übersprungen.

const PASSWORD = process.env.LIVE_PASSWORD ?? "";
const ADMIN_PASSWORD = process.env.LIVE_ADMIN_PASSWORD ?? "";
const ANSWER_TIMEOUT = 120_000;

test.describe.configure({ mode: "serial", timeout: 240_000 });
test.skip(!PASSWORD, "LIVE_PASSWORD fehlt – Live-Smoke übersprungen.");

async function login(page: Page) {
  const res = await page.request.post("/api/auth/login", { data: { password: PASSWORD } });
  expect(res.status(), await res.text()).toBe(200);
  const config = await (await page.request.get("/api/config")).json();
  await page.addInitScript((k) => {
      // Nur im Hauptfenster: in den abgeschotteten Artefakt-iframes ist localStorage gesperrt.
      if (window === window.top) localStorage.setItem(k, "1");
    }, noticeKey(config.notice.full));
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
  test.skip(!ADMIN_PASSWORD, "LIVE_ADMIN_PASSWORD fehlt.");
  const res = await page.request.post("/api/admin/login", { data: { password: ADMIN_PASSWORD } });
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
    paused: false,
  });
  expect(status.appPassword).not.toBe("missing");
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
