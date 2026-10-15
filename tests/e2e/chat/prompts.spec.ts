import type { Page } from "@playwright/test";
import { EMPTY_PROMPT_FILTER, filterPrompts } from "../../../lib/library/search";
import type { FundusCatalog } from "../../../lib/library/types";
import { expectAccessible } from "../support/a11y";
import { expect, ipFor, openChat, test, uniq } from "../support/fixtures";
import { fundusCatalog, PromptMask, PromptsTab } from "../support/fundus";
import { GroupChatPage, startGroupChat } from "../support/groupchat";
import { clickTwice } from "../support/grenzfaelle";
import { mailGroup } from "../support/mail";

// PR · Prompts im Chat (Plan: FUNDUS-PFLEGE-PLAN.md). Die Tests lesen nur den Startbestand (12 Prompts in
// 6 Kategorien) – was den Fundus ändert, läuft im Projekt „admin“.

const ID = {
  mail: "prompt-mailverlauf",
  buerger: "prompt-buergeranfrage",
  absage: "prompt-absage",
  protokoll: "prompt-protokoll-aufgaben",
  verstaendlich: "prompt-verstaendlichkeit",
  verbessern: "prompt-verbessern",
  stichpunkte: "prompt-vorlage-stichpunkte",
} as const;

const prompt = (c: FundusCatalog, id: string) => c.prompts.find((p) => p.id === id)!;
const category = (c: FundusCatalog, id: string) => c.categories.find((x) => x.id === id)!;
const hits = (c: FundusCatalog, f: Partial<typeof EMPTY_PROMPT_FILTER>) => filterPrompts(c, { ...EMPTY_PROMPT_FILTER, ...f }).map((p) => p.id);
const toast = (page: Page) => page.getByRole("status").filter({ hasText: "Im Eingabefeld steht schon dein Entwurf – er bleibt stehen." });

/** Maske für „E-Mail-Verlauf zusammenfassen“ ausfüllen (Anzahl Punkte ist mit 5 vorausgefüllt). */
async function fillMail(mask: PromptMask, zielgruppe: string, schwerpunkt: string) {
  await mask.field("Zielgruppe").fill(zielgruppe);
  await mask.field("Was ist dir wichtig?").fill(schwerpunkt);
}
const mailText = (zielgruppe: string, punkte: string, schwerpunkt: string) =>
  `Fasse den angehängten E-Mail-Verlauf für ${zielgruppe} in ${punkte} Punkten zusammen: Wer will was von wem? Welche Fristen laufen? Was ist noch offen?\nAchte besonders auf: ${schwerpunkt}`;

