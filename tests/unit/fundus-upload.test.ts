import { strToU8, zipSync } from "fflate";
import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { realDataHints, ibanValid } from "@/lib/fundus/hints";
import { getOwnItem, getOwnMails } from "@/lib/fundus/store";
import { buildPreview, checkDocument, checkThread, fundusKeyFor, saveDocuments, saveThread } from "@/lib/fundus/upload";
import { fundusFileProblem, stripReplyPrefixes, titleFromFileName } from "@/lib/shared/fundus";
import { getFile, putFile } from "@/lib/storage";
import { docx, pdf, pptx } from "../e2e/support/generate-files";

/** Legt eine Datei so ab, wie der Upload im Admin es tut (vorgemerkt für einen Tag). */
async function stage(name: string, data: Buffer): Promise<string> {
  const key = fundusKeyFor(name);
  await putFile(key, data, "application/octet-stream", "fundus", 1);
  return key;
}

function xlsx(rows: unknown[][]): Buffer {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), "Kosten");
  return Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
}

/** Word-Datei ohne Text (z. B. nur ein eingefügtes Bild). */
function emptyDocx(): Buffer {
  const W = 'xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"';
  return Buffer.from(
    zipSync({
      "[Content_Types].xml": strToU8(
        '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
      ),
      "_rels/.rels": strToU8(
        '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
      ),
      "word/document.xml": strToU8(`<?xml version="1.0" encoding="UTF-8"?><w:document ${W}><w:body><w:p/></w:body></w:document>`),
    }),
  );
}

interface MailSpec {
  from: string;
  to: string;
  subject: string;
  date?: string;
  id?: string;
  body: string;
  attachment?: { name: string; data: Buffer; type: string };
}

/** Einfache .eml-Datei (RFC 5322), optional mit einem Anhang. */
function eml(m: MailSpec): Buffer {
  const head = [`From: ${m.from}`, `To: ${m.to}`, `Subject: ${m.subject}`, ...(m.date ? [`Date: ${m.date}`] : []), ...(m.id ? [`Message-ID: <${m.id}>`] : []), "MIME-Version: 1.0"];
  if (!m.attachment) return Buffer.from([...head, "Content-Type: text/plain; charset=utf-8", "Content-Transfer-Encoding: 8bit", "", m.body, ""].join("\r\n"));
  const b = "grenze-123";
  return Buffer.from(
    [
      ...head,
      `Content-Type: multipart/mixed; boundary="${b}"`,
      "",
      `--${b}`,
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: 8bit",
      "",
      m.body,
      `--${b}`,
      `Content-Type: ${m.attachment.type}; name="${m.attachment.name}"`,
      `Content-Disposition: attachment; filename="${m.attachment.name}"`,
      "Content-Transfer-Encoding: base64",
      "",
      m.attachment.data.toString("base64").replace(/.{76}/g, "$&\r\n"),
      `--${b}--`,
      "",
    ].join("\r\n"),
  );
}

const meta = (title: string) => ({ title, summary: "", date: "2026-10-14", tags: [] as never[], keywords: [] as string[] });

describe("Fundus pflegen: Regeln für Dateien", () => {
  it("nennt Formate mit Tipp", () => {
    expect(fundusFileProblem("a.docx", 10, "document")).toBeNull();
    expect(fundusFileProblem("a.PDF", 10, "document")).toBeNull();
    expect(fundusFileProblem("a.doc", 10, "document")).toContain("als .docx speichern");
    expect(fundusFileProblem("a.xls", 10, "document")).toContain(".xlsx");
    expect(fundusFileProblem("a.ppt", 10, "document")).toContain(".pptx");
    expect(fundusFileProblem("a.msg", 10, "document")).toContain(".eml");
    expect(fundusFileProblem("a.eml", 10, "document")).toContain("E-Mail-Verläufen");
    expect(fundusFileProblem("a.exe", 10, "document")).toContain("Im Fundus gehen Word (.docx), Excel (.xlsx), PowerPoint (.pptx) und PDF.");
    expect(fundusFileProblem("ohne-endung", 10, "document")).toContain("keine Endung");
    expect(fundusFileProblem("a.docx", 0, "document")).toBe("Die Datei ist leer.");
    expect(fundusFileProblem("a.docx", 51 * 1024 * 1024, "document")).toContain("zu groß");
    expect(fundusFileProblem("a.msg", 10, "mail")).toContain("Speichern unter als .eml");
    expect(fundusFileProblem("a.docx", 10, "mail")).toBe("Bitte nur E-Mails als .eml-Datei hochladen.");
  });

  it("schlägt Titel vor", () => {
    expect(titleFromFileName("Leitfaden_KI-Nutzung   2026.docx")).toBe("Leitfaden KI-Nutzung 2026");
    expect(titleFromFileName(".pdf")).toBe("Dokument");
    expect(stripReplyPrefixes("AW: WG: Re: Rückfragen")).toBe("Rückfragen");
    expect(stripReplyPrefixes("Fwd:FW: aw:  Thema")).toBe("Thema");
    expect(stripReplyPrefixes("AW[2]: Thema")).toBe("Thema");
    expect(stripReplyPrefixes("Awareness-Kampagne")).toBe("Awareness-Kampagne");
  });
});

