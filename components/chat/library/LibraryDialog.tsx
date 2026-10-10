"use client";
import { Check, ChevronLeft, Download, Loader2, Paperclip, RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import { libraryFileUrl, loadCatalog, loadPreview } from "@/lib/client/library";
import { EMPTY_FILTER, filterActive, filterDocuments, filterThreads, unitLabel, unitTree, type LibraryFilter } from "@/lib/library/search";
import {
  LEVEL_LABELS,
  LIBRARY_TAGS,
  type LibraryCatalog,
  type LibraryDocType,
  type LibraryDocument,
  type LibraryPreview,
  type LibraryTag,
  type LibraryThread,
} from "@/lib/library/types";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/components/ui/cn";
import { formatMailDate, MailCard, PreviewView, TYPE_STYLE } from "./Previews";

export interface LibraryPick {
  id: string;
  name: string;
}

type Tab = "docs" | "mails";

const DOC_TYPES: LibraryDocType[] = ["word", "excel", "powerpoint"];
const number = new Intl.NumberFormat("de-DE");
const day = (iso: string) => iso.slice(0, 10).split("-").reverse().join(".");
const plural = (n: number, one: string, many: string) => `${number.format(n)} ${n === 1 ? one : many}`;

function sizeLabel(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

/**
 * Fundus: erfundene Dokumente und E-Mails aus Verwaltungen zum Anhängen.
 * Der Zustand (Reiter, Filter, Auswahl) bleibt beim Schließen erhalten, bis die Seite neu geladen wird.
 */
export function LibraryDialog({
  open,
  onClose,
  attachedIds,
  freeSlots,
  onAttach,
}: {
  open: boolean;
  onClose: () => void;
  /** Bereits angehängte Fundus-Einträge (werden markiert und nicht doppelt angehängt). */
  attachedIds: string[];
  /** Freie Plätze bis zur Grenze von Anhängen je Nachricht. */
  freeSlots: number;
  onAttach: (items: LibraryPick[]) => void;
}) {
  const [catalog, setCatalog] = useState<LibraryCatalog | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("docs");
  const [docFilter, setDocFilter] = useState<LibraryFilter>(EMPTY_FILTER);
  const [mailFilter, setMailFilter] = useState<LibraryFilter>(EMPTY_FILTER);
  const [selected, setSelected] = useState<string[]>([]);
  const [activeDoc, setActiveDoc] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [detail, setDetail] = useState(false);
  const [withAttachments, setWithAttachments] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const fetchCatalog = useCallback(() => {
    loadCatalog()
      .then((c) => {
        setCatalog(c);
        setLoadError(null);
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : "Unbekannter Fehler"));
  }, []);

  useEffect(() => {
    if (open && !catalog) fetchCatalog();
  }, [open, catalog, fetchCatalog]);

  const retry = () => {
    setLoadError(null);
    fetchCatalog();
  };

  const close = () => {
    setNotice(null);
    onClose();
  };

  const attached = useMemo(() => new Set(attachedIds), [attachedIds]);
  // Ausgewählt, aber inzwischen angehängt (z. B. per Vorschau): aus der Auswahl nehmen.
  const selection = selected.filter((id) => !attached.has(id));

  const finish = (items: LibraryPick[]) => {
    const fresh = items.filter((it, i) => !attached.has(it.id) && items.findIndex((x) => x.id === it.id) === i);
    if (!fresh.length) return;
    if (fresh.length > freeSlots) {
      setNotice(freeSlots > 0 ? `Es sind nur noch ${plural(freeSlots, "Anhang", "Anhänge")} möglich.` : "Es sind keine weiteren Anhänge möglich.");
      return;
    }
    onAttach(fresh);
    setSelected([]);
    setDetail(false);
    close();
  };

  const docPick = (id: string): LibraryPick | null => {
    const d = catalog?.documents.find((x) => x.id === id);
    return d ? { id: d.id, name: d.fileName } : null;
  };

  const toggle = (id: string) => {
    if (attached.has(id)) return;
    if (selection.includes(id)) {
      setSelected(selection.filter((x) => x !== id));
      setNotice(null);
    } else if (selection.length >= freeSlots) {
      setNotice(freeSlots > 0 ? `Es sind nur noch ${plural(freeSlots, "Anhang", "Anhänge")} möglich.` : "Es sind keine weiteren Anhänge möglich.");
    } else {
      setSelected([...selection, id]);
      setNotice(null);
    }
  };

  const attachSelection = () => finish(selection.map(docPick).filter((x): x is LibraryPick => Boolean(x)));

  const tabsId = useId();
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "docs", label: "Dokumente", count: catalog?.documents.length ?? 0 },
    { key: "mails", label: "E-Mails", count: catalog?.threads.length ?? 0 },
  ];
  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const next: Tab = e.key === "Home" ? "docs" : e.key === "End" ? "mails" : tab === "docs" ? "mails" : "docs";
    setTab(next);
    setDetail(false);
    document.getElementById(`${tabsId}-${next}`)?.focus();
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title="Fundus"
      className="w-[min(1160px,calc(100vw-2rem))] max-sm:h-dvh max-sm:max-h-none max-sm:w-screen max-sm:max-w-none max-sm:rounded-none"
      bodyClassName="max-sm:p-4"
    >
      <div className="flex h-[min(78vh,820px)] flex-col max-sm:h-[calc(100dvh-6rem)]">
        <p className="-mt-2 mb-3 text-sm text-muted">Erfundene Dateien und E-Mails aus Verwaltungen – zum Üben, ohne echte Daten.</p>
        <div role="tablist" aria-label="Fundus" className="mb-3 flex gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              id={`${tabsId}-${t.key}`}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              aria-controls={`${tabsId}-${t.key}-panel`}
              tabIndex={tab === t.key ? 0 : -1}
              onKeyDown={onTabKey}
              onClick={() => {
                setTab(t.key);
                setDetail(false);
              }}
              className={cn(
                "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
                tab === t.key ? "border-primary text-primary" : "border-transparent text-muted hover:text-text",
              )}
            >
              {t.label}
              {catalog && <span className="ml-1.5 text-xs opacity-80"> ({t.count})</span>}
            </button>
          ))}
        </div>

        <div role="tabpanel" id={`${tabsId}-${tab}-panel`} aria-labelledby={`${tabsId}-${tab}`} className="flex min-h-0 flex-1 flex-col">
          {!catalog ? (
            <div className="grid flex-1 place-items-center text-center text-sm text-muted">
              {loadError ? (
                <div role="alert" className="space-y-3">
                  <p className="text-danger">Der Fundus konnte nicht geladen werden: {loadError}</p>
                  <Button variant="secondary" size="sm" onClick={retry}>
                    <RotateCcw className="h-4 w-4" /> Erneut versuchen
                  </Button>
                </div>
              ) : (
                <p className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> Fundus wird geladen …
                </p>
              )}
            </div>
          ) : tab === "docs" ? (
            <DocumentsPanel
              catalog={catalog}
              filter={docFilter}
              onFilter={setDocFilter}
              selection={selection}
              attached={attached}
              active={activeDoc}
              onActive={(id) => {
                setActiveDoc(id);
                setDetail(true);
              }}
              onToggle={toggle}
              onAttachOne={(id) => {
                const pick = docPick(id);
                if (pick) finish([pick]);
              }}
              onEnter={(id) => (selection.length ? attachSelection() : finish([docPick(id)!]))}
              detail={detail}
              onBack={() => setDetail(false)}
            />
          ) : (
            <MailsPanel
              catalog={catalog}
              filter={mailFilter}
              onFilter={setMailFilter}
              attached={attached}
              active={activeThread}
              onActive={(id) => {
                setActiveThread(id);
                setDetail(true);
              }}
              withAttachments={withAttachments}
              onWithAttachments={setWithAttachments}
              onAttach={finish}
              detail={detail}
              onBack={() => setDetail(false)}
            />
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <p className={cn("text-sm", notice ? "text-warning" : "text-muted")} role="status">
            {notice ??
              (tab === "docs" && selection.length
                ? `${plural(selection.length, "Datei", "Dateien")} ausgewählt`
                : freeSlots > 0
                  ? `Noch ${plural(freeSlots, "Anhang", "Anhänge")} möglich`
                  : "Keine weiteren Anhänge möglich")}
          </p>
          {tab === "docs" && (
            <div className="flex gap-2">
              {selection.length > 0 && (
                <Button variant="ghost" size="sm" onClick={() => setSelected([])}>
                  Auswahl aufheben
                </Button>
              )}
              <Button variant="primary" size="sm" disabled={!selection.length} onClick={attachSelection}>
                <Paperclip className="h-4 w-4" />
                {selection.length === 0
                  ? "Dateien anhängen"
                  : selection.length === 1
                    ? "1 Datei anhängen"
                    : `${number.format(selection.length)} Dateien anhängen`}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}

// ---------------------------------------------------------------- Filter

function FilterBar({
  catalog,
  filter,
  onFilter,
  showTypes,
  count,
  tags,
}: {
  catalog: LibraryCatalog;
  filter: LibraryFilter;
  onFilter: (f: LibraryFilter) => void;
  showTypes: boolean;
  count: string;
  tags: LibraryTag[];
}) {
  const [open, setOpen] = useState(false);
  const org = catalog.orgs.find((o) => o.id === filter.orgId);
  const levels = [...new Set(catalog.orgs.map((o) => o.level))];
  const extra = Number(Boolean(filter.orgId)) + filter.types.length + filter.tags.length;
  const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  return (
    <div className="mb-3 space-y-2">
      <div className="flex gap-2">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={filter.query}
            onChange={(e) => onFilter({ ...filter, query: e.target.value })}
            placeholder="Suchen: Titel, Stichwort, Person …"
            aria-label="Fundus durchsuchen"
            className="h-9 w-full rounded-full border border-border bg-surface pr-3 pl-9 text-sm outline-none focus:border-primary"
          />
        </label>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm md:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden /> Filter{extra ? ` (${extra})` : ""}
        </button>
      </div>
      <div className={cn("flex flex-wrap items-center gap-2", !open && "max-md:hidden")}>
        <select
          aria-label="Verwaltung"
          value={filter.orgId ?? ""}
          onChange={(e) => onFilter({ ...filter, orgId: e.target.value || null, unitId: null })}
          className="h-9 w-full rounded-full border border-border bg-surface px-3 text-sm sm:w-64"
        >
          <option value="">Alle Verwaltungen</option>
          {levels.map((level) => (
            <optgroup key={level} label={LEVEL_LABELS[level]}>
              {catalog.orgs
                .filter((o) => o.level === level)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <select
          aria-label="Organisationseinheit"
          value={filter.unitId ?? ""}
          disabled={!org}
          onChange={(e) => onFilter({ ...filter, unitId: e.target.value || null })}
          className="h-9 w-full rounded-full border border-border bg-surface px-3 text-sm disabled:opacity-50 sm:w-64"
        >
          <option value="">{org ? "Alle Einheiten" : "Erst Verwaltung wählen"}</option>
          {org &&
            unitTree(org).map((u) => (
              <option key={u.id} value={u.id}>
                {"  ".repeat(u.depth)}
                {u.name}
              </option>
            ))}
        </select>
        {showTypes && (
          <div role="group" aria-label="Dateityp" className="flex flex-wrap gap-1">
            {DOC_TYPES.map((t) => (
              <Chip key={t} active={filter.types.includes(t)} onClick={() => onFilter({ ...filter, types: toggleIn(filter.types, t) })}>
                {TYPE_STYLE[t].label}
              </Chip>
            ))}
          </div>
        )}
        <div role="group" aria-label="Merkmale" className="flex flex-wrap gap-1">
          {tags.map((t) => (
            <Chip key={t} active={filter.tags.includes(t)} onClick={() => onFilter({ ...filter, tags: toggleIn(filter.tags, t) })}>
              {LIBRARY_TAGS[t]}
            </Chip>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <span aria-live="polite">{count}</span>
        {filterActive(filter) && (
          <button type="button" onClick={() => onFilter(EMPTY_FILTER)} className="underline hover:text-text">
            Filter zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs transition-colors",
        active ? "border-primary bg-primary-soft text-primary" : "border-border text-muted hover:bg-surface-2 hover:text-text",
      )}
    >
      {active && <Check className="h-3 w-3" aria-hidden />}
      {children}
    </button>
  );
}

function usedTags(items: { tags: LibraryTag[] }[]): LibraryTag[] {
  const present = new Set(items.flatMap((i) => i.tags));
  return (Object.keys(LIBRARY_TAGS) as LibraryTag[]).filter((t) => present.has(t));
}

// ---------------------------------------------------------------- Liste (Listbox mit Tastatur)

function useListKeys<T extends { id: string }>(
  items: T[],
  active: string | null,
  onActive: (id: string) => void,
  extra?: (e: KeyboardEvent, id: string) => boolean,
) {
  const listId = useId();
  const optionId = (id: string) => `${listId}-${id}`;
  const current = items.find((i) => i.id === active)?.id ?? items[0]?.id ?? null;
  const onKeyDown = (e: KeyboardEvent, id: string) => {
    if (extra?.(e, id)) return;
    const index = items.findIndex((i) => i.id === id);
    let next = -1;
    if (e.key === "ArrowDown") next = Math.min(items.length - 1, index + 1);
    else if (e.key === "ArrowUp") next = Math.max(0, index - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    if (next < 0) return;
    e.preventDefault();
    onActive(items[next].id);
    document.getElementById(optionId(items[next].id))?.focus();
  };
  return { optionId, current, onKeyDown };
}

function DocumentsPanel({
  catalog,
  filter,
  onFilter,
  selection,
  attached,
  active,
  onActive,
  onToggle,
  onAttachOne,
  onEnter,
  detail,
  onBack,
}: {
  catalog: LibraryCatalog;
  filter: LibraryFilter;
  onFilter: (f: LibraryFilter) => void;
  selection: string[];
  attached: Set<string>;
  active: string | null;
  onActive: (id: string) => void;
  onToggle: (id: string) => void;
  onAttachOne: (id: string) => void;
  onEnter: (id: string) => void;
  detail: boolean;
  onBack: () => void;
}) {
  const docs = useMemo(() => filterDocuments(catalog, filter), [catalog, filter]);
  const tags = useMemo(() => usedTags(catalog.documents), [catalog]);
  const keys = useListKeys(docs, active, onActive, (e, id) => {
    if (e.key === " ") {
      e.preventDefault();
      onToggle(id);
      return true;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      onEnter(id);
      return true;
    }
    return false;
  });
  const doc = catalog.documents.find((d) => d.id === active) ?? null;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn(detail && doc && "max-md:hidden")}>
        <FilterBar catalog={catalog} filter={filter} onFilter={onFilter} showTypes count={plural(docs.length, "Dokument", "Dokumente")} tags={tags} />
      </div>
      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className={cn("min-h-0 overflow-y-auto rounded-2xl border border-border p-1", detail && doc && "max-md:hidden")}>
          {docs.length === 0 && <p className="p-4 text-sm text-muted">Keine Treffer.</p>}
          <div role="listbox" aria-label="Dokumente" aria-multiselectable="true" hidden={docs.length === 0}>
            {docs.map((d) => {
              const isAttached = attached.has(d.id);
              const checked = selection.includes(d.id);
              const { Icon, color, label } = TYPE_STYLE[d.type];
              const org = catalog.orgs.find((o) => o.id === d.orgId);
              return (
                <div
                  key={d.id}
                  id={keys.optionId(d.id)}
                  data-id={d.id}
                  role="option"
                  aria-selected={checked}
                  aria-disabled={isAttached || undefined}
                  tabIndex={keys.current === d.id ? 0 : -1}
                  onKeyDown={(e) => keys.onKeyDown(e, d.id)}
                  onClick={() => onActive(d.id)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl px-2.5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    active === d.id ? "bg-primary-soft" : "hover:bg-surface-2",
                  )}
                >
                  <span
                    data-role="auswahl"
                    onClick={(e) => {
                      e.stopPropagation();
                      onActive(d.id);
                      onToggle(d.id);
                    }}
                    className={cn(
                      "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border",
                      checked ? "border-primary bg-primary text-primary-contrast" : "border-border-strong bg-surface",
                      isAttached && "opacity-40",
                    )}
                    aria-hidden
                  >
                    {(checked || isAttached) && <Check className="h-3.5 w-3.5" />}
                  </span>
                  <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-label={label} />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium">{d.title}</span>
                    <span className="block truncate text-xs text-muted">
                      {org?.short} · {unitLabel(catalog, d.orgId, d.unitId)}
                    </span>
                    <span className="block text-xs text-muted">
                      {d.kind} · {day(d.date)} · ca. {number.format(d.tokens)} Tokens
                      {isAttached && <span className="ml-1 font-medium text-success">· angehängt</span>}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <section aria-label="Vorschau" className={cn("min-h-0 overflow-y-auto", !(detail && doc) && "max-md:hidden")}>
          {doc ? (
            <DocumentDetail
              catalog={catalog}
              doc={doc}
              attached={attached.has(doc.id)}
              checked={selection.includes(doc.id)}
              onAttach={() => onAttachOne(doc.id)}
              onToggle={() => onToggle(doc.id)}
              onBack={onBack}
            />
          ) : (
            <p className="grid h-full place-items-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
              Wähle links ein Dokument, um die Vorschau zu sehen.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function usePreview(id: string | null): { preview: LibraryPreview | null; error: string | null } {
  const [state, setState] = useState<{ id: string; preview: LibraryPreview | null; error: string | null } | null>(null);
  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    loadPreview(id)
      .then((preview) => !cancelled && setState({ id, preview, error: null }))
      .catch((err: unknown) => !cancelled && setState({ id, preview: null, error: err instanceof Error ? err.message : "Fehler" }));
    return () => {
      cancelled = true;
    };
  }, [id]);
  return state && state.id === id ? { preview: state.preview, error: state.error } : { preview: null, error: null };
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" onClick={onBack} className="mb-2 inline-flex items-center gap-1 text-sm text-primary md:hidden">
      <ChevronLeft className="h-4 w-4" aria-hidden /> Zurück zur Liste
    </button>
  );
}

function DocumentDetail({
  catalog,
  doc,
  attached,
  checked,
  onAttach,
  onToggle,
  onBack,
}: {
  catalog: LibraryCatalog;
  doc: LibraryDocument;
  attached: boolean;
  checked: boolean;
  onAttach: () => void;
  onToggle: () => void;
  onBack: () => void;
}) {
  const { preview, error } = usePreview(doc.id);
  const org = catalog.orgs.find((o) => o.id === doc.orgId)!;
  const { Icon, color, label } = TYPE_STYLE[doc.type];
  return (
    <div>
      <BackButton onBack={onBack} />
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
          <Icon className="h-4 w-4" style={{ color }} aria-hidden /> {label} · {doc.kind}
        </p>
        <h3 className="mt-1 font-display text-lg leading-snug font-semibold">{doc.title}</h3>
        <p className="mt-1 text-sm text-muted">{doc.summary}</p>
        <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-xs">
          <dt className="text-muted">Verwaltung</dt>
          <dd>{org.name}</dd>
          <dt className="text-muted">Einheit</dt>
          <dd>{unitLabel(catalog, doc.orgId, doc.unitId)}</dd>
          <dt className="text-muted">Verfasst von</dt>
          <dd>
            {doc.author.name}
            {doc.author.role ? `, ${doc.author.role}` : ""}
          </dd>
          <dt className="text-muted">Datum</dt>
          <dd>{day(doc.date)}</dd>
          <dt className="text-muted">Datei</dt>
          <dd className="break-all">
            {doc.fileName} ({sizeLabel(doc.size)}, ca. {number.format(doc.tokens)} Tokens)
          </dd>
          <dt className="text-muted">Merkmale</dt>
          <dd>{doc.tags.map((t) => LIBRARY_TAGS[t]).join(", ")}</dd>
        </dl>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="primary" size="sm" onClick={onAttach} disabled={attached}>
            <Paperclip className="h-4 w-4" /> {attached ? "Bereits angehängt" : "Anhängen"}
          </Button>
          {!attached && (
            <Button variant="secondary" size="sm" onClick={onToggle} aria-pressed={checked}>
              {checked ? <Check className="h-4 w-4" /> : null}
              {checked ? "Ausgewählt" : "Zur Auswahl"}
            </Button>
          )}
          <a
            href={libraryFileUrl(doc.id)}
            download={doc.fileName}
            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium hover:bg-surface-2"
          >
            <Download className="h-4 w-4" aria-hidden /> Herunterladen
          </a>
        </div>
      </div>
      <div className="mt-3 rounded-2xl bg-surface-2 p-3 sm:p-4">
        {error ? (
          <p role="alert" className="text-sm text-danger">
            Vorschau nicht verfügbar: {error}
          </p>
        ) : preview ? (
          <PreviewView preview={preview} orgColor={org.color} />
        ) : (
          <p className="inline-flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Vorschau wird geladen …
          </p>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- E-Mails

function MailsPanel({
  catalog,
  filter,
  onFilter,
  attached,
  active,
  onActive,
  withAttachments,
  onWithAttachments,
  onAttach,
  detail,
  onBack,
}: {
  catalog: LibraryCatalog;
  filter: LibraryFilter;
  onFilter: (f: LibraryFilter) => void;
  attached: Set<string>;
  active: string | null;
  onActive: (id: string) => void;
  withAttachments: boolean;
  onWithAttachments: (v: boolean) => void;
  onAttach: (items: LibraryPick[]) => void;
  detail: boolean;
  onBack: () => void;
}) {
  const threads = useMemo(() => filterThreads(catalog, filter), [catalog, filter]);
  const tags = useMemo(() => usedTags(catalog.threads), [catalog]);
  const keys = useListKeys(threads, active, onActive, (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActive(id);
      return true;
    }
    return false;
  });
  const thread = catalog.threads.find((t) => t.id === active) ?? null;
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn(detail && thread && "max-md:hidden")}>
        <FilterBar catalog={catalog} filter={filter} onFilter={onFilter} showTypes={false} count={plural(threads.length, "Verlauf", "Verläufe")} tags={tags} />
      </div>
      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className={cn("min-h-0 overflow-y-auto rounded-2xl border border-border p-1", detail && thread && "max-md:hidden")}>
          {threads.length === 0 && <p className="p-4 text-sm text-muted">Keine Treffer.</p>}
          <div role="listbox" aria-label="E-Mail-Verläufe" hidden={threads.length === 0}>
            {threads.map((t) => {
              const org = catalog.orgs.find((o) => o.id === t.orgId);
              const last = t.mails[t.mails.length - 1];
              return (
                <div
                  key={t.id}
                  id={keys.optionId(t.id)}
                  data-id={t.id}
                  role="option"
                  aria-selected={active === t.id}
                  tabIndex={keys.current === t.id ? 0 : -1}
                  onKeyDown={(e) => keys.onKeyDown(e, t.id)}
                  onClick={() => onActive(t.id)}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-xl px-2.5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    active === t.id ? "bg-primary-soft" : "hover:bg-surface-2",
                  )}
                >
                  <TypeIcon type="mail" />
                  <span className="min-w-0 flex-1">
                    <span className="line-clamp-2 text-sm font-medium">{t.subject}</span>
                    <span className="block truncate text-xs text-muted">
                      {t.participants.slice(0, 3).join(", ")}
                      {t.participants.length > 3 ? " …" : ""}
                    </span>
                    <span className="block text-xs text-muted">
                      {org?.short} · {plural(t.mails.length, "E-Mail", "E-Mails")} · {formatMailDate(last.date)}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <section aria-label="Verlauf" className={cn("min-h-0 overflow-y-auto", !(detail && thread) && "max-md:hidden")}>
          {thread ? (
            <ThreadDetail
              catalog={catalog}
              thread={thread}
              attached={attached}
              withAttachments={withAttachments}
              onWithAttachments={onWithAttachments}
              onAttach={onAttach}
              onBack={onBack}
            />
          ) : (
            <p className="grid h-full place-items-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
              Wähle links einen Verlauf, um die E-Mails zu lesen.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function TypeIcon({ type }: { type: keyof typeof TYPE_STYLE }) {
  const { Icon, color, label } = TYPE_STYLE[type];
  return <Icon className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-label={label} />;
}

function ThreadDetail({
  catalog,
  thread,
  attached,
  withAttachments,
  onWithAttachments,
  onAttach,
  onBack,
}: {
  catalog: LibraryCatalog;
  thread: LibraryThread;
  attached: Set<string>;
  withAttachments: boolean;
  onWithAttachments: (v: boolean) => void;
  onAttach: (items: LibraryPick[]) => void;
  onBack: () => void;
}) {
  const { preview, error } = usePreview(thread.id);
  const hasAttachments = thread.mails.some((m) => m.attachments.length > 0);
  const docsOf = (ids: string[]) =>
    withAttachments
      ? ids
          .map((id) => catalog.documents.find((d) => d.id === id))
          .filter((d): d is LibraryDocument => Boolean(d))
          .map((d) => ({ id: d.id, name: d.fileName }))
      : [];
  const attachMail = (index: number) => {
    const mail = thread.mails[index];
    onAttach([{ id: mail.id, name: mail.fileName }, ...docsOf(mail.attachments)]);
  };
  const last = thread.mails[thread.mails.length - 1];
  const org = catalog.orgs.find((o) => o.id === thread.orgId)!;
  const checkboxId = useId();
  return (
    <div>
      <BackButton onBack={onBack} />
      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
          <TypeIcon type="mail" /> E-Mail-Verlauf · {plural(thread.mails.length, "E-Mail", "E-Mails")}
        </p>
        <h3 className="mt-1 font-display text-lg leading-snug font-semibold">{thread.subject}</h3>
        <p className="mt-1 text-sm text-muted">{thread.summary}</p>
        <p className="mt-2 text-xs text-muted">
          {org.name} · {unitLabel(catalog, thread.orgId, thread.unitId)}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {thread.mails.length > 1 && (
            <Button variant="primary" size="sm" onClick={() => attachMail(thread.mails.length - 1)} disabled={attached.has(last.id)}>
              <Paperclip className="h-4 w-4" /> {attached.has(last.id) ? "Verlauf bereits angehängt" : "Ganzen Verlauf anhängen"}
            </Button>
          )}
          {hasAttachments && (
            <label htmlFor={checkboxId} className="inline-flex items-center gap-2 text-sm">
              <input
                id={checkboxId}
                type="checkbox"
                checked={withAttachments}
                onChange={(e) => onWithAttachments(e.target.checked)}
                className="h-4 w-4 accent-[var(--primary)]"
              />
              Anhänge mitnehmen
            </label>
          )}
        </div>
        {thread.mails.length > 1 && (
          <p className="mt-2 text-xs text-muted">Der ganze Verlauf ist die jüngste E-Mail – sie zitiert die früheren wie in Outlook.</p>
        )}
      </div>
      <div className="mt-3 space-y-3">
        {error ? (
          <p role="alert" className="text-sm text-danger">
            Verlauf nicht verfügbar: {error}
          </p>
        ) : preview?.type === "thread" ? (
          preview.mails.map((m, i) => <MailCard key={m.id} mail={m} attached={attached.has(m.id)} onAttach={() => attachMail(i)} />)
        ) : (
          <p className="inline-flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Verlauf wird geladen …
          </p>
        )}
      </div>
    </div>
  );
}
