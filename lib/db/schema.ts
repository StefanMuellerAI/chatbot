import {
  bigint,
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Hinweis: Das passende DDL steht in bootstrap.ts und muss synchron gehalten werden.

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const models = pgTable("models", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  modelId: text("model_id").notNull(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull().default(""),
  enabled: boolean("enabled").notNull().default(true),
  isDefault: boolean("is_default").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(100),
  capabilities: jsonb("capabilities").notNull(),
  effortMap: jsonb("effort_map").notNull(),
  defaultEffort: text("default_effort").notNull().default("medium"),
  maxOutputTokens: integer("max_output_tokens").notNull().default(64000),
  priceIn: doublePrecision("price_in").notNull().default(0),
  priceOut: doublePrecision("price_out").notNull().default(0),
  priceCacheRead: doublePrecision("price_cache_read").notNull().default(0),
  priceCacheWrite: doublePrecision("price_cache_write").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const presets = pgTable("presets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("sparkles"),
  description: text("description").notNull().default(""),
  promptAddendum: text("prompt_addendum").notNull().default(""),
  defaultModelId: text("default_model_id"),
  enabled: boolean("enabled").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(100),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const usageLog = pgTable(
  "usage_log",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    ts: timestamp("ts", { withTimezone: true }).notNull().defaultNow(),
    sessionHash: text("session_hash").notNull(),
    modelId: text("model_id").notNull(),
    feature: text("feature").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    cacheReadTokens: integer("cache_read_tokens").notNull().default(0),
    cacheWriteTokens: integer("cache_write_tokens").notNull().default(0),
    units: doublePrecision("units").notNull().default(0),
    costUsd: doublePrecision("cost_usd").notNull().default(0),
    savedUsd: doublePrecision("saved_usd").notNull().default(0),
    answerCacheHit: boolean("answer_cache_hit").notNull().default(false),
  },
  (t) => [index("usage_log_ts_idx").on(t.ts)],
);

export const fileCache = pgTable("file_cache", {
  sha256: text("sha256").primaryKey(),
  kind: text("kind").notNull(),
  mime: text("mime").notNull(),
  extractedText: text("extracted_text").notNull(),
  tokenEstimate: integer("token_estimate").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const transcriptCache = pgTable(
  "transcript_cache",
  {
    sha256: text("sha256").notNull(),
    model: text("model").notNull(),
    text: text("text").notNull(),
    durationSec: doublePrecision("duration_sec").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.sha256, t.model] })],
);

export const answerCache = pgTable(
  "answer_cache",
  {
    keyHash: text("key_hash").primaryKey(),
    modelId: text("model_id").notNull(),
    answer: jsonb("answer").notNull(),
    usage: jsonb("usage").notNull(),
    costUsd: doublePrecision("cost_usd").notNull().default(0),
    hits: integer("hits").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("answer_cache_expires_idx").on(t.expiresAt)],
);

export const transcriptionJobs = pgTable("transcription_jobs", {
  id: text("id").primaryKey(),
  sha256: text("sha256").notNull(),
  model: text("model").notNull(),
  sourceKey: text("source_key").notNull(),
  chunkKeys: jsonb("chunk_keys").notNull(),
  chunkTexts: jsonb("chunk_texts").notNull(),
  durationSec: doublePrecision("duration_sec").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const storedFiles = pgTable(
  "stored_files",
  {
    key: text("key").primaryKey(),
    kind: text("kind").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  },
  (t) => [index("stored_files_expires_idx").on(t.expiresAt)],
);

export const loginAttempts = pgTable("login_attempts", {
  ipHash: text("ip_hash").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull().defaultNow(),
  count: integer("count").notNull().default(0),
});
