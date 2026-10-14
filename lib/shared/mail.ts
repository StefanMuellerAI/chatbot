// Posteingang: Typen und Adress-Hilfen, die Browser und Server gemeinsam nutzen.

/** Reservierte Beispiel-Domain (RFC 2606) – Mails können nie echt zugestellt werden. */
export const MAIL_DOMAIN = "freebie.example";
/** Lokaler Teil der Adresse der Kursleitung. */
export const TEACHER = "kursleitung";

export const MAIL_LIMITS = {
  /** Empfänger je Mail (An und Cc zusammen). */
  recipients: 50,
  subject: 200,
  body: 20_000,
  /** Gesendete Mails je Minute und Postfach (auch die von Freebie). */
  perMinute: 20,
  /** Mails je Postfach. */
  mailbox: 500,
  /** Mails, die Freebie in einer Antwort verschicken darf. */
  perAnswer: 5,
} as const;

export type MailFolder = "inbox" | "sent";

export interface MailSummary {
  id: string;
  folder: MailFolder;
  /** Lokale Teile der Adressen (z. B. „fuchs27“, „kursleitung“). */
  from: string;
  to: string[];
  cc: string[];
  subject: string;
  preview: string;
  sentAt: string;
  read: boolean;
  viaFreebie: boolean;
}

export interface MailFull extends MailSummary {
  body: string;
  inReplyTo: string | null;
}

export interface MailContact {
  local: string;
  address: string;
  name: string;
}

export interface MailContactGroup {
  id: string;
  name: string;
  /** Nur für die Kursleitung: zu welchem Termin die Gruppe gehört. */
  eventName: string | null;
  members: MailContact[];
}

export interface MailContacts {
  me: MailContact;
  /** Für Gäste die Kursleitung; für die Kursleitung selbst null. */
  teacher: MailContact | null;
  groups: MailContactGroup[];
}

export interface MailStatus {
  unread: number;
  /** Alle Mails im Postfach (Posteingang und Gesendet) – für die Rückfrage beim Abmelden. */
  total: number;
  latest: { id: string; from: string; subject: string; sentAt: string } | null;
}

export function mailAddress(local: string): string {
  return `${local}@${MAIL_DOMAIN}`;
}

export function mailName(local: string): string {
  return local === TEACHER ? "Kursleitung" : local;
}

export function mailContact(local: string): MailContact {
  return { local, address: mailAddress(local), name: mailName(local) };
}

/**
 * Lokaler Teil einer Eingabe wie „ Fuchs27 “, „fuchs27@freebie.example“, „<fuchs27@freebie.example>“ oder – aus einem
 * Mailprogramm kopiert – „Max Muster <fuchs27@freebie.example>“, „mailto:fuchs27@freebie.example“ und mit Satzzeichen
 * am Ende. Null bei fremder Domain oder unzulässigen Zeichen.
 */
export function parseAddress(raw: string): string | null {
  let value = raw.trim().toLowerCase();
  const angle = /<([^<>]*)>$/.exec(value);
  if (angle) value = angle[1].trim();
  value = value
    .replace(/^mailto:/, "")
    .replace(/^["'„“‚(]+|["'“”‘’)]+$/g, "")
    .replace(/[.,;:!?]+$/, "");
  const at = value.indexOf("@");
  if (at >= 0) {
    if (value.slice(at + 1) !== MAIL_DOMAIN) return null;
    value = value.slice(0, at);
  }
  return /^[a-z0-9._-]{1,64}$/.test(value) ? value : null;
}

/**
 * Zerlegt „a, b; c“ in einzelne Einträge. Anzeigenamen aus Mailprogrammen („"Muster, Max" <a@…>“, „Max Muster <a@…>“)
 * fallen weg – sie dürfen Leerzeichen und (in Anführungszeichen) Kommas enthalten.
 */
export function splitAddresses(raw: string): string[] {
  return raw
    .replace(/(?:"[^"]*"|[^,;<>"\n]*)\s*<([^<>]*)>/g, " $1 ")
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Vorschau für Listen: ohne zitierte Zeilen, Leerraum zusammengefasst. */
export function mailPreview(body: string, length = 140): string {
  return body
    .split("\n")
    .filter((line) => !line.trimStart().startsWith(">"))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, length);
}

/** Betreff mit „AW: “ bzw. „WG: “, ohne den Präfix zu verdoppeln. */
export function prefixSubject(prefix: "AW: " | "WG: ", subject: string): string {
  return subject.toUpperCase().startsWith(prefix.toUpperCase()) ? subject : `${prefix}${subject}`;
}
