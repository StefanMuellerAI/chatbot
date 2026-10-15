import "server-only";
import { randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { HttpError } from "@/lib/errors";
import { extractDocument } from "@/lib/files/process";
import { fundusRevision, getOwnItem, getOwnMail, listCategories, listHidden, listOwnItems, listPrompts, type OwnItemRow, type OwnMailRow } from "@/lib/fundus/store";
import type { Attachment } from "@/lib/shared/types";
import { safeFileName } from "@/lib/files/limits";
import { type PlaceholderSettings, resolvePlaceholders } from "@/lib/shared/placeholders";
import { getFile } from "@/lib/storage";
import {
  LIBRARY_EXTENSION,
  LIBRARY_ID,
  LIBRARY_MIME,
  LIBRARY_TYPE_LABEL,
  OWN_ORG,
  OWN_ORG_ID,
  type FundusCatalog,
  type LibraryCatalog,
  type LibraryDocType,
  type LibraryDocument,
  type LibraryFileType,
  type LibraryMail,
  type LibraryPreview,
  type LibraryTag,
  type LibraryThread,
} from "./types";

// Der mitgelieferte Fundus liegt als fertige Dateien im Deployment (.library/, erzeugt von library/build beim Build).
// Eigene Inhalte der Kursleitung, Prompts und ausgeblendete Einträge kommen aus der Datenbank (lib/fundus/store.ts).

function root(): string {
  return path.join(process.cwd(), ".library");
}

let cache: { mtimeMs: number; catalog: LibraryCatalog } | null = null;

/** Nur der mitgelieferte Fundus (unverändert aus dem Build). */
export async function getCatalog(): Promise<LibraryCatalog> {
  const file = path.join(root(), "manifest.json");
  let mtimeMs: number;
  try {
    mtimeMs = (await stat(file)).mtimeMs;
  } catch {
    throw new HttpError(503, "Der Fundus ist gerade nicht verfügbar.");
  }
  if (!cache || cache.mtimeMs !== mtimeMs) {
    const manifest = JSON.parse(await readFile(file, "utf8")) as { catalog: LibraryCatalog };
    cache = { mtimeMs, catalog: manifest.catalog };
  }
  return cache.catalog;
}

export function isOwnId(id: string): boolean {
  return id.startsWith(`${OWN_ORG_ID}-`);
}

// ---------------------------------------------------------------- Eigene Inhalte im Katalog

function ownDocument(row: OwnItemRow): LibraryDocument {
  const type = row.docType as LibraryDocType;
  return {
    id: row.id,
    type,
    kind: row.threadId ? "Anhang" : `${LIBRARY_TYPE_LABEL[type]}-Datei`,
    title: row.title,
    fileName: row.fileName ?? row.title,
    orgId: OWN_ORG_ID,
    unitId: "",
    date: row.date,
    author: { name: "Kursleitung", email: "" },
    tags: row.tags as LibraryTag[],
    keywords: row.keywords as string[],
    summary: row.summary,
    size: row.size,
    tokens: row.tokens,
    sha256: row.sha256 ?? "",
  };
}

function ownMail(row: OwnMailRow): LibraryMail {
  return {
    id: row.id,
    subject: row.subject,
    from: { name: row.fromName || row.fromEmail, email: row.fromEmail },
    date: row.date ? row.date.toISOString() : "",
    fileName: row.fileName,
    size: row.size,
    tokens: row.tokens,
    sha256: row.sha256,
    attachments: row.attachments as string[],
  };
}

function ownThread(row: OwnItemRow, mails: OwnMailRow[]): LibraryThread {
  const participants = new Set<string>();
  for (const m of mails) {
    participants.add(m.fromName || m.fromEmail);
    for (const a of [...(m.to as { name: string; email: string }[]), ...(m.cc as { name: string; email: string }[])]) participants.add(a.name || a.email);
  }
  participants.delete("");
  return {
    id: row.id,
    title: row.title,
    subject: mails[0]?.subject ?? row.title,
    orgId: OWN_ORG_ID,
    unitId: "",
    date: row.date,
    tags: row.tags as LibraryTag[],
    keywords: row.keywords as string[],
    summary: row.summary,
    participants: [...participants],
    mails: mails.map(ownMail),
  };
}

type Merged = { key: string; catalog: FundusCatalog };
const globalCache = globalThis as unknown as { freebieFundusCatalog?: Merged };

/** Katalog für den Chat: mitgeliefert (ohne ausgeblendete) + eigene (nur aktive) + Kategorien und aktive Prompts. */
export async function getFundusCatalog(): Promise<FundusCatalog> {
  const builtIn = await getCatalog();
  const revision = await fundusRevision();
  const key = `${builtIn.version}-${revision}`;
  if (globalCache.freebieFundusCatalog?.key === key) return globalCache.freebieFundusCatalog.catalog;
  const hidden = new Set(await listHidden());
  const { items, mails } = await listOwnItems();
  const threads = items.filter((i) => i.kind === "thread" && i.enabled);
  const activeThreads = new Set(threads.map((t) => t.id));
  const docs = items.filter((i) => i.kind === "document" && i.enabled && (!i.threadId || activeThreads.has(i.threadId)));
  const ownThreads = threads.map((t) => ownThread(t, mails.filter((m) => m.threadId === t.id)));
  const categories = (await listCategories()).filter((c) => c.activePrompts > 0);
  const prompts = (await listPrompts()).filter((p) => categories.some((c) => c.id === p.categoryId));
  const own = [...docs.map((d) => d.id), ...ownThreads.map((t) => t.id)];
  const catalog: FundusCatalog = {
    version: key,
    orgs: own.length ? [...builtIn.orgs, OWN_ORG] : builtIn.orgs,
    documents: [...builtIn.documents.filter((d) => !hidden.has(d.id)), ...docs.map(ownDocument)],
    threads: [...builtIn.threads.filter((t) => !hidden.has(t.id)), ...ownThreads],
    categories: categories.map((c) => ({ id: c.id, name: c.name })),
    prompts: prompts.map((p) => ({
      id: p.id,
      categoryId: p.categoryId,
      title: p.title,
      description: p.description,
      text: p.text,
      placeholders: resolvePlaceholders(p.text, p.placeholders as PlaceholderSettings),
    })),
    own,
  };
  globalCache.freebieFundusCatalog = { key, catalog };
  return catalog;
}

// ---------------------------------------------------------------- Einträge finden

export type LibraryItem =
  | { kind: "document"; doc: LibraryDocument }
  | { kind: "mail"; mail: LibraryMail; thread: LibraryThread }
  | { kind: "thread"; thread: LibraryThread }
  | { kind: "own-document"; row: OwnItemRow }
  | { kind: "own-mail"; mail: OwnMailRow; thread: OwnItemRow }
  | { kind: "own-thread"; row: OwnItemRow };

const NOT_FOUND = "Nicht im Fundus gefunden.";

async function findOwn(id: string, includeInactive: boolean): Promise<LibraryItem> {
  const active = async (row: OwnItemRow) => {
    if (includeInactive) return true;
    if (!row.enabled) return false;
    if (row.threadId) return Boolean((await getOwnItem(row.threadId))?.enabled);
    return true;
  };
  const row = await getOwnItem(id);
  if (row && (await active(row))) return row.kind === "thread" ? { kind: "own-thread", row } : { kind: "own-document", row };
  if (!row) {
    const mail = await getOwnMail(id);
    const thread = mail ? await getOwnItem(mail.threadId) : null;
    if (mail && thread && (await active(thread))) return { kind: "own-mail", mail, thread };
  }
  throw new HttpError(404, NOT_FOUND);
}

/**
 * Prüft die ID und sucht Dokument, E-Mail oder Verlauf (400 bei ungültiger, 404 bei unbekannter ID). Ausgeblendete
 * und inaktive Einträge gibt es nur mit `includeHidden` (bereits angehängt in bestehenden Chats).
 */
export async function findItem(id: string, opts: { includeHidden?: boolean } = {}): Promise<LibraryItem> {
  if (!LIBRARY_ID.test(id)) throw new HttpError(400, "Ungültige ID.");
  if (isOwnId(id)) return findOwn(id, Boolean(opts.includeHidden));
  const catalog = await getCatalog();
  const found = ((): LibraryItem | null => {
    const doc = catalog.documents.find((d) => d.id === id);
    if (doc) return { kind: "document", doc };
    for (const thread of catalog.threads) {
      if (thread.id === id) return { kind: "thread", thread };
      const mail = thread.mails.find((m) => m.id === id);
      if (mail) return { kind: "mail", mail, thread };
    }
    return null;
  })();
  if (!found) throw new HttpError(404, NOT_FOUND);
  if (!opts.includeHidden) {
    const hidden = new Set(await listHidden());
    const ownerId = found.kind === "document" ? found.doc.id : found.kind === "mail" || found.kind === "thread" ? found.thread.id : "";
    if (hidden.has(ownerId)) throw new HttpError(404, NOT_FOUND);
  }
  return found;
}

export interface LibraryFile {
  id: string;
  type: LibraryFileType;
  fileName: string;
  mime: string;
  data: Buffer;
  /** Ablage-Schlüssel eigener Dateien (fundus/…). */
  storageKey?: string;
}

async function ownFile(id: string, key: string | null, fileName: string, type: LibraryFileType): Promise<LibraryFile> {
  const file = key ? await getFile(key) : null;
  if (!file) throw new HttpError(404, "Die Datei ist nicht mehr verfügbar.");
  return { id, type, fileName, mime: LIBRARY_MIME[type], data: file.data, storageKey: key! };
}

/** Datei eines Dokuments oder einer E-Mail (Verläufe selbst haben keine Datei). */
export async function readLibraryFile(id: string, opts: { includeHidden?: boolean } = {}): Promise<LibraryFile> {
  const item = await findItem(id, opts);
  if (item.kind === "thread" || item.kind === "own-thread") throw new HttpError(404, "Ein Verlauf hat keine eigene Datei – bitte eine E-Mail daraus wählen.");
  if (item.kind === "own-document") return ownFile(id, item.row.fileKey, item.row.fileName ?? item.row.title, item.row.docType as LibraryDocType);
  if (item.kind === "own-mail") return ownFile(id, item.mail.fileKey, item.mail.fileName, "mail");
  const type: LibraryFileType = item.kind === "document" ? item.doc.type : "mail";
  const fileName = item.kind === "document" ? item.doc.fileName : item.mail.fileName;
  const data = await readFile(path.join(root(), "files", `${id}.${LIBRARY_EXTENSION[type]}`));
  return { id, type, fileName, mime: LIBRARY_MIME[type], data };
}

export async function readPreview(id: string, opts: { includeHidden?: boolean } = {}): Promise<LibraryPreview> {
  const item = await findItem(id, opts);
  if (item.kind === "own-document" || item.kind === "own-thread") return item.row.preview as LibraryPreview;
  if (item.kind === "own-mail") return item.thread.preview as LibraryPreview;
  const previewId = item.kind === "mail" ? item.thread.id : id;
  return JSON.parse(await readFile(path.join(root(), "previews", `${previewId}.json`), "utf8")) as LibraryPreview;
}

/** Macht aus einem Fundus-Eintrag einen Anhang – wie ein Upload, nur ohne Hochladen. */
export async function libraryAttachment(id: string, opts: { nativePdf: boolean }): Promise<{ attachment: Attachment; cached: boolean }> {
  const file = await readLibraryFile(id);
  const { sha256, text, tokens, cached } = await extractDocument(file.data, file.fileName, file.mime, opts);
  return {
    cached,
    attachment: {
      id: randomUUID(),
      kind: "document",
      name: file.fileName,
      mime: file.mime,
      size: file.data.length,
      sha256,
      storageKey: file.storageKey ?? `library/${id}/${safeFileName(file.fileName)}`,
      tokenEstimate: tokens,
      preview: text.slice(0, 600),
      libraryId: id,
      // Eigene PDFs dürfen nativ ans Modell (wenn „PDF nativ“ an ist und das Modell es kann – entscheidet prepare.ts).
      ...(file.type === "pdf" ? { native: true } : {}),
    },
  };
}

/**
 * Text eines Fundus-Anhangs, falls der Datei-Cache ihn nicht mehr hat (Aufräumjob): mitgelieferte Dateien neu
 * auslesen, eigene aus der Datenbank. Ausgeblendete und inaktive Einträge bleiben in bestehenden Chats nutzbar.
 */
export async function libraryText(id: string): Promise<string | undefined> {
  try {
    if (isOwnId(id)) {
      const item = await findItem(id, { includeHidden: true });
      if (item.kind === "own-document") return item.row.text ?? undefined;
      if (item.kind === "own-mail") return item.mail.text;
      return undefined;
    }
    const file = await readLibraryFile(id, { includeHidden: true });
    return (await extractDocument(file.data, file.fileName, file.mime, { nativePdf: false })).text;
  } catch (err) {
    if (err instanceof HttpError) return undefined;
    throw err;
  }
}
