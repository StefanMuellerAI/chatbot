# Testplan Freebie – vollständige E2E-Abdeckung

Stand: 9. Oktober 2026, ergänzt am 13. Oktober 2026 um Gruppenchats · Grundlage: Inventur aller Bedienelemente, Einstellungen und API-Routen im aktuellen Code

## 1. Ziel und Maßstab

Jede Einstellung, jeder Button und jede Eingabe bekommt mindestens einen automatisierten Test. Der Test prüft die
**Wirkung** von außen (was ändert sich in der Oberfläche, in der API-Antwort, im gespeicherten Zustand), nicht nur, ob
ein Element da ist.

„Solide“ heißt konkret (Abnahmekriterien):

1. **Lückenlos:** Jedes Element aus der Inventur steht in einer Abdeckungsmatrix mit mindestens einer Test-ID. Ein
   CI-Check schlägt fehl, wenn ein Element keinen Test hat – neue Buttons kommen also nicht mehr ungetestet hinein.
2. **Stabil:** Die Suite läuft dreimal hintereinander grün (`--repeat-each=3`), ohne automatische Wiederholungen.
3. **Sauber:** Keine unbehandelten Browserfehler und keine unerwarteten 500er im Serverlog während der Suite.
4. **Barrierearm:** Keine „serious“/„critical“-Befunde von axe auf allen Seiten und Dialogen, hell und dunkel.
5. **Fehler behoben:** Jeder gefundene Fehler wird mit einem Regressionstest behoben (Liste in Abschnitt 6).
6. **Live geprüft:** Nach jedem Production-Deploy läuft ein Smoke-Test gegen `freebie.stefanai.de` grün.

## 2. Ausgangslage

| | Heute |
|---|---|
| Unit-Tests | 42 (Request-Aufbau, Caching, Extraktion, Datenbank, Speicher) |
| E2E | 1 Skript mit 13 Schritten, läuft nicht in der CI |
| Bedienelemente Chat | ca. 150 (inkl. Zustände, Tastatur, Drag & Drop, Einfügen) |
| Bedienelemente Admin | ca. 90 in 5 Bereichen |
| API-Routen | 22, plus Proxy-Regeln und Login-Bremse |
| Einstellungen | 15 Felder + 9 Funktionsschalter, 18 Modell-Felder, 8 Vorlagen-Felder |
| Bei der Inventur gefunden | rund 40 Fehler und Lücken (Abschnitt 6) |

## 3. Testarchitektur

### 3.1 Werkzeug

**Playwright Test** (ist schon installiert) ersetzt das Smoke-Skript. Getestet wird immer gegen den
Produktions-Build (`next build` + `next start`), also so, wie es auf Vercel läuft.

| Projekt | Inhalt | Ausführung |
|---|---|---|
| `chat` | Oberfläche für Teilnehmende | parallel, jeder Test in eigenem Browser-Kontext |
| `admin` | Admin-Bereich, ändert Server-Zustand | seriell, mit Rücksetzen nach jedem Test |
| `api` | alle Routen ohne Browser | parallel |
| `provider` | echte Claude/GPT-Adapter gegen Fake-API | parallel |
| `mobile` / `tablet` | 390 × 844 und 820 × 1180, Touch | Auswahl der Chat-Tests |
| `live` | gegen `freebie.stefanai.de` | nur auf Abruf / nach Deploy |

Bei Fehlschlägen speichert die CI Trace, Video, Screenshot und Serverlog als Artefakt (HTML-Report).

### 3.2 Drei Betriebsarten

| Modus | Wozu | Kosten |
|---|---|---|
| **A · Mock** (`FREEBIE_MOCK=1`) | Alle Oberflächen-Abläufe. Der Mock wird um steuerbare Szenarien erweitert: langsamer Stream (für „Stoppen“), Fehler 401/429/413/400/500, Abbruch ohne Abschluss, Ablehnung, Max-Tokens, Ersatzmodell, viele/doppelte Quellen, SVG-/Markdown-/Code-Artefakte, Versionen, kaputtes Mermaid. Außerdem zeigt die Mock-Antwort Modell, Effort, Websuche, Vorlage und Anhänge an – so ist jede Einstellung im Chat sichtbar. | 0 € |
| **B · Fake-API** | Ein lokaler Server spielt die Anthropic- und OpenAI-Schnittstellen nach (Streaming, Thinking, Websuche, Tool-Aufrufe, Bilder, Transkription, Modell-Listen, Fehler). Freebie wird über `ANTHROPIC_BASE_URL`/`OPENAI_BASE_URL` darauf gelenkt – ohne Codeänderung. So laufen die **echten** Adapter, und jede Anfrage wird mitgeschnitten. Damit lässt sich das Caching-Versprechen prüfen: gleiche Bytes im Präfix über mehrere Runden, Cache-Marker an der richtigen Stelle, Effort-Wechsel ohne Präfixbruch, exakte Kostenberechnung. | 0 € |
| **C · Live** | Kurzer Rundgang gegen die echte Instanz mit echten Schlüsseln, günstigste Modelle, Effort „Niedrig“. Ändert keine Einstellungen. | < 0,10 $ pro Lauf |

### 3.3 Testdaten

Ein Generator erzeugt alle Dateien beim Teststart – keine Binärdateien im Repo. Audio entsteht mit dem schon
vorhandenen ffmpeg (eine 25-Minuten-MP3 dauert rund 8 Sekunden), Tabellen mit SheetJS, Word und PowerPoint als
gezippte XML-Dateien.

- **Dokumente:** PDF mehrseitig mit Tabelle, DOCX mit Überschriften/Tabelle/Umlauten, XLSX mit zwei Blättern und
  Formeln, XLS, ODS, CSV, TSV, PPTX mit Notizen, TXT, MD, JSON, Quellcode
- **Bilder:** PNG, JPG, WEBP, GIF; ein 4000-px-Bild (Verkleinerung) und eines, das danach noch über 5 MB hat
- **Audio:** MP3 kurz und 25 Minuten (3 Abschnitte), M4A, WAV, OGG, WEBM, FLAC, Datei ohne Tonspur
- **Grenzfälle:** leere Datei, kaputtes PDF, Zip-Bombe (über 200 MB entpackt), falsche Endung (PNG als `.pdf`),
  Dateinamen mit Umlauten/Leerzeichen/Emoji, 21 Dateien auf einmal, Dateien knapp über den Limits (20/50/300 MB)

### 3.4 Isolation

- Jeder Test startet mit leerem Browser (IndexedDB, localStorage, Cookies). Der Spielumgebungs-Hinweis wird
  vorbelegt – außer in den Tests, die ihn prüfen.
- Server-Zustand (Einstellungen, Modelle, Vorlagen, Passwort, Caches) wird nach jedem Admin-Test über die
  Admin-API auf den Ausgangszustand zurückgesetzt. Es gibt **keine** Test-Hintertür im Produktionscode.
- Jeder Testlauf hat eine eigene Datenbank. Jeder Test nutzt eine eigene IP-Kennung, damit sich die Login-Bremse
  nicht zwischen Tests auswirkt.
- Zeitabhängiges (Gruppierung „Heute/Gestern“, Ablauf von Sitzungen, 10-Minuten-Fenster) wird mit der
  Playwright-Uhr und gezielt erzeugten, abgelaufenen Tokens getestet statt mit Warten.

### 3.5 Browserfunktionen

- **Mikrofon:** Chromium mit simuliertem Mikrofon, das eine vorbereitete Sprachdatei abspielt; zweiter Kontext mit
  verweigerter Berechtigung.
- **Zwischenablage, Downloads, Pop-ups, Drucken, Bestätigungsdialoge:** werden abgefangen und inhaltlich geprüft
  (z. B. heruntergeladener Dateiname und Dateiinhalt, kopierter Text).
- **Drag & Drop und Einfügen** von Dateien werden synthetisch ausgelöst.
- **Netzwerkstörungen:** gezielt eingeschleuste 401/500, Zeitüberschreitungen, abgebrochene Streams, Offline-Modus.

### 3.6 Browser und Geräte

Lokal steht nur Chromium zur Verfügung. In der CI laufen zusätzlich **WebKit** (Safari, iPad/iPhone – in
Schulungen häufig) und **Firefox**. Bildschirmgrößen: 1440, 1280, 820 (Tablet), 390 (Handy).

## 4. Testkatalog

Jede Zeile wird zu einem oder mehreren Tests. Die IDs tauchen in der Abdeckungsmatrix und in den Testnamen auf.

### A · Zugang und Sitzung

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| A01 | Ohne Anmeldung `/`, `/admin` bzw. `/api/...` aufrufen | Weiterleitung auf `/login` (bzw. `/login?weiter=admin`) bzw. 401 mit deutscher Meldung |
| A02 | Login-Seite | Titel, Spielumgebungs-Hinweis aus den Einstellungen, Felder „Benutzername“ und „Passwort“ mit passendem `autocomplete`, Link zu stefanai.de in neuem Tab |
| A03 | Leere Felder (auch nur Leerzeichen im Namen) | Button gesperrt, Enter tut nichts |
| A04 | Falscher Name oder falsches Passwort; vor dem Laden Getipptes bzw. Autofill | „Benutzername oder Passwort stimmt nicht.“ (verrät nicht, was falsch war), Feld bleibt nutzbar; Vorausgefülltes wird übernommen |
| A05 | Gast meldet sich per Enter an (Groß-/Kleinschreibung, Leerzeichen egal) | Chat öffnet; Cookie HttpOnly, SameSite=Lax, 12 Stunden; Secure hinter HTTPS (U01) |
| A06 | Sehr lange Eingaben | gelten einfach als falsch |
| A07 | 50 Fehlversuche von einer IP, dann der 51.; 10 Fehlversuche mit dem Namen der Kursleitung | Sperre mit Meldung, auch richtige Zugangsdaten werden abgewiesen; andere IP und Kursleitung nicht betroffen; Erfolg zählt einen Versuch zurück; ein Gerät, auf dem sich die Kursleitung schon angemeldet hat (Geräte-Cookie), zählt für sich und wird nicht ausgesperrt |
| A08 | Abgelaufene, manipulierte, veraltete Tokens und Tokens unbekannter Gäste | abgewiesen, Weiterleitung auf Login |
| A09 | Bereits angemeldet `/login` öffnen | Weiterleitung in den Chat |
| A10 | „Abmelden“ (Gast: mit Rückfrage, Chats werden vom Gerät gelöscht, der Posteingang wird geleert) | zurück zum Login, Cookie weg |
| A11 | Kursleitung meldet alle ab, während jemand chattet | nächste Aktion führt sauber zum Login (ohne „abgelaufen“); nach erneuter Anmeldung sind die Chats des Kontos wieder da |
| A12 | „Alle abmelden“ bei mehreren Admin-Sitzungen | andere Admin-Sitzungen enden, die eigene bleibt |
| A13 | Gast-Passwort mit kopierten Leerzeichen, Tab, geschütztem Leerzeichen, Großbuchstaben (iPad) oder unsichtbaren Zeichen, ebenso im Namen | Anmeldung klappt, kein Fehlversuch gezählt; das Admin-Passwort bleibt exakt |
| A14 | Benutzername und Passwort zusammen eingefügt (Kärtchen, CSV-Zeile, „Benutzername: … Passwort: …“) | beide Felder gefüllt, Anmeldung klappt; steht der Name schon da, wird ein eingefügtes Passwort nie zerlegt |
| A15 | Doppel-Enter bei der Anmeldung (zweimal abgeschickt, bevor der Knopf gesperrt ist) | genau eine Anfrage, die Anmeldung klappt |
| A16 | Cookies blockiert (Sitzungs-Cookie kommt nicht an bzw. der Browser meldet Cookies aus) | Hinweis auf der Anmeldeseite, wie es geht – statt stillem Zurückspringen zur Anmeldung |

### B · Hinweis „Spielumgebung“

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| B01 | Erster Besuch (je Konto – am gemeinsamen Rechner bestätigt jeder Gast selbst, T13) | Hinweis-Dialog, nur mit „Verstanden“ schließbar (nicht Esc, nicht Klick daneben); nach Neuladen nicht mehr |
| B02 | Admin ändert den Hinweistext | Dialog erscheint bei allen erneut, neuer Text auf Login-Seite und im Dialog |
| B03 | Fußzeile und „Mehr“ | Kurztext aus den Einstellungen; Dialog per X, Esc und Klick daneben schließbar |

