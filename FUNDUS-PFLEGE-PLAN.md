# Plan: Fundus pflegen – eigene Dateien, E-Mail-Verläufe und Prompts mit Platzhaltern

Stand: 14. Oktober 2026, **Entwurf** · Entscheidungen getroffen (Abschnitt 16) · Grundlage: aktueller Code
(Fundus in `library/`, `lib/library`, `components/chat/library`; Admin in `components/admin`, `app/api/admin`; Ablage in
`lib/storage.ts`; Extraktion in `lib/files`), Fundus aus [FUNDUS-PLAN.md](FUNDUS-PLAN.md), Grenzfälle aus
[GRENZFAELLE-PLAN.md](GRENZFAELLE-PLAN.md), E2E-Suite aus [TESTPLAN.md](TESTPLAN.md), Handbuch unter
[docs/handbuch](docs/handbuch/README.md)

## 1. Ziel

Der Fundus wird **im Admin-Bereich pflegbar** und bekommt einen dritten Bereich **„Prompts“**:

1. Die Kursleitung **lädt eigene Dokumente hoch** (Word, Excel, PowerPoint, PDF). Sie erscheinen im Fundus neben den
   150 mitgelieferten Dateien, mit denselben Filtern, derselben Vorschau und demselben „Anhängen“.
2. Die Kursleitung **lädt eigene E-Mail-Verläufe hoch** (mehrere `.eml`-Dateien ergeben einen Verlauf). Sie lassen sich
   wie die 40 mitgelieferten Verläufe ganz oder mailweise anhängen.
3. Die Kursleitung **legt Prompts mit Platzhaltern an**, ordnet sie **Kategorien** zu und sortiert beides. Teilnehmende
   filtern im Fundus nach Kategorie und suchen im Text.
4. Wählt eine Person einen Prompt, erscheint **vor dem Einfügen eine Maske**. Dort füllt sie die Platzhalter, und zwar
   **alle**: Jeder Platzhalter ist ein Pflichtfeld. Erst danach landet der **fertig ausgefüllte Text im Eingabefeld**.
   Gesendet wird nichts automatisch.
5. Mitgelieferte Einträge kann die Kursleitung **ausblenden**. Bearbeiten lassen sie sich nicht, denn sie entstehen
   beim Build aus dem Code.

| | Teilnehmende | Kursleitung |
|---|---|---|
| Dokumente, Verläufe und Prompts im Fundus sehen | ja (Schalter „Fundus“) | ja |
| Prompt ausfüllen und einfügen | ja, auch im Gruppenchat | ja |
| Dateien und Verläufe hochladen, Prompts und Kategorien anlegen | – | ja, Admin › Fundus |
| Mitgelieferte Einträge ausblenden | – | ja |
| Eigene Einträge bearbeiten (Angaben, nicht die Datei), deaktivieren, löschen | – | ja |

**Abgrenzung zu den „Vorlagen“:** Eine Vorlage (Admin › Vorlagen, Tabelle `presets`) ist eine **unsichtbare Rolle**
für einen ganzen Chat. Sie hängt am System-Prompt. Ein **Prompt** aus dem Fundus ist dagegen **sichtbarer Text** in der
eigenen Nachricht. Er ändert weder System-Prompt noch Prompt-Cache. Beides lässt sich kombinieren: Vorlage
„E-Mail-Profi“ wählen, dann den Prompt „Bürgeranfrage beantworten“ einfügen. Damit das nicht verwechselt wird, heißt
der neue Bereich nie „Vorlage“ (Entscheidung 1).

**Was sich grundlegend ändert:** Der Fundus ist heute rein statisch. Er wird beim Build aus `library/` nach `.library/`
erzeugt und liegt schreibgeschützt im Funktions-Bundle. Es gibt keine Tabelle und keinen Blob dafür. Neu kommt eine
**zweite, dynamische Quelle** dazu: Postgres-Tabellen plus Dateien im privaten Blob-Store unter dem Präfix `fundus/`.
Der Server führt beide Quellen zu **einem Katalog** zusammen. Für Teilnehmende bleibt der Fundus ein Ort.

## 2. Ablauf

**Kursleitung (vor dem Kurs)**

1. Öffnet Admin › **Fundus**. Oben stehen die Zahlen: eigene Dokumente, Verläufe, Prompts und ausgeblendete Einträge.
2. **Dokumente:** klickt „Dateien hochladen“ und wählt oder legt bis zu 20 Dateien ab. Der Upload zeigt den
   Fortschritt je Datei.
3. Im **Prüfschritt** sieht sie für jede Datei: erkannten Typ, Tokens, Länge („Kurz/Mittel/Lang“), aufklappbare
   Vorschau und Hinweise (z. B. „enthält eine echte E-Mail-Adresse“ oder „gibt es schon als …“).
   - Für alle Dateien gemeinsam setzt sie: Datum, Merkmale, Stichwörter, Kurzbeschreibung. Die Verwaltung ist immer
     „Eigene Inhalte“ (Entscheidung 2).
   - Je Datei kann sie Titel und Angaben überschreiben.
4. Bestätigt „Keine echten personenbezogenen oder vertraulichen Daten“ und klickt **„Speichern (3 Dateien)“**.
   Fehlerhafte Dateien bleiben mit Meldung stehen, die übrigen werden gespeichert.
5. **E-Mail-Verläufe:** „Verlauf hochladen“, wählt die `.eml`-Dateien eines Vorgangs. Freebie sortiert sie nach Datum
   und schlägt den Titel aus dem Betreff vor (ohne „AW:“/„WG:“). Anhänge in den Mails werden als Dokumente des Verlaufs
   übernommen.
6. **Kategorien:** legt z. B. „Schreiben“, „Zusammenfassen“, „Einfache Sprache“ an und sortiert sie mit „nach oben“ und
   „nach unten“.
7. **Prompts:** „Neuer Prompt“ öffnet einen Dialog mit diesen Feldern:
   - Titel, Kategorie, Kurzbeschreibung und Text. Tippt sie `{{Zielgruppe}}`, erscheint unten eine Zeile für diesen
     Platzhalter: Beschriftung, Hinweis, Art (einzeilig, mehrzeilig, Auswahl), Standardwert.
   - „So sieht es im Chat aus“ zeigt die Maske zum Ausprobieren.
8. Blendet bei Bedarf mitgelieferte Einträge aus, die nicht zum Kurs passen.

**Teilnehmende (im Kurs)**

1. Öffnet den Fundus (Datenbank-Symbol). Neu ist der dritte Reiter **„Prompts (24)“** neben „Dokumente“ und „E-Mails“.
2. Filtert nach Kategorie oder sucht („einfache sprache“ findet auch „Einfache Sprache“).
3. Rechts erscheint die Vorschau: Text mit hervorgehobenen Platzhaltern, Beschreibung, Felder.
4. Klickt **„Ausfüllen und einfügen“**. Die **Maske** öffnet sich mit einem Pflichtfeld je Platzhalter und einer
   Live-Vorschau.
5. Füllt alle Felder aus und klickt **„Einfügen“**. Der Text steht im Eingabefeld, der Cursor steht am Ende. Die Person
   kann noch ändern, hängt bei Bedarf selbst eine Datei aus dem Fundus an und schickt dann ab.
6. Steht schon Text im Eingabefeld, fragt die Maske: **„Ersetzen“** oder **„Anfügen“** (Entscheidung 6).

## 3. So sieht es aus

Die Optik bleibt die des Fundus-Dialogs (Liste links, Vorschau rechts, Handy: Liste/Detail im Wechsel). Neu sind der
Reiter „Prompts“, die Maske und der Admin-Reiter.

**Reiter „Prompts“ im Fundus**

- Filterzeile: Suchfeld, Kategorie-Chips mit Zahl (mehrere = oder), „Filter zurücksetzen“. Kategorien ohne aktive
  Prompts fehlen.
- Liste gruppiert nach Kategorie in der Reihenfolge aus dem Admin. Je Eintrag: Titel, Kurzbeschreibung, „2 Platzhalter“.
- Einzelauswahl, keine Häkchen (anders als bei Dokumenten). Mit Pfeiltasten wählt man aus, `Enter` öffnet die Maske.
- Vorschau: Kategorie, Titel, Beschreibung, Text mit hervorgehobenen Platzhaltern, Liste der Felder.
- Fußzeile: „Ausfüllen und einfügen“ (ohne Platzhalter: „Einfügen“).

**Maske „Prompt ausfüllen“** (eigener Dialog über dem Fundus; Handy: Vollbild)

