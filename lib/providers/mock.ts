import "server-only";
import type { PreparedPart } from "@/lib/chat/prepare";
import type { ProviderRequest, ProviderResult } from "./types";
import { emptyUsage } from "./types";

/**
 * Offline-Provider für Entwicklung und E2E-Tests (FREEBIE_MOCK=1).
 * Simuliert Streaming, Gedankengang, Websuche, Bild-Tool und Artefakte – ohne API-Kosten.
 *
 * Steuerung über Stichwörter in der Nachricht (nur im Testmodus wirksam):
 *   #langsam            langsamer Stream (zum Testen von „Stoppen“)
 *   #warten             3 Sekunden Denkpause vor dem ersten Text
 *   #fehler:NNN         Anbieterfehler mit HTTP-Status NNN (401, 413, 429, 500 …)
 *   #ablehnung          Ablehnung aus Sicherheitsgründen
 *   #maxtokens          Antwort wegen Längenbegrenzung abgeschnitten
 *   #ersatzmodell       ein Ersatzmodell hat geantwortet
 *   #quellen:N          N Quellen (mit Dubletten)
 *   #bildfehler         Bild-Werkzeug scheitert
 *   #formatierung       Markdown-Schaufenster inkl. HTML-/Script-Einschleusung
 *   #lang               sehr lange Antwort
 *   #svg #markdown-artefakt #code-artefakt #mermaid-fehler #version:N #artefakt-angriff
 *   #zeige-dateien      gibt die an das Modell übergebenen Dateiinhalte aus
 *   #postfach           liest den Posteingang (auch bei Fragen nach „E-Mails“ oder „Posteingang“)
 *   #postfach-erzwingen ruft die Postfach-Werkzeuge auch ohne Verbindung auf (Server muss ablehnen)
 *   #mail-lesen:ID      liest eine bestimmte Mail
 *   #senden:a,b         verschickt eine Mail an a und b (mit #anzahl:N mehrfach)
 */
