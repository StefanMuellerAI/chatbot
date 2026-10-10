import { strToU8, zipSync } from "fflate";
import * as XLSX from "xlsx";
import { describe, expect, it } from "vitest";
import { detectKind, extractText, germanNumbers } from "@/lib/files/extract";

const CRLF = "\r\n";
const eml = (lines: string[]) => Buffer.from(lines.join(CRLF), "latin1");

describe("E-Mails (.eml)", () => {
  it("erkennt E-Mails an Endung und MIME-Typ", () => {
    expect(detectKind("Anfrage.EML", "")).toBe("mail");
    expect(detectKind("nachricht", "message/rfc822")).toBe("mail");
  });

  it("liest Kopfzeilen, kodierte Umlaute, Quoted-Printable und Anhänge", async () => {
    const data = eml([
      "From: =?UTF-8?B?UGV0cmEgTMOkbmRlcg==?= <p.laender@stadt.example>",
      "To: Amt 63 <bauaufsicht@stadt.example>, Jonas Brandt <j.brandt@stadt.example>",
      "Cc: kaemmerei@stadt.example",
      "Date: Wed, 08 Oct 2025 09:05:00 +0200",
      "Subject: =?UTF-8?Q?AW:_Gr=C3=BC=C3=9Fe_zum_L=C3=A4rmschutz?=",
      "MIME-Version: 1.0",
      'Content-Type: multipart/mixed; boundary="xx"',
      "",
      "--xx",
      "Content-Type: text/plain; charset=utf-8",
      "Content-Transfer-Encoding: quoted-printable",
      "",
      "Sehr geehrte Damen und Herren,=0A=0Adie Ma=C3=9Fnahme kostet 4,8 Mio. =E2=82=AC und ist sehr lang, damit eine weiche Zeile=",
      "numbrechung n=C3=B6tig wird.",
      "--xx",
      'Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document; name="Plan.docx"',
      "Content-Transfer-Encoding: base64",
      "Content-Disposition: attachment; filename*=UTF-8''Pl%C3%A4ne%20Nord.docx",
      "",
      Buffer.alloc(3000, 1).toString("base64"),
      "--xx--",
    ]);
    const text = await extractText(data, "anfrage.eml", "message/rfc822");
    expect(text).toContain("Von: Petra Länder <p.laender@stadt.example>");
    expect(text).toContain("An: Amt 63 <bauaufsicht@stadt.example>; Jonas Brandt <j.brandt@stadt.example>");
    expect(text).toContain("Cc: kaemmerei@stadt.example");
    expect(text).toContain("Datum: Mittwoch, 8. Oktober 2025 um 09:05");
    expect(text).toContain("Betreff: AW: Grüße zum Lärmschutz");
    expect(text).toContain("Anhänge: Pläne Nord.docx (3 KB)");
    expect(text).toContain("die Maßnahme kostet 4,8 Mio. € und ist sehr lang, damit eine weiche Zeilenumbrechung nötig wird.");
  });

  it("dekodiert alte Zeichensätze (ISO-8859-1)", async () => {
    const data = eml(["From: info@amt.example", "Subject: Test", "Content-Type: text/plain; charset=iso-8859-1", "Content-Transfer-Encoding: quoted-printable", "", "Gr=FC=DFe aus dem B=FCrgeramt"]);
    expect(await extractText(data, "a.eml", "")).toContain("Grüße aus dem Bürgeramt");
  });

  it("macht aus reinen HTML-Mails lesbaren Text (ohne Stile und Skripte)", async () => {
    const data = eml([
      "From: info@amt.example",
      "Subject: Nur HTML",
      "Content-Type: text/html; charset=utf-8",
      "",
      "<html><head><style>p{color:red}</style></head><body><h1>Einladung</h1><p>Wir laden <b>herzlich</b> ein.</p><script>alert(1)</script></body></html>",
    ]);
    const text = await extractText(data, "a.eml", "");
    expect(text).toContain("# Einladung");
    expect(text).toContain("Wir laden **herzlich** ein.");
    expect(text).not.toContain("color:red");
    expect(text).not.toContain("alert");
  });

  it("meldet Dateien, die keine E-Mail sind, verständlich", async () => {
    await expect(extractText(Buffer.from("Das ist nur Text ohne Kopfzeilen."), "falsch.eml", "")).rejects.toThrow("Die E-Mail konnte nicht gelesen werden");
  });
});

