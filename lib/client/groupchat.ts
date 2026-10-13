"use client";
import { api, postForStream, readEventStream } from "@/lib/client/api";
import type { AppStatus, GroupChatCandidates, GroupChatDetail, GroupChatMessage, GroupChatSummary } from "@/lib/shared/groupchat";
import type { Attachment, ChatMessage, Effort, StreamEvent } from "@/lib/shared/types";
import type { Conversation } from "./db";

const url = (id: string) => `/api/groupchats/${encodeURIComponent(id)}`;

export function fetchStatus() {
  return api<AppStatus>("/api/status", { cache: "no-store" });
}

export function fetchGroupChats() {
  return api<{ chats: GroupChatSummary[] }>("/api/groupchats", { cache: "no-store" }).then((r) => r.chats);
}

export function fetchGroupChat(id: string, since = 0, signal?: AbortSignal) {
  return api<{ chat: GroupChatDetail }>(`${url(id)}?since=${since}`, { cache: "no-store", signal }).then((r) => r.chat);
}

export function fetchCandidates() {
  return api<GroupChatCandidates>("/api/groupchats/members", { cache: "no-store" });
}

export function createGroupChat(input: { title: string; members: string[]; groupId?: string | null }) {
  return api<{ chat: GroupChatSummary }>("/api/groupchats", { method: "POST", json: input }).then((r) => r.chat);
}

export function updateGroupChat(id: string, input: { title: string } | { invite: string[] } | { remove: string }) {
  return api<{ ok: true }>(url(id), { method: "PUT", json: input });
}

/** Verlassen, für alle löschen (`forAll`) oder einen verlassenen Chat ausblenden (`hide`). */
export function removeGroupChat(id: string, how: "leave" | "forAll" | "hide") {
  const query = how === "forAll" ? "?forAll=1" : how === "hide" ? "?hide=1" : "";
  return api<{ ok: true }>(`${url(id)}${query}`, { method: "DELETE" });
}

export function postGroupMessage(id: string, text: string, attachments: Attachment[]) {
  return api<{ message: GroupChatMessage }>(`${url(id)}/messages`, {
    method: "POST",
    json: attachments.length ? { text, attachments } : { text },
  }).then((r) => r.message);
}

/** Freebie antworten lassen (oder neu generieren); die Antwort kommt als Stream wie im privaten Chat. */
export async function streamGroupAnswer(
  id: string,
  body: { modelId: string; effort?: Effort; webSearch?: boolean; regenerate?: boolean },
  onEvent: (event: StreamEvent) => void,
  signal: AbortSignal,
): Promise<void> {
  const res = await postForStream(`${url(id)}/freebie`, body, signal);
  await readEventStream(res, onEvent, signal);
}

/** Antwort von Freebie in der Form, die die Chat-Anzeige kennt. */
export function answerAsChatMessage(m: GroupChatMessage): ChatMessage {
  return {
    id: m.id,
    role: "assistant",
    text: m.text,
    createdAt: Date.parse(m.createdAt),
    modelId: m.modelId,
    thinking: m.thinking,
    citations: m.citations,
    images: m.images,
    usage: m.usage,
    stopReason: m.stopReason,
    error: m.status === "error" || (m.status === "stopped" && !m.text) ? (m.error ?? "Die Antwort ist fehlgeschlagen.") : undefined,
    fallbackModel: m.fallbackModel,
  };
}

/** Ein Gruppenchat als privater Chat (Export, Markdown): Beiträge mit Autor, Systemzeilen fallen weg. */
export function groupChatAsConversation(chat: GroupChatDetail): Conversation {
  const messages: ChatMessage[] = chat.messages.flatMap((m): ChatMessage[] => {
    if (m.kind === "person") {
      return [{ id: m.id, role: "user", text: m.text, createdAt: Date.parse(m.createdAt), attachments: m.attachments, author: m.author ?? undefined }];
    }
    if (m.kind === "freebie" && m.status !== "pending") return [answerAsChatMessage(m)];
    return [];
  });
  const createdAt = messages[0]?.createdAt ?? Date.now();
  return {
    id: `gruppenchat-${chat.id}`,
    title: `${chat.title} (Gruppenchat)`,
    modelId: messages.findLast((m) => m.role === "assistant")?.modelId ?? "",
    presetId: null,
    createdAt,
    updatedAt: messages[messages.length - 1]?.createdAt ?? createdAt,
    messages,
  };
}

/** Alle eigenen Gruppenchats als Kopie (für den Export) – leer, wenn Gruppenchats aus sind oder das Netz fehlt. */
export async function groupChatsForExport(): Promise<Conversation[]> {
  try {
    const chats = await fetchGroupChats();
    const details = await Promise.all(chats.map((c) => fetchGroupChat(c.id).catch(() => null)));
    return details.filter((d): d is GroupChatDetail => d !== null).map(groupChatAsConversation);
  } catch {
    return [];
  }
}
