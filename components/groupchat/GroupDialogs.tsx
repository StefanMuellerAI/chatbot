"use client";
import { Check, LogOut, Pencil, Search, Trash2, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createGroupChat, fetchCandidates, removeGroupChat, updateGroupChat } from "@/lib/client/groupchat";
import { GROUPCHAT_LIMITS, type GroupChatCandidates, type GroupChatDetail, type GroupChatSummary } from "@/lib/shared/groupchat";
import { mailName } from "@/lib/shared/mail";
import { MailAvatar } from "@/components/mail/Avatar";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/components/ui/cn";

/** Auf dem Handy füllen die Dialoge den ganzen Bildschirm (wie „Neue E-Mail“). */
const FULLSCREEN_ON_PHONE = "max-sm:m-0 max-sm:h-dvh max-sm:max-h-none max-sm:w-screen max-sm:max-w-none max-sm:rounded-none max-sm:border-0";

const button = {
  primary: "inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-brand-gradient px-5 text-sm font-semibold text-white shadow-md disabled:opacity-50",
  secondary: "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-semibold hover:bg-surface-2 disabled:opacity-50",
  danger: "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-danger px-4 text-sm font-semibold text-danger hover:bg-danger-soft disabled:opacity-50",
  dangerSolid: "inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-danger px-5 text-sm font-semibold text-on-danger disabled:opacity-50",
};

/** Auswahl von Personen mit Häkchen (Starten und Einladen). */
function PeoplePicker({
  people,
  selected,
  onToggle,
  emptyText,
}: {
  people: string[];
  selected: Set<string>;
  onToggle: (name: string) => void;
  emptyText: string;
}) {
  return (
    <div role="group" aria-label="Personen" className="max-h-60 overflow-y-auto rounded-2xl border border-border p-1 max-sm:max-h-none max-sm:flex-1">
      {people.map((name) => (
        <label key={name} className={cn("flex cursor-pointer items-center gap-2.5 rounded-xl px-2.5 py-2", selected.has(name) && "bg-primary-soft")}>
          <input type="checkbox" checked={selected.has(name)} onChange={() => onToggle(name)} className="h-4.5 w-4.5 accent-[var(--primary)]" />
          <MailAvatar local={name} size={28} />
          <span className="text-[0.95rem]">{mailName(name)}</span>
        </label>
      ))}
      {people.length === 0 && <p className="px-3 py-4 text-center text-sm text-muted">{emptyText}</p>}
    </div>
  );
}

function toggleIn(set: Set<string>, name: string): Set<string> {
  const next = new Set(set);
  if (next.has(name)) next.delete(name);
  else next.add(name);
  return next;
}

