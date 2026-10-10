"use client";
import { mailAddress } from "@/lib/shared/mail";
import type { Conversation } from "./db";

/** Ein Gespräch als Markdown-Datei (inkl. Quellen und Anhänge). */
export function conversationToMarkdown(c: Conversation, modelName: (id?: string) => string | undefined): string {
  const lines: string[] = [`# ${c.title || "Freebie-Chat"}`, "", `_Exportiert aus Freebie am ${new Date().toLocaleString("de-DE")}_`, ""];
  for (const m of c.messages) {
    if (m.role === "user") {
      lines.push("## Du", "");
      for (const a of m.attachments ?? []) lines.push(`> 📎 ${a.name}`);
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
