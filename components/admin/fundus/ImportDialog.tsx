"use client";
// Prompt-Bibliothek importieren (Plan: PROMPT-IMPORT-PLAN.md): JSON-Datei wählen, sofort prüfen (ohne zu speichern),
// Kategorie wählen oder neu anlegen, importieren. Der Server prüft dieselben Regeln noch einmal.
import { AlertTriangle, Check, ChevronDown, ChevronUp, Copy, Download, FileJson, Loader2, Upload, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { api } from "@/lib/client/api";
import { downloadText } from "@/lib/client/export";
import { fold } from "@/lib/library/search";
import { FUNDUS_LIMITS, type AdminPrompt, type AdminPromptCategory } from "@/lib/shared/fundus";
import { resolvePlaceholders } from "@/lib/shared/placeholders";
import {
  decodePromptFile,
  entryStates,
  MUSTER_FILE_NAME,
  parsePromptJson,
  PLACEHOLDER_STYLES,
  PROMPT_FILE,
  PROMPT_MUSTER,
  promptFileText,
  readPromptLibrary,
  type EntryState,
  type ImportEntry,
  type PlaceholderStyle,
} from "@/lib/shared/prompt-import";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/components/ui/cn";
import { PromptText } from "@/components/chat/library/PromptFill";
import { Field, inputClass, Notice } from "../fields";
import { ConfirmReal, errorText, number, plural } from "./shared";

const NEW = "__neu__";

interface ImportResponse {
  ok: true;
  categoryId: string | null;
  categoryName: string;
  created: number;
  skipped: { title: string; reason: string }[];
}

export function downloadMuster() {
  downloadText(promptFileText(PROMPT_MUSTER), MUSTER_FILE_NAME, "application/json");
}

/** Vorschlag für den Namen einer neuen Kategorie: „name“ aus der Datei, sonst der Dateiname. */
function suggestedName(fromFile: string, fileName: string): string {
  if (fromFile) return fromFile;
  return fileName
    .replace(/\.json$/i, "")
    .replace(/^freebie-prompts-?/i, "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, FUNDUS_LIMITS.categoryName);
}

export function ImportDialog({
  prompts,
  categories,
  onClose,
  onImported,
}: {
  prompts: AdminPrompt[];
  categories: AdminPromptCategory[];
  onClose: () => void;
  onImported: (message: string) => void;
}) {
  const [file, setFile] = useState<{ name: string; size: number } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [data, setData] = useState<unknown>(undefined);
  const [style, setStyle] = useState<PlaceholderStyle>("doppelt");
  const [target, setTarget] = useState<string>(categories.length >= FUNDUS_LIMITS.categories ? (categories[0]?.id ?? NEW) : NEW);
  const [newName, setNewName] = useState("");
  const [inactive, setInactive] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [reading, setReading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const busy = useRef(false);
  const input = useRef<HTMLInputElement>(null);

  const report = useMemo(() => (data === undefined ? null : readPromptLibrary(data, style)), [data, style]);
  const existingTitles = useMemo(() => (target === NEW ? [] : prompts.filter((p) => p.categoryId === target).map((p) => p.title)), [prompts, target]);
  const states: EntryState[] = useMemo(() => (report ? entryStates(report.entries, existingTitles) : []), [report, existingTitles]);
  const ready = report ? report.entries.filter((_, i) => states[i]?.state === "bereit") : [];
  const duplicates = states.filter((s) => s.state === "doppelt").length;
  const failed = states.filter((s) => s.state === "fehler").length;

  const free = Math.max(0, FUNDUS_LIMITS.prompts - prompts.length);
  const tooMany = ready.length > free;
  const name = newName.replace(/\s+/g, " ").trim();
  const nameProblem =
    target !== NEW
      ? null
      : !name
        ? "Bitte einen Namen für die neue Kategorie angeben."
        : name.length > FUNDUS_LIMITS.categoryName
          ? `Name: höchstens ${FUNDUS_LIMITS.categoryName} Zeichen`
          : categories.some((c) => fold(c.name).replace(/\s+/g, " ").trim() === fold(name))
            ? `Die Kategorie „${name}“ gibt es schon – wähle sie oben aus.`
            : null;

  const read = async (files: File[]) => {
    if (!files.length) return;
    setError(null);
    setOpen(new Set());
    setConfirmed(false);
    const f = files[0];
    setFile({ name: f.name, size: f.size });
    setData(undefined);
    setFileError(files.length > 1 ? "Bitte nur eine Datei wählen – gelesen wird die erste." : null);
    if (f.size > PROMPT_FILE.maxBytes) {
      setFileError(`Die Datei ist zu groß (höchstens ${PROMPT_FILE.maxBytes / 1024 / 1024} MB).`);
      return;
    }
    setReading(true);
    try {
      const decoded = decodePromptFile(new Uint8Array(await f.arrayBuffer()));
      if ("error" in decoded) return setFileError(decoded.error);
      const parsed = parsePromptJson(decoded.text);
      if ("error" in parsed) return setFileError(parsed.error);
      setData(parsed.data);
      const suggestion = suggestedName(readPromptLibrary(parsed.data).name, f.name);
      setNewName(suggestion);
    } catch {
      setFileError("Die Datei ließ sich nicht lesen.");
    } finally {
      setReading(false);
    }
  };

  const save = async () => {
    if (busy.current || !report) return;
    busy.current = true;
    setSaving(true);
    setError(null);
    try {
      const res = await api<ImportResponse>("/api/admin/fundus/prompts/import", {
        method: "POST",
        admin: true,
        json: {
          prompts: ready.map((e) => e.fields!),
          categoryId: target === NEW ? null : target,
          newCategory: target === NEW ? name : null,
          inactive,
          confirmed,
        },
      });
      const skipped = res.skipped.length + duplicates + failed;
      onImported(
        res.created === 0
          ? `Nichts importiert – die Prompts gibt es in „${res.categoryName}“ schon.`
          : `${plural(res.created, "Prompt", "Prompts")} in „${res.categoryName}“ importiert${skipped ? `, ${number.format(skipped)} übersprungen` : ""}.`,
      );
    } catch (err) {
      setError(errorText(err, "Import fehlgeschlagen"));
    } finally {
      busy.current = false;
      setSaving(false);
    }
  };

  const toggle = (i: number) =>
    setOpen((s) => {
      const next = new Set(s);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const canImport = Boolean(report && !report.error) && ready.length > 0 && !tooMany && !nameProblem && confirmed && !saving;

  return (
    <Dialog open onClose={onClose} title="Prompts importieren" className="w-[min(860px,calc(100vw-2rem))]">
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
            void read([...e.dataTransfer.files]);
          }}
          data-testid="import-ablage"
          className={cn("rounded-2xl border-2 border-dashed p-5 text-center text-sm", dragging ? "border-primary bg-primary-soft" : "border-border")}
        >
          {file ? (
            <p className="inline-flex items-center gap-2 font-medium">
              <FileJson className="h-4 w-4 text-primary" aria-hidden /> {file.name}{" "}
              <span className="font-normal text-muted">({number.format(Math.max(1, Math.round(file.size / 1024)))} KB)</span>
            </p>
          ) : (
            <p className="font-medium">JSON-Datei hierher ziehen oder auswählen</p>
          )}
          <p className="mt-1 text-xs text-muted">
            Eine Datei im Format der Musterdatei · höchstens {PROMPT_FILE.maxBytes / 1024 / 1024} MB und {number.format(PROMPT_FILE.maxEntries)} Prompts
          </p>
          <input
            ref={input}
            type="file"
            accept=".json,application/json"
            aria-label="Prompt-Bibliothek (JSON) auswählen"
            className="sr-only"
            onChange={(e) => {
              void read([...(e.target.files ?? [])]);
              e.target.value = "";
            }}
          />
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={() => input.current?.click()} disabled={reading}>
              {reading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {file ? "Andere Datei" : "Datei auswählen"}
            </Button>
            <Button size="sm" variant="ghost" onClick={downloadMuster}>
              <Download className="h-4 w-4" /> Muster herunterladen
            </Button>
          </div>
        </div>

        {fileError && (
          <div role="alert">
            <Notice tone="danger">{fileError}</Notice>
          </div>
        )}
        {report?.error && (
          <div role="alert">
            <Notice tone="danger">{report.error}</Notice>
          </div>
        )}

        {report && !report.error && (
          <>
            <Field label="Schreibweise der Platzhalter in der Datei" hint="Andere Schreibweisen werden beim Import zu {{Name}}. Die Vorschau zeigt das Ergebnis.">
              <select className={inputClass} value={style} onChange={(e) => setStyle(e.target.value as PlaceholderStyle)}>
                {PLACEHOLDER_STYLES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                    {s.id === "doppelt" ? " (Freebie)" : ""}
                  </option>
                ))}
              </select>
            </Field>

            <p role="status" className="text-sm font-medium">
              {plural(report.entries.length, "Prompt", "Prompts")} in der Datei: {number.format(ready.length)} {ready.length === 1 ? "wird" : "werden"} importiert
              {duplicates > 0 && `, ${number.format(duplicates)} gibt es schon`}
              {failed > 0 && `, ${number.format(failed)} ${failed === 1 ? "hat" : "haben"} Fehler`}.
            </p>
            {report.hints.map((h) => (
              <Notice key={h} tone="info">
                {h}
              </Notice>
            ))}

            <ul aria-label="Prompts in der Datei" className="divide-y divide-border rounded-2xl border border-border">
              {report.entries.map((e, i) => (
                <EntryRow key={e.index} entry={e} state={states[i]} open={open.has(i)} onToggle={() => toggle(i)} />
              ))}
            </ul>

            <section aria-label="Ziel" className="space-y-3 rounded-2xl border border-border p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Kategorie">
                  <select className={inputClass} value={target} onChange={(e) => setTarget(e.target.value)}>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({number.format(c.prompts)})
                      </option>
                    ))}
                    <option value={NEW} disabled={categories.length >= FUNDUS_LIMITS.categories}>
                      Neue Kategorie …
                    </option>
                  </select>
                </Field>
                {target === NEW && (
                  <Field label="Name der neuen Kategorie">
                    <input
                      className={inputClass}
                      value={newName}
                      maxLength={FUNDUS_LIMITS.categoryName * 2}
                      aria-invalid={Boolean(nameProblem) || undefined}
                      onChange={(e) => setNewName(e.target.value)}
                    />
                  </Field>
                )}
              </div>
              {nameProblem && name && <p className="text-sm text-danger">{nameProblem}</p>}
              <label className="flex items-start gap-2 text-sm">
                <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--primary)]" checked={inactive} onChange={(e) => setInactive(e.target.checked)} />
                <span>
                  Alle zunächst inaktiv importieren <span className="block text-xs text-muted">Teilnehmende sehen sie erst, wenn du sie einschaltest.</span>
                </span>
              </label>
            </section>
            {tooMany && (
              <Notice tone="danger">
                Platz für noch {plural(free, "Prompt", "Prompts")} – die Datei enthält {number.format(ready.length)} importierbare. Bitte aufteilen oder Prompts löschen.
              </Notice>
            )}
            {ready.length > 0 && <ConfirmReal checked={confirmed} onChange={setConfirmed} files="Die Prompts" sent="mit der Nachricht" />}
          </>
        )}
        {error && (
          <div role="alert">
            <Notice tone="danger">{error}</Notice>
          </div>
        )}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button variant="primary" disabled={!canImport} onClick={() => void save()}>
          {saving && <Loader2 className="h-4 w-4 animate-spin" />} {ready.length ? `Importieren (${plural(ready.length, "Prompt", "Prompts")})` : "Importieren"}
        </Button>
      </div>
    </Dialog>
  );
}

