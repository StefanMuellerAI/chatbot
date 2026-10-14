// Katalog-IDs erkennen (von coverage.mjs und dem Unit-Test genutzt).
// Eine ID ist ein Bereichskürzel aus einem oder zwei Großbuchstaben plus zwei Ziffern: „A01“, „GC04“.

/** IDs am Anfang eines Testnamens: „GC04 …“, „Q03/F08 …“, „GC04/V08 …“. */
export function idsFromTestName(name) {
  const prefix = /^((?:[A-Z]{1,2}\d{2}\/?)+)\s/.exec(name);
  return prefix ? prefix[1].split("/").filter(Boolean) : [];
}

/** IDs aus den Tabellen in TESTPLAN.md, inklusive Bereichen wie „Q02–Q10“ oder „GC01–GC20“. */
export function catalogIds(markdown) {
  const ids = [];
  for (const m of markdown.matchAll(/^\| ([A-Z]{1,2})(\d{2})(?:–(?:[A-Z]{1,2})?(\d{2}))? \|/gm)) {
    const [from, to] = [Number(m[2]), Number(m[3] ?? m[2])];
    for (let n = from; n <= to; n++) ids.push(`${m[1]}${String(n).padStart(2, "0")}`);
  }
  return ids;
}
