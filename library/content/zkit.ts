// Zweckverband Kommunale IT Altmoor
import type { CellSpec, DocSpec, ThreadSpec } from "../types";

// ── Schulungsteilnahmen E-Akte: Teilnehmendenliste aus festen Namenslisten (deterministisch erzeugt) ──

const SCHULUNG_VORNAMEN = [
  "Anna", "Katrin", "Sandra", "Melanie", "Julia", "Christina", "Nicole", "Stefanie", "Jana", "Lea", "Laura", "Sarah", "Miriam",
  "Tanja", "Kerstin", "Birgit", "Heike", "Silke", "Frauke", "Wiebke", "Imke", "Maren", "Nadine", "Yvonne", "Svenja", "Ayşe",
  "Elena", "Natalia", "Ilka", "Doreen", "Carina", "Thomas", "Michael", "Jens", "Stefan", "Sven", "Jan", "Lars", "Hauke", "Ole",
  "Malte", "Björn", "Dennis", "Marcel", "Florian", "Tobias", "Kai", "Mehmet", "Paweł", "Andrej", "Torben", "Henning", "Niklas", "Fabian",
];
const SCHULUNG_NACHNAMEN = [
  "Ahrens", "Bahr", "Behnke", "Bode", "Brandt", "Claußen", "Dammann", "Dierks", "Ebeling", "Eggert", "Feddersen", "Frerichs",
  "Garbers", "Grünwald", "Hagen", "Heitmann", "Hinz", "Holst", "Hüttmann", "Iwanow", "Janssen", "Jürgens", "Kahl", "Karstens",
  "Kock", "Köhler", "Kruse", "Lemke", "Lüttjohann", "Meier", "Mohr", "Niemann", "Oltmanns", "Ott", "Peters", "Plambeck", "Popp",
  "Quast", "Rathje", "Reese", "Rohde", "Sager", "Schütt", "Siemers", "Sommer", "Thomsen", "Timmermann", "Uhl", "Voss",
  "Warnecke", "Wilms", "Yılmaz", "Zahn", "Ziegler", "Kowalski", "Nowak", "Petrović", "Bruhn", "Stührmann", "Detjen",
];

interface SchulungsTermin {
  nr: string;
  kurs: string;
  datum: string;
  ort: string;
  leitung: string;
  stunden: number;
  plaetze: number;
}

const SCHULUNGSTERMINE: SchulungsTermin[] = [
  { nr: "F-01", kurs: "E-Akte für Führungskräfte", datum: "2025-11-19", ort: "Kreishaus, Schulungsraum E.14", leitung: "W. Ohlsen", stunden: 1.5, plaetze: 12 },
  { nr: "G-01", kurs: "Grundlagen E-Akte", datum: "2025-11-24", ort: "Kreishaus, Schulungsraum E.14", leitung: "R. Lenz", stunden: 3.5, plaetze: 14 },
  { nr: "G-02", kurs: "Grundlagen E-Akte", datum: "2025-11-26", ort: "Kreishaus, Schulungsraum E.14", leitung: "W. Ohlsen", stunden: 3.5, plaetze: 14 },
  { nr: "G-03", kurs: "Grundlagen E-Akte", datum: "2025-12-01", ort: "Kreishaus, Schulungsraum E.14", leitung: "R. Lenz", stunden: 3.5, plaetze: 14 },
  { nr: "G-04", kurs: "Grundlagen E-Akte", datum: "2025-12-03", ort: "Kreishaus, Schulungsraum E.14", leitung: "J. Dittmer (extern)", stunden: 3.5, plaetze: 14 },
  { nr: "G-05", kurs: "Grundlagen E-Akte", datum: "2025-12-08", ort: "Kreishaus, Schulungsraum E.14", leitung: "R. Lenz", stunden: 3.5, plaetze: 14 },
  { nr: "G-06", kurs: "Grundlagen E-Akte", datum: "2025-12-10", ort: "Kreishaus, Schulungsraum E.14", leitung: "W. Ohlsen", stunden: 3.5, plaetze: 14 },
  { nr: "G-07", kurs: "Grundlagen E-Akte", datum: "2025-12-15", ort: "Kreishaus, Schulungsraum E.14", leitung: "J. Dittmer (extern)", stunden: 3.5, plaetze: 14 },
  { nr: "G-08", kurs: "Grundlagen E-Akte", datum: "2026-01-05", ort: "Kreishaus, Schulungsraum E.14", leitung: "R. Lenz", stunden: 3.5, plaetze: 14 },
  { nr: "G-09", kurs: "Grundlagen E-Akte", datum: "2026-01-07", ort: "Kreishaus, Schulungsraum E.14", leitung: "W. Ohlsen", stunden: 3.5, plaetze: 14 },
  { nr: "G-10", kurs: "Grundlagen E-Akte", datum: "2026-01-08", ort: "Kreishaus, Schulungsraum E.14", leitung: "R. Lenz", stunden: 3.5, plaetze: 14 },
  { nr: "P-01", kurs: "Posteingang und Scannen", datum: "2026-01-09", ort: "Kreishaus, Poststelle", leitung: "W. Ohlsen", stunden: 2, plaetze: 8 },
  { nr: "F-02", kurs: "E-Akte für Führungskräfte", datum: "2026-01-21", ort: "Rathaus Brackenhain, Sitzungssaal", leitung: "W. Ohlsen", stunden: 1.5, plaetze: 12 },
  { nr: "G-11", kurs: "Grundlagen E-Akte", datum: "2026-01-26", ort: "Rathaus Brackenhain, Sitzungssaal", leitung: "R. Lenz", stunden: 3.5, plaetze: 12 },
  { nr: "G-12", kurs: "Grundlagen E-Akte", datum: "2026-01-28", ort: "Rathaus Brackenhain, Sitzungssaal", leitung: "W. Ohlsen", stunden: 3.5, plaetze: 12 },
  { nr: "G-13", kurs: "Grundlagen E-Akte", datum: "2026-02-02", ort: "Rathaus Brackenhain, Sitzungssaal", leitung: "R. Lenz", stunden: 3.5, plaetze: 12 },
  { nr: "G-14", kurs: "Grundlagen E-Akte", datum: "2026-02-04", ort: "Rathaus Brackenhain, Sitzungssaal", leitung: "J. Dittmer (extern)", stunden: 3.5, plaetze: 12 },
  { nr: "P-02", kurs: "Posteingang und Scannen", datum: "2026-02-06", ort: "Rathaus Brackenhain, Raum 104", leitung: "W. Ohlsen", stunden: 2, plaetze: 8 },
  { nr: "G-15", kurs: "Grundlagen E-Akte (Nachholtermin)", datum: "2026-03-24", ort: "Kreishaus, Schulungsraum E.14", leitung: "R. Lenz", stunden: 3.5, plaetze: 14 },
];

interface SchulungsStelle {
  name: string;
  soll: number;
  golive: string;
  /** Feste Personen aus dem Weltmodell an einer Position innerhalb der Dienststelle. */
  feste: { pos: number; nachname: string; vorname: string }[];
}

const SCHULUNG_JA: SchulungsStelle[] = [
  { name: "JA – Leitung und Verwaltung", soll: 12, golive: "2026-01-12", feste: [{ pos: 0, nachname: "Gerdes", vorname: "Stefanie" }] },
  { name: "JA – Allgemeiner Sozialer Dienst", soll: 46, golive: "2026-01-12", feste: [] },
  { name: "JA – Wirtschaftliche Jugendhilfe", soll: 24, golive: "2026-01-12", feste: [] },
  { name: "JA – Kindertagesbetreuung", soll: 18, golive: "2026-01-12", feste: [{ pos: 1, nachname: "Carstens", vorname: "Ole" }] },
  { name: "JA – Beistandschaften und Unterhaltsvorschuss", soll: 22, golive: "2026-01-12", feste: [] },
  { name: "JA – Jugendhilfe im Strafverfahren", soll: 12, golive: "2026-01-12", feste: [] },
];

const SCHULUNG_BH: SchulungsStelle[] = [
  {
    name: "BH – Hauptamt",
    soll: 14,
    golive: "2026-02-16",
    feste: [
      { pos: 0, nachname: "Höfer", vorname: "Martina" },
      { pos: 1, nachname: "Bartels", vorname: "Anke" },
    ],
  },
  {
    name: "BH – Kämmerei und Gemeindekasse",
    soll: 9,
    golive: "2026-02-16",
    feste: [
      { pos: 0, nachname: "Schnoor", vorname: "Petra" },
      { pos: 1, nachname: "Wilkens", vorname: "Jens" },
    ],
  },
  { name: "BH – Bauamt", soll: 8, golive: "2026-02-16", feste: [{ pos: 0, nachname: "Dettmer", vorname: "Uwe" }] },
  { name: "BH – Ordnungsamt", soll: 7, golive: "2026-02-16", feste: [{ pos: 0, nachname: "Krull", vorname: "Lisa" }] },
  { name: "BH – Bürgermeister und Standesamt", soll: 3, golive: "2026-02-16", feste: [{ pos: 0, nachname: "Ruhnau", vorname: "Frank" }] },
];

/** Baut die drei Blätter der Schulungsauswertung. Eingebauter Fehler: Die Auswertung meldet für den ASD alle Beschäftigten als geschult. */
function schulungEakte() {
  let seed = 20260313;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const used = new Set<string>();
  for (const s of [...SCHULUNG_JA, ...SCHULUNG_BH]) for (const f of s.feste) used.add(`${f.nachname},${f.vorname}`);
  const newName = (): [string, string] => {
    for (;;) {
      const nachname = SCHULUNG_NACHNAMEN[Math.floor(rnd() * SCHULUNG_NACHNAMEN.length)];
      const vorname = SCHULUNG_VORNAMEN[Math.floor(rnd() * SCHULUNG_VORNAMEN.length)];
      if (!used.has(`${nachname},${vorname}`)) {
        used.add(`${nachname},${vorname}`);
        return [nachname, vorname];
      }
    }
  };
  type Person = { nachname: string; vorname: string; stelle: string };
  const people = (stellen: SchulungsStelle[]): Person[] =>
    stellen.flatMap((s) =>
      Array.from({ length: s.soll }, (_, i) => {
        const fest = s.feste.find((f) => f.pos === i);
        const [nachname, vorname] = fest ? [fest.nachname, fest.vorname] : newName();
        return { nachname, vorname, stelle: s.name };
      }),
    );
  const ja = people(SCHULUNG_JA);
  const bh = people(SCHULUNG_BH);

  type Anmeldung = { p: Person; termin: string; status: string; bemerkung: string };
  const regs: Anmeldung[] = [];
  const GRUENDE = ["krankgemeldet", "Urlaub", "krankgemeldet", "Elternzeit bis 02/2026", "Fortbildung extern"];
  const grundlagen = (list: Person[], termine: string[], groessen: number[], fehlt: number[], entschuldigt: number[], nachholen: number[]) => {
    let k = 0;
    termine.forEach((termin, t) => {
      for (let j = 0; j < groessen[t]; j++, k++) {
        const p = list[k];
        if (fehlt.includes(k)) regs.push({ p, termin, status: "nicht erschienen", bemerkung: "ohne Abmeldung" });
        else if (entschuldigt.includes(k)) regs.push({ p, termin, status: "entschuldigt", bemerkung: GRUENDE[entschuldigt.indexOf(k) % GRUENDE.length] });
        else regs.push({ p, termin, status: "teilgenommen", bemerkung: "" });
        if (entschuldigt.includes(k) || nachholen.includes(k)) regs.push({ p, termin: "G-15", status: "angemeldet", bemerkung: "Nachholtermin" });
      }
    });
  };
  grundlagen(ja, ["G-01", "G-02", "G-03", "G-04", "G-05", "G-06", "G-07", "G-08", "G-09", "G-10"], [14, 14, 14, 14, 13, 13, 13, 13, 13, 13], [5, 17, 29, 38, 61, 77, 96, 118], [14, 33, 52, 70, 127], [17, 61]);
  grundlagen(bh, ["G-11", "G-12", "G-13", "G-14"], [11, 10, 10, 10], [9, 27], [19, 34], []);
  const weitere = (list: Person[], termin: string, idx: number[], ausnahmen: Record<number, string> = {}) =>
    idx.forEach((i) => regs.push({ p: list[i], termin, status: ausnahmen[i] ? "entschuldigt" : "teilgenommen", bemerkung: ausnahmen[i] ?? "" }));
  weitere(ja, "F-01", [0, 1, 12, 13, 58, 82, 100, 122, 123], { 123: "Sitzung Jugendhilfeausschuss" });
  weitere(ja, "P-01", [2, 3, 4, 6, 7, 8]);
  weitere(bh, "F-02", [38, 0, 14]);
  weitere(bh, "P-02", [1, 2, 3, 39]);

  const terminOf = (nr: string) => SCHULUNGSTERMINE.find((t) => t.nr === nr)!;
  regs.sort((a, b) => {
    const ta = terminOf(a.termin);
    const tb = terminOf(b.termin);
    return ta.datum.localeCompare(tb.datum) || ta.nr.localeCompare(tb.nr) || a.p.nachname.localeCompare(b.p.nachname, "de") || a.p.vorname.localeCompare(b.p.vorname, "de");
  });

  const teilnahmen: CellSpec[][] = regs.map((r, i) => [i + 1, r.p.nachname, r.p.vorname, r.p.stelle, r.termin, { date: terminOf(r.termin).datum }, r.status, r.bemerkung]);

  const termine: CellSpec[][] = SCHULUNGSTERMINE.map((t) => {
    const angemeldet = regs.filter((r) => r.termin === t.nr).length;
    const offen = t.datum > "2026-03-13";
    return [
      t.nr,
      t.kurs,
      { date: t.datum },
      t.ort,
      t.leitung,
      t.stunden,
      t.plaetze,
      angemeldet,
      offen ? null : regs.filter((r) => r.termin === t.nr && r.status === "teilgenommen").length,
      offen ? null : { f: "I{r}/G{r}" },
      offen ? null : { f: "H{r}-I{r}" },
    ];
  });

  const auswertung: CellSpec[][] = [...SCHULUNG_JA, ...SCHULUNG_BH].map((s) => {
    const echt = regs.filter((r) => r.p.stelle === s.name && r.termin.startsWith("G-") && r.termin !== "G-15" && r.status === "teilgenommen").length;
    const gemeldet = s.name === "JA – Allgemeiner Sozialer Dienst" ? s.soll : echt;
    const nachhol = regs.filter((r) => r.p.stelle === s.name && r.termin === "G-15").length;
    return [s.name, s.soll, gemeldet, { f: "C{r}/B{r}" }, { f: "B{r}-C{r}" }, nachhol, { date: s.golive }];
  });
  const jaGemeldet = auswertung.slice(0, SCHULUNG_JA.length).reduce((sum, row) => sum + (row[2] as number), 0);
  const jaSoll = SCHULUNG_JA.reduce((sum, s) => sum + s.soll, 0);
  return { teilnahmen, termine, auswertung, jaGemeldet, jaSoll };
}

const SCHULUNG_EAKTE = schulungEakte();

