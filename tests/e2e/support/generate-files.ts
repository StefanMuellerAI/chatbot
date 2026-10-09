// Erzeugt alle Testdateien beim Teststart (keine Binärdateien im Repo).
import { execFileSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { deflateSync } from "node:zlib";
import ffmpegStatic from "ffmpeg-static";
import { strToU8, zipSync } from "fflate";
import * as XLSX from "xlsx";

export const FIXTURE_DIR = path.resolve(".data/e2e/fixtures");
const VERSION = "3";

export function fixture(name: string): string {
  return path.join(FIXTURE_DIR, name);
}

export async function generateFiles() {
  const marker = fixture(`.version-${VERSION}`);
  if (existsSync(marker)) return;
  mkdirSync(FIXTURE_DIR, { recursive: true });
  const write = (name: string, data: Uint8Array | string) => writeFileSync(fixture(name), data);

  // ── Text ──────────────────────────────────────────────────────────────
  write("notiz.txt", "Das ist eine Testnotiz für Freebie. Kennwort: LEUCHTTURM.");
  write("umsatz.csv", "Monat,Umsatz\nJanuar,100\nFebruar,120\n");
  write("tabelle.tsv", "Stadt\tEinwohner\nLeipzig\t620000\nDresden\t560000\n");
  write("readme.md", "# Anleitung\n\nSchritt **eins**: Kaffee kochen.\n");
  write("daten.json", JSON.stringify({ projekt: "Freebie", version: 1 }));
  write("skript.py", 'print("Hallo aus Python")\n');
  write("leer.txt", "");
  write("Übersicht Größe – März 🚀.txt", "Umlaute im Dateinamen funktionieren.");

  // ── PDF (zweiseitig, von Hand gebaut) ─────────────────────────────────
  write("bericht.pdf", pdf(["Umsatzbericht Seite eins", "Fazit Seite zwei"]));
  write("kaputt.pdf", Buffer.from("%PDF-1.7\nkaputt kaputt kaputt"));

  // ── Word ──────────────────────────────────────────────────────────────
  write("vertrag.docx", docx());
  // Zip-Bombe: über 200 MB entpackt.
  write(
    "bombe.docx",
    Buffer.from(
      zipSync({
        "[Content_Types].xml": strToU8("<Types/>"),
        "word/document.xml": [new Uint8Array(210 * 1024 * 1024), { level: 9 }],
      }),
    ),
  );

  // ── Tabellen ──────────────────────────────────────────────────────────
  const wb = XLSX.utils.book_new();
  const umsatz = XLSX.utils.aoa_to_sheet([["Monat", "Umsatz"], ["Januar", 100], ["Februar", 120], ["Summe", { f: "SUM(B2:B3)", v: 220 }]]);
  XLSX.utils.book_append_sheet(wb, umsatz, "Umsatz");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Posten", "Kosten"], ["Miete", 900]]), "Kosten");
  write("zahlen.xlsx", XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
  write("zahlen.xls", XLSX.write(wb, { type: "buffer", bookType: "biff8" }));
  write("zahlen.ods", XLSX.write(wb, { type: "buffer", bookType: "ods" }));

  // ── PowerPoint ────────────────────────────────────────────────────────
  write("folien.pptx", pptx());

  // ── Bilder ────────────────────────────────────────────────────────────
  write("punkt.png", png(2, 2, () => [255, 105, 0]));
  write("gross.png", png(4000, 3000, (x) => [x % 256, 80, 160]));
  write("rauschen.png", png(2400, 1800, null));
  write("falsch.pdf", png(2, 2, () => [0, 0, 0]));
  const ff = ffmpegStatic as unknown as string;
  const ffmpeg = (...args: string[]) => execFileSync(ff, ["-hide_banner", "-loglevel", "error", "-y", ...args]);
  ffmpeg("-f", "lavfi", "-i", "color=c=orange:s=320x240", "-frames:v", "1", fixture("foto.jpg"));
  ffmpeg("-f", "lavfi", "-i", "color=c=purple:s=320x240", "-frames:v", "1", fixture("grafik.webp"));
  ffmpeg("-f", "lavfi", "-i", "color=c=green:s=64x64", "-frames:v", "1", fixture("animation.gif"));

  // ── Audio ─────────────────────────────────────────────────────────────
  const tone = (seconds: number) => ["-f", "lavfi", "-i", `sine=frequency=440:duration=${seconds}`];
  ffmpeg(...tone(5), "-ac", "1", fixture("ton.mp3"));
  ffmpeg(...tone(1500), "-ac", "1", "-ar", "16000", "-b:a", "24k", fixture("lang.mp3"));
  ffmpeg(...tone(3), "-c:a", "aac", fixture("ton.m4a"));
  ffmpeg(...tone(3), fixture("ton.wav"));
  ffmpeg(...tone(3), "-c:a", "libopus", fixture("ton.ogg"));
  ffmpeg(...tone(3), "-c:a", "libopus", fixture("ton.webm"));
  ffmpeg(...tone(3), fixture("ton.flac"));
  ffmpeg("-f", "lavfi", "-i", "color=c=blue:s=64x64:d=2", "-an", fixture("nur-video.mp4"));
  write("kaputt.mp3", randomBytes(4096));

  writeFileSync(marker, new Date().toISOString());
}

/** Minimales, gültiges PDF mit einer Textzeile pro Seite. */
function pdf(pages: string[]): Buffer {
  const objects: string[] = [];
  const pageIds = pages.map((_, i) => 4 + i * 2);
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  pages.forEach((line, i) => {
    const content = `BT /F1 18 Tf 72 720 Td (${line}) Tj ET`;
    objects[pageIds[i]] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${pageIds[i] + 1} 0 R >>`;
    objects[pageIds[i] + 1] = `<< /Length ${content.length} >>\nstream\n${content}\nendstream`;
  });
  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = out.length;
    out += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = out.length;
  out += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) out += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(out, "latin1");
}

function docx(): Buffer {
  const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
  const p = (text: string, style?: string) => `<w:p>${style ? `<w:pPr><w:pStyle w:val="${style}"/></w:pPr>` : ""}<w:r><w:t xml:space="preserve">${text}</w:t></w:r></w:p>`;
  const cell = (text: string) => `<w:tc><w:p><w:r><w:t>${text}</w:t></w:r></w:p></w:tc>`;
  const body = [
    p("Mietvertrag", "Heading1"),
    p("Die Größe der Wohnung beträgt 72 Quadratmeter. Übergabe im März."),
    `<w:tbl><w:tr>${cell("Posten")}${cell("Betrag")}</w:tr><w:tr>${cell("Kaltmiete")}${cell("900 €")}</w:tr></w:tbl>`,
  ].join("");
  return Buffer.from(
    zipSync({
      "[Content_Types].xml": strToU8(
        '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>',
      ),
      "_rels/.rels": strToU8(
        '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
      ),
      "word/_rels/document.xml.rels": strToU8(
        '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>',
      ),
      "word/styles.xml": strToU8(
        `<?xml version="1.0" encoding="UTF-8"?><w:styles ${W}><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/></w:style></w:styles>`,
      ),
      "word/document.xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?><w:document ${W}><w:body>${body}</w:body></w:document>`),
    }),
  );
}

