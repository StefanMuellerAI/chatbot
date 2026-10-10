# Plan: Fundus – Beispieldateien und E-Mails aus erfundenen Verwaltungen

Stand: 10. Oktober 2026 · Grundlage: aktueller Code (`Composer.tsx`, Upload-Weg `lib/client/upload.ts` →
`/api/files/process`, `lib/files/extract.ts`, `lib/chat/prepare.ts`, Antwort-Cache, E2E-Suite mit Abdeckungsmatrix)

## 1. Ziel

Teilnehmende sollen mit Dateien üben können, ohne echte Unterlagen ihrer Behörde hochzuladen. Neben der Büroklammer
kommt deshalb ein **Datenbank-Symbol**. Es öffnet den **Fundus**: eine große Sammlung echter Word-, Excel- und
PowerPoint-Dateien aus vielen Verwaltungen mit ihren Dezernaten, Ämtern und Teams. Ein zweiter Reiter enthält
**E-Mail-Verläufe**. Alles wirkt echt, ist aber vollständig erfunden. Ein Klick hängt die Auswahl an den Chat an. Danach
verhält sie sich wie eine hochgeladene Datei.

| | |
|---|---|
| **Umfang** | ca. 150 Dokumente (60 Word, 50 Excel, 40 PowerPoint) und ca. 40 E-Mail-Verläufe (rund 150 E-Mails) aus 8 erfundenen Verwaltungen |
| **Formate** | echte `.docx`, `.xlsx`, `.pptx` und `.eml`, die sich herunterladen und in Office bzw. Outlook öffnen lassen |
| **Im Chat** | wie ein Upload: Chip, Token-Schätzung, Verlauf, Bearbeiten, Export, Antwort-Cache |
| **Kosten** | Es gibt keinen Upload und keinen Blob-Speicher. Die Datei ist für alle gleich, hat also dieselbe Prüfsumme. Darum greifen Datei- und Antwort-Cache über alle Teilnehmenden hinweg. |
| **Schalter** | eigener Funktionsschalter „Fundus“, unabhängig von „Datei-Uploads“ |

Der eigene Schalter erlaubt eine neue Betriebsart. Die Kursleitung kann Uploads echter Dateien abschalten und nur den
Fundus anbieten. Das passt zum Hinweis „keine vertraulichen Daten“.

## 2. Ablauf für Teilnehmende

1. Ein Klick auf das Datenbank-Symbol neben der Büroklammer öffnet den Dialog „Fundus“ mit zwei Reitern:
   **Dokumente** und **E-Mails**.
2. **Dokumente:**
   - **Filter:** Verwaltung → Dezernat bzw. Abteilung → Amt bzw. Team, dazu Dateityp und Merkmale. Außerdem gibt es
     eine Suche.
   - **Vorschau:** Ein Klick auf einen Eintrag zeigt rechts eine Vorschau:
     - Word als Seite mit Briefkopf
     - Excel als Tabelle mit Blattreitern
     - PowerPoint als Folien mit Notizen
   - **Eckdaten:** Verwaltung, Organisationseinheit, Verfasser·in, Datum, Größe und „ca. 2.300 Tokens“.
3. **Auswahl:** Mit Häkchen lassen sich mehrere Dateien wählen und mit „3 Dateien anhängen“ übernehmen. Alternativ
   gibt es in der Vorschau „Anhängen“ und „Herunterladen“.
4. **E-Mails:**
   - **Liste:** Verläufe mit Betreff, Beteiligten, Anzahl der Mails und Datum.
   - **Verlauf:** Geöffnet sieht er aus wie in einem Mailprogramm.
   - **Anhängen:** „Diese E-Mail anhängen“ oder „Ganzen Verlauf anhängen“. Mit der Option „Anhänge mitnehmen“ kommen
     die Dokumente aus der Mail als eigene Anhänge dazu.
5. **Im Eingabefeld:** Der Dialog schließt sich und die Chips erscheinen mit kleinem Fundus-Kennzeichen. Nach etwa
   einer Sekunde steht dort „ca. n Tokens“. Dann Frage stellen und senden.

