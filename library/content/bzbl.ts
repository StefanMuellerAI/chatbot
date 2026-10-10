// Bundesamt für zentrale Beschaffung und Liegenschaften (Bund)
import type { DocSpec, ThreadSpec } from "../types";

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
];
