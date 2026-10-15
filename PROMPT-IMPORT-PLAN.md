# Plan: Prompt-Bibliotheken importieren

Stand: 15. Oktober 2026, **umgesetzt** (Stand und Abweichungen in Abschnitt 11) · Entscheidungen in Abschnitt 12 ·
Grundlage: Code vom 15. Oktober 2026
nach PR #8 (Prompts in `lib/fundus/store.ts`, `lib/fundus/api.ts`, `app/api/admin/fundus/prompts`; Platzhalter in
`lib/shared/placeholders.ts`; Admin-Oberfläche in `components/admin/fundus`), Vorgänger:
[FUNDUS-PFLEGE-PLAN.md](FUNDUS-PFLEGE-PLAN.md) (dort in Abschnitt 15 als „später möglich“ geführt), E2E-Suite aus
[TESTPLAN.md](TESTPLAN.md), Handbuch unter [docs/handbuch](docs/handbuch/README.md)

## 1. Ziel

Die Kursleitung hat Prompt-Sammlungen aus anderen Quellen (Word-Listen, Notizen, andere Werkzeuge). Sie soll sie in
Freebie übernehmen können, ohne jeden Prompt einzeln anzulegen:

1. Im Admin-Bereich unter **Fundus › Prompts** eine **Musterdatei** (JSON) herunterladen. Die Datei erklärt sich selbst
   und enthält Beispiele für alles, was ein Prompt in Freebie haben kann.
2. Die eigene Sammlung in dieses Format bringen, von Hand oder mit Hilfe von Freebie (siehe Abschnitt 9, Handbuch-Tipp).
3. Die Datei unter **Fundus › Prompts › Importieren** hochladen, eine **Kategorie wählen** (oder neu anlegen), das
   Ergebnis der Prüfung ansehen und importieren.

Danach sind die Prompts ganz normale Prompts: bearbeitbar, sortierbar, schaltbar, im Chat mit Maske.

## 2. Ablauf

**Muster herunterladen**

- Knopf **„Muster herunterladen“** neben „Neuer Prompt“ → Datei `freebie-prompts-muster.json`.
- Das Muster entsteht im Browser aus einer festen Vorlage im Code (keine neue Route). Ein Unit-Test stellt sicher, dass
  genau dieses Muster fehlerfrei importiert werden kann.

**Importieren**

1. Knopf **„Importieren“** → Dialog **„Prompts importieren“**.
2. **Datei wählen** (Auswahl oder Ablegen, eine `.json`-Datei, höchstens 4 MB).
3. **Prüfschritt** (sofort nach der Auswahl, ohne etwas zu speichern):
   - Zusammenfassung, z. B. „24 Prompts in der Datei: 21 werden importiert, 2 gibt es schon, 1 hat Fehler.“
   - Liste aller Einträge mit Titel, Zahl der Platzhalter und Zustand: **bereit**, **gibt es schon** (wird
     übersprungen), **Fehler** (mit Grund, wird übersprungen), **Hinweis** (wird importiert).
   - Aufklappbare Vorschau je Eintrag mit hervorgehobenen Platzhaltern (wie im Chat, `PromptText`).
4. **Kategorie**: Auswahl aller vorhandenen Kategorien oder **„Neue Kategorie …“** mit Namensfeld. Vorschlag für den
   Namen: das Feld `name` aus der Datei, sonst der Dateiname ohne Endung.
5. Optionen (je nach Entscheidung, Abschnitt 12): **„Alle zunächst inaktiv importieren“**, **Schreibweise der
   Platzhalter** in der Datei, Bestätigung **„keine echten personenbezogenen Daten“**.
6. **„Importieren (21 Prompts)“** → der Server prüft alles noch einmal und legt die Prompts in **einem Schritt** an.
   Meldung „21 Prompts in „Bibliothek Müller“ importiert, 3 übersprungen.“ Die Kategorie ist in der Liste sichtbar.

Teilnehmende sehen aktive importierte Prompts beim nächsten Öffnen des Fundus (Revision/ETag wie bisher).

## 3. So sieht es aus

