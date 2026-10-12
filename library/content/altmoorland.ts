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
  {
    type: "word",
    id: "am-haushaltsgenehmigung-brackenhain-2026",
    title: "Genehmigung der Haushaltssatzung 2026 der Gemeinde Brackenhain mit Auflagen zum Haushaltssicherungskonzept",
    kind: "Verfügung",
    fileName: "2026-03-18 Haushaltsgenehmigung Gemeinde Brackenhain 2026",
    org: "altmoorland",
    unit: "am-kommunalaufsicht",
    author: "am-behrens",
    date: "2026-03-18",
    tags: ["zahlen"],
    keywords: ["15.2-902.12-BH/26", "412.000 €", "Haushaltssicherungskonzept", "1.200.000 €", "aufschiebenden Bedingung", "Gewerbesteuererstattung"],
    summary:
      "Verfügung der Kommunalaufsicht: Genehmigung der Kreditermächtigung (ein Teilbetrag unter Bedingung) und des Haushaltssicherungskonzepts der Gemeinde Brackenhain mit fünf Auflagen, Bewertung von Ergebnisplanung, Liquidität, Verschuldung und der Gewerbesteuererstattung, mit Rechtsbehelfsbelehrung.",
    meta: [
      ["Aktenzeichen", "15.2-902.12-BH/26"],
      ["Ihr Schreiben vom", "08.01.2026"],
      ["Zustellung", "gegen Empfangsbekenntnis"],
    ],
    recipient: ["Gemeinde Brackenhain", "Herrn Bürgermeister Frank Ruhnau", "Lindenstraße 2", "00758 Brackenhain"],
    subject:
      "Haushaltssatzung der Gemeinde Brackenhain für das Haushaltsjahr 2026 – Genehmigung nach § 114 Abs. 2 KV (Gesamtbetrag der Kredite und Haushaltssicherungskonzept 2026–2029)",
    blocks: [
      { t: "p", text: "Sehr geehrter Herr Bürgermeister Ruhnau," },
      {
        t: "p",
        text: "mit Schreiben vom 08.01.2026 haben Sie die vom Gemeinderat am 15.12.2025 beschlossene Haushaltssatzung für das Haushaltsjahr 2026 mit dem Haushaltsplan, dem Haushaltssicherungskonzept 2026–2029 und den vorgeschriebenen Anlagen vorgelegt. Mit E-Mail vom 23.01.2026 hat die Kämmerin über die Gewerbesteuererstattung aus den geänderten Messbescheiden 2021 bis 2023 berichtet; auf unsere Rückfragen vom 04.02.2026 haben Sie mit Schreiben vom 19.02.2026 geantwortet. Als Kommunalaufsichtsbehörde erlasse ich folgende",
      },
      { t: "h1", text: "I. Entscheidung" },
      {
        t: "ol",
        items: [
          "Der in § 2 der Haushaltssatzung festgesetzte **Gesamtbetrag der Kredite für Investitionen und Investitionsförderungsmaßnahmen in Höhe von 1.200.000 €** wird nach § 114 Abs. 2 der Kommunalverfassung (KV) genehmigt. Die Inanspruchnahme eines Teilbetrags von **260.000 €** für die Maßnahme „Wirtschaftsweg Heidhof–Kleinbracken (Moorweg, 2. Bauabschnitt)“ steht unter der **aufschiebenden Bedingung**, dass die Gemeinde die Fortschreibung des Haushaltssicherungskonzepts nach Auflage II.1 vorlegt und diese den Haushaltsausgleich spätestens im Jahr 2029 weiterhin darstellt.",
          "Das **Haushaltssicherungskonzept** 2026–2029 (§ 7 der Haushaltssatzung) wird nach § 114 Abs. 2 in Verbindung mit § 110 Abs. 8 KV mit den unter II. genannten Auflagen genehmigt.",
          "Der in § 4 festgesetzte Höchstbetrag der Liquiditätskredite von 1.500.000 € bedarf keiner Genehmigung, da er ein Sechstel der ordentlichen Erträge (11.898.000 € : 6 = 1.983.000 €) nicht übersteigt. Die Verpflichtungsermächtigungen nach § 3 (930.000 €) sind nicht genehmigungspflichtig.",
          "Diese Verfügung ergeht gebührenfrei.",
        ],
      },
      { t: "h1", text: "II. Auflagen" },
      {
        t: "ol",
        items: [
          "**Fortschreibung:** Die Gemeinde legt bis zum **30.06.2026** eine Fortschreibung des Haushaltssicherungskonzepts vor. Sie berücksichtigt die Gewerbesteuererstattung (Nettobelastung 371.500 €) mit ihren Auswirkungen auf Ergebnis, Rücklage und Liquidität und weist aus, mit welchen zusätzlichen Maßnahmen der Haushaltsausgleich 2029 gesichert wird.",
          "**Berichtspflicht:** Die halbjährlichen Berichte an den Haupt- und Finanzausschuss zum 30.06. und 31.12. sind der Kommunalaufsicht jeweils innerhalb eines Monats vorzulegen, erstmals bis zum **31.07.2026**. Sie weisen je Konsolidierungsmaßnahme den geplanten und den erreichten Betrag aus und begründen Abweichungen von mehr als 10 %.",
          "**Freiwillige Leistungen:** Das Gesamtvolumen der freiwilligen Leistungen darf während der Laufzeit des Haushaltssicherungskonzepts den Ansatz 2026 von **382.000 €** nicht übersteigen. Neue freiwillige Leistungen dürfen nur übernommen werden, wenn sie vollständig gegenfinanziert sind.",
          "**Investitionen:** Mit kreditfinanzierten Maßnahmen darf erst begonnen werden, wenn ihre Gesamtfinanzierung gesichert ist. Absehbare Mehrkosten von mehr als 10 % je Maßnahme sind der Kommunalaufsicht unverzüglich anzuzeigen; für die Erweiterung des Gemeindekindergartens gilt dies wegen der fehlenden Förderfähigkeit von Mehrkosten bereits ab 5 %.",
          "**Liquidität:** Liquiditätskredite dürfen nur zur Überbrückung in Anspruch genommen werden. Der Stand der Liquiditätskredite ist der Kommunalaufsicht zum Ende jedes Quartals mitzuteilen.",
        ],
      },
      { t: "h1", text: "III. Begründung" },
      { t: "h2", text: "1. Haushaltslage" },
      {
        t: "p",
        text: "Der Ergebnishaushalt 2026 weist ordentliche Erträge von 11.898.000 € und ordentliche Aufwendungen von 12.310.000 € aus. Daraus ergibt sich ein Fehlbetrag von **412.000 €**. Die Rücklage aus Überschüssen des ordentlichen Ergebnisses beträgt nach den Planungen der Gemeinde zum Jahresende 2025 voraussichtlich nur noch 182.000 €; mindestens 230.000 € des Fehlbetrags sind daher vorzutragen. Die mittelfristige Ergebnisplanung stellt sich wie folgt dar:",
      },
      {
        t: "table",
        header: ["in €", "2026", "2027", "2028", "2029"],
        rows: [
          ["Ordentliche Erträge", "11.898.000", "12.140.000", "12.430.000", "12.760.000"],
          ["Ordentliche Aufwendungen", "12.310.000", "12.495.000", "12.640.000", "12.702.000"],
          ["Ordentliches Ergebnis", "−412.000", "−355.000", "−210.000", "+58.000"],
        ],
        widths: [4, 2, 2, 2, 2],
      },
      {
        t: "p",
        text: "Der Haushaltsausgleich wird danach erstmals im Jahr **2029** erreicht, und zwar mit einem geringen Überschuss von 58.000 €. Die im Anschreiben vom 08.01.2026 genannte Jahreszahl 2028 hat die Gemeinde mit Schreiben vom 19.02.2026 als Redaktionsfehler berichtigt.",
      },
      {
        t: "p",
        text: "Besonders kritisch ist die Liquidität. Der Saldo aus laufender Verwaltungstätigkeit von 82.000 € reicht nicht aus, um die ordentliche Tilgung von 365.000 € zu decken. Die liquiden Mittel sinken nach der Planung von 1.140.000 € auf 543.000 € zum 31.12.2026. Durch die Auszahlung der Gewerbesteuererstattung im Februar 2026 wird die Gemeinde nach eigener Einschätzung ab dem zweiten Quartal Liquiditätskredite benötigen.",
      },
      { t: "h2", text: "2. Gewerbesteuererstattung" },
      {
        t: "p",
        text: "Am 12.01.2026 sind der Gemeinde geänderte Gewerbesteuermessbescheide für die Jahre 2021 bis 2023 zugegangen. Daraus ergibt sich eine Nettobelastung von 371.500 € (Erstattung 386.400 € und Erstattungszinsen 21.700 €, abzüglich der Entlastung bei der Gewerbesteuerumlage von 36.600 €). Die Gemeinde beabsichtigt in Abstimmung mit dem Rechnungsprüfungsamt, die Belastung durch eine Rückstellung im Jahresabschluss 2025 zu erfassen. Das ordentliche Ergebnis 2026 bliebe dann unverändert; die Überschussrücklage wäre allerdings bereits 2025 aufgebraucht, sodass der Fehlbetrag 2026 in voller Höhe vorzutragen wäre.",
      },
      {
        t: "p",
        text: "Sollte die abschließende Prüfung ergeben, dass die Erstattung das Haushaltsjahr 2026 belastet, steigt der Fehlbetrag 2026 auf 783.500 €. Die Verschlechterung läge über der Erheblichkeitsgrenze nach § 6 Abs. 1 der Haushaltssatzung (2 % der ordentlichen Aufwendungen = 246.200 €); die Gemeinde hätte dann nach § 115 KV unverzüglich eine Nachtragssatzung zu erlassen. In beiden Fällen ist das Haushaltssicherungskonzept fortzuschreiben (Auflage II.1).",
      },
      { t: "h2", text: "3. Haushaltssicherungskonzept" },
      {
        t: "p",
        text: "Die Gemeinde war nach § 110 Abs. 8 KV verpflichtet, ein Haushaltssicherungskonzept aufzustellen. Als Hauptursache des Fehlbetrags nennt es zu Recht die Kreisumlage, die 2026 um 322.000 € steigt; davon gehen rund 156.000 € auf die Anhebung des Umlagesatzes von 33,0 % auf 34,5 % und rund 166.000 € auf höhere Umlagegrundlagen zurück. Hinzu kommen der steigende Zuschussbedarf der Kindertagesbetreuung und die Folgekosten unaufschiebbarer Investitionen.",
      },
      {
        t: "table",
        header: ["in €", "2026", "2027", "2028", "2029"],
        rows: [
          ["Ergebnis ohne Maßnahmen", "−634.000", "−622.000", "−486.000", "−222.000"],
          ["Konsolidierungsbeitrag (12 Maßnahmen)", "+222.000", "+267.000", "+276.000", "+280.000"],
          ["Ergebnis mit Maßnahmen", "−412.000", "−355.000", "−210.000", "+58.000"],
        ],
        widths: [4, 2, 2, 2, 2],
      },
      {
        t: "p",
        text: "Die Maßnahmen sind konkret beschrieben, mit Beträgen hinterlegt und in die Ergebnisplanung eingerechnet. Die Hälfte des Konsolidierungsbeitrags 2026 (111.000 €) beruht auf den bereits zum 01.01.2026 angehobenen Hebesätzen (Grundsteuer B 425 %, Gewerbesteuer 380 %). Positiv bewertet die Kommunalaufsicht die Maßnahmen auf der Aufwandsseite (Stellenwegfall mit kw-Vermerk, LED-Umrüstung, Energiemanagement, interkommunale Zusammenarbeit beim Bauhof).",
      },
      {
        t: "p",
        text: "Der Sicherheitsabstand im Ausgleichsjahr 2029 ist mit 58.000 € jedoch gering, und die Gewerbesteuererstattung zeigt, wie anfällig das Ertragsgefüge ist. Die Gemeinde wird bei der Fortschreibung auch Maßnahmen prüfen müssen, die sie bisher verworfen hat. Der Hebesatz der Grundsteuer B liegt mit 425 % weiterhin unter dem Durchschnitt der Gemeinden im Landkreis (438 %).",
      },
      { t: "h2", text: "4. Kreditermächtigung" },
      {
        t: "table",
        header: ["Investition 2026", "Auszahlungen", "Einzahlungen"],
        rows: [
          ["Erweiterung Gemeindekindergarten „Lindenhof“ um eine Krippengruppe", "1.380.000 €", "690.000 €"],
          ["Ersatzbeschaffung HLF 10 für die Ortswehr Heidhof", "520.000 €", "120.000 €"],
          ["Wirtschaftsweg Heidhof–Kleinbracken (Moorweg, 2. Bauabschnitt)", "260.000 €", "–"],
          ["Breitbandausbau, Eigenanteil der Gemeinde", "310.000 €", "–"],
          ["Schallschutzmaßnahmen Dorfgemeinschaftshaus Lindenweg", "95.000 €", "–"],
          ["Kommunaltraktor mit Winterdienstausstattung", "145.000 €", "–"],
          ["Sonstige Investitionen", "130.000 €", "–"],
          ["Investitionspauschale und Grundstückserlöse", "–", "516.000 €"],
          ["Summe", "2.840.000 €", "1.326.000 €"],
        ],
        widths: [6, 2, 2],
      },
      {
        t: "p",
        text: "Nach § 114 Abs. 2 KV ist die Genehmigung zu versagen, wenn die Kreditverpflichtungen mit der dauernden Leistungsfähigkeit der Gemeinde nicht im Einklang stehen. Die Verschuldung aus Investitionskrediten steigt von 711 € (31.12.2025) auf 833 € je Einwohnerin und Einwohner (31.12.2026) und liegt damit über dem Landesdurchschnitt vergleichbarer Gemeinden (742 €). Der Schuldendienst erreicht 461.000 €.",
      },
      {
        t: "p",
        text: "Die Kommunalaufsicht genehmigt den Gesamtbetrag dennoch, weil der weit überwiegende Teil der Investitionen der Erfüllung von Pflichtaufgaben dient: Die Krippengruppe sichert den Rechtsanspruch nach § 24 SGB VIII und ist mit 50 % aus dem Landesprogramm „Kita-Ausbau 2026“ gefördert (Förderbescheid vom 04.11.2025). Das HLF 10 setzt den Feuerwehrbedarfsplan 2025–2030 nach dem Brandschutz- und Hilfeleistungsgesetz um. Der Breitbandausbau ist hoch gefördert, die Schallschutzmaßnahmen am Dorfgemeinschaftshaus dienen dem Immissionsschutz. Der 2. Bauabschnitt des Moorwegs ist dagegen zeitlich verschiebbar. Für diesen Teilbetrag wird die Genehmigung deshalb nach § 36 Abs. 2 Nr. 2 VwVfG unter eine aufschiebende Bedingung gestellt.",
      },
      { t: "h1", text: "IV. Hinweise" },
      {
        t: "ul",
        items: [
          "Die Haushaltssatzung ist nach Zugang dieser Genehmigung öffentlich bekannt zu machen; dabei ist auf die Genehmigung, die Bedingung und die Auflagen hinzuweisen. Bis zur Bekanntmachung gelten die Regeln der vorläufigen Haushaltsführung nach § 116 KV.",
          "Den Eintritt der Bedingung nach Nr. I.1 bestätigt die Kommunalaufsicht nach Prüfung der Fortschreibung schriftlich.",
          "Eine Durchschrift dieser Verfügung erhält das Rechnungsprüfungsamt des Landkreises Altmoorland.",
        ],
      },
      { t: "h1", text: "V. Rechtsbehelfsbelehrung" },
      {
        t: "p",
        text: "Gegen diese Verfügung kann innerhalb eines Monats nach Bekanntgabe Klage beim Verwaltungsgericht Rhedenburg, Justizplatz 3, 00110 Rhedenburg, erhoben werden. Die Klage ist schriftlich oder zur Niederschrift der Urkundsbeamtin oder des Urkundsbeamten der Geschäftsstelle des Gerichts zu erheben. Sie kann auch elektronisch nach Maßgabe des § 55a VwGO eingereicht werden.",
      },
      { t: "p", text: "Mit freundlichen Grüßen" },
      { t: "signature", lines: ["Im Auftrag", "gez. Rademacher", "Fachdienstleiter Kommunalaufsicht und Recht"] },
    ],
  },
  {
    type: "excel",
    id: "am-kreisumlage-2026-festsetzung",
    title: "Festsetzung der Kreisumlage 2026 nach Gemeinden",
    kind: "Berechnung",
    fileName: "Kreisumlage 2026 Festsetzung nach Gemeinden",
    org: "altmoorland",
    unit: "am-finanzen",
    author: "am-wulf",
    date: "2026-01-20",
    tags: ["zahlen"],
    keywords: ["Umlagegrundlagen", "Steuerkraftmesszahl", "Schlüsselzuweisungen", "Krähenwerder", "Hebesatz Kreisumlage 2026"],
    summary:
      "Berechnung der Kreisumlage 2026 je Gemeinde (Hebesatz 34,5 % statt 33,0 %) aus Steuerkraftmesszahl und Schlüsselzuweisungen, mit Vergleich zu 2025, Umlage je Einwohner und Anteil am Aufkommen; Blätter mit Bezügen untereinander.",
    sheets: [
      {
        name: "Festsetzung 2026",
        title: "Kreisumlage 2026 – Festsetzung nach Gemeinden",
        subtitle: "Fachdienst Finanzen · Stand 20.01.2026 · Beträge in Euro",
        columns: [
          { header: "Gemeinde", width: 22 },
          { header: "Einwohner 31.12.2024", width: 12, fmt: "int" },
          { header: "Umlage-grundlagen 2025", width: 15, fmt: "eur0" },
          { header: "Kreisumlage 2025", width: 15, fmt: "eur0" },
          { header: "Umlage-grundlagen 2026", width: 15, fmt: "eur0" },
          { header: "Kreisumlage 2026", width: 15, fmt: "eur0" },
          { header: "Veränderung", width: 13, fmt: "eur0" },
          { header: "Veränd. in %", width: 10, fmt: "pct" },
          { header: "Umlage je Einwohner 2026", width: 13, fmt: "eur" },
          { header: "Anteil am Aufkommen", width: 11, fmt: "pct" },
        ],
        rows: [
          ["Stadt Rabensfurt", 38600, 60912000, { f: "ROUND(C{r}*Parameter!B5,2)" }, { f: "'Umlagegrundlagen 2026'!D{r}" }, { f: "ROUND(E{r}*Parameter!B6,2)" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "F{r}/B{r}" }, { f: "F{r}/SUM(F$5:F$12)" }],
          ["Stadt Altmoor", 24100, 36488000, { f: "ROUND(C{r}*Parameter!B5,2)" }, { f: "'Umlagegrundlagen 2026'!D{r}" }, { f: "ROUND(E{r}*Parameter!B6,2)" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "F{r}/B{r}" }, { f: "F{r}/SUM(F$5:F$12)" }],
          ["Fennhusen", 11200, 15906000, { f: "ROUND(C{r}*Parameter!B5,2)" }, { f: "'Umlagegrundlagen 2026'!D{r}" }, { f: "ROUND(E{r}*Parameter!B6,2)" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "F{r}/B{r}" }, { f: "F{r}/SUM(F$5:F$12)" }],
          ["Torfkamp", 9400, 12540000, { f: "ROUND(C{r}*Parameter!B5,2)" }, { f: "'Umlagegrundlagen 2026'!D{r}" }, { f: "ROUND(E{r}*Parameter!B6,2)" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "F{r}/B{r}" }, { f: "F{r}/SUM(F$5:F$12)" }],
          ["Brackenhain", 6840, 9918000, { f: "ROUND(C{r}*Parameter!B5,2)" }, { f: "'Umlagegrundlagen 2026'!D{r}" }, { f: "ROUND(E{r}*Parameter!B6,2)" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "F{r}/B{r}" }, { f: "F{r}/SUM(F$5:F$12)" }],
          ["Schilfwerder", 5100, 6702000, { f: "ROUND(C{r}*Parameter!B5,2)" }, { f: "'Umlagegrundlagen 2026'!D{r}" }, { f: "ROUND(E{r}*Parameter!B6,2)" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "F{r}/B{r}" }, { f: "F{r}/SUM(F$5:F$12)" }],
          ["Lütjenbrook", 3900, 5031000, { f: "ROUND(C{r}*Parameter!B5,2)" }, { f: "'Umlagegrundlagen 2026'!D{r}" }, { f: "ROUND(E{r}*Parameter!B6,2)" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "F{r}/B{r}" }, { f: "F{r}/SUM(F$5:F$12)" }],
          ["Krähenwerder", 2700, 4215000, { f: "ROUND(C{r}*Parameter!B5,2)" }, { f: "'Umlagegrundlagen 2026'!D{r}" }, { f: "ROUND(E{r}*Parameter!B6,2)" }, { f: "F{r}-D{r}" }, { f: "G{r}/D{r}" }, { f: "F{r}/B{r}" }, { f: "F{r}/SUM(F$5:F$12)" }],
          {
            total: true,
            cells: [
              "Landkreis gesamt",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "F{r}-D{r}" },
              { f: "G{r}/D{r}" },
              { f: "F{r}/B{r}" },
              { f: "SUM(J{first}:J{last})" },
            ],
          },
        ],
        notes: [
          "Hebesätze siehe Blatt „Parameter“; Umlagegrundlagen 2026 siehe Blatt „Umlagegrundlagen 2026“.",
          "Die Kreisumlage wird in vier Teilbeträgen zum 15.02., 15.05., 15.08. und 15.11.2026 fällig. Die Bescheide gehen den Gemeinden bis zum 30.01.2026 zu.",
          "Krähenwerder: Rückgang der Umlagegrundlagen wegen Gewerbesteuerrückzahlung eines Windparkbetreibers im Referenzzeitraum.",
        ],
      },
      {
        name: "Umlagegrundlagen 2026",
        title: "Umlagegrundlagen 2026",
        subtitle: "Steuerkraftmesszahlen und Schlüsselzuweisungen nach dem Finanzausgleichsgesetz (FAG), Festsetzungsbescheid des Landes vom 09.01.2026",
        columns: [
          { header: "Gemeinde", width: 22 },
          { header: "Steuerkraftmesszahl 2026", width: 16, fmt: "eur0" },
          { header: "Schlüsselzuweisungen 2026", width: 16, fmt: "eur0" },
          { header: "Umlagegrundlagen 2026", width: 16, fmt: "eur0" },
          { header: "je Einwohner", width: 12, fmt: "eur0" },
          { header: "Veränderung zu 2025", width: 13, fmt: "pct" },
        ],
        rows: [
          ["Stadt Rabensfurt", 51820400, 10325600, { f: "B{r}+C{r}" }, { f: "D{r}/'Festsetzung 2026'!B{r}" }, { f: "D{r}/'Festsetzung 2026'!C{r}-1" }],
          ["Stadt Altmoor", 29402300, 7711700, { f: "B{r}+C{r}" }, { f: "D{r}/'Festsetzung 2026'!B{r}" }, { f: "D{r}/'Festsetzung 2026'!C{r}-1" }],
          ["Fennhusen", 12980500, 3483500, { f: "B{r}+C{r}" }, { f: "D{r}/'Festsetzung 2026'!B{r}" }, { f: "D{r}/'Festsetzung 2026'!C{r}-1" }],
          ["Torfkamp", 9214800, 3757200, { f: "B{r}+C{r}" }, { f: "D{r}/'Festsetzung 2026'!B{r}" }, { f: "D{r}/'Festsetzung 2026'!C{r}-1" }],
          ["Brackenhain", 8678000, 1742000, { f: "B{r}+C{r}" }, { f: "D{r}/'Festsetzung 2026'!B{r}" }, { f: "D{r}/'Festsetzung 2026'!C{r}-1" }],
          ["Schilfwerder", 4602300, 2282700, { f: "B{r}+C{r}" }, { f: "D{r}/'Festsetzung 2026'!B{r}" }, { f: "D{r}/'Festsetzung 2026'!C{r}-1" }],
          ["Lütjenbrook", 3311900, 1836100, { f: "B{r}+C{r}" }, { f: "D{r}/'Festsetzung 2026'!B{r}" }, { f: "D{r}/'Festsetzung 2026'!C{r}-1" }],
          ["Krähenwerder", 3055200, 751800, { f: "B{r}+C{r}" }, { f: "D{r}/'Festsetzung 2026'!B{r}" }, { f: "D{r}/'Festsetzung 2026'!C{r}-1" }],
          {
            total: true,
            cells: [
              "Summe",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "D{r}/'Festsetzung 2026'!B{r}" },
              { f: "D{r}/'Festsetzung 2026'!C{r}-1" },
            ],
          },
        ],
        notes: ["Referenzzeitraum für die Steuerkraft: 01.07.2024 bis 30.06.2025."],
      },
      {
        name: "Parameter",
        title: "Parameter",
        columns: [
          { header: "Parameter", width: 40 },
          { header: "Wert", width: 12, fmt: "pct" },
        ],
        rows: [
          ["Hebesatz Kreisumlage 2025", 0.33],
          ["Hebesatz Kreisumlage 2026", 0.345],
        ],
        notes: ["Hebesatz 2026 nach § 5 der Haushaltssatzung 2026, beschlossen vom Kreistag am 11.12.2025."],
      },
    ],
  },
  {
    type: "word",
    id: "am-saep-hochwasser-altmoorer-aue",
    title: "Sonder-Alarm- und Einsatzplan Hochwasser Altmoorer Aue und Brackenbach",
    kind: "Sonder-Alarm- und Einsatzplan",
    fileName: "SAEP Hochwasser Altmoorer Aue Version 3.0",
    org: "altmoorland",
    unit: "am-bevoelkerungsschutz",
    author: "am-hinsch",
    date: "2025-04-08",
    keywords: ["SAEP Hochwasser", "Pegel Altmoor-Mühlenwehr", "Stab für außergewöhnliche Ereignisse", "Quellkade", "Haus Auenblick", "Bürgertelefon"],
    summary:
      "Fortgeschriebener Sonder-Alarm- und Einsatzplan (Version 3.0) für Hochwasser an Altmoorer Aue und Brackenbach: Gefährdungsanalyse, Pegel und Alarmstufen, Führungsorganisation, Maßnahmen je Stufe, Sandsacklogistik, Räumung, Tierhaltungen, Warnung und Erreichbarkeiten – langes Referenzdokument für Zusammenfassungen, Checklisten und Leichte-Sprache-Übungen.",
    meta: [
      ["Aktenzeichen", "38.2-131.11/25"],
      ["Version", "3.0 (ersetzt Version 2.0 vom 14.11.2022)"],
      ["Gültig ab", "08.04.2025"],
      ["Einstufung", "VS – Nur für den Dienstgebrauch"],
    ],
    subject: "Sonder-Alarm- und Einsatzplan Hochwasser für die Altmoorer Aue und den Brackenbach (SAEP Hochwasser)",
    blocks: [
      { t: "h1", text: "Verteiler und Änderungsnachweis" },
      {
        t: "table",
        header: ["Empfänger", "Form"],
        rows: [
          ["Landrat, Stab für außergewöhnliche Ereignisse (Lagezentrum Kreishaus)", "digital und 2 Papierexemplare"],
          ["Kreisbrandmeister, Abschnittsleitungen der Kreisfeuerwehrbereitschaft", "digital"],
          ["Integrierte Regionalleitstelle Altmoorland", "digital und 1 Papierexemplar"],
          ["Hauptverwaltungsbeamtinnen und -beamte der Städte und Gemeinden, Gemeindewehrführungen", "digital"],
          ["Polizeiinspektion Altmoor", "digital"],
          ["Deichverband Altmoorer Aue", "digital"],
          ["Untere Wasserbehörde, Veterinäramt, Gesundheitsamt, Fachdienst Kreisstraßen", "digital"],
          ["Sanitäts- und Betreuungsdienste der Hilfsorganisationen im Kreis", "digital"],
        ],
        widths: [7, 3],
      },
      {
        t: "table",
        header: ["Version", "Datum", "Wesentliche Änderungen"],
        rows: [
          ["1.0", "03/2019", "Erstfassung"],
          ["2.0", "11/2022", "Neue Hochwassergefahrenkarten des Landes, Aufnahme des Brackenbachs"],
          [
            "3.0",
            "04/2025",
            "Auswertung Winterhochwasser 2023/24: neue Richtwerte am Pegel Altmoor-Mühlenwehr, zusätzliche Notunterkünfte, Abschnitt Tierhaltungen, Bürgertelefon, Warnung über Warn-App und Sirenen, aktualisierte Erreichbarkeiten",
          ],
        ],
        widths: [1, 2, 7],
      },
      { t: "h1", text: "1 Allgemeines" },
      { t: "h2", text: "1.1 Zweck und Geltungsbereich" },
      {
        t: "p",
        text: "Dieser Sonder-Alarm- und Einsatzplan (**SAEP Hochwasser**) regelt Alarmierung, Führung und Maßnahmen bei Hochwasser an der Altmoorer Aue zwischen der Kreisgrenze oberhalb von Fennhusen und der Mündung unterhalb von Schilfwerder sowie am Brackenbach im Gebiet der Gemeinde Brackenhain (Ortsteil Heidhof). Er ergänzt den Allgemeinen Alarm- und Einsatzplan des Landkreises und die Alarm- und Ausrückeordnungen der Feuerwehren.",
      },
      {
        t: "p",
        text: "Nicht Gegenstand dieses Plans sind Sturzfluten nach Starkregen abseits der genannten Gewässer. Hierfür wird ein eigener Plan erarbeitet. Bis dahin gelten die allgemeinen Regelungen zur Hilfeleistung.",
      },
      { t: "h2", text: "1.2 Rechtsgrundlagen" },
      {
        t: "ul",
        items: [
          "Brandschutz- und Hilfeleistungsgesetz (BrSchG)",
          "Katastrophenschutzgesetz (KatSG)",
          "Wasserhaushaltsgesetz (WHG), insbesondere §§ 72 bis 81 (Hochwasserschutz)",
          "Deichgesetz (DeichG) und Satzung des Deichverbands Altmoorer Aue",
          "Rettungsdienstgesetz (RettDG)",
          "Feuerwehr-Dienstvorschrift 100 „Führung und Leitung im Einsatz“ (FwDV 100)",
        ],
      },
      { t: "h2", text: "1.3 Zuständigkeiten" },
      {
        t: "table",
        header: ["Aufgabe", "Zuständig"],
        rows: [
          ["Gefahrenabwehr bis zur Feststellung des Katastrophenfalls", "Städte und Gemeinden (örtliche Einsatzleitung durch die Feuerwehr); ab Alarmstufe 2 koordiniert der Landkreis"],
          ["Deichverteidigung", "Deichverband Altmoorer Aue mit Unterstützung der Feuerwehren"],
          ["Katastrophenschutz", "Landkreis Altmoorland als untere Katastrophenschutzbehörde (Landrat)"],
          ["Hochwassermeldedienst, Pegelvorhersagen", "Hochwasservorhersagezentrale des Landes"],
          ["Warnung der Bevölkerung", "Landkreis (Leitstelle, Pressestelle), Gemeinden (Durchsagen vor Ort)"],
          ["Gewässeraufsicht, Anlagen am Gewässer", "Untere Wasserbehörde"],
          ["Tierhaltungen im Überschwemmungsgebiet", "Veterinär- und Lebensmittelüberwachungsamt"],
          ["Trinkwasser, Abwasser, Gesundheitsgefahren", "Gesundheitsamt mit den Versorgungsunternehmen"],
          ["Absperrungen, Verkehrslenkung, Unterstützung bei Räumungen", "Polizeiinspektion Altmoor mit den Straßenbaulastträgern"],
        ],
        widths: [4, 6],
      },
      { t: "h1", text: "2 Gefährdungsanalyse" },
      { t: "h2", text: "2.1 Gewässer und Hochwasserentstehung" },
      {
        t: "p",
        text: "Die Altmoorer Aue durchfließt das Kreisgebiet auf einer Länge von 41 km. Das Einzugsgebiet am Pegel Schilfwerder umfasst 612 km². Hochwasser entstehen überwiegend im Winterhalbjahr bei lang anhaltenden Niederschlägen auf gesättigtem oder gefrorenem Boden, verstärkt durch Schneeschmelze. Die Hochwasserwelle braucht von Fennhusen bis Altmoor rund **14 Stunden**, von Altmoor bis Schilfwerder rund **9 Stunden**. Diese Vorwarnzeit ist für die Vorbereitung der Maßnahmen in den Unterliegern konsequent zu nutzen.",
      },
      {
        t: "p",
        text: "Der Brackenbach ist ein kleines, schnell reagierendes Gewässer. Nach Starkregen steigt der Wasserstand innerhalb von zwei bis vier Stunden. Die Vorwarnzeit reicht dort in der Regel nur für Warnung und Sicherung, nicht für umfangreiche Verbaumaßnahmen.",
      },
      {
        t: "p",
        text: "Zwischen Altmoor und Schilfwerder schützen 18,6 km Deich die Ortslagen. Bekannte Schwachstellen sind der Deichabschnitt D 7 „Schleusenweg“ (Sickerstellen beim Winterhochwasser 2023/24) und die Deichscharte Werderstraße in Schilfwerder, die mit mobilen Verschlusselementen geschlossen wird. Die Elemente lagern im Bauhof Schilfwerder; der Aufbau dauert mit acht Personen rund drei Stunden.",
      },
      { t: "h2", text: "2.2 Betroffene Bereiche" },
      {
        t: "p",
        text: "Die folgende Übersicht beruht auf den Hochwassergefahrenkarten des Landes für ein hundertjährliches Hochwasser (HQ100) und ein Extremhochwasser (HQextrem) sowie den Einwohnerdaten der Gemeinden zum 31.12.2024.",
      },
      {
        t: "table",
        header: ["Gemeinde / Ortslage", "Einwohner HQ100", "Einwohner HQextrem", "Besondere Objekte"],
        rows: [
          ["Fennhusen, Brückenstraße und Auenweg", "410", "820", "Seniorenheim „Haus Auenblick“ (64 Bewohnerinnen und Bewohner), Grundschule Auenweg"],
          ["Stadt Altmoor, Am Mühlenwehr, Auenstraße, Gewerbegebiet Süd", "1.240", "2.380", "Umspannwerk Süd, Kläranlage Altmoor, Kreisfeuerwehrzentrale (nur HQextrem)"],
          ["Schilfwerder, Unterdorf und Werderstraße", "680", "1.150", "Kläranlage Schilfwerder, Kindertagesstätte Werderstraße"],
          ["Brackenhain, Ortsteil Heidhof (Brackenbach)", "190", "340", "drei landwirtschaftliche Betriebe mit Tierhaltung, Feuerwehrhaus Heidhof"],
          ["Torfkamp, Auenhöfe (Einzellagen)", "60", "210", "Biogasanlage Auenhöfe"],
          ["Summe", "2.580", "4.900", ""],
        ],
        widths: [4, 2, 2, 5],
      },
      { t: "h2", text: "2.3 Kritische Infrastruktur" },
      {
        t: "ul",
        items: [
          "**Umspannwerk Süd (Altmoor):** Der Netzbetreiber schaltet ab einem Wasserstand von 3,55 m am Pegel Altmoor-Mühlenwehr ab. Betroffen wären rund 6.000 Haushalte im Süden der Stadt Altmoor und in Schilfwerder. Die Abschaltung ist mindestens sechs Stunden vorher anzukündigen.",
          "**Kläranlagen Altmoor und Schilfwerder:** Bei Überflutung droht der Austrag von ungereinigtem Abwasser. Das Gesundheitsamt und die untere Wasserbehörde sind ab Alarmstufe 2 zu beteiligen.",
          "**Trinkwasserbrunnen Fennhusen:** Das Wasserschutzgebiet (Zone II) liegt teilweise im HQextrem. Der Wasserversorger hält einen Notbetrieb über den Hochbehälter Altmoor vor.",
          "**Kreisstraße K 12 Altmoor–Schilfwerder:** Überflutung ab Alarmstufe 3 am Pegel Schilfwerder; Umleitung über Torfkamp (plus 11 km).",
          "**Brücke Brückenstraße Fennhusen:** Sperrung ab 3,00 m am Pegel Fennhusen wegen Treibgut und Unterspülung.",
          "**Biogasanlage Auenhöfe (Torfkamp):** Gärrestbehälter im HQextrem; Betreiber muss ab Alarmstufe 2 die Befüllung einstellen.",
        ],
      },
      { t: "h1", text: "3 Pegel und Alarmstufen" },
      {
        t: "p",
        text: "Grundlage der Alarmierung sind die Meldestufen und Vorhersagen der Hochwasservorhersagezentrale des Landes. Die Integrierte Regionalleitstelle Altmoorland ruft die Pegel automatisch ab und löst bei Erreichen eines Richtwerts die Alarmierung nach diesem Plan aus. Maßgeblich ist der jeweils ungünstigste Pegel im betroffenen Abschnitt; eine amtliche Vorhersage, dass ein Richtwert innerhalb von 12 Stunden erreicht wird, steht dem Erreichen gleich.",
      },
      {
        t: "table",
        header: ["Pegel", "Mittelwasser", "Stufe 1", "Stufe 2", "Stufe 3", "Höchster bekannter Wasserstand"],
        rows: [
          ["Fennhusen", "1,20 m", "2,10 m", "2,60 m", "3,10 m", "3,38 m (01/2011)"],
          ["Altmoor-Mühlenwehr", "1,45 m", "2,40 m", "2,90 m", "3,40 m", "3,71 m (12/2023)"],
          ["Schilfwerder", "0,95 m", "1,80 m", "2,30 m", "2,75 m", "3,05 m (01/2024)"],
          ["Brackenbach Heidhof", "0,40 m", "0,90 m", "1,20 m", "1,50 m", "1,62 m (08/2020)"],
        ],
        widths: [3, 2, 2, 2, 2, 3],
      },
      {
        t: "table",
        header: ["Alarmstufe", "Bezeichnung", "Auslöser", "Typische Lage"],
        rows: [
          ["1", "Vorwarnung", "Richtwert Stufe 1 an einem Pegel oder entsprechende Vorhersage", "Ausuferungen in Niederungen, keine Gefahr für Bebauung"],
          ["2", "Hochwasserbereitschaft", "Richtwert Stufe 2 oder Vorhersage Stufe 3 innerhalb von 24 Stunden", "Überflutung von Wegen und Straßen, Deichwachen erforderlich"],
          ["3", "Hochwasserabwehr", "Richtwert Stufe 3", "Gefahr für Bebauung und Infrastruktur, Deichverteidigung, Räumungen möglich"],
          ["4", "Katastrophenfall", "Feststellung durch den Landrat nach dem KatSG", "großflächige Gefährdung, überörtliche Hilfe erforderlich"],
        ],
        widths: [1, 3, 4, 4],
      },
      {
        t: "note",
        text: "**Neu in Version 3.0:** Der Richtwert für Stufe 3 am Pegel Altmoor-Mühlenwehr wurde von 3,55 m auf 3,40 m gesenkt. Beim Winterhochwasser 2023/24 traten am Deichabschnitt D 7 bereits bei 3,45 m Sickerstellen auf.",
      },
      { t: "h1", text: "4 Führungsorganisation" },
      { t: "h2", text: "4.1 Alarmstufen 1 und 2" },
      {
        t: "p",
        text: "In den Alarmstufen 1 und 2 liegt die Einsatzleitung bei der jeweiligen Gemeindefeuerwehr. Ab Alarmstufe 2 koordiniert der Kreisbrandmeister oder seine Vertretung den Einsatz der Kräfte im Kreisgebiet. Dazu wird die **Technische Einsatzleitung (TEL)** in der Kreisfeuerwehrzentrale Altmoor eingerichtet. Die TEL meldet die Lage mindestens alle sechs Stunden an den Landrat und an das Sachgebiet Katastrophenschutz.",
      },
      { t: "h2", text: "4.2 Stab für außergewöhnliche Ereignisse" },
      {
        t: "p",
        text: "Ab Alarmstufe 3 ruft der Landrat den **Stab für außergewöhnliche Ereignisse** ein. Er besteht aus dem Führungsstab und dem Verwaltungsstab und tritt im Lagezentrum des Kreishauses (Raum 1.20) zusammen. Ausweichstandort ist die Kreisfeuerwehrzentrale; droht ein Extremhochwasser, weicht der Stab in die Rettungswache Rabensfurt aus.",
      },
      {
        t: "table",
        header: ["Funktion", "Besetzung", "Vertretung"],
        rows: [
          ["Leitung des Stabes", "Landrat Wolfgang Tiedemann", "Erste Kreisrätin Dr. Annette Kloß"],
          ["Leitung Führungsstab", "Kreisbrandmeister Frank Meyerhoff", "stellv. Kreisbrandmeister"],
          ["S1 Personal und Innerer Dienst", "Kreisfeuerwehrbereitschaft", "Fachdienst Personal"],
          ["S2 Lage", "Sachgebiet Katastrophenschutz (Lars Hinsch)", "Kreisfeuerwehrbereitschaft"],
          ["S3 Einsatz", "Kreisbrandmeister bzw. Abschnittsleitung", "Kreisfeuerwehrbereitschaft"],
          ["S4 Versorgung", "Kreisfeuerwehrbereitschaft, Logistikzug", "Fachdienst Finanzen (Beschaffung)"],
          ["S5 Presse- und Medienarbeit", "Pressesprecherin Lena Harms", "Pressestelle"],
          ["S6 Information und Kommunikation", "Informations- und Kommunikationszug", "Zweckverband Kommunale IT Altmoor (Rufbereitschaft)"],
          ["Verwaltungsstab", "Dezernentin 3 Claudia Rieger", "Fachdienstleitungen nach Lage"],
        ],
        widths: [3, 4, 4],
      },
      {
        t: "p",
        text: "Dem Verwaltungsstab gehören je nach Lage Vertretungen der Fachdienste Ordnung, Finanzen, Soziales, Schulen, des Gesundheitsamts, des Veterinäramts, der unteren Wasserbehörde, der Bauaufsicht und des Fachdienstes Kreisstraßen an. Verbindungspersonen entsenden die Polizeiinspektion Altmoor, der Deichverband, die betroffenen Gemeinden und bei Bedarf der Netzbetreiber.",
      },
      { t: "h2", text: "4.3 Einsatzabschnitte" },
      {
        t: "table",
        header: ["Einsatzabschnitt", "Bereich", "Abschnittsleitung"],
        rows: [
          ["EA 1 Fennhusen", "Ortslage Fennhusen, Brücke Brückenstraße, Seniorenheim", "Gemeindewehrführung Fennhusen"],
          ["EA 2 Altmoor", "Stadtgebiet Altmoor, Umspannwerk, Kläranlage", "Stadtbrandmeister Altmoor"],
          ["EA 3 Deich und Schilfwerder", "Deichabschnitte D 1 bis D 9, Ortslage Schilfwerder", "Deichhauptmann mit Gemeindewehrführung Schilfwerder"],
          ["EA 4 Brackenbach", "Ortsteil Heidhof, landwirtschaftliche Betriebe", "Gemeindewehrführung Brackenhain"],
          ["EA 5 Logistik", "Sandsackfüllplätze, Bereitstellungsraum Kreisfeuerwehrzentrale", "Zugführung Logistikzug"],
          ["EA 6 Betreuung", "Sammelstellen und Notunterkünfte", "Leitung Betreuungsdienst"],
        ],
        widths: [3, 5, 4],
      },
      { t: "h1", text: "5 Maßnahmen nach Alarmstufen" },
      { t: "h2", text: "5.1 Alarmstufe 1 – Vorwarnung" },
      {
        t: "table",
        header: ["Maßnahme", "Zuständig"],
        rows: [
          ["Pegelstände und Vorhersagen mindestens alle sechs Stunden abfragen und dokumentieren", "Leitstelle"],
          ["Kreisbrandmeister, Sachgebiet Katastrophenschutz und betroffene Gemeinden informieren", "Leitstelle"],
          ["Bestände an Sandsäcken, Pumpen und Füllgeräten prüfen und melden", "Sachgebiet Katastrophenschutz, Gemeindefeuerwehren"],
          ["Deichverband informieren, Termin für eine Deichschau abstimmen", "Sachgebiet Katastrophenschutz"],
          ["Tierhaltungen im Überschwemmungsgebiet vorwarnen (Liste in Anlage 4)", "Veterinäramt"],
          ["Pressestelle vorab informieren, Textbausteine bereitlegen", "Sachgebiet Katastrophenschutz"],
        ],
        widths: [7, 4],
      },
      { t: "h2", text: "5.2 Alarmstufe 2 – Hochwasserbereitschaft" },
      {
        t: "table",
        header: ["Maßnahme", "Zuständig"],
        rows: [
          ["TEL einrichten, Lagekarte führen, Pegel stündlich abfragen", "Kreisbrandmeister"],
          ["Deichwachen in Zweierteams, Kontrollgang alle vier Stunden (Abschnitte D 5 bis D 9)", "Deichverband, Feuerwehren"],
          ["Sandsackfüllplatz Kreisfeuerwehrzentrale in Betrieb nehmen, Ausgabe an die Gemeinden", "EA 5 Logistik"],
          ["Mobile Verschlusselemente Deichscharte Werderstraße bereitstellen", "Gemeinde Schilfwerder"],
          ["Sperrung der Brücke Brückenstraße Fennhusen vorbereiten", "Gemeinde Fennhusen, Polizei"],
          ["Warnmeldung über die Warn-App und Pressemitteilung herausgeben", "Pressestelle mit Leitstelle"],
          ["**Bürgertelefon** 040 66969-186 schalten (täglich 8 bis 20 Uhr)", "Fachdienst Organisation und Digitalisierung (Personalpool)"],
          ["Notunterkünfte vorbereiten (zuerst Kreissporthalle Altmoor)", "Betreuungsdienst, Fachdienst Schulen"],
          ["Seniorenheim „Haus Auenblick“ informieren, Räumungsplanung abstimmen", "Gemeinde Fennhusen, Gesundheitsamt"],
          ["Kita Werderstraße Schilfwerder: Schließung ab Erreichen von Stufe 3 ankündigen", "Gemeinde Schilfwerder"],
          ["Betreiber Biogasanlage, Kläranlagen und Netzbetreiber informieren", "TEL"],
        ],
        widths: [7, 4],
      },
      { t: "h2", text: "5.3 Alarmstufe 3 – Hochwasserabwehr" },
      {
        t: "table",
        header: ["Maßnahme", "Zuständig"],
        rows: [
          ["Stab für außergewöhnliche Ereignisse einberufen", "Landrat"],
          ["Deichverteidigung: Quellkaden setzen, Deich aufkaden, Sickerstellen sichern", "EA 3, Deichverband"],
          ["Deichscharte Werderstraße schließen", "Gemeinde Schilfwerder, EA 3"],
          ["Räumung gefährdeter Bereiche nach Abschnitt 7 vorbereiten oder anordnen", "Stab, Gemeinden, Polizei, Betreuungsdienst"],
          ["Sirenenwarnung (Signal „Warnung“: eine Minute auf- und abschwellender Heulton)", "Leitstelle auf Weisung des Stabes"],
          ["Abschaltung Umspannwerk Süd mit dem Netzbetreiber abstimmen", "S3"],
          ["Sperrung K 12 und Umleitung über Torfkamp", "Polizei, Fachdienst Kreisstraßen"],
          ["Räumung von Tierbeständen in Heidhof und Schilfwerder einleiten", "Veterinäramt mit den Tierhaltern"],
          ["Überörtliche Kräfte anfordern (Kreisfeuerwehrbereitschaft, Nachbarkreise)", "Stab"],
          ["Lagemeldung an das für Inneres zuständige Ministerium", "S2"],
        ],
        widths: [7, 4],
      },
      { t: "h2", text: "5.4 Alarmstufe 4 – Katastrophenfall" },
      {
        t: "p",
        text: "Der Landrat stellt den Katastrophenfall fest, wenn die Gefahr mit den Kräften der Gemeinden und des Landkreises nicht mehr abgewehrt werden kann. Die Feststellung wird über Presse, Warn-App und die Internetseite www.altmoorland.example/hochwasser bekannt gemacht. Mit der Feststellung übernimmt der Landkreis die Gesamteinsatzleitung. Hilfe anderer Katastrophenschutzbehörden und der Streitkräfte (Amtshilfe nach Art. 35 GG) fordert der Stab über das Land an.",
      },
      { t: "h1", text: "6 Deichverteidigung und Sandsacklogistik" },
      { t: "h2", text: "6.1 Bestände" },
      {
        t: "table",
        header: ["Lager", "leere Sandsäcke", "gefüllte Sandsäcke", "Sonstiges"],
        rows: [
          ["Zentrallager Kreisfeuerwehrzentrale Altmoor", "60.000", "12.000", "2 Sandsackfüllmaschinen, 40 Paletten Vlies"],
          ["Stadt Altmoor, Bauhof", "5.000", "8.000", "Radlader"],
          ["Gemeinde Fennhusen, Feuerwehrhaus", "2.000", "5.000", "–"],
          ["Gemeinde Schilfwerder, Bauhof", "3.000", "6.000", "mobile Verschlusselemente Deichscharte"],
          ["Gemeinde Brackenhain, Bauhof", "2.000", "3.000", "Tauchpumpen"],
          ["Summe", "72.000", "34.000", ""],
        ],
        widths: [5, 2, 2, 4],
      },
      {
        t: "p",
        text: "Sand wird nach einer Rahmenvereinbarung vom Kies- und Sandwerk Am Moordamm geliefert: 400 Tonnen innerhalb von sechs Stunden nach Abruf, rund um die Uhr. Abruf über S4 oder die TEL.",
      },
      { t: "h2", text: "6.2 Füllplätze und Leistung" },
      {
        t: "p",
        text: "Eine Füllmaschine füllt bis zu 1.200 Sandsäcke je Stunde und braucht dafür zwölf Personen je Schicht. Bei Handbefüllung schafft ein Trupp aus vier Personen rund 100 Säcke je Stunde. Füllplätze werden in dieser Reihenfolge eingerichtet: Kreisfeuerwehrzentrale Altmoor, Bauhof Schilfwerder, Feuerwehrhaus Fennhusen.",
      },
      { t: "h2", text: "6.3 Richtwerte für den Bedarf" },
      {
        t: "ul",
        items: [
          "**Quellkade** um eine Sickerstelle (Durchmesser 1,0 m, Höhe 0,5 m): rund 250 Sandsäcke",
          "Aufkadung um 30 cm auf 100 m Deichlänge: rund 1.800 Sandsäcke",
          "Sicherung eines Hauseingangs: 30 bis 50 Sandsäcke",
          "Bedarf für die Deichverteidigung D 5 bis D 9 bei Alarmstufe 3 nach den Erfahrungen 2023/24: mindestens 25.000 Sandsäcke",
        ],
      },
      { t: "h2", text: "6.4 Spontanhelfende" },
      {
        t: "p",
        text: "Spontanhelfende werden nur an den Füllplätzen eingesetzt, nicht auf dem Deich. Sie melden sich am Registrierpunkt des Füllplatzes an (Name, Erreichbarkeit, Uhrzeit Beginn und Ende), erhalten eine kurze Einweisung und Warnwesten. Sie sind während des Einsatzes nach § 2 SGB VII gesetzlich unfallversichert. Verpflegung stellt S4.",
      },
      { t: "h1", text: "7 Räumung und Evakuierung" },
      { t: "h2", text: "7.1 Grundsätze" },
      {
        t: "p",
        text: "Räumungen ordnet in den Alarmstufen 1 bis 3 die zuständige Gemeinde als Ordnungsbehörde an, ab Einberufung des Stabes in Abstimmung mit dem Stab. Die Bevölkerung wird über Lautsprecherfahrzeuge, die Warn-App und, wo nötig, von Haus zu Haus informiert. Hilfebedürftige Personen, die sich in die Hilfeliste ihrer Gemeinde haben eintragen lassen, werden vorrangig aufgesucht. Die Hilfelisten werden nur mit Einwilligung der Betroffenen geführt und nur im Einsatzfall an die Einsatzleitung übergeben.",
      },
      { t: "h2", text: "7.2 Räumungsgebiete" },
      {
        t: "table",
        header: ["Gebiet", "Einwohner (HQ100)", "Sammelstelle", "Notunterkunft (Plätze)"],
        rows: [
          ["R 1 Fennhusen, Brückenstraße/Auenweg", "410", "Marktplatz Fennhusen", "Schulzentrum Fennhusen (250)"],
          ["R 2 Altmoor, Am Mühlenwehr/Auenstraße", "1.240", "Parkplatz Kreishaus", "Kreissporthalle Altmoor (400)"],
          ["R 3 Schilfwerder, Unterdorf", "680", "Dorfplatz Oberdorf", "Mehrzweckhalle Schilfwerder (150)"],
          ["R 4 Brackenhain, Heidhof", "190", "Kirchplatz Brackenhain", "Dorfgemeinschaftshaus Lindenweg (80)"],
          ["R 5 Torfkamp, Auenhöfe", "60", "Abholung einzeln", "Turnhalle Torfkamp (60)"],
        ],
        widths: [4, 2, 3, 4],
      },
      {
        t: "p",
        text: "Die Notunterkünfte bieten zusammen 940 Plätze. Nach den Erfahrungen anderer Landkreise suchen 20 bis 30 % der geräumten Personen eine Notunterkunft auf; die übrigen kommen bei Angehörigen oder Bekannten unter. Reichen die Plätze nicht aus, stellt der Fachdienst Schulen weitere Sporthallen bereit.",
      },
      { t: "h2", text: "7.3 Seniorenheim „Haus Auenblick“ und weitere Einrichtungen" },
      {
        t: "p",
        text: "Im Seniorenheim **„Haus Auenblick“** in Fennhusen leben 64 Bewohnerinnen und Bewohner, davon 22 bettlägerig. Die Räumung dauert nach der Planung des Trägers rund sechs Stunden und muss deshalb spätestens beginnen, wenn für den Pegel Fennhusen ein Wasserstand von 3,10 m vorhergesagt wird. Aufnehmende Einrichtung ist das Seniorenzentrum Rabensfurt-Süd. Für den Transport sind acht Krankentransportwagen und zwei Busse mit Rampe vorzusehen; die Anforderung erfolgt über die Leitstelle.",
      },
      {
        t: "p",
        text: "Die Kindertagesstätte Werderstraße in Schilfwerder (68 Kinder) bleibt ab Alarmstufe 3 geschlossen. Die Grundschule Auenweg in Fennhusen entscheidet in Abstimmung mit dem Fachdienst Schulen über Unterrichtsausfall.",
      },
      { t: "h2", text: "7.4 Tierhaltungen" },
      {
        t: "p",
        text: "Im Überschwemmungsgebiet liegen vier Betriebe mit größeren Tierbeständen: drei im Ortsteil Heidhof (zusammen rund 220 Rinder, 1.400 Mastschweine und 18 Pferde) und ein Milchviehbetrieb in Schilfwerder (160 Kühe). Die Tierhaltenden sind für ihre Tiere selbst verantwortlich. Das Veterinäramt berät, vermittelt Aufnahmebetriebe und Transportmöglichkeiten und erteilt die tierseuchenrechtlich erforderlichen Genehmigungen für das Verbringen. Weil das Verladen großer Bestände viele Stunden dauert, beginnt die Planung bereits in Alarmstufe 2.",
      },
      { t: "h1", text: "8 Warnung und Information der Bevölkerung" },
      {
        t: "ul",
        items: [
          "**Warn-App:** Warnmeldungen gibt die Leitstelle auf Weisung der TEL oder des Stabes heraus. Die Texte stimmt die Pressestelle ab.",
          "**Sirenen:** Im Kreisgebiet stehen 34 Sirenen, davon 19 in den Hochwassergebieten. Sie werden ab Alarmstufe 3 zentral von der Leitstelle ausgelöst.",
          "**Lautsprecherdurchsagen** durch Feuerwehr und Polizei in den betroffenen Straßen.",
          "**Internet und Presse:** Lageinformationen unter www.altmoorland.example/hochwasser, Pressemitteilungen mindestens zweimal täglich, ab Alarmstufe 3 Pressebriefing um 10 und 16 Uhr im Kreishaus.",
          "**Bürgertelefon:** 040 66969-186, Anfragen per E-Mail an hochwasser@altmoorland.example.",
          "**Mehrsprachigkeit:** Die Pressestelle hält Textbausteine in Leichter Sprache, Englisch, Arabisch und Ukrainisch vor.",
        ],
      },
      {
        t: "note",
        text: "**Muster Warnmeldung Alarmstufe 3:** „Hochwasser an der Altmoorer Aue. Für die Straßen Am Mühlenwehr und Auenstraße in Altmoor besteht Überflutungsgefahr. Bringen Sie Wertsachen und wichtige Dokumente in obere Stockwerke. Halten Sie sich bereit, Ihre Wohnung zu verlassen. Hilfe beim Verlassen der Wohnung: Bürgertelefon 040 66969-186. Achten Sie auf Durchsagen.“",
      },
      { t: "h1", text: "9 Kommunikation und Erreichbarkeiten" },
      {
        t: "p",
        text: "Die Kommunikation der Einsatzkräfte erfolgt über den Digitalfunk der Behörden und Organisationen mit Sicherheitsaufgaben in den Rufgruppen „AM-Hochwasser 1“ (Führung) und „AM-Hochwasser 2“ (Einsatzabschnitte). Fällt das Mobilfunknetz aus, richtet der Informations- und Kommunikationszug Meldeköpfe an den Feuerwehrhäusern ein.",
      },
      {
        t: "table",
        header: ["Stelle", "Erreichbarkeit"],
        rows: [
          ["Integrierte Regionalleitstelle Altmoorland", "Notruf 112, Verwaltung 040 66969-112"],
          ["Lagezentrum Kreishaus (Stab)", "040 66969-185, lagezentrum@altmoorland.example"],
          ["Bürgertelefon Hochwasser", "040 66969-186"],
          ["Kreisbrandmeister Frank Meyerhoff", "040 66969-280"],
          ["Sachgebiet Katastrophenschutz, Lars Hinsch", "040 66969-184"],
          ["Pressestelle, Lena Harms", "040 66969-105"],
          ["Veterinäramt, Dr. Henning Wessel", "040 66969-290"],
          ["Gemeinde Brackenhain, Ordnungsamt", "040 66969-640"],
          ["Stadt Rabensfurt, Fachbereich Bürgerdienste, Ordnung und Feuerwehr", "040 66969-430"],
          ["Deichverband Altmoorer Aue, Deichhauptmann", "040 66969-187"],
          ["Polizeiinspektion Altmoor, Einsatzleitung", "über die Leitstelle"],
        ],
        widths: [6, 5],
      },
      {
        t: "p",
        text: "Die Gemeinden melden Änderungen ihrer Erreichbarkeiten (Hauptverwaltungsbeamte, Gemeindewehrführung, Bauhofleitung) unverzüglich dem Sachgebiet Katastrophenschutz. Die vollständige Kontaktliste steht in Anlage 5 und wird halbjährlich überprüft.",
      },
      { t: "h1", text: "10 Nachbereitung, Übungen und Fortschreibung" },
      {
        t: "ul",
        items: [
          "Nach jedem Einsatz ab Alarmstufe 2 erstellt die TEL einen Einsatzbericht. Die Auswertung mit allen Beteiligten findet spätestens acht Wochen nach Einsatzende statt.",
          "Jedes Jahr findet eine Stabsrahmenübung statt, alle drei Jahre eine Vollübung mit den Gemeinden und dem Deichverband (nächste Vollübung: Herbst 2026).",
          "Das Sachgebiet Katastrophenschutz schreibt den Plan jährlich bis zum 31.10. fort, damit er vor Beginn des Winterhalbjahres aktuell ist.",
        ],
      },
      { t: "h1", text: "Anlage 3: Checkliste für die erste Stabssitzung" },
      {
        t: "ol",
        items: [
          "Lagevortrag S2: Pegelstände, Vorhersagen, Wetter, Schadenslage, eingesetzte Kräfte",
          "Feststellung der Alarmstufe und der betroffenen Einsatzabschnitte",
          "Entscheidung über Räumungen, Schulschließungen und Sperrungen",
          "Warnung der Bevölkerung: Inhalt, Kanäle, Zeitpunkt",
          "Kräfte und Material: Bedarf, Anforderung überörtlicher Hilfe, Sandsäcke",
          "Kritische Infrastruktur: Umspannwerk, Kläranlagen, Trinkwasser",
          "Tierhaltungen: Stand der Räumung",
          "Presse: Briefingtermine, Sprachregelung",
          "Schichtplanung des Stabes für die nächsten 24 Stunden",
          "Nächste Lagebesprechung",
        ],
      },
      { t: "h1", text: "Weitere Anlagen (digital im Einsatzleitsystem)" },
      {
        t: "ul",
        items: [
          "Anlage 1: Hochwassergefahrenkarten HQ100 und HQextrem",
          "Anlage 2: Deichabschnittskarte D 1 bis D 9",
          "Anlage 4: Tierhaltungen im Überschwemmungsgebiet (nur Veterinäramt und Stab)",
          "Anlage 5: Kontaktliste der Gemeinden und Versorgungsunternehmen",
          "Anlage 6: Textbausteine für Warnmeldungen",
        ],
      },
      { t: "p", text: "Der Sonder-Alarm- und Einsatzplan Hochwasser in der Version 3.0 wird hiermit mit Wirkung vom 08.04.2025 in Kraft gesetzt." },
      { t: "signature", lines: ["Altmoor, 08.04.2025", "Wolfgang Tiedemann", "Landrat"] },
    ],
  },
  {
    type: "word",
    id: "am-notizen-buergermeisterdienstbesprechung-2025-06",
    title: "Mitschrift der Bürgermeisterdienstbesprechung im Juni 2025",
    kind: "Mitschrift",
    fileName: "Notizen BM-DB 2025-06-24",
    org: "altmoorland",
    unit: "am-landrat",
    author: "am-rieken",
    date: "2025-06-25",
    tags: ["unstrukturiert"],
    keywords: ["BM-DB", "Eckwert", "Benehmen", "SAEP", "ASP-Übung"],
    summary:
      "Stichpunktartige Mitschrift des persönlichen Referenten aus der Dienstbesprechung des Landrats mit den Bürgermeisterinnen und Bürgermeistern: Kreisumlage 2026, Beitritt Rabensfurt zum Zweckverband, Ausländerbehörde, Hochwasserplan, ASP-Übung – Ausgangsmaterial für ein Ergebnisprotokoll.",
    blocks: [
      { t: "p", text: "**BM-DB 24.06.25**, Kreishaus Sitzungssaal 2, 14:00 bis ca. 16:40" },
      { t: "p", text: "da: LR, EKR'in Dr. Kloß, Fr. Johannsen (TOP 1), KBM Meyerhoff (TOP 4), alle HVB außer Krähenwerder (Vertr. stellv. BM)" },
      { t: "h3", text: "1) Eckwerte HH 2026 / Kreisumlage" },
      {
        t: "ul",
        items: [
          "J.: Eckwert KU 2026 **34,5 %** (2025: 33,0) – Treiber: Eingliederungshilfe, HzE stationär, Tarif, ÖPNV",
          "BM'in Engelke (RF): „so nicht vermittelbar“, will Benehmen schriftlich + Sparliste Kreis",
          "BM Ruhnau (BH): HSK 2026 kommt sowieso, jeder halbe Prozentpunkt ca. 50 T€ für BH",
          "LR sagt zu: Benehmen bis 30.09., vorher Runde mit Fraktionsvorsitzenden",
        ],
      },
      { t: "h3", text: "2) ZKIT / Beitritt RF" },
      {
        t: "ul",
        items: [
          "RF prüft, Kostenvergleich vom ZKIT liegt vor; StR-Beschluss frühestens Dez.",
          "BM Altmoor fragt: sinkt Umlage für Altmitglieder? → Dr. Vogelsang klärt, Antwort an alle",
        ],
      },
      { t: "h3", text: "3) Ausländerbehörde" },
      {
        t: "ul",
        items: [
          "Wartezeit Termin inzw. ca. 9 Wo. (!), Beschwerden v. Arbeitgebern (Fennhusen: Landtechnik)",
          "LR: Sachstandsvermerk bis Sept., dann Maßnahmenpaket – ggf. Leute aus Zulassung?",
        ],
      },
      { t: "h3", text: "4) Hochwasser" },
      {
        t: "ul",
        items: [
          "KBM: neuer SAEP (V 3.0) seit 08.04. in Kraft, an alle Gemeinden raus",
          "Bitte Erreichbarkeiten bis 31.07. an SG KatS (Hinsch) – haben erst 3 von 8!",
          "BM Schilfwerder: Sandsacklager Bauhof zu klein, Zuschuss? → LR: prüfen, keine Zusage",
          "Vollübung erst Herbst 2026, 2025 nur Stabsrahmenübung",
        ],
      },
      { t: "h3", text: "5) Verschiedenes" },
      {
        t: "ul",
        items: [
          "Vet.-Amt plant **ASP-Übung** im Herbst, sucht Schweinehalter → BM Ruhnau: evtl. Heidhof, will fragen",
          "Hitze: Frage nach Trinkwasserbrunnen – keine Kreisaufgabe",
          "nächste BM-DB: 23.09.25",
        ],
      },
      { t: "h3", text: "To do" },
      {
        t: "ul",
        items: [
          "TR: Ergebnisprotokoll an HVB bis 04.07.",
          "FD Finanzen: Benehmensschreiben KU vorbereiten",
          "Dr. Wessel Kontakt BM Ruhnau wg. Übungsbetrieb weitergeben",
        ],
      },
    ],
  },
  {
    type: "word",
    id: "am-allgemeinverfuegung-gefluegelpest-torfkamp",
    title: "Allgemeinverfügung zur Festlegung einer Schutz- und Überwachungszone wegen Geflügelpest in Torfkamp",
    kind: "Allgemeinverfügung",
    fileName: "2025-01-28 Allgemeinverfuegung Gefluegelpest Sperrzone Torfkamp",
    org: "altmoorland",
    unit: "am-veterinaer",
    author: "am-woeltje",
    date: "2025-01-28",
    keywords: ["39.1-8411/25-GP01", "Schutzzone", "Überwachungszone", "H5N1", "§ 37 TierGesG", "Putenmastbetrieb"],
    summary:
      "Tierseuchenrechtliche Allgemeinverfügung nach einem Geflügelpest-Ausbruch in einem Putenmastbetrieb in Torfkamp: Abgrenzung von Schutz- und Überwachungszone, Aufstallungspflicht, Meldepflichten, Verbringungsverbote, Dauer, Begründung und Rechtsbehelfsbelehrung – gut für Zusammenfassungen und Bürgerinformationen in einfacher Sprache.",
    meta: [
      ["Aktenzeichen", "39.1-8411/25-GP01"],
      ["Bekanntmachung", "Amtsblatt für den Landkreis Altmoorland Nr. 4/2025 und www.altmoorland.example/gefluegelpest"],
    ],
    subject:
      "Allgemeinverfügung des Landkreises Altmoorland über Maßnahmen zum Schutz gegen die Geflügelpest (hochpathogene aviäre Influenza H5N1) – Festlegung einer Schutzzone und einer Überwachungszone",
    blocks: [
      {
        t: "p",
        text: "Am 27.01.2025 ist der Ausbruch der hochpathogenen aviären Influenza (Geflügelpest) des Subtyps **H5N1** in einem **Putenmastbetrieb** in der Gemeinde Torfkamp, Ortslage Torfkamp-Nord, amtlich festgestellt worden. Der Bestand von rund 11.200 Puten wurde am 27. und 28.01.2025 getötet. Der Landkreis Altmoorland erlässt deshalb folgende",
      },
      { t: "h1", text: "Allgemeinverfügung" },
      { t: "h2", text: "1. Festlegung der Sperrzone" },
      {
        t: "p",
        text: "1.1 Um den Ausbruchsbetrieb wird eine **Schutzzone** mit einem Radius von mindestens 3 km festgelegt. Sie umfasst folgende Gebiete:",
      },
      {
        t: "table",
        header: ["Gemeinde", "Gebiet in der Schutzzone"],
        rows: [
          ["Torfkamp", "Ortslage Torfkamp-Nord; Ortskern Torfkamp nördlich der Bahnstrecke; Auenhöfe; Torfkamper Moor bis zur Kreisstraße K 9"],
          ["Fennhusen", "Siedlung Am Kiefernweg und die Höfe am Torfweg"],
        ],
        widths: [2, 7],
      },
      {
        t: "p",
        text: "1.2 Um die Schutzzone wird eine **Überwachungszone** mit einem Radius von mindestens 10 km um den Ausbruchsbetrieb festgelegt. Sie umfasst, soweit nicht zur Schutzzone gehörig:",
      },
      {
        t: "table",
        header: ["Gemeinde", "Gebiet in der Überwachungszone"],
        rows: [
          ["Torfkamp", "das übrige Gemeindegebiet"],
          ["Fennhusen", "das Gemeindegebiet nördlich der Altmoorer Aue"],
          ["Brackenhain", "die Ortsteile Heidhof und Kleinbracken"],
          ["Schilfwerder", "das Gemeindegebiet westlich der Kreisstraße K 12"],
          ["Stadt Altmoor", "die Ortslagen nördlich der Bahnstrecke einschließlich Gewerbegebiet Nord"],
        ],
        widths: [2, 7],
      },
      {
        t: "p",
        text: "1.3 Die genauen Grenzen ergeben sich aus der Karte in der Anlage, die Bestandteil dieser Allgemeinverfügung ist. Sie kann im Kreishaus, Raum 2.31, eingesehen und unter www.altmoorland.example/gefluegelpest abgerufen werden.",
      },
      { t: "h2", text: "2. Anordnungen für die Schutzzone" },
      {
        t: "ol",
        items: [
          "**Aufstallung:** Geflügel ist ausschließlich in geschlossenen Ställen oder unter einer überstehenden, nach oben gegen Einträge gesicherten dichten Abdeckung mit einer gegen das Eindringen von Wildvögeln gesicherten Seitenbegrenzung zu halten.",
          "**Meldung:** Wer Geflügel oder andere in Gefangenschaft gehaltene Vögel hält, hat dem Veterinäramt bis zum **31.01.2025** die Zahl der Tiere getrennt nach Arten, die Nutzungsart und den Standort zu melden. Dies gilt auch für Hobbyhaltungen mit wenigen Tieren.",
          "**Verbringungsverbot:** Geflügel, Bruteier, Konsumeier, frisches Geflügelfleisch sowie Mist, Einstreu und Gülle aus Geflügelhaltungen dürfen weder in Betriebe noch aus Betrieben verbracht werden. Ausnahmen kann das Veterinäramt auf Antrag nach den Artikeln 27 bis 37 der Delegierten Verordnung (EU) 2020/687 genehmigen.",
          "**Krankheitsanzeichen:** Erhöhte Sterblichkeit, ein Rückgang der Legeleistung oder der Futter- und Wasseraufnahme sind dem Veterinäramt unverzüglich anzuzeigen.",
          "**Hunde und Katzen** dürfen nicht frei laufen gelassen werden.",
          "**Reinigung und Desinfektion:** Fahrzeuge, die Geflügelhaltungen anfahren, sind vor dem Verlassen des Betriebsgeländes zu reinigen und zu desinfizieren.",
          "**Märkte und Ausstellungen** mit Geflügel oder anderen Vögeln sind verboten.",
          "**Untersuchungen:** Das Veterinäramt untersucht alle Geflügelhaltungen in der Schutzzone klinisch und nimmt Proben.",
        ],
      },
      { t: "h2", text: "3. Anordnungen für die Überwachungszone" },
      {
        t: "ol",
        items: [
          "Geflügel ist nach Nr. 2.1 aufzustallen.",
          "Geflügelhaltungen sind dem Veterinäramt bis zum **04.02.2025** nach Nr. 2.2 zu melden.",
          "Geflügel darf aus der Überwachungszone nur mit Genehmigung des Veterinäramts verbracht werden. Konsumeier dürfen an Packstellen geliefert werden, wenn die Transportfahrzeuge vor und nach jeder Fahrt gereinigt und desinfiziert werden.",
          "Märkte und Ausstellungen mit Geflügel oder anderen Vögeln sind verboten.",
        ],
      },
      { t: "h2", text: "4. Dauer der Maßnahmen" },
      {
        t: "p",
        text: "Die Maßnahmen in der Schutzzone gelten mindestens 21 Tage nach Abschluss der vorläufigen Reinigung und Desinfektion des Ausbruchsbetriebs. Danach gelten in der bisherigen Schutzzone bis zum Ende der Überwachungszone die Maßnahmen nach Nr. 3. Die Überwachungszone besteht mindestens 30 Tage. Die Aufhebung erfolgt durch gesonderte Allgemeinverfügung.",
      },
      { t: "h2", text: "5. Sofortige Vollziehbarkeit" },
      {
        t: "p",
        text: "Widerspruch und Anfechtungsklage gegen diese Allgemeinverfügung haben nach **§ 37 TierGesG** keine aufschiebende Wirkung. Die Anordnungen sind daher sofort zu befolgen.",
      },
      { t: "h2", text: "6. Bekanntgabe" },
      {
        t: "p",
        text: "Die öffentliche Bekanntgabe erfolgt nach § 41 Abs. 3 und 4 VwVfG; die Allgemeinverfügung gilt am Tag nach der Bekanntmachung als bekannt gegeben.",
      },
      { t: "h1", text: "Begründung" },
      {
        t: "p",
        text: "Die Geflügelpest ist eine hochansteckende Viruserkrankung, die zu hohen Verlusten in Geflügelbeständen führt. Sie wird auch über Personen, Fahrzeuge, Futter und Einstreu verbreitet. In der Umgebung des Ausbruchsbetriebs werden rund 140 Geflügelhaltungen mit zusammen etwa 310.000 Tieren gehalten, darunter mehrere Legehennen- und Putenhaltungen. Nach dem Ausbruch besteht die konkrete Gefahr, dass das Virus in weitere Bestände eingetragen wird.",
      },
      {
        t: "p",
        text: "Rechtsgrundlagen sind die Verordnung (EU) 2016/429 (Tiergesundheitsrecht), die Delegierte Verordnung (EU) 2020/687 (Artikel 21 zur Sperrzone, Artikel 25 bis 40 zu den Maßnahmen, Anhänge X und XI zur Mindestdauer), das Tiergesundheitsgesetz (TierGesG) und die Geflügelpest-Verordnung. Zuständig ist der Landkreis nach dem Ausführungsgesetz zum TierGesG.",
      },
      {
        t: "p",
        text: "Die Zonen folgen den Mindestradien des Unionsrechts und orientieren sich an gut erkennbaren Grenzen (Altmoorer Aue, Bahnstrecke, Kreisstraßen). Die Anordnungen sind geeignet, erforderlich und angemessen. Die wirtschaftlichen Belastungen der Halterinnen und Halter wiegen weniger schwer als die Gefahr einer weiteren Ausbreitung in der Geflügelwirtschaft der Region.",
      },
      { t: "h1", text: "Rechtsbehelfsbelehrung" },
      {
        t: "p",
        text: "Gegen diese Allgemeinverfügung kann innerhalb eines Monats nach ihrer Bekanntgabe Klage beim Verwaltungsgericht Rhedenburg, Justizplatz 3, 00110 Rhedenburg, erhoben werden. Die Klage hat keine aufschiebende Wirkung (§ 37 TierGesG).",
      },
      { t: "h1", text: "Hinweise" },
      {
        t: "ul",
        items: [
          "Verstöße gegen diese Allgemeinverfügung sind Ordnungswidrigkeiten nach § 32 TierGesG und können mit einer Geldbuße bis zu 30.000 € geahndet werden.",
          "Eine Entschädigung durch die Tierseuchenkasse setzt voraus, dass die Tiere ordnungsgemäß gemeldet und die Beiträge entrichtet wurden.",
          "Fragen beantwortet das Veterinäramt unter 040 66969-195 (montags bis freitags 8 bis 16 Uhr) oder per E-Mail an gefluegelpest@altmoorland.example.",
        ],
      },
      { t: "p", text: "Altmoor, 28.01.2025" },
      { t: "signature", lines: ["Landkreis Altmoorland", "Der Landrat", "Im Auftrag", "Dr. Wessel", "Amtstierarzt"] },
    ],
  },
  {
    type: "word",
    id: "am-niederschrift-kreistag-2025-12-11",
    title: "Niederschrift über die Sitzung des Kreistags am 11.12.2025 (öffentlicher Teil)",
    kind: "Niederschrift",
    fileName: "Niederschrift Kreistag 2025-12-11 oeffentlicher Teil",
    org: "altmoorland",
    unit: "am-kreistag",
    author: "am-clausen",
    date: "2025-12-19",
    tags: ["widersprueche"],
    keywords: ["KT/2025/118", "Rettungsdienstbedarfsplan", "Kreisumlage", "Änderungsantrag", "Außenstelle Süd", "Hannelore Brüggemann"],
    summary:
      "Niederschrift der Kreistagssitzung mit Haushalt 2026 (Kreisumlage 34,5 %), Rettungsdienstbedarfsplan, Beitritt Rabensfurt zum Zweckverband und Antrag zur Außenstelle Süd der Zulassungsstelle. Eingebaut: Abstimmungsergebnis mit mehr Stimmen als Anwesenden nach dem Weggang zweier Mitglieder und abweichende Investitionskosten der Rettungswache (1,9 bzw. 2,1 Mio. €).",
    meta: [
      ["Sitzung", "12. Sitzung des Kreistags in der Wahlperiode 2021–2026"],
      ["Sitzungstag", "Donnerstag, 11.12.2025, 17:00 bis 20:41 Uhr (öffentlicher Teil)"],
      ["Ort", "Kreishaus, Großer Sitzungssaal"],
      ["Status", "öffentlich"],
    ],
    blocks: [
      { t: "h1", text: "Anwesenheit" },
      {
        t: "p",
        text: "**Vorsitz:** Kreistagsvorsitzende Hannelore Brüggemann (Freie Wählervereinigung Altmoorland)",
      },
      {
        t: "p",
        text: "**Kreistagsmitglieder:** 44 von 50 Mitgliedern anwesend (Anwesenheitsliste als Anlage 1). Entschuldigt fehlten sechs Mitglieder. Landrat Wolfgang Tiedemann ist stimmberechtigtes Mitglied des Kreistags; damit waren zu Beginn der Sitzung **45 Stimmberechtigte** anwesend.",
      },
      {
        t: "p",
        text: "**Verwaltung:** Erste Kreisrätin Dr. Annette Kloß, Dezernent Martin Eggers, Dezernentin Claudia Rieger, Dezernent Heiko Brünjes, Kreiskämmerin Birte Johannsen, Kreisbrandmeister Frank Meyerhoff (zu TOP 7), Jürgen Ostendorf (Kreistagsbüro), Bettina Clausen (Protokoll)",
      },
      {
        t: "table",
        header: ["Fraktion / Gruppe", "Sitze", "Vorsitz"],
        rows: [
          ["Freie Wählervereinigung Altmoorland (FWA)", "17", "Dieter Rohlfs"],
          ["Soziale Liste", "13", "Monika Peters"],
          ["Ökologische Mitte", "10", "Dr. Jan Seebeck"],
          ["Bürgerliste Rabensfurt", "6", "Ralf Kortmann"],
          ["fraktionslos", "4", "–"],
        ],
        widths: [5, 1, 3],
      },
      { t: "h1", text: "Tagesordnung – öffentlicher Teil" },
      {
        t: "ol",
        items: [
          "Eröffnung, Feststellung der ordnungsgemäßen Ladung und der Beschlussfähigkeit",
          "Feststellung der Tagesordnung",
          "Genehmigung der Niederschrift über die Sitzung am 25.09.2025",
          "Mitteilungen des Landrats",
          "Einwohnerfragestunde",
          "Haushaltssatzung und Haushaltsplan 2026 mit Stellenplan, Festsetzung der Kreisumlage (Vorlage KT/2025/118)",
          "Rettungsdienstbedarfsplan 2026–2030 (Vorlage KT/2025/121)",
          "Zustimmung zur Änderung der Verbandssatzung des Zweckverbands Kommunale IT Altmoor – Beitritt der Stadt Rabensfurt (Vorlage KT/2025/124)",
          "Antrag der Fraktion FWA: Erhalt der Außenstelle Süd der Zulassungsstelle (Antrag A/2025/017)",
          "Anfragen",
        ],
      },
      { t: "h2", text: "TOP 1 – Eröffnung" },
      {
        t: "p",
        text: "Die Vorsitzende eröffnet die Sitzung um 17:00 Uhr. Sie stellt fest, dass zur Sitzung form- und fristgerecht geladen wurde und der Kreistag beschlussfähig ist. Einwände werden nicht erhoben.",
      },
      { t: "h2", text: "TOP 2 – Feststellung der Tagesordnung" },
      {
        t: "p",
        text: "Die Tagesordnung wird ohne Änderungen festgestellt. Der Antrag der Fraktion Ökologische Mitte zum Hitzeschutz (A/2025/019) ist fristgerecht eingegangen und wird auf Wunsch der Antragstellerin in der Sitzung im Februar 2026 beraten.",
      },
      { t: "h2", text: "TOP 3 – Genehmigung der Niederschrift" },
      { t: "p", text: "Die Niederschrift über die Sitzung am 25.09.2025 wird ohne Änderungen genehmigt (einstimmig bei 3 Enthaltungen)." },
      { t: "h2", text: "TOP 4 – Mitteilungen des Landrats" },
      {
        t: "ul",
        items: [
          "**Ausländerbehörde:** Die im September gebilligten Sofortmaßnahmen sind umgesetzt. Seit dem 01.11.2025 sind zwei Beschäftigte aus der Zulassungsstelle für sechs Monate abgeordnet, Fiktionsbescheinigungen werden seit dem 15.10.2025 ohne Vorsprache per Post versandt, die telefonische Sachstandshotline ist seit dem 03.11.2025 geschaltet. Die Zahl der offenen Vorgänge ist von 1.910 (Mitte September) auf 1.840 (30.11.2025) gesunken, die Wartezeit auf einen Termin beträgt noch rund zehn Wochen.",
          "**Tierseuchenübung:** Die Übung „Hofschranke 2025“ zur Afrikanischen Schweinepest hat am 30.09.2025 auf einem landwirtschaftlichen Betrieb im Ortsteil Heidhof stattgefunden. Beteiligt waren rund 60 Kräfte von Veterinäramt, Feuerwehr und Polizei. Verbesserungsbedarf besteht beim Aufbau der Desinfektionsschleuse und bei der Kommunikation zwischen Stab und Kontrollstelle.",
          "**Zweckverband Kommunale IT Altmoor:** Der Stadtrat Rabensfurt berät heute parallel über den Beitritt. Das Ergebnis wird unter TOP 8 mitgeteilt, sobald es vorliegt.",
          "**Haushalte der Gemeinden:** Nach den Vorberichten werden voraussichtlich drei Gemeinden für 2026 ein Haushaltssicherungskonzept aufstellen müssen.",
        ],
      },
      { t: "h2", text: "TOP 5 – Einwohnerfragestunde" },
      {
        t: "p",
        text: "Frau Gesine Harder aus Lütjenbrook schildert, dass der Rettungswagen im August bei einem Notfall in ihrer Familie 24 Minuten gebraucht habe. Sie fragt, wann sich die Lage in Lütjenbrook verbessere. Landrat Tiedemann verweist auf TOP 7: Der Rettungsdienstbedarfsplan sehe eine neue Rettungswache in Lütjenbrook vor. Er bedauert den geschilderten Fall und bietet ein persönliches Gespräch an.",
      },
      {
        t: "p",
        text: "Herr Bernd Wilms aus Altmoor fragt, ob die höhere Kreisumlage zu höheren Grundsteuern in den Gemeinden führe. Kreiskämmerin Johannsen erläutert, dass die Gemeinden über ihre Hebesätze selbst entscheiden. Die Kreisumlage belaste die Gemeindehaushalte aber spürbar.",
      },
      {
        t: "p",
        text: "Frau Anja Stührmann aus Schilfwerder fragt, ob der Landkreis den Ausbau des Sandsacklagers im Bauhof Schilfwerder bezuschusse, das beim letzten Hochwasser zu klein gewesen sei. Der Landrat antwortet, dass die Lagerkapazitäten bei der Fortschreibung des Sonder-Alarm- und Einsatzplans Hochwasser geprüft würden. Haushaltsmittel für Zuschüsse seien 2026 nicht vorgesehen.",
      },
      { t: "h2", text: "TOP 6 – Haushaltssatzung und Haushaltsplan 2026 (Vorlage KT/2025/118)" },
      {
        t: "p",
        text: "Kreiskämmerin Johannsen stellt den Entwurf vor. Der Ergebnishaushalt 2026 sieht ordentliche Erträge von 318,4 Mio. € und ordentliche Aufwendungen von 324,9 Mio. € vor. Der Fehlbetrag von 6,5 Mio. € wird aus der Überschussrücklage gedeckt, die danach noch rund 4,1 Mio. € beträgt. Bei einem Hebesatz von 34,5 % ergibt sich nach den vorläufigen Umlagegrundlagen ein Aufkommen aus der Kreisumlage von rund 53 Mio. €. Wichtigste Kostentreiber sind die Eingliederungshilfe, die stationären Hilfen zur Erziehung, die Tarifsteigerungen und der ÖPNV. Für Investitionen sind 21,7 Mio. € vorgesehen, die Kreditermächtigung beträgt 9,8 Mio. €. Der Stellenplan umfasst 764,2 Stellen (2025: 750,2).",
      },
      {
        t: "p",
        text: "Herr Rohlfs (FWA) kündigt die Zustimmung seiner Fraktion an, „mit Bauchschmerzen“. Die Erhöhung der Kreisumlage sei unvermeidbar, der Kreis habe auf die meisten Kostensteigerungen keinen Einfluss. Er erwarte aber für 2027 eine Aufgabenkritik in allen Dezernaten.",
      },
      {
        t: "p",
        text: "Frau Peters (Soziale Liste) begründet den **Änderungsantrag** ihrer Fraktion, den Hebesatz auf 34,0 % festzusetzen und den Fehlbetrag zusätzlich aus der Überschussrücklage zu decken. Die Gemeinden dürften nicht weiter in die Haushaltssicherung gedrängt werden. Die Kreiskämmerin weist darauf hin, dass die Rücklage dann fast vollständig aufgebraucht wäre.",
      },
      {
        t: "p",
        text: "Dr. Seebeck (Ökologische Mitte) stimmt dem Haushalt zu, kritisiert aber, dass für Radwege an Kreisstraßen weniger Mittel vorgesehen seien als im Vorjahr. Herr Kortmann (Bürgerliste Rabensfurt) lehnt den Haushalt ab: Die Stadt Rabensfurt trage rund 40 % der Kreisumlage, erhalte aber keinen angemessenen Ausgleich für die Aufgaben, die sie als große kreisangehörige Stadt selbst erfülle.",
      },
      {
        t: "p",
        text: "Herr Grote (fraktionslos) kritisiert den Anstieg der Personalaufwendungen um 6,8 %. Erste Kreisrätin Dr. Kloß verweist auf den Tarifabschluss und auf die zusätzlichen Stellen, überwiegend im Jugendamt, im Fachdienst Soziales und in der Ausländerbehörde. Ohne diese Stellen seien gesetzliche Fristen nicht einzuhalten. Landrat Tiedemann dankt der Kämmerei und betont, dass der Kreis in den Jahren 2023 bis 2025 auf eine Erhöhung der Kreisumlage verzichtet habe.",
      },
      {
        t: "table",
        header: ["Abstimmung", "Ja", "Nein", "Enthaltung", "Ergebnis"],
        rows: [
          ["Änderungsantrag Soziale Liste (Hebesatz 34,0 %)", "18", "26", "1", "abgelehnt"],
          ["Haushaltssatzung 2026 mit Hebesatz der Kreisumlage 34,5 %", "29", "14", "2", "angenommen"],
        ],
        widths: [6, 1, 1, 2, 2],
      },
      {
        t: "p",
        text: "**Beschluss:** Der Kreistag beschließt die Haushaltssatzung und den Haushaltsplan 2026 mit Stellenplan in der Fassung der Vorlage KT/2025/118. Der Hebesatz der Kreisumlage wird auf 34,5 % der Umlagegrundlagen festgesetzt.",
      },
      {
        t: "p",
        text: "Um 19:25 Uhr verlassen Frau Peters (Soziale Liste) und Herr Grote (fraktionslos) die Sitzung. Damit sind 43 Stimmberechtigte anwesend.",
      },
      { t: "h2", text: "TOP 7 – Rettungsdienstbedarfsplan 2026–2030 (Vorlage KT/2025/121)" },
      {
        t: "p",
        text: "Kreisbrandmeister Meyerhoff erläutert den Plan. Das Rettungsdienstgesetz (RettDG) verlangt, dass ein geeignetes Rettungsmittel in 95 % der Notfälle innerhalb der **Hilfsfrist von 12 Minuten** am Einsatzort ist. Kreisweit wurde dieser Wert 2024 in 92,8 % der Einsätze erreicht; in Lütjenbrook und Krähenwerder lag er unter 80 %. Der Plan sieht vor:",
      },
      {
        t: "ul",
        items: [
          "eine neue Rettungswache in Lütjenbrook mit einem rund um die Uhr besetzten Rettungswagen; die Investitionskosten werden auf **1,9 Mio. €** geschätzt,",
          "einen zusätzlichen Rettungswagen im Tagdienst an der Rettungswache Rabensfurt,",
          "die Ausweitung des Notarztstandorts Altmoor auf einen zweiten Notarzt in den Nachtstunden am Wochenende,",
          "11,5 zusätzliche Stellen für Notfallsanitäterinnen und Notfallsanitäter beim Leistungserbringer.",
        ],
      },
      {
        t: "p",
        text: "Die laufenden Kosten werden über die Benutzungsentgelte von den Krankenkassen refinanziert; die Verhandlungen beginnen im Januar 2026. Herr Ahrens (Ökologische Mitte) fragt nach der Personalgewinnung. Kreisbrandmeister Meyerhoff berichtet, dass der Leistungserbringer seine Ausbildungsplätze von 6 auf 10 je Jahrgang erhöht. Frau Behnken (FWA) bittet darum, die Hilfsfrist künftig halbjährlich nach Gemeinden zu berichten. Der Landrat sagt dies zu.",
      },
      {
        t: "p",
        text: "Herr Lammert (Soziale Liste) fragt, warum Krähenwerder keine eigene Wache erhalte. Kreisbrandmeister Meyerhoff erklärt, dass Krähenwerder künftig von der neuen Wache in Lütjenbrook aus versorgt werde; die Fahrzeit betrage dann rund neun Minuten. Für eine eigene Wache sei das Einsatzaufkommen zu gering.",
      },
      {
        t: "p",
        text: "**Beschluss:** Der Kreistag beschließt den Rettungsdienstbedarfsplan 2026–2030 in der Fassung der Vorlage KT/2025/121 einschließlich der Errichtung einer Rettungswache in Lütjenbrook (Investition rund 2,1 Mio. €). Abstimmungsergebnis: 38 Ja, 4 Nein, 3 Enthaltungen.",
      },
      { t: "h2", text: "TOP 8 – Beitritt der Stadt Rabensfurt zum Zweckverband Kommunale IT Altmoor (Vorlage KT/2025/124)" },
      {
        t: "p",
        text: "Erste Kreisrätin Dr. Kloß erläutert die Satzungsänderung. Mit dem Beitritt zum 01.07.2026 wächst der Zweckverband von 1.329 auf 1.759 Arbeitsplätze. Da die Umlage nach Arbeitsplätzen verteilt wird, sinkt der Anteil des Landkreises (820 Arbeitsplätze) von rund 62 % auf rund 47 %. Einmalige Umstellungskosten trägt die Stadt Rabensfurt. Herr Kortmann (Bürgerliste Rabensfurt) begrüßt den Beitritt und fragt nach dem Stimmgewicht der Stadt in der Verbandsversammlung. Dr. Kloß antwortet, dass die Stadt drei Vertreterinnen oder Vertreter mit je einer Stimme entsende; der Landkreis behalte seine vier Stimmen. Satzungsänderungen bräuchten weiterhin eine qualifizierte Mehrheit. Um 19:58 Uhr teilt der Landrat mit, dass der Stadtrat Rabensfurt dem Beitritt zugestimmt hat.",
      },
      {
        t: "p",
        text: "**Beschluss:** Der Kreistag stimmt der Änderung der Verbandssatzung zu und beauftragt die Vertreterinnen und Vertreter des Landkreises in der Verbandsversammlung, entsprechend abzustimmen. Abstimmungsergebnis: einstimmig bei 2 Enthaltungen.",
      },
      { t: "h2", text: "TOP 9 – Antrag der Fraktion FWA: Erhalt der Außenstelle Süd der Zulassungsstelle (A/2025/017)" },
      {
        t: "p",
        text: "Frau Behnken (FWA) begründet den Antrag. Die Verwaltung hatte im Kreisausschuss am 18.11.2025 vorgeschlagen, die Außenstelle Süd am Marktplatz in Altmoor nur noch an zwei Tagen pro Woche und nur mit Termin zu öffnen. Gerade ältere Menschen ohne Auto seien auf die Außenstelle angewiesen. Dezernentin Rieger erläutert, dass die Außenstelle im 3. Quartal 2025 1.349 Vorgänge bearbeitet habe, das Kreishaus 7.480. Zwei Beschäftigte der Zulassungsstelle seien derzeit an die Ausländerbehörde abgeordnet. Eine Schließung sei nicht geplant.",
      },
      {
        t: "p",
        text: "**Beschluss:** Der Antrag wird in den Ausschuss für Ordnung und Verkehr verwiesen. Die Verwaltung berichtet dort bis März 2026 über die Auslastung der Standorte und die Entwicklung der Online-Zulassungen. Abstimmungsergebnis: mehrheitlich bei 5 Gegenstimmen.",
      },
      { t: "h2", text: "TOP 10 – Anfragen" },
      {
        t: "ul",
        items: [
          "Herr Ahrens (Ökologische Mitte) fragt nach den Entschädigungen nach dem Geflügelpest-Ausbruch in Torfkamp im Januar 2025. Der Landrat antwortet, dass die Tierseuchenkasse für die 11.200 getöteten Puten entschädigt habe; zu einzelnen Beträgen könne er aus Datenschutzgründen nichts sagen.",
          "Herr Lammert (Soziale Liste) fragt, ob in der Ausländerbehörde ein KI-gestützter Assistent eingesetzt werden soll. Der Landrat berichtet, dass die Prüfung mit dem Zweckverband und dem Datenschutzbeauftragten läuft. Ein Ergebnis werde im ersten Quartal 2026 vorgelegt.",
          "Herr Kortmann (Bürgerliste Rabensfurt) bittet um eine schriftliche Übersicht der Kreisumlage 2026 je Gemeinde. Die Verwaltung sagt die Übersicht nach Festsetzung der Umlagegrundlagen im Januar 2026 zu.",
        ],
      },
      {
        t: "p",
        text: "Die Vorsitzende schließt den öffentlichen Teil der Sitzung um 20:41 Uhr. Der nichtöffentliche Teil wird gesondert protokolliert.",
      },
      {
        t: "signature",
        lines: ["Hannelore Brüggemann, Kreistagsvorsitzende", "Wolfgang Tiedemann, Landrat", "Bettina Clausen, Protokollführerin"],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "am-fuehrerscheinumtausch-schulung-buergerbueros",
    title: "Pflichtumtausch der Führerscheine – Schulung für die Bürgerbüros",
    kind: "Präsentation",
    fileName: "Fuehrerscheinumtausch 2026 Schulung Buergerbueros",
    org: "altmoorland",
    unit: "am-zulassung",
    author: "am-pohlmann",
    date: "2025-11-13",
    keywords: ["19.01.2026", "Kartenführerschein", "Annahmestelle", "25,30 €", "Fahrerlaubnisbehörde"],
    summary:
      "Schulungsfolien der Fahrerlaubnisbehörde für die Bürgerbüros der Gemeinden zum Pflichtumtausch der Führerscheine: Fristen nach Geburts- und Ausstellungsjahr, Ablauf der Antragsannahme, häufige Fehler und Sonderfälle – Vorlage für FAQ, Bürgerinformation oder Leichte Sprache.",
    slides: [
      { t: "title", title: "Pflichtumtausch der Führerscheine", subtitle: "Schulung für die Annahmestellen in den Bürgerbüros · November 2025" },
      {
        t: "bullets",
        title: "Worum geht es?",
        bullets: [
          "Alle Führerscheine, die vor dem 19.01.2013 ausgestellt wurden, müssen in den EU-Kartenführerschein umgetauscht werden",
          "Die Fahrerlaubnis selbst bleibt bestehen – nur das Dokument verliert seine Gültigkeit",
          { text: "Nächste Frist: **19.01.2026**", sub: ["für Kartenführerscheine mit Ausstellungsjahr 1999 bis 2001", "im Kreis betrifft das schätzungsweise 9.000 bis 10.000 Personen"] },
          "Wer nicht rechtzeitig umtauscht, riskiert bei einer Kontrolle ein Verwarnungsgeld von 10 €",
        ],
        notes:
          "Die Zahl für den Kreis ist eine Schätzung aus dem Fachverfahren: Kartenführerscheine aus 1999 bis 2001, die noch nicht umgetauscht wurden. Genauer geht es nicht, weil Umzüge in andere Kreise nicht immer gemeldet sind.",
      },
      {
        t: "table",
        title: "Fristen für Kartenführerscheine",
        header: ["Ausstellungsjahr", "Umtausch bis"],
        rows: [
          ["1999 bis 2001", "19.01.2026"],
          ["2002 bis 2004", "19.01.2027"],
          ["2005 bis 2007", "19.01.2028"],
          ["2008", "19.01.2029"],
          ["2009", "19.01.2030"],
          ["2010", "19.01.2031"],
          ["2011", "19.01.2032"],
          ["2012 bis 18.01.2013", "19.01.2033"],
        ],
        notes: "Das Ausstellungsjahr steht auf der Vorderseite im Feld 4a.",
      },
      {
        t: "table",
        title: "Fristen für Papierführerscheine (grau und rosa)",
        header: ["Geburtsjahr der Inhaberin / des Inhabers", "Umtausch bis"],
        rows: [
          ["vor 1953", "19.01.2033"],
          ["1953 bis 1958", "19.01.2022 (abgelaufen)"],
          ["1959 bis 1964", "19.01.2023 (abgelaufen)"],
          ["1965 bis 1970", "19.01.2024 (abgelaufen)"],
          ["1971 oder später", "19.01.2025 (abgelaufen)"],
        ],
        notes:
          "Wer einen Papierführerschein hat und 1953 oder später geboren ist, ist bereits überfällig. Bitte freundlich darauf hinweisen und den Antrag trotzdem ganz normal aufnehmen – es gibt keinen Strafzuschlag bei der Antragstellung.",
      },
      {
        t: "bullets",
        title: "Ablauf in der Annahmestelle",
        bullets: [
          "Identität prüfen: Personalausweis oder Reisepass",
          "Mitzubringen: biometrisches Passbild, bisheriger Führerschein",
          { text: "Bei Führerscheinen aus einem anderen Kreis:", sub: ["Karteikartenabschrift bei der ausstellenden Behörde anfordern", "dauert erfahrungsgemäß zwei bis vier Wochen"] },
          "Gebühr: **25,30 €** (zuzüglich 5,10 € bei Direktversand)",
          "Antrag und Unterlagen im Fachverfahren erfassen und an die **Fahrerlaubnisbehörde** weiterleiten",
          "Den alten Führerschein behält die Person bis zur Abholung des neuen",
        ],
        notes: "Die Annahmestelle entscheidet nicht über den Antrag. Bei Unklarheiten zur Fahrerlaubnis (Klassen, Auflagen) bitte immer Rücksprache mit uns.",
      },
      {
        t: "twocol",
        title: "Häufige Fehler – und wie man sie vermeidet",
        left: {
          heading: "Fehler",
          bullets: ["Passbild nicht biometrisch oder älter als sechs Monate", "Unterschrift fehlt auf dem Antrag", "Klassen falsch übertragen (alte Klasse 3)", "Führerschein aus dem Ausland als Umtausch erfasst"],
        },
        right: {
          heading: "So geht es richtig",
          bullets: ["Bild vor Ort prüfen, im Zweifel neues Bild", "Vollständigkeit mit der Checkliste prüfen", "Klassen nicht selbst umschlüsseln – macht das Fachverfahren", "Ausländische Führerscheine: an die Fahrerlaubnisbehörde verweisen"],
        },
      },
      {
        t: "bullets",
        title: "Was wir erwarten",
        bullets: [
          "Spitze im Dezember und Januar: vorher gut informieren, Termine strecken",
          "Online-Antrag über das Serviceportal: www.altmoorland.example/fuehrerschein",
          "Bearbeitungszeit in der Fahrerlaubnisbehörde derzeit rund drei Wochen, im Januar eher sechs",
          "Antragsbestätigung mitführen: Nach Absprache mit der Polizeiinspektion Altmoor wird in der Übergangszeit kein Verwarnungsgeld erhoben, wenn der Antrag rechtzeitig gestellt wurde",
        ],
        notes:
          "Das ist eine Absprache mit der Polizeiinspektion, keine Rechtsgarantie. Bitte gegenüber Bürgerinnen und Bürgern nicht schriftlich zusagen.",
      },
      {
        t: "bullets",
        title: "Ansprechpartnerinnen und Ansprechpartner",
        bullets: [
          "Fahrerlaubnisbehörde im Kreishaus, Erdgeschoss, Schalter 5 bis 7",
          "Fachliche Fragen: Sandra Pohlmann, Telefon 040 66969-263",
          "Fragen zum Fachverfahren: Zweckverband Kommunale IT Altmoor, Servicedesk",
        ],
      },
      { t: "end", title: "Vielen Dank!", lines: ["Straßenverkehrs- und Zulassungsbehörde · Landkreis Altmoorland"] },
    ],
  },
  {
    type: "excel",
    id: "am-hilfsfrist-rettungsdienst-2025",
    title: "Einhaltung der Hilfsfrist im Rettungsdienst 2025 nach Gemeinden und Monaten",
    kind: "Auswertung",
    fileName: "Hilfsfrist Rettungsdienst 2025 Auswertung Gemeinden Monate",
    org: "altmoorland",
    unit: "am-bevoelkerungsschutz",
    author: "am-sahin",
    date: "2026-02-10",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Hilfsfrist", "Notfalleinsätze", "Lütjenbrook", "Rettungswache Schilfwerder", "Zielwert"],
    summary:
      "Auswertung der Hilfsfrist (12 Minuten in 95 % der Notfälle) für 2025 nach Gemeinden, Monaten und Rettungswachen. Eingebaut: Die Einsatzzahlen der Blätter „Gemeinden“ und „Monate“ passen nicht zusammen, die Anmerkung nennt eine zu hohe Kreisquote (94,1 %) und behauptet, nur Lütjenbrook liege unter 80 %.",
    sheets: [
      {
        name: "Gemeinden",
        title: "Hilfsfrist im Rettungsdienst 2025 – nach Gemeinden",
        subtitle: "Notfalleinsätze mit Sondersignal, Hilfsfrist 12 Minuten ab Eingang des Notrufs in der Leitstelle · Quelle: Einsatzleitsystem, Auswertung vom 09.02.2026",
        columns: [
          { header: "Gemeinde", width: 18 },
          { header: "Einwohner", width: 11, fmt: "int" },
          { header: "Notfalleinsätze", width: 13, fmt: "int" },
          { header: "davon innerhalb 12 Min.", width: 13, fmt: "int" },
          { header: "Quote", width: 9, fmt: "pct" },
          { header: "Zielwert", width: 9, fmt: "pct" },
          { header: "Abweichung (Prozent-punkte)", width: 13, fmt: "dec" },
          { header: "Ø Eintreffzeit (Min.)", width: 12, fmt: "dec" },
          { header: "versorgt überwiegend von", width: 30 },
        ],
        rows: [
          ["Stadt Rabensfurt", 38600, 4120, 3982, { f: "D{r}/C{r}" }, 0.95, { f: "ROUND((E{r}-F{r})*100,1)" }, 7.4, "Rettungswache Rabensfurt"],
          ["Stadt Altmoor", 24100, 2610, 2529, { f: "D{r}/C{r}" }, 0.95, { f: "ROUND((E{r}-F{r})*100,1)" }, 7.1, "Rettungswache Altmoor"],
          ["Fennhusen", 11200, 1150, 1061, { f: "D{r}/C{r}" }, 0.95, { f: "ROUND((E{r}-F{r})*100,1)" }, 9.2, "Rettungswache Fennhusen"],
          ["Torfkamp", 9400, 960, 861, { f: "D{r}/C{r}" }, 0.95, { f: "ROUND((E{r}-F{r})*100,1)" }, 9.9, "Rettungswachen Fennhusen und Altmoor"],
          ["Brackenhain", 6840, 690, 600, { f: "D{r}/C{r}" }, 0.95, { f: "ROUND((E{r}-F{r})*100,1)" }, 10.4, "Rettungswache Altmoor"],
          ["Schilfwerder", 5100, 540, 470, { f: "D{r}/C{r}" }, 0.95, { f: "ROUND((E{r}-F{r})*100,1)" }, 10.6, "Rettungswache Schilfwerder (nur Tagdienst), nachts Altmoor"],
          ["Lütjenbrook", 3900, 410, 318, { f: "D{r}/C{r}" }, 0.95, { f: "ROUND((E{r}-F{r})*100,1)" }, 12.8, "Rettungswache Rabensfurt"],
          ["Krähenwerder", 2700, 290, 223, { f: "D{r}/C{r}" }, 0.95, { f: "ROUND((E{r}-F{r})*100,1)" }, 13.1, "Rettungswache Rabensfurt"],
          {
            total: true,
            cells: [
              "Landkreis",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "D{r}/C{r}" },
              0.95,
              { f: "ROUND((E{r}-F{r})*100,1)" },
              null,
              "",
            ],
          },
        ],
        notes: [
          "Kreisweit wurde die Hilfsfrist 2025 in 94,1 % der Notfalleinsätze eingehalten (2024: 92,8 %).",
          "Lütjenbrook ist die einzige Gemeinde, in der die Quote unter 80 % liegt. Abhilfe schafft die neue Rettungswache Lütjenbrook (Rettungsdienstbedarfsplan 2026–2030, Inbetriebnahme geplant 2027).",
          "Ø Eintreffzeit: arithmetisches Mittel aller Notfalleinsätze der Gemeinde.",
        ],
      },
      {
        name: "Monate",
        title: "Hilfsfrist im Rettungsdienst 2025 – nach Monaten",
        subtitle: "kreisweit, Notfalleinsätze mit Sondersignal",
        columns: [
          { header: "Monat", width: 12 },
          { header: "Notfalleinsätze", width: 14, fmt: "int" },
          { header: "davon innerhalb 12 Min.", width: 14, fmt: "int" },
          { header: "Quote", width: 10, fmt: "pct" },
          { header: "Zielwert erreicht?", width: 12 },
        ],
        rows: [
          ["Januar", 905, 837, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          ["Februar", 842, 788, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          ["März", 880, 826, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          ["April", 861, 807, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          ["Mai", 902, 846, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          ["Juni", 936, 873, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          ["Juli", 978, 902, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          ["August", 1004, 921, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          ["September", 921, 860, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          ["Oktober", 903, 840, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          ["November", 897, 829, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          ["Dezember", 953, 880, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          {
            total: true,
            cells: ["Jahr 2025", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "C{r}/B{r}" }, { f: "IF(D{r}>=0.95,\"ja\",\"nein\")" }],
          },
        ],
        notes: ["Sommerspitze Juli/August durch Urlaubsverkehr und Badeunfälle; im Dezember zwei Wochen mit erhöhtem Krankenstand beim Leistungserbringer."],
      },
      {
        name: "Rettungswachen",
        title: "Rettungswachen und Rettungswagen 2025",
        columns: [
          { header: "Rettungswache", width: 26 },
          { header: "RTW Tag", width: 9, fmt: "int" },
          { header: "RTW Nacht", width: 9, fmt: "int" },
          { header: "Einsätze RTW gesamt", width: 13, fmt: "int" },
          { header: "Einsätze je RTW (Tag)", width: 13, fmt: "int" },
          { header: "Ø Ausrückzeit (Min.)", width: 12, fmt: "dec" },
        ],
        rows: [
          ["Rettungswache Altmoor", 3, 2, 5310, { f: "ROUND(D{r}/B{r},0)" }, 1.2],
          ["Rettungswache Rabensfurt", 3, 2, 6040, { f: "ROUND(D{r}/B{r},0)" }, 1.1],
          ["Rettungswache Fennhusen", 1, 1, 1980, { f: "ROUND(D{r}/B{r},0)" }, 1.4],
          ["Rettungswache Schilfwerder", 1, 0, 1190, { f: "ROUND(D{r}/B{r},0)" }, 1.6],
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "ROUND(D{r}/B{r},0)" }, null],
          },
        ],
        notes: ["Einsätze RTW gesamt einschließlich Fahrten ohne Sondersignal und Verlegungen; daher höher als die Notfalleinsätze auf den anderen Blättern."],
      },
    ],
  },
  {
    type: "excel",
    id: "am-stellenplan-fluktuation-2026",
    title: "Stellenplan 2026, Stellenbesetzung und Fluktuation 2025",
    kind: "Personalcontrolling",
    fileName: "Personalcontrolling Stellenplan 2026 Besetzung Fluktuation 2025",
    org: "altmoorland",
    unit: "am-personal",
    author: "am-petersen",
    date: "2026-03-04",
    tags: ["zahlen", "personendaten"],
    keywords: ["Besetzungsquote", "Fluktuationsquote", "Austrittsgespräch", "Abgangsgrund", "764,2"],
    summary:
      "Personalcontrolling: Stellenplan 2025/2026 nach Organisationseinheiten mit Besetzung zum 01.03.2026 und Abgängen, Auswertung der Abgangsgründe 2025 und eine namentliche Abgangsliste mit Geburtsdaten, Personalnummern und Gründen – zum Auswerten und zum Anonymisieren.",
    sheets: [
      {
        name: "Stellenplan 2026",
        title: "Stellenplan und Stellenbesetzung",
        subtitle: "Stellen in Vollzeitäquivalenten · Besetzung zum Stichtag 01.03.2026 · ohne Eigenbetrieb Abfallwirtschaft",
        columns: [
          { header: "Organisationseinheit", width: 44 },
          { header: "Stellen 2025", width: 10, fmt: "dec" },
          { header: "Stellen 2026", width: 10, fmt: "dec" },
          { header: "Verän-derung", width: 9, fmt: "dec" },
          { header: "besetzt (VZÄ)", width: 10, fmt: "dec" },
          { header: "unbesetzt", width: 10, fmt: "dec" },
          { header: "Besetzungsquote", width: 11, fmt: "pct" },
          { header: "Abgänge 2025", width: 10, fmt: "int" },
          { header: "Abgänge je 100 Stellen", width: 11, fmt: "dec" },
        ],
        rows: [
          ["Büro des Landrats (mit Pressestelle und Kreistagsbüro)", 14, 14, { f: "C{r}-B{r}" }, 13.5, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 1, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Dezernatsleitungen und Stabsstellen", 49, 49, { f: "C{r}-B{r}" }, 46.5, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 0, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Fachdienst Personal", 22.5, 22.5, { f: "C{r}-B{r}" }, 21, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 1, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Fachdienst Finanzen", 41, 41, { f: "C{r}-B{r}" }, 39.5, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 3, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Fachdienst Organisation und Digitalisierung", 12, 13, { f: "C{r}-B{r}" }, 11, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 0, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Fachdienst Kommunalaufsicht und Recht", 9, 9, { f: "C{r}-B{r}" }, 8, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 0, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Gesundheitsamt", 39.2, 40.2, { f: "C{r}-B{r}" }, 38.2, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 4, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Jugendamt", 176, 180, { f: "C{r}-B{r}" }, 168.4, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 8, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Fachdienst Soziales und Eingliederungshilfe", 112.5, 115.5, { f: "C{r}-B{r}" }, 108.7, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 5, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Fachdienst Schulen, Kultur und Schülerbeförderung", 58, 58, { f: "C{r}-B{r}" }, 56.3, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 2, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Straßenverkehrs- und Zulassungsbehörde", 33, 33, { f: "C{r}-B{r}" }, 30.8, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 2, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Ausländerbehörde", 14, 16, { f: "C{r}-B{r}" }, 14.5, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 3, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Fachdienst Brand-, Katastrophenschutz und Rettungsdienst", 47, 49, { f: "C{r}-B{r}" }, 45.6, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 2, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Veterinär- und Lebensmittelüberwachungsamt", 31, 32, { f: "C{r}-B{r}" }, 29, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 1, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Untere Bauaufsichtsbehörde", 19, 19, { f: "C{r}-B{r}" }, 17.5, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 2, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Untere Naturschutz- und Wasserbehörde", 27, 27, { f: "C{r}-B{r}" }, 25.2, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 0, { f: "ROUND(H{r}/C{r}*100,1)" }],
          ["Fachdienst Kreisstraßen und ÖPNV", 46, 46, { f: "C{r}-B{r}" }, 44.1, { f: "C{r}-E{r}" }, { f: "E{r}/C{r}" }, 2, { f: "ROUND(H{r}/C{r}*100,1)" }],
          {
            total: true,
            cells: [
              "Kernverwaltung gesamt",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "C{r}-B{r}" },
              { f: "SUM(E{first}:E{last})" },
              { f: "C{r}-E{r}" },
              { f: "E{r}/C{r}" },
              { f: "SUM(H{first}:H{last})" },
              { f: "ROUND(H{r}/C{r}*100,1)" },
            ],
          },
        ],
        notes: [
          "Stellenplan 2026 mit 764,2 Stellen vom Kreistag am 11.12.2025 beschlossen (Vorlage KT/2025/118).",
          "Ausländerbehörde: zwei zusätzliche Stellen ab 01.01.2026; die Abordnung von zwei Beschäftigten aus der Zulassungsstelle endet am 30.04.2026.",
        ],
      },
      {
        name: "Fluktuation 2025",
        title: "Abgänge 2025 nach Abgangsgrund",
        subtitle: "Bezugsgröße: durchschnittlich 836 Beschäftigte (Köpfe) im Jahr 2025",
        columns: [
          { header: "Abgangsgrund", width: 44 },
          { header: "Anzahl", width: 10, fmt: "int" },
          { header: "Anteil an allen Abgängen", width: 14, fmt: "pct" },
          { header: "Fluktuationsquote", width: 14, fmt: "pct" },
        ],
        rows: [
          ["Ruhestand", 14, { f: "B{r}/SUM(B$5:B$10)" }, { f: "B{r}/836" }],
          ["Eigenkündigung", 11, { f: "B{r}/SUM(B$5:B$10)" }, { f: "B{r}/836" }],
          ["Wechsel zu öffentl. Arbeitgeber", 5, { f: "B{r}/SUM(B$5:B$10)" }, { f: "B{r}/836" }],
          ["Ablauf der Befristung", 4, { f: "B{r}/SUM(B$5:B$10)" }, { f: "B{r}/836" }],
          ["Aufhebungsvertrag", 1, { f: "B{r}/SUM(B$5:B$10)" }, { f: "B{r}/836" }],
          ["Rente wegen Erwerbsminderung", 1, { f: "B{r}/SUM(B$5:B$10)" }, { f: "B{r}/836" }],
          { total: true, cells: ["Abgänge gesamt", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "B{r}/836" }] },
        ],
        notes: [
          "Fluktuationsquote ohne Ruhestand und Erwerbsminderung: 21 Abgänge = 2,5 % (2024: 1,9 %).",
          "Austrittsgespräch: in 10 von 17 Fällen mit Kündigung, Wechsel oder Aufhebungsvertrag geführt. Häufigste Gründe: Bezahlung, Arbeitsbelastung, fehlende Möglichkeit zum mobilen Arbeiten.",
        ],
      },
      {
        name: "Abgänge 2025",
        title: "Abgänge 2025 – Einzelaufstellung",
        subtitle: "Nur für den Dienstgebrauch",
        columns: [
          { header: "Nr.", width: 5, fmt: "int" },
          { header: "Pers.-Nr.", width: 9 },
          { header: "Name", width: 14 },
          { header: "Vorname", width: 11 },
          { header: "Geburtsdatum", width: 12, fmt: "date" },
          { header: "Organisationseinheit", width: 40 },
          { header: "EG / BesGr", width: 9 },
          { header: "Eintritt", width: 12, fmt: "date" },
          { header: "Austritt", width: 12, fmt: "date" },
          { header: "Abgangsgrund", width: 36 },
          { header: "Austrittsgespräch", width: 12 },
        ],
        rows: [
          [1, "31668", "Kruse", "Carina", { date: "1960-09-17" }, "FD Schulen, Kultur und Schülerbeförderung", "EG 6", { date: "1986-06-01" }, { date: "2025-01-31" }, "Ruhestand", "entfällt"],
          [2, "33942", "Janßen", "Elke", { date: "1966-02-19" }, "FD Soziales und Eingliederungshilfe", "EG 12", { date: "2022-02-01" }, { date: "2025-02-28" }, "Rente wegen Erwerbsminderung", "nein"],
          [3, "13866", "Dierks", "Rieke", { date: "1994-07-14" }, "Gesundheitsamt", "EG 14", { date: "2018-01-01" }, { date: "2025-02-28" }, "Wechsel zu öffentl. Arbeitgeber", "ja"],
          [4, "25101", "Bode", "Lars", { date: "1991-04-27" }, "FD Finanzen", "A 10", { date: "2021-03-01" }, { date: "2025-03-15" }, "Eigenkündigung", "ja"],
          [5, "15071", "Warnecke", "Anja", { date: "1959-04-01" }, "Jugendamt", "S 12", { date: "1986-01-01" }, { date: "2025-03-31" }, "Ruhestand", "entfällt"],
          [6, "14097", "Vosgerau", "Wiebke", { date: "1997-02-12" }, "Ausländerbehörde", "A 9", { date: "2019-09-01" }, { date: "2025-04-15" }, "Wechsel zu öffentl. Arbeitgeber", "nein"],
          [7, "18375", "Ulrichs", "Greta", { date: "1990-07-28" }, "FD Soziales und Eingliederungshilfe", "A 10", { date: "2023-12-01" }, { date: "2025-04-15" }, "Ablauf der Befristung", "nein"],
          [8, "26971", "Fricke", "Stefan", { date: "1996-04-02" }, "Jugendamt", "S 12", { date: "2023-02-01" }, { date: "2025-04-15" }, "Ablauf der Befristung", "nein"],
          [9, "14555", "Gerken", "Hanna", { date: "1958-03-02" }, "FD Brand-, Katastrophenschutz und Rettungsdienst", "A 11", { date: "1988-06-01" }, { date: "2025-04-30" }, "Ruhestand", "entfällt"],
          [10, "42054", "Rathjen", "Andreas", { date: "1960-05-16" }, "FD Personal", "EG 10", { date: "1984-02-01" }, { date: "2025-04-30" }, "Ruhestand", "entfällt"],
          [11, "28589", "Renken", "Hauke", { date: "1958-01-24" }, "FD Soziales und Eingliederungshilfe", "EG 6", { date: "1983-08-01" }, { date: "2025-04-30" }, "Ruhestand", "entfällt"],
          [12, "16648", "Tamke", "Elke", { date: "1977-05-07" }, "Untere Bauaufsichtsbehörde", "A 11", { date: "2007-08-01" }, { date: "2025-04-30" }, "Eigenkündigung", "ja"],
          [13, "33745", "Hasselmann", "Bernd", { date: "1983-05-02" }, "FD Finanzen", "A 11", { date: "2021-10-01" }, { date: "2025-05-15" }, "Eigenkündigung", "nein"],
          [14, "31423", "Heitmann", "Hanna", { date: "1995-04-06" }, "Straßenverkehrs- und Zulassungsbehörde", "EG 6", { date: "2015-10-01" }, { date: "2025-05-15" }, "Eigenkündigung", "ja"],
          [15, "16334", "Lohse", "Hanna", { date: "1979-02-22" }, "Ausländerbehörde", "A 9", { date: "2020-08-01" }, { date: "2025-05-31" }, "Eigenkündigung", "ja"],
          [16, "37805", "Tietjen", "Rieke", { date: "1960-12-03" }, "FD Finanzen", "EG 10", { date: "1982-07-01" }, { date: "2025-05-31" }, "Ruhestand", "entfällt"],
          [17, "41237", "Eilers", "Greta", { date: "1959-05-03" }, "Jugendamt", "S 14", { date: "1984-02-01" }, { date: "2025-05-31" }, "Ruhestand", "entfällt"],
          [18, "11451", "Gräper", "Birgit", { date: "1958-05-03" }, "Jugendamt", "S 14", { date: "1993-08-01" }, { date: "2025-05-31" }, "Ruhestand", "entfällt"],
          [19, "25131", "Möhlmann", "Elke", { date: "1958-02-17" }, "FD Soziales und Eingliederungshilfe", "EG 9b", { date: "1993-09-01" }, { date: "2025-06-30" }, "Ruhestand", "entfällt"],
          [20, "29213", "Cordes", "Ines", { date: "1973-04-26" }, "Gesundheitsamt", "EG 11", { date: "2019-02-01" }, { date: "2025-08-15" }, "Eigenkündigung", "ja"],
          [21, "13586", "Quast", "Rainer", { date: "1971-04-26" }, "Untere Bauaufsichtsbehörde", "A 10", { date: "2022-06-01" }, { date: "2025-08-15" }, "Eigenkündigung", "nein"],
          [22, "22441", "Schütte", "Petra", { date: "1958-02-22" }, "FD Brand-, Katastrophenschutz und Rettungsdienst", "EG 11", { date: "1987-11-01" }, { date: "2025-08-31" }, "Ruhestand", "entfällt"],
          [23, "28821", "Jürgens", "Erik", { date: "1960-04-11" }, "Jugendamt", "EG 10", { date: "1984-09-01" }, { date: "2025-08-31" }, "Ruhestand", "entfällt"],
          [24, "23873", "Oltmanns", "Ines", { date: "1988-06-15" }, "FD Schulen, Kultur und Schülerbeförderung", "EG 6", { date: "2020-07-01" }, { date: "2025-09-15" }, "Eigenkündigung", "nein"],
          [25, "15863", "Kück", "Anja", { date: "1958-02-06" }, "FD Soziales und Eingliederungshilfe", "EG 9a", { date: "1986-10-01" }, { date: "2025-09-30" }, "Ruhestand", "entfällt"],
          [26, "10082", "Sievers", "Tanja", { date: "1991-06-23" }, "Jugendamt", "EG 10", { date: "2024-03-01" }, { date: "2025-09-30" }, "Ablauf der Befristung", "nein"],
          [27, "32064", "Lindemann", "Kerstin", { date: "1981-08-18" }, "Veterinär- und Lebensmittelüberwachungsamt", "A 11", { date: "2015-12-01" }, { date: "2025-09-30" }, "Aufhebungsvertrag", "nein"],
          [28, "37299", "Albrecht", "Laura", { date: "1986-02-28" }, "Büro des Landrats", "EG 11", { date: "2014-01-01" }, { date: "2025-10-15" }, "Wechsel zu öffentl. Arbeitgeber", "nein"],
          [29, "19742", "Mammen", "Bernd", { date: "1996-01-02" }, "FD Kreisstraßen und ÖPNV", "EG 6", { date: "2021-04-01" }, { date: "2025-10-15" }, "Eigenkündigung", "ja"],
          [30, "12586", "Niemeyer", "Malte", { date: "1975-08-22" }, "Jugendamt", "S 12", { date: "2023-11-01" }, { date: "2025-10-15" }, "Wechsel zu öffentl. Arbeitgeber", "ja"],
          [31, "38925", "Bahr", "Malte", { date: "1981-01-24" }, "Gesundheitsamt", "EG 11", { date: "2017-04-01" }, { date: "2025-10-31" }, "Eigenkündigung", "nein"],
          [32, "28957", "Dreyer", "Rieke", { date: "1959-07-19" }, "Straßenverkehrs- und Zulassungsbehörde", "EG 10", { date: "1986-11-01" }, { date: "2025-10-31" }, "Ruhestand", "entfällt"],
          [33, "27457", "Imholz", "Nina", { date: "1958-03-04" }, "Gesundheitsamt", "EG 9a", { date: "1986-10-01" }, { date: "2025-11-30" }, "Ruhestand", "entfällt"],
          [34, "33381", "Precht", "Carina", { date: "1988-03-17" }, "Jugendamt", "S 12", { date: "2021-04-01" }, { date: "2025-11-30" }, "Wechsel zu öffentl. Arbeitgeber", "ja"],
          [35, "23699", "Fock", "Andreas", { date: "1996-02-18" }, "FD Kreisstraßen und ÖPNV", "EG 9b", { date: "2024-01-01" }, { date: "2025-12-15" }, "Ablauf der Befristung", "nein"],
          [36, "42320", "Ziegenhagen", "Jens", { date: "1983-12-07" }, "Ausländerbehörde", "EG 9a", { date: "2018-07-01" }, { date: "2025-12-31" }, "Eigenkündigung", "ja"],
        ],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "am-auslaenderbehoerde-ein-jahr-nach-rueckstandsvermerk",
    title: "Ausländerbehörde – ein Jahr nach dem Rückstandsvermerk",
    kind: "Präsentation",
    fileName: "Auslaenderbehoerde Bericht Kreisausschuss 2026-09-22",
    org: "altmoorland",
    unit: "am-auslaender",
    author: "am-mertens",
    date: "2026-09-17",
    tags: ["zahlen"],
    keywords: ["1.180", "Fiktionsbescheinigung", "Online-Statusabfrage", "Untätigkeitsklagen", "Einbürgerung", "Kreisausschuss"],
    summary:
      "Bericht der Ausländerbehörde im Kreisausschuss ein Jahr nach dem Rückstandsvermerk: Entwicklung der offenen Vorgänge und Wartezeiten, Bilanz der Sofortmaßnahmen, Personal, Einbürgerung als verbleibende Baustelle und nächste Schritte.",
    slides: [
      { t: "title", title: "Ausländerbehörde – ein Jahr danach", subtitle: "Bericht im Kreisausschuss am 22. September 2026" },
      {
        t: "bullets",
        title: "Ausgangslage im September 2025",
        bullets: [
          "1.910 offene Vorgänge, davon 640 Einbürgerungsanträge",
          "Wartezeit auf einen Vorsprachetermin: 11 Wochen",
          "12 Untätigkeitsklagen anhängig",
          "3 von 14 Stellen unbesetzt, eine Langzeiterkrankung",
          { text: "Sofortmaßnahmen am 22.09.2025 vom Landrat gebilligt", sub: ["Abordnung aus der Zulassungsstelle", "Fiktionsbescheinigung ohne Vorsprache", "Hotline und Online-Formular", "Priorisierung von Verfahren mit Beschäftigungsbezug", "Prüfauftrag KI-Assistent"] },
        ],
        notes: "Zur Erinnerung: Der Vermerk vom 15.09.2025 war die Grundlage für die Entscheidung des Landrats. Die Zahlen dort beziehen sich auf den Stichtag 12.09.2025.",
      },
      {
        t: "chart",
        title: "Offene Vorgänge zum Quartalsende",
        chart: {
          type: "line",
          categories: ["09/2025", "12/2025", "03/2026", "06/2026", "09/2026"],
          series: [
            { name: "offene Vorgänge gesamt", values: [1910, 1790, 1560, 1330, 1180] },
            { name: "davon Einbürgerung", values: [640, 655, 640, 615, 590] },
          ],
          unit: "Vorgänge",
        },
        caption: "Stichtage: 12.09.2025, jeweils Quartalsende, zuletzt 15.09.2026 · Quelle: Fachverfahren Ausländerwesen",
        notes:
          "Der Rückgang kommt fast vollständig aus dem Aufenthaltsrecht. Bei den Einbürgerungen halten wir den Bestand nur knapp, weil weiter mehr Anträge eingehen als wir abschließen.",
      },
      {
        t: "chart",
        title: "Wartezeit auf einen Vorsprachetermin",
        chart: {
          type: "bar",
          categories: ["09/2025", "12/2025", "03/2026", "06/2026", "09/2026"],
          series: [{ name: "Wartezeit in Wochen", values: [11, 10, 7, 5, 4] }],
          unit: "Wochen",
        },
        caption: "Erster freier Termin im Aufenthaltsrecht; Einbürgerungen werden ohne Vorsprachetermin vorgeprüft",
      },
      {
        t: "table",
        title: "Was aus den Sofortmaßnahmen geworden ist",
        header: ["Maßnahme", "Stand", "Wirkung"],
        rows: [
          ["Abordnung von zwei Beschäftigten aus der Zulassungsstelle", "01.11.2025 bis 30.04.2026, abgeschlossen", "rund 950 zusätzlich abgeschlossene Vorgänge"],
          ["Fiktionsbescheinigung ohne Vorsprache per Post", "Regelverfahren seit 15.10.2025", "1.460 Bescheinigungen ohne Termin versandt"],
          ["Hotline und Online-Statusabfrage", "Hotline seit 03.11.2025, Online-Statusabfrage seit 03/2026", "Sachstandsanrufe von rund 140 auf rund 55 je Tag"],
          ["Priorisierung bei Beschäftigungsbezug", "umgesetzt", "keine bekannten Fälle von Arbeitsplatzverlust seit 01/2026"],
          ["Prüfung KI-Assistent", "Prüfung 03/2026 abgeschlossen", "vorerst kein Einsatz; erneute Prüfung 2027"],
        ],
        notes:
          "Zum KI-Assistenten: Der Datenschutzbeauftragte hatte erhebliche Bedenken, weil Sachstandsanfragen fast immer Gesundheits- oder Familiendaten enthalten. Die Online-Statusabfrage löst den größten Teil des Problems ohne KI.",
      },
      {
        t: "bullets",
        title: "Personal",
        bullets: [
          "Stellenplan 2026: 16 statt 14 Stellen",
          "Besetzt zum 01.09.2026: 15,5 Vollzeitäquivalente",
          "Drei Neueinstellungen seit Januar, Einarbeitung dauert rund sechs Monate",
          "Zwei Stellen sind bis 31.12.2027 befristet – Entfristung empfohlen",
        ],
        notes: "Die Einarbeitung ist der eigentliche Engpass. Ohne die Abordnung aus der Zulassungsstelle wäre der Winter nicht zu schaffen gewesen.",
      },
      {
        t: "bullets",
        title: "Baustelle Einbürgerung",
        bullets: [
          "Neue Anträge 2025: 410 (2024: 260), 2026 bis August bereits 330",
          "Durchschnittliche Bearbeitungsdauer: 14 Monate",
          "5 Untätigkeitsklagen anhängig – alle in Einbürgerungsverfahren",
          { text: "Ziel bis Ende 2027: höchstens 9 Monate", sub: ["Vollständigkeitsprüfung direkt bei Eingang", "Online-Antrag mit Dokumenten-Upload (Förderantrag „Digitale Kommune“ gestellt)", "Sammeltermine für Einbürgerungsfeiern statt Einzelterminen"] },
        ],
        notes: "Die 14 Monate sind ein Durchschnitt über alle 2026 abgeschlossenen Verfahren. Ältere Anträge aus 2024 ziehen den Wert nach oben.",
      },
      {
        t: "twocol",
        title: "Bilanz",
        left: {
          heading: "Was gut lief",
          bullets: ["Offene Vorgänge von 1.910 auf 1.180 gesenkt", "Wartezeit fast gedrittelt", "Weniger Anrufe, mehr Zeit für Akten", "Arbeitgeber erhalten Fiktionsbescheinigungen rechtzeitig", "Gute Zusammenarbeit mit der Zulassungsstelle"],
        },
        right: {
          heading: "Was noch fehlt",
          bullets: ["Einbürgerung bleibt zu langsam", "E-Akte noch ohne Schnittstelle zum Fachverfahren", "Hohe Belastung im Team, Krankenstand über Kreisdurchschnitt"],
        },
      },
      {
        t: "bullets",
        title: "Empfehlungen an den Kreisausschuss",
        bullets: [
          "Entfristung der zwei befristeten Stellen im Stellenplan 2027",
          "Online-Antrag Einbürgerung bis 06/2027 umsetzen",
          "Halbjährlicher Bericht im Ausschuss für Ordnung und Verkehr",
        ],
      },
      { t: "end", title: "Vielen Dank!", lines: ["Svenja Mertens · Teamleiterin Ausländerbehörde", "Telefon 040 66969-275"] },
    ],
  },
  {
    type: "powerpoint",
    id: "am-digitale-kreisverwaltung-2027",
    title: "Digitale Kreisverwaltung 2027 – Ziele und Vorhaben",
    kind: "Präsentation",
    fileName: "Digitale Kreisverwaltung 2027 Verwaltungskonferenz",
    org: "altmoorland",
    unit: "am-orga",
    author: "am-domroese",
    date: "2026-06-09",
    keywords: ["Digitale Kreisverwaltung 2027", "Gremieninformationssystem", "Ende-zu-Ende", "Schreibassistenz"],
    summary:
      "Kurze Präsentation des Fachdienstes Organisation und Digitalisierung für die Verwaltungskonferenz: Stand, Ziele bis Ende 2027, Vorhaben mit Kosten und Förderung sowie Leitplanken für den KI-Einsatz.",
    slides: [
      { t: "title", title: "Digitale Kreisverwaltung 2027", subtitle: "Verwaltungskonferenz am 9. Juni 2026" },
      {
        t: "bullets",
        title: "Wo wir stehen",
        bullets: [
          "E-Akte in 9 von 17 Organisationseinheiten produktiv",
          "Online-Zulassung: rund jeder dritte Vorgang",
          "Kreistag und Ausschüsse arbeiten noch mit Papier",
        ],
      },
      {
        t: "bullets",
        title: "Ziele bis Ende 2027",
        bullets: [
          "E-Akte in allen Organisationseinheiten",
          "Ende-zu-Ende digital: Einbürgerung, Bauantrag, Schülerbeförderung",
          "Papierlose Gremienarbeit ab der neuen Wahlperiode",
        ],
      },
      {
        t: "table",
        title: "Vorhaben und Kosten",
        header: ["Vorhaben", "2026", "2027", "Förderung"],
        rows: [
          ["E-Akte für die übrigen Einheiten (mit dem Zweckverband)", "180 T€", "240 T€", "–"],
          ["Online-Antrag Einbürgerung", "95 T€", "60 T€", "„Digitale Kommune“, beantragt"],
          ["Gremieninformationssystem und Tablets", "40 T€", "110 T€", "–"],
          ["Qualifizierung der Beschäftigten", "15 T€", "25 T€", "–"],
        ],
        notes: "Der Förderantrag ist am 27.03.2026 gestellt worden. Bei 75 % Förderung blieben für den Online-Antrag knapp 39 T€ Eigenanteil.",
      },
      {
        t: "bullets",
        title: "KI – mit klaren Regeln",
        bullets: [
          "Grundlage: KI-Leitfaden der Landesverwaltung (11/2025)",
          "Erster Schritt: Schreibassistenz für 40 Beschäftigte",
          "Keine automatisierten Entscheidungen über Anträge",
          "Dienstvereinbarung mit dem Personalrat vor dem Start",
        ],
      },
      { t: "end", title: "Fragen und Diskussion", lines: ["Pascal Domröse · Fachdienst Organisation und Digitalisierung"] },
    ],
  },
];

export const threads: ThreadSpec[] = [
  {
    id: "am-haushalt-brackenhain-2026-hsk",
    title: "Kommunalaufsicht und Gemeinde Brackenhain: Haushalt 2026, Gewerbesteuererstattung und Haushaltssicherungskonzept",
    subject: "Haushaltssatzung 2026 Gemeinde Brackenhain – Vorlage zur Genehmigung",
    org: "altmoorland",
    unit: "am-kommunalaufsicht",
    date: "2026-03-18",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Haushaltssicherungskonzept", "371.500 €", "Rückstellung", "Redaktionsfehler", "Moorweg"],
    summary:
      "Die Kämmerin von Brackenhain legt Haushalt und Haushaltssicherungskonzept vor und meldet kurz darauf eine Gewerbesteuererstattung; die Kommunalaufsicht fragt nach und schickt am Ende die Genehmigung mit Auflagen. Eingebaut: Ausgleichsjahr 2028 statt 2029 (wird geklärt), Konsolidierungsbeitrag 2029 „rund 300.000 €“ statt 280.000 € und ein Zahlendreher beim möglichen Fehlbetrag (738.500 € statt 783.500 €).",
    mails: [
      {
        from: "bh-schnoor",
        to: ["am-behrens"],
        cc: ["am-rademacher", "bh-ruhnau"],
        date: "2026-01-08T09:12",
        body: `Sehr geehrte Frau Behrens,

der Gemeinderat hat am 15.12.2025 die Haushaltssatzung 2026 mit dem Haushaltssicherungskonzept 2026–2029 beschlossen (11 Ja-, 6 Nein-Stimmen). Die Unterlagen gehen Ihnen heute zusätzlich in Papierform zu. Ich bitte um Genehmigung des Gesamtbetrags der Kredite (§ 2) und des Haushaltssicherungskonzepts (§ 7).

Die Eckdaten:
- Ordentliche Erträge 11.898.000 €, ordentliche Aufwendungen 12.310.000 €, **Fehlbetrag 412.000 €**
- Investitionen 2.840.000 €, Kreditermächtigung 1.200.000 €
- Verpflichtungsermächtigungen 930.000 €, Liquiditätskredite höchstens 1.500.000 €
- Hebesätze ab 2026: Grundsteuer B 425 %, Gewerbesteuer 380 %

Das Haushaltssicherungskonzept enthält zwölf Maßnahmen mit einem Konsolidierungsbeitrag von 222.000 € im Jahr 2026, ansteigend auf rund 300.000 € im Jahr 2029. Damit erreichen wir den Haushaltsausgleich im Jahr 2028.

Hauptursache des Fehlbetrags ist die Kreisumlage, die um 322.000 € steigt. Das möchte ich bei aller Kollegialität doch erwähnt haben.

Für Rückfragen stehe ich gern zur Verfügung.

Mit freundlichen Grüßen
Petra Schnoor`,
      },
      {
        from: "bh-schnoor",
        to: ["am-behrens"],
        cc: ["am-rademacher", "bh-ruhnau"],
        date: "2026-01-23T11:40",
        subject: "Nachtrag: Gewerbesteuererstattung – Auswirkungen auf Haushalt 2026 und HSK",
        body: `Sehr geehrte Frau Behrens,

leider muss ich Ihnen eine Entwicklung nachmelden, die das Haushaltssicherungskonzept betrifft.

Am 12.01.2026 sind die geänderten Gewerbesteuermessbescheide des Finanzamts für 2021 bis 2023 eines größeren Betriebs eingegangen. Die Gemeinde muss 386.400 € Gewerbesteuer zuzüglich 21.700 € Erstattungszinsen zurückzahlen; abzüglich der Entlastung bei der Gewerbesteuerumlage (36.600 €) ergibt sich eine **Nettobelastung von 371.500 €**. Die Auszahlung ist für den 16.02.2026 vorgesehen.

Ich kläre mit dem Rechnungsprüfungsamt, ob wir die Erstattung als Rückstellung im Jahresabschluss 2025 erfassen müssen. Wenn nicht, steigt der Fehlbetrag 2026 auf 738.500 €, und wir bräuchten eine Nachtragssatzung. Der Gemeinderat wird am 16.02.2026 informiert.

Mit freundlichen Grüßen
Petra Schnoor`,
      },
      {
        from: "am-behrens",
        to: ["bh-schnoor"],
        cc: ["am-rademacher"],
        date: "2026-02-04T14:40",
        subject: "AW: Haushaltssatzung 2026 Gemeinde Brackenhain – Vorlage zur Genehmigung",
        body: `Sehr geehrte Frau Schnoor,

vielen Dank für die Unterlagen und die offene Information zur Gewerbesteuer. Bevor ich die Genehmigung vorbereiten kann, bitte ich bis zum **20.02.2026** um Antworten auf folgende Fragen:

1. **Ausgleichsjahr:** In Ihrer Mail vom 08.01. steht 2028. Nach der Ergebnisplanung bleibt 2028 aber ein Fehlbetrag von 210.000 €, erst 2029 ergibt sich ein Überschuss von 58.000 €. Was gilt?
2. **Gewerbesteuer:** Wie hat das Rechnungsprüfungsamt die Zuordnung beurteilt? Bei einer Belastung des Jahres 2026 läge der Fehlbetrag bei 783.500 € und damit deutlich über Ihrer Erheblichkeitsgrenze.
3. **Liquidität:** Der Saldo aus laufender Verwaltungstätigkeit (82.000 €) deckt die Tilgung (365.000 €) nicht. Bitte schicken Sie mir eine Liquiditätsplanung 2026 nach Monaten, die die Erstattung berücksichtigt.
4. **Moorweg:** Ist der 2. Bauabschnitt des Wirtschaftswegs Heidhof–Kleinbracken (260.000 €) 2026 unaufschiebbar, oder könnte er verschoben werden?

Mit freundlichen Grüßen
Julia Behrens`,
      },
      {
        from: "bh-schnoor",
        to: ["am-behrens"],
        cc: ["am-rademacher", "bh-ruhnau"],
        date: "2026-02-19T16:55",
        body: `Sehr geehrte Frau Behrens,

zu Ihren Fragen:

1. Richtig ist **2029**. Die Jahreszahl 2028 ist ein Redaktionsfehler aus einem frühen Entwurf meines Anschreibens. Im beschlossenen Konzept steht 2029.
2. Das Rechnungsprüfungsamt hält eine **Rückstellung** im Jahresabschluss 2025 für geboten, weil das Einspruchsverfahren schon vor dem Bilanzstichtag lief und die Bescheide die Lage zum 31.12.2025 nur bestätigen. Die abschließende Prüfung erfolgt mit dem Jahresabschluss. Das Ergebnis 2026 bliebe damit bei 412.000 €, die Überschussrücklage ist dann allerdings schon 2025 aufgebraucht. Der Gemeinderat hat den Bericht am 16.02. zur Kenntnis genommen.
3. Die Liquiditätsplanung liegt bei. Wir rechnen ab Mai mit Liquiditätskrediten, in der Spitze im November mit rund 900.000 €.
4. Der Moorweg ist dringend, die Bankette brechen ab, und die Landwirte in Heidhof sind auf den Weg angewiesen. Wenn es sein muss, können wir aber bis 2027 warten und notdürftig ausbessern.

Mit freundlichen Grüßen
Petra Schnoor`,
      },
      {
        from: "am-behrens",
        to: ["bh-schnoor"],
        cc: ["am-rademacher", "bh-ruhnau"],
        date: "2026-03-18T15:30",
        attachments: ["am-haushaltsgenehmigung-brackenhain-2026"],
        body: `Sehr geehrte Frau Schnoor,

anbei erhalten Sie vorab die Genehmigungsverfügung zur Haushaltssatzung 2026. Das Original geht Herrn Bürgermeister Ruhnau gegen Empfangsbekenntnis zu.

Kurz zusammengefasst:
- Die Kreditermächtigung von 1.200.000 € ist genehmigt. Die 260.000 € für den Moorweg dürfen Sie erst in Anspruch nehmen, wenn die Fortschreibung des Haushaltssicherungskonzepts vorliegt und den Ausgleich 2029 weiter darstellt.
- Das Haushaltssicherungskonzept ist mit Auflagen genehmigt: Fortschreibung mit der Gewerbesteuererstattung bis **30.06.2026**, Berichte erstmals bis 31.07.2026, Deckel für die freiwilligen Leistungen bei 382.000 €, quartalsweise Meldung der Liquiditätskredite.
- Falls die Erstattung doch das Jahr 2026 belastet, brauchen Sie eine Nachtragssatzung.

Bitte denken Sie an die öffentliche Bekanntmachung mit Hinweis auf Genehmigung, Bedingung und Auflagen.

Mit freundlichen Grüßen
Julia Behrens`,
      },
    ],
  },
  {
    id: "am-asp-uebung-hof-bruns",
    title: "Tierseuchenübung zur Afrikanischen Schweinepest auf einem Hof in Heidhof",
    subject: "Tierseuchenübung „Hofschranke 2025“ – Anfrage Übungsbetrieb",
    org: "altmoorland",
    unit: "am-veterinaer",
    date: "2025-07-22",
    keywords: ["Hofschranke 2025", "Afrikanischen Schweinepest", "Desinfektionsschleuse", "Kontrollstelle", "30.09.2025"],
    summary:
      "Das Veterinäramt fragt Landwirt Bruns, ob auf seinem Schweinemastbetrieb eine ASP-Übung stattfinden kann, und stimmt die Unterstützung mit der Polizeiinspektion ab; der Termin muss verlegt werden, der Landwirt stellt Bedingungen (Biosicherheit, keine Namensnennung in der Presse).",
    mails: [
      {
        from: "am-wessel",
        to: ["ext-bruns"],
        cc: ["am-meyerhoff"],
        date: "2025-07-08T10:05",
        body: `Sehr geehrter Herr Bruns,

Herr Bürgermeister Ruhnau hat mir Ihre Kontaktdaten gegeben und gesagt, dass Sie einer Anfrage gegenüber grundsätzlich offen wären. Vielen Dank schon einmal dafür.

Das Veterinäramt plant gemeinsam mit dem Fachdienst Brand- und Katastrophenschutz und der Polizei eine Tierseuchenübung zur **Afrikanischen Schweinepest** (Arbeitstitel „Hofschranke 2025“). Angenommen wird ein Ausbruch in einem Mastbetrieb. Geübt werden unter anderem:
- das Einrichten einer Desinfektionsschleuse an der Hofzufahrt,
- die Probenahme und die Dokumentation durch das Veterinäramt,
- die Organisation einer Kontrollstelle an der Zufahrtsstraße,
- die Zusammenarbeit von Stab, Feuerwehr und Polizei.

Wichtig: Es werden **keine Tiere** einbezogen und **niemand betritt die Ställe**. Die Übung findet ausschließlich auf der Hofzufahrt, dem Hofplatz und einer angrenzenden Fläche statt. Geplant ist Dienstag, der 23.09.2025, von 8 bis etwa 14 Uhr, mit rund 60 Beteiligten.

Für den Aufwand würden wir Ihnen eine Aufwandsentschädigung von 400 € zahlen und selbstverständlich alle Flächen so hinterlassen, wie wir sie vorgefunden haben.

Hätten Sie Interesse? Gern komme ich für ein Gespräch zu Ihnen auf den Hof.

Mit freundlichen Grüßen
Dr. Henning Wessel`,
      },
      {
        from: "ext-bruns",
        to: ["am-wessel"],
        date: "2025-07-10T21:14",
        body: `Moin Herr Dr. Wessel,

ja der Bürgermeister hatte das schon angedeutet. Grundsätzlich mach ich mit, aber ein paar Sachen müssen klar sein:

- In den Stall kommt keiner, auch nicht "nur mal gucken". Wir haben 1.400 Mastplätze und ich hab keine Lust mir irgendwas einzufangen. Die Hygieneschleuse am Stall bleibt zu.
- Fahrzeuge bitte nicht auf den Hofplatz sondern auf die Wiese an der Straße nach Kleinbracken, da ist genug Platz. Wenns vorher geregnet hat wirds da aber matschig.
- Der 23.09. ist schlecht, da sind wir mitten in der Maisernte wenn das Wetter mitspielt. Lieber eine Woche später.
- Und ganz wichtig: mein Name und der Hof kommen nicht in die Zeitung. Wenn da steht "Schweinepest bei Bruns" denken die Leute noch wir hätten das wirklich, und die Nachbarn fragen jetzt schon.

Wenn das passt können sie gern mal vorbeikommen, am besten vormittags.

Gruß
Hinrich Bruns
Hof Bruns, Heidhof`,
      },
      {
        from: "am-wessel",
        to: ["ext-martens"],
        cc: ["am-meyerhoff"],
        date: "2025-07-14T09:30",
        subject: "Tierseuchenübung „Hofschranke 2025“ – Unterstützung durch die Polizeiinspektion",
        quote: false,
        body: `Sehr geehrter Herr Martens,

wie telefonisch angekündigt: Das Veterinäramt plant mit dem Fachdienst Brand- und Katastrophenschutz eine Übung zur Afrikanischen Schweinepest auf einem Mastbetrieb im Ortsteil Heidhof der Gemeinde Brackenhain. Der Betriebsinhaber hat zugestimmt, möchte aber eine Woche später als ursprünglich geplant. Wir zielen deshalb auf **Dienstag, 30.09.2025, 8 bis 14 Uhr**.

Wir würden uns über die Unterstützung der Polizeiinspektion freuen, insbesondere bei:
1. Absperrung der Gemeindestraße zum Hof (Heidhofer Weg) für die Dauer der Übung,
2. Verkehrslenkung an der Einmündung in die Kreisstraße,
3. einer **Kontrollstelle** im Übungsszenario: Kontrolle von Fahrzeugen auf Verstöße gegen das Verbringungsverbot (nur mit Übungsfahrzeugen),
4. einer Beobachterin oder einem Beobachter für die Auswertung.

Die Vorbesprechung mit allen Beteiligten soll am 02.09.2025 um 10 Uhr im Kreishaus stattfinden.

Können Sie mir bis Ende Juli sagen, ob und mit wie vielen Kräften Sie unterstützen können?

Mit freundlichen Grüßen
Dr. Henning Wessel`,
      },
      {
        from: "ext-martens",
        to: ["am-wessel"],
        cc: ["am-meyerhoff"],
        date: "2025-07-21T14:12",
        subject: "AW: Tierseuchenübung „Hofschranke 2025“ – Unterstützung durch die Polizeiinspektion",
        body: `Sehr geehrter Herr Dr. Wessel,

die Polizeiinspektion unterstützt die Übung am 30.09.2025 gern. Wir planen mit vier Beamtinnen und Beamten und einem Streifenwagen für Absperrung und Verkehrslenkung sowie zwei Kräften für die Kontrollstelle. Eine Beobachterin aus dem Einsatzstab der Inspektion kommt dazu.

Zwei Hinweise:
- An der Kontrollstelle werden **keine echten Kennzeichen erfasst** und keine unbeteiligten Fahrzeuge angehalten. Bitte stellen Sie ausreichend Übungsfahrzeuge mit Darstellenden.
- Den Termin 02.09. kann ich nicht wahrnehmen, mein Vertreter POK Lühr kommt.

Freundliche Grüße
Jörn Martens`,
      },
      {
        from: "am-wessel",
        to: ["ext-bruns"],
        cc: ["am-meyerhoff", "ext-martens"],
        date: "2025-07-22T08:45",
        subject: "AW: Tierseuchenübung „Hofschranke 2025“ – Anfrage Übungsbetrieb",
        quote: false,
        body: `Sehr geehrter Herr Bruns,

vielen Dank für Ihre Zusage. Ihre Bedingungen nehmen wir so auf:
- Niemand betritt die Ställe, die Hygieneschleuse bleibt geschlossen.
- Die Fahrzeuge stehen auf der Wiese an der Straße nach Kleinbracken. Bei nassem Wetter legt die Feuerwehr Fahrbahnplatten aus.
- Die Übung findet am **30.09.2025** statt, also eine Woche später.
- In Pressemitteilungen sprechen wir nur von „einem landwirtschaftlichen Betrieb im Ortsteil Heidhof“. Ihr Name und die Hofbezeichnung werden nicht genannt.

Die Polizeiinspektion Altmoor unterstützt mit Absperrung und Kontrollstelle; Herr Martens ist in Kopie.

Für die Ortsbegehung schlage ich Dienstag, 26.08.2025, um 10 Uhr vor. Ich komme mit Herrn Meyerhoff vom Katastrophenschutz.

Mit freundlichen Grüßen
Dr. Henning Wessel`,
      },
    ],
  },
  {
    id: "am-presseanfrage-wartezeiten-auslaenderbehoerde",
    title: "Presseanfrage des Altmoorländer Kreisblatts zu Wartezeiten in der Ausländerbehörde",
    subject: "Anfrage: Wartezeiten und Rückstände in der Ausländerbehörde",
    org: "altmoorland",
    unit: "am-presse",
    date: "2026-09-25",
    tags: ["zahlen"],
    keywords: ["Altmoorländer Kreisblatt", "1.180", "14 Monate", "Online-Statusabfrage", "Samstagsausgabe"],
    summary:
      "Ein Redakteur fragt nach dem Bericht im Kreisausschuss nach Wartezeiten, Rückständen und KI-Einsatz; die Pressestelle holt Zahlen bei der Ausländerbehörde ein und antwortet mit der Präsentation im Anhang. Übung: Antwort prüfen, kürzen oder selbst entwerfen.",
    mails: [
      {
        from: "ext-brocks",
        to: ["am-harms"],
        date: "2026-09-23T17:48",
        body: `Hallo Frau Harms,

im Kreisausschuss am Dienstag hat die Ausländerbehörde ja eine Art Erfolgsbilanz vorgestellt. Ich plane dazu einen Bericht für die **Samstagsausgabe** und habe ein paar Fragen:

1. Wie lange wartet man aktuell auf einen Termin?
2. Wie viele Vorgänge sind offen, und wie viele davon sind Einbürgerungen?
3. Mehrere Leserinnen und Leser schreiben uns, dass sie seit über einem Jahr auf ihre Einbürgerung warten. Wie lange dauert ein Einbürgerungsverfahren im Schnitt?
4. Wie viele Untätigkeitsklagen sind anhängig, und was haben die den Kreis bisher gekostet?
5. Im letzten Jahr war von einem KI-Assistenten die Rede. Ist der inzwischen im Einsatz?

Antworten bräuchte ich bis Freitag, 12 Uhr.

Viele Grüße
Thomas Brocks`,
      },
      {
        from: "am-harms",
        to: ["am-mertens"],
        cc: ["am-rieger"],
        date: "2026-09-24T08:31",
        subject: "WG: Anfrage: Wartezeiten und Rückstände in der Ausländerbehörde",
        body: `Liebe Frau Mertens,

unten die Anfrage von Herrn Brocks. Können Sie mir bis heute 14 Uhr die Zahlen zu 1 bis 5 schicken? Zu Frage 4 (Kosten) würde ich gern nur allgemein antworten, falls es da keine belastbare Zahl gibt.

Danke und viele Grüße
Lena Harms`,
      },
      {
        from: "am-mertens",
        to: ["am-harms"],
        cc: ["am-rieger"],
        date: "2026-09-24T13:52",
        subject: "AW: WG: Anfrage: Wartezeiten und Rückstände in der Ausländerbehörde",
        body: `Liebe Frau Harms,

hier die Zahlen, Stand 15.09.2026, identisch mit der Präsentation im Kreisausschuss:

1. Wartezeit auf einen Vorsprachetermin im Aufenthaltsrecht: **4 Wochen** (vor einem Jahr 11 Wochen). Wichtig: Das gilt nicht für Einbürgerungen, dort gibt es keine Vorsprachetermine in diesem Sinne.
2. Offen: **1.180** Vorgänge, davon 590 Einbürgerungsanträge.
3. Einbürgerung: durchschnittlich **14 Monate** von Antrag bis Urkunde. Die Leserbriefe sind also leider nicht übertrieben.
4. 5 Untätigkeitsklagen, alle Einbürgerung. Kosten kann ich nicht seriös beziffern, die Verfahren laufen noch.
5. Kein KI-Assistent. Stattdessen gibt es seit März die Online-Statusabfrage, die viele Anrufe überflüssig macht.

Bitte nicht schreiben, dass die Wartezeit insgesamt bei vier Wochen liegt – dann fühlen sich die Einbürgerungsbewerber zu Recht veräppelt.

Viele Grüße
Svenja Mertens`,
      },
      {
        from: "am-harms",
        to: ["ext-brocks"],
        cc: ["am-mertens"],
        date: "2026-09-25T11:15",
        subject: "AW: Anfrage: Wartezeiten und Rückstände in der Ausländerbehörde",
        quote: false,
        attachments: ["am-auslaenderbehoerde-ein-jahr-nach-rueckstandsvermerk"],
        body: `Sehr geehrter Herr Brocks,

vielen Dank für Ihre Anfrage. Gern beantworte ich Ihre Fragen (Stand jeweils 15.09.2026):

1. Auf einen Vorsprachetermin im Aufenthaltsrecht wartet man derzeit rund vier Wochen; vor einem Jahr waren es elf Wochen. Für Einbürgerungen werden keine Vorsprachetermine vergeben, die Anträge werden schriftlich vorgeprüft.
2. Offen sind 1.180 Vorgänge (September 2025: 1.910), davon 590 Einbürgerungsanträge.
3. Ein Einbürgerungsverfahren dauert derzeit durchschnittlich 14 Monate. Das ist zu lang. Ziel ist eine Bearbeitungsdauer von höchstens neun Monaten bis Ende 2027. Dazu gehören zusätzliche Stellen, eine Vollständigkeitsprüfung direkt bei Eingang und ein Online-Antrag.
4. Anhängig sind fünf Untätigkeitsklagen, alle in Einbürgerungsverfahren. Zu Kosten laufender Verfahren äußern wir uns nicht.
5. Ein KI-Assistent ist nicht im Einsatz. Seit März 2026 können Antragstellende den Stand ihres Verfahrens über die Online-Statusabfrage selbst einsehen.

Die im Kreisausschuss gezeigte Präsentation finden Sie im Anhang; sie war Teil der öffentlichen Sitzung. Für ein Gespräch mit Frau Mertens stehen wir gern zur Verfügung.

Mit freundlichen Grüßen
Lena Harms`,
      },
    ],
  },
  {
    id: "am-arbeitgeber-aufenthaltserlaubnis-wedemeyer",
    title: "Arbeitgeber fragt nach der Verlängerung der Aufenthaltserlaubnis eines Mitarbeiters",
    subject: "Aufenthaltserlaubnis unseres Mitarbeiters Herrn Kovačević – dringend",
    org: "altmoorland",
    unit: "am-auslaender",
    date: "2026-04-16",
    tags: ["personendaten"],
    keywords: ["Kovačević", "§ 81 Abs. 4 AufenthG", "Fiktionsbescheinigung", "Vollmacht", "Wedemeyer Landtechnik"],
    summary:
      "Ein Arbeitgeber sorgt sich um die auslaufende Aufenthaltserlaubnis seines Mechatronikers und schickt ungefragt zahlreiche Personaldaten; die Ausländerbehörde erklärt die Fortgeltungsfiktion, fordert eine Vollmacht und versendet Fiktionsbescheinigungen. Gut für Anonymisierung und Datenschutzfragen.",
    mails: [
      {
        from: "ext-wedemeyer",
        to: ["am-struck"],
        cc: ["am-mertens"],
        date: "2026-04-13T07:52",
        body: `Sehr geehrte Frau Struck,

ich wende mich an Sie, weil ich telefonisch seit einer Woche niemanden erreiche.

Unser Landmaschinenmechatroniker **Herr Armin Kovačević** (geb. 14.03.1994, bosnisch-herzegowinischer Staatsangehöriger, wohnhaft Am Sielweg 3 in Fennhusen) arbeitet seit August 2022 unbefristet bei uns. Seine Aufenthaltserlaubnis läuft am **30.04.2026** ab. Er hat die Verlängerung am 09.03.2026 über Ihr Online-Formular beantragt und eine Eingangsbestätigung bekommen. Als Termin wurde ihm jetzt der 16.06.2026 angeboten.

Ich kann es mir nicht leisten, ab dem 1. Mai jemanden ohne gültige Papiere zu beschäftigen – das kostet mich im Zweifel ein Bußgeld, und ihn vielleicht den Job. Gleichzeitig ist er mein bester Mann in der Werkstatt, mitten in der Saison.

Was muss ich tun? Darf er nach dem 30.04. weiterarbeiten?

Mit freundlichen Grüßen
Dirk Wedemeyer`,
      },
      {
        from: "am-struck",
        to: ["ext-wedemeyer"],
        cc: ["am-mertens"],
        date: "2026-04-13T11:20",
        body: `Sehr geehrter Herr Wedemeyer,

vielen Dank für Ihre Nachricht. Zunächst zur Beruhigung, ganz allgemein: Wer die Verlängerung seiner Aufenthaltserlaubnis **vor deren Ablauf** beantragt, für den gilt der bisherige Aufenthaltstitel nach **§ 81 Abs. 4 AufenthG** bis zur Entscheidung der Ausländerbehörde als fortbestehend – einschließlich der Erlaubnis zur Beschäftigung. Darüber stellen wir eine Fiktionsbescheinigung aus.

Zum konkreten Fall darf ich Ihnen allerdings nur Auskunft geben, wenn Herr Kovačević damit einverstanden ist. Bitte schicken Sie mir deshalb eine von ihm unterschriebene **Vollmacht** (formlos genügt, mit Datum und Unterschrift).

Für die Verlängerung benötigen wir außerdem:
- eine aktuelle Arbeitgeberbescheinigung oder den Arbeitsvertrag,
- die Lohnabrechnungen der letzten drei Monate,
- einen Nachweis über die Krankenversicherung,
- ein aktuelles biometrisches Passfoto.

Die Unterlagen können über das Online-Formular hochgeladen werden.

Mit freundlichen Grüßen
Melanie Struck`,
      },
      {
        from: "ext-wedemeyer",
        to: ["am-struck"],
        cc: ["am-mertens"],
        date: "2026-04-14T19:05",
        body: `Sehr geehrte Frau Struck,

danke für die schnelle Antwort! Die Vollmacht hat Herr Kovačević heute unterschrieben, ich schicke sie Ihnen morgen früh per Post, eingescannt hab ich sie leider nicht gut hinbekommen.

Damit Sie alles haben, hier schon mal die Daten:
- Reisepass Nr. B4471902, gültig bis 21.07.2031
- Steuer-ID 47 128 663 905
- Rentenversicherungsnummer 14 140394 K 012
- Bruttolohn 3.150 € monatlich, Lohnsteuerklasse III
- Krankenversicherung: gesetzlich (Betriebskrankenkasse), Versichertennr. K418829377
- Gehaltskonto: DE00 4400 1234 5678 9000 12

Er hat übrigens letztes Jahr einen Bandscheibenvorfall gehabt und war sechs Wochen krank, das ist aber ausgeheilt – falls das eine Rolle spielt.

Was mir noch einfällt: Seine Frau Amra (geb. 02.11.1996) und die Kinder Lejla (5) und Tarik (2) haben auch eine Aufenthaltserlaubnis, die von Frau Kovačević läuft meines Wissens auch am 30.04. ab. Sie hat aber, glaube ich, noch keinen Antrag gestellt, weil sie dachte, das läuft automatisch mit. Können Sie das gleich mit erledigen?

Mit freundlichen Grüßen
Dirk Wedemeyer`,
      },
      {
        from: "am-struck",
        to: ["ext-wedemeyer"],
        cc: ["am-mertens"],
        date: "2026-04-16T09:40",
        body: `Sehr geehrter Herr Wedemeyer,

die Vollmacht ist heute eingegangen, vielen Dank.

1. Für Herrn Kovačević habe ich die **Fiktionsbescheinigung** heute per Post an seine Wohnanschrift geschickt. Er darf damit nach dem 30.04.2026 bei Ihnen weiterarbeiten. Bitte nehmen Sie eine Kopie zu Ihren Personalunterlagen.
2. Den Vorsprachetermin konnte ich auf den **12.05.2026, 10:30 Uhr**, Kreishaus, Raum 0.14, vorziehen.
3. Frau Kovačević muss den Verlängerungsantrag für sich und die Kinder selbst stellen, und zwar **unbedingt vor dem 30.04.2026**, sonst entsteht keine Fortgeltungswirkung. Ihre Vollmacht gilt nur für Herrn Kovačević. Bitte richten Sie ihr aus, dass sie sich direkt bei mir melden kann; die Familie kann am 12.05. gemeinsam kommen.

Eine Bitte noch: Schicken Sie uns Steuer-ID, Kontodaten, Versicherungsnummern oder Angaben zur Gesundheit bitte nicht per unverschlüsselter E-Mail. Für die Verlängerung brauchen wir diese Angaben ohnehin nicht. Ich habe Ihre Mail vom 14.04. nach Übernahme der benötigten Angaben gelöscht.

Mit freundlichen Grüßen
Melanie Struck`,
      },
    ],
  },
];
