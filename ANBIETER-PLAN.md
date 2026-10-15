# Plan: Weitere Modell-Anbieter – Google Gemini und Mistral

Stand: 15. Oktober 2026 · Grundlage: aktueller Code (`lib/providers/*`, `lib/chat/*`, Admin-Bereich, E2E-Suite), offizielle
Dokumentation (ai.google.dev, docs.mistral.ai) und die SDKs `@google/genai` 2.30.0 und `@mistralai/mistralai` 2.7.0

## 1. Ziel

Neben Claude (Anthropic) und GPT (OpenAI) stehen im Chat auch **Gemini (Google)** und **Mistral** zur Auswahl. Wie bei
den bisherigen Anbietern reicht ein API-Schlüssel in der Umgebung:

| Variable | Zweck |
|---|---|
| `GEMINI_API_KEY` | Gemini-Modelle (Google AI Studio, Projekt **mit Abrechnung**, siehe Abschnitt 9) |
| `MISTRAL_API_KEY` | Mistral-Modelle (La Plateforme) |
| `MISTRAL_REGION` | optional: `eu` (Standard, Verarbeitung in der EU) oder `global` |

Ohne Schlüssel bleiben die Modelle des Anbieters unsichtbar, so wie heute bei Claude und GPT. Alles, was Freebie heute
kann, funktioniert mit den neuen Modellen so weit, wie der Anbieter es hergibt: Gedankengang, Effort, Datei-Upload,
Bild-Werkzeug, Posteingang, Gruppenchats, Antwort-Cache, Prompt-Caching und exakte Kosten. Bilder, Transkription und
Spracheingabe bleiben bei OpenAI.

Die E2E-Suite bleibt vollständig: Die bestehenden Anbieter-Tests (V01–V08) laufen künftig für alle vier Anbieter, die
Besonderheiten von Gemini und Mistral bekommen eigene Tests (Abschnitt 10).

## 2. Was sich für Kursleitung und Teilnehmende ändert

**Teilnehmende**

- Die Modellauswahl hat vier Gruppen: Anthropic, OpenAI, **Google**, **Mistral**, jeweils mit eigenem Farbpunkt.
- Bei Mistral-Modellen fehlt der Schalter „Websuche“ (Abschnitt 6.4). Bei Gemini erscheinen unter den Quellen die
  **Google-Suchvorschläge**, die Google bei der Websuche vorschreibt (Abschnitt 5.5).
- Effort-Stufen: Gemini und Mistral bieten „Niedrig“, „Mittel“ und „Hoch“. „Maximal“ gibt es nur, wo der Anbieter
  eine eigene vierte Stufe hat (Abschnitt 4.3).
- Der Hinweistext nennt die neuen Anbieter und wo sie verarbeiten (Abschnitt 9).

**Kursleitung (Admin)**

- **Systemstatus** zeigt zwei neue Zeilen: „Google-API-Schlüssel (Gemini)“ und „Mistral-API-Schlüssel“.
- **Modelle:** neue Knöpfe „Gemini-Modelle abrufen“ und „Mistral-Modelle abrufen“, das Anbieterfeld kennt vier
  Anbieter, „Test“ funktioniert für alle.
- **Startbelegung:** Die neuen Modelle erscheinen nach dem Deploy **einmalig** auch in der bestehenden Datenbank
  (heute bekommt nur eine leere Datenbank die Startmodelle). Gelöschte Modelle kommen danach nicht wieder.
- Jedes Modell kann Titelmodell sein (Einstellungen → Titelmodell), auch Gemini und Mistral.

## 3. Modelle zum Start

Preise in USD pro 1 Mio. Tokens, Listenpreise vom 15. Oktober 2026, im Admin-Bereich änderbar. Die Mistral-Preise
enthalten den Aufschlag von 10 % für den EU-Endpunkt (Entscheidung 1).

| ID | API-Modell | Anzeige | Eingabe | Ausgabe | Cache-Lesen | Bemerkung |
|---|---|---|---|---|---|---|
| `gemini-4-argon` | `gemini-4-argon` | Gemini 4 Argon | 2,00 | 10,00 | 0,10 | Googles Flaggschiff; **ab 1. Dezember 2026 doppelt so teuer** (4 / 20 / 0,20) |
| `gemini-3-8-flash` | `gemini-3.8-flash` | Gemini 3.8 Flash | 0,75 | 3,75 | 0,075 | Allrounder; **ab 1. Januar 2027 doppelt so teuer** |
| `gemini-3-5-flash-lite` | `gemini-3.5-flash-lite` | Gemini 3.5 Flash-Lite | 0,30 | 2,50 | 0,03 | schnell und günstig |
| `mistral-medium-3-5` | `mistral-medium-3-5` | Mistral Medium 3.5 | 1,65 | 8,25 | 0,165 | ausgewogen, Verarbeitung in der EU |
| `mistral-large-4` | `mistral-large-4-0` | Mistral Large 4 (Vorschau) | 1,50 | 4,60 | 0,15 | „Public Preview“ seit 6. Oktober, 1 Mio. Tokens Kontext |
| `mistral-small-4` | `mistral-small-2603` | Mistral Small 4 | 0,165 | 0,66 | 0,0165 | schnell und günstig |

- **Feste Modell-IDs statt Aliasen** (`mistral-small-2603` statt `mistral-small-latest`): Mistral ändert hinter
  `-latest` Modell und Preis ohne Ankündigung. So stimmen die Kosten in der Statistik.