**Reiter Fundus › Prompts, Kopfzeile**

```
24 Prompts, davon 20 aktiv. …        [ Muster herunterladen ] [ Importieren ] [ + Neuer Prompt ]
```

Auf dem Handy brechen die Knöpfe um (wie heute „Neuer Prompt“).

**Dialog „Prompts importieren“**

```
┌ Prompts importieren ─────────────────────────────────────────────── ✕ ┐
│ Datei: bibliothek-mueller.json (38 KB)               [ Andere Datei ] │
│ 24 Prompts in der Datei: 21 werden importiert, 2 gibt es schon,       │
│ 1 hat Fehler.                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐ │
│ │ ✓ Bürgeranfrage beantworten · 3 Platzhalter              bereit  │ │
│ │ ! Pressemitteilung · 2 Platzhalter   Hinweis: Telefonnummer …     │ │
│ │ = Absage höflich formulieren         gibt es schon – übersprungen │ │
│ │ ✕ Protokoll kürzen   Fehler: Text höchstens 8.000 Zeichen         │ │
│ │ …                                                                 │ │
│ └──────────────────────────────────────────────────────────────────┘ │
│ Kategorie  [ Neue Kategorie …            ▾ ]  Name [ Bibliothek Müller ] │
│ [ ] Alle zunächst inaktiv importieren                                  │
│ [ ] Die Prompts enthalten keine echten personenbezogenen Daten.        │
│                                   [ Abbrechen ] [ Importieren (21 Prompts) ] │
└────────────────────────────────────────────────────────────────────────┘
```

- Fehler in der Datei selbst (kein JSON, falsches Format …) stehen als Meldung oben, die Liste bleibt leer, der Knopf
  „Importieren“ ist gesperrt.
- Gibt es nichts zu importieren, heißt der Knopf „Importieren“ und ist gesperrt; die Meldung sagt, warum.

## 4. Dateiformat (Musterdatei)

Ein JSON-Objekt mit Kennung, Version und der Liste der Prompts. Feldnamen auf Deutsch (Entscheidung 1), damit die Datei
ohne Handbuch verständlich ist. So sieht das Muster aus:

```json
{
  "format": "freebie-prompts",
  "version": 1,
  "name": "Meine Prompt-Bibliothek",
  "anleitung": [
    "Jeder Eintrag in „prompts“ wird ein Prompt. Pflicht sind „titel“ und „text“.",
    "Platzhalter stehen im Text in doppelten geschweiften Klammern: {{Name}}. Teilnehmende füllen sie vor dem Einfügen aus.",
    "Unter „platzhalter“ kannst du jeden Platzhalter genauer beschreiben (alles freiwillig): beschriftung, hinweis, art (einzeilig, mehrzeilig, auswahl), werte (bei auswahl) und standard.",
    "Die Kategorie wählst du beim Import. „aktiv“ ist freiwillig (Standard: true).",
    "Grenzen: Titel 80 Zeichen, Beschreibung 200, Text 8.000, höchstens 20 Platzhalter je Prompt."
  ],
  "prompts": [
    {
      "titel": "Absage höflich formulieren",
      "beschreibung": "Klar in der Sache, freundlich im Ton.",
      "text": "Formuliere eine höfliche, klare Absage an {{Empfänger}} zum Anliegen „{{Anliegen}}“. Begründe kurz und biete wenn möglich eine Alternative an.",
      "platzhalter": {
        "Empfänger": { "hinweis": "z. B. Frau Lind" },
        "Anliegen": { "hinweis": "z. B. Fristverlängerung" }
      }
    },
    {
      "titel": "E-Mail-Verlauf zusammenfassen",
      "beschreibung": "Wer will was von wem? Welche Fristen laufen?",
      "text": "Fasse den angehängten E-Mail-Verlauf für {{Zielgruppe}} in {{Anzahl}} Punkten zusammen.\nAchte besonders auf: {{Schwerpunkt}}",
      "platzhalter": {
        "Zielgruppe": { "hinweis": "z. B. die Amtsleitung" },
        "Anzahl": { "beschriftung": "Anzahl Punkte", "art": "auswahl", "werte": ["3", "5", "7"], "standard": "5" },
        "Schwerpunkt": { "beschriftung": "Was ist dir wichtig?", "art": "mehrzeilig" }
      },
      "aktiv": true
    },
    {
      "titel": "Text in einfache Sprache übertragen",
      "text": "Schreibe den folgenden Text in einfacher Sprache: kurze Sätze, keine Fachwörter, ein Gedanke pro Satz."
    }
  ]
}
```

