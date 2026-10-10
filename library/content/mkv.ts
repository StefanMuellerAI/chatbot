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
];