- **Cache-Schreiben** kostet bei beiden nichts extra (Preis 0). Gemini und Mistral cachen automatisch.
- **Höchstlänge der Ausgabe:** 64.000 (Gemini) bzw. 32.000 (Mistral, in Phase 0 prüfen).
- **Sortierung:** nach Claude und GPT (70–90 Gemini, 100–120 Mistral). Standardmodell bleibt Claude Sonnet 5.5.
- **Preiserhöhungen bei Gemini:** Ich trage die heutigen Preise ein und nenne die beiden Stichtage in README und
  Handbuch (Checkliste „Preise prüfen“). Freebie rechnet die Kosten beim Speichern aus; ohne Anpassung wären sie ab
  Dezember zu niedrig.

## 4. Architektur: ein Anbieter-Register statt Fallunterscheidungen

Heute steht die Frage „Claude oder OpenAI?“ an rund 15 Stellen als `provider === "anthropic" ? … : …`. Jeder neue
Anbieter würde dort still beim OpenAI-Zweig landen: falsches SDK beim Titel, beim Test und beim Abrufen der Modelle,
„Für OpenAI ist noch kein API-Schlüssel hinterlegt“ bei einem Gemini-Modell. Drei Stellen lassen neue Anbieter heute
sogar ganz scheitern:

- **Chat bricht ab:** `lib/shared/schemas.ts` lässt bei `native.provider` nur `anthropic | openai | mock` zu. Die
  zweite Nachricht an ein Gemini-Modell endet mit 400 „Ungültige Anfrage.“
- **Modelle unsichtbar:** `providerConfigured()` kennt nur die beiden Schlüssel, die Modellauswahl nur zwei Gruppen.
- **Fehler als „interner Fehler“:** `lib/errors.ts` liest nur `status`; Mistral meldet `statusCode`.

### 4.1 Neu: `lib/shared/providers.ts` (Browser und Server)

```ts
export const PROVIDER_IDS = ["anthropic", "openai", "gemini", "mistral"] as const;
export type ApiProvider = (typeof PROVIDER_IDS)[number];
export type Provider = ApiProvider | "mock";

export const PROVIDER_INFO: Record<Provider, { label: string; product: string; color: string; envKey?: string }> = {
  anthropic: { label: "Anthropic", product: "Claude",  color: "#d97757", envKey: "ANTHROPIC_API_KEY" },
  openai:    { label: "OpenAI",    product: "OpenAI",  color: "#10a37f", envKey: "OPENAI_API_KEY" },
  gemini:    { label: "Google",    product: "Gemini",  color: "#1a73e8", envKey: "GEMINI_API_KEY" },
  mistral:   { label: "Mistral",   product: "Mistral", color: "#f59e0b", envKey: "MISTRAL_API_KEY" },
  mock:      { label: "Test",      product: "Mock",    color: "#9b7bff" },
};
```

Daraus leiten sich ab: der `Provider`-Typ, die zod-Enums (`schemas.ts`, Admin-Routen `models` und `discover`), die
Liste beim Import (`lib/client/db.ts`), Gruppen und Farben der Modellauswahl, die Zeilen im Systemstatus und die
Meldung „Für Gemini ist noch kein API-Schlüssel hinterlegt“.

### 4.2 Neu: `lib/providers/index.ts` (nur Server)

```ts
export const ADAPTERS: Record<ApiProvider, {
  run(req: ProviderRequest): Promise<ProviderResult>;
  test(modelId: string): Promise<string>;
  list(): Promise<{ id: string; name: string; caps?: Partial<ModelCapabilities> }[]>;
  title(modelId: string, prompt: string): Promise<{ title: string; usage: { input: number; output: number } }>;
  webSearchCostUsd: number;
}>;
```

`run.ts`, `api/title`, `api/admin/models/test`, `api/admin/models/discover` und der Gruppenchat rufen nur noch
`ADAPTERS[model.provider]` auf. Ein Unit-Test prüft, dass jeder Anbieter in beiden Registern vollständig ist. Diese
Phase ändert kein Verhalten; alle heutigen Tests bleiben unverändert grün.

### 4.3 Wie die Freebie-Funktionen bei den Anbietern ankommen

| Freebie | Claude | GPT | **Gemini** | **Mistral** |
|---|---|---|---|---|
| Schnittstelle | Messages API | Responses API | `generateContentStream` | Chat Completions (`chat.stream`) |
| System-Prompt + Vorlage | 2 System-Blöcke | `instructions` | `systemInstruction` | erste `system`-Nachricht |
| Effort Niedrig / Mittel / Hoch / Maximal | `output_config.effort` | `reasoning.effort` | `thinkingLevel` low / medium / high / – | `reasoningEffort` low / medium / high / xhigh (Phase 0) |
| Effort-Wechsel mitten im Chat | System-Nachricht, Präfix bleibt | `configuration_update` | Einstellung je Anfrage, Präfix bleibt | Einstellung je Anfrage, Präfix bleibt |
| Gedankengang | Thinking-Zusammenfassung | Reasoning-Zusammenfassung | `includeThoughts`, Teile mit `thought: true` | `thinking`-Chunks |
| Prompt-Caching | Breakpoints, 5 min / 1 h | `prompt_cache_key` | automatisch (implizit) | automatisch + `promptCacheKey` |
| Websuche | `web_search` + `web_fetch` | `web_search` | Google-Suche (`googleSearch`) | – (Abschnitt 6.4) |
| Eigene Werkzeuge | `strict` | `strict` | `parametersJsonSchema`, Prüfung mit zod | `strict` (Phase 0), Prüfung mit zod |
| PDF nativ | `document` | `input_file` | `inlineData` `application/pdf` | aus (Text wie bisher) |
| Bilder | ja | ja | ja, **ohne GIF** | ja, **höchstens 8 je Anfrage** |
| Verlauf byte-genau zurück | Inhalts-Blöcke | Output-Items | `Content` mit Gedanken-Signaturen | Nachrichten inkl. Denk-Chunks |
| Ablehnung | `stop_reason: refusal` | `refusal` | `SAFETY`, `PROHIBITED_CONTENT`, `blockReason` … | – (kein eigener Grund) |

