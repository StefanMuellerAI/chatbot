"use client";
import { Check, ChevronLeft, Download, Loader2, Paperclip, RotateCcw, Search, SlidersHorizontal, SquarePen } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { libraryFileUrl, loadCatalog, loadPreview } from "@/lib/client/library";
import {
  EMPTY_FILTER,
  EMPTY_PROMPT_FILTER,
  filterActive,
  filterDocuments,
  filterPrompts,
  filterThreads,
  promptFilterActive,
  unitLabel,
  unitTree,
  type LibraryFilter,
  type PromptFilter,
} from "@/lib/library/search";
import {
  LEVEL_LABELS,
  LIBRARY_TAGS,
  type FundusCatalog,
  type LibraryCatalog,
  type LibraryDocType,
  type LibraryDocument,
  type LibraryPreview,
  type LibraryPrompt,
  type LibraryTag,
  type LibraryThread,
} from "@/lib/library/types";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/components/ui/cn";
import { formatMailDate, MailCard, PreviewView, TYPE_STYLE } from "./Previews";
import { PromptText } from "./PromptFill";

export interface LibraryPick {
  id: string;
  name: string;
}

type Tab = "docs" | "mails" | "prompts";

const TABS: Tab[] = ["docs", "mails", "prompts"];
const DOC_TYPES: LibraryDocType[] = ["word", "excel", "powerpoint", "pdf"];
const number = new Intl.NumberFormat("de-DE");
const day = (iso: string) => iso.slice(0, 10).split("-").reverse().join(".");
const plural = (n: number, one: string, many: string) => `${number.format(n)} ${n === 1 ? one : many}`;

