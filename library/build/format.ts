// Formatierung für Inhalte und Vorschauen (deutsch).

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
const WEEKDAYS = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];

function parts(iso: string): { y: number; m: number; d: number; hh: number; mm: number } {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(iso);
  if (!m) throw new Error(`Ungültiges Datum: ${iso}`);
  return { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]), hh: Number(m[4] ?? 0), mm: Number(m[5] ?? 0) };
}

/** 07.10.2025 */
export function dateShort(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${String(d).padStart(2, "0")}.${String(m).padStart(2, "0")}.${y}`;
}

/** 7. Oktober 2025 */
export function dateLong(iso: string): string {
  const { y, m, d } = parts(iso);
  return `${d}. ${MONTHS[m - 1]} ${y}`;
}

/** Dienstag, 7. Oktober 2025 14:32 (wie in Outlook-Zitaten) */
export function dateTimeLong(local: string): string {
  const { y, m, d, hh, mm } = parts(local);
  const weekday = WEEKDAYS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  return `${weekday}, ${d}. ${MONTHS[m - 1]} ${y} ${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

/** Letzter Sonntag eines Monats (UTC-Tag). */
function lastSunday(year: number, month: number): number {
  const last = new Date(Date.UTC(year, month, 0));
  return last.getUTCDate() - last.getUTCDay();
}

/** Versatz der Berliner Ortszeit zu UTC in Stunden (Sommerzeit nach EU-Regel). */
export function berlinOffset(local: string): 1 | 2 {
  const { y, m, d, hh } = parts(local);
  if (m < 3 || m > 10) return 1;
  if (m > 3 && m < 10) return 2;
  const switchDay = lastSunday(y, m);
  if (m === 3) return d > switchDay || (d === switchDay && hh >= 2) ? 2 : 1;
  return d < switchDay || (d === switchDay && hh < 3) ? 2 : 1;
}

/** Berliner Ortszeit „2025-10-07T14:32“ als ISO-Zeitpunkt mit Versatz. */
export function berlinIso(local: string): string {
  const { y, m, d, hh, mm } = parts(local);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00+0${berlinOffset(local)}:00`;
}

/** Datum für den Mail-Kopf nach RFC 5322. */
export function rfc5322Date(local: string): string {
  const { y, m, d, hh, mm } = parts(local);
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date(Date.UTC(y, m - 1, d)).getUTCDay()];
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][m - 1];
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${day}, ${pad(d)} ${mon} ${y} ${pad(hh)}:${pad(mm)}:00 +0${berlinOffset(local)}00`;
}

/** Zerlegt Text mit **fett** in Abschnitte. */
export function rich(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((s) => (s.startsWith("**") && s.endsWith("**") ? { text: s.slice(2, -2), bold: true } : { text: s, bold: false }));
}

export function plain(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, "$1");
}

const nf = (min: number, max: number) => new Intl.NumberFormat("de-DE", { minimumFractionDigits: min, maximumFractionDigits: max });

export function formatNumber(value: number, fmt: string): string {
  switch (fmt) {
    case "int":
      return nf(0, 0).format(value);
    case "dec":
      return nf(1, 1).format(value);
    case "eur":
      return `${nf(2, 2).format(value)} €`;
    case "eur0":
      return `${nf(0, 0).format(value)} €`;
    case "pct":
      return `${nf(1, 1).format(value * 100)} %`;
    case "hours":
      return `${nf(1, 1).format(value)} h`;
    default:
      return Number.isInteger(value) ? nf(0, 0).format(value) : nf(0, 2).format(value);
  }
}
