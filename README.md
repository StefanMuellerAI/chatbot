# Freebie

**Freebie** ist der Schulungs-Chatbot von StefanAI: eine passwortgeschützte Spiel- und Übungsumgebung, in der
Teilnehmende ohne eigenes ChatGPT- oder Claude-Konto mit aktuellen KI-Modellen arbeiten.

- Modelle von **Anthropic (Claude)** und **OpenAI (GPT)** zur Auswahl, Standard: **Claude Sonnet 5.5** auf „Mittel“
- **Thinking-Effort** einstellbar (Niedrig, Mittel, Hoch, Maximal), Gedankengang einblendbar
- **Websuche** mit Quellenangaben
- **Datei-Upload**: PDF, Word, Excel/CSV, PowerPoint, Text, Code und Bilder (auch per Drag & Drop oder Einfügen)
- **Audio-Transkription** (MP3, M4A, WAV …) und **Spracheingabe** per Mikrofon
- **Bildgenerierung** im Chat (auch mit Claude) und im Bild-Modus, inkl. Bearbeitung hochgeladener Bilder
- **Artefakte**: HTML-Seiten, Charts, Mermaid-Diagramme, SVG und Dokumente im Seitenpanel mit Vorschau und Download
- **Admin-Bereich**: Modelle, Funktionen, Vorlagen, Hinweistext, Not-Aus, Passwort, Kosten- und Ersparnis-Dashboard
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
   | `APP_PASSWORD` | Passwort für Teilnehmende (später im Admin-Bereich pro Schulung änderbar) |
   | `ADMIN_PASSWORD` | Passwort für `/admin` |
   | `SESSION_SECRET` | Zufälliger Wert (≥ 32 Zeichen) zum Signieren der Sitzungen |
   | `ANTHROPIC_API_KEY` | Claude-Modelle |
   | `OPENAI_API_KEY` | GPT-Modelle, Bilder, Transkription, Spracheingabe |
   | `CRON_SECRET` | Schützt den täglichen Aufräumjob |

4. **Deployen.** Beim ersten Aufruf legt Freebie die Tabellen selbst an und befüllt Modelle und Vorlagen.
5. Unter **`/admin`** anmelden, in der Übersicht den **Systemstatus** prüfen und bei den Modellen auf **Test** klicken.

> **Hinweis zum Tarif:** Im Hobby-Tarif dürfen Funktionen höchstens 300 Sekunden laufen. Das reicht für normale
> Antworten, auch auf „Hoch“. Sehr lange Antworten auf „Maximal“ mit vielen Websuchen können an diese Grenze
> stoßen. Lange Audiodateien werden deshalb in Etappen verarbeitet.

## Lokale Entwicklung

```bash
npm install
cp .env.example .env.local   # Passwörter setzen; ohne API-Schlüssel: FREEBIE_MOCK=1
npm run dev                  # http://localhost:3000
```

Ohne `DATABASE_URL` nutzt Freebie eine eingebettete Datenbank (PGlite) unter `./.data/pglite`, ohne
Blob-Store (`BLOB_STORE_ID` bzw. `BLOB_READ_WRITE_TOKEN`) einen lokalen Dateispeicher unter `./.data/files`. Mit `FREEBIE_MOCK=1` antwortet ein
Mock-Provider – damit lässt sich die komplette Oberfläche ohne API-Kosten ausprobieren.

| Befehl | Zweck |
|---|---|
| `npm run check` | Typecheck, Lint und Unit-Tests |
| `npm run test` | Unit-Tests (Vitest), u. a. Stabilität der Cache-Präfixe |
| `npm run build` | Produktions-Build (nötig vor den E2E-Tests) |
| `npm run test:e2e` | Komplette E2E-Suite mit Playwright gegen den Produktions-Build (startet eigene Server) |
| `npm run test:coverage` | Abdeckungsmatrix: jede Einstellung, Route und Katalog-ID hat einen Test |
| `npm run test:e2e:live` | Live-Smoke gegen `freebie.stefanai.de` (`LIVE_PASSWORD`, optional `LIVE_ADMIN_PASSWORD`; < 0,10 $) |

### E2E-Tests

Die Suite (`tests/e2e`, Plan und Katalog in [TESTPLAN.md](TESTPLAN.md)) startet automatisch vier
Freebie-Instanzen mit frischer Datenbank und eine nachgebaute Anthropic-/OpenAI-API:

