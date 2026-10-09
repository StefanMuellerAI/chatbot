"use client";
import { Clock, Download } from "lucide-react";
import { useEffect, useState } from "react";
import { downloadExport } from "@/lib/client/db";
import { formatTime } from "@/lib/events/window";

/** So lange vor dem Ende warnt der Chat Gäste (mit Export-Knopf). */
export const WARN_BEFORE_MS = 10 * 60 * 1000;
/** Längster Abstand zwischen zwei Prüfungen (Ruhezustand, gedrosselte Hintergrund-Tabs). */
const MAX_WAIT_MS = 30_000;
/** Auch außerhalb der Warnzeit regelmäßig nachfragen – ein verkürzter Termin fällt so rechtzeitig auf. */
const CHECK_EVERY_MS = 5 * 60 * 1000;

/** Fragt den Server nach dem aktuellen Ende des Zugangs: Zeitpunkt, null (vorbei) oder undefined (offline). */
async function currentEnd(): Promise<number | null | undefined> {
  try {
    const res = await fetch("/api/auth/session", { cache: "no-store" });
    if (res.status === 401 || res.status === 403) return null;
    if (!res.ok) return undefined;
    const data = (await res.json()) as { validUntil?: string | null };
    return data.validUntil ? Date.parse(data.validUntil) : null;
  } catch {
    return undefined;
  }
}

/**
 * Für Gäste: 10 Minuten vor dem Termin-Ende ein Hinweis mit Export; zum Ende zurück zur Anmeldung,
 * die dann die Chats vom Gerät löscht. Der Chat fragt alle 5 Minuten, in der Warnzeit bei jeder Prüfung
 * beim Server nach – ein verlängerter oder verkürzter Termin kommt so ohne Neuladen an.
 */
export function AccessExpiry({ validUntil, onChange }: { validUntil: string | null; onChange: (validUntil: string) => void }) {
  const until = validUntil ? Date.parse(validUntil) : null;
  const [warn, setWarn] = useState(false);

  useEffect(() => {
    if (until === null) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    let lastCheck = Date.now();
    const tick = async () => {
      const left = until - Date.now();
      if (left <= WARN_BEFORE_MS || Date.now() - lastCheck >= CHECK_EVERY_MS) {
        lastCheck = Date.now();
        const end = await currentEnd();
        if (cancelled) return;
        // Vorbei (oder verschoben): neu laden – die Seite leitet mit dem passenden Hinweis zur Anmeldung.
        if (end === null) return window.location.replace(`${window.location.origin}/`);
        if (end !== undefined && end !== until) return onChange(new Date(end).toISOString());
      }
      setWarn(left <= WARN_BEFORE_MS);
      // Uhr des Geräts geht vor oder keine Verbindung: nach kurzer Pause erneut fragen.
      const wait = left <= 0 ? 5_000 : (left > WARN_BEFORE_MS ? left - WARN_BEFORE_MS : left) + 250;
      timer = setTimeout(tick, Math.min(wait, MAX_WAIT_MS));
    };
    void tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [until, onChange]);

  if (!warn || until === null) return null;
  return (
    <div role="status" className="mx-4 mb-2 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-2 text-sm text-warning print:hidden">
      <Clock className="h-4 w-4 shrink-0" />
      <span className="min-w-0 flex-1">
        Dein Zugang endet um {formatTime(new Date(until))} Uhr. Danach werden deine Chats von diesem Gerät gelöscht – wenn du sie behalten möchtest, jetzt exportieren.
      </span>
      <button
        type="button"
        onClick={() => void downloadExport()}
        className="inline-flex items-center gap-1.5 rounded-full border border-warning/40 px-3 py-1 font-medium hover:bg-warning/10"
      >
        <Download className="h-4 w-4" /> Chats exportieren
      </button>
    </div>
  );
}
