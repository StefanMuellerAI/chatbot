// Gemeinde Brackenhain (kreisangehörig im Landkreis Altmoorland)
import type { CellSpec, DocSpec, ThreadSpec } from "../types";

// Neue Personen (werden später nach world.ts übernommen).
// Winterdienst 2025/26 des Bauhofs: Datum, Beginn, Ende, Tour, Fahrzeuge, Personal (Kürzel), Streusalz in t, Bemerkung.
// Stunden, Personal- und Fahrzeugsummen werden daraus berechnet, damit die Blätter zusammenpassen.
type WinterEinsatz = [string, string, string, string, string[], string[], number, string];
const WINTER: WinterEinsatz[] = [
  ["2025-11-21", "04:30", "08:15", "A+C", ["Fzg. 3", "Hand"], ["Ah", "Kö", "Mi"], 4.2, "Reifglätte, Schulweg Kleinbracken 6:40 fertig"],
  ["2025-11-28", "05:00", "07:30", "A", ["Fzg. 3"], ["Kö", "Sz"], 3.1, "nur Brücke Mühlenbach + Kirchberg glatt"],
  ["2025-12-02", "04:00", "09:30", "A+B+C", ["Fzg. 3", "Fzg. 5", "Hand"], ["Ah", "Kö", "Mi", "Sz", "Bö"], 8.6, "erster Schnee ca. 6 cm, Bus 640 hängt Heidhofer Str. fest 7:10, Polizei informiert"],
  ["2025-12-03", "04:30", "07:45", "A+B", ["Fzg. 3", "Fzg. 5"], ["Ja", "Wi", "Ro"], 6.4, "Nachstreuen Schneeglätte"],
  ["2025-12-10", "05:15", "07:00", "A", ["Fzg. 3"], ["Bö", "Ha"], 2.8, ""],
  ["2025-12-16", "03:45", "08:30", "A+B+C", ["Fzg. 3", "Fzg. 5", "Hand"], ["Ah", "Kö", "Mi", "Sz", "Ja"], 8.9, "EISREGEN! 4:20 Pkw im Graben K 12 Höhe Heidhof, Streuteller Fzg. 3 klemmt"],
  ["2025-12-17", "04:30", "06:45", "A+B", ["Fzg. 5"], ["Bö", "Wi"], 5.2, "Fzg. 3 in Werkstatt (Streuteller), nur Traktor"],
  ["2025-12-27", "06:00", "09:00", "A+C", ["Fzg. 3", "Hand"], ["Ro", "Ha"], 4.1, "Feiertags-Rufbereitschaft; Beschwerde Am Kirchberg: Schneewall vor Einfahrt -> Hinweis Räumpflicht Anlieger"],
  ["2026-01-02", "04:00", "09:15", "A+B+C", ["Fzg. 3", "Fzg. 5", "Hand"], ["Ah", "Kö", "Mi", "Sz", "Bö", "Ja"], 9.4, "Neuschnee 12 cm"],
  ["2026-01-03", "05:00", "08:30", "A+B", ["Fzg. 3", "Fzg. 5"], ["Wi", "Ro", "Ha"], 7.1, ""],
  ["2026-01-05", "04:15", "08:45", "A+B+C", ["Fzg. 3", "Fzg. 5", "Hand"], ["Ah", "Kö", "Mi", "Sz"], 8.2, "Schulbeginn, Schulweg 6:30 fertig"],
  ["2026-01-06", "04:30", "07:30", "A+B", ["Fzg. 3", "Fzg. 5"], ["Bö", "Ja", "Wi"], 6.0, "Salz knapp (Halle ca. 25 t nach Augenmaß), 50 t nachbestellt, Lieferung erst 09.01.!"],
  ["2026-01-07", "05:00", "07:00", "A", ["Fzg. 3"], ["Ro", "Ha"], 2.2, "nur Gefahrstellen wg. Salzmangel, Splitt beigemischt"],
  ["2026-01-08", "04:30", "07:15", "A+C", ["Fzg. 3", "Hand"], ["Ah", "Kö", "Mi"], 2.6, "nur Gefahrstellen; Elternvertretung Kindergarten beschwert sich über Gehweg Lindenstraße"],
  ["2026-01-12", "04:00", "08:00", "A+B+C", ["Fzg. 3", "Fzg. 5", "Hand"], ["Sz", "Bö", "Ja", "Wi"], 8.8, ""],
  ["2026-01-13", "04:45", "07:30", "A+B", ["Fzg. 3", "Fzg. 5"], ["Ro", "Ha", "Kö"], 6.3, ""],
  ["2026-01-19", "05:30", "07:00", "A", ["Fzg. 3"], ["Mi", "Sz"], 2.4, "Reifglätte"],
  ["2026-01-22", "03:30", "09:00", "A+B+C", ["Fzg. 3", "Fzg. 5", "Fzg. 7", "Hand"], ["Ah", "Kö", "Mi", "Sz", "Bö", "Ja", "Wi"], 10.5, "starker Schneefall ca. 15 cm, Fzg. 7 auf Gehwegen; Bö + Ja danach direkt zum Feuerwehreinsatz (VU K 12)"],
  ["2026-01-23", "04:30", "08:00", "A+B+C", ["Fzg. 3", "Fzg. 5", "Hand"], ["Ro", "Ha", "Kö", "Mi"], 8.1, "Nachräumen, Schneewälle an Bushaltestellen"],
  ["2026-01-24", "06:00", "09:30", "A+B", ["Fzg. 3", "Fzg. 5"], ["Sz", "Wi"], 6.7, "Samstag, Rufbereitschaft"],
  ["2026-01-28", "05:00", "07:15", "A", ["Fzg. 3"], ["Bö", "Ja"], 3.0, ""],
  ["2026-02-02", "04:15", "08:15", "A+B+C", ["Fzg. 3", "Fzg. 5", "Hand"], ["Ah", "Kö", "Mi", "Sz"], 8.4, "Eisregen, Anruf Bürgerin 5:10 Glätte Mühlenbachbrücke"],
  ["2026-02-03", "04:30", "07:00", "A+B", ["Fzg. 3", "Fzg. 5"], ["Wi", "Ro", "Ha"], 5.9, ""],
  ["2026-02-09", "05:00", "07:30", "A+C", ["Fzg. 3", "Hand"], ["Bö", "Ja", "Kö"], 3.6, "Mi krank, Kö für ihn eingesprungen"],
  ["2026-02-13", "04:45", "07:45", "A+B", ["Fzg. 3", "Fzg. 5"], ["Sz", "Wi"], 5.8, ""],
  ["2026-02-18", "05:30", "07:00", "A", ["Fzg. 3"], ["Ro", "Ha"], 2.3, "Reifglätte"],
  ["2026-02-24", "05:00", "07:00", "A", ["Fzg. 3"], ["Ah", "Mi"], 2.1, "Rest in der Halle ca. 20 t nach Augenmaß"],
  ["2026-02-27", "05:15", "06:45", "A", ["Fzg. 3"], ["Kö", "Sz"], 1.9, "nur Brücke + Kirchberg"],
];
const minutes = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
const einsatzStunden = (e: WinterEinsatz) => (minutes(e[2]) - minutes(e[1])) / 60;
const WINTER_LAST_ROW = 4 + WINTER.length;
const WINTER_CREW: [string, string, string, number][] = [
  ["Ah", "Ahlers", "Leiter Bauhof", 2],
  ["Kö", "Köster", "Vorarbeiter", 4],
  ["Mi", "Mielke", "Straßenwärter", 4],
  ["Sz", "Schulz", "Straßenwärter", 4],
  ["Bö", "Böhm", "Gärtner", 4],
  ["Ja", "Janßen", "Gärtner", 4],
  ["Wi", "Witte", "Kraftfahrer", 4],
  ["Ro", "Rohlfs", "Gemeindearbeiter", 3],
  ["Ha", "Hagedorn", "Gemeindearbeiter", 3],
];
const winterRows: CellSpec[][] = WINTER.map((e, i) => [
  i + 1,
  { date: e[0] },
  e[1],
  e[2],
  e[3],
  e[4].join(" + "),
  e[5].join(", "),
  e[5].length,
  einsatzStunden(e),
  { f: "H{r}*I{r}" },
  e[6],
  e[7],
]);
const crewRows: CellSpec[][] = WINTER_CREW.map(([kuerzel, name, funktion, wochen]) => {
  const eigene = WINTER.filter((e) => e[5].includes(kuerzel));
  return [kuerzel, name, funktion, eigene.length, eigene.reduce((s, e) => s + einsatzStunden(e), 0), eigene.filter((e) => minutes(e[1]) < 300).length, wochen, { f: "G{r}*110" }];
});
const fahrzeugStunden = (fzg: string) => WINTER.filter((e) => e[4].includes(fzg)).reduce((s, e) => s + einsatzStunden(e), 0);

