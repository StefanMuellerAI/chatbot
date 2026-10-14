# Plan: Grenzfälle und Fehlbedienung durch Teilnehmende

Stand: 13. Oktober 2026 · Grundlage: `main` mit Fundus und Posteingang (286 E2E-Tests, 118 Unit-Tests); Durchsicht
aller Chat-Tests und des Chat-Codes, dazu Sonden gegen den Produktions-Build im Mock-Modus (temporäre
Playwright-Tests, nicht eingecheckt)

**Umsetzung:** Phase 1 und 2 sind erledigt (14. Oktober 2026): Fehler 1–15 und 17–20 sind behoben, je mit Test
(Phase 1: A13/A14, C16/C17, C21/C22, F13–F15, H05, T19–T21; Phase 2: C19/C20, C24–C26, C30, E11, E12, E15, E16,
F17, H06 – in der TESTPLAN.md, dort Fehler 45–61). Offen ist Phase 3 (dauerhafte Absicherung) und Phase 4 (echte
Geräte). Die Entscheidungen stehen in Abschnitt 7.

## 1. Ziel

Freebie soll **narrensicher** sein: Fehleingaben, Copy-&-Paste-Reste, Doppelklicks und ungewöhnliche Reihenfolgen
führen nie zu Datenverlust, doppelten Kosten, einer weißen Seite oder einer Meldung, mit der niemand etwas anfangen
kann. Im Mittelpunkt steht, wie Teilnehmende Freebie bedienen; Admin-Bereich und Anbieter-Adapter sind schon gut
abgesichert und hier nur am Rand Thema.

Abnahmekriterien („narrensicher“ heißt konkret):

1. **Katalog vollständig:** Jede ID aus Abschnitt 4 hat einen Test. Die IDs setzen die bestehenden Bereiche der
   TESTPLAN.md fort (A13, C16, F11 …); jede Zeile kommt zusammen mit ihrem Test dorthin, danach erzwingt die
   Abdeckungsmatrix (`npm run test:coverage`) sie automatisch.
2. **Nichts doppelt:** Kein Knopf, der eine Anfrage auslöst, verursacht bei Doppelklick oder Doppel-Enter eine
   zweite Anfrage (und damit doppelte Kosten).
3. **Nichts verloren:** Kein Entwurf, kein Anhang und kein Chat geht durch eine Bedienfolge stillschweigend
   verloren oder wird überschrieben.
4. **Jede Meldung hilft weiter:** Alles, was Teilnehmende auslösen können, endet in einer deutschen Meldung mit
   nächstem Schritt – nie „Fehler 413“, „Es ist ein interner Fehler aufgetreten“ oder eine weiße Seite.
5. **Zufallstest grün:** Zufällige Folgen von Teilnehmer-Aktionen (Abschnitt 5.3) verletzen keine Invariante –
   in der CI mit festen Seeds, nachts mit vielen.
6. **Stabil:** Die Suite läuft weiterhin dreimal hintereinander grün, ohne Wiederholungen.

## 2. Bestandsaufnahme: Was die Suite heute an Grenzfällen abdeckt

Die Suite ist breit und deckt jede Einstellung, Route und jedes Bedienelement ab. Sie prüft aber vor allem den
**vorgesehenen Weg** und einzelne Fehlerbilder. Die Tests bedienen Freebie wie eine disziplinierte Testerin:
`fill()`, ein Klick, warten, prüfen. Nie zweimal schnell hintereinander, nie mit echtem Zwischenablage-Inhalt, nie
daneben gezielt, nie zwei Dinge durcheinander.

