import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { HttpError } from "@/lib/errors";
import { extractDocument } from "@/lib/files/process";
import { safeFileName } from "@/lib/files/limits";
import { OWN_ORG, lengthTag, type LibraryDocType, type LibraryPreview, type LibraryTag, type MailPreview, type SheetPreview, type Slide } from "@/lib/library/types";
import { FUNDUS_LIMITS, fundusFileProblem, ownDocType, stripReplyPrefixes, titleFromFileName } from "@/lib/shared/fundus";
import { getFile, isUserKey, putFile, registerFile } from "@/lib/storage";
import { realDataHints } from "./hints";
import { countOwn, findOwnBySha, insertOwnItems, newId } from "./store";

// Prüfen und Speichern eigener Dateien und E-Mail-Verläufe der Kursleitung (Plan: FUNDUS-PFLEGE-PLAN.md, Abschnitt 6).

const MIME: Record<LibraryDocType, string> = {
  word: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  excel: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  powerpoint: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  pdf: "application/pdf",
};

const MAX_PREVIEW_CHARS = 60_000;
const MAX_SHEET_ROWS = 200;
const MAX_SHEET_COLS = 30;

/** Schlüssel einer hochgeladenen Fundus-Datei: nur `fundus/<uuid>/<name>`. */
export function assertFundusKey(key: string): void {
  if (!/^fundus\/[a-zA-Z0-9-]{8,64}\/[a-zA-Z0-9_-][a-zA-Z0-9._-]{0,119}$/.test(key) || isUserKey(key)) {
    throw new HttpError(400, "Ungültiger Dateipfad.");
  }
}

export function fundusKeyFor(name: string): string {
  return `fundus/${randomUUID()}/${safeFileName(name)}`;
}

/** Passt der Inhalt zur Endung? Office-Dateien sind ZIP-Archive, PDFs beginnen mit %PDF. */
function contentMatches(data: Buffer, type: LibraryDocType): boolean {
  if (type === "pdf") return data.subarray(0, 1024).includes("%PDF");
  return data[0] === 0x50 && data[1] === 0x4b && data[2] === 0x03 && data[3] === 0x04;
}

export interface CheckedDocument {
  key: string;
  name: string;
  ok: boolean;
  error?: string;
  type?: LibraryDocType;
  size: number;
  sha256?: string;
  tokens?: number;
  length?: LibraryTag;
  title: string;
  hints: string[];
  /** Titel des vorhandenen Eintrags mit derselben Datei. */
  duplicateOf?: string;
  preview?: LibraryPreview;
}

/** Text und Vorschau einer eigenen Datei. */
async function readDocument(data: Buffer, name: string, type: LibraryDocType): Promise<{ text: string; tokens: number; sha256: string; preview: LibraryPreview }> {
  // Ohne „PDF nativ“: Ein PDF ohne Textebene soll beim Hochladen auffallen (422), nicht erst im Chat.
  const { text, tokens, sha256 } = await extractDocument(data, name, MIME[type], { nativePdf: false });
  return { text, tokens, sha256, preview: buildPreview(type, text) };
}

export async function checkDocument(key: string, name: string): Promise<CheckedDocument & { text?: string }> {
  assertFundusKey(key);
  const base: CheckedDocument = { key, name, ok: false, size: 0, title: titleFromFileName(name), hints: [] };
  const file = await getFile(key);
  if (!file) return { ...base, error: "Die hochgeladene Datei wurde nicht gefunden. Bitte erneut hochladen." };
  const problem = fundusFileProblem(name, file.data.length, "document");
  if (problem) return { ...base, size: file.data.length, error: problem };
  const type = ownDocType(name)!;
  if (!contentMatches(file.data, type)) {
    return { ...base, size: file.data.length, error: "Der Inhalt passt nicht zur Endung – ist die Datei umbenannt oder beschädigt?" };
  }
  try {
    const { text, tokens, sha256, preview } = await readDocument(file.data, name, type);
    const duplicateOf = (await findOwnBySha(sha256)) ?? undefined;
    return {
      ...base,
      ok: true,
      type,
      size: file.data.length,
      sha256,
      tokens,
      length: lengthTag(tokens),
      hints: realDataHints(text),
      duplicateOf,
      preview,
      text,
    };
  } catch (err) {
    if (err instanceof HttpError) return { ...base, size: file.data.length, error: err.message };
    throw err;
  }
}

