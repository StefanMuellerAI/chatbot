"use client";
import { Loader2, Send, Trash2, Users, X } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { fetchContacts, sendMailRequest, type ComposeDraft } from "@/lib/client/mail";
import { mailAddress, mailName, MAIL_LIMITS, parseAddress, splitAddresses, type MailContacts, type MailFull } from "@/lib/shared/mail";
import { Dialog } from "@/components/ui/Dialog";
import { MailAvatar } from "./Avatar";

const TITLES: Record<ComposeDraft["mode"], string> = { new: "Neue E-Mail", reply: "Antworten", all: "Allen antworten", forward: "Weiterleiten" };

interface Suggestion {
  key: string;
  label: string;
  sub: string;
  locals: string[];
  group: boolean;
}

/** Dialog „Neue E-Mail“ mit Adressbuch (eigene Gruppe und Kursleitung). */
export function ComposeDialog({
  draft,
  me,
  onClose,
  onSent,
}: {
  draft: ComposeDraft | null;
  me: string;
  onClose: () => void;
  onSent: (mail: MailFull) => void;
}) {
  return draft ? <ComposeForm key={JSON.stringify(draft)} draft={draft} me={me} onClose={onClose} onSent={onSent} /> : null;
}

function ComposeForm({ draft, me, onClose, onSent }: { draft: ComposeDraft; me: string; onClose: () => void; onSent: (mail: MailFull) => void }) {
  const [to, setTo] = useState(draft.to);
  const [cc, setCc] = useState(draft.cc);
  const [showCc, setShowCc] = useState(draft.cc.length > 0);
  const [subject, setSubject] = useState(draft.subject);
  const [body, setBody] = useState(draft.body);
  const [contacts, setContacts] = useState<MailContacts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const toRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchContacts()
      .then(setContacts)
      .catch((err) => setError(err instanceof Error ? err.message : "Das Adressbuch konnte nicht geladen werden."));
  }, []);

  // Antworten: Cursor an den Anfang des Textes; neue Mail: ins Feld „An“.
  useEffect(() => {
    if (draft.mode === "reply" || draft.mode === "all") {
      bodyRef.current?.focus();
      bodyRef.current?.setSelectionRange(0, 0);
    } else {
      toRef.current?.focus();
    }
  }, [draft.mode]);

  const known = useMemo(() => {
    const set = new Set<string>([me]);
    if (contacts?.teacher) set.add(contacts.teacher.local);
    for (const g of contacts?.groups ?? []) for (const m of g.members) set.add(m.local);
    return set;
  }, [contacts, me]);

  const suggestions = useMemo<Suggestion[]>(() => {
    if (!contacts) return [];
    const out: Suggestion[] = [];
    const guestView = Boolean(contacts.teacher);
    for (const g of contacts.groups) {
      if (g.members.length > 0) {
        out.push({
          key: `gruppe-${g.id}`,
          label: guestView ? "Alle in meiner Gruppe" : `Alle in „${g.name}“`,
          sub: `${guestView ? g.name : `${g.eventName} · ${g.name}`} · ${g.members.length} ${g.members.length === 1 ? "Person" : "Personen"}`,
          locals: g.members.map((m) => m.local),
          group: true,
        });
      }
      for (const m of g.members) {
        out.push({ key: m.local, label: m.name, sub: `${m.address} · ${guestView ? g.name : `${g.eventName} · ${g.name}`}`, locals: [m.local], group: false });
      }
    }
    if (contacts.teacher) out.push({ key: contacts.teacher.local, label: contacts.teacher.name, sub: contacts.teacher.address, locals: [contacts.teacher.local], group: false });
    return out;
  }, [contacts]);

  /** Prüft Einträge gegen das Adressbuch; liefert die lokalen Teile oder setzt eine Meldung. */
  const accept = (entries: string[]): string[] | null => {
    const out: string[] = [];
    for (const entry of entries) {
      const local = parseAddress(entry);
      if (!local) {
        setError(`„${entry}“ ist keine Adresse in Freebie (…@freebie.example).`);
        return null;
      }
      if (contacts && !known.has(local)) {
        setError(
          contacts.teacher
            ? `„${mailAddress(local)}“ kann nicht zugestellt werden. Du kannst nur deiner Gruppe und der Kursleitung schreiben.`
            : `„${mailAddress(local)}“ kann nicht zugestellt werden: Es gibt keinen Gast mit diesem Namen in einem laufenden Termin.`,
        );
        return null;
      }
      out.push(local);
    }
    setError(null);
    return out;
  };

  const dirty = to.join() !== draft.to.join() || cc.join() !== draft.cc.join() || subject !== draft.subject || body !== draft.body;
  const requestClose = () => {
    if (dirty && !confirmDiscard) setConfirmDiscard(true);
    else onClose();
  };

  const send = async (pending: { to: string; cc: string }) => {
    if (busy) return;
    const extraTo = pending.to.trim() ? accept(splitAddresses(pending.to)) : [];
    const extraCc = pending.cc.trim() ? accept(splitAddresses(pending.cc)) : [];
    if (!extraTo || !extraCc) return;
    const allTo = [...new Set([...to, ...extraTo])];
    const allCc = [...new Set([...cc, ...extraCc])].filter((l) => !allTo.includes(l));
    if (allTo.length === 0) {
      setError("Bitte gib mindestens einen Empfänger an.");
      return;
    }
    if (!subject.trim() && !body.trim()) {
      setError("Bitte einen Betreff oder Text eingeben.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const mail = await sendMailRequest({ to: allTo, cc: allCc, subject, body, inReplyTo: draft.inReplyTo });
      onSent(mail);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Senden hat nicht geklappt.");
      setBusy(false);
    }
  };

  const [toText, setToText] = useState("");
  const [ccText, setCcText] = useState("");

  return (
    // Esc, X und Klick daneben fragen nach, wenn schon etwas geschrieben ist.
    <Dialog open onClose={requestClose} title={TITLES[draft.mode]} className="w-[min(720px,calc(100vw-1rem))]">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send({ to: toText, cc: ccText });
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            void send({ to: toText, cc: ccText });
          }
        }}
        className="-mx-6 -mb-6 flex flex-col border-t border-border"
      >
        <div className="px-6">
          <div className="flex min-h-11 items-center gap-3 border-b border-border text-sm">
            <span className="w-14 shrink-0 text-muted">Von</span>
            <span className="truncate">
              {mailName(me)} &lt;{mailAddress(me)}&gt;
            </span>
          </div>
          <AddressField
            label="An"
            values={to}
            onChange={setTo}
            text={toText}
            onText={setToText}
            inputRef={toRef}
            suggestions={suggestions}
            accept={accept}
            placeholder={to.length ? "" : "Name oder Adresse, z. B. wolke83"}
            extra={
              !showCc && (
                <button type="button" onClick={() => setShowCc(true)} className="h-8 rounded-full px-2.5 text-sm text-muted hover:bg-surface-2 hover:text-text">
                  Cc
                </button>
              )
            }
          />
          {showCc && <AddressField label="Cc" values={cc} onChange={setCc} text={ccText} onText={setCcText} suggestions={suggestions} accept={accept} />}
          <label className="flex min-h-12 items-center gap-3 border-b border-border">
            <span className="w-14 shrink-0 text-sm text-muted">Betreff</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onKeyDown={(e) => {
                // Enter im Betreff springt in den Text, statt die Mail abzuschicken.
                if (e.key === "Enter" && !e.ctrlKey && !e.metaKey) {
                  e.preventDefault();
                  bodyRef.current?.focus();
                }
              }}
              maxLength={MAIL_LIMITS.subject}
              className="h-10 min-w-0 flex-1 bg-transparent text-[0.95rem] font-semibold outline-none"
            />
          </label>
        </div>
        <textarea
          ref={bodyRef}
          aria-label="Text der E-Mail"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={MAIL_LIMITS.body}
          placeholder="Schreib deine Nachricht …"
          className="min-h-60 resize-y bg-transparent px-6 py-4 text-[0.95rem] leading-relaxed outline-none placeholder:text-muted max-sm:flex-1"
        />
        {error && (
          <p role="alert" className="mx-6 mb-3 rounded-xl bg-danger-soft px-3.5 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        {confirmDiscard && (
          <div role="alert" className="mx-6 mb-3 flex flex-wrap items-center gap-2.5 rounded-xl bg-surface-2 px-3.5 py-2 text-sm">
            <span className="min-w-44 flex-1">Entwurf verwerfen? Der Text geht verloren.</span>
            <button type="button" onClick={onClose} className="h-8 rounded-full bg-danger px-3.5 font-semibold text-on-danger">
              Verwerfen
            </button>
            <button type="button" onClick={() => setConfirmDiscard(false)} className="h-8 rounded-full px-3 font-medium">
              Weiter schreiben
            </button>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 border-t border-border px-6 py-3.5">
          <button type="submit" disabled={busy} className="inline-flex h-10 items-center gap-2 rounded-full bg-brand-gradient px-5 font-semibold text-white shadow-md disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Senden
          </button>
          <span className="text-xs text-muted max-sm:hidden">oder Strg + Enter</span>
          <div className="flex-1" />
          <button type="button" onClick={requestClose} className="inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-sm text-muted hover:bg-surface-2 hover:text-text">
            <Trash2 className="h-4 w-4" /> Verwerfen
          </button>
        </div>
      </form>
    </Dialog>
  );
}

