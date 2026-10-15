import "server-only";
import { neon } from "@neondatabase/serverless";
import { sql } from "drizzle-orm";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { BOOTSTRAP_STATEMENTS } from "./bootstrap";
import * as schema from "./schema";
import { SEED_MODELS, SEED_PRESETS, SEED_PROMPT_CATEGORIES, SEED_PROMPTS } from "./seed";

export type DB = PgDatabase<PgQueryResultHKT, typeof schema>;

// Global abgelegt, damit Hot Reload in der Entwicklung keine zweite PGlite-Instanz öffnet.
const globalForDb = globalThis as unknown as { freebieDb?: Promise<DB> | null };

/** Neon Postgres, wenn DATABASE_URL gesetzt ist, sonst eingebettetes PGlite (lokal/Tests). */
export function getDb(): Promise<DB> {
  if (!globalForDb.freebieDb) {
    globalForDb.freebieDb = init().catch((err) => {
      globalForDb.freebieDb = null;
      throw err;
    });
  }
  return globalForDb.freebieDb;
}

export function databaseMode(): "postgres" | "embedded" {
  return databaseUrl() ? "postgres" : "embedded";
}

function databaseUrl(): string | undefined {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || undefined;
}

async function init(): Promise<DB> {
  const url = databaseUrl();
  let db: DB;
  if (url) {
    db = drizzleNeon(neon(url), { schema }) as unknown as DB;
  } else {
    const { PGlite } = await import("@electric-sql/pglite");
    const { drizzle } = await import("drizzle-orm/pglite");
    // Auf Vercel ohne Datenbank: flüchtig im Speicher (nur zum Ausprobieren).
    const dir = process.env.PGLITE_DIR || (process.env.VERCEL ? "memory://" : "./.data/pglite");
    if (!dir.startsWith("memory://")) {
      const { mkdir } = await import("node:fs/promises");
      await mkdir(dir, { recursive: true });
    }
    const client = new PGlite(dir);
    db = drizzle(client, { schema }) as unknown as DB;
  }
  for (const statement of BOOTSTRAP_STATEMENTS) {
    await db.execute(sql.raw(statement));
  }
  await seed(db);
  return db;
}

async function seed(db: DB) {
  const existing = await db.select({ id: schema.models.id }).from(schema.models).limit(1);
  if (existing.length === 0) {
    await db
      .insert(schema.models)
      .values(
        SEED_MODELS.map((m) => ({
          id: m.id,
          provider: m.provider,
          modelId: m.modelId,
          displayName: m.displayName,
          description: m.description,
          isDefault: m.isDefault ?? false,
          sortOrder: m.sortOrder,
          capabilities: m.capabilities,
          effortMap: m.effortMap,
          defaultEffort: m.defaultEffort,
          maxOutputTokens: m.maxOutputTokens,
          priceIn: m.priceIn,
          priceOut: m.priceOut,
          priceCacheRead: m.priceCacheRead,
          priceCacheWrite: m.priceCacheWrite,
        })),
      )
      .onConflictDoNothing();
  }
  const presetRows = await db.select({ id: schema.presets.id }).from(schema.presets).limit(1);
  if (presetRows.length === 0) {
    await db
      .insert(schema.presets)
      .values(
        SEED_PRESETS.map((p) => ({
          id: p.id,
          name: p.name,
          icon: p.icon,
          description: p.description,
          promptAddendum: p.promptAddendum,
          sortOrder: p.sortOrder,
        })),
      )
      .onConflictDoNothing();
  }
  await seedPrompts(db);
}

/** Startbestand der Prompts: genau einmal (Markierung in settings), danach gehört alles der Kursleitung. */
export async function seedPrompts(db: DB) {
  const marker = await db.select({ key: schema.settings.key }).from(schema.settings).where(sql`${schema.settings.key} = 'fundus-start'`).limit(1);
  if (marker.length) return;
  await db
    .insert(schema.promptCategories)
    .values(SEED_PROMPT_CATEGORIES.map((c) => ({ id: c.id, name: c.name, sortOrder: c.sortOrder })))
    .onConflictDoNothing();
  await db
    .insert(schema.prompts)
    .values(
      SEED_PROMPTS.map((p) => ({
        id: p.id,
        categoryId: p.categoryId,
        title: p.title,
        description: p.description,
        text: p.text,
        placeholders: p.placeholders,
        sortOrder: p.sortOrder,
      })),
    )
    .onConflictDoNothing();
  await db
    .insert(schema.settings)
    .values({ key: "fundus-start", value: { version: 1, at: new Date().toISOString() } })
    .onConflictDoNothing();
}

export { schema };
