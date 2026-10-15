import { spawn, type ChildProcess } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { request as playwrightRequest, type APIRequestContext, type Page } from "@playwright/test";
import type { FundusCatalog } from "../../../lib/library/types";
import { expectAccessible } from "../support/a11y";
import { chip, expectReady } from "../support/files";
import { AdminApi, ChatPage, createGuest, expect, ipFor, openChat, test, uniq } from "../support/fixtures";
import { FundusAdminPage, fundusCatalog, PromptMask, PromptsTab, uniqueDocx, upload } from "../support/fundus";
import { docxWith, eml, fixture } from "../support/generate-files";
import { clickTwice } from "../support/grenzfaelle";
import { GroupChatPage, startGroupChat } from "../support/groupchat";
import { mailGroup } from "../support/mail";
import { CRON_SECRET } from "../support/servers.mjs";

// FP · Fundus pflegen (Admin) und Y22–Y26 · eigene Inhalte im Chat (Plan: FUNDUS-PFLEGE-PLAN.md).
// Alles, was den Fundus ändert, läuft hier auf dem seriellen Server; restore() räumt nach jedem Test auf.

const BUILT_IN = { word: "fb-beschlussvorlage-kita-nordstadt", thread: "bzbl-bieterfrage-los2" } as const;
const fx = (name: string) => readFileSync(fixture(name));
const guestIp = (ip: string, n = 1) => ipFor(`${ip}-gast-${n}`);
const fundusDialog = (page: Page) => page.getByRole("dialog", { name: "Fundus" });
const docList = (page: Page) => fundusDialog(page).getByRole("listbox", { name: "Dokumente" });
const threadList = (page: Page) => fundusDialog(page).getByRole("listbox", { name: "E-Mail-Verläufe" });

async function guestFundus(chat: ChatPage, tab?: "Dokumente" | "E-Mails" | "Prompts") {
  await chat.page.getByRole("button", { name: "Fundus öffnen" }).click();
  await expect(fundusDialog(chat.page)).toBeVisible();
  if (tab) await fundusDialog(chat.page).getByRole("tab", { name: new RegExp(`^${tab}`) }).click();
}

/** Mock-Antwort mit den Dateiinhalten, die das Modell bekommen hat. */
async function filesSeen(chat: ChatPage, question = "Was steht drin?") {
  const answer = await chat.ask(`#zeige-dateien ${question} ${uniq()}`);
  return answer.locator("pre");
}