describe("Fundus pflegen: Hinweise auf echte Daten", () => {
  it("findet echte Mail-Domains, gültige IBANs und Telefonnummern", () => {
    const hints = realDataHints("Kontakt: m.schulz@beispielamt.de, Tel. 0221 4711-23, IBAN DE89 3704 0044 0532 0130 00");
    expect(hints).toHaveLength(3);
    expect(hints[0]).toContain("m.schulz@beispielamt.de");
    expect(hints[1]).toContain("DE89 3704 0044 0532 0130 00");
    expect(hints[2]).toContain("0221 4711-23");
  });

  it("lässt erfundene Daten in Ruhe", () => {
    expect(realDataHints("petra.lindner@falkenbrueck.example, info@example.org, 030 23125-412, IBAN DE00 1234 5678 9012 3456 78, Summe 2026 1234")).toEqual([]);
    expect(ibanValid("DE89370400440532013000")).toBe(true);
    expect(ibanValid("DE89370400440532013001")).toBe(false);
    expect(realDataHints("Betrag 0,5 Mio. und Az. 01/2026")).toEqual([]);
  });
});

describe("Fundus pflegen: Dokumente prüfen", () => {
  it("liest Word, Excel, PowerPoint und PDF und baut die Vorschau", async () => {
    const word = await checkDocument(await stage("Mietvertrag.docx", docx()), "Mietvertrag.docx");
    expect(word).toMatchObject({ ok: true, type: "word", title: "Mietvertrag", length: "kurz" });
    expect(word.preview).toMatchObject({ type: "text", format: "word" });
    expect(JSON.stringify(word.preview)).toContain("72 Quadratmeter");

    const sheet = await checkDocument(await stage("Kosten.xlsx", xlsx([["Posten", "Betrag"], ["Miete, kalt", 900], ['Zitat "x"', 12.5]])), "Kosten.xlsx");
    expect(sheet).toMatchObject({ ok: true, type: "excel" });
    const p = sheet.preview as Extract<NonNullable<typeof sheet.preview>, { type: "excel" }>;
    expect(p.sheets[0].name).toBe("Kosten");
    expect(p.sheets[0].columns.map((c) => [c.header, c.align])).toEqual([
      ["Posten", "left"],
      ["Betrag", "right"],
    ]);
    expect(p.sheets[0].rows.map((r) => r.cells)).toEqual([
      ["Miete, kalt", "900"],
      ['Zitat "x"', "12,5"],
    ]);

    const slides = await checkDocument(await stage("Folien.pptx", pptx()), "Folien.pptx");
    expect(slides).toMatchObject({ ok: true, type: "powerpoint" });
    const s = slides.preview as Extract<NonNullable<typeof slides.preview>, { type: "powerpoint" }>;
    expect(s.slides.map((x) => x.title)).toEqual(["Agenda", "Ergebnisse"]);
    expect(s.slides[1]).toMatchObject({ notes: "Hier die Zahlen langsam erklären" });
    expect(s.brand.emblem).toBe("");

    const doc = await checkDocument(await stage("Bericht.pdf", pdf(["Umsatzbericht Seite eins", "Fazit"])), "Bericht.pdf");
    expect(doc).toMatchObject({ ok: true, type: "pdf" });
    expect(doc.preview).toMatchObject({ type: "text", format: "pdf" });
  });

  it("meldet Probleme je Datei, ohne abzubrechen", async () => {
    const png = Buffer.from("89504e470d0a1a0a0000000d49484452", "hex");
    const cases: [string, Buffer, string][] = [
      ["alt.doc", Buffer.from("x"), "als .docx speichern"],
      ["umbenannt.docx", png, "Der Inhalt passt nicht zur Endung"],
      ["leer.pdf", Buffer.alloc(0), "Die Datei ist leer."],
      ["kaputt.pdf", Buffer.from("%PDF-1.7\nkaputt kaputt kaputt"), "konnte nicht gelesen werden"],
      ["nur-bild.docx", emptyDocx(), "kein lesbarer Text"],
    ];
    for (const [name, data, message] of cases) {
      const result = await checkDocument(await stage(name, data.length ? data : Buffer.from(" ")), name).catch((e: Error) => ({ ok: false, error: e.message }));
      if (name === "leer.pdf") continue;
      expect(result.ok, name).toBe(false);
      expect(result.error, name).toContain(message);
    }
    expect((await checkDocument(fundusKeyFor("weg.docx"), "weg.docx")).error).toContain("nicht gefunden");
    await expect(checkDocument("uploads/00000000-0000-0000-0000-000000000000/a.docx", "a.docx")).rejects.toThrow("Ungültiger Dateipfad.");
    await expect(checkDocument("fundus/../../etc/passwd", "a.docx")).rejects.toThrow("Ungültiger Dateipfad.");
  });

  it("speichert, erkennt Dubletten und macht die Datei dauerhaft", async () => {
    const data = Buffer.concat([docx(), Buffer.from(String(Math.random()))]);
    const key = await stage("Dublette.docx", data);
    const saved = await saveDocuments([{ key, name: "Dublette.docx", meta: { ...meta("Erste Fassung"), tags: ["zahlen"] } }]);
    expect(saved.failed).toEqual([]);
    const row = await getOwnItem(saved.saved[0]);
    expect(row).toMatchObject({ title: "Erste Fassung", docType: "word", fileKey: key, tags: ["kurz", "zahlen"] });
    expect(row?.text).toContain("Quadratmeter");
    const again = await checkDocument(await stage("Kopie.docx", data), "Kopie.docx");
    expect(again.duplicateOf).toBe("Erste Fassung");
    const second = await saveDocuments([{ key: again.key, name: "Kopie.docx", meta: meta("Kopie") }]);
    expect(second.saved).toEqual([]);
    expect(second.failed[0].error).toBe("Gibt es schon im Fundus als „Erste Fassung“.");
    // Zweimal dieselbe neue Datei in einem Durchgang: nur einmal.
    const fresh = Buffer.concat([docx(), Buffer.from(String(Math.random()))]);
    const both = await saveDocuments([
      { key: await stage("a.docx", fresh), name: "a.docx", meta: meta("A") },
      { key: await stage("b.docx", fresh), name: "b.docx", meta: meta("B") },
    ]);
    expect(both.saved).toHaveLength(1);
    expect(both.failed).toHaveLength(1);
    expect(await getFile(key)).not.toBeNull();
  });

  it("baut die Vorschau robust: lange Texte gekürzt, Tabellen begrenzt", () => {
    const long = buildPreview("word", "x".repeat(70_000));
    expect(long).toMatchObject({ type: "text", truncated: true });
    expect((long as { markdown: string }).markdown).toHaveLength(60_000);
    const rows = Array.from({ length: 300 }, (_, i) => Array.from({ length: 40 }, (_, j) => `${i}-${j}`).join(","));
    const sheet = buildPreview("excel", `## Tabellenblatt „Groß“ (300 Zeilen × 40 Spalten)\n\`\`\`csv\n${rows.join("\n")}\n\`\`\``);
    const s = (sheet as { sheets: { columns: unknown[]; rows: unknown[] }[] }).sheets[0];
    expect(s.columns).toHaveLength(30);
    expect(s.rows).toHaveLength(200);
    expect(buildPreview("excel", "kein Tabellenblatt")).toMatchObject({ type: "text" });
  });
});

