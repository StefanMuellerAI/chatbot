import { expectAccessible } from "../support/a11y";
import { createGuest, expect, openAdmin, openChat, test, uniq } from "../support/fixtures";
import { attach, expectReady } from "../support/files";
import { ADMIN, PASSWORDS } from "../support/servers.mjs";

interface Overview {
  periods: { requests: number; cacheHits: number }[];
  byFeature: { feature: string; count: number }[];
  byModel: { modelId: string; requests: number }[];
  daily: { day: string; requests: number }[];
}

test.describe("O · Admin: Zugang und Übersicht", () => {
  test("O01/T15 Admin meldet sich über die gemeinsame Login-Seite an: Admin-Bereich und Chat ohne zweite Anmeldung", async ({ page, context }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?weiter=admin$/);
    await expect(page.getByText("Der Admin-Bereich ist nur für die Kursleitung. Bitte mit dem Admin-Zugang anmelden.")).toBeVisible();
    await page.getByLabel("Benutzername").fill(ADMIN.username);
    await page.getByLabel("Passwort").fill("falsch");
    await page.getByRole("button", { name: "Los geht's" }).click();
    await expect(page.locator("form").getByRole("alert")).toHaveText("Benutzername oder Passwort stimmt nicht.");
    await page.getByLabel("Passwort").fill(PASSWORDS.admin);
    await page.getByLabel("Passwort").press("Enter");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("tablist", { name: "Admin-Bereiche" })).toBeVisible();
    for (const tab of ["Übersicht", "Termine", "Modelle", "Einstellungen", "Vorlagen", "Sicherheit"]) {
      await expect(page.getByRole("tab", { name: tab })).toBeVisible();
    }
    await expect(page.getByRole("tab", { name: "Übersicht" })).toHaveAttribute("aria-selected", "true");

    const cookie = (await context.cookies()).find((c) => c.name === "freebie_session")!;
    expect(cookie.httpOnly).toBe(true);
    expect(cookie.sameSite).toBe("Lax");
    const hours = (cookie.expires * 1000 - Date.now()) / 3_600_000;
    expect(hours).toBeGreaterThan(11.9);
    expect(hours).toBeLessThan(12.1);

    // Zum Chat ohne zweite Anmeldung; dort führt „Admin“ zurück.
    await page.getByRole("link", { name: "Zum Chat" }).click();
    await expect(page).toHaveURL(/\/$/);
    await page.getByRole("dialog", { name: "Wichtiger Hinweis" }).getByRole("button", { name: "Verstanden" }).click();
    await expect(page.getByRole("textbox", { name: "Nachricht" })).toBeVisible();
    await page.getByRole("navigation", { name: "Chatverlauf" }).waitFor({ state: "attached" });
    await page.getByRole("link", { name: "Admin" }).click();
    await expect(page.getByRole("tablist", { name: "Admin-Bereiche" })).toBeVisible();

    await page.getByRole("button", { name: "Abmelden" }).click();
    await expect(page).toHaveURL(/\/login$/);
    expect((await page.request.get("/api/admin/overview")).status()).toBe(401);
    expect((await page.request.get("/api/config")).status()).toBe(401);
  });

  test("O01/T09 Gäste haben keinen Zugang zum Admin-Bereich", async ({ chat, page }) => {
    await expect(page.getByRole("link", { name: "Admin" })).toHaveCount(0);
    const res = await page.request.get("/api/admin/settings");
    expect(res.status()).toBe(403);
    expect(await res.json()).toEqual({ error: "Dieser Bereich ist nur für die Kursleitung." });
    expect((await page.request.post("/api/admin/security", { data: { action: "clear-answer-cache" } })).status()).toBe(403);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login\?weiter=admin$/);
    await expect(page.getByLabel("Benutzername")).toBeVisible();
    // Ohne Admin-Anmeldung geht es zurück in den eigenen Chat.
    await page.goto("/");
    await expect(chat.composer).toBeVisible();
  });

  test("O02 Kennzahlen spiegeln Chats, Cache-Treffer, Bilder und Transkription", async ({ page, browser, baseURL, ip, admin }) => {
    // Die Statistik überdauert die Rücksetzung zwischen Tests – daher Differenzen prüfen.
    const before = await admin.json<Overview>("GET", "/api/admin/overview");
    const featureCount = (o: Overview, f: string) => o.byFeature.find((x) => x.feature === f)?.count ?? 0;
    const chat = await openChat(browser, baseURL!, ip);
    const question = `Zählbar ${uniq()}`;
    await chat.ask(question);
    await chat.newChat();
    await chat.ask(question);
    await attach(chat.page, "ton.mp3");
    await expectReady(chat.page, "ton.mp3", /Tokens|Transkript/);
    await chat.page.getByRole("button", { name: "Bild-Modus" }).click();
    await chat.page.getByLabel("Bildbeschreibung").fill("Ein Testbild");
    await chat.page.getByRole("button", { name: "Bild erzeugen" }).click();
    await expect(chat.lastAnswer).toContainText("Hier ist dein Bild aus dem Bild-Modus.");

    await openAdmin(page);
    const today = page.locator("div").filter({ has: page.getByText("Heute", { exact: true }) }).filter({ has: page.getByText("Kosten (geschätzt)") }).last();
    await expect(today.getByText("Anfragen").locator("xpath=following-sibling::dd[1]")).toHaveText(String(before.periods[0].requests + 2));
    await expect(today.getByText(`${before.periods[0].cacheHits + 1} Treffer`)).toBeVisible();
    const features = page.getByRole("heading", { name: "Nach Funktion" }).locator("xpath=ancestor::section[1]");
    await expect(features.getByRole("row", { name: /Chat-Antworten/ })).toContainText(`${featureCount(before, "chat") + 2}×`);
    await expect(features.getByRole("row", { name: /Bilder/ })).toContainText(`${featureCount(before, "image") + 1}×`);
    await expect(features.getByRole("row", { name: /Transkription \(Minuten\)/ })).toContainText("Min.");
    const models = page.getByRole("heading", { name: "Nach Modell" }).locator("xpath=ancestor::section[1]");
    const sonnet = before.byModel.find((m) => m.modelId === "claude-sonnet-5-5")?.requests ?? 0;
    await expect(models.getByRole("row", { name: /Claude Sonnet 5\.5/ }).getByRole("cell").nth(1)).toHaveText(String(sonnet + 2));
  });

  test("O03 Diagramm: Balken mit Beschriftung, Tooltip per Tastatur, Tabellenansicht", async ({ page, browser, baseURL, ip, admin }) => {
    const before = await admin.json<Overview>("GET", "/api/admin/overview");
    const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const todayRequests = before.daily.find((d) => d.day === todayKey)?.requests ?? 0;
    const chat = await openChat(browser, baseURL!, ip);
    await chat.ask(`Für das Diagramm ${uniq()}`);
    await openAdmin(page);
    const card = page.getByRole("heading", { name: "Kosten pro Tag" }).locator("xpath=ancestor::section[1]");
    await expect(card).toContainText("Letzte 14 Tage");
    const todayLabel = new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", weekday: "short", day: "numeric", month: "long" }).format(new Date());
    const bar = card.getByLabel(new RegExp(`^${todayLabel}`));
    await bar.focus();
    await expect(card.getByText("Anfragen").first()).toBeVisible();
    await card.getByRole("button", { name: "Als Tabelle anzeigen" }).click();
    const rows = card.getByRole("row");
    await expect(rows).toHaveCount(15);
    await expect(rows.last()).toContainText(todayLabel);
    await expect(rows.last().getByRole("cell").last()).toHaveText(String(todayRequests + 1));
    await card.getByRole("button", { name: "Als Diagramm anzeigen" }).click();
    await expect(card.getByRole("button", { name: "Als Tabelle anzeigen" })).toBeVisible();
  });

  test("O04 Systemstatus zeigt die Umgebung des Test-Servers", async ({ page, baseURL }) => {
    // Legt bei Bedarf den E2E-Testtermin an, damit sicher ein Termin läuft.
    await createGuest(baseURL!);
    await openAdmin(page);
    await expect(page.getByText("Testmodus aktiv (FREEBIE_MOCK=1)")).toBeVisible();
    const status = page.getByRole("heading", { name: "Systemstatus" }).locator("xpath=ancestor::section[1]");
    const item = (label: string) => status.getByRole("listitem").filter({ hasText: label });
    await expect(item("Anthropic-API-Schlüssel")).toContainText("ANTHROPIC_API_KEY in Vercel setzen");
    await expect(item("OpenAI-API-Schlüssel")).toContainText("OPENAI_API_KEY in Vercel setzen");
    await expect(item("Datenbank")).toContainText("Ohne DATABASE_URL gehen Einstellungen und Caches beim Neustart verloren");
    await expect(item("Dateispeicher")).toContainText("Lokaler Speicher (Entwicklung)");
    await expect(item("SESSION_SECRET")).toContainText("Gesetzt");
    await expect(item("Aufräumjob (CRON_SECRET)")).toContainText("Täglicher Cron aktiv");
    await expect(item("Admin-Zugang")).toContainText("Benutzername „admin“ (ADMIN_USERNAME/ADMIN_PASSWORD)");
    // Der E2E-Testtermin läuft immer (andere Tests legen zeitweise weitere an).
    await expect(item("Termine")).toContainText(/läuft gerade|laufen gerade/);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`N02/N03 Admin-Bereich ${scheme === "light" ? "hell" : "dunkel"}: barrierearm, Screenshot je Bereich`, async ({ page }, testInfo) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto("/admin");
      await expectAccessible(page, testInfo, `admin-login-${scheme}`);
      await openAdmin(page);
      const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
      const [r, g, b] = background.match(/\d+/g)!.map(Number);
      // Hell: heller Hintergrund, dunkel: dunkler Hintergrund.
      if (scheme === "dark") expect(r + g + b).toBeLessThan(150);
      else expect(r + g + b).toBeGreaterThan(600);
      for (const tab of ["Übersicht", "Modelle", "Einstellungen", "Vorlagen", "Sicherheit"]) {
        await page.getByRole("tab", { name: tab }).click();
        await expect(page.getByRole("tab", { name: tab })).toHaveAttribute("aria-selected", "true");
        await expectAccessible(page, testInfo, `admin-${tab.toLowerCase()}-${scheme}`);
      }
      await page.getByRole("tab", { name: "Modelle" }).click();
      await page.getByRole("button", { name: "Claude Sonnet 5.5 bearbeiten" }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await expectAccessible(page, testInfo, `admin-modell-dialog-${scheme}`);
    });
  }
});
