import "server-only";
import { sql } from "drizzle-orm";
import { databaseMode, getDb } from "@/lib/db/client";
import { getSettings } from "@/lib/settings";
import { storageMode } from "@/lib/storage";

export interface OverviewData {
  periods: { label: string; requests: number; costUsd: number; savedUsd: number; cacheHits: number; cacheRatio: number }[];
  byModel: { modelId: string; requests: number; costUsd: number; savedUsd: number; inputTokens: number; outputTokens: number; cacheReadTokens: number }[];
  daily: { day: string; costUsd: number; savedUsd: number; requests: number }[];
  byFeature: { feature: string; count: number; costUsd: number; units: number }[];
  activeSessions24h: number;
  status: {
    anthropic: boolean;
    openai: boolean;
    database: "postgres" | "embedded";
    storage: "blob" | "local";
    mock: boolean;
    cronSecret: boolean;
    sessionSecret: boolean;
    appPassword: "admin" | "env" | "missing";
    paused: boolean;
  };
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
        coalesce(sum(input_tokens),0) AS input, coalesce(sum(output_tokens),0) AS output, coalesce(sum(cache_read_tokens),0) AS cache_read
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
  }));
  const daily = (
    await rows(sql`
      SELECT to_char(date_trunc('day', ts), 'YYYY-MM-DD') AS day, coalesce(sum(cost_usd),0) AS cost,
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
  const active = (await rows(sql`SELECT count(DISTINCT session_hash) AS n FROM usage_log WHERE ts > now() - interval '1 day'`))[0];
  const settings = await getSettings();
  return {
    periods,
    byModel,
    daily,
    byFeature,
    activeSessions24h: num(active?.n),
    status: {
      anthropic: Boolean(process.env.ANTHROPIC_API_KEY),
      openai: Boolean(process.env.OPENAI_API_KEY),
      database: databaseMode(),
      storage: storageMode(),
      mock: process.env.FREEBIE_MOCK === "1",
      cronSecret: Boolean(process.env.CRON_SECRET),
      sessionSecret: Boolean(process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16),
      appPassword: settings.appPasswordHash ? "admin" : process.env.APP_PASSWORD ? "env" : "missing",
      paused: settings.paused,
    },
  };
}