### C · Chat-Grundfunktionen

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| C01 | Startseite | Begrüßung; die 4 Beispiel-Buttons füllen das Eingabefeld (ohne Senden) und setzen den Fokus |
| C02 | Senden per Button, per Enter; Shift+Enter; Eingabe über Wortvorschläge (IME) | sendet bzw. neue Zeile; IME-Bestätigung sendet nicht |
| C03 | Senden gesperrt | bei leerem Text, laufendem Upload, laufender Antwort (dann „Stoppen“) |
| C04 | Antwort läuft | Lade-Punkte → „Freebie denkt nach …“ → Text; Markdown, Tabelle, Formel, Code mit Hervorhebung, Links in neuem Tab, fremde Bilder nur als Link |
| C05 | Stoppen vor bzw. nach dem ersten Text | „Abgebrochen.“ bzw. Text mit „(Abgebrochen)“; Server bricht die Anfrage ab |
| C06 | Neu generieren | nur bei der letzten Antwort, umgeht den Cache, nicht bei Bild-Modus-Antworten |
| C07 | Frühere Nachricht bearbeiten | Hinweisleiste, „Abbrechen“ stellt her, Senden kürzt den Verlauf ab dort; Anhänge sichtbar und entfernbar |
| C08 | Kopieren (Frage, Antwort, Codeblock) | exakter Inhalt in der Zwischenablage, Rückmeldung „Kopiert“ |
| C09 | Gedankengang auf- und zuklappen | Inhalt sichtbar, Zustand für Screenreader erkennbar |
| C10 | Lange Antwort | scrollt mit, außer man hat selbst hochgescrollt |
| C11 | Jede Fehlermeldung (Pause, Modell weg, Schlüssel fehlt, 401/429/413/400/5xx, Ablehnung, Abbruch, Netz weg) | deutsche Meldung im Chat, „Neu generieren“ funktioniert danach |
| C12 | Sitzung läuft mitten im Chat ab | Weiterleitung zum Login |
| C13 | Sehr lange Eingabe (200.000 Zeichen) bzw. über dem Limit | wird komprimiert gesendet bzw. klare Meldung statt „Ungültige Anfrage.“ |
| C14 | Markdown-Export und Drucken | Dateiname und Inhalt (inkl. Anhänge, Quellen, Fehler); Druckansicht ohne Bedienelemente |
| C15 | HTML/Script in Frage und Antwort, `javascript:`-Links | als Text dargestellt, nichts wird ausgeführt |
| C16 | Einfügen aus Word, Excel und PowerPoint (Text, HTML und Bild in der Zwischenablage) | der Text steht im Eingabefeld, kein Bild-Anhang (auch mit der echten Zwischenablage in Chromium) |
| C17 | Screenshot, Bild von einer Webseite, kopierte Datei einfügen | wird angehängt |
| C18 | Text mit Steuerzeichen, Nullbyte, geschützten Leerzeichen, Emoji und arabischer Schrift senden (auch ein zweites Mal aus dem Cache); danach „Kopieren“ | keine Fehlermeldung, das Modell bekommt den Text ohne Steuerzeichen, „Kopieren“ liefert ihn exakt zurück |
| C19 | Geräte ohne Maus (iPad, Handy, Android-Tablet): Enter, Senden-Knopf, Strg/Cmd+Enter | Enter macht eine neue Zeile, gesendet wird mit dem Knopf bzw. Strg/Cmd+Enter; am Rechner mit Maus oder Trackpad bleibt Enter = Senden (C02) |
| C20 | Markierten Text ins Eingabefeld ziehen | wird eingefügt, nichts wird abgefangen oder angehängt |
| C21 | Doppelklick und Doppel-Enter auf „Senden“ (neuer und laufender Chat); langsamer Doppelklick, dessen zweiter Klick schon „Stoppen“ trifft | genau eine Frage, ein Chat, eine Anfrage; die Antwort läuft weiter |
| C22 | Doppelklick auf „Neu generieren“ | genau eine neue Antwort, eine Anfrage |
| C23 | Doppelklick auf „Bild erzeugen“, „Stoppen“, „Export“, Senden im Posteingang und „Abmelden“ | jeweils genau eine Wirkung (eine Anfrage, ein Download) |
| C24 | Entwurf mit laufendem Upload → „Bearbeiten“ einer früheren Nachricht → „Abbrechen“ bzw. Senden | Entwurf und Anhang sind wieder da, der Upload läuft zu Ende |
| C25 | Entwurf → Beispiel bzw. „Mit Freebie besprechen“ | der Entwurf bleibt stehen, Hinweis mit „Ersetzen“ |
| C26 | Bearbeiten → anderer Chat, „Neuer Chat“, Chat löschen | der eigene Entwurf kommt zurück, nie der Text der bearbeiteten Nachricht; Hinweisleiste weg |
| C27 | Antwort läuft → anderer Chat, Bild-Modus, Bearbeiten, Import, Abmelden, Neuladen | gesperrt; Abmelden beendet die Antwort ohne Fehler und ohne Nachspeichern; beim Neuladen fragt der Browser nach (Safari auf iPad/iPhone zeigt das nicht) |
| C28 | Nach einer Fehlermeldung einfach weiterschreiben; nach „Stoppen“ sofort neu senden; nach „Antwort fehlt“ (Seite während der Antwort neu geladen) weiterschreiben | Verlauf bleibt Frage/Antwort (der Hinweis „Antwort fehlt“ bleibt stehen), das Modell kennt beide Fragen; die Anfrage an Claude und GPT ist gültig (die Fake-API prüft die Regeln der echten API) |
| C29 | Nur ein Anhang, ohne Text bzw. nur mit Leerzeichen | die Antwort kommt |
| C30 | Fehlerseiten der Plattform ohne JSON (413, 502, 504) bei Chat, Upload und Bild | deutsche Meldung mit nächstem Schritt statt „Fehler 413“ |

### D · Modelle und Denktiefe

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| D01 | Modellauswahl | nur aktive Modelle, nach Anbieter gruppiert und sortiert, „Standard“-Kennzeichen, Beschreibung |
| D02 | Erster Besuch / später | Standardmodell auf Standardstufe; danach das zuletzt gewählte Modell |
| D03 | Modell mitten im Chat wechseln | Hinweis zum Cache, nächste Antwort kommt vom neuen Modell, Wahl bleibt beim Chat gespeichert |
| D04 | Denktiefe | nur die Stufen des Modells; Auswahl gilt für die nächste Nachricht und bleibt beim Chat |
| D05 | Modell ohne Denktiefe bzw. mit wenigen Stufen | Menü fehlt bzw. zeigt nur diese Stufen |
| D06 | Admin deaktiviert das gewählte Modell | verständliche Meldung, Auswahl aktualisiert sich |
| D07 | Gespeichertes Modell existiert nicht mehr | Rückfall auf das Standardmodell |
| D08 | Gar kein Modell verfügbar | Hinweisleiste, Eingabe gesperrt mit passendem Text |
| D09 | Bedienung nur mit Tastatur | Menüs mit Pfeiltasten und Esc bedienbar (heute nicht) |
| D10 | Modellwahl während einer Antwort | gesperrt, bis die Antwort fertig ist |

### E · Verlauf und Seitenleiste

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| E01 | „Neuer Chat“ (Seitenleiste und Handy-Kopfzeile) | leerer Chat; während einer Antwort klar geregelt (heute: passiert stillschweigend nichts) |
| E02 | Titel | erst Anfang der Frage, dann erzeugter Titel |
| E03 | Gruppen „Heute / Gestern / Letzte 7 Tage / Älter“ | richtige Zuordnung (mit gestellter Uhr) |
| E04 | Suche | findet Titel und Nachrichtentext, Groß/klein egal, „Keine Treffer.“ |
| E05 | Chat wechseln | Modell, Denktiefe, Vorlage und Websuche werden wiederhergestellt, aktiver Chat erkennbar |
| E06 | Chat löschen (bestätigen / abbrechen), auch den aktiven und einen laufenden | sauberer Zustand danach |
| E07 | Neuladen, zwei Tabs gleichzeitig | Verlauf bleibt erhalten, beide Tabs aktualisieren sich |
| E08 | Export und Import | Dateiname und Inhalt; Import ergibt denselben Stand; kaputte Datei → Meldung; unvollständige Chats bringen nichts zum Absturz; 500 Chats bleiben flüssig |
| E09 | Hell / System / Dunkel | bleibt gespeichert, folgt dem Betriebssystem, kein Aufblitzen beim Laden |
| E10 | Admin-Link, Abmelden | führen an die richtige Stelle |
| E11 | Import mit Feldern vom falschen Typ; Chat, der sich nicht anzeigen lässt | Ungültiges fällt weg, der Chat bleibt nutzbar und wird vom Server angenommen; sonst Hinweis mit „Als Datei sichern“/„Chat löschen“ statt weißer Seite |
| E12 | Älteren Export erneut importieren | Chats mit gleicher ID werden überschrieben (so gewollt) |
| E13 | Falsche Datei beim Import (PDF, Bild, leer, Markdown-Export, fremdes JSON) | Meldung sagt, was es ist und welche Datei stattdessen |
| E15 | Zwei Tabs mit demselben Chat, beide senden | während einer Antwort sendet der andere Tab nicht dazwischen (Hinweis, Text bleibt); Verlauf bleibt Frage/Antwort |
| E16 | Browser-Speicher voll | Meldung, Text und Anhänge bleiben im Eingabefeld |

### F · Dateien

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| F01 | Büroklammer | Dateiauswahl mit den erlaubten Typen (inkl. E-Mail `.eml`) |
| F02 | Jedes Dokumentformat (inkl. E-Mail mit kodierten Umlauten) | Fortschritt → fertig mit Token-Schätzung; der ausgelesene Text enthält die erwarteten Inhalte; das Modell bekommt ihn |
| F03 | Bilder | Vorschau, Verkleinerung großer Bilder, Meldung über 5 MB; bei Modellen ohne Bildverständnis ein sichtbarer Hinweis |
| F04 | Grenzfälle aus 3.3 | jeweils klare deutsche Meldung, nichts hängt |
| F05 | Mehrere Dateien, Anhang entfernen, fehlerhafte Datei | Entfernen bricht den Upload ab; Fehler-Chip blockiert das Senden nicht; mehr als 20 Dateien → Meldung vorab |
| F06 | Drag & Drop, Bild einfügen | Overlay erscheint und verschwindet zuverlässig; Dateien kommen an |
| F07 | Dieselbe Datei zweimal | zweites Mal aus dem Datei-Cache; nach Ablauf der Aufbewahrung sauberer Hinweis |
| F08 | Uploads bzw. Transkription im Admin aus | Meldung im Chat **und** Sperre in der API |
| F09 | Anhänge im weiteren Gespräch | bleiben Teil des Verlaufs, erscheinen in Nachricht und Export |
| F10 | Eingabeleiste mit Anhängen, breit und schmal | Senden-Button bleibt rechts in der Werkzeugzeile; die Token-Summe steht bei den Anhängen |
| F11 | Upload läuft → „Neuer Chat“, Chatwechsel, Neuladen | der Anhang bleibt und wird fertig, Senden erst danach; beim Neuladen fragt der Browser nach, danach hängt nichts |
| F12 | Dieselbe Datei zweimal angehängt (nacheinander bzw. gleichzeitig) | Hinweis „Ist schon angehängt“, sie geht nur einmal mit |
| F13 | Dateinamen ohne lateinische Buchstaben („Отчет.txt“, „📊.csv“), Endung in Großbuchstaben, sehr lange Namen | werden verarbeitet, der Originalname bleibt sichtbar |
| F14 | CSV aus deutschem Excel (Windows-1252, Semikolon, Dezimalkomma, Datum), UTF-16- und UTF-8-Text mit BOM | Umlaute, Zahlen und Daten kommen unverändert beim Modell an |
| F15 | Text mit Nullbytes und Steuerzeichen; Datei nur aus Nullbytes | wird ohne diese Zeichen ausgelesen bzw. „kein lesbarer Text“ – nie „interner Fehler“ |
| F16 | Typische falsche Formate (.doc, .ppt, .odt, .pages, .heic, .msg, .zip, ohne Endung) | Meldung mit Tipp, wie es doch geht („als .docx speichern“, „als JPG speichern“, „entpacken“) |
| F17 | Datei auf die Seitenleiste (neben die Ablagefläche) fallen gelassen | Freebie bleibt offen, die Datei wird angehängt (bei Pause: Hinweis) |
| F18 | Netz bricht beim Hochladen, Auslesen oder Transkribieren ab | klare Meldung, dieselbe Datei lässt sich erneut anhängen und senden, nichts hängt |

