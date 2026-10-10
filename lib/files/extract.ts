import "server-only";
import { strFromU8, unzipSync } from "fflate";
import { HttpError } from "@/lib/errors";

export type ExtractKind = "pdf" | "docx" | "sheet" | "pptx" | "mail" | "text";

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
  if (ext === "eml" || mime === "message/rfc822") return "mail";
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
    case "mail":
      return extractMail(data);
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
    // Formatierte Zahlen aus Arbeitsmappen in deutscher Schreibweise (1.234,56 € statt 1,234.56 €).
    // CSV und TSV bleiben, wie sie sind – dort steht der Text so in der Datei.
    if (ext !== "csv" && ext !== "tsv") germanNumbers(ws, XLSX.SSF.is_date);
    const range = XLSX.utils.decode_range(ws["!ref"]);
    const rows = range.e.r - range.s.r + 1;
    const cols = range.e.c - range.s.c + 1;
    const csv = XLSX.utils.sheet_to_csv(ws, { blankrows: false, strip: true }).trim();
    if (!csv) continue;
    parts.push(`## Tabellenblatt „${sheetName}“ (${rows} Zeilen × ${cols} Spalten)\n\`\`\`csv\n${csv}\n\`\`\``);
  }
  return parts.join("\n\n") || "[Die Tabelle ist leer.]";
}

/** Tauscht Tausender- und Dezimaltrennzeichen formatierter Zahlenzellen (nicht bei Datumsformaten). */
export function germanNumbers(ws: Record<string, unknown>, isDate: (fmt: string) => boolean): void {
  for (const [addr, value] of Object.entries(ws)) {
    if (addr.startsWith("!")) continue;
    const cell = value as { t?: string; w?: string; z?: string | number };
    if (cell.t !== "n" || typeof cell.w !== "string") continue;
    if (typeof cell.z === "string" && isDate(cell.z)) continue;
    cell.w = cell.w.replace(/[.,]/g, (c) => (c === "," ? "." : ","));
  }
}

function extractPptx(data: Buffer): string {
  const files = unzipSync(new Uint8Array(data), {
    filter: (f) => /^ppt\/(slides\/slide\d+|slides\/_rels\/slide\d+\.xml|notesSlides\/notesSlide\d+|charts\/chart\d+)\.(xml|rels)$/.test(f.name),
  });
  const slideNo = (n: string) => Number(/(\d+)\.xml$/.exec(n)?.[1] ?? 0);
  const slides = Object.keys(files)
    .filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n))
    .sort((a, b) => slideNo(a) - slideNo(b));
  const out: string[] = [];
  for (const slide of slides) {
    const n = slideNo(slide);
    const lines = paragraphs(strFromU8(files[slide]));
    const notesFile = files[`ppt/notesSlides/notesSlide${n}.xml`];
    const notes = notesFile ? paragraphs(strFromU8(notesFile)).filter((l) => !/^\d+$/.test(l)) : [];
    let block = `## Folie ${n}\n${lines.join("\n") || "(ohne Text)"}`;
    for (const chart of slideCharts(files, n)) block += `\n\n${chart}`;
    if (notes.length) block += `\n\nSprechernotizen: ${notes.join(" ")}`;
    out.push(block);
  }
  return out.join("\n\n") || "[Die Präsentation enthält keinen Text.]";
}

const CHART_TYPES: Record<string, string> = {
  barChart: "Balken/Säulen",
  bar3DChart: "Balken/Säulen",
  lineChart: "Linien",
  line3DChart: "Linien",
  pieChart: "Kreis",
  pie3DChart: "Kreis",
  doughnutChart: "Ring",
  areaChart: "Fläche",
  scatterChart: "Punkte",
};

