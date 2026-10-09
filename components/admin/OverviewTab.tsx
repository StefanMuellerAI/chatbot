"use client";
import { CircleCheck, CircleX, TriangleAlert } from "lucide-react";
import { useState } from "react";
import type { OverviewData } from "@/lib/admin";
import { cn } from "@/components/ui/cn";
import { Card } from "./fields";

const usd = (n: number) =>
  new Intl.NumberFormat("de-DE", { style: "currency", currency: "USD", maximumFractionDigits: n < 1 ? 3 : 2 }).format(n);
const int = (n: number) => new Intl.NumberFormat("de-DE").format(Math.round(n));
const pct = (n: number) => new Intl.NumberFormat("de-DE", { style: "percent", maximumFractionDigits: 0 }).format(n);

const FEATURE_LABEL: Record<string, string> = {
  chat: "Chat-Antworten",
  title: "Chat-Titel",
  image: "Bilder",
  transcription: "Transkription (Minuten)",
  dictation: "Diktat (Minuten)",
};

function storageHint(s: OverviewData["status"]): string {
  if (s.storage === "blob") {
    return `Vercel Blob (privat, ${s.storageAuth === "oidc" ? "OIDC-Anmeldung" : "Token"} über ${s.storageSource})`;
  }
  if (s.blobVars.length > 0) {
    return `Blob-Variablen gefunden (${s.blobVars.join(", ")}), aber weder Token noch Store-ID – Store in Vercel neu verbinden und neu deployen`;
  }
  return s.onVercel
    ? "Kein Blob-Store gefunden – in Vercel unter Storage einen privaten Blob-Store verbinden und neu deployen. Bis dahin gehen Dateien verloren."
    : "Lokaler Speicher (Entwicklung)";
}

