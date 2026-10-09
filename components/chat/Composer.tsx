"use client";
import { ArrowUp, Brain, Check, Globe, ImagePlus, Loader2, Paperclip, Square, X } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ACCEPT_ATTRIBUTE, MAX_ATTACHMENTS, MAX_MESSAGE_CHARS, maxBytesFor } from "@/lib/files/limits";
import { prepareImage, processUpload, transcribeUpload, uploadCategory, uploadFile } from "@/lib/client/upload";
import { EFFORT_LEVELS, type Attachment, type Effort, type PublicConfig, type PublicModel } from "@/lib/shared/types";
import { cn } from "@/components/ui/cn";
import { AttachmentChip } from "./Message";
import { VoiceButton } from "./VoiceButton";

interface Pending {
  localId: string;
  name: string;
  kind: "image" | "document" | "audio";
  progress: number;
  label: string;
  status: "working" | "ready" | "error";
  attachment?: Attachment;
  error?: string;
  controller?: AbortController;
}

export interface ComposerHandle {
  addFiles: (files: File[]) => void;
  /** Übernimmt vorhandene Anhänge (z. B. beim Bearbeiten einer früheren Nachricht). */
  setAttachments: (attachments: Attachment[]) => void;
  focus: () => void;
}

interface Props {
  config: PublicConfig;
  model: PublicModel | undefined;
  text: string;
  onTextChange: (text: string) => void;
  effort: Effort;
  onEffortChange: (e: Effort) => void;
  webSearch: boolean;
  onWebSearchChange: (v: boolean) => void;
  streaming: boolean;
  /** Gesetzt, wenn gerade nichts geschickt werden kann (Pause, kein Modell) – dient als Platzhaltertext. */
  disabledReason?: string;
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
  onImageMode: () => void;
}

