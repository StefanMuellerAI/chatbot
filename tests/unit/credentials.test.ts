import { describe, expect, it } from "vitest";
import { generatePassword, generateUsername, normalizeUsername, PASSWORD_WORDS, USERNAME_WORDS } from "@/lib/events/credentials";

describe("Zugangsdaten für Gäste", () => {
  it("Wortlisten: nur a–z, keine Dubletten, keine Überschneidung", () => {
    for (const list of [USERNAME_WORDS, PASSWORD_WORDS]) {
      for (const w of list) expect(w).toMatch(/^[a-z]{2,12}$/);
      expect(new Set(list).size).toBe(list.length);
    }
    const names = new Set<string>(USERNAME_WORDS);
    expect(PASSWORD_WORDS.filter((w) => names.has(w))).toEqual([]);
    expect(PASSWORD_WORDS.length).toBeGreaterThanOrEqual(280);
  });

  it("Benutzernamen: Wort plus zwei Ziffern ohne 0/1, eindeutig", () => {
    const taken = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      const name = generateUsername(taken);
      expect(name).toMatch(/^[a-z]+[2-9]{2,3}$/);
      expect(taken.has(name)).toBe(false);
      taken.add(name);
    }
  });

  it("Passwörter: Wort plus drei Ziffern ohne 0/1, genug Auswahl", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const pw = generatePassword();
      expect(pw).toMatch(/^[a-z]+[2-9]{3}$/);
      seen.add(pw);
    }
    expect(seen.size).toBeGreaterThan(480);
    // Rund 150.000 Möglichkeiten je Konto.
    expect(PASSWORD_WORDS.length * 8 ** 3).toBeGreaterThan(140_000);
  });

  it("Benutzername: Groß-/Kleinschreibung und Leerzeichen spielen keine Rolle", () => {
    expect(normalizeUsername("  Fuchs 27 ")).toBe("fuchs27");
    expect(normalizeUsername("FUCHS27")).toBe("fuchs27");
  });
});