export interface SaveMeta {
  title: string;
  summary: string;
  date: string;
  tags: LibraryTag[];
  keywords: string[];
}

/** Speichert geprüfte Dokumente. Fehlerhafte Dateien werden übersprungen und mit Meldung zurückgegeben. */
export async function saveDocuments(files: { key: string; name: string; meta: SaveMeta }[]): Promise<{ saved: string[]; failed: { name: string; error: string }[] }> {
  if (files.length > FUNDUS_LIMITS.filesPerUpload) throw new HttpError(400, `Höchstens ${FUNDUS_LIMITS.filesPerUpload} Dateien auf einmal.`);
  const existing = await countOwn("document");
  if (existing + files.length > FUNDUS_LIMITS.documents) {
    throw new HttpError(400, `Höchstens ${FUNDUS_LIMITS.documents} eigene Dokumente – im Fundus sind schon ${existing}.`);
  }
  const saved: string[] = [];
  const failed: { name: string; error: string }[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const checked = await checkDocument(f.key, f.name);
    if (!checked.ok || !checked.text) {
      failed.push({ name: f.name, error: checked.error ?? "Die Datei konnte nicht gelesen werden." });
      continue;
    }
    if (checked.duplicateOf || seen.has(checked.sha256!)) {
      failed.push({ name: f.name, error: `Gibt es schon im Fundus${checked.duplicateOf ? ` als „${checked.duplicateOf}“` : ""}.` });
      continue;
    }
    seen.add(checked.sha256!);
    const id = newId("eigen", f.meta.title);
    await insertOwnItems([
      {
        id,
        kind: "document",
        title: f.meta.title,
        summary: f.meta.summary,
        date: f.meta.date,
        tags: [checked.length!, ...f.meta.tags.filter((t) => t !== checked.length)],
        keywords: f.meta.keywords,
        docType: checked.type!,
        fileName: f.name,
        fileKey: f.key,
        mime: MIME[checked.type!],
        size: checked.size,
        sha256: checked.sha256!,
        text: checked.text,
        tokens: checked.tokens!,
        preview: checked.preview!,
      },
    ]);
    await registerFile(f.key, "fundus", MIME[checked.type!], checked.size, "forever");
    saved.push(id);
  }
  return { saved, failed };
}

// ---------------------------------------------------------------- Vorschau aus dem ausgelesenen Text

function parseCsv(csv: string): string[][] {
  const out: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i];
    if (quoted) {
      if (c === '"' && csv[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n") {
      row.push(cell);
      out.push(row);
      row = [];
      cell = "";
    } else if (c !== "\r") cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    out.push(row);
  }
  return out;
}

const NUMBERISH = /^[-+]?[\d.]+(,\d+)?\s*(%|€|EUR|T€)?$/;