test.describe("FP · Fundus pflegen", () => {
  test("FP01 Reiter „Fundus“: Unterreiter, Zahlen, Kennzeichen, Suche und Auswahl; Hinweis, wenn der Fundus ausgeschaltet ist", async ({ page, admin }) => {
    const [own] = await admin.addDocuments([{ name: "Eigener Bericht.docx", data: uniqueDocx("x").buffer, meta: { title: `Eigener Bericht ${uniq()}` } }]);
    await admin.json("PUT", "/api/admin/fundus/documents", { id: own, title: "Inaktiver Bericht", summary: "", date: "2026-10-14", tags: [], keywords: [], enabled: false });
    await admin.hide(BUILT_IN.word);
    const data = await admin.fundus();
    const p = await FundusAdminPage.open(page);
    await expect(page.getByRole("tab", { name: "Fundus" })).toHaveAttribute("aria-selected", "true");
    for (const [name, count] of [["Dokumente", data.documents.length], ["E-Mail-Verläufe", data.threads.length], ["Prompts", data.prompts.length], ["Kategorien", data.categories.length]] as const) {
      await expect(p.sub(name)).toHaveText(`${name} (${count})`);
    }
    const stats = page.getByRole("definition");
    await expect(stats.nth(0)).toHaveText("1");
    await expect(stats.nth(2)).toHaveText(`${data.prompts.length} (${data.prompts.filter((x) => x.enabled).length} aktiv)`);
    await expect(stats.nth(3)).toHaveText("1");

    await expect(p.row(own)).toContainText("eigen");
    await expect(p.row(own)).toContainText("inaktiv");
    await expect(p.row(own)).toContainText("Eigene Inhalte");
    await expect(p.row(BUILT_IN.word)).toContainText("mitgeliefert");
    await expect(p.row(BUILT_IN.word)).toContainText("ausgeblendet");

    const show = page.getByRole("combobox", { name: "Anzeigen" });
    await show.selectOption("eigen");
    await expect(p.documents.getByRole("listitem")).toHaveCount(1);
    await show.selectOption("ausgeblendet");
    await expect(p.documents.getByRole("listitem")).toHaveCount(1);
    await expect(p.row(BUILT_IN.word)).toBeVisible();
    await show.selectOption("fundus");
    await expect(p.documents.getByRole("listitem")).toHaveCount(data.documents.length - 1);
    await show.selectOption("alle");
    await page.getByRole("searchbox", { name: "Dokumente durchsuchen" }).fill("inaktiver bericht");
    await expect(p.documents.getByRole("listitem")).toHaveCount(1);
    await expect(page.getByText("1 Dokument", { exact: true })).toBeVisible();

    await admin.setFeatures({ library: false });
    await page.reload();
    await page.getByRole("tab", { name: "Fundus" }).click();
    await expect(page.getByText("Der Fundus ist für Teilnehmende ausgeschaltet (Einstellungen › Funktionen) – pflegen geht trotzdem.")).toBeVisible();
    await expect(p.sub("Dokumente")).toBeVisible();
  });

  test("FP02 Dokumente hochladen: Word, Excel, PowerPoint, PDF per Auswahl und Ablegen; Prüfschritt; gemeinsame und eigene Angaben; danach im Chat", async ({ page, admin, browser, baseURL, ip }) => {
    const p = await FundusAdminPage.open(page);
    await p.uploadDocuments([upload("zahlen.xlsx"), upload("folien.pptx"), upload("bericht.pdf")]);
    // Ablegen per Drag & Drop.
    await p.uploadDialog.getByTestId("ablage").evaluate((el, b64) => {
      const dt = new DataTransfer();
      dt.items.add(new File([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], "vertrag.docx"));
      el.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    }, fx("vertrag.docx").toString("base64"));
    await p.waitChecked();
    for (const [name, label] of [["vertrag.docx", "Word"], ["zahlen.xlsx", "Excel"], ["folien.pptx", "PowerPoint"], ["bericht.pdf", "PDF"]]) {
      await expect(p.entry(name)).toContainText(new RegExp(`${label} · ca\\. \\d+ Tokens · Kurz`));
    }
    // Vorschau aus der echten Datei.
    for (const [name, testId] of [["vertrag.docx", "vorschau-word"], ["zahlen.xlsx", "vorschau-excel"], ["folien.pptx", "vorschau-powerpoint"], ["bericht.pdf", "vorschau-pdf"]]) {
      await p.entry(name).getByRole("button", { name: "Vorschau" }).click();
      await expect(p.entry(name).getByTestId(testId)).toBeVisible();
    }
    await expect(p.entry("bericht.pdf").getByTestId("vorschau-pdf")).toContainText("Umsatzbericht Seite eins");
    await expect(p.entry("vertrag.docx").getByTestId("vorschau-word")).toContainText("72 Quadratmeter");

    const id = uniq();
    await p.entry("vertrag.docx").getByLabel("Titel für „vertrag.docx“").fill(`Mietvertrag ${id}`);
    // Gemeinsame Angaben.
    const shared = p.uploadDialog.getByRole("region", { name: "Angaben für alle Dateien" });
    await shared.getByLabel("Datum").fill("2026-09-30");
    await shared.getByLabel("Stichwörter").fill(`Übung ${id}, Haushalt`);
    await shared.getByRole("checkbox", { name: "Mit Zahlen" }).check();
    await shared.getByLabel("Kurzbeschreibung").fill("Für den Kurs am Montag.");
    // Eigene Angaben für eine Datei.
    await p.entry("folien.pptx").getByRole("checkbox", { name: "Eigene Angaben für diese Datei" }).check();
    await p.entry("folien.pptx").getByLabel("Kurzbeschreibung").fill("Nur die Folien.");
    await expect(p.uploadDialog.getByRole("button", { name: /^Speichern/ })).toBeDisabled();
    await p.confirmAndSave(p.uploadDialog, /^Speichern \(4 Dateien\)/);
    await expect(p.uploadDialog).toBeHidden();
    await expect(page.getByText("4 Dateien gespeichert.")).toBeVisible();
    await expect(p.sub("Dokumente")).toHaveText(`Dokumente (${(await admin.fundus()).documents.length})`);

    const own = (await admin.fundus()).documents.filter((d) => d.source === "eigen");
    expect(own.map((d) => d.type).sort()).toEqual(["excel", "pdf", "powerpoint", "word"]);
    const mietvertrag = own.find((d) => d.title === `Mietvertrag ${id}`)!;
    expect(mietvertrag.tags).toEqual(expect.arrayContaining(["kurz", "zahlen"]));
    expect(own.every((d) => d.tags.includes("zahlen"))).toBe(true);

    // Im Chat: unter „Eigene Inhalte“, mit Typ „PDF“.
    const chat = await openChat(browser, baseURL!, guestIp(ip));
    await guestFundus(chat, "Dokumente");
    await fundusDialog(chat.page).getByRole("combobox", { name: "Verwaltung" }).selectOption({ label: "Eigene Inhalte" });
    await expect(docList(chat.page).getByRole("option")).toHaveCount(4);
    await fundusDialog(chat.page).getByRole("group", { name: "Dateityp" }).getByRole("button", { name: "PDF" }).click();
    await expect(docList(chat.page).getByRole("option")).toHaveCount(1);
    void admin;
  });

  test("FP03 Prüfungen beim Hochladen: falsche Formate mit Tipp, umbenannt, leer, kaputt, Zip-Bombe, ohne Text – die gute Datei wird trotzdem gespeichert", async ({ page, admin }) => {
    const p = await FundusAdminPage.open(page);
    const good = uniqueDocx("gut.docx", "Gute Datei");
    await p.uploadDocuments([
      good,
      upload("zahlen.xls"),
      upload("mail.eml"),
      upload("notiz.txt"),
      upload("punkt.png", "bild.docx"),
      upload("falsch.pdf"),
      { name: "leer.docx", mimeType: "application/octet-stream", buffer: Buffer.alloc(0) },
      { name: "kaputt.docx", mimeType: "application/octet-stream", buffer: Buffer.from("PK\u0003\u0004 kaputt kaputt") },
      upload("bombe.docx"),
      upload("nur-bild.docx"),
      { name: "Bericht.doc", mimeType: "application/msword", buffer: Buffer.from("alt") },
      { name: "Mail.msg", mimeType: "application/octet-stream", buffer: Buffer.from("msg") },
      { name: "setup.exe", mimeType: "application/octet-stream", buffer: Buffer.from("MZ") },
    ]);
    await p.waitChecked();
    const problem = (name: string) => p.entry(name).getByRole("alert");
    await expect(problem("zahlen.xls")).toContainText("als .xlsx speichern");
    await expect(problem("mail.eml")).toContainText("„Verlauf hochladen“");
    await expect(problem("notiz.txt")).toContainText("Im Fundus gehen Word (.docx), Excel (.xlsx), PowerPoint (.pptx) und PDF.");
    await expect(problem("bild.docx")).toContainText("Der Inhalt passt nicht zur Endung");
    await expect(problem("falsch.pdf")).toContainText("Der Inhalt passt nicht zur Endung");
    await expect(problem("leer.docx")).toContainText("Die Datei ist leer.");
    await expect(problem("kaputt.docx")).toHaveText("Die Datei konnte nicht gelesen werden. Ist sie beschädigt oder passwortgeschützt?");
    await expect(problem("bombe.docx")).toHaveText("Die Datei ist zu groß oder beschädigt (entpackt über 200 MB).");
    await expect(problem("nur-bild.docx")).toContainText(/kein(en)? lesbare/i);
    await expect(problem("Bericht.doc")).toContainText("als .docx speichern");
    await expect(problem("Mail.msg")).toContainText("Outlook-Nachrichten (.msg) gehen nicht");
    await expect(problem("setup.exe")).toContainText("Im Fundus gehen Word");
    await p.confirmAndSave(p.uploadDialog, /^Speichern \(1 Datei\)/);
    await expect(p.uploadDialog).toBeHidden();
    await expect(page.getByText("1 Datei gespeichert.")).toBeVisible();
    expect((await admin.fundus()).documents.filter((d) => d.source === "eigen")).toHaveLength(1);
  });

  test("FP04 Dubletten, Doppelklick und Abbruch: nichts doppelt, einmal angelegt, abgebrochen bleibt nichts stehen", async ({ page, admin }) => {
    await admin.addDocuments([{ name: "vertrag.docx", data: fx("vertrag.docx"), meta: { title: "Mietvertrag alt" } }]);
    const p = await FundusAdminPage.open(page);
    const twin = uniqueDocx("zwilling.docx", "Zwilling");
    await p.uploadDocuments([upload("vertrag.docx", "vertrag-neu.docx"), twin, { ...twin, name: "zwilling-kopie.docx" }]);
    await p.waitChecked();
    await expect(p.entry("vertrag-neu.docx").getByRole("alert")).toHaveText("Gibt es schon im Fundus als „Mietvertrag alt“.");
    await expect(p.entry("zwilling-kopie.docx").getByRole("alert")).toHaveText("Diese Datei ist schon in der Auswahl.");
    await p.uploadDialog.getByRole("checkbox", { name: /keine echten/ }).check();
    const save = p.uploadDialog.getByRole("button", { name: /^Speichern \(1 Datei\)/ });
    await clickTwice(save);
    await expect(p.uploadDialog).toBeHidden();
    const own = (await admin.fundus()).documents.filter((d) => d.source === "eigen");
    expect(own.map((d) => d.title).sort()).toEqual(["Mietvertrag alt", "zwilling"]);

    // Abbrechen während des Uploads: kein Eintrag.
    let release!: () => void;
    const held = new Promise<void>((r) => (release = r));
    await page.route("**/api/admin/fundus/local", async (route) => {
      await held;
      await route.continue().catch(() => {});
    });
    await p.uploadDocuments([uniqueDocx("abgebrochen.docx", "Abgebrochen")]);
    await expect(p.entry("abgebrochen.docx")).toContainText("Lädt hoch");
    await p.uploadDialog.getByRole("button", { name: "Abbrechen" }).click();
    await expect(p.uploadDialog).toBeHidden();
    release();
    await page.unroute("**/api/admin/fundus/local");
    expect((await admin.fundus()).documents.filter((d) => d.source === "eigen")).toHaveLength(2);
  });

  test("FP05 Hinweis auf echte Daten: Warnung je Fundstelle; Speichern nur mit Bestätigung, die API verlangt sie auch", async ({ page, admin }) => {
    const p = await FundusAdminPage.open(page);
    await p.uploadDocuments([upload("echte-daten.docx")]);
    await p.waitChecked();
    const hints = p.entry("echte-daten.docx").getByRole("list", { name: "Hinweise" });
    await expect(hints).toContainText("E-Mail-Adresse mit echter Domain: max.mustermann@gmail.com");
    await expect(hints).toContainText("Gültige IBAN");
    const save = p.uploadDialog.getByRole("button", { name: /^Speichern/ });
    await expect(save).toBeDisabled();
    await p.uploadDialog.getByRole("checkbox", { name: /keine echten/ }).check();
    await expect(save).toBeEnabled();
    await p.uploadDialog.getByRole("checkbox", { name: /keine echten/ }).uncheck();
    await expect(save).toBeDisabled();

    const key = await admin.uploadFundusFile("x.docx", uniqueDocx("x").buffer);
    const res = await admin.api.post("/api/admin/fundus/documents", { data: { files: [{ key, name: "x.docx", title: "x", date: "2026-10-14" }] } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Bitte bestätigen, dass die Dateien keine echten personenbezogenen oder vertraulichen Daten enthalten.");
    const thread = await admin.api.post("/api/admin/fundus/threads", { data: { confirmed: false, files: [{ key, name: "x.eml" }], title: "x" } });
    expect(thread.status()).toBe(400);
  });

  test("FP06 E-Mail-Verlauf hochladen: nach Datum sortiert, Titel ohne „AW:“/„WG:“, Beteiligte, Anhang als Dokument des Verlaufs", async ({ page, admin, browser, baseURL, ip }) => {
    const p = await FundusAdminPage.open(page, "E-Mail-Verläufe");
    await p.uploadThread([upload("verlauf-3.eml"), upload("verlauf-1.eml"), upload("verlauf-2.eml")]);
    await expect(p.threadDialog.locator("li[data-mail]")).toHaveCount(3, { timeout: 30_000 });
    expect(await p.threadDialog.locator("li[data-mail]").evaluateAll((els) => els.map((e) => e.getAttribute("data-mail")))).toEqual(["verlauf-1.eml", "verlauf-2.eml", "verlauf-3.eml"]);
    await expect(p.threadDialog.locator('li[data-mail="verlauf-1.eml"]')).toContainText("Öffnungszeiten Bürgeramt im Dezember");
    await expect(p.threadDialog.getByLabel("Titel")).toHaveValue("Öffnungszeiten Bürgeramt im Dezember");
    await expect(p.threadDialog.getByText(/^Beteiligte:/)).toContainText("Jan Petersen");
    await expect(p.threadDialog.getByText(/^Beteiligte:/)).toContainText("Anna Schmidt");
    await expect(p.threadDialog.getByText(/^Beteiligte:/)).toContainText("Bürgeramt Musterhausen");
    const third = p.threadDialog.locator('li[data-mail="verlauf-3.eml"]');
    await expect(third).toContainText("Dienstplan Dezember.docx");
    await expect(third).toContainText("wird Dokument des Verlaufs");
    await expect(third).toContainText("Lageplan.dwg");
    await expect(third).toContainText("nur in der Mail genannt");
    await p.confirmAndSave(p.threadDialog, /^Verlauf speichern \(3 E-Mails\)/);
    await expect(p.threadDialog).toBeHidden();
    await expect(page.getByText("Verlauf „Öffnungszeiten Bürgeramt im Dezember“ mit 3 E-Mails und 1 Anhang gespeichert.")).toBeVisible();

    const data = await admin.fundus();
    const thread = data.threads.find((t) => t.source === "eigen")!;
    expect(thread).toMatchObject({ title: "Öffnungszeiten Bürgeramt im Dezember", mails: 3, attachments: 1 });
    const attachment = data.documents.find((d) => d.threadId === thread.id)!;
    expect(attachment.title).toBe("Dienstplan Dezember");
    await p.sub("Dokumente").click();
    await expect(p.row(attachment.id)).toContainText("Anhang von „Öffnungszeiten Bürgeramt im Dezember“");
    await expect(p.row(attachment.id).getByRole("button", { name: /löschen$/ })).toBeDisabled();

    const chat = await openChat(browser, baseURL!, guestIp(ip));
    await guestFundus(chat, "E-Mails");
    await threadList(chat.page).locator(`[data-id="${thread.id}"]`).click();
    await expect(fundusDialog(chat.page).getByRole("region", { name: "Verlauf" }).getByRole("article")).toHaveCount(3);
  });

  test("FP07 Prüfungen beim Verlauf: .msg, ohne Kopfzeilen, doppelte Mail, ohne Datum, mehr als 50 Mails, kodierter Betreff", async ({ page, admin }) => {
    const p = await FundusAdminPage.open(page, "E-Mail-Verläufe");
    await p.uploadThread([upload("verlauf-1.eml"), upload("ohne-datum.eml"), upload("doppelt.eml"), upload("kaputt.eml"), { name: "Antwort.msg", mimeType: "application/octet-stream", buffer: Buffer.from("x") }]);
    await expect(p.threadDialog.getByRole("alert").filter({ hasText: "Outlook-Nachrichten (.msg) gehen nicht" })).toBeVisible();
    await expect(p.threadDialog.locator('li[data-mail="kaputt.eml"]')).toContainText("Die E-Mail konnte nicht gelesen werden. Ist es wirklich eine .eml-Datei?", { timeout: 30_000 });
    await expect(p.threadDialog.locator('li[data-mail="doppelt.eml"]')).toContainText("Doppelt (wie „verlauf-1.eml“) – wird nicht übernommen.");
    await expect(p.threadDialog.getByRole("list", { name: "Hinweise" })).toContainText("Mindestens eine Mail hat kein Datum");
    await expect(p.threadDialog.locator('li[data-mail="ohne-datum.eml"]')).toContainText("ohne Datum");
    await expect(p.threadDialog.locator('li[data-mail="verlauf-1.eml"]')).toContainText("Öffnungszeiten Bürgeramt im Dezember");
    await expect(p.threadDialog.getByRole("button", { name: /^Verlauf speichern \(2 E-Mails\)/ })).toBeVisible();
    await p.threadDialog.getByRole("button", { name: "Abbrechen" }).click();

    // Nur eine kaputte Datei: nichts zu speichern; die API antwortet mit 422.
    await p.uploadThread([upload("kaputt.eml")]);
    await expect(p.threadDialog.getByText("Keine der Dateien ist eine lesbare, neue E-Mail.")).toBeVisible({ timeout: 30_000 });
    await expect(p.threadDialog.getByRole("button", { name: /^Verlauf speichern/ })).toBeDisabled();
    await p.threadDialog.getByRole("button", { name: "Abbrechen" }).click();
    const key = await admin.uploadFundusFile("kaputt.eml", fx("kaputt.eml"));
    const res = await admin.api.post("/api/admin/fundus/threads", { data: { confirmed: true, files: [{ key, name: "kaputt.eml" }], title: "x" } });
    expect(res.status()).toBe(422);

    // Mehr als 50 Mails.
    const many = Array.from({ length: 51 }, (_, i) => ({
      name: `mail-${i}.eml`,
      mimeType: "message/rfc822",
      buffer: eml({ from: "a@stadt.example", to: "b@stadt.example", subject: `Mail ${i}`, date: "Mon, 01 Dec 2025 09:00:00 +0100", id: `viele-${i}-${uniq()}@stadt.example`, body: `Nummer ${i}` }),
    }));
    await p.uploadThread(many);
    await expect(p.threadDialog.getByText("Höchstens 50 Mails je Verlauf – 1 Datei bleibt weg.")).toBeVisible();
    await p.threadDialog.getByRole("button", { name: "Abbrechen" }).click();
  });

  test("FP08 Eigene Einträge bearbeiten: Angaben und Aktiv für Dokumente und Verläufe; Wirkung im Chat beim nächsten Öffnen; Datei und Prüfsumme bleiben", async ({ page, admin, browser, baseURL, ip }) => {
    const [id] = await admin.addDocuments([{ name: "Plan.docx", data: uniqueDocx("Plan.docx", "Plan").buffer, meta: { title: "Plan alt" } }]);
    const chat = await openChat(browser, baseURL!, guestIp(ip));
    const before = (await fundusCatalog(chat.page.request)).documents.find((d) => d.id === id)!;
    const p = await FundusAdminPage.open(page);
    await p.row(id).getByRole("button", { name: "„Plan alt“ bearbeiten" }).click();
    const dialog = page.getByRole("dialog", { name: "Dokument bearbeiten" });
    await expect(dialog).toContainText("Datei: Plan.docx");
    await dialog.getByLabel("Titel").fill("Plan neu");
    await dialog.getByLabel("Datum").fill("2026-01-31");
    await dialog.getByRole("checkbox", { name: "Mit Widersprüchen" }).check();
    await dialog.getByLabel("Stichwörter").fill("Parkraum, Satzung");
    await dialog.getByLabel("Kurzbeschreibung").fill("Neue Beschreibung");
    await dialog.getByRole("switch", { name: "Aktiv" }).click();
    await dialog.getByRole("button", { name: "Speichern" }).click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText("„Plan neu“ gespeichert.")).toBeVisible();
    await expect(p.row(id)).toContainText("inaktiv");
    expect((await fundusCatalog(chat.page.request)).documents.some((d) => d.id === id)).toBe(false);

    await p.row(id).getByRole("switch", { name: "„Plan neu“ aktiv" }).click();
    await expect(p.row(id)).not.toContainText("inaktiv");
    await guestFundus(chat, "Dokumente");
    await fundusDialog(chat.page).getByRole("searchbox", { name: "Fundus durchsuchen" }).fill("parkraum");
    await docList(chat.page).locator(`[data-id="${id}"]`).click();
    const preview = fundusDialog(chat.page).getByRole("region", { name: "Vorschau" });
    await expect(preview.getByRole("heading", { name: "Plan neu" })).toBeVisible();
    await expect(preview).toContainText("31.01.2026");
    await expect(preview).toContainText("Mit Widersprüchen");
    const after = (await fundusCatalog(chat.page.request)).documents.find((d) => d.id === id)!;
    expect(after.sha256).toBe(before.sha256);
    expect(after.fileName).toBe("Plan.docx");
    expect(after.tags).toContain("kurz");

    // Herunterladen im Admin: die unveränderte Datei.
    const download = page.waitForEvent("download");
    await p.row(id).getByRole("link", { name: "„Plan neu“ herunterladen" }).click();
    expect((await download).suggestedFilename()).toBe("Plan.docx");

    // Verlauf: Angaben ändern und abschalten – seine Anhänge verschwinden mit ihm.
    const thread = await admin.addThread([{ name: "verlauf-3.eml", data: fx("verlauf-3.eml") }], { title: "Verlauf alt" });
    const attachment = (await admin.fundus()).documents.find((d) => d.threadId === thread.id)!;
    const meta = { id: thread.id, title: "Verlauf neu", summary: "Geänderte Angaben", date: "2026-10-01", tags: ["unstrukturiert"], keywords: ["Dienstplan"] };
    await admin.json("PUT", "/api/admin/fundus/threads", { ...meta, enabled: false });
    let catalog = await fundusCatalog(chat.page.request);
    expect(catalog.threads.some((t) => t.id === thread.id)).toBe(false);
    expect(catalog.documents.some((d) => d.id === attachment.id)).toBe(false);
    await admin.json("PUT", "/api/admin/fundus/threads", { ...meta, enabled: true });
    catalog = await fundusCatalog(chat.page.request);
    expect(catalog.threads.find((t) => t.id === thread.id)).toMatchObject({ title: "Verlauf neu", summary: "Geänderte Angaben", keywords: ["Dienstplan"] });
    expect(catalog.documents.some((d) => d.id === attachment.id)).toBe(true);
  });

  test("FP09 Eigene Einträge löschen: Rückfrage nennt die Anhänge; Datei und Zeilen weg; Anhang einzeln 409; Prompts bleiben", async ({ page, admin, browser, baseURL, ip }) => {
    const [docId] = await admin.addDocuments([{ name: "Weg.docx", data: uniqueDocx("Weg.docx", "Weg").buffer, meta: { title: "Weg damit" } }]);
    const thread = await admin.addThread([{ name: "verlauf-3.eml", data: fx("verlauf-3.eml") }], { title: "Dienstplan-Verlauf" });
    const prompts = (await admin.fundus()).prompts.length;
    const attachment = (await admin.fundus()).documents.find((d) => d.threadId === thread.id)!;
    const blocked = await admin.api.delete(`/api/admin/fundus/documents?id=${attachment.id}`);
    expect(blocked.status()).toBe(409);
    expect((await blocked.json()).error).toBe("Dieses Dokument ist ein Anhang eines E-Mail-Verlaufs und geht nur zusammen mit dem Verlauf.");
    const chat = await openChat(browser, baseURL!, guestIp(ip));
    expect((await chat.page.request.get(`/api/library/${docId}/file`)).status()).toBe(200);

    const p = await FundusAdminPage.open(page);
    const dialogs: string[] = [];
    page.on("dialog", (d) => {
      dialogs.push(d.message());
      void d.accept();
    });
    await p.row(docId).getByRole("button", { name: "„Weg damit“ löschen" }).click();
    await expect(page.getByText("„Weg damit“ gelöscht.")).toBeVisible();
    await p.sub("E-Mail-Verläufe").click();
    await p.row(thread.id).getByRole("button", { name: "„Dienstplan-Verlauf“ löschen" }).click();
    await expect(page.getByText("„Dienstplan-Verlauf“ gelöscht.")).toBeVisible();
    expect(dialogs).toEqual(["Dokument „Weg damit“ endgültig löschen? Die Datei wird entfernt.", "Verlauf „Dienstplan-Verlauf“ mit 1 E-Mail und 1 Anhang-Dokument endgültig löschen?"]);

    const data = await admin.fundus();
    expect(data.documents.filter((d) => d.source === "eigen")).toEqual([]);
    expect(data.threads.filter((t) => t.source === "eigen")).toEqual([]);
    expect(data.prompts).toHaveLength(prompts);
    for (const id of [docId, attachment.id]) expect((await chat.page.request.get(`/api/library/${id}/file`)).status()).toBe(404);
  });

  test("FP10 Mitgelieferte ausblenden: einzeln aus- und einblenden, „Alle einblenden“; im Chat und beim Anhängen weg", async ({ page, admin, browser, baseURL, ip }) => {
    const chat = await openChat(browser, baseURL!, guestIp(ip));
    const p = await FundusAdminPage.open(page);
    const row = p.row(BUILT_IN.word);
    await expect(row.getByRole("button", { name: /bearbeiten$/ })).toHaveCount(0);
    await expect(row.getByRole("button", { name: /löschen$/ })).toHaveCount(0);
    await row.getByRole("button", { name: /ausblenden$/ }).click();
    await expect(row).toContainText("ausgeblendet");
    // Die Vorschau gibt es im Admin auch für ausgeblendete Einträge.
    await row.getByRole("button", { name: /^Vorschau/ }).click();
    const preview = page.getByRole("dialog", { name: /^Vorschau:/ });
    await expect(preview.getByTestId("vorschau-word")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(preview).toBeHidden();
    await p.sub("E-Mail-Verläufe").click();
    await p.row(BUILT_IN.thread).getByRole("button", { name: /ausblenden$/ }).click();
    await expect(p.row(BUILT_IN.thread)).toContainText("ausgeblendet");

    const catalog = await fundusCatalog(chat.page.request);
    expect(catalog.documents.some((d) => d.id === BUILT_IN.word)).toBe(false);
    expect(catalog.threads.some((t) => t.id === BUILT_IN.thread)).toBe(false);
    expect((await chat.page.request.post("/api/library/attach", { data: { id: BUILT_IN.word } })).status()).toBe(404);
    expect((await chat.page.request.get(`/api/library/${BUILT_IN.word}`)).status()).toBe(404);

    await p.sub("E-Mail-Verläufe").click();
    await p.row(BUILT_IN.thread).getByRole("button", { name: /einblenden$/ }).click();
    await expect(p.row(BUILT_IN.thread)).not.toContainText("ausgeblendet");
    await p.sub("Dokumente").click();
    await page.getByRole("button", { name: /^Alle einblenden/ }).click();
    await expect(page.getByText("Alle mitgelieferten Einträge sind wieder eingeblendet.")).toBeVisible();
    await expect(row).not.toContainText("ausgeblendet");
    await expect(page.getByRole("button", { name: /^Alle einblenden/ })).toHaveCount(0);
    expect((await fundusCatalog(chat.page.request)).documents.some((d) => d.id === BUILT_IN.word)).toBe(true);
    // Mitgelieferte Einträge lassen sich nicht über die API ändern oder löschen.
    expect((await admin.api.delete(`/api/admin/fundus/documents?id=${BUILT_IN.word}`)).status()).toBe(404);
    expect((await admin.api.put("/api/admin/fundus/documents", { data: { id: BUILT_IN.word, title: "x", date: "2026-10-14" } })).status()).toBe(404);
  });

  test("FP11 Kategorien: anlegen, umbenennen, nach oben/unten (Maus und Tastatur); Dubletten, leer, zu lang; Löschen nur leer", async ({ page, admin }) => {
    const p = await FundusAdminPage.open(page, "Kategorien");
    const input = page.getByLabel("Name der neuen Kategorie");
    const create = page.getByRole("button", { name: "Kategorie anlegen" });
    await expect(create).toBeDisabled();
    await input.fill("Präsentieren");
    await create.click();
    await expect(page.getByText("Kategorie „Präsentieren“ angelegt.")).toBeVisible();
    for (const [name, error] of [
      ["präsentieren ", "Die Kategorie „Präsentieren“ gibt es schon."],
      ["Einfache sprache", "Die Kategorie „Einfache Sprache“ gibt es schon."],
      ["Einfache  Sprache ", "gibt es schon"],
      ["x".repeat(41), "höchstens 40 Zeichen"],
    ]) {
      await input.fill(name);
      await create.click();
      await expect(page.getByRole("alert").filter({ hasText: error })).toBeVisible();
      await expect(input).toHaveAttribute("aria-invalid", "true");
    }
    const id = (await admin.fundus()).categories.find((c) => c.name === "Präsentieren")!.id;
    const names = () => p.categories.getByRole("listitem").locator("p.font-medium").allInnerTexts();
    expect((await names()).at(-1)).toBe("Präsentieren");
    await p.row(id).getByRole("button", { name: "„Präsentieren“ nach oben" }).click();
    await expect.poll(async () => (await names()).at(-2)).toBe("Präsentieren");
    await p.row(id).getByRole("button", { name: "„Präsentieren“ nach oben" }).focus();
    await page.keyboard.press("Enter");
    await expect.poll(async () => (await names()).at(-3)).toBe("Präsentieren");
    await p.row(id).getByRole("button", { name: "„Präsentieren“ nach unten" }).click();
    await expect.poll(async () => (await names()).at(-2)).toBe("Präsentieren");
    // Erste nicht nach oben, letzte nicht nach unten.
    await expect(p.categories.getByRole("listitem").first().getByRole("button", { name: /nach oben$/ })).toBeDisabled();
    await expect(p.categories.getByRole("listitem").last().getByRole("button", { name: /nach unten$/ })).toBeDisabled();

    await p.row(id).getByRole("button", { name: "„Präsentieren“ umbenennen" }).click();
    await page.getByLabel("Neuer Name für „Präsentieren“").fill("Präsentationen");
    await page.getByRole("button", { name: "Namen speichern" }).click();
    await expect(p.row(id)).toContainText("Präsentationen");

    const schreiben = (await admin.fundus()).categories.find((c) => c.id === "kat-schreiben")!;
    await p.row("kat-schreiben").getByRole("button", { name: "„Schreiben“ löschen" }).click();
    await expect(page.getByRole("alert").filter({ hasText: `„Schreiben“ enthält noch ${schreiben.prompts} Prompts – bitte zuerst verschieben oder löschen.` })).toBeVisible();
    page.once("dialog", (d) => void d.accept());
    await p.row(id).getByRole("button", { name: "„Präsentationen“ löschen" }).click();
    await expect(p.row(id)).toHaveCount(0);
  });

  test("FP12 Prompt anlegen: Kategorie im Dialog, Platzhalter-Tabelle beim Tippen, Einstellungen je Platzhalter, Probe-Maske; danach im Chat", async ({ page, browser, baseURL, ip }) => {
    const p = await FundusAdminPage.open(page, "Prompts");
    await page.getByRole("button", { name: "Neuer Prompt" }).click();
    const d = p.promptDialog;
    const title = `Elternbrief ${uniq()}`;
    await d.getByLabel("Titel").fill(title);
    await d.getByLabel("Kategorie", { exact: true }).selectOption({ label: "Neue Kategorie …" });
    await d.getByLabel("Name der neuen Kategorie").fill("Elternarbeit");
    await d.getByRole("button", { name: "Anlegen" }).click();
    await expect(d.getByLabel("Kategorie", { exact: true })).toHaveValue(/^kat-elternarbeit-/);
    await d.getByLabel("Kurzbeschreibung").fill("Brief an die Eltern einer Kita.");
    await expect(d.getByText("Ohne Platzhalter – der Text wird ohne Maske direkt ins Eingabefeld eingefügt.")).toBeVisible();
    await d.getByLabel("Prompt-Text").fill("Schreibe einen Brief an {{Zielgruppe}} im Ton {{Ton}}. Grüße an {{zielgruppe}}.");
    const ziel = d.getByRole("group", { name: /Zielgruppe/ });
    const ton = d.getByRole("group", { name: /Ton/ });
    await expect(ziel).toContainText("kommt 2× vor");
    await expect(d.locator("fieldset[data-platzhalter]")).toHaveCount(2);
    // Keine Einstellung „Pflicht“ – jedes Feld muss ausgefüllt werden.
    await expect(d.getByRole("checkbox", { name: /Pflicht/ })).toHaveCount(0);
    await ziel.getByLabel("Beschriftung").fill("An wen?");
    await ziel.getByLabel("Hinweis").fill("z. B. die Eltern der Gruppe Igel");
    await ton.getByLabel("Art").selectOption("select");
    await ton.getByLabel("Auswahlwerte").fill("freundlich\nsachlich\nherzlich");
    await ton.getByLabel("Standardwert").selectOption("freundlich");

    await d.getByRole("button", { name: "So sieht es im Chat aus" }).click();
    const mask = new PromptMask(page);
    await expect(mask.dialog).toBeVisible();
    await expect(mask.field("An wen?")).toHaveAttribute("placeholder", "z. B. die Eltern der Gruppe Igel");
    await expect(mask.field("Ton")).toHaveValue("freundlich");
    await mask.field("An wen?").fill("die Eltern");
    await mask.button("Einfügen").click();
    await expect(d.getByRole("region", { name: "Ergebnis der Probe" })).toContainText("Schreibe einen Brief an die Eltern im Ton freundlich. Grüße an die Eltern.");
    await d.getByRole("button", { name: "Speichern" }).click();
    await expect(d).toBeHidden();
    await expect(page.getByText(`Prompt „${title}“ angelegt.`)).toBeVisible();

    const chat = await openChat(browser, baseURL!, guestIp(ip));
    const catalog = await fundusCatalog(chat.page.request);
    const created = catalog.prompts.find((x) => x.title === title)!;
    expect(catalog.categories.find((c) => c.id === created.categoryId)?.name).toBe("Elternarbeit");
    const tab = new PromptsTab(chat.page);
    await tab.open();
    await expect(tab.list.getByRole("group", { name: "Elternarbeit" })).toBeVisible();
    await tab.choose(created.id);
    // Doppelter Platzhalter: ein Feld, zweimal eingesetzt.
    const guestMask = new PromptMask(chat.page);
    await expect(guestMask.dialog.locator("label")).toHaveText(["An wen?", "Ton"]);
    await guestMask.field("An wen?").fill("die Igel-Eltern");
    await guestMask.button("Einfügen").click();
    await expect(chat.composer).toHaveValue("Schreibe einen Brief an die Igel-Eltern im Ton freundlich. Grüße an die Igel-Eltern.");
  });

  test("FP13 Prompt-Prüfungen: Pflichtangaben, Länge, ungültige Namen, offene Klammern, 21 Platzhalter, Auswahlwerte; Einstellung bleibt bis zum Speichern", async ({ page, admin }) => {
    const p = await FundusAdminPage.open(page, "Prompts");
    await page.getByRole("button", { name: "Neuer Prompt" }).click();
    const d = p.promptDialog;
    const errors = d.getByRole("listitem").filter({ hasText: /:|Höchstens/ });
    await d.getByRole("button", { name: "Speichern" }).click();
    await expect(d.getByText("Titel: darf nicht leer sein")).toBeVisible();
    await expect(d.getByText("Prompt-Text: darf nicht leer sein")).toBeVisible();
    await expect(d.getByLabel("Titel")).toHaveAttribute("aria-invalid", "true");
    await d.getByLabel("Titel").fill("Prüfung");

    await d.getByLabel("Prompt-Text").fill("x".repeat(8001));
    await expect(d.getByText("Prompt-Text: höchstens 8.000 Zeichen")).toBeVisible();
    await expect(d.getByText("8.001 / 8.000 Zeichen")).toBeVisible();
    await d.getByLabel("Prompt-Text").fill("Hallo {{ungültig!}} und {{offen\nZeile zwei");
    const warnings = d.getByRole("list", { name: "Hinweise zum Text" });
    await expect(warnings).toContainText("„{{ungültig!}}“ ist kein gültiger Platzhalter (Zeile 1)");
    await expect(warnings).toContainText("Ein „{{“ hat kein schließendes „}}“ – bitte prüfen.");
    await d.getByLabel("Prompt-Text").fill(Array.from({ length: 21 }, (_, i) => `{{P${i}}}`).join(" "));
    await expect(d.getByText("Höchstens 20 Platzhalter – im Text stehen 21.")).toBeVisible();

    await d.getByLabel("Prompt-Text").fill("Für {{Zielgruppe}} in {{Anzahl}} Punkten.");
    const anzahl = d.getByRole("group", { name: /Anzahl/ });
    await anzahl.getByLabel("Art").selectOption("select");
    await expect(d.getByText("Platzhalter „Anzahl“: eine Auswahl braucht mindestens 2 Werte")).toBeVisible();
    await anzahl.getByLabel("Auswahlwerte").fill(Array.from({ length: 21 }, (_, i) => `${i}`).join("\n"));
    await expect(d.getByText("Platzhalter „Anzahl“: höchstens 20 Auswahlwerte")).toBeVisible();
    await anzahl.getByLabel("Auswahlwerte").fill("3\n5");
    await anzahl.getByLabel("Standardwert").selectOption("5");
    await anzahl.getByLabel("Auswahlwerte").fill("3\n7");
    await expect(d.getByText("Platzhalter „Anzahl“: der Standardwert muss einer der Auswahlwerte sein")).toBeVisible();
    await anzahl.getByLabel("Auswahlwerte").fill("3\n5");

    // Platzhalter kurz aus dem Text nehmen: die Einstellung bleibt bis zum Speichern.
    await d.getByRole("group", { name: /Zielgruppe/ }).getByLabel("Beschriftung").fill("Für wen?");
    await d.getByLabel("Prompt-Text").fill("In {{Anzahl}} Punkten.");
    await expect(d.getByRole("group", { name: /Zielgruppe/ })).toHaveCount(0);
    await d.getByLabel("Prompt-Text").fill("Für {{Zielgruppe}} in {{Anzahl}} Punkten.");
    await expect(d.getByRole("group", { name: /Zielgruppe/ }).getByLabel("Beschriftung")).toHaveValue("Für wen?");
    await expect(errors).toHaveCount(0);
    await d.getByRole("button", { name: "Speichern" }).click();
    await expect(d).toBeHidden();
    const saved = (await admin.fundus()).prompts.find((x) => x.title === "Prüfung")!;
    expect(saved.placeholders).toEqual({ zielgruppe: { label: "Für wen?" }, anzahl: { type: "select", options: ["3", "5"], default: "5" } });

    // Die API prüft genauso (deutsche Meldungen).
    const bad = async (body: Record<string, unknown>, message: string | RegExp) => {
      const res = await admin.api.post("/api/admin/fundus/prompts", { data: { title: "x", categoryId: "kat-schreiben", text: "x", ...body } });
      expect(res.status()).toBe(400);
      expect((await res.json()).error).toMatch(message);
    };
    await bad({ categoryId: "kat-gibt-es-nicht" }, "Kategorie: bitte eine vorhandene Kategorie wählen.");
    await bad({ title: " " }, "Titel: darf nicht leer sein");
    await bad({ text: "{{A}}", placeholders: { a: { type: "select", options: ["nur"] } } }, /mindestens 2 Werte/);
    // Eine Einstellung „Pflicht“ gibt es nicht – jeder Platzhalter muss ausgefüllt werden.
    await bad({ text: "{{A}}", placeholders: { a: { pflicht: false } } }, "Unbekanntes Feld: pflicht");
  });

  test("FP14 Prompts ordnen und pflegen: nach oben/unten, Kategorie wechseln, deaktivieren, Start-Prompt bearbeiten, löschen mit Rückfrage", async ({ page, admin, browser, baseURL, ip }) => {
    const cat = await admin.createCategory(`Reihenfolge ${uniq()}`);
    const a = await admin.createPrompt({ title: "Erster", categoryId: cat, text: "Eins" });
    const b = await admin.createPrompt({ title: "Zweiter", categoryId: cat, text: "Zwei" });
    const p = await FundusAdminPage.open(page, "Prompts");
    const order = () => page.locator(`section[aria-label^="Kategorie Reihenfolge"] li[data-id]`).evaluateAll((els) => els.map((e) => e.getAttribute("data-id")));
    expect(await order()).toEqual([a, b]);
    await expect(p.row(a).getByRole("button", { name: "„Erster“ nach oben" })).toBeDisabled();
    await p.row(b).getByRole("button", { name: "„Zweiter“ nach oben" }).click();
    await expect.poll(order).toEqual([b, a]);
    await p.row(b).getByRole("button", { name: "„Zweiter“ nach unten" }).click();
    await expect.poll(order).toEqual([a, b]);

    // Kategorie wechseln: landet am Ende der neuen Kategorie.
    await p.row(a).getByRole("button", { name: "„Erster“ bearbeiten" }).click();
    await p.promptDialog.getByLabel("Kategorie", { exact: true }).selectOption("kat-recherche");
    await p.promptDialog.getByRole("button", { name: "Speichern" }).click();
    await expect(p.promptDialog).toBeHidden();
    const recherche = (await admin.fundus()).prompts.filter((x) => x.categoryId === "kat-recherche");
    expect(recherche.at(-1)!.id).toBe(a);

    // Deaktivieren: im Chat weg.
    await p.row(b).getByRole("switch", { name: "„Zweiter“ aktiv" }).click();
    await expect(p.row(b)).toContainText("inaktiv");
    const chat = await openChat(browser, baseURL!, guestIp(ip));
    const catalog = await fundusCatalog(chat.page.request);
    expect(catalog.prompts.some((x) => x.id === b)).toBe(false);
    expect(catalog.categories.some((c) => c.id === cat)).toBe(false);

    // Start-Prompts sind frei bearbeitbar.
    await p.row("prompt-absage").getByRole("button", { name: "„Absage höflich formulieren“ bearbeiten" }).click();
    await p.promptDialog.getByLabel("Kurzbeschreibung").fill("Angepasst für den Kurs.");
    await p.promptDialog.getByRole("button", { name: "Speichern" }).click();
    await expect(p.row("prompt-absage")).toContainText("Angepasst für den Kurs.");

    const dialogs: string[] = [];
    page.once("dialog", (d) => {
      dialogs.push(d.message());
      void d.dismiss();
    });
    await p.row(b).getByRole("button", { name: "„Zweiter“ löschen" }).click();
    expect(dialogs).toEqual(["Prompt „Zweiter“ löschen?"]);
    await expect(p.row(b)).toBeVisible();
    page.once("dialog", (d) => void d.accept());
    await p.row(b).getByRole("button", { name: "„Zweiter“ löschen" }).click();
    await expect(page.getByText("Prompt „Zweiter“ gelöscht.")).toBeVisible();
    await expect(p.row(b)).toHaveCount(0);
  });

  test("FP15/FP17 Startbestand und Speicher: frisch 12 Prompts in 6 Kategorien; gelöscht bleibt gelöscht; eigene Dateien überstehen Neustart und Aufräumjob", async ({ ip }) => {
    test.slow();
    let server = await startServer(false);
    try {
      let admin = await AdminApi.create(RESTART_URL, ipFor(`${ip}-neustart`));
      let data = await admin.fundus();
      expect(data.prompts).toHaveLength(12);
      expect(data.categories.map((c) => c.name)).toEqual(["Schreiben", "Zusammenfassen", "Einfache Sprache", "Auswerten", "Recherche", "Prompten lernen"]);
      const [own] = await admin.addDocuments([{ name: "Bleibt.pdf", data: fx("bericht.pdf"), meta: { title: "Bleibt" } }]);
      for (const p of data.prompts) await admin.deleteFundus("prompts", p.id);
      for (const c of data.categories) await admin.deleteFundus("categories", c.id);
      await admin.api.dispose();

      await stopServer(server);
      server = await startServer(true);
      admin = await AdminApi.create(RESTART_URL, ipFor(`${ip}-neustart-2`));
      data = await admin.fundus();
      expect(data.prompts).toEqual([]);
      expect(data.categories).toEqual([]);
      expect(data.documents.find((d) => d.id === own)?.title).toBe("Bleibt");

      // Aufräumjob: eigene Datei und Text bleiben.
      const cron = await playwrightRequest.newContext({ baseURL: RESTART_URL });
      expect((await cron.get("/api/cron/cleanup", { headers: { authorization: `Bearer ${CRON_SECRET}` } })).status()).toBe(200);
      const file = await admin.api.get(`/api/admin/fundus/file?id=${own}`);
      expect(file.status()).toBe(200);
      expect(Buffer.from(await file.body()).equals(fx("bericht.pdf"))).toBe(true);

      // Gäste kommen weder über /api/files noch über die Upload-Wege an fundus/.
      const guest = await playwrightRequest.newContext({ baseURL: RESTART_URL, extraHTTPHeaders: { "x-forwarded-for": ipFor(`${ip}-neustart-gast`) } });
      expect((await guest.post("/api/auth/login", { data: await createGuest(RESTART_URL) })).status()).toBe(200);
      const preview = await admin.json<{ type: string }>("GET", `/api/admin/fundus/preview?id=${own}`);
      expect(preview.type).toBe("text");
      const key = await admin.uploadFundusFile("geheim.pdf", fx("bericht.pdf"));
      expect((await guest.get(`/api/files/${key}`)).status()).toBe(400);
      expect((await guest.post("/api/files/process", { data: { key, name: "geheim.pdf" } })).status()).toBe(400);
      expect((await guest.post("/api/upload/local", { multipart: { key, file: { name: "x.pdf", mimeType: "application/pdf", buffer: fx("bericht.pdf") } } })).status()).toBe(400);
      expect((await guest.post("/api/admin/fundus/local", { multipart: { key, file: { name: "x.pdf", mimeType: "application/pdf", buffer: fx("bericht.pdf") } } })).status()).toBe(403);
      expect((await guest.post("/api/library/attach", { data: { id: own } })).status()).toBe(200);
      await Promise.all([admin.api.dispose(), cron.dispose(), guest.dispose()]);
    } finally {
      await stopServer(server);
      rmSync(path.resolve(".data/e2e/fundus-neustart"), { recursive: true, force: true });
    }
  });

  test("FP16 Admin-API des Fundus: 401, 403, 400 mit deutscher Meldung, 404, 409, 413, 422; während der Pause geht die Pflege", async ({ baseURL, ip, admin }) => {
    const routes: [string, string][] = [
      ["GET", "/api/admin/fundus"],
      ["POST", "/api/admin/fundus/token"],
      ["POST", "/api/admin/fundus/local"],
      ["POST", "/api/admin/fundus/check"],
      ["POST", "/api/admin/fundus/documents"],
      ["PUT", "/api/admin/fundus/documents"],
      ["DELETE", "/api/admin/fundus/documents?id=x"],
      ["POST", "/api/admin/fundus/threads"],
      ["PUT", "/api/admin/fundus/threads"],
      ["DELETE", "/api/admin/fundus/threads?id=x"],
      ["POST", "/api/admin/fundus/prompts"],
      ["PUT", "/api/admin/fundus/prompts"],
      ["PATCH", "/api/admin/fundus/prompts"],
      ["DELETE", "/api/admin/fundus/prompts?id=x"],
      ["POST", "/api/admin/fundus/categories"],
      ["PUT", "/api/admin/fundus/categories"],
      ["DELETE", "/api/admin/fundus/categories?id=x"],
      ["PUT", "/api/admin/fundus/hidden"],
      ["GET", "/api/admin/fundus/preview?id=x"],
      ["GET", "/api/admin/fundus/file?id=x"],
    ];
    const anon = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ipFor(`${ip}-anon`) } });
    const guest = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ipFor(`${ip}-guest`) } });
    expect((await guest.post("/api/auth/login", { data: await createGuest(baseURL!) })).status()).toBe(200);
    for (const [method, url] of routes) {
      expect((await anon.fetch(url, { method, data: {} })).status(), `${method} ${url}`).toBe(401);
      const res = await guest.fetch(url, { method, data: {} });
      expect(res.status(), `${method} ${url}`).toBe(403);
      expect((await res.json()).error).toBe("Dieser Bereich ist nur für die Kursleitung.");
    }
    // Fremde Seite.
    const foreign = await admin.api.post("/api/admin/fundus/categories", { data: { name: "Fremd" }, headers: { origin: "https://boese.example" } });
    expect(foreign.status()).toBe(403);

    const error = async (res: Awaited<ReturnType<APIRequestContext["fetch"]>>, status: number, message: string | RegExp) => {
      const text = await res.text();
      expect(res.status(), text).toBe(status);
      expect((JSON.parse(text) as { error: string }).error).toMatch(message);
    };
    const api = admin.api;
    await error(await api.post("/api/admin/fundus/categories", { data: { name: "x".repeat(41) } }), 400, /höchstens 40 Zeichen/);
    await error(await api.put("/api/admin/fundus/documents", { data: { id: "eigen-x", title: "x".repeat(121), date: "2026-10-14" } }), 400, /Titel/);
    await error(await api.put("/api/admin/fundus/documents", { data: { id: "eigen-x", title: "x", date: "2026-02-30" } }), 400, /Datum/);
    await error(await api.delete("/api/admin/fundus/documents"), 400, "ID fehlt.");
    await error(await api.post("/api/admin/fundus/check", { data: { kind: "documents", files: [{ key: "uploads/0f8fad5b-d9cb-469f-a165-70867728950e/x.docx", name: "x.docx" }] } }), 400, /Dateipfad/);
    const unchecked = await admin.json<{ saved: string[]; failed: { error: string }[] }>("POST", "/api/admin/fundus/documents", {
      confirmed: true,
      files: [{ key: "fundus/0f8fad5b-d9cb-469f-a165-70867728950e/nie-hochgeladen.docx", name: "nie-hochgeladen.docx", title: "x", date: "2026-10-14" }],
    });
    expect(unchecked.saved).toEqual([]);
    expect(unchecked.failed[0].error).toBe("Die hochgeladene Datei wurde nicht gefunden. Bitte erneut hochladen.");
    await error(await api.put("/api/admin/fundus/documents", { data: { id: "eigen-gibt-es-nicht", title: "x", date: "2026-10-14" } }), 404, "Dokument nicht gefunden.");
    await error(await api.put("/api/admin/fundus/hidden", { data: { id: "eigen-gibt-es-nicht", hidden: true } }), 404, "Nur mitgelieferte Dokumente und Verläufe lassen sich ausblenden.");
    await error(await api.delete("/api/admin/fundus/prompts?id=prompt-gibt-es-nicht"), 404, "Prompt nicht gefunden.");
    await error(await api.delete("/api/admin/fundus/categories?id=kat-schreiben"), 409, /enthält noch \d+ Prompts/);
    const big = await api.post("/api/admin/fundus/local", {
      multipart: { key: "fundus/0f8fad5b-d9cb-469f-a165-70867728950e/gross.pdf", file: { name: "gross.pdf", mimeType: "application/pdf", buffer: Buffer.alloc(50 * 1024 * 1024 + 1) } },
    });
    await error(big, 413, "Die Datei ist zu groß.");
    // Ein vorhandener Pfad wird nie überschrieben (auch keine gespeicherte Fundus-Datei).
    const taken = await admin.uploadFundusFile("vorhanden.docx", docxWith(["Vorhanden"]));
    await error(await api.post("/api/admin/fundus/local", { multipart: { key: taken, file: { name: "vorhanden.docx", mimeType: "application/octet-stream", buffer: docxWith(["Neu"]) } } }), 409, /gibt es schon/);
    const key = await admin.uploadFundusFile("leer.docx", docxWith([]));
    const empty = await admin.json<{ failed: { error: string }[] }>("POST", "/api/admin/fundus/documents", { confirmed: true, files: [{ key, name: "leer.docx", title: "x", date: "2026-10-14" }] });
    expect(empty.failed[0].error).toMatch(/lesbare/);
    const broken = await admin.uploadFundusFile("kaputt.eml", fx("kaputt.eml"));
    await error(await api.post("/api/admin/fundus/threads", { data: { confirmed: true, files: [{ key: broken, name: "kaputt.eml" }], title: "x" } }), 422, /lesbare/);

    // Pause (Not-Aus): die Pflege geht weiter.
    await admin.updateSettings({ paused: true });
    expect((await api.get("/api/admin/fundus")).status()).toBe(200);
    const cat = await admin.createCategory(`Pause ${uniq()}`);
    await admin.deleteFundus("categories", cat);
    await Promise.all([anon.dispose(), guest.dispose()]);
  });

  test("FP18 Grenzen: 50 Kategorien, 500 Prompts, 20 Platzhalter, 20 Dateien je Upload – verständliche Meldungen, nichts halb angelegt", async ({ page, admin }) => {
    test.slow();
    const data = await admin.fundus();
    const extra = [];
    for (let i = data.categories.length; i < 50; i++) extra.push(await admin.createCategory(`Grenze ${i} ${uniq()}`));
    const res = await admin.api.post("/api/admin/fundus/categories", { data: { name: "Eine zu viel" } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Höchstens 50 Kategorien.");
    expect((await admin.fundus()).categories).toHaveLength(50);
    for (const id of extra) await admin.deleteFundus("categories", id);

    const missing = 500 - data.prompts.length;
    for (let i = 0; i < missing; i += 20) {
      await Promise.all(
        Array.from({ length: Math.min(20, missing - i) }, (_, j) => admin.createPrompt({ title: `Füllung ${i + j}`, categoryId: "kat-recherche", text: "x", enabled: false })),
      );
    }
    const tooMany = await admin.api.post("/api/admin/fundus/prompts", { data: { title: "zu viel", categoryId: "kat-recherche", text: "x" } });
    expect(tooMany.status()).toBe(400);
    expect((await tooMany.json()).error).toBe("Höchstens 500 Prompts.");
    expect((await admin.fundus()).prompts).toHaveLength(500);

    const p = await FundusAdminPage.open(page, "Prompts");
    await page.getByRole("button", { name: "Neuer Prompt" }).first().click();
    await p.promptDialog.getByLabel("Prompt-Text").fill(Array.from({ length: 21 }, (_, i) => `{{Feld ${i}}}`).join(" "));
    await expect(p.promptDialog.getByText("Höchstens 20 Platzhalter – im Text stehen 21.")).toBeVisible();
    await expect(p.promptDialog.getByRole("button", { name: "So sieht es im Chat aus" })).toBeDisabled();
    await p.promptDialog.getByRole("button", { name: "Abbrechen" }).click();

    await p.sub("Dokumente").click();
    await p.uploadDocuments(Array.from({ length: 21 }, (_, i) => uniqueDocx(`datei-${i}.docx`, `Datei ${i}`)));
    await expect(p.uploadDialog.getByText("Höchstens 20 Dateien auf einmal – 1 Datei bleibt weg.")).toBeVisible();
    await expect(p.uploadDialog.locator("li[data-datei]")).toHaveCount(20);
    await p.uploadDialog.getByRole("button", { name: "Abbrechen" }).click();
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`FP19 Barrierefreiheit (${scheme === "light" ? "hell" : "dunkel"}): Reiter, Upload-, Verlauf-, Prompt- und Kategorien-Dialog; Fehler am Feld; Fokus kehrt zurück`, async ({ page }, testInfo) => {
      test.slow();
      await page.emulateMedia({ colorScheme: scheme });
      const p = await FundusAdminPage.open(page);
      await expectAccessible(page, testInfo, `fundus-admin-${scheme}`);
      await p.uploadDocuments([upload("vertrag.docx"), upload("zahlen.xls")]);
      await p.waitChecked();
      await expectAccessible(page, testInfo, `fundus-upload-${scheme}`);
      await p.uploadDialog.getByRole("button", { name: "Abbrechen" }).click();
      await p.sub("E-Mail-Verläufe").click();
      await p.uploadThread([upload("verlauf-1.eml"), upload("verlauf-2.eml")]);
      await expect(p.threadDialog.locator("li[data-mail]")).toHaveCount(2, { timeout: 30_000 });
      await expectAccessible(page, testInfo, `fundus-verlauf-${scheme}`);
      await p.threadDialog.getByRole("button", { name: "Abbrechen" }).click();

      await p.sub("Prompts").click();
      const neu = page.getByRole("button", { name: "Neuer Prompt" });
      await neu.click();
      await p.promptDialog.getByLabel("Prompt-Text").fill("Für {{Zielgruppe}}");
      // Platzhalter-Tabelle per Tastatur: vom Text aus mit Tab in die Felder.
      await p.promptDialog.getByLabel("Prompt-Text").focus();
      await page.keyboard.press("Tab");
      await expect(p.promptDialog.getByRole("group", { name: /Zielgruppe/ }).getByLabel("Beschriftung")).toBeFocused();
      await p.promptDialog.getByRole("button", { name: "Speichern" }).click();
      const title = p.promptDialog.getByLabel("Titel");
      await expect(title).toHaveAttribute("aria-invalid", "true");
      const describedBy = await title.getAttribute("aria-describedby");
      await expect(page.locator(`[id="${describedBy}"]`)).toContainText("Titel: darf nicht leer sein");
      await expectAccessible(page, testInfo, `fundus-prompt-${scheme}`);
      await page.keyboard.press("Escape");
      await expect(p.promptDialog).toBeHidden();
      await expect(neu).toBeFocused();

      await p.sub("Kategorien").click();
      await expectAccessible(page, testInfo, `fundus-kategorien-${scheme}`);
    });
  }
});