function AddressField({
  label,
  values,
  onChange,
  text,
  onText,
  suggestions,
  accept,
  placeholder,
  inputRef,
  extra,
}: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  text: string;
  onText: (v: string) => void;
  suggestions: Suggestion[];
  accept: (entries: string[]) => string[] | null;
  placeholder?: string;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  extra?: React.ReactNode;
}) {
  const id = useId();
  const [book, setBook] = useState(false);
  const typed = text.trim().toLowerCase();
  const matches = typed
    ? suggestions.filter((s) => `${s.label} ${s.sub}`.toLowerCase().includes(typed) || (s.group && "alle gruppe".includes(typed)))
    : suggestions;
  const open = book || typed.length > 0;

  const add = (locals: string[]) => {
    onChange([...new Set([...values, ...locals])]);
    onText("");
    setBook(false);
  };
  const commit = () => {
    if (!text.trim()) return;
    const accepted = accept(splitAddresses(text));
    if (accepted) add(accepted);
  };

  return (
    <div className="border-b border-border">
      <div className="flex min-h-12 items-center gap-3 py-1.5">
        <label htmlFor={id} className="w-14 shrink-0 text-sm text-muted">
          {label}
        </label>
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {values.map((local) => (
            <span key={local} className="inline-flex h-7.5 items-center gap-1.5 rounded-full bg-surface-2 pr-0.5 pl-1 text-sm">
              <MailAvatar local={local} size={22} />
              {mailName(local)}
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== local))}
                aria-label={`${mailName(local)} entfernen`}
                className="grid h-6 w-6 place-items-center rounded-full text-muted hover:bg-surface-3 hover:text-text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <input
            id={id}
            ref={inputRef}
            value={text}
            autoComplete="off"
            placeholder={placeholder}
            onChange={(e) => onText(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if ((e.key === "Enter" && !e.ctrlKey && !e.metaKey) || e.key === "," || e.key === ";") {
                e.preventDefault();
                commit();
              } else if (e.key === "Backspace" && !text && values.length) {
                onChange(values.slice(0, -1));
              } else if (e.key === "Escape" && open) {
                e.preventDefault();
                e.stopPropagation();
                setBook(false);
                onText("");
              }
            }}
            className="h-8 min-w-36 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
        </div>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setBook((v) => !v)}
          aria-expanded={book}
          className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-primary hover:bg-surface-2"
        >
          <Users className="h-4 w-4" /> <span className="max-sm:hidden">Adressbuch</span>
          <span className="sr-only sm:hidden">Adressbuch</span>
        </button>
        {extra}
      </div>
      {open && (
        <div className="mb-2 rounded-2xl border border-border bg-surface p-1.5 shadow-soft">
          <div className="px-2.5 pt-1 pb-1.5 text-[0.7rem] font-semibold tracking-wide text-muted uppercase">Adressbuch</div>
          {matches.length === 0 && (
            <p className="px-2.5 pb-2 text-sm text-muted">
              {suggestions.length === 0 ? "Gerade ist niemand erreichbar." : "Niemand passt dazu. Du kannst nur Personen aus deinem Adressbuch schreiben."}
            </p>
          )}
          <ul aria-label={`Adressbuch für „${label}“`} className="max-h-60 overflow-y-auto">
            {matches.map((s) => (
              <li key={s.key}>
                <button
                  type="button"
                  // Vor dem onBlur des Eingabefelds auswählen, sonst wird der getippte Text erst geprüft.
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => add(s.locals)}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left hover:bg-surface-2"
                >
                  {s.group ? (
                    <span aria-hidden="true" className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-3">
                      <Users className="h-4 w-4" />
                    </span>
                  ) : (
                    <MailAvatar local={s.locals[0]} size={32} />
                  )}
                  <span className="flex min-w-0 flex-col text-sm">
                    <span className="font-medium">{s.label}</span>
                    <span className="truncate text-xs text-muted">{s.sub}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