export async function runMock(req: ProviderRequest): Promise<ProviderResult> {
  const users = req.messages.filter((m) => m.role === "user");
  const last = users[users.length - 1];
  const parts: PreparedPart[] = last && last.role === "user" ? last.parts : [];
  // Nur der eigene Text der Nutzerin bzw. des Nutzers (letzter Textteil, ohne Kontext und Dateien).
  const textParts = parts.filter((p) => p.type === "text");
  const lastText = (textParts[textParts.length - 1] as { text: string } | undefined)?.text.split("\n\n").pop() ?? "";
  const lower = lastText.toLowerCase();
  // Ganze Stichwörter: „#lang“ soll nicht auf „#langsam“ ansprechen.
  const flag = (name: string) => new RegExp(`(^|\\s)${name}(?=\\s|$)`).test(lower);
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const pace = flag("#langsam") ? 150 : 8;
  let text = "";
  let thinking = "";
  let stopReason = "end_turn";
  let fallbackModel: string | undefined;
  const citations: ProviderResult["citations"] = [];
  let imageMade = false;
  let mailHandled = false;
  const tool = (name: string) => req.customTools.find((t) => t.name === name);

  const say = async (chunk: string) => {
    for (const piece of chunk.match(/[\s\S]{1,24}/g) ?? []) {
      if (req.signal.aborted) throw new Error("aborted");
      text += piece;
      req.emit({ type: "text", text: piece });
      await sleep(pace);
    }
  };

  const errorCode = /#fehler:(\d{3})/.exec(lower)?.[1];
  if (errorCode) {
    throw Object.assign(new Error(`Mock-Fehler ${errorCode}`), { status: Number(errorCode) });
  }

  thinking = `Ich überlege, wie ich auf „${lastText.slice(-80).trim()}“ am besten antworte.`;
  req.emit({ type: "thinking", text: thinking });
  await sleep(flag("#warten") ? 3000 : 30);

  if (flag("#ersatzmodell")) {
    fallbackModel = "claude-haiku-5-5";
    req.emit({ type: "fallback", model: fallbackModel });
  }

  const searchAllowed = req.tools.webSearch && last?.role === "user" && last.webSearch;
  const wantedSources = Number(/#quellen:(\d+)/.exec(lower)?.[1] ?? 0);
  if (searchAllowed && (wantedSources > 0 || /such|aktuell|news|heute/.test(lower))) {
    req.emit({ type: "status", status: "Suche im Web …" });
    await sleep(60);
    const sources =
      wantedSources > 0
        ? Array.from({ length: wantedSources }, (_, i) => ({
            // Jede fünfte Quelle ist eine Dublette der vorigen.
            url: `https://beispiel.de/quelle-${i % 5 === 4 ? i - 1 : i}`,
            title: `Quelle ${i % 5 === 4 ? i - 1 : i}`,
          }))
        : [{ url: "https://stefanai.de/", title: "StefanAI – KI Schulungen & Beratungen" }];
    for (const c of sources) {
      citations.push(c);
      req.emit({ type: "citation", citation: c });
    }
    req.emit({ type: "status", status: null });
  }

  const imageTool = tool("generate_image");
  if (imageTool && (/\bbild\b|foto|illustration/.test(lower) || flag("#bildfehler"))) {
    req.emit({ type: "status", status: imageTool.status });
    const result = flag("#bildfehler")
      ? { content: "Die Bild-API hat kein Bild geliefert.", isError: true }
      : await imageTool.run({
          prompt: lastText.slice(0, 200) || "A friendly robot",
          size: "1024x1024",
          quality: "low",
          reference_image_ids: parts.flatMap((p) =>
            p.type === "text" ? [...p.text.matchAll(/Bild-ID: ([^\]\s]+)/g)].map((m) => m[1]) : [],
          ),
        });
    req.emit({ type: "status", status: null });
    if (!result.isError) {
      imageMade = true;
      await say("Hier ist dein Bild (Testmodus). ");
    } else {
      await say(`Das Bild konnte nicht erzeugt werden: ${result.content} `);
    }
  }

  // Posteingang: über dieselben Werkzeuge wie die echten Modelle (Rechte und Verbindung prüft der Server).
  if (req.tools.mailbox && !imageMade) {
    const force = flag("#postfach-erzwingen");
    const sendTo = /#senden:(\S+)/.exec(lastText)?.[1];
    const readId = /#mail-lesen:(\S+)/.exec(lastText)?.[1];
    const asks = force || flag("#postfach") || /posteingang|postfach|meine[nrs]? (neuen |ungelesenen )?e-?mails?\b/.test(lower);
    const run = async (name: string, input: unknown) => {
      const t = tool(name)!;
      req.emit({ type: "status", status: t.status });
      const out = await t.run(input);
      req.emit({ type: "status", status: null });
      return out;
    };
    if ((sendTo || readId || asks) && !req.mailboxConnected && !force) {
      mailHandled = true;
      await say("Der Posteingang ist in diesem Chat nicht verbunden. Du kannst ihn unten im Eingabefeld unter „Verbindungen“ einschalten.");
    } else if (sendTo) {
      mailHandled = true;
      const count = Math.min(Number(/#anzahl:(\d+)/.exec(lower)?.[1] ?? 1), 10);
      const body = lastText.replace(/#\S+/g, "").trim() || "Hallo aus dem Testmodus!";
      for (let i = 0; i < count; i++) {
        const out = await run("mailbox_send", { to: sendTo.split(","), cc: [], subject: count > 1 ? `Testmodus ${i + 1}` : "Nachricht von Freebie (Testmodus)", body, in_reply_to: "" });
        await say(`${out.isError ? "Werkzeug-Fehler" : "Gesendet"}: ${out.content}\n\n`);
      }
    } else if (readId) {
      mailHandled = true;
      const out = await run("mailbox_read", { ids: [readId] });
      await say(out.isError ? `Werkzeug-Fehler: ${out.content}` : mailTable(out.content));
    } else if (asks) {
      mailHandled = true;
      const listed = await run("mailbox_list", { folder: "inbox", unread_only: false, query: "", limit: 10 });
      if (listed.isError) {
        await say(`Werkzeug-Fehler: ${listed.content}`);
      } else {
        const ids = [...listed.content.matchAll(/<email id="([^"]+)"/g)].map((m) => m[1]).slice(0, 3);
        if (ids.length === 0) await say("Dein Posteingang ist leer (Testmodus).");
        else await say(mailTable((await run("mailbox_read", { ids })).content));
      }
    }
  }

  const version = /#version:(\d+)/.exec(lower)?.[1];
  if (flag("#ablehnung")) {
    await say("Dazu kann ich leider nichts sagen.");
    stopReason = "refusal";
  } else if (flag("#formatierung")) {
    await say(FORMATTING_SHOWCASE);
  } else if (flag("#lang")) {
    for (let i = 1; i <= 60; i++) await say(`Absatz ${i}: ${"Freebie erklärt geduldig. ".repeat(6)}\n\n`);
  } else if (flag("#svg")) {
    await say(`Hier ist die Grafik:\n\n<artifact id="kreis" type="svg" title="Kreis">\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ff6900"/><text x="50" y="55" text-anchor="middle" fill="#fff">SVG</text></svg>\n</artifact>\n`);
  } else if (flag("#markdown-artefakt")) {
    await say(`<artifact id="notiz" type="markdown" title="Notiz">\n# Überschrift\n\n- Punkt eins\n- Punkt zwei\n</artifact>\n`);
  } else if (flag("#code-artefakt")) {
    await say(`<artifact id="skript" type="code" language="python" title="Skript">\nprint("Hallo von Freebie")\n</artifact>\n`);
  } else if (flag("#mermaid-fehler")) {
    await say(`<artifact id="kaputt" type="mermaid" title="Kaputtes Diagramm">\nflowchart LR\n  A -->\n</artifact>\n`);
  } else if (flag("#artefakt-angriff")) {
    await say(`<artifact id="angriff" type="html" title="Angriff">\n${ATTACK_PAGE}\n</artifact>\n`);
  } else if (version || /webseite|landingpage|html|artefakt/.test(lower)) {
    const heading = version ? `Version ${version}` : "Hallo von Freebie!";
    await say("Hier ist eine kleine Beispielseite:\n\n");
    await say(
      `<artifact id="beispiel-seite" type="html" title="Beispielseite">\n<!doctype html>\n<html lang="de"><head><meta charset="utf-8"><title>Freebie Demo</title>\n<style>body{font-family:system-ui;margin:0;display:grid;place-items:center;min-height:100vh;background:linear-gradient(135deg,#ff6900,#e41c68);color:#fff}h1{font-size:3rem}</style></head>\n<body><main><h1>${heading}</h1><p>Diese Seite wurde im Testmodus erzeugt.</p><button onclick="this.textContent='Geklickt!'">Klick mich</button></main></body></html>\n</artifact>\n\nDu kannst die Seite rechts ansehen und herunterladen.`,
    );
  } else if (/diagramm|mermaid|ablauf/.test(lower)) {
    await say(
      `Hier ist der Ablauf als Diagramm:\n\n<artifact id="ablauf" type="mermaid" title="Ablauf">\nflowchart LR\n  A["Frage stellen"] --> B["Freebie denkt nach"]\n  B --> C["Antwort lesen"]\n</artifact>\n`,
    );
  } else if (!imageMade && !mailHandled) {
    await say(diagnosis(req, parts, lastText));
    // Tilden-Zaun: Dateiinhalte enthalten selbst ```-Blöcke (z. B. Tabellen als CSV).
    if (flag("#zeige-dateien")) await say(`\n\n~~~~text\n${fileContents(parts)}\n~~~~`);
  }

  if (flag("#maxtokens")) {
    stopReason = "max_tokens";
    await say("\n\n_(Die Antwort wurde wegen der Längenbegrenzung abgeschnitten.)_");
  }

  const prior = req.messages.length - 1;
  const usage = emptyUsage();
  usage.inputTokens = 120;
  usage.cacheReadTokens = prior > 0 ? 900 + prior * 100 : 0;
  usage.cacheWriteTokens = prior > 0 ? 100 : 1000;
  usage.outputTokens = Math.ceil(text.length / 4);

  return {
    text,
    thinking,
    citations,
    native: { provider: "mock", model: req.model.modelId, items: [{ text }] },
    usage,
    stopReason,
    fallbackModel,
    extraCostUsd: 0,
  };
}

/** Zeigt, was beim Modell ankommt – so wird jede Einstellung im Chat sichtbar. */
function diagnosis(req: ProviderRequest, parts: PreparedPart[], lastText: string): string {
  const last = req.messages[req.messages.length - 1];
  const files = parts.flatMap((p) =>
    p.type === "text"
      ? [...p.text.matchAll(/<(?:datei|transkript) name="([^"]+)"|\[Bild "([^"]+)"/g)].map((m) => m[1] ?? m[2])
      : p.type === "pdf"
        ? [`${p.name} (PDF nativ)`]
        : [],
  );
  const extraParts = parts.filter((p) => p.type !== "text").length;
  const quote = lastText
    .slice(0, 300)
    .split("\n")
    .slice(-3)
    .join("\n> ");
  const rows: [string, string | number][] = [
    ["Modell", req.model.modelId],
    ["Nachrichten im Verlauf", req.messages.length],
    ["Zusätzliche Anhänge", extraParts],
    ["Dateien", files.length ? files.join(", ") : "keine"],
    ["Effort", last?.role === "user" ? last.effort : "-"],
    ["Websuche", req.tools.webSearch && last?.role === "user" && last.webSearch ? "an" : "aus"],
    ["Bild-Werkzeug", req.tools.generateImage ? "an" : "aus"],
    ["Posteingang", req.tools.mailbox ? (req.mailboxConnected ? "verbunden" : "nicht verbunden") : "aus"],
    ["Artefakte", req.systemPrompt.includes("# Artefakte") ? "an" : "aus"],
    ["Vorlage", req.presetPrompt ? req.presetPrompt.slice(0, 50).replace(/\s+/g, " ") : "keine"],
    ["Kursleitung", req.systemPrompt.includes("# Hinweise der Kursleitung") ? "ja" : "nein"],
  ];
  const table = rows.map(([k, v]) => `| ${k} | ${String(v).replace(/\|/g, "/")} |`).join("\n");
  return `**Testmodus:** Ich bin der Mock-Provider von Freebie.\n\nDu hast geschrieben:\n\n> ${quote}\n\n| Eigenschaft | Wert |\n|---|---|\n${table}\n\nFormel-Test: $E = mc^2$`;
}

/** Gelesene Mails als Tabelle (Von, Betreff, erste Textzeile) – so prüfen die Tests, was Freebie sah. */
function mailTable(content: string): string {
  const mails = [...content.matchAll(/<email [^>]*>([\s\S]*?)<\/email>/g)].map((m) => {
    const block = m[1];
    const from = /Von: (.+)/.exec(block)?.[1] ?? "?";
    const subject = /Betreff: (.+)/.exec(block)?.[1] ?? "?";
    const text = block.split("\n\n").slice(1).join(" ").replace(/\s+/g, " ").trim().slice(0, 80);
    return `| ${from} | ${subject.replace(/\|/g, "/")} | ${text.replace(/\|/g, "/")} |`;
  });
  const missing = /Nicht gefunden: (.+)/.exec(content)?.[1];
  const table = mails.length ? `**Testmodus – gelesene E-Mails:**\n\n| Von | Betreff | Text |\n|---|---|---|\n${mails.join("\n")}` : "Keine E-Mail gelesen.";
  return missing ? `${table}\n\nNicht gefunden: ${missing}` : table;
}

function fileContents(parts: PreparedPart[]): string {
  return parts
    .flatMap((p) => (p.type === "text" ? [...p.text.matchAll(/<(datei|transkript) [^>]*>[\s\S]*?<\/\1>/g)].map((m) => m[0].slice(0, 2000)) : []))
    .join("\n\n");
}

const FORMATTING_SHOWCASE = `# Formatierung

Das ist **fett**, *kursiv* und \`Code\`.

- Punkt eins
- Punkt zwei

| Monat | Umsatz |
|---|---|
| Jan | 100 |

$$a^2 + b^2 = c^2$$

\`\`\`python
def hallo():
    return "Freebie"
\`\`\`

[StefanAI](https://stefanai.de) · [Böser Link](javascript:alert(1)) · ![Fremdbild](https://example.com/bild.png)

<script>window.__xss = 1</script><img src="x" onerror="window.__xss = 2">`;

const ATTACK_PAGE = `<!doctype html><html><body><pre id="ergebnis">läuft …</pre><script>
const out = [];
try { out.push("cookie=" + (document.cookie || "leer")); } catch (e) { out.push("cookie=blockiert"); }
try { localStorage.setItem("x", "1"); out.push("storage=erlaubt"); } catch (e) { out.push("storage=blockiert"); }
try { out.push("parent=" + (window.parent.document ? "erreichbar" : "?")); } catch (e) { out.push("parent=blockiert"); }
fetch("/api/config").then(r => out.push("fetch=" + r.status)).catch(() => out.push("fetch=blockiert")).finally(() => {
  try { window.top.location.href = "https://example.com/"; out.push("navigation=versucht"); } catch (e) { out.push("navigation=blockiert"); }
  document.getElementById("ergebnis").textContent = out.join("\\n");
});
</script></body></html>`;
