// Seitenobjekte und Hilfen für „Fundus pflegen“ (Admin) und Prompts im Chat (Plan: FUNDUS-PFLEGE-PLAN.md).
import { readFileSync } from "node:fs";
import type { APIRequestContext, Locator, Page } from "@playwright/test";
import type { FundusCatalog, LibraryPrompt } from "../../../lib/library/types";
import { expect, openAdmin, uniq } from "./fixtures";
import { docxWith, fixture } from "./generate-files";

/** Testdatei als Inhalt für setInputFiles (optional unter anderem Namen). */
export function upload(name: string, as?: string) {
  return { name: as ?? name, mimeType: "application/octet-stream", buffer: readFileSync(fixture(name)) };
}

/** Word-Datei mit eindeutigem Inhalt (sonst greift die Dublettenprüfung zwischen Tests). */
export function uniqueDocx(name: string, ...lines: string[]) {
  const buffer = docxWith([...lines, `Kennung ${uniq()}${uniq()}`]);
  return { name, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", buffer };
}

/** Admin › Fundus. */
export class FundusAdminPage {
  constructor(public readonly page: Page) {}

  static async open(page: Page, sub?: "Dokumente" | "E-Mail-Verläufe" | "Prompts" | "Kategorien") {
    await openAdmin(page, "Fundus");
    const p = new FundusAdminPage(page);
    await expect(p.subTabs).toBeVisible();
    if (sub) await p.sub(sub).click();
    return p;
  }

  get subTabs() {
    return this.page.getByRole("tablist", { name: "Fundus-Bereiche" });
  }
  sub(name: "Dokumente" | "E-Mail-Verläufe" | "Prompts" | "Kategorien") {
    return this.subTabs.getByRole("tab", { name: new RegExp(`^${name} \\(\\d+\\)$`) });
  }
  /** Zeile eines Eintrags (Dokument, Verlauf, Prompt oder Kategorie) über die ID. */
  row(id: string) {
    return this.page.locator(`li[data-id="${id}"]`);
  }
  rowByTitle(title: string) {
    return this.page.locator("li[data-id]").filter({ has: this.page.getByText(title, { exact: true }) });
  }
  get documents() {
    return this.page.getByRole("list", { name: "Dokumente im Fundus" });
  }
  get threads() {
    return this.page.getByRole("list", { name: "E-Mail-Verläufe im Fundus" });
  }
  get categories() {
    return this.page.getByRole("list", { name: "Kategorien" });
  }
  get uploadDialog() {
    return this.page.getByRole("dialog", { name: "Dokumente hochladen" });
  }
  get threadDialog() {
    return this.page.getByRole("dialog", { name: "E-Mail-Verlauf hochladen" });
  }
  get promptDialog() {
    return this.page.getByRole("dialog", { name: /^(Neuer Prompt|Prompt bearbeiten)$/ });
  }
  /** Eintrag im Prüfschritt des Upload-Dialogs. */
  entry(fileName: string) {
    return this.uploadDialog.locator(`li[data-datei="${fileName}"]`);
  }

  async uploadDocuments(files: { name: string; mimeType: string; buffer: Buffer }[]) {
    await this.page.getByRole("button", { name: "Dateien hochladen" }).click();
    await expect(this.uploadDialog).toBeVisible();
    await this.uploadDialog.getByLabel("Dateien für den Fundus auswählen").setInputFiles(files);
  }

  /** Wartet, bis alle Dateien hochgeladen und geprüft sind. */
  async waitChecked() {
    await expect(this.uploadDialog.getByText(/(wird|werden) hochgeladen und geprüft/)).toHaveCount(0, { timeout: 30_000 });
    await expect(this.uploadDialog.getByText(/^Lädt hoch|^Wird geprüft/)).toHaveCount(0, { timeout: 30_000 });
  }

  async confirmAndSave(dialog: Locator, button: RegExp) {
    await dialog.getByRole("checkbox", { name: /keine echten personenbezogenen/ }).check();
    await dialog.getByRole("button", { name: button }).click();
  }

  async uploadThread(files: { name: string; mimeType: string; buffer: Buffer }[]) {
    await this.page.getByRole("button", { name: "Verlauf hochladen" }).click();
    await expect(this.threadDialog).toBeVisible();
    await this.threadDialog.getByLabel("E-Mails für den Verlauf auswählen").setInputFiles(files);
  }
}

/** Maske „Prompt ausfüllen“. */
export class PromptMask {
  constructor(public readonly page: Page) {}

  get dialog() {
    return this.page.getByRole("dialog", { name: "Prompt ausfüllen" });
  }
  field(label: string) {
    return this.dialog.getByLabel(label, { exact: true });
  }
  get preview() {
    return this.dialog.getByRole("region", { name: "Vorschau" });
  }
  button(name: "Einfügen" | "Anfügen" | "Ersetzen" | "Abbrechen") {
    return this.dialog.getByRole("button", { name, exact: true });
  }
}

/** Fundus-Dialog im Chat, Reiter „Prompts“. */
export class PromptsTab {
  constructor(public readonly page: Page) {}

  get dialog() {
    return this.page.getByRole("dialog", { name: "Fundus" });
  }
  get tab() {
    return this.dialog.getByRole("tab", { name: /^Prompts/ });
  }
  get list() {
    return this.dialog.getByRole("listbox", { name: "Prompts" });
  }
  option(id: string) {
    return this.list.locator(`[data-id="${id}"]`);
  }
  get preview() {
    return this.dialog.getByRole("region", { name: "Vorschau" });
  }
  get search() {
    return this.dialog.getByRole("searchbox", { name: "Prompts durchsuchen" });
  }
  get categories() {
    return this.dialog.getByRole("group", { name: "Kategorien" });
  }
  get fill() {
    return this.dialog.getByRole("button", { name: /^(Ausfüllen und einfügen|Einfügen)$/ });
  }

  async open() {
    await this.page.getByRole("button", { name: "Fundus öffnen" }).click();
    await expect(this.dialog).toBeVisible();
    await this.tab.click();
    await expect(this.tab).toHaveAttribute("aria-selected", "true");
  }

  /** Prompt wählen und „Ausfüllen und einfügen“ (bzw. „Einfügen“). */
  async choose(id: string) {
    await this.option(id).click();
    await this.fill.click();
  }
}

/** Katalog wie im Browser (Gast). */
export async function fundusCatalog(api: APIRequestContext): Promise<FundusCatalog> {
  const res = await api.get("/api/library");
  expect(res.status()).toBe(200);
  return (await res.json()) as FundusCatalog;
}

export function promptByTitle(catalog: FundusCatalog, title: string): LibraryPrompt {
  const p = catalog.prompts.find((x) => x.title === title);
  expect(p, `Prompt „${title}“`).toBeTruthy();
  return p!;
}
