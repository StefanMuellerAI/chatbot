"use client";
// Prompt anlegen oder bearbeiten: Text mit {{Platzhaltern}}, Einstellungen je Platzhalter, Probe-Maske.
import { AlertTriangle, Eye, Loader2, Plus } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import { FUNDUS_LIMITS, type AdminPrompt, type AdminPromptCategory } from "@/lib/shared/fundus";
import {
  parsePrompt,
  PLACEHOLDER_TYPE_LABEL,
  PLACEHOLDER_TYPES,
  PROMPT_LIMITS,
  validatePrompt,
  type PlaceholderSetting,
  type PlaceholderType,
} from "@/lib/shared/placeholders";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Switch } from "@/components/ui/Switch";
import { PromptFillDialog } from "@/components/chat/library/PromptFill";
import { Field, inputClass, Notice, textareaClass } from "../fields";
import { errorText, number } from "./shared";

export type PromptDraft = Omit<AdminPrompt, "id" | "sortOrder"> & { id: string | null };

export const BLANK_PROMPT: PromptDraft = { id: null, categoryId: "", title: "", description: "", text: "", placeholders: {}, enabled: true };

const NEW_CATEGORY = "__neu__";

export function PromptDialog({
  initial,
  categories: initialCategories,
  onClose,
  onSaved,
}: {
  initial: PromptDraft;
  categories: AdminPromptCategory[];
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [p, setP] = useState<PromptDraft>({ ...initial, categoryId: initial.categoryId || initialCategories[0]?.id || "" });
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState<string | null>(initialCategories.length ? null : "");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [probe, setProbe] = useState(false);
  const [probeResult, setProbeResult] = useState<string | null>(null);
  const probeRef = useRef<HTMLElement>(null);
  const ids = useId();
  const set = <K extends keyof PromptDraft>(k: K, v: PromptDraft[K]) => setP((x) => ({ ...x, [k]: v }));

  const parsed = useMemo(() => parsePrompt(p.text), [p.text]);
  const check = useMemo(() => validatePrompt(p.text, p.placeholders), [p.text, p.placeholders]);
  const titleError = !p.title.trim() ? "Titel: darf nicht leer sein" : p.title.trim().length > FUNDUS_LIMITS.promptTitle ? `Titel: höchstens ${FUNDUS_LIMITS.promptTitle} Zeichen` : null;
  const descriptionError = p.description.trim().length > FUNDUS_LIMITS.promptDescription ? `Kurzbeschreibung: höchstens ${FUNDUS_LIMITS.promptDescription} Zeichen` : null;
  const categoryMissing = !p.categoryId || p.categoryId === NEW_CATEGORY ? "Kategorie: bitte eine Kategorie wählen oder anlegen." : null;
  const errors = [titleError, categoryMissing, descriptionError, ...check.errors].filter((e): e is string => Boolean(e));
  // Fehler im Text gleich zeigen, sobald etwas dasteht; die übrigen erst nach „Speichern“.
  const shownErrors = attempted ? errors : p.text ? check.errors.filter((e) => !e.startsWith("Prompt-Text: darf nicht leer")) : [];

  const setting = (key: string, patch: Partial<PlaceholderSetting>) =>
    setP((x) => ({ ...x, placeholders: { ...x.placeholders, [key]: { ...x.placeholders[key], ...patch } } }));

  const createCategory = async () => {
    setCategoryError(null);
    try {
      const name = (newCategory ?? "").trim();
      const { id } = await api<{ id: string }>("/api/admin/fundus/categories", { method: "POST", json: { name }, admin: true });
      setCategories((list) => [...list, { id, name, sortOrder: list.length, prompts: 0, activePrompts: 0 }]);
      set("categoryId", id);
      setNewCategory(null);
    } catch (err) {
      setCategoryError(errorText(err, "Anlegen fehlgeschlagen"));
    }
  };

  const save = async () => {
    setAttempted(true);
    if (busy || errors.length) return;
    setBusy(true);
    setError(null);
    try {
      const body = { categoryId: p.categoryId, title: p.title.trim(), description: p.description.trim(), text: p.text, placeholders: check.settings, enabled: p.enabled };
      await api("/api/admin/fundus/prompts", { method: p.id ? "PUT" : "POST", json: p.id ? { id: p.id, ...body } : body, admin: true });
      onSaved(p.id ? `Prompt „${body.title}“ gespeichert.` : `Prompt „${body.title}“ angelegt.`);
    } catch (err) {
      setError(errorText(err, "Speichern fehlgeschlagen"));
    } finally {
      setBusy(false);
    }
  };

  const errorsId = `${ids}-fehler`;
  const category = categories.find((c) => c.id === p.categoryId);
  return (
    <Dialog open onClose={onClose} title={p.id ? "Prompt bearbeiten" : "Neuer Prompt"} className="w-[min(860px,calc(100vw-2rem))]">
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Titel">
            <input
              className={inputClass}
              value={p.title}
              onChange={(e) => set("title", e.target.value)}
              aria-invalid={attempted && titleError ? true : undefined}
              aria-describedby={attempted && titleError ? errorsId : undefined}
            />
          </Field>
          <div className="text-sm">
            <label htmlFor={`${ids}-kategorie`} className="mb-1 block font-medium">
              Kategorie
            </label>
            <select
              id={`${ids}-kategorie`}
              className={inputClass}
              value={newCategory !== null ? NEW_CATEGORY : p.categoryId}
              aria-invalid={attempted && categoryMissing ? true : undefined}
              onChange={(e) => {
                if (e.target.value === NEW_CATEGORY) setNewCategory("");
                else {
                  setNewCategory(null);
                  set("categoryId", e.target.value);
                }
              }}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
              <option value={NEW_CATEGORY}>Neue Kategorie …</option>
            </select>
            {newCategory !== null && (
              <div className="mt-2 flex gap-2">
                <input
                  className={inputClass}
                  value={newCategory}
                  aria-label="Name der neuen Kategorie"
                  placeholder="z. B. Präsentieren"
                  maxLength={FUNDUS_LIMITS.categoryName + 10}
                  onChange={(e) => setNewCategory(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void createCategory();
                    }
                  }}
                />
                <Button size="md" onClick={() => void createCategory()}>
                  <Plus className="h-4 w-4" /> Anlegen
                </Button>
              </div>
            )}
            {categoryError && (
              <p role="alert" className="mt-1 text-xs text-danger">
                {categoryError}
              </p>
            )}
          </div>
          <Field label="Kurzbeschreibung" hint="Erscheint in der Liste im Fundus." className="sm:col-span-2">
            <input className={inputClass} value={p.description} onChange={(e) => set("description", e.target.value)} />
          </Field>
          <div className="text-sm sm:col-span-2">
            <label htmlFor={`${ids}-text`} className="mb-1 block font-medium">
              Prompt-Text
            </label>
            <textarea
              id={`${ids}-text`}
              className={textareaClass}
              rows={8}
              value={p.text}
              onChange={(e) => set("text", e.target.value)}
              placeholder="Fasse den angehängten Verlauf für {{Zielgruppe}} in {{Anzahl Punkte}} Punkten zusammen."
              aria-invalid={shownErrors.some((e) => e.startsWith("Prompt-Text") || e.startsWith("Höchstens")) ? true : undefined}
              aria-describedby={`${ids}-text-hinweis${shownErrors.length ? ` ${errorsId}` : ""}`}
            />
            <p id={`${ids}-text-hinweis`} className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-muted">
              <span>
                Platzhalter in doppelten geschweiften Klammern: {"{{Zielgruppe}}"}. Jeder Platzhalter wird in der Maske ein Pflichtfeld.
              </span>
              <span>
                {number.format(p.text.length)} / {number.format(PROMPT_LIMITS.text)} Zeichen
              </span>
            </p>
          </div>
        </div>

        {parsed.warnings.length > 0 && (
          <ul aria-label="Hinweise zum Text" className="space-y-1 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning">
            {parsed.warnings.map((w) => (
              <li key={w} className="flex items-start gap-1.5">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {w}
              </li>
            ))}
          </ul>
        )}

        <section aria-labelledby={`${ids}-platzhalter`}>
          <h3 id={`${ids}-platzhalter`} className="mb-2 font-semibold">
            Platzhalter {parsed.placeholders.length > 0 && <span className="font-normal text-muted">({parsed.placeholders.length})</span>}
          </h3>
          {parsed.placeholders.length === 0 ? (
            <p className="text-sm text-muted">Ohne Platzhalter – der Text wird ohne Maske direkt ins Eingabefeld eingefügt.</p>
          ) : (
            <div className="space-y-3">
              {parsed.placeholders.map((ph) => (
                <PlaceholderRow key={ph.key} name={ph.name} count={ph.count} value={p.placeholders[ph.key] ?? {}} onChange={(patch) => setting(ph.key, patch)} />
              ))}
            </div>
          )}
        </section>

        <Switch label="Aktiv" description="Inaktive Prompts sehen Teilnehmende nicht." checked={p.enabled} onChange={(v) => set("enabled", v)} />

        {shownErrors.length > 0 && (
          <div id={errorsId}>
            <Notice tone="danger">
              <ul className="list-disc space-y-0.5 pl-4">
                {shownErrors.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </Notice>
          </div>
        )}
        {error && <Notice tone="danger">{error}</Notice>}
        {probeResult !== null && (
          <section ref={probeRef} aria-label="Ergebnis der Probe" className="rounded-2xl border border-border bg-surface-2 p-3 text-sm">
            <p className="mb-1 text-xs font-medium text-muted">So stünde der Text im Eingabefeld:</p>
            <p className="break-words whitespace-pre-wrap">{probeResult}</p>
          </section>
        )}
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button
          variant="secondary"
          className="mr-auto"
          disabled={!p.text.trim() || check.errors.length > 0}
          onClick={() => {
            setProbeResult(null);
            setProbe(true);
          }}
        >
          <Eye className="h-4 w-4" /> So sieht es im Chat aus
        </Button>
        <Button variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button variant="primary" disabled={busy} onClick={() => void save()}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Speichern
        </Button>
      </div>
      <PromptFillDialog
        prompt={probe ? { id: `probe-${p.id ?? "neu"}`, title: p.title || "Ohne Titel", text: p.text, placeholders: check.placeholders, category: category?.name } : null}
        draft={false}
        maxChars={400_000}
        compose={(filled) => filled}
        note="Probe: Der Text landet hier im Dialog, nicht im Chat."
        onClose={() => setProbe(false)}
        onInsert={(text) => {
          setProbe(false);
          setProbeResult(text);
          setTimeout(() => probeRef.current?.scrollIntoView({ block: "nearest" }), 50);
        }}
      />
    </Dialog>
  );
}

function PlaceholderRow({ name, count, value, onChange }: { name: string; count: number; value: PlaceholderSetting; onChange: (patch: Partial<PlaceholderSetting>) => void }) {
  const ids = useId();
  const type: PlaceholderType = value.type ?? "text";
  const options = value.options ?? [];
  const [optionText, setOptionText] = useState(options.join("\n"));
  return (
    <fieldset data-platzhalter={name} className="rounded-2xl border border-border p-3">
      <legend className="px-1 text-sm font-semibold">
        {`{{${name}}}`} {count > 1 && <span className="font-normal text-muted">· kommt {count}× vor</span>}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Beschriftung" hint={`Leer: „${name}“`}>
          <input className={inputClass} value={value.label ?? ""} maxLength={PROMPT_LIMITS.label + 20} onChange={(e) => onChange({ label: e.target.value })} />
        </Field>
        <Field label="Hinweis" hint="Grauer Text im leeren Feld, z. B. „z. B. den Hauptausschuss“">
          <input className={inputClass} value={value.hint ?? ""} maxLength={PROMPT_LIMITS.hint + 20} onChange={(e) => onChange({ hint: e.target.value })} />
        </Field>
        <Field label="Art">
          <select className={inputClass} value={type} onChange={(e) => onChange({ type: e.target.value as PlaceholderType })}>
            {PLACEHOLDER_TYPES.map((t) => (
              <option key={t} value={t}>
                {PLACEHOLDER_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </Field>
        {type === "select" ? (
          <div className="text-sm">
            <label htmlFor={`${ids}-standard`} className="mb-1 block font-medium">
              Standardwert
            </label>
            <select id={`${ids}-standard`} className={inputClass} value={value.default ?? ""} onChange={(e) => onChange({ default: e.target.value })}>
              <option value="">– keiner –</option>
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <Field label="Standardwert" hint="Vorausgefüllt, lässt sich ändern">
            <input className={inputClass} value={value.default ?? ""} maxLength={PROMPT_LIMITS.single + 20} onChange={(e) => onChange({ default: e.target.value })} />
          </Field>
        )}
        {type === "select" && (
          <Field label="Auswahlwerte" hint={`Ein Wert je Zeile, 2–${PROMPT_LIMITS.options} Werte`} className="sm:col-span-2">
            <textarea
              className={textareaClass}
              rows={3}
              value={optionText}
              onChange={(e) => {
                setOptionText(e.target.value);
                onChange({ options: e.target.value.split("\n").map((o) => o.trim()).filter(Boolean) });
              }}
            />
          </Field>
        )}
      </div>
    </fieldset>
  );
}
