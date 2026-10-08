"use client";
import { ArrowUp, Brain, Check, Globe, ImagePlus, Loader2, Paperclip, Square, X } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { ACCEPT_ATTRIBUTE, maxBytesFor } from "@/lib/files/limits";
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
}

export interface ComposerHandle {
  addFiles: (files: File[]) => void;
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
  disabled?: boolean;
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
  onImageMode: () => void;
}

export const Composer = forwardRef<ComposerHandle, Props>(function Composer(props, ref) {
  const { config, model, text, onTextChange, effort, onEffortChange, webSearch, onWebSearchChange, streaming, disabled, onSend, onStop, onImageMode } = props;
  const [pending, setPending] = useState<Pending[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const features = config.features;

  const update = (localId: string, patch: Partial<Pending>) =>
    setPending((list) => list.map((p) => (p.localId === localId ? { ...p, ...patch } : p)));

  const addFiles = useCallback(
    (files: File[]) => {
      for (const original of files) {
        const localId = crypto.randomUUID();
        const kind = uploadCategory(original);
        const base: Pending = { localId, name: original.name, kind: kind ?? "document", progress: 0, label: "Wird vorbereitet …", status: "working" };
        const fail = (error: string) => setPending((l) => [...l.filter((p) => p.localId !== localId), { ...base, status: "error", error }]);
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
        if (original.size > maxBytesFor(kind)) {
          fail(`Zu groß (max. ${Math.round(maxBytesFor(kind) / 1024 / 1024)} MB).`);
          continue;
        }
        setPending((l) => [...l, base]);
        (async () => {
          try {
            const file = kind === "image" ? await prepareImage(original) : original;
            // Die Modelle akzeptieren Bilder bis 5 MB (nach dem Verkleinern).
            if (kind === "image" && file.size > 5 * 1024 * 1024) throw new Error("Bild zu groß (max. 5 MB).");
            const key = await uploadFile(file, config.storage, (f, label) => update(localId, { progress: f * (kind === "audio" ? 0.3 : 0.8), label }));
            let attachment: Attachment;
            if (kind === "audio") {
              attachment = await transcribeUpload(key, file.name, (f, label) => update(localId, { progress: 0.3 + f * 0.7, label }));
            } else {
              update(localId, { label: kind === "image" ? "Wird geprüft …" : "Text wird ausgelesen …", progress: 0.85 });
              attachment = await processUpload(key, file.name);
            }
            update(localId, { status: "ready", progress: 1, attachment, label: "" });
          } catch (err) {
            update(localId, { status: "error", error: err instanceof Error ? err.message : "Fehler beim Hochladen" });
          }
        })();
      }
    },
    [config.storage, features.transcription, features.uploads],
  );

  useImperativeHandle(ref, () => ({ addFiles, focus: () => textareaRef.current?.focus() }), [addFiles]);

  // Höhe des Eingabefelds automatisch anpassen
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 280)}px`;
  }, [text]);

  const working = pending.some((p) => p.status === "working");
  const ready = pending.filter((p) => p.status === "ready" && p.attachment).map((p) => p.attachment!);
  const canSend = !streaming && !disabled && !working && (text.trim().length > 0 || ready.length > 0);

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
        <div className="flex flex-wrap gap-2 px-3 pt-3">
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
                onClick={() => setPending((l) => l.filter((x) => x.localId !== p.localId))}
                className="absolute -top-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full border border-border bg-surface text-muted shadow hover:text-text"
                aria-label="Anhang entfernen"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
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
        placeholder={disabled ? "Freebie macht gerade Pause." : "Frag Freebie etwas …"}
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
              accept={ACCEPT_ATTRIBUTE}
              className="hidden"
              onChange={(e) => {
                addFiles(Array.from(e.target.files ?? []));
                e.target.value = "";
              }}
            />
            <ToolButton onClick={() => fileRef.current?.click()} title="Datei anhängen (PDF, Word, Excel, PowerPoint, Bilder, MP3 …)">
              <Paperclip className="h-4.5 w-4.5" />
            </ToolButton>
          </>
        )}
        {features.dictation && <VoiceButton storage={config.storage} onText={(t) => onTextChange(text ? `${text} ${t}` : t)} />}
        {features.webSearch && model?.capabilities.webSearch && (
          <ToolButton active={webSearch} onClick={() => onWebSearchChange(!webSearch)} title={webSearch ? "Websuche ist an" : "Websuche ist aus"} label="Websuche">
            <Globe className="h-4.5 w-4.5" />
          </ToolButton>
        )}
        {efforts.length > 0 && <EffortMenu value={effort} options={efforts} onChange={onEffortChange} />}
        {features.imageGeneration && (
          <ToolButton onClick={onImageMode} title="Bild-Modus: direkt ein Bild erzeugen" label="Bild">
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

function ToolButton({ children, onClick, title, label, active }: { children: React.ReactNode; onClick: () => void; title: string; label?: string; active?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm transition-colors",
        active ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      {children}
      {label && <span className="max-sm:hidden">{label}</span>}
    </button>
  );
}

function EffortMenu({ value, options, onChange }: { value: Effort; options: Effort[]; onChange: (e: Effort) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const current = EFFORT_LEVELS.find((l) => l.value === value) ?? EFFORT_LEVELS[1];
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-full px-2.5 text-sm text-muted hover:bg-surface-2 hover:text-text"
        title="Denktiefe (Thinking-Effort)"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Brain className="h-4.5 w-4.5" />
        <span>{current.label}</span>
      </button>
      {open && (
        <div role="menu" className="absolute bottom-11 left-0 z-30 w-64 rounded-2xl border border-border bg-surface p-1.5 shadow-xl">
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
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-2"
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
