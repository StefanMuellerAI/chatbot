"use client";
import Dexie, { type EntityTable } from "dexie";
import type { ChatMessage, Effort } from "@/lib/shared/types";

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  presetId: string | null;
  effort?: Effort;
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

export async function importAll(json: string): Promise<number> {
  const data = JSON.parse(json) as { conversations?: Conversation[] } | Conversation;
  const list = "messages" in data ? [data as Conversation] : ((data as { conversations?: Conversation[] }).conversations ?? []);
  const valid = list.filter((c) => c && typeof c.id === "string" && Array.isArray(c.messages));
  await db.conversations.bulkPut(valid);
  return valid.length;
}
