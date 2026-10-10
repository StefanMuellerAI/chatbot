import { strFromU8, unzipSync } from "fflate";
import type { Download, Locator, Page } from "@playwright/test";
import * as XLSX from "xlsx";
import type { LibraryCatalog, LibraryDocument, LibraryThread } from "../../../lib/library/types";
import { expectAccessible } from "../support/a11y";
import { expect, test, uniq } from "../support/fixtures";
import { attachments, chip, expectReady } from "../support/files";

// Y · Fundus: erfundene Dateien und E-Mails aus Verwaltungen (Plan: FUNDUS-PLAN.md).
// Die Inhalte kommen aus library/content; die Tests holen Titel, Dateinamen und Pflichtbegriffe aus dem Katalog.

const IDS = {
  word: "fb-beschlussvorlage-kita-nordstadt",
  excel: "fb-budgetueberwachung-th51",
  powerpoint: "fb-buergeramt-2030",
  mitzeichnung: "fb-mitzeichnung-kita-nordstadt",
  bieterfrage: "bzbl-bieterfrage-los2",
} as const;

const number = new Intl.NumberFormat("de-DE");
const fundusButton = (page: Page) => page.getByRole("button", { name: "Fundus öffnen" });
const dialog = (page: Page) => page.getByRole("dialog", { name: "Fundus" });
const docList = (page: Page) => dialog(page).getByRole("listbox", { name: "Dokumente" });
const threadList = (page: Page) => dialog(page).getByRole("listbox", { name: "E-Mail-Verläufe" });
const preview = (page: Page) => dialog(page).getByRole("region", { name: "Vorschau" });
const threadView = (page: Page) => dialog(page).getByRole("region", { name: "Verlauf" });
const docOption = (page: Page, id: string) => docList(page).locator(`[data-id="${id}"]`);
const threadOption = (page: Page, id: string) => threadList(page).locator(`[data-id="${id}"]`);
const checkbox = (option: Locator) => option.locator('[data-role="auswahl"]');
const search = (page: Page) => dialog(page).getByRole("searchbox", { name: "Fundus durchsuchen" });
const status = (page: Page) => dialog(page).getByRole("status");
const tab = (page: Page, name: "Dokumente" | "E-Mails") => dialog(page).getByRole("tab", { name: new RegExp(`^${name}`) });

async function catalogOf(page: Page): Promise<LibraryCatalog> {
  const res = await page.request.get("/api/library");
  expect(res.status()).toBe(200);
  return (await res.json()) as LibraryCatalog;
}
const doc = (c: LibraryCatalog, id: string): LibraryDocument => c.documents.find((d) => d.id === id)!;
const thread = (c: LibraryCatalog, id: string): LibraryThread => c.threads.find((t) => t.id === id)!;

async function openFundus(page: Page) {
  await fundusButton(page).click();
  await expect(docList(page).getByRole("option").first()).toBeVisible();
}

/** Dokument in der Liste wählen und über die Vorschau anhängen. */
async function attachDoc(page: Page, d: LibraryDocument) {
  await docOption(page, d.id).click();
  await expect(preview(page).getByRole("heading", { name: d.title })).toBeVisible();
  await preview(page).getByRole("button", { name: "Anhängen", exact: true }).click();
  await expect(dialog(page)).toBeHidden();
}

async function openThread(page: Page, t: LibraryThread) {
  await tab(page, "E-Mails").click();
  await threadOption(page, t.id).click();
  await expect(threadView(page).getByRole("article")).toHaveCount(t.mails.length);
}

async function readDownload(download: Download): Promise<Buffer> {
  return Buffer.concat(await (await download.createReadStream()).toArray());
}

