"use client";
// Maske „Prompt ausfüllen“: ein Pflichtfeld je Platzhalter, Live-Vorschau, Einfügen bzw. Ersetzen/Anfügen.
// Dieselbe Maske dient im Admin als Probe („So sieht es im Chat aus“).
import { Info } from "lucide-react";
import { Fragment, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { cleanValue, maxLengthFor, parsePrompt, type Placeholder } from "@/lib/shared/placeholders";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/components/ui/cn";

export type InsertMode = "replace" | "append";

export interface FillablePrompt {
  id: string;
  title: string;
  text: string;
  placeholders: Placeholder[];
  category?: string;
}

const number = new Intl.NumberFormat("de-DE");

/** Werte je Prompt bis zum Neuladen der Seite – nur im Speicher, nie in localStorage (können Inhalte aus der Behörde enthalten). */
const remembered = new Map<string, Record<string, string>>();

export function rememberedValues(id: string): Record<string, string> | undefined {
  return remembered.get(id);
}

/** Setzt die Werte ein; offene Felder bleiben leer (für Vorschau und Längenprüfung). */
export function fillPartial(text: string, placeholders: Placeholder[], values: Record<string, string>): string {
  const types = new Map(placeholders.map((p) => [p.key, p.type]));
  return parsePrompt(text)
    .segments.map((s) => (s.kind === "text" ? s.text : cleanValue(values[s.key] ?? "", types.get(s.key) ?? "text")))
    .join("");
}

/** Text eines Prompts mit hervorgehobenen Platzhaltern: offene mit ihrer Beschriftung, ausgefüllte mit dem Wert. */
export function PromptText({ text, placeholders, values, className }: { text: string; placeholders: Placeholder[]; values?: Record<string, string>; className?: string }) {
  const segments = useMemo(() => parsePrompt(text).segments, [text]);
  const byKey = new Map(placeholders.map((p) => [p.key, p]));
  return (
    <p className={cn("text-sm leading-relaxed break-words whitespace-pre-wrap", className)}>
      {segments.map((s, i) => {
        if (s.kind === "text") return <Fragment key={i}>{s.text}</Fragment>;
        const p = byKey.get(s.key);
        const value = values ? cleanValue(values[s.key] ?? "", p?.type ?? "text") : "";
        return value ? (
          <span key={i} data-role="wert" className="rounded bg-success-soft px-0.5 text-text">
            {value}
          </span>
        ) : (
          <mark key={i} data-role="platzhalter" className="rounded bg-primary-soft px-1 font-medium text-text ring-1 ring-primary/50 ring-inset">
            {p?.label ?? s.name}
          </mark>
        );
      })}
    </p>
  );
}

function initialValues(prompt: FillablePrompt): Record<string, string> {
  const kept = remembered.get(prompt.id) ?? {};
  return Object.fromEntries(prompt.placeholders.map((p) => [p.key, kept[p.key] ?? p.default]));
}

function fieldError(p: Placeholder, value: string): string | null {
  const clean = cleanValue(value, p.type);
  if (!clean) return "Bitte ausfüllen.";
  const max = maxLengthFor(p.type);
  if (clean.length > max) return `Höchstens ${number.format(max)} Zeichen (jetzt ${number.format(clean.length)}).`;
  return null;
}

export function PromptFillDialog({
  prompt,
  draft,
  maxChars,
  compose,
  onClose,
  onInsert,
  note,
}: {
  /** null = geschlossen. */
  prompt: FillablePrompt | null;
  /** Steht schon ein eigener Entwurf im Eingabefeld, fragt die Maske „Ersetzen“ oder „Anfügen“. */
  draft: boolean;
  /** Grenze des Eingabefelds (privat 400.000, Gruppenchat 50.000 Zeichen). */
  maxChars: number;
  /** Baut den Text, der im Eingabefeld landet (z. B. mit „@Freebie “ oder an den Entwurf angefügt). */
  compose: (filled: string, mode: InsertMode) => string;
  onClose: () => void;
  onInsert: (text: string, mode: InsertMode) => void;
  /** Zusätzlicher Hinweis über den Knöpfen (Probe im Admin). */
  note?: string;
}) {
  return (
    <Dialog
      open={Boolean(prompt)}
      onClose={onClose}
      title="Prompt ausfüllen"
      className="w-[min(720px,calc(100vw-2rem))] max-sm:h-dvh max-sm:max-h-none max-sm:w-screen max-sm:max-w-none max-sm:rounded-none"
      bodyClassName="max-sm:p-4"
    >
      {prompt && <PromptForm key={prompt.id} prompt={prompt} draft={draft} maxChars={maxChars} compose={compose} onClose={onClose} onInsert={onInsert} note={note} />}
    </Dialog>
  );
}

function PromptForm({
  prompt,
  draft,
  maxChars,
  compose,
  onClose,
  onInsert,
  note,
}: {
  prompt: FillablePrompt;
  draft: boolean;
  maxChars: number;
  compose: (filled: string, mode: InsertMode) => string;
  onClose: () => void;
  onInsert: (text: string, mode: InsertMode) => void;
  note?: string;
}) {
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(prompt));
  const [submitted, setSubmitted] = useState(false);
  const done = useRef(false);
  const formId = useId();
  const fieldId = (key: string) => `${formId}-${key.replace(/[^a-z0-9]+/g, "-")}`;
  const fields = useRef<(HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null)[]>([]);

  useEffect(() => {
    // Fokus aufs erste leere Feld (sonst aufs erste), nicht auf „Schließen“ – erst nachdem der Dialog offen ist.
    const first = prompt.placeholders.findIndex((p) => !cleanValue(values[p.key] ?? "", p.type));
    const timer = setTimeout(() => {
      // Wer schon in einem Feld ist (schnell geklickt oder getippt), behält seinen Fokus.
      if (fields.current.some((f) => f && f === document.activeElement)) return;
      fields.current[Math.max(0, first)]?.focus();
    }, 0);
    return () => clearTimeout(timer);
    // Nur beim Öffnen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const change = (key: string, value: string) => {
    setValues((v) => {
      const next = { ...v, [key]: value };
      remembered.set(prompt.id, next);
      return next;
    });
  };

  const errors = Object.fromEntries(prompt.placeholders.map((p) => [p.key, fieldError(p, values[p.key] ?? "")]));
  const filled = fillPartial(prompt.text, prompt.placeholders, values);
  const lengths: Record<InsertMode, number> = { replace: compose(filled, "replace").length, append: compose(filled, "append").length };
  const modes: InsertMode[] = draft ? ["replace", "append"] : ["replace"];
  const tooLong = modes.filter((m) => lengths[m] > maxChars);

  const submit = (mode: InsertMode) => {
    if (done.current) return;
    setSubmitted(true);
    const firstInvalid = prompt.placeholders.findIndex((p) => errors[p.key]);
    if (firstInvalid >= 0) {
      fields.current[firstInvalid]?.focus();
      return;
    }
    if (lengths[mode] > maxChars) return;
    done.current = true;
    onInsert(compose(filled, mode), mode);
  };
  /** Ohne Entwurf: Einfügen. Mit Entwurf: Anfügen – Enter soll nie still einen Entwurf überschreiben. */
  const primary: InsertMode = draft ? "append" : "replace";

  const onFieldKey = (e: KeyboardEvent, index: number, multiline: boolean) => {
    if (e.key !== "Enter" || e.nativeEvent.isComposing) return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      submit(primary);
      return;
    }
    if (multiline || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (index < prompt.placeholders.length - 1) fields.current[index + 1]?.focus();
    else submit(primary);
  };

  const shown = (key: string) => (submitted ? errors[key] : null);
  const inputBase = "w-full rounded-xl border bg-surface px-3 text-sm outline-none focus:border-primary aria-[invalid=true]:border-danger";
  return (
    <form
      noValidate
      aria-label={`Prompt „${prompt.title}“ ausfüllen`}
      onSubmit={(e) => {
        e.preventDefault();
        submit(primary);
      }}
      className="flex max-h-[calc(100dvh-10rem)] flex-col max-sm:max-h-[calc(100dvh-6rem)]"
    >
      <div className="-mt-2 min-h-0 flex-1 overflow-y-auto pr-1">
        <p className="text-sm font-medium">
          {prompt.title}
          {prompt.category && <span className="font-normal text-muted"> · {prompt.category}</span>}
        </p>
        {prompt.placeholders.length > 0 && <p className="mt-1 text-sm text-muted">Bitte alle Felder ausfüllen.</p>}
        <div className="mt-4 space-y-4">
          {prompt.placeholders.map((p, i) => {
            const id = fieldId(p.key);
            const error = shown(p.key);
            const common = {
              id,
              value: values[p.key] ?? "",
              "aria-required": true,
              "aria-invalid": error ? true : undefined,
              "aria-describedby": error ? `${id}-fehler` : p.hint && p.type === "select" ? `${id}-hinweis` : undefined,
              "data-platzhalter": p.key,
            } as const;
            return (
              <div key={p.key}>
                <label htmlFor={id} className="mb-1 block text-sm font-medium">
                  {p.label}
                </label>
                {p.type === "area" ? (
                  <textarea
                    {...common}
                    ref={(el) => {
                      fields.current[i] = el;
                    }}
                    rows={4}
                    placeholder={p.hint || undefined}
                    onChange={(e) => change(p.key, e.target.value)}
                    onKeyDown={(e) => onFieldKey(e, i, true)}
                    className={cn(inputBase, "border-border py-2 leading-relaxed")}
                  />
                ) : p.type === "select" ? (
                  <select
                    {...common}
                    ref={(el) => {
                      fields.current[i] = el;
                    }}
                    onChange={(e) => change(p.key, e.target.value)}
                    onKeyDown={(e) => onFieldKey(e, i, false)}
                    className={cn(inputBase, "h-10 border-border")}
                  >
                    <option value="">Bitte wählen …</option>
                    {p.options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    {...common}
                    ref={(el) => {
                      fields.current[i] = el;
                    }}
                    type="text"
                    enterKeyHint={i < prompt.placeholders.length - 1 ? "next" : "done"}
                    placeholder={p.hint || undefined}
                    onChange={(e) => change(p.key, e.target.value)}
                    onKeyDown={(e) => onFieldKey(e, i, false)}
                    className={cn(inputBase, "h-10 border-border")}
                  />
                )}
                {p.hint && p.type === "select" && !error && (
                  <p id={`${id}-hinweis`} className="mt-1 text-xs text-muted">
                    {p.hint}
                  </p>
                )}
                {error && (
                  <p id={`${id}-fehler`} className="mt-1 text-xs font-medium text-danger">
                    {error}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        <section aria-label="Vorschau" className="mt-5 rounded-2xl border border-border bg-surface-2 p-3">
          <p className="mb-1 text-xs font-medium text-muted">Vorschau</p>
          <PromptText text={prompt.text} placeholders={prompt.placeholders} values={values} />
        </section>
      </div>
      <div className="mt-4 space-y-3 border-t border-border pt-3">
        {draft && (
          <p className="flex items-start gap-2 text-sm text-muted">
            <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> Im Eingabefeld steht schon Text. „Anfügen“ setzt den Prompt darunter, „Ersetzen“
            überschreibt ihn.
          </p>
        )}
        {tooLong.length > 0 && (
          <p role="alert" className="text-sm text-danger">
            Der Text wäre {number.format(Math.min(...tooLong.map((m) => lengths[m])))} Zeichen lang – im Eingabefeld sind höchstens{" "}
            {number.format(maxChars)} möglich.
          </p>
        )}
        {note && <p className="text-xs text-muted">{note}</p>}
        <div className="flex flex-wrap justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Abbrechen
          </Button>
          {draft && (
            <Button variant="secondary" onClick={() => submit("replace")} disabled={tooLong.includes("replace")}>
              Ersetzen
            </Button>
          )}
          <Button type="submit" variant="primary" disabled={tooLong.includes(primary)}>
            {draft ? "Anfügen" : "Einfügen"}
          </Button>
        </div>
      </div>
    </form>
  );
}