| Projekt | Inhalt | Server |
|---|---|---|
| `chat`, `mobile`, `tablet` | Oberfläche für Teilnehmende (Desktop, 390 px, 820 px) | Mock, parallel |
| `admin` | Admin-Bereich, ändert Einstellungen (Rücksetzen nach jedem Test) | Mock, seriell |
| `api` | alle Routen ohne Browser | Mock, parallel |
| `provider`, `provider-serial` | echte Claude-/GPT-Adapter gegen die Fake-API inkl. Caching-Vertrag | Fake-API |
| `belastung` | Neustart, Abbrüche, 500 Chats, 25 Personen über eine IP | Mock |
| `chat-webkit`, `chat-firefox` | Chat-Tests in Safari-Engine und Firefox (`E2E_BROWSERS=webkit,firefox`) | Mock |

Einzelne Bereiche: `npx playwright test --project=admin`, einzelne Tests: `-g "Q14"`. Testdateien
(PDF, Office, Audio, Bilder, Grenzfälle) erzeugt `tests/e2e/support/generate-files.ts` beim Start.

## Architektur in Kürze

```
app/                 Seiten (Chat, Login, Admin) und API-Routen
  api/chat           Streaming-Endpunkt (Server-Sent Events) mit Antwort-Cache und Tool-Schleife
  api/files, upload  Direkt-Upload (Vercel Blob), Textextraktion, Auslieferung privater Dateien
  api/transcribe     Audio in Etappen: start (ffmpeg teilt) → chunk (parallel) → finish
  api/admin          Modelle, Einstellungen, Vorlagen, Sicherheit, Übersicht
lib/providers        Adapter für Anthropic (Messages API) und OpenAI (Responses API) + Mock
lib/chat             System-Prompt, Aufbereitung der Nachrichten, Antwort-Cache, Ablaufsteuerung
lib/db               Drizzle-Schema, Bootstrap (CREATE TABLE IF NOT EXISTS), Startbelegung
components/          Chat-Oberfläche, Artefakt-Panel, Admin-Oberfläche, UI-Bausteine
proxy.ts             Schützt alle Seiten und APIs per signiertem Sitzungs-Cookie
```

Der Chatverlauf liegt ausschließlich im Browser (IndexedDB) und lässt sich als JSON exportieren und importieren.

## Caching – so spart Freebie Budget

1. **Prompt Caching der Anbieter.** Der System-Prompt ist eingefroren (kein Datum, keine Namen), Tools sind
   deterministisch sortiert, der Verlauf ist append-only und native Antwortblöcke (inkl. Thinking) gehen byte-genau
   zurück. Bei Claude sitzen Breakpoints auf System-Prompt und Vorlage, dazu automatisches Caching für den
   Gesprächsverlauf. Effort-Wechsel laufen über Mid-Conversation-Nachrichten (Claude) bzw.
   `configuration_update` (GPT-6), damit der Cache erhalten bleibt. Unit-Tests prüfen, dass der Präfix von Runde zu
   Runde byte-gleich bleibt.
2. **Antwort-Cache.** Identische Gesprächsverläufe (gleiches Modell, gleiche Vorlage, gleicher Tag) werden aus
   einem gemeinsamen Zwischenspeicher beantwortet – ideal, wenn alle denselben Übungsprompt eingeben.
   „Neu generieren“ umgeht ihn. Antworten mit generierten Bildern werden nicht gecacht.
3. **Datei- und Transkript-Cache.** Dateien werden per SHA-256 erkannt und nur einmal ausgelesen bzw. transkribiert.

Die Wirkung zeigt das Admin-Dashboard (Cache-Quote, Ersparnis in USD, Antwort-Cache-Treffer).

## Sicherheit und Datenschutz

- Freebie ist eine **Spielumgebung**: Login-Seite, Erststart-Dialog und Fußzeile weisen darauf hin, dass Daten
  bei OpenAI, Anthropic und Vercel in den USA verarbeitet werden.
- API-Schlüssel existieren nur serverseitig. Logs enthalten keine Gesprächsinhalte.
- Uploads liegen privat in Vercel Blob, werden nur mit gültiger Sitzung ausgeliefert und nach der eingestellten
  Frist gelöscht (täglicher Cron-Job).
- Artefakte laufen in einem abgeschotteten `iframe` (`sandbox` ohne `allow-same-origin`, eigene CSP).
- Not-Aus und sofortiger Passwortwechsel (meldet alle Sitzungen ab) im Admin-Bereich.
