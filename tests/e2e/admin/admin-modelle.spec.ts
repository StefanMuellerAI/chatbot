import type { Page } from "@playwright/test";
import { expect, openAdmin, openChat, test, uniq } from "../support/fixtures";
import { attach, expectReady } from "../support/files";

const row = (page: Page, name: string) =>
  page.getByRole("heading", { name: "Modelle", exact: true }).locator("xpath=ancestor::section[1]").locator("div.py-3").filter({ hasText: name });
const dialog = (page: Page) => page.getByRole("dialog");

async function editModel(page: Page, name: string, change: (d: ReturnType<typeof dialog>) => Promise<void>) {
  await page.getByRole("button", { name: `${name} bearbeiten` }).click();
  await expect(dialog(page)).toBeVisible();
  await change(dialog(page));
  await dialog(page).getByRole("button", { name: "Speichern" }).click();
  await expect(dialog(page)).toBeHidden();
}

const capability = (d: ReturnType<typeof dialog>, label: string) => d.getByRole("switch", { name: label, exact: true });

test.describe("P · Admin: Modelle", () => {
  test("P01 Modell anlegen: erscheint im Chat mit Name, Beschreibung und Reihenfolge", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Modelle");
    await page.getByRole("button", { name: "Modell anlegen" }).click();
    const d = dialog(page);
    await expect(d.getByRole("heading", { name: "Modell anlegen" })).toBeVisible();
    await d.getByLabel("Anbieter").selectOption("openai");
    await d.getByLabel("Interne ID").fill("test-modell");
    await d.getByLabel("API-Modell-ID").fill("gpt-test");
    await d.getByLabel("Anzeigename").fill("Testmodell");
    await d.getByLabel("Beschreibung").fill("Nur für den Test");
    await d.getByLabel("Reihenfolge").fill("5");
    await d.getByRole("button", { name: "Speichern" }).click();
    await expect(d).toBeHidden();
    await expect(row(page, "Testmodell")).toContainText("gpt-test");

    const chat = await openChat(browser, baseURL!, ip);
    await chat.page.getByRole("button", { name: /^Modell:/ }).click();
    const openai = await chat.page.getByRole("option").allInnerTexts();
    const index = openai.findIndex((t) => t.startsWith("Testmodell"));
    expect(index).toBe(openai.findIndex((t) => t.startsWith("GPT")) - 1);
    await expect(chat.page.getByRole("option", { name: /^Testmodell/ })).toContainText("Nur für den Test");
    await chat.page.getByRole("option", { name: /^Testmodell/ }).click();
    const answer = await chat.ask(`Neues Modell ${uniq()}`);
    expect(await chat.diagnosis(answer, "Modell")).toBe("gpt-test");

    await page.getByRole("button", { name: "Modell anlegen" }).click();
    await d.getByLabel("Interne ID").fill("test-modell");
    await d.getByLabel("API-Modell-ID").fill("x");
    await d.getByLabel("Anzeigename").fill("Doppelt");
    await d.getByRole("button", { name: "Speichern" }).click();
    await expect(d.getByText("Es gibt bereits ein Modell mit dieser ID.")).toBeVisible();
  });

  const invalid: [string, string, string][] = [
    ["Interne ID", "X!", "Interne ID: nur Kleinbuchstaben, Ziffern und Bindestriche"],
    ["Anzeigename", "", "Anzeigename: darf nicht leer sein"],
    ["Max. Output-Tokens", "100", "Max. Output-Tokens: mindestens 256"],
    ["Reihenfolge", "1,5", "Reihenfolge: muss eine ganze Zahl sein"],
    ["Preis Input ($/1 Mio.)", "abc", "Preis Input: muss eine Zahl sein"],
    ["Preis Output ($/1 Mio.)", "-1", "Preis Output: mindestens 0"],
  ];
  for (const [field, value, message] of invalid) {
    test(`P02 Prüfung „${field}“ = „${value}“ meldet sich auf Deutsch`, async ({ page }) => {
      await openAdmin(page, "Modelle");
      await page.getByRole("button", { name: "Modell anlegen" }).click();
      const d = dialog(page);
      await d.getByLabel("Interne ID").fill("pruefung");
      await d.getByLabel("API-Modell-ID").fill("claude-x");
      await d.getByLabel("Anzeigename").fill("Prüfung");
      await d.getByLabel(field).fill(value);
      await d.getByRole("button", { name: "Speichern" }).click();
      await expect(d.getByText(message)).toBeVisible();
    });
  }

  test("P03/D05 Fähigkeiten wirken im Chat: Bilder, Websuche, Werkzeuge, Denktiefe", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Modelle");
    await editModel(page, "Claude Sonnet 5.5", async (d) => {
      for (const label of ["Bilder verstehen", "Websuche", "Werkzeuge", "Denkt nach (Effort)"]) await capability(d, label).click();
    });
    const chat = await openChat(browser, baseURL!, ip);
    await expect(chat.page.getByRole("button", { name: "Websuche" })).toHaveCount(0);
    await expect(chat.page.getByRole("button", { name: /^Denktiefe:/ })).toHaveCount(0);
    await attach(chat.page, "punkt.png");
    await expectReady(chat.page, "punkt.png", "Bild");
    await expect(chat.page.getByRole("alert").filter({ hasText: "Das gewählte Modell kann keine Bilder sehen." })).toBeVisible();
    const answer = await chat.ask(`Siehst du das Bild? ${uniq()}`);
    expect(await chat.diagnosis(answer, "Zusätzliche Anhänge")).toBe("0");
    expect(await chat.diagnosis(answer, "Bild-Werkzeug")).toBe("aus");
    expect(await chat.diagnosis(answer, "Websuche")).toBe("aus");
  });

  test("P04/D05 Effort-Stufen lassen sich entfernen, die Standard-Stufe rückt nach", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Modelle");
    await editModel(page, "Claude Sonnet 5.5", async (d) => {
      await d.getByLabel("Maximal", { exact: true }).fill("");
      await d.getByLabel("Mittel", { exact: true }).fill("");
      await expect(d.getByLabel("Standard-Stufe")).toHaveValue("low");
      await d.getByLabel("Hoch", { exact: true }).fill("xhigh");
    });
    const chat = await openChat(browser, baseURL!, ip);
    await expect(chat.page.getByRole("button", { name: /^Denktiefe:/ })).toHaveAccessibleName("Denktiefe: Niedrig");
    await chat.page.getByRole("button", { name: /^Denktiefe:/ }).click();
    await expect(chat.page.getByRole("menuitemradio")).toHaveText([/^Niedrig/, /^Hoch/]);

    await editModel(page, "Claude Sonnet 5.5", async (d) => {
      for (const level of ["Niedrig", "Hoch"]) await d.getByLabel(level, { exact: true }).fill("");
    }).catch(() => {});
    await expect(dialog(page).getByText("Effort-Stufen: mindestens eine Stufe angeben oder „Denkt nach“ ausschalten.")).toBeVisible();
  });

  test("P05 Standardmodell per Stern: genau eins, neue Besucher bekommen es", async ({ page, browser, baseURL, ip }) => {
    await openAdmin(page, "Modelle");
    await page.getByRole("button", { name: "Claude Opus 5.5 als Standard setzen" }).click();
    await expect(row(page, "Claude Opus 5.5")).toContainText("Standard");
    await expect(row(page, "Claude Sonnet 5.5")).not.toContainText("Standard");
    await expect(page.getByRole("button", { name: "Claude Sonnet 5.5 als Standard setzen" })).toBeVisible();
    const chat = await openChat(browser, baseURL!, ip);
    await expect(chat.page.getByRole("button", { name: /^Modell:/ })).toHaveAccessibleName("Modell: Claude Opus 5.5");
  });

  test("P06 Deaktivieren, Löschen und Schutz für Standard- und Titelmodell", async ({ page, browser, baseURL, ip }) => {
    const chat = await openChat(browser, baseURL!, ip);
    await chat.page.getByRole("button", { name: /^Modell:/ }).click();
    await chat.page.getByRole("option", { name: /^GPT-6 Astra/ }).click();

    await openAdmin(page, "Modelle");
    await page.getByRole("button", { name: "Claude Haiku 5.5 deaktivieren" }).click();
    await expect(row(page, "Claude Haiku 5.5")).toContainText("deaktiviert");
    await page.getByRole("button", { name: "Claude Sonnet 5.5 deaktivieren" }).click();
    await expect(page.getByText("Das Standardmodell muss aktiv sein.")).toBeVisible();

    page.once("dialog", (d) => void d.accept());
    await page.getByRole("button", { name: "Claude Sonnet 5.5 löschen" }).click();
    await expect(page.getByText("Das Standardmodell kann nicht gelöscht werden.")).toBeVisible();
    page.once("dialog", (d) => void d.accept());
    await page.getByRole("button", { name: "Claude Haiku 5.5 löschen" }).click();
    await expect(page.getByText("Dieses Modell erzeugt die Chat-Titel.")).toBeVisible();

    page.once("dialog", (d) => void d.dismiss());
    await page.getByRole("button", { name: "GPT-6 Astra löschen" }).click();
    await expect(row(page, "GPT-6 Astra")).toBeVisible();
    page.once("dialog", (d) => {
      expect(d.message()).toBe("Modell „GPT-6 Astra“ löschen?");
      void d.accept();
    });
    await page.getByRole("button", { name: "GPT-6 Astra löschen" }).click();
    await expect(row(page, "GPT-6 Astra")).toHaveCount(0);

    // Wer das gelöschte Modell noch offen hat, bekommt eine verständliche Meldung …
    const answer = await chat.ask(`Noch da? ${uniq()}`);
    await expect(answer.getByRole("alert")).toHaveText("Dieses Modell ist nicht (mehr) verfügbar. Bitte wähle ein anderes.");
    // … und nach dem Neuladen das Standardmodell, ohne Haiku in der Liste.
    await chat.page.reload();
    await expect(chat.page.getByRole("button", { name: /^Modell:/ })).toHaveAccessibleName("Modell: Claude Sonnet 5.5");
    await chat.page.getByRole("button", { name: /^Modell:/ }).click();
    await expect(chat.page.getByRole("option", { name: /Haiku|Astra/ })).toHaveCount(0);
  });

  test("D06 Admin deaktiviert das gerade gewählte Modell: Meldung, dann Standardmodell", async ({ page, browser, baseURL, ip }) => {
    const chat = await openChat(browser, baseURL!, ip);
    await chat.page.getByRole("button", { name: /^Modell:/ }).click();
    await chat.page.getByRole("option", { name: /^GPT-6 Luna/ }).click();
    await chat.ask(`Vorher ${uniq()}`);

    await openAdmin(page, "Modelle");
    await page.getByRole("button", { name: "GPT-6 Luna deaktivieren" }).click();
    await expect(row(page, "GPT-6 Luna")).toContainText("deaktiviert");

    const answer = await chat.ask(`Nachher ${uniq()}`);
    await expect(answer.getByRole("alert")).toHaveText("Dieses Modell ist nicht (mehr) verfügbar. Bitte wähle ein anderes.");
    await chat.page.reload();
    await expect(chat.page.getByRole("button", { name: /^Modell:/ })).toHaveAccessibleName("Modell: Claude Sonnet 5.5");
    await chat.page.getByRole("button", { name: /^Modell:/ }).click();
    await expect(chat.page.getByRole("option", { name: /^GPT-6 Luna/ })).toHaveCount(0);
  });

  test("P07 Test im Testmodus und Abruf ohne Schlüssel", async ({ page }) => {
    await openAdmin(page, "Modelle");
    await page.getByRole("button", { name: "Claude Sonnet 5.5 testen" }).click();
    await expect(row(page, "Claude Sonnet 5.5")).toContainText("Antwort: „OK (Testmodus – keine echte Verbindung geprüft)“");
    await page.getByRole("button", { name: "Claude-Modelle abrufen" }).click();
    await expect(page.getByText("Für Claude ist noch kein API-Schlüssel hinterlegt.")).toBeVisible();
  });

  test("P09 Preise mit Komma werden übernommen", async ({ page }) => {
    await openAdmin(page, "Modelle");
    await editModel(page, "GPT-6 Luna", async (d) => {
      await d.getByLabel("Preis Input ($/1 Mio.)").fill("0,25");
      await d.getByLabel("Preis Output ($/1 Mio.)").fill("1,5");
    });
    await expect(row(page, "GPT-6 Luna")).toContainText("$0.25 / $1.5 pro 1 Mio. Tokens");
    await page.getByRole("button", { name: "GPT-6 Luna bearbeiten" }).click();
    await expect(dialog(page).getByLabel("Preis Input ($/1 Mio.)")).toHaveValue("0,25");
  });
});
