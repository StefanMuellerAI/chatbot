"use client";
import { ArrowLeft, Forward, Info, Mail, MailOpen, Menu, Reply, ReplyAll, Search, Sparkles, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/client/api";
import {
  bodyBlocks,
  deleteMailRequest,
  draftFor,
  fetchMail,
  fetchMailList,
  fullDate,
  listTime,
  markMailRead,
  recipientLine,
  type ComposeDraft,
} from "@/lib/client/mail";
import { mailAddress, mailName, type MailFolder, type MailFull, type MailSummary } from "@/lib/shared/mail";
import { cn } from "@/components/ui/cn";
import { MailAvatar } from "./Avatar";

const FOLDER_TITLE: Record<MailFolder, string> = { inbox: "Posteingang", sent: "Gesendet" };

export function MailView({
  me,
  folder,
  selectedId,
  onSelect,
  version,
  onChanged,
  onCompose,
  onDiscuss,
  onOpenMenu,
  onToast,
  onUnread,
}: {
  /** Lokaler Teil der eigenen Adresse. */
  me: string;
  folder: MailFolder;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Ändert sich bei neuen oder geänderten Mails – die Liste lädt dann neu. */
  version: number;
  /** Nach Lesen, Löschen usw.: Zähler neu abfragen. */
  onChanged: () => void;
  onCompose: (draft: ComposeDraft) => void;
  /** „Mit Freebie besprechen“ – fehlt, wenn der Chat die Verbindung nicht anbietet. */
  onDiscuss?: (mail: MailFull) => void;
  onOpenMenu: () => void;
  onToast: (text: string) => void;
  /** Zahl ungelesener Mails aus der frisch geladenen Liste. */
  onUnread: (unread: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [list, setList] = useState<{ mails: MailSummary[]; unread: number; total: number } | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  // Geladene Mail samt ID – passt die ID nicht mehr zur Auswahl, gilt sie als nicht geladen.
  const [loaded, setLoaded] = useState<{ id: string; mail: MailFull | null; error: string | null } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const readerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 250);
    return () => clearTimeout(t);
  }, [query]);

  // Liste laden (Ordner, Suche, neue Mails)
  useEffect(() => {
    const controller = new AbortController();
    fetchMailList(folder, debounced, controller.signal)
      .then((data) => {
        setList(data);
        setListError(null);
        onUnread(data.unread);
      })
      .catch((err) => {
        if (!controller.signal.aborted) setListError(err instanceof Error ? err.message : "Der Posteingang konnte nicht geladen werden.");
      });
    return () => controller.abort();
    // onUnread ist stabil (useCallback).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, debounced, version]);

  // Gewählte Mail laden; Öffnen markiert sie als gelesen.
  useEffect(() => {
    if (!selectedId) return;
    const controller = new AbortController();
    fetchMail(selectedId, controller.signal)
      .then(async (full) => {
        setLoaded({ id: selectedId, mail: full, error: null });
        readerRef.current?.scrollTo({ top: 0 });
        if (full.folder === "inbox" && !full.read) {
          await markMailRead(full.id, true);
          setLoaded({ id: selectedId, mail: { ...full, read: true }, error: null });
          setList((l) => (l ? { ...l, mails: l.mails.map((m) => (m.id === full.id ? { ...m, read: true } : m)), unread: Math.max(0, l.unread - 1) } : l));
          onChanged();
        }
      })
      .catch((err) => {
        if (controller.signal.aborted) return;
        const error = err instanceof ApiError && err.status === 404 ? "Diese E-Mail gibt es nicht mehr." : err instanceof Error ? err.message : "Fehler beim Laden";
        setLoaded({ id: selectedId, mail: null, error });
      });
    return () => controller.abort();
    // onChanged ist stabil (useCallback); bewusst nur bei neuer Auswahl laden.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const current = selectedId && loaded?.id === selectedId ? loaded : null;
  const mailError = current?.error ?? null;
  const shown = current?.mail && current.mail.folder === folder ? current.mail : null;
  const confirmDelete = Boolean(shown) && confirmDeleteId === shown?.id;
  const setMail = (mail: MailFull) => setLoaded({ id: mail.id, mail, error: null });

  const toggleRead = async () => {
    if (!shown) return;
    try {
      await markMailRead(shown.id, !shown.read);
      setMail({ ...shown, read: !shown.read });
      onChanged();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Das hat nicht geklappt.");
    }
  };

  const remove = async () => {
    if (!shown) return;
    try {
      await deleteMailRequest(shown.id);
      const rest = list?.mails.filter((m) => m.id !== shown.id) ?? [];
      const index = list?.mails.findIndex((m) => m.id === shown.id) ?? 0;
      onSelect(rest[Math.min(index, rest.length - 1)]?.id ?? null);
      onToast("E-Mail gelöscht.");
      onChanged();
    } catch (err) {
      onToast(err instanceof Error ? err.message : "Löschen hat nicht geklappt.");
    }
  };

  const mails = list?.mails ?? [];
  const sub = folder === "inbox" ? (list ? (list.unread ? `${list.unread} ungelesen` : "alles gelesen") : "") : list ? `${list.total} ${list.total === 1 ? "E-Mail" : "E-Mails"}` : "";

  return (
    <div className="relative flex min-h-0 flex-1 flex-col">
      <header className="flex flex-wrap items-center gap-x-3 gap-y-2 px-2 pt-2 pb-3 sm:px-6 sm:pt-4">
        <button type="button" onClick={onOpenMenu} className="rounded-full p-2 text-muted hover:bg-surface-2 md:hidden" aria-label="Menü öffnen">
          <Menu className="h-5 w-5" />
        </button>
        <div className="mr-auto flex items-baseline gap-2.5">
          <h1 className="font-display text-xl font-bold">{FOLDER_TITLE[folder]}</h1>
          <span className="text-sm text-muted">{sub}</span>
        </div>
        <label className="flex h-10 w-full items-center gap-2 rounded-full bg-surface-2 px-3.5 text-muted sm:w-80">
          <Search className="h-4 w-4 shrink-0" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="E-Mails durchsuchen"
            aria-label="E-Mails durchsuchen"
            className="w-full min-w-0 bg-transparent text-sm text-text outline-none placeholder:text-muted"
          />
        </label>
      </header>
      {/* Text in Grundfarbe: Gelb auf hellem Gelb erreicht den nötigen Kontrast nicht. */}
      <div role="note" className="mx-2 mb-3 flex items-start gap-2.5 rounded-2xl bg-warning-soft px-3.5 py-2 text-xs leading-relaxed text-text sm:mx-6 sm:text-[0.82rem]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <span>Übungs-Postfach: Mails bleiben in Freebie und werden beim Abmelden gelöscht. Bitte keine echten oder vertraulichen Daten.</span>
      </div>

      <div className="flex min-h-0 flex-1 border-t border-border">
        <section
          aria-label={FOLDER_TITLE[folder]}
          className={cn("w-full overflow-y-auto bg-surface pb-20 lg:w-[380px] lg:shrink-0 lg:border-r lg:border-border lg:pb-0", shown && "max-lg:hidden")}
        >
          {listError && (
            <p role="alert" className="m-4 rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">
              {listError}
            </p>
          )}
          {list && mails.length === 0 && (
            <p className="px-6 py-12 text-center text-sm text-muted">
              {debounced.trim() ? "Keine Treffer." : folder === "inbox" ? "Dein Posteingang ist leer." : "Du hast noch nichts gesendet."}
            </p>
          )}
          <ul aria-label="E-Mails">
            {mails.map((m) => (
              <li key={m.id} className="border-b border-border">
                <MailRow mail={m} me={me} active={m.id === selectedId} onOpen={() => onSelect(m.id)} />
              </li>
            ))}
          </ul>
        </section>

        <section ref={readerRef} aria-label="Lesebereich" className={cn("min-w-0 flex-1 overflow-y-auto px-4 py-5 sm:px-10 sm:py-7", !shown && !mailError && "max-lg:hidden")}>
          {mailError && (
            <div className="mx-auto max-w-3xl">
              <BackButton folder={folder} onClick={() => onSelect(null)} />
              <p role="alert" className="mt-3 rounded-2xl bg-danger-soft px-4 py-3 text-sm text-danger">
                {mailError}
              </p>
            </div>
          )}
          {shown && (
            <article aria-label={shown.subject || "(Kein Betreff)"} className="max-w-3xl">
              <BackButton folder={folder} onClick={() => onSelect(null)} />
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-display text-2xl leading-tight font-bold break-words">{shown.subject || "(Kein Betreff)"}</h2>
                {shown.viaFreebie && <FreebieBadge long />}
              </div>
              <div className="mt-4 flex items-start gap-3">
                <MailAvatar local={shown.from} size={42} />
                <div className="min-w-0 flex-1 text-sm leading-relaxed">
                  <div className="break-words">
                    <strong>{shown.from === me ? `Ich (${mailName(shown.from)})` : mailName(shown.from)}</strong>{" "}
                    <span className="text-muted">&lt;{mailAddress(shown.from)}&gt;</span>
                  </div>
                  <div className="text-muted">an {recipientLine(shown.to, me)}</div>
                  {shown.cc.length > 0 && <div className="text-muted">Cc {recipientLine(shown.cc, me)}</div>}
                  <div className="text-muted sm:hidden">{fullDate(shown.sentAt)}</div>
                </div>
                <div className="whitespace-nowrap text-sm text-muted max-sm:hidden">{fullDate(shown.sentAt)}</div>
              </div>

              <div role="toolbar" aria-label="Aktionen für diese E-Mail" className="mt-4 flex flex-wrap items-center gap-1.5 border-b border-border pb-4">
                <ActionButton onClick={() => onCompose(draftFor("reply", shown, me))} icon={<Reply className="h-4 w-4" />} label="Antworten" />
                <ActionButton onClick={() => onCompose(draftFor("all", shown, me))} icon={<ReplyAll className="h-4 w-4" />} label="Allen antworten" />
                <ActionButton onClick={() => onCompose(draftFor("forward", shown, me))} icon={<Forward className="h-4 w-4" />} label="Weiterleiten" />
                {shown.folder === "inbox" && (
                  <ActionButton
                    plain
                    onClick={() => void toggleRead()}
                    icon={shown.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    label={shown.read ? "Als ungelesen markieren" : "Als gelesen markieren"}
                  />
                )}
                <ActionButton plain onClick={() => setConfirmDeleteId(shown.id)} icon={<Trash2 className="h-4 w-4" />} label="Löschen" />
                {onDiscuss && (
                  <button
                    type="button"
                    onClick={() => onDiscuss(shown)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-full border border-primary bg-primary-soft px-3.5 text-sm font-semibold text-primary hover:opacity-90 sm:ml-auto"
                  >
                    <Sparkles className="h-4 w-4" /> Mit Freebie besprechen
                  </button>
                )}
              </div>
              {confirmDelete && (
                <div role="alert" className="mt-3 flex flex-wrap items-center gap-2.5 rounded-2xl bg-danger-soft px-4 py-2.5 text-sm text-danger">
                  <span className="min-w-52 flex-1">Diese E-Mail löschen? Sie verschwindet nur aus deinem Postfach, nicht bei den anderen.</span>
                  <button type="button" onClick={() => void remove()} className="h-8 rounded-full bg-danger px-3.5 font-semibold text-on-danger">
                    Löschen
                  </button>
                  <button type="button" onClick={() => setConfirmDeleteId(null)} className="h-8 rounded-full px-3 font-medium">
                    Abbrechen
                  </button>
                </div>
              )}
              <div className="mt-5 text-[0.95rem] leading-relaxed break-words">
                {bodyBlocks(shown.body).map((b, i) =>
                  b.quote ? (
                    <blockquote key={i} className="my-3 border-l-[3px] border-border-strong pl-3.5 whitespace-pre-wrap text-muted">
                      {b.text}
                    </blockquote>
                  ) : (
                    <div key={i} className="whitespace-pre-wrap">
                      {b.text}
                    </div>
                  ),
                )}
              </div>
            </article>
          )}
          {!shown && !mailError && (
            <div className="grid h-full place-items-center text-center text-muted">
              <div>
                <Mail className="mx-auto h-10 w-10 stroke-[1.5]" />
                <p className="mt-2 text-sm">Wähle links eine E-Mail aus.</p>
              </div>
            </div>
          )}
        </section>
      </div>

      {!shown && (
        <button
          type="button"
          onClick={() => onCompose({ mode: "new", to: [], cc: [], subject: "", body: "", inReplyTo: null })}
          className="absolute right-4 bottom-5 inline-flex h-13 items-center gap-2 rounded-full bg-brand-gradient px-5 font-semibold text-white shadow-lg md:hidden"
        >
          <SquarePen className="h-5 w-5" /> Neue E-Mail
        </button>
      )}
    </div>
  );
}

function MailRow({ mail, me, active, onOpen }: { mail: MailSummary; me: string; active: boolean; onOpen: () => void }) {
  const sent = mail.folder === "sent";
  const who = sent ? `An: ${recipientLine(mail.to, me)}` : mailName(mail.from);
  const unread = !sent && !mail.read;
  const time = listTime(mail.sentAt);
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-current={active ? "true" : undefined}
      aria-label={`${unread ? "Ungelesen: " : ""}${who}, ${mail.subject || "(Kein Betreff)"}, ${time}`}
      className={cn("flex w-full items-start gap-3 px-4 py-3 text-left transition-colors", active ? "bg-primary-soft" : "hover:bg-surface-2")}
    >
      <MailAvatar local={sent ? (mail.to[0] ?? me) : mail.from} />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2">
          {unread && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
          <span className={cn("min-w-0 flex-1 truncate text-sm", unread ? "font-bold" : "font-medium")}>{who}</span>
          <span className={cn("shrink-0 text-xs", unread ? "font-bold text-primary" : "text-muted")}>{time}</span>
        </span>
        <span className={cn("truncate text-[0.85rem]", unread ? "font-bold" : "font-medium")}>{mail.subject || "(Kein Betreff)"}</span>
        <span className="truncate text-[0.8rem] text-muted">{mail.preview || " "}</span>
        {mail.viaFreebie && <FreebieBadge />}
      </span>
    </button>
  );
}

export function FreebieBadge({ long }: { long?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 self-start rounded-full bg-primary-soft px-2 py-0.5 text-[0.72rem] font-semibold text-primary">
      <Sparkles className="h-3 w-3" /> {long ? "über Freebie gesendet" : "über Freebie"}
    </span>
  );
}

function ActionButton({ onClick, icon, label, plain }: { onClick: () => void; icon: React.ReactNode; label: string; plain?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-muted hover:bg-surface-2 hover:text-text",
        !plain && "border border-border bg-surface",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function BackButton({ folder, onClick }: { folder: MailFolder; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mb-3 inline-flex items-center gap-1.5 rounded-full py-1 pr-3 text-sm font-semibold text-primary lg:hidden">
      <ArrowLeft className="h-4 w-4" /> Zurück zu „{FOLDER_TITLE[folder]}“
    </button>
  );
}