### G · Audio-Transkription

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| G01 | Kurze MP3 | Chip „Transkript“, Text geht an das Modell |
| G02 | 25-Minuten-MP3 | 3 Abschnitte, Fortschritt „Abschnitt i/n“, parallel, Zusammenfügen |
| G03 | Dieselbe Datei erneut | „Aus dem Cache“, keine neuen Kosten |
| G04 | Ein Abschnitt scheitert einmal bzw. dauerhaft | automatische Wiederholung bzw. klare Meldung |
| G05 | M4A, WAV, OGG, WEBM, FLAC, Datei ohne Ton | funktioniert bzw. Meldung |
| G06 | Transkriptionsmodell im Admin geändert | neue Transkription statt Cache |

### H · Spracheingabe

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| H01 | Aufnehmen und stoppen | Timer und Pegel, „Transkribiere …“, Text landet im Eingabefeld (an bestehenden Text angehängt) |
| H02 | Mikrofon verweigert | Meldung, per Klick schließbar |
| H03 | Zu lange Aufnahme | automatischer Stopp nach 10 Minuten bzw. Meldung |
| H04 | Funktion aus bzw. Pause | Button fehlt bzw. gesperrt |
| H05 | Doppelklick aufs Mikrofon | eine Aufnahme; nach „Stopp“ ist kein Mikrofon-Stream mehr aktiv, später kommt kein Text nach |
| H06 | Während Diktat oder Transkription tippen | Getipptes bleibt, das Transkript wird angehängt |

### I · Bilder

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| I01 | Bild-Modus | Beschreibung nötig; Format und Qualität mit den Admin-Vorgaben; Schließen per X/Esc/Abbrechen, gesperrt während der Erzeugung; Ergebnis mit Download und Öffnen in neuem Tab |
| I02 | Fehler bei der Erzeugung | Meldung; beim nächsten Öffnen wieder weg (heute bleibt sie stehen) |
| I03 | Bild im Chat („Erstelle ein Bild von …“), Bild verändern lassen | Statusanzeige, Bild in der Antwort, Referenzbild wird genutzt |
| I04 | Funktion aus / kein OpenAI-Schlüssel | Button fehlt, Werkzeug wird nicht angeboten, API sperrt |
| I05 | Sehr lange Bildbeschreibung | auf 4.000 Zeichen begrenzt, Zähler sichtbar |

### J · Websuche

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| J01 | Schalter an/aus | nur sichtbar, wenn Funktion an und Modell fähig; an: Quellen nummeriert mit Seitenname, öffnen in neuem Tab; aus: keine Suche |
| J02 | Viele bzw. doppelte Quellen | höchstens 12, keine Doppelungen |

### K · Artefakte

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| K01 | Webseite | Karte „wird erstellt“, Panel öffnet sich, Seite läuft (Button reagiert) |
| K02 | Abschottung | das Artefakt kommt nicht an Cookies, Speicher oder API von Freebie, kann die Seite nicht umleiten und nichts nachladen |
| K03 | SVG, Mermaid (auch fehlerhaft), Markdown, Code | Vorschau/Code-Reiter, Fehlermeldung bei kaputtem Diagramm |
| K04 | Versionen | Auswahl „Version n“; Karte öffnet die Version dieser Nachricht |
| K05 | Kopieren, Herunterladen (Dateiname und Inhalt je Typ), SVG aus Mermaid, neuer Tab, Panel schließen, „Artefakte (n)“ | jeweils richtiges Ergebnis |
| K06 | Handy | Panel im Vollbild, Schließen führt zurück |
| K07 | Funktion im Admin aus | keine Artefakte mehr (heute: nur das automatische Öffnen fällt weg) |

### L · Vorlagen im Chat

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| L01 | Vorlage wählen und abwählen | Kennzeichen im Kopf; Rolle geht an das Modell; bleibt beim Chat gespeichert |
| L02 | Vorlage im Admin deaktiviert | verschwindet; bestehende Chats laufen weiter |
| L03 | „Empfohlenes Modell“ | wird beim Wählen der Vorlage übernommen (heute ohne Wirkung) |

### M · Antwort-Cache

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| M01 | Gleiche erste Frage in neuem Chat | Kennzeichen „aus dem Cache“, Kosten 0, Admin-Zähler +1 |
| M02 | Anderes Modell / Denktiefe / Websuche / Vorlage / Kursleitungs-Hinweis / Datum / Anhang | kein Treffer |
| M03 | Neu generieren, Bild-Antworten, abgebrochene oder fehlerhafte Antworten | werden nicht aus dem Cache bedient bzw. nicht gespeichert |
| M04 | Cache aus bzw. Kennzeichen aus | keine Treffer bzw. Treffer ohne Kennzeichen |
| M05 | Gültigkeitsdauer, „Cache leeren“ im Admin | abgelaufene oder geleerte Einträge werden nicht genutzt |

### N · Darstellung, Handy, Barrierefreiheit

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| N01 | Handy | Menü öffnet/schließt, Chatwahl schließt die Leiste, Aktionen ohne Hover erreichbar, Eingabe mit Bildschirmtastatur nutzbar (auch mit dem Knopf „Verbindungen“) |
| N02 | Dunkelmodus | Screenshot-Satz aller Seiten zur Sichtprüfung |
| N03 | axe auf jeder Seite und in jedem Dialog, hell und dunkel | keine schweren Befunde |
| N04 | Nur Tastatur | sinnvolle Reihenfolge, sichtbarer Fokus, Dialoge halten und geben den Fokus zurück |

### O · Admin: Zugang und Übersicht

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| O01 | Admin-Anmeldung über die gemeinsame Login-Seite (`/admin` → `/login?weiter=admin`) | falsches Passwort abgewiesen; Admin-Bereich mit allen Reitern (auch „Fundus“); Cookie 12 Stunden, SameSite=Lax; Chat ohne zweite Anmeldung; Gäste kommen nicht hinein (T09) |
| O02 | Kennzahlen | Kosten, Ersparnis, Anfragen, Cache-Quote und Treffer stimmen exakt mit den im Test ausgelösten Aktionen überein (im Fake-API-Modus mit echten Preisen) |
| O03 | Diagramm | Balken mit Beschriftung, Tooltip per Maus und Tastatur, Tabellenansicht mit denselben Zahlen |
| O04 | Systemstatus | jede Zeile spiegelt die Umgebung (Schlüssel, Datenbank, Blob per Token/OIDC, Secrets, Admin-Zugang, laufende Termine) |

### P · Admin: Modelle

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| P01 | Modell anlegen mit allen Feldern | erscheint im Chat mit Name, Beschreibung, Reihenfolge; doppelte ID abgelehnt |
| P02 | Jedes Feld an seiner Grenze | deutsche Fehlermeldung je Feld (heute teils englisch) |
| P03 | Jede Fähigkeit umschalten | Wirkung im Chat (Bildhinweis, Websuche-Schalter, Bild-Werkzeug, Denktiefe-Menü, Stufen, Standardstufe) |
| P04 | Effort-Stufe entfernen | wird gespeichert (heute: Speichern scheitert immer) |
| P05 | Standardmodell per Stern und Schalter | genau ein Standard, neue Besucher bekommen es |
| P06 | Aktivieren, Deaktivieren, Löschen | Bestätigung; Schutz für Standard- und Titelmodell; Fehler werden angezeigt |
| P07 | „Test“ | Erfolg mit Antwort und Dauer bzw. deutsche Fehlermeldung |
| P08 | Modelle abrufen | Liste vom Anbieter, vorhandene ausgegraut, Klick füllt den Dialog vor |
| P09 | Preise mit Komma eintippen | werden übernommen und in der Übersicht verrechnet |

### Q · Admin: Einstellungen (jede einzeln)

| ID | Einstellung | Woran der Test die Wirkung erkennt |
|---|---|---|
| Q01 | Not-Aus + Meldung | Chat, Bilder, Transkription, Diktat, Upload gesperrt mit der Meldung; Hinweisleiste; Admin geht weiter; nach dem Aufheben wieder alles da |
| Q02–Q10 | die 9 Funktionsschalter | Oberfläche **und** API reagieren (je Schalter ein Test an und aus) |
| Q11 | Claude Prompt-Cache 5 Min / 1 Std | Cache-Marker in der Anfrage (Fake-API) |
| Q12 | Antwort-Cache gültig (Stunden) | Ablaufzeit; ungültige Werte mit Meldung statt stiller Ersetzung |
| Q13 | Dateien aufbewahren (Tage) | Ablaufdatum; Aufräumjob löscht Dateien **und** ausgelesene Texte |
| Q14 | Bildmodell, Bildqualität, Bildformat | Vorgaben im Bild-Dialog; Modell in der Anfrage |
| Q15 | Transkriptions- und Diktatmodell | Modell in der Anfrage, Cache-Verhalten |
| Q16 | Modell für Chat-Titel | Titelanfrage nutzt dieses Modell; nur aktive Modelle wählbar |
| Q17 | PDFs nativ | PDF geht als Dokument an fähige Modelle (heute nie erreichbar) |
| Q18 | Hinweistext lang/kurz | siehe B |
| Q19 | Hinweise an das Modell | Abschnitt im System-Prompt, neuer Cache-Schlüssel |
| Q20 | Speichern | „Gespeichert.“, Fehler sichtbar, zwei Admins gleichzeitig überschreiben sich nicht |
| Q21 | Funktionsschalter „Fundus“ | aus: kein Datenbank-Symbol, damit auch keine Prompts, Fundus-API 403; Admin › Fundus bleibt bedienbar mit Hinweis; Upload aus, Fundus an: nur das Datenbank-Symbol, Anhängen geht; Pause sperrt Symbol und API (503) |
| Q22 | Schalter „Posteingang“ aus und wieder an | Umschalter, Verbindung, Werkzeuge (Mock-Diagnose „aus“) und API (403) weg, alter Link führt zum Chat; wieder an: alles da, vorhandene Mails bleiben |
| Q23 | Begrüßungs-E-Mail ändern bzw. leeren | neue Postfächer bekommen den neuen Text (einmal, auch bei erneuter Anmeldung), leer: keine Begrüßung; zu lang: Meldung |
| Q24 | Schalter „Gruppenchats“ aus und wieder an | Symbol, Abschnitt und API (403) weg; offener Gruppenchat wechselt sauber zu „Neuer Chat“; wieder an: alles da, vorhandene Chats bleiben; Posteingang davon unberührt |

### R · Admin: Vorlagen

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| R01 | Anlegen, Bearbeiten, Löschen | ID aus dem Namen (ä→ae …), Validierung je Feld, Bestätigung, Fehleranzeige |
| R02 | Symbol, Reihenfolge, aktiv, empfohlenes Modell | Wirkung auf der Chat-Startseite (siehe L) |

### S · Admin: Sicherheit

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| S01 | „Alle abmelden“, während Gäste chatten | Meldung „Alle Sitzungen wurden abgemeldet.“; Gäste landen bei der nächsten Aktion auf der Anmeldung |
| S02 | Reiter „Sicherheit“ | erklärt den Admin-Zugang (Benutzername, Passwort aus `ADMIN_PASSWORD`); kein gemeinsames Teilnehmer-Passwort mehr |
| S03 | Alle abmelden (bestätigen / abbrechen) | alle Teilnehmenden raus, eigener Admin-Zugang bleibt |
| S04 | Cache leeren (bestätigen / abbrechen) | nächste gleiche Frage kommt nicht aus dem Cache |

### T · Termine und Gast-Zugänge