Die Effort-Abbildung steht wie heute je Modell im Admin (`effortMap`). Fehlt eine Stufe in der Abbildung, bietet die
Oberfläche sie nicht an – „Maximal“ verschwindet bei Gemini also ohne Sonderlogik.

## 5. Gemini-Adapter (`lib/providers/gemini.ts`)

### 5.1 Schnittstelle

- **SDK `@google/genai`** mit `ai.models.generateContentStream`. Google empfiehlt für neue Projekte inzwischen die
  „Interactions API“; `generateContent` bleibt aber voll unterstützt. Ich bleibe bei `generateContent`, weil es wie
  unsere anderen Adapter ohne Zustand beim Anbieter arbeitet (voller Verlauf in jeder Anfrage, nichts gespeichert) und
  weil die Interactions API Sicherheitseinstellungen und Caching noch nicht vollständig kann. Umstieg später möglich
  (Abschnitt 14).
- **Client:** `new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, httpOptions: { baseUrl: process.env.GEMINI_BASE_URL } })`.
  Den Schlüssel übergebe ich ausdrücklich: Das SDK liest sonst bevorzugt `GOOGLE_API_KEY`. `GEMINI_BASE_URL` ist nur
  für die Fake-API der Tests.

### 5.2 Anfrage (deterministisch wie bei Claude und GPT)

- `systemInstruction`: globaler Prompt, bei einer Vorlage mit Abschnitt „Rolle für dieses Gespräch“ (wie bei GPT).
- `tools`: eigene Werkzeuge als `functionDeclarations` mit `parametersJsonSchema` (echtes JSON-Schema, kennt
  `additionalProperties: false`, `enum`, `integer`), nach Namen sortiert; danach `googleSearch`.
- `thinkingConfig: { thinkingLevel, includeThoughts: true }`, `maxOutputTokens` aus `maxTokensFor()`. Achtung: Bei
  Gemini zählt das Denken zur Ausgabegrenze.
- Websuche für eine Nachricht aus: derselbe Text-Hinweis wie bei Claude als letzter Teil der Nutzernachricht. Die
  Werkzeugliste bleibt gleich, der Präfix auch.
- Bilder: `inlineData` (PNG, JPEG, WebP). **GIF kann Gemini nicht**; ein GIF wird zum Platzhalter
  „[Bild … – GIF kann dieses Modell nicht lesen]“. Dafür bekommt `prepare.ts` eine erlaubte Bildliste je Anbieter.
- Native PDFs: `inlineData` mit `application/pdf` (bis 50 MB, also weit über unserer Upload-Grenze).

### 5.3 Gedanken-Signaturen (der heikelste Teil)

Gemini hängt an Antworten verschlüsselte **Gedanken-Signaturen** (`thoughtSignature`). Bei Werkzeug-Aufrufen sind sie
Pflicht: Fehlt in der laufenden Runde eine Signatur, lehnt die API mit 400 ab.

- **Speichern:** `native.items` enthält die `Content`-Objekte des Modells so, wie sie kamen, und die
  Funktionsantworten als eigene `user`-Contents (wie `appended` bei Claude).
- **Zusammensetzen aus dem Stream:** Aufeinanderfolgende Textteile ohne Signatur werden zusammengefasst. Ein Teil mit
  Signatur bleibt allein, auch ein leerer Textteil am Ende, der nur die Signatur trägt. Jeder `functionCall` bleibt ein
  eigener Teil. Bei parallelen Aufrufen trägt nur der erste die Signatur; die Reihenfolge bleibt
  Aufruf 1, Aufruf 2, Antwort 1, Antwort 2.
- **Zurückschicken:** byte-genau, nur bei gleichem Anbieter und gleichem Modell (wie heute). Nach einem Modellwechsel
  geht nur der Text zurück. Das ist bei Gemini erlaubt, denn geprüft wird nur die laufende Runde.
- **Abgelaufene Bilder** im Verlauf ändern einen früheren Teil. Das ist hier unkritisch: Frühere Runden prüft Gemini
  nicht.

### 5.4 Werkzeug-Schleife, Stream und Abschluss

- Gleiche Schleife wie bei GPT (höchstens 8 Runden). `functionCall.id` wird in der `functionResponse` zurückgegeben,
  alle Antworten einer Runde stehen in **einem** `user`-Content.
- Stream: Teile mit `thought: true` → Ereignis `thinking`; anderer Text → `text`; `functionCall` → Statuszeile des
  Werkzeugs. Den Stream lese ich bis `finishReason`, sonst fehlt die Signatur am Ende.