| Bereich | Gut abgedeckt (Test-IDs) | Nicht abgedeckt |
|---|---|---|
| Anmeldung | leere Felder, nur Leerzeichen im Namen, falsche Daten, Groß-/Kleinschreibung und Leerzeichen im **Namen**, überlange Eingaben, Autofill vor dem Laden, Login-Bremse pro IP und Name, gefälschte Tokens (A03–A08, T14) | Leerzeichen, Tab oder Großbuchstaben im **Passwort** (Copy & Paste vom Ausdruck), Frühstarter und Login-Bremse, Sperre trotz neuem Passwort |
| Eingabefeld | leer bzw. nur Leerzeichen gesperrt, Senden während Antwort gesperrt, Shift+Enter, 200.000/400.000 Zeichen, HTML/Script als Text (C02, C03, C13, C15) | Doppelklick, Einfügen aus Word/Excel, Text per Drag & Drop, Entwurf bei Bearbeiten/Beispiel/Chatwechsel, Diktat während des Tippens, Enter auf Bildschirmtastaturen, Wortvorschläge (IME) |
| Antworten | Stoppen vor/nach dem ersten Text, Anbieterfehler, abgerissener Stream, offline, Sitzung abgelaufen (C05, C11, C12, W02) | Doppelklick „Neu generieren“, HTTP-Fehler ohne JSON (Vercel-Fehlerseiten), Weiterschreiben nach Fehler |
| Dateien | leer, kaputtes PDF, Zip-Bombe, falsche Endung, unbekanntes Format, Umlaut-/Emoji-Name mit lateinischem Anfang, Größengrenzen, mehr als 20, Entfernen während Upload (F04, F05) | Namen ohne lateinische Buchstaben, Windows-1252-CSV aus Excel, UTF-16, Nullbytes, alte Office-Formate/HEIC, Datei neben die Ablagefläche, Netzabbruch beim Upload, nur Anhang ohne Text |
| Reihenfolgen | „Neuer Chat“ und Modellwahl während Antwort gesperrt, Chat löschen während Antwort, Neuladen während Antwort, zwei Tabs lesen, Posteingang öffnen während Antwort (E01, E06, D10, W02, E07, Z01) | Chatwahl/Bild-Modus während Antwort (nur im Code gesperrt), Upload + Chatwechsel, Bearbeiten + Chatwechsel, zwei Tabs **senden** im selben Chat |
| Import/Export | kaputtes JSON, falsche Form, fehlende Texte, kaputte Verbindungen und Mail-Karten, 500 Chats (E08, W03) | kaputte Anhänge, Quellen und Bilder in sonst gültigen Chats, älterer Export über neuerem Stand, Export auf dem iPad |
| Fundus, Posteingang | Grenze 20 Anhänge, bereits angehängt, Ladefehler, Adressprüfung, fremde Gruppe, Verwerfen mit Rückfrage, Senden-Grenzen, HTML als Text (Y09–Y11, Z05, Z07, Z16) | Adressen aus der Zwischenablage mit Anzeigename |
| Browser-Umgebung | Safari/Firefox, Handy/Tablet, Tastatur, axe (N01–N04) | Browser-Speicher voll, Cookies blockiert, Zurück-Geste während Antwort |
| Server/API | kaputtes JSON, falsche Felder, Grenzwerte, Pfad-Tricks, falsche Methoden, Header (U01–U06, Y21, Z16) | – (gut abgesichert) |

**Positiv aufgefallen:** Die Serverseite ist robust. Nur ein Anhang ohne Text funktioniert („(Siehe Anhang.)“),
abgelaufene Dateien werden dem Modell als „nicht mehr verfügbar“ gemeldet, Bilder an Modelle ohne Bildverständnis
werden durch einen Hinweis ersetzt, native Antwortblöcke gehen nur an dasselbe Modell zurück, leere Antworten
werden zu „(Keine Antwort.)“. Im Posteingang sind nach dem Code Doppelklick auf „Senden“ und Adressen in beliebiger Schreibweise
(„ Fuchs27 “, `<fuchs27@freebie.example>`) abgefangen; „Neu generieren“ fragt nach, wenn eine Antwort Mails
verschickt hat. Doppelklick im Bild-Modus, Abmelden während einer Antwort und sehr lange Zeichenketten am Handy
funktionieren ebenfalls – ihnen fehlt nur ein Test.

## 3. Befunde

### 3.1 Bestätigt (Sonde gegen den Produktions-Build, auf dem aktuellen `main` wiederholt)

Behoben in Phase 1: 1–8, 10 und 20; in Phase 2: 9, 11–15, 17–19. Kein Fehler: 16 – Überschreiben ist so gewollt
(Entscheidung 4).

Schwere: **hoch** = trifft in Schulungen realistisch, Teilnehmende kommen nicht weiter oder es entstehen
Datenverlust bzw. doppelte Kosten · **mittel** = verwirrend, mit Umweg lösbar · **niedrig** = selten.

