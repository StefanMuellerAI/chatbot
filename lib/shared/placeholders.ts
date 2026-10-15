// Platzhalter in Prompts aus dem Fundus: {{Name}}. Dieselben Regeln gelten im Admin-Dialog, in der Maske im Chat und
// bei der Prüfung auf dem Server (Plan: FUNDUS-PFLEGE-PLAN.md, Abschnitt 4).
import { fold } from "@/lib/library/search";

export const PROMPT_LIMITS = {
  /** Länge des Prompt-Texts (wie die Anweisung einer Vorlage). */
  text: 8000,
  placeholders: 20,
  name: 40,
  label: 60,
  hint: 120,
  option: 100,
  options: 20,
  /** Eingabe in der Maske: einzeilig bzw. mehrzeilig. */
  single: 300,
  multi: 50_000,
} as const;

export type PlaceholderType = "text" | "area" | "select";

export const PLACEHOLDER_TYPES: PlaceholderType[] = ["text", "area", "select"];

export const PLACEHOLDER_TYPE_LABEL: Record<PlaceholderType, string> = { text: "einzeilig", area: "mehrzeilig", select: "Auswahl" };

/** Einstellungen der Kursleitung je Platzhalter (Schlüssel: `placeholderKey`). */
export interface PlaceholderSetting {
  label?: string;
  hint?: string;
  type?: PlaceholderType;
  options?: string[];
  default?: string;
}

export type PlaceholderSettings = Record<string, PlaceholderSetting>;

/** Ein Platzhalter mit allen Angaben für die Maske. */
export interface Placeholder {
  key: string;
  /** Schreibweise beim ersten Vorkommen im Text. */
  name: string;
  label: string;
  hint: string;
  type: PlaceholderType;
  options: string[];
  default: string;
}

export type PromptSegment = { kind: "text"; text: string } | { kind: "placeholder"; key: string; name: string };

export interface ParsedPrompt {
  segments: PromptSegment[];
  /** Jeder Platzhalter einmal, in der Reihenfolge des ersten Vorkommens. */
  placeholders: { key: string; name: string; count: number }[];
  /** Stellen, die wie ein Platzhalter aussehen, aber keiner sind (bleiben als Text stehen). */
  warnings: string[];
}

const NAME = /^[\p{L}\p{N} _-]+$/u;

/** Schlüssel für den Vergleich: ohne Groß/klein, ä = ae, ß = ss, Leerzeichen zusammengefasst. */
export function placeholderKey(name: string): string {
  return fold(name).replace(/\s+/g, " ").trim();
}

function validName(name: string): boolean {
  return name.length >= 1 && name.length <= PROMPT_LIMITS.name && NAME.test(name);
}

/**
 * Namen, die als Schlüssel eines Objekts Eingebautes treffen (`values.constructor` ist die Funktion `Object`):
 * keine Platzhalter, sie bleiben mit Hinweis als Text stehen. Sonst bräche die Maske an solchen Prompts.
 */
const RESERVED = new Set(["__proto__", "constructor", "prototype"]);

export function reservedName(name: string): boolean {
  return RESERVED.has(placeholderKey(name));
}

/** Einstellungen eines Platzhalters – nur eigene Einträge, nie Geerbtes. */
function settingFor(settings: PlaceholderSettings, key: string): PlaceholderSetting {
  return Object.hasOwn(settings, key) ? settings[key] : {};
}

function position(text: string, index: number): string {
  const before = text.slice(0, index);
  const line = before.split("\n").length;
  return `Zeile ${line}`;
}

/**
 * Zerlegt einen Prompt in Text und Platzhalter. Ein Platzhalter ist `{{Name}}` mit gültigem Namen, ohne weitere
 * Klammer direkt davor oder dahinter; alles andere bleibt wörtlich Text.
 */
