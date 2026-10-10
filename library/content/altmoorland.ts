// Landkreis Altmoorland
import type { DocSpec, ThreadSpec } from "../types";

export const documents: DocSpec[] = [
  {
    type: "word",
    id: "am-vermerk-rueckstaende-auslaenderbehoerde",
    title: "Vermerk: Bearbeitungsrückstände in der Ausländerbehörde",
    kind: "Vermerk",
    fileName: "Vermerk Bearbeitungsrueckstaende Auslaenderbehoerde 2025-09",
    org: "altmoorland",
    unit: "am-auslaender",
    author: "am-mertens",
    date: "2025-09-15",
    tags: ["zahlen"],
    keywords: ["1.910 Vorgänge", "Fiktionsbescheinigung", "Untätigkeitsklagen", "11 Wochen"],
    summary:
      "Sachstand der Ausländerbehörde für den Landrat: Rückstände nach Verfahrensart, Ursachen, Risiken (Untätigkeitsklagen) und vorgeschlagene Sofortmaßnahmen.",
    meta: [["Aktenzeichen", "32.1-102.05/25"]],
    recipient: ["Herrn Landrat Tiedemann", "über Dezernent 3"],
    subject: "Bearbeitungsrückstände in der Ausländerbehörde – Sachstand und Vorschläge für Sofortmaßnahmen",
    blocks: [
      { t: "h1", text: "1. Anlass" },
      {
        t: "p",
        text: "In der Sitzung des Kreisausschusses am 02.09.2025 wurde nach den Wartezeiten in der Ausländerbehörde gefragt. Zugleich häufen sich Beschwerden von Arbeitgebern, deren Beschäftigte ohne gültigen Aufenthaltstitel ihre Tätigkeit nicht fortsetzen dürfen. Dieser Vermerk fasst den Sachstand zum Stichtag 12.09.2025 zusammen.",
      },
      { t: "h1", text: "2. Sachstand" },
      {
        t: "p",
        text: "Zum Stichtag sind **1.910 Vorgänge** offen. Die Wartezeit auf einen Vorsprachetermin beträgt derzeit **11 Wochen** (Vorjahr: 6 Wochen).",
      },
      {
        t: "table",
        header: ["Verfahren", "Offene Vorgänge", "davon älter als 3 Monate", "Veränderung zum Vorjahr"],
        rows: [
          ["Verlängerung von Aufenthaltstiteln", "1.120", "410", "+ 22 %"],
          ["Einbürgerungsanträge", "640", "385", "+ 68 %"],
          ["Verpflichtungserklärungen", "90", "12", "– 5 %"],
          ["Sonstige (Umschreibungen, Auskünfte)", "60", "8", "+ 3 %"],
          ["Summe", "1.910", "815", "+ 31 %"],
        ],
        widths: [4, 2, 2, 2],
      },
      { t: "h1", text: "3. Ursachen" },
      {
        t: "ul",
        items: [
          "**Personal:** Von 14 Vollzeitstellen sind 3 unbesetzt, eine weitere Kollegin ist langfristig erkrankt. Die letzte Ausschreibung (Juni 2025) ergab zwei Bewerbungen, von denen eine zurückgezogen wurde.",
          "**Einbürgerungen:** Seit der Reform des Staatsangehörigkeitsrechts im Jahr 2024 ist die Zahl der Anträge stark gestiegen. Viele Anträge sind unvollständig und erfordern Nachforderungen.",
          "**E-Akte:** Die Umstellung auf die elektronische Akte seit Mai 2025 bindet in der Übergangszeit Kapazität (Scannen von Altakten, Einarbeitung).",
          "**Telefon und E-Mail:** Täglich gehen rund 140 Sachstandsanfragen ein, die überwiegend von den Sachbearbeitenden selbst beantwortet werden.",
        ],
      },
      { t: "h1", text: "4. Risiken" },
      {
        t: "p",
        text: "Derzeit sind **12 Untätigkeitsklagen** nach § 75 VwGO anhängig, davon 9 in Einbürgerungsverfahren. Bei Verlängerungen droht in Einzelfällen der Verlust des Arbeitsplatzes, wenn die Fiktionsbescheinigung nicht rechtzeitig ausgestellt wird. Die Lokalpresse hat bereits zweimal berichtet.",
      },
      { t: "h1", text: "5. Vorschläge für Sofortmaßnahmen" },
      {
        t: "ol",
        items: [
          "Abordnung von zwei Beschäftigten aus der Zulassungsstelle für zunächst sechs Monate (Zustimmung Personalrat erforderlich).",
          "Ausstellung der Fiktionsbescheinigung künftig ohne Vorsprache: Versand per Post nach Eingang des vollständigen Antrags.",
          "Einrichtung einer zentralen Hotline (zwei Stunden täglich) und eines Online-Formulars für Sachstandsanfragen.",
          "Priorisierung: Verlängerungen mit Beschäftigungsbezug vor sonstigen Verlängerungen; Einbürgerungen nach Eingangsdatum.",
          "Prüfung, ob ein KI-gestützter Assistent einfache Sachstandsanfragen beantworten kann (Abstimmung mit dem Zweckverband Kommunale IT Altmoor und dem Datenschutzbeauftragten).",
        ],
      },
      {
        t: "p",
        text: "Die Maßnahmen 1 bis 4 können kurzfristig umgesetzt werden. Für Maßnahme 1 entstehen keine zusätzlichen Kosten; die Zulassungsstelle hat zugesagt, die Abordnung durch längere Online-Bearbeitung aufzufangen.",
      },
      { t: "h1", text: "6. Entscheidungsvorschlag" },
      { t: "p", text: "Ich bitte um Zustimmung zu den Maßnahmen 1 bis 4 und um Auftrag zur Prüfung von Maßnahme 5 bis zum 31.12.2025." },
      { t: "signature", lines: ["gez. Mertens", "Teamleiterin Ausländerbehörde"] },
    ],
  },
  {
    type: "excel",
    id: "am-zulassungsstelle-fallzahlen-2025",
    title: "Fallzahlen und Wartezeiten der Zulassungsstelle 2025",
    kind: "Statistik",
    fileName: "Zulassungsstelle Fallzahlen Wartezeiten 2025",
    org: "altmoorland",
    unit: "am-zulassung",
    author: "am-brinkmann",
    date: "2025-10-01",
    tags: ["zahlen"],
    keywords: ["i-Kfz", "Online-Quote", "Außenstelle Nord", "Vorgänge je VZÄ"],
    summary:
      "Monatliche Fallzahlen der Zulassungsstelle (Neuzulassungen, Umschreibungen, Außerbetriebsetzungen, i-Kfz) mit Online-Quote und Wartezeit sowie Auslastung der drei Standorte.",
    sheets: [
      {
        name: "Monate",
        title: "Zulassungsstelle Landkreis Altmoorland – Fallzahlen 2025",
        subtitle: "Quelle: Fachverfahren Zulassung, Auswertung vom 01.10.2025",
        columns: [
          { header: "Monat", width: 12 },
          { header: "Neuzulassungen", width: 15, fmt: "int" },
          { header: "Umschreibungen", width: 15, fmt: "int" },
          { header: "Außerbetrieb-setzungen", width: 15, fmt: "int" },
          { header: "davon online (i-Kfz)", width: 14, fmt: "int" },
          { header: "Vorgänge gesamt", width: 14, fmt: "int" },
          { header: "Online-Quote", width: 12, fmt: "pct" },
          { header: "Ø Wartezeit Termin (Tage)", width: 14, fmt: "dec" },
        ],
        rows: [
          ["Januar", 1184, 1422, 960, 702, { f: "B{r}+C{r}+D{r}" }, { f: "E{r}/F{r}" }, 6.5],
          ["Februar", 1240, 1388, 902, 731, { f: "B{r}+C{r}+D{r}" }, { f: "E{r}/F{r}" }, 7.0],
          ["März", 1622, 1710, 1045, 948, { f: "B{r}+C{r}+D{r}" }, { f: "E{r}/F{r}" }, 9.5],
          ["April", 1598, 1655, 1012, 1003, { f: "B{r}+C{r}+D{r}" }, { f: "E{r}/F{r}" }, 10.0],
          ["Mai", 1430, 1580, 978, 1012, { f: "B{r}+C{r}+D{r}" }, { f: "E{r}/F{r}" }, 8.5],
          ["Juni", 1388, 1512, 940, 1046, { f: "B{r}+C{r}+D{r}" }, { f: "E{r}/F{r}" }, 8.0],
          ["Juli", 1295, 1490, 1102, 1121, { f: "B{r}+C{r}+D{r}" }, { f: "E{r}/F{r}" }, 7.5],
          ["August", 1102, 1376, 1050, 1094, { f: "B{r}+C{r}+D{r}" }, { f: "E{r}/F{r}" }, 6.0],
          ["September", 1356, 1498, 991, 1187, { f: "B{r}+C{r}+D{r}" }, { f: "E{r}/F{r}" }, 5.5],
          {
            total: true,
            cells: [
              "Summe",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "E{r}/F{r}" },
              { f: "ROUND(AVERAGE(H{first}:H{last}),1)" },
            ],
          },
        ],
        notes: [
          "Wartezeit: Tage bis zum ersten freien Termin, Mittelwert der Stichtage 1. und 15. des Monats.",
          "März/April: Saisonspitze durch Wechsel auf Sommerreifen-Saisonkennzeichen und Neufahrzeuge.",
        ],
      },
      {
        name: "Standorte",
        title: "Auslastung der Standorte im 3. Quartal 2025",
        columns: [
          { header: "Standort", width: 28 },
          { header: "Schalter", width: 10, fmt: "int" },
          { header: "Besetzte VZÄ", width: 13, fmt: "dec" },
          { header: "Vorgänge Q3", width: 13, fmt: "int" },
          { header: "Vorgänge je VZÄ", width: 15, fmt: "int" },
          { header: "Öffnungsstunden je Woche", width: 16, fmt: "dec" },
        ],
        rows: [
          ["Kreishaus Altmoor", 8, 9.5, 7480, { f: "ROUND(D{r}/C{r},0)" }, 32.5],
          ["Außenstelle Nord (Brackenhain)", 3, 2.8, 2312, { f: "ROUND(D{r}/C{r},0)" }, 20],
          ["Außenstelle Süd (Stadt Altmoor, Marktplatz)", 2, 1.7, 1349, { f: "ROUND(D{r}/C{r},0)" }, 16],
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "ROUND(D{r}/C{r},0)" }, null],
          },
        ],
        notes: ["Vorgänge ohne Online-Anträge (i-Kfz); diese werden zentral im Kreishaus bearbeitet."],
      },
    ],
  },
];

export const threads: ThreadSpec[] = [];
