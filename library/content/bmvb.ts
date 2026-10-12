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
  {
    type: "word",
    id: "bmvb-organisationserlass-neuordnung-abteilung-d",
    title: "Organisationserlass Nr. 2/2025: Neuordnung der Abteilung D – Digitale Verwaltung",
    kind: "Organisationserlass",
    fileName: "Organisationserlass 2-2025 Neuordnung Abteilung D",
    org: "bmvb",
    unit: "bmvb-z13",
    author: "bmvb-mai",
    date: "2025-02-24",
    tags: ["personendaten"],
    keywords: ["Z I 3 – 10102/1#7", "Referat D 3", "01.03.2025", "Dienstposten", "KI-Anwendungen in der Bundesverwaltung"],
    summary:
      "Erlass der Zentralabteilung zur Auflösung des Referats D 3 und zur Neuausrichtung von D 4 auf KI-Anwendungen zum 01.03.2025; die Anlage enthält eine personelle Zuordnung mit Namen, Besoldung, Teilzeit und einem Hinweis auf eine Schwerbehinderung – geeignet zum Anonymisieren.",
    meta: [
      ["Aktenzeichen", "Z I 3 – 10102/1#7"],
      ["Erlass-Nr.", "2/2025"],
    ],
    subject: "Organisationserlass Nr. 2/2025 – Neuordnung der Abteilung D „Digitale Verwaltung“",
    blocks: [
      { t: "p", text: "Mit Wirkung vom **01.03.2025** wird die Abteilung D – Digitale Verwaltung wie folgt neu geordnet. Der Erlass ersetzt die Regelungen zur Abteilung D im Organisationserlass Nr. 5/2023." },
      { t: "h2", text: "1. Auflösung des Referats D 3" },
      {
        t: "p",
        text: "Das **Referat D 3** – IT-Konsolidierung und Netze wird aufgelöst. Die Aufgaben der IT-Konsolidierung sind weitgehend abgeschlossen; die verbleibenden Daueraufgaben werden den fachlich nächstliegenden Referaten zugeordnet:",
      },
      {
        t: "table",
        header: ["Aufgabe", "bisher", "künftig"],
        rows: [
          ["Grundsatzfragen der IT-Konsolidierung des Bundes, Berichtswesen", "D 3", "D 1"],
          ["Fachaufsicht über den IT-Betrieb im Geschäftsbereich (einschließlich BZBL)", "D 3", "D 1"],
          ["Netze des Bundes, Anbindung der Geschäftsbereichsbehörden", "D 3", "D 2"],
          ["Koordinierung der Rechenzentrumsleistungen, einschließlich Betrieb des KI-Pilotassistenten", "D 3", "D 4"],
          ["Mitarbeit in Bund-Länder-Gremien zur IT-Infrastruktur", "D 3", "D 2"],
        ],
        widths: [6, 1, 1],
      },
      { t: "h2", text: "2. Neuausrichtung des Referats D 4" },
      {
        t: "p",
        text: "Das bisherige Referat D 4 – Digitale Innovation erhält die Bezeichnung **„Referat D 4 – KI-Anwendungen in der Bundesverwaltung“**. Es ist zuständig für Grundsatzfragen des Einsatzes Künstlicher Intelligenz in der Bundesverwaltung, die Umsetzung der KI-Verordnung (EU) 2024/1689 im Geschäftsbereich, die Steuerung des Pilotbetriebs eines KI-Assistenten in vier Behörden ab März 2025 sowie die Begleitforschung. Die bisherigen Aufgaben „Innovationslabor“ und „Ideenwettbewerb“ entfallen.",
      },
      { t: "h2", text: "3. Referat D 2" },
      {
        t: "p",
        text: "Das Referat D 2 – Datenaustausch und Register übernimmt zusätzlich die Aufgaben „Netze des Bundes“ und die Mitarbeit in Bund-Länder-Gremien zur IT-Infrastruktur. Die Federführung für die Registermodernisierung bleibt unverändert bei D 2.",
      },
      { t: "h2", text: "4. Personal und Stellen" },
      {
        t: "p",
        text: "Die fünf Dienstposten des Referats D 3 werden ohne Änderung ihrer Bewertung in die aufnehmenden Referate umgesetzt; die Zuordnung ergibt sich aus der Anlage. Die Referatsleitungsfunktion D 3 entfällt. Der Dienstposten D3-05 wird nach D 4 verlagert und dort im laufenden Bewertungsverfahren überprüft. Die Umsetzungen sind mit den Betroffenen in Einzelgesprächen am 11. und 12.02.2025 erörtert worden.",
      },
      { t: "h2", text: "5. Beteiligung" },
      {
        t: "p",
        text: "Der Personalrat wurde im Mitwirkungsverfahren nach dem Bundespersonalvertretungsgesetz beteiligt und hat am 18.02.2025 keine Einwendungen erhoben. Die Gleichstellungsbeauftragte wurde nach § 27 BGleiG beteiligt, die Schwerbehindertenvertretung nach § 178 Abs. 2 SGB IX unterrichtet und angehört.",
      },
      { t: "h2", text: "6. Folgeänderungen" },
      {
        t: "ul",
        items: [
          "Der Geschäftsverteilungsplan und das Organigramm im Intranet werden zum 01.03.2025 angepasst (Referat Z I 3).",
          "Das Funktionspostfach referat-d3@bmvb.bund.example wird bis 30.06.2025 an referat-d1@bmvb.bund.example weitergeleitet und danach gelöscht.",
          "Laufende Vorgänge in der E-Akte werden von den aufnehmenden Referaten übernommen; der Aktenplan wird zum 01.04.2025 bereinigt.",
          "Die Raumbelegung im 4. OG wird mit dem Hausdienst bis 15.03.2025 abgestimmt.",
        ],
      },
      { t: "signature", lines: ["Berlin, 24.02.2025", "", "Im Auftrag", "gez. Dr. Beate Amrhein", "Leiterin der Zentralabteilung"] },
      { t: "pagebreak" },
      { t: "h2", text: "Anlage: Personelle Zuordnung (Stand 24.02.2025) – nur für den Dienstgebrauch" },
      {
        t: "table",
        header: ["Name", "Amtsbezeichnung / Entgeltgruppe", "Dienstposten", "bisher", "künftig", "Bemerkung"],
        rows: [
          ["Dr. Kilian Wessel", "Regierungsdirektor (A 15)", "D3-01", "Referatsleitung D 3", "D 1, Referent Grundsatz IT-Konsolidierung", "Referatsleitungsfunktion entfällt; Verwendung als stellv. RL D 1"],
          ["Simone Haack", "Oberregierungsrätin (A 14)", "D3-02", "D 3", "D 1", "Teilzeit 80 %, Telearbeit Mo/Fr"],
          ["Torben Liedtke", "Regierungsamtsrat (A 12)", "D3-03", "D 3", "D 2", "Arbeitsplatz mit Sonderausstattung (Schwerbehinderung, GdB 50) mitnehmen"],
          ["Nadine Bruckner", "Tarifbeschäftigte (E 11)", "D3-04", "D 3", "D 2", "befristet bis 31.12.2025"],
          ["Anna-Lena Pohl", "Regierungsrätin (A 13h)", "D3-05", "D 3", "D 4, Pilotbetrieb KI-Assistent", "Bewertungsverfahren läuft"],
        ],
        widths: [3, 3, 2, 2, 3, 4],
      },
      { t: "note", text: "Verteiler: alle Beschäftigten der Abteilung D, Personalrat, Gleichstellungsbeauftragte, Schwerbehindertenvertretung, Personalreferat. Die Anlage wird nur an die Betroffenen, die Abteilungsleitung D und das Personalreferat verteilt." },
    ],
  },
  {
    type: "word",
    id: "bmvb-ergebnisbericht-nutzerforschung-umzugsmeldung",
    title: "Ergebnisbericht Nutzerforschung: Digitale Umzugsmeldung (Pilot)",
    kind: "Ergebnisbericht",
    fileName: "2025-05-16 Ergebnisbericht Nutzertests Digitale Umzugsmeldung",
    org: "bmvb",
    unit: "bmvb-b3",
    author: "bmvb-weidner",
    date: "2025-05-16",
    keywords: ["B 3 – 21410/2#5", "Sitzungs-Timeout", "System Usability Scale", "Pilotkommune Falkenbrück", "Bürgerkonto"],
    summary:
      "Langer Bericht über moderierte Nutzertests mit 24 Personen zur digitalen Umzugsmeldung: Aufgabenerfolg, Befunde mit Schweregrad (Timeout, CAPTCHA, Fachbegriffe, Barrierefreiheit), Zitate und priorisierte Empfehlungen – gut zum Zusammenfassen, Priorisieren und Ableiten von Maßnahmen.",
    meta: [
      ["Aktenzeichen", "B 3 – 21410/2#5"],
      ["Version", "1.0 (abgestimmt mit Referat B 2)"],
      ["Status", "intern"],
    ],
    subject: "Ergebnisbericht zur qualitativen Nutzerforschung „Digitale Umzugsmeldung“ – Testrunde 1 (März/April 2025)",
    blocks: [
      { t: "h1", text: "Zusammenfassung" },
      {
        t: "p",
        text: "Die digitale Umzugsmeldung wird seit Januar 2025 in drei Pilotkommunen erprobt. Referat B 3 hat im März und April 2025 moderierte Nutzertests mit 24 Personen durchgeführt. Das Verfahren wird grundsätzlich gut angenommen: 21 von 24 Teilnehmenden würden einen Umzug künftig online melden, wenn die Anwendung zuverlässig funktioniert. Gleichzeitig scheitern zu viele Menschen an Hürden, die mit überschaubarem Aufwand zu beseitigen wären. Die wichtigsten Ergebnisse:",
      },
      {
        t: "ol",
        items: [
          "**Einstieg über das Bürgerkonto:** 9 von 24 Teilnehmenden kamen ohne Hilfe nicht über Registrierung und Anmeldung hinaus; 4 brachen ab.",
          "**Sitzungs-Timeout:** Nach 20 Minuten Inaktivität wird die Sitzung ohne Vorwarnung beendet. Sechs Personen verloren dadurch ihre Eingaben.",
          "**Fachbegriffe:** „Wohnungsgeberbestätigung“, „Nebenwohnung“ und „Auskunftssperre“ wurden von mehr als der Hälfte nicht oder falsch verstanden.",
          "**Barrierefreiheit:** Alle drei Screenreader-Nutzenden scheiterten am grafischen CAPTCHA; mehrere Eingabefelder sind nicht beschriftet, die PDF-Bestätigung ist nicht barrierefrei.",
          "**Positiv:** Die Übernahme der bereits gespeicherten Meldedaten (Once-Only) wurde ausdrücklich gelobt und spart nach Selbstauskunft deutlich Zeit.",
        ],
      },
      {
        t: "p",
        text: "Die Gebrauchstauglichkeit liegt nach der System Usability Scale (SUS) bei durchschnittlich 58 Punkten und damit unter dem üblichen Richtwert von 68. Wir empfehlen, die vier kritischen Befunde vor der geplanten Ausweitung auf weitere Kommunen zu beheben (Abschnitt 5).",
      },
      { t: "h1", text: "1. Anlass und Ziel" },
      {
        t: "p",
        text: "Wer umzieht, muss sich nach § 17 Bundesmeldegesetz (BMG) innerhalb von zwei Wochen bei der Meldebehörde anmelden. Seit Einführung der elektronischen Anmeldung nach § 23a BMG ist dies auch online möglich, sofern die Kommune den Dienst anbietet und die meldepflichtige Person sich elektronisch identifiziert. Im Pilotvorhaben „Digitale Umzugsmeldung“ stellen Bund, Land und die Pilotkommunen Falkenbrück, Altmoor und Brackenhain einen gemeinsamen Online-Dienst bereit, der über das Bürgerkonto erreichbar ist und die Daten unmittelbar an das kommunale Fachverfahren für das Meldewesen übergibt.",
      },
      {
        t: "p",
        text: "Für die Pilotkommune Falkenbrück ist der Dienst besonders wichtig: Die Wartezeit auf einen Termin im Bürgeramt lag dort im April 2025 bei 14 Werktagen, An- und Ummeldungen machen rund ein Viertel aller Vorsprachen aus. Jede Umzugsmeldung, die online abgeschlossen wird, entlastet das Bürgeramt unmittelbar.",
      },
      {
        t: "p",
        text: "Ziel der Testrunde 1 war es, vor der Ausweitung des Pilotbetriebs herauszufinden, wo Nutzende scheitern, was sie nicht verstehen und welche Änderungen den größten Nutzen versprechen. Die Ergebnisse fließen außerdem in die Arbeiten an verbindlichen Servicestandards für Verwaltungsleistungen des Bundes ein.",
      },
      { t: "h1", text: "2. Methode" },
      { t: "h2", text: "2.1 Vorgehen" },
      {
        t: "p",
        text: "Durchgeführt wurden 24 moderierte Einzeltests von je 60 Minuten nach der Methode des lauten Denkens: 12 Tests im Nutzerlabor des BMVB in Berlin, 8 Tests per Videokonferenz und 4 Tests vor Ort im Bürgeramt der Pilotkommune Falkenbrück. Getestet wurde die Version 2.1 des Dienstes in einer Testumgebung mit fiktiven Meldedaten. Die Teilnehmenden wurden über einen Dienstleister gewonnen und erhielten eine Aufwandsentschädigung von 50 Euro.",
      },
      {
        t: "p",
        text: "Alle Teilnehmenden haben vorab schriftlich in die Aufzeichnung von Bildschirm und Ton eingewilligt (Art. 6 Abs. 1 Buchst. a DSGVO). Die Aufzeichnungen werden sechs Monate nach Abschluss der Auswertung gelöscht; in diesem Bericht werden Teilnehmende nur mit Kennung (TN 01 bis TN 24) und Altersangabe zitiert.",
      },
      { t: "h2", text: "2.2 Teilnehmende" },
      {
        t: "table",
        header: ["Merkmal", "Ausprägung", "Anzahl"],
        rows: [
          ["Alter", "18–29 Jahre / 30–49 Jahre / 50–64 Jahre / 65 Jahre und älter", "6 / 9 / 5 / 4"],
          ["Digitale Erfahrung (Selbsteinschätzung)", "gering / mittel / hoch", "7 / 10 / 7"],
          ["Assistive Technologien", "Screenreader / Bildschirmvergrößerung", "3 / 2"],
          ["Deutsch nicht Erstsprache", "–", "5"],
          ["Genutztes Gerät", "Smartphone / PC oder Notebook", "14 / 10"],
          ["Bürgerkonto bereits vorhanden", "ja / nein", "8 / 16"],
        ],
        widths: [3, 4, 2],
      },
      { t: "h2", text: "2.3 Aufgaben" },
      {
        t: "ol",
        items: [
          "A1: Im Bürgerkonto registrieren bzw. anmelden",
          "A2: Einen Umzug innerhalb der Stadt melden (alleinige Wohnung)",
          "A3: Ein minderjähriges Kind beim Umzug mit anmelden",
          "A4: Die Wohnungsgeberbestätigung hochladen",
          "A5: Die Meldebestätigung herunterladen und den Adressaufkleber für den Personalausweis anfordern",
        ],
      },
      {
        t: "p",
        text: "Im Anschluss füllten die Teilnehmenden den Fragebogen der System Usability Scale aus (zehn Aussagen, Ergebnis 0 bis 100 Punkte). Werte unter 68 gelten als unterdurchschnittlich, Werte unter 50 als nicht akzeptabel.",
      },
      { t: "h1", text: "3. Ergebnisse im Überblick" },
      {
        t: "table",
        header: ["Aufgabe", "ohne Hilfe erfolgreich", "mit Hilfe erfolgreich", "abgebrochen", "Ø Dauer (Min.)"],
        rows: [
          ["A1 Registrierung/Anmeldung", "15", "5", "4", "7,5"],
          ["A2 Umzug melden", "17", "4", "3", "9,0"],
          ["A3 Kind mit anmelden", "11", "6", "7", "6,5"],
          ["A4 Wohnungsgeberbestätigung", "13", "5", "6", "4,0"],
          ["A5 Bestätigung und Adressaufkleber", "19", "3", "2", "2,5"],
        ],
        widths: [4, 2, 2, 2, 2],
      },
      {
        t: "p",
        text: "Die durchschnittliche Gesamtdauer für eine vollständige Umzugsmeldung lag bei 29,5 Minuten und damit deutlich über dem Ziel von 15 Minuten. Der SUS-Wert betrug im Mittel 58 Punkte (Spannweite 22,5 bis 90). Teilnehmende mit Screenreader vergaben im Mittel nur 31 Punkte, Teilnehmende mit hoher digitaler Erfahrung 74 Punkte.",
      },
      { t: "h1", text: "4. Befunde im Einzelnen" },
      {
        t: "p",
        text: "Die Befunde sind nach Schweregrad eingestuft: **kritisch** (Aufgabe kann nicht abgeschlossen werden), **hoch** (erheblicher Umweg oder Fehler mit Folgen), **mittel** (Verzögerung, Unsicherheit), **gering** (kosmetisch).",
      },
      { t: "h2", text: "B-01 Einstieg über das Bürgerkonto (hoch)" },
      {
        t: "p",
        text: "16 Teilnehmende besaßen noch kein Bürgerkonto. Die Registrierung verlangt eine elektronische Identifizierung mit dem Personalausweis; dass hierfür die PIN des Ausweises benötigt wird, erfuhren viele erst im letzten Schritt. Fünf Personen kannten ihre PIN nicht mehr. Die Startseite erklärt nicht, warum ein Konto nötig ist und was danach passiert.",
      },
      { t: "p", text: "„Ich will doch nur meine neue Adresse sagen. Warum muss ich jetzt ein Konto anlegen?“ (TN 05, 67 Jahre)" },
      { t: "h2", text: "B-02 Sitzungs-Timeout ohne Vorwarnung (kritisch)" },
      {
        t: "p",
        text: "Die Sitzung endet nach 20 Minuten ohne Eingabe. Es erscheint keine Warnung und keine Möglichkeit zur Verlängerung; bereits erfasste Daten gehen verloren. Betroffen waren sechs Teilnehmende, typischerweise während sie die Wohnungsgeberbestätigung suchten oder einscannten. Für Menschen mit Screenreader, die für dieselbe Aufgabe deutlich länger brauchen, ist die Zeitgrenze ein grundsätzliches Hindernis.",
      },
      { t: "p", text: "„Jetzt ist alles weg. Das mache ich nicht noch mal.“ (TN 14, 41 Jahre)" },
      { t: "h2", text: "B-03 Unverständliche Fachbegriffe (hoch)" },
      {
        t: "p",
        text: "Die Begriffe „Wohnungsgeberbestätigung“ (14 von 24), „Nebenwohnung“ (11 von 24) und „Auskunftssperre“ (17 von 24) wurden nicht oder falsch verstanden. Mehrere Teilnehmende hielten die Wohnungsgeberbestätigung für den Mietvertrag und luden diesen hoch. Die Frage nach einer Auskunftssperre wurde teils als Pflichtangabe missverstanden; zwei Personen beantragten versehentlich eine Sperre.",
      },
      { t: "h2", text: "B-04 Hochladen der Wohnungsgeberbestätigung (hoch)" },
      {
        t: "p",
        text: "Akzeptiert werden nur PDF-Dateien bis 2 MB. Fotos vom Smartphone (JPG, HEIC) werden mit der Meldung „Ungültiges Dateiformat“ abgelehnt, ohne zu erklären, was stattdessen möglich ist. Sechs Teilnehmende brachen an dieser Stelle ab. Hinweise, dass die Bestätigung nach § 19 BMG vom Wohnungsgeber ausgestellt wird und auch nachgereicht werden kann, fehlen.",
      },
      { t: "h2", text: "B-05 Mitmelden von Kindern (mittel)" },
      {
        t: "p",
        text: "Unklar war, ob Kinder gesondert gemeldet werden müssen und ob die Zustimmung des anderen sorgeberechtigten Elternteils erforderlich ist. Die Anwendung fragt dies erst nach der Eingabe aller Daten ab. Sieben Teilnehmende brachen Aufgabe A3 ab, weil sie befürchteten, etwas Falsches zu erklären.",
      },
      { t: "h2", text: "B-06 Grafisches CAPTCHA (kritisch)" },
      {
        t: "p",
        text: "Vor dem Absenden muss ein grafisches CAPTCHA gelöst werden. Eine Audio-Alternative fehlt. Alle drei Screenreader-Nutzenden konnten die Meldung deshalb nicht absenden. Auch zwei ältere Teilnehmende benötigten mehrere Versuche. Da sich Nutzende zuvor bereits über das Bürgerkonto identifiziert haben, ist das CAPTCHA fachlich nicht erforderlich.",
      },
      { t: "p", text: "„Hier ist für mich Schluss. Ohne fremde Hilfe komme ich nicht weiter.“ (TN 19, 52 Jahre, Screenreader)" },
      { t: "h2", text: "B-07 Nicht beschriftete Eingabefelder (kritisch)" },
      {
        t: "p",
        text: "Die Felder für Hausnummer, Zusatz und Einzugsdatum sind für Screenreader nicht beschriftet und werden nur als „Eingabefeld, leer“ vorgelesen. Fehlermeldungen erscheinen ausschließlich farblich (rote Umrandung) und werden nicht vorgelesen. Das widerspricht den Anforderungen der BITV 2.0.",
      },
      { t: "h2", text: "B-08 PDF-Bestätigung nicht barrierefrei (kritisch)" },
      {
        t: "p",
        text: "Die Meldebestätigung wird als PDF ohne Textebene und ohne Struktur ausgegeben. Screenreader lesen nur „Bild“. Damit erhalten blinde Nutzende keinen Nachweis über ihre Meldung.",
      },
      { t: "h2", text: "B-09 Was passiert danach? (mittel)" },
      {
        t: "p",
        text: "Nach dem Absenden fehlen Informationen zu den nächsten Schritten: wann der Adressaufkleber per Post kommt, ob Fahrzeugpapiere gesondert geändert werden müssen und an welche Stellen die neue Adresse automatisch weitergegeben wird. Zwölf Teilnehmende fragten danach.",
      },
      { t: "h2", text: "B-10 Datumsangaben auf dem Smartphone (gering)" },
      {
        t: "p",
        text: "Das Einzugsdatum muss im Format TT.MM.JJJJ eingetippt werden; der Kalender des Smartphones wird nicht angeboten. Mehrere Teilnehmende gaben das Datum zunächst falsch ein.",
      },
      { t: "h2", text: "B-11 Positive Rückmeldungen" },
      {
        t: "ul",
        items: [
          "Die automatische Übernahme der bisherigen Meldedaten wurde von fast allen als großer Vorteil genannt.",
          "Die Zusammenfassung vor dem Absenden ist übersichtlich und wurde von 20 Teilnehmenden zur Kontrolle genutzt.",
          "Die Gestaltung wurde als ruhig und „behördlich, aber nicht altmodisch“ beschrieben.",
          "Gewünscht wurden weitere Sprachen, vor allem Englisch, Türkisch, Ukrainisch und Arabisch.",
        ],
      },
      { t: "h1", text: "5. Empfehlungen und Priorisierung" },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Befund", "Aufwand", "Priorität", "zuständig"],
        rows: [
          ["E-1", "Warnung zwei Minuten vor Ablauf der Sitzung, Verlängerung per Klick, Zwischenspeichern", "B-02", "gering", "sofort", "Plattformbetrieb"],
          ["E-2", "CAPTCHA nach Anmeldung über das Bürgerkonto entfernen", "B-06", "gering", "sofort", "Plattformbetrieb"],
          ["E-3", "Alle Felder beschriften, Fehlermeldungen als Text ausgeben", "B-07", "mittel", "sofort", "Plattformbetrieb"],
          ["E-4", "Barrierefreie PDF-Bestätigung (getaggt, mit Textebene)", "B-08", "mittel", "sofort", "Plattformbetrieb"],
          ["E-5", "Erklärtexte für Fachbegriffe, Auskunftssperre als freiwillige Option kennzeichnen", "B-03", "gering", "hoch", "B 3 mit Pilotkommunen"],
          ["E-6", "Upload von JPG und PNG zulassen, Größe bis 10 MB, Nachreichen ermöglichen", "B-04", "mittel", "hoch", "Plattformbetrieb"],
          ["E-7", "Einstiegsseite mit Erklärung zum Bürgerkonto und zur Ausweis-PIN", "B-01", "gering", "hoch", "B 1"],
          ["E-8", "Frage nach weiteren Sorgeberechtigten an den Anfang von A3", "B-05", "gering", "mittel", "Plattformbetrieb"],
          ["E-9", "Abschlussseite „So geht es weiter“", "B-09", "gering", "mittel", "B 3"],
          ["E-10", "Datumsauswahl mit Systemkalender", "B-10", "gering", "niedrig", "Plattformbetrieb"],
        ],
        widths: [1, 6, 1, 1, 1, 3],
      },
      { t: "h1", text: "6. Nächste Schritte" },
      {
        t: "ul",
        items: [
          "Übergabe der Empfehlungen E-1 bis E-4 an den Plattformbetrieb mit der Bitte um Umsetzung im Release 2.3 (geplant für Herbst 2025)",
          "Abstimmung der Erklärtexte mit den Pilotkommunen und dem Referat B 2 bis Ende Juni 2025",
          "Testrunde 2 nach Release 2.3, voraussichtlich September 2025, erneut mit Teilnehmenden, die assistive Technologien nutzen",
          "Einbringen der Erkenntnisse zu Zeitbegrenzungen und CAPTCHA in die Arbeiten an Servicestandards für Verwaltungsleistungen",
          "Bericht an die Abteilungsleitung B im Juni 2025",
        ],
      },
      { t: "h1", text: "Anhang: Ausgewählte Zitate" },
      {
        t: "ul",
        items: [
          "„Das mit den alten Daten, die schon drinstehen, finde ich super. Das hätte ich nicht erwartet.“ (TN 02, 34 Jahre)",
          "„Wohnungsgeber – ist das mein Vermieter oder die Hausverwaltung? Oder beide?“ (TN 08, 29 Jahre)",
          "„Auskunftssperre klingt, als hätte ich was angestellt.“ (TN 11, 45 Jahre)",
          "„Auf dem Handy finde ich die Datei nicht. Ich habe das doch fotografiert.“ (TN 16, 23 Jahre)",
          "„Wenn ich das im Bürgeramt mache, muss ich drei Wochen warten. Hier wäre ich in einer Viertelstunde fertig – wenn es klappt.“ (TN 21, 38 Jahre)",
          "„Ich höre nur ‚Eingabefeld, leer‘. Welches Feld?“ (TN 03, 58 Jahre, Screenreader)",
          "„Kommt jetzt noch ein Brief? Muss ich zur Zulassungsstelle?“ (TN 12, 61 Jahre)",
          "„Auf Englisch wäre es für mich viel leichter.“ (TN 23, 31 Jahre)",
        ],
      },
      { t: "signature", lines: ["Berlin, 16.05.2025", "", "Clara Weidner", "Referentin Nutzerforschung, Referat B 3", "", "Mitgezeichnet: Kühnel (RL B 3), Sandmann (RL B 2)"] },
    ],
  },
  {
    type: "excel",
    id: "bmvb-nutzerbefragung-verwaltungsleistungen-2025",
    title: "Nutzerbefragung 2025 zu Verwaltungsleistungen des Bundes – Auswertung",
    kind: "Auswertung",
    fileName: "Auswertung Nutzerbefragung Verwaltungsleistungen 2025",
    org: "bmvb",
    unit: "bmvb-b3",
    author: "bmvb-weidner",
    date: "2025-07-15",
    tags: ["zahlen", "unstrukturiert"],
    keywords: ["Rücklaufquote", "Weiterempfehlung", "Digitale Umzugsmeldung (Pilot)", "Freitext (wörtlich)"],
    summary:
      "Auswertung der Online-Befragung mit 2.486 abgeschlossenen Fragebögen: Rücklauf je Kanal, Zufriedenheit je Verwaltungsleistung mit gewichtetem Mittel und ein Blatt mit unbearbeiteten Freitextantworten (Tippfehler, Beschwerden, Lob) zum Kategorisieren.",
    sheets: [
      {
        name: "Rücklauf",
        title: "Nutzerbefragung 2025 – Rücklauf nach Zugangsweg",
        subtitle: "Befragungszeitraum 05.05. bis 20.06.2025 · Referat B 3",
        columns: [
          { header: "Zugangsweg", width: 46 },
          { header: "Einladungen", width: 13, fmt: "int" },
          { header: "begonnen", width: 12, fmt: "int" },
          { header: "abgeschlossen", width: 14, fmt: "int" },
          { header: "Rücklaufquote", width: 13, fmt: "pct" },
          { header: "Abbruchquote", width: 13, fmt: "pct" },
        ],
        rows: [
          ["Einladung auf der Bestätigungsseite nach Online-Antrag", 18400, 1912, 1408, { f: "D{r}/B{r}" }, { f: "(C{r}-D{r})/C{r}" }],
          ["E-Mail-Einladung über das Bürgerkonto", 9600, 1104, 812, { f: "D{r}/B{r}" }, { f: "(C{r}-D{r})/C{r}" }],
          ["Kurzbefragung nach Rückruf durch das Bürgertelefon", 620, 301, 266, { f: "D{r}/B{r}" }, { f: "(C{r}-D{r})/C{r}" }],
          {
            total: true,
            cells: ["Gesamt", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "D{r}/B{r}" }, { f: "(C{r}-D{r})/C{r}" }],
          },
        ],
        notes: ["Rücklaufquote = abgeschlossene Fragebögen / Einladungen. Mehrfachteilnahmen wurden über ein Sitzungsmerkmal ausgeschlossen."],
      },
      {
        name: "Zufriedenheit",
        title: "Zufriedenheit nach Verwaltungsleistung",
        subtitle: "Skala 1 (sehr unzufrieden) bis 5 (sehr zufrieden) · Weiterempfehlung = Anteil „ja, bestimmt“",
        columns: [
          { header: "Verwaltungsleistung", width: 44 },
          { header: "n", width: 8, fmt: "int" },
          { header: "Gesamtzufriedenheit", width: 14, fmt: "dec" },
          { header: "Verständlichkeit", width: 14, fmt: "dec" },
          { header: "Dauer", width: 10, fmt: "dec" },
          { header: "Barrierefreiheit", width: 14, fmt: "dec" },
          { header: "Weiterempfehlung", width: 15, fmt: "pct" },
          { header: "n × Gesamt (Hilfsspalte)", width: 16, fmt: "dec" },
        ],
        rows: [
          ["Führungszeugnis online beantragen", 612, 4.1, 3.9, 4.0, 3.6, 0.78, { f: "B{r}*C{r}" }],
          ["Bürgerkonto: Registrierung und Anmeldung", 498, 3.1, 3.3, null, 3.0, 0.41, { f: "B{r}*C{r}" }],
          ["Digitale Umzugsmeldung (Pilot)", 214, 3.4, 3.0, 3.8, 2.7, 0.55, { f: "B{r}*C{r}" }],
          ["Rückruf-Service des Bürgertelefons", 266, 4.0, 4.2, 3.5, 3.9, 0.72, { f: "B{r}*C{r}" }],
          ["Nachweisabruf Geburtsurkunde", 188, 3.8, 3.7, 4.1, 3.5, 0.66, { f: "B{r}*C{r}" }],
          ["Fahrtkostenerstattung für Ehrenamtliche (Online-Antrag)", 143, 3.2, 2.9, 2.6, 3.1, 0.38, { f: "B{r}*C{r}" }],
          ["Kontaktformular Bürgerservice des BMVB", 327, 3.5, 3.8, 3.0, 3.6, 0.52, { f: "B{r}*C{r}" }],
          ["Bescheide im Postfach des Bürgerkontos abrufen", 238, 3.6, 3.5, 3.9, 3.2, 0.57, { f: "B{r}*C{r}" }],
          {
            total: true,
            cells: [
              "Gesamt (gewichtetes Mittel)",
              { f: "SUM(B{first}:B{last})" },
              { f: "ROUND(H{r}/B{r},2)", fmt: "dec" },
              { f: "ROUND(AVERAGE(D{first}:D{last}),1)" },
              { f: "ROUND(AVERAGE(E{first}:E{last}),1)" },
              { f: "ROUND(AVERAGE(F{first}:F{last}),1)" },
              { f: "AVERAGE(G{first}:G{last})" },
              { f: "SUM(H{first}:H{last})" },
            ],
          },
        ],
        notes: [
          "Gesamtzufriedenheit gewichtet nach Zahl der Antworten; die übrigen Spalten sind ungewichtete Mittelwerte.",
          "Bürgerkonto: Frage zur Dauer nicht gestellt.",
          "Die Werte zur digitalen Umzugsmeldung stützen die Ergebnisse der Nutzertests vom Frühjahr 2025 (Ergebnisbericht vom 16.05.2025).",
        ],
      },
      {
        name: "Freitexte",
        title: "Freitextantworten (Auswahl, unbearbeitet)",
        subtitle: "Frage 12: „Was sollten wir verbessern?“ · Rechtschreibung nicht korrigiert · Kategorie vorläufig",
        columns: [
          { header: "Nr.", width: 6, fmt: "int" },
          { header: "Verwaltungsleistung", width: 30 },
          { header: "Freitext (wörtlich)", width: 80 },
          { header: "Kategorie (vorläufig)", width: 22 },
        ],
        rows: [
          [1, "Bürgerkonto", "warum brauch ich für jede kleinigkeit diese ausweis-pin?? hab die nie bekommen bzw. verlegt", "Identifizierung"],
          [2, "Führungszeugnis", "Ging schnell und problemlos, danke!", "Lob"],
          [3, "Digitale Umzugsmeldung (Pilot)", "Nach 20 min war alles weg weil ich den Wisch vom Vermieter suchen musste. Bitte zwischenspeichern!!!", "Technik/Timeout"],
          [4, "Kontaktformular", "Antwort kam nach 3 Wochen und hat meine Frage nicht beantwortet sondern nur auf die Webseite verwiesen", "Antwortqualität"],
          [5, "Bürgerkonto", "Registrierung hat 3 Anläufe gebraucht, Fehlermeldung „Vorgang konnte nicht abgeschlossen werden“ sagt mir gar nix", "Fehlermeldungen"],
          [6, "Rückruf-Service", "sehr freundliche Dame am Telefon, hat mir alles erklärt. So sollte es immer sein", "Lob"],
          [7, "Fahrtkostenerstattung", "Formular verlangt Belege als PDF, ich hab nur Fotos. Musste extra zum Copyshop", "Upload/Formate"],
          [8, "Digitale Umzugsmeldung (Pilot)", "Was ist eine Auskunftssperre? Hab aus versehen ja geklickt glaub ich", "Verständlichkeit"],
          [9, "Nachweisabruf", "Super dass ich die Geburtsurkunde nicht mehr selbst besorgen muss", "Lob"],
          [10, "Bescheide im Postfach", "Ich bekomme keine Benachrichtigung wenn was neues im Postfach ist, hab den Bescheid 4 Wochen zu spät gesehen. Widerspruchsfrist fast weg!", "Benachrichtigung"],
          [11, "Kontaktformular", "Max 1000 Zeichen reicht nicht für mein Anliegen. Anhang nicht möglich.", "Formular"],
          [12, "Bürgerkonto", "Am Handy geht die Ausweis-App nicht mit meinem älteren Gerät", "Identifizierung"],
          [13, "Führungszeugnis", "Bezahlung mit Kreditkarte ging nicht, nur andere Verfahren. Bitte mehr Bezahlarten", "Bezahlung"],
          [14, "Digitale Umzugsmeldung (Pilot)", "Ich bin blind und konnte das Bilderrätsel am Ende nicht lösen. Musste meinen Sohn anrufen.", "Barrierefreiheit"],
          [15, "Fahrtkostenerstattung", "zu kompliziert, 6 Seiten für 23,40 €", "Aufwand"],
          [16, "Rückruf-Service", "Rückruf kam erst nach 4 Tagen, da hatte ich das Problem schon selber gelöst", "Erreichbarkeit"],
          [17, "Kontaktformular", "Es wäre gut wenn man sieht ob die Nachricht angekommen ist (Eingangsbestätigung)", "Eingangsbestätigung"],
          [18, "Bürgerkonto", "Bitte auch auf englisch!! My German is not good enough for this", "Mehrsprachigkeit"],
          [19, "Bescheide im Postfach", "Bescheid ist voller Paragraphen, versteh ich nicht. Was muss ich jetzt tun?", "Verständlichkeit"],
          [20, "Digitale Umzugsmeldung (Pilot)", "Endlich! Hat bei mir in 12 Minuten geklappt, Bürgeramt hätte 3 Wochen gedauert", "Lob"],
          [21, "Nachweisabruf", "Weiß nicht ob meine Daten jetzt an alle Behörden gehen? Wer sieht das?", "Datenschutz/Transparenz"],
          [22, "Fahrtkostenerstattung", "Session abgelaufen beim hochladen, alles nochmal", "Technik/Timeout"],
          [23, "Kontaktformular", "keine Telefonnummer zu finden, nur Formular. Bin 78 und mag das nicht", "Erreichbarkeit"],
          [24, "Führungszeugnis", "Status „in Bearbeitung“ seit 9 Tagen ohne weitere Info", "Bearbeitungsstand"],
          [25, "Bürgerkonto", "warum muss ich mich jedes mal neu anmelden, kann man nicht angemeldet bleiben", "Komfort"],
        ],
        notes: [
          "Ausgewählt wurden 25 von 1.137 Freitextantworten (Zufallsauswahl, gleichmäßig über die Leistungen verteilt).",
          "Personenbezogene Angaben in Freitexten wurden vor der Weitergabe entfernt. Kategorien bitte bis 31.07. durch B 1 gegenprüfen.",
        ],
      },
    ],
  },
  {
    type: "excel",
    id: "bmvb-mittelbewirtschaftung-kapitel-1801-2026",
    title: "Mittelbewirtschaftung Kapitel 1801 – Stand 31.08.2026",
    kind: "Haushaltsübersicht",
    fileName: "Kap 1801 Mittelbewirtschaftung Soll-Ist Stand 2026-08-31",
    org: "bmvb",
    unit: "bmvb-z12",
    author: "bmvb-prinz",
    date: "2026-09-08",
    tags: ["zahlen"],
    keywords: ["Kapitel 1801", "532 58", "Ausgabereste", "Festlegungen", "globale Minderausgabe"],
    summary:
      "Soll-Ist-Übersicht des Ministeriumskapitels nach Titeln mit Ausgaberesten aus 2025, Ist, Festlegungen und noch verfügbaren Mitteln; ein IT-Titel ist rechnerisch überzogen, ein Zuweisungstitel fließt kaum ab – gut für Fragen zur Mittelsteuerung und Deckungsfähigkeit.",
    sheets: [
      {
        name: "Titel",
        title: "Kapitel 1801 – Bundesministerium für Verwaltungsdienste und Bürgerservice",
        subtitle: "Haushaltsjahr 2026 · Stand 31.08.2026 · Beträge in Euro · Referat Z I 2",
        columns: [
          { header: "Titel", width: 9 },
          { header: "Zweckbestimmung", width: 50 },
          { header: "Soll 2026", width: 14, fmt: "eur0" },
          { header: "Ausgabereste aus 2025", width: 14, fmt: "eur0" },
          { header: "verfügbar gesamt", width: 14, fmt: "eur0" },
          { header: "Ist bis 31.08.", width: 14, fmt: "eur0" },
          { header: "Festlegungen", width: 14, fmt: "eur0" },
          { header: "noch verfügbar", width: 14, fmt: "eur0" },
          { header: "Bindung", width: 9, fmt: "pct" },
        ],
        rows: [
          ["422 01", "Bezüge und Nebenleistungen der Beamtinnen und Beamten", 31480000, 0, { f: "C{r}+D{r}" }, 20912300, 10150000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["428 01", "Entgelte der Arbeitnehmerinnen und Arbeitnehmer", 14920000, 0, { f: "C{r}+D{r}" }, 9874600, 4860000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["443 01", "Fürsorgeleistungen und Unterstützungen", 180000, 0, { f: "C{r}+D{r}" }, 96400, 0, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["511 01", "Geschäftsbedarf und Kommunikation", 1240000, 0, { f: "C{r}+D{r}" }, 702900, 214000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["511 58", "Geschäftsbedarf, Geräte und Ausstattung für Informationstechnik", 2150000, 180000, { f: "C{r}+D{r}" }, 1104800, 512000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["514 01", "Verbrauchsmittel, Haltung von Fahrzeugen", 96000, 0, { f: "C{r}+D{r}" }, 51200, 12000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["517 01", "Bewirtschaftung der Grundstücke, Gebäude und Räume", 2860000, 0, { f: "C{r}+D{r}" }, 1912000, 640000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["518 01", "Mieten und Pachten", 9420000, 0, { f: "C{r}+D{r}" }, 6280000, 3140000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["525 01", "Aus- und Fortbildung", 640000, 0, { f: "C{r}+D{r}" }, 288300, 96000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["526 02", "Sachverständige, Gutachten, Nutzerforschung", 850000, 120000, { f: "C{r}+D{r}" }, 402600, 318000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["527 01", "Dienstreisen", 720000, 0, { f: "C{r}+D{r}" }, 498700, 0, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["532 58", "Aufträge und Dienstleistungen im Bereich Informationstechnik (darunter KI-Assistenz)", 2600000, 410000, { f: "C{r}+D{r}" }, 1986400, 1140000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["544 01", "Forschung, Untersuchungen und Ähnliches", 1300000, 260000, { f: "C{r}+D{r}" }, 412000, 655000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["632 01", "Zuweisungen an Länder für Pilotvorhaben Bürgerservice", 4000000, 1250000, { f: "C{r}+D{r}" }, 1020000, 2400000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          ["812 58", "Erwerb von Geräten und Ausstattung für Informationstechnik", 980000, 0, { f: "C{r}+D{r}" }, 214500, 390000, { f: "E{r}-F{r}-G{r}" }, { f: "(F{r}+G{r})/E{r}" }],
          {
            total: true,
            cells: [
              "",
              "Summe Kapitel 1801",
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "SUM(G{first}:G{last})" },
              { f: "SUM(H{first}:H{last})" },
              { f: "(F{r}+G{r})/E{r}" },
            ],
          },
        ],
        notes: [
          "Festlegungen = rechtsverbindlich eingegangene Verpflichtungen und Mittelbindungen bis 31.12.2026 (bei Personaltiteln: Hochrechnung bis Jahresende).",
          "Die Titel 511 58, 532 58 und 812 58 sind gegenseitig deckungsfähig (Haushaltsvermerk). Die rechnerische Überschreitung bei 532 58 wird aus 511 58 und 812 58 gedeckt.",
          "532 58: angemeldet waren 3,4 Mio. € (Sachstand Referat D 4 vom 02.10.2025), veranschlagt wurden 2,6 Mio. €.",
          "632 01: Mittelabfluss der Länder weiterhin schleppend; Rücksprache mit Referat B 2 zum Abruf bis 30.11.2026 erforderlich.",
          "Die globale Minderausgabe des Kapitels (1,2 Mio. €) ist noch nicht erwirtschaftet.",
        ],
      },
      {
        name: "Ausgabereste",
        title: "Ausgabereste aus 2025 und ihre Inanspruchnahme",
        subtitle: "Übertragung nach § 45 BHO · Stand 31.08.2026",
        columns: [
          { header: "Titel", width: 9 },
          { header: "Begründung der Übertragung", width: 60 },
          { header: "Rest aus 2025", width: 14, fmt: "eur0" },
          { header: "in Anspruch genommen", width: 16, fmt: "eur0" },
          { header: "nicht in Anspruch genommen", width: 16, fmt: "eur0" },
        ],
        rows: [
          ["511 58", "Lieferverzug Monitore und Dockingstationen (Abruf Dezember 2025)", 180000, 180000, { f: "C{r}-D{r}" }],
          ["526 02", "Testrunde 3 Nutzerforschung „Digitale Umzugsmeldung“ auf 2026 verschoben", 120000, 96000, { f: "C{r}-D{r}" }],
          ["532 58", "Ausschreibung des zweiten Modellanbieters für die KI-Assistenz erst 2026", 410000, 410000, { f: "C{r}-D{r}" }],
          ["544 01", "Begleitforschung Registermodernisierung, Vertrag erst im Dezember 2025 geschlossen", 260000, 118000, { f: "C{r}-D{r}" }],
          ["632 01", "Mittelabruf der Länder für Pilotvorhaben verzögert", 1250000, 310000, { f: "C{r}-D{r}" }],
          { total: true, cells: ["", "Summe", { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }] },
          { total: true, cells: ["", "Abgleich: Summe Spalte D im Blatt „Titel“", { f: "Titel!D20" }, null, null] },
        ],
        notes: ["Nicht in Anspruch genommene Reste verfallen zum Jahresende, soweit keine erneute Übertragung beantragt wird."],
      },
    ],
  },
  {
    type: "word",
    id: "bmvb-referentenentwurf-servicestandardverordnung",
    title: "Referentenentwurf: Verordnung über Mindeststandards für den Service bei Verwaltungsleistungen des Bundes (ServStV)",
    kind: "Referentenentwurf",
    fileName: "RefE ServStV Bearbeitungsstand 2026-01-20",
    org: "bmvb",
    unit: "bmvb-b3",
    author: "bmvb-lorenzen",
    date: "2026-01-20",
    tags: ["widersprueche"],
    keywords: ["Servicestandardverordnung", "Annahmequote", "Erfüllungsaufwand", "BITV 2.0", "Bearbeitungsstand: 20.01.2026"],
    summary:
      "Sehr langer Referentenentwurf mit Vorblatt, Verordnungstext (15 Paragrafen) und Begründung zu verbindlichen Servicestandards (Erreichbarkeit, Eingangsbestätigung, Verständlichkeit, Barrierefreiheit, Nutzerforschung). Eingebaute Widersprüche: Vorblatt nennt 14,2 Mio. € jährlichen Erfüllungsaufwand der Verwaltung, die Begründung 12,4 Mio. €; § 3 verlangt Rückruf binnen zwei, die Begründung spricht von drei Arbeitstagen.",
    meta: [
      ["Aktenzeichen", "B 3 – 12010/3#4"],
      ["Bearbeitungsstand", "20.01.2026 14:32"],
      ["Status", "Entwurf – nicht abgestimmt"],
    ],
    blocks: [
      { t: "p", text: "**Referentenentwurf des Bundesministeriums für Verwaltungsdienste und Bürgerservice**" },
      { t: "p", text: "Bearbeitungsstand: 20.01.2026 14:32" },
      { t: "h1", text: "Entwurf einer Verordnung über Mindeststandards für den Service bei Verwaltungsleistungen des Bundes (Servicestandardverordnung – ServStV)" },
      { t: "h2", text: "A. Problem und Ziel" },
      {
        t: "p",
        text: "Bürgerinnen und Bürger erleben den Kontakt mit Behörden des Bundes sehr unterschiedlich. Während einzelne Behörden schnell erreichbar sind, verständlich schreiben und über den Stand eines Verfahrens informieren, warten Antragstellende andernorts wochenlang ohne Eingangsbestätigung, erreichen telefonisch niemanden oder erhalten Bescheide, die sie nicht verstehen. Verbindliche, behördenübergreifende Mindeststandards für den Service bei Verwaltungsleistungen gibt es bislang nicht.",
      },
      {
        t: "p",
        text: "Die Nutzerbefragung 2025 des Bundesministeriums für Verwaltungsdienste und Bürgerservice mit 2.486 Teilnehmenden ergab eine durchschnittliche Zufriedenheit von 3,6 auf einer Skala von 1 bis 5; besonders häufig bemängelt wurden fehlende Eingangsbestätigungen, unverständliche Bescheide und schlechte telefonische Erreichbarkeit. Die Annahmequote der Servicehotlines der Bundesbehörden lag 2025 im Jahresmittel bei 78 Prozent. Ziel der Verordnung ist es, einen verlässlichen Mindestservice festzulegen, an dem sich alle Behörden des Bundes messen lassen.",
      },
      { t: "h2", text: "B. Lösung" },
      {
        t: "p",
        text: "Die Verordnung legt Mindeststandards fest für die telefonische Erreichbarkeit (Annahmequote von 85 Prozent im Monatsmittel, Rückruf innerhalb von zwei Arbeitstagen), die Beantwortung schriftlicher Anfragen, die Eingangsbestätigung und die Information über den Bearbeitungsstand, die Verständlichkeit von Bescheiden und Formularen, die Barrierefreiheit digitaler Angebote, die Terminvergabe, die Beteiligung der Nutzenden an der Entwicklung digitaler Verwaltungsleistungen sowie das Beschwerdemanagement. Die Behörden berichten jährlich über die Einhaltung der Standards.",
      },
      { t: "h2", text: "C. Alternativen" },
      {
        t: "p",
        text: "Keine. Die seit 2019 bestehende freiwillige Selbstverpflichtung der Behörden („Servicecharta“) hat nicht zu einer messbaren Verbesserung geführt; für das Jahr 2024 haben nur 7 von 31 angefragten Behörden über ihre Servicequalität berichtet.",
      },
      { t: "h2", text: "D. Haushaltsausgaben ohne Erfüllungsaufwand" },
      { t: "p", text: "Keine." },
      { t: "h2", text: "E. Erfüllungsaufwand" },
      { t: "h3", text: "E.1 Erfüllungsaufwand für Bürgerinnen und Bürger" },
      {
        t: "p",
        text: "Für Bürgerinnen und Bürger entsteht kein zusätzlicher Erfüllungsaufwand. Durch Eingangsbestätigungen, Statusinformationen und Rückrufe entfallen Nachfragen; die Entlastung wird auf rund 1,9 Millionen Stunden jährlich geschätzt.",
      },
      { t: "h3", text: "E.2 Erfüllungsaufwand für die Wirtschaft" },
      { t: "p", text: "Keiner. Davon Bürokratiekosten aus Informationspflichten: keine." },
      { t: "h3", text: "E.3 Erfüllungsaufwand der Verwaltung" },
      {
        t: "p",
        text: "Für die Verwaltung des Bundes entsteht ein jährlicher Erfüllungsaufwand von rund **14,2 Mio. Euro** sowie ein einmaliger Erfüllungsaufwand von rund 8,9 Mio. Euro, vor allem für die Verbesserung der telefonischen Erreichbarkeit, die Barrierefreiheit digitaler Angebote und die technische Umsetzung der Statusinformation. Der Mehrbedarf an Sach- und Personalmitteln soll finanziell und stellenmäßig im jeweiligen Einzelplan ausgeglichen werden. Für Länder und Kommunen entsteht kein Erfüllungsaufwand.",
      },
      { t: "h2", text: "F. Weitere Kosten" },
      { t: "p", text: "Keine. Auswirkungen auf Einzelpreise und das Preisniveau, insbesondere auf das Verbraucherpreisniveau, sind nicht zu erwarten." },
      { t: "pagebreak" },
      { t: "h1", text: "Verordnung über Mindeststandards für den Service bei Verwaltungsleistungen des Bundes (Servicestandardverordnung – ServStV)" },
      { t: "p", text: "Vom …" },
      { t: "p", text: "Auf Grund des § 9 Absatz 1 des Verwaltungsservicegesetzes verordnet die Bundesregierung:" },
      { t: "h3", text: "§ 1 Anwendungsbereich" },
      {
        t: "ol",
        items: [
          "Diese Verordnung gilt für Behörden des Bundes, soweit sie Verwaltungsleistungen gegenüber natürlichen Personen erbringen.",
          "Sie gilt nicht für die Tätigkeit der Behörden im Bereich der Strafverfolgung, der Gefahrenabwehr im Einsatzfall, der Nachrichtendienste und der Streitkräfte.",
          "Rechtsvorschriften, die für einzelne Verwaltungsleistungen weitergehende Anforderungen stellen, bleiben unberührt.",
        ],
      },
      { t: "h3", text: "§ 2 Begriffsbestimmungen" },
      { t: "p", text: "Im Sinne dieser Verordnung ist oder sind:" },
      {
        t: "ol",
        items: [
          "Verwaltungsleistung: eine Leistung im Sinne des § 2 Absatz 3 des Onlinezugangsgesetzes sowie die Beantwortung von Anfragen zu einer solchen Leistung,",
          "Servicekanal: jeder von der Behörde angebotene Weg der Kontaktaufnahme, insbesondere Telefon, E-Mail, Kontaktformular, Postfach des Bürgerkontos, Brief und persönliche Vorsprache,",
          "Arbeitstage: Montag bis Freitag mit Ausnahme der gesetzlichen Feiertage am Dienstsitz der Behörde,",
          "Annahmequote: der Anteil der angenommenen Anrufe an allen Anrufen, die die Warteschleife der Behörde erreichen,",
          "Nutzerforschung: die systematische Einbeziehung von Menschen, die eine Verwaltungsleistung in Anspruch nehmen, insbesondere durch Befragungen, Interviews und Nutzertests.",
        ],
      },
      { t: "h3", text: "§ 3 Telefonische Erreichbarkeit" },
      {
        t: "ol",
        items: [
          "Behörden, die Verwaltungsleistungen mit mehr als 10.000 Fällen im Jahr erbringen, sind telefonisch mindestens montags bis donnerstags von 8 bis 16 Uhr und freitags von 8 bis 14 Uhr erreichbar.",
          "Die Annahmequote beträgt im Monatsmittel mindestens 85 Prozent. Die durchschnittliche Wartezeit soll fünf Minuten nicht überschreiten.",
          "Kann ein Anliegen nicht sofort geklärt werden, bietet die Behörde einen Rückruf an. Der Rückruf erfolgt innerhalb von zwei Arbeitstagen.",
          "Die Erreichbarkeit kann ganz oder teilweise über ein gemeinsames Servicecenter mehrerer Behörden sichergestellt werden.",
        ],
      },
      { t: "h3", text: "§ 4 Schriftliche und elektronische Anfragen" },
      {
        t: "ol",
        items: [
          "Schriftliche und elektronische Anfragen werden innerhalb von fünf Arbeitstagen beantwortet.",
          "Ist eine abschließende Antwort in dieser Frist nicht möglich, erhält die anfragende Person eine Zwischennachricht mit dem voraussichtlichen Zeitpunkt der Antwort und einer Kontaktmöglichkeit.",
          "Kontaktformulare müssen das Beifügen von Anlagen ermöglichen und dürfen die Länge der Nachricht nicht auf weniger als 4.000 Zeichen begrenzen.",
        ],
      },
      { t: "h3", text: "§ 5 Eingangsbestätigung und Bearbeitungsstand" },
      {
        t: "ol",
        items: [
          "Der Eingang eines Antrags wird innerhalb von drei Arbeitstagen bestätigt. Die Bestätigung nennt die voraussichtliche Bearbeitungsdauer, eine Kontaktmöglichkeit und gegebenenfalls fehlende Unterlagen.",
          "Bei elektronisch gestellten Anträgen ist der Bearbeitungsstand elektronisch abrufbar. Ändert sich der Bearbeitungsstand wesentlich, wird die antragstellende Person über den von ihr gewählten Servicekanal benachrichtigt.",
          "Überschreitet die Bearbeitung die in der Eingangsbestätigung genannte Dauer um mehr als 20 Prozent, informiert die Behörde unaufgefordert über die Gründe und die neue voraussichtliche Dauer.",
        ],
      },
      { t: "h3", text: "§ 6 Verständlichkeit" },
      {
        t: "ol",
        items: [
          "Bescheide, Formulare und Informationen sind in klarer, verständlicher Sprache abzufassen. Bescheiden ist eine kurze Zusammenfassung voranzustellen, die erklärt, was entschieden wurde und was die betroffene Person tun muss.",
          "Informationen zu den Verwaltungsleistungen werden zusätzlich in Leichter Sprache bereitgestellt; § 11 des Behindertengleichstellungsgesetzes bleibt unberührt.",
          "Neue oder wesentlich geänderte Formulare und Musterbescheide werden vor ihrer Einführung auf Verständlichkeit geprüft.",
        ],
      },
      { t: "h3", text: "§ 7 Barrierefreiheit digitaler Angebote" },
      {
        t: "ol",
        items: [
          "Digitale Verwaltungsleistungen sind nach der Barrierefreie-Informationstechnik-Verordnung (BITV 2.0) barrierefrei zu gestalten.",
          "Zeitbegrenzungen sind nur zulässig, wenn die nutzende Person rechtzeitig vor Ablauf gewarnt wird und die Frist durch eine einfache Handlung verlängern kann. Eingaben sind zwischenzuspeichern.",
          "Verfahren zur Unterscheidung von Menschen und Maschinen dürfen nicht eingesetzt werden, wenn sich die nutzende Person bereits elektronisch identifiziert hat. Im Übrigen ist eine barrierefreie Alternative anzubieten.",
          "Bestätigungen und Bescheide in elektronischer Form müssen barrierefrei lesbar sein.",
        ],
      },
      { t: "h3", text: "§ 8 Digitale Antragstellung" },
      {
        t: "ol",
        items: [
          "Daten und Nachweise, die der Behörde bereits vorliegen oder die sie mit Einwilligung der antragstellenden Person elektronisch abrufen kann, werden nicht erneut angefordert.",
          "Nachweise können in gängigen Dateiformaten, mindestens als PDF, JPG und PNG, übermittelt werden.",
          "Anträge können zwischengespeichert und innerhalb von 30 Tagen fortgesetzt werden.",
        ],
      },
      { t: "h3", text: "§ 9 Terminvergabe" },
      {
        t: "ol",
        items: [
          "Behörden, bei denen eine persönliche Vorsprache erforderlich ist, bieten eine elektronische Terminvergabe an.",
          "Ein Termin soll innerhalb von zehn Arbeitstagen nach der Anfrage angeboten werden. Die Behörde erinnert vor dem Termin über den gewählten Servicekanal und ermöglicht eine einfache Absage.",
        ],
      },
      { t: "h3", text: "§ 10 Nutzerforschung und Beteiligung" },
      {
        t: "ol",
        items: [
          "Vor der Einführung neuer oder wesentlich geänderter digitaler Verwaltungsleistungen führt die zuständige Behörde Nutzerforschung durch. Dazu gehören mindestens Nutzertests mit Personen, die die Leistung voraussichtlich in Anspruch nehmen, darunter Menschen mit Behinderungen und Menschen mit geringer digitaler Erfahrung.",
          "Die Ergebnisse und die daraus abgeleiteten Maßnahmen sind zu dokumentieren.",
        ],
      },
      { t: "h3", text: "§ 11 Beschwerdemanagement" },
      {
        t: "ol",
        items: [
          "Jede Behörde bietet eine einfache Möglichkeit, Rückmeldungen und Beschwerden zu ihren Verwaltungsleistungen abzugeben.",
          "Beschwerden werden innerhalb von zehn Arbeitstagen beantwortet. Sie werden regelmäßig ausgewertet; die Ergebnisse fließen in die Weiterentwicklung der Leistungen ein.",
        ],
      },
      { t: "h3", text: "§ 12 Servicebericht" },
      {
        t: "ol",
        items: [
          "Die Behörden berichten dem Bundesministerium für Verwaltungsdienste und Bürgerservice jährlich bis zum 31. März über die Einhaltung der Standards im Vorjahr.",
          "Das Bundesministerium für Verwaltungsdienste und Bürgerservice veröffentlicht jährlich einen zusammenfassenden Servicebericht.",
        ],
      },
      { t: "h3", text: "§ 13 Abweichungen und Übergangsregelung" },
      {
        t: "ol",
        items: [
          "Kann eine Behörde einen Standard nur mit unverhältnismäßigem Aufwand einhalten, darf sie bis zum 31. Dezember 2028 davon abweichen. Die Abweichung ist im Servicebericht zu begründen und mit einem Zeitplan zur Einhaltung zu versehen.",
          "§ 5 Absatz 2 Satz 1 ist auf elektronische Verfahren, die vor dem Inkrafttreten dieser Verordnung eingeführt wurden, erst ab dem 1. Januar 2028 anzuwenden.",
        ],
      },
      { t: "h3", text: "§ 14 Evaluierung" },
      { t: "p", text: "Die Bundesregierung evaluiert die Wirkungen dieser Verordnung fünf Jahre nach ihrem Inkrafttreten." },
      { t: "h3", text: "§ 15 Inkrafttreten" },
      { t: "p", text: "Diese Verordnung tritt am ersten Tag des sechsten auf die Verkündung folgenden Kalendermonats in Kraft." },
      { t: "pagebreak" },
      { t: "h1", text: "Begründung" },
      { t: "h2", text: "A. Allgemeiner Teil" },
      { t: "h3", text: "I. Zielsetzung und Notwendigkeit der Regelungen" },
      {
        t: "p",
        text: "Die Qualität einer Verwaltungsleistung entscheidet sich nicht nur an der Rechtmäßigkeit der Entscheidung, sondern auch daran, ob Menschen die Behörde erreichen, wissen, woran sie sind, und verstehen, was von ihnen verlangt wird. Die Erfahrungen der vergangenen Jahre zeigen erhebliche Unterschiede zwischen den Behörden des Bundes. Die Nutzerbefragung 2025 ergab die geringste Zufriedenheit beim Einstieg über das Bürgerkonto (3,1 von 5) und bei der Fahrtkostenerstattung für Ehrenamtliche (3,2 von 5); in den Freitextantworten wurden fehlende Eingangsbestätigungen, Zeitüberschreitungen in Online-Formularen und unverständliche Bescheide besonders häufig genannt.",
      },
      {
        t: "p",
        text: "Die Nutzertests zur digitalen Umzugsmeldung im Frühjahr 2025 haben zudem gezeigt, dass schon einzelne technische Hürden – eine Zeitbegrenzung ohne Vorwarnung oder ein grafisches CAPTCHA – Menschen mit Behinderungen vollständig von einer digitalen Verwaltungsleistung ausschließen können. Die Verordnung greift diese Erkenntnisse auf und schafft erstmals verbindliche Mindeststandards, die für alle Behörden des Bundes gleichermaßen gelten.",
      },
      { t: "h3", text: "II. Wesentlicher Inhalt des Entwurfs" },
      {
        t: "ul",
        items: [
          "Mindeststandards für die telefonische Erreichbarkeit einschließlich Rückrufservice (§ 3)",
          "Fristen für die Beantwortung schriftlicher und elektronischer Anfragen (§ 4)",
          "Eingangsbestätigung, elektronischer Bearbeitungsstand und Information bei Verzögerungen (§ 5)",
          "Verständliche Sprache und Informationen in Leichter Sprache (§ 6)",
          "Konkretisierung der Barrierefreiheit für typische Hürden in Online-Verfahren (§ 7)",
          "Grundsätze der digitalen Antragstellung, insbesondere Once-Only (§ 8)",
          "Elektronische Terminvergabe (§ 9)",
          "Pflicht zur Nutzerforschung vor Einführung digitaler Verwaltungsleistungen (§ 10)",
          "Beschwerdemanagement und jährlicher Servicebericht (§§ 11 und 12)",
        ],
      },
      { t: "h3", text: "III. Alternativen" },
      {
        t: "p",
        text: "Geprüft wurde, die Servicecharta von 2019 fortzuschreiben und durch Empfehlungen zu ergänzen. Diese Alternative wurde verworfen, weil eine freiwillige Selbstverpflichtung erkennbar nicht zu einheitlichen Mindeststandards geführt hat. Geprüft wurde ferner eine gesetzliche Regelung; die Verordnungsermächtigung im Verwaltungsservicegesetz erlaubt jedoch eine schnellere und flexiblere Anpassung der Standards an die technische Entwicklung.",
      },
      { t: "h3", text: "IV. Regelungskompetenz" },
      {
        t: "p",
        text: "Die Bundesregierung ist nach § 9 Absatz 1 des Verwaltungsservicegesetzes ermächtigt, durch Rechtsverordnung Mindeststandards für den Service bei Verwaltungsleistungen der Behörden des Bundes festzulegen. Die Verordnung bedarf nicht der Zustimmung des Bundesrates, da sie ausschließlich Behörden des Bundes verpflichtet.",
      },
      { t: "h3", text: "V. Vereinbarkeit mit dem Recht der Europäischen Union und völkerrechtlichen Verträgen" },
      {
        t: "p",
        text: "Der Entwurf ist mit dem Recht der Europäischen Union vereinbar. Er ergänzt die Anforderungen der Richtlinie (EU) 2016/2102 über den barrierefreien Zugang zu den Websites und mobilen Anwendungen öffentlicher Stellen und der Verordnung (EU) 2018/1724 über die Einrichtung eines einheitlichen digitalen Zugangstors. Er trägt zur Umsetzung des Übereinkommens der Vereinten Nationen über die Rechte von Menschen mit Behinderungen bei.",
      },
      { t: "h3", text: "VI. Regelungsfolgen" },
      { t: "p", text: "**1. Rechts- und Verwaltungsvereinfachung**" },
      {
        t: "p",
        text: "Die Verordnung führt bisher verstreute Empfehlungen zusammen und ersetzt die Servicecharta. Einheitliche Standards erleichtern Vergleiche zwischen Behörden und vereinfachen die Steuerung durch das Bundesministerium für Verwaltungsdienste und Bürgerservice.",
      },
      { t: "p", text: "**2. Nachhaltigkeitsaspekte**" },
      {
        t: "p",
        text: "Der Entwurf steht im Einklang mit den Zielen der Deutschen Nachhaltigkeitsstrategie, insbesondere mit dem Ziel leistungsfähiger, rechenschaftspflichtiger und transparenter Institutionen. Durch weniger Nachfragen, Wege und erneute Antragstellungen werden zudem Ressourcen geschont.",
      },
      { t: "p", text: "**3. Haushaltsausgaben ohne Erfüllungsaufwand**" },
      { t: "p", text: "Keine." },
      { t: "p", text: "**4. Erfüllungsaufwand**" },
      {
        t: "p",
        text: "a) Bürgerinnen und Bürger: Es entsteht kein zusätzlicher Erfüllungsaufwand. Die Entlastung durch vermiedene Nachfragen und Wege wird auf rund 1,9 Millionen Stunden jährlich geschätzt (Grundlage: rund 5,7 Millionen Anträge und Anfragen pro Jahr, durchschnittlich 20 Minuten Ersparnis je Vorgang).",
      },
      { t: "p", text: "b) Wirtschaft: Für die Wirtschaft entsteht kein Erfüllungsaufwand." },
      {
        t: "p",
        text: "c) Verwaltung: Der Erfüllungsaufwand der Verwaltung des Bundes wurde auf Grundlage einer Abfrage bei 31 Behörden im Oktober 2025 geschätzt. Danach entsteht ein jährlicher Erfüllungsaufwand von rund **12,4 Mio. Euro** und ein einmaliger Erfüllungsaufwand von rund 8,9 Mio. Euro:",
      },
      {
        t: "table",
        header: ["Vorgabe", "jährlicher Aufwand", "einmaliger Aufwand"],
        rows: [
          ["§ 3 Telefonische Erreichbarkeit, Rückrufservice (zusätzliches Personal in Servicecentern)", "6,1 Mio. €", "–"],
          ["§ 5 Eingangsbestätigung und Bearbeitungsstand", "1,2 Mio. €", "2,8 Mio. €"],
          ["§ 7 Barrierefreiheit digitaler Angebote", "2,3 Mio. €", "4,6 Mio. €"],
          ["§ 9 Elektronische Terminvergabe", "0,9 Mio. €", "1,1 Mio. €"],
          ["§ 10 Nutzerforschung", "1,5 Mio. €", "–"],
          ["§ 12 Servicebericht", "0,4 Mio. €", "–"],
          ["Schulung der Beschäftigten (verständliche Sprache, Barrierefreiheit)", "–", "0,4 Mio. €"],
          ["Summe", "12,4 Mio. €", "8,9 Mio. €"],
        ],
        widths: [6, 2, 2],
      },
      {
        t: "p",
        text: "Für Länder und Kommunen entsteht kein Erfüllungsaufwand, da die Verordnung nur Behörden des Bundes verpflichtet. Soweit Länder und Kommunen die Standards freiwillig übernehmen, entstehen ihnen Kosten nur auf Grund eigener Entscheidung.",
      },
      { t: "p", text: "**5. Weitere Kosten**" },
      { t: "p", text: "Keine." },
      { t: "p", text: "**6. Weitere Regelungsfolgen**" },
      {
        t: "p",
        text: "Die Verordnung wirkt sich positiv auf Menschen mit Behinderungen, ältere Menschen und Menschen mit geringen Deutschkenntnissen aus, die von verständlicher Sprache, barrierefreien Angeboten und erreichbaren Ansprechpersonen in besonderem Maß profitieren. Gleichstellungspolitische Auswirkungen sind nicht zu erwarten. Demografische Auswirkungen sind insoweit gegeben, als die Verordnung den Zugang älterer Menschen zu Verwaltungsleistungen erleichtert. Die Gleichwertigkeit der Lebensverhältnisse wird gestärkt, da der Zugang zu Leistungen des Bundes nicht vom Wohnort abhängt.",
      },
      { t: "h3", text: "VII. Befristung; Evaluierung" },
      {
        t: "p",
        text: "Eine Befristung ist nicht vorgesehen, da die Standards dauerhaft gelten sollen. Die Verordnung wird fünf Jahre nach Inkrafttreten evaluiert. Dabei wird insbesondere untersucht, ob sich Erreichbarkeit und Zufriedenheit messbar verbessert haben. Indikatoren sind die Annahmequote, die Einhaltung der Fristen nach §§ 4 und 5, die Zufriedenheitswerte der Nutzerbefragung und die Zahl der Abweichungen nach § 13.",
      },
      { t: "h2", text: "B. Besonderer Teil" },
      { t: "h3", text: "Zu § 1 (Anwendungsbereich)" },
      {
        t: "p",
        text: "Die Verordnung erfasst alle Behörden des Bundes, die Verwaltungsleistungen gegenüber natürlichen Personen erbringen. Leistungen gegenüber Unternehmen sind zunächst nicht einbezogen; eine Ausweitung wird im Rahmen der Evaluierung geprüft. Ausgenommen sind Bereiche, in denen die Eigenart der Aufgabe einheitlichen Servicestandards entgegensteht.",
      },
      { t: "h3", text: "Zu § 2 (Begriffsbestimmungen)" },
      {
        t: "p",
        text: "Der Begriff der Verwaltungsleistung knüpft an das Onlinezugangsgesetz an und wird um die Beantwortung von Anfragen ergänzt, da gerade hier die Erfahrungen der Nutzenden besonders unterschiedlich sind. Die Annahmequote bezieht sich auf alle Anrufe, die die Warteschleife erreichen; Anrufe, die wegen Überlastung abgewiesen werden, zählen als nicht angenommen.",
      },
      { t: "h3", text: "Zu § 3 (Telefonische Erreichbarkeit)" },
      {
        t: "p",
        text: "Die Schwelle von 10.000 Fällen im Jahr stellt sicher, dass kleine Behörden mit wenigen Bürgerkontakten nicht unverhältnismäßig belastet werden. Die Annahmequote von 85 Prozent orientiert sich an den Werten der besten Servicecenter des Bundes. Der Rückrufservice soll verhindern, dass Anrufende mehrfach anrufen müssen; der Rückruf hat **binnen drei Arbeitstagen** zu erfolgen. Absatz 4 ermöglicht die Bündelung in gemeinsamen Servicecentern, die insbesondere für kleinere Behörden wirtschaftlich sinnvoll ist.",
      },
      { t: "h3", text: "Zu § 4 (Schriftliche und elektronische Anfragen)" },
      {
        t: "p",
        text: "Die Frist von fünf Arbeitstagen gilt für die Beantwortung, nicht für die abschließende Bearbeitung eines Antrags. Die Mindestlänge für Kontaktformulare greift Rückmeldungen aus der Nutzerbefragung auf, nach denen die bisherige Begrenzung auf 1.000 Zeichen eine vollständige Schilderung des Anliegens verhinderte.",
      },
      { t: "h3", text: "Zu § 5 (Eingangsbestätigung und Bearbeitungsstand)" },
      {
        t: "p",
        text: "Die Eingangsbestätigung schafft Gewissheit, dass ein Antrag angekommen ist, und reduziert Nachfragen. Die Angabe der voraussichtlichen Bearbeitungsdauer beruht auf Erfahrungswerten der Behörde; sie ist keine Zusicherung im Sinne des § 38 des Verwaltungsverfahrensgesetzes. Die elektronische Abrufbarkeit des Bearbeitungsstands setzt voraus, dass das Fachverfahren Statusinformationen bereitstellt; für bestehende Verfahren sieht § 13 Absatz 2 eine Übergangsfrist vor.",
      },
      { t: "h3", text: "Zu § 6 (Verständlichkeit)" },
      {
        t: "p",
        text: "Die vorangestellte Zusammenfassung soll Bescheide nicht ersetzen, sondern ihren Kern in wenigen Sätzen verständlich machen. Die Bereitstellung von Informationen in Leichter Sprache ergänzt die Verpflichtungen aus § 11 des Behindertengleichstellungsgesetzes. Die Prüfung auf Verständlichkeit kann durch Nutzertests oder durch geschulte Prüferinnen und Prüfer erfolgen.",
      },
      { t: "h3", text: "Zu § 7 (Barrierefreiheit digitaler Angebote)" },
      {
        t: "p",
        text: "Absatz 1 stellt klar, dass die BITV 2.0 uneingeschränkt gilt. Die Absätze 2 bis 4 greifen typische Hürden auf, die sich in Nutzertests als besonders gravierend erwiesen haben: Zeitbegrenzungen ohne Warnung, grafische Prüfverfahren und nicht lesbare Bestätigungen. Wer sich bereits über das Bürgerkonto identifiziert hat, muss nicht zusätzlich nachweisen, dass er keine Maschine ist.",
      },
      { t: "h3", text: "Zu § 8 (Digitale Antragstellung)" },
      {
        t: "p",
        text: "Absatz 1 konkretisiert den Once-Only-Grundsatz für Behörden des Bundes und knüpft an die Arbeiten zur Registermodernisierung an. Absatz 2 trägt dem Umstand Rechnung, dass viele Menschen Nachweise mit dem Smartphone fotografieren. Absatz 3 vermeidet, dass begonnene Anträge verloren gehen.",
      },
      { t: "h3", text: "Zu § 9 (Terminvergabe)" },
      {
        t: "p",
        text: "Die Regelung betrifft nur Behörden mit Publikumsverkehr. Die Erinnerung vor dem Termin und die einfache Absage sollen die Zahl nicht wahrgenommener Termine senken, die in kommunalen Bürgerämtern teils bei rund 30 Prozent liegt.",
      },
      { t: "h3", text: "Zu § 10 (Nutzerforschung und Beteiligung)" },
      {
        t: "p",
        text: "Nutzerforschung vor der Einführung ist erheblich wirtschaftlicher als die nachträgliche Korrektur. Die Vorschrift legt keine bestimmte Methode fest, verlangt aber mindestens Nutzertests mit einer vielfältigen Gruppe von Teilnehmenden. Das Bundesministerium für Verwaltungsdienste und Bürgerservice unterstützt die Behörden mit einem Methodenleitfaden und einem Pool von Testpersonen.",
      },
      { t: "h3", text: "Zu § 11 (Beschwerdemanagement)" },
      {
        t: "p",
        text: "Beschwerden sind eine wertvolle Quelle für Verbesserungen. Die Frist von zehn Arbeitstagen trägt dem Umstand Rechnung, dass Beschwerden häufig eine Rücksprache mit der bearbeitenden Stelle erfordern. Dienstaufsichtsbeschwerden und förmliche Rechtsbehelfe bleiben unberührt.",
      },
      { t: "h3", text: "Zu § 12 (Servicebericht)" },
      {
        t: "p",
        text: "Der Servicebericht schafft Transparenz und ermöglicht die Steuerung. Das Bundesministerium für Verwaltungsdienste und Bürgerservice stellt ein einheitliches Berichtsmuster bereit; die Angaben sollen weitgehend automatisiert aus den Fachverfahren und Telefonanlagen gewonnen werden.",
      },
      { t: "h3", text: "Zu § 13 (Abweichungen und Übergangsregelung)" },
      {
        t: "p",
        text: "Die Übergangsregelung berücksichtigt, dass insbesondere die elektronische Statusabfrage in bestehenden Fachverfahren nicht kurzfristig umgesetzt werden kann. Abweichungen sind zu begründen und mit einem Zeitplan zu versehen, damit sie nicht zum Dauerzustand werden.",
      },
      { t: "h3", text: "Zu § 14 (Evaluierung)" },
      { t: "p", text: "Auf die Ausführungen unter A. VII. wird verwiesen." },
      { t: "h3", text: "Zu § 15 (Inkrafttreten)" },
      {
        t: "p",
        text: "Der zeitliche Vorlauf von rund sechs Monaten gibt den Behörden Gelegenheit, ihre Abläufe anzupassen, Personal zu schulen und die technischen Voraussetzungen zu schaffen.",
      },
    ],
  },
  {
    type: "word",
    id: "bmvb-leitungsvorlage-billigung-refe-servstv",
    title: "Leitungsvorlage: Billigung des Referentenentwurfs der Servicestandardverordnung",
    kind: "Leitungsvorlage",
    fileName: "2026-01-27 Vorlage StS Billigung RefE ServStV",
    org: "bmvb",
    unit: "bmvb-b3",
    author: "bmvb-kuehnel",
    date: "2026-01-27",
    keywords: ["B 3 – 12010/3#4", "Votum", "Mitzeichnung", "Länder- und Verbändebeteiligung", "ServStV"],
    summary:
      "Vorlage an die Staatssekretärin mit Votum, Sachverhalt, Bewertung, Zeitplan und Mitzeichnungsleiste zur Billigung des Referentenentwurfs der Servicestandardverordnung; Haushaltsreferat zeichnet nur mit Maßgabe mit – gut zum Kürzen auf einen Sprechzettel oder zum Prüfen der Bedenken.",
    meta: [
      ["Aktenzeichen", "B 3 – 12010/3#4"],
      ["Referatsleiter", "RD Kühnel, App. 330"],
      ["Referentin", "ORRin Dr. Lorenzen, App. 352"],
    ],
    recipient: ["Frau Staatssekretärin Dr. Adomeit", "über", "Herrn Abteilungsleiter B (Dr. Reichel)"],
    subject:
      "Verordnung über Mindeststandards für den Service bei Verwaltungsleistungen des Bundes (Servicestandardverordnung – ServStV); hier: Billigung des Referentenentwurfs und Einleitung der Ressortabstimmung sowie der Länder- und Verbändebeteiligung",
    blocks: [
      { t: "p", text: "**Bezug:** Leitungsentscheidung vom 14.10.2025 zu den Eckpunkten der ServStV" },
      { t: "p", text: "**Anlagen:** 1. Referentenentwurf (Bearbeitungsstand 20.01.2026) – 2. Zeitplan" },
      { t: "h2", text: "1. Votum" },
      {
        t: "p",
        text: "Billigung des als Anlage 1 beigefügten Referentenentwurfs und Zustimmung zur Einleitung der Ressortabstimmung sowie der Länder- und Verbändebeteiligung mit einer Frist von vier Wochen.",
      },
      { t: "h2", text: "2. Sachverhalt" },
      {
        t: "p",
        text: "Sie haben am 14.10.2025 die Eckpunkte für eine Verordnung über Servicestandards gebilligt. Referat B 3 hat auf dieser Grundlage den Referentenentwurf erarbeitet und mit den Referaten B 1, B 2, D 1, Z I 2 sowie dem Leitungsbereich abgestimmt. Kernpunkte des Entwurfs:",
      },
      {
        t: "ul",
        items: [
          "Telefonische Erreichbarkeit mit einer Annahmequote von mindestens 85 Prozent im Monatsmittel und Rückruf innerhalb von zwei Arbeitstagen (§ 3)",
          "Eingangsbestätigung binnen drei Arbeitstagen, elektronischer Bearbeitungsstand (§ 5; Übergangsfrist für bestehende Verfahren bis 01.01.2028)",
          "Verständliche Bescheide mit vorangestellter Zusammenfassung, Informationen in Leichter Sprache (§ 6)",
          "Konkrete Anforderungen an die Barrierefreiheit: keine Zeitbegrenzung ohne Warnung, kein CAPTCHA nach elektronischer Identifizierung (§ 7)",
          "Pflicht zur Nutzerforschung vor Einführung neuer digitaler Leistungen (§ 10) und jährlicher Servicebericht (§ 12)",
        ],
      },
      {
        t: "p",
        text: "Der jährliche Erfüllungsaufwand der Verwaltung des Bundes wird auf 12,4 Mio. € geschätzt, der einmalige auf 8,9 Mio. €. Er fällt in den Einzelplänen der jeweils betroffenen Behörden an. Für Länder und Kommunen entsteht kein Erfüllungsaufwand; die Bund-Länder-Arbeitsgruppe Servicestandards prüft eine freiwillige Übernahme.",
      },
      { t: "h2", text: "3. Bewertung" },
      {
        t: "p",
        text: "Der Entwurf setzt die Eckpunkte vollständig um und greift die Ergebnisse der Nutzerbefragung 2025 und der Nutzertests zur digitalen Umzugsmeldung auf. Er ist geeignet, die Servicequalität des Bundes sichtbar zu verbessern, und eignet sich auch als Vorbild für Länder und Kommunen.",
      },
      { t: "p", text: "Folgende Punkte sind in der Ressortabstimmung kritisch zu erwarten:" },
      {
        t: "ol",
        items: [
          "**Annahmequote:** Mehrere Behörden mit großen Servicecentern liegen derzeit zwischen 70 und 80 Prozent. Eine Absenkung auf 80 Prozent wäre vertretbar, würde aber das Signal der Verordnung schwächen. Referat B 3 empfiehlt, an 85 Prozent festzuhalten und auf die Abweichungsmöglichkeit nach § 13 zu verweisen.",
          "**Erfüllungsaufwand:** Es ist mit der Forderung zu rechnen, den Mehrbedarf zentral zu finanzieren. Referat Z I 2 hat mit der Maßgabe mitgezeichnet, dass im Einzelplan des BMVB 2026 keine zusätzlichen Mittel bereitstehen.",
          "**Personal B 3:** Die Personalbedarfsermittlung 2025 weist für das Referat bereits ohne die neuen Aufgaben einen geringen Mehrbedarf aus. Für Servicebericht, Methodenleitfaden und Testpersonenpool werden zusätzlich rund 2,0 Vollzeitäquivalente benötigt; dies wird zum Haushalt 2027 angemeldet.",
        ],
      },
      { t: "h2", text: "4. Kommunikation" },
      {
        t: "p",
        text: "Referat L 2 empfiehlt, den Referentenentwurf mit Beginn der Verbändebeteiligung auf der Internetseite des Ministeriums zu veröffentlichen und von einer eigenen Pressemitteilung abzusehen. Eine Pressemitteilung ist zum Kabinettbeschluss vorgesehen.",
      },
      { t: "h2", text: "5. Zeitplan" },
      {
        t: "table",
        header: ["Schritt", "Termin"],
        rows: [
          ["Billigung durch die Staatssekretärin", "bis 30.01.2026"],
          ["Ressortabstimmung, Länder- und Verbändebeteiligung", "02.02. bis 02.03.2026"],
          ["Auswertung der Stellungnahmen, ggf. Anhörung", "März 2026"],
          ["Leitungsvorlage zur Kabinettbefassung", "Juni 2026"],
          ["Kabinettbeschluss", "3. Quartal 2026"],
          ["Inkrafttreten (sechs Monate nach Verkündung)", "voraussichtlich 1. Halbjahr 2027"],
        ],
        widths: [5, 2],
      },
      { t: "h2", text: "Mitzeichnungsleiste" },
      {
        t: "table",
        header: ["Organisationseinheit", "Name", "Datum", "Ergebnis"],
        rows: [
          ["Referat B 1", "Yavuz", "23.01.2026", "mitgezeichnet"],
          ["Referat B 2", "Sandmann", "23.01.2026", "mitgezeichnet"],
          ["Referat D 1", "Richter", "26.01.2026", "mitgezeichnet mit Hinweis: elektronische Statusabfrage in Altverfahren nicht vor 2028"],
          ["Referat Z I 2", "Prinz", "26.01.2026", "mitgezeichnet mit Maßgabe: keine zusätzlichen Haushaltsmittel 2026"],
          ["Referat L 1", "Brenner", "26.01.2026", "zur Kenntnis"],
          ["Referat L 2", "Hecker", "27.01.2026", "mitgezeichnet"],
        ],
        widths: [2, 2, 2, 5],
      },
      { t: "signature", lines: ["Kühnel", "Referatsleiter B 3", "", "Dr. Lorenzen", "Referentin"] },
      { t: "note", text: "Entscheidung der Staatssekretärin:  [ ] gebilligt   [ ] nicht gebilligt   [ ] Rücksprache erbeten" },
    ],
  },
  {
    type: "powerpoint",
    id: "bmvb-blag-servicestandards-3-sitzung",
    title: "Bund-Länder-Arbeitsgruppe Servicestandards – 3. Sitzung",
    kind: "Präsentation",
    fileName: "BLAG Servicestandards 3. Sitzung 2025-11-25",
    org: "bmvb",
    unit: "bmvb-b2",
    author: "bmvb-sandmann",
    date: "2025-11-19",
    keywords: ["Länderabfrage", "Kernstandards", "Konnexität", "Annahmequote", "632 01"],
    summary:
      "Präsentation des Bundes für die 3. Sitzung der Bund-Länder-Arbeitsgruppe: Ergebnisse einer Länderabfrage, Entwurf gemeinsamer Kernstandards mit den Rückmeldungen der Länder, Fragen der kommunalen Ebene und Zeitplan – gut, um ein Ergebnisprotokoll oder eine Stellungnahme aus Sicht eines Landes zu entwerfen.",
    slides: [
      { t: "title", title: "Bund-Länder-Arbeitsgruppe Servicestandards", subtitle: "3. Sitzung am 25. November 2025 · Berlin und Videokonferenz" },
      {
        t: "bullets",
        title: "Tagesordnung",
        bullets: [
          "TOP 1 Begrüßung, Genehmigung des Protokolls der 2. Sitzung",
          "TOP 2 Ergebnisse der Länderabfrage",
          "TOP 3 Entwurf gemeinsamer Kernstandards",
          "TOP 4 Kommunale Ebene",
          "TOP 5 Zeitplan und Verschiedenes",
        ],
      },
      {
        t: "bullets",
        title: "Auftrag und Stand",
        bullets: [
          "Auftrag der Konferenz der Staatssekretärinnen und Staatssekretäre für Verwaltungsmodernisierung vom Mai 2025",
          { text: "Ziel: gemeinsame Kernstandards für den Service bei Verwaltungsleistungen bis Ende 2026", sub: ["Bund regelt für seine Behörden verbindlich (Eckpunkte gebilligt am 14.10.2025)", "Länder entscheiden selbst über Übernahme"] },
          "2. Sitzung am 16.09.2025: Länderabfrage beschlossen",
          "Heute: Ergebnisse besprechen, Entwurf der Kernstandards beraten",
        ],
        notes: "Hinweis für Herrn Sandmann: Zwei Länder haben angekündigt, zu TOP 3 nur unter Vorbehalt der Hausleitung Stellung zu nehmen.",
      },
      {
        t: "chart",
        title: "Länderabfrage: Wo gibt es schon verbindliche Standards?",
        chart: {
          type: "bar",
          categories: ["Erreichbarkeit", "Eingangsbestätigung", "Bearbeitungsstand online", "Verständliche Sprache", "Barrierefreiheit über BITV hinaus", "Nutzerbeteiligung"],
          series: [
            { name: "verbindlich geregelt", values: [4, 6, 2, 3, 1, 1] },
            { name: "in Planung", values: [5, 3, 6, 4, 3, 5] },
          ],
          unit: "Länder",
        },
        caption: "13 von 16 Ländern haben geantwortet (Stand 14.11.2025)",
        notes: "Drei Länder haben bis heute nicht geantwortet; eine Nachfrist bis 05.12.2025 wurde eingeräumt.",
      },
      {
        t: "table",
        title: "Entwurf der Kernstandards und Rückmeldungen",
        header: ["Standard", "Vorschlag Bund", "Rückmeldung der Länder"],
        rows: [
          ["Telefonische Erreichbarkeit", "Annahmequote 85 %, Rückruf binnen 2 Arbeitstagen", "7 zustimmend, 4 halten die Quote für zu hoch, 2 ohne Votum"],
          ["Eingangsbestätigung", "binnen 3 Arbeitstagen mit voraussichtlicher Dauer", "breite Zustimmung"],
          ["Bearbeitungsstand", "elektronisch abrufbar", "9 Länder: technisch erst ab 2028 möglich"],
          ["Verständlichkeit", "Zusammenfassung vor Bescheiden, Leichte Sprache", "Zustimmung"],
          ["Barrierefreiheit", "keine Zeitgrenze ohne Warnung, kein CAPTCHA nach Identifizierung", "Zustimmung"],
          ["Nutzerbeteiligung", "Nutzertests vor Einführung", "5 Länder: fehlende Ressourcen"],
        ],
        notes: "Die Annahmequote ist der Hauptstreitpunkt. Kompromisslinie aus Sicht B 2: 85 % als Zielwert, 80 % als Mindestwert in den ersten zwei Jahren – noch nicht mit B 3 abgestimmt.",
      },
      {
        t: "twocol",
        title: "Kommunale Ebene",
        left: {
          heading: "Positionen der Länder",
          bullets: [
            "Kommunen erbringen den Großteil der Verwaltungsleistungen",
            "Verbindliche Standards lösen Konnexität aus",
            "Kommunale Spitzenverbände frühzeitig einbinden",
          ],
        },
        right: {
          heading: "Vorschlag des Bundes",
          bullets: [
            "Kernstandards für Kommunen als Empfehlung",
            "Förderung von Pilotkommunen (Titel 632 01: 4,0 Mio. € im Regierungsentwurf 2026)",
            "Erfahrungen aus dem Pilot „Digitale Umzugsmeldung“ in Falkenbrück, Altmoor und Brackenhain nutzen",
          ],
        },
      },
      {
        t: "bullets",
        title: "Beispiele aus den Ländern",
        bullets: [
          { text: "Ein Land fördert Kommunen mit dem Programm „Digitale Kommune“", sub: ["20 Mio. € je Jahr, Förderquote bis 75 %", "Servicestandards könnten Fördervoraussetzung werden"] },
          "Dasselbe Land hat im November 2025 einen KI-Leitfaden für die Landesverwaltung veröffentlicht – Anregung: Standards auch für KI-gestützte Bürgerkommunikation",
          "Zwei Länder messen die Annahmequote bereits monatlich und veröffentlichen sie",
        ],
        notes: "Länder werden im Vortrag nicht namentlich genannt; die Beispiele sind mit den Ländern abgestimmt.",
      },
      {
        t: "table",
        title: "Zeitplan",
        header: ["Schritt", "Termin"],
        rows: [
          ["Stellungnahmen der Länder zum Entwurf der Kernstandards", "bis 31.01.2026"],
          ["Referentenentwurf ServStV (Bund): Länder- und Verbändebeteiligung", "Februar 2026"],
          ["4. Sitzung", "24.03.2026"],
          ["Abschlussbericht an die Staatssekretärskonferenz", "Herbst 2026"],
        ],
      },
      {
        t: "bullets",
        title: "Beschlussvorschläge für heute",
        bullets: [
          "Die AG nimmt die Ergebnisse der Länderabfrage zur Kenntnis.",
          "Die Länder übermitteln ihre Stellungnahmen zu den Kernstandards bis 31.01.2026.",
          "Eine Unter-AG „Kommunen“ unter Beteiligung der kommunalen Spitzenverbände wird eingerichtet.",
        ],
      },
      { t: "end", title: "Vielen Dank", lines: ["Philipp Sandmann · Referat B 2 – Verwaltungskooperation mit Ländern und Kommunen", "Telefon 030 23125-320"] },
    ],
  },
  {
    type: "excel",
    id: "bmvb-meilensteinplan-registermodernisierung",
    title: "Zeit- und Meilensteinplan Registermodernisierung – Stand April 2026",
    kind: "Projektplan",
    fileName: "Meilensteinplan Registermodernisierung Stand 2026-04",
    org: "bmvb",
    unit: "bmvb-d2",
    author: "bmvb-terhorst",
    date: "2026-04-14",
    tags: ["zahlen", "widersprueche"],
    keywords: ["M-09", "Datenschutzcockpit", "Nachweisabruf", "IDNrG", "Verzug (Tage)"],
    summary:
      "Projektplan mit 15 Meilensteinen, Registerübersicht und Budget 2025–2027. Eingebaute Widersprüche: M-06 weist 30 statt rund 92 Tage Verzug aus, M-09 steht trotz Prognose Ende Mai auf „abgeschlossen“, M-07 soll vor dem Meilenstein fertig werden, von dem er abhängt, und die Gesamtbewertung meldet „im Zeitplan“, obwohl der Abschluss auf März 2027 rutscht.",
    sheets: [
      {
        name: "Meilensteine",
        title: "Registermodernisierung – Zeit- und Meilensteinplan",
        subtitle: "Stand: 14.04.2026 · Referat D 2 · Verzug = Prognose minus Plan in Kalendertagen",
        columns: [
          { header: "Nr.", width: 7 },
          { header: "Arbeitspaket", width: 24 },
          { header: "Meilenstein", width: 52 },
          { header: "verantwortlich", width: 22 },
          { header: "Plan", width: 12, fmt: "date" },
          { header: "Prognose / Ist", width: 13, fmt: "date" },
          { header: "Verzug (Tage)", width: 11, fmt: "int" },
          { header: "Ampel", width: 8 },
          { header: "Status", width: 14 },
          { header: "abhängig von", width: 13 },
        ],
        rows: [
          ["M-01", "AP 1 Steuerung", "Projektauftrag und Governance beschlossen", "D 2", { date: "2025-01-31" }, { date: "2025-01-31" }, 0, "grün", "abgeschlossen", "–"],
          ["M-02", "AP 2 Identifikationsnummer", "Identifikationsnummer in sechs Basisregister übernommen", "D 2 / Registerbehörden", { date: "2025-06-30" }, { date: "2025-09-30" }, 92, "grün", "abgeschlossen", "M-01"],
          ["M-03", "AP 2 Identifikationsnummer", "Qualitätssicherung der Datenbestände (Dublettenbereinigung) abgeschlossen", "Registerbehörden", { date: "2025-12-31" }, { date: "2026-03-31" }, 90, "grün", "abgeschlossen", "M-02"],
          ["M-04", "AP 3 Datenschutzcockpit", "Datenschutzcockpit Version 1.0 produktiv", "D 2 / IT-Dienstleister", { date: "2025-10-31" }, { date: "2026-02-27" }, 119, "grün", "abgeschlossen", "M-01"],
          ["M-05", "AP 3 Datenschutzcockpit", "Zwölf Register an das Datenschutzcockpit angebunden", "D 2", { date: "2026-06-30" }, { date: "2026-09-30" }, 92, "gelb", "in Arbeit", "M-04"],
          ["M-06", "AP 4 Nachweisabruf", "Nachweisabruf aus dem Melderegister produktiv", "D 2 / Länder", { date: "2026-03-31" }, { date: "2026-07-01" }, 30, "rot", "in Arbeit", "M-03"],
          ["M-07", "AP 4 Nachweisabruf", "Nachweisabruf Personenstandsregister (Geburtsurkunde) produktiv", "D 2 / Länder", { date: "2026-06-30" }, { date: "2026-06-30" }, 0, "grün", "in Arbeit", "M-05"],
          ["M-08", "AP 4 Nachweisabruf", "Nachweisabruf aus dem Fahrzeugregister produktiv", "D 2", { date: "2026-09-30" }, { date: "2026-12-18" }, 79, "rot", "offen", "M-05"],
          ["M-09", "AP 5 Architektur", "Vermittlungsstellen für den bereichsübergreifenden Datenaustausch in Betrieb", "IT-Dienstleister", { date: "2026-03-31" }, { date: "2026-05-29" }, 59, "grün", "abgeschlossen", "M-04"],
          ["M-10", "AP 5 Architektur", "Lasttest mit 50 Mio. Abrufen pro Jahr bestanden", "IT-Dienstleister", { date: "2026-05-29" }, { date: "2026-06-30" }, 32, "gelb", "offen", "M-09"],
          ["M-11", "AP 6 Länder und Kommunen", "Verwaltungsvereinbarung mit den Ländern unterzeichnet", "B 2 / D 2", { date: "2025-11-30" }, { date: "2026-02-13" }, 75, "grün", "abgeschlossen", "M-01"],
          ["M-12", "AP 6 Länder und Kommunen", "Kommunale Fachverfahren Meldewesen in den Pilotkommunen angeschlossen", "Länder / Kommunen", { date: "2026-09-30" }, { date: "2026-11-30" }, 61, "gelb", "offen", "M-06"],
          ["M-13", "AP 7 Recht", "Formulierungshilfe zur Änderung des IDNrG (weitere Register) im Kabinett", "D 2 / L 1", { date: "2026-04-29" }, { date: "2026-07-15" }, 77, "gelb", "in Arbeit", "–"],
          ["M-14", "AP 8 Kommunikation", "Informationskampagne zum Datenschutzcockpit gestartet", "L 2", { date: "2026-09-01" }, { date: "2026-10-01" }, 30, "grün", "offen", "M-05"],
          ["M-15", "AP 1 Steuerung", "Abschlussbericht und Übergabe in den Regelbetrieb", "D 2", { date: "2026-12-31" }, { date: "2027-03-31" }, 90, "gelb", "offen", "M-08, M-12"],
          { total: true, cells: ["", "", "Durchschnittlicher Verzug", "", null, null, { f: "ROUND(AVERAGE(G{first}:G{last}),0)" }, "", "", ""] },
        ],
        notes: [
          "Gesamtbewertung Referat D 2: Projekt im Zeitplan, Abschluss zum 31.12.2026 gesichert.",
          "Verzug M-04: Lieferverzug des IT-Dienstleisters bei der Schnittstelle zu den Registern; Vertragsstrafe wird geprüft.",
          "Verzug M-06: Zwei Länder haben die Anbindung ihrer Meldedatenbestände noch nicht abgeschlossen.",
          "Nächste Aktualisierung zum Steuerungskreis am 12.05.2026.",
        ],
      },
      {
        name: "Register",
        title: "Register im Projekt – Umsetzungsstand",
        subtitle: "Stand: 14.04.2026 · Welle 1 = bis 2026, Welle 2 = 2027, Welle 3 = nach Änderung des IDNrG",
        columns: [
          { header: "Nr.", width: 5, fmt: "int" },
          { header: "Register", width: 46 },
          { header: "registerführende Stelle", width: 40 },
          { header: "Datensätze (Mio.)", width: 12, fmt: "dec" },
          { header: "Identifikationsnummer übernommen", width: 16 },
          { header: "Datenschutzcockpit angebunden", width: 16 },
          { header: "Nachweisabruf", width: 16 },
          { header: "Welle", width: 7, fmt: "int" },
        ],
        rows: [
          [1, "Melderegister", "Meldebehörden der Kommunen", 84.7, "ja", "ja", "in Vorbereitung", 1],
          [2, "Personenstandsregister", "Standesämter der Kommunen", 61.2, "ja", "ja", "in Vorbereitung", 1],
          [3, "Ausländerzentralregister", "Bundesbehörde (anderes Ressort)", 14.1, "ja", "ja", "nein", 1],
          [4, "Fahrzeugregister", "zentrale Registerbehörde des Bundes", 69.4, "ja", "nein", "in Vorbereitung", 1],
          [5, "Fahrerlaubnisregister", "zentrale Registerbehörde des Bundes", 54.8, "ja", "nein", "nein", 2],
          [6, "Versichertenkonten der Rentenversicherung", "Träger der Rentenversicherung", 57.9, "ja", "ja", "aktiv", 1],
          [7, "Basisdaten der Identifikationsnummer", "Bundesfinanzverwaltung", 84.9, "ja", "ja", "entfällt", 1],
          [8, "Gewerberegister", "Gewerbeämter der Kommunen", 4.2, "nein", "nein", "nein", 3],
          [9, "Schuldnerverzeichnis", "zentrale Vollstreckungsgerichte der Länder", 4.6, "nein", "nein", "nein", 3],
          [10, "Nationales Waffenregister", "Waffenbehörden der Länder und Kommunen", 0.9, "ja", "ja", "nein", 2],
          [11, "Ausbildungsförderung (Bestandsdaten)", "Ämter für Ausbildungsförderung", 0.6, "ja", "nein", "nein", 2],
          [12, "Elterngeld (Bestandsdaten)", "Elterngeldstellen der Länder", 1.8, "nein", "nein", "nein", 3],
          [13, "Wohngeld (Bestandsdaten)", "Wohngeldbehörden der Kommunen", 1.2, "nein", "nein", "nein", 3],
          [14, "Feststellungen nach dem SGB IX", "Versorgungsverwaltung der Länder", 7.9, "nein", "nein", "nein", 3],
          [15, "Kindergeld", "Familienkassen", 17.3, "ja", "ja", "aktiv", 1],
          [16, "Arbeitsförderung und Grundsicherung (Kundendaten)", "Arbeitsverwaltung und Jobcenter", 9.8, "ja", "ja", "nein", 2],
          [17, "Versichertenverzeichnis der Krankenversicherung", "Krankenkassen", 74.3, "ja", "nein", "nein", 2],
          [18, "Bewacherregister", "Registerbehörde des Bundes", 0.3, "nein", "nein", "nein", 3],
          { total: true, cells: [null, "Summe Datensätze", "", { f: "SUM(D{first}:D{last})" }, "", "", "", null] },
        ],
        notes: [
          "Stand 14.04.2026: Identifikationsnummer in 12 von 18 Registern übernommen, 8 Register am Datenschutzcockpit angebunden, Nachweisabruf in 2 Registern aktiv.",
          "Datensätze: Personen- bzw. Falldatensätze laut Meldung der registerführenden Stellen, nicht bereinigt um Mehrfachzählungen.",
        ],
      },
      {
        name: "Budget",
        title: "Projektmittel Registermodernisierung 2025–2027",
        subtitle: "Beträge in Euro · 2025 Ist, 2026 Soll, 2027 Planwerte zur Haushaltsaufstellung",
        columns: [
          { header: "Arbeitspaket", width: 36 },
          { header: "2025 (Ist)", width: 14, fmt: "eur0" },
          { header: "2026 (Soll)", width: 14, fmt: "eur0" },
          { header: "2027 (Plan)", width: 14, fmt: "eur0" },
          { header: "Summe", width: 14, fmt: "eur0" },
          { header: "Anteil", width: 9, fmt: "pct" },
        ],
        rows: [
          ["AP 1 Steuerung", 420000, 450000, 200000, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$13" }],
          ["AP 2 Identifikationsnummer", 2100000, 1200000, 0, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$13" }],
          ["AP 3 Datenschutzcockpit", 3800000, 2900000, 1100000, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$13" }],
          ["AP 4 Nachweisabruf", 4600000, 6200000, 2400000, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$13" }],
          ["AP 5 Architektur und Vermittlungsstellen", 5200000, 4100000, 1500000, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$13" }],
          ["AP 6 Länder und Kommunen", 900000, 2400000, 1800000, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$13" }],
          ["AP 7 Recht", 50000, 50000, 0, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$13" }],
          ["AP 8 Kommunikation", 100000, 600000, 200000, { f: "SUM(B{r}:D{r})" }, { f: "E{r}/E$13" }],
          { total: true, cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "E{r}/E$13" }] },
        ],
        notes: ["Bei einer Verschiebung des Projektabschlusses in das Jahr 2027 entstehen zusätzlich rund 0,9 Mio. € für Steuerung und Betrieb der Vermittlungsstellen."],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "bmvb-sachstand-registermodernisierung-leitungsrunde",
    title: "Registermodernisierung – Sachstand für die Leitungsrunde",
    kind: "Präsentation",
    fileName: "Sachstand Registermodernisierung Leitungsrunde 2026-04-27",
    org: "bmvb",
    unit: "bmvb-d2",
    author: "bmvb-hammes",
    date: "2026-04-22",
    tags: ["zahlen"],
    keywords: ["Datenschutzcockpit", "12 von 18", "Formulierungshilfe", "Leitungsrunde", "31.03.2027"],
    summary:
      "Kurzer Sachstand des Referats D 2 für die Hausleitung: Umsetzungsstand der Register, kritische Meilensteine, Mittel 2025–2027 und Entscheidungsbedarf zur Verschiebung des Projektabschlusses – passt zum Meilensteinplan und eignet sich für den Abgleich Präsentation gegen Tabelle.",
    slides: [
      { t: "title", title: "Registermodernisierung – Sachstand", subtitle: "Leitungsrunde am 27. April 2026 · Referat D 2" },
      {
        t: "bullets",
        title: "Kernbotschaften",
        bullets: [
          "Identifikationsnummer in **12 von 18** Registern übernommen",
          "Datenschutzcockpit seit 27.02.2026 produktiv – vier Monate später als geplant",
          "8 Register am Datenschutzcockpit, Ziel 12 bis 30.09.2026",
          "Nachweisabruf in 2 Registern aktiv; Melderegister verschiebt sich auf 01.07.2026",
          "Projektabschluss realistisch erst zum **31.03.2027** (Plan: 31.12.2026)",
        ],
        notes: "Die Gesamtbewertung im Projektplan („im Zeitplan“) ist überholt und wird zum Steuerungskreis am 12.05. angepasst.",
      },
      {
        t: "chart",
        title: "Umsetzungsstand der 18 Register",
        chart: {
          type: "bar",
          categories: ["Identifikationsnummer übernommen", "Datenschutzcockpit angebunden", "Nachweisabruf aktiv"],
          series: [
            { name: "Stand April 2026", values: [12, 8, 2] },
            { name: "Plan Ende 2026", values: [14, 12, 5] },
          ],
          unit: "Register",
        },
        caption: "Quelle: Meilensteinplan Registermodernisierung, Stand 14.04.2026",
      },
      {
        t: "table",
        title: "Kritische Meilensteine",
        header: ["Meilenstein", "Plan", "Prognose", "Ampel"],
        rows: [
          ["M-06 Nachweisabruf Melderegister", "31.03.2026", "01.07.2026", "rot"],
          ["M-08 Nachweisabruf Fahrzeugregister", "30.09.2026", "18.12.2026", "rot"],
          ["M-05 Zwölf Register am Datenschutzcockpit", "30.06.2026", "30.09.2026", "gelb"],
          ["M-13 Formulierungshilfe IDNrG im Kabinett", "29.04.2026", "15.07.2026", "gelb"],
          ["M-15 Abschluss und Regelbetrieb", "31.12.2026", "31.03.2027", "gelb"],
        ],
        notes: "Ursachen: Lieferverzug des IT-Dienstleisters, Meldedaten zweier Länder fehlen, IDNrG-Änderung verspätet.",
      },
      {
        t: "chart",
        title: "Projektmittel 2025–2027",
        chart: {
          type: "bar",
          categories: ["2025 (Ist)", "2026 (Soll)", "2027 (Plan)"],
          series: [{ name: "Mio. €", values: [17.17, 17.9, 7.2] }],
          unit: "Mio. €",
        },
        caption: "Gesamt 42,27 Mio. €, bei Verschiebung plus 0,9 Mio. €",
      },
      {
        t: "bullets",
        title: "Entscheidungsbedarf",
        bullets: [
          "Zustimmung zur Verschiebung des Projektabschlusses auf den 31.03.2027",
          "Gespräch der Staatssekretärin mit zwei Ländern im Mai",
          "Anmeldung von 7,2 Mio. € zuzüglich 0,9 Mio. € für 2027 zur Haushaltsaufstellung",
        ],
      },
      { t: "end", title: "Vielen Dank", lines: ["Gregor Hammes · Referat D 2 – Datenaustausch und Register"] },
    ],
  },
  {
    type: "word",
    id: "bmvb-antwort-kleine-anfrage-servicequalitaet",
    title: "Antwort der Bundesregierung auf die Kleine Anfrage „Erreichbarkeit und Servicequalität der Bundesverwaltung“ (Entwurf)",
    kind: "Antwort auf Kleine Anfrage",
    fileName: "KA 21-4183 Antwortentwurf Servicequalitaet Stand 2026-06-10",
    org: "bmvb",
    unit: "bmvb-b1",
    author: "bmvb-yavuz",
    date: "2026-06-10",
    keywords: ["Drucksache 21/4183", "Vorbemerkung der Bundesregierung", "Fraktion Soziale Liste", "Annahmequote", "§ 35a VwVfG"],
    summary:
      "Entwurf der Antwort der Bundesregierung auf eine Kleine Anfrage mit 13 Fragen zu Online-Angebot, Erreichbarkeit, Zufriedenheit, Barrierefreiheit, KI-Einsatz und Registermodernisierung, inklusive hausinternem Bearbeitungsvermerk – gut zum Prüfen gegen Zulieferungen, zum Kürzen oder für eine Pressezusammenfassung.",
    meta: [
      ["Aktenzeichen", "B 1 – 10450/21#4183"],
      ["Federführung", "Referat B 1"],
      ["Status", "Entwurf – Hausabstimmung"],
    ],
    blocks: [
      {
        t: "note",
        text: "**Hausinterner Bearbeitungsvermerk – vor Versand entfernen:** Stand 10.06.2026, 11:30 Uhr. Eingearbeitet: D 1 (Frage 1), D 2 (Frage 8), B 3 (Fragen 4, 5, 6, 9), Z I 2 (Frage 10), B 2 (Frage 11). Frage 7 aus dem Sachstand D 4 vom 02.10.2025 übernommen, Zulieferung D 4 steht aus.",
      },
      { t: "p", text: "Deutscher Bundestag – 21. Wahlperiode" },
      {
        t: "p",
        text: "**Antwort der Bundesregierung** auf die Kleine Anfrage der Abgeordneten Dr. Ute Kranich, Bernd Oltmanns, Selma Kayser, weiterer Abgeordneter und der Fraktion Soziale Liste – Drucksache 21/4183 –",
      },
      { t: "h1", text: "Erreichbarkeit und Servicequalität der Bundesverwaltung" },
      { t: "h2", text: "Vorbemerkung der Fragesteller" },
      {
        t: "p",
        text: "Wer eine Behörde des Bundes anruft, landet häufig in der Warteschleife oder wird auf ein Kontaktformular verwiesen. Anträge verschwinden wochenlang ohne Rückmeldung, Bescheide sind für viele Menschen kaum verständlich. Die Bundesregierung hat angekündigt, verbindliche Servicestandards einzuführen. Die Fragestellerinnen und Fragesteller wollen wissen, wie es um die Servicequalität der Bundesverwaltung tatsächlich steht und wann die angekündigten Standards gelten.",
      },
      { t: "h2", text: "Vorbemerkung der Bundesregierung" },
      {
        t: "p",
        text: "Die Bundesregierung misst der Servicequalität der Bundesverwaltung hohe Bedeutung bei. Inzwischen sind 72 Prozent der Verwaltungsleistungen des Bundes vollständig online verfügbar. Mit dem Entwurf einer Servicestandardverordnung (ServStV), zu dem die Länder- und Verbändebeteiligung im Februar und März 2026 stattgefunden hat, sollen erstmals verbindliche Mindeststandards für alle Behörden des Bundes eingeführt werden.",
      },
      {
        t: "p",
        text: "Daten zur Servicequalität werden bislang nicht einheitlich erhoben. Die nachfolgenden Angaben beruhen auf einer Abfrage bei den Behörden des Bundes und auf der Nutzerbefragung 2025 des Bundesministeriums für Verwaltungsdienste und Bürgerservice. Soweit Angaben fehlen oder nicht vergleichbar sind, wird darauf hingewiesen.",
      },
      { t: "p", text: "**1. Wie viele Verwaltungsleistungen des Bundes waren zum 31. März 2026 vollständig online verfügbar, und wie hat sich diese Zahl seit Ende 2024 entwickelt?**" },
      {
        t: "p",
        text: "Zum Stichtag 31. März 2026 waren von 584 Verwaltungsleistungen des Bundes 421 vollständig online verfügbar; das entspricht einem Anteil von 72,1 Prozent. Ende 2025 waren es 398 Leistungen (68,2 Prozent), Ende 2024 356 Leistungen (61,0 Prozent).",
      },
      { t: "p", text: "**2. Wie hoch war die Annahmequote der telefonischen Servicehotlines der Bundesbehörden im Jahr 2025 (bitte nach Behörden aufschlüsseln)?**" },
      {
        t: "p",
        text: "Die Annahmequote der 19 Servicehotlines, für die Daten gemeldet wurden, lag im Jahr 2025 im gewichteten Mittel bei 78 Prozent; die Spannweite reichte von 61 bis 94 Prozent. Auf eine Aufschlüsselung nach Behörden wird verzichtet, da die Daten mit unterschiedlichen Verfahren erhoben werden und nicht vergleichbar sind. Mit § 3 ServStV-E wird eine einheitliche Definition der Annahmequote eingeführt.",
      },
      { t: "p", text: "**3. Wie lange dauerte die Bearbeitung von Anträgen bei Behörden des Bundes im Jahr 2025 durchschnittlich?**" },
      {
        t: "p",
        text: "Hierzu liegen der Bundesregierung keine zentral erhobenen Daten vor. Mit dem jährlichen Servicebericht nach § 12 ServStV-E sollen künftig auch Angaben zur Einhaltung der Fristen für Eingangsbestätigungen und Antworten erhoben werden.",
      },
      { t: "p", text: "**4. Wie zufrieden sind Bürgerinnen und Bürger nach Kenntnis der Bundesregierung mit den Verwaltungsleistungen des Bundes?**" },
      {
        t: "p",
        text: "An der Nutzerbefragung 2025 haben sich 2.486 Personen beteiligt. Die durchschnittliche Gesamtzufriedenheit lag bei 3,6 auf einer Skala von 1 (sehr unzufrieden) bis 5 (sehr zufrieden). Am höchsten war die Zufriedenheit beim Online-Antrag auf ein Führungszeugnis (4,1), am niedrigsten bei der Registrierung und Anmeldung im Bürgerkonto (3,1).",
      },
      { t: "p", text: "**5. Wie viele Online-Angebote des Bundes wurden 2025 auf Barrierefreiheit geprüft, und mit welchem Ergebnis?**" },
      {
        t: "p",
        text: "Im Jahr 2025 wurden 120 Stichprobenprüfungen nach der BITV 2.0 durchgeführt. 34 Angebote waren vollständig konform, 71 teilweise konform und 15 nicht konform. Häufigste Mängel waren nicht beschriftete Formularfelder, nicht barrierefreie PDF-Dokumente und Zeitbegrenzungen ohne Vorwarnung.",
      },
      { t: "p", text: "**6. Wann soll die angekündigte Servicestandardverordnung in Kraft treten, und welche Kosten entstehen?**" },
      {
        t: "p",
        text: "Die Kabinettbefassung ist für das dritte Quartal 2026 vorgesehen. Die Verordnung soll sechs Monate nach ihrer Verkündung in Kraft treten, voraussichtlich im ersten Halbjahr 2027. Der jährliche Erfüllungsaufwand der Verwaltung des Bundes wird auf rund 12,4 Mio. Euro geschätzt, der einmalige auf rund 8,9 Mio. Euro.",
      },
      { t: "p", text: "**7. In welchem Umfang setzen Behörden des Bundes Anwendungen Künstlicher Intelligenz in der Kommunikation mit Bürgerinnen und Bürgern ein, und werden dabei Entscheidungen automatisiert getroffen?**" },
      {
        t: "p",
        text: "Seit März 2025 wird ein KI-Assistent in vier Behörden erprobt. Im September 2025 nutzten ihn 3.120 Beschäftigte aktiv. Seit Januar 2026 steht er im Regelbetrieb allen Behörden des Geschäftsbereichs zur Verfügung. Er wird vor allem für Entwürfe von Antwortschreiben, Zusammenfassungen und Übersetzungen eingesetzt; Entwürfe werden stets von Beschäftigten geprüft und verantwortet. Vollständig automatisiert erlassene Verwaltungsakte im Sinne des § 35a VwVfG ergehen dabei nicht.",
      },
      { t: "p", text: "**8. Wie viele Register sind an das Datenschutzcockpit angebunden, und für welche Register ist der Nachweisabruf bereits möglich?**" },
      {
        t: "p",
        text: "Zum 31. Mai 2026 waren neun der 18 Register, die in die Registermodernisierung einbezogen sind, an das Datenschutzcockpit angebunden. Der Nachweisabruf ist für zwei Register produktiv. Für das Melderegister ist der Start zum 1. Juli 2026 vorgesehen.",
      },
      { t: "p", text: "**9. Wie viele Beschäftigte befassen sich im Bundesministerium für Verwaltungsdienste und Bürgerservice mit Servicestandards und Nutzerforschung?**" },
      {
        t: "p",
        text: "Im zuständigen Referat sind 6,5 Vollzeitäquivalente tätig. Für zusätzliche Aufgaben nach der ServStV werden zum Haushalt 2027 weitere 2,0 Vollzeitäquivalente angemeldet.",
      },
      { t: "p", text: "**10. Welche Haushaltsmittel stehen 2026 für Nutzerforschung zur Verfügung?**" },
      {
        t: "p",
        text: "Im Kapitel 1801 Titel 526 02 sind für 2026 Mittel in Höhe von 850.000 Euro veranschlagt. Hinzu kommen Ausgabereste aus dem Jahr 2025 in Höhe von 120.000 Euro.",
      },
      { t: "p", text: "**11. Wie unterstützt die Bundesregierung Länder und Kommunen bei der Verbesserung ihrer Servicequalität?**" },
      {
        t: "p",
        text: "Bund und Länder arbeiten seit 2025 in der Bund-Länder-Arbeitsgruppe Servicestandards zusammen, die bislang viermal getagt hat. Für Kommunen sollen gemeinsame Kernstandards als Empfehlung formuliert werden. Für Pilotvorhaben der Länder stehen 2026 im Kapitel 1801 Titel 632 01 4,0 Mio. Euro zur Verfügung. Im Pilotvorhaben „Digitale Umzugsmeldung“ erproben Bund, Land und drei Pilotkommunen einen gemeinsamen Online-Dienst.",
      },
      { t: "p", text: "**12. Plant die Bundesregierung, die Servicestandards auf Verwaltungsleistungen für Unternehmen auszuweiten?**" },
      { t: "p", text: "**13. Ist vorgesehen, Verstöße gegen die Servicestandards zu sanktionieren?**" },
      {
        t: "p",
        text: "Die Fragen 12 und 13 werden wegen des Sachzusammenhangs gemeinsam beantwortet. Eine Ausweitung auf Leistungen für Unternehmen wird im Rahmen der Evaluierung nach § 14 ServStV-E geprüft. Sanktionen sind nicht vorgesehen. Die Einhaltung der Standards wird durch den jährlichen Servicebericht transparent gemacht; Abweichungen müssen begründet und mit einem Zeitplan versehen werden.",
      },
    ],
  },
];

export const threads: ThreadSpec[] = [
  {
    id: "bmvb-kleine-anfrage-21-4183-abstimmung",
    title: "Abstimmung der Antwort auf die Kleine Anfrage zur Servicequalität",
    subject: "KA 21/4183 „Erreichbarkeit und Servicequalität“ – Zulieferungen und Antwortentwurf, Frist 12.06.",
    org: "bmvb",
    unit: "bmvb-b1",
    date: "2026-06-11",
    tags: ["widersprueche", "zahlen"],
    keywords: ["21/4183", "412", "5.480", "Hausfrist", "Antwortentwurf"],
    summary:
      "Leitungsbereich, federführendes Referat und Fachreferate stimmen unter Zeitdruck die Antwort auf eine Kleine Anfrage ab. Der angehängte Entwurf nennt 421 Online-Leistungen, obwohl D 1 ausdrücklich 412 gemeldet hat; die KI-Angaben sind veraltet (3.120 statt 5.480 Nutzende, Regelbetrieb seit April statt Januar).",
    mails: [
      {
        from: "bmvb-brenner",
        to: ["bmvb-yavuz"],
        cc: ["bmvb-richter", "bmvb-pohl", "bmvb-terhorst", "bmvb-kuehnel"],
        date: "2026-06-08T08:12",
        body: `Liebe Frau Yavuz,

zur Kleinen Anfrage der Fraktion Soziale Liste „Erreichbarkeit und Servicequalität der Bundesverwaltung“ (Drucksache 21/4183) noch einmal die Fristen, nachdem die Staatssekretärin heute früh eine Fristverlängerung abgelehnt hat:

- Eingang beim Bundestag: **Freitag, 12.06.2026**
- Hausfrist für Zulieferungen an B 1: Dienstag, 09.06., 15:00 Uhr
- abgestimmter Antwortentwurf an L 1: Mittwoch, 10.06., 12:00 Uhr
- Zeichnung durch die Staatssekretärin: Donnerstag, 11.06., vormittags

Die Federführung bleibt bei Ihnen. Zulieferungen bitte: D 1 zu Frage 1, D 4 zu Frage 7, D 2 zu Frage 8, B 3 zu den Fragen 4, 5, 6 und 9. Die Fragen 10 und 11 übernimmt B 1 mit Z I 2 und B 2.

Bitte achten Sie darauf, dass die Zahlen zum Sprechzettel passen, den die Staatssekretärin am 17.06. im Ausschuss verwendet – dort ist von „mehr als 70 Prozent online“ die Rede.

Viele Grüße
Moritz Brenner`,
      },
      {
        from: "bmvb-richter",
        to: ["bmvb-yavuz"],
        cc: ["bmvb-brenner"],
        date: "2026-06-09T16:58",
        body: `Hallo Frau Yavuz,

sorry, etwas später als zugesagt – wir mussten die Meldungen aus dem Geschäftsbereich noch bereinigen. Zu Frage 1:

Stichtag 31.03.2026: **412 von 584** Verwaltungsleistungen vollständig online (70,5 %).
Ende 2025: 398 (68,2 %), Ende 2024: 356 (61,0 %).

Achtung: In einer früheren Fassung unserer Tabelle, die schon im Haus kursiert, stand 421. Da waren neun Leistungen doppelt gezählt (jeweils als Bundes- und als Landesleistung gemeldet). Bitte nur noch 412 verwenden.

Viele Grüße
Svetlana Richter`,
      },
      {
        from: "bmvb-yavuz",
        to: ["bmvb-brenner"],
        cc: ["bmvb-richter", "bmvb-pohl", "bmvb-kuehnel"],
        date: "2026-06-10T11:47",
        attachments: ["bmvb-antwort-kleine-anfrage-servicequalitaet"],
        body: `Lieber Herr Brenner,

anbei der Antwortentwurf zur KA 21/4183, Stand 10.06., 11:30 Uhr. Eingearbeitet sind die Zulieferungen von D 1, D 2, B 3, Z I 2 und B 2. Von D 4 kam bis heute früh nichts; Frage 7 habe ich deshalb aus dem Sachstand vom Oktober 2025 übernommen. Frau Pohl, bitte schauen Sie noch einmal drüber.

Zu Frage 2 verzichten wir bewusst auf eine Aufschlüsselung nach Behörden, weil die Daten nicht vergleichbar sind. Das wird den Fragestellern nicht gefallen, ist aber mit B 3 abgestimmt.

Viele Grüße
Hatice Yavuz`,
      },
      {
        from: "bmvb-pohl",
        to: ["bmvb-yavuz"],
        cc: ["bmvb-brenner"],
        date: "2026-06-10T15:22",
        body: `Liebe Frau Yavuz,

unsere Zulieferung ist am Montagabend an das Funktionspostfach B 1 gegangen, offenbar ist sie dort hängen geblieben. Zu Frage 7 bitte unbedingt korrigieren:

- Die 3.120 aktiven Nutzenden sind der Stand **September 2025**. Im Mai 2026 waren es **5.480**.
- Der Regelbetrieb läuft **seit dem 01.04.2026**, nicht seit Januar. Von Januar bis März lief ein Übergangsbetrieb mit den Pilotbehörden.
- Der Satz zu § 35a VwVfG ist richtig und kann so bleiben.

Textvorschlag: „Seit dem 1. April 2026 steht der KI-Assistent allen Behörden des Geschäftsbereichs zur Verfügung. Im Mai 2026 nutzten ihn 5.480 Beschäftigte mindestens einmal.“

Viele Grüße
Anna-Lena Pohl`,
      },
      {
        from: "bmvb-brenner",
        to: ["bmvb-yavuz"],
        cc: ["bmvb-wenzel", "bmvb-richter", "bmvb-pohl", "bmvb-kuehnel"],
        date: "2026-06-11T08:06",
        body: `Liebe Frau Yavuz,

Frau Wenzel aus dem Büro der Staatssekretärin hat beim Gegenlesen gestern Abend zwei Punkte gefunden:

1. Frage 1 nennt 421 Leistungen und 72,1 %. D 1 hat am Dienstag ausdrücklich 412 (70,5 %) gemeldet – die 421 sind die alte, fehlerhafte Zahl.
2. Frage 7 – siehe die Mail von Frau Pohl.

Außerdem steht in der Vorbemerkung „72 Prozent“. Bitte prüfen Sie alle Stellen, an denen die Zahl vorkommt, auch den Sprechzettel für den 17.06.

Ich brauche die bereinigte Fassung bis **10:00 Uhr**, die Staatssekretärin zeichnet um 11:00 Uhr. Danach geht die Antwort an den Bundestag. Eine weitere Schleife ist nicht drin.

Danke und Gruß
Moritz Brenner`,
      },
    ],
  },
  {
    id: "bmvb-buergerzuschrift-umzugsmeldung-barrierefreiheit",
    title: "Beschwerde einer blinden Bürgerin über die digitale Umzugsmeldung",
    subject: "Beschwerde - Umzug online melden geht nicht mit Screenreader!!",
    org: "bmvb",
    unit: "bmvb-b1",
    date: "2026-03-12",
    tags: ["personendaten"],
    keywords: ["UM-2026-0218-4471", "Merkzeichen Bl", "CAPTCHA", "Release 2.4", "§ 17 BMG"],
    summary:
      "Eine blinde Bürgerin aus Falkenbrück beschwert sich am Samstagabend über die digitale Umzugsmeldung und nennt dabei Geburtsdatum, alte und neue Anschrift, Schwerbehinderung und Vorgangsnummer. Bürgerservice und Nutzerforschung klären den Fall und antworten – gut zum Anonymisieren und für eine Antwort in einfacher Sprache.",
    mails: [
      {
        from: "ext-bund-overbeck",
        to: ["bmvb-krasniqi"],
        date: "2026-03-07T21:43",
        body: `Sehr geehrte Damen und Herren,

ich bin am 1. März innerhalb von Falkenbrück umgezogen, von der Amselstraße 9 in der Nordstadt in den Mühlenweg 23, 00417 Falkenbrück. Ich wollte das wie empfohlen online über Ihr Bürgerkonto melden. Ich bin seit meiner Geburt blind (Schwerbehindertenausweis GdB 100, Merkzeichen Bl) und arbeite mit einem Screenreader, das klappt sonst bei fast allen Seiten.

Bei der Umzugsmeldung ging es dreimal schief:
- beim ersten versuch war nach 20 Minuten alles weg, ohne jede Warnung
- beim zweiten mal kam am Ende ein Bilderrätsel (CAPTCHA), das kann ich nicht lösen, eine Audio-Version gibt es nicht
- beim dritten mal hat meine Nachbarin das Rätsel für mich gelöst, dann kam eine Bestätigung als PDF, die mein Screenreader nicht vorlesen kann. Ich weiß bis heute nicht ob die Meldung angekommen ist!!

Vorgangsnummer laut Nachbarin: UM-2026-0218-4471. Mein Geburtsdatum ist der 14.08.1961, falls Sie das brauchen.

Im Bürgeramt Falkenbrück bekomme ich erst in drei Wochen einen Termin. Nach § 17 BMG muss ich mich aber innerhalb von zwei Wochen anmelden. Muss ich jetzt ein Bußgeld zahlen, weil Ihre Seite nicht funktioniert?? Das kann ja wohl nicht sein.

Ich erwarte eine Antwort, die ich auch lesen kann – also bitte KEIN eingescanntes PDF.

Mit freundlichen Grüßen
Monika Overbeck
Telefon 069 90009-718`,
      },
      {
        from: "bmvb-krasniqi",
        to: ["bmvb-weidner"],
        cc: ["bmvb-yavuz"],
        date: "2026-03-09T09:18",
        subject: "WG: Beschwerde - Umzug online melden geht nicht mit Screenreader!!",
        body: `Liebe Frau Weidner,

unten eine Beschwerde zur digitalen Umzugsmeldung, die am Samstagabend im Postfach des Bürgerservice eingegangen ist. Die Probleme (Timeout, CAPTCHA, PDF) kommen mir aus Ihrem Bericht vom letzten Jahr bekannt vor. Sollten die nicht mit Release 2.3 behoben sein?

Können Sie mir bis Mittwoch sagen,
1. ob die Meldung der Bürgerin technisch angekommen ist (Vorgangsnummer steht unten) oder wer das prüfen kann,
2. wann die Fehler behoben werden,
3. was wir zur Frage des Bußgelds sagen dürfen? Zuständig ist ja die Meldebehörde in Falkenbrück.

Die Antwort muss barrierefrei sein, also als normale Text-Mail ohne PDF.

Viele Grüße
Arben Krasniqi`,
      },
      {
        from: "bmvb-weidner",
        to: ["bmvb-krasniqi"],
        cc: ["bmvb-yavuz", "bmvb-kuehnel"],
        date: "2026-03-10T16:05",
        body: `Hallo Herr Krasniqi,

danke fürs Weiterleiten – leider ein bekanntes Bild:

1. **Eingang:** Der Plattformbetrieb hat die Vorgangsnummer geprüft. Die Meldung ist am 05.03.2026 um 19:12 Uhr vollständig bei der Meldebehörde Falkenbrück eingegangen und dort am 06.03. verarbeitet worden. Die Bürgerin ist also ordnungsgemäß angemeldet.
2. **Fehlerbehebung:** Mit Release 2.3 (Oktober 2025) wurde nur das Zwischenspeichern umgesetzt, die Warnung vor dem Timeout fehlt noch. Der Verzicht auf das CAPTCHA nach Anmeldung über das Bürgerkonto und die barrierefreie PDF-Bestätigung kommen mit **Release 2.4**, geplant für den 19.05.2026. Ehrlich gesagt hätten die beiden Punkte längst erledigt sein müssen.
3. **Bußgeld:** Umzug am 01.03., Eingang der Meldung am 05.03. – die Zwei-Wochen-Frist nach § 17 BMG ist eingehalten. Ein Bußgeld steht nicht im Raum. Den Termin im Bürgeramt kann sie absagen.

Bitte die Gesundheitsangaben (GdB, Merkzeichen) und das Geburtsdatum nicht in die Antwort übernehmen und die Mail nicht weiter streuen als nötig. Ich nehme den Fall anonymisiert in unsere Befundliste für Testrunde 3 auf.

Viele Grüße
Clara Weidner`,
      },
      {
        from: "bmvb-krasniqi",
        to: ["ext-bund-overbeck"],
        date: "2026-03-12T10:30",
        quote: false,
        body: `Sehr geehrte Frau Overbeck,

vielen Dank für Ihre Nachricht vom 7. März und dafür, dass Sie uns so genau beschrieben haben, was nicht funktioniert hat. Es tut uns leid, dass Sie diese Erfahrung machen mussten.

Die gute Nachricht zuerst: Ihre Umzugsmeldung ist angekommen. Sie ist am 5. März 2026 vollständig bei der Meldebehörde der Stadt Falkenbrück eingegangen und dort am 6. März bearbeitet worden. Damit haben Sie die Frist von zwei Wochen eingehalten. Ein Bußgeld droht Ihnen nicht. Den Termin im Bürgeramt können Sie absagen.

Zu den Fehlern: Die Probleme mit dem Bilderrätsel und mit der Bestätigung als PDF sind uns bekannt. Sie werden mit einer neuen Version der Anwendung behoben, die für Mai 2026 geplant ist. Außerdem soll die Anwendung künftig rechtzeitig warnen, bevor eine Sitzung abläuft. Ihre Hinweise haben wir an das zuständige Fachreferat weitergegeben.

Wenn Sie möchten, können Sie an einem Nutzertest teilnehmen und uns direkt zeigen, wo es hakt. Schreiben Sie uns dazu einfach eine kurze Antwort.

Mit freundlichen Grüßen
Im Auftrag
Arben Krasniqi
Bürgerservice`,
      },
    ],
  },
];
