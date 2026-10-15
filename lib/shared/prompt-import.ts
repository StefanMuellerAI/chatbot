// Prompt-Bibliotheken als JSON (Plan: PROMPT-IMPORT-PLAN.md): Musterdatei, Datei lesen und prüfen, Export im selben
// Format. Ohne Server-Abhängigkeiten – der Browser zeigt damit den Prüfschritt, der Server prüft mit denselben Regeln.
import { realDataHints } from "@/lib/fundus/hints";
import { fold } from "@/lib/library/search";
import { FUNDUS_LIMITS } from "@/lib/shared/fundus";
import {
  parsePrompt,
  PLACEHOLDER_TYPES,
  placeholderKey,
  PROMPT_LIMITS,
  validatePrompt,
  type PlaceholderSetting,
  type PlaceholderSettings,
  type PlaceholderType,
} from "@/lib/shared/placeholders";

export const PROMPT_FILE = {
  format: "freebie-prompts",
  version: 1,
  /** Unter der Grenze von Vercel-Funktionen (4,5 MB je Anfrage). */
  maxBytes: 4 * 1024 * 1024,
  maxEntries: FUNDUS_LIMITS.prompts,
} as const;

const nf = new Intl.NumberFormat("de-DE");

// ---------------------------------------------------------------- Felder eines Prompts (Admin-Dialog, Import, Server)

export interface PromptFields {
  title: string;
  description: string;
  text: string;
  placeholders: PlaceholderSettings;
  enabled: boolean;
}

/**
 * Dieselben Regeln wie beim Anlegen im Admin. `fieldErrors` betreffen Titel und Beschreibung, `errors` alles
 * (zuerst die Felder, dann der Text); `clean` sind die bereinigten Felder.
 */
export function checkPromptFields(input: PromptFields): { fieldErrors: string[]; errors: string[]; warnings: string[]; clean: PromptFields } {
  const fieldErrors: string[] = [];
  const title = input.title.replace(/\s+/g, " ").trim();
  if (!title) fieldErrors.push("Titel: darf nicht leer sein");
  else if (title.length > FUNDUS_LIMITS.promptTitle) fieldErrors.push(`Titel: höchstens ${FUNDUS_LIMITS.promptTitle} Zeichen`);
  const description = input.description.trim();
  if (description.length > FUNDUS_LIMITS.promptDescription) fieldErrors.push(`Kurzbeschreibung: höchstens ${FUNDUS_LIMITS.promptDescription} Zeichen`);
  const checked = validatePrompt(input.text, input.placeholders);
  return {
    fieldErrors,
    errors: [...fieldErrors, ...checked.errors],
    warnings: checked.warnings,
    clean: { title, description, text: input.text, placeholders: checked.settings, enabled: input.enabled },
  };
}

/** Vergleichsschlüssel für Titel: ohne Groß/klein, ä = ae, ß = ss, Leerraum zusammengefasst. */
export function titleKey(title: string): string {
  return fold(title).replace(/\s+/g, " ").trim();
}

// ---------------------------------------------------------------- Schreibweisen von Platzhaltern

export type PlaceholderStyle = "doppelt" | "eckig" | "einfach" | "spitz";

export const PLACEHOLDER_STYLES: { id: PlaceholderStyle; label: string }[] = [
  { id: "doppelt", label: "{{Name}}" },
  { id: "eckig", label: "[Name]" },
  { id: "einfach", label: "{Name}" },
  { id: "spitz", label: "<Name>" },
];

