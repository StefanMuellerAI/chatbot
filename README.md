# Freebie

**Freebie** ist der Schulungs-Chatbot von StefanAI: eine passwortgeschützte Spiel- und Übungsumgebung, in der
Teilnehmende ohne eigenes ChatGPT- oder Claude-Konto mit aktuellen KI-Modellen arbeiten.

- Modelle von **Anthropic (Claude)** und **OpenAI (GPT)** zur Auswahl, Standard: **Claude Sonnet 5.5** auf „Mittel“
- **Thinking-Effort** einstellbar (Niedrig, Mittel, Hoch, Maximal), Gedankengang einblendbar
- **Websuche** mit Quellenangaben
- **Datei-Upload**: PDF, Word, Excel/CSV, PowerPoint, E-Mails (`.eml`), Text, Code und Bilder (auch per Drag & Drop oder Einfügen)
- **Fundus**: 150 erfundene, echt wirkende Word-, Excel- und PowerPoint-Dateien und 40 E-Mail-Verläufe aus neun
  Verwaltungen (Schwerpunkt Kommune) zum Anhängen – zum Üben, ohne echte Daten der eigenen Behörde (eigener Schalter im
  Admin, Plan: [FUNDUS-PLAN.md](FUNDUS-PLAN.md)). Die Kursleitung pflegt den Fundus im Admin: **eigene Dokumente**
  (Word, Excel, PowerPoint, PDF) und **E-Mail-Verläufe** (`.eml`) hochladen, mitgelieferte Einträge ausblenden und
  **Prompts mit Platzhaltern** in Kategorien anlegen. Teilnehmende füllen einen Prompt in einer Maske aus (jedes Feld
  ist Pflicht) und bekommen den fertigen Text ins Eingabefeld (Plan: [FUNDUS-PFLEGE-PLAN.md](FUNDUS-PFLEGE-PLAN.md)).
  Ganze **Prompt-Bibliotheken** lassen sich als JSON importieren (Musterdatei zum Herunterladen, Prüfschritt, Kategorie
  wählen oder neu anlegen) und im selben Format exportieren (Plan: [PROMPT-IMPORT-PLAN.md](PROMPT-IMPORT-PLAN.md))
- **Audio-Transkription** (MP3, M4A, WAV …) und **Spracheingabe** per Mikrofon
- **Bildgenerierung** im Chat (auch mit Claude) und im Bild-Modus, inkl. Bearbeitung hochgeladener Bilder
- **Artefakte**: HTML-Seiten, Charts, Mermaid-Diagramme, SVG und Dokumente im Seitenpanel mit Vorschau und Download
- **Posteingang**: eigenes Übungs-Postfach je Gast (`name@freebie.example`) – E-Mails an die eigene Gruppe und die
  Kursleitung, mit Antworten, Weiterleiten, Suche und Adressbuch; wird beim Abmelden geleert
- **Gruppenchats**: Teilnehmende einer Gruppe laden sich in einen gemeinsamen Chat ein, posten Notizen und Texte und
  fragen Freebie mit **@Freebie** – etwa nach einer Zusammenfassung oder Aufgabenliste. Nur innerhalb einer Gruppe;
  die Kursleitung kann Gruppenchats zum Vorführen starten (Plan: [GRUPPENCHAT-PLAN.md](GRUPPENCHAT-PLAN.md))
- **Verbindungen**: im Chat pro Gespräch zuschaltbar – mit der Verbindung „Posteingang“ liest Freebie die eigenen
  E-Mails und kann im Namen der Person senden (gekennzeichnet „über Freebie“)
- **Admin-Bereich**: Modelle, Funktionen, Vorlagen, Fundus (eigene Inhalte, Prompts, Kategorien), Hinweistext,
  Begrüßungs-E-Mail, Not-Aus, Termine und Gast-Zugänge, Kosten- und Ersparnis-Dashboard
- **Caching auf allen Ebenen**: Prompt Caching bei beiden Anbietern, gemeinsamer Antwort-Cache, Datei- und Transkript-Cache

Der ursprüngliche Umsetzungsplan steht in [PLAN.md](PLAN.md).

---

## Einrichtung auf Vercel

