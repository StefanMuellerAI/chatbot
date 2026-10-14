// Eingaben bei der Anmeldung – so tolerant, wie es die einfachen Gast-Zugangsdaten erlauben (Browser und Server).

/** Leerraum und unsichtbare Zeichen, die beim Kopieren aus PDF, Mail oder Ausdruck mitkommen. */
const INVISIBLE = /[\s­᠎​-‍⁠﻿]/g;

/** Benutzername so, wie er verglichen wird (Groß-/Kleinschreibung, Leerzeichen und unsichtbare Zeichen egal). */
export function normalizeUsername(input: string): string {
  return input.normalize("NFKC").replace(INVISIBLE, "").toLowerCase();
}

/**
 * Gast-Passwort so, wie es verglichen wird. Gast-Passwörter bestehen nur aus a–z und 2–9 – Leerzeichen,
 * Großschreibung (iPad-Autokorrektur) und Vollbreiten-Ziffern spielen deshalb keine Rolle. Das Admin-Passwort
 * wird nie so behandelt.
 */
export function normalizeGuestPassword(input: string): string {
  return input.normalize("NFKC").replace(INVISIBLE, "").toLowerCase();
}

/** Gast-Zugangsdaten haben die Form Wort + Ziffern 2–9 (z. B. „fuchs27“, „sonne482“). */
const CREDENTIAL = /^[a-z]+[2-9]+$/i;

/**
 * Benutzername und Passwort aus einem eingefügten Text, z. B. „fuchs27 sonne482“, eine Zeile der CSV-Datei
 * oder „Benutzername: fuchs27 Passwort: sonne482“. Null, wenn nicht genau zwei solche Angaben darin stehen.
 */
export function credentialPair(text: string): { username: string; password: string } | null {
  // In Wörter zerlegen statt mit Lookbehind zu suchen – den kennen ältere iPads (Safari vor 16.4) nicht.
  const found = text.normalize("NFKC").split(/[^\p{L}\p{N}]+/u).filter((w) => CREDENTIAL.test(w));
  if (found.length !== 2) return null;
  return { username: found[0].toLowerCase(), password: found[1].toLowerCase() };
}