function sheetsFromText(text: string): SheetPreview[] {
  const sheets: SheetPreview[] = [];
  for (const m of text.matchAll(/## Tabellenblatt „([^“]*)“[^\n]*\n```csv\n([\s\S]*?)\n```/g)) {
    const grid = parseCsv(m[2]).slice(0, MAX_SHEET_ROWS + 1);
    const width = Math.min(MAX_SHEET_COLS, Math.max(1, ...grid.map((r) => r.length)));
    const cells = grid.map((r) => Array.from({ length: width }, (_, i) => (r[i] ?? "").slice(0, 200)));
    const [header = [], ...body] = cells;
    const columns = Array.from({ length: width }, (_, i) => {
      const numeric = body.length > 0 && body.filter((r) => r[i]).every((r) => NUMBERISH.test(r[i]));
      return { header: header[i] ?? "", width: 14, align: (numeric ? "right" : "left") as "left" | "right" };
    });
    sheets.push({ name: m[1], columns, rows: body.map((r) => ({ cells: r })) });
  }
  return sheets;
}

function slidesFromText(text: string): Slide[] {
  const slides: Slide[] = [];
  for (const block of text.split(/\n(?=## Folie \d+\n)/)) {
    const m = /^## Folie (\d+)\n([\s\S]*)$/.exec(block.trim());
    if (!m) continue;
    const [body, notes] = m[2].split(/\n\nSprechernotizen: /);
    const lines = body
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("|") && l !== "(ohne Text)");
    const hasChart = body.includes("\n|");
    const [title = `Folie ${m[1]}`, ...rest] = lines;
    const bullets = rest.slice(0, 14);
    if (hasChart) bullets.push("(Diagramm – Werte im ausgelesenen Text)");
    slides.push({ t: "bullets", title: title.slice(0, 200), bullets, ...(notes ? { notes: notes.trim().slice(0, 2000) } : {}) });
  }
  return slides;
}

export function buildPreview(type: LibraryDocType, text: string): LibraryPreview {
  if (type === "excel") {
    const sheets = sheetsFromText(text);
    if (sheets.length) return { type: "excel", sheets };
  }
  if (type === "powerpoint") {
    const slides = slidesFromText(text);
    if (slides.length) {
      return { type: "powerpoint", brand: { orgName: OWN_ORG.name, lines: [], color: OWN_ORG.color, accent: "#e41c68", emblem: "" }, slides };
    }
  }
  const truncated = text.length > MAX_PREVIEW_CHARS;
  return { type: "text", format: type === "pdf" ? "pdf" : "word", markdown: truncated ? text.slice(0, MAX_PREVIEW_CHARS) : text, truncated };
}

// ---------------------------------------------------------------- E-Mail-Verläufe

interface ParsedAddress {
  name: string;
  email: string;
}

interface ParsedAttachment {
  name: string;
  size: number;
  data: Buffer;
  supported: boolean;
}

export interface CheckedMail {
  key: string;
  name: string;
  ok: boolean;
  error?: string;
  /** Doppelt (gleiche Message-ID oder gleiche Datei) – wird nicht übernommen. */
  duplicateOf?: string;
  subject: string;
  from: ParsedAddress;
  to: ParsedAddress[];
  cc: ParsedAddress[];
  /** ISO-Zeitpunkt oder null, wenn die Mail kein lesbares Datum hat. */
  date: string | null;
  size: number;
  sha256?: string;
  messageId?: string;
  attachments: { name: string; size: number; supported: boolean }[];
  hints: string[];
}

export interface CheckedThread {
  ok: boolean;
  error?: string;
  title: string;
  participants: string[];
  mails: CheckedMail[];
  hints: string[];
}

type Parsed = CheckedMail & { body: string; data: Buffer; files: ParsedAttachment[] };

function address(a: unknown): ParsedAddress {
  const x = (a ?? {}) as { name?: string; address?: string };
  return { name: (x.name ?? "").trim(), email: (x.address ?? "").trim() };
}

async function parseMail(key: string, name: string): Promise<Parsed> {
  assertFundusKey(key);
  const empty: Parsed = { key, name, ok: false, subject: name, from: { name: "", email: "" }, to: [], cc: [], date: null, size: 0, attachments: [], hints: [], body: "", data: Buffer.alloc(0), files: [] };
  const file = await getFile(key);
  if (!file) return { ...empty, error: "Die hochgeladene Datei wurde nicht gefunden. Bitte erneut hochladen." };
  const problem = fundusFileProblem(name, file.data.length, "mail");
  if (problem) return { ...empty, size: file.data.length, error: problem };
  const PostalMime = (await import("postal-mime")).default;
  let mail: Awaited<ReturnType<typeof PostalMime.parse>>;
  try {
    mail = await PostalMime.parse(new Uint8Array(file.data));
  } catch {
    return { ...empty, size: file.data.length, error: "Die E-Mail konnte nicht gelesen werden. Ist es wirklich eine .eml-Datei?" };
  }
  const has = (h: string) => mail.headers.some((x) => x.key === h);
  if (!has("from") && !has("subject") && !has("date") && !has("to")) {
    return { ...empty, size: file.data.length, error: "Die E-Mail konnte nicht gelesen werden. Ist es wirklich eine .eml-Datei?" };
  }
  let body = mail.text?.replace(/\r\n/g, "\n").trim() ?? "";
  if (!body && mail.html) {
    const TurndownService = (await import("turndown")).default;
    const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });
    turndown.remove(["style", "script", "head", "img"]);
    body = turndown.turndown(mail.html).trim();
  }
  const date = mail.date ? new Date(mail.date) : null;
  const files: ParsedAttachment[] = mail.attachments
    .filter((a) => a.filename && !a.related)
    .map((a) => {
      const data = typeof a.content === "string" ? Buffer.from(a.content) : Buffer.from(a.content as ArrayBuffer);
      return { name: a.filename!, size: data.length, data, supported: Boolean(ownDocType(a.filename!)) };
    });
  return {
    ...empty,
    ok: true,
    error: undefined,
    subject: mail.subject?.trim() || "(ohne Betreff)",
    from: address(mail.from),
    to: (mail.to ?? []).map(address),
    cc: (mail.cc ?? []).map(address),
    date: date && !Number.isNaN(date.getTime()) ? date.toISOString() : null,
    size: file.data.length,
    sha256: createHash("sha256").update(file.data).digest("hex"),
    messageId: mail.messageId?.trim() || undefined,
    attachments: files.map((f) => ({ name: f.name, size: f.size, supported: f.supported })),
    hints: realDataHints(`${body}\n${[mail.from, ...(mail.to ?? []), ...(mail.cc ?? [])].map((a) => address(a).email).join(" ")}`),
    body,
    data: file.data,
    files,
  };
}

