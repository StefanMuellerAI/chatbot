"use client";
import Dexie, { type EntityTable } from "dexie";
import type { Attachment, ChatMessage, Citation, ConnectionId, Effort, GeneratedImage, MailRef } from "@/lib/shared/types";
import { MAX_ATTACHMENTS } from "@/lib/files/limits";
import { LIBRARY_ID } from "@/lib/library/types";
import { groupChatsForExport } from "./groupchat";

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  presetId: string | null;
  effort?: Effort;
  /** Zuletzt gewählter Zustand des Websuche-Schalters in diesem Chat. */
  webSearch?: boolean;
  /** Eingeschaltete Verbindungen in diesem Chat (z. B. Posteingang). */
  connections?: ConnectionId[];
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}

class FreebieDB extends Dexie {
  conversations!: EntityTable<Conversation, "id">;
  constructor(name: string) {
    super(name);
    this.version(1).stores({ conversations: "id, updatedAt" });
  }
}

// Jedes Konto hat eine eigene Browser-Datenbank: Am selben Schulungsrechner sieht ein Gast nie
// die Chats eines anderen. Der Admin behält die bisherige Datenbank „freebie“.
const GUEST_PREFIX = "freebie-g-";
let active: { key: string; role: "admin" | "guest"; db: FreebieDB } | null = null;

export function databaseName(key: string, role: "admin" | "guest"): string {
  return role === "admin" ? "freebie" : `${GUEST_PREFIX}${key}`;
}

/** Merkt sich, wann der Zugang des Gasts auf diesem Gerät verfällt (es gibt höchstens einen). */
const EXPIRY_KEY = "freebie-gast-ablauf";
let rememberedExpiry: string | null = null;

/** Wählt die Datenbank des angemeldeten Kontos (idempotent, vor dem ersten Zugriff aufrufen). */
export function selectAccount(key: string, role: "admin" | "guest", validUntil: string | null = null) {
  // Läuft bei jedem Rendern des Chats – nur bei Änderungen schreiben.
  const expiry = role === "guest" && validUntil ? `${key}|${validUntil}` : null;
  if (expiry && expiry !== rememberedExpiry) {
    writeExpiry({ key, until: Date.parse(validUntil!) });
    rememberedExpiry = expiry;
  }
  if (active?.key === key && active.role === role) return;
  active?.db.close();
  active = { key, role, db: new FreebieDB(databaseName(key, role)) };
}

function readExpiry(): { key: string; until: number } | null {
  try {
    const value = JSON.parse(localStorage.getItem(EXPIRY_KEY) ?? "null") as { key?: unknown; until?: unknown } | null;
    return typeof value?.key === "string" && typeof value.until === "number" ? { key: value.key, until: value.until } : null;
  } catch {
    return null;
  }
}

function writeExpiry(value: { key: string; until: number } | null) {
  if (!value) rememberedExpiry = null;
  try {
    if (value) localStorage.setItem(EXPIRY_KEY, JSON.stringify(value));
    else localStorage.removeItem(EXPIRY_KEY);
  } catch {
    // ohne Speicher (privates Fenster) bleibt es beim Löschen bei Anmeldung und Abmeldung
  }
}

/**
 * Auf der Login-Seite: Chats eines Gasts löschen, dessen Termin inzwischen vorbei ist – auch wenn
 * das Fenster zum Ende geschlossen war.
 */
export async function forgetExpiredGuest(): Promise<void> {
  const expiry = readExpiry();
  if (!expiry || expiry.until > Date.now()) return;
  writeExpiry(null);
  await Dexie.delete(`${GUEST_PREFIX}${expiry.key}`);
}

function current(): FreebieDB {
  if (!active) throw new Error("Kein Konto gewählt.");
  return active.db;
}

/** Zugriff auf die Datenbank des aktuellen Kontos (Methoden an die echte Instanz gebunden). */
export const db = new Proxy({} as FreebieDB, {
  get(_target, prop) {
    const target = current();
    const value = Reflect.get(target, prop, target) as unknown;
    return typeof value === "function" ? (value as (...a: unknown[]) => unknown).bind(target) : value;
  },
});

/** Gast-Chats vom Gerät löschen (Abmelden, Ablauf). Admin-Chats bleiben. */
export async function forgetCurrentGuest(): Promise<void> {
  if (!active || active.role !== "guest") return;
  writeExpiry(null);
  const name = active.db.name;
  active.db.close();
  active = null;
  await Dexie.delete(name);
}

