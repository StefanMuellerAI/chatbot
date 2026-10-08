"use client";
import { Code, Download, ExternalLink, Eye, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { fileNameFor, hardenHtml, svgDocument, type ArtifactVersion } from "@/lib/client/artifacts";
import { CodeBlock, CopyButton } from "@/components/chat/CodeBlock";
import { Markdown } from "@/components/chat/Markdown";
import { cn } from "@/components/ui/cn";
import { MermaidView } from "./Mermaid";

const SANDBOX = "allow-scripts allow-downloads allow-modals allow-forms allow-popups";

export function ArtifactPanel({
  versions,
  initialVersion,
  dark,
  onClose,
}: {
  versions: ArtifactVersion[];
  initialVersion?: number;
  dark: boolean;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<number | null>(initialVersion ?? null);
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [mermaidSvg, setMermaidSvg] = useState<string | null>(null);
  const artifact = versions[(selected ?? versions.length) - 1] ?? versions[versions.length - 1];
  const onSvg = useCallback((svg: string) => setMermaidSvg(svg), []);

  const srcDoc = useMemo(() => {
    if (!artifact) return "";
    if (artifact.type === "html") return hardenHtml(artifact.content);
    if (artifact.type === "svg") return svgDocument(artifact.content);
    return "";
  }, [artifact]);

  if (!artifact) return null;
  const previewable = artifact.type !== "code";

  const download = (kind: "source" | "svg") => {
    const isSvg = kind === "svg";
    const content = isSvg && mermaidSvg ? mermaidSvg : artifact.content;
    const name = isSvg ? fileNameFor(artifact).replace(/\.mmd$/, ".svg") : fileNameFor(artifact);
    const type =
      artifact.type === "html" ? "text/html" : artifact.type === "svg" || isSvg ? "image/svg+xml" : "text/plain";
    const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Neues Fenster mit abgeschottetem iframe – der Inhalt läuft nie mit unserer Origin.
  const openInTab = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const doc = srcDoc || hardenHtml(`<pre style="white-space:pre-wrap;font:14px monospace;padding:16px">${escapeHtml(artifact.content)}</pre>`);
    w.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(artifact.title)}</title><style>html,body{margin:0;height:100%}iframe{border:0;width:100%;height:100%}</style></head><body><iframe sandbox="${SANDBOX}" srcdoc="${escapeAttr(doc)}"></iframe></body></html>`,
    );
    w.document.close();
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-surface">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="truncate font-display font-semibold">{artifact.title}</div>
          <div className="text-xs text-muted">
            {labelFor(artifact.type, artifact.language)}
            {!artifact.complete && " · wird erstellt …"}
          </div>
        </div>
        {versions.length > 1 && (
          <select
            value={artifact.version}
            onChange={(e) => setSelected(Number(e.target.value))}
            className="h-8 rounded-full border border-border bg-surface px-2 text-xs"
            aria-label="Version wählen"
          >
            {versions.map((v) => (
              <option key={v.version} value={v.version}>
                Version {v.version}
              </option>
            ))}
          </select>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1.5 text-muted hover:bg-surface-2 hover:text-text"
          aria-label="Panel schließen"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="flex items-center gap-1 border-b border-border px-3 py-2">
        {previewable && (
          <TabButton active={tab === "preview"} onClick={() => setTab("preview")}>
            <Eye className="h-4 w-4" /> Vorschau
          </TabButton>
        )}
        <TabButton active={tab === "code" || !previewable} onClick={() => setTab("code")}>
          <Code className="h-4 w-4" /> Code
        </TabButton>
        <div className="flex-1" />
        <CopyButton text={artifact.content} />
        <button
          type="button"
          onClick={() => download("source")}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-3 hover:text-text"
          title="Herunterladen"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="max-sm:hidden">{fileNameFor(artifact).split(".").pop()?.toUpperCase()}</span>
        </button>
        {artifact.type === "mermaid" && mermaidSvg && (
          <button
            type="button"
            onClick={() => download("svg")}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-3 hover:text-text"
          >
            <Download className="h-3.5 w-3.5" /> SVG
          </button>
        )}
        {(artifact.type === "html" || artifact.type === "svg") && (
          <button
            type="button"
            onClick={openInTab}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-3 hover:text-text"
            title="In neuem Tab öffnen"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {tab === "code" || !previewable ? (
          <div className="p-3">
            <CodeBlock code={artifact.content} lang={codeLang(artifact.type, artifact.language)} />
          </div>
        ) : artifact.type === "html" || artifact.type === "svg" ? (
          artifact.complete ? (
            <iframe
              key={`${artifact.id}-${artifact.version}`}
              title={artifact.title}
              sandbox={SANDBOX}
              srcDoc={srcDoc}
              className="h-full min-h-[60vh] w-full border-0 bg-white"
            />
          ) : (
            <div className="grid h-full place-items-center p-8 text-center text-sm text-muted">
              <div>
                <div className="dot-pulse mb-3 inline-flex gap-1 text-primary">
                  <span />
                  <span />
                  <span />
                </div>
                <p>Die Vorschau erscheint, sobald das Artefakt fertig ist.</p>
                <p className="mt-1 text-xs">{artifact.content.split("\n").length} Zeilen bisher</p>
              </div>
            </div>
          )
        ) : artifact.type === "mermaid" ? (
          artifact.complete ? (
            <MermaidView code={artifact.content} dark={dark} onSvg={onSvg} />
          ) : (
            <div className="p-6 text-sm text-muted">Diagramm wird erstellt …</div>
          )
        ) : (
          <div className="p-5">
            <Markdown text={artifact.content} />
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm",
        active ? "bg-primary-soft font-medium text-primary" : "text-muted hover:bg-surface-2",
      )}
    >
      {children}
    </button>
  );
}

export function labelFor(type: string, language?: string): string {
  switch (type) {
    case "html":
      return "Webseite (HTML)";
    case "svg":
      return "Grafik (SVG)";
    case "mermaid":
      return "Diagramm (Mermaid)";
    case "markdown":
      return "Dokument (Markdown)";
    default:
      return `Code${language ? ` (${language})` : ""}`;
  }
}

function codeLang(type: string, language?: string): string | undefined {
  if (type === "html") return "html";
  if (type === "svg") return "xml";
  if (type === "markdown") return "markdown";
  if (type === "mermaid") return "text";
  return language;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