```
┌ Prompt ausfüllen ──────────────────────────────────────────── ✕ ┐
│ E-Mail-Verlauf zusammenfassen · Zusammenfassen                  │
│                                                                 │
│ Zielgruppe          [ z. B. die Amtsleitung                 ]   │
│ Anzahl Punkte       [ 5                                     ]   │
│ Was ist dir wichtig?                                            │
│                     [                                       ]   │
│                     [                                       ]   │
│ Vorschau                                                        │
│ Fasse den angehängten E-Mail-Verlauf für ▒Zielgruppe▒ in 5      │
│ Punkten zusammen: Wer will was von wem? Welche Fristen laufen?  │
│ Achte besonders auf ▒Was ist dir wichtig?▒                      │
│                                                                 │
│ ⓘ Im Eingabefeld steht schon Text.                              │
│                          [Abbrechen]  [Anfügen]  [Ersetzen]     │
└─────────────────────────────────────────────────────────────────┘
```

- Felder in der Reihenfolge des ersten Vorkommens. **Alle Felder sind Pflicht** (Entscheidung 13), deshalb gibt es
  kein Sternchen, sondern einen Satz über den Feldern: „Bitte alle Felder ausfüllen.“ Fehler erscheinen direkt am Feld.
- Die Vorschau zeigt ausgefüllte Werte normal und offene Platzhalter hervorgehoben.
- Ohne Entwurf gibt es nur „Abbrechen“ und „Einfügen“.

**Admin › Fundus**

- Neuer Reiter „Fundus“ (Datenbank-Symbol) zwischen „Vorlagen“ und „Sicherheit“. Er lädt seine Daten selbst, damit der
  Admin-Bereich beim Start schnell bleibt.
- Kopf mit Zahlen. Bei ausgeschaltetem Schalter steht dort „Der Fundus ist für Teilnehmende ausgeschaltet – pflegen
  geht trotzdem“.
- Unterreiter **Dokumente · E-Mail-Verläufe · Prompts · Kategorien**.
- **Dokumente/Verläufe:**
  - Suche und Auswahl „Eigene / Mitgelieferte / Ausgeblendet“.
  - Zeilen mit Typ-Symbol, Titel, Verwaltung (bei eigenen immer „Eigene Inhalte“), Datum, Tokens und Kennzeichen
    „eigen“, „mitgeliefert“, „ausgeblendet“, „inaktiv“.
  - Eigene Einträge: Bearbeiten (Angaben), Aktiv-Schalter, Herunterladen, Löschen.
  - Mitgelieferte Einträge: Vorschau, Ausblenden/Einblenden, „Alle einblenden“.
- **Prompts:** gruppiert nach Kategorie, mit „nach oben/unten“, Aktiv, Bearbeiten, Löschen.
- **Kategorien:** Name, Zahl der Prompts, „nach oben/unten“, Umbenennen, Löschen (nur wenn leer).

## 4. Platzhalter: Schreibweise und Regeln

Die Logik liegt in **einer** browser-tauglichen Datei `lib/shared/placeholders.ts`. Admin-Dialog, Maske und
Server-Prüfung nutzen dieselben Funktionen `parsePlaceholders`, `validatePrompt` und `fillPrompt`.

| Regel | Festlegung |
|---|---|
| Schreibweise | `{{Name}}`. Eckige Klammern (`[Zielgruppe]`) sind in Verwaltungstexten zu häufig (`[?]`, Aktenzeichen) |
| Gültiger Name | 1–40 Zeichen: Buchstaben (auch Umlaute), Ziffern, Leerzeichen, `-`, `_`. Leerzeichen direkt nach `{{` und vor `}}` zählen nicht (`{{ Zielgruppe }}`) |
| Gleicher Platzhalter | Vergleich ohne Groß/klein und mit ä=ae, ö=oe, ü=ue, ß=ss (`fold()` aus `lib/library/search.ts`) → **ein** Feld, überall eingesetzt; angezeigt wird die erste Schreibweise |
| Kein Platzhalter | `{{}}`, `{{a{{b}}`, `{x}`, `{{ungültig!}}` bleiben wörtlich im Text; der Admin-Dialog warnt bei `{{` ohne `}}` und bei ungültigen Namen (Zeile und Stelle) |
| Je Platzhalter einstellbar | Beschriftung (Standard: Name), Hinweis (grauer Platzhaltertext, z. B. „z. B. den Hauptausschuss“), Art (einzeilig, mehrzeilig, Auswahl), Auswahlwerte (2–20, je ≤ 100 Zeichen), Standardwert (vorausgefüllt, änderbar) |
| Pflicht | **Jeder Platzhalter muss ausgefüllt werden** – es gibt keine optionalen Platzhalter und keine Einstellung dafür (Entscheidung 13). Ein Standardwert zählt als ausgefüllt, solange er nicht gelöscht wird |
| Grenzen | Text ≤ 8.000 Zeichen (wie die Anweisung einer Vorlage), ≤ 20 Platzhalter |
| Ausfüllen | **ein Durchgang**, Werte gehen **wörtlich** hinein: `{{…}}`, `$&`, `$1` und `\` im Wert werden nicht ersetzt. Umgesetzt mit `split` statt `String.replace` mit Ersetzungsmustern |
| Bereinigen | Steuerzeichen außer Zeilenumbruch und Tab werden entfernt, auch Null-Byte; `\r\n` wird `\n`. Einzeilige Werte: Zeilenumbrüche werden Leerzeichen |
| Leer | Nur Leerzeichen gilt als leer. Bei leeren Feldern erscheint „Bitte ausfüllen.“ am Feld, der Fokus springt auf das erste leere Feld, „Einfügen“ fügt nichts ein. `fillPrompt` selbst verweigert unvollständige Werte (Fehler statt halbem Text) |
| Länge | einzeilig ≤ 300, mehrzeilig ≤ 50.000 Zeichen; das Ergebnis darf die Grenze des Eingabefelds nicht überschreiten (privat 400.000, Gruppenchat 50.000 Zeichen) – sonst ist „Einfügen“ gesperrt und eine Meldung nennt die Zahl |
| Werte merken | Bis zum Neuladen der Seite bleiben die Werte je Prompt im Speicher, nie in `localStorage` (sie können Inhalte aus der Behörde enthalten) |

Konfiguration eines Platzhalters, der beim Bearbeiten kurz aus dem Text verschwindet (Ausschneiden/Einfügen), bleibt
im Dialog erhalten, bis gespeichert wird. Erst beim Speichern entfallen verwaiste Einstellungen.

## 5. Datenmodell (neue Tabellen, automatisch angelegt)

Wie bisher: `CREATE TABLE IF NOT EXISTS` in `lib/db/bootstrap.ts`, passende `pgTable` in `lib/db/schema.ts`.

```
fundus_items          eigene Dokumente und Verläufe
  id            text PK        "eigen-<slug>-<4 hex>", passt zu LIBRARY_ID, kollidiert nie mit mitgelieferten IDs
  kind          text           'document' | 'thread'
  title, summary text; date text (YYYY-MM-DD)   Verwaltung immer „Eigene Inhalte“, keine Einheit
  tags, keywords jsonb         Merkmale (Länge automatisch) und Stichwörter
  doc_type      text NULL      word | excel | powerpoint | pdf
  file_name, file_key, mime, size, sha256, text, tokens   nur Dokumente; file_key = fundus/<uuid>/<name>
  preview       jsonb NULL     beim Hochladen erzeugt (≤ 200 KB, sonst gekürzt mit Hinweis)
  thread_id     text NULL      Anhang-Dokument eines Verlaufs (gehört zu ihm, ON DELETE CASCADE)
  enabled bool, created_at, updated_at
fundus_mails          Mails eigener Verläufe
  id text PK ("<threadId>-<n>"), thread_id → fundus_items ON DELETE CASCADE, position int,
  subject, from_name, from_email, to/cc jsonb, date timestamptz, message_id text,
  file_name, file_key, mime, size, sha256, text, tokens, attachments jsonb (IDs der Anhang-Dokumente)
fundus_hidden         ausgeblendete mitgelieferte Einträge
  id text PK, hidden_at
prompt_categories
  id text PK ("kat-<slug>"), name text (eindeutig ohne Groß/klein und ä/ae), sort_order int, updated_at
prompts
  id text PK ("prompt-<slug>-<4 hex>"), category_id → prompt_categories (ON DELETE RESTRICT),
  title, description, text, placeholders jsonb (Beschriftung, Hinweis, Art, Auswahlwerte, Standardwert je Platzhalter),
  enabled bool, sort_order int, created_at, updated_at