- `finishReason`:
  - `STOP` → fertig.
  - `MAX_TOKENS` → Hinweis „abgeschnitten“ wie heute, auch wenn nur gedacht wurde.
  - `SAFETY`, `PROHIBITED_CONTENT`, `BLOCKLIST`, `SPII`, `RECITATION` und `promptFeedback.blockReason` → Ablehnung
    mit dem bekannten Hinweis.
  - `MALFORMED_FUNCTION_CALL` → die Runde wird einmal wiederholt, danach eine deutsche Fehlermeldung.

### 5.5 Websuche mit Google

- Werkzeug `googleSearch`. Die Quellen kommen aus `groundingMetadata.groundingChunks[].web` (`uri`, `title`).
  - Die `uri` ist ein Google-Weiterleitungslink (`vertexaisearch.cloud.google.com/…`), der Titel meist nur die Domain.
    Die Quellenkarte zeigt deshalb die Domain.
  - Statuszeile „Suche im Web …“ bei `webSearchQueries`.
- **Suchvorschläge sind Pflicht:** Die Nutzungsbedingungen verlangen, dass die mitgelieferten Google-Suchvorschläge
  (`searchEntryPoint.renderedContent`, ein kleiner HTML-Baustein mit Links zur Google-Suche) angezeigt werden.
  - Freebie zeigt sie unter den Quellenkarten in einem abgeschotteten `iframe` (`srcdoc`, ohne Skripte; Links öffnen in
    einem neuen Tab).
  - Dafür gibt es ein neues Stream-Ereignis `searchSuggestions` und ein neues Feld an der Antwort. Das Feld wird im
    Browser gespeichert, im Antwort-Cache und in Gruppenchat-Beiträgen mitgespeichert und beim Import geprüft.
- **Websuche und eigene Werkzeuge zusammen** (Bild erzeugen, Posteingang) erlaubt Gemini nur ab Gemini 3, als
  Vorschau-Funktion: `toolConfig.includeServerSideToolInvocations: true` und Modus `VALIDATED`. Die dabei gelieferten
  `toolCall`- und `toolResponse`-Teile kommen samt Signaturen in den Verlauf. Phase 0 prüft das mit echtem Schlüssel.
  Klappt es nicht, startet Gemini ohne Websuche (Abschnitt 13).
- **Kosten:** 14 $ je 1.000 Suchanfragen, gezählt je ausgeführter Suche (`webSearchQueries`). Die 5.000 freien
  Suchen im Monat ziehe ich nicht ab; die Statistik liegt damit eher zu hoch als zu niedrig.

### 5.6 Verbrauch und Kosten

| Freebie | aus `usageMetadata` |
|---|---|
| Eingabe | `promptTokenCount − cachedContentTokenCount + toolUsePromptTokenCount` |
| Cache gelesen | `cachedContentTokenCount` |
| Cache geschrieben | 0 |
| Ausgabe | `candidatesTokenCount + thoughtsTokenCount` (Denken kostet Ausgabepreis) |

**Implizites Caching** greift ab 4.096 Tokens Präfix automatisch mit 90 % Rabatt. Durch unseren deterministischen
Aufbau (System-Prompt, Werkzeuge, Verlauf byte-gleich) trifft es so oft wie möglich. Explizites Caching (mit
Speicherkosten je Stunde) nutze ich nicht; Gemini 4 Argon kann es ohnehin nicht.

### 5.7 Titel, Test, Modell-Liste

- Titel: `thinkingLevel: "low"`, `maxOutputTokens: 2000`.
- Test: „Antworte nur mit: OK“.
- Abrufen: `ai.models.list()`. Gezeigt werden nur Chat-Modelle (`gemini-…` mit `generateContent`), ohne Varianten
  für Sprache, Bilder, Live und Embeddings. Das Präfix `models/` wird entfernt.

## 6. Mistral-Adapter (`lib/providers/mistral.ts`)

### 6.1 Schnittstelle

- **SDK `@mistralai/mistralai`** ab 2.7.0, `client.chat.stream`. Das SDK ist reines ESM; das passt zu Next.js.
- **Sicherheit:** Die Versionen 2.2.2–2.2.4 waren im Mai 2026 kompromittiert. Ich pinne `^2.7.0` über das Lockfile
  und prüfe mit `npm audit`.
- **Client:** `new Mistral({ apiKey: process.env.MISTRAL_API_KEY, serverURL })`. `serverURL` ist
  `https://api.eu.mistral.ai`, wenn `MISTRAL_REGION` nicht `global` ist. Für die Tests überschreibt
  `MISTRAL_BASE_URL` die Adresse.

### 6.2 Anfrage

- Nachrichten: zuerst `system` (Prompt, bei einer Vorlage mit Abschnitt „Rolle für dieses Gespräch“), dann der
  Verlauf. Werkzeuge im OpenAI-Format, nach Namen sortiert.
- `promptCacheKey`: derselbe Gesprächsschlüssel wie bei GPT (`freebie-<hash>`, keine personenbezogenen Daten).
- `reasoningEffort` aus der Effort-Abbildung. Die Mistral-Doku beschreibt nur `high` und `none`, das SDK kennt mehr
  Stufen. Phase 0 klärt, welche Stufen je Modell wirklich etwas ändern. Notfalls: Niedrig = `none`, Hoch = `high`,
  Mittel entfällt.
- Bilder als `image_url` mit Data-URL. **Höchstens 8 Bilder je Anfrage:** Bei mehr Bildern im Verlauf bleiben die
  neuesten 8 Bilder, ältere werden zum Platzhalter „[Bild … – nur die letzten 8 Bilder werden mitgeschickt]“. Das
  bricht den Cache einmal, wenn das 9. Bild dazukommt.
