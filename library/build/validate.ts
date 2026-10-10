// Prüft das Weltmodell und alle Inhalte auf Vollständigkeit und Widerspruchsfreiheit.
import { LIBRARY_ID } from "@/lib/library/types";
import type { DocSpec, ThreadSpec } from "../types";
import { ORGS, PERSONS } from "../world";

export function validateLibrary(docs: DocSpec[], threads: ThreadSpec[]): string[] {
  const problems: string[] = [];
  const dupes = (ids: string[], what: string) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`${what} doppelt: ${id}`);
      seen.add(id);
    }
  };

  dupes(
    ORGS.map((o) => o.id),
    "Verwaltung",
  );
  dupes(
    ORGS.flatMap((o) => o.units.map((u) => u.id)),
    "Einheit",
  );
  dupes(
    PERSONS.map((p) => p.id),
    "Person",
  );
  const items = [...docs.map((d) => d.id), ...threads.map((t) => t.id), ...threads.flatMap((t) => t.mails.map((_, i) => `${t.id}-${i + 1}`))];
  dupes(items, "ID");

  const orgIds = new Set(ORGS.map((o) => o.id));
  const unitOf = (orgId: string, unitId: string) => ORGS.find((o) => o.id === orgId)?.units.find((u) => u.id === unitId);
  for (const o of ORGS) {
    if (!o.domain.endsWith(".example")) problems.push(`${o.id}: Domain muss auf .example enden`);
    if (!/^(030 23125|069 90009|040 66969)$/.test(o.phone)) problems.push(`${o.id}: Telefon nur aus den Spielfilm-Bereichen`);
    if (!o.address.some((l) => /^00\d{3} /.test(l))) problems.push(`${o.id}: Postleitzahl muss mit 00 beginnen`);
    for (const u of o.units) if (u.parent && !unitOf(o.id, u.parent)) problems.push(`${o.id}/${u.id}: unbekannte übergeordnete Einheit ${u.parent}`);
  }
  const personIds = new Set(PERSONS.map((p) => p.id));
  for (const p of PERSONS) {
    if (p.org) {
      if (!orgIds.has(p.org)) problems.push(`${p.id}: unbekannte Verwaltung ${p.org}`);
      else if (!p.unit || !unitOf(p.org, p.unit)) problems.push(`${p.id}: unbekannte Einheit ${p.unit}`);
      if (!p.ext || !/^\d{3}$/.test(p.ext)) problems.push(`${p.id}: Durchwahl muss dreistellig sein`);
    } else if (!p.email?.endsWith(".example")) {
      problems.push(`${p.id}: Externe brauchen eine Adresse auf .example`);
    }
  }

  const checkItem = (id: string, org: string, unit: string, date: string) => {
    if (!LIBRARY_ID.test(id)) problems.push(`${id}: ungültige ID`);
    if (!orgIds.has(org)) problems.push(`${id}: unbekannte Verwaltung ${org}`);
    else if (!unitOf(org, unit)) problems.push(`${id}: unbekannte Einheit ${unit}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) problems.push(`${id}: Datum im Format JJJJ-MM-TT`);
  };

  for (const d of docs) {
    checkItem(d.id, d.org, d.unit, d.date);
    if (!personIds.has(d.author)) problems.push(`${d.id}: unbekannte Verfasserin/unbekannter Verfasser ${d.author}`);
    if (/[\\/:*?"<>|]/.test(d.fileName)) problems.push(`${d.id}: Dateiname mit unzulässigen Zeichen`);
    if (!d.keywords.length) problems.push(`${d.id}: keine Pflichtbegriffe`);
    if (d.type === "excel") {
      for (const s of d.sheets) {
        for (const row of s.rows) {
          const cells = Array.isArray(row) ? row : row.cells;
          if (cells.length > s.columns.length) problems.push(`${d.id}/${s.name}: Zeile mit mehr Zellen als Spalten`);
        }
      }
    }
  }

  const docIds = new Set(docs.map((d) => d.id));
  for (const t of threads) {
    checkItem(t.id, t.org, t.unit, t.date);
    if (!t.mails.length) problems.push(`${t.id}: Verlauf ohne Mails`);
    if (!t.keywords.length) problems.push(`${t.id}: keine Pflichtbegriffe`);
    let previous = "";
    t.mails.forEach((m, i) => {
      for (const pid of [m.from, ...m.to, ...(m.cc ?? [])]) if (!personIds.has(pid)) problems.push(`${t.id}-${i + 1}: unbekannte Person ${pid}`);
      if (!m.to.length) problems.push(`${t.id}-${i + 1}: keine Empfänger`);
      if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(m.date)) problems.push(`${t.id}-${i + 1}: Zeitpunkt im Format JJJJ-MM-TTThh:mm`);
      if (previous && m.date <= previous) problems.push(`${t.id}-${i + 1}: liegt zeitlich nicht nach der vorherigen Mail`);
      previous = m.date;
      for (const a of m.attachments ?? []) if (!docIds.has(a)) problems.push(`${t.id}-${i + 1}: unbekannter Anhang ${a}`);
    });
    if (t.mails.length && t.date !== t.mails.at(-1)!.date.slice(0, 10)) problems.push(`${t.id}: Datum muss dem der letzten Mail entsprechen`);
  }
  return problems;
}
