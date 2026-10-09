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
  constructor() {
    super("freebie");
    this.version(1).stores({ conversations: "id, updatedAt" });
  }
}

export const db = new FreebieDB();

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