export function parsePrompt(text: string): ParsedPrompt {
  const segments: PromptSegment[] = [];
  const found = new Map<string, { key: string; name: string; count: number }>();
  const warnings: string[] = [];
  const re = /\{\{([^{}]*)\}\}/g;
  let last = 0;
  let plain = "";
  const pushText = (s: string) => {
    plain += s;
  };
  const flush = () => {
    if (plain) segments.push({ kind: "text", text: plain });
    plain = "";
  };
  for (const m of text.matchAll(re)) {
    const start = m.index!;
    const end = start + m[0].length;
    const name = m[1].trim();
    const braced = text[start - 1] === "{" || text[end] === "}";
    if (braced || !validName(name) || reservedName(name)) {
      warnings.push(
        braced
          ? `„${m[0]}“ hat zu viele geschweifte Klammern (${position(text, start)}) – bleibt als Text stehen.`
          : validName(name)
            ? `„${m[0]}“: dieser Name ist reserviert (${position(text, start)}) – bleibt als Text stehen.`
            : `„${m[0]}“ ist kein gültiger Platzhalter (${position(text, start)}): erlaubt sind Buchstaben, Ziffern, Leerzeichen, - und _, höchstens ${PROMPT_LIMITS.name} Zeichen. Bleibt als Text stehen.`,
      );
      continue;
    }
    pushText(text.slice(last, start));
    flush();
    const key = placeholderKey(name);
    const entry = found.get(key);
    if (entry) entry.count++;
    else found.set(key, { key, name, count: 1 });
    segments.push({ kind: "placeholder", key, name });
    last = end;
  }
  pushText(text.slice(last));
  flush();
  // Offene oder einzelne Klammern, die zu keinem Platzhalter gehören.
  const outside = segments
    .filter((s): s is { kind: "text"; text: string } => s.kind === "text")
    .map((s) => s.text.replace(/\{\{[^{}]*\}\}/g, ""))
    .join("\n");
  let depth = 0;
  let strayClose = false;
  for (const m of outside.matchAll(/\{\{|\}\}/g)) {
    if (m[0] === "{{") depth++;
    else if (depth > 0) depth--;
    else strayClose = true;
  }
  if (depth > 0) warnings.push("Ein „{{“ hat kein schließendes „}}“ – bitte prüfen.");
  if (strayClose) warnings.push("Ein „}}“ hat kein öffnendes „{{“ – bitte prüfen.");
  return { segments, placeholders: [...found.values()], warnings };
}

/** Platzhalter des Texts mit den Einstellungen der Kursleitung (fehlende Angaben mit Standardwerten). */
export function resolvePlaceholders(text: string, settings: PlaceholderSettings = {}): Placeholder[] {
  return parsePrompt(text).placeholders.map(({ key, name }) => {
    const s = settingFor(settings, key);
    const type = s.type && PLACEHOLDER_TYPES.includes(s.type) ? s.type : "text";
    return {
      key,
      name,
      label: s.label?.trim() || name,
      hint: s.hint?.trim() ?? "",
      type,
      options: type === "select" ? (s.options ?? []) : [],
      default: s.default ?? "",
    };
  });
}

/** Bereinigt einen Wert aus der Maske: keine Steuerzeichen (außer Zeilenumbruch und Tab), einzeilig ohne Umbrüche. */
export function cleanValue(value: string, type: PlaceholderType): string {
  const s = value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F﻿]/g, "");
  return (type === "area" ? s : s.replace(/[\n\t]+/g, " ")).trim();
}

export function maxLengthFor(type: PlaceholderType): number {
  return type === "area" ? PROMPT_LIMITS.multi : PROMPT_LIMITS.single;
}

/** Schlüssel der Platzhalter, die noch leer sind (nur Leerzeichen gilt als leer). */
export function missingValues(placeholders: Placeholder[], values: Record<string, string | undefined>): string[] {
  return placeholders.filter((p) => !cleanValue(values[p.key] ?? "", p.type)).map((p) => p.key);
}

/** Werte, die zu lang sind. */
export function tooLongValues(placeholders: Placeholder[], values: Record<string, string | undefined>): string[] {
  return placeholders.filter((p) => cleanValue(values[p.key] ?? "", p.type).length > maxLengthFor(p.type)).map((p) => p.key);
}

