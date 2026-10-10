import { describe, expect, it } from "vitest";
import { mailAddress, mailName, mailPreview, parseAddress, prefixSubject, splitAddresses } from "@/lib/shared/mail";

describe("Adressen im Posteingang", () => {
  it("versteht Benutzernamen und Adressen in jeder Schreibweise", () => {
    expect(parseAddress(" Fuchs27 ")).toBe("fuchs27");
    expect(parseAddress("fuchs27@freebie.example")).toBe("fuchs27");
    expect(parseAddress(" <FUCHS27@Freebie.Example> ")).toBe("fuchs27");
    expect(parseAddress("Kursleitung")).toBe("kursleitung");
  });

  it("lehnt fremde Domains und seltsame Zeichen ab", () => {
    expect(parseAddress("fuchs27@gmail.com")).toBeNull();
    expect(parseAddress("fuchs27@freebie.example.com")).toBeNull();
    expect(parseAddress("")).toBeNull();
    expect(parseAddress("a b")).toBeNull();
    expect(parseAddress("<b>fett</b>")).toBeNull();
  });

  it("zerlegt Listen mit Komma, Semikolon und Leerzeichen", () => {
    expect(splitAddresses("fuchs27, wolke83;sonne11  birke45")).toEqual(["fuchs27", "wolke83", "sonne11", "birke45"]);
    expect(splitAddresses(" , ")).toEqual([]);
  });

  it("Anzeige, Vorschau und Betreff-Präfixe", () => {
    expect(mailAddress("fuchs27")).toBe("fuchs27@freebie.example");
    expect(mailName("kursleitung")).toBe("Kursleitung");
    expect(mailName("fuchs27")).toBe("fuchs27");
    expect(mailPreview("Hallo,\n\nkurz und knapp.\n\n> Zitat bleibt weg\n>  auch eingerückt")).toBe("Hallo, kurz und knapp.");
    expect(prefixSubject("AW: ", "Raum")).toBe("AW: Raum");
    expect(prefixSubject("AW: ", "aw: Raum")).toBe("aw: Raum");
    expect(prefixSubject("WG: ", "AW: Raum")).toBe("WG: AW: Raum");
  });
});
