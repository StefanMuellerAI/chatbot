"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchStatus } from "@/lib/client/groupchat";
import type { GroupChatSummary } from "@/lib/shared/groupchat";
import type { MailStatus } from "@/lib/shared/mail";

/** So oft fragt der Chat nach neuen Mails und Gruppenchats (nur bei sichtbarem Tab). */
export const STATUS_POLL_MS = 15_000;

export interface MailboxState {
  unread: number;
  total: number;
  /** Wird bei jeder Änderung erhöht – Listen laden dann neu. */
  version: number;
  /** Sofort neu abfragen (nach Senden, Lesen, Löschen). */
  refresh: () => void;
  /** Frisch geladene Zahl ungelesener Mails übernehmen (die Liste ist manchmal schneller als die Abfrage). */
  reportUnread: (unread: number) => void;
}

export interface AppStatusState {
  mail: MailboxState;
  /** Eigene Gruppenchats (leer, solange Gruppenchats aus sind). */
  groupChats: GroupChatSummary[];
  /** Sofort neu abfragen (nach dem Starten, Verlassen, Löschen eines Gruppenchats). */
  refresh: () => void;
}

/**
 * Gemeinsame Statusabfrage für Posteingang und Gruppenchats – eine Anfrage alle 15 Sekunden statt zwei.
 * Ein Server-Push wäre auf Vercel teuer. Neue Mails meldet `onNewMail`, neue Einladungen `onInvite`.
 */
export function useAppStatus(
  opts: { mail: boolean; groupChats: boolean },
  onNewMail: (latest: NonNullable<MailStatus["latest"]>) => void,
  onInvite: (chat: GroupChatSummary) => void,
): AppStatusState {
  const enabled = opts.mail || opts.groupChats;
  const [mail, setMail] = useState<{ unread: number; total: number }>({ unread: 0, total: 0 });
  const [chats, setChats] = useState<GroupChatSummary[]>([]);
  const [version, setVersion] = useState(0);
  /** Neueste Mail im Posteingang beim letzten Abruf (undefined: noch nie abgefragt). */
  const latest = useRef<{ id: string; sentAt: string } | null | undefined>(undefined);
  /** Bekannte Gruppenchats (undefined: noch nie abgefragt – beim ersten Mal keine Hinweise). */
  const known = useRef<Set<string> | undefined>(undefined);
  const notify = useRef({ onNewMail, onInvite });
  const pollRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    notify.current = { onNewMail, onInvite };
  }, [onNewMail, onInvite]);

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    let running = false;
    const poll = async () => {
      clearTimeout(timer);
      if (running) return;
      running = true;
      try {
        if (document.visibilityState === "visible") {
          const s = await fetchStatus();
          if (cancelled) return;
          if (s.mail) {
            const m = s.mail;
            setMail((prev) => (prev.unread === m.unread && prev.total === m.total ? prev : { unread: m.unread, total: m.total }));
            const next = m.latest ? { id: m.latest.id, sentAt: m.latest.sentAt } : null;
            const prev = latest.current;
            if (prev !== undefined && next && next.id !== prev?.id) {
              setVersion((v) => v + 1);
              // Nur wirklich neue Mails melden: nach dem Löschen der neuesten rückt eine ältere nach.
              if (!prev || next.sentAt > prev.sentAt) notify.current.onNewMail(m.latest!);
            }
            latest.current = next;
          }
          const list = s.groupChats ?? [];
          setChats((prev) => (JSON.stringify(prev) === JSON.stringify(list) ? prev : list));
          if (known.current) {
            for (const c of list) if (!known.current.has(c.id) && !c.mine && !c.left) notify.current.onInvite(c);
          }
          known.current = new Set(list.map((c) => c.id));
        }
      } catch {
        // offline oder Funktionen abgeschaltet: beim nächsten Mal wieder
      } finally {
        running = false;
        if (!cancelled) timer = setTimeout(() => void poll(), STATUS_POLL_MS);
      }
    };
    pollRef.current = poll;
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    void poll();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [enabled]);

  const refreshMail = useCallback(() => {
    setVersion((v) => v + 1);
    void pollRef.current();
  }, []);
  const refresh = useCallback(() => void pollRef.current(), []);
  const reportUnread = useCallback((unread: number) => {
    setMail((prev) => (prev.unread === unread ? prev : { ...prev, unread }));
  }, []);

  return {
    mail: { unread: opts.mail ? mail.unread : 0, total: opts.mail ? mail.total : 0, version, refresh: refreshMail, reportUnread },
    groupChats: opts.groupChats ? chats : [],
    refresh,
  };
}
