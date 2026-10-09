import "server-only";
import { strFromU8, unzipSync } from "fflate";
import { HttpError } from "@/lib/errors";

export type ExtractKind = "pdf" | "docx" | "sheet" | "pptx" | "text";

const MAX_UNZIPPED_BYTES = 200 * 1024 * 1024;

const TEXT_EXTENSIONS = new Set([
  "txt", "md", "markdown", "json", "xml", "html", "htm", "css", "js", "ts", "tsx", "jsx", "py", "java",
  "c", "cpp", "cs", "go", "rb", "php", "sql", "yaml", "yml", "toml", "ini", "log", "sh", "rtf", "tex",
]);

export function extensionOf(name: string): string {
  const m = /\.([a-z0-9]+)$/i.exec(name);
  return m ? m[1].toLowerCase() : "";
}

export function detectKind(name: string, mime: string): ExtractKind | null {
  const ext = extensionOf(name);
  if (ext === "pdf" || mime === "application/pdf") return "pdf";
  if (ext === "docx") return "docx";
  if (["xlsx", "xls", "xlsm", "ods", "csv", "tsv"].includes(ext)) return "sheet";
  if (ext === "pptx") return "pptx";
  if (TEXT_EXTENSIONS.has(ext) || mime.startsWith("text/")) return "text";
  return null;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 3.5);
}

/** Lehnt ZIP-basierte Dateien ab, deren entpackter Inhalt unverhältnismäßig groß ist. */
export function assertZipSafe(data: Uint8Array): void {
  let total = 0;
  let entries = 0;
  unzipSync(data, {
    filter(file) {
      total += file.originalSize;
      entries++;
      if (total > MAX_UNZIPPED_BYTES || entries > 20_000) {
        throw new HttpError(422, "Die Datei ist zu groß oder beschädigt (entpackt über 200 MB).");
      }
      return false; // nur prüfen, nicht entpacken
    },
  });
}

/** Liest den Text einer Datei aus; Fehler kommen als verständliche deutsche Meldung (HTTP 422). */
export async function extractText(data: Buffer, name: string, mime: string): Promise<string> {
  if (data.length === 0) throw new HttpError(422, "Die Datei ist leer.");
  let text: string;
  try {
    text = await extractByKind(data, name, mime);
  } catch (err) {
    if (err instanceof HttpError) throw err;
    console.warn("extract failed", name, err);
    throw new HttpError(422, "Die Datei konnte nicht gelesen werden. Ist sie beschädigt oder passwortgeschützt?");
  }
  if (!text.trim()) throw new HttpError(422, "In der Datei wurde kein lesbarer Text gefunden (z. B. ein eingescanntes PDF).");
  return text;
}

async function extractByKind(data: Buffer, name: string, mime: string): Promise<string> {
  const kind = detectKind(name, mime);
  switch (kind) {
    case "pdf":
      return extractPdf(data);
    case "docx":
      assertZipSafe(data);
      return extractDocx(data);
    case "sheet":
      if (["xlsx", "xlsm", "ods"].includes(extensionOf(name))) assertZipSafe(data);
      return extractSheet(data, name);
    case "pptx":
      assertZipSafe(data);
      return extractPptx(data);
    case "text":
      return decodeText(data);
    default:
      throw new HttpError(422, "Dieses Dateiformat wird nicht unterstützt.");
  }
}

function decodeText(data: Buffer): string {
  const text = new TextDecoder("utf-8", { fatal: false }).decode(data);
  return text.replace(/\r\n/g, "\n").trim();
}

async function extractPdf(data: Buffer): Promise<string> {
  const { extractText: pdfText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(data));
  const { totalPages, text } = await pdfText(pdf, { mergePages: false });
  const pages = text
    .map((t, i) => `--- Seite ${i + 1} von ${totalPages} ---\n${t.replace(/[ \t]+\n/g, "\n").trim()}`)
    .join("\n\n");
  if (!pages.replace(/--- Seite \d+ von \d+ ---/g, "").trim()) {
    return `[Diese PDF-Datei mit ${totalPages} Seiten enthält keinen auslesbaren Text (vermutlich eingescannt). Tipp: Als Bild hochladen oder die PDF nativ an das Modell schicken.]`;
  }
  return pages;
}

