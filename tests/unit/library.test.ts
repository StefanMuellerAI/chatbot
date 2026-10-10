import { createHash, randomBytes } from "node:crypto";
import { strFromU8, unzipSync } from "fflate";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import PostalMime from "postal-mime";
import { describe, expect, it } from "vitest";
import { prepareMessages } from "@/lib/chat/prepare";
import { estimateTokens, extractText } from "@/lib/files/extract";
import { EMPTY_FILTER, filterDocuments, filterThreads, fold, unitTree, unitWithChildren } from "@/lib/library/search";
import { LIBRARY_EXTENSION, LIBRARY_MIME, lengthTag, type LibraryCatalog } from "@/lib/library/types";
import type { ChatMessage } from "@/lib/shared/types";
import { readManifest } from "@/library/build/build";
import { computeWorkbook, renderExcel } from "@/library/build/excel";
import { berlinOffset, rfc5322Date } from "@/library/build/format";
import { evaluate } from "@/library/build/formula";
import { encodeWord, quotedPrintable, renderMail } from "@/library/build/mail";
import { renderPowerPoint } from "@/library/build/powerpoint";
import { validateLibrary } from "@/library/build/validate";
import { renderWord } from "@/library/build/word";
import { DOCUMENTS, THREADS } from "@/library/content";
import type { ExcelSpec, PowerPointSpec, WordSpec } from "@/library/types";
import { ORGS } from "@/library/world";
import { seedModel } from "./helpers";

const manifest = readManifest()!;
const catalog: LibraryCatalog = manifest.catalog;
const sha = (data: Buffer) => createHash("sha256").update(data).digest("hex");
const filePath = (id: string, ext: string) => path.join(process.cwd(), ".library", "files", `${id}.${ext}`);

/** Ausgelesener Text aller Dateien des Fundus (einmal je Testlauf). */
const texts = new Map<string, string>();
async function allTexts(): Promise<Map<string, string>> {
  if (texts.size) return texts;
  for (const d of catalog.documents) texts.set(d.id, await extractText(readFileSync(filePath(d.id, LIBRARY_EXTENSION[d.type])), d.fileName, LIBRARY_MIME[d.type]));
  for (const t of catalog.threads) for (const m of t.mails) texts.set(m.id, await extractText(readFileSync(filePath(m.id, "eml")), m.fileName, LIBRARY_MIME.mail));
  return texts;
}

describe("Fundus: Weltmodell und Inhalte", () => {
  it("ist widerspruchsfrei (IDs, Personen, Einheiten, Daten, Anhänge)", () => {
    expect(validateLibrary(DOCUMENTS, THREADS)).toEqual([]);
  });

  it("findet Fehler in Inhalten", () => {
    const doc = DOCUMENTS.find((d) => d.type === "word") as WordSpec;
    const thread = THREADS.find((t) => t.mails.length > 1)!;
    const problems = validateLibrary(
      [doc, { ...doc, id: "Gross Klein", author: "niemand", unit: "gibt-es-nicht" }, { ...doc }],
      [{ ...thread, mails: [thread.mails[1], { ...thread.mails[0], attachments: ["fehlt"], to: ["unbekannt"] }] }],
    );
    expect(problems).toEqual(
      expect.arrayContaining([
        expect.stringContaining(`ID doppelt: ${doc.id}`),
        "Gross Klein: ungültige ID",
        expect.stringContaining("unbekannte Verfasserin/unbekannter Verfasser niemand"),
        expect.stringContaining("unbekannte Einheit gibt-es-nicht"),
        expect.stringContaining("liegt zeitlich nicht nach der vorherigen Mail"),
        expect.stringContaining("unbekannter Anhang fehlt"),
        expect.stringContaining("unbekannte Person unbekannt"),
      ]),
    );
  });

  it("enthält genug von allem: 8 Verwaltungen aller Ebenen, je Typ mindestens 5 Dokumente, mindestens 5 Verläufe", () => {
    expect(catalog.orgs).toHaveLength(8);
    expect(new Set(catalog.orgs.map((o) => o.level))).toEqual(new Set(["kommune", "kreis", "land", "bund", "it"]));
    for (const type of ["word", "excel", "powerpoint"] as const) expect(catalog.documents.filter((d) => d.type === type).length).toBeGreaterThanOrEqual(5);
    expect(catalog.threads.length).toBeGreaterThanOrEqual(5);
    expect(catalog.threads.every((t) => t.mails.length >= 2)).toBe(true);
    // Jede Verwaltung kommt im Fundus vor.
    for (const o of catalog.orgs) expect([...catalog.documents, ...catalog.threads].some((i) => i.orgId === o.id), o.id).toBe(true);
  });

  it("jede Datei lässt sich auslesen und enthält ihre Pflichtbegriffe; Token-Schätzung und Länge stimmen", async () => {
    const all = await allTexts();
    for (const d of catalog.documents) {
      const text = all.get(d.id)!;
      for (const k of d.keywords) expect(text, `${d.id}: „${k}“`).toContain(k);
      expect(d.tokens).toBe(estimateTokens(text));
      expect(d.tags).toContain(lengthTag(d.tokens));
      expect(d.sha256).toBe(sha(readFileSync(filePath(d.id, LIBRARY_EXTENSION[d.type]))));
    }
    for (const t of catalog.threads) {
      const joined = t.mails.map((m) => all.get(m.id)!).join("\n");
      for (const k of t.keywords) expect(joined, `${t.id}: „${k}“`).toContain(k);
      for (const m of t.mails) expect(m.tokens).toBe(estimateTokens(all.get(m.id)!));
    }
  });

  it("E-Mails tragen Kopfzeilen, Zitatverlauf und die echten Anhänge", async () => {
    const thread = catalog.threads.find((t) => t.id === "fb-mitzeichnung-kita-nordstadt")!;
    const last = thread.mails.at(-1)!;
    const text = (await allTexts()).get(last.id)!;
    // Jüngste Mail zuerst, darunter der Verlauf wie in Outlook.
    const order = ["Raum 2.14", "nur unter Vorbehalt mitzeichnen", "Bebauungsplan Nr. 47", "Ich bitte um Mitzeichnung"].map((s) => text.indexOf(s));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);

    const first = await PostalMime.parse(readFileSync(filePath(thread.mails[0].id, "eml")));
    expect(first.attachments.map((a) => a.filename)).toEqual(["V-2025-0412 Beschlussvorlage Kita-Ausbau Nordstadt.docx"]);
    const attachment = Buffer.from(first.attachments[0].content as ArrayBuffer);
    expect(sha(attachment)).toBe(catalog.documents.find((d) => d.id === "fb-beschlussvorlage-kita-nordstadt")!.sha256);
    const second = await PostalMime.parse(readFileSync(filePath(thread.mails[1].id, "eml")));
    expect(second.inReplyTo).toBe(`<${thread.mails[0].id}.fundus@falkenbrueck.example>`);
  });
});

