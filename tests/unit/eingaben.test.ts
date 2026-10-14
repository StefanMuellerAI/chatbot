import { describe, expect, it } from "vitest";
import { generatePassword } from "@/lib/events/credentials";
import { credentialPair, normalizeGuestPassword, normalizeUsername } from "@/lib/shared/login-input";

// A13/A14: Zugangsdaten, wie sie aus PDF, Mail, CSV oder vom iPad kommen.

describe("Eingaben bei der Anmeldung", () => {
  it("Benutzername: Leerraum, unsichtbare Zeichen, Groß/klein und Vollbreite egal", () => {
    for (const input of [" fuchs27 ", "FUCHS27", "fuchs 27", "​fuchs27﻿", "fuchs27\t", "ｆｕｃｈｓ２７", "fuchs­27"]) {
      expect(normalizeUsername(input), JSON.stringify(input)).toBe("fuchs27");
    }
  });

  it("Gast-Passwort: kopierte Leerzeichen und großer Anfangsbuchstabe ergeben dasselbe Passwort", () => {
    const password = generatePassword();
    const variants = [` ${password}`, `${password} `, `${password}\t`, `${password} `, `​${password}`, password.toUpperCase(), password[0].toUpperCase() + password.slice(1)];
    for (const v of variants) expect(normalizeGuestPassword(v), JSON.stringify(v)).toBe(password);
    // Generierte Passwörter sind schon normalisiert – der Vergleich mit dem gespeicherten Hash bleibt gültig.
    for (let i = 0; i < 200; i++) {
      const p = generatePassword();
      expect(normalizeGuestPassword(p)).toBe(p);
    }
  });

  it("zwei Angaben in einem eingefügten Text werden erkannt", () => {
    const pair = { username: "fuchs27", password: "sonne482" };
    for (const text of [
      "fuchs27 sonne482",
      "fuchs27\tsonne482",
      "fuchs27\nsonne482\n",
      "fuchs27;sonne482;Gruppe A;14.10.2026 17:00",
      "Benutzername: fuchs27  Passwort: sonne482",
      "Benutzername fuchs27 · Passwort Sonne482",
    ]) {
      expect(credentialPair(text), JSON.stringify(text)).toEqual(pair);
    }
  });

  it("ein einzelner Wert oder ein normales Passwort wird nicht zerlegt", () => {
    for (const text of ["fuchs27", "sonne482", "admin", "mein geheimes Passwort", "", "a1 b1", "fuchs27 sonne482 hase33"]) {
      expect(credentialPair(text), JSON.stringify(text)).toBeNull();
    }
  });
});
