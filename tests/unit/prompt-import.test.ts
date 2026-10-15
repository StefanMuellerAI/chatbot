import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { getDb, schema } from "@/lib/db/client";
import { fundusRevision, importPrompts, listCategories, listPrompts } from "@/lib/fundus/store";
import { FUNDUS_LIMITS } from "@/lib/shared/fundus";
import { fillPrompt, parsePrompt, PROMPT_LIMITS, resolvePlaceholders, validatePrompt } from "@/lib/shared/placeholders";
import {
  convertPlaceholders,
  decodePromptFile,
  entryStates,
  exportFileName,
  parsePromptJson,
  PROMPT_FILE,
  PROMPT_MUSTER,
  promptFile,
  promptFileText,
  readPromptLibrary,
  type PromptFields,
} from "@/lib/shared/prompt-import";

// Prompt-Bibliotheken importieren (Plan: PROMPT-IMPORT-PLAN.md).

const one = (entry: unknown, style?: Parameters<typeof readPromptLibrary>[1]) => readPromptLibrary({ prompts: [entry] }, style).entries[0];
const unique = (name: string) => `${name} ${Math.random().toString(36).slice(2, 8)}`;

describe("Prompt-Import: Musterdatei", () => {
  it("liest sich ohne Fehler und Hinweise: 3 Prompts mit jeder Art von Platzhalter", () => {
    const report = readPromptLibrary(JSON.parse(promptFileText(PROMPT_MUSTER)));
    expect(report.error).toBeNull();
    expect(report.hints).toEqual([]);
    expect(report.name).toBe("Meine Prompt-Bibliothek");
    expect(report.entries).toHaveLength(3);
    for (const e of report.entries) {
      expect(e.errors).toEqual([]);
      expect(e.hints).toEqual([]);
    }
    const [absage, mail, einfach] = report.entries.map((e) => e.fields!);
    expect(absage.placeholders).toEqual({ empfaenger: { hint: "z. B. Frau Lind" }, anliegen: { hint: "z. B. Fristverlängerung" } });
    expect(mail.placeholders.anzahl).toEqual({ label: "Anzahl Punkte", type: "select", options: ["3", "5", "7"], default: "5" });
    expect(mail.placeholders.schwerpunkt).toEqual({ label: "Was ist dir wichtig?", type: "area" });
    expect(mail.text).toContain("\n");
    expect(einfach.placeholders).toEqual({});
    expect(report.entries.map((e) => e.fields!.enabled)).toEqual([true, true, true]);
  });

  it("nennt in der Anleitung dieselben Grenzen wie Freebie", () => {
    const text = PROMPT_MUSTER.anleitung!.join(" ");
    expect(text).toContain(`Titel ${FUNDUS_LIMITS.promptTitle} Zeichen`);
    expect(text).toContain(`Beschreibung ${FUNDUS_LIMITS.promptDescription}`);
    expect(text).toContain(`Text ${PROMPT_LIMITS.text.toLocaleString("de-DE")}`);
    expect(text).toContain(`${PROMPT_LIMITS.placeholders} Platzhalter je Prompt`);
    expect(text).toContain(`${PROMPT_LIMITS.options} Werte je Auswahl`);
  });

  it("Export und Import ergeben dieselben Prompts (Rundlauf)", () => {
    const fields = readPromptLibrary(PROMPT_MUSTER).entries.map((e) => e.fields!);
    const changed: PromptFields[] = [...fields, { title: "Aus", description: "", text: "Nur {{X}}", placeholders: { x: {} }, enabled: false }];
    const file = JSON.parse(promptFileText(promptFile("Sicherung", changed.map((f) => ({ ...f, category: "Schreiben" })))));
    expect(file.format).toBe(PROMPT_FILE.format);
    expect(file.prompts[3]).toEqual({ titel: "Aus", text: "Nur {{X}}", aktiv: false, kategorie: "Schreiben" });
    const back = readPromptLibrary(file);
    expect(back.entries.map((e) => e.fields)).toEqual(changed);
    expect(back.hints).toEqual(["Das Feld „kategorie“ wird ignoriert – alle Prompts kommen in die Kategorie, die du hier wählst."]);
  });

  it("schlägt Dateinamen für den Export vor", () => {
    expect(exportFileName("Bibliothek Müller")).toBe("freebie-prompts-bibliothek-mueller.json");
    expect(exportFileName("📚")).toBe("freebie-prompts-export.json");
  });
});

