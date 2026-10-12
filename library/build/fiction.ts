// Regeln, an denen man erkennt, dass der Fundus erfunden ist (geprüft in tests/unit/library.test.ts und im
// Prüfskript für neue Inhalte, library/build/check.ts).

/** Begriffe, die in keiner Datei vorkommen dürfen (echte Behörden, Parteien, Produkte, gestrichene Namen). */
export const BLOCKED_TERMS = [
  "Bundesministerium des Innern",
  "Bundesverwaltungsamt",
  "Beschaffungsamt des BMI",
  "Landesverwaltungsamt",
  "Ellerbach",
  "Wiesengrund",
  "Bundesadler",
  "ChatGPT",
  "OpenAI",
  "Microsoft",
  "Google",
  "Destatis",
  "Statistisches Bundesamt",
  "Bundesnetzagentur",
  "BSI",
  "KGSt",
  "SPD",
  "CDU",
  "CSU",
  "FDP",
  "AfD",
];

/** Regeln aus tests/unit/library.test.ts für einen ausgelesenen Text. */
export function fictionProblems(id: string, text: string): string[] {
  const problems: string[] = [];
  for (const m of text.matchAll(/[\w.+-]+@([\w-]+\.)+[a-z]{2,}/gi)) if (!/\.example$/.test(m[0])) problems.push(`${id}: Adresse nicht auf .example: ${m[0]}`);
  for (const m of text.matchAll(/\b(?:https?:\/\/|www\.)([^\s/)"']+)/gi)) if (!/\.example$/.test(m[1])) problems.push(`${id}: Webadresse nicht auf .example: ${m[0]}`);
  for (const m of text.matchAll(/\b0\d{2,4} \d{4,6}(?:-\d{1,4})?\b/g))
    if (!/^(030 23125|069 90009|040 66969)-\d{3}$/.test(m[0])) problems.push(`${id}: Rufnummer nicht aus den Spielfilm-Bereichen (mit dreistelliger Durchwahl): ${m[0]}`);
  for (const m of text.matchAll(/\b(\d{5}) [A-ZÄÖÜ][a-zäöüß]+/g))
    if (Number(m[1]) >= 1000 && !/^20\d\d$/.test(m[1].slice(1)) && !/^00/.test(m[1])) problems.push(`${id}: Postleitzahl muss mit 00 beginnen: ${m[0]}`);
  for (const m of text.matchAll(/\bDE\d{2}(?: ?\d{4}){4} ?\d{2}\b/g)) if (ibanValid(m[0].replace(/ /g, ""))) problems.push(`${id}: gültige IBAN: ${m[0]}`);
  for (const b of BLOCKED_TERMS) if (text.includes(b)) problems.push(`${id}: nennt „${b}“ (Sperrliste)`);
  return problems;
}

export function ibanValid(iban: string): boolean {
  const moved = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rest = 0;
  for (const ch of moved) rest = (rest * 10 + Number(ch)) % 97;
  return rest === 1;
}
