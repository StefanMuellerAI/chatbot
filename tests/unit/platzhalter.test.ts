import { describe, expect, it } from "vitest";
import {
  cleanValue,
  fillPrompt,
  missingValues,
  parsePrompt,
  placeholderKey,
  PROMPT_LIMITS,
  resolvePlaceholders,
  tooLongValues,
  validatePrompt,
} from "@/lib/shared/placeholders";

describe("Platzhalter: Parsen", () => {
  it("findet Platzhalter in der Reihenfolge des ersten Vorkommens", () => {
    const p = parsePrompt("Für {{Zielgruppe}} in {{Anzahl}} Punkten – nochmal {{Zielgruppe}}.");
    expect(p.placeholders).toEqual([
      { key: "zielgruppe", name: "Zielgruppe", count: 2 },
      { key: "anzahl", name: "Anzahl", count: 1 },
    ]);
    expect(p.segments.map((s) => (s.kind === "text" ? s.text : `<${s.key}>`)).join("")).toBe("Für <zielgruppe> in <anzahl> Punkten – nochmal <zielgruppe>.");
    expect(p.warnings).toEqual([]);
  });

  it("fasst Schreibweisen zusammen: groß/klein, ä/ae, ß/ss, Leerzeichen", () => {
    const p = parsePrompt("{{Empfänger}} {{empfaenger}} {{ EMPFÄNGER }} {{Straße}} {{strasse}} {{Anzahl  Punkte}} {{anzahl punkte}}");
    expect(p.placeholders.map((x) => [x.key, x.name, x.count])).toEqual([
      ["empfaenger", "Empfänger", 3],
      ["strasse", "Straße", 2],
      ["anzahl punkte", "Anzahl  Punkte", 2],
    ]);
    expect(placeholderKey("  Zielgruppe ")).toBe("zielgruppe");
  });

  it("findet Platzhalter am Anfang, am Ende und als ganzen Text", () => {
    expect(parsePrompt("{{A}} Mitte {{B}}").placeholders.map((x) => x.key)).toEqual(["a", "b"]);
    expect(parsePrompt("{{Nur}}").segments).toEqual([{ kind: "placeholder", key: "nur", name: "Nur" }]);
  });

  it("lässt ungültige Stellen als Text stehen und warnt", () => {
    for (const text of ["{{}}", "{{ }}", "{{ungültig!}}", "{{a.b}}", "{{Zeile\nUmbruch}}"]) {
      const p = parsePrompt(`Text ${text} Ende`);
      expect(p.placeholders, text).toEqual([]);
      expect(p.segments, text).toEqual([{ kind: "text", text: `Text ${text} Ende` }]);
    }
    expect(parsePrompt("{{ungültig!}}").warnings[0]).toContain("kein gültiger Platzhalter (Zeile 1)");
    expect(parsePrompt("Zeile\n{{x?}}").warnings[0]).toContain("Zeile 2");
  });

  it("behandelt verschachtelte und offene Klammern", () => {
    const triple = parsePrompt("{{{x}}}");
    expect(triple.placeholders).toEqual([]);
    expect(triple.warnings[0]).toContain("zu viele geschweifte Klammern");
    const open = parsePrompt("{{a {{b}}");
    expect(open.placeholders.map((x) => x.key)).toEqual(["b"]);
    expect(open.warnings).toContain("Ein „{{“ hat kein schließendes „}}“ – bitte prüfen.");
    expect(parsePrompt("}} und {{").warnings).toContain("Ein „{{“ hat kein schließendes „}}“ – bitte prüfen.");
    expect(parsePrompt("nur }} hier").warnings).toContain("Ein „}}“ hat kein öffnendes „{{“ – bitte prüfen.");
    expect(parsePrompt("{x} und [Zielgruppe]").placeholders).toEqual([]);
    expect(parsePrompt("{x} und [Zielgruppe]").warnings).toEqual([]);
  });

  it("begrenzt Namen auf 40 Zeichen", () => {
    expect(parsePrompt(`{{${"a".repeat(40)}}}`).placeholders).toHaveLength(1);
    expect(parsePrompt(`{{${"a".repeat(41)}}}`).placeholders).toHaveLength(0);
  });

  it("erlaubt Ziffern, Umlaute, Bindestrich und Unterstrich im Namen", () => {
    expect(parsePrompt("{{Frist_2-Woche}} {{Ölpreis 2026}}").placeholders.map((p) => p.name)).toEqual(["Frist_2-Woche", "Ölpreis 2026"]);
  });
});