describe("Prompt-Import: Aufbau der Datei", () => {
  it("nimmt den Umschlag oder nur die Liste", () => {
    expect(readPromptLibrary([{ titel: "A", text: "a" }]).entries[0].fields?.title).toBe("A");
    expect(readPromptLibrary({ prompts: [{ titel: "A", text: "a" }] }).entries).toHaveLength(1);
  });

  it("meldet falsche Dateien verständlich", () => {
    const err = (data: unknown) => readPromptLibrary(data).error;
    expect(err({ format: "andere-app", prompts: [] })).toContain("keine Prompt-Bibliothek für Freebie");
    expect(err({ format: "freebie-prompts", version: 2, prompts: [{}] })).toContain("neueren Freebie-Version");
    expect(err({ format: "freebie-prompts", version: "1", prompts: [{}] })).toContain("Unbekannte Version");
    expect(err({ format: "freebie-prompts", version: 0, prompts: [{}] })).toContain("Unbekannte Version");
    expect(err({ format: "freebie-prompts" })).toBe("In der Datei stehen keine Prompts.");
    expect(err({ titel: "A" })).toContain("keine Prompt-Bibliothek");
    expect(err({ prompts: "A" })).toContain("„prompts“ muss eine Liste sein");
    expect(err({ prompts: [] })).toBe("In der Datei stehen keine Prompts.");
    expect(err([])).toBe("In der Datei stehen keine Prompts.");
    for (const v of ["text", 3, true, null, undefined]) expect(err(v)).toContain("keine Prompt-Bibliothek");
    expect(err(Array.from({ length: 501 }, () => ({ titel: "x", text: "x" })))).toBe("Höchstens 500 Prompts je Datei – in der Datei stehen 501.");
    expect(err(Array.from({ length: 500 }, () => ({ titel: "x", text: "x" })))).toBeNull();
  });

  it("liest deutsche und englische Feldnamen; unbekannte Felder und „kategorie“ als Hinweis", () => {
    const report = readPromptLibrary({
      format: "freebie-prompts",
      exportiert: "heute",
      prompts: [
        { title: "Englisch", description: "d", prompt: "Hallo {{Name}}", placeholders: { Name: { label: "Wer?", type: "area" } }, enabled: false, tags: ["x"] },
        { titel: "Deutsch", text: "t", kategorie: "Alt", autor: "ich" },
      ],
    });
    expect(report.entries[0].fields).toEqual({ title: "Englisch", description: "d", text: "Hallo {{Name}}", placeholders: { name: { label: "Wer?", type: "area" } }, enabled: false });
    expect(report.hints).toContain("Das Feld „kategorie“ wird ignoriert – alle Prompts kommen in die Kategorie, die du hier wählst.");
    expect(report.hints.find((h) => h.startsWith("Unbekannte Felder"))).toBe("Unbekannte Felder werden ignoriert: exportiert, tags, autor");
  });

  it("übernimmt „name“ als Vorschlag für die Kategorie (gekürzt, ohne Steuerzeichen)", () => {
    expect(readPromptLibrary({ name: " Bibliothek\u0007  Müller ", prompts: [{ titel: "a", text: "a" }] }).name).toBe("Bibliothek Müller");
    expect(readPromptLibrary({ name: "x".repeat(90), prompts: [{ titel: "a", text: "a" }] }).name).toHaveLength(FUNDUS_LIMITS.categoryName);
  });
});

