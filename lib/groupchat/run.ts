import "server-only";
import { createHash } from "node:crypto";
import type { UserSession } from "@/lib/auth/session";
import { prepareGroupTurns, type GroupAnswer, type GroupPost } from "@/lib/chat/prepare";
import { runTurn, toolSetFor, userMessageFor } from "@/lib/chat/run";
import { buildSystemPrompt } from "@/lib/chat/system-prompt";
import type { ModelRow } from "@/lib/models";
import type { AppSettings } from "@/lib/settings";
import { GROUPCHAT_MAILBOX_BLOCKED } from "@/lib/shared/groupchat";
import type { Attachment, Citation, Effort, GeneratedImage, NativeTurn, StreamEvent, UsageInfo } from "@/lib/shared/types";
import { finishAnswer, type AnswerJob, type GroupMessageRow, type StoredAnswer } from "./store";

function toItem(row: GroupMessageRow): GroupPost | GroupAnswer {
  if (row.kind === "person") {
    return {
      kind: "person",
      author: row.authorName ?? "?",
      text: row.text,
      attachments: (row.attachments as Attachment[] | null) ?? [],
      contextDate: row.contextDate,
      createdAt: row.createdAt,
    };
  }
  const answer = (row.answer ?? {}) as StoredAnswer;
  return {
    kind: "freebie",
    text: row.text,
    native: (row.native as NativeTurn | null) ?? undefined,
    images: answer.images,
    effort: row.effort as Effort | null,
    webSearch: row.webSearch,
  };
}

/**
 * Freebie antwortet im Gruppenchat: Verlauf aus der Datenbank (nie vom Browser), gleiche Werkzeuge wie im
 * privaten Chat (Posteingang gesperrt), kein Antwort-Cache. Die fragende Person bekommt den Stream; das
 * Ergebnis speichert der Server selbst – auch bei Abbruch und Fehlern, damit der Chat wieder frei ist.
 */
export async function runGroupAnswer(
  job: AnswerJob,
  ctx: { session: UserSession; settings: AppSettings; model: ModelRow; signal: AbortSignal; send: (e: StreamEvent) => void },
): Promise<void> {
  const { session, settings, model } = ctx;
  const got = { text: "", thinking: "", citations: [] as Citation[], images: [] as GeneratedImage[], fallbackModel: undefined as string | undefined };
  const send = (e: StreamEvent) => {
    if (e.type === "text") got.text += e.text;
    else if (e.type === "thinking") got.thinking += e.text;
    else if (e.type === "citation") got.citations.push(e.citation);
    else if (e.type === "image") got.images.push(e.image);
    else if (e.type === "fallback") got.fallbackModel = e.model;
    ctx.send(e);
  };
  const partial = (usage?: UsageInfo): StoredAnswer => ({
    thinking: got.thinking || undefined,
    citations: got.citations.length ? got.citations.filter((c, i) => got.citations.findIndex((x) => x.url === c.url) === i) : undefined,
    images: got.images.length ? got.images : undefined,
    usage,
    fallbackModel: got.fallbackModel,
  });
  try {
    send({ type: "start", modelId: model.id, fromCache: false });
    const prepared = await prepareGroupTurns(job.history.map(toItem), model, {
      nativePdf: settings.nativePdf,
      current: { effort: job.effort, webSearch: job.webSearch },
    });
    const { result, usage } = await runTurn({
      session,
      settings,
      model,
      systemPrompt: buildSystemPrompt(settings.features, settings.systemPromptAddendum),
      presetPrompt: null,
      prepared,
      tools: toolSetFor(settings.features, model),
      mailboxConnected: false,
      mailboxBlocked: GROUPCHAT_MAILBOX_BLOCKED,
      groupChat: true,
      // Alle Mitglieder teilen sich den Prompt-Cache des Gruppenchats.
      conversationKey: `freebie-gc-${createHash("sha256").update(job.chatId).digest("hex").slice(0, 16)}`,
      signal: ctx.signal,
      send,
    });
    await finishAnswer(job.chatId, job.answerId, {
      status: "done",
      text: got.text,
      modelId: model.id,
      native: result.native,
      answer: { ...partial(usage), stopReason: result.stopReason },
    });
  } catch (err) {
    const stopped = ctx.signal.aborted;
    const message = userMessageFor(err);
    if (!stopped) {
      console.error("group answer failed", err);
      send({ type: "error", message });
    }
    await finishAnswer(job.chatId, job.answerId, {
      status: stopped ? "stopped" : "error",
      text: stopped && got.text ? `${got.text}\n\n_(Abgebrochen)_` : got.text,
      modelId: model.id,
      answer: {
        ...partial(),
        stopReason: stopped ? "stopped" : "incomplete",
        error: stopped ? (got.text ? undefined : "Abgebrochen.") : message,
      },
    }).catch((e) => console.error("group answer not saved", e));
  }
}

/** Server-Sent Events wie bei /api/chat, inklusive Keep-Alive bei langen Denkphasen. */
export function eventStream(run: (send: (e: StreamEvent) => void) => Promise<void>): { stream: ReadableStream<Uint8Array>; done: Promise<void> } {
  const encoder = new TextEncoder();
  let done: Promise<void> = Promise.resolve();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      let closed = false;
      const write = (chunk: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(chunk));
        } catch {
          closed = true;
        }
      };
      const ping = setInterval(() => write(": ping\n\n"), 15_000);
      done = run((e) => write(`data: ${JSON.stringify(e)}\n\n`))
        .catch((err) => console.error("group stream failed", err))
        .finally(() => {
          clearInterval(ping);
          closed = true;
          try {
            controller.close();
          } catch {
            // bereits geschlossen
          }
        });
    },
  });
  return { stream, done };
}
