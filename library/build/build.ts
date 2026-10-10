// Erzeugt den Fundus: echte Dateien, Katalog (Manifest) und Vorschau-Daten in .library/.
// Läuft vor jedem Build (prebuild), vor `next dev` und vor den Unit-Tests.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { estimateTokens, extractText } from "@/lib/files/extract";
import {
  LIBRARY_EXTENSION,
  LIBRARY_MIME,
  lengthTag,
  type LibraryCatalog,
  type LibraryDocument,
  type LibraryPreview,
  type LibraryTag,
  type LibraryThread,
} from "@/lib/library/types";
import { DOCUMENTS, THREADS } from "../content";
import type { DocSpec } from "../types";
import { ORGS } from "../world";
import { renderExcel } from "./excel";
import { renderMail, type MailAttachment } from "./mail";
import { renderPowerPoint } from "./powerpoint";
import { fullName, person, personRef } from "./resolve";
import { validateLibrary } from "./validate";
import { renderWord } from "./word";

export interface LibraryManifest {
  sourceHash: string;
  catalog: LibraryCatalog;
}

export function libraryDir(): string {
  return path.resolve(process.cwd(), ".library");
}

/** Prüfsumme über alles, was den Fundus beeinflusst – unverändert heißt: nichts neu erzeugen. */
function sourceHash(root: string): string {
  const hash = createHash("sha256");
  const walk = (dir: string): string[] =>
    readdirSync(dir)
      .sort()
      .flatMap((n) => {
        const p = path.join(dir, n);
        return statSync(p).isDirectory() ? walk(p) : /\.(ts|mts|md)$/.test(n) ? [p] : [];
      });
  for (const file of [...walk(path.join(root, "library")), path.join(root, "lib/library/types.ts"), path.join(root, "lib/files/extract.ts")]) {
    hash.update(path.relative(root, file)).update(readFileSync(file));
  }
  for (const pkg of ["docx", "exceljs", "pptxgenjs", "fflate", "mammoth", "xlsx"]) {
    const file = path.join(root, "node_modules", pkg, "package.json");
    if (existsSync(file)) hash.update(`${pkg}@${(JSON.parse(readFileSync(file, "utf8")) as { version: string }).version}`);
  }
  return hash.digest("hex");
}

export function readManifest(dir = libraryDir()): LibraryManifest | null {
  try {
    return JSON.parse(readFileSync(path.join(dir, "manifest.json"), "utf8")) as LibraryManifest;
  } catch {
    return null;
  }
}

const sha256 = (data: Buffer) => createHash("sha256").update(data).digest("hex");
const unique = <T>(list: T[]) => [...new Set(list)];

async function renderDoc(doc: DocSpec): Promise<{ data: Buffer; preview: LibraryPreview }> {
  switch (doc.type) {
    case "word":
      return renderWord(doc);
    case "excel":
      return renderExcel(doc);
    case "powerpoint":
      return renderPowerPoint(doc);
  }
}