Die Kursleitung legt Termine (höchstens 24 Stunden) mit Gruppen und Gästen an; jeder Gast hat einen einfachen
Benutzernamen und ein einfaches Passwort, die zum Termin-Ende verfallen (Plan: [ZUGANG-PLAN.md](ZUGANG-PLAN.md)).

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| T01 | Termin anlegen, Prüfungen (Ende vor Beginn, über 24 h, Vergangenheit, leerer Name, „bis“ vor „von“) | Termin unter „Läuft“/„Geplant“, deutsche Meldungen, Hinweis „Ende am Folgetag“ |
| T02 | Gruppen anlegen, umbenennen, löschen (Bestätigung) | Löschen entfernt die Gäste; ihre Sitzungen enden sofort, Login mit „abgelaufen“, Chats vom Gerät gelöscht |
| T03 | Gäste erzeugen, nachlegen, einzeln löschen, Passwort neu erzeugen, Passwörter zeigen/verbergen | einfache, eindeutige Zugangsdaten (`fuchs27`/`sonne482`); altes Passwort gilt nicht mehr |
| T04 | Druckansicht und CSV je Gruppe und Termin | alle Gäste mit Benutzername, Passwort und Gültigkeit; CSV für Excel |
| T05 | Termin verschieben bzw. verkürzen und verlängern | wirkt sofort auf bestehende Sitzungen („Sitzung beendet“, Chats bleiben) und neue Anmeldungen |
| T06 | „Jetzt beenden“ (abbrechen / bestätigen) | Gäste bei der nächsten Aktion abgemeldet („abgelaufen“), Zugänge gelöscht, Termin unter „Vorbei“ |
| T07 | Termin löschen (laufend bzw. vorbei) | Gäste sofort weg; vorbei: nur noch aus der Statistik entfernen |
| T08 | Mehrere Termine, Filter Läuft/Geplant/Vorbei | richtige Zuordnung und Sortierung |
| T09 | Gast im Chat | kein Admin-Link; `/admin` → Login, `/api/admin/*` → 403 |
| T10 | Anmeldung vor Beginn bzw. ab 30 Minuten vorher | Meldung mit Startzeit bzw. Zugang |
| T11 | Termin endet während der Sitzung (echter Kurztermin) | Warnung, zum Ende ohne Zutun zur Anmeldung „Dein Zugang ist abgelaufen.“, Chats vom Gerät gelöscht, Anmeldung danach abgelehnt |
| T12 | „gültig bis“ und Warnung 10 Minuten vor Ende | Uhrzeit in der Seitenleiste; Warnung mit „Chats exportieren“; verkürzte und verlängerte Termine kommen ohne Neuladen an |
| T13 | Zwei Gäste nacheinander am selben Gerät, dazu die Kursleitung | keiner sieht die Chats des anderen; Abmelden löscht Gast-Chats (Admin-Chats bleiben); Hinweis je Konto |
| T14 | Login-Bremse pro Benutzername | 10 Fehlversuche sperren den Namen (auch in anderer Schreibweise), andere Konten nicht; unbekannte Namen verhalten sich gleich |
| T15 | Admin meldet sich an | Chat und Admin-Bereich ohne zweite Anmeldung; Abmelden beendet beides |
| T16 | Übersicht „Nach Termin“ | Gast-Anfragen und Sitzungen je Termin und (aufgeklappt) je Gruppe; Summen nach Rolle; gelöschte Gruppen und Termine bleiben in der Statistik |
| T17 | Aufräumjob nach dem Termin-Ende | löscht die Gast-Zugänge, der Termin bleibt 90 Tage in der Statistik (ab dem tatsächlichen Ende) und wird danach gelöscht |
| T18 | API der Termine | 401 ohne Sitzung, 403 für Gäste, 400 mit deutscher Meldung, 404 für unbekannte IDs |
| T19 | Frühstarter: 25 Gäste hinter einer IP melden sich vor der Freigabe mehrfach mit richtigen Daten an | „Dein Termin beginnt …“, keine Sperre; zum Beginn kommen alle hinein |
| T20 | Gast nach 10 Fehlversuchen gesperrt, die Kursleitung erzeugt ein neues Passwort | Anmeldung mit dem neuen Passwort sofort möglich, das alte gilt nicht |
| T21 | 25 Gäste hinter einer IP mit Copy-&-Paste-Resten im Passwort und je einem echten Tippfehler | keine Raumsperre |

### U · API-Robustheit (ohne Browser, alle Routen)

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| U01 | Ohne, mit gefälschter und mit Gast-Sitzung an Admin-Routen (inkl. der Posteingangs- und Fundus-Routen); Cookie-Attribute; ändernde Aufrufe von fremden Seiten | 401 bzw. 403 mit deutscher Meldung; HttpOnly, SameSite, begrenzte Laufzeit; fremde Origin → 403 |
| U02 | Falsche Methode | 405 |
| U03 | Kaputtes JSON, falsche Felder, Grenzwerte (Nachricht, Anhänge, Bild-Prompt, Passwort) | 400 mit deutscher Meldung bzw. „Passwort stimmt nicht“ – nie 500 |
| U04 | Pfad-Tricks (`../`, kodiert, fremde Präfixe, Nullbyte), hochgeladenes HTML, Upload auf einen schon vorhandenen Pfad, Upload-Token für Blob | 400/404; Auslieferung als Download mit Sandbox-CSP; 409, die Datei bleibt unverändert; Tokens nur für `uploads/` und erlaubte Typen, mit Größengrenze je Typ |
| U05 | Aufräumjob ohne, mit falschem und richtigem Secret; ohne gesetztes Secret | 401, 401, 200 mit Zählern; 401; abgelaufene Dateien, ausgelesene Texte, Transkripte und alte Aufträge sind wirklich weg, Neueres bleibt |
| U06 | Sicherheits-Header auf Seiten, API-Antworten und Fehlern | nosniff, DENY, Referrer-Policy, HSTS, Permissions-Policy |

### V · Anbieter-Adapter (Fake-API, je Claude und GPT)

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| V01 | Text, Gedankengang, Nutzungswerte inkl. Cache-Tokens | korrekte Anzeige und Kostenberechnung |
| V02 | Websuche mit Quellen (inkl. Haiku mit Basis-Werkzeug) | Quellenkarten |
| V03 | Bild-Werkzeug-Schleife, Fortsetzung nach Pause, Max-Tokens, Ablehnung, Ersatzmodell | richtige Fortsetzung, Hinweise und Kennzeichen „Ersatzmodell“ |
| V04 | Fehler 401/429/413/400/500/529, Abbruch und Überlastung (Fehler-Ereignis) mitten im Stream | deutsche Meldungen, keine hängenden Anfragen |
| V05 | **Caching-Vertrag über 3 Runden** | System-Prompt, Werkzeuge und frühere Nachrichten byte-gleich; Cache-Marker korrekt; Effort-Wechsel ohne Präfixbruch; gleicher Cache-Schlüssel bei GPT; Werkzeuge mit und ohne Verbindung „Posteingang“ byte-gleich, Umschalten ändert keinen früheren Teil der Anfrage |
| V06 | Titel, Transkription, Bilder, Modell-Listen | Anfragen in der erwarteten Form |
| V07 | Claude und GPT lesen den Posteingang und senden (Werkzeug-Schleife) | Liste → Lesen → Antwort mit Betreff; Senden → Mail beim Empfänger; Statuszeilen; Karten „Gelesene E-Mails“ und „Gesendete E-Mails“; ohne Verbindung Werkzeug-Fehler mit Hinweis |
| V08 | Claude und GPT im Gruppenchat (Fake-API) | Beiträge mit Autor und Uhrzeit in einer Nutzernachricht; **Caching-Vertrag über 3 Runden mit Beiträgen dazwischen**: System-Prompt, Werkzeuge und frühere Runden byte-gleich, Cache-Marker korrekt, gleicher Cache-Schlüssel für alle Mitglieder; zweites Mitglied mit anderem Modell funktioniert |
| V09 | Eigenes PDF aus dem Fundus bei Claude und GPT (Fake-API), „PDF nativ“ an und aus | an: Dokument-Block mit den echten Bytes aus `fundus/`; aus: Text; Prüfsumme und Antwort-Cache wie bei Uploads; Caching-Vertrag (V05) unverändert |

### W · Belastbarkeit

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| W01 | Server-Neustart mitten in der Sitzung | Anmeldung und Daten bleiben |
| W02 | Verbindung bricht mitten in der Antwort ab, Neuladen während einer Antwort | Kennzeichnung „unterbrochen“, kein kaputter Verlauf |
| W03 | Chat mit 100 Nachrichten, 500 Chats in der Leiste | bleibt flüssig (Zeitbudget je Aktion) |
| W04 | **Schulungssituation:** 25 Personen gleichzeitig, eine IP | keine Sperre, keine Fehler, Antwort-Cache wird geteilt |
| W05 | 25 Personen einer Gruppe schreiben sich gleichzeitig Mails, alle Postfächer fragen ab | keine Fehler, keine Sperre, jede Mail kommt an |
| W06 | 25 Personen einer Gruppe in drei Gruppenchats posten gleichzeitig, alle fragen ab, zwei rufen `@Freebie` | keine Fehler, keine Sperre, jeder Beitrag kommt bei allen in derselben Reihenfolge an, genau eine Antwort je Chat und Runde |
| W07 | Zufallstest: zufällige Folgen aus 24 Teilnehmer-Aktionen (tippen, einfügen, doppelt senden, stoppen, bearbeiten, Dateien, Chats wechseln und löschen, Posteingang, neu laden, Diktat, Prompt ausfüllen und einfügen mit Sonderzeichen, Maske abbrechen, Fundus-Dokument anhängen …) mit festen Seeds | nach jedem Schritt: kein Platzhalter `{{…}}` eines ausgefüllten Prompts im Eingabefeld, Maske abbrechen ändert nichts, Frage/Antwort im Wechsel, „Stoppen“ nur bei laufender Antwort, kein Mikrofon ohne Aufnahme, keine internen Fehlertexte, höchstens ein neuer Chat; am Ende öffnet sich jeder Chat. CI: 5 Seeds × 40 Schritte, nachts 50 neue Seeds × 60 Schritte |
| W08 | Sehr lange Chats: 420 und 500 Nachrichten, über 4,5 MB (viele Websuchen), Verlauf länger als das Kontextfenster (Fake-API) | ab 400 Nachrichten bzw. großem Verlauf ein Hinweis mit „Neuer Chat“; an der Grenze die Meldung „Dieser Chat ist zu lang geworden …“ statt eines Fehlercodes, über 4,5 MB ohne Anfrage |
| W09 | 25 Gäste öffnen den Fundus, füllen Prompts aus und senden, während die Kursleitung Prompts speichert und eine Datei hochlädt | keine Fehler, kein 500; jeder sieht nach erneutem Öffnen den neuen Stand; ETag bleibt stimmig |

### X · Live-Smoke (`freebie.stefanai.de`)

Nach jedem Production-Deploy und auf Abruf, ohne Einstellungen zu ändern. Der Test legt mit dem Admin-Zugang einen
Termin für eine Stunde mit einem Gast an, chattet als dieser Gast und löscht den Termin am Ende wieder; für den
Gruppenchat (X10) kommt ein eigener Termin mit zwei Gästen einer Gruppe dazu
(`LIVE=1 LIVE_ADMIN_PASSWORD=… npm run test:e2e:live`):

| ID | Schritt | Erwartete Wirkung |
|---|---|---|
| X01 | Systemstatus im Admin (nur lesen) | alles grün, inkl. **Blob-Speicher**, Postgres, Cron, Schlüssel |
| X02 | je eine kurze Frage an Claude Haiku und GPT-6 Luna (Denktiefe „Niedrig“) | Antwort ohne Fehlermeldung |
| X03 | kleines PDF hochladen (über Blob) und befragen | Anhang bereit, Antwort |
| X04 | kurze MP3 transkribieren | Transkript, Antwort |
| X05 | ein Bild in Entwurfsqualität | Bild erscheint |
| X06 | eine Websuche-Frage und ein kleines Artefakt | Quellen; Artefakt-Panel öffnet sich |
| X07 | Gast meldet sich über das Formular an; Termin wird gelöscht | nur Chat, kein Admin; nach dem Löschen spätestens nach 15 Sekunden abgemeldet („abgelaufen“) |
| X08 | eine Fundus-Datei anhängen und befragen; Reiter „Prompts“ | Fundus wird aus dem Deployment gelesen, Anhang bereit, Antwort; der Reiter „Prompts“ hat Einträge |
| X09 | Gast schreibt sich selbst eine Mail, verbindet den Posteingang und fragt Claude Haiku („Niedrig“) nach dem Betreff; meldet sich ab | Antwort nennt den Betreff, Karte „Gelesene E-Mails“; nach erneuter Anmeldung ist das Postfach geleert (übersprungen, wenn der Posteingang ausgeschaltet ist) |
| X10 | Live: zwei Gäste einer Gruppe, A startet einen Gruppenchat mit B, beide posten eine Notiz, B fragt `@Freebie` (Claude Haiku, „Niedrig“) nach einer Zusammenfassung | Antwort nennt beide Notizen; nach dem Löschen des Termins ist der Chat weg (< 0,01 $; übersprungen, wenn der Schalter aus ist) |
| X11 | Live: Kursleitung legt eine Kategorie und einen Prompt mit Platzhalter an, Gast füllt die Maske, sendet an Claude Haiku („Niedrig“) | Antwort nimmt den eingesetzten Wert auf; Prompt und Kategorie danach gelöscht (< 0,01 $; übersprungen, wenn der Schalter aus ist) |

Geschätzte Kosten: unter 0,10 $ pro Lauf.

### Y · Fundus (erfundene Beispieldateien und E-Mails)