function sizeLabel(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / 1024 / 1024).toFixed(1).replace(".", ",")} MB`;
}

/**
 * Fundus: erfundene Dokumente und E-Mails aus Verwaltungen zum Anhängen, dazu Prompts zum Ausfüllen.
 * Der Zustand (Reiter, Filter, Auswahl) bleibt beim Schließen erhalten, bis die Seite neu geladen wird.
 */
export function LibraryDialog({
  open,
  onClose,
  attachedIds,
  freeSlots,
  onAttach,
  onPrompt,
}: {
  open: boolean;
  onClose: () => void;
  /** Bereits angehängte Fundus-Einträge (werden markiert und nicht doppelt angehängt). */
  attachedIds: string[];
  /** Freie Plätze bis zur Grenze von Anhängen je Nachricht. */
  freeSlots: number;
  onAttach: (items: LibraryPick[]) => void;
  /** Prompt gewählt: mit Platzhaltern öffnet der Aufrufer die Maske, ohne fügt er direkt ein. */
  onPrompt: (prompt: LibraryPrompt, category: string) => void;
}) {
  const [catalog, setCatalog] = useState<FundusCatalog | null>(null);
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
  const [promptFilter, setPromptFilter] = useState<PromptFilter>(EMPTY_PROMPT_FILTER);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const selectedRef = useRef<string[]>([]);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  // Bei jedem Öffnen nachfragen, ob sich der Fundus geändert hat (die Kursleitung kann ihn im Kurs pflegen).
  const fetchCatalog = useCallback(() => {
    loadCatalog()
      .then((c) => {
        setCatalog(c);
        setLoadError(null);
        const docs = new Set(c.documents.map((d) => d.id));
        const gone = selectedRef.current.filter((id) => !docs.has(id));
        if (gone.length) {
          setSelected(selectedRef.current.filter((id) => docs.has(id)));
          setNotice(gone.length === 1 ? "1 Eintrag ist nicht mehr im Fundus." : `${gone.length} Einträge sind nicht mehr im Fundus.`);
        }
      })
      .catch((err: unknown) => setLoadError(err instanceof Error ? err.message : "Unbekannter Fehler"));
  }, []);

  useEffect(() => {
    if (open) fetchCatalog();
  }, [open, fetchCatalog]);

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

  const prompt = catalog?.prompts.find((p) => p.id === activePrompt) ?? null;
  const choosePrompt = (id: string) => {
    const p = catalog?.prompts.find((x) => x.id === id);
    if (!p || !catalog) return;
    setActivePrompt(id);
    onPrompt(p, catalog.categories.find((c) => c.id === p.categoryId)?.name ?? "");
  };

  const tabsId = useId();
  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "docs", label: "Dokumente", count: catalog?.documents.length ?? 0 },
    { key: "mails", label: "E-Mails", count: catalog?.threads.length ?? 0 },
    { key: "prompts", label: "Prompts", count: catalog?.prompts.length ?? 0 },
  ];
  const onTabKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "Home" && e.key !== "End") return;
    e.preventDefault();
    const index = TABS.indexOf(tab);
    const next: Tab =
      e.key === "Home" ? TABS[0] : e.key === "End" ? TABS[TABS.length - 1] : TABS[(index + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length];
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
        <p className="-mt-2 mb-3 text-sm text-muted">Erfundene Dateien und E-Mails aus Verwaltungen – zum Üben, ohne echte Daten. Dazu Prompts zum Ausfüllen.</p>
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
              {catalog && <span className="ml-1.5 text-xs"> ({t.count})</span>}
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
          ) : tab === "prompts" ? (
            <PromptsPanel
              catalog={catalog}
              filter={promptFilter}
              onFilter={setPromptFilter}
              active={activePrompt}
              onActive={(id) => {
                setActivePrompt(id);
                setDetail(true);
              }}
              onChoose={choosePrompt}
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
              (tab === "prompts"
                ? "Ausgefüllt landet der Prompt im Eingabefeld – gesendet wird erst, wenn du abschickst."
                : tab === "docs" && selection.length
                ? `${plural(selection.length, "Datei", "Dateien")} ausgewählt`
                : freeSlots > 0
                  ? `Noch ${plural(freeSlots, "Anhang", "Anhänge")} möglich`
                  : "Keine weiteren Anhänge möglich")}
          </p>
          {tab === "prompts" && (
            <Button variant="primary" size="sm" disabled={!prompt} onClick={() => prompt && choosePrompt(prompt.id)}>
              <SquarePen className="h-4 w-4" />
              {prompt && prompt.placeholders.length === 0 ? "Einfügen" : "Ausfüllen und einfügen"}
            </Button>
          )}
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
          disabled={!org || org.units.length === 0}
          onChange={(e) => onFilter({ ...filter, unitId: e.target.value || null })}
          className="h-9 w-full rounded-full border border-border bg-surface px-3 text-sm disabled:opacity-50 sm:w-64"
        >
          <option value="">{!org ? "Erst Verwaltung wählen" : org.units.length ? "Alle Einheiten" : "Keine Einheiten"}</option>
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
            {DOC_TYPES.filter((t) => t !== "pdf" || catalog.documents.some((d) => d.type === "pdf")).map((t) => (
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
                    <span className="block truncate text-xs text-muted">{[org?.short, unitLabel(catalog, d.orgId, d.unitId)].filter(Boolean).join(" · ")}</span>
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
          {doc.unitId && (
            <>
              <dt className="text-muted">Einheit</dt>
              <dd>{unitLabel(catalog, doc.orgId, doc.unitId)}</dd>
            </>
          )}
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
          {doc.keywords.length > 0 && doc.orgId === "eigen" && (
            <>
              <dt className="text-muted">Stichwörter</dt>
              <dd>{doc.keywords.join(", ")}</dd>
            </>
          )}
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
  /** Eine Mail – oder mit `whole` den ganzen Verlauf: die jüngste Mail und die Anhänge aller Mails. */
  const attachMail = (index: number, whole = false) => {
    const mail = thread.mails[index];
    const docIds = whole ? [...new Set(thread.mails.flatMap((m) => m.attachments))] : mail.attachments;
    onAttach([{ id: mail.id, name: mail.fileName }, ...docsOf(docIds)]);
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
        <p className="mt-2 text-xs text-muted">{[org.name, unitLabel(catalog, thread.orgId, thread.unitId)].filter(Boolean).join(" · ")}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {thread.mails.length > 1 && (
            <Button variant="primary" size="sm" onClick={() => attachMail(thread.mails.length - 1, true)} disabled={attached.has(last.id)}>
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

// ---------------------------------------------------------------- Prompts

function PromptsPanel({
  catalog,
  filter,
  onFilter,
  active,
  onActive,
  onChoose,
  detail,
  onBack,
}: {
  catalog: FundusCatalog;
  filter: PromptFilter;
  onFilter: (f: PromptFilter) => void;
  active: string | null;
  onActive: (id: string) => void;
  onChoose: (id: string) => void;
  detail: boolean;
  onBack: () => void;
}) {
  const prompts = useMemo(() => filterPrompts(catalog, filter), [catalog, filter]);
  // In der Reihenfolge der Kategorien aus dem Admin; innerhalb der Kategorie wie dort sortiert.
  const groups = useMemo(
    () => catalog.categories.map((c) => ({ category: c, prompts: prompts.filter((p) => p.categoryId === c.id) })).filter((g) => g.prompts.length > 0),
    [catalog, prompts],
  );
  const ordered = useMemo(() => groups.flatMap((g) => g.prompts), [groups]);
  const counts = useMemo(() => {
    // Zahl je Kategorie bei der aktuellen Suche (ohne Kategorie-Filter).
    const matching = filterPrompts(catalog, { ...filter, categories: [] });
    return new Map(catalog.categories.map((c) => [c.id, matching.filter((p) => p.categoryId === c.id).length]));
  }, [catalog, filter]);
  const keys = useListKeys(ordered, active, onActive, (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onActive(id);
      if (e.key === "Enter") onChoose(id);
      return true;
    }
    return false;
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const prompt = catalog.prompts.find((p) => p.id === active) ?? null;
  const toggleIn = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className={cn("mb-3 space-y-2", detail && prompt && "max-md:hidden")}>
        <div className="flex gap-2">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input
              type="search"
              value={filter.query}
              onChange={(e) => onFilter({ ...filter, query: e.target.value })}
              placeholder="Suchen: Titel, Text, Platzhalter …"
              aria-label="Prompts durchsuchen"
              className="h-9 w-full rounded-full border border-border bg-surface pr-3 pl-9 text-sm outline-none focus:border-primary"
            />
          </label>
          <button
            type="button"
            onClick={() => setFiltersOpen((v) => !v)}
            aria-expanded={filtersOpen}
            className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-sm md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden /> Kategorien{filter.categories.length ? ` (${filter.categories.length})` : ""}
          </button>
        </div>
        <div role="group" aria-label="Kategorien" className={cn("flex flex-wrap gap-1", !filtersOpen && "max-md:hidden")}>
          {catalog.categories.map((c) => (
            <Chip key={c.id} active={filter.categories.includes(c.id)} onClick={() => onFilter({ ...filter, categories: toggleIn(filter.categories, c.id) })}>
              {c.name} <span className="opacity-70">({counts.get(c.id) ?? 0})</span>
            </Chip>
          ))}
        </div>
        <div className="flex items-center justify-between gap-2 text-xs text-muted">
          <span aria-live="polite">{plural(prompts.length, "Prompt", "Prompts")}</span>
          {promptFilterActive(filter) && (
            <button type="button" onClick={() => onFilter(EMPTY_PROMPT_FILTER)} className="underline hover:text-text">
              Filter zurücksetzen
            </button>
          )}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 gap-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className={cn("min-h-0 overflow-y-auto rounded-2xl border border-border p-1", detail && prompt && "max-md:hidden")}>
          {ordered.length === 0 && <p className="p-4 text-sm text-muted">{catalog.prompts.length ? "Keine Treffer." : "Noch keine Prompts im Fundus."}</p>}
          <div role="listbox" aria-label="Prompts" hidden={ordered.length === 0}>
            {groups.map((g) => (
              <div key={g.category.id} role="group" aria-label={g.category.name}>
                <p className="px-2.5 pt-2 pb-1 text-xs font-semibold tracking-wide text-muted uppercase" aria-hidden>
                  {g.category.name}
                </p>
                {g.prompts.map((p) => (
                  <div
                    key={p.id}
                    id={keys.optionId(p.id)}
                    data-id={p.id}
                    role="option"
                    aria-selected={active === p.id}
                    tabIndex={keys.current === p.id ? 0 : -1}
                    onKeyDown={(e) => keys.onKeyDown(e, p.id)}
                    onClick={() => onActive(p.id)}
                    onDoubleClick={() => onChoose(p.id)}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl px-2.5 py-2 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      active === p.id ? "bg-primary-soft" : "hover:bg-surface-2",
                    )}
                  >
                    <SquarePen className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-sm font-medium">{p.title}</span>
                      {p.description && <span className="line-clamp-2 block text-xs text-muted">{p.description}</span>}
                      <span className="block text-xs text-muted">
                        {p.placeholders.length ? plural(p.placeholders.length, "Platzhalter", "Platzhalter") : "ohne Platzhalter"}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <section aria-label="Vorschau" className={cn("min-h-0 overflow-y-auto", !(detail && prompt) && "max-md:hidden")}>
          {prompt ? (
            <div>
              <BackButton onBack={onBack} />
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="text-xs font-medium text-muted">{catalog.categories.find((c) => c.id === prompt.categoryId)?.name}</p>
                <h3 className="mt-1 font-display text-lg leading-snug font-semibold">{prompt.title}</h3>
                {prompt.description && <p className="mt-1 text-sm text-muted">{prompt.description}</p>}
                <div className="mt-3 rounded-xl bg-surface-2 p-3" data-testid="prompt-text">
                  <PromptText text={prompt.text} placeholders={prompt.placeholders} />
                </div>
                {prompt.placeholders.length > 0 ? (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-muted">Felder in der Maske (alle Pflicht)</p>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm" aria-label="Felder">
                      {prompt.placeholders.map((p) => (
                        <li key={p.key}>
                          {p.label}
                          {p.type === "select" ? <span className="text-muted"> – Auswahl: {p.options.join(", ")}</span> : p.type === "area" ? <span className="text-muted"> – mehrzeilig</span> : null}
                          {p.default && <span className="text-muted"> (vorausgefüllt: {p.default})</span>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-muted">Ohne Platzhalter – der Text kommt direkt ins Eingabefeld.</p>
                )}
                <p className="mt-3 text-xs text-muted">Tipp: Eine passende Übungsdatei hängst du selbst aus dem Fundus an.</p>
              </div>
            </div>
          ) : (
            <p className="grid h-full place-items-center rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
              Wähle links einen Prompt, um ihn zu sehen.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