// ---------------------------------------------------------------- Y · eigene Inhalte im Chat

test.describe("Y · Eigene Inhalte im Chat", () => {
  test("Y22 Eigene Dokumente: Zahl, „Eigene Inhalte“, Typ „PDF“, Merkmale, Vorschau, Download byte-gleich, Anhängen mit Inhalt fürs Modell", async ({ admin, browser, baseURL, ip }) => {
    const id = uniq();
    const [pdfId, xlsxId, pptxId] = await admin.addDocuments([
      { name: "bericht.pdf", data: fx("bericht.pdf"), meta: { title: `Bericht ${id}`, tags: ["zahlen"], keywords: [`Stichwort${id}`] } },
      { name: "zahlen.xlsx", data: fx("zahlen.xlsx"), meta: { title: `Zahlen ${id}` } },
      { name: "folien.pptx", data: fx("folien.pptx"), meta: { title: `Folien ${id}` } },
    ]);
    const chat = await openChat(browser, baseURL!, guestIp(ip));
    const catalog = await fundusCatalog(chat.page.request);
    await guestFundus(chat, "Dokumente");
    const dialog = fundusDialog(chat.page);
    await expect(dialog.getByRole("tab", { name: /^Dokumente/ })).toHaveText(`Dokumente (${catalog.documents.length})`);
    await dialog.getByRole("combobox", { name: "Verwaltung" }).selectOption({ label: "Eigene Inhalte" });
    await expect(dialog.getByRole("combobox", { name: "Organisationseinheit" })).toBeDisabled();
    await expect(docList(chat.page).getByRole("option")).toHaveCount(3);
    await dialog.getByRole("group", { name: "Merkmale" }).getByRole("button", { name: "Mit Zahlen" }).click();
    await expect(docList(chat.page).getByRole("option")).toHaveCount(1);
    await dialog.getByRole("button", { name: "Filter zurücksetzen" }).click();
    await dialog.getByRole("searchbox", { name: "Fundus durchsuchen" }).fill(`stichwort${id}`);
    await expect(docList(chat.page).getByRole("option")).toHaveCount(1);

    const preview = dialog.getByRole("region", { name: "Vorschau" });
    await docList(chat.page).locator(`[data-id="${pdfId}"]`).click();
    await expect(preview).toContainText("Eigene Inhalte");
    await expect(preview).toContainText("Kursleitung");
    await expect(preview.getByTestId("vorschau-pdf")).toContainText("Fazit Seite zwei");
    const download = chat.page.waitForEvent("download");
    await preview.getByRole("link", { name: "Herunterladen" }).click();
    const file = Buffer.concat(await (await (await download).createReadStream()).toArray());
    expect(file.equals(fx("bericht.pdf"))).toBe(true);
    await dialog.getByRole("searchbox", { name: "Fundus durchsuchen" }).fill("");
    for (const [docId, testId] of [[xlsxId, "vorschau-excel"], [pptxId, "vorschau-powerpoint"]]) {
      await docList(chat.page).locator(`[data-id="${docId}"]`).click();
      await expect(preview.getByTestId(testId)).toBeVisible();
    }
    await docList(chat.page).locator(`[data-id="${pdfId}"]`).click();
    await preview.getByRole("button", { name: "Anhängen", exact: true }).click();
    await expectReady(chat.page, "bericht.pdf", "Fundus · ca.");
    await expect(await filesSeen(chat)).toContainText("Umsatzbericht Seite eins");
  });

  test("Y23 Eigene Verläufe: nach Datum, einzelne Mail, ganzer Verlauf, „Anhänge mitnehmen“", async ({ admin, browser, baseURL, ip }) => {
    const thread = await admin.addThread(
      [
        { name: "verlauf-2.eml", data: fx("verlauf-2.eml") },
        { name: "verlauf-3.eml", data: fx("verlauf-3.eml") },
        { name: "verlauf-1.eml", data: fx("verlauf-1.eml") },
      ],
      { title: "Öffnungszeiten" },
    );
    const chat = await openChat(browser, baseURL!, guestIp(ip));
    const catalog: FundusCatalog = await fundusCatalog(chat.page.request);
    const t = catalog.threads.find((x) => x.id === thread.id)!;
    expect(t.mails.map((m) => m.subject)).toEqual(["Öffnungszeiten Bürgeramt im Dezember", "AW: Öffnungszeiten Bürgeramt im Dezember", "WG: AW: Öffnungszeiten Bürgeramt im Dezember"]);
    await guestFundus(chat, "E-Mails");
    await threadList(chat.page).locator(`[data-id="${t.id}"]`).click();
    const view = fundusDialog(chat.page).getByRole("region", { name: "Verlauf" });
    await expect(view.getByRole("article")).toHaveCount(3);
    await expect(view.getByRole("article").first()).toContainText("NORDLICHT");
    await view.getByRole("article").nth(1).getByRole("button", { name: "Diese E-Mail anhängen" }).click();
    await expectReady(chat.page, t.mails[1].fileName, "Fundus · ca.");
    await expect(await filesSeen(chat)).toContainText("TANNENZAPFEN");

    await chat.newChat();
    await guestFundus(chat, "E-Mails");
    await threadList(chat.page).locator(`[data-id="${t.id}"]`).click();
    await expect(fundusDialog(chat.page).getByRole("checkbox", { name: "Anhänge mitnehmen" })).toBeChecked();
    await fundusDialog(chat.page).getByRole("button", { name: "Ganzen Verlauf anhängen" }).click();
    await expectReady(chat.page, t.mails[2].fileName, "Fundus · ca.");
    await expectReady(chat.page, "Dienstplan Dezember.docx", "Fundus · ca.");
    const seen = await filesSeen(chat);
    await expect(seen).toContainText("SCHNEEFLOCKE");
    await expect(seen).toContainText("LEBKUCHEN");
  });

  test("Y24 Ausgeblendet, inaktiv, gelöscht: fehlen in Auswahl und API; schon angehängt bleibt nutzbar; gelöscht → nur noch ein Hinweis statt Inhalt", async ({ admin, browser, baseURL, ip }) => {
    const [own] = await admin.addDocuments([{ name: "Bald weg.docx", data: uniqueDocx("x", "Inhalt BALDWEG").buffer, meta: { title: "Bald weg" } }]);
    const chat = await openChat(browser, baseURL!, guestIp(ip));
    await guestFundus(chat, "Dokumente");
    await fundusDialog(chat.page).getByRole("searchbox", { name: "Fundus durchsuchen" }).fill("bald weg");
    await docList(chat.page).locator(`[data-id="${own}"]`).click();
    await fundusDialog(chat.page).getByRole("region", { name: "Vorschau" }).getByRole("button", { name: "Anhängen", exact: true }).click();
    await expectReady(chat.page, "Bald weg.docx", "Fundus · ca.");
    await expect(await filesSeen(chat, "Erste Runde")).toContainText("BALDWEG");

    // Inaktiv und ausgeblendet: weg aus Auswahl und API, im Chat aber weiter nutzbar.
    await admin.json("PUT", "/api/admin/fundus/documents", { id: own, title: "Bald weg", summary: "", date: "2026-10-14", tags: [], keywords: [], enabled: false });
    await admin.hide(BUILT_IN.word);
    const catalog = await fundusCatalog(chat.page.request);
    expect(catalog.documents.some((d) => d.id === own || d.id === BUILT_IN.word)).toBe(false);
    for (const id of [own, BUILT_IN.word]) {
      expect((await chat.page.request.post("/api/library/attach", { data: { id } })).status()).toBe(404);
      expect((await chat.page.request.get(`/api/library/${id}`)).status()).toBe(404);
    }
    await chat.lastAnswer.getByRole("button", { name: "Neu generieren" }).click();
    await chat.waitForAnswer();
    await expect(chat.lastAnswer.locator("pre")).toContainText("BALDWEG");

    // Gelöscht (und ohne Datei-Cache): Hinweis statt Inhalt.
    await admin.deleteFundus("documents", own);
    await chat.page.route("**/api/chat", async (route) => {
      const body = route.request().postDataJSON() as { messages: { attachments?: { sha256: string }[] }[] };
      for (const m of body.messages) for (const a of m.attachments ?? []) a.sha256 = "f".repeat(64);
      await route.continue({ postData: JSON.stringify(body) });
    });
    await chat.lastAnswer.getByRole("button", { name: "Neu generieren" }).click();
    await chat.waitForAnswer();
    // Statt des Inhalts bekommt das Modell nur den Hinweis „… ist nicht mehr verfügbar“ (keine Datei mehr).
    await expect(chat.lastAnswer.locator("pre")).not.toContainText("BALDWEG");
    expect(await chat.diagnosis(chat.lastAnswer, "Dateien")).toBe("keine");
  });

  test("Y25 Neuer Stand ohne Neuladen: erneutes Öffnen holt den neuen Katalog (200 statt 304); gelöschte Auswahl fällt mit Hinweis heraus", async ({ admin, browser, baseURL, ip }) => {
    const [a, b] = await admin.addDocuments([
      { name: "a.docx", data: uniqueDocx("a", "A").buffer, meta: { title: `Auswahl A ${uniq()}` } },
      { name: "b.docx", data: uniqueDocx("b", "B").buffer, meta: { title: `Auswahl B ${uniq()}` } },
    ]);
    const chat = await openChat(browser, baseURL!, guestIp(ip));
    const statuses: number[] = [];
    chat.page.on("response", (r) => {
      if (new URL(r.url()).pathname === "/api/library") statuses.push(r.status());
    });
    await guestFundus(chat, "Dokumente");
    await fundusDialog(chat.page).getByRole("combobox", { name: "Verwaltung" }).selectOption({ label: "Eigene Inhalte" });
    for (const id of [a, b]) await docList(chat.page).locator(`[data-id="${id}"] [data-role="auswahl"]`).click();
    await expect(fundusDialog(chat.page).getByRole("status")).toHaveText("2 Dateien ausgewählt");
    await chat.page.keyboard.press("Escape");
    // Ohne Änderung: 304.
    await guestFundus(chat);
    await expect.poll(() => statuses.length).toBe(2);
    expect(statuses).toEqual([200, 304]);
    await chat.page.keyboard.press("Escape");

    await admin.deleteFundus("documents", a);
    const promptId = await admin.createPrompt({ title: `Neu im Kurs ${uniq()}`, categoryId: "kat-schreiben", text: "Neu" });
    await guestFundus(chat);
    await expect.poll(() => statuses.length).toBe(3);
    expect(statuses[2]).toBe(200);
    await expect(fundusDialog(chat.page).getByRole("status")).toHaveText("1 Eintrag ist nicht mehr im Fundus.");
    await expect(docList(chat.page).getByRole("option")).toHaveCount(1);
    await expect(docList(chat.page).locator(`[data-id="${b}"]`)).toHaveAttribute("aria-selected", "true");
    await fundusDialog(chat.page).getByRole("tab", { name: /^Prompts/ }).click();
    await expect(fundusDialog(chat.page).getByRole("listbox", { name: "Prompts" }).locator(`[data-id="${promptId}"]`)).toBeVisible();
  });

  test("Y26 Text nach Ablauf des Datei-Caches: eigener Anhang geht weiter mit Inhalt ans Modell – im Chat und im Gruppenchat", async ({ admin, browser, baseURL, ip }) => {
    const [own] = await admin.addDocuments([{ name: "Dauerhaft.docx", data: uniqueDocx("x", "Inhalt DAUERHAFT").buffer, meta: { title: "Dauerhaft" } }]);
    const chat = await openChat(browser, baseURL!, guestIp(ip));
    await chat.page.route("**/api/chat", async (route) => {
      const body = route.request().postDataJSON() as { messages: { attachments?: { sha256: string }[] }[] };
      for (const m of body.messages) for (const a of m.attachments ?? []) a.sha256 = "e".repeat(64);
      await route.continue({ postData: JSON.stringify(body) });
    });
    await guestFundus(chat, "Dokumente");
    await fundusDialog(chat.page).getByRole("searchbox", { name: "Fundus durchsuchen" }).fill("dauerhaft");
    await docList(chat.page).locator(`[data-id="${own}"]`).click();
    await fundusDialog(chat.page).getByRole("region", { name: "Vorschau" }).getByRole("button", { name: "Anhängen", exact: true }).click();
    await expectReady(chat.page, "Dauerhaft.docx", "Fundus · ca.");
    const seen = await filesSeen(chat);
    await expect(seen).toContainText("DAUERHAFT");
    await expect(seen).not.toContainText("nicht mehr verfügbar");

    // Gruppenchat: der Anhang geht mit dem Beitrag an Freebie (Text aus der Datenbank).
    const { guests } = await mailGroup(admin, 2);
    const member = await openChat(browser, baseURL!, guestIp(ip, 2), { guest: guests[0] });
    const title = `Fundus-Runde ${uniq()}`;
    await startGroupChat(member.page.request, title, [guests[1].username]);
    await member.page.reload();
    const group = GroupChatPage.of(member);
    await group.open(title);
    // Wie nach dem Aufräumjob: ohne Eintrag im Datei-Cache (unbekannte Prüfsumme) liest der Server den Text aus der Datenbank.
    await member.page.route("**/api/groupchats/*/messages", async (route) => {
      if (route.request().method() !== "POST") return route.continue();
      const body = route.request().postDataJSON() as { attachments?: { sha256: string }[] };
      for (const a of body.attachments ?? []) a.sha256 = "d".repeat(64);
      await route.continue({ postData: JSON.stringify(body) });
    });
    await guestFundus(member, "Dokumente");
    await fundusDialog(member.page).getByRole("searchbox", { name: "Fundus durchsuchen" }).fill("dauerhaft");
    await docList(member.page).locator(`[data-id="${own}"]`).click();
    await fundusDialog(member.page).getByRole("region", { name: "Vorschau" }).getByRole("button", { name: "Anhängen", exact: true }).click();
    await expect(chip(member.page, "Dauerhaft.docx")).toContainText("Fundus · ca.", { timeout: 30_000 });
    await group.post(`@Freebie #zeige-dateien Was steht drin? ${uniq()}`);
    await group.waitForAnswer(1);
    await expect(group.answers.last().locator("pre")).toContainText("DAUERHAFT");
  });
});