Neben der Büroklammer öffnet ein Datenbank-Symbol den Fundus: erfundene Word-, Excel- und PowerPoint-Dateien sowie
E-Mail-Verläufe aus neun Verwaltungen, die sich wie Uploads anhängen lassen (Plan: [FUNDUS-PLAN.md](FUNDUS-PLAN.md)).
Dazu kommen eigene Dokumente (auch PDF) und Verläufe der Kursleitung unter „Eigene Inhalte“ sowie der Reiter „Prompts“
(Bereiche FP und PR, Plan: [FUNDUS-PFLEGE-PLAN.md](FUNDUS-PFLEGE-PLAN.md)). Y22–Y26 ändern den Fundus und laufen
deshalb im Projekt `admin`; Y03/Y04 bleiben im parallelen Projekt `chat` (dort gibt es keine eigenen Einträge).
Unit-Tests prüfen zusätzlich Weltmodell, Generator (feste Prüfsummen), Auslesbarkeit, Formeln und den
„Erfunden“-Wächter über alle Dateien (`tests/unit/library.test.ts`, `tests/unit/extract-mail.test.ts`).

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| Y01 | Datenbank-Symbol neben der Büroklammer | sichtbar mit Namen und Tooltip, direkt nach der Büroklammer; öffnet den Fundus; fehlt bei ausgeschaltetem Fundus, gesperrt bei Pause (Q21) |
| Y02 | Dialog schließen per X, Esc und Klick daneben | Fokus zurück auf das Symbol; Reiter und Suche bleiben beim erneuten Öffnen erhalten |
| Y03 | Katalog | Anzahl je Reiter wie in der API; alle Verwaltungen und ihre Einheiten im Filter; mindestens 60 Word-, 50 Excel- und 40 PowerPoint-Dateien und 40 Verläufe, alle Verwaltungsebenen |
| Y04 | Filter Verwaltung → Einheit (samt Untereinheiten), Typ, Merkmal | Trefferliste und -zahl stimmen; Einheit leert sich beim Wechsel der Verwaltung; „Keine Treffer.“; „Filter zurücksetzen“ |
| Y05 | Suche nach Titel, Stichwort, Einheit und Person | Groß/klein, ä/ae und ß/ss egal; zusammen mit Filtern |
| Y06 | Vorschau Word, Excel, PowerPoint | Briefkopf mit Signet, Aktenzeichen, Fiktiv-Hinweis; Tabelle mit formatierten Zahlen und Blattreitern; Folien mit Diagramm und Sprechernotizen; Eckdaten mit Token-Schätzung |
| Y07 | Herunterladen | richtiger Dateiname; die Datei ist eine gültige Word- bzw. Excel-Datei mit dem erwarteten Inhalt; E-Mails als `message/rfc822` |
| Y08 | Je ein Word-, Excel- und PowerPoint-Dokument anhängen | Chip „Fundus · ca. n Tokens“, Token-Summe, Fokus im Eingabefeld; das Modell bekommt den Inhalt |
| Y09 | Mehrfachauswahl und Grenze | „3 Dateien anhängen“; bei 18 Anhängen nur noch 2 wählbar mit Hinweis; zusammen 20 Anhänge |
| Y10 | Bereits angehängte Datei | als „angehängt“ markiert, nicht wählbar, „Bereits angehängt“; nach dem Entfernen wieder frei |
| Y11 | Katalog lädt nicht; Entfernen während des Holens; Serverfehler | Meldung mit „Erneut versuchen“; Anfrage wird abgebrochen; Fehler-Chip blockiert das Senden nicht |
| Y12 | E-Mail-Reiter | Verläufe neueste zuerst; Filter nach Verwaltung; Suche nach Betreff und Absenderadresse |
| Y13 | Verlauf öffnen | alle Mails mit Von, An, Cc, Datum, Betreff und Anhängen |
| Y14 | Einzelne E-Mail anhängen | das Modell bekommt Absender, Empfänger, Datum, Betreff und Text |
| Y15 | Ganzen Verlauf anhängen | eine Datei (jüngste Mail mit Zitatverlauf); das Modell bekommt alle Mails, jüngste zuerst |
| Y16 | „Anhänge mitnehmen“ an bzw. aus | an: Mail plus Dokumente als eigene Anhänge (beim ganzen Verlauf die Dokumente aller Mails); aus: nur die Mail, Anhänge werden darin genannt |
| Y17 | Fundus-Anhänge im Verlauf | bleiben bei „Neu generieren“, im Markdown-Export („(Fundus)“), nach dem Neuladen und beim Bearbeiten |
| Y18 | Caches | zweites Anhängen aus dem Datei-Cache; gleiche Frage mit gleicher Datei im neuen Chat aus dem Antwort-Cache; ohne Datei-Cache-Eintrag liest der Server die Datei neu aus |
| Y19 | Nur Tastatur und axe (hell und dunkel) | Reiter mit Pfeiltasten, Liste mit Pfeilen/Pos1/Ende, Leertaste wählt, Enter hängt an; keine schweren axe-Befunde in Liste, allen Vorschauen und E-Mails |
| Y20 | Handy und Tablet | Handy: Vollbild, Filter einklappbar, Liste → Vorschau → Zurück, kein seitliches Scrollen; Tablet: Liste und Vorschau nebeneinander |
| Y21 | Fundus-API | 401 ohne Sitzung; ETag/304; Vorschau für Dokument, Verlauf und E-Mail; ungültige IDs und Pfad-Tricks 400, unbekannte 404; Download mit Sandbox-CSP und `nosniff`; Upload-Wege lehnen `library/`- und `fundus/`-Pfade ab, `/api/files` liefert Gästen keine `fundus/`-Dateien; Katalog mit Kategorien und Prompts, ETag mit Revision |
| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| Y22 | Eigene Dokumente im Chat | im Reiter „Dokumente“ mit Zahl; Verwaltung „Eigene Inhalte“ im Filter; Typ-Chip „PDF“; Merkmale; Vorschau (Text, Tabellen, Folien); Download byte-gleich; Anhängen → Chip „Fundus · ca. n Tokens“, das Modell bekommt den Inhalt |
| Y23 | Eigene Verläufe im Chat | Reihenfolge nach Datum, einzelne Mail, ganzer Verlauf, „Anhänge mitnehmen“ |
| Y24 | Ausgeblendet, inaktiv, gelöscht | ausgeblendet und inaktiv fehlen in Auswahl und API (404); schon angehängt bleibt im Chat nutzbar (Neu generieren); gelöscht → statt des Inhalts nur noch der Hinweis „… ist nicht mehr verfügbar“ |
| Y25 | Neuer Stand ohne Neuladen | Kursleitung ändert, Gast öffnet den Fundus erneut → neuer Stand (200 statt 304); gewählte, inzwischen gelöschte Einträge fallen mit Hinweis aus der Auswahl |
| Y26 | Text nach Ablauf des Datei-Caches | ohne Eintrag im Datei-Cache (unbekannte Prüfsumme, wie nach dem Aufräumjob) geht der eigene Fundus-Anhang weiter mit Inhalt (aus der Datenbank) ans Modell – im Chat und im Gruppenchat |

### Z · Posteingang und Verbindung „Posteingang“

Übungs-Postfach je Gast (Plan: `POSTEINGANG-PLAN.md`). Jeder Test legt einen eigenen Termin an; Mails gehen nur an die
eigene Gruppe und die Kursleitung. Neue Mails kommen per Abfrage alle 15 Sekunden – die Tests spulen die Uhr im
Browser vor.

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| Z01 | Posteingang über den Umschalter öffnen; „Adresse kopieren“ | Ordner, eigene Adresse, Begrüßungs-E-Mail, Zähler; `?ansicht=posteingang` bleibt nach dem Neuladen; eine laufende Chat-Antwort läuft weiter |
| Z02 | Gast A schreibt Gast B (zwei Browser) | B sieht die Mail ohne Neuladen: Zähler am Umschalter, Hinweis im Chat mit „Öffnen“; A hat sie unter „Gesendet“ |
| Z03 | Lesen, „Als ungelesen markieren“, Löschen (abbrechen/bestätigen) | Zähler stimmen; Löschen entfernt nur die eigene Kopie; kein falscher Hinweis „Neue E-Mail“ |
| Z04 | Antworten, Allen antworten, Weiterleiten | „AW:“/„WG:“, Zitat mit Kopfzeile, Empfänger vorbelegt, Fokus im richtigen Feld |
| Z05 | Schreiben: Adressbuch und Prüfungen | Vorschläge beim Tippen (nur eigene Gruppe und Kursleitung), „Alle in meiner Gruppe“, Cc, an sich selbst; fremde Gruppe, fremde Adresse, fehlender Empfänger: deutsche Meldungen, nichts verschickt; Verwerfen mit Rückfrage; Enter im Betreff springt in den Text; Strg+Enter sendet |
| Z06 | Suche und Ordner | Treffer in Absender und Text; „Keine Treffer.“; „Gesendet“ zeigt Empfänger und Anzahl |
| Z07 | Darstellung des Inhalts | HTML, Skripte und Markdown erscheinen als Text (kein Skript läuft); Zitate, Umlaute, Emoji; Zeitangaben |
| Z08 | Abmelden | Rückfrage nennt Chats und Posteingang; Postfach danach leer; Mails an andere bleiben bei diesen; neue Anmeldung: nur die Begrüßung |
| Z09 | „Jetzt beenden“, Termin, Gast oder Gruppe löschen, „Alle abmelden“, Aufräumjob | Postfächer des Termins weg, auch die Kopien bei der Kursleitung; an Gelöschte geht nichts mehr; „Alle abmelden“ lässt die Postfächer stehen (keine zweite Begrüßung); der Aufräumjob meldet die gelöschten Mails |
| Z10 | Verbindung im Chat | Menü „Verbindungen“ (auch per Tastatur), Zustand pro Chat gemerkt, neuer Chat startet ohne; Trennlinie „verbunden/getrennt“; Mock-Diagnose; ohne Verbindung ein Hinweis statt Inhalt, auch wenn das Modell es trotzdem versucht |
| Z11 | Karten „Gelesene E-Mails“ und „Mit Freebie besprechen“ | Karten öffnen die Mail, gelöschte Mail → Hinweis; Markdown-Export nennt die Mails; der Knopf startet einen neuen Chat mit Verbindung und vorbereiteter Frage (nicht gesendet) |
| Z12 | Datenschutz der Verbindung | Freebie sieht nur das eigene Postfach (fremde ID → „nicht gefunden“); gleiche Frage zweier Gäste nie aus dem Antwort-Cache; Lesen durch Freebie ändert „ungelesen“ nicht |
| Z13 | Kursleitung | eigenes Postfach ohne Begrüßung; Antwort an einen Gast; Rundmail an eine Gruppe über das Adressbuch (Termin · Gruppe); Gäste aus zwei Terminen in einer Mail → Meldung; Abmelden fragt nach und leert das Postfach |
| Z14 | Handy und Tablet (`@mobil`, `@tablet`) | Menü → Posteingang, Liste → Lesen → zurück; Schreiben im Vollbild; „Neue E-Mail“ erreichbar; kein seitliches Scrollen |
| Z15 | Barrierefreiheit | keine „serious“/„critical“-Befunde von axe im Posteingang, Lesebereich, Schreiben-Dialog (mit Adressbuch) und Menü „Verbindungen“, hell und dunkel; Esc schließt erst die Vorschläge, dann den Dialog |
| Z16 | API des Posteingangs | 400 mit deutscher Meldung (Felder, Grenzen, Adressen), 404 für fremde und unbekannte IDs (fremde Mail bleibt unverändert), 403 bei fremder Origin, 429 ab der 21. Mail pro Minute, Adressbuch nur mit eigener Gruppe, Suche mit `%`/`_` wörtlich; Not-Aus: Lesen geht, Senden 503 |
| Z17 | Freebie verschickt Mails | mit Verbindung und Auftrag von der eigenen Adresse: beim Empfänger „über Freebie“, in „Gesendet“, Karte „Gesendete E-Mails“; fremde Gruppe → Werkzeug-Fehler; ohne Verbindung nichts; höchstens 5 pro Antwort; „Neu generieren“ fragt nach |
| Z18 | Adressen aus dem Mailprogramm (Anzeigename in Anführungszeichen, `mailto:`, Punkt oder Komma am Ende, mehrere mit Namen) | werden erkannt; fremde Adressen mit Meldung, welcher Teil nicht passt |

### GC · Gruppenchats

Teilnehmende einer Gruppe chatten gemeinsam, Freebie antwortet auf „@Freebie“ (Plan: `GRUPPENCHAT-PLAN.md`). Das
Kürzel ist zweistellig, weil alle 26 Buchstaben vergeben sind. Jeder Test legt einen eigenen Termin an; die Abfrage
(4 Sekunden im offenen Chat, 15 Sekunden für Einladungen) spulen die Tests mit der Browser-Uhr vor. Die Mock-Diagnose
nennt im Gruppenchat Zahl und Autoren der Beiträge der Runde („Gruppenchat: 2 Beiträge von …“).

