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
  {
    type: "word",
    id: "fb-dienstvereinbarung-mobiles-arbeiten",
    title: "Dienstvereinbarung Mobiles Arbeiten – Entwurf zur Beteiligung des Gesamtpersonalrats",
    kind: "Dienstvereinbarung (Entwurf)",
    fileName: "2026-02-10 Entwurf Dienstvereinbarung Mobiles Arbeiten",
    org: "falkenbrueck",
    unit: "fb-amt11",
    author: "fb-schuster",
    date: "2026-02-10",
    tags: [],
    keywords: ["11.2-010.31/26", "Clearingstelle", "Kernerreichbarkeit", "drei Arbeitstage je Kalenderwoche", "Übergangsregelung vom 15.06.2022"],
    summary:
      "Vollständiger Entwurf einer Dienstvereinbarung zwischen Oberbürgermeisterin und Gesamtpersonalrat über mobiles Arbeiten mit 21 Paragrafen und drei Anlagen (Mustervereinbarung, Selbstcheck, Eignungskatalog). Gut für Zusammenfassungen, FAQ für Beschäftigte, Fassungen in Leichter Sprache und den Abgleich mit der Stellungnahme des Gesamtpersonalrats.",
    meta: [
      ["Aktenzeichen", "11.2-010.31/26"],
      ["Status", "Entwurf – Stand 10.02.2026, nicht zur Veröffentlichung"],
      ["Beteiligung", "Gesamtpersonalrat, Gleichstellungsbüro, Schwerbehindertenvertretung, Stabsstelle Datenschutz"],
    ],
    blocks: [
      { t: "note", text: "**Entwurf zur Mitbestimmung nach dem Landespersonalvertretungsgesetz (LPersVG).** Änderungen gegenüber der Übergangsregelung vom 15.06.2022 sind inhaltlich in den Erläuterungen am Ende zusammengefasst. Bitte keine Weitergabe außerhalb der beteiligten Stellen." },
      { t: "h1", text: "Dienstvereinbarung über mobiles Arbeiten in der Stadtverwaltung Falkenbrück (DV Mobiles Arbeiten)" },
      {
        t: "p",
        text: "Zwischen der **Stadt Falkenbrück**, vertreten durch die Oberbürgermeisterin, und dem **Gesamtpersonalrat der Stadt Falkenbrück**, vertreten durch seine Vorsitzende, wird auf der Grundlage des LPersVG die folgende Dienstvereinbarung geschlossen.",
      },
      { t: "h2", text: "Präambel" },
      {
        t: "p",
        text: "Seit dem Frühjahr 2020 arbeiten Beschäftigte der Stadtverwaltung in großem Umfang außerhalb der Dienststätte. Was als Notlösung begann, hat sich bewährt: Nach der Beschäftigtenbefragung vom Oktober 2025 (2.184 Teilnehmende, Rücklauf 51 Prozent) wünschen sich 78 Prozent der Befragten, auch künftig regelmäßig mobil arbeiten zu können. Zum Stichtag 31.12.2025 bestanden 1.640 Einzelvereinbarungen nach der Übergangsregelung vom 15.06.2022.",
      },
      {
        t: "p",
        text: "Die Vertragsparteien wollen mit dieser Dienstvereinbarung einen verlässlichen und für alle Beschäftigten gleichen Rahmen schaffen. Mobiles Arbeiten soll die Vereinbarkeit von Beruf, Familie, Pflege und Ehrenamt verbessern, die Stadt als Arbeitgeberin attraktiv halten, Pendelwege und damit Emissionen verringern und eine wirtschaftliche Nutzung der Büroflächen ermöglichen. Zugleich bleibt die Stadtverwaltung für Bürgerinnen und Bürger, Unternehmen und Gremien in gewohnter Qualität erreichbar. Mobiles Arbeiten ist eine Form der Arbeitsorganisation; es ändert nichts an Aufgaben, Rechten und Pflichten aus dem Arbeits- oder Dienstverhältnis.",
      },
      { t: "h2", text: "§ 1 Geltungsbereich" },
      {
        t: "ol",
        items: [
          "Diese Dienstvereinbarung gilt für alle Beschäftigten der Kernverwaltung der Stadt Falkenbrück, also für Tarifbeschäftigte nach dem TVöD sowie für Beamtinnen und Beamte.",
          "Sie gilt nicht für den Einsatzdienst der Berufsfeuerwehr (Amt 37) und nicht für Beschäftigte, deren Tätigkeit ausschließlich an einen festen Ort gebunden ist (zum Beispiel Hausmeisterdienste, Kassenaufsicht, Außendienst des Kommunalen Ordnungsdienstes). Für die Verwaltungsbereiche dieser Ämter gilt sie uneingeschränkt.",
          "Für Auszubildende, Anwärterinnen und Anwärter sowie Praktikantinnen und Praktikanten gelten die besonderen Regelungen in § 4 Absatz 4.",
          "Die Dienstvereinbarung über alternierende Telearbeit vom 01.03.2014 bleibt bis zum 31.12.2026 unberührt. Bestehende Telearbeitsplätze werden bis dahin in diese Dienstvereinbarung überführt, soweit die Beschäftigten nicht ausdrücklich an der Telearbeit festhalten wollen.",
        ],
      },
      { t: "h2", text: "§ 2 Begriffsbestimmungen" },
      {
        t: "ul",
        items: [
          "**Mobiles Arbeiten** ist die Erbringung der Arbeitsleistung außerhalb der Dienststätte unter Nutzung der von der Stadt bereitgestellten Informations- und Kommunikationstechnik, insbesondere in der eigenen Wohnung. Mobiles Arbeiten ist kein Telearbeitsplatz im Sinne von § 2 Absatz 7 der Arbeitsstättenverordnung.",
          "**Alternierende Telearbeit** ist die Arbeit an einem von der Stadt fest eingerichteten Bildschirmarbeitsplatz im Privatbereich nach der Dienstvereinbarung vom 01.03.2014.",
          "**Dienststätte** ist der Arbeitsplatz in einem Dienstgebäude der Stadt Falkenbrück, an dem die oder der Beschäftigte regelmäßig eingesetzt ist.",
          "**Präsenztag** ist ein Arbeitstag, an dem die oder der Beschäftigte in der Dienststätte arbeitet.",
          "**Team** ist die kleinste Organisationseinheit, in der Aufgaben gemeinsam wahrgenommen werden (in der Regel Sachgebiet oder Abteilung).",
          "**Führungskraft** ist die oder der unmittelbare Vorgesetzte, die oder der über den Antrag auf mobiles Arbeiten entscheidet.",
        ],
      },
      { t: "h2", text: "§ 3 Grundsätze" },
      {
        t: "ol",
        items: [
          "Mobiles Arbeiten ist freiwillig. Niemand kann zum mobilen Arbeiten verpflichtet werden. Ein Rechtsanspruch auf mobiles Arbeiten besteht nicht; die Beschäftigten haben aber einen Anspruch auf eine ermessensfehlerfreie und begründete Entscheidung über ihren Antrag.",
          "Mobil arbeitende Beschäftigte dürfen gegenüber Beschäftigten, die ausschließlich in der Dienststätte arbeiten, weder bevorzugt noch benachteiligt werden. Dies gilt insbesondere für Beurteilungen, Beförderungen, Höhergruppierungen, Fortbildungen und die Übertragung von Aufgaben.",
          "Die Aufgabenerledigung, die Erreichbarkeit für Bürgerinnen und Bürger sowie die Zusammenarbeit im Team haben Vorrang vor dem Wunsch nach mobilem Arbeiten. Gleichwohl prüfen Führungskräfte vorrangig, ob sich die Arbeitsorganisation so gestalten lässt, dass mobiles Arbeiten möglich wird.",
          "Für das mobile Arbeiten gelten alle arbeits-, dienst- und tarifrechtlichen Vorschriften, insbesondere die Vorschriften über Arbeitszeit, Arbeitsschutz, Datenschutz und Informationssicherheit sowie die Dienstanweisungen der Stadt, soweit diese Dienstvereinbarung nichts Abweichendes regelt.",
        ],
      },
      { t: "h2", text: "§ 4 Voraussetzungen" },
      {
        t: "ol",
        items: [
          "Mobiles Arbeiten setzt voraus, dass die Tätigkeit ganz oder teilweise dafür geeignet ist. Als Orientierung dient der Eignungskatalog in Anlage 3. Die Eignung ist für den einzelnen Arbeitsplatz zu beurteilen, nicht pauschal für ein Amt oder eine Entgeltgruppe.",
          "Die oder der Beschäftigte muss die Aufgaben selbstständig und ohne ständige Rückfragen erledigen können und an dem gewählten Ort ungestört, vertraulich und unter Beachtung des Arbeitsschutzes arbeiten können. Dies wird durch den Selbstcheck nach Anlage 2 bestätigt.",
          "Neu eingestellte Beschäftigte können nach Ablauf von drei Monaten mobil arbeiten. Die Führungskraft kann im Einvernehmen mit der oder dem Beschäftigten einen früheren Beginn vereinbaren, wenn die Einarbeitung dies zulässt.",
          "Auszubildende, Anwärterinnen und Anwärter können im zweiten und dritten Ausbildungsjahr an höchstens einem Tag je Woche mobil arbeiten, sofern die Ausbildungsleitung zustimmt und eine Ausbilderin oder ein Ausbilder an diesem Tag erreichbar ist. Im ersten Ausbildungsjahr ist mobiles Arbeiten ausgeschlossen, ausgenommen Lernzeiten für Online-Lehrgänge.",
          "Die Teilnahme an der Unterweisung „Gesund und sicher mobil arbeiten“ (E-Learning, rund 45 Minuten) ist vor Beginn nachzuweisen.",
        ],
      },
      { t: "h2", text: "§ 5 Umfang und Verteilung" },
      {
        t: "ol",
        items: [
          "Mobiles Arbeiten ist bei Vollzeitbeschäftigten an bis zu **drei Arbeitstage je Kalenderwoche** möglich. Bei Teilzeitbeschäftigten darf der Anteil des mobilen Arbeitens 60 Prozent der individuellen regelmäßigen wöchentlichen Arbeitszeit nicht überschreiten.",
          "Die Verteilung kann im Monatsdurchschnitt erfolgen, wenn dies im Team abgestimmt ist. Ein Ansparen von Tagen über den Kalendermonat hinaus ist nicht zulässig.",
          "Jedes Team legt mindestens einen gemeinsamen Präsenztag je Woche fest (Teamtag). Die Führungskraft kann aus dienstlichen Gründen weitere Präsenztage festlegen, insbesondere für Besprechungen, Gremiensitzungen, Ortstermine und Einarbeitungen.",
          "In Bereichen mit Publikumsverkehr (insbesondere Bürgeramt, Standesamt, Stadtkasse, Fundbüro) hat der Dienstplan Vorrang. Mobiles Arbeiten ist dort nur außerhalb der Schalter- und Beratungsdienste möglich.",
          "Mobiles Arbeiten im Ausland ist nur innerhalb der Europäischen Union und nur bis zu zehn Arbeitstage im Kalenderjahr zulässig. Es bedarf der vorherigen Genehmigung durch Amt 11, das die steuer-, sozialversicherungs- und datenschutzrechtlichen Voraussetzungen prüft.",
        ],
      },
      { t: "h2", text: "§ 6 Antrag, Entscheidung und Einzelvereinbarung" },
      {
        t: "ol",
        items: [
          "Mobiles Arbeiten wird über das Formular im Mitarbeitendenportal beantragt. Im Antrag gibt die oder der Beschäftigte den gewünschten Umfang, die bevorzugten Wochentage und den Selbstcheck nach Anlage 2 an.",
          "Die Führungskraft entscheidet innerhalb von vier Wochen nach Eingang des vollständigen Antrags. Wird der Antrag ganz oder teilweise abgelehnt, ist dies schriftlich zu begründen. Die Begründung muss erkennen lassen, welche dienstlichen Gründe entgegenstehen und ob eine spätere Bewilligung in Betracht kommt.",
          "Gegen eine Ablehnung kann die oder der Beschäftigte innerhalb von zwei Wochen die nächsthöhere Führungsebene anrufen. Bleibt es bei der Ablehnung, kann die Clearingstelle nach § 18 angerufen werden.",
          "Bei Bewilligung wird eine Einzelvereinbarung nach dem Muster in Anlage 1 geschlossen. Sie gilt für höchstens zwei Jahre und kann verlängert werden.",
          "Amt 11 unterrichtet den Gesamtpersonalrat quartalsweise über die Zahl der Anträge, Bewilligungen, Ablehnungen und Beendigungen, jeweils nach Ämtern und nach Geschlecht aufgeschlüsselt.",
        ],
      },
      { t: "h2", text: "§ 7 Arbeitszeit und Erreichbarkeit" },
      {
        t: "ol",
        items: [
          "Für das mobile Arbeiten gelten die Dienstvereinbarung über die gleitende Arbeitszeit und der dort festgelegte Rahmen von 6:00 bis 20:00 Uhr. Arbeit an Sonn- und Feiertagen ist nur nach ausdrücklicher Anordnung zulässig.",
          "Die Arbeitszeit wird über das Web-Terminal des Zeiterfassungssystems erfasst. Die Vorschriften des Arbeitszeitgesetzes, insbesondere die Ruhezeit von mindestens elf Stunden und die Pausenregelungen, sind einzuhalten.",
          "Während der **Kernerreichbarkeit** von Montag bis Donnerstag 9:00 bis 12:00 Uhr und 13:30 bis 15:00 Uhr sowie freitags 9:00 bis 12:00 Uhr sind mobil arbeitende Beschäftigte telefonisch und über die dienstlichen Kommunikationswege erreichbar. Für Teilzeitbeschäftigte wird die Kernerreichbarkeit in der Einzelvereinbarung entsprechend ihrer Arbeitszeitverteilung festgelegt.",
          "Außerhalb der vereinbarten Arbeitszeit besteht keine Pflicht, dienstliche Anrufe, Nachrichten oder E-Mails zu beantworten. Führungskräfte achten darauf, dass Nachrichten außerhalb der Arbeitszeit nur in dringenden Fällen versendet werden.",
          "Mehrarbeit und Überstunden entstehen beim mobilen Arbeiten nur, wenn sie angeordnet oder nachträglich genehmigt worden sind.",
          "Wege zwischen dem Ort des mobilen Arbeitens und der Dienststätte sind keine Arbeitszeit. Wird eine Beschäftigte oder ein Beschäftigter während des mobilen Arbeitstages aus dienstlichen Gründen kurzfristig in die Dienststätte gerufen, gilt die Wegezeit als Arbeitszeit.",
        ],
      },
      { t: "h2", text: "§ 8 Arbeitsmittel" },
      {
        t: "ol",
        items: [
          "Die Stadt stellt für das mobile Arbeiten ein dienstliches Notebook mit Zugang zum städtischen Netz über eine verschlüsselte Verbindung, ein Headset und auf Antrag einen zweiten Bildschirm mit Tastatur und Maus zur Verfügung. Diensthandys werden nach den Funktionsvorgaben der Dienstanweisung Mobilfunk ausgegeben.",
          "Telefonate werden über die Softphone-Funktion der Telefonanlage geführt. Die Nutzung privater Endgeräte für dienstliche Zwecke ist nicht zulässig; ausgenommen ist die Nutzung des privaten Internetanschlusses.",
          "Dienstliche Ausdrucke werden grundsätzlich in der Dienststätte erstellt. Die Beschaffung von Druckern für den häuslichen Arbeitsplatz ist ausgeschlossen.",
          "Die Arbeitsmittel bleiben Eigentum der Stadt, sind pfleglich zu behandeln und dürfen Dritten, auch Haushaltsangehörigen, nicht zugänglich gemacht werden. Störungen sind dem IT-Servicedesk von Amt 12 (Telefon 069 90009-129) zu melden.",
        ],
      },
      { t: "h2", text: "§ 9 Datenschutz und Informationssicherheit" },
      {
        t: "ol",
        items: [
          "Beim mobilen Arbeiten gelten die Datenschutz-Grundverordnung, das Landesdatenschutzgesetz (LDSG) und die Informationssicherheitsleitlinie der Stadt Falkenbrück. Die Beschäftigten stellen sicher, dass Unbefugte keine Kenntnis von dienstlichen Informationen erlangen können.",
          "Der Zugriff auf das städtische Netz erfolgt ausschließlich über die verschlüsselte Verbindung mit Zwei-Faktor-Anmeldung. Beim Verlassen des Arbeitsplatzes ist der Bildschirm zu sperren.",
          "Papierakten mit besonders schutzwürdigen Daten (insbesondere Gesundheitsdaten, Sozialdaten, Personalakten, Daten aus Personenstands- und Melderegistern) dürfen nur mit Zustimmung der Führungskraft außerhalb der Dienststätte bearbeitet werden. Sie sind in verschließbaren Taschen zu transportieren und in der Wohnung verschlossen aufzubewahren.",
          "Dienstliche Unterlagen dürfen nicht im Hausmüll entsorgt werden; sie werden in der Dienststätte über die Datenschutzbehälter vernichtet.",
          "An öffentlichen Orten (zum Beispiel in Zügen) ist ein Blickschutzfilter zu verwenden. Gespräche über personenbezogene Daten finden dort nicht statt.",
          "Sicherheitsvorfälle, insbesondere der Verlust von Geräten, der Verdacht auf Schadsoftware oder die Eingabe von Zugangsdaten auf einer verdächtigen Seite, sind unverzüglich dem IT-Servicedesk und dem Informationssicherheitsbeauftragten zu melden. Die Meldung hat keine nachteiligen Folgen für die meldende Person.",
        ],
      },
      { t: "h2", text: "§ 10 Arbeits- und Gesundheitsschutz" },
      {
        t: "ol",
        items: [
          "Die Stadt erfüllt ihre Pflichten aus dem Arbeitsschutzgesetz auch beim mobilen Arbeiten. Grundlage ist die Gefährdungsbeurteilung für mobiles Arbeiten, die Amt 11 gemeinsam mit der Fachkraft für Arbeitssicherheit und dem Betriebsärztlichen Dienst erstellt und alle zwei Jahre überprüft.",
          "Die Beschäftigten gestalten ihren mobilen Arbeitsplatz nach den Hinweisen der Unterweisung und des Selbstchecks (Anlage 2). Sie können sich vom Betriebsärztlichen Dienst und der Fachkraft für Arbeitssicherheit beraten lassen.",
          "Ein Zutrittsrecht der Stadt zur Wohnung besteht nicht. Eine Begehung findet nur auf Wunsch der oder des Beschäftigten statt.",
          "Führungskräfte achten auf Anzeichen von Überlastung und Vereinsamung und sprechen diese im Mitarbeitendengespräch an.",
        ],
      },
      { t: "h2", text: "§ 11 Unfallversicherung und Haftung" },
      {
        t: "ol",
        items: [
          "Tarifbeschäftigte sind beim mobilen Arbeiten nach § 8 Absatz 1 Satz 3 SGB VII in gleichem Umfang gesetzlich unfallversichert wie bei der Tätigkeit in der Dienststätte. Für Beamtinnen und Beamte gelten die Vorschriften über die Dienstunfallfürsorge.",
          "Für Schäden an den Arbeitsmitteln haften die Beschäftigten nur bei Vorsatz und grober Fahrlässigkeit. Für Schäden, die Haushaltsangehörige oder Besuch fahrlässig an den Arbeitsmitteln verursachen, haften die Beschäftigten nicht.",
        ],
      },
      { t: "h2", text: "§ 12 Kosten" },
      {
        t: "ol",
        items: [
          "Aufwendungen für Strom, Heizung, Internetanschluss und Möbel werden nicht erstattet. Auf die Möglichkeit, die Tagespauschale für das häusliche Arbeiten in der Einkommensteuererklärung geltend zu machen, wird hingewiesen.",
          "Die Stadt prüft bis zum 31.12.2026, ob und in welcher Höhe eine Pauschale für die Ausstattung des mobilen Arbeitsplatzes gezahlt werden kann. Das Ergebnis wird mit dem Gesamtpersonalrat erörtert.",
          "Fahrtkosten zwischen Wohnung und Dienststätte werden auch an Präsenztagen nicht erstattet. Die Regelungen zum Jobticket bleiben unberührt.",
        ],
      },
      { t: "h2", text: "§ 13 Führung und Zusammenarbeit" },
      {
        t: "ol",
        items: [
          "Jedes Team trifft eine schriftliche Teamabsprache zu Teamtag, Vertretung, Erreichbarkeit, Ablage und Besprechungskultur. Die Teamabsprache wird mindestens einmal jährlich überprüft.",
          "Führungskräfte führen mit klaren Zielen und regelmäßigen Rückmeldungen. Sie stellen sicher, dass alle Teammitglieder gleichermaßen informiert und eingebunden sind, unabhängig davon, wo sie arbeiten.",
          "Führungskräfte können selbst mobil arbeiten; § 5 gilt entsprechend. Sie sorgen dafür, dass ihre Vertretung und Erreichbarkeit geregelt sind.",
          "Das Personal- und Organisationsamt bietet Fortbildungen zum Führen auf Distanz und zur Zusammenarbeit in gemischten Teams an.",
        ],
      },
      { t: "h2", text: "§ 14 Ausschluss von Leistungs- und Verhaltenskontrollen" },
      {
        t: "ol",
        items: [
          "Daten, die beim mobilen Arbeiten technisch anfallen (insbesondere Anmeldedaten der verschlüsselten Verbindung, Protokolldaten der Telefonanlage, Anwesenheitsanzeigen in der Kollaborationssoftware), werden nicht zur Leistungs- oder Verhaltenskontrolle verwendet.",
          "Eine Auswertung ist nur zur Störungsbeseitigung, zur Abwehr von Angriffen auf die Informationssicherheit oder bei einem dokumentierten Verdacht auf eine schwerwiegende Pflichtverletzung zulässig. Im letztgenannten Fall sind der Gesamtpersonalrat und die Datenschutzbeauftragte vorher zu beteiligen.",
          "Erkenntnisse, die unter Verstoß gegen diese Vorschrift gewonnen wurden, dürfen nicht für personelle Maßnahmen verwendet werden.",
        ],
      },
      { t: "h2", text: "§ 15 Beendigung und Unterbrechung" },
      {
        t: "ol",
        items: [
          "Die oder der Beschäftigte kann die Einzelvereinbarung jederzeit mit einer Frist von zwei Wochen beenden.",
          "Die Stadt kann die Einzelvereinbarung aus dienstlichen Gründen mit einer Frist von vier Wochen beenden; die Gründe sind schriftlich mitzuteilen. Bei schwerwiegenden Verstößen gegen § 9 ist eine Beendigung ohne Frist möglich.",
          "Die Führungskraft kann bei unvorhersehbarem dienstlichem Bedarf die Arbeit in der Dienststätte für einzelne Tage anordnen. Die Anordnung soll spätestens am Vortag bis 15:00 Uhr erfolgen.",
          "Bei einem Wechsel des Arbeitsplatzes endet die Einzelvereinbarung; ein neuer Antrag ist möglich.",
        ],
      },
      { t: "h2", text: "§ 16 Gleichstellung, Vereinbarkeit und Teilhabe" },
      {
        t: "ol",
        items: [
          "Können nicht alle Anträge in einem Team im gewünschten Umfang bewilligt werden, sind Beschäftigte mit Betreuungs- oder Pflegeaufgaben sowie schwerbehinderte und gleichgestellte Beschäftigte vorrangig zu berücksichtigen.",
          "In begründeten Härtefällen, insbesondere bei schwerer Erkrankung, Schwerbehinderung oder akuter Pflegesituation, kann der Umfang nach § 5 Absatz 1 befristet überschritten werden. Hierüber entscheidet Amt 11 nach Beteiligung der Schwerbehindertenvertretung beziehungsweise des Gleichstellungsbüros.",
          "Mobiles Arbeiten darf nicht dazu führen, dass Teilzeitbeschäftigte von Besprechungen, Informationen oder Fortbildungen ausgeschlossen werden. Teamtage und regelmäßige Besprechungen sollen in der Kernerreichbarkeit liegen.",
          "Das Gleichstellungsbüro und die Schwerbehindertenvertretung erhalten die Auswertungen nach § 6 Absatz 5.",
        ],
      },
      { t: "h2", text: "§ 17 Qualifizierung" },
      {
        t: "p",
        text: "Die Stadt bietet Schulungen zur Nutzung der Kollaborations- und Videokonferenzsoftware, zur Informationssicherheit, zur Selbstorganisation und zum gesunden Arbeiten an. Die Teilnahme ist Arbeitszeit. Für Führungskräfte ist die Fortbildung „Führen auf Distanz“ innerhalb eines Jahres nach Inkrafttreten verpflichtend.",
      },
      { t: "h2", text: "§ 18 Clearingstelle" },
      {
        t: "ol",
        items: [
          "Zur Klärung von Streitfällen aus dieser Dienstvereinbarung wird eine **Clearingstelle** eingerichtet. Ihr gehören je zwei Vertreterinnen oder Vertreter der Dienststelle und des Gesamtpersonalrats an. Die Gleichstellungsbeauftragte und die Schwerbehindertenvertretung können beratend teilnehmen.",
          "Die Clearingstelle wird auf Antrag der oder des Beschäftigten, der Führungskraft oder des Gesamtpersonalrats tätig. Sie gibt innerhalb von vier Wochen eine Empfehlung ab, über die die Oberbürgermeisterin entscheidet.",
          "Die Beteiligungsrechte des Personalrats nach dem LPersVG bleiben unberührt.",
        ],
      },
      { t: "h2", text: "§ 19 Evaluation" },
      {
        t: "p",
        text: "Die Vertragsparteien werten die Dienstvereinbarung 18 Monate nach Inkrafttreten gemeinsam aus. Grundlage sind die Quartalsauswertungen nach § 6 Absatz 5, eine Befragung der Beschäftigten und der Führungskräfte sowie die Erfahrungen der Clearingstelle. Der Bericht wird dem Verwaltungsvorstand und dem Gesamtpersonalrat vorgelegt.",
      },
      { t: "h2", text: "§ 20 Übergangsregelungen" },
      {
        t: "p",
        text: "Einzelvereinbarungen nach der Übergangsregelung vom 15.06.2022 gelten bis zum 30.09.2026 fort. Beschäftigte, die über diesen Zeitpunkt hinaus mobil arbeiten wollen, stellen bis zum 31.07.2026 einen Antrag nach § 6.",
      },
      { t: "h2", text: "§ 21 Inkrafttreten und Kündigung" },
      {
        t: "ol",
        items: [
          "Diese Dienstvereinbarung tritt am 01.05.2026 in Kraft. Gleichzeitig tritt die Übergangsregelung vom 15.06.2022 außer Kraft, soweit § 20 nichts anderes bestimmt.",
          "Die Dienstvereinbarung kann von jeder Vertragspartei mit einer Frist von sechs Monaten zum Ende eines Kalenderjahres gekündigt werden. Bis zum Abschluss einer neuen Dienstvereinbarung gilt sie weiter.",
          "Sollte eine Bestimmung dieser Dienstvereinbarung unwirksam sein, bleiben die übrigen Bestimmungen wirksam. Die Vertragsparteien verpflichten sich, die unwirksame Bestimmung durch eine Regelung zu ersetzen, die ihrem Zweck möglichst nahekommt.",
        ],
      },
      { t: "p", text: "Falkenbrück, den __________ 2026" },
      { t: "signature", lines: ["Dr. Henrike Laßberg", "Oberbürgermeisterin", "", "Sandra Wiesner", "Vorsitzende des Gesamtpersonalrats"] },
      { t: "pagebreak" },
      { t: "h1", text: "Anlage 1 – Muster einer Einzelvereinbarung über mobiles Arbeiten" },
      {
        t: "table",
        header: ["Angabe", "Eintrag"],
        rows: [
          ["Name, Vorname, Personalnummer", ""],
          ["Amt, Sachgebiet", ""],
          ["Regelmäßige wöchentliche Arbeitszeit", "____ Stunden"],
          ["Umfang des mobilen Arbeitens", "bis zu ____ Tage je Woche / ____ Prozent der Arbeitszeit"],
          ["Bevorzugte Wochentage", ""],
          ["Teamtag (Präsenzpflicht)", ""],
          ["Kernerreichbarkeit (bei Teilzeit)", ""],
          ["Ausgegebene Arbeitsmittel", "Notebook, Headset, ggf. Bildschirm, Tastatur, Maus"],
          ["Unterweisung „Gesund und sicher mobil arbeiten“ abgeschlossen am", ""],
          ["Selbstcheck nach Anlage 2 abgegeben am", ""],
          ["Laufzeit", "vom ________ bis ________ (höchstens zwei Jahre)"],
        ],
        widths: [3, 4],
      },
      {
        t: "p",
        text: "Die Beschäftigte oder der Beschäftigte bestätigt, die Dienstvereinbarung Mobiles Arbeiten, die Informationssicherheitsleitlinie und die Hinweise zum Arbeitsschutz zur Kenntnis genommen zu haben.",
      },
      { t: "signature", lines: ["Ort, Datum, Unterschrift der oder des Beschäftigten", "", "Ort, Datum, Unterschrift der Führungskraft"] },
      { t: "h1", text: "Anlage 2 – Selbstcheck mobiler Arbeitsplatz" },
      { t: "p", text: "Bitte kreuzen Sie im Formular des Mitarbeitendenportals an, ob die folgenden Punkte an Ihrem überwiegenden Ort des mobilen Arbeitens erfüllt sind." },
      {
        t: "ul",
        items: [
          "Ich kann an einem Tisch mit ausreichender Arbeitsfläche arbeiten und einen Stuhl nutzen, der längeres Sitzen erlaubt.",
          "Bildschirm und Tastatur lassen sich so aufstellen, dass ich ohne Blendung und mit geradem Rücken arbeiten kann.",
          "Der Raum ist ausreichend beleuchtet und belüftbar.",
          "Ich kann Telefonate und Videokonferenzen führen, ohne dass Dritte mithören.",
          "Dienstliche Unterlagen und Geräte kann ich verschlossen aufbewahren.",
          "Der Internetanschluss reicht für Videokonferenzen aus (mindestens 16 Mbit/s im Download).",
          "Elektrische Anschlüsse und Verlängerungen sind in einwandfreiem Zustand; es gibt keine Stolperstellen.",
          "Ich kenne die Ansprechpersonen bei technischen Störungen und Sicherheitsvorfällen.",
        ],
      },
      { t: "h1", text: "Anlage 3 – Eignungskatalog (Orientierung)" },
      {
        t: "table",
        header: ["Tätigkeit", "Eignung", "Hinweise"],
        rows: [
          ["Sachbearbeitung mit elektronischer Akte", "gut geeignet", "Zugriff auf Fachverfahren über verschlüsselte Verbindung"],
          ["Konzept-, Planungs- und Grundsatzarbeit", "gut geeignet", "Abstimmungstermine bevorzugt an Teamtagen"],
          ["Haushalts- und Rechnungswesen, Controlling", "gut geeignet", "Zahlungsfreigaben nach Vier-Augen-Prinzip im Verfahren"],
          ["Sachbearbeitung mit Papierakten", "eingeschränkt geeignet", "nur ohne besonders schutzwürdige Daten (§ 9 Abs. 3)"],
          ["Beratung und Schalterdienst mit Publikumsverkehr", "nicht geeignet", "Ausnahme: telefonische Beratung, Rückrufe, Nachbearbeitung"],
          ["Außendienst, Kontrollen, Ortstermine", "nicht geeignet", "Vor- und Nachbereitung mobil möglich"],
          ["Kassen- und Zahlstellen, Poststelle, Scanstelle", "nicht geeignet", "–"],
          ["Führungsaufgaben", "eingeschränkt geeignet", "Präsenz an mindestens zwei Tagen je Woche empfohlen"],
        ],
        widths: [4, 2, 4],
      },
      { t: "h1", text: "Erläuterungen zum Entwurf (nicht Bestandteil der Dienstvereinbarung)" },
      {
        t: "ul",
        items: [
          "**Umfang:** Die Übergangsregelung vom 15.06.2022 erlaubte bis zu 50 Prozent der Arbeitszeit. Der Entwurf erhöht auf drei Tage beziehungsweise 60 Prozent und folgt damit dem Ergebnis der Beschäftigtenbefragung.",
          "**Teamtag:** Neu ist der verpflichtende gemeinsame Präsenztag. Er ist Voraussetzung für das Raumkonzept im Verwaltungsgebäude Am Hafen (Desk-Sharing mit einer Quote von 0,7 Arbeitsplätzen je Beschäftigten).",
          "**Clearingstelle:** Neu. Bisher wurden Streitfälle ausschließlich im Monatsgespräch mit dem Gesamtpersonalrat behandelt.",
          "**Kosten:** Eine Pauschale ist wegen der angespannten Haushaltslage (Haushaltssicherung, geplanter Fehlbetrag 2026 von 38,6 Mio. €) derzeit nicht vorgesehen; § 12 Absatz 2 sieht einen Prüfauftrag vor.",
          "**Zeitplan:** Beteiligung des Gesamtpersonalrats ab 10.02.2026, Erörterung im März, Unterzeichnung im April, Inkrafttreten am 01.05.2026.",
        ],
      },
    ],
  },
  {
    type: "word",
    id: "fb-niederschrift-hfa-2026-06-11",
    title: "Niederschrift der 18. Sitzung des Haupt- und Finanzausschusses am 11.06.2026",
    kind: "Niederschrift",
    fileName: "2026-06-11 Niederschrift HFA 18. Sitzung oeffentlicher Teil",
    org: "falkenbrueck",
    unit: "fb-amt10",
    author: "fb-celik",
    date: "2026-06-19",
    tags: ["zahlen"],
    keywords: ["M/2026/0044", "V/2026/0187", "61,3 Mio. €", "Brandschutzbedarfsplan", "Sondernutzungsgebührensatzung", "AF/2026/0029"],
    summary:
      "Niederschrift (öffentlicher Teil) mit elf Tagesordnungspunkten: Haushaltssperre 2026, Zwischenbericht Bürgeramt 2030, Brandschutzbedarfsplan, Mehrkosten Kita Kiebitzweg, Gebühren für Außengastronomie, papierlose Gremienarbeit und eine Anfrage zur Haushaltssperre. Gut für Zusammenfassungen je TOP, Beschlusslisten und Aufgabenlisten für die Ämter.",
    meta: [
      ["Aktenzeichen", "10.3-020.11/26"],
      ["Sitzung", "18. Sitzung (Wahlperiode 2024–2029)"],
      ["Status", "öffentlicher Teil"],
    ],
    blocks: [
      { t: "h1", text: "Niederschrift über die 18. Sitzung des Haupt- und Finanzausschusses" },
      {
        t: "table",
        header: ["Angabe", ""],
        rows: [
          ["Sitzungstag", "Donnerstag, 11.06.2026"],
          ["Sitzungsort", "Rathaus, Ratssaal"],
          ["Beginn", "16:00 Uhr"],
          ["Ende", "19:25 Uhr (öffentlicher Teil bis 18:52 Uhr)"],
          ["Vorsitz", "Oberbürgermeisterin Dr. Henrike Laßberg"],
          ["Schriftführung", "Emre Çelik, Amt 10"],
        ],
        widths: [2, 5],
      },
      { t: "h2", text: "Anwesend" },
      {
        t: "table",
        header: ["Fraktion", "Mitglieder"],
        rows: [
          ["Bürgerbündnis Falkenbrück", "Dr. Elif Sarı (Fraktionsvorsitzende), Jörg Oltmanns, Heike Brückner, Stefan Meisner, Karin Zander"],
          ["Soziale Liste", "Uwe Fiedler, Mira Petrović, Bernd Lüdtke, Sabine Hecht"],
          ["Ökologische Mitte", "Dr. Tobias Strauch, Lea Janßen, Nadine Schmitz, Paul Rosendahl (Vertretung für Frank Baumgart)"],
          ["Liberale Stadtgruppe", "Christoph Hollwedel, Marion Achterberg"],
        ],
        widths: [2, 5],
      },
      { t: "p", text: "**Entschuldigt:** Frank Baumgart (Ökologische Mitte)." },
      {
        t: "p",
        text: "**Von der Verwaltung:** Thomas Keßler (Dezernent I), Dr. Ewa Nowak (Stadtkämmerin, Dezernentin II), Ralf Hennig (Dezernent III), Michael Grothe (Amt 20), Annika Feldhaus (Amt 33, zu TOP 5.2), Dirk Jansen (Amt 37, zu TOP 6), Petra Lindner (Amt 51, zu TOP 7), Markus Dietrich (Amt 32, zu TOP 8), Clara Ohlendorf (Presse- und Öffentlichkeitsarbeit).",
      },
      { t: "h2", text: "Tagesordnung – öffentlicher Teil" },
      {
        t: "ol",
        items: [
          "Eröffnung, Feststellung der ordnungsgemäßen Einladung und der Beschlussfähigkeit",
          "Feststellung der Tagesordnung",
          "Genehmigung der Niederschrift über die 17. Sitzung vom 23.04.2026",
          "Einwohnerfragestunde",
          "Mitteilungen der Verwaltung: 5.1 Haushaltswirtschaftliche Sperre 2026 (M/2026/0044); 5.2 Zwischenbericht „Bürgeramt 2030“ (M/2026/0047)",
          "Fortschreibung des Brandschutzbedarfsplans 2026–2030 (V/2026/0187)",
          "Neubau der Kindertageseinrichtung Kiebitzweg – Anpassung des Kostenrahmens und überplanmäßige Auszahlung (V/2026/0203)",
          "Zweite Satzung zur Änderung der Sondernutzungsgebührensatzung (V/2026/0198)",
          "Antrag der Liberalen Stadtgruppe „Papierlose Gremienarbeit ab 2027“ (A/2026/0031)",
          "Anfrage der Fraktion Bürgerbündnis Falkenbrück zu den Auswirkungen der Haushaltssperre (AF/2026/0029)",
          "Verschiedenes",
        ],
      },
      { t: "h2", text: "TOP 1 – Eröffnung, Feststellung der ordnungsgemäßen Einladung und der Beschlussfähigkeit" },
      {
        t: "p",
        text: "Die Vorsitzende eröffnet die Sitzung um 16:00 Uhr und begrüßt die Mitglieder, die Vertreterinnen und Vertreter der Verwaltung, die Presse und die Zuhörerinnen und Zuhörer. Sie stellt fest, dass zur Sitzung form- und fristgerecht eingeladen wurde und der Ausschuss mit 15 stimmberechtigten Mitgliedern beschlussfähig ist.",
      },
      { t: "h2", text: "TOP 2 – Feststellung der Tagesordnung" },
      {
        t: "p",
        text: "Herr Hollwedel beantragt für die Liberale Stadtgruppe, TOP 8 abzusetzen, da die Interessengemeinschaft Altstadtgastronomie noch nicht angehört worden sei. Herr Dietrich weist darauf hin, dass die Interessengemeinschaft mit Schreiben vom 12.05.2026 beteiligt wurde und eine Stellungnahme vorliegt. Der Antrag auf Absetzung wird mit 2 Ja-Stimmen, 12 Nein-Stimmen und 1 Enthaltung abgelehnt. Die Tagesordnung wird im Übrigen unverändert festgestellt.",
      },
      { t: "h2", text: "TOP 3 – Genehmigung der Niederschrift über die 17. Sitzung vom 23.04.2026" },
      { t: "p", text: "Die Niederschrift wird ohne Änderungen genehmigt (13 Ja-Stimmen, 0 Nein-Stimmen, 2 Enthaltungen wegen Abwesenheit in der Sitzung)." },
      { t: "h2", text: "TOP 4 – Einwohnerfragestunde" },
      {
        t: "p",
        text: "Ein Einwohner aus dem Hafenviertel fragt, warum er für die Verlängerung seines Personalausweises im April noch neun Werktage auf einen Termin habe warten müssen, obwohl die Presse von einer deutlichen Verbesserung berichtet habe. Frau Feldhaus antwortet, dass die Wartezeit im April bei durchschnittlich acht Werktagen lag; einzelne Standorte und Tageszeiten seien stärker nachgefragt. Für Abholungen stehe inzwischen der Express-Schalter ohne Termin zur Verfügung. Weitere Fragen werden nicht gestellt.",
      },
      { t: "h2", text: "TOP 5 – Mitteilungen der Verwaltung" },
      { t: "h3", text: "5.1 Haushaltswirtschaftliche Sperre 2026 (M/2026/0044)" },
      {
        t: "p",
        text: "Frau Dr. Nowak berichtet, dass sie mit Verfügung vom 02.06.2026 eine haushaltswirtschaftliche Sperre nach der Gemeindehaushaltsverordnung (GemHVO) erlassen hat. Anlass ist eine deutliche Verschlechterung der Haushaltslage gegenüber der Planung:",
      },
      {
        t: "table",
        header: ["Position", "Veränderung gegenüber Plan 2026"],
        rows: [
          ["Gewerbesteuer (Ansatz 204,0 Mio. €, Prognose 186,8 Mio. €)", "– 17,2 Mio. €"],
          ["Hilfen zur Erziehung, stationär (Teilhaushalt 51)", "– 3,1 Mio. €"],
          ["Tarifabschluss über der Planungsannahme", "– 2,4 Mio. €"],
          ["Summe der Verschlechterung", "– 22,7 Mio. €"],
          ["Geplanter Fehlbetrag 2026", "38,6 Mio. €"],
          ["Prognostizierter Fehlbetrag 2026 ohne Gegensteuerung", "61,3 Mio. €"],
        ],
        widths: [5, 2],
      },
      {
        t: "p",
        text: "Der Gewerbesteuerrückgang beruht im Wesentlichen auf Erstattungen nach Betriebsprüfungen bei zwei Unternehmen im Hafenviertel sowie auf Anträgen auf Herabsetzung der Vorauszahlungen. Die Sperre umfasst 20 Prozent der noch nicht gebundenen Ansätze für Sach- und Dienstleistungen (rund 9,8 Mio. €) sowie eine Wiederbesetzungssperre von sechs Monaten für frei werdende Stellen. Ausgenommen sind der Einsatzdienst der Feuerwehr, die Kindertageseinrichtungen, der Allgemeine Soziale Dienst und die Schalterdienste des Bürgeramts. Neue Investitionen werden nur begonnen, wenn sie rechtlich oder vertraglich gebunden oder gefördert sind. Die Kämmerei erwartet eine Entlastung von rund 14 Mio. €.",
      },
      {
        t: "p",
        text: "Frau Dr. Sarı fragt, warum die Sperre erst im Juni erlassen wurde, obwohl die Gewerbesteuerentwicklung bereits im März absehbar gewesen sei. Frau Dr. Nowak erläutert, dass die Erstattungsbescheide des Finanzamts erst Ende Mai vorlagen. Herr Fiedler kritisiert die Wiederbesetzungssperre, die vor allem die ohnehin belasteten Fachämter treffe. Frau Dr. Nowak verweist auf die Möglichkeit von Ausnahmen, über die die Kämmerei im Einzelfall binnen einer Woche entscheidet. Die Mitteilung wird zur Kenntnis genommen.",
      },
      { t: "h3", text: "5.2 Zwischenbericht „Bürgeramt 2030“ (M/2026/0047)" },
      {
        t: "p",
        text: "Frau Feldhaus berichtet über den Stand der Maßnahmen aus der Klausurtagung vom September 2025:",
      },
      {
        t: "ul",
        items: [
          "Die Wartezeit auf einen Termin ist von 21 Werktagen im Juli 2025 auf 8 Werktage im April und Mai 2026 gesunken. Zielwert bleiben höchstens 5 Werktage.",
          "Seit Einführung der Terminerinnerung per E-Mail und SMS am 01.12.2025 ist die No-Show-Quote von rund 31 Prozent auf 12 Prozent im April 2026 zurückgegangen.",
          "Am Express-Schalter (seit 12.01.2026) wurden bis Ende Mai 9.850 Dokumente ohne Termin ausgehändigt.",
          "Der KI-Assistent für Standardanfragen ist seit 02.03.2026 auf der Internetseite im Pilotbetrieb. Bis 31.05.2026 wurden 14.200 Dialoge geführt; 81 Prozent endeten ohne Weiterleitung an Mitarbeitende. Die Datenschutz-Folgenabschätzung wurde vor dem Start abgeschlossen.",
          "Zwei von 4,5 unbesetzten Stellen sind seit Februar 2026 wieder besetzt.",
        ],
      },
      {
        t: "p",
        text: "Herr Dr. Strauch fragt nach den Kosten des Pilotbetriebs. Herr Keßler antwortet, dass die Pilotphase einschließlich Einrichtung 38.500 € kostet und zu 75 Prozent aus dem Förderprogramm „Digitale Kommune“ finanziert wird. Über eine Fortführung soll nach Auswertung des Pilots im September entschieden werden. Frau Petrović bittet darum, im Abschlussbericht auch darzustellen, wie ältere Menschen und Menschen ohne Internetzugang erreicht werden. Die Mitteilung wird zur Kenntnis genommen.",
      },
      { t: "h2", text: "TOP 6 – Fortschreibung des Brandschutzbedarfsplans 2026–2030 (V/2026/0187)" },
      {
        t: "p",
        text: "Herr Jansen stellt die Fortschreibung des Brandschutzbedarfsplans nach dem Brandschutz- und Hilfeleistungsgesetz (BrSchG) vor. Schutzziel ist, dass das erste Fahrzeug mit zehn Funktionen innerhalb von acht Minuten nach Alarmierung am Einsatzort eintrifft und weitere sechs Funktionen innerhalb von 13 Minuten folgen. Der Zielerreichungsgrad soll mindestens 90 Prozent betragen. Im Jahr 2025 wurde das Schutzziel stadtweit in 84 Prozent der relevanten Einsätze erreicht, in der Weststadt nur in 71 Prozent.",
      },
      {
        t: "p",
        text: "Als zentrale Maßnahmen schlägt die Verwaltung den Neubau der Feuerwache 3 in der Weststadt (Kostenschätzung 18,4 Mio. €, Inbetriebnahme 2029), die schrittweise Schaffung von 24 zusätzlichen Stellen im Einsatzdienst und die Ersatzbeschaffung von zwei Hilfeleistungslöschfahrzeugen und einer Drehleiter vor.",
      },
      {
        t: "p",
        text: "Frau Achterberg fragt, wie die Maßnahmen angesichts der Haushaltssperre finanziert werden sollen. Frau Dr. Nowak stellt klar, dass der Brandschutz eine pflichtige Aufgabe ist; die Mittel werden ab dem Haushalt 2027 veranschlagt, die Personalkosten wachsen bis 2030 um rund 1,9 Mio. € jährlich auf.",
      },
      { t: "p", text: "**Beschluss:** Der Haupt- und Finanzausschuss empfiehlt dem Rat, die Fortschreibung des Brandschutzbedarfsplans 2026–2030 in der Fassung der Vorlage zu beschließen." },
      { t: "p", text: "**Abstimmungsergebnis:** 14 Ja-Stimmen, 0 Nein-Stimmen, 1 Enthaltung." },
      { t: "h2", text: "TOP 7 – Neubau der Kindertageseinrichtung Kiebitzweg – Anpassung des Kostenrahmens und überplanmäßige Auszahlung (V/2026/0203)" },
      {
        t: "p",
        text: "Frau Lindner erläutert, dass der Kostenrahmen aus der Vorlage V/2025/0412 von 4,2 Mio. € auf 4,8 Mio. € angepasst werden muss. Gründe sind der gestiegene Baupreisindex sowie die zusätzlich erforderliche Hol- und Bringzone mit neun Stellplätzen. Die Befreiung von den Festsetzungen des Bebauungsplans Nr. 47 nach § 31 Absatz 2 BauGB wurde am 19.01.2026 erteilt. Mit Bescheid vom 16.03.2026 wurden aus dem Landesprogramm „Kita-Ausbau 2026“ Fördermittel in Höhe von 2.400.000 € bewilligt. Der Baubeginn verschiebt sich auf Oktober 2026; die Inbetriebnahme zum Kindergartenjahr 2027/28 ist nach Einschätzung der Verwaltung nur mit einem beschleunigten Bauablauf zu halten.",
      },
      {
        t: "p",
        text: "Für 2026 ist eine überplanmäßige Auszahlung von 430.000 € erforderlich. Die Deckung erfolgt durch die Verschiebung der Erneuerung des Rathausdachs (Amt 23) in das Jahr 2027. Herr Hollwedel kritisiert die erneute Kostensteigerung und beantragt, die Verwaltung mit einer Prüfung einer Modulbauweise zu beauftragen. Frau Lindner weist darauf hin, dass eine Umplanung den Förderbescheid gefährden würde.",
      },
      { t: "p", text: "**Beschluss:** Der Haupt- und Finanzausschuss empfiehlt dem Rat, den Kostenrahmen auf 4.800.000 € anzupassen und der überplanmäßigen Auszahlung von 430.000 € im Haushaltsjahr 2026 zuzustimmen." },
      { t: "p", text: "**Abstimmungsergebnis:** 13 Ja-Stimmen, 2 Nein-Stimmen, 0 Enthaltungen. Der Antrag von Herrn Hollwedel wurde nicht gesondert abgestimmt, da er die Vorlage nicht ändert; die Verwaltung sagt eine kurze schriftliche Einschätzung zu." },
      { t: "h2", text: "TOP 8 – Zweite Satzung zur Änderung der Sondernutzungsgebührensatzung (V/2026/0198)" },
      {
        t: "p",
        text: "Herr Dietrich erläutert die Vorlage. Die Gebühren für Außengastronomie wurden seit 2014 nicht angepasst. Vorgeschlagen wird eine Erhöhung in Zone I (Altstadt, Marktplatz, Uferpromenade) von 18 € auf 24 € je Quadratmeter und Saison und in Zone II (übriges Stadtgebiet) von 12 € auf 15 €. Die Mehrerträge werden auf rund 86.000 € jährlich geschätzt. Die Interessengemeinschaft Altstadtgastronomie lehnt die Erhöhung in ihrer Stellungnahme ab und verweist auf die gestiegenen Energie- und Personalkosten.",
      },
      {
        t: "p",
        text: "Frau Dr. Sarı beantragt für das Bürgerbündnis Falkenbrück, die Gebühr in Zone I auf 22 € festzusetzen. Frau Janßen unterstützt die Vorlage der Verwaltung und regt an, die Mehrerträge für die Gestaltung des Marktplatzes zu verwenden. Herr Dietrich weist darauf hin, dass eine Zweckbindung haushaltsrechtlich nicht möglich ist.",
      },
      { t: "p", text: "**Änderungsantrag Bürgerbündnis Falkenbrück (Zone I: 22 €):** 9 Ja-Stimmen, 6 Nein-Stimmen, 0 Enthaltungen – angenommen." },
      { t: "p", text: "**Beschluss:** Der Haupt- und Finanzausschuss empfiehlt dem Rat, die Zweite Satzung zur Änderung der Sondernutzungsgebührensatzung mit der Maßgabe zu beschließen, dass die Gebühr in Zone I 22 € je Quadratmeter und Saison beträgt." },
      { t: "p", text: "**Abstimmungsergebnis:** 10 Ja-Stimmen, 4 Nein-Stimmen, 1 Enthaltung." },
      { t: "h2", text: "TOP 9 – Antrag der Liberalen Stadtgruppe „Papierlose Gremienarbeit ab 2027“ (A/2026/0031)" },
      {
        t: "p",
        text: "Herr Hollwedel begründet den Antrag, ab der Wahlperiode 2027 Sitzungsunterlagen nur noch digital über das Ratsinformationssystem bereitzustellen. Herr Keßler teilt mit, dass die Druck- und Versandkosten für Sitzungsunterlagen derzeit rund 58.000 € jährlich betragen. Für die Ausstattung der 64 Ratsmitglieder mit Tablets wären einmalig rund 41.600 € sowie laufende Kosten für Lizenzen und Mobilfunk von etwa 9.000 € jährlich anzusetzen. Angesichts der Haushaltssperre schlägt er vor, den Antrag in einen Prüfauftrag umzuwandeln. Herr Hollwedel ist einverstanden.",
      },
      { t: "p", text: "**Beschluss:** Die Verwaltung wird beauftragt, bis zur Sitzung im November 2026 ein Konzept für eine papierlose Gremienarbeit einschließlich Kosten und Zeitplan vorzulegen." },
      { t: "p", text: "**Abstimmungsergebnis:** einstimmig." },
      { t: "h2", text: "TOP 10 – Anfrage der Fraktion Bürgerbündnis Falkenbrück zu den Auswirkungen der Haushaltssperre (AF/2026/0029)" },
      { t: "p", text: "Frau Dr. Sarı hat mit Schreiben vom 04.06.2026 folgende Fragen gestellt, die Frau Dr. Nowak mündlich beantwortet:" },
      {
        t: "ol",
        items: [
          "**Sind Zuschüsse an Vereine und Verbände von der Sperre betroffen?** Vertraglich oder durch Bescheid gebundene Zuschüsse sind nicht betroffen. Von der freiwilligen Projektförderung (Ansatz 1,2 Mio. €) sind die noch nicht bewilligten Mittel zu 20 Prozent gesperrt.",
          "**Welche Folgen hat die Sperre für die Bauunterhaltung der Schulen?** Gesperrt sind 20 Prozent der noch nicht beauftragten Mittel, das sind rund 640.000 €. Maßnahmen der Verkehrssicherung und des Brandschutzes sind ausgenommen.",
          "**Wie viele Stellen fallen unter die Wiederbesetzungssperre?** Zum 31.05.2026 waren 87 Stellen unbesetzt. Davon fallen 31 unter die Ausnahmen, 56 Stellen unterliegen der Sperre.",
        ],
      },
      {
        t: "p",
        text: "Frau Dr. Sarı bittet um eine schriftliche Aufstellung der 56 Stellen nach Ämtern. Frau Dr. Nowak sagt die Aufstellung bis zur Ratssitzung am 02.07.2026 zu.",
      },
      { t: "h2", text: "TOP 11 – Verschiedenes" },
      {
        t: "p",
        text: "Herr Hennig teilt mit, dass das Altstadtfest vom 21. bis 23.08.2026 stattfindet. Wie im Vorjahr wird ein Glasverbot per Allgemeinverfügung erlassen; die Erfahrungen aus 2025 seien positiv, die Zahl der Schnittverletzungen sei deutlich zurückgegangen. Frau Brückner regt an, die Gastronomie frühzeitig über die Regeln zur Außengastronomie während des Festes zu informieren, um Beschwerden wie im Vorjahr zu vermeiden.",
      },
      { t: "p", text: "Die Vorsitzende schließt den öffentlichen Teil der Sitzung um 18:52 Uhr. Der nichtöffentliche Teil (TOP 12 bis 14) wird gesondert protokolliert." },
      { t: "signature", lines: ["Dr. Henrike Laßberg, Vorsitzende", "", "Emre Çelik, Schriftführer"] },
    ],
  },
  {
    type: "word",
    id: "fb-dsfa-ki-assistent-buergeramt",
    title: "Datenschutz-Folgenabschätzung KI-Assistent im Bürgeramt (Pilot „Bürgeramt 2030“)",
    kind: "Datenschutz-Folgenabschätzung",
    fileName: "2026-01-22 DSFA KI-Assistent Buergeramt Pilotbetrieb",
    org: "falkenbrueck",
    unit: "fb-dsb",
    author: "fb-kuhn",
    date: "2026-01-22",
    tags: [],
    keywords: ["Art. 35 DSGVO", "Sprachwerk KI GmbH", "Restrisiko", "Art. 50 KI-VO", "DSFA-2026-03"],
    summary:
      "Datenschutz-Folgenabschätzung für den Pilotbetrieb eines KI-Assistenten auf der Internetseite des Bürgeramts: Beschreibung der Verarbeitung, Rechtsgrundlagen, Risikomatrix, Maßnahmen und Stellungnahme der Datenschutzbeauftragten mit Auflagen. Gut für Zusammenfassungen, Checklisten und den Vergleich mit dem Zwischenbericht im Haupt- und Finanzausschuss.",
    meta: [
      ["Aktenzeichen", "DSFA-2026-03"],
      ["Verantwortliche Stelle", "Amt 33 – Bürgeramt"],
      ["Status", "abgeschlossen, intern"],
    ],
    blocks: [
      { t: "h1", text: "Datenschutz-Folgenabschätzung nach Art. 35 DSGVO" },
      { t: "p", text: "**Verarbeitungstätigkeit:** KI-gestützter Auskunftsassistent für Standardanfragen zum Bürgeramt (Pilotbetrieb 02.03.2026 bis 30.06.2026)" },
      {
        t: "table",
        header: ["Rolle", "Name, Funktion"],
        rows: [
          ["Verantwortlich (fachlich)", "Annika Feldhaus, Leiterin Amt 33 – Bürgeramt"],
          ["Technische Umsetzung", "Linh Pham, Projektleiterin Onlinedienste, Amt 12"],
          ["Informationssicherheit", "Sascha Ebert, Informationssicherheitsbeauftragter"],
          ["Beratung und Stellungnahme", "Birgit Kuhn, Behördliche Datenschutzbeauftragte"],
          ["Auftragsverarbeiter", "Sprachwerk KI GmbH (Vertrag vom 18.12.2025)"],
        ],
        widths: [2, 4],
      },
      { t: "h2", text: "1. Anlass und Gegenstand" },
      {
        t: "p",
        text: "Im Rahmen des Projekts „Bürgeramt 2030“ hat der Verwaltungsvorstand am 14.10.2025 einen Pilotbetrieb für einen KI-Assistenten beschlossen. Der Assistent beantwortet auf der Internetseite der Stadt in einem Chatfenster Fragen zu Personalausweis und Reisepass, An- und Ummeldung, Führungszeugnis, Beglaubigungen und Terminbuchung. Er hat **keinen Zugriff** auf das Fachverfahren für das Meldewesen, auf das Terminsystem oder auf andere personenbezogene Bestände der Stadt. Er greift ausschließlich auf eine Wissensbasis aus 214 von Amt 33 geprüften Texten (Leistungsbeschreibungen, Gebührenübersicht, Hinweise zu Unterlagen) zurück.",
      },
      {
        t: "p",
        text: "Kann der Assistent eine Frage nicht beantworten oder wünscht die Person eine individuelle Klärung, verweist er auf das Kontaktformular und die Servicenummer. Eine Bearbeitung von Einzelfällen durch den Assistenten findet nicht statt.",
      },
      {
        t: "p",
        text: "Eine zweite, ursprünglich geplante Funktion – automatische Antwortvorschläge für Mitarbeitende auf eingehende E-Mails im Funktionspostfach – ist **nicht Gegenstand dieses Pilotbetriebs** (siehe Abschnitt 8, Auflage 1).",
      },
      { t: "h2", text: "2. Erforderlichkeit der Datenschutz-Folgenabschätzung" },
      {
        t: "p",
        text: "Eine DSFA ist erforderlich, weil eine neue Technologie eingesetzt wird, bei der Nutzerinnen und Nutzer Freitext eingeben und dabei – auch unaufgefordert – personenbezogene Daten einschließlich besonderer Kategorien nach Art. 9 DSGVO preisgeben können. Der Einsatz von KI-Systemen zur Interaktion mit Bürgerinnen und Bürgern ist zudem in der Liste der Aufsichtsbehörde über Verarbeitungsvorgänge enthalten, für die eine DSFA durchzuführen ist.",
      },
      {
        t: "p",
        text: "Nach der KI-Verordnung handelt es sich um ein KI-System mit begrenztem Risiko. Es gelten die Transparenzpflichten nach Art. 50 KI-VO: Die Nutzerinnen und Nutzer müssen erkennen können, dass sie mit einem KI-System interagieren. Ein Hochrisiko-System im Sinne von Anhang III liegt nicht vor, da der Assistent keine Entscheidungen über den Zugang zu öffentlichen Leistungen trifft oder vorbereitet. Der KI-Leitfaden der Landesverwaltung vom November 2025 wurde ergänzend berücksichtigt.",
      },
      { t: "h2", text: "3. Systematische Beschreibung der Verarbeitung" },
      {
        t: "table",
        header: ["Vorgang", "Daten", "Betroffene", "Speicherung"],
        rows: [
          ["Chat-Dialog", "Eingaben im Freitext, Antworten des Assistenten, Zeitstempel, Sitzungskennung", "Nutzerinnen und Nutzer der Internetseite", "Dialoginhalt 30 Tage, danach Löschung"],
          ["Technische Protokollierung", "gekürzte IP-Adresse, Browserkennung, Fehlermeldungen", "dto.", "7 Tage"],
          ["Qualitätssicherung", "stichprobenartig ausgewählte, vorab maskierte Dialoge", "dto.", "bis Ende des Pilotbetriebs, längstens 31.07.2026"],
          ["Bewertung", "freiwillige Bewertung (1 bis 5 Sterne) und Kommentar", "dto.", "anonymisiert, Auswertung aggregiert"],
          ["Administration", "Benutzerkennungen und Änderungsprotokoll der Wissensbasis", "Beschäftigte Amt 12 und Amt 33", "Dauer des Betriebs plus 1 Jahr"],
        ],
        widths: [2, 4, 2, 3],
      },
      {
        t: "p",
        text: "**Rechtsgrundlage:** Art. 6 Abs. 1 Buchst. e DSGVO in Verbindung mit § 3 LDSG (Erfüllung einer Aufgabe im öffentlichen Interesse: Information der Bürgerinnen und Bürger über Verwaltungsleistungen) sowie § 3 OZG. Die Nutzung ist freiwillig; Telefon, Kontaktformular und persönliche Vorsprache bleiben uneingeschränkt verfügbar.",
      },
      {
        t: "p",
        text: "**Technik und Empfänger:** Der Assistent wird von der Sprachwerk KI GmbH als Auftragsverarbeiter nach Art. 28 DSGVO betrieben. Das verwendete Sprachmodell läuft in einem Rechenzentrum des Auftragsverarbeiters in Deutschland. Eingaben werden nicht zum Training von Modellen verwendet. Unterauftragsverarbeiter sind ein Rechenzentrumsbetreiber in Deutschland und ein Dienstleister für die Schadsoftwareprüfung mit Sitz in der Europäischen Union. Eine Übermittlung in Drittländer findet nicht statt.",
      },
      { t: "h2", text: "4. Notwendigkeit und Verhältnismäßigkeit" },
      {
        t: "ul",
        items: [
          "**Zweck:** Entlastung der Servicenummer (durchschnittlich rund 1.150 Anrufe je Werktag, davon nach Stichprobe 62 Prozent einfache Auskunftsfragen) und bessere Erreichbarkeit außerhalb der Öffnungszeiten.",
          "**Datenminimierung:** Das Chatfenster enthält vor der ersten Eingabe den Hinweis, keine Namen, Geburtsdaten, Ausweisnummern oder Gesundheitsangaben einzugeben. Eine vorgeschaltete Erkennung maskiert Muster wie Ausweis- und Steuer-Identifikationsnummern, Geburtsdaten, Telefonnummern und E-Mail-Adressen, bevor ein Dialog gespeichert wird.",
          "**Speicherbegrenzung:** Dialoginhalte werden nach 30 Tagen automatisch gelöscht. Eine Verknüpfung mit Terminbuchungen oder Vorgängen findet nicht statt.",
          "**Transparenz:** Datenschutzhinweis nach Art. 13 DSGVO im Chatfenster; Kennzeichnung „Sie schreiben mit einem KI-Assistenten“ in jeder Sitzung; Hinweis, dass die Auskünfte nicht verbindlich sind.",
          "**Betroffenenrechte:** Da keine Identifizierung erfolgt, können Auskunfts- und Löschersuchen nur über die Sitzungskennung bearbeitet werden, die auf Wunsch angezeigt wird.",
        ],
      },
      { t: "h2", text: "5. Risikobewertung" },
      { t: "p", text: "Bewertet wurden Eintrittswahrscheinlichkeit und Schwere für die Rechte und Freiheiten der betroffenen Personen jeweils vor und nach Umsetzung der Maßnahmen (Skala: gering – mittel – hoch)." },
      {
        t: "table",
        header: ["Nr.", "Risiko", "vor Maßnahmen", "Maßnahmen (Auszug)", "Restrisiko"],
        rows: [
          ["R1", "Nutzerinnen und Nutzer geben sensible Daten ein (z. B. Gesundheit, Aufenthaltsstatus, Strafverfahren)", "hoch", "Hinweis vor Eingabe, automatische Maskierung, Löschung nach 30 Tagen", "mittel"],
          ["R2", "Falsche oder veraltete Auskunft führt zu Nachteilen (z. B. fehlende Unterlagen, versäumte Fristen)", "hoch", "nur geprüfte Wissensbasis, Quellenangabe je Antwort, Hinweis auf Unverbindlichkeit, monatliche Prüfung der Texte", "mittel"],
          ["R3", "Unbefugter Zugriff auf Dialoge beim Auftragsverarbeiter", "mittel", "Vertrag nach Art. 28 DSGVO, Verschlüsselung, Rollen- und Berechtigungskonzept, Protokollierung der Zugriffe", "gering"],
          ["R4", "Übermittlung in Drittländer über Unterauftragsverarbeiter", "mittel", "vertraglicher Ausschluss, Liste der Unterauftragsverarbeiter, Zustimmungsvorbehalt", "gering"],
          ["R5", "Benachteiligung von Menschen mit geringen Deutschkenntnissen oder Einschränkungen", "mittel", "Tests mit Leichter Sprache und fünf Sprachen, barrierefreies Chatfenster, alternative Kanäle", "gering"],
          ["R6", "Missbrauch des Chats (Manipulation der Antworten, massenhafte Abfragen)", "mittel", "Eingabefilter, Begrenzung der Anfragen je Sitzung, Überwachung durch Amt 12", "gering"],
          ["R7", "Leistungs- oder Verhaltenskontrolle von Beschäftigten über Auswertungen", "gering", "keine personenbezogene Auswertung von Beschäftigtendaten, Beteiligung des Personalrats", "gering"],
        ],
        widths: [1, 4, 2, 4, 2],
      },
      { t: "h2", text: "6. Technische und organisatorische Maßnahmen" },
      {
        t: "ol",
        items: [
          "Auftragsverarbeitungsvertrag mit der Sprachwerk KI GmbH einschließlich Ausschluss der Nutzung der Eingaben für Trainingszwecke und Löschkonzept.",
          "Betrieb ausschließlich in Rechenzentren in Deutschland; Transportverschlüsselung und Verschlüsselung der gespeicherten Daten.",
          "Vorgeschaltete Maskierung personenbezogener Muster; monatliche Stichprobe von 200 Dialogen zur Prüfung der Maskierungsquote.",
          "Freigabeprozess für die Wissensbasis: Änderungen nur durch zwei benannte Beschäftigte des Bürgeramts nach dem Vier-Augen-Prinzip.",
          "Notfallabschaltung durch Amt 12 innerhalb von 30 Minuten; Meldeweg für Sicherheitsvorfälle nach der Informationssicherheitsleitlinie.",
          "Schulung der beteiligten Beschäftigten zu den Grenzen des Systems und zum Umgang mit Beschwerden.",
        ],
      },
      { t: "h2", text: "7. Ergebnis der Folgenabschätzung" },
      {
        t: "p",
        text: "Nach Umsetzung der Maßnahmen verbleibt für die Risiken R1 und R2 ein mittleres, für alle übrigen Risiken ein geringes **Restrisiko**. Ein hohes Restrisiko, das eine vorherige Konsultation der Aufsichtsbehörde nach Art. 36 DSGVO erfordern würde, besteht nicht. Der Pilotbetrieb kann unter den Auflagen in Abschnitt 8 aufgenommen werden.",
      },
      { t: "h2", text: "8. Stellungnahme der Datenschutzbeauftragten" },
      {
        t: "p",
        text: "Ich wurde bei der Durchführung der Folgenabschätzung nach Art. 35 Abs. 2 DSGVO beteiligt. Gegen den Pilotbetrieb bestehen keine durchgreifenden Bedenken, wenn folgende Auflagen erfüllt werden:",
      },
      {
        t: "ol",
        items: [
          "Die Funktion „Antwortvorschläge für das E-Mail-Postfach“ wird im Pilotbetrieb **nicht** eingesetzt. Für eine spätere Einführung ist eine eigene Folgenabschätzung erforderlich, weil dabei Inhalte von Bürgeranliegen mit Namen und Anschrift verarbeitet würden.",
          "Die Löschfrist von 30 Tagen für Dialoginhalte wird technisch erzwungen und durch den Auftragsverarbeiter monatlich bestätigt.",
          "Der Transparenzhinweis nach Art. 50 KI-VO und der Datenschutzhinweis sind vor dem Start mit mir abzustimmen.",
          "Das Mitbestimmungsverfahren mit dem Personalrat ist vor dem Start abzuschließen.",
          "Die Folgenabschätzung wird nach Ende des Pilotbetriebs, spätestens bis 31.07.2026, anhand der Erfahrungen überprüft. Dabei sind die tatsächliche Maskierungsquote und die Zahl der Dialoge mit sensiblen Angaben auszuwerten.",
        ],
      },
      {
        t: "note",
        text: "**Hinweis:** Das Risiko R2 (falsche Auskünfte) ist weniger ein Datenschutz- als ein Haftungs- und Qualitätsrisiko. Ich empfehle, Rechtsamt und Bürgeramt um eine gesonderte Bewertung zu bitten.",
      },
      { t: "signature", lines: ["Birgit Kuhn", "Behördliche Datenschutzbeauftragte", "", "Zur Kenntnis und Umsetzung der Auflagen:", "Annika Feldhaus, Leiterin Bürgeramt"] },
    ],
  },
  {
    type: "word",
    id: "fb-pruefbericht-zahlstellen-2025",
    title: "Prüfbericht: Unvermutete Prüfung der Zahlstellen und Handvorschüsse 2025",
    kind: "Prüfbericht",
    fileName: "2025-03-27 Pruefbericht RPA unvermutete Pruefung Zahlstellen",
    org: "falkenbrueck",
    unit: "fb-amt14",
    author: "fb-gerlach",
    date: "2025-03-27",
    tags: ["zahlen", "widersprueche"],
    keywords: ["14.1-2025/07", "Höchstbetrag", "Vier-Augen-Prinzip", "6.851,00 €", "Handvorschuss"],
    summary:
      "Bericht des Rechnungsprüfungsamts über eine unvermutete Prüfung von sechs Zahlstellen und fünf Handvorschüssen mit sieben Feststellungen. Eingebaute Fehler: Der Text spricht von Differenzen in zwei Zahlstellen, die Tabelle zeigt drei; die Summe der gezählten Ist-Bestände ist falsch addiert.",
    meta: [
      ["Aktenzeichen", "14.1-2025/07"],
      ["Prüfungszeitraum", "11.03.2025 bis 13.03.2025"],
      ["Status", "intern – Entwurf zur Stellungnahme der Ämter"],
    ],
    recipient: ["Herrn Beigeordneten Ralf Hennig, Dezernat III", "Frau Stadtkämmerin Dr. Ewa Nowak, Dezernat II", "nachrichtlich: Amt 10, Amt 21, Amt 32, Amt 33, Amt 34, Amt 37, Amt 42"],
    subject: "Unvermutete Prüfung der Zahlstellen und Handvorschüsse – Prüfplan 2025, Nr. 7",
    blocks: [
      { t: "h2", text: "1. Prüfungsauftrag und Vorgehen" },
      {
        t: "p",
        text: "Das Rechnungsprüfungsamt hat nach der Rechnungsprüfungsordnung der Stadt Falkenbrück und dem Prüfplan 2025 (Nr. 7) vom 11. bis 13.03.2025 unvermutete Prüfungen bei Zahlstellen und Handvorschüssen durchgeführt. Von den neun eingerichteten Zahlstellen wurden sechs, von den 14 Handvorschüssen fünf in die Stichprobe einbezogen. Geprüft wurden jeweils der Kassenbestand, die Kassenbuchführung, die Einhaltung des Höchstbetrags, die Aufbewahrung von Bargeld und Schlüsseln sowie die Abrechnung der Kartenzahlungen.",
      },
      {
        t: "p",
        text: "Die Prüfungen erfolgten ohne Vorankündigung zu Beginn der Öffnungszeiten. Die Kassenbestände wurden im Beisein der jeweiligen Zahlstellenverwalterin oder des Zahlstellenverwalters gezählt und das Ergebnis gegengezeichnet.",
      },
      { t: "h2", text: "2. Ergebnis der Kassenbestandsaufnahme" },
      {
        t: "table",
        header: ["Zahlstelle", "Höchstbetrag", "Soll lt. Kassenbuch", "Ist gezählt", "Differenz"],
        rows: [
          ["Bürgerbüro Mitte (Amt 33)", "3.000,00 €", "2.846,50 €", "2.846,50 €", "0,00 €"],
          ["Bürgerbüro Nord (Amt 33)", "2.000,00 €", "1.912,40 €", "1.887,40 €", "– 25,00 €"],
          ["Standesamt (Amt 34)", "1.500,00 €", "6.851,00 €", "6.851,00 €", "0,00 €"],
          ["Fundbüro (Amt 32)", "500,00 €", "412,60 €", "437,60 €", "+ 25,00 €"],
          ["Stadtbibliothek, Ausleihe (Amt 42)", "800,00 €", "655,30 €", "655,30 €", "0,00 €"],
          ["Barkasse Stadtkasse (Amt 21)", "5.000,00 €", "4.318,75 €", "4.308,75 €", "– 10,00 €"],
          ["Summe", "12.800,00 €", "16.996,55 €", "16.968,55 €", "– 10,00 €"],
        ],
        widths: [4, 2, 2, 2, 2],
      },
      {
        t: "p",
        text: "In zwei Zahlstellen wurden Kassendifferenzen festgestellt. Die Differenzen sind betragsmäßig gering, deuten aber auf Schwächen beim täglichen Kassenabschluss hin (siehe Feststellungen F2 und F3). In der Zahlstelle des Standesamts war der Höchstbetrag um mehr als das Vierfache überschritten (Feststellung F1).",
      },
      { t: "h2", text: "3. Prüfung der Handvorschüsse" },
      {
        t: "table",
        header: ["Handvorschuss", "Betrag", "Ergebnis"],
        rows: [
          ["Amt 10, Poststelle (Porto)", "200,00 €", "ohne Beanstandung"],
          ["Amt 23, Hausmeisterdienst Rathaus", "150,00 €", "private und dienstliche Auslagen vermischt (Quittungen eines Baumarkts ohne Zuordnung)"],
          ["Amt 32, Kommunaler Ordnungsdienst", "100,00 €", "ohne Beanstandung"],
          ["Amt 33, Bürgerbüro Mitte (Wechselgeld)", "250,00 €", "ohne Beanstandung"],
          ["Amt 37, Feuerwache 1", "300,00 €", "Belege über 48,90 € fehlen; letzte Abrechnung im Oktober 2024"],
        ],
        widths: [3, 1, 4],
      },
      { t: "h2", text: "4. Feststellungen und Empfehlungen" },
      { t: "h3", text: "F1 – Überschreitung des Höchstbetrags im Standesamt (wesentlich)" },
      {
        t: "p",
        text: "Der Bestand in der Zahlstelle des Standesamts betrug am Prüfungstag 6.851,00 € bei einem festgesetzten Höchstbetrag von 1.500,00 €. Ursache sind die Bareinnahmen aus Trauungen am Freitag und Samstag, die erst am folgenden Dienstag an die Stadtkasse abgeführt werden, weil der Geldtransport nur dienstags und donnerstags erfolgt. Der Anteil der Kartenzahlungen liegt im Standesamt bei nur 38 Prozent (Bürgeramt: 71 Prozent).",
      },
      { t: "p", text: "**Empfehlung:** Abführung am ersten Werktag nach Überschreitung; Erhöhung des Höchstbetrags nur nach Prüfung der Versicherungsgrenze des Tresors; Kartenzahlung bei Trauungen außerhalb des Rathauses ermöglichen; Gebühren für Trauungen vorrangig vorab per Überweisung erheben." },
      { t: "h3", text: "F2 – Kassenabschluss ohne Vier-Augen-Prinzip im Bürgerbüro Nord (wesentlich)" },
      {
        t: "p",
        text: "Der tägliche Kassenabschluss wurde an sieben von zehn geprüften Tagen von nur einer Person durchgeführt und unterzeichnet. Der Fehlbetrag von 25,00 € konnte nicht aufgeklärt werden. Nach der Dienstanweisung für Zahlstellen ist der Abschluss durch zwei Beschäftigte vorzunehmen.",
      },
      { t: "p", text: "**Empfehlung:** Einhaltung des Vier-Augen-Prinzips; bei Personalengpässen Abschluss gemeinsam mit der Teamleitung; Fehlbetrag nach der Dienstanweisung behandeln." },
      { t: "h3", text: "F3 – Überschuss im Fundbüro (unwesentlich)" },
      {
        t: "p",
        text: "Der Überschuss von 25,00 € geht nach Angaben der Mitarbeiterin vermutlich auf eine Gebühr für die Herausgabe eines Fundrads zurück, für die keine Quittung erstellt wurde. Einzahlungen ohne Quittung sind unzulässig.",
      },
      { t: "h3", text: "F4 – Aufbewahrung von Schlüsseln und Tresorcodes (wesentlich)" },
      {
        t: "p",
        text: "Der Zahlencode des Tresors im Standesamt wurde seit 2021 nicht geändert. Schlüssel zum Kassenraum sind an vier Personen ausgegeben; ein Schlüsselverzeichnis liegt nicht vor.",
      },
      { t: "p", text: "**Empfehlung:** Änderung des Codes bei jedem Personalwechsel, mindestens jährlich; Schlüsselverzeichnis mit Empfangsbestätigung." },
      { t: "h3", text: "F5 – Abgleich der Kartenzahlungen im Bürgeramt (wesentlich)" },
      {
        t: "p",
        text: "Die Tagesabrechnungen der Kartenterminals werden in beiden Bürgerbüros nicht täglich mit den im Fachverfahren gebuchten Gebühren abgeglichen. Für Februar 2025 ergab ein nachträglicher Abgleich eine ungeklärte Differenz von 112,00 €.",
      },
      { t: "p", text: "**Empfehlung:** Täglicher Abgleich als Teil des Kassenabschlusses; Klärung der Differenz bis 30.04.2025." },
      { t: "h3", text: "F6 – Handvorschüsse Feuerwache 1 und Hausmeisterdienst (unwesentlich)" },
      {
        t: "p",
        text: "Beim Handvorschuss der Feuerwache 1 fehlen Belege über 48,90 €, die letzte Abrechnung liegt fünf Monate zurück. Beim Hausmeisterdienst Rathaus werden private und dienstliche Einkäufe auf einem Beleg abgerechnet.",
      },
      { t: "p", text: "**Empfehlung:** Abrechnung mindestens vierteljährlich; private Einkäufe getrennt bezahlen." },
      { t: "h3", text: "F7 – Veraltete Dienstanweisung für Zahlstellen (wesentlich)" },
      {
        t: "p",
        text: "Die Dienstanweisung für Zahlstellen und Handvorschüsse stammt aus dem Jahr 2016. Sie enthält keine Regelungen zu Kartenzahlungen, zu mobilen Kartenterminals und zu Online-Zahlungen über das Bürgerportal.",
      },
      { t: "p", text: "**Empfehlung:** Überarbeitung durch Amt 21 bis Ende 2025 unter Beteiligung des Rechnungsprüfungsamts." },
      { t: "h2", text: "5. Gesamtbewertung" },
      {
        t: "p",
        text: "Die Zahlstellen werden überwiegend ordnungsgemäß geführt. Die Feststellungen F1, F2, F4, F5 und F7 sind wesentlich und erfordern Maßnahmen. Wir bitten die betroffenen Ämter, bis zum **30.04.2025** über die Dezernate schriftlich Stellung zu nehmen und mitzuteilen, welche Maßnahmen bis wann umgesetzt werden. Eine Nachprüfung ist für das vierte Quartal 2025 vorgesehen.",
      },
      { t: "signature", lines: ["Ute Gerlach, Prüferin", "", "Gerd Lorenz, Leiter Rechnungsprüfungsamt"] },
    ],
  },
  {
    type: "word",
    id: "fb-allgemeinverfuegung-glasverbot-altstadtfest-2025",
    title: "Allgemeinverfügung über ein Glasverbot während des Altstadtfestes 2025",
    kind: "Allgemeinverfügung",
    fileName: "2025-07-29 Allgemeinverfuegung Glasverbot Altstadtfest 2025",
    org: "falkenbrueck",
    unit: "fb-amt32",
    author: "fb-dietrich",
    date: "2025-07-29",
    tags: [],
    keywords: ["32.1-122.40/25", "Glasbehältnissen", "§ 80 Abs. 2 Satz 1 Nr. 4 VwGO", "Uferpromenade", "Verwaltungsgericht Rhedenburg"],
    summary:
      "Allgemeinverfügung der Ordnungsbehörde mit Verbot, Geltungsbereich, Geltungszeitraum, Ausnahmen, sofortiger Vollziehung, Begründung mit Zahlen aus dem Vorjahr und Rechtsbehelfsbelehrung. Gut für Fassungen in Leichter Sprache, Aushänge, FAQ für Gastronomie und Besucher.",
    meta: [
      ["Aktenzeichen", "32.1-122.40/25"],
      ["Status", "öffentlich – Bekanntmachung im Amtsblatt Nr. 31/2025 vom 01.08.2025"],
    ],
    blocks: [
      { t: "h1", text: "Allgemeinverfügung der Stadt Falkenbrück über ein Glasverbot während des Altstadtfestes 2025" },
      {
        t: "p",
        text: "Auf Grund von § 13 Absatz 1 des Sicherheits- und Ordnungsgesetzes (SOG) in Verbindung mit § 35 Satz 2 des Verwaltungsverfahrensgesetzes (VwVfG) erlässt die Stadt Falkenbrück als örtliche Ordnungsbehörde folgende Allgemeinverfügung:",
      },
      { t: "h2", text: "1. Verbot" },
      {
        t: "p",
        text: "Im Geltungsbereich nach Nummer 3 ist es während des Geltungszeitraums nach Nummer 4 untersagt, Getränke in Glasbehältnissen (insbesondere Flaschen, Trinkgläser, Krüge) mitzuführen, zu benutzen oder abzugeben.",
      },
      { t: "h2", text: "2. Regelungen für Gastronomie und Verkaufsstände" },
      {
        t: "ol",
        items: [
          "Gastronomiebetriebe, Kioske und Verkaufsstände dürfen Getränke im Geltungsbereich nur in Bechern aus Kunststoff, Pappe oder einem anderen bruchsicheren Material abgeben.",
          "In geschlossenen Gasträumen sowie auf den durch Sondernutzungserlaubnis genehmigten Flächen der Außengastronomie ist die Abgabe in Gläsern zulässig, wenn sichergestellt ist, dass die Gläser diese Flächen nicht verlassen. Die Betreiberinnen und Betreiber haben hierfür geeignetes Personal einzusetzen.",
          "Die Ausweitung der Außengastronomie über die genehmigte Fläche hinaus bedarf auch während des Festes einer gesonderten Erlaubnis.",
        ],
      },
      { t: "h2", text: "3. Geltungsbereich" },
      {
        t: "p",
        text: "Der Geltungsbereich umfasst den Marktplatz, den Rathausplatz, die Marktstraße, die Kirchgasse, die Brückenstraße zwischen Mühlenweg und Uferpromenade, die Straße Am Stadtgraben sowie die Uferpromenade zwischen Brückenstraße und Hafenbecken. Maßgeblich ist der als Anlage beigefügte Lageplan, der Bestandteil dieser Allgemeinverfügung ist.",
      },
      { t: "h2", text: "4. Geltungszeitraum" },
      { t: "p", text: "Die Allgemeinverfügung gilt von **Freitag, 22.08.2025, 12:00 Uhr**, bis **Montag, 25.08.2025, 4:00 Uhr**." },
      { t: "h2", text: "5. Ausnahmen" },
      {
        t: "ul",
        items: [
          "Anwohnerinnen und Anwohner sowie Gewerbetreibende im Geltungsbereich dürfen Glasbehältnisse für den privaten oder betrieblichen Bedarf in geschlossenen Taschen oder Kisten auf direktem Weg zu ihren Wohnungen oder Betrieben transportieren.",
          "Der Lieferverkehr für Gastronomiebetriebe ist außerhalb der Veranstaltungszeiten (täglich 4:00 bis 11:00 Uhr) zulässig.",
          "Weitere Ausnahmen können im Einzelfall auf Antrag beim Ordnungsamt zugelassen werden.",
        ],
      },
      { t: "h2", text: "6. Sofortige Vollziehung" },
      { t: "p", text: "Die sofortige Vollziehung dieser Allgemeinverfügung wird nach § 80 Abs. 2 Satz 1 Nr. 4 VwGO im öffentlichen Interesse angeordnet." },
      { t: "h2", text: "7. Androhung von Zwangsmitteln" },
      {
        t: "p",
        text: "Für den Fall, dass gegen das Verbot nach Nummer 1 verstoßen wird, wird die Sicherstellung der Glasbehältnisse im Wege des unmittelbaren Zwangs angedroht. Sichergestellte Glasbehältnisse werden nicht zurückgegeben, wenn sie geöffnet sind.",
      },
      { t: "h2", text: "8. Bekanntgabe" },
      {
        t: "p",
        text: "Diese Allgemeinverfügung wird im Amtsblatt der Stadt Falkenbrück und auf der Internetseite der Stadt öffentlich bekannt gemacht. Sie gilt nach § 41 Abs. 4 Satz 4 VwVfG am Tag nach der Bekanntmachung als bekannt gegeben. Die Allgemeinverfügung und ihre Begründung können im Ordnungsamt, Rathausplatz 1, Zimmer 2.21, während der Öffnungszeiten eingesehen werden.",
      },
      { t: "h1", text: "Begründung" },
      {
        t: "p",
        text: "Das Altstadtfest ist mit rund 85.000 Besucherinnen und Besuchern an drei Tagen die größte Veranstaltung in Falkenbrück. Auf engem Raum kommen viele Menschen zusammen, ein erheblicher Teil von ihnen unter Alkoholeinfluss. In den Vorjahren haben zerbrochene Flaschen und Gläser zu einer erheblichen Gefahr für Leib und Leben geführt:",
      },
      {
        t: "table",
        header: ["Ereignis beim Altstadtfest 2024", "Anzahl"],
        rows: [
          ["Schnittverletzungen (Sanitätsdienst und Rettungsdienst)", "23"],
          ["davon mit Transport in ein Krankenhaus", "6"],
          ["Körperverletzungen mit Glas als Tatmittel (Angaben der Polizei)", "4"],
          ["Glasbruch, eingesammelt durch die Stadtreinigung", "1,8 Tonnen"],
        ],
        widths: [5, 1],
      },
      {
        t: "p",
        text: "Appelle an Besucherinnen und Besucher sowie freiwillige Vereinbarungen mit der Gastronomie haben 2023 und 2024 keine ausreichende Wirkung gezeigt. Ein Glasverbot ist geeignet, die Gefahren deutlich zu verringern; andere Städte haben damit gute Erfahrungen gemacht. Mildere, gleich wirksame Mittel stehen nicht zur Verfügung. Das Verbot ist räumlich und zeitlich auf das Festgelände und die Festtage begrenzt und lässt für Anwohnende und Gewerbetreibende Ausnahmen zu. Die Einschränkung der allgemeinen Handlungsfreiheit und der Berufsausübung der Gastronomie ist daher angemessen.",
      },
      {
        t: "p",
        text: "Die sofortige Vollziehung ist erforderlich, weil ein Rechtsbehelf sonst aufschiebende Wirkung hätte und das Verbot während des Festes nicht durchgesetzt werden könnte. Das öffentliche Interesse am Schutz von Leben und Gesundheit überwiegt das Interesse Einzelner, vorläufig von dem Verbot verschont zu bleiben.",
      },
      {
        t: "note",
        text: "**Hinweis:** Wer vorsätzlich oder fahrlässig gegen das Verbot nach Nummer 1 oder die Regelungen nach Nummer 2 verstößt, handelt ordnungswidrig. Die Ordnungswidrigkeit kann nach dem SOG mit einer Geldbuße bis zu 5.000 € geahndet werden.",
      },
      { t: "h2", text: "Rechtsbehelfsbelehrung" },
      {
        t: "p",
        text: "Gegen diese Allgemeinverfügung kann innerhalb eines Monats nach ihrer Bekanntgabe Klage beim Verwaltungsgericht Rhedenburg, Am Justizpark 5, 00118 Rhedenburg, erhoben werden. Die Klage hat wegen der Anordnung der sofortigen Vollziehung keine aufschiebende Wirkung. Das Verwaltungsgericht kann auf Antrag die aufschiebende Wirkung nach § 80 Abs. 5 VwGO ganz oder teilweise wiederherstellen.",
      },
      { t: "p", text: "Falkenbrück, den 29.07.2025" },
      { t: "signature", lines: ["Die Oberbürgermeisterin", "Im Auftrag", "Markus Dietrich", "Leiter Ordnungsamt"] },
    ],
  },
  {
    type: "word",
    id: "fb-telefonnotiz-gewerbesteuer-hafenkontor",
    title: "Telefonnotiz: Ratenzahlungswunsch Gewerbesteuer Hafenkontor Logistik GmbH",
    kind: "Telefonnotiz",
    fileName: "2025-11-14 Telefonnotiz Hafenkontor Logistik Ratenzahlung GewSt",
    org: "falkenbrueck",
    unit: "fb-amt21",
    author: "fb-aydin",
    date: "2025-11-14",
    tags: ["personendaten", "unstrukturiert"],
    keywords: ["Hafenkontor Logistik GmbH", "Ladewig", "50.610,50 €", "Vollstreckungsankündigung", "28.11."],
    summary:
      "Stichpunktartige Telefonnotiz der Vollstreckung über einen Anruf des Geschäftsführers eines Logistikunternehmens mit Gewerbesteuerrückstand, Gründen (auch Gesundheitsangaben) und Ratenangebot. Gut zum Anonymisieren und zum Ausformulieren als Vermerk oder Antwortschreiben.",
    meta: [
      ["Aktenzeichen", "21.3-VS-2025/1187"],
      ["Kassenzeichen", "6100.418.227"],
    ],
    blocks: [
      { t: "h2", text: "Telefonnotiz 14.11.2025, 10:40–11:05 Uhr" },
      {
        t: "p",
        text: "Anrufer: Herr Torben **Ladewig**, GF Hafenkontor Logistik GmbH, Kaistraße 14, 00421 Falkenbrück (geb. 03.09.1971 lt. HR-Auszug), Rückruf unter 069 90009-487",
      },
      {
        t: "ul",
        items: [
          "hat unsere Vollstreckungsankündigung vom 03.11. bekommen – sehr aufgebracht, „nach 19 Jahren im Hafen so behandelt“",
          "will Kontopfändung vermeiden (Löhne 23 MA Ende Nov.)",
          "Hauptkunde (Spedition, Gewerbegebiet Nord) seit Sept. insolvent, offene Forderungen ca. 140.000 €",
          "Ehefrau Kerstin L. (Prokuristin) seit Juli schwer erkrankt, Chemo, fällt aus → er macht Buchhaltung selbst, daher Fristen verpasst",
          "bietet an: sofort 10.000 €, danach 6 Raten à 6.800 € ab 15.12.",
        ],
      },
      {
        t: "table",
        header: ["Rückstand lt. Fachverfahren (heute)", "Betrag"],
        rows: [
          ["GewSt-Vorauszahlung III/2025 (fällig 15.08.)", "18.450,00 €"],
          ["GewSt-Vorauszahlung IV/2025 (fällig 15.11.)", "18.450,00 €"],
          ["Nachzahlung 2023 lt. Bescheid v. 12.06.2025", "12.380,00 €"],
          ["Säumniszuschläge", "1.284,00 €"],
          ["Mahngebühren", "46,50 €"],
          ["gesamt", "50.610,50 €"],
        ],
        widths: [4, 2],
      },
      {
        t: "ul",
        items: [
          "Hinweis von mir: Stundung/Raten nur auf **schriftl. Antrag** mit Begründung + Nachweisen (§ 222 AO), Stundungszinsen 0,5 % pro Monat",
          "VZ 2026: Herabsetzung Messbetrag beim FA beantragen",
          "IV/2025 ist noch gar nicht fällig (15.11. = Samstag, also erst Mo 17.11.) – gehört eigentlich nicht in den Rückstand → Summe in der Ankündigung prüfen!",
          "am Ende ruhiger, aber: wenn Konto gepfändet wird, „geht er zur Zeitung“",
        ],
      },
      { t: "p", text: "**To do:**" },
      {
        t: "ol",
        items: [
          "Antrag + BWA 09/2025 + Liquiditätsplan bis **28.11.** angefordert (per Mail an GF bestätigt)",
          "Vollstreckung bis 28.11. zurückstellen?? → mit Fr. Schröder klären, Pfändungsverfügung liegt schon zur Unterschrift!",
          "WV 28.11.",
        ],
      },
      { t: "p", text: "Aydın" },
    ],
  },
  {
    type: "excel",
    id: "fb-buergeramt-kennzahlen-2025-2026",
    title: "Bürgeramt – Kennzahlen Termine, No-Show und Wartezeit Januar 2025 bis April 2026",
    kind: "Kennzahlenauswertung",
    fileName: "Buergeramt Kennzahlen Termine Wartezeit 2025-01 bis 2026-04",
    org: "falkenbrueck",
    unit: "fb-amt33",
    author: "fb-feldhaus",
    date: "2026-05-06",
    tags: ["zahlen"],
    keywords: ["No-Show-Quote", "Express-Schalter", "Vorsprachen gesamt", "Terminerinnerung", "Abgleich"],
    summary:
      "Monatliche Kennzahlen des Bürgeramts (angebotene und gebuchte Termine, No-Show-Quote, Vorsprachen, Express-Schalter, Wartezeit) mit Summen 2025 und Vergleich Januar bis April, dazu Anliegen 2024/2025 und Stellenbesetzung. Gut für Diagramme, Folien und den Abgleich mit Zahlen aus Mails und Presseantworten.",
    sheets: [
      {
        name: "Termine und Wartezeit",
        title: "Bürgeramt – Termine, No-Show und Wartezeit",
        subtitle: "Januar 2025 bis April 2026 · Quelle: Terminsystem und Fachverfahren · Stand 05.05.2026",
        columns: [
          { header: "Monat", width: 16 },
          { header: "Termine angeboten", width: 12, fmt: "int" },
          { header: "Termine gebucht", width: 12, fmt: "int" },
          { header: "nicht wahrgenommen", width: 13, fmt: "int" },
          { header: "No-Show-Quote", width: 11, fmt: "pct" },
          { header: "Vorsprachen mit Termin", width: 13, fmt: "int" },
          { header: "Vorsprachen ohne Termin", width: 13, fmt: "int" },
          { header: "Express-Schalter", width: 12, fmt: "int" },
          { header: "Vorsprachen gesamt", width: 13, fmt: "int" },
          { header: "Wartezeit (Werktage)", width: 12, fmt: "int" },
        ],
        rows: [
          ["Januar 2025", 11200, 10950, 3395, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 4720, null, { f: "F{r}+G{r}+H{r}" }, 9],
          ["Februar 2025", 10800, 10690, 3314, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 4480, null, { f: "F{r}+G{r}+H{r}" }, 11],
          ["März 2025", 11500, 11420, 3597, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 4690, null, { f: "F{r}+G{r}+H{r}" }, 12],
          ["April 2025", 10900, 10870, 3326, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 4550, null, { f: "F{r}+G{r}+H{r}" }, 14],
          ["Mai 2025", 11100, 11080, 3479, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 4810, null, { f: "F{r}+G{r}+H{r}" }, 15],
          ["Juni 2025", 11300, 11290, 3590, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 5180, null, { f: "F{r}+G{r}+H{r}" }, 17],
          ["Juli 2025", 10400, 10400, 3276, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 5420, null, { f: "F{r}+G{r}+H{r}" }, 21],
          ["August 2025", 10200, 10180, 3034, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 4940, null, { f: "F{r}+G{r}+H{r}" }, 19],
          ["September 2025", 11000, 10960, 3288, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 4610, null, { f: "F{r}+G{r}+H{r}" }, 18],
          ["Oktober 2025", 11400, 11230, 3257, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 4450, null, { f: "F{r}+G{r}+H{r}" }, 16],
          ["November 2025", 11300, 11010, 2973, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 4350, null, { f: "F{r}+G{r}+H{r}" }, 14],
          ["Dezember 2025", 9600, 9120, 1642, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 3780, null, { f: "F{r}+G{r}+H{r}" }, 12],
          ["Januar 2026", 11600, 11150, 1673, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 3910, 1290, { f: "F{r}+G{r}+H{r}" }, 11],
          ["Februar 2026", 11900, 11520, 1613, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 3680, 1920, { f: "F{r}+G{r}+H{r}" }, 10],
          ["März 2026", 12300, 11870, 1543, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 3590, 2110, { f: "F{r}+G{r}+H{r}" }, 9],
          ["April 2026", 12100, 11640, 1397, { f: "D{r}/C{r}" }, { f: "C{r}-D{r}" }, 3540, 2130, { f: "F{r}+G{r}+H{r}" }, 8],
          {
            total: true,
            cells: [
              "Summe 2025",
              { f: "SUM(B5:B16)" },
              { f: "SUM(C5:C16)" },
              { f: "SUM(D5:D16)" },
              { f: "D{r}/C{r}" },
              { f: "SUM(F5:F16)" },
              { f: "SUM(G5:G16)" },
              { f: "SUM(H5:H16)" },
              { f: "SUM(I5:I16)" },
              { f: "ROUND(AVERAGE(J5:J16),1)", fmt: "dec" },
            ],
          },
          {
            total: true,
            cells: [
              "Jan.–Apr. 2025",
              { f: "SUM(B5:B8)" },
              { f: "SUM(C5:C8)" },
              { f: "SUM(D5:D8)" },
              { f: "D{r}/C{r}" },
              { f: "SUM(F5:F8)" },
              { f: "SUM(G5:G8)" },
              { f: "SUM(H5:H8)" },
              { f: "SUM(I5:I8)" },
              { f: "ROUND(AVERAGE(J5:J8),1)", fmt: "dec" },
            ],
          },
          {
            total: true,
            cells: [
              "Jan.–Apr. 2026",
              { f: "SUM(B17:B20)" },
              { f: "SUM(C17:C20)" },
              { f: "SUM(D17:D20)" },
              { f: "D{r}/C{r}" },
              { f: "SUM(F17:F20)" },
              { f: "SUM(G17:G20)" },
              { f: "SUM(H17:H20)" },
              { f: "SUM(I17:I20)" },
              { f: "ROUND(AVERAGE(J17:J20),1)", fmt: "dec" },
            ],
          },
        ],
        notes: [
          "No-Show-Quote = nicht wahrgenommene Termine / gebuchte Termine.",
          "Terminerinnerung per E-Mail und SMS seit 01.12.2025; Express-Schalter für Abholungen ohne Termin seit 12.01.2026.",
          "Wartezeit = erster frei buchbarer Termin am Monatsende, Durchschnitt beider Bürgerbüros (Mitte und Nord).",
          "Dialoge mit dem KI-Assistenten (Pilotbetrieb seit 02.03.2026) sind in den Vorsprachen nicht enthalten.",
        ],
      },
      {
        name: "Anliegen",
        title: "Vorsprachen nach Anliegen",
        subtitle: "Kalenderjahre 2024 und 2025 · Quelle: Fachverfahren",
        columns: [
          { header: "Anliegen", width: 28 },
          { header: "2024", width: 12, fmt: "int" },
          { header: "2025", width: 12, fmt: "int" },
          { header: "Veränderung", width: 13, fmt: "int" },
          { header: "Veränderung in %", width: 13, fmt: "pct" },
          { header: "Anteil 2025", width: 11, fmt: "pct" },
        ],
        rows: [
          ["Ausweis und Pass", 54000, 57200, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }, { f: "C{r}/C10" }],
          ["An- und Ummeldung", 41000, 42150, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }, { f: "C{r}/C10" }],
          ["Führungszeugnisse", 12500, 10900, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }, { f: "C{r}/C10" }],
          ["Beglaubigungen", 9800, 9400, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }, { f: "C{r}/C10" }],
          ["Sonstiges", 24700, 27359, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }, { f: "C{r}/C10" }],
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "C{r}-B{r}" }, { f: "D{r}/B{r}" }, { f: "C{r}/C10" }],
          },
          {
            total: true,
            cells: ["Abgleich mit Blatt „Termine und Wartezeit“", null, { f: "'Termine und Wartezeit'!I21" }, { f: "C{r}-C10" }, null, null],
          },
        ],
        notes: ["Die Abweichung in der Zeile „Abgleich“ muss 0 sein; sonst sind Vorsprachen im Fachverfahren keinem Anliegen zugeordnet."],
      },
      {
        name: "Personal",
        title: "Stellenbesetzung Bürgeramt",
        subtitle: "Vollzeitäquivalente (VZÄ) zum Stichtag",
        columns: [
          { header: "Stichtag", width: 12, fmt: "date" },
          { header: "Stellen lt. Stellenplan", width: 14, fmt: "dec" },
          { header: "besetzt", width: 10, fmt: "dec" },
          { header: "unbesetzt", width: 10, fmt: "dec" },
          { header: "langzeiterkrankt", width: 13, fmt: "dec" },
          { header: "tatsächlich verfügbar", width: 14, fmt: "dec" },
        ],
        rows: [
          [{ date: "2025-09-30" }, 21, 16.5, { f: "B{r}-C{r}" }, 2, { f: "C{r}-E{r}" }],
          [{ date: "2025-12-31" }, 21, 16.5, { f: "B{r}-C{r}" }, 2, { f: "C{r}-E{r}" }],
          [{ date: "2026-03-31" }, 21, 18.5, { f: "B{r}-C{r}" }, 1, { f: "C{r}-E{r}" }],
          [{ date: "2026-04-30" }, 21, 18.5, { f: "B{r}-C{r}" }, 1, { f: "C{r}-E{r}" }],
        ],
        notes: ["Zwei Stellen wurden zum 01.02.2026 nach externer Ausschreibung besetzt (Maßnahme aus der Klausurtagung Bürgeramt 2030)."],
      },
    ],
  },
  {
    type: "excel",
    id: "fb-einsatzstatistik-feuerwehr-2025",
    title: "Einsatzstatistik der Berufsfeuerwehr 2025 mit Auswertung der Hilfsfrist",
    kind: "Einsatzstatistik",
    fileName: "Einsatzstatistik Berufsfeuerwehr 2025 Hilfsfrist nach Stadtteilen",
    org: "falkenbrueck",
    unit: "fb-amt37",
    author: "fb-kaya",
    date: "2026-03-11",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Schutzziel 1", "Zielerreichungsgrad", "Weststadt", "Technische Hilfeleistung", "Feuerwache 3"],
    summary:
      "Einsätze der Berufsfeuerwehr 2025 nach Monat und Einsatzart sowie Erreichung der Schutzziele nach Stadtteilen. Eingebauter Widerspruch: Die Zusammenfassung unter der Tabelle nennt 88 Prozent und nur einen Stadtteil unter 80 Prozent, die Formeln ergeben rund 84 Prozent und zwei Stadtteile unter 80 Prozent.",
    sheets: [
      {
        name: "Einsätze 2025",
        title: "Einsätze der Berufsfeuerwehr Falkenbrück 2025",
        subtitle: "nach Monat und Einsatzart · Quelle: Einsatzleitsystem der Leitstelle · Stand 06.03.2026",
        columns: [
          { header: "Monat", width: 12 },
          { header: "Brand", width: 10, fmt: "int" },
          { header: "Technische Hilfeleistung", width: 14, fmt: "int" },
          { header: "Rettungsdienst (Notfall)", width: 14, fmt: "int" },
          { header: "Fehlalarme Brandmeldeanlagen", width: 15, fmt: "int" },
          { header: "Sonstige", width: 10, fmt: "int" },
          { header: "Einsätze gesamt", width: 12, fmt: "int" },
          { header: "Anteil Rettungsdienst", width: 12, fmt: "pct" },
        ],
        rows: [
          ["Januar", 78, 182, 2384, 58, 34, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          ["Februar", 71, 176, 2201, 51, 29, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          ["März", 84, 191, 2356, 63, 38, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          ["April", 92, 203, 2298, 55, 41, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          ["Mai", 88, 214, 2412, 67, 45, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          ["Juni", 97, 229, 2467, 61, 52, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          ["Juli", 104, 236, 2589, 66, 49, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          ["August", 96, 221, 2531, 64, 47, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          ["September", 81, 198, 2340, 59, 39, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          ["Oktober", 73, 187, 2318, 57, 36, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          ["November", 69, 179, 2276, 52, 31, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          ["Dezember", 86, 195, 2447, 60, 42, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          {
            total: true,
            cells: [
              "Summe 2025",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "SUM(G{first}:G{last})" },
              { f: "D{r}/G{r}" },
            ],
          },
          {
            total: true,
            cells: ["Vorjahr 2024", 964, 2287, 27412, 742, 455, { f: "SUM(B{r}:F{r})" }, { f: "D{r}/G{r}" }],
          },
          {
            total: true,
            cells: [
              "Veränderung",
              { f: "B17-B18" },
              { f: "C17-C18" },
              { f: "D17-D18" },
              { f: "E17-E18" },
              { f: "F17-F18" },
              { f: "G17-G18" },
              null,
            ],
          },
        ],
        notes: [
          "Rettungsdienst: nur Notfalleinsätze mit Rettungswagen oder Notarzt; Krankentransporte werden durch beauftragte Hilfsorganisationen durchgeführt und sind nicht enthalten.",
          "Juli: Unwetter am 14. und 15.07.2025 mit 61 Einsätzen der Technischen Hilfeleistung an zwei Tagen.",
        ],
      },
      {
        name: "Hilfsfrist",
        title: "Erreichung der Schutzziele 2025 nach Stadtteilen",
        subtitle: "Schutzziel 1: 10 Funktionen in 8 Minuten · Schutzziel 2: weitere 6 Funktionen in 13 Minuten · Zielerreichungsgrad 90 %",
        columns: [
          { header: "Stadtteil", width: 16 },
          { header: "zuständige Wache", width: 14 },
          { header: "schutzzielrelevante Einsätze", width: 15, fmt: "int" },
          { header: "Schutzziel 1 erreicht", width: 13, fmt: "int" },
          { header: "Quote Schutzziel 1", width: 12, fmt: "pct" },
          { header: "Schutzziel 2 erreicht", width: 13, fmt: "int" },
          { header: "Quote Schutzziel 2", width: 12, fmt: "pct" },
          { header: "Abweichung vom Ziel (SZ 1)", width: 14, fmt: "pct" },
          { header: "mittlere Eintreffzeit (Min.)", width: 14, fmt: "dec" },
        ],
        rows: [
          ["Altstadt", "Feuerwache 1", 58, 54, { f: "D{r}/C{r}" }, 56, { f: "F{r}/C{r}" }, { f: "E{r}-0.9" }, 6.4],
          ["Nordstadt", "Feuerwache 2", 64, 54, { f: "D{r}/C{r}" }, 60, { f: "F{r}/C{r}" }, { f: "E{r}-0.9" }, 7.2],
          ["Südstadt", "Feuerwache 1", 71, 63, { f: "D{r}/C{r}" }, 68, { f: "F{r}/C{r}" }, { f: "E{r}-0.9" }, 6.9],
          ["Weststadt", "Feuerwache 2", 62, 44, { f: "D{r}/C{r}" }, 53, { f: "F{r}/C{r}" }, { f: "E{r}-0.9" }, 8.6],
          ["Lerchenfeld", "Feuerwache 2", 39, 31, { f: "D{r}/C{r}" }, 35, { f: "F{r}/C{r}" }, { f: "E{r}-0.9" }, 7.8],
          ["Hafenviertel", "Feuerwache 1", 47, 41, { f: "D{r}/C{r}" }, 45, { f: "F{r}/C{r}" }, { f: "E{r}-0.9" }, 7.0],
          ["Mühlenviertel", "Feuerwache 1", 36, 30, { f: "D{r}/C{r}" }, 34, { f: "F{r}/C{r}" }, { f: "E{r}-0.9" }, 7.4],
          {
            total: true,
            cells: [
              "Stadt gesamt",
              "",
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "D{r}/C{r}" },
              { f: "SUM(F{first}:F{last})" },
              { f: "F{r}/C{r}" },
              { f: "E{r}-0.9" },
              { f: "ROUND(AVERAGE(I{first}:I{last}),1)" },
            ],
          },
        ],
        notes: [
          "Schutzzielrelevant sind kritische Wohnungsbrände und zeitkritische Einsätze der Technischen Hilfeleistung mit Menschenrettung.",
          "Zusammenfassung für den Jahresbericht: Schutzziel 1 wurde 2025 stadtweit in 88 % der Einsätze erreicht; nur die Weststadt liegt unter 80 %.",
          "Die Weststadt liegt außerhalb des 8-Minuten-Bereichs beider Wachen. Die Fortschreibung des Brandschutzbedarfsplans sieht deshalb den Neubau der Feuerwache 3 vor.",
        ],
      },
    ],
  },
  {
    type: "excel",
    id: "fb-mietobjekte-leerstand-liegenschaften-2025",
    title: "Übersicht Mietobjekte und Leerstand städtischer Liegenschaften – Stand 31.01.2025",
    kind: "Objektliste",
    fileName: "Liegenschaften Mietobjekte und Leerstand Stand 2025-01-31",
    org: "falkenbrueck",
    unit: "fb-amt23",
    author: "fb-tiedje",
    date: "2025-02-12",
    tags: ["zahlen", "personendaten"],
    keywords: ["L-007", "Speicher A", "Leerstandsquote", "entgangene Jahresmiete", "Kiebitzweg"],
    summary:
      "Arbeitsliste der Miet- und Pachtverwaltung mit 21 städtischen Objekten (Läden, Büros, Wohnungen, Garagen), Mieterinnen und Mietern, Mieten, Vertragsenden und uneinheitlichen Bemerkungen sowie eine Leerstandsauswertung nach Stadtteilen. Enthält Namen und persönliche Angaben privater Mieter – gut zum Anonymisieren, Priorisieren und Zusammenfassen.",
    sheets: [
      {
        name: "Mietobjekte",
        title: "Städtische Mietobjekte – Stand 31.01.2025",
        subtitle: "Amt 23 – Liegenschaften, Miet- und Pachtverwaltung · Kaltmieten in Euro je Monat",
        columns: [
          { header: "Obj.-Nr.", width: 8 },
          { header: "Adresse", width: 26 },
          { header: "Stadtteil", width: 13 },
          { header: "Nutzung", width: 16 },
          { header: "Fläche m²", width: 9, fmt: "int" },
          { header: "Mieterin / Mieter", width: 30 },
          { header: "Mietbeginn", width: 11, fmt: "date" },
          { header: "Mietende", width: 13 },
          { header: "Kaltmiete mtl.", width: 12, fmt: "eur" },
          { header: "€ je m²", width: 9, fmt: "eur" },
          { header: "Status", width: 16 },
          { header: "Bemerkung", width: 48 },
        ],
        rows: [
          ["L-001", "Marktstraße 3, EG", "Altstadt", "Ladenlokal", 86, "Buchhandlung Seitenweise e. K., Inh. Ulla Fenske", { date: "2016-04-01" }, "31.03.2026", 1290, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", "Verlängerung angefragt, Mieterin will Staffelmiete raus – mit Hr. Krämer besprechen"],
          ["L-002", "Marktstraße 5, EG", "Altstadt", "Ladenlokal", 112, "", null, "", null, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "leer seit 08/2024", "ehem. Drogerie. Wifö fragt nach Pop-up-Nutzung?? Brandschutz/2. Rettungsweg klären"],
          ["L-003", "Kirchgasse 2", "Altstadt", "Ladenlokal", 54, "Änderungsschneiderei, Inh. Gülsen Yılmaz", { date: "2011-07-01" }, "unbefristet", 610, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", "Rückstand Dez. + Jan. (1.220 €), Ratenzahlung tel. zugesagt 04.02., Fr. Y. war im Krankenhaus"],
          ["L-004", "Rathausplatz 4, EG", "Altstadt", "Gastronomie", 145, "Ratsstuben Falkenbrück GmbH", { date: "2019-01-01" }, "31.12.2028", 2450, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", "zzgl. Umsatzmiete 6 % über 480 T€ – Abrechnung 2024 fehlt noch!"],
          ["L-005", "Brückenstraße 11, 1. OG", "Altstadt", "Büro / Vereinsräume", 160, "Verein für Stadtgeschichte Falkenbrück e. V.", { date: "2008-05-01" }, "unbefristet", 320, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", "Vereinsmiete lt. Ratsbeschluss 2008, deutlich unter Markt"],
          ["L-006", "Am Stadtgraben 7, 2. OG links", "Altstadt", "Wohnung 3 Zi.", 78, "Herr Rüdiger Lohse (geb. 1943)", { date: "1998-10-01" }, "unbefristet", 452, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", "Mieter pflegebedürftig (Pflegegrad 3), Tochter Anja Lohse ist Betreuerin, Tel. 069 90009-488. Treppenlift beantragt"],
          ["L-007", "Hafenstraße 12 (Speicher A), EG", "Hafenviertel", "Lager / Gewerbe", 640, "", null, "", null, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "leer seit 01/2023", "Dach undicht, Sanierung lt. Hochbau ca. 380 T€. WBG hat Interesse am Gesamtareal?"],
          ["L-008", "Hafenstraße 12 (Speicher A), 1. OG", "Hafenviertel", "Büro", 310, "Kreativwerft gGmbH", { date: "2021-03-01" }, "28.02.2026", 1860, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", "KÜNDIGUNG zum 28.02.2026 eingegangen (Schreiben v. 20.01.) – Nachnutzung offen"],
          ["L-009", "Kaistraße 3", "Hafenviertel", "Kiosk", 18, "Herr Dimitrios Karalis", { date: "2014-04-01" }, "unbefristet", 240, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", ""],
          ["L-010", "Hafenpromenade 1 (Anleger)", "Hafenviertel", "Imbiss, saisonal", 35, "Imbiss Möwe, Inh. Sven Kracht", { date: "2020-04-01" }, "31.10.2025", 380, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", "nur April–Oktober, Miete hier als Monatsdurchschnitt aufs Jahr gerechnet"],
          ["L-011", "Lindenallee 22", "Nordstadt", "Hausmeisterwohnung", 92, "Herr Jens Ewert und Frau Martina Ewert", { date: "2009-08-01" }, "an Arbeitsvertrag gebunden", 410, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", "Hr. Ewert (Hausmeister Gesamtschule Nord) geht 06/2026 in Rente – Wohnung dann für Nachfolger?"],
          ["L-012", "Kiebitzweg, Flurstück 112/3", "Nordstadt", "Freifläche (ehem. Bolzplatz)", 2950, "", null, "", null, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vorgehalten", "Jugendamt prüft Standort für Kita – NICHT verpachten (Anfrage Zirkus 05/2025 abgelehnt)"],
          ["L-013", "Nordring 40, EG", "Nordstadt", "Ladenlokal", 95, "Bäckerei Habermann OHG", { date: "2017-09-01" }, "31.08.2027", 1045, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", ""],
          ["L-014", "Lerchenweg 8", "Lerchenfeld", "Vereinsheim", 210, "Kleingartenverein Lerchenfeld e. V.", { date: "1994-01-01" }, "unbefristet", 150, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", "Nebenkosten seit 2022 nicht abgerechnet (!!)"],
          ["L-015", "Lerchenweg 10, EG rechts", "Lerchenfeld", "Wohnung 2 Zi.", 56, "Frau Natalia Sorokina", { date: "2023-02-01" }, "unbefristet", 395, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", "Gewährleistungswohnung Sozialamt, Miete kommt direkt vom Jobcenter, 2 Kinder"],
          ["L-016", "Mühlenweg 1 (Alte Mühle)", "Mühlenviertel", "Veranstaltungsraum", 240, "Eigennutzung Standesamt (Trauort)", null, "", null, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "Eigennutzung", "Vermietung an Private Sa nachmittags möglich? Anfrage Amt 34"],
          ["L-017", "Mühlenweg 3", "Mühlenviertel", "Ladenlokal", 70, "", null, "", null, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "leer seit 11/2024", "Wasserschaden 10/2024, Gutachten liegt vor, Versicherung zahlt?"],
          ["L-018", "Südring 15, Garagenhof", "Südstadt", "14 Garagen", 252, "13 Einzelmietverträge", { date: "2005-01-01" }, "unbefristet", 663, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "13 von 14 vermietet", "Garage 7 leer seit Dez. (Tor defekt), Warteliste 9 Personen. Miete 51 € je Garage"],
          ["L-019", "Bahnhofstraße 44, EG", "Südstadt", "Ladenlokal", 130, "Speiche & Kette Fahrradwerkstatt UG", { date: "2022-06-01" }, "31.05.2027", 1170, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", ""],
          ["L-020", "Weststraße 2 (ehem. Ortsamt)", "Weststadt", "Büro", 420, "", null, "", null, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "leer seit 07/2023", "Feuerwehr fragt nach Grundstück für neue Wache 3 – Grundstück wohl zu klein"],
          ["L-021", "Weststraße 2a, 1. OG", "Weststadt", "Wohnung 4 Zi.", 98, "Herr Andrzej Wróbel und Frau Beata Wróbel", { date: "2018-03-01" }, "unbefristet", 640, { f: "IF(I{r}>0,I{r}/E{r},\"\")" }, "vermietet", "Mieterhöhungsverlangen nach § 558 BGB zum 01.04.2025 verschickt, Zustimmung fehlt noch"],
          {
            total: true,
            cells: ["", "Summe", "", "", { f: "SUM(E{first}:E{last})" }, "", null, "", { f: "SUM(I{first}:I{last})" }, null, "", ""],
          },
          {
            total: true,
            cells: ["", "Jahresmiete (Kaltmiete × 12)", "", "", null, "", null, "", { f: "I26*12" }, null, "", ""],
          },
        ],
        notes: [
          "Flächen ohne Freifläche Kiebitzweg: 3.301 m². Die Summe in Spalte E enthält die Freifläche.",
          "Bemerkungen aus der laufenden Bearbeitung, nicht abgestimmt.",
        ],
      },
      {
        name: "Leerstand",
        title: "Leerstand nach Stadtteilen – Stand 31.01.2025",
        subtitle: "nur Gebäude und Garagen, ohne Freiflächen · Marktmiete nach Mietspiegel und Maklerangaben (Schätzung)",
        columns: [
          { header: "Stadtteil", width: 15 },
          { header: "Objekte", width: 9, fmt: "int" },
          { header: "davon leer", width: 10, fmt: "int" },
          { header: "Fläche gesamt m²", width: 12, fmt: "int" },
          { header: "Fläche leer m²", width: 11, fmt: "int" },
          { header: "Leerstandsquote (Fläche)", width: 13, fmt: "pct" },
          { header: "Marktmiete € je m²", width: 12, fmt: "eur" },
          { header: "entgangene Jahresmiete", width: 14, fmt: "eur0" },
        ],
        rows: [
          ["Altstadt", 6, 1, 635, 112, { f: "E{r}/D{r}" }, 14, { f: "E{r}*G{r}*12" }],
          ["Hafenviertel", 4, 1, 1003, 640, { f: "E{r}/D{r}" }, 4.5, { f: "E{r}*G{r}*12" }],
          ["Nordstadt", 2, 0, 187, 0, { f: "E{r}/D{r}" }, null, { f: "E{r}*G{r}*12" }],
          ["Lerchenfeld", 2, 0, 266, 0, { f: "E{r}/D{r}" }, null, { f: "E{r}*G{r}*12" }],
          ["Mühlenviertel", 2, 1, 310, 70, { f: "E{r}/D{r}" }, 9, { f: "E{r}*G{r}*12" }],
          ["Südstadt", 2, 0, 382, 18, { f: "E{r}/D{r}" }, { f: "51/18" }, { f: "E{r}*G{r}*12" }],
          ["Weststadt", 2, 1, 518, 420, { f: "E{r}/D{r}" }, 7, { f: "E{r}*G{r}*12" }],
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "E{r}/D{r}" }, null, { f: "SUM(H{first}:H{last})" }],
          },
        ],
        notes: [
          "Südstadt: eine leere Garage (18 m², 51 € monatlich) – als Teilleerstand gezählt, nicht als leeres Objekt.",
          "Ohne Speicher A (L-007) läge die Leerstandsquote bei rund 23 % der Fläche.",
          "Kündigung L-008 (310 m²) zum 28.02.2026 ist noch nicht berücksichtigt.",
        ],
      },
    ],
  },
  {
    type: "excel",
    id: "fb-haushaltsplanentwurf-2027-eckdaten",
    title: "Haushaltsplanentwurf 2027 – Eckdaten, Ergebnisplan nach Teilhaushalten, Steuern und Zuweisungen",
    kind: "Haushaltsplanentwurf (Eckdaten)",
    fileName: "Haushaltsplanentwurf 2027 Eckdaten und Ergebnisplan Teilhaushalte",
    org: "falkenbrueck",
    unit: "fb-amt20",
    author: "fb-ruland",
    date: "2026-09-07",
    tags: ["zahlen"],
    keywords: ["Ausgleichsrücklage", "Teilhaushalt", "Schlüsselzuweisungen", "Hebesatz Gewerbesteuer", "allgemeine Rücklage"],
    summary:
      "Eckdaten des Haushaltsplanentwurfs 2027 mit Ergebnis 2025, Ansatz und Prognose 2026 und Finanzplanung bis 2030, Ergebnisplan nach 19 Teilhaushalten und Steuer- und Zuweisungsplanung; die Blätter sind über Formeln verknüpft. Gut für Diagramme, Folien, Kurzberichte und Rechenübungen (Rücklagen, Haushaltssicherung).",
    sheets: [
      {
        name: "Eckdaten",
        title: "Haushaltsplanentwurf 2027 – Eckdaten",
        subtitle: "Ergebnisplan und Finanzplanung 2025 bis 2030 · Beträge in Tsd. € · Stand 04.09.2026",
        columns: [
          { header: "Position", width: 40 },
          { header: "Ergebnis 2025", width: 13, fmt: "int" },
          { header: "Ansatz 2026", width: 13, fmt: "int" },
          { header: "Prognose 2026", width: 13, fmt: "int" },
          { header: "Entwurf 2027", width: 13, fmt: "int" },
          { header: "Plan 2028", width: 13, fmt: "int" },
          { header: "Plan 2029", width: 13, fmt: "int" },
          { header: "Plan 2030", width: 13, fmt: "int" },
        ],
        rows: [
          ["Ordentliche Erträge", 1041300, 1078900, 1061700, { f: "'Ergebnisplan TH'!C24" }, 1139800, 1168200, 1199600],
          ["Ordentliche Aufwendungen", 1069800, 1108400, 1099900, { f: "'Ergebnisplan TH'!D24" }, 1171500, 1192700, 1213900],
          ["Ordentliches Ergebnis", { f: "B5-B6" }, { f: "C5-C6" }, { f: "D5-D6" }, { f: "E5-E6" }, { f: "F5-F6" }, { f: "G5-G6" }, { f: "H5-H6" }],
          ["Finanzerträge", 2900, 2500, 2500, 2300, 2300, 2300, 2300],
          ["Zinsen und sonstige Finanzaufwendungen", 10200, 11600, 11600, 14000, 15900, 17600, 19100],
          ["Finanzergebnis", { f: "B8-B9" }, { f: "C8-C9" }, { f: "D8-D9" }, { f: "E8-E9" }, { f: "F8-F9" }, { f: "G8-G9" }, { f: "H8-H9" }],
          { cells: ["Jahresergebnis", { f: "B7+B10" }, { f: "C7+C10" }, { f: "D7+D10" }, { f: "E7+E10" }, { f: "F7+F10" }, { f: "G7+G10" }, { f: "H7+H10" }], total: true },
          ["Investive Auszahlungen", 96400, 128700, 112300, 141800, 156200, 149500, 133000],
          ["Kreditaufnahme für Investitionen", 48000, 71500, 62000, 83400, 92100, 85700, 74300],
          ["Stand Liquiditätskredite am 31.12.", 186000, 221000, 238000, 289000, 336000, 377000, 409000],
          ["Ausgleichsrücklage am 31.12.", 46800, { f: "MAX(0,B15+C11)" }, { f: "MAX(0,B15+D11)" }, { f: "MAX(0,D15+E11)" }, { f: "MAX(0,E15+F11)" }, { f: "MAX(0,F15+G11)" }, { f: "MAX(0,G15+H11)" }],
          ["Inanspruchnahme der allgemeinen Rücklage", 0, { f: "MAX(0,-(B15+C11))" }, { f: "MAX(0,-(B15+D11))" }, { f: "MAX(0,-(D15+E11))" }, { f: "MAX(0,-(E15+F11))" }, { f: "MAX(0,-(F15+G11))" }, { f: "MAX(0,-(G15+H11))" }],
          ["Allgemeine Rücklage am 31.12.", 684000, { f: "B17-C16" }, { f: "B17-D16" }, { f: "D17-E16" }, { f: "E17-F16" }, { f: "F17-G16" }, { f: "G17-H16" }],
          ["Verringerung der allgemeinen Rücklage in %", null, { f: "C16/B17", fmt: "pct" }, { f: "D16/B17", fmt: "pct" }, { f: "E16/D17", fmt: "pct" }, { f: "F16/E17", fmt: "pct" }, { f: "G16/F17", fmt: "pct" }, { f: "H16/G17", fmt: "pct" }],
          ["Hebesatz Gewerbesteuer (%)", 470, 470, 470, 490, 490, 490, 490],
          ["Hebesatz Grundsteuer B (%)", 595, 595, 595, 595, 595, 595, 595],
        ],
        notes: [
          "Prognose 2026 nach haushaltswirtschaftlicher Sperre vom 02.06.2026 (erwartete Entlastung rund 14 Mio. €); ohne Sperre läge der Fehlbetrag 2026 bei 61,3 Mio. €.",
          "Entwurf 2027: Erträge und Aufwendungen werden aus dem Blatt „Ergebnisplan TH“ übernommen.",
          "Die Ausgleichsrücklage ist Ende 2026 aufgebraucht. Ab 2027 wird die allgemeine Rücklage in zwei aufeinanderfolgenden Jahren um mehr als 5 % verringert – nach der Kommunalverfassung (KV) ist ein Haushaltssicherungskonzept aufzustellen.",
        ],
      },
      {
        name: "Ergebnisplan TH",
        title: "Ergebnisplan 2027 nach Teilhaushalten",
        subtitle: "Beträge in Tsd. € · Zuschussbedarf = Aufwendungen abzüglich Erträge (negativ = Überschuss)",
        columns: [
          { header: "TH", width: 6 },
          { header: "Bezeichnung", width: 40 },
          { header: "Erträge 2027", width: 13, fmt: "int" },
          { header: "Aufwendungen 2027", width: 13, fmt: "int" },
          { header: "Zuschussbedarf 2027", width: 13, fmt: "int" },
          { header: "Zuschussbedarf Ansatz 2026", width: 13, fmt: "int" },
          { header: "Veränderung", width: 12, fmt: "int" },
          { header: "Veränderung in %", width: 11, fmt: "pct" },
        ],
        rows: [
          ["01", "Verwaltungsführung (OB, Presse, Datenschutz, Gleichstellung, Wirtschaftsförderung, RPA)", 1200, 14800, { f: "D{r}-C{r}" }, 13100, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["10", "Zentrale Dienste und Gremien", 3900, 31600, { f: "D{r}-C{r}" }, 26900, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["11", "Personal und Organisation (einschl. Versorgung und Beihilfe)", 9800, 58900, { f: "D{r}-C{r}" }, 46300, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["12", "Digitalisierung und IT", 2600, 29400, { f: "D{r}-C{r}" }, 24100, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["20", "Finanzen und allgemeine Deckungsmittel", { f: "'Steuern und Zuweisungen'!E18" }, 228500, { f: "D{r}-C{r}" }, -534400, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["23", "Liegenschaften", 14600, 38200, { f: "D{r}-C{r}" }, 22900, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["32", "Öffentliche Ordnung", 9700, 19800, { f: "D{r}-C{r}" }, 9600, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["33", "Bürgeramt", 6900, 15400, { f: "D{r}-C{r}" }, 8200, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["34", "Standesamt", 1400, 3100, { f: "D{r}-C{r}" }, 1600, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["37", "Feuerwehr und Rettungsdienst", 41800, 92300, { f: "D{r}-C{r}" }, 47200, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["40", "Schulen", 18400, 96800, { f: "D{r}-C{r}" }, 75900, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["41", "Kultur und Stadtbibliothek", 4100, 27600, { f: "D{r}-C{r}" }, 23300, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["52", "Sport", 1900, 12700, { f: "D{r}-C{r}" }, 10700, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["50", "Soziales", 148600, 246900, { f: "D{r}-C{r}" }, 93400, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["51", "Jugend", 21700, 94600, { f: "D{r}-C{r}" }, 68400, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["53", "Gesundheit", 3200, 14900, { f: "D{r}-C{r}" }, 11300, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["61", "Stadtplanung und Bauaufsicht", 7800, 18900, { f: "D{r}-C{r}" }, 10700, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["66", "Tiefbau und Verkehr", 22400, 71300, { f: "D{r}-C{r}" }, 47100, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          ["67", "Grünflächen, Umwelt und Klimaschutz", 5300, 29700, { f: "D{r}-C{r}" }, 23200, { f: "E{r}-F{r}" }, { f: "G{r}/ABS(F{r})" }],
          {
            total: true,
            cells: [
              "",
              "Summe Ergebnisplan",
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "D{r}-C{r}" },
              { f: "SUM(F{first}:F{last})" },
              { f: "E{r}-F{r}" },
              { f: "G{r}/ABS(F{r})" },
            ],
          },
        ],
        notes: [
          "TH 51: Mehrbedarf vor allem bei den Hilfen zur Erziehung (stationär) und durch die Inbetriebnahme der Kita Kiebitzweg (Personal ab 2027/28).",
          "TH 37: erste Stufe des Brandschutzbedarfsplans 2026–2030 (zusätzliche Stellen im Einsatzdienst).",
          "TH 20: Gewerbesteuer mit Hebesatz 490 % (bisher 470 %).",
        ],
      },
      {
        name: "Steuern und Zuweisungen",
        title: "Steuern, allgemeine Zuweisungen und sonstige Deckungsmittel",
        subtitle: "Teilhaushalt 20 · Beträge in Tsd. €",
        columns: [
          { header: "Position", width: 42 },
          { header: "Ergebnis 2025", width: 13, fmt: "int" },
          { header: "Ansatz 2026", width: 13, fmt: "int" },
          { header: "Prognose 2026", width: 13, fmt: "int" },
          { header: "Entwurf 2027", width: 13, fmt: "int" },
          { header: "Veränderung zur Prognose 2026", width: 14, fmt: "int" },
          { header: "in %", width: 9, fmt: "pct" },
        ],
        rows: [
          ["Gewerbesteuer", 198400, 204000, 186800, 207500, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Grundsteuer A", 290, 300, 300, 300, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Grundsteuer B", 61200, 61800, 61900, 62400, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Gemeindeanteil an der Einkommensteuer", 112900, 117400, 116200, 121300, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Gemeindeanteil an der Umsatzsteuer", 24600, 25100, 25300, 25900, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Vergnügungsteuer", 2100, 2200, 2050, 2200, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Hundesteuer", 1820, 1850, 1870, 1900, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Zweitwohnungsteuer", 540, 600, 580, 600, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Schlüsselzuweisungen", 236100, 241700, 241700, 248300, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Sonstige allgemeine Zuweisungen des Landes", 71200, 73900, 74100, 76600, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Familienleistungsausgleich", 13900, 14300, 14300, 14700, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Konzessionsabgaben", 16400, 16700, 16600, 16900, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          ["Gewinnausschüttung Stadtwerke Falkenbrück GmbH", 8000, 8500, 8500, 8500, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          {
            total: true,
            cells: ["Summe Erträge TH 20", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }],
          },
        ],
        notes: [
          "Gewerbesteuer 2027: Anhebung des Hebesatzes von 470 % auf 490 % (Mehrertrag rund 8,8 Mio. €) und Normalisierung nach den Erstattungen 2026.",
          "Schlüsselzuweisungen nach der Orientierungsdatenmitteilung des Landes vom August 2026.",
        ],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "fb-einbringung-haushalt-2027",
    title: "Einbringung des Haushaltsplanentwurfs 2027 in den Rat",
    kind: "Präsentation",
    fileName: "2026-09-24 Einbringung Haushaltsplanentwurf 2027 Rat",
    org: "falkenbrueck",
    unit: "fb-amt20",
    author: "fb-nowak",
    date: "2026-09-24",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Haushaltssicherungskonzept", "1.112,4 Mio. €", "Hebesatz", "42,9 Mio. €", "03.12.2026"],
    summary:
      "Präsentation der Stadtkämmerin zur Einbringung des Haushaltsentwurfs 2027 mit Eckdaten, Diagrammen zu Jahresergebnissen, Erträgen, Zuschussbedarfen und Investitionen sowie Zeitplan. Eingebaute Widersprüche: Folie 2 nennt einen Fehlbetrag von 42,9 Mio. € (Diagramm und Tabelle: 44,7 Mio. €) und widerspricht sich beim Zeitpunkt, zu dem die Ausgleichsrücklage aufgebraucht ist.",
    slides: [
      { t: "title", title: "Haushaltsplanentwurf 2027", subtitle: "Einbringung in den Rat am 24.09.2026 · Dr. Ewa Nowak, Stadtkämmerin" },
      {
        t: "bullets",
        title: "Das Wichtigste in Kürze",
        bullets: [
          "Ordentliche Erträge: **1.112,4 Mio. €** – ordentliche Aufwendungen: **1.145,4 Mio. €**",
          "Fehlbetrag 2027: **42,9 Mio. €**",
          "Die Ausgleichsrücklage ist Ende 2026 aufgebraucht",
          { text: "Haushaltssicherungskonzept wird erforderlich", sub: ["allgemeine Rücklage sinkt 2027 um 6,5 %", "Pflicht nach der Kommunalverfassung bei mehr als 5 % in zwei Jahren"] },
          "Investitionen: 141,8 Mio. €, davon 83,4 Mio. € über Kredite",
        ],
        notes: "Zahlen aus dem Eckdatenblatt vom 04.09.2026. Bitte langsam vortragen – die Presse schreibt mit.",
      },
      {
        t: "chart",
        title: "Jahresergebnisse 2025 bis 2030",
        chart: {
          type: "bar",
          categories: ["2025 (Ergebnis)", "2026 (Prognose)", "2027 (Entwurf)", "2028", "2029", "2030"],
          series: [{ name: "Jahresergebnis", values: [-35.8, -47.3, -44.7, -45.3, -39.8, -31.1] }],
          unit: "Mio. €",
        },
        caption: "2026: Prognose nach haushaltswirtschaftlicher Sperre; ohne Sperre minus 61,3 Mio. €",
        notes: "Wichtig: Auch 2030 erreichen wir nach heutiger Planung keinen Ausgleich. Die Finanzplanung enthält noch keine Konsolidierungsmaßnahmen aus dem Haushaltssicherungskonzept.",
      },
      {
        t: "chart",
        title: "Woher kommt das Geld? Erträge 2027",
        chart: {
          type: "pie",
          categories: ["Steuern", "Allgemeine Zuweisungen", "Konzessionsabgaben und Gewinnausschüttung", "Erträge der Fachämter"],
          series: [{ name: "Erträge 2027", values: [422.1, 339.6, 25.4, 325.3] }],
          unit: "Mio. €",
        },
        notes: "Erträge der Fachämter sind vor allem Kostenerstattungen und Zuweisungen im Sozialbereich, Gebühren (Rettungsdienst, Abfall, Bürgeramt) und Mieten.",
      },
      {
        t: "chart",
        title: "Die größten Zuschussbedarfe 2027",
        chart: {
          type: "bar",
          categories: ["Soziales", "Schulen", "Jugend", "Feuerwehr und Rettungsdienst", "Personal und Organisation", "Tiefbau und Verkehr"],
          series: [
            { name: "Ansatz 2026", values: [93.4, 75.9, 68.4, 47.2, 46.3, 47.1] },
            { name: "Entwurf 2027", values: [98.3, 78.4, 72.9, 50.5, 49.1, 48.9] },
          ],
          unit: "Mio. €",
        },
      },
      {
        t: "table",
        title: "Was sich gegenüber 2026 verändert",
        header: ["Bereich", "Veränderung", "Ursache"],
        rows: [
          ["Steuern und allgemeine Zuweisungen (TH 20)", "+ 24,2 Mio. €", "Gewerbesteuer nach Erstattungen 2026, Hebesatz 490 %, Schlüsselzuweisungen"],
          ["Soziales (TH 50)", "– 4,9 Mio. €", "Eingliederungshilfe, Hilfe zur Pflege"],
          ["Jugend (TH 51)", "– 4,5 Mio. €", "Hilfen zur Erziehung stationär, Kita Kiebitzweg"],
          ["Feuerwehr (TH 37)", "– 3,3 Mio. €", "Brandschutzbedarfsplan, erste zusätzliche Stellen"],
          ["Personal und Organisation (TH 11)", "– 2,8 Mio. €", "Versorgung und Beihilfe"],
          ["Zinsen", "– 2,4 Mio. €", "höhere Liquiditätskredite"],
        ],
        notes: "Vorzeichen aus Sicht des Ergebnisses: plus = Verbesserung, minus = Verschlechterung.",
      },
      {
        t: "bullets",
        title: "Gewerbesteuer und Hebesatz",
        bullets: [
          "Gewerbesteuer 2026: Prognose 186,8 Mio. € statt 204,0 Mio. € (Erstattungen nach Betriebsprüfungen)",
          "Entwurf 2027: 207,5 Mio. €",
          { text: "Vorschlag: Hebesatz von 470 % auf 490 %", sub: ["Mehrertrag rund 8,8 Mio. € jährlich", "Grundsteuer B bleibt bei 595 %"] },
          "Gespräche mit Unternehmen über die Wirtschaftsförderung sind geplant",
        ],
        notes: "Die Anhebung ist Teil des Haushaltssicherungskonzepts. Mit der Wirtschaftsförderung (Herr Voß) ist ein Unternehmerfrühstück im Oktober vereinbart.",
      },
      {
        t: "bullets",
        title: "Haushaltssicherung: Wie geht es weiter?",
        bullets: [
          "Die Ausgleichsrücklage reicht noch bis Ende 2027 – danach greift die allgemeine Rücklage",
          "Ziel: Fehlbetrag bis 2030 um mindestens ein Drittel senken",
          { text: "Bausteine des Haushaltssicherungskonzepts", sub: ["Aufgabenkritik in allen Dezernaten", "Wiederbesetzungssperre von sechs Monaten bleibt", "Gebühren und Entgelte prüfen (z. B. Sondernutzung)", "Digitalisierung zur Entlastung des Personals"] },
          "Haushaltssicherungskonzept wird mit dem Haushalt im Dezember beschlossen",
        ],
      },
      {
        t: "chart",
        title: "Investitionen 2027 nach Bereichen",
        chart: {
          type: "bar",
          categories: ["Schulen", "Straßen und Brücken", "Kitas", "Feuerwehr", "Digitalisierung", "Sonstiges"],
          series: [{ name: "Investive Auszahlungen 2027", values: [46.2, 31.5, 12.4, 9.8, 6.7, 35.2] }],
          unit: "Mio. €",
        },
        caption: "Summe 141,8 Mio. € · Kitas einschließlich Neubau Kiebitzweg · Feuerwehr einschließlich Planung Feuerwache 3",
      },
      {
        t: "table",
        title: "Zeitplan der Haushaltsberatungen",
        header: ["Termin", "Schritt"],
        rows: [
          ["24.09.2026", "Einbringung in den Rat"],
          ["bis 02.10.2026", "Versand der Teilhaushalte an die Fraktionen"],
          ["05.10. bis 29.10.2026", "Beratung in den Fachausschüssen"],
          ["12.11.2026", "Haupt- und Finanzausschuss (Änderungsliste)"],
          ["03.12.2026", "Beschluss des Rates über Haushalt und Haushaltssicherungskonzept"],
          ["Dezember 2026", "Vorlage bei der Kommunalaufsicht (MKV)"],
        ],
      },
      { t: "end", title: "Vielen Dank für Ihre Aufmerksamkeit", lines: ["Dr. Ewa Nowak · Stadtkämmerin", "Telefon 069 90009-200"] },
    ],
  },
  {
    type: "excel",
    id: "fb-trauungen-juni-2026-terminliste",
    title: "Standesamt – Terminliste Trauungen Juni 2026 mit Gebühren",
    kind: "Terminliste",
    fileName: "Standesamt Trauungen Juni 2026 Terminliste Gebuehren",
    org: "falkenbrueck",
    unit: "fb-amt34",
    author: "fb-wendland",
    date: "2026-05-27",
    tags: ["personendaten"],
    keywords: ["Alte Mühle", "Orangerie", "Zuschlag Samstag", "ausländischen Rechts", "Trauzimmer Rathaus"],
    summary:
      "Interne Terminliste des Standesamts für zehn Trauungen im Juni 2026 mit Namen und Geburtsdaten der Eheschließenden, Trauort, zuständiger Standesbeamtin und Gebühren samt Zahlungsstand. Gut zum Anonymisieren und für Rechen- und Sortierübungen.",
    sheets: [
      {
        name: "Trauungen Juni",
        title: "Trauungen Juni 2026",
        subtitle: "Stand 27.05.2026 · nur für den Dienstgebrauch",
        columns: [
          { header: "Datum", width: 11, fmt: "date" },
          { header: "Uhrzeit", width: 7 },
          { header: "Trauort", width: 17 },
          { header: "Eheschließende", width: 34 },
          { header: "geboren", width: 22 },
          { header: "Standesbeamtin", width: 12 },
          { header: "Gebühr", width: 9, fmt: "eur0" },
          { header: "Zuschlag Trauort", width: 10, fmt: "eur0" },
          { header: "Zuschlag Samstag", width: 10, fmt: "eur0" },
          { header: "Summe", width: 9, fmt: "eur0" },
          { header: "Zahlung", width: 9 },
        ],
        rows: [
          [{ date: "2026-06-05" }, "10:00", "Trauzimmer Rathaus", "Lukas Venhaus / Sarah Abiodun", "14.02.1993 / 30.07.1995", "Wendland", 85, 0, 0, { f: "G{r}+H{r}+I{r}" }, "bezahlt"],
          [{ date: "2026-06-05" }, "11:30", "Trauzimmer Rathaus", "Pjotr Lewandowski / Sandra Kühnert", "03.11.1988 / 21.05.1990", "Wendland", 120, 0, 0, { f: "G{r}+H{r}+I{r}" }, "bezahlt"],
          [{ date: "2026-06-06" }, "11:00", "Alte Mühle", "Jonas Wittenborg / Lea-Marie Uhlenbrock", "09.09.1996 / 17.01.1997", "Busch", 85, 250, 100, { f: "G{r}+H{r}+I{r}" }, "offen"],
          [{ date: "2026-06-06" }, "13:30", "Alte Mühle", "Thomas Hilgendorf / Michael Brede", "28.06.1979 / 02.12.1981", "Busch", 85, 250, 100, { f: "G{r}+H{r}+I{r}" }, "bezahlt"],
          [{ date: "2026-06-12" }, "10:30", "Trauzimmer Rathaus", "Emre Yavuzer / Derya Sönmez", "11.04.1994 / 05.08.1996", "Reuß", 85, 0, 0, { f: "G{r}+H{r}+I{r}" }, "bezahlt"],
          [{ date: "2026-06-13" }, "12:00", "Orangerie Stadtpark", "Dr. Felix Amsinck / Nora Steinhövel", "19.10.1985 / 23.03.1987", "Wendland", 85, 300, 100, { f: "G{r}+H{r}+I{r}" }, "offen"],
          [{ date: "2026-06-19" }, "11:00", "Trauzimmer Rathaus", "Kevin Rohwedder / Jennifer Plaß", "07.07.1991 / 14.12.1992", "Reuß", 85, 0, 0, { f: "G{r}+H{r}+I{r}" }, "bezahlt"],
          [{ date: "2026-06-20" }, "14:00", "Orangerie Stadtpark", "Yusuf Taşkın / Leonie Haberkorn", "25.01.1990 / 08.06.1993", "Busch", 120, 300, 100, { f: "G{r}+H{r}+I{r}" }, "bezahlt"],
          [{ date: "2026-06-26" }, "10:00", "Trauzimmer Rathaus", "Malte Ostermeyer / Svenja Grünhagen", "30.04.1998 / 12.10.1999", "Reuß", 85, 0, 0, { f: "G{r}+H{r}+I{r}" }, "offen"],
          [{ date: "2026-06-27" }, "11:30", "Alte Mühle", "Henrik Bödeker / Miriam Tschentscher", "16.08.1984 / 01.02.1986", "Wendland", 85, 250, 100, { f: "G{r}+H{r}+I{r}" }, "bezahlt"],
          {
            total: true,
            cells: [null, "", "Anzahl / Summe", { f: "COUNTA(D{first}:D{last})" }, "", "", { f: "SUM(G{first}:G{last})" }, { f: "SUM(H{first}:H{last})" }, { f: "SUM(I{first}:I{last})" }, { f: "SUM(J{first}:J{last})" }, ""],
          },
        ],
        notes: [
          "Gebühr 120 € bei Prüfung ausländischen Rechts (Lewandowski, Taşkın). Zuschlag Trauort: Alte Mühle 250 €, Orangerie 300 €.",
          "Zahlung offen: Erinnerung zwei Wochen vor dem Termin; Kartenzahlung vor Ort nur im Rathaus (Prüfbericht RPA 2025, F1).",
        ],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "fb-digitalisierungsstrategie-2030",
    title: "Digitalisierungsstrategie 2030 – Entwurf für den Verwaltungsvorstand",
    kind: "Präsentation",
    fileName: "2025-12-09 Digitalisierungsstrategie 2030 Entwurf Verwaltungsvorstand",
    org: "falkenbrueck",
    unit: "fb-amt12",
    author: "fb-yildiz",
    date: "2025-12-09",
    tags: [],
    keywords: ["Digitalisierungsstrategie 2030", "Ende-zu-Ende", "E-Akte", "Digitale Kommune", "31.03.2026"],
    summary:
      "Entwurf der Digitalisierungsstrategie mit Ausgangslage, sechs Handlungsfeldern, messbaren Zielen 2030, Mittelbedarf, Grundsätzen für KI und Roadmap. Gut für Kurzfassungen, Fragenkataloge des Personalrats und den Abgleich der Ziele mit dem Mittelbedarf.",
    slides: [
      { t: "title", title: "Digitalisierungsstrategie 2030", subtitle: "Entwurf für den Verwaltungsvorstand am 09.12.2025 · Amt 12 – Digitalisierung und IT" },
      {
        t: "bullets",
        title: "Ausgangslage",
        bullets: [
          "Rund 4.300 Beschäftigte, rund 3.950 IT-Arbeitsplätze, eigene IT (Amt 12, 71 Stellen, davon 6 unbesetzt)",
          { text: "46 Onlinedienste – aber nur 19 Ende-zu-Ende digital", sub: ["bei 27 Diensten wird der Online-Antrag ausgedruckt und auf Papier weiterbearbeitet"] },
          "E-Akte in 9 von 22 Ämtern",
          "IT-Aufwand 2026: rund 27,9 Mio. € (Teilhaushalt 12)",
          "Zwei-Faktor-Anmeldung bisher bei 58 % der Konten",
        ],
        notes: "Die Zahl der Onlinedienste klingt gut, die Ende-zu-Ende-Quote ist der eigentliche Engpass. Bitte darauf den Schwerpunkt legen.",
      },
      {
        t: "chart",
        title: "Online gestellte Anträge",
        chart: {
          type: "line",
          categories: ["2022", "2023", "2024", "2025 (Prognose)"],
          series: [{ name: "Anträge über das Bürgerportal", values: [18400, 31200, 48900, 67300] }],
          unit: "Anträge",
        },
        caption: "Quelle: Bürgerportal, Auswertung Amt 12, Stand 30.11.2025",
      },
      {
        t: "bullets",
        title: "Sechs Handlungsfelder",
        bullets: [
          "**Onlinedienste Ende-zu-Ende:** vom Antrag bis zum Bescheid ohne Medienbruch",
          "**E-Akte flächendeckend** bis 2028",
          "**Infrastruktur und Informationssicherheit:** Zwei-Faktor-Anmeldung für alle, Notfallmanagement, zweites Rechenzentrum",
          "**Daten und Steuerung:** Kennzahlen-Dashboard für Verwaltungsvorstand und Ämter",
          "**KI verantwortungsvoll nutzen:** Pilot im Bürgeramt, klare Regeln",
          "**Kompetenzen und Kultur:** Qualifizierung aller Beschäftigten, Digitallotsen in jedem Amt",
        ],
      },
      {
        t: "table",
        title: "Ziele 2030 und Kennzahlen",
        header: ["Kennzahl", "Ist 2025", "Ziel 2030"],
        rows: [
          ["Onlinedienste Ende-zu-Ende", "19", "80"],
          ["Ämter mit E-Akte", "9 von 22", "22 von 22"],
          ["Anteil online gestellter Anträge", "21 %", "60 %"],
          ["Konten mit Zwei-Faktor-Anmeldung", "58 %", "100 % (bis Ende 2026)"],
          ["Beschäftigte mit Grundqualifizierung Digitalkompetenz", "34 %", "90 %"],
        ],
        notes: "Die Ziele sind bewusst ambitioniert. Für die Ende-zu-Ende-Dienste sind wir auf Fachverfahren angewiesen, die das Land bereitstellt.",
      },
      {
        t: "chart",
        title: "Investiver Mittelbedarf 2026 bis 2030",
        chart: {
          type: "bar",
          categories: ["2026", "2027", "2028", "2029", "2030"],
          series: [
            { name: "Mittelbedarf gesamt", values: [4.1, 6.7, 7.2, 6.4, 5.8] },
            { name: "davon erwartete Förderung", values: [2.2, 3.9, 4.3, 3.6, 3.1] },
          ],
          unit: "Mio. €",
        },
        caption: "Förderung aus dem Landesprogramm „Digitale Kommune“ (Förderquote bis 75 %), Anträge jeweils bis 31.03.",
      },
      {
        t: "twocol",
        title: "Chancen und Risiken",
        left: { heading: "Chancen", bullets: ["Entlastung bei Fachkräftemangel", "bessere Erreichbarkeit für Bürgerinnen und Bürger", "Förderung des Landes nutzen"] },
        right: {
          heading: "Risiken",
          bullets: ["unbesetzte Stellen in Amt 12", "Haushaltslage und mögliche Sperren", "Abhängigkeit von Herstellern der Fachverfahren", "Überforderung der Ämter durch zu viele Projekte gleichzeitig"],
        },
      },
      {
        t: "bullets",
        title: "Grundsätze für den Einsatz von KI",
        bullets: [
          "Orientierung am KI-Leitfaden der Landesverwaltung (November 2025)",
          "Kein Einsatz ohne Datenschutz-Folgenabschätzung und Beteiligung des Personalrats",
          "Menschen entscheiden – KI unterstützt",
          "Transparenz gegenüber Bürgerinnen und Bürgern",
          "Erst Pilot, dann Ausweitung: KI-Assistent im Bürgeramt März bis Juni 2026",
        ],
        notes: "Die Datenschutz-Folgenabschätzung für den Bürgeramts-Piloten läuft, Ergebnis im Januar.",
      },
      {
        t: "table",
        title: "Roadmap",
        header: ["Jahr", "Schwerpunkte"],
        rows: [
          ["2026", "Zwei-Faktor-Anmeldung für alle, E-Akte in 5 weiteren Ämtern, KI-Pilot Bürgeramt, Förderantrag"],
          ["2027", "15 weitere Ende-zu-Ende-Dienste, Kennzahlen-Dashboard, zweites Rechenzentrum (Planung)"],
          ["2028", "E-Akte in allen Ämtern, zweites Rechenzentrum in Betrieb"],
          ["2029–2030", "restliche Onlinedienste, Evaluation und Fortschreibung"],
        ],
      },
      {
        t: "bullets",
        title: "Beschlussvorschlag für den Verwaltungsvorstand",
        bullets: [
          "Der Verwaltungsvorstand nimmt den Entwurf zustimmend zur Kenntnis",
          "Beteiligung des Gesamtpersonalrats im Januar 2026",
          "Förderantrag „Digitale Kommune“ bis 31.03.2026",
          "Vorlage an den Rat im zweiten Quartal 2026",
        ],
      },
      { t: "end", title: "Fragen und Diskussion", lines: ["Murat Yıldız · Amtsleiter Digitalisierung und IT", "Telefon 069 90009-121"] },
    ],
  },
  {
    type: "powerpoint",
    id: "fb-gleichstellungsbericht-2024",
    title: "Gleichstellungsbericht 2024 – Kurzvorstellung",
    kind: "Präsentation",
    fileName: "2025-05-20 Gleichstellungsbericht 2024 Kurzvorstellung HFA",
    org: "falkenbrueck",
    unit: "fb-gleich",
    author: "fb-ahrens",
    date: "2025-05-20",
    tags: ["zahlen"],
    keywords: ["Gleichstellungsplan", "Frauenanteil", "Führen in Teilzeit", "Teilzeitquote"],
    summary:
      "Kurze Präsentation der Gleichstellungsbeauftragten mit Frauenanteilen nach Hierarchieebene, Teilzeitquoten und Zielerreichung des Gleichstellungsplans. Gut zum Ableiten von Kernaussagen und als Datenbasis für einen Bericht.",
    slides: [
      { t: "title", title: "Gleichstellungsbericht 2024", subtitle: "Haupt- und Finanzausschuss · Silke Ahrens, Gleichstellungsbeauftragte" },
      {
        t: "chart",
        title: "Frauenanteil nach Ebene (31.12.2024)",
        chart: {
          type: "bar",
          categories: ["Beschäftigte gesamt", "Sachbearbeitung", "Sachgebietsleitungen", "Amtsleitungen", "Dezernatsleitungen"],
          series: [{ name: "Frauenanteil", values: [61, 64, 52, 50, 50] }],
          unit: "%",
        },
        notes: "Amtsleitungen: 11 von 22. Bei Stellen ab Entgeltgruppe 13 bzw. Besoldungsgruppe A 13 liegt der Frauenanteil nur bei 44 %.",
      },
      {
        t: "table",
        title: "Teilzeit und Führung",
        header: ["Kennzahl", "Frauen", "Männer"],
        rows: [
          ["Teilzeitquote", "41 %", "8 %"],
          ["Führungskräfte in Teilzeit", "5", "1"],
          ["Mobiles Arbeiten (Vereinbarungen)", "43 %", "31 %"],
        ],
        notes: "Von 214 Führungskräften arbeiten nur sechs in Teilzeit.",
      },
      {
        t: "table",
        title: "Ziele des Gleichstellungsplans 2022–2026",
        header: ["Ziel bis 2026", "Stand 2024"],
        rows: [
          ["50 % Frauen in Amtsleitungen", "erreicht"],
          ["Führen in Teilzeit in jedem Dezernat", "in 2 von 6 Dezernaten"],
          ["20 % Frauen in der Ausbildung Feuerwehr", "9 %"],
        ],
      },
      {
        t: "bullets",
        title: "Vorschläge",
        bullets: ["Führungspositionen grundsätzlich auch in Teilzeit ausschreiben", "Mentoring für Frauen ab Entgeltgruppe 11", "Teamtage beim mobilen Arbeiten nicht auf Freitag legen"],
      },
      { t: "end", title: "Vielen Dank!", lines: ["Silke Ahrens · Gleichstellungsbeauftragte"] },
    ],
  },
  {
    type: "powerpoint",
    id: "fb-haendlerforum-altstadt-2025",
    title: "Händlerforum Altstadt – Ergebnisse und Ideensammlung",
    kind: "Präsentation",
    fileName: "2025-06-17 Haendlerforum Altstadt Ergebnisse Ideensammlung",
    org: "falkenbrueck",
    unit: "fb-wifoe",
    author: "fb-kirchhoff",
    date: "2025-06-17",
    tags: ["unstrukturiert"],
    keywords: ["Händlerforum", "Ladenlokal auf Probe", "Leerstandskataster", "Marktstraße 5"],
    summary:
      "Kurze Präsentation der Citymanagerin mit O-Tönen und ungeordneter Ideensammlung aus einem Forum mit Altstadthändlern. Gut zum Clustern, Priorisieren und Ableiten eines Maßnahmenplans.",
    slides: [
      { t: "title", title: "Händlerforum Altstadt", subtitle: "Ergebnisse vom 12.06.2025 · Citymanagement" },
      {
        t: "bullets",
        title: "Zahlen vorab",
        bullets: ["41 Teilnehmende, davon 29 Händlerinnen und Händler", "23 von 186 Ladenlokalen leer (12,4 %)", "Passanten Marktstraße samstags: minus 9 % gegenüber 2023"],
        notes: "Leerstand aus eigener Begehung am 02.06.2025.",
      },
      {
        t: "bullets",
        title: "Was wir gehört haben",
        bullets: [
          "„Samstags ist die Stadt voll, unter der Woche tote Hose.“",
          "„Parken ist zu teuer.“",
          "„Die Regeln für Außengastronomie versteht keiner.“",
          "„Marktstraße 5 steht fast ein Jahr leer – und das gehört der Stadt!“",
          "„Die Baustelle Brückenstraße hat uns drei Monate Umsatz gekostet.“",
        ],
        notes: "Zitate wörtlich von den Moderationskarten übernommen.",
      },
      {
        t: "bullets",
        title: "Ideensammlung (ungeordnet)",
        bullets: [
          "Pop-up-Läden in Leerständen, auch in städtischen",
          "Probemiete sechs Monate",
          "Falkenbrück-Gutschein",
          "Schaufenster-Kunst in leeren Läden",
          "Donnerstags Abendöffnung bis 21 Uhr?",
          "Online-Antrag für Sondernutzung",
          "Händler beim Altstadtfest einbinden",
        ],
      },
      {
        t: "bullets",
        title: "Nächste Schritte",
        bullets: [
          "Leerstandskataster bis September",
          "Gespräch mit Amt 23 zu Marktstraße 5",
          "Konzept „Ladenlokal auf Probe“ bis Oktober",
          "Nächstes Händlerforum im November",
        ],
      },
      { t: "end", title: "Danke fürs Mitmachen!", lines: ["Lena Kirchhoff · Citymanagerin"] },
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
  {
    id: "fb-beteiligung-gpr-mobiles-arbeiten",
    title: "Beteiligung des Gesamtpersonalrats zur Dienstvereinbarung Mobiles Arbeiten",
    subject: "Zustimmungsantrag: Dienstvereinbarung Mobiles Arbeiten (Az. 11.2-010.31/26)",
    org: "falkenbrueck",
    unit: "fb-gpr",
    date: "2026-03-05",
    tags: [],
    keywords: ["11.2-010.31/26", "Ausstattungspauschale", "Teamtag", "Erörterung", "12.03.2026"],
    summary:
      "Das Personalamt legt dem Gesamtpersonalrat den Entwurf der Dienstvereinbarung Mobiles Arbeiten vor (Anhang); Gesamtpersonalrat und Gleichstellungsbüro fordern Änderungen, das Personalamt kommt teilweise entgegen und lädt zur Erörterung. Geeignet für Synopsen (Forderung – Antwort – offen) und für den Abgleich mit dem Anhang.",
    mails: [
      {
        from: "fb-schuster",
        to: ["fb-wiesner"],
        cc: ["fb-kessler", "fb-ahrens", "fb-kuhn"],
        date: "2026-02-10T10:22",
        attachments: ["fb-dienstvereinbarung-mobiles-arbeiten"],
        body: `Sehr geehrte Frau Wiesner,

im Auftrag der Oberbürgermeisterin übersende ich Ihnen den Entwurf der Dienstvereinbarung über mobiles Arbeiten (Az. 11.2-010.31/26) und beantrage die Zustimmung des Gesamtpersonalrats nach dem LPersVG.

Die wichtigsten Änderungen gegenüber der Übergangsregelung von 2022:
- Umfang bis zu drei Tage je Woche (Vollzeit) bzw. 60 Prozent der Arbeitszeit (Teilzeit), bisher 50 Prozent
- verpflichtender Teamtag mit Präsenz
- Kernerreichbarkeit einheitlich geregelt
- neue Clearingstelle für Streitfälle
- Ausschluss von Leistungs- und Verhaltenskontrollen ausdrücklich geregelt (§ 14)

Die Frist für Ihre Stellungnahme endet nach unserer Berechnung am 24.02.2026. Für eine Erörterung stehe ich gemeinsam mit Herrn Keßler gern zur Verfügung. Ziel ist weiterhin das Inkrafttreten zum 01.05.2026.

Frau Ahrens und Frau Kuhn erhalten den Entwurf zur Beteiligung des Gleichstellungsbüros bzw. der Stabsstelle Datenschutz in Kopie.

Mit freundlichen Grüßen
Andrea Schuster`,
      },
      {
        from: "fb-wiesner",
        to: ["fb-schuster"],
        cc: ["fb-kessler", "fb-ahrens", "fb-kuhn"],
        date: "2026-02-24T16:05",
        body: `Sehr geehrte Frau Schuster,

der Gesamtpersonalrat hat den Entwurf in seiner Sitzung am 23.02.2026 beraten. Wir begrüßen ausdrücklich, dass die Übergangsregelung endlich abgelöst wird und der Umfang steigt. In der vorliegenden Fassung können wir **nicht zustimmen**. Unsere Einwendungen im Einzelnen:

1. **§ 5 Abs. 1 (Umfang):** Die starre Grenze von drei Tagen je Woche passt nicht zu Beschäftigten mit ungleichmäßig verteilter Arbeitszeit. Wir schlagen einheitlich 60 Prozent der individuellen Arbeitszeit ohne Tagesgrenze vor.

2. **§ 7 Abs. 3 (Kernerreichbarkeit):** Montag bis Donnerstag bis 15:00 Uhr ist faktisch eine Präsenzpflicht am Telefon über fast den ganzen Tag. Vorschlag: 9:00 bis 12:00 Uhr, nachmittags nach Teamabsprache.

3. **§ 12 (Kosten):** Ein „Prüfauftrag bis Ende 2026“ reicht uns nicht. Die Beschäftigten tragen Strom, Heizung und Möbel seit sechs Jahren selbst. Wir fordern eine **Ausstattungspauschale** von einmalig 150 Euro oder wenigstens die Ausleihe ergonomischer Bürostühle.

4. **§ 14 Abs. 2:** „Beteiligung“ des Gesamtpersonalrats bei einer Auswertung wegen Verdachts reicht nicht. Hier muss die **Zustimmung** des Gesamtpersonalrats stehen.

5. **§ 15 Abs. 3:** Eine Anordnung zur Präsenz „am Vortag bis 15:00 Uhr“ ist für Beschäftigte mit Kindern oder Pflegeaufgaben nicht zumutbar. Wir fordern mindestens zwei Arbeitstage Vorlauf, außer in echten Notfällen.

6. **§ 20:** Die Antragsfrist 31.07.2026 liegt mitten in den Sommerferien. Bitte auf 31.08.2026 verschieben.

7. **Widerspruch im Entwurf:** Nach § 13 Abs. 3 gilt für Führungskräfte § 5 entsprechend, nach **Anlage 3** wird für Führungsaufgaben aber „Präsenz an mindestens zwei Tagen je Woche“ empfohlen. Was gilt denn nun?

Außerdem bitten wir um Vorlage der Gefährdungsbeurteilung nach § 10 Abs. 1, auf die der Entwurf verweist. Sie liegt uns bisher nicht vor.

Wir beantragen die Erörterung nach dem LPersVG.

Mit freundlichen Grüßen
Sandra Wiesner
für den Gesamtpersonalrat`,
      },
      {
        from: "fb-ahrens",
        to: ["fb-schuster"],
        cc: ["fb-wiesner", "fb-kessler"],
        date: "2026-02-26T09:12",
        body: `Liebe Frau Schuster,

aus Sicht des Gleichstellungsbüros noch drei Punkte, die die Einwendungen des Gesamtpersonalrats ergänzen:

- **Teamtag:** Bitte im Entwurf festhalten, dass der Teamtag nicht auf einen Freitag gelegt werden soll. Ein großer Teil unserer Teilzeitkräfte – ganz überwiegend Frauen – arbeitet freitags nicht. Sonst sind genau diese Kolleginnen bei jeder Teambesprechung außen vor.
- **Kernerreichbarkeit:** Ich unterstütze den Vorschlag 9:00 bis 12:00 Uhr.
- **§ 19 Evaluation:** Die Auswertung sollte ausdrücklich nach Geschlecht, Teilzeit/Vollzeit und Entgeltgruppe erfolgen. Nur so sehen wir, ob mobiles Arbeiten Karrieren bremst. In der Befragung 2025 gaben Teilzeitkräfte deutlich häufiger an, „weniger mitzubekommen“.

Gern bin ich bei der Erörterung dabei.

Viele Grüße
Silke Ahrens`,
      },
      {
        from: "fb-schuster",
        to: ["fb-wiesner"],
        cc: ["fb-kessler", "fb-ahrens", "fb-kuhn"],
        date: "2026-03-05T14:40",
        body: `Sehr geehrte Frau Wiesner,

vielen Dank für die ausführliche Stellungnahme, auch an Frau Ahrens. Der Verwaltungsvorstand hat die Punkte am 03.03.2026 beraten. Vorbehaltlich der Erörterung kann ich Ihnen Folgendes zusagen:

**Wird übernommen:**
- Anlage 3: Der Hinweis „Präsenz an mindestens zwei Tagen“ für Führungsaufgaben entfällt; es gilt § 5. Danke für den Hinweis, das war ein Überbleibsel aus einer früheren Fassung.
- § 14 Abs. 2: „Zustimmung“ statt „Beteiligung“ des Gesamtpersonalrats.
- § 15 Abs. 3: Anordnung mit zwei Arbeitstagen Vorlauf, in dringenden Fällen am Vortag.
- § 20: Antragsfrist 31.08.2026.
- § 19: Auswertung nach Geschlecht, Teilzeit/Vollzeit und Entgeltgruppe.
- § 5 Abs. 3: Der Teamtag soll nicht auf einen Freitag fallen.

**Kompromissvorschlag:**
- § 7 Abs. 3: Kernerreichbarkeit Montag bis Freitag 9:00 bis 12:00 Uhr, Montag bis Donnerstag zusätzlich 13:30 bis 14:30 Uhr.

**Nicht möglich:**
- Eine Ausstattungspauschale ist bei einem geplanten Fehlbetrag von 38,6 Mio. € im Haushalt 2026 nicht darstellbar. Amt 11 kann aber ab Mai rund 120 ergonomische Bürostühle aus der Flächenreduzierung im Verwaltungsgebäude Am Hafen leihweise abgeben. Das würden wir in § 12 aufnehmen.
- Bei § 5 Abs. 1 möchte der Verwaltungsvorstand an der Tagesgrenze für Vollzeitkräfte festhalten. Darüber sollten wir in der Erörterung sprechen.

Die Gefährdungsbeurteilung wird derzeit mit dem Betriebsärztlichen Dienst abgestimmt und geht Ihnen bis 10.03. zu.

Als Termin für die Erörterung schlage ich **Donnerstag, 12.03.2026, 10:00 Uhr**, Rathaus Raum 1.08, vor. Herr Keßler nimmt teil. Realistisch wird das Inkrafttreten dann eher der 01.06.2026 als der 01.05.

Mit freundlichen Grüßen
Andrea Schuster`,
      },
    ],
  },
  {
    id: "fb-beschwerde-cafe-am-markt-altstadtfest",
    title: "Beschwerde Café am Markt über Anhörung wegen Außengastronomie beim Altstadtfest",
    subject: "Beschwerde !!! Anhörung Ordnungswidrigkeit Altstadtfest",
    org: "falkenbrueck",
    unit: "fb-amt32",
    date: "2025-09-04",
    tags: ["widersprueche", "unstrukturiert"],
    keywords: ["SN-2025-0318", "Feuerwehrzufahrt", "41 m²", "Allgemeinverfügung", "15.09.2025"],
    summary:
      "Ein Gastronom beschwert sich emotional über eine Anhörung wegen Überschreitung der Außengastronomiefläche und Gläsern beim Altstadtfest; der Kommunale Ordnungsdienst liefert Stichpunkte aus dem Einsatzprotokoll, das Ordnungsamt antwortet sachlich. Die Darstellungen von Inhaber und Ordnungsdienst widersprechen sich (Zahl der Tische, Gläser, Ton der Kontrolle).",
    mails: [
      {
        from: "ext-erdem",
        to: ["fb-sommer"],
        cc: ["fb-lassberg"],
        date: "2025-08-31T22:14",
        body: `Sehr geehrte Frau Sommer,

ich habe heute ihren Anhörungsbogen vom 27.08. gelesen und ich bin ehrlich gesagt fassungslos. Ich soll eine Ordnungswidrigkeit begangen haben weil ich beim Altstadtfest angeblich die Fläche überschritten und Gläser rausgegeben habe und jetzt droht man mir ein Bußgeld von 400 Euro an?!

Ich bin seit 14 Jahren am Markt, ich zahle jedes Jahr meine Sondernutzungsgebühr (432 Euro!!) und meine Steuern und dann kommen am Samstag abend zwei von ihren Leuten vom Ordnungsdienst und behandeln mich vor meinen Gästen wie einen Verbrecher.

Zur Sache: es standen ZWEI Tische mehr draußen, weil eine große Familie gekommen ist, die wollte zusammen sitzen. Das war für eine Stunde. Getränke gab es draußen in Plastikbechern, nur Wein im Glas weil Wein aus Plastik kann man keinem Gast anbieten. Die Eisdiele nebenan hatte genauso Tische draußen und da hat keiner was gesagt.

Ich erwarte dass das Verfahren eingestellt wird. Sonst gehe ich zum Stadtanzeiger, die interessiert das bestimmt wie die Stadt mit den Gastronomen in der Altstadt umgeht während überall Läden leer stehen.

Frau Oberbürgermeisterin, ich setze Sie in Kopie weil ich finde Sie sollten wissen was in ihrer Stadt passiert.

Hakan Erdem
Café am Markt`,
      },
      {
        from: "fb-sommer",
        to: ["fb-wolff"],
        cc: ["fb-dietrich"],
        date: "2025-09-01T08:47",
        subject: "WG: Beschwerde !!! Anhörung Ordnungswidrigkeit Altstadtfest",
        body: `Hallo Patrick,

siehe unten, Herr Erdem vom Café am Markt (Sondernutzungserlaubnis SN-2025-0318). Die OB ist in Kopie, das Büro hat schon nach einer Antwort gefragt.

Kannst du mir bitte bis heute Mittag die wichtigsten Punkte aus dem Einsatzprotokoll vom 23.08. schicken? Vor allem:
- wie viele Tische/Stühle außerhalb der genehmigten Fläche
- Gläser ja/nein
- wie lief das Gespräch mit ihm
- was war mit der Eisdiele?

Danke dir!
Jana`,
      },
      {
        from: "fb-wolff",
        to: ["fb-sommer"],
        cc: ["fb-dietrich"],
        date: "2025-09-01T13:20",
        body: `Hi Jana,

hier aus dem Protokoll (Streife KOD 2, Dienstnummern 14 und 22), Fotos liegen auf dem Laufwerk unter KOD/2025/08:

- Sa 23.08., 21:40 Uhr, Café am Markt, Marktplatz 7
- genehmigt lt. SN-2025-0318: 24 m² (4 Tische, 16 Stühle)
- vorgefunden: ca. 41 m², 6 zusätzliche Tische + 2 Bierbänke, Bänke bis direkt an die Markierung der Feuerwehrzufahrt
- auf der Zusatzfläche Getränke in Glas: Weingläser, Bierkrüge 0,5 l, Cocktailgläser – ca. 30 Gläser gezählt
- Inhaber mündlich belehrt, Rückbau bis 22:00 zugesagt
- Nachkontrolle 23:10: unverändert, Inhaber lt. Personal „nicht da“
- 9 Fotos
- Eisdiele Marktplatz 9: Fläche eingehalten, nur Becher, kein Verstoß
- Herr E. war laut, „wir sollen lieber Taschendiebe jagen“; Kollegen sind nach eigener Aussage sachlich geblieben, Bodycam war nicht an

Einstellung sehe ich nicht. Der eigentliche Punkt ist die Feuerwehrzufahrt, da hatte die Feuerwehr beim Fest im Vorjahr schon Probleme.

Gruß
Patrick`,
      },
      {
        from: "fb-sommer",
        to: ["ext-erdem"],
        cc: ["fb-dietrich", "fb-lassberg"],
        date: "2025-09-04T10:05",
        subject: "AW: Beschwerde !!! Anhörung Ordnungswidrigkeit Altstadtfest",
        quote: false,
        body: `Sehr geehrter Herr Erdem,

vielen Dank für Ihre Nachricht vom 31.08.2025. Die Oberbürgermeisterin hat mich gebeten, Ihnen zu antworten.

Ich verstehe, dass Sie sich über die Anhörung ärgern. Zunächst zur Einordnung: Der Anhörungsbogen ist noch kein Bußgeldbescheid. Er gibt Ihnen die Gelegenheit, sich zu dem Vorwurf zu äußern, bevor wir entscheiden.

Nach den Feststellungen des Kommunalen Ordnungsdienstes wurden am 23.08.2025 gegen 21:40 Uhr rund 41 m² statt der nach der Sondernutzungserlaubnis SN-2025-0318 genehmigten 24 m² genutzt. Auf der zusätzlichen Fläche wurden Getränke in Gläsern ausgegeben. Nach der Allgemeinverfügung vom 29.07.2025 zum Glasverbot waren Gläser nur auf der genehmigten Fläche zulässig. Besonders wichtig ist uns, dass die Feuerwehrzufahrt am Marktplatz jederzeit frei bleibt – bei einer Veranstaltung mit vielen tausend Menschen geht es hier um die Sicherheit aller.

Ihre Sicht, dass nur zwei Tische zusätzlich und nur für kurze Zeit aufgestellt waren, nehmen wir ernst. Bitte schildern Sie diese im Anhörungsbogen; Sie können Ihre Stellungnahme bis zum **15.09.2025** einreichen. Wir berücksichtigen sie bei der Entscheidung, ob und in welcher Höhe ein Bußgeld festgesetzt wird. Zu anderen Betrieben kann ich Ihnen aus Datenschutzgründen keine Auskunft geben.

Ihren Hinweis auf das Auftreten der Kontrollkräfte habe ich an die Leitung des Ordnungsdienstes weitergegeben.

Gern biete ich Ihnen ein Gespräch an, zum Beispiel am Mittwoch, 10.09.2025, um 14:00 Uhr im Rathaus. Dabei können wir auch besprechen, wie Sie für das Altstadtfest 2026 rechtzeitig eine vorübergehende Erweiterung Ihrer Außenfläche beantragen können (Antrag bis 30.06.2026).

Mit freundlichen Grüßen
Jana Sommer`,
      },
    ],
  },
  {
    id: "fb-presseanfrage-wartezeiten-buergeramt",
    title: "Presseanfrage des Falkenbrücker Stadtanzeigers zu Wartezeiten im Bürgeramt",
    subject: "Presseanfrage: Wartezeiten im Bürgeramt",
    org: "falkenbrueck",
    unit: "fb-presse",
    date: "2026-05-11",
    tags: ["widersprueche", "zahlen"],
    keywords: ["sechs Wochen", "151.000", "No-Show-Quote", "Redaktionsschluss", "Bürgerbüro Nord"],
    summary:
      "Eine Redakteurin fragt nach Wartezeiten, Vorsprachen und dem KI-Assistenten; Pressestelle, Amtsleitung und Teamleitung stimmen die Antwort ab, die Kennzahlen-Tabelle hängt an. Mehrere Zahlen in den Mails und in der Antwort an die Presse weichen von der angehängten Auswertung ab (Vorsprachen 2025, No-Show-Quote, Wartezeit).",
    mails: [
      {
        from: "ext-reinhardt",
        to: ["fb-ohlendorf"],
        date: "2026-05-07T17:52",
        body: `Sehr geehrte Frau Ohlendorf,

uns erreichen derzeit mehrere Zuschriften von Leserinnen und Lesern, die von bis zu **sechs Wochen** Wartezeit auf einen Termin im Bürgeramt berichten. Im Herbst hatte die Stadt 18 Werktage genannt und deutliche Verbesserungen angekündigt. Ich bitte daher um Beantwortung folgender Fragen:

1. Wie lang ist die durchschnittliche Wartezeit auf einen Termin aktuell?
2. Wie viele Vorsprachen gab es 2025 im Vergleich zu 2024?
3. Wie hoch ist die No-Show-Quote, also der Anteil nicht wahrgenommener Termine?
4. Wie viele Anfragen hat der KI-Assistent auf der Internetseite seit dem Start beantwortet?
5. Wie viele Stellen im Bürgeramt sind derzeit unbesetzt?

Unser Redaktionsschluss für die Wochenendausgabe ist Dienstag, 12.05., 12:00 Uhr.

Mit freundlichen Grüßen
Sabine Reinhardt`,
      },
      {
        from: "fb-ohlendorf",
        to: ["fb-feldhaus"],
        cc: ["fb-nguyen"],
        date: "2026-05-08T08:31",
        subject: "WG: Presseanfrage: Wartezeiten im Bürgeramt",
        body: `Liebe Frau Feldhaus,

anbei die Anfrage vom Stadtanzeiger. Können Sie mir bis Montagmittag die Zahlen zu den fünf Fragen liefern? Zu den „sechs Wochen“ bräuchte ich eine Erklärung, sonst bleibt das so stehen.

Danke und viele Grüße
Clara Ohlendorf`,
      },
      {
        from: "fb-feldhaus",
        to: ["fb-ohlendorf"],
        cc: ["fb-nguyen"],
        date: "2026-05-08T15:12",
        attachments: ["fb-buergeramt-kennzahlen-2025-2026"],
        body: `Liebe Frau Ohlendorf,

anbei unsere aktuelle Auswertung (Stand 05.05.). Kurz zu den Fragen:

1. Wartezeit im April: **6 Werktage** (Juli 2025 noch 21)
2. Vorsprachen 2025: rund **151.000**, 2024 waren es 142.000
3. No-Show-Quote im April: **9 Prozent** – seit der Terminerinnerung im Dezember ein großer Erfolg
4. KI-Assistent: seit dem Start am 2. März rund 9.000 Dialoge
5. unbesetzt sind noch 2,5 Stellen, zwei Stellen haben wir im Februar besetzt

Die sechs Wochen kann ich mir nur so erklären, dass jemand einen bestimmten Standort und einen Samstagstermin möchte. Samstags bieten wir nur zweimal im Monat Termine an.

Viele Grüße
Annika Feldhaus`,
      },
      {
        from: "fb-nguyen",
        to: ["fb-feldhaus", "fb-ohlendorf"],
        date: "2026-05-11T09:05",
        body: `Guten Morgen zusammen,

kleine Ergänzung aus dem Bürgerbüro Nord: Bei uns lag die Wartezeit im April eher bei 11 Werktagen, im Bürgerbüro Mitte bei 6. Die 6 Werktage gelten also nur für Mitte. Stadtweit stehen in der Auswertung für April 8 Werktage.

Und Samstagstermine gibt es in Nord seit März gar nicht mehr, weil uns dafür das Personal fehlt.

Viele Grüße
Mai Nguyen`,
      },
      {
        from: "fb-ohlendorf",
        to: ["ext-reinhardt"],
        cc: ["fb-feldhaus"],
        date: "2026-05-11T16:40",
        subject: "AW: Presseanfrage: Wartezeiten im Bürgeramt",
        quote: false,
        body: `Sehr geehrte Frau Reinhardt,

vielen Dank für Ihre Anfrage. Gern beantworte ich Ihre Fragen, Zitate bitte Annika Feldhaus, Leiterin des Bürgeramts, zuordnen:

1. Die durchschnittliche Wartezeit auf einen Termin lag im April stadtweit bei 8 Werktagen, im Juli 2025 waren es noch 21 Werktage. Im Bürgerbüro Mitte sind Termine schneller verfügbar als im Bürgerbüro Nord.
2. 2025 hatte das Bürgeramt rund 151.000 Vorsprachen, nach 142.000 im Jahr 2024.
3. Die No-Show-Quote ist seit Einführung der Terminerinnerung im Dezember stark gesunken und lag im April bei 9 Prozent.
4. Der KI-Assistent hat seit dem Start am 2. März rund 9.000 Dialoge geführt.
5. Derzeit sind 2,5 Stellen unbesetzt; zwei Stellen wurden im Februar neu besetzt.

„Wer flexibel bei Standort und Uhrzeit ist, bekommt in aller Regel innerhalb von zwei Wochen einen Termin. Wartezeiten von sechs Wochen können wir in unseren Daten nicht nachvollziehen. Für Abholungen braucht man gar keinen Termin mehr – dafür gibt es seit Januar den Express-Schalter“, so Annika Feldhaus.

Mit freundlichen Grüßen
Clara Ohlendorf`,
      },
    ],
  },
  {
    id: "fb-datenpanne-phishing-standesamt",
    title: "Datenpanne nach Phishing: kompromittiertes Postfach im Standesamt",
    subject: "Sicherheitsvorfall SV-2026-014 – Postfach Standesamt kompromittiert, Meldung nach Art. 33 DSGVO",
    org: "falkenbrueck",
    unit: "fb-amt12",
    date: "2026-04-15",
    tags: ["personendaten"],
    keywords: ["SV-2026-014", "Art. 33 DSGVO", "72 Stunden", "Weiterleitungsregel", "Art. 34 DSGVO"],
    summary:
      "Nach einem Phishing-Angriff leitet ein fremder Zugriff Mails aus einem Standesamts-Postfach nach außen weiter; Informationssicherheit, Datenschutz und Standesamt klären Ablauf, betroffene Daten und die 72-Stunden-Frist. Die Mails enthalten Namen, Geburtsdaten und sensible Angaben von Betroffenen – gut für Anonymisierung, Zeitstrahl, Meldung an die Aufsichtsbehörde und Benachrichtigung der Betroffenen.",
    mails: [
      {
        from: "fb-ebert",
        to: ["fb-kuhn"],
        cc: ["fb-yildiz", "fb-busch"],
        date: "2026-04-13T11:02",
        body: `Liebe Frau Kuhn,

wir haben einen bestätigten Sicherheitsvorfall mit personenbezogenen Daten. Bitte prüfen Sie die Meldepflicht nach Art. 33 DSGVO. Stand jetzt:

**Ablauf**
- Fr 10.04., 14:37 Uhr: Phishing-Mail „Ihr Postfach ist voll – jetzt Speicher erweitern“ an 212 Adressen der Stadt, Link auf eine gefälschte Anmeldeseite (mailspeicher-erweitern.example)
- Fr 10.04., 14:52 Uhr: eine Mitarbeiterin des Standesamts (Frau Tanja Reuß) gibt Benutzername und Passwort ein
- Sa 11.04., 03:12 bis 05:40 Uhr: Anmeldungen am Webmail-Zugang aus dem Ausland; der Angreifer legt eine **Weiterleitungsregel** an: alle eingehenden Mails mit „Urkunde“, „Sterbefall“, „Geburt“ oder „Ausweis“ im Betreff gehen an archiv-sicherung@postfach-sicher.example
- Mo 13.04., 08:40 Uhr: Frau Reuß wundert sich über die Rückfrage eines Bestatters („haben Sie meine Mail vom Samstag nicht bekommen?“), 09:15 Uhr Meldung an den Servicedesk
- Mo 13.04., 09:50 Uhr: Zugriff durch uns bestätigt. Konto gesperrt, Passwort zurückgesetzt, Regel gelöscht, alle Sitzungen beendet

**Umfang (vorläufig)**
- 37 Mails wurden zwischen Samstag 05:40 Uhr und Montag 09:50 Uhr nach außen weitergeleitet
- Der Angreifer hatte rund zwei Stunden Lesezugriff auf das gesamte Postfach (ca. 3.400 Mails); ob er etwas heruntergeladen hat, können wir aus den Protokollen nicht sicher ausschließen
- Andere Konten: Nach jetzigem Stand hat sonst niemand Zugangsdaten eingegeben

Den Zeitpunkt der Kenntnis würde ich auf heute, 09:50 Uhr, legen. Damit läuft die 72-Stunden-Frist bis **Donnerstag, 16.04., 09:50 Uhr**.

Ein wunder Punkt, den wir offen ansprechen sollten: Der Webmail-Zugang aus dem Internet ist noch nicht bei allen Konten mit dem zweiten Faktor abgesichert (derzeit 38 % ohne). Das Konto von Frau Reuß gehörte dazu.

Viele Grüße
Sascha Ebert`,
      },
      {
        from: "fb-kuhn",
        to: ["fb-ebert", "fb-busch"],
        cc: ["fb-yildiz", "fb-kessler"],
        date: "2026-04-13T12:30",
        body: `Lieber Herr Ebert, liebe Frau Busch,

vielen Dank für die schnelle und klare Darstellung. Nach dem, was wir wissen, gehe ich von einer meldepflichtigen Verletzung nach Art. 33 DSGVO aus. Wegen der Art der Daten (Personenstandsdaten, Ausweiskopien) ist sehr wahrscheinlich auch eine Benachrichtigung der Betroffenen nach Art. 34 DSGVO nötig.

Ich brauche bitte **bis morgen, 12 Uhr**:

Frau Busch:
1. Welche Datenkategorien stecken in den 37 weitergeleiteten Mails (Sterbefallanzeigen, Geburtsanzeigen, Anmeldungen zur Eheschließung …)?
2. Wie viele Personen sind betroffen? Bitte auch Angehörige und Kinder mitzählen.
3. Sind besonders schutzwürdige Angaben dabei? Den vertraulichen Teil der Todesbescheinigung dürften wir eigentlich nicht per Mail bekommen – bitte trotzdem prüfen.

Herr Ebert:
4. Lässt sich der Lesezugriff auf das restliche Postfach noch weiter eingrenzen?
5. Bitte Strafanzeige vorbereiten (Ausspähen von Daten), die Protokolle sichern.

Die Meldung an die Landesbeauftragte für den Datenschutz würde ich spätestens am Mittwochabend abgeben, damit wir Luft bis zur Frist haben. Herr Keßler, ich informiere Sie und die Oberbürgermeisterin vorab.

Bitte an alle: Frau Reuß hat richtig gehandelt, als sie die Auffälligkeit gemeldet hat. Wir suchen keine Schuldigen.

Viele Grüße
Birgit Kuhn`,
      },
      {
        from: "fb-busch",
        to: ["fb-kuhn"],
        cc: ["fb-ebert", "fb-wendland"],
        date: "2026-04-14T10:48",
        body: `Liebe Frau Kuhn,

Frau Wendland und ich haben die 37 Mails heute früh durchgesehen:

- **14 Sterbefallanzeigen** von Bestattern, in 9 Fällen mit Kopie des Personalausweises der verstorbenen Person, in 2 Fällen mit Kopie des Familienstammbuchs. Kein vertraulicher Teil der Todesbescheinigung.
- **11 Geburtsanzeigen** des Klinikums (Name und Anschrift der Mutter, Name des Kindes, Geburtsdatum und -zeit). In **2 Fällen** steht der Vermerk, dass das Kind zur Adoption freigegeben wird.
- **8 Mails von Paaren** zur Anmeldung der Eheschließung mit Ausweiskopien und Geburtsurkunden, in einem Fall mit Scheidungsurteil.
- **4 sonstige** (Terminanfragen, eine Kirchenaustrittsbescheinigung).

Nach unserer Zählung sind **mindestens 96 Personen** betroffen.

Beispiele zur Einordnung: Sterbefall Gertrud Hoffmeister (geb. 02.11.1938, Weststadt), Geburtsanzeige für Mila Sophie Brandner (geb. 11.04.2026, Mutter Jacqueline Brandner, Hafenviertel – einer der beiden Adoptionsfälle), Anmeldung Eheschließung Tim Hellwege und Alina Kostić mit Ausweiskopien. Die vollständige Liste mit Namen und Anschriften liegt im Laufwerk des Standesamts (nur Frau Wendland und ich haben Zugriff).

Die Adoptionsfälle machen mir am meisten Sorgen. Bevor da ein Brief rausgeht, müssen wir mit dem Jugendamt sprechen, wie die Mütter erreicht werden.

Frau Reuß ist sehr mitgenommen. Sie ist heute zu Hause.

Viele Grüße
Karin Busch`,
      },
      {
        from: "fb-kuhn",
        to: ["fb-kessler"],
        cc: ["fb-ebert", "fb-busch", "fb-yildiz"],
        date: "2026-04-15T16:20",
        body: `Lieber Herr Keßler,

zum Stand im Sicherheitsvorfall SV-2026-014:

1. **Meldung nach Art. 33 DSGVO:** heute um 15:58 Uhr über das Online-Formular der Landesbeauftragten für den Datenschutz abgegeben, also innerhalb der 72 Stunden. Eine Eingangsbestätigung liegt vor.
2. **Benachrichtigung nach Art. 34 DSGVO:** Wegen der Ausweiskopien und der beiden Adoptionsfälle besteht ein hohes Risiko. Wir benachrichtigen alle Betroffenen schriftlich; ein Entwurf des Anschreibens kommt morgen. Für die beiden Adoptionsfälle stimmt Frau Busch das Vorgehen mit dem Jugendamt ab, dort erfolgt die Benachrichtigung persönlich.
3. **Strafanzeige:** Herr Ebert hat heute Anzeige bei der Polizei erstattet.
4. **Technische Maßnahmen:** Externe Weiterleitungsregeln sind seit gestern für alle Konten technisch gesperrt. Der zweite Faktor wird für den Webmail-Zugang bis 30.04. für alle Konten verpflichtend; Konten ohne zweiten Faktor verlieren dann den Zugang von außen.
5. **Sensibilisierung:** Amt 12 schickt morgen eine Warnung an alle Beschäftigten mit Hinweisen zum Erkennen solcher Mails.

Für die Pressestelle haben wir eine kurze Sprachregelung vorbereitet, falls Betroffene sich an die Zeitung wenden.

Viele Grüße
Birgit Kuhn`,
      },
    ],
  },
];
