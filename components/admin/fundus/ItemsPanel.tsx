"use client";
// Dokumente bzw. E-Mail-Verläufe im Admin: eigene bearbeiten, schalten und löschen; mitgelieferte aus- und einblenden.
import { Download, Eye, EyeOff, Loader2, Pencil, Search, Trash2, Upload } from "lucide-react";
import { useMemo, useState } from "react";
import { api } from "@/lib/client/api";
import { fold } from "@/lib/library/search";
import { LIBRARY_TAGS, type LibraryTag } from "@/lib/library/types";
import type { AdminFundusDocument, AdminFundusThread } from "@/lib/shared/fundus";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Switch } from "@/components/ui/Switch";
import { TYPE_STYLE } from "@/components/chat/library/Previews";
import { Notice } from "../fields";
import { Badge, day, errorText, MetaFields, metaPayload, number, plural, PreviewDialog, type MetaValue } from "./shared";

type Item = (AdminFundusDocument & { kind: "documents" }) | (AdminFundusThread & { kind: "threads" });
type Show = "alle" | "eigen" | "fundus" | "ausgeblendet";

const SHOW_LABEL: Record<Show, string> = { alle: "Alle", eigen: "Eigene", fundus: "Mitgelieferte", ausgeblendet: "Ausgeblendet" };