Auf dem Handy öffnet sich der Dialog im Vollbild. Man geht von der Liste zur Vorschau und mit „Zurück“ wieder zur Liste.

## 3. Die erfundene Welt

### 3.1 Ein zusammenhängendes Weltmodell

Die Dateien hängen über ein gemeinsames Weltmodell zusammen, statt 190 Einzelstücke ohne Bezug zu sein. Das
Weltmodell enthält die Verwaltungen, ihre Organigramme und Personen mit Name, Funktion, Kürzel, Durchwahl und E-Mail.
Dokumente und Mails verweisen darauf:

- Dieselbe Sachbearbeiterin schreibt den Vermerk, verschickt ihn per Mail und steht auf der Teilnehmerliste der
  Präsentation.
- Aktenzeichen, Beträge und Termine passen über die Dateien hinweg zusammen.

Das macht den Fundus glaubwürdig. Es ermöglicht außerdem Übungen über mehrere Dateien, z. B. „Stimmen die Zahlen der
Präsentation mit der Excel-Tabelle überein?“. Dafür sind gezielt Widersprüche eingebaut.

Umgesetzt mit etwas mehr Gewicht auf Land und Bund (Entscheidung 6): drei kommunale Verwaltungen, ein
IT-Dienstleister, je zwei Behörden von Land und Bund.

| Ebene | Name | Einheiten (Auszug) |
|---|---|---|
| Kreisfreie Großstadt | Stadt Falkenbrück | 5 Dezernate mit Hauptamt, Personalamt, IT, Kämmerei, Ordnungsamt, Bürgeramt, Jugendamt, Stadtplanung, Bauaufsicht; Presse |
| Landkreis | Landkreis Altmoorland (Sitz: Altmoor) | Personal, Finanzen, Gesundheitsamt, Jugendamt, Zulassungsstelle, Ausländerbehörde, Bauaufsicht |
| Kreisangehörige Gemeinde | Gemeinde Brackenhain | Hauptamt, Bauamt, Ordnungsamt, Kämmerei |
| Kommunaler IT-Dienstleister | Zweckverband Kommunale IT Altmoor | Service Desk, Rechenzentrum, E-Akte, Informationssicherheit |
| Landesministerium | Ministerium für Kommunales und Verwaltungsentwicklung (Sitz: Rhedenburg) | Zentralabteilung, Kommunalaufsicht, Verwaltungsmodernisierung mit Referat KI |
| Landesoberbehörde | Landesamt für Personalgewinnung und Fortbildung | Personalgewinnung, Fortbildung, Digitale Kompetenzen |
| Bundesministerium | Bundesministerium für Verwaltungsdienste und Bürgerservice | Zentralabteilung, Bürgerservice, Digitale Verwaltung mit Referat KI |
| Bundesoberbehörde | Bundesamt für zentrale Beschaffung und Liegenschaften | Zentrale Dienste, Beschaffung, Liegenschaften |

Alle Namen wurden per Websuche geprüft. „Ellerbach“ gab es als Gemeinde und wurde ersetzt; Land und Bund tragen
Fantasienamen ohne Bezug zu echten Ressortzuschnitten.

### 3.2 Was in den Dateien steckt

| Format | Beispiele | Was sie echt wirken lässt |
|---|---|---|
| **Word** | Vermerk, Beschlussvorlage, Dienstanweisung, Stellenausschreibung, Bescheid-Muster, Niederschrift, Konzept, Leistungsbeschreibung, Pressemitteilung, Datenschutz-Folgenabschätzung, Antwort auf Bürgeranfrage | Briefkopf mit eigenem, schlichtem Signet je Verwaltung (kein echtes Wappen), Aktenzeichen, Bearbeitungsvermerke, Formatvorlagen, Tabellen, Kopf- und Fußzeilen, Seitenzahlen |
| **Excel** | Budgetüberwachung, Haushaltsauszug, Fallzahlen, Personalbedarf, Urlaubs- und Schichtplan, IT-Inventar, Vergabeliste, Wartezeiten Bürgeramt, Energieverbrauch, Projektplan | mehrere Blätter, echte Formeln, Zahlenformate (€, %, Datum), fixierte Kopfzeile, Autofilter, bedingte Formatierung |
| **PowerPoint** | Projektstatus Digitalisierung, Vortrag im Ausschuss, Klausurtagung, Schulung, Haushaltsentwurf, Ergebnisse Bürgerbeteiligung, Onboarding | Folienmaster in den Farben der Verwaltung, Titel- und Agendafolie, Tabellen, echte Diagramme, Sprechernotizen |
| **E-Mail** | Abstimmung zwischen Ämtern, Bürgerbeschwerde, Presseanfrage, Beteiligung Personalrat, IT-Störung, Terminfindung, Weiterleitung mit Anhang, Rückfrage zum Erlass, Bieterfrage | `AW:`/`WG:`, Zitat-Verlauf wie in Outlook, typische Signaturen, `i. A.`, Aktenzeichen im Betreff, Dateien aus dem Fundus als Anhang |