Angepasst wurden dafür: **A10** (GC13: Rückfrage nennt die Gruppenchats), **E04/E06** (Abschnitt „Gruppenchats“, Suche
am Namen, statt Papierkorb „Verlassen“ bzw. „Für alle löschen“), **E08** (GC15: Gruppenchats im Export), **M03** (GC12:
Gruppenchats nie im Antwort-Cache), **N01/N03** (GC16/GC17), **Z10** (GC11: im Gruppenchat kein Menü „Verbindungen“),
**U01–U03** (neue Routen), **V05** (Abschnitt im System-Prompt bricht den Präfix privater Chats nicht), **X** (X10).

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| GC01 | Gruppenchat starten: Symbol neben „Neuer Chat“, Dialog mit Name, Suche, „Alle auswählen“; Prüfungen (leerer oder zu langer Name, niemand gewählt) | Chat oben unter „Gruppenchats“, Kopfzeile mit Name und Avataren, Systemzeile „… hat … eingeladen“; deutsche Meldungen |
| GC02 | Einladung kommt an (zwei Browser) | B sieht den Chat ohne Neuladen mit Hinweis und „Öffnen“, Punkt in der Seitenleiste und am Umschalter „Chat“; C aus derselben Gruppe, aber nicht eingeladen, sieht nichts |
| GC03 | Beiträge untereinander | A postet, B sieht ihn binnen Sekunden links mit Avatar und Name, eigene rechts; ohne `@Freebie` keine Anfrage an den Anbieter (Fake-API zählt 0) und keine Kosten; Reihenfolge stimmt bei gleichzeitigem Posten |
| GC04 | `@Freebie` | Vorschlagsliste bei `@` (Maus und Tastatur); Freebie antwortet mit Bezug auf die Beiträge aller (Mock-Diagnose nennt Autoren und Zahl); fragende Person sieht den Stream, die anderen „Freebie antwortet …“ und dann die fertige Antwort auf einmal (keine Zwischenstände); Kosten bei der fragenden Person (Termin und Gruppe) |
| GC05 | Zwei Personen fragen gleichzeitig | eine Antwort, zweite Anfrage mit „Freebie antwortet gerade …“; normale Beiträge gehen weiter und stehen hinter der Antwort; sie gehören zur nächsten Runde |
| GC06 | Stoppen, Fehler, Neu generieren, hängengebliebene Antwort | Stoppen nur für die fragende Person; Fehler bei allen sichtbar; „Neu generieren“ nur an der letzten Antwort, solange danach nichts kam; nach Abbruch des fragenden Browsers ist der Chat nach der Frist wieder frei |
| GC07 | Mitglieder verwalten | nachträglich einladen, entfernen (Rückfrage), umbenennen; Entfernte können nicht mehr schreiben und lesen nur bis zum Zeitpunkt des Entfernens (die API liefert nichts Späteres); erneut eingeladen sehen sie wieder alles; Systemzeilen; nur die startende Person hat diese Knöpfe |
| GC08 | Verlassen und für alle löschen | Verlassen mit Rückfrage; danach „verlassen“ in der Seitenleiste, Verlauf bis zum Verlassen lesbar, keine Eingabeleiste; spätere Beiträge und Freebie-Antworten kommen nicht an (auch nicht über API und Statusabfrage); „Aus meiner Liste entfernen“; die startende Person hat kein „Verlassen“ (API 403); „Für alle löschen“ → bei allen weg, auch bei Verlassenen, offene Ansicht wechselt sauber zu „Neuer Chat“ |
| GC09 | Kursleitung führt vor | Symbol auch für die Kursleitung; Dialog mit Auswahl „Gruppe“, Personenliste nur dieser Gruppe; Personen aus zwei Gruppen in einem Chat → Meldung, nichts angelegt; Gäste können die Kursleitung nicht einladen; Abmelden der Kursleitung lässt ihre Gruppenchats bestehen |
| GC10 | Nur die eigene Gruppe | Auswahl zeigt nur die eigene Gruppe; API lehnt Gäste anderer Gruppen, anderer Termine, abgelaufene Gäste und „kursleitung“ ab (Meldung, nichts angelegt) |
| GC11 | Anhänge, Fundus, Websuche, Artefakte | Datei von A ist bei B sichtbar, Freebie bekommt den Inhalt; Artefakt-Panel bei allen; „Verbindungen“ und „Bild-Modus“ werden nicht angeboten |
| GC12 | Datenschutz | Posteingang nie verbunden, auch wenn das Modell es versucht (Werkzeug-Fehler mit Hinweis); nie aus dem Antwort-Cache und nie hinein; fremde Chat-IDs 404; Nicht-Mitglieder erfahren über `/api/status` nichts |
| GC13 | Abmelden und „Alle abmelden“ | Rückfrage nennt die Gruppenchats; private Chats wie bisher vom Gerät gelöscht; nach erneuter Anmeldung (auch in neuem Browser) sind die Gruppenchats wieder da; nächster Gast am selben Gerät sieht sie nicht |
| GC14 | Termin-Ende, „Jetzt beenden“, Gast, Gruppe oder Termin löschen, Aufräumjob | Gruppenchats des Termins weg; Beiträge eines gelöschten Gasts bleiben mit Namen; hat er den Chat gestartet, ist der Chat weg; der Aufräumjob meldet die Zahl |
| GC15 | Export | Warnung vor dem Ende und „Export“ nehmen die Gruppenchats mit; Import ergibt private Chats mit Autoren; Markdown-Export und Drucken nennen die Autoren |
| GC16 | Handy und Tablet (`@mobil`, `@tablet`) | Abschnitt in der Leiste, Dialoge im Vollbild, Personen-Symbol in der Kopfzeile, Vorschlagsliste erreichbar, kein seitliches Scrollen |
| GC17 | Barrierefreiheit | keine „serious“/„critical“-Befunde von axe in Start- und Mitglieder-Dialog, Vorschlagsliste und Gruppenchat, hell und dunkel; Beiträge heißen „Nachricht von wolke83“; Esc schließt erst die Vorschläge, dann den Dialog; Fokus kehrt zurück |
| GC18 | API der Gruppenchats | 401, 403 (Schalter aus, fremde Origin, Schreiben nach dem Verlassen, startende Person verlässt), 400 mit deutscher Meldung (Felder, Grenzen), 404 (fremde und unbekannte IDs, fremder Beitrag bleibt unverändert), 409 (laufende Antwort), 429 (Senderate); Not-Aus: Lesen geht, Schreiben und Freebie 503 |
| GC19 | Neues und Abfrage | Punkt verschwindet beim Öffnen, eigene Beiträge zählen nicht; Hinweis nur bei Einladungen; Abfrage nur bei sichtbarem Tab, schneller im offenen Chat, langsamer bei Ruhe (Uhr vorgespult) |
| GC20 | Grenzen | 30 Mitglieder, 10 eigene Chats, 1.000 Beiträge, 50.000 Zeichen: verständliche Meldungen, nichts halb angelegt |

### FP · Fundus pflegen (Admin)

Die Kursleitung lädt eigene Dokumente und E-Mail-Verläufe hoch, blendet mitgelieferte Einträge aus und legt Prompts
mit Platzhaltern in Kategorien an (Plan: [FUNDUS-PFLEGE-PLAN.md](FUNDUS-PFLEGE-PLAN.md)). Alle Tests ändern den Fundus
und laufen im Projekt `admin` (serieller Server); `restore()` löscht danach eigene Einträge samt Dateien, blendet alles
ein und stellt Kategorien und Start-Prompts samt Reihenfolge wieder her. Neue Testdateien (`generate-files.ts`,
Version 5): `verlauf-1.eml` bis `verlauf-3.eml`, `ohne-datum.eml`, `doppelt.eml`, `kaputt.eml`, `echte-daten.docx`,
`nur-bild.docx`. Seitenobjekte: `FundusAdminPage`, `PromptMask`, `PromptsTab` (`support/fundus.ts`).

Angepasst wurden dafür: **Q21** (Fundus aus: keine Prompts, Pflege im Admin mit Hinweis), **O01** (Reiter „Fundus“),
**Y21** (`fundus/`-Pfade, Kategorien und Prompts im Katalog), **U01–U03** (neue Routen), **W07** (Prompt-Aktionen),
**X08** (Reiter „Prompts“ hat Einträge).

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| FP01 | Reiter „Fundus“ | Unterreiter, Zahlen, Listen mit „eigen/mitgeliefert/ausgeblendet/inaktiv“, Suche und Auswahl; Hinweis, wenn der Schalter aus ist |
| FP02 | Dokumente hochladen: Word, Excel, PowerPoint, PDF, mehrere auf einmal, per Auswahl und Ablegen | Fortschritt je Datei; Prüfschritt mit Typ, Tokens, Länge, Vorschau; gemeinsame und einzelne Angaben; nach dem Speichern in der Liste und im Chat (Y22) |
| FP03 | Prüfungen beim Hochladen | `.doc`, `.msg`, `.exe`, Bild → Meldung mit Tipp; PNG als `.docx` erkannt; leer, kaputt, Zip-Bombe, ohne lesbaren Text (422); zu groß (413) über die API in FP16; fehlerhafte Datei bleibt mit Meldung stehen, die anderen werden gespeichert |
| FP04 | Dubletten, Doppelklick, Abbruch | dieselbe Datei erneut → „gibt es schon als …“, nichts doppelt; Doppelklick auf „Speichern“ legt einmal an; Abbrechen während des Uploads hinterlässt keinen Eintrag (dass der Aufräumjob die vorgemerkte Datei löscht: Unit `fundus-katalog.test.ts`) |
| FP05 | Hinweis auf echte Daten | `echte-daten.docx` → Warnung je Fundstelle; „Speichern“ erst mit Bestätigung (immer nötig); API ohne Bestätigung 400 |
| FP06 | E-Mail-Verlauf hochladen | drei `.eml` in falscher Reihenfolge → nach Datum sortiert; Titel ohne „AW:“/„WG:“; Beteiligte; docx-Anhang als Dokument des Verlaufs; im Chat wie mitgelieferte Verläufe (Y23) |
| FP07 | Prüfungen Verlauf | `.msg` mit Tipp; Datei ohne Kopfzeilen (422); doppelte Mail; Mail ohne Datum (Hinweis, Stelle der Auswahl); mehr als 50 Mails; nicht unterstützte Anhänge nur genannt; kodierte Betreffs und Umlaute korrekt |
| FP08 | Eigene Einträge bearbeiten (Dokumente und Verläufe) | Titel, Datum, Merkmale, Stichwörter, Beschreibung, Aktiv; Wirkung im Chat beim nächsten Öffnen; ein abgeschalteter Verlauf nimmt seine Anhänge mit; Prüfsumme und Datei unverändert, Download im Admin |
| FP09 | Eigene Einträge löschen | Rückfrage nennt die Anhang-Dokumente eines Verlaufs; Datei und Zeilen weg (Download 404); Verlauf nimmt seine Anhänge mit; Anhang-Dokument einzeln 409; Prompts bleiben unberührt |
| FP10 | Mitgelieferte ausblenden | kein Bearbeiten und Löschen (API 404); Vorschau im Admin auch ausgeblendet; einzeln aus- und einblenden, „Alle einblenden“; ausgeblendet fehlt im Chat-Katalog und beim Anhängen (404) |
| FP11 | Kategorien | anlegen, umbenennen, nach oben/unten (Maus und Tastatur); doppelter Name (auch „Einfache sprache“, „Einfache Sprache “) abgelehnt; leer oder zu lang; Löschen nur leer (409 nennt die Zahl) |
| FP12 | Prompt anlegen | Titel, Kategorie (auch „Neue Kategorie …“ im Dialog), Beschreibung, Text; Platzhalter-Tabelle erscheint beim Tippen; je Platzhalter Beschriftung, Hinweis, Art, Auswahlwerte, Standardwert (keine Einstellung „Pflicht“); Probe-Maske; nach dem Speichern im Chat |
| FP13 | Prompt-Prüfungen | Titel, Kategorie oder Text fehlt, Text über 8.000 Zeichen, ungültiger Name, `{{` ohne `}}` (Warnung mit Stelle), 21 Platzhalter, Auswahl ohne bzw. mit zu vielen Werten, Standardwert nicht in der Auswahl, Hinweis „ohne Platzhalter“; Einstellung eines kurz entfernten Platzhalters bleibt bis zum Speichern |
| FP14 | Prompts ordnen und pflegen | nach oben/unten innerhalb der Kategorie, Kategorie wechseln, deaktivieren, löschen (Rückfrage) |
| FP15 | Startbestand | frische Installation: 12 Prompts in 6 Kategorien; alle löschen, Server neu starten → bleibt leer (eigener Server, zusammen mit FP17); Start-Prompts frei bearbeitbar (FP14) |
| FP16 | Admin-API des Fundus | 401, 403 (Gast, fremde Origin), 400 mit deutscher Meldung (Felder, Grenzen, IDs, Schlüssel außerhalb `fundus/`, ungeprüfte Schlüssel), 404, 409, 413, 422; während der Pause geht die Pflege |
| FP17 | Speicher und Aufräumjob | Aufräumjob: eigene Fundus-Dateien und Texte bleiben (abgelaufene vorgemerkte Uploads gehen: Unit); nach Neustart ist alles da; Gäste erreichen `fundus/` weder über `/api/files` noch über die Upload-Wege (400) |
| FP18 | Grenzen | 500 Prompts, 50 Kategorien, 20 Platzhalter, 20 Dateien je Upload: verständliche Meldungen, nichts halb angelegt (Dokumente und Verläufe: Unit-Test) |
| FP19 | Barrierefreiheit und Tastatur | axe ohne „serious/critical“ für Reiter, Upload-, Verlauf-, Prompt- und Kategorien-Dialog, hell und dunkel; Platzhalter-Tabelle per Tastatur; Fehler mit `aria-invalid` und `aria-describedby`; Fokus kehrt zurück |

