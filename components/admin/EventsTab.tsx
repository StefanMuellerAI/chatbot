"use client";
import { CalendarPlus, Eye, EyeOff, FileDown, KeyRound, Loader2, Pencil, Plus, Printer, Square, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/client/api";
import type { EventView, GroupView } from "@/lib/events/store";
import { credentialsCsv, csvFileName, formatRange, fromInputs, toInputs, type CredentialRow } from "@/lib/events/format";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { cn } from "@/components/ui/cn";
import { Card, Field, inputClass, Notice } from "./fields";

type Filter = "laeuft" | "geplant" | "vorbei";
const FILTERS: [Filter, string][] = [
  ["laeuft", "Läuft"],
  ["geplant", "Geplant"],
  ["vorbei", "Vorbei"],
];
const STATUS_LABEL: Record<Filter, string> = { laeuft: "läuft", geplant: "geplant", vorbei: "vorbei" };

const usd = (n: number) => new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD", maximumFractionDigits: n < 0.1 ? 4 : 2 }).format(n);
const lastLogin = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat("de-DE", { timeZone: "Europe/Berlin", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)) + " Uhr" : "noch nicht";

function download(name: string, content: string) {
  const url = URL.createObjectURL(new Blob([content], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function rows(event: EventView, groups: GroupView[]): CredentialRow[] {
  const validUntil = event.endedEarlyAt ?? event.endsAt;
  return groups.flatMap((g) => g.guests.map((x) => ({ username: x.username, password: x.password, group: g.name, event: event.name, validUntil })));
}

export function EventsTab({ events, reload }: { events: EventView[]; reload: () => void }) {
  const counts = Object.fromEntries(FILTERS.map(([f]) => [f, events.filter((e) => e.status === f).length])) as Record<Filter, number>;
  const [filter, setFilter] = useState<Filter>(counts.laeuft > 0 ? "laeuft" : "geplant");
  const [editing, setEditing] = useState<EventView | "neu" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const shown = events.filter((e) => e.status === filter);
  // Vergangene Termine zuerst die jüngsten.
  if (filter === "vorbei") shown.reverse();

  const run = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
      reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Aktion fehlgeschlagen");
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Termine"
        description="Pro Termin (höchstens 24 Stunden) beliebig viele Gruppen mit beliebig vielen Gästen. Gäste können sich ab 30 Minuten vor Beginn anmelden; mit dem Ende verfallen ihre Zugänge sofort."
        actions={
          <Button size="sm" variant="primary" onClick={() => setEditing("neu")}>
            <CalendarPlus className="h-4 w-4" /> Termin anlegen
          </Button>
        }
      >
        <div className="flex flex-wrap gap-2" role="group" aria-label="Termine filtern">
          {FILTERS.map(([f, label]) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={cn("rounded-full px-3 py-1.5 text-sm", filter === f ? "bg-primary text-primary-contrast" : "bg-surface-2 text-muted hover:text-text")}
            >
              {label} ({counts[f]})
            </button>
          ))}
        </div>
        {error && (
          <div className="mt-4">
            <Notice tone="danger">{error}</Notice>
          </div>
        )}
        {shown.length === 0 && (
          <p className="mt-4 text-sm text-muted">
            {filter === "laeuft" ? "Gerade läuft kein Termin." : filter === "geplant" ? "Keine geplanten Termine." : "Noch keine vergangenen Termine."}
          </p>
        )}
      </Card>

      {shown.map((event) => (
        <EventCard key={event.id} event={event} run={run} onEdit={() => setEditing(event)} />
      ))}

      {editing && (
        <EventDialog
          initial={editing === "neu" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(status) => {
            setEditing(null);
            if (status) setFilter(status);
            reload();
          }}
        />
      )}
    </div>
  );
}

function EventCard({ event, run, onEdit }: { event: EventView; run: (fn: () => Promise<unknown>) => Promise<void>; onEdit: () => void }) {
  const [newGroup, setNewGroup] = useState(false);
  const over = event.status === "vorbei";
  const label = `„${event.name}“`;
  return (
    <section aria-label={`Termin ${label}`} className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold">
            {event.name}{" "}
            <span
              className={cn(
                "ml-1 rounded-full px-2 py-0.5 align-middle text-xs font-semibold",
                event.status === "laeuft" ? "bg-success-soft text-success" : event.status === "geplant" ? "bg-primary-soft text-primary" : "bg-surface-3 text-muted",
              )}
            >
              {STATUS_LABEL[event.status]}
              {event.endedEarlyAt && " (vorzeitig beendet)"}
            </span>
          </h3>
          <p className="mt-0.5 text-sm text-muted">{formatRange(event.startsAt, event.endedEarlyAt ?? event.endsAt)}</p>
          <p className="mt-1 text-sm">
            {event.groups.length} {event.groups.length === 1 ? "Gruppe" : "Gruppen"} · {event.guestTotal} Gäste · {event.guestsLoggedIn} angemeldet · {event.requests} Anfragen · {usd(event.costUsd)}
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          {!over && (
            <>
              <Button size="sm" variant="ghost" onClick={() => window.open(`/admin/druck?termin=${event.id}`, "_blank")} aria-label={`Zugangsdaten für ${label} drucken`}>
                <Printer className="h-4 w-4" /> Drucken
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => download(csvFileName(event.name), credentialsCsv(rows(event, event.groups)))}
                aria-label={`Zugangsdaten für ${label} als CSV`}
              >
                <FileDown className="h-4 w-4" /> CSV
              </Button>
              <Button size="sm" variant="ghost" onClick={onEdit} aria-label={`Termin ${label} bearbeiten`}>
                <Pencil className="h-4 w-4" /> Bearbeiten
              </Button>
            </>
          )}
          {event.status === "laeuft" && (
            <Button
              size="sm"
              variant="secondary"
              aria-label={`Termin ${label} jetzt beenden`}
              onClick={() =>
                confirm(`Termin ${label} jetzt beenden? Alle Gäste werden sofort abgemeldet und ihre Zugänge gelöscht.`) &&
                run(() => api("/api/admin/events/end", { method: "POST", json: { id: event.id }, admin: true }))
              }
            >
              <Square className="h-4 w-4" /> Jetzt beenden
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Termin ${label} löschen`}
            onClick={() =>
              confirm(over ? `Termin ${label} aus der Statistik löschen?` : `Termin ${label} löschen? Alle Gäste werden sofort abgemeldet.`) &&
              run(() => api(`/api/admin/events?id=${encodeURIComponent(event.id)}`, { method: "DELETE", admin: true }))
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {over ? (
        <p className="mt-4 text-sm text-muted">Der Termin ist vorbei, die Zugänge sind gelöscht. Kosten und Anfragen bleiben 90 Tage in der Statistik.</p>
      ) : (
        <div className="mt-4 space-y-4">
          {event.groups.map((group) => (
            <GroupBlock key={group.id} event={event} group={group} run={run} />
          ))}
          {event.groups.length === 0 && <p className="text-sm text-muted">Noch keine Gruppen – lege die erste an, um Zugänge zu erzeugen.</p>}
          <Button size="sm" variant="secondary" onClick={() => setNewGroup(true)} aria-label={`Gruppe zu ${label} hinzufügen`}>
            <Plus className="h-4 w-4" /> Gruppe hinzufügen
          </Button>
        </div>
      )}

      {newGroup && <GroupDialog eventId={event.id} onClose={() => setNewGroup(false)} onSaved={() => run(async () => setNewGroup(false))} />}
    </section>
  );
}

function GroupBlock({ event, group, run }: { event: EventView; group: GroupView; run: (fn: () => Promise<unknown>) => Promise<void> }) {
  const [reveal, setReveal] = useState(false);
  const [count, setCount] = useState("5");
  const [busy, setBusy] = useState(false);
  const label = `„${group.name}“`;
  const add = async () => {
    setBusy(true);
    await run(() => api("/api/admin/events/guests", { method: "POST", json: { groupId: group.id, count: Number(count) }, admin: true }));
    setBusy(false);
  };
  return (
    <div role="group" aria-label={`Gruppe ${label}`} className="rounded-2xl border border-border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="flex items-center gap-2 font-semibold">
          <Users className="h-4 w-4 text-muted" /> {group.name}
          <span className="text-sm font-normal text-muted">
            · {group.guests.length} {group.guests.length === 1 ? "Gast" : "Gäste"} · {group.requests} Anfragen · {usd(group.costUsd)}
          </span>
        </h4>
        <div className="flex flex-wrap gap-1">
          <Button size="sm" variant="ghost" onClick={() => setReveal((v) => !v)} aria-label={`Passwörter in ${label} ${reveal ? "verbergen" : "zeigen"}`}>
            {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => window.open(`/admin/druck?termin=${event.id}&gruppe=${group.id}`, "_blank")} aria-label={`Zugangsdaten für ${label} drucken`}>
            <Printer className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => download(csvFileName(event.name, group.name), credentialsCsv(rows(event, [group])))}
            aria-label={`Zugangsdaten für ${label} als CSV`}
          >
            <FileDown className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Gruppe ${label} umbenennen`}
            onClick={() => {
              const name = prompt("Neuer Name der Gruppe", group.name);
              if (name && name.trim() && name.trim() !== group.name) {
                void run(() => api("/api/admin/events/groups", { method: "PUT", json: { id: group.id, name }, admin: true }));
              }
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            aria-label={`Gruppe ${label} löschen`}
            onClick={() =>
              confirm(`Gruppe ${label} mit allen Gästen löschen? Ihre Sitzungen enden sofort.`) &&
              run(() => api(`/api/admin/events/groups?id=${encodeURIComponent(group.id)}`, { method: "DELETE", admin: true }))
            }
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {group.guests.length > 0 && (
        <table className="mt-3 w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="py-1 font-medium">Benutzername</th>
              <th className="py-1 font-medium">Passwort</th>
              <th className="py-1 font-medium max-sm:hidden">Zuletzt angemeldet</th>
              <th className="py-1" />
            </tr>
          </thead>
          <tbody>
            {group.guests.map((g) => (
              <tr key={g.id} className="border-t border-border">
                <td className="py-1.5 font-mono">{g.username}</td>
                <td className="py-1.5 font-mono">{reveal ? (g.password ?? "–") : "••••••••"}</td>
                <td className="py-1.5 text-muted max-sm:hidden">{lastLogin(g.lastLoginAt)}</td>
                <td className="py-1.5 text-right whitespace-nowrap">
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`Neues Passwort für ${g.username}`}
                    onClick={() =>
                      confirm(`Neues Passwort für ${g.username} erzeugen? Das alte gilt dann nicht mehr.`) &&
                      run(async () => {
                        await api("/api/admin/events/guests/password", { method: "POST", json: { id: g.id }, admin: true });
                        setReveal(true);
                      })
                    }
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={`${g.username} löschen`}
                    onClick={() =>
                      confirm(`Zugang ${g.username} löschen? Die Sitzung endet sofort.`) &&
                      run(() => api(`/api/admin/events/guests?id=${encodeURIComponent(g.id)}`, { method: "DELETE", admin: true }))
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="mt-3 flex flex-wrap items-end gap-2">
        <Field label={`Weitere Gäste für ${label}`} className="w-40">
          <input className={inputClass} inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} />
        </Field>
        <Button size="sm" variant="secondary" disabled={busy || !/^\d+$/.test(count.trim())} onClick={add} aria-label={`Gäste zu ${label} hinzufügen`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Hinzufügen
        </Button>
      </div>
    </div>
  );
}

function EventDialog({ initial, onClose, onSaved }: { initial: EventView | null; onClose: () => void; onSaved: (status: Filter | null) => void }) {
  const start = initial ? toInputs(initial.startsAt) : null;
  const end = initial ? toInputs(initial.endsAt) : null;
  const [name, setName] = useState(initial?.name ?? "");
  const [date, setDate] = useState(start?.date ?? toInputs(new Date().toISOString()).date);
  const [from, setFrom] = useState(start?.time ?? "09:00");
  const [to, setTo] = useState(end?.time ?? "17:00");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const range = fromInputs(date, from, to);

  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = { name, startsAt: range.startsAt.toISOString(), endsAt: range.endsAt.toISOString() };
      if (initial) await api("/api/admin/events", { method: "PUT", json: { id: initial.id, ...body }, admin: true });
      else await api("/api/admin/events", { method: "POST", json: body, admin: true });
      onSaved(range.startsAt.getTime() <= Date.now() ? "laeuft" : "geplant");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} title={initial ? "Termin bearbeiten" : "Termin anlegen"} className="w-[min(520px,calc(100vw-2rem))]">
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Name" className="sm:col-span-3">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. KI-Grundlagen Köln" maxLength={100} />
        </Field>
        <Field label="Datum">
          <input className={inputClass} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="von">
          <input className={inputClass} type="time" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="bis">
          <input className={inputClass} type="time" value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
      </div>
      {range.nextDay && <p className="mt-2 text-xs text-muted">Das Ende liegt am Folgetag.</p>}
      {error && (
        <div className="mt-3">
          <Notice tone="danger">{error}</Notice>
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button variant="primary" disabled={busy || !name.trim() || !date || !from || !to} onClick={save}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Speichern
        </Button>
      </div>
    </Dialog>
  );
}

function GroupDialog({ eventId, onClose, onSaved }: { eventId: string; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState("");
  const [count, setCount] = useState("10");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const save = async () => {
    setBusy(true);
    setError(null);
    try {
      await api("/api/admin/events/groups", { method: "POST", json: { eventId, name, count: count.trim() === "" ? 0 : Number(count) }, admin: true });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
      setBusy(false);
    }
  };
  return (
    <Dialog open onClose={onClose} title="Gruppe hinzufügen" className="w-[min(440px,calc(100vw-2rem))]">
      <div className="grid gap-4">
        <Field label="Name der Gruppe">
          <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Gruppe A" maxLength={60} />
        </Field>
        <Field label="Anzahl der Gäste" hint="0 bis 200 – später lassen sich weitere hinzufügen.">
          <input className={inputClass} inputMode="numeric" value={count} onChange={(e) => setCount(e.target.value)} />
        </Field>
      </div>
      {error && (
        <div className="mt-3">
          <Notice tone="danger">{error}</Notice>
        </div>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose}>
          Abbrechen
        </Button>
        <Button variant="primary" disabled={busy || !name.trim()} onClick={save}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Anlegen
        </Button>
      </div>
    </Dialog>
  );
}
