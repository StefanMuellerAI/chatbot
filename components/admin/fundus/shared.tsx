"use client";
// Gemeinsame Bausteine des Admin-Reiters „Fundus“.
import { Loader2 } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { api } from "@/lib/client/api";
import { FUNDUS_UPLOAD, uploadFile } from "@/lib/client/upload";
import { LIBRARY_TAGS, type LibraryPreview, type LibraryTag } from "@/lib/library/types";
import { FUNDUS_LIMITS, OWN_TAGS, type FundusOverview } from "@/lib/shared/fundus";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/components/ui/cn";
import { MailCard, PreviewView } from "@/components/chat/library/Previews";
import { Field, inputClass, textareaClass } from "../fields";

export const number = new Intl.NumberFormat("de-DE");
export const plural = (n: number, one: string, many: string) => `${number.format(n)} ${n === 1 ? one : many}`;
export const day = (iso: string) => (iso ? iso.slice(0, 10).split("-").reverse().join(".") : "–");
export const today = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
export const errorText = (err: unknown, fallback: string) => (err instanceof Error ? err.message : fallback);

export type UploadTarget = Pick<FundusOverview, "storage" | "blobUpload">;

/** Angaben zu einem Dokument oder Verlauf, wie im Formular (Stichwörter als Text mit Kommas). */
export interface MetaValue {
  title: string;
  summary: string;
  date: string;
  tags: LibraryTag[];
  keywords: string;
}

export const EMPTY_META: MetaValue = { title: "", summary: "", date: "", tags: [], keywords: "" };

export function keywordList(text: string): string[] {
  return [...new Set(text.split(/[,;\n]/).map((k) => k.trim()).filter(Boolean))];
}

export function metaPayload(m: MetaValue) {
  return { title: m.title.trim(), summary: m.summary.trim(), date: m.date, tags: m.tags.filter((t) => OWN_TAGS.includes(t)), keywords: keywordList(m.keywords) };
}

/** Formular für Titel, Datum, Merkmale, Stichwörter und Kurzbeschreibung. */
export function MetaFields({
  value,
  onChange,
  withTitle = true,
  dateOptional = false,
}: {
  value: MetaValue;
  onChange: (m: MetaValue) => void;
  withTitle?: boolean;
  dateOptional?: boolean;
}) {
  const tagsId = useId();
  const set = <K extends keyof MetaValue>(k: K, v: MetaValue[K]) => onChange({ ...value, [k]: v });
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {withTitle && (
        <Field label="Titel" className="sm:col-span-2">
          <input className={inputClass} value={value.title} maxLength={FUNDUS_LIMITS.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
      )}
      <Field label="Datum" hint={dateOptional ? "Leer lassen: Datum der letzten E-Mail" : undefined}>
        <input type="date" className={inputClass} value={value.date} onChange={(e) => set("date", e.target.value)} />
      </Field>
      <Field label="Stichwörter" hint="Mit Komma getrennt, z. B. Kita, Haushalt">
        <input className={inputClass} value={value.keywords} onChange={(e) => set("keywords", e.target.value)} />
      </Field>
      <div className="text-sm sm:col-span-2">
        <span id={tagsId} className="mb-1 block font-medium">
          Merkmale
        </span>
        <div role="group" aria-labelledby={tagsId} className="flex flex-wrap gap-x-4 gap-y-1">
          {OWN_TAGS.map((t) => (
            <label key={t} className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-[var(--primary)]"
                checked={value.tags.includes(t)}
                onChange={(e) => set("tags", e.target.checked ? [...value.tags, t] : value.tags.filter((x) => x !== t))}
              />
              {LIBRARY_TAGS[t]}
            </label>
          ))}
        </div>
        <span className="mt-1 block text-xs text-muted">Die Länge (kurz, mittel, lang) setzt Freebie selbst.</span>
      </div>
      <Field label="Kurzbeschreibung" className="sm:col-span-2">
        <textarea className={textareaClass} rows={2} maxLength={FUNDUS_LIMITS.summary} value={value.summary} onChange={(e) => set("summary", e.target.value)} />
      </Field>
    </div>
  );
}