describe("Prompt-Import: Einträge", () => {
  it("meldet fehlende und falsche Felder je Eintrag", () => {
    expect(one("Hallo").errors).toEqual(["Kein Prompt – erwartet wird ein Objekt mit „titel“ und „text“."]);
    expect(one({ text: "a" }).errors).toEqual(["Titel: darf nicht leer sein"]);
    expect(one({ titel: "a" }).errors).toEqual(["Prompt-Text: darf nicht leer sein"]);
    expect(one({ titel: ["a"], text: "a" }).errors[0]).toBe("Titel: bitte als Text in Anführungszeichen");
    expect(one({ titel: "a", text: "a", aktiv: "ja" }).errors).toEqual(["aktiv: bitte true oder false (ohne Anführungszeichen)"]);
    expect(one({ titel: "a", text: "a", platzhalter: ["x"] }).errors[0]).toContain("platzhalter: bitte als Objekt");
    expect(one({ titel: 7, text: 8 }).fields).toMatchObject({ title: "7", text: "8" });
    expect(one({ titel: "a", text: "a", beschreibung: null, aktiv: null, platzhalter: null }).fields).toMatchObject({ description: "", enabled: true });
  });

  it("prüft die Grenzen genau an der Grenze", () => {
    expect(one({ titel: "t".repeat(80), text: "a" }).errors).toEqual([]);
    expect(one({ titel: "t".repeat(81), text: "a" }).errors).toEqual(["Titel: höchstens 80 Zeichen"]);
    expect(one({ titel: "t", beschreibung: "b".repeat(200), text: "a" }).errors).toEqual([]);
    expect(one({ titel: "t", beschreibung: "b".repeat(201), text: "a" }).errors).toEqual(["Kurzbeschreibung: höchstens 200 Zeichen"]);
    expect(one({ titel: "t", text: "a".repeat(8000) }).errors).toEqual([]);
    expect(one({ titel: "t", text: "a".repeat(8001) }).errors).toEqual(["Prompt-Text: höchstens 8.000 Zeichen"]);
    const many = (n: number) => Array.from({ length: n }, (_, i) => `{{P${i}}}`).join(" ");
    expect(one({ titel: "t", text: many(20) }).errors).toEqual([]);
    expect(one({ titel: "t", text: many(21) }).errors).toEqual(["Höchstens 20 Platzhalter – im Text stehen 21."]);
  });

  it("ordnet Einstellungen dem Platzhalter zu – wie geschrieben, anders geschrieben oder mit Klammern", () => {
    const e = one({
      titel: "t",
      text: "{{Empfänger}} {{THEMA}} {{Ton}}",
      platzhalter: { empfaenger: { hinweis: "a" }, "[THEMA]": { beschriftung: "Thema" }, "{{Ton}}": { art: "Auswahl", werte: ["kurz", 3], standard: 3 } },
    });
    expect(e.errors).toEqual([]);
    expect(e.fields!.placeholders).toEqual({ empfaenger: { hint: "a" }, thema: { label: "Thema" }, ton: { type: "select", options: ["kurz", "3"], default: "3" } });
  });

  it("weist auf Einstellungen ohne Platzhalter und doppelte Angaben hin", () => {
    const e = one({ titel: "t", text: "{{A}}", platzhalter: { A: { hinweis: "1" }, a: { hinweis: "2" }, B: {} } });
    expect(e.errors).toEqual([]);
    expect(e.fields!.placeholders).toEqual({ a: { hint: "1" } });
    expect(e.hints).toEqual(["„a“ ist doppelt beschrieben – es gilt die erste Angabe.", "Einstellungen für „B“ ohne Platzhalter im Text – werden ignoriert."]);
  });

  it("prüft Auswahl, Art und Werte wie der Admin-Dialog", () => {
    const err = (setting: unknown) => one({ titel: "t", text: "{{A}}", platzhalter: { A: setting } }).errors;
    expect(err({ art: "auswahl", werte: ["x"] })).toEqual(["Platzhalter „A“: eine Auswahl braucht mindestens 2 Werte"]);
    expect(err({ werte: ["x", "y"], standard: "z" })).toEqual(["Platzhalter „A“: der Standardwert muss einer der Auswahlwerte sein"]);
    expect(err({ werte: ["x", "X"] })).toEqual(["Platzhalter „A“: ein Auswahlwert kommt doppelt vor"]);
    expect(err({ werte: Array.from({ length: 21 }, (_, i) => `w${i}`) })).toEqual(["Platzhalter „A“: höchstens 20 Auswahlwerte"]);
    expect(err({ werte: "x, y" })).toEqual(['Platzhalter „A“, werte: bitte als Liste, z. B. ["kurz", "ausführlich"]']);
    expect(err({ art: "liste" })).toEqual(["Platzhalter „A“: unbekannte art „liste“ (erlaubt: einzeilig, mehrzeilig, auswahl)"]);
    expect(err({ art: "constructor" })[0]).toContain("unbekannte art");
    expect(err("hinweis")).toEqual(['Platzhalter „A“: bitte als Objekt, z. B. { "hinweis": "…" }']);
    expect(err({ beschriftung: { x: 1 } })).toEqual(["Platzhalter „A“, beschriftung: bitte als Text"]);
    expect(err({ beschriftung: "b".repeat(61) })).toEqual(["Platzhalter „A“, Beschriftung: höchstens 60 Zeichen"]);
    expect(err({ art: "mehrzeilig", hinweis: "h" })).toEqual([]);
  });

  it("vereinheitlicht Zeilenenden und entfernt Steuerzeichen; HTML bleibt Text", () => {
    const e = one({ titel: "Ti\u0000tel\nzwei", beschreibung: "a\r\nb\u0007", text: "<script>alert(1)</script>\r\n\tZeile\u0008 {{A}}" });
    expect(e.fields).toMatchObject({ title: "Ti tel zwei", description: "a\nb", text: "<script>alert(1)</script>\n\tZeile {{A}}" });
  });

  it("weist auf Stellen hin, die wie Platzhalter aussehen, und auf echte Daten", () => {
    expect(one({ titel: "t", text: "Hallo {{Na!me}}" }).hints[0]).toContain("kein gültiger Platzhalter");
    expect(one({ titel: "t", text: "Schreibe über [THEMA] für [ZIELGRUPPE]." }).hints).toEqual([
      "Der Text enthält Stellen wie „[Name]“ – sollen das Platzhalter sein? Dann oben die Schreibweise „[Name]“ wählen.",
    ]);
    expect(one({ titel: "t", text: "Mail an max.mustermann@gmx.de" }).hints).toEqual(["Echte Daten? E-Mail-Adresse mit echter Domain: max.mustermann@gmx.de"]);
    expect(one({ titel: "t", text: "Mail an lea@example.org" }).hints).toEqual([]);
  });

  it("lässt reservierte Namen als Text stehen – auch aus fremden Dateien", () => {
    const e = one({ titel: "t", text: "{{constructor}} {{__proto__}} {{Name}}", platzhalter: { constructor: { art: "mehrzeilig" }, __proto__: { hinweis: "x" } } });
    expect(e.errors).toEqual([]);
    expect(e.placeholderCount).toBe(1);
    expect(e.fields!.placeholders).toEqual({ name: {} });
    expect(e.hints.filter((h) => h.includes("reserviert"))).toHaveLength(2);
  });
});