/** Sortiert nach Datum; Mails ohne Datum bleiben an ihrer Stelle der Auswahl (hinter der vorigen datierten Mail). */
function sortMails<T extends { date: string | null }>(mails: T[]): T[] {
  let last = "";
  const keyed = mails.map((m, i) => {
    if (m.date) last = m.date;
    return { m, i, key: m.date ?? last };
  });
  return keyed.sort((a, b) => (a.key === b.key ? a.i - b.i : a.key < b.key ? -1 : 1)).map((x) => x.m);
}

async function parseThread(files: { key: string; name: string }[]): Promise<{ checked: CheckedThread; parsed: Parsed[] }> {
  if (!files.length) throw new HttpError(400, "Bitte mindestens eine .eml-Datei hochladen.");
  if (files.length > FUNDUS_LIMITS.mailsPerThread) throw new HttpError(400, `Höchstens ${FUNDUS_LIMITS.mailsPerThread} Mails je Verlauf.`);
  const parsed: Parsed[] = [];
  for (const f of files) parsed.push(await parseMail(f.key, f.name));
  const total = parsed.reduce((s, p) => s + p.size, 0);
  if (total > FUNDUS_LIMITS.threadBytes) throw new HttpError(413, `Der Verlauf ist zu groß (zusammen höchstens ${FUNDUS_LIMITS.threadBytes / 1024 / 1024} MB).`);
  // Doppelte Mails (gleiche Message-ID oder gleiche Datei) nur einmal.
  const seen = new Map<string, string>();
  for (const p of parsed.filter((x) => x.ok)) {
    const ids = [p.messageId ? `id:${p.messageId}` : "", `sha:${p.sha256}`].filter(Boolean);
    const dup = ids.map((i) => seen.get(i)).find(Boolean);
    if (dup) {
      p.duplicateOf = dup;
      continue;
    }
    const existing = await findOwnBySha(p.sha256!);
    if (existing) {
      p.duplicateOf = existing;
      continue;
    }
    for (const i of ids) seen.set(i, p.name);
  }
  const usable = sortMails(parsed.filter((p) => p.ok && !p.duplicateOf));
  const others = parsed.filter((p) => !p.ok || p.duplicateOf);
  const hints: string[] = [];
  if (usable.some((p) => !p.date)) hints.push("Mindestens eine Mail hat kein Datum – sie steht an der Stelle, an der sie ausgewählt wurde.");
  const participants = [...new Set(usable.flatMap((p) => [p.from, ...p.to, ...p.cc]).map((a) => a.name || a.email).filter(Boolean))];
  for (const h of [...new Set(usable.flatMap((p) => p.hints))]) hints.push(h);
  const title = (usable[0] ? stripReplyPrefixes(usable[0].subject) : "") || "E-Mail-Verlauf";
  const checked: CheckedThread = {
    ok: usable.length > 0,
    error: usable.length ? undefined : "Keine der Dateien ist eine lesbare, neue E-Mail.",
    title: title.slice(0, FUNDUS_LIMITS.title),
    participants,
    mails: [...usable, ...others].map((p) => ({
      key: p.key,
      name: p.name,
      ok: p.ok,
      error: p.error,
      duplicateOf: p.duplicateOf,
      subject: p.subject,
      from: p.from,
      to: p.to,
      cc: p.cc,
      date: p.date,
      size: p.size,
      sha256: p.sha256,
      messageId: p.messageId,
      attachments: p.attachments,
      hints: p.hints,
    })),
    hints,
  };
  return { checked, parsed: usable };
}

