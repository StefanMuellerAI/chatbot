import { readFileSync } from "node:fs";
import { request as playwrightRequest, type Page } from "@playwright/test";
import { expectAccessible } from "../support/a11y";
import { AdminApi, createGuest, expect, ipFor, openChat, test, uniq } from "../support/fixtures";
import { FundusAdminPage, fundusCatalog, PromptImportDialog, PromptMask, PromptsTab, upload } from "../support/fundus";
import { clickTwice } from "../support/grenzfaelle";

// FP20–FP29 · Prompt-Bibliotheken importieren und exportieren, PR14 · reservierte Platzhalternamen
// (Plan: PROMPT-IMPORT-PLAN.md). Alles ändert den Fundus und läuft deshalb im Projekt „admin“ (serieller Server);
// restore() löscht danach neue Prompts und Kategorien.

const guestIp = (ip: string, n = 1) => ipFor(`${ip}-import-gast-${n}`);
const URL_IMPORT = "/api/admin/fundus/prompts/import";

type FileJson = { format: string; version: number; name: string; anleitung?: string[]; prompts: Record<string, unknown>[] };

async function download(page: Page, click: () => Promise<void>): Promise<{ name: string; json: FileJson }> {
  const [d] = await Promise.all([page.waitForEvent("download"), click()]);
  return { name: d.suggestedFilename(), json: JSON.parse(readFileSync((await d.path())!, "utf8")) as FileJson };
}

/** Kleine Bibliothek mit eindeutigen Titeln. */
function library(n: number, extra: Record<string, unknown> = {}) {
  const id = uniq();
  return {
    format: "freebie-prompts",
    version: 1,
    name: `Bibliothek ${id}`,
    prompts: Array.from({ length: n }, (_, i) => ({
      titel: `Import ${i + 1} ${id}`,
      text: `Schreibe für {{Zielgruppe}} über Punkt ${i + 1}.`,
      platzhalter: { Zielgruppe: { hinweis: "z. B. das Team" } },
    })),
    ...extra,
  };
}

const forApi = (lib: ReturnType<typeof library>) => lib.prompts.map((p) => ({ title: p.titel, text: p.text }));