**Felder je Prompt**

| Feld | Pflicht | Bedeutung und Grenzen (wie beim Anlegen im Admin) |
|---|---|---|
| `titel` | ja | höchstens 80 Zeichen, Leerraum wird zusammengefasst |
| `beschreibung` | nein | höchstens 200 Zeichen |
| `text` | ja | höchstens 8.000 Zeichen; Platzhalter `{{Name}}` (Buchstaben, Ziffern, Leerzeichen, `-`, `_`; höchstens 40 Zeichen); höchstens 20 verschiedene |
| `platzhalter` | nein | Objekt; Schlüssel = Platzhalter **wie im Text geschrieben** (Vergleich ohne Groß/klein, ä = ae, ß = ss) |
| `platzhalter.*.beschriftung` | nein | höchstens 60 Zeichen (Standard: der Name) |
| `platzhalter.*.hinweis` | nein | höchstens 120 Zeichen |
| `platzhalter.*.art` | nein | `einzeilig` (Standard), `mehrzeilig`, `auswahl` |
| `platzhalter.*.werte` | bei `auswahl` | 2–20 Werte, je höchstens 100 Zeichen, keine doppelten |
| `platzhalter.*.standard` | nein | höchstens 300 Zeichen; bei `auswahl` einer der Werte |
| `aktiv` | nein | `true` (Standard) oder `false` |

**Großzügig beim Lesen, streng beim Speichern**

- Erlaubt ist auch **nur die Liste** (`[ {…}, {…} ]`) ohne Kennung und Version.
- **Unbekannte Felder** (z. B. `tags`, `autor`) werden ignoriert; der Prüfschritt nennt sie einmal als Hinweis.
- Ein Feld **`kategorie`** im Eintrag wird ignoriert (die Kategorie wählt man beim Import) – mit Hinweis.
- **Einstellungen für Platzhalter, die im Text nicht vorkommen**, werden ignoriert – mit Hinweis am Eintrag.
- **Platzhalter ohne Einstellungen** sind in Ordnung (einzeilig, Beschriftung = Name).
- **Zeilenenden** `\r\n` werden zu `\n`, ein **BOM** am Dateianfang wird entfernt.
- Englische Feldnamen (`title`, `description`, `placeholders` …) und die internen Typen (`text`, `area`, `select`)
  werden **zusätzlich** verstanden – so passt auch ein späterer Export (Abschnitt 12, Entscheidung 8) ohne Umweg.

## 5. Prüfen und Importieren

Eine gemeinsame Funktion `readPromptLibrary(json, optionen)` in **`lib/shared/prompt-import.ts`** (Browser und Server)
liest die Datei, wandelt sie in die internen Felder um und prüft jeden Eintrag mit den vorhandenen Regeln
(`validatePrompt`, Grenzen aus `FUNDUS_LIMITS`). Ergebnis: Einträge mit Zustand, Fehlern und Hinweisen; nie eine
Ausnahme, egal was in der Datei steht.

**Prüfungen der Datei** (Meldung oben, nichts importierbar)

| Fall | Meldung |
|---|---|
| leer / nur Leerraum | „Die Datei ist leer.“ |
| größer als 4 MB | „Die Datei ist zu groß (höchstens 4 MB).“ |
| kein gültiges UTF-8 (z. B. aus Excel als ANSI gespeichert) | „Die Datei ist nicht als UTF-8 gespeichert. Bitte als UTF-8 speichern und erneut wählen.“ |
| kein JSON | „Die Datei ist kein gültiges JSON.“ + Stelle, soweit der Browser sie nennt |
| anderes `format` | „Das ist keine Prompt-Bibliothek für Freebie – bitte das Muster verwenden.“ |
| `version` größer als 1 | „Die Datei stammt aus einer neueren Freebie-Version.“ |
| keine Liste `prompts` / leere Liste | „In der Datei stehen keine Prompts.“ |
| mehr als 500 Einträge | „Höchstens 500 Prompts je Datei.“ |

