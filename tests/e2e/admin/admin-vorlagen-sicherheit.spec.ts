import type { Page } from "@playwright/test";
import { expect, loginUser, openAdmin, openChat, test, uniq } from "../support/fixtures";
import { PASSWORDS } from "../support/servers.mjs";

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
  test("S01/S02/A11/A12 Neues Passwort: Teilnehmende werden abgemeldet, nur das neue gilt – bis zum Zurücksetzen", async ({ page, browser, baseURL, ip }) => {
    const chat = await openChat(browser, baseURL!, ip);
    await openAdmin(page, "Sicherheit");
    const field = page.getByLabel("Neues Passwort (z. B. pro Schulung)");
    const set = page.getByRole("button", { name: "Passwort setzen" });
    await field.fill("abc");
    await expect(set).toBeDisabled();
    await field.fill("x".repeat(201));
    await set.click();
    await expect(page.getByText("Passwort: höchstens 200 Zeichen")).toBeVisible();
    const password = `schulung-${uniq()}`;
    await field.fill(password);
    await set.click();
    await expect(page.getByText("Neues Passwort gesetzt. Alle Teilnehmenden müssen sich neu anmelden.")).toBeVisible();
    await expect(page.getByText("Aktuell gilt ein im Admin-Bereich gesetztes Passwort.")).toBeVisible();

    // Die laufende Sitzung endet bei der nächsten Aktion – ohne Datenverlust im Browser.
    await chat.send(`Noch angemeldet? ${uniq()}`);
    await expect(chat.page).toHaveURL(/\/login$/);
    const login = chat.page.getByLabel("Passwort");
    await login.fill(PASSWORDS.app);
    await login.press("Enter");
    await expect(chat.page.locator("form").getByRole("alert")).toHaveText("Das Passwort stimmt nicht.");
    await login.fill(password);
    await login.press("Enter");
    await expect(chat.page).toHaveURL(/\/$/);
    await expect(chat.page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: /^Noch angemeldet\?/ })).toBeVisible();

    // S02: zurück zum Passwort aus der Umgebung.
    await page.getByRole("button", { name: "Zurück zum Passwort aus der Umgebung" }).click();
    await expect(page.getByText("Es gilt wieder APP_PASSWORD.")).toBeVisible();
    const fresh = await browser.newPage({ baseURL, extraHTTPHeaders: { "x-forwarded-for": `${ip}-neu` } });
    await loginUser(fresh);
    await fresh.close();
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