| # | Befund | Was heute passiert | Schwere |
|---|---|---|---|
| 1 | Passwort aus Ausdruck/PDF/Mail kopiert (Leerzeichen oder Tab vorn/hinten, geschütztes Leerzeichen) oder auf dem iPad mit Großbuchstaben begonnen („Sonne482“); Nullbreitenzeichen im Namen | „Benutzername oder Passwort stimmt nicht.“ – und jeder Versuch zählt für die Login-Bremse (10 pro Name, 50 pro IP) | hoch |
| 2 | Login-Bremse im Schulungsraum: Anmeldeversuche mit **richtigem** Passwort vor der Freigabe zählen als Fehlversuch; nach 10 davon ist der Name zum Beginn gesperrt. Ein neues Passwort der Kursleitung hebt die Sperre nicht auf | 10 × „Dein Termin beginnt …“, dann 429; mit neuem Passwort weiter 429 für bis zu 10 Minuten. Mit Befund 1 kann eine Gruppe hinter einer IP die 50er-Grenze erreichen und den ganzen Raum aussperren | hoch |
| 3 | Doppelklick auf „Senden“ (Doppel-Enter nur bei sehr schneller Folge, z. B. auf langsamen Geräten) | im neuen Chat entstehen **zwei Chats** mit derselben Frage; im laufenden Chat **zwei Fragen und zwei Antworten** – jeweils doppelte Kosten | hoch |
| 4 | Doppelklick auf „Neu generieren“ | zwei Antworten auf eine Frage, doppelte Kosten | mittel |
| 5 | Einfügen aus Word, Excel oder PowerPoint: die Zwischenablage enthält Text **und** ein Bild der Auswahl | der Text wird verworfen, stattdessen hängt ein „image.png“ am Eingabefeld (im Test mit nachgebildeter Zwischenablage; wie oft Office das Bild mitliefert, auf echten Geräten bestätigen) | hoch |
| 6 | Dateiname ohne lateinische Buchstaben vor der Endung („Отчет.pdf“, „報告.docx“, „📊.csv“) | „Dieses Dateiformat wird nicht unterstützt.“ – die Bereinigung des Namens verliert die Endung | mittel |
| 7 | CSV aus deutschem Excel (Windows-1252, Standard bei „CSV (Trennzeichen-getrennt)“) | wird angenommen, das Modell sieht aber „M�ller, K�ln“ und antwortet entsprechend falsch | hoch |
| 8 | Textdatei in UTF-16 (Excel „Unicode-Text“) oder mit Nullbytes | „Es ist ein interner Fehler aufgetreten.“ – Postgres lehnt Nullbytes im ausgelesenen Text ab (gleicher Weg vermutlich bei PDFs, deren Text Nullzeichen enthält) | mittel |
| 9 | Während Diktat oder Transkription weitertippen (oder Text löschen) | das Transkript **ersetzt** das Getippte durch den Stand vom Aufnahmebeginn | mittel |
| 10 | Doppelklick auf das Mikrofon (z. B. weil die Berechtigungsabfrage dauert) | zwei Aufnahmen; „Stopp“ beendet nur eine, das Mikrofon **bleibt an**, nimmt bis zu 10 Minuten weiter auf und fügt dann unerwartet Text ein | hoch |
| 11 | Datei neben die Ablagefläche fallen gelassen (Seitenleiste, Artefakt-Panel) oder während „Pause“ | der Browser öffnet die Datei anstelle von Freebie; eine laufende Antwort geht verloren | mittel |
| 12 | Markierten Text per Drag & Drop ins Eingabefeld ziehen | wird blockiert (die Ablagefläche fängt jedes Ablegen ab, auch ohne Dateien) | niedrig |
| 13 | Entwurf getippt, dann „Bearbeiten“ an einer früheren Nachricht und „Abbrechen“; oder ein Beispiel-Knopf angeklickt | Entwurf und laufende Uploads sind weg; der Beispieltext überschreibt den Entwurf ohne Rückfrage | mittel |
| 14 | Im Bearbeiten-Modus einen anderen Chat wählen | der Text der alten Nachricht steht im Eingabefeld des **anderen** Chats, die Hinweisleiste ist weg – ein Enter schickt ihn dort ab | mittel |
| 15 | Import einer Datei, in der Anhänge, Quellen oder Bilder den falschen Typ haben (z. B. `attachments: [null]`, `citations: "x"`) | der Import meldet Erfolg; beim Öffnen des Chats stürzt die ganze Oberfläche ab (weiße Seite), erst Neuladen hilft | niedrig |
| 16 | Älteren Export erneut importieren (z. B. in der nächsten Sitzung) | überschreibt den neueren Stand derselben Chats ohne Rückfrage | – (gewollt, Entscheidung 4) |
| 17 | Fehler der Plattform ohne JSON (Vercel 413 bei sehr großen Anfragen, 502/504-Fehlerseiten) | „Fehler 413“ bzw. „Fehler 504“ im Chat | mittel |
| 18 | Browser-Speicher voll (z. B. volles iPad) | „Senden“ tut nichts, keine Meldung, unbehandelter Fehler im Hintergrund | mittel |
| 19 | Zwei Tabs mit demselben Chat, in beiden wird gesendet | Verlauf wird Frage, Frage, Antwort, Antwort – jede Antwort kennt nur ihre eigene Frage | niedrig |
| 20 | Langsamer Doppelklick auf „Senden“ (beim Umsetzen gefunden): „Stoppen“ erscheint an derselben Stelle | der zweite Klick bricht die eben gestartete Antwort ab | mittel |

### 3.2 Noch zu prüfen (Verdacht aus dem Code oder nur auf echten Geräten prüfbar)