**Prüfungen je Eintrag**

- **Fehler** (Eintrag wird übersprungen): kein Objekt, Titel oder Text fehlt/leer, Grenzen überschritten, mehr als 20
  Platzhalter, Auswahl mit weniger als 2 oder mehr als 20 Werten, doppelte Werte, Standard nicht unter den Werten,
  unbekannte `art`, falscher Typ (z. B. `"werte": "3, 5"`).
- **Gibt es schon** (übersprungen): gleicher Titel (ohne Groß/klein, ä = ae) schon in der **Zielkategorie** oder
  **früher in derselben Datei**. Hängt von der Kategorie ab und wird beim Wechsel neu bewertet (Entscheidung 4).
- **Hinweise** (Eintrag wird importiert): unbekannte Felder, `kategorie` ignoriert, Einstellungen ohne Platzhalter,
  Stellen, die wie Platzhalter aussehen und keine sind (vorhandene Warnungen von `parsePrompt`), **echte Daten**
  (`realDataHints`: echte Mail-Domains, gültige IBANs, Telefonnummern), **Text ohne Platzhalter, aber mit `[…]`**
  („Sollen das Platzhalter sein? Wähle oben die Schreibweise.“, Entscheidung 6), **reservierte Platzhalternamen**
  (bleiben Text, Abschnitt 10).

**Ablauf technisch**

1. **Browser**: liest die Datei (`TextDecoder` mit `fatal: true`), `JSON.parse`, `readPromptLibrary` → Prüfschritt
   sofort, ohne Server. Dubletten-Abgleich mit der schon geladenen Admin-Übersicht.
2. **Server** (`POST /api/admin/fundus/prompts/import`): bekommt die **umgewandelten** Einträge (nicht die Rohdatei),
   prüft sie mit derselben Funktion erneut (dem Browser wird nichts geglaubt), gleicht Dubletten mit der Datenbank ab,
   prüft die Gesamtgrenze und legt alles in **einer Transaktion** an: ggf. neue Kategorie, dann die Prompts in
   Dateireihenfolge **am Ende** der Kategorie, **eine** Revision. Antwort: Zahl angelegt, Liste übersprungen mit Grund.
3. **Grenze 500 Prompts insgesamt**: passt nicht alles, wird **nichts** importiert: „Platz für noch 37 Prompts – die
   Datei enthält 120 importierbare. Bitte aufteilen oder Prompts löschen.“
4. **Neue Kategorie** wird nur angelegt, wenn mindestens ein Prompt importiert wird (sonst bleibt nichts Leeres
   zurück); Name geprüft wie beim Anlegen (40 Zeichen, keine Dublette, höchstens 50 Kategorien).
5. **Doppelklick / zweimal senden**: Knopf sperrt sofort; der Server würde die zweite Anfrage als Dubletten erkennen
   und nichts doppelt anlegen.
6. **Kategorie verschwindet** zwischen Prüfen und Importieren (anderer Admin): 409 „Die Kategorie gibt es nicht mehr –
   bitte neu wählen.“, nichts angelegt.

## 6. API und Code

| Was | Wo |
|---|---|
| Format, Muster, Umwandlung, Prüfung | **neu** `lib/shared/prompt-import.ts` (`PROMPT_MUSTER`, `readPromptLibrary`, Schreibweisen umwandeln) |
| Import in einer Transaktion | `lib/fundus/store.ts`: `importPrompts(einträge, ziel, optionen)`; `checkPrompt` wird zu einer reinen Funktion ohne Datenbankzugriff je Eintrag |
| Route | **neu** `app/api/admin/fundus/prompts/import/route.ts` (`POST`, nur Admin, zod-Schema, 4 MB) |
| Oberfläche | `PromptsPanel.tsx` (Knöpfe), **neu** `components/admin/fundus/ImportDialog.tsx`; `PromptText` aus der Maske für die Vorschau; Download über `downloadText` aus `lib/client/export.ts` |
| Platzhalter absichern | `lib/shared/placeholders.ts`, `components/chat/library/PromptFill.tsx` (Abschnitt 10) |

