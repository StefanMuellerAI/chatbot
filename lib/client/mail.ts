"use client";
import { api } from "@/lib/client/api";
import {
  mailAddress,
  mailName,
  prefixSubject,
  type MailContacts,
  type MailFolder,
  type MailFull,
  type MailStatus,
  type MailSummary,
} from "@/lib/shared/mail";

// ---------------------------------------------------------------- Server

export function fetchMailList(folder: MailFolder, query: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ folder });
  if (query.trim()) params.set("q", query.trim());
  return api<{ mails: MailSummary[]; total: number; unread: number }>(`/api/mail?${params}`, { signal, cache: "no-store" });
}

export function fetchMail(id: string, signal?: AbortSignal) {
  return api<{ mail: MailFull }>(`/api/mail?id=${encodeURIComponent(id)}`, { signal, cache: "no-store" }).then((r) => r.mail);
}

export function fetchMailStatus() {
  return api<MailStatus>("/api/mail/status", { cache: "no-store" });
}

export function fetchContacts() {
  return api<MailContacts>("/api/mail/contacts", { cache: "no-store" });
}

export function sendMailRequest(draft: { to: string[]; cc: string[]; subject: string; body: string; inReplyTo: string | null }) {
  return api<{ mail: MailFull }>("/api/mail", { method: "POST", json: draft }).then((r) => r.mail);
}

export function markMailRead(id: string, read: boolean) {
  return api<{ ok: true }>("/api/mail", { method: "PUT", json: { id, read } });
}

export function deleteMailRequest(id: string) {
  return api<{ ok: true }>(`/api/mail?id=${encodeURIComponent(id)}`, { method: "DELETE" });
}

// ---------------------------------------------------------------- Anzeige

const TZ = "Europe/Berlin";
const dayKey = (d: Date) => new Intl.DateTimeFormat("de-DE", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

/** Zeit in der Liste: „14:05“, „Gestern“, „Mo.“ oder „03.10.“. */
export function listTime(iso: string, now = new Date()): string {
  const d = new Date(iso);
  if (dayKey(d) === dayKey(now)) return new Intl.DateTimeFormat("de-DE", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d);
  if (dayKey(d) === dayKey(new Date(now.getTime() - 86_400_000))) return "Gestern";
  if (now.getTime() - d.getTime() < 6 * 86_400_000) return new Intl.DateTimeFormat("de-DE", { timeZone: TZ, weekday: "short" }).format(d);
  return new Intl.DateTimeFormat("de-DE", { timeZone: TZ, day: "2-digit", month: "2-digit" }).format(d);
}

/** „Sa., 10.10.2026, 14:05“ */
export function fullDate(iso: string): string {
  return new Intl.DateTimeFormat("de-DE", { timeZone: TZ, weekday: "short", day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

/** „10.10.2026 um 14:05“ (für Zitat-Köpfe) */
function shortDate(iso: string): string {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat("de-DE", { timeZone: TZ, day: "2-digit", month: "2-digit", year: "numeric" }).format(d);
  const time = new Intl.DateTimeFormat("de-DE", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(d);
  return `${date} um ${time}`;
}

/** Empfänger als Text, die eigene Adresse als „mich“. */
export function recipientLine(locals: string[], me: string): string {
  return locals.map((l) => (l === me ? "mich" : mailName(l))).join(", ");
}

const quoted = (body: string) =>
  body
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

export interface ComposeDraft {
  mode: "new" | "reply" | "all" | "forward";
  to: string[];
  cc: string[];
  subject: string;
  body: string;
  inReplyTo: string | null;
}

export function newDraft(to: string[] = []): ComposeDraft {
  return { mode: "new", to, cc: [], subject: "", body: "", inReplyTo: null };
}

/** Antworten / Allen antworten / Weiterleiten mit Zitat und vorbelegten Empfängern. */
export function draftFor(mode: "reply" | "all" | "forward", mail: MailFull, me: string): ComposeDraft {
  if (mode === "forward") {
    const head = [
      "-------- Weitergeleitete Nachricht --------",
      `Von: ${mailName(mail.from)} <${mailAddress(mail.from)}>`,
      `Datum: ${fullDate(mail.sentAt)}`,
      `Betreff: ${mail.subject}`,
      `An: ${mail.to.map(mailAddress).join(", ")}`,
      "",
    ].join("\n");
    return { mode, to: [], cc: [], subject: prefixSubject("WG: ", mail.subject), body: `\n\n${quoted(`${head}\n${mail.body}`)}`, inReplyTo: mail.id };
  }
  const base = mail.folder === "sent" ? mail.to : [mail.from];
  let to = base;
  let cc: string[] = [];
  if (mode === "all") {
    const everyone = [...base, ...(mail.folder === "sent" ? [] : mail.to)].filter((x, i, a) => x !== me && a.indexOf(x) === i);
    to = everyone.length ? everyone : base;
    cc = mail.cc.filter((x) => x !== me && !to.includes(x));
  }
  return {
    mode,
    to,
    cc,
    subject: prefixSubject("AW: ", mail.subject),
    body: `\n\n> Am ${shortDate(mail.sentAt)} schrieb ${mailName(mail.from)}:\n${quoted(mail.body)}`,
    inReplyTo: mail.id,
  };
}

/** Text in Abschnitte: zitierte Zeilen (>) und normaler Text. */
export function bodyBlocks(body: string): { quote: boolean; text: string }[] {
  const out: { quote: boolean; text: string }[] = [];
  for (const line of body.split("\n")) {
    const quote = line.trimStart().startsWith(">");
    const text = quote ? line.trimStart().replace(/^>\s?/, "") : line;
    const last = out[out.length - 1];
    if (last && last.quote === quote) last.text += `\n${text}`;
    else out.push({ quote, text });
  }
  return out;
}

const AVATAR_COLORS = ["#4a2ee6", "#b45309", "#0f766e", "#be185d", "#1d4ed8", "#6d28d9", "#047857", "#9f1239"];

/** Feste Farbe je Adresse; die Kursleitung bekommt den Marken-Verlauf. */
export function avatarBackground(local: string): string {
  if (local === "kursleitung") return "linear-gradient(135deg, #ff6900 0%, #e41c68 100%)";
  let h = 0;
  for (let i = 0; i < local.length; i++) h = (h * 31 + local.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}
