import { strToU8, zipSync } from "fflate";
import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { assertZipSafe, detectKind, extractText, normalizeTables } from "@/lib/files/extract";

describe("Datei-Extraktion", () => {
  it("erkennt Dateitypen", () => {
    expect(detectKind("a.PDF", "")).toBe("pdf");
    expect(detectKind("a.xlsx", "")).toBe("sheet");
    expect(detectKind("a.pptx", "")).toBe("pptx");
    expect(detectKind("a.py", "")).toBe("text");
    expect(detectKind("a.exe", "application/octet-stream")).toBeNull();
  });

  it("macht aus Word-Tabellen Markdown-taugliche Tabellen", () => {
    const html = normalizeTables("<table><tr><td><p>A</p></td><td><p>B</p></td></tr><tr><td><p>1</p><p>2</p></td><td>3</td></tr></table>");
    expect(html).toBe("<table><tr><th>A</th><th>B</th></tr><tr><td>1<br>2</td><td>3</td></tr></table>");
  });

  it("liest Excel-Tabellen als CSV pro Blatt", async () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([["Monat", "Umsatz"], ["Jan", 100]]), "Umsatz");
    const buf = Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
    const text = await extractText(buf, "umsatz.xlsx", "");
    expect(text).toContain("Tabellenblatt „Umsatz“ (2 Zeilen × 2 Spalten)");
    expect(text).toContain("Jan,100");
  });

  it("liest PowerPoint-Folien samt Notizen", async () => {
    const slide = '<p:sld><a:p><a:r><a:t>Titel &amp; Thema</a:t></a:r></a:p><a:p><a:r><a:t>Punkt</a:t></a:r></a:p></p:sld>';
    const notes = "<p:notes><a:p><a:r><a:t>Notiz</a:t></a:r></a:p></p:notes>";
    const zip = zipSync({ "ppt/slides/slide1.xml": strToU8(slide), "ppt/notesSlides/notesSlide1.xml": strToU8(notes) });
    const text = await extractText(Buffer.from(zip), "f.pptx", "");
    expect(text).toBe("## Folie 1\nTitel & Thema\nPunkt\n\nSprechernotizen: Notiz");
  });

  it("lehnt Zip-Bomben ab", () => {
    const big = new Uint8Array(210 * 1024 * 1024);
    const zip = zipSync({ "a.bin": [big, { level: 9 }] });
    expect(() => assertZipSafe(zip)).toThrow(/zu groß/);
  });

  it("liest Textdateien als UTF-8", async () => {
    expect(await extractText(Buffer.from("Grüße\r\nZeile 2"), "a.txt", "text/plain")).toBe("Grüße\nZeile 2");
  });
});