Anfrage an die Route:

```json
{ "prompts": [ { "title": "…", "description": "…", "text": "…", "placeholders": { … }, "enabled": true } ],
  "categoryId": "kat-…" | null, "newCategory": "Bibliothek Müller" | null, "inactive": false }
```

Antwort: `{ "ok": true, "categoryId": "…", "created": 21, "skipped": [ { "title": "…", "reason": "gibt es schon" } ] }`.

**4 MB** liegt bewusst unter der Grenze von Vercel-Funktionen (4,5 MB je Anfrage); eine realistische Sammlung mit
100 Prompts hat etwa 100 KB.

## 7. Sicherheit

- Route nur für die Kursleitung (`requireAdmin`): ohne Anmeldung 401, Gäste 403, wie alle Admin-Routen.
- Größe wird vor dem Lesen (Content-Length) und beim Lesen geprüft → 413.
- Strenges zod-Schema für die umgewandelten Einträge; Rohdaten aus der Datei erreichen nie die Datenbank.
- Texte werden nur als Text angezeigt (React), HTML oder Skripte in der Datei bleiben wirkungslos – eigener Testfall.
- Platzhalternamen wie `__proto__` und `constructor` können keine Objekte verbiegen und keine Maske abstürzen lassen
  (Abschnitt 10).
- Importierte Prompts sind **kein** neuer Weg für Teilnehmende: sie sehen sie nur wie alle Prompts über den Katalog.

## 8. Tests – die Suite bleibt vollständig

**Unit** (`tests/unit/prompt-import.test.ts`, neu; `placeholders.test.ts` erweitert)

- Das **Muster** liest sich ohne Fehler und Hinweise, ergibt 3 Prompts mit allen Platzhalter-Arten; die Anleitung nennt
  dieselben Grenzen wie `PROMPT_LIMITS`/`FUNDUS_LIMITS` (Test vergleicht die Zahlen).
- Umschlag mit Kennung und **nur die Liste**; falsches `format`, `version: 2`, keine/leere Liste, 501 Einträge.
- Deutsche und englische Feldnamen, `art` deutsch und intern; unbekannte Felder und `kategorie` als Hinweis.
- Platzhalter-Schlüssel wie geschrieben, mit anderer Groß/klein-Schreibung, `ae` statt `ä`; Einstellungen ohne
  Platzhalter; alle Fehlerfälle der Auswahl; Grenzen genau an und eins über der Grenze.
- Dubletten in der Datei und gegen eine gegebene Liste; Wechsel der Zielkategorie ändert die Bewertung.
- BOM, `\r\n`, NBSP, Emoji, RTL, Steuerzeichen im Titel; HTML im Text bleibt Text.
- **Reservierte Namen**: `{{__proto__}}`, `{{constructor}}`, `{{Constructor}}` → Fehler; Werte-Objekte ohne Prototyp.
- Schreibweisen umwandeln (falls entschieden): `[Name]`, `{Name}`, `<Name>` → `{{Name}}`; **nicht** umgewandelt werden
  `[1]`, Markdown-Links `[Text](https://…)`, `<br>`, JSON-Beispiele `{"a": 1}`, schon vorhandene `{{Name}}`.
- **Zufallstest**: beliebige JSON-Werte und zufällig verstümmelte Musterdateien werfen nie, liefern immer ein Ergebnis.
- Store: `importPrompts` legt alles oder nichts an (Datenbankfehler mitten drin → nichts angelegt), Gesamtgrenze,
  neue Kategorie nur mit Prompts, Reihenfolge am Ende, genau eine Revision.

**E2E** (Projekt `admin`, serieller Server; `restore()` räumt neue Prompts und Kategorien schon heute auf)

