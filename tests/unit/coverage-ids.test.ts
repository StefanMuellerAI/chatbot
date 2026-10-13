import { describe, expect, it } from "vitest";
import { catalogIds, idsFromTestName } from "../e2e/coverage-ids.mjs";

describe("Abdeckungsprüfung: Katalog-IDs", () => {
  it("erkennt ein- und zweistellige Kürzel am Anfang eines Testnamens", () => {
    expect(idsFromTestName("A01 Anmeldung mit Passwort")).toEqual(["A01"]);
    expect(idsFromTestName("GC04 @Freebie antwortet")).toEqual(["GC04"]);
    expect(idsFromTestName("Q03/F08 Uploads aus")).toEqual(["Q03", "F08"]);
    expect(idsFromTestName("GC04/V08 Claude im Gruppenchat")).toEqual(["GC04", "V08"]);
    expect(idsFromTestName("ohne ID")).toEqual([]);
    expect(idsFromTestName("ABC01 drei Buchstaben")).toEqual([]);
    expect(idsFromTestName("GC4 eine Ziffer")).toEqual([]);
  });

  it("liest Tabellenzeilen und Bereiche aus dem Testplan", () => {
    const plan = [
      "| ID | Szenario |",
      "|---|---|",
      "| A01 | Anmeldung |",
      "| Q02–Q04 | Schalter |",
      "| GC01 | Starten |",
      "| GC18–GC20 | API und Grenzen |",
      "| GC05–20 | Kurzform |",
      "Text | X99 | zählt nicht",
    ].join("\n");
    expect(catalogIds(plan)).toEqual([
      "A01",
      "Q02",
      "Q03",
      "Q04",
      "GC01",
      "GC18",
      "GC19",
      "GC20",
      ...Array.from({ length: 16 }, (_, i) => `GC${String(i + 5).padStart(2, "0")}`),
    ]);
  });
});
