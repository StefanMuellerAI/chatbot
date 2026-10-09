import { readFileSync, writeFileSync } from "node:fs";
import type { Page } from "@playwright/test";
import { expect, test, uniq } from "../support/fixtures";

const nav = (page: Page) => page.getByRole("navigation", { name: "Chatverlauf" });
const chatButton = (page: Page, title: string) => nav(page).getByRole("button", { name: title, exact: true });

const DAY = 86_400_000;
function conversation(id: string, title: string, updatedAt: number, text = "Hallo") {
  return {
    id,
    title,
    modelId: "claude-sonnet-5-5",
    presetId: null,
    createdAt: updatedAt,
    updatedAt,
    messages: [
      { id: `${id}-u`, role: "user", text, createdAt: updatedAt },
      { id: `${id}-a`, role: "assistant", text: `Antwort zu ${text}`, createdAt: updatedAt + 1 },
    ],
  };
}

async function importFile(page: Page, path: string): Promise<string> {
  const dialog = page.waitForEvent("dialog");
  // Als Inhalt übergeben: Pfade mit Sonderzeichen (aus dem Testtitel) kommen sonst nicht im Browser an.
  await page.getByLabel("Export-Datei für den Import").setInputFiles({ name: "import.json", mimeType: "application/json", buffer: readFileSync(path) });
  const d = await dialog;
  const message = d.message();
  await d.accept();
  return message;
}