/** Dialog „Neuer Gruppenchat“: Name, (Kursleitung: Gruppe) und Personen aus genau einer Gruppe. */
export function NewGroupChatDialog({
  open,
  onClose,
  isAdmin,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  isAdmin: boolean;
  onCreated: (chat: GroupChatSummary) => void;
}) {
  const [candidates, setCandidates] = useState<GroupChatCandidates | null>(null);
  const [title, setTitle] = useState("");
  const [groupId, setGroupId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Beim Öffnen leer beginnen (Zustand während des Renderns anpassen statt in einem Effekt).
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setTitle("");
      setQuery("");
      setSelected(new Set());
      setError(null);
      setCandidates(null);
    }
  }

  useEffect(() => {
    if (!open) return;
    fetchCandidates()
      .then((c) => {
        setCandidates(c);
        setGroupId(c.groups[0]?.id ?? "");
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Die Personen konnten nicht geladen werden."));
  }, [open]);

  const group = candidates?.groups.find((g) => g.id === groupId) ?? candidates?.groups[0];
  const people = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (group?.members ?? []).filter((n) => !q || n.includes(q));
  }, [group, query]);
  const allSelected = people.length > 0 && people.every((n) => selected.has(n));

  const submit = async () => {
    if (!title.trim()) return setError("Bitte gib dem Gruppenchat einen Namen.");
    if (selected.size === 0) return setError("Bitte wähle mindestens eine Person aus.");
    setBusy(true);
    try {
      const chat = await createGroupChat({ title, members: [...selected], groupId: isAdmin ? (group?.id ?? null) : undefined });
      onCreated(chat);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Der Gruppenchat konnte nicht gestartet werden.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Neuer Gruppenchat" className={FULLSCREEN_ON_PHONE} bodyClassName="max-sm:flex max-sm:h-full max-sm:flex-col">
      <form
        className="flex flex-col gap-4 max-sm:flex-1"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Name</span>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value.slice(0, GROUPCHAT_LIMITS.title));
              setError(null);
            }}
            placeholder="z. B. Protokoll Teamrunde"
            className="h-11 rounded-2xl border border-border-strong bg-surface px-3.5 outline-none focus:border-primary"
          />
        </label>
        {isAdmin && (candidates?.groups.length ?? 0) > 0 && (
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Gruppe</span>
            <select
              value={group?.id ?? ""}
              onChange={(e) => {
                setGroupId(e.target.value);
                setSelected(new Set());
                setError(null);
              }}
              className="h-11 rounded-2xl border border-border-strong bg-surface px-3 outline-none focus:border-primary"
            >
              {candidates!.groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.eventName ? `${g.eventName} · ${g.name}` : g.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-muted">Gruppen bleiben getrennt: Ein Gruppenchat enthält nur Personen aus einer Gruppe.</span>
          </label>
        )}
        <div className="flex min-h-0 flex-col gap-2 max-sm:flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <span className="text-sm font-semibold">Wen lädst du ein?</span>
            {group && !isAdmin && <span className="text-xs text-muted">deine Gruppe „{group.name}“</span>}
          </div>
          <div className="flex gap-2">
            <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border bg-surface-2 px-3.5 py-2 text-sm">
              <Search className="h-4 w-4 shrink-0 text-muted" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Suchen …" aria-label="Personen suchen" className="w-full bg-transparent outline-none" />
            </label>
            <button
              type="button"
              className={button.secondary}
              disabled={people.length === 0}
              onClick={() => {
                setSelected((s) => {
                  const next = new Set(s);
                  for (const n of people) {
                    if (allSelected) next.delete(n);
                    else next.add(n);
                  }
                  return next;
                });
                setError(null);
              }}
            >
              {allSelected ? "Auswahl aufheben" : "Alle auswählen"}
            </button>
          </div>
          {candidates ? (
            <PeoplePicker
              people={people}
              selected={selected}
              onToggle={(n) => {
                setSelected((s) => toggleIn(s, n));
                setError(null);
              }}
              emptyText={
                query.trim() ? "Keine Treffer." : isAdmin ? "Gerade läuft kein Termin mit Gästen." : "In deiner Gruppe ist sonst niemand."
              }
            />
          ) : (
            !error && <p className="px-3 py-4 text-center text-sm text-muted">Lade Personen …</p>
          )}
        </div>
        <p className="text-sm text-muted">
          {selected.size === 1 ? "1 Person ausgewählt" : `${selected.size} Personen ausgewählt`} · Alle Eingeladenen sehen den ganzen Verlauf. Freebie antwortet nur, wenn ihr
          @Freebie schreibt.
        </p>
        {error && (
          <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          <button type="button" className={button.secondary} onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" className={button.primary} disabled={busy}>
            Chat starten
          </button>
        </div>
      </form>
    </Dialog>
  );
}

type Confirm = { kind: "remove"; name: string } | { kind: "leave" } | { kind: "delete" };

/**
 * Dialog „Mitglieder“: Liste, für die startende Person Einladen, Entfernen, Umbenennen und „Für alle
 * löschen“; für alle anderen „Chat verlassen“. Rückfragen stehen direkt im Dialog.
 */
export function MembersDialog({
  open,
  onClose,
  chat,
  me,
  onChanged,
  onDeleted,
  onToast,
}: {
  open: boolean;
  onClose: () => void;
  chat: GroupChatDetail;
  me: string;
  onChanged: () => Promise<void> | void;
  onDeleted: (message: string) => void;
  onToast: (text: string) => void;
}) {
  const [step, setStep] = useState<"list" | "invite">("list");
  const [renaming, setRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [confirm, setConfirm] = useState<Confirm | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [candidates, setCandidates] = useState<string[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setStep("list");
      setRenaming(false);
      setConfirm(null);
      setError(null);
    }
  }

  const owner = chat.mine;
  const run = async (action: () => Promise<unknown>, after?: () => void) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      after?.();
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Das hat nicht geklappt.");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  const openInvite = () => {
    setStep("invite");
    setSelected(new Set());
    setCandidates(null);
    setError(null);
    fetchCandidates()
      .then((c) => setCandidates((c.groups.find((g) => g.id === chat.groupId)?.members ?? []).filter((n) => n !== me && !chat.members.includes(n))))
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Die Personen konnten nicht geladen werden."));
  };

  const confirmText =
    confirm?.kind === "remove"
      ? `${mailName(confirm.name)} entfernen? ${mailName(confirm.name)} kann danach nicht mehr mitschreiben und sieht nur noch den Verlauf bis jetzt.`
      : confirm?.kind === "leave"
        ? `Gruppenchat verlassen? Du kannst danach nicht mehr mitschreiben. Den Verlauf bis jetzt siehst du weiter, bis der Termin endet. Wieder hinein kommst du nur, wenn ${mailName(chat.owner)} dich erneut einlädt.`
        : `„${chat.title}“ für alle löschen? Der Gruppenchat verschwindet sofort bei allen Mitgliedern.`;

  const doConfirm = () => {
    if (!confirm) return;
    if (confirm.kind === "remove") {
      const name = confirm.name;
      void run(() => updateGroupChat(chat.id, { remove: name }), () => onToast(`${mailName(name)} kann nicht mehr mitschreiben.`));
    } else if (confirm.kind === "leave") {
      void run(() => removeGroupChat(chat.id, "leave"), onClose);
    } else {
      setBusy(true);
      removeGroupChat(chat.id, "forAll")
        .then(() => onDeleted(`„${chat.title}“ wurde für alle gelöscht.`))
        .catch((err: unknown) => setError(err instanceof Error ? err.message : "Das hat nicht geklappt."))
        .finally(() => {
          setBusy(false);
          setConfirm(null);
        });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title={step === "invite" ? "Personen einladen" : "Mitglieder"} className={FULLSCREEN_ON_PHONE} bodyClassName="max-sm:flex max-sm:h-full max-sm:flex-col">
      <div className="flex flex-col gap-4 max-sm:flex-1">
        <p className="-mt-2 text-sm text-muted">
          {step === "invite" ? `Aus der Gruppe „${chat.groupName}“, noch nicht im Chat` : `${chat.title} · ${chat.members.length === 1 ? "1 Person" : `${chat.members.length} Personen`}`}
        </p>

        {step === "list" && (
          <>
            {renaming && (
              <form
                className="flex flex-col gap-2 rounded-2xl bg-surface-2 p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run(() => updateGroupChat(chat.id, { title: newTitle }), () => setRenaming(false));
                }}
              >
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-semibold">Neuer Name</span>
                  <input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value.slice(0, GROUPCHAT_LIMITS.title))}
                    className="h-10 rounded-xl border border-border-strong bg-surface px-3 outline-none focus:border-primary"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  <button type="submit" className={button.primary} disabled={busy}>
                    <Check className="h-4 w-4" /> Speichern
                  </button>
                  <button type="button" className={button.secondary} onClick={() => setRenaming(false)}>
                    Abbrechen
                  </button>
                </div>
              </form>
            )}
            <ul aria-label="Mitglieder" className="flex flex-col gap-0.5">
              {chat.members.map((name) => (
                <li key={name} className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5">
                  <MailAvatar local={name} size={32} />
                  <span className="min-w-0 flex-1 truncate text-[0.95rem]">
                    {mailName(name)}
                    {name === me && <span className="text-muted"> (du)</span>}
                  </span>
                  {name === chat.owner && <span className="shrink-0 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs text-primary">hat den Chat gestartet</span>}
                  {owner && name !== me && (
                    <button type="button" className={cn(button.secondary, "min-h-8 px-3 text-xs")} disabled={busy} aria-label={`${mailName(name)} entfernen`} onClick={() => setConfirm({ kind: "remove", name })}>
                      Entfernen
                    </button>
                  )}
                </li>
              ))}
            </ul>
            {owner ? (
              <>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={button.primary} disabled={busy} onClick={openInvite}>
                    <UserPlus className="h-4 w-4" /> Personen einladen
                  </button>
                  <button
                    type="button"
                    className={button.secondary}
                    disabled={busy}
                    onClick={() => {
                      setNewTitle(chat.title);
                      setRenaming(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" /> Umbenennen
                  </button>
                  <button type="button" className={button.danger} disabled={busy} onClick={() => setConfirm({ kind: "delete" })}>
                    <Trash2 className="h-4 w-4" /> Für alle löschen
                  </button>
                </div>
                <p className="text-sm text-muted">Du hast den Chat gestartet und verwaltest ihn. Verlassen kannst du ihn nicht – nur für alle löschen.</p>
              </>
            ) : (
              <>
                <p className="text-sm text-muted">
                  Gestartet von {mailName(chat.owner)}. Nur {mailName(chat.owner)} kann einladen, entfernen und umbenennen.
                </p>
                <div>
                  <button type="button" className={button.secondary} disabled={busy} onClick={() => setConfirm({ kind: "leave" })}>
                    <LogOut className="h-4 w-4" /> Chat verlassen
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {step === "invite" && (
          <>
            {candidates ? (
              <PeoplePicker people={candidates} selected={selected} onToggle={(n) => setSelected((s) => toggleIn(s, n))} emptyText="Alle aus der Gruppe sind schon dabei." />
            ) : (
              !error && <p className="px-3 py-4 text-center text-sm text-muted">Lade Personen …</p>
            )}
            <p className="text-sm text-muted">Wer dazukommt, sieht den ganzen bisherigen Verlauf.</p>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className={button.secondary} onClick={() => setStep("list")}>
                Zurück
              </button>
              <button
                type="button"
                className={button.primary}
                disabled={busy}
                onClick={() => {
                  if (selected.size === 0) return setError("Bitte wähle mindestens eine Person aus.");
                  const names = [...selected];
                  void run(
                    () => updateGroupChat(chat.id, { invite: names }),
                    () => {
                      onToast(`${names.map(mailName).join(", ")} ${names.length === 1 ? "ist" : "sind"} jetzt dabei und ${names.length === 1 ? "sieht" : "sehen"} den ganzen Verlauf.`);
                      setStep("list");
                    },
                  );
                }}
              >
                Einladen
              </button>
            </div>
          </>
        )}

        {confirm && (
          <div role="alert" className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-3.5">
            <p className="text-sm leading-relaxed">{confirmText}</p>
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" className={button.secondary} onClick={() => setConfirm(null)}>
                Abbrechen
              </button>
              <button type="button" className={button.dangerSolid} disabled={busy} onClick={doConfirm}>
                {confirm.kind === "remove" ? "Entfernen" : confirm.kind === "leave" ? "Verlassen" : "Für alle löschen"}
              </button>
            </div>
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-xl bg-danger-soft px-3.5 py-2 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </Dialog>
  );
}