describe("Fundus pflegen: E-Mail-Verläufe", () => {
  const run = Math.random().toString(36).slice(2, 8);
  const mails = {
    first: eml({ from: "Petra Ahrens <p.ahrens@markt.example>", to: "Ordnungsamt <ordnung@stadt.example>", subject: "Rückfragen Wochenmarkt", date: "Mon, 06 Oct 2026 09:14:00 +0200", id: `1-${run}@markt.example`, body: "Guten Tag, ich habe Fragen." }),
    reply: eml({ from: "Jan Petersen <j.petersen@stadt.example>", to: "p.ahrens@markt.example", subject: "AW: Rückfragen Wochenmarkt", date: "Tue, 07 Oct 2026 11:02:00 +0200", id: `2-${run}@stadt.example`, body: "Hallo Frau Ahrens, gern." }),
    forward: eml({
      from: "Jan Petersen <j.petersen@stadt.example>",
      to: "Stadtkasse <kasse@stadt.example>",
      subject: "WG: AW: Rückfragen Wochenmarkt",
      date: "Mon, 13 Oct 2026 08:40:00 +0200",
      id: `3-${run}@stadt.example`,
      body: "Zur Info.",
      attachment: { name: "Lageplan.docx", data: Buffer.concat([docx(), Buffer.from(run)]), type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" },
    }),
    photo: eml({ from: "a@markt.example", to: "b@stadt.example", subject: "Foto", date: "Wed, 08 Oct 2026 10:00:00 +0200", id: `4-${run}@x.example`, body: "Foto anbei", attachment: { name: "Stand.heic", data: Buffer.from("heic"), type: "image/heic" } }),
    undated: eml({ from: "a@markt.example", to: "b@stadt.example", subject: "Ohne Datum", id: `5-${run}@x.example`, body: "Kein Datum" }),
  };

  it("sortiert nach Datum, schlägt den Titel vor und erkennt Dubletten und Anhänge", async () => {
    const files = [
      { key: await stage("3.eml", mails.forward), name: "3.eml" },
      { key: await stage("1.eml", mails.first), name: "1.eml" },
      { key: await stage("2.eml", mails.reply), name: "2.eml" },
      { key: await stage("2-kopie.eml", mails.reply), name: "2-kopie.eml" },
      { key: await stage("foto.eml", mails.photo), name: "foto.eml" },
    ];
    const t = await checkThread(files);
    expect(t.ok).toBe(true);
    expect(t.title).toBe("Rückfragen Wochenmarkt");
    expect(t.mails.filter((m) => m.ok && !m.duplicateOf).map((m) => m.name)).toEqual(["1.eml", "2.eml", "foto.eml", "3.eml"]);
    expect(t.mails.find((m) => m.name === "2-kopie.eml")?.duplicateOf).toBe("2.eml");
    expect(t.participants).toEqual(expect.arrayContaining(["Petra Ahrens", "Ordnungsamt", "Jan Petersen", "Stadtkasse"]));
    expect(t.mails.find((m) => m.name === "3.eml")?.attachments).toEqual([{ name: "Lageplan.docx", size: expect.any(Number), supported: true }]);
    expect(t.mails.find((m) => m.name === "foto.eml")?.attachments[0].supported).toBe(false);
  });

  it("hält Mails ohne Datum an ihrer Stelle und meldet kaputte Dateien", async () => {
    const t = await checkThread([
      { key: await stage("1.eml", mails.first), name: "1.eml" },
      { key: await stage("x.eml", mails.undated), name: "x.eml" },
      { key: await stage("kaputt.eml", Buffer.from("das ist keine mail")), name: "kaputt.eml" },
      { key: await stage("a.msg", Buffer.from("x")), name: "a.msg" },
    ]);
    expect(t.mails.filter((m) => m.ok).map((m) => m.name)).toEqual(["1.eml", "x.eml"]);
    expect(t.hints[0]).toContain("kein Datum");
    expect(t.mails.find((m) => m.name === "kaputt.eml")?.error).toContain("konnte nicht gelesen werden");
    expect(t.mails.find((m) => m.name === "a.msg")?.error).toContain(".eml");
    await expect(checkThread([])).rejects.toThrow("mindestens eine .eml-Datei");
    const many = Array.from({ length: 51 }, (_, i) => ({ key: fundusKeyFor(`${i}.eml`), name: `${i}.eml` }));
    await expect(checkThread(many)).rejects.toThrow("Höchstens 50 Mails je Verlauf.");
  });

  it("speichert Mails, Anhang-Dokumente und Vorschau", async () => {
    const files = [
      { key: await stage("1.eml", mails.first), name: "1.eml" },
      { key: await stage("3.eml", mails.forward), name: "3.eml" },
    ];
    const saved = await saveThread(files, { ...meta("Wochenmarkt"), date: "" });
    expect(saved).toMatchObject({ mails: 2, attachments: 1 });
    const thread = await getOwnItem(saved.id);
    expect(thread).toMatchObject({ kind: "thread", title: "Wochenmarkt", date: "2026-10-13" });
    const list = await getOwnMails(saved.id);
    expect(list.map((m) => [m.id, m.subject])).toEqual([
      [`${saved.id}-1`, "Rückfragen Wochenmarkt"],
      [`${saved.id}-2`, "WG: AW: Rückfragen Wochenmarkt"],
    ]);
    expect(list[1].text).toContain("Betreff: WG: AW: Rückfragen Wochenmarkt");
    const attachmentId = (list[1].attachments as string[])[0];
    expect(await getOwnItem(attachmentId)).toMatchObject({ threadId: saved.id, docType: "word", title: "Lageplan" });
    const preview = thread?.preview as { mails: { attachments: { id: string }[] }[] };
    expect(preview.mails[1].attachments[0].id).toBe(attachmentId);
    // Dieselben Mails noch einmal: schon im Fundus.
    await expect(saveThread([{ key: await stage("1.eml", mails.first), name: "1.eml" }], { ...meta("Noch mal"), date: "" })).rejects.toThrow("Keine der Dateien ist eine lesbare, neue E-Mail.");
  });
});
