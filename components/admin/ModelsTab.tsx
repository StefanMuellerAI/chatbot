"use client";
import { CircleCheck, CircleX, Download, Loader2, Pencil, Plus, Star, Trash2, Zap } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client/api";
import type { ModelRow } from "@/lib/models";
import { EFFORT_LEVELS, type Effort, type ModelCapabilities } from "@/lib/shared/types";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Switch } from "@/components/ui/Switch";
import { ProviderDot } from "@/components/chat/ModelPicker";
import { Card, Field, inputClass, Notice } from "./fields";

const CAP_LABELS: { key: keyof ModelCapabilities; label: string; hint: string }[] = [
  { key: "vision", label: "Bilder verstehen", hint: "Bild-Uploads werden an das Modell geschickt" },
  { key: "pdf", label: "PDF nativ", hint: "PDFs mit Layout statt nur Text (Einstellung „PDF nativ“)" },
  { key: "webSearch", label: "Websuche", hint: "Server-Tool des Anbieters" },
  { key: "tools", label: "Werkzeuge", hint: "Bildgenerierung per Tool" },
  { key: "reasoning", label: "Denkt nach (Effort)", hint: "Thinking/Reasoning mit Effort-Stufen" },
  { key: "perMessageEffort", label: "Effort-Wechsel ohne Cache-Verlust", hint: "Claude: Mid-Conversation-Effort · GPT-6: configuration_update" },
  { key: "systemMessages", label: "System-Nachrichten im Verlauf", hint: "Für Hinweise wie „Websuche aus“" },
  { key: "fallbacks", label: "Refusal-Fallback", hint: "Claude: fallbacks „default“ (nicht für Haiku)" },
];

const NUMBER_FIELDS = ["sortOrder", "maxOutputTokens", "priceIn", "priceOut", "priceCacheRead", "priceCacheWrite"] as const;
type NumberField = (typeof NUMBER_FIELDS)[number];

function blankModel(provider: "anthropic" | "openai", modelId = "", name = ""): ModelRow {
  const isClaude = provider === "anthropic";
  return {
    id: modelId.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60),
    provider,
    modelId,
    displayName: name || modelId,
    description: "",
    enabled: true,
    isDefault: false,
    sortOrder: 100,
    capabilities: {
      vision: true,
      pdf: true,
      webSearch: true,
      tools: true,
      reasoning: true,
      perMessageEffort: isClaude || /^gpt-6/.test(modelId),
      systemMessages: true,
      fallbacks: isClaude && !/haiku/.test(modelId),
      anthropicWebTools: isClaude ? (/haiku/.test(modelId) ? "basic" : "dynamic") : undefined,
    },
    effortMap: { low: "low", medium: "medium", high: "high", max: "max" },
    defaultEffort: "medium",
    maxOutputTokens: 64000,
    priceIn: 0,
    priceOut: 0,
    priceCacheRead: 0,
    priceCacheWrite: 0,
  };
}

