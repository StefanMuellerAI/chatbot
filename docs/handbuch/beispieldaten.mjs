// Beispieldaten für die Screenshots des Handbuchs: Chats zum Importieren und Zahlen für die Admin-Übersicht.
// Alle Inhalte sind erfunden; das Handbuch weist darauf hin.

const MIN = 60_000;
const DAY = 24 * 60 * MIN;

function conv(id, title, ageMs, messages, modelId = "claude-sonnet-5-5") {
  const t = Date.now() - ageMs;
  return {
    id,
    title,
    modelId,
    presetId: null,
    effort: "medium",
    webSearch: true,
    createdAt: t - 5 * MIN,
    updatedAt: t,
    messages: messages.map((m, i) => ({ id: `${id}-${i}`, createdAt: t - (messages.length - i) * MIN, ...m })),
  };
}

const usage = (cost) => ({ inputTokens: 1450, outputTokens: 620, cacheReadTokens: 3800, cacheWriteTokens: 400, costUsd: cost });

const landing = `<!doctype html>
<html lang="de"><head><meta charset="utf-8"><title>Tag der offenen Tür</title>
<style>
body{margin:0;font-family:system-ui,sans-serif;color:#1d1a2b;background:#fff7f0}
header{padding:56px 32px;background:linear-gradient(135deg,#ff6900,#e41c68);color:#fff;text-align:center}
h1{font-size:2.4rem;margin:0 0 8px}
header p{font-size:1.1rem;margin:0 0 24px;opacity:.95}
a.btn{display:inline-block;background:#fff;color:#e41c68;padding:12px 26px;border-radius:999px;font-weight:700;text-decoration:none}
section{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:32px}
.card{background:#fff;border-radius:16px;padding:18px;box-shadow:0 6px 20px rgba(0,0,0,.06)}
.card h2{font-size:1.05rem;margin:0 0 6px;color:#7847d6}
</style></head>
<body>
<header><h1>Tag der offenen Tür</h1><p>Samstag, 14. November · 10 bis 16 Uhr · Rathaus, Erdgeschoss</p><a class="btn" href="#programm">Zum Programm</a></header>
<section id="programm">
<div class="card"><h2>Führungen</h2><p>Stündlich durch alle Bereiche – ohne Anmeldung.</p></div>
<div class="card"><h2>Digitale Dienste</h2><p>Online-Anträge zum Ausprobieren mit Hilfe vor Ort.</p></div>
<div class="card"><h2>Für Familien</h2><p>Malecke, Quiz und Kaffee im Foyer.</p></div>
</section>
</body></html>`;

/** Betreff der Übungsmail der Kursleitung (Posteingang und Beispiel-Chat). */
export const EXERCISE_SUBJECT = "Übung 1: Beschwerde von Herrn Albers";

/** Beispiel-Mails für den Posteingang (die Kursleitung und Gäste der Gruppe „Vormittag“ schreiben sie über die API). */
export const EXERCISE_BODY = `Hallo zusammen,

hier eure erste Übung: Herr Albers hat sich über die Wartezeit im Bürgerbüro beschwert (siehe unten). Bitte beantwortet seine Mail mit Hilfe von Freebie – freundlich, sachlich und mit einem konkreten Angebot. Schickt mir eure Antwort bis 11:30 Uhr.

Viele Grüße
Eure Kursleitung

> Sehr geehrte Damen und Herren,
> am Dienstag habe ich trotz Termin 50 Minuten im Bürgerbüro gewartet. Niemand hat mir gesagt, warum. So geht man nicht mit Bürgern um.
> Mit freundlichen Grüßen
> Jens Albers`;