async function extractDocx(data: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const TurndownService = (await import("turndown")).default;
  const { gfm } = await import("turndown-plugin-gfm");
  const { value: raw } = await mammoth.convertToHtml({ buffer: data });
  const html = normalizeTables(raw);
  const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-", codeBlockStyle: "fenced" });
  turndown.use(gfm);
  turndown.remove(["img"]);
  return turndown.turndown(html).trim();
}

/**
 * Word-Tabellen haben keine Kopfzeile und Absätze in den Zellen. Damit sie zu Markdown-Tabellen
 * werden, wird die erste Zeile zur Kopfzeile und die Absätze werden entpackt.
 */
export function normalizeTables(html: string): string {
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (_, inner: string) => {
    let body = inner.replace(/<\/?tbody>|<\/?thead>/g, "");
    body = body.replace(/<(td|th)([^>]*)>([\s\S]*?)<\/\1>/g, (_m, tag: string, attrs: string, cell: string) => {
      const text = cell.replace(/<\/p>\s*<p>/g, "<br>").replace(/<\/?p>/g, "").trim();
      return `<${tag}${attrs}>${text}</${tag}>`;
    });
    let first = true;
    body = body.replace(/<tr>([\s\S]*?)<\/tr>/g, (_m, row: string) => {
      if (!first) return `<tr>${row}</tr>`;
      first = false;
      return `<tr>${row.replace(/<td([^>]*)>/g, "<th$1>").replace(/<\/td>/g, "</th>")}</tr>`;
    });
    return `<table>${body}</table>`;
  });
}

async function extractSheet(data: Buffer, name: string): Promise<string> {
  const XLSX = await import("xlsx");
  const ext = extensionOf(name);
  const wb =
    ext === "csv" || ext === "tsv"
      ? XLSX.read(decodeText(data), { type: "string", FS: ext === "tsv" ? "\t" : undefined })
      : XLSX.read(data, { type: "buffer", cellDates: true });
  const parts: string[] = [];
  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws || !ws["!ref"]) continue;
    const range = XLSX.utils.decode_range(ws["!ref"]);
    const rows = range.e.r - range.s.r + 1;
    const cols = range.e.c - range.s.c + 1;
    const csv = XLSX.utils.sheet_to_csv(ws, { blankrows: false, strip: true }).trim();
    if (!csv) continue;
    parts.push(`## Tabellenblatt „${sheetName}“ (${rows} Zeilen × ${cols} Spalten)\n\`\`\`csv\n${csv}\n\`\`\``);
  }
  return parts.join("\n\n") || "[Die Tabelle ist leer.]";
}

function extractPptx(data: Buffer): string {
  const files = unzipSync(new Uint8Array(data), {
    filter: (f) => /^ppt\/(slides\/slide\d+|notesSlides\/notesSlide\d+)\.xml$/.test(f.name),
  });
  const slideNo = (n: string) => Number(/(\d+)\.xml$/.exec(n)?.[1] ?? 0);
  const slides = Object.keys(files)
    .filter((n) => n.startsWith("ppt/slides/"))
    .sort((a, b) => slideNo(a) - slideNo(b));
  const out: string[] = [];
  for (const slide of slides) {
    const n = slideNo(slide);
    const lines = paragraphs(strFromU8(files[slide]));
    const notesFile = files[`ppt/notesSlides/notesSlide${n}.xml`];
    const notes = notesFile ? paragraphs(strFromU8(notesFile)).filter((l) => !/^\d+$/.test(l)) : [];
    let block = `## Folie ${n}\n${lines.join("\n") || "(ohne Text)"}`;
    if (notes.length) block += `\n\nSprechernotizen: ${notes.join(" ")}`;
    out.push(block);
  }
  return out.join("\n\n") || "[Die Präsentation enthält keinen Text.]";
}

function paragraphs(xml: string): string[] {
  const result: string[] = [];
  for (const p of xml.match(/<a:p>[\s\S]*?<\/a:p>/g) ?? []) {
    const text = (p.match(/<a:t>([\s\S]*?)<\/a:t>/g) ?? [])
      .map((t) => decodeXml(t.replace(/<\/?a:t>/g, "")))
      .join("");
    if (text.trim()) result.push(text.trim());
  }
  return result;
}

function decodeXml(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");
}
