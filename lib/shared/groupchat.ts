// Gruppenchats: Typen, Grenzen und Texte, die Browser und Server gemeinsam nutzen.
import { mailName, type MailStatus } from "./mail";
import type { Attachment, Citation, GeneratedImage, UsageInfo } from "./types";

export const GROUPCHAT_LIMITS = {
  /** Länge des Namens. */
  title: 60,
  /** Mitglieder je Gruppenchat, inklusive der Person, die ihn gestartet hat. */
  members: 30,
  /** Gruppenchats, die eine Person gleichzeitig gestartet hat. */
  ownChats: 10,
  /** Beiträge und Antworten je Gruppenchat. */
  messages: 1000,
  /** Zeichen je Beitrag – reicht für lange Protokolle; längere Texte als Datei anhängen. */
  text: 50_000,
  /** Beiträge je Person und Minute. */
  perMinute: 30,
} as const;

/** Offener Gruppenchat, sichtbarer Tab: so oft fragt der Browser nach Neuem … */
export const GROUPCHAT_POLL_MS = 4_000;
/** … und so oft, wenn seit zwei Minuten nichts passiert ist. */
export const GROUPCHAT_IDLE_POLL_MS = 10_000;
export const GROUPCHAT_IDLE_AFTER_MS = 120_000;
/** Eine Antwort, die so lange nicht fertig wird, gilt als unterbrochen (Funktions-Grenze 300 s plus Puffer). */
export const GROUPCHAT_STALE_MS = 6 * 60_000;

/** Der Posteingang ist im Gruppenchat nie verbunden – Freebie würde sonst private Mails in den Chat holen. */
export const GROUPCHAT_MAILBOX_BLOCKED = "Im Gruppenchat ist der Posteingang nicht verfügbar.";

const MENTION = /(^|[^\p{L}\p{N}_@])@freebie(?![\p{L}\p{N}_])/iu;

/** Spricht der Beitrag Freebie an („@Freebie“, Groß-/Kleinschreibung egal)? */
export function mentionsFreebie(text: string): boolean {
  return MENTION.test(text);
}

/** Zerlegt einen Beitrag für die Anzeige: „@Freebie“ wird hervorgehoben. */
export function splitMentions(text: string): { text: string; mention: boolean }[] {
  return text
    .split(/(@freebie(?![\p{L}\p{N}_]))/iu)
    .filter((t) => t.length > 0)
    .map((t) => ({ text: t, mention: /^@freebie$/i.test(t) }));
}

export type GroupChatSystem =
  | { action: "invite"; actor: string; targets: string[] }
  | { action: "remove"; actor: string; targets: string[] }
  | { action: "leave"; actor: string }
  | { action: "rename"; actor: string; title: string };

export type GroupAnswerStatus = "pending" | "done" | "stopped" | "error";

export interface GroupChatMessage {
  id: string;
  seq: number;
  kind: "person" | "freebie" | "system";
  /** Benutzername bzw. „kursleitung“ (bei Freebie und Systemzeilen leer bzw. die auslösende Person). */
  author: string | null;
  text: string;
  attachments?: Attachment[];
  createdAt: string;
  system?: GroupChatSystem;
  // Antworten von Freebie
  status?: GroupAnswerStatus;
  askedBy?: string;
  modelId?: string;
  thinking?: string;
  citations?: Citation[];
  images?: GeneratedImage[];
  usage?: UsageInfo;
  stopReason?: string;
  error?: string;
  fallbackModel?: string;
}

/** Eintrag in der Seitenleiste (und in der Statusabfrage). */
export interface GroupChatSummary {
  id: string;
  title: string;
  /** Name der Person, die den Chat gestartet hat. */
  owner: string;
  /** Selbst gestartet. */
  mine: boolean;
  left: boolean;
  unread: boolean;
  members: number;
  updatedAt: string;
}

export interface GroupChatDetail {
  id: string;
  title: string;
  owner: string;
  mine: boolean;
  /** Aktuelle Mitglieder (Namen), die startende Person zuerst. */
  members: string[];
  groupId: string;
  groupName: string;
  left: boolean;
  /** Zeitpunkt des Verlassens bzw. Entfernens (ISO). */
  leftAt: string | null;
  version: number;
  /** Mit `since`: nur die seitdem geänderten Beiträge; sonst alle. */
  messages: GroupChatMessage[];
}

/** Wen man einladen kann: Gäste ihre Gruppe, die Kursleitung die Gruppen laufender Termine. */
export interface GroupChatCandidates {
  groups: { id: string; name: string; eventName: string | null; members: string[] }[];
}

/** Gemeinsame Statusabfrage (alle 15 Sekunden). Null = Funktion ausgeschaltet. */
export interface AppStatus {
  mail: MailStatus | null;
  groupChats: GroupChatSummary[] | null;
}

function names(list: string[], me: string): string {
  const shown = list.map((n) => (n === me ? "dich" : mailName(n)));
  if (shown.length <= 1) return shown.join("");
  return `${shown.slice(0, -1).join(", ")} und ${shown[shown.length - 1]}`;
}

/** Systemzeile aus Sicht der lesenden Person („Du hast …“ bzw. „fuchs27 hat dich …“). */
export function systemText(s: GroupChatSystem, me: string): string {
  const self = s.actor === me;
  const who = self ? "Du hast" : `${mailName(s.actor)} hat`;
  switch (s.action) {
    case "invite":
      return `${who} ${names(s.targets, me)} eingeladen`;
    case "remove":
      return `${who} ${names(s.targets, me)} entfernt`;
    case "leave":
      return `${who} den Chat verlassen`;
    case "rename":
      return `${who} den Chat in „${s.title}“ umbenannt`;
  }
}