```

Prompts verweisen **nicht** auf Dateien (Entscheidung 8). Das Übungsmaterial liegt schon im Fundus; die Person hängt
es selbst an. Löschen oder Ausblenden von Dateien berührt Prompts deshalb nie.

- **Text liegt in der Tabelle.** Der Aufräumjob löscht `file_cache` nach `fileRetentionDays`. Eigene Fundus-Anhänge
  holen ihren Text dann aus `fundus_items.text` bzw. `fundus_mails.text`, so wie mitgelieferte aus `.library/`
  (`libraryText`).
- **Revision:** Jede Änderung im Admin erhöht einen Zähler in `settings` (Zeile `key = 'fundus'`, `{revision}`). Daraus
  entsteht die Katalog-Version `<mitgeliefert>-<revision>` und damit das ETag. Neon-http kennt keine Transaktionen,
  deshalb gilt: erst schreiben, dann zählen.
- **Startbestand:** 12 Prompts in 6 Kategorien (Tabelle unten). Sie werden **einmalig** angelegt, wenn die Zeile
  `settings.key = 'fundus-start'` fehlt, und danach markiert. Anders als bei den Vorlagen kommt nach „alles löschen“
  beim nächsten Kaltstart nichts zurück. Alle Start-Prompts sind frei bearbeitbar.
- **Verwaltung eigener Einträge:** immer die feste Pseudo-Verwaltung **„Eigene Inhalte“** (`orgId = 'eigen'`, Ebene
  „Kursleitung“, ohne Einheiten; Entscheidung 2). Die Tabelle braucht deshalb keine Spalten für Verwaltung und
  Einheit.
  - `LEVEL_LABELS` bekommt `eigen`.
  - `unitId` wird im Katalog-Typ optional; `unitLabel` und der Einheiten-Filter kommen damit klar (Filter bleibt bei
    „Eigene Inhalte“ gesperrt).
  - Im Katalog erscheint „Eigene Inhalte“ nur, wenn es Einträge gibt.

**Startbestand** (Texte aus dem abgenommenen Entwurf; passende Übungsdateien liegen im mitgelieferten Fundus, die
Prompts verweisen aber nicht darauf)

| Kategorie | Prompt | Platzhalter |
|---|---|---|
| Schreiben | Bürgeranfrage freundlich beantworten | Fachbereich, Wortzahl |
| Schreiben | Absage höflich formulieren | Empfänger, Anliegen |
| Schreiben | Pressemitteilung entwerfen | Anlass, Person |
| Zusammenfassen | Vorlage in Stichpunkten zusammenfassen | Anzahl, Zielgruppe |
| Zusammenfassen | E-Mail-Verlauf zusammenfassen | Zielgruppe, Anzahl Punkte, Schwerpunkt (mehrzeilig, Beschriftung „Was ist dir wichtig?“) |
| Zusammenfassen | Aufgaben aus einem Protokoll ziehen | – (direkt einfügen) |
| Einfache Sprache | Behördentext in Einfache Sprache | Zielgruppe |
| Einfache Sprache | Text auf Verständlichkeit prüfen | Zielgruppe, Text (mehrzeilig) |
| Auswerten | Tabelle auswerten und als Diagramm zeigen | Anzahl, Zielgruppe |
| Auswerten | Widersprüche zwischen Dokumenten finden | – (direkt einfügen) |
| Recherche | Fakten mit Quellen prüfen | Thema |
| Prompten lernen | Meinen Prompt verbessern lassen | Dein Prompt (mehrzeilig) |

## 6. Hochladen, Prüfen, Speichern

**Weg der Datei**

- **Auf Vercel:** Funktionen nehmen höchstens 4,5 MB an. Die Datei geht deshalb wie im Chat **direkt in den privaten
  Blob-Store**:
  - Token oder Presigned-URL von `POST /api/admin/fundus/token`, nur Kursleitung.
  - Schlüssel `fundus/<uuid>/<Dateiname>`; der Server prüft Präfix und Endung.
- **Lokal:** `POST /api/admin/fundus/local` (FormData), ebenfalls nur Kursleitung.
- **Ablage:** `lib/storage.ts` → `assertSafeKey` lernt das Präfix `fundus`.
  - Beim Token wird die Datei mit Art `fundus` und **1 Tag Frist** in `stored_files` vorgemerkt. Abgebrochene Uploads
    räumt der Aufräumjob also weg.
  - **Beim Speichern** wird die Frist auf den **31.12.9999** gesetzt. Der Aufräumjob (`expiresAt < now`) lässt die
    Datei dann für immer stehen. Ein festes Datum statt `infinity`, damit drizzle es als gültiges `Date` liest.
  - **Beim Löschen** gehen Datei und Zeile über `deleteFiles`.
  - Die vorhandene Mime-Auflösung im lokalen Modus über `stored_files` funktioniert so unverändert weiter.

**Prüfen** (`POST /api/admin/fundus/check`, je Datei)

1. **Typ:** Endung aus der Liste (docx, xlsx, pptx, pdf; Verläufe: eml), dazu die Magic Bytes (ZIP bzw. `%PDF`).
   Falsche Formate bekommen Tipps aus `unsupportedMessage` (`.doc` → „als .docx speichern“, `.msg` → „in Outlook als
   .eml speichern“).
2. **Text:** `extractText` mit `assertZipSafe` (200 MB entpackt). „Kein lesbarer Text“ ergibt 422 mit Meldung, z. B.
   bei einem PDF aus reinen Scans.
3. **Tokens und Länge:** `estimateTokens` und `lengthTag` (wie beim Build).
4. **Vorschau**, beim Hochladen aus der echten Datei erzeugt:
   - Excel → `SheetPreview` über SheetJS (erste 200 Zeilen und 30 Spalten je Blatt)
   - PowerPoint → `Slide`-Karten aus `## Folie n` der Extraktion (Titel, Text, Notizen)
   - Word und PDF → neue Vorschau-Art `text` (Markdown aus der Extraktion, gerendert ohne HTML)
   - Mails → `MailPreview` aus postal-mime
   - Vorhandene Komponenten `SheetsPreview`, `SlidesPreview` und `MailCard` laufen ohne Briefkopf. Neu ist nur
     `TextPreview`.
5. **Hinweise:**
   - **Echte Daten:** `fictionProblems()` aus `library/build/fiction.ts` (nach `lib/library` verschoben). Es meldet
     echte Mail-Domains, gültige IBANs und echte Telefonnummern als **Warnung**, nicht als Fehler.
   - **Dubletten:** Prüfsumme bereits im Fundus.
   - **Gekürzte Vorschau.**
6. **Speichern** (`POST /api/admin/fundus/documents` bzw. `/threads`):
   - Es geht nur mit der Bestätigung „keine echten Daten“ (Entscheidung 9).
   - Gespeichert werden nur geprüfte Schlüssel aus `fundus/`.
   - Die Revision steigt.

**Verläufe**

- 1–50 `.eml`, jede ≤ 50 MB, zusammen ≤ 100 MB.
- **Sortierung:** nach `Date`. Fehlt das Datum, gibt es einen Hinweis, und die Mail steht an der Stelle der Auswahl.
- **Titel:** Betreff der ersten Mail ohne `AW:`, `WG:`, `Re:`, `Fwd:` (auch mehrfach); bearbeitbar.
- **Beteiligte:** aus Von/An/Cc.
- **Doppelte Mail** (gleiche `Message-ID` oder Prüfsumme): Meldung, sie wird nicht übernommen.
- **Anhänge:**
  - Unterstützte Anhänge (docx, xlsx, pptx, pdf) werden **Dokumente des Verlaufs** (`thread_id`). Damit funktioniert
    „Anhänge mitnehmen“ wie bei den mitgelieferten Verläufen.
  - Andere Anhänge stehen nur in der Mail („Anhänge: Plan.dwg (2 MB)“).
  - Anhang-Dokumente lassen sich nicht einzeln löschen, solange der Verlauf besteht (409).

**Unveränderliche Dateien:** Eine Datei wird nie ersetzt, nur ihre Angaben ändern sich. Wer eine neue Fassung braucht,
lädt sie neu hoch und löscht die alte (Entscheidung 5). So bleiben Prüfsummen, Datei-Cache, Antwort-Cache und
Vorschau-Cache (1 Stunde im Browser) stimmig.

**Grenzen:** 500 eigene Dokumente, 200 Verläufe, 500 Prompts, 50 Kategorien, 20 Dateien je Upload. Meldungen sind verständlich, nichts wird halb angelegt.

## 7. Katalog, Chat und Caches

- **Zusammenführen:** `getCatalog()` (mitgeliefert, nach `mtime`) und `getOwnCatalog()` (DB, je Revision in
  `globalThis` zwischengespeichert) werden in `lib/library/catalog.ts` zu einem Katalog. Er enthält:
  - Ausgeblendete Einträge fehlen, inaktive auch.
  - Hinzu kommen `categories` und `prompts`; der Prompt-Text steckt direkt im Katalog. Er ist kurz und sonst nie
    veraltet.
  - Neu ist `source: "fundus" | "eigen"` je Eintrag, dazu der Typ `pdf` mit eigener Farbe in `TYPE_STYLE`.
- **Aktualität ohne Neuladen:** `loadCatalog()` hält das Versprechen nicht mehr für die ganze Sitzung. Es fragt
  **bei jedem Öffnen** des Fundus mit `If-None-Match` nach. 304 ist billig; 200 bringt den neuen Stand.
  - Gewählte Einträge, die es nicht mehr gibt, fallen mit Hinweis aus der Auswahl („1 Eintrag ist nicht mehr im
    Fundus“).
  - Eine offene Maske bleibt nutzbar (der Text liegt schon im Browser).