test.describe("FP · Prompt-Bibliotheken importieren", () => {
  test("FP20 Muster herunterladen: Dateiname, gültiges JSON mit Anleitung und drei Beispielen; genau diese Datei importiert und im Chat ausfüllbar", async ({
    page,
    browser,
    baseURL,
    ip,
  }) => {
    await FundusAdminPage.open(page, "Prompts");
    const muster = await download(page, () => page.getByRole("button", { name: "Muster herunterladen" }).click());
    expect(muster.name).toBe("freebie-prompts-muster.json");
    expect(muster.json).toMatchObject({ format: "freebie-prompts", version: 1, name: "Meine Prompt-Bibliothek" });
    expect(muster.json.anleitung!.join(" ")).toContain("{{Name}}");
    expect(muster.json.prompts.map((p) => p.titel)).toEqual(["Absage höflich formulieren", "E-Mail-Verlauf zusammenfassen", "Text in einfache Sprache übertragen"]);

    await page.getByRole("button", { name: "Importieren", exact: true }).click();
    const d = new PromptImportDialog(page);
    // Das Muster gibt es auch im Dialog.
    expect((await download(page, () => d.dialog.getByRole("button", { name: "Muster herunterladen" }).click())).json).toEqual(muster.json);
    await d.choose(JSON.stringify(muster.json, null, 2), muster.name);
    await expect(d.summary).toHaveText("3 Prompts in der Datei: 3 werden importiert.");
    await expect(d.category).toHaveValue("__neu__");
    await expect(d.newName).toHaveValue("Meine Prompt-Bibliothek");
    const name = `Muster ${uniq()}`;
    await d.newName.fill(name);
    await d.importAll();
    await expect(page.getByText(`3 Prompts in „${name}“ importiert.`)).toBeVisible();

    const chat = await openChat(browser, baseURL!, guestIp(ip));
    const catalog = await fundusCatalog(chat.page.request);
    const cat = catalog.categories.find((c) => c.name === name)!;
    const mail = catalog.prompts.find((p) => p.categoryId === cat.id && p.title === "E-Mail-Verlauf zusammenfassen")!;
    const tab = new PromptsTab(chat.page);
    await tab.open();
    await expect(tab.list.getByRole("group", { name })).toBeVisible();
    await tab.choose(mail.id);
    const mask = new PromptMask(chat.page);
    await expect(mask.dialog.locator("label")).toHaveText(["Zielgruppe", "Anzahl Punkte", "Was ist dir wichtig?"]);
    await expect(mask.field("Anzahl Punkte")).toHaveValue("5");
    await mask.field("Zielgruppe").fill("die Amtsleitung");
    await mask.field("Was ist dir wichtig?").fill("Fristen");
    await mask.button("Einfügen").click();
    await expect(chat.composer).toHaveValue("Fasse den angehängten E-Mail-Verlauf für die Amtsleitung in 5 Punkten zusammen.\nAchte besonders auf: Fristen");
  });

  test("FP21 Import in vorhandene Kategorie: Prüfschritt, Vorschau, Zahl im Knopf; am Ende der Kategorie in Dateireihenfolge, aktiv; Teilnehmende sehen sie beim nächsten Öffnen", async ({
    page,
    admin,
    browser,
    baseURL,
    ip,
  }) => {
    const chat = await openChat(browser, baseURL!, guestIp(ip));
    const tab = new PromptsTab(chat.page);
    await tab.open();
    await chat.page.keyboard.press("Escape");
    await expect(tab.dialog).toBeHidden();

    const lib = library(3);
    const d = await PromptImportDialog.open(page);
    await d.choose(lib, "team.json");
    await expect(d.summary).toHaveText("3 Prompts in der Datei: 3 werden importiert.");
    await expect(d.entries).toHaveCount(3);
    await expect(d.entry(0)).toContainText("1 Platzhalter · bereit");
    await d.entry(0).getByRole("button", { name: "Vorschau" }).click();
    await expect(d.entry(0).locator('[data-role="platzhalter"]')).toHaveText("Zielgruppe");
    await d.category.selectOption("kat-schreiben");
    await expect(d.newName).toBeHidden();
    await expect(d.submit).toHaveText("Importieren (3 Prompts)");
    await expect(d.submit).toBeDisabled();
    await d.importAll();
    await expect(page.getByText("3 Prompts in „Schreiben“ importiert.")).toBeVisible();

    const prompts = (await admin.fundus()).prompts.filter((p) => p.categoryId === "kat-schreiben").sort((a, b) => a.sortOrder - b.sortOrder);
    expect(prompts.slice(-3).map((p) => [p.title, p.enabled, p.placeholders])).toEqual(
      lib.prompts.map((p) => [p.titel, true, { zielgruppe: { hint: "z. B. das Team" } }]),
    );
    const section = page.getByRole("region", { name: "Kategorie Schreiben" });
    await expect(section.locator("li[data-id]").last()).toContainText(lib.prompts[2].titel);

    // Ohne Neuladen: erneutes Öffnen holt den neuen Stand.
    await tab.open();
    await expect(tab.list.getByText(lib.prompts[2].titel)).toBeVisible();
  });

  test("FP22 Neue Kategorie beim Import: Name aus der Datei oder dem Dateinamen; doppelt, leer und zu lang gesperrt; Abbrechen und nichts Importierbares legen keine Kategorie an", async ({
    page,
    admin,
  }) => {
    const before = (await admin.fundus()).categories.length;
    const d = await PromptImportDialog.open(page);
    const { name: _unused, ...withoutName } = library(2);
    void _unused;
    await d.choose(withoutName, "freebie-prompts-bibliothek-mueller.json");
    await expect(d.category).toHaveValue("__neu__");
    await expect(d.newName).toHaveValue("bibliothek mueller");
    await d.choose(library(2, { name: "Sammlung Recht" }), "x.json");
    await expect(d.newName).toHaveValue("Sammlung Recht");
    await d.confirm.check();
    await expect(d.submit).toBeEnabled();
    await d.newName.fill("schreiben");
    await expect(d.dialog.getByText("Die Kategorie „schreiben“ gibt es schon – wähle sie oben aus.")).toBeVisible();
    await expect(d.newName).toHaveAttribute("aria-invalid", "true");
    await expect(d.submit).toBeDisabled();
    await d.newName.fill("   ");
    await expect(d.submit).toBeDisabled();
    await d.newName.fill("x".repeat(41));
    await expect(d.dialog.getByText("Name: höchstens 40 Zeichen")).toBeVisible();
    await expect(d.submit).toBeDisabled();
    await d.dialog.getByRole("button", { name: "Abbrechen" }).click();
    await expect(d.dialog).toBeHidden();
    expect((await admin.fundus()).categories).toHaveLength(before);

    // Nur fehlerhafte Einträge: nichts zu importieren, also auch keine leere Kategorie.
    await page.getByRole("button", { name: "Importieren", exact: true }).click();
    await d.choose({ prompts: [{ titel: "", text: "a" }, { titel: "b" }] });
    await expect(d.summary).toHaveText("2 Prompts in der Datei: 0 werden importiert, 2 haben Fehler.");
    await expect(d.submit).toHaveText("Importieren");
    await expect(d.submit).toBeDisabled();
    await expect(d.confirm).toHaveCount(0);

    // Mit Import: die neue Kategorie steht am Ende.
    await d.choose(library(1, { name: `Neu ${uniq()}` }));
    const name = await d.newName.inputValue();
    await d.importAll();
    const after = (await admin.fundus()).categories.sort((a, b) => a.sortOrder - b.sortOrder);
    expect(after).toHaveLength(before + 1);
    expect(after.at(-1)).toMatchObject({ name, prompts: 1 });
  });

  test("FP23 Prüfschritt: Fehler, Hinweise und Dubletten je Eintrag; Wechsel der Kategorie bewertet neu; nur Bereite werden angelegt", async ({ page, admin }) => {
    const id = uniq();
    const file = {
      format: "freebie-prompts",
      version: 1,
      exportiert: "2026-10-15",
      prompts: [
        { titel: `Gut ${id}`, text: "Für {{Zielgruppe}}.", platzhalter: { Zielgruppe: {}, Weg: { hinweis: "x" } }, tags: ["a"] },
        { titel: "Absage höflich formulieren", text: "Gibt es in „Schreiben“ schon {{A}}" },
        { titel: `gut ${id}`, text: "Steht oben schon" },
        { titel: "", text: "ohne Titel" },
        { titel: `Lang ${id}`, text: "x".repeat(8001) },
        { titel: `Auswahl ${id}`, text: "{{Ton}}", platzhalter: { Ton: { art: "auswahl", werte: ["nur einer"] } } },
        { titel: `Echt ${id}`, text: "Schreib an max.mustermann@gmx.de", kategorie: "Alt" },
        { titel: `Eckig ${id}`, text: "Über [THEMA]." },
      ],
    };
    const d = await PromptImportDialog.open(page);
    await d.choose(file);
    await d.category.selectOption("kat-schreiben");
    await expect(d.summary).toHaveText("8 Prompts in der Datei: 3 werden importiert, 2 gibt es schon, 3 haben Fehler.");
    expect(await d.entries.evaluateAll((els) => els.map((e) => e.getAttribute("data-zustand")))).toEqual([
      "bereit",
      "doppelt",
      "doppelt",
      "fehler",
      "fehler",
      "fehler",
      "bereit",
      "bereit",
    ]);
    await expect(d.entry(1)).toContainText("gibt es in der Kategorie schon – wird übersprungen");
    await expect(d.entry(2)).toContainText("steht weiter oben schon in der Datei – wird übersprungen");
    await expect(d.entry(3)).toContainText("Eintrag 4");
    await expect(d.entry(3)).toContainText("Fehler: Titel: darf nicht leer sein – wird übersprungen");
    await expect(d.entry(4)).toContainText("Fehler: Prompt-Text: höchstens 8.000 Zeichen");
    await expect(d.entry(5)).toContainText("eine Auswahl braucht mindestens 2 Werte");
    await expect(d.entry(0)).toContainText("Hinweis: Einstellungen für „Weg“ ohne Platzhalter im Text – werden ignoriert.");
    await expect(d.entry(6)).toContainText("Hinweis: Echte Daten? E-Mail-Adresse mit echter Domain: max.mustermann@gmx.de");
    await expect(d.entry(7)).toContainText("sollen das Platzhalter sein?");
    await expect(d.dialog.getByText("Das Feld „kategorie“ wird ignoriert – alle Prompts kommen in die Kategorie, die du hier wählst.")).toBeVisible();
    await expect(d.dialog.getByText("Unbekannte Felder werden ignoriert: exportiert, tags")).toBeVisible();
    await d.entry(5).getByRole("button", { name: "Vorschau" }).click();
    await expect(d.entry(5).getByRole("listitem")).toHaveText(["Platzhalter „Ton“: eine Auswahl braucht mindestens 2 Werte"]);

    // In einer neuen Kategorie ist der Titel aus „Schreiben“ keine Dublette.
    await d.category.selectOption("__neu__");
    await expect(d.summary).toHaveText("8 Prompts in der Datei: 4 werden importiert, 1 gibt es schon, 3 haben Fehler.");
    await d.category.selectOption("kat-schreiben");
    const before = (await admin.fundus()).prompts.length;
    await expect(d.submit).toHaveText("Importieren (3 Prompts)");
    await d.importAll();
    await expect(page.getByText("3 Prompts in „Schreiben“ importiert, 5 übersprungen.")).toBeVisible();
    const after = (await admin.fundus()).prompts;
    expect(after).toHaveLength(before + 3);
    expect(
      after
        .filter((p) => p.title.endsWith(id))
        .map((p) => p.title)
        .sort(),
    ).toEqual([`Echt ${id}`, `Eckig ${id}`, `Gut ${id}`]);
  });

  test("FP24 Kaputte Dateien: leer, kein JSON, falsches Format, neuere Version, leere Liste, Windows-1252, zu groß, 501 Einträge, Word-Datei – je eine Meldung, nichts angelegt", async ({
    page,
    admin,
  }) => {
    const before = await admin.fundus();
    const d = await PromptImportDialog.open(page);
    const cases: [unknown, string | RegExp][] = [
      ["", "Die Datei ist leer."],
      [" \n ", "Die Datei ist leer."],
      ['{ "prompts": [ { "titel": "a", } ] }', /^Die Datei ist kein gültiges JSON( \(Zeile 1, Spalte \d+\))?\. Häufige Ursachen/],
      [{ format: "andere-app", prompts: [] }, "Das ist keine Prompt-Bibliothek für Freebie – bitte das Muster verwenden."],
      [{ format: "freebie-prompts", version: 2, prompts: [{}] }, "Die Datei stammt aus einer neueren Freebie-Version – bitte Freebie aktualisieren oder das Muster verwenden."],
      [{ format: "freebie-prompts", version: 1, prompts: [] }, "In der Datei stehen keine Prompts."],
      [Buffer.from([0x5b, 0x7b, 0x22, 0x74, 0x69, 0x74, 0x65, 0x6c, 0x22, 0x3a, 0x22, 0xe4, 0x22, 0x7d, 0x5d]), "Die Datei ist nicht als UTF-8 gespeichert. Bitte als UTF-8 speichern und erneut wählen."],
      [Buffer.alloc(4 * 1024 * 1024 + 1, 0x20), "Die Datei ist zu groß (höchstens 4 MB)."],
      [Array.from({ length: 501 }, (_, i) => ({ titel: `t${i}`, text: "x" })), "Höchstens 500 Prompts je Datei – in der Datei stehen 501."],
    ];
    for (const [content, message] of cases) {
      await d.choose(content);
      if (typeof message === "string") await expect(d.alert).toHaveText(message);
      else await expect(d.alert).toHaveText(message);
      await expect(d.entries).toHaveCount(0);
      await expect(d.submit).toBeDisabled();
    }
    // Word-Datei, als .json umbenannt.
    await d.input.setInputFiles(upload("vertrag.docx", "vertrag.json"));
    await expect(d.alert).toHaveText("Die Datei ist nicht als UTF-8 gespeichert. Bitte als UTF-8 speichern und erneut wählen.");
    // Danach eine gute Datei: die Meldung verschwindet.
    await d.choose(library(1));
    await expect(d.alert).toHaveCount(0);
    await expect(d.entries).toHaveCount(1);
    await d.dialog.getByRole("button", { name: "Abbrechen" }).click();
    const after = await admin.fundus();
    expect(after.prompts).toHaveLength(before.prompts.length);
    expect(after.categories).toHaveLength(before.categories.length);
  });

  test("FP25 Grenzen und Gleichzeitigkeit: Kategorie verschwindet zwischendurch, Doppelklick legt einmal an, zwei Sitzungen gleichzeitig, Platz für noch N Prompts (Dialog und API)", async ({
    page,
    admin,
    baseURL,
    ip,
  }) => {
    test.slow();
    const gone = await admin.createCategory(`Weg ${uniq()}`);
    let d = await PromptImportDialog.open(page);
    await d.choose(library(2));
    await d.category.selectOption(gone);
    await admin.deleteFundus("categories", gone);
    await d.confirm.check();
    await d.submit.click();
    await expect(d.alert).toHaveText("Die Kategorie gibt es nicht mehr – bitte neu wählen.");
    await expect(d.dialog).toBeVisible();
    await d.dialog.getByRole("button", { name: "Abbrechen" }).click();

    // Doppelklick: genau einmal angelegt.
    const once = library(2);
    await page.getByRole("button", { name: "Importieren", exact: true }).click();
    await d.choose(once);
    await d.category.selectOption("kat-recherche");
    await d.confirm.check();
    await clickTwice(d.submit);
    await expect(d.dialog).toBeHidden();
    const titles = (await admin.fundus()).prompts.map((p) => p.title);
    for (const p of once.prompts) expect(titles.filter((t) => t === p.titel)).toHaveLength(1);

    // Zwei Admin-Sitzungen importieren gleichzeitig dieselbe Datei.
    const other = await AdminApi.create(baseURL!, ipFor(`${ip}-zweiter-admin`));
    const same = forApi(library(3));
    const [a, b] = await Promise.all([admin.importPrompts(same, { categoryId: "kat-recherche" }), other.importPrompts(same, { categoryId: "kat-recherche" })]);
    expect(a.created + b.created).toBe(3);
    expect(a.skipped.length + b.skipped.length).toBe(3);
    await other.api.dispose();

    // Auffüllen bis auf 5 freie Plätze – ein einziger Import.
    const now = (await admin.fundus()).prompts.length;
    await admin.importPrompts(
      Array.from({ length: 495 - now }, (_, i) => ({ title: `Füllung ${i} ${uniq()}`, text: "x", enabled: false })),
      { categoryId: "kat-recherche" },
    );
    d = await PromptImportDialog.open(page);
    await d.choose(library(10));
    await d.category.selectOption("kat-recherche");
    await expect(d.dialog.getByText("Platz für noch 5 Prompts – die Datei enthält 10 importierbare. Bitte aufteilen oder Prompts löschen.")).toBeVisible();
    await d.confirm.check();
    await expect(d.submit).toBeDisabled();
    const res = await admin.api.post(URL_IMPORT, { data: { prompts: forApi(library(10)), categoryId: "kat-recherche", confirmed: true } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Platz für noch 5 Prompts – die Datei enthält 10 importierbare. Bitte aufteilen oder Prompts löschen.");
    expect((await admin.fundus()).prompts).toHaveLength(495);
    // Genau fünf passen.
    await d.choose(library(5));
    await d.importAll();
    expect((await admin.fundus()).prompts).toHaveLength(500);
  });

  test("FP26 Optionen: Schreibweise [Name] samt Einstellungen, Bestätigung nötig (auch in der API), „Alle zunächst inaktiv“ – Teilnehmende sehen dann nichts", async ({
    page,
    admin,
    browser,
    baseURL,
    ip,
  }) => {
    const id = uniq();
    const d = await PromptImportDialog.open(page);
    await d.choose({ name: `Eckig ${id}`, prompts: [{ titel: `Thema ${id}`, text: "Schreibe über [THEMA] für [Ziel gruppe].", platzhalter: { "[THEMA]": { hinweis: "z. B. KI im Amt" } } }] });
    await expect(d.entry(0)).toContainText("ohne Platzhalter");
    await expect(d.entry(0)).toContainText("sollen das Platzhalter sein?");
    await d.style.selectOption("eckig");
    await expect(d.entry(0)).toContainText("2 Platzhalter · bereit");
    await expect(d.entry(0)).not.toContainText("Hinweis");
    await d.entry(0).getByRole("button", { name: "Vorschau" }).click();
    await expect(d.entry(0).locator('[data-role="platzhalter"]')).toHaveText(["THEMA", "Ziel gruppe"]);
    await expect(d.submit).toBeDisabled();
    await d.confirm.check();
    await expect(d.submit).toBeEnabled();
    await d.importAll();

    const chat = await openChat(browser, baseURL!, guestIp(ip));
    const catalog = await fundusCatalog(chat.page.request);
    const p = catalog.prompts.find((x) => x.title === `Thema ${id}`)!;
    expect(p.text).toBe("Schreibe über {{THEMA}} für {{Ziel gruppe}}.");
    const tab = new PromptsTab(chat.page);
    await tab.open();
    await tab.choose(p.id);
    await expect(new PromptMask(chat.page).field("THEMA")).toHaveAttribute("placeholder", "z. B. KI im Amt");

    // Zunächst inaktiv: weder Prompts noch Kategorie im Chat.
    const quiet = library(2, { name: `Still ${id}` });
    await page.getByRole("button", { name: "Importieren", exact: true }).click();
    await d.choose(quiet);
    await d.inactive.check();
    await d.importAll();
    await expect(page.getByRole("region", { name: `Kategorie Still ${id}` }).getByText("inaktiv", { exact: true })).toHaveCount(2);
    const after = await fundusCatalog(chat.page.request);
    expect(after.categories.some((c) => c.name === `Still ${id}`)).toBe(false);
    expect(after.prompts.some((x) => x.title === quiet.prompts[0].titel)).toBe(false);

    // Die API verlangt die Bestätigung auch.
    const res = await admin.api.post(URL_IMPORT, { data: { prompts: [{ title: "x", text: "y" }], categoryId: "kat-schreiben" } });
    expect(res.status()).toBe(400);
    expect((await res.json()).error).toBe("Bitte bestätigen, dass die Prompts keine echten personenbezogenen oder vertraulichen Daten enthalten.");
  });

  test("FP27 Import-API direkt: 401, 403, kaputter Body, zu groß, fremde Felder, manipulierte Einträge, Kategorie fehlt oder doppelt, fremde Seite, __proto__", async ({
    baseURL,
    ip,
    admin,
  }) => {
    const anon = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ipFor(`${ip}-anon`) } });
    expect((await anon.post(URL_IMPORT, { data: {} })).status()).toBe(401);
    const guest = await playwrightRequest.newContext({ baseURL, extraHTTPHeaders: { "x-forwarded-for": ipFor(`${ip}-guest`) } });
    expect((await guest.post("/api/auth/login", { data: await createGuest(baseURL!) })).status()).toBe(200);
    const forbidden = await guest.post(URL_IMPORT, { data: {} });
    expect(forbidden.status()).toBe(403);
    expect((await forbidden.json()).error).toBe("Dieser Bereich ist nur für die Kursleitung.");
    await Promise.all([anon.dispose(), guest.dispose()]);

    const ok = { prompts: [{ title: `API ${uniq()}`, text: "Für {{Wer}}" }], categoryId: "kat-schreiben", confirmed: true };
    const expectError = async (data: unknown, status: number, message: string) => {
      const res = await admin.api.post(URL_IMPORT, { data: data as Record<string, unknown> });
      expect(res.status(), JSON.stringify(data).slice(0, 120)).toBe(status);
      expect((await res.json()).error).toBe(message);
    };
    const raw = (body: string) => admin.api.post(URL_IMPORT, { data: Buffer.from(body), headers: { "content-type": "application/json" } });
    const broken = await raw("{ kaputt");
    expect(broken.status()).toBe(400);
    expect((await broken.json()).error).toBe("Ungültige Anfrage.");
    expect((await raw(JSON.stringify({ ...ok, pad: "x".repeat(4 * 1024 * 1024) }))).status()).toBe(413);
    await expectError({ ...ok, extra: 1 }, 400, "Unbekanntes Feld: extra");
    await expectError({ ...ok, prompts: [{ ...ok.prompts[0], foo: 1 }] }, 400, "Eintrag 1: Unbekanntes Feld: foo");
    await expectError({ ...ok, prompts: [{ title: "x".repeat(161), text: "a" }] }, 400, "Eintrag 1: Titel: höchstens 160 Zeichen");
    await expectError({ ...ok, prompts: [{ title: "x".repeat(81), text: "a" }] }, 400, `Eintrag 1 („${"x".repeat(81)}“): Titel: höchstens 80 Zeichen`);
    await expectError(
      { ...ok, prompts: [ok.prompts[0], { title: "a", text: "{{A}}", placeholders: { a: { type: "select", options: ["x"] } } }] },
      400,
      "Eintrag 2 („a“): Platzhalter „A“: eine Auswahl braucht mindestens 2 Werte",
    );
    await expectError({ ...ok, prompts: Array.from({ length: 501 }, (_, i) => ({ title: `t${i}`, text: "x" })) }, 400, "Prompts: höchstens 500 Einträge");
    await expectError({ ...ok, categoryId: null }, 400, "Kategorie: bitte eine Kategorie wählen oder einen Namen angeben.");
    await expectError({ ...ok, newCategory: "Beides" }, 400, "Kategorie: bitte eine Kategorie wählen oder einen Namen angeben.");
    await expectError({ ...ok, categoryId: "kat-gibt-es-nicht" }, 409, "Die Kategorie gibt es nicht mehr – bitte neu wählen.");
    const foreign = await admin.api.post(URL_IMPORT, { data: ok, headers: { origin: "https://boese.example" } });
    expect(foreign.status()).toBe(403);
    expect((await admin.fundus()).prompts.some((p) => p.title === ok.prompts[0].title)).toBe(false);

    // __proto__ und constructor: angelegt, aber nur als Text – die Einstellungen der echten Platzhalter bleiben.
    const sneaky = JSON.parse('{"text":"A {{constructor}} B {{__proto__}} C {{Wer}}","placeholders":{"__proto__":{"label":"x"},"constructor":{"type":"area"},"wer":{"hint":"h"}}}');
    const title = `Sneaky ${uniq()}`;
    expect((await admin.importPrompts([{ ...sneaky, title }], { categoryId: "kat-schreiben" })).created).toBe(1);
    expect((await admin.fundus()).prompts.find((p) => p.title === title)!.placeholders).toEqual({ wer: { hint: "h" } });

    const good = await admin.api.post(URL_IMPORT, { data: ok });
    expect(good.status()).toBe(200);
    expect(await good.json()).toMatchObject({ ok: true, categoryId: "kat-schreiben", categoryName: "Schreiben", created: 1, skipped: [] });
  });

  for (const scheme of ["light", "dark"] as const) {
    test(`FP28 Barrierefreiheit (${scheme === "light" ? "hell" : "dunkel"}): Import-Dialog mit Prüfschritt, Datei per Tastatur, Zustände als Text, Fokus kehrt zurück`, async ({
      page,
    }, testInfo) => {
      await page.emulateMedia({ colorScheme: scheme });
      const d = await PromptImportDialog.open(page);
      await expectAccessible(page, testInfo, `prompt-import-leer-${scheme}`);
      const file = {
        prompts: [
          { titel: `Bereit ${uniq()}`, text: "Für {{Wer}}, Rückruf unter 0171 2345678" },
          { titel: "Absage höflich formulieren", text: "x" },
          { titel: "", text: "Fehler" },
        ],
      };
      await d.dialog.getByRole("button", { name: "Datei auswählen" }).focus();
      const [chooser] = await Promise.all([page.waitForEvent("filechooser"), page.keyboard.press("Enter")]);
      await chooser.setFiles({ name: "gemischt.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(file)) });
      await d.category.selectOption("kat-schreiben");
      await expect(d.entries).toHaveCount(3);
      await d.entry(0).getByRole("button", { name: "Vorschau" }).click();
      await expect(d.entry(0).getByRole("button", { name: "Weniger" })).toHaveAttribute("aria-expanded", "true");
      await d.entry(2).getByRole("button", { name: "Vorschau" }).click();
      await expectAccessible(page, testInfo, `prompt-import-pruefung-${scheme}`);
      // Zustände stehen als Text da, nicht nur als Farbe oder Symbol.
      await expect(d.entry(0)).toContainText("bereit");
      await expect(d.entry(0)).toContainText("Hinweis: Echte Daten?");
      await expect(d.entry(1)).toContainText("wird übersprungen");
      await expect(d.entry(2)).toContainText("Fehler:");
      await page.keyboard.press("Escape");
      await expect(d.dialog).toBeHidden();
      await expect(page.getByRole("button", { name: "Importieren", exact: true })).toBeFocused();
    });
  }

  test("FP29 Export im Format der Musterdatei: alle (mit Kategorie) und je Kategorie; wieder importiert ergibt dieselben Prompts", async ({ page, admin }) => {
    const data = await admin.fundus();
    await FundusAdminPage.open(page, "Prompts");
    const all = await download(page, () => page.getByRole("button", { name: "Alle exportieren" }).click());
    expect(all.name).toBe("freebie-prompts-alle-prompts.json");
    expect(all.json).toMatchObject({ format: "freebie-prompts", version: 1, name: "Alle Prompts" });
    expect(all.json.prompts).toHaveLength(data.prompts.length);
    expect(all.json.prompts.every((p) => typeof p.kategorie === "string")).toBe(true);

    const schreiben = await download(page, () => page.getByRole("button", { name: "„Schreiben“ exportieren" }).click());
    expect(schreiben.name).toBe("freebie-prompts-schreiben.json");
    const own = data.prompts.filter((p) => p.categoryId === "kat-schreiben").sort((a, b) => a.sortOrder - b.sortOrder);
    expect(schreiben.json.prompts.map((p) => p.titel)).toEqual(own.map((p) => p.title));
    expect(schreiben.json.prompts.some((p) => "kategorie" in p)).toBe(false);

    // Rundlauf: in eine neue Kategorie importieren.
    await page.getByRole("button", { name: "Importieren", exact: true }).click();
    const d = new PromptImportDialog(page);
    await d.choose(schreiben.json, schreiben.name);
    await expect(d.newName).toHaveValue("Schreiben");
    await expect(d.dialog.getByText("Die Kategorie „Schreiben“ gibt es schon – wähle sie oben aus.")).toBeVisible();
    const name = `Kopie ${uniq()}`;
    await d.newName.fill(name);
    await expect(d.summary).toHaveText(`${own.length} Prompts in der Datei: ${own.length} werden importiert.`);
    await d.importAll();
    const after = await admin.fundus();
    const cat = after.categories.find((c) => c.name === name)!;
    const fields = (list: typeof data.prompts) => list.map(({ title, description, text, placeholders, enabled }) => ({ title, description, text, placeholders, enabled }));
    expect(fields(after.prompts.filter((p) => p.categoryId === cat.id).sort((a, b) => a.sortOrder - b.sortOrder))).toEqual(fields(own));
  });
});

test("PR14 Reservierte Platzhalternamen ({{constructor}}, {{__proto__}}) bleiben Text: Hinweis im Admin-Dialog, die Maske im Chat bricht nicht", async ({
  page,
  admin,
  browser,
  baseURL,
  ip,
}) => {
  const title = `Reserviert ${uniq()}`;
  const id = await admin.createPrompt({ title, categoryId: "kat-schreiben", text: "Hallo {{constructor}} und {{__proto__}}, schreib an {{Name}}." });
  const p = await FundusAdminPage.open(page, "Prompts");
  await page.getByRole("button", { name: `„${title}“ bearbeiten` }).click();
  await expect(p.promptDialog.getByText("„{{constructor}}“: dieser Name ist reserviert (Zeile 1) – bleibt als Text stehen.")).toBeVisible();
  await expect(p.promptDialog.locator("fieldset[data-platzhalter]")).toHaveCount(1);

  const chat = await openChat(browser, baseURL!, guestIp(ip));
  const tab = new PromptsTab(chat.page);
  await tab.open();
  await tab.choose(id);
  const mask = new PromptMask(chat.page);
  await expect(mask.dialog.locator("label")).toHaveText(["Name"]);
  await mask.field("Name").fill("Frau Lind");
  await mask.button("Einfügen").click();
  await expect(chat.composer).toHaveValue("Hallo {{constructor}} und {{__proto__}}, schreib an Frau Lind.");
});
