"use client";
// E-Mail-Verlauf hochladen: mehrere .eml-Dateien eines Vorgangs, nach Datum sortiert, Titel aus dem Betreff.
import { AlertTriangle, Loader2, Paperclip, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import type { CheckedThread } from "@/lib/fundus/upload";
import { FUNDUS_LIMITS, fundusFileProblem } from "@/lib/shared/fundus";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/components/ui/cn";
import { formatMailDate } from "@/components/chat/library/Previews";
import { Notice } from "../fields";
import { ConfirmReal, EMPTY_META, errorText, MetaFields, metaPayload, plural, uploadMany, type MetaValue, type Staged, type UploadTarget } from "./shared";

const size = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`);

export function ThreadDialog({ target, onClose, onSaved }: { target: UploadTarget; onClose: () => void; onSaved: (message: string) => void }) {
  const [files, setFiles] = useState<Staged[]>([]);
  const [checked, setChecked] = useState<CheckedThread | null>(null);
  const [checking, setChecking] = useState(false);
  const [meta, setMeta] = useState<MetaValue>(EMPTY_META);
  const titleTouched = useRef(false);
  const [confirmed, setConfirmed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragging, setDragging] = useState(false);
  const busy = useRef(false);
  const uid = useRef(0);
  const abort = useRef(new AbortController());
  const input = useRef<HTMLInputElement>(null);
  const checkRun = useRef(0);
  // Spiegel des Zustands für die Prüfung nach dem Hochladen (läuft außerhalb des Renderns).
  const current = useRef<Staged[]>([]);

  useEffect(() => () => abort.current.abort(), []);

  const change = (fn: (list: Staged[]) => Staged[]) => {
    current.current = fn(current.current);
    setFiles(current.current);
  };

  const uploaded = files.filter((f) => f.key && !f.error);
  const uploading = files.filter((f) => !f.key && !f.error);

  /** Prüft alle hochgeladenen Mails neu (Reihenfolge, Titel, Dubletten) – nach dem Hochladen und nach dem Entfernen. */
  const recheck = () => {
    const list = current.current;
    if (list.some((f) => !f.key && !f.error)) return;
    const refs = list.filter((f) => f.key && !f.error).map((f) => ({ key: f.key!, name: f.file.name }));
    const run = ++checkRun.current;
    if (!refs.length) {
      setChecked(null);
      setChecking(false);
      return;
    }
    setChecking(true);
    api<{ thread: CheckedThread }>("/api/admin/fundus/check", { method: "POST", json: { kind: "thread", files: refs }, admin: true, signal: abort.current.signal })
      .then(({ thread }) => {
        if (run !== checkRun.current) return;
        setChecked(thread);
        setError(null);
        setMeta((m) => (titleTouched.current ? m : { ...m, title: thread.title }));
      })
      .catch((err: unknown) => run === checkRun.current && !abort.current.signal.aborted && setError(errorText(err, "Prüfen fehlgeschlagen")))
      .finally(() => run === checkRun.current && setChecking(false));
  };

  const update = (id: number, patch: Partial<Staged>) => change((list) => list.map((f) => (f.uid === id ? { ...f, ...patch } : f)));

  const remove = (id: number) => {
    change((list) => list.filter((x) => x.uid !== id));
    recheck();
  };

  const add = (picked: File[]) => {
    setNotice(null);
    const room = FUNDUS_LIMITS.mailsPerThread - current.current.length;
    if (picked.length > room) setNotice(`Höchstens ${FUNDUS_LIMITS.mailsPerThread} Mails je Verlauf – ${plural(picked.length - Math.max(0, room), "Datei bleibt", "Dateien bleiben")} weg.`);
    const fresh: Staged[] = picked.slice(0, Math.max(0, room)).map((file) => ({ uid: ++uid.current, file, progress: 0, key: null, error: fundusFileProblem(file.name, file.size, "mail") }));
    change((list) => [...list, ...fresh]);
    const ok = fresh.filter((f) => !f.error);
    if (ok.length) void uploadMany(ok, target, update, abort.current.signal).then(recheck);
  };

  const save = async () => {
    if (busy.current || !checked?.ok) return;
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      const { date, ...rest } = metaPayload(meta);
      const result = await api<{ id: string; mails: number; attachments: number }>("/api/admin/fundus/threads", {
        method: "POST",
        json: { confirmed, files: uploaded.map((f) => ({ key: f.key, name: f.file.name })), ...rest, ...(date ? { date } : {}) },
        admin: true,
      });
      onSaved(
        `Verlauf „${meta.title.trim()}“ mit ${plural(result.mails, "E-Mail", "E-Mails")}${result.attachments ? ` und ${plural(result.attachments, "Anhang", "Anhängen")}` : ""} gespeichert.`,
      );
    } catch (err) {
      setError(errorText(err, "Speichern fehlgeschlagen"));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const byKey = new Map(files.map((f) => [f.key, f]));
  const usable = checked?.mails.filter((m) => m.ok && !m.duplicateOf).length ?? 0;
  return (
    <Dialog open onClose={onClose} title="E-Mail-Verlauf hochladen" className="w-[min(860px,calc(100vw-2rem))]">
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
          className={cn("rounded-2xl border-2 border-dashed p-5 text-center text-sm", dragging ? "border-primary bg-primary-soft" : "border-border")}
        >
          <p className="font-medium">Die .eml-Dateien eines Vorgangs hierher ziehen oder auswählen</p>
          <p className="mt-1 text-xs text-muted">
            In Outlook: Mail öffnen › Datei › Speichern unter › „Outlook-Nachricht (.eml)“ bzw. per Ziehen aus der Liste. Bis zu{" "}
            {FUNDUS_LIMITS.mailsPerThread} Mails, zusammen höchstens {FUNDUS_LIMITS.threadBytes / 1024 / 1024} MB. Freebie sortiert nach Datum.
          </p>
          <input
            ref={input}
            type="file"
            multiple
            accept=".eml,message/rfc822"
            aria-label="E-Mails für den Verlauf auswählen"
            className="sr-only"
            onChange={(e) => {
              add([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
          <Button className="mt-3" size="sm" onClick={() => input.current?.click()}>
            <Upload className="h-4 w-4" /> E-Mails auswählen
          </Button>
        </div>

        {notice && <Notice tone="warning">{notice}</Notice>}

        {files.some((f) => f.error || !f.key) && (
          <ul aria-label="Dateien" className="space-y-1">
            {files
              .filter((f) => f.error || !f.key)
              .map((f) => (
                <li key={f.uid} className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{f.file.name}</span>
                  {f.error ? (
                    <span role="alert" className="text-danger">
                      {f.error}
                    </span>
                  ) : (
                    <span className="text-muted">Lädt hoch … {Math.round(f.progress * 100)} %</span>
                  )}
                  <Button size="sm" variant="ghost" aria-label={`„${f.file.name}“ entfernen`} onClick={() => remove(f.uid)}>
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
          </ul>
        )}

        {checking && (
          <p className="inline-flex items-center gap-2 text-sm text-muted" role="status">
            <Loader2 className="h-4 w-4 animate-spin" /> Verlauf wird geprüft …
          </p>
        )}

        {checked && (
          <section aria-label="Verlauf prüfen" className="space-y-3">
            {checked.error && <Notice tone="danger">{checked.error}</Notice>}
            {checked.hints.length > 0 && (
              <ul className="space-y-1 rounded-xl border border-warning/30 bg-warning-soft px-3 py-2 text-xs text-warning" aria-label="Hinweise">
                {checked.hints.map((h) => (
                  <li key={h} className="flex items-start gap-1.5">
                    <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {h}
                  </li>
                ))}
              </ul>
            )}
            {checked.participants.length > 0 && <p className="text-xs text-muted">Beteiligte: {checked.participants.join(", ")}</p>}
            <ol aria-label="E-Mails in Reihenfolge" className="space-y-2">
              {checked.mails.map((m) => {
                const problem = m.error ?? (m.duplicateOf ? `Doppelt (wie „${m.duplicateOf}“) – wird nicht übernommen.` : null);
                return (
                  <li key={m.key} data-mail={m.name} className={cn("rounded-2xl border p-3 text-sm", problem ? "border-danger/40 bg-danger-soft/40" : "border-border")}>
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium break-words">{m.subject || "(Kein Betreff)"}</p>
                        <p className="text-xs text-muted">
                          {m.from.name || m.from.email} · {m.date ? formatMailDate(m.date) : "ohne Datum"} · {m.name} ({size(m.size)})
                        </p>
                        {problem && (
                          <p role="alert" className="mt-1 text-danger">
                            {problem}
                          </p>
                        )}
                        {m.attachments.length > 0 && (
                          <ul className="mt-1 flex flex-wrap gap-1.5" aria-label="Anhänge">
                            {m.attachments.map((a) => (
                              <li key={a.name} className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-2 py-0.5 text-xs">
                                <Paperclip className="h-3 w-3" aria-hidden /> {a.name} ({size(a.size)}) –{" "}
                                {a.supported ? "wird Dokument des Verlaufs" : "nur in der Mail genannt"}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        aria-label={`„${m.name}“ entfernen`}
                        onClick={() => {
                          const f = byKey.get(m.key);
                          if (f) remove(f.uid);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </section>
        )}

        {checked?.ok && (
          <section aria-label="Angaben zum Verlauf" className="rounded-2xl border border-border p-4">
            <h3 className="mb-3 font-semibold">Angaben zum Verlauf</h3>
            <MetaFields
              value={meta}
              onChange={(m) => {
                if (m.title !== meta.title) titleTouched.current = true;
                setMeta(m);
              }}
              dateOptional
            />
          </section>
        )}
        {checked?.ok && <ConfirmReal checked={confirmed} onChange={setConfirmed} files="Die E-Mails und ihre Anhänge" />}
        {error && <Notice tone="danger">{error}</Notice>}
      </div>
      <div className="mt-4 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button
          variant="primary"
          disabled={!checked?.ok || !confirmed || saving || checking || uploading.length > 0 || !meta.title.trim()}
          onClick={() => void save()}
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} Verlauf speichern ({plural(usable, "E-Mail", "E-Mails")})
        </Button>
      </div>
    </Dialog>
  );
}
