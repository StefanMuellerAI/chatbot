"use client";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client/api";
import type { GeneratedImage } from "@/lib/shared/types";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

const SIZES = [
  ["1024x1024", "Quadratisch"],
  ["1536x1024", "Querformat"],
  ["1024x1536", "Hochformat"],
] as const;

const QUALITIES = [
  ["low", "Entwurf (schnell, günstig)"],
  ["medium", "Standard"],
  ["high", "Hoch (langsamer, teurer)"],
] as const;

export function ImageModeDialog({
  open,
  onClose,
  defaults,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  defaults: { size: string; quality: string };
  onResult: (prompt: string, image: GeneratedImage) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState(defaults.size);
  const [quality, setQuality] = useState(defaults.quality);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    if (!prompt.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await api<{ image: GeneratedImage }>("/api/images", { method: "POST", json: { prompt, size, quality } });
      onResult(prompt, res.image);
      setPrompt("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Das Bild konnte nicht erzeugt werden.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => !busy && onClose()} title="Bild-Modus">
      <p className="mb-4 text-sm text-muted">Beschreibe dein Bild möglichst genau: Motiv, Stil, Stimmung, Farben, Perspektive.</p>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        autoFocus
        placeholder="z. B. Ein freundlicher Roboter erklärt einer Gruppe in einem hellen Seminarraum ein Flipchart, Illustration im Flat-Design, warme Farben"
        className="w-full rounded-2xl border border-border bg-bg-soft p-3 text-sm outline-none focus:border-primary"
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block font-medium">Format</span>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="h-10 w-full rounded-xl border border-border bg-surface px-3">
            {SIZES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium">Qualität</span>
          <select value={quality} onChange={(e) => setQuality(e.target.value)} className="h-10 w-full rounded-xl border border-border bg-surface px-3">
            {QUALITIES.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <p className="mt-3 rounded-xl bg-danger-soft p-3 text-sm text-danger">{error}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={busy}>
          Abbrechen
        </Button>
        <Button variant="brand" onClick={generate} disabled={busy || !prompt.trim()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {busy ? "Erzeuge Bild …" : "Bild erzeugen"}
        </Button>
      </div>
    </Dialog>
  );
}
