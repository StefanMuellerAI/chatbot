"use client";
import { useEffect, useId, useState } from "react";

export function MermaidView({ code, dark, onSvg }: { code: string; dark: boolean; onSvg?: (svg: string) => void }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: dark ? "dark" : "default",
          fontFamily: "var(--font-sans)",
        });
        const result = await mermaid.render(`m${id}${Date.now()}`, code);
        if (!cancelled) {
          setSvg(result.svg);
          setError(null);
          onSvg?.(result.svg);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Diagramm konnte nicht gezeichnet werden.");
      }
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [code, dark, id, onSvg]);
  if (error) {
    return (
      <div className="rounded-xl border border-danger/30 bg-danger-soft p-4 text-sm text-danger">
        Das Diagramm enthält einen Fehler: {error.slice(0, 300)}
      </div>
    );
  }
  if (!svg) return <div className="p-6 text-sm text-muted">Zeichne Diagramm …</div>;
  return <div className="flex justify-center overflow-auto p-4 [&_svg]:h-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}
