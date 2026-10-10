import "server-only";
import { randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { HttpError } from "@/lib/errors";
import { extractDocument } from "@/lib/files/process";
import type { Attachment } from "@/lib/shared/types";
import { safeFileName } from "@/lib/files/limits";
import {
  LIBRARY_EXTENSION,
  LIBRARY_ID,
  LIBRARY_MIME,
  type LibraryCatalog,
  type LibraryDocument,
  type LibraryFileType,
  type LibraryMail,
  type LibraryPreview,
  type LibraryThread,
} from "./types";

// Der Fundus liegt als fertige Dateien im Deployment (.library/, erzeugt von library/build beim Build).

function root(): string {
  return path.join(process.cwd(), ".library");
}

let cache: { mtimeMs: number; catalog: LibraryCatalog } | null = null;

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

export type LibraryItem =
  | { kind: "document"; doc: LibraryDocument }
  | { kind: "mail"; mail: LibraryMail; thread: LibraryThread }
  | { kind: "thread"; thread: LibraryThread };

/** Prüft die ID und sucht Dokument, E-Mail oder Verlauf (400 bei ungültiger, 404 bei unbekannter ID). */
export async function findItem(id: string): Promise<LibraryItem> {
  if (!LIBRARY_ID.test(id)) throw new HttpError(400, "Ungültige ID.");
  const catalog = await getCatalog();
  const doc = catalog.documents.find((d) => d.id === id);
  if (doc) return { kind: "document", doc };
  for (const thread of catalog.threads) {
    if (thread.id === id) return { kind: "thread", thread };
    const mail = thread.mails.find((m) => m.id === id);
    if (mail) return { kind: "mail", mail, thread };
  }
  throw new HttpError(404, "Nicht im Fundus gefunden.");
}

export interface LibraryFile {
  id: string;
  type: LibraryFileType;
  fileName: string;
  mime: string;
  data: Buffer;
}

/** Datei eines Dokuments oder einer E-Mail (Verläufe selbst haben keine Datei). */
export async function readLibraryFile(id: string): Promise<LibraryFile> {
  const item = await findItem(id);
  if (item.kind === "thread") throw new HttpError(404, "Ein Verlauf hat keine eigene Datei – bitte eine E-Mail daraus wählen.");
  const type: LibraryFileType = item.kind === "document" ? item.doc.type : "mail";
  const fileName = item.kind === "document" ? item.doc.fileName : item.mail.fileName;
  const data = await readFile(path.join(root(), "files", `${id}.${LIBRARY_EXTENSION[type]}`));
  return { id, type, fileName, mime: LIBRARY_MIME[type], data };
}

export async function readPreview(id: string): Promise<LibraryPreview> {
  const item = await findItem(id);
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
      storageKey: `library/${id}/${safeFileName(file.fileName)}`,
      tokenEstimate: tokens,
      preview: text.slice(0, 600),
      libraryId: id,
    },
  };
}

/** Text eines Fundus-Anhangs, falls der Datei-Cache ihn nicht mehr hat (Aufräumjob). */
export async function libraryText(id: string): Promise<string | undefined> {
  try {
    const file = await readLibraryFile(id);
    return (await extractDocument(file.data, file.fileName, file.mime, { nativePdf: false })).text;
  } catch (err) {
    if (err instanceof HttpError) return undefined;
    throw err;
  }
}