1. **Projekt importieren:** In Vercel ein Projekt aus diesem Repository anlegen (Framework: Next.js, Region `iad1`).
2. **Speicher verbinden** (Projekt → *Storage*):
   - **Neon Postgres** anlegen und verbinden → setzt `DATABASE_URL`.
   - **Blob-Store** mit Zugriff **privat** anlegen und verbinden → setzt `BLOB_STORE_ID` (OIDC-Anmeldung) oder bei
     älteren Stores `BLOB_READ_WRITE_TOKEN`. Danach neu deployen; der Admin-Bereich zeigt unter „Systemstatus“, welche
     Variable erkannt wurde.
3. **Umgebungsvariablen** (Projekt → *Settings → Environment Variables*), siehe [.env.example](.env.example):

   | Variable | Zweck |
   |---|---|
   | `ADMIN_PASSWORD` | Passwort der Kursleitung (Chat und Admin-Bereich) |
   | `ADMIN_USERNAME` | Optional: Benutzername der Kursleitung (Standard `admin`) |
   | `SESSION_SECRET` | Zufälliger Wert (≥ 32 Zeichen) zum Signieren der Sitzungen |
   | `ANTHROPIC_API_KEY` | Claude-Modelle |
   | `OPENAI_API_KEY` | GPT-Modelle, Bilder, Transkription, Spracheingabe |
   | `CRON_SECRET` | Schützt den täglichen Aufräumjob |

4. **Deployen.** Beim ersten Aufruf legt Freebie die Tabellen selbst an und befüllt Modelle und Vorlagen.
5. Mit dem Admin-Zugang anmelden, unter **`/admin`** in der Übersicht den **Systemstatus** prüfen und bei den Modellen
   auf **Test** klicken.
6. Unter **Termine** einen Termin mit Gruppen und Gästen anlegen und die Zugangsdaten drucken oder als CSV
   exportieren.

## Zugänge

- **Kursleitung:** ein Zugang aus `ADMIN_USERNAME`/`ADMIN_PASSWORD` für Chat und Admin-Bereich (Sitzung 12 Stunden).
- **Gäste:** Im Admin-Bereich unter **Termine** legt die Kursleitung Termine (höchstens 24 Stunden) mit beliebig
  vielen Gruppen und Gästen an. Jeder Gast bekommt einen einfachen Benutzernamen (z. B. `fuchs27`) und ein einfaches
  Passwort (z. B. `sonne482`). Gäste kommen nur in den Chat, ab 30 Minuten vor Beginn. Groß-/Kleinschreibung und
  mitkopierte Leerzeichen spielen keine Rolle; Name und Passwort lassen sich auch zusammen einfügen.
- **Ablauf:** Zum Termin-Ende verfallen die Gast-Zugänge sofort. Zehn Minuten vorher erscheint im Chat ein Hinweis
  mit Export-Knopf; danach werden die Gast-Chats vom Gerät gelöscht. Kosten und Anfragen bleiben 90 Tage in der
  Statistik („Nach Termin“ in der Übersicht).
- **Posteingang:** Jeder Gast hat ein Übungs-Postfach mit der Adresse `benutzername@freebie.example` und bekommt bei
  der ersten Anmeldung die Begrüßungs-E-Mail (Text im Admin unter **Einstellungen**). Gäste schreiben nur ihrer
  eigenen Gruppe und der Kursleitung (`kursleitung@freebie.example`); die Kursleitung schreibt allen Gruppen
  laufender Termine. Es geht keine Mail nach draußen. Beim Abmelden wird das eigene Postfach geleert (Mails an
  andere bleiben bei ihnen), zum Termin-Ende verschwinden alle Postfächer des Termins. Abschalten lässt sich alles
  mit dem Schalter **Posteingang**.
- **Gruppenchats:** Wer einen Gruppenchat startet, lädt Personen aus der eigenen Gruppe ein (die Kursleitung wählt
  dafür eine Gruppe eines laufenden Termins); nur sie kann einladen, entfernen, umbenennen und den Chat für alle
  löschen. Alle anderen können ihn verlassen und sehen danach nur noch den Verlauf bis dahin. Gruppenchats liegen auf
  dem Server und bleiben beim Abmelden erhalten; zum Termin-Ende (und wenn Termin, Gruppe oder die startende Person
  gelöscht wird) verschwinden sie. Abschalten lässt sich alles mit dem Schalter **Gruppenchats**.
- `APP_PASSWORD` aus früheren Versionen wird nicht mehr verwendet und kann in Vercel gelöscht werden.

