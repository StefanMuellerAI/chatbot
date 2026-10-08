"use client";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client/api";
import type { PresetRow } from "@/lib/models";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Switch } from "@/components/ui/Switch";
import { Card, Field, inputClass, Notice, textareaClass } from "./fields";

const ICONS = [
  ["sparkles", "Funken"],
  ["mail", "E-Mail"],
  ["table", "Tabelle"],
  ["presentation", "Präsentation"],
  ["layout", "Webseite"],
  ["lightbulb", "Idee"],
] as const;

const blank: PresetRow = { id: "", name: "", icon: "sparkles", description: "", promptAddendum: "", defaultModelId: null, enabled: true, sortOrder: 100 };

export function PresetsTab({ presets, models, reload }: { presets: PresetRow[]; models: { id: string; name: string }[]; reload: () => void }) {
  const [editing, setEditing] = useState<{ preset: PresetRow; isNew: boolean } | null>(null);
  return (
    <Card
      title="Assistenten-Vorlagen"
      description="Vorlagen geben dem Modell eine Rolle. Teilnehmende wählen sie beim Start eines neuen Chats."
      actions={
        <Button size="sm" variant="primary" onClick={() => setEditing({ preset: blank, isNew: true })}>
          <Plus className="h-4 w-4" /> Vorlage anlegen
        </Button>
      }
    >
      <div className="divide-y divide-border">
        {presets.map((p) => (
          <div key={p.id} className="flex items-center gap-3 py-3">
            <div className="min-w-0 flex-1">
              <div className="font-medium">
                {p.name} {!p.enabled && <span className="ml-2 rounded-full bg-surface-3 px-2 py-0.5 text-xs text-muted">deaktiviert</span>}
              </div>
              <div className="truncate text-xs text-muted">{p.description}</div>
            </div>
            <Button size="sm" variant="ghost" onClick={() => setEditing({ preset: p, isNew: false })} aria-label="Bearbeiten">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Löschen"
              onClick={async () => {
                if (!confirm(`Vorlage „${p.name}“ löschen?`)) return;
                await api(`/api/admin/presets?id=${encodeURIComponent(p.id)}`, { method: "DELETE", admin: true });
                reload();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {presets.length === 0 && <p className="py-4 text-sm text-muted">Noch keine Vorlagen.</p>}
      </div>
      {editing && (
        <PresetDialog
          initial={editing.preset}
          isNew={editing.isNew}
          models={models}
          onClose={() => setEditing(null)}
          onSave={async (p) => {
            await api("/api/admin/presets", { method: editing.isNew ? "POST" : "PUT", json: p, admin: true });
            setEditing(null);
            reload();
          }}
        />
      )}
    </Card>
  );
}

function PresetDialog({ initial, isNew, models, onClose, onSave }: { initial: PresetRow; isNew: boolean; models: { id: string; name: string }[]; onClose: () => void; onSave: (p: PresetRow) => Promise<void> }) {
  const [p, setP] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof PresetRow>(k: K, v: PresetRow[K]) => setP((x) => ({ ...x, [k]: v }));
  return (
    <Dialog open onClose={onClose} title={isNew ? "Vorlage anlegen" : "Vorlage bearbeiten"} className="w-[min(680px,calc(100vw-2rem))]">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name">
          <input
            className={inputClass}
            value={p.name}
            onChange={(e) => {
              set("name", e.target.value);
              if (isNew) set("id", e.target.value.toLowerCase().replace(/ä/g, "ae").replace(/ö/g, "oe").replace(/ü/g, "ue").replace(/ß/g, "ss").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60));
            }}
          />
        </Field>
        <Field label="ID">
          <input className={inputClass} value={p.id} onChange={(e) => set("id", e.target.value)} disabled={!isNew} />
        </Field>
        <Field label="Symbol">
          <select className={inputClass} value={p.icon} onChange={(e) => set("icon", e.target.value)}>
            {ICONS.map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Reihenfolge">
          <input className={inputClass} type="number" value={p.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value) || 0)} />
        </Field>
        <Field label="Kurzbeschreibung" className="sm:col-span-2">
          <input className={inputClass} value={p.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label="Anweisung an das Modell" hint="Wird als eigener, gecachter Block an den System-Prompt angehängt." className="sm:col-span-2">
          <textarea className={textareaClass} rows={6} value={p.promptAddendum} onChange={(e) => set("promptAddendum", e.target.value)} />
        </Field>
        <Field label="Empfohlenes Modell (optional)">
          <select className={inputClass} value={p.defaultModelId ?? ""} onChange={(e) => set("defaultModelId", e.target.value || null)}>
            <option value="">– keins –</option>
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="pt-6">
          <Switch label="Aktiv" checked={p.enabled} onChange={(v) => set("enabled", v)} />
        </div>
      </div>
      {error && <div className="mt-3"><Notice tone="danger">{error}</Notice></div>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button
          variant="primary"
          disabled={busy || !p.name || !p.id}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await onSave(p);
            } catch (err) {
              setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Speichern
        </Button>
      </div>
    </Dialog>
  );
}