const STYLE_PATTERN: Record<Exclude<PlaceholderStyle, "doppelt">, RegExp> = {
  // Nicht: [[…]], Bilder ![…], Links […](…) und Verweise […][ref].
  eckig: /(?<![[\]!\\])\[([^[\]\n]+)\](?![[(\]])/g,
  // Nicht: schon doppelte {{…}}.
  einfach: /(?<!\{)\{([^{}\n]+)\}(?!\})/g,
  spitz: /<([^<>\n]+)>/g,
};

const HTML_TAGS = new Set(
  "a abbr b blockquote br code dd del div dl dt em h1 h2 h3 h4 h5 h6 hr i img ins kbd li mark ol p pre q s small span strong sub sup table tbody td th thead tr u ul".split(" "),
);

function convertible(raw: string, style: PlaceholderStyle): boolean {
  const name = raw.trim();
  if (!name || name.length > PROMPT_LIMITS.name || !/^[\p{L}\p{N} _-]+$/u.test(name)) return false;
  // Fußnoten [1], Aufzählungen {2}, Checkboxen [x].
  if (/^\d+$/.test(name) || (style === "eckig" && /^x$/i.test(name))) return false;
  if (style === "spitz" && HTML_TAGS.has(name.toLowerCase())) return false;
  return true;
}

/** Wandelt `[Name]`, `{Name}` oder `<Name>` in `{{Name}}` um; was kein Platzhalter sein kann, bleibt stehen. */
export function convertPlaceholders(text: string, style: PlaceholderStyle): string {
  if (style === "doppelt") return text;
  return text.replace(STYLE_PATTERN[style], (match, name: string) => (convertible(name, style) ? `{{${name.trim()}}}` : match));
}

/** Schlüssel unter „platzhalter“ dürfen mit Klammern geschrieben sein: „[THEMA]“ meint „THEMA“. */
function bareName(key: string): string {
  return key
    .trim()
    .replace(/^\{\{([\s\S]*)\}\}$/, "$1")
    .replace(/^[[{<]([\s\S]*)[\]}>]$/, "$1")
    .trim();
}

// ---------------------------------------------------------------- Datei lesen

export interface ImportEntry {
  /** Stelle in der Datei (ab 0). */
  index: number;
  /** Anzeige: Titel oder „Eintrag 3“. */
  label: string;
  /** Bereinigte Felder (nur ohne Fehler). */
  fields: PromptFields | null;
  placeholderCount: number;
  errors: string[];
  hints: string[];
}

export interface LibraryReport {
  /** Fehler der ganzen Datei – dann gibt es keine Einträge. */
  error: string | null;
  /** Vorschlag für den Namen einer neuen Kategorie (Feld „name“). */
  name: string;
  entries: ImportEntry[];
  /** Hinweise zur ganzen Datei (ignorierte Felder). */
  hints: string[];
}

const NOT_A_LIBRARY = "Das ist keine Prompt-Bibliothek für Freebie – bitte das Muster verwenden.";
const NO_PROMPTS = "In der Datei stehen keine Prompts.";

const TOP_FIELDS = new Set(["format", "version", "name", "anleitung", "prompts"]);
const ENTRY_FIELDS: Record<keyof PromptFields, string[]> = {
  title: ["titel", "title"],
  description: ["beschreibung", "description"],
  text: ["text", "prompt"],
  placeholders: ["platzhalter", "placeholders"],
  enabled: ["aktiv", "enabled"],
};
const CATEGORY_FIELDS = ["kategorie", "category"];
const SETTING_FIELDS: Record<keyof PlaceholderSetting, string[]> = {
  label: ["beschriftung", "label"],
  hint: ["hinweis", "hint"],
  type: ["art", "type"],
  options: ["werte", "options"],
  default: ["standard", "default"],
};
const TYPE_NAMES: Record<string, PlaceholderType> = { einzeilig: "text", mehrzeilig: "area", auswahl: "select", text: "text", area: "area", select: "select" };
export const TYPE_EXPORT: Record<PlaceholderType, string> = { text: "einzeilig", area: "mehrzeilig", select: "auswahl" };

type Json = Record<string, unknown>;

function isObject(v: unknown): v is Json {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Erster vorhandener Schlüssel (deutsch vor englisch). */
function pick(obj: Json, names: string[]): { found: boolean; value: unknown } {
  for (const n of names) if (Object.hasOwn(obj, n)) return { found: true, value: obj[n] };
  return { found: false, value: undefined };
}

/** Steuerzeichen raus (Zeilenumbruch und Tab nur, wo erlaubt), Zeilenenden vereinheitlicht. */
function cleanText(s: string, keep: "none" | "lines" | "all"): string {
  const unified = s.replace(/\r\n?/g, "\n").replace(/\uFEFF/g, "");
  const ctrl = keep === "all" ? /[\u0000-\u0008\u000B-\u001F\u007F]/g : keep === "lines" ? /[\u0000-\u0009\u000B-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g;
  return unified.replace(ctrl, keep === "none" ? " " : "");
}

function readEntry(raw: unknown, index: number, style: PlaceholderStyle, unknown: Set<string>, ignoredCategory: { found: boolean }): ImportEntry {
  const entry: ImportEntry = { index, label: `Eintrag ${index + 1}`, fields: null, placeholderCount: 0, errors: [], hints: [] };
  if (!isObject(raw)) {
    entry.errors.push("Kein Prompt – erwartet wird ein Objekt mit „titel“ und „text“.");
    return entry;
  }
  const known = new Set([...Object.values(ENTRY_FIELDS).flat(), ...CATEGORY_FIELDS]);
  for (const key of Object.keys(raw)) if (!known.has(key)) unknown.add(key);
  if (pick(raw, CATEGORY_FIELDS).found) ignoredCategory.found = true;

  const str = (field: keyof PromptFields, label: string, keep: "none" | "lines" | "all"): string => {
    const { found, value } = pick(raw, ENTRY_FIELDS[field]);
    if (!found || value === null) return "";
    if (typeof value === "string") return cleanText(value, keep);
    if (typeof value === "number") return String(value);
    entry.errors.push(`${label}: bitte als Text in Anführungszeichen`);
    return "";
  };
  const title = str("title", "Titel", "none");
  if (title.trim()) entry.label = title.replace(/\s+/g, " ").trim();
  const description = str("description", "Beschreibung", "lines");
  const text = convertPlaceholders(str("text", "Text", "all"), style);

  let enabled = true;
  const aktiv = pick(raw, ENTRY_FIELDS.enabled);
  if (aktiv.found && aktiv.value !== null) {
    if (typeof aktiv.value === "boolean") enabled = aktiv.value;
    else entry.errors.push("aktiv: bitte true oder false (ohne Anführungszeichen)");
  }

  const parsed = parsePrompt(text);
  const inText = new Set(parsed.placeholders.map((p) => p.key));
  const settings: PlaceholderSettings = {};
  const rawSettings = pick(raw, ENTRY_FIELDS.placeholders);
  if (rawSettings.found && rawSettings.value !== null) {
    if (!isObject(rawSettings.value)) {
      entry.errors.push("platzhalter: bitte als Objekt, z. B. { \"Name\": { \"hinweis\": \"…\" } }");
    } else {
      for (const [rawName, value] of Object.entries(rawSettings.value)) {
        const name = bareName(rawName);
        const key = placeholderKey(name);
        if (!inText.has(key)) {
          entry.hints.push(`Einstellungen für „${name}“ ohne Platzhalter im Text – werden ignoriert.`);
          continue;
        }
        if (Object.hasOwn(settings, key)) {
          entry.hints.push(`„${name}“ ist doppelt beschrieben – es gilt die erste Angabe.`);
          continue;
        }
        const setting = readSetting(value, name, entry, unknown);
        if (setting) settings[key] = setting;
      }
    }
  }

  entry.placeholderCount = parsed.placeholders.length;
  entry.hints.push(...parsed.warnings);
  if (style === "doppelt" && parsed.placeholders.length === 0) {
    const other = PLACEHOLDER_STYLES.find((s) => s.id !== "doppelt" && parsePrompt(convertPlaceholders(text, s.id)).placeholders.length > 0);
    if (other) entry.hints.push(`Der Text enthält Stellen wie „${other.label}“ – sollen das Platzhalter sein? Dann oben die Schreibweise „${other.label}“ wählen.`);
  }
  for (const hint of realDataHints(`${title}\n${description}\n${text}`)) entry.hints.push(`Echte Daten? ${hint}`);

  const checked = checkPromptFields({ title, description, text, placeholders: settings, enabled });
  entry.errors.push(...checked.errors);
  if (!entry.errors.length) entry.fields = checked.clean;
  return entry;
}

function readSetting(value: unknown, name: string, entry: ImportEntry, unknown: Set<string>): PlaceholderSetting | null {
  if (value === null) return {};
  if (!isObject(value)) {
    entry.errors.push(`Platzhalter „${name}“: bitte als Objekt, z. B. { "hinweis": "…" }`);
    return null;
  }
  const known = new Set(Object.values(SETTING_FIELDS).flat());
  for (const key of Object.keys(value)) if (!known.has(key)) unknown.add(`platzhalter › ${key}`);
  const text = (field: keyof PlaceholderSetting, label: string): string | undefined => {
    const { found, value: v } = pick(value, SETTING_FIELDS[field]);
    if (!found || v === null) return undefined;
    if (typeof v === "string") return cleanText(v, "none");
    if (typeof v === "number") return String(v);
    entry.errors.push(`Platzhalter „${name}“, ${label}: bitte als Text`);
    return undefined;
  };
  const setting: PlaceholderSetting = {};
  const label = text("label", "beschriftung");
  if (label !== undefined) setting.label = label;
  const hint = text("hint", "hinweis");
  if (hint !== undefined) setting.hint = hint;
  const def = text("default", "standard");
  if (def !== undefined) setting.default = def;
  const art = text("type", "art");
  if (art !== undefined) {
    const name2 = art.trim().toLowerCase();
    const type = Object.hasOwn(TYPE_NAMES, name2) ? TYPE_NAMES[name2] : undefined;
    if (type && PLACEHOLDER_TYPES.includes(type)) setting.type = type;
    else entry.errors.push(`Platzhalter „${name}“: unbekannte art „${art}“ (erlaubt: einzeilig, mehrzeilig, auswahl)`);
  }
  const werte = pick(value, SETTING_FIELDS.options);
  if (werte.found && werte.value !== null) {
    if (!Array.isArray(werte.value) || werte.value.some((w) => typeof w !== "string" && typeof w !== "number")) {
      entry.errors.push(`Platzhalter „${name}“, werte: bitte als Liste, z. B. ["kurz", "ausführlich"]`);
    } else {
      setting.options = werte.value.map((w) => cleanText(String(w), "none"));
      if (!setting.type) setting.type = "select";
    }
  }
  return setting;
}

/**
 * Liest den Inhalt einer Datei (nach `JSON.parse`). Wirft nie: alles, was nicht passt, steht als Fehler oder
 * Hinweis im Ergebnis. `style` wandelt andere Platzhalter-Schreibweisen vorher um.
 */
export function readPromptLibrary(data: unknown, style: PlaceholderStyle = "doppelt"): LibraryReport {
  const report: LibraryReport = { error: null, name: "", entries: [], hints: [] };
  let list: unknown[];
  const unknown = new Set<string>();
  if (Array.isArray(data)) {
    list = data;
  } else if (isObject(data)) {
    if (Object.hasOwn(data, "format") && data.format !== PROMPT_FILE.format) return { ...report, error: NOT_A_LIBRARY };
    if (Object.hasOwn(data, "version")) {
      const v = data.version;
      if (typeof v !== "number" || !Number.isInteger(v) || v < 1) return { ...report, error: "Unbekannte Version der Datei – bitte das Muster verwenden." };
      if (v > PROMPT_FILE.version) return { ...report, error: "Die Datei stammt aus einer neueren Freebie-Version – bitte Freebie aktualisieren oder das Muster verwenden." };
    }
    if (!Object.hasOwn(data, "prompts")) return { ...report, error: Object.hasOwn(data, "format") ? NO_PROMPTS : NOT_A_LIBRARY };
    if (!Array.isArray(data.prompts)) return { ...report, error: "„prompts“ muss eine Liste sein: \"prompts\": [ { … }, { … } ]" };
    list = data.prompts;
    if (typeof data.name === "string") report.name = cleanText(data.name, "none").replace(/\s+/g, " ").trim().slice(0, FUNDUS_LIMITS.categoryName);
    for (const key of Object.keys(data)) if (!TOP_FIELDS.has(key)) unknown.add(key);
  } else {
    return { ...report, error: NOT_A_LIBRARY };
  }
  if (list.length === 0) return { ...report, error: NO_PROMPTS };
  if (list.length > PROMPT_FILE.maxEntries) {
    return { ...report, error: `Höchstens ${nf.format(PROMPT_FILE.maxEntries)} Prompts je Datei – in der Datei stehen ${nf.format(list.length)}.` };
  }
  const ignoredCategory = { found: false };
  report.entries = list.map((raw, i) => readEntry(raw, i, style, unknown, ignoredCategory));
  if (ignoredCategory.found) report.hints.push("Das Feld „kategorie“ wird ignoriert – alle Prompts kommen in die Kategorie, die du hier wählst.");
  if (unknown.size) report.hints.push(`Unbekannte Felder werden ignoriert: ${[...unknown].slice(0, 8).join(", ")}${unknown.size > 8 ? " …" : ""}`);
  return report;
}

export type EntryState = { state: "bereit" } | { state: "doppelt"; reason: string } | { state: "fehler"; reason: string };

/** Zustand je Eintrag für eine Zielkategorie: Fehler, schon vorhanden (dort oder weiter oben in der Datei), bereit. */
export function entryStates(entries: ImportEntry[], existingTitles: Iterable<string>): EntryState[] {
  const seen = new Set([...existingTitles].map(titleKey));
  const inFile = new Set<string>();
  return entries.map((e) => {
    if (!e.fields) return { state: "fehler", reason: e.errors[0] ?? "Fehler" };
    const key = titleKey(e.fields.title);
    if (seen.has(key)) return { state: "doppelt", reason: "gibt es in der Kategorie schon" };
    if (inFile.has(key)) return { state: "doppelt", reason: "steht weiter oben schon in der Datei" };
    inFile.add(key);
    return { state: "bereit" };
  });
}

// ---------------------------------------------------------------- Datei einlesen (Kodierung, JSON)

/** Bytes → Text: Größe, UTF-8 (mit oder ohne BOM), nicht leer. */
export function decodePromptFile(bytes: Uint8Array): { text: string } | { error: string } {
  if (bytes.byteLength > PROMPT_FILE.maxBytes) return { error: `Die Datei ist zu groß (höchstens ${PROMPT_FILE.maxBytes / 1024 / 1024} MB).` };
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return { error: "Die Datei ist nicht als UTF-8 gespeichert. Bitte als UTF-8 speichern und erneut wählen." };
  }
  text = text.replace(/^\uFEFF/, "");
  if (!text.trim()) return { error: "Die Datei ist leer." };
  return { text };
}

/** `JSON.parse` mit verständlicher Meldung und – soweit der Browser sie nennt – Zeile und Spalte. */
export function parsePromptJson(text: string): { data: unknown } | { error: string } {
  try {
    return { data: JSON.parse(text) };
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    let where = "";
    const lineCol = /line (\d+) column (\d+)/i.exec(message);
    const pos = /position (\d+)/i.exec(message);
    if (lineCol) where = ` (Zeile ${lineCol[1]}, Spalte ${lineCol[2]})`;
    else if (pos) {
      const before = text.slice(0, Number(pos[1]));
      const lines = before.split("\n");
      where = ` (Zeile ${lines.length}, Spalte ${lines.at(-1)!.length + 1})`;
    }
    return { error: `Die Datei ist kein gültiges JSON${where}. Häufige Ursachen: ein Komma nach dem letzten Eintrag oder fehlende Anführungszeichen.` };
  }
}

// ---------------------------------------------------------------- Export und Muster

export interface PromptFileJson {
  format: string;
  version: number;
  name: string;
  anleitung?: string[];
  prompts: Json[];
}

/** Ein Prompt im Dateiformat: Platzhalter unter ihrem Namen wie im Text, nur gesetzte Angaben. */
export function promptToFile(p: PromptFields & { category?: string }): Json {
  const names = new Map(parsePrompt(p.text).placeholders.map((x) => [x.key, x.name]));
  const platzhalter: Json = {};
  for (const [key, name] of names) {
    if (!Object.hasOwn(p.placeholders, key)) continue;
    const s = p.placeholders[key];
    const out: Json = {};
    if (s.label) out.beschriftung = s.label;
    if (s.hint) out.hinweis = s.hint;
    if (s.type && s.type !== "text") out.art = TYPE_EXPORT[s.type];
    if (s.options?.length) out.werte = s.options;
    if (s.default) out.standard = s.default;
    if (Object.keys(out).length) platzhalter[name] = out;
  }
  return {
    titel: p.title,
    ...(p.description ? { beschreibung: p.description } : {}),
    text: p.text,
    ...(Object.keys(platzhalter).length ? { platzhalter } : {}),
    aktiv: p.enabled,
    ...(p.category ? { kategorie: p.category } : {}),
  };
}

export function promptFile(name: string, prompts: (PromptFields & { category?: string })[]): PromptFileJson {
  return { format: PROMPT_FILE.format, version: PROMPT_FILE.version, name, prompts: prompts.map(promptToFile) };
}

export function promptFileText(file: PromptFileJson): string {
  return `${JSON.stringify(file, null, 2)}\n`;
}

/** Die Musterdatei: erklärt sich selbst und zeigt jede Art von Platzhalter. */
export const PROMPT_MUSTER: PromptFileJson = {
  format: PROMPT_FILE.format,
  version: PROMPT_FILE.version,
  name: "Meine Prompt-Bibliothek",
  anleitung: [
    "Jeder Eintrag in „prompts“ wird ein Prompt. Pflicht sind „titel“ und „text“.",
    "Platzhalter stehen im Text in doppelten geschweiften Klammern: {{Name}}. Teilnehmende füllen sie vor dem Einfügen aus. Erlaubt sind Buchstaben, Ziffern, Leerzeichen, - und _.",
    "Unter „platzhalter“ kannst du jeden Platzhalter genauer beschreiben (alles freiwillig): beschriftung, hinweis, art (einzeilig, mehrzeilig, auswahl), werte (bei auswahl) und standard.",
    "Die Kategorie wählst du beim Import. „aktiv“ ist freiwillig (Standard: true).",
    `Grenzen: Titel ${FUNDUS_LIMITS.promptTitle} Zeichen, Beschreibung ${FUNDUS_LIMITS.promptDescription}, Text ${nf.format(PROMPT_LIMITS.text)}, höchstens ${PROMPT_LIMITS.placeholders} Platzhalter je Prompt, ${PROMPT_LIMITS.options} Werte je Auswahl.`,
    "Speichern als UTF-8. Tipp: Lass Freebie deine Sammlung in dieses Format bringen – diese Datei und deine Liste anhängen und darum bitten.",
  ],
  prompts: [
    {
      titel: "Absage höflich formulieren",
      beschreibung: "Klar in der Sache, freundlich im Ton.",
      text: "Formuliere eine höfliche, klare Absage an {{Empfänger}} zum Anliegen „{{Anliegen}}“. Begründe kurz und biete wenn möglich eine Alternative an.",
      platzhalter: {
        Empfänger: { hinweis: "z. B. Frau Lind" },
        Anliegen: { hinweis: "z. B. Fristverlängerung" },
      },
    },
    {
      titel: "E-Mail-Verlauf zusammenfassen",
      beschreibung: "Wer will was von wem? Welche Fristen laufen?",
      text: "Fasse den angehängten E-Mail-Verlauf für {{Zielgruppe}} in {{Anzahl}} Punkten zusammen.\nAchte besonders auf: {{Schwerpunkt}}",
      platzhalter: {
        Zielgruppe: { hinweis: "z. B. die Amtsleitung" },
        Anzahl: { beschriftung: "Anzahl Punkte", art: "auswahl", werte: ["3", "5", "7"], standard: "5" },
        Schwerpunkt: { beschriftung: "Was ist dir wichtig?", art: "mehrzeilig" },
      },
      aktiv: true,
    },
    {
      titel: "Text in einfache Sprache übertragen",
      text: "Schreibe den folgenden Text in einfacher Sprache: kurze Sätze, keine Fachwörter, ein Gedanke pro Satz.",
    },
  ],
};

export const MUSTER_FILE_NAME = "freebie-prompts-muster.json";

/** Dateiname für einen Export: „freebie-prompts-bibliothek-mueller.json“. */
export function exportFileName(name: string): string {
  const slug = fold(name)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return `freebie-prompts-${slug || "export"}.json`;
}