export async function checkThread(files: { key: string; name: string }[]): Promise<CheckedThread> {
  return (await parseThread(files)).checked;
}

function berlinDay(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

/** Speichert einen geprüften Verlauf: Mails, unterstützte Anhänge als Dokumente des Verlaufs, Dateien dauerhaft. */
export async function saveThread(files: { key: string; name: string }[], meta: SaveMeta): Promise<{ id: string; mails: number; attachments: number }> {
  if ((await countOwn("thread")) >= FUNDUS_LIMITS.threads) throw new HttpError(400, `Höchstens ${FUNDUS_LIMITS.threads} eigene Verläufe.`);
  const { checked, parsed } = await parseThread(files);
  if (!checked.ok) throw new HttpError(422, checked.error ?? "Keine der Dateien ist eine lesbare E-Mail.");
  const threadId = newId("eigen", meta.title);
  const docItems: (Parameters<typeof insertOwnItems>[0][number])[] = [];
  const mailRows: NonNullable<Parameters<typeof insertOwnItems>[1]> = [];
  const previews: MailPreview[] = [];
  let maxTokens = 0;
  for (const [i, p] of parsed.entries()) {
    const mailId = `${threadId}-${i + 1}`;
    const { text, tokens, sha256 } = await extractDocument(p.data, p.name, "message/rfc822", { nativePdf: false });
    maxTokens = Math.max(maxTokens, tokens);
    const attachmentIds: string[] = [];
    const attachmentPreviews: MailPreview["attachments"] = [];
    for (const a of p.files.filter((x) => x.supported)) {
      const type = ownDocType(a.name)!;
      if (!contentMatches(a.data, type)) continue;
      try {
        const doc = await readDocument(a.data, a.name, type);
        const id = newId("eigen", titleFromFileName(a.name));
        const key = fundusKeyFor(a.name);
        await putFile(key, a.data, MIME[type], "fundus", "forever");
        docItems.push({
          id,
          kind: "document",
          title: titleFromFileName(a.name),
          summary: `Anhang aus dem Verlauf „${meta.title}“.`,
          date: berlinDay(p.date),
          tags: [lengthTag(doc.tokens)],
          keywords: [],
          docType: type,
          fileName: a.name,
          fileKey: key,
          mime: MIME[type],
          size: a.data.length,
          sha256: doc.sha256,
          text: doc.text,
          tokens: doc.tokens,
          preview: doc.preview,
          threadId,
        });
        attachmentIds.push(id);
        attachmentPreviews.push({ id, title: titleFromFileName(a.name), fileName: a.name, type });
      } catch (err) {
        if (!(err instanceof HttpError)) throw err;
      }
    }
    mailRows.push({
      id: mailId,
      threadId,
      position: i + 1,
      subject: p.subject,
      fromName: p.from.name,
      fromEmail: p.from.email,
      to: p.to,
      cc: p.cc,
      date: p.date ? new Date(p.date) : null,
      messageId: p.messageId ?? null,
      fileName: p.name,
      fileKey: p.key,
      size: p.size,
      sha256,
      text,
      tokens,
      body: p.body,
      attachments: attachmentIds,
    });
    previews.push({
      id: mailId,
      subject: p.subject,
      from: { name: p.from.name || p.from.email, email: p.from.email },
      to: p.to.map((a) => ({ name: a.name || a.email, email: a.email })),
      cc: p.cc.map((a) => ({ name: a.name || a.email, email: a.email })),
      date: p.date ?? "",
      body: p.body || "(ohne Text)",
      attachments: attachmentPreviews,
    });
  }
  const last = parsed.at(-1)?.date ?? null;
  const preview: LibraryPreview = { type: "thread", subject: parsed[0].subject, mails: previews };
  await insertOwnItems(
    [
      {
        id: threadId,
        kind: "thread",
        title: meta.title,
        summary: meta.summary,
        date: meta.date || berlinDay(last),
        tags: [lengthTag(maxTokens), ...meta.tags.filter((t) => t !== lengthTag(maxTokens))],
        keywords: meta.keywords,
        preview,
      },
      ...docItems,
    ],
    mailRows,
  );
  for (const p of parsed) await registerFile(p.key, "fundus", "message/rfc822", p.size, "forever");
  return { id: threadId, mails: mailRows.length, attachments: docItems.length };
}