- **Anhängen:**
  - `POST /api/library/attach` kennt eigene IDs: Datei aus Blob, `extractDocument` (Datei-Cache), Attachment mit
    `libraryId` und `storageKey: fundus/…`.
  - Für eigene PDFs mit „PDF nativ“ setzt es `native: true`. Dafür muss `getFile` die Datei lesen können, was mit dem
    neuen Präfix geht.
- **Text nach Ablauf des Datei-Caches:** `libraryText(id)` liest bei eigenen IDs aus der DB, bei mitgelieferten wie
  bisher aus `.library/`.
  - Gelöschte eigene Einträge ergeben den vorhandenen Hinweis „… ist nicht mehr verfügbar“.
  - Ausgeblendete oder inaktive Einträge **bleiben in bestehenden Chats nutzbar**. Ausblenden wirkt nur auf die
    Auswahl.
- **Antwort-Cache:** Eigene Dateien haben feste Bytes, ihre Prüfsumme ist für alle gleich. Wie bei den mitgelieferten
  gibt es Treffer über Personen hinweg. Ein ausgefüllter Prompt ist normaler Nachrichtentext: Wer dieselben Werte
  einsetzt, bekommt die Antwort aus dem Cache (gewollt, spart Budget).
- **Prompt-Cache:** unverändert. Kein neuer Abschnitt im System-Prompt, keine Werkzeuge; V05 bleibt byte-gleich.
- **Gruppenchat:**
  - Der Fundus samt Prompts steht dort wie bisher zur Verfügung.
  - Der eingefügte Text beginnt mit „@Freebie “, denn ein Prompt richtet sich immer an Freebie (Entscheidung 12).
  - Es gilt die Grenze von 50.000 Zeichen.
  - Die Route `/api/groupchats/[id]/freebie` kommt zu `outputFileTracingIncludes` (siehe Abschnitt 14).

## 8. API

| Route | Wer | Zweck |
|---|---|---|
| `GET /api/library` | angemeldet, Schalter | Katalog inkl. eigener Einträge, Kategorien und Prompts; ETag `"fundus-<mitgeliefert>-<revision>"`, 304 |
| `GET /api/library/[id]` | angemeldet, Schalter | Vorschau auch für eigene Dokumente und Verläufe (Vorschau unveränderlich → `max-age=3600` bleibt) |
| `GET /api/library/[id]/file` | angemeldet, Schalter | Download eigener Dateien aus Blob, Sandbox-CSP, `nosniff`, `Content-Disposition` |
| `POST /api/library/attach` | angemeldet, Schalter | Anhängen eigener Einträge (Dokument, einzelne Mail) |
| `GET /api/admin/fundus` | Kursleitung | alles für den Admin-Reiter: eigene Einträge, mitgelieferte (kurz) mit „ausgeblendet“, Kategorien, Prompts inkl. inaktiver, Zahlen |
| `POST /api/admin/fundus/token` | Kursleitung | Blob-Upload (Token bzw. Presigned) nur für `fundus/`, vormerken mit 1 Tag Frist |
| `POST /api/admin/fundus/local` | Kursleitung | lokaler Upload ohne Blob |
| `POST /api/admin/fundus/check` | Kursleitung | Datei(en) prüfen: Typ, Text, Tokens, Vorschau, Hinweise, Dubletten; Verläufe: Reihenfolge, Titelvorschlag, Anhänge |
| `POST`/`PUT`/`DELETE /api/admin/fundus/documents` | Kursleitung | Dokumente speichern (geprüfte Schlüssel + Angaben), Angaben ändern, löschen |
| `POST`/`PUT`/`DELETE /api/admin/fundus/threads` | Kursleitung | Verläufe ebenso |
| `POST`/`PUT`/`DELETE /api/admin/fundus/prompts` | Kursleitung | Prompts inkl. Platzhalter-Einstellungen, Reihenfolge, Aktiv |
| `POST`/`PUT`/`DELETE /api/admin/fundus/categories` | Kursleitung | Kategorien, Reihenfolge; Löschen nur leer (409) |
| `PUT /api/admin/fundus/hidden` | Kursleitung | `{ id, hidden }` bzw. `{ all: true, hidden: false }` |

- Alle Admin-Routen sind dreifach geschützt: Proxy (Rolle, Origin), `requireAdmin()` und zod mit deutschen `LABELS`
  über `germanZodMessage`.
- Fehler kommen als `{ error }` mit Status 400, 403, 404, 409, 413 oder 422, nie 500.
- Während einer Pause (Not-Aus) bleibt die Pflege möglich. Die Chat-Routen geben wie bisher 503.

## 9. Sicherheit und Datenschutz

- **Trennung der Pfade:** Gäste schreiben nur `uploads/`. Neu prüfen auch `/api/files/[...key]` und `/api/files/process`
  das Präfix ausdrücklich. Fundus-Dateien gibt es für Gäste **nur** über `/api/library/[id]/file`, mit
  Schalter-Prüfung. Sonst wäre `/api/files/fundus/…` ein Weg am Schalter „Fundus“ vorbei, sobald `assertSafeKey`
  `fundus` kennt.
- **Inhalte sind Daten:**
  - Prompt-Texte, Titel und Mailtexte werden nur als Text gerendert (Markdown ohne HTML, wie im Chat).
  - Mail-HTML wird mit turndown zu Text.
  - Dateinamen laufen durch `safeFileName`.
  - Downloads bekommen Sandbox-CSP und `nosniff`.
- **Prompt-Werte** gehen nur dorthin, wohin die Person sie selbst schickt. Sie werden nicht gespeichert, außer als
  normale Nachricht im eigenen Verlauf.
- **Echte Daten:** Der Fundus ist eine Spielumgebung. Beim Hochladen warnt Freebie vor echten Merkmalen, das Speichern
  braucht eine Bestätigung. Eigene Inhalte bleiben **dauerhaft** gespeichert (bis zum Löschen), anders als Uploads im
  Chat. Das steht im Admin und im Handbuch.
- **Zip-Bomben und kaputte Dateien:** dieselbe Absicherung wie beim Chat-Upload (`assertZipSafe`, 422 mit Meldung).

## 10. Was dafür im Code nötig ist

| Bereich | Dateien |
|---|---|
| Platzhalter | `lib/shared/placeholders.ts` (neu): Parsen, Prüfen, Ausfüllen, Bereinigen |
| Daten | `lib/db/schema.ts`, `lib/db/bootstrap.ts` (5 Tabellen), `lib/db/seed.ts` (Startbestand), `lib/fundus/store.ts` (neu: CRUD, Grenzen, Revision, IDs aus Titeln mit ä→ae, Löschen inkl. Dateien) |
| Hochladen | `lib/fundus/upload.ts` (neu: Prüfen, Vorschau, Verläufe, Hinweise), `lib/library/fiction.ts` (aus `library/build` verschoben, Build importiert von dort), `lib/storage.ts` (Präfix `fundus`, dauerhafte Frist) |
| Katalog | `lib/library/types.ts` (`pdf`, `source`, `text`-Vorschau, `LibraryPrompt`, `PromptCategory`, Ebene `eigen`), `lib/library/catalog.ts` (Zusammenführen, `libraryText`, Anhängen), `lib/library/search.ts` (`filterPrompts`) |
| API | `app/api/admin/fundus/**` (neu), `app/api/library/**` (eigene Einträge), `app/api/files/**` (Präfix-Prüfung) |
| Admin | `components/admin/AdminApp.tsx` (Reiter), `components/admin/fundus/` (neu: `FundusTab`, `UploadDialog`, `ThreadDialog`, `PromptDialog` mit Platzhalter-Tabelle, `CategoriesPanel`), `lib/client/upload.ts` (Upload mit Ziel `fundus`) |
| Chat | `components/chat/library/LibraryDialog.tsx` (Reiter „Prompts“, Revalidierung), `PromptsPanel.tsx` und `PromptFillDialog.tsx` (neu), `Previews.tsx` (`TextPreview`, Vorschauen ohne Briefkopf, PDF), `Composer.tsx` (`onInsertText` mit Ersetzen/Anfügen), `ChatApp.tsx` und `GroupChatView.tsx` (Einfügen, „@Freebie “) |
| Sonstiges | `next.config.ts` (Tracing für die Gruppenchat-Route), `lib/chat/prepare.ts` (Text eigener Einträge) |

## 11. Tests – die Suite bleibt vollständig

**Katalog-IDs:** zwei neue zweistellige Bereiche, die `coverage.mjs` schon versteht.

- **FP** = Fundus pflegen (Admin)
- **PR** = Prompts im Chat
- Eigene Dateien und Verläufe im Chat setzen **Y** fort: Y22–Y26.
- „Vorlagen“ (L, R) bleiben unberührt.

