"use client";
import { ArrowLeft, BarChart3, CalendarDays, Cpu, Loader2, LogOut, Settings, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { OverviewData } from "@/lib/admin";
import type { EventView } from "@/lib/events/store";
import { api, ApiError } from "@/lib/client/api";
import type { ModelRow, PresetRow } from "@/lib/models";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { EventsTab } from "./EventsTab";
import { ModelsTab } from "./ModelsTab";
import { OverviewTab } from "./OverviewTab";
import { PresetsTab } from "./PresetsTab";
import { SecurityTab } from "./SecurityTab";
import { SettingsTab, type AdminSettings } from "./SettingsTab";

type Tab = "overview" | "events" | "models" | "settings" | "presets" | "security";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Übersicht", icon: BarChart3 },
  { id: "events", label: "Termine", icon: CalendarDays },
  { id: "models", label: "Modelle", icon: Cpu },
  { id: "settings", label: "Einstellungen", icon: Settings },
  { id: "presets", label: "Vorlagen", icon: Sparkles },
  { id: "security", label: "Sicherheit", icon: Shield },
];

interface Data {
  overview: OverviewData;
  models: ModelRow[];
  presets: PresetRow[];
  settings: AdminSettings;
  events: EventView[];
}

async function fetchAll(): Promise<Data> {
  const [overview, models, presets, settings, events] = await Promise.all([
    api<OverviewData>("/api/admin/overview", { admin: true }),
    api<{ models: ModelRow[] }>("/api/admin/models", { admin: true }),
    api<{ presets: PresetRow[] }>("/api/admin/presets", { admin: true }),
    api<AdminSettings>("/api/admin/settings", { admin: true }),
    api<{ events: EventView[] }>("/api/admin/events", { admin: true }),
  ]);
  return { overview, models: models.models, presets: presets.presets, settings, events: events.events };
}

export function AdminApp() {
  const [state, setState] = useState<"loading" | "ready">("loading");
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((d: Data) => {
    setData(d);
    setState("ready");
  }, []);
  // Ohne Admin-Sitzung leitet api() zur Anmeldung weiter; alle anderen Fehler hier anzeigen.
  const fail = useCallback((err: unknown) => {
    if (err instanceof ApiError && (err.status === 401 || err.status === 403)) return;
    setError(err instanceof Error ? err.message : "Laden fehlgeschlagen");
  }, []);
  const load = useCallback(() => {
    fetchAll().then(apply).catch(fail);
  }, [apply, fail]);

  useEffect(() => {
    fetchAll().then(apply).catch(fail);
  }, [apply, fail]);

  if (state === "loading") {
    return (
      <div className="grid h-full place-items-center">
        {error ? (
          <div className="text-center">
            <p role="alert" className="text-danger">
              {error}
            </p>
            <Button className="mt-3" onClick={() => window.location.reload()}>
              Neu laden
            </Button>
          </div>
        ) : (
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Lädt …" />
        )}
      </div>
    );
  }
  if (!data) return null;

  const modelOptions = data.models.map((m) => ({ id: m.id, name: m.displayName, enabled: m.enabled }));
  const modelNames = Object.fromEntries(data.models.map((m) => [m.id, m.displayName]));

  return (
    <div className="min-h-full bg-bg-soft">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#120e1d] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Logo />
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold tracking-wide uppercase">Admin</span>
          <div className="flex-1" />
          <Link
            href="/"
            aria-label="Zum Chat"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> <span className="max-sm:hidden">Zum Chat</span>
          </Link>
          <button
            type="button"
            aria-label="Abmelden"
            onClick={async () => {
              try {
                await api("/api/auth/logout", { method: "POST" });
                window.location.replace("/login");
              } catch (err) {
                alert(err instanceof Error ? err.message : "Abmelden hat nicht geklappt.");
              }
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> <span className="max-sm:hidden">Abmelden</span>
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2" aria-label="Admin-Bereiche" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-controls="admin-bereich"
              onClick={() => {
                setTab(t.id);
                // Beim Wechsel frische Zahlen und Daten holen (z. B. neue Nutzung seit dem Öffnen).
                load();
              }}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm",
                tab === t.id ? "bg-white text-[#120e1d] font-semibold" : "text-white/70 hover:bg-white/10 hover:text-white",
              )}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
      </header>
      <main id="admin-bereich" role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label} className="mx-auto max-w-6xl px-4 py-6">
        {tab === "overview" && <OverviewTab data={data.overview} modelNames={modelNames} />}
        {tab === "events" && <EventsTab events={data.events} reload={load} />}
        {tab === "models" && <ModelsTab models={data.models} reload={load} />}
        {tab === "settings" && <SettingsTab initial={data.settings} modelOptions={modelOptions} reload={load} />}
        {tab === "presets" && <PresetsTab presets={data.presets} models={modelOptions} reload={load} />}
        {tab === "security" && <SecurityTab adminUsername={data.overview.status.adminUsername} reload={load} />}
      </main>
    </div>
  );
}
