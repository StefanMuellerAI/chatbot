// Bundesamt für zentrale Beschaffung und Liegenschaften (Bund)
import type { CellSpec, DocSpec, ThreadSpec } from "../types";

// ── Inventurliste IT-Geräte: deterministisch erzeugt (fester Startwert, feste Namens- und Gerätelisten) ──
const INV_VORNAMEN = ["Anke", "Bernd", "Carla", "Dennis", "Elif", "Frank", "Gülsen", "Holger", "Ivana", "Jörg", "Katrin", "Lars", "Monika", "Nils", "Olga", "Patrick", "Renate", "Sven", "Tanja", "Uwe", "Vera", "Wiebke", "Yannick", "Zeynep", "Marek", "Heike", "Jana", "Kevin", "Sabine", "Timo"];
const INV_NACHNAMEN = ["Albers", "Brinkmann", "Dreyer", "Eckhoff", "Franzen", "Gerdes", "Ilić", "Janßen", "Kampmann", "Lüders", "Meinke", "Nolting", "Overkamp", "Petzold", "Reuter", "Schwarzer", "Thiele", "Ulbrich", "Vogt", "Wiechmann", "Yılmaz", "Zander", "Brockmann", "Haase", "Kühl", "Lemke", "Möller", "Rademacher", "Siebert", "Tewes"];
const INV_MODELLE = [
  { typ: "Notebook", bez: "Notebook 14 Zoll Standard, Generation 2020", jahr: 2020, preis: 1048, nd: 4, w: 12, sn: "NB" },
  { typ: "Notebook", bez: "Notebook 14 Zoll Standard, Generation 2021", jahr: 2021, preis: 1012, nd: 4, w: 14, sn: "NB" },
  { typ: "Notebook", bez: "Notebook 14 Zoll Standard, Generation 2023", jahr: 2023, preis: 1095, nd: 4, w: 16, sn: "NB" },
  { typ: "Notebook", bez: "Notebook 16 Zoll mit Grafikkarte, Generation 2021", jahr: 2021, preis: 1412, nd: 4, w: 4, sn: "NB" },
  { typ: "Notebook", bez: "Notebook 16 Zoll mit Grafikkarte, Generation 2024", jahr: 2024, preis: 1368, nd: 4, w: 4, sn: "NB" },
  { typ: "Monitor", bez: "Monitor 24 Zoll", jahr: 2019, preis: 168, nd: 6, w: 10, sn: "MO" },
  { typ: "Monitor", bez: "Monitor 27 Zoll höhenverstellbar", jahr: 2022, preis: 289, nd: 6, w: 10, sn: "MO" },
  { typ: "Dockingstation", bez: "Dockingstation Thunderbolt", jahr: 2021, preis: 189, nd: 5, w: 8, sn: "DS" },
  { typ: "Multifunktionsgerät", bez: "Multifunktionsgerät A3 (Etagengerät)", jahr: 2019, preis: 2890, nd: 5, w: 3, sn: "MF" },
  { typ: "Smartphone", bez: "Smartphone dienstlich", jahr: 2023, preis: 419, nd: 3, w: 8, sn: "SP" },
  { typ: "Tablet", bez: "Tablet dienstlich 11 Zoll", jahr: 2022, preis: 612, nd: 4, w: 4, sn: "TB" },
  { typ: "Konferenzsystem", bez: "Konferenzkamera mit Lautsprecher", jahr: 2022, preis: 1890, nd: 5, w: 2, sn: "KS" },
];
const INV_STANDORTE = [
  { name: "Dienstsitz Bonn, Haus A", raum: "A", w: 30, einheiten: ["Leitung", "Z 1", "Z 2", "B 4", "L 3"] },
  { name: "Dienstsitz Bonn, Haus B", raum: "B", w: 25, einheiten: ["B 2", "B 3", "B 4", "Z 4"] },
  { name: "Dienstsitz Bonn, Haus C", raum: "C", w: 15, einheiten: ["L 1", "L 2", "L 3", "Z 4"] },
  { name: "Außenstelle Berlin", raum: "K18-", w: 22, einheiten: ["B 2", "B 3", "L 1", "L 2", "Z 4"] },
  { name: "Logistikzentrum Nord", raum: "LZ-", w: 8, einheiten: ["B 3", "L 2"] },
];
const INV_ANZAHL = 150;
const INV_NICHT_AUFFINDBAR = [23, 88, 131];

interface InvItem {
  nr: string;
  typ: string;
  bez: string;
  sn: string;
  jahr: number;
  standort: string;
  raum: string;
  nutzer: string;
  einheit: string;
  status: string;
  nd: number;
  preis: number;
  rest: number;
}

function inventur(): InvItem[] {
  let seed = 20251215;
  const rnd = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  const pick = <T extends { w: number }>(list: T[]) => {
    let x = rnd() * list.reduce((s, e) => s + e.w, 0);
    for (const e of list) if ((x -= e.w) < 0) return e;
    return list[list.length - 1];
  };
  const zeichen = "ABCEFGHJKLMNPQRSTVWXYZ23456789";
  const zaehler = new Map<number, number>();
  const items: InvItem[] = [];
  for (let i = 0; i < INV_ANZAHL; i++) {
    const m = pick(INV_MODELLE);
    const s = pick(INV_STANDORTE);
    const lfd = (zaehler.get(m.jahr) ?? 100 + m.jahr % 7 * 11) + 1;
    zaehler.set(m.jahr, lfd);
    let sn = m.sn;
    for (let k = 0; k < 8; k++) sn += zeichen[Math.floor(rnd() * zeichen.length)];
    const etage = Math.floor(rnd() * 5);
    const raum = `${s.raum}${s.raum.length === 1 ? " " : ""}${etage}.${String(etage * 100 + 1 + Math.floor(rnd() * 40)).padStart(3, "0")}`;
    const einheit = s.einheiten[Math.floor(rnd() * s.einheiten.length)];
    const name = `${INV_VORNAMEN[Math.floor(rnd() * INV_VORNAMEN.length)]} ${INV_NACHNAMEN[Math.floor(rnd() * INV_NACHNAMEN.length)]}`;
    const r = rnd();
    const gemeinschaft = m.typ === "Multifunktionsgerät" || m.typ === "Konferenzsystem";
    let status = "im Einsatz";
    let nutzer = gemeinschaft ? "Gemeinschaftsgerät" : name;
    if (INV_NICHT_AUFFINDBAR.includes(i)) status = "nicht auffindbar";
    else if (r < 0.05) status = "defekt – Aussonderung beantragt";
    else if (r < 0.11) {
      status = "Lager";
      nutzer = "–";
    } else if (m.typ === "Notebook" && m.jahr <= 2021) status = "im Einsatz – Austausch 2026 (B4-2025-117)";
    const alter = 2025 - m.jahr;
    items.push({
      nr: `BZBL-IT-${m.jahr}-${String(lfd).padStart(4, "0")}`,
      typ: m.typ,
      bez: m.bez,
      sn,
      jahr: m.jahr,
      standort: s.name,
      raum,
      nutzer,
      einheit,
      status,
      nd: m.nd,
      preis: m.preis,
      rest: Math.round(Math.max(0, m.preis * (1 - alter / m.nd)) * 100) / 100,
    });
  }
  return items;
}

const INVENTUR = inventur();
const INV_TYPEN = [...new Set(INV_MODELLE.map((m) => m.typ))];
const INV_STATUS = [...new Set(INVENTUR.map((x) => x.status))].sort();
const invSumme = (xs: InvItem[], f: (x: InvItem) => number) => Math.round(xs.reduce((s, x) => s + f(x), 0) * 100) / 100;

const INVENTUR_ZEILEN: CellSpec[][] = INVENTUR.map((x) => [
  x.nr,
  x.typ,
  x.bez,
  x.sn,
  String(x.jahr),
  x.standort,
  x.raum,
  x.nutzer,
  x.einheit,
  x.status,
  x.nd,
  2025 - x.jahr,
  x.preis,
  { f: "ROUND(MAX(0,M{r}*(1-L{r}/K{r})),2)" },
]);

