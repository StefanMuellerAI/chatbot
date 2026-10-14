import { describe, expect, it } from "vitest";
import { categoryOf, safeFileName } from "@/lib/files/limits";
import { assertSafeKey } from "@/lib/storage";

// F13: Aus jedem Dateinamen mit erlaubter Endung wird ein gültiger Speicherpfad mit demselben Dateityp.

const key = (name: string) => `uploads/abcdefgh-1234/${safeFileName(name)}`;

describe("Dateinamen für Speicherpfade", () => {
  it("bisherige Namen bleiben unverändert", () => {
    expect(safeFileName("notiz.txt")).toBe("notiz.txt");
    expect(safeFileName("Übersicht Größe – März 🚀.txt")).toBe("U_bersicht_Gro_e_Ma_rz_.txt");
    expect(safeFileName("Bericht (Entwurf).docx")).toBe("Bericht_Entwurf_.docx");
  });

  it("Namen ohne lateinische Buchstaben behalten ihre Endung", () => {
    expect(safeFileName("Отчет.pdf")).toBe("datei.pdf");
    expect(safeFileName("報告.docx")).toBe("datei.docx");
    expect(safeFileName("📊.csv")).toBe("datei.csv");
    expect(safeFileName("تقرير.PDF")).toBe("datei.PDF");
    expect(safeFileName("ohne-endung")).toBe("ohne-endung");
  });

  it("zufällige Unicode-Namen: gleicher Dateityp, gültiger Pfad", () => {
    const pieces = ["Отчет", "報告", "📊", "Ü", "ß", " ", "-", "_", ".", "a", "Z", "7", "é", "ñ", "(", ")", "€", "😀", "​", "ı"];
    const extensions = ["pdf", "PDF", "docx", "xlsx", "csv", "txt", "png", "JPG", "mp3", "m4a", "eml"];
    let seed = 42;
    const rand = (n: number) => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed % n;
    };
    for (let i = 0; i < 2000; i++) {
      const stem = Array.from({ length: 1 + rand(12) }, () => pieces[rand(pieces.length)]).join("");
      const name = `${stem}.${extensions[rand(extensions.length)]}`;
      expect(categoryOf(key(name)), name).toBe(categoryOf(name));
      expect(() => assertSafeKey(key(name)), name).not.toThrow();
    }
  });
});