describe("Platzhalter: Einstellungen", () => {
  it("setzt Beschriftung, Hinweis, Art und Standardwert ein", () => {
    const list = resolvePlaceholders("{{Anzahl}} für {{Zielgruppe}}", {
      anzahl: { type: "select", options: ["3", "5"], default: "5" },
      zielgruppe: { label: "Für wen?", hint: "z. B. den Rat" },
    });
    expect(list).toEqual([
      { key: "anzahl", name: "Anzahl", label: "Anzahl", hint: "", type: "select", options: ["3", "5"], default: "5" },
      { key: "zielgruppe", name: "Zielgruppe", label: "Für wen?", hint: "z. B. den Rat", type: "text", options: [], default: "" },
    ]);
  });

  it("ignoriert unbekannte Arten und Auswahlwerte ohne Auswahl", () => {
    const [p] = resolvePlaceholders("{{X}}", { x: { type: "zahl" as never, options: ["a"] } });
    expect(p.type).toBe("text");
    expect(p.options).toEqual([]);
  });

  it("prüft Text und Einstellungen und behält nur Platzhalter im Text", () => {
    const ok = validatePrompt("Für {{Zielgruppe}}", { zielgruppe: { label: "Zielgruppe", hint: " z. B. Rat " }, alt: { label: "weg" } });
    expect(ok.errors).toEqual([]);
    expect(ok.settings).toEqual({ zielgruppe: { hint: "z. B. Rat" } });
    expect(validatePrompt("", {}).errors[0]).toBe("Prompt-Text: darf nicht leer sein");
    expect(validatePrompt("x".repeat(PROMPT_LIMITS.text + 1), {}).errors[0]).toContain("höchstens 8.000 Zeichen");
    const many = Array.from({ length: 21 }, (_, i) => `{{P${i}}}`).join(" ");
    expect(validatePrompt(many, {}).errors[0]).toBe("Höchstens 20 Platzhalter – im Text stehen 21.");
  });

  it("prüft Auswahlwerte und Standardwert", () => {
    const err = (s: object) => validatePrompt("{{A}}", { a: s }).errors;
    expect(err({ type: "select", options: ["nur einer"] })[0]).toContain("mindestens 2 Werte");
    expect(err({ type: "select", options: ["a", "A"] })[0]).toContain("doppelt");
    expect(err({ type: "select", options: ["a", "b"], default: "c" })[0]).toContain("einer der Auswahlwerte");
    expect(err({ type: "select", options: Array.from({ length: 21 }, (_, i) => `w${i}`) })[0]).toContain("höchstens 20 Auswahlwerte");
    expect(err({ type: "select", options: ["a", "b".repeat(101)] })[0]).toContain("mehr als 100 Zeichen");
    expect(err({ label: "x".repeat(61) })[0]).toContain("Beschriftung: höchstens 60 Zeichen");
    expect(err({ type: "select", options: [" a ", "b", ""], default: "a" })).toEqual([]);
  });

  it("erlaubt Prompts ohne Platzhalter", () => {
    const r = validatePrompt("Fasse das Protokoll zusammen.", {});
    expect(r.errors).toEqual([]);
    expect(r.placeholders).toEqual([]);
  });
});