| ID | Inhalt |
|---|---|
| FP20 | **Muster herunterladen**: Dateiname, gültiges JSON, Anleitung und 3 Beispiele; genau diese Datei wieder importieren → 3 Prompts, im Chat (Gast-Browser) mit Maske ausfüllbar |
| FP21 | **Import in vorhandene Kategorie**: Prüfschritt, Zusammenfassung, Zahl im Knopf; nach dem Import am Ende der Kategorie in Dateireihenfolge, aktiv; Meldung; Teilnehmende sehen sie ohne Neuladen beim nächsten Öffnen |
| FP22 | **Neue Kategorie beim Import**: Name aus `name` bzw. Dateiname vorgeschlagen; doppelter Name → Meldung; Abbrechen und ein Import ohne importierbare Einträge legen keine Kategorie an |
| FP23 | **Prüfschritt**: Fehler, Hinweise (unbekannte Felder, `kategorie`, echte Daten, `[…]`), Dubletten in Kategorie und Datei; Wechsel der Kategorie bewertet neu; Vorschau mit hervorgehobenen Platzhaltern |
| FP24 | **Kaputte Dateien**: leer, kein JSON, falsches Format, neuere Version, leere Liste, Windows-1252, größer als 4 MB, 501 Einträge → je eine verständliche Meldung, nichts angelegt |
| FP25 | **Grenzen und Gleichzeitigkeit**: Platz für noch N Prompts → nichts angelegt; Doppelklick → einmal; zwei Admin-Sitzungen importieren gleichzeitig → Gesamtgrenze hält; Kategorie während des Prüfschritts gelöscht → 409 |
| FP26 | **Optionen** (je nach Entscheidung): „Alle zunächst inaktiv“ → Teilnehmende sehen nichts; Schreibweise `[Name]` → Platzhalter erkannt; Bestätigung „keine echten Daten“ nötig |
| FP27 | **API direkt**: ohne Anmeldung 401, Gast 403, kaputter Body 400, zu groß 413, manipulierte Einträge (zu lang, `__proto__`, fremde Felder) werden vom Server abgewiesen, obwohl der Browser sie nie schicken würde |
| FP28 | **Barrierefreiheit und Tastatur**: axe ohne „serious/critical“ für den Import-Dialog mit Prüfschritt, hell und dunkel; Datei per Tastatur wählen; Zustände nicht nur farbig; Fokus kehrt zum Knopf zurück |
| PR14 | **Chat**: Prompt mit Platzhalter `{{constructor}}` aus einem Alt-Bestand (direkt in der Datenbank angelegt) bricht die Maske nicht (Absicherung aus Abschnitt 10) |

Dazu:

- **Belastung** W09 erweitert: die Kursleitung importiert 200 Prompts, während 25 Gäste den Fundus öffnen und Prompts
  einfügen – keine Fehler, Katalog danach vollständig.
- **Testdateien** (`generate-files.ts`, VERSION 6): `prompts-gueltig.json`, `prompts-gemischt.json` (Fehler, Hinweise,
  Dubletten), `prompts-liste.json` (nur Liste, englische Felder), `prompts-eckig.json` (`[Name]`),
  `prompts-ansi.json` (Windows-1252), `prompts-kaputt.json`, `prompts-neu.json` (version 2), `prompts-gross.json`
  (> 4 MB), `prompts-501.json`.
- **`AdminApi`**: `importPrompts(einträge, ziel, optionen)`; Seitenobjekt `PromptImportDialog` in `support/fundus.ts`.
- **`coverage.json`**: neue Route, neue Bedienelemente („Muster herunterladen“, „Importieren“, Dialogfelder).
- **WebKit und Firefox**: FP-Tests laufen wie alle Admin-Tests in Chromium; PR14 legt einen Prompt an und läuft
  deshalb ebenfalls im Projekt `admin`.

## 9. Dokumentation

- **`README.md`**: Funktionsliste (Fundus › Prompts importieren, Muster).
- **`TESTPLAN.md`**: FP20–FP28, PR14, W09 erweitert, neue Phase, Zahlen im Ergebnis; Fehler aus Abschnitt 10 in der
  Liste „gefundene Fehler“.