describe("Prompt-Import: Schreibweisen von Platzhaltern", () => {
  it("wandelt [Name], {Name} und <Name> um", () => {
    expect(convertPlaceholders("Über [THEMA] für [Ziel gruppe].", "eckig")).toBe("Über {{THEMA}} für {{Ziel gruppe}}.");
    expect(convertPlaceholders("Über {Thema} und {{Schon}}.", "einfach")).toBe("Über {{Thema}} und {{Schon}}.");
    expect(convertPlaceholders("Über <Thema> für <Ziel>.", "spitz")).toBe("Über {{Thema}} für {{Ziel}}.");
    expect(convertPlaceholders("Bleibt [Thema]", "doppelt")).toBe("Bleibt [Thema]");
  });

  it("lässt stehen, was kein Platzhalter sein kann", () => {
    const keep = (text: string, style: "eckig" | "einfach" | "spitz") => expect(convertPlaceholders(text, style)).toBe(text);
    keep("Quelle [1] und [12]", "eckig");
    keep("[Link](https://example.org) und ![Bild](a.png) und [Wiki][ref] und [[Seite]]", "eckig");
    keep("- [x] erledigt - [ ] offen", "eckig");
    keep("[mit: Doppelpunkt] und [zu " + "x".repeat(41) + "]", "eckig");
    keep('JSON {"a": 1} und {1} und {{Name}}', "einfach");
    keep("Zeile<br>neu, <b>fett</b>, <https://example.org>, a < b > c", "spitz");
  });

  it("liest Dateien in anderer Schreibweise, wenn sie gewählt ist", () => {
    const e = one({ titel: "t", text: "Schreibe über [THEMA].", platzhalter: { "[THEMA]": { hinweis: "z. B. KI" } } }, "eckig");
    expect(e.fields).toMatchObject({ text: "Schreibe über {{THEMA}}.", placeholders: { thema: { hint: "z. B. KI" } } });
    expect(e.hints).toEqual([]);
  });
});

