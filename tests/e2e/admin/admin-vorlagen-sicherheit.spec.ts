import type { Page } from "@playwright/test";
import { expect, openAdmin, openChat, test, uniq } from "../support/fixtures";
import { ADMIN } from "../support/servers.mjs";

const dialog = (page: Page) => page.getByRole("dialog");

test.describe("R · Admin: Vorlagen", () => {
  test("R01/R02 Vorlage anlegen, bearbeiten und löschen – mit Symbol, Reihenfolge und Wirkung im Chat", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Vorlagen");
    await page.getByRole("button", { name: "Vorlage anlegen" }).click();
    const d = dialog(page);
    await d.getByLabel("Name", { exact: true }).fill("Größter Übersetzer");
    await expect(d.getByLabel("ID", { exact: true })).toHaveValue("groesster-uebersetzer");
    await d.getByLabel("Symbol").selectOption({ label: "Idee" });
    await d.getByLabel("Reihenfolge").fill("1");
    await d.getByLabel("Kurzbeschreibung").fill("Übersetzt alles ins Deutsche");
    await d.getByLabel("Anweisung an das Modell").fill("Rolle: Du übersetzt jeden Text sorgfältig ins Deutsche.");
    await d.getByRole("button", { name: "Speichern" }).click();
    await expect(d).toBeHidden();
    await expect(page.getByText("Übersetzt alles ins Deutsche")).toBeVisible();

    const chat = await openChat(browser, baseURL!, ip);
    const presets = chat.page.getByRole("button", { pressed: false }).filter({ hasText: /Übersetzer|E-Mail-Profi/ });
    await expect(presets.first()).toContainText("Größter Übersetzer");
    await chat.page.getByRole("button", { name: /^Größter Übersetzer/ }).click();
    const answer = await chat.ask(`Hello world ${uniq()}`);
    expect(await chat.diagnosis(answer, "Vorlage")).toMatch(/^Rolle: Du übersetzt jeden Text/);

    await page.getByRole("button", { name: "Vorlage „Größter Übersetzer“ bearbeiten" }).click();
    await expect(d.getByLabel("ID", { exact: true })).toBeDisabled();
    await d.getByLabel("Name", { exact: true }).fill("Übersetzer");
    await d.getByRole("button", { name: "Speichern" }).click();
    await expect(page.getByRole("button", { name: "Vorlage „Übersetzer“ löschen" })).toBeVisible();

    page.once("dialog", (x) => void x.dismiss());
    await page.getByRole("button", { name: "Vorlage „Übersetzer“ löschen" }).click();
    await expect(page.getByText("Übersetzt alles ins Deutsche")).toBeVisible();
    page.once("dialog", (x) => {
      expect(x.message()).toBe("Vorlage „Übersetzer“ löschen?");
      void x.accept();
    });
    await page.getByRole("button", { name: "Vorlage „Übersetzer“ löschen" }).click();
    await expect(page.getByText("Übersetzt alles ins Deutsche")).toHaveCount(0);
  });

  for (const [field, value, message] of [
    ["Name", "X", "ID: nur Kleinbuchstaben, Ziffern und Bindestriche (2–60 Zeichen)"],
    ["Reihenfolge", "-1", "Reihenfolge: mindestens 0"],
    ["Reihenfolge", "abc", "Reihenfolge: muss eine Zahl sein"],
  ] as const) {
    test(`R01 Prüfung „${field}“ = „${value}“`, async ({ page }) => {
      await openAdmin(page, "Vorlagen");
      await page.getByRole("button", { name: "Vorlage anlegen" }).click();
      const d = dialog(page);
      await d.getByLabel("Name", { exact: true }).fill(field === "Name" ? value : "Gültiger Name");
      if (field !== "Name") await d.getByLabel(field).fill(value);
      await d.getByRole("button", { name: "Speichern" }).click();
      await expect(d.getByText(message)).toBeVisible();
    });
  }

  test("R01 Doppelte ID wird abgelehnt", async ({ page }) => {
    await openAdmin(page, "Vorlagen");
    await page.getByRole("button", { name: "Vorlage anlegen" }).click();
    await dialog(page).getByLabel("Name", { exact: true }).fill("E-Mail-Profi");
    await expect(dialog(page).getByLabel("ID", { exact: true })).toHaveValue("e-mail-profi");
    await dialog(page).getByLabel("ID", { exact: true }).fill("email-profi");
    await dialog(page).getByRole("button", { name: "Speichern" }).click();
    await expect(dialog(page).getByText("Es gibt bereits eine Vorlage mit dieser ID.")).toBeVisible();
  });
});