describe("PowerPoint: Diagramme und Foliennummern", () => {
  it("liest Diagrammdaten als Tabelle und lässt Foliennummern weg", async () => {
    const slide =
      '<p:sld><a:p><a:r><a:t>Fallzahlen</a:t></a:r></a:p><a:p><a:fld id="{1}" type="slidenum"><a:t>7</a:t></a:fld></a:p></p:sld>';
    const rels =
      '<Relationships><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/chart" Target="../charts/chart3.xml"/></Relationships>';
    const ser = (name: string, values: number[]) =>
      `<c:ser><c:tx><c:strRef><c:strCache><c:pt idx="0"><c:v>${name}</c:v></c:pt></c:strCache></c:strRef></c:tx>` +
      `<c:cat><c:strRef><c:strCache><c:pt idx="0"><c:v>2024</c:v></c:pt><c:pt idx="1"><c:v>2025</c:v></c:pt></c:strCache></c:strRef></c:cat>` +
      `<c:val><c:numRef><c:numCache>${values.map((v, i) => `<c:pt idx="${i}"><c:v>${v}</c:v></c:pt>`).join("")}</c:numCache></c:numRef></c:val></c:ser>`;
    const chart =
      `<c:chartSpace><c:chart><c:title><c:tx><c:rich><a:p><a:r><a:t>Fälle &amp; Kosten</a:t></a:r></a:p></c:rich></c:tx></c:title><c:plotArea>` +
      `<c:barChart>${ser("ambulant", [412, 447])}${ser("stationär", [188, 204])}</c:barChart>` +
      `<c:valAx><c:title><c:tx><c:rich><a:p><a:r><a:t>Anzahl</a:t></a:r></a:p></c:rich></c:tx></c:title></c:valAx></c:plotArea></c:chart></c:chartSpace>`;
    const zip = zipSync({
      "ppt/slides/slide1.xml": strToU8(slide),
      "ppt/slides/_rels/slide1.xml.rels": strToU8(rels),
      "ppt/charts/chart3.xml": strToU8(chart),
    });
    const text = await extractText(Buffer.from(zip), "f.pptx", "");
    expect(text).toBe(
      [
        "## Folie 1",
        "Fallzahlen",
        "",
        "Diagramm (Balken/Säulen): Fälle & Kosten – Werte in Anzahl",
        "| Kategorie | ambulant | stationär |",
        "| --- | --- | --- |",
        "| 2024 | 412 | 188 |",
        "| 2025 | 447 | 204 |",
      ].join("\n"),
    );
  });
});

describe("Zahlen in Arbeitsmappen", () => {
  it("zeigt formatierte Zahlen aus Excel deutsch, CSV bleibt unverändert", async () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["Posten", "Betrag", "Quote"],
      ["Kita", 1234567.5, 0.026],
    ]);
    ws.B2.z = '#,##0.00 "€"';
    ws.C2.z = "0.0%";
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Budget");
    const buf = Buffer.from(XLSX.write(wb, { type: "buffer", bookType: "xlsx" }));
    expect(await extractText(buf, "budget.xlsx", "")).toContain('Kita,"1.234.567,50 €","2,6%"');
    expect(await extractText(Buffer.from("Wert\n3.14\n"), "a.csv", "text/csv")).toContain("3.14");
  });

  it("tauscht nur bei Zahlen, nicht bei Datum oder Text", () => {
    const ws: Record<string, unknown> = {
      "!ref": "A1:A3",
      A1: { t: "n", v: 1234.5, w: "1,234.50 €", z: '#,##0.00 "€"' },
      A2: { t: "n", v: 45930, w: "30.09.2025", z: "dd.mm.yyyy" },
      A3: { t: "s", v: "a,b.c", w: "a,b.c" },
    };
    germanNumbers(ws, XLSX.SSF.is_date);
    expect((ws.A1 as { w: string }).w).toBe("1.234,50 €");
    expect((ws.A2 as { w: string }).w).toBe("30.09.2025");
    expect((ws.A3 as { w: string }).w).toBe("a,b.c");
  });
});
