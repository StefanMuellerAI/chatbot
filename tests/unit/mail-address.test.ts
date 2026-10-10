import { describe, expect, it } from "vitest";
import { bodyBlocks, draftFor, fullDate, listTime, recipientLine } from "@/lib/client/mail";
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

describe("Anzeige im Posteingang (Client)", () => {
  const mail = {
    id: "m1",
    folder: "inbox" as const,
    from: "wolke83",
    to: ["fuchs27", "biene79"],
    cc: ["kursleitung"],
    subject: "Angebot",
    preview: "",
    body: "Raum Rhein\nfür 890 €",
    read: false,
    viaFreebie: false,
    inReplyTo: null,
    sentAt: "2026-10-10T12:05:00.000Z",
  };

  it("zeigt Uhrzeit, „Gestern“, Wochentag oder Datum (Berliner Zeit)", () => {
    const now = new Date("2026-10-10T16:00:00.000Z");
    expect(listTime("2026-10-10T12:05:00.000Z", now)).toBe("14:05");
    expect(listTime("2026-10-09T08:00:00.000Z", now)).toBe("Gestern");
    expect(listTime("2026-10-07T08:00:00.000Z", now)).toMatch(/^Mi\.?$/);
    expect(listTime("2026-09-03T08:00:00.000Z", now)).toBe("03.09.");
    expect(fullDate(mail.sentAt)).toBe("Sa., 10.10.2026, 14:05");
  });

  it("Antworten, Allen antworten und Weiterleiten füllen Empfänger, Betreff und Zitat", () => {
    const reply = draftFor("reply", mail, "fuchs27");
    expect(reply).toMatchObject({ mode: "reply", to: ["wolke83"], cc: [], subject: "AW: Angebot", inReplyTo: "m1" });
    expect(reply.body).toBe("\n\n> Am 10.10.2026 um 14:05 schrieb wolke83:\n> Raum Rhein\n> für 890 €");
    // Allen antworten: alle außer mir, Cc bleibt Cc.
    expect(draftFor("all", mail, "fuchs27")).toMatchObject({ to: ["wolke83", "biene79"], cc: ["kursleitung"] });
    // Kein doppeltes „AW:“
    expect(draftFor("reply", { ...mail, subject: "AW: Angebot" }, "fuchs27").subject).toBe("AW: Angebot");
    const forward = draftFor("forward", mail, "fuchs27");
    expect(forward).toMatchObject({ to: [], cc: [], subject: "WG: Angebot" });
    expect(forward.body).toContain("> -------- Weitergeleitete Nachricht --------\n> Von: wolke83 <wolke83@freebie.example>");
    // Antwort auf eine eigene gesendete Mail geht an die ursprünglichen Empfänger.
    expect(draftFor("reply", { ...mail, folder: "sent", from: "fuchs27" }, "fuchs27").to).toEqual(["fuchs27", "biene79"]);
  });

  it("trennt zitierte Zeilen vom Text und nennt mich „mich“", () => {
    expect(bodyBlocks("Hallo\n> alt\n>  eingerückt\nTschüss")).toEqual([
      { quote: false, text: "Hallo" },
      { quote: true, text: "alt\n eingerückt" },
      { quote: false, text: "Tschüss" },
    ]);
    expect(recipientLine(["fuchs27", "kursleitung"], "fuchs27")).toBe("mich, Kursleitung");
  });
});