Alle Funktionen von Chat und Admin-Bereich beschreibt das Handbuch [docs/Freebie-Handbuch.pdf](docs/Freebie-Handbuch.pdf).
Für Teilnehmende gibt es eine eigene Fassung ohne Admin-Bereich:
[docs/Freebie-Handbuch-Teilnehmende.pdf](docs/Freebie-Handbuch-Teilnehmende.pdf).

> **Hinweis zum Tarif:** Im Hobby-Tarif dürfen Funktionen höchstens 300 Sekunden laufen. Das reicht für normale
> Antworten, auch auf „Hoch“. Sehr lange Antworten auf „Maximal“ mit vielen Websuchen können an diese Grenze
> stoßen. Lange Audiodateien werden deshalb in Etappen verarbeitet.

## Lokale Entwicklung

```bash
npm install
cp .env.example .env.local   # ADMIN_PASSWORD setzen; ohne API-Schlüssel: FREEBIE_MOCK=1
npm run dev                  # http://localhost:3000
```

Ohne `DATABASE_URL` nutzt Freebie eine eingebettete Datenbank (PGlite) unter `./.data/pglite`, ohne
Blob-Store (`BLOB_STORE_ID` bzw. `BLOB_READ_WRITE_TOKEN`) einen lokalen Dateispeicher unter `./.data/files`. Mit `FREEBIE_MOCK=1` antwortet ein
Mock-Provider – damit lässt sich die komplette Oberfläche ohne API-Kosten ausprobieren.

| Befehl | Zweck |
|---|---|
| `npm run check` | Typecheck, Lint und Unit-Tests |
| `npm run library` | Fundus erzeugen (`.library/`); läuft automatisch vor `dev` und `build`, mit `-- --force` neu |
| `npm run library:check -- <datei>` | einzelne Inhaltsdateien des Fundus prüfen, ohne alles zu erzeugen |
| `npm run test` | Unit-Tests (Vitest), u. a. Stabilität der Cache-Präfixe |
| `npm run build` | Produktions-Build (nötig vor den E2E-Tests) |
| `npm run test:e2e` | Komplette E2E-Suite mit Playwright gegen den Produktions-Build (startet eigene Server) |
| `npm run test:coverage` | Abdeckungsmatrix: jede Einstellung, Route und Katalog-ID hat einen Test |
| `npm run docs:handbuch` | Beide Handbücher als PDF neu erzeugen – für Kolleginnen und Kollegen ([docs/Freebie-Handbuch.pdf](docs/Freebie-Handbuch.pdf)) und für Teilnehmende ([docs/Freebie-Handbuch-Teilnehmende.pdf](docs/Freebie-Handbuch-Teilnehmende.pdf)), siehe [docs/handbuch](docs/handbuch/README.md) |
| `npm run test:e2e:live` | Live-Smoke gegen `freebie.stefanai.de` (`LIVE_ADMIN_PASSWORD`, legt einen Termin mit einem Gast an und löscht ihn wieder; < 0,10 $) |

### E2E-Tests

Die Suite (`tests/e2e`, Plan und Katalog in [TESTPLAN.md](TESTPLAN.md)) startet automatisch vier
Freebie-Instanzen mit frischer Datenbank und eine nachgebaute Anthropic-/OpenAI-API:

| Projekt | Inhalt | Server |
|---|---|---|
| `chat`, `mobile`, `tablet` | Oberfläche für Teilnehmende (Desktop, 390 px, 820 px) | Mock, parallel |
| `admin` | Admin-Bereich, ändert Einstellungen und den Fundus (Rücksetzen nach jedem Test) | Mock, seriell |
| `api` | alle Routen ohne Browser | Mock, parallel |
| `provider`, `provider-serial` | echte Claude-/GPT-Adapter gegen die Fake-API inkl. Caching-Vertrag | Fake-API |
| `belastung` | Neustart, Abbrüche, 500 Chats, 25 Personen über eine IP (Chat, Posteingang und Gruppenchats) | Mock |
| `chat-webkit`, `chat-firefox` | Chat-Tests in Safari-Engine und Firefox (`E2E_BROWSERS=webkit,firefox`) | Mock |

Einzelne Bereiche: `npx playwright test --project=admin`, einzelne Tests: `-g "Q14"`. Testdateien
(PDF, Office, Audio, Bilder, Grenzfälle) erzeugt `tests/e2e/support/generate-files.ts` beim Start.

## Architektur in Kürze