**Merkmale für Übungen** (in der Liste filterbar):

- **Länge:** kurz, mittel oder lang (rund 1.000 bis 20.000 Tokens)
- **Mit Zahlen:** zum Auswerten
- **Mit Widersprüchen oder Fehlern:** zum Prüfen
- **Unstrukturiert:** z. B. Gesprächsnotizen
- **Enthält erfundene personenbezogene Daten:** zum Üben von Anonymisierung und Datenschutz

### 3.3 Echt wirkend, aber nachweislich erfunden

Diese Regeln stehen in `library/README.md`. Ein Unit-Test prüft sie über den ausgelesenen Text **aller** erzeugten
Dateien.

- **Was erfunden ist:**
  - Orte, Behörden, Personen und Firmen sind erfunden.
  - Eine Sperrliste schließt echte Behörden, größere Städte und bekannte Personen aus.
  - Echte Gesetze (BauGB, SGB VIII, DSGVO, OZG …) dürfen vorkommen, weil sie zur Realität gehören.
- **E-Mail-Adressen und Webadressen:** Sie enden auf `.example` (RFC 2606, `p.lindner@falkenbrueck.example`). Diese
  Endung kann nie zugestellt werden. Das gilt auch, wenn jemand die `.eml` in Outlook öffnet und auf „Antworten“
  klickt.
- **Telefonnummern:** nur aus den Bereichen, die die Bundesnetzagentur für Film und Fernsehen freihält.
- **Kennnummern:** IBANs und Steuer-IDs haben ungültige Prüfziffern.
- **Kennzeichnung:** In den Dateieigenschaften steht „Fiktives Übungsdokument – Freebie-Fundus“. Dazu kommt eine
  dezente Fußzeile (Entscheidung 3).

### 3.4 Wie die Inhalte entstehen

- **Inhalte als Daten:** Die Inhalte liegen als strukturierte Daten (TypeScript) im Repo, unter
  `library/world/`, `library/content/documents/<verwaltung>/` und `library/content/mails/`. So lassen sie sich als
  Text prüfen und es liegen keine Binärdateien im Repo (wie bei den Testdateien).
- **Schreiben in Paketen:** Ich schreibe die Inhalte in Paketen je Verwaltung. Zuerst kommt ein **Pilotpaket**
  (15 Dokumente, 5 Verläufe), damit du Ton, Optik und Realismus abnehmen kannst. Danach folgt die volle Breite.
- **Generator:** Er erzeugt beim Build (`prebuild`, also auch auf Vercel und in der CI) die echten Dateien nach
  `.library/` (in `.gitignore`). Dazu schreibt er ein `manifest.json` mit Metadaten, Prüfsumme, Token-Schätzung und
  Vorschau-Daten.
  - **Word:** `docx`
  - **Excel:** `exceljs`, denn SheetJS Community kann keine Formatierung schreiben
  - **PowerPoint:** `pptxgenjs`
  - **E-Mail:** ein kleiner eigener MIME-Schreiber
  - Alle Bibliotheken stehen unter MIT-Lizenz und sind nur Entwicklungsabhängigkeiten.
- **Deterministisch:** Die Zeitstempel in Dateieigenschaften und ZIP-Einträgen sind fest; die Dateien werden dafür
  mit fflate neu gepackt. Jeder Build ergibt so dieselben Prüfsummen, und Datei- und Antwort-Cache bleiben über
  Deploys gültig.
