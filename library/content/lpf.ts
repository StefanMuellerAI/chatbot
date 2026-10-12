// Landesamt für Personalgewinnung und Fortbildung (Land)
import type { DocSpec, ThreadSpec } from "../types";

export const documents: DocSpec[] = [
  {
    type: "excel",
    id: "lpf-fortbildungsplanung-2026",
    title: "Fortbildungsplanung 2026 – Digitale Kompetenzen",
    kind: "Planung",
    fileName: "Fortbildungsplanung 2026 Digitale Kompetenzen",
    org: "lpf",
    unit: "lpf-22",
    author: "lpf-ostrowski",
    date: "2025-10-01",
    tags: ["zahlen"],
    keywords: ["KI im Verwaltungsalltag", "Teilnehmendentage", "Haushaltsansatz 2026", "Informationssicherheit"],
    summary:
      "Kursplanung des Referats Digitale Kompetenzen mit Terminen, Plätzen und Kosten je Kurs sowie ein Budgetblatt, das die Planung mit dem Haushaltsansatz vergleicht.",
    sheets: [
      {
        name: "Kurse",
        title: "Fortbildungsprogramm 2026 – Digitale Kompetenzen",
        subtitle: "Entwurf Referat 22 · Kosten je Teilnehmendentag inkl. Honorar, Raum und Material",
        columns: [
          { header: "Nr.", width: 6 },
          { header: "Kurs", width: 36 },
          { header: "Format", width: 12 },
          { header: "Termine", width: 9, fmt: "int" },
          { header: "Tage je Termin", width: 9, fmt: "int" },
          { header: "Plätze je Termin", width: 10, fmt: "int" },
          { header: "Plätze gesamt", width: 10, fmt: "int" },
          { header: "Teilnehmendentage", width: 13, fmt: "int" },
          { header: "Kosten je TN-Tag", width: 12, fmt: "eur0" },
          { header: "Kosten gesamt", width: 14, fmt: "eur0" },
          { header: "Zielgruppe", width: 30 },
        ],
        rows: [
          [
            "D-01",
            "KI im Verwaltungsalltag – Grundlagen",
            "online",
            12,
            1,
            20,
            { f: "D{r}*F{r}" },
            { f: "G{r}*E{r}" },
            180,
            { f: "H{r}*I{r}" },
            "alle Beschäftigten",
          ],
          [
            "D-02",
            "Prompting für Fachaufgaben",
            "Präsenz",
            8,
            1,
            14,
            { f: "D{r}*F{r}" },
            { f: "G{r}*E{r}" },
            260,
            { f: "H{r}*I{r}" },
            "Sachbearbeitung mit KI-Zugang",
          ],
          ["D-03", "Datenschutz und KI", "online", 6, 1, 25, { f: "D{r}*F{r}" }, { f: "G{r}*E{r}" }, 150, { f: "H{r}*I{r}" }, "alle Beschäftigten"],
          [
            "D-04",
            "KI und Verantwortung für Führungskräfte",
            "Präsenz",
            4,
            1,
            12,
            { f: "D{r}*F{r}" },
            { f: "G{r}*E{r}" },
            320,
            { f: "H{r}*I{r}" },
            "Führungskräfte",
          ],
          ["D-05", "E-Akte für Führungskräfte", "Präsenz", 4, 1, 12, { f: "D{r}*F{r}" }, { f: "G{r}*E{r}" }, 240, { f: "H{r}*I{r}" }, "Führungskräfte"],
          [
            "D-06",
            "Barrierefreie Dokumente erstellen",
            "online",
            6,
            1,
            18,
            { f: "D{r}*F{r}" },
            { f: "G{r}*E{r}" },
            160,
            { f: "H{r}*I{r}" },
            "Sachbearbeitung, Assistenz",
          ],
          [
            "D-07",
            "Excel für Fortgeschrittene",
            "Präsenz",
            10,
            2,
            12,
            { f: "D{r}*F{r}" },
            { f: "G{r}*E{r}" },
            210,
            { f: "H{r}*I{r}" },
            "Haushalt, Controlling, Statistik",
          ],
          [
            "D-08",
            "Informationssicherheit – Basisschulung",
            "E-Learning",
            1,
            1,
            400,
            { f: "D{r}*F{r}" },
            { f: "G{r}*E{r}" },
            35,
            { f: "H{r}*I{r}" },
            "Pflicht für Neueingestellte",
          ],
          ["D-09", "Agiles Arbeiten in Projekten", "Präsenz", 4, 2, 16, { f: "D{r}*F{r}" }, { f: "G{r}*E{r}" }, 280, { f: "H{r}*I{r}" }, "Projektleitungen"],
          {
            total: true,
            cells: [
              "",
              "Summe",
              "",
              { f: "SUM(D{first}:D{last})" },
              null,
              null,
              { f: "SUM(G{first}:G{last})" },
              { f: "SUM(H{first}:H{last})" },
              null,
              { f: "SUM(J{first}:J{last})" },
              "",
            ],
          },
        ],
        notes: ["Kurse D-01 bis D-04 setzen den KI-Leitfaden des Ministeriums für Kommunales und Verwaltungsentwicklung um (Schulungspflicht vor Nutzung)."],
      },
      {
        name: "Budget",
        title: "Abgleich mit dem Haushalt 2026",
        columns: [
          { header: "Position", width: 44 },
          { header: "Betrag", width: 16, fmt: "eur0" },
        ],
        rows: [
          ["Haushaltsansatz 2026 Titel 525 01 (Digitale Kompetenzen)", 250000],
          ["Summe Kursplanung (Blatt „Kurse“)", { f: "Kurse!J14" }],
          ["Reserve für Nachfrage (10 % der Kursplanung)", { f: "ROUND(B6*0.1,0)" }],
          ["Bedarf gesamt", { f: "B6+B7" }],
          { total: true, cells: ["Differenz zum Ansatz (negativ = Mehrbedarf)", { f: "B5-B8" }] },
        ],
        notes: ["Bei Mehrbedarf: Kurs D-07 kann auf 8 Termine reduziert oder D-09 in das Jahr 2027 verschoben werden."],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "lpf-personalgewinnung-2026",
    title: "Personalgewinnung 2026 – Lage und Maßnahmen",
    kind: "Präsentation",
    fileName: "Personalgewinnung 2026 Lage und Massnahmen",
    org: "lpf",
    unit: "lpf-12",
    author: "lpf-aksoy",
    date: "2025-09-18",
    tags: ["zahlen"],
    keywords: ["Altersgrenze", "Bewerbungen je Stelle", "Karriereportal", "Quereinstieg"],
    summary:
      "Lagebild zur Personalgewinnung der Landesverwaltung: Altersstruktur, sinkende Bewerberzahlen, wirksame und unwirksame Maßnahmen sowie Entscheidungsbedarf für 2026.",
    slides: [
      { t: "title", title: "Personalgewinnung 2026", subtitle: "Lage und Maßnahmen – Vortrag in der Amtsleitungsrunde" },
      {
        t: "bullets",
        title: "Die Lage in drei Sätzen",
        bullets: [
          "Bis 2030 erreichen rund **4.900 von 38.000** Beschäftigten der Landesverwaltung die Altersgrenze (13 %).",
          "Die Zahl der Bewerbungen je ausgeschriebener Stelle hat sich seit 2021 mehr als halbiert.",
          "Besonders schwer zu besetzen: IT, Technik, Bauverwaltung und Sozialarbeit.",
        ],
        notes: "Die 4.900 beziehen sich auf die reguläre Altersgrenze, vorzeitige Ruhestände kommen hinzu.",
      },
      {
        t: "chart",
        title: "Bewerbungen je ausgeschriebener Stelle",
        chart: {
          type: "bar",
          categories: ["2021", "2022", "2023", "2024", "2025*"],
          series: [{ name: "Bewerbungen je Stelle", values: [14.2, 11.8, 9.6, 7.1, 5.4] }],
          unit: "Bewerbungen",
        },
        caption: "* 2025: Januar bis August · Quelle: Bewerbermanagementsystem",
      },
      {
        t: "chart",
        title: "Altersstruktur der Beschäftigten",
        chart: {
          type: "pie",
          categories: ["unter 30", "30 bis 39", "40 bis 49", "50 bis 59", "60 und älter"],
          series: [{ name: "Anteil in %", values: [9, 19, 23, 31, 18] }],
        },
        notes: "Fast die Hälfte der Beschäftigten ist 50 Jahre oder älter.",
      },
      {
        t: "twocol",
        title: "Was wirkt – was nicht",
        left: {
          heading: "Wirkt",
          bullets: [
            "Duales Studium mit Übernahmegarantie",
            "Schnelle Verfahren (Zusage in unter 4 Wochen)",
            "Mobiles Arbeiten ausdrücklich in der Anzeige",
            "Empfehlungen durch eigene Beschäftigte",
          ],
        },
        right: {
          heading: "Wirkt kaum",
          bullets: [
            "Anzeigen in Printmedien",
            "Lange Ausschreibungstexte mit Rechtsgrundlagen",
            "Jobmessen ohne Fachkräfte am Stand",
            "Pauschale Stellenbörsen ohne Zielgruppe",
          ],
        },
      },
      {
        t: "table",
        title: "Maßnahmen 2026",
        header: ["Maßnahme", "Kosten", "Start"],
        rows: [
          ["Neues Karriereportal mit Online-Bewerbung in 10 Minuten", "95.000 €", "02/2026"],
          ["Programm „Quereinstieg Verwaltung“ (12 Monate, berufsbegleitend)", "240.000 €", "04/2026"],
          ["Prämie für erfolgreiche Empfehlungen (500 €)", "40.000 €", "01/2026"],
          ["Bewerbungsverfahren: Zielmarke 28 Tage bis zur Zusage", "–", "01/2026"],
        ],
      },
      {
        t: "bullets",
        title: "Entscheidungsbedarf",
        bullets: [
          "Freigabe der Mittel für das Karriereportal",
          "Zustimmung zum Quereinstiegsprogramm (Abstimmung mit dem Finanzministerium läuft)",
          "Einführung der Empfehlungsprämie – Beteiligung des Hauptpersonalrats",
        ],
      },
      { t: "end", title: "Danke für Ihre Aufmerksamkeit", lines: ["Derya Aksoy · Referat 12 – Stellenbesetzung und Recruiting"] },
    ],
  },
  {
    type: "word",
    id: "lpf-ausschreibung-referatsleitung-z1",
    title: "Stellenausschreibung: Leitung des Referats Z 1 – Haushalt und Controlling (A 15 / EG 15)",
    kind: "Stellenausschreibung",
    fileName: "Stellenausschreibung LPF-04-2025 Referatsleitung Z 1 Haushalt und Controlling A 15",
    org: "lpf",
    unit: "lpf-z2",
    author: "lpf-arndt",
    date: "2025-02-14",
    tags: [],
    keywords: ["LPF-04/2025", "Referat Z 1", "A 15", "14.03.2025", "Kosten- und Leistungsrechnung"],
    summary:
      "Kurze Stellenausschreibung für eine Referatsleitung mit Aufgaben, Anforderungen, Angebot und Bewerbungshinweisen. Geeignet zum Kürzen, für eine Social-Media-Fassung, eine Version in Leichter Sprache oder einen Abgleich mit den Erkenntnissen aus der Präsentation zur Personalgewinnung.",
    meta: [["Kennziffer", "LPF-04/2025"]],
    subject: "Leiterin oder Leiter (m/w/d) des Referats Z 1 – Haushalt und Controlling",
    blocks: [
      {
        t: "p",
        text: "Das Landesamt für Personalgewinnung und Fortbildung (LPF) ist der zentrale Dienstleister der Landesverwaltung für Ausbildung, Personalgewinnung und Fortbildung. Für das **Referat Z 1** suchen wir zum 01.06.2025 eine Referatsleitung. Bewertung: **A 15** LBesO bzw. Entgeltgruppe 15 TV-L.",
      },
      { t: "h3", text: "Ihre Aufgaben" },
      {
        t: "ul",
        items: [
          "Leitung des Referats mit sechs Beschäftigten",
          "Aufstellung und Vollzug des Haushalts des LPF (Volumen rund 24 Mio. €)",
          "Weiterentwicklung der Kosten- und Leistungsrechnung und des Bildungscontrollings",
          "Kalkulation der Teilnahmeentgelte für kommunale Teilnehmende",
          "Beratung der Amtsleitung in allen Haushalts- und Wirtschaftlichkeitsfragen",
        ],
      },
      { t: "h3", text: "Ihr Profil" },
      {
        t: "ul",
        items: [
          "Laufbahnbefähigung für die Laufbahngruppe 2, zweites Einstiegsamt, oder abgeschlossenes Masterstudium (Wirtschafts-, Verwaltungs- oder Rechtswissenschaften)",
          "mehrjährige Erfahrung im öffentlichen Haushaltsrecht",
          "Führungserfahrung oder erfolgreiche Teilnahme am Programm „Führen im Wandel“",
          "sicherer Umgang mit Tabellenkalkulation und dem Haushaltsverfahren des Landes",
        ],
      },
      { t: "h3", text: "Wir bieten" },
      {
        t: "ul",
        items: ["mobiles Arbeiten bis zu 60 % der Arbeitszeit", "Gleitzeit ohne Kernzeit", "Fortbildung im eigenen Haus", "Jobticket"],
      },
      {
        t: "p",
        text: "Die Stelle ist teilzeitgeeignet. Bewerbungen von Frauen sind ausdrücklich erwünscht. Schwerbehinderte Menschen werden bei gleicher Eignung bevorzugt berücksichtigt.",
      },
      {
        t: "p",
        text: "Bitte bewerben Sie sich bis zum **14.03.2025** über das Stellenportal der Landesverwaltung (https://stellen.landesverwaltung.example). Fragen beantworten Frau Arndt (069 90009-732) und fachlich Herr Dr. Eckhardt (069 90009-701).",
      },
    ],
  },
  {
    type: "powerpoint",
    id: "lpf-fuehrungskraefteprogramm-fuehren-im-wandel",
    title: "Führungskräfteprogramm „Führen im Wandel“ – Jahrgang 2025/26",
    kind: "Präsentation",
    fileName: "Fuehren im Wandel Jahrgang 2025-26 Informationsveranstaltung",
    org: "lpf",
    unit: "lpf-21",
    author: "lpf-brueggemann",
    date: "2025-04-09",
    tags: [],
    keywords: ["Führen im Wandel", "Peer-Coaching", "Praxisprojekt", "4.850 €", "Nominierung"],
    summary:
      "Informationspräsentation zum 18-monatigen Programm für Nachwuchsführungskräfte: Zielgruppe, Module, Lernformate, Evaluation des Vorjahrgangs, Aufwand und Auswahlverfahren. Geeignet für eine Einladungsmail, einen Steckbrief oder eine Kurzfassung für Vorgesetzte.",
    slides: [
      { t: "title", title: "Führen im Wandel", subtitle: "Führungskräfteprogramm der Landesverwaltung · Jahrgang 2025/26 · Informationsveranstaltung am 9. April 2025" },
      {
        t: "bullets",
        title: "Warum dieses Programm?",
        bullets: [
          "Rund 31 % der Führungskräfte der Landesverwaltung scheiden bis 2030 aus",
          "Führen heißt heute: hybride Teams, digitale Prozesse, knappe Personaldecke",
          "Wir wollen Nachwuchs früh und systematisch vorbereiten – nicht erst nach der Beförderung",
        ],
        notes: "Die 31 % beziehen sich auf Referats- und Abteilungsleitungen sowie Sachgebietsleitungen mit Personalverantwortung.",
      },
      {
        t: "bullets",
        title: "Für wen?",
        bullets: [
          "Beschäftigte mit Führungspotenzial ab Besoldungsgruppe A 12 bzw. Entgeltgruppe 12",
          "Nominierung durch die Behördenleitung, höchstens zwei Personen je Behörde",
          { text: "24 Plätze", sub: ["davon 2 Plätze für kommunale Beschäftigte (Pilot)", "Ziel: mindestens 50 % Frauen"] },
        ],
      },
      {
        t: "table",
        title: "Aufbau: sechs Module in 18 Monaten",
        header: ["Modul", "Thema", "Dauer", "Zeitraum"],
        rows: [
          ["M1", "Rolle und Selbstverständnis als Führungskraft", "3 Tage", "September 2025"],
          ["M2", "Kommunikation, Gesprächsführung, Konflikte", "3 Tage", "November 2025"],
          ["M3", "Führen auf Distanz und in hybriden Teams", "3 Tage", "Februar 2026"],
          ["M4", "Veränderung gestalten, Digitalisierung und KI", "3 Tage", "Mai 2026"],
          ["M5", "Recht, Haushalt und Personal für Führungskräfte", "3 Tage", "September 2026"],
          ["M6", "Gesundheit, Resilienz und Abschluss", "3 Tage", "Januar 2027"],
        ],
        notes: "M4 wird gemeinsam mit Referat 22 gestaltet und greift den KI-Leitfaden des Ministeriums auf, der derzeit abgestimmt wird.",
      },
      {
        t: "twocol",
        title: "Wie gelernt wird",
        left: {
          heading: "In den Modulen",
          bullets: ["Kurzimpulse statt Vorträge", "Fälle aus der eigenen Behörde", "Rollenspiele mit Feedback", "Gastbeiträge erfahrener Führungskräfte"],
        },
        right: {
          heading: "Zwischen den Modulen",
          bullets: ["Peer-Coaching in Gruppen zu viert", "Hospitation in einer anderen Behörde", "Praxisprojekt mit Auftrag der eigenen Behörde", "Mentoring durch eine Führungskraft"],
        },
      },
      {
        t: "chart",
        title: "Bewertung durch den Jahrgang 2023/24",
        chart: {
          type: "bar",
          categories: ["M1", "M2", "M3", "M4", "M5", "M6"],
          series: [{ name: "Durchschnittsnote (1 = sehr gut)", values: [1.6, 1.4, 1.9, 1.5, 2.2, 1.3] }],
          unit: "Note",
        },
        caption: "Rücklauf: 21 von 23 Teilnehmenden · Weiterempfehlung: 95 %",
        notes: "M5 wurde wegen zu viel Frontalunterricht kritisiert und für diesen Jahrgang neu konzipiert.",
      },
      {
        t: "table",
        title: "Aufwand und Kosten",
        header: ["Was", "Umfang"],
        rows: [
          ["Präsenztage", "18 Tage im Bildungszentrum des LPF"],
          ["Peer-Coaching und Hospitation", "etwa 6 Tage"],
          ["Praxisprojekt", "rund 40 Stunden"],
          ["Kosten je Person", "4.850 € (für Landesbehörden zentral finanziert)"],
          ["Kommunale Teilnehmende", "4.850 € Teilnahmeentgelt"],
        ],
      },
      {
        t: "table",
        title: "Zeitplan der Auswahl",
        header: ["Schritt", "Termin"],
        rows: [
          ["Nominierung durch die Behördenleitung", "bis 16.05.2025"],
          ["Auswahlgespräche", "16. bis 20.06.2025"],
          ["Zusage", "bis 04.07.2025"],
          ["Auftakt mit Modul 1", "15.09.2025"],
          ["Abschlussveranstaltung", "März 2027"],
        ],
        notes: "Die Auswahlgespräche folgen dem Leitfaden des Referats 12 für strukturierte Auswahlverfahren.",
      },
      {
        t: "bullets",
        title: "Was wir von den Vorgesetzten erwarten",
        bullets: ["Freistellung für alle Termine", "ein echtes Praxisprojekt mit Entscheidungsspielraum", "zwei Feedbackgespräche während des Programms"],
      },
      { t: "end", title: "Fragen?", lines: ["Dr. Anke Brüggemann · Referat 21 – Führungskräfteentwicklung", "Telefon 069 90009-721"] },
    ],
  },
  {
    type: "excel",
    id: "lpf-bewerbungszahlen-ausbildung-2025",
    title: "Bewerbungszahlen Ausbildung und duales Studium – Einstellungsjahrgang 2025",
    kind: "Statistik",
    fileName: "Bewerbungszahlen Ausbildung duales Studium Einstellung 2025",
    org: "lpf",
    unit: "lpf-11",
    author: "lpf-wilde",
    date: "2025-07-21",
    tags: ["zahlen"],
    keywords: ["Verwaltungsinformatik", "Bewerbungen je Platz", "Regierungssekretäranwärter", "unbesetzt", "Annahmequote"],
    summary:
      "Übersicht der Bewerbungen 2023 bis 2025 nach Ausbildungsgängen und Studiengängen mit Plätzen, Zusagen und unbesetzten Plätzen. Geeignet für Diagramme, Trendaussagen und eine Folie für die Amtsleitung.",
    sheets: [
      {
        name: "Bewerbungen",
        title: "Bewerbungen nach Ausbildungs- und Studiengängen",
        subtitle: "Einstellung zum 01.08. bzw. 01.09.2025 · Stand 18.07.2025",
        columns: [
          { header: "Ausbildungs- oder Studiengang", width: 42 },
          { header: "Plätze 2025", width: 9, fmt: "int" },
          { header: "Bewerbungen 2023", width: 11, fmt: "int" },
          { header: "Bewerbungen 2024", width: 11, fmt: "int" },
          { header: "Bewerbungen 2025", width: 11, fmt: "int" },
          { header: "Veränderung zum Vorjahr", width: 11, fmt: "pct" },
          { header: "Bewerbungen je Platz", width: 10, fmt: "dec" },
          { header: "Zusagen", width: 9, fmt: "int" },
          { header: "angenommen", width: 10, fmt: "int" },
          { header: "Annahmequote", width: 10, fmt: "pct" },
          { header: "unbesetzt", width: 9, fmt: "int" },
        ],
        rows: [
          ["Verwaltungsfachangestellte (Ausbildung)", 60, 1140, 980, 812, { f: "(E{r}-D{r})/D{r}" }, { f: "E{r}/B{r}" }, 78, 57, { f: "I{r}/H{r}" }, { f: "B{r}-I{r}" }],
          ["Regierungssekretäranwärter/innen (Laufbahngruppe 1)", 85, 1320, 1105, 934, { f: "(E{r}-D{r})/D{r}" }, { f: "E{r}/B{r}" }, 104, 79, { f: "I{r}/H{r}" }, { f: "B{r}-I{r}" }],
          ["Duales Studium Allgemeine Verwaltung (B.A.)", 140, 2210, 1890, 1655, { f: "(E{r}-D{r})/D{r}" }, { f: "E{r}/B{r}" }, 182, 136, { f: "I{r}/H{r}" }, { f: "B{r}-I{r}" }],
          ["Duales Studium Verwaltungsinformatik (B.Sc.)", 24, 63, 52, 41, { f: "(E{r}-D{r})/D{r}" }, { f: "E{r}/B{r}" }, 30, 19, { f: "I{r}/H{r}" }, { f: "B{r}-I{r}" }],
          ["Fachinformatiker/in Systemintegration", 12, 148, 131, 96, { f: "(E{r}-D{r})/D{r}" }, { f: "E{r}/B{r}" }, 16, 12, { f: "I{r}/H{r}" }, { f: "B{r}-I{r}" }],
          ["Geomatiker/in", 8, 37, 31, 22, { f: "(E{r}-D{r})/D{r}" }, { f: "E{r}/B{r}" }, 10, 6, { f: "I{r}/H{r}" }, { f: "B{r}-I{r}" }],
          ["Duales Studium Bauingenieurwesen", 10, 29, 24, 17, { f: "(E{r}-D{r})/D{r}" }, { f: "E{r}/B{r}" }, 12, 7, { f: "I{r}/H{r}" }, { f: "B{r}-I{r}" }],
          ["Duales Studium Soziale Arbeit", 10, 88, 79, 61, { f: "(E{r}-D{r})/D{r}" }, { f: "E{r}/B{r}" }, 13, 10, { f: "I{r}/H{r}" }, { f: "B{r}-I{r}" }],
          {
            total: true,
            cells: [
              "Summe",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "(E{r}-D{r})/D{r}" },
              { f: "E{r}/B{r}" },
              { f: "SUM(H{first}:H{last})" },
              { f: "SUM(I{first}:I{last})" },
              { f: "I{r}/H{r}" },
              { f: "SUM(K{first}:K{last})" },
            ],
          },
        ],
        notes: [
          "Unbesetzte Plätze werden bis 31.08.2025 im Nachrückverfahren angeboten; erfahrungsgemäß lassen sich dabei höchstens ein Drittel besetzen.",
          "Verwaltungsinformatik: gemeinsamer Studiengang mit der Hochschule für öffentliche Verwaltung Rhedenburg; Direktbewerbungen bei der Hochschule sind nicht enthalten.",
        ],
      },
    ],
  },
  {
    type: "word",
    id: "lpf-leitfaden-auswahlverfahren-assessment-center",
    title: "Leitfaden für strukturierte Auswahlverfahren und Assessment-Center",
    kind: "Leitfaden",
    fileName: "Leitfaden strukturierte Auswahlverfahren und Assessment-Center Version 2.0",
    org: "lpf",
    unit: "lpf-12",
    author: "lpf-aksoy",
    date: "2025-08-26",
    tags: ["personendaten"],
    keywords: ["Art. 33 Abs. 2 GG", "Beobachterkonferenz", "Postkorbübung", "Nachteilsausgleich", "Konkurrentenmitteilung", "Brandstätter"],
    summary:
      "Leitfaden des Recruiting-Referats zu Rechtsrahmen, Anforderungsprofil, Übungen, Bewertung, Nachteilsausgleich und Dokumentation von Auswahlverfahren. Die Anlage enthält einen ausgefüllten Musterbewertungsbogen mit erfundenen Bewerberdaten und einer unzulässigen Bemerkung – geeignet zum Anonymisieren und zum Prüfen.",
    meta: [
      ["Aktenzeichen", "12-0310/25"],
      ["Stand", "Version 2.0, gültig ab 01.09.2025"],
    ],
    subject: "Leitfaden für strukturierte Auswahlverfahren und Assessment-Center im Landesamt für Personalgewinnung und Fortbildung",
    blocks: [
      { t: "h1", text: "1. Zweck und Geltungsbereich" },
      {
        t: "p",
        text: "Dieser Leitfaden beschreibt, wie das LPF Auswahlverfahren plant, durchführt und dokumentiert. Er gilt für die Auswahl von Nachwuchskräften für Ausbildung und duales Studium, für Stellenbesetzungen im LPF und für Assessment-Center, die das LPF im Auftrag anderer Landesbehörden durchführt, etwa für Führungsfunktionen oder für das Programm „Führen im Wandel“. Ziel sind faire, rechtssichere und nachvollziehbare Entscheidungen.",
      },
      { t: "h1", text: "2. Rechtlicher Rahmen" },
      {
        t: "ul",
        items: [
          "**Art. 33 Abs. 2 GG:** Zugang zu jedem öffentlichen Amt nach Eignung, Befähigung und fachlicher Leistung (Bestenauslese); für Beamtinnen und Beamte konkretisiert in § 9 BeamtStG",
          "**Allgemeines Gleichbehandlungsgesetz (AGG):** keine Benachteiligung wegen Geschlecht, Herkunft, Religion, Behinderung, Alter oder sexueller Identität",
          "**SGB IX:** Einladung schwerbehinderter Bewerberinnen und Bewerber zum Vorstellungsgespräch (§ 165 SGB IX), Beteiligung der Schwerbehindertenvertretung",
          "**Landespersonalvertretungsgesetz (LPersVG) und Landesgleichstellungsgesetz:** Beteiligungsrechte von Personalrat und Gleichstellungsbeauftragter",
          "**DSGVO und Landesdatenschutzgesetz (LDSG):** Verarbeitung von Bewerberdaten nur, soweit für das Verfahren erforderlich",
        ],
      },
      { t: "h1", text: "3. Anforderungsprofil" },
      {
        t: "p",
        text: "Grundlage jedes Verfahrens ist ein schriftliches Anforderungsprofil, das vor der Ausschreibung festgelegt wird und danach nicht mehr geändert werden darf. Es unterscheidet zwingende und wünschenswerte Anforderungen und gewichtet die Kompetenzen. Jede Übung muss mindestens eine Kompetenz des Profils messen; keine Kompetenz darf nur in einer einzigen Übung erfasst werden.",
      },
      {
        t: "table",
        header: ["Kompetenz", "Gewichtung (Beispiel duales Studium)", "Messung in"],
        rows: [
          ["Analytisches Denken", "25 %", "Online-Test, Postkorbübung"],
          ["Kommunikationsfähigkeit", "25 %", "Interview, Rollenspiel, Gruppendiskussion"],
          ["Kundenorientierung", "20 %", "Rollenspiel, Interview"],
          ["Teamfähigkeit", "15 %", "Gruppendiskussion"],
          ["Motivation und Berufsbild", "15 %", "Interview"],
        ],
      },
      { t: "h1", text: "4. Ablauf" },
      {
        t: "ol",
        items: [
          "Anforderungsprofil festlegen, Beteiligung von Personalrat, Gleichstellungsbeauftragter und Schwerbehindertenvertretung klären",
          "Ausschreibung mit Hinweis auf das Verfahren und auf Nachteilsausgleiche",
          "Vorauswahl nach den zwingenden Anforderungen (Vier-Augen-Prinzip, Begründung jeder Absage)",
          "Online-Test (nur Ausbildung und duales Studium)",
          "Auswahltag oder Assessment-Center mit mindestens drei Übungen",
          "Beobachterkonferenz und Rangfolge",
          "Auswahlvermerk, Beteiligung der Gremien",
          "Zusagen und Absagen; bei Beamtenstellen Konkurrentenmitteilung mit einer Wartefrist von zwei Wochen vor der Ernennung",
        ],
      },
      { t: "h1", text: "5. Übungen" },
      {
        t: "table",
        header: ["Übung", "Dauer", "Erfasste Kompetenzen"],
        rows: [
          ["Strukturiertes Interview mit festen Leitfragen", "40 Minuten", "Motivation, Kommunikation, Kundenorientierung"],
          ["Postkorbübung (Priorisieren von 12 Vorgängen)", "45 Minuten", "Analytisches Denken, Organisation"],
          ["Rollenspiel Bürgergespräch oder Mitarbeitergespräch", "15 Minuten", "Kommunikation, Kundenorientierung, Konfliktfähigkeit"],
          ["Gruppendiskussion (vier bis sechs Personen)", "30 Minuten", "Teamfähigkeit, Überzeugungskraft"],
          ["Kurzpräsentation nach Vorbereitung", "10 Minuten", "Strukturierung, Ausdruck"],
        ],
      },
      { t: "h1", text: "6. Beobachtung und Bewertung" },
      {
        t: "p",
        text: "Jede Übung wird von mindestens zwei Beobachterinnen oder Beobachtern unabhängig bewertet; im Assessment-Center sind es mindestens drei. Beobachtende müssen die Schulung „Beobachten und Bewerten“ des LPF absolviert haben. Bewertet wird auf einer Skala von 1 (Anforderung nicht erfüllt) bis 5 (Anforderung deutlich übertroffen) anhand von Verhaltensankern, die vorab für jede Übung festgelegt werden.",
      },
      {
        t: "p",
        text: "Notiert wird nur beobachtbares Verhalten, keine Vermutungen über Persönlichkeit, Gesundheit, Herkunft oder private Lebensumstände. In der **Beobachterkonferenz** werden die Einzelbewertungen zusammengeführt. Weichen Bewertungen um mehr als einen Punkt voneinander ab, ist dies zu erörtern und zu dokumentieren. Typische Beurteilungsfehler (Halo-Effekt, erster Eindruck, Ähnlichkeit mit sich selbst, Milde oder Strenge) werden zu Beginn der Konferenz angesprochen.",
      },
      { t: "h1", text: "7. Nachteilsausgleich" },
      {
        t: "p",
        text: "Schwerbehinderte und gleichgestellte Bewerberinnen und Bewerber erhalten auf Antrag einen **Nachteilsausgleich**, etwa eine Verlängerung der Bearbeitungszeit um bis zu 25 %, barrierefreie Räume, Pausen oder technische Hilfsmittel. Der Nachteilsausgleich wird vor dem Verfahren mit der Schwerbehindertenvertretung abgestimmt. Er wird im Bewertungsbogen vermerkt, darf aber in die inhaltliche Bewertung nicht einfließen. Angaben zur Art der Behinderung gehören nicht in den Bewertungsbogen.",
      },
      { t: "h1", text: "8. Dokumentation und Datenschutz" },
      {
        t: "p",
        text: "Der Auswahlvermerk muss die Entscheidung so begründen, dass sie in einem gerichtlichen Eilverfahren nachvollzogen werden kann. Bewertungsbögen, Testergebnisse und Notizen werden in der Verfahrensakte aufbewahrt und sechs Monate nach Abschluss des Verfahrens gelöscht, sofern kein Rechtsstreit anhängig ist. Daten nicht berücksichtigter Personen dürfen nur mit deren Einwilligung für spätere Verfahren gespeichert werden.",
      },
      {
        t: "p",
        text: "Der Einsatz von KI-Anwendungen zur Vorauswahl, Bewertung oder Rangfolgenbildung ist unzulässig. Das entspricht dem Leitfaden der Landesverwaltung zum Einsatz generativer KI, der die Bewertung von Bewerbungen als unzulässiges Einsatzszenario einstuft.",
      },
      { t: "pagebreak" },
      { t: "h1", text: "Anlage: Muster eines ausgefüllten Bewertungsbogens" },
      {
        t: "note",
        text: "Dieses Beispiel stammt aus einem früheren Verfahren und wurde für Schulungszwecke übernommen. Es enthält absichtlich eine unzulässige Bemerkung (siehe Abschnitt 6).",
      },
      {
        t: "table",
        header: ["Feld", "Eintrag"],
        rows: [
          ["Verfahren", "Duales Studium Allgemeine Verwaltung, Kennziffer LPF-11/2025, Auswahltag 03.04.2025"],
          ["Bewerberin", "Leonie Brandstätter, geb. 14.03.2004"],
          ["Anschrift", "Weidenstraße 7, 00119 Rhedenburg"],
          ["Telefon / E-Mail", "069 90009-058 / leonie.brandstaetter@mailbox.example"],
          ["Bewerber-Nr.", "DS-2025-0417"],
          ["Schwerbehinderung", "ja, GdB 50; Nachteilsausgleich: 25 % Zeitverlängerung im Online-Test und in der Postkorbübung"],
          ["Beobachtende", "Frau Aksoy (LPF), Herr Tegeler (LPF), Frau Engin (MKV)"],
        ],
        widths: [1, 3],
      },
      {
        t: "table",
        header: ["Übung", "Beobachtung 1", "Beobachtung 2", "Beobachtung 3", "Konferenzwert"],
        rows: [
          ["Strukturiertes Interview", "4", "4", "3", "4"],
          ["Postkorbübung", "3", "3", "3", "3"],
          ["Rollenspiel Bürgergespräch", "5", "4", "4", "4"],
          ["Gruppendiskussion", "3", "2", "3", "3"],
          ["Gesamt (gewichtet)", "", "", "", "3,6"],
        ],
      },
      {
        t: "p",
        text: "**Bemerkungen der Beobachtenden:** Sehr freundlich und geduldig im Rollenspiel, hat die Anliegen des Bürgers zusammengefasst und Lösungen angeboten. In der Gruppendiskussion eher zurückhaltend, hat aber zwei sachliche Beiträge eingebracht. Wirkte insgesamt nervös, vermutlich wegen ihrer Erkrankung; bei Einstellung wären häufigere Fehlzeiten denkbar. Ergebnis: Rangplatz 38 von 212, Zusage empfohlen.",
      },
      { t: "signature", lines: ["Derya Aksoy", "Referat 12 – Stellenbesetzung und Recruiting"] },
    ],
  },
  {
    type: "excel",
    id: "lpf-evaluation-fortbildungen-digitale-kompetenzen-2025",
    title: "Bildungscontrolling 2025 – Evaluation der Kurse Digitale Kompetenzen",
    kind: "Evaluationsbericht",
    fileName: "Bildungscontrolling 2025 Evaluation Digitale Kompetenzen mit Freitextkommentaren",
    org: "lpf",
    unit: "lpf-z1",
    author: "lpf-laukoetter",
    date: "2026-01-30",
    tags: ["zahlen", "unstrukturiert"],
    keywords: ["Auslastung", "Weiterempfehlung", "Rücklaufquote", "KI – erste Schritte", "Freitext"],
    summary:
      "Auswertung der Kurse 2025 mit Plätzen, Anmeldungen, Teilnahme, Zufriedenheit und Rücklauf, dazu Teilnehmende aus Kommunen und ungeordnete Freitextkommentare. Geeignet zum Auswerten, Clustern der Kommentare und Ableiten von Empfehlungen für das Programm 2027.",
    sheets: [
      {
        name: "Kurse 2025",
        title: "Kurse des Referats 22 – Digitale Kompetenzen – im Jahr 2025",
        subtitle: "Bildungscontrolling Referat Z 1 · Zufriedenheit als Schulnote (1 = sehr gut, 6 = ungenügend) · Quelle: Teilnahmelisten und Online-Bewertungsbögen",
        columns: [
          { header: "Kurs-Nr.", width: 9 },
          { header: "Kurs", width: 38 },
          { header: "Format", width: 11 },
          { header: "Termine", width: 8, fmt: "int" },
          { header: "Plätze", width: 8, fmt: "int" },
          { header: "Anmeldungen", width: 11, fmt: "int" },
          { header: "Teilnehmende", width: 11, fmt: "int" },
          { header: "davon aus Kommunen", width: 11, fmt: "int" },
          { header: "Auslastung", width: 10, fmt: "pct" },
          { header: "Zufriedenheit (Note)", width: 11, fmt: "dec" },
          { header: "Weiterempfehlung", width: 12, fmt: "pct" },
          { header: "Bewertungsbögen", width: 11, fmt: "int" },
          { header: "Rücklaufquote", width: 10, fmt: "pct" },
        ],
        rows: [
          ["D-25-01", "E-Akte – Grundlagen", "online", 14, 280, 312, 251, 38, { f: "G{r}/E{r}" }, 1.9, 0.88, 171, { f: "L{r}/G{r}" }],
          ["D-25-02", "E-Akte für Führungskräfte", "Präsenz", 4, 48, 41, 36, 5, { f: "G{r}/E{r}" }, 2.1, 0.81, 30, { f: "L{r}/G{r}" }],
          ["D-25-03", "Barrierefreie Dokumente erstellen", "online", 5, 90, 118, 86, 22, { f: "G{r}/E{r}" }, 1.6, 0.94, 61, { f: "L{r}/G{r}" }],
          ["D-25-04", "Tabellenkalkulation für Fortgeschrittene", "Präsenz", 8, 96, 131, 92, 14, { f: "G{r}/E{r}" }, 1.5, 0.96, 80, { f: "L{r}/G{r}" }],
          ["D-25-05", "Informationssicherheit – Basisschulung", "E-Learning", 1, 400, 377, 344, 0, { f: "G{r}/E{r}" }, 2.8, 0.61, 203, { f: "L{r}/G{r}" }],
          ["D-25-06", "Datenschutz im Büroalltag", "online", 6, 150, 139, 118, 31, { f: "G{r}/E{r}" }, 2.0, 0.85, 74, { f: "L{r}/G{r}" }],
          ["D-25-07", "Videokonferenzen moderieren", "online", 4, 64, 37, 29, 6, { f: "G{r}/E{r}" }, 2.4, 0.72, 18, { f: "L{r}/G{r}" }],
          ["D-25-08", "Agiles Arbeiten in Projekten", "Präsenz", 3, 48, 52, 45, 4, { f: "G{r}/E{r}" }, 1.8, 0.9, 33, { f: "L{r}/G{r}" }],
          ["D-25-09", "KI – erste Schritte (Pilotkurs ab Oktober)", "online", 3, 60, 214, 58, 9, { f: "G{r}/E{r}" }, 1.7, 0.93, 41, { f: "L{r}/G{r}" }],
          {
            total: true,
            cells: [
              "",
              "Summe / Durchschnitt",
              "",
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "SUM(G{first}:G{last})" },
              { f: "SUM(H{first}:H{last})" },
              { f: "G{r}/E{r}" },
              { f: "ROUND(AVERAGE(J{first}:J{last}),1)" },
              { f: "AVERAGE(K{first}:K{last})" },
              { f: "SUM(L{first}:L{last})" },
              { f: "L{r}/G{r}" },
            ],
          },
        ],
        notes: [
          "D-25-05: Pflichtkurs für Neueingestellte, daher keine kommunalen Teilnehmenden; viele Abbrüche wegen technischer Probleme im Lernmodul (Kapitel 4).",
          "D-25-09: 214 Anmeldungen auf 60 Plätze – Nachfrage fließt in die Planung 2026 ein (Kurs D-01 „KI im Verwaltungsalltag – Grundlagen“).",
          "Durchschnittswerte in der Summenzeile ungewichtet.",
        ],
      },
      {
        name: "Kommunen",
        title: "Teilnehmende aus Kommunen 2025",
        columns: [
          { header: "Kommune", width: 30 },
          { header: "Teilnehmende", width: 12, fmt: "int" },
          { header: "Anteil", width: 10, fmt: "pct" },
        ],
        rows: [
          ["Stadt Falkenbrück", 44, { f: "B{r}/B$15" }],
          ["Landkreis Altmoorland", 31, { f: "B{r}/B$15" }],
          ["Stadt Rabensfurt", 18, { f: "B{r}/B$15" }],
          ["Stadt Altmoor", 11, { f: "B{r}/B$15" }],
          ["Gemeinde Brackenhain", 8, { f: "B{r}/B$15" }],
          ["Gemeinde Fennhusen", 6, { f: "B{r}/B$15" }],
          ["Gemeinde Torfkamp", 4, { f: "B{r}/B$15" }],
          ["Gemeinde Schilfwerder", 3, { f: "B{r}/B$15" }],
          ["Gemeinde Lütjenbrook", 2, { f: "B{r}/B$15" }],
          ["übrige Kommunen", 2, { f: "B{r}/B$15" }],
          { total: true, cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "B{r}/B$15" }] },
        ],
        notes: ["Summe muss der Spalte „davon aus Kommunen“ im Blatt „Kurse 2025“ entsprechen."],
      },
      {
        name: "Freitext",
        title: "Freitextkommentare aus den Bewertungsbögen (Auswahl, unbearbeitet)",
        columns: [
          { header: "Kurs-Nr.", width: 9 },
          { header: "Monat", width: 10 },
          { header: "Kommentar", width: 90 },
        ],
        rows: [
          ["D-25-01", "Februar", "Inhalt gut aber 6 Stunden am Bildschirm ist zu lang, lieber 2 halbe Tage"],
          ["D-25-01", "März", "Dozent super!! Endlich versteh ich die Ablagestruktur"],
          ["D-25-01", "Mai", "Bei uns im Landkreis ist die E-Akte ganz anders eingerichtet, Übungen passten nicht"],
          ["D-25-03", "April", "sehr praxisnah. Checkliste zum Ausdrucken wäre toll"],
          ["D-25-04", "Juni", "Raum viel zu warm, Beamer flackert. Sonst top, gerne Aufbaukurs Pivot"],
          ["D-25-04", "September", "zu schnell für mich, hab bei den SVERWEIS-Aufgaben den Anschluss verloren"],
          ["D-25-05", "laufend", "Kapitel 4 hängt sich auf, musste 3x neu anfangen!!! Zertifikat kam nicht"],
          ["D-25-05", "laufend", "Pflichtkurs ok, aber Quiz am Ende hat Fragen zu Themen die gar nicht drankamen"],
          ["D-25-06", "Juli", "Mehr Beispiele aus dem Bürgeramt bitte, nicht nur Personalakten"],
          ["D-25-07", "März", "Technik hat am Anfang nicht funktioniert (kein Ton), 20 min verloren"],
          ["D-25-07", "Oktober", "warum ist ein Kurs über Videokonferenzen nur online? Präsenz wäre besser zum Üben"],
          ["D-25-08", "November", "Gute Methoden, aber in unserer Behörde dürfen wir so nicht arbeiten…"],
          ["D-25-09", "Oktober", "Endlich ein KI-Kurs! Mehr davon. Datenschutzteil war aber zu kurz"],
          ["D-25-09", "November", "Kollegin aus Rabensfurt hatte keinen Zugang zum Pilot-Tool, konnte nur zuschauen"],
          ["D-25-09", "Dezember", "Bitte Kurs auch für Kommunen öffnen, wir hatten Glück mit Nachrückplatz"],
        ],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "lpf-ausbildungsmesse-zukunft-rhedenburg-2026",
    title: "Auftritt auf der Ausbildungs- und Studienmesse „Zukunft Rhedenburg“ 2026",
    kind: "Präsentation",
    fileName: "Konzept Messeauftritt Zukunft Rhedenburg 2026",
    org: "lpf",
    unit: "lpf-13",
    author: "lpf-sievers",
    date: "2026-01-12",
    tags: ["widersprueche"],
    keywords: ["Zukunft Rhedenburg", "Verwaltung kann digital", "Standmiete", "13.900 €", "Bewerbungs-Check"],
    summary:
      "Konzept für den Messestand des Landesamts: Ziele, Zielgruppen, Standaufbau, Personaleinsatz, Kosten und Erfolgsmessung. Eingebauter Widerspruch: Die Kostenpositionen ergeben 15.000 €, die Folie nennt als Summe 13.900 € – bei einem Budget von 14.000 €.",
    slides: [
      { t: "title", title: "Messeauftritt „Zukunft Rhedenburg“", subtitle: "Ausbildungs- und Studienmesse am 27. und 28. Februar 2026 · Konzept Referat 13" },
      {
        t: "bullets",
        title: "Ziele",
        bullets: [
          "Mindestens 400 Gespräche am Stand (2025: 365)",
          "Mehr Bewerbungen für das duale Studium Verwaltungsinformatik – 2025 nur 41 Bewerbungen auf 24 Plätze",
          "Landesverwaltung als modernen, sicheren und digitalen Arbeitgeber zeigen",
          "Kontakte für den Bewerbungs-Check im März sammeln",
        ],
        notes: "Quelle der 41 Bewerbungen: Statistik Referat 11, Juli 2025.",
      },
      {
        t: "chart",
        title: "Messen 2024 und 2025 im Vergleich",
        chart: {
          type: "bar",
          categories: ["Gespräche am Stand", "Kontaktdaten hinterlassen", "Bewerbungen danach"],
          series: [
            { name: "2024", values: [410, 132, 38] },
            { name: "2025", values: [365, 118, 29] },
          ],
          unit: "Anzahl",
        },
        caption: "Bewerbungen danach: Bewerbungen mit Angabe „Messe“ im Bewerbungsformular",
      },
      {
        t: "twocol",
        title: "Zielgruppen und Botschaften",
        left: {
          heading: "Schülerinnen und Schüler",
          bullets: ["„Verwaltung kann digital“", "Bezahlung schon im Studium", "sicherer Arbeitsplatz nach dem Abschluss", "Ausbildung in der eigenen Region"],
        },
        right: {
          heading: "Eltern und Lehrkräfte",
          bullets: ["Übernahmegarantie nach dem Studium", "Vereinbarkeit von Familie und Beruf", "Aufstiegsmöglichkeiten", "Informationsabend im März"],
        },
      },
      {
        t: "table",
        title: "Das bieten wir am Stand",
        header: ["Element", "Wer"],
        rows: [
          ["Studierende erzählen aus dem Alltag", "Studierende Verwaltungsinformatik (Anfrage läuft)"],
          ["Bewerbungs-Check in 10 Minuten", "Referat 12"],
          ["Quiz „Wie digital ist dein Rathaus?“", "Referat 13"],
          ["Schnuppervorlesung auf der Bühne", "Hochschule, Samstag 11 Uhr"],
        ],
      },
      {
        t: "table",
        title: "Kosten",
        header: ["Position", "Betrag"],
        rows: [
          ["Standmiete (18 m², Ecke)", "3.900 €"],
          ["Messewand und Möbel (Miete)", "6.800 €"],
          ["Werbemittel und Quizpreise", "1.200 €"],
          ["Social-Media-Anzeigen vor der Messe", "2.500 €"],
          ["Verpflegung und Fahrtkosten", "600 €"],
          ["Summe", "13.900 €"],
        ],
        notes: "Budget Personalmarketing für Messen 2026: 14.000 €. Wir liegen also knapp im Rahmen.",
      },
      {
        t: "bullets",
        title: "Woran wir den Erfolg messen",
        bullets: ["Gespräche am Stand (Strichliste)", "Bewerbungen mit Angabe „Messe“ bis 30.04.2026", "Kosten je Bewerbung – Ziel: unter 300 €"],
      },
      { t: "end", title: "Danke!", lines: ["Malte Sievers · Referat 13 – Personalmarketing", "Telefon 069 90009-713"] },
    ],
  },
  {
    type: "excel",
    id: "lpf-teilnehmendenliste-v07-verwaltungsverfahrensrecht-2026",
    title: "Teilnehmendenliste Seminar V-07 „Verwaltungsverfahrensrecht kompakt“ am 19./20.05.2026",
    kind: "Teilnehmendenliste",
    fileName: "Teilnehmendenliste V-07 Verwaltungsverfahrensrecht 2026-05-19 Stand 2026-04-22",
    org: "lpf",
    unit: "lpf-23",
    author: "lpf-baumgart",
    date: "2026-04-22",
    tags: ["personendaten"],
    keywords: ["V-07", "Warteliste 1", "Merkzeichen G", "Ersatzmeldung", "Teilnahmeentgelt"],
    summary:
      "Anmeldeliste eines zweitägigen Seminars mit 31 erfundenen Personen aus Landes- und Kommunalverwaltung: Kontaktdaten, Status, Warteliste, Entgelte und Hinweise mit Gesundheitsangaben. Geeignet zum Anonymisieren, zum Ermitteln der Nachrückenden und zum Prüfen der Entgeltberechnung.",
    sheets: [
      {
        name: "Anmeldungen",
        title: "V-07 Verwaltungsverfahrensrecht kompakt – Bescheide rechtssicher formulieren",
        subtitle: "19. und 20.05.2026 · Bildungszentrum, Raum 1.12 · Dozentin: Dr. Kathrin Melchers · 20 Plätze · Entgelt Kommunen 110 € je Tag",
        columns: [
          { header: "Nr.", width: 5, fmt: "int" },
          { header: "Name", width: 16 },
          { header: "Vorname", width: 12 },
          { header: "Dienststelle", width: 44 },
          { header: "Ebene", width: 10 },
          { header: "E-Mail", width: 40 },
          { header: "Telefon", width: 15 },
          { header: "Anmeldung am", width: 12, fmt: "date" },
          { header: "Status", width: 16 },
          { header: "Entgelt", width: 9, fmt: "eur0" },
          { header: "Platz", width: 6, fmt: "int" },
          { header: "Hinweise", width: 46 },
        ],
        rows: [
          [1, "Lüdtke", "Hannes", "Landesamt für Umwelt und Naturschutz, Immissionsschutz", "Land", "h.luedtke@lun.landesverwaltung.example", "069 90009-041", { date: "2026-03-02" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [2, "Schwarzer", "Petra", "Landesamt für Soziales und Versorgung, Schwerbehindertenrecht", "Land", "p.schwarzer@lsv.landesverwaltung.example", "069 90009-052", { date: "2026-03-02" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "trägt Hörgerät, bitte Platz in der ersten Reihe"],
          [3, "Haddad", "Rami", "Stadt Falkenbrück, Amt 50 – Sozialamt (Wohngeld)", "Kommune", "rami.haddad@falkenbrueck.example", "069 90009-507", { date: "2026-03-03" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [4, "Aydın", "Selin", "Stadt Falkenbrück, Amt 21 – Stadtkasse und Steuern", "Kommune", "selin.aydin@falkenbrueck.example", "069 90009-215", { date: "2026-03-03" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "vegetarisch"],
          [5, "Yilmaz", "Deniz", "Finanzamt Rhedenburg-Mitte, Rechtsbehelfsstelle", "Land", "d.yilmaz@fa-rhedenburg-mitte.landesverwaltung.example", "069 90009-063", { date: "2026-03-04" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [6, "Behrens", "Julia", "Landkreis Altmoorland, Kommunalaufsicht und Recht", "Kommune", "julia.behrens@altmoorland.example", "040 66969-142", { date: "2026-03-05" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [7, "Pohlmann", "Sandra", "Landkreis Altmoorland, Straßenverkehrs- und Zulassungsbehörde", "Kommune", "sandra.pohlmann@altmoorland.example", "040 66969-263", { date: "2026-03-05" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "laktosefrei"],
          [8, "Wendland", "Marius", "Landesbetrieb Bau und Liegenschaften, Vergabestelle", "Land", "m.wendland@lbl.landesverwaltung.example", "069 90009-074", { date: "2026-03-06" }, "abgesagt 20.04.", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "dienstliche Gründe"],
          [9, "Engin", "Aylin", "Ministerium für Kommunales und Verwaltungsentwicklung, Referat Z 3", "Land", "aylin.engin@mkv.landesverwaltung.example", "069 90009-970", { date: "2026-03-06" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [10, "Krull", "Lisa", "Gemeinde Brackenhain, Ordnungsamt", "Kommune", "lisa.krull@brackenhain.example", "040 66969-640", { date: "2026-03-09" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [11, "Rösner", "Frank", "Landesamt für Geoinformation, Vermessung", "Land", "f.roesner@lgi.landesverwaltung.example", "069 90009-085", { date: "2026-03-09" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "Rollstuhl – barrierefreier Raum und Tisch erforderlich"],
          [12, "Weber", "Sabine", "Stadt Rabensfurt, Ordnung und Verkehr", "Kommune", "sabine.weber@rabensfurt.example", "040 66969-437", { date: "2026-03-10" }, "abgesagt 22.04.", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "krankgeschrieben nach Bandscheiben-OP; Ersatz gemeldet (Nr. 31)"],
          [13, "Claasen", "Inga", "Gemeinde Torfkamp, Hauptamt", "Kommune", "i.claasen@torfkamp.example", "040 66969-711", { date: "2026-03-11" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [14, "Brodersen", "Nils", "Stadt Altmoor, Bürgerdienste", "Kommune", "n.brodersen@stadt-altmoor.example", "040 66969-722", { date: "2026-03-11" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "vegetarisch"],
          [15, "Sobczak", "Marta", "Polizeiinspektion Altmoor, Verwaltung", "Land", "m.sobczak@polizei.landesverwaltung.example", "069 90009-096", { date: "2026-03-12" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "vegan"],
          [16, "Tegeler", "Bernd", "Landesamt für Personalgewinnung und Fortbildung, Referat Z 2", "Land", "bernd.tegeler@lpf.landesverwaltung.example", "069 90009-760", { date: "2026-03-12" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [17, "Grünewald", "Svenja", "Stadt Falkenbrück, Amt 32 – Ordnungsamt", "Kommune", "svenja.gruenewald@falkenbrueck.example", "069 90009-326", { date: "2026-03-13" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [18, "Ahmeti", "Driton", "Landkreis Altmoorland, Ausländerbehörde", "Kommune", "d.ahmeti@altmoorland.example", "040 66969-279", { date: "2026-03-16" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "Halal-Verpflegung"],
          [19, "Fuchs", "Christiane", "Landesamt für Soziales und Versorgung, Elterngeldstelle", "Land", "c.fuchs@lsv.landesverwaltung.example", "069 90009-054", { date: "2026-03-17" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "schwanger (7. Monat) – Stuhl mit Rückenlehne, Pausen"],
          [20, "Meier-Lohse", "Torben", "Finanzamt Rhedenburg-Mitte, Vollstreckungsstelle", "Land", "t.meier-lohse@fa-rhedenburg-mitte.landesverwaltung.example", "069 90009-065", { date: "2026-03-18" }, "bestätigt", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [21, "Bartels", "Anke", "Gemeinde Brackenhain, Hauptamt (Personal, Sitzungsdienst)", "Kommune", "anke.bartels@brackenhain.example", "040 66969-612", { date: "2026-03-19" }, "Warteliste 1", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [22, "Oltmanns", "Gesa", "Gemeinde Fennhusen, Ordnungsamt", "Kommune", "g.oltmanns@fennhusen.example", "040 66969-741", { date: "2026-03-20" }, "Warteliste 2", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "Schwerbehindertenausweis, Merkzeichen G – Parkplatz nahe Eingang"],
          [23, "Hinz", "Katrin", "Gemeinde Schilfwerder, Hauptamt", "Kommune", "k.hinz@schilfwerder.example", "040 66969-733", { date: "2026-03-23" }, "Warteliste 3", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [24, "Strothmann", "Jan", "Landesamt für Umwelt und Naturschutz, Wasserrecht", "Land", "j.strothmann@lun.landesverwaltung.example", "069 90009-043", { date: "2026-03-24" }, "Warteliste 4", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [25, "Nikolić", "Ana", "Stadt Falkenbrück, Amt 51 – Allgemeiner Sozialer Dienst", "Kommune", "ana.nikolic@falkenbrueck.example", "069 90009-519", { date: "2026-03-26" }, "Warteliste 5", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "nur Tag 1 möglich (Teilzeit)"],
          [26, "Rehse", "Ole", "Landkreis Altmoorland, Jugendamt", "Kommune", "o.rehse@altmoorland.example", "040 66969-238", { date: "2026-03-30" }, "Warteliste 6", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [27, "Demirci", "Elif", "Finanzamt Rhedenburg-Mitte, Grunderwerbsteuer", "Land", "e.demirci@fa-rhedenburg-mitte.landesverwaltung.example", "069 90009-067", { date: "2026-04-01" }, "Warteliste 7", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [28, "Paulat", "Heike", "Gemeinde Lütjenbrook, Hauptamt", "Kommune", "h.paulat@luetjenbrook.example", "040 66969-745", { date: "2026-04-07" }, "Warteliste 8", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [29, "Wiechmann", "Lars", "Stadt Rabensfurt, Bürgerbüro", "Kommune", "lars.wiechmann@rabensfurt.example", "040 66969-434", { date: "2026-04-09" }, "Warteliste 9", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [30, "Szymanski", "Ewa", "Landesamt für Geoinformation, Grundstückswertermittlung", "Land", "e.szymanski@lgi.landesverwaltung.example", "069 90009-087", { date: "2026-04-14" }, "Warteliste 10", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, ""],
          [31, "Pawlak", "Marek", "Stadt Rabensfurt, Ordnung und Verkehr", "Kommune", "marek.pawlak@rabensfurt.example", "040 66969-438", { date: "2026-04-22" }, "Warteliste 11", { f: 'IF(E{r}="Kommune",IF(I{r}="bestätigt",220,0),0)' }, { f: 'IF(I{r}="bestätigt",1,0)' }, "Ersatzmeldung für Frau Weber (Nr. 12)"],
          { total: true, cells: [null, "Summe", "", "", "", "", "", null, "", { f: "SUM(J{first}:J{last})" }, { f: "SUM(K{first}:K{last})" }, ""] },
        ],
        notes: [
          "Teilnahmeentgelt nur für kommunale Teilnehmende mit bestätigtem Platz; Rechnung nach Kursende an die Dienststelle.",
          "Absagen bis 14 Tage vor Beginn sind kostenfrei.",
          "Liste nur für die Seminarorganisation und die Dozentin – nicht weitergeben.",
        ],
      },
      {
        name: "Übersicht",
        title: "Belegung V-07 am 19./20.05.2026",
        columns: [
          { header: "Position", width: 46 },
          { header: "Wert", width: 12, fmt: "int" },
        ],
        rows: [
          ["Plätze", 20],
          ["Belegte Plätze (Status „bestätigt“)", { f: "Anmeldungen!K36" }],
          ["Freie Plätze", { f: "B5-B6" }],
          ["Anmeldungen insgesamt", { f: "COUNTA(Anmeldungen!B5:B35)" }],
          ["Absagen", 2],
          ["Warteliste", 11],
          { total: true, cells: ["Teilnahmeentgelte Kommunen", { f: "Anmeldungen!J36", fmt: "eur0" }] },
        ],
        notes: ["Nachrücken von der Warteliste in der Reihenfolge der Anmeldung – Entscheidung Referatsleitung erbeten."],
      },
    ],
  },
  {
    type: "word",
    id: "lpf-fortbildungsprogramm-2027-auszug",
    title: "Fortbildungsprogramm 2027 – Auszug: Führung, Digitale Kompetenzen, Verwaltung und Recht",
    kind: "Fortbildungsprogramm (Auszug)",
    fileName: "Fortbildungsprogramm 2027 Auszug Abteilung 2 Fortbildung",
    org: "lpf",
    unit: "lpf-a2",
    author: "lpf-kortmann",
    date: "2026-09-11",
    tags: [],
    keywords: ["Fortbildungsprogramm 2027", "Teilnahmeentgelt", "Warteliste", "Fortbildungsportal", "V-07", "D-10"],
    summary:
      "Langer Auszug aus dem Jahresprogramm mit Vorwort, Anmelde- und Entgeltregeln, Programmübersicht und ausführlichen Kursbeschreibungen. Geeignet zum Zusammenfassen für Kommunen, für eine Mail an Fortbildungsbeauftragte, für Leichte Sprache und zum Abgleich mit Planung und Evaluation.",
    meta: [
      ["Stand", "11.09.2026"],
      ["Gültig", "01.01. bis 31.12.2027"],
    ],
    subject: "Fortbildungsprogramm 2027 der Landesverwaltung – Angebot der Abteilung 2 (Auszug)",
    blocks: [
      { t: "h1", text: "Vorwort" },
      {
        t: "p",
        text: "Liebe Kolleginnen und Kollegen in der Landesverwaltung und in den Kommunen,",
      },
      {
        t: "p",
        text: "im Jahr 2025 haben rund 9.400 Beschäftigte an 610 Veranstaltungen des Landesamts teilgenommen, davon 1.380 aus Kommunen. Nie war die Nachfrage so groß – vor allem bei Kursen zu Künstlicher Intelligenz, zur E-Akte und zum Verwaltungsrecht für Quereinsteigende. Für viele Kurse gab es lange Wartelisten. Wir haben daraus gelernt: Das Programm 2027 bietet deutlich mehr Termine in den gefragten Kursen, neue Formate für hybride Gremiensitzungen und klare Regeln für das Nachrücken.",
      },
      {
        t: "p",
        text: "Unser Anspruch bleibt: praxisnah, verständlich und offen für alle Ebenen der Verwaltung. Gerade die Zusammenarbeit von Land und Kommunen in unseren Seminaren ist ein Gewinn – im Seminarraum lernt man voneinander, wie es auf der anderen Seite des Aktenzeichens aussieht.",
      },
      { t: "signature", lines: ["Gabriele Morawietz", "Präsidentin des Landesamts für Personalgewinnung und Fortbildung"] },
      { t: "h1", text: "Allgemeine Hinweise" },
      { t: "h2", text: "Anmeldung" },
      {
        t: "p",
        text: "Die Anmeldung erfolgt ausschließlich über das Fortbildungsportal (https://fortbildung.lpf.landesverwaltung.example). Sie setzt die Zustimmung der oder des Vorgesetzten voraus, die im Portal digital eingeholt wird. Anmeldeschluss ist vier Wochen vor Kursbeginn. Spätestens drei Wochen vor Beginn erhalten Sie eine Bestätigung oder die Mitteilung, dass Sie auf der Warteliste stehen.",
      },
      {
        t: "p",
        text: "Die Plätze werden in der Reihenfolge des Eingangs vergeben. Für Beschäftigte der Kommunen sind in jedem Kurs bis zu 30 % der Plätze vorgesehen; nicht genutzte Plätze werden drei Wochen vor Beginn für alle freigegeben.",
      },
      { t: "h2", text: "Warteliste und Ersatzteilnehmende" },
      {
        t: "p",
        text: "Wird ein Platz frei, rücken Personen von der **Warteliste** in der Reihenfolge ihrer Anmeldung nach. Eine Dienststelle kann für eine abgesagte Person nur dann eine Ersatzperson benennen, wenn für den Kurs keine Warteliste besteht. Nachrückende werden einzeln per E-Mail benachrichtigt und müssen innerhalb von drei Arbeitstagen zusagen. Bei großer Nachfrage bieten wir Zusatztermine an; Personen auf der Warteliste werden dafür bevorzugt berücksichtigt.",
      },
      { t: "h2", text: "Teilnahmeentgelte" },
      {
        t: "table",
        header: ["Teilnehmende", "Entgelt 2027", "Hinweis"],
        rows: [
          ["Beschäftigte des Landes", "kostenfrei", "zentral aus dem Haushalt des LPF finanziert"],
          ["Beschäftigte der Kommunen – Präsenz- und Onlinekurse", "120 € je Kurstag", "2026: 110 € je Kurstag"],
          ["Beschäftigte der Kommunen – E-Learning", "35 € je Lizenz", "unverändert"],
          ["Führungskräfteprogramm „Führen im Wandel“ (F-05)", "4.950 €", "für Kommunen; Landesbehörden zentral finanziert"],
        ],
      },
      {
        t: "p",
        text: "Das **Teilnahmeentgelt** wird nach Kursende der Dienststelle in Rechnung gestellt. Absagen bis 14 Tage vor Kursbeginn sind kostenfrei. Bei späteren Absagen werden 50 %, bei Nichterscheinen ohne Absage 100 % des Entgelts berechnet. Bei Erkrankung genügt eine kurze Mitteilung der Dienststelle; Angaben zur Art der Erkrankung sind nicht erforderlich und sollen nicht gemacht werden.",
      },
      { t: "h2", text: "Barrierefreiheit" },
      {
        t: "p",
        text: "Das Bildungszentrum ist barrierefrei. Bitte teilen Sie besondere Bedarfe bei der Anmeldung mit, etwa einen Platz mit Induktionsschleife, einen höhenverstellbaren Tisch oder einen Parkplatz am Haupteingang. Gebärdensprachdolmetschung organisieren wir, wenn der Bedarf spätestens vier Wochen vor Kursbeginn bekannt ist. Onlinekurse werden mit Live-Untertiteln angeboten.",
      },
      { t: "h2", text: "Datenschutz" },
      {
        t: "p",
        text: "Wir verarbeiten Ihre Daten zur Organisation der Kurse, zur Abrechnung und zur Ausstellung von Teilnahmebescheinigungen. Teilnehmendenlisten erhalten nur die Seminarorganisation und die Dozierenden. Angaben zu besonderen Bedarfen werden nur an die Stellen weitergegeben, die sie für die Organisation benötigen, und ein Jahr nach Kursende gelöscht. Die Bewertungsbögen sind anonym.",
      },
      { t: "h2", text: "Veranstaltungsort" },
      {
        t: "p",
        text: "Soweit nicht anders angegeben, finden Präsenzkurse im Bildungszentrum des LPF statt: Am Exerzierplatz 21, 00119 Rhedenburg. Das Bildungszentrum ist vom Hauptbahnhof in zehn Minuten mit der Straßenbahn erreichbar (Haltestelle Exerzierplatz). Parkplätze sind knapp; zwei Behindertenparkplätze befinden sich direkt am Haupteingang.",
      },
      { t: "pagebreak" },
      { t: "h1", text: "Programmübersicht" },
      {
        t: "table",
        header: ["Nr.", "Kurs", "Format", "Dauer", "Termine"],
        rows: [
          ["F-01", "Neu in der Führungsrolle", "Präsenz", "3 Tage", "2"],
          ["F-02", "Führen auf Distanz", "online", "2 halbe Tage", "3"],
          ["F-03", "Konflikte im Team lösen", "Präsenz", "2 Tage", "3"],
          ["F-04", "Gesund führen", "Präsenz", "1 Tag", "2"],
          ["F-05", "Führen im Wandel – Jahrgang 2027/28", "Programm", "18 Monate", "Start 09/2027"],
          ["F-06", "Veränderungsprozesse gestalten", "Präsenz", "2 Tage", "2"],
          ["D-01", "KI im Verwaltungsalltag – Grundlagen", "online", "1 Tag", "16"],
          ["D-02", "Prompting für Fachaufgaben", "Präsenz", "1 Tag", "10"],
          ["D-03", "Datenschutz und KI", "online", "1 Tag", "6"],
          ["D-04", "KI und Verantwortung für Führungskräfte", "Präsenz", "1 Tag", "4"],
          ["D-05", "E-Akte im Alltag", "online", "1 Tag", "8"],
          ["D-06", "Barrierefreie Dokumente erstellen", "online", "1 Tag", "6"],
          ["D-07", "Tabellenkalkulation für Fortgeschrittene", "Präsenz", "2 Tage", "8"],
          ["D-08", "Informationssicherheit – Basisschulung", "E-Learning", "90 Minuten", "laufend"],
          ["D-09", "Prozesse analysieren und digitalisieren", "Präsenz", "2 Tage", "3"],
          ["D-10", "Hybride Sitzungen vorbereiten und leiten", "Präsenz", "1 Tag", "4"],
          ["V-01", "Verwaltungsrecht für Quereinsteigende", "Präsenz", "3 Tage", "4"],
          ["V-03", "Vergaberecht kompakt (UVgO, VgV)", "Präsenz", "2 Tage", "3"],
          ["V-05", "Zuwendungsrecht in der Praxis", "Präsenz", "1 Tag", "3"],
          ["V-07", "Verwaltungsverfahrensrecht kompakt – Bescheide rechtssicher formulieren", "Präsenz", "2 Tage", "4"],
          ["V-09", "Kommunales Haushaltsrecht für Einsteigerinnen und Einsteiger", "Präsenz", "2 Tage", "2"],
          ["V-11", "Bürgerorientiert schreiben und Leichte Sprache", "online", "1 Tag", "5"],
          ["V-13", "Datenschutz im Büroalltag", "online", "1 Tag", "6"],
          ["V-15", "Widerspruchs- und Klageverfahren", "Präsenz", "1 Tag", "2"],
        ],
        widths: [1, 6, 2, 2, 2],
      },
      { t: "pagebreak" },
      { t: "h1", text: "Kursbeschreibungen (Auszug)" },
      { t: "h2", text: "Führung" },
      { t: "h3", text: "F-01 Neu in der Führungsrolle" },
      {
        t: "p",
        text: "Der Wechsel von der Kollegin zur Vorgesetzten oder vom Kollegen zum Vorgesetzten ist eine der schwierigsten Stationen im Berufsleben. Der Kurs hilft, die neue Rolle anzunehmen, Erwartungen zu klären und die ersten hundert Tage zu planen.",
      },
      {
        t: "ul",
        items: [
          "Rollenwechsel: Erwartungen von oben, unten und von der Seite",
          "Führungsinstrumente: Zielvereinbarung, Delegation, Mitarbeitergespräch",
          "Schwierige Situationen: Kritik, Leistungsprobleme, ehemalige Kolleginnen und Kollegen",
          "Rechtlicher Rahmen: Fürsorgepflicht, Beteiligung des Personalrats",
        ],
      },
      { t: "p", text: "Zielgruppe: Führungskräfte im ersten Jahr · Dauer: 3 Tage · Termine: 19.–21.01.2027 und 07.–09.09.2027 · Leitung: Referat 21" },
      { t: "h3", text: "F-05 Führen im Wandel – Jahrgang 2027/28" },
      {
        t: "p",
        text: "Das 18-monatige Programm bereitet Nachwuchsführungskräfte mit sechs Präsenzmodulen, Peer-Coaching, Hospitation und einem Praxisprojekt auf Führungsaufgaben vor. Erstmals stehen vier Plätze für kommunale Beschäftigte zur Verfügung (bisher zwei). Die Nominierung erfolgt durch die Behördenleitung bis zum 31.03.2027; die Auswahl folgt dem Leitfaden für strukturierte Auswahlverfahren.",
      },
      { t: "p", text: "Zielgruppe: Beschäftigte mit Führungspotenzial ab A 12 bzw. EG 12 · Dauer: September 2027 bis März 2029 · Leitung: Referat 21" },
      { t: "h2", text: "Digitale Kompetenzen" },
      { t: "h3", text: "D-01 KI im Verwaltungsalltag – Grundlagen" },
      {
        t: "p",
        text: "Der Kurs ist Voraussetzung für die Nutzung freigegebener KI-Anwendungen in der Landesverwaltung. Er vermittelt, wie generative KI funktioniert, wofür sie sich eignet und wo ihre Grenzen liegen. Die Teilnehmenden üben an Beispielen aus dem Verwaltungsalltag und lernen die Regeln des KI-Leitfadens kennen.",
      },
      {
        t: "ul",
        items: [
          "Was KI kann und was nicht: Texte entwerfen, zusammenfassen, umformulieren",
          "Ampelmodell und Schutzbedarf: Welche Daten darf ich eingeben?",
          "Ergebnisse prüfen: erfundene Fundstellen, Rechenfehler, Verzerrungen",
          "Kennzeichnung und Verantwortung",
        ],
      },
      { t: "p", text: "Zielgruppe: alle Beschäftigten, auch aus Kommunen · Dauer: 1 Tag online · Termine: 16 Termine, monatlich mindestens einer · Leitung: Referat 22" },
      { t: "h3", text: "D-02 Prompting für Fachaufgaben" },
      {
        t: "p",
        text: "Aufbaukurs für Beschäftigte, die bereits mit einem KI-Assistenten arbeiten. An eigenen, vorab anonymisierten Fällen werden Arbeitsanweisungen entwickelt, verbessert und als Vorlagen für das Team gesichert.",
      },
      { t: "p", text: "Zielgruppe: Sachbearbeitung mit KI-Zugang, Abschluss D-01 erforderlich · Dauer: 1 Tag · Termine: 10 · Leitung: Referat 22" },
      { t: "h3", text: "D-10 Hybride Sitzungen vorbereiten und leiten (neu)" },
      {
        t: "p",
        text: "Seit dem 01.01.2026 können Vertretungen und Ausschüsse nach § 35a der Kommunalverfassung hybride Sitzungen durchführen. Der Kurs richtet sich an Beschäftigte im Sitzungsdienst und an Sitzungsleitungen. Er verbindet Recht, Technik und Moderation.",
      },
      {
        t: "ul",
        items: [
          "Rechtliche Vorgaben: Hauptsatzung, Beschlussfähigkeit, Störungen, geheime Wahlen, Niederschrift",
          "Technik im Sitzungssaal: Kamera, Ton, Übertragung für die Öffentlichkeit",
          "Moderation: Wortmeldungen, Abstimmungen, Umgang mit Ausfällen",
          "Übung im Sitzungssaal des Bildungszentrums mit zugeschalteten Teilnehmenden",
        ],
      },
      { t: "p", text: "Zielgruppe: Sitzungsdienst, Ratsbüros, Sitzungsleitungen · Dauer: 1 Tag · Termine: 23.02., 13.04., 08.06. und 12.10.2027 · Leitung: Referat 22 mit Referat 23" },
      { t: "h2", text: "Verwaltung und Recht" },
      { t: "h3", text: "V-01 Verwaltungsrecht für Quereinsteigende" },
      {
        t: "p",
        text: "Wer aus einem anderen Beruf in die Verwaltung wechselt, muss schnell verstehen, wie Verwaltungshandeln rechtlich funktioniert. Der Kurs vermittelt die Grundlagen in drei kompakten Tagen – ohne juristisches Vorwissen, mit vielen Fällen aus der Praxis.",
      },
      {
        t: "ul",
        items: [
          "Aufbau der Verwaltung in Bund, Land und Kommunen",
          "Grundsätze: Gesetzmäßigkeit, Verhältnismäßigkeit, Ermessen",
          "Der Verwaltungsakt und das Verwaltungsverfahren nach dem VwVfG",
          "Rechtsschutz: Widerspruch und Klage",
        ],
      },
      { t: "p", text: "Zielgruppe: Beschäftigte ohne Verwaltungsausbildung, insbesondere aus dem Programm „Quereinstieg Verwaltung“ · Dauer: 3 Tage · Termine: 4 · Leitung: Referat 23" },
      { t: "h3", text: "V-05 Zuwendungsrecht in der Praxis" },
      {
        t: "p",
        text: "Für Beschäftigte, die Fördermittel beantragen oder bewilligen: Der Kurs erläutert die §§ 23 und 44 LHO, die Allgemeinen Nebenbestimmungen und typische Fehler bei Vergabe und Verwendungsnachweis. Als Beispiel dient die neue Förderrichtlinie „Digitale Kommune“, die ab 2027 gilt.",
      },
      { t: "p", text: "Zielgruppe: Förderstellen des Landes, Kämmereien und Fachämter der Kommunen · Dauer: 1 Tag · Termine: 3 · Leitung: Referat 23" },
      { t: "h3", text: "V-07 Verwaltungsverfahrensrecht kompakt – Bescheide rechtssicher formulieren" },
      {
        t: "p",
        text: "Unser meistgebuchter Rechtskurs: 2026 gab es mehr als 30 Anmeldungen je Termin, sodass wir einen Zusatztermin angeboten haben. 2027 bieten wir vier Termine an. Der Kurs führt vom Antrag bis zum bestandskräftigen Bescheid und übt das Formulieren von Tenor, Begründung und Rechtsbehelfsbelehrung.",
      },
      {
        t: "ul",
        items: [
          "Anhörung, Beteiligte, Akteneinsicht",
          "Bestimmtheit, Begründung und Ermessenserwägungen",
          "Nebenbestimmungen, Rücknahme und Widerruf",
          "Rechtsbehelfsbelehrung und Bekanntgabe, auch elektronisch",
          "Bescheide verständlich schreiben – ohne die Rechtssicherheit zu verlieren",
        ],
      },
      { t: "p", text: "Zielgruppe: Sachbearbeitung in Land und Kommunen · Dauer: 2 Tage · Termine: 16./17.02., 11./12.05., 21./22.09. und 23./24.11.2027 · Leitung: Referat 23, Dozentin Dr. Kathrin Melchers" },
      { t: "h3", text: "V-09 Kommunales Haushaltsrecht für Einsteigerinnen und Einsteiger" },
      {
        t: "p",
        text: "Der Kurs erklärt das doppische Haushaltsrecht der Kommunen nach der Kommunalverfassung und der Gemeindehaushaltsverordnung (GemHVO): Ergebnis- und Finanzhaushalt, Haushaltssatzung, Haushaltssicherungskonzept, Jahresabschluss. Aktuelle Beispiele stammen aus dem Haushaltserlass 2027 des Ministeriums für Kommunales und Verwaltungsentwicklung.",
      },
      { t: "p", text: "Zielgruppe: neue Beschäftigte in Kämmereien und Fachämtern, Mitglieder von Vertretungen auf Anfrage · Dauer: 2 Tage · Termine: 09./10.03. und 21./22.09.2027 · Leitung: Referat 23" },
      { t: "h3", text: "V-11 Bürgerorientiert schreiben und Leichte Sprache" },
      {
        t: "p",
        text: "Schreiben, das ankommt: Der Kurs zeigt, wie Briefe, Bescheide und Webtexte verständlicher werden, und führt in die Regeln der Leichten Sprache ein. Die Teilnehmenden bringen eigene Texte mit und überarbeiten sie im Kurs; auch der Einsatz von KI-Assistenten für Entwürfe wird geübt.",
      },
      { t: "p", text: "Zielgruppe: alle Beschäftigten mit Kontakt zu Bürgerinnen und Bürgern · Dauer: 1 Tag online · Termine: 5 · Leitung: Referat 23" },
      { t: "h1", text: "Ansprechpersonen" },
      {
        t: "table",
        header: ["Bereich", "Ansprechperson", "Telefon"],
        rows: [
          ["Leitung der Abteilung 2 – Fortbildung", "Dr. Susanne Kortmann", "069 90009-740"],
          ["Führungskräfteentwicklung (F-Kurse)", "Dr. Anke Brüggemann", "069 90009-721"],
          ["Digitale Kompetenzen (D-Kurse)", "Dr. Philipp Ostrowski", "069 90009-722"],
          ["Verwaltung und Recht (V-Kurse)", "Ludger Pahl", "069 90009-723"],
          ["Anmeldung, Wartelisten, Rechnungen", "Nadine Baumgart", "069 90009-741"],
        ],
      },
    ],
  },
];

export const threads: ThreadSpec[] = [
  {
    id: "lpf-kooperation-hochschule-messe-verwaltungsinformatik",
    title: "Kooperation mit der Hochschule für öffentliche Verwaltung zur Ausbildungsmesse",
    subject: "Messe „Zukunft Rhedenburg“ 27./28.02. – gemeinsamer Auftritt Verwaltungsinformatik?",
    org: "lpf",
    unit: "lpf-13",
    date: "2026-01-22",
    tags: [],
    keywords: ["Zukunft Rhedenburg", "Schnuppervorlesung", "Verwaltungsinformatik", "Direktbewerbungen", "Dienstreise"],
    summary:
      "Das Personalmarketing stimmt mit einer Professorin der Hochschule einen gemeinsamen Messeauftritt ab: Studierende am Stand, Schnuppervorlesung, Kostenteilung. Die Hochschule nennt andere Bewerberzahlen als das Landesamt – geeignet für Antwortentwürfe und eine Aufgabenliste.",
    mails: [
      {
        from: "lpf-sievers",
        to: ["ext-hollenbach"],
        cc: ["lpf-wilde"],
        date: "2026-01-14T10:20",
        body: `Sehr geehrte Frau Professorin Hollenbach,

wie telefonisch kurz angesprochen: Das LPF ist am 27. und 28. Februar wieder mit einem Stand auf der Ausbildungs- und Studienmesse „Zukunft Rhedenburg“ vertreten. Unser Sorgenkind ist der gemeinsame Studiengang Verwaltungsinformatik – 2025 hatten wir nur 41 Bewerbungen auf 24 Plätze, fünf Plätze sind am Ende unbesetzt geblieben.

Wir würden den Auftritt daher gern gemeinsam mit der Hochschule gestalten:
1. Zwei bis drei Studierende der Verwaltungsinformatik am Stand, die aus dem Studium erzählen
2. Eine kurze Schnuppervorlesung auf der Bühne (20 Minuten, Thema frei)
3. Eine gemeinsame Social-Media-Kampagne „Verwaltung kann digital“ vor der Messe – Kosten für Anzeigen ca. 2.500 €, die wir uns teilen könnten

Wäre das für Sie denkbar? Über eine Rückmeldung bis Ende nächster Woche würde ich mich freuen.

Mit freundlichen Grüßen
Malte Sievers`,
      },
      {
        from: "ext-hollenbach",
        to: ["lpf-sievers"],
        cc: ["lpf-wilde"],
        date: "2026-01-19T17:45",
        body: `Lieber Herr Sievers,

gute Idee, wir sind gern dabei – mit Einschränkungen:

- Studierende: Drei Studierende aus dem 3. Semester haben zugesagt, allerdings nur für Freitag. Samstag ist Prüfungsvorbereitung. Da es Ihre Anwärterinnen und Anwärter sind, müsste das LPF die Freistellung bzw. **Dienstreise** regeln.
- Schnuppervorlesung: Übernehme ich selbst, Samstag 11 Uhr passt. Titel: „Wie digital ist dein Rathaus?“
- Kampagne: Eine Kostenbeteiligung ist leider nicht möglich, unser Budget für Öffentlichkeitsarbeit ist für 2026 schon verplant. Wir stellen aber Roll-up und Flyer und teilen die Beiträge über unsere Kanäle.

Noch ein Hinweis zu den Zahlen: Bei uns sind 2025 zusätzlich 17 **Direktbewerbungen** für den Studiengang eingegangen (ohne Anwärterstatus, als reguläres Studium). Die Nachfrage ist also etwas höher, als Ihre 41 vermuten lassen – sie geht nur am Landesdienst vorbei. Das sollten wir am Stand offensiv ansprechen.

Herzliche Grüße
Ruth Hollenbach`,
      },
      {
        from: "lpf-sievers",
        to: ["ext-hollenbach"],
        cc: ["lpf-wilde"],
        date: "2026-01-22T09:05",
        body: `Liebe Frau Hollenbach,

vielen Dank, das ist eine große Hilfe!

- Die Anzeigen übernehmen wir dann allein.
- Frau Wilde regelt die Dienstreise für die drei Studierenden am Freitag. Bitte schicken Sie uns die Namen bis 06.02.
- Die Vorlesung am Samstag um 11 Uhr nehme ich ins Programm auf.

Die 17 Direktbewerbungen sind ein spannender Punkt – vielleicht können wir die Interessierten über einen Wechsel in den Anwärterstatus informieren. Lassen Sie uns das nach der Messe besprechen.

Viele Grüße
Malte Sievers`,
      },
    ],
  },
  {
    id: "lpf-seminar-v07-absagen-warteliste",
    title: "Absagen und Warteliste für das Seminar V-07 Verwaltungsverfahrensrecht",
    subject: "Seminar V-07 Verwaltungsverfahrensrecht am 19./20.05.2026 – Absage und Ersatzmeldung",
    org: "lpf",
    unit: "lpf-23",
    date: "2026-04-28",
    tags: ["personendaten"],
    keywords: ["V-07", "Warteliste", "Bandscheiben-OP", "Zusatztermin", "22./23.09.2026", "Merkzeichen G"],
    summary:
      "Eine Kommune meldet eine erkrankte Teilnehmerin ab und will eine Ersatzperson schicken; das Landesamt lässt stattdessen die Warteliste nachrücken und plant einen Zusatztermin. Die Benachrichtigung geht offen an mehrere Kommunen und nennt den Krankheitsgrund – geeignet für Datenschutz-, Anonymisierungs- und Antwortübungen.",
    mails: [
      {
        from: "rf-koch",
        to: ["lpf-baumgart"],
        date: "2026-04-22T08:47",
        body: `Sehr geehrte Frau Baumgart,

leider muss ich unsere Kollegin Frau Sabine Weber (Ordnung und Verkehr) vom Seminar V-07 am 19./20.05. abmelden. Frau Weber hatte letzte Woche eine Bandscheiben-OP und ist voraussichtlich bis Ende Mai krankgeschrieben.

Wir würden gern stattdessen Herrn Marek Pawlak aus derselben Abteilung schicken (marek.pawlak@rabensfurt.example, 040 66969-438). Er bearbeitet seit Januar die Sondernutzungserlaubnisse und braucht das Seminar dringend, weil wir nach dem Wechsel zum Zweckverband auch unsere Bescheidvorlagen neu aufsetzen.

Fällt für die Absage eine Gebühr an?

Mit freundlichen Grüßen
Jasmin Koch`,
      },
      {
        from: "lpf-baumgart",
        to: ["lpf-pahl"],
        date: "2026-04-22T13:05",
        attachments: ["lpf-teilnehmendenliste-v07-verwaltungsverfahrensrecht-2026"],
        body: `Hallo Herr Pahl,

kurzer Sachstand zu V-07 (Liste anbei):
- 20 Plätze, 31 Anmeldungen, davon 11 auf der Warteliste
- Absagen: Herr Wendland (Landesbetrieb Bau und Liegenschaften) am 20.04., Frau Weber (Rabensfurt) heute
- Rabensfurt möchte Herrn Pawlak als Ersatz schicken. Ich habe ihn vorerst als Nr. 11 auf die Warteliste gesetzt.

Bisher haben wir Ersatzmeldungen derselben Dienststelle immer akzeptiert, schriftlich geregelt ist das aber nirgends. Mein Vorschlag: Wir lassen Platz 1 und 2 der Warteliste nachrücken (Frau Bartels, Brackenhain, und Frau Oltmanns, Fennhusen). Die Absage aus Rabensfurt ist fristgerecht, also kostenfrei.

Weil die Warteliste danach immer noch neun Personen hat: Frau Dr. Melchers könnte am 22./23.09.2026 einen Zusatztermin übernehmen (Honorar 1.400 €, Raum 1.12 ist frei).

Viele Grüße
Nadine Baumgart`,
      },
      {
        from: "lpf-pahl",
        to: ["lpf-baumgart"],
        cc: ["lpf-laukoetter"],
        date: "2026-04-23T09:30",
        body: `Hallo Frau Baumgart,

einverstanden. Die Warteliste geht vor – sonst „vererben“ Dienststellen ihre Plätze, und die Kolleginnen aus den kleinen Gemeinden kommen nie zum Zug. Bitte Rabensfurt freundlich erklären und Herrn Pawlak im Zusatztermin einen festen Platz geben.

Den Zusatztermin am 22./23.09. genehmige ich. Herr Laukötter, bitte 1.400 € Honorar bei Titel 427 01 vormerken.

Für 2027 nehmen wir die Regel zum Nachrücken ausdrücklich in das Programm auf.

Gruß
Ludger Pahl`,
      },
      {
        from: "lpf-baumgart",
        to: ["bh-bartels", "ext-land-oltmanns", "rf-koch"],
        date: "2026-04-27T10:15",
        subject: "Seminar V-07 am 19./20.05.2026 – Nachrücken von der Warteliste",
        quote: false,
        body: `Liebe Frau Bartels, liebe Frau Oltmanns, liebe Frau Koch,

im Seminar V-07 „Verwaltungsverfahrensrecht kompakt“ am 19. und 20.05.2026 sind zwei Plätze frei geworden, weil Frau Weber aus Rabensfurt nach ihrer Operation krankgeschrieben ist und ein Kollege des Landesbetriebs Bau und Liegenschaften abgesagt hat.

**Frau Bartels und Frau Oltmanns**, Sie stehen auf Platz 1 und 2 der Warteliste und rücken nach. Bitte bestätigen Sie mir Ihre Teilnahme bis Donnerstag, 30.04.2026. Das Teilnahmeentgelt beträgt 220 € (110 € je Tag) und wird nach dem Seminar Ihrer Dienststelle in Rechnung gestellt.

**Frau Koch**, Herr Pawlak kann leider nicht direkt nachrücken, weil Personen auf der Warteliste Vorrang haben. Wir bieten aber am 22./23.09.2026 einen Zusatztermin an und haben Herrn Pawlak dort einen Platz reserviert. Die Absage von Frau Weber ist kostenfrei.

Viele Grüße
Nadine Baumgart`,
      },
      {
        from: "ext-land-oltmanns",
        to: ["lpf-baumgart"],
        date: "2026-04-28T16:52",
        body: `Hallo Frau Baumgart,

super, vielen Dank – ich komme gern und bestätige hiermit!

Wie bei der Anmeldung angegeben habe ich einen Schwerbehindertenausweis mit Merkzeichen G. Gibt es am Bildungszentrum einen Parkplatz nah am Eingang, den ich nutzen kann? Die Rechnung bitte wie immer an unsere Kämmerei.

Übrigens wusste ich gar nicht, dass Frau Weber operiert wurde – wir kennen uns vom Ordnungsamtsstammtisch. Falls Sie Kontakt haben: gute Besserung!

Viele Grüße
Gesa Oltmanns`,
      },
    ],
  },
];
