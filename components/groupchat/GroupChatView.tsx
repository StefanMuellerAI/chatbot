"use client";
import { FileDown, Info, Lock, Menu, MessageSquarePlus, PanelRight, Printer, Upload, Users } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { collectArtifacts, type ArtifactVersion } from "@/lib/client/artifacts";
import { conversationToMarkdown, downloadText, safeName } from "@/lib/client/export";
import { answerAsChatMessage, groupChatAsConversation, postGroupMessage, removeGroupChat, streamGroupAnswer } from "@/lib/client/groupchat";
import { formatTime } from "@/lib/events/window";
import { GROUPCHAT_LIMITS, mentionsFreebie, splitMentions, systemText, type GroupChatDetail, type GroupChatMessage } from "@/lib/shared/groupchat";
import { mailName } from "@/lib/shared/mail";
import type { Attachment, Effort, PublicConfig, PublicModel, StreamEvent } from "@/lib/shared/types";
import { ArtifactPanel } from "@/components/artifacts/ArtifactPanel";
import { Composer, type ComposerHandle } from "@/components/chat/Composer";
import { AssistantMessage, AttachmentChip, type StreamingState } from "@/components/chat/Message";
import { ModelPicker } from "@/components/chat/ModelPicker";
import { MailAvatar } from "@/components/mail/Avatar";
import { cn } from "@/components/ui/cn";
import { LogoMark } from "@/components/ui/Logo";
import { MembersDialog } from "./GroupDialogs";
import { useGroupChat } from "./useGroupChat";

const EXAMPLES = [
  "@Freebie fasse unsere Notizen zusammen",
  "@Freebie mach daraus eine Aufgabenliste mit Verantwortlichen",
  "@Freebie formuliere daraus eine E-Mail an die Kursleitung",
];

const time = (iso: string) => formatTime(new Date(iso));

/** Beitragstext mit hervorgehobenem „@Freebie“ (reiner Text, nie HTML). */
function PostText({ text }: { text: string }) {
  return (
    <>
      {splitMentions(text).map((part, i) =>
        part.mention ? (
          <span key={i} className="font-semibold text-primary">
            {part.text}
          </span>
        ) : (
          <span key={i}>{part.text}</span>
        ),
      )}
    </>
  );
}

function Post({ message, mine }: { message: GroupChatMessage; mine: boolean }) {
  const author = message.author ?? "?";
  const attachments = message.attachments ?? [];
  if (mine) {
    return (
      <article aria-label="Deine Nachricht" className="flex max-w-[85%] flex-col items-end gap-1.5 self-end">
        {attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {attachments.map((a) => (
              <AttachmentChip key={a.id} attachment={a} />
            ))}
          </div>
        )}
        {message.text && (
          <div className="rounded-3xl rounded-br-lg bg-primary-soft px-4 py-2.5 text-[0.95rem] leading-relaxed break-words whitespace-pre-wrap">
            <PostText text={message.text} />
          </div>
        )}
        <span className="text-xs text-subtle">{time(message.createdAt)}</span>
      </article>
    );
  }
  return (
    <article aria-label={`Nachricht von ${mailName(author)}`} className="flex max-w-[88%] items-start gap-2.5">
      <span className="mt-0.5">
        <MailAvatar local={author} size={30} />
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="text-xs text-muted">
          <span className="font-semibold text-text">{mailName(author)}</span> · {time(message.createdAt)}
        </div>
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachments.map((a) => (
              <AttachmentChip key={a.id} attachment={a} />
            ))}
          </div>
        )}
        {message.text && (
          <div className="rounded-3xl rounded-tl-lg bg-surface-2 px-4 py-2.5 text-[0.95rem] leading-relaxed break-words whitespace-pre-wrap">
            <PostText text={message.text} />
          </div>
        )}
      </div>
    </article>
  );
}