- **PDFs nicht nativ:** Mistral liest PDFs über seine OCR („Document QnA“), mit anderen Kosten und anderem Verhalten.
  Bei Mistral ist `pdf` deshalb aus, PDFs gehen wie heute als extrahierter Text.

### 6.3 Gedankengang, Werkzeuge, Verlauf

- Beim Denken ist `delta.content` eine Liste mit `thinking`-Chunks; danach normaler Text als Zeichenkette. Beides wird
  verarbeitet (`thinking`- bzw. `text`-Ereignis).
- Werkzeug-Aufrufe (`toolCalls`) kommen am Stück. Die Antworten gehen als `role: "tool"` mit `toolCallId` und `name`
  zurück.
- **Verlauf:** Mistral verlangt, dass die Assistenten-Nachricht **samt Denk-Chunks** zurückgeht. `native.items`
  enthält deshalb die Assistenten- und Werkzeug-Nachrichten genau so, wie sie gesendet wurden. Zurückgeschickt wird
  nur bei gleichem Modell, sonst Text.
- `finish_reason`: `length` / `model_length` → Hinweis „abgeschnitten“; `error` → deutsche Fehlermeldung. Einen
  eigenen Grund für Ablehnungen hat Mistral nicht.

### 6.4 Keine Websuche bei Mistral (vorerst)

Mistral bietet die Websuche nur über die **Conversations-/Agents-API** an, nicht über Chat Completions. Das hieße:

- eine zweite, ganz andere Schnittstelle mit eigenen Ereignissen,
- keine Datenhaltung ohne Speicherung (Zero Data Retention gilt dort nicht),
- **nicht am EU-Endpunkt** verfügbar.

Deshalb haben die Mistral-Modelle `webSearch: false`. Der Schalter „Websuche“ verschwindet bei ihnen automatisch, das
regelt die Oberfläche heute schon über die Fähigkeiten. Eine spätere Ergänzung ist möglich (Abschnitt 14).

### 6.5 Verbrauch, Titel, Test, Liste

- Verbrauch:
  - Eingabe = `prompt_tokens − prompt_tokens_details.cached_tokens`.
  - Cache gelesen = `cached_tokens` (das SDK typisiert das Feld nicht, ich lese es trotzdem).
  - Ausgabe = `completion_tokens`.
  - Ob die Zahlen im Stream am Ende zuverlässig kommen, prüft Phase 0. Notfalls rufe ich die SSE-Schnittstelle direkt
    mit `stream_options.include_usage` auf.
- Titel: `reasoningEffort: "none"`, `maxTokens: 2000`.
- Test: „Antworte nur mit: OK“.
- Abrufen: `client.models.list()` liefert Fähigkeiten mit (`vision`, `functionCalling`, `reasoning`). Damit füllt
  „Übernehmen“ die Felder des neuen Modells gleich richtig vor. Gezeigt werden nur Chat-Modelle ohne
  Abkündigungsdatum, ohne OCR, Embeddings und Moderation.

## 7. Gemeinsame Anpassungen

| Bereich | Änderung |
|---|---|
| `lib/errors.ts` | `statusCode` (Mistral) neben `status`; Gemini-Fehlertext aus der JSON-Meldung; **402 „Guthaben beim Anbieter aufgebraucht“**; Kontext zu lang auch bei „exceeds the maximum number of tokens“; Verbindungsfehler von Mistral (`ConnectionError`, `RequestTimeoutError`) und `fetch failed` |
| `lib/providers/types.ts` | `WEB_SEARCH_COST_USD` → `ADAPTERS[provider].webSearchCostUsd` (Claude/GPT 0,01 $, Gemini 0,014 $), auch bei abgebrochenen Antworten in `run.ts` |
| `lib/chat/prepare.ts` | erlaubte Bildformate je Anbieter (Gemini ohne GIF); sonst unverändert |
| `lib/db/client.ts` | **Startbelegung in Stufen:** internes Feld `seededProviders` in den Einstellungen. Fehlt ein Anbieter darin, werden seine Startmodelle einmal eingefügt (`onConflictDoNothing`) und der Anbieter wird vermerkt. Neue Datenbanken bekommen wie bisher alles auf einmal |
| `lib/db/seed.ts` | sechs neue Modelle (Abschnitt 3), Fähigkeiten `GEMINI_CAPS` und `MISTRAL_CAPS`, Effort-Abbildungen ohne „Maximal“ |
| `lib/chat/system-prompt.ts` | „Du läufst wahlweise auf Modellen von Anthropic (Claude), OpenAI (GPT), Google (Gemini) oder Mistral.“ Das ändert die Prompt-Version: **einmalig** neuer Antwort-Cache und kein Prompt-Cache-Treffer für laufende Gespräche |
| `lib/shared/settings-defaults.ts` | Hinweistext (Abschnitt 9). Gilt automatisch nur, wo die Kursleitung den Text nie geändert hat |
| `lib/shared/types.ts` | `Provider` aus dem Register; `searchSuggestions` an `ChatMessage` und `StreamEvent`; Kommentare zu `NativeTurn` |
| `app/layout.tsx` | Meta-Beschreibung „Chatten mit Claude, GPT, Gemini und Mistral“ |
| `package.json` | `@google/genai`, `@mistralai/mistralai`; `serverExternalPackages` nur, falls der Build es verlangt |