describe("Fundus: erfunden, aber echt wirkend (Wächter über alle Dateien)", () => {
  it("nur Adressen auf .example, nur Spielfilm-Rufnummern, Postleitzahlen mit 00, keine gültigen IBANs", async () => {
    const all = await allTexts();
    for (const [id, text] of all) {
      for (const m of text.matchAll(/[\w.+-]+@([\w-]+\.)+[a-z]{2,}/gi)) expect(m[0], id).toMatch(/\.example$/);
      for (const m of text.matchAll(/\b(?:https?:\/\/|www\.)([^\s/)"']+)/gi)) expect(m[1], id).toMatch(/\.example$/);
      for (const m of text.matchAll(/\b0\d{2,4} \d{4,6}(?:-\d{1,4})?\b/g)) expect(m[0], id).toMatch(/^(030 23125|069 90009|040 66969)-\d{3}$/);
      for (const m of text.matchAll(/\b(\d{5}) [A-ZÄÖÜ][a-zäöüß]+/g)) if (Number(m[1]) >= 1000 && !/^20\d\d$/.test(m[1].slice(1))) expect(m[1], `${id}: ${m[0]}`).toMatch(/^00/);
      for (const m of text.matchAll(/\bDE\d{2}(?: ?\d{4}){4} ?\d{2}\b/g)) expect(ibanValid(m[0].replace(/ /g, "")), id).toBe(false);
    }
  });

  it("nennt keine echten Behörden oder Orte aus der Sperrliste", async () => {
    const blocked = [
      "Bundesministerium des Innern",
      "Bundesverwaltungsamt",
      "Beschaffungsamt des BMI",
      "Landesverwaltungsamt",
      "Ellerbach",
      "Wiesengrund",
      "Bundesadler",
      "ChatGPT",
    ];
    for (const [id, text] of await allTexts()) for (const b of blocked) expect(text.includes(b), `${id} nennt „${b}“`).toBe(false);
  });

  it("Mail-Domains und Rufnummern im Weltmodell folgen den Regeln", () => {
    for (const o of ORGS) {
      expect(o.domain).toMatch(/\.example$/);
      expect(o.phone).toMatch(/^(030 23125|069 90009|040 66969)$/);
    }
  });

  it("kennzeichnet jede Datei als fiktiv (Eigenschaften bzw. Kopfzeile)", () => {
    for (const d of catalog.documents) {
      const core = unzipSync(new Uint8Array(readFileSync(filePath(d.id, LIBRARY_EXTENSION[d.type]))))["docProps/core.xml"];
      expect(strFromU8(core), d.id).toContain("Fiktives Übungsdokument – Freebie-Fundus");
    }
    for (const t of catalog.threads) for (const m of t.mails) expect(readFileSync(filePath(m.id, "eml"), "utf8")).toContain("X-Freebie-Fundus:");
  });
});

function ibanValid(iban: string): boolean {
  const moved = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let rest = 0;
  for (const ch of moved) rest = (rest * 10 + Number(ch)) % 97;
  return rest === 1;
}

describe("Fundus: Generator", () => {
  it("erzeugt in jedem Prozess byte-gleiche Dateien (feste Prüfsummen)", async () => {
    const word = DOCUMENTS.find((d) => d.type === "word") as WordSpec;
    const excel = DOCUMENTS.find((d) => d.type === "excel") as ExcelSpec;
    const ppt = DOCUMENTS.find((d) => d.type === "powerpoint") as PowerPointSpec;
    const shaOf = (id: string) => catalog.documents.find((d) => d.id === id)!.sha256;
    expect(sha((await renderWord(word)).data)).toBe(shaOf(word.id));
    expect(sha((await renderExcel(excel)).data)).toBe(shaOf(excel.id));
    // zweimal hintereinander: die prozessweiten Zähler von pptxgenjs dürfen nichts ändern
    expect(sha((await renderPowerPoint(ppt)).data)).toBe(shaOf(ppt.id));
    expect(sha((await renderPowerPoint(ppt)).data)).toBe(shaOf(ppt.id));

    const thread = THREADS.find((t) => t.mails.some((m) => m.attachments?.length))!;
    const index = thread.mails.findIndex((m) => m.attachments?.length);
    const attachments = thread.mails[index].attachments!.map((id) => {
      const d = catalog.documents.find((x) => x.id === id)!;
      return { id, title: d.title, fileName: d.fileName, type: d.type, mime: LIBRARY_MIME[d.type], data: readFileSync(filePath(id, LIBRARY_EXTENSION[d.type])) };
    });
    const mail = renderMail(thread, index, attachments);
    expect(sha(mail.data)).toBe(catalog.threads.find((t) => t.id === thread.id)!.mails[index].sha256);
  });

  it("schreibt gültige Office-Dateien ohne ungültige Absatz-Eigenschaften in Folien", () => {
    for (const d of catalog.documents.filter((x) => x.type === "powerpoint")) {
      const data = readFileSync(filePath(d.id, "pptx"));
      expect(data.subarray(0, 2).toString()).toBe("PK");
      expect(data.toString("latin1")).not.toMatch(/<\/a:r><a:pPr/);
    }
  });

  it("berechnet Formeln wie Excel", () => {
    const sheet = { cell: (_s: string, col: number, row: number) => [[1, 2, 3], [10, 20, 30]][row - 1]?.[col - 1] ?? null };
    expect(evaluate("=SUM(A1:C2)", "x", sheet)).toBe(66);
    expect(evaluate("ROUND(AVERAGE(A2:C2)/3,2)", "x", sheet)).toBe(6.67);
    expect(evaluate("IF(B2>15,\"hoch\",\"niedrig\")", "x", sheet)).toBe("hoch");
    expect(evaluate("-(A1+B1)*C1^2", "x", sheet)).toBe(-27);
    expect(evaluate("MAX(A1:C1)-MIN(A2:C2)+COUNT(A1:C2)", "x", sheet)).toBe(-1);
    expect(() => evaluate("SUMIF(A1:A2,1)", "x", sheet)).toThrow(/nicht unterstützt/);
    const budget = computeWorkbook(DOCUMENTS.find((d) => d.id === "fb-budgetueberwachung-th51") as ExcelSpec);
    expect(budget.get("Übersicht")!.get("C13")).toBe(81_550_000);
    const lpf = computeWorkbook(DOCUMENTS.find((d) => d.id === "lpf-fortbildungsplanung-2026") as ExcelSpec);
    expect(lpf.get("Budget")!.get("B6")).toBe(lpf.get("Kurse")!.get("J14"));
  });

  it("schreibt Mail-Köpfe nach RFC 5322 (Sommer-/Winterzeit, kodierte Umlaute, Zeilenlänge)", async () => {
    expect(berlinOffset("2025-03-30T01:59")).toBe(1);
    expect(berlinOffset("2025-03-30T03:00")).toBe(2);
    expect(berlinOffset("2025-10-26T02:30")).toBe(2);
    expect(berlinOffset("2025-10-26T03:00")).toBe(1);
    expect(rfc5322Date("2025-10-08T09:05")).toBe("Wed, 08 Oct 2025 09:05:00 +0200");
    expect(encodeWord("Grüße")).toBe("=?UTF-8?B?R3LDvMOfZQ==?=");
    const long = "Ä".repeat(200) + " Ende";
    const qp = quotedPrintable(long);
    expect(qp.split("\r\n").every((l) => l.length <= 76)).toBe(true);
    const parsed = await PostalMime.parse(`Content-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: quoted-printable\r\n\r\n${qp}`);
    expect(parsed.text?.trim()).toBe(long);
  });
});

describe("Fundus: Suche und Filter", () => {
  it("vereinheitlicht Umlaute und Groß-/Kleinschreibung", () => {
    expect(fold("Straßenverkehrs-Behörde ÄÖÜ")).toBe("strassenverkehrs-behoerde aeoeue");
    expect(fold("Yıldız")).toBe("yildiz");
  });

  it("filtert nach Verwaltung, Einheit samt Untereinheiten, Typ, Merkmal und Suchbegriff", () => {
    const fb = catalog.orgs.find((o) => o.id === "falkenbrueck")!;
    expect(unitWithChildren(fb, "fb-dez5")).toEqual(new Set(["fb-dez5", "fb-amt51", "fb-amt51-kita"]));
    expect(unitTree(fb)[0]).toEqual({ id: "fb-ob", name: "Büro der Oberbürgermeisterin", depth: 0 });

    const ids = (f: Partial<typeof EMPTY_FILTER>) => filterDocuments(catalog, { ...EMPTY_FILTER, ...f }).map((d) => d.id);
    expect(ids({})).toHaveLength(catalog.documents.length);
    expect(ids({ orgId: "falkenbrueck", unitId: "fb-dez5" })).toEqual(["fb-beschlussvorlage-kita-nordstadt"]);
    expect(ids({ orgId: "falkenbrueck", types: ["excel"] })).toEqual(["fb-budgetueberwachung-th51"]);
    expect(ids({ query: "KAEMMEREI" })).toContain("fb-budgetueberwachung-th51");
    expect(ids({ query: "strassenverkehr" })).toEqual(["am-zulassungsstelle-fallzahlen-2025"]);
    expect(ids({ query: "lindqvist vergabe" })).toEqual(["bzbl-vergabevermerk-notebooks"]);
    expect(ids({ tags: ["personendaten"] })).toEqual(["bh-gespraechsnotiz-laerm-dgh"]);
    expect(ids({ orgId: "brackenhain", types: ["excel"] })).toEqual([]);
    // neueste zuerst
    const dates = ids({}).map((id) => catalog.documents.find((d) => d.id === id)!.date);
    expect([...dates].sort().reverse()).toEqual(dates);

    const threads = (f: Partial<typeof EMPTY_FILTER>) => filterThreads(catalog, { ...EMPTY_FILTER, ...f }).map((t) => t.id);
    expect(threads({ query: "kh.wolters" })).toEqual(["bh-beschwerde-laerm-dgh"]);
    expect(threads({ orgId: "bzbl" })).toEqual(["bzbl-bieterfrage-los2"]);
  });
});

describe("Fundus: Anhänge im Chat", () => {
  const model = seedModel("claude-sonnet-5-5");
  const message = (libraryId: string, sha256: string): ChatMessage => ({
    id: "m1",
    role: "user",
    text: "Fasse zusammen.",
    createdAt: 0,
    attachments: [{ id: "a1", kind: "document", name: "Datei.docx", mime: "x", size: 1, sha256, storageKey: `library/${libraryId}/Datei.docx`, libraryId }],
  });

  it("liest Fundus-Dateien neu aus, wenn der Datei-Cache sie nicht mehr hat", async () => {
    const [prepared] = await prepareMessages([message("fb-beschlussvorlage-kita-nordstadt", randomBytes(32).toString("hex"))], model, { nativePdf: false });
    const text = prepared.role === "user" ? prepared.parts.map((p) => (p.type === "text" ? p.text : "")).join("") : "";
    expect(text).toContain('<datei name="Datei.docx"');
    expect(text).toContain("Kiebitzweg");
  });

  it("unbekannte Fundus-ID: wie eine abgelaufene Datei", async () => {
    const [prepared] = await prepareMessages([message("gibt-es-nicht", randomBytes(32).toString("hex"))], model, { nativePdf: false });
    expect(JSON.stringify(prepared)).toContain("ist nicht mehr verfügbar");
  });

  it("der Fundus liegt fertig erzeugt vor", () => {
    expect(existsSync(path.join(process.cwd(), ".library", "manifest.json"))).toBe(true);
    expect(manifest.sourceHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
