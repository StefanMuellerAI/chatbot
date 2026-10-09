"use client";
import { Lightbulb, LayoutTemplate, Mail, Presentation, Sparkles, Table } from "lucide-react";
import type { PublicPreset } from "@/lib/shared/types";
import { cn } from "@/components/ui/cn";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  mail: Mail,
  table: Table,
  presentation: Presentation,
  layout: LayoutTemplate,
  lightbulb: Lightbulb,
  sparkles: Sparkles,
};

const EXAMPLES = [
  "Erkläre mir, wie ein Sprachmodell funktioniert – so, dass es meine Oma versteht.",
  "Baue mir eine kleine Landingpage für ein Café in Leipzig.",
  "Erstelle ein Diagramm, wie ein Bewerbungsprozess abläuft.",
  "Was sind die wichtigsten KI-Nachrichten dieser Woche?",
];

export function EmptyState({
  presets,
  presetId,
  onPreset,
  onExample,
}: {
  presets: PublicPreset[];
  presetId: string | null;
  onPreset: (id: string | null) => void;
  onExample: (text: string) => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 pt-[8vh] pb-6 text-center">
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
        Hallo, ich bin <span className="text-gradient">Freebie</span>.
      </h1>
      <p className="mt-3 max-w-xl text-muted">
        Dein KI-Assistent für die Schulung: Fragen stellen, Dateien auswerten, im Web recherchieren, Bilder erzeugen und kleine Webseiten bauen.
      </p>
      {presets.length > 0 && (
        <div className="mt-8 w-full">
          <div className="mb-2 text-xs font-semibold tracking-[0.12em] text-muted uppercase">Mit einer Vorlage starten</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {presets.map((p) => {
              const Icon = ICONS[p.icon] ?? Sparkles;
              const active = p.id === presetId;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPreset(active ? null : p.id)}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-3 text-left transition",
                    active ? "border-primary bg-primary-soft" : "border-border bg-surface hover:border-border-strong hover:shadow-sm",
                  )}
                >
                  <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", active ? "bg-primary text-white" : "bg-surface-2 text-primary")}>
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{p.name}</span>
                    <span className="line-clamp-2 block text-xs text-muted">{p.description}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-6 flex w-full flex-wrap justify-center gap-2">
        {EXAMPLES.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onExample(e)}
            className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm text-muted transition hover:border-primary hover:text-primary"
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}