describe("Prompt-Import: Zustand je Eintrag", () => {
  it("erkennt Dubletten in der Kategorie und weiter oben in der Datei (groß/klein, ä/ae)", () => {
    const report = readPromptLibrary([
      { titel: "Absage", text: "a" },
      { titel: "absage ", text: "b" },
      { titel: "Größe", text: "c" },
      { titel: "", text: "d" },
      { titel: "Neu", text: "e" },
    ]);
    expect(entryStates(report.entries, ["GROESSE"])).toEqual([
      { state: "bereit" },
      { state: "doppelt", reason: "steht weiter oben schon in der Datei" },
      { state: "doppelt", reason: "gibt es in der Kategorie schon" },
      { state: "fehler", reason: "Titel: darf nicht leer sein" },
      { state: "bereit" },
    ]);
    expect(entryStates(report.entries, []).filter((s) => s.state === "bereit")).toHaveLength(3);
  });
});

describe("Prompt-Import: Datei einlesen", () => {
  const bytes = (s: string) => new TextEncoder().encode(s);

  it("nimmt UTF-8 mit und ohne BOM", () => {
    expect(decodePromptFile(bytes("﻿[1]"))).toEqual({ text: "[1]" });
    expect(decodePromptFile(bytes('{"a":"ä"}'))).toEqual({ text: '{"a":"ä"}' });
  });

  it("meldet Windows-1252, leere und zu große Dateien", () => {
    expect(decodePromptFile(new Uint8Array([0x5b, 0x22, 0xe4, 0x22, 0x5d]))).toEqual({
      error: "Die Datei ist nicht als UTF-8 gespeichert. Bitte als UTF-8 speichern und erneut wählen.",
    });
    expect(decodePromptFile(bytes(""))).toEqual({ error: "Die Datei ist leer." });
    expect(decodePromptFile(bytes(" \n\t "))).toEqual({ error: "Die Datei ist leer." });
    expect(decodePromptFile(new Uint8Array(PROMPT_FILE.maxBytes + 1))).toEqual({ error: "Die Datei ist zu groß (höchstens 4 MB)." });
  });

  it("meldet kaputtes JSON mit Zeile und Spalte", () => {
    const res = parsePromptJson('{\n  "prompts": [\n    { "titel": "a", },\n  ]\n}');
    expect("error" in res && res.error).toMatch(/^Die Datei ist kein gültiges JSON \(Zeile 3, Spalte \d+\)\. Häufige Ursachen/);
    expect(parsePromptJson("[1, 2]")).toEqual({ data: [1, 2] });
  });

  it("wirft nie – egal was in der Datei steht (Zufallstest)", () => {
    let seed = 7;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2 ** 31;
      return seed / 2 ** 31;
    };
    const values: unknown[] = [null, true, 0, -1, 1.5, "", "x", "{{A}}", "[B]", [], {}, ["a"], { art: "auswahl" }, "constructor", "__proto__"];
    const keys = ["titel", "text", "platzhalter", "aktiv", "beschreibung", "art", "werte", "standard", "prompts", "format", "version", "__proto__", "constructor"];
    const randomValue = (depth: number): unknown => {
      if (depth > 3 || rand() < 0.5) return values[Math.floor(rand() * values.length)];
      if (rand() < 0.3) return Array.from({ length: Math.floor(rand() * 4) }, () => randomValue(depth + 1));
      return Object.fromEntries(Array.from({ length: Math.floor(rand() * 5) }, () => [keys[Math.floor(rand() * keys.length)], randomValue(depth + 1)]));
    };
    const muster = promptFileText(PROMPT_MUSTER);
    for (let i = 0; i < 1500; i++) {
      let parsed: unknown;
      if (i % 3 === 0) parsed = randomValue(0);
      else if (i % 3 === 1) parsed = { prompts: [randomValue(1), randomValue(1)] };
      else {
        // Abgeschnittene Musterdatei: meist kaputtes JSON, manchmal ein halber Prompt.
        const res = parsePromptJson(muster.slice(0, Math.floor(rand() * muster.length)) + '"}]}');
        parsed = "data" in res ? res.data : undefined;
      }
      for (const style of ["doppelt", "eckig", "einfach", "spitz"] as const) {
        const report = readPromptLibrary(parsed, style);
        expect(report.error === null || report.entries.length === 0).toBe(true);
        for (const e of report.entries) expect(Boolean(e.fields) !== e.errors.length > 0).toBe(true);
        entryStates(report.entries, ["x"]);
      }
    }
  });
});

