import "server-only";
import { inArray } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import type { ModelRow } from "@/lib/models";
import type { Attachment, ChatMessage, Effort, NativeTurn } from "@/lib/shared/types";
import { sniffImageMime } from "@/lib/files/sniff";
import { getFile } from "@/lib/storage";

export type PreparedPart =
  | { type: "text"; text: string }
  | { type: "image"; mime: string; base64: string }
  | { type: "pdf"; name: string; base64: string };

export interface PreparedUser {
  role: "user";
  parts: PreparedPart[];
  effort: Effort;
  webSearch: boolean;
}

export interface PreparedAssistant {
  role: "assistant";
  text: string;
  native?: NativeTurn;
}

export type PreparedMessage = PreparedUser | PreparedAssistant;

const IMAGE_MIMES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export const MAILBOX_ON_NOTE = "[Verbindung: Der Posteingang ist ab dieser Nachricht verbunden.]";
export const MAILBOX_OFF_NOTE = "[Verbindung: Der Posteingang ist ab dieser Nachricht nicht mehr verbunden. Nutze die Postfach-Werkzeuge nicht.]";

/**
 * Baut aus dem neutralen Verlauf deterministische Nachrichteninhalte.
 * Gleicher Verlauf ergibt byte-gleiche Inhalte – Voraussetzung für Prompt Caching.
 */
export async function prepareMessages(
  messages: ChatMessage[],
  model: ModelRow,
  opts: { nativePdf: boolean; mailbox?: boolean },
): Promise<PreparedMessage[]> {
  const shas = new Set<string>();
  for (const m of messages) {
    for (const a of m.attachments ?? []) if (a.kind !== "image") shas.add(a.sha256);
  }
  const texts = await loadExtractedTexts([...shas]);

  const prepared: PreparedMessage[] = [];
  // Hinweis nur dort, wo die Verbindung umgeschaltet wurde – er hängt allein am Verlauf, frühere
  // Nachrichten bleiben byte-gleich (wie beim Effort-Wechsel). Am Anfang ist nichts verbunden.
  let mailboxOn = false;
  for (const m of messages) {
    if (m.role === "assistant") {
      // Bild-IDs mitgeben, damit das Modell Bilder später weiterbearbeiten kann.
      const ids = (m.images ?? []).map((img) => img.id);
      const text = ids.length ? `${m.text}\n\n[Erzeugte Bilder, Bild-IDs: ${ids.join(", ")}]` : m.text;
      prepared.push({ role: "assistant", text, native: m.native });
      continue;
    }
    const parts: PreparedPart[] = [];
    if (m.contextDate) parts.push({ type: "text", text: `[Kontext: Heute ist ${m.contextDate}.]` });
    if (opts.mailbox) {
      const on = Boolean(m.connections?.includes("mailbox"));
      if (on !== mailboxOn) parts.push({ type: "text", text: on ? MAILBOX_ON_NOTE : MAILBOX_OFF_NOTE });
      mailboxOn = on;
    }
    for (const a of m.attachments ?? []) {
      parts.push(...(await attachmentParts(a, model, texts, opts)));
    }
    parts.push({ type: "text", text: m.text.trim() ? m.text : "(Siehe Anhang.)" });
    prepared.push({
      role: "user",
      parts: mergeTextParts(parts),
      effort: m.effort ?? "medium",
      webSearch: m.webSearch ?? true,
    });
  }
  return prepared;
}

async function attachmentParts(
  a: Attachment,
  model: ModelRow,
  texts: Map<string, string>,
  opts: { nativePdf: boolean },
): Promise<PreparedPart[]> {
  if (a.kind === "image") {
    if (!model.capabilities.vision || !IMAGE_MIMES.has(a.mime)) {
      return [{ type: "text", text: `[Bild "${a.name}" angehängt – dieses Modell kann keine Bilder sehen.]` }];
    }
    const file = await getFile(a.storageKey);
    const mime = file ? sniffImageMime(file.data) : null;
    if (!file || !mime) {
      return [{ type: "text", text: `[Bild "${a.name}" ist nicht mehr verfügbar.]` }];
    }
    return [
      { type: "text", text: `[Bild "${escapeAttr(a.name)}", Bild-ID: ${a.storageKey}]` },
      { type: "image", mime, base64: file.data.toString("base64") },
    ];
  }
  if (a.kind === "document" && a.mime === "application/pdf" && a.native && opts.nativePdf && model.capabilities.pdf) {
    const file = await getFile(a.storageKey);
    if (file) return [{ type: "pdf", name: a.name, base64: file.data.toString("base64") }];
  }
  const text = texts.get(a.sha256);
  if (text === undefined) {
    return [{ type: "text", text: `[Datei "${a.name}" ist nicht mehr verfügbar. Bitte erneut hochladen.]` }];
  }
  if (a.kind === "transcript") {
    return [{ type: "text", text: `<transkript name="${escapeAttr(a.name)}">\n${text}\n</transkript>` }];
  }
  return [
    {
      type: "text",
      text: `<datei name="${escapeAttr(a.name)}" typ="${escapeAttr(a.mime)}">\n${text}\n</datei>`,
    },
  ];
}

async function loadExtractedTexts(shas: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (shas.length === 0) return map;
  const db = await getDb();
  const rows = await db
    .select({ sha256: schema.fileCache.sha256, text: schema.fileCache.extractedText })
    .from(schema.fileCache)
    .where(inArray(schema.fileCache.sha256, shas));
  for (const r of rows) map.set(r.sha256, r.text);
  // Transkripte liegen in einer eigenen Tabelle (pro Modell). Für den Chat zählt der Inhalt.
  const missing = shas.filter((s) => !map.has(s));
  if (missing.length) {
    const tRows = await db
      .select({ sha256: schema.transcriptCache.sha256, text: schema.transcriptCache.text })
      .from(schema.transcriptCache)
      .where(inArray(schema.transcriptCache.sha256, missing));
    for (const r of tRows) if (!map.has(r.sha256)) map.set(r.sha256, r.text);
  }
  return map;
}

/** Benachbarte Textteile zusammenfassen – weniger Blöcke, gleiches Ergebnis. */
function mergeTextParts(parts: PreparedPart[]): PreparedPart[] {
  const out: PreparedPart[] = [];
  for (const p of parts) {
    const last = out[out.length - 1];
    if (p.type === "text" && last?.type === "text") {
      out[out.length - 1] = { type: "text", text: `${last.text}\n\n${p.text}` };
    } else {
      out.push(p);
    }
  }
  return out;
}

function escapeAttr(value: string): string {
  return value.replace(/"/g, "'").replace(/[<>]/g, "");
}
