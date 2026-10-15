// Gemeinsame Regeln für die Pflege des Fundus im Admin (Browser und Server).
import type { LibraryDocType, LibraryTag } from "@/lib/library/types";
import { unsupportedMessage } from "@/lib/files/limits";
import type { PlaceholderSettings } from "./placeholders";

export const FUNDUS_LIMITS = {
  documents: 500,
  threads: 200,
  prompts: 500,
  categories: 50,
  filesPerUpload: 20,
  mailsPerThread: 50,
  /** Je Datei (wie beim Chat-Upload). */
  fileBytes: 50 * 1024 * 1024,
  threadBytes: 100 * 1024 * 1024,
  title: 120,
  summary: 500,
  keywords: 20,
  keyword: 40,
  categoryName: 40,
  promptTitle: 80,
  promptDescription: 200,
} as const;

/** Endungen eigener Dokumente und ihr Typ im Fundus. */
export const OWN_DOC_EXTENSIONS: Record<string, LibraryDocType> = { docx: "word", xlsx: "excel", pptx: "powerpoint", pdf: "pdf" };

/** Merkmale, die die Kursleitung setzen kann (die Länge setzt Freebie selbst). */
export const OWN_TAGS: LibraryTag[] = ["zahlen", "widersprueche", "personendaten", "unstrukturiert"];

export function extensionOf(name: string): string {
  return /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase() ?? "";
}

export function ownDocType(name: string): LibraryDocType | null {
  return OWN_DOC_EXTENSIONS[extensionOf(name)] ?? null;
}

const LEGACY_TIPS: Record<string, string> = {
  doc: "Das alte Word-Format (.doc) geht nicht. Bitte in Word als .docx speichern und erneut hochladen.",
  xls: "Das alte Excel-Format (.xls) geht nicht. Bitte in Excel als .xlsx speichern und erneut hochladen.",
  ppt: "Das alte PowerPoint-Format (.ppt) geht nicht. Bitte in PowerPoint als .pptx speichern und erneut hochladen.",
  msg: "Outlook-Nachrichten (.msg) gehen nicht. Bitte in Outlook die Mail öffnen und über Datei › Speichern unter als .eml speichern.",
  eml: "E-Mails gehören zu den E-Mail-Verläufen – bitte dort mit „Verlauf hochladen“ hochladen.",
};

/** Prüft Name und Größe einer Datei für den Fundus; liefert eine Meldung oder null. */
export function fundusFileProblem(name: string, size: number, kind: "document" | "mail"): string | null {
  const ext = extensionOf(name);
  if (kind === "mail") {
    if (ext !== "eml") return ext === "msg" ? LEGACY_TIPS.msg : "Bitte nur E-Mails als .eml-Datei hochladen.";
  } else if (!OWN_DOC_EXTENSIONS[ext]) {
    return LEGACY_TIPS[ext] ?? `${unsupportedMessage(name)} Im Fundus gehen Word (.docx), Excel (.xlsx), PowerPoint (.pptx) und PDF.`;
  }
  if (size === 0) return "Die Datei ist leer.";
  if (size > FUNDUS_LIMITS.fileBytes) return `Die Datei ist zu groß (höchstens ${FUNDUS_LIMITS.fileBytes / 1024 / 1024} MB).`;
  return null;
}

/** Betreff ohne „AW:“, „WG:“, „Re:“, „Fwd:“ (auch mehrfach) – Vorschlag für den Titel eines Verlaufs. */
export function stripReplyPrefixes(subject: string): string {
  return subject.replace(/^\s*(?:(?:aw|wg|re|fw|fwd|antw|wtr)\s*(?:\[\d+\])?\s*:\s*)+/i, "").trim();
}

/** Titelvorschlag aus einem Dateinamen: ohne Endung, Unterstriche als Leerzeichen. */
export function titleFromFileName(name: string): string {
  const base = name.replace(/\.[a-z0-9]{1,10}$/i, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();
  return (base || "Dokument").slice(0, FUNDUS_LIMITS.title);
}

// ---------------------------------------------------------------- Antwort von GET /api/admin/fundus

export type FundusSource = "eigen" | "fundus";

export interface AdminFundusDocument {
  id: string;
  source: FundusSource;
  title: string;
  type: LibraryDocType;
  org: string;
  date: string;
  tokens: number;
  fileName: string;
  summary: string;
  tags: LibraryTag[];
  keywords: string[];
  enabled: boolean;
  /** Anhang eines eigenen Verlaufs (lässt sich nur mit dem Verlauf löschen). */
  threadId: string | null;
  threadTitle: string | null;
  hidden: boolean;
}

export interface AdminFundusThread {
  id: string;
  source: FundusSource;
  title: string;
  org: string;
  date: string;
  mails: number;
  attachments: number;
  summary: string;
  tags: LibraryTag[];
  keywords: string[];
  enabled: boolean;
  hidden: boolean;
}

export interface AdminPromptCategory {
  id: string;
  name: string;
  sortOrder: number;
  prompts: number;
  activePrompts: number;
}

export interface AdminPrompt {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  text: string;
  placeholders: PlaceholderSettings;
  enabled: boolean;
  sortOrder: number;
}

export interface FundusOverview {
  revision: number;
  libraryEnabled: boolean;
  storage: "blob" | "local";
  blobUpload: "token" | "presigned" | null;
  documents: AdminFundusDocument[];
  threads: AdminFundusThread[];
  categories: AdminPromptCategory[];
  prompts: AdminPrompt[];
}