function pptx(): Buffer {
  const A = 'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"';
  const slide = (lines: string[]) =>
    strToU8(
      `<?xml version="1.0" encoding="UTF-8"?><p:sld ${A}><p:cSld><p:spTree><p:sp><p:txBody>${lines
        .map((l) => `<a:p><a:r><a:t>${l}</a:t></a:r></a:p>`)
        .join("")}</p:txBody></p:sp></p:spTree></p:cSld></p:sld>`,
    );
  return Buffer.from(
    zipSync({
      "[Content_Types].xml": strToU8('<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"/>'),
      "ppt/slides/slide1.xml": slide(["Agenda", "Begrüßung"]),
      "ppt/slides/slide2.xml": slide(["Ergebnisse", "Umsatz plus zehn Prozent"]),
      "ppt/notesSlides/notesSlide2.xml": slide(["Hier die Zahlen langsam erklären", "2"]),
    }),
  );
}

/** PNG-Encoder; ohne Farbfunktion entsteht nicht komprimierbares Rauschen. */
function png(width: number, height: number, color: ((x: number, y: number) => number[]) | null): Buffer {
  const row = width * 3 + 1;
  const raw = color ? Buffer.alloc(row * height) : randomBytes(row * height);
  if (color) {
    for (let y = 0; y < height; y++) {
      raw[y * row] = 0;
      for (let x = 0; x < width; x++) {
        const [r, g, b] = color(x, y);
        raw[y * row + 1 + x * 3] = r;
        raw[y * row + 2 + x * 3] = g;
        raw[y * row + 3 + x * 3] = b;
      }
    }
  } else {
    for (let y = 0; y < height; y++) raw[y * row] = 0;
  }
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: color ? 9 : 0 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
