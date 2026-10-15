"use client";
// Prompts nach Kategorie (Reihenfolge wie im Fundus) und die Kategorien selbst.
import { ArrowDown, ArrowUp, Check, Download, FileDown, Loader2, Pencil, Plus, Trash2, Upload, X } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client/api";
import { downloadText } from "@/lib/client/export";
import type { AdminPrompt, AdminPromptCategory } from "@/lib/shared/fundus";
import { parsePrompt } from "@/lib/shared/placeholders";
import { FUNDUS_LIMITS } from "@/lib/shared/fundus";
import { Button } from "@/components/ui/Button";
import { inputClass } from "../fields";
import { exportFileName, promptFile, promptFileText } from "@/lib/shared/prompt-import";
import { downloadMuster, ImportDialog } from "./ImportDialog";
import { BLANK_PROMPT, PromptDialog, type PromptDraft } from "./PromptDialog";
import { Badge, errorText, plural } from "./shared";

type Message = (text: string, tone?: "success" | "danger") => void;

function useAct(reload: () => Promise<void>, onMessage: Message) {
  const [busy, setBusy] = useState<string | null>(null);
  const act = async (id: string, work: () => Promise<unknown>, done?: string) => {
    setBusy(id);
    try {
      await work();
      await reload();
      if (done) onMessage(done);
    } catch (err) {
      onMessage(errorText(err, "Das hat nicht geklappt."), "danger");
    } finally {
      setBusy(null);
    }
  };
  return { busy, act };
}