test.describe("Y · Fundus", () => {
  test("Y01 Datenbank-Symbol sitzt neben der Büroklammer und öffnet den Fundus", async ({ chat, page }) => {
    const button = fundusButton(page);
    await expect(button).toBeVisible();
    await expect(button).toHaveAttribute("title", /Fundus/);
    expect(await page.getByRole("button", { name: "Datei anhängen" }).evaluate((el) => el.nextElementSibling?.getAttribute("aria-label"))).toBe("Fundus öffnen");
    await button.click();
    await expect(dialog(page)).toBeVisible();
    await expect(tab(page, "Dokumente")).toHaveAttribute("aria-selected", "true");
    await expect(dialog(page).getByText("Erfundene Dateien und E-Mails aus Verwaltungen")).toBeVisible();
    void chat;
  });

  test("Y02 Dialog schließt per X, Esc und Klick daneben, gibt den Fokus zurück und merkt sich Reiter und Suche", async ({ chat, page }) => {
    const button = fundusButton(page);
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(docList(page).getByRole("option").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog(page)).toBeHidden();
    await expect(button).toBeFocused();

    await button.click();
    await dialog(page).getByRole("button", { name: "Schließen" }).click();
    await expect(dialog(page)).toBeHidden();

    await button.click();
    await tab(page, "E-Mails").click();
    await search(page).fill("Bieterfrage");
    await expect(threadList(page).getByRole("option")).toHaveCount(1);
    await page.mouse.click(5, 5);
    await expect(dialog(page)).toBeHidden();

    await button.click();
    await expect(tab(page, "E-Mails")).toHaveAttribute("aria-selected", "true");
    await expect(search(page)).toHaveValue("Bieterfrage");
    await expect(threadList(page).getByRole("option")).toHaveCount(1);
    void chat;
  });

  test("Y03 Katalog: Anzahl je Reiter, alle Verwaltungen und Einheiten, genug von jedem Typ", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    for (const type of ["word", "excel", "powerpoint"]) expect(catalog.documents.filter((d) => d.type === type).length, type).toBeGreaterThanOrEqual(5);
    expect(catalog.threads.length).toBeGreaterThanOrEqual(5);
    expect(new Set(catalog.orgs.map((o) => o.level))).toEqual(new Set(["kommune", "kreis", "land", "bund", "it"]));

    await openFundus(page);
    await expect(tab(page, "Dokumente")).toHaveText(`Dokumente (${catalog.documents.length})`);
    await expect(tab(page, "E-Mails")).toHaveText(`E-Mails (${catalog.threads.length})`);
    await expect(docList(page).getByRole("option")).toHaveCount(catalog.documents.length);
    const orgs = dialog(page).getByRole("combobox", { name: "Verwaltung" });
    const units = dialog(page).getByRole("combobox", { name: "Organisationseinheit" });
    await expect(orgs.locator("option")).toHaveCount(catalog.orgs.length + 1);
    await expect(units).toBeDisabled();
    for (const org of catalog.orgs) {
      await orgs.selectOption(org.id);
      await expect(units).toBeEnabled();
      await expect(units.locator("option")).toHaveCount(org.units.length + 1);
    }
    void chat;
  });

  test("Y04 Filter nach Verwaltung, Einheit samt Untereinheiten, Typ und Merkmal – kombiniert und zurücksetzbar", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    await openFundus(page);
    const options = docList(page).getByRole("option");
    const count = dialog(page).getByText(/^\d+ Dokumente?$/);
    const orgs = dialog(page).getByRole("combobox", { name: "Verwaltung" });
    const units = dialog(page).getByRole("combobox", { name: "Organisationseinheit" });
    const typeChip = (label: string) => dialog(page).getByRole("group", { name: "Dateityp" }).getByRole("button", { name: label });
    const tagChip = (label: string) => dialog(page).getByRole("group", { name: "Merkmale" }).getByRole("button", { name: label });

    await orgs.selectOption("falkenbrueck");
    const fb = catalog.documents.filter((d) => d.orgId === "falkenbrueck");
    await expect(options).toHaveCount(fb.length);
    await expect(count).toHaveText(`${fb.length} Dokumente`);
    // Ein Dezernat zeigt auch die Dokumente seiner Ämter und Abteilungen.
    await units.selectOption("fb-dez5");
    await expect(options).toHaveCount(1);
    await expect(docOption(page, IDS.word)).toBeVisible();
    await expect(count).toHaveText("1 Dokument");

    await orgs.selectOption("bzbl");
    await expect(units).toHaveValue("");
    await typeChip("Word").click();
    await expect(typeChip("Word")).toHaveAttribute("aria-pressed", "true");
    await expect(options).toHaveCount(catalog.documents.filter((d) => d.orgId === "bzbl" && d.type === "word").length);

    await dialog(page).getByRole("button", { name: "Filter zurücksetzen" }).click();
    await expect(options).toHaveCount(catalog.documents.length);
    await expect(typeChip("Word")).toHaveAttribute("aria-pressed", "false");

    await tagChip("Fiktive Personendaten").click();
    await expect(options).toHaveCount(catalog.documents.filter((d) => d.tags.includes("personendaten")).length);
    await tagChip("Fiktive Personendaten").click();

    await orgs.selectOption("brackenhain");
    await typeChip("Excel").click();
    await expect(dialog(page).getByText("Keine Treffer.")).toBeVisible();
    await expect(count).toHaveText("0 Dokumente");
    await dialog(page).getByRole("button", { name: "Filter zurücksetzen" }).click();
    await expect(count).toHaveText(`${catalog.documents.length} Dokumente`);
    void chat;
  });

  test("Y05 Suche findet Titel, Stichworte, Einheiten und Personen – egal ob groß/klein, ä/ae, ß/ss", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    await openFundus(page);
    const options = docList(page).getByRole("option");
    await search(page).fill("KIEBITZWEG");
    await expect(options).toHaveCount(1);
    await expect(docOption(page, IDS.word)).toBeVisible();

    await search(page).fill("Kaemmerei");
    await expect(docOption(page, IDS.excel)).toBeVisible();
    await search(page).fill("strassenverkehr");
    await expect(options).toHaveCount(1);
    await expect(options.first()).toContainText("Zulassungsstelle");
    await search(page).fill("lindqvist");
    await expect(options.first()).toContainText(doc(catalog, "bzbl-vergabevermerk-notebooks").title);

    // Suche und Filter zusammen
    await search(page).fill("Kämmerei");
    await dialog(page).getByRole("group", { name: "Dateityp" }).getByRole("button", { name: "PowerPoint" }).click();
    await expect(dialog(page).getByText("Keine Treffer.")).toBeVisible();
    void chat;
  });

  test("Y06 Vorschau für Word (Briefkopf), Excel (Blattreiter) und PowerPoint (Folien, Diagramme, Notizen)", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    const word = doc(catalog, IDS.word);
    await openFundus(page);
    await expect(preview(page)).toContainText("Wähle links ein Dokument");

    await docOption(page, word.id).click();
    await expect(preview(page).getByRole("heading", { name: word.title })).toBeVisible();
    await expect(preview(page)).toContainText(`ca. ${number.format(word.tokens)} Tokens`);
    await expect(preview(page)).toContainText(word.author.name);
    const page1 = preview(page).getByTestId("vorschau-word");
    await expect(page1).toContainText("Stadt Falkenbrück");
    await expect(page1).toContainText("V/2025/0412");
    await expect(page1).toContainText("Fiktives Übungsdokument – Freebie-Fundus");
    await expect(page1.getByRole("img", { name: "Signet Stadt Falkenbrück" })).toBeVisible();

    await docOption(page, IDS.excel).click();
    const sheet = preview(page).getByTestId("vorschau-excel");
    await expect(sheet.getByRole("columnheader", { name: "Ansatz 2025" })).toBeVisible();
    await expect(sheet).toContainText("18.450.000 €");
    await expect(sheet).toContainText("81.550.000 €");
    await sheet.getByRole("button", { name: "Fallzahlen HzE" }).click();
    await expect(sheet.getByRole("button", { name: "Fallzahlen HzE" })).toHaveAttribute("aria-pressed", "true");
    await expect(sheet).toContainText("Durchschnitt");

    await docOption(page, IDS.powerpoint).click();
    const slides = preview(page).getByTestId("vorschau-powerpoint");
    await expect(slides.locator(":scope > li")).toHaveCount(8);
    await expect(slides.getByRole("img", { name: "Diagramm: Wartezeit auf einen Termin" })).toBeVisible();
    await slides.getByText("Sprechernotizen").first().click();
    await expect(slides.getByText("Die No-Show-Quote stammt aus dem Terminsystem")).toBeVisible();
    void chat;
  });

  test("Y07 Herunterladen liefert die echte Datei mit richtigem Namen", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    await openFundus(page);
    for (const id of [IDS.word, IDS.excel]) {
      const d = doc(catalog, id);
      await docOption(page, id).click();
      const pending = page.waitForEvent("download");
      await preview(page).getByRole("link", { name: "Herunterladen" }).click();
      const download = await pending;
      expect(download.suggestedFilename()).toBe(d.fileName);
      const data = await readDownload(download);
      if (d.type === "word") {
        expect(strFromU8(unzipSync(new Uint8Array(data))["word/document.xml"])).toContain("Kiebitzweg");
      } else {
        const wb = XLSX.read(data, { type: "buffer" });
        expect(wb.SheetNames).toEqual(["Übersicht", "Fallzahlen HzE"]);
        expect(wb.Sheets["Übersicht"].C5.v).toBe(18450000);
      }
    }
    const mail = thread(catalog, IDS.bieterfrage).mails[0];
    const res = await page.request.get(`/api/library/${mail.id}/file`);
    expect(res.headers()["content-type"]).toBe("message/rfc822");
    expect(await res.text()).toContain("From: Jan Seidel <jan.seidel@sb-systemhaus.example>");
    void chat;
  });

  for (const type of ["word", "excel", "powerpoint"] as const) {
    test(`Y08 ${type === "word" ? "Word" : type === "excel" ? "Excel" : "PowerPoint"} aus dem Fundus anhängen: Fundus-Kennzeichen und Inhalt beim Modell`, async ({ chat, page }) => {
      const catalog = await catalogOf(page);
      const d = doc(catalog, IDS[type]);
      await openFundus(page);
      const request = page.waitForRequest((r) => r.url().endsWith("/api/library/attach"));
      await attachDoc(page, d);
      expect((await request).postDataJSON()).toEqual({ id: d.id });
      await expectReady(page, d.fileName, `Fundus · ca. ${number.format(d.tokens)} Tokens`);
      await expect(page.getByText(`≈ ${number.format(d.tokens)} Tokens im Anhang`)).toBeVisible();
      await expect(chat.composer).toBeFocused();

      const answer = await chat.ask(`#zeige-dateien Worum geht es? ${uniq()}`);
      expect(await chat.diagnosis(answer, "Dateien")).toBe(d.fileName);
      for (const keyword of d.keywords.slice(0, 2)) await expect(answer.locator("pre")).toContainText(keyword);
      await expect(chat.questions.last().getByRole("group", { name: d.fileName, exact: true })).toContainText("Fundus");
      await expect(attachments(page)).toHaveCount(0);
    });
  }

  test("Y09 Mehrfachauswahl hängt mehrere Dateien an; die Grenze von 20 Anhängen gilt auch hier", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    const [a, b, c, d, e, f] = catalog.documents;
    await openFundus(page);
    for (const x of [a, b, c]) await checkbox(docOption(page, x.id)).click();
    for (const x of [a, b, c]) await expect(docOption(page, x.id)).toHaveAttribute("aria-selected", "true");
    await expect(status(page)).toHaveText("3 Dateien ausgewählt");
    await dialog(page).getByRole("button", { name: "3 Dateien anhängen" }).click();
    await expect(dialog(page)).toBeHidden();
    for (const x of [a, b, c]) await expectReady(page, x.fileName, "Fundus · ca.");

    const files = Array.from({ length: 15 }, (_, i) => ({ name: `grenze-${i + 1}.txt`, mimeType: "text/plain", buffer: Buffer.from(`Grenze ${i + 1} ${uniq()}`) }));
    await page.getByLabel("Dateien zum Anhängen").setInputFiles(files);
    await expectReady(page, "grenze-15.txt", /ca\. \d+ Tokens/);

    await openFundus(page);
    await expect(status(page)).toHaveText("Noch 2 Anhänge möglich");
    await checkbox(docOption(page, d.id)).click();
    await checkbox(docOption(page, e.id)).click();
    await checkbox(docOption(page, f.id)).click();
    await expect(status(page)).toHaveText("Es sind nur noch 2 Anhänge möglich.");
    await expect(docOption(page, f.id)).toHaveAttribute("aria-selected", "false");
    await dialog(page).getByRole("button", { name: "2 Dateien anhängen" }).click();
    await expectReady(page, e.fileName, "Fundus · ca.");
    await expect(attachments(page).getByRole("group")).toHaveCount(20);
    void chat;
  });

  test("Y10 Bereits angehängte Dateien sind markiert und werden nicht doppelt angehängt", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    const word = doc(catalog, IDS.word);
    await openFundus(page);
    await attachDoc(page, word);
    await expectReady(page, word.fileName, "Fundus · ca.");

    await fundusButton(page).click();
    const option = docOption(page, word.id);
    await expect(option).toHaveAttribute("aria-disabled", "true");
    await expect(option).toContainText("angehängt");
    await checkbox(option).click();
    await expect(option).toHaveAttribute("aria-selected", "false");
    await expect(preview(page).getByRole("button", { name: "Bereits angehängt" })).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(attachments(page).getByRole("group")).toHaveCount(1);

    await attachments(page).getByRole("button", { name: `${word.fileName} entfernen` }).click();
    await fundusButton(page).click();
    await expect(option).not.toHaveAttribute("aria-disabled", "true");
    void chat;
  });

  test("Y11 Katalogfehler mit „Erneut versuchen“, Entfernen bricht das Holen ab, Serverfehler blockieren nicht", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    let failCatalog = true;
    await page.route("**/api/library", (route) => (failCatalog ? route.fulfill({ status: 500, json: { error: "Kurz nicht erreichbar." } }) : route.continue()));
    await fundusButton(page).click();
    await expect(dialog(page).getByRole("alert")).toContainText("Der Fundus konnte nicht geladen werden: Kurz nicht erreichbar.");
    failCatalog = false;
    await dialog(page).getByRole("button", { name: "Erneut versuchen" }).click();
    await expect(docList(page).getByRole("option").first()).toBeVisible();

    let release: () => void = () => {};
    let started: () => void = () => {};
    const attachStarted = new Promise<void>((r) => (started = r));
    await page.route("**/api/library/attach", async (route) => {
      started();
      await new Promise<void>((r) => (release = r));
      await route.continue().catch(() => {});
    });
    const aborted = page.waitForEvent("requestfailed", (r) => r.url().endsWith("/api/library/attach"));
    const word = doc(catalog, IDS.word);
    await attachDoc(page, word);
    await attachStarted;
    await expect(chip(page, word.fileName)).toContainText("Wird aus dem Fundus geholt");
    await expect(chat.sendButton).toBeDisabled();
    await attachments(page).getByRole("button", { name: `${word.fileName} entfernen` }).click();
    await expect(chip(page, word.fileName)).toHaveCount(0);
    expect((await aborted).failure()?.errorText).toMatch(/ABORTED|cancel/i);
    release();
    await page.unroute("**/api/library/attach");

    await page.route("**/api/library/attach", (route) => route.fulfill({ status: 500, json: { error: "Fundus-Datei defekt." } }));
    const excel = doc(catalog, IDS.excel);
    await fundusButton(page).click();
    await attachDoc(page, excel);
    await expect(chip(page, excel.fileName)).toContainText("Fundus-Datei defekt.");
    await chat.composer.fill("Trotzdem senden");
    await expect(chat.sendButton).toBeEnabled();
  });

  test("Y12 E-Mails: Verläufe neueste zuerst, Filter nach Verwaltung, Suche nach Betreff und Absender", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    await openFundus(page);
    await tab(page, "E-Mails").click();
    const options = threadList(page).getByRole("option");
    await expect(options).toHaveCount(catalog.threads.length);
    const newest = [...catalog.threads].sort((a, b) => (a.date === b.date ? a.title.localeCompare(b.title, "de") : a.date < b.date ? 1 : -1))[0];
    await expect(options.first()).toHaveAttribute("data-id", newest.id);
    await expect(dialog(page).getByText(`${catalog.threads.length} Verläufe`)).toBeVisible();

    await dialog(page).getByRole("combobox", { name: "Verwaltung" }).selectOption("bzbl");
    await expect(options).toHaveCount(catalog.threads.filter((t) => t.orgId === "bzbl").length);
    await dialog(page).getByRole("button", { name: "Filter zurücksetzen" }).click();

    await search(page).fill("kh.wolters");
    await expect(options).toHaveCount(1);
    await expect(options.first()).toHaveAttribute("data-id", "bh-beschwerde-laerm-dgh");
    await search(page).fill("bieterfrage");
    await expect(options).toHaveCount(1);
    await expect(options.first()).toContainText(thread(catalog, IDS.bieterfrage).subject);
    void chat;
  });

  test("Y13 Verlauf zeigt alle Mails mit Kopfzeilen und Anhängen", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    const t = thread(catalog, IDS.mitzeichnung);
    await openFundus(page);
    await openThread(page, t);
    await expect(threadView(page).getByRole("heading", { name: t.subject })).toBeVisible();
    const mails = threadView(page).getByRole("article");
    await expect(mails.first()).toContainText("Petra Lindner");
    await expect(mails.first()).toContainText("Betreff");
    await expect(mails.first()).toContainText("Cc");
    await expect(mails.first().getByRole("list", { name: "Anhänge der E-Mail" })).toContainText(doc(catalog, IDS.word).fileName);
    await expect(mails.nth(2)).toContainText("Sabine Kowalczyk");
    await expect(mails.nth(2)).toContainText("Mi., 08.10.2025, 09:05");
    void chat;
  });

  test("Y14 Einzelne E-Mail anhängen: Absender, Empfänger, Datum, Betreff und Text erreichen das Modell", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    const t = thread(catalog, IDS.bieterfrage);
    await openFundus(page);
    await openThread(page, t);
    await threadView(page).getByRole("article").first().getByRole("button", { name: "Diese E-Mail anhängen" }).click();
    await expect(dialog(page)).toBeHidden();
    await expectReady(page, t.mails[0].fileName, "Fundus · ca.");

    const answer = await chat.ask(`#zeige-dateien Was will der Bieter? ${uniq()}`);
    expect(await chat.diagnosis(answer, "Dateien")).toBe(t.mails[0].fileName);
    const pre = answer.locator("pre");
    await expect(pre).toContainText("Von: Jan Seidel <jan.seidel@sb-systemhaus.example>");
    await expect(pre).toContainText("An: Marco Lindqvist <marco.lindqvist@bzbl.bund.example>");
    await expect(pre).toContainText("Datum: Donnerstag, 2. Oktober 2025 um 10:41");
    await expect(pre).toContainText("Betreff: Bieterfrage zu Vergabe B4-2025-117, Los 2");
    await expect(pre).toContainText("15 Arbeitstagen");
  });

  test("Y15 Ganzen Verlauf anhängen: alle Mails in Reihenfolge, jüngste zuerst", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    const t = thread(catalog, IDS.mitzeichnung);
    await openFundus(page);
    await openThread(page, t);
    await threadView(page).getByRole("checkbox", { name: "Anhänge mitnehmen" }).uncheck();
    await threadView(page).getByRole("button", { name: "Ganzen Verlauf anhängen" }).click();
    await expect(dialog(page)).toBeHidden();
    const last = t.mails.at(-1)!;
    await expectReady(page, last.fileName, "Fundus · ca.");
    await expect(attachments(page).getByRole("group")).toHaveCount(1);

    const answer = await chat.ask(`#zeige-dateien Fasse den Verlauf zusammen ${uniq()}`);
    const text = await answer.locator("pre").innerText();
    const order = ["Raum 2.14", "nur unter Vorbehalt mitzeichnen", "Bebauungsplan Nr. 47", "Ich bitte um Mitzeichnung"].map((s) => text.indexOf(s));
    expect(order.every((i) => i >= 0), text.slice(0, 500)).toBe(true);
    expect([...order].sort((x, y) => x - y)).toEqual(order);
  });

  test("Y16 „Anhänge mitnehmen“ hängt die Dokumente der Mail mit an – oder nennt sie nur", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    const t = thread(catalog, IDS.mitzeichnung);
    const word = doc(catalog, IDS.word);
    await openFundus(page);
    await openThread(page, t);
    await expect(threadView(page).getByRole("checkbox", { name: "Anhänge mitnehmen" })).toBeChecked();
    await threadView(page).getByRole("article").first().getByRole("button", { name: "Diese E-Mail anhängen" }).click();
    await expectReady(page, t.mails[0].fileName, "Fundus · ca.");
    await expectReady(page, word.fileName, "Fundus · ca.");
    for (const name of [t.mails[0].fileName, word.fileName]) await attachments(page).getByRole("button", { name: `${name} entfernen` }).click();

    await fundusButton(page).click();
    await threadView(page).getByRole("checkbox", { name: "Anhänge mitnehmen" }).uncheck();
    await threadView(page).getByRole("article").first().getByRole("button", { name: "Diese E-Mail anhängen" }).click();
    await expectReady(page, t.mails[0].fileName, "Fundus · ca.");
    await expect(attachments(page).getByRole("group")).toHaveCount(1);
    const answer = await chat.ask(`#zeige-dateien Welche Anlagen gibt es? ${uniq()}`);
    await expect(answer.locator("pre")).toContainText(`Anhänge: ${word.fileName} (`);
  });

  test("Y17 Fundus-Anhänge bleiben im Verlauf: Neu generieren, Export, Neuladen, Bearbeiten", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    const word = doc(catalog, IDS.word);
    await openFundus(page);
    await attachDoc(page, word);
    await expectReady(page, word.fileName, "Fundus · ca.");
    const text = `Fasse die Vorlage zusammen ${uniq()}`;
    await chat.ask(text);
    const question = chat.questions.last();
    await expect(question.getByRole("group", { name: word.fileName, exact: true })).toContainText("Fundus");

    await chat.lastAnswer.getByRole("button", { name: "Neu generieren" }).click();
    await chat.waitForAnswer(1);
    expect(await chat.diagnosis(chat.lastAnswer, "Dateien")).toBe(word.fileName);

    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "Chat als Markdown exportieren" }).click();
    expect((await readDownload(await download)).toString("utf8")).toContain(`> 📎 ${word.fileName} (Fundus)`);

    await page.reload();
    await page.getByRole("navigation", { name: "Chatverlauf" }).getByRole("button", { name: text, exact: true }).click();
    await expect(chat.questions.last().getByRole("group", { name: word.fileName, exact: true })).toContainText("Fundus");
    await chat.questions.last().hover();
    await chat.questions.last().getByRole("button", { name: "Bearbeiten" }).click();
    await expect(chip(page, word.fileName)).toContainText("Fundus");
    await chat.composer.fill(`Jetzt kürzer ${uniq()}`);
    await chat.sendButton.click();
    await chat.waitForAnswer(1);
    expect(await chat.diagnosis(chat.lastAnswer, "Dateien")).toBe(word.fileName);
  });

  test("Y18 Datei-Cache, Antwort-Cache über Chats hinweg und Rückfall ohne Datei-Cache", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    const word = doc(catalog, IDS.word);
    await openFundus(page);
    await attachDoc(page, word);
    await expectReady(page, word.fileName, "Fundus · ca.");
    await attachments(page).getByRole("button", { name: `${word.fileName} entfernen` }).click();
    const again = page.waitForResponse((r) => r.url().endsWith("/api/library/attach"));
    await fundusButton(page).click();
    await attachDoc(page, word);
    expect((await again).headers()["x-freebie-cache"]).toBe("hit");
    await expectReady(page, word.fileName, "Fundus · ca.");

    // Gleiche Frage mit gleicher Fundus-Datei in einem neuen Chat: aus dem Antwort-Cache.
    const question = `Was beschließt der Rat? ${uniq()}`;
    const first = await chat.ask(question);
    await expect(first.getByText("aus dem Cache")).toHaveCount(0);
    await chat.newChat();
    await fundusButton(page).click();
    await attachDoc(page, word);
    await expectReady(page, word.fileName, "Fundus · ca.");
    const second = await chat.ask(question);
    await expect(second.getByText("aus dem Cache")).toBeVisible();

    // Ohne Eintrag im Datei-Cache (wie nach dem Aufräumjob) liest der Server die Fundus-Datei neu aus.
    await chat.newChat();
    const excel = doc(catalog, IDS.excel);
    await fundusButton(page).click();
    await attachDoc(page, excel);
    await expectReady(page, excel.fileName, "Fundus · ca.");
    await page.route("**/api/chat", async (route) => {
      const body = route.request().postDataJSON() as { messages: { attachments?: { sha256: string }[] }[] };
      for (const a of body.messages.at(-1)!.attachments ?? []) a.sha256 = Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");
      await route.continue({ postData: JSON.stringify(body) });
    });
    const answer = await chat.ask(`#zeige-dateien Zahlen? ${uniq()}`);
    await expect(answer.locator("pre")).toContainText(excel.keywords[0]);
    await expect(answer.locator("pre")).not.toContainText("nicht mehr verfügbar");
  });

  test("Y19 Bedienung nur mit der Tastatur: Reiter, Liste, Auswahl und Anhängen", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    await fundusButton(page).focus();
    await page.keyboard.press("Enter");
    await expect(docList(page).getByRole("option").first()).toBeVisible();

    await tab(page, "Dokumente").focus();
    await page.keyboard.press("ArrowRight");
    await expect(tab(page, "E-Mails")).toBeFocused();
    await expect(tab(page, "E-Mails")).toHaveAttribute("aria-selected", "true");
    await page.keyboard.press("ArrowLeft");
    await expect(tab(page, "Dokumente")).toHaveAttribute("aria-selected", "true");

    const options = docList(page).getByRole("option");
    await options.first().focus();
    await page.keyboard.press("ArrowDown");
    await expect(options.nth(1)).toBeFocused();
    const secondId = await options.nth(1).getAttribute("data-id");
    await expect(preview(page).getByRole("heading", { name: doc(catalog, secondId!).title })).toBeVisible();
    await page.keyboard.press("End");
    await expect(options.last()).toBeFocused();
    await page.keyboard.press("Home");
    await expect(options.first()).toBeFocused();
    await page.keyboard.press(" ");
    await expect(options.first()).toHaveAttribute("aria-selected", "true");
    await expect(status(page)).toHaveText("1 Datei ausgewählt");
    const firstId = await options.first().getAttribute("data-id");
    await page.keyboard.press("Enter");
    await expect(dialog(page)).toBeHidden();
    await expectReady(page, doc(catalog, firstId!).fileName, "Fundus · ca.");
    void chat;
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`Y19 Fundus ist barrierearm (${scheme === "light" ? "hell" : "dunkel"}): Liste, Vorschauen und E-Mails`, async ({ chat, page }, testInfo) => {
      await page.emulateMedia({ colorScheme: scheme });
      const catalog = await catalogOf(page);
      await openFundus(page);
      await expectAccessible(page, testInfo, `fundus-liste-${scheme}`);
      for (const [id, testId] of [
        [IDS.word, "vorschau-word"],
        [IDS.excel, "vorschau-excel"],
        [IDS.powerpoint, "vorschau-powerpoint"],
      ] as const) {
        await docOption(page, id).click();
        await expect(preview(page).getByTestId(testId)).toBeVisible();
        await expectAccessible(page, testInfo, `fundus-${testId}-${scheme}`);
      }
      await openThread(page, thread(catalog, IDS.mitzeichnung));
      await expectAccessible(page, testInfo, `fundus-emails-${scheme}`);
      void chat;
    });
  }

  test("Y20 Handy: Vollbild, Filter einklappbar, Liste → Vorschau → Zurück, Anhängen ohne seitliches Scrollen @mobil", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    const word = doc(catalog, IDS.word);
    await openFundus(page);
    const box = (await dialog(page).boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(page.viewportSize()!.width - 1);
    const orgs = dialog(page).getByRole("combobox", { name: "Verwaltung" });
    await expect(orgs).toBeHidden();
    await dialog(page).getByRole("button", { name: /^Filter/ }).click();
    await expect(orgs).toBeVisible();

    await docOption(page, word.id).click();
    await expect(preview(page).getByRole("heading", { name: word.title })).toBeVisible();
    await expect(docList(page)).toBeHidden();
    expect(await dialog(page).evaluate((el) => el.scrollWidth <= el.clientWidth + 1)).toBe(true);
    await dialog(page).getByRole("button", { name: "Zurück zur Liste" }).click();
    await expect(docList(page)).toBeVisible();

    await attachDoc(page, word);
    await expectReady(page, word.fileName, "Fundus · ca.");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
    void chat;
  });

  test("Y20 Tablet: Liste und Vorschau nebeneinander @tablet", async ({ chat, page }) => {
    const catalog = await catalogOf(page);
    await openFundus(page);
    await docOption(page, IDS.excel).click();
    await expect(preview(page).getByRole("heading", { name: doc(catalog, IDS.excel).title })).toBeVisible();
    await expect(docList(page)).toBeVisible();
    await expect(dialog(page).getByRole("combobox", { name: "Verwaltung" })).toBeVisible();
    void chat;
  });
});