// ---------------------------------------------------------------- W09 Last

test("W09 25 Gäste öffnen den Fundus, füllen Prompts aus und senden, während die Kursleitung Prompts speichert und eine Datei hochlädt", async ({ admin, baseURL, ip }) => {
  test.slow();
  const guests: APIRequestContext[] = [];
  for (let i = 0; i < 25; i++) {
    const api = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ipFor(`${ip}-last-${i}`) } });
    expect((await api.post("/api/auth/login", { data: await createGuest(baseURL!) })).status()).toBe(200);
    guests.push(api);
  }
  const start = await fundusCatalog(guests[0]);
  const prompt = start.prompts.find((p) => p.id === "prompt-absage")!;
  const statuses: number[] = [];
  const guestWork = guests.map(async (api, i) => {
    const res = await api.get("/api/library");
    statuses.push(res.status());
    const catalog = (await res.json()) as FundusCatalog;
    expect(catalog.prompts.some((p) => p.id === prompt.id)).toBe(true);
    const text = prompt.text.replace("{{Empfänger}}", `Gast ${i}`).replace("{{Anliegen}}", `Anliegen ${uniq()}`);
    const chat = await api.post("/api/chat", {
      data: { conversationId: randomUUID(), modelId: "claude-sonnet-5-5", presetId: null, messages: [{ id: randomUUID(), role: "user", text, createdAt: Date.now(), effort: "low", webSearch: false }] },
      timeout: 60_000,
    });
    statuses.push(chat.status());
    await chat.body();
  });
  const adminWork = (async () => {
    for (let i = 0; i < 5; i++) await admin.createPrompt({ title: `Last ${i} ${uniq()}`, categoryId: "kat-schreiben", text: `Für {{Zielgruppe}} ${i}` });
    await admin.addDocuments([{ name: "last.docx", data: uniqueDocx("last", "Last").buffer }]);
  })();
  await Promise.all([...guestWork, adminWork]);
  expect(statuses.filter((s) => s >= 500)).toEqual([]);
  expect(statuses.every((s) => s === 200)).toBe(true);
  // Danach sehen alle den neuen Stand mit demselben ETag.
  const etags = new Set<string>();
  for (const api of guests) {
    const res = await api.get("/api/library", { headers: { "if-none-match": `"fundus-${start.version}"` } });
    expect(res.status()).toBe(200);
    etags.add(res.headers()["etag"]);
    const again = await api.get("/api/library", { headers: { "if-none-match": res.headers()["etag"] } });
    expect(again.status()).toBe(304);
  }
  expect(etags.size).toBe(1);
  await Promise.all(guests.map((g) => g.dispose()));
});

// ---------------------------------------------------------------- Neustart-Server (FP15/FP17)

const RESTART_PORT = 3111;
const RESTART_URL = `http://localhost:${RESTART_PORT}`;

async function startServer(keepData: boolean): Promise<ChildProcess> {
  const child = spawn(process.execPath, ["tests/e2e/support/serve.mjs", "fundus-neustart", String(RESTART_PORT), "mock"], {
    env: { ...process.env, E2E_KEEP_DATA: keepData ? "1" : "0" },
    stdio: "ignore",
  });
  await expect(async () => {
    const res = await fetch(`${RESTART_URL}/login`);
    expect(res.status).toBe(200);
  }).toPass({ timeout: 60_000, intervals: [250] });
  return child;
}

async function stopServer(child: ChildProcess) {
  if (child.exitCode !== null) return;
  const exited = new Promise((resolve) => child.once("exit", resolve));
  child.kill("SIGTERM");
  await exited;
}