describe("Platzhalter: reservierte Namen", () => {
  it("sind keine Platzhalter und brechen weder Prüfung noch Ausfüllen", () => {
    const text = "A {{constructor}} B {{__proto__}} C {{Prototype}} D {{toString}}";
    const parsed = parsePrompt(text);
    expect(parsed.placeholders.map((p) => p.key)).toEqual(["tostring"]);
    expect(parsed.warnings).toHaveLength(3);
    expect(parsed.warnings[0]).toBe("„{{constructor}}“: dieser Name ist reserviert (Zeile 1) – bleibt als Text stehen.");
    const settings = JSON.parse('{"__proto__": {"label": "x"}, "constructor": {"type": "area"}, "tostring": {"hint": "h"}}');
    const checked = validatePrompt(text, settings);
    expect(checked.errors).toEqual([]);
    expect(checked.settings).toEqual({ tostring: { hint: "h" } });
    expect(resolvePlaceholders(text, settings).map((p) => [p.key, p.hint])).toEqual([["tostring", "h"]]);
    expect(fillPrompt(text, { tostring: "z" })).toBe("A {{constructor}} B {{__proto__}} C {{Prototype}} D z");
    // Geerbtes zählt nicht als Einstellung.
    expect(resolvePlaceholders("{{valueOf}}", Object.create({ valueof: { label: "geerbt" } }))[0].label).toBe("valueOf");
  });
});