const STATE_STYLE = {
  bereit: { Icon: Check, className: "text-success", text: "bereit" },
  doppelt: { Icon: Copy, className: "text-muted", text: "" },
  fehler: { Icon: X, className: "text-danger", text: "" },
} as const;

function EntryRow({ entry: e, state, open, onToggle }: { entry: ImportEntry; state: EntryState | undefined; open: boolean; onToggle: () => void }) {
  if (!state) return null;
  const style = STATE_STYLE[state.state];
  const status = state.state === "bereit" ? "bereit" : state.state === "doppelt" ? `${state.reason} – wird übersprungen` : `Fehler: ${state.reason} – wird übersprungen`;
  const detailsId = `import-eintrag-${e.index}`;
  return (
    <li data-eintrag={e.index} data-zustand={state.state} className="px-3 py-2.5">
      <div className="flex items-start gap-3">
        <style.Icon className={cn("mt-0.5 h-4 w-4 shrink-0", style.className)} aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{e.label}</p>
          <p className={cn("text-xs", state.state === "fehler" ? "text-danger" : "text-muted")}>
            {e.label !== `Eintrag ${e.index + 1}` || e.placeholderCount > 0
              ? `${e.placeholderCount === 0 ? "ohne Platzhalter" : plural(e.placeholderCount, "Platzhalter", "Platzhalter")} · `
              : ""}
            {status}
          </p>
          {e.hints.map((h) => (
            <p key={h} className="mt-0.5 flex items-start gap-1 text-xs text-text">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-warning" aria-hidden /> <span>Hinweis: {h}</span>
            </p>
          ))}
        </div>
        <Button size="sm" variant="ghost" aria-expanded={open} aria-controls={detailsId} onClick={onToggle}>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />} {open ? "Weniger" : "Vorschau"}
        </Button>
      </div>
      {open && (
        <div id={detailsId} className="mt-2 ml-7 rounded-xl bg-surface-2 p-3">
          {e.fields ? (
            <>
              {e.fields.description && <p className="mb-2 text-xs text-muted">{e.fields.description}</p>}
              <PromptText text={e.fields.text} placeholders={resolvePlaceholders(e.fields.text, e.fields.placeholders)} />
            </>
          ) : (
            <ul className="list-disc space-y-0.5 pl-4 text-sm text-danger">
              {e.errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </li>
  );
}
