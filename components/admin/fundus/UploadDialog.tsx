"use client";
// Dokumente hochladen: auswählen oder ablegen, hochladen (Fortschritt je Datei), prüfen, Angaben setzen, speichern.
import { AlertTriangle, ChevronDown, ChevronUp, Loader2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import type { CheckedDocument } from "@/lib/fundus/upload";
import { LIBRARY_TAGS } from "@/lib/library/types";
import { FUNDUS_LIMITS, fundusFileProblem, titleFromFileName } from "@/lib/shared/fundus";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/components/ui/cn";
import { TYPE_STYLE } from "@/components/chat/library/Previews";
import { Notice } from "../fields";
import {
  ConfirmReal,
  EMPTY_META,
  errorText,
  MetaFields,
  metaPayload,
  number,
  plural,
  PreviewBody,
  today,
  uploadMany,
  type MetaValue,
  type Staged,
  type UploadTarget,
} from "./shared";

interface Entry extends Staged {
  checking: boolean;
  checked: CheckedDocument | null;
  title: string;
  /** Eigene Angaben statt der gemeinsamen. */
  own: MetaValue | null;
  open: boolean;
}

const ACCEPT = ".docx,.xlsx,.pptx,.pdf";

/** `onSaved(meldung, schließen)`: Sind Dateien mit Fehler übrig, bleibt der Dialog offen. */
export function UploadDialog({ target, onClose, onSaved }: { target: UploadTarget; onClose: () => void; onSaved: (message: string, close: boolean) => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [shared, setShared] = useState<MetaValue>({ ...EMPTY_META, date: today() });
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const busy = useRef(false);
  const uid = useRef(0);
  const abort = useRef(new AbortController());
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => abort.current.abort(), []);

  const update = (id: number, patch: Partial<Entry>) => setEntries((list) => list.map((e) => (e.uid === id ? { ...e, ...patch } : e)));

  const check = async (s: Staged & { key: string }) => {
    update(s.uid, { checking: true });
    try {
      const { documents } = await api<{ documents: CheckedDocument[] }>("/api/admin/fundus/check", {
        method: "POST",
        json: { kind: "documents", files: [{ key: s.key, name: s.file.name }] },
        admin: true,
        signal: abort.current.signal,
      });
      const checked = documents[0];
      update(s.uid, { checking: false, checked, title: checked.title, error: checked.ok ? null : (checked.error ?? "Die Datei konnte nicht gelesen werden.") });
    } catch (err) {
      if (abort.current.signal.aborted) return;
      update(s.uid, { checking: false, error: errorText(err, "Prüfen fehlgeschlagen") });
    }
  };

  const add = (files: File[]) => {
    setNotice(null);
    const room = FUNDUS_LIMITS.filesPerUpload - entries.length;
    if (files.length > room) setNotice(`Höchstens ${FUNDUS_LIMITS.filesPerUpload} Dateien auf einmal – ${plural(files.length - Math.max(0, room), "Datei bleibt", "Dateien bleiben")} weg.`);
    const fresh: Entry[] = files.slice(0, Math.max(0, room)).map((file) => {
      const problem = fundusFileProblem(file.name, file.size, "document");
      return { uid: ++uid.current, file, progress: 0, key: null, error: problem, checking: false, checked: null, title: titleFromFileName(file.name), own: null, open: false };
    });
    setEntries((list) => [...list, ...fresh]);
    const ok = fresh.filter((e) => !e.error);
    if (ok.length) void uploadMany(ok, target, update, abort.current.signal, (s) => void check(s));
  };

  // Gleiche Datei zweimal in derselben Auswahl: nur die erste zählt.
  const firstBySha = new Map<string, number>();
  for (const e of entries) if (e.checked?.sha256 && !firstBySha.has(e.checked.sha256)) firstBySha.set(e.checked.sha256, e.uid);
  const problemOf = (e: Entry): string | null => {
    if (e.error) return e.error;
    if (e.checked?.duplicateOf) return `Gibt es schon im Fundus als „${e.checked.duplicateOf}“.`;
    if (e.checked?.sha256 && firstBySha.get(e.checked.sha256) !== e.uid) return "Diese Datei ist schon in der Auswahl.";
    if (e.checked?.ok && !e.title.trim()) return "Titel: darf nicht leer sein";
    return null;
  };
  const pending = entries.filter((e) => !e.error && !e.checked);
  const ready = entries.filter((e) => e.checked?.ok && !problemOf(e));

  const save = async () => {
    if (busy.current || !ready.length) return;
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      const files = ready.map((e) => ({ key: e.key!, name: e.file.name, ...metaPayload({ ...(e.own ?? shared), title: e.title }) }));
      const result = await api<{ saved: string[]; failed: { name: string; error: string }[] }>("/api/admin/fundus/documents", {
        method: "POST",
        json: { confirmed, files },
        admin: true,
      });
      const failed = new Map(result.failed.map((f) => [f.name, f.error]));
      const done = plural(result.saved.length, "Datei gespeichert", "Dateien gespeichert");
      if (!failed.size) {
        onSaved(`${done}.`, true);
        return;
      }
      // Fehlerhafte bleiben mit Meldung stehen, gespeicherte verschwinden aus der Liste.
      const sent = new Set(ready.map((e) => e.uid));
      setEntries((list) =>
        list
          .filter((e) => !sent.has(e.uid) || failed.has(e.file.name))
          .map((e) => (sent.has(e.uid) && failed.has(e.file.name) ? { ...e, error: failed.get(e.file.name)! } : e)),
      );
      setNotice(result.saved.length ? `${done}; ${plural(failed.size, "Datei", "Dateien")} mit Fehler.` : null);
      if (result.saved.length) onSaved(`${done}.`, false);
    } catch (err) {
      setError(errorText(err, "Speichern fehlgeschlagen"));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title="Dokumente hochladen" className="w-[min(860px,calc(100vw-2rem))]">
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            add([...e.dataTransfer.files]);
          }}
          data-testid="ablage"
          className={cn("rounded-2xl border-2 border-dashed p-5 text-center text-sm", dragging ? "border-primary bg-primary-soft" : "border-border")}
        >
          <p className="font-medium">Dateien hierher ziehen oder auswählen</p>
          <p className="mt-1 text-xs text-muted">
            Word (.docx), Excel (.xlsx), PowerPoint (.pptx) und PDF · bis zu {FUNDUS_LIMITS.filesPerUpload} Dateien, je höchstens{" "}
            {FUNDUS_LIMITS.fileBytes / 1024 / 1024} MB
          </p>
          <input
            ref={input}
            type="file"
            multiple
            accept={ACCEPT}
            aria-label="Dateien für den Fundus auswählen"
            className="sr-only"
            onChange={(e) => {
              add([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
          <Button className="mt-3" size="sm" onClick={() => input.current?.click()}>
            <Upload className="h-4 w-4" /> Dateien auswählen
          </Button>
        </div>

        {notice && <Notice tone="warning">{notice}</Notice>}

        {entries.length > 0 && (
          <ul aria-label="Ausgewählte Dateien" className="space-y-2">
            {entries.map((e) => (
              <EntryRow
                key={e.uid}
                entry={e}
                problem={problemOf(e)}
                onTitle={(title) => update(e.uid, { title })}
                onToggle={() => update(e.uid, { open: !e.open })}
                onOwn={(own) => update(e.uid, { own })}
                shared={shared}
                onRemove={() => setEntries((list) => list.filter((x) => x.uid !== e.uid))}
              />
            ))}
          </ul>
        )}

        {entries.length > 0 && (
          <section aria-label="Angaben für alle Dateien" className="rounded-2xl border border-border p-4">
            <h3 className="mb-1 font-semibold">Angaben für alle Dateien</h3>
            <p className="mb-3 text-xs text-muted">Verwaltung: „Eigene Inhalte“. Je Datei lassen sich Titel und Angaben überschreiben.</p>
            <MetaFields value={shared} onChange={setShared} withTitle={false} />
          </section>
        )}
        {entries.length > 0 && <ConfirmReal checked={confirmed} onChange={setConfirmed} files="Die Dateien" />}
        {error && <Notice tone="danger">{error}</Notice>}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        {pending.length > 0 && (
          <span className="mr-auto inline-flex items-center gap-2 text-sm text-muted" role="status">
            <Loader2 className="h-4 w-4 animate-spin" /> {plural(pending.length, "Datei wird", "Dateien werden")} hochgeladen und geprüft …
          </span>
        )}
        <Button variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button variant="primary" disabled={!ready.length || !confirmed || saving || pending.length > 0} onClick={() => void save()}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Speichern ({plural(ready.length, "Datei", "Dateien")})
        </Button>
      </div>
    </Dialog>
  );
}

function EntryRow({
  entry: e,
  problem,
  shared,
  onTitle,
  onToggle,
  onOwn,
  onRemove,
}: {
  entry: Entry;
  problem: string | null;
  shared: MetaValue;
  onTitle: (t: string) => void;
  onToggle: () => void;
  onOwn: (m: MetaValue | null) => void;
  onRemove: () => void;
}) {
  const c = e.checked;
  const style = c?.type ? TYPE_STYLE[c.type] : null;
  const status = problem
    ? null
    : !e.key
      ? `Lädt hoch … ${Math.round(e.progress * 100)} %`
      : e.checking || !c
        ? "Wird geprüft …"
        : `${style?.label} · ca. ${number.format(c.tokens ?? 0)} Tokens · ${c.length ? LIBRARY_TAGS[c.length] : ""}`;
  return (
    <li data-datei={e.file.name} className={cn("rounded-2xl border p-3", problem ? "border-danger/40 bg-danger-soft/40" : "border-border")}>
      <div className="flex items-start gap-3">
        {style ? <style.Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color: style.color }} aria-hidden /> : <span className="h-5 w-5 shrink-0" />}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{e.file.name}</p>
          {problem ? (
            <p role="alert" className="text-sm text-danger">
              {problem}
            </p>
          ) : (
            <p className="text-xs text-muted">{status}</p>
          )}
          {!e.key && !e.error && (
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-3" aria-hidden>
              <div className="h-full bg-primary transition-all" style={{ width: `${Math.round(e.progress * 100)}%` }} />
            </div>
          )}
        </div>
        <Button size="sm" variant="ghost" aria-label={`„${e.file.name}“ entfernen`} title="Entfernen" onClick={onRemove}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      {c?.ok && (
        <div className="mt-2 space-y-2 pl-8">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-medium text-muted">Titel</span>
            <input
              className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-primary"
              value={e.title}
              maxLength={FUNDUS_LIMITS.title}
              onChange={(ev) => onTitle(ev.target.value)}
              aria-label={`Titel für „${e.file.name}“`}
            />
          </label>
          {c.hints.length > 0 && (
            <ul className="space-y-1 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning" aria-label="Hinweise">
              {c.hints.map((h) => (
                <li key={h} className="flex items-start gap-1.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {h}
                </li>
              ))}
            </ul>
          )}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" aria-expanded={e.open} onClick={onToggle}>
              {e.open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} Vorschau
            </Button>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-[var(--primary)]" checked={Boolean(e.own)} onChange={(ev) => onOwn(ev.target.checked ? { ...shared } : null)} />
              Eigene Angaben für diese Datei
            </label>
          </div>
          {e.own && (
            <div className="rounded-xl border border-border p-3">
              <MetaFields value={e.own} onChange={onOwn} withTitle={false} />
            </div>
          )}
          {e.open && c.preview && (
            <div className="max-h-[50vh] overflow-y-auto rounded-xl bg-surface-2 p-3">
              <PreviewBody preview={c.preview} />
            </div>
          )}
        </div>
      )}
    </li>
  );
}
