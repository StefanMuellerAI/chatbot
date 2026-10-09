# Testplan Freebie – vollständige E2E-Abdeckung

Stand: 9. Oktober 2026 · Grundlage: Inventur aller Bedienelemente, Einstellungen und API-Routen im aktuellen Code

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
| A01 | Ohne Anmeldung `/` bzw. `/api/...` aufrufen | Weiterleitung auf `/login` bzw. 401 mit deutscher Meldung |
| A02 | Login-Seite | Titel, Spielumgebungs-Hinweis aus den Einstellungen, Link zu stefanai.de in neuem Tab |
| A03 | Leeres Passwort | Button gesperrt, Enter tut nichts |
| A04 | Falsches Passwort | „Das Passwort stimmt nicht.“, Feld bleibt nutzbar |
| A05 | Richtiges Passwort per Button und per Enter | Chat öffnet; Cookie HttpOnly, SameSite=Lax, 12 Stunden; Secure hinter HTTPS (U01) |
| A06 | Passwort mit über 200 Zeichen | verständliche Meldung (heute irreführend) |
| A07 | 50 Fehlversuche, dann der 51. | Sperre mit Meldung, auch das richtige Passwort wird abgewiesen; andere IP nicht betroffen; Erfolg zählt einen Versuch zurück |
| A08 | Abgelaufene, manipulierte oder Admin-Tokens als Teilnehmer-Cookie | abgewiesen, Weiterleitung auf Login |
| A09 | Bereits angemeldet `/login` öffnen | Weiterleitung in den Chat (heute: Login-Seite) |
| A10 | „Abmelden“ | zurück zum Login, Cookie weg, Zurück-Taste zeigt keine Daten mehr |
| A11 | Admin ändert Passwort / meldet alle ab, während jemand chattet | nächste Aktion führt sauber zum Login, nichts geht verloren |
| A12 | Passwort aus Umgebung ↔ im Admin gesetzt ↔ zurückgesetzt | jeweils gilt genau das richtige Passwort |

### B · Hinweis „Spielumgebung“

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| B01 | Erster Besuch | Hinweis-Dialog, nur mit „Verstanden“ schließbar (nicht Esc, nicht Klick daneben); nach Neuladen nicht mehr |
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

### F · Dateien

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| F01 | Büroklammer | Dateiauswahl mit den erlaubten Typen |
| F02 | Jedes Dokumentformat | Fortschritt → fertig mit Token-Schätzung; der ausgelesene Text enthält die erwarteten Inhalte; das Modell bekommt ihn |
| F03 | Bilder | Vorschau, Verkleinerung großer Bilder, Meldung über 5 MB; bei Modellen ohne Bildverständnis ein sichtbarer Hinweis |
| F04 | Grenzfälle aus 3.3 | jeweils klare deutsche Meldung, nichts hängt |
| F05 | Mehrere Dateien, Anhang entfernen, fehlerhafte Datei | Entfernen bricht den Upload ab; Fehler-Chip blockiert das Senden nicht; mehr als 20 Dateien → Meldung vorab |
| F06 | Drag & Drop, Bild einfügen | Overlay erscheint und verschwindet zuverlässig; Dateien kommen an |
| F07 | Dieselbe Datei zweimal | zweites Mal aus dem Datei-Cache; nach Ablauf der Aufbewahrung sauberer Hinweis |
| F08 | Uploads bzw. Transkription im Admin aus | Meldung im Chat **und** Sperre in der API |
| F09 | Anhänge im weiteren Gespräch | bleiben Teil des Verlaufs, erscheinen in Nachricht und Export |

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
| N01 | Handy | Menü öffnet/schließt, Chatwahl schließt die Leiste, Aktionen ohne Hover erreichbar, Eingabe mit Bildschirmtastatur nutzbar |
| N02 | Dunkelmodus | Screenshot-Satz aller Seiten zur Sichtprüfung |
| N03 | axe auf jeder Seite und in jedem Dialog, hell und dunkel | keine schweren Befunde |
| N04 | Nur Tastatur | sinnvolle Reihenfolge, sichtbarer Fokus, Dialoge halten und geben den Fokus zurück |

