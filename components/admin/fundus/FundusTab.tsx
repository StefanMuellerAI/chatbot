"use client";
// Admin › Fundus: eigene Dokumente, E-Mail-Verläufe, Prompts und Kategorien pflegen; mitgelieferte ausblenden.
import { Loader2, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { api, ApiError } from "@/lib/client/api";
import type { FundusOverview } from "@/lib/shared/fundus";
import { Button } from "@/components/ui/Button";
import { cn } from "@/components/ui/cn";
import { Card, Notice } from "../fields";
import { ItemsPanel } from "./ItemsPanel";
import { CategoriesPanel, PromptsPanel } from "./PromptsPanel";
import { errorText, number } from "./shared";
import { ThreadDialog } from "./ThreadDialog";
import { UploadDialog } from "./UploadDialog";

type Sub = "documents" | "threads" | "prompts" | "categories";

const SUBS: { id: Sub; label: string }[] = [
  { id: "documents", label: "Dokumente" },
  { id: "threads", label: "E-Mail-Verläufe" },
  { id: "prompts", label: "Prompts" },
  { id: "categories", label: "Kategorien" },
];

function fetchOverview(): Promise<FundusOverview> {
  return api<FundusOverview>("/api/admin/fundus", { admin: true });
}

export function FundusTab() {
  const [data, setData] = useState<FundusOverview | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sub, setSub] = useState<Sub>("documents");
  const [dialog, setDialog] = useState<"documents" | "threads" | null>(null);
  const [message, setMessage] = useState<{ text: string; tone: "success" | "danger" } | null>(null);
  const messageTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const ids = useId();

  // Der Reiter lädt seine Daten selbst, damit der Admin-Bereich beim Start schnell bleibt.
  const apply = useCallback((d: FundusOverview) => {
    setData(d);
    setLoadError(null);
  }, []);
  const fail = useCallback((err: unknown) => {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) return;
    setLoadError(errorText(err, "Laden fehlgeschlagen"));
  }, []);
  const reload = useCallback(() => fetchOverview().then(apply).catch(fail), [apply, fail]);

  useEffect(() => {
    fetchOverview().then(apply).catch(fail);
    const timer = messageTimer;
    return () => clearTimeout(timer.current);
  }, [apply, fail]);

  const showMessage = (text: string, tone: "success" | "danger" = "success") => {
    setMessage({ text, tone });
    clearTimeout(messageTimer.current);
    if (tone === "success") messageTimer.current = setTimeout(() => setMessage(null), 6000);
  };

  if (!data) {
    return (
      <Card title="Fundus">
        {loadError ? (
          <div className="space-y-3" role="alert">
            <p className="text-sm text-danger">Der Fundus konnte nicht geladen werden: {loadError}</p>
            <Button size="sm" onClick={() => void reload()}>
              <RotateCcw className="h-4 w-4" /> Erneut versuchen
            </Button>
          </div>
        ) : (
          <p className="inline-flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Fundus wird geladen …
          </p>
        )}
      </Card>
    );
  }

  const ownDocs = data.documents.filter((d) => d.source === "eigen").length;
  const ownThreads = data.threads.filter((t) => t.source === "eigen").length;
  const hidden = data.documents.filter((d) => d.hidden).length + data.threads.filter((t) => t.hidden).length;
  const active = data.prompts.filter((p) => p.enabled).length;
  const counts: Record<Sub, number> = { documents: data.documents.length, threads: data.threads.length, prompts: data.prompts.length, categories: data.categories.length };

  const onTabKey = (e: KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const index = SUBS.findIndex((s) => s.id === sub);
    const next = e.key === "Home" ? 0 : e.key === "End" ? SUBS.length - 1 : (index + (e.key === "ArrowRight" ? 1 : SUBS.length - 1)) % SUBS.length;
    setSub(SUBS[next].id);
    document.getElementById(`${ids}-${SUBS[next].id}`)?.focus();
  };

  return (
    <div className="space-y-4">
      <Card
        title="Fundus"
        description="Eigene Dokumente, E-Mail-Verläufe und Prompts für die Teilnehmenden. Eigene Inhalte bleiben gespeichert, bis du sie löschst; mitgelieferte lassen sich nur ausblenden."
      >
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Zahlen">
          {[
            ["Eigene Dokumente", number.format(ownDocs)],
            ["Eigene Verläufe", number.format(ownThreads)],
            ["Prompts", `${number.format(data.prompts.length)} (${number.format(active)} aktiv)`],
            ["Ausgeblendet", number.format(hidden)],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-surface-2 px-3 py-2">
              <dt className="text-xs text-muted">{label}</dt>
              <dd className="font-display text-lg font-bold">{value}</dd>
            </div>
          ))}
        </dl>
        {!data.libraryEnabled && (
          <div className="mt-3">
            <Notice tone="warning">Der Fundus ist für Teilnehmende ausgeschaltet (Einstellungen › Funktionen) – pflegen geht trotzdem.</Notice>
          </div>
        )}
      </Card>

      <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
        <div role="tablist" aria-label="Fundus-Bereiche" className="mb-4 flex gap-1 overflow-x-auto border-b border-border">
          {SUBS.map((s) => (
            <button
              key={s.id}
              id={`${ids}-${s.id}`}
              type="button"
              role="tab"
              aria-selected={sub === s.id}
              aria-controls={`${ids}-panel`}
              tabIndex={sub === s.id ? 0 : -1}
              onKeyDown={onTabKey}
              onClick={() => setSub(s.id)}
              className={cn(
                "-mb-px shrink-0 border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                sub === s.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-text",
              )}
            >
              {s.label} <span className="text-xs">({number.format(counts[s.id])})</span>
            </button>
          ))}
        </div>
        {message && (
          <div className="mb-3" role={message.tone === "danger" ? "alert" : "status"}>
            <Notice tone={message.tone}>{message.text}</Notice>
          </div>
        )}
        <div role="tabpanel" id={`${ids}-panel`} aria-labelledby={`${ids}-${sub}`}>
          {sub === "documents" && <ItemsPanel kind="documents" items={data.documents} onUpload={() => setDialog("documents")} reload={reload} onMessage={showMessage} />}
          {sub === "threads" && <ItemsPanel kind="threads" items={data.threads} onUpload={() => setDialog("threads")} reload={reload} onMessage={showMessage} />}
          {sub === "prompts" && <PromptsPanel prompts={data.prompts} categories={data.categories} reload={reload} onMessage={showMessage} />}
          {sub === "categories" && <CategoriesPanel categories={data.categories} reload={reload} onMessage={showMessage} />}
        </div>
      </section>

      {dialog === "documents" && (
        <UploadDialog
          target={data}
          onClose={() => setDialog(null)}
          onSaved={(text, close) => {
            if (close) setDialog(null);
            showMessage(text);
            void reload();
          }}
        />
      )}
      {dialog === "threads" && (
        <ThreadDialog
          target={data}
          onClose={() => setDialog(null)}
          onSaved={(text) => {
            setDialog(null);
            showMessage(text);
            void reload();
          }}
        />
      )}
    </div>
  );
}