export function ItemsPanel({
  kind,
  items: raw,
  onUpload,
  reload,
  onMessage,
}: {
  kind: "documents" | "threads";
  items: AdminFundusDocument[] | AdminFundusThread[];
  onUpload: () => void;
  reload: () => Promise<void>;
  onMessage: (text: string, tone?: "success" | "danger") => void;
}) {
  const items = useMemo(() => raw.map((i) => ({ ...i, kind }) as Item), [raw, kind]);
  const [query, setQuery] = useState("");
  const [show, setShow] = useState<Show>("alle");
  const [editing, setEditing] = useState<Item | null>(null);
  const [preview, setPreview] = useState<{ id: string; title: string } | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const noun = kind === "documents" ? ["Dokument", "Dokumente"] : ["Verlauf", "Verläufe"];

  const visible = useMemo(() => {
    const words = fold(query).split(/\s+/).filter(Boolean);
    return items.filter((i) => {
      if (show === "eigen" && i.source !== "eigen") return false;
      if (show === "fundus" && i.source !== "fundus") return false;
      if (show === "ausgeblendet" && !i.hidden) return false;
      if (!words.length) return true;
      const hay = fold([i.title, i.summary, i.org, ...i.keywords, i.kind === "documents" ? i.fileName : ""].join(" "));
      return words.every((w) => hay.includes(w));
    });
  }, [items, query, show]);
  const hiddenCount = items.filter((i) => i.hidden).length;

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

  const remove = (i: Item) => {
    const question =
      i.kind === "threads"
        ? `Verlauf „${i.title}“ mit ${plural(i.mails, "E-Mail", "E-Mails")}${i.attachments ? ` und ${plural(i.attachments, "Anhang-Dokument", "Anhang-Dokumenten")}` : ""} endgültig löschen?`
        : `Dokument „${i.title}“ endgültig löschen? Die Datei wird entfernt.`;
    if (!confirm(question)) return;
    void act(i.id, () => api(`/api/admin/fundus/${i.kind}?id=${encodeURIComponent(i.id)}`, { method: "DELETE", admin: true }), `„${i.title}“ gelöscht.`);
  };

  const setHidden = (i: Item, hidden: boolean) =>
    void act(i.id, () => api("/api/admin/fundus/hidden", { method: "PUT", json: { id: i.id, hidden }, admin: true }), hidden ? `„${i.title}“ ausgeblendet.` : `„${i.title}“ eingeblendet.`);

  const setEnabled = (i: Item, enabled: boolean) =>
    void act(i.id, () =>
      api(`/api/admin/fundus/${i.kind}`, { method: "PUT", json: { id: i.id, ...metaPayload(toMeta(i)), enabled }, admin: true }),
    );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 basis-56">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen: Titel, Stichwort, Datei …"
            aria-label={`${noun[1]} durchsuchen`}
            className="h-9 w-full rounded-full border border-border bg-surface pr-3 pl-9 text-sm outline-none focus:border-primary"
          />
        </label>
        <select aria-label="Anzeigen" value={show} onChange={(e) => setShow(e.target.value as Show)} className="h-9 rounded-full border border-border bg-surface px-3 text-sm">
          {(Object.keys(SHOW_LABEL) as Show[]).map((s) => (
            <option key={s} value={s}>
              {SHOW_LABEL[s]}
            </option>
          ))}
        </select>
        {hiddenCount > 0 && (
          <Button
            size="sm"
            onClick={() =>
              void act("alle", () => api("/api/admin/fundus/hidden", { method: "PUT", json: { all: true, hidden: false }, admin: true }), "Alle mitgelieferten Einträge sind wieder eingeblendet.")
            }
          >
            <Eye className="h-4 w-4" /> Alle einblenden ({number.format(hiddenCount)})
          </Button>
        )}
        <Button size="sm" variant="primary" onClick={onUpload}>
          <Upload className="h-4 w-4" /> {kind === "documents" ? "Dateien hochladen" : "Verlauf hochladen"}
        </Button>
      </div>
      <p className="mb-2 text-xs text-muted" aria-live="polite">
        {plural(visible.length, noun[0], noun[1])}
      </p>
      <ul aria-label={kind === "documents" ? "Dokumente im Fundus" : "E-Mail-Verläufe im Fundus"} className="divide-y divide-border rounded-2xl border border-border">
        {visible.map((i) => {
          const style = TYPE_STYLE[i.kind === "documents" ? i.type : "mail"];
          const own = i.source === "eigen";
          const attachmentOf = i.kind === "documents" ? i.threadTitle : null;
          return (
            <li key={i.id} data-id={i.id} className="flex flex-wrap items-center gap-3 px-3 py-2.5">
              <style.Icon className="h-5 w-5 shrink-0" style={{ color: style.color }} aria-label={style.label} />
              <div className="min-w-0 flex-1 basis-60">
                <p className="truncate text-sm font-medium">{i.title}</p>
                <p className="text-xs text-muted">
                  {i.org} · {day(i.date)} ·{" "}
                  {i.kind === "documents" ? `ca. ${number.format(i.tokens)} Tokens` : `${plural(i.mails, "E-Mail", "E-Mails")}${i.attachments ? `, ${plural(i.attachments, "Anhang", "Anhänge")}` : ""}`}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {own ? <Badge tone="primary">eigen</Badge> : <Badge tone="muted">mitgeliefert</Badge>}
                  {i.hidden && <Badge tone="warning">ausgeblendet</Badge>}
                  {!i.enabled && <Badge tone="warning">inaktiv</Badge>}
                  {attachmentOf && <Badge tone="muted">Anhang von „{attachmentOf}“</Badge>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {busy === i.id && <Loader2 className="h-4 w-4 animate-spin text-muted" aria-label="Wird gespeichert …" />}
                <Button size="sm" variant="ghost" aria-label={`Vorschau „${i.title}“`} title="Vorschau" onClick={() => setPreview({ id: i.id, title: i.title })}>
                  <Eye className="h-4 w-4" />
                </Button>
                {i.kind === "documents" && (
                  <a
                    href={`/api/admin/fundus/file?id=${encodeURIComponent(i.id)}`}
                    download={i.fileName}
                    aria-label={`„${i.title}“ herunterladen`}
                    title="Herunterladen"
                    className="inline-flex h-8 items-center rounded-full px-3 text-muted hover:bg-surface-2 hover:text-text"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                {own ? (
                  <>
                    <EnabledSwitch label={`„${i.title}“ aktiv`} checked={i.enabled} onChange={(v) => setEnabled(i, v)} />
                    <Button size="sm" variant="ghost" aria-label={`„${i.title}“ bearbeiten`} title="Bearbeiten" onClick={() => setEditing(i)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      aria-label={`„${i.title}“ löschen`}
                      title={attachmentOf ? `Gehört zum Verlauf „${attachmentOf}“ – wird mit ihm gelöscht` : "Löschen"}
                      disabled={Boolean(attachmentOf)}
                      onClick={() => remove(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="ghost" onClick={() => setHidden(i, !i.hidden)} aria-label={`„${i.title}“ ${i.hidden ? "einblenden" : "ausblenden"}`}>
                    {i.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} {i.hidden ? "Einblenden" : "Ausblenden"}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
        {visible.length === 0 && <li className="px-3 py-4 text-sm text-muted">Keine Treffer.</li>}
      </ul>
      <PreviewDialog item={preview} onClose={() => setPreview(null)} />
      {editing && (
        <EditDialog
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={async (title) => {
            setEditing(null);
            await reload();
            onMessage(`„${title}“ gespeichert.`);
          }}
        />
      )}
    </div>
  );
}

function toMeta(i: Item): MetaValue {
  return { title: i.title, summary: i.summary, date: i.date.slice(0, 10), tags: i.tags.filter((t: LibraryTag) => !["kurz", "mittel", "lang"].includes(t)), keywords: i.keywords.join(", ") };
}

/** Kleiner Schalter ohne sichtbare Beschriftung (die steht im aria-label). */
function EnabledSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={checked ? "Aktiv" : "Inaktiv"}
      onClick={() => onChange(!checked)}
      className={`relative mx-1 h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? "bg-primary" : "bg-surface-3"}`}
    >
      <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : ""}`} />
    </button>
  );
}

function EditDialog({ item, onClose, onSaved }: { item: Item; onClose: () => void; onSaved: (title: string) => Promise<void> }) {
  const [meta, setMeta] = useState<MetaValue>(() => toMeta(item));
  const [enabled, setEnabled] = useState(item.enabled);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const length = item.tags.find((t) => ["kurz", "mittel", "lang"].includes(t));
  return (
    <Dialog open onClose={onClose} title={item.kind === "documents" ? "Dokument bearbeiten" : "Verlauf bearbeiten"} className="w-[min(680px,calc(100vw-2rem))]">
      <div className="space-y-4">
        {item.kind === "documents" && (
          <p className="text-xs text-muted">
            Datei: {item.fileName}
            {length ? ` · Länge: ${LIBRARY_TAGS[length]}` : ""}. Die Datei selbst bleibt – für eine neue Fassung bitte neu hochladen und diese löschen.
          </p>
        )}
        <MetaFields value={meta} onChange={setMeta} />
        <Switch label="Aktiv" description="Inaktive Einträge sehen Teilnehmende nicht; in bestehenden Chats bleiben sie nutzbar." checked={enabled} onChange={setEnabled} />
        {error && <Notice tone="danger">{error}</Notice>}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button
          variant="primary"
          disabled={busy || !meta.title.trim() || !meta.date}
          onClick={async () => {
            setBusy(true);
            setError(null);
            try {
              await api(`/api/admin/fundus/${item.kind}`, { method: "PUT", json: { id: item.id, ...metaPayload(meta), enabled }, admin: true });
              await onSaved(meta.title.trim());
            } catch (err) {
              setError(errorText(err, "Speichern fehlgeschlagen"));
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