```
app/                 Seiten (Chat, Login, Admin) und API-Routen
  api/chat           Streaming-Endpunkt (Server-Sent Events) mit Antwort-Cache und Tool-Schleife
  api/files, upload  Direkt-Upload (Vercel Blob), Textextraktion, Auslieferung privater Dateien
  api/transcribe     Audio in Etappen: start (ffmpeg teilt) → chunk (parallel) → finish
  api/library        Fundus: Katalog, Vorschau, Download, Anhängen (mitgeliefert aus .library/, eigene aus Postgres und Blob)
  api/admin          Modelle, Einstellungen, Vorlagen, Sicherheit, Übersicht, Termine
  api/admin/fundus   Fundus pflegen: Upload nach fundus/, Prüfen, eigene Dokumente und Verläufe, Prompts (auch Import), Kategorien, Ausblenden
  api/mail           Posteingang: Liste, Lesen, Senden, Markieren, Löschen, Adressbuch
  api/groupchats     Gruppenchats: Starten, Mitglieder, Beiträge, Abfrage „seit Stand n“, Antwort von Freebie (SSE)
  api/status         gemeinsame Abfrage alle 15 s: neue Mails und Gruppenchats (Einladungen, Neues)
lib/providers        Adapter für Anthropic (Messages API) und OpenAI (Responses API) + Mock
lib/tools            Eigene Werkzeuge für die Tool-Schleife (Bild erzeugen)
lib/mail             Postfächer in Postgres (eine Zeile je Kopie), Werkzeuge der Verbindung „Posteingang“
lib/groupchat        Gruppenchats in Postgres: Rechte, Mitglieder, Beiträge, Sperre „eine Antwort zur Zeit“, Aufräumen
lib/chat             System-Prompt, Aufbereitung der Nachrichten, Antwort-Cache, Ablaufsteuerung
lib/db               Drizzle-Schema, Bootstrap (CREATE TABLE IF NOT EXISTS), Startbelegung (inkl. 12 Start-Prompts)
lib/fundus           Eigene Fundus-Inhalte: Speichern, Prüfen und Vorschau beim Hochladen, Hinweise auf echte Daten
lib/shared/placeholders.ts  Platzhalter {{Name}} in Prompts: Parsen, Prüfen, Ausfüllen (Browser und Server)
lib/shared/prompt-import.ts Prompt-Bibliotheken als JSON: Musterdatei, Lesen und Prüfen beim Import, Export
components/          Chat-Oberfläche, Posteingang (components/mail), Gruppenchats (components/groupchat), Artefakt-Panel, Fundus-Dialog, Admin-Oberfläche, UI-Bausteine
library/             Fundus: erfundenes Weltmodell, Inhalte als Daten und der Generator für .docx/.xlsx/.pptx/.eml
proxy.ts             Schützt alle Seiten und APIs per signiertem Sitzungs-Cookie
```

Der Chatverlauf liegt ausschließlich im Browser (IndexedDB) und lässt sich als JSON exportieren und importieren.
Die Mails des Posteingangs liegen dagegen auf dem Server (Postgres), weil sie zwischen den Teilnehmenden ausgetauscht
werden – nur so lange, wie der Termin läuft bzw. bis zum Abmelden. Auch Gruppenchats liegen auf dem Server
(alle Mitglieder sehen denselben Stand); sie bleiben bis zum Termin-Ende und nehmen beim Export eine Kopie mit.

## Caching – so spart Freebie Budget

1. **Prompt Caching der Anbieter.** Der System-Prompt ist eingefroren (kein Datum, keine Namen), Tools sind
   deterministisch sortiert, der Verlauf ist append-only und native Antwortblöcke (inkl. Thinking) gehen byte-genau
   zurück. Bei Claude sitzen Breakpoints auf System-Prompt und Vorlage, dazu automatisches Caching für den
   Gesprächsverlauf. Effort-Wechsel laufen über Mid-Conversation-Nachrichten (Claude) bzw.
   `configuration_update` (GPT-6), damit der Cache erhalten bleibt. Unit-Tests prüfen, dass der Präfix von Runde zu
   Runde byte-gleich bleibt.