| Verdacht | Wie prüfen |
|---|---|
| Auf iPad und Handy sendet Enter sofort – Absätze sind ohne Hardware-Tastatur nicht möglich | Entscheidung 2, dann Test im Projekt `mobile` |
| Android-Tastaturen mit Wortvorschlägen: Enter fügt eine Zeile ein statt zu senden | echtes Gerät |
| Fotos als HEIC (aus der Dateien-App) sowie .doc, .ppt, .odt, .msg werden nur mit „nicht unterstützt“ abgewiesen, ohne Tipp | Test mit erzeugten Dateien; HEIC-Verhalten der Foto-Auswahl am iPad |
| Cookies blockiert: Anmeldung meldet Erfolg, man landet ohne Erklärung wieder auf der Anmeldung | Test mit entferntem `Set-Cookie` (Sonde war nicht eindeutig) |
| Posteingang: aus einem Mailprogramm kopierte Adresse mit Anzeigename (`"Max Muster" <fuchs27@freebie.example>`) oder Punkt am Ende wird abgelehnt | Test im Schreiben-Dialog |
| Sehr lange Chats mit vielen Websuchen erreichen 4,5 MB pro Anfrage (native Blöcke mit verschlüsselten Suchergebnissen) und enden in Befund 17 | Messung über die Fake-API: Größe der Anfrage nach n Runden |
| Safari ignoriert die Diktat-Bitrate; lange Diktate überschreiten 4 MB und gehen verloren | 5-Minuten-Diktat auf iPad |
| Export auf iPad/Safari: der Download-Link wird sofort widerrufen und kann abbrechen | echtes Gerät, vor allem aus der Ablauf-Warnung (T12) |
| Gemeinsamer Schulungsrechner: Passwort-Manager füllt die Daten des vorherigen Gasts aus | echtes Gerät, Hinweis „Angemeldet als …“ prüfen |

## 4. Neue Katalog-Zeilen (IDs reserviert)

Alle Buchstaben A–Z sind in der TESTPLAN.md vergeben. Die neuen Zeilen setzen deshalb die passenden Bereiche fort;
so funktionieren Abdeckungsmatrix und Testnamen ohne Umbau. „Heute“: ❌ Fehler (Nummer aus 3.1) · ⚠️ ungetestet,
Verhalten offen bzw. festzulegen · ✅ funktioniert, Test fehlt · **✔ erledigt** (Phase 1, Test in der TESTPLAN.md).
W06 ist inzwischen von den Gruppenchats belegt; Zufallstest und lange Chats heißen deshalb W07 und W08.

### A · Zugang und Sitzung

| ID | Szenario | Erwartete Wirkung | Heute |
|---|---|---|---|
| A13 | Gast-Passwort mit Leerzeichen, Tab, geschütztem Leerzeichen vorn/hinten, mit Großbuchstaben, mit Nullbreitenzeichen; Benutzername ebenso | Anmeldung klappt, kein Fehlversuch gezählt; das Admin-Passwort bleibt exakt | **✔ erledigt** |
| A14 | Zugangsdaten mit Zeilenumbruch eingefügt, beide in ein Feld eingefügt („fuchs27 sonne482“), Felder vertauscht | Anmeldung klappt bzw. Hinweis, was ins zweite Feld gehört | **✔ erledigt** |
| A15 | Doppel-Enter bei der Anmeldung | eine Anfrage, höchstens ein Versuch gezählt | ⚠️ (nach Code geschützt) |
| A16 | Cookies blockiert | Hinweis auf der Anmeldeseite statt stillem Zurückspringen | ⚠️ |

### C · Chat: Eingaben, Doppelklicks, Reihenfolgen

| ID | Szenario | Erwartete Wirkung | Heute |
|---|---|---|---|
| C16 | Einfügen aus Word, Excel, PowerPoint und PDF-Reader (Text + HTML + Bild in der Zwischenablage) | Text steht im Eingabefeld, kein Bild-Anhang | **✔ erledigt** |
| C17 | Einfügen eines Screenshots bzw. eines Bildes von einer Webseite (Bild ohne Text) | wird angehängt | **✔ erledigt** |
| C18 | Text mit Steuerzeichen, Nullbyte, geschützten Leerzeichen, Emoji, arabischer Schrift senden; danach „Kopieren“ | keine Fehlermeldung, Modell bekommt den Text, Kopieren liefert ihn exakt zurück | ⚠️ |
| C19 | Enter mit Hardware-Tastatur, mit Bildschirmtastatur (iPad, Handy) und mit Wortvorschlägen | wie in Entscheidung 2 festgelegt | **✔ erledigt** |
| C20 | Markierten Text per Drag & Drop ins Eingabefeld ziehen | Text wird eingefügt | **✔ erledigt** |
| C21 | Doppelklick und Doppel-Enter auf „Senden“ – im neuen und im laufenden Chat, auch mit CPU-Drosselung (altes iPad) | genau eine Frage, ein Chat, eine Anfrage | **✔ erledigt** |
| C22 | Doppelklick „Neu generieren“ (auch beim Hinweis „Antwort fehlt“) | genau eine neue Antwort | **✔ erledigt** |
| C23 | Doppelklick auf „Bild erzeugen“, „Stoppen“, Kopieren, „Chats exportieren“, „Abmelden“, Senden im Posteingang | jeweils genau eine Wirkung | ✅ (Bild-Modus per Sonde, Posteingang nach Code) |
| C24 | Entwurf mit Anhang (auch Upload läuft) → „Bearbeiten“ an früherer Nachricht → „Abbrechen“ | Entwurf und Anhänge sind wieder da, der Upload läuft weiter | **✔ erledigt** |
| C25 | Entwurf → Beispiel-Knopf, Vorlage oder „Mit Freebie besprechen“ im Posteingang | Entwurf bleibt erhalten (Entscheidung 3) | **✔ erledigt** |
| C26 | Bearbeiten-Modus → anderen Chat wählen, „Neuer Chat“, Chat löschen | im anderen Chat steht nicht der alte Nachrichtentext, Hinweisleiste weg, eigener Entwurf zurück | **✔ erledigt** |
| C27 | Antwort läuft → anderen Chat in der Leiste, Bild-Modus, Bearbeiten, Import, Abmelden, Zurück-Geste | gesperrt bzw. sauber beendet; beim Verlassen eine Warnung (Entscheidung 6) | ✅ teilweise (E01, E06, D10, W02) |
| C28 | Nach einer Fehlermeldung einfach weiterschreiben statt „Neu generieren“; nach „Stoppen“ sofort neu senden | gültiger Verlauf; die Anfrage an den Anbieter ist gültig (Fake-API prüft die Rollenfolge) | ⚠️ |
| C29 | Nur einen Anhang senden, ohne Text bzw. nur mit Leerzeichen | Antwort kommt | ✅ |
| C30 | HTTP-Fehler ohne JSON (413, 502, 503, 504 als HTML-Seite) bei Chat, Upload, Bild, Titel, Transkription, Diktat | deutsche Meldung mit nächstem Schritt („Chat ist zu groß – bitte neuen Chat starten“, „Freebie antwortet gerade nicht – gleich nochmal versuchen“) | **✔ erledigt** |