/**
 * Ein Gruppenchat: Beiträge aller Mitglieder, Antworten von Freebie (auf „@Freebie“), Mitglieder-Dialog.
 * Wird je Chat neu eingehängt (key). Rendert den Hauptbereich und – bei Bedarf – das Artefakt-Panel.
 */
export function GroupChatView({
  chatId,
  me,
  config,
  model,
  modelId,
  onModelChange,
  effort,
  onEffortChange,
  webSearch,
  onWebSearchChange,
  isDark,
  hidden,
  onOpenMenu,
  onNewChat,
  onToast,
  onBusy,
  onGone,
  onChanged,
}: {
  chatId: string;
  /** Eigener Name im Chat (Benutzername bzw. „kursleitung“). */
  me: string;
  config: PublicConfig;
  model: PublicModel | undefined;
  modelId: string;
  onModelChange: (id: string) => void;
  effort: Effort;
  onEffortChange: (e: Effort) => void;
  webSearch: boolean;
  onWebSearchChange: (v: boolean) => void;
  isDark: boolean;
  /** Im Posteingang bleibt der Gruppenchat eingehängt (eine laufende Antwort geht weiter). */
  hidden: boolean;
  onOpenMenu: () => void;
  onNewChat: () => void;
  onToast: (text: string) => void;
  onBusy: (busy: boolean) => void;
  /** Den Chat gibt es für mich nicht mehr (gelöscht, ausgeblendet, Schalter aus). */
  onGone: (message: string) => void;
  /** Etwas hat sich geändert (Seitenleiste neu abfragen). */
  onChanged: () => void;
}) {
  const gone = useCallback((message: string) => onGone(/deaktiviert/.test(message) ? message : "Diesen Gruppenchat gibt es nicht mehr."), [onGone]);
  const { chat, loadError, refresh } = useGroupChat(chatId, gone);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState<StreamingState | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [artifactSel, setArtifactSel] = useState<{ id: string; version?: number } | null>(null);
  const autoOpened = useRef<Set<string>>(new Set());
  const composerRef = useRef<ComposerHandle>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    onBusy(Boolean(streaming));
  }, [streaming, onBusy]);
  useEffect(
    () => () => {
      abortRef.current?.abort();
      onBusy(false);
    },
    [onBusy],
  );

  const messages = useMemo(() => chat?.messages ?? [], [chat]);
  const left = Boolean(chat?.left);
  const hasContent = messages.some((m) => m.kind !== "system");
  const answering = messages.some((m) => m.kind === "freebie" && m.status === "pending");
  const myPendingShown = Boolean(streaming) && messages.some((m) => m.kind === "freebie" && m.status === "pending" && m.askedBy === me);

  // Mitlaufen, solange man unten ist.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [messages, streaming]);

  const artifactsEnabled = config.features.artifacts;
  const artifacts = useMemo(() => {
    if (!artifactsEnabled) return new Map<string, ArtifactVersion[]>();
    const list = messages.filter((m) => m.kind === "freebie" && m.text).map((m) => ({ id: m.id, role: "assistant", text: m.text }));
    if (streaming) list.push({ id: "streaming", role: "assistant", text: streaming.text });
    return collectArtifacts(list);
  }, [messages, streaming, artifactsEnabled]);
  const openArtifact = (id: string, messageId: string) => {
    const versions = artifacts.get(id);
    const match = versions?.find((v) => v.messageId === messageId);
    setArtifactSel({ id, version: match && match !== versions![versions!.length - 1] ? match.version : undefined });
  };
  const latestArtifactId = useMemo(() => [...artifacts.keys()].pop() ?? null, [artifacts]);
  // Ein neues Artefakt der eigenen Antwort öffnet sich von selbst (wie im privaten Chat).
  useEffect(() => {
    for (const [id, versions] of artifacts) {
      const last = versions[versions.length - 1];
      const key = `${id}:${versions.length}`;
      if (last.messageId === "streaming" && !autoOpened.current.has(key)) {
        autoOpened.current.add(key);
        setArtifactSel({ id });
      }
    }
  }, [artifacts]);
  const artifactVersions = artifactSel ? artifacts.get(artifactSel.id) : undefined;

  /** Freebie antworten lassen (eigene Frage) oder die letzte Antwort neu generieren. */
  const ask = async (regenerate: boolean, modelOverride?: string) => {
    const use = (modelOverride && config.models.find((m) => m.id === modelOverride)) || model;
    if (!use) {
      onToast("Gerade ist kein Modell verfügbar.");
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    const state: StreamingState = { text: "", thinking: "", citations: [], images: [], status: null, fromCache: false };
    setStreaming({ ...state });
    stickToBottom.current = true;
    let scheduled = false;
    let finished = false;
    let rafId = 0;
    const flush = () => {
      scheduled = false;
      if (!finished) setStreaming({ ...state, citations: [...state.citations], images: [...state.images] });
    };
    try {
      await streamGroupAnswer(
        chatId,
        {
          modelId: use.id,
          effort: use.efforts.length ? effort : undefined,
          webSearch: config.features.webSearch && use.capabilities.webSearch ? webSearch : undefined,
          regenerate,
        },
        (ev: StreamEvent) => {
          if (ev.type === "text") state.text += ev.text;
          else if (ev.type === "thinking") state.thinking += ev.text;
          else if (ev.type === "status") state.status = ev.status;
          else if (ev.type === "citation") state.citations.push(ev.citation);
          else if (ev.type === "image") state.images.push(ev.image);
          else if (ev.type === "fallback") state.fallbackModel = ev.model;
          if (!scheduled) {
            scheduled = true;
            rafId = requestAnimationFrame(flush);
          }
        },
        controller.signal,
      );
    } catch (err) {
      if (!controller.signal.aborted) onToast(err instanceof Error ? err.message : "Die Verbindung ist abgebrochen.");
    }
    finished = true;
    cancelAnimationFrame(rafId);
    // Abgebrochen: Der Server speichert den Stand gleich – kurz warten, dann neu laden.
    if (controller.signal.aborted) await new Promise((r) => setTimeout(r, 400));
    await refresh();
    setStreaming(null);
    abortRef.current = null;
    onChanged();
  };

  const send = async (raw: string, attachments: Attachment[]) => {
    if (!chat || left || streaming || sending) return;
    const value = raw.trim();
    setText("");
    setSending(true);
    stickToBottom.current = true;
    try {
      await postGroupMessage(chatId, value, attachments);
    } catch (err) {
      setText(raw);
      composerRef.current?.setAttachments(attachments);
      onToast(err instanceof Error ? err.message : "Der Beitrag konnte nicht gesendet werden.");
      setSending(false);
      return;
    }
    await refresh();
    setSending(false);
    onChanged();
    if (mentionsFreebie(value)) {
      if (answering) onToast("Freebie antwortet gerade – bitte kurz warten und dann noch einmal fragen.");
      else await ask(false);
    }
  };

  const exportMarkdown = (detail: GroupChatDetail) => {
    const modelName = (id?: string) => config.models.find((m) => m.id === id)?.displayName;
    downloadText(conversationToMarkdown(groupChatAsConversation(detail), modelName), `${safeName(detail.title)}.md`);
  };

  // Verlassen oder entfernt: Wer hat es getan (für den Hinweis statt der Eingabeleiste)?
  const leaveNote = useMemo(() => {
    if (!chat?.left) return null;
    const at = chat.leftAt ? `um ${time(chat.leftAt)} Uhr ` : "";
    const removal = [...messages].reverse().find((m) => m.system?.action === "remove" && m.system.targets.includes(me));
    const owner = mailName(chat.owner);
    return removal
      ? `${mailName(removal.system!.actor)} hat dich ${at}aus diesem Gruppenchat entfernt. Du siehst den Verlauf bis dahin, kannst aber nicht mehr mitschreiben.`
      : `Du hast diesen Gruppenchat ${at}verlassen. Du siehst den Verlauf bis dahin, kannst aber nicht mehr mitschreiben. Nur ${owner} kann dich wieder einladen.`;
  }, [chat, messages, me]);

  const modelName = (id?: string) => config.models.find((m) => m.id === id)?.displayName;
  const lastId = messages[messages.length - 1]?.id;
  const members = chat?.members ?? [];
  const membersLabel = `Mitglieder (${members.length})`;

  return (
    <>
      <main
        hidden={hidden}
        className="relative flex min-w-0 flex-1 flex-col bg-bg bg-hero print:block print:bg-white"
        onDragOver={(e) => {
          // Dateien immer annehmen (sonst öffnet der Browser sie), Text wie gewohnt ins Eingabefeld.
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          if (!left && !config.paused) setDragging(true);
        }}
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          e.stopPropagation();
          setDragging(false);
          if (config.paused) onToast("Freebie macht gerade Pause – Dateien können nicht angehängt werden.");
          else if (!left) composerRef.current?.addFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <header className="flex h-14 shrink-0 items-center gap-1 px-2 sm:px-4 print:hidden">
          <button type="button" onClick={onOpenMenu} className="rounded-full p-2 text-muted hover:bg-surface-2 md:hidden" aria-label="Menü öffnen">
            <Menu className="h-5 w-5" />
          </button>
          <div className="max-sm:hidden">
            <ModelPicker models={config.models} value={modelId} onChange={onModelChange} disabled={Boolean(streaming)} />
          </div>
          <div className="flex min-w-0 items-center gap-2 sm:ml-1 sm:border-l sm:border-border sm:pl-3">
            <Users className="h-4.5 w-4.5 shrink-0 text-primary" aria-hidden />
            <h1 className="truncate font-display text-[0.97rem] font-semibold">{chat?.title ?? "Gruppenchat"}</h1>
            {left && <span className="shrink-0 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted">verlassen</span>}
          </div>
          <div className="flex-1" />
          {chat && !left && (
            <>
              <button
                type="button"
                onClick={() => setMembersOpen(true)}
                aria-label={membersLabel}
                title="Mitglieder"
                className="flex shrink-0 items-center rounded-full px-2 py-1 hover:bg-surface-2 max-sm:hidden"
              >
                {members.slice(0, 3).map((name, i) => (
                  <span key={name} className={cn("rounded-full ring-2 ring-bg", i > 0 && "-ml-2")}>
                    <MailAvatar local={name} size={28} />
                  </span>
                ))}
                {members.length > 3 && (
                  <span className="-ml-2 grid h-7 min-w-7 place-items-center rounded-full bg-surface-3 px-1.5 text-xs font-bold ring-2 ring-bg">+{members.length - 3}</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setMembersOpen(true)}
                aria-label={membersLabel}
                className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-surface-2 px-3 text-sm font-semibold sm:hidden"
              >
                <Users className="h-4 w-4" aria-hidden /> {members.length}
              </button>
            </>
          )}
          {chat && hasContent && !streaming && (
            <>
              <button
                type="button"
                onClick={() => exportMarkdown(chat)}
                className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-text max-sm:hidden"
                title="Chat als Markdown exportieren"
                aria-label="Chat als Markdown exportieren"
              >
                <FileDown className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-text max-sm:hidden"
                title="Drucken oder als PDF speichern"
                aria-label="Drucken oder als PDF speichern"
              >
                <Printer className="h-4.5 w-4.5" />
              </button>
            </>
          )}
          {artifacts.size > 0 && (
            <button
              type="button"
              onClick={() => setArtifactSel(artifactSel ? null : latestArtifactId ? { id: latestArtifactId } : null)}
              aria-expanded={Boolean(artifactSel)}
              aria-label={`Artefakte (${artifacts.size})`}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-text"
              title="Artefakte anzeigen"
            >
              <PanelRight className="h-4.5 w-4.5" />
              <span className="max-sm:hidden">Artefakte ({artifacts.size})</span>
            </button>
          )}
          <button type="button" onClick={onNewChat} disabled={Boolean(streaming)} className="rounded-full p-2 text-muted hover:bg-surface-2 disabled:opacity-40 md:hidden" aria-label="Neuer Chat">
            <MessageSquarePlus className="h-5 w-5" />
          </button>
        </header>

        <div
          ref={scrollRef}
          role="region"
          aria-label="Gespräch"
          className="min-h-0 flex-1 overflow-y-auto print:overflow-visible"
          onScroll={(e) => {
            const el = e.currentTarget;
            stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
          }}
        >
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6">
            {!chat && !loadError && <p className="py-10 text-center text-sm text-muted">Lade Gruppenchat …</p>}
            {loadError && (
              <p role="alert" className="rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
                {loadError}
              </p>
            )}
            {messages.map((m) => {
              if (m.kind === "system" && m.system) {
                return (
                  <div key={m.id} role="note" className="flex items-center gap-1.5 self-center rounded-full bg-surface-2 px-3 py-1 text-center text-xs text-muted">
                    <Users className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {systemText(m.system, me)} · {time(m.createdAt)}
                  </div>
                );
              }
              if (m.kind === "person") return <Post key={m.id} message={m} mine={m.author === me} />;
              if (m.kind !== "freebie") return null;
              const asked = m.askedBy === me ? "antwortet dir" : `antwortet ${mailName(m.askedBy ?? "")}`;
              if (m.status === "pending") {
                if (streaming && m.askedBy === me) {
                  return (
                    <div key={m.id} className="flex flex-col gap-1.5">
                      <div className="pl-[42px] text-xs text-muted">
                        <span className="font-semibold text-text">Freebie</span> · {asked}
                      </div>
                      <AssistantMessage streaming={streaming} isLast showCacheBadge={false} showCost={false} artifactsEnabled={artifactsEnabled} onOpenArtifact={openArtifact} />
                    </div>
                  );
                }
                return (
                  <article key={m.id} aria-label="Antwort von Freebie" aria-busy="true" className="flex gap-3">
                    <LogoMark size={30} className="mt-0.5" />
                    <div role="status" className="inline-flex items-center gap-2 self-start rounded-full bg-surface-2 px-3 py-1.5 text-sm text-muted">
                      <span className="dot-pulse inline-flex gap-1 text-primary" aria-hidden>
                        <span />
                        <span />
                        <span />
                      </span>
                      Freebie antwortet {m.askedBy === me ? "dir" : mailName(m.askedBy ?? "")} …
                    </div>
                  </article>
                );
              }
              const finished = m.id === lastId && !left && !streaming && !answering;
              return (
                <div key={m.id} className="flex flex-col gap-1.5">
                  <div className="pl-[42px] text-xs text-muted">
                    <span className="font-semibold text-text">Freebie</span> · {asked} · {time(m.createdAt)}
                  </div>
                  <AssistantMessage
                    message={answerAsChatMessage(m)}
                    modelName={modelName(m.modelId)}
                    isLast={finished}
                    showCacheBadge={false}
                    showCost={config.features.showCost}
                    onRegenerate={finished ? () => void ask(true, m.modelId) : undefined}
                    artifactsEnabled={artifactsEnabled}
                    onOpenArtifact={openArtifact}
                  />
                </div>
              );
            })}
            {streaming && !myPendingShown && (
              <AssistantMessage streaming={streaming} isLast showCacheBadge={false} showCost={false} artifactsEnabled={artifactsEnabled} onOpenArtifact={openArtifact} />
            )}
            {chat && !hasContent && !left && (
              <section aria-label="So funktioniert euer Gruppenchat" className="rounded-3xl border border-border bg-surface p-5 shadow-soft">
                <h2 className="font-display text-lg font-bold">So funktioniert euer Gruppenchat</h2>
                <ol className="mt-3 flex list-decimal flex-col gap-1.5 pl-5 text-[0.95rem] leading-relaxed">
                  <li>Schreibt Notizen, Ideen oder Texte hinein – alle Mitglieder sehen sie.</li>
                  <li>
                    Mit <strong className="text-primary">@Freebie</strong> fragt ihr Freebie, zum Beispiel nach einer Zusammenfassung.
                  </li>
                  <li>Freebie liest dafür den ganzen Verlauf und antwortet für alle sichtbar.</li>
                </ol>
                <div className="mt-4 flex flex-wrap gap-2">
                  {EXAMPLES.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => {
                        setText(`${example} `);
                        composerRef.current?.focus();
                      }}
                      className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-left text-sm text-muted transition hover:border-primary hover:text-primary"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl shrink-0 px-3 pb-3 sm:px-4 print:hidden">
          {leaveNote ? (
            <div role="note" className="flex flex-wrap items-center gap-3 rounded-3xl border border-border bg-surface px-4 py-3.5 shadow-soft">
              <Lock className="h-5 w-5 shrink-0 text-muted" aria-hidden />
              <p className="min-w-60 flex-1 text-sm leading-relaxed text-muted">{leaveNote}</p>
              <button
                type="button"
                onClick={() =>
                  void removeGroupChat(chatId, "hide")
                    .then(() => onGone("Aus deiner Liste entfernt."))
                    .catch((err: unknown) => onToast(err instanceof Error ? err.message : "Das hat nicht geklappt."))
                }
                className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-4 text-sm font-semibold hover:bg-surface-2"
              >
                Aus meiner Liste entfernen
              </button>
            </div>
          ) : (
            chat && (
              <Composer
                ref={composerRef}
                config={config}
                model={model}
                text={text}
                onTextChange={setText}
                effort={effort}
                onEffortChange={onEffortChange}
                webSearch={webSearch}
                onWebSearchChange={onWebSearchChange}
                streaming={Boolean(streaming)}
                disabledReason={config.paused ? "Freebie macht gerade Pause." : undefined}
                onSend={(t, a) => void send(t, a)}
                onStop={() => abortRef.current?.abort()}
                onImageMode={() => {}}
                imageMode={false}
                mentions
                placeholder="Schreib der Gruppe … – mit @Freebie fragst du Freebie"
                maxChars={GROUPCHAT_LIMITS.text}
              />
            )
          )}
          <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-subtle">
            <Info className="h-3.5 w-3.5 shrink-0" />
            Alle Mitglieder sehen, was du hier schreibst. Bitte keine echten oder vertraulichen Daten.
          </p>
        </div>

        {dragging && (
          <div className="pointer-events-none absolute inset-3 z-30 grid place-items-center rounded-3xl border-2 border-dashed border-primary bg-primary-soft/80 backdrop-blur-sm">
            <div className="text-center text-primary">
              <Upload className="mx-auto mb-2 h-8 w-8" />
              <p className="font-display text-lg font-semibold">Dateien hier ablegen</p>
              <p className="text-sm">Alle Mitglieder sehen die Datei</p>
            </div>
          </div>
        )}
      </main>

      {!hidden && artifactVersions && artifactVersions.length > 0 && (
        <section className="fixed inset-0 z-50 border-border md:static md:z-auto md:w-[min(46vw,760px)] md:shrink-0 md:border-l print:hidden">
          <ArtifactPanel
            key={`${artifactSel?.id}:${artifactSel?.version ?? "neu"}`}
            versions={artifactVersions}
            initialVersion={artifactSel?.version}
            dark={isDark}
            onClose={() => setArtifactSel(null)}
          />
        </section>
      )}

      {chat && (
        <MembersDialog
          open={membersOpen}
          onClose={() => setMembersOpen(false)}
          chat={chat}
          me={me}
          onChanged={async () => {
            await refresh();
            onChanged();
          }}
          onDeleted={(message) => {
            setMembersOpen(false);
            onGone(message);
          }}
          onToast={onToast}
        />
      )}
    </>
  );
}
