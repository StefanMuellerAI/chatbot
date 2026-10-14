import { describe, expect, it } from "vitest";
import { decodeText, extractText } from "@/lib/files/extract";

// F14/F15: Textdateien in den Kodierungen, die Teilnehmende tatsächlich mitbringen.

const SAMPLE = "Name;Ort;Betrag\nMüller;Köln;1.234,56 €\nStraße;Düsseldorf;12,50 €";

function windows1252(text: string): Buffer {
  // Für diesen Text reicht Latin-1 plus das Euro-Zeichen (0x80 in Windows-1252).
  return Buffer.from(Array.from(text, (c) => (c === "€" ? 0x80 : c.charCodeAt(0))));
}

describe("Kodierung von Textdateien", () => {
  it("UTF-8 mit und ohne BOM, Windows-Zeilenenden", () => {
    expect(decodeText(Buffer.from(SAMPLE, "utf8"))).toBe(SAMPLE);
    expect(decodeText(Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), Buffer.from(SAMPLE.replace(/\n/g, "\r\n"), "utf8")]))).toBe(SAMPLE);
  });

  it("Windows-1252 (CSV aus deutschem Excel)", () => {
    expect(decodeText(windows1252(SAMPLE))).toBe(SAMPLE);
  });

  it("UTF-16 mit BOM (LE und BE) und ohne BOM", () => {
    const le = Buffer.from(SAMPLE, "utf16le");
    const be = Buffer.from(le).swap16();
    expect(decodeText(Buffer.concat([Buffer.from([0xff, 0xfe]), le]))).toBe(SAMPLE);
    expect(decodeText(Buffer.concat([Buffer.from([0xfe, 0xff]), be]))).toBe(SAMPLE);
    expect(decodeText(le)).toBe(SAMPLE);
    expect(decodeText(be)).toBe(SAMPLE);
  });

  it("Nullbytes und Steuerzeichen verschwinden aus jedem ausgelesenen Text", async () => {
    const log = Buffer.from("Start\u0000\u0000 Dienst läuft\u0007\tok\r\nEnde\u001b[0m\u007f", "utf8");
    expect(await extractText(log, "dienst.log", "text/plain")).toBe("Start Dienst läuft\tok\nEnde[0m");
    const csv = await extractText(Buffer.concat([Buffer.from([0xff, 0xfe]), Buffer.from("Name\tOrt\nMüller\tKöln\n", "utf16le")]), "export.txt", "text/plain");
    expect(csv).toBe("Name\tOrt\nMüller\tKöln");
    expect(csv).not.toMatch(/\u0000/);
  });

  it("CSV aus deutschem Excel: Umlaute, Dezimalkomma und Datum bleiben, wie sie in der Datei stehen", async () => {
    const text = await extractText(windows1252("Name;Ort;Betrag;Datum\nMüller;Köln;1.234,56;14.10.2026\n"), "excel-export.csv", "text/csv");
    expect(text).toContain("Müller,Köln,\"1.234,56\",14.10.2026");
  });
});