### E · Verlauf, Import und Export

| ID | Szenario | Erwartete Wirkung | Heute |
|---|---|---|---|
| E11 | Import mit Feldern vom falschen Typ (`attachments`, `citations`, `images`, `native`, `usage`), fremden Feldern, sehr großer Datei | Ungültiges wird verworfen, nichts stürzt ab; im Notfall „Dieser Chat kann nicht angezeigt werden“ statt weißer Seite | **✔ erledigt** |
| E12 | Älteren Export erneut importieren (gleiche Chat-IDs) | Chats mit gleicher ID werden überschrieben (Entscheidung 4) | **✔ erledigt** |
| E13 | Falsche Datei gewählt (PDF, Bild, leer, Markdown-Export) | verständliche Meldung | ✅ teilweise (E08) |
| E14 | Export aus der Ablauf-Warnung und aus der Seitenleiste auf iPad/Safari | Datei vollständig | ⚠️ (Gerät) |
| E15 | Zwei Tabs mit demselben Chat senden gleichzeitig | Verlauf bleibt geordnet (Sperre oder Hinweis, Entscheidung 7) | **✔ erledigt** |
| E16 | Browser-Speicher voll bzw. IndexedDB nicht verfügbar | klare Meldung, Eingabe bleibt erhalten | **✔ erledigt** |

### F · Dateien aus dem echten Leben

| ID | Szenario | Erwartete Wirkung | Heute |
|---|---|---|---|
| F11 | Upload läuft → Chat wechseln, „Neuer Chat“, Modell ohne Bildverständnis wählen, neu laden | festgelegtes Verhalten (Entscheidung 3), kein hängender Chip, kein Browserfehler | ⚠️ |
| F12 | Dieselbe Datei zweimal an einer Nachricht (Upload; im Fundus schon abgefangen) | Hinweis, geht nur einmal mit | ⚠️ |
| F13 | Namen nur aus kyrillischen, chinesischen oder arabischen Zeichen bzw. Emoji, Endung in Großbuchstaben (`.PDF`), sehr lange Namen | wird verarbeitet, der Originalname bleibt sichtbar | **✔ erledigt** |
| F14 | CSV aus deutschem Excel (Windows-1252, Semikolon, Dezimalkomma, Datum), UTF-16-Text, UTF-8 mit BOM | Umlaute, Zahlen und Daten kommen korrekt beim Modell an | **✔ erledigt** |
| F15 | Text mit Nullbytes und Steuerzeichen (Logdatei, PDF mit ungewöhnlicher Schrift) | wird ausgelesen oder klare Meldung, nie „interner Fehler“ | **✔ erledigt** |
| F16 | Typische falsche Formate: .doc, .ppt, .odt, .pages, .heic, .msg, .zip, Ordner, Datei ohne Endung | Meldung mit Tipp („Bitte als .docx speichern“, „Bitte als JPG exportieren“) | ⚠️ |
| F17 | Datei auf Seitenleiste, Artefakt-Panel, Posteingang oder Dialog fallen lassen, auch bei „Pause“ | Freebie bleibt offen; Datei wird angehängt bzw. Hinweis | **✔ erledigt** |
| F18 | Netz bricht während Upload bzw. Transkription ab | klare Meldung, erneut anhängen möglich, nichts hängt | ⚠️ |

### H · Spracheingabe