/** Nach der Anmeldung: Chats früherer Gäste auf diesem Gerät entfernen (außer dem eigenen Konto). */
export async function forgetOtherGuests(exceptKey?: string): Promise<void> {
  if (readExpiry()?.key !== exceptKey) writeExpiry(null);
  const names = await Dexie.getDatabaseNames();
  const keep = exceptKey ? `${GUEST_PREFIX}${exceptKey}` : null;
  await Promise.all(names.filter((n) => n.startsWith(GUEST_PREFIX) && n !== keep).map((n) => Dexie.delete(n)));
}

export async function saveConversation(c: Conversation): Promise<void> {
  await db.conversations.put({ ...c, updatedAt: Date.now() });
}

/**
 * Hängt Nachrichten an den aktuellen Stand in der Datenbank an (in einer Transaktion),
 * statt einen älteren Schnappschuss zurückzuschreiben. Gelöschte Chats bleiben gelöscht.
 */
export async function appendMessages(id: string, messages: ChatMessage[], patch: Partial<Conversation> = {}): Promise<void> {
  await db.transaction("rw", db.conversations, async () => {
    const latest = await db.conversations.get(id);
    if (!latest) return;
    await db.conversations.put({ ...latest, ...patch, messages: [...latest.messages, ...messages], updatedAt: Date.now() });
  });
}

export async function exportAll(): Promise<string> {
  const all = await db.conversations.toArray();
  // Gruppenchats liegen auf dem Server: als Kopie mit Autoren dabei (beim Import werden sie zu privaten Chats).
  const groups = await groupChatsForExport();
  return JSON.stringify({ app: "freebie", version: 1, exportedAt: new Date().toISOString(), conversations: [...all, ...groups] }, null, 2);
}

