"use client";
import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PublicModel } from "@/lib/shared/types";
import { cn } from "@/components/ui/cn";

const PROVIDER_LABEL: Record<string, string> = { anthropic: "Anthropic", openai: "OpenAI", mock: "Test" };

export function ProviderDot({ provider, className }: { provider: string; className?: string }) {
  return (
    <span
      className={cn("inline-block h-2.5 w-2.5 shrink-0 rounded-full", className)}
      style={{ background: provider === "anthropic" ? "#d97757" : provider === "openai" ? "#10a37f" : "#9b7bff" }}
      aria-hidden
    />
  );
}

export function ModelPicker({ models, value, onChange }: { models: PublicModel[]; value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = models.find((m) => m.id === value);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);
  const groups = ["anthropic", "openai", "mock"]
    .map((p) => [p, models.filter((m) => m.provider === p)] as const)
    .filter(([, list]) => list.length);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-full px-3 font-display text-[0.97rem] font-semibold hover:bg-surface-2"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {current && <ProviderDot provider={current.provider} />}
        {current?.displayName ?? "Modell wählen"}
        <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div role="listbox" className="absolute top-12 left-0 z-40 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-border bg-surface p-1.5 shadow-2xl">
          {groups.map(([provider, list]) => (
            <div key={provider} className="py-1">
              <div className="px-3 pt-1 pb-1 text-xs font-semibold tracking-wide text-muted uppercase">{PROVIDER_LABEL[provider]}</div>
              {list.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  role="option"
                  aria-selected={m.id === value}
                  onClick={() => {
                    onChange(m.id);
                    setOpen(false);
                  }}
                  className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left hover:bg-surface-2"
                >
                  <ProviderDot provider={m.provider} className="mt-1.5" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {m.displayName}
                      {m.isDefault && <span className="ml-2 rounded-full bg-primary-soft px-1.5 py-0.5 text-[0.65rem] font-semibold text-primary">Standard</span>}
                    </span>
                    {m.description && <span className="block text-xs text-muted">{m.description}</span>}
                  </span>
                  {m.id === value && <Check className="mt-1 h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          ))}
          {models.length === 0 && <p className="p-4 text-sm text-muted">Es sind keine Modelle verfügbar. Bitte im Admin-Bereich Modelle und API-Schlüssel einrichten.</p>}
        </div>
      )}
    </div>
  );
}
