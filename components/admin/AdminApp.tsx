"use client";
import { ArrowLeft, BarChart3, Cpu, Loader2, Lock, LogOut, Settings, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { OverviewData } from "@/lib/admin";
import { api, ApiError } from "@/lib/client/api";
import type { ModelRow, PresetRow } from "@/lib/models";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/components/ui/cn";
import { ModelsTab } from "./ModelsTab";
import { OverviewTab } from "./OverviewTab";
import { PresetsTab } from "./PresetsTab";
import { SecurityTab } from "./SecurityTab";
import { SettingsTab, type AdminSettings } from "./SettingsTab";

type Tab = "overview" | "models" | "settings" | "presets" | "security";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "overview", label: "Übersicht", icon: BarChart3 },
  { id: "models", label: "Modelle", icon: Cpu },
  { id: "settings", label: "Einstellungen", icon: Settings },
  { id: "presets", label: "Vorlagen", icon: Sparkles },
  { id: "security", label: "Sicherheit", icon: Shield },
];

interface Data {
  overview: OverviewData;
  models: ModelRow[];
  presets: PresetRow[];
  settings: AdminSettings & { appPasswordSet: boolean };
}

async function fetchAll(): Promise<Data> {
  const [overview, models, presets, settings] = await Promise.all([
    api<OverviewData>("/api/admin/overview", { admin: true }),
    api<{ models: ModelRow[] }>("/api/admin/models", { admin: true }),
    api<{ presets: PresetRow[] }>("/api/admin/presets", { admin: true }),
    api<AdminSettings & { appPasswordSet: boolean }>("/api/admin/settings", { admin: true }),
  ]);
  return { overview, models: models.models, presets: presets.presets, settings };
}

export function AdminApp() {
  const [state, setState] = useState<"loading" | "login" | "ready">("loading");
  const [data, setData] = useState<Data | null>(null);
  const [tab, setTab] = useState<Tab>("overview");
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback((d: Data) => {
    setData(d);
    setState("ready");
  }, []);
  const fail = useCallback((err: unknown) => {
    if (err instanceof ApiError && err.status === 401) setState("login");
    else setError(err instanceof Error ? err.message : "Laden fehlgeschlagen");
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
        {error ? <p className="text-danger">{error}</p> : <Loader2 className="h-6 w-6 animate-spin text-primary" />}
      </div>
    );
  }
  if (state === "login") return <AdminLogin onSuccess={load} />;
  if (!data) return null;

  const modelOptions = data.models.map((m) => ({ id: m.id, name: m.displayName }));
  const modelNames = Object.fromEntries(data.models.map((m) => [m.id, m.displayName]));

  return (
    <div className="min-h-full bg-bg-soft">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#120e1d] text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Logo />
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold tracking-wide uppercase">Admin</span>
          <div className="flex-1" />
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/75 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> <span className="max-sm:hidden">Zum Chat</span>
          </Link>
          <button
            type="button"
            onClick={async () => {
              await fetch("/api/admin/logout", { method: "POST" });
              setState("login");
            }}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-white/75 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> <span className="max-sm:hidden">Abmelden</span>
          </button>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2" aria-label="Admin-Bereiche">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
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
      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "overview" && <OverviewTab data={data.overview} modelNames={modelNames} />}
        {tab === "models" && <ModelsTab models={data.models} reload={load} />}
        {tab === "settings" && <SettingsTab initial={data.settings} modelOptions={modelOptions} reload={load} />}
        {tab === "presets" && <PresetsTab presets={data.presets} models={modelOptions} reload={load} />}
        {tab === "security" && <SecurityTab appPasswordSet={data.settings.appPasswordSet} reload={load} />}
      </main>
    </div>
  );
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div className="relative grid min-h-full place-items-center overflow-hidden bg-[#0d0a17] px-4 text-white">
      <div className="pointer-events-none absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-[#7847d6]/30 blur-3xl" />
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError(null);
          try {
            await api("/api/admin/login", { method: "POST", json: { password }, admin: true });
            onSuccess();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen");
            setBusy(false);
          }
        }}
        className="relative w-full max-w-sm rounded-[28px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-xl"
      >
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-bold">Admin-Bereich</h1>
        <p className="mt-1 text-sm text-white/60">Modelle, Einstellungen und Kosten verwalten.</p>
        <label className="mt-5 flex items-center gap-3 rounded-full border border-white/15 bg-black/20 px-4 focus-within:border-[#9b7bff]">
          <Lock className="h-4 w-4 text-white/50" />
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin-Passwort"
            className="h-12 w-full bg-transparent outline-none placeholder:text-white/40"
            aria-label="Admin-Passwort"
          />
        </label>
        {error && <p className="mt-3 rounded-xl bg-[#e41c68]/15 px-3 py-2 text-sm text-[#ff8fb5]">{error}</p>}
        <Button type="submit" variant="brand" size="lg" className="mt-4 w-full justify-center" disabled={busy || !password}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : "Anmelden"}
        </Button>
        <Link href="/" className="mt-4 block text-center text-sm text-white/50 hover:text-white">
          Zurück zum Chat
        </Link>
      </form>
    </div>
  );
}
