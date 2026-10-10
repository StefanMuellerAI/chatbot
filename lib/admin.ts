import "server-only";
import { sql } from "drizzle-orm";
import { databaseMode, getDb } from "@/lib/db/client";
import { adminCredentials } from "@/lib/auth/tokens";
import { runningEventCount } from "@/lib/events/store";
import { getSettings } from "@/lib/settings";
import { blobAuth, storageMode } from "@/lib/storage";

export interface OverviewData {
  periods: { label: string; requests: number; costUsd: number; savedUsd: number; cacheHits: number; cacheRatio: number }[];
  byModel: { modelId: string; requests: number; costUsd: number; savedUsd: number; inputTokens: number; outputTokens: number; cacheReadTokens: number; cacheWriteTokens: number }[];
  daily: { day: string; costUsd: number; savedUsd: number; requests: number }[];
  byFeature: { feature: string; count: number; costUsd: number; units: number }[];
  /** Letzte 30 Tage nach Rolle (Einträge von vor den Gast-Zugängen haben keine). */
  byRole: { role: "admin" | "guest"; requests: number; costUsd: number }[];
  /** Gast-Nutzung je Termin der letzten 90 Tage, neueste zuerst; gelöschte Termine ohne Namen. */
  byEvent: EventUsage[];
  activeSessions24h: number;
  status: {
    anthropic: boolean;
    openai: boolean;
    database: "postgres" | "embedded";
    storage: "blob" | "local";
    /** Woher der Blob-Zugang kommt (Variablenname) und wie er sich anmeldet. */
    storageSource: string | null;
    storageAuth: "token" | "oidc" | null;
    /** Namen (nie Werte) aller Umgebungsvariablen mit "BLOB" – zur Fehlersuche. */
    blobVars: string[];
    onVercel: boolean;
    mock: boolean;
    cronSecret: boolean;
    sessionSecret: boolean;
    /** Admin-Zugang aus ADMIN_USERNAME/ADMIN_PASSWORD. */
    adminUsername: string;
    adminPassword: boolean;
    /** Termine, die gerade laufen. */
    runningEvents: number;
    paused: boolean;
  };
}

export interface UsageTotals {
  requests: number;
  costUsd: number;
  savedUsd: number;
  sessions: number;
}

export interface EventUsage extends UsageTotals {
  id: string;
  name: string | null;
  startsAt: string | null;
  endsAt: string | null;
  groups: (UsageTotals & { id: string | null; name: string | null })[];
}

type Row = Record<string, unknown>;
const num = (v: unknown) => Number(v ?? 0);

async function rows(query: ReturnType<typeof sql>): Promise<Row[]> {
  const db = await getDb();
  const res = (await db.execute(query)) as unknown as { rows?: Row[] } | Row[];
  return Array.isArray(res) ? res : (res.rows ?? []);
}