- **`FUNDUS-PFLEGE-PLAN.md`**: Abschnitt 15 verweist auf diesen Plan (Import umgesetzt, Export je nach Entscheidung 8).
- **Handbuch Kursleitung**, Kapitel 3.7 „Fundus pflegen“, neuer Abschnitt **„Prompt-Bibliotheken importieren“**:
  Schritte, Feldtabelle aus Abschnitt 4, häufige Meldungen, Screenshot des Prüfschritts. **Tipp:** Die vorhandene
  Sammlung mit Freebie umwandeln lassen – Musterdatei und eigene Liste anhängen, „Bring meine Prompts in dieses
  Format“, Ergebnis als `.json` speichern und importieren.
- **Handbuch Teilnehmende**: keine Änderung (importierte Prompts verhalten sich wie alle anderen).
- `screenshots.mjs`/`beispieldaten.mjs` erweitert, beide PDFs neu erzeugt.

## 10. Nebenbei gefunden

**Platzhalter `{{constructor}}` oder `{{__proto__}}` lassen die Maske abstürzen** (Code seit PR #8 auf `main`).
Die Maske holt die Werte aus einem gewöhnlichen Objekt (`remembered.get(id) ?? {}`, dann `kept[p.key] ?? p.default`).
Für den Schlüssel `constructor` liefert das die eingebaute Funktion `Object`, für `__proto__` den Objekt-Prototyp –
`cleanValue` scheitert daran mit „value.replace is not a function“, der Chat zeigt einen Fehler statt der Maske.
Außerdem gehen beim Speichern die Einstellungen eines Platzhalters `__proto__` verloren (`clean[key] = …` setzt den
Prototyp statt eines Eintrags). Lokal nachgestellt mit `validatePrompt` und der Logik aus `initialValues`.

Heute kann das nur passieren, wenn die Kursleitung so einen Platzhalter selbst anlegt; mit importierten fremden
Sammlungen wird es wahrscheinlicher. **Behoben:** `__proto__`, `constructor` und `prototype` sind keine Platzhalter –
sie bleiben wie ungültige Namen mit Hinweis als Text stehen („dieser Name ist reserviert“). Weil das schon beim Zerlegen
des Texts greift, brechen auch Alt-Bestände in der Datenbank die Maske nicht mehr (PR14); Einstellungen werden nur aus
eigenen Feldern gelesen (`Object.hasOwn`). Fehler 81 im TESTPLAN.

## 11. Umsetzung in Phasen, Stand und Abweichungen

| Phase | Inhalt | Tests |
|---|---|---|
| 0 · Abnahme | Entscheidungen (Abschnitt 12); auf Wunsch klickbarer Entwurf des Import-Dialogs | – |
| 1 · Format und Prüfung | `lib/shared/prompt-import.ts` mit Muster, Umwandlung, Prüfung; reservierte Platzhalternamen und Absicherung der Maske | Unit-Tests, PR14 |
| 2 · Server | `importPrompts` in einer Transaktion, Route mit Grenzen | Unit (Store), FP27 |
| 3 · Oberfläche | Knöpfe, Muster-Download, Import-Dialog mit Prüfschritt, Kategorie-Auswahl, Optionen, Ergebnis | FP20–FP26, FP28 |
| 4 · Abschluss | Testdateien, Belastung, `coverage.json`, Doku, Handbuch mit Screenshot, PDFs, komplette Suite in drei Browsern | W09 |

Umfang: deutlich kleiner als „Fundus pflegen“ – keine neuen Tabellen, keine Dateiablage, ein neuer Dialog und eine
neue Route.

**Stand (15. Oktober 2026): alle Phasen umgesetzt.** Unit-Tests 275 (30 neu), E2E 429 in 36 Dateien (12 neu:
FP20–FP29 mit FP28 hell und dunkel, PR14); FP16 und W09 erweitert; Abdeckungsprüfung vollständig.

Abweichungen vom Entwurf:

- **Reservierte Platzhalternamen** sind kein Fehler, sondern bleiben mit Hinweis als Text stehen (wie ungültige Namen).
  So schützt dieselbe Regel auch Prompts, die schon in der Datenbank liegen.
- **Alles oder nichts ohne Transaktion:** Neon über HTTP kennt keine Transaktionen. Eine einzige SQL-Anweisung legt
  Kategorie und Prompts an; Importe laufen je Server-Instanz nacheinander (ein zweiter sieht die Prompts des ersten
  als Dubletten). Laufen mehrere Instanzen gleichzeitig und liegt der Bestand danach über 500, nimmt der Import sich
  selbst zurück.
- **Export ohne eigene Route:** Die Datei entsteht im Browser aus der Admin-Übersicht, die ohnehin alle Prompts kennt.
- **Testdateien** entstehen im Test selbst (`admin-prompt-import.spec.ts`) statt in `generate-files.ts`.
- **Nebenbei behoben (Fehler 82):** Auf `main` lief PR09 in WebKit ins Zeitlimit. Ursache war die Weichzeichnung
  hinter Dialogen (`backdrop-filter`), die ohne Grafikkarte bis zu einer Sekunde pro Bild kostet – auch auf Thin
  Clients und Remote-Desktops. Dialoge dunkeln den Hintergrund jetzt nur noch ab; die Prompt-Tests brauchen in WebKit
  13–30 statt 27–84 Sekunden.

## 12. Entscheidungen

Getroffen am 15. Oktober 2026: alle Empfehlungen übernommen.

| # | Frage | Entscheidung |
|---|---|---|
| 1 | Feldnamen im Muster deutsch (`titel`, `text`, `platzhalter` …) oder englisch? | **Deutsch** – die Datei soll ohne Handbuch verständlich sein; englische Namen werden zusätzlich gelesen |
| 2 | Neue Kategorie direkt im Import-Dialog anlegen? | **Ja**, Name aus der Datei oder dem Dateinamen vorgeschlagen |
| 3 | Einträge mit Fehlern: Rest trotzdem importieren oder alles abbrechen? | **Rest importieren** – der Prüfschritt zeigt vorher genau, was übersprungen wird |
| 4 | Gleicher Titel schon in der Zielkategorie: überspringen, trotzdem anlegen oder ersetzen? | **Überspringen** mit Hinweis; Ersetzen ist ein eigenes Thema (Abschnitt 13) |
| 5 | Sollen importierte Prompts sofort aktiv sein? | **Wie in der Datei** (Standard aktiv) und dazu der Schalter „Alle zunächst inaktiv importieren“ |
| 6 | Andere Platzhalter-Schreibweisen umwandeln (`[Name]`, `{Name}`, `<Name>`)? Viele Sammlungen nutzen `[THEMA]` | **Ja, als Auswahl im Dialog** (Standard `{{Name}}`); die Vorschau zeigt das Ergebnis vor dem Import |
| 7 | Echte Daten: nur Hinweis oder wie beim Datei-Upload immer die Bestätigung „keine echten personenbezogenen Daten“? | **Hinweis und Bestätigung** – die Inhalte kommen wie beim Upload von außen (wie Entscheidung 9 im Fundus-Plan) |
| 8 | Export im selben Format gleich mitbauen (je Kategorie und alles)? | **Ja** – klein, dient als Sicherung und zum Umzug zwischen Umgebungen und macht einen Rundlauf-Test möglich |
| 9 | Größte Datei | **4 MB** (unter der Vercel-Grenze; reicht für die 500 Prompts, die Freebie insgesamt erlaubt) |

## 13. Bewusst nicht enthalten (später möglich)

- **Andere Dateiformate** (CSV, Excel, Markdown, Word). Das Muster plus Umwandlung mit Freebie deckt das ab.
- **Kategorien aus der Datei** (mehrere Kategorien in einem Import). Gewünscht ist eine Kategorie je Import.
- **Bestehende Prompts beim Import aktualisieren oder ersetzen** (Abgleich über eine ID in der Datei).
- **Dokumente und E-Mail-Verläufe per JSON** importieren; Import für Teilnehmende.
- **Umwandlung per KI im Import-Dialog** (Freebie formt eine beliebige Liste direkt um).