### O · Admin: Zugang und Übersicht

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| O01 | Admin-Anmeldung | wie A03–A05; Cookie 2 Stunden, SameSite=Strict; Teilnehmer-Cookie reicht nicht |
| O02 | Kennzahlen | Kosten, Ersparnis, Anfragen, Cache-Quote und Treffer stimmen exakt mit den im Test ausgelösten Aktionen überein (im Fake-API-Modus mit echten Preisen) |
| O03 | Diagramm | Balken mit Beschriftung, Tooltip per Maus und Tastatur, Tabellenansicht mit denselben Zahlen |
| O04 | Systemstatus | jede Zeile spiegelt die Umgebung (Schlüssel, Datenbank, Blob per Token/OIDC, Secrets, Passwortquelle) |

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

### R · Admin: Vorlagen

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| R01 | Anlegen, Bearbeiten, Löschen | ID aus dem Namen (ä→ae …), Validierung je Feld, Bestätigung, Fehleranzeige |
| R02 | Symbol, Reihenfolge, aktiv, empfohlenes Modell | Wirkung auf der Chat-Startseite (siehe L) |

### S · Admin: Sicherheit

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| S01 | Passwort setzen (unter 4, gültig, über 200 Zeichen) | Meldung; Teilnehmende abgemeldet; neues gilt, altes nicht |
| S02 | Zurück zum Umgebungs-Passwort | APP_PASSWORD gilt wieder |
| S03 | Alle abmelden (bestätigen / abbrechen) | alle Teilnehmenden raus, eigener Admin-Zugang bleibt |
| S04 | Cache leeren (bestätigen / abbrechen) | nächste gleiche Frage kommt nicht aus dem Cache |

### U · API-Robustheit (ohne Browser, alle 24 Routen)

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| U01 | Ohne, mit gefälschter und mit Teilnehmer-Sitzung an Admin-Routen; Cookie-Attribute | 401 mit deutscher Meldung; HttpOnly, SameSite, begrenzte Laufzeit |
| U02 | Falsche Methode | 405 |
| U03 | Kaputtes JSON, falsche Felder, Grenzwerte (Nachricht, Anhänge, Bild-Prompt, Passwort) | 400 mit deutscher Meldung bzw. „Passwort stimmt nicht“ – nie 500 |
| U04 | Pfad-Tricks (`../`, kodiert, fremde Präfixe, Nullbyte), hochgeladenes HTML | 400/404; Auslieferung als Download mit Sandbox-CSP |
| U05 | Aufräumjob ohne, mit falschem und richtigem Secret | 401, 401, 200 mit Zählern |
| U06 | Sicherheits-Header auf Seiten, API-Antworten und Fehlern | nosniff, DENY, Referrer-Policy, HSTS, Permissions-Policy |

### V · Anbieter-Adapter (Fake-API, je Claude und GPT)

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| V01 | Text, Gedankengang, Nutzungswerte inkl. Cache-Tokens | korrekte Anzeige und Kostenberechnung |
| V02 | Websuche mit Quellen (inkl. Haiku mit Basis-Werkzeug) | Quellenkarten |
| V03 | Bild-Werkzeug-Schleife, Fortsetzung nach Pause, Max-Tokens, Ablehnung, Ersatzmodell | richtige Fortsetzung, Hinweise und Kennzeichen „Ersatzmodell“ |
| V04 | Fehler 401/429/413/400/500 und Abbruch mitten im Stream | deutsche Meldungen, keine hängenden Anfragen |
| V05 | **Caching-Vertrag über 3 Runden** | System-Prompt, Werkzeuge und frühere Nachrichten byte-gleich; Cache-Marker korrekt; Effort-Wechsel ohne Präfixbruch; gleicher Cache-Schlüssel bei GPT |
| V06 | Titel, Transkription, Bilder, Modell-Listen | Anfragen in der erwarteten Form |

### W · Belastbarkeit

| ID | Szenario | Erwartete Wirkung |
|---|---|---|
| W01 | Server-Neustart mitten in der Sitzung | Anmeldung und Daten bleiben |
| W02 | Verbindung bricht mitten in der Antwort ab, Neuladen während einer Antwort | Kennzeichnung „unterbrochen“, kein kaputter Verlauf |
| W03 | Chat mit 100 Nachrichten, 500 Chats in der Leiste | bleibt flüssig (Zeitbudget je Aktion) |
| W04 | **Schulungssituation:** 25 Personen gleichzeitig, eine IP | keine Sperre, keine Fehler, Antwort-Cache wird geteilt |

