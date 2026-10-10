// Zweckverband Kommunale IT Altmoor
import type { DocSpec, ThreadSpec } from "../types";

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
];