| ID | Szenario | Erwartete Wirkung | Heute |
|---|---|---|---|
| H05 | Doppelklick aufs Mikrofon; Klick, während die Berechtigungsabfrage offen ist | genau eine Aufnahme; nach „Stopp“ ist kein Mikrofon-Stream mehr aktiv | **✔ erledigt** |
| H06 | Diktat läuft bzw. transkribiert → tippen, Text löschen, senden, Chat wechseln | Getipptes bleibt, Transkript wird angehängt (nie ersetzt) | **✔ erledigt** |

### T · Schulungsraum

| ID | Szenario | Erwartete Wirkung | Heute |
|---|---|---|---|
| T19 | 25 Personen hinter einer IP versuchen sich vor der Freigabe mehrfach mit richtigen Daten anzumelden | zum Beginn kommt jede Person hinein | **✔ erledigt** |
| T20 | Gast nach Tippfehlern gesperrt → Kursleitung erzeugt ein neues Passwort | Anmeldung sofort möglich | **✔ erledigt** |
| T21 | Gruppe mit typischen Fehlern (25 Personen, je 2–3 Fehlversuche in 10 Minuten) | keine Raumsperre | **✔ erledigt** |
| T22 | Gemeinsamer Rechner, Passwort-Manager füllt die Daten des vorherigen Gasts aus | niemand landet unbemerkt im fremden Konto | ⚠️ (Gerät) |

### W · Belastbarkeit

| ID | Szenario | Erwartete Wirkung | Heute |
|---|---|---|---|
| W07 | Zufällige Folgen von Teilnehmer-Aktionen mit festen Seeds (Abschnitt 5.3) | keine Invariante verletzt | ⚠️ |
| W08 | Sehr langer Chat bis an die Grenzen (4,5 MB pro Anfrage, 500 Nachrichten, viele Websuchen) | rechtzeitig Hinweis „neuen Chat starten“, kein Abbruch mit Fehlercode | ⚠️ |

### Z · Posteingang

| ID | Szenario | Erwartete Wirkung | Heute |
|---|---|---|---|
| Z18 | Adressen aus der Zwischenablage: mit Anzeigename in Anführungszeichen, Punkt oder Komma am Ende, Zeilenumbrüchen, mehrere aus einem Mailprogramm | werden erkannt bzw. konkrete Meldung, welcher Teil nicht passt | ⚠️ |

## 5. Werkzeuge für die Umsetzung

### 5.1 Testhelfer (`tests/e2e/support/grenzfaelle.ts`)

- **`pasteInto(locator, preset)`** – Einfügen mit echter Form der Zwischenablage: `word`, `excel`, `powerpoint`
  (Text + HTML + Bild), `pdf-reader` (geschützte Leerzeichen, weiche Trennstriche), `screenshot` (nur Bild),
  `web-image` (Bild + HTML ohne Text). Prüft, ob der Browser einfügen darf (`defaultPrevented`) und was ankommt.
- **`dropOn(target, files | text)`** – Ablegen auf beliebige Stellen; gibt `defaultPrevented` zurück. Ist es
  `false` bei Dateien, würde der Browser die Datei öffnen.
- **`rapid(locator)`** – Doppelklick wie ein Mensch (`dblclick`) und zwei Klicks in derselben Aufgabe;
  zusammen mit **CPU-Drosselung** über CDP (`Emulation.setCPUThrottlingRate`, Faktor 6) für langsame Geräte.
- **`failStorage(page)`** – IndexedDB wirft `QuotaExceededError`.
- **`platformError(page, url, status)`** – Antwort mit HTML-Fehlerseite statt JSON.
- **`expectConsistent(chat)`** – Invarianten nach jedem Grenzfall: Frage/Antwort wechseln sich ab (außer
  „Antwort fehlt“), keine doppelten Chats, kein „Stoppen“ ohne laufende Antwort, Eingabefeld sichtbar, kein
  aktiver Mikrofon-Stream im Ruhezustand.

### 5.2 Testdaten (`tests/e2e/support/generate-files.ts`)

Windows-1252-CSV mit Semikolon, Dezimalkomma und Datum; UTF-16-Text mit BOM; Text mit Nullbytes; Dateinamen in
kyrillischer und chinesischer Schrift sowie nur Emoji; `.PDF` in Großbuchstaben; Platzhalter für .doc, .ppt,
.odt, .heic, .msg (nur die Kopfbytes); Datei ohne Endung.

### 5.3 Zufallstest (W07, `tests/e2e/belastung/zufall.spec.ts`)

Ein Seed-gesteuerter Zufallsgenerator wählt aus rund 20 Aktionen mit Vorbedingungen: tippen, einfügen (alle
Presets), senden, doppelt senden, stoppen, neu generieren, bearbeiten, abbrechen, Beispiel, Vorlage, Datei
anhängen/entfernen, Datei daneben ablegen, Fundus öffnen/anhängen, Chat wechseln/neu/löschen, Modell und Denktiefe
wechseln, Websuche und Verbindung umschalten, Posteingang öffnen/zurück, Artefakt-Panel öffnen/schließen, neu
laden, Diktat starten/stoppen. Nach jedem Schritt laufen die Invarianten aus 5.1.

