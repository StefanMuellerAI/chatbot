import {
  Brain,
  ChevronDown,
  Code,
  Database,
  FileAudio,
  FileSpreadsheet,
  FileText,
  Globe,
  ImageIcon,
  LayoutTemplate,
  Mail,
  Pencil,
  Presentation,
  RotateCcw,
  TriangleAlert,
  Workflow,
  Zap,
} from "lucide-react";
import { memo, useId, useMemo, useState } from "react";
import { artifactKey, parseSegments, type Artifact } from "@/lib/client/artifacts";
import type { Attachment, ChatMessage, Citation, GeneratedImage } from "@/lib/shared/types";
import { labelFor } from "@/components/artifacts/ArtifactPanel";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { CodeBlock, CopyButton } from "./CodeBlock";
import { Markdown } from "./Markdown";

export interface StreamingState {
  text: string;
  thinking: string;
  citations: Citation[];
  images: GeneratedImage[];
  status: string | null;
  fromCache: boolean;
  fallbackModel?: string;
}

export function UserMessage({ message, onEdit }: { message: ChatMessage; onEdit?: () => void }) {
  return (
    <article aria-label="Deine Nachricht" className="group flex justify-end">
      <div className="flex max-w-[85%] flex-col items-end gap-2">
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {message.attachments.map((a) => (
              <AttachmentChip key={a.id} attachment={a} />
            ))}
          </div>
        )}
        {message.text && (
          <div className="whitespace-pre-wrap break-words rounded-3xl rounded-br-lg bg-primary-soft px-4 py-2.5 text-[0.95rem] leading-relaxed">
            {message.text}
          </div>
        )}
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 max-sm:opacity-100">
          {message.text && <CopyButton text={message.text} ariaLabel="Nachricht kopieren" />}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label="Bearbeiten"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-3 hover:text-text"
              title="Bearbeiten und neu senden"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="max-sm:hidden">Bearbeiten</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function AttachmentChip({
  attachment,
  extra,
}: {
  attachment: Pick<Attachment, "name" | "kind" | "mime" | "storageKey" | "tokenEstimate" | "libraryId">;
  extra?: React.ReactNode;
}) {
  const isImage = attachment.kind === "image";
  const Icon =
    attachment.kind === "transcript"
      ? FileAudio
      : attachment.mime === "message/rfc822" || /\.eml$/i.test(attachment.name)
        ? Mail
        : /presentation/.test(attachment.mime) || /\.pptx$/i.test(attachment.name)
          ? Presentation
          : /sheet|excel|csv|spreadsheet/.test(attachment.mime) || /\.(xlsx?|csv|ods)$/i.test(attachment.name)
            ? FileSpreadsheet
            : FileText;
  const detail = isImage
    ? "Bild"
    : attachment.tokenEstimate
      ? `ca. ${formatNumber(attachment.tokenEstimate)} Tokens`
      : attachment.kind === "transcript"
        ? "Transkript"
        : "Dokument";
  return (
    <div role="group" aria-label={attachment.name} className="flex max-w-64 items-center gap-2 rounded-2xl border border-border bg-surface px-2.5 py-2 text-sm shadow-sm">
      {isImage && attachment.storageKey ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`/api/files/${attachment.storageKey}`} alt="" className="h-9 w-9 rounded-lg object-cover" />
      ) : (
        <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-4.5 w-4.5" />
          {attachment.libraryId && (
            <span className="absolute -right-1 -bottom-1 grid h-4 w-4 place-items-center rounded-full border border-border bg-surface text-muted">
              <Database className="h-2.5 w-2.5" aria-hidden />
            </span>
          )}
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate font-medium">{attachment.name}</span>
        <span className="block text-xs text-muted">{extra ?? (attachment.libraryId ? `Fundus · ${detail}` : detail)}</span>
      </span>
    </div>
  );
}

