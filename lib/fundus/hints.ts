// Hinweise beim Hochladen in den Fundus: Stellen, die nach echten Daten aussehen (Warnung, kein Fehler).
// Ohne Server-Abhängigkeiten, damit Unit-Tests sie direkt prüfen.

/** Domains, die für Beispiele reserviert sind (RFC 2606) – Adressen darauf sind unbedenklich. */
const EXAMPLE_DOMAIN = /(^|\.)(example|test|invalid|localhost)$|^example\.(com|org|net)$/i;

/** Rufnummern aus den Spielfilm-Bereichen, die der mitgelieferte Fundus verwendet. */
const FICTION_PHONE = /^(?:030 ?23125|069 ?90009|040 ?66969)/;

export function ibanValid(iban: string): boolean {
  const s = iban.replace(/\s+/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(s)) return false;
  const moved = s.slice(4) + s.slice(0, 4);
  let rest = 0;
  for (const ch of moved) {
    const value = ch >= "A" && ch <= "Z" ? String(ch.charCodeAt(0) - 55) : ch;
    for (const digit of value) rest = (rest * 10 + Number(digit)) % 97;
  }
  return rest === 1;
}

function unique(values: string[], max = 3): string[] {
  return [...new Set(values)].slice(0, max);
}

/**
 * Sucht nach Merkmalen echter Daten: E-Mail-Adressen mit echter Domain, gültige IBANs, Telefonnummern.
 * Liefert deutsche Hinweise (höchstens einen je Art, mit bis zu drei Beispielen).
 */
export function realDataHints(text: string): string[] {
  const hints: string[] = [];
  const mails = unique(
    [...text.matchAll(/[\w.+-]+@((?:[\w-]+\.)+[a-z]{2,})\b/gi)].filter((m) => !EXAMPLE_DOMAIN.test(m[1])).map((m) => m[0]),
  );
  if (mails.length) hints.push(`E-Mail-Adresse mit echter Domain: ${mails.join(", ")}`);
  const ibans = unique([...text.matchAll(/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){3,7}(?: ?[A-Z0-9]{1,4})?\b/g)].map((m) => m[0]).filter(ibanValid));
  if (ibans.length) hints.push(`Gültige IBAN: ${ibans.join(", ")}`);
  const phones = unique(
    [...text.matchAll(/(?:\+49[ /-]?|(?<![\d.,])0)[1-9]\d{1,4}[ /-]?\d{3,8}(?:-\d{1,5})?\b/g)]
      .map((m) => m[0])
      .filter((p) => !FICTION_PHONE.test(p.replace(/^\+49[ /-]?/, "0"))),
  );
  if (phones.length) hints.push(`Telefonnummer: ${phones.join(", ")}`);
  return hints;
}