export function OverviewTab({ data, modelNames }: { data: OverviewData; modelNames: Record<string, string> }) {
  const s = data.status;
  const checks: { ok: boolean; warn?: boolean; label: string; hint: string }[] = [
    { ok: s.anthropic, label: "Anthropic-API-Schlüssel", hint: s.anthropic ? "Claude-Modelle verfügbar" : "ANTHROPIC_API_KEY in Vercel setzen" },
    { ok: s.openai, label: "OpenAI-API-Schlüssel", hint: s.openai ? "GPT, Bilder und Transkription verfügbar" : "OPENAI_API_KEY in Vercel setzen" },
    { ok: s.database === "postgres", warn: true, label: "Datenbank", hint: s.database === "postgres" ? "Neon Postgres verbunden" : "Ohne DATABASE_URL gehen Einstellungen und Caches beim Neustart verloren" },
    { ok: s.storage === "blob", warn: true, label: "Dateispeicher", hint: storageHint(s) },
    { ok: s.sessionSecret, warn: true, label: "SESSION_SECRET", hint: s.sessionSecret ? "Gesetzt" : "Empfohlen: zufälliger Wert mit mind. 32 Zeichen" },
    { ok: s.cronSecret, warn: true, label: "Aufräumjob (CRON_SECRET)", hint: s.cronSecret ? "Täglicher Cron aktiv" : "Ohne CRON_SECRET werden alte Dateien nicht gelöscht" },
    { ok: s.appPassword !== "missing", label: "Teilnehmer-Passwort", hint: s.appPassword === "admin" ? "Im Admin-Bereich gesetzt" : s.appPassword === "env" ? "Aus APP_PASSWORD" : "Kein Passwort gesetzt" },
  ];

  return (
    <div className="space-y-6">
      {s.paused && (
        <div className="flex items-center gap-2 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
          <TriangleAlert className="h-4 w-4" /> Freebie ist pausiert (Not-Aus aktiv). Teilnehmende können gerade nicht chatten.
        </div>
      )}
      {s.mock && <div className="rounded-2xl border border-primary/25 bg-primary-soft px-4 py-3 text-sm text-primary">Testmodus aktiv (FREEBIE_MOCK=1): Antworten kommen vom Mock-Provider, es entstehen keine Kosten.</div>}

      <div className="grid gap-4 md:grid-cols-3">
        {data.periods.map((p) => (
          <div key={p.label} className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
            <div className="text-xs font-semibold tracking-wide text-muted uppercase">{p.label}</div>
            <div className="mt-2 font-display text-3xl font-bold tabular-nums">{usd(p.costUsd)}</div>
            <div className="text-sm text-muted">Kosten (geschätzt)</div>
            <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted">Gespart</dt>
              <dd className="text-right font-semibold tabular-nums text-success">{usd(p.savedUsd)}</dd>
              <dt className="text-muted">Anfragen</dt>
              <dd className="text-right tabular-nums">{int(p.requests)}</dd>
              <dt className="text-muted">Cache-Quote</dt>
              <dd className="text-right tabular-nums">{pct(p.cacheRatio)}</dd>
              <dt className="text-muted">Antwort-Cache</dt>
              <dd className="text-right tabular-nums">{int(p.cacheHits)} Treffer</dd>
            </dl>
          </div>
        ))}
      </div>

      <Card title="Kosten pro Tag" description={`Letzte 14 Tage · ${int(data.activeSessions24h)} aktive Sitzungen in den letzten 24 Stunden`}>
        <DailyChart daily={data.daily} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Nach Modell" description="Chat-Anfragen der letzten 30 Tage">
          {data.byModel.length === 0 ? (
            <p className="text-sm text-muted">Noch keine Nutzung.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted uppercase">
                    <th className="pb-2 font-semibold">Modell</th>
                    <th className="pb-2 text-right font-semibold">Anfragen</th>
                    <th className="pb-2 text-right font-semibold">Kosten</th>
                    <th className="pb-2 text-right font-semibold">Gespart</th>
                    <th className="pb-2 text-right font-semibold">Cache</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byModel.map((m) => {
                    const total = m.inputTokens + m.cacheReadTokens;
                    return (
                      <tr key={m.modelId} className="border-t border-border">
                        <td className="py-2">{modelNames[m.modelId] ?? m.modelId}</td>
                        <td className="py-2 text-right tabular-nums">{int(m.requests)}</td>
                        <td className="py-2 text-right tabular-nums">{usd(m.costUsd)}</td>
                        <td className="py-2 text-right tabular-nums text-success">{usd(m.savedUsd)}</td>
                        <td className="py-2 text-right tabular-nums">{total ? pct(m.cacheReadTokens / total) : "–"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        <Card title="Nach Funktion" description="Letzte 30 Tage">
          {data.byFeature.length === 0 ? (
            <p className="text-sm text-muted">Noch keine Nutzung.</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {data.byFeature.map((f) => (
                  <tr key={f.feature} className="border-t border-border first:border-0">
                    <td className="py-2">{FEATURE_LABEL[f.feature] ?? f.feature}</td>
                    <td className="py-2 text-right tabular-nums text-muted">
                      {f.feature === "transcription" || f.feature === "dictation" ? `${int(f.units)} Min.` : `${int(f.count)}×`}
                    </td>
                    <td className="py-2 text-right tabular-nums">{usd(f.costUsd)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>

      <Card title="Systemstatus">
        <ul className="grid gap-2 sm:grid-cols-2">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-3 rounded-2xl bg-surface-2 px-4 py-3">
              {c.ok ? (
                <CircleCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
              ) : c.warn ? (
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
              ) : (
                <CircleX className="mt-0.5 h-5 w-5 shrink-0 text-danger" />
              )}
              <span>
                <span className="block text-sm font-medium">{c.label}</span>
                <span className="block text-xs text-muted">{c.hint}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

/** Säulendiagramm (eine Reihe): Kosten pro Tag, Hover zeigt Details. */
function DailyChart({ daily }: { daily: OverviewData["daily"] }) {
  const [hover, setHover] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);
  const days = lastDays(14).map((day) => daily.find((d) => d.day === day) ?? { day, costUsd: 0, savedUsd: 0, requests: 0 });
  const max = Math.max(...days.map((d) => d.costUsd), 0.01);
  const ticks = niceTicks(max);
  const top = ticks[ticks.length - 1];
  const height = 180;

  if (asTable) {
    return (
      <div>
        <button type="button" onClick={() => setAsTable(false)} className="mb-3 text-sm text-primary underline">
          Als Diagramm anzeigen
        </button>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted uppercase">
              <th className="pb-2">Tag</th>
              <th className="pb-2 text-right">Kosten</th>
              <th className="pb-2 text-right">Gespart</th>
              <th className="pb-2 text-right">Anfragen</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.day} className="border-t border-border">
                <td className="py-1.5">{formatDay(d.day)}</td>
                <td className="py-1.5 text-right tabular-nums">{usd(d.costUsd)}</td>
                <td className="py-1.5 text-right tabular-nums">{usd(d.savedUsd)}</td>
                <td className="py-1.5 text-right tabular-nums">{int(d.requests)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <button type="button" onClick={() => setAsTable(true)} className="text-xs text-muted underline hover:text-text">
          Als Tabelle anzeigen
        </button>
      </div>
      <div className="relative flex gap-2">
        <div className="relative w-14 shrink-0 text-right text-[0.7rem] text-muted tabular-nums" style={{ height }}>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: height - (t / top) * height }}>
              {usd(t)}
            </span>
          ))}
        </div>
        <div className="relative flex-1" style={{ height }} onMouseLeave={() => setHover(null)}>
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 border-t border-chart-grid" style={{ top: height - (t / top) * height }} />
          ))}
          <div className="absolute inset-0 flex items-end">
            {days.map((d, i) => (
              <div
                key={d.day}
                className="flex h-full flex-1 cursor-default items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                tabIndex={0}
                aria-label={`${formatDay(d.day)}: ${usd(d.costUsd)}`}
              >
                <div
                  className={cn("w-full max-w-6 rounded-t-[4px] bg-chart-1 transition-opacity", hover !== null && hover !== i && "opacity-40")}
                  style={{ height: d.costUsd > 0 ? Math.max(2, (d.costUsd / top) * height) : 0 }}
                />
              </div>
            ))}
          </div>
          {hover !== null && (
            <div
              className="pointer-events-none absolute z-10 w-44 -translate-x-1/2 rounded-xl border border-border bg-surface p-3 text-xs shadow-lg"
              style={{ left: `${((hover + 0.5) / days.length) * 100}%`, top: 0 }}
            >
              <div className="mb-1 font-semibold">{formatDay(days[hover].day)}</div>
              <div className="flex justify-between">
                <span className="text-muted">Kosten</span>
                <span className="tabular-nums">{usd(days[hover].costUsd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Gespart</span>
                <span className="tabular-nums">{usd(days[hover].savedUsd)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Anfragen</span>
                <span className="tabular-nums">{int(days[hover].requests)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-2 ml-16 flex text-[0.7rem] text-muted">
        {days.map((d, i) => (
          <span key={d.day} className="flex-1 text-center">
            {i % 2 === 0 ? formatDay(d.day, true) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

function lastDays(n: number): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function niceTicks(max: number): number[] {
  const raw = max / 4;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw) ?? raw;
  return [0, step, step * 2, step * 3, step * 4];
}

function formatDay(day: string, short = false): string {
  const d = new Date(`${day}T12:00:00Z`);
  return new Intl.DateTimeFormat("de-DE", short ? { day: "numeric", month: "numeric" } : { weekday: "short", day: "numeric", month: "long" }).format(d);
}