test.describe("S · Admin: Sicherheit", () => {
  test("S01/S02/A11 Alle abmelden, während jemand chattet: sauber zum Login, Chats bleiben beim Konto", async ({ page, browser, baseURL, ip }) => {
    const chat = await openChat(browser, baseURL!, ip);
    const guest = chat.guest!;
    const question = `Vorher gefragt ${uniq()}`;
    await chat.ask(question);
    await openAdmin(page, "Sicherheit");
    // S02: Der Reiter erklärt den Admin-Zugang; ein gemeinsames Teilnehmer-Passwort gibt es nicht mehr.
    await expect(page.getByText(`Admin-Zugang: Benutzername „${ADMIN.username}“, Passwort aus der Umgebungsvariable ADMIN_PASSWORD (in Vercel gesetzt).`)).toBeVisible();
    await expect(page.getByRole("tabpanel").getByLabel(/Passwort/)).toHaveCount(0);
    await expect(page.getByText(/Teilnehmer-Passwort/)).toHaveCount(0);
    page.once("dialog", (d) => void d.accept());
    await page.getByRole("button", { name: "Alle abmelden" }).click();
    await expect(page.getByText("Alle Sitzungen wurden abgemeldet.")).toBeVisible();

    // Die nächste Aktion führt zum Login – ohne „abgelaufen“, denn der Termin läuft ja noch.
    await chat.send(`Noch angemeldet? ${uniq()}`);
    await expect(chat.page).toHaveURL(/\/login$/);
    await chat.page.getByLabel("Benutzername").fill(guest.username);
    await chat.page.getByLabel("Passwort").fill(guest.password);
    await chat.page.getByLabel("Passwort").press("Enter");
    await expect(chat.page).toHaveURL(/\/$/);
    // Dasselbe Konto findet seine Chats wieder.
    await expect(chat.page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: new RegExp(`^${question}`) })).toBeVisible();
  });

  test("A12 Alle abmelden beendet auch andere Admin-Sitzungen, nicht die eigene", async ({ page, browser, baseURL, ip }) => {
    const other = await browser.newPage({ baseURL, extraHTTPHeaders: { "x-forwarded-for": `${ip}-zweit` } });
    expect((await other.request.post("/api/auth/login", { data: ADMIN })).status()).toBe(200);
    expect((await other.request.get("/api/admin/overview")).status()).toBe(200);
    await openAdmin(page, "Sicherheit");
    page.once("dialog", (d) => void d.accept());
    await page.getByRole("button", { name: "Alle abmelden" }).click();
    await expect(page.getByText("Alle Sitzungen wurden abgemeldet.")).toBeVisible();
    expect((await other.request.get("/api/admin/overview")).status()).toBe(401);
    expect((await page.request.get("/api/admin/overview")).status()).toBe(200);
    await other.close();
  });

  test("S03 Alle abmelden: Teilnehmende raus, der eigene Admin-Zugang bleibt", async ({ page, browser, baseURL, ip }) => {
    const chat = await openChat(browser, baseURL!, ip);
    await openAdmin(page, "Sicherheit");
    page.once("dialog", (d) => void d.dismiss());
    await page.getByRole("button", { name: "Alle abmelden" }).click();
    expect((await chat.page.request.get("/api/config")).status()).toBe(200);

    page.once("dialog", (d) => {
      expect(d.message()).toBe("Alle Sitzungen abmelden?");
      void d.accept();
    });
    await page.getByRole("button", { name: "Alle abmelden" }).click();
    await expect(page.getByText("Alle Sitzungen wurden abgemeldet.")).toBeVisible();
    expect((await chat.page.request.get("/api/config")).status()).toBe(401);
    await chat.page.reload();
    await expect(chat.page).toHaveURL(/\/login$/);
    await expect(chat.page.getByText("Dein Zugang ist abgelaufen.")).toHaveCount(0);
    // Der eigene Admin-Zugang bleibt bestehen.
    await page.getByRole("tab", { name: "Übersicht" }).click();
    await expect(page.getByRole("heading", { name: "Systemstatus" })).toBeVisible();
  });

  test("S04/M05 Antwort-Cache leeren: die nächste gleiche Frage kommt nicht aus dem Cache", async ({ page, browser, baseURL, ip }) => {
    const chat = await openChat(browser, baseURL!, ip);
    const question = `Wird geleert ${uniq()}`;
    await chat.ask(question);
    await openAdmin(page, "Sicherheit");
    page.once("dialog", (d) => void d.dismiss());
    await page.getByRole("button", { name: "Cache leeren" }).click();
    await chat.newChat();
    await expect((await chat.ask(question)).getByText("aus dem Cache")).toBeVisible();

    page.once("dialog", (d) => {
      expect(d.message()).toBe("Antwort-Cache wirklich leeren?");
      void d.accept();
    });
    await page.getByRole("button", { name: "Cache leeren" }).click();
    await expect(page.getByText("Der Antwort-Cache wurde geleert.")).toBeVisible();
    await chat.newChat();
    await expect((await chat.ask(question)).getByText("aus dem Cache")).toHaveCount(0);
  });
});
