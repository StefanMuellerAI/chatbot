"use client";
import { useLiveQuery } from "dexie-react-hooks";
import { FileDown, Info, Menu, MessageSquarePlus, PanelRight, Printer, TriangleAlert, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import { collectArtifacts } from "@/lib/client/artifacts";
import { appendMessages, db, saveConversation, type Conversation } from "@/lib/client/db";
import { conversationToMarkdown, downloadText, safeName } from "@/lib/client/export";
import { streamChat } from "@/lib/client/api";
import { formatContextDate } from "@/lib/shared/date";
import type { Attachment, ChatMessage, Effort, GeneratedImage, PublicConfig, StreamEvent } from "@/lib/shared/types";
import { ArtifactPanel } from "@/components/artifacts/ArtifactPanel";
import { cn } from "@/components/ui/cn";
import { useTheme } from "@/components/ui/theme";
import { Composer, type ComposerHandle } from "./Composer";
import { EmptyState } from "./EmptyState";
import { ImageModeDialog } from "./ImageModeDialog";
import { AssistantMessage, UserMessage, type StreamingState } from "./Message";
import { ModelPicker } from "./ModelPicker";
import { NoticeDialog } from "./NoticeDialog";
import { Sidebar } from "./Sidebar";

const LAST_MODEL_KEY = "freebie-last-model";

function uuid(): string {
  return crypto.randomUUID();
}

/** Nur die Felder, die der Server braucht – hält die Anfrage klein. */
function payloadMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((m) => !(m.role === "assistant" && m.error && !m.text))
    .map((m) =>
      m.role === "user"
        ? {
            id: m.id,
            role: m.role,
            text: m.text,
            createdAt: m.createdAt,
            attachments: m.attachments,
            contextDate: m.contextDate,
            effort: m.effort,
            webSearch: m.webSearch,
          }
        : {
            id: m.id,
            role: m.role,
            text: m.text,
            createdAt: m.createdAt,
            modelId: m.modelId,
            native: m.native,
            images: m.images,
          },
    );
}

