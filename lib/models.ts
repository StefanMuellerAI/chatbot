import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import type {
  Effort,
  EffortMap,
  ModelCapabilities,
  Provider,
  PublicModel,
  PublicPreset,
} from "@/lib/shared/types";
import { EFFORT_LEVELS } from "@/lib/shared/types";

export interface ModelRow {
  id: string;
  provider: Provider;
  modelId: string;
  displayName: string;
  description: string;
  enabled: boolean;
  isDefault: boolean;
  sortOrder: number;
  capabilities: ModelCapabilities;
  effortMap: EffortMap;
  defaultEffort: Effort;
  maxOutputTokens: number;
  priceIn: number;
  priceOut: number;
  priceCacheRead: number;
  priceCacheWrite: number;
}

export interface PresetRow {
  id: string;
  name: string;
  icon: string;
  description: string;
  promptAddendum: string;
  defaultModelId: string | null;
  enabled: boolean;
  sortOrder: number;
}

function toModelRow(r: typeof schema.models.$inferSelect): ModelRow {
  return {
    id: r.id,
    provider: r.provider as Provider,
    modelId: r.modelId,
    displayName: r.displayName,
    description: r.description,
    enabled: r.enabled,
    isDefault: r.isDefault,
    sortOrder: r.sortOrder,
    capabilities: r.capabilities as ModelCapabilities,
    effortMap: r.effortMap as EffortMap,
    defaultEffort: (r.defaultEffort as Effort) ?? "medium",
    maxOutputTokens: r.maxOutputTokens,
    priceIn: r.priceIn,
    priceOut: r.priceOut,
    priceCacheRead: r.priceCacheRead,
    priceCacheWrite: r.priceCacheWrite,
  };
}

export async function listModels(opts: { includeDisabled?: boolean } = {}): Promise<ModelRow[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.models)
    .orderBy(asc(schema.models.sortOrder), asc(schema.models.displayName));
  const mapped = rows.map(toModelRow);
  const visible = opts.includeDisabled ? mapped : mapped.filter((m) => m.enabled);
  // Ohne Mock-Modus sind Mock-Modelle unsichtbar.
  return process.env.FREEBIE_MOCK === "1" ? visible : visible.filter((m) => m.provider !== "mock");
}

export async function getModel(id: string): Promise<ModelRow | null> {
  const db = await getDb();
  const rows = await db.select().from(schema.models).where(eq(schema.models.id, id)).limit(1);
  return rows[0] ? toModelRow(rows[0]) : null;
}

export function providerConfigured(provider: Provider): boolean {
  if (provider === "anthropic") return Boolean(process.env.ANTHROPIC_API_KEY);
  if (provider === "openai") return Boolean(process.env.OPENAI_API_KEY);
  return process.env.FREEBIE_MOCK === "1";
}

export function availableEfforts(model: ModelRow): Effort[] {
  if (!model.capabilities.reasoning) return [];
  return EFFORT_LEVELS.map((e) => e.value).filter((e) => Boolean(model.effortMap[e]));
}

export function toPublicModel(model: ModelRow): PublicModel {
  const efforts = availableEfforts(model);
  return {
    id: model.id,
    provider: model.provider,
    displayName: model.displayName,
    description: model.description,
    isDefault: model.isDefault,
    capabilities: model.capabilities,
    efforts,
    defaultEffort: efforts.includes(model.defaultEffort) ? model.defaultEffort : (efforts[0] ?? "medium"),
  };
}

export async function listPresets(opts: { includeDisabled?: boolean } = {}): Promise<PresetRow[]> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.presets)
    .orderBy(asc(schema.presets.sortOrder), asc(schema.presets.name));
  const mapped: PresetRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    icon: r.icon,
    description: r.description,
    promptAddendum: r.promptAddendum,
    defaultModelId: r.defaultModelId,
    enabled: r.enabled,
    sortOrder: r.sortOrder,
  }));
  return opts.includeDisabled ? mapped : mapped.filter((p) => p.enabled);
}

export async function getPreset(id: string | null): Promise<PresetRow | null> {
  if (!id) return null;
  const db = await getDb();
  const rows = await db.select().from(schema.presets).where(eq(schema.presets.id, id)).limit(1);
  const r = rows[0];
  if (!r || !r.enabled) return null;
  return {
    id: r.id,
    name: r.name,
    icon: r.icon,
    description: r.description,
    promptAddendum: r.promptAddendum,
    defaultModelId: r.defaultModelId,
    enabled: r.enabled,
    sortOrder: r.sortOrder,
  };
}

export function toPublicPreset(p: PresetRow): PublicPreset {
  return {
    id: p.id,
    name: p.name,
    icon: p.icon,
    description: p.description,
    defaultModelId: p.defaultModelId,
  };
}
