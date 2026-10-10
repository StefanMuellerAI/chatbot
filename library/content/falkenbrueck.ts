// Stadt Falkenbrück (kreisfreie Großstadt)
import type { DocSpec, ThreadSpec } from "../types";

export const documents: DocSpec[] = [
  {
    type: "word",
    id: "fb-beschlussvorlage-kita-nordstadt",
    title: "Beschlussvorlage: Ausbau der Kindertagesbetreuung in der Nordstadt",
    kind: "Beschlussvorlage",
    fileName: "V-2025-0412 Beschlussvorlage Kita-Ausbau Nordstadt",
    org: "falkenbrueck",
    unit: "fb-amt51-kita",
    author: "fb-lindner",
    date: "2025-10-06",
    tags: ["zahlen"],
    keywords: ["V/2025/0412", "Kiebitzweg", "4.200.000 €", "Jugendhilfeausschuss", "128 Plätze"],
    summary:
      "Vorlage für Jugendhilfeausschuss und Rat: Neubau einer sechsgruppigen Kita mit 110 Plätzen in der Nordstadt – Bedarf, Alternativen, Kosten, Förderung und Zeitplan.",
    meta: [
      ["Vorlage-Nr.", "V/2025/0412"],
      ["Aktenzeichen", "51.2-460.21/25"],
      ["Status", "öffentlich"],
    ],
    subject: "Ausbau der Kindertagesbetreuung in der Nordstadt – Neubau einer Kindertageseinrichtung am Kiebitzweg",
    blocks: [
      {
        t: "table",
        header: ["Beratungsfolge", "Sitzung", "Zuständigkeit"],
        rows: [
          ["Jugendhilfeausschuss", "28.10.2025", "Vorberatung"],
          ["Haupt- und Finanzausschuss", "06.11.2025", "Vorberatung"],
          ["Rat der Stadt", "20.11.2025", "Entscheidung"],
        ],
        widths: [3, 2, 2],
      },
      { t: "h1", text: "Beschlussvorschlag" },
      { t: "p", text: "Der Rat der Stadt Falkenbrück beschließt:" },
      {
        t: "ol",
        items: [
          "Die Verwaltung wird beauftragt, auf dem städtischen Grundstück Gemarkung Nordstadt, Flur 7, Flurstück 112/3 (ehemaliger Bolzplatz Kiebitzweg) eine Kindertageseinrichtung mit sechs Gruppen und insgesamt 110 Plätzen zu errichten.",
          "Die Gesamtkosten in Höhe von **4.200.000 €** werden im Teilfinanzhaushalt 51 bereitgestellt. Die Finanzierung erfolgt über Fördermittel aus dem Landesprogramm „Kita-Ausbau 2026“ (voraussichtlich 2.100.000 €) und über Eigenmittel.",
          "Die Verwaltung wird ermächtigt, den Förderantrag bis zum 15.12.2025 zu stellen und die Planungsleistungen auszuschreiben.",
        ],
      },
      { t: "h1", text: "Sachverhalt" },
      { t: "h2", text: "Bedarf" },
      {
        t: "p",
        text: "In der Nordstadt sind seit 2021 durch die Baugebiete „Am Kiebitzweg“ und „Lerchenfeld II“ rund 640 neue Wohneinheiten entstanden. Die Zahl der Kinder im Alter von 0 bis unter 6 Jahren ist im selben Zeitraum von 812 auf 1.047 gestiegen (+ 29 %). Die vier vorhandenen Einrichtungen im Stadtteil verfügen zusammen über 395 Plätze.",
      },
      {
        t: "p",
        text: "Nach der Kita-Bedarfsplanung (Stand 30.06.2025) fehlen in der Nordstadt zum Kindergartenjahr 2026/27 rechnerisch **128 Plätze**, davon 44 für Kinder unter drei Jahren. Derzeit stehen 97 Kinder aus dem Stadtteil auf der Warteliste; 31 Familien haben ihren Rechtsanspruch nach § 24 SGB VIII bereits schriftlich geltend gemacht.",
      },
      {
        t: "table",
        header: ["Altersgruppe", "Bedarf 2026/27", "Vorhandene Plätze", "Fehlbedarf"],
        rows: [
          ["unter 3 Jahre", "186", "142", "44"],
          ["3 bis 6 Jahre", "337", "253", "84"],
          ["Summe", "523", "395", "128"],
        ],
      },
      { t: "h2", text: "Geprüfte Alternativen" },
      {
        t: "ul",
        items: [
          "**Erweiterung der Kita „Sonnenblume“** um zwei Gruppen: deckt den Bedarf nur zu rund einem Drittel, das Grundstück lässt keine weitere Bebauung zu.",
          "**Anmietung von Räumen im Gewerbegebiet Nord:** scheitert an den baulichen Anforderungen der Heimaufsicht (Außenspielfläche, Lärmschutz) und an der Entfernung zum Wohngebiet.",
          "**Neubau am Kiebitzweg:** deckt den Fehlbedarf weitgehend, das Grundstück ist im Eigentum der Stadt und gut erschlossen.",
        ],
      },
      {
        t: "p",
        text: "Die Verwaltung empfiehlt den Neubau am Kiebitzweg. Der wegfallende Bolzplatz wird nach dem Spielflächenkonzept im Grünzug Lerchenfeld ersetzt.",
      },
      { t: "h1", text: "Finanzielle Auswirkungen" },
      {
        t: "table",
        header: ["Position", "2026", "2027", "Gesamt"],
        rows: [
          ["Planung und Gutachten", "380.000 €", "–", "380.000 €"],
          ["Baukosten", "1.950.000 €", "1.520.000 €", "3.470.000 €"],
          ["Ausstattung", "–", "350.000 €", "350.000 €"],
          ["Summe", "2.330.000 €", "1.870.000 €", "4.200.000 €"],
        ],
        widths: [3, 2, 2, 2],
      },
      {
        t: "p",
        text: "Abzüglich der erwarteten Förderung von 2.100.000 € verbleibt ein Eigenanteil von 2.100.000 €. Die jährlichen Folgekosten für Personal und Bewirtschaftung (abzüglich Elternbeiträge und Landeszuweisungen) werden auf rund 410.000 € geschätzt.",
      },
      {
        t: "note",
        text: "**Hinweis der Kämmerei:** Die Kostenschätzung beruht auf dem Baupreisindex des 2. Quartals 2025. Sie wird mit der Entwurfsplanung aktualisiert.",
      },
      { t: "h1", text: "Zeitplan" },
      {
        t: "ul",
        items: [
          "Förderantrag: bis 15.12.2025",
          "Vergabe der Planungsleistungen: 1. Quartal 2026",
          "Baubeginn: 3. Quartal 2026",
          "Inbetriebnahme: Kindergartenjahr 2027/28",
        ],
      },
      { t: "h1", text: "Auswirkungen auf Klima und Gleichstellung" },
      {
        t: "p",
        text: "Der Neubau wird im Standard Effizienzgebäude 40 mit Photovoltaikanlage und Gründach errichtet. Zusätzliche Betreuungsplätze verbessern die Vereinbarkeit von Familie und Beruf und erleichtern insbesondere Alleinerziehenden die Rückkehr in den Beruf.",
      },
      { t: "signature", lines: ["Dr. Henrike Laßberg", "Oberbürgermeisterin"] },
    ],
  },
  {
    type: "excel",
    id: "fb-budgetueberwachung-th51",
    title: "Budgetüberwachung Teilhaushalt 51 – Stand 30.09.2025",
    kind: "Budgetüberwachung",
    fileName: "Budgetueberwachung TH51 Jugend Stand 2025-09-30",
    org: "falkenbrueck",
    unit: "fb-amt20",
    author: "fb-kowalczyk",
    date: "2025-10-02",
    tags: ["zahlen"],
    keywords: ["36.30.02", "Hilfen zur Erziehung stationär", "Prognose", "Inobhutnahmen"],
    summary: "Ansatz, Ist und Prognose je Produkt des Jugendamts mit Abweichungen; zweites Blatt mit monatlichen Fallzahlen der Hilfen zur Erziehung.",
    sheets: [
      {
        name: "Übersicht",
        title: "Budgetüberwachung Teilhaushalt 51 – Jugend",
        subtitle: "Stand: 30.09.2025 · Beträge in Euro · Prognose zum 31.12.2025",
        columns: [
          { header: "Produkt", width: 11 },
          { header: "Bezeichnung", width: 44 },
          { header: "Ansatz 2025", width: 15, fmt: "eur0" },
          { header: "Ist bis 30.09.", width: 15, fmt: "eur0" },
          { header: "Prognose 31.12.", width: 15, fmt: "eur0" },
          { header: "Abweichung", width: 14, fmt: "eur0" },
          { header: "Abw. in %", width: 10, fmt: "pct" },
        ],
        rows: [
          ["36.10.01", "Kindertagesbetreuung in städtischen Einrichtungen", 18450000, 13912400, 18930000, { f: "E{r}-C{r}" }, { f: "F{r}/C{r}" }],
          ["36.10.02", "Zuschüsse an freie Träger (Kita)", 22800000, 16640300, 22650000, { f: "E{r}-C{r}" }, { f: "F{r}/C{r}" }],
          ["36.10.03", "Kindertagespflege", 3150000, 2488900, 3390000, { f: "E{r}-C{r}" }, { f: "F{r}/C{r}" }],
          ["36.30.01", "Hilfen zur Erziehung ambulant", 9600000, 7512800, 10240000, { f: "E{r}-C{r}" }, { f: "F{r}/C{r}" }],
          ["36.30.02", "Hilfen zur Erziehung stationär", 14200000, 11385600, 15180000, { f: "E{r}-C{r}" }, { f: "F{r}/C{r}" }],
          ["36.40.01", "Kinder- und Jugendarbeit, Jugendzentren", 2350000, 1602100, 2290000, { f: "E{r}-C{r}" }, { f: "F{r}/C{r}" }],
          ["36.50.01", "Unterhaltsvorschuss", 4100000, 3201700, 4260000, { f: "E{r}-C{r}" }, { f: "F{r}/C{r}" }],
          ["36.60.01", "Allgemeiner Sozialer Dienst", 6900000, 5104000, 6850000, { f: "E{r}-C{r}" }, { f: "F{r}/C{r}" }],
          {
            total: true,
            cells: [
              "",
              "Summe Teilhaushalt 51",
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "E{r}-C{r}" },
              { f: "F{r}/C{r}" },
            ],
          },
        ],
        notes: [
          "Hilfen zur Erziehung stationär: vier zusätzliche Inobhutnahmen im August und September; zwei Fälle mit Unterbringung außerhalb des Stadtgebiets.",
          "Kindertagespflege: Erhöhung der laufenden Geldleistung zum 01.08.2025 (Ratsbeschluss vom 03.07.2025).",
          "Prognose ohne die Tarifsteigerung zum 01.10.2025; diese wird zentral im Teilhaushalt 11 abgebildet.",
        ],
      },
      {
        name: "Fallzahlen HzE",
        title: "Fallzahlen Hilfen zur Erziehung 2025",
        subtitle: "Laufende Fälle zum Monatsende",
        columns: [
          { header: "Monat", width: 14 },
          { header: "ambulant", width: 12, fmt: "int" },
          { header: "stationär", width: 12, fmt: "int" },
          { header: "Inobhutnahmen", width: 15, fmt: "int" },
          { header: "Fälle gesamt", width: 14, fmt: "int" },
        ],
        rows: [
          ["Januar", 412, 188, 6, { f: "B{r}+C{r}" }],
          ["Februar", 418, 190, 4, { f: "B{r}+C{r}" }],
          ["März", 421, 189, 7, { f: "B{r}+C{r}" }],
          ["April", 426, 192, 5, { f: "B{r}+C{r}" }],
          ["Mai", 431, 193, 6, { f: "B{r}+C{r}" }],
          ["Juni", 429, 195, 5, { f: "B{r}+C{r}" }],
          ["Juli", 436, 197, 8, { f: "B{r}+C{r}" }],
          ["August", 440, 201, 10, { f: "B{r}+C{r}" }],
          ["September", 447, 204, 9, { f: "B{r}+C{r}" }],
          {
            total: true,
            cells: [
              "Durchschnitt",
              { f: "ROUND(AVERAGE(B{first}:B{last}),0)" },
              { f: "ROUND(AVERAGE(C{first}:C{last}),0)" },
              { f: "ROUND(AVERAGE(D{first}:D{last}),1)", fmt: "dec" },
              { f: "ROUND(AVERAGE(E{first}:E{last}),0)" },
            ],
          },
        ],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "fb-buergeramt-2030",
    title: "Bürgeramt 2030 – Ergebnisse der Klausurtagung",
    kind: "Präsentation",
    fileName: "Buergeramt 2030 Ergebnisse Klausurtagung",
    org: "falkenbrueck",
    unit: "fb-amt33",
    author: "fb-feldhaus",
    date: "2025-09-29",
    tags: ["zahlen"],
    keywords: ["18 Werktage", "No-Show", "Express-Schalter", "142.000"],
    summary: "Ergebnisse der Klausurtagung des Bürgeramts: Wartezeiten, Anliegen, Stärken und Handlungsbedarf sowie ein Maßnahmenplan bis 2026.",
    slides: [
      { t: "title", title: "Bürgeramt 2030", subtitle: "Ergebnisse der Klausurtagung am 23. und 24. September 2025" },
      {
        t: "bullets",
        title: "Ausgangslage",
        bullets: [
          "Wartezeit auf einen Termin: **18 Werktage** (Ziel: höchstens 5)",
          { text: "Rund 142.000 Vorsprachen im Jahr 2024", sub: ["38 % davon Ausweis- und Passangelegenheiten", "Spitzen vor den Sommerferien"] },
          "4,5 von 21 Stellen unbesetzt, zwei Langzeiterkrankungen",
          "Online-Terminbuchung funktioniert – aber 31 % der Termine werden nicht wahrgenommen (No-Show)",
        ],
        notes:
          "Die No-Show-Quote stammt aus dem Terminsystem (Auswertung Januar bis August 2025). Bitte betonen: Ohne die nicht wahrgenommenen Termine läge die Wartezeit bei etwa 12 Werktagen.",
      },
      {
        t: "chart",
        title: "Wartezeit auf einen Termin",
        chart: {
          type: "line",
          categories: ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep"],
          series: [
            { name: "Wartezeit 2025", values: [9, 11, 12, 14, 15, 17, 21, 19, 18] },
            { name: "Zielwert", values: [5, 5, 5, 5, 5, 5, 5, 5, 5] },
          ],
          unit: "Werktage",
        },
        caption: "Quelle: Terminsystem, jeweils erster freier Termin am Monatsende",
      },
      {
        t: "chart",
        title: "Anliegen nach Art (2024)",
        chart: {
          type: "bar",
          categories: ["Ausweis und Pass", "An- und Ummeldung", "Führungszeugnisse", "Beglaubigungen", "Sonstiges"],
          series: [{ name: "Vorsprachen", values: [54000, 41000, 12500, 9800, 24700] }],
          unit: "Vorsprachen",
        },
        notes: "Führungszeugnisse lassen sich bereits online beantragen – das ist kaum bekannt.",
      },
      {
        t: "twocol",
        title: "Was wir behalten – was wir ändern",
        left: {
          heading: "Stärken",
          bullets: ["Hohe Fachkompetenz im Team", "Gute Bewertung der Freundlichkeit (4,4 von 5)", "Online-Terminvergabe ist etabliert"],
        },
        right: {
          heading: "Handlungsbedarf",
          bullets: [
            "Zu viele Vorsprachen für einfache Anliegen",
            "Keine Erinnerung an gebuchte Termine",
            "Rückstand bei Führungszeugnissen",
            "Einarbeitung neuer Kolleginnen und Kollegen dauert zu lange",
          ],
        },
      },
      {
        t: "table",
        title: "Maßnahmenplan",
        header: ["Maßnahme", "Verantwortlich", "Bis"],
        rows: [
          ["Terminerinnerung per E-Mail und SMS", "Amt 12 mit Bürgeramt", "12/2025"],
          ["Online-Antrag Führungszeugnis bewerben", "Bürgeramt, Presseamt", "11/2025"],
          ["Express-Schalter für Abholungen", "Frau Feldhaus", "01/2026"],
          ["Zwei Stellen extern ausschreiben", "Amt 11", "10/2025"],
          ["Pilot: KI-Assistent für Standardanfragen", "Amt 12 mit Bürgeramt", "06/2026"],
        ],
        notes: "Der KI-Pilot braucht vorher eine Datenschutz-Folgenabschätzung und die Beteiligung des Personalrats.",
      },
      {
        t: "bullets",
        title: "Nächste Schritte",
        bullets: [
          "Vorstellung im Verwaltungsvorstand am 14.10.2025",
          "Abstimmung mit dem Personalrat zum Express-Schalter",
          "Zwischenbericht im Haupt- und Finanzausschuss im Februar 2026",
        ],
      },
      { t: "end", title: "Vielen Dank!", lines: ["Annika Feldhaus · Leiterin Bürgeramt", "Telefon 069 90009-331"] },
    ],
  },
];

export const threads: ThreadSpec[] = [
  {
    id: "fb-mitzeichnung-kita-nordstadt",
    title: "Mitzeichnung Beschlussvorlage Kita Nordstadt",
    subject: "Mitzeichnung Beschlussvorlage V/2025/0412 – Kita-Ausbau Nordstadt",
    org: "falkenbrueck",
    unit: "fb-amt51-kita",
    date: "2025-10-08",
    tags: ["widersprueche", "zahlen"],
    keywords: ["4,8 Mio. €", "30.11.2025", "Bebauungsplan Nr. 47", "Bauvoranfrage"],
    summary:
      "Jugendamt, Kämmerei und Bauaufsicht stimmen die Beschlussvorlage ab. Die Kämmerei widerspricht bei Kosten und Förderfrist, die Bauaufsicht sieht ein Planungsrisiko.",
    mails: [
      {
        from: "fb-lindner",
        to: ["fb-kowalczyk", "fb-brandt"],
        cc: ["fb-wehling"],
        date: "2025-10-06T10:14",
        attachments: ["fb-beschlussvorlage-kita-nordstadt"],
        body: `Liebe Frau Kowalczyk, lieber Herr Brandt,

anbei der Entwurf der Beschlussvorlage V/2025/0412 zum Kita-Neubau am Kiebitzweg. Die Vorlage soll am 28.10. in den Jugendhilfeausschuss.

Ich bitte um Mitzeichnung bis Freitag, 10.10., 12 Uhr:
- Frau Kowalczyk: Finanzierung und Haushaltsmittel 2026/2027
- Herr Brandt: baurechtliche Einschätzung zum Grundstück (Stellplätze, Ersatz für den Bolzplatz)

Vielen Dank und viele Grüße
Petra Lindner`,
      },
      {
        from: "fb-brandt",
        to: ["fb-lindner"],
        cc: ["fb-kowalczyk", "fb-wehling"],
        date: "2025-10-07T14:32",
        body: `Hallo Frau Lindner,

grundsätzlich ist das Vorhaben aus Sicht der Bauaufsicht machbar. Zwei Punkte sollten aber in die Vorlage:

1. Der Bebauungsplan Nr. 47 „Kiebitzweg“ setzt die Fläche als öffentliche Grünfläche mit Zweckbestimmung Spielplatz fest. Für eine Kita brauchen wir entweder eine Befreiung nach § 31 Abs. 2 BauGB oder eine Änderung des Bebauungsplans. Eine Änderung dauert erfahrungsgemäß 9 bis 12 Monate – dann ist der Baubeginn im 3. Quartal 2026 nicht zu halten.

2. Nach unserer Stellplatzsatzung sind 9 Stellplätze nachzuweisen, dazu eine Hol- und Bringzone. Das kostet Fläche, die im Entwurf noch nicht berücksichtigt ist.

Mein Vorschlag: Wir stellen bis Ende Oktober eine Bauvoranfrage, dann wissen wir, ob die Befreiung trägt.

Mitzeichnung gerne mit diesem Hinweis.

Beste Grüße
Jonas Brandt`,
      },
      {
        from: "fb-kowalczyk",
        to: ["fb-lindner"],
        cc: ["fb-brandt", "fb-wehling"],
        date: "2025-10-08T09:05",
        body: `Liebe Frau Lindner,

von Seiten der Kämmerei kann ich nur unter Vorbehalt mitzeichnen:

- **Kosten:** Mit dem Baupreisindex für das 3. Quartal und den Erfahrungen aus der Kita Lerchenfeld rechnen wir eher mit **4,8 Mio. €** statt 4,2 Mio. €.
- **Förderfrist:** Laut dem neuen Förderaufruf des Landes vom 01.10.2025 gilt die Förderquote von 50 % nur für Anträge bis zum **30.11.2025** – nicht bis 15.12.
- **Haushalt:** Im Entwurf des Haushalts 2026 sind für die Maßnahme bisher nur 1,9 Mio. € veranschlagt, die Vorlage nennt 2,33 Mio. € für 2026.

Bitte passen Sie die Vorlage entsprechend an, sonst bekommen wir im Haupt- und Finanzausschuss Rückfragen.

Mit freundlichen Grüßen
Sabine Kowalczyk`,
      },
      {
        from: "fb-lindner",
        to: ["fb-kowalczyk", "fb-brandt"],
        cc: ["fb-wehling"],
        date: "2025-10-08T16:47",
        body: `Liebe Frau Kowalczyk, lieber Herr Brandt,

vielen Dank für die schnellen Rückmeldungen. Ich passe die Vorlage an:
- Gesamtkosten 4,8 Mio. € mit Hinweis auf den Baupreisindex
- Förderantrag bis 30.11.2025
- Hinweis auf die Bauvoranfrage und das Risiko für den Zeitplan

Herr Brandt, schaffen wir die Bauvoranfrage bis zum 31.10.? Dann könnten wir das Ergebnis noch vor der Ratssitzung nachreichen.

Wegen der Haushaltsmittel schlage ich ein kurzes Gespräch am Donnerstag um 9:30 Uhr in Raum 2.14 vor.

Viele Grüße
Petra Lindner`,
      },
    ],
  },
];