/** Kennzeichen in den Listen. */
export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "primary" | "warning" | "muted"; children: React.ReactNode }) {
  const styles = {
    neutral: "bg-surface-3 text-text",
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning-soft text-warning",
    muted: "border border-border text-text",
  };
  return <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", styles[tone])}>{children}</span>;
}

/** Bestätigung „keine echten Daten“ – ohne sie lässt sich nichts speichern. */
export function ConfirmReal({ checked, onChange, files }: { checked: boolean; onChange: (v: boolean) => void; files: string }) {
  return (
    <label className="flex items-start gap-2 rounded-2xl border border-warning/30 bg-warning-soft px-3 py-2 text-sm text-warning">
      <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--primary)]" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {files} enthalten keine echten personenbezogenen oder vertraulichen Daten. Eigene Inhalte bleiben gespeichert, bis du sie löschst, und gehen beim
        Anhängen an die KI-Anbieter.
      </span>
    </label>
  );
}

export interface Staged {
  /** Laufende Nummer im Dialog. */
  uid: number;
  file: File;
  progress: number;
  key: string | null;
  error: string | null;
}

/** Lädt Dateien nacheinander (höchstens drei gleichzeitig) nach `fundus/` hoch. */
export async function uploadMany(
  files: Staged[],
  target: UploadTarget,
  update: (uid: number, patch: Partial<Staged>) => void,
  signal: AbortSignal,
  onDone?: (s: Staged & { key: string }) => void,
): Promise<void> {
  const queue = [...files];
  const worker = async () => {
    while (queue.length && !signal.aborted) {
      const s = queue.shift()!;
      try {
        const key = await uploadFile(s.file, target, (f) => update(s.uid, { progress: f }), signal, FUNDUS_UPLOAD);
        update(s.uid, { key, progress: 1 });
        onDone?.({ ...s, key, progress: 1 });
      } catch (err) {
        if (signal.aborted) return;
        update(s.uid, { error: errorText(err, "Upload fehlgeschlagen") });
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
}

/** Vorschau eines Eintrags für die Kursleitung (auch ausgeblendet oder inaktiv). */
export function PreviewDialog({ item, onClose }: { item: { id: string; title: string } | null; onClose: () => void }) {
  const [state, setState] = useState<{ id: string; preview: LibraryPreview | null; error: string | null } | null>(null);
  useEffect(() => {
    if (!item) return;
    let cancelled = false;
    api<LibraryPreview>(`/api/admin/fundus/preview?id=${encodeURIComponent(item.id)}`, { admin: true })
      .then((preview) => !cancelled && setState({ id: item.id, preview, error: null }))
      .catch((err: unknown) => !cancelled && setState({ id: item.id, preview: null, error: errorText(err, "Vorschau nicht verfügbar") }));
    return () => {
      cancelled = true;
    };
  }, [item]);
  const current = state && item && state.id === item.id ? state : null;
  return (
    <Dialog open={Boolean(item)} onClose={onClose} title={item ? `Vorschau: ${item.title}` : "Vorschau"} className="w-[min(900px,calc(100vw-2rem))]">
      <div className="max-h-[70vh] overflow-y-auto rounded-2xl bg-surface-2 p-3">
        {current?.error ? (
          <p role="alert" className="text-sm text-danger">
            {current.error}
          </p>
        ) : current?.preview ? (
          <PreviewBody preview={current.preview} />
        ) : (
          <p className="inline-flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Vorschau wird geladen …
          </p>
        )}
      </div>
    </Dialog>
  );
}

export function PreviewBody({ preview }: { preview: LibraryPreview }) {
  if (preview.type === "thread") {
    return (
      <div className="space-y-3">
        {preview.mails.map((m) => (
          <MailCard key={m.id} mail={m} />
        ))}
      </div>
    );
  }
  return <PreviewView preview={preview} orgColor="#4a2ee6" />;
}
