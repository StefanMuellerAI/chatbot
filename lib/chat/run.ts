import "server-only";
import { providerErrorMessage } from "@/lib/errors";
import { createHash } from "node:crypto";
import type { UserSession } from "@/lib/auth/session";
import { getModel, getPreset, providerConfigured } from "@/lib/models";
import { runAnthropic } from "@/lib/providers/anthropic";
import { runMock } from "@/lib/providers/mock";
import { runOpenAI } from "@/lib/providers/openai";
import { ProviderError, type ProviderRequest, type ProviderResult } from "@/lib/providers/types";
import { getSettings } from "@/lib/settings";
import type { ChatRequestBody, StreamEvent } from "@/lib/shared/types";
import { generateImage } from "@/lib/tools/images";
import { costOf, logUsage, modelPrices, promptCacheSavings } from "@/lib/usage";
import { answerCacheKey, lookupAnswer, storeAnswer } from "./answer-cache";
import { prepareMessages } from "./prepare";
import { buildSystemPrompt, promptVersion } from "./system-prompt";

/** Führt eine Chat-Anfrage aus und liefert die Events als SSE-Stream. */
export function chatStream(body: ChatRequestBody, session: UserSession, signal: AbortSignal): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let closed = false;
      const send = (event: StreamEvent) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          closed = true;
        }
      };
      // Keep-Alive, damit lange Denkphasen die Verbindung nicht beenden.
      const ping = setInterval(() => {
        if (!closed) {
          try {
            controller.enqueue(encoder.encode(": ping\n\n"));
          } catch {
            closed = true;
          }
        }
      }, 15_000);
      try {
        await runChat(body, session, signal, send);
      } catch (err) {
        if (!signal.aborted) {
          console.error("chat failed", err);
          send({ type: "error", message: userMessageFor(err) });
        }
      } finally {
        clearInterval(ping);
        closed = true;
        try {
          controller.close();
        } catch {
          // bereits geschlossen
        }
      }
    },
  });
}

async function runChat(
  body: ChatRequestBody,
  session: UserSession,
  signal: AbortSignal,
  send: (e: StreamEvent) => void,
): Promise<void> {
  const settings = await getSettings();
  if (settings.paused) {
    send({ type: "error", message: settings.pausedMessage });
    return;
  }
  const model = await getModel(body.modelId);
  if (!model || !model.enabled) {
    send({ type: "error", message: "Dieses Modell ist nicht (mehr) verfügbar. Bitte wähle ein anderes." });
    return;
  }
  const mock = process.env.FREEBIE_MOCK === "1";
  if (!mock && !providerConfigured(model.provider)) {
    send({
      type: "error",
      message: `Für ${model.provider === "anthropic" ? "Claude" : "OpenAI"} ist noch kein API-Schlüssel hinterlegt. Bitte in Vercel ergänzen.`,
    });
    return;
  }
  const last = body.messages[body.messages.length - 1];
  if (!last || last.role !== "user") {
    send({ type: "error", message: "Die letzte Nachricht muss von dir stammen." });
    return;
  }

  const preset = await getPreset(body.presetId);
  const features = settings.features;
  const systemPrompt = buildSystemPrompt(features, settings.systemPromptAddendum);
  const presetPrompt = preset?.promptAddendum.trim() || null;
  const imageAvailable = mock || Boolean(process.env.OPENAI_API_KEY);
  const tools = {
    webSearch: features.webSearch && model.capabilities.webSearch,
    generateImage: features.imageGeneration && imageAvailable && model.capabilities.tools,
  };
  const prices = modelPrices(model);

  // 1) Antwort-Cache: identischer Verlauf → gespeicherte Antwort ohne API-Aufruf.
  const cacheKey = answerCacheKey({
    modelRowId: model.id,
    apiModelId: model.modelId,
    systemVersion: promptVersion(systemPrompt),
    presetVersion: presetPrompt ? promptVersion(presetPrompt) : null,
    tools,
    messages: body.messages,
  });
  if (features.answerCache && !body.bypassCache) {
    const hit = await lookupAnswer(cacheKey);
    if (hit) {
      send({ type: "start", modelId: model.id, fromCache: true });
      if (hit.answer.thinking) send({ type: "thinking", text: hit.answer.thinking });
      for (const c of hit.answer.citations) send({ type: "citation", citation: c });
      for (const chunk of hit.answer.text.match(/[\s\S]{1,400}/g) ?? []) {
        if (signal.aborted) return;
        send({ type: "text", text: chunk });
        await new Promise((r) => setTimeout(r, 10));
      }
      send({ type: "done", native: hit.answer.native, usage: hit.usage, stopReason: hit.answer.stopReason, fromCache: true });
      await logUsage({
        sessionHash: session.sessionHash,
        modelId: model.id,
        feature: "chat",
        costUsd: 0,
        savedUsd: hit.costUsd,
        answerCacheHit: true,
      });
      return;
    }
  }

  // 2) Nachrichten deterministisch aufbereiten und Provider aufrufen.
  send({ type: "start", modelId: model.id, fromCache: false });
  const prepared = await prepareMessages(body.messages, model, { nativePdf: settings.nativePdf });
  let imagesGenerated = 0;
  const request: ProviderRequest = {
    model,
    systemPrompt,
    presetPrompt,
    messages: prepared,
    tools,
    cacheTtl: settings.claudeCacheTtl,
    conversationKey: `freebie-${createHash("sha256").update(body.conversationId).digest("hex").slice(0, 16)}`,
    signal,
    emit: send,
    generateImage: async (input) => {
      imagesGenerated++;
      return generateImage(input, { sessionHash: session.sessionHash, settings });
    },
  };

  let result: ProviderResult;
  if (mock) result = await runMock(request);
  else if (model.provider === "anthropic") result = await runAnthropic(request);
  else if (model.provider === "openai") result = await runOpenAI(request);
  else throw new ProviderError(`Unbekannter Provider ${model.provider}`, "Unbekannter Anbieter.");

  const costUsd = mock ? 0 : costOf(result.usage, prices) + result.extraCostUsd;
  const usage = { ...result.usage, costUsd };
  if (result.stopReason === "refusal") {
    const note = "Das Modell hat diese Anfrage aus Sicherheitsgründen abgelehnt. Formuliere sie gern um oder probiere ein anderes Modell.";
    send({ type: "text", text: result.text ? `\n\n_${note}_` : note });
  }
  send({ type: "done", native: result.native, usage, stopReason: result.stopReason, fromCache: false });

  await logUsage({
    sessionHash: session.sessionHash,
    modelId: model.id,
    feature: "chat",
    usage: result.usage,
    costUsd,
    savedUsd: mock ? 0 : promptCacheSavings(result.usage, prices),
  });

  // 3) Antwort für identische Anfragen speichern (ohne Bilder, nur vollständige Antworten).
  if (features.answerCache && imagesGenerated === 0 && result.stopReason === "end_turn" && result.text.trim()) {
    await storeAnswer(
      cacheKey,
      model.id,
      {
        text: result.text,
        thinking: result.thinking,
        citations: result.citations,
        native: result.native,
        stopReason: result.stopReason,
      },
      usage,
      costUsd,
      settings.answerCacheHours,
    );
  }
}

function userMessageFor(err: unknown): string {
  if (err instanceof ProviderError) return err.userMessage;
  return providerErrorMessage(err);
}