/**
 * Setzt die Werte in einem Durchgang ein. Werte gehen wörtlich hinein – auch `{{…}}`, `$&` oder `\` darin.
 * Jeder Platzhalter muss ausgefüllt sein (sonst Fehler statt halbem Text).
 */
export function fillPrompt(text: string, values: Record<string, string | undefined>, settings: PlaceholderSettings = {}): string {
  const placeholders = resolvePlaceholders(text, settings);
  const missing = missingValues(placeholders, values);
  if (missing.length) throw new Error(`Bitte alle Felder ausfüllen (${missing.length === 1 ? "1 fehlt" : `${missing.length} fehlen`}).`);
  const types = new Map(placeholders.map((p) => [p.key, p.type]));
  return parsePrompt(text)
    .segments.map((s) => (s.kind === "text" ? s.text : cleanValue(values[s.key] ?? "", types.get(s.key) ?? "text")))
    .join("");
}

/** Prüft Text und Einstellungen eines Prompts (Server und Admin-Dialog). Liefert bereinigte Einstellungen nur der Platzhalter im Text. */
export function validatePrompt(
  text: string,
  settings: PlaceholderSettings,
): { errors: string[]; warnings: string[]; settings: PlaceholderSettings; placeholders: Placeholder[] } {
  const errors: string[] = [];
  const parsed = parsePrompt(text);
  if (!text.trim()) errors.push("Prompt-Text: darf nicht leer sein");
  if (text.length > PROMPT_LIMITS.text) errors.push(`Prompt-Text: höchstens ${PROMPT_LIMITS.text.toLocaleString("de-DE")} Zeichen`);
  if (parsed.placeholders.length > PROMPT_LIMITS.placeholders) {
    errors.push(`Höchstens ${PROMPT_LIMITS.placeholders} Platzhalter – im Text stehen ${parsed.placeholders.length}.`);
  }
  const clean: PlaceholderSettings = {};
  for (const { key, name } of parsed.placeholders) {
    const s = settingFor(settings, key);
    const type: PlaceholderType = s.type && PLACEHOLDER_TYPES.includes(s.type) ? s.type : "text";
    const label = (s.label ?? "").trim();
    const hint = (s.hint ?? "").trim();
    const def = (s.default ?? "").trim();
    const options = type === "select" ? (s.options ?? []).map((o) => o.trim()).filter(Boolean) : [];
    if (label.length > PROMPT_LIMITS.label) errors.push(`Platzhalter „${name}“, Beschriftung: höchstens ${PROMPT_LIMITS.label} Zeichen`);
    if (hint.length > PROMPT_LIMITS.hint) errors.push(`Platzhalter „${name}“, Hinweis: höchstens ${PROMPT_LIMITS.hint} Zeichen`);
    if (def.length > PROMPT_LIMITS.single) errors.push(`Platzhalter „${name}“, Standardwert: höchstens ${PROMPT_LIMITS.single} Zeichen`);
    if (type === "select") {
      if (options.length < 2) errors.push(`Platzhalter „${name}“: eine Auswahl braucht mindestens 2 Werte`);
      if (options.length > PROMPT_LIMITS.options) errors.push(`Platzhalter „${name}“: höchstens ${PROMPT_LIMITS.options} Auswahlwerte`);
      if (options.some((o) => o.length > PROMPT_LIMITS.option)) errors.push(`Platzhalter „${name}“: ein Auswahlwert hat mehr als ${PROMPT_LIMITS.option} Zeichen`);
      if (new Set(options.map((o) => placeholderKey(o))).size !== options.length) errors.push(`Platzhalter „${name}“: ein Auswahlwert kommt doppelt vor`);
      if (def && !options.includes(def)) errors.push(`Platzhalter „${name}“: der Standardwert muss einer der Auswahlwerte sein`);
    }
    clean[key] = {
      ...(label && label !== name ? { label } : {}),
      ...(hint ? { hint } : {}),
      ...(type !== "text" ? { type } : {}),
      ...(options.length ? { options } : {}),
      ...(def ? { default: def } : {}),
    };
  }
  return { errors, warnings: parsed.warnings, settings: clean, placeholders: resolvePlaceholders(text, clean) };
}
