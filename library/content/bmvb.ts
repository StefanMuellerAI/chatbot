// Bundesministerium für Verwaltungsdienste und Bürgerservice (Bund)
import type { DocSpec, ThreadSpec } from "../types";

export const documents: DocSpec[] = [
  {
    type: "powerpoint",
    id: "bmvb-ki-assistenz-sachstand",
    title: "KI-Assistenzsysteme in der Bundesverwaltung – Sachstand und nächste Schritte",
    kind: "Präsentation",
    fileName: "KI-Assistenz Bundesverwaltung Sachstand 2025-10",
    org: "bmvb",
    unit: "bmvb-d4",
    author: "bmvb-hagedorn",
    date: "2025-10-02",
    tags: ["zahlen"],
    keywords: ["Pilot-Assistent", "3120", "Halluzinationen", "Betriebsmodell"],
    summary:
      "Sachstand des Referats D 4 zum Pilotbetrieb eines KI-Assistenten: Nutzungsentwicklung, Erfahrungen der Pilotbehörden, Kosten, Risiken und Vorschlag für den Regelbetrieb ab 2026.",
    slides: [
      {
        t: "title",
        title: "KI-Assistenzsysteme in der Bundesverwaltung",
        subtitle: "Sachstand und nächste Schritte – Abteilungsleitungsrunde am 7. Oktober 2025",
      },
      {
        t: "bullets",
        title: "Ausgangslage",
        bullets: [
          "Seit März 2025 Pilotbetrieb eines KI-Assistenten in vier Behörden des Geschäftsbereichs",
          {
            text: "Betrieb in einem Rechenzentrum des Bundes, keine Nutzung der Eingaben zum Training",
            sub: ["Zugelassen für Schutzbedarf „intern“", "Personenbezogene Daten nur pseudonymisiert"],
          },
          "Haushaltsmittel 2025: 1,2 Mio. € (Lizenzen, Betrieb, Begleitforschung)",
          "Auftrag der Hausleitung: Entscheidungsvorschlag zum Regelbetrieb bis Jahresende",
        ],
      },
      {
        t: "chart",
        title: "Aktive Nutzende des Pilot-Assistenten",
        chart: {
          type: "line",
          categories: ["Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep"],
          series: [{ name: "aktive Nutzende im Monat", values: [320, 610, 1180, 1940, 2410, 2650, 3120] }],
          unit: "Nutzende",
        },
        caption: "Aktive Nutzende: mindestens eine Anfrage im Monat · Quelle: Betriebsstatistik",
        notes: "Der Knick im August ist urlaubsbedingt. Im September kamen zwei weitere Abteilungen des BZBL hinzu.",
      },
      {
        t: "table",
        title: "Erfahrungen in den Pilotbehörden",
        header: ["Behörde", "Haupteinsatz", "Nutzende", "Zufriedenheit (1–5)"],
        rows: [
          ["BMVB (eigenes Haus)", "Vorlagen, Zusammenfassungen, Übersetzungen", "1.040", "4,1"],
          ["BZBL", "Vergabeunterlagen, Bieterfragen, Liegenschaftsberichte", "1.380", "3,8"],
          ["Geschäftsbereichsbehörde A", "Bürgeranfragen (Entwürfe)", "460", "3,5"],
          ["Geschäftsbereichsbehörde B", "Programmierung und Datenauswertung", "240", "4,4"],
        ],
        notes: "Behörden A und B wollen im Vortrag nicht namentlich genannt werden.",
      },
      {
        t: "twocol",
        title: "Nutzen und Risiken",
        left: {
          heading: "Nutzen",
          bullets: [
            "Zeitersparnis nach Selbstauskunft: Ø 2,3 Stunden je Woche",
            "Bessere Verständlichkeit von Bürgerschreiben",
            "Schnellere Einarbeitung in neue Themen",
          ],
        },
        right: {
          heading: "Risiken",
          bullets: [
            "Halluzinationen bei Rechtsfragen (Paragrafen erfunden)",
            "Ungleiche Nutzung: Führungskräfte nutzen kaum",
            "Abhängigkeit von einem Anbieter",
            "Unklare Kennzeichnung von KI-Texten",
          ],
        },
      },
      {
        t: "chart",
        title: "Kosten 2025 nach Art",
        chart: {
          type: "pie",
          categories: ["Lizenzen", "Betrieb Rechenzentrum", "Begleitforschung", "Schulung"],
          series: [{ name: "Tsd. €", values: [610, 340, 150, 100] }],
        },
      },
      {
        t: "bullets",
        title: "Vorschlag für den Regelbetrieb ab 2026",
        bullets: [
          "Öffnung für alle Behörden des Geschäftsbereichs mit Basisschulung als Voraussetzung",
          "Betriebsmodell: zentraler Betrieb im Rechenzentrum des Bundes, Abrechnung nach Nutzenden",
          "Zweiter Modellanbieter zur Vermeidung von Abhängigkeiten (Ausschreibung 2026)",
          "Begleitende Evaluation mit Messung der tatsächlichen Zeitersparnis",
        ],
        notes: "Haushaltsbedarf für 2026 nach erster Schätzung 3,4 Mio. € – mit Haushaltsreferat noch nicht abgestimmt!",
      },
      { t: "end", title: "Vielen Dank", lines: ["Dr. Ulrike Hagedorn · Referat D 4 – KI-Anwendungen in der Bundesverwaltung"] },
    ],
  },
  {
    type: "excel",
    id: "bmvb-personalbedarf-b3",
    title: "Personalbedarfsermittlung Referat B 3",
    kind: "Organisationsuntersuchung",
    fileName: "Personalbedarfsermittlung Referat B3 2025",
    org: "bmvb",
    unit: "bmvb-z13",
    author: "bmvb-mai",
    date: "2025-08-27",
    tags: ["zahlen"],
    keywords: ["Bearbeitungszeit", "Jahresarbeitszeit", "Verteilzeit", "Ist-Besetzung"],
    summary:
      "Analytische Personalbedarfsermittlung für das Referat Servicestandards und Nutzerforschung: Fallzahlen und Bearbeitungszeiten je Aufgabe, daraus der Bedarf an Vollzeitäquivalenten im Vergleich zur Ist-Besetzung.",
    sheets: [
      {
        name: "Bemessung",
        title: "Personalbedarfsermittlung Referat B 3 – Aufgabenbemessung",
        subtitle: "Grundlage: Selbstaufschreibung Mai/Juni 2025 und Fallzahlen 2024",
        columns: [
          { header: "Aufgabe", width: 44 },
          { header: "Fallzahl pro Jahr", width: 14, fmt: "int" },
          { header: "Ø Bearbeitungszeit (Min.)", width: 16, fmt: "int" },
          { header: "Arbeitszeit pro Jahr (Std.)", width: 16, fmt: "hours" },
          { header: "Anteil", width: 9, fmt: "pct" },
        ],
        rows: [
          ["Nutzerstudien planen und durchführen", 14, 9600, { f: "B{r}*C{r}/60" }, { f: "D{r}/D$15" }],
          ["Servicestandards fortschreiben und abstimmen", 22, 3000, { f: "B{r}*C{r}/60" }, { f: "D{r}/D$15" }],
          ["Beratung von Fachreferaten zu Online-Diensten", 520, 180, { f: "B{r}*C{r}/60" }, { f: "D{r}/D$15" }],
          ["Barrierefreiheitsprüfungen (Stichproben)", 120, 480, { f: "B{r}*C{r}/60" }, { f: "D{r}/D$15" }],
          ["Auswertung von Nutzerfeedback", 52, 600, { f: "B{r}*C{r}/60" }, { f: "D{r}/D$15" }],
          ["Leitungsvorlagen, Parlamentarische Anfragen", 95, 420, { f: "B{r}*C{r}/60" }, { f: "D{r}/D$15" }],
          ["Bund-Länder-Gremien (Vor- und Nachbereitung)", 18, 1800, { f: "B{r}*C{r}/60" }, { f: "D{r}/D$15" }],
          ["Projektbegleitung KI-Assistenz (Nutzertests)", 12, 6000, { f: "B{r}*C{r}/60" }, { f: "D{r}/D$15" }],
          ["Sonstige Aufgaben (Haushalt, Organisation)", 1, 36000, { f: "B{r}*C{r}/60" }, { f: "D{r}/D$15" }],
          ["Fortbildung und Wissensmanagement", 9, 1920, { f: "B{r}*C{r}/60" }, { f: "D{r}/D$15" }],
          { total: true, cells: ["Summe", null, null, { f: "SUM(D{first}:D{last})" }, { f: "D{r}/D$15" }] },
        ],
      },
      {
        name: "Ergebnis",
        title: "Ergebnis der Bemessung",
        columns: [
          { header: "Kennzahl", width: 46 },
          { header: "Wert", width: 14, fmt: "dec" },
        ],
        rows: [
          ["Arbeitszeit pro Jahr in Stunden (aus „Bemessung“)", { f: "Bemessung!D15", fmt: "hours" }],
          ["Jahresarbeitszeit je VZÄ in Stunden (Bund, Ist-Wert)", { f: "1596", fmt: "hours" }],
          ["Rechnerischer Bedarf in VZÄ", { f: "ROUND(B5/B6,2)" }],
          ["Zuschlag Leitung und Verteilzeit (10 %)", { f: "ROUND(B7*0.1,2)" }],
          ["Bedarf inklusive Zuschlag in VZÄ", { f: "B7+B8" }],
          ["Ist-Besetzung in VZÄ (Stichtag 01.07.2025)", 6.5],
          { total: true, cells: ["Differenz (positiv = Mehrbedarf)", { f: "ROUND(B9-B10,2)" }] },
        ],
        notes: [
          "Die Bearbeitungszeiten beruhen auf einer vierwöchigen Selbstaufschreibung und sind mit dem Referat abgestimmt.",
          "Empfehlung: Mehrbedarf über die Projektmittel KI-Assistenz befristet abdecken; Überprüfung in 2027.",
        ],
      },
    ],
  },
];

export const threads: ThreadSpec[] = [];