**Fixtures (`tests/e2e/support`)**

- **`AdminApi` wird erweitert:** `fundus()`, `uploadFundusFile(name)`, `saveDocument(key, angaben)`,
  `uploadThread(namen, angaben)`, `createCategory`, `createPrompt`, `updatePrompt`, `deleteFundus`, `hide`.
- **`snapshot()`/`restore()` werden erweitert:**
  - Kategorien, Prompts und ausgeblendete IDs kommen in den Schnappschuss.
  - Nach jedem Admin-Test löscht `restore()` zusätzliche eigene Einträge samt Dateien.
  - Gelöschte Start-Prompts legt es neu an, ausgeblendete blendet es wieder ein.
  - Ohne das würden Admin-Tests ihren Zustand weitergeben (heute kennt `restore()` den Fundus nicht).
- **Ort der Tests:** Alles, was den Fundus **ändert**, läuft im Projekt `admin` (serieller Server). Y03/Y04 vergleichen
  im parallelen `chat`-Projekt Zahlen mit der API und würden sonst wackeln. Chat-Tests, die eigene Inhalte brauchen
  (Y22–Y26, Teile von PR), öffnen dort zusätzlich einen Gast-Browser (`openChat`). Lesende PR-Tests nutzen den
  Startbestand und laufen in `chat`, `mobile`, `tablet`, `chat-webkit` und `chat-firefox`.
- **Seitenobjekte:** `FundusAdminPage` (Unterreiter, Upload, Prüfschritt, Prompt-Dialog, Kategorien) und
  `PromptMask` (Felder, Vorschau, Einfügen/Ersetzen/Anfügen), analog zu `MailPage` und `GroupChatPage`.
- **`generate-files.ts` (VERSION 5):**
  - Verlauf `verlauf-1.eml` bis `verlauf-3.eml` mit `AW:`/`WG:`, `Message-ID`/`In-Reply-To` und einem docx-Anhang
  - `ohne-datum.eml`, `doppelt.eml` (gleiche Message-ID), `kaputt.eml`
  - `echte-daten.docx` (echte Mail-Domain, gültige Test-IBAN), `nur-bild.docx` (kein Text)
  - Vorhanden und wiederverwendet: `vertrag.docx`, `zahlen.xlsx`, `folien.pptx`, `bericht.pdf`, `bombe.docx`,
    `falsch.pdf`
- **Mock:** keine neue Diagnose-Zeile nötig. `#zeige-dateien` zeigt den Inhalt eigener Anhänge, die Zeile „Vorlage“
  fehlt bei Prompts.

**Neuer Bereich FP · Fundus pflegen (Admin)**

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| FP01 | Reiter „Fundus“ | Unterreiter, Zahlen, Listen mit „eigen/mitgeliefert/ausgeblendet/inaktiv“, Suche und Auswahl; Hinweis, wenn der Schalter aus ist |
| FP02 | Dokumente hochladen: Word, Excel, PowerPoint, PDF, mehrere auf einmal, per Auswahl und Ablegen | Fortschritt je Datei; Prüfschritt mit Typ, Tokens, Länge, Vorschau; gemeinsame und einzelne Angaben; nach dem Speichern in der Liste und im Chat (Y22) |
| FP03 | Prüfungen beim Hochladen | `.doc`, `.msg`, `.exe`, Bild → Meldung mit Tipp; PNG als `.docx` erkannt; leer, zu groß (413), kaputt, Zip-Bombe, ohne lesbaren Text (422); fehlerhafte Datei bleibt mit Meldung stehen, die anderen werden gespeichert |
| FP04 | Dubletten, Doppelklick, Abbruch | dieselbe Datei erneut → „gibt es schon als …“, nichts doppelt; Doppelklick auf „Speichern“ legt einmal an; Abbrechen während des Uploads hinterlässt keinen Eintrag, die Datei ist nach dem Aufräumjob weg |
| FP05 | Hinweis auf echte Daten | `echte-daten.docx` → Warnung je Fundstelle; „Speichern“ erst mit Bestätigung (immer nötig); API ohne Bestätigung 400 |
| FP06 | E-Mail-Verlauf hochladen | drei `.eml` in falscher Reihenfolge → nach Datum sortiert; Titel ohne „AW:“/„WG:“; Beteiligte; docx-Anhang als Dokument des Verlaufs; im Chat wie mitgelieferte Verläufe (Y23) |
| FP07 | Prüfungen Verlauf | `.msg` mit Tipp; Datei ohne Kopfzeilen (422); doppelte Mail; Mail ohne Datum (Hinweis, Stelle der Auswahl); mehr als 50 Mails; nicht unterstützte Anhänge nur genannt; kodierte Betreffs und Umlaute korrekt |
| FP08 | Eigene Einträge bearbeiten | Titel, Datum, Merkmale, Stichwörter, Beschreibung, Aktiv; Wirkung im Chat beim nächsten Öffnen; Prüfsumme und Datei unverändert |
| FP09 | Eigene Einträge löschen | Rückfrage nennt die Anhang-Dokumente eines Verlaufs; Datei und Zeilen weg (Download 404); Verlauf nimmt seine Anhänge mit; Anhang-Dokument einzeln 409; Prompts bleiben unberührt |
| FP10 | Mitgelieferte ausblenden | einzeln aus- und einblenden, „Alle einblenden“; ausgeblendet fehlt im Chat-Katalog und beim Anhängen (404) |
| FP11 | Kategorien | anlegen, umbenennen, nach oben/unten (Maus und Tastatur); doppelter Name (auch „Einfache sprache“, „Einfache Sprache “) abgelehnt; leer oder zu lang; Löschen nur leer (409 nennt die Zahl) |
| FP12 | Prompt anlegen | Titel, Kategorie (auch „Neue Kategorie …“ im Dialog), Beschreibung, Text; Platzhalter-Tabelle erscheint beim Tippen; je Platzhalter Beschriftung, Hinweis, Art, Auswahlwerte, Standardwert (keine Einstellung „Pflicht“); Probe-Maske; nach dem Speichern im Chat |
| FP13 | Prompt-Prüfungen | Titel, Kategorie oder Text fehlt, Text über 8.000 Zeichen, ungültiger Name, `{{` ohne `}}` (Warnung mit Stelle), 21 Platzhalter, Auswahl ohne bzw. mit zu vielen Werten, Standardwert nicht in der Auswahl, Hinweis „ohne Platzhalter“; Einstellung eines kurz entfernten Platzhalters bleibt bis zum Speichern |
| FP14 | Prompts ordnen und pflegen | nach oben/unten innerhalb der Kategorie, Kategorie wechseln, deaktivieren, löschen (Rückfrage) |
| FP15 | Startbestand | frische Installation: 12 Prompts in 6 Kategorien; alle löschen, Server neu starten → bleibt leer; Start-Prompts frei bearbeitbar |
| FP16 | Admin-API des Fundus | 401, 403 (Gast, fremde Origin), 400 mit deutscher Meldung (Felder, Grenzen, IDs, Schlüssel außerhalb `fundus/`, ungeprüfte Schlüssel), 404, 409, 413, 422; während der Pause geht die Pflege |
| FP17 | Speicher und Aufräumjob | Aufräumjob nach abgelaufener Frist: eigene Fundus-Dateien und Texte bleiben, abgebrochene Uploads und abgelaufener Datei-Cache gehen; nach Neustart ist alles da; Gäste erreichen `fundus/` weder über `/api/files` noch über die Upload-Wege (400) |
| FP18 | Grenzen | 500 Prompts, 50 Kategorien, 20 Platzhalter, 20 Dateien je Upload: verständliche Meldungen, nichts halb angelegt (Dokumente und Verläufe: Unit-Test) |
| FP19 | Barrierefreiheit und Tastatur | axe ohne „serious/critical“ für Reiter, Upload-, Verlauf-, Prompt- und Kategorien-Dialog, hell und dunkel; Platzhalter-Tabelle per Tastatur; Fehler mit `aria-invalid` und `aria-describedby`; Fokus kehrt zurück |