test.describe("PR · Prompts im Chat", () => {
  test("PR01 Reiter „Prompts“: Zahl wie in der API, nach Kategorie gruppiert, Reiter und Filter bleiben beim Schließen", async ({ chat, page }) => {
    const catalog = await fundusCatalog(page.request);
    expect(catalog.prompts.length).toBeGreaterThanOrEqual(12);
    expect(catalog.categories.length).toBeGreaterThanOrEqual(6);
    const tab = new PromptsTab(page);
    await tab.open();
    await expect(tab.tab).toHaveText(`Prompts (${catalog.prompts.length})`);
    await expect(tab.list.getByRole("option")).toHaveCount(catalog.prompts.length);
    // Gruppen in der Reihenfolge der Kategorien; jede Kategorie hat aktive Prompts.
    const groups = tab.list.getByRole("group");
    await expect(groups).toHaveCount(catalog.categories.length);
    for (const [i, c] of catalog.categories.entries()) {
      await expect(groups.nth(i)).toHaveAttribute("aria-label", c.name);
      await expect(groups.nth(i).getByRole("option")).toHaveCount(catalog.prompts.filter((p) => p.categoryId === c.id).length);
    }
    // Reihenfolge innerhalb der Kategorie wie im Katalog.
    const order = await tab.list.getByRole("option").evaluateAll((els) => els.map((el) => el.getAttribute("data-id")));
    expect(order).toEqual(catalog.categories.flatMap((c) => catalog.prompts.filter((p) => p.categoryId === c.id).map((p) => p.id)));

    const first = catalog.categories[0];
    await tab.categories.getByRole("button", { name: new RegExp(`^${first.name}`) }).click();
    await page.keyboard.press("Escape");
    await expect(tab.dialog).toBeHidden();
    await page.getByRole("button", { name: "Fundus öffnen" }).click();
    await expect(tab.tab).toHaveAttribute("aria-selected", "true");
    await expect(tab.categories.getByRole("button", { name: new RegExp(`^${first.name}`) })).toHaveAttribute("aria-pressed", "true");
    await expect(tab.list.getByRole("option")).toHaveCount(hits(catalog, { categories: [first.id] }).length);
    void chat;
  });

  test("PR02 Filter und Suche: Kategorien (oder), Titel, Text, Platzhalter; groß/klein, ä/ae, ß/ss; kombiniert; zurücksetzen", async ({ chat, page }) => {
    const catalog = await fundusCatalog(page.request);
    const tab = new PromptsTab(page);
    await tab.open();
    const options = tab.list.getByRole("option");
    const count = tab.dialog.getByText(/^\d+ Prompts?$/);
    // Chips mit Zahl.
    for (const c of catalog.categories) {
      await expect(tab.categories.getByRole("button", { name: `${c.name} (${hits(catalog, { categories: [c.id] }).length})` })).toBeVisible();
    }
    const two = ["kat-schreiben", "kat-recherche"];
    for (const id of two) await tab.categories.getByRole("button", { name: new RegExp(`^${category(catalog, id).name}`) }).click();
    await expect(options).toHaveCount(hits(catalog, { categories: two }).length);
    await expect(count).toHaveText(`${hits(catalog, { categories: two }).length} Prompts`);
    await tab.dialog.getByRole("button", { name: "Filter zurücksetzen" }).click();
    await expect(options).toHaveCount(catalog.prompts.length);

    for (const query of ["EINFACHE SPRACHE", "groesste", "wortzahl", "Fachwörter", "fachwoerter", "zusagen", "was ist dir wichtig"]) {
      await tab.search.fill(query);
      const expected = hits(catalog, { query });
      expect(expected.length, query).toBeGreaterThan(0);
      await expect(options, query).toHaveCount(expected.length);
    }
    // Platzhalter im Text: „Wortzahl“ steckt nur im Platzhalter der Bürgeranfrage.
    await tab.search.fill("wortzahl");
    await expect(tab.option(ID.buerger)).toBeVisible();
    // Kombiniert: Kategorie und Suche.
    await tab.search.fill("absage");
    await tab.categories.getByRole("button", { name: /^Schreiben/ }).click();
    await expect(options).toHaveCount(1);
    await tab.categories.getByRole("button", { name: /^Recherche/ }).click();
    await expect(options).toHaveCount(1);
    await tab.search.fill("xyzzy gibt es nicht");
    await expect(tab.dialog.getByText("Keine Treffer.")).toBeVisible();
    await tab.dialog.getByRole("button", { name: "Filter zurücksetzen" }).click();
    await expect(tab.search).toHaveValue("");
    await expect(options).toHaveCount(catalog.prompts.length);
    void chat;
  });

  test("PR03 Vorschau: Kategorie, Beschreibung, hervorgehobene Platzhalter, Felder; Pfeiltasten wechseln, Enter öffnet die Maske", async ({ chat, page }) => {
    const catalog = await fundusCatalog(page.request);
    const p = prompt(catalog, ID.mail);
    const tab = new PromptsTab(page);
    await tab.open();
    await expect(tab.preview).toContainText("Wähle links einen Prompt");
    await expect(tab.fill).toBeDisabled();
    await tab.option(p.id).click();
    await expect(tab.preview.getByRole("heading", { name: p.title })).toBeVisible();
    await expect(tab.preview).toContainText(category(catalog, p.categoryId).name);
    await expect(tab.preview).toContainText(p.description);
    const marks = tab.preview.getByTestId("prompt-text").locator('mark[data-role="platzhalter"]');
    await expect(marks).toHaveText(["Zielgruppe", "Anzahl Punkte", "Was ist dir wichtig?"]);
    await expect(tab.preview.getByRole("list", { name: "Felder" }).getByRole("listitem")).toHaveCount(3);
    await expect(tab.preview).toContainText("vorausgefüllt: 5");
    await expect(tab.fill).toHaveText("Ausfüllen und einfügen");

    // Tastatur: Pfeil nach unten wählt den nächsten Prompt, Enter öffnet die Maske.
    await tab.option(p.id).focus();
    await page.keyboard.press("ArrowDown");
    const next = await page.evaluate(() => document.activeElement?.getAttribute("data-id"));
    expect(next).not.toBe(p.id);
    await expect(tab.preview.getByRole("heading", { name: prompt(catalog, next!).title })).toBeVisible();
    await page.keyboard.press("ArrowUp");
    await expect(tab.option(p.id)).toBeFocused();
    await page.keyboard.press("Enter");
    const mask = new PromptMask(page);
    await expect(mask.dialog).toBeVisible();
    await expect(mask.dialog).toContainText(p.title);
    void chat;
  });

  test("PR04 Maske: ein Feld je Platzhalter, Beschriftung, Hinweis, Standardwert, Auswahl, mehrzeilig, Live-Vorschau; Einfügen ohne Senden", async ({ chat, page, browserName }) => {
    const tab = new PromptsTab(page);
    const mask = new PromptMask(page);
    await tab.open();
    await tab.choose(ID.mail);
    await expect(mask.dialog).toBeVisible();
    // Über dem Fundus wird nicht noch einmal weichgezeichnet – zwei weichgezeichnete Hintergründe übereinander
    // brauchen in Safari über eine Sekunde pro Bild.
    await expect(mask.dialog).toHaveAttribute("data-stacked");
    await expect(tab.dialog).not.toHaveAttribute("data-stacked");
    if (browserName !== "firefox") {
      const blur = (d: typeof mask.dialog) => d.evaluate((el) => getComputedStyle(el, "::backdrop").backdropFilter);
      expect(await blur(mask.dialog)).toBe("none");
      expect(await blur(tab.dialog)).toBe("blur(2px)");
    }
    await expect(mask.dialog).toContainText("Bitte alle Felder ausfüllen.");
    const labels = await mask.dialog.locator("label").allInnerTexts();
    expect(labels).toEqual(["Zielgruppe", "Anzahl Punkte", "Was ist dir wichtig?"]);
    await expect(mask.field("Zielgruppe")).toHaveAttribute("placeholder", "z. B. die Amtsleitung");
    await expect(mask.field("Anzahl Punkte")).toHaveValue("5");
    expect(await mask.field("Was ist dir wichtig?").evaluate((el) => el.tagName)).toBe("TEXTAREA");
    await expect(mask.field("Zielgruppe")).toBeFocused();
    // Live-Vorschau: offen hervorgehoben, ausgefüllt mit Wert.
    await expect(mask.preview.locator('mark[data-role="platzhalter"]')).toHaveText(["Zielgruppe", "Was ist dir wichtig?"]);
    await mask.field("Zielgruppe").fill("die Amtsleitung");
    await expect(mask.preview.locator('[data-role="wert"]').first()).toHaveText("die Amtsleitung");
    await mask.field("Was ist dir wichtig?").fill("Kosten\nund Fristen");
    await expect(mask.preview.locator('mark[data-role="platzhalter"]')).toHaveCount(0);
    await mask.button("Einfügen").click();
    await expect(mask.dialog).toBeHidden();
    await expect(tab.dialog).toBeHidden();
    const text = mailText("die Amtsleitung", "5", "Kosten\nund Fristen");
    await expect(chat.composer).toHaveValue(text);
    await expect(chat.composer).toBeFocused();
    expect(await chat.composer.evaluate((el: HTMLTextAreaElement) => [el.selectionStart, el.selectionEnd])).toEqual([text.length, text.length]);
    await expect(chat.questions).toHaveCount(0);

    // Auswahl mit Standardwert.
    await tab.open();
    await tab.choose(ID.buerger);
    const wortzahl = mask.field("Wortzahl");
    expect(await wortzahl.evaluate((el) => el.tagName)).toBe("SELECT");
    await expect(wortzahl).toHaveValue("150");
    await expect(wortzahl.locator("option")).toHaveText(["Bitte wählen …", "100", "150", "250"]);
    await mask.button("Abbrechen").click();
  });

  test("PR05 Alle Felder sind Pflicht: leer, nur Leerzeichen, gelöschter Standardwert; Länge je Feld; Ergebnis über der Grenze sperrt", async ({ chat, page }) => {
    const tab = new PromptsTab(page);
    const mask = new PromptMask(page);
    await tab.open();
    await tab.choose(ID.mail);
    await mask.field("Zielgruppe").fill("   ");
    await mask.field("Anzahl Punkte").fill("");
    await mask.button("Einfügen").click();
    await expect(mask.dialog.getByText("Bitte ausfüllen.")).toHaveCount(3);
    await expect(mask.field("Zielgruppe")).toBeFocused();
    await expect(mask.field("Zielgruppe")).toHaveAttribute("aria-invalid", "true");
    await expect(mask.dialog).toBeVisible();
    await expect(chat.composer).toHaveValue("");

    await mask.field("Zielgruppe").fill("x".repeat(301));
    await mask.field("Anzahl Punkte").fill("3");
    await mask.field("Was ist dir wichtig?").fill("y".repeat(1000));
    await expect(mask.dialog.getByText("Höchstens 300 Zeichen (jetzt 301).")).toBeVisible();
    await mask.button("Einfügen").click();
    await expect(mask.dialog).toBeVisible();
    await mask.field("Zielgruppe").fill("den Rat");
    await expect(mask.dialog.getByText(/Bitte ausfüllen|Höchstens/)).toHaveCount(0);
    await mask.button("Einfügen").click();
    await expect(chat.composer).toHaveValue(mailText("den Rat", "3", "y".repeat(1000)));

    // Entwurf fast an der Grenze von 400.000 Zeichen: Anfügen ist gesperrt, Ersetzen geht.
    await chat.composer.fill("z".repeat(399_000));
    await tab.open();
    await tab.choose(ID.mail);
    await mask.field("Zielgruppe").fill("den Rat");
    await mask.field("Was ist dir wichtig?").fill("w".repeat(2000));
    await expect(mask.dialog.getByRole("alert")).toContainText(/Der Text wäre 401\.\d{3} Zeichen lang – im Eingabefeld sind höchstens 400\.000 möglich\./);
    await expect(mask.button("Anfügen")).toBeDisabled();
    await expect(mask.button("Ersetzen")).toBeEnabled();
    await mask.button("Ersetzen").click();
    await expect(chat.composer).toHaveValue(mailText("den Rat", "3", "w".repeat(2000)));
  });

  test("PR06 Werte aus dem echten Leben: Umlaute, Emoji, RTL, NBSP, Zeilen; {{…}}, $&, $1 und \\ bleiben wörtlich; Steuerzeichen weg", async ({ chat, page }) => {
    const tab = new PromptsTab(page);
    const mask = new PromptMask(page);
    await tab.open();
    await tab.choose(ID.verstaendlich);
    const zielgruppe = "Bürger 👨‍👩‍👧 مرحبا {{Zielgruppe}} $& $1 \\ Größe\u0007";
    await mask.field("Zielgruppe").fill(zielgruppe);
    const text = "Absatz eins aus Word\r\n\r\n\tEingerückt mit Tab\u0000\nEnde $$";
    await mask.field("Text").fill(text);
    await mask.button("Einfügen").click();
    const value = await chat.composer.inputValue();
    expect(value).toBe(
      "Prüfe den folgenden Text auf Verständlichkeit für Bürger 👨‍👩‍👧 مرحبا {{Zielgruppe}} $& $1 \\ Größe. Markiere lange Sätze und Fachwörter und schlage einfachere Formulierungen vor.\n\nText:\nAbsatz eins aus Word\n\n\tEingerückt mit Tab\nEnde $$",
    );
    // Einzeilig: ein eingefügter Zeilenumbruch wird zum Leerzeichen.
    await chat.composer.fill("");
    await tab.open();
    await tab.choose(ID.absage);
    await mask.field("Empfänger").evaluate((el: HTMLInputElement) => {
      // Wie beim Einfügen aus Word: ein Wert mit Zeilenumbruch (Eingabefelder entfernen ihn sonst selbst).
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, "Herrn\tAkbulut");
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await mask.field("Anliegen").fill("Fristverlängerung");
    await mask.button("Einfügen").click();
    await expect(chat.composer).toHaveValue(/^Formuliere eine höfliche, klare Absage an Herrn Akbulut zum Anliegen „Fristverlängerung“\./);
  });

  test("PR07 Entwurf: Hinweis, Ersetzen und Anfügen; unverändert eingefügt gilt nicht als Entwurf; Bearbeiten einer Nachricht; Abbrechen ändert nichts", async ({ chat, page }) => {
    // Fünfmal Fundus und Maske, dazu eine Antwort: in WebKit (CI) knapp an 60 Sekunden, daher das längere Budget.
    test.slow();
    const tab = new PromptsTab(page);
    const mask = new PromptMask(page);
    const id = uniq();
    const filled = `Formuliere eine höfliche, klare Absage an Frau Lind zum Anliegen „Parkausweis ${id}“. Begründe kurz, biete wenn möglich eine Alternative an und bleib unter 120 Wörtern.`;
    const fill = async () => {
      await mask.field("Empfänger").fill("Frau Lind");
      await mask.field("Anliegen").fill(`Parkausweis ${id}`);
    };
    await chat.composer.fill("Mein Entwurf");
    await tab.open();
    await tab.choose(ID.absage);
    await expect(mask.dialog).toContainText("Im Eingabefeld steht schon Text.");
    await fill();
    await mask.button("Abbrechen").click();
    await expect(mask.dialog).toBeHidden();
    await expect(tab.dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(chat.composer).toHaveValue("Mein Entwurf");

    await tab.open();
    await tab.choose(ID.absage);
    // Die Werte sind noch da (bis zum Neuladen).
    await expect(mask.field("Empfänger")).toHaveValue("Frau Lind");
    await mask.button("Anfügen").click();
    await expect(chat.composer).toHaveValue(`Mein Entwurf\n\n${filled}`);
    // Angefügt steckt der Entwurf noch drin – also wieder fragen.
    await tab.open();
    await tab.choose(ID.absage);
    await mask.button("Ersetzen").click();
    await expect(chat.composer).toHaveValue(filled);
    // Unverändert eingefügt: kein Entwurf, nur „Einfügen“.
    await tab.open();
    await tab.choose(ID.absage);
    await expect(mask.button("Anfügen")).toHaveCount(0);
    await mask.button("Einfügen").click();
    await expect(chat.composer).toHaveValue(filled);

    // Bearbeiten einer früheren Nachricht: der Prompt landet im Bearbeitungsfeld, der Entwurf kommt danach zurück.
    await chat.ask(`Erste Frage ${id}`);
    await chat.composer.fill(`Entwurf ${id}`);
    await chat.questions.first().hover();
    await chat.questions.first().getByRole("button", { name: "Bearbeiten" }).click();
    await expect(chat.composer).toHaveValue(`Erste Frage ${id}`);
    await tab.open();
    await tab.choose(ID.absage);
    await mask.button("Ersetzen").click();
    await expect(chat.composer).toHaveValue(filled);
    await page.getByRole("button", { name: "Abbrechen" }).click();
    await expect(chat.composer).toHaveValue(`Entwurf ${id}`);
  });

  test("PR08 Prompt ohne Platzhalter: „Einfügen“ ohne Maske; ein Entwurf bleibt stehen (Hinweis mit „Ersetzen“)", async ({ chat, page }) => {
    const catalog = await fundusCatalog(page.request);
    const p = prompt(catalog, ID.protokoll);
    expect(p.placeholders).toEqual([]);
    const tab = new PromptsTab(page);
    await tab.open();
    await tab.option(p.id).click();
    await expect(tab.fill).toHaveText("Einfügen");
    await expect(tab.preview).toContainText("Ohne Platzhalter");
    await tab.fill.click();
    await expect(new PromptMask(page).dialog).toBeHidden();
    await expect(tab.dialog).toBeHidden();
    await expect(chat.composer).toHaveValue(p.text);

    await chat.composer.fill("Mein Entwurf");
    await tab.open();
    await tab.choose(p.id);
    await expect(toast(page)).toBeVisible();
    await expect(chat.composer).toHaveValue("Mein Entwurf");
    await toast(page).getByRole("button", { name: "Ersetzen" }).click();
    await expect(chat.composer).toHaveValue(p.text);
  });

  test("PR09 Senden: normaler Nachrichtentext ohne Platzhalter und ohne „Vorlage“; gleiche Werte → Antwort aus dem Cache; mit Vorlage kombinierbar", async ({ chat, page, browser, baseURL, ip }) => {
    const id = uniq();
    const send = async (c: typeof chat) => {
      const tab = new PromptsTab(c.page);
      const mask = new PromptMask(c.page);
      await tab.open();
      await tab.choose(ID.mail);
      await fillMail(mask, `Team ${id}`, "Fristen");
      await mask.button("Einfügen").click();
      await expect(c.sendButton).toBeEnabled();
      const before = await c.answers.count();
      await c.sendButton.click();
      await c.waitForAnswer(before + 1);
      return c.lastAnswer;
    };
    const first = await send(chat);
    const text = mailText(`Team ${id}`, "5", "Fristen");
    await expect(chat.questions.last()).toContainText(`für Team ${id} in 5 Punkten`);
    await expect(chat.questions.last()).not.toContainText("{{");
    expect(await chat.diagnosis(first, "Vorlage")).toBe("keine");
    await expect(first).toContainText(text.split("\n").at(-1)!);
    await expect(first.getByText("aus dem Cache")).toHaveCount(0);

    const other = await openChat(browser, baseURL!, ipFor(`${ip}-zweiter`));
    const second = await send(other);
    await expect(second.getByText("aus dem Cache")).toBeVisible();

    // Mit Vorlage: die Zeile „Vorlage“ nennt die Vorlage, der Prompt bleibt Nachrichtentext.
    await chat.newChat();
    await page.getByRole("button", { name: /^E-Mail-Profi/ }).click();
    const third = await send(chat);
    expect(await chat.diagnosis(third, "Vorlage")).toMatch(/^Rolle: Du bist ein erfahrener Kommunikationsprofi/);
  });

  test("PR10 Gruppenchat: Prompts im Fundus, eingefügter Text beginnt mit „@Freebie “, Grenze 50.000 Zeichen, die anderen sehen erst nach dem Senden etwas", async ({ browser, baseURL, ip, admin }) => {
    const { guests } = await mailGroup(admin, 2);
    const [a, b] = guests;
    const chatA = await openChat(browser, baseURL!, ip, { guest: a });
    const chatB = await openChat(browser, baseURL!, ipFor(`${ip}-b`), { guest: b });
    const title = `Prompt-Runde ${uniq()}`;
    await startGroupChat(chatA.page.request, title, [b.username]);
    const gA = GroupChatPage.of(chatA);
    const gB = GroupChatPage.of(chatB);
    await chatA.page.reload();
    await gA.open(title);
    await chatB.page.reload();
    await gB.open(title);

    const tab = new PromptsTab(chatA.page);
    const mask = new PromptMask(chatA.page);
    await tab.open();
    await tab.choose(ID.mail);
    await fillMail(mask, "die Gruppe", "Zuständigkeiten");
    await mask.button("Einfügen").click();
    const text = `@Freebie ${mailText("die Gruppe", "5", "Zuständigkeiten")}`;
    await expect(gA.composer).toHaveValue(text);
    await expect(gB.conversation.getByText("die Gruppe in 5 Punkten")).toHaveCount(0);

    // Grenze im Gruppenchat: 50.000 Zeichen.
    await gA.composer.fill("");
    await tab.open();
    await tab.choose(ID.verbessern);
    await mask.field("Dein Prompt").fill("p".repeat(50_000));
    await expect(mask.dialog.getByRole("alert")).toContainText(/Der Text wäre 50\.\d{3} Zeichen lang – im Eingabefeld sind höchstens 50\.000 möglich\./);
    await expect(mask.button("Einfügen")).toBeDisabled();
    await mask.field("Dein Prompt").fill("Schreib eine Einladung.");
    await mask.button("Einfügen").click();
    await expect(gA.composer).toHaveValue(/^@Freebie Hier ist mein Prompt:/);
    await gA.sendButton.click();
    await gA.waitForAnswer(1);
    await expect(gB.conversation.getByText("Schreib eine Einladung.").first()).toBeVisible({ timeout: 20_000 });
  });

  test("PR11 Doppelklick und Tastatur: einmal eingefügt; Enter springt weiter, im letzten Feld fügt es ein; Strg+Enter; Esc schließt erst die Maske", async ({ chat, page }) => {
    const tab = new PromptsTab(page);
    const mask = new PromptMask(page);
    await tab.open();
    await tab.choose(ID.absage);
    await mask.field("Empfänger").fill("Herrn Kurz");
    await page.keyboard.press("Enter");
    await expect(mask.field("Anliegen")).toBeFocused();
    await page.keyboard.type("Akteneinsicht");
    // Doppeltes Enter im letzten Feld (im selben Augenblick) fügt genau einmal ein.
    await mask.field("Anliegen").evaluate((el) => {
      for (let i = 0; i < 2; i++) el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", code: "Enter", bubbles: true, cancelable: true }));
    });
    await expect(mask.dialog).toBeHidden();
    const once = await chat.composer.inputValue();
    expect(once.match(/Formuliere eine höfliche/g)).toHaveLength(1);

    // Doppelklick auf „Einfügen“.
    await chat.composer.fill("");
    await tab.open();
    await tab.choose(ID.absage);
    await clickTwice(mask.button("Einfügen"));
    await expect(mask.dialog).toBeHidden();
    expect((await chat.composer.inputValue()).match(/Formuliere eine höfliche/g)).toHaveLength(1);

    // Mehrzeilig: Enter macht eine neue Zeile, Strg+Enter fügt ein.
    await chat.composer.fill("");
    await tab.open();
    await tab.choose(ID.verbessern);
    await mask.field("Dein Prompt").click();
    await page.keyboard.type("Zeile eins");
    await page.keyboard.press("Enter");
    await page.keyboard.type("Zeile zwei");
    await expect(mask.field("Dein Prompt")).toHaveValue("Zeile eins\nZeile zwei");
    await page.keyboard.press("Control+Enter");
    await expect(mask.dialog).toBeHidden();
    await expect(chat.composer).toHaveValue(/Zeile eins\nZeile zwei/);

    // Esc: erst die Maske, dann der Fundus; die Werte bleiben beim erneuten Öffnen.
    await chat.composer.fill("");
    await tab.open();
    await tab.choose(ID.mail);
    await mask.field("Zielgruppe").fill("die Amtsleitung");
    await page.keyboard.press("Escape");
    await expect(mask.dialog).toBeHidden();
    await expect(tab.dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(tab.dialog).toBeHidden();
    await tab.open();
    await tab.choose(ID.mail);
    await expect(mask.field("Zielgruppe")).toHaveValue("die Amtsleitung");
    await expect(chat.composer).toHaveValue("");
  });

  test("PR12 Handy: Reiter erreichbar, Liste → Vorschau, Maske im Vollbild, kein seitliches Scrollen @mobil", async ({ chat, page }) => {
    const tab = new PromptsTab(page);
    const mask = new PromptMask(page);
    await tab.open();
    await tab.option(ID.mail).click();
    await expect(tab.preview.getByRole("heading", { name: "E-Mail-Verlauf zusammenfassen" })).toBeVisible();
    await expect(tab.list).toBeHidden();
    await tab.dialog.getByRole("button", { name: "Zurück zur Liste" }).click();
    await expect(tab.list).toBeVisible();
    await tab.choose(ID.mail);
    const box = (await mask.dialog.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(page.viewportSize()!.width - 1);
    await mask.field("Zielgruppe").fill("die Amtsleitung");
    await mask.field("Was ist dir wichtig?").fill("Fristen");
    // Das aktive Feld liegt im sichtbaren Bereich.
    const field = (await mask.field("Was ist dir wichtig?").boundingBox())!;
    expect(field.y + field.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    expect(await mask.dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await mask.button("Einfügen").click();
    await expect(chat.composer).toHaveValue(mailText("die Amtsleitung", "5", "Fristen"));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  });

  test("PR12 Tablet: Liste und Vorschau nebeneinander, Enter im mehrzeiligen Feld macht eine neue Zeile @tablet", async ({ chat, page }) => {
    const tab = new PromptsTab(page);
    const mask = new PromptMask(page);
    await tab.open();
    await tab.option(ID.verbessern).click();
    await expect(tab.preview.getByRole("heading", { name: "Meinen Prompt verbessern lassen" })).toBeVisible();
    await expect(tab.list).toBeVisible();
    await tab.fill.click();
    await mask.field("Dein Prompt").click();
    await page.keyboard.type("eins");
    await page.keyboard.press("Enter");
    await page.keyboard.type("zwei");
    await expect(mask.field("Dein Prompt")).toHaveValue("eins\nzwei");
    await mask.button("Einfügen").click();
    await expect(chat.composer).toHaveValue(/eins\nzwei/);
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`PR13 Barrierefreiheit (${scheme === "light" ? "hell" : "dunkel"}): Reiter und Maske, Pflichtfelder, Fehler am Feld, Fokus zurück ins Eingabefeld`, async ({ chat, page }, testInfo) => {
      test.slow();
      await page.emulateMedia({ colorScheme: scheme });
      const tab = new PromptsTab(page);
      const mask = new PromptMask(page);
      await tab.open();
      await tab.option(ID.stichpunkte).click();
      await expectAccessible(page, testInfo, `prompts-reiter-${scheme}`);
      await tab.fill.click();
      for (const label of ["Anzahl", "Zielgruppe"]) await expect(mask.field(label)).toHaveAttribute("aria-required", "true");
      await mask.button("Einfügen").click();
      const field = mask.field("Zielgruppe");
      await expect(field).toHaveAttribute("aria-invalid", "true");
      const describedBy = await field.getAttribute("aria-describedby");
      await expect(page.locator(`[id="${describedBy}"]`)).toHaveText("Bitte ausfüllen.");
      await expectAccessible(page, testInfo, `prompts-maske-${scheme}`);
      await field.fill("den Hauptausschuss");
      await mask.button("Einfügen").click();
      await expect(chat.composer).toBeFocused();
    });
  }
});