## 8. Oberfläche

**Modellauswahl** (`ModelPicker.tsx`): vier Gruppen aus dem Register, Farbpunkte Google-Blau und Mistral-Gelb (deutlich
vom Claude-Orange abgesetzt; der Gruppenname steht immer dabei, die Farbe trägt also keine Information allein).

**Admin → Modelle** (`ModelsTab.tsx`)

- Anbieterfeld mit vier Einträgen; Beispiel-IDs je Anbieter.
- Knöpfe „Gemini-Modelle abrufen“ und „Mistral-Modelle abrufen“ mit eigenen Filtern (Abschnitte 5.7 und 6.5).
- Vorgaben für neue Modelle je Anbieter:
  - Gemini: PDF an, Websuche an, Effort ohne „Maximal“.
  - Mistral: PDF aus, Websuche aus, Fähigkeiten aus der Modell-Liste.
- Die Claude-Felder („Web-Tool-Version“, „Ersatzmodell“, Effort-Wechsel per Nachricht) erscheinen nur bei Claude bzw.
  Claude und GPT. Die Hinweise zu den Fähigkeiten werden anbieterneutral formuliert.

**Admin → Übersicht** (`OverviewTab.tsx`, `lib/admin.ts`): Systemstatus mit Zeilen für alle vier Schlüssel, bei Mistral
mit Region („EU“ oder „global“).

**Chat:** Suchvorschläge von Google unter den Quellen (Abschnitt 5.5), auch im Gruppenchat. Sonst steuert die
Oberfläche alles über die Fähigkeiten der Modelle; der Websuche-Schalter bei Mistral fällt dadurch von selbst weg.

## 9. Datenschutz und Vertragliches

Für eine Schulungsumgebung im öffentlichen Sektor wichtig – gehört in README, Handbuch (4.3 „Was an welchen Anbieter
geht“, 4.4 Checkliste) und den Hinweistext.

| | Gemini (Developer API) | Mistral |
|---|---|---|
| Verarbeitungsort | keine Zusage, „in jedem Land“; EU-Bindung gibt es nur über Vertex AI | **EU-Endpunkt** `api.eu.mistral.ai` (EU/EFTA, +10 %) |
| Training mit Eingaben | kostenlose Stufe: ja, auch menschliche Prüfung. **Bezahlte Stufe: nein.** Für Nutzer im EWR erlauben die Bedingungen **nur die bezahlte Stufe** | bezahlter Tarif: standardmäßig nein; Schalter „Anonymous improvement data“ in der Mistral-Konsole muss aus sein |
| Speicherung | begrenzte Zeit zur Missbrauchserkennung; **bei Websuche 30 Tage**, nicht abschaltbar | auf Antrag „Zero Data Retention“ für Chat Completions |

**Konsequenzen**

- Den Gemini-Schlüssel nur aus einem Google-Cloud-Projekt **mit Abrechnung** verwenden (ab Tier 1). Freebie kann die
  Stufe nicht erkennen; deshalb steht es in der Checkliste.
- Hinweistext (Vorschlag): „… werden zur Verarbeitung an OpenAI und Anthropic (USA), Google (weltweit) und Mistral (EU)
  übertragen. …“ Wer den Text im Admin schon angepasst hat, muss ihn selbst ergänzen; das Handbuch sagt es.

## 10. Tests – die Suite bleibt vollständig

### 10.1 Unit-Tests

| Datei | Prüft |
|---|---|
| `gemini-request.test.ts` (neu) | System, Vorlage, sortierte Werkzeuge mit `parametersJsonSchema`, `googleSearch` am Ende, `thinkingConfig`, Hinweis „Websuche aus“, **Präfix über 3 Runden byte-gleich**, Effort-Wechsel ohne Präfixbruch, Verlauf nur bei gleichem Modell, **Signaturen und Teile-Regeln** (signierter Leerteil, parallele Aufrufe), GIF-Platzhalter, Verbrauchsrechnung |
| `mistral-request.test.ts` (neu) | System, Werkzeuge, `promptCacheKey`, `reasoningEffort`, Denk-Chunks im Verlauf, **höchstens 8 Bilder (die neuesten)**, PDF als Text, Präfix über 3 Runden, Verbrauch mit `cached_tokens` |
| `providers.test.ts` (neu) | beide Register vollständig; zod-Enums und Import-Liste aus `PROVIDER_IDS` |
| `errors.test.ts` | Gemini-Fehler 400/402/429/503 und Kontext zu lang; Mistral `statusCode` 401/422/429 und Verbindungsfehler |
| `connections.test.ts`, `groupchat-turns.test.ts` | Präfix-Stabilität und strikte Werkzeuge auch für Gemini und Mistral |
| `import.test.ts`, `db.test.ts` | neue Anbieter beim Import; Startbelegung in Stufen |

### 10.2 Fake-API (`tests/e2e/fake-api/server.mjs`)

- **Gemini:**
  - Routen `POST /v1beta/models/{modell}:streamGenerateContent?alt=sse`, `:generateContent` und
    `GET /v1beta/models`.
  - Schlüssel über `x-goog-api-key`.
  - Ereignisse mit Gedankenteilen, Signaturen, `functionCall`, `groundingMetadata` samt Suchvorschlägen,
    `usageMetadata` und den Szenario-Schaltern (`#fake:*`) wie bei Claude und GPT.
