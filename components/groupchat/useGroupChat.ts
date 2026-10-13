"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ApiError } from "@/lib/client/api";
import { fetchGroupChat } from "@/lib/client/groupchat";
import { GROUPCHAT_IDLE_AFTER_MS, GROUPCHAT_IDLE_POLL_MS, GROUPCHAT_POLL_MS, type GroupChatDetail, type GroupChatMessage } from "@/lib/shared/groupchat";

/** Neue und geänderte Beiträge einsortieren; ein neuerer Stand gewinnt (auch bei überholenden Antworten). */
function merge(current: GroupChatMessage[], changed: GroupChatMessage[]): GroupChatMessage[] {
  if (changed.length === 0) return current;
  const byId = new Map(current.map((m) => [m.id, m]));
  for (const m of changed) {
    const old = byId.get(m.id);
    if (!old || old.version <= m.version) byId.set(m.id, m);
  }
  return [...byId.values()].sort((a, b) => a.seq - b.seq);
}

/**
 * Hält einen offenen Gruppenchat aktuell: alle 4 Sekunden nur das Geänderte („seit Stand n“), nach zwei
 * Minuten ohne Neues alle 10 Sekunden – nur bei sichtbarem Tab, sofort beim Zurückkehren und nach
 * eigenen Aktionen. Gibt es den Chat nicht mehr (gelöscht, Schalter aus), meldet `onGone` das.
 */
export function useGroupChat(chatId: string, onGone: (message: string) => void) {
  const [chat, setChat] = useState<GroupChatDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const version = useRef(0);
  const lastActivity = useRef(0);
  const goneRef = useRef(onGone);
  const loadRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    goneRef.current = onGone;
  }, [onGone]);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    version.current = 0;
    lastActivity.current = Date.now();
    const load = async () => {
      const since = version.current;
      try {
        const next = await fetchGroupChat(chatId, since);
        if (cancelled) return;
        if (since > 0 && next.messages.length > 0) lastActivity.current = Date.now();
        version.current = Math.max(version.current, next.version);
        setLoadError(null);
        setChat((prev) => {
          let messages = since === 0 || !prev ? next.messages : merge(prev.messages, next.messages);
          // Nach dem Verlassen bleibt nur, was bis dahin feststand.
          if (next.left) messages = messages.filter((m) => m.status !== "pending");
          return { ...next, messages };
        });
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && (err.status === 404 || err.status === 403)) {
          cancelled = true;
          goneRef.current(err.message);
          return;
        }
        if (version.current === 0) setLoadError(err instanceof Error ? err.message : "Der Gruppenchat konnte nicht geladen werden.");
      }
    };
    const loop = async () => {
      if (version.current === 0 || document.visibilityState === "visible") await load();
      if (cancelled) return;
      const idle = Date.now() - lastActivity.current > GROUPCHAT_IDLE_AFTER_MS;
      timer = setTimeout(() => void loop(), idle ? GROUPCHAT_IDLE_POLL_MS : GROUPCHAT_POLL_MS);
    };
    loadRef.current = load;
    const onVisible = () => {
      if (document.visibilityState === "visible") void load();
    };
    void loop();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [chatId]);

  /** Sofort neu abfragen (nach eigenen Beiträgen und Änderungen) – wartet auf das Ergebnis. */
  const refresh = useCallback(async () => {
    lastActivity.current = Date.now();
    await loadRef.current();
  }, []);

  return { chat, loadError, refresh };
}