export function ModelsTab({ models, reload }: { models: ModelRow[]; reload: () => void }) {
  const [editing, setEditing] = useState<{ model: ModelRow; isNew: boolean } | null>(null);
  const [tests, setTests] = useState<Record<string, { busy: boolean; ok?: boolean; text?: string }>>({});
  const [discover, setDiscover] = useState<{ provider: "anthropic" | "openai"; busy: boolean; list?: { id: string; name: string }[]; error?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = async (m: ModelRow, isNew: boolean) => {
    await api("/api/admin/models", { method: isNew ? "POST" : "PUT", json: m, admin: true });
    reload();
  };

  const toggle = async (m: ModelRow, patch: Partial<ModelRow>) => {
    setError(null);
    try {
      await save({ ...m, ...patch }, false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
    }
  };

  const test = async (m: ModelRow) => {
    setTests((t) => ({ ...t, [m.id]: { busy: true } }));
    try {
      const res = await api<{ ok: boolean; answer?: string; error?: string; ms: number }>("/api/admin/models/test", { method: "POST", json: { id: m.id }, admin: true });
      setTests((t) => ({ ...t, [m.id]: { busy: false, ok: res.ok, text: res.ok ? `Antwort: „${res.answer}“ (${res.ms} ms)` : res.error } }));
    } catch (err) {
      setTests((t) => ({ ...t, [m.id]: { busy: false, ok: false, text: err instanceof Error ? err.message : "Fehler" } }));
    }
  };

  const runDiscover = async (provider: "anthropic" | "openai") => {
    setDiscover({ provider, busy: true });
    try {
      const res = await api<{ models: { id: string; name: string }[] }>("/api/admin/models/discover", { method: "POST", json: { provider }, admin: true });
      setDiscover({ provider, busy: false, list: res.models });
    } catch (err) {
      setDiscover({ provider, busy: false, error: err instanceof Error ? err.message : "Fehler" });
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Modelle"
        description="Diese Modelle stehen den Teilnehmenden zur Auswahl. Preise (USD pro 1 Mio. Tokens) dienen der Kostenschätzung."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => runDiscover("anthropic")}>
              <Download className="h-4 w-4" /> Claude-Modelle abrufen
            </Button>
            <Button size="sm" onClick={() => runDiscover("openai")}>
              <Download className="h-4 w-4" /> OpenAI-Modelle abrufen
            </Button>
            <Button size="sm" variant="primary" onClick={() => setEditing({ model: blankModel("anthropic"), isNew: true })}>
              <Plus className="h-4 w-4" /> Modell anlegen
            </Button>
          </div>
        }
      >
        {error && <div className="mb-3"><Notice tone="danger">{error}</Notice></div>}
        <div className="divide-y divide-border">
          {models.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-3 py-3">
              <ProviderDot provider={m.provider} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{m.displayName}</span>
                  {m.isDefault && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-semibold text-primary">Standard</span>}
                  {!m.enabled && <span className="rounded-full bg-surface-3 px-2 py-0.5 text-xs text-muted">deaktiviert</span>}
                </div>
                <div className="text-xs text-muted">
                  <code>{m.modelId}</code> · ${m.priceIn} / ${m.priceOut} pro 1 Mio. Tokens · Cache-Read ${m.priceCacheRead}
                </div>
                {tests[m.id]?.text && (
                  <div className={`mt-1 flex items-center gap-1 text-xs ${tests[m.id].ok ? "text-success" : "text-danger"}`}>
                    {tests[m.id].ok ? <CircleCheck className="h-3.5 w-3.5" /> : <CircleX className="h-3.5 w-3.5" />}
                    {tests[m.id].text}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => test(m)}
                  disabled={tests[m.id]?.busy}
                  title="Verbindung testen"
                  aria-label={`${m.displayName} testen`}
                >
                  {tests[m.id]?.busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />} Test
                </Button>
                {!m.isDefault && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggle(m, { isDefault: true, enabled: true })}
                    title="Als Standard setzen"
                    aria-label={`${m.displayName} als Standard setzen`}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggle(m, { enabled: !m.enabled })}
                  aria-label={`${m.displayName} ${m.enabled ? "deaktivieren" : "aktivieren"}`}
                >
                  {m.enabled ? "Deaktivieren" : "Aktivieren"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing({ model: m, isNew: false })} aria-label={`${m.displayName} bearbeiten`} title="Bearbeiten">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  aria-label={`${m.displayName} löschen`}
                  title="Löschen"
                  onClick={async () => {
                    if (!confirm(`Modell „${m.displayName}“ löschen?`)) return;
                    setError(null);
                    try {
                      await api(`/api/admin/models?id=${encodeURIComponent(m.id)}`, { method: "DELETE", admin: true });
                      reload();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Löschen fehlgeschlagen");
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {discover && (
        <Card title={`Verfügbare ${discover.provider === "anthropic" ? "Claude" : "OpenAI"}-Modelle`} description="Klicke auf ein Modell, um es mit Standardwerten zu übernehmen. Preise bitte anschließend ergänzen.">
          {discover.busy && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
          {discover.error && <Notice tone="danger">{discover.error}</Notice>}
          {discover.list && (
            <div className="flex max-h-80 flex-wrap gap-2 overflow-y-auto">
              {discover.list
                .filter((d) => discover.provider === "anthropic" || /^(gpt|o\d|chatgpt)/.test(d.id))
                .map((d) => {
                  const exists = models.some((m) => m.modelId === d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      disabled={exists}
                      onClick={() => setEditing({ model: blankModel(discover.provider, d.id, d.name), isNew: true })}
                      className="rounded-full border border-border px-3 py-1.5 text-sm hover:border-primary hover:text-primary disabled:opacity-40"
                      title={exists ? "Bereits angelegt" : "Übernehmen"}
                    >
                      {d.name !== d.id ? `${d.name} (${d.id})` : d.id}
                    </button>
                  );
                })}
            </div>
          )}
        </Card>
      )}

      {editing && (
        <ModelDialog
          initial={editing.model}
          isNew={editing.isNew}
          onClose={() => setEditing(null)}
          onSave={async (m) => {
            await save(m, editing.isNew);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ModelDialog({ initial, isNew, onClose, onSave }: { initial: ModelRow; isNew: boolean; onClose: () => void; onSave: (m: ModelRow) => Promise<void> }) {
  const [m, setM] = useState<ModelRow>(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = <K extends keyof ModelRow>(k: K, v: ModelRow[K]) => setM((x) => ({ ...x, [k]: v }));
  // Zahlen als Text bearbeiten (Komma erlaubt), erst beim Speichern umwandeln.
  const [numbers, setNumbers] = useState<Record<NumberField, string>>(() =>
    Object.fromEntries(NUMBER_FIELDS.map((k) => [k, String(initial[k]).replace(".", ",")])) as Record<NumberField, string>,
  );
  const numberInput = (k: NumberField, decimal = true) => (
    <input
      className={inputClass}
      inputMode={decimal ? "decimal" : "numeric"}
      value={numbers[k]}
      onChange={(e) => setNumbers((n) => ({ ...n, [k]: e.target.value }))}
    />
  );
  const toSave = (): ModelRow => ({
    ...m,
    ...Object.fromEntries(NUMBER_FIELDS.map((k) => [k, numbers[k].trim() === "" ? Number.NaN : Number(numbers[k].replace(",", "."))])),
  });

  return (
    <Dialog open onClose={onClose} title={isNew ? "Modell anlegen" : "Modell bearbeiten"} className="w-[min(760px,calc(100vw-2rem))]">
      <div className="grid max-h-[70vh] gap-4 overflow-y-auto pr-1 sm:grid-cols-2">
        <Field label="Anbieter">
          <select className={inputClass} value={m.provider} onChange={(e) => set("provider", e.target.value as ModelRow["provider"])} disabled={!isNew}>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI (GPT)</option>
          </select>
        </Field>
        <Field label="Interne ID" hint="Kleinbuchstaben, Ziffern, Bindestriche">
          <input className={inputClass} value={m.id} onChange={(e) => set("id", e.target.value)} disabled={!isNew} />
        </Field>
        <Field label="API-Modell-ID" hint="z. B. claude-sonnet-5-5 oder gpt-6.1-sol">
          <input className={inputClass} value={m.modelId} onChange={(e) => set("modelId", e.target.value)} />
        </Field>
        <Field label="Anzeigename">
          <input className={inputClass} value={m.displayName} onChange={(e) => set("displayName", e.target.value)} />
        </Field>
        <Field label="Beschreibung" className="sm:col-span-2">
          <input className={inputClass} value={m.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label="Reihenfolge">{numberInput("sortOrder", false)}</Field>
        <Field label="Max. Output-Tokens">{numberInput("maxOutputTokens", false)}</Field>
        <Field label="Preis Input ($/1 Mio.)">{numberInput("priceIn")}</Field>
        <Field label="Preis Output ($/1 Mio.)">{numberInput("priceOut")}</Field>
        <Field label="Preis Cache-Read ($/1 Mio.)">{numberInput("priceCacheRead")}</Field>
        <Field label="Preis Cache-Write ($/1 Mio.)">{numberInput("priceCacheWrite")}</Field>

        <div className="sm:col-span-2">
          <div className="mb-1 text-sm font-medium">Fähigkeiten</div>
          <div className="grid gap-x-6 sm:grid-cols-2">
            {CAP_LABELS.map((c) => (
              <Switch
                key={c.key}
                label={c.label}
                description={c.hint}
                checked={Boolean(m.capabilities[c.key])}
                onChange={(v) => set("capabilities", { ...m.capabilities, [c.key]: v })}
              />
            ))}
          </div>
          {m.provider === "anthropic" && (
            <Field label="Web-Tool-Version (Claude)" hint="dynamic = web_search_20260209 (aktuelle Opus/Sonnet), basic = web_search_20250305 (u. a. Haiku)">
              <select
                className={inputClass}
                value={m.capabilities.anthropicWebTools ?? "dynamic"}
                onChange={(e) => set("capabilities", { ...m.capabilities, anthropicWebTools: e.target.value as "dynamic" | "basic" })}
              >
                <option value="dynamic">dynamic</option>
                <option value="basic">basic</option>
              </select>
            </Field>
          )}
        </div>

        {m.capabilities.reasoning && (
          <div className="sm:col-span-2">
            <div className="mb-1 text-sm font-medium">Effort-Stufen</div>
            <p className="mb-2 text-xs text-muted">Welche Stufen angeboten werden und welcher API-Wert dahintersteht (z. B. „Maximal“ → max oder xhigh). Leer = Stufe nicht anbieten.</p>
            <div className="grid gap-3 sm:grid-cols-4">
              {EFFORT_LEVELS.map((l) => (
                <Field key={l.value} label={l.label}>
                  <input
                    className={inputClass}
                    value={m.effortMap[l.value] ?? ""}
                    placeholder="–"
                    onChange={(e) => {
                      const map = { ...m.effortMap };
                      if (e.target.value.trim()) map[l.value] = e.target.value.trim();
                      else delete map[l.value];
                      set("effortMap", map);
                      // Fällt die Standard-Stufe weg, die nächste angebotene nehmen.
                      if (!map[m.defaultEffort]) {
                        const next = EFFORT_LEVELS.find((x) => map[x.value]);
                        if (next) set("defaultEffort", next.value);
                      }
                    }}
                  />
                </Field>
              ))}
            </div>
            <Field label="Standard-Stufe" className="mt-3 max-w-xs">
              <select className={inputClass} value={m.defaultEffort} onChange={(e) => set("defaultEffort", e.target.value as Effort)}>
                {EFFORT_LEVELS.filter((l) => m.effortMap[l.value]).map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
        <div className="sm:col-span-2">
          <Switch label="Aktiv" checked={m.enabled} onChange={(v) => set("enabled", v)} />
          <Switch label="Standardmodell" checked={m.isDefault} onChange={(v) => set("isDefault", v)} />
        </div>
      </div>
      {error && <div className="mt-3"><Notice tone="danger">{error}</Notice></div>}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button
          variant="primary"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await onSave(toSave());
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