- **Vercel:** `outputFileTracingIncludes` nimmt `.library/**` in die betroffenen Funktionen auf, wie heute schon das
  ffmpeg-Binary. Das sind rund 10 MB.

## 4. Technik

### 4.1 Überblick

```
Browser                                           Server
DB-Symbol → Dialog ── GET  /api/library ────────→ Katalog (nur Metadaten, ca. 80 KB, im Browser zwischengespeichert)
Vorschau ──────────── GET  /api/library/<id> ───→ Vorschau-Daten aus dem Manifest
Herunterladen ─────── GET  /api/library/<id>/file → .docx / .xlsx / .pptx / .eml
Anhängen ──────────── POST /api/library/attach ──→ Text auslesen (Datei-Cache) → Attachment
Senden ────────────── POST /api/chat ────────────→ prepare.ts holt den Text per Prüfsumme (wie heute)
```

### 4.2 Server

- **`lib/library/catalog.ts`:** lädt das Manifest einmal, sucht Einträge über eine streng geprüfte ID und liest die
  Datei aus dem Bundle.
- **`POST /api/library/attach { id }`:**
  - Prüfungen: `requireUser`, dann `requireFeature("library")`. Der Not-Aus gibt 503, ein ausgeschalteter Fundus 403.
    Unbekannte IDs geben 404.
  - Auslesen: Das Auslesen wandert aus `/api/files/process` in eine gemeinsame Funktion. So gelten derselbe
    Datei-Cache, dieselbe Token-Schätzung und dieselben Meldungen.
  - Ergebnis: ein `Attachment` mit `kind: "document"` und `storageKey: "library/<id>/<dateiname>"`.
- **Keine Kopie in den Speicher:** `getFile()` liefert `library/…`-Schlüssel nur lesend aus dem Bundle. Die
  Upload-Routen lehnen dieses Präfix weiterhin ab (Test Y21).
- **Fundus-Anhänge verfallen nicht:** Der Aufräumjob löscht ausgelesene Texte nach der Aufbewahrungsfrist. Fehlt der
  Text deshalb im Datei-Cache und ist `libraryId` gesetzt, liest `prepare.ts` die Datei neu aus. Es erscheint also
  nicht „nicht mehr verfügbar“.
- **Funktionsschalter `features.library`:**
  - Standard: an
  - Fundstellen: `settings-defaults.ts`, Admin-Schalter, `lib/guards.ts` („Der Fundus ist deaktiviert.“),
    `PublicConfig`
- **Download:** Die Antwort kommt als Anhang mit `nosniff` und Sandbox-CSP, wie bei `/api/files/[...key]`.

### 4.3 E-Mails als Dateiformat

- **Neues Format:** `.eml` kommt zu den Dokumentformaten (`limits.ts`, `extract.ts`). Das gilt auch für echte Uploads,
  wer möchte, kann also eigene Mails hochladen.
- **Parser:** `postal-mime` (MIT, ohne Abhängigkeiten). Er versteht:
  - Kopfzeilen mit kodierten Umlauten
  - quoted-printable und base64
  - alte Zeichensätze
  - Mails nur mit HTML, die über das vorhandene turndown zu Text werden
  - Anhänge, die mit Name und Größe aufgeführt werden
- **Text für das Modell:**

  ```
  Von: Petra Lindner <p.lindner@falkenbrueck.example>
  An: Bauaufsicht <bauaufsicht@falkenbrueck.example>
  Datum: Di, 7. Okt. 2025, 14:32
  Betreff: AW: Beschlussvorlage Kita-Ausbau Nordstadt
  Anhänge: Beschlussvorlage_Kita_Nordstadt.docx (38 KB)

  Hallo Herr Brandt, …
  ```
- **Ganzer Verlauf:** „Ganzen Verlauf anhängen“ nimmt die jüngste Mail des Verlaufs. Sie zitiert die früheren Mails
  wie in Outlook und ist damit eine einzige Datei.
