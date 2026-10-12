// Ministerium für Kommunales und Verwaltungsentwicklung (Land)
import type { DocSpec, ThreadSpec } from "../types";

export const documents: DocSpec[] = [
  {
    type: "word",
    id: "mkv-leitfaden-generative-ki",
    title: "Leitfaden für den Einsatz generativer KI in der Landesverwaltung (Entwurf)",
    kind: "Leitfaden (Entwurf)",
    fileName: "Leitfaden generative KI Landesverwaltung Entwurf v0.9",
    org: "mkv",
    unit: "mkv-54",
    author: "mkv-brehm",
    date: "2025-09-30",
    tags: [],
    keywords: ["Version 0.9", "Ampelmodell", "KI-Verordnung", "Kennzeichnung", "Vier-Augen-Prinzip"],
    summary:
      "Ausführlicher Entwurf eines Leitfadens: Grundsätze, zulässige und unzulässige Einsatzszenarien, Umgang mit Daten nach Schutzbedarf, Prüfung und Kennzeichnung von Ergebnissen, Beschaffung und Schulung.",
    meta: [
      ["Aktenzeichen", "54-0141.2/25"],
      ["Stand", "Version 0.9 – Entwurf zur Ressortabstimmung"],
    ],
    subject: "Leitfaden für den Einsatz generativer Künstlicher Intelligenz in der Landesverwaltung",
    blocks: [
      {
        t: "note",
        text: "**Entwurf – nicht zur Veröffentlichung.** Dieser Entwurf befindet sich in der Abstimmung mit den Ressorts, dem Hauptpersonalrat und der oder dem Landesbeauftragten für den Datenschutz. Änderungen sind zu erwarten.",
      },
      { t: "h1", text: "1. Zweck und Geltungsbereich" },
      {
        t: "p",
        text: "Generative KI-Anwendungen – also Systeme, die auf Grundlage von Eingaben Texte, Bilder, Tabellen oder Programmcode erzeugen – können die Arbeit in der Verwaltung erleichtern. Sie helfen beim Formulieren, Zusammenfassen, Strukturieren und Recherchieren. Zugleich bergen sie Risiken: Sie können falsche Inhalte erzeugen, vertrauliche Informationen preisgeben oder Entscheidungen unbemerkt beeinflussen.",
      },
      {
        t: "p",
        text: "Dieser Leitfaden gibt den Beschäftigten der Landesverwaltung eine verbindliche Orientierung für den Einsatz solcher Anwendungen. Er gilt für die obersten Landesbehörden und ihren nachgeordneten Bereich. Den Kommunen wird empfohlen, ihn entsprechend anzuwenden. Fachspezifische Regelungen einzelner Ressorts bleiben unberührt, sofern sie strengere Anforderungen stellen.",
      },
      {
        t: "p",
        text: "Der Leitfaden ersetzt keine rechtliche Prüfung im Einzelfall. Er wird spätestens zwölf Monate nach Inkrafttreten überprüft und an technische und rechtliche Entwicklungen angepasst.",
      },
      { t: "h1", text: "2. Begriffe" },
      {
        t: "table",
        header: ["Begriff", "Bedeutung in diesem Leitfaden"],
        rows: [
          ["Generative KI", "Anwendungen, die auf Basis großer Sprach- oder Bildmodelle neue Inhalte erzeugen."],
          ["Eingabe (Prompt)", "Alle Informationen, die einer KI-Anwendung übergeben werden – einschließlich hochgeladener Dateien."],
          ["Ausgabe", "Alle von der Anwendung erzeugten Inhalte."],
          [
            "Freigegebene Anwendung",
            "Eine Anwendung, die nach Abschnitt 8 geprüft und vom zuständigen Ressort für den dienstlichen Gebrauch freigegeben wurde.",
          ],
          ["Öffentliche Anwendung", "Frei im Internet verfügbare Angebote ohne vertragliche Vereinbarung mit dem Land."],
        ],
        widths: [1, 3],
      },
      { t: "h1", text: "3. Grundsätze" },
      { t: "h2", text: "3.1 Verantwortung bleibt beim Menschen" },
      {
        t: "p",
        text: "Die fachliche und rechtliche Verantwortung für jedes Arbeitsergebnis liegt ausschließlich bei der Person, die es verwendet. Eine KI-Anwendung ist ein Werkzeug, keine Entscheidungsinstanz. Verwaltungsentscheidungen mit Außenwirkung dürfen nicht allein auf Grundlage einer KI-Ausgabe getroffen werden. Bei Entscheidungen, die Rechte Dritter berühren, gilt das **Vier-Augen-Prinzip**.",
      },
      { t: "h2", text: "3.2 Transparenz" },
      {
        t: "p",
        text: "Wer KI-Anwendungen nutzt, macht dies gegenüber Vorgesetzten und Kolleginnen und Kollegen offen. Bürgerinnen und Bürger sollen erkennen können, wenn sie mit einem KI-System kommunizieren. Einzelheiten zur Kennzeichnung regelt Abschnitt 7.",
      },
      { t: "h2", text: "3.3 Datenschutz und Informationssicherheit" },
      {
        t: "p",
        text: "Personenbezogene Daten und als Verschlusssache eingestufte Informationen dürfen nur in freigegebene Anwendungen eingegeben werden, die für diesen Schutzbedarf zugelassen sind. Öffentliche Anwendungen sind für dienstliche Inhalte grundsätzlich ausgeschlossen, soweit nicht ausschließlich offene Informationen verarbeitet werden (siehe Abschnitt 5).",
      },
      { t: "h2", text: "3.4 Urheberrecht und Quellen" },
      {
        t: "p",
        text: "Ausgaben können Inhalte Dritter wiedergeben. Vor einer Veröffentlichung ist zu prüfen, ob Rechte Dritter verletzt werden. Von der KI genannte Quellen, Fundstellen und Urteile sind vor ihrer Verwendung im Original nachzuprüfen.",
      },
      { t: "h2", text: "3.5 Gleichbehandlung" },
      {
        t: "p",
        text: "KI-Modelle können Vorurteile aus ihren Trainingsdaten übernehmen. Ausgaben, die Personen oder Gruppen betreffen, sind deshalb besonders kritisch auf diskriminierende Formulierungen und Annahmen zu prüfen.",
      },
      { t: "h1", text: "4. Einsatzszenarien" },
      {
        t: "p",
        text: "Die folgende Übersicht ordnet typische Einsatzszenarien nach dem **Ampelmodell** ein. Grün bedeutet: in freigegebenen Anwendungen ohne weitere Prüfung zulässig. Gelb bedeutet: zulässig unter den genannten Bedingungen. Rot bedeutet: unzulässig.",
      },
      {
        t: "table",
        header: ["Szenario", "Ampel", "Bedingungen"],
        rows: [
          ["Entwürfe für allgemeine Texte (Einladungen, Rundschreiben, Stellenanzeigen)", "Grün", "Inhaltliche Prüfung vor Versand"],
          ["Zusammenfassung öffentlich zugänglicher Dokumente", "Grün", "Abgleich der Kernaussagen mit dem Original"],
          ["Übersetzung und sprachliche Vereinfachung (Leichte Sprache)", "Grün", "Bei Außenwirkung Prüfung durch kundige Person"],
          ["Auswertung interner Statistiken ohne Personenbezug", "Gelb", "Nur in freigegebenen Anwendungen; Ergebnisse nachrechnen"],
          ["Entwürfe für Antworten an Bürgerinnen und Bürger", "Gelb", "Keine personenbezogenen Daten in öffentlichen Anwendungen; Vier-Augen-Prinzip"],
          ["Unterstützung bei Programmierung und Formeln", "Gelb", "Keine Zugangsdaten oder internen Systemdetails eingeben"],
          ["Bewertung von Bewerbungen oder Beschäftigten", "Rot", "Unzulässig (Hochrisiko nach der KI-Verordnung)"],
          ["Automatisierte Entscheidung über Anträge", "Rot", "Unzulässig ohne gesetzliche Grundlage"],
          ["Eingabe von Verschlusssachen in öffentliche Anwendungen", "Rot", "Unzulässig"],
        ],
        widths: [5, 1, 4],
      },
      { t: "h1", text: "5. Umgang mit Daten nach Schutzbedarf" },
      {
        t: "p",
        text: "Vor jeder Eingabe ist zu prüfen, welchen Schutzbedarf die Informationen haben. Maßgeblich ist die höchste Schutzstufe aller eingegebenen Inhalte, einschließlich hochgeladener Dateien und eingefügter Textpassagen.",
      },
      {
        t: "table",
        header: ["Schutzbedarf", "Beispiele", "Öffentliche Anwendung", "Freigegebene Anwendung"],
        rows: [
          ["offen", "Gesetzestexte, Pressemitteilungen, veröffentlichte Berichte", "zulässig", "zulässig"],
          ["intern", "Entwürfe, Protokolle, interne Statistiken", "unzulässig", "zulässig"],
          ["vertraulich", "Personalangelegenheiten, Vergabeunterlagen vor Abschluss", "unzulässig", "nur mit Zulassung für diesen Schutzbedarf"],
          ["personenbezogen", "Anträge, Bescheide, Beschwerden mit Namen", "unzulässig", "nur mit Zulassung; Datensparsamkeit beachten"],
          ["Verschlusssache", "VS-NfD und höher", "unzulässig", "unzulässig (Ausnahme: gesondert zugelassene Systeme)"],
        ],
        widths: [2, 4, 2, 3],
      },
      {
        t: "p",
        text: "Auch in freigegebenen Anwendungen gilt der Grundsatz der Datensparsamkeit: Namen, Anschriften, Geburtsdaten, Aktenzeichen und andere identifizierende Merkmale sind zu entfernen oder durch Platzhalter zu ersetzen, wenn sie für die Aufgabe nicht benötigt werden. Dies gilt auch für Metadaten in Dateien (z. B. Verfasserangaben, Kommentare und Änderungsverläufe).",
      },
      { t: "h1", text: "6. Prüfung von Ergebnissen" },
      {
        t: "p",
        text: "KI-Ausgaben wirken oft überzeugend, können aber sachlich falsch sein. Vor jeder Verwendung sind sie anhand der folgenden Checkliste zu prüfen:",
      },
      {
        t: "ol",
        items: [
          "Stimmen Zahlen, Daten und Namen mit den Quellen überein?",
          "Sind genannte Rechtsgrundlagen, Paragrafen und Urteile korrekt und aktuell?",
          "Fehlen wesentliche Aspekte, die in der Vorlage enthalten waren?",
          "Ist die Ausgabe sprachlich angemessen, verständlich und frei von diskriminierenden Formulierungen?",
          "Enthält die Ausgabe Informationen, die nicht weitergegeben werden dürfen?",
          "Würde ich das Ergebnis auch ohne KI-Unterstützung so vertreten?",
        ],
      },
      {
        t: "p",
        text: "Rechenergebnisse aus Tabellen sind stichprobenartig nachzurechnen. Bei Zusammenfassungen langer Dokumente ist mindestens ein Abgleich der Kernaussagen mit dem Original erforderlich.",
      },
      { t: "h1", text: "7. Kennzeichnung" },
      {
        t: "p",
        text: "Texte, die überwiegend von einer KI-Anwendung erzeugt und nur unwesentlich überarbeitet wurden, sind bei Veröffentlichung zu kennzeichnen, z. B. mit dem Hinweis „Dieser Text wurde mit Unterstützung von KI erstellt und redaktionell geprüft.“ Interne Arbeitsentwürfe müssen nicht gekennzeichnet werden. Chatbots und Assistenzsysteme im Kontakt mit Bürgerinnen und Bürgern weisen zu Beginn jeder Unterhaltung darauf hin, dass es sich um ein KI-System handelt.",
      },
      { t: "h1", text: "8. Beschaffung und Betrieb" },
      {
        t: "p",
        text: "KI-Anwendungen werden ausschließlich über die zentrale Beschaffung des Landes oder über Rahmenverträge beschafft. Vor der Freigabe sind insbesondere zu prüfen: der Speicherort und die Verarbeitung der Daten, die Nutzung von Eingaben zum Training, die Einstufung nach der KI-Verordnung (EU) 2024/1689, die Informationssicherheit nach den Vorgaben des Landes sowie die Barrierefreiheit.",
      },
      {
        t: "p",
        text: "Für jede freigegebene Anwendung benennt das Ressort eine verantwortliche Stelle. Diese führt ein Verzeichnis der zugelassenen Einsatzszenarien, sorgt für die Dokumentation und ist Ansprechpartnerin bei Vorfällen. Fehlerhafte oder problematische Ausgaben, die zu Schäden geführt haben oder hätten führen können, sind der verantwortlichen Stelle zu melden.",
      },
      { t: "h1", text: "9. Schulung und Beteiligung" },
      {
        t: "p",
        text: "Beschäftigte dürfen freigegebene KI-Anwendungen erst nach einer Basisschulung nutzen. Das Landesamt für Personalgewinnung und Fortbildung bietet hierzu ab dem ersten Quartal 2026 Online-Kurse an. Führungskräfte erhalten ein zusätzliches Modul zu Verantwortung und Arbeitsorganisation. Die Personalvertretungen werden bei der Einführung neuer Anwendungen nach dem Landespersonalvertretungsgesetz beteiligt.",
      },
      { t: "h1", text: "10. Ansprechpersonen" },
      {
        t: "ul",
        items: [
          "Fragen zu diesem Leitfaden: Referat 54 – Künstliche Intelligenz in der Verwaltung",
          "Fragen zum Datenschutz: die oder der behördliche Datenschutzbeauftragte",
          "Fragen zur Informationssicherheit: die oder der Informationssicherheitsbeauftragte der Behörde",
        ],
      },
      { t: "h1", text: "Anlage: Offene Punkte der Ressortabstimmung" },
      {
        t: "ul",
        items: [
          "Finanzressort: Soll die Kennzeichnungspflicht auch für interne Vorlagen an die Hausleitung gelten?",
          "Justizressort: Ergänzung um Hinweise zur Verwendung in Gerichtsverfahren erbeten.",
          "Hauptpersonalrat: Wunsch nach einer Dienstvereinbarung statt eines Leitfadens; Gespräch am 22.10.2025 vereinbart.",
          "Landesdatenschutz: Abschnitt 5 soll um ein Beispiel zur Pseudonymisierung ergänzt werden.",
        ],
      },
    ],
  },
  {
    type: "word",
    id: "mkv-referentenentwurf-kv-hybride-sitzungen",
    title: "Referentenentwurf: Änderung der Kommunalverfassung – hybride Sitzungen",
    kind: "Referentenentwurf",
    fileName: "2025-03-18 Referentenentwurf KV-Aenderung hybride Sitzungen mit Begruendung",
    org: "mkv",
    unit: "mkv-31",
    author: "mkv-bergmann",
    date: "2025-03-18",
    tags: [],
    keywords: ["§ 35a", "hybride Sitzung", "Verbändeanhörung", "Bild- und Tonübertragung", "§ 15 GkZ"],
    summary:
      "Referentenentwurf mit Gesetzestext und Begründung: Gemeinderäte, Kreistage und Ausschüsse sollen per Hauptsatzung hybride Sitzungen zulassen können; in Notlagen sind reine Videositzungen möglich. Geeignet zum Zusammenfassen, für Synopsen und für Stellungnahmen aus kommunaler Sicht.",
    meta: [
      ["Aktenzeichen", "31-1012.4/25"],
      ["Stand", "Referentenentwurf vom 18.03.2025"],
      ["Anhörungsfrist", "30.04.2025"],
    ],
    subject: "Entwurf eines Gesetzes zur Änderung der Kommunalverfassung und des Gesetzes über kommunale Zusammenarbeit (Gesetz über hybride Sitzungen kommunaler Vertretungen)",
    blocks: [
      {
        t: "note",
        text: "**Referentenentwurf – Verbändeanhörung.** Der Entwurf ist innerhalb der Landesregierung noch nicht abgestimmt. Er wird den kommunalen Spitzenverbänden und weiteren Verbänden zur Stellungnahme bis zum 30.04.2025 übersandt. Eine Weitergabe an Dritte ist zulässig, eine Veröffentlichung erst nach Kabinettsbefassung.",
      },
      { t: "h1", text: "A. Problem und Ziel" },
      {
        t: "p",
        text: "Die Kommunalverfassung (KV) geht vom Grundsatz der Präsenzsitzung aus: Mitglieder der Vertretung, der Ausschüsse und der Ortsräte müssen im Sitzungsraum anwesend sein, um an Beratung und Abstimmung teilzunehmen. Die befristete Sonderregelung des § 182 KV, die während der Pandemie Sitzungen per Videokonferenz erlaubte, ist am 31.03.2022 ausgelaufen.",
      },
      {
        t: "p",
        text: "Seitdem bitten die kommunalen Spitzenverbände, zahlreiche Vertretungen und Fraktionen um eine dauerhafte Regelung. Hybride Sitzungen erleichtern die Vereinbarkeit des Ehrenamts mit Beruf, Pflege und Familie, sie verringern Fahrzeiten in Flächenkreisen und ermöglichen auch Mitgliedern mit Behinderungen oder vorübergehenden gesundheitlichen Einschränkungen die Mitwirkung. Zugleich müssen die Grundsätze der Öffentlichkeit, der Unmittelbarkeit der Beratung und der geheimen Wahl gewahrt bleiben.",
      },
      { t: "h1", text: "B. Lösung" },
      {
        t: "p",
        text: "Die Kommunen erhalten die Möglichkeit, in der Hauptsatzung zu bestimmen, dass Mitglieder an Sitzungen durch zeitgleiche **Bild- und Tonübertragung** teilnehmen können (hybride Sitzung). Für außergewöhnliche Notlagen wird eine eng begrenzte Möglichkeit reiner Videositzungen geschaffen. Die Regelungen gelten für Zweckverbände entsprechend.",
      },
      { t: "h1", text: "C. Alternativen" },
      {
        t: "p",
        text: "Beibehaltung der geltenden Rechtslage. Sie würde die Erwartungen der kommunalen Praxis enttäuschen und die Gewinnung von Bewerberinnen und Bewerbern für das kommunale Ehrenamt weiter erschweren. Eine verpflichtende Einführung hybrider Sitzungen für alle Kommunen wurde verworfen, weil sie in die Organisationshoheit eingreifen und Ausgleichsansprüche nach dem Konnexitätsprinzip auslösen würde.",
      },
      { t: "h1", text: "D. Kosten und Erfüllungsaufwand" },
      {
        t: "p",
        text: "Dem Land entstehen keine Kosten. Für Kommunen, die von der Regelung Gebrauch machen, entstehen einmalige Kosten für die technische Ausstattung der Sitzungsräume. Nach Erhebungen bei vier Kommunen ist je Sitzungsraum mit 8.000 bis 25.000 Euro zu rechnen; hinzu kommen laufende Kosten für Lizenzen und Betreuung von rund 1.500 bis 4.000 Euro jährlich. Da die Einführung freiwillig ist, entsteht kein Mehrbelastungsausgleich. Die Ausstattung ist im Förderprogramm „Digitale Kommune“ förderfähig.",
      },
      { t: "pagebreak" },
      { t: "h1", text: "Gesetzestext" },
      { t: "h2", text: "Artikel 1 – Änderung der Kommunalverfassung" },
      { t: "p", text: "Die Kommunalverfassung (KV) in der Fassung der Bekanntmachung vom 14. Juni 2018, zuletzt geändert durch Gesetz vom 6. Dezember 2023, wird wie folgt geändert:" },
      {
        t: "ol",
        items: [
          "In der Inhaltsübersicht wird nach der Angabe zu § 35 folgende Angabe eingefügt: „§ 35a Sitzungen mit Teilnahme durch Bild- und Tonübertragung“.",
          "Nach § 35 wird folgender § 35a eingefügt (Wortlaut siehe unten).",
          "In § 40 Abs. 1 wird nach Satz 1 folgender Satz eingefügt: „Mitglieder, die nach § 35a zugeschaltet sind, gelten als anwesend.“",
          "§ 48 Abs. 2 wird um folgende Nummer 7 ergänzt: „7. die Namen der Mitglieder, die durch Bild- und Tonübertragung teilgenommen haben, sowie Beginn und Dauer technischer Störungen“.",
        ],
      },
      { t: "h3", text: "§ 35a Sitzungen mit Teilnahme durch Bild- und Tonübertragung" },
      {
        t: "p",
        text: "(1) Die Hauptsatzung kann bestimmen, dass Mitglieder der Vertretung an deren Sitzungen ohne persönliche Anwesenheit im Sitzungsraum durch zeitgleiche Bild- und Tonübertragung teilnehmen können (hybride Sitzung). Die oder der Vorsitzende und die Hauptverwaltungsbeamtin oder der Hauptverwaltungsbeamte müssen im Sitzungsraum anwesend sein. Die Hauptsatzung kann die Zahl der zugeschalteten Mitglieder begrenzen.",
      },
      {
        t: "p",
        text: "(2) Zugeschaltete Mitglieder haben sicherzustellen, dass Dritte die Beratung in nichtöffentlichen Sitzungen weder sehen noch hören können. Sie müssen während der gesamten Teilnahme in Bild und Ton zu sehen und zu hören sein. Eine Aufzeichnung durch Mitglieder ist unzulässig.",
      },
      {
        t: "p",
        text: "(3) Kann ein Mitglied wegen einer technischen Störung nicht oder nicht mehr teilnehmen, berührt dies die Wirksamkeit der Sitzung und der gefassten Beschlüsse nicht, es sei denn, die Störung liegt im Verantwortungsbereich der Kommune. In diesem Fall ist die Sitzung zu unterbrechen; dauert die Störung länger als 30 Minuten, ist die Sitzung zu vertagen.",
      },
      {
        t: "p",
        text: "(4) Wahlen, die nach § 67 geheim durchzuführen sind, finden ausschließlich im Sitzungsraum statt. Zugeschaltete Mitglieder können an geheimen Wahlen nur teilnehmen, wenn ein Verfahren zur Verfügung steht, das die geheime Stimmabgabe und ihre Überprüfbarkeit gewährleistet. Das für Kommunalrecht zuständige Ministerium wird ermächtigt, die Anforderungen an ein solches Verfahren durch Verordnung zu regeln.",
      },
      {
        t: "p",
        text: "(5) Bei öffentlichen Sitzungen ist die Übertragung in den Sitzungsraum so zu gestalten, dass die anwesende Öffentlichkeit die zugeschalteten Mitglieder sehen und hören kann. Eine Übertragung der Sitzung im Internet bleibt nach § 36 Abs. 3 zulässig.",
      },
      {
        t: "p",
        text: "(6) In außergewöhnlichen Notlagen, insbesondere bei Katastrophen oder epidemischen Lagen, in denen die Durchführung von Präsenzsitzungen unmöglich oder unzumutbar ist, kann die Vertretung mit einer Mehrheit von zwei Dritteln ihrer Mitglieder beschließen, dass Sitzungen für einen Zeitraum von höchstens drei Monaten ausschließlich durch Bild- und Tonübertragung stattfinden (Videositzung). Der Beschluss kann im Umlaufverfahren gefasst werden. Er ist der Kommunalaufsichtsbehörde unverzüglich anzuzeigen.",
      },
      {
        t: "p",
        text: "(7) Die Absätze 1 bis 6 gelten für Ausschüsse, Ortsräte und Beiräte entsprechend. Für den Kreistag und seine Ausschüsse gelten sie mit der Maßgabe, dass an die Stelle der Hauptverwaltungsbeamtin oder des Hauptverwaltungsbeamten die Landrätin oder der Landrat tritt.",
      },
      { t: "h2", text: "Artikel 2 – Änderung des Gesetzes über kommunale Zusammenarbeit" },
      {
        t: "p",
        text: "In § 15 des Gesetzes über kommunale Zusammenarbeit (GkZ) wird folgender Absatz 4 angefügt: „(4) § 35a KV gilt für die Verbandsversammlung und ihre Ausschüsse entsprechend; an die Stelle der Hauptsatzung tritt die Verbandssatzung.“",
      },
      { t: "h2", text: "Artikel 3 – Inkrafttreten, Evaluierung" },
      {
        t: "p",
        text: "(1) Dieses Gesetz tritt am 1. Januar 2026 in Kraft. (2) Die Landesregierung berichtet dem Landtag bis zum 31. Dezember 2028 über die Erfahrungen mit den Regelungen dieses Gesetzes.",
      },
      { t: "pagebreak" },
      { t: "h1", text: "Begründung" },
      { t: "h2", text: "A. Allgemeiner Teil" },
      { t: "h3", text: "1. Anlass und Zielsetzung" },
      {
        t: "p",
        text: "Während der Pandemie haben zahlreiche Kommunen Erfahrungen mit Sitzungen per Videokonferenz gesammelt. Eine Umfrage des Ministeriums bei den Kommunen im Herbst 2024 (Rücklauf 71 %) ergab, dass 64 % der antwortenden Kommunen eine dauerhafte Möglichkeit hybrider Sitzungen befürworten. Als Gründe wurden vor allem die Vereinbarkeit mit Beruf und Familie (82 %), lange Anfahrtswege im ländlichen Raum (57 %) und die Teilnahme bei Krankheit oder Mutterschutz (49 %) genannt. Kritisch gesehen wurden Fragen der Technik, der Sitzungsdisziplin und der geheimen Wahl.",
      },
      {
        t: "p",
        text: "Der Entwurf greift diese Erfahrungen auf. Er schafft einen rechtssicheren Rahmen, überlässt die Entscheidung über das Ob und das Wie aber den Kommunen selbst. Damit wird die kommunale Organisationshoheit gewahrt.",
      },
      { t: "h3", text: "2. Wesentlicher Inhalt" },
      {
        t: "ul",
        items: [
          "Einführung hybrider Sitzungen durch Regelung in der Hauptsatzung (Satzungsvorbehalt)",
          "Präsenzpflicht für die Sitzungsleitung und die Hauptverwaltungsbeamtin oder den Hauptverwaltungsbeamten",
          "klare Regeln zu technischen Störungen und zur Beschlussfähigkeit",
          "geheime Wahlen grundsätzlich nur im Sitzungsraum",
          "reine Videositzungen nur in außergewöhnlichen Notlagen, befristet auf drei Monate",
          "entsprechende Anwendung auf Ausschüsse, Ortsräte, Beiräte, Kreistage und Zweckverbände",
        ],
      },
      { t: "h3", text: "3. Gesetzgebungskompetenz" },
      {
        t: "p",
        text: "Die Gesetzgebungskompetenz des Landes für das Kommunalverfassungsrecht folgt aus Artikel 70 Abs. 1 des Grundgesetzes.",
      },
      { t: "h3", text: "4. Auswirkungen auf Gleichstellung, Inklusion und Datenschutz" },
      {
        t: "p",
        text: "Die Regelung erleichtert Personen mit Sorge- und Pflegeverantwortung – überwiegend Frauen – die Ausübung eines kommunalen Mandats. Menschen mit Behinderungen können an Sitzungen teilnehmen, ohne den Sitzungsraum aufsuchen zu müssen; die eingesetzte Technik muss barrierefrei bedienbar sein. Bei der Übertragung werden personenbezogene Daten der Mitglieder verarbeitet. Rechtsgrundlage ist Artikel 6 Abs. 1 Buchstabe e der Datenschutz-Grundverordnung in Verbindung mit § 35a KV. Die Kommunen haben bei der Auswahl der Videokonferenzsysteme die Anforderungen an die Informationssicherheit zu beachten; das Ministerium wird hierzu Hinweise geben.",
      },
      { t: "h3", text: "5. Befristung und Evaluierung" },
      {
        t: "p",
        text: "Eine Befristung ist nicht vorgesehen. Artikel 3 Abs. 2 verpflichtet die Landesregierung zu einem Erfahrungsbericht bis Ende 2028, der insbesondere die Zahl der Kommunen mit entsprechender Hauptsatzungsregelung, technische Probleme und Anfechtungen von Beschlüssen auswertet.",
      },
      { t: "h3", text: "6. Anhörung" },
      {
        t: "p",
        text: "Im Rahmen der **Verbändeanhörung** werden der Städte- und Gemeindebund (Landesverband), der Landkreistag, der Städtetag, die Arbeitsgemeinschaft der kommunalen Gleichstellungsbeauftragten, der Landesbeauftragte für Menschen mit Behinderungen und die oder der Landesbeauftragte für den Datenschutz beteiligt.",
      },
      { t: "h2", text: "B. Besonderer Teil" },
      { t: "h3", text: "Zu Artikel 1 Nr. 2 (§ 35a KV)" },
      {
        t: "p",
        text: "**Zu Absatz 1:** Die Einführung setzt eine Regelung in der Hauptsatzung voraus. Die Hauptsatzung kann die hybride Teilnahme auf bestimmte Gremien oder Gründe beschränken (z. B. Krankheit, Betreuungspflichten, Dienstreisen) und eine Höchstzahl zugeschalteter Mitglieder festlegen. Die Präsenzpflicht der Sitzungsleitung stellt sicher, dass die Ordnungsgewalt im Sitzungsraum ausgeübt werden kann.",
      },
      {
        t: "p",
        text: "**Zu Absatz 2:** Die Vertraulichkeit nichtöffentlicher Sitzungen liegt in der Verantwortung des zugeschalteten Mitglieds. Ein Verstoß kann als Verletzung der Verschwiegenheitspflicht nach § 26 KV geahndet werden. Die dauerhafte Sichtbarkeit in Bild und Ton ist erforderlich, damit die Sitzungsleitung die Anwesenheit feststellen kann.",
      },
      {
        t: "p",
        text: "**Zu Absatz 3:** Die Vorschrift verteilt das Risiko technischer Störungen. Störungen im Bereich des Mitglieds (z. B. eigener Internetanschluss) gehen zu dessen Lasten. Liegt die Störung im Bereich der Kommune (z. B. Ausfall der Übertragungstechnik im Sitzungsraum), ist die Sitzung zu unterbrechen, damit die Mitwirkungsrechte gewahrt bleiben. Die Frist von 30 Minuten orientiert sich an der Praxis der Pandemiezeit.",
      },
      {
        t: "p",
        text: "**Zu Absatz 4:** Für geheime Wahlen steht derzeit kein Verfahren zur Verfügung, das Geheimhaltung und Nachprüfbarkeit gleichermaßen sicherstellt. Die Verordnungsermächtigung erlaubt es, künftige technische Entwicklungen aufzugreifen, ohne das Gesetz erneut ändern zu müssen. Offene Abstimmungen und offene Wahlen sind für zugeschaltete Mitglieder uneingeschränkt möglich.",
      },
      {
        t: "p",
        text: "**Zu Absatz 5:** Der Grundsatz der Sitzungsöffentlichkeit verlangt, dass Zuhörerinnen und Zuhörer im Sitzungsraum die Beiträge aller Mitglieder verfolgen können. Dies kann durch Bildschirm oder Projektion und Lautsprecher geschehen.",
      },
      {
        t: "p",
        text: "**Zu Absatz 6:** Reine Videositzungen bleiben die Ausnahme. Die qualifizierte Mehrheit und die Befristung auf drei Monate verhindern, dass die Präsenzsitzung dauerhaft verdrängt wird. Die Anzeige bei der Kommunalaufsicht dient der Rechtsaufsicht und der Evaluierung.",
      },
      {
        t: "p",
        text: "**Zu Absatz 7:** Die entsprechende Anwendung vermeidet abweichende Regelungen für einzelne Gremien. Für Kreistage tritt die Landrätin oder der Landrat an die Stelle der Hauptverwaltungsbeamtin oder des Hauptverwaltungsbeamten.",
      },
      { t: "h3", text: "Zu Artikel 1 Nr. 3 und 4 (§§ 40, 48 KV)" },
      {
        t: "p",
        text: "Die Fiktion der Anwesenheit stellt klar, dass zugeschaltete Mitglieder bei der Feststellung der Beschlussfähigkeit mitzählen. Die Ergänzung der Niederschrift dient der Nachvollziehbarkeit, insbesondere bei späteren Rügen wegen technischer Störungen.",
      },
      { t: "h3", text: "Zu Artikel 2 (§ 15 GkZ)" },
      {
        t: "p",
        text: "Zweckverbände – etwa im Bereich der kommunalen IT – haben häufig Mitglieder aus einem großen Gebiet. Die entsprechende Anwendung ermöglicht auch hier hybride Sitzungen der Verbandsversammlung.",
      },
      { t: "h3", text: "Zu Artikel 3" },
      {
        t: "p",
        text: "Das Inkrafttreten zum 1. Januar 2026 gibt den Kommunen Zeit, ihre Hauptsatzungen anzupassen und die Technik zu beschaffen. Förderanträge im Programm „Digitale Kommune“ können bis zum 31.03.2026 gestellt werden.",
      },
      { t: "signature", lines: ["Im Auftrag", "Tobias Bergmann", "Referat 31 – Kommunalrecht"] },
    ],
  },
  {
    type: "powerpoint",
    id: "mkv-landesstrategie-verwaltungsdigitalisierung",
    title: "Landesstrategie Verwaltungsdigitalisierung 2030 – Vorstellung im Lenkungskreis",
    kind: "Präsentation",
    fileName: "Landesstrategie Verwaltungsdigitalisierung 2030 Lenkungskreis 2025-06",
    org: "mkv",
    unit: "mkv-51",
    author: "mkv-terhorst",
    date: "2025-06-12",
    tags: [],
    keywords: ["Verwaltungsdigitalisierung 2030", "Lenkungskreis Digitale Verwaltung", "Ende-zu-Ende", "Once-Only", "Kabinettsbeschluss"],
    summary:
      "Vortrag des Grundsatzreferats zur neuen Landesstrategie: fünf Handlungsfelder, Ziele bis 2030, Rolle der Kommunen, Finanzierung und Zeitplan bis zum Kabinettsbeschluss. Gut geeignet, um Kernbotschaften herauszuarbeiten oder eine Kurzfassung für Kommunen zu schreiben.",
    slides: [
      {
        t: "title",
        title: "Verwaltungsdigitalisierung 2030",
        subtitle: "Entwurf der Landesstrategie · Sitzung des Lenkungskreises Digitale Verwaltung am 12. Juni 2025",
      },
      {
        t: "bullets",
        title: "Warum eine neue Strategie?",
        bullets: [
          "Die Strategie von 2019 lief Ende 2024 aus – viele Ziele wurden nur teilweise erreicht",
          { text: "Bürgerinnen und Unternehmen erwarten digitale Leistungen ohne Medienbruch", sub: ["Heute: oft Online-Formular, danach Ausdruck und Papierakte"] },
          "Bis 2030 scheidet rund jede achte Beschäftigte der Landesverwaltung altersbedingt aus",
          "Neue Rahmenbedingungen: OZG-Änderungsgesetz, KI-Verordnung, Registermodernisierung",
        ],
        notes: "Zahl zur Altersabgangslage stammt aus dem Lagebild Personalgewinnung des LPF (4.900 von 38.000 bis 2030).",
      },
      {
        t: "table",
        title: "Fünf Handlungsfelder",
        header: ["Handlungsfeld", "Kernziel bis 2030", "Federführung"],
        rows: [
          ["1 Digitale Leistungen", "Alle wichtigen Leistungen Ende-zu-Ende digital", "Referat 52"],
          ["2 Digitale Arbeit", "E-Akte in allen Landesbehörden, papierarme Vorgänge", "Referat 51 mit Ressorts"],
          ["3 Daten und Register", "Once-Only für die 20 häufigsten Nachweise", "Referat 52"],
          ["4 Sichere Infrastruktur", "Gemeinsame Basisdienste, IT-Grundschutz flächendeckend", "Referat 53"],
          ["5 Menschen und Kompetenzen", "Digitale Grundkompetenz für alle Beschäftigten", "Referat 51 mit LPF"],
        ],
        notes: "KI ist bewusst kein eigenes Handlungsfeld, sondern Querschnitt – Referat 54 bringt Beiträge zu allen fünf Feldern ein.",
      },
      {
        t: "chart",
        title: "Zielpfad: Leistungen Ende-zu-Ende digital",
        chart: {
          type: "line",
          categories: ["2024", "2025", "2026", "2027", "2028", "2029", "2030"],
          series: [
            { name: "Land (Ziel)", values: [28, 35, 45, 58, 70, 82, 90] },
            { name: "Kommunen (Ziel)", values: [19, 24, 32, 42, 54, 66, 75] },
          ],
          unit: "% der Leistungen",
        },
        caption: "2024: Ist-Werte aus dem Umsetzungsmonitoring; ab 2025 Zielwerte",
      },
      {
        t: "twocol",
        title: "Was das Land leistet – was wir von den Kommunen erwarten",
        left: {
          heading: "Land",
          bullets: [
            "Basisdienste kostenfrei: Servicekonto, Bezahldienst, Postfach",
            "Förderprogramm „Digitale Kommune“ fortführen",
            "Musterprozesse und Nachnutzung statt Eigenentwicklung",
            "Fortbildungsangebot über das LPF auch für Kommunen",
          ],
        },
        right: {
          heading: "Kommunen",
          bullets: [
            "Basisdienste des Landes anbinden",
            "Interkommunale Zusammenarbeit bei IT ausbauen",
            "Verantwortliche für Digitalisierung benennen",
            "Daten zum Umsetzungsstand jährlich melden",
          ],
        },
        notes: "Die kommunalen Spitzenverbände haben signalisiert, dass sie eine Pflicht zur Anbindung der Basisdienste nur mit Finanzausgleich mittragen.",
      },
      {
        t: "table",
        title: "Finanzierung (Planungsstand)",
        header: ["Baustein", "Jährlich", "Zeitraum"],
        rows: [
          ["Förderprogramm „Digitale Kommune“", "20 Mio. €", "2025 bis 2030"],
          ["Basisdienste und Landesportal", "11,5 Mio. €", "laufend"],
          ["E-Akte Landesverwaltung (Rollout)", "8,2 Mio. €", "2025 bis 2028"],
          ["Qualifizierung über das LPF", "1,4 Mio. €", "2026 bis 2030"],
        ],
        notes: "Die Ansätze ab 2027 stehen unter dem Vorbehalt der Haushaltsaufstellung. Z 2 hat um Darstellung als Verpflichtungsermächtigungen gebeten.",
      },
      {
        t: "bullets",
        title: "Steuerung und Messung",
        bullets: [
          "Lenkungskreis Digitale Verwaltung: Staatssekretärsebene, tagt zweimal im Jahr",
          "Jährlicher Umsetzungsbericht an das Kabinett und den Landtag",
          "Öffentliches Dashboard mit 12 Kennzahlen (z. B. Anteil Ende-zu-Ende, Nutzung Servicekonto)",
          "Kommunale Spitzenverbände ständig beteiligt",
        ],
      },
      {
        t: "table",
        title: "Zeitplan",
        header: ["Schritt", "Termin"],
        rows: [
          ["Ressortabstimmung des Entwurfs", "bis 31.07.2025"],
          ["Anhörung der kommunalen Spitzenverbände", "August/September 2025"],
          ["Kabinettsbeschluss", "Oktober 2025"],
          ["Unterrichtung des Landtags", "November 2025"],
          ["Erster Umsetzungsbericht", "Juni 2026"],
        ],
      },
      {
        t: "bullets",
        title: "Bitte an den Lenkungskreis",
        bullets: [
          "Zustimmung zu den fünf Handlungsfeldern und den Kernzielen",
          "Benennung je einer Ansprechperson pro Ressort bis 30.06.2025",
          "Rückmeldung zu den Kennzahlen des Dashboards bis zur Ressortabstimmung",
        ],
        notes: "Rückfrage aus dem Finanzressort erwartet: Ist das Ziel 90 % Ende-zu-Ende bis 2030 realistisch? Antwort: Es bezieht sich auf die 150 meistgenutzten Leistungen, nicht auf alle.",
      },
      { t: "end", title: "Vielen Dank", lines: ["Dr. Bastian Terhorst · Referat 51 – Grundsatzfragen der Verwaltungsmodernisierung", "Telefon 069 90009-964"] },
    ],
  },
  {
    type: "excel",
    id: "mkv-umsetzungsstand-onlinedienste-kommunen",
    title: "Umsetzungsstand Onlinedienste in den Kommunen – Region Altmoorland und Falkenbrück",
    kind: "Monitoring",
    fileName: "Umsetzungsmonitoring Onlinedienste Kommunen Stand 2025-10-31",
    org: "mkv",
    unit: "mkv-52",
    author: "mkv-quast",
    date: "2025-11-20",
    tags: ["zahlen"],
    keywords: ["Ende-zu-Ende", "Anwohnerparkausweis", "Online-Anträge", "Basisdienste des Landesportals", "Zweckverband Kommunale IT Altmoor"],
    summary:
      "Monitoring-Tabelle mit verfügbaren und Ende-zu-Ende-digitalen Onlinediensten je Kommune sowie nach Leistungen. Geeignet für Auswertungen, Ranglisten, Diagramme und eine Folie für die Kommunalaufsicht.",
    sheets: [
      {
        name: "Kommunen",
        title: "Onlinedienste nach Kommunen",
        subtitle: "Stand 31.10.2025 · Selbstauskunft der Kommunen, plausibilisiert durch Referat 52",
        columns: [
          { header: "Kommune", width: 28 },
          { header: "IT-Dienstleister", width: 30 },
          { header: "Zuständige Leistungen", width: 12, fmt: "int" },
          { header: "online verfügbar", width: 11, fmt: "int" },
          { header: "Ende-zu-Ende digital", width: 11, fmt: "int" },
          { header: "Quote online", width: 10, fmt: "pct" },
          { header: "Quote Ende-zu-Ende", width: 11, fmt: "pct" },
          { header: "Online-Anträge 2024", width: 12, fmt: "int" },
          { header: "Online-Anträge 2025 (Jan–Okt)", width: 14, fmt: "int" },
        ],
        rows: [
          ["Stadt Falkenbrück", "eigene IT (Amt 12)", 214, 139, 71, { f: "D{r}/C{r}" }, { f: "E{r}/C{r}" }, 48200, 51900],
          ["Landkreis Altmoorland", "Zweckverband Kommunale IT Altmoor", 168, 97, 52, { f: "D{r}/C{r}" }, { f: "E{r}/C{r}" }, 21400, 24800],
          ["Stadt Rabensfurt", "eigene IT (Wechsel zum ZKIT 07/2026)", 131, 58, 22, { f: "D{r}/C{r}" }, { f: "E{r}/C{r}" }, 6900, 7300],
          ["Stadt Altmoor", "Zweckverband Kommunale IT Altmoor", 124, 79, 41, { f: "D{r}/C{r}" }, { f: "E{r}/C{r}" }, 5100, 5800],
          ["Gemeinde Fennhusen", "Basisdienste des Landesportals", 102, 61, 30, { f: "D{r}/C{r}" }, { f: "E{r}/C{r}" }, 1900, 2300],
          ["Gemeinde Torfkamp", "Basisdienste des Landesportals", 98, 59, 28, { f: "D{r}/C{r}" }, { f: "E{r}/C{r}" }, 1400, 1700],
          ["Gemeinde Brackenhain", "Zweckverband Kommunale IT Altmoor", 96, 58, 27, { f: "D{r}/C{r}" }, { f: "E{r}/C{r}" }, 1100, 1350],
          ["Gemeinde Schilfwerder", "Basisdienste des Landesportals", 94, 41, 16, { f: "D{r}/C{r}" }, { f: "E{r}/C{r}" }, 600, 780],
          ["Gemeinde Lütjenbrook", "Basisdienste des Landesportals", 92, 38, 12, { f: "D{r}/C{r}" }, { f: "E{r}/C{r}" }, 310, 420],
          ["Gemeinde Krähenwerder", "Basisdienste des Landesportals", 90, 35, 11, { f: "D{r}/C{r}" }, { f: "E{r}/C{r}" }, 190, 260],
          {
            total: true,
            cells: [
              "Summe / Durchschnitt",
              "",
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "D{r}/C{r}" },
              { f: "E{r}/C{r}" },
              { f: "SUM(H{first}:H{last})" },
              { f: "SUM(I{first}:I{last})" },
            ],
          },
        ],
        notes: [
          "Zuständige Leistungen: Leistungen des Leistungskatalogs, für die die Kommune nach Landesrecht zuständig ist (Landkreis ohne Meldewesen, Gemeinden ohne Kfz-Zulassung und Bauaufsicht).",
          "Ende-zu-Ende digital: Antrag, Bearbeitung und Bescheid ohne Medienbruch (keine Ausdrucke, elektronische Akte, Bescheid ins Postfach).",
          "Online-Anträge 2025 umfassen nur Januar bis Oktober; eine Hochrechnung auf das Gesamtjahr ist nicht enthalten.",
        ],
      },
      {
        name: "Leistungen",
        title: "Ausgewählte Leistungen im Vergleich",
        subtitle: "Anzahl der zuständigen Kommunen aus Blatt „Kommunen“ und davon digital angeboten",
        columns: [
          { header: "Leistung", width: 40 },
          { header: "zuständige Kommunen", width: 12, fmt: "int" },
          { header: "davon online", width: 11, fmt: "int" },
          { header: "davon Ende-zu-Ende", width: 12, fmt: "int" },
          { header: "Quote online", width: 10, fmt: "pct" },
          { header: "Bemerkung", width: 44 },
        ],
        rows: [
          ["Meldebescheinigung", 9, 9, 8, { f: "C{r}/B{r}" }, "Basisdienst des Landes, in fast allen Kommunen angebunden"],
          ["Elektronische Wohnsitzanmeldung", 9, 5, 3, { f: "C{r}/B{r}" }, "Schnittstelle zum Melderegister fehlt in vier Kommunen"],
          ["Anwohnerparkausweis", 3, 3, 2, { f: "C{r}/B{r}" }, "nur Kommunen mit Parkraumbewirtschaftung"],
          ["Gewerbeanmeldung", 9, 8, 5, { f: "C{r}/B{r}" }, "Weiterleitung an Kammern teils noch per Post"],
          ["Hundesteuer An- und Abmeldung", 9, 7, 6, { f: "C{r}/B{r}" }, ""],
          ["Kita-Platz-Vormerkung", 10, 5, 2, { f: "C{r}/B{r}" }, "unterschiedliche Vormerksysteme der Träger"],
          ["Wohngeld", 2, 2, 1, { f: "C{r}/B{r}" }, "Landkreis und Falkenbrück; Bescheid noch per Post"],
          ["Digitaler Bauantrag", 2, 2, 1, { f: "C{r}/B{r}" }, "Bauaufsicht Landkreis: E-Akte ab 2026"],
          ["Kfz-Zulassung (internetbasiert)", 2, 2, 2, { f: "C{r}/B{r}" }, "Bundesportal angebunden"],
          ["Sondernutzungserlaubnis", 10, 4, 1, { f: "C{r}/B{r}" }, "häufig nur PDF-Formular"],
          ["Personenstandsurkunden", 9, 7, 5, { f: "C{r}/B{r}" }, ""],
          ["Fischereischein", 2, 1, 0, { f: "C{r}/B{r}" }, "Gebührenzahlung noch nicht online"],
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "C{r}/B{r}" }, ""],
          },
        ],
        notes: ["Die Stadt Rabensfurt hat mitgeteilt, dass sie neue Onlinedienste bis zum Wechsel zum Zweckverband Kommunale IT Altmoor zurückstellt."],
      },
    ],
  },
  {
    type: "excel",
    id: "mkv-kennzahlen-kommunalfinanzen-altmoorland",
    title: "Kennzahlen Kommunalfinanzen 2026 – Falkenbrück und Landkreis Altmoorland mit Gemeinden",
    kind: "Kennzahlenübersicht",
    fileName: "Kennzahlen Kommunalfinanzen 2026 Falkenbrueck Altmoorland",
    org: "mkv",
    unit: "mkv-33",
    author: "mkv-freitag",
    date: "2026-02-10",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Liquiditätskredite", "Haushaltssicherungskonzept", "Umlagegrundlagen", "Kreisumlage 2026", "Grundsteuer B"],
    summary:
      "Arbeitstabelle des Referats Kommunalfinanzen mit Planergebnissen 2026, Krediten, Kreisumlage und Hebesätzen. Eingebaute Widersprüche: Rabensfurt hat auf zwei Blättern unterschiedliche Einwohnerzahlen, und die Kreisumlage wird mit 33,5 % statt der in der Überschrift genannten 34,5 % berechnet.",
    sheets: [
      {
        name: "Ergebnisse",
        title: "Haushaltsplanung 2026 und Verschuldung",
        subtitle: "Planwerte Ergebnishaushalt 2026 · Kreditstände 31.12.2025 (vorläufig) · Beträge in Euro",
        columns: [
          { header: "Kommune", width: 26 },
          { header: "Einwohner 31.12.2024", width: 12, fmt: "int" },
          { header: "Ordentliche Erträge 2026", width: 16, fmt: "eur0" },
          { header: "Ordentliche Aufwendungen 2026", width: 16, fmt: "eur0" },
          { header: "Jahresergebnis 2026", width: 15, fmt: "eur0" },
          { header: "Ergebnis je Einwohner", width: 11, fmt: "eur" },
          { header: "Liquiditätskredite", width: 15, fmt: "eur0" },
          { header: "Liquiditätskredite je Einwohner", width: 12, fmt: "eur0" },
          { header: "Investitionskredite", width: 15, fmt: "eur0" },
          { header: "Haushaltssicherungskonzept", width: 14 },
        ],
        rows: [
          ["Stadt Falkenbrück", 218400, 1081400000, 1120000000, { f: "C{r}-D{r}" }, { f: "E{r}/B{r}" }, 186000000, { f: "G{r}/B{r}" }, 655000000, "ja"],
          ["Landkreis Altmoorland", 101840, 318400000, 324900000, { f: "C{r}-D{r}" }, { f: "E{r}/B{r}" }, 18500000, { f: "G{r}/B{r}" }, 96400000, "nein"],
          ["Stadt Rabensfurt", 36800, 74900000, 76850000, { f: "C{r}-D{r}" }, { f: "E{r}/B{r}" }, 9200000, { f: "G{r}/B{r}" }, 41700000, "ja"],
          ["Stadt Altmoor", 24100, 46200000, 46680000, { f: "C{r}-D{r}" }, { f: "E{r}/B{r}" }, 2100000, { f: "G{r}/B{r}" }, 18900000, "nein"],
          ["Gemeinde Fennhusen", 11200, 19850000, 19640000, { f: "C{r}-D{r}" }, { f: "E{r}/B{r}" }, 0, { f: "G{r}/B{r}" }, 7800000, "nein"],
          ["Gemeinde Torfkamp", 9400, 15920000, 16180000, { f: "C{r}-D{r}" }, { f: "E{r}/B{r}" }, 650000, { f: "G{r}/B{r}" }, 5300000, "nein"],
          ["Gemeinde Brackenhain", 6840, 11898000, 12310000, { f: "C{r}-D{r}" }, { f: "E{r}/B{r}" }, 0, { f: "G{r}/B{r}" }, 4863000, "ja"],
          ["Gemeinde Schilfwerder", 5100, 8640000, 8590000, { f: "C{r}-D{r}" }, { f: "E{r}/B{r}" }, 0, { f: "G{r}/B{r}" }, 2900000, "nein"],
          ["Gemeinde Lütjenbrook", 3900, 6410000, 6720000, { f: "C{r}-D{r}" }, { f: "E{r}/B{r}" }, 480000, { f: "G{r}/B{r}" }, 1700000, "ja"],
          ["Gemeinde Krähenwerder", 2700, 4380000, 4465000, { f: "C{r}-D{r}" }, { f: "E{r}/B{r}" }, 120000, { f: "G{r}/B{r}" }, 950000, "nein"],
          {
            total: true,
            cells: [
              "Summe",
              { f: "SUM(B{first}:B{last})" },
              { f: "SUM(C{first}:C{last})" },
              { f: "SUM(D{first}:D{last})" },
              { f: "SUM(E{first}:E{last})" },
              { f: "E{r}/B{r}" },
              { f: "SUM(G{first}:G{last})" },
              { f: "G{r}/B{r}" },
              { f: "SUM(I{first}:I{last})" },
              "",
            ],
          },
        ],
        notes: [
          "Haushaltssicherungskonzept nach § 110 Abs. 8 KV erforderlich, wenn der Fehlbetrag nicht aus der Rücklage aus Überschüssen des ordentlichen Ergebnisses gedeckt werden kann (Landkreis: Deckung aus der Überschussrücklage).",
          "Einwohner Landkreis: Summe der acht kreisangehörigen Gemeinden; der Landkreis ist in der Summenzeile mit enthalten (Doppelzählung bei Einwohnern beachten).",
          "Quelle: Haushaltssatzungen 2026, Meldungen der Kommunen zur Kreditstatistik (vorläufig).",
        ],
      },
      {
        name: "Kreisumlage",
        title: "Kreisumlage 2026 – Landkreis Altmoorland",
        subtitle: "Kreisumlagesatz 2025: 33,0 % · Kreisumlagesatz 2026: 34,5 % (Haushaltssatzung des Landkreises)",
        columns: [
          { header: "Gemeinde", width: 26 },
          { header: "Einwohner 31.12.2024", width: 12, fmt: "int" },
          { header: "Umlagegrundlagen 2025", width: 16, fmt: "eur0" },
          { header: "Kreisumlage 2025", width: 15, fmt: "eur0" },
          { header: "Umlagegrundlagen 2026", width: 16, fmt: "eur0" },
          { header: "Kreisumlage 2026", width: 15, fmt: "eur0" },
          { header: "Veränderung", width: 14, fmt: "eur0" },
          { header: "Kreisumlage 2026 je Einwohner", width: 12, fmt: "eur0" },
        ],
        rows: [
          ["Stadt Rabensfurt", 38600, 60912000, { f: "ROUND(C{r}*0.33,0)" }, 62146000, { f: "ROUND(E{r}*0.335,0)" }, { f: "F{r}-D{r}" }, { f: "F{r}/B{r}" }],
          ["Stadt Altmoor", 24100, 36488000, { f: "ROUND(C{r}*0.33,0)" }, 37114000, { f: "ROUND(E{r}*0.335,0)" }, { f: "F{r}-D{r}" }, { f: "F{r}/B{r}" }],
          ["Gemeinde Fennhusen", 11200, 15906000, { f: "ROUND(C{r}*0.33,0)" }, 16464000, { f: "ROUND(E{r}*0.335,0)" }, { f: "F{r}-D{r}" }, { f: "F{r}/B{r}" }],
          ["Gemeinde Torfkamp", 9400, 12540000, { f: "ROUND(C{r}*0.33,0)" }, 12972000, { f: "ROUND(E{r}*0.335,0)" }, { f: "F{r}-D{r}" }, { f: "F{r}/B{r}" }],
          ["Gemeinde Brackenhain", 6840, 9918000, { f: "ROUND(C{r}*0.33,0)" }, 10420000, { f: "ROUND(E{r}*0.335,0)" }, { f: "F{r}-D{r}" }, { f: "F{r}/B{r}" }],
          ["Gemeinde Schilfwerder", 5100, 6702000, { f: "ROUND(C{r}*0.33,0)" }, 6885000, { f: "ROUND(E{r}*0.335,0)" }, { f: "F{r}-D{r}" }, { f: "F{r}/B{r}" }],
          ["Gemeinde Lütjenbrook", 3900, 5031000, { f: "ROUND(C{r}*0.33,0)" }, 5148000, { f: "ROUND(E{r}*0.335,0)" }, { f: "F{r}-D{r}" }, { f: "F{r}/B{r}" }],
          ["Gemeinde Krähenwerder", 2700, 4215000, { f: "ROUND(C{r}*0.33,0)" }, 3807000, { f: "ROUND(E{r}*0.335,0)" }, { f: "F{r}-D{r}" }, { f: "F{r}/B{r}" }],
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
              { f: "F{r}/B{r}" },
            ],
          },
        ],
        notes: [
          "Umlagegrundlagen: Steuerkraftmesszahlen und Schlüsselzuweisungen nach dem Festsetzungsbescheid des Landes vom 09.01.2026 (Referenzzeitraum 01.07.2024 bis 30.06.2025); Quelle: Festsetzung der Kreisumlage 2026 durch den Landkreis vom 20.01.2026.",
          "Umlagesatz nach § 5 der Haushaltssatzung 2026 des Landkreises, beschlossen vom Kreistag am 11.12.2025; die Festsetzungsbescheide sind den Gemeinden bis 30.01.2026 zugegangen.",
        ],
      },
      {
        name: "Hebesätze",
        title: "Realsteuer-Hebesätze 2026",
        columns: [
          { header: "Kommune", width: 26 },
          { header: "Grundsteuer A", width: 12, fmt: "int" },
          { header: "Grundsteuer B", width: 12, fmt: "int" },
          { header: "Gewerbesteuer", width: 12, fmt: "int" },
          { header: "Grundsteuer B Vorjahr", width: 12, fmt: "int" },
          { header: "Veränderung Grundsteuer B (Punkte)", width: 14, fmt: "int" },
        ],
        rows: [
          ["Stadt Rabensfurt", 350, 495, 420, 470, { f: "C{r}-E{r}" }],
          ["Stadt Altmoor", 360, 470, 400, 470, { f: "C{r}-E{r}" }],
          ["Gemeinde Fennhusen", 380, 435, 370, 420, { f: "C{r}-E{r}" }],
          ["Gemeinde Torfkamp", 380, 425, 365, 410, { f: "C{r}-E{r}" }],
          ["Gemeinde Brackenhain", 360, 425, 380, 410, { f: "C{r}-E{r}" }],
          ["Gemeinde Schilfwerder", 370, 415, 360, 405, { f: "C{r}-E{r}" }],
          ["Gemeinde Lütjenbrook", 400, 440, 360, 410, { f: "C{r}-E{r}" }],
          ["Gemeinde Krähenwerder", 370, 399, 355, 390, { f: "C{r}-E{r}" }],
          ["Stadt Falkenbrück (kreisfrei, nachrichtlich)", 320, 595, 470, 595, { f: "C{r}-E{r}" }],
          {
            total: true,
            cells: [
              "Durchschnitt Gemeinden im Landkreis (ungewichtet)",
              { f: "ROUND(AVERAGE(B5:B12),0)" },
              { f: "ROUND(AVERAGE(C5:C12),0)" },
              { f: "ROUND(AVERAGE(D5:D12),0)" },
              { f: "ROUND(AVERAGE(E5:E12),0)" },
              { f: "C{r}-E{r}" },
            ],
          },
        ],
        notes: ["Hebesätze nach der Grundsteuerreform; aufkommensneutrale Hebesätze laut Transparenzregister des Landes sind nicht berücksichtigt.", "Falkenbrück: Anhebung der Gewerbesteuer auf 490 % ab 2027 im Haushaltsentwurf vorgesehen."],
      },
    ],
  },
  {
    type: "powerpoint",
    id: "mkv-zwischenbilanz-ki-pilot",
    title: "KI-Pilot der Landesverwaltung – Zwischenbilanz nach vier Monaten",
    kind: "Präsentation",
    fileName: "Zwischenbilanz KI-Pilot Landesverwaltung Stand 2026-01",
    org: "mkv",
    unit: "mkv-54",
    author: "mkv-albers",
    date: "2026-02-26",
    tags: ["zahlen"],
    keywords: ["rund 300 Beschäftigte", "241.000 €", "Befragung", "Vorfälle", "Dienstvereinbarung"],
    summary:
      "Zwischenbilanz des KI-Piloten für die Staatssekretärsrunde: Nutzung, Einsatzzwecke, Befragungsergebnisse, Vorfälle, Kosten und Empfehlung zur Ausweitung. Geeignet zum Prüfen der Kostensumme, zum Vergleich mit der Presseantwort vom Oktober 2025 und für eine Kurzfassung.",
    slides: [
      { t: "title", title: "KI-Pilot der Landesverwaltung", subtitle: "Zwischenbilanz Oktober 2025 bis Januar 2026 · Staatssekretärsrunde am 5. März 2026" },
      {
        t: "bullets",
        title: "Der Pilot auf einen Blick",
        bullets: [
          "Laufzeit 01.10.2025 bis 30.06.2026 · rund 300 Beschäftigte aus drei Ressorts und dem LPF",
          { text: "304 Zugänge freigeschaltet, davon 271 im Januar aktiv (89 %)", sub: ["aktiv = mindestens eine Anfrage pro Woche"] },
          "Voraussetzung: Kurs „KI im Verwaltungsalltag – Grundlagen“ beim LPF – 296 Teilnehmende haben ihn abgeschlossen",
          "KI-Leitfaden der Landesverwaltung seit 25.11.2025 verbindlich",
        ],
        notes: "Acht Personen haben den Zugang ohne abgeschlossene Schulung erhalten (Übergangsregel bis 31.12.2025). Bitte nicht als Problem darstellen – die Schulung wurde nachgeholt.",
      },
      {
        t: "chart",
        title: "Aktive Nutzende je Monat",
        chart: {
          type: "bar",
          categories: ["Oktober", "November", "Dezember", "Januar"],
          series: [{ name: "aktive Nutzende", values: [118, 204, 247, 271] }],
          unit: "Personen",
        },
        caption: "Quelle: Nutzungsstatistik des Betreibers, pseudonymisiert",
      },
      {
        t: "chart",
        title: "Wofür wird der KI-Assistent genutzt?",
        chart: {
          type: "pie",
          categories: ["Texte entwerfen", "Zusammenfassen", "Recherche und Erklären", "Umformulieren, Leichte Sprache", "Tabellen und Formeln", "Übersetzen", "Sonstiges"],
          series: [{ name: "Anteil an Anfragen in %", values: [31, 24, 15, 11, 9, 6, 4] }],
        },
        notes: "Stichprobe von 2.000 Anfragen, durch das Projektteam nach Kategorien ausgewertet. Inhalte wurden dabei nicht gespeichert.",
      },
      {
        t: "table",
        title: "Befragung der Teilnehmenden (Januar 2026, n = 212)",
        header: ["Aussage", "Zustimmung"],
        rows: [
          ["Der KI-Assistent spart mir Zeit", "78 %"],
          ["Die Ergebnisse sind ohne große Nacharbeit brauchbar", "54 %"],
          ["Ich prüfe die Ergebnisse immer vor der Verwendung", "91 %"],
          ["Ich bin unsicher, welche Daten ich eingeben darf", "37 %"],
          ["Ich möchte den KI-Assistenten nach dem Pilot weiter nutzen", "86 %"],
        ],
        notes: "Geschätzte Zeitersparnis laut Selbstauskunft: im Mittel 2,1 Stunden pro Woche. Das ist eine subjektive Angabe und sollte nicht hochgerechnet werden.",
      },
      {
        t: "twocol",
        title: "Was gut läuft – wo es hakt",
        left: {
          heading: "Gut",
          bullets: ["Hohe Akzeptanz nach der Schulung", "Entwürfe für Schreiben und Vermerke deutlich schneller", "Leichte Sprache wird stark nachgefragt", "Betrieb stabil, keine Ausfälle über 2 Stunden"],
        },
        right: {
          heading: "Hakt",
          bullets: [
            "Erfundene Fundstellen und Paragrafen",
            "Unsicherheit beim Datenschutz (37 %)",
            "Keine Anbindung an die E-Akte",
            "Wartezeiten zur Mittagszeit",
          ],
        },
      },
      {
        t: "bullets",
        title: "Gemeldete Vorfälle",
        bullets: [
          "Drei Vorfälle gemeldet, keiner mit Schaden",
          { text: "Zweimal personenbezogene Daten eingegeben", sub: ["Namen und Anschrift aus einer Beschwerde", "Bewertung mit Datenschutzbeauftragter: kein meldepflichtiger Vorfall, da freigegebene Anwendung"] },
          "Einmal falsches Aktenzeichen in einem Antwortentwurf – vor Versand bemerkt",
        ],
      },
      {
        t: "table",
        title: "Kosten bis 31.01.2026",
        header: ["Position", "Betrag"],
        rows: [
          ["Lizenzen (300 Plätze, Abrechnung monatlich)", "148.000 €"],
          ["Betrieb im Landesrechenzentrum", "52.000 €"],
          ["Schulungen durch das LPF", "26.000 €"],
          ["Externe Projektbegleitung", "15.000 €"],
          ["Summe", "241.000 €"],
        ],
        notes: "Gegenüber der Presseauskunft vom Oktober 2025 (185.000 €) sind die Monate November bis Januar hinzugekommen.",
      },
      {
        t: "bullets",
        title: "Empfehlung und Entscheidungsbedarf",
        bullets: [
          "Pilot bis 31.12.2026 verlängern und ab 01.07.2026 auf 1.500 Beschäftigte ausweiten",
          "Haushaltsmittel 2027: rund 780.000 € (Anmeldung durch Z 2 bis 15.04.2026)",
          "Dienstvereinbarung mit dem Hauptpersonalrat vor der Ausweitung abschließen",
          "Pflichtschulung und Leitfaden bleiben Voraussetzung für jeden Zugang",
        ],
        notes: "Der Hauptpersonalrat hat signalisiert, dass er einer Ausweitung nur mit Dienstvereinbarung zustimmt. Erster Gesprächstermin: 18.03.2026.",
      },
      { t: "end", title: "Fragen und Diskussion", lines: ["Matthias Albers · Referat 54 – Künstliche Intelligenz in der Verwaltung"] },
    ],
  },
  {
    type: "powerpoint",
    id: "mkv-kommunalfinanzbericht-ausschuss-2026",
    title: "Bericht zur Finanzlage der Kommunen 2025 – Ausschuss für Inneres und Kommunales",
    kind: "Präsentation",
    fileName: "Kommunalfinanzbericht 2025 Ausschuss Inneres und Kommunales 2026-03-12",
    org: "mkv",
    unit: "mkv-a3",
    author: "mkv-stahl",
    date: "2026-03-12",
    tags: ["zahlen"],
    keywords: ["Finanzierungssaldo", "2,14 Mrd. €", "118 Kommunen", "Schlüsselmasse", "Ausschuss für Inneres und Kommunales"],
    summary:
      "Vortrag der Abteilung Kommunalaufsicht im Landtagsausschuss: Finanzierungssalden, Liquiditätskredite, Ausgabenstruktur, Haushaltssicherung und Maßnahmen des Landes. Geeignet zum Abgleich mit der Antwort auf die Kleine Anfrage und der Kennzahlentabelle sowie für eine Pressemitteilung.",
    slides: [
      { t: "title", title: "Finanzlage der Kommunen 2025", subtitle: "Bericht im Ausschuss für Inneres und Kommunales des Landtags · 12. März 2026" },
      {
        t: "bullets",
        title: "Kernaussagen",
        bullets: [
          "Kommunaler Finanzierungssaldo 2025: **−1,26 Mrd. €** (2024: −0,98 Mrd. €)",
          "Liquiditätskredite Ende 2025: **2,14 Mrd. €** – plus 14 % gegenüber dem Vorjahr",
          "118 Kommunen müssen 2026 ein Haushaltssicherungskonzept aufstellen (2025: 84)",
          "Sozial- und Personalaufwendungen wachsen deutlich schneller als die Steuereinnahmen",
        ],
        notes: "Werte 2025 sind vorläufig (Kassenstatistik viertes Quartal). Endgültige Zahlen liegen im Herbst vor.",
      },
      {
        t: "chart",
        title: "Finanzierungssaldo der Kommunen",
        chart: {
          type: "line",
          categories: ["2021", "2022", "2023", "2024", "2025"],
          series: [{ name: "Saldo in Mrd. €", values: [0.55, 0.42, -0.31, -0.98, -1.26] }],
          unit: "Mrd. €",
        },
        caption: "Alle Kommunen des Landes einschließlich Landkreise; 2025 vorläufig",
      },
      {
        t: "chart",
        title: "Liquiditätskredite zum Jahresende",
        chart: {
          type: "bar",
          categories: ["2021", "2022", "2023", "2024", "2025"],
          series: [{ name: "Liquiditätskredite", values: [1.62, 1.55, 1.61, 1.87, 2.14] }],
          unit: "Mrd. €",
        },
        notes: "Rund 41 % der Liquiditätskredite entfallen auf die vier kreisfreien Städte.",
      },
      {
        t: "chart",
        title: "Struktur der ordentlichen Aufwendungen 2025",
        chart: {
          type: "pie",
          categories: ["Transferaufwendungen (Soziales, Jugend)", "Personal", "Sach- und Dienstleistungen", "Zinsen", "Sonstiges"],
          series: [{ name: "Anteil in %", values: [38, 27, 19, 2, 14] }],
        },
      },
      {
        t: "table",
        title: "Haushaltssicherung 2026 nach Art der Kommune",
        header: ["Art der Kommune", "Anzahl", "davon mit HSK", "Anteil"],
        rows: [
          ["Kreisfreie Städte", "4", "2", "50 %"],
          ["Landkreise", "12", "5", "42 %"],
          ["Kreisangehörige Gemeinden", "386", "111", "29 %"],
          ["Insgesamt", "402", "118", "29 %"],
        ],
        notes: "Beispiel aus dem Landkreis Altmoorland: Die Gemeinde Brackenhain plant 2026 mit einem Fehlbetrag von 412.000 € bei rund 12,3 Mio. € Aufwendungen.",
      },
      {
        t: "twocol",
        title: "Ursachen – und was das Land tut",
        left: {
          heading: "Ursachen",
          bullets: [
            "Tarifabschlüsse 2025 und 2026",
            "Fallzahlen und Kosten in Jugendhilfe und Eingliederungshilfe",
            "Zinsanstieg bei neuen Krediten",
            "Gewerbesteuer stagniert",
          ],
        },
        right: {
          heading: "Land",
          bullets: [
            "Schlüsselmasse 2026: 3,08 Mrd. € (+4,1 %)",
            "Entwurf 2027: 3,17 Mrd. €",
            "Förderprogramm „Digitale Kommune“: 20 Mio. € jährlich",
            "Landesprogramm „Kita-Ausbau 2026“ mit 50 % Förderquote",
          ],
        },
      },
      {
        t: "bullets",
        title: "Ausblick",
        bullets: [
          "Orientierungsdaten für die Haushaltsplanung 2027 mit dem Haushaltserlass im August 2026",
          "Prüfauftrag Altschuldenhilfe: Bericht der Arbeitsgruppe bis Ende 2026",
          "Kommission zur Überprüfung kommunaler Standards nimmt im April 2026 die Arbeit auf",
        ],
        notes: "Zur Altschuldenhilfe keine Zusagen machen – Abstimmung mit dem Finanzministerium läuft. Falls nach Falkenbrück gefragt wird: Fehlbetrag 2026 rund 38,6 Mio. €, Haushaltssicherungskonzept liegt der Kommunalaufsicht vor.",
      },
      { t: "end", title: "Vielen Dank", lines: ["Rüdiger Stahl · Leiter der Abteilung 3 – Kommunalaufsicht und Kommunalfinanzen"] },
    ],
  },
  {
    type: "word",
    id: "mkv-antwort-kleine-anfrage-finanzlage-kommunen",
    title: "Antwort der Landesregierung auf die Kleine Anfrage „Finanzlage der Kommunen und Haushaltssicherung“",
    kind: "Antwort auf Kleine Anfrage",
    fileName: "Drs 19-4127 Antwort Kleine Anfrage Finanzlage der Kommunen",
    org: "mkv",
    unit: "mkv-leitung",
    author: "mkv-kaminski",
    date: "2026-04-21",
    tags: ["zahlen"],
    keywords: ["19/4127", "Hölscher-Brandt", "Haushaltssicherungskonzept", "Liquiditätskredite", "Schlüsselmasse"],
    summary:
      "Antwort des Ministeriums namens der Landesregierung auf acht Fragen zur kommunalen Finanzlage mit Tabellen zu Haushaltssicherung, Liquiditätskrediten, Schlüsselmasse und Fehlbeträgen im Landkreis Altmoorland. Gut für Zusammenfassungen, Zahlenabgleich mit Ausschussbericht und Kennzahlentabelle sowie Leichte Sprache.",
    meta: [
      ["Drucksache", "19/4127"],
      ["Aktenzeichen", "LS-0213/26 (federführend Referat 33)"],
      ["Status", "zur Zuleitung an den Landtag"],
    ],
    subject: "Kleine Anfrage der Abgeordneten Marlene Hölscher-Brandt (Fraktion Ökologische Mitte) – Finanzlage der Kommunen und Haushaltssicherung",
    blocks: [
      { t: "h2", text: "Vorbemerkung der Fragestellerin" },
      {
        t: "p",
        text: "Immer mehr Städte, Gemeinden und Landkreise können ihre Haushalte nicht mehr ausgleichen. Kommunen im ländlichen Raum berichten, dass sie freiwillige Leistungen wie Schwimmbäder, Büchereien oder Jugendtreffs nicht mehr finanzieren können. Gleichzeitig steigen die Kreisumlagen.",
      },
      { t: "h2", text: "Vorbemerkung der Landesregierung" },
      {
        t: "p",
        text: "Die Finanzlage der Kommunen hat sich seit 2023 deutlich verschlechtert. Ursachen sind vor allem die hohen Tarifabschlüsse, steigende Sozial- und Jugendhilfeaufwendungen sowie gestiegene Zinsen. Die Landesregierung hat die Schlüsselmasse im kommunalen Finanzausgleich für 2026 um 4,1 % erhöht und unterstützt die Kommunen mit Förderprogrammen. Die nachfolgenden Angaben für 2025 beruhen auf der vorläufigen Kassenstatistik; sie können sich noch ändern.",
      },
      { t: "p", text: "Dies vorausgeschickt, beantwortet das Ministerium für Kommunales und Verwaltungsentwicklung namens der Landesregierung die Kleine Anfrage wie folgt:" },
      { t: "h3", text: "Frage 1: Wie viele Kommunen mussten in den Jahren 2024 bis 2026 ein Haushaltssicherungskonzept aufstellen?" },
      {
        t: "table",
        header: ["Jahr", "Kreisfreie Städte", "Landkreise", "Kreisangehörige Gemeinden", "Insgesamt"],
        rows: [
          ["2024", "1", "2", "58", "61"],
          ["2025", "2", "3", "79", "84"],
          ["2026", "2", "5", "111", "118"],
        ],
      },
      { t: "h3", text: "Frage 2: Wie hoch waren die Liquiditätskredite der Kommunen jeweils zum Jahresende 2023 bis 2025?" },
      {
        t: "table",
        header: ["Ebene", "31.12.2023", "31.12.2024", "31.12.2025"],
        rows: [
          ["Kreisfreie Städte", "0,66 Mrd. €", "0,77 Mrd. €", "0,88 Mrd. €"],
          ["Landkreise", "0,19 Mrd. €", "0,22 Mrd. €", "0,25 Mrd. €"],
          ["Kreisangehörige Gemeinden", "0,76 Mrd. €", "0,88 Mrd. €", "1,01 Mrd. €"],
          ["Insgesamt", "1,61 Mrd. €", "1,87 Mrd. €", "2,14 Mrd. €"],
        ],
      },
      {
        t: "p",
        text: "Die Liquiditätskredite sind damit innerhalb von zwei Jahren um rund 33 % gestiegen. Der Anteil der kreisfreien Städte liegt bei rund 41 %.",
      },
      { t: "h3", text: "Frage 3: Welche Kommunen im Landkreis Altmoorland weisen in ihrer Haushaltsplanung 2026 einen Fehlbetrag aus?" },
      {
        t: "table",
        header: ["Kommune", "Planergebnis 2026", "Haushaltssicherungskonzept"],
        rows: [
          ["Landkreis Altmoorland", "−6.500.000 €", "nein"],
          ["Stadt Rabensfurt", "−1.950.000 €", "ja"],
          ["Stadt Altmoor", "−480.000 €", "nein"],
          ["Gemeinde Brackenhain", "−412.000 €", "ja"],
          ["Gemeinde Lütjenbrook", "−310.000 €", "ja"],
          ["Gemeinde Torfkamp", "−260.000 €", "nein"],
          ["Gemeinde Krähenwerder", "−85.000 €", "nein"],
        ],
      },
      {
        t: "p",
        text: "Die Gemeinden Fennhusen und Schilfwerder planen 2026 mit einem Überschuss. Kommunen ohne Haushaltssicherungskonzept können den Fehlbetrag aus der Rücklage aus Überschüssen des ordentlichen Ergebnisses decken; der Landkreis Altmoorland verfügt danach noch über eine Überschussrücklage von rund 4,1 Mio. €.",
      },
      { t: "h3", text: "Frage 4: Wie hat sich die Schlüsselmasse im kommunalen Finanzausgleich entwickelt?" },
      {
        t: "table",
        header: ["Jahr", "Schlüsselmasse", "Veränderung zum Vorjahr"],
        rows: [
          ["2024", "2,87 Mrd. €", "+2,5 %"],
          ["2025", "2,96 Mrd. €", "+3,1 %"],
          ["2026", "3,08 Mrd. €", "+4,1 %"],
          ["2027 (Entwurf)", "3,17 Mrd. €", "+2,9 %"],
        ],
      },
      { t: "h3", text: "Frage 5: In welchem Umfang profitieren Kommunen in Haushaltssicherung vom Förderprogramm „Digitale Kommune“?" },
      {
        t: "p",
        text: "Kommunen mit genehmigungspflichtigem Haushaltssicherungskonzept erhalten eine um 15 Prozentpunkte erhöhte Förderquote (höchstens 75 %). Im Programmjahr 2025 gingen 61 von 163 bewilligten Vorhaben an Kommunen in Haushaltssicherung; auf sie entfielen Zuwendungen von rund 7,4 Mio. € der insgesamt bewilligten 19,6 Mio. €. Für das Programmjahr 2026 liegen bis zum Abschluss des Bewilligungsverfahrens im Juni 2026 noch keine Zahlen vor.",
      },
      { t: "h3", text: "Frage 6: Plant die Landesregierung eine Entschuldungshilfe für Kommunen mit hohen Liquiditätskrediten?" },
      {
        t: "p",
        text: "Eine Arbeitsgruppe aus Finanzministerium, Ministerium für Kommunales und Verwaltungsentwicklung und kommunalen Spitzenverbänden prüft Modelle einer Altschuldenhilfe. Sie soll bis Ende 2026 berichten. Die Landesregierung wird dabei auch berücksichtigen, ob und in welcher Form sich der Bund an einer Lösung beteiligt. Eine Festlegung ist vor Abschluss der Prüfung nicht möglich.",
      },
      { t: "h3", text: "Frage 7: Welche landesrechtlichen Vorgaben haben in den letzten Jahren zu zusätzlichen Belastungen der Kommunen geführt?" },
      {
        t: "p",
        text: "Zusätzliche Aufgaben, die das Land den Kommunen übertragen hat, werden nach dem Konnexitätsprinzip ausgeglichen. Zu nennen sind insbesondere der Ausbau der Kindertagesbetreuung, der über das Landesprogramm „Kita-Ausbau 2026“ mit einer Förderquote von 50 % unterstützt wird, und die Umsetzung der Wohngeldreform, für die das Land den Kommunen einen Ausgleich für den Verwaltungsmehraufwand gewährt. Eine Kommission zur Überprüfung kommunaler Standards hat im April 2026 ihre Arbeit aufgenommen; sie soll Vorschläge zum Abbau von Dokumentations- und Berichtspflichten vorlegen.",
      },
      { t: "h3", text: "Frage 8: Wann erhalten die Kommunen die Orientierungsdaten für die Haushaltsplanung 2027?" },
      {
        t: "p",
        text: "Das Ministerium wird die Orientierungsdaten nach Vorliegen der regionalisierten Steuerschätzung mit dem Runderlass zur Haushaltsplanung voraussichtlich im August 2026 bekannt geben.",
      },
      { t: "signature", lines: ["In Vertretung", "Dr. Clemens Hollmann", "Staatssekretär"] },
    ],
  },
  {
    type: "word",
    id: "mkv-foerderrichtlinie-digitale-kommune-2027",
    title: "Förderrichtlinie „Digitale Kommune“ – Neufassung ab Programmjahr 2027 (Entwurf)",
    kind: "Förderrichtlinie (Entwurf)",
    fileName: "2026-05-27 Entwurf Foerderrichtlinie Digitale Kommune 2027 zur Mitzeichnung",
    org: "mkv",
    unit: "mkv-35",
    author: "mkv-sundermann",
    date: "2026-05-27",
    tags: ["widersprueche"],
    keywords: ["FRL Digitale Kommune", "Förderquote", "Höchstbetrag", "Bewertungsmatrix", "Verwendungsnachweis", "Pilotvorhaben Künstliche Intelligenz"],
    summary:
      "Sehr langer Entwurf der neu gefassten Förderrichtlinie mit Förderschwerpunkten, Voraussetzungen, Förderquoten, Verfahren und vier Anlagen. Eingebaute Widersprüche: Der Höchstbetrag je Vorhaben lautet in Nr. 5.3 anders als in Anlage 3, und der Betrag für Onlinedienste weicht zwischen Nr. 5.6 und Anlage 4 ab.",
    meta: [
      ["Aktenzeichen", "35-0485.1/26"],
      ["Stand", "Entwurf vom 27.05.2026 – zur Hausabstimmung"],
      ["Mitzeichnung", "Z 2, Referat 52, Referat 53"],
    ],
    subject: "Richtlinie über die Gewährung von Zuwendungen zur Förderung der Digitalisierung in den Kommunen (FRL Digitale Kommune)",
    blocks: [
      {
        t: "note",
        text: "**Entwurf – Hausabstimmung.** Änderungen gegenüber der Richtlinie vom 12.02.2024 sind in der Vorbemerkung zusammengefasst. Die Beteiligung der kommunalen Spitzenverbände und die Ressortabstimmung mit dem Finanzministerium folgen nach der Hausabstimmung.",
      },
      { t: "h1", text: "Vorbemerkung: Wesentliche Änderungen gegenüber der Richtlinie 2024" },
      {
        t: "ul",
        items: [
          "Neuer Förderschwerpunkt „Digitale Gremienarbeit“ zur Umsetzung von § 35a KV (hybride Sitzungen) – bisher über Einzelfallentscheidungen gefördert",
          "Neuer Förderschwerpunkt „Pilotvorhaben Künstliche Intelligenz“ mit eigenen Voraussetzungen (Nr. 4.10)",
          "Förderschwerpunkt „Qualifizierung“ entfällt; Schulungen sind künftig als Teil eines Vorhabens zuwendungsfähig, das Fortbildungsangebot des Landesamts für Personalgewinnung und Fortbildung steht den Kommunen offen",
          "Bonus für interkommunale Vorhaben bleibt bei 10 Prozentpunkten, Höchstbetrag für interkommunale Vorhaben steigt",
          "Vereinfachter Verwendungsnachweis bis 100.000 € Zuwendung (bisher 50.000 €)",
          "Bewertungsmatrix (Anlage 2) für überzeichnete Programmjahre; bisher entschied die Reihenfolge des Antragseingangs",
          "Geltungsdauer bis 31.12.2030 entsprechend der Landesstrategie Verwaltungsdigitalisierung 2030",
        ],
      },
      { t: "h1", text: "1. Zuwendungszweck, Rechtsgrundlagen" },
      {
        t: "p",
        text: "1.1 Das Land gewährt nach Maßgabe dieser Richtlinie und der Verwaltungsvorschriften zu § 44 der Landeshaushaltsordnung (LHO) Zuwendungen für Vorhaben, die die Digitalisierung der kommunalen Verwaltung voranbringen. Ziel ist es, dass Bürgerinnen, Bürger und Unternehmen Verwaltungsleistungen ihrer Kommune vollständig digital in Anspruch nehmen können und dass die Kommunen ihre internen Abläufe medienbruchfrei, sicher und wirtschaftlich gestalten. Die Förderung dient der Umsetzung der Landesstrategie Verwaltungsdigitalisierung 2030.",
      },
      {
        t: "p",
        text: "1.2 Rechtsgrundlagen sind insbesondere die §§ 23 und 44 LHO mit den dazu erlassenen Verwaltungsvorschriften, die Allgemeinen Nebenbestimmungen für Zuwendungen zur Projektförderung an Gemeinden und Gemeindeverbände (ANBest-K) sowie die §§ 48 bis 49a des Verwaltungsverfahrensgesetzes (VwVfG) in der für das Land geltenden Fassung.",
      },
      {
        t: "p",
        text: "1.3 Ein Rechtsanspruch auf Gewährung einer Zuwendung besteht nicht. Die Bewilligungsbehörde entscheidet aufgrund ihres pflichtgemäßen Ermessens im Rahmen der verfügbaren Haushaltsmittel.",
      },
      { t: "h1", text: "2. Gegenstand der Förderung" },
      { t: "p", text: "2.1 Gefördert werden Vorhaben in den folgenden Förderschwerpunkten:" },
      {
        t: "table",
        header: ["Förderschwerpunkt", "Beispiele für förderfähige Vorhaben"],
        rows: [
          [
            "A Onlinedienste und Ende-zu-Ende-Digitalisierung",
            "Anbindung von Onlinediensten an die Fachverfahren, elektronische Bescheidzustellung in das Postfach des Servicekontos, Einführung des Bezahldienstes, Nachnutzung von Onlinediensten anderer Kommunen",
          ],
          [
            "B E-Akte und digitale Prozesse",
            "Einführung oder Ausweitung der elektronischen Akte, Digitalisierung des Posteingangs, Prozessanalysen und Prozessoptimierung, elektronische Rechnungsbearbeitung",
          ],
          [
            "C Informationssicherheit und IT-Infrastruktur",
            "Informationssicherheitskonzepte nach IT-Grundschutz, IT-Notfallmanagement, Netzsegmentierung, Härtung von Arbeitsplätzen, Datensicherung",
          ],
          [
            "D Digitale Gremienarbeit",
            "Technik für hybride Sitzungen nach § 35a KV, digitale Sitzungsdienste und Ratsinformationssysteme, barrierefreie Übertragung öffentlicher Sitzungen",
          ],
          [
            "E Pilotvorhaben Künstliche Intelligenz",
            "Erprobung von KI-Anwendungen mit klar abgegrenztem Einsatzzweck, z. B. Posteingangssortierung, Übersetzung, Leichte Sprache, Assistenz bei Standardanfragen",
          ],
        ],
        widths: [2, 5],
      },
      {
        t: "p",
        text: "2.2 Nicht gefördert werden insbesondere der laufende Betrieb bereits eingeführter Verfahren, der Ersatz von Standard-Hardware im üblichen Erneuerungszyklus, Personalausgaben für Stammpersonal der Kommune, Vorhaben, die ausschließlich der Erfüllung gesetzlicher Pflichten dienen, für die das Land bereits einen Ausgleich gewährt, sowie Vorhaben, die bereits aus anderen Programmen des Landes, des Bundes oder der Europäischen Union gefördert werden (Verbot der Doppelförderung).",
      },
      { t: "h1", text: "3. Zuwendungsempfänger" },
      {
        t: "p",
        text: "3.1 Antragsberechtigt sind Gemeinden, Städte und Landkreise sowie Zweckverbände und gemeinsame kommunale Anstalten, soweit sie Aufgaben der Verwaltungsdigitalisierung für ihre Mitglieder wahrnehmen.",
      },
      {
        t: "p",
        text: "3.2 Nicht antragsberechtigt sind Gesellschaften des privaten Rechts, auch wenn sie sich mehrheitlich in kommunaler Hand befinden. Sie können als Auftragnehmer an Vorhaben mitwirken.",
      },
      {
        t: "p",
        text: "3.3 Bei interkommunalen Vorhaben stellt eine beteiligte Kommune den Antrag für alle Beteiligten (federführende Kommune). Sie ist Zuwendungsempfängerin und gegenüber der Bewilligungsbehörde für die ordnungsgemäße Verwendung der Mittel verantwortlich. Die Beteiligten regeln ihr Verhältnis durch öffentlich-rechtliche Vereinbarung.",
      },
      { t: "h1", text: "4. Zuwendungsvoraussetzungen" },
      {
        t: "p",
        text: "4.1 **Nachnutzbarkeit:** Die geförderten Lösungen müssen auf offenen Standards und Schnittstellen beruhen. Software, die mit Mitteln dieser Richtlinie entwickelt oder angepasst wird, ist anderen Kommunen des Landes zu gleichen Bedingungen zur Nachnutzung anzubieten; Entwicklungen sollen unter einer freien Lizenz veröffentlicht werden.",
      },
      {
        t: "p",
        text: "4.2 **Basisdienste:** Onlinedienste müssen das Servicekonto, das Postfach und den Bezahldienst des Landesportals nutzen, sofern der jeweilige Basisdienst für die Leistung geeignet ist.",
      },
      {
        t: "p",
        text: "4.3 **Informationssicherheit:** Die Zuwendungsempfängerin muss bei Antragstellung nachweisen, dass sie eine Informationssicherheitsbeauftragte oder einen Informationssicherheitsbeauftragten bestellt hat und über ein Informationssicherheitskonzept nach IT-Grundschutz verfügt. Für Vorhaben im Förderschwerpunkt C genügt es, wenn das Konzept Gegenstand des Vorhabens ist.",
      },
      {
        t: "p",
        text: "4.4 **Barrierefreiheit:** Onlinedienste, Webangebote und Übertragungen müssen die Anforderungen an die barrierefreie Informationstechnik nach dem Landesrecht erfüllen.",
      },
      {
        t: "p",
        text: "4.5 **Datenschutz:** Werden personenbezogene Daten verarbeitet, sind die Anforderungen der Datenschutz-Grundverordnung einzuhalten. Ist eine Datenschutz-Folgenabschätzung nach Artikel 35 DSGVO erforderlich, ist sie vor Beginn des Echtbetriebs abzuschließen.",
      },
      {
        t: "p",
        text: "4.6 **Beteiligung:** Die nach dem Landespersonalvertretungsgesetz (LPersVG) erforderliche Beteiligung der Personalvertretung ist vor Beginn der Umsetzung durchzuführen. Die Gleichstellungsbeauftragte ist zu beteiligen, wenn das Vorhaben Auswirkungen auf Arbeitsbedingungen hat.",
      },
      {
        t: "p",
        text: "4.7 **Vorhabenbeginn:** Mit dem Vorhaben darf vor Bekanntgabe des Zuwendungsbescheids nicht begonnen worden sein. Als Vorhabenbeginn gilt der Abschluss eines der Ausführung zuzurechnenden Lieferungs- oder Leistungsvertrags. Planungsleistungen und Markterkundungen gelten nicht als Beginn. Die Bewilligungsbehörde kann auf Antrag einem vorzeitigen Vorhabenbeginn zustimmen; ein Anspruch auf Förderung wird dadurch nicht begründet.",
      },
      {
        t: "p",
        text: "4.8 **Gesamtfinanzierung:** Die Finanzierung des Eigenanteils muss gesichert sein. Kommunen mit genehmigungspflichtigem Haushaltssicherungskonzept legen eine Bestätigung der Kommunalaufsichtsbehörde vor, dass der Eigenanteil mit dem Haushaltssicherungskonzept vereinbar ist.",
      },
      {
        t: "p",
        text: "4.9 **Mindestgröße:** Die zuwendungsfähigen Ausgaben eines Vorhabens müssen mindestens 15.000 € betragen. Bei interkommunalen Vorhaben gilt die Mindestgröße für das Gesamtvorhaben.",
      },
      {
        t: "p",
        text: "4.10 **Besondere Voraussetzungen für Pilotvorhaben Künstliche Intelligenz:** Die Anwendung muss den Leitfaden für den Einsatz generativer KI in der Landesverwaltung in der jeweils geltenden Fassung beachten. Die Einstufung nach der Verordnung (EU) 2024/1689 (KI-Verordnung) ist darzulegen; Hochrisiko-Anwendungen sind von der Förderung ausgeschlossen. Die Kommune muss eine Evaluation mit messbaren Zielen vorsehen und ihre Ergebnisse dem Ministerium zur Verfügung stellen. Die Laufzeit eines Pilotvorhabens beträgt höchstens 24 Monate.",
      },
      { t: "h1", text: "5. Art, Umfang und Höhe der Zuwendung" },
      {
        t: "p",
        text: "5.1 Die Zuwendung wird als Projektförderung im Wege der Anteilfinanzierung als nicht rückzahlbarer Zuschuss gewährt.",
      },
      {
        t: "p",
        text: "5.2 Die **Förderquote** beträgt 50 % der zuwendungsfähigen Ausgaben (Grundquote). Sie erhöht sich um 15 Prozentpunkte für Kommunen mit genehmigungspflichtigem Haushaltssicherungskonzept und um 10 Prozentpunkte für interkommunale Vorhaben mit mindestens drei beteiligten Kommunen oder unter Federführung eines Zweckverbands. Die Förderquote beträgt höchstens 75 %.",
      },
      {
        t: "p",
        text: "5.3 Der **Höchstbetrag** der Zuwendung beträgt 400.000 € je Vorhaben, bei interkommunalen Vorhaben 600.000 €. Die Mindestzuwendung beträgt 7.500 €.",
      },
      {
        t: "p",
        text: "5.4 Zuwendungsfähig sind die Ausgaben, die zur Durchführung des Vorhabens notwendig sind und nach Bekanntgabe des Zuwendungsbescheids entstehen. Einzelheiten ergeben sich aus Anlage 1.",
      },
      {
        t: "p",
        text: "5.5 Nicht zuwendungsfähig sind insbesondere Ausgaben für Personal der Zuwendungsempfängerin mit Ausnahme befristet für das Vorhaben eingestellter Projektkräfte, Umsatzsteuer, soweit ein Vorsteuerabzug möglich ist, Finanzierungskosten, Bewirtung, Ausgaben für den Betrieb nach Abschluss des Vorhabens sowie Ausgaben für Hardware, die nicht ausschließlich dem Vorhaben dient.",
      },
      {
        t: "p",
        text: "5.6 Für die Förderung stehen ab dem Programmjahr 2027 jährlich Haushaltsmittel in Höhe von 20 Mio. € zur Verfügung. Hiervon sind 5 Mio. € für den Förderschwerpunkt A (Onlinedienste) und bis zu 1,5 Mio. € für den Förderschwerpunkt E (Pilotvorhaben Künstliche Intelligenz) vorgesehen. Im Programmjahr 2027 werden zusätzlich Ausgabereste aus dem Programmjahr 2026 in Höhe von voraussichtlich 1,5 Mio. € eingesetzt. Nicht ausgeschöpfte Mittel eines Förderschwerpunkts können anderen Schwerpunkten zugeordnet werden.",
      },
      { t: "h1", text: "6. Sonstige Zuwendungsbestimmungen" },
      {
        t: "p",
        text: "6.1 Die ANBest-K sind Bestandteil des Zuwendungsbescheids. Abweichungen und Ergänzungen werden im Bescheid geregelt.",
      },
      {
        t: "p",
        text: "6.2 Bei der Vergabe von Aufträgen sind die für die Zuwendungsempfängerin geltenden vergaberechtlichen Bestimmungen anzuwenden, insbesondere das Gesetz gegen Wettbewerbsbeschränkungen (GWB), die Vergabeverordnung (VgV) und unterhalb der Schwellenwerte die Unterschwellenvergabeordnung (UVgO) nach Maßgabe des kommunalen Haushaltsrechts. Verstöße gegen das Vergaberecht können zum Widerruf der Zuwendung führen.",
      },
      {
        t: "p",
        text: "6.3 Die mit der Zuwendung beschafften oder hergestellten Gegenstände und Lösungen sind für die Dauer von fünf Jahren nach Abschluss des Vorhabens zweckentsprechend zu verwenden (Zweckbindungsfrist).",
      },
      {
        t: "p",
        text: "6.4 Die Zuwendungsempfängerin weist in geeigneter Form auf die Förderung durch das Land hin (z. B. im Impressum des Onlinedienstes oder bei der Vorstellung des Vorhabens in den Gremien).",
      },
      {
        t: "p",
        text: "6.5 Die Zuwendungsempfängerin wirkt an der Evaluation des Förderprogramms mit und meldet dem Ministerium jährlich den Umsetzungsstand der geförderten Onlinedienste.",
      },
      { t: "h1", text: "7. Verfahren" },
      { t: "h2", text: "7.1 Antrag" },
      {
        t: "p",
        text: "Anträge sind bis zum **31. März** des jeweiligen Programmjahres über das Förderportal des Landes zu stellen. Maßgeblich ist der Eingang im Förderportal. Verspätet eingegangene Anträge werden nicht berücksichtigt; sie können im folgenden Programmjahr erneut gestellt werden. Dem Antrag sind eine Vorhabenbeschreibung, ein Kosten- und Finanzierungsplan, der Nachweis nach Nr. 4.3 und gegebenenfalls die Bestätigung nach Nr. 4.8 beizufügen.",
      },
      { t: "h2", text: "7.2 Bewilligungsbehörde" },
      {
        t: "p",
        text: "Bewilligungsbehörde ist das Ministerium für Kommunales und Verwaltungsentwicklung, Referat 35 – Kommunale Förderprogramme. Fachliche Stellungnahmen holt die Bewilligungsbehörde bei den Referaten 52 (Onlinedienste), 53 (Informationssicherheit) und 54 (Künstliche Intelligenz) ein.",
      },
      { t: "h2", text: "7.3 Auswahl" },
      {
        t: "p",
        text: "Übersteigt das beantragte Fördervolumen die verfügbaren Haushaltsmittel, werden die Anträge nach der **Bewertungsmatrix** in Anlage 2 bewertet. Gefördert werden die Vorhaben in der Reihenfolge der erreichten Punktzahl. Bei Punktgleichheit haben Vorhaben von Kommunen mit Haushaltssicherungskonzept Vorrang. Vorhaben mit weniger als 40 von 100 Punkten werden nicht gefördert.",
      },
      { t: "h2", text: "7.4 Bewilligung" },
      {
        t: "p",
        text: "Die Bewilligungsbehörde entscheidet bis zum 30. Juni des Programmjahres. Der Bewilligungszeitraum beträgt in der Regel bis zu 24 Monate. Eine Verlängerung ist auf begründeten Antrag einmalig um bis zu zwölf Monate möglich.",
      },
      { t: "h2", text: "7.5 Auszahlung" },
      {
        t: "p",
        text: "Die Zuwendung wird auf Anforderung ausgezahlt, soweit sie innerhalb von zwei Monaten nach der Auszahlung für fällige Zahlungen benötigt wird. Der letzte Teilbetrag von 10 % der Zuwendung wird erst nach Prüfung des Verwendungsnachweises ausgezahlt.",
      },
      { t: "h2", text: "7.6 Verwendungsnachweis" },
      {
        t: "p",
        text: "Der **Verwendungsnachweis** ist innerhalb von sechs Monaten nach Ende des Bewilligungszeitraums vorzulegen. Er besteht aus einem Sachbericht und einem zahlenmäßigen Nachweis. Bei Zuwendungen bis 100.000 € genügt ein vereinfachter Verwendungsnachweis ohne Vorlage von Belegen; die Belege sind fünf Jahre aufzubewahren und auf Verlangen vorzulegen. Die Bewilligungsbehörde prüft mindestens 10 % der vereinfachten Verwendungsnachweise vertieft (Stichprobe).",
      },
      { t: "h2", text: "7.7 Prüfungsrechte" },
      {
        t: "p",
        text: "Die Bewilligungsbehörde und der Landesrechnungshof sind berechtigt, die Verwendung der Zuwendung bei der Zuwendungsempfängerin zu prüfen. Die Zuwendungsempfängerin hat die erforderlichen Unterlagen bereitzuhalten und Auskünfte zu erteilen.",
      },
      { t: "h2", text: "7.8 Rücknahme, Widerruf, Erstattung" },
      {
        t: "p",
        text: "Für die Rücknahme und den Widerruf des Zuwendungsbescheids sowie die Erstattung und Verzinsung der Zuwendung gelten die §§ 48, 49 und 49a VwVfG. Ein Widerruf kommt insbesondere in Betracht, wenn die Zweckbindungsfrist nicht eingehalten, Vergaberecht verletzt oder der Verwendungsnachweis trotz Mahnung nicht vorgelegt wird.",
      },
      { t: "h2", text: "7.9 Verarbeitung personenbezogener Daten im Förderverfahren" },
      {
        t: "p",
        text: "Die Bewilligungsbehörde verarbeitet die im Antrag angegebenen personenbezogenen Daten der Ansprechpersonen (Name, dienstliche Kontaktdaten, Funktion) zur Durchführung des Förderverfahrens, zur Prüfung der Verwendung und zur Evaluation des Programms. Rechtsgrundlage ist Artikel 6 Abs. 1 Buchstabe e DSGVO in Verbindung mit § 44 LHO. Die Daten werden nach Ablauf der Aufbewahrungsfristen für Zuwendungsakten (zehn Jahre nach Abschluss der Prüfung des Verwendungsnachweises) gelöscht. Zuwendungsempfängerin, Vorhaben, Höhe der Zuwendung und Förderschwerpunkt werden im Förderportal und im jährlichen Förderbericht veröffentlicht.",
      },
      { t: "h2", text: "7.10 Beratung" },
      {
        t: "p",
        text: "Vor der Antragstellung bietet die Bewilligungsbehörde eine Beratung an. Für interkommunale Vorhaben und Pilotvorhaben Künstliche Intelligenz wird ein Beratungsgespräch dringend empfohlen. Termine werden über das Förderportal vergeben; in den Monaten Januar bis März finden zusätzlich offene Sprechstunden per Videokonferenz statt.",
      },
      { t: "h1", text: "8. Inkrafttreten, Außerkrafttreten, Übergangsregelung" },
      {
        t: "p",
        text: "8.1 Diese Richtlinie tritt am 1. Januar 2027 in Kraft und mit Ablauf des 31. Dezember 2030 außer Kraft. 8.2 Die Richtlinie vom 12.02.2024 tritt mit Ablauf des 31. Dezember 2026 außer Kraft. Für Vorhaben, die bis dahin bewilligt wurden, gilt sie weiter. 8.3 Anträge für das Programmjahr 2027 können ab dem 1. Januar 2027 gestellt werden.",
      },
      { t: "pagebreak" },
      { t: "h1", text: "Anlage 1: Zuwendungsfähige Ausgaben" },
      {
        t: "table",
        header: ["Ausgabenart", "zuwendungsfähig", "Hinweise"],
        rows: [
          ["Software-Lizenzen und Anpassung (Customizing)", "ja", "Lizenzen für höchstens 24 Monate ab Bewilligung"],
          ["Entwicklung von Schnittstellen", "ja", "Nachnutzbarkeit nach Nr. 4.1"],
          ["Externe Beratung, Projektsteuerung", "ja", "höchstens 20 % der zuwendungsfähigen Ausgaben"],
          ["Befristete Projektkräfte", "ja", "nur für die Dauer des Vorhabens, höchstens Entgeltgruppe 11 TVöD"],
          ["Hardware", "eingeschränkt", "nur wenn ausschließlich für das Vorhaben genutzt (z. B. Konferenztechnik im Sitzungssaal)"],
          ["Schulungen der Beschäftigten", "ja", "wenn unmittelbar für das Vorhaben erforderlich"],
          ["Datenschutz-Folgenabschätzung, Sicherheitskonzept", "ja", ""],
          ["Laufender Betrieb nach Abschluss", "nein", ""],
          ["Eigenes Stammpersonal", "nein", ""],
          ["Bewirtung, Reisekosten", "nein", ""],
        ],
        widths: [3, 1, 4],
      },
      { t: "h1", text: "Anlage 2: Bewertungsmatrix" },
      {
        t: "table",
        header: ["Kriterium", "Gewichtung", "Bewertung"],
        rows: [
          ["Nutzen für Bürgerinnen, Bürger und Unternehmen (Fallzahlen, Zeitersparnis)", "25 Punkte", "Fallzahlen je Jahr und erwartete Online-Quote"],
          ["Grad der Ende-zu-Ende-Digitalisierung", "20 Punkte", "volle Punktzahl nur ohne Medienbruch bis zum Bescheid"],
          ["Nachnutzbarkeit und interkommunale Zusammenarbeit", "20 Punkte", "Zahl der nachnutzenden oder beteiligten Kommunen"],
          ["Wirtschaftlichkeit", "15 Punkte", "Verhältnis von Ausgaben zu Nutzen, Folgekosten"],
          ["Informationssicherheit und Datenschutz", "10 Punkte", "Reifegrad, Konzept, benannte Verantwortliche"],
          ["Umsetzungsreife", "10 Punkte", "Projektplan, Personal, Beschlüsse der Gremien"],
          ["Summe", "100 Punkte", "Mindestpunktzahl 40"],
        ],
        widths: [4, 1, 3],
      },
      { t: "h1", text: "Anlage 3: Übersicht der Förderkonditionen" },
      {
        t: "table",
        header: ["Kondition", "Regelung"],
        rows: [
          ["Antragsfrist", "31. März des Programmjahres"],
          ["Grundquote", "50 %"],
          ["Zuschlag Haushaltssicherung", "+ 15 Prozentpunkte"],
          ["Zuschlag interkommunal", "+ 10 Prozentpunkte"],
          ["Förderquote höchstens", "75 %"],
          ["Mindestgröße (zuwendungsfähige Ausgaben)", "15.000 €"],
          ["Höchstbetrag je Vorhaben", "500.000 € (interkommunal 750.000 €)"],
          ["Vereinfachter Verwendungsnachweis", "bis 100.000 € Zuwendung"],
          ["Bewilligungszeitraum", "bis 24 Monate, Verlängerung um bis zu 12 Monate"],
          ["Zweckbindungsfrist", "5 Jahre"],
        ],
        widths: [3, 3],
      },
      { t: "h1", text: "Anlage 4: Finanzplanung der Programmjahre 2027 bis 2030" },
      {
        t: "table",
        header: ["Programmjahr", "Haushaltsmittel", "davon Schwerpunkt A Onlinedienste", "davon Schwerpunkt E KI", "Verpflichtungsermächtigung Folgejahr"],
        rows: [
          ["2027", "20,0 Mio. € zzgl. 1,5 Mio. € Reste", "4,0 Mio. €", "1,5 Mio. €", "10,0 Mio. €"],
          ["2028", "20,0 Mio. €", "4,0 Mio. €", "1,5 Mio. €", "10,0 Mio. €"],
          ["2029", "20,0 Mio. €", "4,0 Mio. €", "1,0 Mio. €", "10,0 Mio. €"],
          ["2030", "20,0 Mio. €", "4,0 Mio. €", "1,0 Mio. €", "–"],
        ],
      },
      {
        t: "note",
        text: "Haushaltsstelle: Kapitel 08 35, Titel 883 61 (Zuweisungen an Gemeinden und Gemeindeverbände für Investitionen – Digitale Kommune) und Titel 633 61 (konsumtive Zuweisungen). Die Aufteilung auf die Titel erfolgt nach der Art der bewilligten Ausgaben.",
      },
      { t: "h1", text: "Anlage 5: Erläuterungen und Beispiele" },
      { t: "h3", text: "Wann gilt ein Vorhaben als interkommunal?" },
      {
        t: "p",
        text: "Ein Vorhaben ist interkommunal im Sinne von Nr. 5.2, wenn mindestens drei Kommunen es gemeinsam planen, finanzieren und nutzen oder wenn ein Zweckverband es für seine Mitglieder durchführt. Eine bloße Nachnutzung einer bereits fertigen Lösung reicht nicht aus. Beispiel: Drei Gemeinden bestellen gemeinsam eine Informationssicherheitsbeauftragte und erstellen ein gemeinsames Notfallhandbuch – interkommunal. Eine Gemeinde übernimmt den Onlinedienst einer Nachbarstadt ohne eigene Weiterentwicklung – nicht interkommunal, aber förderfähig mit der Grundquote.",
      },
      { t: "h3", text: "Wie berechnet sich die Zuwendung?" },
      {
        t: "p",
        text: "Beispiel 1: Eine Gemeinde in Haushaltssicherung beantragt ein Vorhaben mit zuwendungsfähigen Ausgaben von 48.000 €. Förderquote 50 % + 15 Prozentpunkte = 65 %, Zuwendung 31.200 €, Eigenanteil 16.800 €. Beispiel 2: Eine Stadt ohne Haushaltssicherung beantragt ein Vorhaben mit 900.000 €. Rechnerisch ergeben sich bei 50 % 450.000 €; die Zuwendung wird auf den Höchstbetrag begrenzt. Beispiel 3: Ein Zweckverband beantragt ein Vorhaben für seine Mitglieder mit 880.000 €. Förderquote 60 %, Zuwendung 528.000 €.",
      },
      { t: "h3", text: "Sind Lizenzkosten für Cloud-Dienste förderfähig?" },
      {
        t: "p",
        text: "Ja, für höchstens 24 Monate ab Bewilligung, wenn sie für das Vorhaben erforderlich sind und die Anforderungen an Datenschutz und Informationssicherheit erfüllt werden. Danach sind sie Betriebskosten der Kommune. Bei der Wirtschaftlichkeitsbetrachtung (Anlage 2) sind die Folgekosten für mindestens fünf Jahre darzustellen.",
      },
      { t: "h3", text: "Was ist bei Pilotvorhaben Künstliche Intelligenz zu beachten?" },
      {
        t: "p",
        text: "Pilotvorhaben müssen einen klar abgegrenzten Einsatzzweck haben, etwa die Vorsortierung des Posteingangs nach Zuständigkeiten oder die Übertragung von Bescheiderläuterungen in Leichte Sprache. Anwendungen, die über Anträge entscheiden, Beschäftigte bewerten oder Bewerbungen auswählen, sind nicht förderfähig. Vor Beginn des Echtbetriebs sind die Beschäftigten zu schulen; das Landesamt für Personalgewinnung und Fortbildung bietet hierfür Kurse an, die auch kommunalen Beschäftigten offenstehen.",
      },
      { t: "h3", text: "Können Kommunen in Haushaltssicherung den Eigenanteil aufbringen?" },
      {
        t: "p",
        text: "Der Eigenanteil ist eine freiwillige Ausgabe. Die Kommunalaufsicht bestätigt nach Nr. 4.8, dass er mit dem Haushaltssicherungskonzept vereinbar ist. Das ist in der Regel der Fall, wenn das Vorhaben mittelfristig Aufwand verringert, etwa durch weniger Porto, Druck oder Vorsprachen. Die Bestätigung soll innerhalb von vier Wochen erteilt werden.",
      },
      { t: "h3", text: "Was passiert, wenn das Vorhaben teurer wird?" },
      {
        t: "p",
        text: "Die Zuwendung ist auf den bewilligten Betrag begrenzt. Mehrausgaben trägt grundsätzlich die Zuwendungsempfängerin. Eine Erhöhung der Zuwendung ist nur auf Antrag und nur im Rahmen verfügbarer Haushaltsmittel möglich; sie wird nur gewährt, wenn die Mehrausgaben unvermeidbar waren und nicht auf Planungsfehler zurückgehen.",
      },
      { t: "signature", lines: ["Im Auftrag", "Claudia Sundermann", "Referatsleiterin 35 – Kommunale Förderprogramme"] },
    ],
  },
  {
    type: "excel",
    id: "mkv-bewilligungen-digitale-kommune-2026",
    title: "Förderprogramm „Digitale Kommune“ – Bewilligungen 2026 (Auszug) und Vergleich mit 2025",
    kind: "Bewilligungsübersicht",
    fileName: "Digitale Kommune Bewilligungen 2026 Auszug Region Altmoorland Falkenbrueck Rhedenburg",
    org: "mkv",
    unit: "mkv-35",
    author: "mkv-karaca",
    date: "2026-07-01",
    tags: ["zahlen"],
    keywords: ["DK-2026-047", "Höchstbetrag", "Fristversäumnis", "Förderschwerpunkt", "Haushaltsansatz 2026"],
    summary:
      "Bewilligungsliste mit Förderquoten, Höchstbeträgen und Zuwendungen für Vorhaben aus Falkenbrück, Rhedenburg und dem Landkreis Altmoorland, dazu Budgetabgleich und Vergleich der Förderschwerpunkte 2025/2026. Geeignet für Auswertungen je Kommune, Diagramme und die Prüfung der Formeln (Kappung beim Höchstbetrag).",
    sheets: [
      {
        name: "Bewilligungen 2026",
        title: "Bewilligungen Programmjahr 2026 – Auszug",
        subtitle: "Zuwendungsempfänger aus Falkenbrück, Rhedenburg und dem Landkreis Altmoorland · übrige Empfänger zusammengefasst",
        columns: [
          { header: "Aktenzeichen", width: 13 },
          { header: "Zuwendungsempfänger", width: 30 },
          { header: "Vorhaben", width: 44 },
          { header: "Förderschwerpunkt", width: 22 },
          { header: "Zuwendungsfähige Ausgaben", width: 15, fmt: "eur0" },
          { header: "Förderquote", width: 10, fmt: "pct" },
          { header: "Höchstbetrag", width: 12, fmt: "eur0" },
          { header: "Zuwendung", width: 14, fmt: "eur0" },
          { header: "Status", width: 22 },
          { header: "Bescheid vom", width: 12, fmt: "date" },
        ],
        rows: [
          ["DK-2026-014", "Stadt Falkenbrück", "Terminerinnerung und Online-Abholung im Bürgeramt", "Onlinedienste", 640000, 0.65, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-19" }],
          ["DK-2026-015", "Stadt Falkenbrück", "Digitale Akteneinsicht in der Bauaufsicht", "E-Akte und Prozesse", 280000, 0.65, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-19" }],
          ["DK-2026-031", "Landkreis Altmoorland", "E-Akte im Jugendamt (zweiter Bauabschnitt)", "E-Akte und Prozesse", 520000, 0.5, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-22" }],
          ["DK-2026-032", "Landkreis Altmoorland", "Online-Antrag Eingliederungshilfe", "Onlinedienste", 190000, 0.5, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-22" }],
          ["DK-2026-047", "Zweckverband Kommunale IT Altmoor", "Gemeinsame Plattform für Onlinedienste der Mitgliedskommunen", "Interkommunal", 880000, 0.6, 600000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-24" }],
          ["DK-2026-048", "Stadt Rabensfurt", "Technik für hybride Sitzungen im Ratssaal", "Gremienarbeit", 46000, 0.65, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-24" }],
          ["DK-2026-049", "Stadt Rabensfurt", "Vorbereitung der Migration in die Arbeitsplatzumgebung des Zweckverbands", "IT-Sicherheit und Infrastruktur", 310000, 0.65, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-24" }],
          ["DK-2026-063", "Stadt Altmoor", "Hybride Sitzungen im Ratssaal", "Gremienarbeit", 38500, 0.5, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-25" }],
          ["DK-2026-071", "Gemeinde Brackenhain", "Onlinedienste Friedhofswesen und Hundesteuer mit Bezahldienst", "Onlinedienste", 48000, 0.65, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-25" }],
          ["DK-2026-072", "Gemeinde Brackenhain", "Hybride Gemeinderatssitzungen im DGH Lindenweg", "Gremienarbeit", 22000, 0.65, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-25" }],
          ["DK-2026-085", "Gemeinde Fennhusen", "Anbindung der Basisdienste und Bezahldienst", "Onlinedienste", 36000, 0.5, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-26" }],
          ["DK-2026-086", "Gemeinde Torfkamp", "Informationssicherheitskonzept und IT-Notfallhandbuch", "IT-Sicherheit und Infrastruktur", 24000, 0.5, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-26" }],
          ["DK-2026-090", "Gemeinde Lütjenbrook (federführend, mit Krähenwerder und Schilfwerder)", "Gemeinsame Informationssicherheitsbeauftragte und IT-Notfallmanagement", "Interkommunal", 96000, 0.75, 600000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-26" }],
          ["DK-2026-091", "Gemeinde Schilfwerder", "Elektronische Wohnsitzanmeldung", "Onlinedienste", 18000, 0.5, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "abgelehnt (Fristversäumnis)", { date: "2026-06-26" }],
          ["DK-2026-102", "Stadt Rhedenburg", "Digitaler Posteingang mit automatischer Vorsortierung", "E-Akte und Prozesse", 350000, 0.5, 400000, { f: 'IF(I{r}="bewilligt",MIN(ROUND(E{r}*F{r},0),G{r}),0)' }, "bewilligt", { date: "2026-06-29" }],
          ["–", "Übrige Zuwendungsempfänger (157 Vorhaben)", "siehe Gesamtliste im Förderportal", "verschiedene", 29640000, null, null, 17815250, "bewilligt", null],
          {
            total: true,
            cells: ["", "Summe", "", "", { f: "SUM(E{first}:E{last})" }, null, null, { f: "SUM(H{first}:H{last})" }, "", null],
          },
        ],
        notes: [
          "Förderquote: Grundquote 50 %, + 15 Prozentpunkte bei Haushaltssicherungskonzept, + 10 Prozentpunkte bei interkommunalen Vorhaben, höchstens 75 % (Richtlinie vom 12.02.2024).",
          "DK-2026-014: Zuwendung auf den Höchstbetrag von 400.000 € begrenzt.",
          "DK-2026-091: Antrag am 02.04.2026 im Förderportal eingegangen (Frist 31.03.2026); Neuantrag 2027 möglich.",
        ],
      },
      {
        name: "Budget",
        title: "Abgleich mit dem Haushalt 2026",
        columns: [
          { header: "Position", width: 52 },
          { header: "Betrag", width: 16, fmt: "eur0" },
          { header: "Anzahl", width: 10, fmt: "int" },
        ],
        rows: [
          ["Haushaltsansatz 2026 (Kapitel 08 35, Titel 883 61 und 633 61)", 20000000, null],
          ["Bewilligte Zuwendungen (Blatt „Bewilligungen 2026“)", { f: "'Bewilligungen 2026'!H21" }, 171],
          ["Verbleibende Mittel", { f: "B5-B6" }, null],
          ["Beantragte Zuwendungen (alle Anträge)", 31400000, 247],
          ["Abgelehnte Anträge", null, 52],
          ["Zurückgezogene Anträge", null, 24],
          { total: true, cells: ["Überzeichnung (beantragt im Verhältnis zum Ansatz)", { f: "B8/B5", fmt: "pct" }, null] },
        ],
        notes: ["Die verbleibenden Mittel werden für Nachbewilligungen aus der Warteliste und für Mehrausgaben bewilligter Vorhaben vorgehalten."],
      },
      {
        name: "Schwerpunkte",
        title: "Bewilligungen nach Förderschwerpunkten 2025 und 2026",
        columns: [
          { header: "Förderschwerpunkt", width: 32 },
          { header: "Vorhaben 2025", width: 11, fmt: "int" },
          { header: "Zuwendung 2025", width: 15, fmt: "eur0" },
          { header: "Vorhaben 2026", width: 11, fmt: "int" },
          { header: "Zuwendung 2026", width: 15, fmt: "eur0" },
          { header: "Veränderung", width: 14, fmt: "eur0" },
        ],
        rows: [
          ["Onlinedienste", 58, 6940000, 61, 7120000, { f: "E{r}-C{r}" }],
          ["E-Akte und Prozesse", 41, 5810000, 39, 5430000, { f: "E{r}-C{r}" }],
          ["IT-Sicherheit und Infrastruktur", 37, 4120000, 34, 3760000, { f: "E{r}-C{r}" }],
          ["Gremienarbeit (seit 2026)", 0, 0, 22, 1140000, { f: "E{r}-C{r}" }],
          ["Qualifizierung", 19, 1480000, 9, 640000, { f: "E{r}-C{r}" }],
          ["Interkommunal", 8, 1270000, 6, 1763400, { f: "E{r}-C{r}" }],
          {
            total: true,
            cells: ["Summe", { f: "SUM(B{first}:B{last})" }, { f: "SUM(C{first}:C{last})" }, { f: "SUM(D{first}:D{last})" }, { f: "SUM(E{first}:E{last})" }, { f: "E{r}-C{r}" }],
          },
        ],
      },
    ],
  },
  {
    type: "word",
    id: "mkv-sprechzettel-foerderbescheide-altmoor",
    title: "Sprechzettel für die Ministerin: Übergabe der Förderbescheide „Digitale Kommune“ in Altmoor",
    kind: "Sprechzettel",
    fileName: "Sprechzettel Ministerin Uebergabe Foerderbescheide Digitale Kommune Altmoor 2026-07-14",
    org: "mkv",
    unit: "mkv-presse",
    author: "mkv-vennemann",
    date: "2026-07-09",
    tags: ["unstrukturiert"],
    keywords: ["Kreishaus Altmoor", "1,28 Mio. €", "171 Vorhaben", "Achtung", "Fristversäumnis"],
    summary:
      "Stichpunktartiger Sprechzettel mit Kernbotschaften, Zahlen und möglichen Pressefragen für einen Termin der Ministerin. Kündigt 20 Mio. € auch für 2027 an, obwohl ein interner Vermerk auf 18 Mio. € im Haushaltsentwurf hinweist – geeignet, um daraus eine Rede oder eine Pressemitteilung zu machen.",
    meta: [
      ["Termin", "Dienstag, 14.07.2026, 11:00 Uhr"],
      ["Ort", "Kreishaus Altmoor, Am Moordamm 4, Sitzungssaal"],
      ["Redezeit", "ca. 5 Minuten"],
    ],
    blocks: [
      { t: "h3", text: "Anwesend" },
      { t: "p", text: "Landrat Tiedemann (Gastgeber), Bürgermeisterin Engelke (Rabensfurt), Bürgermeister Ruhnau (Brackenhain), Dr. Vogelsang (Zweckverband), Presse: Altmoorländer Kreisblatt, Rabensfurter Rundschau" },
      { t: "h3", text: "Kernbotschaften" },
      {
        t: "ul",
        items: [
          "Digitalisierung ist kein Großstadtthema – gerade kleine Gemeinden profitieren",
          "Land lässt Kommunen nicht allein: Förderquote bis 75 %, mehr für Kommunen in Haushaltssicherung",
          "Zusammenarbeit lohnt sich – Zweckverband als Vorbild",
        ],
      },
      { t: "h3", text: "Zahlen" },
      {
        t: "ul",
        items: [
          "landesweit 247 Anträge, bewilligt: 171 Vorhaben, rund 19,9 Mio. €",
          "Landkreis Altmoorland: 11 Vorhaben, zusammen **1,28 Mio. €**",
          "größtes: Plattform für Onlinedienste des Zweckverbands, 528.000 €",
          "kleinstes: IT-Notfallhandbuch Torfkamp, 12.000 €",
        ],
      },
      { t: "h3", text: "Vor Ort ansprechen" },
      {
        t: "ul",
        items: [
          "Brackenhain: Hundesteuer und Friedhof bald online – „das spart Wege“",
          "Rabensfurt: seit 01.07. im Zweckverband, Glückwunsch; hybride Ratssitzungen",
          "Lütjenbrook, Krähenwerder, Schilfwerder: gemeinsame IT-Sicherheit – Lob!",
        ],
      },
      { t: "h3", text: "Ausblick" },
      {
        t: "ul",
        items: [
          "„Auch 2027 stehen wieder 20 Mio. € bereit.“ – **Achtung:** Regierungsentwurf 2027 sieht nur 18,0 Mio. € vor (Z 2) – ggf. „rund 20 Mio. €“ oder ohne Zahl",
          "neue Richtlinie ab 2027: hybride Sitzungen, KI-Pilotvorhaben",
        ],
      },
      { t: "h3", text: "Mögliche Fragen" },
      {
        t: "ul",
        items: [
          "Warum wurde Schilfwerder abgelehnt? → Fristversäumnis (Eingang 02.04.), Neuantrag 2027 möglich",
          "Altschuldenhilfe? → Arbeitsgruppe berichtet Ende 2026, keine Zusagen",
        ],
      },
    ],
  },
  {
    type: "word",
    id: "mkv-runderlass-haushaltsplanung-2027",
    title: "Runderlass: Hinweise zur Haushaltsplanung 2027 der Gemeinden und Gemeindeverbände (Haushaltserlass 2027)",
    kind: "Runderlass",
    fileName: "2026-08-18 Runderlass Haushaltserlass 2027 Orientierungsdaten",
    org: "mkv",
    unit: "mkv-33",
    author: "mkv-luebbers",
    date: "2026-08-18",
    tags: ["zahlen", "widersprueche"],
    keywords: ["Orientierungsdaten", "Haushaltserlass 2027", "Gemeindeanteil an der Einkommensteuer", "Ausgleichsrücklage", "30.11.2026", "3,17 Mrd. €"],
    summary:
      "Langer Haushaltserlass mit Orientierungsdaten 2027 bis 2030, Hinweisen zu Finanzausgleich, Personalaufwand, Zinsen, Haushaltssicherung, Krediten, Fördermitteln und Fristen. Eingebauter Widerspruch: Der Zuwachs beim Gemeindeanteil an der Einkommensteuer steht im Text mit 3,4 %, in der Tabelle der Anlage mit 2,9 %.",
    meta: [
      ["Aktenzeichen", "33-1510.2/26"],
      ["Status", "öffentlich (Veröffentlichung im Ministerialblatt)"],
    ],
    recipient: [
      "An die",
      "Landrätinnen und Landräte als untere Kommunalaufsichtsbehörden",
      "Oberbürgermeisterinnen und Oberbürgermeister der kreisfreien Städte",
      "nachrichtlich: Städtetag, Landkreistag, Städte- und Gemeindebund (Landesverband)",
    ],
    subject: "Hinweise zur Haushaltsplanung 2027 der Gemeinden und Gemeindeverbände (Haushaltserlass 2027) – Orientierungsdaten 2027 bis 2030",
    blocks: [
      { t: "h1", text: "1. Vorbemerkung" },
      {
        t: "p",
        text: "Die Finanzlage der Kommunen bleibt angespannt. Nach der vorläufigen Kassenstatistik schlossen die Kommunen des Landes das Jahr 2025 mit einem Finanzierungsdefizit von 1,26 Mrd. € ab. Die Liquiditätskredite stiegen auf 2,14 Mrd. €. Für das Haushaltsjahr 2026 mussten 118 Kommunen ein Haushaltssicherungskonzept aufstellen. Die Ergebnisse der regionalisierten Steuerschätzung vom Mai 2026 lassen für 2027 nur eine moderate Verbesserung der Steuereinnahmen erwarten, während die Aufwendungen für Personal und soziale Leistungen weiter steigen.",
      },
      {
        t: "p",
        text: "Vor diesem Hintergrund bitte ich die Kommunen, bei der Aufstellung der Haushalte 2027 alle Möglichkeiten zur Verbesserung der Ertragslage und zur Begrenzung der Aufwendungen auszuschöpfen. Die Kommunalaufsichtsbehörden bitte ich, diesen Erlass den kreisangehörigen Gemeinden unverzüglich bekannt zu geben und die Kommunen bei der Haushaltsaufstellung zu beraten.",
      },
      { t: "h1", text: "2. Orientierungsdaten für die Jahre 2027 bis 2030" },
      { t: "h2", text: "2.1 Steuern und Finanzausgleich" },
      {
        t: "p",
        text: "Die **Orientierungsdaten** beruhen auf den Ergebnissen der Steuerschätzung vom Mai 2026 und auf dem Entwurf des Landeshaushalts 2027. Sie geben landesdurchschnittliche Veränderungsraten wieder und sind von jeder Kommune unter Berücksichtigung der örtlichen Verhältnisse anzuwenden. Abweichungen von den Orientierungsdaten sind im Vorbericht zum Haushaltsplan zu begründen.",
      },
      {
        t: "p",
        text: "Für den **Gemeindeanteil an der Einkommensteuer** wird für 2027 ein Zuwachs von **3,4 %** gegenüber dem Ergebnis der Steuerschätzung für 2026 erwartet. Beim Gemeindeanteil an der Umsatzsteuer ist mit einem Zuwachs von 2,1 % zu rechnen. Die Gewerbesteuer (netto, nach Abzug der Gewerbesteuerumlage) entwickelt sich regional sehr unterschiedlich; im Landesdurchschnitt wird ein Zuwachs von 2,5 % angenommen. Kommunen mit hoher Abhängigkeit von einzelnen Gewerbesteuerzahlern sollten vorsichtiger planen.",
      },
      {
        t: "p",
        text: "Nach der Grundsteuerreform liegen nunmehr belastbare Ist-Ergebnisse für 2025 vor. Für 2027 ist bei unveränderten Hebesätzen von einem Zuwachs des Grundsteueraufkommens von 1,0 % auszugehen (Neubau, Nachveranlagungen).",
      },
      { t: "h2", text: "2.2 Kommunaler Finanzausgleich" },
      {
        t: "p",
        text: "Nach dem Entwurf des Haushaltsbegleitgesetzes 2027 beträgt die Schlüsselmasse im kommunalen Finanzausgleich **3,17 Mrd. €** (2026: 3,08 Mrd. €; + 2,9 %). Das Ministerium wird bis Ende Oktober 2026 eine Modellrechnung zu den Schlüsselzuweisungen der einzelnen Kommunen veröffentlichen. Bis dahin können die Kommunen die Schlüsselzuweisungen 2026 um 2,9 % fortschreiben. Die endgültige Festsetzung erfolgt nach Verabschiedung des Landeshaushalts durch Bescheid.",
      },
      {
        t: "p",
        text: "Die Landkreise werden gebeten, bei der Festsetzung der Kreisumlage das Gebot der gegenseitigen Rücksichtnahme zu beachten. Vor einer Erhöhung des Umlagesatzes sind die kreisangehörigen Gemeinden rechtzeitig anzuhören; ihre Stellungnahmen sind dem Kreistag vollständig vorzulegen. Die Finanzausstattung der Gemeinden ist in die Abwägung einzubeziehen; das gilt besonders, wenn kreisangehörige Gemeinden selbst Haushaltssicherungskonzepte aufstellen müssen.",
      },
      { t: "h2", text: "2.3 Personalaufwendungen" },
      {
        t: "p",
        text: "Die Entgelte nach dem TVöD wurden zum 01.05.2026 um 2,8 % erhöht. Der Tarifvertrag kann frühestens zum 31.03.2027 gekündigt werden. Für das Haushaltsjahr 2027 wird empfohlen, die Personalaufwendungen gegenüber dem Ansatz 2026 um **3,5 %** zu steigern. Darin enthalten sind die Jahreswirkung der Erhöhung zum 01.05.2026 sowie eine Vorsorge für eine Tariferhöhung von 3,0 % ab dem 01.04.2027. Stufensteigerungen und Stellenmehrungen sind gesondert zu berücksichtigen. Für die Besoldung wird von einer zeit- und inhaltsgleichen Übertragung des Tarifergebnisses ausgegangen.",
      },
      {
        t: "p",
        text: "Die Umlagen der Versorgungskasse und der Zusatzversorgungskasse sind nach den Mitteilungen der Kassen zu veranschlagen. Pensionsrückstellungen sind nach den versicherungsmathematischen Gutachten zu bilden.",
      },
      { t: "h2", text: "2.4 Sach- und Dienstleistungen, Transferaufwendungen" },
      {
        t: "p",
        text: "Für Sach- und Dienstleistungen wird eine Steigerung von 2,0 % empfohlen. Bei Energie ist von den abgeschlossenen Lieferverträgen auszugehen. Für Sozial- und Jugendhilfeleistungen wird landesweit ein Anstieg von 4,5 % erwartet; maßgeblich ist jedoch die örtliche Fallzahlentwicklung.",
      },
      { t: "h2", text: "2.5 Zinsen" },
      {
        t: "p",
        text: "Für neu aufzunehmende Investitionskredite wird ein Zinssatz von 3,0 % empfohlen, für Liquiditätskredite von 2,8 %. Bei Krediten mit auslaufender Zinsbindung ist mit entsprechenden Mehraufwendungen zu rechnen. Spekulative Finanzgeschäfte bleiben unzulässig.",
      },
      { t: "h1", text: "3. Haushaltsausgleich und Haushaltssicherung" },
      {
        t: "p",
        text: "Der Haushalt ist in jedem Jahr in Planung und Rechnung auszugleichen. Kann der Ergebnishaushalt nicht ausgeglichen werden, ist die **Ausgleichsrücklage** (Rücklage aus Überschüssen des ordentlichen Ergebnisses) einzusetzen. Ist diese aufgebraucht oder reicht sie nicht aus, ist nach § 110 Abs. 8 KV ein Haushaltssicherungskonzept aufzustellen. Das Haushaltssicherungskonzept bedarf der Genehmigung der Kommunalaufsichtsbehörde (§ 114 Abs. 2 KV).",
      },
      { t: "p", text: "Für Haushaltssicherungskonzepte gelten folgende Anforderungen:" },
      {
        t: "ol",
        items: [
          "Der Haushaltsausgleich muss spätestens im fünften auf das Haushaltsjahr folgenden Jahr erreicht werden, für Haushaltssicherungskonzepte 2027 also spätestens 2032.",
          "Die Konsolidierungsmaßnahmen sind einzeln mit ihrem finanziellen Volumen und dem Zeitpunkt ihrer Wirkung darzustellen. Pauschale Minderausgaben werden nicht anerkannt.",
          "Freiwillige Leistungen sind kritisch zu überprüfen. Neue freiwillige Leistungen dürfen nur übernommen werden, wenn sie durch Einsparungen an anderer Stelle gedeckt sind.",
          "Die Hebesätze der Realsteuern sollen mindestens den fiktiven Hebesätzen nach dem Finanzausgleichsgesetz entsprechen (Grundsteuer B 410 %, Gewerbesteuer 380 %).",
          "Gebühren für kostenrechnende Einrichtungen sind kostendeckend zu kalkulieren.",
          "Der Personalaufwand ist durch einen verbindlichen Stellenplan mit Wiederbesetzungssperren zu steuern. Ausnahmen für Pflichtaufgaben (z. B. Kindertagesbetreuung) sind zu begründen.",
        ],
      },
      {
        t: "p",
        text: "Kommunen mit genehmigungspflichtigem Haushaltssicherungskonzept erhalten in den Förderprogrammen des Landes zum Teil erhöhte Förderquoten (z. B. im Programm „Digitale Kommune“). Der Eigenanteil ist im Haushaltssicherungskonzept darzustellen.",
      },
      { t: "h1", text: "4. Kredite" },
      {
        t: "p",
        text: "Der Gesamtbetrag der Kredite für Investitionen bedarf der Genehmigung. Die Genehmigung soll nur erteilt werden, wenn die Kreditverpflichtungen mit der dauernden Leistungsfähigkeit der Kommune in Einklang stehen. Für Kommunen mit Haushaltssicherungskonzept wird die Genehmigung in der Regel auf Investitionen beschränkt, die unabweisbar sind oder sich innerhalb der Nutzungsdauer selbst finanzieren.",
      },
      {
        t: "p",
        text: "Liquiditätskredite dienen ausschließlich der Überbrückung von Zahlungsengpässen. Übersteigen sie 10 % der ordentlichen Aufwendungen, ist im Vorbericht darzulegen, wie sie zurückgeführt werden sollen. Der Höchstbetrag der Liquiditätskredite ist in der Haushaltssatzung festzusetzen; übersteigt er ein Sechstel der ordentlichen Erträge, bedarf er der Genehmigung.",
      },
      { t: "h1", text: "5. Investitionen und Fördermittel" },
      {
        t: "p",
        text: "Investitionen sind nach Dringlichkeit zu priorisieren. Für Maßnahmen ab 1 Mio. € ist vor der Veranschlagung ein Wirtschaftlichkeitsvergleich der in Betracht kommenden Lösungen vorzulegen. Fördermittel sind nur in Höhe bereits vorliegender Zuwendungsbescheide oder verbindlicher Zusagen zu veranschlagen.",
      },
      {
        t: "ul",
        items: [
          "**Landesprogramm „Kita-Ausbau 2026“:** Förderquote 50 %. Für Vorhaben, deren Antrag bis zum 30.11.2025 gestellt wurde, gelten die Bedingungen des Förderaufrufs vom 01.10.2025 fort.",
          "**Förderprogramm „Digitale Kommune“:** Die neu gefasste Förderrichtlinie gilt ab dem Programmjahr 2027. Im Entwurf des Landeshaushalts 2027 sind 18,0 Mio. € vorgesehen. Anträge sind bis zum 31.03.2027 zu stellen; die Förderquote beträgt bis zu 75 %.",
          "**Schulbau und Sportstätten:** Die Programme werden auf dem Niveau von 2026 fortgeführt; Einzelheiten folgen mit gesondertem Erlass.",
        ],
      },
      { t: "h1", text: "6. Verfahren und Fristen" },
      {
        t: "p",
        text: "Die Haushaltssatzung ist mit ihren Anlagen spätestens einen Monat vor Beginn des Haushaltsjahres der Kommunalaufsichtsbehörde vorzulegen (§ 105 Abs. 2 KV). Ich bitte, die Haushaltssatzungen für 2027 **bis zum 30.11.2026** vorzulegen. Haushaltssatzungen mit genehmigungspflichtigen Teilen sollen so rechtzeitig beschlossen werden, dass die Genehmigung vor Beginn des Haushaltsjahres erteilt werden kann. Bis zur Bekanntmachung der Haushaltssatzung gelten die Regeln der vorläufigen Haushaltsführung (§ 113 KV).",
      },
      {
        t: "p",
        text: "Doppelhaushalte für 2027 und 2028 sind zulässig. Kommunen mit Haushaltssicherungskonzept wird hiervon abgeraten, weil das Konzept jährlich fortzuschreiben ist.",
      },
      {
        t: "p",
        text: "Die Jahresabschlüsse sind innerhalb von vier Monaten nach Ablauf des Haushaltsjahres aufzustellen. Kommunen mit Rückständen bei den Jahresabschlüssen legen der Kommunalaufsichtsbehörde mit der Haushaltssatzung einen Zeitplan zur Aufarbeitung vor. Ohne festgestellte Jahresabschlüsse bis einschließlich 2023 wird ein Haushaltssicherungskonzept 2027 in der Regel nicht genehmigt.",
      },
      { t: "h1", text: "7. Datenmeldungen" },
      {
        t: "p",
        text: "Die Kommunen übermitteln die Eckdaten ihrer Haushaltsplanung 2027 (ordentliche Erträge und Aufwendungen, Jahresergebnis, Investitionsauszahlungen, Kredite, Hebesätze) bis zum 15.01.2027 über das Statistikportal des Landes. Die Kommunalaufsichtsbehörden der Landkreise prüfen die Meldungen der kreisangehörigen Gemeinden auf Vollständigkeit.",
      },
      { t: "h1", text: "8. Geltung" },
      {
        t: "p",
        text: "Dieser Erlass gilt für die Aufstellung der Haushalte 2027 sowie für Nachtragshaushalte 2026, die nach seiner Bekanntgabe beschlossen werden. Der Haushaltserlass 2026 vom 19.08.2025 tritt außer Kraft.",
      },
      { t: "pagebreak" },
      { t: "h1", text: "Anlage 1: Orientierungsdaten 2027 bis 2030" },
      { t: "p", text: "Veränderung gegenüber dem jeweiligen Vorjahr in Prozent (Landesdurchschnitt)" },
      {
        t: "table",
        header: ["Position", "2027", "2028", "2029", "2030"],
        rows: [
          ["Gemeindeanteil an der Einkommensteuer", "+ 2,9", "+ 4,1", "+ 4,0", "+ 3,8"],
          ["Gemeindeanteil an der Umsatzsteuer", "+ 2,1", "+ 2,6", "+ 2,4", "+ 2,3"],
          ["Gewerbesteuer (netto)", "+ 2,5", "+ 3,0", "+ 3,2", "+ 3,0"],
          ["Grundsteuer A und B", "+ 1,0", "+ 1,0", "+ 1,0", "+ 1,0"],
          ["Schlüsselzuweisungen", "+ 2,9", "+ 2,0", "+ 2,5", "+ 2,5"],
          ["Personalaufwendungen", "+ 3,5", "+ 2,8", "+ 2,5", "+ 2,5"],
          ["Sach- und Dienstleistungen", "+ 2,0", "+ 2,0", "+ 2,0", "+ 2,0"],
          ["Transferaufwendungen Soziales und Jugend", "+ 4,5", "+ 4,0", "+ 3,5", "+ 3,5"],
        ],
        widths: [4, 1, 1, 1, 1],
      },
      { t: "h1", text: "Anlage 2: Unterlagen zur Vorlage der Haushaltssatzung" },
      {
        t: "ol",
        items: [
          "Haushaltssatzung mit Beschluss der Vertretung",
          "Haushaltsplan mit Vorbericht, Ergebnis- und Finanzplan, Teilplänen und Stellenplan",
          "Investitionsprogramm und Übersicht über die Verpflichtungsermächtigungen",
          "Übersicht über den voraussichtlichen Stand der Verbindlichkeiten und der Rücklagen",
          "gegebenenfalls Haushaltssicherungskonzept oder dessen Fortschreibung mit Maßnahmenliste",
          "Stand der Jahresabschlüsse und gegebenenfalls Zeitplan zur Aufarbeitung",
          "bei Landkreisen: Ergebnis der Anhörung der kreisangehörigen Gemeinden zur Kreisumlage",
        ],
      },
      { t: "signature", lines: ["Im Auftrag", "Rüdiger Stahl", "Leiter der Abteilung 3 – Kommunalaufsicht und Kommunalfinanzen"] },
    ],
  },
];

export const threads: ThreadSpec[] = [
  {
    id: "mkv-presseanfrage-ki-leitfaden",
    title: "Presseanfrage zum KI-Leitfaden",
    subject: "Presseanfrage: KI in der Landesverwaltung",
    org: "mkv",
    unit: "mkv-presse",
    date: "2025-10-09",
    tags: ["widersprueche"],
    keywords: ["Rhedenburger Allgemeine", "Redaktionsschluss", "im Dezember", "rund 300 Beschäftigte"],
    summary:
      "Eine Redakteurin fragt nach dem KI-Einsatz im Land. Pressestelle und Fachreferat stimmen eine Antwort ab – die veröffentlichte Antwort weicht beim Zeitplan vom Fachentwurf ab.",
    mails: [
      {
        from: "ext-albrecht",
        to: ["mkv-vennemann"],
        date: "2025-10-06T15:22",
        body: `Sehr geehrter Herr Vennemann,

für einen Bericht über den Einsatz von KI in Behörden habe ich folgende Fragen an das Ministerium:

1. Nutzen Beschäftigte der Landesverwaltung bereits KI-Programme wie Chatbots? Wenn ja, wie viele?
2. Gibt es Regeln dafür, welche Daten eingegeben werden dürfen?
3. Ist ein Leitfaden geplant und wann wird er veröffentlicht?
4. Welche Kosten sind bisher entstanden?
5. Wie stellen Sie sicher, dass keine Entscheidungen über Bürgerinnen und Bürger von einer KI getroffen werden?

Mein Redaktionsschluss ist Donnerstag, 9. Oktober, 14 Uhr.

Mit freundlichen Grüßen
Nina Albrecht`,
      },
      {
        from: "mkv-vennemann",
        to: ["mkv-albers"],
        cc: ["mkv-wendt", "mkv-brehm"],
        date: "2025-10-06T16:05",
        body: `Lieber Herr Albers,

anbei eine Presseanfrage der Rhedenburger Allgemeinen. Können Sie mir bis Donnerstag, 12 Uhr, einen Antwortentwurf zuliefern? Bitte kurz und allgemeinverständlich, keine Details aus der laufenden Ressortabstimmung.

Danke und Gruß
Lukas Vennemann`,
      },
      {
        from: "mkv-brehm",
        to: ["mkv-vennemann"],
        cc: ["mkv-albers", "mkv-wendt"],
        date: "2025-10-08T17:40",
        attachments: ["mkv-leitfaden-generative-ki"],
        body: `Hallo Herr Vennemann,

im Auftrag von Herrn Albers hier unser Entwurf (Leitfaden-Entwurf nur zur internen Information anbei, bitte nicht weitergeben):

Zu 1: In einem Pilotprojekt testen derzeit rund 300 Beschäftigte aus drei Ressorts einen KI-Assistenten, der in einem Rechenzentrum in Deutschland betrieben wird. Öffentliche Angebote wie frei verfügbare Chatbots sind für dienstliche Inhalte nicht freigegeben.
Zu 2: Ja. Personenbezogene und vertrauliche Daten dürfen nur in freigegebene Anwendungen eingegeben werden, die dafür zugelassen sind.
Zu 3: Ein Leitfaden befindet sich in der Abstimmung. Wir rechnen mit einer Veröffentlichung im Dezember.
Zu 4: Für das Pilotprojekt sind bisher rund 185.000 € angefallen (Lizenzen, Betrieb, Schulung).
Zu 5: Die Verantwortung für jede Entscheidung bleibt beim Menschen. Automatisierte Entscheidungen über Anträge sind ohne gesetzliche Grundlage ausgeschlossen.

Viele Grüße
Johanna Brehm`,
      },
      {
        from: "mkv-vennemann",
        to: ["ext-albrecht"],
        date: "2025-10-09T11:48",
        quote: false,
        body: `Sehr geehrte Frau Albrecht,

vielen Dank für Ihre Anfrage. Gerne beantworte ich Ihre Fragen wie folgt:

Die Landesverwaltung erprobt derzeit in einem Pilotprojekt einen KI-Assistenten, der in einem Rechenzentrum in Deutschland betrieben wird. Rund 300 Beschäftigte aus mehreren Ressorts nehmen teil. Frei verfügbare Chatbots sind für dienstliche Inhalte nicht freigegeben.

Für den Umgang mit Daten gelten klare Regeln: Personenbezogene und vertrauliche Informationen dürfen ausschließlich in dafür zugelassenen Anwendungen verarbeitet werden. Ein Leitfaden für alle Beschäftigten wird derzeit abgestimmt und soll noch im November veröffentlicht werden.

Die Kosten des Pilotprojekts belaufen sich bislang auf rund 185.000 Euro.

Klar ist: Die Verantwortung für Entscheidungen liegt immer beim Menschen. Eine KI trifft keine Entscheidungen über Anträge von Bürgerinnen und Bürgern.

Mit freundlichen Grüßen
Lukas Vennemann
Pressesprecher`,
      },
    ],
  },
  {
    id: "mkv-mitzeichnung-foerderrichtlinie-digitale-kommune",
    title: "Mitzeichnung Förderrichtlinie „Digitale Kommune“ 2027",
    subject: "Mitzeichnung: Entwurf FRL Digitale Kommune 2027 (Az. 35-0485.1/26) – Frist 03.06.",
    org: "mkv",
    unit: "mkv-z2",
    date: "2026-06-05",
    tags: ["widersprueche", "zahlen"],
    keywords: ["Mitzeichnung", "18,0 Mio. €", "Verpflichtungsermächtigung", "Ausgabereste", "Informationssicherheitsleitlinie", "Anlage 4"],
    summary:
      "Hausabstimmung zum Richtlinienentwurf: Informationssicherheit, Onlinedienste und Haushalt melden Änderungsbedarf. Die Mails decken Widersprüche auf – 20 Mio. € in der Richtlinie gegen 18,0 Mio. € im Haushaltsentwurf, 5 Mio. € gegen 4 Mio. € für Onlinedienste, unterschiedliche Verpflichtungsermächtigungen.",
    mails: [
      {
        from: "mkv-sundermann",
        to: ["mkv-scholl", "mkv-kemper", "mkv-lindemann"],
        cc: ["mkv-karaca", "mkv-stahl"],
        date: "2026-05-27T15:42",
        attachments: ["mkv-foerderrichtlinie-digitale-kommune-2027"],
        body: `Liebe Kolleginnen und Kollegen,

anbei der Entwurf der neu gefassten Förderrichtlinie „Digitale Kommune“ ab Programmjahr 2027. Die wesentlichen Änderungen stehen in der Vorbemerkung.

Ich bitte um **Mitzeichnung bis Mittwoch, 03.06.2026, 12 Uhr**, insbesondere zu:
- Z 2: Nr. 5.6 und Anlage 4 (Haushaltsmittel, Verpflichtungsermächtigungen)
- Referat 52: Förderschwerpunkt A, Nr. 4.1 und 4.2
- Referat 53: Nr. 4.3 (Informationssicherheit)

Die Beteiligung der Spitzenverbände ist für Ende Juni geplant, die Ressortabstimmung mit dem Finanzministerium im Juli. Die Richtlinie soll im Oktober veröffentlicht werden, damit die Kommunen ab Januar Anträge stellen können.

Viele Grüße
Claudia Sundermann`,
      },
      {
        from: "mkv-lindemann",
        to: ["mkv-sundermann"],
        cc: ["mkv-karaca"],
        date: "2026-05-29T10:17",
        body: `Liebe Frau Sundermann,

Referat 53 zeichnet mit einer Änderung mit:

Nr. 4.3 verlangt bei Antragstellung ein Informationssicherheitskonzept nach IT-Grundschutz. Das haben nach unserer letzten Abfrage nur rund 30 % der kreisangehörigen Gemeinden. Damit schließen wir gerade die kleinen Kommunen aus, die wir eigentlich erreichen wollen.

Vorschlag: Bei Antragstellung genügen eine beschlossene **Informationssicherheitsleitlinie** und eine benannte ISB-Person (auch interkommunal oder über den Zweckverband). Das vollständige Konzept muss bis zum Ende des Bewilligungszeitraums vorliegen.

Gruß
Sarah Lindemann`,
      },
      {
        from: "mkv-kemper",
        to: ["mkv-sundermann"],
        cc: ["mkv-karaca", "mkv-quast"],
        date: "2026-06-02T08:55",
        body: `Hallo Frau Sundermann,

inhaltlich passt der Entwurf aus unserer Sicht, zwei Punkte:

1. In Nr. 5.6 stehen für den Schwerpunkt A **5 Mio. €**, in Anlage 4 aber jeweils **4,0 Mio. €**. Was gilt? Wir brauchen mindestens die 5 Mio. – nach dem Zwischenstand der Bewilligungen gehen 2026 rund 7 Mio. € in Onlinedienste, ein fester Topf darunter wäre ein Rückschritt.
2. Nr. 4.2: Bitte „sofern der Basisdienst geeignet ist“ streichen, sonst sucht sich jeder eine Ausnahme. Frau Quast schickt Ihnen eine Liste der Leistungen, für die es wirklich keinen passenden Basisdienst gibt.

Mitzeichnung mit diesen Änderungen.

Beste Grüße
Jörg Kemper`,
      },
      {
        from: "mkv-scholl",
        to: ["mkv-sundermann"],
        cc: ["mkv-stahl", "mkv-karaca"],
        date: "2026-06-03T16:20",
        body: `Sehr geehrte Frau Sundermann,

entschuldigen Sie die späte Rückmeldung. Aus haushaltsrechtlicher Sicht kann ich so **nicht** mitzeichnen:

- Im Entwurf des Haushaltsplans 2027 (Kabinettsbefassung am 23.06.) sind bei Kapitel 08 35 Titel 883 61/633 61 zusammen nur **18,0 Mio. €** veranschlagt, nicht 20 Mio. €. Die Kürzung ist Teil der globalen Minderausgabe; das wurde in der Abteilungsleiterrunde am 12.05. mitgeteilt.
- Die Verpflichtungsermächtigung zulasten 2028 beträgt im Entwurf **6,0 Mio. €**, Anlage 4 nennt 10,0 Mio. €. Für 2029 und 2030 gibt es noch gar keine VE – die Finanzplanung ist kein Haushaltsrecht.
- Die **Ausgabereste** aus 2026 (Nr. 5.6: 1,5 Mio. €) können Sie nicht fest einplanen. Nach dem Zwischenstand der Bewilligungen 2026 von Herrn Karaca wird der Ansatz 2026 fast vollständig gebunden, und Reste bedürfen ohnehin der Einwilligung des Finanzministeriums.

Ich bitte, in Nr. 5.6 auf Beträge zu verzichten („nach Maßgabe der im Haushaltsplan bereitgestellten Mittel“) und Anlage 4 zu streichen. Dann zeichne ich mit.

Mit freundlichen Grüßen
Dieter Scholl`,
      },
      {
        from: "mkv-sundermann",
        to: ["mkv-scholl", "mkv-kemper", "mkv-lindemann"],
        cc: ["mkv-stahl", "mkv-karaca"],
        date: "2026-06-05T11:08",
        body: `Liebe Kolleginnen und Kollegen,

danke für die Rückmeldungen. Ich übernehme:
- Nr. 4.3 wie von Frau Lindemann vorgeschlagen (Leitlinie und ISB bei Antrag, Konzept bis Ende des Bewilligungszeitraums).
- Nr. 5.6 ohne Beträge, Anlage 4 entfällt. Für Schwerpunkt A schreiben wir „mindestens 25 % der jährlich verfügbaren Mittel“ – das wären bei 18 Mio. € 4,5 Mio. €, Herr Kemper, mehr ist haushaltsrechtlich nicht drin.
- Nr. 4.2 bleibt vorerst; ich warte auf die Liste von Frau Quast.

Außerdem hat Herr Karaca bemerkt, dass Anlage 3 noch die Höchstbeträge aus einer älteren Fassung enthält (500.000/750.000 € statt 400.000/600.000 €). Ist korrigiert.

Herr Stahl, eine Bitte an Sie: Die Ministerin will bei der Bescheidübergabe in Altmoor am 14.07. die Fortsetzung des Programms „mit 20 Mio. € jährlich“ ankündigen. Nach dem Haushaltsentwurf stimmt das für 2027 nicht. Können Sie das mit dem Leitungsstab klären, bevor der Sprechzettel geschrieben wird?

Viele Grüße
Claudia Sundermann`,
      },
    ],
  },
  {
    id: "mkv-rueckfrage-kaemmerei-falkenbrueck-haushaltserlass",
    title: "Rückfrage der Kämmerei Falkenbrück zum Haushaltserlass 2027",
    subject: "Haushaltserlass 2027 (Az. 33-1510.2/26) – Rückfragen der Stadt Falkenbrück",
    org: "mkv",
    unit: "mkv-33",
    date: "2026-09-02",
    tags: ["zahlen"],
    keywords: ["Haushaltserlass 2027", "2,9 %", "Redaktionsfehler", "§ 113 KV", "10.12.2026", "Berichtigung"],
    summary:
      "Die Kämmerei Falkenbrück fragt nach dem widersprüchlichen Einkommensteuer-Wert im Haushaltserlass, nach höheren Personalaufwendungen und nach der Vorlagefrist; das Ministerium klärt den Redaktionsfehler und erläutert Fristen. Geeignet für Antwortentwürfe und den Abgleich mit dem Erlass.",
    mails: [
      {
        from: "fb-kowalczyk",
        to: ["mkv-freitag"],
        cc: ["fb-grothe"],
        date: "2026-08-25T09:12",
        body: `Sehr geehrte Frau Freitag,

vielen Dank für den Haushaltserlass 2027 vom 18.08.2026. Bei der Fortschreibung unserer Eckwerte sind drei Fragen aufgekommen, um deren kurzfristige Klärung ich bitte:

1. **Einkommensteuer:** In Nr. 2.1 des Erlasses steht für 2027 ein Zuwachs des Gemeindeanteils an der Einkommensteuer von 3,4 %, in der Tabelle der Anlage 1 dagegen von 2,9 %. Bei unserem Ansatz 2026 von 117,4 Mio. € macht das rund 0,6 Mio. € aus. Welcher Wert gilt?

2. **Personalaufwand:** Der Erlass empfiehlt + 3,5 %. Wir kommen wegen 46 zusätzlicher Stellen in den neuen Kitas (u. a. Kiebitzweg) auf + 4,1 %. Reicht es, das im Vorbericht zu begründen, oder gefährdet das die Genehmigung unseres Haushaltssicherungskonzepts?

3. **Frist:** Der Rat beschließt den Haushalt 2027 nach dem Sitzungsplan erst am 10.12.2026. Die Vorlage bis zum 30.11.2026 ist damit nicht zu schaffen. Ist eine spätere Vorlage möglich?

Mit freundlichen Grüßen
Sabine Kowalczyk`,
      },
      {
        from: "mkv-freitag",
        to: ["fb-kowalczyk"],
        cc: ["fb-grothe", "mkv-luebbers"],
        date: "2026-08-27T14:35",
        body: `Sehr geehrte Frau Kowalczyk,

danke für Ihre aufmerksame Lektüre. Zu Ihren Fragen:

1. Maßgeblich ist der Wert der Anlage 1, also **2,9 %**. Die 3,4 % in Nr. 2.1 sind ein Redaktionsfehler aus einer früheren Fassung (Stand vor der regionalisierten Steuerschätzung). Wir versenden in dieser Woche eine **Berichtigung** an alle Kommunalaufsichtsbehörden und kreisfreien Städte.

2. Eine Abweichung von den Orientierungsdaten ist zulässig, wenn sie im Vorbericht nachvollziehbar begründet wird. Stellenmehrungen für Pflichtaufgaben wie die Kindertagesbetreuung erkennen wir grundsätzlich an. Das Haushaltssicherungskonzept muss aber weiterhin den Ausgleich bis spätestens 2032 darstellen; bitte weisen Sie die Kita-Stellen und die gegenzurechnenden Landeszuweisungen gesondert aus.

3. § 105 Abs. 2 KV ist eine Soll-Vorschrift. Bitte legen Sie die Haushaltssatzung unmittelbar nach dem Ratsbeschluss vor, spätestens bis zum 15.12.2026. Eine Genehmigung vor dem 01.01.2027 können wir dann nicht zusagen; bis dahin gelten die Regeln der vorläufigen Haushaltsführung nach § 113 KV.

Mit freundlichen Grüßen
Nele Freitag`,
      },
      {
        from: "fb-kowalczyk",
        to: ["mkv-freitag"],
        cc: ["fb-grothe", "mkv-luebbers"],
        date: "2026-09-02T08:40",
        body: `Sehr geehrte Frau Freitag,

herzlichen Dank, das hilft uns sehr. Wir rechnen mit 2,9 % und legen die Satzung direkt nach dem 10.12.2026 vor.

Die angekündigte Berichtigung ist bei uns bisher nicht eingegangen – könnten Sie sie mir bitte direkt schicken? Unser Rechnungsprüfungsamt fragt bereits nach.

Und eine Nachfrage zu Nr. 4: Wir rechnen Ende 2027 mit Liquiditätskrediten von rund 289 Mio. € und wollen den Höchstbetrag auf 320 Mio. € festsetzen. Das liegt über einem Sechstel der ordentlichen Erträge, braucht also eine Genehmigung. Reicht es, sie zusammen mit dem Haushaltssicherungskonzept zu beantragen?

Mit freundlichen Grüßen
Sabine Kowalczyk`,
      },
    ],
  },
];
