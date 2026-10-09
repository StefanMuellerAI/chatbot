"use client";
import Dexie, { type EntityTable } from "dexie";
import type { ChatMessage, Effort } from "@/lib/shared/types";

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  presetId: string | null;
  effort?: Effort;
  /** Zuletzt gewählter Zustand des Websuche-Schalters in diesem Chat. */
  webSearch?: boolean;
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

/** Wählt die Datenbank des angemeldeten Kontos (idempotent, vor dem ersten Zugriff aufrufen). */
export function selectAccount(key: string, role: "admin" | "guest", validUntil: string | null = null) {
  if (role === "guest" && validUntil) writeExpiry({ key, until: Date.parse(validUntil) });
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
  return JSON.stringify({ app: "freebie", version: 1, exportedAt: new Date().toISOString(), conversations: all }, null, 2);
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

function normalizeConversation(v: unknown): Conversation | null {
  if (!isRecord(v) || typeof v.id !== "string" || !v.id || !Array.isArray(v.messages)) return null;
  const now = Date.now();
  const messages = v.messages
    .filter((m): m is Record<string, unknown> => isRecord(m) && (m.role === "user" || m.role === "assistant"))
    .map((m) => ({
      ...m,
      id: typeof m.id === "string" && m.id ? m.id : crypto.randomUUID(),
      role: m.role,
      text: typeof m.text === "string" ? m.text : "",
      createdAt: typeof m.createdAt === "number" ? m.createdAt : now,
    })) as ChatMessage[];
  const updatedAt = typeof v.updatedAt === "number" ? v.updatedAt : now;
  return {
    ...(v as unknown as Conversation),
    title: typeof v.title === "string" && v.title.trim() ? v.title : "Importierter Chat",
    modelId: typeof v.modelId === "string" ? v.modelId : "",
    presetId: typeof v.presetId === "string" ? v.presetId : null,
    createdAt: typeof v.createdAt === "number" ? v.createdAt : updatedAt,
    updatedAt,
    messages,
  };
}
