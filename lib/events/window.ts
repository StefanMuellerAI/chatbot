// Zeitregeln für Termine und Gast-Zugänge (ohne Server-Abhängigkeiten, auch im Browser nutzbar).

/** Ein Termin dauert höchstens 24 Stunden. */
export const MAX_EVENT_MS = 24 * 60 * 60 * 1000;
/** Gäste können sich schon 30 Minuten vor Beginn anmelden (Rechner vorbereiten). */
export const EARLY_LOGIN_MS = 30 * 60 * 1000;
/** Längste Sitzung – für Gäste zusätzlich begrenzt durch das Termin-Ende. */
export const SESSION_MAX_MS = 12 * 60 * 60 * 1000;

export interface EventTimes {
  startsAt: Date;
  endsAt: Date;
  endedEarlyAt: Date | null;
}

export type EventStatus = "geplant" | "laeuft" | "vorbei";

/** Tatsächliches Ende: „Jetzt beenden“ geht dem geplanten Ende vor. */
export function effectiveEnd(e: EventTimes): Date {
  return e.endedEarlyAt && e.endedEarlyAt < e.endsAt ? e.endedEarlyAt : e.endsAt;
}

export function eventStatus(e: EventTimes, now = new Date()): EventStatus {
  if (now >= effectiveEnd(e)) return "vorbei";
  return now >= e.startsAt ? "laeuft" : "geplant";
}

export type LoginCheck = { ok: true } | { ok: false; reason: "zu-frueh"; opensAt: Date } | { ok: false; reason: "vorbei" };

/** Darf sich ein Gast dieses Termins jetzt anmelden bzw. angemeldet bleiben? */
export function guestAccess(e: EventTimes, now = new Date()): LoginCheck {
  if (now >= effectiveEnd(e)) return { ok: false, reason: "vorbei" };
  const opensAt = new Date(e.startsAt.getTime() - EARLY_LOGIN_MS);
  if (now < opensAt) return { ok: false, reason: "zu-frueh", opensAt };
  return { ok: true };
}

/** Ablauf einer neuen Gast-Sitzung: spätestens zum Termin-Ende. */
export function guestSessionExpiry(e: EventTimes, now = new Date()): Date {
  const max = new Date(now.getTime() + SESSION_MAX_MS);
  const end = effectiveEnd(e);
  return end < max ? end : max;
}

/** Prüft Beginn und Ende eines Termins; liefert eine deutsche Meldung oder null. */
export function validateEventTimes(startsAt: Date, endsAt: Date, now = new Date()): string | null {
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return "Bitte Beginn und Ende angeben.";
  if (endsAt <= startsAt) return "Das Ende muss nach dem Beginn liegen.";
  if (endsAt.getTime() - startsAt.getTime() > MAX_EVENT_MS) return "Ein Termin dauert höchstens 24 Stunden.";
  if (endsAt <= now) return "Das Ende liegt in der Vergangenheit.";
  return null;
}

const berlin = (opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", ...opts });

/** „10. Oktober um 9:00 Uhr“ */
export function formatStart(d: Date): string {
  return `${berlin({ day: "numeric", month: "long" }).format(d)} um ${berlin({ hour: "numeric", minute: "2-digit" }).format(d)} Uhr`;
}

/** „16:30“ */
export function formatTime(d: Date): string {
  return berlin({ hour: "2-digit", minute: "2-digit" }).format(d);
}