/** Beispiel-Chats im Export-Format von Freebie (werden über „Import“ geladen); `me` ist der Gast im Screenshot. */
export function sampleChats(me = "fuchs27") {
  const exercise = { id: "doku-mail-uebung", folder: "inbox", from: "kursleitung", to: [me], subject: EXERCISE_SUBJECT };
  return {
    app: "freebie",
    version: 1,
    exportedAt: new Date().toISOString(),
    conversations: [
      {
        ...conv("doku-posteingang", "Antwort an Herrn Albers", 10 * MIN, [
          {
            role: "user",
            text: `Fasse die E-Mail „${EXERCISE_SUBJECT}“ von der Kursleitung zusammen und schlag mir eine Antwort vor.`,
            effort: "medium",
            webSearch: false,
            connections: ["mailbox"],
          },
          {
            role: "assistant",
            modelId: "claude-sonnet-5-5",
            usage: usage(0.0074),
            stopReason: "end_turn",
            mails: { read: [exercise], sent: [] },
            text: `**Worum es geht:** Die Kursleitung bittet euch, die Beschwerde von Herrn Albers zu beantworten – freundlich, sachlich und mit einem konkreten Angebot, bis 11:30 Uhr. Herr Albers hat am Dienstag trotz Termin 50 Minuten gewartet, ohne dass ihm jemand den Grund genannt hat.

**Vorschlag für die Antwort:**

Sehr geehrter Herr Albers,

vielen Dank für Ihre offenen Worte. Es tut uns leid, dass Sie am Dienstag trotz Termin so lange warten mussten – und dass Ihnen niemand den Grund gesagt hat. Wegen einer Krankheitsvertretung waren an diesem Vormittag zwei Schalter nicht besetzt.

Gern bieten wir Ihnen einen neuen Termin ohne Wartezeit an, zum Beispiel am Donnerstag um 9:00 Uhr. Künftig informieren wir Wartende sofort, wenn es zu Verzögerungen kommt.

Mit freundlichen Grüßen
Team Bürgerservice

Soll ich die Antwort an die Kursleitung schicken?`,
          },
          { role: "user", text: "Ja, schick sie bitte an die Kursleitung.", effort: "medium", webSearch: false, connections: ["mailbox"] },
          {
            role: "assistant",
            modelId: "claude-sonnet-5-5",
            usage: usage(0.0032),
            stopReason: "end_turn",
            mails: { read: [], sent: [{ id: "doku-mail-antwort", folder: "sent", from: me, to: ["kursleitung"], subject: `AW: ${EXERCISE_SUBJECT}` }] },
            text: `Erledigt: Die Antwort ist an **kursleitung@freebie.example** gegangen, Betreff „AW: ${EXERCISE_SUBJECT}“. Sie liegt unter „Gesendet“ und ist als „über Freebie“ gekennzeichnet.`,
          },
        ]),
        connections: ["mailbox"],
      },
      conv("doku-mail", "E-Mail zur Terminverschiebung", 20 * MIN, [
        { role: "user", text: "Formuliere eine freundliche E-Mail an Frau Becker: Unser Beratungstermin am Donnerstag muss leider auf nächste Woche verschoben werden. Biete Dienstag oder Mittwoch Vormittag an.", effort: "medium", webSearch: false },
        {
          role: "assistant",
          modelId: "claude-sonnet-5-5",
          thinking: "Kurz, freundlich und mit zwei konkreten Alternativen. Betreff klar formulieren, Entschuldigung ohne lange Begründung, Bitte um kurze Rückmeldung.",
          usage: usage(0.0061),
          stopReason: "end_turn",
          text: `Gern – hier ein Vorschlag:

**Betreff:** Verschiebung unseres Beratungstermins am Donnerstag

Sehr geehrte Frau Becker,

leider müssen wir unseren Beratungstermin am Donnerstag verschieben. Das tut mir leid – ich hätte Ihnen gern früher Bescheid gegeben.

Gern biete ich Ihnen folgende Ersatztermine an:

- **Dienstag**, 9:00 bis 12:00 Uhr
- **Mittwoch**, 9:00 bis 12:00 Uhr

Bitte geben Sie mir kurz Bescheid, welcher Termin Ihnen am besten passt. Sollte keiner davon möglich sein, finden wir gemeinsam eine andere Lösung.

Mit freundlichen Grüßen
Ihr Team Bürgerservice

---

*Tipp:* Wenn Sie es persönlicher möchten, nennen Sie kurz den Grund (z. B. „krankheitsbedingt“).`,
        },
      ]),
      conv("doku-suche", "Was ist die KI-Verordnung?", 45 * MIN, [
        { role: "user", text: "Suche im Web: Was regelt die europäische KI-Verordnung, und was bedeutet sie für Behörden? Kurz und mit Quellen.", effort: "medium", webSearch: true },
        {
          role: "assistant",
          modelId: "claude-sonnet-5-5",
          thinking: "Überblick in wenigen Punkten, dann Bedeutung für Behörden. Quellen angeben.",
          usage: { ...usage(0.0124), webSearches: 2 },
          stopReason: "end_turn",
          citations: [
            { url: "https://example.org/ki-verordnung-ueberblick", title: "Beispielquelle: Die KI-Verordnung im Überblick" },
            { url: "https://example.org/ki-in-der-verwaltung", title: "Beispielquelle: KI in der öffentlichen Verwaltung" },
            { url: "https://example.org/risikoklassen", title: "Beispielquelle: Risikoklassen erklärt" },
          ],
          text: `**Kurz gesagt:** Die KI-Verordnung ordnet KI-Systeme nach ihrem Risiko ein und knüpft daran Pflichten.

1. **Verbotene Praktiken** – z. B. Social Scoring.
2. **Hochrisiko-Systeme** – strenge Anforderungen an Daten, Dokumentation und menschliche Aufsicht.
3. **Begrenztes Risiko** – Transparenzpflichten, etwa wenn Menschen mit einem Chatbot sprechen.
4. **Minimales Risiko** – keine besonderen Pflichten.

**Für Behörden heißt das vor allem:** prüfen, in welche Klasse ein System fällt, Beschäftigte schulen und den Einsatz nachvollziehbar dokumentieren.

*(Beispielantwort für die Dokumentation.)*`,
        },
      ]),
      conv("doku-seite", "Landingpage Tag der offenen Tür", 70 * MIN, [
        { role: "user", text: "Erstelle eine kleine Webseite für unseren Tag der offenen Tür am Samstag, 14. November, 10–16 Uhr im Rathaus. Mit Programmpunkten.", effort: "medium", webSearch: false },
        {
          role: "assistant",
          modelId: "claude-sonnet-5-5",
          usage: usage(0.0188),
          stopReason: "end_turn",
          text: `Hier ist ein Entwurf für die Seite:\n\n<artifact id="tag-der-offenen-tuer" type="html" title="Tag der offenen Tür">\n${landing}\n</artifact>\n\nDu kannst die Seite rechts ansehen, den Code kopieren oder sie als Datei herunterladen.`,
        },
      ]),
      conv("doku-ablauf", "Ablauf Urlaubsantrag", DAY + 3 * 60 * MIN, [
        { role: "user", text: "Zeichne den Ablauf eines Urlaubsantrags als Diagramm: Antrag, Prüfung durch Teamleitung, Genehmigung oder Rückfrage, Eintrag im Kalender.", effort: "low", webSearch: false },
        {
          role: "assistant",
          modelId: "claude-haiku-5-5",
          usage: usage(0.0019),
          stopReason: "end_turn",
          text: `So sieht der Ablauf aus:\n\n<artifact id="urlaub" type="mermaid" title="Ablauf Urlaubsantrag">\nflowchart LR\n  A["Antrag stellen"] --> B{"Teamleitung prüft"}\n  B -- "passt" --> C["Genehmigt"]\n  B -- "unklar" --> D["Rückfrage"]\n  D --> A\n  C --> E["Eintrag im Kalender"]\n</artifact>\n`,
        },
      ], "claude-haiku-5-5"),
      conv("doku-excel", "Excel: SVERWEIS erklärt", 3 * DAY, [
        { role: "user", text: "Wie funktioniert SVERWEIS in Excel? Mit einem kurzen Beispiel.", effort: "low", webSearch: false },
        {
          role: "assistant",
          modelId: "gpt-6-luna",
          usage: usage(0),
          fromCache: true,
          stopReason: "end_turn",
          text: `**SVERWEIS** sucht einen Wert in der ersten Spalte einer Tabelle und gibt einen Wert aus derselben Zeile zurück.

\`\`\`text
=SVERWEIS(Suchkriterium; Matrix; Spaltenindex; FALSCH)
\`\`\`

**Beispiel:** In A2:C100 stehen Personalnummer, Name und Abteilung. Die Abteilung zur Nummer in E2:

\`\`\`text
=SVERWEIS(E2; A2:C100; 3; FALSCH)
\`\`\`

- **3** = dritte Spalte der Matrix (Abteilung)
- **FALSCH** = nur exakte Treffer

*Tipp:* In neueren Excel-Versionen ist **XVERWEIS** flexibler.`,
        },
      ], "gpt-6-luna"),
      conv("doku-praesentation", "Gliederung Präsentation Digitalisierung", 9 * DAY, [
        { role: "user", text: "Schlage eine Gliederung für eine 15-minütige Präsentation zum Stand der Digitalisierung in unserem Amt vor.", effort: "medium", webSearch: false },
        {
          role: "assistant",
          modelId: "claude-sonnet-5-5",
          usage: usage(0.0072),
          stopReason: "end_turn",
          text: `1. **Einstieg (2 Min.)** – Wo stehen wir? Eine Zahl, ein Bild.\n2. **Was schon läuft (4 Min.)** – drei Beispiele aus dem Alltag.\n3. **Was als Nächstes kommt (4 Min.)** – Vorhaben und Zeitplan.\n4. **Was wir brauchen (3 Min.)** – Schulung, Ausstattung, Unterstützung.\n5. **Abschluss (2 Min.)** – Fragen und nächste Schritte.`,
        },
      ]),
    ],
  };
}

const berlinDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin", year: "numeric", month: "2-digit", day: "2-digit" });

function days(n) {
  const today = berlinDay.format(new Date());
  const base = new Date(`${today}T12:00:00Z`);
  return Array.from({ length: n }, (_, i) => new Date(base.getTime() - (n - 1 - i) * 86_400_000).toISOString().slice(0, 10));
}

const DAILY = [0, 0, 0.84, 1.62, 0, 0, 0, 2.31, 1.95, 0, 1.2, 0, 0, 1.84];

/** Übersicht: Beispielzahlen und Systemstatus wie in der Live-Installation (der Testmodus hat keine Kosten). */
export function patchOverview(data, state) {
  data.periods = [
    { label: "Heute", requests: 186, costUsd: 1.84, savedUsd: 0.62, cacheHits: 23, cacheRatio: 0.58 },
    { label: "7 Tage", requests: 694, costUsd: 7.3, savedUsd: 2.41, cacheHits: 88, cacheRatio: 0.61 },
    { label: "30 Tage", requests: 1840, costUsd: 17.9, savedUsd: 6.4, cacheHits: 205, cacheRatio: 0.6 },
  ];
  data.daily = days(14).map((day, i) => ({ day, costUsd: DAILY[i], savedUsd: Math.round(DAILY[i] * 34) / 100, requests: Math.round(DAILY[i] * 101) }));
  const model = (modelId, requests, costUsd, savedUsd, ratio) => ({
    modelId, requests, costUsd, savedUsd,
    inputTokens: requests * 900, outputTokens: requests * 420,
    cacheReadTokens: Math.round((requests * 1000 * ratio) / (1 - ratio)), cacheWriteTokens: requests * 100,
  });
  data.byModel = [
    model("claude-sonnet-5-5", 1120, 11.2, 4.1, 0.63),
    model("gpt-6-luna", 240, 2.3, 0.8, 0.55),
    model("claude-opus-5-5", 60, 2.1, 0.7, 0.58),
    model("claude-haiku-5-5", 380, 1.1, 0.5, 0.52),
    model("gpt-6-astra", 40, 0.4, 0.1, 0.4),
  ];
  data.byFeature = [
    { feature: "chat", count: 1840, costUsd: 15.2, units: 0 },
    { feature: "image", count: 64, costUsd: 2.1, units: 64 },
    { feature: "title", count: 410, costUsd: 0.24, units: 0 },
    { feature: "transcription", count: 12, costUsd: 0.23, units: 38 },
    { feature: "dictation", count: 85, costUsd: 0.13, units: 21 },
  ];
  data.byRole = [
    { role: "admin", requests: 330, costUsd: 3.3 },
    { role: "guest", requests: 1510, costUsd: 14.6 },
  ];
  const now = Date.now();
  const event = data.byEvent.find((e) => e.id === state.today) ?? data.byEvent[0];
  const today = {
    ...event,
    requests: 186, costUsd: 1.84, savedUsd: 0.62, sessions: 14,
    groups: [
      { id: state.vormittag.id, name: "Vormittag", requests: 112, costUsd: 1.1, savedUsd: 0.4, sessions: 8 },
      { id: state.nachmittag.id, name: "Nachmittag", requests: 74, costUsd: 0.74, savedUsd: 0.22, sessions: 6 },
    ],
  };
  const past = (name, daysAgo, hours, requests, cost, groups) => {
    const start = new Date(now - daysAgo * 86_400_000);
    start.setHours(9, 0, 0, 0);
    const end = new Date(start.getTime() + hours * 3_600_000);
    return {
      id: `beispiel-${daysAgo}`, name, startsAt: start.toISOString(), endsAt: end.toISOString(),
      requests, costUsd: cost, savedUsd: Math.round(cost * 33) / 100, sessions: groups.reduce((n, g) => n + g.sessions, 0),
      groups: groups.map((g, i) => ({ id: `g-${daysAgo}-${i}`, savedUsd: Math.round(g.costUsd * 33) / 100, ...g })),
    };
  };
  data.byEvent = [
    today,
    past("Excel für Einsteiger", 3, 6, 238, 1.95, [{ name: "Gruppe A", requests: 131, costUsd: 1.08, sessions: 10 }, { name: "Gruppe B", requests: 107, costUsd: 0.87, sessions: 9 }]),
    past("KI im Vertrieb", 6, 7, 233, 2.31, [{ name: "Vertrieb Nord", requests: 233, costUsd: 2.31, sessions: 16 }]),
    past("Prompting-Grundlagen", 11, 5, 164, 1.62, [{ name: "Teilnehmende", requests: 164, costUsd: 1.62, sessions: 12 }]),
  ];
  data.activeSessions24h = 17;
  Object.assign(data.status, {
    anthropic: true, openai: true, database: "postgres", storage: "blob", storageSource: "BLOB_STORE_ID",
    storageAuth: "oidc", onVercel: true, mock: false, cronSecret: true, sessionSecret: true, adminPassword: true, paused: false,
  });
  return data;
}

/** Termine: Beispielzahlen für Anfragen, Kosten und Anmeldungen. */
export function patchEvents(data, state) {
  const at = (h, m) => {
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  };
  for (const e of data.events) {
    if (e.id === state.today) {
      Object.assign(e, { requests: 186, costUsd: 1.84, savedUsd: 0.62, guestsLoggedIn: 13, guestsActive: 12 });
      for (const g of e.groups) {
        const morning = g.name === "Vormittag";
        Object.assign(g, morning ? { requests: 112, costUsd: 1.1 } : { requests: 74, costUsd: 0.74 });
        g.guests.forEach((guest, i) => {
          if (i < g.guests.length - 1 || morning) guest.lastLoginAt = at(morning ? 8 : 8, 31 + i * 2);
        });
      }
    } else if (e.status === "laeuft") {
      Object.assign(e, { requests: 9, costUsd: 0.07, savedUsd: 0.02 });
      for (const g of e.groups) Object.assign(g, { requests: 9, costUsd: 0.07 });
    }
  }
  return data;
}