### PR · Prompts im Chat

Der Fundus hat einen dritten Reiter „Prompts“. Mit Platzhaltern öffnet ein Prompt die Maske „Prompt ausfüllen“: jedes
Feld ist Pflicht, erst danach steht der fertige Text im Eingabefeld (gesendet wird nichts automatisch). Die Tests lesen
nur den Startbestand (12 Prompts in 6 Kategorien) und laufen in `chat`, `mobile`, `tablet`, WebKit und Firefox.

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
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

## 5. Abdeckungsmatrix

`tests/e2e/coverage.json` ordnet jeder Einstellung (aus `lib/shared/settings-defaults.ts`), jeder API-Route (aus
`app/api`) und jedem Bedienelement Test-IDs zu. `npm run test:coverage` prüft in der CI in beide Richtungen:
jede Katalog-ID aus Abschnitt 4 hat einen Test, jede neue Einstellung und Route steht in der Matrix, und jede dort
genannte ID gibt es als Test. Neue Einstellungen oder Routen ohne Test machen die CI rot.
`node tests/e2e/coverage.mjs --markdown` gibt die Matrix ID → Tests als Tabelle aus.

Kürzel sind ein oder zwei Großbuchstaben plus zwei Ziffern (`A01`, `GC04`); Testnamen dürfen mehrere IDs tragen
(`GC15/E08 …`), Tabellen Bereiche (`Q02–Q10`, `GC01–GC20`). Die Erkennung steht in `tests/e2e/coverage-ids.mjs` und hat
einen eigenen Unit-Test (`tests/unit/coverage-ids.test.ts`).

## 6. Bei der Inventur gefundene Fehler

Alle behoben, jeweils mit Regressionstest (Stand 9. Oktober 2026). Live wirksam erst nach dem Merge nach `main`.

| # | Fehler | Status | Abgesichert durch |
|---|---|---|---|
| 1 | Blob-Speicher wurde nicht erkannt (neue Stores melden sich per OIDC an) | behoben, nach Deploy live zu bestätigen | Unit `storage.test.ts`, O04, X01 |
| 2 | Effort-Stufe im Admin entfernen: Speichern scheitert immer | behoben | P04 |
| 3 | Funktionsschalter und Not-Aus serverseitig nur teilweise durchgesetzt | behoben (`lib/guards.ts`) | Q01–Q06 |
| 4 | Lokaler Upload nimmt Pfade unter `images/` und `audio/` an | behoben | U04 |
| 5 | Schalter „Artefakte“ wirkt nur auf das automatische Öffnen | behoben | Q07/K07 |
| 6 | Import einer unvollständigen Datei bringt die Chat-Suche zum Absturz | behoben | E08 |
| 7 | Antwort-Cache berücksichtigt geänderte Modell-Fähigkeiten nicht | behoben | Unit `answer-cache.test.ts` |
| 8 | „PDFs nativ“ im Code nie erreichbar | eingebaut, standardmäßig aus | Q17 (Mock und Fake-API) |
| 9 | Ausgelesene Texte und Transkripte werden nie gelöscht | behoben | U05, Q13 |
| 10 | 500 statt 400, englische Validierung, „Failed to fetch“ | behoben | U03, P02, Q12, C11, W02 |
| 11 | Interne Meldungen („OPENAI_API_KEY fehlt“) in der Oberfläche | behoben | P07, V04 |
| 12 | Standardmodell deaktivier-/löschbar, Titelmodell kann deaktiviert sein | behoben | P06, Q16 |
| 13 | Unsichtbare alte Anhänge beim Bearbeiten, „Neu generieren“ mit falschem Modell, Websuche pro Chat, Artefakt-Karte öffnet neueste Version | behoben | C07, C06, E05, K04 |
| 14 | Während einer Antwort: Modellwechsel möglich, „Neuer Chat“/Chatwechsel stumm, Löschen hinterlässt Zustand | gesperrt bzw. behoben | D10, E01, E06 |
| 15 | Bei Pause oder ohne Modell bleiben Anhänge, Diktat, Websuche, Bild aktiv | behoben | Q01, D08 |
| 16 | Anhang entfernen bricht Upload nicht ab; Limits nur als „Ungültige Anfrage.“ | behoben | F05, C13, I05, U03 |
| 17 | Drag-Overlay bleibt hängen; Fehler im Bild-Dialog bleibt stehen | behoben | F06, I02 |
| 18 | Abmelden, Löschen von Modellen/Vorlagen, Admin-Login ohne Fehlerbehandlung | behoben | A10, P06, R01, O01 |
| 19 | Login-Bremse: gemeinsamer Zähler; IP aus fälschbarem Header | getrennte Zähler; auf Vercel setzt die Plattform den Header | A07, W04 |
| 20 | Fehlende Namen und Zustände für Screenreader, Menüs nicht per Tastatur | behoben | N02–N04, D09 |
| 21 | Übersicht: falscher Hinweis zur Secret-Länge, zwei Formeln für die Cache-Quote, Tage in UTC | behoben | O03, O04 |
| 22 | Schalter „System-Nachrichten im Verlauf“ ohne Wirkung | aus der Oberfläche entfernt | P03 |

**Beim Testen zusätzlich gefunden und behoben**

| # | Fehler | Abgesichert durch |
|---|---|---|
| 23 | Abgebrochene Verbindung zum Anbieter zeigte „Es ist ein Fehler aufgetreten: terminated“ | V04 |
| 24 | OpenAI-400er zeigten „400 …“ statt der eigentlichen Ursache | V04, Unit `errors.test.ts` |
| 25 | Überlanges Passwort (> 4.000 Zeichen) meldete „Bitte ein Passwort eingeben.“ | U03 |
| 26 | Admin-Einstellungen ignorierten unbekannte Felder still (Tippfehler blieben unbemerkt) | U03 |
| 27 | Seite während einer Antwort neu geladen: Chat endete stumm mit der Frage | W02 |
| 28 | Login-Bremse (30) konnte eine Schulungsgruppe hinter einer IP aussperren → 50 | A07, W04 |
| 29 | Abgelaufener Eintrag im Antwort-Cache blockierte neue Einträge bis zum nächtlichen Aufräumen | Unit `db.test.ts` |
| 30 | Admin-Bereich: Kontrast von Erfolgs- und Gefahrenfarbe, Diagramm-Balken ohne Rolle | N02/N03 |
| 31 | Tabs im Admin zeigten veraltete Zahlen (kein Neuladen beim Wechsel) | O02 |
| 32 | Safari/WebKit lehnte das Secure-Cookie über http ab (nur lokal, nicht auf Vercel) – Secure richtet sich jetzt nach dem Protokoll, auf Vercel immer an | A05, U01, `chat-webkit` |
| 33 | Firefox: SVG-Artefakte ohne Größenangabe blieben in der Vorschau unsichtbar | K03 in `chat-firefox` |
| 34 | Vor dem Laden getipptes oder automatisch ausgefülltes Passwort (Safari, Passwortmanager): Button blieb gesperrt | A04 |

**Beim Testen des Posteingangs gefunden und behoben** (10. Oktober 2026)

| # | Fehler | Abgesichert durch |
|---|---|---|
| 35 | Nach dem Löschen der neuesten Mail meldete der Chat fälschlich „Neue E-Mail von …“ (die ältere rückte nach) | Z03 |
| 36 | Der Aufräumjob meldete gelöschte Mails fast immer als 0 (sie verschwanden vorher mit den Zugängen) | Z09 |
| 37 | Hinweis „Übungs-Postfach“: Gelb auf hellem Gelb mit zu wenig Kontrast | Z15 |
| 38 | „Neue E-Mail“ auf dem Handy nicht im Vollbild (der Browser begrenzt Dialoge) | Z14 |
| 39 | Alter Link „?ansicht=posteingang“ öffnete bei ausgeschaltetem Posteingang kurz die leere Ansicht | Q22 |
| 40 | Ordner-Knopf „Posteingang 1“ ohne sauberen Namen für Screenreader | Z01 |
| 41 | Import: kaputte Felder für Verbindungen und Mail-Karten konnten die Anzeige zum Absturz bringen | E08 |

**Beim Bau der Gruppenchats gefunden und behoben** (13. Oktober 2026)

| # | Fehler | Abgesichert durch |
|---|---|---|
| 42 | Die Postfach-Werkzeuge nannten die Adresse der fragenden Person – im Gruppenchat brach so jede Frage eines anderen Mitglieds den Prompt-Cache | V08 |
| 43 | Hinweise oben im Chat (z. B. „… hat dich in „…“ eingeladen“) wurden auf dem Handy auf halbe Breite abgeschnitten statt umzubrechen | GC16 |
| 44 | Die Zahl im Reiter des Fundus-Dialogs war durch Transparenz zu blass (Kontrast 3,6 : 1); in der CI seit dem Fundus-Ausbau rot, lokal unauffällig | Y19 |

**Grenzfälle der Teilnehmenden, Phase 1** (14. Oktober 2026, Plan: [GRENZFAELLE-PLAN.md](GRENZFAELLE-PLAN.md))

| # | Fehler | Abgesichert durch |
|---|---|---|
| 45 | Gast-Passwort mit kopiertem Leerzeichen oder großem Anfangsbuchstaben (iPad) abgelehnt – und als Fehlversuch gezählt | A13, T21, Unit `eingaben.test.ts` |
| 46 | Login-Bremse: Anmeldungen mit richtigem Passwort vor der Freigabe zählten als Fehlversuche; „Passwort neu erzeugen“ hob eine Sperre nicht auf | T19, T20 |
| 47 | Doppelklick auf „Senden“ legte zwei Chats an bzw. stellte die Frage zweimal (doppelte Kosten); beim langsamen Doppelklick brach der zweite Klick als „Stoppen“ die Antwort ab | C21 |
| 48 | Doppelklick auf „Neu generieren“ erzeugte zwei Antworten | C22 |
| 49 | Einfügen aus Word, Excel oder PowerPoint: der Text verschwand, stattdessen hing ein Bild der Auswahl an | C16 |
| 50 | Dateinamen ohne lateinische Buchstaben vor der Endung: „Dieses Dateiformat wird nicht unterstützt.“ | F13, Unit `dateinamen.test.ts` |
| 51 | CSV aus deutschem Excel (Windows-1252): das Modell sah „M�ller“; UTF-16-Text und Nullbytes führten zu „interner Fehler“ | F14, F15, Unit `kodierung.test.ts` |
| 52 | Doppelklick aufs Mikrofon: die zweite Aufnahme lief nach „Stopp“ unbemerkt weiter und fügte Minuten später Text ein | H05 |
| 53 | Zugangsdaten vom Kärtchen oder aus der CSV in ein Feld eingefügt: beide landeten im Namensfeld | A14 |

**Grenzfälle der Teilnehmenden, Phase 2** (14. Oktober 2026)