2. **Antwort-Cache.** Identische Gesprächsverläufe (gleiches Modell, gleiche Vorlage, gleicher Tag) werden aus
   einem gemeinsamen Zwischenspeicher beantwortet – ideal, wenn alle denselben Übungsprompt eingeben.
   „Neu generieren“ umgeht ihn. Antworten mit generierten Bildern und Chats mit verbundenem Posteingang (persönliche
   Inhalte) werden nicht gecacht. Die Werkzeuge des Posteingangs sind immer Teil der Anfrage, ob verbunden oder
   nicht – so bleibt der Präfix beim Umschalten gleich; der Hinweis aufs Umschalten steht nur in der jeweiligen
   Nachricht.
   Gruppenchats nutzen den Antwort-Cache nie (jeder Verlauf ist anders und gehört der Gruppe). Dafür teilen sich
   alle Mitglieder eines Gruppenchats den Prompt-Cache: Die Beiträge gehen mit Autor und Uhrzeit als Runden an das
   Modell, der Cache-Schlüssel hängt am Chat, und die Werkzeuge nennen keine persönliche Adresse – egal, wer fragt,
   bleibt der Präfix byte-gleich (V08).
3. **Datei- und Transkript-Cache.** Dateien werden per SHA-256 erkannt und nur einmal ausgelesen bzw. transkribiert.
   Eigene Fundus-Dateien haben feste Bytes – wie bei den mitgelieferten gibt es Treffer über Personen hinweg; ihr
   ausgelesener Text liegt zusätzlich in der Datenbank und überdauert den Aufräumjob. Ein ausgefüllter Prompt ist
   normaler Nachrichtentext: kein eigener Teil im System-Prompt, der Prompt-Cache bleibt unberührt, gleiche Werte
   treffen den Antwort-Cache.

Die Wirkung zeigt das Admin-Dashboard (Cache-Quote, Ersparnis in USD, Antwort-Cache-Treffer).

## Sicherheit und Datenschutz

- Freebie ist eine **Spielumgebung**: Login-Seite, Erststart-Dialog und Fußzeile weisen darauf hin, dass Daten
  bei OpenAI, Anthropic und Vercel in den USA verarbeitet werden.
- API-Schlüssel existieren nur serverseitig. Logs enthalten keine Gesprächsinhalte.
- Uploads liegen privat in Vercel Blob, werden nur mit gültiger Sitzung ausgeliefert und nach der eingestellten
  Frist gelöscht (täglicher Cron-Job).
- Artefakte laufen in einem abgeschotteten `iframe` (`sandbox` ohne `allow-same-origin`, eigene CSP).
- Not-Aus und sofortiger Passwortwechsel (meldet alle Sitzungen ab) im Admin-Bereich.
- **Posteingang:** ein Übungs-Postfach ohne echten Mailversand. Freebie sieht Mails nur, wenn die Person im Chat die
  Verbindung einschaltet, und nur das eigene Postfach. Mailtexte gehen als markiertes Material an das Modell, das
  angewiesen ist, Anweisungen darin nicht zu folgen; gesendet wird nur auf ausdrücklichen Auftrag, höchstens 5 Mails pro Antwort, sichtbar als
  „über Freebie“. Postfächer werden beim Abmelden und zum Termin-Ende gelöscht. Empfehlung für den Hinweistext:
  „Bitte keine echten oder vertraulichen Daten in Chats und Mails.“
- **Fundus pflegen:** eigene Dokumente und Verläufe der Kursleitung bleiben **dauerhaft** gespeichert (bis zum
  Löschen; der Aufräumjob lässt sie stehen) und gehen nur beim Anhängen an die KI-Anbieter. Speichern geht nur mit der
  Bestätigung „keine echten personenbezogenen oder vertraulichen Daten“; Freebie warnt vor echten Mail-Domains,
  gültigen IBANs und Telefonnummern. Die Dateien liegen unter `fundus/` getrennt von Uploads: Gäste erreichen sie nur
  über `/api/library/[id]/file` (mit Schalter-Prüfung), nie über `/api/files` oder die Upload-Wege. Werte aus der
  Prompt-Maske bleiben nur im Speicher des Browsers (nicht in `localStorage`).
- **Gruppenchats:** nur innerhalb einer Gruppe eines laufenden Termins; der Server prüft jede Einladung. Nicht-Mitglieder
  bekommen auf alles 404, wer gegangen ist, sieht nichts Späteres. Der Posteingang ist im Gruppenchat nie verbunden
  (Freebie würde sonst private Mails in den Chat holen). Beiträge gehen als markierte Nachrichten mit Autor an das
  Modell; ein Beitrag kann den Rahmen nicht schließen oder einen fremden vortäuschen. Unter der Eingabe steht
  „Alle Mitglieder sehen, was du hier schreibst.“
