// Landkreis Altmoorland – Dezernate 2 und 4 (Gesundheit, Soziales, Jugend, Schulen; Bauen, Umwelt, Kreisstraßen, Abfall)
import type { DocSpec, ThreadSpec } from "../types";

export const documents: DocSpec[] = [
  // ── Jugendamt: Kita-Bedarfsplanung ─────────────────────────────────
  {
    type: "excel",
    id: "am-kita-bedarfsplanung-2025-2026",
    title: "Kita-Bedarfsplanung 2025/2026 nach Gemeinden",
    kind: "Bedarfsplanung",
    fileName: "Kita-Bedarfsplanung 2025-26 Kreisjugendamt nach Gemeinden",
    org: "altmoorland",
    unit: "am-jugend",
    author: "am-carstens",
    date: "2025-03-12",
    tags: ["zahlen"],
    keywords: ["Zielquote U3", "Kita-Ausbau 2026", "Großtagespflegestelle Torfkamp", "Lindenhof", "Fehlplätze U3"],
    summary:
      "Bedarfsplanung des Kreisjugendamts für alle acht Gemeinden: Kinderzahlen, Krippen-, Tagespflege- und Ü3-Plätze, Versorgungsquoten und Fehlplätze mit Formeln sowie geplante Ausbauvorhaben mit Landesförderung (50 %).",
    sheets: [
      {
        name: "Gemeinden",
        title: "Kreisjugendamt Altmoorland – Kita-Bedarfsplanung 2025/2026",
        subtitle: "Einwohner und Kinder: Stichtag 31.12.2024 · Plätze: Stand 01.03.2025 · Zielquoten siehe Blatt „Annahmen“",
        columns: [
          { header: "Gemeinde", width: 16 },
          { header: "Einwohner 31.12.2024", width: 12, fmt: "int" },
          { header: "Kinder U3", width: 9, fmt: "int" },
          { header: "Kinder Ü3 bis Schuleintritt", width: 12, fmt: "int" },
          { header: "Krippenplätze", width: 11, fmt: "int" },
          { header: "Plätze Kindertagespflege", width: 12, fmt: "int" },
          { header: "Plätze Ü3", width: 9, fmt: "int" },
          { header: "Versorgungsquote U3", width: 11, fmt: "pct" },
          { header: "Versorgungsquote Ü3", width: 11, fmt: "pct" },
          { header: "Bedarf U3", width: 9, fmt: "int" },
          { header: "Fehlplätze U3", width: 10, fmt: "int" },
          { header: "Bedarf Ü3", width: 9, fmt: "int" },
          { header: "Fehlplätze Ü3 (– = Überhang)", width: 13, fmt: "int" },
        ],
        rows: [
          ["Stadt Rabensfurt", 38600, 1012, 1190, 352, 64, 1142],
          ["Stadt Altmoor", 24100, 628, 744, 236, 41, 731],
          ["Fennhusen", 11200, 301, 352, 98, 22, 330],
          ["Torfkamp", 9400, 246, 289, 72, 25, 292],
          ["Brackenhain", 6840, 178, 205, 48, 14, 190],
          ["Schilfwerder", 5100, 129, 151, 30, 12, 151],
          ["Lütjenbrook", 3900, 97, 118, 15, 9, 100],
          ["Krähenwerder", 2700, 64, 79, 12, 6, 75],
          {
            total: true,
            cells: [
              "Kreis gesamt",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "SUM(G{first}:G{last})" },
              { f: "(E{r}+F{r})/C{r}" },
              { f: "G{r}/D{r}" },
              { f: "SUM(J{first}:J{last})" },
              { f: "SUM(K{first}:K{last})" },
              { f: "SUM(L{first}:L{last})" },
              { f: "SUM(M{first}:M{last})" },
            ],
          },
        ].map((row) =>
          Array.isArray(row)
            ? [
                ...row,
                { f: "(E{r}+F{r})/C{r}" },
                { f: "G{r}/D{r}" },
                { f: "ROUND(C{r}*Annahmen!B5,0)" },
                { f: "J{r}-E{r}-F{r}" },
                { f: "ROUND(D{r}*Annahmen!B6,0)" },
                { f: "L{r}-G{r}" },
              ]
            : row,
        ),
        notes: [
          "Kinder Ü3: Kinder ab vollendetem 3. Lebensjahr bis zum Schuleintritt (rund 3,5 Jahrgänge). Kindertagespflege wird nur bei U3 angerechnet.",
          "Fehlplätze Ü3 mit negativem Vorzeichen bedeuten einen rechnerischen Platzüberhang in der Gemeinde.",
          "Brackenhain: davon Gemeindekindergarten „Lindenhof“ mit 12 Krippen- und 70 Elementarplätzen (4 Gruppen, 82 Plätze).",
          "Der Rechtsanspruch nach § 24 SGB VIII gilt unabhängig von den Zielquoten für jedes Kind ab dem vollendeten ersten Lebensjahr.",
        ],
      },
      {
        name: "Ausbauvorhaben",
        title: "Geplante Ausbauvorhaben 2025 bis 2027",
        subtitle: "Meldungen der Gemeinden und Träger, Stand 01.03.2025",
        columns: [
          { header: "Gemeinde", width: 14 },
          { header: "Vorhaben", width: 44 },
          { header: "Träger", width: 26 },
          { header: "zusätzl. Plätze U3", width: 10, fmt: "int" },
          { header: "zusätzl. Plätze Ü3", width: 10, fmt: "int" },
          { header: "Inbetrieb-nahme", width: 10 },
          { header: "Investitions-kosten", width: 13, fmt: "eur0" },
          { header: "Landesförderung", width: 13, fmt: "eur0" },
          { header: "Eigenanteil", width: 13, fmt: "eur0" },
          { header: "Stand", width: 30 },
        ],
        rows: [
          ["Stadt Rabensfurt", "Kita Furtwiesen – Erweiterung um zwei Krippengruppen", "Stadt Rabensfurt", 24, 0, "08/2026", 1380000, null, null, "Bauantrag gestellt"],
          ["Stadt Rabensfurt", "Neubau Kita Rabensfurt-Süd (fünf Gruppen)", "Kinderhaus Moorlerche e. V.", 30, 50, "08/2027", 4650000, null, null, "Grundstück gesichert, Vorplanung"],
          ["Fennhusen", "Anbau Kita Am Mühlenbach", "Gemeinde Fennhusen", 12, 22, "01/2027", 1120000, null, null, "Förderantrag in Vorbereitung"],
          ["Torfkamp", "Großtagespflegestelle Torfkamp (drei Tagespflegepersonen)", "privat (Kindertagespflege)", 9, 0, "10/2025", 85000, null, null, "Räume angemietet"],
          ["Brackenhain", "Gemeindekindergarten Lindenhof – fünfte Gruppe (Krippe) in Modulbauweise", "Gemeinde Brackenhain", 12, 0, "08/2026", 690000, null, null, "Ratsbeschluss offen (Haushaltssicherung)"],
          ["Schilfwerder", "Umbau der ehemaligen Grundschule Achterdeich zur Kita", "Gemeinde Schilfwerder", 12, 20, "08/2027", 980000, null, null, "Machbarkeitsstudie beauftragt"],
          ["Lütjenbrook", "Krippengruppe in der Alten Schule", "Gemeinde Lütjenbrook", 12, 0, "02/2026", 410000, null, null, "Baugenehmigung liegt vor"],
          ["Krähenwerder", "Kindertagespflege-Verbund (zwei Tagespflegepersonen)", "Kreisjugendamt (Gewinnung)", 9, 0, "2026", 30000, null, null, "Suche nach Tagespflegepersonen"],
          {
            total: true,
            cells: [
              "Summe",
              null,
              null,
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              null,
              { f: "SUM(G{first}:G{last})" },
              { f: "SUM(H{first}:H{last})" },
              { f: "SUM(I{first}:I{last})" },
              null,
            ],
          },
        ].map((row) => (Array.isArray(row) ? [...row.slice(0, 7), { f: "ROUND(G{r}*Annahmen!B7,0)" }, { f: "G{r}-H{r}" }, row[9]] : row)),
        notes: [
          "Landesförderung rechnerisch mit der Förderquote aus Blatt „Annahmen“; die Förderfähigkeit im Einzelfall prüft die Bewilligungsstelle des Landes.",
          "Mit allen Vorhaben entstehen 120 zusätzliche U3-Plätze; der rechnerische Fehlbedarf liegt bei 139 Plätzen.",
        ],
      },
      {
        name: "Annahmen",
        title: "Planungsannahmen",
        columns: [
          { header: "Annahme", width: 50 },
          { header: "Quote", width: 10, fmt: "pct" },
          { header: "Anzahl", width: 10, fmt: "int" },
          { header: "Grundlage", width: 56 },
        ],
        rows: [
          ["Zielquote U3 (Krippe und Kindertagespflege)", 0.45, null, "Beschluss des Jugendhilfeausschusses vom 21.09.2023 (Vorlage JHA/2023/018)"],
          ["Zielquote Ü3 (3 Jahre bis Schuleintritt)", 0.98, null, "Erfahrungswert; Rechtsanspruch nach § 24 Abs. 3 SGB VIII"],
          ["Förderquote Landesprogramm „Kita-Ausbau 2026“", 0.5, null, "Förderrichtlinie des Landes, förderfähige Investitionskosten"],
          ["Kinder je Krippengruppe", null, 12, "KiTaG, Höchstgruppenstärke"],
          ["Kinder je Elementargruppe (Regelgruppe)", null, 25, "KiTaG, Höchstgruppenstärke"],
          ["Kinder je Tagespflegeperson (gleichzeitig anwesend)", null, 5, "§ 43 Abs. 3 SGB VIII"],
        ],
      },
    ],
  },
  // ── Jugendamt: Präsentation Jugendhilfeplanung ─────────────────────
  {
    type: "powerpoint",
    id: "am-jugendhilfeplanung-jha-2025",
    title: "Jugendhilfeplanung 2025–2029 – Sachstand für den Jugendhilfeausschuss",
    kind: "Präsentation",
    fileName: "2025-04-02 JHA Jugendhilfeplanung 2025-2029 Sachstand",
    org: "altmoorland",
    unit: "am-jugend",
    author: "am-gerdes",
    date: "2025-03-26",
    keywords: ["§ 80 SGB VIII", "Trägerkonferenz", "139 Fehlplätze", "Jugendbefragung"],
    summary:
      "Kurze Ausschusspräsentation der Jugendamtsleitung: Planungsauftrag, U3-Versorgungsquoten aus der Kita-Bedarfsplanung, erste Befunde, Beteiligung und Zeitplan bis 2027.",
    slides: [
      { t: "title", title: "Jugendhilfeplanung 2025–2029", subtitle: "Sachstand für den Jugendhilfeausschuss am 2. April 2025" },
      {
        t: "bullets",
        title: "Auftrag",
        bullets: [
          "Planungsverantwortung des Kreisjugendamts nach § 80 SGB VIII",
          "Planungsauftrag des Jugendhilfeausschusses vom 14.11.2024",
          { text: "Vier Teilpläne", sub: ["Kindertagesbetreuung (jährliche Fortschreibung)", "Hilfen zur Erziehung", "Kinder- und Jugendarbeit", "Jugendsozialarbeit und Schule"] },
        ],
      },
      {
        t: "chart",
        title: "Versorgungsquote U3 nach Gemeinden",
        chart: {
          type: "bar",
          categories: ["Rabensfurt", "Altmoor", "Fennhusen", "Torfkamp", "Brackenhain", "Schilfwerder", "Lütjenbrook", "Krähenwerder"],
          series: [
            { name: "Versorgungsquote U3", values: [41.1, 44.1, 39.9, 39.4, 34.8, 32.6, 24.7, 28.1] },
            { name: "Zielquote", values: [45, 45, 45, 45, 45, 45, 45, 45] },
          ],
          unit: "%",
        },
        caption: "Krippe und Kindertagespflege, Stand 01.03.2025; kreisweit 39,8 %",
        notes:
          "Quelle ist die Kita-Bedarfsplanung 2025/2026. Lütjenbrook und Krähenwerder liegen deutlich unter dem Kreisdurchschnitt – dort fehlt vor allem Kindertagespflege.",
      },
      {
        t: "bullets",
        title: "Erste Befunde",
        bullets: [
          "U3: kreisweit **139 Fehlplätze** gegenüber der Zielquote von 45 %",
          "Ü3: rechnerisch weitgehend gedeckt, Engpässe in Rabensfurt, Fennhusen und Lütjenbrook",
          "Fachkräfte: Träger melden 23 offene Stellen",
          "Hilfen zur Erziehung: Fallzahlen 2024 um 9 % gestiegen",
        ],
        notes: "Die gemeldeten Ausbauvorhaben schaffen bis 2027 rund 120 U3-Plätze. Der Fehlbedarf wird damit nicht vollständig gedeckt.",
      },
      {
        t: "bullets",
        title: "Beteiligung",
        bullets: [
          "Jugendbefragung an allen weiterführenden Schulen (Mai 2025)",
          "Gespräche mit allen acht Gemeinden (April bis Juni)",
          "Trägerkonferenz am 17.06.2025",
          "Online-Elternbefragung zum Betreuungsbedarf",
        ],
      },
      {
        t: "table",
        title: "Zeitplan",
        header: ["Zeitraum", "Schritt"],
        rows: [
          ["April bis Juni 2025", "Bestandserhebung und Beteiligung"],
          ["September 2025", "Entwurf Teilplan Kindertagesbetreuung"],
          ["November 2025", "Beschluss Teilplan Kindertagesbetreuung im JHA"],
          ["2026", "Teilpläne Hilfen zur Erziehung und Jugendarbeit"],
          ["Frühjahr 2027", "Gesamtbericht Jugendhilfeplanung"],
        ],
      },
      { t: "end", title: "Vielen Dank!", lines: ["Stefanie Gerdes · Leiterin Jugendamt", "Telefon 040 66969-230"] },
    ],
  },
  // ── Gesundheitsamt: Abkochgebot ────────────────────────────────────
  {
    type: "word",
    id: "am-anordnung-abkochgebot-hochbehaelter-heidhof",
    title: "Anordnung eines Abkochgebots nach Trinkwasserbefund im Versorgungsgebiet Heidhof",
    kind: "Anordnung",
    fileName: "2025-07-15 Anordnung Abkochgebot Wasserverband Altmoorland-Nord",
    org: "altmoorland",
    unit: "am-gesundheit",
    author: "am-sander",
    date: "2025-07-15",
    keywords: ["Abkochgebot", "Hochbehälter Heidhof", "coliforme Bakterien", "§ 80 Abs. 2 Satz 1 Nr. 4 VwGO"],
    summary:
      "Kurzer Bescheid des Gesundheitsamts an einen Wasserverband nach E.-coli-Befund: Abkochgebot für Heidhof, Kleinbracken und Krähenwerder, Spülung, Nachuntersuchungen, sofortige Vollziehung. Gut für Leichte Sprache und Bürgerinformation.",
    meta: [["Aktenzeichen", "53.2-TW-0715/25"]],
    recipient: ["Wasserverband Altmoorland-Nord", "Der Verbandsvorsteher", "Am Wasserwerk 3", "00767 Krähenwerder"],
    subject: "Trinkwasser aus dem Hochbehälter Heidhof – Anordnung eines Abkochgebots (vorab per E-Mail)",
    blocks: [
      {
        t: "p",
        text: "In den Proben vom 14.07.2025 aus dem Netz des Hochbehälters Heidhof wurden **E. coli (3 KBE/100 ml)** und **coliforme Bakterien (bis 28 KBE/100 ml)** nachgewiesen. Der Grenzwert der TrinkwV liegt jeweils bei 0 KBE/100 ml. Nach § 39 Abs. 2 IfSG in Verbindung mit der TrinkwV ordne ich an:",
      },
      {
        t: "ol",
        items: [
          "Sie machen bis heute 18:00 Uhr für die Ortsteile Heidhof und Kleinbracken (Gemeinde Brackenhain) und die Gemeinde Krähenwerder ein **Abkochgebot** bekannt: Leitungswasser zum Trinken, Kochen und Zähneputzen nur sprudelnd aufgekocht verwenden.",
          "Kita, Schule, Pflegeeinrichtungen, Arztpraxen und Lebensmittelbetriebe informieren Sie gesondert.",
          "Hochbehälter und Netz sind zu spülen und zu chloren; die Ursache ist bis zum 18.07.2025 schriftlich zu berichten.",
          "Nachuntersuchungen täglich an fünf Entnahmestellen bis zu drei einwandfreien Befunden in Folge.",
          "Das Abkochgebot hebt allein das Gesundheitsamt auf.",
        ],
      },
      {
        t: "p",
        text: "Die sofortige Vollziehung wird nach § 80 Abs. 2 Satz 1 Nr. 4 VwGO angeordnet: Rund 4.100 Menschen trinken dieses Wasser, ein Abwarten gefährdet ihre Gesundheit.",
      },
      {
        t: "p",
        text: "**Rechtsbehelfsbelehrung:** Gegen diesen Bescheid kann innerhalb eines Monats nach Bekanntgabe Widerspruch beim Landkreis Altmoorland, Am Moordamm 4, 00752 Altmoor, erhoben werden. Er hat keine aufschiebende Wirkung; diese kann nach § 80 Abs. 5 VwGO beim Verwaltungsgericht Rhedenburg beantragt werden.",
      },
      { t: "signature", lines: ["Im Auftrag", "Dr. Miriam Sander", "Amtsärztin"] },
    ],
  },
  // ── Fachdienst Soziales: Gesamtplankonferenz ───────────────────────
  {
    type: "word",
    id: "am-protokoll-gesamtplankonferenz-egh-2025-0417",
    title: "Protokoll einer Gesamtplankonferenz in der Eingliederungshilfe",
    kind: "Protokoll",
    fileName: "2025-11-19 Protokoll Gesamtplankonferenz EGH-2025-0417",
    org: "altmoorland",
    unit: "am-soziales",
    author: "am-wichmann",
    date: "2025-11-19",
    tags: ["personendaten", "unstrukturiert"],
    keywords: ["§ 119 SGB IX", "Trainingswohnung", "Fachleistungsstunden", "Moorwerkstätten", "EGH-2025-0417"],
    summary:
      "Protokoll einer Gesamtplankonferenz zum Wunsch eines jungen Mannes mit Autismus und Epilepsie, allein zu wohnen: Bedarfsermittlung nach ICF, Positionen der Beteiligten, Leistungen und Aufgaben – voller erfundener Sozial- und Gesundheitsdaten, dazu ungeordnete Stichpunkte vom Hausbesuch.",
    meta: [
      ["Aktenzeichen", "50.3-EGH-2025-0417"],
      ["Schutzstufe", "vertraulich – Sozialdaten (§ 35 SGB I)"],
    ],
    subject: "Gesamtplankonferenz nach § 119 SGB IX am 18.11.2025 – Herr Tim Hoyer, geb. 07.05.2001",
    blocks: [
      { t: "h1", text: "1. Rahmendaten" },
      {
        t: "table",
        header: ["Angabe", "Inhalt"],
        rows: [
          ["Leistungsberechtigte Person", "Tim Hoyer, geb. 07.05.2001, Birkenweg 7, 00764 Fennhusen"],
          ["Rechtliche Betreuung", "Sabine Hoyer (Mutter), Aufgabenkreise Vermögenssorge, Behörden- und Gesundheitsangelegenheiten (Amtsgericht Altmoor, Az. 4 XVII 112/21)"],
          ["Antrag", "Assistenzleistungen im eigenen Wohnraum, Antrag vom 02.09.2025"],
          ["Ort und Zeit", "Kreishaus Altmoor, Raum 2.14, 18.11.2025, 10:00 bis 11:50 Uhr"],
          ["Schwerbehinderung, Pflege", "GdB 80, Merkzeichen G und B; Pflegegrad 2 seit 01.03.2023"],
          ["Krankenversicherung", "gesetzlich versichert, Versichertennummer K417203958"],
        ],
        widths: [3, 7],
      },
      { t: "h1", text: "2. Teilnehmende" },
      {
        t: "table",
        header: ["Name", "Funktion"],
        rows: [
          ["Tim Hoyer", "Leistungsberechtigter"],
          ["Sabine Hoyer", "Mutter, rechtliche Betreuerin"],
          ["Ines Wichmann", "Fallmanagerin, Fachdienst Soziales und Eingliederungshilfe (Gesprächsführung, Protokoll)"],
          ["Ralf Gieseke", "Gruppenleiter Montage, Moorwerkstätten Altmoor gGmbH"],
          ["Nadine Kröger", "Fachkraft Ambulant betreutes Wohnen, Wohnverbund Moorlicht e. V."],
          ["Katrin Eilers", "Ergänzende unabhängige Teilhabeberatung (EUTB), auf Wunsch von Herrn Hoyer"],
        ],
        widths: [3, 7],
      },
      {
        t: "p",
        text: "Herr Hoyer hat der Teilnahme aller Personen und der Weitergabe dieses Protokolls an die Teilnehmenden zu Beginn der Konferenz schriftlich zugestimmt. Die Pflegekasse wurde nach § 117 Abs. 3 SGB IX informiert; sie hat auf eine Teilnahme verzichtet.",
      },
      { t: "h1", text: "3. Anlass und Wunsch des Leistungsberechtigten" },
      {
        t: "p",
        text: "Herr Hoyer (24 Jahre) lebt bei seinen Eltern in Fennhusen und arbeitet seit August 2021 im Arbeitsbereich der Moorwerkstätten Altmoor (Montage und Verpackung). Er möchte allein wohnen, und zwar in Altmoor, nah an der Werkstatt und am Bahnhof. Die Kreiswohnungsbau Altmoorland eG hat ihm eine Wohnung ab 01.04.2026 zugesagt: 1,5 Zimmer, 41 m², Am Mühlenteich 9, 00752 Altmoor, Kaltmiete 412 €, Nebenkosten 95 € monatlich.",
      },
      { t: "p", text: "Herr Hoyer wörtlich: „Ich will nicht mehr gefragt werden, wann ich nach Hause komme.“" },
      { t: "h1", text: "4. Ergebnisse der Bedarfsermittlung" },
      {
        t: "p",
        text: "Die Bedarfsermittlung nach § 118 SGB IX erfolgte mit dem Bedarfsermittlungsinstrument des Landes (BEI-L) beim Hausbesuch am 04.11.2025 und bei einem Gespräch in der Werkstatt am 11.11.2025. Die Ergebnisse wurden in der Konferenz vorgestellt und von Herrn Hoyer bestätigt.",
      },
      {
        t: "table",
        header: ["Lebensbereich (ICF)", "Feststellung", "Ziel", "Unterstützungsbedarf"],
        rows: [
          ["Lernen und allgemeine Aufgaben", "Braucht eine feste Tagesstruktur; Planänderungen führen zu Unruhe", "Wochenplan selbstständig nutzen", "Wochenplanung gemeinsam, einmal wöchentlich"],
          ["Mobilität", "Fährt allein mit der Linie 510 zur Werkstatt; neue Wege nur nach Training", "Wege in Altmoor (Arzt, Einkauf) allein bewältigen", "Wegetraining in den ersten acht Wochen"],
          ["Selbstversorgung", "Körperpflege selbstständig mit Erinnerung; Medikamente stellt bisher die Mutter", "Medikamente selbst stellen (Wochendosette)", "Kontrolle der Dosette einmal wöchentlich"],
          ["Häusliches Leben", "Einkaufen mit Liste möglich, kocht einfache Gerichte; zwei Vorfälle mit eingeschaltetem Herd (Sommer 2025)", "Haushalt mit Unterstützung führen", "Anleitung im Haushalt, Herdabschaltautomatik"],
          ["Beziehungen", "Rückzug oder laute Konflikte bei Überforderung; guter Kontakt zu Kollegen", "Konflikte ansprechen statt Rückzug", "Gesprächsangebote, schriftlicher Krisenplan"],
          ["Arbeit und Geld", "Arbeit in der Werkstatt stabil, Arbeitsentgelt rund 248 € monatlich; kein Überblick über Geld", "Wochengeld selbst einteilen", "Unterstützung bei der Geldeinteilung; Konto bleibt bei der Betreuerin"],
          ["Gemeinschaftsleben", "Fan des SV Fennhusen, besucht Heimspiele mit dem Vater", "Freizeitkontakte in Altmoor aufbauen", "Begleitung zu Freizeitangeboten in der Anfangszeit"],
        ],
        widths: [2, 3, 2.5, 2.5],
      },
      { t: "h1", text: "5. Medizinische Angaben (soweit für die Planung erforderlich)" },
      {
        t: "ul",
        items: [
          "Atypischer Autismus (F84.1) und leichte Intelligenzminderung (F70), Befund der Kinder- und Jugendpsychiatrie aus dem Jahr 2016",
          "Epilepsie (G40), unter Medikation seit Oktober 2019 anfallsfrei; Einnahme morgens und abends",
          "Hausarzt in Fennhusen; Wechsel nach dem Umzug geplant",
        ],
      },
      { t: "h1", text: "6. Erörterung" },
      {
        t: "p",
        text: "Frau Hoyer unterstützt den Auszug grundsätzlich, hält einen Umzug zum 01.04.2026 aber für zu früh. Sie verweist auf die Vorfälle mit dem Herd und auf die Medikamenteneinnahme. Herr Hoyer reagierte verärgert und verließ für etwa zehn Minuten den Raum; danach wurde das Gespräch ruhig fortgesetzt.",
      },
      {
        t: "p",
        text: "Herr Gieseke berichtet, dass Herr Hoyer in der Werkstatt zuverlässig und pünktlich arbeite und seit einem Jahr neuen Beschäftigten die Abläufe zeige. Schwierig seien kurzfristige Änderungen, etwa bei Gruppenwechseln.",
      },
      {
        t: "p",
        text: "Frau Kröger stellt die Trainingswohnung des Wohnverbunds Moorlicht in Altmoor vor: Probewohnen für bis zu drei Monate mit täglicher Ansprechperson; die Begleitung wird als Assistenzleistung abgerechnet.",
      },
      {
        t: "p",
        text: "Frau Eilers weist darauf hin, dass dem Wunsch nach eigenem Wohnraum außerhalb besonderer Wohnformen nach § 104 Abs. 2 und 3 SGB IX zu entsprechen ist, soweit er angemessen ist.",
      },
      {
        t: "p",
        text: "**Ergebnis:** Einvernehmen über ein Probewohnen in der Trainingswohnung vom 05.01. bis 31.03.2026. Fällt die Zwischenbilanz am 16.03.2026 positiv aus, zieht Herr Hoyer zum 01.04.2026 in die eigene Wohnung.",
      },
      { t: "h1", text: "7. Vereinbarte Leistungen" },
      {
        t: "table",
        header: ["Leistung", "Rechtsgrundlage", "Umfang", "Kosten (geschätzt)"],
        rows: [
          ["Qualifizierte Assistenz im Probewohnen (01–03/2026)", "§ 113 Abs. 2 Nr. 2 i. V. m. § 78 SGB IX", "9 Fachleistungsstunden je Woche", "2.525,26 € monatlich"],
          ["Qualifizierte Assistenz in eigener Wohnung (ab 04/2026)", "§ 113 Abs. 2 Nr. 2 i. V. m. § 78 SGB IX", "7 Fachleistungsstunden je Woche, Überprüfung nach sechs Monaten", "1.964,09 € monatlich"],
          ["Leistungen im Arbeitsbereich der Werkstatt", "§ 111 SGB IX", "unverändert", "nach Leistungsvereinbarung"],
          ["Fahrten zur Werkstatt", "§ 228 SGB IX", "Freifahrt mit Wertmarke im ÖPNV", "keine"],
          ["Grundsicherung (Unterkunft 412 € + 95 €)", "§§ 41 ff. SGB XII", "ab Umzug, gesonderter Antrag", "nach Bescheid"],
          ["Pflegegeld und Entlastungsbetrag (Pflegegrad 2)", "§§ 37, 45b SGB XI", "347 € und 131 € monatlich", "Pflegekasse"],
        ],
        widths: [3, 2.5, 2.5, 2],
      },
      { t: "note", text: "Kostenschätzung mit dem vereinbarten Satz von 64,80 € je Fachleistungsstunde und 4,33 Wochen je Monat." },
      { t: "h1", text: "8. Aufgaben und Fristen" },
      {
        t: "table",
        header: ["Nr.", "Aufgabe", "Zuständig", "Frist"],
        rows: [
          ["1", "Gesamtplan nach § 121 SGB IX erstellen und an die Teilnehmenden versenden", "Frau Wichmann", "12.12.2025"],
          ["2", "Bescheid über die Assistenzleistungen (§ 120 SGB IX)", "Fachdienst Soziales", "19.12.2025"],
          ["3", "Antrag auf Grundsicherung für die Zeit ab Umzug", "Frau Hoyer", "28.02.2026"],
          ["4", "Herdabschaltautomatik klären (wohnumfeldverbessernde Maßnahme, § 40 Abs. 4 SGB XI)", "Frau Kröger", "15.12.2025"],
          ["5", "Medikamententraining mit dem Hausarzt abstimmen", "Frau Kröger, Frau Hoyer", "05.01.2026"],
          ["6", "Werkstatt über den neuen Arbeitsweg informieren, Wegetraining", "Herr Gieseke", "05.01.2026"],
          ["7", "Zwischenbilanz Probewohnen", "alle", "16.03.2026"],
        ],
        widths: [0.6, 5, 2.4, 1.6],
      },
      { t: "h1", text: "9. Nächste Gesamtplankonferenz" },
      {
        t: "p",
        text: "Der Gesamtplan ist spätestens nach zwei Jahren zu überprüfen (§ 121 Abs. 2 SGB IX). Wegen des Umzugs wird die nächste Konferenz bereits für Oktober 2026 vereinbart.",
      },
      { t: "signature", lines: ["gez. Wichmann", "Fallmanagerin Eingliederungshilfe"] },
      { t: "pagebreak" },
      { t: "h2", text: "Anlage: Stichpunkte Hausbesuch 04.11.2025 (Mitschrift I. Wichmann, nicht abgestimmt)" },
      {
        t: "ul",
        items: [
          "15:30–17:10 Uhr, Fennhusen, Birkenweg 7 – Mutter und Tim da, Vater Schichtdienst (kam am Ende kurz dazu)",
          "Zimmer ordentlich, viele Poster SV Fennhusen, Modellbahn – T. kann den Fahrplan der Linie 510 auswendig (!)",
          "Mutter: „er vergisst den Herd“ – 2x im Sommer, 1x Topf verbrannt, Rauchmelder ging los. T.: „war nur einmal richtig“",
          "Medikamente: Mutter stellt Dosette jeden So., T. nimmt selbst – klappt „meistens“, 1x vergessen im Okt.?",
          "Geld: Girokonto, Mutter verwaltet, T. bekommt 40 € Wochengeld bar – reicht oft nur bis Do.",
          "Waschmaschine kann er nicht (Mutter) / „hab ich nie gedurft“ (T.)",
          "Wunsch Altmoor – nah an Werkstatt und Bahnhof, „da ist mehr los“",
          "Freundin? T. erwähnt „Jana aus der Werkstatt“, Mutter skeptisch",
          "Letzte große Krise Feb. 2025 nach Gruppenwechsel in der Werkstatt, 3 Tage nicht hingegangen",
          "Vater zum Schluss: „Lasst ihn doch, wir sind ja nicht aus der Welt.“",
          "TODO: EUTB-Kontakt geben, Trainingswohnung Moorlicht anfragen, Pflegekasse wg. Herd, Termin Werkstatt 11.11.",
        ],
      },
    ],
  },
  // ── Abfallwirtschaftsbetrieb: Gebührenkalkulation ──────────────────
  {
    type: "excel",
    id: "am-abfallgebuehrenkalkulation-2026",
    title: "Abfallgebührenkalkulation 2026 (Entwurf)",
    kind: "Gebührenkalkulation",
    fileName: "AWB Gebuehrenkalkulation 2026 Entwurf Stand 2025-09-10",
    org: "altmoorland",
    unit: "am-abfall",
    author: "am-reents",
    date: "2025-09-10",
    tags: ["zahlen"],
    keywords: ["Beseitigung wilder Ablagerungen", "Altdeponie Torfkamp", "Grundgebühr je Wohneinheit", "Musterhaushalte", "13.630.000 €"],
    summary:
      "Entwurf der Gebührenkalkulation des Abfallwirtschaftsbetriebs für 2026: Kosten- und Erlösarten, Bemessungsmengen, Gebührensätze je Behältergröße und Musterhaushalte, durchgängig mit Formeln. Der Gebührenbedarf steigt um rund 10 %.",
    sheets: [
      {
        name: "Kosten",
        title: "Abfallwirtschaftsbetrieb Altmoorland – Gebührenbedarf 2026",
        subtitle: "Entwurf, Stand 10.09.2025 · Grundlage: § 6 KAG und Abfallgebührensatzung des Landkreises",
        columns: [
          { header: "Pos.", width: 6 },
          { header: "Kosten- und Erlösart", width: 46 },
          { header: "Ergebnis 2024", width: 14, fmt: "eur0" },
          { header: "Ansatz 2025", width: 14, fmt: "eur0" },
          { header: "Ansatz 2026", width: 14, fmt: "eur0" },
          { header: "Veränderung 2026 zu 2025", width: 14, fmt: "eur0" },
          { header: "Veränderung in %", width: 11, fmt: "pct" },
          { header: "Zuordnung", width: 22 },
        ],
        rows: [
          ["K01", "Personalkosten (Verwaltung, Wertstoffhöfe, Abfallberatung)", 1381400, 1420000, 1512000, null, null, "G 50 % · R 35 % · B 15 %"],
          ["K02", "Sammlung und Transport Restabfall (Fremdleistung)", 3052800, 3180000, 3395000, null, null, "R"],
          ["K03", "Sammlung und Transport Bioabfall (Fremdleistung)", 1196500, 1240000, 1318000, null, null, "B"],
          ["K04", "Sammlung Papier, Pappe, Kartonagen", 671200, 690000, 712000, null, null, "G"],
          ["K05", "Sperrmüll und Elektroaltgeräte (Abholung auf Abruf)", 498300, 520000, 548000, null, null, "G"],
          ["K06", "Behandlung Restabfall (thermische Verwertung)", 2884600, 3020000, 3322000, null, null, "R"],
          ["K07", "Verwertung Bioabfall (Vergärung)", 951700, 980000, 1035000, null, null, "B"],
          ["K08", "Betrieb der vier Wertstoffhöfe (Sachkosten)", 588900, 610000, 640000, null, null, "G"],
          ["K09", "Schadstoffmobil", 139800, 145000, 152000, null, null, "G"],
          ["K10", "Beseitigung wilder Ablagerungen", 164200, 172000, 186000, null, null, "G"],
          ["K11", "Nachsorge Altdeponie Torfkamp", 402600, 410000, 420000, null, null, "G"],
          ["K12", "Abschreibungen", 744100, 760000, 790000, null, null, "G 40 % · R 40 % · B 20 %"],
          ["K13", "Kalkulatorische Zinsen", 221500, 230000, 265000, null, null, "G 40 % · R 40 % · B 20 %"],
          ["K14", "Verwaltungskostenbeitrag an den Landkreis", 372000, 380000, 395000, null, null, "G"],
          ["K15", "Öffentlichkeitsarbeit und Abfallberatung", 91300, 95000, 98000, null, null, "G"],
          { total: true, cells: ["", "Summe Kosten", { f: "SUM(C5:C19)" }, { f: "SUM(D5:D19)" }, { f: "SUM(E5:E19)" }, null, null, ""] },
          ["E01", "Erlöse Altpapiervermarktung", -452900, -410000, -360000, null, null, "G"],
          ["E02", "Erlöse Schrott und Elektroaltgeräte", -88400, -85000, -80000, null, null, "G"],
          ["E03", "Nebenentgelte der Systembetreiber (Verpackungen)", -236000, -240000, -248000, null, null, "G"],
          ["E04", "Entgelte Selbstanlieferung Wertstoffhöfe", -301700, -310000, -320000, null, null, "G"],
          { total: true, cells: ["", "Summe Erlöse", { f: "SUM(C21:C24)" }, { f: "SUM(D21:D24)" }, { f: "SUM(E21:E24)" }, null, null, ""] },
          ["A01", "Ausgleich Kostenüberdeckung aus Vorjahren (§ 6 Abs. 2 KAG)", -380000, -420000, -150000, null, null, "G"],
          { total: true, cells: ["", "Gebührenbedarf", { f: "C20+C25+C26" }, { f: "D20+D25+D26" }, { f: "E20+E25+E26" }, null, null, ""] },
        ].map((row) => {
          const cells = Array.isArray(row) ? [...row] : [...row.cells];
          cells[5] = { f: "E{r}-D{r}" };
          cells[6] = { f: "F{r}/D{r}" };
          return Array.isArray(row) ? cells : { total: true, cells };
        }),
        notes: [
          "Zuordnung: G = Grundgebühr, R = Leistungsgebühr Restabfall, B = Leistungsgebühr Bioabfall (Verteilung siehe Blatt „Gebührensätze“).",
          "Behandlungsentgelt Restabfall laut Entsorgungsvertrag 2026: 156,00 €/t (2025: 148,50 €/t).",
          "Erlöse Altpapier: Marktpreis im Sommer 2025 deutlich gesunken; Ansatz vorsichtig geschätzt.",
        ],
      },
      {
        name: "Bemessung",
        title: "Bemessungsgrundlagen",
        subtitle: "Bestand laut Veranlagung zum 30.06.2025, Ansatz 2026 fortgeschrieben",
        columns: [
          { header: "Bemessungsgröße", width: 34 },
          { header: "Einheit", width: 9 },
          { header: "Bestand 30.06.2025", width: 14, fmt: "int" },
          { header: "Ansatz 2026", width: 14, fmt: "int" },
          { header: "Veränderung", width: 12, fmt: "int" },
        ],
        rows: [
          ["Wohneinheiten (Grundgebühr)", "WE", 47850, 48120, { f: "D{r}-C{r}" }],
          ["Restabfallbehälter 60 l", "Stück", 8940, 9010, { f: "D{r}-C{r}" }],
          ["Restabfallbehälter 80 l", "Stück", 11230, 11300, { f: "D{r}-C{r}" }],
          ["Restabfallbehälter 120 l", "Stück", 14620, 14650, { f: "D{r}-C{r}" }],
          ["Restabfallbehälter 240 l", "Stück", 6410, 6380, { f: "D{r}-C{r}" }],
          ["Restabfallbehälter 1.100 l", "Stück", 640, 655, { f: "D{r}-C{r}" }],
          ["Biotonnen 120 l", "Stück", 18950, 19400, { f: "D{r}-C{r}" }],
          ["Biotonnen 240 l", "Stück", 4120, 4180, { f: "D{r}-C{r}" }],
          ["Restabfallmenge", "t", 21480, 21300, { f: "D{r}-C{r}" }],
          ["Bioabfallmenge", "t", 13920, 14100, { f: "D{r}-C{r}" }],
        ],
        notes: ["Alle Behälter werden 14-täglich geleert. Mengen in Tonnen nur zur Information (keine Gewichtsgebühr)."],
      },
      {
        name: "Gebührensätze",
        title: "Gebührensätze 2026 im Vergleich zu 2025",
        subtitle: "Gebühren je Jahr; Leistungsgebühren nach Behältervolumen",
        columns: [
          { header: "Gebührentatbestand", width: 44 },
          { header: "Kostenanteil 2026", width: 14, fmt: "eur0" },
          { header: "Bemessungsmenge", width: 14, fmt: "int" },
          { header: "Gebühr 2026", width: 12, fmt: "eur" },
          { header: "Gebühr 2025", width: 12, fmt: "eur" },
          { header: "Veränderung", width: 11, fmt: "pct" },
        ],
        rows: [
          [
            "Grundgebühr je Wohneinheit",
            {
              f: "Kosten!E5*0.5+Kosten!E8+Kosten!E9+Kosten!E12+Kosten!E13+Kosten!E14+Kosten!E15+Kosten!E16*0.4+Kosten!E17*0.4+Kosten!E18+Kosten!E19+Kosten!E21+Kosten!E22+Kosten!E23+Kosten!E24+Kosten!E26",
            },
            { f: "Bemessung!D5" },
            { f: "ROUND(B{r}/C{r},2)" },
            59.4,
            { f: "D{r}/E{r}-1" },
          ],
          [
            "Restabfall – Satz je 100 l Behältervolumen",
            { f: "Kosten!E5*0.35+Kosten!E6+Kosten!E10+Kosten!E16*0.4+Kosten!E17*0.4" },
            { f: "60*Bemessung!D6+80*Bemessung!D7+120*Bemessung!D8+240*Bemessung!D9+1100*Bemessung!D10" },
            { f: "ROUND(B{r}/C{r}*100,2)" },
            null,
            null,
          ],
          ["Restabfallbehälter 60 l", null, 60, { f: "ROUND(D6*C{r}/100,2)" }, 77.4, { f: "D{r}/E{r}-1" }],
          ["Restabfallbehälter 80 l", null, 80, { f: "ROUND(D6*C{r}/100,2)" }, 103.2, { f: "D{r}/E{r}-1" }],
          ["Restabfallbehälter 120 l", null, 120, { f: "ROUND(D6*C{r}/100,2)" }, 154.8, { f: "D{r}/E{r}-1" }],
          ["Restabfallbehälter 240 l", null, 240, { f: "ROUND(D6*C{r}/100,2)" }, 309.6, { f: "D{r}/E{r}-1" }],
          ["Restabfallbehälter 1.100 l", null, 1100, { f: "ROUND(D6*C{r}/100,2)" }, 1419, { f: "D{r}/E{r}-1" }],
          [
            "Bioabfall – Satz je 100 l Behältervolumen",
            { f: "Kosten!E5*0.15+Kosten!E7+Kosten!E11+Kosten!E16*0.2+Kosten!E17*0.2" },
            { f: "120*Bemessung!D11+240*Bemessung!D12" },
            { f: "ROUND(B{r}/C{r}*100,2)" },
            null,
            null,
          ],
          ["Biotonne 120 l", null, 120, { f: "ROUND(D12*C{r}/100,2)" }, 91.2, { f: "D{r}/E{r}-1" }],
          ["Biotonne 240 l", null, 240, { f: "ROUND(D12*C{r}/100,2)" }, 182.4, { f: "D{r}/E{r}-1" }],
          { total: true, cells: ["Summe der Kostenanteile", { f: "B5+B6+B12" }, null, null, null, null] },
          { total: true, cells: ["Abweichung zum Gebührenbedarf (Blatt Kosten)", { f: "B15-Kosten!E27" }, null, null, null, null] },
        ],
        notes: [
          "Bemessungsmenge: Wohneinheiten bzw. Liter Behältervolumen insgesamt (Ansatz 2026).",
          "Die Gebühr je Behälter ergibt sich aus dem Satz je 100 l, gerundet auf volle Cent.",
        ],
      },
      {
        name: "Musterhaushalte",
        title: "Musterhaushalte – jährliche Abfallgebühren",
        columns: [
          { header: "Musterhaushalt", width: 34 },
          { header: "Ausstattung", width: 40 },
          { header: "Gebühr 2025", width: 12, fmt: "eur" },
          { header: "Gebühr 2026", width: 12, fmt: "eur" },
          { header: "Mehrbelastung", width: 12, fmt: "eur" },
          { header: "Veränderung", width: 11, fmt: "pct" },
        ],
        rows: [
          ["Single-Haushalt", "1 WE, Restabfall 60 l, Biotonne 120 l", { f: "'Gebührensätze'!E5+'Gebührensätze'!E7+'Gebührensätze'!E13" }, { f: "'Gebührensätze'!D5+'Gebührensätze'!D7+'Gebührensätze'!D13" }],
          ["Familie mit zwei Kindern", "1 WE, Restabfall 120 l, Biotonne 120 l", { f: "'Gebührensätze'!E5+'Gebührensätze'!E9+'Gebührensätze'!E13" }, { f: "'Gebührensätze'!D5+'Gebührensätze'!D9+'Gebührensätze'!D13" }],
          ["Familie mit Eigenkompostierung", "1 WE, Restabfall 120 l, keine Biotonne", { f: "'Gebührensätze'!E5+'Gebührensätze'!E9" }, { f: "'Gebührensätze'!D5+'Gebührensätze'!D9" }],
          ["Mehrfamilienhaus mit 8 Wohneinheiten", "8 WE, Restabfall 1.100 l, zwei Biotonnen 240 l", { f: "8*'Gebührensätze'!E5+'Gebührensätze'!E11+2*'Gebührensätze'!E14" }, { f: "8*'Gebührensätze'!D5+'Gebührensätze'!D11+2*'Gebührensätze'!D14" }],
          ["– je Wohneinheit im Mehrfamilienhaus", "", { f: "ROUND(C8/8,2)" }, { f: "ROUND(D8/8,2)" }],
        ].map((row) => [...row, { f: "D{r}-C{r}" }, { f: "E{r}/C{r}" }]),
        notes: ["Grundlage für die Pressemitteilung und die Beschlussvorlage zur Änderung der Abfallgebührensatzung (Kreistag, Dezember 2025)."],
      },
    ],
  },
  // ── Schülerbeförderung: Linien, Fahrschüler, Kosten ────────────────
  {
    type: "excel",
    id: "am-schuelerbefoerderung-2026-27-linien-kosten",
    title: "Schülerbeförderung 2026/27 – Linien, Fahrschüler und Kosten",
    kind: "Übersicht",
    fileName: "Schuelerbefoerderung 2026-27 Linien Fahrschueler Kosten Stand 2026-08-19",
    org: "altmoorland",
    unit: "am-schule",
    author: "am-ehlers",
    date: "2026-08-19",
    tags: ["zahlen"],
    keywords: ["Reisedienst Moorkieker", "Haltestelle Moorweg", "Schule am Moorrand", "Schülerticket", "Mehrbedarf gegenüber Ansatz"],
    summary:
      "Arbeitsübersicht der Schülerbeförderung zum Schuljahr 2026/27: Fahrschüler und Ticketkosten je Buslinie, Touren des freigestellten Schülerverkehrs mit Kilometerpreisen, Gesamtkosten gegenüber dem Haushaltsansatz und Fahrplanänderungen (u. a. Wegfall der Haltestelle Moorweg).",
    sheets: [
      {
        name: "ÖPNV-Linien",
        title: "Schülerbeförderung im Linienverkehr – Schuljahr 2026/27",
        subtitle: "Anmeldungen bis 30.06.2026 · Schülerticket Altmoorland, 12 Monate",
        columns: [
          { header: "Linie", width: 7 },
          { header: "Verlauf", width: 38 },
          { header: "Schulen", width: 36 },
          { header: "Fahrschüler", width: 11, fmt: "int" },
          { header: "Schülerticket je Monat", width: 12, fmt: "eur" },
          { header: "Monate", width: 8, fmt: "int" },
          { header: "Jahreskosten", width: 14, fmt: "eur" },
          { header: "Fahrschüler Vorjahr", width: 11, fmt: "int" },
          { header: "Veränderung", width: 11, fmt: "int" },
        ],
        rows: [
          ["510", "Rabensfurt – Fennhusen – Altmoor", "KGS Fennhusen, Gymnasium Altmoor, BBS Altmoor", 612, 38.5, 12, null, 598],
          ["512", "Schilfwerder – Torfkamp – Fennhusen – Altmoor", "KGS Fennhusen, Gymnasium Altmoor", 348, 38.5, 12, null, 361],
          ["514", "Altmoor – Brackenhain – Heidhof – Krähenwerder", "Oberschule Brackenhain, Gymnasium Altmoor", 286, 38.5, 12, null, 279],
          ["520", "Stadtverkehr Rabensfurt (Linien 1 bis 4)", "Schulen in Rabensfurt", 455, 38.5, 12, null, 470],
          ["530", "Fennhusen – Lütjenbrook", "KGS Fennhusen", 132, 38.5, 12, null, 128],
          ["540", "Rabensfurt – Torfkamp", "Gymnasium Rabensfurt, IGS Rabensfurt", 198, 38.5, 12, null, 205],
          { total: true, cells: ["Summe", "", "", { f: "SUM(D{first}:D{last})" }, null, null, { f: "SUM(G{first}:G{last})" }, { f: "SUM(H{first}:H{last})" }, { f: "D{r}-H{r}" }] },
        ].map((row) => (Array.isArray(row) ? [...row.slice(0, 6), { f: "D{r}*E{r}*F{r}" }, row[7], { f: "D{r}-H{r}" }] : row)),
      },
      {
        name: "Freigestellter Verkehr",
        title: "Freigestellter Schülerverkehr – Touren 2026/27",
        subtitle: "Vergabe 2024, Vertragslaufzeit bis 31.07.2028",
        columns: [
          { header: "Tour", width: 6 },
          { header: "Einzugsgebiet", width: 30 },
          { header: "Schule", width: 28 },
          { header: "Unternehmen", width: 26 },
          { header: "Fahrzeug", width: 26 },
          { header: "Fahr-schüler", width: 9, fmt: "int" },
          { header: "km je Schultag", width: 9, fmt: "int" },
          { header: "Preis je km", width: 9, fmt: "eur" },
          { header: "Schultage", width: 9, fmt: "int" },
          { header: "Jahreskosten", width: 13, fmt: "eur" },
          { header: "Kosten je Fahrschüler", width: 12, fmt: "eur" },
        ],
        rows: [
          ["FS 1", "Kleinbracken, Heidhof", "Grundschule Brackenhain", "Reisedienst Moorkieker GmbH", "Bus (50 Plätze)", 46, 64, 3.1, 188],
          ["FS 2", "Moorhöfe Lütjenbrook", "Grundschule Lütjenbrook", "Taxi-Ruf Lütjenbrook", "Kleinbus (8 Plätze)", 7, 58, 2.45, 188],
          ["FS 3", "Krähenwerder-Ausbau", "Grundschule Brackenhain", "Reisedienst Moorkieker GmbH", "Bus (50 Plätze)", 31, 72, 3.1, 188],
          ["FS 4", "Tour Nord (Rabensfurt, Fennhusen)", "Schule am Moorrand (Förderschule, Altmoor)", "Fahrdienst Kranich gGmbH", "Kleinbus mit Rampe, Begleitperson", 9, 112, 3.85, 188],
          ["FS 5", "Tour Süd (Torfkamp, Schilfwerder)", "Schule am Moorrand (Förderschule, Altmoor)", "Fahrdienst Kranich gGmbH", "Kleinbus mit Rampe, Begleitperson", 8, 96, 3.85, 188],
          ["FS 6", "Tour Ost (Brackenhain, Krähenwerder, Lütjenbrook)", "Schule am Moorrand (Förderschule, Altmoor)", "Fahrdienst Kranich gGmbH", "Kleinbus mit Rampe, Begleitperson", 7, 128, 3.85, 188],
          ["FS 7", "Moorkolonie Torfkamp", "Grundschule Torfkamp", "Busbetrieb Lindemann", "Kleinbus (16 Plätze)", 21, 38, 2.9, 188],
          ["FS 8", "Achterdeich", "Grundschule Schilfwerder", "Busbetrieb Lindemann", "Kleinbus (16 Plätze)", 14, 34, 2.9, 188],
          {
            total: true,
            cells: ["Summe", "", "", "", "", { f: "SUM(F{first}:F{last})" }, { f: "SUM(G{first}:G{last})" }, null, null, { f: "SUM(J{first}:J{last})" }, { f: "J{r}/F{r}" }],
          },
        ].map((row) => (Array.isArray(row) ? [...row, { f: "G{r}*H{r}*I{r}" }, { f: "J{r}/F{r}" }] : row)),
        notes: ["Begleitpersonen der Förderschultouren werden gesondert abgerechnet (siehe Blatt „Übersicht“)."],
      },
      {
        name: "Übersicht",
        title: "Kosten der Schülerbeförderung 2026/27 im Überblick",
        columns: [
          { header: "Kostenart", width: 58 },
          { header: "Betrag", width: 15, fmt: "eur" },
          { header: "Anteil", width: 10, fmt: "pct" },
        ],
        rows: [
          ["Schülertickets im Linienverkehr", { f: "'ÖPNV-Linien'!G11" }, { f: "B{r}/B10" }],
          ["Freigestellter Schülerverkehr", { f: "'Freigestellter Verkehr'!J13" }, { f: "B{r}/B10" }],
          ["Einzelbeförderung (Taxi, Mietwagen; 23 Schülerinnen und Schüler)", 214600, { f: "B{r}/B10" }],
          ["Begleitpersonen Förderschultouren", 61200, { f: "B{r}/B10" }],
          ["Erstattung von Fahrtkosten an Eltern (Kilometerpauschale)", 18900, { f: "B{r}/B10" }],
          { total: true, cells: ["Summe Schuljahr 2026/27", { f: "SUM(B5:B9)" }, { f: "B{r}/B10" }] },
          ["Haushaltsansatz 2026, Produkt Schülerbeförderung", 1580000, null],
          { total: true, cells: ["Mehrbedarf gegenüber Ansatz", { f: "B10-B11" }, null] },
        ],
        notes: ["Schuljahr und Haushaltsjahr sind nicht deckungsgleich; der Vergleich dient der groben Einordnung für die Haushaltsplanung 2027."],
      },
      {
        name: "Änderungen 2026-27",
        title: "Änderungen im Linien- und Schülerverkehr zum Schuljahr 2026/27",
        subtitle: "Abgestimmt mit dem Fachdienst Kreisstraßen und ÖPNV · Fahrplanwechsel am 24.08.2026",
        columns: [
          { header: "Linie/Tour", width: 9 },
          { header: "Änderung", width: 56 },
          { header: "betroffene Fahrschüler (Anmeldungen)", width: 13, fmt: "int" },
          { header: "Ersatz / Hinweis", width: 40 },
          { header: "Fußweg zur Ersatzhaltestelle (km)", width: 13, fmt: "dec" },
        ],
        rows: [
          ["512", "Haltestelle Moorweg (Torfkamp) entfällt – weniger als 5 Ein- und Aussteiger je Tag", 1, "Ersatzhaltestelle Torfkamp, Dorfstraße", 1.4],
          ["512", "Haltestelle Torfkamp-Ziegelei entfällt", 0, "Ersatzhaltestelle Torfkamp, Ziegeleiweg", 0.6],
          ["510", "Schulfahrt 06:42 ab Rabensfurt Bahnhof wird 5 Minuten früher gelegt (Unterrichtsbeginn KGS Fennhusen 07:50)", 118, "Anschluss an den Regionalzug aus Rhedenburg bleibt", null],
          ["514", "Zusätzliche Fahrt 13:20 ab Oberschule Brackenhain (Ganztag)", 64, "–", null],
          ["530", "Verstärkerfahrt 07:05 ab Lütjenbrook entfällt (zu geringe Auslastung)", 22, "Fahrt 07:12 mit Gelenkbus", null],
          ["FS 3", "Neue Haltestelle Krähenwerder, Am Deich", 6, "–", null],
        ],
        notes: ["Anmeldungen, die nach dem 30.06.2026 eingegangen sind, sind in den Spalten noch nicht berücksichtigt."],
      },
    ],
  },
  // ── Untere Bauaufsicht: Jahresstatistik ────────────────────────────
  {
    type: "excel",
    id: "am-bauantragsstatistik-2025",
    title: "Bauantragsstatistik der Unteren Bauaufsichtsbehörde 2025",
    kind: "Statistik",
    fileName: "Bauaufsicht Bauantragsstatistik 2025 Jahresauswertung",
    org: "altmoorland",
    unit: "am-bauaufsicht",
    author: "am-hinrichs",
    date: "2026-01-20",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Genehmigungsfreistellung", "Bauvoranfragen", "Bearbeitungsdauer", "Rücknahmen"],
    summary:
      "Jahresstatistik der Bauaufsicht: Eingänge nach Gemeinde und Verfahrensart, Quartalsverlauf und Kennzahlen. Eingebaute Widersprüche: 1.181 Eingänge nach Gemeinden, aber 1.196 im Quartalsverlauf; das Kennzahlenblatt nennt 58 Tage Bearbeitungsdauer und 371 offene Verfahren statt 63,8 Tagen und 393.",
    sheets: [
      {
        name: "Eingänge",
        title: "Untere Bauaufsichtsbehörde – Eingänge 2025 nach Gemeinden",
        columns: [
          { header: "Gemeinde", width: 16 },
          { header: "Baugenehmigungs-verfahren", width: 14, fmt: "int" },
          { header: "Vereinfachte Verfahren", width: 13, fmt: "int" },
          { header: "Genehmigungsfreistellung", width: 14, fmt: "int" },
          { header: "Bauvoranfragen", width: 12, fmt: "int" },
          { header: "Eingänge gesamt", width: 11, fmt: "int" },
          { header: "Eingänge 2024", width: 11, fmt: "int" },
          { header: "Veränderung", width: 11, fmt: "pct" },
        ],
        rows: [
          ["Rabensfurt", 96, 218, 41, 38, null, 415],
          ["Altmoor", 61, 154, 29, 27, null, 265],
          ["Fennhusen", 34, 88, 22, 15, null, 171],
          ["Torfkamp", 27, 69, 14, 12, null, 130],
          ["Brackenhain", 22, 51, 9, 11, null, 104],
          ["Schilfwerder", 15, 38, 6, 7, null, 61],
          ["Lütjenbrook", 11, 26, 3, 6, null, 52],
          ["Krähenwerder", 8, 17, 2, 4, null, 37],
          { total: true, cells: ["Summe", null, null, null, null, null, null, null] },
        ].map((row) =>
          Array.isArray(row)
            ? [...row.slice(0, 5), { f: "SUM(B{r}:E{r})" }, row[6], { f: "F{r}/G{r}-1" }]
            : { total: true, cells: ["Summe", ...["B", "C", "D", "E", "F", "G"].map((c) => ({ f: `SUM(${c}{first}:${c}{last})` })), { f: "F{r}/G{r}-1" }] },
        ),
      },
      {
        name: "Quartale",
        title: "Verlauf 2025 nach Quartalen",
        columns: [
          { header: "Zeitraum", width: 20 },
          { header: "Eingänge", width: 10, fmt: "int" },
          { header: "Genehmigungen", width: 13, fmt: "int" },
          { header: "Ablehnungen", width: 11, fmt: "int" },
          { header: "Rücknahmen", width: 11, fmt: "int" },
          { header: "Erledigungen", width: 11, fmt: "int" },
          { header: "Bestand offen", width: 11, fmt: "int" },
          { header: "Ø Bearbeitungsdauer (Tage)", width: 13, fmt: "dec" },
        ],
        rows: [
          ["Übertrag 31.12.2024", null, null, null, null, null, 412, null],
          ["1. Quartal", 288, 245, 9, 15, { f: "C{r}+D{r}+E{r}" }, { f: "G5+B{r}-F{r}" }, 63],
          ["2. Quartal", 337, 308, 12, 16, { f: "C{r}+D{r}+E{r}" }, { f: "G6+B{r}-F{r}" }, 70],
          ["3. Quartal", 286, 272, 9, 14, { f: "C{r}+D{r}+E{r}" }, { f: "G7+B{r}-F{r}" }, 64],
          ["4. Quartal", 285, 291, 9, 15, { f: "C{r}+D{r}+E{r}" }, { f: "G8+B{r}-F{r}" }, 58],
          {
            total: true,
            cells: ["Jahr 2025", { f: "SUM(B6:B9)" }, { f: "SUM(C6:C9)" }, { f: "SUM(D6:D9)" }, { f: "SUM(E6:E9)" }, { f: "SUM(F6:F9)" }, { f: "G9" }, { f: "ROUND(AVERAGE(H6:H9),1)" }],
          },
        ],
        notes: ["Quelle: Fachverfahren Bauaufsicht, Auswertung vom 08.01.2026."],
      },
      {
        name: "Kennzahlen",
        title: "Kennzahlen für den Jahresbericht an den Bauausschuss",
        columns: [
          { header: "Kennzahl", width: 40 },
          { header: "2025", width: 10, fmt: "int" },
          { header: "2024", width: 10, fmt: "int" },
          { header: "Bemerkung", width: 44 },
        ],
        rows: [
          ["Eingänge gesamt", { f: "'Eingänge'!F13" }, 1235, "Rückgang vor allem in Rabensfurt und Brackenhain"],
          ["Erledigte Verfahren", { f: "Quartale!F10" }, 1188, ""],
          ["Genehmigungsquote (Genehmigungen je Erledigung)", { f: "Quartale!C10/Quartale!F10", fmt: "pct" }, "90,4 %", ""],
          ["Ø Bearbeitungsdauer bis Bescheid (Tage)", 58, 61, "Zielwert von 60 Tagen erstmals unterschritten"],
          ["Offene Verfahren am 31.12.", 371, 412, "Rückstand um 10 % abgebaut"],
          ["Erledigungen je VZÄ (14,5 VZÄ)", { f: "ROUND(B6/14.5,0)" }, 79, "2024: 15,0 VZÄ"],
        ],
      },
    ],
  },
  // ── Kreisstraßen und ÖPNV: Rufbus „Moorflitzer“ ────────────────────
  {
    type: "powerpoint",
    id: "am-rufbus-moorflitzer-ergebnisse-pilotjahr",
    title: "Rufbus „Moorflitzer“ – Ergebnisse nach einem Pilotjahr",
    kind: "Präsentation",
    fileName: "2026-05-07 Ausschuss Bauen Umwelt Verkehr Rufbus Moorflitzer Pilotjahr",
    org: "altmoorland",
    unit: "am-kreisstrassen",
    author: "am-jacobsen",
    date: "2026-04-29",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Moorflitzer", "Bündelungsquote", "Kostendeckungsgrad", "Bediengebiet Nord", "14.680"],
    summary:
      "Ausschusspräsentation zum Rufbus-Pilot im Bediengebiet Nord: Fahrgäste je Monat, Kennzahlen, Fahrtzwecke, Kosten und Empfehlungen. Eingebaute Widersprüche: Die Kennzahlentabelle nennt 14.680 Fahrgäste, die Monatswerte ergeben 13.680; das Fazit behauptet eine Verdopplung im zweiten Halbjahr, tatsächlich sind es rund 79 % mehr.",
    slides: [
      { t: "title", title: "Rufbus „Moorflitzer“", subtitle: "Ergebnisse nach einem Pilotjahr – Ausschuss für Bauen, Umwelt und Verkehr am 7. Mai 2026" },
      {
        t: "bullets",
        title: "Der Pilot in Kürze",
        bullets: [
          "Bediengebiet Nord: Brackenhain mit Heidhof und Kleinbracken, Krähenwerder, Lütjenbrook (rund 13.400 Einwohner)",
          "Laufzeit 01.04.2025 bis 31.03.2027, Linienbedarfsverkehr nach § 44 PBefG",
          { text: "Bedienzeiten", sub: ["Montag bis Freitag 6 bis 21 Uhr", "Samstag 8 bis 21 Uhr, Sonn- und Feiertage 10 bis 19 Uhr"] },
          "Buchung per App, online oder telefonisch (040 66969-388) bis 60 Minuten vor Fahrtantritt",
          "3 Fahrzeuge (eines mit Rampe), 214 virtuelle Haltepunkte; Kreistarif und Deutschlandticket gelten",
        ],
        notes:
          "Betrieb durch die Reisedienst Moorkieker GmbH nach Vergabe im Dezember 2024. Buchungsplattform und Telefonzentrale stellt ein Dienstleister. Zuschlag für die Haustür gibt es nicht.",
      },
      {
        t: "chart",
        title: "Fahrgäste je Monat",
        chart: {
          type: "line",
          categories: ["Apr 25", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez", "Jan 26", "Feb", "Mär"],
          series: [{ name: "Fahrgäste", values: [410, 690, 880, 920, 860, 1140, 1420, 1510, 1380, 1290, 1460, 1720] }],
          unit: "Fahrgäste",
        },
        caption: "Quelle: Buchungsplattform, beförderte Fahrgäste einschließlich Kinder",
        notes: "Delle im August: Sommerferien und Sperrung der Ortsdurchfahrt Heidhof. Höchstwert im März 2026.",
      },
      {
        t: "table",
        title: "Kennzahlen des ersten Pilotjahrs",
        header: ["Kennzahl", "Wert", "Zielwert"],
        rows: [
          ["Fahrgäste", "14.680", "12.000"],
          ["Fahrten (Buchungen)", "9.870", "–"],
          ["Bündelungsquote (Fahrgäste je Fahrt)", "1,39", "1,5"],
          ["Ø Abweichung von der Wunschzeit", "11 Minuten", "höchstens 15 Minuten"],
          ["Pünktlichkeit (± 5 Minuten)", "94 %", "90 %"],
          ["Abgelehnte Fahrtwünsche", "6,2 %", "unter 5 %"],
          ["Buchungen per Telefon", "38 %", "–"],
          ["Kostendeckungsgrad", "6,5 %", "10 %"],
          ["Zuschuss je Fahrgast", "33,23 €", "höchstens 30 €"],
        ],
        notes: "Die Fahrgastzahl ist der wichtigste Erfolgsmaßstab aus dem Kreistagsbeschluss vom März 2024. Der Zielwert ist deutlich übertroffen.",
      },
      {
        t: "chart",
        title: "Fahrten nach Ort (Start oder Ziel im Bediengebiet)",
        chart: {
          type: "bar",
          categories: ["Brackenhain", "Heidhof", "Kleinbracken", "Krähenwerder", "Lütjenbrook"],
          series: [{ name: "Fahrten", values: [3950, 1420, 980, 1860, 1660] }],
          unit: "Fahrten",
        },
        notes: "Häufigste Ziele: Umstieg auf die Linie 514 in Brackenhain (Richtung Altmoor), Ärztehaus Brackenhain, Supermarkt am Ortsrand.",
      },
      {
        t: "chart",
        title: "Wofür wird der Moorflitzer genutzt?",
        chart: {
          type: "pie",
          categories: ["Arbeit und Ausbildung", "Einkauf und Erledigungen", "Arzt und Gesundheit", "Freizeit und Besuche", "Schule"],
          series: [{ name: "Anteil", values: [31, 24, 18, 17, 10] }],
          unit: "%",
        },
        caption: "Fahrgastbefragung im Februar 2026, 412 Antworten",
      },
      {
        t: "twocol",
        title: "Was gut läuft – was besser werden muss",
        left: {
          heading: "Gut",
          bullets: ["Zufriedenheit 4,5 von 5", "Ältere Menschen buchen gern per Telefon", "Anschluss an die Linie 514 klappt", "Kaum Beschwerden über das Fahrpersonal"],
        },
        right: {
          heading: "Besser werden muss",
          bullets: ["Freitag- und Samstagabend viele Ablehnungen", "App-Probleme nach dem Update im Oktober 2025", "Virtuelle Haltepunkte schwer zu finden", "Telefonzentrale nur bis 18 Uhr besetzt"],
        },
      },
      {
        t: "table",
        title: "Kosten und Finanzierung (April 2025 bis März 2026)",
        header: ["Position", "Betrag"],
        rows: [
          ["Betriebsleistung Verkehrsunternehmen", "398.000 €"],
          ["Buchungsplattform (Lizenz und Betrieb)", "46.000 €"],
          ["Telefonzentrale", "28.000 €"],
          ["Marketing, Schilder für Haltepunkte", "14.000 €"],
          ["Kosten gesamt", "486.000 €"],
          ["Fahrgeldeinnahmen", "– 31.400 €"],
          ["Landesförderung (60 % des Defizits)", "– 272.760 €"],
          ["Eigenanteil Landkreis", "181.840 €"],
        ],
      },
      {
        t: "bullets",
        title: "Empfehlungen der Verwaltung",
        bullets: [
          "Pilot bis 31.03.2027 fortführen, danach als Regelangebot in den Nahverkehrsplan 2027–2031 übernehmen",
          "Freitag und Samstag Bedienung bis 23 Uhr (Mehrkosten rund 38.000 € im Jahr)",
          "Telefonzentrale bis 20 Uhr besetzen",
          "Vorbuchfrist von 60 auf 30 Minuten verkürzen",
          "Bediengebiet Süd (Torfkamp, Schilfwerder) ab 2027 prüfen",
        ],
        notes: "Der Beschlussvorschlag folgt mit der Vorlage zum Nahverkehrsplan im Herbst.",
      },
      {
        t: "bullets",
        title: "Fazit",
        bullets: [
          "Der Moorflitzer wird angenommen: Im zweiten Halbjahr hat sich die Fahrgastzahl gegenüber dem ersten Halbjahr **verdoppelt**.",
          "Zielwert von 12.000 Fahrgästen im ersten Jahr klar übertroffen",
          "Wirtschaftlichkeit noch nicht am Ziel: Zuschuss je Fahrgast über 30 €",
        ],
        notes: "Erstes Halbjahr: April bis September 2025. Zweites Halbjahr: Oktober 2025 bis März 2026.",
      },
      {
        t: "end",
        title: "Vielen Dank für Ihre Aufmerksamkeit",
        lines: ["Maren Thießen · Fachdienstleiterin Kreisstraßen und ÖPNV", "Torben Jacobsen · ÖPNV-Planung · Telefon 040 66969-362"],
      },
    ],
  },
  // ── Gesundheitsamt: Jahresbericht ──────────────────────────────────
  {
    type: "powerpoint",
    id: "am-gesundheitsamt-jahresbericht-2025",
    title: "Jahresbericht 2025 des Gesundheitsamts",
    kind: "Präsentation",
    fileName: "Gesundheitsamt Jahresbericht 2025 Ausschuss Soziales und Gesundheit",
    org: "altmoorland",
    unit: "am-gesundheit",
    author: "am-sander",
    date: "2026-03-16",
    tags: ["zahlen"],
    keywords: ["Schuleingangsuntersuchungen", "Sozialpsychiatrischer Dienst", "Abkochgebot", "Masernschutz", "Ausbrüche in Gemeinschaftseinrichtungen"],
    summary:
      "Jahresbericht der Amtsärztin für den Fachausschuss: Personal, meldepflichtige Infektionen, Ausbrüche in Gemeinschaftseinrichtungen, Schuleingangsuntersuchungen nach Gemeinden, Trinkwasser mit dem Abkochgebot Heidhof, Sozialpsychiatrischer Dienst und Ausblick.",
    slides: [
      { t: "title", title: "Gesundheitsamt Altmoorland – Jahresbericht 2025", subtitle: "Ausschuss für Soziales und Gesundheit am 25. März 2026" },
      {
        t: "bullets",
        title: "Das Gesundheitsamt in Zahlen",
        bullets: [
          "46 Beschäftigte auf 38,2 Vollzeitstellen",
          "Ärztlicher Dienst: 4 von 6 Arztstellen besetzt",
          "Aufwendungen 2025: 4,1 Mio. €",
          {
            text: "Sechs Sachgebiete",
            sub: [
              "Infektionsschutz und Hygiene",
              "Kinder- und Jugendgesundheitsdienst",
              "Sozialpsychiatrischer Dienst",
              "Amtsärztlicher Dienst und Gutachten",
              "Umweltbezogener Gesundheitsschutz, Trinkwasser",
              "Gesundheitsplanung",
            ],
          },
        ],
      },
      {
        t: "chart",
        title: "Meldepflichtige Infektionen 2024 und 2025",
        chart: {
          type: "bar",
          categories: ["Influenza", "COVID-19", "Norovirus", "RSV", "Campylobacter", "Rotavirus", "Salmonellen"],
          series: [
            { name: "2024", values: [1240, 980, 312, 210, 118, 64, 22] },
            { name: "2025", values: [1460, 610, 356, 295, 131, 58, 27] },
          ],
          unit: "Fälle",
        },
        notes: "Labordiagnostisch bestätigte Fälle nach IfSG. Die Influenza-Saison 2024/25 war besonders stark; COVID-19 deutlich rückläufig.",
      },
      {
        t: "table",
        title: "Ausbrüche in Gemeinschaftseinrichtungen 2025",
        header: ["Einrichtungsart", "Ausbrüche", "davon Norovirus", "Erkrankte"],
        rows: [
          ["Kindertagesstätten", "14", "9", "212"],
          ["Schulen", "3", "1", "64"],
          ["Alten- und Pflegeheime", "6", "2", "131"],
          ["Krankenhaus", "1", "0", "9"],
          ["Summe", "24", "12", "416"],
        ],
        notes:
          "Größter Kita-Ausbruch: Gemeindekindergarten Lindenhof in Brackenhain im Februar 2025 mit 14 erkrankten Kindern und 3 Beschäftigten. Die Meldewege der Einrichtungen laufen seit April 2025 stabil über das Online-Formular.",
      },
      {
        t: "table",
        title: "Schuleingangsuntersuchungen 2025 nach Gemeinden",
        header: ["Gemeinde", "Untersuchte Kinder", "Sprachförderbedarf", "Übergewicht", "Masernschutz unvollständig"],
        rows: [
          ["Rabensfurt", "318", "27 %", "12 %", "8 %"],
          ["Altmoor", "196", "25 %", "11 %", "7 %"],
          ["Fennhusen", "98", "22 %", "10 %", "6 %"],
          ["Torfkamp", "81", "21 %", "12 %", "5 %"],
          ["Brackenhain", "59", "19 %", "9 %", "7 %"],
          ["Schilfwerder", "49", "20 %", "10 %", "4 %"],
          ["Lütjenbrook", "35", "17 %", "11 %", "6 %"],
          ["Krähenwerder", "26", "23 %", "8 %", "4 %"],
          ["Kreis", "862", "24 %", "11 %", "7 %"],
        ],
        notes:
          "Untersucht wurden alle Kinder des Einschulungsjahrgangs 2025. Masernschutz unvollständig heißt: Der Nachweis nach § 20 Abs. 9 IfSG fehlte oder war lückenhaft; die Eltern wurden angeschrieben.",
      },
      {
        t: "chart",
        title: "Auffälligkeiten bei der Schuleingangsuntersuchung",
        chart: {
          type: "bar",
          categories: ["Sprachentwicklung", "Feinmotorik", "Übergewicht", "Sehen", "Masernschutz unvollständig", "Hören"],
          series: [
            { name: "2024", values: [22.9, 13.8, 10.6, 9.4, 7.9, 4.6] },
            { name: "2025", values: [23.9, 14.5, 11.1, 9.1, 6.8, 4.3] },
          ],
          unit: "%",
        },
        caption: "Anteil der untersuchten Kinder im Landkreis",
      },
      {
        t: "bullets",
        title: "Trinkwasser",
        bullets: [
          "38 Wasserversorgungsanlagen überwacht, 1.214 Proben ausgewertet",
          "**Abkochgebot** vom 15. bis 24. Juli 2025 für Heidhof, Kleinbracken und Krähenwerder (rund 4.100 Menschen) nach E.-coli-Befund im Hochbehälter Heidhof",
          "Ursache: undichte Lüftungsöffnung nach Starkregen, inzwischen saniert",
          "Legionellen: 27 Großanlagen mit Überschreitung des technischen Maßnahmenwerts, 3 mit Duschverbot",
        ],
        notes: "Das Abkochgebot dauerte neun Tage. Aufgehoben wurde es nach drei einwandfreien Befunden in Folge.",
      },
      {
        t: "bullets",
        title: "Sozialpsychiatrischer Dienst und Gutachten",
        bullets: [
          "1.120 betreute Personen (2024: 1.040)",
          "186 Kriseneinsätze, davon 74 Unterbringungen nach dem PsychKG",
          "1.410 amtsärztliche Gutachten (Verbeamtung, Dienstfähigkeit, Prüfungsunfähigkeit, Eingliederungshilfe)",
          "Wartezeit auf eine Begutachtung: 7 Wochen",
        ],
      },
      {
        t: "bullets",
        title: "Herausforderungen und Ausblick 2026",
        bullets: [
          "Zwei Arztstellen seit über einem Jahr unbesetzt – neue Ausschreibung mit Fachkräftezulage",
          "Befristete Mittel für den öffentlichen Gesundheitsdienst enden 2026: 5 Stellen betroffen",
          "Hitzeaktionsplan für den Landkreis bis Sommer 2026",
          "Schuleingangsuntersuchungen früher beginnen, damit Förderbedarfe vor der Einschulung erkannt werden",
        ],
        notes: "Zu den befristeten Stellen ist eine Entscheidung im Haushalt 2027 nötig; die Verwaltung legt dazu im Juni eine Vorlage vor.",
      },
      { t: "end", title: "Vielen Dank!", lines: ["Dr. Miriam Sander · Amtsärztin, Leiterin Gesundheitsamt", "Telefon 040 66969-210"] },
    ],
  },
  // ── Kreisstraßen und ÖPNV: Nahverkehrsplan (lang) ──────────────────
  {
    type: "word",
    id: "am-nahverkehrsplan-2027-2031-entwurf-bedienstandards-rufbus",
    title: "Nahverkehrsplan 2027–2031 (Entwurf) – Auszug Bedienungsstandards und Rufbus",
    kind: "Nahverkehrsplan (Entwurf, Auszug)",
    fileName: "Nahverkehrsplan 2027-2031 Entwurf Auszug Kap 4-6 Bedienungsstandards Rufbus Stand 2026-06-17",
    org: "altmoorland",
    unit: "am-kreisstrassen",
    author: "am-thiessen",
    date: "2026-06-17",
    keywords: ["Linienbedarfsverkehr", "Erschließungsgrad", "Moorflitzer", "Bediengebiet Süd", "§ 8 Abs. 3 PBefG", "Haltestelle Moorweg"],
    summary:
      "Umfangreicher Auszug aus dem Entwurf des Nahverkehrsplans: Netzhierarchie, Erschließungs- und Bedienungsstandards, Haltestellen und Barrierefreiheit, Fahrzeuge und Tarif, Rufbus „Moorflitzer“ mit Pilotergebnissen und neuen Bediengebieten sowie Maßnahmenprogramm mit Kosten. Gut zum Zusammenfassen, für Folien und für eine Bürgerinformation.",
    meta: [
      ["Aktenzeichen", "65.2-NVP 2027/26"],
      ["Stand", "Entwurf zur Beteiligung"],
      ["Status", "öffentlich"],
    ],
    subject: "Nahverkehrsplan des Landkreises Altmoorland 2027–2031 – Entwurf, Auszug: Kapitel 4 bis 6",
    blocks: [
      { t: "h1", text: "Vorbemerkung" },
      {
        t: "p",
        text: "Dieses Dokument enthält die Kapitel 4 bis 6 des Entwurfs. Die Kapitel 1 bis 3 (Rechtsgrundlagen, Bestandsaufnahme, Verkehrsnachfrage) und die Anlagen (Liniensteckbriefe, Haltestellenkataster, Liste der Ausnahmen von der Barrierefreiheit) liegen gesondert vor. Der Entwurf wurde im Ausschuss für Bauen, Umwelt und Verkehr am 07.05.2026 vorberaten. Er wird nach § 8 Abs. 3 PBefG mit den vorhandenen Verkehrsunternehmen, den kreisangehörigen Gemeinden, dem Behindertenbeirat und dem Fahrgastbeirat abgestimmt; das weitere Verfahren ist am Ende dieses Auszugs beschrieben.",
      },
      {
        t: "p",
        text: "Der Nahverkehrsplan ist das zentrale Planungsinstrument des Landkreises als Aufgabenträger für den straßengebundenen öffentlichen Personennahverkehr. Er legt fest, welches Angebot als ausreichende Verkehrsbedienung gilt, und bildet die Grundlage für Liniengenehmigungen, öffentliche Dienstleistungsaufträge und die Finanzplanung. Für den Schienenpersonennahverkehr ist das Land Aufgabenträger; die Regionalbahn Rhedenburg – Altmoor – Rabensfurt wird hier nur nachrichtlich und als Verknüpfungsachse berücksichtigt.",
      },
      { t: "h1", text: "4 Bedienungsstandards" },
      { t: "h2", text: "4.1 Zweck und Verbindlichkeit" },
      {
        t: "p",
        text: "Die folgenden Standards beschreiben die ausreichende Verkehrsbedienung im Sinne des § 8 Abs. 3 PBefG und des ÖPNV-Gesetzes des Landes (ÖPNVG). Sie sind Mindeststandards: Die Genehmigungsbehörde berücksichtigt sie bei Entscheidungen nach § 13 Abs. 2a PBefG, und der Landkreis legt sie öffentlichen Dienstleistungsaufträgen nach der Verordnung (EG) Nr. 1370/2007 zugrunde. Ein höheres Angebot ist zulässig, wenn es eigenwirtschaftlich erbracht oder vom Kreistag zusätzlich finanziert wird.",
      },
      {
        t: "p",
        text: "Abweichungen nach unten sind nur zulässig, wenn die Einhaltung eines Standards mit unverhältnismäßigem Aufwand verbunden wäre und die Verbindung auf andere Weise, insbesondere durch den Rufbus, gesichert ist. Abweichungen werden im jährlichen Qualitätsbericht (Abschnitt 4.9) begründet. Die Standards gelten ab dem Fahrplanwechsel im August 2027; bis dahin gelten die Standards des Nahverkehrsplans 2020–2024 fort.",
      },
      { t: "h2", text: "4.2 Raumstruktur und Netzhierarchie" },
      {
        t: "p",
        text: "Der Landkreis Altmoorland hat 101.840 Einwohnerinnen und Einwohner (31.12.2024). Mittelzentren sind die Stadt Rabensfurt (38.600) und die Kreisstadt Altmoor (24.100). Grundzentren sind Fennhusen (11.200), Torfkamp (9.400) und Brackenhain (6.840). Schilfwerder (5.100), Lütjenbrook (3.900) und Krähenwerder (2.700) haben keine zentralörtliche Funktion. Rund 31 % der Bevölkerung leben in Ortsteilen mit weniger als 500 Einwohnern, viele davon in Streusiedlungen und Moorkolonien. Für diese Räume ist ein Linienverkehr mit festen Fahrplänen wirtschaftlich nicht darstellbar; hier setzt der Plan auf flexible Bedienformen.",
      },
      {
        t: "table",
        header: ["Netzebene", "Funktion", "Linien (Bestand 2026)", "Bedienform"],
        rows: [
          ["1 Schiene", "Anbindung an die Landeshauptstadt", "Regionalbahn Rhedenburg – Altmoor – Rabensfurt (Aufgabenträger: Land)", "Stundentakt"],
          ["2 Hauptlinien", "Verbindung der Mittel- und Grundzentren im Takt", "510 Rabensfurt – Fennhusen – Altmoor; 512 Schilfwerder – Torfkamp – Fennhusen – Altmoor", "Linienverkehr, vertakteter Fahrplan"],
          ["3 Regionallinien", "Erschließung der Grundzentren und größeren Orte", "514 Altmoor – Brackenhain – Krähenwerder; 530 Fennhusen – Lütjenbrook; 540 Rabensfurt – Torfkamp", "Linienverkehr, verdichtet zu Schulzeiten"],
          ["4 Stadtverkehr", "Erschließung innerhalb Rabensfurts", "520 (Linien 1 bis 4)", "Linienverkehr"],
          ["5 Flexible Bedienung", "Fläche, Randzeiten, kleine Ortsteile", "Rufbus „Moorflitzer“ (Bediengebiet Nord)", "Linienbedarfsverkehr nach § 44 PBefG"],
        ],
        widths: [2, 3, 4, 2.5],
      },
      {
        t: "p",
        text: "Die Hauptlinien bilden das Rückgrat des Netzes. Sie verkehren auf direktem Weg, halten an den Verknüpfungspunkten mit der Bahn und werden im Takt gefahren. Die Linie 512 wird bis 2028 zur vollwertigen Hauptlinie ausgebaut (Maßnahme M2). Regionallinien erschließen die Grundzentren und dienen in hohem Maß dem Schülerverkehr. Die flexible Bedienung ergänzt das Liniennetz in der Fläche und zu Zeiten schwacher Nachfrage; sie soll Fahrgäste zu den Haupt- und Regionallinien bringen und nicht parallel zu ihnen fahren.",
      },
      { t: "h2", text: "4.3 Erschließung" },
      {
        t: "p",
        text: "Eine Ortslage gilt als erschlossen, wenn sie im Einzugsbereich einer Haltestelle liegt, die mindestens die Mindestbedienung nach Abschnitt 4.4 erhält. Der **Erschließungsgrad** ist der Anteil der Einwohnerinnen und Einwohner, die in einem so erschlossenen Bereich wohnen. Die Einzugsbereiche werden als Luftlinienradius um die Haltestelle bemessen; topografische Barrieren (Gewässer, Bahnlinie, fehlende Querungen) werden berücksichtigt.",
      },
      {
        t: "table",
        header: ["Raumkategorie", "Einzugsradius Bushaltestelle", "Einzugsradius Bahnhaltepunkt", "Zielwert Erschließungsgrad"],
        rows: [
          ["Kernbereiche der Mittelzentren", "400 m", "1.000 m", "95 %"],
          ["Übrige Ortslagen der Mittel- und Grundzentren", "600 m", "1.200 m", "90 %"],
          ["Ländliche Ortslagen ab 200 Einwohnern", "800 m", "1.500 m", "85 %"],
          ["Ortslagen unter 200 Einwohnern, Streusiedlungen", "Rufbus: virtueller Haltepunkt in höchstens 300 m", "–", "80 %"],
        ],
        widths: [3.5, 2.5, 2, 2],
      },
      {
        t: "p",
        text: "Der Erschließungsgrad lag 2025 kreisweit bei 86,4 %. Defizite bestehen vor allem in den Außenbereichen von Torfkamp (Moorkolonie), Schilfwerder (Achterdeich) und Fennhusen, wo zusammen rund 4.700 Menschen ohne ausreichende Erschließung wohnen. Im Bediengebiet Nord ist der Erschließungsgrad durch den Rufbus „Moorflitzer“ von 79 % auf 98 % gestiegen. Mit den Bediengebieten Süd und West (Abschnitt 5.4) soll der kreisweite Wert bis 2031 auf mindestens 95 % steigen.",
      },
      { t: "h2", text: "4.4 Bedienungshäufigkeit und Bedienungszeitraum" },
      {
        t: "p",
        text: "Die Bedienungshäufigkeit richtet sich nach der Bedeutung der Verbindung. Angegeben ist jeweils der höchstzulässige Abstand zwischen zwei Fahrten (Takt) in jeder Richtung. Als Hauptverkehrszeit gelten montags bis freitags 6 bis 9 Uhr und 12 bis 18 Uhr, als Normalverkehrszeit die übrige Zeit bis 20 Uhr. Eine Mindestbedienung liegt vor, wenn eine Haltestelle montags bis freitags mindestens sechs Fahrtenpaare erhält oder im Bediengebiet eines Rufbusses liegt.",
      },
      {
        t: "table",
        header: ["Verbindung", "Mo–Fr Hauptverkehrszeit", "Mo–Fr Normalverkehrszeit", "Samstag", "Sonn- und Feiertag"],
        rows: [
          ["Mittelzentrum – Mittelzentrum (Rabensfurt – Altmoor)", "30 min", "60 min", "60 min", "120 min"],
          ["Grundzentrum – Mittelzentrum", "60 min", "60 min", "120 min", "120 min oder Rufbus"],
          ["Ländliche Gemeinde – Grundzentrum", "60 min (Schulzeiten)", "120 min", "3 Fahrtenpaare oder Rufbus", "Rufbus"],
          ["Ortsteile unter 200 Einwohnern", "Rufbus", "Rufbus", "Rufbus", "Rufbus"],
          ["Stadtverkehr Rabensfurt", "20 min", "30 min", "30 min", "60 min"],
        ],
        widths: [3.5, 2, 2, 2, 2],
      },
      {
        t: "table",
        header: ["Bedienungszeitraum", "Montag bis Freitag", "Samstag", "Sonn- und Feiertag"],
        rows: [
          ["Hauptlinien", "5:00 bis 23:00 Uhr", "6:00 bis 23:00 Uhr", "8:00 bis 22:00 Uhr"],
          ["Regionallinien", "5:30 bis 20:00 Uhr", "7:00 bis 19:00 Uhr", "Rufbus"],
          ["Stadtverkehr Rabensfurt", "5:30 bis 22:00 Uhr", "7:00 bis 22:00 Uhr", "9:00 bis 20:00 Uhr"],
          ["Rufbus", "6:00 bis 21:00 Uhr, freitags ab 2027 bis 23:00 Uhr", "8:00 bis 23:00 Uhr (ab 2027)", "10:00 bis 19:00 Uhr"],
        ],
        widths: [2.5, 3, 2.5, 2.5],
      },
      {
        t: "p",
        text: "Der Schülerverkehr ist in den Linienverkehr integriert. Rund 2.000 Fahrschülerinnen und Fahrschüler nutzen die Linien mit dem Schülerticket; dazu kommt der freigestellte Schülerverkehr zu Grund- und Förderschulen, den der Fachdienst Schulen, Kultur und Schülerbeförderung gesondert vergibt. Der Landkreis wirkt mit den Schulträgern auf gestaffelte Unterrichtszeiten hin, damit Fahrzeuge mehrfach eingesetzt werden können. Verstärkerfahrten zu Schulbeginn und Schulende sind keine Mindestbedienung; sie werden jährlich an die Anmeldezahlen angepasst.",
      },
      { t: "h2", text: "4.5 Verbindungsqualität und Anschlüsse" },
      {
        t: "ul",
        items: [
          "**Reisezeit:** Aus jedem Ort mit mindestens 200 Einwohnern ist das nächste Mittelzentrum in höchstens 60 Minuten und das zugeordnete Grundzentrum in höchstens 30 Minuten erreichbar.",
          "**Direktverbindung:** Zwischen jedem Grundzentrum und seinem Mittelzentrum besteht mindestens alle zwei Stunden eine umsteigefreie Verbindung.",
          "**Umsteigen:** An den Verknüpfungspunkten Bahnhof Altmoor, Bahnhof Rabensfurt und Brackenhain Markt liegen die Übergangszeiten zwischen 3 und 10 Minuten.",
          "**Anschlusssicherung:** Busse der Hauptlinien warten bis zu 5 Minuten auf einen verspäteten Zug. Rufbusfahrten mit gebuchtem Anschluss haben Vorrang in der Disposition; das Fahrzeug meldet Verspätungen automatisch an die Leitstelle des Verkehrsunternehmens.",
          "**Pünktlichkeit:** Mindestens 90 % der Fahrten erreichen die Zeitmesspunkte mit höchstens 3 Minuten Verspätung und ohne Verfrühung.",
        ],
      },
      { t: "h2", text: "4.6 Haltestellen und Barrierefreiheit" },
      {
        t: "p",
        text: "Nach § 8 Abs. 3 Satz 3 PBefG soll der Nahverkehrsplan die Belange der in ihrer Mobilität oder sensorisch eingeschränkten Menschen mit dem Ziel berücksichtigen, eine vollständige Barrierefreiheit zu erreichen. Die im Gesetz genannte Frist (01.01.2022) ist abgelaufen; Ausnahmen müssen im Nahverkehrsplan konkret benannt und begründet werden. Im Landkreis gibt es 612 Haltestellen mit 1.034 Haltepositionen. Davon sind 148 Haltestellen (24 %) barrierefrei ausgebaut.",
      },
      {
        t: "table",
        header: ["Kategorie", "Kriterium", "Ausstattung", "Anzahl"],
        rows: [
          ["A – Verknüpfungspunkt", "Bahnhöfe, Busbahnhöfe, zentrale Umsteigepunkte", "Hochbord 18 cm, Bodenindikatoren nach DIN 32984, Wetterschutz, Sitzplätze, dynamische Fahrgastinformation, Fahrradabstellanlage", "6"],
          ["B – Haupthaltestelle", "an Hauptlinien oder mehr als 50 Ein- und Aussteiger je Werktag", "Hochbord 18 cm, Bodenindikatoren, Wetterschutz, Sitzgelegenheit, Fahrplanaushang, Beleuchtung", "94"],
          ["C – übrige Haltestelle", "alle anderen", "Haltestellenmast mit Fahrplan, befestigte Aufstellfläche, möglichst Beleuchtung", "512"],
        ],
        widths: [2.5, 3, 4.5, 1],
      },
      {
        t: "p",
        text: "Bis 2031 werden alle Haltestellen der Kategorien A und B barrierefrei ausgebaut; dafür fehlen noch 62 Haltestellen. Haltestellen der Kategorie C werden bei Straßenbaumaßnahmen und nach einer Prioritätenliste ausgebaut, die die Nähe zu Arztpraxen, Pflegeeinrichtungen, Schulen und Einkaufsmöglichkeiten berücksichtigt. Ein barrierefreier Ausbau kostet im Durchschnitt 38.000 € je Haltestelle. Baulastträger sind der Landkreis an Kreisstraßen und die Gemeinden an Gemeindestraßen; der Landkreis beantragt die Fördermittel nach dem ÖPNVG gebündelt (Förderquote bis zu 75 %).",
      },
      {
        t: "p",
        text: "Haltestellen mit weniger als 5 Ein- und Aussteigern je Werktag (Zählung 2025: 41 Haltestellen) werden überprüft. Sie können aufgegeben oder in Bedarfshalte umgewandelt werden, wenn eine andere Haltestelle in zumutbarer Entfernung liegt. Vor einer Aufgabe ist der Fachdienst Schulen, Kultur und Schülerbeförderung zu beteiligen, damit Wege von Fahrschülerinnen und Fahrschülern berücksichtigt werden. Zum Fahrplanwechsel im August 2026 werden auf der Linie 512 die Haltestelle Moorweg und die Haltestelle Torfkamp-Ziegelei aufgegeben; beide liegen ohne Aufstellfläche direkt an der Kreisstraße.",
      },
      {
        t: "p",
        text: "Ausnahmen von der Barrierefreiheit nach § 8 Abs. 3 Satz 4 PBefG werden für Haltestellen der Kategorie C vorgesehen, an denen der Ausbau wegen fehlender Flächen oder unverhältnismäßiger Kosten nicht möglich ist und die weniger als 5 Ein- und Aussteiger je Werktag haben. Für mobilitätseingeschränkte Fahrgäste steht dort der Rufbus mit Haustürbedienung zur Verfügung, sobald das jeweilige Bediengebiet eingerichtet ist. Die Ausnahmen sind in Anlage 6 einzeln aufgeführt.",
      },
      { t: "h2", text: "4.7 Fahrzeuge" },
      {
        t: "ul",
        items: [
          "Niederflur- oder Low-Entry-Fahrzeuge mit mindestens zwei Stellplätzen für Rollstühle oder Kinderwagen, Klapprampe und Kneeling-Funktion",
          "Klimaanlage für den Fahrgastraum, optische und akustische Ansage der nächsten Haltestelle",
          "Fahrradmitnahme in allen Bussen der Hauptlinien, soweit Platz vorhanden",
          "Höchstalter 12 Jahre, Durchschnittsalter der Flotte höchstens 8 Jahre",
          "Einhaltung der Mindestziele des Saubere-Fahrzeuge-Beschaffungs-Gesetzes (SaubFahrzeugBeschG) bei allen Vergaben; ab 2030 sollen alle neu eingesetzten Fahrzeuge der Hauptlinien emissionsfrei sein",
          "Rufbusse: Fahrzeuge mit 8 Fahrgastplätzen, je Bediengebiet mindestens ein Fahrzeug mit Rampe und Rollstuhlplatz",
        ],
      },
      { t: "h2", text: "4.8 Tarif, Vertrieb und Fahrgastinformation" },
      {
        t: "p",
        text: "Im gesamten Kreisgebiet gilt der Kreistarif Altmoorland mit vier Preisstufen. Das Deutschlandticket wird in allen Verkehren anerkannt, auch im Rufbus. Für den Rufbus wird kein Zuschlag erhoben; er ist Teil des Linienangebots. Das Schülerticket Altmoorland gilt ganzjährig im gesamten Kreisgebiet. Fahrkarten sind in der App, im Internet und beim Fahrpersonal erhältlich; Barzahlung bleibt in allen Bussen möglich.",
      },
      {
        t: "p",
        text: "Alle Fahrten einschließlich des Rufbusses werden in die landesweite Fahrplanauskunft eingestellt. Bis 2028 sollen auf allen Linien Echtzeitdaten verfügbar sein (Maßnahme M8). An den Haltestellen der Kategorien A und B werden Fahrplan und Tarifinformationen auch in Leichter Sprache ausgehängt; die Rufbus-Telefonzentrale ist für Menschen ohne Smartphone ausdrücklich gleichwertiger Buchungsweg.",
      },
      { t: "h2", text: "4.9 Qualitätsmonitoring" },
      {
        t: "table",
        header: ["Kennzahl", "Zielwert", "Messung"],
        rows: [
          ["Pünktlichkeit", "mindestens 90 %", "automatisch über das Betriebsleitsystem"],
          ["Fahrtausfälle", "höchstens 1 %", "Meldung des Verkehrsunternehmens, monatlich"],
          ["Kundenzufriedenheit", "mindestens 4,0 von 5", "Fahrgastbefragung alle zwei Jahre"],
          ["Beschwerden je 100.000 Fahrgäste", "höchstens 8", "Beschwerdemanagement des Landkreises"],
          ["Sauberkeit und Zustand der Fahrzeuge", "mindestens 90 % ohne Mängel", "Stichproben durch Qualitätsprüfer"],
          ["Rufbus: abgelehnte Fahrtwünsche", "unter 5 %", "Buchungsplattform"],
        ],
        widths: [3.5, 2.5, 4],
      },
      {
        t: "p",
        text: "Die Verkehrsverträge enthalten eine Bonus-Malus-Regelung, die an diese Kennzahlen anknüpft. Der Fachdienst Kreisstraßen und ÖPNV legt dem Ausschuss für Bauen, Umwelt und Verkehr jährlich einen Qualitätsbericht vor.",
      },
      { t: "h1", text: "5 Flexible Bedienformen – Rufbus" },
      { t: "h2", text: "5.1 Ergebnisse des Pilotprojekts „Moorflitzer“" },
      {
        t: "p",
        text: "Seit dem 01.04.2025 erprobt der Landkreis im Bediengebiet Nord – Brackenhain mit den Ortsteilen Heidhof und Kleinbracken, Krähenwerder und Lütjenbrook, zusammen rund 13.400 Einwohner – den Rufbus **„Moorflitzer“**. Er ersetzt das frühere Anrufsammeltaxi Brackenhain und zwei schwach genutzte Fahrtenpaare der Linie 514 am Wochenende. Die Pilotphase läuft bis zum 31.03.2027 und wird vom Land mit 60 % des Defizits gefördert.",
      },
      {
        t: "table",
        header: ["Kennzahl (01.04.2025 bis 31.03.2026)", "Wert"],
        rows: [
          ["Fahrgäste", "13.680"],
          ["Fahrten (Buchungen)", "9.870"],
          ["Fahrgäste je Fahrt (Bündelungsquote)", "1,39"],
          ["Abgelehnte Fahrtwünsche", "6,2 %"],
          ["Buchungen per Telefon", "38 %"],
          ["Kosten", "486.000 €"],
          ["Fahrgeldeinnahmen", "31.400 €"],
          ["Kostendeckungsgrad", "6,5 %"],
          ["Zuschuss je Fahrgast", "33,23 €"],
        ],
        widths: [6, 3],
      },
      {
        t: "p",
        text: "Die Nachfrage hat die Erwartungen übertroffen: Der Zielwert von 12.000 Fahrgästen im ersten Jahr wurde erreicht, und im zweiten Halbjahr (Oktober bis März) waren rund 79 % mehr Fahrgäste unterwegs als im ersten. Fast ein Drittel der Fahrten dient dem Weg zur Arbeit oder Ausbildung. Ältere Menschen nutzen besonders häufig die telefonische Buchung. Die Wirtschaftlichkeit liegt noch unter dem Ziel; der Zuschuss je Fahrgast muss sinken. Das wird vor allem durch eine höhere Bündelung erreicht, also mehr Fahrgäste je Fahrt bei gleichem Fahrzeugeinsatz.",
      },
      { t: "h2", text: "5.2 Rechtlicher Rahmen" },
      {
        t: "p",
        text: "Der Rufbus wird als **Linienbedarfsverkehr** nach § 44 PBefG betrieben. Er ist Teil des öffentlichen Personennahverkehrs, unterliegt der Betriebs-, Beförderungs- und Tarifpflicht und bedarf einer Genehmigung der Genehmigungsbehörde. Fahrgäste werden ohne festen Linienweg zwischen festgelegten Haltepunkten befördert; Fahrten werden gebündelt. Der Linienbedarfsverkehr ist vom gebündelten Bedarfsverkehr nach § 50 PBefG und vom Taxenverkehr abzugrenzen; er darf nicht in Konkurrenz zum Taxi im Stadtgebiet von Rabensfurt treten. Taxiunternehmen können als Auftragnehmer des Verkehrsunternehmens eingebunden werden.",
      },
      {
        t: "p",
        text: "Für die Buchungsdaten gilt die DSGVO. Personenbezogene Buchungsdaten werden 90 Tage nach der Fahrt gelöscht; für die Planung werden ausschließlich anonymisierte Auswertungen genutzt. Telefonische Buchungen werden nicht aufgezeichnet.",
      },
      { t: "h2", text: "5.3 Bedienungsstandards für den Rufbus" },
      {
        t: "table",
        header: ["Merkmal", "Standard"],
        rows: [
          ["Bedienzeiten", "Montag bis Donnerstag 6 bis 21 Uhr, Freitag 6 bis 23 Uhr, Samstag 8 bis 23 Uhr, Sonn- und Feiertage 10 bis 19 Uhr"],
          ["Vorbuchfrist", "30 Minuten vor Fahrtantritt (bisher 60 Minuten); Buchung bis zu 7 Tage im Voraus"],
          ["Buchungswege", "App, Internet, Telefon (Montag bis Freitag 7 bis 20 Uhr, Wochenende 9 bis 18 Uhr)"],
          ["Zeitfenster", "Abholung höchstens 15 Minuten nach der Wunschzeit; bei gebuchtem Anschluss garantierte Ankunftszeit"],
          ["Umweg", "Fahrzeit höchstens doppelt so lang wie die direkte Fahrt, höchstens 20 Minuten Umweg"],
          ["Haltepunkte", "virtuelle Haltepunkte in höchstens 300 m Entfernung zu jedem Wohngebäude; Haustürbedienung für Fahrgäste mit Schwerbehindertenausweis (Merkzeichen G, aG oder Bl)"],
          ["Fahrzeuge", "8 Fahrgastplätze; mindestens ein Fahrzeug mit Rampe je Bediengebiet"],
          ["Tarif", "Kreistarif und Deutschlandticket, kein Zuschlag"],
          ["Anschlüsse", "garantierter Anschluss an Hauptlinien und Bahn bei Buchung"],
          ["Ablehnungsquote", "höchstens 5 % der Fahrtwünsche"],
        ],
        widths: [2.5, 7.5],
      },
      { t: "h2", text: "5.4 Bediengebiete 2027 bis 2031" },
      {
        t: "p",
        text: "Der Rufbus wird schrittweise auf weitere Teile des Kreisgebiets ausgedehnt. Vorrang haben Räume mit Erschließungsdefiziten und einem hohen Anteil älterer Menschen. Die Kosten sind Nettokosten nach Abzug der erwarteten Fahrgeldeinnahmen.",
      },
      {
        t: "table",
        header: ["Bediengebiet", "Gemeinden und Ortsteile", "Einwohner", "Fahrzeuge", "Start", "Kosten je Jahr"],
        rows: [
          ["Nord (Bestand)", "Brackenhain mit Heidhof und Kleinbracken, Krähenwerder, Lütjenbrook", "rund 13.400", "3", "04/2025", "493.000 € (mit Abendverkehr)"],
          ["Süd", "Torfkamp (Außenbereiche, Moorkolonie), Schilfwerder mit Achterdeich", "rund 7.300", "2", "08/2027", "360.000 €"],
          ["West", "Außenbereiche von Fennhusen, Ortsteile der Stadt Altmoor", "rund 6.500", "2", "2029 (nach Prüfung)", "340.000 €"],
          ["Abendverkehr Rabensfurt", "Stadtgebiet Rabensfurt, 21 bis 1 Uhr", "38.600", "2", "01/2028", "290.000 €"],
        ],
        widths: [2, 4, 1.5, 1.2, 1.5, 2],
      },
      {
        t: "p",
        text: "Für das **Bediengebiet Süd** ist der Start zum Fahrplanwechsel im August 2027 vorgesehen. Die Fahrzeuge sollen gemeinsam mit dem Bediengebiet Nord disponiert werden, um Leerfahrten zu vermeiden. Der Abendverkehr in Rabensfurt ersetzt das bisherige Anrufsammeltaxi, das jährlich rund 120.000 € kostet und nur in Rabensfurt verkehrt. Die Landesförderung für Pilotprojekte endet mit der Pilotphase im März 2027; danach finanziert der Landkreis den Rufbus aus dem ÖPNV-Budget und aus den pauschalen Zuweisungen des Landes nach dem ÖPNVG.",
      },
      { t: "h2", text: "5.5 Zielwerte und Evaluation" },
      {
        t: "ul",
        items: [
          "Zuschuss je Fahrgast höchstens 25 € bis 2029",
          "Kostendeckungsgrad mindestens 10 %",
          "Bündelungsquote mindestens 1,6 Fahrgäste je Fahrt",
          "Ablehnungsquote unter 5 %",
          "Jährlicher Bericht an den Ausschuss für Bauen, Umwelt und Verkehr",
          "Erreicht ein neues Bediengebiet nach zwei Jahren weniger als die Hälfte der angestrebten Fahrgastzahl, wird es grundlegend überprüft.",
        ],
      },
      { t: "h2", text: "5.6 Abgrenzung zu Bürgerbus, Anrufsammeltaxi und Taxi" },
      {
        t: "p",
        text: "Der ehrenamtlich betriebene Bürgerbus Krähenwerder (Bürgerbus Krähenwerder e. V.) bleibt erhalten; er übernimmt vor allem begleitete Einkaufsfahrten und Fahrten zu Arztterminen und ist mit dem Rufbus abgestimmt. Das Anrufsammeltaxi Rabensfurt wird mit Einführung des Abendverkehrs eingestellt. Taxifahrten werden nicht ersetzt: Der Rufbus bündelt Fahrten und bedient feste Haltepunkte, er fährt nicht auf Zuruf von Tür zu Tür (außer für mobilitätseingeschränkte Fahrgäste).",
      },
      { t: "h1", text: "6 Maßnahmenprogramm 2027–2031" },
      {
        t: "p",
        text: "Die folgenden Maßnahmen setzen die Standards um. Sie stehen unter dem Vorbehalt der Finanzierung und werden jährlich mit dem Haushalt beschlossen. Die Mehrkosten sind laufende Betriebskosten nach voller Umsetzung, die Investitionen einmalige Kosten vor Abzug von Fördermitteln.",
      },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Zeitraum", "Mehrkosten je Jahr", "Investition", "Priorität"],
        rows: [
          ["M1", "Linie 510: 30-Minuten-Takt auch samstags von 9 bis 14 Uhr", "2027", "145.000 €", "–", "hoch"],
          ["M2", "Linie 512 zur Hauptlinie ausbauen (Stundentakt bis 22 Uhr, Sonntagsverkehr)", "2028", "210.000 €", "–", "hoch"],
          ["M3", "Rufbus Nord als Regelangebot, Abendverkehr freitags und samstags", "04/2027", "38.000 €", "–", "hoch"],
          ["M4", "Rufbus Bediengebiet Süd", "08/2027", "360.000 €", "60.000 €", "hoch"],
          ["M5", "Abendverkehr Rabensfurt anstelle des Anrufsammeltaxis", "2028", "170.000 €", "–", "mittel"],
          ["M6", "Rufbus Bediengebiet West", "2029", "340.000 €", "50.000 €", "mittel"],
          ["M7", "Barrierefreier Ausbau der restlichen 62 Haltestellen der Kategorien A und B", "2027–2031", "–", "2.356.000 €", "hoch"],
          ["M8", "Echtzeit-Fahrgastinformation auf allen Linien", "2028", "45.000 €", "180.000 €", "mittel"],
          ["M9", "Mobilitätsstationen an den Bahnhöfen Altmoor und Rabensfurt (Fahrradparken, Carsharing, Ladepunkte)", "2029", "20.000 €", "640.000 €", "niedrig"],
          ["M10", "Umstellung auf emissionsfreie Busse schrittweise mit den Neuvergaben", "2027–2031", "260.000 €", "–", "gesetzlich"],
          ["", "Summe", "", "1.588.000 €", "3.286.000 €", ""],
        ],
        widths: [0.8, 5, 1.5, 1.8, 1.8, 1.2],
      },
      {
        t: "p",
        text: "Der Zuschussbedarf des Landkreises für den ÖPNV liegt 2026 bei rund 7,9 Mio. €. Nach vollständiger Umsetzung aller Maßnahmen steigt er um rund 1,6 Mio. € jährlich, also um etwa 20 %. Ein Teil davon wird durch höhere Fahrgeldeinnahmen und den Wegfall des Anrufsammeltaxis gedeckt; dieser Effekt ist in Maßnahme M5 bereits berücksichtigt. Die Verwaltung schlägt vor, die Maßnahmen M1, M3, M4 und M7 vorrangig umzusetzen.",
      },
      { t: "h2", text: "Weiteres Verfahren" },
      {
        t: "ol",
        items: [
          "Beteiligung der Verkehrsunternehmen, der kreisangehörigen Gemeinden, der benachbarten Aufgabenträger, des SPNV-Aufgabenträgers des Landes, des Behindertenbeirats und des Fahrgastbeirats bis 31.08.2026",
          "Öffentliche Auslegung und Online-Beteiligung im September 2026",
          "Auswertung und Abwägung der Stellungnahmen im Oktober 2026",
          "Vorberatung im Ausschuss für Bauen, Umwelt und Verkehr im November 2026",
          "Beschluss des Kreistags im Dezember 2026, Inkrafttreten am 01.01.2027",
        ],
      },
      { t: "note", text: "Entwurf – nicht zur Veröffentlichung vor Beginn der Beteiligung. Rückfragen: Fachdienst Kreisstraßen und ÖPNV, Telefon 040 66969-350." },
    ],
  },
  // ── Untere Naturschutzbehörde: Windpark (lang) ─────────────────────
  {
    type: "word",
    id: "am-stellungnahme-unb-windpark-kraehenwerder-ost",
    title: "Stellungnahme der Unteren Naturschutzbehörde zum Windpark Krähenwerder-Ost",
    kind: "Stellungnahme",
    fileName: "2025-10-22 Stellungnahme UNB Windpark Kraehenwerder-Ost BImSchG-Verfahren",
    org: "altmoorland",
    unit: "am-umwelt",
    author: "am-kahrs",
    date: "2025-10-22",
    keywords: ["Windpark Krähenwerder-Ost", "§ 45b BNatSchG", "Rotmilan", "Ersatzgeld", "Abschaltalgorithmus", "Habitatpotentialanalyse"],
    summary:
      "Ausführliche naturschutzfachliche Stellungnahme zu sechs Windenergieanlagen im immissionsschutzrechtlichen Verfahren: Eingriffsregelung mit Kompensationsdefizit, Ersatzgeld für das Landschaftsbild, Artenschutz nach § 45b BNatSchG (Rotmilan, Weißstorch, Kranich), Fledermäuse, Nachforderungen und vorgeschlagene Nebenbestimmungen.",
    meta: [
      ["Aktenzeichen", "67.1-WEA-0311/25"],
      ["Ihr Zeichen", "GAA-RH 23.4-1186/25"],
      ["Ihr Schreiben vom", "18.08.2025"],
    ],
    recipient: ["Gewerbeaufsichtsamt Rhedenburg", "Immissionsschutzrechtliche Genehmigungsbehörde", "Postfach 21 40", "00121 Rhedenburg"],
    subject:
      "Genehmigungsverfahren nach § 4 BImSchG – Errichtung und Betrieb von sechs Windenergieanlagen, Windpark Krähenwerder-Ost, Antragstellerin: Krähenwerder Windenergie GmbH & Co. KG – Stellungnahme der Unteren Naturschutzbehörde",
    blocks: [
      { t: "p", text: "Sehr geehrte Damen und Herren," },
      {
        t: "p",
        text: "mit Schreiben vom 18.08.2025 haben Sie die Untere Naturschutzbehörde (UNB) des Landkreises Altmoorland an dem oben genannten Verfahren beteiligt. Nach Prüfung der Antragsunterlagen einschließlich der Ergänzung vom 29.09.2025 nehme ich wie folgt Stellung. Die wasserrechtliche Stellungnahme der Unteren Wasserbehörde zur Querung des Achterschloots folgt gesondert.",
      },
      { t: "h1", text: "1. Vorhaben und Standort" },
      {
        t: "p",
        text: "Die Antragstellerin plant sechs Windenergieanlagen (WEA 1 bis WEA 6) des Typs WK 6.2 mit einer Nennleistung von je 6,2 MW, einer Nabenhöhe von 164 m und einem Rotordurchmesser von 163 m. Die Gesamthöhe beträgt 245,5 m, die Rotorunterkante liegt bei 82,5 m über Grund. Die Anlagen sollen in der Gemarkung Krähenwerder, Flur 3 und 4, innerhalb des Vorranggebiets Windenergienutzung „WE 14 Krähenwerder-Ost“ des Regionalen Raumordnungsprogramms errichtet werden.",
      },
      {
        t: "p",
        text: "Der Standort wird überwiegend als Acker (Mais, Getreide) genutzt; im Osten schließt Grünland an. Rund 400 m nördlich von WEA 6 liegt das Krähenwerder Moor, das als gesetzlich geschütztes Biotop erfasst und Teil des Landschaftsschutzgebiets „Moorniederung Krähenwerder“ ist. Die Erschließung erfolgt von der K 23 über eine neue Zuwegung von 2.950 m Länge. Dabei werden der Graben Achterschloot (Gewässer dritter Ordnung) gequert und auf 85 m eine Feldhecke beseitigt.",
      },
      {
        t: "table",
        header: ["Bestandteil", "Fläche", "Art der Inanspruchnahme", "Dauer"],
        rows: [
          ["Fundamente (6 × 480 m²)", "2.880 m²", "vollversiegelt", "dauerhaft"],
          ["Kranstellflächen (6 × 1.450 m²)", "8.700 m²", "teilversiegelt (Schotter)", "dauerhaft"],
          ["Zuwegung neu (2.950 m × 4,5 m)", "13.275 m²", "teilversiegelt (Schotter)", "dauerhaft"],
          ["Montage- und Lagerflächen", "21.600 m²", "temporär befestigt", "Bauzeit"],
          ["Kurvenradien und Überschwenkbereiche", "3.400 m²", "temporär befestigt", "Bauzeit"],
        ],
        widths: [4, 2, 3, 1.5],
      },
      { t: "h1", text: "2. Rechtliche Einordnung" },
      {
        t: "p",
        text: "Wegen der Konzentrationswirkung der immissionsschutzrechtlichen Genehmigung (§ 13 BImSchG) sind die naturschutzrechtlichen Anforderungen in Ihrem Verfahren zu prüfen. Maßgeblich sind die Eingriffsregelung (§§ 13 bis 17 BNatSchG), der besondere Artenschutz (§ 44 Abs. 1 BNatSchG), für kollisionsgefährdete Brutvogelarten § 45b BNatSchG mit Anlage 1, der gesetzliche Biotopschutz (§ 30 BNatSchG) sowie die Verordnung über das Landschaftsschutzgebiet „Moorniederung Krähenwerder“. Die Anlagenstandorte liegen außerhalb des Landschaftsschutzgebiets; eine Befreiung von dessen Verboten ist nicht erforderlich.",
      },
      { t: "h1", text: "3. Eingriffsregelung" },
      { t: "h2", text: "3.1 Boden und Biotope" },
      {
        t: "p",
        text: "Das Vorhaben ist ein Eingriff in Natur und Landschaft nach § 14 Abs. 1 BNatSchG. Vermeidbare Beeinträchtigungen sind zu unterlassen, unvermeidbare auszugleichen oder zu ersetzen. Die Antragstellerin hat den Kompensationsbedarf nach der Arbeitshilfe des Landes zur Eingriffsregelung ermittelt. Die Herleitung ist grundsätzlich nachvollziehbar, das Ergebnis jedoch zu niedrig: Die Teilversiegelung der Zuwegung wurde nur mit der Hälfte ihrer Fläche angesetzt, obwohl der Faktor 0,5 bereits die geringere Eingriffsschwere abbildet.",
      },
      {
        t: "table",
        header: ["Position", "Fläche", "Faktor", "Kompensationsbedarf"],
        rows: [
          ["Vollversiegelung Fundamente", "2.880 m²", "1,0", "2.880,0 m²"],
          ["Teilversiegelung Kranstellflächen", "8.700 m²", "0,5", "4.350,0 m²"],
          ["Teilversiegelung Zuwegung", "13.275 m²", "0,5", "6.637,5 m²"],
          ["Summe Kompensationsbedarf", "", "", "13.867,5 m²"],
          ["Angebot der Antragstellerin (Flurstück 47/2, Flur 5)", "", "", "11.000,0 m²"],
          ["Fehlbetrag", "", "", "2.867,5 m²"],
        ],
        widths: [4.5, 2, 1, 2.5],
      },
      {
        t: "p",
        text: "Die angebotene Umwandlung von Acker in extensives Grünland auf dem Flurstück 47/2 ist als Ausgleichsmaßnahme geeignet. Der Fehlbetrag von rund 0,29 ha ist durch eine weitere Fläche im selben Naturraum zu decken. Vorrangig sollten Flächen gewählt werden, die zugleich als Ausweichnahrungshabitat für den Rotmilan dienen können (siehe 4.1).",
      },
      {
        t: "p",
        text: "Die temporär genutzten Flächen sind spätestens sechs Monate nach Inbetriebnahme in den Ausgangszustand zurückzuführen. Wegen der teils moorigen Böden ist eine bodenkundliche Baubegleitung nach DIN 19639 einzusetzen; Bodenverdichtungen sind durch lastverteilende Platten zu vermeiden.",
      },
      {
        t: "p",
        text: "Die Feldhecke an der Zuwegung ist ein gesetzlich geschütztes Biotop. Ihre Beseitigung bedarf einer Ausnahme nach § 30 Abs. 3 BNatSchG. Die Ausnahme kann in Aussicht gestellt werden, wenn die Hecke im Verhältnis 1 : 2 ersetzt wird, also auf 170 m Länge mit standortheimischen Gehölzen. Für die Ersatzpflanzung fehlt bislang eine Ausführungsplanung.",
      },
      { t: "h2", text: "3.2 Landschaftsbild und Ersatzgeld" },
      {
        t: "p",
        text: "Beeinträchtigungen des Landschaftsbilds durch Anlagen mit mehr als 20 m Höhe sind in der Regel nicht ausgleichbar oder ersetzbar. Nach § 15 Abs. 6 BNatSchG ist daher ein **Ersatzgeld** zu leisten. Bewertet wird ein Umkreis von der 15-fachen Anlagenhöhe (3.683 m). In diesem Raum hat das Landschaftsbild überwiegend mittlere Bedeutung (Wertstufe 3, 82 % der Fläche); die Moorniederung hat hohe Bedeutung (Wertstufe 4, 18 % der Fläche).",
      },
      {
        t: "p",
        text: "Nach dem Erlass des Landes beträgt das Ersatzgeld je Meter Anlagenhöhe 680 € in Wertstufe 3 und 850 € in Wertstufe 4. Der gewichtete Satz liegt damit bei 710,60 € je Meter. Daraus ergibt sich je Anlage ein Ersatzgeld von 174.452,30 € und für den Windpark insgesamt von **1.046.713,80 €**. Die Antragstellerin hat ausschließlich mit der Wertstufe 3 gerechnet und kommt auf 1.001.640,00 €; die Differenz beträgt 45.073,80 €. Das Ersatzgeld ist vor Baubeginn zu zahlen und wird zweckgebunden für Maßnahmen des Naturschutzes und der Landschaftspflege möglichst im betroffenen Naturraum verwendet.",
      },
      { t: "h1", text: "4. Artenschutz" },
      { t: "h2", text: "4.1 Kollisionsgefährdete Brutvögel" },
      {
        t: "p",
        text: "Grundlage ist die Brutvogelkartierung 2024 mit Horstkontrolle im Frühjahr 2025 (Büro für Landschaftsökologie Reetmoor, Bericht vom 15.01.2025, ergänzt am 29.09.2025). Die Bewertung richtet sich nach den Prüfbereichen der Anlage 1 Abschnitt 1 zu § 45b BNatSchG.",
      },
      {
        t: "table",
        header: ["Art", "Brutplatz", "Abstand zur nächsten WEA", "Bereich nach Anlage 1", "Bewertung der UNB"],
        rows: [
          ["Rotmilan", "R1, Feldgehölz in Flur 4", "860 m (WEA 3)", "zentraler Prüfbereich (500 bis 1.200 m)", "Anhaltspunkte für ein signifikant erhöhtes Tötungsrisiko; Widerlegung oder Schutzmaßnahmen erforderlich"],
          ["Rotmilan", "R2, Waldrand Lütjenbrooker Holz", "2.300 m (WEA 5)", "erweiterter Prüfbereich (1.200 bis 3.500 m)", "Risiko in der Regel nicht signifikant erhöht; keine Hinweise auf erhöhte Aufenthaltswahrscheinlichkeit"],
          ["Weißstorch", "Horst auf einer Scheune in der Ortslage Krähenwerder", "1.650 m (WEA 1)", "erweiterter Prüfbereich (1.000 bis 2.000 m)", "Grünland östlich der WEA 1 und 2 ist Nahrungsfläche; Abschaltung bei Mahd erforderlich"],
          ["Seeadler", "kein Brutplatz im Umkreis von 5.000 m", "–", "–", "nicht betroffen"],
          ["Kranich", "Brutpaar im Krähenwerder Moor", "420 m (WEA 6)", "nicht in Anlage 1", "kein Kollisionsrisiko, aber Störungsverbot während der Bauzeit beachten"],
          ["Feldlerche", "14 Reviere im Vorhabengebiet", "–", "nicht in Anlage 1", "Tötungsverbot bei der Baufeldfreimachung beachten"],
        ],
        widths: [1.5, 2.5, 1.8, 2.2, 3.5],
      },
      {
        t: "p",
        text: "**Rotmilan R1:** Die Antragstellerin hält den Brutplatz R1 für nicht relevant, weil er bei der Kontrolle 2025 nicht besetzt gewesen sei. Dem folge ich nicht. Der Horst war 2023 und 2024 besetzt; die Kontrolle 2025 fand erst am 27.05.2025 und damit nach dem üblichen Zeitraum für Besatzkontrollen statt. Der Brutplatz ist daher als aktuell genutzt zu werten. Die Anhaltspunkte für ein signifikant erhöhtes Tötungsrisiko an den WEA 2, 3 und 4 können nach § 45b Abs. 3 BNatSchG durch eine **Habitatpotentialanalyse** oder eine auf Verlangen der Antragstellerin durchgeführte Raumnutzungsanalyse widerlegt oder durch fachlich anerkannte Schutzmaßnahmen hinreichend gemindert werden.",
      },
      {
        t: "p",
        text: "Als Schutzmaßnahmen nach Anlage 1 Abschnitt 2 kommen hier die Abschaltung bei landwirtschaftlichen Bewirtschaftungsereignissen, eine unattraktive Gestaltung der Mastfußbereiche und die Anlage attraktiver Ausweichnahrungshabitate in Betracht. Ein Antikollisionssystem ist für den Rotmilan grundsätzlich geeignet, wird von der Antragstellerin aber nicht angeboten. Nach der Ertragsprognose der Antragstellerin führen alle Abschaltungen zusammen zu einem Ertragsverlust von 3,1 %; die Zumutbarkeitsschwelle nach § 45b Abs. 6 BNatSchG wird damit nicht erreicht.",
      },
      {
        t: "p",
        text: "**Weißstorch:** Der Brutplatz liegt im erweiterten Prüfbereich. Die Grünlandflächen östlich der WEA 1 und 2 werden nach den Beobachtungen 2024 regelmäßig zur Nahrungssuche genutzt, insbesondere unmittelbar nach der Mahd. Für diese Anlagen ist eine Abschaltung bei Mahd im Umkreis von 250 m vorzusehen.",
      },
      {
        t: "p",
        text: "**Kranich und Feldlerche:** Der Kranich ist nicht kollisionsgefährdet im Sinne der Anlage 1. Bauarbeiten in der Nähe des Brutplatzes können aber zur Aufgabe der Brut führen (Störungsverbot nach § 44 Abs. 1 Nr. 2 BNatSchG). Für die Feldlerche ist sicherzustellen, dass bei der Baufeldfreimachung keine Gelege zerstört werden. Als Ersatz für verlorene Reviere sind auf angrenzenden Ackerflächen 14 Lerchenfenster und zwei Blühstreifen anzulegen.",
      },
      { t: "h2", text: "4.2 Fledermäuse" },
      {
        t: "p",
        text: "Bei Detektorbegehungen und mit Horchkisten wurden 2024 der Große Abendsegler, die Rauhautfledermaus, die Breitflügelfledermaus und die Zwergfledermaus nachgewiesen. Die ersten beiden Arten sind besonders kollisionsgefährdet; im Spätsommer wurde ein ausgeprägtes Zuggeschehen festgestellt. Zur Vermeidung des Tötungsverbots ist ein **Abschaltalgorithmus** festzulegen: vom 1. April bis 31. Oktober von einer Stunde vor Sonnenuntergang bis Sonnenaufgang bei Windgeschwindigkeiten unter 6 m/s in Gondelhöhe, Temperaturen über 10 °C und ohne Niederschlag.",
      },
      {
        t: "p",
        text: "Der Algorithmus ist durch ein akustisches Gondelmonitoring an mindestens zwei Anlagen über zwei Jahre zu überprüfen und anschließend anzupassen. Ziel ist, dass rechnerisch weniger als zwei Schlagopfer je Anlage und Jahr auftreten.",
      },
      { t: "h2", text: "4.3 Rastvögel" },
      {
        t: "p",
        text: "Das Krähenwerder Moor ist ein regelmäßig genutzter Rastplatz für nordische Gänse und Singschwäne (bis zu 1.800 Gänse im Winter 2023/24). Die WEA 5 und 6 liegen weniger als 1.200 m vom Schlafgewässer entfernt. Ein Verstoß gegen das Störungsverbot ist nach derzeitigem Stand nicht zu erwarten, weil ausreichend Ausweichflächen vorhanden sind und der Erhaltungszustand der lokalen Population nicht verschlechtert wird. Das Rastgeschehen ist jedoch in den ersten drei Wintern nach Inbetriebnahme zu beobachten.",
      },
      { t: "h1", text: "5. Schutzgebiete und Natura 2000" },
      {
        t: "p",
        text: "Das nächstgelegene Natura-2000-Gebiet, das FFH-Gebiet „Moore bei Lütjenbrook“, liegt 3,8 km entfernt. Die FFH-Vorprüfung der Antragstellerin ist nachvollziehbar; erhebliche Beeinträchtigungen der Erhaltungsziele sind nicht zu erwarten. Das Landschaftsschutzgebiet „Moorniederung Krähenwerder“ wird von Zuwegung und Kabeltrasse nicht berührt. Die Kabeltrasse ist im Bereich des Grabens Achterschloot in geschlossener Bauweise zu verlegen.",
      },
      { t: "h1", text: "6. Nachforderungen" },
      {
        t: "p",
        text: "Für eine abschließende Stellungnahme bitte ich, bei der Antragstellerin bis zum 30.11.2025 folgende Unterlagen nachzufordern:",
      },
      {
        t: "ol",
        items: [
          "Habitatpotentialanalyse für den Rotmilan-Brutplatz R1 oder eine verbindliche Erklärung, die Schutzmaßnahmen nach Nr. 7.6 bis 7.8 umzusetzen",
          "Nachweis einer weiteren Kompensationsfläche von mindestens 2.867,5 m² im Naturraum",
          "Korrigierte Berechnung des Ersatzgeldes (1.046.713,80 €)",
          "Ausführungsplanung für die Ersatzpflanzung der Feldhecke auf 170 m Länge",
          "Benennung einer fachlich qualifizierten ökologischen Baubegleitung",
        ],
      },
      { t: "h1", text: "7. Ergebnis und vorgeschlagene Nebenbestimmungen" },
      {
        t: "p",
        text: "Aus naturschutzfachlicher Sicht bestehen gegen das Vorhaben keine durchgreifenden Bedenken, wenn die Nachforderungen erfüllt und die folgenden Nebenbestimmungen in den Genehmigungsbescheid aufgenommen werden:",
      },
      {
        t: "ol",
        items: [
          "Das Ersatzgeld von 1.046.713,80 € ist vor Baubeginn an den Landkreis Altmoorland zu zahlen.",
          "Die Kompensationsflächen sind vor Inbetriebnahme herzustellen und dauerhaft dinglich zu sichern; der Nachweis ist der UNB vorzulegen.",
          "Die Baufeldfreimachung ist nur zwischen dem 1. September und dem Ende des Monats Februar zulässig. Abweichungen sind nur nach einer Besatzkontrolle durch die ökologische Baubegleitung und mit Zustimmung der UNB zulässig.",
          "Im Umkreis von 500 m um den Kranich-Brutplatz finden zwischen dem 1. März und dem 31. Juli keine Bauarbeiten statt.",
          "Der Abschaltalgorithmus für Fledermäuse nach Abschnitt 4.2 gilt ab Inbetriebnahme. Das Gondelmonitoring ist über zwei Jahre durchzuführen; die Berichte sind jeweils bis zum 31.01. des Folgejahres vorzulegen.",
          "Die WEA 2, 3 und 4 sind vom 1. April bis 31. August bei Grünlandmahd, Ernte und Bodenbearbeitung auf Flächen im Umkreis von 250 m um den Mastfuß ab Beginn der Bewirtschaftung bis 24 Stunden nach ihrem Ende jeweils von Sonnenaufgang bis Sonnenuntergang abzuschalten. Für die WEA 1 und 2 gilt dies bei Grünlandmahd ebenso.",
          "Die Mastfußbereiche und Kranstellflächen sind so zu gestalten, dass sie für Greifvögel als Nahrungsfläche unattraktiv sind (keine kurzrasige Mahd, keine Brachen, keine Lagerung von Ernteresten oder Mist).",
          "In mindestens 1.500 m Entfernung zu den Anlagen sind Ausweichnahrungshabitate von mindestens 2 ha (Luzerne oder Kleegras mit gestaffelter Mahd) anzulegen und für die Betriebsdauer zu erhalten.",
          "Der Betrieb ist durch eine Vereinbarung mit den Bewirtschaftern der umliegenden Flächen abzusichern, die die Meldung von Bewirtschaftungsereignissen regelt.",
          "Die Nachtkennzeichnung ist bedarfsgesteuert auszuführen (§ 9 Abs. 8 EEG).",
          "Das Rastgeschehen im Krähenwerder Moor ist in den ersten drei Wintern nach Inbetriebnahme zu erfassen; die Ergebnisse sind der UNB vorzulegen.",
          "Die ökologische Baubegleitung berichtet der UNB monatlich während der Bauzeit und unverzüglich bei Verstößen.",
        ],
      },
      {
        t: "p",
        text: "Bei Änderungen der Planung, insbesondere des Anlagentyps oder der Zuwegung, bitte ich um erneute Beteiligung. Für Rückfragen stehen Herr Kahrs und ich gern zur Verfügung.",
      },
      { t: "p", text: "Mit freundlichen Grüßen" },
      { t: "signature", lines: ["Im Auftrag", "Dr. Saskia Timm", "Leiterin Untere Naturschutz- und Wasserbehörde"] },
    ],
  },
];