- **Anhänge mitnehmen:** Die Option hängt die Fundus-Dokumente aus der Mail zusätzlich als eigene Anhänge an.
- **PowerPoint-Diagramme:** Diagramme wurden bisher nicht ausgelesen. Künftig liest der PowerPoint-Leser auch
  Reihen, Kategorien und Werte. Das gilt auch für Uploads.

### 4.4 Oberfläche

- **`Composer.tsx`:**
  - **Symbol:** neuer Knopf mit `Database`-Symbol direkt nach der Büroklammer. Sein Name ist „Fundus öffnen“, der
    Tooltip „Beispieldateien und E-Mails aus erfundenen Verwaltungen“.
  - **Sichtbarkeit:** sichtbar, wenn `features.library` an ist. Bei Pause oder ohne Modell ist er gesperrt wie die
    Büroklammer.
  - **`ComposerHandle.addLibraryItems()`:** nutzt dieselbe Anhangsliste wie die Uploads:
    - Fortschritt „Wird aus dem Fundus geholt …“
    - Entfernen bricht das Holen ab
    - die Grenze von 20 Anhängen gilt
    - Fehler-Chips blockieren das Senden nicht
- **`components/chat/LibraryDialog.tsx`** baut auf dem vorhandenen `Dialog` auf, ist bis 1100 px breit und 85 % hoch:
  - **Reiter:** nach WAI-ARIA, mit Pfeiltasten bedienbar: „Dokumente (150)“ und „E-Mails (40)“.
  - **Filterleiste:**
    - Verwaltung, dazu die abhängige Organisationseinheit
    - Typ-Chips und Merkmale
    - Suche über Titel, Stichworte, Einheit und Person. Groß- und Kleinschreibung sind egal, ebenso ä/ae und ß/ss.
    - „Filter zurücksetzen“, Trefferzahl und „Keine Treffer.“
  - **Liste:** mit Häkchen. Bereits angehängte Dateien sind als „angehängt“ markiert.
  - **Fußleiste:** „n Dateien anhängen“, dazu „Noch 4 Anhänge möglich“, wenn die Grenze nah ist.
  - **Vorschauen:**
    - `WordPreview`: Seite mit Briefkopf
    - `SheetPreview`: formatierte Zahlen und Blattreiter
    - `SlidesPreview`: 16:9-Folien, Notizen aufklappbar
    - `MailThreadView`: der Verlauf wie im Mailprogramm
  - **Zustand:** Reiter, Filter und Suche bleiben bis zum Neuladen erhalten.
- **`AttachmentChip`:** neue Symbole für E-Mail und PowerPoint und ein kleines Fundus-Kennzeichen. Der Export schreibt
  „📎 name (Fundus)“.
- **Admin → Einstellungen:** neuer Schalter „Fundus“ mit Erklärung: „Teilnehmende können erfundene Beispieldateien
  anhängen – auch wenn Datei-Uploads aus sind.“

### 4.5 Datenmodell

Es gibt keine neue Tabelle. `Attachment` bekommt das Feld `libraryId?: string`. Datei-Cache und Antwort-Cache arbeiten
wie bisher über die Prüfsumme.

## 5. Tests

### 5.1 Unit-Tests (Vitest)

| Bereich | Prüft |
|---|---|
| Weltmodell | eindeutige IDs; jede Person und Einheit, auf die verwiesen wird, existiert; Organigramm ohne Waisen; Antworten liegen zeitlich nach der Ursprungsmail |
| Erfunden-Wächter | über den ausgelesenen Text aller Dateien: Adressen nur auf `.example`, Telefonnummern nur aus den Film-Bereichen, keine gültigen IBANs, nichts von der Sperrliste |
| Generator | Zweimal bauen ergibt dieselben Prüfsummen; Mindestmenge je Typ; jede Datei ist ein gültiges Office-ZIP bzw. eine gültige Mail |
| Auslesbarkeit | Jede Fundus-Datei läuft ohne Fehler durch `extractText`; der Text enthält Titel und die hinterlegten Pflichtbegriffe; die Token-Schätzung im Manifest stimmt |
| E-Mail-Leser | Kopfzeilen, `=?UTF-8?Q?…?=`, quoted-printable, base64, ISO-8859-1/Windows-1252, nur HTML, multipart/alternative, Anhänge; eine kaputte Mail ergibt eine verständliche Meldung |
| PowerPoint-Diagramme | Diagrammdaten erscheinen im Text |
| Suche und Filter | Umlaut-Faltung, Kombination, Sortierung |
| `prepare.ts` | Ein Fundus-Anhang ohne Cache-Eintrag wird neu ausgelesen; eine unbekannte `libraryId` ergibt die bisherige Meldung |

