"use client";
import { mailAddress, mailName } from "@/lib/shared/mail";
import type { Conversation } from "./db";

/** Ein Gespräch als Markdown-Datei (inkl. Quellen und Anhänge). */
export function conversationToMarkdown(c: Conversation, modelName: (id?: string) => string | undefined): string {
  const lines: string[] = [`# ${c.title || "Freebie-Chat"}`, "", `_Exportiert aus Freebie am ${new Date().toLocaleString("de-DE")}_`, ""];
  for (const m of c.messages) {
    if (m.role === "user") {
      lines.push(m.author ? `## ${mailName(m.author)}` : "## Du", "");
      for (const a of m.attachments ?? []) lines.push(`> 📎 ${a.name}${a.libraryId ? " (Fundus)" : ""}`);
      if (m.attachments?.length) lines.push("");
      lines.push(m.text, "");
    } else {
      lines.push(`## Freebie${modelName(m.modelId) ? ` (${modelName(m.modelId)})` : ""}`, "");
      if (m.text) lines.push(m.text, "");
      for (const img of m.images ?? []) lines.push(`![${img.prompt.replace(/[\[\]]/g, "")}](${img.url})`, "");
      if (m.citations?.length) {
        lines.push("**Quellen:**", ...m.citations.map((q, i) => `${i + 1}. [${q.title}](${q.url})`), "");
      }
      if (m.mails?.read.length) {
        lines.push("**Gelesene E-Mails:**", ...m.mails.read.map((r) => `- „${r.subject || "(Kein Betreff)"}“ von ${mailAddress(r.from)}`), "");
      }
      if (m.mails?.sent.length) {
        lines.push("**Gesendete E-Mails (über Freebie):**", ...m.mails.sent.map((r) => `- „${r.subject || "(Kein Betreff)"}“ an ${r.to.map(mailAddress).join(", ")}`), "");
      }
      if (m.error) lines.push(`> ⚠️ ${m.error}`, "");
    }
  }
  return lines.join("\n");
}

export function downloadText(content: string, name: string, type = "text/markdown") {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function safeName(title: string): string {
  return (title || "freebie-chat").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "").slice(0, 60).toLowerCase() || "freebie-chat";
}

const IMPORT_HOWTO = "Importieren lassen sich nur Export-Dateien von Freebie: die .json-Datei, die „Export“ in der Seitenleiste erzeugt (freebie-chats-JJJJ-MM-TT.json).";

/** Verständliche Meldung, wenn beim Import die falsche Datei gewählt wurde (PDF, Bild, Markdown-Export, leer …). */
export function importProblem(name: string, text: string): string {
  const ext = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase() ?? "";
  if (!text.trim()) return `Die Datei ist leer. ${IMPORT_HOWTO}`;
  if (text.startsWith("%PDF") || ext === "pdf") return `Das ist eine PDF-Datei. ${IMPORT_HOWTO} PDFs lassen sich stattdessen im Chat anhängen.`;
  if (/^(png|jpe?g|gif|webp|heic)$/.test(ext) || text.startsWith("�PNG") || text.startsWith("GIF8")) {
    return `Das ist ein Bild. ${IMPORT_HOWTO} Bilder lassen sich stattdessen im Chat anhängen.`;
  }
  if (ext === "md" || text.startsWith("# ")) return `Das ist ein einzelner Chat als Markdown (zum Lesen und Weitergeben). ${IMPORT_HOWTO}`;
  return `Die Datei konnte nicht importiert werden. ${IMPORT_HOWTO}`;
}