export async function getOverview(): Promise<OverviewData> {
  const periods = [];
  for (const [label, interval] of [
    ["Heute", "1 day"],
    ["7 Tage", "7 days"],
    ["30 Tage", "30 days"],
  ] as const) {
    const r = (
      await rows(sql`
        SELECT
          count(*) FILTER (WHERE feature = 'chat') AS requests,
          coalesce(sum(cost_usd), 0) AS cost,
          coalesce(sum(saved_usd), 0) AS saved,
          count(*) FILTER (WHERE answer_cache_hit) AS hits,
          coalesce(sum(cache_read_tokens), 0) AS cache_read,
          coalesce(sum(input_tokens + cache_read_tokens + cache_write_tokens), 0) AS total_in
        FROM usage_log
        WHERE ts > now() - ${interval}::interval
      `)
    )[0] ?? {};
    periods.push({
      label,
      requests: num(r.requests),
      costUsd: num(r.cost),
      savedUsd: num(r.saved),
      cacheHits: num(r.hits),
      cacheRatio: num(r.total_in) > 0 ? num(r.cache_read) / num(r.total_in) : 0,
    });
  }
  const byModel = (
    await rows(sql`
      SELECT model_id, count(*) AS requests, coalesce(sum(cost_usd),0) AS cost, coalesce(sum(saved_usd),0) AS saved,
        coalesce(sum(input_tokens),0) AS input, coalesce(sum(output_tokens),0) AS output, coalesce(sum(cache_read_tokens),0) AS cache_read,
        coalesce(sum(cache_write_tokens),0) AS cache_write
      FROM usage_log WHERE ts > now() - interval '30 days' AND feature = 'chat'
      GROUP BY model_id ORDER BY cost DESC
    `)
  ).map((r) => ({
    modelId: String(r.model_id),
    requests: num(r.requests),
    costUsd: num(r.cost),
    savedUsd: num(r.saved),
    inputTokens: num(r.input),
    outputTokens: num(r.output),
    cacheReadTokens: num(r.cache_read),
    cacheWriteTokens: num(r.cache_write),
  }));
  const daily = (
    await rows(sql`
      SELECT to_char(date_trunc('day', ts AT TIME ZONE 'Europe/Berlin'), 'YYYY-MM-DD') AS day, coalesce(sum(cost_usd),0) AS cost,
        coalesce(sum(saved_usd),0) AS saved, count(*) FILTER (WHERE feature = 'chat') AS requests
      FROM usage_log WHERE ts > now() - interval '14 days'
      GROUP BY 1 ORDER BY 1
    `)
  ).map((r) => ({ day: String(r.day), costUsd: num(r.cost), savedUsd: num(r.saved), requests: num(r.requests) }));
  const byFeature = (
    await rows(sql`
      SELECT feature, count(*) AS count, coalesce(sum(cost_usd),0) AS cost, coalesce(sum(units),0) AS units
      FROM usage_log WHERE ts > now() - interval '30 days' GROUP BY feature ORDER BY cost DESC
    `)
  ).map((r) => ({ feature: String(r.feature), count: num(r.count), costUsd: num(r.cost), units: num(r.units) }));
  const byRole = (
    await rows(sql`
      SELECT role, count(*) FILTER (WHERE feature = 'chat') AS requests, coalesce(sum(cost_usd),0) AS cost
      FROM usage_log WHERE ts > now() - interval '30 days' AND role IS NOT NULL GROUP BY role ORDER BY role
    `)
  ).map((r) => ({ role: r.role === "admin" ? ("admin" as const) : ("guest" as const), requests: num(r.requests), costUsd: num(r.cost) }));
  const byEvent = await eventUsage();
  const active = (await rows(sql`SELECT count(DISTINCT session_hash) AS n FROM usage_log WHERE ts > now() - interval '1 day'`))[0];
  const settings = await getSettings();
  const blob = blobAuth();
  return {
    periods,
    byModel,
    daily,
    byFeature,
    byRole,
    byEvent,
    activeSessions24h: num(active?.n),
    status: {
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      database: databaseMode(),
      storage: storageMode(),
      storageSource: blob?.source ?? null,
      storageAuth: blob?.kind ?? null,
      blobVars: Object.keys(process.env).filter((n) => n.includes("BLOB")).sort(),
      onVercel: Boolean(process.env.VERCEL),
      mock: process.env.FREEBIE_MOCK === "1",
      cronSecret: Boolean(process.env.CRON_SECRET),
      sessionSecret: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16),
      adminUsername: adminCredentials().username,
      adminPassword: Boolean(process.env.ADMIN_PASSWORD),
      runningEvents: await runningEventCount(),
      paused: settings.paused,
    },
  };
}

/** Nutzung je Termin und Gruppe – auch für gelöschte Termine und Gruppen (die Kosten bleiben). */
async function eventUsage(): Promise<EventUsage[]> {
  const raw = await rows(sql`
    SELECT u.event_id, u.group_id, e.name AS event_name, e.starts_at, e.ends_at, g.name AS group_name,
      count(*) FILTER (WHERE u.feature = 'chat') AS requests, coalesce(sum(u.cost_usd),0) AS cost,
      coalesce(sum(u.saved_usd),0) AS saved, count(DISTINCT u.session_hash) AS sessions, max(u.ts) AS last_ts
    FROM usage_log u
    LEFT JOIN events e ON e.id = u.event_id
    LEFT JOIN event_groups g ON g.id = u.group_id
    WHERE u.event_id IS NOT NULL AND u.ts > now() - interval '90 days'
    GROUP BY u.event_id, u.group_id, e.name, e.starts_at, e.ends_at, g.name
  `);
  const iso = (v: unknown) => (v ? new Date(v as string | Date).toISOString() : null);
  const events = new Map<string, EventUsage>();
  const lastUse = new Map<string, number>();
  for (const r of raw) {
    const id = String(r.event_id);
    let e = events.get(id);
    if (!e) {
      e = { id, name: (r.event_name as string | null) ?? null, startsAt: iso(r.starts_at), endsAt: iso(r.ends_at), requests: 0, costUsd: 0, savedUsd: 0, sessions: 0, groups: [] };
      events.set(id, e);
    }
    const g = { id: (r.group_id as string | null) ?? null, name: (r.group_name as string | null) ?? null, requests: num(r.requests), costUsd: num(r.cost), savedUsd: num(r.saved), sessions: num(r.sessions) };
    e.groups.push(g);
    // Eine Sitzung gehört zu genau einer Gruppe – die Summe zählt also niemanden doppelt.
    e.requests += g.requests;
    e.costUsd += g.costUsd;
    e.savedUsd += g.savedUsd;
    e.sessions += g.sessions;
    lastUse.set(id, Math.max(lastUse.get(id) ?? 0, new Date(r.last_ts as string | Date).getTime()));
  }
  // Neueste zuerst (nach Beginn, gelöschte Termine nach letzter Nutzung); Gruppen nach Name, Gelöschtes zuletzt.
  const sortKey = (e: EventUsage) => (e.startsAt ? Date.parse(e.startsAt) : lastUse.get(e.id)!);
  const byName = (a: { name: string | null }, b: { name: string | null }) => (a.name ?? "\uffff").localeCompare(b.name ?? "\uffff", "de");
  return [...events.values()].sort((a, b) => sortKey(b) - sortKey(a)).map((e) => ({ ...e, groups: e.groups.sort(byName) }));
}