- **Mistral:**
  - eigener Pfad `/mistral/v1/chat/completions` und `/mistral/v1/models`, damit sich `/v1/models` nicht mit OpenAI
    überschneidet.
  - Denk-Chunks, Werkzeug-Aufrufe, `usage` mit `prompt_tokens_details`.
- Die Server-Umgebung bekommt Schlüssel und Adressen (`GEMINI_BASE_URL`, `MISTRAL_BASE_URL`). `serve.mjs` entfernt
  zusätzlich geerbte `GEMINI_`-, `GOOGLE_`- und `MISTRAL_`-Variablen, damit nie echte Schlüssel in die Tests geraten.
- **Echte Antwortformen:** Phase 0 zeichnet je Anbieter eine Handvoll echter Antworten auf (ohne Inhalte, die
  Rückschlüsse zulassen). Die Fake-API spielt genau diese Formen nach, nicht meine Vermutung davon.

### 10.3 E2E-Katalog

| ID | Änderung |
|---|---|
| V01–V08 | laufen für **alle vier Anbieter** (Abschnittstitel „je Claude, GPT, Gemini und Mistral“); V02 bei Mistral: Schalter fehlt, Anfrage ohne Websuche |
| **V09** (neu) | **Gemini-Besonderheiten:** Signaturen im Werkzeug-Loop byte-genau zurück (auch parallel), Websuche mit Quellen **und sichtbaren Suchvorschlägen** (abgeschottet, Links in neuem Tab), Ablehnung bei `SAFETY`/`blockReason`, eine Wiederholung bei `MALFORMED_FUNCTION_CALL`, `MAX_TOKENS` nur mit Denken, GIF-Platzhalter |
| **V10** (neu) | **Mistral-Besonderheiten:** Denk-Chunks als Gedankengang, mehr als 8 Bilder, Cache-Tokens in den Kosten, EU-Adresse je nach `MISTRAL_REGION` |
| D01 | vier Gruppen, zwölf Modelle in fester Reihenfolge, Farbpunkte |
| O04 | Systemstatus mit vier Schlüsselzeilen und Mistral-Region |
| P01, P08 | neues Modell vor dem ersten GPT; vier Abruf-Knöpfe mit Filtern und vorbelegten Fähigkeiten |
| **P10** (neu) | Startbelegung in Stufen: bestehende Datenbank bekommt die neuen Modelle einmal; gelöschte kommen nicht wieder |
| Q16, Q17, Q19 | Titel mit Gemini und Mistral; natives PDF bei Gemini, Text bei Mistral; Einstellungen für alle Anbieter |
| X01 | Live: Status der Schlüssel, die in Vercel gesetzt sind |
| **X11** (neu) | Live: je eine kurze Antwort von Gemini 3.5 Flash-Lite und Mistral Small 4 auf „Niedrig“ (< 0,01 $), nur wenn die Schlüssel gesetzt sind |

`coverage.json` bekommt die neue Einstellung `seededProviders` (P10). Abnahme wie bisher: Stabilitätslauf 3 × ohne
Wiederholungen, axe ohne Befunde, keine unerwarteten 500er, CI in drei Browsern.

## 11. Dokumentation

| Datei | Änderung |
|---|---|
| `README.md` | Funktionsliste (vier Anbieter), Variablentabelle, Caching je Anbieter, Datenschutz, Architektur (`lib/providers` mit Register), Preis-Stichtage bei Gemini |
| `.env.example` | `GEMINI_API_KEY`, `MISTRAL_API_KEY`, `MISTRAL_REGION` mit Kommentar |
| `TESTPLAN.md` | Abschnitt V für vier Anbieter, V09, V10, P10, X11; Fake-API Modus B mit den neuen Adressen |
| `PLAN.md` | Abschnitt Provider-Adapter: Verweis auf diesen Plan |
| `ANBIETER-PLAN.md` | dieser Plan, nach der Umsetzung mit Stand je Phase und Abweichungen |
| Handbuch Kursleitung | Modellauswahl (Farben, vier Gruppen), Systemstatus, Abrufen und Anlegen, Titelmodell, 4.3 Anbieter und Datenschutz, 4.4 Checkliste (Gemini-Abrechnung, Mistral-Trainingsschalter, Hinweistext, Preise prüfen), häufige Fragen („Warum hat Mistral keine Websuche?“) |
| Handbuch Teilnehmende | Modelle im Überblick, Suchvorschläge bei Gemini, Datenschutz-Abschnitt; Übungsidee „Dieselbe Frage an vier Anbieter“ |
| `docs/handbuch/beispieldaten.mjs`, Screenshots | Status mit vier Schlüsseln, Modellauswahl, Gemini-Antwort mit Suchvorschlägen; danach beide PDFs neu erzeugen |

## 12. Umsetzung in Phasen und Aufwand