export const AssistantMessage = memo(function AssistantMessage({
  message,
  streaming,
  modelName,
  isLast,
  showCacheBadge,
  showCost,
  artifactsEnabled = true,
  onRegenerate,
  onOpenArtifact,
}: {
  message?: ChatMessage;
  streaming?: StreamingState;
  modelName?: string;
  isLast: boolean;
  showCacheBadge: boolean;
  showCost: boolean;
  /** Ohne Artefakte (im Admin abgeschaltet) erscheint der Inhalt als normaler Codeblock. */
  artifactsEnabled?: boolean;
  onRegenerate?: () => void;
  onOpenArtifact: (id: string, messageId: string) => void;
}) {
  const text = streaming?.text ?? message?.text ?? "";
  const thinking = streaming?.thinking ?? message?.thinking ?? "";
  const citations = streaming?.citations ?? message?.citations ?? [];
  const images = streaming?.images ?? message?.images ?? [];
  const fromCache = streaming?.fromCache ?? message?.fromCache ?? false;
  const fallbackModel = streaming?.fallbackModel ?? message?.fallbackModel;
  const segments = useMemo(() => parseSegments(text), [text]);
  const isStreaming = Boolean(streaming);
  const messageId = message?.id ?? "streaming";

  return (
    <article aria-label="Antwort von Freebie" aria-busy={isStreaming} className="group flex gap-3">
      <LogoMark size={30} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        {thinking && <ThinkingBlock text={thinking} active={isStreaming && !text} />}
        {streaming?.status && (
          <div role="status" className="mb-2 inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-sm text-muted">
            <span className="dot-pulse inline-flex gap-1 text-primary">
              <span />
              <span />
              <span />
            </span>
            {streaming.status}
          </div>
        )}
        {isStreaming && !text && !thinking && !streaming?.status && (
          <div role="status" aria-label="Freebie schreibt …" className="dot-pulse inline-flex gap-1 py-2 text-primary">
            <span />
            <span />
            <span />
          </div>
        )}
        <div className={cn(isStreaming && "streaming-text")}>
          {segments.map((seg, i) =>
            seg.kind === "text" ? (
              <Markdown key={i} text={seg.text} />
            ) : artifactsEnabled ? (
              <ArtifactCard key={i} artifact={seg.artifact} onOpen={() => onOpenArtifact(artifactKey(seg.artifact, messageId), messageId)} />
            ) : (
              <CodeBlock key={i} code={seg.artifact.content} lang={seg.artifact.type === "code" ? seg.artifact.language : seg.artifact.type === "svg" ? "xml" : seg.artifact.type} />
            ),
          )}
        </div>
        {images.length > 0 && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {images.map((img) => (
              <figure key={img.id} className="overflow-hidden rounded-2xl border border-border bg-surface-2">
                <a href={img.url} target="_blank" rel="noopener noreferrer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.prompt} className="aspect-square w-full object-cover" />
                </a>
                <figcaption className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-muted">
                  <span className="line-clamp-2">{img.prompt}</span>
                  <a href={img.url} download className="shrink-0 rounded-md px-2 py-1 hover:bg-surface-3 hover:text-text">
                    Herunterladen
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        )}
        {citations.length > 0 && <Sources citations={citations} />}
        {message?.error && (
          <div role="alert" className="mt-2 flex items-start gap-2 rounded-2xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{message.error}</span>
          </div>
        )}
        {!isStreaming && message && (
          <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted opacity-70 transition-opacity group-hover:opacity-100">
            {text && <CopyButton text={text} ariaLabel="Antwort kopieren" />}
            {isLast && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                aria-label="Neu generieren"
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-surface-3 hover:text-text"
                title="Neu generieren (ohne Cache)"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="max-sm:hidden">Neu generieren</span>
              </button>
            )}
            {modelName && <span className="px-2">{modelName}</span>}
            {fromCache && showCacheBadge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-warning" title="Diese Antwort kam aus dem gemeinsamen Antwort-Cache und hat nichts gekostet.">
                <Zap className="h-3 w-3" /> aus dem Cache
              </span>
            )}
            {fallbackModel && (
              <span className="rounded-full bg-surface-2 px-2 py-0.5" title="Das gewählte Modell hat abgelehnt, ein Ersatzmodell hat geantwortet.">
                Ersatzmodell: {fallbackModel}
              </span>
            )}
            {showCost && message.usage && !fromCache && (
              <span className="px-2" title="Geschätzte Kosten dieser Antwort">
                {formatUsd(message.usage.costUsd ?? 0)} · {formatNumber(message.usage.cacheReadTokens)} Tokens aus Cache
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
});

function ThinkingBlock({ text, active }: { text: string; active: boolean }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-3 py-1 text-sm text-muted hover:text-text"
      >
        <Brain className={cn("h-4 w-4", active && "animate-pulse text-primary")} />
        {active ? "Freebie denkt nach …" : "Gedankengang"}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div id={id} className="mt-2 max-h-80 overflow-y-auto whitespace-pre-wrap border-l-2 border-border-strong pl-4 text-sm leading-relaxed text-muted">
          {text}
        </div>
      )}
    </div>
  );
}

export const MAX_SOURCES = 12;

function Sources({ citations }: { citations: Citation[] }) {
  // Doppelte Quellen nur einmal zeigen.
  const unique = citations.filter((c, i) => citations.findIndex((x) => x.url === c.url) === i).slice(0, MAX_SOURCES);
  return (
    <nav aria-label="Quellen" className="mt-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted uppercase">
        <Globe className="h-3.5 w-3.5" /> Quellen
      </div>
      <div className="flex flex-wrap gap-2">
        {unique.map((c, i) => (
          <a
            key={c.url}
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex max-w-xs items-center gap-2 rounded-xl border border-border bg-surface px-3 py-1.5 text-xs hover:border-primary hover:text-primary"
            title={c.title}
          >
            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-surface-2 font-semibold">{i + 1}</span>
            <span className="min-w-0">
              <span className="block truncate font-medium">{c.title}</span>
              <span className="block truncate text-muted">{hostOf(c.url)}</span>
            </span>
          </a>
        ))}
      </div>
    </nav>
  );
}

function ArtifactCard({ artifact, onOpen }: { artifact: Artifact; onOpen: () => void }) {
  const Icon = artifact.type === "html" ? LayoutTemplate : artifact.type === "mermaid" ? Workflow : artifact.type === "svg" ? ImageIcon : artifact.type === "markdown" ? FileText : Code;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="my-3 flex w-full max-w-md items-center gap-3 rounded-2xl border border-border bg-surface p-3 text-left shadow-sm transition hover:border-primary hover:shadow-md"
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-gradient text-white">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{artifact.title}</span>
        <span className="block text-xs text-muted">
          {labelFor(artifact.type, artifact.language)}
          {artifact.complete ? " · Klicken zum Öffnen" : ` · wird erstellt (${artifact.content.split("\n").length} Zeilen) …`}
        </span>
      </span>
    </button>
  );
}

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("de-DE").format(Math.round(n));
}

export function formatUsd(n: number): string {
  return new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD", maximumFractionDigits: n < 0.1 ? 4 : 2 }).format(n);
}