export function PromptsPanel({
  prompts,
  categories,
  reload,
  onMessage,
}: {
  prompts: AdminPrompt[];
  categories: AdminPromptCategory[];
  reload: () => Promise<void>;
  onMessage: Message;
}) {
  const [editing, setEditing] = useState<PromptDraft | null>(null);
  const [importing, setImporting] = useState(false);
  const { busy, act } = useAct(reload, onMessage);
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  /** Export im Format der Musterdatei: eine Kategorie (ohne Feld „kategorie“) oder alle (mit). */
  const exportPrompts = (category: AdminPromptCategory | null) => {
    const list = category ? prompts.filter((p) => p.categoryId === category.id) : prompts;
    const name = category?.name ?? "Alle Prompts";
    const file = promptFile(name, list.map((p) => ({ ...p, category: category ? undefined : categoryName.get(p.categoryId) })));
    downloadText(promptFileText(file), exportFileName(name), "application/json");
  };
  const patch = (id: string, body: object, done?: string) => act(id, () => api("/api/admin/fundus/prompts", { method: "PATCH", json: { id, ...body }, admin: true }), done);
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted">
          {plural(prompts.length, "Prompt", "Prompts")}, davon {prompts.filter((p) => p.enabled).length} aktiv. Teilnehmende sehen nur Kategorien mit aktiven Prompts.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={downloadMuster}>
            <Download className="h-4 w-4" /> Muster herunterladen
          </Button>
          <Button size="sm" variant="ghost" onClick={() => exportPrompts(null)} disabled={prompts.length === 0}>
            <FileDown className="h-4 w-4" /> Alle exportieren
          </Button>
          <Button size="sm" onClick={() => setImporting(true)}>
            <Upload className="h-4 w-4" /> Importieren
          </Button>
          <Button size="sm" variant="primary" onClick={() => setEditing(BLANK_PROMPT)}>
            <Plus className="h-4 w-4" /> Neuer Prompt
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        {categories.map((c) => {
          const list = prompts.filter((p) => p.categoryId === c.id);
          return (
            <section key={c.id} aria-label={`Kategorie ${c.name}`}>
              <div className="mb-1 flex items-center gap-2">
                <h3 className="text-sm font-semibold">
                  {c.name} <span className="font-normal text-muted">({list.length})</span>
                </h3>
                {list.length > 0 && (
                  <Button size="sm" variant="ghost" aria-label={`„${c.name}“ exportieren`} title="Exportieren" onClick={() => exportPrompts(c)}>
                    <FileDown className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {list.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border px-3 py-2 text-sm text-muted">Noch keine Prompts.</p>
              ) : (
                <ul className="divide-y divide-border rounded-2xl border border-border">
                  {list.map((p, index) => {
                    const count = parsePrompt(p.text).placeholders.length;
                    return (
                      <li key={p.id} data-id={p.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
                        <div className="min-w-0 flex-1 basis-60">
                          <p className="truncate text-sm font-medium">{p.title}</p>
                          <p className="truncate text-xs text-muted">{p.description || p.text.slice(0, 120)}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge tone="muted">{count === 0 ? "ohne Platzhalter" : plural(count, "Platzhalter", "Platzhalter")}</Badge>
                            {!p.enabled && <Badge tone="warning">inaktiv</Badge>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {busy === p.id && <Loader2 className="h-4 w-4 animate-spin text-muted" aria-label="Wird gespeichert …" />}
                          <Button size="sm" variant="ghost" aria-label={`„${p.title}“ nach oben`} title="Nach oben" disabled={index === 0} onClick={() => void patch(p.id, { move: -1 })}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`„${p.title}“ nach unten`}
                            title="Nach unten"
                            disabled={index === list.length - 1}
                            onClick={() => void patch(p.id, { move: 1 })}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={p.enabled}
                            aria-label={`„${p.title}“ aktiv`}
                            title={p.enabled ? "Aktiv" : "Inaktiv"}
                            onClick={() => void patch(p.id, { enabled: !p.enabled })}
                            className={`relative mx-1 h-5 w-9 shrink-0 rounded-full transition-colors ${p.enabled ? "bg-primary" : "bg-surface-3"}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${p.enabled ? "translate-x-4" : ""}`} />
                          </button>
                          <Button size="sm" variant="ghost" aria-label={`„${p.title}“ bearbeiten`} title="Bearbeiten" onClick={() => setEditing(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            aria-label={`„${p.title}“ löschen`}
                            title="Löschen"
                            onClick={() => {
                              if (!confirm(`Prompt „${p.title}“ löschen?`)) return;
                              void act(p.id, () => api(`/api/admin/fundus/prompts?id=${encodeURIComponent(p.id)}`, { method: "DELETE", admin: true }), `Prompt „${p.title}“ gelöscht.`);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
        {categories.length === 0 && <p className="text-sm text-muted">Noch keine Kategorien – leg im Prompt-Dialog oder unter „Kategorien“ die erste an.</p>}
      </div>
      {editing && (
        <PromptDialog
          initial={editing}
          categories={categories}
          onClose={() => {
            setEditing(null);
            // Im Dialog angelegte Kategorien sollen auch ohne Speichern erscheinen.
            void reload();
          }}
          onSaved={async (message) => {
            setEditing(null);
            await reload();
            onMessage(message);
          }}
        />
      )}
      {importing && (
        <ImportDialog
          prompts={prompts}
          categories={categories}
          onClose={() => setImporting(false)}
          onImported={async (message) => {
            setImporting(false);
            await reload();
            onMessage(message);
          }}
        />
      )}
    </div>
  );
}

export function CategoriesPanel({ categories, reload, onMessage }: { categories: AdminPromptCategory[]; reload: () => Promise<void>; onMessage: Message }) {
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { busy, act } = useAct(reload, onMessage);

  const create = async () => {
    setError(null);
    try {
      await api("/api/admin/fundus/categories", { method: "POST", json: { name }, admin: true });
      onMessage(`Kategorie „${name.trim()}“ angelegt.`);
      setName("");
      await reload();
    } catch (err) {
      setError(errorText(err, "Anlegen fehlgeschlagen"));
    }
  };

  const rename = async () => {
    if (!renaming) return;
    setError(null);
    try {
      await api("/api/admin/fundus/categories", { method: "PUT", json: { id: renaming.id, name: renaming.name }, admin: true });
      setRenaming(null);
      await reload();
    } catch (err) {
      setError(errorText(err, "Umbenennen fehlgeschlagen"));
    }
  };

  return (
    <div>
      <form
        className="mb-3 flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void create();
        }}
      >
        <input
          className={`${inputClass} max-w-sm flex-1`}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setError(null);
          }}
          aria-label="Name der neuen Kategorie"
          placeholder="z. B. Präsentieren"
          maxLength={FUNDUS_LIMITS.categoryName + 10}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "kategorie-fehler" : undefined}
        />
        <Button type="submit" variant="primary" disabled={!name.trim()}>
          <Plus className="h-4 w-4" /> Kategorie anlegen
        </Button>
      </form>
      {error && (
        <p id="kategorie-fehler" role="alert" className="mb-3 text-sm text-danger">
          {error}
        </p>
      )}
      <p className="mb-2 text-xs text-muted">
        {plural(categories.length, "Kategorie", "Kategorien")} (höchstens {FUNDUS_LIMITS.categories}). Die Reihenfolge gilt auch im Fundus der Teilnehmenden. Löschen geht nur
        bei leeren Kategorien.
      </p>
      <ul aria-label="Kategorien" className="divide-y divide-border rounded-2xl border border-border">
        {categories.map((c, index) => (
          <li key={c.id} data-id={c.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
            {renaming?.id === c.id ? (
              <form
                className="flex min-w-0 flex-1 gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  void rename();
                }}
              >
                <input
                  autoFocus
                  className={inputClass}
                  value={renaming.name}
                  aria-label={`Neuer Name für „${c.name}“`}
                  onChange={(e) => setRenaming({ id: c.id, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      e.stopPropagation();
                      setRenaming(null);
                    }
                  }}
                />
                <Button type="submit" size="md" aria-label="Namen speichern">
                  <Check className="h-4 w-4" />
                </Button>
                <Button size="md" variant="ghost" aria-label="Umbenennen abbrechen" onClick={() => setRenaming(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="text-xs text-muted">
                  {plural(c.prompts, "Prompt", "Prompts")}
                  {c.prompts !== c.activePrompts ? `, davon ${c.activePrompts} aktiv` : ""}
                </p>
              </div>
            )}
            <div className="flex items-center gap-1">
              {busy === c.id && <Loader2 className="h-4 w-4 animate-spin text-muted" aria-label="Wird gespeichert …" />}
              <Button
                size="sm"
                variant="ghost"
                aria-label={`„${c.name}“ nach oben`}
                title="Nach oben"
                disabled={index === 0}
                onClick={() => void act(c.id, () => api("/api/admin/fundus/categories", { method: "PUT", json: { id: c.id, move: -1 }, admin: true }))}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`„${c.name}“ nach unten`}
                title="Nach unten"
                disabled={index === categories.length - 1}
                onClick={() => void act(c.id, () => api("/api/admin/fundus/categories", { method: "PUT", json: { id: c.id, move: 1 }, admin: true }))}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" aria-label={`„${c.name}“ umbenennen`} title="Umbenennen" onClick={() => setRenaming({ id: c.id, name: c.name })}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                aria-label={`„${c.name}“ löschen`}
                title={c.prompts ? "Erst die Prompts verschieben oder löschen" : "Löschen"}
                onClick={() => {
                  if (!c.prompts && !confirm(`Kategorie „${c.name}“ löschen?`)) return;
                  void act(c.id, () => api(`/api/admin/fundus/categories?id=${encodeURIComponent(c.id)}`, { method: "DELETE", admin: true }), `Kategorie „${c.name}“ gelöscht.`);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
        {categories.length === 0 && <li className="px-3 py-4 text-sm text-muted">Noch keine Kategorien.</li>}
      </ul>
    </div>
  );
}