export const Composer = forwardRef<ComposerHandle, Props>(function Composer(props, ref) {
  const { config, model, text, onTextChange, effort, onEffortChange, webSearch, onWebSearchChange, streaming, disabledReason, onSend, onStop, onImageMode } = props;
  const disabled = Boolean(disabledReason);
  const [pending, setPending] = useState<Pending[]>([]);
  const pendingRef = useRef<Pending[]>([]);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const features = config.features;

  const update = (localId: string, patch: Partial<Pending>) =>
    setPending((list) => list.map((p) => (p.localId === localId ? { ...p, ...patch } : p)));

  const addFiles = useCallback(
    (files: File[]) => {
      if (disabled) return;
      let slots = MAX_ATTACHMENTS - pendingRef.current.filter((p) => p.status !== "error").length;
      for (const original of files) {
        const localId = crypto.randomUUID();
        const kind = uploadCategory(original);
        const controller = new AbortController();
        const base: Pending = { localId, name: original.name, kind: kind ?? "document", progress: 0, label: "Wird vorbereitet …", status: "working", controller };
        const fail = (error: string) => setPending((l) => [...l.filter((p) => p.localId !== localId), { ...base, status: "error", error }]);
        if (slots <= 0) {
          fail(`Höchstens ${MAX_ATTACHMENTS} Anhänge pro Nachricht.`);
          continue;
        }
        if (!kind) {
          fail("Dieses Format wird nicht unterstützt.");
          continue;
        }
        if (kind === "audio" && !features.transcription) {
          fail("Audio-Transkription ist deaktiviert.");
          continue;
        }
        if (kind !== "audio" && !features.uploads) {
          fail("Datei-Uploads sind deaktiviert.");
          continue;
        }
        if (original.size === 0) {
          fail("Die Datei ist leer.");
          continue;
        }
        if (original.size > maxBytesFor(kind)) {
          fail(`Zu groß (max. ${Math.round(maxBytesFor(kind) / 1024 / 1024)} MB).`);
          continue;
        }
        slots--;
        setPending((l) => [...l, base]);
        const signal = controller.signal;
        (async () => {
          try {
            const file = kind === "image" ? await prepareImage(original) : original;
            // Die Modelle akzeptieren Bilder bis 5 MB (nach dem Verkleinern).
            if (kind === "image" && file.size > 5 * 1024 * 1024) throw new Error("Bild zu groß (max. 5 MB).");
            const progress = (f: number, label: string) => update(localId, { progress: f * (kind === "audio" ? 0.3 : 0.8), label });
            const key = await uploadFile(file, config, progress, signal);
            let attachment: Attachment;
            if (kind === "audio") {
              attachment = await transcribeUpload(key, file.name, (f, label) => update(localId, { progress: 0.3 + f * 0.7, label }), signal);
            } else {
              update(localId, { label: kind === "image" ? "Wird geprüft …" : "Text wird ausgelesen …", progress: 0.85 });
              attachment = await processUpload(key, file.name, signal);
            }
            update(localId, { status: "ready", progress: 1, attachment, label: "" });
          } catch (err) {
            if (signal.aborted) return;
            update(localId, { status: "error", error: uploadErrorMessage(err) });
          }
        })();
      }
    },
    [config, disabled, features.transcription, features.uploads],
  );

  const setAttachments = useCallback((attachments: Attachment[]) => {
    setPending((l) => {
      for (const p of l) p.controller?.abort();
      return attachments.map((a) => ({
        localId: a.id,
        name: a.name,
        kind: a.kind === "transcript" ? "audio" : a.kind,
        progress: 1,
        label: "",
        status: "ready",
        attachment: a,
      }));
    });
  }, []);

  useImperativeHandle(ref, () => ({ addFiles, setAttachments, focus: () => textareaRef.current?.focus() }), [addFiles, setAttachments]);

  // Höhe des Eingabefelds automatisch anpassen
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
  }, [text]);

  const working = pending.some((p) => p.status === "working");
  const ready = pending.filter((p) => p.status === "ready" && p.attachment).map((p) => p.attachment!);
  const tooLong = text.length > MAX_MESSAGE_CHARS;
  const canSend = !streaming && !disabled && !working && !tooLong && (text.trim().length > 0 || ready.length > 0);
  const blindImages = Boolean(model && !model.capabilities.vision && ready.some((a) => a.kind === "image"));

  const send = () => {
    if (!canSend) return;
    onSend(text, ready);
    setPending((l) => l.filter((p) => p.status === "error"));
  };

  const efforts = model?.efforts ?? [];
  const totalTokens = ready.reduce((s, a) => s + (a.tokenEstimate ?? 0), 0);

  return (
    <div className="rounded-[28px] border border-border bg-surface shadow-soft focus-within:border-border-strong">
      {pending.length > 0 && (
        <div role="group" aria-label="Anhänge" className="flex flex-wrap gap-2 px-3 pt-3">
          {pending.map((p) => (
            <div key={p.localId} className="relative">
              <AttachmentChip
                attachment={{
                  name: p.name,
                  kind: p.kind === "audio" ? "transcript" : p.kind,
                  mime: "",
                  storageKey: p.attachment?.storageKey ?? "",
                  tokenEstimate: p.attachment?.tokenEstimate,
                }}
                extra={
                  p.status === "working" ? (
                    <span className="inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" /> {p.label} {Math.round(p.progress * 100)} %
                    </span>
                  ) : p.status === "error" ? (
                    <span className="text-danger">{p.error}</span>
                  ) : undefined
                }
              />
              <button
                type="button"
                onClick={() => {
                  p.controller?.abort();
                  setPending((l) => l.filter((x) => x.localId !== p.localId));
                }}
                className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full border border-border bg-surface text-muted shadow hover:text-text"
                aria-label={`${p.name} entfernen`}
                title="Anhang entfernen"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      {(tooLong || blindImages) && (
        <p role="alert" className="mx-4 mt-3 rounded-xl bg-warning-soft px-3 py-2 text-xs text-warning">
          {tooLong
            ? `Die Nachricht ist zu lang (höchstens ${new Intl.NumberFormat("de-DE").format(MAX_MESSAGE_CHARS)} Zeichen). Lange Texte besser als Datei anhängen.`
            : "Das gewählte Modell kann keine Bilder sehen. Wähle für Bilder ein anderes Modell."}
        </p>
      )}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            send();
          }
        }}
        onPaste={(e) => {
          const files = Array.from(e.clipboardData.files);
          if (files.length) {
            e.preventDefault();
            addFiles(files);
          }
        }}
        rows={1}
        placeholder={disabledReason ?? "Frag Freebie etwas …"}
        disabled={disabled}
        className="block max-h-[280px] w-full resize-none bg-transparent px-5 pt-4 pb-2 text-[0.97rem] leading-relaxed outline-none placeholder:text-subtle"
        aria-label="Nachricht"
      />
      <div className="flex flex-wrap items-center gap-1.5 px-3 pb-3">
        {(features.uploads || features.transcription) && (
          <>
            <input
              ref={fileRef}
              type="file"
              multiple
              aria-label="Dateien zum Anhängen"
              accept={ACCEPT_ATTRIBUTE}
              className="hidden"
              onChange={(e) => {
                addFiles(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
            <ToolButton
              onClick={() => fileRef.current?.click()}
              disabled={disabled}
              title="Datei anhängen (PDF, Word, Excel, PowerPoint, Bilder, MP3 …)"
              ariaLabel="Datei anhängen"
            >
              <Paperclip className="h-4.5 w-4.5" />
            </ToolButton>
          </>
        )}
        {features.dictation && <VoiceButton disabled={disabled} onText={(t) => onTextChange(text ? `${text} ${t}` : t)} />}
        {features.webSearch && model?.capabilities.webSearch && (
          <ToolButton
            active={webSearch}
            disabled={disabled}
            onClick={() => onWebSearchChange(!webSearch)}
            title={webSearch ? "Websuche ist an" : "Websuche ist aus"}
            label="Websuche"
            ariaLabel="Websuche"
          >
            <Globe className="h-4.5 w-4.5" />
          </ToolButton>
        )}
        {efforts.length > 0 && <EffortMenu value={effort} options={efforts} onChange={onEffortChange} disabled={disabled} />}
        {features.imageGeneration && (
          <ToolButton onClick={onImageMode} disabled={streaming || disabled} title="Bild-Modus: direkt ein Bild erzeugen" label="Bild" ariaLabel="Bild-Modus">
            <ImagePlus className="h-4.5 w-4.5" />
          </ToolButton>
        )}
        <div className="flex-1" />
        {totalTokens > 0 && <span className="mr-1 text-xs text-subtle max-sm:hidden">≈ {new Intl.NumberFormat("de-DE").format(totalTokens)} Tokens im Anhang</span>}
        {streaming ? (
          <button
            type="button"
            onClick={onStop}
            className="grid h-10 w-10 place-items-center rounded-full bg-text text-bg hover:opacity-90"
            aria-label="Antwort stoppen"
            title="Stoppen"
          >
            <Square className="h-4 w-4 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={send}
            disabled={!canSend}
            className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient text-white shadow-md transition hover:opacity-95 disabled:opacity-35"
            aria-label="Senden"
            title="Senden (Enter)"
          >
            {working ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
          </button>
        )}
      </div>
    </div>
  );
});

/** Verständliche Meldung für fehlgeschlagene Uploads (auch Fehler des Blob-SDKs). */
function uploadErrorMessage(err: unknown): string {
  const message = err instanceof Error ? err.message : "";
  if (/failed to fetch|network|load failed/i.test(message)) return "Upload fehlgeschlagen (Netzwerk).";
  if (/^Vercel Blob:/.test(message)) return "Upload fehlgeschlagen. Bitte erneut versuchen.";
  return message || "Fehler beim Hochladen";
}

function ToolButton({
  children,
  onClick,
  title,
  label,
  ariaLabel,
  active,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
  label?: string;
  ariaLabel?: string;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm transition-colors disabled:opacity-40",
        active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      {children}
      {label && <span className="max-sm:hidden">{label}</span>}
    </button>
  );
}

function EffortMenu({ value, options, onChange, disabled }: { value: Effort; options: Effort[]; onChange: (e: Effort) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    // Beim Öffnen die aktuelle Stufe fokussieren.
    ref.current?.querySelector<HTMLElement>('[role="menuitemradio"][aria-checked="true"]')?.focus();
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const onMenuKey = (e: React.KeyboardEvent) => {
    const items = Array.from(ref.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? []);
    const index = items.indexOf(document.activeElement as HTMLElement);
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const next = (index + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    }
  };
  const current = EFFORT_LEVELS.find((l) => l.value === value) ?? EFFORT_LEVELS[1];
  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm text-muted hover:bg-surface-2 hover:text-text disabled:opacity-40"
        title="Denktiefe (Thinking-Effort)"
        aria-label={`Denktiefe: ${current.label}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Brain className="h-4.5 w-4.5" />
        <span>{current.label}</span>
      </button>
      {open && (
        <div role="menu" aria-label="Denktiefe" onKeyDown={onMenuKey} className="absolute bottom-11 left-0 z-30 w-64 rounded-2xl border border-border bg-surface p-1.5 shadow-xl">
          <div className="px-3 pt-1.5 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">Denktiefe</div>
          {EFFORT_LEVELS.filter((l) => options.includes(l.value)).map((l) => (
            <button
              key={l.value}
              type="button"
              role="menuitemradio"
              aria-checked={l.value === value}
              onClick={() => {
                onChange(l.value);
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left outline-none hover:bg-surface-2 focus-visible:bg-surface-2"
            >
              <span className="flex-1">
                <span className="block text-sm font-medium">{l.label}</span>
                <span className="block text-xs text-muted">{l.hint}</span>
              </span>
              {l.value === value && <Check className="h-4 w-4 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
