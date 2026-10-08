/** Datumskontext für neue Nutzernachrichten – nur Datum, keine Uhrzeit (stabil für Caches). */
export function formatContextDate(date: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(date);
}
