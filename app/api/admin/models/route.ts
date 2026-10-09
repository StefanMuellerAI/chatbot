import { eq, ne } from "drizzle-orm";
import { z } from "zod";
import { errorResponse, HttpError, requireAdmin } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { listModels } from "@/lib/models";
import { getSettings } from "@/lib/settings";
import { germanZodMessage } from "@/lib/validation";

const LABELS: Record<string, string> = {
  id: "Interne ID",
  provider: "Anbieter",
  modelId: "API-Modell-ID",
  displayName: "Anzeigename",
  description: "Beschreibung",
  sortOrder: "Reihenfolge",
  maxOutputTokens: "Max. Output-Tokens",
  priceIn: "Preis Input",
  priceOut: "Preis Output",
  priceCacheRead: "Preis Cache-Read",
  priceCacheWrite: "Preis Cache-Write",
  effortMap: "Effort-Stufen",
  defaultEffort: "Standard-Stufe",
};

const Effort = z.enum(["low", "medium", "high", "max"]);

const ModelSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,60}$/, "nur Kleinbuchstaben, Ziffern und Bindestriche (2–60 Zeichen)"),
  provider: z.enum(["anthropic", "openai"]),
  modelId: z.string().min(1).max(120),
  displayName: z.string().min(1).max(80),
  description: z.string().max(300).default(""),
  enabled: z.boolean().default(true),
  isDefault: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(10000).default(100),
  capabilities: z.object({
    vision: z.boolean(),
    pdf: z.boolean(),
    webSearch: z.boolean(),
    tools: z.boolean(),
    reasoning: z.boolean(),
    perMessageEffort: z.boolean(),
    systemMessages: z.boolean(),
    fallbacks: z.boolean(),
    anthropicWebTools: z.enum(["dynamic", "basic"]).optional(),
  }),
  // Nicht angebotene Stufen fehlen einfach (partialRecord statt vollständigem Record).
  effortMap: z.partialRecord(Effort, z.string().trim().min(1).max(20)),
  defaultEffort: Effort,
  maxOutputTokens: z.number().int().min(256).max(256000),
  priceIn: z.number().min(0),
  priceOut: z.number().min(0),
  priceCacheRead: z.number().min(0),
  priceCacheWrite: z.number().min(0),
});

export async function GET() {
  try {
    await requireAdmin();
    return Response.json({ models: await listModels({ includeDisabled: true }) });
  } catch (err) {
    return errorResponse(err);
  }
}

async function save(request: Request, mode: "create" | "update") {
  await requireAdmin();
  const data = ModelSchema.parse(await request.json());
  if (data.capabilities.reasoning) {
    const levels = Object.keys(data.effortMap);
    if (levels.length === 0) throw new HttpError(400, "Effort-Stufen: mindestens eine Stufe angeben oder „Denkt nach“ ausschalten.");
    if (!levels.includes(data.defaultEffort)) throw new HttpError(400, "Standard-Stufe: muss eine der angebotenen Stufen sein.");
  }
  if (data.isDefault && !data.enabled) {
    throw new HttpError(409, "Das Standardmodell muss aktiv sein. Bitte zuerst ein anderes Modell als Standard festlegen.");
  }
  const db = await getDb();
  const existing = await db.select({ id: schema.models.id, isDefault: schema.models.isDefault }).from(schema.models).where(eq(schema.models.id, data.id)).limit(1);
  if (mode === "create" && existing.length) throw new HttpError(409, "Es gibt bereits ein Modell mit dieser ID.");
  if (mode === "update" && !existing.length) throw new HttpError(404, "Modell nicht gefunden.");
  if (existing[0]?.isDefault && !data.isDefault) {
    throw new HttpError(409, "Es muss immer ein Standardmodell geben. Bitte ein anderes Modell als Standard festlegen.");
  }
  if (data.isDefault) {
    await db.update(schema.models).set({ isDefault: false }).where(ne(schema.models.id, data.id));
  }
  if (mode === "create") await db.insert(schema.models).values(data);
  else await db.update(schema.models).set(data).where(eq(schema.models.id, data.id));
  return Response.json({ ok: true });
}

export async function POST(request: Request) {
  try {
    return await save(request, "create");
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: germanZodMessage(err, LABELS) }, { status: 400 });
    return errorResponse(err);
  }
}

export async function PUT(request: Request) {
  try {
    return await save(request, "update");
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: germanZodMessage(err, LABELS) }, { status: 400 });
    return errorResponse(err);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) throw new HttpError(400, "ID fehlt.");
    const db = await getDb();
    const rows = await db.select({ isDefault: schema.models.isDefault }).from(schema.models).where(eq(schema.models.id, id)).limit(1);
    if (!rows[0]) throw new HttpError(404, "Modell nicht gefunden.");
    if (rows[0].isDefault) throw new HttpError(409, "Das Standardmodell kann nicht gelöscht werden. Bitte zuerst ein anderes Modell als Standard festlegen.");
    if ((await getSettings({ fresh: true })).titleModelId === id) {
      throw new HttpError(409, "Dieses Modell erzeugt die Chat-Titel. Bitte zuerst in den Einstellungen ein anderes Modell wählen.");
    }
    await db.delete(schema.models).where(eq(schema.models.id, id));
    // Vorlagen, die dieses Modell empfehlen, verlieren nur die Empfehlung.
    await db.update(schema.presets).set({ defaultModelId: null }).where(eq(schema.presets.defaultModelId, id));
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