test.describe("E · Verlauf und Seitenleiste", () => {
  test("E01 „Neuer Chat“ leert die Ansicht und ist während einer Antwort gesperrt", async ({ chat, page }) => {
    await chat.ask(`Erster Chat ${uniq()}`);
    await chat.newChat();
    await expect(page.getByRole("heading", { name: "Hallo, ich bin Freebie." })).toBeVisible();
    await expect(chat.answers).toHaveCount(0);

    await chat.send(`#langsam ${uniq()}`);
    await expect(page.getByRole("button", { name: "Neuer Chat" }).first()).toBeDisabled();
    await chat.stopButton.click();
    await chat.waitForAnswer(1);
    await expect(page.getByRole("button", { name: "Neuer Chat" }).first()).toBeEnabled();
  });

  test("E02 Titel: erst der Anfang der Frage, dann der erzeugte Titel", async ({ chat, page }) => {
    const id = uniq();
    const question = `Wie plane ich eine Schulung zum Thema KI im Vertrieb ${id}?`;
    await chat.ask(question);
    await expect(nav(page).getByRole("button", { name: new RegExp(`^${question.slice(0, 40)}`) })).toBeVisible();
    await expect(nav(page).getByRole("button", { name: /…$/ })).toBeVisible();
  });

  test("E03 Gruppierung nach Heute, Gestern, Letzte 7 Tage und Älter", async ({ chat, page }, testInfo) => {
    const now = Date.now();
    const file = testInfo.outputPath("gruppen.json");
    writeFileSync(
      file,
      JSON.stringify({
        app: "freebie",
        version: 1,
        conversations: [
          conversation("g-heute", "Chat von heute", now),
          conversation("g-gestern", "Chat von gestern", now - DAY - 60_000),
          conversation("g-woche", "Chat vor drei Tagen", now - 3 * DAY),
          conversation("g-alt", "Chat vom letzten Monat", now - 30 * DAY),
        ],
      }),
    );
    expect(await importFile(page, file)).toBe("4 Chats importiert.");
    const groups = await nav(page).locator(":scope > div").evaluateAll((els) =>
      els.map((el) => [el.firstElementChild?.textContent?.trim(), Array.from(el.querySelectorAll("button[aria-label$='löschen']")).length]),
    );
    expect(groups.map((g) => g[0])).toEqual(["Heute", "Gestern", "Letzte 7 Tage", "Älter"]);
    for (const [label, title] of [
      ["Heute", "Chat von heute"],
      ["Gestern", "Chat von gestern"],
      ["Letzte 7 Tage", "Chat vor drei Tagen"],
      ["Älter", "Chat vom letzten Monat"],
    ]) {
      const group = nav(page).locator(":scope > div").filter({ has: page.getByText(label, { exact: true }) });
      await expect(group.getByRole("button", { name: title, exact: true })).toBeVisible();
    }
    void chat;
  });

  test("E04 Suche findet Titel und Nachrichtentext, ohne Groß-/Kleinschreibung", async ({ chat, page }, testInfo) => {
    const now = Date.now();
    const file = testInfo.outputPath("suche.json");
    writeFileSync(
      file,
      JSON.stringify([conversation("s-1", "Apfelkuchen backen", now, "Rezept bitte"), conversation("s-2", "Steuern", now - 1000, "Was ist eine Pendlerpauschale?")]),
    );
    await importFile(page, file);
    const search = page.getByRole("searchbox", { name: "Chats durchsuchen" });
    await search.fill("APFEL");
    await expect(chatButton(page, "Apfelkuchen backen")).toBeVisible();
    await expect(chatButton(page, "Steuern")).toBeHidden();
    await search.fill("pendlerpauschale");
    await expect(chatButton(page, "Steuern")).toBeVisible();
    await expect(chatButton(page, "Apfelkuchen backen")).toBeHidden();
    await search.fill("gibtesnicht");
    await expect(nav(page).getByText("Keine Treffer.")).toBeVisible();
    await search.fill("");
    await expect(chatButton(page, "Steuern")).toBeVisible();
    void chat;
  });

  test("E05 Chatwechsel stellt Modell, Denktiefe und Websuche wieder her und markiert den aktiven Chat", async ({ chat, page }) => {
    const id = uniq();
    await page.getByRole("button", { name: /^Modell:/ }).click();
    await page.getByRole("option", { name: /^GPT-6 Luna/ }).click();
    await page.getByRole("button", { name: /^Denktiefe:/ }).click();
    await page.getByRole("menuitemradio", { name: /^Hoch/ }).click();
    await page.getByRole("button", { name: "Websuche" }).click();
    await expect(page.getByRole("button", { name: "Websuche" })).toHaveAttribute("aria-pressed", "false");
    await chat.ask(`Chat eins ${id}`);

    await chat.newChat();
    await expect(page.getByRole("button", { name: "Websuche" })).toHaveAttribute("aria-pressed", "true");
    await chat.ask(`Chat zwei ${id}`);
    await expect(chatButton(page, `Chat zwei ${id}`)).toHaveAttribute("aria-current", "page");

    await chatButton(page, `Chat eins ${id}`).click();
    await expect(chatButton(page, `Chat eins ${id}`)).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("button", { name: /^Modell:/ })).toHaveAccessibleName("Modell: GPT-6 Luna");
    await expect(page.getByRole("button", { name: /^Denktiefe:/ })).toHaveAccessibleName("Denktiefe: Hoch");
    await expect(page.getByRole("button", { name: "Websuche" })).toHaveAttribute("aria-pressed", "false");
    await expect(chat.questions).toHaveText([new RegExp(`Chat eins ${id}`)]);
  });

  test("E06 Löschen mit Bestätigung, auch den aktiven und einen laufenden Chat", async ({ chat, page }) => {
    const id = uniq();
    await chat.ask(`Bleibt ${id}`);
    await chat.newChat();
    await chat.ask(`Weg ${id}`);

    page.once("dialog", (d) => {
      expect(d.message()).toBe(`Chat „Weg ${id}“ löschen?`);
      void d.dismiss();
    });
    await nav(page).getByRole("button", { name: `Chat „Weg ${id}“ löschen` }).click();
    await expect(chatButton(page, `Weg ${id}`)).toBeVisible();

    page.once("dialog", (d) => void d.accept());
    await nav(page).getByRole("button", { name: `Chat „Weg ${id}“ löschen` }).click();
    await expect(chatButton(page, `Weg ${id}`)).toBeHidden();
    await expect(page.getByRole("heading", { name: "Hallo, ich bin Freebie." })).toBeVisible();

    await chatButton(page, `Bleibt ${id}`).click();
    await chat.send(`#langsam Läuft ${id}`);
    await expect(chat.stopButton).toBeVisible();
    page.once("dialog", (d) => void d.accept());
    await nav(page).getByRole("button", { name: `Chat „Bleibt ${id}“ löschen` }).click();
    await expect(chat.stopButton).toBeHidden();
    await expect(page.getByRole("heading", { name: "Hallo, ich bin Freebie." })).toBeVisible();
    await expect(chat.composer).toHaveValue("");
    await expect(chatButton(page, `Bleibt ${id}`)).toBeHidden();
    await expect(page.getByRole("button", { name: "Neuer Chat" }).first()).toBeEnabled();
  });

  test("E07 Verlauf übersteht Neuladen und erscheint in einem zweiten Tab", async ({ chat, page, context }) => {
    const id = uniq();
    await chat.ask(`Persistent ${id}`);
    await page.reload();
    await expect(chatButton(page, `Persistent ${id}`)).toBeVisible();
    const second = await context.newPage();
    await second.goto("/");
    await expect(chatButton(second, `Persistent ${id}`)).toBeVisible();
    await chat.newChat();
    await chat.ask(`Neu im ersten Tab ${id}`);
    await expect(chatButton(second, `Neu im ersten Tab ${id}`)).toBeVisible();
  });

  test("E08 Export und Import ergeben denselben Stand, kaputte Dateien werden abgewiesen", async ({ chat, page }, testInfo) => {
    const id = uniq();
    await chat.ask(`Export eins ${id}`);
    await chat.newChat();
    await chat.ask(`Export zwei ${id}`);

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Alle Chats exportieren" }).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(/^freebie-chats-\d{4}-\d{2}-\d{2}\.json$/);
    const path = testInfo.outputPath("export.json");
    await file.saveAs(path);
    const data = JSON.parse(readFileSync(path, "utf8"));
    expect(data.app).toBe("freebie");
    expect(data.conversations).toHaveLength(2);

    for (const title of [`Export eins ${id}`, `Export zwei ${id}`]) {
      page.once("dialog", (d) => void d.accept());
      await nav(page).getByRole("button", { name: `Chat „${title}“ löschen` }).click();
      await expect(chatButton(page, title)).toBeHidden();
    }
    expect(await importFile(page, path)).toBe("2 Chats importiert.");
    await chatButton(page, `Export eins ${id}`).click();
    await expect(chat.questions).toHaveText([new RegExp(`Export eins ${id}`)]);
    await expect(chat.answers).toHaveCount(1);

    const broken = testInfo.outputPath("kaputt.json");
    writeFileSync(broken, "{ das ist kein json");
    expect(await importFile(page, broken)).toBe("Die Datei konnte nicht importiert werden. Bitte eine Export-Datei von Freebie wählen.");
    writeFileSync(broken, JSON.stringify({ conversations: [{ foo: 1 }] }));
    expect(await importFile(page, broken)).toBe("Die Datei konnte nicht importiert werden. Bitte eine Export-Datei von Freebie wählen.");

    // Unvollständige Einträge werden ergänzt und bringen nichts zum Absturz.
    const partial = testInfo.outputPath("teilweise.json");
    writeFileSync(partial, JSON.stringify({ conversations: [{ id: `p-${id}`, messages: [{ role: "user" }, { role: "assistant", text: "ok" }] }] }));
    expect(await importFile(page, partial)).toBe("1 Chat importiert.");
    await page.getByRole("searchbox", { name: "Chats durchsuchen" }).fill("importiert");
    await chatButton(page, "Importierter Chat").click();
    await expect(chat.answers).toHaveCount(1);
  });

  test("E08 500 importierte Chats bleiben flüssig", async ({ chat, page }, testInfo) => {
    const now = Date.now();
    const file = testInfo.outputPath("viele.json");
    writeFileSync(file, JSON.stringify(Array.from({ length: 500 }, (_, i) => conversation(`v-${i}`, `Chat Nummer ${i}`, now - i * 60_000))));
    expect(await importFile(page, file)).toBe("500 Chats importiert.");
    const started = Date.now();
    await page.getByRole("searchbox", { name: "Chats durchsuchen" }).fill("Nummer 499");
    await expect(chatButton(page, "Chat Nummer 499")).toBeVisible();
    await chatButton(page, "Chat Nummer 499").click();
    await expect(chat.answers).toHaveCount(1);
    expect(Date.now() - started).toBeLessThan(3000);
  });

  test("E09 Farbschema Hell, System, Dunkel bleibt gespeichert und folgt dem System", async ({ chat, page }) => {
    const theme = () => page.evaluate(() => document.documentElement.dataset.theme ?? "system");
    await page.getByRole("button", { name: "Dunkel" }).click();
    expect(await theme()).toBe("dark");
    await expect(page.getByRole("button", { name: "Dunkel" })).toHaveAttribute("aria-pressed", "true");
    await page.reload({ waitUntil: "domcontentloaded" });
    // Das Schema steht schon vor dem Laden der Skripte fest (kein Aufblitzen).
    expect(await theme()).toBe("dark");

    await page.getByRole("button", { name: "Hell" }).click();
    expect(await theme()).toBe("light");
    await page.getByRole("button", { name: "System" }).click();
    expect(await theme()).toBe("system");
    await page.emulateMedia({ colorScheme: "dark" });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    await page.emulateMedia({ colorScheme: "light" });
    const bgLight = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe(bgLight);
    void chat;
  });

  test("E10 Admin-Link führt in den Admin-Bereich", async ({ chat, page }) => {
    await page.getByRole("link", { name: "Admin" }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("heading", { name: "Admin-Bereich" })).toBeVisible();
    void chat;
  });
});
