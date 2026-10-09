"use client";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

const LANG_ALIASES: Record<string, string> = { js: "javascript", ts: "typescript", py: "python", sh: "bash", shell: "bash", yml: "yaml", md: "markdown", "c#": "csharp" };

export function useHighlighted(code: string, lang: string | undefined, delay = 120): string | null {
  const [html, setHtml] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const shiki = await import("shiki");
        const requested = (lang ?? "").toLowerCase();
        const name = LANG_ALIASES[requested] ?? requested;
        const language = name && name in shiki.bundledLanguages ? name : "text";
        const out = await shiki.codeToHtml(code, {
          lang: language,
          themes: { light: "github-light", dark: "github-dark" },
          defaultColor: "light",
        });
        if (!cancelled) setHtml(out);
      } catch {
        if (!cancelled) setHtml(null);
      }
    }, delay);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, lang, delay]);
  return html;
}

/** Kopiert Text; ohne Clipboard-API (z. B. ohne HTTPS) über den klassischen Weg. */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    area.remove();
    return ok;
  }
}

export function CopyButton({
  text,
  className,
  label = "Kopieren",
  ariaLabel,
}: {
  text: string;
  className?: string;
  label?: string;
  /** Eindeutiger Name für Screenreader, z. B. „Antwort kopieren“. */
  ariaLabel?: string;
}) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  return (
    <button
      type="button"
      onClick={async () => {
        setState((await copyText(text)) ? "copied" : "failed");
        setTimeout(() => setState("idle"), 1500);
      }}
      className={className ?? "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-3 hover:text-text"}
      title={ariaLabel ?? label}
      aria-label={ariaLabel ?? label}
    >
      {state === "copied" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      <span className="max-sm:hidden" aria-live="polite">
        {state === "copied" ? "Kopiert" : state === "failed" ? "Nicht kopiert" : label}
      </span>
    </button>
  );
}

export function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  const html = useHighlighted(code, lang);
  return (
    <div className="not-prose my-3 overflow-hidden rounded-2xl border border-border bg-code">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <span className="font-mono text-xs text-muted">{lang || "text"}</span>
        <CopyButton text={code} ariaLabel="Code kopieren" />
      </div>
      {html ? (
        <div className="overflow-x-auto p-4 text-[0.85rem] leading-relaxed [&_pre]:!bg-transparent" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <pre className="overflow-x-auto p-4 font-mono text-[0.85rem] leading-relaxed">
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