### X · Live-Smoke (`freebie.stefanai.de`)

Nach jedem Production-Deploy und auf Abruf, mit dem Teilnehmer-Passwort, ohne Einstellungen zu ändern
(`LIVE=1 LIVE_PASSWORD=… LIVE_ADMIN_PASSWORD=… npm run test:e2e:live`):

| ID | Schritt | Erwartete Wirkung |
|---|---|---|
| X01 | Systemstatus im Admin (nur lesen) | alles grün, inkl. **Blob-Speicher**, Postgres, Cron, Schlüssel |
| X02 | je eine kurze Frage an Claude Haiku und GPT-6 Luna (Denktiefe „Niedrig“) | Antwort ohne Fehlermeldung |
| X03 | kleines PDF hochladen (über Blob) und befragen | Anhang bereit, Antwort |
| X04 | kurze MP3 transkribieren | Transkript, Antwort |
| X05 | ein Bild in Entwurfsqualität | Bild erscheint |
| X06 | eine Websuche-Frage und ein kleines Artefakt | Quellen; Artefakt-Panel öffnet sich |

Geschätzte Kosten: unter 0,10 $ pro Lauf.

## 5. Abdeckungsmatrix

`tests/e2e/coverage.json` ordnet jeder Einstellung (aus `lib/shared/settings-defaults.ts`), jeder API-Route (aus
`app/api`) und jedem Bedienelement Test-IDs zu. `npm run test:coverage` prüft in der CI in beide Richtungen:
jede Katalog-ID aus Abschnitt 4 hat einen Test, jede neue Einstellung und Route steht in der Matrix, und jede dort
genannte ID gibt es als Test. Neue Einstellungen oder Routen ohne Test machen die CI rot.
`node tests/e2e/coverage.mjs --markdown` gibt die Matrix ID → Tests als Tabelle aus.

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
   per Pull Request live. Für Live-Tests gegen Previews fehlen dort die Umgebungsvariablen (z. B. `APP_PASSWORD`) –
   *Empfehlung:* sie auch für „Preview“ setzen, dann kann jede Änderung vor dem Merge live geprüft werden.

## 8. Umsetzung in Phasen

| Phase | Inhalt | Stand |
|---|---|---|
| 1 · Fundament | Playwright-Konfiguration, Anmelde-/Reset-Helfer, Datei-Generator, Mock-Szenarien, CI-Job mit Report | erledigt; altes Smoke-Skript ersetzt |
| 2 · Chat | Bereiche A–N | erledigt |
| 3 · Admin | Bereiche O–S inkl. jeder Einstellung | erledigt |
| 4 · Schnittstellen | Fake-API, Bereiche U und V | erledigt |
| 5 · Fehler beheben | Abschnitt 6 | erledigt (34 Fehler, je mit Test) |
| 6 · Breite | Handy/Tablet, Safari/Firefox, Barrierefreiheit, Belastbarkeit (N, W) | erledigt; WebKit/Firefox laufen nur in der CI (lokal nicht installierbar) |
| 7 · Live | Live-Smoke X | Test fertig; erster Lauf nach dem Merge mit den echten Passwörtern |

Ergebnis: 207 E2E-Tests in 19 Dateien (plus 6 Live-Smoke-Tests) und 46 Unit-Tests; die komplette Suite läuft lokal in gut 5 Minuten
(3 Worker) und dreimal hintereinander ohne Wiederholungen grün (621 von 621). In der CI laufen zusätzlich die
Chat-Tests in WebKit und Firefox.

## 9. Was automatisiert nicht geht – kurze manuelle Abnahme

Vor der ersten Schulung einmal auf echten Geräten (iPad, iPhone, Android, Windows-Laptop mit Edge):
Anmelden, Hinweis, Diktat mit echtem Mikrofon, Foto direkt aus der Kamera hochladen, Bild erzeugen und
speichern, Artefakt öffnen und herunterladen, Dunkelmodus, Drehen des Geräts. Die Qualität der echten
Modellantworten wird nur stichprobenhaft geprüft.