### 5.2 E2E: neuer Katalog-Bereich „Y · Fundus“ in `TESTPLAN.md`

Die Tests liegen hier:

- `tests/e2e/chat/fundus.spec.ts`: läuft damit automatisch in Chromium, WebKit und Firefox; Handy und Tablet über
  `@mobil`/`@tablet`.
- `admin-einstellungen.spec.ts`: der Schalter (Q21).
- `api/robustheit.spec.ts`: die API (Y21).

Der Mock zeigt mit `#zeige-dateien` bereits, welcher Text beim Modell ankommt. Damit prüft jeder Anhänge-Test den
Inhalt und nicht nur den Chip.

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| Y01 | Datenbank-Symbol neben der Büroklammer | sichtbar mit Namen und Tooltip; fehlt bei ausgeschaltetem Fundus; gesperrt bei Pause und ohne Modell |
| Y02 | Dialog öffnen und schließen (X, Esc, Klick daneben) | Reiter „Dokumente“ ist aktiv; der Fokus geht zurück auf das Symbol; Reiter, Filter und Suche bleiben beim erneuten Öffnen erhalten |
| Y03 | Katalog | Die Anzahl je Reiter stimmt mit der API überein; alle Verwaltungen und Einheiten stehen im Filter; je Typ ist mindestens die zugesagte Menge da |
| Y04 | Filter Verwaltung → Einheit, Typ, Merkmale, kombiniert, zurücksetzen | Trefferliste und Trefferzahl stimmen; die abhängige Auswahl leert sich beim Wechsel; „Keine Treffer.“ |
| Y05 | Suche nach Titel, Stichwort, Einheit und Person (Groß/klein, ä/ae, ß/ss) | erwartete Treffer, auch zusammen mit Filtern |
| Y06 | Vorschau Word, Excel (Blattreiter) und PowerPoint (Notizen) | Briefkopf, Aktenzeichen, formatierte Zahlen, Folienzahl; Eckdaten mit Token-Schätzung |
| Y07 | Herunterladen | Dateiname und Typ stimmen; die Datei ist gültig (im Test geöffnet) und enthält den Titel |
| Y08 | Je ein Word-, Excel- und PowerPoint-Dokument anhängen | Chip mit Fortschritt, dann „ca. n Tokens“ und Fundus-Kennzeichen; das Modell bekommt den erwarteten Inhalt |
| Y09 | Mehrfachauswahl und Grenze | „3 Dateien anhängen“; bei 18 vorhandenen Anhängen sind nur noch 2 wählbar, mit Hinweis; auch gemischt mit echten Uploads |
| Y10 | Bereits angehängte Datei | in der Liste als „angehängt“ markiert, kein Doppel |
| Y11 | Entfernen während des Holens; Serverfehler; Katalog lädt nicht | Die Anfrage wird abgebrochen; der Fehler-Chip zeigt eine deutsche Meldung und blockiert das Senden nicht; der Dialog zeigt eine Meldung mit „Erneut versuchen“ |
| Y12 | E-Mail-Reiter: Liste, Filter, Suche nach Betreff und Absender | Verläufe nach Datum sortiert, richtige Treffer |
| Y13 | Verlauf öffnen | alle Mails in Reihenfolge mit Von, An, Cc, Datum und Betreff; Anhänge sichtbar |
| Y14 | Einzelne E-Mail anhängen | Chip mit Mail-Symbol; das Modell bekommt Absender, Empfänger, Datum, Betreff und Text |
| Y15 | Ganzen Verlauf anhängen | Das Modell bekommt alle Mails des Verlaufs in Reihenfolge |
| Y16 | „Anhänge mitnehmen“ an bzw. aus | an: Mail plus enthaltene Dokumente als eigene Anhänge; aus: nur die Mail, die Anhänge werden darin namentlich genannt |
| Y17 | Fundus-Anhänge im weiteren Verlauf | Sie bleiben nach dem Neuladen, beim Bearbeiten und beim Neu-Generieren erhalten und stehen im Markdown-Export |
| Y18 | Caches | Das zweite Anhängen kommt aus dem Datei-Cache. Dieselbe erste Frage mit derselben Fundus-Datei kommt in einem neuen Chat aus dem Antwort-Cache. Ist der Datei-Cache nach dem Aufräumjob leer, wird die Datei trotzdem beantwortet. |
| Y19 | Nur Tastatur, Screenreader, axe | Reiter mit Pfeiltasten, Liste mit Pfeilen und Leertaste, Enter hängt an; Namen und Zustände stimmen; keine schweren axe-Befunde in beiden Reitern und der Vorschau, hell und dunkel |
| Y20 | Handy und Tablet | Vollbild; Liste → Vorschau → Zurück; Anhängen funktioniert; kein seitliches Scrollen |
| Y21 | API für Katalog, Vorschau, Datei und Anhängen | 401 ohne Sitzung, für Gäste erlaubt; unbekannte ID 404; Pfad-Tricks in der ID 400; Fundus aus 403, Pause 503; Download mit `nosniff` und Sandbox-CSP; Upload-Routen lehnen `library/`-Pfade ab |