/** Alle Chats des Kontos als JSON-Datei herunterladen. */
export async function downloadExport(): Promise<void> {
  const json = await exportAll();
  const url = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `freebie-chats-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Liest eine Export-Datei ein. Unvollständige Einträge werden ergänzt, unbrauchbare übersprungen. */
export async function importAll(json: string): Promise<number> {
  const data = JSON.parse(json) as unknown;
  const raw: unknown[] = Array.isArray(data)
    ? data
    : isRecord(data) && Array.isArray(data.conversations)
      ? data.conversations
      : isRecord(data) && Array.isArray(data.messages)
        ? [data]
        : [];
  const valid = raw.map(normalizeConversation).filter((c): c is Conversation => c !== null);
  if (raw.length > 0 && valid.length === 0) throw new Error("Keine gültigen Chats gefunden.");
  if (raw.length === 0) throw new Error("Keine Chats in der Datei.");
  await db.conversations.bulkPut(valid);
  return valid.length;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

/** Importierter Chat in der Form, die Anzeige und Server erwarten (exportiert für die Unit-Tests). */
export function normalizeConversation(v: unknown): Conversation | null {
  if (!isRecord(v) || typeof v.id !== "string" || !v.id || !Array.isArray(v.messages)) return null;
  const now = Date.now();
  const messages = v.messages
    .filter((m): m is Record<string, unknown> => isRecord(m) && (m.role === "user" || m.role === "assistant"))
    .map((m) => {
      const msg: Record<string, unknown> = {
        ...m,
        id: typeof m.id === "string" && m.id && m.id.length <= 100 ? m.id : crypto.randomUUID(),
        role: m.role,
        text: typeof m.text === "string" ? m.text : "",
        createdAt: typeof m.createdAt === "number" ? m.createdAt : now,
      };
      // Felder nur in gültiger Form übernehmen – sonst stürzt die Anzeige ab oder der Server lehnt den Chat ab.
      if ("attachments" in m) msg.attachments = listOf(m.attachments, attachmentOf)?.slice(0, MAX_ATTACHMENTS);
      if ("citations" in m) msg.citations = listOf(m.citations, citationOf);
      if ("images" in m) msg.images = listOf(m.images, imageOf);
      if ("native" in m) msg.native = isRecord(m.native) && PROVIDERS.includes(m.native.provider as string) && typeof m.native.model === "string" && Array.isArray(m.native.items) ? m.native : undefined;
      if ("usage" in m) msg.usage = isRecord(m.usage) && USAGE_KEYS.every((k) => typeof (m.usage as Record<string, unknown>)[k] === "number") ? m.usage : undefined;
      for (const key of ["thinking", "error", "stopReason", "fallbackModel"]) if (key in m && typeof m[key] !== "string") msg[key] = undefined;
      for (const key of ["modelId", "contextDate"]) if (key in m && (typeof m[key] !== "string" || (m[key] as string).length > 100)) msg[key] = undefined;
      for (const key of ["webSearch", "fromCache"]) if (key in m && typeof m[key] !== "boolean") msg[key] = undefined;
      if ("effort" in m && !EFFORTS.includes(m.effort as Effort)) msg.effort = undefined;
      if ("connections" in m) msg.connections = connectionList(m.connections);
      if ("author" in m) msg.author = typeof m.author === "string" && m.author ? m.author.slice(0, 60) : undefined;
      if ("mails" in m) msg.mails = isRecord(m.mails) ? { read: mailRefs(m.mails.read), sent: mailRefs(m.mails.sent) } : undefined;
      return msg;
    }) as unknown as ChatMessage[];
  const updatedAt = typeof v.updatedAt === "number" ? v.updatedAt : now;
  return {
    ...(v as unknown as Conversation),
    // Der Server nimmt IDs bis 100 Zeichen an.
    id: v.id.slice(0, 100),
    connections: "connections" in v ? connectionList(v.connections) : undefined,
    title: typeof v.title === "string" && v.title.trim() ? v.title : "Importierter Chat",
    modelId: typeof v.modelId === "string" ? v.modelId : "",
    presetId: typeof v.presetId === "string" ? v.presetId.slice(0, 100) : null,
    createdAt: typeof v.createdAt === "number" ? v.createdAt : updatedAt,
    updatedAt,
    messages,
  };
}

const CONNECTIONS: readonly ConnectionId[] = ["mailbox"];
const EFFORTS: readonly Effort[] = ["low", "medium", "high", "max"];
const PROVIDERS = ["anthropic", "openai", "mock"];
const USAGE_KEYS = ["inputTokens", "outputTokens", "cacheReadTokens", "cacheWriteTokens"];

/** Gültige Einträge einer Liste; ohne gültige Einträge fällt das Feld weg. */
function listOf<T>(v: unknown, of: (x: unknown) => T | null): T[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const out = v.map(of).filter((x): x is T => x !== null);
  return out.length ? out : undefined;
}

/** Anhang in der Form, die der Server prüft (lib/shared/schemas.ts) – sonst wäre der ganze Chat nicht mehr nutzbar. */
function attachmentOf(a: unknown): Attachment | null {
  if (!isRecord(a) || typeof a.name !== "string" || typeof a.storageKey !== "string") return null;
  if (a.kind !== "image" && a.kind !== "document" && a.kind !== "transcript") return null;
  if (typeof a.sha256 !== "string" || !/^[a-f0-9]{64}$/.test(a.sha256)) return null;
  return {
    id: typeof a.id === "string" && a.id ? a.id.slice(0, 100) : crypto.randomUUID(),
    kind: a.kind,
    name: a.name.slice(0, 300),
    mime: typeof a.mime === "string" ? a.mime.slice(0, 200) : "",
    size: typeof a.size === "number" && a.size >= 0 ? a.size : 0,
    sha256: a.sha256,
    storageKey: a.storageKey.slice(0, 300),
    tokenEstimate: typeof a.tokenEstimate === "number" ? a.tokenEstimate : undefined,
    preview: typeof a.preview === "string" ? a.preview.slice(0, 2000) : undefined,
    native: typeof a.native === "boolean" ? a.native : undefined,
    libraryId: typeof a.libraryId === "string" && LIBRARY_ID.test(a.libraryId) ? a.libraryId : undefined,
  };
}

function citationOf(c: unknown): Citation | null {
  return isRecord(c) && typeof c.url === "string" && typeof c.title === "string" ? { url: c.url, title: c.title } : null;
}

function imageOf(i: unknown): GeneratedImage | null {
  return isRecord(i) && typeof i.id === "string" && typeof i.url === "string" ? { id: i.id, url: i.url, prompt: typeof i.prompt === "string" ? i.prompt : "" } : null;
}

function connectionList(v: unknown): ConnectionId[] {
  return Array.isArray(v) ? CONNECTIONS.filter((c) => v.includes(c)) : [];
}

function mailRefs(v: unknown): MailRef[] {
  if (!Array.isArray(v)) return [];
  return v.filter(isRecord).flatMap((r) =>
    typeof r.id === "string"
      ? [
          {
            id: r.id,
            folder: r.folder === "sent" ? ("sent" as const) : ("inbox" as const),
            from: typeof r.from === "string" ? r.from : "",
            to: Array.isArray(r.to) ? r.to.filter((x): x is string => typeof x === "string") : [],
            subject: typeof r.subject === "string" ? r.subject : "",
          },
        ]
      : [],
  );
}