export const documents: DocSpec[] = [
  {
    type: "word",
    id: "bh-gespraechsnotiz-laerm-dgh",
    title: "Gesprächsnotiz: Beschwerde über Lärm am Dorfgemeinschaftshaus",
    kind: "Gesprächsnotiz",
    fileName: "Gespraechsnotiz Beschwerde Laerm DGH Lindenweg",
    org: "brackenhain",
    unit: "bh-ordnung",
    author: "bh-krull",
    date: "2025-09-22",
    tags: ["personendaten", "unstrukturiert"],
    keywords: ["Lindenweg 14", "Wolters", "Nutzungsordnung", "Zimmerlautstärke"],
    summary:
      "Stichpunktartige Notiz zu einem Telefonat mit einem Anwohner, der sich über Feiern im Dorfgemeinschaftshaus beschwert – mit (erfundenen) personenbezogenen Daten und offenen Punkten.",
    meta: [["Aktenzeichen", "32-120.3"]],
    subject: "Tel. Beschwerde Hr. Wolters – Lärm DGH Lindenweg",
    blocks: [
      {
        t: "p",
        text: "**Anruf am 22.09.2025, 8:20–8:41 Uhr** (Hr. Wolters hat bereits am Freitag, 19.09., 22:47 Uhr eine E-Mail geschickt, siehe Posteingang Ordnungsamt)",
      },
      {
        t: "ul",
        items: [
          "Anrufer: Karl-Heinz Wolters, Lindenweg 14, 00758 Brackenhain, Tel. 040 66969-718 (privat), wohnt direkt gegenüber DGH",
          "Beschwerde: Feiern im DGH fast jedes WE, zuletzt Sa 20.09. „bis halb drei“, Musik mit Bass, Leute rauchen vor der Tür, Flaschen auf dem Gehweg",
          "Hr. W. sehr aufgebracht, droht mit Anwalt und „Zeitung“, will Namen der Mieter wissen (habe ich NICHT herausgegeben!)",
          "lt. Hr. W. am 20.09. Feier „Familie Özdemir“ (Geburtstag?) – stimmt mit Belegungsplan überein: Mieter Fr. Selin Özdemir, Am Kirchberg 3",
          "Hr. W. hat Handyvideo von 1:52 Uhr – Musik deutlich hörbar, will es schicken",
          "Polizei war NICHT da (Hr. W.: „bringt ja eh nichts“)",
        ],
      },
      { t: "h2", text: "Prüfung bisher" },
      {
        t: "ul",
        items: [
          "Nutzungsordnung DGH v. 2019: Nutzung bis 24:00 Uhr, „danach Zimmerlautstärke“ – keine klare Endzeit für Musik!",
          "Belegung Aug/Sept: 7 private Feiern an 6 Wochenenden (Liste Hauptamt, Fr. Höfer)",
          "Beschwerden 2024: 2 (beide Hr. W.), 2025 bisher 4 (3× Hr. W., 1× Ehepaar Brunke, Lindenweg 10)",
          "Kaution wurde bei Fam. Ö. nicht einbehalten, Hausmeister (Hr. Grabowski) hat Schlüssel am So 11 Uhr zurückbekommen, „alles sauber“",
        ],
      },
      { t: "h2", text: "Vereinbart / To do" },
      {
        t: "ol",
        items: [
          "Rückruf an Hr. W. bis Mi 24.09. mit Zwischenstand",
          "Fam. Ö. anschreiben (Hinweis auf Nutzungsordnung, keine Sanktion, da Endzeit unklar)",
          "Vorschlag an BGM: Nutzungsordnung ändern – Musik nur bis 22:00 Uhr, danach Fenster/Türen zu, Kaution erhöhen (150 → 300 €)?",
          "Lärmmessung? → Landkreis fragen (Untere Immissionsschutzbehörde), ob Messgerät ausgeliehen werden kann",
        ],
      },
      {
        t: "note",
        text: "Achtung Datenschutz: Namen der Mieter nicht an Beschwerdeführer weitergeben. Video von Hr. W. nur zur Akte, nicht weiterleiten (Personen evtl. erkennbar).",
      },
      { t: "signature", lines: ["Kr."] },
    ],
  },
  {
    type: "word",
    id: "bh-haushaltssatzung-2026-hsk",
    title: "Haushaltssatzung 2026 mit Vorbericht und Haushaltssicherungskonzept",
    kind: "Haushaltssatzung",
    fileName: "GR-2025-087 Haushaltssatzung 2026 mit Vorbericht und HSK",
    org: "brackenhain",
    unit: "bh-kasse",
    author: "bh-schnoor",
    date: "2025-11-24",
    tags: ["zahlen"],
    keywords: ["11.898.000 €", "12.310.000 €", "Haushaltssicherungskonzept", "Kreisumlage", "425 %", "1.200.000 €"],
    summary:
      "Entwurf der Haushaltssatzung 2026 mit ausführlichem Vorbericht und Haushaltssicherungskonzept 2026–2029: Fehlbetrag 412.000 €, Kreisumlage als Haupttreiber, zwölf Konsolidierungsmaßnahmen, Investitionen und Verschuldung – viel Material zum Zusammenfassen, Nachrechnen und für Folien.",
    meta: [
      ["Vorlage-Nr.", "GR/2025/087"],
      ["Aktenzeichen", "902.11-2026"],
      ["Status", "Entwurf zur Beschlussfassung am 15.12.2025"],
    ],
    subject: "Haushaltssatzung der Gemeinde Brackenhain für das Haushaltsjahr 2026 mit Vorbericht und Haushaltssicherungskonzept 2026–2029",
    blocks: [
      {
        t: "table",
        header: ["Beratungsfolge", "Sitzung", "Zuständigkeit"],
        rows: [
          ["Haupt- und Finanzausschuss", "27.11.2025", "Vorberatung"],
          ["Gemeinderat", "15.12.2025", "Entscheidung"],
        ],
        widths: [3, 2, 2],
      },
      { t: "h1", text: "Teil A – Haushaltssatzung" },
      {
        t: "p",
        text: "Aufgrund des § 112 der Kommunalverfassung (KV) hat der Gemeinderat der Gemeinde Brackenhain in seiner Sitzung am 15.12.2025 folgende Haushaltssatzung beschlossen:",
      },
      { t: "h3", text: "§ 1 Ergebnis- und Finanzhaushalt" },
      { t: "p", text: "Der Haushaltsplan für das Haushaltsjahr 2026 wird **1. im Ergebnishaushalt** mit dem jeweiligen Gesamtbetrag" },
      {
        t: "table",
        header: ["Gesamtbetrag", "Betrag"],
        rows: [
          ["der ordentlichen Erträge", "11.898.000 €"],
          ["der ordentlichen Aufwendungen", "12.310.000 €"],
          ["der außerordentlichen Erträge", "0 €"],
          ["der außerordentlichen Aufwendungen", "0 €"],
        ],
        widths: [5, 2],
      },
      { t: "p", text: "**2. im Finanzhaushalt** mit dem jeweiligen Gesamtbetrag" },
      {
        t: "table",
        header: ["Gesamtbetrag", "Betrag"],
        rows: [
          ["der Einzahlungen aus laufender Verwaltungstätigkeit", "11.590.000 €"],
          ["der Auszahlungen aus laufender Verwaltungstätigkeit", "11.508.000 €"],
          ["der Einzahlungen für Investitionstätigkeit", "1.326.000 €"],
          ["der Auszahlungen für Investitionstätigkeit", "2.840.000 €"],
          ["der Einzahlungen aus Finanzierungstätigkeit", "1.200.000 €"],
          ["der Auszahlungen aus Finanzierungstätigkeit", "365.000 €"],
        ],
        widths: [5, 2],
      },
      {
        t: "p",
        text: "festgesetzt. Nachrichtlich: Gesamtbetrag der Einzahlungen des Finanzhaushalts 14.116.000 €, Gesamtbetrag der Auszahlungen 14.713.000 €.",
      },
      { t: "h3", text: "§ 2 Kredite für Investitionen" },
      {
        t: "p",
        text: "Der Gesamtbetrag der Kredite, deren Aufnahme für Investitionen und Investitionsförderungsmaßnahmen erforderlich ist, wird auf **1.200.000 €** festgesetzt.",
      },
      { t: "h3", text: "§ 3 Verpflichtungsermächtigungen" },
      {
        t: "p",
        text: "Der Gesamtbetrag der Verpflichtungsermächtigungen, die zur Leistung von Auszahlungen für Investitionen und Investitionsförderungsmaßnahmen in künftigen Jahren erforderlich sind, wird auf 930.000 € festgesetzt. Davon entfallen 450.000 € auf das Haushaltsjahr 2027 (Erweiterung des Gemeindekindergartens) sowie 280.000 € auf das Haushaltsjahr 2027 und 200.000 € auf das Haushaltsjahr 2028 (Breitbandausbau, Eigenanteil der Gemeinde).",
      },
      { t: "h3", text: "§ 4 Liquiditätskredite" },
      {
        t: "p",
        text: "Der Höchstbetrag, bis zu dem im Haushaltsjahr 2026 Liquiditätskredite zur rechtzeitigen Leistung von Auszahlungen in Anspruch genommen werden dürfen, wird auf 1.500.000 € festgesetzt.",
      },
      { t: "h3", text: "§ 5 Steuersätze" },
      { t: "p", text: "Die Steuersätze (Hebesätze) für die Realsteuern werden für das Haushaltsjahr 2026 wie folgt festgesetzt:" },
      {
        t: "ul",
        items: [
          "Grundsteuer für die land- und forstwirtschaftlichen Betriebe (Grundsteuer A): 360 %",
          "Grundsteuer für die Grundstücke (Grundsteuer B): **425 %**",
          "Gewerbesteuer: **380 %**",
        ],
      },
      { t: "h3", text: "§ 6 Erheblichkeitsgrenzen" },
      {
        t: "ol",
        items: [
          "Ein Fehlbetrag gilt als erheblich im Sinne des § 115 Abs. 2 Nr. 1 KV, wenn er den im Ergebnishaushalt veranschlagten Fehlbetrag um mehr als 2 % der ordentlichen Aufwendungen übersteigt.",
          "Über- und außerplanmäßige Aufwendungen und Auszahlungen sind erheblich im Sinne des § 117 Abs. 1 KV, wenn sie im Einzelfall 25.000 € übersteigen. Sie bedürfen dann der vorherigen Zustimmung des Gemeinderats.",
          "Investitionen, deren Auszahlungen im Einzelfall 50.000 € übersteigen, werden im Haushaltsplan einzeln dargestellt.",
        ],
      },
      { t: "h3", text: "§ 7 Haushaltssicherungskonzept" },
      {
        t: "p",
        text: "Der Gemeinderat beschließt das als Teil C beigefügte Haushaltssicherungskonzept 2026–2029. Es wird der Kommunalaufsichtsbehörde mit der Haushaltssatzung vorgelegt. Ziel ist der Ausgleich des Ergebnishaushalts spätestens im Haushaltsjahr 2029.",
      },
      { t: "signature", lines: ["Brackenhain, den 15.12.2025", "Frank Ruhnau", "Bürgermeister"] },
      {
        t: "note",
        text: "**Bekanntmachungsvermerk (wird nach Genehmigung ergänzt):** Die nach § 114 Abs. 2 KV erforderliche Genehmigung des Gesamtbetrags der Kredite (§ 2) und des Haushaltssicherungskonzepts (§ 7) hat der Landkreis Altmoorland als Kommunalaufsichtsbehörde am ____________ unter dem Aktenzeichen ____________ erteilt. Der Haushaltsplan liegt vom ____________ bis ____________ im Rathaus, Lindenstraße 2, Zimmer 12, zur Einsichtnahme aus.",
      },
      { t: "pagebreak" },
      { t: "h1", text: "Teil B – Vorbericht zum Haushaltsplan 2026" },
      { t: "h2", text: "1. Allgemeine Angaben" },
      {
        t: "p",
        text: "Die Gemeinde Brackenhain ist eine kreisangehörige Gemeinde im Landkreis Altmoorland mit den Ortsteilen Brackenhain, Heidhof und Kleinbracken. Sie hatte am 31.12.2024 **6.840 Einwohnerinnen und Einwohner** und eine Fläche von 48,6 km². Die Einwohnerzahl ist seit 2020 leicht gestiegen, getragen vor allem vom Zuzug junger Familien in das Baugebiet „Am Mühlenfeld“.",
      },
      {
        t: "table",
        header: ["Stichtag", "Brackenhain", "Heidhof", "Kleinbracken", "Gesamt"],
        rows: [
          ["31.12.2020", "4.488", "1.402", "822", "6.712"],
          ["31.12.2022", "4.571", "1.411", "819", "6.801"],
          ["31.12.2024", "4.620", "1.410", "810", "6.840"],
        ],
      },
      {
        t: "p",
        text: "Die Gemeinde unterhält unter anderem die Grundschule Brackenhain (214 Schülerinnen und Schüler in zehn Klassen), den Gemeindekindergarten „Lindenhof“ (vier Gruppen, 82 Plätze), das Dorfgemeinschaftshaus Lindenweg, die Gemeindebücherei, den Sportplatz Am Mühlenbach, zwei Friedhöfe, die Feuerwehrgerätehäuser in Brackenhain und Heidhof, 64 km Gemeindestraßen und 112 km Wirtschaftswege.",
      },
      {
        t: "p",
        text: "Der Stellenplan 2026 weist 63,2 Stellen aus (2025: 62,7), davon 25,5 in der Kernverwaltung, 16,4 im Gemeindekindergarten, 9,0 im Bauhof und 12,3 für Hausmeister-, Reinigungs- und sonstige Dienste. Die IT-Arbeitsplätze der Verwaltung betreut der Zweckverband Kommunale IT Altmoor; die Gemeinde trägt dafür eine Umlage nach Arbeitsplätzen (2026: 186.000 € auf Grundlage der vom Zweckverband gemeldeten 64 Arbeitsplätze).",
      },
      { t: "h2", text: "2. Rahmenbedingungen der Haushaltsplanung" },
      {
        t: "ul",
        items: [
          "**Steuerschätzung:** Grundlage für die Gemeindeanteile an der Einkommen- und der Umsatzsteuer sind die Orientierungsdaten des Landes vom Oktober 2025. Der Gemeindeanteil an der Einkommensteuer steigt danach gegenüber dem Ansatz 2025 um 5,2 %.",
          "**Kreisumlage:** Der Landkreis Altmoorland hat den Umlagesatz für 2026 von 33,0 % auf 34,5 % angehoben. Bei gestiegenen Umlagegrundlagen von 10.420.000 € (2025: 9.918.000 €) ergibt sich eine Kreisumlage von 3.595.000 € – 322.000 € mehr als 2025. Davon gehen rund 156.000 € auf die Anhebung des Umlagesatzes und rund 166.000 € auf die höheren Umlagegrundlagen zurück.",
          "**Tarifentwicklung:** Für die Tarifbeschäftigten sind die Erhöhungen nach dem Tarifabschluss zum TVöD (3,0 % ab April 2025, 2,8 % ab Mai 2026) berücksichtigt; für Beamtinnen und Beamte wird eine Anpassung von 2,5 % angenommen.",
          "**Zinsen:** Für neue Investitionskredite wird mit einem Zinssatz von 3,4 % kalkuliert.",
          "**Energie:** Die Strom- und Gaspreise sind gegenüber 2024 gesunken; die Ansätze für die Bewirtschaftung der Gebäude liegen 6 % unter dem Vorjahr.",
        ],
      },
      { t: "h2", text: "3. Ergebnishaushalt" },
      {
        t: "p",
        text: "Der Ergebnishaushalt 2026 schließt mit ordentlichen Erträgen von **11.898.000 €** und ordentlichen Aufwendungen von **12.310.000 €** ab. Es ergibt sich ein **Fehlbetrag von 412.000 €**. Der Haushalt ist damit nicht ausgeglichen (§ 110 Abs. 3 KV). Gegenüber dem Ansatz 2025 (Fehlbetrag 250.000 €) verschlechtert sich das ordentliche Ergebnis um 162.000 €.",
      },
      { t: "h3", text: "3.1 Erträge nach Arten (Beträge in €)" },
      {
        t: "table",
        header: ["Ertragsart", "Ergebnis 2024", "Ansatz 2025", "Ansatz 2026", "Veränderung"],
        rows: [
          ["Steuern und ähnliche Abgaben", "7.180.400", "7.395.000", "7.694.000", "+299.000"],
          ["Zuwendungen und allgemeine Umlagen", "2.865.300", "2.940.000", "3.020.000", "+80.000"],
          ["Erträge aus der Auflösung von Sonderposten", "271.800", "279.000", "286.000", "+7.000"],
          ["Öffentlich-rechtliche Leistungsentgelte", "402.100", "418.000", "455.000", "+37.000"],
          ["Privatrechtliche Leistungsentgelte", "104.700", "109.000", "118.000", "+9.000"],
          ["Kostenerstattungen und Kostenumlagen", "151.200", "158.000", "164.000", "+6.000"],
          ["Zinsen und ähnliche Finanzerträge", "26.900", "24.000", "21.000", "−3.000"],
          ["Sonstige ordentliche Erträge", "147.600", "217.000", "140.000", "−77.000"],
          ["Summe ordentliche Erträge", "11.150.000", "11.540.000", "11.898.000", "+358.000"],
        ],
        widths: [4, 2, 2, 2, 2],
      },
      {
        t: "p",
        text: "**Steuern:** Die Mehrerträge von 299.000 € beruhen auf der Anhebung der Hebesätze (Grundsteuer B von 410 % auf 425 %, Gewerbesteuer von 370 % auf 380 %, zusammen rund 111.000 €) und auf dem höheren Gemeindeanteil an der Einkommensteuer (+170.000 €). Die Messbeträge sind unverändert angesetzt.",
      },
      {
        t: "table",
        header: ["Steuerart", "Ansatz 2025", "Ansatz 2026", "Hebesatz 2025", "Hebesatz 2026"],
        rows: [
          ["Grundsteuer A", "96.000", "98.000", "360 %", "360 %"],
          ["Grundsteuer B", "1.111.000", "1.152.000", "410 %", "425 %"],
          ["Gewerbesteuer", "2.580.000", "2.650.000", "370 %", "380 %"],
          ["Gemeindeanteil an der Einkommensteuer", "3.250.000", "3.420.000", "–", "–"],
          ["Gemeindeanteil an der Umsatzsteuer", "302.000", "312.000", "–", "–"],
          ["Hundesteuer", "48.000", "54.000", "–", "–"],
          ["Vergnügungssteuer", "8.000", "8.000", "–", "–"],
          ["Summe", "7.395.000", "7.694.000", "", ""],
        ],
        widths: [4, 2, 2, 2, 2],
      },
      {
        t: "ul",
        items: [
          "**Gewerbesteuer:** Das Aufkommen ist stark konzentriert; die fünf größten Steuerpflichtigen erbringen rund 58 % des Aufkommens. Für 2025 wird statt des Ansatzes von 2.580.000 € nur noch ein Ergebnis von rund 2.430.000 € erwartet (siehe Nr. 8).",
          "**Zuwendungen und allgemeine Umlagen** (3.020.000 €): Schlüsselzuweisungen 1.742.000 €, Zuweisungen des Landes und des Landkreises für die Kindertagesbetreuung 1.168.000 €, sonstige Zuweisungen 110.000 €.",
          "**Öffentlich-rechtliche Leistungsentgelte** (455.000 €): Elternbeiträge Gemeindekindergarten 231.000 €, Friedhofsgebühren 96.000 € (nach Neukalkulation; 2025: 78.000 €), Verwaltungs- und Benutzungsgebühren 128.000 €.",
          "**Privatrechtliche Leistungsentgelte** (118.000 €): Mieten und Pachten, darunter Entgelte für das Dorfgemeinschaftshaus nach der neuen Benutzungs- und Entgeltordnung (31.000 €; 2025: 22.000 €).",
          "**Sonstige ordentliche Erträge** (140.000 €): vor allem Konzessionsabgaben für Strom und Gas (112.000 €). Der Rückgang um 77.000 € erklärt sich durch eine einmalige Versicherungserstattung im Jahr 2025 (Sturmschaden am Feuerwehrgerätehaus Heidhof, 68.000 €).",
        ],
      },
      { t: "h3", text: "3.2 Aufwendungen nach Arten (Beträge in €)" },
      {
        t: "table",
        header: ["Aufwandsart", "Ergebnis 2024", "Ansatz 2025", "Ansatz 2026", "Veränderung"],
        rows: [
          ["Personalaufwendungen", "3.702.600", "3.960.000", "4.120.000", "+160.000"],
          ["Versorgungsaufwendungen", "196.400", "204.000", "210.000", "+6.000"],
          ["Aufwendungen für Sach- und Dienstleistungen", "1.588.900", "1.680.000", "1.640.000", "−40.000"],
          ["Abschreibungen", "731.500", "752.000", "780.000", "+28.000"],
          ["Zinsen und ähnliche Aufwendungen", "82.300", "88.000", "96.000", "+8.000"],
          ["Transferaufwendungen", "4.300.700", "4.342.500", "4.705.000", "+362.500"],
          ["Sonstige ordentliche Aufwendungen", "721.600", "763.500", "759.000", "−4.500"],
          ["Summe ordentliche Aufwendungen", "11.324.000", "11.790.000", "12.310.000", "+520.000"],
          ["Ordentliches Ergebnis", "−174.000", "−250.000", "−412.000", "−162.000"],
        ],
        widths: [4, 2, 2, 2, 2],
      },
      {
        t: "ul",
        items: [
          "**Personalaufwendungen** (+160.000 €, +4,0 %): Tarifsteigerungen, Stufenaufstiege und eine zusätzliche halbe Stelle Erzieherin im Gemeindekindergarten. Die halbe Stelle im Hauptamt, die durch einen Altersabgang zum 30.06.2026 frei wird, erhält einen kw-Vermerk und wird nicht wieder besetzt (Maßnahme 7 des Haushaltssicherungskonzepts).",
          "**Sach- und Dienstleistungen** (−40.000 €): Gebäudeunterhaltung 410.000 €, Unterhaltung von Straßen und Wegen einschließlich Winterdienst 285.000 €, Bewirtschaftung (Energie, Wasser, Reinigung) 392.000 €, Fahrzeuge und Geräte 156.000 €, Lernmittel und Schulbedarf 58.000 €, sonstige Sach- und Dienstleistungen 339.000 €.",
          "**Abschreibungen** (+28.000 €): Zugänge des Jahres 2025, vor allem der erste Bauabschnitt der LED-Straßenbeleuchtung und der Spielplatz Kleinbracken.",
          "**Zinsen** (+8.000 €): Neuaufnahme von Investitionskrediten 2025 und 2026.",
          "**Transferaufwendungen** (+362.500 €): Einzelheiten zeigt die folgende Übersicht.",
        ],
      },
      {
        t: "table",
        header: ["Transferaufwand", "Ansatz 2025", "Ansatz 2026", "Veränderung"],
        rows: [
          ["Kreisumlage (2026: 34,5 % von 10.420.000 €)", "3.273.000", "3.595.000", "+322.000"],
          ["Gewerbesteuerumlage", "244.000", "244.000", "0"],
          ["Kindertagespflege und Gastkinder in anderen Einrichtungen", "530.000", "562.000", "+32.000"],
          ["Umlage Zweckverband Kommunale IT Altmoor", "176.000", "186.000", "+10.000"],
          ["Vereinsförderung", "45.500", "41.000", "−4.500"],
          ["Sonstige Zuschüsse und Umlagen", "74.000", "77.000", "+3.000"],
          ["Summe", "4.342.500", "4.705.000", "+362.500"],
        ],
        widths: [5, 2, 2, 2],
      },
      {
        t: "p",
        text: "Die Kreisumlage ist mit einem Anteil von 29,2 % an den ordentlichen Aufwendungen die mit Abstand größte Einzelposition. Allein ihr Anstieg erklärt mehr als drei Viertel des Fehlbetrags. Die Gewerbesteuerumlage bleibt trotz des höheren Hebesatzes gleich, weil sie sich nach dem Messbetrag und nicht nach dem Hebesatz richtet.",
      },
      { t: "h3", text: "3.3 Teilhaushalte 2026 (Beträge in €)" },
      {
        t: "table",
        header: ["Teilhaushalt", "Erträge", "Aufwendungen", "Saldo"],
        rows: [
          ["1 Zentrale Verwaltung", "152.000", "2.168.000", "−2.016.000"],
          ["2 Schule, Kultur, Bücherei", "64.000", "806.000", "−742.000"],
          ["3 Kinder, Jugend, Soziales", "1.458.000", "2.912.000", "−1.454.000"],
          ["4 Sport, Freizeit, Dorfgemeinschaftshaus", "86.000", "326.000", "−240.000"],
          ["5 Bauen, Straßen, Bauhof, Friedhöfe", "498.000", "1.592.000", "−1.094.000"],
          ["6 Ordnung, Brandschutz", "71.000", "559.000", "−488.000"],
          ["7 Allgemeine Finanzwirtschaft", "9.569.000", "3.947.000", "+5.622.000"],
          ["Summe", "11.898.000", "12.310.000", "−412.000"],
        ],
        widths: [4, 2, 2, 2],
      },
      { t: "h3", text: "3.4 Freiwillige Leistungen" },
      {
        t: "p",
        text: "Die freiwilligen Leistungen umfassen 2026 insgesamt 382.000 € und damit 3,1 % der ordentlichen Aufwendungen. Sie sind bereits in den vergangenen Jahren deutlich zurückgeführt worden und prägen zugleich das Gemeindeleben.",
      },
      {
        t: "table",
        header: ["Freiwillige Leistung", "Ansatz 2026"],
        rows: [
          ["Gemeindebücherei (zugleich Schulbücherei)", "96.000 €"],
          ["Jugendpflege und Jugendtreff", "118.000 €"],
          ["Dorfgemeinschaftshaus (Zuschussbedarf)", "64.000 €"],
          ["Vereinsförderung", "41.000 €"],
          ["Dorffest und Kulturveranstaltungen", "22.000 €"],
          ["Seniorenarbeit", "18.000 €"],
          ["Sonstige (Ehrungen, Zuschuss Heimatverein)", "23.000 €"],
          ["Summe", "382.000 €"],
        ],
        widths: [5, 2],
      },
      { t: "h2", text: "4. Finanzhaushalt und Investitionen" },
      {
        t: "table",
        header: ["Finanzhaushalt 2026", "Betrag in €"],
        rows: [
          ["Einzahlungen aus laufender Verwaltungstätigkeit", "11.590.000"],
          ["Auszahlungen aus laufender Verwaltungstätigkeit", "11.508.000"],
          ["Saldo aus laufender Verwaltungstätigkeit", "82.000"],
          ["Einzahlungen für Investitionstätigkeit", "1.326.000"],
          ["Auszahlungen für Investitionstätigkeit", "2.840.000"],
          ["Saldo aus Investitionstätigkeit", "−1.514.000"],
          ["Finanzmittelfehlbetrag", "−1.432.000"],
          ["Einzahlungen aus Finanzierungstätigkeit (Kreditaufnahme)", "1.200.000"],
          ["Auszahlungen aus Finanzierungstätigkeit (Tilgung)", "365.000"],
          ["Saldo aus Finanzierungstätigkeit", "835.000"],
          ["Änderung des Finanzmittelbestands", "−597.000"],
        ],
        widths: [5, 2],
      },
      {
        t: "p",
        text: "Der Saldo aus laufender Verwaltungstätigkeit (82.000 €) reicht nicht aus, um die ordentliche Tilgung von 365.000 € zu decken. Die Differenz von 283.000 € muss aus dem Bestand an liquiden Mitteln finanziert werden; dieser sinkt voraussichtlich von 1.140.000 € (01.01.2026) auf 543.000 € (31.12.2026). In Zeiten hoher Auszahlungen (Kreisumlage-Raten, Baufortschritt Kindergarten) wird die Gemeinde auf Liquiditätskredite zurückgreifen müssen.",
      },
      {
        t: "table",
        header: ["Investitionsmaßnahme", "Auszahlungen 2026", "Einzahlungen 2026", "Folgejahre (VE)"],
        rows: [
          ["Erweiterung Gemeindekindergarten „Lindenhof“ um eine Krippengruppe (gesperrt bis zum Baubeschluss)", "1.380.000", "690.000", "450.000 (2027)"],
          ["Ersatzbeschaffung HLF 10 für die Ortswehr Heidhof", "520.000", "120.000", "–"],
          ["Wirtschaftsweg Heidhof–Kleinbracken (Moorweg, 2. Bauabschnitt)", "260.000", "–", "–"],
          ["Breitbandausbau, Eigenanteil der Gemeinde (10 %)", "310.000", "–", "480.000 (2027/2028)"],
          ["Schallschutzmaßnahmen Dorfgemeinschaftshaus Lindenweg", "95.000", "–", "–"],
          ["Kommunaltraktor mit Winterdienstausstattung (Bauhof)", "145.000", "–", "–"],
          ["Sonstige (IT-Ausstattung, Torumbau Gerätehaus Heidhof, Spielgeräte)", "130.000", "–", "–"],
          ["Investitionspauschale des Landes", "–", "236.000", "–"],
          ["Grundstückserlöse Baugebiet „Am Mühlenfeld“", "–", "280.000", "–"],
          ["Summe", "2.840.000", "1.326.000", "930.000"],
        ],
        widths: [5, 2, 2, 2],
      },
      {
        t: "p",
        text: "Die Erweiterung des Gemeindekindergartens wird aus dem Landesprogramm „Kita-Ausbau 2026“ mit 50 % der förderfähigen Kosten gefördert (Gesamtkosten 2.150.000 €, Zuwendung 1.075.000 €, davon 690.000 € in 2026 und 385.000 € in 2027). Der Förderbescheid liegt seit dem 04.11.2025 vor. Der Baubeschluss des Gemeinderats ist wegen der Haushaltssicherung noch offen; die Mittel erhalten deshalb einen Sperrvermerk und werden erst nach dem Baubeschluss freigegeben. Für das HLF 10 hat der Landkreis eine Zuwendung von 120.000 € in Aussicht gestellt; das Fahrzeug ersetzt das 1993 beschaffte LF 8/6 und setzt den Feuerwehrbedarfsplan 2025–2030 um.",
      },
      { t: "h2", text: "5. Verschuldung und Liquidität" },
      {
        t: "table",
        header: ["Schuldenstand", "31.12.2024", "31.12.2025 (vorauss.)", "31.12.2026 (Plan)"],
        rows: [
          ["Investitionskredite", "4.912.000 €", "4.860.000 €", "5.695.000 €"],
          ["je Einwohnerin und Einwohner", "718 €", "711 €", "833 €"],
          ["Liquiditätskredite", "0 €", "0 €", "Höchstbetrag 1.500.000 €"],
        ],
        widths: [4, 2, 2, 3],
      },
      {
        t: "p",
        text: "Der Schuldendienst (Zinsen und Tilgung) steigt 2026 auf 461.000 € (2025: 440.000 €). Die Pro-Kopf-Verschuldung liegt damit über dem Durchschnitt der kreisangehörigen Gemeinden vergleichbarer Größe im Land (742 €). Die Kreditaufnahme von 1.200.000 € ist ausschließlich für Investitionen vorgesehen und bedarf der Genehmigung der Kommunalaufsicht.",
      },
      { t: "h2", text: "6. Rücklagen und Eigenkapital" },
      {
        t: "p",
        text: "Die Rücklage aus Überschüssen des ordentlichen Ergebnisses betrug am 31.12.2023 642.000 €. Nach dem vorläufigen Jahresergebnis 2024 (−174.000 €) und dem für 2025 erwarteten Fehlbetrag von 286.000 € verbleiben voraussichtlich 182.000 €. Der Fehlbetrag 2026 von 412.000 € kann damit nur zum Teil gedeckt werden; 230.000 € bleiben ungedeckt und sind nach § 110 Abs. 6 KV vorzutragen. Deshalb ist nach § 110 Abs. 8 KV ein Haushaltssicherungskonzept aufzustellen (Teil C).",
      },
      {
        t: "p",
        text: "Der erwartete Fehlbetrag 2025 liegt um 36.000 € über dem Ansatz: Mindererträge bei der Gewerbesteuer (−150.000 €) stehen Mehrerträge beim Gemeindeanteil an der Einkommensteuer (+64.000 €) und Minderaufwendungen beim Personal durch unbesetzte Stellen (+50.000 €) gegenüber. Das Basisreinvermögen beträgt rund 38,4 Mio. €; eine bilanzielle Überschuldung droht nicht.",
      },
      { t: "h2", text: "7. Mittelfristige Ergebnis- und Finanzplanung" },
      {
        t: "table",
        header: ["in €", "2025 (Ansatz)", "2026", "2027", "2028", "2029"],
        rows: [
          ["Ordentliche Erträge", "11.540.000", "11.898.000", "12.140.000", "12.430.000", "12.760.000"],
          ["Ordentliche Aufwendungen", "11.790.000", "12.310.000", "12.495.000", "12.640.000", "12.702.000"],
          ["Ordentliches Ergebnis", "−250.000", "−412.000", "−355.000", "−210.000", "+58.000"],
          ["Auszahlungen für Investitionen", "1.910.000", "2.840.000", "1.640.000", "1.120.000", "780.000"],
          ["Kreditaufnahmen", "300.000", "1.200.000", "600.000", "400.000", "0"],
          ["Tilgung", "352.000", "365.000", "380.000", "395.000", "410.000"],
          ["Schuldenstand 31.12.", "4.860.000", "5.695.000", "5.915.000", "5.920.000", "5.510.000"],
        ],
        widths: [4, 2, 2, 2, 2, 2],
      },
      {
        t: "p",
        text: "Die Planung enthält bereits die Konsolidierungsmaßnahmen des Haushaltssicherungskonzepts. Ohne diese Maßnahmen läge der Fehlbetrag 2026 bei 634.000 € und auch 2029 noch bei 222.000 €. Die Planung unterstellt, dass die Kreisumlage ab 2027 bei 34,5 % bleibt.",
      },
      { t: "h2", text: "8. Risiken" },
      {
        t: "ul",
        items: [
          "**Gewerbesteuer:** Ein größerer Gewerbebetrieb hat gegen die Gewerbesteuermessbescheide 2021 bis 2023 Einspruch beim Finanzamt eingelegt. Bei einem Erfolg drohen Erstattungen im mittleren sechsstelligen Bereich zuzüglich Erstattungszinsen. Das Risiko ist nicht veranschlagt, weil Höhe und Zeitpunkt nicht absehbar sind. Aus Gründen des Steuergeheimnisses (§ 30 AO) wird der Betrieb nicht benannt.",
          "**Kreisumlage:** Der Landkreis hat für 2027 eine weitere Anhebung nicht ausgeschlossen. Jeder Prozentpunkt kostet die Gemeinde rund 104.000 €.",
          "**Baukosten:** Die Kostenberechnung für die Kindergartenerweiterung beruht auf dem Preisstand des 2. Quartals 2025. Mehrkosten sind nicht förderfähig, solange der Förderbescheid nicht angepasst wird.",
          "**Personal:** Fachkraftstellen im Gemeindekindergarten lassen sich nur schwer besetzen. Unbesetzte Stellen entlasten zwar rechnerisch den Haushalt, gefährden aber den Betrieb und die Landeszuweisungen.",
          "**Zinsen:** Ein Anstieg des Zinsniveaus um einen Prozentpunkt verteuert die geplanten Neuaufnahmen 2026 bis 2028 um jährlich rund 22.000 €.",
        ],
      },
      { t: "h2", text: "9. Kennzahlen" },
      {
        t: "table",
        header: ["Kennzahl", "2024", "2025", "2026"],
        rows: [
          ["Aufwandsdeckungsgrad (Erträge / Aufwendungen)", "98,5 %", "97,9 %", "96,7 %"],
          ["Steuerquote (Steuern / ordentliche Erträge)", "64,4 %", "64,1 %", "64,7 %"],
          ["Personalintensität (Personal / ordentliche Aufwendungen)", "32,7 %", "33,6 %", "33,5 %"],
          ["Transferaufwandsquote", "38,0 %", "36,8 %", "38,2 %"],
          ["Zinslastquote", "0,7 %", "0,7 %", "0,8 %"],
          ["Kreisumlage je Einwohner", "454 €", "479 €", "526 €"],
        ],
        widths: [5, 2, 2, 2],
      },
      { t: "pagebreak" },
      { t: "h1", text: "Teil C – Haushaltssicherungskonzept 2026–2029" },
      { t: "h2", text: "1. Erfordernis" },
      {
        t: "p",
        text: "Nach § 110 Abs. 8 KV hat die Gemeinde ein Haushaltssicherungskonzept aufzustellen, wenn der Ausgleich des Ergebnishaushalts trotz Ausnutzung aller Ertragsmöglichkeiten und Ausschöpfung aller Sparmöglichkeiten nicht erreicht werden kann. Das ist für 2026 der Fall: Der Fehlbetrag von 412.000 € übersteigt die verbliebene Überschussrücklage von voraussichtlich 182.000 € um 230.000 €. Zugleich kann die ordentliche Tilgung nicht aus dem Saldo der laufenden Verwaltungstätigkeit gedeckt werden.",
      },
      {
        t: "p",
        text: "Das Haushaltssicherungskonzept bedarf der Genehmigung der Kommunalaufsichtsbehörde (Landkreis Altmoorland). Bis zur Genehmigung der Haushaltssatzung gelten die Regeln der vorläufigen Haushaltsführung (§ 116 KV): Die Gemeinde darf nur Aufwendungen leisten, zu denen sie rechtlich verpflichtet ist oder die für die Weiterführung notwendiger Aufgaben unaufschiebbar sind; neue freiwillige Leistungen dürfen nicht begonnen werden.",
      },
      { t: "h2", text: "2. Ursachen des Defizits" },
      { t: "p", text: "Der Fehlbetrag ist überwiegend strukturell bedingt und nicht auf einmalige Effekte zurückzuführen:" },
      {
        t: "ol",
        items: [
          "**Kreisumlage:** Von 2023 (2.983.000 €) bis 2026 (3.595.000 €) ist die Kreisumlage um 612.000 € gestiegen. Auf Umlagesatz und Umlagegrundlagen hat die Gemeinde keinen Einfluss.",
          "**Kindertagesbetreuung:** Der Zuschussbedarf des Teilhaushalts Kinder, Jugend, Soziales ist seit 2021 von 1.012.000 € auf 1.454.000 € gestiegen (+44 %). Ursachen sind höhere Personalkosten, längere Betreuungszeiten und mehr Gastkinder in Einrichtungen anderer Träger.",
          "**Investitionsbedarf:** Abschreibungen und Zinsen für unaufschiebbare Investitionen (Kindergarten, Feuerwehr, Wirtschaftswege) belasten den Ergebnishaushalt bis 2029 zusätzlich mit rund 140.000 € jährlich.",
          "**Gewerbesteuer:** Das Aufkommen schwankt stark und hängt von wenigen Betrieben ab.",
          "**Ertragsschwäche:** Die Steuerkraft je Einwohner liegt rund 9 % unter dem Durchschnitt vergleichbarer Gemeinden im Land.",
        ],
      },
      { t: "h2", text: "3. Konsolidierungsziel" },
      {
        t: "p",
        text: "Ziel ist der Haushaltsausgleich im Jahr 2029. Dazu sind Konsolidierungsbeiträge von 222.000 € (2026) bis 280.000 € (2029) erforderlich. Die Maßnahmen sind in die mittelfristige Ergebnisplanung eingerechnet.",
      },
      {
        t: "table",
        header: ["in €", "2026", "2027", "2028", "2029"],
        rows: [
          ["Ergebnis ohne Maßnahmen", "−634.000", "−622.000", "−486.000", "−222.000"],
          ["Konsolidierungsbeitrag", "+222.000", "+267.000", "+276.000", "+280.000"],
          ["Ergebnis mit Maßnahmen", "−412.000", "−355.000", "−210.000", "+58.000"],
        ],
        widths: [4, 2, 2, 2, 2],
      },
      { t: "h2", text: "4. Maßnahmen (Konsolidierungsbeiträge in €)" },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Bereich", "2026", "2027", "2028", "2029"],
        rows: [
          ["1", "Anhebung Hebesatz Grundsteuer B von 410 % auf 425 %", "Kämmerei", "41.000", "42.000", "43.000", "44.000"],
          ["2", "Anhebung Hebesatz Gewerbesteuer von 370 % auf 380 %", "Kämmerei", "70.000", "71.000", "73.000", "75.000"],
          ["3", "Anhebung Hundesteuer (erster Hund von 60 € auf 72 €)", "Kämmerei", "6.000", "6.000", "6.000", "6.000"],
          ["4", "Neue Benutzungs- und Entgeltordnung Dorfgemeinschaftshaus", "Hauptamt", "9.000", "9.000", "9.000", "9.000"],
          ["5", "Neukalkulation der Friedhofsgebühren (2026–2028)", "Kämmerei", "18.000", "18.000", "18.000", "18.000"],
          ["6", "Anpassung der Elternbeiträge Krippe ab 01.08.2026", "Hauptamt", "8.000", "20.000", "20.000", "20.000"],
          ["7", "Wegfall einer halben Stelle im Hauptamt (kw-Vermerk)", "Hauptamt", "28.000", "29.000", "30.000", "31.000"],
          ["8", "LED-Umrüstung Straßenbeleuchtung, 2. Bauabschnitt", "Bauamt", "22.000", "35.000", "35.000", "35.000"],
          ["9", "Kürzung der Vereinsförderung um 10 %", "Hauptamt", "4.500", "4.500", "4.500", "4.500"],
          ["10", "Gemeinsame Kehrmaschine mit der Gemeinde Torfkamp", "Bauhof", "0", "12.000", "12.000", "12.000"],
          ["11", "Energiemanagement in gemeindlichen Gebäuden", "Bauamt", "10.000", "15.000", "20.000", "20.000"],
          ["12", "Neuausschreibung der Versicherungsverträge", "Kämmerei", "5.500", "5.500", "5.500", "5.500"],
          ["", "Summe", "", "222.000", "267.000", "276.000", "280.000"],
        ],
        widths: [1, 6, 2, 2, 2, 2, 2],
      },
      { t: "h2", text: "5. Erläuterungen zu einzelnen Maßnahmen" },
      {
        t: "p",
        text: "**Maßnahmen 1 und 2 (Hebesätze):** Die Hebesätze wurden zuletzt 2019 angepasst. Mit 425 % liegt die Grundsteuer B weiterhin unter dem Durchschnitt der Gemeinden im Landkreis (438 %). Für ein Einfamilienhaus mit einem Grundsteuermessbetrag von 120 € steigt die Grundsteuer um 18 € im Jahr. Bei der Gewerbesteuer bleibt die Gemeinde unter dem Kreisdurchschnitt von 392 %.",
      },
      {
        t: "p",
        text: "**Maßnahme 4 (Dorfgemeinschaftshaus):** Die neue Benutzungs- und Entgeltordnung reagiert zugleich auf die Lärmbeschwerden aus der Nachbarschaft (Musik nur bis 22:00 Uhr, Kaution 300 €). Das Entgelt für private Feiern im großen Saal steigt von 220 € auf 290 € je Tag; neu ist eine Reinigungspauschale von 80 €. Örtliche Vereine nutzen das Haus für ihre Vereinsarbeit weiterhin entgeltfrei.",
      },
      {
        t: "p",
        text: "**Maßnahme 5 (Friedhofsgebühren):** Grundlage ist die Gebührenkalkulation der Kämmerei vom Juni 2025 für den Kalkulationszeitraum 2026 bis 2028. Der Kostendeckungsgrad steigt von bisher 69 % auf rund 85 %. Eine volle Kostendeckung wird wegen des Grünflächenanteils und der Bedeutung der Friedhöfe als öffentliche Grünanlage nicht angestrebt.",
      },
      {
        t: "p",
        text: "**Maßnahme 7 (Stelle Hauptamt):** Die Aufgaben der ausscheidenden Kollegin (Gewerbeangelegenheiten, Fundbüro) werden auf das Ordnungsamt und das Bürgerbüro verteilt. Die Sprechzeit des Bürgerbüros am Mittwochnachmittag entfällt.",
      },
      {
        t: "p",
        text: "**Maßnahme 9 (Vereinsförderung):** Die Grundförderung je Mitglied unter 18 Jahren sinkt von 6,50 € auf 5,85 €; der Zuschuss zu den Übungsleiterpauschalen bleibt unverändert. Investitionszuschüsse an Vereine werden erst nach Genehmigung des Haushalts und nur im Rahmen verfügbarer Mittel gewährt.",
      },
      {
        t: "p",
        text: "**Maßnahme 10 (Kehrmaschine):** Die eigene Kehrmaschine (Baujahr 2009) wird nicht ersetzt. Ab 2027 nutzt der Bauhof gemeinsam mit der Gemeinde Torfkamp eine Maschine; die Kosten werden nach Einsatzstunden geteilt. Eine Vereinbarung nach dem Gesetz über kommunale Zusammenarbeit wird vorbereitet.",
      },
      { t: "h2", text: "6. Geprüfte, aber nicht vorgeschlagene Maßnahmen" },
      {
        t: "ul",
        items: [
          "**Schließung der Gemeindebücherei** (Einsparung rund 70.000 € jährlich): nicht vorgeschlagen, weil die Bücherei zugleich Schulbücherei der Grundschule ist.",
          "**Aufgabe des Friedhofs Heidhof:** wegen laufender Nutzungsrechte frühestens 2051 möglich; die Einsparung wäre gering.",
          "**Anhebung der Grundsteuer B auf 480 %:** würde den Fehlbetrag rechnerisch um 149.000 € verringern, belastet aber Eigentümer sowie Mieterinnen und Mieter erheblich und ist im Gemeinderat nicht mehrheitsfähig.",
          "**Verkauf des Dorfgemeinschaftshauses:** nicht vorgeschlagen; das Haus ist der einzige größere Versammlungsraum der Gemeinde und wird von 14 Vereinen genutzt.",
          "**Einstellung der Jugendpflege:** nicht vorgeschlagen; die halbe Stelle Jugendpflege wird bis 2027 zu 50 % vom Landkreis gefördert.",
        ],
      },
      { t: "h2", text: "7. Umsetzung und Berichtspflichten" },
      {
        t: "ul",
        items: [
          "Die Kämmerei berichtet dem Haupt- und Finanzausschuss halbjährlich (zum 30.06. und 31.12.) über den Umsetzungsstand jeder Maßnahme.",
          "Weicht ein Konsolidierungsbeitrag um mehr als 10 % ab, schlägt die Verwaltung Ersatzmaßnahmen vor.",
          "Neue freiwillige Leistungen werden nur beschlossen, wenn sie gegenfinanziert sind.",
          "Die Kommunalaufsicht erhält die Berichte nachrichtlich. Das Konzept wird mit dem Haushalt 2027 fortgeschrieben.",
        ],
      },
      { t: "signature", lines: ["Brackenhain, 24.11.2025", "Im Auftrag", "Petra Schnoor", "Kämmerin"] },
    ],
  },
  {
    type: "excel",
    id: "bh-ergebnisplan-2026-uebersicht",
    title: "Ergebnisplan 2026 – Übersicht mit Vorjahresvergleich und Teilhaushalten",
    kind: "Haushaltsübersicht",
    fileName: "Ergebnisplan 2026 Uebersicht mit Vorjahresvergleich",
    org: "brackenhain",
    unit: "bh-kasse",
    author: "bh-schnoor",
    date: "2025-11-12",
    tags: ["zahlen"],
    keywords: ["Ordentliches Ergebnis", "Transferaufwendungen", "Allgemeine Finanzwirtschaft", "Umlagegrundlagen", "Abweichung zum Ergebnisplan"],
    summary:
      "Gesamtergebnisplan nach Ertrags- und Aufwandsarten (Ergebnis 2024, Ansätze 2025/2026, Planung bis 2029) mit Teilhaushalten und Entwicklung der Kreisumlage – alles mit Formeln. Eignet sich zum Nachrechnen, für Diagramme und zum Abgleich mit der Haushaltssatzung.",
    sheets: [
      {
        name: "Ergebnisplan",
        title: "Gesamtergebnisplan 2026 nach Ertrags- und Aufwandsarten",
        subtitle: "Gemeinde Brackenhain · Beträge in Euro · Entwurf Stand 12.11.2025 (Grundlage der Haushaltssatzung 2026)",
        columns: [
          { header: "Nr.", width: 5 },
          { header: "Ertrags- und Aufwandsart", width: 42 },
          { header: "Ergebnis 2024 (vorläufig)", width: 15, fmt: "eur0" },
          { header: "Ansatz 2025", width: 14, fmt: "eur0" },
          { header: "Ansatz 2026", width: 14, fmt: "eur0" },
          { header: "Veränderung zu 2025", width: 14, fmt: "eur0" },
          { header: "Veränd. in %", width: 10, fmt: "pct" },
          { header: "Planung 2027", width: 14, fmt: "eur0" },
          { header: "Planung 2028", width: 14, fmt: "eur0" },
          { header: "Planung 2029", width: 14, fmt: "eur0" },
        ],
        rows: [
          ["1", "Steuern und ähnliche Abgaben", 7180400, 7395000, 7694000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 7838000, 8050000, 8290000],
          ["2", "Zuwendungen und allgemeine Umlagen", 2865300, 2940000, 3020000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 3075000, 3140000, 3215000],
          ["3", "Erträge aus der Auflösung von Sonderposten", 271800, 279000, 286000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 302000, 318000, 322000],
          ["4", "Öffentlich-rechtliche Leistungsentgelte", 402100, 418000, 455000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 478000, 486000, 495000],
          ["5", "Privatrechtliche Leistungsentgelte", 104700, 109000, 118000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 121000, 123000, 125000],
          ["6", "Kostenerstattungen und Kostenumlagen", 151200, 158000, 164000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 166000, 168000, 170000],
          ["7", "Zinsen und ähnliche Finanzerträge", 26900, 24000, 21000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 18000, 18000, 18000],
          ["8", "Sonstige ordentliche Erträge", 147600, 217000, 140000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 142000, 127000, 125000],
          {
            total: true,
            cells: [
              "",
              "Summe ordentliche Erträge",
              { f: "SUM(C5:C12)" },
              { f: "SUM(D5:D12)" },
              { f: "SUM(E5:E12)" },
              { f: "E{r}-D{r}" },
              { f: "F{r}/D{r}" },
              { f: "SUM(H5:H12)" },
              { f: "SUM(I5:I12)" },
              { f: "SUM(J5:J12)" },
            ],
          },
          ["9", "Personalaufwendungen", 3702600, 3960000, 4120000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 4230000, 4330000, 4420000],
          ["10", "Versorgungsaufwendungen", 196400, 204000, 210000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 214000, 218000, 222000],
          ["11", "Aufwendungen für Sach- und Dienstleistungen", 1588900, 1680000, 1640000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 1655000, 1668000, 1640000],
          ["12", "Abschreibungen", 731500, 752000, 780000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 812000, 838000, 846000],
          ["13", "Zinsen und ähnliche Aufwendungen", 82300, 88000, 96000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 108000, 117000, 120000],
          ["14", "Transferaufwendungen", 4300700, 4342500, 4705000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 4720000, 4715000, 4710000],
          ["15", "Sonstige ordentliche Aufwendungen", 721600, 763500, 759000, { f: "E{r}-D{r}" }, { f: "F{r}/D{r}" }, 756000, 754000, 744000],
          {
            total: true,
            cells: [
              "",
              "Summe ordentliche Aufwendungen",
              { f: "SUM(C14:C20)" },
              { f: "SUM(D14:D20)" },
              { f: "SUM(E14:E20)" },
              { f: "E{r}-D{r}" },
              { f: "F{r}/D{r}" },
              { f: "SUM(H14:H20)" },
              { f: "SUM(I14:I20)" },
              { f: "SUM(J14:J20)" },
            ],
          },
          {
            total: true,
            cells: ["", "Ordentliches Ergebnis", { f: "C13-C21" }, { f: "D13-D21" }, { f: "E13-E21" }, { f: "E{r}-D{r}" }, null, { f: "H13-H21" }, { f: "I13-I21" }, { f: "J13-J21" }],
          },
          ["16", "Außerordentliches Ergebnis", 0, 0, 0, { f: "E{r}-D{r}" }, null, 0, 0, 0],
          {
            total: true,
            cells: ["", "Jahresergebnis", { f: "C22+C23" }, { f: "D22+D23" }, { f: "E22+E23" }, { f: "E{r}-D{r}" }, null, { f: "H22+H23" }, { f: "I22+I23" }, { f: "J22+J23" }],
          },
        ],
        notes: [
          "Ergebnis 2024 vorläufig, Jahresabschluss noch nicht geprüft.",
          "Planung 2027 bis 2029 einschließlich der Konsolidierungsmaßnahmen des Haushaltssicherungskonzepts (Konsolidierungsbeitrag 2026: 222.000 €).",
          "Transferaufwendungen 2026 darin Kreisumlage 3.595.000 € (siehe Blatt Kreisumlage).",
        ],
      },
      {
        name: "Teilhaushalte",
        title: "Teilergebnispläne 2025 und 2026 im Vergleich",
        subtitle: "Beträge in Euro · Saldo = Erträge minus Aufwendungen",
        columns: [
          { header: "TH", width: 5 },
          { header: "Teilhaushalt", width: 36 },
          { header: "Erträge 2025", width: 14, fmt: "eur0" },
          { header: "Aufwendungen 2025", width: 15, fmt: "eur0" },
          { header: "Saldo 2025", width: 14, fmt: "eur0" },
          { header: "Erträge 2026", width: 14, fmt: "eur0" },
          { header: "Aufwendungen 2026", width: 15, fmt: "eur0" },
          { header: "Saldo 2026", width: 14, fmt: "eur0" },
          { header: "Veränderung Saldo", width: 14, fmt: "eur0" },
        ],
        rows: [
          ["1", "Zentrale Verwaltung", 148000, 2104000, { f: "C{r}-D{r}" }, 152000, 2168000, { f: "F{r}-G{r}" }, { f: "H{r}-E{r}" }],
          ["2", "Schule, Kultur, Bücherei", 62000, 789000, { f: "C{r}-D{r}" }, 64000, 806000, { f: "F{r}-G{r}" }, { f: "H{r}-E{r}" }],
          ["3", "Kinder, Jugend, Soziales", 1402000, 2776000, { f: "C{r}-D{r}" }, 1458000, 2912000, { f: "F{r}-G{r}" }, { f: "H{r}-E{r}" }],
          ["4", "Sport, Freizeit, Dorfgemeinschaftshaus", 79000, 318000, { f: "C{r}-D{r}" }, 86000, 326000, { f: "F{r}-G{r}" }, { f: "H{r}-E{r}" }],
          ["5", "Bauen, Straßen, Bauhof, Friedhöfe", 471000, 1561000, { f: "C{r}-D{r}" }, 498000, 1592000, { f: "F{r}-G{r}" }, { f: "H{r}-E{r}" }],
          ["6", "Ordnung, Brandschutz", 132000, 612000, { f: "C{r}-D{r}" }, 71000, 559000, { f: "F{r}-G{r}" }, { f: "H{r}-E{r}" }],
          ["7", "Allgemeine Finanzwirtschaft", 9246000, 3630000, { f: "C{r}-D{r}" }, 9569000, 3947000, { f: "F{r}-G{r}" }, { f: "H{r}-E{r}" }],
          {
            total: true,
            cells: [
              "",
              "Summe",
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "C{r}-D{r}" },
              { f: "SUM(F{first}:F{last})" },
              { f: "SUM(G{first}:G{last})" },
              { f: "F{r}-G{r}" },
              { f: "H{r}-E{r}" },
            ],
          },
          {
            total: true,
            cells: [
              "",
              "Abweichung zum Ergebnisplan",
              { f: "C12-Ergebnisplan!D13" },
              { f: "D12-Ergebnisplan!D21" },
              { f: "E12-Ergebnisplan!D22" },
              { f: "F12-Ergebnisplan!E13" },
              { f: "G12-Ergebnisplan!E21" },
              { f: "H12-Ergebnisplan!E22" },
              null,
            ],
          },
        ],
        notes: [
          "TH 6 im Jahr 2025 mit einmaliger Versicherungserstattung (Sturmschaden Gerätehaus Heidhof, 68.000 €).",
          "TH 7 enthält Steuern, Schlüsselzuweisungen, Konzessionsabgaben, Kreisumlage, Gewerbesteuerumlage und Zinsen.",
        ],
      },
      {
        name: "Kreisumlage",
        title: "Entwicklung der Kreisumlage 2023 bis 2026",
        subtitle: "Umlagesätze laut Haushaltssatzungen des Landkreises Altmoorland",
        columns: [
          { header: "Jahr", width: 8 },
          { header: "Umlagegrundlagen", width: 16, fmt: "eur0" },
          { header: "Umlagesatz", width: 11, fmt: "pct" },
          { header: "Kreisumlage", width: 14, fmt: "eur0" },
          { header: "Einwohner", width: 11, fmt: "int" },
          { header: "je Einwohner", width: 12, fmt: "eur0" },
          { header: "Veränderung zum Vorjahr", width: 16, fmt: "eur0" },
        ],
        rows: [
          ["2023", 9178000, 0.325, { f: "ROUND(B{r}*C{r},-3)" }, 6826, { f: "ROUND(D{r}/E{r},0)" }, null],
          ["2024", 9406000, 0.33, { f: "ROUND(B{r}*C{r},-3)" }, 6840, { f: "ROUND(D{r}/E{r},0)" }, { f: "D6-D5" }],
          ["2025", 9918000, 0.33, { f: "ROUND(B{r}*C{r},-3)" }, 6840, { f: "ROUND(D{r}/E{r},0)" }, { f: "D7-D6" }],
          ["2026", 10420000, 0.345, { f: "ROUND(B{r}*C{r},-3)" }, 6840, { f: "ROUND(D{r}/E{r},0)" }, { f: "D8-D7" }],
          {
            total: true,
            cells: ["Anstieg 2023–2026", null, null, { f: "D8-D5" }, null, { f: "F8-F5" }, null],
          },
        ],
        notes: [
          "Einwohnerzahl 2024 bis 2026 einheitlich zum Stichtag 31.12.2024.",
          "Ein Prozentpunkt Kreisumlage entspricht 2026 rund 104.000 €.",
        ],
      },
    ],
  },
  {
    type: "word",
    id: "bh-entgeltordnung-dgh-lindenweg",
    title: "Benutzungs- und Entgeltordnung für das Dorfgemeinschaftshaus Lindenweg (Entwurf)",
    kind: "Benutzungs- und Entgeltordnung",
    fileName: "Entwurf Benutzungs- und Entgeltordnung DGH Lindenweg 2026",
    org: "brackenhain",
    unit: "bh-haupt",
    author: "bh-hoefer",
    date: "2025-10-07",
    keywords: ["Dorfgemeinschaftshaus Lindenweg", "Pegelbegrenzer", "Reinigungspauschale", "Nutzungsordnung vom 18.03.2019", "Kaution"],
    summary:
      "Entwurf der neuen Benutzungs- und Entgeltordnung als Folge der Lärmbeschwerden: feste Nutzungszeiten, Musik nur bis 22:00 Uhr, Kaution 300 €, höhere Entgelte und eine Gegenüberstellung alt/neu. Gut für Leichte Sprache, Aushänge und den Vergleich mit der Gesprächsnotiz.",
    meta: [
      ["Vorlage-Nr.", "GR/2025/079 (Anlage 1)"],
      ["Aktenzeichen", "651.21-DGH"],
      ["Status", "Entwurf zur Vorberatung im Haupt- und Finanzausschuss am 16.10.2025"],
    ],
    subject: "Benutzungs- und Entgeltordnung für das Dorfgemeinschaftshaus Lindenweg der Gemeinde Brackenhain",
    blocks: [
      {
        t: "p",
        text: "Der Gemeinderat der Gemeinde Brackenhain hat in seiner Sitzung am ____________ folgende Benutzungs- und Entgeltordnung beschlossen:",
      },
      { t: "h3", text: "§ 1 Zweck und Geltungsbereich" },
      {
        t: "ol",
        items: [
          "Das Dorfgemeinschaftshaus Lindenweg 12 (DGH) ist eine öffentliche Einrichtung der Gemeinde Brackenhain. Es dient der Dorfgemeinschaft, der Arbeit der örtlichen Vereine und Verbände sowie privaten Feiern.",
          "Diese Ordnung gilt für den großen Saal (120 Sitzplätze), den kleinen Saal (40 Sitzplätze), die Küche, den Vereinsraum und den Außenbereich mit Terrasse.",
        ],
      },
      { t: "h3", text: "§ 2 Nutzungsberechtigte" },
      {
        t: "ol",
        items: [
          "Das DGH kann genutzt werden von örtlichen Vereinen, Verbänden, Kirchengemeinden und Wählergruppen, von gemeindlichen Einrichtungen sowie von volljährigen Einwohnerinnen und Einwohnern für private Feiern.",
          "Auswärtige können das DGH nutzen, wenn es nicht von Nutzungsberechtigten nach Absatz 1 benötigt wird.",
          "Gewerbliche Verkaufsveranstaltungen sind ausgeschlossen.",
        ],
      },
      { t: "h3", text: "§ 3 Antrag und Vergabe" },
      {
        t: "ol",
        items: [
          "Die Nutzung ist frühestens zwölf Monate und spätestens vier Wochen vor dem Termin schriftlich beim Hauptamt zu beantragen (Formular oder E-Mail an dgh@brackenhain.example).",
          "Termine werden in der Reihenfolge des Eingangs vergeben. Veranstaltungen der Gemeinde und der örtlichen Vereine haben Vorrang.",
          "Für private Feiern wird das DGH an höchstens einem Termin je Wochenende vergeben; in den Monaten Mai bis September an höchstens drei Wochenenden je Monat.",
        ],
      },
      { t: "h3", text: "§ 4 Nutzungszeiten und Schutz der Nachbarschaft" },
      {
        t: "ol",
        items: [
          "Die Nutzung endet um 24:00 Uhr, in den Nächten auf Samstag, Sonntag und einen gesetzlichen Feiertag um 01:00 Uhr. Das Haus ist spätestens 30 Minuten nach Nutzungsende zu verlassen.",
          "**Musik über eine Verstärkeranlage ist nur bis 22:00 Uhr erlaubt.** Danach ist nur Hintergrundmusik in Zimmerlautstärke zulässig; Fenster und Türen bleiben geschlossen.",
          "Musik darf nur über die hauseigene Anlage mit Pegelbegrenzer wiedergegeben werden. Eigene Anlagen dürfen nur mit vorheriger Zustimmung des Hauptamts und nur über den Pegelbegrenzer angeschlossen werden.",
          "Der Außenbereich darf ab 22:00 Uhr nicht mehr genutzt werden. Geraucht wird nur am gekennzeichneten Platz an der Gartenseite.",
          "Die Nutzenden sorgen dafür, dass Gäste das Gelände ruhig verlassen und Anwohnerinnen und Anwohner nicht durch Fahrzeuge, Gespräche oder Abfälle gestört werden.",
        ],
      },
      { t: "h3", text: "§ 5 Pflichten der Nutzenden" },
      {
        t: "ol",
        items: [
          "Die im Vertrag benannte verantwortliche Person muss volljährig sein und während der gesamten Veranstaltung anwesend sein.",
          "Die zulässige Personenzahl (großer Saal 120, kleiner Saal 40) darf nicht überschritten werden. Flucht- und Rettungswege sind freizuhalten.",
          "Die Räume sind besenrein zu übergeben, Abfälle sind getrennt zu entsorgen. Schäden sind unverzüglich dem Hausmeister zu melden.",
        ],
      },
      { t: "h3", text: "§ 6 Schlüssel, Übergabe und Hausrecht" },
      {
        t: "ol",
        items: [
          "Der Hausmeister übergibt die Räume am Veranstaltungstag und nimmt sie spätestens am folgenden Tag um 11:00 Uhr ab. Über Übergabe und Abnahme wird ein Protokoll geführt.",
          "Das Hausrecht üben der Bürgermeister, der Hausmeister und das Ordnungsamt aus. Sie dürfen die Einhaltung dieser Ordnung jederzeit kontrollieren und eine Veranstaltung bei schweren Verstößen beenden.",
        ],
      },
      { t: "h3", text: "§ 7 Kaution" },
      {
        t: "ol",
        items: [
          "Für private Feiern ist eine Kaution von 300 € spätestens zwei Wochen vor dem Termin zu zahlen.",
          "Aus der Kaution werden Schäden und Reinigungsmängel beglichen. Für jeden festgestellten Verstoß gegen § 4 werden pauschal 100 € einbehalten, wenn der Verstoß vom Hausmeister, vom Ordnungsamt oder von der Polizei festgestellt wurde.",
          "Die Kaution oder der verbleibende Betrag wird innerhalb von zwei Wochen nach der Abnahme zurückgezahlt.",
        ],
      },
      { t: "h3", text: "§ 8 Haftung" },
      {
        t: "p",
        text: "Die Nutzenden haften für alle Schäden, die im Zusammenhang mit der Nutzung entstehen, und stellen die Gemeinde von Ansprüchen Dritter frei.",
      },
      { t: "h3", text: "§ 9 Entgelte" },
      {
        t: "table",
        header: ["Leistung", "Ortsansässige", "Auswärtige"],
        rows: [
          ["Großer Saal mit Küche, je Tag", "290 €", "380 €"],
          ["Kleiner Saal, je Tag", "120 €", "160 €"],
          ["Küche allein (z. B. Kaffeetafel)", "60 €", "80 €"],
          ["Vereinsraum, je angefangene Stunde (nur Vereine)", "8 €", "–"],
          ["Reinigungspauschale (private Feiern)", "80 €", "80 €"],
          ["Geschirr und Besteck, je Gedeck", "0,50 €", "0,50 €"],
          ["Kaution (private Feiern)", "300 €", "300 €"],
        ],
        widths: [5, 2, 2],
      },
      { t: "h3", text: "§ 10 Ermäßigungen und Befreiungen" },
      {
        t: "ol",
        items: [
          "Örtliche Vereine und Verbände nutzen das DGH für ihre regelmäßige Vereinsarbeit (Übungsabende, Versammlungen, Jugendarbeit) entgeltfrei.",
          "Für Veranstaltungen örtlicher Vereine mit Eintritt oder Bewirtung wird die Hälfte des Entgelts erhoben; die Reinigungspauschale entfällt, wenn der Verein selbst reinigt.",
          "Für Trauerfeiern im Anschluss an eine Beisetzung wird die Hälfte des Entgelts erhoben.",
          "Veranstaltungen der Gemeinde, der Freiwilligen Feuerwehr und des Gemeindekindergartens sind entgeltfrei.",
        ],
      },
      { t: "h3", text: "§ 11 Ausschluss von der Nutzung" },
      {
        t: "p",
        text: "Wer gegen diese Ordnung wiederholt oder grob verstößt, kann für bis zu zwei Jahre von der Nutzung ausgeschlossen werden.",
      },
      { t: "h3", text: "§ 12 Inkrafttreten" },
      {
        t: "p",
        text: "Diese Ordnung tritt am 01.01.2026 in Kraft. Gleichzeitig tritt die Nutzungsordnung vom 18.03.2019 außer Kraft. Für Verträge, die vor dem Inkrafttreten geschlossen wurden, gelten die bisherigen Entgelte; § 4 gilt für alle Veranstaltungen ab dem 01.01.2026.",
      },
      { t: "pagebreak" },
      { t: "h2", text: "Anlage: Wesentliche Änderungen gegenüber der Nutzungsordnung 2019" },
      {
        t: "table",
        header: ["Regelung", "bisher (2019)", "neu (Entwurf)"],
        rows: [
          ["Nutzungsende", "24:00 Uhr, danach „Zimmerlautstärke“", "24:00 Uhr, Fr/Sa und vor Feiertagen 01:00 Uhr"],
          ["Musik", "keine Regelung", "Verstärkeranlage nur bis 22:00 Uhr, nur über Pegelbegrenzer"],
          ["Außenbereich", "keine Regelung", "ab 22:00 Uhr nicht mehr nutzbar, Raucherplatz Gartenseite"],
          ["Private Feiern im Sommer", "unbegrenzt", "höchstens drei Wochenenden je Monat (Mai bis September)"],
          ["Großer Saal, Ortsansässige", "220 €", "290 €"],
          ["Kleiner Saal, Ortsansässige", "90 €", "120 €"],
          ["Reinigung", "durch Nutzende", "Pauschale 80 € (private Feiern)"],
          ["Kaution", "150 €", "300 €, Einbehalt 100 € je Lärmverstoß"],
        ],
        widths: [3, 3, 4],
      },
      {
        t: "note",
        text: "**Hinweise für die Beratung:** Anlass sind die Beschwerden aus der Nachbarschaft am Lindenweg (2024: zwei, 2025 bis September: vier). Die Vereine wurden am 01.10.2025 angehört. Mehrerträge nach Schätzung des Hauptamts rund 9.000 € jährlich bei etwa 45 privaten Vermietungen.",
      },
      { t: "signature", lines: ["Im Auftrag", "Martina Höfer", "Leiterin Hauptamt"] },
    ],
  },
  {
    type: "word",
    id: "bh-niederschrift-gemeinderat-2025-12-15",
    title: "Niederschrift der Gemeinderatssitzung vom 15.12.2025 (öffentlicher Teil)",
    kind: "Niederschrift",
    fileName: "Niederschrift Gemeinderat 2025-12-15 oeffentlicher Teil",
    org: "brackenhain",
    unit: "bh-haupt",
    author: "bh-bartels",
    date: "2025-12-18",
    tags: ["widersprueche"],
    keywords: ["GR/2025/087", "Einwohnerfragestunde", "befangen", "Am Mühlenfeld II", "Baubeschluss"],
    summary:
      "Niederschrift einer Gemeinderatssitzung mit Haushaltsbeschluss, neuer DGH-Ordnung, vertagtem Baubeschluss für die Kita-Erweiterung, Bebauungsplan, Spenden und Anfragen. Eingebaute Fehler: Bei TOP 6 werden 18 Stimmen gezählt, obwohl nur 17 Stimmberechtigte anwesend sind; bei TOP 8 stimmen trotz Befangenheit eines Ratsmitglieds 17 statt 16 ab.",
    meta: [
      ["Sitzung", "GR 06/2025"],
      ["Aktenzeichen", "022.30-GR"],
      ["Status", "öffentlicher Teil"],
    ],
    subject: "Niederschrift über die öffentliche Sitzung des Gemeinderats der Gemeinde Brackenhain am Montag, 15.12.2025",
    blocks: [
      {
        t: "table",
        header: ["Angabe", "Inhalt"],
        rows: [
          ["Sitzungsort", "Dorfgemeinschaftshaus Lindenweg, großer Saal"],
          ["Beginn", "19:00 Uhr"],
          ["Ende des öffentlichen Teils", "21:42 Uhr"],
          ["Vorsitz", "Bürgermeister Frank Ruhnau"],
          ["Schriftführung", "Anke Bartels, Hauptamt"],
        ],
        widths: [2, 5],
      },
      { t: "h2", text: "Anwesend" },
      {
        t: "ul",
        items: [
          "**Vorsitzender:** Bürgermeister Frank Ruhnau",
          "**Wählergemeinschaft Brackenhain (WGB):** Horst Bremer, Gesine Lüttjohann, Bernd Kröger, Klaus-Dieter Hamann, Reinhard Bohlen, Silke Ottens",
          "**Freie Wählervereinigung Altmoorland (FWA):** Jürgen Meinecke, Annegret Fock, Hauke Sievers, Dörte Behnke, Stefan Kluth",
          "**Soziale Liste:** Monika Freese, Ahmet Yıldız, Ingrid Struve",
          "**Ökologische Mitte:** Dr. Katrin Leßmann, Tobias Rehder",
          "**Verwaltung:** Martina Höfer (Hauptamt), Petra Schnoor (Kämmerin), Uwe Dettmer (Bauamt, zu TOP 7 und 8), Sabrina Vogt (Gemeindekindergarten, zu TOP 7)",
          "**Gäste:** Gemeindewehrführer Marco Thiele, etwa 35 Einwohnerinnen und Einwohner, Herr Brocks (Altmoorländer Kreisblatt)",
        ],
      },
      { t: "p", text: "**Entschuldigt:** Tanja Wiechmann (WGB), Lea Harjes (Ökologische Mitte)" },
      { t: "h2", text: "Tagesordnung (öffentlicher Teil)" },
      {
        t: "ol",
        items: [
          "Eröffnung, Feststellung der ordnungsgemäßen Ladung, der Beschlussfähigkeit und der Tagesordnung",
          "Einwohnerfragestunde",
          "Genehmigung der Niederschrift über die Sitzung vom 06.10.2025",
          "Mitteilungen des Bürgermeisters",
          "Haushaltssatzung 2026 mit Haushaltssicherungskonzept 2026–2029 (Vorlage GR/2025/087)",
          "Benutzungs- und Entgeltordnung für das Dorfgemeinschaftshaus Lindenweg (Vorlage GR/2025/079)",
          "Erweiterung des Gemeindekindergartens „Lindenhof“ um eine Krippengruppe – Baubeschluss (Vorlage GR/2025/091)",
          "Bebauungsplan Nr. 14 „Am Mühlenfeld II“ – Aufstellungsbeschluss (Vorlage GR/2025/089)",
          "Annahme von Spenden (Vorlage GR/2025/093)",
          "Anfragen und Anregungen der Ratsmitglieder",
        ],
      },
      { t: "h2", text: "TOP 1 – Eröffnung" },
      {
        t: "p",
        text: "Bürgermeister Ruhnau eröffnet die Sitzung um 19:00 Uhr und begrüßt die Ratsmitglieder, die Verwaltung, die Gäste und die Presse. Er stellt fest, dass zur Sitzung mit Schreiben vom 03.12.2025 ordnungsgemäß geladen wurde. Anwesend sind 16 Ratsmitglieder und der Bürgermeister; der Gemeinderat ist mit 17 von 19 Stimmberechtigten beschlussfähig. Änderungswünsche zur Tagesordnung bestehen nicht.",
      },
      { t: "h2", text: "TOP 2 – Einwohnerfragestunde" },
      {
        t: "ul",
        items: [
          "**Herr Karl-Heinz Wolters** (Lindenweg) fragt, ob die neue Ordnung für das Dorfgemeinschaftshaus auch für bereits gebuchte Feiern gilt und wer am Wochenende kontrolliert. Bürgermeister Ruhnau antwortet, dass die Regeln zur Nachtruhe ab dem 01.01.2026 für alle Veranstaltungen gelten, die neuen Entgelte nur für neue Verträge. Der Hausmeister mache Kontrollgänge; bei nächtlichen Ruhestörungen sei weiterhin die Polizei zu verständigen. Herr Wolters bezweifelt, dass das ausreicht.",
          "**Frau Heike Tammen** (Kleinbracken) weist darauf hin, dass mehrere Straßenlaternen in der Dorfstraße seit Wochen nicht leuchten. Bürgermeister Ruhnau sagt eine Prüfung durch den Bauhof bis Ende Januar zu.",
          "**Herr Ole Janssen** (Heidhof) fragt, wann der Glasfaserausbau in Heidhof beginnt. Bürgermeister Ruhnau teilt mit, dass der Förderbescheid des Bundes im Frühjahr 2026 erwartet wird. Im Juni 2026 soll eine Bürgerversammlung stattfinden.",
        ],
      },
      { t: "h2", text: "TOP 3 – Genehmigung der Niederschrift vom 06.10.2025" },
      { t: "p", text: "Die Niederschrift wird ohne Änderungen genehmigt. **Abstimmung:** 15 Ja-Stimmen, 0 Nein-Stimmen, 2 Enthaltungen (wegen Abwesenheit in der Sitzung)." },
      { t: "h2", text: "TOP 4 – Mitteilungen des Bürgermeisters" },
      {
        t: "ul",
        items: [
          "Der Förderbescheid aus dem Landesprogramm „Kita-Ausbau 2026“ über 1.075.000 € für die Erweiterung des Gemeindekindergartens ist am 04.11.2025 eingegangen.",
          "Die Ausschreibung des HLF 10 für die Ortswehr Heidhof ist vorbereitet und wird nach der Genehmigung des Haushalts veröffentlicht.",
          "Der Kreistag hat den Umlagesatz der Kreisumlage für 2026 auf 34,5 % festgesetzt.",
          "Zu Beginn der Wintersaison am 01.11.2025 wurden 85 t Streusalz eingelagert.",
          "Die Verwaltung führt ab Februar 2026 gemeinsam mit dem Zweckverband Kommunale IT Altmoor die E-Akte ein; die Schulungen finden im Januar statt.",
        ],
      },
      { t: "h2", text: "TOP 5 – Haushaltssatzung 2026 mit Haushaltssicherungskonzept 2026–2029" },
      {
        t: "p",
        text: "Kämmerin Schnoor erläutert die Vorlage GR/2025/087. Der Ergebnishaushalt sieht ordentliche Erträge von 11.898.000 € und ordentliche Aufwendungen von 12.310.000 € vor; der Fehlbetrag beträgt 412.000 €. Hauptursache ist der Anstieg der Kreisumlage um 322.000 €. Das Haushaltssicherungskonzept enthält zwölf Maßnahmen mit einem Konsolidierungsbeitrag von 222.000 € im Jahr 2026; der Haushaltsausgleich ist für 2029 geplant. Investitionen sind mit 2.840.000 € veranschlagt, die Kreditermächtigung beträgt 1.200.000 €. Als Risiko nennt Frau Schnoor ein laufendes Einspruchsverfahren eines Gewerbebetriebs gegen seine Gewerbesteuermessbescheide; Erstattungen im mittleren sechsstelligen Bereich seien möglich. Der Haupt- und Finanzausschuss hat die Annahme am 27.11.2025 mit 6 zu 3 Stimmen empfohlen.",
      },
      {
        t: "p",
        text: "Ratsherr **Bremer** (WGB) kritisiert die Anhebung der Hebesätze als „Griff in die Taschen der Bürger“, solange bei der Verwaltung nicht genug gespart werde. Die Kürzung der Vereinsförderung treffe das Ehrenamt. Für die WGB beantragt er, Maßnahme 9 (Kürzung der Vereinsförderung um 10 %) zu streichen und den Ausfall durch eine stärkere Anhebung der Hundesteuer auszugleichen.",
      },
      {
        t: "p",
        text: "Ratsfrau **Freese** (Soziale Liste) trägt den Haushalt mit, bittet aber darum, die Elternbeiträge für die Krippe sozial zu staffeln. Ratsfrau **Dr. Leßmann** (Ökologische Mitte) begrüßt die Maßnahmen zur Energieeinsparung und regt eine Photovoltaikanlage auf dem Anbau des Kindergartens an. Ratsherr **Meinecke** (FWA) bezeichnet die Kreisumlage als Kern des Problems und schlägt eine gemeinsame Stellungnahme der kreisangehörigen Gemeinden an den Kreistag vor.",
      },
      { t: "p", text: "**Abstimmung über den Änderungsantrag der WGB** (Streichung von Maßnahme 9): 6 Ja-Stimmen, 11 Nein-Stimmen, 0 Enthaltungen. Der Antrag ist abgelehnt." },
      {
        t: "p",
        text: "**Abstimmung über den Prüfauftrag der Sozialen Liste:** Die Verwaltung prüft bis zur Änderung der Elternbeitragssatzung eine Staffelung der Krippenbeiträge nach Einkommen. Einstimmig angenommen (17 Ja-Stimmen).",
      },
      {
        t: "note",
        text: "**Beschluss:** Der Gemeinderat beschließt die Haushaltssatzung 2026 einschließlich des Haushaltssicherungskonzepts 2026–2029 und des Stellenplans in der Fassung der Vorlage GR/2025/087. **Abstimmung:** 11 Ja-Stimmen, 6 Nein-Stimmen, 0 Enthaltungen.",
      },
      { t: "h2", text: "TOP 6 – Benutzungs- und Entgeltordnung für das Dorfgemeinschaftshaus Lindenweg" },
      {
        t: "p",
        text: "Frau Höfer erläutert die Vorlage. Anlass sind die wiederholten Beschwerden aus der Nachbarschaft. Kern der Neuregelung: Musik über Verstärkeranlagen nur bis 22:00 Uhr und nur über den Pegelbegrenzer, feste Nutzungszeiten, Kaution 300 € mit Einbehalt von 100 € je Lärmverstoß, Entgelt für den großen Saal 290 € statt 220 €. Der Haupt- und Finanzausschuss hat am 16.10.2025 empfohlen, die Reinigungspauschale für örtliche Vereine entfallen zu lassen, wenn sie selbst reinigen; dies ist in die Vorlage eingearbeitet.",
      },
      {
        t: "p",
        text: "Ratsherr **Rehder** (Ökologische Mitte) fragt nach den im Haushalt vorgesehenen 95.000 € für Schallschutz. Frau Höfer: Geplant sind eine Lüftungsanlage für den großen Saal und Schallschutzfenster zur Straßenseite, Umsetzung im Sommer 2026. Ratsherr **Kluth** (FWA) hält die Kaution von 300 € für junge Familien für zu hoch. Ratsherr **Bohlen** (WGB) fragt, warum freitags und samstags bis 01:00 Uhr genutzt werden darf; Frau Höfer verweist darauf, dass es bisher gar kein festes Nutzungsende gab.",
      },
      {
        t: "note",
        text: "**Beschluss:** Der Gemeinderat beschließt die Benutzungs- und Entgeltordnung für das Dorfgemeinschaftshaus Lindenweg in der Fassung der Vorlage GR/2025/079 mit Wirkung zum 01.01.2026. **Abstimmung:** 13 Ja-Stimmen, 2 Nein-Stimmen, 3 Enthaltungen.",
      },
      { t: "h2", text: "TOP 7 – Erweiterung des Gemeindekindergartens „Lindenhof“ um eine Krippengruppe – Baubeschluss" },
      {
        t: "p",
        text: "Herr Dettmer berichtet über den Planungsstand: Die Entwurfsplanung ist abgeschlossen, die Kostenberechnung bestätigt die Gesamtkosten von 2.150.000 €. Der Förderbescheid über 1.075.000 € liegt vor. Die Ausschreibung der Rohbauarbeiten nach VOB/A könnte im Februar 2026 erfolgen, ein Baubeginn wäre im Mai 2026 möglich.",
      },
      {
        t: "p",
        text: "Frau Vogt schildert den Bedarf: Der Kindergarten ist mit 12 Krippen- und 70 Elementarplätzen voll belegt, auf der Warteliste stehen derzeit 21 Kinder, davon 14 unter drei Jahren. Die fünfte Gruppe würde 12 zusätzliche Krippenplätze schaffen. Ratsherr **Meinecke** (FWA) beantragt, den Baubeschluss zu vertagen, bis die Kommunalaufsicht das Haushaltssicherungskonzept genehmigt hat; der Eigenanteil von 1.075.000 € und die Folgekosten von rund 129.000 € jährlich seien sonst nicht abgesichert. Ratsfrau **Freese** (Soziale Liste) warnt vor Klagen von Eltern auf einen Krippenplatz.",
      },
      {
        t: "note",
        text: "**Beschluss:** Der Baubeschluss wird bis zur Genehmigung des Haushaltssicherungskonzepts zurückgestellt. Die Verwaltung führt die Planung bis zur Ausschreibungsreife fort und klärt mit dem Land, wie lange die Förderung offengehalten werden kann. **Abstimmung über den Vertagungsantrag:** 12 Ja-Stimmen, 5 Nein-Stimmen, 0 Enthaltungen.",
      },
      { t: "h2", text: "TOP 8 – Bebauungsplan Nr. 14 „Am Mühlenfeld II“ – Aufstellungsbeschluss" },
      {
        t: "p",
        text: "Ratsherr **Kröger** (WGB) erklärt, dass er Eigentümer einer Teilfläche im Plangebiet ist. Er ist nach § 31 KV befangen, verlässt den Ratstisch und nimmt im Zuschauerraum Platz.",
      },
      {
        t: "p",
        text: "Herr Dettmer erläutert die Planung: Das Plangebiet umfasst rund 6,2 ha nördlich des Baugebiets „Am Mühlenfeld“ und soll Platz für etwa 58 Baugrundstücke bieten, davon zehn für Doppel- und Reihenhäuser. Der Flächennutzungsplan wird im Parallelverfahren geändert. Die frühzeitige Beteiligung der Öffentlichkeit und der Behörden (§ 3 Abs. 1 und § 4 Abs. 1 BauGB) ist für das Frühjahr 2026 vorgesehen.",
      },
      {
        t: "p",
        text: "Ratsfrau **Dr. Leßmann** mahnt einen sparsamen Umgang mit Fläche an und fragt nach Baulücken im Ortskern; Herr Dettmer nennt 23 bekannte Baulücken, deren Eigentümer überwiegend nicht verkaufen wollen. Ratsfrau **Struve** (Soziale Liste) bittet, die Wirtschaftswege im Umfeld bei der Erschließung mitzudenken.",
      },
      {
        t: "note",
        text: "**Beschluss:** Der Gemeinderat beschließt nach § 2 Abs. 1 BauGB die Aufstellung des Bebauungsplans Nr. 14 „Am Mühlenfeld II“ sowie die 7. Änderung des Flächennutzungsplans im Parallelverfahren. **Abstimmung:** einstimmig (17 Ja-Stimmen).",
      },
      { t: "p", text: "Ratsherr Kröger nimmt ab TOP 9 wieder an der Sitzung teil." },
      { t: "h2", text: "TOP 9 – Annahme von Spenden" },
      {
        t: "table",
        header: ["Spender", "Betrag", "Zweck"],
        rows: [
          ["Förderverein der Freiwilligen Feuerwehr Brackenhain e. V.", "2.500 €", "Wärmebildkamera Ortswehr Brackenhain"],
          ["Tischlerei Holtorf, Brackenhain", "800 €", "Spielgeräte Gemeindekindergarten"],
          ["Landfrauen Heidhof", "450 €", "Seniorenweihnachtsfeier"],
        ],
        widths: [4, 1, 3],
      },
      { t: "note", text: "**Beschluss:** Der Gemeinderat nimmt die Spenden an. **Abstimmung:** einstimmig (17 Ja-Stimmen)." },
      { t: "h2", text: "TOP 10 – Anfragen und Anregungen der Ratsmitglieder" },
      {
        t: "ul",
        items: [
          "Ratsherr **Bremer** fragt nach dem Stand des Einspruchsverfahrens zur Gewerbesteuer. Frau Schnoor: Das Ergebnis ist offen; Einzelheiten unterliegen dem Steuergeheimnis. Der Gemeinderat wird informiert, sobald Bescheide vorliegen.",
          "Ratsfrau **Struve** weist auf Schlaglöcher und abgefahrene Bankette im Heidhofer Moorweg hin. Herr Dettmer: Der 2. Bauabschnitt ist im Haushalt 2026 enthalten; im 1. Bauabschnitt wird der Bauhof nach der Frostperiode ausbessern.",
          "Ratsherr **Rehder** fragt nach dem Termin der Bürgerversammlung zum Breitbandausbau. Bürgermeister Ruhnau: voraussichtlich Ende Juni 2026 im Dorfgemeinschaftshaus.",
          "Ratsfrau **Fock** (FWA) bittet, den Schulweg in Kleinbracken im Winterdienst vorrangig zu räumen. Bürgermeister Ruhnau sagt zu, dass die Gehwegtour des Bauhofs dort ab 6:30 Uhr beginnt.",
          "Ratsfrau **Ottens** (WGB) fragt nach der Personalsituation im Kindergarten. Frau Vogt berichtet von zwei längeren Erkrankungen; die Vertretung werde derzeit über Stundenaufstockungen von Teilzeitkräften organisiert.",
        ],
      },
      {
        t: "p",
        text: "Bürgermeister Ruhnau bedankt sich bei den Ratsmitgliedern für die Zusammenarbeit im Jahr 2025 und schließt den öffentlichen Teil der Sitzung um 21:42 Uhr. Es folgt der nichtöffentliche Teil (Grundstücksangelegenheit, Personalangelegenheit).",
      },
      { t: "signature", lines: ["Frank Ruhnau, Bürgermeister (Vorsitz)", "Anke Bartels (Schriftführung)"] },
    ],
  },
  {
    type: "excel",
    id: "bh-belegungsplan-dgh-2026-h2",
    title: "Belegungsplan Dorfgemeinschaftshaus Lindenweg, 2. Halbjahr 2026",
    kind: "Belegungsplan",
    fileName: "Belegungsplan DGH Lindenweg 2026 2. Halbjahr Stand 2026-08-12",
    org: "brackenhain",
    unit: "bh-haupt",
    author: "bh-hoefer",
    date: "2026-08-12",
    tags: ["personendaten", "widersprueche"],
    keywords: ["Einbehalt Kaution", "Hinrichsen", "Seniorenkreis", "Reinigung", "§ 3 Abs. 3"],
    summary:
      "Belegungsliste des Dorfgemeinschaftshauses mit erfundenen Namen, Anschriften, Telefonnummern und Vermerken zu Lärmverstößen, dazu eine Monatsauswertung. Ideal zum Anonymisieren; außerdem sind im Juli und August mehr Wochenenden mit privaten Feiern belegt, als die neue Ordnung (§ 3 Abs. 3) erlaubt.",
    sheets: [
      {
        name: "Belegungen",
        title: "Belegungsplan Dorfgemeinschaftshaus Lindenweg – Juli bis Dezember 2026",
        subtitle: "Hauptamt · Stand 12.08.2026 · Entgelte nach der Benutzungs- und Entgeltordnung vom 15.12.2025 · nur für den Dienstgebrauch",
        columns: [
          { header: "Nr.", width: 5 },
          { header: "Datum", width: 11, fmt: "date" },
          { header: "Raum", width: 16 },
          { header: "Anlass", width: 22 },
          { header: "Mieter/in bzw. Verein", width: 28 },
          { header: "Anschrift", width: 34 },
          { header: "Telefon / E-Mail", width: 26 },
          { header: "Ortsansässig", width: 11 },
          { header: "Status", width: 12 },
          { header: "Entgelt", width: 9, fmt: "eur0" },
          { header: "Reinigung", width: 10, fmt: "eur0" },
          { header: "Einbehalt Kaution", width: 11, fmt: "eur0" },
          { header: "Einnahmen", width: 11, fmt: "eur0" },
          { header: "Bemerkungen", width: 46 },
        ],
        rows: [
          [1, { date: "2026-07-04" }, "Großer Saal", "Hochzeitsfeier", "Jana und Timo Ahrens", "Birkenweg 7, 00758 Brackenhain", "040 66969-731", "ja", "abgerechnet", 290, 80, 0, { f: "J{r}+K{r}+L{r}" }, "Abnahme ohne Beanstandung, Kaution zurück am 06.07."],
          [2, { date: "2026-07-08" }, "Kleiner Saal", "Sommerfest", "Seniorenkreis Brackenhain (Fr. Gertrud Hinz)", "Schulstraße 4, 00758 Brackenhain", "040 66969-744", "Verein", "abgerechnet", 0, 0, 0, { f: "J{r}+K{r}+L{r}" }, "entgeltfrei (§ 10 Abs. 1)"],
          [3, { date: "2026-07-11" }, "Großer Saal", "60. Geburtstag", "Manfred Kühl", "Heidhofer Straße 22, 00758 Brackenhain (OT Heidhof)", "040 66969-752", "ja", "abgerechnet", 290, 80, 100, { f: "J{r}+K{r}+L{r}" }, "Anruf Ehepaar Brunke (Lindenweg 10) 22:35 Uhr; Kontrollgang Hausmeister 22:40 Uhr: Musikbox auf der Terrasse. 100 € einbehalten (§ 7 Abs. 2)"],
          [4, { date: "2026-07-18" }, "Kleiner Saal", "Tauffeier", "Dilara Kaya", "Am Kirchberg 9, 00758 Brackenhain", "d.kaya@mailbox.example", "ja", "abgerechnet", 120, 80, 0, { f: "J{r}+K{r}+L{r}" }, "ohne Beanstandung"],
          [5, { date: "2026-07-25" }, "Großer Saal", "Familienfeier", "Selin Özdemir", "Am Kirchberg 3, 00758 Brackenhain", "040 66969-763", "ja", "abgerechnet", 290, 80, 0, { f: "J{r}+K{r}+L{r}" }, "neue Regeln (Musik bis 22 Uhr) bei Schlüsselübergabe erläutert, keine Beschwerden"],
          [6, { date: "2026-07-29" }, "Kleiner Saal + Küche", "Trauerkaffee", "Wilfried Gerdau", "Moorweg 3, 00758 Brackenhain (OT Heidhof)", "040 66969-771", "ja", "abgerechnet", 90, 80, 0, { f: "J{r}+K{r}+L{r}" }, "Ermäßigung 50 % (§ 10 Abs. 3)"],
          [7, { date: "2026-08-01" }, "Großer Saal", "Abiturfeier", "Lukas Hinrichsen", "Mühlenkamp 14, 00761 Rabensfurt", "l.hinrichsen@freemail.example", "nein", "abgerechnet", 380, 80, 200, { f: "J{r}+K{r}+L{r}" }, "Beschwerde Hr. Wolters (Lindenweg 14) 02.08., 0:50 Uhr, Polizei vor Ort: Musik bei offener Tür, Außenbereich nach 22 Uhr genutzt. 2 Verstöße, 200 € einbehalten. Widerspruch der Mutter per Mail am 05.08."],
          [8, { date: "2026-08-08" }, "Großer Saal", "Silberhochzeit", "Birgit und Uwe Rösner", "Lerchenweg 11, 00758 Brackenhain", "040 66969-786", "ja", "abgerechnet", 290, 80, 0, { f: "J{r}+K{r}+L{r}" }, "ohne Beanstandung"],
          [9, { date: "2026-08-15" }, "Großer Saal", "40. Geburtstag", "Kevin Lange", "Am Sportplatz 5, 00758 Brackenhain", "040 66969-790", "ja", "bestätigt", 290, 80, null, { f: "J{r}+K{r}+L{r}" }, "Kaution 300 € eingegangen am 30.07."],
          [10, { date: "2026-08-21" }, "gesamtes Haus", "Dorffest 2026", "Gemeinde und Heimatverein Brackenhain e. V.", "Lindenstraße 2, 00758 Brackenhain", "040 66969-610", "Gemeinde", "bestätigt", 0, 0, null, { f: "J{r}+K{r}+L{r}" }, "Fr 14 Uhr bis So 20 Uhr, Ausnahme von § 4 durch den Bürgermeister zugelassen"],
          [11, { date: "2026-08-29" }, "Kleiner Saal", "Kindergeburtstag", "Nadine Wübben", "Schulstraße 17, 00758 Brackenhain", "n.wuebben@netzpost.example", "ja", "bestätigt", 120, 80, null, { f: "J{r}+K{r}+L{r}" }, ""],
          [12, { date: "2026-09-05" }, "Großer Saal", "18. Geburtstag", "Thorsten Meyer (Vater, verantwortliche Person)", "Lindenweg 21, 00758 Brackenhain", "040 66969-795", "ja", "bestätigt", 290, 80, null, { f: "J{r}+K{r}+L{r}" }, "Vater muss anwesend sein (§ 5 Abs. 1); Kontrollgang 22 Uhr vormerken"],
          [13, { date: "2026-09-12" }, "Großer Saal", "Hochzeitsfeier", "Anna Petrović und Jonas Fehrs", "Torfstich 2, 00764 Fennhusen", "a.petrovic@mailbox.example", "nein", "bestätigt", 380, 80, null, { f: "J{r}+K{r}+L{r}" }, "Kaution noch offen, Erinnerung am 10.08."],
          [14, { date: "2026-09-19" }, "Großer Saal", "Saisonabschlussfeier", "TuS Brackenhain 1921 e. V. (Günter Pahlke)", "Am Mühlenbach 1, 00758 Brackenhain", "vorstand@tus-brackenhain.example", "Verein", "bestätigt", 145, 0, null, { f: "J{r}+K{r}+L{r}" }, "50 % (§ 10 Abs. 2), Verein reinigt selbst"],
          [15, { date: "2026-09-26" }, "Großer Saal", "50. Geburtstag", "Sandra Kühn", "Feldstraße 6, 00758 Brackenhain (OT Kleinbracken)", "040 66969-803", "ja", "bestätigt", 290, 80, null, { f: "J{r}+K{r}+L{r}" }, ""],
          [16, { date: "2026-10-03" }, "Großer Saal", "Polterabend", "Mareike Struck", "Am Mühlenfeld 18, 00758 Brackenhain", "m.struck@freemail.example", "ja", "bestätigt", 290, 80, null, { f: "J{r}+K{r}+L{r}" }, "Porzellan nur auf dem Parkplatz, Scherben selbst entsorgen"],
          [17, { date: "2026-10-10" }, "gesamtes Haus", "Herbstmarkt", "Heimatverein Brackenhain e. V. (Hr. Bernd Ocken)", "Lindenstraße 9, 00758 Brackenhain", "040 66969-812", "Verein", "bestätigt", 0, 0, null, { f: "J{r}+K{r}+L{r}" }, "entgeltfrei (Vereinsarbeit, kein Eintritt)"],
          [18, { date: "2026-10-17" }, "Großer Saal", "70. Geburtstag", "Hannelore Dierks", "Heidhofer Straße 5, 00758 Brackenhain (OT Heidhof)", "040 66969-817", "ja", "angefragt", 290, 80, null, { f: "J{r}+K{r}+L{r}" }, "Antrag vom 03.08., Vertrag versandt"],
          [19, { date: "2026-10-24" }, "Großer Saal", "Kameradschaftsabend", "Freiwillige Feuerwehr, Ortswehr Brackenhain", "Feuerwehrgerätehaus, Lindenstraße 40", "040 66969-645", "Gemeinde", "bestätigt", 0, 0, null, { f: "J{r}+K{r}+L{r}" }, "entgeltfrei (§ 10 Abs. 4)"],
          [20, { date: "2026-11-07" }, "Großer Saal", "Hochzeitsfeier", "Sophie Lammert und Niklas Baum", "Kiefernweg 2, 00752 Altmoor", "s.lammert@netzpost.example", "nein", "angefragt", 380, 80, null, { f: "J{r}+K{r}+L{r}" }, ""],
          [21, { date: "2026-11-21" }, "Kleiner Saal", "25 Jahre Kegelclub", "Kegelclub „Gut Holz“ Brackenhain (Dieter Klaasen)", "Lindenstraße 30, 00758 Brackenhain", "040 66969-826", "Verein", "angefragt", 60, 0, null, { f: "J{r}+K{r}+L{r}" }, "50 % (§ 10 Abs. 2)"],
          [22, { date: "2026-12-02" }, "Kleiner Saal", "Adventsfeier", "Seniorenkreis Brackenhain (Fr. Gertrud Hinz)", "Schulstraße 4, 00758 Brackenhain", "040 66969-744", "Verein", "bestätigt", 0, 0, null, { f: "J{r}+K{r}+L{r}" }, "entgeltfrei"],
          [23, { date: "2026-12-05" }, "Großer Saal", "Betriebsweihnachtsfeier", "Tischlerei Holtorf (Inh. Jan Holtorf)", "Gewerbegebiet Nord 3, 00758 Brackenhain", "j.holtorf@tischlerei-holtorf.example", "ja", "bestätigt", 290, 80, null, { f: "J{r}+K{r}+L{r}" }, ""],
          [24, { date: "2026-12-12" }, "Großer Saal", "Weihnachtsfeier Jugend", "TuS Brackenhain 1921 e. V., Jugendabteilung", "Am Mühlenbach 1, 00758 Brackenhain", "vorstand@tus-brackenhain.example", "Verein", "bestätigt", 0, 0, null, { f: "J{r}+K{r}+L{r}" }, "entgeltfrei (Jugendarbeit)"],
          [25, { date: "2026-12-31" }, "Großer Saal", "Silvesterfeier", "Patrick Schumann", "Lindenweg 6, 00758 Brackenhain", "040 66969-834", "ja", "abgelehnt", 0, 0, null, { f: "J{r}+K{r}+L{r}" }, "abgelehnt am 10.08.: Feier „bis in den Morgen“ geplant, Nutzungsende 01:00 Uhr (§ 4 Abs. 1); 30.12. als Alternative angeboten"],
          {
            total: true,
            cells: ["", null, "", "", "Summe", "", "", "", "", { f: "SUM(J{first}:J{last})" }, { f: "SUM(K{first}:K{last})" }, { f: "SUM(L{first}:L{last})" }, { f: "SUM(M{first}:M{last})" }, ""],
          },
        ],
        notes: [
          "Regel: private Feiern von Mai bis September an höchstens drei Wochenenden je Monat (§ 3 Abs. 3 der Ordnung).",
          "Kaution für private Feiern 300 €; Einbehalt 100 € je festgestelltem Lärmverstoß (§ 7 Abs. 2).",
          "Die Liste enthält personenbezogene Daten. Weitergabe an Dritte, insbesondere an Beschwerdeführende, ist nicht zulässig.",
        ],
      },
      {
        name: "Auswertung",
        title: "Auswertung nach Monaten",
        subtitle: "Einnahmen aus Entgelten, Reinigungspauschalen und einbehaltenen Kautionen",
        columns: [
          { header: "Monat", width: 12 },
          { header: "Einträge", width: 10, fmt: "int" },
          { header: "davon private Feiern", width: 12, fmt: "int" },
          { header: "davon Vereine/Gemeinde", width: 13, fmt: "int" },
          { header: "Einnahmen", width: 12, fmt: "eur0" },
          { header: "Einbehalte", width: 12, fmt: "eur0" },
          { header: "Beschwerden", width: 12, fmt: "int" },
        ],
        rows: [
          ["Juli", { f: "COUNTA(Belegungen!E5:E10)" }, 5, 1, { f: "SUM(Belegungen!M5:M10)" }, { f: "SUM(Belegungen!L5:L10)" }, 1],
          ["August", { f: "COUNTA(Belegungen!E11:E15)" }, 4, 1, { f: "SUM(Belegungen!M11:M15)" }, { f: "SUM(Belegungen!L11:L15)" }, 1],
          ["September", { f: "COUNTA(Belegungen!E16:E19)" }, 3, 1, { f: "SUM(Belegungen!M16:M19)" }, { f: "SUM(Belegungen!L16:L19)" }, 0],
          ["Oktober", { f: "COUNTA(Belegungen!E20:E23)" }, 2, 2, { f: "SUM(Belegungen!M20:M23)" }, { f: "SUM(Belegungen!L20:L23)" }, 0],
          ["November", { f: "COUNTA(Belegungen!E24:E25)" }, 1, 1, { f: "SUM(Belegungen!M24:M25)" }, { f: "SUM(Belegungen!L24:L25)" }, 0],
          ["Dezember", { f: "COUNTA(Belegungen!E26:E29)" }, 2, 2, { f: "SUM(Belegungen!M26:M29)" }, { f: "SUM(Belegungen!L26:L29)" }, 0],
          {
            total: true,
            cells: [
              "Summe",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "SUM(F{first}:F{last})" },
              { f: "SUM(G{first}:G{last})" },
            ],
          },
        ],
        notes: [
          "Juli und August bis einschließlich 08.08. abgerechnet; ab 15.08. erwartete Einnahmen.",
          "Zum Vergleich 2. Halbjahr 2025 (alte Ordnung): 31 Einträge, davon 22 private Feiern, 6 Beschwerden.",
        ],
      },
    ],
  },
  {
    type: "word",
    id: "bh-feuerwehrbedarfsplan-2025-2030",
    title: "Feuerwehrbedarfsplan 2025–2030 der Gemeinde Brackenhain",
    kind: "Feuerwehrbedarfsplan",
    fileName: "GR-2025-021 Feuerwehrbedarfsplan 2025-2030 Entwurf",
    org: "brackenhain",
    unit: "bh-feuerwehr",
    author: "bh-thiele",
    date: "2025-03-14",
    tags: ["zahlen"],
    keywords: ["Tagesverfügbarkeit", "Erreichungsgrad", "LF 8/6", "HLF 10", "DIN 14092", "Kleinbracken"],
    summary:
      "Fortschreibung des Feuerwehrbedarfsplans: Gefahrenanalyse, Schutzziel, Personal, Fahrzeuge, Gerätehäuser, Einsatzstatistik und ein Maßnahmenplan mit Kosten bis 2030. Kernprobleme sind die Tagesverfügbarkeit, das 32 Jahre alte LF 8/6 und das Gerätehaus Heidhof.",
    meta: [
      ["Vorlage-Nr.", "GR/2025/021"],
      ["Aktenzeichen", "131.10-FwBP"],
      ["Status", "Entwurf zur Beschlussfassung im Gemeinderat am 07.04.2025"],
    ],
    subject: "Feuerwehrbedarfsplan der Gemeinde Brackenhain – Fortschreibung für die Jahre 2025 bis 2030",
    blocks: [
      { t: "h1", text: "1. Anlass und Rechtsgrundlagen" },
      {
        t: "p",
        text: "Nach dem Brandschutz- und Hilfeleistungsgesetz (BrSchG) hat die Gemeinde eine den örtlichen Verhältnissen entsprechende leistungsfähige Feuerwehr aufzustellen, auszurüsten und zu unterhalten. Grundlage dafür ist ein Feuerwehrbedarfsplan, der mindestens alle fünf Jahre fortzuschreiben ist. Der letzte Bedarfsplan wurde am 23.03.2020 beschlossen. Seitdem haben sich die Einsatzzahlen erhöht, die Tagesverfügbarkeit hat sich verschlechtert und das Löschgruppenfahrzeug der Ortswehr Heidhof hat das Ende seiner Nutzungsdauer erreicht.",
      },
      {
        t: "p",
        text: "Der Plan wurde von der Gemeindewehrführung gemeinsam mit dem Ordnungsamt erarbeitet, im Gemeindefeuerwehrausschuss am 26.02.2025 beraten und mit dem Kreisbrandmeister des Landkreises Altmoorland abgestimmt. Er beschreibt das Schutzziel, vergleicht es mit dem Ist-Zustand und leitet daraus Maßnahmen ab.",
      },
      { t: "h1", text: "2. Gemeindestruktur und Gefahrenanalyse" },
      {
        t: "table",
        header: ["Ortsteil", "Einwohner (31.12.2024)", "Fläche", "Prägung"],
        rows: [
          ["Brackenhain", "4.620", "18,9 km²", "Ortskern mit Schule, Kindergarten, Seniorenwohnanlage, Gewerbegebiet Nord"],
          ["Heidhof", "1.410", "17,2 km²", "Dorf mit landwirtschaftlichen Betrieben, Moor- und Waldflächen"],
          ["Kleinbracken", "810", "12,5 km²", "Streusiedlung, Biogasanlage, Hofstellen"],
          ["Gemeinde gesamt", "6.840", "48,6 km²", ""],
        ],
        widths: [2, 2, 1, 5],
      },
      {
        t: "p",
        text: "Durch das Gemeindegebiet führen die Kreisstraße 12 (Heidhofer Straße) und die Landesstraße 117 mit erheblichem Durchgangs- und landwirtschaftlichem Verkehr. Besondere Objekte mit erhöhtem Gefahrenpotenzial sind:",
      },
      {
        t: "ul",
        items: [
          "Grundschule Brackenhain (rund 230 Personen) und Gemeindekindergarten „Lindenhof“ (82 Kinder)",
          "Seniorenwohnanlage Am Kirchberg mit 24 Wohnungen, teils mit Bewohnerinnen und Bewohnern mit eingeschränkter Mobilität",
          "Dorfgemeinschaftshaus Lindenweg (Veranstaltungen bis 120 Personen)",
          "Biogasanlage Kleinbracken (Gefahrstoffe, Explosionsgefahr, Gärrestlager)",
          "Gewerbegebiet Nord mit Tischlerei, Landtechnikhandel und Lagerhallen",
          "31 landwirtschaftliche Betriebe, davon 8 mit Großviehhaltung; Strohlager und Maschinenhallen",
          "rund 640 ha Moor- und Waldflächen mit Flächenbrandgefahr in Trockenperioden",
        ],
      },
      {
        t: "p",
        text: "Nach der Einstufung des Landes ergeben sich für den Kernort die Risikoklassen B2 (Brand) und TH2 (Technische Hilfe), für Heidhof und Kleinbracken B1 und TH1; für die Biogasanlage gilt zusätzlich ABC1.",
      },
      { t: "h1", text: "3. Schutzziel" },
      {
        t: "p",
        text: "Der Gemeinderat legt folgendes Schutzziel fest (unverändert gegenüber 2020):",
      },
      {
        t: "ol",
        items: [
          "Die erste Einheit mit mindestens **6 Funktionen** (Staffel) trifft innerhalb von **10 Minuten** nach der Alarmierung an der Einsatzstelle ein.",
          "Innerhalb von **15 Minuten** nach der Alarmierung stehen mindestens **9 Funktionen** (Gruppe) zur Verfügung, davon mindestens vier Atemschutzgeräteträgerinnen und -träger.",
          "Beide Werte sollen bei mindestens **80 %** der Einsätze erreicht werden (Erreichungsgrad).",
        ],
      },
      { t: "h1", text: "4. Ist-Analyse" },
      { t: "h2", text: "4.1 Organisation" },
      {
        t: "p",
        text: "Die Freiwillige Feuerwehr Brackenhain besteht aus den Ortswehren Brackenhain (Stützpunktfeuerwehr) und Heidhof (Grundausstattung). Der Ortsteil Kleinbracken hat keine eigene Ortswehr; er wird von Heidhof (3,1 km Anfahrt) und Brackenhain (4,2 km) aus versorgt. Dazu kommen eine Jugendfeuerwehr, seit 2023 eine Kinderfeuerwehr und die Ehrenabteilung.",
      },
      { t: "h2", text: "4.2 Personal" },
      {
        t: "table",
        header: ["Funktion", "Ortswehr Brackenhain", "Ortswehr Heidhof", "Gesamt"],
        rows: [
          ["Aktive Mitglieder", "37", "21", "58"],
          ["davon Frauen", "6", "3", "9"],
          ["Atemschutzgeräteträger/innen", "16", "8", "24"],
          ["Maschinisten/innen", "12", "6", "18"],
          ["Gruppenführer/innen", "6", "3", "9"],
          ["Zugführer/innen", "2", "1", "3"],
          ["tagsüber verfügbar (Mo–Fr, 6–18 Uhr)", "11", "6", "17"],
          ["davon Atemschutzgeräteträger/innen", "4", "2", "6"],
        ],
        widths: [4, 2, 2, 2],
      },
      {
        t: "table",
        header: ["Altersgruppe", "16–29", "30–39", "40–49", "50–59", "60–67", "Summe"],
        rows: [["Aktive", "19", "14", "12", "9", "4", "58"]],
      },
      {
        t: "p",
        text: "Die Mitgliederzahl ist seit 2020 (61 Aktive) leicht gesunken. 13 Aktive sind 50 Jahre und älter und scheiden in den nächsten zehn bis fünfzehn Jahren altersbedingt aus. Die Jugendfeuerwehr hat 24 Mitglieder (Brackenhain 16, Heidhof 8); von 2020 bis 2024 sind 11 Jugendliche in die Einsatzabteilung übergetreten. Die Kinderfeuerwehr zählt 14 Kinder, die Ehrenabteilung 19 Mitglieder.",
      },
      {
        t: "p",
        text: "**Kritisch ist die Tagesverfügbarkeit:** Werktags zwischen 6 und 18 Uhr stehen rechnerisch nur 17 Einsatzkräfte zur Verfügung, davon 6 mit Atemschutz. Die meisten Aktiven arbeiten außerhalb der Gemeinde. Von den neun Beschäftigten des Bauhofs gehören fünf der Feuerwehr an; sie sind die wichtigste Stütze am Tag.",
      },
      { t: "h2", text: "4.3 Fahrzeuge" },
      {
        t: "table",
        header: ["Ortswehr", "Fahrzeug", "Baujahr", "Besatzung", "Bewertung"],
        rows: [
          ["Brackenhain", "Hilfeleistungslöschgruppenfahrzeug HLF 20", "2012", "1/8", "gut, Nutzung bis etwa 2037"],
          ["Brackenhain", "Tanklöschfahrzeug TLF 3000", "2019", "1/2", "sehr gut"],
          ["Brackenhain", "Mannschaftstransportwagen MTW", "2008", "1/8", "Korrosion, Ersatz bis 2027"],
          ["Heidhof", "Löschgruppenfahrzeug LF 8/6", "1993", "1/8", "überaltert, Mängel bei der Hauptuntersuchung 2024, Ersatzteile kaum erhältlich"],
          ["Heidhof", "Mannschaftstransportwagen MTW", "2015", "1/8", "gut"],
        ],
        widths: [2, 4, 1, 1, 4],
      },
      {
        t: "p",
        text: "Das LF 8/6 der Ortswehr Heidhof ist 32 Jahre alt. Die übliche Nutzungsdauer von Löschfahrzeugen liegt bei 20 bis 25 Jahren. Es soll durch ein Hilfeleistungslöschgruppenfahrzeug HLF 10 ersetzt werden, das auch für technische Hilfe bei Verkehrsunfällen auf der Kreisstraße 12 ausgerüstet ist.",
      },
      { t: "h2", text: "4.4 Feuerwehrhäuser" },
      {
        t: "ul",
        items: [
          "**Brackenhain, Lindenstraße 40** (Baujahr 1998, erweitert 2014): vier Stellplätze, getrennte Umkleiden, Abgasabsaugung. Der Zustand ist gut; Stellplatzreserve für ein weiteres Fahrzeug ist nicht vorhanden.",
          "**Heidhof, Dorfstraße 11** (Baujahr 1972): zwei Stellplätze mit 8,50 m Länge und 3,20 m Torbreite. Nach DIN 14092 sind für ein HLF 10 mindestens 10,00 m Länge und 3,50 m Torbreite erforderlich. Umkleiden befinden sich in der Fahrzeughalle, eine Abgasabsaugung fehlt, getrennte Sanitärräume für Frauen gibt es nicht. Die Begehung durch die Unfallkasse im Jahr 2023 hat diese Mängel festgestellt. Im Februar 2025 wurde zudem das Dach durch einen Sturm beschädigt; die Reparatur läuft über die Gebäudeversicherung.",
        ],
      },
      { t: "h2", text: "4.5 Einsatzgeschehen" },
      {
        t: "table",
        header: ["Jahr", "Brände", "Technische Hilfe", "Fehlalarme und Sonstiges", "Einsätze gesamt"],
        rows: [
          ["2020", "18", "31", "12", "61"],
          ["2021", "15", "45", "14", "74"],
          ["2022", "29", "44", "15", "88"],
          ["2023", "16", "38", "15", "69"],
          ["2024", "19", "45", "15", "79"],
        ],
      },
      {
        t: "p",
        text: "Der Anstieg 2021 geht auf Unwettereinsätze zurück, 2022 auf Flächen- und Vegetationsbrände in der Trockenperiode. 2024 verteilten sich die Einsätze auf Brackenhain (41), Heidhof (17), Kleinbracken (12) und Einsätze außerhalb des Gemeindegebiets (9). Knapp die Hälfte der Einsätze fiel in die Zeit werktags zwischen 6 und 18 Uhr.",
      },
      { t: "h2", text: "4.6 Erreichungsgrad 2022 bis 2024" },
      {
        t: "p",
        text: "Ausgewertet wurden 196 Einsätze mit vollständiger Zeitdokumentation der Leitstelle des Landkreises.",
      },
      {
        t: "table",
        header: ["Einsatzort", "Staffel in 10 Minuten", "Gruppe in 15 Minuten", "Bewertung"],
        rows: [
          ["Brackenhain", "86 %", "81 %", "Schutzziel erreicht"],
          ["Heidhof", "74 %", "70 %", "knapp verfehlt"],
          ["Kleinbracken", "58 %", "55 %", "deutlich verfehlt"],
          ["alle Ortsteile, werktags 6–18 Uhr", "63 %", "52 %", "deutlich verfehlt"],
          ["Gemeinde gesamt", "77 %", "72 %", "verfehlt"],
        ],
        widths: [3, 2, 2, 2],
      },
      { t: "h1", text: "5. Bewertung" },
      {
        t: "p",
        text: "Das Schutzziel wird im Kernort erreicht, in Heidhof knapp und in Kleinbracken deutlich verfehlt. Am Tag ist die Feuerwehr in allen Ortsteilen nur eingeschränkt einsatzbereit. Die wesentlichen Defizite sind:",
      },
      {
        t: "ol",
        items: [
          "zu geringe Tagesverfügbarkeit, insbesondere bei Atemschutzgeräteträgerinnen und -trägern",
          "überaltertes Löschfahrzeug der Ortswehr Heidhof",
          "Gerätehaus Heidhof entspricht nicht der DIN 14092 und den Vorgaben der Unfallkasse",
          "lange Anfahrt nach Kleinbracken und ungünstige Alarmierungsreihenfolge",
          "veralteter Mannschaftstransportwagen der Ortswehr Brackenhain",
          "Löschwasserversorgung in Kleinbracken (Löschwasserteich verschlammt, zwei Hydranten mit zu geringer Leistung)",
        ],
      },
      { t: "h1", text: "6. Maßnahmen" },
      {
        t: "table",
        header: ["Nr.", "Maßnahme", "Zeitraum", "Kosten (brutto)"],
        rows: [
          ["M1", "Ersatz des LF 8/6 durch ein HLF 10 (Ortswehr Heidhof); Zuwendung des Landkreises rund 120.000 €", "Ausschreibung 2026, Lieferung bis 2027", "520.000 €"],
          ["M2", "Gerätehaus Heidhof: Torumbau und Verlängerung eines Stellplatzes für das HLF 10, mobile Abgasabsaugung", "2026", "60.000 €"],
          ["M3", "Machbarkeitsstudie Gerätehaus Heidhof (Neubau oder gemeinsamer Standort mit Kleinbracken)", "2027", "15.000 €"],
          ["M4", "Ersatz des MTW der Ortswehr Brackenhain", "2027", "75.000 €"],
          ["M5", "Löschwasserteich Kleinbracken entschlammen, zwei Hydranten ertüchtigen", "2027", "40.000 €"],
          ["M6", "Tagesverfügbarkeit: Freistellungsvereinbarung für Gemeindebeschäftigte, Doppelmitgliedschaften, Werbekampagne", "ab 2025", "3.000 € jährlich"],
          ["M7", "Alarm- und Ausrückeordnung: Kleinbracken immer mit beiden Ortswehren alarmieren", "2025", "keine"],
          ["M8", "Atemschutz: sechs weitere Geräteträgerinnen und -träger ausbilden, davon mindestens drei tagsüber verfügbar", "2025–2027", "4.500 €"],
        ],
        widths: [1, 6, 2, 2],
      },
      { t: "h2", text: "6.1 Erläuterungen" },
      {
        t: "p",
        text: "**M1 – HLF 10:** Das Fahrzeug wird nach DIN EN 1846 und der aktuellen Normreihe für Löschfahrzeuge beschafft. Wegen langer Lieferzeiten soll die Ausschreibung nach Genehmigung des Haushalts 2026 erfolgen. Eine gemeinsame Beschaffung mit anderen Gemeinden des Landkreises wurde geprüft; derzeit plant keine Gemeinde ein vergleichbares Fahrzeug.",
      },
      {
        t: "p",
        text: "**M2 und M3 – Gerätehaus Heidhof:** Ein Neubau nach DIN 14092 würde nach einer ersten Schätzung rund 1,6 Mio. € kosten und ist im Finanzplan bis 2029 nicht darstellbar. Deshalb wird das bestehende Haus für das neue Fahrzeug angepasst. Die Machbarkeitsstudie soll klären, ob ein gemeinsamer Standort für Heidhof und Kleinbracken die Eintreffzeiten in Kleinbracken verbessert.",
      },
      {
        t: "p",
        text: "**M6 – Tagesverfügbarkeit:** Gemeindebeschäftigte, die der Feuerwehr angehören, werden für Einsätze während der Arbeitszeit grundsätzlich freigestellt. Bei Neueinstellungen im Bauhof wird die Bereitschaft zur Mitwirkung in der Feuerwehr bei gleicher Eignung berücksichtigt. Mit den Betrieben im Gewerbegebiet Nord werden Gespräche über Freistellungen geführt. Einsatzkräfte, die in Brackenhain arbeiten, aber anderswo wohnen, sollen als Doppelmitglieder gewonnen werden.",
      },
      {
        t: "p",
        text: "**M7 – Alarmierung:** Die Leitstelle des Landkreises alarmiert für Einsätze in Kleinbracken künftig beide Ortswehren gleichzeitig. Dadurch verkürzt sich nach einer Probeauswertung die Zeit bis zum Eintreffen einer Gruppe um durchschnittlich zwei Minuten.",
      },
      { t: "h1", text: "7. Finanzielle Auswirkungen" },
      {
        t: "table",
        header: ["Jahr", "Investitionen", "laufende Mehrkosten", "Bemerkung"],
        rows: [
          ["2025", "–", "4.500 €", "M6, M8"],
          ["2026", "580.000 €", "4.500 €", "M1, M2, M6, M8"],
          ["2027", "130.000 €", "4.500 €", "M3 bis M5, M6, M8"],
          ["2028–2030", "offen", "3.000 € jährlich", "Ergebnis der Machbarkeitsstudie"],
        ],
        widths: [2, 2, 2, 4],
      },
      {
        t: "p",
        text: "Die laufenden Aufwendungen für die Feuerwehr betragen nach dem Haushalt 2025 rund 340.000 € im Jahr (Unterhaltung von Fahrzeugen und Gebäuden, Ausrüstung, Aufwandsentschädigungen, Versicherungen). Die Abschreibung des HLF 10 erhöht den Ergebnishaushalt ab 2027 um rund 26.000 € jährlich.",
      },
      { t: "h1", text: "8. Beteiligung und Fortschreibung" },
      {
        t: "ul",
        items: [
          "Gemeindefeuerwehrausschuss: Beratung am 26.02.2025, einstimmige Zustimmung",
          "Kreisbrandmeister des Landkreises Altmoorland: Stellungnahme vom 05.03.2025; Zustimmung mit dem Hinweis, die Tagesverfügbarkeit jährlich auszuwerten",
          "Ausschuss für Ordnung und Feuerwehr: Vorberatung am 24.03.2025",
          "Gemeinderat: Beschlussfassung am 07.04.2025",
        ],
      },
      {
        t: "p",
        text: "Die Gemeindewehrführung berichtet dem Ausschuss für Ordnung und Feuerwehr jährlich über den Erreichungsgrad und die Tagesverfügbarkeit. Die nächste vollständige Fortschreibung ist für 2030 vorgesehen.",
      },
      { t: "signature", lines: ["Brackenhain, 14.03.2025", "Marco Thiele, Gemeindewehrführer", "Frank Ruhnau, Bürgermeister"] },
    ],
  },
  {
    type: "powerpoint",
    id: "bh-praesentation-kita-erweiterung-lindenhof",
    title: "Erweiterung des Gemeindekindergartens „Lindenhof“ – Präsentation im Gemeinderat",
    kind: "Präsentation",
    fileName: "Praesentation Erweiterung Kindergarten Lindenhof Gemeinderat 2025-03-03",
    org: "brackenhain",
    unit: "bh-kita",
    author: "bh-vogt",
    date: "2025-02-24",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Warteliste", "Variante A", "Kita-Ausbau 2026", "2.150.000 €", "Folgekosten"],
    summary:
      "Präsentation zur Erweiterung des Gemeindekindergartens um eine Krippengruppe: Bedarf, Kinderzahlen, Varianten, Kosten, Förderung und Folgekosten. Eingebaute Widersprüche: Die Zusammenfassung nennt einen Eigenanteil von rund 1,2 Mio. € (statt 1.075.000 €) und eine Inbetriebnahme zum 01.08.2027 (statt März 2027).",
    slides: [
      {
        t: "title",
        title: "Erweiterung des Gemeindekindergartens „Lindenhof“",
        subtitle: "Bedarf, Varianten und Kosten – Sitzung des Gemeinderats am 3. März 2025",
      },
      {
        t: "bullets",
        title: "Ausgangslage",
        bullets: [
          { text: "Vier Gruppen mit **82 Plätzen**", sub: ["eine Krippengruppe: 12 Plätze", "drei Elementargruppen: 70 Plätze"] },
          "Seit August 2023 durchgehend voll belegt",
          "Warteliste: **19 Kinder**, davon 11 unter drei Jahren",
          "Rechtsanspruch auf einen Platz ab dem ersten Geburtstag (§ 24 SGB VIII)",
          "19 Beschäftigte mit 15,9 Vollzeitstellen, Öffnungszeit 7:00 bis 16:30 Uhr",
        ],
        notes:
          "Fünf Familien haben ihren Rechtsanspruch bereits schriftlich geltend gemacht. Wenn wir keinen Platz anbieten, drohen Klagen und Kostenerstattungen für selbst beschaffte Plätze.",
      },
      {
        t: "chart",
        title: "Kinder unter sechs Jahren in der Gemeinde",
        chart: {
          type: "line",
          categories: ["2020", "2021", "2022", "2023", "2024", "2025 P", "2026 P", "2027 P", "2028 P"],
          series: [
            { name: "unter 3 Jahre", values: [168, 172, 181, 186, 194, 201, 209, 214, 216] },
            { name: "3 bis unter 6 Jahre", values: [201, 205, 208, 216, 219, 224, 231, 238, 240] },
          ],
          unit: "Kinder",
        },
        caption: "Quelle: Einwohnermeldedaten jeweils zum 31.12.; ab 2025 Prognose (P) einschließlich Baugebiet „Am Mühlenfeld“",
        notes: "Im Baugebiet Am Mühlenfeld sind 46 Bauplätze verkauft, 31 Häuser bezogen. Fast alle Käufer sind junge Familien.",
      },
      {
        t: "table",
        title: "Warteliste zum Kindergartenjahr 2025/26 (Stand 15.02.2025)",
        header: ["Altersgruppe", "Anmeldungen", "Rechtsanspruch geltend gemacht", "frei werdende Plätze", "ungedeckt"],
        rows: [
          ["unter 3 Jahre", "16", "5", "5", "11"],
          ["3 bis 6 Jahre", "13", "2", "5", "8"],
          ["gesamt", "29", "7", "10", "19"],
        ],
        notes: "Auch die Kita-Bedarfsplanung des Landkreises sieht für Brackenhain bis 2027 zusätzlichen Bedarf an Krippenplätzen.",
      },
      {
        t: "table",
        title: "Geprüfte Varianten",
        header: ["Variante", "zusätzliche Plätze", "Kosten", "verfügbar ab", "Bewertung"],
        rows: [
          ["A: Anbau einer Krippengruppe am Lindenhof", "12", "2.150.000 €", "03/2027", "empfohlen, förderfähig"],
          ["B: Containeranlage (Miete für fünf Jahre)", "12", "640.000 €", "09/2025", "nur Übergang, nicht förderfähig"],
          ["C: zwei Großtagespflegestellen", "10", "85.000 € jährlich", "2025", "deckt den Bedarf nicht"],
        ],
        notes: "Variante B wäre schnell, aber nach fünf Jahren stehen wir ohne Gebäude da. Die Mietkosten sind nicht förderfähig.",
      },
      {
        t: "bullets",
        title: "Variante A im Detail",
        bullets: [
          "Eingeschossiger Anbau an der Nordseite mit rund 230 m² Bruttogrundfläche",
          "Gruppenraum, Schlafraum, Wickel- und Sanitärbereich, zusätzlicher Personalraum",
          "Barrierefrei, Effizienzhaus-Standard, Anschluss an die bestehende Heizung",
          "Eigener Krippenspielbereich im Garten (rund 300 m²)",
          "Betrieb während der Bauzeit möglich, Lärmphasen in den Ferien",
        ],
      },
      {
        t: "table",
        title: "Kosten und Finanzierung (Variante A)",
        header: ["Position", "Betrag"],
        rows: [
          ["Planung und Gutachten", "320.000 €"],
          ["Baukosten", "1.540.000 €"],
          ["Ausstattung", "120.000 €"],
          ["Außenanlagen", "170.000 €"],
          ["Gesamtkosten", "2.150.000 €"],
          ["Förderung Landesprogramm „Kita-Ausbau 2026“ (50 %)", "1.075.000 €"],
          ["Eigenanteil der Gemeinde", "1.075.000 €"],
        ],
        notes: "Die Förderquote von 50 % gilt für die förderfähigen Kosten. Nach Auskunft des Landesjugendamts sind alle Positionen förderfähig, auch die Planung.",
      },
      {
        t: "chart",
        title: "Auszahlungen und Förderung nach Jahren",
        chart: {
          type: "bar",
          categories: ["2025", "2026", "2027"],
          series: [
            { name: "Auszahlungen", values: [320, 1380, 450] },
            { name: "Förderung", values: [0, 690, 385] },
          ],
          unit: "Tsd. €",
        },
        caption: "Förderung wird nach Baufortschritt ausgezahlt",
      },
      {
        t: "bullets",
        title: "Folgekosten ab 2027 (jährlich)",
        bullets: [
          "Personal: 3,2 zusätzliche Vollzeitstellen Erzieherin/Erzieher, rund 214.000 €",
          "Sachkosten und Bewirtschaftung: rund 22.000 €",
          "Abschreibung: rund 54.000 €, davon durch Auflösung der Fördermittel gedeckt: rund 27.000 €",
          "Mehrerträge: Landeszuweisungen rund 96.000 €, Elternbeiträge rund 38.000 €",
          "**Netto-Belastung des Haushalts: rund 129.000 € jährlich**",
        ],
        notes: "Die Personalgewinnung ist das größte Risiko. Wir haben schon jetzt Mühe, Vertretungen zu finden.",
      },
      {
        t: "bullets",
        title: "Zusammenfassung und Beschlussvorschlag",
        bullets: [
          "Der Bedarf an Krippenplätzen ist belegt und steigt weiter",
          "Variante A ist die einzige dauerhafte und förderfähige Lösung",
          "Gesamtkosten 2.150.000 €, Eigenanteil der Gemeinde rund 1,2 Mio. €, finanziert über Kredite",
          "Inbetriebnahme der fünften Gruppe zum 01.08.2027",
          { text: "Beschlussvorschlag:", sub: ["Umsetzung der Variante A", "Förderantrag bis 30.06.2025", "Vergabe der Planungsleistungen, überplanmäßige Bereitstellung von 320.000 € im Jahr 2025"] },
        ],
        notes: "Bitte die Zahlen zum Eigenanteil vor der Sitzung noch einmal mit Frau Schnoor abgleichen.",
      },
      { t: "end", title: "Vielen Dank für Ihre Aufmerksamkeit", lines: ["Sabrina Vogt · Leiterin Gemeindekindergarten „Lindenhof“", "Telefon 040 66969-615"] },
    ],
  },
  {
    type: "excel",
    id: "bh-kalkulation-friedhofsgebuehren-2026-2028",
    title: "Gebührenkalkulation Friedhöfe für den Kalkulationszeitraum 2026–2028",
    kind: "Gebührenkalkulation",
    fileName: "Kalkulation Friedhofsgebuehren 2026-2028 Stand 2025-06-11",
    org: "brackenhain",
    unit: "bh-kasse",
    author: "bh-wilkens",
    date: "2025-06-11",
    tags: ["zahlen"],
    keywords: ["Kostendeckungsgrad", "Ansatzfähige Kosten", "Baumbestattung", "Kalkulationszeitraum", "öffentliches Grün"],
    summary:
      "Kalkulation der Friedhofsgebühren nach KAG: ansatzfähige Kosten, Gebühren alt und neu je Grabart mit Erlösen, Kostendeckungsgrad (69 % auf 85 %) und Fallzahlen 2020–2024. Gut zum Nachrechnen und für eine verständliche Erklärung an Bürgerinnen und Bürger.",
    sheets: [
      {
        name: "Kosten",
        title: "Ansatzfähige Kosten der Friedhöfe Brackenhain und Heidhof",
        subtitle: "Durchschnitt je Jahr im Kalkulationszeitraum 2026–2028 · Beträge in Euro",
        columns: [
          { header: "Nr.", width: 5 },
          { header: "Kostenart", width: 44 },
          { header: "Betrag je Jahr", width: 15, fmt: "eur0" },
          { header: "Grundlage", width: 48 },
        ],
        rows: [
          ["1", "Personalaufwand Bauhof (Friedhofspflege)", 44800, "0,9 Vollzeitstellen, Durchschnittssatz Bauhof"],
          ["2", "Fremdleistungen Grabaushub und -schließung", 21400, "Rahmenvertrag mit örtlichem Bestattungsunternehmen"],
          ["3", "Unterhaltung Wege, Hecken und Bäume", 15600, "Planwerte, Baumkontrolle einmal jährlich"],
          ["4", "Wasser, Strom, Abfallentsorgung", 8200, "Ist 2024 zuzüglich 5 %"],
          ["5", "Unterhaltung Kapelle Brackenhain und Trauerhalle Heidhof", 9400, "einschließlich Reinigung"],
          ["6", "Verwaltungskostenbeitrag", 9800, "Friedhofsverwaltung im Bürgerbüro und Kämmerei"],
          ["7", "Kalkulatorische Abschreibungen", 12600, "Anlagenbuchhaltung, ohne Sonderposten"],
          ["8", "Kalkulatorische Zinsen (3,0 % auf Restbuchwerte von 248.000 €)", { f: "ROUND(248000*0.03,0)" }, "Zinssatz nach Beschluss des Gemeinderats"],
          { total: true, cells: ["", "Summe Kosten", { f: "SUM(C5:C12)" }, ""] },
          ["9", "abzüglich Anteil öffentliches Grün (25 % von Nr. 1 und 3)", { f: "-ROUND((C5+C7)*0.25,0)" }, "Friedhöfe dienen auch als öffentliche Grünanlage"],
          ["10", "abzüglich sonstige Erträge (Genehmigungen für Grabmale)", -1200, "Ist-Durchschnitt 2022–2024"],
          { total: true, cells: ["", "Ansatzfähige Kosten", { f: "C13+C14+C15" }, ""] },
        ],
        notes: ["Kalkulationszeitraum nach § 6 KAG: drei Jahre. Kostenüberdeckungen sind innerhalb von vier Jahren auszugleichen."],
      },
      {
        name: "Gebühren",
        title: "Gebühren bisher und neu mit Erlösen",
        subtitle: "Fallzahlen: Durchschnitt der Prognose 2026–2028 · letzte Gebührenanpassung zum 01.01.2017",
        columns: [
          { header: "Nr.", width: 5 },
          { header: "Leistung", width: 42 },
          { header: "Fälle je Jahr", width: 10, fmt: "int" },
          { header: "Gebühr bisher", width: 12, fmt: "eur0" },
          { header: "Erlös bisher", width: 13, fmt: "eur0" },
          { header: "Gebühr neu", width: 12, fmt: "eur0" },
          { header: "Erlös neu", width: 13, fmt: "eur0" },
          { header: "Veränderung", width: 12, fmt: "pct" },
        ],
        rows: [
          ["1", "Reihengrab Erdbestattung (25 Jahre)", 5, 1080, { f: "C{r}*D{r}" }, 1340, { f: "C{r}*F{r}" }, { f: "(F{r}-D{r})/D{r}" }],
          ["2", "Wahlgrab Erdbestattung, je Grabstelle (25 Jahre)", 10, 1520, { f: "C{r}*D{r}" }, 1950, { f: "C{r}*F{r}" }, { f: "(F{r}-D{r})/D{r}" }],
          ["3", "Urnenreihengrab (20 Jahre)", 8, 560, { f: "C{r}*D{r}" }, 680, { f: "C{r}*F{r}" }, { f: "(F{r}-D{r})/D{r}" }],
          ["4", "Urnenwahlgrab, je Stelle (20 Jahre)", 12, 820, { f: "C{r}*D{r}" }, 990, { f: "C{r}*F{r}" }, { f: "(F{r}-D{r})/D{r}" }],
          ["5", "Urnengemeinschaftsgrab mit Namensplatte (20 Jahre)", 14, 940, { f: "C{r}*D{r}" }, 1120, { f: "C{r}*F{r}" }, { f: "(F{r}-D{r})/D{r}" }],
          ["6", "Baumbestattung im Baumhain, Urne (20 Jahre) – neu", 6, 940, { f: "C{r}*D{r}" }, 1380, { f: "C{r}*F{r}" }, { f: "(F{r}-D{r})/D{r}" }],
          ["7", "Verlängerung Nutzungsrecht, je Jahr und Stelle", 35, 50, { f: "C{r}*D{r}" }, 60, { f: "C{r}*F{r}" }, { f: "(F{r}-D{r})/D{r}" }],
          ["8", "Ausheben und Schließen Erdgrab", 15, 720, { f: "C{r}*D{r}" }, 860, { f: "C{r}*F{r}" }, { f: "(F{r}-D{r})/D{r}" }],
          ["9", "Ausheben und Schließen Urnengrab", 40, 170, { f: "C{r}*D{r}" }, 195, { f: "C{r}*F{r}" }, { f: "(F{r}-D{r})/D{r}" }],
          ["10", "Benutzung Kapelle oder Trauerhalle", 26, 190, { f: "C{r}*D{r}" }, 220, { f: "C{r}*F{r}" }, { f: "(F{r}-D{r})/D{r}" }],
          { total: true, cells: ["", "Summe Erlöse", null, null, { f: "SUM(E{first}:E{last})" }, null, { f: "SUM(G{first}:G{last})" }, { f: "(G{r}-E{r})/E{r}" }] },
          { total: true, cells: ["", "Ansatzfähige Kosten (Blatt Kosten)", null, null, { f: "Kosten!C16" }, null, { f: "Kosten!C16" }, null] },
          { total: true, cells: ["", "Kostendeckungsgrad", null, null, { f: "E15/E16", fmt: "pct" }, null, { f: "G15/G16", fmt: "pct" }, null] },
          { total: true, cells: ["", "Mehrertrag je Jahr", null, null, null, null, { f: "G15-E15" }, null] },
        ],
        notes: [
          "Baumbestattungen wurden bisher als Urnengemeinschaftsgrab abgerechnet; ab 2026 eigene Gebühr für den neuen Baumhain auf dem Friedhof Brackenhain.",
          "Eine volle Kostendeckung wird wegen des Grünanteils nicht angestrebt (Vorgabe der Gemeindeleitung: rund 85 %).",
        ],
      },
      {
        name: "Fallzahlen",
        title: "Bestattungen auf den gemeindlichen Friedhöfen 2020–2024",
        columns: [
          { header: "Jahr", width: 8 },
          { header: "Erdbestattungen", width: 15, fmt: "int" },
          { header: "Urnenbestattungen", width: 16, fmt: "int" },
          { header: "davon Gemeinschaftsgrab", width: 16, fmt: "int" },
          { header: "Bestattungen gesamt", width: 15, fmt: "int" },
          { header: "Urnenanteil", width: 12, fmt: "pct" },
        ],
        rows: [
          ["2020", 21, 33, 9, { f: "B{r}+C{r}" }, { f: "C{r}/E{r}" }],
          ["2021", 19, 38, 11, { f: "B{r}+C{r}" }, { f: "C{r}/E{r}" }],
          ["2022", 17, 41, 12, { f: "B{r}+C{r}" }, { f: "C{r}/E{r}" }],
          ["2023", 16, 42, 14, { f: "B{r}+C{r}" }, { f: "C{r}/E{r}" }],
          ["2024", 14, 45, 15, { f: "B{r}+C{r}" }, { f: "C{r}/E{r}" }],
          {
            total: true,
            cells: ["Durchschnitt", { f: "ROUND(AVERAGE(B{first}:B{last}),1)", fmt: "dec" }, { f: "ROUND(AVERAGE(C{first}:C{last}),1)", fmt: "dec" }, { f: "ROUND(AVERAGE(D{first}:D{last}),1)", fmt: "dec" }, { f: "ROUND(AVERAGE(E{first}:E{last}),1)", fmt: "dec" }, { f: "C{r}/E{r}" }],
          },
        ],
        notes: ["Prognose 2026–2028: 15 Erdbestattungen und 40 Urnenbestattungen je Jahr (Trend zur Urne, Baumhain neu)."],
      },
    ],
  },
  {
    type: "word",
    id: "bh-bekanntmachung-sperrung-dorffest-2025",
    title: "Bekanntmachung: Straßensperrungen zum Dorffest 2025",
    kind: "Bekanntmachung",
    fileName: "Bekanntmachung Strassensperrung Dorffest 2025",
    org: "brackenhain",
    unit: "bh-ordnung",
    author: "bh-krull",
    date: "2025-08-06",
    keywords: ["Dorffestes 2025", "Lindenstraße", "§ 45 Abs. 1 StVO", "Umleitung", "Am Kirchberg"],
    summary:
      "Kurze amtliche Bekanntmachung über Vollsperrungen, Halteverbote, Umleitung und Busersatzhaltestelle zum Dorffest. Geeignet für Leichte Sprache, einen Social-Media-Post oder einen Aushang.",
    meta: [["Aktenzeichen", "32-123.4/2025"]],
    subject: "Sperrung der Lindenstraße und des Lindenwegs zum Dorffest vom 22. bis 24. August 2025",
    blocks: [
      {
        t: "p",
        text: "Anlässlich des Dorffestes 2025 hat die Straßenverkehrsbehörde des Landkreises Altmoorland auf Antrag der Gemeinde mit verkehrsrechtlicher Anordnung vom 30.07.2025 nach § 45 Abs. 1 StVO folgende Sperrungen angeordnet:",
      },
      {
        t: "table",
        header: ["Abschnitt", "Zeitraum", "Regelung"],
        rows: [
          ["Lindenstraße zwischen Kirchstraße und Lindenweg (Festplatz)", "Fr 22.08., 12:00 Uhr bis Mo 25.08., 06:00 Uhr", "Vollsperrung"],
          ["Lindenweg bis zum Dorfgemeinschaftshaus", "Sa 23.08., 10:00 Uhr bis So 24.08., 22:00 Uhr", "Vollsperrung, Anlieger frei"],
          ["Parkplatz am Rathaus", "Fr 22.08., 08:00 Uhr bis So 24.08., 20:00 Uhr", "absolutes Halteverbot"],
        ],
        widths: [4, 3, 2],
      },
      {
        t: "ul",
        items: [
          "**Umleitung** über Kirchstraße, Am Kirchberg und Heidhofer Straße; die Umleitung ist ausgeschildert.",
          "Die Haltestelle „Rathaus“ der Buslinie 640 wird an die Haltestelle „Am Kirchberg“ verlegt.",
          "Zufahrten für Feuerwehr und Rettungsdienst bleiben frei. Fahrzeuge im Halteverbot werden kostenpflichtig abgeschleppt.",
          "Musik im Festzelt endet am Freitag um 24:00 Uhr und am Samstag um 01:00 Uhr.",
        ],
      },
      {
        t: "p",
        text: "Wir bitten die Anwohnerinnen und Anwohner um Verständnis. Fragen beantwortet das Ordnungsamt, Telefon 040 66969-640, ordnungsamt@brackenhain.example.",
      },
      { t: "signature", lines: ["Brackenhain, 06.08.2025", "Frank Ruhnau", "Bürgermeister"] },
    ],
  },
  {
    type: "word",
    id: "bh-vermerk-ortstermin-moorweg",
    title: "Vermerk: Ortstermin zu Schäden am Heidhofer Moorweg",
    kind: "Vermerk",
    fileName: "2026-04-14 Vermerk Ortstermin Heidhofer Moorweg",
    org: "brackenhain",
    unit: "bh-bau",
    author: "bh-dettmer",
    date: "2026-04-14",
    tags: ["unstrukturiert", "personendaten"],
    keywords: ["Heidhofer Moorweg", "Spurrinnen", "Zeichen 262", "Durchlass DN 300", "Bruns"],
    summary:
      "Stichpunktartiger Vermerk über einen Ortstermin mit einem Landwirt zu Wegeschäden: Schadensbild, Aussagen des Landwirts, grobe Kostenschätzung und offene Punkte (fehlendes Verkehrszeichen, nicht dokumentierte Schadensmeldung).",
    meta: [["Aktenzeichen", "661.20-07"]],
    subject: "Ortstermin Heidhofer Moorweg, 1. Bauabschnitt – Schäden nach Güllefahrten",
    blocks: [
      { t: "p", text: "**Ortstermin Mo 13.04.2026, 14:00–15:10 Uhr**, Moorweg zwischen K 12 und Hof Bruns (Stat. 0+000 bis 0+620)" },
      {
        t: "ul",
        items: [
          "Teilnehmer: Hr. Ahlers (Bauhof), Unterzeichner, Hr. Hinrich Bruns (Landwirt, Moorweg 7, OT Heidhof, Tel. 040 66969-858), ab 14:30 Uhr sein Sohn Jannik",
          "Stat. 0+120 bis 0+260: Spurrinnen beidseitig bis 12 cm, Asphalt aufgebrochen (ca. 85 m²)",
          "Stat. 0+310 bis 0+480: Bankette beidseitig abgefahren, Fahrbahnrand abgebrochen, ca. 340 m",
          "Stat. 0+395: Durchlass DN 300 eingedrückt, Graben staut zurück, Wasser steht auf dem Weg",
          "ab 0+480: Altschäden (Netzrisse, Frostschlaglöcher)",
          "Zeichen 262 (12 t) an Einmündung K 12 fehlt!! Lt. Ahlers seit Sturm im Februar umgeknickt",
        ],
      },
      { t: "h3", text: "Aussagen Hr. Bruns" },
      {
        t: "ul",
        items: [
          "fährt seit März Gülle (Schlepper + 18-m³-Fass, ca. 32 t), zuletzt 08.04. bei Regen",
          "will Schlaglöcher im Januar telefonisch gemeldet haben – bei wem, weiß er nicht mehr; im Bauhof keine Notiz",
          "Lohnunternehmer und Biogas-Lkw fahren dort auch",
          "braucht den Weg ab ca. 10.05. für die Silage, sonst 6 km Umweg durch die Ortslage Heidhof",
          "lehnt Kostenbeteiligung ab, will Fotos haben (→ nur nach Rücksprache BGM)",
        ],
      },
      {
        t: "table",
        header: ["Kostenschätzung (grob)", "Menge", "Kosten"],
        rows: [
          ["provisorisch: Spurrinnen mit Kaltmischgut, Bankette anfüllen", "85 m² / 340 m", "6.800 €"],
          ["Durchlass DN 300 erneuern", "1 Stück", "3.900 €"],
          ["grundhaft 0+120 bis 0+480 (Asphaltdecke, Schotterrasenbankette)", "ca. 1.080 m²", "38.500 €"],
        ],
        widths: [5, 2, 1],
      },
      { t: "h3", text: "To do" },
      {
        t: "ol",
        items: [
          "Zeichen 262 sofort ersetzen (Bauhof, bis 15.04.)",
          "Provisorium + Durchlass bis 08.05. (vor Silage), Mittel Unterhaltung Wirtschaftswege (noch ca. 27.000 € frei)",
          "Kostenbeteiligung Bruns? Rechtslage prüfen, Entscheidung BGM",
          "Antwort an Hr. Bruns bis 21.04. (De.)",
        ],
      },
      { t: "signature", lines: ["De."] },
    ],
  },
  {
    type: "excel",
    id: "bh-winterdienst-nachweis-2025-26",
    title: "Einsatz- und Stundennachweis Winterdienst 2025/26",
    kind: "Einsatznachweis",
    fileName: "Winterdienst 2025-26 Einsaetze Stunden Streusalz Bauhof",
    org: "brackenhain",
    unit: "bh-bauhof",
    author: "bh-ahlers",
    date: "2026-03-09",
    tags: ["zahlen", "unstrukturiert"],
    keywords: ["Personenstunden", "Rufbereitschaft", "Streusalz", "Inventur", "Mühlenbach"],
    summary:
      "Einsatzliste des Bauhofs mit 28 Winterdiensteinsätzen, knappen Bemerkungen, Stunden je Mitarbeiter, Streusalzbilanz und Kostenübersicht. Die Salzbilanz geht nicht auf (rund 11 t Differenz zur Inventur) – gut zum Auswerten, Zusammenfassen und Ursachensuchen.",
    sheets: [
      {
        name: "Einsätze",
        title: "Winterdienst 2025/26 – Einsatznachweis Bauhof",
        subtitle: "Touren: A = Fahrbahnen Ortslage Brackenhain, B = Heidhof/Kleinbracken, C = Gehwege, Schulwege, Bushaltestellen (Hand)",
        columns: [
          { header: "Nr.", width: 5 },
          { header: "Datum", width: 11, fmt: "date" },
          { header: "Beginn", width: 8 },
          { header: "Ende", width: 8 },
          { header: "Tour", width: 8 },
          { header: "Fahrzeuge", width: 24 },
          { header: "Personal", width: 22 },
          { header: "Pers.", width: 6, fmt: "int" },
          { header: "Std.", width: 8, fmt: "hours" },
          { header: "Personenstunden", width: 13, fmt: "hours" },
          { header: "Salz t", width: 8, fmt: "dec" },
          { header: "Bemerkung", width: 60 },
        ],
        rows: [
          ...winterRows,
          {
            total: true,
            cells: [
              "Summe",
              null,
              "",
              "",
              "",
              "",
              "",
              { f: "SUM(H{first}:H{last})" },
              { f: "SUM(I{first}:I{last})" },
              { f: "SUM(J{first}:J{last})" },
              { f: "SUM(K{first}:K{last})" },
              "",
            ],
          },
        ],
        notes: ["Fzg. 3 = Unimog mit Streuautomat, Fzg. 5 = Traktor mit Schild und Streuer, Fzg. 7 = Kleintraktor, Hand = Handstreuung/Schneeschieber."],
      },
      {
        name: "Personal",
        title: "Stunden je Mitarbeiter",
        subtitle: "Einsatzstunden aus dem Einsatznachweis · Rufbereitschaft 17.11.2025 bis 08.03.2026 (16 Wochen, je Woche 2 Personen)",
        columns: [
          { header: "Kürzel", width: 8 },
          { header: "Name", width: 14 },
          { header: "Funktion", width: 18 },
          { header: "Einsätze", width: 10, fmt: "int" },
          { header: "Einsatzstunden", width: 14, fmt: "hours" },
          { header: "davon Beginn vor 5 Uhr", width: 14, fmt: "int" },
          { header: "Rufbereitschaft (Wochen)", width: 14, fmt: "int" },
          { header: "Pauschale Rufbereitschaft", width: 15, fmt: "eur0" },
        ],
        rows: [
          ...crewRows,
          {
            total: true,
            cells: ["Summe", "", "", null, { f: "SUM(E{first}:E{last})" }, null, { f: "SUM(G{first}:G{last})" }, { f: "SUM(H{first}:H{last})" }],
          },
          {
            total: true,
            cells: ["Abgleich", "mit Blatt Einsätze", "", null, { f: `E${5 + WINTER_CREW.length}-'Einsätze'!J${WINTER_LAST_ROW + 1}` }, null, null, null],
          },
        ],
        notes: ["Pauschale Rufbereitschaft 110 € je Woche nach Dienstvereinbarung Bauhof; Überstunden werden über das Arbeitszeitkonto abgegolten."],
      },
      {
        name: "Streumittel",
        title: "Streusalzbilanz 2025/26",
        columns: [
          { header: "Vorgang", width: 32 },
          { header: "Datum", width: 11, fmt: "date" },
          { header: "Menge in t", width: 11, fmt: "dec" },
          { header: "Betrag", width: 12, fmt: "eur0" },
          { header: "Bemerkung", width: 44 },
        ],
        rows: [
          ["Anfangsbestand", { date: "2025-11-01" }, 85, null, "Einlagerung Oktober 2025"],
          ["Lieferung", { date: "2025-12-18" }, 25, { f: "C{r}*118" }, "118 €/t"],
          ["Lieferung", { date: "2026-01-09" }, 50, { f: "C{r}*124" }, "Eilbestellung, 124 €/t"],
          ["Lieferung", { date: "2026-01-30" }, 25, { f: "C{r}*118" }, "118 €/t, Wiegeschein fehlt"],
          ["Verbrauch laut Einsatznachweis", null, { f: `-'Einsätze'!K${WINTER_LAST_ROW + 1}` }, null, ""],
          { total: true, cells: ["Rechnerischer Bestand", null, { f: "SUM(C5:C9)" }, null, "Lieferungen zusammen siehe Spalte Betrag"] },
          { total: true, cells: ["Bestand laut Inventur", { date: "2026-03-02" }, 19, null, "gezählt Ah/Kö"] },
          { total: true, cells: ["Differenz", null, { f: "C11-C10" }, null, "klären!"] },
        ],
        notes: [
          "Differenz ungeklärt. Mögliche Ursachen: Abgabe an Schule und Kindergarten für Handstreuung nicht aufgeschrieben, Lieferung vom 30.01. ohne Wiegeschein, Streumengen geschätzt.",
          "Bitte bis 20.03. klären – die Kämmerei braucht den Bestand für die Inventur.",
        ],
      },
      {
        name: "Kosten",
        title: "Kosten Winterdienst 2025/26",
        columns: [
          { header: "Position", width: 36 },
          { header: "Menge", width: 11, fmt: "dec" },
          { header: "Satz", width: 10, fmt: "eur" },
          { header: "Betrag", width: 13, fmt: "eur0" },
        ],
        rows: [
          ["Personenstunden", { f: `'Einsätze'!J${WINTER_LAST_ROW + 1}` }, 48.5, { f: "B{r}*C{r}" }],
          ["Fahrzeugstunden Unimog (Fzg. 3)", fahrzeugStunden("Fzg. 3"), 65, { f: "B{r}*C{r}" }],
          ["Fahrzeugstunden Traktor (Fzg. 5)", fahrzeugStunden("Fzg. 5"), 42, { f: "B{r}*C{r}" }],
          ["Fahrzeugstunden Kleintraktor (Fzg. 7)", fahrzeugStunden("Fzg. 7"), 28, { f: "B{r}*C{r}" }],
          ["Streusalz (Verbrauch in t)", { f: `'Einsätze'!K${WINTER_LAST_ROW + 1}` }, 118, { f: "B{r}*C{r}" }],
          ["Rufbereitschaft (Personenwochen)", { f: `Personal!G${5 + WINTER_CREW.length}` }, 110, { f: "B{r}*C{r}" }],
          { total: true, cells: ["Kosten gesamt", null, null, { f: "SUM(D{first}:D{last})" }] },
          { total: true, cells: ["Ansatz Winterdienst im Haushalt 2025/26", null, null, 48000] },
          { total: true, cells: ["verbleibend", null, null, { f: "D12-D11" }] },
        ],
        notes: ["Verrechnungssätze nach der Betriebsabrechnung Bauhof 2025. Einsätze im März sind noch nicht enthalten."],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "bh-neujahrsempfang-2026-jahresrueckblick",
    title: "Neujahrsempfang 2026 – Jahresrückblick des Bürgermeisters",
    kind: "Präsentation",
    fileName: "Neujahrsempfang 2026 Jahresrueckblick Buergermeister",
    org: "brackenhain",
    unit: "bh-bgm",
    author: "bh-ruhnau",
    date: "2026-01-16",
    keywords: ["Neujahrsempfang", "Abkochgebot", "412.000 €", "Haushaltssicherungskonzept", "Ehrenamt"],
    summary:
      "Kurze Präsentation des Bürgermeisters zum Neujahrsempfang: Rückblick auf 2025, Ehrenamt, Finanzen und Ausblick 2026. Die Sprechernotizen verraten, dass die Gewerbesteuer-Bescheide bewusst nicht angesprochen werden sollten – spannend im Vergleich mit der Ratsanfrage von Herrn Bremer.",
    slides: [
      { t: "title", title: "Neujahrsempfang 2026", subtitle: "Gemeinde Brackenhain · Dorfgemeinschaftshaus Lindenweg · 18. Januar 2026" },
      {
        t: "bullets",
        title: "Was uns 2025 bewegt hat",
        bullets: [
          "Feuerwehrbedarfsplan beschlossen – Heidhof bekommt ein neues Löschfahrzeug",
          "Förderbescheid über 1.075.000 € für die Erweiterung des Kindergartens",
          "Abkochgebot in Heidhof im Juli",
          "Neue Regeln für das Dorfgemeinschaftshaus seit 1. Januar",
          "Dorffest mit rund 2.400 Gästen",
        ],
        notes: "Beim Abkochgebot allen danken, die ältere Nachbarn informiert und Wasser vorbeigebracht haben. Kurz auf den Wasserverband verweisen, nicht auf Ursachen eingehen.",
      },
      {
        t: "bullets",
        title: "Ehrenamt trägt Brackenhain",
        bullets: ["58 Aktive in der Feuerwehr, 24 in der Jugendfeuerwehr", "mehr als 30 Vereine und Gruppen", "Seniorenkreis, Heimatverein, TuS, Landfrauen – danke!"],
        notes: "Hier die Ehrung für Gertrud Hinz (40 Jahre Seniorenkreis) einbauen.",
      },
      {
        t: "bullets",
        title: "Finanzen – ehrlich gesagt",
        bullets: ["Haushalt 2026: Fehlbetrag 412.000 €", "Kreisumlage steigt um 322.000 €", "Haushaltssicherungskonzept mit zwölf Maßnahmen", "Genehmigung beim Landkreis beantragt"],
        notes: "Botschaft: Wir haben unsere Finanzen im Griff, auch wenn es eng wird. Gewerbesteuer NICHT ansprechen – Bescheide sind da, aber noch nicht ausgewertet.",
      },
      {
        t: "bullets",
        title: "Was 2026 kommt",
        bullets: [
          "Glasfaser: Bürgerversammlung im Juni",
          "E-Akte im Rathaus ab Februar",
          "Ausschreibung des HLF 10 für Heidhof",
          "Entscheidung über die fünfte Kindergartengruppe",
          "Moorweg: 2. Bauabschnitt",
        ],
      },
      { t: "end", title: "Ein gutes und gesundes Jahr 2026!", lines: ["Frank Ruhnau, Bürgermeister"] },
    ],
  },
  {
    type: "powerpoint",
    id: "bh-buergerversammlung-breitband-2026",
    title: "Bürgerversammlung Breitbandausbau – Glasfaser für ganz Brackenhain",
    kind: "Präsentation",
    fileName: "Buergerversammlung Breitbandausbau 2026-06-23",
    org: "brackenhain",
    unit: "bh-bau",
    author: "bh-dettmer",
    date: "2026-06-19",
    tags: ["zahlen"],
    keywords: ["Glasfaser Altmoorland GmbH", "Vorvermarktung", "Gestattungsvertrag", "790.000 €", "Kleinbracken"],
    summary:
      "Präsentation für die Bürgerversammlung zum Glasfaserausbau: Versorgung heute, eigenwirtschaftlicher und geförderter Ausbau, Finanzierung, Zeitplan, Hinweise für Hauseigentümer und häufige Fragen. Gut für FAQ, Pressemitteilung oder Leichte Sprache.",
    slides: [
      { t: "title", title: "Glasfaser für ganz Brackenhain", subtitle: "Bürgerversammlung am 23. Juni 2026 im Dorfgemeinschaftshaus Lindenweg" },
      {
        t: "bullets",
        title: "Ablauf des Abends",
        bullets: ["Begrüßung durch Bürgermeister Frank Ruhnau", "Versorgung heute", "Zwei Wege zum Anschluss", "Kosten und Förderung", "Zeitplan und Baustellen", "Was Sie jetzt tun müssen", "Ihre Fragen"],
      },
      {
        t: "chart",
        title: "Internetversorgung heute (2.310 Adressen)",
        chart: {
          type: "pie",
          categories: ["unter 30 Mbit/s", "30 bis unter 100 Mbit/s", "100 bis 250 Mbit/s (VDSL)", "Kabelnetz bis 1 Gbit/s"],
          series: [{ name: "Adressen", values: [412, 1118, 396, 384] }],
          unit: "Adressen",
        },
        caption: "Quelle: Markterkundung der Gemeinde, Stand März 2026",
        notes: "Die 412 Adressen unter 30 Mbit/s liegen fast alle in Heidhof, Kleinbracken und im Außenbereich. Das Kabelnetz gibt es nur in den Neubaugebieten im Kernort.",
      },
      {
        t: "twocol",
        title: "Zwei Wege zum Glasfaseranschluss",
        left: {
          heading: "Kernort Brackenhain (eigenwirtschaftlich)",
          bullets: [
            "Glasfaser Altmoorland GmbH baut auf eigene Kosten",
            "1.156 Adressen",
            "Vorvermarktung erreicht: 41 % (nötig waren 40 %)",
            "Hausanschluss kostenlos bei Vertrag bis 31.07.2026",
          ],
        },
        right: {
          heading: "Heidhof und Kleinbracken (gefördert)",
          bullets: ["770 Adressen", "Netzbetreiber nach Ausschreibung: Glasfaser Altmoorland GmbH", "Hausanschluss für alle kostenlos", "Förderbescheid des Bundes seit April 2026"],
        },
        notes: "Wichtig: Im Kernort ist der kostenlose Hausanschluss an einen Vertrag in der Vorvermarktung gebunden. Danach kostet der Anschluss derzeit 799 €.",
      },
      {
        t: "table",
        title: "Finanzierung des geförderten Ausbaus",
        header: ["Beteiligte", "Anteil", "Betrag"],
        rows: [
          ["Bund", "50 %", "3.950.000 €"],
          ["Land", "40 %", "3.160.000 €"],
          ["Gemeinde Brackenhain", "10 %", "790.000 €"],
          ["Wirtschaftlichkeitslücke gesamt", "100 %", "7.900.000 €"],
        ],
        notes: "Der Gemeindeanteil verteilt sich auf 2026 (310.000 €), 2027 (280.000 €) und 2028 (200.000 €) und ist im Haushalt enthalten.",
      },
      {
        t: "table",
        title: "Zeitplan",
        header: ["Schritt", "Zeitraum"],
        rows: [
          ["Vertrag mit dem Netzbetreiber (geförderter Ausbau)", "Juni 2026"],
          ["Baubeginn Kernort", "September 2026"],
          ["Baubeginn Heidhof und Kleinbracken", "März 2027"],
          ["Erste Anschlüsse im Kernort", "2. Quartal 2027"],
          ["Fertigstellung", "Ende 2028"],
        ],
      },
      {
        t: "bullets",
        title: "Was Sie jetzt tun müssen",
        bullets: [
          "Eigentümerinnen und Eigentümer: **Gestattungsvertrag** unterschreiben und zurückschicken",
          "Mieterinnen und Mieter: Vermieter ansprechen – ohne Gestattung kein Anschluss",
          "Tarife ab 39,90 € im Monat, 24 Monate Laufzeit; Wechsel vom alten Anbieter übernimmt der Netzbetreiber",
          "Niemand muss einen Vertrag abschließen – aber der kostenlose Anschluss lohnt sich",
        ],
        notes: "Rechnen Sie mit Fragen von älteren Menschen zum Telefon: Das Festnetztelefon läuft über den Glasfaseranschluss weiter, die Rufnummer kann mitgenommen werden.",
      },
      {
        t: "bullets",
        title: "Baustellen im Ort",
        bullets: [
          "Leitungen werden überwiegend in Gehwegen verlegt, teilweise im Spülbohrverfahren",
          "Gehwege und Einfahrten werden wiederhergestellt; Abnahme durch das Bauamt",
          "Zufahrten bleiben möglich, Sperrungen werden vorher angekündigt",
          "Schäden bitte sofort dem Bauamt melden",
        ],
      },
      {
        t: "bullets",
        title: "Häufige Fragen",
        bullets: [
          { text: "Muss ich mitmachen?", sub: ["Nein. Aber ein späterer Anschluss wird teurer."] },
          { text: "Was passiert mit meinem Kabel- oder DSL-Vertrag?", sub: ["Er läuft bis zum Ende der Laufzeit weiter."] },
          { text: "Wer haftet für Schäden auf meinem Grundstück?", sub: ["Das ausführende Unternehmen im Auftrag des Netzbetreibers."] },
        ],
      },
      {
        t: "end",
        title: "Ihre Fragen",
        lines: ["Bauamt: Uwe Dettmer, Telefon 040 66969-630, breitband@brackenhain.example", "Infomobil des Netzbetreibers: donnerstags 15–18 Uhr am Rathaus"],
      },
    ],
  },
];

export const threads: ThreadSpec[] = [
  {
    id: "bh-beschwerde-laerm-dgh",
    title: "Beschwerde über Lärm am Dorfgemeinschaftshaus",
    subject: "Beschwerde – unerträglicher Lärm am Dorfgemeinschaftshaus Lindenweg!!!",
    org: "brackenhain",
    unit: "bh-ordnung",
    date: "2025-09-23",
    tags: ["personendaten", "unstrukturiert"],
    keywords: ["Lindenweg", "Nutzungsordnung", "22:00 Uhr", "Kaution"],
    summary:
      "Ein Anwohner beschwert sich wütend über Feiern im Dorfgemeinschaftshaus. Das Ordnungsamt antwortet und schlägt dem Bürgermeister intern eine neue Nutzungsordnung vor.",
    mails: [
      {
        from: "ext-wolters",
        to: ["bh-krull"],
        date: "2025-09-19T22:47",
        signature: false,
        body: `Sehr geehrte Damen und Herren,

es reicht jetzt endgültig!!! Schon wieder wird im DGH gegenüber gefeiert, es ist fast 23 Uhr und die Musik dröhnt bei uns im Schlafzimmer. Das geht jetzt seit Wochen so, JEDES Wochenende. Letzten Samstag war bis halb drei Party, die Leute stehen rauchend auf dem Gehweg und schmeißen die Flaschen in unsere Hecke.

Ich habe mich schon zweimal beschwert und es passiert NICHTS. Wofür zahle ich eigentlich Steuern?? Ich will wissen, wer das Haus vermietet bekommt und wer das genehmigt. Wenn sich nichts ändert, gehe ich zum Anwalt und zur Zeitung.

Karl-Heinz Wolters
Lindenweg 14
00758 Brackenhain`,
      },
      {
        from: "bh-krull",
        to: ["ext-wolters"],
        date: "2025-09-22T11:05",
        body: `Sehr geehrter Herr Wolters,

vielen Dank für Ihre E-Mail vom 19.09. und für das Telefonat heute Morgen. Ich kann gut verstehen, dass die nächtliche Ruhestörung für Sie und Ihre Familie sehr belastend ist.

Wie besprochen prüfen wir derzeit die Belegung des Dorfgemeinschaftshauses und die Regeln der Nutzungsordnung. Bitte haben Sie Verständnis dafür, dass wir Ihnen aus Datenschutzgründen keine Namen der Mieterinnen und Mieter nennen dürfen. Die Mieter vom vergangenen Wochenende werden wir aber auf die Einhaltung der Nachtruhe hinweisen.

Ich melde mich bis Mittwoch, 24.09., mit einem Zwischenstand bei Ihnen. Sollte es in der Zwischenzeit erneut zu nächtlichem Lärm kommen, können Sie jederzeit die Polizei verständigen.

Mit freundlichen Grüßen
Im Auftrag
Lisa Krull`,
      },
      {
        from: "ext-wolters",
        to: ["bh-krull"],
        date: "2025-09-22T19:38",
        signature: false,
        body: `Hallo Frau Krull,

danke für den Rückruf, das war wenigstens mal eine Reaktion. Ich weiß übrigens auch so, dass es die Özdemirs vom Kirchberg waren, das hat ja das halbe Dorf mitbekommen. Die Brunkes von Nr. 10 haben sich auch schon beschwert.

Ich habe ein Video von 1:52 Uhr gemacht, darauf hört man die Musik ganz deutlich. Soll ich das schicken? Und können Sie nicht einfach eine Regel machen, dass um 22 Uhr Schluss ist? In der Nachbargemeinde geht das doch auch.

Gruß
K.-H. Wolters`,
      },
      {
        from: "bh-krull",
        to: ["bh-ruhnau"],
        cc: ["bh-hoefer"],
        date: "2025-09-23T09:12",
        attachments: ["bh-gespraechsnotiz-laerm-dgh"],
        quote: false,
        body: `Hallo Herr Ruhnau,

zur Info und mit der Bitte um Entscheidung: Wir haben am DGH Lindenweg ein zunehmendes Lärmproblem (2025 bisher vier Beschwerden von zwei Haushalten, siehe Gesprächsnotiz im Anhang). Herr Wolters droht mit Anwalt und Presse.

Problem ist unsere Nutzungsordnung von 2019: Nutzung bis 24 Uhr, danach „Zimmerlautstärke“ – das ist kaum durchsetzbar.

Vorschlag:
- Musik nur bis 22:00 Uhr, danach Fenster und Türen geschlossen
- Kaution von 150 € auf 300 € erhöhen, Einbehalt bei berechtigten Beschwerden
- Hausmeister macht stichprobenartig Kontrollgänge

Die Änderung müsste in den Haupt- und Finanzausschuss (nächste Sitzung 16.10.). Frau Höfer könnte eine Vorlage vorbereiten. Sollen wir so vorgehen?

Viele Grüße
Lisa Krull`,
      },
    ],
  },
  {
    id: "bh-anfrage-bremer-haushaltsloch",
    title: "Ratsanfrage zur Haushaltslage nach Gewerbesteuererstattung",
    subject: "Anfrage der WGB-Fraktion: Haushaltsloch und Gewerbesteuer-Rückzahlung",
    org: "brackenhain",
    unit: "bh-kasse",
    date: "2026-01-26",
    tags: ["zahlen", "widersprueche"],
    keywords: ["386.400 €", "783.500 €", "Nachtragssatzung", "Kreditermächtigung", "Steuergeheimnis"],
    summary:
      "Ratsherr Bremer fragt nach einem Zeitungsbericht über ein „Haushaltsloch“. Bürgermeister und Kämmerin antworten mit unterschiedlichen Zahlen (300.000 € / 700.000 € gegenüber 386.400 € / 783.500 €) und widersprechen sich beim Nachtragshaushalt; außerdem lagen die Bescheide schon vor dem Neujahrsempfang vor.",
    mails: [
      {
        from: "ext-bremer",
        to: ["bh-ruhnau"],
        cc: ["bh-schnoor"],
        date: "2026-01-20T21:14",
        body: `Sehr geehrter Herr Ruhnau,

heute steht im Altmoorländer Kreisblatt, Brackenhain habe „ein Loch von 1,2 Millionen“ im Haushalt und eine größere Firma bekomme Gewerbesteuer zurück. Davon habe ich als Fraktionsvorsitzender zum ersten Mal aus der Zeitung erfahren. Beim Neujahrsempfang am Sonntag haben Sie noch gesagt, wir hätten unsere Finanzen im Griff.

Namens der Fraktion der Wählergemeinschaft Brackenhain bitte ich um Beantwortung folgender Fragen:

1. Trifft es zu, dass die Gemeinde Gewerbesteuer zurückzahlen muss? In welcher Höhe, und seit wann ist das bekannt?
2. Wie hoch ist der Fehlbetrag 2026 jetzt tatsächlich? Im Haushalt standen 412.000 €.
3. Woher kommen die 1,2 Mio. € aus der Zeitung?
4. Brauchen wir einen Nachtragshaushalt?
5. Liegt die Haushaltsgenehmigung des Landkreises inzwischen vor?

Wir haben am Dienstag, 27.01., Fraktionssitzung. Bis dahin hätte ich gern eine Antwort.

Mit freundlichen Grüßen
Horst Bremer
Fraktionsvorsitzender Wählergemeinschaft Brackenhain`,
      },
      {
        from: "bh-ruhnau",
        to: ["ext-bremer"],
        cc: ["bh-schnoor"],
        date: "2026-01-21T08:52",
        body: `Sehr geehrter Herr Bremer,

danke für Ihre Fragen. Vorab: Das Kreisblatt hat einiges durcheinandergebracht. Die 1,2 Mio. € sind unsere Kreditermächtigung für Investitionen (Kindergarten, Feuerwehrfahrzeug, Breitband) und kein Loch im Haushalt.

Richtig ist, dass ein Betrieb Gewerbesteuer erstattet bekommt. Nach meinem Stand geht es um rund 300.000 €. Den Namen darf ich Ihnen wegen des Steuergeheimnisses nicht nennen. Der Fehlbetrag 2026 wird sich dadurch auf etwa 700.000 € erhöhen.

Einen Nachtragshaushalt halte ich nicht für nötig. Wir fangen das über eine strenge Bewirtschaftung auf, wie in den Vorjahren auch.

Die Haushaltsgenehmigung steht noch aus. Frau Schnoor schickt Ihnen die genauen Zahlen.

Mit freundlichen Grüßen
Frank Ruhnau`,
      },
      {
        from: "bh-schnoor",
        to: ["ext-bremer"],
        cc: ["bh-ruhnau"],
        date: "2026-01-22T14:37",
        attachments: ["bh-ergebnisplan-2026-uebersicht"],
        body: `Sehr geehrter Herr Bremer,

wie von Herrn Ruhnau angekündigt, hier die Zahlen im Einzelnen (Stand heute):

**1. Gewerbesteuererstattung**
Am 12.01.2026 sind die geänderten Gewerbesteuermessbescheide des Finanzamts für die Jahre 2021 bis 2023 bei uns eingegangen. Daraus ergibt sich:
- Erstattung Gewerbesteuer: 386.400 €
- Erstattungszinsen nach § 233a AO: 21.700 €
- Entlastung bei der Gewerbesteuerumlage: −36.600 €
- **Belastung netto: 371.500 €**
Die Auszahlung an den Betrieb ist für den 16.02.2026 vorgesehen.

**2. Fehlbetrag 2026**
Geplant waren 412.000 €. Kommt die Belastung vollständig im Jahr 2026 an, steigt der Fehlbetrag auf **783.500 €**. Ich kläre noch mit dem Rechnungsprüfungsamt des Landkreises, ob wir die Erstattung bereits im Jahresabschluss 2025 als Rückstellung erfassen müssen. Dann würde das Ergebnis 2025 belastet und 2026 entsprechend entlastet. An der Liquidität ändert das nichts.

**3. Die 1,2 Mio. €**
Das ist die Kreditermächtigung nach § 2 der Haushaltssatzung, also der Betrag, den wir für Investitionen aufnehmen dürfen – kein Fehlbetrag.

**4. Nachtragshaushalt**
Nach § 6 Abs. 1 unserer Haushaltssatzung ist eine Verschlechterung erheblich, wenn sie 2 % der ordentlichen Aufwendungen übersteigt, das sind 246.200 €. Die zusätzliche Belastung liegt mit 371.500 € deutlich darüber. Nach meiner Einschätzung ist deshalb eine **Nachtragssatzung** nach § 115 KV erforderlich, es sei denn, wir bringen die Verschlechterung durch Einsparungen an anderer Stelle unter diese Grenze. Das halte ich bei dieser Höhe nicht für realistisch.

**5. Haushaltsgenehmigung**
Die Genehmigung des Landkreises steht noch aus, bis dahin gilt die vorläufige Haushaltsführung. Ich informiere die Kommunalaufsicht über die Erstattung, weil sie das Haushaltssicherungskonzept betrifft.

**6. Liquidität**
Wir hatten für Ende 2026 mit einem Bestand von 543.000 € gerechnet. Durch die Erstattung werden wir ab dem zweiten Quartal Liquiditätskredite brauchen; der Höchstbetrag von 1.500.000 € reicht aus.

Im Anhang finden Sie die Übersicht zum Ergebnisplan 2026, die Grundlage der Haushaltssatzung war.

Mit freundlichen Grüßen
Im Auftrag
Petra Schnoor`,
      },
      {
        from: "ext-bremer",
        to: ["bh-ruhnau", "bh-schnoor"],
        date: "2026-01-24T10:03",
        body: `Sehr geehrter Herr Ruhnau, sehr geehrte Frau Schnoor,

vielen Dank, Frau Schnoor, für die ausführliche und klare Antwort.

Allerdings passen die Zahlen nicht zusammen: Herr Ruhnau schreibt von rund 300.000 € Erstattung und einem Fehlbetrag von etwa 700.000 €, Frau Schnoor von 386.400 € plus Zinsen und von 783.500 €. Herr Ruhnau hält einen Nachtrag für unnötig, Frau Schnoor für erforderlich. Und dass die Bescheide schon am 12.01. da waren, also vor dem Neujahrsempfang, finde ich bemerkenswert.

Die Fraktion der Wählergemeinschaft Brackenhain beantragt daher nach § 4 der Geschäftsordnung, den Punkt „Haushaltslage 2026 nach Gewerbesteuererstattung“ auf die Tagesordnung der Gemeinderatssitzung am 16.02.2026 zu setzen. Die Verwaltung möge bis dahin schriftlich berichten, auch dazu, ob die im Haushaltssicherungskonzept vorgesehene Kürzung der Vereinsförderung jetzt noch verschärft werden soll. Das lehnen wir ab.

Mit freundlichen Grüßen
Horst Bremer`,
      },
      {
        from: "bh-ruhnau",
        to: ["ext-bremer"],
        cc: ["bh-schnoor", "bh-bartels"],
        date: "2026-01-26T16:20",
        body: `Sehr geehrter Herr Bremer,

maßgeblich sind die Zahlen von Frau Schnoor. Meine Angaben beruhten auf einem ersten Telefonat mit dem Finanzamt Anfang Januar; die Bescheide lagen mir beim Neujahrsempfang noch nicht im Einzelnen vor.

Ob wir einen Nachtrag brauchen, möchte ich erst entscheiden, wenn feststeht, ob die Erstattung das Jahr 2025 oder 2026 belastet, und wenn wir mit der Kommunalaufsicht gesprochen haben. Bitte haben Sie Verständnis, dass ich mich da nicht vorschnell festlege.

Ihren Antrag nehme ich auf: Frau Bartels setzt den Punkt „Haushaltslage 2026 nach Gewerbesteuererstattung“ auf die Tagesordnung der Sitzung am 16.02.2026, die Verwaltung legt einen schriftlichen Bericht vor. Eine weitere Kürzung der Vereinsförderung ist nicht geplant.

Mit freundlichen Grüßen
Frank Ruhnau`,
      },
    ],
  },
  {
    id: "bh-wirtschaftsweg-moorweg-bruns",
    title: "Schäden am Heidhofer Moorweg – Bauhof und Landwirt",
    subject: "Schäden am Heidhofer Moorweg nach Güllefahrten",
    org: "brackenhain",
    unit: "bh-bauhof",
    date: "2026-04-21",
    keywords: ["Heidhofer Moorweg", "Zeichen 262", "10.700 €", "Wirtschaftswegekonzept", "Silage"],
    summary:
      "Der Bauhof wirft einem Landwirt Wegeschäden durch Güllefahrten vor, der Landwirt reagiert empört. Intern zeigt sich: Das Gewichtsschild fehlte und seine angebliche Schadensmeldung ist nicht auffindbar; die Gemeinde verzichtet auf Kosten. Mit Vermerk als Anhang – gut für Antwortentwürfe und Konfliktkommunikation.",
    mails: [
      {
        from: "bh-ahlers",
        to: ["ext-bruns"],
        cc: ["bh-dettmer"],
        date: "2026-04-08T10:12",
        body: `Moin Herr Bruns,

bei der Kontrollfahrt heute früh haben wir am Heidhofer Moorweg zwischen der K 12 und Ihrem Hof neue, erhebliche Schäden festgestellt: tiefe Spurrinnen, abgefahrene Bankette auf beiden Seiten, und der Durchlass bei der Weide ist eingedrückt. Das Wasser steht jetzt auf dem Weg.

Die Spuren passen zu Ihren Güllefahrten der letzten Tage – Sie sind bei dem Regen mehrfach mit dem vollen Fass dort gefahren. Der Weg ist für 12 t zugelassen.

Ich muss Sie bitten, den Moorweg mit dem beladenen Gespann nicht mehr zu befahren, solange der Boden so nass ist. Wir müssen das instand setzen, und die Gemeinde wird prüfen, ob die Kosten von Ihnen zu tragen sind.

Ich würde mir das gern mit Ihnen vor Ort ansehen. Passt Ihnen Montag, 13.04., 14 Uhr?

Mit freundlichen Grüßen
Heinz Ahlers`,
      },
      {
        from: "ext-bruns",
        to: ["bh-ahlers"],
        date: "2026-04-08T20:41",
        body: `Herr Ahlers,

das ist ja wohl ein Witz. Der Weg ist seit dem Winter kaputt, da sind Löcher drin da können sie ne Bierkiste reinstellen. Das hab ich im Januar schon bei der Gemeinde angerufen und passiert ist nix. Und jetzt soll ich schuld sein??

Ich fahr da seit 40 Jahren, mein Vater schon vorher, und der Weg hat immer gehalten solange die Gemeinde noch was dran gemacht hat. Der Lohnunternehmer mit dem Häcksler und die LKW von der Biogasanlage fahren da auch, die haben 40 Tonnen drauf, fragen Sie die mal.

Und ein 12-t-Schild steht da gar nicht, das liegt seit Februar im Graben.

Montag 14 Uhr geht. Aber ich sag gleich, zahlen tu ich da nix. Ich brauch den Weg ab Mitte Mai für die Silage, wenn der dann nicht befahrbar ist muss ich 6 km durchs Dorf und dann beschweren sich da alle.

H. Bruns
Moorweg 7, Heidhof`,
      },
      {
        from: "bh-dettmer",
        to: ["bh-ruhnau"],
        cc: ["bh-ahlers"],
        date: "2026-04-14T15:20",
        subject: "WG: Schäden am Heidhofer Moorweg nach Güllefahrten",
        attachments: ["bh-vermerk-ortstermin-moorweg"],
        body: `Hallo Herr Ruhnau,

zur Info und mit der Bitte um Entscheidung – der Vermerk vom Ortstermin gestern hängt an.

Kurz zusammengefasst:
- Die neuen Schäden (Spurrinnen, Bankette, Durchlass) gehen sehr wahrscheinlich auf die Güllefahrten von Herrn Bruns zurück (rund 32 t bei Nässe).
- Allerdings fehlt das Zeichen 262 (12 t) seit dem Sturm im Februar. Die Beschränkung war für ihn also nicht erkennbar; eine Kostenforderung dürfte schwer durchzusetzen sein. Das Schild stellt der Bauhof morgen wieder auf.
- Herr Bruns sagt, er habe die Schlaglöcher im Januar telefonisch gemeldet. Wir finden dazu nichts, weder im Bauhof noch im Bürgerbüro.
- Kosten: provisorische Instandsetzung 6.800 € plus Durchlass 3.900 €, zusammen 10.700 €. In der Unterhaltung Wirtschaftswege sind noch rund 27.000 € frei. Eine grundhafte Instandsetzung würde rund 38.500 € kosten – das passt eher zum 2. Bauabschnitt.

Vorschlag: Wir setzen den Weg bis 08.05. provisorisch instand, verzichten diesmal auf eine Kostenforderung und vereinbaren mit Herrn Bruns, dass er bei Nässe nicht mit vollem Fass fährt. Für 2027 sollten wir ein Wirtschaftswegekonzept mit Lastklassen angehen; die Biogasanlage gehört mit an den Tisch.

Sind Sie einverstanden? Herrn Bruns habe ich eine Antwort bis 21.04. zugesagt.

Viele Grüße
Uwe Dettmer`,
      },
      {
        from: "bh-dettmer",
        to: ["ext-bruns"],
        cc: ["bh-ahlers"],
        date: "2026-04-21T10:35",
        quote: false,
        body: `Sehr geehrter Herr Bruns,

vielen Dank für das Gespräch beim Ortstermin am 13.04. Nach Rücksprache mit Bürgermeister Ruhnau teile ich Ihnen Folgendes mit:

1. Der Bauhof setzt den Moorweg zwischen der K 12 und Ihrer Hofzufahrt bis spätestens 08.05.2026 provisorisch instand und erneuert den eingedrückten Durchlass. Damit ist der Weg für die Silageernte nutzbar.
2. Das Verkehrszeichen (zulässige Gesamtmasse 12 t) steht seit dem 15.04. wieder. Bitte befahren Sie den Weg bei nassem Boden nicht mit beladenem Güllefass und nutzen Sie für schwere Transporte die Kreisstraße.
3. Für die jetzigen Schäden verzichtet die Gemeinde auf eine Kostenbeteiligung. Für künftige Schäden behält sie sich Ersatzansprüche vor.
4. Ihre Meldung vom Januar konnten wir leider nicht finden. Bitte melden Sie Schäden künftig an bauhof@brackenhain.example oder unter 040 66969-635, dann ist alles dokumentiert.

Im Herbst möchten wir mit den Landwirten aus Heidhof und Kleinbracken und den Betreibern der Biogasanlage über ein Konzept für die Wirtschaftswege sprechen (Zustand, Lastklassen, Unterhaltung). Ihre Erfahrung wäre dabei sehr willkommen.

Mit freundlichen Grüßen
Im Auftrag
Uwe Dettmer`,
      },
    ],
  },
  {
    id: "bh-tus-vereinsfoerderung-flutlicht",
    title: "TuS Brackenhain: Vereinsförderung und Flutlicht am Sportplatz",
    subject: "Vereinsförderung 2026 und Flutlicht Sportplatz Am Mühlenbach",
    org: "brackenhain",
    unit: "bh-haupt",
    date: "2026-02-12",
    tags: ["zahlen"],
    keywords: ["Flutlicht", "48.600 €", "Absichtserklärung", "Pflegevereinbarung", "Sportstättenförderung"],
    summary:
      "Der Vorsitzende des Sportvereins beschwert sich über die gekürzte Vereinsförderung und bittet um einen Zuschuss für eine neue Flutlichtanlage. Das Hauptamt erklärt die vorläufige Haushaltsführung, der Verein bietet an, die Platzpflege zu übernehmen. Gut für Zusammenfassungen, Antwortentwürfe und das Nachrechnen der Finanzierung.",
    mails: [
      {
        from: "ext-pahlke",
        to: ["bh-hoefer"],
        cc: ["bh-ruhnau"],
        date: "2026-02-03T19:22",
        body: `Sehr geehrte Frau Höfer,

ich wende mich als Vorsitzender des TuS Brackenhain 1921 e. V. mit zwei Anliegen an Sie.

**1. Kürzung der Vereinsförderung**
Wir haben aus der Zeitung erfahren, dass die Grundförderung je Kind und Jugendlichem von 6,50 € auf 5,85 € sinkt. Bei unseren 186 Mitgliedern unter 18 Jahren (insgesamt 412 Mitglieder) sind das gut 120 € weniger im Jahr. Das bringt uns nicht um, aber das Signal an die vielen Ehrenamtlichen ist schlecht.

**2. Flutlicht am Rasenplatz Am Mühlenbach**
Seit November sind zwei der sechs Masten dunkel. Der Elektriker hat die Anlage (Baujahr 1987) geprüft: Eine Reparatur lohnt sich nicht mehr, Ersatzteile gibt es nicht. Ohne Licht können unsere neun Jugendmannschaften im Winter abends nicht trainieren.

Für eine neue LED-Anlage liegt uns ein Angebot über 48.600 € brutto vor. Unser Finanzierungsplan:
- Sportstättenförderung des Landes (40 %): 19.440 €
- Zuschuss der Gemeinde nach der Vereinsförderrichtlinie (30 %): 14.580 €
- Eigenmittel des Vereins: 14.580 €

Die Flutlichtanlage gehört nach dem Nutzungsvertrag von 2004 dem Verein, der Platz der Gemeinde. Den Antrag beim Land müssen wir bis 31.03.2026 stellen, und dafür brauchen wir eine Finanzierungszusage der Gemeinde. Können Sie uns die bis Ende Februar geben?

Mit sportlichen Grüßen
Günter Pahlke`,
      },
      {
        from: "bh-hoefer",
        to: ["ext-pahlke"],
        cc: ["bh-schnoor"],
        date: "2026-02-05T11:40",
        body: `Sehr geehrter Herr Pahlke,

vielen Dank für Ihre Nachricht und die übersichtliche Aufstellung.

Zur Vereinsförderung: Die Kürzung um 10 % ist Teil des Haushaltssicherungskonzepts, das der Gemeinderat am 15.12.2025 beschlossen hat. Für den TuS bedeutet das bei 186 Jugendlichen 1.088,10 € statt bisher 1.209,00 € Grundförderung. Der Zuschuss zu den Übungsleiterpauschalen bleibt unverändert.

Zum Flutlicht: Ein Investitionszuschuss nach unserer Richtlinie ist grundsätzlich möglich (bis zu 30 %, höchstens 15.000 €). Allerdings ist der Haushalt 2026 noch nicht genehmigt, und bis dahin gilt die vorläufige Haushaltsführung. Neue freiwillige Leistungen dürfen wir in dieser Zeit nicht zusagen. Hinzu kommt, dass der Gemeinderat am 16.02. über die Haushaltslage nach einer Gewerbesteuererstattung beraten wird.

Eine verbindliche Zusage kann ich Ihnen deshalb im Moment nicht geben. Ich kläre mit Frau Schnoor und Herrn Ruhnau, ob wir Ihnen eine Absichtserklärung unter dem Vorbehalt der Haushaltsgenehmigung ausstellen können. Viele Förderstellen akzeptieren das für die Antragstellung.

Mit freundlichen Grüßen
Martina Höfer`,
      },
      {
        from: "ext-pahlke",
        to: ["bh-hoefer"],
        cc: ["bh-ruhnau"],
        date: "2026-02-09T21:05",
        body: `Sehr geehrte Frau Höfer,

danke für die schnelle Antwort, auch wenn sie uns nicht glücklich macht. Herr Bremer hat mir schon erzählt, dass es am 16.02. im Rat um die Finanzen geht.

Wir hätten einen Vorschlag, der der Gemeinde Geld spart: Der Bauhof mäht unseren Rasenplatz bisher rund 28-mal im Jahr. Wir können einen gebrauchten Aufsitzmäher günstig übernehmen und hätten genug Leute, die das ehrenamtlich machen. Wenn die Gemeinde uns dafür eine Pflegepauschale von 6.000 € im Jahr zahlt, sparen Sie trotzdem, und wir können die Pauschale als Eigenanteil fürs Flutlicht einsetzen.

Eine Absichtserklärung vom Bürgermeister würde uns für den Antrag beim Land reichen. Bitte denken Sie an die Frist 31.03.

Mit sportlichen Grüßen
Günter Pahlke`,
      },
      {
        from: "bh-hoefer",
        to: ["ext-pahlke"],
        cc: ["bh-ruhnau", "bh-ahlers", "bh-schnoor"],
        date: "2026-02-12T09:15",
        body: `Sehr geehrter Herr Pahlke,

Ihr Vorschlag ist interessant. Herr Ahlers hat die Kosten des Bauhofs für das Mähen des Rasenplatzes ermittelt: 28 Schnitte mit je rund 7 Stunden zu 50 € ergeben rund 9.800 € im Jahr. Eine Pflegevereinbarung mit einer Pauschale von 6.000 € würde den Haushalt also um etwa 3.800 € entlasten. Die Einzelheiten (Haftung, Versicherung der Ehrenamtlichen, Qualität der Pflege) müssten wir regeln.

Wir schlagen ein Gespräch am **Dienstag, 24.02., um 17:00 Uhr** im Rathaus vor, mit Herrn Ahlers und Frau Schnoor.

Zum Flutlicht: Herr Ruhnau ist bereit, Ihnen bis zum 27.02. eine Absichtserklärung auszustellen – vorbehaltlich der Genehmigung des Haushalts 2026 und eines Beschlusses des Haupt- und Finanzausschusses. Dafür brauchen wir bis zum 20.02.:
- das Angebot für die LED-Anlage,
- Ihren Finanzierungsplan,
- den Nutzungsvertrag von 2004 bzw. einen Nachweis, dass die Anlage dem Verein gehört.

Mit freundlichen Grüßen
Martina Höfer`,
      },
    ],
  },
  {
    id: "bh-kita-personalengpass-notbetreuung",
    title: "Personalengpass im Gemeindekindergarten – Notbetreuung",
    subject: "Personalengpass Lindenhof – Notbetreuung ab Mittwoch?",
    org: "brackenhain",
    unit: "bh-kita",
    date: "2026-09-15",
    tags: ["personendaten"],
    keywords: ["Notbetreuung", "§ 47 SGB VIII", "Beschäftigungsverbot", "Wiedereingliederung", "Elternbrief"],
    summary:
      "Die Kita-Leitung meldet einen akuten Personalengpass und schlägt eine Notbetreuung vor – mit Namen von Kindern, Berufen der Eltern und Gesundheitsangaben zu Beschäftigten. Ideal zum Anonymisieren und für Datenschutzfragen (Art. 9 DSGVO): Die letzte Mail zitiert die Personaldaten an die Stellvertretung weiter. Außerdem Vorlage für einen Elternbrief in Leichter Sprache.",
    mails: [
      {
        from: "bh-vogt",
        to: ["bh-hoefer"],
        cc: ["bh-bartels"],
        date: "2026-09-14T07:48",
        body: `Liebe Martina,

wir haben diese Woche ein echtes Problem. Von unseren 18 Kolleginnen und Kollegen (die Stelle von Lea Gerken ist seit 01.09. unbesetzt) fehlen:
- Jana Kruse (Igelgruppe): krankgeschrieben seit 07.09., Bandscheibenvorfall, voraussichtlich bis Mitte Oktober
- Svenja Tönjes: Beschäftigungsverbot wegen Schwangerschaft seit 01.09.
- Nils Fokken: Magen-Darm, krank bis mindestens Mittwoch
- Wiebke Saathoff: Urlaub bis 18.09. (genehmigt, Familienfeier im Ausland)
- Kerstin Albers ist nach ihrer Wiedereingliederung (BEM) nur 4 Stunden am Tag da

Damit haben wir rechnerisch 10,6 statt 16,4 Vollzeitstellen. Für 82 Kinder bei Öffnung von 7:00 bis 16:30 Uhr reicht das nach dem KiTaG nicht.

Mein Vorschlag: **Notbetreuung ab Mittwoch, 16.09., bis Freitag, 02.10.** Regulär öffnen wir von 7:30 bis 14:00 Uhr, nach 14:00 Uhr betreuen wir nur Kinder mit dringendem Bedarf. Stand heute wären das 11 Kinder:
- Mia Schröder (Krippe) – Mutter alleinerziehend, Pflegekraft im Schichtdienst
- Ben und Lotta Hinz (Elementar) – Vater Rettungsdienst, Mutter Vollzeit in Altmoor
- Emir Kaya (Elementar) – beide Eltern Spätdienst im Supermarkt
- Ida Bruns (Krippe) – Eltern Landwirtschaft, Maisernte
- Leon Siemers (Elementar) – Diabetes Typ 1, braucht eine eingewiesene Fachkraft (das war bisher Jana!)
- Finn und Paula Wübben (Elementar) – Mutter Lehrerin, Vater Montage
- Hanna Ocken (Krippe) – Mutter in Ausbildung
- Theo Grabowski (Elementar) – Vater Hausmeister bei uns, Mutter Nachtdienst
- Maja Lüdeke (Elementar) – Jugendamt hat dringend um Betreuung gebeten (Hilfe zur Erziehung)

Die Meldung an das Landesjugendamt nach § 47 SGB VIII mache ich heute noch, das Jugendamt des Landkreises informiere ich auch. Wie beim Norovirus im Februar 2025 brauchen wir dann schnell einen Elternbrief.

Kannst du das freigeben?

Viele Grüße
Sabrina`,
      },
      {
        from: "bh-hoefer",
        to: ["bh-vogt"],
        cc: ["bh-bartels", "bh-ruhnau"],
        date: "2026-09-14T10:25",
        quote: false,
        body: `Liebe Sabrina,

die Notbetreuung ab 16.09. ist freigegeben, Herr Ruhnau ist einverstanden. Bitte halte den Zeitraum so kurz wie möglich und gib mir Bescheid, sobald sich die Lage bessert.

Ein Punkt noch: Deine Mail mit den Namen der Kinder, den Gesundheitsangaben (Diabetes, Bandscheibe, Schwangerschaft) und dem Hinweis auf die Hilfe zur Erziehung darf so nicht in größeren Verteilern landen. Ich habe Herrn Ruhnau deshalb nur meine Antwort ohne deinen Text geschickt. Die Liste für die Notbetreuung bitte nur im geschützten Kita-Ordner auf dem Laufwerk ablegen, Personalangelegenheiten nur an Anke.

Anke, kannst du bitte prüfen, ob wir kurzfristig aufstocken oder eine Vertretung über einen Personaldienstleister bekommen?

Viele Grüße
Martina`,
      },
      {
        from: "bh-bartels",
        to: ["bh-hoefer", "bh-vogt"],
        date: "2026-09-15T13:10",
        quote: false,
        body: `Hallo ihr beiden,

hier der Stand aus dem Personalbereich:

- **Aufstockung:** Tanja Rieken (Erzieherin, bisher 25 Std.) ist bereit, bis 31.10. auf 35 Std. aufzustocken. Änderungsvertrag bereite ich heute vor.
- **Herr Fokken** hat sich telefonisch gemeldet, er kommt am Donnerstag, 17.09., wieder.
- **Ausschreibung Nachfolge Gerken** (Erzieher/in, S 8a TVöD SuE): zwei Bewerbungen, Gespräche am 22.09., frühester Beginn 01.11.
- **Personaldienstleister:** 410 € netto je Fachkraft und Tag. Zwei Kräfte für zwei Wochen wären rund 9.760 € brutto – das müsste Herr Ruhnau wegen der Haushaltssicherung ausdrücklich freigeben.
- **Frau Albers:** Laut Stufenplan der Wiedereingliederung 4 Std. täglich bis 27.09., danach 6 Std. Bitte nicht mehr einsetzen als im Plan steht, sonst gefährden wir das BEM.
- **Frau Tönjes:** Beschäftigungsverbot bis zum Mutterschutz (voraussichtlich ab 20.11.), danach will sie Elternzeit nehmen. Wir sollten die Stelle befristet nachbesetzen.

Viele Grüße
Anke`,
      },
      {
        from: "bh-vogt",
        to: ["bh-hoefer"],
        cc: ["bh-bartels", "bh-hinners"],
        date: "2026-09-15T16:40",
        body: `Liebe Martina, liebe Anke,

danke euch! Mit Frau Rieken und Herrn Fokken reicht es, die Notbetreuung schon am **Freitag, 25.09.,** zu beenden. Den Personaldienstleister brauchen wir dann nicht. Die Meldung nach § 47 SGB VIII ist raus, die Fachberatung im Jugendamt ist informiert. Frauke Hinners übernimmt die Einweisung zur Diabetes-Versorgung.

Hier mein Entwurf für den Elternbrief, der morgen früh rausgehen soll:

„Liebe Eltern,
leider fehlen bei uns im Moment viele Kolleginnen und Kollegen. Deshalb gilt vom 16.09. bis 25.09.2026: Der Kindergarten ist von 7:30 bis 14:00 Uhr geöffnet. Nach 14:00 Uhr können wir nur Kinder betreuen, deren Eltern keine andere Möglichkeit haben. Bitte sprechen Sie uns bis Dienstag an, wenn Sie das brauchen. Wir wissen, dass das für viele Familien schwer ist, und danken Ihnen für Ihr Verständnis.
Ihr Team vom Kindergarten Lindenhof"

Passt das so?

Viele Grüße
Sabrina`,
      },
    ],
  },
];