- CI: 5 feste Seeds × 40 Schritte (Projekt `belastung`, seriell).
- Nachts (eigener Workflow): 50 Seeds; bei einem Fehler stehen Seed und Aktionsliste im Bericht,
  `ZUFALL_SEED=… npx playwright test -g W07` spielt ihn nach.

### 5.4 Unit-Tests für reine Funktionen

| Datei | Prüft |
|---|---|
| `tests/unit/eingaben.test.ts` | Normalisierung von Benutzername und Gast-Passwort (Leerzeichen, Tab, geschütztes Leerzeichen, Nullbreite, Groß/klein, Vollbreiten-Ziffern) |
| `tests/unit/dateinamen.test.ts` | Für zufällige Unicode-Namen mit erlaubter Endung gilt: `categoryOf(Schlüssel) === categoryOf(Name)` und `assertSafeKey` akzeptiert |
| `tests/unit/kodierung.test.ts` | Text-Extraktion für UTF-8, UTF-8 mit BOM, UTF-16 LE/BE, Windows-1252; keine Nullbytes im Ergebnis |
| `tests/unit/import.test.ts` | Normalisierung importierter Chats mit zufälligen JSON-Formen: wirft nie, Felder haben danach den richtigen Typ |
| `tests/unit/fehlermeldungen.test.ts` | HTTP-Status ohne JSON → deutsche Meldung |

### 5.5 Abdeckungsmatrix

Die Zeilen aus Abschnitt 4 kommen **zusammen mit ihren Tests** in die jeweiligen Bereiche der TESTPLAN.md (vorher
würde `npm run test:coverage` rot). Danach gilt die bekannte Regel: keine Katalog-ID ohne Test.

## 6. Fehlerbehebungen

Jede Behebung mit dem Test, der sie absichert. Dateien sind Startpunkte, keine abschließende Liste. Umgesetzt
(Phase 1): 1–8 und 10, dazu 20 – „Stoppen“ ignoriert den zweiten Klick eines Doppelklicks
(`components/chat/Composer.tsx`, Test C21). Umgesetzt (Phase 2): 9, 11–15, 17–19; zu 13/14 kam hinzu, dass auch
„Neuer Chat“ den Entwurf stehen lässt und ein unverändert übernommenes Beispiel ein anderes ersetzen darf.

| # | Vorschlag | Dateien | Test |
|---|---|---|---|
| 1 | Gast-Passwort und Benutzername vor dem Vergleich normalisieren: NFKC, alle Leerraum- und Nullbreitenzeichen entfernen, Kleinschreibung (Gast-Passwörter bestehen nur aus a–z und 2–9). Admin-Passwort bleibt exakt | `lib/events/credentials.ts`, `lib/events/store.ts`, `app/api/auth/login/route.ts` | A13, A14 |
| 2 | Richtiges Passwort außerhalb des Zeitfensters („zu früh“, „abgelaufen“) erstattet den Versuch; „Passwort neu erzeugen“ setzt den Zähler des Namens zurück | `app/api/auth/login/route.ts`, `lib/auth/session.ts`, `lib/events/store.ts` | T19–T21 |
| 3, 4 | Synchrone Sperre (Ref) in `send` und `regenerate`, gesetzt vor dem ersten `await`; Eingabefeld sofort leeren | `components/chat/ChatApp.tsx`, `components/chat/Composer.tsx` | C21, C22 |
| 5 | Einfügen: Enthält die Zwischenablage Text, gewinnt der Text; Dateien nur ohne Text anhängen | `components/chat/Composer.tsx` | C16, C17 |
| 6 | Dateinamen-Bereinigung erhält immer die Endung, Rückfall `datei.<endung>` | `lib/files/limits.ts`, `lib/storage.ts` | F13 |
| 7, 8 | Text-Dekodierung mit BOM-Erkennung (UTF-8/16), striktes UTF-8 mit Rückfall auf Windows-1252; Nullbytes und Steuerzeichen (außer Zeilenumbruch und Tab) vor dem Speichern entfernen – für alle Formate | `lib/files/extract.ts`, `lib/files/process.ts` | F14, F15 |
| 9 | Diktat hängt an den **aktuellen** Text an (funktionales Update bzw. Ref statt eingefrorenem Wert) | `components/chat/Composer.tsx`, `components/chat/VoiceButton.tsx` | H06 |
| 10 | Zustand „startet“ sofort setzen, weitere Klicks ignorieren, beim Start eine eventuell noch laufende Aufnahme beenden | `components/chat/VoiceButton.tsx` | H05 |
| 11, 12 | Datei-Ablegen auf der ganzen Seite abfangen (auch bei Pause und im Posteingang, dann mit Hinweis); `preventDefault` beim Ablegen nur, wenn Dateien dabei sind | `components/chat/ChatApp.tsx` | C20, F17 |
| 13, 14 | Entwurf (Text + Anhänge) beim Bearbeiten zwischenspeichern und bei „Abbrechen“ und Chatwechsel zurückholen; Beispiel, Vorlage und „Mit Freebie besprechen“ überschreiben keinen Entwurf | `components/chat/ChatApp.tsx`, `components/chat/Composer.tsx` | C24–C26 |
| 15 | Import prüft auch `attachments`, `citations`, `images`, `native` und verwirft Ungültiges (wie schon bei Verbindungen und Mail-Karten); Fehlergrenze (Error Boundary) um den Nachrichtenbereich mit „Exportieren“/„Löschen“ | `lib/client/db.ts`, `components/chat/ChatApp.tsx` | E11 |
| 16 | entfällt – Überschreiben ist gewollt (Entscheidung 4); E12 hält das Verhalten fest | – | E12 |
| 17 | Zuordnung HTTP-Status → deutsche Meldung für Antworten ohne JSON, auch beim Upload | `lib/client/api.ts`, `lib/client/upload.ts` | C30 |
| 18 | Schreibfehler der Browser-Datenbank abfangen und melden, Eingabe nicht leeren | `components/chat/ChatApp.tsx`, `lib/client/db.ts` | E16 |
| 19 | Laufende Antwort pro Chat über Tabs hinweg sperren (Web Locks oder BroadcastChannel) | `components/chat/ChatApp.tsx` | E15 |