describe("Platzhalter: Ausfüllen", () => {
  const text = "Für {{Zielgruppe}} in {{Anzahl}} Punkten. Nochmal {{zielgruppe}}.";

  it("setzt jeden Wert überall ein", () => {
    expect(fillPrompt(text, { zielgruppe: "den Rat", anzahl: "5" })).toBe("Für den Rat in 5 Punkten. Nochmal den Rat.");
  });

  it("setzt Werte wörtlich ein – auch Platzhalter, Ersetzungsmuster und Backslashes", () => {
    for (const value of ["{{Anzahl}}", "$&", "$1", "$$", "$`", "\\n", "a\\b", "{{Zielgruppe}}"]) {
      expect(fillPrompt("X {{A}} Y {{B}}", { a: value, b: "b" })).toBe(`X ${value} Y b`);
    }
  });

  it("behält Umlaute, Emoji, Rechts-nach-links-Schrift und geschützte Leerzeichen", () => {
    for (const value of ["Bürgerinnen & Bürger", "👨‍👩‍👧 Familie", "مرحبا بالعالم", "10 %", "Größe – „Zitat“"]) {
      expect(fillPrompt("{{A}}", { a: value })).toBe(value);
    }
  });

  it("entfernt Steuerzeichen und Null-Byte, vereinheitlicht Zeilenumbrüche", () => {
    expect(cleanValue("a\u0000b\u0007c\u001bd﻿", "text")).toBe("abcd");
    expect(cleanValue("Zeile 1\r\nZeile 2\rZeile 3", "area")).toBe("Zeile 1\nZeile 2\nZeile 3");
    expect(cleanValue("eins\nzwei\tdrei", "text")).toBe("eins zwei drei");
    expect(cleanValue("  mit Rand  ", "text")).toBe("mit Rand");
    expect(fillPrompt("Text:\n{{T}}", { t: "Absatz 1\r\n\r\nAbsatz 2" }, { t: { type: "area" } })).toBe("Text:\nAbsatz 1\n\nAbsatz 2");
  });

  it("verlangt jeden Platzhalter – nur Leerzeichen gilt als leer", () => {
    expect(() => fillPrompt(text, { zielgruppe: "den Rat" })).toThrow("Bitte alle Felder ausfüllen (1 fehlt).");
    expect(() => fillPrompt(text, { zielgruppe: "   ", anzahl: "\u0000" })).toThrow("(2 fehlen)");
    const list = resolvePlaceholders(text);
    expect(missingValues(list, { zielgruppe: " ", anzahl: "3" })).toEqual(["zielgruppe"]);
    expect(missingValues(list, { zielgruppe: "x", anzahl: "3" })).toEqual([]);
  });

  it("prüft die Länge je Art", () => {
    const list = resolvePlaceholders("{{A}} {{B}}", { b: { type: "area" } });
    expect(tooLongValues(list, { a: "x".repeat(300), b: "y".repeat(50_000) })).toEqual([]);
    expect(tooLongValues(list, { a: "x".repeat(301), b: "y".repeat(50_001) })).toEqual(["a", "b"]);
  });

  it("lässt Text ohne Platzhalter unverändert", () => {
    expect(fillPrompt("Ohne {Klammern} und [Lücken].", {})).toBe("Ohne {Klammern} und [Lücken].");
  });

  it("ist deterministisch und lässt keine ausgefüllten Platzhalter übrig (Zufallstest)", () => {
    let seed = 42;
    const rand = () => {
      seed = (seed * 1103515245 + 12345) % 2 ** 31;
      return seed / 2 ** 31;
    };
    const pieces = ["{{A}}", "{{b}}", "{{ C }}", " text ", "{", "}", "{{", "}}", "\n", "ä", "{{x!}}", "$&"];
    for (let i = 0; i < 1000; i++) {
      const prompt = Array.from({ length: 1 + Math.floor(rand() * 12) }, () => pieces[Math.floor(rand() * pieces.length)]).join("");
      const parsed = parsePrompt(prompt);
      const values = Object.fromEntries(parsed.placeholders.map((p) => [p.key, `⟨${p.key}⟩`]));
      const filled = fillPrompt(prompt, values);
      expect(fillPrompt(prompt, values)).toBe(filled);
      // Jeder gültige Platzhalter ist so oft ersetzt, wie er vorkommt; der Text dazwischen bleibt unverändert.
      for (const p of parsed.placeholders) expect(filled.split(`⟨${p.key}⟩`).length - 1).toBe(p.count);
      const textOnly = parsed.segments.map((s) => (s.kind === "text" ? s.text : `⟨${s.key}⟩`)).join("");
      expect(filled).toBe(textOnly);
    }
  });
});
