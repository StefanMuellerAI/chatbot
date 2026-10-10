// Darstellung von Terminen und Export der Zugangsdaten (ohne Server-Abhängigkeiten).

const tz = { timeZone: "Europe/Berlin" } as const;
const day = new Intl.DateTimeFormat("de-DE", { ...tz, weekday: "short", day: "numeric", month: "long", year: "numeric" });
const time = new Intl.DateTimeFormat("de-DE", { ...tz, hour: "2-digit", minute: "2-digit" });
const dayKey = new Intl.DateTimeFormat("en-CA", { ...tz, year: "numeric", month: "2-digit", day: "2-digit" });

/** „Fr., 10. Oktober 2026 · 09:00–16:30 Uhr“ bzw. über Mitternacht mit zweitem Datum. */
export function formatRange(startsAt: string | Date, endsAt: string | Date): string {
  const s = new Date(startsAt);
  const e = new Date(endsAt);
  if (dayKey.format(s) === dayKey.format(e)) return `${day.format(s)} · ${time.format(s)}–${time.format(e)} Uhr`;
  return `${day.format(s)} · ${time.format(s)} Uhr bis ${day.format(e)} · ${time.format(e)} Uhr`;
}

export function formatDateTime(d: string | Date): string {
  const date = new Date(d);
  return `${day.format(date)} · ${time.format(date)} Uhr`;
}

/** Datum und Uhrzeit für Eingabefelder (Ortszeit des Browsers). */
export function toInputs(iso: string): { date: string; time: string } {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return { date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`, time: `${pad(d.getHours())}:${pad(d.getMinutes())}` };
}

/** Beginn und Ende aus Datum, „von“ und „bis“ – liegt „bis“ vor „von“, endet der Termin am Folgetag. */
export function fromInputs(date: string, from: string, to: string): { startsAt: Date; endsAt: Date; nextDay: boolean } {
  const startsAt = new Date(`${date}T${from}`);
  const endsAt = new Date(`${date}T${to}`);
  const nextDay = Boolean(from && to && to <= from);
  if (nextDay) endsAt.setDate(endsAt.getDate() + 1);
  return { startsAt, endsAt, nextDay };
}

export interface CredentialRow {
  username: string;
  password: string | null;
  group: string;
  event: string;
  validUntil: string;
}

/** CSV für Excel (Semikolon, UTF-8 mit BOM). */
export function credentialsCsv(rows: CredentialRow[]): string {
  const esc = (v: string) => (/[;"\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const lines = [["Benutzername", "Passwort", "Gruppe", "Termin", "Gültig bis"].join(";")];
  for (const r of rows) lines.push([r.username, r.password ?? "", r.group, r.event, formatDateTime(r.validUntil)].map(esc).join(";"));
  return `﻿${lines.join("\r\n")}\r\n`;
}

/** Dateiname ohne Sonderzeichen, z. B. „zugangsdaten-ki-grundlagen-gruppe-a.csv“. */
export function csvFileName(...parts: string[]): string {
  const slug = parts
    .join("-")
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `zugangsdaten-${slug || "termin"}.csv`;
}