**Angepasste und neue IDs außerhalb von Y**

- **Q21 (neu):** Schalter „Fundus“ an und aus wirkt auf Oberfläche und API. Mit „Datei-Uploads“ aus verschwindet
  die Büroklammer, das Datenbank-Symbol bleibt.
- **F01/F02:** Die Dateiauswahl nimmt `.eml` an. F02 bekommt eine Testmail als neues Format.
- **N02:** Der Screenshot-Satz enthält den Dialog, hell und dunkel.
- **X08 (Live-Smoke):** eine Fundus-Datei anhängen und befragen. Die Kosten bleiben unter 0,01 $.
- **`coverage.json`:**
  - Einstellung `features.library`
  - die 4 neuen Routen
  - die neuen Bedienelemente: Symbol, Reiter, Filter, Suche, Liste, Vorschau, Herunterladen, Anhängen, Verlauf
    anhängen, Anhänge mitnehmen, Zurück

  Der CI-Check verhindert Lücken.

**Fertig heißt**

- Die komplette Suite läuft lokal dreimal hintereinander grün (`--repeat-each=3`).
- Die CI ist grün in Chromium, WebKit und Firefox.
- Die Abdeckungsprüfung ist grün, keine Katalog-ID ist ohne Test.
- Während der Suite gibt es keine Browserfehler und keine 500er.
- `TESTPLAN.md` und `README.md` sind aktualisiert.

## 6. Umsetzung in Phasen

| Phase | Inhalt | Stand |
|---|---|---|
| 1 · Grundlage | Weltmodell; Generator für Word, Excel, PowerPoint und E-Mail; feste Prüfsummen; `.eml` auslesen; PowerPoint-Diagramme; **Pilotpaket** mit 15 Dokumenten und 5 Verläufen; Unit-Tests | erledigt |
| 2 · Server | Katalog, Vorschau, Download, Anhängen, Schalter, Rückfall in `prepare.ts`; Y21, Q21 | erledigt |
| 3 · Oberfläche | Datenbank-Symbol, Dialog mit beiden Reitern, Vorschauen, Mehrfachauswahl, Chips; Y01–Y20 | erledigt |
| **Abnahme Pilot** | Du schaust dir Pilotpaket und Dialog an: Optik, Ton und Realismus. Erst danach entsteht die Masse. | offen |
| 4 · Volle Breite | alle 8 Verwaltungen, ca. 150 Dokumente und 40 Verläufe; Wächter- und Auslesetests laufen über alles | nach der Abnahme |
| 5 · Abschluss | `TESTPLAN.md`, `coverage.json`, `README.md`, Live-Smoke X08, Stabilitätslauf, CI in drei Browsern | Doku und Tests erledigt; Live-Smoke nach dem Deploy |

**Pilotpaket (umgesetzt)**