**Neuer Bereich PR · Prompts im Chat**

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| PR01 | Reiter „Prompts“ | Zahl im Reiter wie in der API; gruppiert nach Kategorie in Admin-Reihenfolge; leere Kategorien fehlen; Reiter und Filter bleiben beim Schließen |
| PR02 | Filter und Suche | Kategorie-Chips mit Zahl (mehrere = oder); Suche in Titel, Beschreibung, Text und Platzhaltern (groß/klein, ä/ae, ß/ss); kombiniert; „Keine Treffer.“; „Filter zurücksetzen“ |
| PR03 | Vorschau | Kategorie, Beschreibung, Text mit hervorgehobenen Platzhaltern, Liste der Felder; Pfeiltasten wechseln, `Enter` öffnet die Maske |
| PR04 | Maske ausfüllen und einfügen | ein Feld je Platzhalter in Reihenfolge des ersten Vorkommens (doppelter Platzhalter → ein Feld, zweimal eingesetzt); Beschriftung, Hinweis, Standardwert, Auswahl, mehrzeilig; Live-Vorschau; „Einfügen“ → Text im Eingabefeld, Cursor am Ende, beide Dialoge zu, nichts gesendet |
| PR05 | Alle Felder Pflicht | ein leeres Feld (auch nur Leerzeichen, auch ein gelöschter Standardwert) → „Bitte ausfüllen.“ am Feld, Fokus aufs erste leere, nichts eingefügt; erst alle gefüllt → Einfügen; Länge je Feld; Ergebnis über der Grenze des Eingabefelds → „Einfügen“ gesperrt mit Zahl |
| PR06 | Werte aus dem echten Leben | Umlaute, Emoji, Arabisch (RTL), geschütztes Leerzeichen, eingefügter Word-Text mit Zeilen; `{{Zielgruppe}}`, `$&`, `$1`, `\` im Wert bleiben wörtlich; Steuerzeichen und Null-Byte entfernt; einzeilig ohne Zeilenumbruch |
| PR07 | Entwurf im Eingabefeld | Maske zeigt Hinweis, „Ersetzen“ und „Anfügen“ (Leerzeile dazwischen); ein unverändert eingefügter Prompt gilt nicht als Entwurf; beim Bearbeiten einer früheren Nachricht landet der Prompt im Bearbeitungsfeld, der Entwurf kommt danach zurück; „Abbrechen“ ändert nichts |
| PR08 | Prompt ohne Platzhalter | „Einfügen“ ohne Maske; Entwurfsschutz wie C25 (Hinweis mit „Ersetzen“) |
| PR09 | Senden und Caches | gefüllter Prompt geht als normale Nachricht (Mock: Text wörtlich, keine Platzhalter mehr, keine Zeile „Vorlage“); zweiter Gast mit gleichen Werten → Antwort aus dem Cache; zusammen mit einer Vorlage nutzbar (Zeile „Vorlage“ nennt die Vorlage) |
| PR10 | Gruppenchat | Prompts im Fundus des Gruppenchats; eingefügter Text beginnt mit „@Freebie “; Grenze 50.000 Zeichen; die anderen sehen erst nach dem Senden etwas |
| PR11 | Doppelklick und Tastatur | Doppelklick und doppeltes `Enter` auf „Einfügen“ fügen einmal ein; `Enter` im einzeiligen Feld → nächstes Feld, im letzten = Einfügen; `Strg`/`Cmd`+`Enter` fügt ein; im mehrzeiligen Feld macht `Enter` eine neue Zeile (auch iPad); `Esc` schließt erst die Maske, dann den Fundus; Werte bleiben beim erneuten Öffnen desselben Prompts bis zum Neuladen |
| PR12 | Handy und Tablet (`@mobil`, `@tablet`) | Reiter erreichbar, Liste/Detail im Wechsel, Maske im Vollbild, aktives Feld nicht von der Tastatur verdeckt, kein seitliches Scrollen |
| PR13 | Barrierefreiheit | Felder mit Beschriftung, `aria-required`, Fehler mit `aria-invalid`/`aria-describedby`; axe ohne „serious/critical“ in Reiter und Maske, hell und dunkel; Fokus kehrt ins Eingabefeld |

**Fortsetzung Y · eigene Inhalte im Chat**

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| Y22 | Eigene Dokumente im Chat | im Reiter „Dokumente“ mit Zahl; Verwaltung „Eigene Inhalte“ im Filter; Typ-Chip „PDF“; Merkmale; Vorschau (Text, Tabellen, Folien); Download byte-gleich; Anhängen → Chip „Fundus · ca. n Tokens“, das Modell bekommt den Inhalt |
| Y23 | Eigene Verläufe im Chat | Reihenfolge nach Datum, einzelne Mail, ganzer Verlauf, „Anhänge mitnehmen“ |
| Y24 | Ausgeblendet, inaktiv, gelöscht | ausgeblendet und inaktiv fehlen in Auswahl und API (404); schon angehängt bleibt im Chat nutzbar (Neu generieren); gelöscht → „… ist nicht mehr verfügbar“ |
| Y25 | Neuer Stand ohne Neuladen | Kursleitung ändert, Gast öffnet den Fundus erneut → neuer Stand (200 statt 304); gewählte, inzwischen gelöschte Einträge fallen mit Hinweis aus der Auswahl |
| Y26 | Text nach Ablauf des Datei-Caches | Aufräumjob mit abgelaufener Frist; eigener Fundus-Anhang geht weiter mit Inhalt ans Modell – im Chat und im Gruppenchat |

**Weitere neue Katalog-IDs**

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| V09 | Eigenes PDF aus dem Fundus bei Claude und GPT (Fake-API), „PDF nativ“ an und aus | an: Dokument-Block mit den echten Bytes aus `fundus/`; aus: Text; Prüfsumme und Antwort-Cache wie bei Uploads; Caching-Vertrag (V05) unverändert |
| W09 | 25 Gäste öffnen den Fundus, füllen Prompts aus und senden, während die Kursleitung Prompts speichert und eine Datei hochlädt | keine Fehler, kein 500; jeder sieht nach erneutem Öffnen den neuen Stand; ETag bleibt stimmig |
| X11 | Live: Kursleitung legt eine Kategorie und einen Prompt mit Platzhalter an, Gast füllt die Maske, sendet an Claude Haiku („Niedrig“) | Antwort nimmt den eingesetzten Wert auf; Prompt und Kategorie danach gelöscht (< 0,01 $; übersprungen, wenn der Schalter aus ist) |

**Angepasste Katalog-IDs**

- **Q21 (Schalter „Fundus“):** aus → auch keine Prompts und Maske, Chat-API 403; der Admin-Reiter bleibt bedienbar mit
  Hinweis.
- **Y03/Y04:** Zahlen enthalten eigene Einträge, Filter kennt „Eigene Inhalte“ und „PDF“. Im `chat`-Projekt gibt es
  keine eigenen Einträge, die Mindestzahlen bleiben.
- **Y21 (Fundus-API):** ETag mit Revision; eigene IDs; Gäste kommen über Upload- und Datei-Routen nicht an `fundus/`.
- **O01:** Admin-Bereich mit allen Reitern, also auch „Fundus“.
- **U01–U03:** Routenlisten um alle neuen Admin-Routen erweitert (401/403, falsche Methode, kaputtes JSON).
- **W07 (Zufallstest):** neue Aktionen „Prompt ausfüllen und einfügen“ (zufällige Werte inkl. Sonderzeichen),
  „Maske abbrechen“ und „eigenes Dokument anhängen“. Neue Invariante: kein `{{` eines ausgefüllten Platzhalters im
  Eingabefeld.
- **X08 (Live):** prüft zusätzlich, dass der Reiter „Prompts“ Einträge hat.

**Unit-Tests** (Vitest, PGlite im Speicher, Isolation über eindeutige Namen)

- **`tests/unit/platzhalter.test.ts`**
  - Parsen:
    - Reihenfolge des ersten Vorkommens
    - Zusammenführen ohne Groß/klein und mit ä/ae
    - Leerzeichen am Rand
    - Grenzen 40 Zeichen und 20 Platzhalter
    - `{{}}`, `{{a{{b}}`, `{x}`, `{{{x}}}`, `}}{{`
    - Platzhalter am Textanfang und -ende
    - Zeilenumbruch im Namen
  - Warnungen mit Zeile und Stelle.
  - Ausfüllen:
    - mehrfach eingesetzt
    - Werte mit `{{x}}`, `$&`, `$1`, `$$`, `\`, Emoji, RTL, NBSP
    - Steuerzeichen, Null-Byte, `\r\n`
    - einzeilig mit Umbruch
    - fehlender oder leerer Wert (auch nur Leerzeichen) → Fehler, nie halber Text
    - Standardwert gilt als Wert
    - Längen je Art, Ergebnis über der Grenze
  - Determinismus: gleiche Eingaben ergeben gleichen Text.
  - Zufallstest mit festem Seed (1.000 Texte): kein Absturz; ausgefüllt enthält kein gültiges `{{Name}}` eines
    ausgefüllten Platzhalters mehr.
- **`tests/unit/fundus-store.test.ts`**
  - Anlegen, Ändern und Löschen für Dokumente, Verläufe, Prompts und Kategorien.
  - IDs aus Titeln (ä→ae, Sonderzeichen, Länge), Kollision mit mitgelieferten IDs unmöglich.
  - Reihenfolge; Kategorie löschen nur leer.
  - Verlauf löscht Mails und Anhang-Dokumente.
  - Ausblenden.
  - Revision steigt bei jeder Änderung.
  - Grenzen (500/200/500/50) mit verständlicher Meldung, nichts halb angelegt.
  - Startbestand nur einmal, auch nach „alles gelöscht“ und Neustart.
- **`tests/unit/fundus-upload.test.ts`**
  - Typ aus Endung und Magic Bytes; falsche Formate mit Tipp.
  - Vorschau für docx, xlsx (200 Zeilen und 30 Spalten), pptx (Folien und Notizen), pdf; Kürzen über 200 KB.
  - Verläufe:
    - Sortierung, Betreff ohne `AW:`/`WG:`/`Re:`/`Fwd:` (mehrfach, groß/klein)
    - Beteiligte, doppelte Message-ID, ohne Datum
    - Anhänge übernommen bzw. nur genannt
    - kodierte Betreffs
  - Hinweise auf echte Daten über `fictionProblems`.
  - Zip-Bombe und kaputte Dateien → 422.
- **`tests/unit/fundus-katalog.test.ts`**
  - Zusammenführen: ausgeblendet und inaktiv fehlen.
  - Ebene `eigen` nur mit Einträgen; ETag ändert sich mit der Revision.
  - `filterPrompts` (Kategorie oder, Suche mit `fold`).
  - `filterDocuments` mit `pdf` und `eigen`.
- **`tests/unit/library.test.ts`** (Ergänzung)
  - `prepareMessages`: eigener Anhang mit geleertem Datei-Cache bekommt den Text aus der DB; gelöscht → „… ist nicht
    mehr verfügbar“.
  - Eigenes PDF nativ über `fundus/`.
  - Der mitgelieferte Fundus ist unverändert: feste Prüfsummen, Mindestzahlen.
- **`tests/unit/storage.test.ts`** (Ergänzung)
  - `fundus/` gültig; Frist 31.12.9999 wird von `deleteExpiredFiles` nie erfasst.
  - Vorgemerkte Uploads laufen nach 1 Tag ab.
- **Admin-Schemas:** deutsche Meldungen je Feld über `germanZodMessage` (wie bei den Vorlagen).

**Grenzfälle im Überblick** (Kategorien wie im Grenzfälle-Plan; jede Zeile hat einen Test)

| Kategorie | Fälle | Test |
|---|---|---|
| Einfügen aus Word und Co. | Werte mit Zeilen, Tabulator, NBSP, Nullbreite, Steuerzeichen | PR06, Unit |
| Sonderzeichen in Werten | `{{…}}`, `$&`, `$1`, `\`, Emoji, RTL | PR06, Unit |
| Doppelklick / doppeltes Enter | Einfügen, Speichern im Admin, Hochladen | PR11, FP04 |
| Entwurfsschutz | Entwurf, Bearbeiten einer früheren Nachricht, Abbrechen | PR07, PR08 |
| Reihenfolge und Gleichzeitigkeit | Admin ändert während Gäste wählen; gelöscht während angehängt | Y24, Y25, W09 |
| Doppelte Dateien | gleiche Datei, gleiche Mail | FP04, FP07 |
| Dateien aus dem echten Leben | falsche Endung, umbenannt, leer, riesig, kaputt, Zip-Bombe, nur Bilder, `.msg`, Umlaute im Namen | FP03, FP07 |
| Netz und Abbruch | Upload abgebrochen, Katalogfehler, Datei-Cache abgelaufen | FP04, Y11, Y26 |
| Leere Felder | nur Leerzeichen, gelöschter Standardwert, Doppelklick auf „Einfügen“ mit leeren Feldern | PR05, PR11, Unit |
| Grenzen | Platzhalter, Längen, Anzahl, Eingabefeld privat und Gruppenchat | PR05, FP13, FP18, PR10 |
| Geräte | iPad-Enter im mehrzeiligen Feld, Handy-Tastatur | PR11, PR12 |
| Zufall | Zufallsfolgen mit Prompts und eigenen Dateien | W07, Unit |

**Absicherung**

- **Abdeckungsmatrix:** `coverage.json` bekommt alle neuen Routen (einzeln je Methode).
  - Neue Bedienelemente:
    - Admin-Reiter, Unterreiter, „Dateien hochladen“, Prüfschritt, Bestätigung
    - „Verlauf hochladen“, Prompt-Dialog, Platzhalter-Tabelle, Probe-Maske
    - Kategorien „nach oben/unten“, „Ausblenden“, „Alle einblenden“
    - Reiter „Prompts“, Kategorie-Chips, „Ausfüllen und einfügen“
    - Maske mit „Ersetzen/Anfügen“
  - Keine neue Einstellung, also kein neuer Q-Eintrag (Entscheidung 11).
- **`robustheit.spec.ts`:** `ADMIN_ROUTES`, U02- und U03-Listen nachziehen.
- **Fertig heißt:**
  - komplette Suite lokal dreimal hintereinander grün, ohne Wiederholungen (heute 372 E2E-Tests, danach rund 420;
    Unit von 178 auf rund 240)
  - CI grün in Chromium, WebKit und Firefox
  - Abdeckungsprüfung grün, keine Katalog-ID ohne Test
  - Zufallstest nachts grün mit den neuen Aktionen
  - Live-Smoke inkl. X11 nach dem Merge grün
  - Doku nachgezogen (Abschnitt 12), beide Handbuch-PDFs neu erzeugt

## 12. Dokumentation

| Datei | Änderung |
|---|---|
| `README.md` | Funktionsliste (Fundus pflegbar, Prompts mit Platzhaltern); Architektur (`app/api/admin/fundus`, `lib/fundus`, `lib/shared/placeholders.ts`); Caching (eigene Dateien im Datei- und Antwort-Cache, Prompts als normaler Text); Sicherheit und Datenschutz (eigene Inhalte dauerhaft, Bestätigung „keine echten Daten“, getrennte Pfade) |
| `TESTPLAN.md` | Bereiche FP und PR, Y22–Y26, V09, W09, X11, angepasste IDs; Zahlen in Abschnitt 2 und 8, gefundene Fehler in Abschnitt 6 |
| `FUNDUS-PLAN.md` | Abschnitt 7 („Kursleitung lädt eigene Dateien hoch“, PDFs) verweist auf diesen Plan; Abschnitt 4.2 korrigieren (`getFile` liest keine `library/`-Pfade) |
| `FUNDUS-PFLEGE-PLAN.md` | dieser Plan, nach der Umsetzung mit Stand je Phase und Abweichungen |
| `tests/e2e/coverage.json` | neue Routen und Bedienelemente |
| **Handbuch Kursleitung** (`docs/handbuch/handbuch.html`) | 1.3 Schulungstag: Schritt „Fundus vorbereiten“; 2.4 Fragen stellen: Unterschied Vorlage ↔ Prompt (Verweis 2.9); **2.9 Fundus**: „Drei Reiter“, neues h3 „Prompts mit Platzhaltern“ (Reiter, Maske, alle Felder Pflicht, Ersetzen/Anfügen, Tipp: Übungsdatei aus dem Fundus selbst anhängen), h3 „Eigene Inhalte der Kursleitung“ (Verweis 3.7); **neues Kapitel 3.7 „Fundus pflegen“** (Sicherheit wird 3.8; es gibt keine Querverweise auf 3.7) mit h3 Aufbau, Dokumente hochladen (Schritte, Formate, Grenzen, Prüfschritt, Kasten „Echte Daten“), E-Mail-Verläufe hochladen (Outlook „Speichern unter“ → `.eml`, Reihenfolge, Anhänge), Prompts anlegen (Tabelle Platzhalter-Schreibweise, Arten, Standardwert, „jeder Platzhalter muss ausgefüllt werden“, Beispiel), Kategorien, Mitgelieferte ausblenden, Kasten „Gute Prompts für Übungen“; 3.5 Einstellungen: Zeile „Fundus“ (gilt auch für Prompts, Pflege bleibt möglich); Teil 4: Löschregeln (eigene Inhalte bleiben bis zum Löschen, Aufräumjob lässt sie stehen), was an die Anbieter geht (eigene Dateien nur beim Anhängen), Checkliste (Prompts und Kategorien vor dem Kurs prüfen), häufige Fragen („Eigene Datei fehlt im Fundus“, „Platzhalter erscheint nicht als Feld“, „.msg statt .eml“) |
| **Handbuch Teilnehmende** (`docs/handbuch/teilnehmende.html`) | 2.4: Hinweis auf Prompts im Fundus; **2.9 Fundus**: „Drei Reiter“, h3 „Prompts: ausfüllen und einfügen“ in der Du-Form mit Maske (alle Felder ausfüllen), „Ersetzen/Anfügen“, Tipp „passende Datei aus dem Fundus dazu anhängen“, h4 Ideen zum Ausprobieren; 2.15 Gruppenchat: Prompt beginnt mit „@Freebie“; 3.4 häufige Fragen („Ich sehe keine Prompts“, „Was passiert mit meinen Eingaben in der Maske?“) |
| `docs/handbuch/screenshots.mjs`, `beispieldaten.mjs` | Beispieldaten über die Admin-API: ein hochgeladenes Dokument (erzeugte docx) und ein Verlauf aus drei `.eml`, Startbestand der Prompts; neue Bilder: `c36-fundus-prompts`, `c37-prompt-maske`, `c38-prompt-eingefuegt`, `a16-fundus-dokumente`, `a17-fundus-pruefen`, `a18-fundus-verlauf`, `a19-prompt-dialog`, `a20-kategorien`; `c27-fundus` zeigt drei Reiter; danach `npm run docs:handbuch` und beide PDFs einchecken |
| `docs/handbuch/README.md` | neue Bilder in der Liste |

## 13. Umsetzung in Phasen und Aufwand

| Phase | Inhalt | Tests |
|---|---|---|
| 0 · Abnahme | Entscheidungen getroffen (Abschnitt 16); offen: klickbarer Entwurf von Admin-Reiter, Reiter „Prompts“ und Maske | – |
| 1 · Grundlage | Platzhalter-Logik, Tabellen, Startbestand, Store mit Grenzen und Revision, Ablage `fundus/` mit Frist, Prüfen und Vorschau, Admin-API, Katalog zusammenführen, `libraryText`, Pfad-Trennung, Tracing-Fix | Unit-Tests; FP16, FP17, Y21, U01–U03 |
| 2 · Admin | Reiter „Fundus“ mit Unterreitern, Upload- und Prüfdialog, Verläufe, Prompt-Dialog mit Platzhalter-Tabelle und Probe-Maske, Kategorien, Ausblenden | FP01–FP15, FP18, FP19, O01 |
| 3 · Chat | Reiter „Prompts“, Filter, Vorschau, Maske, Ersetzen/Anfügen, Gruppenchat, eigene Dateien und Verläufe im Chat, PDF-Typ, Revalidierung | PR01–PR13, Y22–Y26, Q21, V09 |
| 4 · Abschluss | Doku inkl. beider Handbücher, Belastung, Zufallstest, Live-Smoke, Stabilitätslauf (3 ×), CI in drei Browsern | W07, W09, X08, X11 |

**Wie schnell?**

- **Vorher (du):** Die Entscheidungen sind getroffen. Offen ist nur noch die Abnahme des klickbaren Entwurfs.
- **Umsetzung (ich):** mehr als bei den Gruppenchats, weil drei Dinge zusammenkommen. Ich rechne mit **rund
  anderthalb bis zwei Arbeitstagen**, inklusive dreifachem Stabilitätslauf und neu erzeugten Handbüchern.
  - Upload-Weg mit Prüfschritt und Vorschauen aus echten Dateien
  - Admin-Oberfläche mit vier Unterreitern
  - Maske mit vielen Grenzfällen
- **Danach:** Merge, CI in drei Browsern, Live-Smoke mit X11.
- **Gesamt:** realistisch **2–3 Tage nach der Abnahme** einsatzbereit.

**Risiken und wie der Plan sie abfängt**

| Risiko | Abfangen |
|---|---|
| Aufräumjob löscht eigene Dateien oder Texte | Frist 31.12.9999, Text in der Tabelle, `libraryText` aus der DB (FP17, Y26) |
| Gäste umgehen den Schalter über `/api/files` | ausdrückliche Präfix-Prüfung, nur `/api/library/[id]/file` liefert Fundus-Dateien (FP17, Y21) |
| Veralteter Katalog im Browser | Revalidierung mit ETag bei jedem Öffnen (Y25, W09) |
| Admin-Tests geben Zustand weiter, parallele Tests wackeln | `restore()` kennt den Fundus; ändernde Tests nur im seriellen `admin`-Projekt |
| Ersetzungsmuster in Werten (`$&`) verfälschen den Text | Ausfüllen ohne `String.replace`-Muster (PR06, Unit-Zufallstest) |
| Echte Daten landen dauerhaft im Fundus | Warnung, Pflicht-Bestätigung, Hinweis im Handbuch (FP05) |
| Große Uploads auf Vercel | Direkt-Upload in Blob wie im Chat, nie durch die Funktion |
| Bestehende Tests | mitgelieferter Fundus unverändert (feste Prüfsummen); betroffene IDs oben einzeln aufgeführt und angepasst, nicht gelockert |

## 14. Nebenbei gefunden

- **Tracing-Lücke:** `/api/groupchats/[id]/freebie` fehlt in `outputFileTracingIncludes` (`next.config.ts`). Läuft im
  Gruppenchat der Datei-Cache für einen mitgelieferten Fundus-Anhang ab, findet `libraryText` auf Vercel die Datei
  nicht und meldet „nicht mehr verfügbar“. Weil Gruppenchats höchstens einen Termin lang leben, ist das heute kaum zu
  treffen. Behoben in Phase 1 (eine Zeile), abgesichert durch Y26.
- **FUNDUS-PLAN 4.2** sagt, `getFile()` liefere `library/`-Pfade aus dem Bundle. Tatsächlich lehnt `assertSafeKey` sie
  ab. Für eigene PDFs nutzt der neue Weg `fundus/`; die Doku wird korrigiert.
- **`libraryText`** vergleicht die Prüfsumme des Anhangs nicht mit der aktuellen Datei. Für den mitgelieferten Fundus
  ist das unkritisch (feste Bytes). Eigene Dateien sind unveränderlich, der neue Weg ist also nicht betroffen.

## 15. Bewusst nicht enthalten (später möglich)

- **Mitgelieferte Einträge bearbeiten:** nur Ausblenden (Entscheidung 4). Die Inhalte entstehen aus dem Code.
- **Übungsdateien am Prompt** (Entscheidung 8): Das Übungsmaterial liegt im Fundus, die Person hängt es selbst an.
- **Eigene Prompts der Teilnehmenden**, Favoriten und Teilen in der Gruppe (Entwurf 3 der Ideensammlung).
- **Prompts auf der Startseite** („Übung des Tages“, Entwurf 4) und **`/` im Eingabefeld** (Entwurf 2). Beides baut auf
  diesem Plan auf und ist danach klein.
- **Fundus je Termin oder Gruppe** (Teilmengen), schon im Fundus-Plan zurückgestellt.
- **Export/Import des Fundus** (Sicherung, Umzug zwischen Umgebungen), Prompts per CSV.
- **Bilder, Scans mit Texterkennung, `.msg`, `.doc`/`.xls`/`.ppt`**; Datei ersetzen (Entscheidung 5).
- **Versionen und Statistik** von Prompts (wer hat was wie oft genutzt).

## 16. Entscheidungen

Getroffen am 14. Oktober 2026:

| # | Frage | Entscheidung |
|---|---|---|
| 1 | Wie heißt der neue Bereich? | **„Prompts“**: Reiter „Prompts“, Einzahl „Prompt“, Felder „Platzhalter“, Dialog „Prompt ausfüllen“. Nie „Vorlage“, das sind die Rollen |
| 2 | Zu welcher Verwaltung gehören eigene Dateien? | **Immer „Eigene Inhalte“.** Keine Zuordnung zu den neun erfundenen Verwaltungen, keine Einheiten, keine eigenen Verwaltungen |
| 3 | Welche Formate? | Word (`.docx`), Excel (`.xlsx`), PowerPoint (`.pptx`), **PDF** neu; Verläufe aus `.eml`. Alte Formate werden mit Tipp abgelehnt |
| 4 | Mitgelieferte Einträge (die 150 Dokumente und 40 Verläufe aus dem Code) | **Nicht änderbar, nur einzeln ausblenden.** „Einblenden“ und „Alle einblenden“ holen sie zurück; schon angehängte bleiben in bestehenden Chats nutzbar. Kein „Alle ausblenden“, kein Überschreiben von Titel oder Beschreibung |
| 5 | Datei ersetzen? | **Nein.** Nur hochladen und löschen; die Angaben (Titel, Datum, Merkmale …) bleiben bearbeitbar |
| 6 | Text steht schon im Eingabefeld | Die **Maske** fragt: „Ersetzen“ oder „Anfügen“ |
| 7 | Prompt ohne Platzhalter | Erlaubt, wird **direkt eingefügt**; der Admin-Dialog zeigt einen Hinweis |
| 8 | Übungsdatei am Prompt | **Nein.** Das Übungsmaterial liegt schon im Fundus; Prompts verweisen auf keine Dateien |
| 9 | Echte Daten | **Warnung** bei Fundstellen und **immer** eine Bestätigung beim Speichern |
| 10 | Startbestand | **12 Prompts in 6 Kategorien**, einmalig angelegt, frei bearbeitbar |
| 11 | Eigener Schalter für Prompts? | **Nein**, der Schalter „Fundus“ gilt für alles |
| 12 | Gruppenchat | Eingefügter Prompt beginnt mit **„@Freebie “** |
| 13 | Platzhalter Pflicht oder optional? | **Jeder Platzhalter muss ausgefüllt werden**, ohne Ausnahme und ohne Einstellung dafür |