| Phase | Inhalt | Tests |
|---|---|---|
| 0 · Klärung und Live-Probe | Entscheidungen (Abschnitt 15); mit echten Schlüsseln je Anbieter rund zehn Mini-Anfragen (< 0,10 $): Stream-Formen, Signaturen, Websuche mit eigenen Werkzeugen, Effort-Stufen, Verbrauch im Stream, Cache-Treffer nach Effort-Wechsel, EU-Endpunkt; Aufzeichnungen für die Fake-API | – |
| 1 · Anbieter-Register | `lib/shared/providers.ts`, `lib/providers/index.ts`, alle Fallunterscheidungen ersetzen, Fehler-Mapping; **kein neues Verhalten** | alle heutigen Tests grün; `providers.test.ts` |
| 2 · Gemini | Adapter, Signaturen, Websuche mit Suchvorschlägen, Fake-API, Startmodelle | Unit; V01–V08 für Gemini, V09 |
| 3 · Mistral | Adapter, EU-Endpunkt, Denk-Chunks, Bildgrenze, Fake-API, Startmodelle | Unit; V01–V08 für Mistral, V10 |
| 4 · Oberfläche und Admin | Modellauswahl, Modelle-Tab, Systemstatus, Startbelegung in Stufen, System-Prompt, Hinweistext | D01, O04, P01, P08, P10, Q16, Q17, Q19 |
| 5 · Abschluss | Doku, beide Handbücher, Stabilitätslauf 3 ×, CI, nach dem Merge Live-Smoke | X01, X11 |

**Wie schnell?**

- **Vorher (du):** Entscheidungen und die beiden Schlüssel für Phase 0.
- **Umsetzung (ich):** rund **anderthalb Arbeitstage**. Das ist mehr als beim Posteingang, weil zwei Adapter samt
  Fake-API entstehen und die Gemini-Signaturen sorgfältig getestet werden müssen. Das Register in Phase 1 macht die
  beiden Adapter danach zu reinen Ergänzungen.
- **Gesamt:** realistisch **2 Tage nach den Entscheidungen** einsatzbereit.

## 13. Risiken und wie der Plan sie abfängt

| Risiko | Abfangen |
|---|---|
| Gemini lehnt Websuche zusammen mit eigenen Werkzeugen ab (Vorschau-Funktion) | Phase 0 prüft es; sonst startet Gemini mit `webSearch: false` und die Websuche kommt nach, sobald Google sie freigibt |
| Signaturen gehen beim Zusammensetzen verloren → 400 im Werkzeug-Loop | feste Teile-Regeln, Unit-Tests, V09 mit aufgezeichneten echten Antworten |
| Mistral liefert im Stream keinen Verbrauch | Phase 0; Ausweg: SSE direkt mit `stream_options.include_usage` |
| Effort-Stufen bei Mistral wirken nicht wie beschrieben | Phase 0; Abbildung im Admin je Modell änderbar, notfalls zwei Stufen |
| Preise ändern sich (Gemini Dezember/Januar, Mistral Large 4 nach der Vorschau) | Preise im Admin; Stichtage in README und Checkliste |
| Vorschau-Modell Mistral Large 4 ändert sich ohne Ankündigung | Kennzeichnung „(Vorschau)“, feste ID, ein Monat Vorlauf bei Abkündigung |
| Zwölf Modelle überfordern Teilnehmende | Gruppen in der Auswahl; einzelne Modelle im Admin abschaltbar (Entscheidung 3) |
| Neue Prompt-Version bricht laufende Caches | einmalig; Deploy außerhalb einer Schulung |
| Kompromittierte SDK-Versionen | Lockfile, `^2.7.0`, `npm audit` in der CI |

## 14. Bewusst nicht enthalten (später möglich)

- **Websuche bei Mistral** über die Conversations-API (eigene Schnittstelle, ohne Zero Data Retention, nicht am
  EU-Endpunkt).
- **Gemini über Vertex AI** mit EU-Datenresidenz: anderes Anmeldeverfahren (Dienstkonto statt API-Schlüssel).
- **Umstieg auf die Gemini Interactions API**, sobald neue Modelle nur noch dort erscheinen.
- **Webseiten lesen bei Gemini** (`urlContext`, wie `web_fetch` bei Claude) und **explizites Context-Caching**.
- **Bilder mit Gemini, Transkription mit Mistral (Voxtral):** Bilder, Transkription und Spracheingabe bleiben bei
  OpenAI.
- **Native PDFs bei Mistral** über OCR.
- **Kosten nach Anbieter** im Dashboard (heute nach Modell, das reicht).

## 15. Entscheidungen, die ich von dir brauche

| # | Frage | Meine Empfehlung |
|---|---|---|
| 1 | Mistral über den **EU-Endpunkt** (Verarbeitung in der EU, +10 %, keine Websuche möglich) oder global? | **EU** – für Behörden-Schulungen das stärkste Argument für Mistral |
| 2 | **Websuche bei Gemini** mit den vorgeschriebenen Google-Suchvorschlägen (und 30 Tagen Speicherung bei Google) oder vorerst aus? | **An** – Recherche mit Quellen gehört in jede Schulung; der Hinweistext deckt die Speicherung ab |
| 3 | **Welche Modelle** zum Start: alle sechs aus Abschnitt 3 eingeschaltet oder nur je eins (Gemini 3.8 Flash, Mistral Medium 3.5)? | **Alle sechs**, inkl. Mistral Large 4 als „(Vorschau)“; abschalten geht jederzeit im Admin |
| 4 | **Schlüssel für Phase 0:** Gemini aus einem Projekt mit Abrechnung, Mistral mit bezahltem Tarif und ausgeschaltetem Trainingsschalter | als Umgebungsvariablen `GEMINI_API_KEY` und `MISTRAL_API_KEY` in den Einstellungen der Cloud-Umgebung hinterlegen (nie in den Chat); eine neue Sitzung liest sie dann. Alternativ setzt du sie nur in Vercel, und ich verschiebe die Probe auf den Live-Smoke nach dem Deploy |