| Verwaltung | Dokumente | E-Mail-Verlauf |
|---|---|---|
| Stadt Falkenbrück | Beschlussvorlage Kita-Ausbau (Word), Budgetüberwachung Jugend (Excel), Bürgeramt 2030 (PowerPoint) | Mitzeichnung der Beschlussvorlage – Kämmerei widerspricht bei Kosten und Frist |
| Landkreis Altmoorland | Vermerk Rückstände Ausländerbehörde (Word), Fallzahlen Zulassungsstelle (Excel) | – |
| Gemeinde Brackenhain | Gesprächsnotiz Lärmbeschwerde mit fiktiven Personendaten (Word) | Wütende Bürgerbeschwerde und interner Vorschlag an den Bürgermeister |
| Zweckverband IT Altmoor | Ticketstatistik mit eingebautem Widerspruch (Excel), Projektstatus E-Akte (PowerPoint) | Störung durch abgelaufenes Zertifikat |
| Landesministerium (MKV) | Langer KI-Leitfaden als Entwurf (Word) | Presseanfrage – veröffentlichte Antwort weicht vom Fachentwurf ab |
| Landesamt (LPF) | Fortbildungsplanung mit Budgetabgleich über zwei Blätter (Excel), Personalgewinnung (PowerPoint) | – |
| Bundesministerium (BMVB) | KI-Assistenz Sachstand (PowerPoint), Personalbedarfsermittlung (Excel) | – |
| Bundesamt (BZBL) | Vergabevermerk Notebooks (Word), Energiebericht (PowerPoint) | Bieterfrage – Frist im Verlauf passt nicht zum Vergabevermerk |

**Abweichungen bei der Umsetzung**

- **Kein Lesen über `getFile`:** Fundus-Dateien werden nur über die eigenen Routen gelesen (`lib/library/catalog.ts`).
  `library/`-Schlüssel bleiben für Upload und Dateiauslieferung gesperrt (Y21).
- **Auslesen verbessert (gilt auch für Uploads):** Zahlen aus Excel-Dateien erscheinen in deutscher Schreibweise
  (1.234,50 €), Foliennummern werden nicht mehr als Inhalt gelesen, Diagrammtitel und Achseneinheit getrennt.
- **Generator:** `pptxgenjs` schreibt bei Fettdruck mitten im Absatz ungültiges XML – der Generator korrigiert das beim
  Neupacken, sonst böte PowerPoint eine Reparatur an.
- **Barrierefreiheit:** Die Tabellenvorschau ist per Tastatur scrollbar; farbige Typ-Beschriftungen sind im Dunkelmodus
  durch neutrale Schrift mit farbigem Symbol ersetzt (axe, Y19).

## 7. Bewusst nicht enthalten (später möglich)

- Auswahl pro Termin oder Gruppe: Die Kursleitung stellt eine Teilmenge zusammen. Die Merkmale lassen Platz dafür.
- Eigene Dateien der Kursleitung über den Admin-Bereich in den Fundus laden.
- PDFs, Bilder und eingescannte Dokumente im Fundus. Die Technik ist vorbereitet, weil `getFile` `library/`-Schlüssel
  liest.
- Outlook-`.msg`-Dateien.
- Übungsideen je Datei mit „Als Frage übernehmen“.

## 8. Entscheidungen

Getroffen am 10. Oktober 2026: Alle Empfehlungen übernommen, der Schwerpunkt der Verwaltungen etwas in Richtung Land
und Bund verschoben.

1. **Name in der Oberfläche:** „Fundus“.
2. **Umfang:** ca. 150 Dokumente und 40 E-Mail-Verläufe aus 8 Verwaltungen, nach Abnahme des Pilotpakets.
3. **Kennzeichnung als erfunden:** in den Dateieigenschaften **und** als dezente Fußzeile „Fiktives Übungsdokument“.
4. **E-Mail-Adressen auf `.example`.**
5. **Fundus unabhängig von Uploads**, mit eigenem Schalter im Admin (standardmäßig an).
6. **Schwerpunkt:** drei kommunale Verwaltungen, ein IT-Dienstleister, je zwei Behörden von Land und Bund.