export const threads: ThreadSpec[] = [
  // ── Gesundheitsamt und Kindergarten Lindenhof: Norovirus ───────────
  {
    id: "am-norovirus-ausbruch-kita-lindenhof",
    title: "Norovirus-Ausbruch im Gemeindekindergarten Lindenhof",
    subject: "Meldung nach § 34 Abs. 6 IfSG – Magen-Darm-Erkrankungen im Kindergarten Lindenhof",
    org: "altmoorland",
    unit: "am-gesundheit",
    date: "2025-02-12",
    tags: ["personendaten"],
    keywords: ["§ 34 Abs. 6 IfSG", "Norovirus", "Gruppe Igel", "48 Stunden", "Hygienebegehung"],
    summary:
      "Kita-Leitung und Gesundheitsamt stimmen sich zu einem Norovirus-Ausbruch ab: Namenslisten erkrankter Kinder mit Geburtsdaten, Hygieneauflagen, Laborbefund und die Frage nach einer Schließung. Die Listen gehen unverschlüsselt per Mail – Stoff für Anonymisierung und Datenschutz.",
    mails: [
      {
        from: "bh-vogt",
        to: ["am-lueders"],
        cc: ["bh-hoefer"],
        date: "2025-02-10T08:12",
        body: `Sehr geehrte Frau Lüders,

wie eben telefonisch besprochen, melde ich Ihnen nach § 34 Abs. 6 IfSG mehrere Magen-Darm-Erkrankungen in unserem Kindergarten. Seit Freitag (07.02.) sind 9 Kinder und 2 Mitarbeiterinnen mit Erbrechen und Durchfall erkrankt, die meisten aus der Gruppe Igel.

Erkrankte Kinder (Name, Geburtsdatum, Gruppe, Beginn):
1. Lea Hinz, 14.06.2021, Igel, 07.02.
2. Mats Oltmann, 02.11.2020, Igel, 07.02.
3. Hannah Kück, 23.03.2022, Igel, 08.02.
4. Jonas Tietjen, 11.09.2020, Füchse, 08.02.
5. Mila Rosenbrock, 30.01.2021, Igel, 09.02.
6. Ben Ahrens, 19.07.2021, Füchse, 09.02.
7. Ida Schwarting, 05.05.2022, Igel, 09.02.
8. Paul Gerken, 27.12.2020, Füchse, 10.02.
9. Emma Lührs, 16.08.2023, Mäuse (Krippe), 10.02.

Mitarbeiterinnen:
- Katrin Meiners (Erzieherin, Gruppe Igel), erkrankt seit 08.02.
- Svetlana Roth (Kinderpflegerin, Gruppe Füchse), erkrankt seit 09.02.

Am Donnerstag gab es mittags Gemüselasagne vom Caterer, die haben aber alle Gruppen gegessen. Bei Lea hat der Kinderarzt „wahrscheinlich Noro“ gesagt, getestet wurde nicht.

Was müssen wir jetzt tun? Dürfen die Geschwisterkinder kommen? Die Waschräume haben wir heute früh schon extra gereinigt.

Mit freundlichen Grüßen
Sabrina Vogt`,
      },
      {
        from: "am-lueders",
        to: ["bh-vogt"],
        cc: ["am-sander", "bh-hoefer"],
        date: "2025-02-10T11:30",
        body: `Sehr geehrte Frau Vogt,

vielen Dank für die schnelle Meldung. Nach dem Verlauf (plötzlicher Beginn, Erbrechen im Schwall, Ausbreitung innerhalb weniger Tage) gehen wir von einem **Norovirus-Ausbruch** aus. Bitte setzen Sie ab sofort Folgendes um:

1. Erkrankte Kinder und Beschäftigte bleiben zu Hause. Wiederzulassung frühestens **48 Stunden** nach dem letzten Erbrechen bzw. Durchfall; ein ärztliches Attest ist nicht erforderlich.
2. Gesunde Geschwisterkinder dürfen kommen, solange sie keine Beschwerden haben.
3. Flächen, Türklinken, Wickelauflagen, Toiletten und Spielzeug täglich mit einem Mittel mit Wirkbereich „viruzid“ oder „begrenzt viruzid PLUS“ desinfizieren, Händedesinfektion ebenso. Normale Reinigungsmittel reichen bei Noroviren nicht.
4. Erbrochenes nur mit Handschuhen, Mund-Nasen-Schutz und Einmaltüchern beseitigen.
5. Gruppen Igel und Füchse bis auf Weiteres getrennt halten, kein gemeinsames Frühstück, Turnraum nur gruppenweise.
6. Bitte informieren Sie heute alle Eltern schriftlich. Eine Vorlage für den Elternbrief schicke ich Ihnen bis 14 Uhr.

Für die Labordiagnostik bringt Ihnen ein Kollege heute Nachmittag drei Probenröhrchen. Bitte geben Sie diese Eltern von Kindern mit frischen Beschwerden mit (Stuhlprobe, Rückgabe bei Ihnen, wir holen ab).

Die Liste bitte täglich bis 9 Uhr aktualisieren – aber **nicht mehr unverschlüsselt per E-Mail**, sondern über das Upload-Formular des Gesundheitsamts (www.altmoorland.example/gesundheitsamt/meldung) oder telefonisch unter 040 66969-218. Gesundheitsdaten von Kindern gehören nicht in normale E-Mails.

Mit freundlichen Grüßen
Heike Lüders`,
      },
      {
        from: "bh-vogt",
        to: ["am-lueders"],
        cc: ["bh-hoefer"],
        date: "2025-02-12T07:58",
        body: `Guten Morgen Frau Lüders,

entschuldigung, das Formular hat gestern bei uns nicht funktioniert (Fehlermeldung beim Hochladen), deshalb noch einmal so. Stand heute früh:

Neu erkrankt seit Montag:
10. Lotta Brüning, 03.04.2021, Eulen, 11.02.
11. Theo Janssen, 21.10.2020, Igel, 11.02.
12. Clara Meyer, 09.02.2022, Füchse, 11.02.
13. Noah Kaya, 15.12.2020, Eulen, 11.02.
14. Leni Schoon, 28.06.2023, Mäuse, 12.02. (heute früh abgemeldet)

Damit sind es jetzt 14 Kinder. Mats Oltmann liegt seit gestern Abend im Kreiskrankenhaus Altmoor (zu wenig getrunken, bekommt Infusionen). Lea, Hannah und Jonas sind seit Sonntag ohne Beschwerden und kommen morgen wieder.

Bei den Mitarbeiterinnen ist zusätzlich Anke Dierks (Gruppe Füchse) erkrankt. Von unseren 11 Fachkräften fehlen damit 3, eine weitere ist im Urlaub. Ab Donnerstag kann ich Igel und Füchse nicht mehr getrennt besetzen.

Einige Eltern fragen, ob wir nicht eine Woche schließen sollten, damit es endlich aufhört. Ein Vater will sich beim Bürgermeister beschweren. Wie sehen Sie das? Können Sie eine Schließung anordnen oder muss das die Gemeinde entscheiden?

Die Stuhlproben von Theo und Clara haben die Eltern gestern abgegeben, die dritte kommt heute.

Viele Grüße
Sabrina Vogt`,
      },
      {
        from: "am-sander",
        to: ["bh-vogt"],
        cc: ["am-lueders", "bh-hoefer", "bh-ruhnau"],
        date: "2025-02-12T13:40",
        body: `Sehr geehrte Frau Vogt,

Frau Lüders hat mich über den Verlauf informiert. Inzwischen liegt der Laborbefund vor: In beiden bisher untersuchten Stuhlproben wurde **Norovirus der Genogruppe II** nachgewiesen. Damit ist der Ausbruch bestätigt; wir melden ihn an die Landesbehörde.

Zu Ihren Fragen:
- **Schließung:** Eine Schließung ordnen wir derzeit nicht an. Noroviren werden über Schmierinfektion übertragen; die Kette lässt sich mit konsequenter Hygiene und dem Ausschluss Erkrankter unterbrechen. Eine Schließung verlagert die Ansteckungen erfahrungsgemäß nur in private Kontakte. Über eine eingeschränkte Betreuung wegen Personalmangels entscheidet der Träger, also die Gemeinde.
- **Zusammenlegung:** Wenn Igel und Füchse ab Donnerstag zusammengelegt werden müssen, dann nur mit Kindern, die seit mindestens 48 Stunden beschwerdefrei sind, und möglichst mit getrennten Waschräumen.
- **Küche:** Wer Beschwerden hat, darf nach § 42 IfSG nicht mit Lebensmitteln umgehen. Das gilt auch für Kolleginnen, die beim Austeilen helfen.

Frau Lüders kommt morgen, 13.02., um 9:00 Uhr zu einer **Hygienebegehung**. Bitte halten Sie die Desinfektionsmittel (Produkt, Wirkbereich, Einwirkzeit) und den Reinigungsplan bereit.

Zum Upload-Formular: Der Fehler ist bekannt, der Zweckverband arbeitet daran. Bis dahin bitte nur Initialen und Geburtsjahr per Mail; die vollständigen Angaben nimmt Frau Lüders morgen vor Ort auf.

Herr Ruhnau, ich habe Sie in Kopie genommen, weil Sie als Träger über eine eingeschränkte Betreuung entscheiden. Gern stimme ich mich dazu kurzfristig telefonisch mit Ihnen ab.

Mit freundlichen Grüßen
Dr. Miriam Sander`,
      },
    ],
  },

  // ── Abfallwirtschaftsbetrieb und Betriebshof Rabensfurt: wilde Ablagerungen ──
  {
    id: "am-wilde-muellablagerungen-rabensfurt-kosten",
    title: "Wilde Müllablagerungen in Rabensfurt – wer zahlt?",
    subject: "Wilde Müllablagerungen im Stadtgebiet Rabensfurt – Kostenerstattung durch den AWB",
    org: "altmoorland",
    unit: "am-abfall",
    date: "2026-04-23",
    tags: ["zahlen", "widersprueche"],
    keywords: ["wilde Ablagerungen", "LAbfG", "Wiegescheine", "Wertstoffhof Rabensfurt-Ost", "22.436 €"],
    summary:
      "Betriebshof Rabensfurt und Abfallwirtschaftsbetrieb streiten über Zuständigkeit und Kosten für wilde Müllablagerungen. Mengen (186 t, 142 t, 149 t) und Einsatzzahlen (412 bzw. rund 380) widersprechen sich, 186 t und 186.000 € werden verwechselt; die Gebührenkalkulation hängt an.",
    mails: [
      {
        from: "rf-wittkamp",
        to: ["am-dirksen"],
        cc: ["rf-ostermann"],
        date: "2026-04-20T09:05",
        body: `Sehr geehrter Herr Dirksen,

der Betriebshof der Stadt Rabensfurt ist 2025 insgesamt **412 Einsätze** wegen wilder Müllablagerungen gefahren – Sperrmüll an den Glascontainern Mühlenkamp, Altreifen am Parkplatz Furtwiesen, Bauschutt am Waldweg hinter Rabensfurt-Ost, das volle Programm. Nach unseren Wiegescheinen haben wir **186 t** bei Ihnen am Wertstoffhof Rabensfurt-Ost angeliefert und dafür die Anlieferungsgebühr von 158 € je Tonne bezahlt.

Unsere Kosten 2025:
- Personal (zwei Mitarbeiter, anteilig): 51.200 €
- Fahrzeuge und Geräte: 13.700 €
- Anlieferungsgebühren beim AWB: 29.388 €
- zusammen: 94.288 €

Im ersten Quartal 2026 waren es schon wieder 128 Einsätze.

Ich verstehe nicht, warum die Stadt das allein tragen soll. Ihre Gebührenkalkulation sieht für die Beseitigung wilder Ablagerungen 186.000 € vor – das zahlen unsere Bürgerinnen und Bürger über die Abfallgebühren also ohnehin. Wir bitten deshalb um Erstattung unserer Kosten für 2025 und um eine Regelung ab 2026, mindestens aber um den Verzicht auf die Anlieferungsgebühren.

Mit freundlichen Grüßen
Klaus Wittkamp`,
      },
      {
        from: "am-dirksen",
        to: ["rf-wittkamp"],
        cc: ["am-reents", "rf-ostermann"],
        date: "2026-04-21T14:20",
        attachments: ["am-abfallgebuehrenkalkulation-2026"],
        body: `Sehr geehrter Herr Wittkamp,

vielen Dank für Ihre Aufstellung. Zur Einordnung:

1. **Zuständigkeit:** Nach dem Landesabfallgesetz (LAbfG) beseitigt der Landkreis als öffentlich-rechtlicher Entsorgungsträger wilde Ablagerungen auf Flächen außerhalb der im Zusammenhang bebauten Ortsteile, wenn kein Verursacher zu ermitteln ist. Innerhalb der Ortslagen sind die Eigentümer zuständig, auf öffentlichen Flächen also die Stadt. Kosten, die nicht zur Abfallentsorgung des Kreises gehören, sind nach dem KAG nicht gebührenfähig.

2. **Die 186.000 €** in der Kalkulation (Position K10, siehe Anlage) sind der Ansatz für 2026. Sie betreffen nur unsere eigenen Einsätze an Kreisstraßen, Feld- und Waldwegen im Außenbereich.

3. **Mengen:** Laut unserer Waage hat Ihr Betriebshof 2025 am Wertstoffhof Rabensfurt-Ost unter „Wilde Ablagerungen“ **142 t** angeliefert, abgerechnet wurden 22.436 €. Die 186 t kann ich nicht nachvollziehen.

Unabhängig davon biete ich an, Anlieferungen Ihres Betriebshofs aus wilden Ablagerungen ab 01.05.2026 gebührenfrei anzunehmen, wenn sie mit dem Lieferschein „Wilde Ablagerung Stadt Rabensfurt“ gekennzeichnet sind. Eine Erstattung Ihrer Personal- und Fahrzeugkosten aus dem Gebührenhaushalt ist nicht möglich.

Die Gebührenkalkulation hänge ich Ihnen zur Information an.

Mit freundlichen Grüßen
Rolf Dirksen`,
      },
      {
        from: "rf-wittkamp",
        to: ["am-dirksen"],
        cc: ["am-reents", "rf-ostermann"],
        date: "2026-04-22T08:47",
        body: `Sehr geehrter Herr Dirksen,

danke für das Angebot mit der gebührenfreien Annahme, das nehmen wir gern an.

Bei den Mengen bleibe ich aber dabei: Wir haben die Wiegescheine von 2025 noch einmal durchgezählt und kommen auf 186 t. Ein Teil unserer Fuhren ist im Sommer zum Wertstoffhof Altmoor gegangen, weil Rabensfurt-Ost wegen des Umbaus zeitweise zu war – die haben Sie wahrscheinlich nicht mitgezählt. Abgerechnet haben Sie uns übrigens mehr als 22.436 €, das lasse ich gerade von unserer Kasse prüfen.

Zur Zuständigkeit: Die Hälfte unserer rund 380 Einsätze im letzten Jahr war an Stellen, die aus meiner Sicht klar Außenbereich sind (Waldweg Rabensfurt-Ost, Parkplatz an der K 14). Da wäre nach Ihrer eigenen Logik der Kreis dran. Und wenn die 186.000 € für 2025 nicht gebraucht wurden, wäre doch Luft da.

Ich schlage einen Ortstermin vor, gern mit Frau Reents. Passt Ihnen der 05.05. oder der 07.05.?

Mit freundlichen Grüßen
Klaus Wittkamp`,
      },
      {
        from: "am-dirksen",
        to: ["rf-wittkamp"],
        cc: ["am-reents", "rf-ostermann", "am-bruenjes"],
        date: "2026-04-23T11:15",
        body: `Sehr geehrter Herr Wittkamp,

der 07.05. um 10 Uhr passt, Treffpunkt Wertstoffhof Rabensfurt-Ost. Frau Reents bringt die Wiegedaten beider Wertstoffhöfe mit.

Zwei Klarstellungen vorab, damit wir nicht aneinander vorbeireden:
- Für 2025 hatten wir für wilde Ablagerungen 172.000 € angesetzt und rund 181.000 € ausgegeben. Die 186.000 € sind der Ansatz für 2026. Luft gibt es da leider nicht.
- Ihre Liste der Einsatzorte nehmen wir gern auf. Wo es tatsächlich Außenbereich ist, übernehmen wir diese Stellen künftig selbst. Bitte bringen Sie die Einsatzliste 2025 mit Ortsangaben mit.

Frau Reents hat bereits nachgesehen: In unserem System sind für Ihren Betriebshof 2025 insgesamt 149 t verbucht, davon 7 t am Wertstoffhof Altmoor. Die Differenz zu Ihren 186 t klären wir am besten anhand der Wiegescheine.

Herrn Brünjes habe ich in Kopie gesetzt, weil eine dauerhafte Vereinbarung zwischen Stadt und Kreis über das Dezernat laufen sollte.

Mit freundlichen Grüßen
Rolf Dirksen`,
      },
    ],
  },

  // ── Schülerbeförderung: Beschwerde über gestrichene Haltestelle ────
  {
    id: "am-beschwerde-haltestelle-moorweg-linie-512",
    title: "Beschwerde einer Mutter über die gestrichene Haltestelle Moorweg",
    subject: "Haltestelle Moorweg gestrichen – mein Sohn muss jetzt an der Kreisstraße langlaufen!!",
    org: "altmoorland",
    unit: "am-schule",
    date: "2026-09-02",
    tags: ["personendaten"],
    keywords: ["Haltestelle Moorweg", "Linie 512", "1,4 km", "Schulwegüberprüfung", "Bedarfshalt"],
    summary:
      "Eine aufgebrachte Mutter beschwert sich, weil der Schulbus nach dem Fahrplanwechsel nicht mehr am Moorweg hält. Schülerbeförderung und ÖPNV-Planung klären intern Fußweg, Satzung und Zahl der betroffenen Kinder und finden eine Lösung; die Übersicht der Schülerbeförderung hängt an. Enthält Namen, Anschrift und Schulklassen von Kindern.",
    mails: [
      {
        from: "ext-amb-tammen",
        to: ["am-ehlers"],
        date: "2026-08-31T21:47",
        body: `Sehr geehrter Herr Ehlers,

Ihre Adresse hab ich von der Schule. Seit Schulanfang hält der Bus Linie 512 nicht mehr am Moorweg. Mein Sohn Finn (11, Klasse 5b an der KGS Fennhusen) muss jetzt morgens um viertel vor sieben im dunkeln fast 2 km an der K 17 lang bis zur Dorfstraße laufen. Da gibt es keinen Fußweg, keine Laterne und die LKW vom Torfwerk fahren da mit 80!!

Uns hat das NIEMAND gesagt. Im Fahrplan steht es ganz klein, das hab ich erst gesehen als Finn am ersten Tag an der Haltestelle stand und der Bus einfach vorbei gefahren ist. Er kam dann eine Stunde zu spät zur Schule und hat geweint.

Wir wohnen Moorweg 14, 00755 Torfkamp. Am Moorweg wohnen noch drei andere Kinder die zur KGS fahren, denen geht es genauso.

Ich erwarte das die Haltestelle sofort wieder angefahren wird oder das der Landkreis ein Taxi bezahlt. Ich arbeite ab 6 Uhr in der Pflege und kann ihn nicht fahren.

Mit freundlichen Grüßen
Jessica Tammen`,
      },
      {
        from: "am-ehlers",
        to: ["ext-amb-tammen"],
        date: "2026-09-01T10:12",
        body: `Sehr geehrte Frau Tammen,

vielen Dank für Ihre Nachricht. Es tut mir leid, dass Finn so einen ersten Schultag hatte.

Zum Hintergrund: Mit dem Fahrplanwechsel am 24.08.2026 wurden auf der Linie 512 zwei Haltestellen aufgegeben, an denen im Durchschnitt weniger als fünf Fahrgäste am Tag ein- oder ausgestiegen sind, darunter der Moorweg. Für Finn ist die Ersatzhaltestelle Torfkamp, Dorfstraße. Nach unserer Berechnung beträgt der Fußweg von Ihrer Adresse dorthin **1,4 km**. Nach § 5 Abs. 2 der Satzung über die Schülerbeförderung im Landkreis Altmoorland ist Schülerinnen und Schülern der Sekundarstufe I ein Fußweg zur Haltestelle von bis zu 2 km zumutbar – allerdings nur, wenn der Weg nicht besonders gefährlich ist.

Genau das lasse ich prüfen: Ich habe eine **Schulwegüberprüfung** für die K 17 zwischen Moorweg und Dorfstraße bei der Straßenverkehrsbehörde beantragt. Dabei werden Verkehrsmenge, Geschwindigkeit, Seitenraum und Beleuchtung bewertet. Außerdem frage ich bei unserer ÖPNV-Planung nach, ob die Haltestelle für die Schulfahrten wieder angefahren werden kann.

In unserer Anmeldeliste ist am Moorweg übrigens nur ein Fahrschüler erfasst, nämlich Finn. Wenn weitere Kinder betroffen sind, wäre es hilfreich, wenn sich die Eltern bei mir melden.

Ich melde mich spätestens Ende der Woche wieder bei Ihnen.

Mit freundlichen Grüßen
Niklas Ehlers`,
      },
      {
        from: "ext-amb-tammen",
        to: ["am-ehlers"],
        date: "2026-09-01T19:55",
        body: `Hallo Herr Ehlers,

danke für die schnelle Antwort, aber 1,4 km stimmt nicht. Das geht nur über den Feldweg hinter dem Hof Bruns und der ist im Winter nicht begehbar und auch nicht beleuchtet. Über die Kreisstraße sind es laut Routenplaner im Handy 1,9 km, ich bin es heute selber abgelaufen.

Die anderen Kinder sind Lennart Behnke (Klasse 7) und die Zwillinge Mia und Ella Gröne (Klasse 6), alle KGS Fennhusen. Die Eltern haben die Anmeldung erst nach den Ferien gemacht weil der Bus ja bis dahin immer gehalten hat.

Wenn bis Freitag nichts passiert schreib ich an den Landrat und ans Kreisblatt. Das ist kein Witz.

Jessica Tammen`,
      },
      {
        from: "am-ehlers",
        to: ["am-jacobsen"],
        cc: ["am-thiessen"],
        date: "2026-09-02T08:40",
        subject: "Haltestelle Moorweg (Linie 512) – Elternbeschwerde, bitte um kurzfristige Prüfung",
        quote: false,
        attachments: ["am-schuelerbefoerderung-2026-27-linien-kosten"],
        body: `Hallo Torben,

kurze Bitte um Prüfung, es eilt etwas: Zum Fahrplanwechsel ist auf der 512 die Haltestelle Moorweg in Torfkamp entfallen (siehe Blatt „Änderungen 2026-27“ in der Anlage). In meiner Anmeldeliste stand dort nur ein Fahrschüler, tatsächlich sind es vier (KGS Fennhusen, Klassen 5 bis 7) – drei Anmeldungen kamen erst nach den Ferien.

Die Mutter, Frau Tammen, hat sich heftig beschwert. Der Fußweg zur Dorfstraße ist entweder 1,4 km über einen unbeleuchteten Feldweg oder 1,9 km an der K 17 ohne Gehweg. Die Schulwegüberprüfung ist beantragt, das Ergebnis kommt aber frühestens in drei Wochen. Wird der Weg als besonders gefährlich eingestuft, müssen wir ein Taxi stellen – bei vier Kindern grob 9.000 € im Schuljahr.

Kann die 512 den Moorweg nicht wenigstens für die Schulfahrten wieder bedienen? Laut Fahrplan fährt sie 06:52 ab Schilfwerder und 13:18 ab Fennhusen.

Die Mutter hat angekündigt, sich an den Landrat und die Presse zu wenden.

Danke und Gruß
Niklas`,
      },
      {
        from: "am-jacobsen",
        to: ["am-ehlers"],
        cc: ["am-thiessen"],
        date: "2026-09-02T14:05",
        body: `Hallo Niklas,

danke für den Hinweis, das hatten wir nicht auf dem Schirm. Die Haltestelle ist bei der Fortschreibung des Nahverkehrsplans aufgegeben worden: Bei der Zählung 2025 gab es dort im Schnitt 3 Ein- und Aussteiger am Tag, und die Haltestelle liegt ohne Aufstellfläche direkt an der K 17. Eure Anmeldezahlen hatten wir für die Entscheidung nicht – das sollten wir künftig vorher abgleichen.

Vorschlag: Die 512 hält ab Montag, 14.09.2026, am Moorweg wieder als **Bedarfshalt** für die beiden Schulfahrten (06:52 ab Schilfwerder, 13:18 ab Fennhusen). Der Bus hält nur, wenn jemand wartet oder beim Fahrer den Halt anmeldet. Das Verkehrsunternehmen hat mündlich zugestimmt; die Änderung zeige ich der Genehmigungsbehörde an. Das Haltestellenschild stellt die Straßenmeisterei bis Freitag wieder auf.

Für die Woche bis dahin bräuchten wir eine Übergangslösung von euch.

Maren, bist du einverstanden? Dann kann Niklas der Mutter heute noch Bescheid geben.

Gruß
Torben`,
      },
      {
        from: "am-ehlers",
        to: ["ext-amb-tammen"],
        date: "2026-09-02T16:30",
        quote: false,
        body: `Sehr geehrte Frau Tammen,

ich habe eine gute Nachricht: Ab Montag, 14.09.2026, hält die Linie 512 am Moorweg wieder – als Bedarfshalt für die Schulfahrten morgens (Abfahrt Moorweg ca. 06:58 Uhr) und mittags (Ankunft Moorweg ca. 13:41 Uhr). Der Bus hält, wenn jemand an der Haltestelle wartet; beim Aussteigen bitte rechtzeitig den Halteknopf drücken.

Bis dahin übernimmt der Landkreis für Finn und die drei anderen Kinder vom Moorweg ein Sammeltaxi (Abfahrt 06:55 Uhr am Moorweg). Das Taxiunternehmen meldet sich heute Abend bei Ihnen.

Die Schulwegüberprüfung läuft trotzdem weiter. Bitte sagen Sie den anderen Eltern, dass sie ihre Kinder noch bei mir anmelden müssen (Antrag unter www.altmoorland.example/schuelerbefoerderung).

Entschuldigen Sie bitte, dass Sie über die Änderung nicht rechtzeitig informiert wurden.

Mit freundlichen Grüßen
Niklas Ehlers`,
      },
    ],
  },
];
