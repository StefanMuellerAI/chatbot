// Stadt Rabensfurt (große kreisangehörige Stadt im Landkreis Altmoorland)
import type { CellSpec, DocSpec, SheetSpec, ThreadSpec } from "../types";

// ───────────────────────────────────────────── Geräteliste für die Migration zum Zweckverband (deterministisch erzeugt)

/** Park-Miller-Generator mit festem Startwert – liefert bei jedem Build dieselbe Liste. */
function random(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface InventoryUnit {
  welle: 1 | 2;
  unit: string;
  site: string;
  floor: number;
  room: number;
  count: number;
  fv: string;
  kind?: "schulung" | "besprechung" | "mobil" | "kasse" | "scan";
}

const RATHAUS = "Rathaus, Markt 1";

const INVENTORY_UNITS: InventoryUnit[] = [
  { welle: 1, unit: "Bürgermeisterin, Büro", site: RATHAUS, floor: 1, room: 1, count: 6, fv: "Ratsinformationssystem" },
  { welle: 1, unit: "Stabsstelle Kommunikation und Bürgerbeteiligung", site: RATHAUS, floor: 1, room: 8, count: 7, fv: "Redaktionssystem Internet" },
  { welle: 1, unit: "Gleichstellung, Personalrat, Schwerbehindertenvertretung", site: RATHAUS, floor: 3, room: 2, count: 6, fv: "–" },
  { welle: 1, unit: "Rechnungsprüfung", site: RATHAUS, floor: 3, room: 8, count: 3, fv: "Finanzwesen (Lesezugriff)" },
  { welle: 1, unit: "FB 1 – Leitung", site: RATHAUS, floor: 2, room: 1, count: 3, fv: "–" },
  { welle: 1, unit: "FB 1 – Team Personal", site: RATHAUS, floor: 2, room: 4, count: 15, fv: "Personalwesen, Zeiterfassung" },
  { welle: 1, unit: "FB 1 – Team IT und Digitalisierung", site: RATHAUS, floor: 0, room: 10, count: 9, fv: "Administration" },
  { welle: 1, unit: "FB 1 – Team Ratsbüro und Wahlamt", site: RATHAUS, floor: 1, room: 14, count: 8, fv: "Ratsinformationssystem, Wahlen" },
  { welle: 1, unit: "FB 1 – Vergabestelle", site: RATHAUS, floor: 2, room: 16, count: 3, fv: "Vergabeplattform" },
  { welle: 1, unit: "FB 1 – Empfang, Poststelle, Hausdienst", site: RATHAUS, floor: 0, room: 1, count: 5, fv: "Scan-Arbeitsplatz", kind: "scan" },
  { welle: 1, unit: "FB 1 – Archiv", site: RATHAUS, floor: 0, room: 20, count: 4, fv: "Archivverwaltung" },
  { welle: 1, unit: "Schulungsraum Rathaus", site: RATHAUS, floor: 3, room: 20, count: 10, fv: "–", kind: "schulung" },
  { welle: 1, unit: "Besprechungsräume, Ratssaal", site: RATHAUS, floor: 1, room: 20, count: 6, fv: "Videokonferenz", kind: "besprechung" },
  { welle: 2, unit: "FB 2 – Leitung, Haushalt und Controlling", site: RATHAUS, floor: 2, room: 20, count: 12, fv: "Finanzwesen" },
  { welle: 2, unit: "FB 2 – Stadtkasse und Vollstreckung", site: RATHAUS, floor: 0, room: 2, count: 18, fv: "Finanzwesen, Vollstreckung", kind: "kasse" },
  { welle: 2, unit: "FB 2 – Vollstreckungsaußendienst", site: RATHAUS, floor: 0, room: 12, count: 3, fv: "Vollstreckung (mobil)", kind: "mobil" },
  { welle: 2, unit: "FB 2 – Team Steuern und Abgaben", site: RATHAUS, floor: 3, room: 10, count: 17, fv: "Steuern und Abgaben" },
  { welle: 2, unit: "FB 2 – Liegenschaften und Versicherungen", site: RATHAUS, floor: 2, room: 30, count: 7, fv: "Liegenschaftsverwaltung" },
  { welle: 2, unit: "FB 2 – Beteiligungsmanagement", site: RATHAUS, floor: 2, room: 34, count: 3, fv: "Finanzwesen" },
];

interface InventoryRow {
  nr: string;
  device: string;
  year: string;
  os: string;
  unit: string;
  room: string;
  peripherals: string;
  welle: number;
}

function buildInventory(): InventoryRow[] {
  const rnd = random(20260429);
  const pick = <T>(items: [T, number][]): T => {
    const total = items.reduce((s, [, w]) => s + w, 0);
    let x = rnd() * total;
    for (const [item, w] of items) {
      x -= w;
      if (x < 0) return item;
    }
    return items[items.length - 1][0];
  };
  const years: [string, number][] = [
    ["2017", 5],
    ["2018", 9],
    ["2019", 13],
    ["2020", 21],
    ["2021", 17],
    ["2022", 11],
    ["2023", 9],
    ["2024", 9],
    ["2025", 6],
  ];
  const rows: InventoryRow[] = [];
  let n = 0;
  for (const u of INVENTORY_UNITS) {
    for (let i = 0; i < u.count; i++) {
      n++;
      const room = `${u.floor}.${String(u.room + Math.floor(i / 2)).padStart(2, "0")}`;
      let device: string;
      let year: string;
      let peripherals: string;
      if (u.kind === "schulung") {
        device = "Kompakt-PC";
        year = "2017";
        peripherals = "1 Monitor";
      } else if (u.kind === "besprechung") {
        device = "Konferenz-PC";
        year = pick([
          ["2019", 1],
          ["2021", 2],
          ["2023", 1],
        ]);
        peripherals = "Raumkamera, Lautsprecher, Wanddisplay";
      } else if (u.kind === "mobil") {
        device = "Tablet mit Mobilfunk";
        year = "2022";
        peripherals = "mobiler Belegdrucker";
      } else {
        device = pick([
          ["Notebook 14 Zoll", 6],
          ["Notebook 15 Zoll", 1],
          ["Kompakt-PC", 3],
        ]);
        year = pick(years);
        peripherals = device === "Kompakt-PC" ? "2 Monitore" : "Dockingstation, 2 Monitore";
        if (u.kind === "kasse") peripherals += ", Bondrucker, Kartenterminal";
        if (u.kind === "scan") peripherals += ", Dokumentenscanner";
      }
      const os = u.kind === "mobil" ? "Mobil-BS" : Number(year) <= 2018 || (year === "2019" && rnd() < 0.5) ? "Client-BS 10" : "Client-BS 11";
      rows.push({
        nr: `RF-AP-${String(n).padStart(4, "0")}`,
        device,
        year,
        os,
        unit: u.unit,
        room,
        peripherals,
        welle: u.welle,
      });
    }
  }
  return rows;
}

const INVENTORY = buildInventory();
const INVENTORY_FIRST = 5; // erste Datenzeile (mit Titel)

/** Geräteliste mit Formeln für Alter und Austausch (Kriterium des Zweckverbands: Beschaffung 2020 oder früher). */
const inventorySheet: SheetSpec = {
  name: "Geräteliste",
  title: "Geräteliste Teil 1 – Wellen 1 und 2 (Rathaus: Bürgermeisterin, Stabsstellen, FB 1 und FB 2)",
  subtitle: "Aufnahme vor Ort 13.04.–24.04.2026 · Austausch bei Alter ab 6 Jahren (Standard ZKIT) · Stand 29.04.2026",
  columns: [
    { header: "Inventar-Nr.", width: 12 },
    { header: "Gerätetyp", width: 20 },
    { header: "Beschaffung", width: 11 },
    { header: "Betriebssystem", width: 13 },
    { header: "Organisationseinheit", width: 36 },
    { header: "Raum", width: 7 },
    { header: "Peripherie", width: 44 },
    { header: "Welle", width: 7, fmt: "int" },
    { header: "Alter 2026", width: 9, fmt: "int" },
    { header: "Austausch", width: 10 },
    { header: "Austausch (1 = ja)", width: 10, fmt: "int" },
  ],
  rows: INVENTORY.map((r): CellSpec[] => [
    r.nr,
    r.device,
    r.year,
    r.os,
    r.unit,
    r.room,
    r.peripherals,
    r.welle,
    { f: "2026-C{r}" },
    { f: 'IF(I{r}>=6,"ja","nein")' },
    { f: 'IF(J{r}="ja",1,0)' },
  ]),
  notes: [
    "Austauschkriterium nach Arbeitsplatzstandard des Zweckverbands: Geräte mit Beschaffung 2020 oder früher werden bei der Umstellung ersetzt.",
    "Die Tablets des Vollstreckungsaußendienstes laufen über einen eigenen Mobilfunkvertrag; Migration noch offen.",
    "Teil 2 (Wellen 3 bis 5: FB 3, FB 4 und FB 5 mit allen Außenstellen) folgt bis 15.05.2026.",
  ],
};

/** Übersicht je Organisationseinheit mit Bezügen auf die Geräteliste. */
const inventoryOverview: SheetSpec = (() => {
  const rows: (CellSpec[] | { cells: CellSpec[]; total?: boolean })[] = [];
  let start = INVENTORY_FIRST;
  for (const u of INVENTORY_UNITS) {
    const end = start + u.count - 1;
    rows.push([
      u.welle,
      u.unit,
      u.site,
      { f: `COUNTA('Geräteliste'!A${start}:A${end})` },
      { f: `SUM('Geräteliste'!K${start}:K${end})` },
      { f: "E{r}/D{r}", fmt: "pct" },
      u.fv,
    ]);
    start = end + 1;
  }
  const w1 = INVENTORY_UNITS.filter((u) => u.welle === 1).length;
  const first = INVENTORY_FIRST;
  rows.push({ total: true, cells: [1, "Summe Welle 1", RATHAUS, { f: `SUM(D${first}:D${first + w1 - 1})` }, { f: `SUM(E${first}:E${first + w1 - 1})` }, { f: "E{r}/D{r}", fmt: "pct" }] });
  rows.push({
    total: true,
    cells: [2, "Summe Welle 2", RATHAUS, { f: `SUM(D${first + w1}:D${first + INVENTORY_UNITS.length - 1})` }, { f: `SUM(E${first + w1}:E${first + INVENTORY_UNITS.length - 1})` }, { f: "E{r}/D{r}", fmt: "pct" }],
  });
  const s1 = first + INVENTORY_UNITS.length;
  rows.push({ total: true, cells: ["", "Summe Teil 1", "", { f: `SUM(D${s1}:D${s1 + 1})` }, { f: `SUM(E${s1}:E${s1 + 1})` }, { f: "E{r}/D{r}", fmt: "pct" }] });
  return {
    name: "Übersicht",
    title: "Übersicht nach Organisationseinheit",
    subtitle: "Zählung aus Blatt „Geräteliste“",
    columns: [
      { header: "Welle", width: 7, fmt: "int" },
      { header: "Organisationseinheit", width: 40 },
      { header: "Standort", width: 26 },
      { header: "Arbeitsplätze", width: 12, fmt: "int" },
      { header: "davon Austausch", width: 12, fmt: "int" },
      { header: "Austauschquote", width: 12, fmt: "pct" },
      { header: "Fachverfahren", width: 36 },
    ],
    rows,
  };
})();

export const documents: DocSpec[] = [
  // ───────────────────────────────────────────── FB 1 – Team IT: Beitritt zum Zweckverband
  {
    type: "word",
    id: "rf-beschlussvorlage-beitritt-zkit",
    title: "Beschlussvorlage: Beitritt zum Zweckverband Kommunale IT Altmoor",
    kind: "Beschlussvorlage",
    fileName: "BV-2025-118 Beschlussvorlage Beitritt Zweckverband Kommunale IT Altmoor",
    org: "rabensfurt",
    unit: "rf-it",
    author: "rf-hesse",
    date: "2025-11-12",
    tags: ["zahlen"],
    keywords: ["BV/2025/118", "Migrationspauschale", "Personalüberleitungsvertrag", "528,66 €", "§ 108 Abs. 6 GWB"],
    summary:
      "Vorlage für Haupt- und Finanzausschuss und Stadtrat zum Beitritt der Stadt zum Zweckverband Kommunale IT Altmoor zum 01.07.2026: Ausgangslage der städtischen IT, drei Varianten mit Wirtschaftlichkeitsvergleich, Umlage, Migrationspauschale, Personalübergang, Datenschutz und Zeitplan.",
    meta: [
      ["Vorlage-Nr.", "BV/2025/118"],
      ["Aktenzeichen", "1.2-022.30"],
      ["Status", "öffentlich"],
    ],
    subject: "Beitritt der Stadt Rabensfurt zum Zweckverband Kommunale IT Altmoor (ZKIT) zum 01.07.2026",
    blocks: [
      {
        t: "table",
        header: ["Beratungsfolge", "Sitzung", "Zuständigkeit"],
        rows: [
          ["Haupt- und Finanzausschuss", "27.11.2025", "Vorberatung"],
          ["Stadtrat", "11.12.2025", "Entscheidung"],
        ],
        widths: [3, 2, 2],
      },
      { t: "h1", text: "Beschlussvorschlag" },
      { t: "p", text: "Der Stadtrat der Stadt Rabensfurt beschließt:" },
      {
        t: "ol",
        items: [
          "Die Stadt Rabensfurt tritt dem Zweckverband Kommunale IT Altmoor (ZKIT) mit Wirkung zum **01.07.2026** als Verbandsmitglied bei. Dem Entwurf der Beitrittsvereinbarung (Anlage 1) und dem Entwurf der 3. Satzung zur Änderung der Verbandssatzung (Anlage 2) wird zugestimmt.",
          "Die Bürgermeisterin wird beauftragt, die Beitrittsvereinbarung und den **Personalüberleitungsvertrag** (Anlage 3) abzuschließen und alle weiteren für den Beitritt erforderlichen Erklärungen abzugeben.",
          "Die einmalige **Migrationspauschale** an den Zweckverband in Höhe von 640.000 € sowie die Verbandsumlage ab dem 01.07.2026 werden im Haushalt 2026 im Teilhaushalt 1 veranschlagt. Die Verwaltung beantragt bis zum 31.03.2026 Fördermittel aus dem Landesprogramm „Digitale Kommune“.",
          "In die Verbandsversammlung entsendet die Stadt drei Vertreterinnen oder Vertreter: die Bürgermeisterin kraft Amtes sowie zwei vom Stadtrat aus seiner Mitte zu wählende Mitglieder. Die Wahl erfolgt in der Sitzung am 11.12.2025.",
        ],
      },
      { t: "h1", text: "Sachverhalt" },
      { t: "h2", text: "1. Ausgangslage" },
      {
        t: "p",
        text: "Die Stadt Rabensfurt betreibt ihre Informationstechnik bisher in Eigenregie. Das Team IT und Digitalisierung im Fachbereich 1 betreut mit 7,5 Stellen – davon 1,5 seit 2024 unbesetzt – rund **430 IT-Arbeitsplätze** an 11 Standorten, 38 Fachverfahren, die Telefonanlage und den Serverraum im Untergeschoss des Rathauses.",
      },
      { t: "p", text: "Der Betrieb in der bisherigen Form ist nicht mehr zukunftsfähig:" },
      {
        t: "ul",
        items: [
          "**Personal:** Die Stelle „Systemadministration“ (EG 10 TVöD) wurde seit März 2024 dreimal ausgeschrieben, zuletzt ohne eine einzige geeignete Bewerbung. Zwei der sechs verbliebenen Beschäftigten erreichen bis 2029 die Altersgrenze. Eine Rufbereitschaft außerhalb der Dienstzeit gibt es nicht.",
          "**Informationssicherheit:** Die externe Prüfung der Informationssicherheit im Juni 2025 hat 23 Feststellungen ergeben, davon 6 mit hohem Risiko – unter anderem keine räumlich getrennte Datensicherung, eine veraltete Firewall und kein erprobter Notfallplan.",
          "**Serverraum:** Der 2009 eingerichtete Serverraum genügt weder beim Brandschutz noch bei der Klimatisierung den heutigen Anforderungen. Am 07.08.2025 fiel die Klimaanlage aus; die Verwaltung war rund sechs Stunden nicht arbeitsfähig.",
          "**Digitalisierung:** Von 131 Verwaltungsleistungen, für die die Stadt zuständig ist, sind 58 online verfügbar und nur 22 Ende-zu-Ende digital (Meldung an das Ministerium für Kommunales und Verwaltungsentwicklung, Stand 31.10.2025). Die Einführung der E-Akte ist mit eigenen Mitteln nicht leistbar.",
        ],
      },
      {
        t: "p",
        text: "Der Zweckverband Kommunale IT Altmoor betreut für den Landkreis Altmoorland, die Stadt Altmoor, die Gemeinde Brackenhain, die Kreisvolkshochschule und den Abfallwirtschaftsbetrieb zusammen 1.329 Arbeitsplätze. Er verfügt über ein Rechenzentrum mit zweitem Standort, einen Service Desk, ein Informationssicherheitsmanagement nach IT-Grundschutz und führt derzeit bei seinen Mitgliedern die E-Akte ein. Der Geschäftsführer, Herr Dr. Vogelsang, hat mit Schreiben vom 15.09.2025 die Bereitschaft zur Aufnahme der Stadt erklärt.",
      },
      { t: "h2", text: "2. Geprüfte Varianten" },
      {
        t: "table",
        header: ["Variante", "Beschreibung", "Bewertung"],
        rows: [
          [
            "A – Weiterbetrieb in Eigenregie",
            "Ausbau des Teams IT auf 10,5 Stellen mit Rufbereitschaft, neuer Serverraum (rund 1,1 Mio. €), Ausweichrechenzentrum als Dienstleistung",
            "Hohes Personalrisiko; Stellen sind am Markt kaum zu besetzen; Investitionen vor jeder Verbesserung",
          ],
          [
            "B – Auslagerung an einen privaten Dienstleister",
            "EU-weite Ausschreibung nach GWB und VgV, Vertragslaufzeit fünf Jahre",
            "Umsatzsteuer von 19 % auf das Entgelt; Vergabeverfahren rund zwölf Monate; Abhängigkeit von einem Anbieter",
          ],
          [
            "C – Beitritt zum ZKIT",
            "Interkommunale Zusammenarbeit; Leistungen zum Selbstkostenpreis über die Verbandsumlage",
            "Keine Ausschreibung nötig (§ 108 Abs. 6 GWB); keine Umsatzsteuer (§ 2b UStG); Mitsprache in der Verbandsversammlung",
          ],
        ],
        widths: [3, 5, 5],
      },
      { t: "h2", text: "3. Wirtschaftlichkeitsvergleich" },
      { t: "p", text: "Jährliche Kosten ab 2027 (erstes volles Betriebsjahr), Preisstand 2025, gerundet:" },
      {
        t: "table",
        header: ["Kostenart", "A Eigenregie", "B Privater Dienstleister", "C Zweckverband"],
        rows: [
          ["Personal der Stadt (IT, Steuerung)", "890.000 €", "240.000 €", "310.000 €"],
          ["Leistungsentgelt bzw. Verbandsumlage", "–", "2.680.000 €", "2.605.800 €"],
          ["Lizenzen und Wartung", "1.020.000 €", "60.000 €", "60.000 €"],
          ["Hardware (Abschreibungen)", "430.000 €", "–", "–"],
          ["Netze, Telefonie, Internet", "220.000 €", "–", "–"],
          ["Ausweichrechenzentrum, Datensicherung", "210.000 €", "–", "–"],
          ["Externe Dienstleistungen, Prüfungen", "190.000 €", "30.000 €", "–"],
          ["Abschreibung neuer Serverraum", "55.000 €", "–", "–"],
          ["Summe", "3.015.000 €", "3.010.000 €", "2.975.800 €"],
        ],
        widths: [4, 2, 2, 2],
      },
      {
        t: "p",
        text: "Die Verbandsumlage wird nach § 12 der Verbandssatzung nach der Zahl der Arbeitsplätze erhoben. Nach dem Entwurf des Wirtschaftsplans 2026 des Zweckverbands (Stand 21.10.2025) beträgt der Umlagesatz **528,66 €** je Arbeitsplatz und Monat; für 2027 rechnet die Geschäftsführung mit rund 505 €. Für 430 Arbeitsplätze ergeben sich für 2026 (sechs Monate) 1.363.942,80 € und ab 2027 rund 2.605.800 € im Jahr. Darin enthalten sind Bürosoftware, Betrieb der Fachverfahren, Endgeräte, Netze, Datensicherung und Service Desk.",
      },
      {
        t: "p",
        text: "Die Ist-Kosten der städtischen IT lagen 2024 bei rund 2.390.000 €. Dieser Wert ist allerdings nicht fortschreibbar: Er enthält weder die unbesetzten Stellen noch die Maßnahmen, die zur Behebung der Prüffeststellungen zwingend notwendig sind. Gegenüber einem sicheren Eigenbetrieb (Variante A) ist der Beitritt um rund 39.200 € im Jahr günstiger; entscheidend sind aber die geringeren Personal- und Ausfallrisiken.",
      },
      { t: "h2", text: "4. Einmalige Kosten" },
      {
        t: "table",
        header: ["Position", "Betrag", "Haushalt"],
        rows: [
          ["Migrationspauschale an den Zweckverband (Beitrittsvereinbarung § 5): Umstellung, Datenübernahme, Austausch nicht standardkonformer Endgeräte, Schulungen", "640.000 €", "Ergebnishaushalt 2026, TH 1"],
          ["Glasfaser-Hausanschlüsse Rathaus und Stadthaus (Stadtwerke Rabensfurt GmbH)", "95.000 €", "Investitionsprogramm I-1.2-01"],
          ["Parallelbetrieb des städtischen Serverraums bis 31.03.2027 (rund 4.500 € im Monat)", "40.500 €", "Ergebnishaushalte 2026 und 2027, TH 1"],
          ["Summe", "775.500 €", ""],
        ],
        widths: [6, 2, 3],
      },
      { t: "h2", text: "5. Personal" },
      {
        t: "p",
        text: "Zwei Beschäftigte des Teams IT (Netzwerk und Server) wechseln zum 01.07.2026 auf der Grundlage eines Personalüberleitungsvertrags zum Zweckverband. Die Rechte aus dem TVöD, die erreichten Stufen und die Zusatzversorgung bleiben gewahrt; betriebsbedingte Kündigungen sind ausgeschlossen. Ein Wechsel erfolgt nur mit Zustimmung der Beschäftigten. Wer nicht wechseln möchte, erhält eine gleichwertige Tätigkeit in der Stadtverwaltung.",
      },
      {
        t: "p",
        text: "In der Stadt verbleibt das Team „IT und Digitalisierung“ mit vier Stellen: IT-Koordination und Steuerung der Leistungen des Zweckverbands, Betreuung der Fachanwenderinnen und Fachanwender, Digitalisierungsprojekte (E-Akte, Onlinedienste). Die beiden unbesetzten Stellenanteile (1,5 Stellen) entfallen.",
      },
      {
        t: "p",
        text: "Der Personalrat wurde am 22.10.2025 unterrichtet; eine Dienstvereinbarung zum Übergang wird bis März 2026 verhandelt. Die Gleichstellungsbeauftragte hat keine Einwände erhoben.",
      },
      { t: "h2", text: "6. Datenschutz und Informationssicherheit" },
      {
        t: "p",
        text: "Der Zweckverband verarbeitet personenbezogene Daten im Auftrag der Stadt (Art. 28 DSGVO). Die Vereinbarung zur Auftragsverarbeitung ist Bestandteil der Beitrittsvereinbarung. Die Verantwortung für die Rechtmäßigkeit der Verarbeitung bleibt bei der Stadt. Der behördliche Datenschutzbeauftragte der Stadt ist beteiligt und hat keine Bedenken.",
      },
      { t: "h2", text: "7. Zeitplan" },
      {
        t: "table",
        header: ["Schritt", "Termin"],
        rows: [
          ["Beschluss des Stadtrats", "11.12.2025"],
          ["Beschluss der Verbandsversammlung über die 3. Änderungssatzung (Vorlage VV/2025/011)", "16.12.2025"],
          ["Genehmigung der Satzungsänderung durch das Ministerium für Kommunales und Verwaltungsentwicklung, Bekanntmachung", "bis Mai 2026"],
          ["Wirksamwerden des Beitritts, Personalübergang", "01.07.2026"],
          ["Umstellung der Arbeitsplätze in Wellen nach Fachbereichen", "September bis Dezember 2026"],
          ["Abschaltung des städtischen Serverraums", "bis 31.03.2027"],
        ],
        widths: [6, 2],
      },
      { t: "h1", text: "Finanzielle Auswirkungen" },
      {
        t: "table",
        header: ["Position", "2026", "2027", "ab 2028 (jährlich)"],
        rows: [
          ["Verbandsumlage", "1.363.942,80 €", "2.605.800 €", "rund 2.606.000 €"],
          ["Einmalige Kosten (siehe Nr. 4)", "762.000 €", "13.500 €", "–"],
          ["Wegfallende Kosten des Eigenbetriebs", "– 1.180.000 €", "– 2.080.000 €", "– 2.080.000 €"],
        ],
        widths: [4, 2, 2, 2],
      },
      {
        t: "note",
        text: "**Hinweis der Kämmerei:** Die Umlage für 2027 beruht auf der Finanzplanung des Zweckverbands und kann sich insbesondere durch Lizenzkosten und Tarifsteigerungen verändern. Die Förderung aus dem Programm „Digitale Kommune“ ist nicht eingeplant.",
      },
      { t: "h1", text: "Auswirkungen auf den Klimaschutz" },
      {
        t: "p",
        text: "Mit der Abschaltung des Serverraums entfallen rund 62.000 kWh Strom im Jahr. Das Rechenzentrum des Zweckverbands nutzt die Abwärme der Server für die Beheizung des Verwaltungsgebäudes.",
      },
      {
        t: "note",
        text: "Anlagen: 1 Entwurf Beitrittsvereinbarung · 2 Entwurf der 3. Satzung zur Änderung der Verbandssatzung · 3 Entwurf Personalüberleitungsvertrag · 4 Stellungnahme des Personalrats vom 05.11.2025",
      },
      { t: "signature", lines: ["Corinna Engelke", "Bürgermeisterin"] },
    ],
  },
  {
    type: "excel",
    id: "rf-inventarliste-migration-zkit-teil1",
    title: "Inventarliste für die Migration zum Zweckverband – Teil 1 (Wellen 1 und 2)",
    kind: "Inventarliste",
    fileName: "Inventarliste Migration ZKIT Teil 1 Wellen 1-2 Stand 2026-04-29",
    org: "rabensfurt",
    unit: "rf-it",
    author: "rf-kaminski",
    date: "2026-04-29",
    tags: ["zahlen"],
    keywords: ["RF-AP-0001", "Client-BS 10", "Bondrucker", "Ratsbüro und Wahlamt", "Summe Teil 1"],
    summary:
      "Geräteliste der 145 Arbeitsplätze im Rathaus (Wellen 1 und 2: Bürgermeisterin, Stabsstellen, FB 1 und FB 2) mit Gerätetyp, Beschaffungsjahr, Standort, Peripherie und Fachverfahren; Formeln berechnen Alter und Austauschbedarf, die Übersicht zählt je Organisationseinheit und Welle. Gut zum Filtern, Zählen und Prüfen der Austauschquote.",
    sheets: [inventoryOverview, inventorySheet],
  },
  // ───────────────────────────────────────────── FB 5: Hallenbad Furtbad
  {
    type: "excel",
    id: "rf-kostenvergleich-furtbad-30-jahre",
    title: "Furtbad – Kostenvergleich Sanierung und Neubau über 30 Jahre",
    kind: "Wirtschaftlichkeitsvergleich",
    fileName: "Furtbad Kostenvergleich Sanierung Neubau 30 Jahre Stand 2026-01-22",
    org: "rabensfurt",
    unit: "rf-hochbau",
    author: "rf-arslan",
    date: "2026-01-22",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Bauunterhaltung und Wartung", "KG 400", "Sportstättenförderung", "Zuschussbedarf je Jahr", "Schulschwimmen"],
    summary:
      "Vergleich der Varianten für das Hallenbad Furtbad: Investition nach DIN 276 (14,8 bzw. 19,5 Mio. €), jährliche Betriebskosten und Gesamtbelastung über 30 Jahre mit Bezügen zwischen den Blättern. Eingebauter Formelfehler: Die Summe der Betriebskosten der Sanierung lässt die Bauunterhaltung (150.000 € im Jahr) aus – deshalb erscheint die Sanierung um 0,5 Mio. € günstiger, richtig gerechnet ist der Neubau rund 4 Mio. € günstiger.",
    sheets: [
      {
        name: "30 Jahre",
        title: "Furtbad – Gesamtbelastung über 30 Jahre",
        subtitle: "Beträge in Euro, brutto · ohne Preissteigerung und ohne Abzinsung · Stand 22.01.2026",
        columns: [
          { header: "Position", width: 52 },
          { header: "Variante A Sanierung", width: 17, fmt: "eur0" },
          { header: "Variante B Neubau", width: 17, fmt: "eur0" },
          { header: "Differenz B – A", width: 15, fmt: "eur0" },
        ],
        rows: [
          ["Investition (Blatt „Investition“)", { f: "Investition!C11" }, { f: "Investition!D11" }, { f: "C{r}-B{r}" }],
          ["Sportstättenförderung des Landes (erwartet)", -3700000, -4000000, { f: "C{r}-B{r}" }],
          ["Ersatzinvestitionen im Betrachtungszeitraum (Technik)", 1600000, 600000, { f: "C{r}-B{r}" }],
          ["Mehrkosten während der Schließung (Schulschwimmen extern, Busse)", 380000, 45000, { f: "C{r}-B{r}" }],
          ["Zuschussbedarf Betrieb über 30 Jahre (Blatt „Betrieb“)", { f: "Betrieb!B12*30" }, { f: "Betrieb!C12*30" }, { f: "C{r}-B{r}" }],
          { total: true, cells: ["Gesamtbelastung 30 Jahre", { f: "SUM(B5:B9)" }, { f: "SUM(C5:C9)" }, { f: "C{r}-B{r}" }] },
          { total: true, cells: ["Durchschnittliche Belastung je Jahr", { f: "B10/30" }, { f: "C10/30" }, { f: "C{r}-B{r}" }] },
        ],
        notes: [
          "Ergebnis: Über 30 Jahre ist die Sanierung rund 0,5 Mio. € günstiger als der Neubau.",
          "Schließzeit bei Sanierung rund 24 Monate; der Neubau entsteht auf dem Parkplatz neben dem Bestand, Schließung nur rund 3 Monate für den Umzug.",
          "Nutzungsdauer nach Sanierung rund 25 Jahre, Neubau rund 50 Jahre – ein Restwert nach 30 Jahren ist nicht berücksichtigt.",
        ],
      },
      {
        name: "Investition",
        title: "Investitionskosten nach DIN 276",
        subtitle: "Kostenschätzung Planungsgruppe Bad & Sport, Rhedenburg (Gutachten vom 14.11.2025), Preisstand 3. Quartal 2025, brutto",
        columns: [
          { header: "Kostengruppe", width: 12 },
          { header: "Bezeichnung", width: 52 },
          { header: "Sanierung", width: 15, fmt: "eur0" },
          { header: "Neubau", width: 15, fmt: "eur0" },
          { header: "Differenz", width: 14, fmt: "eur0" },
        ],
        rows: [
          ["KG 200", "Vorbereitende Maßnahmen (Neubau einschließlich Abbruch des Altbaus)", 180000, 650000, { f: "D{r}-C{r}" }],
          ["KG 300", "Bauwerk – Baukonstruktionen", 5900000, 8400000, { f: "D{r}-C{r}" }],
          ["KG 400", "Bauwerk – Technische Anlagen (Badewasser, Lüftung, Wärme)", 5300000, 5600000, { f: "D{r}-C{r}" }],
          ["KG 500", "Außenanlagen und Freiflächen", 250000, 900000, { f: "D{r}-C{r}" }],
          ["KG 600", "Ausstattung", 220000, 350000, { f: "D{r}-C{r}" }],
          ["KG 700", "Baunebenkosten (Planung, Gutachten, Gebühren)", 2950000, 3600000, { f: "D{r}-C{r}" }],
          { total: true, cells: ["", "Summe Kostengruppen 200 bis 700", { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "D{r}-C{r}" }] },
        ],
        notes: ["Grundstück (KG 100) und Finanzierung (KG 800) sind nicht enthalten. Kostenrisiko laut Gutachten: ± 20 %."],
      },
      {
        name: "Betrieb",
        title: "Jährliche Betriebskosten und Erlöse",
        subtitle: "Planwerte für ein volles Betriebsjahr nach Fertigstellung, Euro je Jahr",
        columns: [
          { header: "Kostenart", width: 46 },
          { header: "Sanierung", width: 15, fmt: "eur0" },
          { header: "Neubau", width: 15, fmt: "eur0" },
          { header: "Bemerkung", width: 44 },
        ],
        rows: [
          ["Energie (Wärme, Strom)", 300000, 220000, "Neubau mit Wärmepumpe und Photovoltaik"],
          ["Personal (Aufsicht, Kasse, Technik, Reinigung)", 820000, 790000, "13,5 bzw. 13 Vollzeitstellen"],
          ["Wasser, Abwasser, Chemikalien", 95000, 80000, ""],
          ["Versicherung, Verwaltung, Sonstiges", 110000, 105000, ""],
          ["Bauunterhaltung und Wartung", 150000, 80000, "nachgetragen nach Hinweis der Kämmerei vom 20.01.2026"],
          { total: true, cells: ["Summe Aufwand", { f: "SUM(B5:B8)" }, { f: "SUM(C5:C9)" }, ""] },
          ["Erlöse (Eintritt, Schulen, Vereine)", -420000, -455000, "Neubau: höhere Nachfrage durch sechste Bahn"],
          { total: true, cells: ["Zuschussbedarf je Jahr", { f: "B10+B11" }, { f: "C10+C11" }, ""] },
        ],
        notes: ["Zum Vergleich: Zuschussbedarf des Furtbads 2024 (Ist) rund 1,12 Mio. €."],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "rf-buergerinformation-furtbad-varianten",
    title: "Bürgerinformation: Zukunft des Furtbads – Sanierung oder Neubau",
    kind: "Präsentation",
    fileName: "Buergerinformation Furtbad Varianten 2026-02-12",
    org: "rabensfurt",
    unit: "rf-fb5",
    author: "rf-ostermann",
    date: "2026-02-10",
    tags: ["zahlen"],
    keywords: ["Furtbad", "86.400 Besuche", "18.06.2026", "Hallenbad Altmoor", "Lehrschwimmbecken"],
    summary:
      "Folien für den Bürgerinformationsabend zum Hallenbad Furtbad: Zustand und Nutzung, die Varianten Sanierung und Neubau, Kosten über 30 Jahre, Folgen für Schulen und Vereine und weiteres Verfahren. Enthält die korrigierten Betriebskosten und taugt als Prüfgrundlage für die Excel-Tabelle und die Presseantwort.",
    slides: [
      { t: "title", title: "Zukunft des Furtbads", subtitle: "Bürgerinformation am 12. Februar 2026, 18:30 Uhr · Aula der Oberschule Furtwiesen" },
      {
        t: "bullets",
        title: "Das Furtbad heute",
        bullets: [
          "Eröffnet 1974: Sportbecken 25 × 12,5 m mit fünf Bahnen, Lehrschwimmbecken, Sprunganlage 1 m und 3 m",
          { text: "86.400 Besuche im Jahr 2024", sub: ["öffentlicher Badebetrieb: 41.200", "Schulschwimmen: 28.700 (11 Schulen)", "Vereine: 16.500 (4 Vereine)"] },
          "Zuschussbedarf 2024: rund 1,12 Mio. €",
          "Gutachten 2025: Lüftung, Badewassertechnik, Dach und Beckenköpfe am Ende ihrer Lebensdauer",
        ],
        notes:
          "Das Bad funktioniert, solange nichts ausfällt – aber das Risiko einer ungeplanten Schließung steigt jedes Jahr. Die dreiwöchige Schließung im Oktober 2025 wegen der Umwälzpumpe war ein Warnsignal.",
      },
      {
        t: "chart",
        title: "Besuche 2019 bis 2025",
        chart: {
          type: "bar",
          categories: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"],
          series: [{ name: "Besuche", values: [92300, 38100, 41700, 79800, 84900, 86400, 81900] }],
          unit: "Besuche",
        },
        caption: "2020 und 2021: Schließungen in der Pandemie · 2025: drei Wochen Schließung wegen eines Pumpenschadens",
      },
      {
        t: "twocol",
        title: "Zwei Varianten",
        left: {
          heading: "Variante A: Sanierung im Bestand",
          bullets: ["Erneuerung von Technik, Dach, Fassade und Becken", "Raumprogramm bleibt wie heute", "Schließung rund **24 Monate**", "Nutzungsdauer danach rund 25 Jahre"],
        },
        right: {
          heading: "Variante B: Neubau neben dem Bestand",
          bullets: [
            "Neubau auf dem heutigen Parkplatz, das alte Bad bleibt bis zum Umzug offen",
            "Sportbecken mit sechs Bahnen, Lehrschwimmbecken mit Hubboden",
            "Schließung nur rund **3 Monate**",
            "Nutzungsdauer rund 50 Jahre",
          ],
        },
        notes: "Beim Neubau wird das alte Gebäude erst nach dem Umzug abgerissen; dort entstehen dann die neuen Parkplätze.",
      },
      {
        t: "table",
        title: "Kosten im Überblick",
        header: ["", "Sanierung", "Neubau"],
        rows: [
          ["Investition (DIN 276, brutto)", "14,8 Mio. €", "19,5 Mio. €"],
          ["Förderung des Landes (erwartet)", "3,7 Mio. €", "4,0 Mio. €"],
          ["Eigenanteil der Stadt", "11,1 Mio. €", "15,5 Mio. €"],
          ["Zuschussbedarf Betrieb je Jahr", "1,06 Mio. €", "0,82 Mio. €"],
          ["Schließzeit", "24 Monate", "ca. 3 Monate"],
        ],
        notes:
          "Die Betriebskosten der Sanierung sind gegenüber der ersten Tabelle vom 22.01. korrigiert: Dort fehlte in der Summe die Bauunterhaltung von 150.000 € im Jahr. Bitte nur noch diese Zahlen verwenden.",
      },
      {
        t: "chart",
        title: "Kosten über 30 Jahre",
        chart: {
          type: "bar",
          categories: ["Sanierung", "Neubau"],
          series: [
            { name: "Investition abzüglich Förderung", values: [11.1, 15.5] },
            { name: "Ersatzinvestitionen und Schließung", values: [1.98, 0.65] },
            { name: "Betrieb 30 Jahre", values: [31.65, 24.6] },
          ],
          unit: "Mio. €",
        },
        caption: "Summe: Sanierung 44,7 Mio. € · Neubau 40,7 Mio. € · ohne Preissteigerung und Zinsen",
        notes:
          "Über 30 Jahre ist der Neubau trotz der höheren Investition rund 4 Mio. € günstiger, weil Energie, Bauunterhaltung und Ersatzinvestitionen deutlich niedriger sind. Vereinfachte Betrachtung ohne Zinsen – darauf hinweisen, falls jemand nach Kreditkosten fragt.",
      },
      {
        t: "bullets",
        title: "Was heißt das für Schulen und Vereine?",
        bullets: [
          "Bei Sanierung: Schulschwimmen für 24 Monate im Hallenbad Altmoor (Busfahrt rund 25 Minuten)",
          "Mehrkosten für Busse und Wasserzeiten: rund 190.000 € im Jahr",
          "Vereine: Training in Altmoor nur abends und am Wochenende möglich",
          "Bei Neubau: Unterbrechung nur in den Sommerferien",
        ],
      },
      {
        t: "bullets",
        title: "Wie geht es weiter?",
        bullets: [
          "Online-Beteiligung bis 15.03.2026 unter www.rabensfurt.example/furtbad",
          "Auswertung und Vorlage für den Ausschuss für Stadtentwicklung, Bauen und Umwelt im Mai 2026",
          "Entscheidung im Stadtrat am **18.06.2026**",
          "Danach Förderantrag und Planung – Baubeginn frühestens 2027",
        ],
        notes: "Keine Zusagen zu einem Baubeginn machen; der Förderaufruf des Landes für 2027 ist noch nicht veröffentlicht.",
      },
      {
        t: "end",
        title: "Ihre Meinung zählt!",
        lines: ["Fragen und Hinweise: furtbad@rabensfurt.example", "Bernhard Ostermann · Fachbereichsleiter Stadtentwicklung, Bauen und Umwelt · Telefon 040 66969-450"],
      },
    ],
  },
  // ───────────────────────────────────────────── FB 2: Finanzen, Steuern
  {
    type: "excel",
    id: "rf-investitionsprogramm-2026-2029",
    title: "Investitionsprogramm 2026 bis 2029 (Entwurf Haushalt 2026)",
    kind: "Investitionsprogramm",
    fileName: "Investitionsprogramm 2026-2029 Entwurf Haushalt 2026 Stand 2025-10-17",
    org: "rabensfurt",
    unit: "rf-fb2",
    author: "rf-luebke",
    date: "2025-10-17",
    tags: ["zahlen"],
    keywords: ["I-4.1-01", "Kinderhaus Moorlerche", "Kreditbedarf", "Städtebauförderung", "Lindenstraße"],
    summary:
      "Investitionsprogramm zum Haushaltsentwurf 2026 mit 16 Maßnahmen (Feuerwehr, Kitas, Ganztag, Straßen, Furtbad als Platzhalter, Betriebshof), Jahresraten, Zuwendungen und Eigenanteilen sowie einem Finanzierungsblatt mit Kreditbedarf. Gut zum Nachrechnen, Filtern nach Fachbereichen und als Grundlage für die spätere Haushaltssperre.",
    sheets: [
      {
        name: "Investitionsprogramm",
        title: "Investitionsprogramm 2026 bis 2029",
        subtitle: "Entwurf zum Haushalt 2026 · Auszahlungen in Euro · Stand 17.10.2025",
        columns: [
          { header: "Nr.", width: 10 },
          { header: "Maßnahme", width: 50 },
          { header: "FB/Team", width: 8 },
          { header: "bis 2025", width: 12, fmt: "eur0" },
          { header: "2026", width: 12, fmt: "eur0" },
          { header: "2027", width: 12, fmt: "eur0" },
          { header: "2028", width: 12, fmt: "eur0" },
          { header: "2029", width: 12, fmt: "eur0" },
          { header: "Gesamt", width: 13, fmt: "eur0" },
          { header: "Zuwendungen", width: 13, fmt: "eur0" },
          { header: "Eigenanteil", width: 13, fmt: "eur0" },
          { header: "Bemerkung", width: 40 },
        ],
        rows: [
          ["I-1.2-01", "Glasfaser-Hausanschlüsse Rathaus und Stadthaus (Vorbereitung Beitritt ZKIT)", "1.2", 0, 95000, 0, 0, 0, { f: "SUM(D{r}:H{r})" }, 0, { f: "I{r}-J{r}" }, "Förderantrag „Digitale Kommune“ vorgesehen"],
          ["I-3-01", "Feuerwehrgerätehaus Rabensfurt-Süd, Neubau", "3", 350000, 1800000, 2400000, 300000, 0, { f: "SUM(D{r}:H{r})" }, 900000, { f: "I{r}-J{r}" }, "Landeszuweisung Brandschutz"],
          ["I-3-02", "Hilfeleistungslöschfahrzeug HLF 20 für die Ortswehr Mühlenkamp", "3", 0, 620000, 0, 0, 0, { f: "SUM(D{r}:H{r})" }, 150000, { f: "I{r}-J{r}" }, "Ersatz für LF 16 von 1998"],
          ["I-4.1-01", "Kita Furtwiesen – Erweiterung um zwei Krippengruppen (24 Plätze)", "4.1", 180000, 1200000, 0, 0, 0, { f: "SUM(D{r}:H{r})" }, 690000, { f: "I{r}-J{r}" }, "Landesprogramm „Kita-Ausbau 2026“ (50 %), Inbetriebnahme 08/2026"],
          ["I-4.1-02", "Investitionszuschuss Neubau Kita Rabensfurt-Süd (Kinderhaus Moorlerche e. V.)", "4.1", 0, 0, 450000, 480000, 0, { f: "SUM(D{r}:H{r})" }, 0, { f: "I{r}-J{r}" }, "20 % der Gesamtkosten von 4,65 Mio. €"],
          ["I-4.1-03", "Grundschule Furtwiesen – Ganztagsausbau (Mensa, Betreuungsräume)", "4.1", 400000, 2100000, 1300000, 0, 0, { f: "SUM(D{r}:H{r})" }, 2280000, { f: "I{r}-J{r}" }, "Ganztagsförderung 60 %; Rechtsanspruch ab Schuljahr 2026/27"],
          ["I-4.2-01", "Stadtbibliothek – Selbstverbuchung und Open Library", "4.2", 0, 145000, 0, 0, 0, { f: "SUM(D{r}:H{r})" }, 72500, { f: "I{r}-J{r}" }, ""],
          ["I-5-01", "Lindenstraße – grundhafte Erneuerung mit Radweg", "5", 80000, 950000, 1400000, 0, 0, { f: "SUM(D{r}:H{r})" }, 1215000, { f: "I{r}-J{r}" }, "Förderung kommunaler Straßenbau 50 %, Bescheid erwartet 03/2026"],
          ["I-5.1-01", "Altstadt – Platzgestaltung Markt und Verfügungsfonds", "5.1", 60000, 300000, 750000, 900000, 400000, { f: "SUM(D{r}:H{r})" }, 1606000, { f: "I{r}-J{r}" }, "Städtebauförderung (zwei Drittel)"],
          ["I-5.2-01", "Furtbad – Planungsmittel (Variantenentscheidung offen)", "5.2", 120000, 450000, 900000, 0, 0, { f: "SUM(D{r}:H{r})" }, 0, { f: "I{r}-J{r}" }, "Entscheidung des Stadtrats 2026"],
          ["I-5.2-02", "Furtbad – Umsetzung (Platzhalter Variante Sanierung, ohne Planungsmittel)", "5.2", 0, 0, 2500000, 5800000, 5030000, { f: "SUM(D{r}:H{r})" }, 3700000, { f: "I{r}-J{r}" }, "Platzhalter; Neubau wäre um 4,7 Mio. € teurer"],
          ["I-5.2-03", "Rathaus – Erneuerung der Heizung und Photovoltaikanlage", "5.2", 0, 0, 520000, 610000, 0, { f: "SUM(D{r}:H{r})" }, 226000, { f: "I{r}-J{r}" }, "Förderung energetische Sanierung (erwartet)"],
          ["I-5.2-04", "Grundschule Rabensfurt-Ost – Dachsanierung", "5.2", 0, 0, 0, 680000, 0, { f: "SUM(D{r}:H{r})" }, 0, { f: "I{r}-J{r}" }, ""],
          ["I-5.3-01", "Radverkehrskonzept – 1. Bauabschnitt Furtwiesen–Altstadt", "5.3", 0, 380000, 420000, 300000, 0, { f: "SUM(D{r}:H{r})" }, 825000, { f: "I{r}-J{r}" }, "Förderung 75 %, Antrag gestellt"],
          ["I-5.4-01", "Betriebshof – Ersatzbeschaffung Fahrzeuge (Kehrmaschine, zwei Pritschenwagen)", "5.4", 0, 410000, 180000, 190000, 200000, { f: "SUM(D{r}:H{r})" }, 0, { f: "I{r}-J{r}" }, "Kehrmaschine Baujahr 2007"],
          ["I-5.4-02", "Friedhof – Erneuerung der Wege und Urnengemeinschaftsanlage", "5.4", 0, 0, 120000, 0, 0, { f: "SUM(D{r}:H{r})" }, 0, { f: "I{r}-J{r}" }, "Gebührenhaushalt"],
          {
            total: true,
            cells: [
              "",
              "Summe Investitionsprogramm",
              "",
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "SUM(G{first}:G{last})" },
              { f: "SUM(H{first}:H{last})" },
              { f: "SUM(I{first}:I{last})" },
              { f: "SUM(J{first}:J{last})" },
              { f: "SUM(K{first}:K{last})" },
              "",
            ],
          },
        ],
        notes: [
          "Furtbad: Die Umsetzung ist als Platzhalter mit den Kosten der Sanierung (14,8 Mio. € einschließlich Planung) veranschlagt, solange der Stadtrat nicht entschieden hat.",
          "Maßnahmen ab 50.000 € werden einzeln dargestellt; kleinere Maßnahmen sind in den Budgets der Fachbereiche enthalten.",
        ],
      },
      {
        name: "Finanzierung",
        title: "Finanzierung des Investitionsprogramms",
        subtitle: "Beträge in Euro · Zuwendungen nach erwartetem Zahlungseingang",
        columns: [
          { header: "Position", width: 50 },
          { header: "2026", width: 13, fmt: "eur0" },
          { header: "2027", width: 13, fmt: "eur0" },
          { header: "2028", width: 13, fmt: "eur0" },
          { header: "2029", width: 13, fmt: "eur0" },
          { header: "Summe", width: 14, fmt: "eur0" },
        ],
        rows: [
          ["Auszahlungen für Investitionen", { f: "Investitionsprogramm!E21" }, { f: "Investitionsprogramm!F21" }, { f: "Investitionsprogramm!G21" }, { f: "Investitionsprogramm!H21" }, { f: "SUM(B{r}:E{r})" }],
          ["Einzahlungen aus Zuwendungen", 3442500, 2939000, 2447000, 2466000, { f: "SUM(B{r}:E{r})" }],
          ["Eigenmittel aus laufender Verwaltungstätigkeit", 1100000, 1300000, 1500000, 1700000, { f: "SUM(B{r}:E{r})" }],
          { total: true, cells: ["Kreditbedarf", { f: "B5-B6-B7" }, { f: "C5-C6-C7" }, { f: "D5-D6-D7" }, { f: "E5-E6-E7" }, { f: "SUM(B{r}:E{r})" }] },
          ["Ordentliche Tilgung", 2350000, 2410000, 2480000, 2550000, { f: "SUM(B{r}:E{r})" }],
          { total: true, cells: ["Nettoneuverschuldung", { f: "B8-B9" }, { f: "C8-C9" }, { f: "D8-D9" }, { f: "E8-E9" }, { f: "SUM(B{r}:E{r})" }] },
        ],
        notes: [
          "Die Kreditermächtigung bedarf wegen des Haushaltssicherungskonzepts der Genehmigung durch die Kommunalaufsicht des Landkreises.",
          "Stand der Investitionskredite am 31.12.2025 (Prognose): 41,7 Mio. €.",
          "Rund 370.000 € der Zuwendungen gehen erst nach 2029 ein (Schlusszahlungen nach Verwendungsnachweis, vor allem Furtbad).",
        ],
      },
    ],
  },
  {
    type: "excel",
    id: "rf-grundsteuer-hebesatz-2026-varianten",
    title: "Grundsteuer: Aufkommensneutralität 2025 und Hebesatzvarianten 2026",
    kind: "Berechnung",
    fileName: "Grundsteuer Aufkommensneutralitaet und Hebesatzvarianten 2026 Stand 2025-09-15",
    org: "rabensfurt",
    unit: "rf-steuern",
    author: "rf-neumann",
    date: "2025-09-15",
    tags: ["zahlen"],
    keywords: ["Messbetragsvolumen", "aufkommensneutral", "Mindererträge", "Geschäftsgrundstücke", "Musterfall"],
    summary:
      "Arbeitstabelle des Teams Steuern zur Grundsteuerreform: Berechnung des aufkommensneutralen Hebesatzes (2025: 470 %), Mindererträge durch gesunkene Messbeträge, vier Hebesatzvarianten für 2026 mit Musterfällen und die Belastungsverschiebung zwischen Wohn- und Geschäftsgrundstücken.",
    sheets: [
      {
        name: "Aufkommensneutralität",
        title: "Grundsteuer – aufkommensneutraler Hebesatz",
        subtitle: "Messbeträge laut Mitteilungen des Finanzamts Altmoor · Stand 31.08.2025",
        columns: [
          { header: "Position", width: 54 },
          { header: "Grundsteuer A", width: 16, fmt: "eur" },
          { header: "Grundsteuer B", width: 16, fmt: "eur" },
          { header: "Hinweis", width: 46 },
        ],
        rows: [
          ["Messbetragsvolumen 2024 (altes Recht)", 23400, 1582000, "Veranlagung 2024"],
          ["Hebesatz 2024", { f: "3.3", fmt: "pct" }, { f: "4.2", fmt: "pct" }, ""],
          ["Aufkommen 2024 (Soll)", { f: "B5*B6" }, { f: "C5*C6" }, "Vergleichsmaßstab für die Aufkommensneutralität"],
          ["Messbetragsvolumen neues Recht (Stand 31.12.2024)", 22060, 1413700, "Grundlage der Hebesatzsatzung"],
          ["Aufkommensneutraler Hebesatz (rechnerisch)", { f: "ROUND(B7/B8,2)", fmt: "pct" }, { f: "ROUND(C7/C8,2)", fmt: "pct" }, "Transparenzregister des Landes: B 472 %"],
          ["Hebesatz 2025 (Hebesatzsatzung vom 12.12.2024)", { f: "3.5", fmt: "pct" }, { f: "4.7", fmt: "pct" }, ""],
          ["Soll 2025 bei Messbetragsvolumen 31.12.2024", { f: "B8*B10" }, { f: "C8*C10" }, ""],
          ["Messbetragsvolumen 2025 (Stand 31.08.2025)", 21880, 1386200, "Änderungen nach Einsprüchen und Fortschreibungen"],
          ["Soll 2025 (Stand 31.08.2025)", { f: "B12*B10" }, { f: "C12*C10" }, ""],
          ["Mindererträge gegenüber 2024", { f: "B13-B7" }, { f: "C13-C7" }, ""],
          ["Aufkommensneutraler Hebesatz auf Basis 31.08.2025", { f: "ROUND(B7/B12,2)", fmt: "pct" }, { f: "ROUND(C7/C12,2)", fmt: "pct" }, "Grundlage für Variante B auf Blatt „Varianten 2026“"],
        ],
        notes: ["Rund 140 Einspruchsverfahren gegen Grundsteuerwerte sind beim Finanzamt noch offen; das Messbetragsvolumen kann weiter sinken."],
      },
      {
        name: "Varianten 2026",
        title: "Hebesatzvarianten Grundsteuer B für 2026",
        subtitle: "Messbetragsvolumen 2026 (Prognose mit Neubaugebiet Am Furtanger): 1.391.000 € · Ansatz Finanzplanung 2026: 6.650.000 €",
        columns: [
          { header: "Variante", width: 34 },
          { header: "Hebesatz", width: 10, fmt: "pct" },
          { header: "Messbetragsvolumen 2026", width: 15, fmt: "eur0" },
          { header: "Aufkommen 2026", width: 15, fmt: "eur0" },
          { header: "Abweichung zum Ansatz", width: 14, fmt: "eur0" },
          { header: "Musterfall Einfamilienhaus", width: 13, fmt: "eur" },
          { header: "Musterfall Eigentumswohnung", width: 13, fmt: "eur" },
          { header: "Musterfall Mietwohngrundstück (6 WE)", width: 15, fmt: "eur" },
          { header: "Musterfall Geschäftsgrundstück", width: 14, fmt: "eur" },
        ],
        rows: [
          ["A – unverändert", 4.7, 1391000, { f: "B{r}*C{r}" }, { f: "D{r}-6650000" }, { f: "ROUND(128*B{r},2)" }, { f: "ROUND(46.2*B{r},2)" }, { f: "ROUND(310.5*B{r},2)" }, { f: "ROUND(842*B{r},2)" }],
          ["B – aufkommensneutral nachgesteuert", 4.79, 1391000, { f: "B{r}*C{r}" }, { f: "D{r}-6650000" }, { f: "ROUND(128*B{r},2)" }, { f: "ROUND(46.2*B{r},2)" }, { f: "ROUND(310.5*B{r},2)" }, { f: "ROUND(842*B{r},2)" }],
          ["C – Vorschlag Haushaltssicherung", 4.95, 1391000, { f: "B{r}*C{r}" }, { f: "D{r}-6650000" }, { f: "ROUND(128*B{r},2)" }, { f: "ROUND(46.2*B{r},2)" }, { f: "ROUND(310.5*B{r},2)" }, { f: "ROUND(842*B{r},2)" }],
          ["D – Konsolidierung erweitert", 5.2, 1391000, { f: "B{r}*C{r}" }, { f: "D{r}-6650000" }, { f: "ROUND(128*B{r},2)" }, { f: "ROUND(46.2*B{r},2)" }, { f: "ROUND(310.5*B{r},2)" }, { f: "ROUND(842*B{r},2)" }],
        ],
        notes: [
          "Musterfall: Grundsteuermessbeträge typischer Objekte (Einfamilienhaus 128,00 €, Eigentumswohnung 46,20 €, Mietwohngrundstück 310,50 €, Geschäftsgrundstück 842,00 €).",
          "Vorschlag der Kämmerei für den Haushaltsentwurf 2026: Variante C (495 %) als Beitrag zum Haushaltssicherungskonzept. Jeder Prozentpunkt bringt rund 13.900 €.",
        ],
      },
      {
        name: "Belastungsverschiebung",
        title: "Belastungsverschiebung nach Grundstücksart (Grundsteuer B)",
        subtitle: "Vergleich 2024 (altes Recht, 420 %) mit 2025 (neues Recht, 470 %), Stand 31.12.2024",
        columns: [
          { header: "Grundstücksart", width: 34 },
          { header: "Wirtschaftliche Einheiten", width: 12, fmt: "int" },
          { header: "Messbeträge alt", width: 14, fmt: "eur0" },
          { header: "Grundsteuer 2024", width: 14, fmt: "eur0" },
          { header: "Messbeträge neu", width: 14, fmt: "eur0" },
          { header: "Grundsteuer 2025", width: 14, fmt: "eur0" },
          { header: "Veränderung", width: 13, fmt: "eur0" },
          { header: "Veränderung in %", width: 11, fmt: "pct" },
          { header: "je Einheit", width: 11, fmt: "eur" },
        ],
        rows: [
          ["Einfamilienhäuser", 5120, 438000, { f: "C{r}*'Aufkommensneutralität'!C6" }, 512300, { f: "E{r}*'Aufkommensneutralität'!C10" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "G{r}/B{r}" }],
          ["Zweifamilienhäuser", 820, 98400, { f: "C{r}*'Aufkommensneutralität'!C6" }, 109600, { f: "E{r}*'Aufkommensneutralität'!C10" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "G{r}/B{r}" }],
          ["Mietwohngrundstücke", 1140, 286500, { f: "C{r}*'Aufkommensneutralität'!C6" }, 318400, { f: "E{r}*'Aufkommensneutralität'!C10" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "G{r}/B{r}" }],
          ["Wohnungseigentum", 2210, 151200, { f: "C{r}*'Aufkommensneutralität'!C6" }, 172900, { f: "E{r}*'Aufkommensneutralität'!C10" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "G{r}/B{r}" }],
          ["Geschäftsgrundstücke", 410, 342600, { f: "C{r}*'Aufkommensneutralität'!C6" }, 138200, { f: "E{r}*'Aufkommensneutralität'!C10" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "G{r}/B{r}" }],
          ["Gemischt genutzte Grundstücke", 380, 121800, { f: "C{r}*'Aufkommensneutralität'!C6" }, 76500, { f: "E{r}*'Aufkommensneutralität'!C10" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "G{r}/B{r}" }],
          ["Sonstige bebaute Grundstücke, Teileigentum", 690, 58200, { f: "C{r}*'Aufkommensneutralität'!C6" }, 23700, { f: "E{r}*'Aufkommensneutralität'!C10" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "G{r}/B{r}" }],
          ["Unbebaute Grundstücke", 530, 85300, { f: "C{r}*'Aufkommensneutralität'!C6" }, 62100, { f: "E{r}*'Aufkommensneutralität'!C10" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "G{r}/B{r}" }],
          {
            total: true,
            cells: [
              "Summe",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "F{r}-D{r}" },
              { f: "G{r}/D{r}" },
              { f: "G{r}/B{r}" },
            ],
          },
        ],
        notes: ["Wohngrundstücke tragen nach der Reform einen deutlich höheren Anteil, Geschäftsgrundstücke werden entlastet. Das Landesrecht sieht keine differenzierten Hebesätze vor."],
      },
    ],
  },
  {
    type: "word",
    id: "rf-antwort-widerspruch-grundbesitzabgaben-2025",
    title: "Antwort auf Widerspruch gegen den Grundbesitzabgabenbescheid 2025 mit Änderungsbescheid",
    kind: "Bescheid / Antwortschreiben",
    fileName: "2025-02-19 Antwort Widerspruch Grundbesitzabgaben Brakemeier mit Aenderungsbescheid",
    org: "rabensfurt",
    unit: "rf-steuern",
    author: "rf-neumann",
    date: "2025-02-19",
    tags: ["personendaten"],
    keywords: ["Brakemeier", "5.1100.047128", "§ 351 Abs. 2", "Wertfortschreibung", "Rechtsbehelfsbelehrung"],
    summary:
      "Schreiben an einen Eigentümer, der sich gegen die gestiegene Grundsteuer nach der Reform wehrt: Erklärung der drei Stufen, Verweis an das Finanzamt, Abhilfe bei der Straßenreinigungsgebühr mit Änderungsbescheid und Rechtsbehelfsbelehrung. Enthält erfundene Personen-, Grundstücks- und Kontodaten (Anonymisierung) und eignet sich für eine Fassung in Leichter Sprache.",
    meta: [
      ["Aktenzeichen", "2.1-GrSt-0417/25"],
      ["Kassenzeichen", "5.1100.047128"],
      ["Ihr Schreiben vom", "03.02.2025"],
    ],
    recipient: ["Herrn", "Reinhold Brakemeier", "Am Mühlenteich 7", "00761 Rabensfurt"],
    subject: "Grundbesitzabgaben 2025 – Ihr Widerspruch vom 03.02.2025 gegen den Bescheid vom 15.01.2025; Änderungsbescheid zur Straßenreinigungsgebühr",
    blocks: [
      { t: "p", text: "Sehr geehrter Herr Brakemeier," },
      {
        t: "p",
        text: "vielen Dank für Ihr Schreiben vom 03.02.2025, mit dem Sie gegen den Grundbesitzabgabenbescheid 2025 vom 15.01.2025 für Ihr Grundstück Am Mühlenteich 7 (Gemarkung Rabensfurt, Flur 12, Flurstück 88/4) Widerspruch eingelegt haben. Sie wenden sich vor allem gegen die Grundsteuer, die von 412,78 € im Jahr 2024 auf 601,60 € im Jahr 2025 gestiegen ist, und gegen die Höhe der Straßenreinigungsgebühr.",
      },
      {
        t: "p",
        text: "Ihre Tochter, Frau Sandra Brakemeier, hat am 10.02.2025 telefonisch nach dem Stand gefragt. Da uns keine Vollmacht vorlag, konnten wir ihr leider keine Auskunft geben. Wenn Sie möchten, dass wir künftig mit ihr sprechen, senden Sie uns bitte eine kurze schriftliche Vollmacht.",
      },
      { t: "h2", text: "1. So wird die Grundsteuer seit 2025 berechnet" },
      { t: "p", text: "Mit der Grundsteuerreform wird die Grundsteuer seit dem 01.01.2025 nach neuen Werten erhoben. Die Berechnung erfolgt in drei Stufen:" },
      {
        t: "ol",
        items: [
          "**Grundsteuerwert:** Das Finanzamt Altmoor hat ihn mit Bescheid vom 14.06.2023 auf 412.900 € festgestellt (Aktenzeichen 33/171/04187).",
          "**Grundsteuermessbetrag:** Grundsteuerwert × Steuermesszahl 0,31 Promille, ebenfalls vom Finanzamt festgesetzt: 128,00 €.",
          "**Grundsteuer:** Messbetrag × Hebesatz der Stadt. Diesen Schritt übernimmt die Stadt: 128,00 € × 470 % = 601,60 €.",
        ],
      },
      {
        t: "p",
        text: "Die Stadt ist an die Bescheide des Finanzamts gebunden. Ihre Einwände betreffen vor allem die Wohnfläche: Das Finanzamt hat 168 m² angesetzt, nach Ihrer Darstellung sind es nur 142 m², weil das Dachgeschoss nicht ausgebaut ist. Die Wohnfläche fließt in den Grundsteuerwert ein. Darüber entscheidet allein das Finanzamt, denn Entscheidungen in einem Grundlagenbescheid können nur durch Anfechtung dieses Bescheids angegriffen werden (§ 351 Abs. 2 der Abgabenordnung, der nach § 1 Abs. 2 AO auch für die Grundsteuer gilt). In diesem Punkt kann Ihr Widerspruch gegen unseren Bescheid daher keinen Erfolg haben.",
      },
      {
        t: "p",
        text: "**Unsere Empfehlung:** Die Einspruchsfrist gegen den Bescheid des Finanzamts ist abgelaufen. Sie können beim Finanzamt Altmoor aber eine fehlerbeseitigende Wertfortschreibung nach § 222 Abs. 3 des Bewertungsgesetzes beantragen und eine Wohnflächenberechnung beifügen. Ändert das Finanzamt den Messbetrag, passen wir Ihren Grundsteuerbescheid von Amts wegen an (§ 175 Abs. 1 Satz 1 Nr. 1 AO) und erstatten zu viel gezahlte Beträge.",
      },
      { t: "h2", text: "2. Hebesatz und Aufkommensneutralität" },
      {
        t: "p",
        text: "Der Stadtrat hat den Hebesatz der Grundsteuer B mit der Hebesatzsatzung vom 12.12.2024 von 420 % auf 470 % angehoben. Weil die neuen Messbeträge insgesamt niedriger sind als die alten, nimmt die Stadt mit 470 % etwa so viel Grundsteuer ein wie 2024 (rund 6,64 Mio. €). Der im Transparenzregister des Landes veröffentlichte aufkommensneutrale Hebesatz für Rabensfurt liegt bei 472 %.",
      },
      {
        t: "p",
        text: "Aufkommensneutral bedeutet allerdings nur, dass die Stadt insgesamt nicht mehr einnimmt. Für einzelne Grundstücke kann die Grundsteuer steigen oder sinken. Bei Einfamilienhäusern steigt sie in Rabensfurt im Durchschnitt um rund 30 %, Geschäftsgrundstücke werden deutlich entlastet. Bei Ihnen beträgt die Steigerung 45,7 %, vor allem wegen der angesetzten Wohnfläche.",
      },
      { t: "h2", text: "3. Straßenreinigungsgebühr" },
      {
        t: "p",
        text: "In diesem Punkt haben Sie recht. Ihr Grundstück grenzt an die Straßen Am Mühlenteich und Kastanienweg. Nach § 4 Abs. 2 der Straßenreinigungsgebührensatzung wird bei Eckgrundstücken nur die längere Frontlänge berücksichtigt. Wir haben irrtümlich beide Seiten zusammengezählt (24 m statt 18 m). Insoweit helfen wir Ihrem Widerspruch ab und setzen die Gebühr mit diesem Bescheid neu fest.",
      },
      { t: "h2", text: "Änderungsbescheid" },
      { t: "p", text: "Der Grundbesitzabgabenbescheid 2025 vom 15.01.2025 wird hinsichtlich der Straßenreinigungsgebühr wie folgt geändert:" },
      {
        t: "table",
        header: ["Abgabe", "Bemessung", "bisher", "neu"],
        rows: [
          ["Grundsteuer B", "Messbetrag 128,00 € × 470 %", "601,60 €", "601,60 €"],
          ["Straßenreinigungsgebühr", "24 m bzw. 18 m × 2,35 €", "56,40 €", "42,30 €"],
          ["Summe 2025", "", "658,00 €", "643,90 €"],
        ],
        widths: [3, 4, 2, 2],
      },
      {
        t: "p",
        text: "Die Rate zum 15.02.2025 über 164,50 € haben Sie bereits gezahlt. Die übrigen Raten zum 15.05., 15.08. und 15.11.2025 betragen jeweils **159,80 €**. Liegt uns ein SEPA-Lastschriftmandat vor, passen wir den Einzug automatisch an; andernfalls überweisen Sie bitte unter Angabe des Kassenzeichens 5.1100.047128 auf das Konto der Stadtkasse Rabensfurt, IBAN DE00 2105 3172 4417 0628 15.",
      },
      { t: "h2", text: "4. Zu Ihrem Widerspruch im Übrigen" },
      {
        t: "p",
        text: "Soweit sich Ihr Widerspruch gegen die Grundsteuer richtet, müssten wir ihn zurückweisen. Sie können ihn insoweit bis zum 21.03.2025 kostenfrei zurücknehmen; andernfalls erlassen wir einen Widerspruchsbescheid, für den nach der Verwaltungskostensatzung Gebühren entstehen können. Bitte beachten Sie: Der Widerspruch hat keine aufschiebende Wirkung (§ 80 Abs. 2 Satz 1 Nr. 1 VwGO). Die Grundsteuer ist auch während des Verfahrens zu den Fälligkeitsterminen zu zahlen.",
      },
      { t: "h2", text: "Rechtsbehelfsbelehrung" },
      {
        t: "p",
        text: "Gegen diesen Änderungsbescheid kann innerhalb eines Monats nach Bekanntgabe Widerspruch erhoben werden. Der Widerspruch ist schriftlich, in elektronischer Form nach § 3a Abs. 2 des Verwaltungsverfahrensgesetzes oder zur Niederschrift bei der Stadt Rabensfurt, Die Bürgermeisterin, Team Steuern und Abgaben, Markt 1, 00761 Rabensfurt, einzulegen. Einwendungen gegen den Grundsteuerwert und den Grundsteuermessbetrag sind nicht hier, sondern beim Finanzamt Altmoor geltend zu machen.",
      },
      {
        t: "note",
        text: "Datenschutz: Informationen zur Verarbeitung Ihrer Daten nach Art. 13 DSGVO finden Sie unter www.rabensfurt.example/datenschutz oder erhalten Sie auf Wunsch in Papierform.",
      },
      { t: "signature", lines: ["Mit freundlichen Grüßen", "Im Auftrag", "Olga Neumann"] },
    ],
  },
  // ───────────────────────────────────────────── Altstadt: Parken, Handel, Leerstand
  {
    type: "word",
    id: "rf-vermerk-parkraumkonzept-altstadt",
    title: "Vermerk: Parkraumkonzept Altstadt – Bewohnerparkzone B und Parkgebühren",
    kind: "Vermerk",
    fileName: "2025-07-07 Vermerk Parkraumkonzept Altstadt Bewohnerparkzone B",
    org: "rabensfurt",
    unit: "rf-ordnung",
    author: "rf-wendler",
    date: "2025-07-07",
    keywords: ["Zone B", "§ 45 Abs. 1b", "Parkscheinpflicht", "Kurzzeitstellplätze", "A/2025/011"],
    summary:
      "Kurzer Vermerk des Teams Ordnung und Verkehr: Ergebnisse der Parkraumerhebung in der Altstadt und Vorschlag für eine zweite Bewohnerparkzone, höhere Gebühren, Parkscheinpflicht am Marktplatz und Haltezonen für Pflegedienste – mit Kosten und Zeitplan.",
    meta: [["Aktenzeichen", "3.2-121.40"]],
    subject: "Parkraumkonzept Altstadt – Erweiterung des Bewohnerparkens (Zone B) und Parkraumbewirtschaftung",
    blocks: [
      {
        t: "p",
        text: "**Anlass:** 14 Beschwerden aus der südlichen Altstadt seit Januar 2025 (zuletzt am 28.06.2025 aus der Mühlenstraße) und Antrag der Fraktion Ökologische Mitte vom 15.04.2025 (A/2025/011).",
      },
      { t: "p", text: "**Parkraumerhebung** am 13. und 14.05.2025 (Team Klimaschutz und Mobilität):" },
      {
        t: "ul",
        items: [
          "612 öffentliche Stellplätze in der Altstadt (Marktplatz 148, Straßenraum 464)",
          "Auslastung werktags 10–12 Uhr: 94 %, abends 19–22 Uhr: 103 % (Gehwegparken)",
          "58 % der Fahrzeuge tagsüber ohne Bewohnerparkausweis, 37 % parken länger als vier Stunden",
          "Bewohnerparkzone A (Altstadt-Nord, seit 2016): 390 Ausweise; im Süden (Mühlenstraße, Kirchgasse, Am Wall) gibt es keine Regelung",
        ],
      },
      { t: "p", text: "**Vorschlag:**" },
      {
        t: "ol",
        items: [
          "Bewohnerparkzone B (Altstadt-Süd) nach § 45 Abs. 1b Satz 1 Nr. 2a StVO mit rund 180 Stellplätzen",
          "Gebühr für den Bewohnerparkausweis in beiden Zonen 120 € im Jahr (bisher 30 €); 50 % Ermäßigung für schwerbehinderte Menschen mit Merkzeichen G",
          "Parkscheinpflicht am Marktplatz Mo–Sa 8–18 Uhr, 1,50 € je Stunde, die ersten 30 Minuten mit Parkscheibe frei",
          "Zwei Kurzzeitstellplätze für Pflege- und Lieferdienste in der Mühlenstraße",
          "Verkehrsüberwachung: eine zusätzliche Stelle (EG 6), rund 58.000 € im Jahr",
        ],
      },
      {
        t: "p",
        text: "**Finanzen:** einmalig rund 80.000 € (Beschilderung 38.000 €, sechs Parkscheinautomaten 42.000 €); laufende Erträge rund 140.000 € im Jahr (Bewohnerparkausweise ca. 55.000 € statt bisher 11.700 €, Parkgebühren ca. 85.000 €).",
      },
      {
        t: "p",
        text: "**Zeitplan:** Anwohnerbeteiligung 09/2025, Bauausschuss am 18.11.2025, Umsetzung zum 01.04.2026.",
      },
      {
        t: "note",
        text: "Personenbezogene Behindertenparkplätze nur bei Merkzeichen aG (Verwaltungsvorschrift zu § 45 StVO).",
      },
      { t: "signature", lines: ["Wendler"] },
    ],
  },
  {
    type: "word",
    id: "rf-mitschrift-werkstattgespraech-innenstadt",
    title: "Mitschrift: Werkstattgespräch Innenstadt mit Handel und Gastronomie",
    kind: "Mitschrift",
    fileName: "2025-03-13 Mitschrift Werkstattgespraech Innenstadt Handel Gastronomie",
    org: "rabensfurt",
    unit: "rf-planung",
    author: "rf-bornemann",
    date: "2025-03-13",
    tags: ["unstrukturiert", "personendaten"],
    keywords: ["Werbegemeinschaft", "Pop-up-Läden", "Grotjahn", "Kartenabfrage", "Verfügungsfonds"],
    summary:
      "Stichwortartige, nicht abgestimmte Mitschrift eines Werkstattgesprächs mit Händlerinnen, Gastronomen und Eigentümern der Altstadt: Teilnehmerliste mit Kontaktdaten, Kartenabfrage mit Punkten, Diskussion zu Parken, Leerstand und Sauberkeit sowie To-dos. Gut zum Ordnen, Zusammenfassen und Anonymisieren.",
    meta: [
      ["Aktenzeichen", "5.1-610.15"],
      ["Veranstaltung", "Werkstattgespräch Innenstadt, 11.03.2025"],
    ],
    subject: "Mitschrift Werkstattgespräch „Innenstadt Rabensfurt“ am 11.03.2025, 18:00–20:40 Uhr, Ratssaal",
    blocks: [
      {
        t: "p",
        text: "**Mitschrift – Stichworte, nicht abgestimmt.** Moderation: K. Bornemann (Citymanagement), L. Seifert (Stadtplanung). Von der Verwaltung außerdem: H. Baumann (Stabsstelle), B. Ostermann (FB 5, ab 19:00 Uhr).",
      },
      { t: "h2", text: "Teilnehmende" },
      {
        t: "table",
        header: ["Name", "Betrieb", "Kontakt"],
        rows: [
          ["Heike Brammer", "Buchhandlung Brammer, Lange Straße 8", "040 66969-811"],
          ["Murat Yıldırım", "Café Yıldırım, Markt 4", "murat@cafe-yildirim.example"],
          ["Jens Oltmanns", "Optik Oltmanns, Lange Straße 21", "040 66969-812"],
          ["Sabine Grotjahn", "Modehaus Grotjahn (seit 1952), Markt 9", "s.grotjahn@modehaus-grotjahn.example"],
          ["Tobias Heuer", "Fahrradladen Speiche, Mühlenstraße 2", "040 66969-813"],
          ["Ewa Nowakowska", "Blumen Ewa, Kirchgasse 3", "040 66969-814"],
          ["Klaus-Dieter Fehrs", "Vorsitzender Werbegemeinschaft „Rabensfurt aktiv“ e. V.", "kd.fehrs@rabensfurt-aktiv.example"],
          ["Anja Sörensen", "Unverpackt-Laden Füllhorn, Am Wall 6", "040 66969-815"],
          ["Dirk Meinert", "Eigentümer der Ladenlokale Lange Straße 14 und 16", "040 66969-816"],
          ["Gülay Aksu", "Friseursalon Aksu, Lange Straße 30", "040 66969-817"],
          ["Peter Kowalewski", "Rabensfurter Rundschau (Presse, bis 19:15 Uhr)", "–"],
        ],
        widths: [3, 5, 4],
      },
      { t: "h2", text: "1. Blitzlicht – wie läufts?" },
      {
        t: "ul",
        items: [
          "Fr. Brammer: Weihnachtsgeschäft ok, Jan/Feb „tot“, Online-Konkurrenz, Schulbuchgeschäft rettet sie",
          "Hr. Yıldırım: Gastro läuft, aber kein Personal; Gebühr für Außengastro zu hoch (?) – prüfen",
          "Fr. Grotjahn: hört Ende 2026 auf, **keine Nachfolge!!** → droht großer Leerstand Markt 9 (ca. 400 m²)",
          "mehrere: Baustelle Lindenstraße 2024 „hat uns ein halbes Jahr gekostet“, Infos kamen zu spät",
          "Hr. Meinert: Mieten seien „schon runter“, Interessenten wollen aber nur Pop-up / max. 6 Monate",
        ],
      },
      { t: "h2", text: "2. Kartenabfrage „Was nervt?“ (Klebepunkte)" },
      {
        t: "table",
        header: ["Thema", "Punkte"],
        rows: [
          ["Parken / Parkgebühren / Dauerparker", "14"],
          ["Leerstände, „tote“ Schaufenster", "11"],
          ["Sauberkeit, Müll, Tauben am Markt", "9"],
          ["Öffnungszeiten uneinheitlich", "7"],
          ["keine öffentliche Toilette", "6"],
          ["Baustellen-Infos", "5"],
          ["Genehmigungen dauern (Außengastro, Kundenstopper)", "4"],
        ],
        widths: [6, 1],
      },
      { t: "h2", text: "3. Kartenabfrage „Was wünschen Sie sich?“" },
      {
        t: "ul",
        items: [
          "Pop-up-Läden in leeren Geschäften, Stadt vermittelt (12 P.)",
          "Furtfest im Juni wieder größer + gemeinsamer verkaufsoffener Sonntag (10 P.)",
          "Stadtgutschein „Rabensfurt-Taler“, evtl. digital (8 P.)",
          "erste Stunde Parken frei (8 P.) – **strittig**, Fr. Sörensen dagegen: „lieber Fahrradbügel statt Parkplätze“",
          "Wochenmarkt Mi + Sa erhalten, Mi bis 18 Uhr",
          "Leerstandsbörse online",
          "„eine Telefonnummer für alles“ in der Verwaltung",
          "Weihnachtsbeleuchtung – Werbegemeinschaft kann sie nicht mehr allein bezahlen",
        ],
      },
      { t: "h2", text: "4. Diskussion" },
      {
        t: "ul",
        items: [
          "Parken: Hr. Ostermann verweist auf Parkraumkonzept, Ergebnisse im Sommer. Hr. Fehrs: „Wer bei uns 1,50 € zahlen muss, fährt nach Altmoor ins Einkaufszentrum.“",
          "Fr. Sörensen widerspricht: Kundschaft kommt zu Fuß oder mit dem Rad, die Parkplätze am Markt blockieren Beschäftigte (Dauerparker!)",
          "Städtebauförderung: Verfügungsfonds möglich (50 % privat, 50 % Förderung) – Werbegemeinschaft interessiert, Eigenanteil unklar",
          "Hr. Kowalewski fragt nach Leerstandszahlen → Fr. Bornemann: 23 von 168 Ladenlokalen, Veröffentlichung nach dem Ausschuss",
          "Toilette: Idee – Gastronomie öffnet WC für alle gegen Zuschuss der Stadt (Hr. Yıldırım wäre dabei)",
          "Fr. Aksu: Tauben am Markt, Kot vor dem Salon, „seit Jahren gemeldet, nichts passiert“ → an Betriebshof",
        ],
      },
      { t: "h2", text: "Vereinbart / To do" },
      {
        t: "ol",
        items: [
          "Leerstandsliste an Werbegemeinschaft – nur mit Einverständnis der Eigentümer! (KB, bis 31.03.)",
          "Gespräch mit Fr. Grotjahn wg. Nachfolge, Wirtschaftsförderung des Landkreises einbinden (KB)",
          "Pop-up-Programm als Vorschlag für den Ausschuss im Mai (LS/KB)",
          "Termin zum Parkraumkonzept mit Team Ordnung, Hr. Wendler (KB)",
          "Taubenproblem Markt an Betriebshof, Hr. Wittkamp (KB)",
          "Nächstes Treffen nach den Sommerferien",
        ],
      },
      {
        t: "note",
        text: "Teilnehmerliste mit Kontaktdaten nur intern verwenden. Einwilligung zur Weitergabe an die Werbegemeinschaft liegt nur von 7 der 11 Personen vor (fehlt: Oltmanns, Meinert, Aksu, Kowalewski).",
      },
      { t: "signature", lines: ["KB"] },
    ],
  },
  {
    type: "powerpoint",
    id: "rf-innenstadt-leerstand-ausschuss",
    title: "Innenstadt Rabensfurt – Leerstand und nächste Schritte",
    kind: "Präsentation",
    fileName: "Innenstadt Leerstand Ausschuss Stadtentwicklung 2025-05-28",
    org: "rabensfurt",
    unit: "rf-planung",
    author: "rf-bornemann",
    date: "2025-05-26",
    keywords: ["Leerstand", "Probier's in Rabensfurt", "168 Ladenlokale", "Verfügungsfonds"],
    summary:
      "Kurze Präsentation des Citymanagements für den Bauausschuss: Entwicklung des Leerstands seit 2019, Ergebnisse des Werkstattgesprächs mit dem Handel und vier Vorschläge vom Pop-up-Programm bis zur Leerstandsbörse.",
    slides: [
      { t: "title", title: "Innenstadt Rabensfurt", subtitle: "Leerstand und nächste Schritte · Ausschuss für Stadtentwicklung, Bauen und Umwelt am 28. Mai 2025" },
      {
        t: "chart",
        title: "Leerstehende Ladenlokale in der Altstadt",
        chart: {
          type: "line",
          categories: ["2019", "2020", "2021", "2022", "2023", "2024", "2025"],
          series: [{ name: "leer stehend", values: [11, 13, 17, 18, 19, 21, 23] }],
          unit: "Ladenlokale",
        },
        caption: "Erhebung jeweils im Frühjahr · insgesamt 168 Ladenlokale",
        notes: "Leerstandsquote damit von 6,5 % auf 13,7 % – verdoppelt. Bei Markt 9 droht Ende 2026 ein großer Leerstand (Geschäftsaufgabe ohne Nachfolge).",
      },
      {
        t: "bullets",
        title: "Was uns der Handel gesagt hat",
        bullets: ["Parken: zu wenig Kurzzeitparkplätze, viele Dauerparker", "„Tote“ Schaufenster ziehen die ganze Straße runter", "Sauberkeit am Markt", "Wunsch: eine feste Ansprechperson in der Verwaltung"],
        notes: "Aus dem Werkstattgespräch am 11.03. mit elf Teilnehmenden aus Handel, Gastronomie und Eigentum.",
      },
      {
        t: "bullets",
        title: "Unsere Vorschläge",
        bullets: [
          "Pop-up-Programm „Probier's in Rabensfurt“: drei Ladenlokale sechs Monate mietfrei, die Stadt trägt die Nebenkosten (rund 18.000 €)",
          "Verfügungsfonds Altstadt aus der Städtebauförderung: 50.000 € im Jahr, die Hälfte privat",
          "Leerstandsbörse unter www.rabensfurt.example/leerstand",
          "Parkraumkonzept Altstadt bis Herbst 2025 (Team Ordnung und Verkehr)",
        ],
        notes: "Für das Pop-up-Programm haben zwei Eigentümer bereits zugesagt. Beschluss nötig, weil die Nebenkosten freiwillige Leistungen sind.",
      },
      { t: "end", title: "Vielen Dank!", lines: ["Katrin Bornemann · Citymanagement", "Telefon 040 66969-471"] },
    ],
  },
  // ───────────────────────────────────────────── FB 5 – Klimaschutz: Kommunale Wärmeplanung
  {
    type: "word",
    id: "rf-zwischenbericht-kommunale-waermeplanung",
    title: "Kommunale Wärmeplanung nach dem Wärmeplanungsgesetz – Zwischenbericht",
    kind: "Mitteilungsvorlage / Zwischenbericht",
    fileName: "MV-2026-031 Zwischenbericht Kommunale Waermeplanung",
    org: "rabensfurt",
    unit: "rf-klima",
    author: "rf-hansen",
    date: "2026-03-25",
    tags: ["zahlen"],
    keywords: ["MV/2026/031", "418 GWh", "Wärmeliniendichte", "Molkerei Altmoorland eG", "§ 71 Abs. 8 GEG", "verkürzte Wärmeplanung"],
    summary:
      "Ausführlicher Zwischenbericht für Ausschuss und Stadtrat zur Wärmeplanung nach dem WPG: Rechtsrahmen und Fristen, Beteiligung, Eignungsprüfung, Bestands- und Potenzialanalyse mit vielen Tabellen, voraussichtliche Wärmeversorgungsgebiete, erster Entwurf des Zielszenarios, Rechtswirkungen (GEG), Datenschutz, Kosten, Zeitplan und Risiken. Gut zum Zusammenfassen, für Leichte Sprache und als Quelle für eine Präsentation.",
    meta: [
      ["Vorlage-Nr.", "MV/2026/031"],
      ["Aktenzeichen", "5.3-614.20"],
      ["Status", "öffentlich"],
    ],
    subject: "Kommunale Wärmeplanung für die Stadt Rabensfurt – Zwischenbericht zu Eignungsprüfung, Bestandsanalyse und Potenzialanalyse",
    blocks: [
      {
        t: "table",
        header: ["Beratungsfolge", "Sitzung", "Zuständigkeit"],
        rows: [
          ["Ausschuss für Stadtentwicklung, Bauen und Umwelt", "21.04.2026", "Kenntnisnahme"],
          ["Stadtrat", "07.05.2026", "Kenntnisnahme"],
        ],
        widths: [4, 2, 2],
      },
      { t: "h1", text: "Mitteilung" },
      { t: "p", text: "Die Verwaltung berichtet über den Stand der kommunalen Wärmeplanung. Ein Beschluss ist nicht erforderlich." },
      { t: "h1", text: "Kurzfassung" },
      {
        t: "ul",
        items: [
          "Rabensfurt muss als Gemeinde mit weniger als 100.000 Einwohnerinnen und Einwohnern bis spätestens **30.06.2028** einen Wärmeplan vorlegen (§ 4 Abs. 2 Nr. 2 WPG). Die Verwaltung strebt den Beschluss bereits im 1. Quartal 2027 an.",
          "Eignungsprüfung, Bestandsanalyse und Potenzialanalyse sind abgeschlossen. Zielszenario und Umsetzungsstrategie sind in Arbeit.",
          "Der Wärmebedarf der Stadt liegt bei rund **418 GWh** im Jahr. Rund 80 % werden mit Erdgas und Heizöl gedeckt; Wärmenetze tragen bisher nur 4,1 % bei.",
          "Die größten erneuerbaren Potenziale liegen in Großwärmepumpen an der Kläranlage, in der unvermeidbaren Abwärme der Molkerei im Gewerbegebiet Nord, in Freiflächen-Solarthermie und in Erdwärme.",
          "Für Wärmenetze eignen sich voraussichtlich die Altstadt, Furtwiesen und Mühlenkamp. In Rabensfurt-Ost, Rabensfurt-Süd, der Siedlung Heideweg und im Außenbereich wird die Versorgung überwiegend dezentral erfolgen, vor allem mit Wärmepumpen.",
          "Eine Ausweisung von Wärmenetzgebieten nach § 26 WPG ist nicht vorgesehen. Die Anforderungen des Gebäudeenergiegesetzes an neue Heizungen in Bestandsgebäuden gelten in Rabensfurt daher erst ab dem 01.07.2028.",
          "Die Kosten für das beauftragte Ingenieurbüro betragen 186.400 €; die Landeszuweisung deckt davon 142.000 €.",
        ],
      },
      { t: "h1", text: "1. Rechtlicher Rahmen und Auftrag" },
      {
        t: "p",
        text: "Das Wärmeplanungsgesetz (WPG) ist am 01.01.2024 in Kraft getreten. Es verpflichtet die Länder, für ihr Gebiet Wärmepläne erstellen zu lassen. Das Land hat diese Aufgabe mit dem Ausführungsgesetz zum Wärmeplanungsgesetz (AG WPG) den Gemeinden übertragen; die Stadt Rabensfurt ist damit planungsverantwortliche Stelle. Für Gemeindegebiete mit bis zu 100.000 Einwohnerinnen und Einwohnern muss der Wärmeplan bis zum 30.06.2028 vorliegen.",
      },
      {
        t: "p",
        text: "Der Stadtrat hat am 13.03.2025 die Aufstellung des Wärmeplans beschlossen (BV/2025/024). Der Beschluss wurde nach § 13 Abs. 1 WPG öffentlich bekannt gemacht. Nach einer Beschränkten Ausschreibung mit Teilnahmewettbewerb nach der UVgO wurde im Juni 2025 die Ingenieurgesellschaft Wärme & Quartier mbH, Rhedenburg, mit der fachlichen Bearbeitung beauftragt. Die Gesamtsteuerung liegt beim Team Klimaschutz und Mobilität.",
      },
      {
        t: "p",
        text: "Ziel der Wärmeplanung ist es, aufzuzeigen, wie die Wärmeversorgung in Rabensfurt bis spätestens 2045 treibhausgasneutral werden kann – und welche Versorgungsart in welchem Gebiet voraussichtlich die wirtschaftlichste ist. Der Wärmeplan ist eine strategische Planung. Er schreibt niemandem eine bestimmte Heizung vor (siehe Abschnitt 8).",
      },
      { t: "h1", text: "2. Projektorganisation und Beteiligung" },
      {
        t: "table",
        header: ["Gremium / Beteiligte", "Rolle", "Termine bisher"],
        rows: [
          ["Lenkungskreis (Bürgermeisterin, Fachbereichsleitung 5, Geschäftsführung Stadtwerke Rabensfurt GmbH, Klimaschutzmanagement)", "Steuerung, Grundsatzentscheidungen", "4 Sitzungen seit Juli 2025"],
          ["Fachbeirat Wärme (Stadtwerke, Wohnungsbaugenossenschaft Rabensfurt eG, Molkerei Altmoorland eG, Bezirksschornsteinfeger, Kreishandwerkerschaft, Untere Wasserbehörde des Landkreises)", "fachliche Beratung, Daten", "3 Sitzungen"],
          ["Öffentlichkeit", "Information und Beteiligung nach § 13 WPG", "Auftaktveranstaltung 10.09.2025 (rund 120 Teilnehmende), Online-Umfrage 15.09. bis 31.10.2025 (1.146 Rückmeldungen), drei Stadtteilgespräche"],
          ["Ausschuss für Stadtentwicklung, Bauen und Umwelt", "politische Begleitung", "Sachstandsberichte 11/2025 und 04/2026"],
        ],
        widths: [5, 3, 4],
      },
      {
        t: "p",
        text: "Für die Bestandsanalyse wurden Daten nach §§ 10 bis 12 WPG erhoben: Gasverbräuche der Jahre 2022 bis 2024 vom Netzbetreiber (Stadtwerke Rabensfurt GmbH), Kehrbuchdaten der Bezirksschornsteinfeger zu Art, Alter und Leistung der Feuerstätten, Absatzdaten des Nahwärmenetzes Mühlenkamp, Angaben großer Verbraucher aus Gewerbe und Industrie sowie Geodaten des Landes. Die Gasverbrauchsdaten lagen für 91 % der Anschlüsse vor; der Heizölverbrauch wurde aus den Kehrbuchdaten und der beheizten Fläche geschätzt.",
      },
      { t: "h1", text: "3. Eignungsprüfung (§ 14 WPG)" },
      {
        t: "p",
        text: "In der Eignungsprüfung wurde untersucht, für welche Teilgebiete eine Versorgung über ein Wärmenetz oder ein Wasserstoffnetz mit hoher Wahrscheinlichkeit nicht in Frage kommt. Für diese Gebiete kann eine **verkürzte Wärmeplanung** durchgeführt werden.",
      },
      {
        t: "ul",
        items: [
          "**Siedlung Heideweg** (312 Gebäude, freistehende Einfamilienhäuser, Wärmeliniendichte unter 700 kWh je Meter und Jahr): kein Wärmenetz wirtschaftlich darstellbar – verkürzte Wärmeplanung.",
          "**Außenbereich** (402 Gebäude, Hofstellen und Streusiedlung): verkürzte Wärmeplanung.",
          "**Wasserstoff:** Ein Anschluss an das Wasserstoff-Kernnetz ist nicht absehbar; die nächste geplante Leitung verläuft mehr als 40 km entfernt. Der Betreiber des Gasverteilnetzes hat keinen verbindlichen Umstellungsfahrplan vorgelegt. Kein Teilgebiet ist daher als Wasserstoffnetzgebiet geeignet.",
        ],
      },
      { t: "h1", text: "4. Bestandsanalyse (§ 15 WPG)" },
      { t: "h2", text: "4.1 Gebäude" },
      {
        t: "p",
        text: "Im Stadtgebiet gibt es 9.240 beheizte Gebäude, davon 7.810 Wohngebäude (5.940 Ein- und Zweifamilienhäuser, 1.870 Mehrfamilienhäuser) und 1.430 Nichtwohngebäude. Mehr als die Hälfte der Gebäude ist vor 1979 errichtet worden, also vor der ersten Wärmeschutzverordnung.",
      },
      {
        t: "table",
        header: ["Baualtersklasse", "Gebäude", "Anteil"],
        rows: [
          ["vor 1949", "1.480", "16 %"],
          ["1949 bis 1978", "3.420", "37 %"],
          ["1979 bis 1994", "1.850", "20 %"],
          ["1995 bis 2009", "1.570", "17 %"],
          ["ab 2010", "920", "10 %"],
          ["Summe", "9.240", "100 %"],
        ],
        widths: [3, 2, 2],
      },
      {
        t: "p",
        text: "Die Altstadt ist als Denkmalbereich geschützt; dort stehen 243 Einzeldenkmale. Energetische Sanierungen und Außengeräte von Wärmepumpen bedürfen dort einer denkmalrechtlichen Genehmigung.",
      },
      { t: "h2", text: "4.2 Wärmebedarf und Energieträger" },
      {
        t: "p",
        text: "Der Endenergieverbrauch für Raumwärme, Warmwasser und Prozesswärme beträgt im Mittel der Jahre 2022 bis 2024 (witterungsbereinigt) rund **418 GWh** im Jahr.",
      },
      {
        t: "table",
        header: ["Energieträger", "GWh je Jahr", "Anteil"],
        rows: [
          ["Erdgas", "263", "62,9 %"],
          ["Heizöl", "71", "17,0 %"],
          ["Biomasse (Holz, Pellets)", "24", "5,7 %"],
          ["Strom für Wärmepumpen", "23", "5,5 %"],
          ["Wärmenetz (Nahwärme Mühlenkamp)", "17", "4,1 %"],
          ["Strom direkt (Nachtspeicher, Durchlauferhitzer)", "12", "2,9 %"],
          ["Flüssiggas und Sonstige", "8", "1,9 %"],
          ["Summe", "418", "100,0 %"],
        ],
        widths: [5, 2, 2],
      },
      {
        t: "table",
        header: ["Sektor", "GWh je Jahr", "Anteil"],
        rows: [
          ["Private Haushalte", "268", "64,1 %"],
          ["Gewerbe, Handel, Dienstleistungen", "92", "22,0 %"],
          ["Industrie", "46", "11,0 %"],
          ["Kommunale Liegenschaften", "12", "2,9 %"],
          ["Summe", "418", "100,0 %"],
        ],
        widths: [5, 2, 2],
      },
      { t: "h2", text: "4.3 Heizungsanlagen" },
      {
        t: "p",
        text: "Nach den Kehrbuchdaten sind 6.870 zentrale Gas- und Ölfeuerstätten in Betrieb. 2.820 davon (41 %) sind älter als 20 Jahre, 1.130 älter als 30 Jahre. Hier steht in den nächsten Jahren ein Austausch an – das ist zugleich die größte Chance für den Umstieg. Nach Meldungen an den Stromnetzbetreiber sind rund 610 Wärmepumpen installiert, zwei Drittel davon in Neubauten nach 2015. Hinzu kommen rund 1.940 Kaminöfen als Zusatzheizung und 210 Holz- und Pelletzentralheizungen.",
      },
      { t: "h2", text: "4.4 Wärmenetze und Gasnetz" },
      {
        t: "p",
        text: "Die Stadtwerke Rabensfurt GmbH betreiben seit 2011 das **Nahwärmenetz Mühlenkamp** mit einer Trassenlänge von 4,2 km und 186 Hausanschlüssen, darunter das Schulzentrum Mühlenkamp. Die Wärme stammt aus einem Erdgas-Blockheizkraftwerk (1,2 MW elektrisch) und einem Holzhackschnitzelkessel (2,5 MW); der erneuerbare Anteil liegt bei 38 %. Das Gasverteilnetz umfasst 168 km mit 7.120 Anschlüssen. Der Konzessionsvertrag mit den Stadtwerken läuft bis 2034.",
      },
      { t: "h2", text: "4.5 Treibhausgasemissionen" },
      {
        t: "p",
        text: "Aus dem Wärmeverbrauch ergeben sich Emissionen von rund 104.500 t CO2-Äquivalenten im Jahr, das sind 2,7 t je Einwohnerin und Einwohner. Erdgas verursacht davon gut 60 %, Heizöl rund 21 %.",
      },
      { t: "h2", text: "4.6 Wärmebedarf und Wärmeliniendichte nach Stadtteilen" },
      {
        t: "p",
        text: "Die Wärmeliniendichte gibt an, wie viel Wärme je Meter Straße im Jahr benötigt wird. Ab etwa 1.500 kWh je Meter und Jahr kommt ein Wärmenetz in Betracht, ab 2.500 kWh ist es in der Regel wirtschaftlich.",
      },
      {
        t: "table",
        header: ["Stadtteil", "Gebäude", "Wärmebedarf (GWh/Jahr)", "Wärmeliniendichte (kWh/m·a, Mittel)"],
        rows: [
          ["Altstadt", "1.180", "74", "3.900"],
          ["Furtwiesen", "1.960", "96", "2.600"],
          ["Mühlenkamp", "1.740", "71", "2.100"],
          ["Rabensfurt-Ost", "1.820", "58", "1.150"],
          ["Rabensfurt-Süd", "1.640", "49", "980"],
          ["Gewerbegebiet Nord", "186", "58", "2.900"],
          ["Siedlung Heideweg", "312", "6", "650"],
          ["Außenbereich", "402", "6", "–"],
          ["Summe", "9.240", "418", ""],
        ],
        widths: [3, 2, 2, 3],
      },
      { t: "h2", text: "4.7 Kommunale Liegenschaften" },
      {
        t: "p",
        text: "Die städtischen Gebäude verbrauchen zusammen rund 12 GWh Wärme im Jahr. Sie sind als Ankerkunden für Wärmenetze besonders wichtig, weil ihr Bedarf groß und planbar ist und die Stadt selbst über den Anschluss entscheidet.",
      },
      {
        t: "table",
        header: ["Liegenschaft", "Wärmeerzeugung (Baujahr)", "Verbrauch (MWh/Jahr)", "Teilgebiet"],
        rows: [
          ["Schulzentrum Mühlenkamp mit Sporthalle", "Nahwärme", "2.450", "T3"],
          ["Hallenbad Furtbad", "Erdgas-Kessel (1998)", "2.180", "T2"],
          ["Oberschule Furtwiesen mit Sporthalle", "Erdgas (2008)", "1.320", "T2"],
          ["Sieben städtische Kitas", "Erdgas, zwei Wärmepumpen", "980", "verschieden"],
          ["Rathaus, Markt 1", "Erdgas (1996)", "610", "T1"],
          ["Grundschule Furtwiesen", "Erdgas (2002)", "540", "T2"],
          ["Stadthaus, Lange Straße 12", "Erdgas (2004)", "480", "T1"],
          ["Grundschule Rabensfurt-Ost", "Heizöl (1994)", "420", "T5"],
          ["Betriebshof", "Erdgas (2011)", "390", "T4"],
          ["Vier Feuerwehrgerätehäuser", "Erdgas, Heizöl", "360", "verschieden"],
          ["Stadtbibliothek und Musikschule (Alte Post)", "Erdgas (2006)", "310", "T1"],
          ["Sonstige (Bürgerhäuser, Friedhof, Wohnungen)", "verschieden", "1.960", "verschieden"],
          ["Summe", "", "12.000", ""],
        ],
        widths: [5, 3, 2, 2],
      },
      { t: "h1", text: "5. Potenzialanalyse (§ 16 WPG)" },
      {
        t: "p",
        text: "Die Potenzialanalyse zeigt, welche erneuerbaren Wärmequellen und welche unvermeidbare Abwärme im Stadtgebiet technisch nutzbar sind. Die Werte sind technische Potenziale; wirtschaftlich und rechtlich erschließbar ist in der Regel nur ein Teil davon.",
      },
      {
        t: "table",
        header: ["Potenzial", "technisch nutzbar (GWh/Jahr)", "Hinweise"],
        rows: [
          ["Abwasserwärme Kläranlage (Großwärmepumpe)", "22", "Ablauftemperatur 10 bis 18 °C; 900 m bis zum Rand von Furtwiesen"],
          ["Flusswärme Furtbach", "9", "nur saisonal nutzbar, Mindestwasserführung beachten"],
          ["Unvermeidbare Abwärme Molkerei Altmoorland eG", "14", "35 bis 45 °C, Anhebung über Wärmepumpe nötig"],
          ["Freiflächen-Solarthermie mit Großwärmespeicher", "38", "Prüffläche 9 ha am Moorgraben, Flächennutzungsplan ändern"],
          ["Oberflächennahe Geothermie (Erdsonden)", "95", "Wasserschutzgebiet schließt 18 % des Stadtgebiets aus"],
          ["Luft-Wasser-Wärmepumpen (dezentral)", "ohne Begrenzung", "Schallschutz in dichter Bebauung, Denkmalschutz Altstadt"],
          ["Biomasse (Landschaftspflege, Stadtwald)", "11", "begrenzt, vorrangig für Spitzenlast"],
          ["Photovoltaik auf Dächern (Strom für Wärmepumpen)", "68 (Strom)", "senkt Betriebskosten dezentraler Wärmepumpen"],
          ["Tiefengeothermie", "nicht bewertet", "keine belastbaren Daten; Prüfung durch das Land"],
          ["Wasserstoff", "0", "kein Netzanschluss absehbar"],
        ],
        widths: [5, 2, 5],
      },
      {
        t: "p",
        text: "Hinzu kommt das Einsparpotenzial durch Sanierung: Bei einer Sanierungsrate von 1,5 % im Jahr sinkt der Wärmebedarf bis 2045 um rund 22 % auf etwa 326 GWh. Höhere Sanierungsraten sind in Rabensfurt nach Einschätzung der Kreishandwerkerschaft wegen fehlender Fachbetriebe nicht realistisch.",
      },
      { t: "h1", text: "6. Voraussichtliche Wärmeversorgungsgebiete (Zwischenstand)" },
      {
        t: "p",
        text: "Auf Grundlage von Bestand und Potenzialen hat das Ingenieurbüro das Stadtgebiet in acht Teilgebiete eingeteilt (§ 18 WPG) und ihre Eignung nach den Stufen des § 19 WPG bewertet. Die Einteilung ist ein Arbeitsstand und wird im Zielszenario überprüft.",
      },
      {
        t: "table",
        header: ["Teilgebiet", "Einteilung (Entwurf)", "Eignung Wärmenetz", "Hauptoptionen"],
        rows: [
          ["T1 Altstadt", "Wärmenetzgebiet", "wahrscheinlich geeignet", "Großwärmepumpe Kläranlage und Furtbach; Denkmalschutz erschwert dezentrale Lösungen"],
          ["T2 Furtwiesen", "Wärmenetzgebiet", "sehr wahrscheinlich geeignet", "Abwasserwärme; Ankerkunden Furtbad und Oberschule"],
          ["T3 Mühlenkamp", "Wärmenetzgebiet (Bestand, Verdichtung)", "sehr wahrscheinlich geeignet", "Umstellung des Gas-BHKW auf Wärmepumpe und Solarthermie"],
          ["T4 Gewerbegebiet Nord", "Prüfgebiet", "wahrscheinlich geeignet", "Abwärme der Molkerei, Prozesswärme"],
          ["T5 Rabensfurt-Ost", "dezentrale Versorgung", "wahrscheinlich ungeeignet", "Luft- und Erdwärmepumpen; kleines Netz Weidenkamp prüfen"],
          ["T6 Rabensfurt-Süd", "dezentrale Versorgung", "sehr wahrscheinlich ungeeignet", "Wärmepumpen, Biomasse"],
          ["T7 Siedlung Heideweg", "dezentrale Versorgung (verkürzte Wärmeplanung)", "sehr wahrscheinlich ungeeignet", "Wärmepumpen"],
          ["T8 Außenbereich", "dezentrale Versorgung (verkürzte Wärmeplanung)", "sehr wahrscheinlich ungeeignet", "Biomasse, Wärmepumpen"],
        ],
        widths: [3, 3, 3, 5],
      },
      { t: "h1", text: "7. Zielszenario – erster Entwurf (§ 17 WPG)" },
      {
        t: "p",
        text: "Das Zielszenario beschreibt die Entwicklung der Wärmeversorgung bis zum Zieljahr 2045 mit den Stützjahren 2030, 2035 und 2040. Der erste Entwurf geht davon aus, dass die drei Netzgebiete schrittweise ausgebaut werden und in den übrigen Gebieten beim Heizungstausch überwiegend Wärmepumpen eingebaut werden.",
      },
      {
        t: "table",
        header: ["Anteil am Wärmebedarf", "2024 (Ist)", "2030", "2035", "2040", "2045"],
        rows: [
          ["Wärmenetze", "4,1 %", "9 %", "17 %", "25 %", "31 %"],
          ["Wärmepumpen (dezentral)", "5,5 %", "15 %", "28 %", "42 %", "52 %"],
          ["Biomasse", "5,7 %", "7 %", "8 %", "8 %", "7 %"],
          ["Erdgas", "62,9 %", "52 %", "35 %", "17 %", "0 %"],
          ["Heizöl", "17,0 %", "12 %", "7 %", "3 %", "0 %"],
          ["Strom direkt, Solarthermie, Sonstige", "4,8 %", "5 %", "5 %", "5 %", "10 %"],
          ["Wärmebedarf gesamt", "418 GWh", "400 GWh", "378 GWh", "352 GWh", "326 GWh"],
        ],
        widths: [4, 2, 2, 2, 2, 2],
      },
      {
        t: "p",
        text: "Für den Ausbau der Wärmenetze in Altstadt und Furtwiesen rechnen die Stadtwerke nach einer ersten Grobkostenschätzung mit Investitionen von rund 38 Mio. € bis 2040 (rund 21 km Trasse, Großwärmepumpe mit 12 MW, Wärmespeicher). Ohne Bundesförderung für Wärmenetze ist der Ausbau nach Aussage der Stadtwerke nicht finanzierbar. Die Treibhausgasemissionen würden im Zielszenario bis 2045 auf Restemissionen von rund 8.000 t sinken.",
      },
      { t: "h2", text: "7.1 Erste Ideen für die Umsetzungsstrategie (§ 20 WPG)" },
      {
        t: "p",
        text: "Der Wärmeplan muss Maßnahmen benennen, die die Stadt selbst in ihrem Zuständigkeitsbereich umsetzen kann. Im Lenkungskreis wurden dazu erste Vorschläge gesammelt; sie werden bis August 2026 mit Kosten und Zuständigkeiten hinterlegt.",
      },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Verantwortlich", "Zeitraum", "Kosten (Schätzung)"],
        rows: [
          ["M1", "Machbarkeitsstudie Großwärmepumpe an der Kläranlage", "Stadtwerke", "2027", "120.000 €"],
          ["M2", "Absichtserklärung zur Nutzung der Abwärme der Molkerei", "Stadt, Stadtwerke", "2026", "–"],
          ["M3", "Transformationsplan Nahwärmenetz Mühlenkamp (Ersatz des Gas-BHKW)", "Stadtwerke", "2026–2027", "80.000 €"],
          ["M4", "Rathaus: neue Heizung mit Wärmepumpe und Photovoltaik", "Team Hochbau", "2027–2028", "1,13 Mio. € (Investitionsprogramm)"],
          ["M5", "Kostenlose Energieberatung im Rathaus, wöchentlich", "Team Klimaschutz", "ab 2026", "15.000 € im Jahr"],
          ["M6", "Leitfaden Wärmepumpen im Denkmalbereich, abgestimmt mit der Unteren Denkmalschutzbehörde des Landkreises", "Team Stadtplanung", "2026", "–"],
          ["M7", "Flächensicherung Solarthermie am Moorgraben (Änderung des Flächennutzungsplans)", "Team Stadtplanung", "2027–2028", "60.000 €"],
          ["M8", "Vorplanung Wärmenetz Furtwiesen mit den Ankerkunden Furtbad und Oberschule", "Stadtwerke, Team Hochbau", "2027", "abhängig von der Entscheidung zum Furtbad"],
        ],
        widths: [1, 6, 3, 2, 3],
      },
      {
        t: "p",
        text: "Die Wohnungsbaugenossenschaft Rabensfurt eG (1.240 Wohnungen, davon 610 in Furtwiesen) hat angekündigt, ihre Bestände in Furtwiesen an ein Wärmenetz anschließen zu wollen, sobald ein verbindlicher Anschlusstermin feststeht. Damit wären rund 18 % des Wärmebedarfs in diesem Teilgebiet gesichert.",
      },
      { t: "h1", text: "8. Rechtliche Wirkungen" },
      {
        t: "ul",
        items: [
          "Der Wärmeplan hat keine rechtliche Außenwirkung. Er verpflichtet niemanden, eine bestimmte Heizungsart zu nutzen, und begründet keinen Anspruch auf den Anschluss an ein Wärmenetz (§ 23 Abs. 4 WPG).",
          "Für neu eingebaute Heizungen in Bestandsgebäuden gilt die Anforderung, mindestens 65 % erneuerbare Energien zu nutzen, in Gemeinden bis 100.000 Einwohnerinnen und Einwohner spätestens ab dem 01.07.2028 (§ 71 Abs. 8 GEG).",
          "Früher gilt sie nur dort, wo die Stadt nach § 26 WPG ausdrücklich ein Gebiet zum Neu- oder Ausbau eines Wärmenetzes oder ein Wasserstoffnetzausbaugebiet ausweist – dann einen Monat nach Bekanntgabe dieser Entscheidung.",
          "Die Verwaltung schlägt **keine** solche Ausweisung vor, solange die Stadtwerke keine verbindlichen und finanzierten Ausbaupläne vorlegen. Eigentümerinnen und Eigentümer sollen nicht vorzeitig in Pflichten geraten, ohne dass ein Netz tatsächlich kommt.",
        ],
      },
      { t: "h1", text: "9. Datenschutz und Datensicherheit" },
      {
        t: "p",
        text: "Die Wärmeplanung verarbeitet gebäudebezogene Daten, die Rückschlüsse auf Personen zulassen können (Verbräuche, Heizungsart, Baujahr). Die Daten werden nur zu Zwecken der Wärmeplanung und nur im erforderlichen Umfang verarbeitet (§§ 10 bis 12 WPG). Sie liegen ausschließlich beim Auftragnehmer auf gesicherten Systemen; mit ihm besteht ein Vertrag über die Auftragsverarbeitung nach Art. 28 DSGVO. Veröffentlicht werden nur zusammengefasste Werte für Baublöcke mit mindestens fünf Gebäuden. Nach Beschluss des Wärmeplans werden die Einzeldaten gelöscht. Der Datenschutzbeauftragte der Stadt ist beteiligt.",
      },
      { t: "h1", text: "10. Kosten und Finanzierung" },
      {
        t: "table",
        header: ["Position", "Betrag"],
        rows: [
          ["Auftrag Ingenieurgesellschaft Wärme & Quartier mbH (brutto)", "186.400 €"],
          ["davon abgerechnet bis 28.02.2026 (Abschläge 1 bis 3, 60 %)", "111.840 €"],
          ["Öffentlichkeitsarbeit, Veranstaltungen, Umfrage", "9.800 €"],
          ["Landeszuweisung nach dem AG WPG (Mehrbelastungsausgleich)", "– 142.000 €"],
          ["Eigenanteil der Stadt (zahlungswirksam)", "54.200 €"],
        ],
        widths: [6, 2],
      },
      {
        t: "p",
        text: "Hinzu kommt eigenes Personal im Umfang von rund einer halben Stelle im Klimaschutzmanagement. Die Mittel sind im Haushalt 2026 veranschlagt; die haushaltswirtschaftlichen Einschränkungen des Haushaltssicherungskonzepts betreffen die Wärmeplanung als pflichtige Aufgabe nicht.",
      },
      { t: "h1", text: "11. Zeitplan und nächste Schritte" },
      {
        t: "table",
        header: ["Arbeitsschritt", "Zeitraum", "Stand"],
        rows: [
          ["Aufstellungsbeschluss", "03/2025", "erledigt"],
          ["Vergabe an das Ingenieurbüro", "06/2025", "erledigt"],
          ["Eignungsprüfung", "07–09/2025", "erledigt"],
          ["Bestandsanalyse", "08–12/2025", "erledigt"],
          ["Potenzialanalyse", "10/2025–02/2026", "erledigt"],
          ["Zielszenario, Einteilung in Wärmeversorgungsgebiete", "03–07/2026", "in Arbeit"],
          ["Umsetzungsstrategie mit Maßnahmen (§ 20 WPG)", "05–08/2026", "offen"],
          ["Entwurf und öffentliche Auslegung (§ 13 WPG, mindestens 30 Tage)", "09–10/2026", "offen"],
          ["Beschluss des Stadtrats und Veröffentlichung", "1. Quartal 2027", "offen"],
          ["Überprüfung und Fortschreibung (§ 25 WPG)", "spätestens alle fünf Jahre", "–"],
        ],
        widths: [6, 3, 2],
      },
      { t: "h1", text: "12. Risiken und offene Punkte" },
      {
        t: "ul",
        items: [
          "**Abwärme Molkerei:** Die Molkerei Altmoorland eG ist zur Abgabe ihrer Abwärme bereit, verlangt aber einen langfristigen Vertrag ohne Liefergarantie. Gespräch mit dem Vorstand am 12.05.2026.",
          "**Investitionsfähigkeit der Stadtwerke:** Der Wirtschaftsplan 2026 der Stadtwerke sieht für Wärmenetze nur 1,2 Mio. € vor. Eine Eigenkapitalstärkung durch die Stadt ist wegen des Haushaltssicherungskonzepts derzeit nicht möglich.",
          "**Denkmalschutz:** In der Altstadt sind Außengeräte von Luft-Wärmepumpen in Sichtachsen kaum genehmigungsfähig. Umso wichtiger ist dort ein Wärmenetz.",
          "**Handwerk:** Die Kreishandwerkerschaft meldet Wartezeiten von sechs bis neun Monaten für den Einbau von Wärmepumpen.",
          "**Furtbad:** Bei einem Neubau könnte das Bad als Ankerkunde mit Wärmepumpe und Abwasserwärme zum Startpunkt des Netzes Furtwiesen werden. Die Entscheidung des Stadtrats zum Furtbad sollte das berücksichtigen.",
          "**Akzeptanz:** Die Online-Umfrage zeigt großes Interesse, aber auch Sorge vor Kosten (siehe Abschnitt 13).",
        ],
      },
      { t: "h1", text: "13. Ergebnisse der Online-Umfrage (Auszug)" },
      {
        t: "table",
        header: ["Frage", "Zustimmung"],
        rows: [
          ["Meine Heizung ist älter als 20 Jahre", "38 %"],
          ["Ich plane einen Heizungstausch in den nächsten fünf Jahren", "27 %"],
          ["Ich würde mich an ein Wärmenetz anschließen, wenn der Preis nicht über dem Gaspreis liegt", "46 %"],
          ["Ich wünsche mir eine unabhängige Energieberatung", "64 %"],
          ["Größtes Hindernis sind die Kosten", "71 %"],
        ],
        widths: [6, 2],
      },
      {
        t: "note",
        text: "Die Umfrage ist nicht repräsentativ (1.146 Rückmeldungen, überwiegend Eigentümerinnen und Eigentümer von Einfamilienhäusern). Mieterinnen und Mieter sind deutlich unterrepräsentiert; für sie ist im Juni ein eigenes Stadtteilgespräch in Rabensfurt-Ost geplant.",
      },
      { t: "signature", lines: ["Corinna Engelke", "Bürgermeisterin"] },
    ],
  },
  {
    type: "powerpoint",
    id: "rf-waermeplan-entwurf-informationsabend",
    title: "Wärmeplan für Rabensfurt – Entwurf und Ergebnisse",
    kind: "Präsentation",
    fileName: "Waermeplan Rabensfurt Entwurf Informationsabend 2026-09-24",
    org: "rabensfurt",
    unit: "rf-klima",
    author: "rf-hansen",
    date: "2026-09-17",
    tags: ["zahlen"],
    keywords: ["Wärmeplanungsgesetz", "23.10.2026", "65-%-Regel", "Molkerei", "Nahwärmenetz Mühlenkamp"],
    summary:
      "Präsentation für den Informationsabend zur Auslegung des Wärmeplan-Entwurfs: heutige Wärmeversorgung, Bedarf nach Stadtteilen, Wärmeversorgungsgebiete, Zielszenario bis 2045, Folgen für Eigentümerinnen und Eigentümer, erste Maßnahmen und Beteiligung. Gut zum Abgleich mit dem Zwischenbericht und für bürgernahe Texte.",
    slides: [
      { t: "title", title: "Wärmeplan für Rabensfurt", subtitle: "Entwurf · Informationsabend am 24. September 2026 im Ratssaal · Auslegung vom 21.09. bis 23.10.2026" },
      {
        t: "bullets",
        title: "Worum es geht",
        bullets: [
          "Das Wärmeplanungsgesetz verpflichtet die Stadt zu einem Wärmeplan bis 30.06.2028 – Rabensfurt ist früher dran",
          "Der Plan zeigt, wo künftig Wärmenetze sinnvoll sind und wo Gebäude einzeln heizen",
          "**Kein Zwang** zum Heizungstausch und keine Anschlusspflicht",
          "Ziel: treibhausgasneutrale Wärme bis spätestens 2045",
        ],
        notes: "Gleich zu Beginn die Angst nehmen: Niemand muss wegen des Wärmeplans seine funktionierende Heizung ausbauen.",
      },
      {
        t: "chart",
        title: "So heizt Rabensfurt heute",
        chart: {
          type: "pie",
          categories: ["Erdgas", "Heizöl", "Biomasse", "Wärmepumpen", "Wärmenetz", "Strom direkt und Sonstige"],
          series: [{ name: "Anteil am Wärmebedarf in %", values: [62.9, 17.0, 5.7, 5.5, 4.1, 4.8] }],
        },
        caption: "Wärmebedarf insgesamt rund 418 GWh im Jahr (Mittel 2022 bis 2024)",
      },
      {
        t: "chart",
        title: "Wärmebedarf nach Stadtteilen",
        chart: {
          type: "bar",
          categories: ["Altstadt", "Furtwiesen", "Mühlenkamp", "Rabensfurt-Ost", "Rabensfurt-Süd", "Gewerbegebiet Nord", "Heideweg und Außenbereich"],
          series: [{ name: "Wärmebedarf", values: [74, 96, 71, 58, 49, 58, 12] }],
          unit: "GWh/Jahr",
        },
        notes: "Hohe Werte allein reichen nicht – entscheidend ist die Wärmeliniendichte, also der Bedarf je Meter Straße. Die ist in der Altstadt am höchsten.",
      },
      {
        t: "table",
        title: "Wärmeversorgungsgebiete im Entwurf",
        header: ["Gebiet", "Versorgung künftig", "Eignung Wärmenetz"],
        rows: [
          ["Altstadt", "Wärmenetz", "wahrscheinlich geeignet"],
          ["Furtwiesen", "Wärmenetz", "sehr wahrscheinlich geeignet"],
          ["Mühlenkamp", "Wärmenetz (Bestand ausbauen)", "sehr wahrscheinlich geeignet"],
          ["Gewerbegebiet Nord", "Prüfgebiet", "wahrscheinlich geeignet"],
          ["Rabensfurt-Ost", "einzelne Gebäude", "wahrscheinlich ungeeignet"],
          ["Rabensfurt-Süd, Heideweg, Außenbereich", "einzelne Gebäude", "sehr wahrscheinlich ungeeignet"],
        ],
      },
      {
        t: "chart",
        title: "Zielszenario: Wie Rabensfurt 2045 heizt",
        chart: {
          type: "line",
          categories: ["2024", "2030", "2035", "2040", "2045"],
          series: [
            { name: "Wärmenetze", values: [4.1, 9, 17, 25, 31] },
            { name: "Wärmepumpen", values: [5.5, 15, 28, 42, 52] },
            { name: "Erdgas und Heizöl", values: [79.9, 64, 42, 20, 0] },
          ],
          unit: "% des Wärmebedarfs",
        },
        caption: "Der Wärmebedarf sinkt durch Sanierung von 418 auf rund 326 GWh im Jahr",
      },
      {
        t: "twocol",
        title: "Was bedeutet das für mich?",
        left: {
          heading: "Im Wärmenetzgebiet",
          bullets: ["Die Stadtwerke bauen die Netze ab 2028 schrittweise aus", "Wer vorher tauschen muss: Übergangslösungen prüfen, Beratung nutzen", "Anschlussinteresse jetzt unverbindlich melden"],
        },
        right: {
          heading: "Im Gebiet mit Einzelversorgung",
          bullets: ["Die Wärmepumpe ist meist die beste Lösung", "Ab 01.07.2028 gilt beim Heizungstausch die 65-%-Regel des GEG", "Förderprogramme und Energieberatung nutzen"],
        },
        notes: "Eine frühere Ausweisung von Netzgebieten, die die 65-%-Regel vorziehen würde, ist nicht geplant.",
      },
      {
        t: "bullets",
        title: "Erste Maßnahmen",
        bullets: [
          "Machbarkeitsstudie für eine Großwärmepumpe an der Kläranlage (2027)",
          "Vereinbarung mit der Molkerei zur Nutzung ihrer Abwärme",
          "Nahwärmenetz Mühlenkamp: Wärmepumpe und Solarthermie statt Gas-Blockheizkraftwerk",
          "Rathaus als Vorbild: neue Heizung 2027/2028",
          "Kostenlose Energieberatung jeden Dienstag im Rathaus",
        ],
      },
      {
        t: "bullets",
        title: "So können Sie mitreden",
        bullets: [
          "Der Entwurf liegt vom 21.09. bis 23.10.2026 im Rathaus aus und steht unter www.rabensfurt.example/waermeplan",
          "Stellungnahmen per E-Mail an waermeplan@rabensfurt.example oder schriftlich an das Team Klimaschutz und Mobilität",
          "Beschluss im Stadtrat voraussichtlich im Februar 2027",
        ],
      },
      { t: "end", title: "Fragen?", lines: ["Merle Hansen · Klimaschutzmanagerin", "Telefon 040 66969-458 · waermeplan@rabensfurt.example"] },
    ],
  },
  // ───────────────────────────────────────────── FB 4: Integration, Kitas
  {
    type: "word",
    id: "rf-integrationskonzept-2026-2030-entwurf",
    title: "Integrationskonzept der Stadt Rabensfurt 2026–2030 (Entwurf)",
    kind: "Konzept (Entwurf)",
    fileName: "Integrationskonzept Rabensfurt 2026-2030 Entwurf Stand 2026-06-18",
    org: "rabensfurt",
    unit: "rf-soziales",
    author: "rf-schmidt",
    date: "2026-06-18",
    keywords: ["Integrationsbeirat", "Sprachmittlerpool", "Kreisvolkshochschule Altmoorland", "Handlungsfeld", "13.09.2026"],
    summary:
      "Entwurf des neuen Integrationskonzepts: Ausgangslage in Zahlen, Beteiligungsprozess, Leitsätze, sieben Handlungsfelder mit Zielen und Maßnahmentabellen, Monitoring mit Indikatoren, Finanzierung unter den Bedingungen der Haushaltssicherung und weiteres Verfahren. Gut zum Zusammenfassen, für eine Fassung in Leichter Sprache und zum Ableiten einer Präsentation.",
    meta: [
      ["Aktenzeichen", "4.3-503.10"],
      ["Stand", "Entwurf zur Beratung im Integrationsbeirat"],
      ["Status", "öffentlich"],
    ],
    subject: "Integrationskonzept 2026–2030 „Rabensfurt – gemeinsam zu Hause“",
    blocks: [
      { t: "h1", text: "Vorwort" },
      {
        t: "p",
        text: "Rabensfurt ist eine Stadt, in die Menschen ziehen – zum Arbeiten, zum Lernen, weil sie Schutz suchen oder weil hier ihre Familie lebt. Rund jede vierte Rabensfurterin und jeder vierte Rabensfurter hat eine Einwanderungsgeschichte. Dieses Konzept beschreibt, wie wir das Zusammenleben in den nächsten fünf Jahren gestalten wollen. Es ist in einem breiten Beteiligungsprozess entstanden. Allen, die mitgewirkt haben, danke ich herzlich. – Corinna Engelke, Bürgermeisterin",
      },
      { t: "h1", text: "1. Anlass und Auftrag" },
      {
        t: "p",
        text: "Das bisherige Integrationskonzept stammt aus dem Jahr 2016. Seitdem haben sich die Rahmenbedingungen stark verändert: Seit 2022 sind rund 700 Menschen aus der Ukraine nach Rabensfurt gekommen, die Zahl der Kinder mit Sprachförderbedarf in den Kitas ist gestiegen, und viele Betriebe suchen dringend Arbeits- und Fachkräfte. Der Stadtrat hat die Verwaltung am 26.09.2024 beauftragt, das Konzept unter Beteiligung der Stadtgesellschaft neu zu fassen (BV/2024/187).",
      },
      { t: "h1", text: "2. Ausgangslage" },
      {
        t: "table",
        header: ["Kennzahl", "Wert"],
        rows: [
          ["Einwohnerinnen und Einwohner (31.12.2024)", "38.600"],
          ["davon mit ausländischer Staatsangehörigkeit (Melderegister, 31.12.2025)", "4.420 (11,5 %)"],
          ["Menschen mit Einwanderungsgeschichte (Schätzung)", "rund 24 %"],
          ["Schutzsuchende aus der Ukraine", "690"],
          ["Geflüchtete in städtischer Unterbringung", "312 (174 in vier Gemeinschaftsunterkünften, 138 in 49 Wohnungen)"],
          ["Kinder in Kitas mit überwiegend nichtdeutscher Familiensprache", "27 %"],
          ["Schülerinnen und Schüler in Sprachlernklassen", "64 in drei Klassen"],
          ["Arbeitslosenquote ausländischer Staatsangehöriger (gesamt)", "13,8 % (5,9 %)"],
          ["Einbürgerungen 2025 (Wohnort Rabensfurt)", "118"],
        ],
        widths: [6, 4],
      },
      {
        t: "table",
        header: ["Häufigste Staatsangehörigkeiten (31.12.2025)", "Personen"],
        rows: [
          ["Ukraine", "690"],
          ["Syrien", "610"],
          ["Türkei", "480"],
          ["Polen", "390"],
          ["Rumänien", "340"],
          ["Afghanistan", "260"],
          ["Irak", "190"],
          ["Bulgarien", "150"],
          ["übrige Staaten (über 70)", "1.310"],
          ["Summe", "4.420"],
        ],
        widths: [5, 2],
      },
      {
        t: "p",
        text: "**Zuständigkeiten:** Ausländerbehörde, Einbürgerung und Leistungen nach dem Asylbewerberleistungsgesetz liegen beim Landkreis Altmoorland, die Arbeitsvermittlung beim Jobcenter Altmoorland. Die Stadt ist nach dem Landesaufnahmegesetz für die Unterbringung der ihr zugewiesenen Geflüchteten zuständig, außerdem als Träger von Kitas und Schulen, für Kultur, Sport und Quartiersarbeit. Die Integrationsbeauftragte koordiniert die Arbeit innerhalb der Verwaltung und ist Geschäftsstelle des Integrationsbeirats.",
      },
      { t: "h1", text: "3. Beteiligungsprozess" },
      {
        t: "ul",
        items: [
          "Drei Werkstätten in Rabensfurt-Ost (14.10.2025), in der Altstadt (18.11.2025) und in Furtwiesen (27.01.2026) mit zusammen 214 Teilnehmenden",
          "Online-Umfrage in sechs Sprachen (Deutsch, Ukrainisch, Arabisch, Türkisch, Dari, Englisch) mit 512 Antworten",
          "Fokusgruppen mit Jugendlichen, geflüchteten Frauen, Ehrenamtlichen und Arbeitgebern",
          "Fachgespräche mit Kreisvolkshochschule Altmoorland, Jobcenter, Schulen, Kitas, Sportvereinen, Kirchengemeinden und dem Moscheeverein Rabensfurt e. V.",
        ],
      },
      { t: "p", text: "Die wichtigsten Rückmeldungen:" },
      {
        t: "ul",
        items: [
          "Sprachkurse scheitern oft an fehlender Kinderbetreuung – vor allem für Mütter mit kleinen Kindern.",
          "Wartezeiten auf Termine bei Behörden werden als größtes Alltagsproblem genannt; Bescheide sind schwer verständlich.",
          "Bezahlbare Wohnungen fehlen; Familien bleiben zu lange in Gemeinschaftsunterkünften.",
          "Ausländische Berufsabschlüsse werden zu langsam anerkannt; viele arbeiten unter ihrer Qualifikation.",
          "38 % der Befragten mit Einwanderungsgeschichte haben in Rabensfurt schon Diskriminierung erlebt, am häufigsten bei der Wohnungssuche.",
          "Sportvereine, Stadtbibliothek und Musikschule werden als wichtige Orte der Begegnung gelobt.",
        ],
      },
      { t: "h1", text: "4. Leitsätze" },
      {
        t: "ol",
        items: [
          "Integration ist eine Aufgabe der ganzen Stadtgesellschaft – nicht nur der Zugewanderten.",
          "Sprache ist der Schlüssel, aber nicht die Eintrittskarte: Teilhabe beginnt am ersten Tag.",
          "Die Stadtverwaltung ist für alle da und spricht so, dass man sie versteht.",
          "Wir fördern Begegnung im Quartier, in Vereinen und in der Kultur.",
          "Wir treten Diskriminierung entschieden entgegen.",
        ],
      },
      { t: "h1", text: "5. Handlungsfelder, Ziele und Maßnahmen" },
      { t: "h2", text: "Handlungsfeld 1: Sprache und Bildung" },
      { t: "p", text: "**Ziel:** Kinder starten mit ausreichenden Deutschkenntnissen in die Schule; Erwachsene finden ein Sprachkursangebot, das zu ihrem Alltag passt." },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Zuständig", "Zeitraum", "Kosten im Jahr"],
        rows: [
          ["S1", "Alltagsintegrierte Sprachbildung in allen städtischen Kitas, Fortbildung der Fachkräfte", "Team Kitas und Schulen", "ab 2026", "24.000 €"],
          ["S2", "Elterncafés an drei Grundschulen mit Sprachmittlung", "Team Soziales und Integration, Schulen", "ab 09/2026", "18.000 €"],
          ["S3", "Sprachkurse mit Kinderbetreuung gemeinsam mit der Kreisvolkshochschule Altmoorland", "KVHS, Team Soziales und Integration", "ab 2027", "32.000 €"],
          ["S4", "Lernpatenschaften für Schulkinder", "Freiwilligenagentur", "laufend", "6.000 €"],
        ],
        widths: [1, 6, 3, 2, 2],
      },
      { t: "h2", text: "Handlungsfeld 2: Arbeit und Ausbildung" },
      { t: "p", text: "**Ziel:** Zugewanderte finden schneller eine Arbeit, die ihrer Qualifikation entspricht; die Stadt geht als Arbeitgeberin mit gutem Beispiel voran." },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Zuständig", "Zeitraum", "Kosten im Jahr"],
        rows: [
          ["A1", "Monatliche Sprechstunde der Anerkennungsberatung im Stadthaus", "Team Soziales und Integration", "ab 2026", "–"],
          ["A2", "Fünf Praktikums- und Einstiegsplätze jährlich in der Stadtverwaltung", "Team Personal", "ab 2027", "40.000 €"],
          ["A3", "Arbeitgeberfrühstück mit dem Jobcenter Altmoorland und der Werbegemeinschaft", "Citymanagement", "zweimal jährlich", "3.000 €"],
        ],
        widths: [1, 6, 3, 2, 2],
      },
      { t: "h2", text: "Handlungsfeld 3: Wohnen und Zusammenleben im Quartier" },
      { t: "p", text: "**Ziel:** Geflüchtete leben möglichst bald in eigenen Wohnungen; Nachbarschaften werden gestärkt, besonders in Rabensfurt-Ost." },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Zuständig", "Zeitraum", "Kosten im Jahr"],
        rows: [
          ["W1", "Schrittweise Schließung der Gemeinschaftsunterkunft Am Moorgraben, Anmietung von Wohnungen", "Team Soziales und Integration, Liegenschaften", "2026–2028", "im Unterbringungsbudget"],
          ["W2", "Quartiersmanagement Rabensfurt-Ost (Städtebauförderung prüfen)", "Team Stadtplanung", "ab 2027", "65.000 €"],
          ["W3", "Nachbarschaftstreff mit Hausaufgabenhilfe im Weidenkamp", "freier Träger", "laufend", "12.000 €"],
        ],
        widths: [1, 6, 3, 2, 2],
      },
      { t: "h2", text: "Handlungsfeld 4: Gesundheit und Pflege" },
      { t: "p", text: "**Ziel:** Sprachbarrieren dürfen keine gesundheitlichen Nachteile verursachen." },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Zuständig", "Zeitraum", "Kosten im Jahr"],
        rows: [
          ["G1", "Sprachmittlerpool mit Telefon- und Videodolmetschen in 18 Sprachen für Verwaltung, Kitas und Schulen", "Integrationsbeauftragte", "ab 2026", "28.000 €"],
          ["G2", "Ehrenamtliche Gesundheitslotsinnen und -lotsen in Zusammenarbeit mit dem Gesundheitsamt des Landkreises", "Landkreis, Team Soziales und Integration", "ab 2027", "8.000 €"],
        ],
        widths: [1, 6, 3, 2, 2],
      },
      { t: "h2", text: "Handlungsfeld 5: Teilhabe, Ehrenamt, Sport und Kultur" },
      { t: "p", text: "**Ziel:** Mehr Zugewanderte nehmen an Vereinsleben, Kultur und Ehrenamt teil – auch in verantwortlichen Rollen." },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Zuständig", "Zeitraum", "Kosten im Jahr"],
        rows: [
          ["T1", "Kostenfreie Schnuppermitgliedschaft in Sportvereinen für ein Jahr", "Sportvereine, Team Soziales und Integration", "ab 2026", "15.000 €"],
          ["T2", "Mehrsprachige Medien und Vorlesestunden in der Stadtbibliothek", "Team Kultur", "laufend", "7.000 €"],
          ["T3", "50 % Ermäßigung der Musikschulgebühren mit dem Sozialpass (bestehende Regelung bekannter machen)", "Team Kultur", "besteht", "–"],
          ["T4", "Pauschale für Willkommensinitiativen und migrantische Vereine", "Team Soziales und Integration", "ab 2026", "10.000 €"],
        ],
        widths: [1, 6, 3, 2, 2],
      },
      { t: "h2", text: "Handlungsfeld 6: Interkulturelle Öffnung der Verwaltung" },
      { t: "p", text: "**Ziel:** Die Verwaltung ist verständlich, gut erreichbar und spiegelt die Vielfalt der Stadt in ihrem Personal." },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Zuständig", "Zeitraum", "Kosten im Jahr"],
        rows: [
          ["V1", "Fortbildung interkulturelle Kompetenz für alle Beschäftigten mit Publikumsverkehr", "Team Personal", "2026–2027", "14.000 €"],
          ["V2", "Die 20 wichtigsten Bescheide und Formulare in Leichter Sprache und mehrsprachig", "alle Fachbereiche, Stabsstelle", "2026–2028", "20.000 €"],
          ["V3", "Videodolmetschen am Schalter des Bürgerbüros (nach der Umstellung auf den Zweckverband)", "Team Bürgerbüro", "ab 2027", "in G1 enthalten"],
          ["V4", "Anteil der Beschäftigten mit Einwanderungsgeschichte von 7 % auf 12 % erhöhen; Mehrsprachigkeit in Stellenausschreibungen als Pluspunkt", "Team Personal", "laufend", "–"],
        ],
        widths: [1, 6, 3, 2, 2],
      },
      { t: "h2", text: "Handlungsfeld 7: Zusammenhalt und Schutz vor Diskriminierung" },
      { t: "p", text: "**Ziel:** Betroffene von Diskriminierung wissen, wohin sie sich wenden können, und erhalten Unterstützung." },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Zuständig", "Zeitraum", "Kosten im Jahr"],
        rows: [
          ["D1", "Ansprechstelle gegen Diskriminierung bei der Integrationsbeauftragten mit festem Beschwerdeweg", "Integrationsbeauftragte", "ab 2026", "5.000 €"],
          ["D2", "Interkulturelle Woche und Fest der Kulturen auf dem Markt", "Stabsstelle Kommunikation, Integrationsbeirat", "jährlich", "9.000 €"],
        ],
        widths: [1, 6, 3, 2, 2],
      },
      { t: "h1", text: "6. Steuerung und Monitoring" },
      {
        t: "p",
        text: "Eine Lenkungsgruppe unter Leitung der Fachbereichsleiterin 4 steuert die Umsetzung; ihr gehören die Integrationsbeauftragte sowie die Teams Personal, Kitas und Schulen, Kultur und Stadtplanung an. Der **Integrationsbeirat** begleitet die Umsetzung und wird zweimal im Jahr unterrichtet. Er wird am **13.09.2026** neu gewählt. Einmal im Jahr legt die Verwaltung dem Ausschuss für Bildung, Soziales und Kultur einen Integrationsbericht mit folgenden Kennzahlen vor:",
      },
      {
        t: "table",
        header: ["Indikator", "Ausgangswert", "Ziel 2030"],
        rows: [
          ["Kinder mit Sprachförderbedarf bei der Schuleingangsuntersuchung", "31 % (2025)", "22 %"],
          ["Teilnehmende an Sprachkursen mit Kinderbetreuung", "0", "120 im Jahr"],
          ["Geflüchtete in Gemeinschaftsunterkünften", "174", "unter 60"],
          ["Beschäftigte der Stadt mit Einwanderungsgeschichte", "7 %", "12 %"],
          ["Bescheide und Formulare in Leichter Sprache oder mehrsprachig (Top 20)", "3", "20"],
          ["Wahlbeteiligung Integrationsbeirat", "9,4 % (2021)", "15 %"],
        ],
        widths: [6, 2, 2],
      },
      { t: "h1", text: "7. Finanzierung" },
      {
        t: "p",
        text: "Bei voller Umsetzung ab 2027 kosten die Maßnahmen rund **316.000 € im Jahr**. Davon sind 145.000 € über die Integrationspauschale des Landes und 98.000 € über bestehende Budgets der Fachbereiche gedeckt. Für das Quartiersmanagement (W2) erwarten wir Mittel der Städtebauförderung von rund 43.000 €. Es verbleibt ein zusätzlicher Bedarf von rund 30.000 € im Jahr.",
      },
      {
        t: "note",
        text: "Die Stadt befindet sich in der Haushaltssicherung; seit dem 25.05.2026 gilt zudem eine haushaltswirtschaftliche Sperre. Maßnahmen mit zusätzlichem Mittelbedarf beginnen deshalb frühestens 2027 und nur, wenn sie im Haushalt 2027 gegenfinanziert sind. 2026 werden nur Maßnahmen ohne zusätzliche Mittel umgesetzt (A1, T3, V4, D1).",
      },
      { t: "h1", text: "8. Weiteres Verfahren" },
      {
        t: "table",
        header: ["Schritt", "Termin"],
        rows: [
          ["Beratung im Integrationsbeirat", "30.06.2026"],
          ["Ausschuss für Bildung, Soziales und Kultur", "08.09.2026"],
          ["Beschluss im Stadtrat", "24.09.2026"],
          ["Erster Integrationsbericht", "Herbst 2027"],
        ],
        widths: [5, 2],
      },
      { t: "signature", lines: ["Irina Schmidt", "Integrationsbeauftragte"] },
    ],
  },
  {
    type: "excel",
    id: "rf-kita-belegung-elternbeitraege-2025-26",
    title: "Kita-Belegung und Elternbeiträge Kindergartenjahr 2025/26",
    kind: "Auswertung",
    fileName: "Kita-Belegung und Elternbeitraege Kindergartenjahr 2025-26 Stand 2025-08-01",
    org: "rabensfurt",
    unit: "rf-kita",
    author: "rf-boehm",
    date: "2025-08-28",
    tags: ["zahlen"],
    keywords: ["Kita Furtwiesen", "Kinderhaus Moorlerche", "Vormerkungen", "Beitragstabelle", "§ 90 Abs. 3"],
    summary:
      "Belegung aller 16 Kitas der Stadt zum Beginn des Kindergartenjahrs (Plätze, belegte Plätze, Auslastung, Vormerkungen), die Beitragstabelle für Krippenkinder und eine Hochrechnung der Elternbeiträge in den städtischen Kitas mit Bezügen zwischen den Blättern. Gut zum Nachrechnen, Vergleichen von Trägern und für eine Folie zum Platzbedarf.",
    sheets: [
      {
        name: "Belegung",
        title: "Belegung der Kindertagesstätten zum 01.08.2025",
        subtitle: "Plätze laut Betriebserlaubnis (identisch mit der Meldung an das Kreisjugendamt) · Vormerkungen nicht bereinigt",
        columns: [
          { header: "Einrichtung", width: 28 },
          { header: "Träger", width: 34 },
          { header: "Stadtteil", width: 15 },
          { header: "Plätze U3", width: 9, fmt: "int" },
          { header: "belegt U3", width: 9, fmt: "int" },
          { header: "Plätze Ü3", width: 9, fmt: "int" },
          { header: "belegt Ü3", width: 9, fmt: "int" },
          { header: "Plätze gesamt", width: 10, fmt: "int" },
          { header: "belegt gesamt", width: 10, fmt: "int" },
          { header: "Auslastung", width: 10, fmt: "pct" },
          { header: "Vormerkungen", width: 11, fmt: "int" },
        ],
        rows: [
          ["Kita Furtwiesen", "Stadt Rabensfurt", "Furtwiesen", 30, 30, 100, 99, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 21],
          ["Kita Rabennest", "Stadt Rabensfurt", "Altstadt", 15, 15, 50, 50, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 9],
          ["Kita Mühlenkamp", "Stadt Rabensfurt", "Mühlenkamp", 30, 30, 75, 73, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 8],
          ["Kita Sonnenweg", "Stadt Rabensfurt", "Rabensfurt-Süd", 30, 29, 100, 97, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 12],
          ["Kita Am Stadtpark", "Stadt Rabensfurt", "Rabensfurt-Ost", 15, 15, 75, 74, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 7],
          ["Kita Weidenkamp", "Stadt Rabensfurt", "Rabensfurt-Ost", 20, 20, 60, 58, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 10],
          ["Kita Kastanienhof", "Stadt Rabensfurt", "Mühlenkamp", 15, 14, 75, 71, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 3],
          ["Ev. Kita Arche", "Ev.-luth. Kirchengemeinde Rabensfurt", "Altstadt", 15, 15, 75, 75, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 11],
          ["Kath. Kita St. Josef", "Kath. Kirchengemeinde St. Josef", "Furtwiesen", 15, 15, 75, 74, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 6],
          ["Kinderhaus Regenbogen", "Kinderhaus Regenbogen e. V.", "Rabensfurt-Ost", 20, 20, 60, 60, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 9],
          ["Waldkindergarten Furtbachaue", "Waldkindergarten Rabensfurt e. V.", "Rabensfurt-Süd", 0, 0, 30, 30, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 14],
          ["Kita Moorlerche", "Kinderhaus Moorlerche e. V.", "Rabensfurt-Süd", 30, 30, 75, 75, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 17],
          ["Krippe Kleine Raben", "Elterninitiative Kleine Raben e. V.", "Altstadt", 22, 22, 0, 0, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 5],
          ["Ev. Kita Am Kirchplatz", "Ev.-luth. Kirchengemeinde Rabensfurt", "Mühlenkamp", 15, 15, 50, 49, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 4],
          ["Kita Sonnenkinder", "Sozialwerk Altmoorland gGmbH", "Rabensfurt-Ost", 30, 29, 125, 121, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 13],
          ["Kita Löwenzahn", "Kinder- und Jugendhilfe Altmoor gGmbH", "Furtwiesen", 50, 49, 117, 112, { f: "D{r}+F{r}" }, { f: "E{r}+G{r}" }, { f: "I{r}/H{r}" }, 16],
          {
            total: true,
            cells: [
              "Summe",
              "",
              "",
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "SUM(G{first}:G{last})" },
              { f: "SUM(H{first}:H{last})" },
              { f: "SUM(I{first}:I{last})" },
              { f: "I{r}/H{r}" },
              { f: "SUM(K{first}:K{last})" },
            ],
          },
        ],
        notes: [
          "Vormerkungen: Viele Eltern melden ihr Kind bei mehreren Einrichtungen an. Nach Abgleich der Namen fehlen rund 95 Kindern ein Platz, davon 71 unter drei Jahren.",
          "Kita Furtwiesen: Erweiterung um zwei Krippengruppen (24 Plätze) ab 08/2026, Bauantrag beim Landkreis gestellt.",
          "Kinderhaus Moorlerche e. V. plant einen Neubau in Rabensfurt-Süd mit fünf Gruppen (30 Plätze U3, 50 Plätze Ü3) zum 08/2027.",
          "Zusätzlich 64 Plätze in der Kindertagespflege (Vermittlung durch das Kreisjugendamt).",
        ],
      },
      {
        name: "Beitragstabelle",
        title: "Elternbeiträge für Kinder unter drei Jahren in städtischen Kitas",
        subtitle: "Monatsbeiträge nach der Elternbeitragssatzung, gültig ab 01.08.2025",
        columns: [
          { header: "Stufe", width: 7, fmt: "int" },
          { header: "Jahreseinkommen der Familie", width: 28 },
          { header: "bis 6 Stunden", width: 13, fmt: "eur0" },
          { header: "bis 8 Stunden", width: 13, fmt: "eur0" },
          { header: "bis 10 Stunden", width: 13, fmt: "eur0" },
        ],
        rows: [
          [1, "bis 25.000 €", 0, 0, 0],
          [2, "25.001 bis 35.000 €", 95, 125, 155],
          [3, "35.001 bis 45.000 €", 150, 195, 240],
          [4, "45.001 bis 55.000 €", 205, 265, 325],
          [5, "55.001 bis 70.000 €", 260, 335, 410],
          [6, "über 70.000 €", 315, 405, 495],
        ],
        notes: [
          "Kinder ab drei Jahren: beitragsfrei bis acht Stunden täglich (KiTaG); für eine Betreuung über acht Stunden 45 € im Monat.",
          "Geschwisterermäßigung: 50 % für das zweite Kind in Betreuung, ab dem dritten Kind beitragsfrei.",
          "Bei geringem Einkommen übernimmt das Kreisjugendamt den Beitrag auf Antrag (§ 90 Abs. 3 und 4 SGB VIII).",
        ],
      },
      {
        name: "Einnahmen U3",
        title: "Hochrechnung Elternbeiträge U3 in städtischen Kitas 2025/26",
        subtitle: "Belegte Krippenplätze nach Beitragsstufe und Betreuungsumfang · Beiträge aus Blatt „Beitragstabelle“",
        columns: [
          { header: "Stufe", width: 7, fmt: "int" },
          { header: "Kinder bis 6 Std.", width: 12, fmt: "int" },
          { header: "Kinder bis 8 Std.", width: 12, fmt: "int" },
          { header: "Kinder bis 10 Std.", width: 12, fmt: "int" },
          { header: "Kinder gesamt", width: 11, fmt: "int" },
          { header: "Beiträge im Jahr", width: 15, fmt: "eur0" },
        ],
        rows: [
          [1, 8, 12, 4, { f: "SUM(B{r}:D{r})" }, { f: "(B{r}*Beitragstabelle!C{r}+C{r}*Beitragstabelle!D{r}+D{r}*Beitragstabelle!E{r})*12" }],
          [2, 6, 11, 3, { f: "SUM(B{r}:D{r})" }, { f: "(B{r}*Beitragstabelle!C{r}+C{r}*Beitragstabelle!D{r}+D{r}*Beitragstabelle!E{r})*12" }],
          [3, 7, 17, 5, { f: "SUM(B{r}:D{r})" }, { f: "(B{r}*Beitragstabelle!C{r}+C{r}*Beitragstabelle!D{r}+D{r}*Beitragstabelle!E{r})*12" }],
          [4, 4, 19, 9, { f: "SUM(B{r}:D{r})" }, { f: "(B{r}*Beitragstabelle!C{r}+C{r}*Beitragstabelle!D{r}+D{r}*Beitragstabelle!E{r})*12" }],
          [5, 3, 15, 10, { f: "SUM(B{r}:D{r})" }, { f: "(B{r}*Beitragstabelle!C{r}+C{r}*Beitragstabelle!D{r}+D{r}*Beitragstabelle!E{r})*12" }],
          [6, 2, 9, 9, { f: "SUM(B{r}:D{r})" }, { f: "(B{r}*Beitragstabelle!C{r}+C{r}*Beitragstabelle!D{r}+D{r}*Beitragstabelle!E{r})*12" }],
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "SUM(F{first}:F{last})" }],
          },
        ],
        notes: [
          "Die Summe der Kinder entspricht den belegten U3-Plätzen der sieben städtischen Kitas (Blatt „Belegung“).",
          "Ansatz Haushalt 2025: 410.000 €. Geschwisterermäßigung und Beitragsübernahmen durch das Kreisjugendamt sind in der Hochrechnung nicht abgezogen (2024: rund 38.000 €).",
        ],
      },
    ],
  },
  // ───────────────────────────────────────────── Stabsstelle: Bürgerhaushalt
  {
    type: "excel",
    id: "rf-buergerhaushalt-2026-abstimmungsergebnis",
    title: "Bürgerhaushalt 2026 – Vorschläge und Abstimmungsergebnis",
    kind: "Auswertung",
    fileName: "Buergerhaushalt 2026 Abstimmungsergebnis Stand 2025-04-11",
    org: "rabensfurt",
    unit: "rf-kommunikation",
    author: "rf-baumann",
    date: "2025-04-11",
    tags: ["zahlen"],
    keywords: ["V-017", "Trinkwasserbrunnen", "Beteiligungsquote", "Restmittel", "Bürgerhaushalt 2026"],
    summary:
      "Ergebnis der Abstimmung zum Bürgerhaushalt: 24 zugelassene Vorschläge mit Kosten und Stimmen, kumulierte Kosten und automatische Prüfung gegen das Budget von 100.000 €, dazu die Beteiligung nach Stadtteilen. Gut zum Prüfen der Regel, zum Sortieren und für eine Pressemitteilung.",
    sheets: [
      {
        name: "Abstimmung",
        title: "Bürgerhaushalt 2026 – Ergebnis der Abstimmung",
        subtitle: "Abstimmung 17.03.–06.04.2025 · 2.318 Teilnehmende, je bis zu fünf Stimmen · Budget 100.000 €",
        columns: [
          { header: "Rang", width: 6, fmt: "int" },
          { header: "Nr.", width: 7 },
          { header: "Vorschlag", width: 52 },
          { header: "Stadtteil", width: 15 },
          { header: "Kategorie", width: 13 },
          { header: "Kosten (Schätzung)", width: 13, fmt: "eur0" },
          { header: "Stimmen", width: 9, fmt: "int" },
          { header: "Kosten kumuliert", width: 13, fmt: "eur0" },
          { header: "im Budget", width: 9 },
        ],
        rows: [
          [1, "V-017", "Trinkwasserbrunnen am Markt und im Stadtpark", "Altstadt, Ost", "Umwelt", 18000, 1104, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [2, "V-042", "Zwölf Sitzbänke am Wanderweg entlang des Furtbachs", "Furtwiesen", "Freizeit", 14500, 986, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [3, "V-008", "Beleuchtung des Fußwegs Bahnhof – Mühlenkamp", "Mühlenkamp", "Verkehr", 26000, 871, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [4, "V-031", "Bücherschrank und Lesebänke am Markt", "Altstadt", "Kultur", 4500, 702, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [5, "V-063", "Bolzplatz Rabensfurt-Süd: neue Tore und Ballfangzaun", "Rabensfurt-Süd", "Sport", 19500, 655, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [6, "V-055", "Fahrradreparaturstation am Bahnhof", "Altstadt", "Verkehr", 6800, 610, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [7, "V-012", "20 Spender für Hundekotbeutel", "gesamte Stadt", "Sauberkeit", 7200, 544, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [8, "V-071", "Wasserspielplatz im Stadtpark", "Rabensfurt-Ost", "Spielen", 48000, 531, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [9, "V-024", "Insektenwiesen auf städtischen Grünflächen", "gesamte Stadt", "Umwelt", 9000, 488, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [10, "V-039", "Überdachter Treffpunkt für Jugendliche am Skatepark", "Furtwiesen", "Jugend", 22000, 463, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [11, "V-003", "Barrierefreier Zugang zur Friedhofskapelle", "Mühlenkamp", "Soziales", 31000, 402, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [12, "V-047", "Calisthenics-Anlage im Stadtpark", "Rabensfurt-Ost", "Sport", 28000, 377, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [13, "V-019", "Öffentliche Toilette am Markt", "Altstadt", "Infrastruktur", 65000, 351, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [14, "V-066", "Streuobstbäume an der Furtwiese", "Furtwiesen", "Umwelt", 5800, 322, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [15, "V-029", "Digitaler Infobildschirm statt Schaukasten am Rathaus", "Altstadt", "Information", 12000, 290, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [16, "V-051", "Zwei Geschwindigkeitsanzeigen in Wohnstraßen", "Rabensfurt-Süd", "Verkehr", 8400, 276, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [17, "V-014", "Nistkästen für Mauersegler an Schulen", "gesamte Stadt", "Umwelt", 3200, 241, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [18, "V-058", "Boule-Bahn am Seniorenzentrum", "Mühlenkamp", "Freizeit", 7500, 218, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [19, "V-035", "Mehr Mülleimer am Furtbach", "Furtwiesen", "Sauberkeit", 4800, 205, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [20, "V-022", "Kostenloses WLAN am Markt", "Altstadt", "Digitales", 15000, 187, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [21, "V-044", "Hochbeete für fünf Kitas", "gesamte Stadt", "Bildung", 6000, 163, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [22, "V-069", "Sonnensegel für den Spielplatz Weidenkamp", "Rabensfurt-Ost", "Spielen", 11000, 149, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [23, "V-010", "Defibrillator am Sportplatz Süd", "Rabensfurt-Süd", "Gesundheit", 3900, 138, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          [24, "V-060", "Kunstprojekt in der Unterführung Bahnhofstraße", "Altstadt", "Kultur", 9500, 97, { f: "SUM(F$5:F{r})" }, { f: 'IF(H{r}<=100000,"ja","nein")' }],
          { total: true, cells: ["", "", "Summe", "", "", { f: "SUM(F{first}:F{last})" }, { f: "SUM(G{first}:G{last})" }, "", ""] },
        ],
        notes: [
          "Regel nach § 6 der Richtlinie Bürgerhaushalt: Umsetzung in der Reihenfolge der Stimmen, bis der nächste Vorschlag das Budget überschreiten würde. Vorschläge werden nicht übersprungen.",
          "Restmittel von 3.500 € werden auf den Bürgerhaushalt 2027 übertragen.",
          "Eingegangen waren 147 Vorschläge; 38 wurden nach Prüfung der Fachbereiche zugelassen, 24 erhielten mehr als 90 Stimmen und sind hier aufgeführt.",
          "V-019 (öffentliche Toilette) wird außerhalb des Bürgerhaushalts im Rahmen des Innenstadtkonzepts geprüft.",
        ],
      },
      {
        name: "Beteiligung",
        title: "Beteiligung nach Stadtteilen",
        subtitle: "Angaben der Teilnehmenden zum Wohnort",
        columns: [
          { header: "Stadtteil", width: 18 },
          { header: "online", width: 9, fmt: "int" },
          { header: "Papier", width: 9, fmt: "int" },
          { header: "gesamt", width: 9, fmt: "int" },
          { header: "Einwohner", width: 11, fmt: "int" },
          { header: "Beteiligungsquote", width: 13, fmt: "pct" },
        ],
        rows: [
          ["Altstadt", 412, 96, { f: "B{r}+C{r}" }, 5600, { f: "D{r}/E{r}" }],
          ["Furtwiesen", 498, 88, { f: "B{r}+C{r}" }, 9300, { f: "D{r}/E{r}" }],
          ["Mühlenkamp", 361, 71, { f: "B{r}+C{r}" }, 7700, { f: "D{r}/E{r}" }],
          ["Rabensfurt-Ost", 318, 84, { f: "B{r}+C{r}" }, 8700, { f: "D{r}/E{r}" }],
          ["Rabensfurt-Süd", 251, 53, { f: "B{r}+C{r}" }, 7300, { f: "D{r}/E{r}" }],
          ["ohne Angabe", 66, 20, { f: "B{r}+C{r}" }, null, null],
          { total: true, cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "D{r}/E{r}" }] },
        ],
        notes: ["Papierstimmzettel lagen im Bürgerbüro, in der Stadtbibliothek und im Seniorenzentrum aus."],
      },
    ],
  },
  // ───────────────────────────────────────────── FB 4 – Kultur: Musikschule und Stadtbibliothek
  {
    type: "word",
    id: "rf-aenderungssatzung-musikschulgebuehren-entwurf",
    title: "Entwurf: Erste Satzung zur Änderung der Gebührensatzung der Musikschule",
    kind: "Satzungsentwurf",
    fileName: "Anlage 1 zu BV-2026-052 Entwurf Aenderungssatzung Musikschulgebuehren",
    org: "rabensfurt",
    unit: "rf-kultur",
    author: "rf-tamm",
    date: "2026-04-20",
    tags: ["widersprueche"],
    keywords: ["Gebührensatzung", "Musikalische Früherziehung", "Sozialpass", "41,2 %", "BV/2026/052"],
    summary:
      "Kurzer Satzungsentwurf mit neuer Gebührentabelle und Ermäßigungen für die Musikschule, dazu ein Auszug aus der Begründung. Eingebaute Widersprüche: Die Begründung nennt für 45 Minuten Einzelunterricht 105 € statt 107 €, eine unveränderte Geschwisterermäßigung von 25 % statt 20 % und das Inkrafttreten zum 01.09. statt 01.08.2026.",
    meta: [
      ["Vorlage-Nr.", "BV/2026/052, Anlage 1"],
      ["Aktenzeichen", "4.2-341.22"],
    ],
    subject: "Erste Satzung zur Änderung der Gebührensatzung für die Musikschule der Stadt Rabensfurt",
    blocks: [
      {
        t: "p",
        text: "Aufgrund der Kommunalverfassung (KV) und der §§ 1, 2 und 5 des Kommunalabgabengesetzes (KAG) hat der Stadtrat der Stadt Rabensfurt in seiner Sitzung am 25.06.2026 folgende Satzung beschlossen:",
      },
      { t: "h2", text: "Artikel 1" },
      { t: "p", text: "Die Gebührensatzung für die Musikschule der Stadt Rabensfurt vom 14.06.2018 wird wie folgt geändert:" },
      { t: "p", text: "1. § 3 Abs. 1 erhält folgende Fassung: „Die monatlichen Gebühren betragen:“" },
      {
        t: "table",
        header: ["Unterrichtsform", "bisher", "neu"],
        rows: [
          ["Einzelunterricht 30 Minuten", "68 €", "74 €"],
          ["Einzelunterricht 45 Minuten", "98 €", "107 €"],
          ["Einzelunterricht 60 Minuten", "128 €", "140 €"],
          ["Partnerunterricht (2 Personen, 45 Minuten), je Person", "58 €", "63 €"],
          ["Gruppenunterricht (3 bis 5 Personen, 45 Minuten), je Person", "39 €", "42 €"],
          ["Musikalische Früherziehung (60 Minuten)", "32 €", "35 €"],
        ],
        widths: [6, 2, 2],
      },
      {
        t: "p",
        text: "2. § 5 Abs. 1 erhält folgende Fassung: „Für das zweite Kind einer Familie ermäßigt sich die Gebühr um 20 %, ab dem dritten Kind um 30 %. Inhaberinnen und Inhaber des Sozialpasses der Stadt Rabensfurt erhalten eine Ermäßigung von 50 %.“",
      },
      { t: "h2", text: "Artikel 2" },
      { t: "p", text: "Diese Satzung tritt am 01.08.2026 in Kraft." },
      { t: "signature", lines: ["Corinna Engelke", "Bürgermeisterin"] },
      { t: "h2", text: "Begründung (Auszug)" },
      {
        t: "p",
        text: "Die Gebühren wurden zuletzt 2018 angepasst. Seitdem sind vor allem die Personalkosten gestiegen; der Kostendeckungsgrad ist 2025 auf 41,2 % gesunken. Die Gebühren steigen im Durchschnitt um rund 9 %, der Einzelunterricht von 45 Minuten zum Beispiel um 7 € auf 105 €. Die Geschwisterermäßigung bleibt unverändert bei 25 %. Die Mehrerträge betragen rund 58.000 € im Jahr. Die Änderung soll zum Beginn des Schuljahres am 01.09.2026 in Kraft treten.",
      },
    ],
  },
  {
    type: "powerpoint",
    id: "rf-jahresbericht-stadtbibliothek-musikschule-2025",
    title: "Jahresbericht 2025: Stadtbibliothek und Musikschule",
    kind: "Präsentation",
    fileName: "Jahresbericht 2025 Stadtbibliothek und Musikschule Ausschuss 2026-03-10",
    org: "rabensfurt",
    unit: "rf-kultur",
    author: "rf-weiss",
    date: "2026-03-06",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Dachsanierung", "159.300", "Warteliste", "Sommerleseclub", "Verbund Altmoorland digital"],
    summary:
      "Jahresbericht für den Kulturausschuss mit Ausleihzahlen, Medienarten, Schülerzahlen der Musikschule, Erfolgen, Problemen und Ausblick. Eingebaute Widersprüche: Die Übersichtsfolie meldet steigende Ausleihen (+ 6 %), das Diagramm zeigt einen Rückgang; sie nennt 612 Musikschülerinnen und -schüler, die Tabelle ergibt 587.",
    slides: [
      { t: "title", title: "Stadtbibliothek und Musikschule", subtitle: "Jahresbericht 2025 · Ausschuss für Bildung, Soziales und Kultur am 10. März 2026" },
      {
        t: "bullets",
        title: "2025 auf einen Blick",
        bullets: [
          "Stadtbibliothek: 159.300 Ausleihen – **erneut gestiegen (+ 6 %)**",
          "71.800 Besuche, 312 Veranstaltungen mit 7.840 Teilnehmenden",
          "Musikschule: **612 Schülerinnen und Schüler** (+ 4 %), Warteliste 143",
          "Kostendeckungsgrad der Musikschule: 41,2 %",
        ],
        notes: "Die Bibliothek war im Juni und Juli vier Wochen wegen der Dachsanierung der Alten Post geschlossen.",
      },
      {
        t: "chart",
        title: "Ausleihen der Stadtbibliothek",
        chart: {
          type: "line",
          categories: ["2021", "2022", "2023", "2024", "2025"],
          series: [{ name: "Ausleihen", values: [131200, 149800, 162100, 168400, 159300] }],
          unit: "Ausleihen",
        },
      },
      {
        t: "chart",
        title: "Ausleihen nach Medienart 2025",
        chart: {
          type: "bar",
          categories: ["Kinder- und Jugendbücher", "Romane", "Sachbücher", "Zeitschriften", "Spiele", "E-Medien"],
          series: [{ name: "Ausleihen", values: [52100, 31800, 18400, 9700, 11900, 35400] }],
          unit: "Ausleihen",
        },
        caption: "E-Medien über den Verbund Altmoorland digital",
      },
      {
        t: "table",
        title: "Musikschule: Schülerinnen und Schüler nach Fachbereich",
        header: ["Fachbereich", "2024", "2025"],
        rows: [
          ["Elementare Musikpädagogik", "72", "68"],
          ["Tasteninstrumente", "161", "168"],
          ["Streichinstrumente", "92", "96"],
          ["Blasinstrumente", "88", "84"],
          ["Gitarre und Zupfinstrumente", "98", "102"],
          ["Schlagwerk", "38", "41"],
          ["Gesang", "25", "28"],
          ["Summe", "574", "587"],
        ],
      },
      {
        t: "twocol",
        title: "Was gut lief – was schwierig war",
        left: {
          heading: "Gut gelaufen",
          bullets: ["Sommerleseclub mit 286 Kindern", "Drei Bläserklassen an Grundschulen", "Konzert „Rabensfurt klingt“ mit 900 Gästen"],
        },
        right: {
          heading: "Schwierig",
          bullets: ["Vier Wochen Schließung der Bibliothek (Dachsanierung)", "Honorarkräfte werden angestellt – höhere Kosten", "Wartezeit für Klavier und Gitarre über zwölf Monate"],
        },
      },
      {
        t: "bullets",
        title: "Ausblick 2026",
        bullets: [
          "Gebührenanpassung der Musikschule zum Schuljahr 2026/27 (Vorlage im Juni)",
          "Open Library: Bibliothek auch ohne Personal zugänglich – Start Herbst 2026 (Investitionsprogramm I-4.2-01)",
        ],
        notes: "Open Library steht unter Haushaltsvorbehalt.",
      },
      { t: "end", title: "Vielen Dank!", lines: ["Florian Weiß · Teamleiter Kultur, Stadtbibliothek und Musikschule", "Telefon 040 66969-446"] },
    ],
  },
  // ───────────────────────────────────────────── FB 1: Führungskräfteklausur
  {
    type: "powerpoint",
    id: "rf-fuehrungskraefteklausur-verwaltung-2030",
    title: "Führungskräfteklausur „Verwaltung 2030“ – Fotoprotokoll und Ergebnisse",
    kind: "Präsentation / Fotoprotokoll",
    fileName: "Fuehrungskraefteklausur Verwaltung 2030 Ergebnisse 2025-01",
    org: "rabensfurt",
    unit: "rf-fb1",
    author: "rf-rehbein",
    date: "2025-01-24",
    tags: ["unstrukturiert"],
    keywords: ["Verwaltung 2030", "Themenspeicher", "Klebepunkte", "Tagungshaus am Moorsee", "Wissenstransfer"],
    summary:
      "Ergebnisfolien der Führungskräfteklausur: Altersstruktur der Beschäftigten, Kennzahlen, unsortierte Originalkarten und Themenspeicher, Priorisierung mit Klebepunkten, erster Entwurf von Leitsätzen und Verabredungen (u. a. Prüfauftrag zum Zweckverband). Gut zum Ordnen, Clustern und für ein Kurzprotokoll an die Beschäftigten.",
    slides: [
      { t: "title", title: "Verwaltung 2030", subtitle: "Führungskräfteklausur am 22. und 23. Januar 2025 · Tagungshaus am Moorsee · Ergebnisse und Fotoprotokoll" },
      {
        t: "bullets",
        title: "Programm",
        bullets: [
          { text: "Tag 1", sub: ["Impuls der Bürgermeisterin: Wo wollen wir 2030 stehen?", "Zahlen und Fakten (FB 1)", "Kartenabfrage: Was hindert uns heute?"] },
          { text: "Tag 2", sub: ["Themeninseln: Personal, Digitalisierung, Zusammenarbeit, Bürgerservice", "Priorisierung", "Verabredungen"] },
        ],
      },
      {
        t: "chart",
        title: "Altersstruktur der Beschäftigten (31.12.2024)",
        chart: {
          type: "bar",
          categories: ["unter 30", "30 bis 39", "40 bis 49", "50 bis 54", "55 bis 59", "60 und älter"],
          series: [{ name: "Beschäftigte", values: [52, 78, 96, 66, 71, 47] }],
          unit: "Beschäftigte",
        },
        caption: "Kernverwaltung, 410 Beschäftigte",
        notes: "118 Beschäftigte, also 29 %, erreichen bis 2035 die Altersgrenze. Das war der Moment, in dem es im Raum still wurde.",
      },
      {
        t: "bullets",
        title: "Zahlen, die uns beschäftigen",
        bullets: [
          "Krankenquote 2024: 7,9 % (2021: 6,1 %)",
          "31 Abgänge, 27 Neueinstellungen",
          "Offene Stellen bleiben im Schnitt 5,4 Monate unbesetzt; Systemadministration seit März 2024",
          "Bürgerbüro: elf Werktage Wartezeit auf einen Termin",
        ],
      },
      {
        t: "bullets",
        title: "Kartenabfrage: Was hindert uns heute? (Originalkarten, unsortiert)",
        bullets: [
          "zu viele Mitzeichnungen!!",
          "Papierakte + Excel-Liste + Mail = Chaos",
          "IT fällt aus → keiner kann arbeiten (Serverraum!)",
          "Homeoffice-Regeln in jedem Team anders",
          "Wer entscheidet eigentlich was?",
          "keine Zeit für Einarbeitung",
          "Besprechungen ohne Ergebnis",
          "Bürger rufen dreimal an, weil keiner zurückruft",
          "KI? – erst Regeln, dann ausprobieren",
          "Drucker 2. OG seit Wochen kaputt",
          "Führung = Verwaltung des Mangels",
        ],
        notes: "Karten wörtlich abgeschrieben, Mehrfachnennungen zusammengefasst. Die Karte zum Drucker hat für Gelächter gesorgt, steht aber für ein echtes Problem.",
      },
      {
        t: "bullets",
        title: "Themenspeicher (Flipchart, abgeschrieben)",
        bullets: [
          "E-Akte – wann endlich?",
          "Zweckverband IT prüfen (Hr. Hesse)",
          "Dienstvereinbarung mobiles Arbeiten neu",
          "Onboarding-Paket für Neue",
          "Ausbildung: mehr Plätze, Übernahme zusagen",
          "Wissensverlust durch Ruhestand → Tandems",
          "Gesundheitsmanagement (Rücken!)",
          "Leichte Sprache in Bescheiden",
          "Feedback für Führungskräfte",
        ],
      },
      {
        t: "table",
        title: "Priorisierung (28 Führungskräfte, je 3 Klebepunkte)",
        header: ["Thema", "Punkte"],
        rows: [
          ["IT-Sicherheit und Zukunft der IT (Zweckverband prüfen)", "19"],
          ["Personalgewinnung und Ausbildung", "17"],
          ["Wissenstransfer vor dem Ruhestand", "14"],
          ["E-Akte und digitale Abläufe", "12"],
          ["Mobiles Arbeiten", "9"],
          ["Weniger Mitzeichnungen, klare Zuständigkeiten", "8"],
          ["Bürgerservice und Terminvergabe", "5"],
        ],
      },
      {
        t: "twocol",
        title: "Leitsätze – erster Entwurf",
        left: {
          heading: "Wir …",
          bullets: ["arbeiten digital, wo es den Menschen nützt", "entscheiden auf der niedrigsten sinnvollen Ebene", "geben Wissen weiter, bevor es geht", "sprechen so, dass man uns versteht"],
        },
        right: {
          heading: "Offen und strittig",
          bullets: ["„bürgernah“ oder „bürgerfreundlich“?", "Homeoffice als Recht oder als Möglichkeit?", "Wie viel KI wollen wir?"],
        },
      },
      {
        t: "table",
        title: "Verabredungen",
        header: ["Was", "Wer", "Bis"],
        rows: [
          ["Mitzeichnungsregeln entschlacken (höchstens zwei Mitzeichnungen)", "Verwaltungsvorstand", "04/2025"],
          ["Prüfauftrag Beitritt zum Zweckverband Kommunale IT Altmoor", "FB 1, Herr Hesse", "06/2025"],
          ["Konzept Wissenstransfer mit Tandems", "Team Personal", "09/2025"],
          ["Entwurf Dienstvereinbarung mobiles Arbeiten mit dem Personalrat", "FB 1", "12/2025"],
          ["Nächste Klausur", "Bürgermeisterin", "01/2026"],
        ],
        notes: "Die Leitsätze gehen als Entwurf in die Teams; Rückmeldungen bis 31.03.2025 an Frau Rehbein.",
      },
      { t: "end", title: "Danke für zwei intensive Tage!", lines: ["Fotoprotokoll: Susanne Rehbein, Fachbereich 1"] },
    ],
  },
];

export const threads: ThreadSpec[] = [
  {
    id: "rf-migration-arbeitsplaetze-zkit",
    title: "Migration der Arbeitsplätze zum Zweckverband: Inventarliste und Termine der Wellen 1 und 2",
    subject: "Migration Arbeitsplätze Stadt Rabensfurt – Inventarliste Teil 1 (Wellen 1 und 2)",
    org: "rabensfurt",
    unit: "rf-it",
    date: "2026-05-08",
    tags: ["zahlen"],
    keywords: ["Inventarliste", "72 Geräte", "Integrationsbeirat", "Zahllauf", "040 66969-899"],
    summary:
      "Das Team IT schickt dem Zweckverband die Inventarliste für die ersten beiden Umstellungswellen im Rathaus; beide Seiten stimmen Austausch, Bestellung, Reihenfolge innerhalb der Wellen und den Parallelbetrieb des Serverraums ab. Gut zum Herausarbeiten der vereinbarten Termine, der tatsächlich zu bestellenden Geräte und offener Punkte.",
    mails: [
      {
        from: "rf-hesse",
        to: ["zk-hartung"],
        cc: ["zk-ritter", "rf-kaminski"],
        date: "2026-04-29T15:12",
        attachments: ["rf-inventarliste-migration-zkit-teil1"],
        body: `Hallo Frau Hartung,

wie in der Lenkungsgruppe am 16.04. vereinbart, schicke ich Ihnen die Inventarliste Teil 1 für die Wellen 1 und 2 (Rathaus: Bürgermeisterin, Stabsstellen, FB 1 und FB 2, zusammen 145 Arbeitsplätze). Herr Kaminski hat die Geräte in den letzten beiden Wochen vor Ort aufgenommen.

Kurz zusammengefasst:
- Welle 1 (Bürgermeisterin, Stabsstellen, FB 1): 85 Arbeitsplätze, davon 46 mit Austauschbedarf
- Welle 2 (FB 2): 60 Arbeitsplätze, davon 26 mit Austauschbedarf
- Austausch nach Ihrem Kriterium „Beschaffung 2020 oder früher“, zusammen also **72 Geräte**

Besonderheiten:
- **Schulungsraum:** 10 Kompakt-PCs von 2017. Brauchen wir die überhaupt eins zu eins?
- **Vollstreckungsaußendienst:** 3 Tablets (2022) mit eigenem Mobilfunkvertrag. Die würden wir gern aus der Migration herausnehmen.
- **Ratsbüro und Wahlamt:** Am 13.09.2026 wählen wir den Integrationsbeirat neu. Ratsbüro und Wahlamt bitte erst nach der Wahl umstellen, frühestens am 16.09.
- **Team Personal:** Bitte gleich zu Beginn der Welle 1 (07./08.09.), damit die Meldungen für die Septemberabrechnung an Sie rechtzeitig rausgehen.

Teil 2 (Wellen 3 bis 5 mit allen Außenstellen) folgt bis 15.05.

Viele Grüße
Dominik Hesse`,
      },
      {
        from: "zk-hartung",
        to: ["rf-hesse"],
        cc: ["zk-ritter", "rf-kaminski"],
        date: "2026-05-04T10:41",
        body: `Hallo Herr Hesse,

danke für die saubere Liste, damit können wir gut arbeiten. Meine Rückmeldungen:

1. **Austausch:** Wir kommen auf dieselben 72 Geräte. Den Schulungsraum statten wir aus unserem Schulungspool mit 10 Notebooks aus, dafür ist keine Neubeschaffung nötig. Bleiben 62 Geräte über den Rahmenvertrag, abgedeckt durch die Migrationspauschale. Die Lieferzeit liegt bei rund zehn Wochen – wir brauchen Ihre Freigabe der Austauschliste spätestens zum **15.05.**
2. **Tablets Vollstreckungsaußendienst:** einverstanden, die bleiben bei Ihnen. Wir dokumentieren das als Ausnahme.
3. **Reihenfolge Welle 1:** Team Personal am 07./08.09. passt, Ratsbüro und Wahlamt am 16.09. auch.
4. **Welle 2:** Laut Fahrplan nicht in der Woche des Zahllaufs. Bitte nennen Sie mir die Zahllauftermine der Stadtkasse im Oktober, dann legen wir die Kasse entsprechend.
5. **Netzanbindung:** Für die Glasfaser zum Rathaus brauchen wir noch den Termin der Stadtwerke.

Viele Grüße
Jessica Hartung`,
      },
      {
        from: "rf-hesse",
        to: ["zk-hartung"],
        cc: ["zk-ritter", "rf-kaminski", "rf-rehbein"],
        date: "2026-05-06T16:55",
        body: `Hallo Frau Hartung,

zu Ihren Punkten:

1. Die Freigabe der Austauschliste (62 Geräte) hat Frau Rehbein heute unterschrieben, der Scan kommt gleich separat.
2. und 3. passt, danke.
4. Die Stadtkasse hat Zahlläufe am 01.10. und am 15.10. Welle 2 läuft vom 28.09. bis 09.10. – die Kasse bitte also nicht vor dem 02.10. umstellen, am besten in der Woche vom 05.10.
5. Glasfaser Rathaus: Die Stadtwerke Rabensfurt nennen den 22.06.2026.

Außerdem zur Info: Die Bürgermeisterin hat die Schließung des Bürgerbüros am Samstag, 24.10.2026, für die Welle 3 freigegeben. Der Aushang geht im September raus.

Gruß
Dominik Hesse`,
      },
      {
        from: "zk-ritter",
        to: ["rf-hesse"],
        cc: ["zk-hartung", "rf-kaminski"],
        date: "2026-05-08T09:18",
        body: `Hallo Herr Hesse,

danke, die Freigabe liegt uns vor, wir bestellen heute. Damit steht für die ersten beiden Wellen:

- Welle 1: 07.09.–18.09.2026, Team Personal am 07./08.09., Ratsbüro und Wahlamt am 16.09.
- Welle 2: 28.09.–09.10.2026, Stadtkasse in der Woche vom 05.10.

Während der Wellen erreichen Ihre Kolleginnen und Kollegen unseren Service Desk unter 040 66969-899; in der ersten Woche jeder Welle sind zusätzlich zwei Leute von uns vor Ort.

Ein Punkt noch: Der Parallelbetrieb Ihres Serverraums läuft wie im Fahrplan bis 31.03.2027 (rund 4.500 € im Monat). Bitte denken Sie daran, die drei Monate 2027 im Haushalt einzuplanen – im Projektplan der Stadt steht noch Dezember.

Teil 2 der Inventarliste bitte wie besprochen bis 15.05. Die nächste Lenkungsgruppe ist am 18.06.2026.

Viele Grüße
Andreas Ritter`,
      },
    ],
  },
  {
    id: "rf-presseanfrage-furtbad-rundschau",
    title: "Presseanfrage der Rabensfurter Rundschau zum Furtbad",
    subject: "Anfrage Rabensfurter Rundschau – Furtbad: Kosten und Zeitplan",
    org: "rabensfurt",
    unit: "rf-kommunikation",
    date: "2026-02-16",
    tags: ["widersprueche", "zahlen"],
    keywords: ["Rabensfurter Rundschau", "gleichauf", "Redaktionsschluss", "Bauunterhaltung", "Folie 6"],
    summary:
      "Ein Lokalredakteur fragt nach dem Bürgerinformationsabend zum Furtbad nach Kosten und Zeitplan; die Pressestelle holt Zahlen beim Hochbau ein und antwortet. Widersprüche: Die Antwort nennt die überholten 30-Jahres-Kosten aus der fehlerhaften Tabelle („nahezu gleichauf“), 18 statt 24 Monate Schließzeit und eine Entscheidung im April statt am 18.06.2026 – obwohl die angehängte Präsentation es anders sagt.",
    mails: [
      {
        from: "ext-kowalewski",
        to: ["rf-claasen"],
        cc: ["rf-baumann"],
        date: "2026-02-13T16:52",
        body: `Sehr geehrte Frau Claasen,

nach dem Bürgerinformationsabend am Donnerstag möchten wir am Mittwoch mit einer Doppelseite zum Furtbad aufmachen. Dafür bitte ich um Antworten auf folgende Fragen:

1. Was kosten Sanierung und Neubau – einmalig und über die Jahre gerechnet?
2. Wie lange wäre das Bad bei einer Sanierung geschlossen, und wo findet das Schulschwimmen in dieser Zeit statt?
3. Wann entscheidet der Stadtrat?
4. Stimmt es, dass die Verwaltung intern längst den Neubau favorisiert? So war es am Donnerstag aus dem Publikum zu hören.

Redaktionsschluss für die Seite ist Montag, 14 Uhr. Für eine kurze Rückmeldung bis Montagmittag wäre ich dankbar.

Mit freundlichen Grüßen
Peter Kowalewski`,
      },
      {
        from: "rf-claasen",
        to: ["rf-arslan"],
        cc: ["rf-baumann"],
        date: "2026-02-16T08:14",
        subject: "WG: Anfrage Rabensfurter Rundschau – Furtbad: Kosten und Zeitplan",
        body: `Hallo Kemal,

kannst du mir bis 11 Uhr die aktuellen Zahlen für die Rundschau geben? Ich habe nur die Excel-Tabelle aus dem Januar, die du uns für die Vorbereitung geschickt hattest. Frage 4 beantworte ich selbst.

Danke dir!
Mareike`,
      },
      {
        from: "rf-arslan",
        to: ["rf-claasen"],
        cc: ["rf-baumann"],
        date: "2026-02-16T09:40",
        attachments: ["rf-buergerinformation-furtbad-varianten"],
        body: `Hallo Mareike,

bitte nimm die Präsentation vom Donnerstag (anbei), da stehen die geprüften Zahlen drin. Die Januar-Tabelle **nicht mehr verwenden**: Da fehlte in der Summe der Betriebskosten für die Sanierung die Bauunterhaltung, deshalb sah die Sanierung über 30 Jahre günstiger aus. Richtig ist Folie 6.

Kurz:
- Schließzeit bei Sanierung 24 Monate, beim Neubau nur rund 3 Monate für den Umzug
- Schulschwimmen in der Zeit im Hallenbad Altmoor
- Entscheidung im Stadtrat am 18.06.

Gruß
Kemal`,
      },
      {
        from: "rf-claasen",
        to: ["ext-kowalewski"],
        cc: ["rf-baumann"],
        date: "2026-02-16T11:48",
        quote: false,
        attachments: ["rf-buergerinformation-furtbad-varianten"],
        body: `Sehr geehrter Herr Kowalewski,

vielen Dank für Ihre Anfrage. Gern beantworte ich Ihre Fragen:

1. Die Sanierung des Furtbads kostet nach dem Gutachten rund 14,8 Mio. €, ein Neubau rund 19,5 Mio. €. Rechnet man Förderung, Ersatzinvestitionen und Betrieb über 30 Jahre mit, liegen beide Varianten nahezu gleichauf: Sanierung rund 40,2 Mio. €, Neubau rund 40,7 Mio. €.
2. Bei einer Sanierung wäre das Bad rund 18 Monate geschlossen. Das Schulschwimmen würde in dieser Zeit im Hallenbad Altmoor stattfinden; die Stadt organisiert den Bustransfer.
3. Der Stadtrat soll im April entscheiden. Vorher werden die Ergebnisse der Online-Beteiligung ausgewertet, die noch bis zum 15.03. läuft.
4. Die Verwaltung hat sich nicht festgelegt. Sie hat beide Varianten gleichwertig untersucht; die Entscheidung trifft der Stadtrat.

Die Präsentation vom Bürgerinformationsabend hänge ich Ihnen an. Für Rückfragen bin ich heute bis 16 Uhr erreichbar.

Mit freundlichen Grüßen
Mareike Claasen`,
      },
      {
        from: "ext-kowalewski",
        to: ["rf-claasen"],
        date: "2026-02-16T19:22",
        body: `Sehr geehrte Frau Claasen,

danke für die schnelle Antwort. Beim Gegenlesen stolpere ich allerdings: In Ihrer Präsentation steht auf Folie 6 für 30 Jahre Sanierung 44,7 Mio. € und Neubau 40,7 Mio. € – das sind gut 4 Mio. € Unterschied zugunsten des Neubaus, nicht „nahezu gleichauf“. Und auf Folie 4 steht eine Schließzeit von 24 Monaten, Sie schreiben 18.

Was gilt denn nun? Ich halte die Seite bis morgen, 10 Uhr, offen. Danach geht sie mit dem Stand, den ich habe.

Mit freundlichen Grüßen
Peter Kowalewski`,
      },
    ],
  },
  {
    id: "rf-haushaltssperre-2026-investitionen",
    title: "Haushaltswirtschaftliche Sperre 2026 und verschobene Investitionen",
    subject: "Gewerbesteuereinbruch – Vorschlag haushaltswirtschaftliche Sperre 2026",
    org: "rabensfurt",
    unit: "rf-fb2",
    date: "2026-05-20",
    tags: ["zahlen"],
    keywords: ["haushaltswirtschaftliche Sperre", "13,4 Mio. €", "Förderbescheid", "905.000 €", "Wiederbesetzungssperre"],
    summary:
      "Nach einem Einbruch bei der Gewerbesteuer schlägt der Kämmerer der Bürgermeisterin eine Haushaltssperre und verschobene Investitionen vor; der Fachbereich 5 widerspricht bei Lindenstraße und Furtbad und bietet Alternativen an; die Bürgermeisterin entscheidet. Gut zum Nachrechnen der Summen mit dem angehängten Investitionsprogramm und für eine Entscheidungsvorlage.",
    mails: [
      {
        from: "rf-stolte",
        to: ["rf-engelke"],
        cc: ["rf-luebke"],
        date: "2026-05-18T08:47",
        attachments: ["rf-investitionsprogramm-2026-2029"],
        body: `Sehr geehrte Frau Engelke,

ich muss Ihnen leider eine schlechte Nachricht übermitteln. Ein großer Gewerbesteuerzahler im Gewerbegebiet Nord hat nach der Betriebsprüfung eine Herabsetzung seiner Vorauszahlungen und eine Erstattung für 2023 und 2024 erhalten. Namen und Einzelheiten unterliegen dem Steuergeheimnis; ich erläutere sie Ihnen gern mündlich.

**Auswirkungen auf 2026:**
- Gewerbesteuer: Ansatz 16,8 Mio. €, Prognose jetzt **13,4 Mio. €** (– 3,4 Mio. €)
- Die Gewerbesteuerumlage sinkt dadurch um rund 0,3 Mio. €
- Der geplante Fehlbetrag steigt von 1,95 Mio. € auf rund 5,05 Mio. €
- Die Kreisumlage (21,44 Mio. €) bleibt für 2026 unverändert

Damit ist das Ziel unseres Haushaltssicherungskonzepts für 2026 nicht mehr zu halten. Ich schlage vor, sofort gegenzusteuern:

1. **Haushaltswirtschaftliche Sperre** von 15 % auf die noch nicht gebundenen Sachaufwendungen (offen sind 4,2 Mio. €, Sperre also rund 630.000 €)
2. **Wiederbesetzungssperre** von drei Monaten für frei werdende Stellen (rund 210.000 €)
3. **Investitionen 2026 verschieben** (siehe angehängtes Investitionsprogramm):
   - Lindenstraße, 950.000 € komplett nach 2027
   - Betriebshof: nur die Kehrmaschine (230.000 €), die Pritschenwagen (180.000 €) nach 2027
   - Furtbad-Planungsmittel von 450.000 € auf 150.000 €
   - Open Library Stadtbibliothek (145.000 €) nach 2027
   Zusammen 1.575.000 € weniger Kreditbedarf.

Außerdem müssen wir prüfen, ob wir nach der KV eine Nachtragshaushaltssatzung brauchen. Die Kommunalaufsicht des Landkreises sollten wir in jedem Fall zeitnah informieren.

Ich bitte um Entscheidung im Verwaltungsvorstand am Mittwoch.

Mit freundlichen Grüßen
Werner Stolte`,
      },
      {
        from: "rf-engelke",
        to: ["rf-ostermann"],
        cc: ["rf-stolte"],
        date: "2026-05-18T13:31",
        body: `Lieber Herr Ostermann,

bitte schauen Sie sich die Vorschläge von Herrn Stolte zu den Investitionen an, drei der vier Maßnahmen liegen bei Ihnen. Ich brauche Ihre Stellungnahme bis Dienstagabend, damit wir am Mittwoch im Verwaltungsvorstand entscheiden können.

Viele Grüße
Corinna Engelke`,
      },
      {
        from: "rf-ostermann",
        to: ["rf-engelke"],
        cc: ["rf-stolte"],
        date: "2026-05-19T17:12",
        body: `Liebe Frau Engelke,

die Lage ist ernst, das sehe ich. Zwei der Vorschläge kann ich aber nicht mittragen:

**Lindenstraße:** Wir haben seit dem 12.03.2026 den Förderbescheid über 1.215.000 €. Der Bescheid verlangt den Baubeginn bis 30.09.2026, sonst wird er widerrufen. Die Ausschreibung läuft, Submission ist am 02.06. Wenn wir jetzt schieben, verlieren wir die Förderung und zahlen 2027 alles selbst.

**Furtbad:** Der Stadtrat entscheidet am 18.06. Mit 150.000 € können wir danach nicht einmal die Vorplanung beauftragen. Ich brauche mindestens 250.000 €. Und ehrlich gesagt: Eine Kürzung vier Wochen vor der Entscheidung liest die Rundschau als Vorentscheidung.

**Mein Gegenvorschlag:**
- Radverkehrskonzept, 1. Bauabschnitt (380.000 €) nach 2027 – der Förderbescheid fehlt noch, da verlieren wir nichts
- Pritschenwagen (180.000 €) nach 2027 – einverstanden
- Furtbad-Planungsmittel auf 250.000 € (– 200.000 €)
- Open Library (145.000 €) nach 2027 – einverstanden, das ist Team Kultur, Herr Weiß weiß Bescheid

Das sind zusammen 905.000 € statt 1.575.000 €. Der Rest muss über die Sperre bei den Sachaufwendungen kommen.

Viele Grüße
Bernhard Ostermann`,
      },
      {
        from: "rf-engelke",
        to: ["rf-stolte", "rf-ostermann"],
        cc: ["rf-luebke", "rf-rehbein", "rf-lange", "rf-marquardt"],
        date: "2026-05-20T15:40",
        quote: false,
        body: `Liebe Kolleginnen und Kollegen,

im Verwaltungsvorstand haben wir heute Folgendes entschieden:

1. **Haushaltswirtschaftliche Sperre** ab 25.05.2026: 15 % der noch nicht gebundenen Sachaufwendungen. Ausgenommen sind Pflichtaufgaben mit rechtlicher Bindung, Kitas, Brandschutz und Verkehrssicherung. Die Fachbereiche melden bis 05.06. ihre gesperrten Positionen an Herrn Lübke.
2. **Wiederbesetzungssperre** von drei Monaten, ausgenommen Kitas, Bürgerbüro und Feuerwehr. Über weitere Ausnahmen entscheide ich im Einzelfall.
3. **Investitionen 2026:** Wir folgen dem Vorschlag von Herrn Ostermann (zusammen 905.000 €). Die Lindenstraße wird wie geplant gebaut.
4. Herr Stolte prüft bis 03.06., ob ein Nachtragshaushalt erforderlich ist, und informiert die Kommunalaufsicht.
5. Den Haupt- und Finanzausschuss unterrichten wir am 09.06.2026. Frau Claasen bereitet eine Pressemitteilung vor; bitte keine Einzelauskünfte an die Presse vorher.

Ich weiß, dass das für alle Bereiche schmerzhaft ist. Danke für die schnelle und sachliche Abstimmung.

Viele Grüße
Corinna Engelke`,
      },
    ],
  },
  {
    id: "rf-parkdruck-muehlenstrasse-lammers",
    title: "Anwohnerin beschwert sich über Parkdruck in der Mühlenstraße",
    subject: "Parksituation Mühlenstraße – so geht es nicht weiter!",
    org: "rabensfurt",
    unit: "rf-ordnung",
    date: "2025-07-09",
    tags: ["personendaten"],
    keywords: ["Mühlenstraße 23", "Merkzeichen aG", "Zone B", "Kurzzeit-Haltezone", "Pflegedienst"],
    summary:
      "Eine ältere Anwohnerin beschwert sich aufgebracht über zugeparkte Gehwege und fehlende Parkplätze für den Pflegedienst; das Team Ordnung antwortet und leitet den Fall mit dem Vermerk zum Parkraumkonzept an die Teamleitung weiter. Enthält Gesundheitsdaten und Daten Dritter – gut zum Anonymisieren vor der Weiterleitung und für ein Antwortschreiben.",
    mails: [
      {
        from: "ext-lammers",
        to: ["rf-wendler"],
        date: "2025-06-28T21:13",
        signature: false,
        body: `Sehr geehrter Herr Wendler,

ich wende mich an Sie weil ich nicht mehr weiter weiß. Ich wohne seit 41 Jahren in der Mühlenstraße 23 und so schlimm wie dieses Jahr war es noch nie. Jeden Tag stehen die Autos auf dem Gehweg, gestern abend wieder ein großer weißer Transporter direkt vor meiner Haustür, ich kam mit meinem Rollator nicht vorbei und musste auf die Straße ausweichen. Ich bin 78 und habe seit meiner Hüft-OP im Februar einen Schwerbehindertenausweis.

Der Pflegedienst kommt jeden morgen um halb acht und findet keinen Parkplatz, die Schwester hat schon zweimal ein Knöllchen bekommen weil sie in der zweiten Reihe stand. Das kann doch nicht sein!!

Am Marktplatz ist tagsüber alles voll mit Leuten die in der Innenstadt arbeiten, die parken dann bei uns weil es da nichts kostet. Abends kommen noch die Gäste vom Restaurant an der Ecke dazu.

Ich hätte gern einen eigenen Behindertenparkplatz vor dem Haus, mein Sohn fährt mich ja zu den Ärzten. Und warum gibt es bei uns kein Anwohnerparken wie oben in der Altstadt?

Mit freundlichen Grüßen
Gerda Lammers
Mühlenstraße 23
00761 Rabensfurt
Tel. 040 66969-937`,
      },
      {
        from: "rf-wendler",
        to: ["ext-lammers"],
        date: "2025-06-30T10:22",
        body: `Sehr geehrte Frau Lammers,

vielen Dank für Ihre E-Mail. Ich kann gut nachvollziehen, wie belastend die Situation vor Ihrer Haustür für Sie ist – gerade mit Rollator.

Zu Ihren Fragen:

**Anwohnerparken:** Wir erarbeiten derzeit ein Parkraumkonzept für die Altstadt. Ein Baustein ist eine zweite Bewohnerparkzone im Süden der Altstadt, zu der auch die Mühlenstraße gehören würde. Darüber entscheidet der zuständige Ausschuss voraussichtlich im November; vorher beteiligen wir im September die Anwohnerinnen und Anwohner.

**Behindertenparkplatz:** Einen Parkplatz, der nur für Sie reserviert ist, dürfen wir nach den Vorschriften leider nur einrichten, wenn im Schwerbehindertenausweis das Merkzeichen aG (außergewöhnliche Gehbehinderung) eingetragen ist. Ob für Sie eine andere Parkerleichterung in Frage kommt, kann ich prüfen, wenn Sie mir eine Kopie Ihres Ausweises schicken.

**Gehwegparken und Pflegedienst:** Ich habe die Verkehrsüberwachung gebeten, die Mühlenstraße in den nächsten Wochen verstärkt zu kontrollieren, auch abends. Für die Pflegedienste prüfen wir eine Haltezone.

Mit freundlichen Grüßen
Im Auftrag
Sebastian Wendler`,
      },
      {
        from: "ext-lammers",
        to: ["rf-wendler"],
        date: "2025-07-01T17:58",
        signature: false,
        body: `Hallo Herr Wendler,

danke für die nette Antwort, das hätte ich ehrlich gesagt nicht gedacht. Das mit dem aG verstehe ich nicht ganz, ich kann ja nur 100 Meter am Stück laufen. Im Ausweis steht Grad 70 und G und B. Kann ich den Ausweis fotografieren und schicken oder soll ich vorbei kommen?

Gestern abend standen wieder drei Autos auf dem Gehweg, eins davon wieder der weiße Transporter. Das Kennzeichen hab ich mir aufgeschrieben, ich sag es Ihnen lieber am Telefon. Meine Nachbarin Frau Kröger von Nummer 21 sagt das gleiche, die ist 84 und traut sich abends gar nicht mehr raus.

Der Pflegedienst ist übrigens Lindenblüte, die Schwester heißt Monika, die kann Ihnen das bestätigen. Mein Sohn Thomas kann Sie auch anrufen, der ist abends erreichbar unter 040 66969-938.

Gruß G. Lammers`,
      },
      {
        from: "rf-wendler",
        to: ["rf-gottschalk"],
        cc: ["rf-lange"],
        date: "2025-07-09T09:05",
        subject: "WG: Parksituation Mühlenstraße – Vermerk Parkraumkonzept Altstadt",
        attachments: ["rf-vermerk-parkraumkonzept-altstadt"],
        body: `Hallo Marion,

anbei mein Vermerk vom 07.07. zum Parkraumkonzept Altstadt für die Abstimmung mit FB 5 und die Vorbereitung der Anwohnerbeteiligung. Unten zur Info der Verlauf mit Frau Lammers aus der Mühlenstraße – ein typischer Fall für die Zone B.

Zwei Punkte, bei denen ich deine Entscheidung brauche:
1. Frau Lammers hat GdB 70 mit G und B. Das reicht nicht für einen personenbezogenen Parkplatz und nach meiner Prüfung auch nicht für den orangefarbenen Parkausweis. Soll ich ihr das so schreiben, oder schauen wir uns den Fall vorher gemeinsam an?
2. Die Kurzzeit-Haltezone für Pflegedienste in der Mühlenstraße könnten wir per verkehrsrechtlicher Anordnung sofort einrichten, ohne auf das Konzept zu warten. Beschilderung rund 600 €.

Kontrollen: Die Verkehrsüberwachung war am 02., 04. und 07.07. abends in der Mühlenstraße – elf Verwarnungen wegen Gehwegparkens.

Gruß
Sebastian`,
      },
    ],
  },
  {
    id: "rf-bewerbung-buergerbuero-kunze",
    title: "Bewerbung für das Bürgerbüro: Vorstellungsgespräch und Zusage",
    subject: "Einladung zum Vorstellungsgespräch – Kennziffer 14/2026",
    org: "rabensfurt",
    unit: "rf-personal",
    date: "2026-07-21",
    tags: ["personendaten"],
    keywords: ["Kennziffer 14/2026", "§ 178 Abs. 2 SGB IX", "Stufe 3", "Gleichstellungsbescheid", "Fennhusen"],
    summary:
      "Eine Bewerberin verlegt ihr Vorstellungsgespräch und weist auf ihre Gleichstellung hin, das Team Personal organisiert das Verfahren, gibt das Ergebnis intern weiter und sagt zu; zum Schluss schickt die Bewerberin Steuer-ID, Sozialversicherungsnummer und Kontodaten per Mail. Enthält viele erfundene Personen- und Gesundheitsdaten – gut zum Anonymisieren und für eine datenschutzgerechte Antwort.",
    mails: [
      {
        from: "ext-kunze",
        to: ["rf-koch"],
        date: "2026-07-06T07:48",
        signature: false,
        body: `Sehr geehrte Frau Koch,

vielen Dank für die Einladung zum Vorstellungsgespräch am Dienstag, 14.07.2026, um 10:00 Uhr. Ich freue mich sehr!

Leider habe ich an diesem Vormittag einen Termin in der Reha-Klinik, den ich nicht verschieben kann. Wäre ein anderer Termin möglich, gern auch nachmittags oder am 16. oder 17.07.?

Wie in meiner Bewerbung angegeben, bin ich mit einem GdB von 30 schwerbehinderten Menschen gleichgestellt (Gleichstellungsbescheid der Agentur für Arbeit vom 12.03.2024). Nach einer Knie-OP habe ich noch Probleme mit Treppen. Ist der Raum barrierefrei erreichbar?

Noch eine Kleinigkeit: In Ihrer Einladung steht mein Geburtsdatum als 03.11.1969 – richtig ist der 03.11.1996. Nicht dass das später falsch in den Unterlagen steht.

Mit freundlichen Grüßen
Lisa-Marie Kunze
Drosselweg 9
00761 Rabensfurt
Tel. 040 66969-944`,
      },
      {
        from: "rf-koch",
        to: ["ext-kunze"],
        date: "2026-07-06T11:20",
        body: `Sehr geehrte Frau Kunze,

vielen Dank für Ihre Nachricht. Gern verlegen wir das Gespräch auf **Donnerstag, 16.07.2026, 13:30 Uhr**. Es findet im Rathaus, Markt 1, in Raum 0.14 im Erdgeschoss statt. Der Raum ist barrierefrei erreichbar; Behindertenparkplätze finden Sie direkt am Eingang Kirchgasse.

Da Sie schwerbehinderten Menschen gleichgestellt sind, nimmt die Schwerbehindertenvertretung nach § 178 Abs. 2 SGB IX am Gespräch teil, sofern Sie dem nicht widersprechen. Außerdem sind Frau El-Amrani (Teamleiterin Bürgerbüro), ein Mitglied des Personalrats und ich dabei. Das Gespräch dauert etwa 45 Minuten, danach folgt eine kurze Arbeitsprobe von 20 Minuten.

Ihr Geburtsdatum haben wir korrigiert – danke für den Hinweis.

Bitte bringen Sie Ihre Zeugnisse im Original mit. Reisekosten können wir leider nicht erstatten.

Mit freundlichen Grüßen
Im Auftrag
Jasmin Koch`,
      },
      {
        from: "rf-koch",
        to: ["rf-heitmann"],
        cc: ["rf-el-amrani"],
        date: "2026-07-17T15:05",
        subject: "Auswahlverfahren Kennziffer 14/2026 – Sachbearbeitung Bürgerbüro: Ergebnis",
        quote: false,
        body: `Hallo Andrea,

kurz das Ergebnis der Gespräche vom 15. und 16.07., der Auswahlvermerk folgt bis Mittwoch:

1. Lisa-Marie Kunze – 87 von 100 Punkten (Verwaltungsfachangestellte, seit 08/2022 im Einwohnermeldeamt der Gemeinde Fennhusen, gleichgestellt mit GdB 30)
2. Tobias Wehrmann – 78 Punkte (Bankkaufmann, Quereinsteiger)
3. Natalia Brzezińska – 71 Punkte (Abschluss als Verwaltungsfachangestellte 07/2026)
4. Kevin Strothmann – 64 Punkte

Die Kommission hat sich einstimmig für Frau Kunze ausgesprochen. Die Schwerbehindertenvertretung (Herr Dreyer) und die Gleichstellungsbeauftragte haben keine Einwände.

Eingruppierung: EG 8, wegen knapp vier Jahren einschlägiger Berufserfahrung Stufe 3 (§ 16 Abs. 2 TVöD). Wegen ihrer Kündigungsfrist ist der früheste Beginn der 01.10.2026.

Wenn du einverstanden bist, gebe ich es heute noch an den Personalrat zur Zustimmung nach dem LPersVG. Herrn Wehrmann würde ich erst nach der Zustimmung absagen, falls wir nachrücken müssen.

Gruß
Jasmin`,
      },
      {
        from: "rf-koch",
        to: ["ext-kunze"],
        date: "2026-07-21T10:30",
        subject: "Ihre Bewerbung – Kennziffer 14/2026 – Zusage",
        quote: false,
        body: `Sehr geehrte Frau Kunze,

wir freuen uns, Ihnen mitteilen zu können, dass sich die Auswahlkommission für Sie entschieden hat. Der Personalrat hat gestern zugestimmt. Wir möchten Sie zum **01.10.2026** unbefristet als Sachbearbeiterin im Team Bürgerbüro einstellen, Entgeltgruppe 8 TVöD, Stufe 3, in Vollzeit mit 39 Wochenstunden. Die Probezeit beträgt sechs Monate.

Für den Arbeitsvertrag benötigen wir von Ihnen:
- Kopie des Personalausweises
- Steuer-Identifikationsnummer und Sozialversicherungsnummer
- Bankverbindung und Krankenkasse
- Kopie des Gleichstellungsbescheids
- Arbeitszeugnis oder Bescheinigung der Gemeinde Fennhusen über Ihre Tätigkeit

**Bitte schicken Sie diese Unterlagen nicht per E-Mail**, sondern laden Sie sie im Bewerbungsportal hoch oder senden Sie sie per Post an das Team Personal.

Mit freundlichen Grüßen
Im Auftrag
Jasmin Koch`,
      },
      {
        from: "ext-kunze",
        to: ["rf-koch"],
        date: "2026-07-21T20:14",
        subject: "AW: Ihre Bewerbung – Kennziffer 14/2026 – Zusage",
        signature: false,
        body: `Liebe Frau Koch,

das ist ja toll!!! Vielen, vielen Dank, ich habe mich riesig gefreut. Ich kündige morgen in Fennhusen, meine Frist ist sechs Wochen zum Quartalsende, das passt also genau.

Das Portal hat bei mir leider nicht funktioniert (Fehlermeldung beim Hochladen), deshalb schicke ich Ihnen die Daten einfach schon mal hier, damit es schnell geht:

Steuer-ID: 47 815 239 604
Sozialversicherungsnummer: 65 031196 K 512
IBAN: DE00 2904 1288 3165 7302 44
Krankenkasse: BKK Altmoorland

Den Ausweis und den Gleichstellungsbescheid fotografiere ich morgen und schicke sie hinterher.

Zwei Fragen hätte ich noch: Gibt es bei der Stadt ein Dienstfahrrad? Und könnte ich wegen meines Knies einen höhenverstellbaren Schreibtisch bekommen?

Liebe Grüße
Lisa-Marie Kunze`,
      },
    ],
  },
];