export const documents: DocSpec[] = [
  {
    type: "excel",
    id: "zk-ticketstatistik-q3-2025",
    title: "Ticketstatistik Service Desk – 3. Quartal 2025",
    kind: "Statistik",
    fileName: "Ticketstatistik Service Desk Q3 2025",
    org: "zkit",
    unit: "zk-servicedesk",
    author: "zk-broekel",
    date: "2025-10-03",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Passwort und Konto", "SLA", "Kreisvolkshochschule", "1.240 Tickets"],
    summary:
      "Tickets des Service Desks nach Kategorie und Monat, SLA-Einhaltung und Verteilung auf die Mitglieder des Zweckverbands. Die Gesamtzahl in der Anmerkung passt nicht zur Tabelle.",
    sheets: [
      {
        name: "Kategorien",
        title: "Service Desk – Tickets nach Kategorie, 3. Quartal 2025",
        subtitle: "Quelle: Ticketsystem, Export vom 01.10.2025",
        columns: [
          { header: "Kategorie", width: 30 },
          { header: "Juli", width: 9, fmt: "int" },
          { header: "August", width: 9, fmt: "int" },
          { header: "September", width: 11, fmt: "int" },
          { header: "Q3 gesamt", width: 11, fmt: "int" },
          { header: "Anteil", width: 9, fmt: "pct" },
          { header: "SLA eingehalten", width: 14, fmt: "pct" },
        ],
        rows: [
          ["Passwort und Konto", 121, 98, 134, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$14" }, 0.97],
          ["Drucker und Scanner", 64, 51, 70, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$14" }, 0.88],
          ["E-Akte / Dokumentenmanagement", 58, 47, 81, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$14" }, 0.79],
          ["Fachverfahren", 49, 44, 52, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$14" }, 0.84],
          ["E-Mail und Kalender", 37, 29, 41, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$14" }, 0.93],
          ["Hardware (Notebook, Monitor)", 33, 26, 38, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$14" }, 0.91],
          ["Netzwerk und VPN", 21, 19, 23, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$14" }, 0.86],
          ["Telefonie", 12, 9, 14, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$14" }, 0.95],
          ["Sonstiges", 18, 13, 17, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$14" }, 0.9],
          {
            total: true,
            cells: [
              "Summe",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "E{r}/E$14" },
              0.89,
            ],
          },
        ],
        notes: [
          "Im Quartal wurden insgesamt 1.240 Tickets bearbeitet (Vorquartal: 1.105).",
          "SLA: Erstreaktion innerhalb von 4 Arbeitsstunden, Lösung innerhalb von 3 Arbeitstagen (Priorität normal).",
          "Anstieg bei E-Akte im September durch den Rollout in den Fachdiensten Personal und Finanzen des Landkreises.",
        ],
      },
      {
        name: "Mitglieder",
        title: "Tickets nach Verbandsmitglied, 3. Quartal 2025",
        columns: [
          { header: "Mitglied", width: 38 },
          { header: "Tickets Q3", width: 12, fmt: "int" },
          { header: "davon kritisch", width: 14, fmt: "int" },
          { header: "Ø Lösungszeit (Stunden)", width: 16, fmt: "dec" },
          { header: "Arbeitsplätze", width: 13, fmt: "int" },
          { header: "Tickets je Arbeitsplatz", width: 15, fmt: "dec" },
        ],
        rows: [
          ["Landkreis Altmoorland", 702, 9, 11.4, 820, { f: "B{r}/E{r}" }],
          ["Stadt Altmoor", 248, 3, 9.8, 290, { f: "B{r}/E{r}" }],
          ["Gemeinde Brackenhain", 96, 1, 14.2, 64, { f: "B{r}/E{r}" }],
          ["Kreisvolkshochschule Altmoorland", 58, 0, 7.5, 45, { f: "B{r}/E{r}" }],
          ["Abfallwirtschaftsbetrieb Altmoorland", 115, 2, 12.9, 110, { f: "B{r}/E{r}" }],
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, null, { f: "SUM(E{first}:E{last})" }, { f: "B{r}/E{r}" }],
          },
        ],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "zk-projektstatus-eakte",
    title: "Projektstatus Einführung E-Akte – Lenkungsausschuss",
    kind: "Präsentation",
    fileName: "Projektstatus E-Akte Lenkungsausschuss 2025-10-14",
    org: "zkit",
    unit: "zk-eakte",
    author: "zk-kranz",
    date: "2025-10-10",
    tags: ["zahlen"],
    keywords: ["Lenkungsausschuss", "Scan-Dienstleister", "Gesamtstatus", "1.240 Nutzende"],
    summary:
      "Statusbericht zur Einführung der E-Akte bei den Verbandsmitgliedern: Fortschritt je Organisationseinheit, Nutzerzahlen, Budget, Risiken und Entscheidungsbedarf.",
    slides: [
      { t: "title", title: "Einführung E-Akte", subtitle: "Projektstatus für den Lenkungsausschuss am 14. Oktober 2025" },
      {
        t: "bullets",
        title: "Zusammenfassung",
        bullets: [
          "Gesamtstatus: **gelb** – Zeitplan gefährdet, Budget im Rahmen",
          "1.240 Nutzende arbeiten produktiv mit der E-Akte (Ziel Ende 2025: 1.600)",
          "Rollout Ausländerbehörde abgeschlossen, Jugendamt verschoben auf Januar 2026",
          "Engpass: Scan-Dienstleister für Altakten liefert nur 60 % der vereinbarten Menge",
        ],
        notes: "Gelb vor allem wegen des Jugendamts – dort hängt es an der Schnittstelle zum Fachverfahren, nicht an den Menschen.",
      },
      {
        t: "table",
        title: "Rollout nach Organisationseinheit",
        header: ["Organisationseinheit", "Nutzende", "Status", "Produktiv seit / geplant"],
        rows: [
          ["Landkreis – Fachdienst Personal", "48", "produktiv", "09/2025"],
          ["Landkreis – Fachdienst Finanzen", "61", "produktiv", "09/2025"],
          ["Landkreis – Ausländerbehörde", "22", "produktiv", "05/2025"],
          ["Landkreis – Jugendamt", "134", "verschoben", "01/2026"],
          ["Stadt Altmoor – Bürgerbüro", "18", "Pilot", "11/2025"],
          ["Gemeinde Brackenhain – alle Ämter", "41", "in Vorbereitung", "02/2026"],
        ],
      },
      {
        t: "chart",
        title: "Produktive Nutzende der E-Akte",
        chart: {
          type: "bar",
          categories: ["Apr", "Mai", "Jun", "Jul", "Aug", "Sep"],
          series: [
            { name: "Ist", values: [410, 560, 690, 820, 980, 1240] },
            { name: "Plan", values: [400, 600, 800, 1000, 1200, 1400] },
          ],
          unit: "Nutzende",
        },
        caption: "Zählung: Nutzende mit mindestens einer Anmeldung im Monat",
      },
      {
        t: "table",
        title: "Budget (Stand 30.09.2025)",
        header: ["Position", "Plan gesamt", "Ist bis 30.09.", "Prognose Projektende"],
        rows: [
          ["Lizenzen", "640.000 €", "512.000 €", "640.000 €"],
          ["Scan-Dienstleistung Altakten", "380.000 €", "145.000 €", "410.000 €"],
          ["Externe Beratung und Schulung", "220.000 €", "176.000 €", "235.000 €"],
          ["Eigenpersonal (Projektteam)", "310.000 €", "228.000 €", "305.000 €"],
          ["Summe", "1.550.000 €", "1.061.000 €", "1.590.000 €"],
        ],
        notes: "Die Mehrkosten bei der Scan-Dienstleistung entstehen durch Nachscans wegen schlechter Bildqualität. Wir verhandeln eine Gutschrift.",
      },
      {
        t: "twocol",
        title: "Risiken und Gegenmaßnahmen",
        left: {
          heading: "Risiken",
          bullets: [
            "Schnittstelle Jugendamt-Fachverfahren nicht fertig",
            "Scan-Rückstand von rund 2.300 Akten",
            "Akzeptanz: Papier-Parallelakten in zwei Fachdiensten",
            "Personalwechsel im Projektteam (Weggang zum 31.12.)",
          ],
        },
        right: {
          heading: "Gegenmaßnahmen",
          bullets: [
            "Eskalation beim Hersteller, Termin 21.10.",
            "Zweiter Scan-Dienstleister über Rahmenvertrag des Landes",
            "Führungskräfte-Briefing „Keine Papierakte nach Go-live“",
            "Nachbesetzung ausgeschrieben, Übergabe dokumentiert",
          ],
        },
      },
      {
        t: "bullets",
        title: "Entscheidungsbedarf",
        bullets: [
          "Zustimmung zur Beauftragung eines zweiten Scan-Dienstleisters (bis 90.000 €)",
          "Verschiebung des Jugendamts auf Januar 2026 bestätigen",
          "Verbindliche Regel: Ab Go-live keine Papier-Parallelakten mehr",
        ],
      },
      { t: "end", title: "Fragen?", lines: ["Tobias Kranz · Projektleiter E-Akte", "Telefon 040 66969-850"] },
    ],
  },
  {
    type: "excel",
    id: "zk-wirtschaftsplan-2026-umlage",
    title: "Wirtschaftsplan 2026 mit Verbandsumlage je Mitglied (Entwurf)",
    kind: "Wirtschaftsplan",
    fileName: "Wirtschaftsplan 2026 Entwurf Umlageberechnung Stand 2025-10-21",
    org: "zkit",
    unit: "zk-kaufm",
    author: "zk-kuehl",
    date: "2025-10-21",
    tags: ["zahlen"],
    keywords: ["Umlagebedarf", "Arbeitsplatzmonate", "Migrationspauschale", "Stadt Rabensfurt", "528,66"],
    summary:
      "Erfolgsplan 2026 im Vergleich zu 2025, Berechnung der Verbandsumlage nach Arbeitsplätzen (Stadt Rabensfurt anteilig ab 01.07.2026) und Stellenplan. Gut zum Nachrechnen von Umlagesatz, Anteilen und Veränderungen je Mitglied.",
    sheets: [
      {
        name: "Erfolgsplan",
        title: "Wirtschaftsplan 2026 – Erfolgsplan",
        subtitle: "Entwurf zur Anhörung der Verbandsmitglieder · Stand 21.10.2025 · Beträge in Euro",
        columns: [
          { header: "Position", width: 52 },
          { header: "Plan 2025", width: 15, fmt: "eur0" },
          { header: "Plan 2026", width: 15, fmt: "eur0" },
          { header: "Veränderung", width: 14, fmt: "eur0" },
          { header: "Veränderung in %", width: 13, fmt: "pct" },
        ],
        rows: [
          ["Entgelte für Sonderleistungen und Projekte", 420000, 460000, { f: "C{r}-B{r}" }, { f: 'IF(B{r}=0,"neu",D{r}/B{r})' }],
          ["Migrationspauschale Stadt Rabensfurt (einmalig)", 0, 640000, { f: "C{r}-B{r}" }, { f: 'IF(B{r}=0,"neu",D{r}/B{r})' }],
          ["Zuwendungen Förderprogramm „Digitale Kommune“", 300000, 375000, { f: "C{r}-B{r}" }, { f: 'IF(B{r}=0,"neu",D{r}/B{r})' }],
          ["Erträge aus der Auflösung von Sonderposten", 180000, 190000, { f: "C{r}-B{r}" }, { f: 'IF(B{r}=0,"neu",D{r}/B{r})' }],
          ["Sonstige Erträge (Zinsen, Erstattungen)", 38000, 32000, { f: "C{r}-B{r}" }, { f: 'IF(B{r}=0,"neu",D{r}/B{r})' }],
          ["Summe Erträge ohne Verbandsumlage", { f: "SUM(B5:B9)" }, { f: "SUM(C5:C9)" }, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          ["Personalaufwand", 4880000, 5460000, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          ["Lizenzen und Softwarepflege", 1940000, 2310000, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          ["Rechenzentrum, Hardwarewartung, Energie", 610000, 690000, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          ["Netze und Telekommunikation", 420000, 505000, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          ["Externe Dienstleistungen (u. a. Scan-Dienstleistung E-Akte)", 540000, 480000, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          ["Schulung und Fortbildung", 85000, 110000, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          ["Mieten, Gebäude, Bewirtschaftung", 310000, 325000, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          ["Abschreibungen", 1150000, 1380000, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          ["Versicherungen, Prüfung, Verbandsorgane, Sonstiges", 165000, 180000, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          ["Zinsaufwand", 38000, 52000, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          ["Summe Aufwendungen", { f: "SUM(B11:B20)" }, { f: "SUM(C11:C20)" }, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          {
            total: true,
            cells: ["Umlagebedarf (Aufwendungen abzüglich Erträge)", { f: "B21-B10" }, { f: "C21-C10" }, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }],
          },
        ],
        notes: [
          "Personalaufwand 2026: acht zusätzliche Stellen ab 01.04.2026 (siehe Blatt Stellenplan) und erwartete Tarifsteigerung.",
          "Lizenzen 2026: Arbeitsplätze der Stadt Rabensfurt ab Juli sowie angekündigte Preiserhöhung für das Abonnement der Bürosoftware.",
          "Die Migrationspauschale der Stadt Rabensfurt deckt die einmaligen Umstellungskosten (Beitrittsvereinbarung § 5).",
        ],
      },
      {
        name: "Umlage",
        title: "Verbandsumlage 2026 nach Arbeitsplätzen",
        subtitle: "Maßstab nach § 12 Verbandssatzung: Arbeitsplätze zum Stichtag 30.06. des Vorjahres · Stadt Rabensfurt anteilig ab 01.07.2026",
        columns: [
          { header: "Mitglied", width: 36 },
          { header: "Arbeitsplätze 30.06.2024", width: 13, fmt: "int" },
          { header: "Umlage 2025", width: 15, fmt: "eur" },
          { header: "Arbeitsplätze 30.06.2025", width: 13, fmt: "int" },
          { header: "Monate 2026", width: 9, fmt: "int" },
          { header: "Arbeitsplatzmonate 2026", width: 13, fmt: "int" },
          { header: "Satz je Arbeitsplatz und Monat", width: 13, fmt: "eur" },
          { header: "Umlage 2026", width: 15, fmt: "eur" },
          { header: "Anteil", width: 9, fmt: "pct" },
          { header: "Veränderung zu 2025", width: 15, fmt: "eur" },
        ],
        rows: [
          ["Landkreis Altmoorland", 806, { f: "ROUND(B{r}*12*586.14,2)" }, 820, 12, { f: "D{r}*E{r}" }, { f: "ROUND(Erfolgsplan!C$22/F$11,2)" }, { f: "ROUND(F{r}*G{r},2)" }, { f: "H{r}/H$11" }, { f: "H{r}-C{r}" }],
          ["Stadt Altmoor", 288, { f: "ROUND(B{r}*12*586.14,2)" }, 290, 12, { f: "D{r}*E{r}" }, { f: "ROUND(Erfolgsplan!C$22/F$11,2)" }, { f: "ROUND(F{r}*G{r},2)" }, { f: "H{r}/H$11" }, { f: "H{r}-C{r}" }],
          ["Gemeinde Brackenhain", 62, { f: "ROUND(B{r}*12*586.14,2)" }, 64, 12, { f: "D{r}*E{r}" }, { f: "ROUND(Erfolgsplan!C$22/F$11,2)" }, { f: "ROUND(F{r}*G{r},2)" }, { f: "H{r}/H$11" }, { f: "H{r}-C{r}" }],
          ["Kreisvolkshochschule Altmoorland", 44, { f: "ROUND(B{r}*12*586.14,2)" }, 45, 12, { f: "D{r}*E{r}" }, { f: "ROUND(Erfolgsplan!C$22/F$11,2)" }, { f: "ROUND(F{r}*G{r},2)" }, { f: "H{r}/H$11" }, { f: "H{r}-C{r}" }],
          ["Abfallwirtschaftsbetrieb Altmoorland", 108, { f: "ROUND(B{r}*12*586.14,2)" }, 110, 12, { f: "D{r}*E{r}" }, { f: "ROUND(Erfolgsplan!C$22/F$11,2)" }, { f: "ROUND(F{r}*G{r},2)" }, { f: "H{r}/H$11" }, { f: "H{r}-C{r}" }],
          ["Stadt Rabensfurt (Beitritt 01.07.2026)", 0, 0, 430, 6, { f: "D{r}*E{r}" }, { f: "ROUND(Erfolgsplan!C$22/F$11,2)" }, { f: "ROUND(F{r}*G{r},2)" }, { f: "H{r}/H$11" }, { f: "H{r}-C{r}" }],
          {
            total: true,
            cells: [
              "Summe",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              null,
              { f: "SUM(F{first}:F{last})" },
              { f: "ROUND(Erfolgsplan!C22/F{r},2)" },
              { f: "SUM(H{first}:H{last})" },
              { f: "SUM(I{first}:I{last})" },
              { f: "SUM(J{first}:J{last})" },
            ],
          },
        ],
        notes: [
          "Satz 2026 = Umlagebedarf laut Erfolgsplan geteilt durch die Summe der Arbeitsplatzmonate, gerundet auf volle Cent.",
          "Satz 2025: 586,14 € je Arbeitsplatz und Monat (Festsetzung vom 14.01.2025).",
          "Die Summe der Umlagen weicht wegen der Rundung des Satzes geringfügig vom Umlagebedarf ab; die Differenz wird mit dem Jahresergebnis verrechnet.",
          "Arbeitsplatz nach § 12 Abs. 2 Verbandssatzung ist jedes vom Zweckverband betreute Endgerät mit eigener Anmeldung am Verbandsnetz, auch in Kindertagesstätten, Feuerwehrgerätehäusern und Außenstellen.",
          "Fälligkeit: Abschläge zu je einem Viertel am 15.02., 15.05., 15.08. und 15.11.; Stadt Rabensfurt je zur Hälfte am 15.08. und 15.11.2026.",
        ],
      },
      {
        name: "Stellenplan",
        title: "Stellenplan 2026 (Vollzeitäquivalente)",
        columns: [
          { header: "Bereich", width: 48 },
          { header: "Stellen 2025", width: 11, fmt: "dec" },
          { header: "Stellen 2026", width: 11, fmt: "dec" },
          { header: "Veränderung", width: 11, fmt: "dec" },
          { header: "Erläuterung", width: 60 },
        ],
        rows: [
          ["Geschäftsführung und Stab", 4, 4, { f: "C{r}-B{r}" }, ""],
          ["Infrastruktur und Betrieb (Service Desk, Rechenzentrum, Netze und Arbeitsplatz)", 24, 29, { f: "C{r}-B{r}" }, "3 Service Desk und Vor-Ort-Service, 2 Netze – Betreuung der 430 Arbeitsplätze der Stadt Rabensfurt"],
          ["Fachverfahren (E-Akte, Onlinedienste, Finanzen und Personal, Schulung)", 23, 25, { f: "C{r}-B{r}" }, "Fachverfahren der Stadt Rabensfurt, Schulung"],
          ["Kaufmännische Dienste", 7, 8, { f: "C{r}-B{r}" }, "Vergabe und Vertragsmanagement"],
          ["Informationssicherheit und Datenschutz", 4, 4, { f: "C{r}-B{r}" }, ""],
          { total: true, cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, ""] },
        ],
        notes: [
          "Besetzung der neuen Stellen ab 01.04.2026; zwei Stellen werden durch Personalübergang aus der IT der Stadt Rabensfurt besetzt (Personalüberleitungsvertrag in Vorbereitung).",
        ],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "zk-praesentation-wirtschaftsplan-2026",
    title: "Wirtschaftsplan 2026 – Präsentation in der Verbandsversammlung",
    kind: "Präsentation",
    fileName: "TOP 5 Wirtschaftsplan 2026 Verbandsversammlung 2025-12-16",
    org: "zkit",
    unit: "zk-gf",
    author: "zk-vogelsang",
    date: "2025-12-12",
    tags: ["zahlen"],
    keywords: ["Verbandsversammlung", "9,795 Mio. €", "528,66 €", "Migrationspauschale", "70 Stellen"],
    summary:
      "Präsentation des Geschäftsführers zum Wirtschaftsplan 2026: Aufwand, Umlagebedarf, Umlage je Mitglied vor und nach dem Beitritt der Stadt Rabensfurt, Stellenplan, Risiken und Beschlussvorschlag.",
    slides: [
      { t: "title", title: "Wirtschaftsplan 2026", subtitle: "Verbandsversammlung am 16. Dezember 2025 · TOP 5 · Vorlage VV/2025/012" },
      {
        t: "bullets",
        title: "Das Wichtigste in Kürze",
        bullets: [
          "Umlagebedarf 2026: **9,795 Mio. €** (2025: 9,200 Mio. €, + 6,5 %)",
          "Der Umlagesatz sinkt auf **528,66 €** je Arbeitsplatz und Monat (2025: 586,14 €, − 9,8 %)",
          "Stadt Rabensfurt ist ab 01.07.2026 Mitglied: 430 Arbeitsplätze, 2026 anteilig für 6 Monate",
          "Stellenplan wächst von 62 auf 70 Stellen – fast ausschließlich wegen des Beitritts",
          "Investitionen laut Vermögensplan: 1,46 Mio. €, keine Kredite für den laufenden Betrieb",
        ],
        notes:
          "Kernbotschaft: Der Verband wird größer, und für die bisherigen Mitglieder wird der Arbeitsplatz günstiger. Jedes bisherige Mitglied zahlt 2026 weniger als 2025.",
      },
      {
        t: "chart",
        title: "Aufwendungen 2025 und 2026 nach Arten",
        chart: {
          type: "bar",
          categories: ["Personal", "Lizenzen", "RZ und Netze", "Externe Dienstleistungen", "Abschreibungen", "Sonstiges"],
          series: [
            { name: "Plan 2025", values: [4880, 1940, 1030, 540, 1150, 598] },
            { name: "Plan 2026", values: [5460, 2310, 1195, 480, 1380, 667] },
          ],
          unit: "Tsd. €",
        },
        caption: "Summe: 10,138 Mio. € (2025) und 11,492 Mio. € (2026)",
        notes: "Sonstiges umfasst Schulung, Mieten und Bewirtschaftung, Versicherungen, Verbandsorgane und Zinsen.",
      },
      {
        t: "table",
        title: "Vom Aufwand zur Umlage",
        header: ["Position", "Plan 2025", "Plan 2026"],
        rows: [
          ["Aufwendungen gesamt", "10.138.000 €", "11.492.000 €"],
          ["– Entgelte für Sonderleistungen", "420.000 €", "460.000 €"],
          ["– Migrationspauschale Stadt Rabensfurt", "–", "640.000 €"],
          ["– Zuwendungen „Digitale Kommune“", "300.000 €", "375.000 €"],
          ["– Sonderposten und sonstige Erträge", "218.000 €", "222.000 €"],
          ["= Umlagebedarf", "9.200.000 €", "9.795.000 €"],
        ],
        notes:
          "Die Migrationspauschale zahlt Rabensfurt einmalig. Sie deckt die Umstellungskosten, damit die bisherigen Mitglieder den Beitritt nicht mitfinanzieren.",
      },
      {
        t: "table",
        title: "Umlage je Mitglied",
        header: ["Mitglied", "Arbeitsplätze", "Umlage 2025", "Umlage 2026", "Veränderung"],
        rows: [
          ["Landkreis Altmoorland", "820", "5.669.146 €", "5.202.014 €", "− 467.132 €"],
          ["Stadt Altmoor", "290", "2.025.700 €", "1.839.737 €", "− 185.963 €"],
          ["Gemeinde Brackenhain", "64", "436.088 €", "406.011 €", "− 30.077 €"],
          ["Kreisvolkshochschule Altmoorland", "45", "309.482 €", "285.476 €", "− 24.006 €"],
          ["Abfallwirtschaftsbetrieb Altmoorland", "110", "759.637 €", "697.831 €", "− 61.806 €"],
          ["Stadt Rabensfurt (ab 01.07.2026)", "430", "–", "1.363.943 €", "neu"],
          ["Summe", "1.759", "9.200.053 €", "9.795.012 €", ""],
        ],
        notes:
          "Arbeitsplätze zum Stichtag 30.06.2025. Die kleinen Abweichungen zum Umlagebedarf entstehen durch die Rundung des Satzes auf volle Cent.",
      },
      {
        t: "twocol",
        title: "Warum steigt der Aufwand – und warum sinkt trotzdem der Satz?",
        left: {
          heading: "Mehraufwand 2026",
          bullets: [
            "Personal + 580.000 € (8 neue Stellen ab 01.04.2026, Tarif)",
            "Lizenzen + 370.000 € (Rabensfurt, Preiserhöhung Bürosoftware)",
            "Abschreibungen + 230.000 € (Server, Speicher, Netzkomponenten)",
            "Netze + 85.000 € (Anbindung der Rabensfurter Standorte)",
          ],
        },
        right: {
          heading: "Mehr Schultern",
          bullets: [
            "18.528 statt 15.696 Arbeitsplatzmonate",
            "Fixkosten für Rechenzentrum, Sicherheit und Lizenzserver verteilen sich auf mehr Arbeitsplätze",
            "Umstellungskosten über die Migrationspauschale gedeckt",
            "Förderung „Digitale Kommune“ + 75.000 €",
          ],
        },
      },
      {
        t: "bullets",
        title: "Stellenplan 2026",
        bullets: [
          "70 Stellen (2025: 62)",
          { text: "+ 5 Infrastruktur und Betrieb", sub: ["3 Service Desk und Vor-Ort-Service", "2 Netze und Arbeitsplatz"] },
          "+ 2 Fachverfahren (Schulung, Fachverfahren der Stadt Rabensfurt)",
          "+ 1 Kaufmännische Dienste (Vergabe und Verträge)",
          "2 der 8 neuen Stellen werden mit Beschäftigten der Stadt Rabensfurt besetzt (Personalübergang)",
        ],
        notes: "Besetzung ab 01.04.2026, deshalb im Personalaufwand nur für neun Monate veranschlagt.",
      },
      {
        t: "bullets",
        title: "Risiken",
        bullets: [
          "Tarifabschluss 2026: jeder Prozentpunkt kostet rund 50.000 €",
          "Preiserhöhung beim Abonnement der Bürosoftware – Verhandlungen laufen",
          "Förderbescheid „Digitale Kommune“ 2026 (375.000 €) liegt noch nicht vor",
          "Zeitplan der Migration: Umstellung aller Rabensfurter Arbeitsplätze bis 31.12.2026",
        ],
        notes: "Für Tarif und Lizenzen ist ein Puffer von zusammen 90.000 € in den Ansätzen enthalten.",
      },
      {
        t: "bullets",
        title: "Beschlussvorschlag",
        bullets: [
          "Die Verbandsversammlung beschließt den Wirtschaftsplan 2026 mit Erfolgsplan, Vermögensplan und Stellenplan.",
          "Die Verbandsumlage 2026 wird auf 9.795.000 € festgesetzt; der Umlagesatz beträgt 528,66 € je Arbeitsplatz und Monat.",
          "Der Geschäftsführer wird beauftragt, die Umlage nach § 12 der Verbandssatzung festzusetzen und zu erheben.",
        ],
      },
      { t: "end", title: "Vielen Dank – Fragen?", lines: ["Dr. Reinhard Vogelsang · Geschäftsführer", "Thorsten Kühl · Leiter Kaufmännische Dienste", "Telefon 040 66969-800"] },
    ],
  },
  {
    type: "word",
    id: "zk-niederschrift-verbandsversammlung-2025-12",
    title: "Niederschrift der Verbandsversammlung vom 16.12.2025 (öffentlicher Teil)",
    kind: "Niederschrift",
    fileName: "Niederschrift Verbandsversammlung 2025-12-16 oeffentlicher Teil",
    org: "zkit",
    unit: "zk-gf",
    author: "zk-reimers",
    date: "2026-01-08",
    tags: ["widersprueche"],
    keywords: ["VV/2025/011", "Änderungssatzung", "Beitrittsvereinbarung", "1.219 Tickets", "Zählweise"],
    summary:
      "Niederschrift der Verbandsversammlung mit Bericht des Geschäftsführers, Beitritt der Stadt Rabensfurt, Wirtschaftsplan 2026 und einer Anfrage aus Brackenhain zur Zählweise der Arbeitsplätze. Eingebaute Widersprüche: einstimmiger Beschluss mit 11 Ja-Stimmen bei nur 10 anwesenden Stimmberechtigten; einmal acht, einmal sechs zusätzliche Stellen.",
    meta: [
      ["Aktenzeichen", "GF 02.10-2025/04"],
      ["Sitzung", "4. Sitzung der Verbandsversammlung"],
      ["Status", "öffentlich"],
    ],
    subject: "Niederschrift über die 4. Sitzung der Verbandsversammlung am 16. Dezember 2025 – öffentlicher Teil",
    blocks: [
      {
        t: "table",
        header: ["Angabe", "Inhalt"],
        rows: [
          ["Ort", "Kreishaus Altmoor, Großer Sitzungssaal, Am Moordamm 4, 00752 Altmoor"],
          ["Beginn / Ende", "16:00 Uhr / 18:25 Uhr (öffentlicher Teil bis 18:05 Uhr)"],
          ["Vorsitz", "Landrat Wolfgang Tiedemann, Verbandsvorsitzender"],
          ["Schriftführung", "Sabine Reimers, Geschäftsführung des Zweckverbands"],
        ],
        widths: [2, 6],
      },
      { t: "h2", text: "Anwesenheit" },
      {
        t: "table",
        header: ["Verbandsmitglied", "Vertreterinnen und Vertreter", "Stimmen"],
        rows: [
          ["Landkreis Altmoorland", "Landrat Wolfgang Tiedemann, Erste Kreisrätin Annette Kloß, Kreiskämmerin Birte Johannsen, Kreistagsabgeordneter Hermann Lüdeke", "4"],
          ["Stadt Altmoor", "Bürgermeisterin Dagmar Wiechmann, Stadtkämmerer Jörg Pundt; entschuldigt: Ratsherr Bernd Höltje", "3 (davon 2 anwesend)"],
          ["Gemeinde Brackenhain", "Bürgermeister Frank Ruhnau, Kämmerin Petra Schnoor", "2"],
          ["Kreisvolkshochschule Altmoorland", "Dr. Insa Freese, Leiterin", "1"],
          ["Abfallwirtschaftsbetrieb Altmoorland", "Rolf Dirksen, Betriebsleiter", "1"],
        ],
        widths: [3, 6, 2],
      },
      {
        t: "p",
        text: "**Gäste ohne Stimmrecht:** Bürgermeisterin Corinna Engelke und Teamleiter IT Dominik Hesse (Stadt Rabensfurt). **Vom Zweckverband:** Geschäftsführer Dr. Reinhard Vogelsang, Thorsten Kühl (Kaufmännische Dienste), Andreas Ritter (Infrastruktur und Betrieb, zu TOP 3 und 4), Elias Rahimi (Informationssicherheit, zu TOP 3). **Presse:** Altmoorländer Kreisblatt. **Zuhörende:** drei Personen.",
      },
      { t: "h2", text: "Tagesordnung (öffentlicher Teil)" },
      {
        t: "ol",
        items: [
          "Eröffnung, Feststellung der ordnungsgemäßen Einladung und der Beschlussfähigkeit",
          "Genehmigung der Niederschrift über die Sitzung vom 24.06.2025",
          "Bericht des Geschäftsführers",
          "Beitritt der Stadt Rabensfurt – 3. Satzung zur Änderung der Verbandssatzung (Vorlage VV/2025/011)",
          "Wirtschaftsplan 2026 mit Stellenplan und Festsetzung der Verbandsumlage (Vorlage VV/2025/012)",
          "Mittelfristige Finanzplanung 2025 bis 2029 (Kenntnisnahme)",
          "Anfragen und Mitteilungen",
        ],
      },
      { t: "h2", text: "TOP 1 – Eröffnung und Beschlussfähigkeit" },
      {
        t: "p",
        text: "Der Vorsitzende eröffnet die Sitzung um 16:00 Uhr und begrüßt die Anwesenden, besonders Bürgermeisterin Engelke als künftiges Mitglied. Er stellt fest, dass mit Schreiben vom 02.12.2025 form- und fristgerecht eingeladen wurde und die Verbandsversammlung mit 10 von 11 Stimmen beschlussfähig ist. Gegen die Tagesordnung werden keine Einwände erhoben. Die Vergabe des Rahmenvertrags für Netzwerkkomponenten wird im nichtöffentlichen Teil behandelt.",
      },
      { t: "h2", text: "TOP 2 – Genehmigung der Niederschrift vom 24.06.2025" },
      { t: "p", text: "Die Niederschrift wird ohne Änderungen genehmigt. **Abstimmung:** 10 Ja-Stimmen, keine Gegenstimmen, keine Enthaltungen." },
      { t: "h2", text: "TOP 3 – Bericht des Geschäftsführers" },
      { t: "p", text: "Herr Dr. Vogelsang berichtet anhand einer Präsentation über die folgenden Themen:" },
      {
        t: "ul",
        items: [
          "**E-Akte:** Ende November arbeiten 1.410 Beschäftigte produktiv mit der E-Akte. Das Ziel von 1.600 Nutzenden bis Jahresende wird nicht erreicht; erwartet werden rund 1.480. Der Rollout im Jugendamt des Landkreises beginnt im Januar 2026, die Gemeinde Brackenhain folgt im Februar 2026. Das Projektbudget wird nach heutiger Prognose um rund 40.000 € überschritten (Nachscans beim Scan-Dienstleister).",
          "**Störung am 09.10.2025:** Wegen eines abgelaufenen Serverzertifikats war die E-Akte gut eine Stunde nicht erreichbar. Die Nachbetrachtung liegt vor. Zertifikate werden künftig zentral im Team Rechenzentrum verwaltet; das Monitoring warnt 60, 30 und 7 Tage vor Ablauf.",
          "**Phishing im August 2025:** Eine gefälschte Mail zur Gehaltsabrechnung erreichte 412 Postfächer. Zwei Konten wurden kompromittiert und innerhalb von zwei Stunden gesperrt. Der Landkreis hat als Verantwortlicher die Meldung an die Datenschutzaufsicht abgegeben. Seit September laufen Awareness-Schulungen; bisher haben 640 Beschäftigte teilgenommen.",
          "**Service Desk:** Im 3. Quartal 2025 gingen 1.219 Tickets ein (Vorquartal 1.105). Die vereinbarten Reaktions- und Lösungszeiten wurden in 89 % der Fälle eingehalten.",
        ],
      },
      {
        t: "p",
        text: "Herr Ruhnau fragt, warum die Gemeinde Brackenhain in der Ticketstatistik mit 1,5 Tickets je Arbeitsplatz den höchsten Wert hat. Herr Ritter erklärt, dass kleinere Verwaltungen ohne eigene IT-Ansprechperson häufiger den Service Desk anrufen; ein monatlicher Vor-Ort-Termin in Brackenhain sei ab Februar eingeplant. Frau Kloß bittet darum, die Nachbetrachtung zur Zertifikatsstörung den Mitgliedern zur Verfügung zu stellen. Herr Dr. Vogelsang sagt dies zu.",
      },
      { t: "p", text: "Die Verbandsversammlung nimmt den Bericht zur Kenntnis." },
      { t: "h2", text: "TOP 4 – Beitritt der Stadt Rabensfurt (Vorlage VV/2025/011)" },
      {
        t: "p",
        text: "Herr Dr. Vogelsang erläutert die Vorlage. Der Stadtrat der Stadt Rabensfurt hat am 11.12.2025 den Beitritt zum Zweckverband beschlossen. Der Beitritt soll zum 01.07.2026 wirksam werden; bis zum 31.12.2026 werden alle 430 Arbeitsplätze der Stadtverwaltung umgestellt. Die einmaligen Umstellungskosten trägt die Stadt über eine Migrationspauschale von 640.000 €, die in der Beitrittsvereinbarung geregelt ist. Mit der 3. Änderungssatzung erhält die Stadt Rabensfurt drei Sitze und drei Stimmen in der Verbandsversammlung; die Zahl der Stimmen steigt damit auf 14. Die Änderung der Verbandssatzung bedarf der Genehmigung durch das Ministerium für Kommunales und Verwaltungsentwicklung als Aufsichtsbehörde und wird anschließend öffentlich bekannt gemacht.",
      },
      {
        t: "p",
        text: "Frau Wiechmann fragt, ob die Betreuung der bisherigen Mitglieder unter der Umstellung leiden werde. Herr Ritter antwortet, dass ein eigenes Migrationsteam gebildet wird und der Service Desk drei zusätzliche Stellen erhält; während der Umstellungswellen gebe es eine eigene Hotline für Rabensfurt. Herr Lüdeke fragt nach den Folgen einer Verzögerung. Herr Dr. Vogelsang verweist auf § 7 der Beitrittsvereinbarung: Verzögerungen, die der Zweckverband zu vertreten hat, gehen nicht zulasten der Stadt; Verzögerungen aus dem Verantwortungsbereich der Stadt trägt diese selbst. Bürgermeisterin Engelke bedankt sich für die gute Zusammenarbeit in der Vorbereitung.",
      },
      { t: "p", text: "**Beschluss:**" },
      {
        t: "ol",
        items: [
          "Die Verbandsversammlung stimmt dem Beitritt der Stadt Rabensfurt zum Zweckverband Kommunale IT Altmoor mit Wirkung zum 01.07.2026 zu.",
          "Die 3. Satzung zur Änderung der Verbandssatzung wird in der Fassung der Anlage 3 beschlossen.",
          "Der Geschäftsführer wird beauftragt, die Genehmigung der Aufsichtsbehörde einzuholen, die Bekanntmachung zu veranlassen und die Beitrittsvereinbarung zu unterzeichnen.",
        ],
      },
      { t: "p", text: "**Abstimmung:** einstimmig (11 Ja-Stimmen)." },
      { t: "h2", text: "TOP 5 – Wirtschaftsplan 2026 (Vorlage VV/2025/012)" },
      {
        t: "p",
        text: "Herr Kühl stellt den Wirtschaftsplan anhand der Präsentation (Anlage 2) vor. Der Umlagebedarf beträgt 9.795.000 € (Vorjahr 9.200.000 €). Weil sich die Kosten ab Juli auf die zusätzlichen Arbeitsplätze der Stadt Rabensfurt verteilen, sinkt der Umlagesatz von 586,14 € auf 528,66 € je Arbeitsplatz und Monat. Der Stellenplan sieht 70 Stellen vor (Vorjahr 62). Der Vermögensplan enthält Investitionen von 1.460.000 €, davon 600.000 € über Kredit.",
      },
      {
        t: "p",
        text: "Frau Johannsen begrüßt den sinkenden Satz und fragt nach den Risiken beim Tarifabschluss. Herr Kühl beziffert jeden Prozentpunkt Tarifsteigerung mit rund 50.000 €. Herr Dr. Vogelsang erläutert, dass von den sechs zusätzlichen Stellen zwei mit Beschäftigten aus der IT der Stadt Rabensfurt besetzt werden sollen.",
      },
      {
        t: "p",
        text: "Frau Schnoor fragt nach der Zählweise der Arbeitsplätze: Die Gemeinde Brackenhain zähle 58 Arbeitsplätze, der Zweckverband 64. Herr Kühl erklärt, dass nach § 12 Abs. 2 der Verbandssatzung jedes betreute Endgerät mit eigener Anmeldung zählt, also auch die Gruppen-PCs im Kindergarten und die Rechner in den Feuerwehrgerätehäusern. Frau Schnoor kündigt eine schriftliche Nachfrage an. Herr Ruhnau beantragt, die Zählweise in der nächsten Sitzung grundsätzlich zu beraten. Der Vorsitzende sagt zu, das Thema für die Sitzung im Juni 2026 vorzusehen.",
      },
      { t: "p", text: "**Beschluss:**" },
      {
        t: "ol",
        items: [
          "Die Verbandsversammlung beschließt den Wirtschaftsplan 2026 mit Erfolgsplan, Vermögensplan und Stellenplan in der Fassung der Vorlage VV/2025/012.",
          "Die Verbandsumlage 2026 wird auf 9.795.000 € festgesetzt. Der Umlagesatz beträgt 528,66 € je Arbeitsplatz und Monat.",
        ],
      },
      { t: "p", text: "**Abstimmung:** 8 Ja-Stimmen, keine Gegenstimmen, 2 Enthaltungen (Gemeinde Brackenhain)." },
      { t: "h2", text: "TOP 6 – Mittelfristige Finanzplanung 2025 bis 2029" },
      {
        t: "p",
        text: "Herr Kühl erläutert die Finanzplanung. Für 2027, das erste volle Jahr mit der Stadt Rabensfurt, rechnet die Geschäftsführung mit einem Umlagesatz von rund 505 € je Arbeitsplatz und Monat. Größte Unsicherheit sind die Lizenzkosten. Die Verbandsversammlung nimmt die Finanzplanung zur Kenntnis.",
      },
      { t: "h2", text: "TOP 7 – Anfragen und Mitteilungen" },
      {
        t: "ul",
        items: [
          "Herr Dirksen bittet um Unterstützung am Samstag, weil die Waage am Wertstoffhof über das Fachverfahren läuft. Herr Ritter sagt eine Rufbereitschaft samstags von 8 bis 14 Uhr ab Januar 2026 zu.",
          "Frau Dr. Freese teilt mit, dass die Kreisvolkshochschule ab Herbst 2026 Kurse zur E-Akte für die Beschäftigten der Mitglieder anbieten möchte.",
          "Termine 2026: Die nächsten Sitzungen finden am Dienstag, 23.06.2026, und am Dienstag, 15.12.2026, jeweils um 16:00 Uhr statt.",
        ],
      },
      { t: "p", text: "Der Vorsitzende schließt den öffentlichen Teil um 18:05 Uhr." },
      { t: "p", text: "Anlagen: 1 Anwesenheitsliste · 2 Präsentation Wirtschaftsplan 2026 · 3 Dritte Satzung zur Änderung der Verbandssatzung" },
      { t: "signature", lines: ["Wolfgang Tiedemann, Vorsitzender", "Sabine Reimers, Schriftführerin"] },
    ],
  },
  {
    type: "word",
    id: "zk-leitlinie-informationssicherheit",
    title: "Leitlinie zur Informationssicherheit, Version 2.0",
    kind: "Leitlinie",
    fileName: "ISMS-L-01 Leitlinie zur Informationssicherheit Version 2.0",
    org: "zkit",
    unit: "zk-isb",
    author: "zk-rahimi",
    date: "2025-03-12",
    keywords: ["ISMS-L-01", "IT-Grundschutz", "Standard-Absicherung", "Informationssicherheitsbeauftragte", "Schutzbedarf", "Zehn Regeln"],
    summary:
      "Grundsatzdokument des Zweckverbands zur Informationssicherheit: Ziele, Vorgehen nach IT-Grundschutz, Rollen und Verantwortlichkeiten, Mindestanforderungen, Umgang mit Sicherheitsvorfällen und zehn Regeln in einfacher Sprache für alle Beschäftigten. Sehr lang – gut zum Zusammenfassen, für Fragen an das Dokument und zum Übertragen in Leichte Sprache.",
    meta: [
      ["Dokument", "ISMS-L-01"],
      ["Version", "2.0 (ersetzt Version 1.1 vom 14.09.2021)"],
      ["Status", "in Kraft ab 01.04.2025"],
      ["Einstufung", "öffentlich"],
    ],
    subject: "Leitlinie zur Informationssicherheit des Zweckverbands Kommunale IT Altmoor",
    blocks: [
      {
        t: "note",
        text: "**Kurz gesagt:** Der Zweckverband betreibt die IT für den Landkreis, die Stadt Altmoor, die Gemeinde Brackenhain, die Kreisvolkshochschule und den Abfallwirtschaftsbetrieb. Ohne funktionierende und sichere IT können dort keine Bescheide erlassen, keine Gehälter gezahlt und keine Autos zugelassen werden. Diese Leitlinie legt fest, warum Informationssicherheit für uns wichtig ist, wer wofür verantwortlich ist und welche Regeln für alle gelten. Die wichtigsten Regeln für den Arbeitsalltag stehen in Anlage 1.",
      },
      { t: "h1", text: "1 Präambel" },
      {
        t: "p",
        text: "Der Zweckverband Kommunale IT Altmoor (im Folgenden: Zweckverband) stellt seinen Mitgliedern Arbeitsplätze, Netze, Rechenzentrumsleistungen, Fachverfahren und Onlinedienste bereit. Rund 1.300 Beschäftigte der Mitglieder arbeiten täglich mit diesen Diensten. In den Systemen des Zweckverbands werden Daten von Bürgerinnen und Bürgern, Unternehmen und Beschäftigten verarbeitet – von der Meldeadresse über Sozialleistungsakten bis zu Gehaltsdaten. Viele dieser Daten sind besonders schutzwürdig.",
      },
      {
        t: "p",
        text: "Die Bürgerinnen und Bürger erwarten zu Recht, dass die Verwaltung mit ihren Daten sorgfältig umgeht und ihre Leistungen zuverlässig erbringt. Ein erfolgreicher Angriff, ein längerer Ausfall oder ein Datenabfluss würde nicht nur hohe Kosten verursachen, sondern auch das Vertrauen in die kommunale Selbstverwaltung beschädigen. Mehrere Kommunalverwaltungen in Deutschland waren in den vergangenen Jahren nach Angriffen über Wochen und Monate nur eingeschränkt arbeitsfähig.",
      },
      {
        t: "p",
        text: "Die Geschäftsführung des Zweckverbands bekennt sich daher ausdrücklich zur Informationssicherheit als Leitungsaufgabe. Sie trägt die Gesamtverantwortung, stellt die erforderlichen Mittel bereit und erwartet von allen Beschäftigten, dass sie diese Leitlinie kennen und beachten. Informationssicherheit ist kein Projekt mit Enddatum, sondern ein dauerhafter Prozess, der regelmäßig überprüft und verbessert wird.",
      },
      { t: "h1", text: "2 Zweck und Geltungsbereich" },
      {
        t: "p",
        text: "Diese Leitlinie ist das oberste Dokument des Informationssicherheitsmanagementsystems (ISMS) des Zweckverbands. Sie beschreibt die Ziele, die Strategie und die Organisation der Informationssicherheit. Alle weiteren Regelungen – Richtlinien, Dienstanweisungen, Sicherheitskonzepte, Betriebshandbücher und das Notfallhandbuch – bauen auf ihr auf und dürfen ihr nicht widersprechen.",
      },
      { t: "p", text: "Die Leitlinie gilt für:" },
      {
        t: "ul",
        items: [
          "alle Beschäftigten des Zweckverbands einschließlich Auszubildender, Praktikantinnen und Praktikanten sowie Leiharbeitskräfte,",
          "alle Informationen, Anwendungen, IT-Systeme, Netze und Räume, die der Zweckverband selbst betreibt oder für seine Mitglieder betreibt (Informationsverbund des Zweckverbands),",
          "alle Dienstleister und Auftragnehmer, soweit sie Zugang zu diesem Informationsverbund haben; sie werden vertraglich darauf verpflichtet,",
          "Informationen in jeder Form – elektronisch, auf Papier oder im Gespräch.",
        ],
      },
      {
        t: "p",
        text: "Für die IT-Nutzung durch die Beschäftigten der Verbandsmitglieder gelten zusätzlich deren eigene Dienstanweisungen. Der Zweckverband stimmt seine Vorgaben mit den Mitgliedern ab, damit an den Schnittstellen keine Lücken entstehen (siehe Abschnitt 9). Mit dem Beitritt weiterer Mitglieder erweitert sich der Geltungsbereich ohne gesonderten Beschluss.",
      },
      { t: "h1", text: "3 Begriffe" },
      {
        t: "table",
        header: ["Begriff", "Bedeutung in dieser Leitlinie"],
        rows: [
          ["Informationssicherheit", "Schutz von Informationen vor Verlust der Vertraulichkeit, Integrität und Verfügbarkeit – unabhängig davon, ob sie elektronisch oder auf Papier vorliegen."],
          ["Vertraulichkeit", "Nur befugte Personen können Informationen lesen oder nutzen."],
          ["Integrität", "Informationen und Systeme sind vollständig und unverfälscht; Änderungen sind nachvollziehbar."],
          ["Verfügbarkeit", "Informationen und Dienste stehen zur Verfügung, wenn sie gebraucht werden."],
          ["Informationsverbund", "Alle Informationen, Prozesse, Anwendungen, IT-Systeme, Räume und Personen, für die das ISMS gilt."],
          ["Schutzbedarf", "Einstufung, wie schwer die Folgen wären, wenn Vertraulichkeit, Integrität oder Verfügbarkeit verletzt würden (normal, hoch, sehr hoch)."],
          ["ISMS", "Informationssicherheitsmanagementsystem: Regeln, Rollen und Abläufe, mit denen Informationssicherheit geplant, umgesetzt, überprüft und verbessert wird."],
          ["Sicherheitsvorfall", "Ereignis, das die Vertraulichkeit, Integrität oder Verfügbarkeit von Informationen gefährdet oder bereits verletzt hat, zum Beispiel ein Schadprogramm, ein gestohlenes Notebook oder eine Phishing-Mail, auf die jemand hereingefallen ist."],
          ["Auftragsverarbeitung", "Verarbeitung personenbezogener Daten durch den Zweckverband im Auftrag eines Mitglieds nach Art. 28 DSGVO; das Mitglied bleibt Verantwortlicher."],
        ],
        widths: [3, 8],
      },
      { t: "h1", text: "4 Stellenwert der Informationssicherheit" },
      {
        t: "p",
        text: "Fast alle Aufgaben der Verbandsmitglieder hängen heute von der IT ab. Ein Ausfall des Rechenzentrums für einen Tag bedeutet zum Beispiel: Die Zulassungsstelle kann keine Fahrzeuge zulassen, das Jugendamt hat keinen Zugriff auf laufende Fallakten, die Kasse kann keine Zahlungen anweisen und die Bürgerinnen und Bürger erreichen die Onlinedienste nicht. Ein Datenabfluss aus der Eingliederungshilfe oder der Personalverwaltung kann Menschen dauerhaft schaden.",
      },
      {
        t: "p",
        text: "Die Bedrohungslage hat sich in den vergangenen Jahren deutlich verschärft. Angriffe mit Erpressungssoftware richten sich gezielt auch gegen Kommunen und ihre IT-Dienstleister. Ein Angriff auf den Zweckverband trifft nicht eine Verwaltung, sondern alle Mitglieder gleichzeitig. Daraus folgt eine besondere Verantwortung: Der Zweckverband muss mindestens so gut geschützt sein wie das am besten geschützte Mitglied es selbst wäre.",
      },
      {
        t: "p",
        text: "Informationssicherheit ist zugleich Voraussetzung für die Digitalisierung. Die Einführung der E-Akte, der Ausbau der Onlinedienste nach dem Onlinezugangsgesetz (OZG) und der Wegfall von Papierakten sind nur verantwortbar, wenn die elektronischen Informationen mindestens so sicher sind wie die Papierakte im verschlossenen Schrank.",
      },
      { t: "h1", text: "5 Sicherheitsziele" },
      { t: "p", text: "Der Zweckverband verfolgt die folgenden Sicherheitsziele. Sie sind nach ihrer Bedeutung für die Mitglieder geordnet, gelten aber gleichrangig nebeneinander:" },
      {
        t: "ol",
        items: [
          "**Verfügbarkeit der kritischen Dienste:** Die Dienste, von denen Zahlungen, Fristen und Leistungen für Bürgerinnen und Bürger abhängen, sind während der Servicezeiten (Montag bis Freitag 7:00 bis 18:00 Uhr) mit mindestens 99,5 % verfügbar. Nach einem Ausfall des Rechenzentrums werden sie in der im Notfallhandbuch festgelegten Reihenfolge und Zeit wiederhergestellt.",
          "**Vertraulichkeit:** Personenbezogene Daten und andere schutzbedürftige Informationen sind nur den Personen zugänglich, die sie für ihre Aufgabe benötigen (Prinzip der minimalen Rechte, „Need-to-know“).",
          "**Integrität:** Daten in Fachverfahren, insbesondere Zahlungs-, Steuer- und Personaldaten, werden vor unbemerkter Veränderung geschützt. Änderungen sind einer Person zuzuordnen.",
          "**Rechtskonformität:** Der Zweckverband erfüllt die Anforderungen der Datenschutz-Grundverordnung, des Bundesdatenschutzgesetzes, des Landesdatenschutzgesetzes (LDSG) und der für die Fachverfahren geltenden Vorschriften sowie seine vertraglichen Pflichten gegenüber den Mitgliedern.",
          "**Nachvollziehbarkeit:** Sicherheitsrelevante Ereignisse werden protokolliert, sodass Vorfälle aufgeklärt und Verantwortlichkeiten festgestellt werden können. Die Protokollierung beachtet die Rechte der Beschäftigten; eine Leistungs- und Verhaltenskontrolle findet nicht statt.",
          "**Wirtschaftlichkeit:** Sicherheitsmaßnahmen stehen in einem angemessenen Verhältnis zum Schutzbedarf. Restrisiken werden bewusst und dokumentiert getragen, nicht verdrängt.",
          "**Vertrauen:** Mitglieder, Aufsichtsbehörden und die Öffentlichkeit können sich darauf verlassen, dass der Zweckverband Vorfälle offen und zeitnah meldet.",
        ],
      },
      { t: "h1", text: "6 Rechtliche und fachliche Grundlagen" },
      {
        t: "p",
        text: "Grundlage sind insbesondere die Verbandssatzung, die Verträge zur Auftragsverarbeitung mit den Mitgliedern nach Art. 28 DSGVO, die Anforderungen an die Sicherheit der Verarbeitung nach Art. 32 DSGVO, das LDSG sowie die Vorgaben für den Anschluss an die Verbindungsnetze der Verwaltung. Die Anforderungen der NIS-2-Richtlinie (EU) 2022/2555 und ihrer Umsetzung im Bundes- und Landesrecht werden laufend beobachtet; das ISMS ist so angelegt, dass es ihnen entspricht, auch soweit der Zweckverband nicht unmittelbar verpflichtet ist.",
      },
      {
        t: "p",
        text: "Fachlich richtet sich der Zweckverband nach der Methodik des IT-Grundschutzes (Standards 200-1 bis 200-4 und IT-Grundschutz-Kompendium in der jeweils aktuellen Edition). Wo Hersteller oder Fachverfahren eigene Sicherheitsvorgaben machen, werden diese zusätzlich beachtet.",
      },
      { t: "h1", text: "7 Vorgehen nach IT-Grundschutz" },
      {
        t: "p",
        text: "Der Zweckverband baut sein ISMS schrittweise auf. Ziel ist die **Standard-Absicherung** des gesamten Informationsverbunds bis zum 31.12.2027. Für die besonders kritischen Bereiche – Rechenzentrum, Verzeichnisdienst, E-Mail, E-Akte sowie die Fachverfahren für Finanzen und Personal – wird vorab bis zum 31.12.2025 die Kern-Absicherung umgesetzt. Das Vorgehen folgt diesen Schritten:",
      },
      {
        t: "ol",
        items: [
          "**Strukturanalyse:** Erfassung aller Geschäftsprozesse, Anwendungen, IT-Systeme, Netzverbindungen und Räume samt ihrer Abhängigkeiten. Die Übersicht wird in der ISMS-Software gepflegt und mindestens jährlich aktualisiert.",
          "**Schutzbedarfsfeststellung:** Gemeinsam mit den Mitgliedern wird für jede Anwendung festgestellt, welcher Schaden bei einer Verletzung von Vertraulichkeit, Integrität und Verfügbarkeit entstehen würde. Der Schutzbedarf wird auf die IT-Systeme und Räume übertragen (Maximumprinzip).",
          "**Modellierung:** Den Zielobjekten werden die passenden Bausteine des IT-Grundschutz-Kompendiums zugeordnet.",
          "**IT-Grundschutz-Check:** Es wird geprüft, welche Anforderungen bereits erfüllt sind, welche teilweise und welche nicht. Das Ergebnis wird je Baustein dokumentiert.",
          "**Risikoanalyse:** Für Zielobjekte mit hohem oder sehr hohem Schutzbedarf und für Bereiche, die durch die Bausteine nicht abgedeckt sind, wird eine zusätzliche Risikoanalyse nach Standard 200-3 durchgeführt.",
          "**Umsetzungsplanung:** Fehlende Maßnahmen werden priorisiert, mit Verantwortlichen, Terminen und Kosten versehen und im Sicherheitskonzept festgehalten. Die Geschäftsführung gibt den Umsetzungsplan frei.",
          "**Umsetzung und Überprüfung:** Der Stand wird vierteljährlich im Informationssicherheitsteam und jährlich im Managementbericht überprüft.",
        ],
      },
      {
        t: "p",
        text: "Eine Zertifizierung auf Basis von IT-Grundschutz ist mittelfristig vorgesehen. Über den Zeitpunkt entscheidet die Verbandsversammlung auf Vorschlag der Geschäftsführung.",
      },
      { t: "h1", text: "8 Organisation und Verantwortlichkeiten" },
      {
        t: "p",
        text: "Informationssicherheit gelingt nur, wenn die Aufgaben klar verteilt sind und alle Beteiligten wissen, was von ihnen erwartet wird. Die folgende Übersicht fasst die Rollen zusammen:",
      },
      {
        t: "table",
        header: ["Rolle", "Wer", "Aufgaben"],
        rows: [
          ["Geschäftsführung", "Geschäftsführer", "Gesamtverantwortung; beschließt Leitlinie und Sicherheitskonzept; stellt Personal und Mittel bereit; entscheidet über die Übernahme von Restrisiken; berichtet der Verbandsversammlung."],
          ["Informationssicherheitsbeauftragte oder Informationssicherheitsbeauftragter (ISB)", "Stabsstelle Informationssicherheit und Datenschutz", "Steuert das ISMS; erstellt und pflegt das Sicherheitskonzept; berät Geschäftsführung und Bereiche; prüft die Umsetzung; leitet die Bearbeitung von Sicherheitsvorfällen; erstellt den jährlichen Managementbericht."],
          ["Informationssicherheitsteam", "ISB, Bereichsleitungen Infrastruktur und Betrieb sowie Fachverfahren, Teamleitung Rechenzentrum, Datenschutzbeauftragte", "Tagt monatlich (Jour fixe Informationssicherheit); bewertet Risiken und Vorfälle; stimmt Maßnahmen zwischen den Bereichen ab."],
          ["Datenschutzbeauftragte", "Datenschutzbeauftragte des Zweckverbands", "Überwacht die Einhaltung des Datenschutzrechts; wird bei allen Vorfällen mit Personenbezug sofort beteiligt; berät bei Datenschutz-Folgenabschätzungen."],
          ["Bereichs- und Teamleitungen", "alle Führungskräfte", "Setzen die Maßnahmen in ihrem Bereich um; sorgen dafür, dass ihre Beschäftigten geschult sind; melden Risiken und Vorfälle."],
          ["Verfahrens- und Systemverantwortliche", "je Anwendung und System benannt", "Betreiben ihr System nach dem Sicherheitskonzept; pflegen Dokumentation, Berechtigungen und Updates; wirken an Grundschutz-Checks mit."],
          ["Beschäftigte", "alle", "Beachten diese Leitlinie und die Regeln in Anlage 1; nehmen an Schulungen teil; melden Auffälligkeiten sofort."],
          ["Ansprechpersonen der Mitglieder", "von jedem Mitglied benannt", "Bindeglied zum Zweckverband; leiten Vorgaben in die eigene Verwaltung weiter; melden Vorfälle aus ihrer Verwaltung."],
        ],
        widths: [3, 3, 7],
      },
      {
        t: "p",
        text: "Die oder der ISB ist bei der Wahrnehmung dieser Aufgabe unmittelbar der Geschäftsführung unterstellt und in fachlichen Fragen weisungsfrei. Sie oder er hat ein direktes Vortragsrecht bei der Geschäftsführung und bei Gefahr im Verzug das Recht, Systeme vom Netz trennen zu lassen. Die Rolle ist mit mindestens einer Vollzeitstelle ausgestattet; eine Stellvertretung ist benannt. Um Interessenkonflikte zu vermeiden, übernimmt die oder der ISB keine Aufgaben in der Administration der Systeme, die sie oder er überwacht.",
      },
      {
        t: "p",
        text: "Die Rollen der oder des ISB und der Datenschutzbeauftragten sind getrennt besetzt. Beide arbeiten eng zusammen, insbesondere bei Sicherheitsvorfällen, bei der Auswahl von Dienstleistern und bei neuen Verfahren.",
      },
      { t: "h1", text: "9 Zusammenarbeit mit den Mitgliedern und Dienstleistern" },
      {
        t: "p",
        text: "Die Verbandsmitglieder bleiben für ihre Verfahren und die darin verarbeiteten personenbezogenen Daten datenschutzrechtlich verantwortlich. Der Zweckverband handelt als Auftragsverarbeiter und stellt die technische und organisatorische Sicherheit der von ihm betriebenen Systeme sicher. Die Aufgabenteilung ist in den Verträgen zur Auftragsverarbeitung und in den Leistungsbeschreibungen festgelegt.",
      },
      {
        t: "ul",
        items: [
          "Jedes Mitglied benennt eine Ansprechperson für Informationssicherheit und eine Vertretung.",
          "Der Zweckverband informiert die Ansprechpersonen über wesentliche Risiken, geplante Änderungen und Vorfälle, die das Mitglied betreffen. Bei Vorfällen mit Personenbezug erfolgt die Information unverzüglich, damit das Mitglied seine Meldepflicht nach Art. 33 DSGVO innerhalb von 72 Stunden erfüllen kann.",
          "Die Mitglieder legen den Schutzbedarf ihrer Verfahren gemeinsam mit dem Zweckverband fest und tragen die Folgen, wenn sie höhere Anforderungen stellen als im Grundangebot vorgesehen.",
          "Zweimal im Jahr findet ein Austausch der Ansprechpersonen mit der oder dem ISB statt.",
          "Dienstleister mit Zugang zum Informationsverbund werden vor Vertragsschluss auf ihre Sicherheitsvorkehrungen geprüft, schriftlich verpflichtet und regelmäßig kontrolliert. Fernwartung ist nur über das zentrale Fernwartungsportal, nur nach Freigabe im Einzelfall und nur protokolliert zulässig.",
        ],
      },
      { t: "h1", text: "10 Schutzbedarf, Risiken und Ausnahmen" },
      {
        t: "p",
        text: "Der Schutzbedarf wird in drei Kategorien festgestellt. **Normal:** Die Schadensauswirkungen sind begrenzt und überschaubar. **Hoch:** Die Schadensauswirkungen können beträchtlich sein, zum Beispiel weil Fristen versäumt werden oder sensible personenbezogene Daten betroffen sind. **Sehr hoch:** Die Schadensauswirkungen können ein existenziell bedrohliches, katastrophales Ausmaß erreichen, etwa wenn Leib und Leben gefährdet sind oder die Verwaltung eines Mitglieds über längere Zeit handlungsunfähig wäre.",
      },
      {
        t: "p",
        text: "Risiken werden in einem Risikoregister geführt und nach Eintrittswahrscheinlichkeit und Schadenshöhe bewertet. Risiken der Klasse „hoch“ müssen innerhalb von drei Monaten behandelt werden: durch Maßnahmen, durch Verlagerung (zum Beispiel Versicherung oder Vertrag) oder durch eine ausdrückliche, befristete Übernahme durch die Geschäftsführung. Eine Risikoübernahme ist schriftlich zu begründen und höchstens für zwölf Monate zulässig.",
      },
      {
        t: "p",
        text: "Abweichungen von dieser Leitlinie oder den nachgeordneten Richtlinien sind nur als begründete, befristete Ausnahme zulässig. Ausnahmen beantragt die oder der Verantwortliche bei der oder dem ISB; über Ausnahmen bei Systemen mit hohem oder sehr hohem Schutzbedarf entscheidet die Geschäftsführung.",
      },
      { t: "h1", text: "11 Mindestanforderungen" },
      { t: "p", text: "Unabhängig vom Stand der Grundschutz-Umsetzung gelten ab Inkrafttreten dieser Leitlinie die folgenden Mindestanforderungen:" },
      {
        t: "ol",
        items: [
          "**Identitäten und Zugänge:** Jede Person erhält eine eigene Kennung; Sammelkennungen sind nur für Geräte ohne Personenbezug zulässig (zum Beispiel Informationsbildschirme). Administrative Zugänge, Fernzugänge und der Zugang zu Webmail sind mit einem zweiten Faktor geschützt. Kennwörter haben mindestens zwölf Zeichen; ein regelmäßiger Wechsel ohne Anlass ist nicht vorgeschrieben, nach einem Verdacht auf Kompromittierung aber sofort erforderlich.",
          "**Berechtigungen:** Rechte werden nach dem Prinzip der minimalen Rechte vergeben, über ein dokumentiertes Antragsverfahren beantragt und mindestens jährlich von der zuständigen Führungskraft bestätigt. Beim Ausscheiden oder Wechsel werden Rechte am letzten Arbeitstag entzogen.",
          "**Updates:** Sicherheitsupdates mit kritischer Einstufung werden spätestens innerhalb von 7 Kalendertagen nach Veröffentlichung eingespielt, alle übrigen innerhalb von 30 Tagen. Wird eine Lücke bereits aktiv ausgenutzt, sind die Updates unverzüglich einzuspielen, notfalls außerhalb der regulären Wartungsfenster. Systeme, für die der Hersteller keine Updates mehr liefert, werden ersetzt oder vom Netz getrennt.",
          "**Schutz vor Schadprogrammen:** Alle Arbeitsplätze und Server sind mit einem zentral verwalteten Schutzprogramm ausgestattet. E-Mail-Anhänge mit ausführbarem Code und Makros aus dem Internet werden blockiert.",
          "**Datensicherung:** Daten werden täglich gesichert. Mindestens eine Sicherung wird getrennt vom Netz bzw. unveränderbar aufbewahrt. Die Wiederherstellung wird für jedes kritische Verfahren mindestens einmal jährlich getestet.",
          "**Netze:** Das Netz ist in Zonen unterteilt (Verwaltung, Server, Verwaltungsnetz der Mitglieder, Gäste, Gebäudetechnik). Übergänge sind durch Firewalls geschützt; Regeln werden halbjährlich überprüft.",
          "**Protokollierung:** Sicherheitsrelevante Ereignisse werden zentral gesammelt, mindestens 90 Tage aufbewahrt und automatisiert ausgewertet. Die Auswertung personenbezogener Protokolldaten ist in einer Dienstvereinbarung mit dem Personalrat geregelt.",
          "**Verschlüsselung:** Mobile Geräte und Datenträger sind vollständig verschlüsselt. Daten werden außerhalb des Verwaltungsnetzes nur verschlüsselt übertragen. Zertifikate werden zentral verwaltet und rechtzeitig vor Ablauf erneuert.",
          "**Mobiles Arbeiten:** Dienstliche Daten werden nur auf dienstlichen Geräten verarbeitet. Bildschirme sind so aufzustellen, dass Dritte nicht mitlesen können; Gespräche über vertrauliche Inhalte finden nicht in der Öffentlichkeit statt.",
          "**Physische Sicherheit:** Rechenzentrumsräume sind nur für berechtigte Personen zugänglich; jeder Zutritt wird protokolliert. Besucherinnen und Besucher werden begleitet.",
          "**Änderungen:** Änderungen an Systemen mit hohem oder sehr hohem Schutzbedarf durchlaufen das Änderungsverfahren mit Test, Freigabe und Rückfallplan. Wartungsfenster werden mit den Mitgliedern abgestimmt und mindestens zehn Arbeitstage vorher angekündigt, außer bei Notfalländerungen.",
          "**Beschaffung und Entwicklung:** Sicherheitsanforderungen sind Bestandteil jeder Ausschreibung und jedes Projekts. Neue Verfahren gehen erst nach Freigabe durch die oder den ISB in den Betrieb.",
        ],
      },
      { t: "h1", text: "12 Umgang mit Sicherheitsvorfällen" },
      {
        t: "p",
        text: "Jede Person, die einen Sicherheitsvorfall bemerkt oder vermutet, meldet ihn **sofort** dem Service Desk (Telefon 040 66969-899, rund um die Uhr über die Rufbereitschaft erreichbar). Das gilt auch, wenn man selbst einen Fehler gemacht hat – etwa einen Link in einer Phishing-Mail angeklickt hat. Wer einen eigenen Fehler sofort meldet, hat keine Nachteile zu befürchten. Schädlich ist nicht der Fehler, sondern das Schweigen: Jede Minute zählt.",
      },
      { t: "p", text: "Der Ablauf ist im Prozess „Behandlung von Sicherheitsvorfällen“ beschrieben und umfasst:" },
      {
        t: "ol",
        items: [
          "Erfassung im Ticketsystem mit der Kategorie „Sicherheitsvorfall“ und sofortige Information der oder des ISB,",
          "Ersteinschätzung und Sofortmaßnahmen, zum Beispiel Sperren von Konten, Trennen betroffener Geräte vom Netz, Sichern von Spuren,",
          "Beteiligung der Datenschutzbeauftragten, wenn personenbezogene Daten betroffen sein können, und unverzügliche Information der betroffenen Mitglieder,",
          "Information der Geschäftsführung bei Vorfällen der Kategorie „hoch“ oder „sehr hoch“ innerhalb einer Stunde,",
          "Behebung, Wiederherstellung und Dokumentation,",
          "Nachbetrachtung mit Ursachenanalyse und Maßnahmen innerhalb von 14 Tagen; die Ergebnisse fließen in das Risikoregister und in die Schulungen ein.",
        ],
      },
      {
        t: "p",
        text: "Erkenntnisse über Angriffe werden mit den zuständigen Stellen des Landes ausgetauscht. Strafanzeigen erstattet die Geschäftsführung in Abstimmung mit dem betroffenen Mitglied.",
      },
      { t: "h1", text: "13 Notfallmanagement" },
      {
        t: "p",
        text: "Für schwerwiegende Ausfälle, insbesondere den Ausfall des Rechenzentrums, hält der Zweckverband ein Notfallhandbuch vor. Es legt fest, wer den Notfall ausruft, wie der Notfallstab arbeitet, in welcher Reihenfolge Dienste wiederhergestellt werden und wie die Mitglieder informiert werden. Das Notfallhandbuch wird mindestens jährlich aktualisiert und durch eine Übung erprobt. Die Mitglieder werden aufgefordert, für ihre kritischen Prozesse eigene Notfallpläne für den Betrieb ohne IT vorzuhalten.",
      },
      { t: "h1", text: "14 Sensibilisierung und Schulung" },
      {
        t: "p",
        text: "Die meisten erfolgreichen Angriffe beginnen beim Menschen, etwa mit einer gefälschten Mail. Deshalb nehmen alle Beschäftigten des Zweckverbands jährlich an einer Pflichtschulung zur Informationssicherheit teil; neue Beschäftigte innerhalb der ersten vier Wochen. Administratorinnen und Administratoren erhalten zusätzliche Schulungen zu ihren Systemen. Den Mitgliedern bietet der Zweckverband Schulungen und Lernmaterialien an.",
      },
      {
        t: "p",
        text: "Mit Zustimmung des Personalrats führt der Zweckverband Phishing-Simulationen durch. Die Ergebnisse werden nur zusammengefasst ausgewertet; es werden keine Rückschlüsse auf einzelne Personen gezogen.",
      },
      { t: "h1", text: "15 Ressourcen" },
      {
        t: "p",
        text: "Die Geschäftsführung stellt sicher, dass für Informationssicherheit ausreichend Personal, Zeit und Geld zur Verfügung stehen. Als Orientierung gilt, dass mindestens 5 % des jährlichen Sachaufwands für Informationssicherheit eingesetzt werden. Die erforderlichen Mittel werden im Wirtschaftsplan gesondert ausgewiesen. Für die Umsetzung der Standard-Absicherung ist zusätzliche externe Unterstützung eingeplant.",
      },
      { t: "h1", text: "16 Überprüfung und Verbesserung" },
      {
        t: "p",
        text: "Die Wirksamkeit des ISMS wird regelmäßig überprüft: durch interne Audits nach einem Dreijahresplan, durch die Auswertung von Vorfällen und Übungen sowie durch Kennzahlen. Die oder der ISB legt der Geschäftsführung jährlich bis zum 31. März einen Managementbericht vor; die Geschäftsführung berichtet der Verbandsversammlung in ihrer Sommersitzung. Die folgenden Kennzahlen werden mindestens erhoben:",
      },
      {
        t: "table",
        header: ["Kennzahl", "Zielwert", "Erhebung"],
        rows: [
          ["Anteil der Arbeitsplätze mit aktuellem Sicherheitsupdate-Stand", "mindestens 95 %", "monatlich"],
          ["Kritische Sicherheitsupdates auf Servern innerhalb von 7 Tagen", "100 %", "monatlich"],
          ["Erfolgreich getestete Wiederherstellungen kritischer Verfahren", "100 % je Jahr", "jährlich"],
          ["Teilnahme an der Pflichtschulung (Beschäftigte des Zweckverbands)", "mindestens 95 %", "jährlich"],
          ["Klickrate bei Phishing-Simulationen", "unter 5 %", "halbjährlich"],
          ["Umsetzungsgrad der Grundschutz-Anforderungen (Standard-Absicherung)", "100 % bis 31.12.2027", "vierteljährlich"],
          ["Sicherheitsvorfälle mit Nachbetrachtung innerhalb von 14 Tagen", "100 %", "fortlaufend"],
        ],
        widths: [6, 3, 2],
      },
      {
        t: "p",
        text: "Die Leitlinie selbst wird mindestens alle zwei Jahre und zusätzlich bei wesentlichen Änderungen – etwa dem Beitritt neuer Mitglieder, neuen gesetzlichen Anforderungen oder nach schweren Vorfällen – überprüft.",
      },
      { t: "h1", text: "17 Verstöße" },
      {
        t: "p",
        text: "Vorsätzliche oder grob fahrlässige Verstöße gegen diese Leitlinie und die darauf beruhenden Regelungen können arbeits- oder disziplinarrechtliche Folgen haben und Schadensersatzansprüche auslösen. Unbeabsichtigte Fehler, die sofort gemeldet werden, sind ausdrücklich davon ausgenommen (siehe Abschnitt 12).",
      },
      { t: "h1", text: "18 Inkrafttreten" },
      {
        t: "p",
        text: "Diese Leitlinie wurde von der Geschäftsführung am 12.03.2025 beschlossen und tritt am 01.04.2025 in Kraft. Sie wird der Verbandsversammlung in ihrer Sitzung am 24.06.2025 zur Kenntnis gegeben, allen Beschäftigten bekannt gemacht und den Mitgliedern übersandt. Gleichzeitig tritt die Leitlinie in der Version 1.1 vom 14.09.2021 außer Kraft.",
      },
      { t: "signature", lines: ["Dr. Reinhard Vogelsang", "Geschäftsführer"] },
      { t: "pagebreak" },
      { t: "h1", text: "Anlage 1: Zehn Regeln für alle Beschäftigten" },
      { t: "p", text: "Diese Zehn Regeln gelten für alle, die mit der IT des Zweckverbands arbeiten – egal ob im Büro, im Homeoffice oder unterwegs." },
      {
        t: "ol",
        items: [
          "**Erst denken, dann klicken.** Seien Sie misstrauisch bei Mails, die Druck machen, mit Folgen drohen oder nach Ihrem Kennwort fragen. Kein Service Desk fragt jemals nach Ihrem Kennwort.",
          "**Im Zweifel melden.** Rufen Sie den Service Desk an, wenn Ihnen etwas komisch vorkommt. Lieber einmal zu oft als einmal zu wenig.",
          "**Fehler sofort zugeben.** Wenn Sie auf einen Link geklickt oder Daten eingegeben haben: sofort melden. Sie bekommen keinen Ärger – Schweigen ist das eigentliche Risiko.",
          "**Gute Kennwörter.** Mindestens zwölf Zeichen, für jeden Dienst ein eigenes, niemals weitergeben und nicht auf Zettel am Bildschirm schreiben.",
          "**Bildschirm sperren.** Wenn Sie den Platz verlassen, sperren Sie den Bildschirm mit der Tastenkombination aus der Schulung – auch wenn Sie nur zwei Minuten weg sind.",
          "**Nur dienstliche Geräte.** Keine privaten USB-Sticks, keine dienstlichen Daten auf privaten Geräten oder in privaten Cloud-Speichern.",
          "**Updates zulassen.** Starten Sie Ihren Rechner neu, wenn Sie dazu aufgefordert werden. Verschieben Sie Updates nicht tagelang.",
          "**Vertrauliches schützen.** Lassen Sie keine Unterlagen offen liegen, telefonieren Sie nicht in der Bahn über Fälle und drucken Sie nur, was Sie wirklich brauchen.",
          "**Fremde begleiten.** Lassen Sie keine unbekannten Personen allein in Büros oder Technikräumen – auch nicht, wenn sie eine Warnweste tragen.",
          "**Fragen erlaubt.** Wenn Sie eine Regel nicht verstehen oder sie Ihre Arbeit behindert, sprechen Sie mit Ihrer Führungskraft oder der Informationssicherheit. Regeln, die niemand versteht, schützen niemanden.",
        ],
      },
      { t: "h1", text: "Anlage 2: Änderungshistorie" },
      {
        t: "table",
        header: ["Version", "Datum", "Änderung", "Beschlossen durch"],
        rows: [
          ["1.0", "18.03.2019", "Erstfassung", "Geschäftsführung"],
          ["1.1", "14.09.2021", "Anpassung an die neue Organisationsstruktur, Mobiles Arbeiten", "Geschäftsführung"],
          ["2.0", "12.03.2025", "Vollständige Überarbeitung: Ausrichtung auf IT-Grundschutz mit Ziel Standard-Absicherung, neue Rollen, Mindestanforderungen, Kennzahlen, Zehn Regeln", "Geschäftsführung"],
        ],
        widths: [1, 2, 6, 2],
      },
    ],
  },
  {
    type: "word",
    id: "zk-notfallhandbuch-wiederanlauf-rechenzentrum",
    title: "Notfallhandbuch, Kapitel 5: Wiederanlauf nach Ausfall des Rechenzentrums (Auszug)",
    kind: "Notfallhandbuch (Auszug)",
    fileName: "NFH-05 Notfallhandbuch Kapitel 5 Wiederanlauf Rechenzentrum V3.1",
    org: "zkit",
    unit: "zk-rz",
    author: "zk-wolf",
    date: "2025-06-17",
    tags: ["personendaten", "unstrukturiert"],
    keywords: ["NFH-05", "Netzersatzanlage", "Ausweichrechenzentrum", "Wiederanlaufreihenfolge", "Notfallübung"],
    summary:
      "Kapitel des Notfallhandbuchs zum Ausfall des Hauptrechenzentrums: Szenarien, Alarmierung, Notfallstab, Wiederanlaufreihenfolge mit Zielzeiten, Ablauf der Umschaltung und Kommunikation. Enthält eine vertrauliche Alarmierungsliste mit privaten Telefonnummern und Wohnorten (Anonymisierungsübung) und stichpunktartige Notizen aus der Notfallübung vom 05.06.2025.",
    meta: [
      ["Dokument", "NFH-05"],
      ["Version", "3.1 – überarbeitet nach der Notfallübung vom 05.06.2025"],
      ["Einstufung", "intern; Anlage 5-A vertraulich"],
      ["Freigabe", "Andreas Ritter, Bereichsleiter Infrastruktur und Betrieb"],
    ],
    subject: "Kapitel 5 – Wiederanlauf nach Ausfall des Rechenzentrums",
    blocks: [
      {
        t: "note",
        text: "**Wichtig:** Dieses Kapitel liegt zusätzlich ausgedruckt im Notfallordner in Raum 1.12 (Am Rechenzentrum 7), im Ausweichrechenzentrum im Kreishaus und bei den Mitgliedern des Notfallstabs zu Hause. Bei einem Ausfall des Rechenzentrums ist die elektronische Fassung möglicherweise nicht erreichbar.",
      },
      { t: "h2", text: "5.1 Zweck und Geltungsbereich" },
      {
        t: "p",
        text: "Dieses Kapitel regelt, wie der Zweckverband reagiert, wenn das Hauptrechenzentrum (RZ 1) ganz oder in wesentlichen Teilen ausfällt und der Ausfall voraussichtlich länger als zwei Stunden dauert. Ziel ist, die kritischen Dienste für die Verbandsmitglieder in einer festgelegten Reihenfolge und innerhalb der vereinbarten Zeiten im Ausweichrechenzentrum (RZ 2) wieder bereitzustellen. Angriffe mit Schadsoftware, bei denen nicht klar ist, ob die Sicherungen sauber sind, sind in Kapitel 6 geregelt; dort gelten zusätzliche Prüfschritte vor jedem Wiederanlauf.",
      },
      { t: "h2", text: "5.2 Ausgangslage" },
      {
        t: "table",
        header: ["Standort", "Ausstattung", "Stromversorgung"],
        rows: [
          ["RZ 1 – Hauptrechenzentrum, Am Rechenzentrum 7, Altmoor", "2 Serverräume, 14 Virtualisierungshosts, 2 Speichersysteme, Netzkern, Firewalls, Bandbibliothek", "USV für rund 25 Minuten, Netzersatzanlage (Diesel, Tankinhalt 4.000 Liter, rund 72 Stunden Volllast)"],
          ["RZ 2 – Ausweichrechenzentrum, Kreishaus, Am Moordamm 4, Untergeschoss", "6 Virtualisierungshosts (etwa 50 % der Leistung von RZ 1), gespiegeltes Speichersystem, zweiter Netzkern, unveränderbarer Sicherungsspeicher", "USV für rund 40 Minuten, Netzersatzanlage des Kreishauses"],
        ],
        widths: [3, 5, 4],
      },
      {
        t: "p",
        text: "Die Speichersysteme in RZ 1 und RZ 2 sind über zwei getrennte Glasfasertrassen verbunden und werden für die Systeme der Stufen 1 bis 4 synchron gespiegelt. Alle übrigen Daten werden stündlich repliziert. Zusätzlich wird täglich auf den unveränderbaren Sicherungsspeicher in RZ 2 gesichert; einmal wöchentlich werden Bänder in das Schließfach bei einem Kreditinstitut in Altmoor ausgelagert. Wegen der geringeren Leistung können im RZ 2 nicht alle Dienste gleichzeitig laufen. Deshalb ist die Wiederanlaufreihenfolge (5.5) verbindlich.",
      },
      { t: "h2", text: "5.3 Szenarien" },
      {
        t: "table",
        header: ["Nr.", "Szenario", "Typische Ursache", "Erstmaßnahme"],
        rows: [
          ["S1", "Stromausfall länger als die Überbrückungszeit der USV", "Netzausfall und Netzersatzanlage startet nicht", "Netzersatzanlage manuell starten (Anleitung am Gerät), sonst kontrolliertes Herunterfahren"],
          ["S2", "Brand, Löschgasauslösung oder Wassereintritt", "Defekt in der Elektrik, Starkregen", "Raum nicht betreten, Feuerwehr, Notfall ausrufen"],
          ["S3", "Ausfall der Klimatisierung, Raumtemperatur über 35 °C", "Defekt Kältemaschine, Hitzeperiode", "Nicht kritische Systeme abschalten, mobile Kühlgeräte, Wartungsfirma"],
          ["S4", "Ausfall beider Netzanbindungen von RZ 1", "Bauarbeiten, Kabelschaden", "Umschaltung auf RZ 2 prüfen, Netzbetreiber"],
          ["S5", "Angriff mit Schadsoftware", "Phishing, ungepatchte Systeme", "Kapitel 6 anwenden – kein Wiederanlauf ohne Freigabe der oder des ISB"],
        ],
        widths: [1, 4, 4, 5],
      },
      { t: "h2", text: "5.4 Alarmierung und Notfallstab" },
      {
        t: "p",
        text: "Den Notfall ruft die Leitung des Notfallstabs aus, in ihrer Vertretung die Teamleitung Rechenzentrum und außerhalb der Dienstzeit die Rufbereitschaft Rechenzentrum, wenn keine der beiden Personen innerhalb von 15 Minuten erreichbar ist. Ein Notfall wird ausgerufen, wenn ein Ausfall von mehr als zwei Stunden zu erwarten ist oder mehr als zwei Dienste der Stufen 1 bis 3 gleichzeitig betroffen sind.",
      },
      {
        t: "ul",
        items: [
          "**Leitung Notfallstab:** Bereichsleitung Infrastruktur und Betrieb; Vertretung: Teamleitung Rechenzentrum",
          "**Mitglieder:** Geschäftsführer, Teamleitungen Rechenzentrum und Netze, Bereichsleitung Fachverfahren, Teamleitung Service Desk (zugleich Kommunikation), Informationssicherheitsbeauftragter, Protokoll",
          "**Treffpunkt:** Besprechungsraum 1.12, Am Rechenzentrum 7; Ausweichort: Stabsraum des Landkreises im Kreishaus (Raum E.08)",
          "**Alarmierung:** Telefonkette nach Anlage 5-A, zusätzlich SMS über den Alarmierungsdienst; jede Person bestätigt den Eingang",
          "**Lagebesprechungen:** zu Beginn, dann alle zwei Stunden; Entscheidungen werden im Einsatztagebuch festgehalten",
        ],
      },
      { t: "h2", text: "5.5 Wiederanlaufreihenfolge" },
      {
        t: "p",
        text: "Die folgenden Zielzeiten wurden mit den Verbandsmitgliedern abgestimmt. Die maximal tolerierbare Ausfallzeit wird ab Ausrufen des Notfalls gerechnet. Der maximale Datenverlust gibt an, wie alt die zurückgeholten Daten höchstens sein dürfen.",
      },
      {
        t: "table",
        header: ["Stufe", "Dienst", "Max. Ausfallzeit", "Max. Datenverlust", "Verantwortlich"],
        rows: [
          ["0", "Strom, Klima, Brandmeldetechnik", "sofort", "–", "Haustechnik"],
          ["1", "Netzkern, Firewalls, Namensauflösung, Zeitdienst", "2 Stunden", "–", "Team Netze und Arbeitsplatz"],
          ["2", "Verzeichnisdienst, Speichersysteme, Virtualisierung", "4 Stunden", "15 Minuten", "Team Rechenzentrum"],
          ["3", "E-Mail, Telefonanlage, Fachverfahren Zulassung, Meldewesen und Ausländerwesen", "8 Stunden", "1 Stunde", "Rechenzentrum / Fachverfahren"],
          ["4", "Finanzverfahren mit Zahlungsverkehr, E-Akte", "24 Stunden", "15 Minuten (Finanzen), 1 Stunde (E-Akte)", "Fachverfahren"],
          ["4", "Personalabrechnung", "48 Stunden, in der Abrechnungswoche 24 Stunden", "1 Stunde", "Fachverfahren Finanzen und Personal"],
          ["5", "Onlinedienste und Portal", "24 Stunden", "1 Stunde", "Team Onlinedienste"],
          ["5", "Ratsinformationssystem", "72 Stunden, an Sitzungstagen 4 Stunden", "24 Stunden", "Fachverfahren"],
          ["5", "Dateiablagen, Intranet, sonstige Anwendungen", "48 Stunden bis 5 Tage", "24 Stunden", "Rechenzentrum"],
        ],
        widths: [1, 5, 3, 3, 3],
      },
      { t: "h2", text: "5.6 Ablauf" },
      { t: "h3", text: "Phase 1 – Sofortmaßnahmen (0 bis 30 Minuten)" },
      {
        t: "ol",
        items: [
          "Personenschutz geht vor: Bei Brand oder Löschgas Räume nicht betreten, Feuerwehr alarmieren (112).",
          "Ursache grob feststellen: Strom, Klima, Netz, Brand, Angriff?",
          "Bei Verdacht auf einen Angriff sofort Kapitel 6 anwenden und die oder den ISB informieren.",
          "Leitung Notfallstab informieren; Notfall ausrufen oder Lage beobachten.",
          "Service Desk schaltet die Störungsansage auf der Hotline und informiert die Ansprechpersonen der Mitglieder (Textbaustein in 5.7).",
        ],
      },
      { t: "h3", text: "Phase 2 – Lagefeststellung und Entscheidung (30 bis 90 Minuten)" },
      {
        t: "ul",
        items: [
          "Notfallstab tritt zusammen; erste Lagebesprechung mit Einschätzung der voraussichtlichen Dauer",
          "Entscheidung: Wiederherstellung in RZ 1 abwarten oder Umschaltung auf RZ 2 („Schwenk“)",
          "Bei erwarteter Ausfalldauer von mehr als vier Stunden wird grundsätzlich geschwenkt",
          "Geschäftsführer informiert den Verbandsvorsitzenden und bei Bedarf die Hauptverwaltungsbeamtinnen und -beamten der Mitglieder",
        ],
      },
      { t: "h3", text: "Phase 3 – Umschaltung auf das Ausweichrechenzentrum" },
      {
        t: "ol",
        items: [
          "Netzkern RZ 2 übernimmt die Standortverbindungen der Mitglieder (Routing umstellen nach Betriebshandbuch Netze, Abschnitt 4.3).",
          "Gespiegelte Datenträger in RZ 2 schreibbar schalten; Konsistenz der Datenbanken prüfen.",
          "Systeme in der Reihenfolge der Stufen starten; jede Stufe erst beginnen, wenn die vorherige als stabil gemeldet ist.",
          "Nach jeder Stufe Funktionstest durch die Verantwortlichen und Rückmeldung an den Notfallstab.",
          "Nicht benötigte Systeme bleiben aus, um die begrenzte Leistung des RZ 2 nicht zu überlasten.",
        ],
      },
      { t: "h3", text: "Phase 4 – Betrieb im Ausweichrechenzentrum" },
      {
        t: "p",
        text: "Im Notbetrieb gelten eingeschränkte Servicezeiten und Leistungen. Änderungen an Systemen sind nur mit Zustimmung des Notfallstabs zulässig. Die Mitglieder werden mindestens zweimal täglich über den Stand informiert.",
      },
      { t: "h3", text: "Phase 5 – Rückführung in das Hauptrechenzentrum" },
      {
        t: "p",
        text: "Die Rückführung wird geplant und angekündigt, vorzugsweise am Wochenende. Vorher wird RZ 1 vollständig geprüft (Strom, Klima, Brandschutz, Netz). Die Daten werden von RZ 2 nach RZ 1 gespiegelt; erst nach vollständigem Abgleich wird zurückgeschaltet.",
      },
      { t: "h3", text: "Phase 6 – Nachbereitung" },
      {
        t: "p",
        text: "Innerhalb von 14 Tagen erstellt die Leitung des Notfallstabs einen Bericht mit Ablauf, Ursachen, Schäden und Verbesserungen. Das Notfallhandbuch wird angepasst.",
      },
      { t: "h2", text: "5.7 Kommunikation" },
      {
        t: "p",
        text: "Der Service Desk informiert die Ansprechpersonen der Mitglieder per Telefon und SMS-Verteiler. Anfragen der Presse beantwortet ausschließlich die Pressestelle des Landkreises in Abstimmung mit dem Geschäftsführer. Textbaustein für die erste Information:",
      },
      {
        t: "note",
        text: "„Wegen eines Ausfalls im Rechenzentrum des Zweckverbands sind seit [Uhrzeit] folgende Dienste nicht verfügbar: [Dienste]. Wir arbeiten mit Hochdruck an der Wiederherstellung und rechnen mit ersten Diensten gegen [Uhrzeit]. Bitte sehen Sie von Einzelanfragen beim Service Desk ab. Nächste Information spätestens um [Uhrzeit].“",
      },
      { t: "h2", text: "5.8 Notbetrieb bei den Mitgliedern" },
      {
        t: "p",
        text: "Die Mitglieder halten für ihre kritischen Prozesse eigene Notfallpläne vor. Beispiele aus den abgestimmten Plänen: Die Zulassungsstelle schließt bei einem Ausfall über vier Stunden den Publikumsverkehr und vergibt Ersatztermine; die Kasse des Landkreises kann eilige Zahlungen über den Notzugang zum Bankportal im Vier-Augen-Prinzip leisten; das Standesamt arbeitet mit Papiervordrucken weiter.",
      },
      { t: "pagebreak" },
      { t: "h2", text: "Anlage 5-A: Alarmierungsliste (vertraulich)" },
      {
        t: "note",
        text: "**Vertraulich – nur für den Notfallstab.** Private Rufnummern und Wohnorte dürfen ausschließlich zur Alarmierung im Notfall genutzt werden (Einwilligung der Beschäftigten liegt vor). Monatliche Prüfung durch die Teamleitung Rechenzentrum.",
      },
      {
        t: "table",
        header: ["Funktion", "Name", "Dienstlich", "Mobil (dienstlich)", "Privat", "Wohnort, Anfahrt"],
        rows: [
          ["Leitung Notfallstab", "Andreas Ritter", "040 66969-810", "030 23125-611", "030 23125-612", "Kiefernweg 9, 00752 Altmoor, 10 Min."],
          ["Vertretung, Teamleitung RZ", "Dmitrij Wolf", "040 66969-830", "030 23125-614", "030 23125-615", "Heidhof (Gemeinde Brackenhain), 20 Min."],
          ["Geschäftsführer", "Dr. Reinhard Vogelsang", "040 66969-800", "030 23125-617", "030 23125-618", "Seestraße 22, 00752 Altmoor, 8 Min."],
          ["Rufbereitschaft RZ (Woche A)", "Kevin Lorenzen", "040 66969-832", "030 23125-620", "030 23125-621", "Torfkamp, 25 Min."],
          ["Rufbereitschaft RZ (Woche B)", "Marta Sobczak", "040 66969-833", "030 23125-623", "–", "Mühlenstraße 4, 00752 Altmoor, 12 Min."],
          ["Rufbereitschaft RZ (Woche C)", "Jannik Brüning", "040 66969-834", "030 23125-625", "030 23125-626", "Fennhusen, 30 Min."],
          ["Teamleitung Netze", "Jessica Hartung", "040 66969-835", "030 23125-628", "030 23125-629", "Rabensfurt-Süd, 35 Min."],
          ["Bereichsleitung Fachverfahren", "Dr. Ute Kampmann", "040 66969-840", "030 23125-631", "–", "Altmoor, Am Kanal 17, 15 Min."],
          ["Teamleitung Service Desk", "Nadine Brökel", "040 66969-820", "030 23125-633", "030 23125-634", "Lütjenbrook, 25 Min."],
          ["Informationssicherheit", "Elias Rahimi", "040 66969-870", "030 23125-636", "–", "Rhedenburg, 55 Min."],
          ["Haustechnik Am Rechenzentrum 7", "Günther Mahnke", "040 66969-807", "030 23125-638", "030 23125-639", "Birkenweg 3, 00752 Altmoor, 5 Min."],
        ],
        widths: [3, 3, 3, 3, 3, 4],
      },
      {
        t: "table",
        header: ["Externe Stelle", "Leistung", "Erreichbarkeit"],
        rows: [
          ["Energietechnik Altmoorland GmbH", "Wartung Netzersatzanlage, Notdienst", "069 90009-571 (24 Stunden), Vertrags-Nr. NEA-2023-114"],
          ["Kälte- und Klimatechnik Torfkamp GmbH", "Klimatisierung RZ 1", "069 90009-574 (Mo–Fr 7–20 Uhr, sonst Notdienst)"],
          ["Hersteller Speichersysteme", "Hardwareservice, Reaktionszeit 4 Stunden", "069 90009-577, Kundennummer 4471-ALT"],
          ["Netzbetreiber Kreisnetz", "Störungsannahme Glasfaser", "069 90009-579"],
        ],
        widths: [4, 4, 5],
      },
      { t: "pagebreak" },
      { t: "h2", text: "Anlage 5-B: Notizen zur Notfallübung „Blackout RZ 1“ am 05.06.2025" },
      {
        t: "p",
        text: "Mitschrift D. Wolf, nicht redigiert. Beobachtung: E. Rahimi, K. Morgenstern (Morgenstern Verwaltungsberatung). Übungszeit 17:00 bis 21:40 Uhr, nur Testumgebung und angekündigte Teilsysteme betroffen.",
      },
      {
        t: "ul",
        items: [
          "17:00 Start – Hauptschalter Übungsbereich aus, USV übernimmt sofort (ok)",
          "NEA startet NICHT automatisch!! Startbatterie zu schwach (letzte Wartung März?). 17:09 manuell gestartet durch Hr. Mahnke – Anleitung hing nicht am Gerät, lag im Büro",
          "17:12 Telefonkette: in 10 Min. nur 3 von 7 erreicht; ich selbst Mailbox (Urlaub, Vertretung nicht in Liste eingetragen) → Liste veraltet",
          "Raum 1.12: Netzwerkdosen ohne Strom, Beamer nicht an USV → Lagebesprechung in der Teeküche, Flipchart fehlt",
          "17:48 Entscheidung Schwenk RZ 2 (Ritter) – eigentlich zu spät, Kriterium „> 4 h erwartet“ war schon um 17:20 klar",
          "Verzeichnisdienst in RZ 2 nach 52 Min. da (Ziel 4 h – gut)",
          "E-Mail 19:35 wieder da, Telefonanlage hat gezickt (Lizenzserver stand in RZ 1!!) → Abhängigkeit nicht dokumentiert",
          "Finanzverfahren: Rücksicherung DB 2:10 h statt 45 Min. – Bandlaufwerk viel zu langsam. Zahlungsverkehr wäre an Zahltag knapp geworden",
          "SMS-Verteiler Mitglieder veraltet: 2 Nummern gehören zu Ex-Beschäftigten des LK, Brackenhain fehlt ganz",
          "Rückschwenk nicht geübt – Zeit hat nicht gereicht",
          "Frau Morgenstern: Einsatztagebuch lückenhaft, keine feste Protokollrolle; Rollen „wer entscheidet was“ unklar zwischen Ritter und Vogelsang",
          "Stimmung gut, alle sehr engagiert, Pizza 20:15",
        ],
      },
      { t: "p", text: "**ToDo (Stand 17.06.2025):**" },
      {
        t: "ul",
        items: [
          "Startbatterie NEA tauschen + Wartungsvertrag prüfen – Energietechnik Altmoorland, bis 30.06. (erledigt 12.06.)",
          "Kurzanleitung NEA laminiert ans Gerät – Mahnke, erledigt",
          "Alarmierungsliste monatlich prüfen, Urlaubsvertretungen eintragen – Wolf, ab Juli",
          "Raum 1.12 an USV anschließen – Haustechnik, Angebot liegt vor",
          "Lizenzserver Telefonanlage doppelt (RZ 1 + RZ 2) – Hartung, Q3",
          "Rücksicherung Finanzverfahren auf Plattenspeicher umstellen – Wolf/Grewe, Q4",
          "SMS-Verteiler mit Ansprechpersonen der Mitglieder abgleichen – Brökel, bis 31.07.",
          "Feste Protokollrolle im Notfallstab (Sekretariat GF) – Ritter",
          "Nächste Übung mit Rückschwenk: 2. Quartal 2026",
        ],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "zk-awareness-schulung-phishing",
    title: "Awareness-Schulung „Phishing erkennen“",
    kind: "Schulungspräsentation",
    fileName: "Awareness-Schulung Phishing erkennen Herbst 2025",
    org: "zkit",
    unit: "zk-schulung",
    author: "zk-lenz",
    date: "2025-09-23",
    keywords: ["Phishing", "412 Postfächer", "Warnzeichen", "040 66969-899", "Phishing-Simulationen"],
    summary:
      "Schulungsfolien für alle Beschäftigten der Verbandsmitglieder nach dem Phishing-Vorfall vom August 2025: Warnzeichen am Beispiel der echten Mail, richtiges Verhalten, Ergebnisse der Phishing-Simulationen und Neuerungen ab Oktober. Gut als Vorlage für Leichte Sprache, ein Merkblatt oder ein Quiz.",
    slides: [
      { t: "title", title: "Phishing erkennen", subtitle: "Awareness-Schulung für die Beschäftigten der Verbandsmitglieder · Herbst 2025 · 45 Minuten" },
      {
        t: "bullets",
        title: "Warum wir heute hier sind",
        bullets: [
          "Am 19. August 2025 kam eine gefälschte Mail zur „Entgeltabrechnung“ in 412 Postfächer",
          "19 Beschäftigte haben den Link geöffnet, 2 haben ihr Kennwort eingegeben",
          "Ein Postfach wurde rund eine halbe Stunde lang von Fremden genutzt",
          "Folgen: Meldung an die Datenschutzaufsicht, Briefe an Betroffene, viel Arbeit und Sorgen",
        ],
        notes:
          "Keine Namen nennen und keine Verwaltung an den Pranger stellen! Die beiden betroffenen Kolleginnen und Kollegen haben das Wichtigste richtig gemacht: Sie haben sich sofort gemeldet.",
      },
      {
        t: "bullets",
        title: "Was ist Phishing?",
        bullets: [
          "Phishing kommt von „Fishing“: Angeln nach Passwörtern und Daten",
          "Die Täter geben sich als bekannte Stelle aus – IT, Bank, Paketdienst, Personalstelle oder Chefin",
          "Ziel: Zugangsdaten, Geld oder Schadsoftware auf Ihrem Rechner",
          "Die Mails sind heute oft fehlerfrei und sehr gut gemacht – auch mit Hilfe von KI",
        ],
      },
      {
        t: "table",
        title: "Die sechs Warnzeichen – am Beispiel vom 19. August",
        header: ["Warnzeichen", "So sah es in der Mail aus"],
        rows: [
          ["Druck und Fristen", "„Bestätigen Sie bis heute 12 Uhr, sonst verzögert sich die Auszahlung.“"],
          ["Fremde Absenderadresse", "entgelt-service@zkit-altmoor-portal.example statt …@zkit-altmoor.example"],
          ["Link führt woanders hin", "Text „Zum Entgeltportal“, Ziel war eine fremde Seite"],
          ["Frage nach dem Kennwort", "„Melden Sie sich mit Ihrem Dienstkennwort an.“"],
          ["Unpersönliche Anrede", "„Sehr geehrte Mitarbeitende“"],
          ["Ungewöhnlicher Weg", "Entgeltabrechnungen kommen sonst per Post oder aus dem Personalverfahren"],
        ],
        notes: "Tipp zeigen: Mauszeiger über den Link halten, ohne zu klicken – dann erscheint die echte Zieladresse.",
      },
      {
        t: "twocol",
        title: "Richtig handeln",
        left: {
          heading: "Bitte so",
          bullets: [
            "Absender und Link prüfen",
            "Im Zweifel auf bekanntem Weg nachfragen – per Telefon, nicht per Antwort-Mail",
            "Verdächtige Mails mit der Schaltfläche „Phishing melden“ weitergeben",
            "Nach einem Fehlklick sofort den Service Desk anrufen: 040 66969-899",
          ],
        },
        right: {
          heading: "Bitte nicht",
          bullets: [
            "Links oder Anhänge „nur mal kurz“ öffnen",
            "Ein Kennwort auf einer Seite eingeben, die per Mail kam",
            "Die Mail an Kolleginnen und Kollegen weiterleiten („Ist die echt?“)",
            "Aus Scham schweigen",
          ],
        },
      },
      {
        t: "chart",
        title: "Ergebnisse unserer Phishing-Simulationen",
        chart: {
          type: "bar",
          categories: ["1. Quartal 2025", "2. Quartal 2025", "3. Quartal 2025", "Ziel"],
          series: [
            { name: "Link geklickt", values: [11.2, 8.7, 9.4, 5] },
            { name: "Daten eingegeben", values: [3.1, 2.4, 2.9, 1] },
          ],
          unit: "%",
        },
        caption: "Phishing-Simulationen beim Zweckverband und im Landkreis, anonym ausgewertet",
        notes: "Die Werte sind nicht nach Personen auswertbar – so ist es mit den Personalräten vereinbart. Ziel aus der Leitlinie: Klickrate unter 5 %.",
      },
      {
        t: "bullets",
        title: "Was passiert, wenn Sie melden?",
        bullets: [
          "Der Service Desk sperrt bei Bedarf Ihr Konto und setzt das Kennwort zurück – das dauert etwa 10 Minuten",
          "Die Mail wird aus allen Postfächern entfernt – so schützen Sie Ihre Kolleginnen und Kollegen",
          "Die Informationssicherheit prüft, ob Daten abgeflossen sind",
          "Sie bekommen keinen Ärger. Wer sich sofort meldet, macht den Schaden kleiner.",
        ],
      },
      {
        t: "bullets",
        title: "Übung: Echt oder Phishing?",
        bullets: [
          "„Ihr Postfach ist zu 98 % voll – klicken Sie hier, um Speicher freizugeben“",
          "Mail der Kasse mit „offener Rechnung“ als ZIP-Anhang, Absender unbekannt",
          "Einladung Ihrer Teamleitung zur Teambesprechung über den Kalender",
        ],
        notes:
          "Auflösung: 1 Phishing (der Service Desk verschickt keine solchen Links), 2 Phishing (ZIP-Anhang, fremder Absender), 3 echt – aber auch hier gilt: Bei Ungewöhnlichem kurz nachfragen.",
      },
      {
        t: "bullets",
        title: "Neu ab 1. Oktober 2025",
        bullets: [
          "Anmeldung am Webmail nur noch mit zweitem Faktor (App oder Schlüsselanhänger)",
          "Automatische Weiterleitungen an fremde Adressen sind gesperrt",
          "Neue Schaltfläche „Phishing melden“ in der Bürosoftware",
        ],
        notes: "Die Sperre der Weiterleitungen gilt schon seit dem 20. August, wird aber erst jetzt allen erklärt.",
      },
      { t: "end", title: "Danke! Fragen?", lines: ["Service Desk: 040 66969-899", "Ricarda Lenz · Schulung und Anwenderbetreuung", "Elias Rahimi · Informationssicherheit"] },
    ],
  },
  {
    type: "excel",
    id: "zk-lizenzbestand-2025",
    title: "Lizenzbestand und Lizenzkosten – Stand 31.01.2025",
    kind: "Übersicht",
    fileName: "Lizenzbestand und Lizenzkosten Stand 2025-01-31",
    org: "zkit",
    unit: "zk-verfahren",
    author: "zk-gerlach",
    date: "2025-02-11",
    tags: ["zahlen"],
    keywords: ["AKTA-E-Akte", "Auslastung", "ungenutzte Lizenzen", "PDF-Bearbeitung"],
    summary:
      "Gekaufte und tatsächlich genutzte Lizenzen je Software mit Auslastung, Jahreskosten und Kosten ungenutzter Lizenzen. Geeignet für Fragen wie „Wo zahlen wir für Lizenzen, die niemand nutzt?“ und für eine Folie mit Einsparvorschlägen.",
    sheets: [
      {
        name: "Lizenzen",
        title: "Lizenzbestand und Lizenzkosten",
        subtitle: "Stand 31.01.2025 · Nutzung laut Lizenzserver und Verzeichnisdienst · Preise brutto je Jahr",
        columns: [
          { header: "Software", width: 34 },
          { header: "Lizenzmodell", width: 20 },
          { header: "Bestand", width: 9, fmt: "int" },
          { header: "genutzt", width: 9, fmt: "int" },
          { header: "Auslastung", width: 10, fmt: "pct" },
          { header: "Preis je Lizenz", width: 12, fmt: "eur" },
          { header: "Kosten pro Jahr", width: 13, fmt: "eur0" },
          { header: "ungenutzte Lizenzen", width: 13, fmt: "eur0" },
          { header: "Vertragsende", width: 12, fmt: "date" },
        ],
        rows: [
          ["Bürosoftware (Abonnement)", "je Benutzer", 1350, 1318, { f: "D{r}/C{r}" }, 168, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2026-12-31" }],
          ["Schutzprogramm Endgeräte", "je Gerät", 1500, 1402, { f: "D{r}/C{r}" }, 24, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2025-06-30" }],
          ["AKTA-E-Akte", "je benannter Benutzer", 1600, 352, { f: "D{r}/C{r}" }, 145, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2027-12-31" }],
          ["Finanzverfahren", "gleichzeitige Benutzer", 180, 164, { f: "D{r}/C{r}" }, 410, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2028-12-31" }],
          ["Personalverfahren", "je Abrechnungsfall", 1950, 1874, { f: "D{r}/C{r}" }, 38, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2026-12-31" }],
          ["Fachverfahren Kfz-Zulassung", "je Arbeitsplatz", 28, 26, { f: "D{r}/C{r}" }, 690, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2025-12-31" }],
          ["Fachverfahren Ausländerwesen", "je Arbeitsplatz", 24, 24, { f: "D{r}/C{r}" }, 520, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2026-06-30" }],
          ["Ratsinformationssystem", "je Mandatszugang", 120, 97, { f: "D{r}/C{r}" }, 55, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2025-12-31" }],
          ["Videokonferenzsystem", "gleichzeitige Räume", 60, 41, { f: "D{r}/C{r}" }, 180, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2025-09-30" }],
          ["PDF-Bearbeitung (Vollversion)", "je Benutzer", 400, 219, { f: "D{r}/C{r}" }, 96, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2025-08-31" }],
          ["Geoinformationssystem", "gleichzeitige Benutzer", 40, 38, { f: "D{r}/C{r}" }, 610, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2027-03-31" }],
          ["Fernwartung", "je Technikerin/Techniker", 30, 30, { f: "D{r}/C{r}" }, 420, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2025-11-30" }],
          ["Datenbankserver", "je Prozessorkern", 96, 88, { f: "D{r}/C{r}" }, 1150, { f: "C{r}*F{r}" }, { f: "(C{r}-D{r})*F{r}" }, { date: "2026-03-31" }],
          { total: true, cells: ["Summe", "", null, null, null, null, { f: "SUM(G{first}:G{last})" }, { f: "SUM(H{first}:H{last})" }, null] },
        ],
        notes: [
          "AKTA-E-Akte: 1.600 Lizenzen für den Endausbau gekauft; Nutzung steigt mit dem Rollout bis Ende 2025.",
          "Vorschlag: PDF-Bearbeitung zum Vertragsende auf 250 Lizenzen reduzieren (Kündigungsfrist drei Monate, also bis 31.05.2025).",
          "Fernwartung voll ausgelastet – bei Beitritt weiterer Mitglieder Aufstockung nötig.",
        ],
      },
    ],
  },
  {
    type: "excel",
    id: "zk-nutzung-onlinedienste-2026-h1",
    title: "Nutzung der Onlinedienste im 1. Halbjahr 2026",
    kind: "Statistik",
    fileName: "Nutzung Onlinedienste 1. Halbjahr 2026",
    org: "zkit",
    unit: "zk-ozg",
    author: "zk-fischer",
    date: "2026-07-08",
    tags: ["zahlen"],
    keywords: ["Wunschkennzeichen", "Schülerbeförderung", "Sperrmüll", "1. Halbjahr 2026"],
    summary:
      "Abgeschlossene Online-Anträge je Onlinedienst und Monat von Januar bis Juni 2026 mit Summen und Monatsdurchschnitt. Kurz und übersichtlich – gut für Diagramme, Saisonverläufe (Schülerbeförderung, Kursanmeldung) und eine Kurzmeldung für das Intranet.",
    sheets: [
      {
        name: "Onlinedienste",
        title: "Abgeschlossene Online-Anträge im 1. Halbjahr 2026",
        subtitle: "Quelle: Antragsmanagement des Portals, Auswertung vom 06.07.2026",
        columns: [
          { header: "Onlinedienst", width: 34 },
          { header: "Mitglied", width: 26 },
          { header: "Jan", width: 7, fmt: "int" },
          { header: "Feb", width: 7, fmt: "int" },
          { header: "Mär", width: 7, fmt: "int" },
          { header: "Apr", width: 7, fmt: "int" },
          { header: "Mai", width: 7, fmt: "int" },
          { header: "Jun", width: 7, fmt: "int" },
          { header: "Summe", width: 9, fmt: "int" },
          { header: "Ø Monat", width: 9, fmt: "int" },
        ],
        rows: [
          ["Wunschkennzeichen reservieren", "Landkreis", 1212, 1164, 1388, 1351, 1297, 1240, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          ["Außerbetriebsetzung Fahrzeug", "Landkreis", 214, 198, 231, 245, 226, 219, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          ["Wohngeld beantragen", "Landkreis", 96, 88, 92, 79, 85, 81, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          ["Schülerbeförderung beantragen", "Landkreis", 12, 9, 15, 64, 312, 587, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          ["Bauantrag digital", "Landkreis", 34, 39, 51, 48, 46, 44, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          ["Termin Bürgerbüro buchen", "Stadt Altmoor", 1410, 1322, 1498, 1376, 1301, 1288, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          ["Anwohnerparkausweis", "Stadt Altmoor", 46, 38, 41, 52, 37, 44, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          ["Meldebescheinigung", "Stadt Altmoor, Brackenhain", 188, 172, 195, 181, 176, 203, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          ["Gewerbeanmeldung", "Stadt Altmoor, Brackenhain", 58, 61, 74, 69, 55, 63, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          ["Hundesteuer an- und abmelden", "Stadt Altmoor, Brackenhain", 31, 27, 35, 42, 38, 29, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          ["Sperrmüll anmelden", "Abfallwirtschaftsbetrieb", 402, 455, 688, 731, 702, 619, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          ["Kursanmeldung", "Kreisvolkshochschule", 1034, 612, 388, 297, 241, 175, { f: "SUM(C{r}:H{r})" }, { f: "ROUND(I{r}/6,0)" }],
          {
            total: true,
            cells: [
              "Summe",
              "",
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "SUM(G{first}:G{last})" },
              { f: "SUM(H{first}:H{last})" },
              { f: "SUM(I{first}:I{last})" },
              { f: "ROUND(I{r}/6,0)" },
            ],
          },
        ],
        notes: [
          "Gezählt werden abgeschlossene Anträge; begonnene und abgebrochene Vorgänge sind nicht enthalten.",
          "Schülerbeförderung: Antragsfrist für das Schuljahr 2026/27 endete am 30.06.2026.",
          "Die Onlinedienste der Stadt Rabensfurt werden ab Herbst 2026 in die Auswertung aufgenommen.",
        ],
      },
    ],
  },
  {
    type: "word",
    id: "zk-rundschreiben-jahreswechsel-2025",
    title: "Rundschreiben 07/2025: Jahreswechsel in den Fachverfahren Finanzen und Personal",
    kind: "Rundschreiben",
    fileName: "Rundschreiben 07-2025 Jahreswechsel Finanz- und Personalverfahren",
    org: "zkit",
    unit: "zk-finanzverfahren",
    author: "zk-grewe",
    date: "2025-11-20",
    keywords: ["Rundschreiben 07/2025", "Systemsperre", "Buchungsschluss", "vorläufige Haushaltsführung", "Lohnsteuerbescheinigungen"],
    summary:
      "Rundschreiben an Kämmereien und Personalstellen der Mitglieder mit Terminen und Hinweisen zum Jahreswechsel 2025/2026 im Finanz- und Personalverfahren: letzter Zahllauf, Buchungsschluss, Systemsperre, vorläufige Haushaltsführung, Jahresmeldungen und Erreichbarkeit zwischen den Feiertagen. Gut für Checklisten, Kalendereinträge und eine kurze Mail an die eigenen Beschäftigten.",
    meta: [
      ["Rundschreiben-Nr.", "07/2025"],
      ["Aktenzeichen", "FV 40.02-2025"],
    ],
    recipient: ["An die Kämmereien und Personalstellen", "der Verbandsmitglieder", "– per E-Mail –"],
    subject: "Jahreswechsel 2025/2026 in den Fachverfahren Finanzen und Personal – Termine, Sperrzeiten und Hinweise",
    blocks: [
      { t: "p", text: "Sehr geehrte Damen und Herren," },
      {
        t: "p",
        text: "auch in diesem Jahr möchten wir Sie mit dem Rundschreiben 07/2025 rechtzeitig über die Arbeiten zum Jahreswechsel in den Fachverfahren Finanzen und Personal informieren. Bitte beachten Sie besonders die **Systemsperre des Finanzverfahrens vom 31.12.2025, 12:00 Uhr, bis zum 02.01.2026, 7:00 Uhr**, und leiten Sie dieses Rundschreiben an alle Beschäftigten weiter, die mit den Verfahren arbeiten.",
      },
      { t: "h2", text: "1. Die wichtigsten Termine auf einen Blick" },
      {
        t: "table",
        header: ["Datum", "Was passiert", "Was Sie tun müssen"],
        rows: [
          ["Mo 08.12.2025", "Letzter Mahnlauf 2025", "Mahnsperren bis 05.12. eintragen"],
          ["Fr 12.12.2025", "Datenannahmeschluss Entgeltabrechnung Dezember; Abgabe der Haushaltsansätze 2026 als Importdatei", "Änderungen bis 15:00 Uhr erfassen; Importdatei an das Team senden"],
          ["Di 16.12.2025", "Abrechnungslauf Dezember (Auszahlung zum 30.12.2025)", "Abrechnungsprotokolle am 17.12. prüfen"],
          ["15.12.2025 bis 09.01.2026", "Mahnstopp über die Feiertage", "–"],
          ["Mo 29.12.2025, 10:00 Uhr", "Letzter Zahllauf 2025 (Ausführung bei der Bank am 30.12.)", "Anordnungen bis 29.12., 9:00 Uhr, freigeben"],
          ["Di 30.12.2025, 12:00 Uhr", "Buchungsschluss Kasse 2025", "Tagesabschluss und Kassenbestandsnachweis"],
          ["Mi 31.12.2025, 12:00 Uhr, bis Fr 02.01.2026, 7:00 Uhr", "Systemsperre Finanzverfahren (Jahreswechsellauf, Eröffnung Haushaltsjahr 2026)", "Keine Anmeldung möglich"],
          ["Mo 05.01.2026", "Erster Zahllauf 2026", "–"],
          ["Do 08.01.2026", "Abschreibungslauf 2025 in der Anlagenbuchhaltung", "Zugänge 2025 bis 07.01. erfassen"],
          ["Mo 12.01.2026", "Datenannahmeschluss Entgeltabrechnung Januar", "Stammdatenänderungen zum Jahreswechsel erfassen"],
          ["Sa 31.01.2026", "Frist für Anträge auf Übertragung von Ermächtigungen", "Liste an das Team Fachverfahren Finanzen"],
          ["Fr 13.02.2026", "Übermittlung der Jahresmeldungen zur Sozialversicherung", "Keine Aufgabe für Sie – nur bei Rückfragen erreichbar sein"],
          ["Fr 27.02.2026", "Übermittlung der elektronischen Lohnsteuerbescheinigungen 2025", "–"],
          ["Di 31.03.2026", "Ende der Abschlussbuchungen 2025", "Abschlussbuchungen bis 31.03. vornehmen"],
        ],
        widths: [3, 5, 4],
      },
      { t: "h2", text: "2. Finanzverfahren" },
      {
        t: "ul",
        items: [
          "**Haushaltsdaten 2026:** Bitte übermitteln Sie die Ansätze 2026 bis zum 12.12.2025 als Importdatei. Spätere Lieferungen spielen wir erst nach dem Jahreswechsel ein; bis dahin sind keine Buchungen auf Konten des Haushaltsjahrs 2026 möglich.",
          "**Vorläufige Haushaltsführung:** Ist Ihre Haushaltssatzung 2026 bei Jahresbeginn noch nicht bekannt gemacht, richten wir die vorläufige Haushaltsführung nach der Kommunalverfassung (KV) ein. Dann dürfen nur Aufwendungen entstehen und Auszahlungen geleistet werden, zu denen Sie rechtlich verpflichtet sind oder die für die Weiterführung notwendiger Aufgaben unaufschiebbar sind. Bitte teilen Sie uns bis 15.12.2025 mit, ob dies bei Ihnen der Fall ist.",
          "**Übertragung von Ermächtigungen:** Anträge auf Übertragung nicht ausgeschöpfter Ermächtigungen nach der Gemeindehaushaltsverordnung (GemHVO) sammeln Sie bitte in Ihrer Kämmerei und senden uns die abgestimmte Liste bis 31.01.2026. Wir buchen die Übertragungen gesammelt.",
          "**Abschlussbuchungen:** Nach dem Jahreswechsel sind Buchungen im Haushaltsjahr 2025 nur noch mit der Berechtigung „Abschlussbuchungen“ möglich. Bitte prüfen Sie, wer in Ihrem Haus diese Berechtigung braucht.",
          "**E-Rechnung:** Ab 01.01.2026 werden eingehende E-Rechnungen aus dem Rechnungseingangsportal automatisch im Finanzverfahren angelegt. Papier- und PDF-Rechnungen scannen Sie bitte wie bisher.",
        ],
      },
      { t: "h2", text: "3. Personalverfahren" },
      {
        t: "ul",
        items: [
          "**Dezemberabrechnung:** Wegen der Feiertage liegt der Datenannahmeschluss früher als sonst (12.12.2025). Nachträgliche Änderungen werden mit der Januarabrechnung nachberechnet.",
          "**Jahreswechselarbeiten:** Die neuen Rechengrößen der Sozialversicherung und die Lohnsteuertabellen 2026 spielen wir mit dem Update am 29.12.2025 ein. Bitte prüfen Sie die Januarabrechnung stichprobenartig.",
          "**Jahresmeldungen und Lohnsteuerbescheinigungen:** Die Meldungen übermitteln wir zentral. Die gesetzlichen Fristen (15.02. für die Jahresmeldungen, 28.02. für die Lohnsteuerbescheinigungen) fallen 2026 auf ein Wochenende; wir übermitteln deshalb jeweils am Freitag davor.",
          "**Resturlaub:** Resturlaub wird automatisch übertragen. Die Verfallsdaten nach § 26 TVöD (Antritt bis 31.03., in Ausnahmefällen bis 31.05.) zeigt die Zeitwirtschaft ab Januar an.",
          "**Zur Information – Stadt Rabensfurt:** Mit dem Beitritt zum 01.07.2026 übernehmen wir die Personalabrechnung der Stadt. Eine Testübernahme der Stammdaten ist für März 2026 geplant.",
        ],
      },
      { t: "h2", text: "4. Erreichbarkeit zwischen den Feiertagen" },
      {
        t: "p",
        text: "Der Service Desk (Telefon 040 66969-899) ist am 22., 23., 29. und 30.12.2025 sowie am 02.01.2026 zu den üblichen Zeiten erreichbar. Am 24.12. und 31.12.2025 ist der Zweckverband geschlossen. Für das Finanzverfahren besteht am 29. und 30.12.2025 eine Rufbereitschaft bis 18:00 Uhr.",
      },
      {
        t: "p",
        text: "Bei Fragen zu diesem Rundschreiben wenden Sie sich bitte an das Team Fachverfahren Finanzen und Personal. Wir wünschen Ihnen ruhige Feiertage und einen guten Start in das Jahr 2026.",
      },
      { t: "p", text: "Mit freundlichen Grüßen" },
      { t: "signature", lines: ["Im Auftrag", "Monika Grewe", "Teamleiterin Fachverfahren Finanzen und Personal"] },
    ],
  },
  {
    type: "excel",
    id: "zk-schulungsteilnahmen-eakte-2026",
    title: "Schulungsteilnahmen E-Akte – Jugendamt und Gemeinde Brackenhain",
    kind: "Teilnehmendenliste und Auswertung",
    fileName: "Schulungsteilnahmen E-Akte Jugendamt Brackenhain Stand 2026-03-13",
    org: "zkit",
    unit: "zk-eakte",
    author: "zk-ohlsen",
    date: "2026-03-13",
    tags: ["zahlen", "widersprueche", "personendaten"],
    keywords: ["Grundlagen E-Akte", "G-15", "Allgemeiner Sozialer Dienst", "nicht erschienen", "krankgemeldet"],
    summary:
      "Teilnehmendenliste mit rund 200 Einträgen (Namen, Dienststelle, Status und Fehlgründe wie „krankgemeldet“), Terminübersicht und Auswertung der E-Akte-Schulungen im Jugendamt des Landkreises und in der Gemeinde Brackenhain. Eingebauter Widerspruch: Die Auswertung meldet für den Allgemeinen Sozialen Dienst 46 von 46 Geschulten, laut Liste und Terminübersicht waren es nur 40 – dadurch stimmen auch Gesamtzahl und Quote im Hinweis nicht.",
    sheets: [
      {
        name: "Auswertung",
        title: "Schulungsstand E-Akte nach Dienststelle",
        subtitle: "Stand 13.03.2026 · Geschult = Teilnahme am Kurs „Grundlagen E-Akte“ (G-01 bis G-14)",
        columns: [
          { header: "Dienststelle", width: 44 },
          { header: "Nutzende E-Akte (Soll)", width: 13, fmt: "int" },
          { header: "geschult", width: 10, fmt: "int" },
          { header: "Quote", width: 9, fmt: "pct" },
          { header: "offen", width: 8, fmt: "int" },
          { header: "angemeldet G-15", width: 12, fmt: "int" },
          { header: "Go-live", width: 12, fmt: "date" },
        ],
        rows: [
          ...SCHULUNG_EAKTE.auswertung,
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "C{r}/B{r}" }, { f: "SUM(E{first}:E{last})" }, { f: "SUM(F{first}:F{last})" }, null],
          },
        ],
        notes: [
          "JA = Jugendamt des Landkreises Altmoorland, BH = Gemeinde Brackenhain.",
          `Ergebnis: Im Jugendamt haben ${SCHULUNG_EAKTE.jaGemeldet} von ${SCHULUNG_EAKTE.jaSoll} Beschäftigten die Grundlagenschulung besucht (${Math.round((SCHULUNG_EAKTE.jaGemeldet / SCHULUNG_EAKTE.jaSoll) * 100)} %); der Go-live am 12.01.2026 erfolgte wie geplant.`,
          "Offene Personen werden im Nachholtermin G-15 am 24.03.2026 geschult; die Führungskräfte erhalten eine Liste ihrer noch nicht geschulten Beschäftigten.",
        ],
      },
      {
        name: "Termine",
        title: "Schulungstermine E-Akte 11/2025 bis 03/2026",
        columns: [
          { header: "Termin", width: 8 },
          { header: "Kurs", width: 32 },
          { header: "Datum", width: 11, fmt: "date" },
          { header: "Ort", width: 32 },
          { header: "Leitung", width: 18 },
          { header: "Dauer", width: 8, fmt: "hours" },
          { header: "Plätze", width: 8, fmt: "int" },
          { header: "angemeldet", width: 11, fmt: "int" },
          { header: "teilgenommen", width: 12, fmt: "int" },
          { header: "Auslastung", width: 10, fmt: "pct" },
          { header: "nicht teilgenommen", width: 12, fmt: "int" },
        ],
        rows: [
          ...SCHULUNG_EAKTE.termine,
          {
            total: true,
            cells: [
              "Summe",
              "",
              null,
              "",
              "",
              null,
              { f: "SUM(G{first}:G{last})" },
              { f: "SUM(H{first}:H{last})" },
              { f: "SUM(I{first}:I{last})" },
              null,
              { f: "SUM(K{first}:K{last})" },
            ],
          },
        ],
        notes: ["Auslastung = Teilnehmende geteilt durch Plätze. G-15 findet nach dem Stand dieser Liste statt."],
      },
      {
        name: "Teilnahmen",
        title: "Teilnehmendenliste E-Akte-Schulungen",
        subtitle: "Personenbezogene Daten – nur für die Schulungsorganisation und die zuständigen Führungskräfte; Löschung sechs Monate nach Projektende",
        columns: [
          { header: "Nr.", width: 6, fmt: "int" },
          { header: "Nachname", width: 16 },
          { header: "Vorname", width: 12 },
          { header: "Dienststelle", width: 42 },
          { header: "Termin", width: 8 },
          { header: "Datum", width: 11, fmt: "date" },
          { header: "Status", width: 16 },
          { header: "Bemerkung", width: 26 },
        ],
        rows: SCHULUNG_EAKTE.teilnahmen,
      },
    ],
  },
  {
    type: "powerpoint",
    id: "zk-migrationsfahrplan-rabensfurt",
    title: "Migrationsfahrplan Stadt Rabensfurt – Lenkungsgruppe Beitritt",
    kind: "Präsentation",
    fileName: "Migrationsfahrplan Rabensfurt Lenkungsgruppe 2026-04-16",
    org: "zkit",
    unit: "zk-betrieb",
    author: "zk-ritter",
    date: "2026-04-14",
    keywords: ["Lenkungsgruppe", "430 Arbeitsplätze", "Welle 3", "Serverraum", "Personalüberleitungsvertrag"],
    summary:
      "Fahrplan für die Umstellung der 430 Arbeitsplätze der Stadt Rabensfurt nach dem Beitritt zum 01.07.2026: Phasen, fünf Umstellungswellen, Kurve der umgestellten Arbeitsplätze, Änderungen für die Beschäftigten, Risiken und Entscheidungsbedarf. Gut, um eine Mitarbeiterinformation in einfacher Sprache oder eine Risikoliste abzuleiten.",
    slides: [
      { t: "title", title: "Migration der Stadt Rabensfurt in den Verbund", subtitle: "Fahrplan für die 3. Sitzung der Lenkungsgruppe am 16. April 2026" },
      {
        t: "bullets",
        title: "Ausgangslage",
        bullets: [
          "Beitritt zum 01.07.2026 – Beschluss des Stadtrats am 11.12.2025, Zustimmung der Verbandsversammlung am 16.12.2025",
          "430 Arbeitsplätze an 11 Standorten, rund 410 Beschäftigte",
          "Eigener Serverraum im Rathaus mit 9 physischen Servern, Wartungsverträge enden am 31.12.2026",
          "38 Fachanwendungen, davon 17 bereits beim Zweckverband im Einsatz (u. a. Meldewesen)",
          "Ziel: alle Arbeitsplätze bis 31.12.2026 umgestellt, Serverraum bis 31.03.2027 abgeschaltet",
        ],
        notes:
          "Das IT-Team der Stadt (4 Personen) bleibt bis Jahresende eingebunden. 2 Beschäftigte wechseln zum 01.07. über einen Personalüberleitungsvertrag zum Zweckverband.",
      },
      {
        t: "table",
        title: "Phasen",
        header: ["Phase", "Zeitraum", "Inhalt", "Stand"],
        rows: [
          ["0 Vorbereitung", "01–06/2026", "Bestandsaufnahme, Verträge, Personalüberleitungsvertrag, Netzplanung", "läuft, ca. 70 %"],
          ["1 Netzanbindung", "07–08/2026", "Glasfaser Rathaus, verschlüsselte Anbindung der Außenstellen, Firewall", "beauftragt"],
          ["2 Konten und E-Mail", "08–09/2026", "Übernahme der Benutzerkonten und Postfächer, Adressen bleiben @rabensfurt.example", "geplant"],
          ["3 Arbeitsplätze", "09–12/2026", "Austausch bzw. Neuinstallation in fünf Wellen", "geplant"],
          ["4 Fachverfahren", "07/2026–03/2027", "Umzug der 21 übrigen Fachanwendungen", "geplant"],
          ["5 Abschluss", "01–03/2027", "Abschaltung Serverraum, Datenlöschung, Abnahme", "geplant"],
        ],
      },
      {
        t: "table",
        title: "Umstellungswellen (Phase 3)",
        header: ["Welle", "Bereich", "Arbeitsplätze", "Zeitraum", "Besonderheit"],
        rows: [
          ["Welle 1", "Fachbereich 1 – Zentrale Dienste, Bürgermeisterin, Stabsstellen", "85", "07.–18.09.2026", "Pilotwelle, Auswertung vor Welle 2"],
          ["Welle 2", "Fachbereich 2 – Finanzen", "60", "28.09.–09.10.2026", "nicht in der Woche des Zahllaufs"],
          ["Welle 3", "Fachbereich 3 – Bürgerdienste, Ordnung und Feuerwehr", "95", "19.10.–06.11.2026", "Bürgerbüro am Samstag, 24.10.2026"],
          ["Welle 4", "Fachbereich 4 – Bildung, Soziales und Kultur", "110", "09.–27.11.2026", "viele Außenstellen: Kitas, Bibliothek, Musikschule"],
          ["Welle 5", "Fachbereich 5 – Stadtentwicklung, Bauen und Umwelt", "80", "30.11.–18.12.2026", "CAD-Arbeitsplätze, Betriebshof"],
          ["Summe", "", "430", "", ""],
        ],
        notes: "Die Wellen folgen den Fachbereichen, damit jedes Team an einem Stichtag gemeinsam umzieht. Welle 3 ist die heikelste wegen des Publikumsverkehrs.",
      },
      {
        t: "chart",
        title: "Umgestellte Arbeitsplätze (Plan, kumuliert zum Monatsende)",
        chart: {
          type: "line",
          categories: ["Aug", "Sep", "Okt", "Nov", "Dez"],
          series: [{ name: "Plan", values: [0, 100, 215, 350, 430] }],
          unit: "Arbeitsplätze",
        },
        caption: "Welle 2 und Welle 3 laufen über das Monatsende hinaus",
      },
      {
        t: "twocol",
        title: "Was ändert sich für die Beschäftigten?",
        left: {
          heading: "Neu",
          bullets: [
            "Anmeldung mit neuer Kennung und zweitem Faktor (App oder Schlüsselanhänger)",
            "Service Desk des Zweckverbands: 040 66969-899, Mo–Fr 7–18 Uhr",
            "Notebook mit Dockingstation statt Tower-PC",
            "Drucken mit Dienstausweis am Etagendrucker",
          ],
        },
        right: {
          heading: "Bleibt gleich",
          bullets: [
            "E-Mail-Adresse und Telefonnummer",
            "Ablage der Abteilung – sie zieht mit um",
            "Ansprechpersonen vor Ort in der ersten Woche jeder Welle",
            "Arbeitszeiterfassung und Fachverfahren für das Meldewesen",
          ],
        },
        notes: "Diese Folie geht fast wörtlich in die Mitarbeiterinformation der Stadt im Mai – bitte auf verständliche Sprache achten.",
      },
      {
        t: "bullets",
        title: "Risiken und Gegenmaßnahmen",
        bullets: [
          { text: "Lieferzeit Notebooks rund 10 Wochen", sub: ["Bestellung bis 15.05.2026 über den Rahmenvertrag"] },
          { text: "Kassensystem des Furtbads hat keine Schnittstelle zum Finanzverfahren", sub: ["Übergangslösung: Tagesabschluss als Datei, Klärung bis 30.06."] },
          { text: "Personalüberleitungsvertrag für 2 Beschäftigte noch nicht unterschrieben", sub: ["Personalrat der Stadt beteiligt, Termin 05.05.2026"] },
          { text: "Parallelbetrieb des Serverraums bis März 2027", sub: ["rund 4.500 € im Monat, trägt die Stadt"] },
        ],
      },
      {
        t: "bullets",
        title: "Entscheidungsbedarf der Lenkungsgruppe",
        bullets: [
          "Freigabe des Wellenplans",
          "Schließung des Bürgerbüros am Samstag, 24.10.2026 (Entscheidung der Bürgermeisterin)",
          "Einweisung von 2 Stunden je beschäftigter Person während der Arbeitszeit",
          "Kommunikationsplan: Mitarbeiterinformation im Mai, Personalversammlung im Juni",
        ],
      },
      { t: "end", title: "Nächste Sitzung: 18. Juni 2026", lines: ["Andreas Ritter · Bereichsleiter Infrastruktur und Betrieb", "Telefon 040 66969-810"] },
    ],
  },
  {
    type: "excel",
    id: "zk-patchstand-mitglieder-2026-09",
    title: "Patch- und Update-Stand nach Verbandsmitglied – Stand 04.09.2026",
    kind: "Statusbericht",
    fileName: "Patchstand Mitglieder und Server Stand 2026-09-04",
    org: "zkit",
    unit: "zk-netze",
    author: "zk-jacobsen",
    date: "2026-09-07",
    tags: ["zahlen"],
    keywords: ["Patchquote", "Virtualisierungshosts", "ISMS-L-01", "unter Ziel", "Wertstoffhof"],
    summary:
      "Stand der Sicherheitsupdates auf den Arbeitsplätzen je Mitglied (Patchquote gegen Zielwert 95 %) und auf Servern und Netzkomponenten mit offenen kritischen Updates und geplanten Terminen. Hintergrund für das Wartungsfenster im September 2026; gut für Ampel-Auswertungen und eine Erklärung für Laien, warum Updates Ausfallzeiten brauchen.",
    sheets: [
      {
        name: "Arbeitsplätze",
        title: "Arbeitsplätze: Stand der Sicherheitsupdates",
        subtitle: "Auswertung der Softwareverteilung vom 04.09.2026 · Bezug: Sicherheitsupdates vom 11.08.2026",
        columns: [
          { header: "Mitglied", width: 40 },
          { header: "aktueller Stand", width: 11, fmt: "int" },
          { header: "1 Monat zurück", width: 11, fmt: "int" },
          { header: "älter", width: 8, fmt: "int" },
          { header: "länger offline", width: 10, fmt: "int" },
          { header: "Geräte gesamt", width: 10, fmt: "int" },
          { header: "Patchquote", width: 10, fmt: "pct" },
          { header: "Ziel", width: 8, fmt: "pct" },
          { header: "Status", width: 11 },
        ],
        rows: [
          ["Landkreis Altmoorland", 789, 28, 6, 8, { f: "SUM(B{r}:E{r})" }, { f: "B{r}/F{r}" }, 0.95, { f: 'IF(G{r}>=H{r},"im Ziel","unter Ziel")' }],
          ["Stadt Altmoor", 281, 9, 1, 2, { f: "SUM(B{r}:E{r})" }, { f: "B{r}/F{r}" }, 0.95, { f: 'IF(G{r}>=H{r},"im Ziel","unter Ziel")' }],
          ["Gemeinde Brackenhain", 57, 4, 2, 1, { f: "SUM(B{r}:E{r})" }, { f: "B{r}/F{r}" }, 0.95, { f: 'IF(G{r}>=H{r},"im Ziel","unter Ziel")' }],
          ["Kreisvolkshochschule Altmoorland", 45, 1, 0, 0, { f: "SUM(B{r}:E{r})" }, { f: "B{r}/F{r}" }, 0.95, { f: 'IF(G{r}>=H{r},"im Ziel","unter Ziel")' }],
          ["Abfallwirtschaftsbetrieb Altmoorland", 98, 9, 3, 2, { f: "SUM(B{r}:E{r})" }, { f: "B{r}/F{r}" }, 0.95, { f: 'IF(G{r}>=H{r},"im Ziel","unter Ziel")' }],
          ["Stadt Rabensfurt (Pilotgeräte vor Welle 1)", 12, 0, 0, 0, { f: "SUM(B{r}:E{r})" }, { f: "B{r}/F{r}" }, 0.95, { f: 'IF(G{r}>=H{r},"im Ziel","unter Ziel")' }],
          ["Zweckverband (eigene Geräte)", 77, 1, 0, 0, { f: "SUM(B{r}:E{r})" }, { f: "B{r}/F{r}" }, 0.95, { f: 'IF(G{r}>=H{r},"im Ziel","unter Ziel")' }],
          {
            total: true,
            cells: [
              "Summe",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "B{r}/F{r}" },
              0.95,
              { f: 'IF(G{r}>=H{r},"im Ziel","unter Ziel")' },
            ],
          },
        ],
        notes: [
          "Aktueller Stand = Sicherheitsupdates vom 11.08.2026 installiert. Zielwert nach der Leitlinie zur Informationssicherheit (ISMS-L-01): mindestens 95 %.",
          "Länger offline = seit mehr als 30 Tagen nicht im Netz, z. B. Ersatzgeräte oder die Rechner an der Waage am Wertstoffhof; sie werden bei der nächsten Anmeldung zuerst aktualisiert.",
          "Die übrigen Arbeitsplätze der Stadt Rabensfurt betreut bis zu ihrer Umstellung die städtische IT; sie sind hier nicht enthalten.",
        ],
      },
      {
        name: "Server",
        title: "Server und zentrale Systeme",
        subtitle: "Stand 04.09.2026",
        columns: [
          { header: "Systemgruppe", width: 40 },
          { header: "Anzahl", width: 8, fmt: "int" },
          { header: "aktuell", width: 8, fmt: "int" },
          { header: "ausstehend", width: 10, fmt: "int" },
          { header: "davon kritisch", width: 10, fmt: "int" },
          { header: "Unterbrechung nötig", width: 12 },
          { header: "Termin", width: 22 },
          { header: "Bemerkung", width: 56 },
        ],
        rows: [
          ["Virtualisierungshosts RZ 1", 14, 0, { f: "B{r}-C{r}" }, 14, "ja", "22.09.2026, 17–23 Uhr", "Sicherheitsupdate des Herstellers vom 27.08.2026; Lücke wird aktiv ausgenutzt. Bis dahin Verwaltungszugänge zusätzlich abgeschottet."],
          ["Virtualisierungshosts RZ 2", 6, 6, { f: "B{r}-C{r}" }, 0, "nein", "erledigt am 31.08.2026", "im laufenden Betrieb aktualisiert"],
          ["Speichersysteme (Firmware)", 2, 0, { f: "B{r}-C{r}" }, 1, "ja", "22.09.2026, 17–23 Uhr", "nur zusammen mit den Hosts in RZ 1 möglich"],
          ["Server-Betriebssysteme (virtuell)", 186, 171, { f: "B{r}-C{r}" }, 4, "teilweise", "laufend, Wochenendfenster", "4 Server des Fachverfahrens Zulassung warten auf die Freigabe des Herstellers"],
          ["Datenbankserver", 22, 19, { f: "B{r}-C{r}" }, 0, "ja", "26.09.2026", ""],
          ["Netzkomponenten (Firewalls, Router, Switches)", 64, 58, { f: "B{r}-C{r}" }, 2, "teilweise", "15.09.2026", "2 Firewalls im Verbund, Umschaltung ohne Ausfall geplant"],
          ["Webserver Onlinedienste", 8, 8, { f: "B{r}-C{r}" }, 0, "nein", "erledigt", ""],
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, "", "", ""],
          },
        ],
        notes: [
          "Kritische Sicherheitsupdates sind nach ISMS-L-01 innerhalb von 7 Kalendertagen einzuspielen. Für die Hosts in RZ 1 ist das nur mit einer Unterbrechung aller zentralen Dienste möglich.",
          "Wartungsfenster sind den Mitgliedern mindestens zehn Arbeitstage vorher anzukündigen; die Ankündigung für den 22.09.2026 erfolgt am 08.09.2026.",
        ],
      },
    ],
  },
];

export const threads: ThreadSpec[] = [
  {
    id: "zk-stoerung-eakte-zertifikat",
    title: "Störung: Kein Zugriff auf die E-Akte",
    subject: "Störung: Kein Zugriff auf E-Akte – Ticket 2025-48213",
    org: "zkit",
    unit: "zk-servicedesk",
    date: "2025-10-09",
    tags: ["unstrukturiert"],
    keywords: ["Ticket 2025-48213", "Zertifikat", "Monitoring", "Nachbetrachtung"],
    summary:
      "Störungsverlauf: Der Landkreis meldet einen Ausfall der E-Akte, der Service Desk findet ein abgelaufenes Zertifikat, die Informationssicherheit fordert eine Nachbetrachtung.",
    mails: [
      {
        from: "am-petersen",
        to: ["zk-broekel"],
        date: "2025-10-09T07:52",
        body: `Hallo Service Desk,

seit ca. 7:40 Uhr kommt im Fachdienst Personal niemand mehr in die E-Akte. Fehlermeldung: „Die Verbindung ist nicht sicher“ bzw. „Server nicht erreichbar“. Betrifft alle 48 Kolleginnen und Kollegen, auch Finanzen hat angerufen.

Wir haben heute um 10 Uhr Abgabefrist für die Gehaltsänderungen an die Bezügestelle. Bitte dringend!

Gruß
Kai Petersen`,
      },
      {
        from: "zk-broekel",
        to: ["am-petersen"],
        cc: ["zk-kranz"],
        date: "2025-10-09T08:19",
        body: `Hallo Herr Petersen,

danke für die schnelle Meldung, Ticket 2025-48213 ist mit Priorität kritisch angelegt. Ursache gefunden: Das Serverzertifikat des E-Akte-Anwendungsservers ist heute Nacht um 0:00 Uhr abgelaufen. Die Kollegen vom Rechenzentrum spielen gerade ein neues Zertifikat ein.

Erwartete Wiederherstellung: ca. 8:45 Uhr. Bitte danach den Browser einmal komplett schließen und neu öffnen.

Viele Grüße
Nadine Brökel`,
      },
      {
        from: "zk-broekel",
        to: ["am-petersen"],
        cc: ["zk-kranz", "zk-rahimi"],
        date: "2025-10-09T08:51",
        body: `Hallo Herr Petersen,

die E-Akte ist seit 8:47 Uhr wieder erreichbar. Bitte geben Sie kurz Bescheid, ob bei Ihnen alles funktioniert. Das Ticket schließe ich, sobald Ihre Bestätigung da ist.

Herr Rahimi ist zur Information in Kopie, da es ein Sicherheitsthema betrifft.

Viele Grüße
Nadine Brökel`,
      },
      {
        from: "zk-rahimi",
        to: ["zk-broekel", "zk-kranz"],
        cc: ["zk-vogelsang"],
        date: "2025-10-09T11:30",
        quote: false,
        body: `Hallo zusammen,

danke für die schnelle Behebung. Trotzdem: Ein abgelaufenes Zertifikat darf uns nicht passieren. Bitte bis Ende nächster Woche eine kurze Nachbetrachtung mit:

1. Warum hat das Monitoring nicht gewarnt? (Laut Doku sollte es 30 Tage vorher eine Warnung geben.)
2. Welche weiteren Zertifikate laufen in den nächsten 90 Tagen ab?
3. Wer ist künftig verantwortlich für die Erneuerung – Rechenzentrum oder Fachverfahrensbetreuung?

Ich schlage vor, das Thema am 21.10. im Jour fixe Informationssicherheit zu besprechen.

Beste Grüße
Elias Rahimi`,
      },
    ],
  },
  {
    id: "zk-rueckfrage-umlage-brackenhain-2026",
    title: "Rückfrage der Gemeinde Brackenhain zur Verbandsumlage 2026",
    subject: "Festsetzung Verbandsumlage 2026 – Gemeinde Brackenhain",
    org: "zkit",
    unit: "zk-kaufm",
    date: "2026-02-03",
    tags: ["zahlen", "widersprueche"],
    keywords: ["406.010,88 €", "Arbeitsplatzmonate", "Haushaltssicherungskonzept", "Widerspruch", "92.075,00 €"],
    summary:
      "Die Kämmerin der Gemeinde Brackenhain bezweifelt die Umlagefestsetzung 2026 (64 statt 58 Arbeitsplätze), zahlt unter Vorbehalt und legt Widerspruch ein; der Zweckverband erläutert die Berechnung und bietet eine Stundung an. Fehler in der Antwort des Zweckverbands: 2.850 statt 2.580 Arbeitsplatzmonate für Rabensfurt (die Summe 18.528 passt dazu nicht) und eine Senkung des Satzes um „rund 12 %“ statt knapp 10 %.",
    mails: [
      {
        from: "bh-schnoor",
        to: ["zk-kuehl"],
        cc: ["bh-ruhnau"],
        date: "2026-01-27T08:47",
        body: `Sehr geehrter Herr Kühl,

mit Schreiben vom 19.01.2026 haben Sie die Verbandsumlage 2026 für die Gemeinde Brackenhain auf **406.010,88 €** festgesetzt. In unserem Haushalt 2026 sind dafür 368.300 € veranschlagt. Grundlage war Ihr Orientierungsschreiben vom 30.06.2025 („rund 6.350 € je Arbeitsplatz und Jahr“) und unsere eigene Zählung von 58 Arbeitsplätzen.

Die Differenz von 37.710,88 € kann ich nicht einfach hinnehmen. Wie Sie wissen, haben wir 2026 einen Fehlbetrag von 412.000 € und müssen ein Haushaltssicherungskonzept aufstellen. Jeden Mehraufwand muss ich gegenüber der Kommunalaufsicht begründen.

Ich bitte daher um Klärung:

1. Wie kommen Sie auf 64 Arbeitsplätze? Nach unserer Inventarliste (Stand 31.12.2025) sind es 58: Rathaus 49, Bauhof 4, Grundschule Sekretariat 3, Dorfgemeinschaftshaus 2. Die vier Gruppen-PCs im Kindergarten Lindenhof und die Rechner in den Feuerwehrgerätehäusern Brackenhain und Heidhof sind aus unserer Sicht keine Arbeitsplätze – sie werden von wechselnden Personen genutzt, die Feuerwehr-PCs nur ein paar Stunden im Monat.
2. Wie errechnet sich der Satz von 528,66 € je Arbeitsplatz und Monat?
3. Bezahlen wir über die Umlage die Umstellung der Stadt Rabensfurt mit?

Bis zur Klärung überweise ich den ersten Abschlag zum 15.02. unter Vorbehalt nur in Höhe von 92.075,00 € (ein Viertel unseres Haushaltsansatzes).

Mit freundlichen Grüßen
Petra Schnoor`,
      },
      {
        from: "zk-kuehl",
        to: ["bh-schnoor"],
        cc: ["bh-ruhnau", "zk-pagel"],
        date: "2026-01-28T14:05",
        attachments: ["zk-wirtschaftsplan-2026-umlage"],
        body: `Sehr geehrte Frau Schnoor,

vielen Dank für Ihre Nachricht. Gern zu Ihren Fragen:

**1. Arbeitsplätze:** Maßgeblich ist § 12 Abs. 2 der Verbandssatzung. Danach zählt jedes von uns betreute Endgerät mit eigener Anmeldung am Verbandsnetz, Stichtag ist der 30.06. des Vorjahres. Unser Inventarsystem weist für Brackenhain zum 30.06.2025 genau 64 Geräte aus. Darin enthalten sind die vier Gruppen-PCs im Kindergarten Lindenhof und je ein PC in den Gerätehäusern Brackenhain und Heidhof. Diese Geräte werden gepatcht, gesichert und über den Service Desk betreut wie jeder andere Arbeitsplatz. Für 2025 hatten wir übrigens 62 Arbeitsplätze angesetzt.

**2. Umlagesatz:** Der Umlagebedarf von 9.795.000 € wird durch die Arbeitsplatzmonate aller Mitglieder geteilt. Für die Stadt Rabensfurt rechnen wir 430 Arbeitsplätze × 6 Monate = 2.850 Arbeitsplatzmonate, insgesamt sind es 18.528. Daraus ergeben sich 528,66 € je Arbeitsplatz und Monat. Für Brackenhain: 64 × 12 × 528,66 € = 406.010,88 €.

**3. Rabensfurt:** Nein. Die Umstellungskosten trägt die Stadt Rabensfurt vollständig über eine einmalige Migrationspauschale von 640.000 €. Im Gegenteil: Weil sich die Fixkosten auf mehr Arbeitsplätze verteilen, sinkt der Satz gegenüber 2025 (586,14 €) um rund 12 %. Ihre Umlage ist damit um gut 30.000 € niedriger als 2025.

Das Orientierungsschreiben vom Juni nannte ausdrücklich einen vorläufigen Wert je Arbeitsplatz. Die Zahl der Geräte hatten wir Ihnen mit der Inventarliste im Juli mitgeteilt.

Die Berechnung aus dem Wirtschaftsplan, den die Verbandsversammlung am 16.12.2025 unverändert beschlossen hat, hänge ich an.

Eine Zahlung unter Vorbehalt ist möglich. Bitte beachten Sie aber, dass die Festsetzung bestandskräftig wird, wenn nicht innerhalb eines Monats nach Bekanntgabe Widerspruch eingelegt wird. Für die Abschläge ist Frau Pagel Ihre Ansprechpartnerin.

Mit freundlichen Grüßen
Thorsten Kühl`,
      },
      {
        from: "bh-schnoor",
        to: ["zk-kuehl"],
        cc: ["bh-ruhnau", "zk-pagel"],
        date: "2026-01-30T11:32",
        body: `Sehr geehrter Herr Kühl,

danke für die schnelle Antwort und die Tabelle.

Ich halte die Zählweise trotzdem für unangemessen. Ein Gruppen-PC im Kindergarten wird von zwölf Erzieherinnen und Erziehern geteilt, ein Feuerwehr-PC wird ehrenamtlich ein paar Stunden im Monat genutzt. Bei 528,66 € im Monat kostet uns allein der PC im Gerätehaus Heidhof 6.343,92 € im Jahr – dafür könnten wir jedes Jahr einen neuen kaufen.

Bürgermeister Ruhnau hat das Thema in der Verbandsversammlung am 16.12. angesprochen; laut Niederschrift soll die Zählweise im Juni beraten werden. Bis dahin lege ich vorsorglich Widerspruch gegen die Festsetzung ein. Das Schreiben geht heute per Post an Sie.

Den ersten Abschlag zahle ich wie angekündigt in Höhe von 92.075,00 €.

Unser Vorschlag für die Beratung im Juni: Geräte, die nicht einer Person zugeordnet sind, werden mit dem halben Satz angerechnet. Für Brackenhain läge die Umlage dann bei 386.979,12 €.

Mit freundlichen Grüßen
Petra Schnoor`,
      },
      {
        from: "zk-kuehl",
        to: ["bh-schnoor"],
        cc: ["bh-ruhnau", "zk-vogelsang", "zk-pagel"],
        date: "2026-02-03T09:20",
        body: `Sehr geehrte Frau Schnoor,

Ihren Widerspruch haben wir am 02.02.2026 erhalten. Herr Dr. Vogelsang und ich haben die Sache besprochen:

- Für 2026 bleibt es bei der Festsetzung. Die Satzung lässt uns keinen Spielraum, und eine Ausnahme für Brackenhain müssten wir allen Mitgliedern gewähren – allein der Landkreis hat über 60 vergleichbare Geräte in Schulen, Rettungswachen und Außenstellen.
- Ihren Vorschlag, nicht personenbezogene Geräte mit dem halben Satz anzurechnen, nehmen wir in die Vorlage für die Verbandsversammlung am 23.06.2026 auf. Eine Änderung könnte frühestens ab 2027 gelten.
- Damit der Widerspruch nicht streitig entschieden werden muss, schlagen wir vor, das Verfahren bis zur Entscheidung der Verbandsversammlung ruhen zu lassen. Die Differenz zum ersten Abschlag (101.502,72 € statt 92.075,00 €, also 9.427,72 €) stunden wir zinsfrei bis zum 15.05.2026.
- Frau Pagel schickt Ihnen bis Ende der Woche eine Liste der 64 Geräte mit Inventarnummer, Standort und letzter Anmeldung, damit Sie unsere Zählung prüfen können.

Wenn Sie einverstanden sind, genügt eine kurze Bestätigung per Mail.

Mit freundlichen Grüßen
Thorsten Kühl`,
      },
    ],
  },
  {
    id: "zk-phishing-vorfall-entgeltabrechnung",
    title: "Phishing-Vorfall „Entgeltabrechnung August 2025“ mit Datenabfluss",
    subject: "Verdächtige Mail „Ihre Entgeltabrechnung August 2025“ – Ticket 2025-41877",
    org: "zkit",
    unit: "zk-isb",
    date: "2025-08-21",
    tags: ["personendaten"],
    keywords: ["Ticket 2025-41877", "Weiterleitungsregel", "Art. 33 Abs. 2 DSGVO", "Eingliederungshilfe", "72 Stunden"],
    summary:
      "Service Desk, Informationssicherheit und Datenschutz bearbeiten eine Phishing-Welle: Zwei Beschäftigte geben ihr Kennwort ein, aus einem Postfach des Fachdienstes Soziales werden 14 Mails mit Gesundheitsdaten an eine fremde Adresse weitergeleitet. Enthält Namen, Geburtsdaten, Aktenzeichen und eine Kontoverbindung von Leistungsberechtigten – geeignet zum Anonymisieren und zum Entwurf der Meldung an die Aufsicht.",
    mails: [
      {
        from: "zk-yildiz",
        to: ["zk-rahimi"],
        cc: ["zk-broekel"],
        date: "2025-08-19T08:41",
        body: `Hallo Herr Rahimi,

seit ca. 8:05 Uhr laufen beim Service Desk Meldungen zu einer verdächtigen Mail ein:
Betreff „Ihre Entgeltabrechnung August 2025 – Bestätigung erforderlich“, Absender entgelt-service@zkit-altmoor-portal.example (nicht unsere Domain!). Der Link führt auf eine nachgebaute Anmeldeseite unter https://login.zkit-altmoor-portal.example/entgelt.

Stand jetzt 23 Meldungen, ich habe alles im Sammelticket 2025-41877 erfasst.

Zwei Personen haben am Telefon gesagt, dass sie ihre Zugangsdaten eingegeben haben:
- Bianca Hollstein, Landkreis, Fachdienst Soziales und Eingliederungshilfe, Kennung hollstein.b
- Uwe Marczinski, Stadt Altmoor, Bürgerbüro, Kennung marczinski.u

Beide Konten habe ich um 8:35 bzw. 8:38 Uhr gesperrt und die Kennwörter zurückgesetzt. Frau Hollstein war am Telefon sehr aufgelöst, sie hatte die Mail schon um kurz nach 8 geöffnet.

Sollen wir die Mail aus allen Postfächern löschen lassen? Herr Wolf wäre im Haus.

Viele Grüße
Selin Yıldız`,
      },
      {
        from: "zk-rahimi",
        to: ["zk-holt", "zk-broekel", "zk-wolf"],
        cc: ["zk-vogelsang"],
        date: "2025-08-19T11:20",
        body: `Hallo zusammen,

Zwischenstand zu Ticket 2025-41877:

- Die Mail ging um 7:52 Uhr an **412 Postfächer** (Landkreis 297, Stadt Altmoor 88, Kreisvolkshochschule 27). Seit 9:02 Uhr blockiert das Mail-Gateway den Absender, um 9:40 Uhr hat Herr Wolf die Mail aus allen Postfächern entfernt. Danke!
- Beim Service Desk sind inzwischen 37 Meldungen eingegangen.
- Laut Proxy-Protokoll haben 19 Geräte die Phishing-Seite aufgerufen. Eingabe von Zugangsdaten bestätigt bei Frau Hollstein und Herrn Marczinski; bei einem dritten Konto (Landkreis, Zulassungsstelle) unklar – Kennwort vorsorglich zurückgesetzt.
- **Konto Hollstein:** Um 8:03 Uhr Anmeldung am Webmail von einer IP-Adresse eines ausländischen Hosting-Anbieters. Um 8:06 Uhr wurde eine **Weiterleitungsregel** angelegt: alle eingehenden Mails an a.kessler.buchhaltung@freemail-box.example. Die Regel war bis zur Sperrung um 8:35 Uhr aktiv. In dieser Zeit wurden 14 Mails weitergeleitet, mehrere davon mit Unterlagen aus der Eingliederungshilfe – also Gesundheitsdaten nach Art. 9 DSGVO.
- **Konto Marczinski:** keine fremde Anmeldung feststellbar.

Unangenehm, aber ehrlich: Die Zwei-Faktor-Anmeldung für Webmail schreibt unsere Leitlinie seit April vor, die Umsetzung war aber erst für Dezember geplant. Mit zweitem Faktor wäre die Anmeldung um 8:03 Uhr gescheitert.

Frau Holt, bitte übernehmen Sie die datenschutzrechtliche Bewertung und die Information an den Landkreis als Verantwortlichen. Die Liste der 14 Mails mit Betreff und Anhängen lege ich gleich ins Ticket.

Herr Dr. Vogelsang, ich schlage vor, Anzeige zu erstatten. Kurze Abstimmung heute um 14 Uhr?

Beste Grüße
Elias Rahimi`,
      },
      {
        from: "zk-holt",
        to: ["am-kuhlmann"],
        cc: ["am-domroese", "zk-rahimi"],
        date: "2025-08-19T15:05",
        subject: "Information nach Art. 33 Abs. 2 DSGVO: Weiterleitung von Mails aus einem Postfach des Fachdienstes Soziales",
        quote: false,
        body: `Sehr geehrte Frau Kuhlmann,

als Auftragsverarbeiter informieren wir Sie nach Art. 33 Abs. 2 DSGVO über eine Verletzung des Schutzes personenbezogener Daten in Ihrem Fachdienst:

Nach einem Phishing-Angriff hat sich heute um 8:03 Uhr eine unbekannte Person mit den Zugangsdaten von Frau Bianca Hollstein am Webmail angemeldet und eine Weiterleitungsregel eingerichtet. Zwischen 8:06 und 8:35 Uhr wurden 14 eingehende Mails an eine externe Adresse weitergeleitet. Fünf dieser Mails enthalten personenbezogene Daten von Leistungsberechtigten der Eingliederungshilfe:

1. Pflegebericht des ambulanten Dienstes „Moorlicht“ zu Herrn Dieter Wolkenhauer, geb. 03.04.1961, Az. 50.2-EGH-2023-0417, mit Diagnosen und Medikation; in Kopie an seinen rechtlichen Betreuer Herrn Ralf Grabowski
2. Ärztliches Gutachten zu Frau Martina Ehlbeck, geb. 22.11.1988, Az. 50.2-EGH-2024-1102
3. Teilhabeplan Schulbegleitung für Jonas Tetzlaff, geb. 09.07.2007, Az. 50.2-EGH-2025-0233, Mail der Mutter Sabine Tetzlaff mit Telefonnummer 030 23125-482
4. Kostenzusage stationäre Unterbringung für Frau Hannelore Pieper, geb. 30.01.1949, Az. 50.2-EGH-2022-0871, mit Kontoverbindung der Einrichtung (IBAN DE00 2905 3172 4410 2876 55)
5. Rückfrage einer Schule zur Schulbegleitung von Jonas Tetzlaff mit Angaben zum Förderbedarf

Die übrigen neun Mails sind Rundschreiben, Termineinladungen und eine Bestellbestätigung ohne Daten Dritter.

Getroffene Maßnahmen: Konto gesperrt (8:35 Uhr), Kennwort zurückgesetzt, Weiterleitungsregel gelöscht (9:12 Uhr), Absender blockiert, Phishing-Mail aus allen Postfächern entfernt.

Bitte beachten Sie: Der Landkreis ist Verantwortlicher. Die Frist von **72 Stunden** für die Meldung an die oder den Landesbeauftragten für den Datenschutz nach Art. 33 Abs. 1 DSGVO beginnt mit Ihrer Kenntnis, also spätestens mit dieser Mail; sie endet am Freitag, 22.08.2025, 15:05 Uhr. Da Gesundheitsdaten betroffen sind, halte ich auch eine Benachrichtigung der betroffenen Personen nach Art. 34 DSGVO für erforderlich. Gern unterstütze ich Ihren Datenschutzbeauftragten mit einem Entwurf.

Mit freundlichen Grüßen
Katja Holt`,
      },
      {
        from: "am-kuhlmann",
        to: ["zk-holt"],
        cc: ["am-domroese", "zk-rahimi"],
        date: "2025-08-20T08:12",
        subject: "AW: Information nach Art. 33 Abs. 2 DSGVO: Weiterleitung von Mails aus einem Postfach des Fachdienstes Soziales",
        body: `Sehr geehrte Frau Holt,

danke für die schnelle und klare Information, auch wenn ich gestern Abend schlecht geschlafen habe.

Unser Datenschutzbeauftragter Herr Kröger bereitet die Meldung heute vor. Ein paar Fragen dazu:

1. Wissen wir, ob die weitergeleiteten Mails tatsächlich gelesen wurden? Oder müssen wir davon ausgehen?
2. Herr Wolkenhauer ist rechtlich betreut. Schreiben wir an ihn, an Herrn Grabowski oder an beide? Bei Jonas Tetzlaff (inzwischen 18) – an ihn selbst oder an die Mutter?
3. Wurde Anzeige erstattet? Wenn ja, bitte das Aktenzeichen für unsere Meldung.
4. Kann so etwas wieder passieren? Die Kolleginnen fragen mich, ob sie überhaupt noch Mails öffnen dürfen.

Frau Hollstein ist bis Ende der Woche krankgeschrieben. Sie macht sich große Vorwürfe. Ich habe ihr gesagt, dass sie richtig gehandelt hat, als sie sich sofort gemeldet hat.

Mit freundlichen Grüßen
Waltraud Kuhlmann`,
      },
      {
        from: "zk-rahimi",
        to: ["am-kuhlmann"],
        cc: ["zk-holt", "am-domroese", "zk-vogelsang"],
        date: "2025-08-21T16:40",
        subject: "AW: Information nach Art. 33 Abs. 2 DSGVO: Weiterleitung von Mails aus einem Postfach des Fachdienstes Soziales",
        body: `Sehr geehrte Frau Kuhlmann,

Frau Holt hat mich gebeten, die technischen Fragen zu beantworten:

1. **Gelesen?** Das können wir nicht feststellen, weil die Mails bei einem fremden Anbieter liegen. Bitte gehen Sie in der Meldung davon aus, dass sie gelesen wurden.
2. Zu den Benachrichtigungen meldet sich Frau Holt gesondert; nach ihrer Einschätzung sollte bei Herrn Wolkenhauer der Betreuer angeschrieben werden, bei Jonas Tetzlaff als Volljährigem er selbst.
3. **Anzeige:** Der Zweckverband hat am 20.08.2025 Strafanzeige bei der Polizei erstattet, Vorgangsnummer 0820-2025-11734. Zusätzlich haben wir den Anbieter der Empfängeradresse um Sperrung gebeten.
4. **Maßnahmen:**
- Automatische Weiterleitungen an fremde Adressen sind seit gestern für alle Postfächer gesperrt.
- Die Zwei-Faktor-Anmeldung für Webmail ziehen wir auf den 01.10.2025 vor.
- Ab September bietet Frau Lenz Awareness-Schulungen „Phishing erkennen“ für alle Mitglieder an. Für den Fachdienst Soziales gern zuerst.
- Die 19 Personen, die den Link geöffnet haben, sprechen wir einzeln an – ohne Vorwürfe.

Die Nachbetrachtung mit Zeitstrahl erhalten Sie bis zum 03.09.2025.

Bitte richten Sie Frau Hollstein aus: Sie hat genau das Richtige getan. Ohne ihren Anruf wäre die Weiterleitung womöglich den ganzen Tag gelaufen.

Beste Grüße
Elias Rahimi`,
      },
    ],
  },
  {
    id: "zk-wartungsfenster-kreistag-2026-09",
    title: "Wartungsfenster im Rechenzentrum kollidiert mit der Kreistagssitzung",
    subject: "Betriebsinformation: Wartungsfenster Rechenzentrum am Dienstag, 22.09.2026, 17:00–23:00 Uhr",
    org: "zkit",
    unit: "zk-servicedesk",
    date: "2026-09-10",
    keywords: ["Wartungsfenster", "Kreistag", "Sitzungskalender", "Wertstoffhof", "19.09.2026"],
    summary:
      "Der Service Desk kündigt ein Wartungsfenster für kritische Sicherheitsupdates an, der Landkreis beschwert sich verärgert, weil die Kreistagssitzung betroffen ist. Der Zweckverband entschuldigt sich, verlegt die Wartung auf einen Samstag und stimmt das mit dem Abfallwirtschaftsbetrieb ab. Gut für Antwortentwürfe auf Beschwerden und für die Abwägung zwischen Sicherheit und laufendem Betrieb.",
    mails: [
      {
        from: "zk-broekel",
        to: ["am-domroese", "ext-zk-claasen", "bh-hoefer", "am-dirksen", "rf-hesse"],
        cc: ["zk-wolf", "zk-ritter"],
        date: "2026-09-08T10:15",
        attachments: ["zk-patchstand-mitglieder-2026-09"],
        body: `Sehr geehrte Damen und Herren,

wir informieren Sie über ein geplantes Wartungsfenster im Rechenzentrum:

**Dienstag, 22.09.2026, 17:00 bis 23:00 Uhr**

Grund: Der Hersteller unserer Virtualisierungsplattform hat am 27.08.2026 ein Sicherheitsupdate veröffentlicht, das eine als kritisch eingestufte Lücke schließt. Gleichzeitig muss die Firmware der beiden Speichersysteme aktualisiert werden. Beides geht nur mit einer Unterbrechung. Den aktuellen Update-Stand aller Mitglieder finden Sie in der Anlage.

In diesem Zeitraum sind **nicht verfügbar**: E-Mail (auch auf Diensthandys), E-Akte, alle Fachverfahren, Dateiablagen, Ratsinformationssystem und der Fernzugang für das Homeoffice. Die Onlinedienste zeigen einen Wartungshinweis.

**Weiter verfügbar**: Telefonie und Internet über das Gäste-WLAN.

Bitte geben Sie die Information in Ihrer Verwaltung weiter – Herr Domröse, bitte auch an die Kreisvolkshochschule – und melden Sie sich bis Freitag, 11.09.2026, falls wichtige Termine betroffen sind.

Mit freundlichen Grüßen
Nadine Brökel`,
      },
      {
        from: "am-domroese",
        to: ["zk-broekel"],
        cc: ["zk-ritter", "am-ostendorf"],
        date: "2026-09-08T13:52",
        body: `Frau Brökel,

ist das Ihr Ernst? Am Dienstag, 22.09., tagt ab 17:00 Uhr der **Kreistag** – mit Livestream, drei per Video zugeschalteten Abgeordneten und dem Nachtragshaushalt 2026 auf der Tagesordnung. Die Abgeordneten arbeiten mit Tablets im Ratsinformationssystem, die Sitzungsunterlagen gibt es nur dort. Ohne Ratsinformationssystem und Netz im Kreishaus können wir die Sitzung nicht durchführen.

Das ist das zweite Mal in diesem Jahr: Im März lag das Netz-Update mitten in der Sitzung des Jugendhilfeausschusses. Der Sitzungskalender des Kreistags steht seit Dezember im Ratsinformationssystem. Den kann man vor der Planung eines Wartungsfensters doch einmal ansehen.

Ich bitte dringend um einen anderen Termin. Herr Ostendorf vom Kreistagsbüro ist in Kopie.

Pascal Domröse`,
      },
      {
        from: "zk-ritter",
        to: ["am-domroese", "am-dirksen", "ext-zk-claasen"],
        cc: ["zk-broekel", "zk-wolf", "am-ostendorf", "zk-vogelsang"],
        date: "2026-09-09T09:30",
        body: `Sehr geehrter Herr Domröse,

Sie haben recht, und dafür entschuldige ich mich. Wir haben den Termin nur mit unserem eigenen Änderungskalender abgeglichen, nicht mit den Sitzungsterminen der Mitglieder. Das ändern wir ab sofort: Jedes Wartungsfenster wird künftig gegen den Sitzungskalender aller Mitglieder geprüft.

Verschieben können wir allerdings nur nach vorn, nicht nach hinten. Die Lücke wird nach Angaben des Herstellers bereits aktiv ausgenutzt. Nach unserer Leitlinie müssten kritische Updates innerhalb von 7 Tagen eingespielt sein – diese Frist ist schon überschritten, weil die Hosts nur mit Unterbrechung aktualisiert werden können. Bis dahin haben wir die Verwaltungszugänge zusätzlich abgeschottet.

Möglich wäre:
1. **Samstag, 19.09.2026, 8:00 bis 14:00 Uhr** – mein Vorschlag. Betroffen wären vor allem der Wertstoffhof des Abfallwirtschaftsbetriebs und gegebenenfalls Samstagsdienste der Stadt Altmoor.
2. Dienstag, 22.09.2026, ab 21:00 Uhr – nur, wenn der Kreistag sicher bis dahin fertig ist.

Herr Dirksen, Frau Claasen: Ginge der Samstag bei Ihnen? Weil die Ankündigungsfrist von zehn Arbeitstagen dann nicht eingehalten ist, brauchen wir Ihr Einverständnis.

Unabhängig davon schicken wir zur Kreistagssitzung am 22.09. eine Technikerin ins Kreishaus.

Mit freundlichen Grüßen
Andreas Ritter`,
      },
      {
        from: "am-dirksen",
        to: ["zk-ritter"],
        cc: ["am-domroese", "ext-zk-claasen", "zk-broekel"],
        date: "2026-09-09T11:47",
        body: `Hallo Herr Ritter,

Samstag ist unser stärkster Tag am Wertstoffhof – bis zu 400 Anlieferungen, Waage und Gebührenkasse laufen über das Fachverfahren. Ich habe mit unserem Waagenservice telefoniert: Die Waage kann bis zu 500 Wiegungen lokal speichern und hinterher übertragen. Kasse machen wir dann bar mit Quittungsblock.

Also einverstanden, aber bitte früher anfangen und spätestens um 13:00 Uhr fertig sein. Um 13:30 Uhr machen wir den Wochenabschluss.

Gruß
Rolf Dirksen`,
      },
      {
        from: "zk-ritter",
        to: ["am-domroese", "am-dirksen", "ext-zk-claasen", "bh-hoefer", "rf-hesse"],
        cc: ["zk-broekel", "zk-wolf", "am-ostendorf", "zk-vogelsang"],
        date: "2026-09-10T08:05",
        subject: "Geändert: Wartungsfenster Rechenzentrum jetzt Samstag, 19.09.2026, 7:00–13:00 Uhr",
        body: `Sehr geehrte Damen und Herren,

vielen Dank für die schnellen Rückmeldungen. Das Wartungsfenster wird verlegt:

**Neu: Samstag, 19.09.2026, 7:00 bis 13:00 Uhr** (statt Dienstag, 22.09.2026, 17:00 bis 23:00 Uhr)

- Frau Claasen hat telefonisch bestätigt, dass die Stadt Altmoor samstags keine Termine im Bürgerbüro anbietet.
- Der Wertstoffhof arbeitet in dieser Zeit mit lokaler Speicherung an der Waage und mit Barkasse.
- Die Kreistagssitzung am 22.09. ist nicht mehr betroffen; eine Technikerin ist ab 16:30 Uhr im Kreishaus.
- Betroffen sind dieselben Dienste wie in der ersten Information. Herr Hesse, das gilt auch für die bereits umgestellten Arbeitsplätze der Welle 1 in Rabensfurt.

Frau Brökel schickt bis morgen eine aktualisierte Betriebsinformation an alle Ansprechpersonen. Nach Abschluss der Arbeiten informieren wir Sie per SMS.

Mit freundlichen Grüßen
Andreas Ritter`,
      },
    ],
  },
];