## 7. Entscheidungen

Am 14. Oktober 2026 entschieden:

1. **Gast-Passwörter tolerant vergleichen** (Leerzeichen, unsichtbare Zeichen und Groß-/Kleinschreibung egal; das
   Admin-Passwort bleibt exakt) – *ja, umgesetzt*
2. **Enter macht auf allen Geräten ohne Maus eine neue Zeile** (iPad, Handy, Android-Tablet), gesendet wird mit dem
   Knopf (mit angeschlossener Tastatur auch Strg/Cmd+Enter); am Rechner mit Maus oder Trackpad bleibt Enter = Senden
   – *entschieden und umgesetzt; bestätigt, dass es für alle Geräte ohne Maus gilt, nicht nur fürs iPad*
3. **Entwurf schützen:** Beispiel, Vorlage und „Mit Freebie besprechen“ füllen nur ein leeres Feld; „Bearbeiten“
   merkt sich den Entwurf; beim Chatwechsel bleibt der eigene Entwurf samt laufender Uploads stehen – *ja,
   umgesetzt: steht schon ein eigener Entwurf da, bleibt er stehen und ein Hinweis bietet „Ersetzen“ an*
4. **Import bei gleicher Chat-ID:** überschreiben (wie bisher) – *entschieden; Befund 16 ist damit kein Fehler, E12 hält es fest*

Noch nicht ausdrücklich entschieden – 5 und 8 sind als Fehlerbehebung nach Empfehlung in Phase 1 umgesetzt und
lassen sich leicht zurücknehmen:

5. **Login-Bremse:** richtige Daten außerhalb des Zeitfensters zählen nicht; ein neues Passwort hebt die Sperre auf
   – *nach Empfehlung umgesetzt*
6. **Warnung beim Verlassen** der Seite, nur während einer Antwort oder eines Uploads – *Empfehlung: ja*
7. **Zweiter Tab:** Senden im selben Chat sperren, solange dort in einem anderen Tab eine Antwort läuft, mit
   Hinweis – *Empfehlung: ja*
8. **Einfügen aus Office:** Text hat Vorrang vor dem mitkopierten Bild – *nach Empfehlung umgesetzt*

## 8. Umsetzung in Phasen

| Phase | Inhalt | Umfang |
|---|---|---|
| 1 · Vor der nächsten Schulung | Fehler mit Wirkung im Raum: 1, 2, 3, 4, 5, 7, 8, 10 und 6, je mit Test (A13, A14, C16, C17, C21, C22, H05, F13–F15, T19–T21) | **erledigt** (14. Oktober 2026) |
| 2 · Reihenfolgen und Robustheit | 9, 11–15, 17–19 mit Tests (C20, C24–C26, C30, E11, E15, E16, F17, H06); Enter macht eine neue Zeile (C19, Entscheidung 2); E12 hält das Überschreiben fest | **erledigt** (14. Oktober 2026) |
| 3 · Dauerhafte Absicherung | Testhelfer, Testdaten, Unit-Tests, Zufallstest W07 mit Nacht-Workflow; übrige ⚠️-Zeilen (A15, A16, C18, C23, C27–C29, E13, F11, F12, F16, F18, W08, Z18) | L |
| 4 · Echte Geräte | manuelle Abnahme aus TESTPLAN Abschnitt 9 erweitern: Einfügen aus Office (Windows/Edge, Mac/Safari), Enter auf iPad und Android, HEIC aus Fotos und Dateien-App, 5-Minuten-Diktat in Safari, Export auf dem iPad, Passwort-Manager am Schulungsrechner (C16, C19, F16, E14, T22) | S |

Jede Phase endet wie bisher: Typecheck, Lint, Unit-Tests, Abdeckungsmatrix und die komplette E2E-Suite grün,
dreimal hintereinander.
