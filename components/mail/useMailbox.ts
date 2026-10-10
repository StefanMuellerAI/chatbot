"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { fetchMailStatus } from "@/lib/client/mail";
import type { MailStatus } from "@/lib/shared/mail";

/** So oft fragt der Chat nach neuen Mails (nur bei sichtbarem Tab). */
export const MAIL_POLL_MS = 15_000;

export interface MailboxState {
  unread: number;
  total: number;
  /** Wird bei jeder Änderung erhöht – Listen laden dann neu. */
  version: number;
  /** Sofort neu abfragen (nach Senden, Lesen, Löschen). */
  refresh: () => void;
}

/**
 * Fragt den Status des Posteingangs regelmäßig ab. Ein Server-Push wäre auf Vercel teuer; bei 25
 * Personen sind das rund 100 schlanke Anfragen pro Minute. Neue Mails meldet `onNewMail`.
 */
export function useMailbox(enabled: boolean, onNewMail: (latest: NonNullable<MailStatus["latest"]>) => void): MailboxState {
  const [status, setStatus] = useState<{ unread: number; total: number }>({ unread: 0, total: 0 });
  const [version, setVersion] = useState(0);
  const latestId = useRef<string | null | undefined>(undefined);
  const notify = useRef(onNewMail);
  const pollRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    notify.current = onNewMail;
  }, [onNewMail]);

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
          const s = await fetchMailStatus();
          if (cancelled) return;
          setStatus((prev) => (prev.unread === s.unread && prev.total === s.total ? prev : { unread: s.unread, total: s.total }));
          const id = s.latest?.id ?? null;
          if (latestId.current !== undefined && id && id !== latestId.current) {
            setVersion((v) => v + 1);
            notify.current(s.latest!);
          }
          latestId.current = id;
        }
      } catch {
        // offline oder Posteingang abgeschaltet: beim nächsten Mal wieder
      } finally {
        running = false;
        if (!cancelled) timer = setTimeout(() => void poll(), MAIL_POLL_MS);
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

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
    void pollRef.current();
  }, []);

  return { unread: enabled ? status.unread : 0, total: enabled ? status.total : 0, version, refresh };
}