export const documents: DocSpec[] = [
  {
    type: "word",
    id: "bzbl-vergabevermerk-notebooks",
    title: "Vergabevermerk: Rahmenvereinbarung Notebooks und Dockingstationen",
    kind: "Vergabevermerk",
    fileName: "Vergabevermerk Rahmenvereinbarung Notebooks B4-2025-117",
    org: "bzbl",
    unit: "bzbl-b4",
    author: "bzbl-lindqvist",
    date: "2025-09-12",
    tags: ["zahlen"],
    keywords: ["B4-2025-117", "offenen Verfahren", "Fachlose", "20.10.2025", "4.600.000 €"],
    summary:
      "Vergabevermerk zur Vorbereitung einer EU-weiten Ausschreibung: Bedarf, geschätzter Auftragswert, Verfahrenswahl, Lose, Eignungs- und Zuschlagskriterien sowie Zeitplan.",
    meta: [
      ["Vergabenummer", "B4-2025-117"],
      ["Aktenzeichen", "B 4 – 0815.3/25"],
    ],
    subject: "Rahmenvereinbarung über die Lieferung von Notebooks und Dockingstationen für das BZBL und Bedarfsträger des Geschäftsbereichs",
    blocks: [
      { t: "h1", text: "1. Gegenstand und Bedarf" },
      {
        t: "p",
        text: "Das BZBL beschafft für sich und für die angeschlossenen Bedarfsträger Notebooks einschließlich Zubehör im Rahmen einer Rahmenvereinbarung mit einer Laufzeit von 24 Monaten und einer Verlängerungsoption um 12 Monate. Anlass ist der turnusmäßige Austausch der 2020 und 2021 beschafften Geräte sowie der Mehrbedarf durch mobiles Arbeiten.",
      },
      {
        t: "p",
        text: "Der Bedarf wurde bei den Bedarfsträgern bis zum 31.07.2025 abgefragt. Insgesamt wurden **4.000 Notebooks** (davon 3.300 Standardgeräte und 700 Geräte mit erweiterter Leistung) sowie 3.600 Dockingstationen gemeldet.",
      },
      { t: "h1", text: "2. Geschätzter Auftragswert" },
      {
        t: "table",
        header: ["Los", "Gegenstand", "Menge", "Stückpreis netto (geschätzt)", "Summe netto"],
        rows: [
          ["1", "Notebook Standard (14 Zoll)", "3.300", "1.050 €", "3.465.000 €"],
          ["2", "Notebook erweiterte Leistung (16 Zoll, dedizierte Grafik)", "700", "1.380 €", "966.000 €"],
          ["3", "Dockingstation USB-C", "3.600", "47 €", "169.200 €"],
          ["", "Summe", "", "", "4.600.200 €"],
        ],
        widths: [1, 5, 2, 3, 3],
      },
      {
        t: "p",
        text: "Der geschätzte Gesamtauftragswert beträgt rund **4.600.000 € netto** und überschreitet damit den EU-Schwellenwert für Liefer- und Dienstleistungsaufträge oberster und oberer Bundesbehörden deutlich. Grundlage der Schätzung sind die Preise der Vorgängervereinbarung, aktuelle Marktbeobachtungen und Preisindizes.",
      },
      { t: "h1", text: "3. Wahl der Verfahrensart" },
      {
        t: "p",
        text: "Die Vergabe erfolgt im **offenen Verfahren** nach § 15 VgV. Gründe für ein Verhandlungsverfahren liegen nicht vor: Es handelt sich um marktübliche Standardprodukte, die Leistung lässt sich eindeutig beschreiben.",
      },
      { t: "h1", text: "4. Losaufteilung" },
      {
        t: "p",
        text: "Gemäß § 97 Abs. 4 GWB wird die Leistung in drei Fachlose aufgeteilt (siehe Tabelle unter Nr. 2). Die Aufteilung ermöglicht auch kleineren und mittleren Unternehmen eine Beteiligung, insbesondere bei Los 3. Eine Loslimitierung ist nicht vorgesehen.",
      },
      { t: "h1", text: "5. Eignungskriterien" },
      {
        t: "ul",
        items: [
          "Mindestjahresumsatz im Bereich IT-Hardware von 2,0 Mio. € (Los 1 und 2) bzw. 0,2 Mio. € (Los 3) in den letzten drei Geschäftsjahren",
          "Mindestens drei vergleichbare Referenzen öffentlicher oder privater Auftraggeber aus den letzten drei Jahren",
          "Zertifiziertes Qualitätsmanagement (z. B. nach ISO 9001) oder gleichwertiger Nachweis",
          "Eigenerklärung zu Ausschlussgründen nach §§ 123, 124 GWB",
        ],
      },
      { t: "h1", text: "6. Zuschlagskriterien" },
      {
        t: "table",
        header: ["Kriterium", "Gewichtung", "Bewertung"],
        rows: [
          ["Preis (Gesamtpreis laut Preisblatt)", "60 %", "lineare Interpolation, günstigstes Angebot erhält 100 Punkte"],
          ["Qualität (Akkulaufzeit, Gewicht, Display)", "25 %", "Bewertungsmatrix gemäß Leistungsbeschreibung"],
          ["Nachhaltigkeit (Energieverbrauch, Reparierbarkeit, Rücknahme)", "15 %", "Nachweis über Umweltzeichen oder gleichwertige Belege"],
        ],
        widths: [4, 1, 4],
      },
      { t: "h1", text: "7. Zeitplan" },
      {
        t: "table",
        header: ["Schritt", "Termin"],
        rows: [
          ["Absendung der Bekanntmachung an das Amtsblatt der EU", "16.09.2025"],
          ["Frist für Bieterfragen", "10.10.2025"],
          ["Ablauf der Angebotsfrist", "20.10.2025, 12:00 Uhr"],
          ["Prüfung und Wertung", "bis 07.11.2025"],
          ["Information nach § 134 GWB", "10.11.2025"],
          ["Zuschlag (frühestens)", "21.11.2025"],
        ],
        widths: [3, 2],
      },
      { t: "h1", text: "8. Dokumentation" },
      {
        t: "p",
        text: "Bieterfragen und deren Antworten werden über die Vergabeplattform allen Unternehmen anonymisiert zur Verfügung gestellt. Alle Verfahrensschritte werden in diesem Vermerk fortgeschrieben.",
      },
      { t: "signature", lines: ["Bonn, 12.09.2025", "", "Lindqvist", "Vergabereferent", "", "Mitgezeichnet: Rothkegel (Referat B 2, Bedarfsstelle)"] },
    ],
  },
  {
    type: "powerpoint",
    id: "bzbl-energiebericht-2024",
    title: "Energiebericht Liegenschaften 2024",
    kind: "Präsentation",
    fileName: "Energiebericht Liegenschaften 2024 Hausleitung",
    org: "bzbl",
    unit: "bzbl-l3",
    author: "bzbl-demir",
    date: "2025-06-20",
    tags: ["zahlen"],
    keywords: ["Wärmeverbrauch", "Rechenzentrum", "CO₂-Emissionen", "Photovoltaik"],
    summary:
      "Energiebericht für die Hausleitung: Entwicklung von Wärme- und Stromverbrauch, Emissionen je Liegenschaft, umgesetzte Maßnahmen und Ziele bis 2030.",
    slides: [
      { t: "title", title: "Energiebericht Liegenschaften 2024", subtitle: "Präsentation für die Hausleitung am 26. Juni 2025" },
      {
        t: "bullets",
        title: "Das Wichtigste in Kürze",
        bullets: [
          "Wärmeverbrauch seit 2019 um **19 %** gesunken (witterungsbereinigt)",
          "Stromverbrauch steigt – Haupttreiber ist das eigene Rechenzentrum",
          "CO₂-Emissionen 2024: 6.180 Tonnen (– 27 % gegenüber 2019)",
          "Ziel 2030 (klimaneutrale Bundesverwaltung) ist ohne zusätzliche Maßnahmen nicht erreichbar",
        ],
      },
      {
        t: "chart",
        title: "Wärmeverbrauch aller Liegenschaften",
        chart: {
          type: "line",
          categories: ["2019", "2020", "2021", "2022", "2023", "2024"],
          series: [{ name: "Wärme (MWh, witterungsbereinigt)", values: [18400, 17900, 18650, 16200, 15100, 14850] }],
          unit: "MWh",
        },
        caption: "2021: Sondereffekt durch Lüftungskonzept während der Pandemie",
      },
      {
        t: "chart",
        title: "Stromverbrauch je Liegenschaft 2024",
        chart: {
          type: "bar",
          categories: ["Dienstsitz Bonn", "Logistikzentrum Nord", "Außenstelle Berlin", "Rechenzentrum"],
          series: [
            { name: "2023", values: [3240, 1910, 990, 3980] },
            { name: "2024", values: [3120, 1840, 960, 4410] },
          ],
          unit: "MWh",
        },
        notes: "Das Rechenzentrum wächst durch die Konsolidierung der Fachverfahren und den KI-Pilotbetrieb.",
      },
      {
        t: "table",
        title: "Umgesetzte Maßnahmen 2024",
        header: ["Maßnahme", "Liegenschaft", "Einsparung pro Jahr"],
        rows: [
          ["LED-Umrüstung Büroflächen", "Dienstsitz Bonn", "210 MWh Strom"],
          ["Photovoltaikanlage 380 kWp", "Logistikzentrum Nord", "340 MWh Strom (Eigenverbrauch)"],
          ["Hydraulischer Abgleich und Pumpentausch", "Außenstelle Berlin", "620 MWh Wärme"],
          ["Freie Kühlung im Winter", "Rechenzentrum", "180 MWh Strom"],
        ],
      },
      {
        t: "bullets",
        title: "Vorschläge bis 2030",
        bullets: [
          { text: "Abwärme des Rechenzentrums für den Dienstsitz nutzen", sub: ["Machbarkeitsstudie 2025/26, Kosten ca. 120.000 €"] },
          "Wärmepumpe statt Gaskessel in der Außenstelle Berlin (Austausch 2027 fällig)",
          "Energiemanagement nach DIN EN ISO 50001 für alle Liegenschaften",
          "Flächen konsolidieren: zwei angemietete Standorte bis 2028 aufgeben",
        ],
      },
      { t: "end", title: "Vielen Dank", lines: ["Dr. Fatma Demir · Referat L 3 – Energie und Nachhaltigkeit"] },
    ],
  },
  {
    type: "word",
    id: "bzbl-leistungsbeschreibung-rahmenvertrag-gebaeudereinigung",
    title: "Leistungsbeschreibung Rahmenvertrag Unterhalts- und Glasreinigung 2025–2029",
    kind: "Leistungsbeschreibung",
    fileName: "B3-2025-031 Leistungsbeschreibung Gebaeudereinigung",
    org: "bzbl",
    unit: "bzbl-b3",
    author: "bzbl-grote",
    date: "2025-03-11",
    keywords: ["B3-2025-031", "DIN EN 13549", "Mängelquote", "Vertragsstrafe", "Raumgruppe"],
    summary:
      "Lange Leistungsbeschreibung für die Gebäudereinigung in drei Losen (Bonn, Berlin, Logistikzentrum): Flächen nach Raumgruppen, Reinigungsturnus, Personal, Qualitätskontrollen mit Mängelquote, Minderung und Vertragsstrafe – Grundlage für den späteren Streit mit dem Reinigungsdienstleister und gut zum Prüfen, Zusammenfassen oder Erstellen einer Checkliste.",
    meta: [
      ["Vergabenummer", "B3-2025-031"],
      ["Aktenzeichen", "B 3 – 0640.12/25"],
      ["Anlage", "C 1 zu den Vergabeunterlagen"],
    ],
    subject: "Rahmenvertrag über Unterhaltsreinigung, Glasreinigung und Sonderreinigungen für die Liegenschaften des BZBL – Leistungsbeschreibung",
    blocks: [
      { t: "h1", text: "1. Allgemeines" },
      { t: "h2", text: "1.1 Auftraggeber und Gegenstand" },
      {
        t: "p",
        text: "Auftraggeber ist die Bundesrepublik Deutschland, vertreten durch das Bundesamt für zentrale Beschaffung und Liegenschaften (BZBL), Rheinallee 40, 00175 Bonn. Gegenstand ist die Unterhaltsreinigung, die Glasreinigung sowie Sonder- und Grundreinigungen in den Liegenschaften des BZBL. Die Leistung wird in drei Losen vergeben:",
      },
      {
        t: "ul",
        items: [
          "**Los 1:** Dienstsitz Bonn, Rheinallee 40, Häuser A, B und C einschließlich Kantine und Tiefgarage (nur Treppenhäuser und Aufzugsvorräume)",
          "**Los 2:** Außenstelle Berlin, Kanalstraße 18 sowie angemietete Fläche Kanalstraße 22, 3. OG (Mietende 31.12.2027; der Wegfall dieser Fläche ist als Option in der Kalkulation zu berücksichtigen)",
          "**Los 3:** Logistikzentrum Nord, Verwaltungsgebäude und Hallen 1 und 2",
        ],
      },
      { t: "h2", text: "1.2 Laufzeit" },
      {
        t: "p",
        text: "Der Rahmenvertrag beginnt am 01.10.2025 und endet am 30.09.2027. Der Auftraggeber kann ihn zweimal um jeweils zwölf Monate verlängern, längstens bis zum 30.09.2029. Die Verlängerung ist spätestens drei Monate vor Ablauf schriftlich zu erklären.",
      },
      { t: "h2", text: "1.3 Begriffe" },
      {
        t: "ul",
        items: [
          "**Raumgruppe (RG):** Zusammenfassung von Räumen mit gleichem Reinigungsbedarf (Abschnitt 2)",
          "**Turnus:** Häufigkeit der Reinigung, angegeben je Woche, Monat oder Jahr",
          "**Reinigungstag:** Montag bis Freitag mit Ausnahme der gesetzlichen Feiertage am Ort der Liegenschaft",
          "**Mangel:** Abweichung des Reinigungsergebnisses von der in Abschnitt 3 beschriebenen Soll-Leistung",
        ],
      },
      { t: "h1", text: "2. Objektdaten" },
      {
        t: "p",
        text: "Die folgenden Reinigungsflächen sind verbindliche Kalkulationsgrundlage. Abweichungen von bis zu 5 Prozent gegenüber dem tatsächlichen Aufmaß berechtigen keine Partei zur Anpassung der Vergütung. Raumbücher und Grundrisse sind als Anlagen C 2 bis C 4 beigefügt.",
      },
      {
        t: "table",
        header: ["Raumgruppe", "Los 1 Bonn (m²)", "Los 2 Berlin (m²)", "Los 3 Logistik (m²)"],
        rows: [
          ["RG 1 Büroräume", "18.400", "5.680", "1.120"],
          ["RG 2 Sanitärräume", "1.260", "410", "180"],
          ["RG 3 Verkehrsflächen (Flure, Treppen, Foyers, Aufzüge)", "7.900", "2.150", "940"],
          ["RG 4 Besprechungs- und Schulungsräume", "2.300", "760", "160"],
          ["RG 5 Teeküchen und Sozialräume", "640", "210", "220"],
          ["RG 6 Technik-, Lager- und Archivflächen", "1.480", "260", "9.600"],
          ["RG 7 Kantine und Speiseraum", "820", "–", "–"],
          ["Summe Unterhaltsreinigung", "32.800", "9.470", "12.220"],
          ["Glasflächen (beidseitig)", "14.600", "4.200", "2.100"],
        ],
        widths: [5, 2, 2, 2],
      },
      {
        t: "p",
        text: "In der Außenstelle Berlin ist ab 2026 die Einrichtung von Desk-Sharing-Flächen geplant. Für Arbeitsplätze, die von wechselnden Personen genutzt werden, gilt dann die Raumgruppe RG 1a mit täglicher Reinigung der Arbeitsflächen (Abschnitt 3.2). Die Umstellung wird mit einer Frist von acht Wochen angekündigt und nach den Einheitspreisen des Preisblatts vergütet.",
      },
      { t: "h1", text: "3. Leistungsumfang Unterhaltsreinigung" },
      { t: "h2", text: "3.1 Grundsätze" },
      {
        t: "p",
        text: "Geschuldet ist ein Reinigungsergebnis, nicht eine bestimmte Arbeitszeit. Der Auftragnehmer legt Methoden, Personaleinsatz und Arbeitsorganisation eigenverantwortlich fest, soweit diese Leistungsbeschreibung nichts anderes bestimmt. Gereinigt wird so, dass Oberflächen nach der Reinigung frei von sichtbaren Verschmutzungen, Flecken, Staub, Streifen und Rückständen von Reinigungsmitteln sind.",
      },
      { t: "h2", text: "3.2 Leistungsverzeichnis und Turnus" },
      {
        t: "table",
        header: ["Raumgruppe", "Leistung", "Turnus"],
        rows: [
          ["RG 1 Büroräume", "Papierkörbe und Wertstoffbehälter leeren, Beutel wechseln", "2 × wöchentlich"],
          ["RG 1 Büroräume", "Böden saugen bzw. feucht wischen, freigeräumte Tischflächen feucht reinigen", "1 × wöchentlich"],
          ["RG 1 Büroräume", "Türklinken, Lichtschalter und Griffbereiche desinfizierend reinigen", "1 × wöchentlich"],
          ["RG 1a Desk-Sharing-Flächen", "Arbeitsflächen, Tastaturablagen und Armlehnen reinigen", "täglich"],
          ["RG 2 Sanitärräume", "Sanitärobjekte, Armaturen, Spiegel, Fliesen im Spritzbereich, Böden reinigen; Verbrauchsmaterial auffüllen", "täglich"],
          ["RG 2 Sanitärräume", "Fliesen wandhoch und Trennwände reinigen", "monatlich"],
          ["RG 3 Verkehrsflächen", "Foyers, Eingangsbereiche und Aufzugskabinen reinigen", "täglich"],
          ["RG 3 Verkehrsflächen", "Flure saugen bzw. wischen", "2 × wöchentlich"],
          ["RG 3 Verkehrsflächen", "Treppenhäuser einschließlich Handläufe reinigen", "1 × wöchentlich"],
          ["RG 4 Besprechungsräume", "nach Belegung laut Raumbuchungssystem, mindestens", "2 × wöchentlich"],
          ["RG 5 Teeküchen und Sozialräume", "Arbeitsflächen, Spülen, Fronten, Böden reinigen; Spülmaschinen ausräumen", "täglich"],
          ["RG 6 Technik und Lager", "Böden kehren bzw. wischen, Spinnweben entfernen", "monatlich"],
          ["RG 7 Kantine", "Speiseraum, Tische, Stühle und Böden reinigen (nach der Essensausgabe, 14:30 bis 16:00 Uhr)", "täglich"],
        ],
        widths: [3, 6, 2],
      },
      {
        t: "p",
        text: "Die Reinigung von Küchen- und Ausgabebereichen der Kantine ist Aufgabe des Kantinenbetreibers und nicht Gegenstand dieses Vertrags. Serverräume und Sicherheitsbereiche werden nur in Begleitung von Beschäftigten des Auftraggebers und nach gesonderter Anforderung gereinigt.",
      },
      { t: "h1", text: "4. Glasreinigung" },
      {
        t: "ul",
        items: [
          "Außenflächen der Fenster einschließlich Rahmen: 2 × jährlich (April und Oktober)",
          "Innenflächen der Fenster einschließlich Rahmen und Fensterbänke: 1 × jährlich",
          "Glastüren und Glasflächen in Eingangsbereichen: monatlich, Griffbereiche wöchentlich",
          "Glasdächer und schwer zugängliche Flächen (Los 1, Haus B, Atrium): 1 × jährlich mit Hubarbeitsbühne; die Kosten für Gerät und Absicherung sind einzurechnen",
        ],
      },
      { t: "h1", text: "5. Sonder- und Grundreinigungen" },
      {
        t: "p",
        text: "Grundreinigungen von Bodenbelägen (Einpflege, Teppichsprühextraktion) und Sonderreinigungen nach Baumaßnahmen, Veranstaltungen oder Wasserschäden werden gesondert abgerufen und nach den Einheitspreisen des Preisblatts vergütet. Der Auftragnehmer legt vor Beginn ein Angebot über den Aufwand vor. Bei Gefahr im Verzug (z. B. Wasserschaden) beginnt er spätestens vier Stunden nach Anforderung.",
      },
      { t: "h1", text: "6. Reinigungszeiten" },
      {
        t: "ul",
        items: [
          "Unterhaltsreinigung montags bis freitags zwischen 6:00 und 9:00 Uhr sowie zwischen 16:00 und 20:00 Uhr",
          "Sanitärräume in Haus A (Los 1) und in der Außenstelle Berlin zusätzlich eine Zwischenreinigung zwischen 12:00 und 13:00 Uhr",
          "Kantine (Los 1): 14:30 bis 16:00 Uhr",
          "Abweichungen nur nach vorheriger Abstimmung mit der Objektbetreuung des Auftraggebers",
        ],
      },
      { t: "h1", text: "7. Personal" },
      {
        t: "ol",
        items: [
          "Der Auftragnehmer benennt für jedes Los eine Objektleitung mit Erfahrung in vergleichbaren Objekten. Sie ist werktags von 7:00 bis 17:00 Uhr telefonisch erreichbar und nimmt an den Qualitätskontrollen teil.",
          "Das Reinigungspersonal ist nach dem jeweils geltenden allgemeinverbindlichen Tarifvertrag für das Gebäudereinigerhandwerk zu vergüten. Der Auftragnehmer legt auf Verlangen Nachweise vor.",
          "Für Bereiche mit erhöhtem Schutzbedarf (Los 1, Haus C, 3. OG; Rechenzentrumsnahe Flächen) dürfen nur Personen eingesetzt werden, die eine Sicherheitsüberprüfung nach dem Sicherheitsüberprüfungsgesetz (SÜG) durchlaufen haben. Der Auftraggeber leitet die Überprüfung ein; der Auftragnehmer plant eine Vorlaufzeit von acht Wochen ein.",
          "Das Personal trägt einheitliche Dienstkleidung mit Firmenlogo und einen Dienstausweis des Auftraggebers.",
          "Personalwechsel in der Objektleitung sind mindestens zwei Wochen vorher anzuzeigen. Der Auftraggeber kann den Austausch von Personal verlangen, wenn ein wichtiger Grund vorliegt.",
        ],
      },
      { t: "h1", text: "8. Qualitätssicherung" },
      { t: "h2", text: "8.1 Qualitätsmesssystem" },
      {
        t: "p",
        text: "Die Reinigungsqualität wird mit einem Qualitätsmesssystem in Anlehnung an DIN EN 13549 überprüft. Geprüft werden Stichproben von Räumen je Raumgruppe; die Stichprobengröße richtet sich nach der Zahl der Räume der jeweiligen Liegenschaft (mindestens 20 Räume je Kontrolle).",
      },
      { t: "h2", text: "8.2 Durchführung der Kontrollen" },
      {
        t: "p",
        text: "Kontrollen finden mindestens monatlich je Los statt, nach Wahl des Auftraggebers angekündigt oder unangekündigt. Die Objektleitung des Auftragnehmers ist zur Teilnahme berechtigt; bei angekündigten Kontrollen ist sie dazu verpflichtet. Das Ergebnis wird in einem Kontrollprotokoll festgehalten, das beide Seiten unterzeichnen. Verweigert die Objektleitung die Unterschrift, wird dies im Protokoll vermerkt.",
      },
      { t: "h2", text: "8.3 Bewertung" },
      {
        t: "p",
        text: "Für jeden geprüften Raum werden die Prüfpunkte der Raumgruppe bewertet. Die **Mängelquote** ist der Anteil der mangelhaften Prüfpunkte an allen geprüften Prüfpunkten einer Kontrolle. Die Toleranzgrenze beträgt **5 Prozent**. Für die Bewertung eines Kalendermonats wird der Durchschnitt der Mängelquoten aller Kontrollen des Monats im jeweiligen Los herangezogen.",
      },
      { t: "h2", text: "8.4 Nachbesserung, Minderung und Vertragsstrafe" },
      {
        t: "ol",
        items: [
          "Festgestellte Mängel sind innerhalb von 24 Stunden nach Mitteilung kostenfrei zu beseitigen (Nachreinigung). Mängel in Sanitärräumen sind innerhalb von vier Stunden zu beseitigen, wenn die Mitteilung bis 14:00 Uhr eingeht.",
          "Überschreitet die durchschnittliche Mängelquote eines Monats die Toleranzgrenze, mindert sich die Monatsvergütung des betroffenen Loses wie folgt: Mängelquote über 5 bis 10 Prozent: 3 Prozent; über 10 bis 15 Prozent: 5 Prozent; über 15 Prozent: 10 Prozent.",
          "Für jeden Fall einer nicht oder nicht fristgerecht durchgeführten Nachreinigung wird eine **Vertragsstrafe** von 150 Euro fällig. Die Vertragsstrafen eines Monats sind auf 5 Prozent der Netto-Monatsvergütung des betroffenen Loses begrenzt.",
          "Minderung und Vertragsstrafe werden mit der nächsten Rechnung verrechnet. Weitergehende Ansprüche des Auftraggebers bleiben unberührt.",
          "Liegt die Mängelquote in drei aufeinanderfolgenden Monaten über 15 Prozent, kann der Auftraggeber den Vertrag für das betroffene Los aus wichtigem Grund kündigen.",
        ],
      },
      { t: "h2", text: "8.5 Dokumentation und Berichtswesen" },
      {
        t: "p",
        text: "Der Auftragnehmer führt je Los ein Reinigungstagebuch (Datum, eingesetztes Personal, Abweichungen, Nachreinigungen) und stellt es dem Auftraggeber monatlich bis zum fünften Arbeitstag des Folgemonats elektronisch zur Verfügung. Quartalsweise findet ein Qualitätsgespräch mit der Objektbetreuung des Auftraggebers statt.",
      },
      { t: "h1", text: "9. Reinigungsmittel, Geräte und Nachhaltigkeit" },
      {
        t: "ul",
        items: [
          "Reinigungsmittel müssen die Kriterien eines anerkannten Umweltzeichens für Reinigungsmittel erfüllen oder gleichwertig sein; Sicherheitsdatenblätter sind vor Vertragsbeginn vorzulegen.",
          "Es sind Dosiersysteme zu verwenden. Desinfektionsmittel werden nur in Sanitärräumen und an Griffbereichen eingesetzt, soweit diese Leistungsbeschreibung es vorsieht.",
          "Mikrofasertücher und Wischbezüge werden nach Farbsystem getrennt und nach jedem Einsatz aufbereitet.",
          "Hygienepapiere, Seife und Müllbeutel stellt der Auftragnehmer; Papierprodukte bestehen zu 100 Prozent aus Recyclingpapier.",
          "Abfälle sind getrennt nach Restmüll, Papier, Wertstoffen und Bioabfall in die bereitgestellten Sammelbehälter zu bringen.",
          "Reinigungsmaschinen müssen geräuscharm sein; in Büro- und Besprechungsbereichen sind akkubetriebene Geräte zu verwenden.",
        ],
      },
      { t: "h1", text: "10. Arbeitsschutz" },
      {
        t: "p",
        text: "Der Auftragnehmer ist für den Arbeitsschutz seines Personals verantwortlich. Er erstellt vor Vertragsbeginn eine Gefährdungsbeurteilung für jedes Los und unterweist sein Personal in den Brandschutz- und Alarmierungsregeln des Auftraggebers. Bei Arbeiten in Höhe, insbesondere bei der Glasreinigung, sind die einschlägigen Vorschriften der Unfallversicherungsträger einzuhalten.",
      },
      { t: "h1", text: "11. Schlüssel und Sicherheit" },
      {
        t: "p",
        text: "Schlüssel und Zutrittsausweise werden gegen Quittung an die Objektleitung ausgegeben und dürfen nicht aus der Liegenschaft entfernt werden. Bei Verlust trägt der Auftragnehmer die Kosten für den Austausch von Schließzylindern, soweit er den Verlust zu vertreten hat. Dienstliche Unterlagen, Datenträger und Bildschirminhalte dürfen nicht eingesehen, bewegt oder entsorgt werden; Papier mit erkennbar dienstlichem Inhalt außerhalb der Papierkörbe bleibt liegen.",
      },
      { t: "h1", text: "12. Übergang und Einarbeitung" },
      {
        t: "p",
        text: "Der Auftragnehmer nimmt in den letzten zwei Wochen vor Vertragsbeginn an Objektbegehungen teil und stellt bis zum 15.09.2025 einen Einsatz- und Reinigungsplan je Los vor. In den ersten drei Monaten der Vertragslaufzeit (Einarbeitungsphase) wird die Minderung nach Abschnitt 8.4 Nr. 2 nur zur Hälfte angewendet; die Vertragsstrafe nach Abschnitt 8.4 Nr. 3 gilt ab Vertragsbeginn.",
      },
      { t: "h1", text: "13. Ansprechpersonen des Auftraggebers" },
      {
        t: "table",
        header: ["Aufgabe", "Stelle"],
        rows: [
          ["Vertragsmanagement, Rechnungen, Minderung", "Referat B 3 – Rahmenverträge und zentrale Beschaffung"],
          ["Objektbetreuung, Kontrollen vor Ort", "Referat L 2 – Bau und Bauunterhaltung"],
          ["Sicherheitsüberprüfungen, Zutritt", "Referat Z 1 – Personal (Sicherheitsbevollmächtigte)"],
        ],
        widths: [4, 5],
      },
      { t: "signature", lines: ["Bonn, 11.03.2025", "", "Grote", "Referentin Rahmenverträge", "", "Mitgezeichnet: Junker (L 2), Lindqvist (B 4)"] },
    ],
  },
  {
    type: "word",
    id: "bzbl-flaechenbedarfsanalyse-aussenstelle-berlin",
    title: "Flächenbedarfsanalyse Außenstelle Berlin",
    kind: "Analyse",
    fileName: "2025-10-21 Flaechenbedarfsanalyse Aussenstelle Berlin",
    org: "bzbl",
    unit: "bzbl-l1",
    author: "bzbl-vehrenkamp",
    date: "2025-10-21",
    tags: ["zahlen", "widersprueche"],
    keywords: ["L 1 – 4120/7#2", "Belegungsmessung", "Sharing-Quote", "Kanalstraße 22", "Flächenüberhang"],
    summary:
      "Analyse des Flächenbedarfs der Außenstelle Berlin mit Belegungsmessung, Arbeitsplatz- und Flächenberechnung und Empfehlung zur Aufgabe einer angemieteten Etage. Eingebaute Widersprüche: Der Text nennt 212 Beschäftigte, die Tabelle ergibt 197; die Zusammenfassung behauptet, durch die Aufgabe der Anmietung würden 2.640 m² frei, die Etage hat aber nur 1.420 m².",
    meta: [
      ["Aktenzeichen", "L 1 – 4120/7#2"],
      ["Status", "Entwurf zur Abstimmung mit der Abteilungsleitung L"],
    ],
    subject: "Flächenbedarfsanalyse für die Außenstelle Berlin (Kanalstraße 18 und 22) als Grundlage für das Desk-Sharing-Konzept",
    blocks: [
      { t: "h1", text: "Zusammenfassung" },
      {
        t: "p",
        text: "In der Außenstelle Berlin arbeiten derzeit **212 Beschäftigte** (179,4 Vollzeitäquivalente) auf 5.680 m² Bürofläche. Die Belegungsmessung im September und Oktober 2025 ergab eine durchschnittliche Auslastung der Arbeitsplätze von 46 Prozent, an Spitzentagen von 68 Prozent. Mit einer Sharing-Quote von 0,7 für die Bereiche mit mobiler Arbeit reichen 154 Arbeitsplätze aus. Der Flächenbedarf sinkt auf rund 3.040 m².",
      },
      {
        t: "p",
        text: "**Empfehlung:** Die angemietete Etage in der Kanalstraße 22 wird zum Mietende am 31.12.2027 aufgegeben. Dadurch werden rund 2.640 m² frei und jährlich rund 409.000 € Kaltmiete sowie 86.000 € Nebenkosten eingespart. Voraussetzung ist die Einführung von Desk-Sharing in der Kanalstraße 18 bis spätestens Mitte 2027.",
      },
      { t: "h1", text: "1. Anlass" },
      {
        t: "p",
        text: "Der Mietvertrag für die Etage im 3. OG der Kanalstraße 22 läuft am 31.12.2027 aus; über eine Verlängerung muss bis zum 30.06.2026 entschieden werden. Der Energiebericht 2024 empfiehlt, zwei angemietete Standorte bis 2028 aufzugeben. Zugleich hat sich die Arbeitsweise seit 2020 grundlegend verändert: Die meisten Beschäftigten arbeiten an zwei bis drei Tagen pro Woche mobil. Die Amtsleitung hat Referat L 1 daher beauftragt, den tatsächlichen Flächenbedarf der Außenstelle zu ermitteln.",
      },
      { t: "h1", text: "2. Bestand" },
      {
        t: "table",
        header: ["Gebäude", "Nutzung", "Bürofläche (m²)", "Eigentum / Miete"],
        rows: [
          ["Kanalstraße 18, EG bis 5. OG", "Büro, Besprechung, IT-Werkstatt, Poststelle", "4.260", "Bundesliegenschaft, Baujahr 1974"],
          ["Kanalstraße 22, 3. OG", "Büro (Servicecenter, Teile Z 4)", "1.420", "angemietet, Kaltmiete 24,00 €/m² und Monat, Mietende 31.12.2027"],
          ["Summe", "", "5.680", ""],
        ],
        widths: [3, 4, 2, 4],
      },
      {
        t: "table",
        header: ["Organisationseinheit", "Beschäftigte", "VZÄ", "Arbeitsplätze heute", "Ø mobile Tage pro Woche"],
        rows: [
          ["Referat B 2 – IT-Beschaffung (Team Berlin)", "34", "31,2", "34", "2,1"],
          ["Referat B 3 – Rahmenverträge (Team Berlin)", "28", "25,6", "28", "2,3"],
          ["Servicecenter Bedarfsträger (Abteilung B)", "38", "31,4", "38", "1,2"],
          ["Referat L 1 – Flächenmanagement (Team Berlin)", "12", "11,0", "12", "2,0"],
          ["Referat L 2 – Bauleitung Berlin", "22", "20,8", "22", "1,4"],
          ["Referat Z 4 – IT-Service Berlin", "46", "43,5", "46", "1,6"],
          ["Querschnitt (Poststelle, Hausdienst, Empfang)", "17", "15,9", "17", "0,1"],
          ["Summe", "197", "179,4", "197", ""],
        ],
        widths: [5, 2, 2, 2, 2],
      },
      {
        t: "p",
        text: "Jede beschäftigte Person verfügt heute über einen eigenen Arbeitsplatz, überwiegend in Einzel- und Zweierbüros. Rechnerisch entfallen rund 29 m² Bürofläche auf jede beschäftigte Person; der Richtwert für Neuplanungen liegt bei 12 m² je Arbeitsplatz zuzüglich Kommunikations- und Sonderflächen.",
      },
      { t: "h1", text: "3. Belegungsmessung" },
      {
        t: "p",
        text: "Vom 15.09. bis 10.10.2025 wurde die Belegung aller Arbeitsplätze mit anonymen Präsenzsensoren gemessen. Erfasst wurde im 15-Minuten-Raster nur „belegt“ oder „frei“; eine Zuordnung zu Personen ist technisch ausgeschlossen. Die Messung wurde vorab mit dem Personalrat abgestimmt. Ein Arbeitsplatz galt als belegt, wenn er zwischen 9:00 und 15:00 Uhr mindestens zwei Stunden genutzt wurde.",
      },
      {
        t: "table",
        header: ["Wochentag", "Ø Belegung", "höchster Wert im Messzeitraum"],
        rows: [
          ["Montag", "44 %", "51 %"],
          ["Dienstag", "68 %", "74 %"],
          ["Mittwoch", "55 %", "63 %"],
          ["Donnerstag", "45 %", "52 %"],
          ["Freitag", "18 %", "24 %"],
          ["Durchschnitt", "46 %", ""],
        ],
        widths: [3, 2, 3],
      },
      {
        t: "p",
        text: "Der Dienstag ist durch Teambesprechungen und Jours fixes geprägt. Der Höchstwert von 74 Prozent wurde am 30.09.2025 während einer Schulungswoche des Servicecenters gemessen. Besprechungsräume waren dienstags und mittwochs zwischen 10:00 und 12:00 Uhr zu mehr als 90 Prozent ausgebucht; hier besteht eher Mehr- als Minderbedarf.",
      },
      { t: "h1", text: "4. Arbeitsplatzbedarf" },
      {
        t: "table",
        header: ["Bereich", "Beschäftigte", "Faktor", "Arbeitsplätze"],
        rows: [
          ["Bereiche mit Desk-Sharing (B 2, B 3, L 1, L 2, Z 4)", "142", "0,7", "99"],
          ["Feste Arbeitsplätze (Servicecenter, Querschnitt)", "55", "1,0", "55"],
          ["Summe", "197", "", "154"],
        ],
        widths: [5, 2, 1, 2],
      },
      {
        t: "p",
        text: "Das Servicecenter erhält feste Arbeitsplätze, weil dort mit Headset und zwei Bildschirmen im Schichtbetrieb gearbeitet wird. Für Beschäftigte mit Schwerbehinderung oder besonderer Arbeitsplatzausstattung werden persönliche Arbeitsplätze vorgehalten; sie sind im Faktor 1,0 nicht enthalten und werden aus der Reserve gedeckt (derzeit 6 Plätze).",
      },
      { t: "h1", text: "5. Flächenbedarf" },
      {
        t: "table",
        header: ["Flächenart", "Berechnung", "Fläche (m²)"],
        rows: [
          ["Arbeitsplatzflächen", "154 Arbeitsplätze × 12 m²", "1.848"],
          ["Kommunikations- und Rückzugsflächen", "25 % der Arbeitsplatzflächen (Besprechung, Fokusräume, Telefonboxen)", "462"],
          ["Teamflächen, Ablage, Schließfächer", "pauschal", "210"],
          ["Sonderflächen", "IT-Werkstatt 180, Lager 120, Poststelle 60, Archiv 160", "520"],
          ["Summe Bedarf", "", "3.040"],
          ["Bestand", "Kanalstraße 18 und 22", "5.680"],
          ["Flächenüberhang", "", "2.640"],
        ],
        widths: [4, 6, 2],
      },
      { t: "h1", text: "6. Bewertung und Varianten" },
      {
        t: "ol",
        items: [
          "**Variante A – Bestand beibehalten, Anmietung verlängern:** keine Umbaukosten, aber dauerhaft rund 495.000 € Miet- und Nebenkosten pro Jahr für Flächen, die nicht benötigt werden. Nicht empfohlen.",
          "**Variante B – Anmietung aufgeben, Desk-Sharing in der Kanalstraße 18:** Umbaukosten nach erster Schätzung 1,1 Mio. € (Teamzonen, Fokusräume, Schließfächer, Akustik), Einsparung rund 495.000 € pro Jahr. Amortisation nach gut zwei Jahren. Der verbleibende Überhang von rund 1.220 m² wird Behörden des Geschäftsbereichs angeboten. **Empfohlen.**",
          "**Variante C – Vollständige Verlagerung in einen Neubau:** langfristig wirtschaftlich denkbar, aber vor 2032 nicht realisierbar. Als Option für die Liegenschaftsplanung vormerken.",
        ],
      },
      { t: "h1", text: "7. Risiken" },
      {
        t: "ul",
        items: [
          "Akzeptanz bei den Beschäftigten: frühe Beteiligung und eine Dienstvereinbarung mit dem Personalrat sind erforderlich.",
          "Spitzenbelegung am Dienstag: Die Teams sollten ihre Präsenztage abstimmen, sonst reichen 154 Plätze an einzelnen Tagen nicht.",
          "Zeitplan: Der Umbau in der Kanalstraße 18 muss bis Mitte 2027 abgeschlossen sein; Verzögerungen erzwingen eine kurzfristige Verlängerung der Anmietung zu voraussichtlich höheren Konditionen.",
          "Energie: Die Aufgabe der Anmietung senkt den Wärme- und Stromverbrauch.",
        ],
      },
      { t: "h1", text: "8. Nächste Schritte" },
      {
        t: "ul",
        items: [
          "Abstimmung der Analyse mit der Abteilungsleitung L bis 31.10.2025",
          "Desk-Sharing-Konzept für die Abteilungsleitungsrunde im November 2025",
          "Information des Personalrats und Vorbereitung einer Dienstvereinbarung",
          "Entscheidung über die Nichtverlängerung der Anmietung bis 30.06.2026",
        ],
      },
      { t: "signature", lines: ["Berlin, 21.10.2025", "", "Vehrenkamp", "Referent Flächenmanagement", "", "Mitgezeichnet: Dahl (RL L 1)"] },
    ],
  },
  {
    type: "word",
    id: "bzbl-gespraechsvermerk-kantinenneuvergabe-bonn",
    title: "Gesprächsvermerk Kantinenkommission: Neuvergabe der Kantine am Dienstsitz Bonn",
    kind: "Gesprächsvermerk",
    fileName: "2026-07-07 Gespraechsvermerk Kantinenkommission Neuvergabe",
    org: "bzbl",
    unit: "bzbl-b3",
    author: "bzbl-akbulut",
    date: "2026-07-07",
    tags: ["unstrukturiert"],
    keywords: ["Kantinenkommission", "Dienstleistungskonzession", "31.12.2026", "Spülstraße", "Interimslösung"],
    summary:
      "Stichpunktartiger Vermerk über eine Sitzung der Kantinenkommission zur Neuvergabe der Kantine: Essenszahlen, Wünsche von Personalrat und Beschäftigten, offene Fragen zu Verfahren und Küchentechnik, Aufgaben mit Fristen – gut zum Ausformulieren, Ordnen oder Ableiten einer To-do-Liste.",
    meta: [["Aktenzeichen", "B 3 – 0645.2/26"]],
    subject: "Sitzung der Kantinenkommission am 02.07.2026 – Neuvergabe der Kantinenbewirtschaftung ab 01.01.2027",
    blocks: [
      {
        t: "p",
        text: "TN: Fr. Akbulut (B 3, Protokoll), Hr. Dr. Hübner (AL B, bis 10:45), Fr. Hellwig (PR), Fr. Hövelmann (GB), Hr. Vehrenkamp (L 1), Hr. Otte, Fr. Bilgin (Kantinenausschuss). Pächter nicht eingeladen!",
      },
      { t: "h3", text: "1. Stand" },
      {
        t: "ul",
        items: [
          "Pachtvertrag endet **31.12.2026**, Option nicht gezogen – Betreiber nur mit Zuschuss oder höheren Preisen",
          "Essenszahlen Ø 310/Tag (2019: 420!), Mo + Fr nur ca. 190",
          "Hauptgericht 4,90–6,40 €; Beschwerden: Qualität, Schlange 12:00–12:30",
          "Spülstraße Bj. 2009, 3× ausgefallen seit Mai",
        ],
      },
      { t: "h3", text: "2. Diskussion" },
      {
        t: "ul",
        items: [
          "AL B: **Dienstleistungskonzession**, Umsatz grob 1,9 Mio. € in 4 J. → unter EU-Schwelle, national mit Teilnahmewettbewerb (B 4 fragen)",
          "PR: vorher Beschäftigtenbefragung, PR zeichnet Fragebogen mit",
          "GB: Teilzeitkräfte → Öffnung ab 11:15 statt 11:45",
          "Hr. Otte: täglich vegetarisch, 1× pro Woche vegan, Mehrweg bei To-go",
          "L 1: Akustik Speiseraum schlecht (Mängelliste L 2, nur Prio 4). Küchentechnik/Spülstraße ca. 180.000 € – zahlt Bund oder Pächter??",
          "mobiles Arbeiten → eher mit 280 Essen/Tag kalkulieren",
        ],
      },
      { t: "h3", text: "3. Verabredungen" },
      {
        t: "ul",
        items: [
          "B 4 (Hr. Lindqvist): Verfahrensart + Zeitplan bis 17.07.",
          "B 3 (Fr. Akbulut): Entwurf Leistungsbeschreibung bis 14.08. (Bio-Anteil 20 %?)",
          "PR + Kantinenausschuss: Befragung, Ergebnis bis 31.08.",
          "L 2 (Fr. Junker): Kosten Küchentechnik bis 31.07.",
          "falls nicht bis 31.12.: **Interimslösung** (Catering) – AL B entscheidet im September",
          "nächste Sitzung: 10.09.2026, 10:00 Uhr",
        ],
      },
      { t: "signature", lines: ["gez. Akbulut, 07.07.2026"] },
    ],
  },
  {
    type: "powerpoint",
    id: "bzbl-desk-sharing-konzept-aussenstelle-berlin",
    title: "Desk-Sharing-Konzept Außenstelle Berlin",
    kind: "Präsentation",
    fileName: "Desk-Sharing-Konzept Aussenstelle Berlin Entwurf",
    org: "bzbl",
    unit: "bzbl-l1",
    author: "bzbl-dahl",
    date: "2025-11-26",
    keywords: ["Sharing-Quote", "Clean Desk", "Teamzonen", "Dienstvereinbarung", "Schließfächer"],
    summary:
      "Kurze Präsentation für die Abteilungsleitungsrunde: Gründe, Belegungsmessung, Eckpunkte und Zeitplan für Desk-Sharing in der Außenstelle Berlin – Anlass für den Einwand des Personalrats; gut für Fragen- und Antwortlisten oder eine Fassung für die Beschäftigten.",
    slides: [
      { t: "title", title: "Desk-Sharing in der Außenstelle Berlin", subtitle: "Entwurf für die Abteilungsleitungsrunde am 27. November 2025" },
      {
        t: "bullets",
        title: "Warum Desk-Sharing?",
        bullets: [
          "Arbeitsplätze im Durchschnitt nur zu 46 % belegt",
          "Anmietung Kanalstraße 22 endet am 31.12.2027 – Entscheidung bis 30.06.2026",
          "Einsparung rund 495.000 € Miet- und Nebenkosten pro Jahr",
          "Mehr Besprechungs- und Rückzugsräume statt leerer Einzelbüros",
        ],
      },
      {
        t: "chart",
        title: "Belegung nach Wochentagen",
        chart: {
          type: "bar",
          categories: ["Mo", "Di", "Mi", "Do", "Fr"],
          series: [{ name: "Ø Belegung in %", values: [44, 68, 55, 45, 18] }],
          unit: "%",
        },
        caption: "Messung mit anonymen Präsenzsensoren vom 15.09. bis 10.10.2025",
      },
      {
        t: "bullets",
        title: "Eckpunkte",
        bullets: [
          "**Sharing-Quote 0,7:** sieben Arbeitsplätze für zehn Beschäftigte",
          "Teamzonen je Referat – jedes Team hat seinen Heimatbereich",
          "Buchung über das Raumbuchungssystem, keine Auswertung personenbezogener Buchungsdaten",
          "Persönliche Schließfächer, Clean Desk am Abend",
          "Feste Plätze: Servicecenter, Querschnitt, Beschäftigte mit besonderer Ausstattung",
        ],
        notes: "Die Sharing-Quote gilt nur für B 2, B 3, L 1, L 2 und Z 4. Bedarf laut Flächenbedarfsanalyse: 154 Arbeitsplätze.",
      },
      {
        t: "table",
        title: "Zeitplan (Entwurf)",
        header: ["Schritt", "Termin"],
        rows: [
          ["Information des Personalrats", "Dezember 2025"],
          ["Beschäftigtenbefragung und Dienstvereinbarung", "Januar bis März 2026"],
          ["Pilot auf zwei Etagen der Kanalstraße 18", "ab 01.04.2026"],
          ["Umbau der übrigen Etagen", "2026/2027"],
          ["Rückgabe der Anmietung Kanalstraße 22", "31.12.2027"],
        ],
      },
      { t: "end", title: "Fragen und Anregungen", lines: ["Henrik Dahl · Referat L 1 – Flächenmanagement"] },
    ],
  },
  {
    type: "excel",
    id: "bzbl-fuhrpark-co2-umstellung-e-fahrzeuge",
    title: "Fuhrpark: Bestand, CO₂-Bilanz und Umstellung auf E-Fahrzeuge 2026–2030",
    kind: "Planungsübersicht",
    fileName: "Fuhrpark Bestand CO2 und E-Umstellung 2026-2030",
    org: "bzbl",
    unit: "bzbl-b3",
    author: "bzbl-tjaden",
    date: "2026-02-17",
    tags: ["zahlen", "widersprueche"],
    keywords: ["FZ-07", "Emissionsfaktor", "Selbstversicherung des Bundes", "Umstellungsplan", "Ladepunkte"],
    summary:
      "Fuhrparkübersicht mit 20 Fahrzeugen, CO₂-Berechnung per Formel, Kostenvergleich Benzin gegen Elektro über sechs Jahre und Umstellungsplan bis 2030. Eingebaute Widersprüche: Die Notiz nennt 22 Fahrzeuge (Liste: 20) und verspricht eine Minderung um 62 t auf 8 t (– 88 %), die Formeln ergeben 35 t Minderung und 34,5 t Restemissionen (– 50 %).",
    sheets: [
      {
        name: "Bestand",
        title: "Fuhrpark des BZBL – Bestand und CO₂-Emissionen 2025",
        subtitle: "Stand 31.12.2025 · Referat B 3, Fuhrparkmanagement",
        columns: [
          { header: "FZ-Nr.", width: 8 },
          { header: "Standort", width: 20 },
          { header: "Fahrzeugklasse", width: 24 },
          { header: "Antrieb", width: 15 },
          { header: "Baujahr", width: 9 },
          { header: "Fahrleistung 2025 (km)", width: 13, fmt: "int" },
          { header: "Verbrauch je 100 km", width: 11, fmt: "dec" },
          { header: "Einheit", width: 8 },
          { header: "Emissionsfaktor (kg CO₂ je Einheit)", width: 14 },
          { header: "CO₂ 2025 (t)", width: 11, fmt: "dec" },
          { header: "Austausch geplant", width: 12 },
        ],
        rows: [
          ["FZ-01", "Bonn", "Pkw Mittelklasse", "Diesel", "2018", 21400, 5.9, "l", 2.65, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2028"],
          ["FZ-02", "Bonn", "Pkw Mittelklasse", "Diesel", "2019", 18900, 5.7, "l", 2.65, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2028"],
          ["FZ-03", "Bonn", "Pkw Kompakt", "Benzin", "2017", 9800, 6.8, "l", 2.37, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2026"],
          ["FZ-04", "Bonn", "Pkw Kompakt", "Hybrid (Benzin)", "2021", 14200, 4.9, "l", 2.37, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2029"],
          ["FZ-05", "Bonn", "Pkw Kompakt", "Elektro", "2023", 16700, 16.5, "kWh", 0.38, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "–"],
          ["FZ-06", "Bonn", "Pkw Kompakt", "Elektro", "2024", 12300, 15.8, "kWh", 0.38, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "–"],
          ["FZ-07", "Bonn", "Transporter", "Diesel", "2016", 11600, 9.4, "l", 2.65, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2026"],
          ["FZ-08", "Bonn", "Kleinbus (9 Sitze)", "Diesel", "2019", 8400, 8.8, "l", 2.65, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2029"],
          ["FZ-09", "Bonn", "Pkw Oberklasse (Präsident)", "Elektro", "2024", 34800, 19.8, "kWh", 0.38, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "–"],
          ["FZ-10", "Berlin", "Pkw Kompakt", "Benzin", "2018", 10900, 6.6, "l", 2.37, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2027"],
          ["FZ-11", "Berlin", "Pkw Kompakt", "Elektro", "2023", 9700, 15.9, "kWh", 0.38, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "–"],
          ["FZ-12", "Berlin", "Transporter", "Diesel", "2017", 7300, 9.1, "l", 2.65, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2027"],
          ["FZ-13", "Berlin", "Pkw Mittelklasse", "Diesel", "2020", 17800, 5.5, "l", 2.65, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2029"],
          ["FZ-14", "Logistikzentrum Nord", "Transporter", "Diesel", "2018", 24600, 9.8, "l", 2.65, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2028"],
          ["FZ-15", "Logistikzentrum Nord", "Transporter", "Diesel", "2020", 22100, 9.3, "l", 2.65, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2029"],
          ["FZ-16", "Logistikzentrum Nord", "Lkw 7,5 t", "Diesel", "2015", 31800, 18.6, "l", 2.65, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2030"],
          ["FZ-17", "Logistikzentrum Nord", "Lkw 7,5 t", "Diesel", "2019", 28400, 17.9, "l", 2.65, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "nach 2030"],
          ["FZ-18", "Logistikzentrum Nord", "Pkw Kompakt", "Diesel", "2017", 12600, 5.4, "l", 2.65, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2027"],
          ["FZ-19", "Logistikzentrum Nord", "Pkw Kompakt", "Elektro", "2025", 6200, 16.1, "kWh", 0.38, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "–"],
          ["FZ-20", "Bonn", "Kastenwagen (Hausdienst)", "Benzin", "2016", 4900, 8.2, "l", 2.37, { f: "ROUND(F{r}*G{r}/100*I{r}/1000,1)" }, "2026"],
          { total: true, cells: ["Summe", "", "", "", "", { f: "SUM(F{first}:F{last})" }, null, "", null, { f: "SUM(J{first}:J{last})" }, ""] },
        ],
        notes: [
          "Bestand zum 31.12.2025: 22 Fahrzeuge, davon 5 mit Elektroantrieb.",
          "Emissionsfaktoren: Diesel 2,65 kg CO₂/l, Benzin 2,37 kg CO₂/l, Strom 0,38 kg CO₂/kWh (Strommix, ohne Vorkette).",
          "FZ-07: Hauptuntersuchung im März 2026 ohne Plakette zu erwarten (Rost am Rahmen) – Austausch vorziehen.",
        ],
      },
      {
        name: "Wirtschaftlichkeit",
        title: "Kostenvergleich Pkw Kompakt: Benzin gegen Elektro",
        subtitle: "Nutzungsdauer 6 Jahre, 15.000 km pro Jahr (90.000 km) · Beträge in Euro brutto",
        columns: [
          { header: "Kostenposition", width: 48 },
          { header: "Benzin", width: 14, fmt: "eur0" },
          { header: "Elektro", width: 14, fmt: "eur0" },
          { header: "Differenz (Elektro – Benzin)", width: 16, fmt: "eur0" },
        ],
        rows: [
          ["Anschaffungspreis (Abruf aus Rahmenvereinbarung)", 26900, 34600, { f: "C{r}-B{r}" }],
          ["Ladeinfrastruktur anteilig (Wallbox 2.400 € für 2 Fahrzeuge)", 0, 1200, { f: "C{r}-B{r}" }],
          ["Energiekosten je 100 km (6,5 l × 1,78 € bzw. 16 kWh × 0,29 €)", { f: "ROUND(6.5*1.78,2)", fmt: "eur" }, { f: "ROUND(16*0.29,2)", fmt: "eur" }, { f: "C{r}-B{r}", fmt: "eur" }],
          ["Energiekosten 6 Jahre", { f: "ROUND(B7*900,0)" }, { f: "ROUND(C7*900,0)" }, { f: "C{r}-B{r}" }],
          ["Wartung und Reparatur 6 Jahre", 4680, 2880, { f: "C{r}-B{r}" }],
          ["Kfz-Steuer 6 Jahre", 672, 0, { f: "C{r}-B{r}" }],
          ["Versicherung (entfällt – Selbstversicherung des Bundes)", 0, 0, { f: "C{r}-B{r}" }],
          ["Erlös bei Verwertung nach 6 Jahren", -6500, -7800, { f: "C{r}-B{r}" }],
          { total: true, cells: ["Gesamtkosten 6 Jahre", { f: "B5+B6+B8+B9+B10+B11+B12" }, { f: "C5+C6+C8+C9+C10+C11+C12" }, { f: "C{r}-B{r}" }] },
          { total: true, cells: ["Kosten je Kilometer", { f: "ROUND(B13/90000,3)", fmt: "eur" }, { f: "ROUND(C13/90000,3)", fmt: "eur" }, { f: "C{r}-B{r}", fmt: "eur" }] },
        ],
        notes: ["Strompreis: Liefervertrag der Liegenschaft Bonn 2026 (Arbeitspreis brutto). Kraftstoffpreis: Durchschnitt der Tankkartenabrechnung 2025."],
      },
      {
        name: "Umstellungsplan",
        title: "Umstellungsplan 2026–2030",
        subtitle: "CO₂ bisher aus Blatt „Bestand“, CO₂ neu geschätzt für das Ersatzfahrzeug mit Elektroantrieb",
        columns: [
          { header: "Jahr", width: 7 },
          { header: "auszutauschende Fahrzeuge", width: 28 },
          { header: "Anzahl", width: 8, fmt: "int" },
          { header: "davon elektrisch", width: 10, fmt: "int" },
          { header: "Investition brutto", width: 14, fmt: "eur0" },
          { header: "neue Ladepunkte", width: 10, fmt: "int" },
          { header: "CO₂ bisher (t/Jahr)", width: 12, fmt: "dec" },
          { header: "CO₂ neu (t/Jahr)", width: 12, fmt: "dec" },
          { header: "Minderung (t/Jahr)", width: 12, fmt: "dec" },
        ],
        rows: [
          ["2026", "FZ-03, FZ-07, FZ-20", 3, 3, 142000, 4, { f: "Bestand!J7+Bestand!J11+Bestand!J24" }, 2.1, { f: "G{r}-H{r}" }],
          ["2027", "FZ-10, FZ-12, FZ-18", 3, 3, 128000, 3, { f: "Bestand!J14+Bestand!J16+Bestand!J22" }, 1.6, { f: "G{r}-H{r}" }],
          ["2028", "FZ-01, FZ-02, FZ-14", 3, 3, 171000, 4, { f: "Bestand!J5+Bestand!J6+Bestand!J18" }, 3.7, { f: "G{r}-H{r}" }],
          ["2029", "FZ-04, FZ-08, FZ-13, FZ-15", 4, 4, 214000, 3, { f: "Bestand!J8+Bestand!J12+Bestand!J17+Bestand!J19" }, 3.4, { f: "G{r}-H{r}" }],
          ["2030", "FZ-16 (Lkw 7,5 t)", 1, 1, 165000, 2, { f: "Bestand!J20" }, 4.9, { f: "G{r}-H{r}" }],
          {
            total: true,
            cells: ["Summe", "", { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "SUM(F{first}:F{last})" }, { f: "SUM(G{first}:G{last})" }, { f: "SUM(H{first}:H{last})" }, { f: "SUM(I{first}:I{last})" }],
          },
          { total: true, cells: ["", "Emissionen Fuhrpark 2030", null, null, null, null, null, null, { f: "Bestand!J25-I10" }] },
          { total: true, cells: ["", "Minderung gegenüber 2025", null, null, null, null, null, null, { f: "I10/Bestand!J25", fmt: "pct" }] },
        ],
        notes: [
          "Ergebnis: Bis 2030 sinken die Fuhrpark-Emissionen um rund 62 t auf etwa 8 t CO₂ pro Jahr (– 88 %).",
          "FZ-17 (Lkw, Baujahr 2019) wird bis 2032 mit Diesel betrieben; der Einsatz von paraffinischem Diesel wird geprüft.",
          "Finanzierung: Kapitel 1810 Titel 811 01 (Erwerb von Fahrzeugen); Ladepunkte aus Titel 519 01 bzw. Baumaßnahmen L 2.",
        ],
      },
    ],
  },
  {
    type: "excel",
    id: "bzbl-inventurliste-it-geraete-2025",
    title: "Inventurliste IT-Geräte – Stichtag 15.12.2025",
    kind: "Inventurliste",
    fileName: "Inventur IT-Geraete Stichtag 2025-12-15",
    org: "bzbl",
    unit: "bzbl-z4",
    author: "bzbl-szymanski",
    date: "2025-12-19",
    tags: ["zahlen", "personendaten"],
    keywords: ["Stichtag 15.12.2025", "Restbuchwert", "nicht auffindbar", "B4-2025-117", "Logistikzentrum Nord"],
    summary:
      "Lange Inventurliste mit 150 IT-Geräten (Inventarnummer, Seriennummer, Standort, Raum, Nutzerin oder Nutzer, Status, Anschaffungs- und Restbuchwert per Formel) und Auswertungen nach Gerätetyp und Status. Enthält Namen von Beschäftigten mit Raum und Organisationseinheit – gut zum Filtern, Auswerten und Anonymisieren; drei Geräte sind nicht auffindbar.",
    sheets: [
      {
        name: "Inventar",
        title: "Inventurliste IT-Geräte – Stichtag 15.12.2025",
        subtitle: "Referat Z 4 · Restbuchwert linear nach Nutzungsdauer, Stand 31.12.2025 · nur für den Dienstgebrauch",
        columns: [
          { header: "Inventar-Nr.", width: 18 },
          { header: "Gerätetyp", width: 16 },
          { header: "Bezeichnung", width: 40 },
          { header: "Seriennummer", width: 13 },
          { header: "Beschaffungsjahr", width: 10 },
          { header: "Standort", width: 24 },
          { header: "Raum", width: 10 },
          { header: "Nutzerin/Nutzer", width: 20 },
          { header: "Org.-Einheit", width: 9 },
          { header: "Status", width: 34 },
          { header: "Nutzungsdauer (Jahre)", width: 10, fmt: "int" },
          { header: "Alter (Jahre)", width: 8, fmt: "int" },
          { header: "Anschaffungswert", width: 13, fmt: "eur" },
          { header: "Restbuchwert", width: 13, fmt: "eur" },
        ],
        rows: [
          ...INVENTUR_ZEILEN,
          { total: true, cells: ["Summe", { f: "COUNTA(A{first}:A{last})", fmt: "int" }, "Geräte", "", "", "", "", "", "", "", null, null, { f: "SUM(M{first}:M{last})" }, { f: "SUM(N{first}:N{last})" }] },
        ],
        notes: [
          "Inventur durch Referat Z 4 vom 01. bis 15.12.2025 (Sichtprüfung vor Ort, Abgleich mit dem Inventarverzeichnis).",
          "Status „nicht auffindbar“: Verbleib bis 31.01.2026 klären, danach Verlustmeldung an Referat Z 2.",
          "Notebooks der Generationen 2020 und 2021 werden 2026 über die Rahmenvereinbarung B4-2025-117 ersetzt.",
        ],
      },
      {
        name: "Auswertung Gerätetyp",
        title: "Auswertung nach Gerätetyp",
        subtitle: "Werte aus dem Blatt „Inventar“ (eingefügt) · Abgleich in der letzten Zeile",
        columns: [
          { header: "Gerätetyp", width: 22 },
          { header: "Anzahl", width: 9, fmt: "int" },
          { header: "Anschaffungswert", width: 15, fmt: "eur" },
          { header: "Restbuchwert", width: 15, fmt: "eur" },
          { header: "Restwertquote", width: 12, fmt: "pct" },
        ],
        rows: [
          ...INV_TYPEN.map((t): CellSpec[] => {
            const xs = INVENTUR.filter((x) => x.typ === t);
            return [t, xs.length, invSumme(xs, (x) => x.preis), invSumme(xs, (x) => x.rest), { f: "IF(C{r}=0,0,D{r}/C{r})" }];
          }),
          { total: true, cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "D{r}/C{r}" }] },
          { total: true, cells: ["Abgleich Blatt „Inventar“", { f: "COUNTA(Inventar!A5:A154)" }, { f: "SUM(Inventar!M5:M154)" }, { f: "SUM(Inventar!N5:N154)" }, null] },
        ],
      },
      {
        name: "Status nach Standort",
        title: "Geräte nach Status und Standort",
        subtitle: "Anzahl Geräte",
        columns: [
          { header: "Status", width: 38 },
          ...INV_STANDORTE.map((s) => ({ header: s.name, width: 14, fmt: "int" as const })),
          { header: "Summe", width: 9, fmt: "int" },
        ],
        rows: [
          ...INV_STATUS.map((st): CellSpec[] => [st, ...INV_STANDORTE.map((s) => INVENTUR.filter((x) => x.status === st && x.standort === s.name).length), { f: "SUM(B{r}:F{r})" }]),
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "SUM(F{first}:F{last})" }, { f: "SUM(G{first}:G{last})" }],
          },
        ],
        notes: ["Geräte im Lager sind keiner Person zugeordnet. Gemeinschaftsgeräte (Multifunktionsgeräte, Konferenzsysteme) werden der Org.-Einheit des Aufstellraums zugeordnet."],
      },
    ],
  },
  {
    type: "excel",
    id: "bzbl-vergabestatistik-2025",
    title: "Vergabestatistik 2025 nach Verfahrensarten und Leistungsbereichen",
    kind: "Statistik",
    fileName: "Vergabestatistik 2025 BZBL",
    org: "bzbl",
    unit: "bzbl-b4",
    author: "bzbl-lindqvist",
    date: "2026-01-29",
    tags: ["zahlen"],
    keywords: ["Verhandlungsvergabe ohne Teilnahmewettbewerb", "Direktaufträge", "Nachprüfungsverfahren", "Abrufe aus Rahmenvereinbarungen", "Nachhaltigkeitskriterien"],
    summary:
      "Vergabestatistik des Jahres 2025 mit 4.350 Vorgängen und 184 Mio. € Auftragswert: Verfahrensarten mit Anteilen, Quartalsverteilung mit Abgleich und Leistungsbereiche mit Nachhaltigkeitsquote – Grundlage des Beschaffungsberichts, gut für Diagramme, Kennzahlen und Plausibilitätsprüfungen.",
    sheets: [
      {
        name: "Verfahrensarten",
        title: "Vergaben 2025 nach Verfahrensart",
        subtitle: "Abgeschlossene Verfahren (Zuschlag 01.01.–31.12.2025) · Auftragswerte netto in Euro · Referat B 4",
        columns: [
          { header: "Bereich", width: 12 },
          { header: "Verfahrensart", width: 46 },
          { header: "Anzahl", width: 9, fmt: "int" },
          { header: "Anteil Anzahl", width: 10, fmt: "pct" },
          { header: "Auftragswert", width: 15, fmt: "eur0" },
          { header: "Anteil Wert", width: 10, fmt: "pct" },
          { header: "Ø Auftragswert", width: 13, fmt: "eur0" },
          { header: "Ø Dauer (Tage)", width: 9, fmt: "int" },
          { header: "Ø Angebote", width: 9, fmt: "dec" },
          { header: "Nachprüfungsverfahren", width: 12, fmt: "int" },
        ],
        rows: [
          ["EU", "Offenes Verfahren", 38, { f: "C{r}/C$17" }, 61420000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 118, 4.6, 1],
          ["EU", "Nicht offenes Verfahren", 9, { f: "C{r}/C$17" }, 18760000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 142, 3.8, 0],
          ["EU", "Verhandlungsverfahren mit Teilnahmewettbewerb", 7, { f: "C{r}/C$17" }, 22300000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 176, 3.1, 1],
          ["EU", "Verhandlungsverfahren ohne Teilnahmewettbewerb", 4, { f: "C{r}/C$17" }, 3180000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 41, 1.0, 0],
          ["EU", "Wettbewerblicher Dialog", 1, { f: "C{r}/C$17" }, 6900000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 248, 3.0, 0],
          ["national", "Öffentliche Ausschreibung", 46, { f: "C{r}/C$17" }, 9870000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 74, 5.2, 0],
          ["national", "Beschränkte Ausschreibung mit Teilnahmewettbewerb", 18, { f: "C{r}/C$17" }, 3410000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 81, 4.1, 0],
          ["national", "Beschränkte Ausschreibung ohne Teilnahmewettbewerb", 22, { f: "C{r}/C$17" }, 1960000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 52, 3.4, 0],
          ["national", "Verhandlungsvergabe mit Teilnahmewettbewerb", 11, { f: "C{r}/C$17" }, 1240000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 63, 2.9, 0],
          ["national", "Verhandlungsvergabe ohne Teilnahmewettbewerb", 64, { f: "C{r}/C$17" }, 2870000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 29, 2.2, 0],
          ["national", "Direktaufträge", 1184, { f: "C{r}/C$17" }, 3960000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 4, 1.0, 0],
          ["Rahmen", "Abrufe aus Rahmenvereinbarungen", 2946, { f: "C{r}/C$17" }, 48300000, { f: "E{r}/E$17" }, { f: "ROUND(E{r}/C{r},0)" }, 6, null, 0],
          {
            total: true,
            cells: ["", "Summe", { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "SUM(F{first}:F{last})" }, { f: "ROUND(E{r}/C{r},0)" }, null, null, { f: "SUM(J{first}:J{last})" }],
          },
        ],
        notes: [
          "Durchschnittliche Dauer der EU-Verfahren (gewichtet nach Anzahl): 126 Tage (2024: 141 Tage).",
          "Nachprüfungsverfahren: beide Anträge wurden zurückgewiesen (Los 2 eines IT-Dienstleistungsverfahrens, Bewachung Logistikzentrum).",
          "Abrufe aus Rahmenvereinbarungen ohne eigenes Vergabeverfahren; Dauer = Zeit vom Abruf bis zur Bestellung.",
        ],
      },
      {
        name: "Quartale",
        title: "Verfahren nach Quartal",
        subtitle: "Anzahl nach Zuschlagsdatum · Abgleich mit Blatt „Verfahrensarten“",
        columns: [
          { header: "Verfahrensgruppe", width: 40 },
          { header: "Q1", width: 8, fmt: "int" },
          { header: "Q2", width: 8, fmt: "int" },
          { header: "Q3", width: 8, fmt: "int" },
          { header: "Q4", width: 8, fmt: "int" },
          { header: "Summe", width: 9, fmt: "int" },
          { header: "laut Verfahrensarten", width: 12, fmt: "int" },
          { header: "Differenz", width: 10, fmt: "int" },
        ],
        rows: [
          ["EU-Verfahren", 12, 15, 14, 18, { f: "SUM(B{r}:E{r})" }, { f: "SUM(Verfahrensarten!C5:C9)" }, { f: "F{r}-G{r}" }],
          ["Nationale Verfahren (ohne Direktaufträge)", 38, 41, 35, 47, { f: "SUM(B{r}:E{r})" }, { f: "SUM(Verfahrensarten!C10:C14)" }, { f: "F{r}-G{r}" }],
          ["Direktaufträge", 262, 301, 287, 334, { f: "SUM(B{r}:E{r})" }, { f: "Verfahrensarten!C15" }, { f: "F{r}-G{r}" }],
          ["Abrufe aus Rahmenvereinbarungen", 690, 748, 702, 806, { f: "SUM(B{r}:E{r})" }, { f: "Verfahrensarten!C16" }, { f: "F{r}-G{r}" }],
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "SUM(F{first}:F{last})" }, { f: "SUM(G{first}:G{last})" }, { f: "F{r}-G{r}" }],
          },
        ],
      },
      {
        name: "Leistungsbereiche",
        title: "Förmliche Verfahren nach Leistungsbereich",
        subtitle: "EU- und nationale Verfahren ohne Direktaufträge und Abrufe · Auftragswerte netto in Euro",
        columns: [
          { header: "Leistungsbereich", width: 40 },
          { header: "Verfahren", width: 10, fmt: "int" },
          { header: "Auftragswert", width: 15, fmt: "eur0" },
          { header: "Anteil Wert", width: 10, fmt: "pct" },
          { header: "mit Nachhaltigkeitskriterien", width: 14, fmt: "int" },
          { header: "Quote", width: 9, fmt: "pct" },
        ],
        rows: [
          ["IT-Hardware", 31, 28640000, { f: "C{r}/C$13" }, 29, { f: "E{r}/B{r}" }],
          ["IT-Dienstleistungen und Software", 27, 41200000, { f: "C{r}/C$13" }, 11, { f: "E{r}/B{r}" }],
          ["Bauleistungen", 48, 24370000, { f: "C{r}/C$13" }, 37, { f: "E{r}/B{r}" }],
          ["Gebäudedienste (Reinigung, Bewachung, Hausmeisterdienste)", 14, 19800000, { f: "C{r}/C$13" }, 12, { f: "E{r}/B{r}" }],
          ["Fahrzeuge und Logistik", 12, 6150000, { f: "C{r}/C$13" }, 12, { f: "E{r}/B{r}" }],
          ["Büro- und Verbrauchsmaterial", 23, 2940000, { f: "C{r}/C$13" }, 21, { f: "E{r}/B{r}" }],
          ["Beratung und Gutachten", 36, 6410000, { f: "C{r}/C$13" }, 3, { f: "E{r}/B{r}" }],
          ["Sonstiges", 29, 2400000, { f: "C{r}/C$13" }, 10, { f: "E{r}/B{r}" }],
          { total: true, cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "E{r}/B{r}" }] },
          { total: true, cells: ["Abgleich Blatt „Verfahrensarten“", { f: "SUM(Verfahrensarten!C5:C14)" }, { f: "SUM(Verfahrensarten!E5:E14)" }, null, null, null] },
        ],
        notes: ["Nachhaltigkeitskriterien: Umweltzeichen oder gleichwertige Nachweise als Mindestanforderung oder Zuschlagskriterium mit mindestens 10 % Gewichtung."],
      },
    ],
  },
  {
    type: "excel",
    id: "bzbl-maengelliste-bauunterhalt-2026",
    title: "Mängelliste Bauunterhalt 2026 mit Prioritäten",
    kind: "Mängelliste",
    fileName: "Maengelliste Bauunterhalt Liegenschaften Stand 2026-08",
    org: "bzbl",
    unit: "bzbl-l2",
    author: "bzbl-junker",
    date: "2026-08-25",
    tags: ["zahlen"],
    keywords: ["Gefahr im Verzug", "Verkehrssicherungspflicht", "Titel 519 01", "Prio 1", "Haus B"],
    summary:
      "Liste von 36 baulichen Mängeln in allen Liegenschaften, nach Priorität sortiert, mit Kostenschätzung und Status; die Übersicht summiert je Priorität und prüft per Formel, ob die Restmittel von 640.000 € reichen – Prio 2 ist nicht mehr gedeckt. Gut für Priorisierung, Leitungsvorlage und Diagramme.",
    sheets: [
      {
        name: "Mängel",
        title: "Mängelliste Bauunterhalt – Stand 20.08.2026",
        subtitle: "Referat L 2 · Kostenschätzung brutto in Euro · Prio 1 sofort, Prio 2 im laufenden Jahr, Prio 3 im Folgejahr, Prio 4 wünschenswert",
        columns: [
          { header: "Nr.", width: 5, fmt: "int" },
          { header: "Liegenschaft", width: 20 },
          { header: "Gebäude / Bauteil", width: 30 },
          { header: "Mangel", width: 52 },
          { header: "festgestellt", width: 11, fmt: "date" },
          { header: "Prio", width: 6 },
          { header: "Kostenschätzung", width: 13, fmt: "eur0" },
          { header: "Gewerk", width: 22 },
          { header: "Umsetzung", width: 11 },
          { header: "Status", width: 18 },
        ],
        rows: [
          [1, "Dienstsitz Bonn", "Haus B, Flachdach über 3. OG", "Undichtigkeit, Wassereintritt im Serverraum B 3.12", { date: "2026-06-18" }, "Prio 1", 48500, "Dachdecker", "Q3/2026", "beauftragt"],
          [2, "Dienstsitz Bonn", "Tiefgarage, Decke Ebene −1", "Betonabplatzungen mit freiliegender Bewehrung, Bereich abgesperrt (Verkehrssicherungspflicht)", { date: "2026-05-07" }, "Prio 1", 126000, "Betoninstandsetzung", "Q3/2026", "Ausschreibung läuft"],
          [3, "Außenstelle Berlin", "Kanalstraße 18, Treppenhaus 2", "Brandschutztüren schließen nicht selbsttätig (Prüfbericht Sachverständiger)", { date: "2026-04-22" }, "Prio 1", 18900, "Brandschutz", "Q3/2026", "in Arbeit"],
          [4, "Außenstelle Berlin", "Kanalstraße 18, Trinkwasser Strang Ost", "Legionellen über dem technischen Maßnahmenwert (TrinkwV), Duschen gesperrt", { date: "2026-08-04" }, "Prio 1", 23400, "Sanitär", "Q3/2026", "in Arbeit"],
          [5, "Logistikzentrum Nord", "Halle 2, Rolltor", "Sicherheitskontaktleiste defekt, Tor außer Betrieb", { date: "2026-07-02" }, "Prio 1", 7400, "Torbau", "Q3/2026", "beauftragt"],
          [6, "Rechenzentrum", "USV-Anlage Strang B", "Batteriekapazität unter 60 %, Gefahr im Verzug bei Netzausfall", { date: "2026-06-30" }, "Prio 1", 64000, "Elektro", "Q3/2026", "beauftragt"],
          [7, "Dienstsitz Bonn", "Außenanlagen, Gehweg Haupteingang", "Stolperkanten bis 4 cm durch Wurzelhebungen (Verkehrssicherungspflicht)", { date: "2026-03-16" }, "Prio 1", 22800, "Garten- und Landschaftsbau", "Q3/2026", "beauftragt"],
          [8, "Dienstsitz Bonn", "Haus A, Aufzug 1", "Steuerung abgekündigt, häufige Störungen", { date: "2026-02-11" }, "Prio 2", 96000, "Aufzugstechnik", "Q4/2026", "in Planung"],
          [9, "Dienstsitz Bonn", "Haus B, Sanitärräume EG und 1. OG", "Abwasserleitungen korrodiert, Geruchsbelästigung", { date: "2026-04-09" }, "Prio 2", 74500, "Sanitär", "Q4/2026", "in Planung"],
          [10, "Außenstelle Berlin", "Kanalstraße 18, Heizungsverteilung", "drei Pumpen ohne Drehzahlregelung (Übergang bis zur Wärmepumpe 2027)", { date: "2026-01-20" }, "Prio 2", 12600, "Heizung", "Q3/2026", "beauftragt"],
          [11, "Außenstelle Berlin", "Kanalstraße 18, Fenster 4. OG Nordseite", "undicht, Zugluft und Feuchte an Laibungen", { date: "2026-02-26" }, "Prio 2", 58000, "Fensterbau", "2027", "zurückgestellt"],
          [12, "Logistikzentrum Nord", "Halle 1, Hallenboden", "Risse im Fahrbereich der Stapler", { date: "2026-05-19" }, "Prio 2", 83000, "Bodenbeschichtung", "Q4/2026", "Ausschreibung läuft"],
          [13, "Rechenzentrum", "Kältemaschine 2", "Kältemittelverlust, Nachfüllung zweimal im Jahr", { date: "2026-07-14" }, "Prio 2", 41000, "Kältetechnik", "Q3/2026", "beauftragt"],
          [14, "Dienstsitz Bonn", "Haus C, Brandmeldeanlage", "46 Melder ohne gültige Revision", { date: "2026-03-03" }, "Prio 2", 15800, "Brandmeldetechnik", "Q3/2026", "beauftragt"],
          [15, "Dienstsitz Bonn", "Haus A, Blitzschutzanlage", "Mängel aus der wiederkehrenden Prüfung", { date: "2026-05-28" }, "Prio 2", 9200, "Elektro", "Q3/2026", "beauftragt"],
          [16, "Dienstsitz Bonn", "Tiefgarage, Entwässerungsrinnen", "verstopft, Pfützen- und Eisbildung", { date: "2026-04-15" }, "Prio 2", 6900, "Tiefbau", "Q3/2026", "beauftragt"],
          [17, "Dienstsitz Bonn", "Haus A, Teeküchen 1. bis 4. OG", "Arbeitsplatten aufgequollen", { date: "2026-01-14" }, "Prio 3", 18000, "Tischler", "2027", "zurückgestellt"],
          [18, "Dienstsitz Bonn", "Haus B, Fassade Nordseite", "Graffiti und Verschmutzung", { date: "2026-03-24" }, "Prio 3", 11500, "Maler", "2027", "zurückgestellt"],
          [19, "Dienstsitz Bonn", "Haus C, Flure 2. OG", "Teppichboden verschlissen, Stolpergefahr an Nähten", { date: "2026-02-05" }, "Prio 3", 27300, "Bodenbelag", "2027", "zurückgestellt"],
          [20, "Außenstelle Berlin", "Kanalstraße 18, Südseite", "14 Antriebe der Außenjalousien defekt", { date: "2026-06-09" }, "Prio 3", 16800, "Sonnenschutz", "2027", "zurückgestellt"],
          [21, "Außenstelle Berlin", "Kanalstraße 18, Treppenhaus 1", "Malerarbeiten Wände und Decken", { date: "2026-05-12" }, "Prio 3", 9600, "Maler", "2027", "zurückgestellt"],
          [22, "Logistikzentrum Nord", "Parkplatz", "Außenbeleuchtung auf LED umrüsten", { date: "2026-02-19" }, "Prio 3", 21000, "Elektro", "2027", "zurückgestellt"],
          [23, "Logistikzentrum Nord", "Halle 2, Dachrinnen", "verformt, Überlauf bei Starkregen", { date: "2026-03-11" }, "Prio 3", 8300, "Klempner", "2027", "zurückgestellt"],
          [24, "Rechenzentrum", "Zutrittskontrolle", "Kartenleser veraltet, Ersatzteile nicht mehr lieferbar", { date: "2026-04-28" }, "Prio 3", 32000, "Sicherheitstechnik", "2027", "in Planung"],
          [25, "Dienstsitz Bonn", "Außenanlagen", "überdachte Fahrradabstellanlage erweitern (40 Plätze)", { date: "2026-05-05" }, "Prio 3", 38500, "Metallbau", "2027", "in Planung"],
          [26, "Dienstsitz Bonn", "Haus A, Lüftung Besprechungsbereich EG", "Filterkammer undicht", { date: "2026-07-21" }, "Prio 3", 7900, "Lüftung", "Q4/2026", "in Planung"],
          [27, "Außenstelle Berlin", "Kanalstraße 18, Dachterrasse", "Plattenbelag lose", { date: "2026-06-23" }, "Prio 3", 12400, "Dachdecker", "2027", "zurückgestellt"],
          [28, "Dienstsitz Bonn", "Haus C, Sanitärräume 3. OG", "Fliesen schadhaft", { date: "2026-08-11" }, "Prio 3", 14200, "Fliesenleger", "2027", "zurückgestellt"],
          [29, "Dienstsitz Bonn", "Haus A, Foyer", "Neugestaltung der Wartezone für Besuchende", { date: "2026-01-27" }, "Prio 4", 45000, "Innenausbau", "offen", "zurückgestellt"],
          [30, "Dienstsitz Bonn", "Kantine, Speiseraum", "Nachhallzeit zu lang, Akustikdecke", { date: "2026-02-24" }, "Prio 4", 31000, "Trockenbau", "offen", "zurückgestellt"],
          [31, "Außenstelle Berlin", "Kanalstraße 18, Desk-Sharing-Flächen", "sechs Telefonboxen für Fokusarbeit", { date: "2026-03-31" }, "Prio 4", 54000, "Innenausbau", "offen", "zurückgestellt"],
          [32, "Logistikzentrum Nord", "Verwaltungsgebäude, Sozialraum", "Modernisierung Küchenzeile und Möblierung", { date: "2026-04-14" }, "Prio 4", 28500, "Innenausbau", "offen", "zurückgestellt"],
          [33, "Dienstsitz Bonn", "Innenhof", "Begrünung und Sitzgelegenheiten", { date: "2026-06-02" }, "Prio 4", 19000, "Garten- und Landschaftsbau", "offen", "zurückgestellt"],
          [34, "Dienstsitz Bonn", "Haus B, Erdgeschoss", "taktiles Wegeleitsystem vom Eingang zu den Aufzügen", { date: "2026-05-26" }, "Prio 4", 23000, "Beschilderung", "offen", "zurückgestellt"],
          [35, "Rechenzentrum", "Besucherraum", "Ausstattung für Führungen", { date: "2026-07-07" }, "Prio 4", 8600, "Innenausbau", "offen", "zurückgestellt"],
          [36, "Außenstelle Berlin", "Kanalstraße 18, Hof", "vier Ladepunkte für Dienstfahrzeuge", { date: "2026-08-18" }, "Prio 4", 36000, "Elektro", "offen", "zurückgestellt"],
          { total: true, cells: [null, "Summe", "", "", null, "", { f: "SUM(G{first}:G{last})" }, "", "", ""] },
        ],
        notes: [
          "Kostenschätzung: noch nicht abgerechnete Kosten der Maßnahme einschließlich Nebenkosten.",
          "Nr. 9 (Haus B, Sanitärräume): Geruchsbelästigung wird vom Reinigungsdienstleister als Ursache für Beschwerden genannt; Abwasserleitungen sind nicht Reinigungsleistung.",
        ],
      },
      {
        name: "Übersicht",
        title: "Übersicht nach Priorität und Finanzierung 2026",
        subtitle: "Verfügbare Restmittel Titel 519 01 (Unterhaltung der Grundstücke und baulichen Anlagen) zum 20.08.2026: 640.000 €",
        columns: [
          { header: "Priorität", width: 9 },
          { header: "Bedeutung", width: 50 },
          { header: "Anzahl", width: 8, fmt: "int" },
          { header: "Kosten", width: 14, fmt: "eur0" },
          { header: "kumuliert", width: 14, fmt: "eur0" },
          { header: "Deckung aus Restmitteln", width: 16 },
        ],
        rows: [
          ["Prio 1", "Gefahr im Verzug, Verkehrssicherungspflicht – sofort", { f: "COUNT('Mängel'!G5:G11)" }, { f: "SUM('Mängel'!G5:G11)" }, { f: "D{r}" }, { f: 'IF(E{r}<=640000,"gedeckt","nicht gedeckt")' }],
          ["Prio 2", "Betriebssicherheit und Substanzerhalt – im laufenden Jahr", { f: "COUNT('Mängel'!G12:G20)" }, { f: "SUM('Mängel'!G12:G20)" }, { f: "E5+D{r}" }, { f: 'IF(E{r}<=640000,"gedeckt","nicht gedeckt")' }],
          ["Prio 3", "Werterhalt – im Folgejahr", { f: "COUNT('Mängel'!G21:G32)" }, { f: "SUM('Mängel'!G21:G32)" }, { f: "E6+D{r}" }, { f: 'IF(E{r}<=640000,"gedeckt","nicht gedeckt")' }],
          ["Prio 4", "Verbesserung, wünschenswert", { f: "COUNT('Mängel'!G33:G40)" }, { f: "SUM('Mängel'!G33:G40)" }, { f: "E7+D{r}" }, { f: 'IF(E{r}<=640000,"gedeckt","nicht gedeckt")' }],
          { total: true, cells: ["Summe", "", { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, null, ""] },
          { total: true, cells: ["", "Fehlbetrag bei Umsetzung von Prio 1 und 2", null, { f: "E6-640000" }, null, ""] },
        ],
        notes: [
          "Prio 2 ist nur teilweise gedeckt. Vorschlag L 2: Nr. 11 (Fenster Berlin) auf 2027 verschieben, Nr. 12 (Hallenboden) über Ausgabereste finanzieren.",
          "Bauunterhaltsbedarf für den Haushalt 2027 aus Prio 3 und 4 anmelden.",
        ],
      },
    ],
  },  {
    type: "powerpoint",
    id: "bzbl-beschaffungsbericht-2025",
    title: "Beschaffungsbericht 2025",
    kind: "Präsentation",
    fileName: "Beschaffungsbericht 2025 Amtsleitung",
    org: "bzbl",
    unit: "bzbl-b",
    author: "bzbl-huebner",
    date: "2026-03-10",
    tags: ["zahlen"],
    keywords: ["184,2 Mio. €", "Bieterfrage Nr. 7", "B3-2025-031", "126 Tage", "Nachhaltigkeitskriterien"],
    summary:
      "Bericht der Abteilung Beschaffung an die Amtsleitung: Kennzahlen 2025, Verteilung nach Verfahrensgruppen und Leistungsbereichen, wichtige Verfahren (Notebooks, Gebäudereinigung), Nachhaltigkeitsquote und Maßnahmen für 2026 – fasst die Vergabestatistik zusammen und eignet sich für den Abgleich Folie gegen Tabelle.",
    slides: [
      { t: "title", title: "Beschaffungsbericht 2025", subtitle: "Abteilung B – Beschaffung · Bericht an die Amtsleitung am 12. März 2026" },
      {
        t: "bullets",
        title: "Das Jahr in Zahlen",
        bullets: [
          { text: "4.350 Vergabevorgänge", sub: ["davon 2.946 Abrufe aus Rahmenvereinbarungen und 1.184 Direktaufträge"] },
          "Auftragsvolumen **184,2 Mio. € netto**",
          "59 EU-weite Verfahren mit 112,6 Mio. € – durchschnittliche Dauer 126 Tage (2024: 141 Tage)",
          "2 Nachprüfungsverfahren, beide Anträge zurückgewiesen",
          "61 % der förmlichen Verfahren mit Nachhaltigkeitskriterien",
        ],
        notes: "Alle Zahlen aus der Vergabestatistik 2025 von Referat B 4 (Stand 29.01.2026).",
      },
      {
        t: "chart",
        title: "Auftragswert nach Verfahrensgruppe",
        chart: {
          type: "pie",
          categories: ["EU-Verfahren", "Nationale Verfahren", "Direktaufträge", "Abrufe aus Rahmenvereinbarungen"],
          series: [{ name: "Mio. €", values: [112.56, 19.35, 3.96, 48.3] }],
          unit: "Mio. €",
        },
      },
      {
        t: "chart",
        title: "Förmliche Verfahren nach Leistungsbereich",
        chart: {
          type: "bar",
          categories: ["IT-Hardware", "IT-Dienstleistungen", "Bau", "Gebäudedienste", "Fahrzeuge", "Büromaterial", "Beratung", "Sonstiges"],
          series: [{ name: "Auftragswert", values: [28.64, 41.2, 24.37, 19.8, 6.15, 2.94, 6.41, 2.4] }],
          unit: "Mio. €",
        },
        caption: "220 förmliche Verfahren mit zusammen 131,9 Mio. € (ohne Direktaufträge und Abrufe)",
      },
      {
        t: "table",
        title: "Wichtige Verfahren 2025",
        header: ["Verfahren", "Art", "Volumen", "Stand"],
        rows: [
          ["B4-2025-117 Notebooks und Dockingstationen", "offenes Verfahren, 3 Lose", "4,6 Mio. €", "Zuschlag 05.12.2025; Angebotsfrist nach Bieterfrage Nr. 7 auf 27.10.2025 verlängert"],
          ["B3-2025-031 Gebäudereinigung", "offenes Verfahren, 3 Lose", "3,1 Mio. € (bis 4 Jahre)", "Zuschlag 18.07.2025, Vertragsbeginn 01.10.2025"],
          ["Software für das Facility-Management", "wettbewerblicher Dialog", "6,9 Mio. €", "Zuschlag 11/2025, Einführung 2026"],
          ["Elektro-Pkw", "Abruf aus Rahmenvereinbarung", "0,04 Mio. €", "1 Fahrzeug, Umstellungsplan Fuhrpark ab 2026"],
        ],
        notes: "Gebäudereinigung Los 1 (Bonn): seit Jahresbeginn wiederholt Mängel, Minderungen werden geprüft.",
      },
      {
        t: "bullets",
        title: "Nachhaltige Beschaffung",
        bullets: [
          "135 von 220 förmlichen Verfahren mit Nachhaltigkeitskriterien (61 %)",
          { text: "Spitzenreiter", sub: ["Fahrzeuge und Logistik: 100 %", "IT-Hardware: 94 %"] },
          { text: "Nachholbedarf", sub: ["Beratung und Gutachten: 8 %", "IT-Dienstleistungen und Software: 41 %"] },
          "Ziel 2026: 75 %",
        ],
      },
      {
        t: "twocol",
        title: "Herausforderungen und Maßnahmen 2026",
        left: {
          heading: "Herausforderungen",
          bullets: ["Drei unbesetzte Stellen in Referat B 4", "Verhandlungsverfahren dauern im Schnitt 176 Tage", "Viele Direktaufträge mit hohem Verwaltungsaufwand"],
        },
        right: {
          heading: "Maßnahmen",
          bullets: ["Musterleistungsbeschreibungen für häufige Beschaffungen", "E-Vergabe für alle nationalen Verfahren", "Rahmenvertrag Dienstfahrräder", "Pilot: KI-Assistent für Entwürfe von Leistungsbeschreibungen, Prüfung durch B 4"],
        },
      },
      { t: "end", title: "Vielen Dank", lines: ["Dr. Ralf Hübner · Leiter der Abteilung B – Beschaffung"] },
    ],
  },
  {
    type: "powerpoint",
    id: "bzbl-energie-nachhaltigkeitsziele-2030",
    title: "Energie- und Nachhaltigkeitsziele 2030",
    kind: "Präsentation",
    fileName: "Energie- und Nachhaltigkeitsziele 2030 Amtsleitung 2026-05",
    org: "bzbl",
    unit: "bzbl-l3",
    author: "bzbl-brandl",
    date: "2026-05-19",
    tags: ["zahlen"],
    keywords: ["Energiebericht 2024", "Abwärme", "Wärmepumpe", "§ 15 KSG", "Maßnahmenpaket"],
    summary:
      "Vorlage für die Amtsleitung: Emissionsentwicklung seit 2019, Quellen 2025, ein Maßnahmenpaket mit Minderung und Investitionen bis 2030 und Entscheidungsbedarf – knüpft an den Energiebericht 2024, die Flächenbedarfsanalyse Berlin und den Fuhrpark-Umstellungsplan an.",
    slides: [
      { t: "title", title: "Energie- und Nachhaltigkeitsziele 2030", subtitle: "Vorlage für die Amtsleitung · Mai 2026" },
      {
        t: "bullets",
        title: "Ausgangslage",
        bullets: [
          "Energiebericht 2024: 6.180 t CO₂ (– 27 % gegenüber 2019)",
          "2025 (vorläufig): 5.840 t CO₂ (– 31 %)",
          "Ziel nach § 15 KSG: Bundesverwaltung bis 2030 klimaneutral organisiert",
          "Ohne neue Maßnahmen bleiben 2030 rund 5.500 t",
        ],
      },
      {
        t: "chart",
        title: "CO₂-Emissionen aller Liegenschaften",
        chart: {
          type: "bar",
          categories: ["2019", "2022", "2024", "2025 (vorl.)", "2030 mit Maßnahmenpaket"],
          series: [{ name: "t CO₂", values: [8470, 7150, 6180, 5840, 1920] }],
          unit: "t CO₂",
        },
      },
      {
        t: "table",
        title: "Emissionen 2025 nach Quelle",
        header: ["Quelle", "t CO₂", "Anteil"],
        rows: [
          ["Wärme (Erdgas, Fernwärme)", "2.960", "51 %"],
          ["Strom (Netzbezug)", "2.410", "41 %"],
          ["Dienstreisen", "400", "7 %"],
          ["Fuhrpark", "70", "1 %"],
          ["Summe", "5.840", "100 %"],
        ],
        notes: "Fuhrpark laut Fuhrparkübersicht von Referat B 3: 69,5 t im Jahr 2025.",
      },
      {
        t: "table",
        title: "Maßnahmenpaket bis 2030",
        header: ["Maßnahme", "Minderung t CO₂/Jahr", "Investition", "Zeitraum"],
        rows: [
          ["Ökostrom für alle Liegenschaften (Rahmenvertrag)", "2.300", "Mehrkosten ca. 90.000 €/Jahr", "ab 2027"],
          ["Abwärme des Rechenzentrums für den Dienstsitz Bonn", "820", "2,4 Mio. €", "2027–2028"],
          ["Wärmepumpe statt Gaskessel in der Außenstelle Berlin", "410", "1,1 Mio. €", "2027"],
          ["Energiemanagement nach DIN EN ISO 50001", "150", "0,12 Mio. €", "2026"],
          ["Aufgabe der Anmietung Kanalstraße 22 (Berlin)", "120", "–", "2028"],
          ["Photovoltaik Dienstsitz Bonn (220 kWp)", "85", "0,35 Mio. €", "2026"],
          ["Umstellung des Fuhrparks auf Elektroantrieb", "35", "0,82 Mio. €", "2026–2030"],
          ["Summe", "3.920", "rund 4,8 Mio. €", ""],
        ],
        notes: "Restemissionen 2030 rund 1.920 t (– 77 % gegenüber 2019), vor allem Wärme in den Häusern A und C. Machbarkeitsstudie Abwärme liegt seit März 2026 vor.",
      },
      {
        t: "bullets",
        title: "Entscheidungsbedarf",
        bullets: [
          "Zustimmung zum Maßnahmenpaket",
          "Anmeldung der Investitionen für 2027 zum Haushalt (Abwärme, Wärmepumpe)",
          "Auftrag an Abteilung B: Ausschreibung Ökostrom über einen Rahmenvertrag",
        ],
      },
      { t: "end", title: "Vielen Dank", lines: ["Lukas Brandl · Referat L 3 – Energie und Nachhaltigkeit"] },
    ],
  },
];

export const threads: ThreadSpec[] = [
  {
    id: "bzbl-bieterfrage-los2",
    title: "Bieterfrage zur Ausschreibung Notebooks",
    subject: "Bieterfrage zu Vergabe B4-2025-117, Los 2",
    org: "bzbl",
    unit: "bzbl-b4",
    date: "2025-10-07",
    tags: ["widersprueche"],
    keywords: ["Bieterfrage Nr. 7", "Lieferzeit", "27.10.2025", "Vergabeplattform"],
    summary:
      "Ein Bieter fragt nach Lieferzeiten und der Angebotsfrist für Los 2. Vergabe- und Fachreferat stimmen die Antwort ab – die genannte Frist passt nicht zum Vergabevermerk.",
    mails: [
      {
        from: "ext-seidel",
        to: ["bzbl-lindqvist"],
        date: "2025-10-02T10:41",
        body: `Sehr geehrter Herr Lindqvist,

zur Ausschreibung B4-2025-117 haben wir zwei Fragen zu Los 2 (Notebooks mit erweiterter Leistung):

1. In der Leistungsbeschreibung wird eine Lieferzeit von 15 Arbeitstagen ab Abruf gefordert. Aufgrund der aktuellen Lage bei Grafikchips sind bei allen Herstellern derzeit 25 bis 30 Arbeitstage üblich. Ist eine Lieferzeit von 30 Arbeitstagen für Erstabrufe über 100 Stück zulässig?
2. Können Sie bestätigen, dass die Angebotsfrist am 20.10.2025 um 12 Uhr endet? Auf der Plattform wird teilweise ein anderes Datum angezeigt.

Für eine kurzfristige Rückmeldung wären wir dankbar.

Mit freundlichen Grüßen
Jan Seidel`,
      },
      {
        from: "bzbl-lindqvist",
        to: ["bzbl-rothkegel"],
        date: "2025-10-02T14:15",
        body: `Hallo Frau Rothkegel,

anbei eine Bieterfrage zu Los 2 (Bieterfrage Nr. 7 im Verfahren). Können Sie fachlich beurteilen, ob wir 30 Arbeitstage für größere Erstabrufe akzeptieren können? Wenn wir das zulassen, müssen wir es allen Bietern mitteilen und ggf. die Frist verlängern.

Zur Frist: Nach meinem Stand bleibt es beim 20.10. – ich prüfe die Anzeige auf der Plattform.

Viele Grüße
Marco Lindqvist`,
      },
      {
        from: "bzbl-rothkegel",
        to: ["bzbl-lindqvist"],
        date: "2025-10-06T09:30",
        body: `Hallo Herr Lindqvist,

fachlich können wir mit 30 Arbeitstagen für Erstabrufe über 100 Stück leben, die großen Rollouts planen wir ohnehin mit Vorlauf. Für Nachbestellungen und Ersatzgeräte bleiben die 15 Arbeitstage aber wichtig.

Wegen der Änderung würde ich die Angebotsfrist um eine Woche auf den 27.10.2025 verlängern, damit alle Bieter neu kalkulieren können. Bitte stimmen Sie das mit Referat B 4 intern ab.

Gruß
Ines Rothkegel`,
      },
      {
        from: "bzbl-lindqvist",
        to: ["ext-seidel"],
        date: "2025-10-07T11:02",
        quote: false,
        body: `Sehr geehrter Herr Seidel,

zu Ihrer Bieterfrage (Nr. 7) teilen wir Folgendes mit:

1. Für Erstabrufe ab 100 Stück in Los 2 wird eine Lieferzeit von bis zu 30 Arbeitstagen ab Abruf zugelassen. Für alle übrigen Abrufe bleibt es bei 15 Arbeitstagen.
2. Aufgrund dieser Änderung wird die Angebotsfrist auf den 27.10.2025, 12:00 Uhr, verlängert.

Die Antwort wird allen Unternehmen anonymisiert über die Vergabeplattform zur Verfügung gestellt.

Mit freundlichen Grüßen
Im Auftrag
Marco Lindqvist`,
      },
    ],
  },
  {
    id: "bzbl-personalrat-desk-sharing-berlin",
    title: "Personalrat und Referat L 1 zum Desk-Sharing in der Außenstelle Berlin",
    subject: "Desk-Sharing Außenstelle Berlin – Beteiligung des Personalrats",
    org: "bzbl",
    unit: "bzbl-l1",
    date: "2025-12-09",
    keywords: ["Sharing-Quote", "Dienstvereinbarung", "Erörterung", "Schließfächer", "01.06.2026"],
    summary:
      "Der Personalrat beschwert sich, vom Desk-Sharing-Konzept über den Flurfunk erfahren zu haben, und fordert Beteiligung. Das Flächenreferat schickt die Präsentation, räumt Fehler ein, beantwortet Rückfragen (auch zur Zahl 212 gegenüber 197 in der Analyse) und verschiebt den Pilot – gut für Erörterungsvorbereitung und Eckpunkte einer Dienstvereinbarung.",
    mails: [
      {
        from: "bzbl-hellwig",
        to: ["bzbl-dahl"],
        cc: ["bzbl-hoevelmann"],
        date: "2025-12-01T09:14",
        body: `Sehr geehrter Herr Dahl,

der Personalrat hat von den Plänen aus der Abteilungsleitungsrunde vom 27.11. erfahren – leider nicht von Ihnen, sondern über den Flurfunk. In Berlin heißt es, ab April 2026 komme Desk-Sharing mit einer Sharing-Quote von 0,6, also sechs Plätze für zehn Kolleginnen und Kollegen. Entsprechend groß ist die Unruhe.

Die Einführung von Desk-Sharing betrifft die Gestaltung der Arbeitsplätze und unterliegt nach dem BPersVG der Mitbestimmung. Gleiches gilt für ein Buchungssystem, mit dem sich Anwesenheiten auswerten lassen. Eine Umsetzung ohne Zustimmung des Personalrats bzw. ohne Dienstvereinbarung wird es nicht geben.

Wir bitten um
1. die vollständige Präsentation und die Flächenbedarfsanalyse,
2. die Ergebnisse der Belegungsmessung (die wir im September mitgetragen haben – aber ausdrücklich nicht als Grundlage für ein fertiges Konzept),
3. einen Termin zur Erörterung noch vor Weihnachten.

Bis dahin bitten wir, keine weiteren Schritte wie Umbauplanung oder Möbelbeschaffung einzuleiten.

Mit freundlichen Grüßen
Doris Hellwig`,
      },
      {
        from: "bzbl-dahl",
        to: ["bzbl-hellwig"],
        cc: ["bzbl-hoevelmann", "bzbl-vehrenkamp"],
        date: "2025-12-03T16:40",
        attachments: ["bzbl-desk-sharing-konzept-aussenstelle-berlin"],
        body: `Sehr geehrte Frau Hellwig,

vielen Dank für Ihre Nachricht. Sie haben recht: Der Personalrat hätte die Präsentation vor der Abteilungsleitungsrunde bekommen müssen. Das tut mir leid.

Zur Klarstellung:
- Die Sharing-Quote beträgt **0,7**, nicht 0,6, und gilt nur für B 2, B 3, L 1, L 2 und Z 4. Servicecenter und Querschnitt behalten feste Plätze, ebenso Beschäftigte mit besonderer Arbeitsplatzausstattung.
- Das Konzept ist ein Entwurf. Entschieden ist bisher nur, dass wir die Anmietung in der Kanalstraße 22 nicht ungeprüft verlängern.
- Das Raumbuchungssystem soll keine personenbezogenen Auswertungen erlauben. Das schreiben wir gern in einer Dienstvereinbarung fest.

Die Präsentation hängt an, die Flächenbedarfsanalyse schickt Ihnen Herr Vehrenkamp heute noch. Umbau- und Möbelplanungen ruhen bis zur Erörterung.

Als Termin schlage ich Dienstag, 16.12., 10:00 Uhr in Berlin vor, mit Videozuschaltung für Bonn.

Mit freundlichen Grüßen
Henrik Dahl`,
      },
      {
        from: "bzbl-hellwig",
        to: ["bzbl-dahl"],
        cc: ["bzbl-hoevelmann", "bzbl-vehrenkamp"],
        date: "2025-12-05T11:02",
        body: `Sehr geehrter Herr Dahl,

danke für die schnelle Antwort und die Unterlagen. Der 16.12. passt.

Vorab unsere Punkte, damit wir das Gespräch gut vorbereiten können:
- In der Analyse steht vorne „212 Beschäftigte“, in der Tabelle sind es 197. Mit welcher Zahl wurde gerechnet?
- Dienstags liegt die Belegung bei 68 %, in der Schulungswoche sogar bei 74 %. Was passiert, wenn an einem Dienstag alle kommen?
- Schließfächer: eines pro Person, nicht pro Arbeitsplatz.
- Teilzeitbeschäftigte und Kolleginnen und Kollegen mit Pflegeaufgaben dürfen bei der Platzwahl nicht benachteiligt werden; Frau Hövelmann wird dazu etwas sagen.
- Ein Start im April ist aus unserer Sicht nicht zu halten. Erst Befragung der Beschäftigten, dann Dienstvereinbarung, dann Pilot.

Mit freundlichen Grüßen
Doris Hellwig`,
      },
      {
        from: "bzbl-dahl",
        to: ["bzbl-hellwig"],
        cc: ["bzbl-hoevelmann", "bzbl-vehrenkamp"],
        date: "2025-12-09T08:55",
        body: `Sehr geehrte Frau Hellwig,

vielen Dank, wir bereiten die Punkte für den 16.12. vor. Vorab schon so viel:
- Gerechnet wurde mit den 197 Beschäftigten laut Tabelle (Stand 30.09.2025). Die 212 in der Zusammenfassung stammen aus einer älteren Fassung, in der unbesetzte Stellen mitgezählt waren. Herr Vehrenkamp korrigiert das.
- Spitzentage: Wir schlagen abgestimmte Präsenztage je Team vor. Zusätzlich stehen Ausweichplätze in Besprechungs- und Fokusräumen zur Verfügung.
- Schließfächer: einverstanden, eines pro Person.
- Zeitplan: Der Pilot beginnt frühestens am **01.06.2026**. Vorher machen wir im Januar die Befragung und verhandeln die Dienstvereinbarung.

Einen Entwurf mit Eckpunkten für die Dienstvereinbarung bringen wir zum Termin mit.

Mit freundlichen Grüßen
Henrik Dahl`,
      },
    ],
  },
  {
    id: "bzbl-reinigung-maengel-vertragsstrafe-haus-b",
    title: "Reinigungsmängel in Haus B: Minderung und Vertragsstrafe",
    subject: "Rahmenvertrag B3-2025-031, Los 1 – Mängel März 2026, Minderung und Vertragsstrafe",
    org: "bzbl",
    unit: "bzbl-b3",
    date: "2026-04-24",
    tags: ["zahlen"],
    keywords: ["B3-2025-031", "Mängelquote", "41.280 €", "2.814 €", "Vertragsstrafe"],
    summary:
      "Das Vertragsmanagement kündigt dem Reinigungsdienstleister Minderung und Vertragsstrafe nach der Leistungsbeschreibung an (3.114 €). Die Firma widerspricht mit Baustaub, späten Meldungen und Personalausfall; nach Prüfung durch die Objektbetreuung werden 2.814 € verrechnet – gut zum Nachrechnen und für eine eigene Bewertung der Argumente.",
    mails: [
      {
        from: "bzbl-akbulut",
        to: ["ext-wisniewska"],
        cc: ["bzbl-grote", "bzbl-junker"],
        date: "2026-04-14T07:58",
        body: `Sehr geehrte Frau Wiśniewska,

bei den Qualitätskontrollen in Los 1 (Dienstsitz Bonn) wurden im März erneut deutliche Mängel festgestellt, vor allem in den Sanitärräumen und Teeküchen von Haus B:

- Kontrolle 10.03.2026: Mängelquote 11,8 %
- Kontrolle 18.03.2026: Mängelquote 13,4 %
- Kontrolle 26.03.2026: Mängelquote 9,6 %

Die durchschnittliche Mängelquote im März liegt damit bei 11,6 % und über der Toleranzgrenze von 5 %. Nach Ziffer 8.4 Nr. 2 der Leistungsbeschreibung mindert sich die Monatsvergütung von **41.280 € netto** um 5 %, also um **2.064 €**.

Hinzu kommen sieben Fälle, in denen gemeldete Mängel nicht fristgerecht nachgereinigt wurden (Meldungen vom 10.03., 11.03., zweimal 18.03., 19.03., 26.03. und 27.03.). Nach Ziffer 8.4 Nr. 3 fällt je Fall eine Vertragsstrafe von 150 € an, zusammen **1.050 €**.

Wir beabsichtigen, insgesamt **3.114 €** mit Ihrer Rechnung für April zu verrechnen. Sie können bis zum 24.04.2026 Stellung nehmen. Die Kontrollprotokolle liegen Ihrer Objektleitung vor.

Mit freundlichen Grüßen
Im Auftrag
Derya Akbulut`,
      },
      {
        from: "ext-wisniewska",
        to: ["bzbl-akbulut"],
        cc: ["bzbl-grote"],
        date: "2026-04-20T16:42",
        body: `Sehr geehrte Frau Akbulut,

danke für Ihr Schreiben. Wir nehmen die Mängel ernst, sehen die Berechnung aber nicht in allen Punkten so:

1. In Haus B wurde im März gebaut (Fenster und Brandschutztüren). Der Baustaub hat sich im ganzen Haus verteilt, vor allem in Treppenhäusern und Teeküchen. Das ist nicht unser Verschulden. Die Kontrolle am 18.03. fand mitten in dieser Zeit statt.
2. Zwei der sieben Nachreinigungen (18.03. und 27.03.) wurden uns erst nach 16 Uhr gemeldet, da war unser Personal schon weg.
3. Der Geruch in den Sanitärräumen im EG und 1. OG kommt aus den Abwasserleitungen, nicht von der Reinigung. Da können wir putzen, so viel wir wollen.
4. Wir hatten im März vier Langzeiterkrankte im Objekt und haben Ersatzpersonal aus anderen Objekten eingesetzt.

Unser Vorschlag: Minderung 3 % statt 5 % und Verzicht auf die Vertragsstrafe in drei Fällen. Als Ausgleich führen wir in Haus B eine kostenfreie Grundreinigung aller Teeküchen durch.

Mit freundlichen Grüßen
Marta Wiśniewska`,
      },
      {
        from: "bzbl-junker",
        to: ["bzbl-akbulut"],
        cc: ["bzbl-grote"],
        date: "2026-04-22T10:15",
        body: `Hallo Frau Akbulut,

zu den Punkten von Glanzwerk aus Sicht der Objektbetreuung:

- **Baustelle:** In Haus B wurde vom 16.03. bis 03.04. nur im 2. OG gearbeitet, mit Staubschutzwänden. Die Kontrolle am 18.03. betraf zur Hälfte Räume im 2. OG – dort lasse ich das Argument gelten. Die Kontrolle am 10.03. war vor Baubeginn, am 26.03. wurden nur EG und 1. OG geprüft.
- Selbst wenn wir die Kontrolle vom 18.03. herausnehmen, liegt der Durchschnitt bei 10,7 % – also weiterhin in der Stufe über 10 bis 15 %.
- **Späte Meldungen:** Die Meldungen vom 18.03. (eine von zwei) und vom 27.03. gingen tatsächlich um 16:20 bzw. 17:05 Uhr raus. Die 24-Stunden-Frist gilt trotzdem, erledigt wurde laut Reinigungstagebuch erst nach 30 bzw. 70 Stunden. Aus Kulanz könnten wir hier verzichten.
- **Geruch:** Stimmt, die Abwasserleitungen stehen auf unserer Mängelliste (Prio 2). Die Kontrollprotokolle bemängeln aber verschmutzte Armaturen, Spiegel und leere Seifenspender – das hat mit den Leitungen nichts zu tun.

Gruß
Petra Junker`,
      },
      {
        from: "bzbl-akbulut",
        to: ["ext-wisniewska"],
        cc: ["bzbl-grote", "bzbl-junker"],
        date: "2026-04-24T11:30",
        body: `Sehr geehrte Frau Wiśniewska,

vielen Dank für Ihre Stellungnahme vom 20.04. Wir haben die Punkte mit unserer Objektbetreuung geprüft:

1. **Minderung:** Auch ohne die Kontrolle vom 18.03. (Baustelle im 2. OG) liegt die durchschnittliche Mängelquote im März bei 10,7 %. Es bleibt bei der Minderung von 5 %, also **2.064 €**.
2. **Vertragsstrafe:** Bei den beiden Meldungen, die nach 16 Uhr eingingen, verzichten wir aus Kulanz auf die Vertragsstrafe. Es verbleiben fünf Fälle zu je 150 €, also **750 €**.
3. **Sanitärräume:** Die Ursache des Geruchs ist uns bekannt und wird von uns behoben. Die Kontrollprotokolle beanstanden aber Armaturen, Spiegel und Verbrauchsmaterial – das ist Reinigungsleistung.
4. Ihr Angebot einer kostenfreien Grundreinigung der Teeküchen in Haus B nehmen wir gern an, bitte bis zum 15.05.2026.

Insgesamt verrechnen wir **2.814 €** mit Ihrer Rechnung für April 2026. Zum Qualitätsgespräch am 06.05.2026 um 10:00 Uhr in Raum A 0.14 laden wir Sie gesondert ein.

Mit freundlichen Grüßen
Im Auftrag
Derya Akbulut`,
      },
    ],
  },
];