| # | Fehler | Abgesichert durch |
|---|---|---|
| 54 | Auf iPad, Handy und Android-Tablet schickte Enter die Nachricht ab – Absätze waren ohne Hardware-Tastatur unmöglich | C19 |
| 55 | Während des Diktats Getipptes wurde durch den Stand vom Aufnahmebeginn ersetzt | H06 |
| 56 | „Bearbeiten“ und „Abbrechen“ löschten Entwurf und laufende Uploads; ein Beispiel überschrieb den Entwurf; beim Chatwechsel im Bearbeiten-Modus stand der alte Nachrichtentext im anderen Chat | C24–C26 |
| 57 | Datei neben die Ablagefläche fallen gelassen: der Browser öffnete sie anstelle von Freebie; Text ließ sich nicht ins Eingabefeld ziehen | F17, C20 |
| 58 | Import mit kaputten Anhängen, Quellen oder Bildern: weiße Seite beim Öffnen des Chats | E11, Unit `import.test.ts` |
| 59 | Fehlerseiten der Plattform erschienen als „Fehler 413“ bzw. „Fehler 504“ | C30, Unit `fehlermeldungen.test.ts` |
| 60 | Browser-Speicher voll: „Senden“ tat nichts, ohne Meldung | E16 |
| 61 | Zwei Tabs im selben Chat: Frage, Frage, Antwort, Antwort | E15 |

**Grenzfälle der Teilnehmenden, Phase 3** (14. Oktober 2026)

| # | Fehler | Abgesichert durch |
|---|---|---|
| 62 | Nullbyte im Text (z. B. aus einem PDF kopiert): die Antwort endete mit „Es ist ein Fehler aufgetreten: Failed query: insert into "answer_cache" …“ – interner SQL-Text im Chat | C18, Unit `kodierung.test.ts` |
| 63 | Cookies blockiert: die Anmeldung meldete Erfolg, man landete kommentarlos wieder auf der Anmeldeseite | A16 |
| 64 | Dieselbe Datei zweimal angehängt ging zweimal ans Modell (doppelte Kosten) | F12 |
| 65 | Falsche Formate (.doc, .heic, .msg, .zip …) nur mit „nicht unterstützt“ abgewiesen, ohne Tipp | F16, Unit `dateinamen.test.ts` |
| 66 | Adressen aus dem Mailprogramm (`"Name" <adresse>`, `mailto:`, Punkt am Ende) im Posteingang abgelehnt | Z18, Unit `mail-address.test.ts` |
| 67 | Lange Chats: kein Hinweis vorab; an der Grenze „Der Chat ist zu lang“ erst nach dem Senden bzw. die englische Meldung des Anbieters („prompt is too long“), über 4,5 MB eine Fehlerseite | W08, Unit `lange-chats.test.ts`, `errors.test.ts` |
| 68 | Abmelden während einer Antwort: Fehler „Kein Konto gewählt“ im Browser, danach noch eine Titel-Anfrage | C27 |
| 69 | Doppelklick auf „Export“ lud die Datei zweimal herunter; doppeltes Absenden der Anmeldung schickte zwei Anfragen; Import war während einer Antwort möglich | C23, A15, C27 |
| 70 | Falsche Datei beim Import: immer dieselbe allgemeine Meldung | E13, Unit `import.test.ts` |
| 71 | Seite während einer Antwort neu geladen, dann einfach weitergeschrieben: die erste Frage stand ohne Antwort und ohne Hinweis im Verlauf (gefunden vom Zufallstest, Seed 506) | C28, W07 |

**Testlücken-Analyse** (14. Oktober 2026): Code und Tests bereichsweise abgeglichen – was prüft kein Test wirklich?

| # | Fehler | Abgesichert durch |
|---|---|---|
| 72 | „Neu generieren“ im Gruppenchat von zwei Personen gleichzeitig: beide Anfragen liefen, das Modell wurde zweimal bezahlt, eine Antwort verworfen | Unit `groupchat-store.test.ts` |
| 73 | Zip-Bomben-Schutz nur nach Endung: eine ZIP-Datei als `.xls` oder `.csv` las SheetJS ungeprüft | Unit `extract.test.ts` |
| 74 | HTML-Artefakte mit `<header>`, aber ohne `<head>`: die CSP landete im Seiteninhalt und wurde ignoriert (Netzwerk und Formulare offen) | Unit `artifacts.test.ts` |
| 75 | Zehn Fehlversuche mit dem Namen der Kursleitung – von irgendwem, auch aus dem Schulungsnetz – sperrten sie 10 Minuten aus | A07, Unit `login-bremse.test.ts` |
| 76 | Überlastung mitten in einer Claude-Antwort (Fehler-Ereignis nach HTTP 200): „Es ist ein interner Fehler aufgetreten“ statt „überlastet“ | V04, Unit `errors.test.ts` |
| 77 | „Stoppen“, Verbindungsabbruch oder Fehler mitten in der Antwort: die bis dahin angefallenen Kosten fehlten in der Übersicht | Q10 |
| 78 | Uploads ohne Besitz: wer einen Upload-Pfad kannte (z. B. aus dem Gruppenchat), konnte die Datei überschreiben | U04 |

Dabei fielen vier Tests auf, die aus dem falschen Grund grün waren: U03/U04 an `/api/upload/token` (die 400 kam nur von
„kein Blob-Speicher“), U05/Q13 und T17 (prüften nur, dass eine Zahl zurückkommt) und GC14 (die Kursleitung war gar
nicht Mitglied). Jetzt prüfen sie die Wirkung: Unit `upload-token.test.ts`, `aufraeumen.test.ts`, `events-store.test.ts`
und `groupchat-store.test.ts`.

**Bekannte Grenze (77):** Bei GPT meldet die API die Eingabe-Tokens erst am Ende – bricht eine Antwort ab, zählt dort
nur die aus dem Text geschätzte Ausgabe. Bei Claude kommen Eingabe und Cache gleich zu Beginn und zählen exakt.

**Fundus pflegen** (15. Oktober 2026)

| # | Fehler | Abgesichert durch |
|---|---|---|
| 79 | Gruppenchat-Antworten auf Vercel: der mitgelieferte Fundus fehlte im Funktions-Bundle der Route `/api/groupchats/[id]/freebie` – nach Ablauf des Datei-Caches wäre ein Fundus-Anhang dort „nicht mehr verfügbar“ gewesen | `next.config.ts` (Tracing), Y26 |
| 80 | Dialoge, die die Seite beim Schließen entfernt statt schließt (z. B. „Vorlage bearbeiten“), gaben den Fokus nicht an den auslösenden Knopf zurück | FP19 |

**Bekannte Grenze:** Stellen viele Personen *exakt gleichzeitig* dieselbe Frage, verfehlen alle den Antwort-Cache,
weil noch keine Antwort fertig ist. Wer einige Sekunden später fragt, bekommt den Treffer (W04).

## 7. Entscheidungen

Alle Empfehlungen wurden übernommen (9. Oktober 2026) und umgesetzt. Punkt 5 ist eine Einstellung in Vercel und
liegt bei dir.

1. **Live-Tests mit echten Schlüsseln** gegen `freebie.stefanai.de`, nach jedem Deploy und auf Abruf
   (< 0,10 $ pro Lauf) – *Empfehlung: ja*
2. **Safari und Firefox** zusätzlich in der CI – *Empfehlung: ja*, wegen iPads in Schulungen
3. **Alle Fehler aus Abschnitt 6 beheben** – *Empfehlung: ja*, sonst ist „solide“ nicht erreichbar
4. **Verhalten festlegen**, wo der Code heute uneindeutig ist:
   - Während einer Antwort: Modellwahl, „Neuer Chat“ und Chatwechsel *sperren* (statt stillschweigend nichts zu tun)
   - „Neu generieren“ mit dem *ursprünglichen* Modell der Antwort
   - Websuche-Schalter *pro Chat merken*
   - „Empfohlenes Modell“ einer Vorlage *beim Wählen übernehmen* (statt das Feld zu entfernen)
   - „PDFs nativ“ *einbauen* (statt entfernen): fähige Modelle lesen Layout und Tabellen besser, kostet aber mehr
     Tokens – bleibt im Admin abschaltbar und standardmäßig aus
   - Login-Bremse *getrennt* für Teilnehmende und Admin
5. **Production-Branch in Vercel:** Die laufende Version wurde noch von meinem Arbeits-Branch deployt, neuere
   Pushes landen als Preview. Bitte prüfen, dass in Vercel `main` der Production-Branch ist; Änderungen gehen dann
   per Pull Request live. Für Live-Tests gegen Previews fehlen dort die Umgebungsvariablen (z. B. `ADMIN_PASSWORD`) –
   *Empfehlung:* sie auch für „Preview“ setzen, dann kann jede Änderung vor dem Merge live geprüft werden.

## 8. Umsetzung in Phasen

| Phase | Inhalt | Stand |
|---|---|---|
| 1 · Fundament | Playwright-Konfiguration, Anmelde-/Reset-Helfer, Datei-Generator, Mock-Szenarien, CI-Job mit Report | erledigt; altes Smoke-Skript ersetzt |
| 2 · Chat | Bereiche A–N | erledigt |
| 3 · Admin | Bereiche O–S inkl. jeder Einstellung | erledigt |
| 4 · Schnittstellen | Fake-API, Bereiche U und V | erledigt |
| 5 · Fehler beheben | Abschnitt 6 | erledigt (34 Fehler, je mit Test) |
| 6 · Breite | Handy/Tablet, Safari/Firefox, Barrierefreiheit, Belastbarkeit (N, W) | erledigt; WebKit und Firefox grün in der CI (lokal nicht installierbar) |
| 7 · Live | Live-Smoke X | Test fertig; erster Lauf nach dem Merge mit den echten Passwörtern |
| 8 · Zugänge | Bereich T (Termine, Gruppen, Gast-Zugänge), A/O/S angepasst | erledigt |
| 9 · Posteingang | Bereich Z, Q22/Q23, V07, W05, X09; V05, A10, E08, N01 und U01 angepasst (`POSTEINGANG-PLAN.md`) | erledigt |
| 10 · Gruppenchats | Bereich GC, Q24, V08, W06, X10; A10, E04/E06, E08, M03, N01/N03, Z10, U01–U03 und V05 angepasst; zweistellige Kürzel (`GRUPPENCHAT-PLAN.md`) | erledigt |
| 11 · Grenzfälle, Phase 1 | A13/A14, C16/C17, C21/C22, F13–F15, H05, T19–T21; Fehler 45–53 (`GRENZFAELLE-PLAN.md`) | erledigt |
| 12 · Grenzfälle, Phase 2 | C19/C20, C24–C26, C30, E11, E12, E15, E16, F17, H06; Fehler 54–61 (`GRENZFAELLE-PLAN.md`) | erledigt |
| 13 · Grenzfälle, Phase 3 | A15/A16, C18, C23, C27–C29, E13, F11, F12, F16, F18, W07 (Zufallstest, nachts mit 50 Seeds), W08, Z18; Testhelfer `support/grenzfaelle.ts`; Fehler 62–71 (`GRENZFAELLE-PLAN.md`) | erledigt |
| 14 · Testlücken | Code und Tests bereichsweise abgeglichen: Fehler 72–78 behoben, vier Scheinprüfungen (U03/U04, U05/Q13, T17, GC14) prüfen jetzt die Wirkung; A07, U04, U05, T17, V04 erweitert | erledigt |
| 15 · Fundus pflegen | Bereiche FP und PR, Y22–Y26, V09, W09, X11; Q21, O01, Y21, U01–U03, W07 und X08 angepasst; `restore()` kennt den Fundus; Fehler 79–80 (`FUNDUS-PFLEGE-PLAN.md`) | erledigt |

Ergebnis: 417 E2E-Tests in 35 Dateien (plus 11 Live-Smoke-Tests, dazu nachts der Zufallstest mit 50 Seeds) und 245
Unit-Tests; die komplette Suite läuft lokal in gut 12 Minuten (3 Worker). Nach Phase 3 der Grenzfälle (14. Oktober
2026) war sie vollständig grün, die 45 Grenzfall-Tests (Chat, Handy, Tablet) auch dreimal hintereinander; der
Zufallstest lief vorab mit rund 60 Seeds. Der dreifache Lauf ohne Wiederholungen (948 Läufe, 13. Oktober 2026, mit den
Gruppenchats) war vollständig grün. Beim dreifachen Lauf vor den Gruppenchats (858 Läufe) scheiterte nur T13 zweimal an
einer Reihenfolge-Abhängigkeit (das Postfach der Kursleitung teilen sich alle Chat-Tests); im Test behoben und in genau
dieser Reihenfolge nachgeprüft. In der CI laufen zusätzlich die Chat-Tests in WebKit und Firefox.

## 9. Was automatisiert nicht geht – kurze manuelle Abnahme

Vor der ersten Schulung einmal auf echten Geräten (iPad, iPhone, Android, Windows-Laptop mit Edge):
Anmelden, Hinweis, Diktat mit echtem Mikrofon, Foto direkt aus der Kamera hochladen, Bild erzeugen und
speichern, Artefakt öffnen und herunterladen, Dunkelmodus, Drehen des Geräts. Die Qualität der echten
Modellantworten wird nur stichprobenhaft geprüft.