describe("Prompt-Import: Speichern", () => {
  const entry = (title: string, extra: Partial<PromptFields> = {}): PromptFields => ({ title, description: "", text: `${title} {{Wer}}`, placeholders: {}, enabled: true, ...extra });

  it("hängt an eine vorhandene Kategorie an (Reihenfolge der Datei) und erhöht die Revision einmal", async () => {
    const before = await fundusRevision();
    const a = unique("Import A");
    const b = unique("Import B");
    const res = await importPrompts([entry(a), entry(b, { enabled: false })], { categoryId: "kat-schreiben", newCategory: null }, { inactive: false });
    expect(res).toMatchObject({ categoryId: "kat-schreiben", categoryName: "Schreiben", created: 2, skipped: [] });
    expect(await fundusRevision()).toBe(before + 1);
    const list = (await listPrompts({ includeDisabled: true })).filter((p) => p.categoryId === "kat-schreiben");
    expect(list.slice(-2).map((p) => [p.title, p.enabled])).toEqual([
      [a, true],
      [b, false],
    ]);
    expect(list.at(-1)!.sortOrder).toBeGreaterThan(list.at(-2)!.sortOrder);
    expect(list.at(-1)!.placeholders).toEqual({ wer: {} });
  });

  it("legt eine neue Kategorie nur mit Prompts an; Dubletten und „zunächst inaktiv“", async () => {
    const name = unique("Bibliothek");
    const res = await importPrompts([entry("Eins"), entry("eins "), entry("Zwei")], { categoryId: null, newCategory: `  ${name} ` }, { inactive: true });
    expect(res.created).toBe(2);
    expect(res.skipped).toEqual([{ title: "eins", reason: "gibt es schon" }]);
    const cat = (await listCategories()).find((c) => c.name === name)!;
    expect(cat).toMatchObject({ id: res.categoryId, prompts: 2, activePrompts: 0 });
    expect(Math.max(...(await listCategories()).map((c) => c.sortOrder))).toBe(cat.sortOrder);

    const again = await importPrompts([entry("EINS"), entry("Drei")], { categoryId: res.categoryId, newCategory: null }, { inactive: false });
    expect(again).toMatchObject({ created: 1, skipped: [{ title: "EINS", reason: "gibt es schon" }] });

    const empty = await importPrompts([entry("Eins")], { categoryId: res.categoryId, newCategory: null }, { inactive: false });
    expect(empty.created).toBe(0);
    await expect(importPrompts([entry("x")], { categoryId: null, newCategory: name.toUpperCase() }, { inactive: false })).rejects.toThrow("gibt es schon");
    // Nichts zu importieren: die neue Kategorie entsteht gar nicht erst.
    const nothing = unique("Leer");
    expect(await importPrompts([], { categoryId: null, newCategory: nothing }, { inactive: false })).toMatchObject({ categoryId: null, created: 0 });
    expect((await listCategories()).some((c) => c.name === nothing)).toBe(false);
  });

  it("weist manipulierte Einträge und verschwundene Kategorien ab – ohne etwas anzulegen", async () => {
    const count = (await listPrompts({ includeDisabled: true })).length;
    await expect(importPrompts([entry("ok"), entry("x".repeat(81))], { categoryId: "kat-schreiben", newCategory: null }, { inactive: false })).rejects.toThrow(
      "Eintrag 2 („" + "x".repeat(81) + "“): Titel: höchstens 80 Zeichen",
    );
    await expect(importPrompts([entry("ok")], { categoryId: "kat-weg", newCategory: null }, { inactive: false })).rejects.toThrow(
      "Die Kategorie gibt es nicht mehr – bitte neu wählen.",
    );
    expect((await listPrompts({ includeDisabled: true })).length).toBe(count);
  });

  it("zwei gleiche Importe gleichzeitig legen nichts doppelt an", async () => {
    const name = unique("Gleichzeitig");
    const list = [entry("Gleich A"), entry("Gleich B")];
    const first = await importPrompts(list, { categoryId: null, newCategory: name }, { inactive: false });
    const [x, y] = await Promise.all([
      importPrompts([...list, entry("Gleich C")], { categoryId: first.categoryId, newCategory: null }, { inactive: false }),
      importPrompts([...list, entry("Gleich C")], { categoryId: first.categoryId, newCategory: null }, { inactive: false }),
    ]);
    expect(x.created + y.created).toBe(1);
    expect((await listPrompts({ includeDisabled: true })).filter((p) => p.categoryId === first.categoryId)).toHaveLength(3);
  });

  it("hält die Grenze von 500 Prompts: nichts angelegt, auch keine neue Kategorie", async () => {
    const db = await getDb();
    const existing = (await listPrompts({ includeDisabled: true })).length;
    const fill = Array.from({ length: FUNDUS_LIMITS.prompts - existing - 5 }, (_, i) => ({
      id: `prompt-import-fuellung-${i}`,
      categoryId: "kat-recherche",
      title: `Füllung ${i}`,
      text: "x",
      placeholders: {},
    }));
    for (let i = 0; i < fill.length; i += 100) await db.insert(schema.prompts).values(fill.slice(i, i + 100));
    const name = unique("Zu voll");
    const ten = Array.from({ length: 10 }, (_, i) => entry(`Voll ${i}`));
    await expect(importPrompts(ten, { categoryId: null, newCategory: name }, { inactive: false })).rejects.toThrow(
      "Platz für noch 5 Prompts – die Datei enthält 10 importierbare. Bitte aufteilen oder Prompts löschen.",
    );
    expect((await listCategories()).some((c) => c.name === name)).toBe(false);
    const ok = await importPrompts(ten.slice(0, 5), { categoryId: "kat-recherche", newCategory: null }, { inactive: false });
    expect(ok.created).toBe(5);
    expect((await listPrompts({ includeDisabled: true })).length).toBe(FUNDUS_LIMITS.prompts);
    await db.execute(sql`DELETE FROM prompts WHERE id LIKE 'prompt-import-fuellung-%' OR title LIKE 'Voll %'`);
  });
});