/** Diagramme einer Folie als Markdown-Tabelle (Kategorien × Datenreihen). */
function slideCharts(files: Record<string, Uint8Array>, slide: number): string[] {
  const rels = files[`ppt/slides/_rels/slide${slide}.xml.rels`];
  if (!rels) return [];
  const targets = [...strFromU8(rels).matchAll(/<Relationship\b[^>]*Type="[^"]*\/chart"[^>]*>/g)]
    .map((m) => /Target="([^"]+)"/.exec(m[0])?.[1] ?? "")
    .map((t) => `ppt/charts/${t.split("/").pop()}`);
  const result: string[] = [];
  for (const target of targets) {
    const file = files[target];
    if (!file) continue;
    const xml = strFromU8(file);
    const type = Object.keys(CHART_TYPES).find((k) => xml.includes(`<c:${k}>`) || xml.includes(`<c:${k} `));
    const textOf = (part: string) => (part.match(/<a:t>([\s\S]*?)<\/a:t>/g) ?? []).map((t) => decodeXml(t.replace(/<\/?a:t>/g, ""))).join("");
    // Titel des Diagramms steht vor der Zeichenfläche, Achsentitel in der Werteachse.
    const head = xml.split("<c:plotArea>")[0];
    const title = textOf(/<c:title>([\s\S]*?)<\/c:title>/.exec(head)?.[1] ?? "");
    const axis = textOf(/<c:valAx>[\s\S]*?<c:title>([\s\S]*?)<\/c:title>/.exec(xml)?.[1] ?? "");
    const points = (part: string) => {
      const map = new Map<number, string>();
      for (const pt of part.matchAll(/<c:pt idx="(\d+)"[^>]*>\s*<c:v>([\s\S]*?)<\/c:v>/g)) map.set(Number(pt[1]), decodeXml(pt[2]));
      return map;
    };
    const series = [...xml.matchAll(/<c:ser>([\s\S]*?)<\/c:ser>/g)].map((m) => {
      const ser = m[1];
      const name = /<c:tx>[\s\S]*?<c:v>([\s\S]*?)<\/c:v>/.exec(ser)?.[1];
      return {
        name: name ? decodeXml(name) : "Werte",
        categories: points(/<c:cat>([\s\S]*?)<\/c:cat>/.exec(ser)?.[1] ?? ""),
        values: points(/<c:val>([\s\S]*?)<\/c:val>/.exec(ser)?.[1] ?? ""),
      };
    });
    if (!series.length) continue;
    const count = Math.max(...series.map((s) => Math.max(s.categories.size, s.values.size)));
    const rows = Array.from({ length: count }, (_, i) => `| ${series[0].categories.get(i) ?? i + 1} | ${series.map((s) => s.values.get(i) ?? "").join(" | ")} |`);
    result.push(
      [
        `Diagramm${type ? ` (${CHART_TYPES[type]})` : ""}${title ? `: ${title}` : ""}${axis ? ` – Werte in ${axis}` : ""}`,
        `| Kategorie | ${series.map((s) => s.name).join(" | ")} |`,
        `| --- | ${series.map(() => "---").join(" | ")} |`,
        ...rows,
      ].join("\n"),
    );
  }
  return result;
}

function paragraphs(xml: string): string[] {
  const result: string[] = [];
  // Foliennummern (Feld „slidenum“) gehören nicht zum Inhalt.
  const content = xml.replace(/<a:fld\b[^>]*type="slidenum"[^>]*>[\s\S]*?<\/a:fld>/g, "");
  for (const p of content.match(/<a:p>[\s\S]*?<\/a:p>/g) ?? []) {
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

// ---------------------------------------------------------------- E-Mails (.eml)

type MailAddress = { name: string; address?: string; group?: MailAddress[] };

function formatAddress(a: MailAddress): string {
  if (a.group) return `${a.name}: ${a.group.map(formatAddress).join(", ")}`;
  return a.name && a.address ? `${a.name} <${a.address}>` : (a.address ?? a.name);
}

function formatSize(bytes: number): string {
  return bytes < 1024 ? `${bytes} Byte` : bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

/** Liest eine E-Mail: Kopfzeilen (Von, An, Cc, Datum, Betreff, Anhänge) und Text, notfalls aus dem HTML-Teil. */
async function extractMail(data: Buffer): Promise<string> {
  const PostalMime = (await import("postal-mime")).default;
  const mail = await PostalMime.parse(new Uint8Array(data));
  const header = (name: string) => mail.headers.some((h) => h.key === name);
  if (!header("from") && !header("subject") && !header("date") && !header("to")) {
    throw new HttpError(422, "Die E-Mail konnte nicht gelesen werden. Ist es wirklich eine .eml-Datei?");
  }
  const lines: string[] = [];
  if (mail.from) lines.push(`Von: ${formatAddress(mail.from as MailAddress)}`);
  if (mail.to?.length) lines.push(`An: ${(mail.to as MailAddress[]).map(formatAddress).join("; ")}`);
  if (mail.cc?.length) lines.push(`Cc: ${(mail.cc as MailAddress[]).map(formatAddress).join("; ")}`);
  if (mail.date) {
    const date = new Date(mail.date);
    lines.push(
      `Datum: ${Number.isNaN(date.getTime()) ? mail.date : new Intl.DateTimeFormat("de-DE", { dateStyle: "full", timeStyle: "short", timeZone: "Europe/Berlin" }).format(date)}`,
    );
  }
  lines.push(`Betreff: ${mail.subject?.trim() || "(ohne Betreff)"}`);
  const files = mail.attachments.filter((a) => a.filename && !a.related);
  if (files.length) {
    const size = (c: ArrayBuffer | Uint8Array | string) => (typeof c === "string" ? Buffer.byteLength(c) : c.byteLength);
    lines.push(`Anhänge: ${files.map((a) => `${a.filename} (${formatSize(size(a.content))})`).join(", ")}`);
  }
  let body = mail.text?.replace(/\r\n/g, "\n").trim() ?? "";
  if (!body && mail.html) {
    const TurndownService = (await import("turndown")).default;
    const turndown = new TurndownService({ headingStyle: "atx", bulletListMarker: "-" });
    turndown.remove(["style", "script", "head", "img"]);
    body = turndown.turndown(mail.html).trim();
  }
  return `${lines.join("\n")}\n\n${body || "(ohne Text)"}`;
}