export function ChatApp() {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const conversations = useLiveQuery(() => db.conversations.orderBy("updatedAt").reverse().toArray(), [], [] as Conversation[]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = useMemo(() => conversations.find((c) => c.id === activeId) ?? null, [conversations, activeId]);

  const [modelId, setModelId] = useState("");
  const [presetId, setPresetId] = useState<string | null>(null);
  const [effort, setEffort] = useState<Effort>("medium");
  const [webSearch, setWebSearch] = useState(true);
  const [text, setText] = useState("");
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [streaming, setStreaming] = useState<{ conversationId: string; state: StreamingState } | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [artifactId, setArtifactId] = useState<string | null>(null);
  const autoOpened = useRef<Set<string>>(new Set());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [noticeOpen, setNoticeOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [theme, setTheme, isDark] = useTheme();
  const composerRef = useRef<ComposerHandle>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);

  // Konfiguration laden
  useEffect(() => {
    api<PublicConfig>("/api/config")
      .then((c) => {
        setConfig(c);
        let preferred: string | null = null;
        try {
          preferred = localStorage.getItem(LAST_MODEL_KEY);
        } catch {
          // ignorieren
        }
        const initial = c.models.find((m) => m.id === preferred) ?? c.models.find((m) => m.isDefault) ?? c.models[0];
        if (initial) {
          setModelId(initial.id);
          setEffort(initial.defaultEffort);
        }
      })
      .catch((err) => setConfigError(err instanceof Error ? err.message : "Konfiguration konnte nicht geladen werden."));
  }, []);

  const model = config?.models.find((m) => m.id === modelId);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  }, []);

  // Beim Wechsel des Chats dessen Einstellungen übernehmen
  const selectConversation = useCallback(
    (id: string | null) => {
      if (streaming) return;
      setActiveId(id);
      setEditIndex(null);
      setArtifactId(null);
      setSidebarOpen(false);
      if (!id || !config) {
        setPresetId(null);
        return;
      }
      const conv = conversations.find((c) => c.id === id);
      if (!conv) return;
      const m = config.models.find((x) => x.id === conv.modelId) ?? config.models.find((x) => x.isDefault) ?? config.models[0];
      if (m) {
        setModelId(m.id);
        setEffort(conv.effort && m.efforts.includes(conv.effort) ? conv.effort : m.defaultEffort);
      }
      setPresetId(conv.presetId);
      setWebSearch(conv.webSearch ?? true);
      composerRef.current?.setAttachments([]);
    },
    [config, conversations, streaming],
  );

  const changeWebSearch = (value: boolean) => {
    setWebSearch(value);
    if (active) void db.conversations.update(active.id, { webSearch: value });
  };

  const changeModel = async (id: string) => {
    const next = config?.models.find((m) => m.id === id);
    if (!next) return;
    setModelId(id);
    if (!next.efforts.includes(effort)) setEffort(next.defaultEffort);
    try {
      localStorage.setItem(LAST_MODEL_KEY, id);
    } catch {
      // ignorieren
    }
    if (active && active.modelId !== id) {
      await db.conversations.update(active.id, { modelId: id });
      if (active.messages.length) showToast("Modell gewechselt – für dieses Gespräch startet der Cache neu.");
    }
  };

  // Automatisch nach unten scrollen, solange man unten ist
  useEffect(() => {
    const el = scrollRef.current;
    if (el && stickToBottom.current) el.scrollTop = el.scrollHeight;
  }, [streaming, active?.messages.length]);

  const messages = useMemo(() => active?.messages ?? [], [active]);
  const streamingHere = streaming && streaming.conversationId === active?.id ? streaming.state : null;

  const artifacts = useMemo(() => {
    const list = messages.map((m) => ({ id: m.id, role: m.role, text: m.text }));
    if (streamingHere) list.push({ id: "streaming", role: "assistant", text: streamingHere.text });
    return collectArtifacts(list);
  }, [messages, streamingHere]);

  // Neues Artefakt während des Streamings automatisch öffnen
  useEffect(() => {
    if (!streamingHere || !config?.features.artifacts) return;
    for (const [id, versions] of artifacts) {
      const last = versions[versions.length - 1];
      if (last.messageId === "streaming" && !autoOpened.current.has(`${active?.id}:${id}:${versions.length}`)) {
        autoOpened.current.add(`${active?.id}:${id}:${versions.length}`);
        setArtifactId(id);
      }
    }
  }, [artifacts, streamingHere, active?.id, config?.features.artifacts]);

  const runAssistant = async (conv: Conversation, bypassCache: boolean) => {
    const controller = new AbortController();
    abortRef.current = controller;
    const state: StreamingState = { text: "", thinking: "", citations: [], images: [], status: null, fromCache: false };
    setStreaming({ conversationId: conv.id, state: { ...state } });
    stickToBottom.current = true;
    let done: Extract<StreamEvent, { type: "done" }> | null = null;
    let error: string | null = null;
    let scheduled = false;
    let finished = false;
    let rafId = 0;
    const flush = () => {
      scheduled = false;
      // Ein verspäteter Frame (z. B. aus einem Hintergrund-Tab) darf den beendeten Stream nicht wiederbeleben.
      if (finished) return;
      setStreaming({ conversationId: conv.id, state: { ...state, citations: [...state.citations], images: [...state.images] } });
    };
    try {
      await streamChat(
        {
          conversationId: conv.id,
          modelId: conv.modelId,
          presetId: conv.presetId,
          messages: payloadMessages(conv.messages),
          bypassCache,
        },
        (ev) => {
          switch (ev.type) {
            case "start":
              state.fromCache = ev.fromCache;
              break;
            case "text":
              state.text += ev.text;
              break;
            case "thinking":
              state.thinking += ev.text;
              break;
            case "status":
              state.status = ev.status;
              break;
            case "citation":
              state.citations.push(ev.citation);
              break;
            case "image":
              state.images.push(ev.image);
              break;
            case "fallback":
              state.fallbackModel = ev.model;
              break;
            case "done":
              done = ev;
              break;
            case "error":
              error = ev.message;
              break;
          }
          if (!scheduled) {
            scheduled = true;
            rafId = requestAnimationFrame(flush);
          }
        },
        controller.signal,
      );
    } catch (err) {
      if (!controller.signal.aborted) error = err instanceof Error ? err.message : "Verbindung unterbrochen.";
    }
    finished = true;
    cancelAnimationFrame(rafId);
    const stopped = controller.signal.aborted;
    const result = done as Extract<StreamEvent, { type: "done" }> | null;
    if (!result && !error && !stopped) {
      error = "Die Antwort wurde unterbrochen (Zeitlimit oder Verbindung). Bitte „Neu generieren“ verwenden.";
    }
    const assistant: ChatMessage = {
      id: uuid(),
      role: "assistant",
      text: stopped && state.text ? `${state.text}\n\n_(Abgebrochen)_` : state.text,
      createdAt: Date.now(),
      modelId: conv.modelId,
      thinking: state.thinking || undefined,
      citations: state.citations.length ? state.citations : undefined,
      images: state.images.length ? state.images : undefined,
      native: stopped || !result ? undefined : result.native,
      usage: result?.usage,
      fromCache: result?.fromCache,
      stopReason: stopped ? "stopped" : (result?.stopReason ?? "incomplete"),
      error: error ?? (stopped && !state.text ? "Abgebrochen." : undefined),
      fallbackModel: state.fallbackModel,
    };
    await appendMessages(conv.id, [assistant]);
    setStreaming(null);
    abortRef.current = null;
  };

  const generateTitle = async (convId: string, firstText: string) => {
    try {
      const res = await api<{ title: string }>("/api/title", { method: "POST", json: { text: firstText.slice(0, 2000) } });
      if (res.title) await db.conversations.update(convId, { title: res.title });
    } catch {
      // Titel ist optional
    }
  };

  const send = async (rawText: string, attachments: Attachment[]) => {
    if (!config || !model || streaming) return;
    const now = Date.now();
    let baseMessages = active?.messages ?? [];
    const allAttachments = attachments;
    if (editIndex !== null && active) {
      baseMessages = baseMessages.slice(0, editIndex);
      setEditIndex(null);
    }
    const userMsg: ChatMessage = {
      id: uuid(),
      role: "user",
      text: rawText.trim(),
      createdAt: now,
      attachments: allAttachments.length ? allAttachments : undefined,
      contextDate: formatContextDate(new Date()),
      effort: model.efforts.length ? effort : undefined,
      webSearch: config.features.webSearch && model.capabilities.webSearch ? webSearch : undefined,
    };
    const conv: Conversation = {
      ...(active ?? {
        id: uuid(),
        title: rawText.trim().slice(0, 40) || allAttachments[0]?.name || "Neuer Chat",
        presetId,
        createdAt: now,
        updatedAt: now,
        messages: [],
      }),
      modelId: model.id,
      effort,
      webSearch,
      messages: [...baseMessages, userMsg],
    } as Conversation;
    if (active && editIndex === null) {
      // Normaler Fall: nur anhängen (ein parallel gesetzter Titel bleibt erhalten).
      await appendMessages(active.id, [userMsg], { modelId: model.id, effort, webSearch });
    } else {
      await saveConversation(conv);
    }
    setActiveId(conv.id);
    setText("");
    const isFirst = baseMessages.length === 0;
    await runAssistant(conv, false);
    if (isFirst && !active) generateTitle(conv.id, rawText || allAttachments.map((a) => a.name).join(", "));
  };

  const regenerate = async () => {
    if (!active || streaming) return;
    const msgs = [...active.messages];
    const previous = msgs[msgs.length - 1]?.role === "assistant" ? msgs.pop() : undefined;
    // Mit dem Modell der ursprünglichen Antwort, solange es noch verfügbar ist.
    const original = previous?.modelId && config?.models.some((m) => m.id === previous.modelId) ? previous.modelId : undefined;
    const conv = { ...active, modelId: original ?? (modelId || active.modelId), messages: msgs };
    await saveConversation(conv);
    await runAssistant(conv, true);
  };

  const startEdit = (index: number) => {
    const m = messages[index];
    if (!m || streaming) return;
    setEditIndex(index);
    setText(m.text);
    composerRef.current?.setAttachments(m.attachments ?? []);
    composerRef.current?.focus();
  };

  const resetToNewChat = () => {
    setActiveId(null);
    setEditIndex(null);
    setArtifactId(null);
    setPresetId(null);
    setWebSearch(true);
    setText("");
    composerRef.current?.setAttachments([]);
    setSidebarOpen(false);
    const def = config?.models.find((m) => m.id === modelId) ?? config?.models.find((m) => m.isDefault);
    if (def) setEffort(def.defaultEffort);
    setTimeout(() => composerRef.current?.focus(), 0);
  };

  const newChat = () => {
    if (streaming) return;
    resetToNewChat();
  };

  const addImageModeResult = async (prompt: string, image: GeneratedImage) => {
    const now = Date.now();
    const user: ChatMessage = { id: uuid(), role: "user", text: `🎨 Bild-Modus: ${prompt}`, createdAt: now, contextDate: formatContextDate(new Date()) };
    const assistant: ChatMessage = {
      id: uuid(),
      role: "assistant",
      text: "Hier ist dein Bild aus dem Bild-Modus.",
      createdAt: now + 1,
      images: [image],
      modelId: modelId,
      stopReason: "image-mode",
    };
    if (active) {
      await appendMessages(active.id, [user, assistant]);
      return;
    }
    const conv: Conversation = { id: uuid(), title: prompt.slice(0, 40), modelId, presetId, effort, createdAt: now, updatedAt: now, messages: [user, assistant] };
    await saveConversation(conv);
    setActiveId(conv.id);
  };

  const deleteConversation = async (id: string) => {
    if (streaming?.conversationId === id) abortRef.current?.abort();
    await db.conversations.delete(id);
    if (id === activeId) resetToNewChat();
  };

  const presetName = config?.presets.find((p) => p.id === (active?.presetId ?? presetId))?.name;
  const artifactVersions = artifactId ? artifacts.get(artifactId) : undefined;
  const modelName = (id?: string) => config?.models.find((m) => m.id === id)?.displayName;

  if (configError) {
    return (
      <div className="grid h-full place-items-center p-6 text-center">
        <div>
          <TriangleAlert className="mx-auto mb-3 h-8 w-8 text-danger" />
          <p className="font-medium">{configError}</p>
          <button type="button" onClick={() => window.location.reload()} className="mt-4 text-primary underline">
            Neu laden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden print:block print:h-auto print:overflow-visible">
      {/* Seitenleiste */}
      <div className={cn("fixed inset-y-0 left-0 z-50 w-72 transition-transform md:static md:translate-x-0 print:hidden", sidebarOpen ? "translate-x-0" : "-translate-x-full")}>
        <Sidebar
          conversations={conversations}
          activeId={activeId}
          onSelect={selectConversation}
          onNew={newChat}
          onDelete={deleteConversation}
          busy={Boolean(streaming)}
          theme={theme}
          onTheme={setTheme}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Hauptbereich */}
      <main
        className="relative flex min-w-0 flex-1 flex-col bg-bg bg-hero print:block print:bg-white"
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes("Files") && config && !config.paused && model) {
            e.preventDefault();
            setDragging(true);
          }
        }}
        onDragLeave={(e) => {
          // Erst schließen, wenn die Maus den Bereich wirklich verlässt (nicht beim Wechsel auf ein Kindelement).
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          composerRef.current?.addFiles(Array.from(e.dataTransfer.files));
        }}
      >
        <header className="flex h-14 shrink-0 items-center gap-1 px-2 sm:px-4 print:hidden">
          <button type="button" onClick={() => setSidebarOpen(true)} className="rounded-full p-2 text-muted hover:bg-surface-2 md:hidden" aria-label="Menü öffnen">
            <Menu className="h-5 w-5" />
          </button>
          {config && <ModelPicker models={config.models} value={modelId} onChange={changeModel} disabled={Boolean(streaming)} />}
          {presetName && <span className="ml-1 truncate rounded-full bg-primary-soft px-2.5 py-1 text-xs font-medium text-primary">{presetName}</span>}
          <div className="flex-1" />
          {active && active.messages.length > 0 && !streaming && (
            <>
              <button
                type="button"
                onClick={() => downloadText(conversationToMarkdown(active, modelName), `${safeName(active.title)}.md`)}
                className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-text print:hidden"
                title="Chat als Markdown exportieren"
                aria-label="Chat als Markdown exportieren"
              >
                <FileDown className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-text max-sm:hidden print:hidden"
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
              onClick={() => setArtifactId(artifactId ? null : [...artifacts.keys()].pop() ?? null)}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-text"
              title="Artefakte anzeigen"
            >
              <PanelRight className="h-4.5 w-4.5" />
              <span className="max-sm:hidden">Artefakte ({artifacts.size})</span>
            </button>
          )}
          <button
            type="button"
            onClick={newChat}
            disabled={Boolean(streaming)}
            className="rounded-full p-2 text-muted hover:bg-surface-2 disabled:opacity-40 md:hidden"
            aria-label="Neuer Chat"
          >
            <MessageSquarePlus className="h-5 w-5" />
          </button>
        </header>

        {config?.paused && (
          <div className="mx-4 mb-2 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-2 text-sm text-warning">{config.pausedMessage}</div>
        )}
        {config && config.models.length === 0 && (
          <div className="mx-4 mb-2 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-2 text-sm text-danger">
            Es sind noch keine Modelle verfügbar. Bitte im Admin-Bereich die API-Schlüssel prüfen.
          </div>
        )}

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
          {messages.length === 0 && !streamingHere ? (
            config && (
              <EmptyState
                presets={config.presets}
                presetId={presetId}
                onPreset={setPresetId}
                onExample={(t) => {
                  setText(t);
                  composerRef.current?.focus();
                }}
              />
            )
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6">
              {messages.map((m, i) =>
                m.role === "user" ? (
                  <UserMessage key={m.id} message={m} onEdit={!streaming ? () => startEdit(i) : undefined} />
                ) : (
                  <AssistantMessage
                    key={m.id}
                    message={m}
                    modelName={modelName(m.modelId)}
                    isLast={i === messages.length - 1 && !streamingHere}
                    showCacheBadge={config?.features.showCacheBadge ?? true}
                    showCost={config?.features.showCost ?? false}
                    onRegenerate={m.stopReason === "image-mode" ? undefined : regenerate}
                    onOpenArtifact={(id) => setArtifactId(id)}
                  />
                ),
              )}
              {streamingHere && (
                <AssistantMessage
                  streaming={streamingHere}
                  isLast
                  showCacheBadge={false}
                  showCost={false}
                  onOpenArtifact={(id) => setArtifactId(id)}
                />
              )}
            </div>
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl shrink-0 px-3 pb-3 sm:px-4 print:hidden">
          {editIndex !== null && (
            <div className="mb-2 flex items-center justify-between rounded-2xl bg-primary-soft px-4 py-2 text-sm text-primary">
              <span>Du bearbeitest eine frühere Nachricht. Beim Senden wird das Gespräch ab dort neu fortgesetzt.</span>
              <button
                type="button"
                className="font-medium underline"
                onClick={() => {
                  setEditIndex(null);
                  setText("");
                  composerRef.current?.setAttachments([]);
                }}
              >
                Abbrechen
              </button>
            </div>
          )}
          {config && (
            <Composer
              ref={composerRef}
              config={config}
              model={model}
              text={text}
              onTextChange={setText}
              effort={effort}
              onEffortChange={setEffort}
              webSearch={webSearch}
              onWebSearchChange={changeWebSearch}
              streaming={Boolean(streaming)}
              disabledReason={config.paused ? "Freebie macht gerade Pause." : !model ? "Gerade ist kein Modell verfügbar." : undefined}
              onSend={send}
              onStop={() => abortRef.current?.abort()}
              onImageMode={() => !streaming && setImageMode(true)}
            />
          )}
          {config && (
            <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-subtle">
              <Info className="h-3.5 w-3.5 shrink-0" />
              {config.notice.short}
              <button type="button" onClick={() => setNoticeOpen(true)} className="underline hover:text-text">
                Mehr
              </button>
            </p>
          )}
        </div>

        {dragging && (
          <div className="pointer-events-none absolute inset-3 z-30 grid place-items-center rounded-3xl border-2 border-dashed border-primary bg-primary-soft/80 backdrop-blur-sm">
            <div className="text-center text-primary">
              <Upload className="mx-auto mb-2 h-8 w-8" />
              <p className="font-display text-lg font-semibold">Dateien hier ablegen</p>
              <p className="text-sm">PDF, Word, Excel, PowerPoint, Bilder oder MP3</p>
            </div>
          </div>
        )}
        {toast && (
          <div className="absolute top-16 left-1/2 z-40 -translate-x-1/2 rounded-full bg-text px-4 py-2 text-sm text-bg shadow-lg" role="status">
            {toast}
          </div>
        )}
      </main>

      {/* Artefakt-Panel */}
      {artifactVersions && artifactVersions.length > 0 && (
        <section className="fixed inset-0 z-50 border-l border-border md:static md:z-auto md:w-[min(46vw,760px)] md:shrink-0 print:hidden">
          <ArtifactPanel key={artifactId} versions={artifactVersions} dark={isDark} onClose={() => setArtifactId(null)} />
        </section>
      )}

      {config && (
        <>
          <NoticeDialog text={config.notice.full} forceOpen={noticeOpen} onClose={() => setNoticeOpen(false)} />
          <ImageModeDialog open={imageMode} onClose={() => setImageMode(false)} defaults={config.imageDefaults} onResult={addImageModeResult} />
        </>
      )}
    </div>
  );
}