export async function buildLibrary(opts: { force?: boolean; log?: (line: string) => void } = {}): Promise<{ skipped: boolean; manifest: LibraryManifest }> {
  const root = process.cwd();
  const dir = libraryDir();
  const hash = sourceHash(root);
  const existing = readManifest(dir);
  if (!opts.force && existing?.sourceHash === hash) return { skipped: true, manifest: existing };

  const problems = validateLibrary(DOCUMENTS, THREADS);
  if (problems.length) throw new Error(`Der Fundus enthält Fehler:\n- ${problems.join("\n- ")}`);

  const tmp = `${dir}.tmp-${process.pid}`;
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(path.join(tmp, "files"), { recursive: true });
  mkdirSync(path.join(tmp, "previews"), { recursive: true });
  const writeFile = (id: string, ext: string, data: Buffer) => writeFileSync(path.join(tmp, "files", `${id}.${ext}`), data);
  const writePreview = (id: string, preview: LibraryPreview) => writeFileSync(path.join(tmp, "previews", `${id}.json`), JSON.stringify(preview));

  const rendered = new Map<string, Buffer>();
  const documents: LibraryDocument[] = [];
  for (const doc of DOCUMENTS) {
    const { data, preview } = await renderDoc(doc);
    const fileName = `${doc.fileName}.${LIBRARY_EXTENSION[doc.type]}`;
    const text = await extractText(data, fileName, LIBRARY_MIME[doc.type]);
    const tokens = estimateTokens(text);
    rendered.set(doc.id, data);
    writeFile(doc.id, LIBRARY_EXTENSION[doc.type], data);
    writePreview(doc.id, preview);
    documents.push({
      id: doc.id,
      type: doc.type,
      kind: doc.kind,
      title: doc.title,
      fileName,
      orgId: doc.org,
      unitId: doc.unit,
      date: doc.date,
      author: personRef(doc.author),
      tags: unique<LibraryTag>([lengthTag(tokens), ...(doc.tags ?? [])]),
      keywords: doc.keywords,
      summary: doc.summary,
      size: data.length,
      tokens,
      sha256: sha256(data),
    });
    opts.log?.(`  ${doc.type.padEnd(10)} ${fileName} (${tokens} Tokens)`);
  }

  const threads: LibraryThread[] = [];
  for (const thread of THREADS) {
    const mails: LibraryThread["mails"] = [];
    const previews = [];
    const usedNames = new Set<string>();
    for (let i = 0; i < thread.mails.length; i++) {
      const attachments: MailAttachment[] = (thread.mails[i].attachments ?? []).map((docId) => {
        const doc = documents.find((d) => d.id === docId)!;
        return { id: doc.id, title: doc.title, fileName: doc.fileName, type: doc.type, mime: LIBRARY_MIME[doc.type], data: rendered.get(doc.id)! };
      });
      const mail = renderMail(thread, i, attachments);
      // Gleicher Tag, gleicher Absender: Uhrzeit ergänzen, damit Dateinamen eindeutig bleiben.
      if (usedNames.has(mail.fileName)) mail.fileName = mail.fileName.replace(/\.eml$/, ` ${thread.mails[i].date.slice(11).replace(":", "")}.eml`);
      usedNames.add(mail.fileName);
      const text = await extractText(mail.data, mail.fileName, LIBRARY_MIME.mail);
      const tokens = estimateTokens(text);
      writeFile(mail.id, "eml", mail.data);
      previews.push(mail.preview);
      mails.push({
        id: mail.id,
        subject: mail.subject,
        from: mail.preview.from,
        date: mail.date,
        fileName: mail.fileName,
        size: mail.data.length,
        tokens,
        sha256: sha256(mail.data),
        attachments: attachments.map((a) => a.id),
      });
      opts.log?.(`  mail       ${mail.fileName} (${tokens} Tokens)`);
    }
    writePreview(thread.id, { type: "thread", subject: thread.subject, mails: previews });
    const participants = unique(thread.mails.flatMap((m) => [m.from, ...m.to, ...(m.cc ?? [])]).map((id) => fullName(person(id))));
    threads.push({
      id: thread.id,
      title: thread.title,
      subject: thread.subject,
      orgId: thread.org,
      unitId: thread.unit,
      date: thread.date,
      tags: unique<LibraryTag>([lengthTag(Math.max(...mails.map((m) => m.tokens))), ...(thread.tags ?? [])]),
      keywords: thread.keywords,
      summary: thread.summary,
      participants,
      mails,
    });
  }

  const version = createHash("sha256")
    .update([...documents.map((d) => d.sha256), ...threads.flatMap((t) => t.mails.map((m) => m.sha256))].join(","))
    .digest("hex")
    .slice(0, 12);
  const catalog: LibraryCatalog = {
    version,
    orgs: ORGS.map((o) => ({ id: o.id, name: o.name, short: o.short, level: o.level, color: o.color, units: o.units.map((u) => ({ ...u })) })),
    documents,
    threads,
  };
  const manifest: LibraryManifest = { sourceHash: hash, catalog };
  writeFileSync(path.join(tmp, "manifest.json"), JSON.stringify(manifest));

  rmSync(dir, { recursive: true, force: true });
  renameSync(tmp, dir);
  return { skipped: false, manifest };
}
