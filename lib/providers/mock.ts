import "server-only";
import type { ProviderRequest, ProviderResult } from "./types";
import { emptyUsage } from "./types";

/**
 * Offline-Provider für Entwicklung und E2E-Tests (FREEBIE_MOCK=1).
 * Simuliert Streaming, Gedankengang, Websuche, Bild-Tool und Artefakte – ohne API-Kosten.
 */
export async function runMock(req: ProviderRequest): Promise<ProviderResult> {
  const users = req.messages.filter((m) => m.role === "user");
  const last = users[users.length - 1];
  // Nur der eigene Text der Nutzerin bzw. des Nutzers (letzter Textteil, ohne Kontext und Dateien).
  const textParts = last && last.role === "user" ? last.parts.filter((p) => p.type === "text") : [];
  const lastText = (textParts[textParts.length - 1] as { text: string } | undefined)?.text.split("\n\n").pop() ?? "";
  const lower = lastText.toLowerCase();
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
  let text = "";
  let thinking = "";
  const citations: ProviderResult["citations"] = [];
  const images: ProviderResult["images"] = [];

  const say = async (chunk: string) => {
    for (const piece of chunk.match(/[\s\S]{1,24}/g) ?? []) {
      if (req.signal.aborted) throw new Error("aborted");
      text += piece;
      req.emit({ type: "text", text: piece });
      await sleep(8);
    }
  };

  thinking = `Ich überlege, wie ich auf „${lastText.slice(-80).trim()}“ am besten antworte.`;
  req.emit({ type: "thinking", text: thinking });
  await sleep(30);

  if (req.tools.webSearch && last?.role === "user" && last.webSearch && /such|aktuell|news|heute/.test(lower)) {
    req.emit({ type: "status", status: "Suche im Web …" });
    await sleep(60);
    const c = { url: "https://stefanai.de/", title: "StefanAI – KI Schulungen & Beratungen" };
    citations.push(c);
    req.emit({ type: "citation", citation: c });
    req.emit({ type: "status", status: null });
  }

  if (req.tools.generateImage && /\bbild\b|foto|illustration/.test(lower)) {
    req.emit({ type: "status", status: "Erzeuge Bild …" });
    const result = await req.generateImage({
      prompt: lastText.slice(0, 200) || "A friendly robot",
      size: "1024x1024",
      quality: "low",
      reference_image_ids: [],
    });
    req.emit({ type: "status", status: null });
    if (result.ok) {
      images.push(result.image);
      req.emit({ type: "image", image: result.image });
      await say("Hier ist dein Bild (Testmodus). ");
    } else {
      await say(`Das Bild konnte nicht erzeugt werden: ${result.error} `);
    }
  }

  if (/webseite|landingpage|html|artefakt/.test(lower)) {
    await say("Hier ist eine kleine Beispielseite:\n\n");
    await say(
      `<artifact id="beispiel-seite" type="html" title="Beispielseite">\n<!doctype html>\n<html lang="de"><head><meta charset="utf-8"><title>Freebie Demo</title>\n<style>body{font-family:system-ui;margin:0;display:grid;place-items:center;min-height:100vh;background:linear-gradient(135deg,#ff6900,#e41c68);color:#fff}h1{font-size:3rem}</style></head>\n<body><main><h1>Hallo von Freebie!</h1><p>Diese Seite wurde im Testmodus erzeugt.</p><button onclick="this.textContent='Geklickt!'">Klick mich</button></main></body></html>\n</artifact>\n\nDu kannst die Seite rechts ansehen und herunterladen.`,
    );
  } else if (/diagramm|mermaid|ablauf/.test(lower)) {
    await say(
      `Hier ist der Ablauf als Diagramm:\n\n<artifact id="ablauf" type="mermaid" title="Ablauf">\nflowchart LR\n  A["Frage stellen"] --> B["Freebie denkt nach"]\n  B --> C["Antwort lesen"]\n</artifact>\n`,
    );
  } else if (images.length === 0) {
    const attachmentCount = last?.role === "user" ? last.parts.filter((p) => p.type !== "text").length : 0;
    await say(
      `**Testmodus:** Ich bin der Mock-Provider von Freebie.\n\nDu hast geschrieben:\n\n> ${lastText
        .slice(0, 300)
        .split("\n")
        .slice(-3)
        .join("\n> ")}\n\n| Eigenschaft | Wert |\n|---|---|\n| Nachrichten im Verlauf | ${req.messages.length} |\n| Zusätzliche Anhänge | ${attachmentCount} |\n| Effort | ${last?.role === "user" ? last.effort : "-"} |\n\nFormel-Test: $E = mc^2$`,
    );
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
    images,
    native: { provider: "mock", model: req.model.modelId, items: [{ text }] },
    usage,
    stopReason: "end_turn",
    extraCostUsd: 0,
  };
}
