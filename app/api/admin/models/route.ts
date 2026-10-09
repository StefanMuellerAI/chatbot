import { eq, ne } from "drizzle-orm";
import { z } from "zod";
import { errorResponse, HttpError, requireAdmin } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { listModels } from "@/lib/models";

const Effort = z.enum(["low", "medium", "high", "max"]);

const ModelSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,60}$/, "ID: nur Kleinbuchstaben, Ziffern und Bindestriche"),
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
  effortMap: z.record(Effort, z.string().max(20)),
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
  const db = await getDb();
  const existing = await db.select({ id: schema.models.id }).from(schema.models).where(eq(schema.models.id, data.id)).limit(1);
  if (mode === "create" && existing.length) throw new HttpError(409, "Es gibt bereits ein Modell mit dieser ID.");
  if (mode === "update" && !existing.length) throw new HttpError(404, "Modell nicht gefunden.");
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
    if (err instanceof z.ZodError) return Response.json({ error: err.issues[0]?.message ?? "Ungültige Eingabe." }, { status: 400 });
    return errorResponse(err);
  }
}

export async function PUT(request: Request) {
  try {
    return await save(request, "update");
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: err.issues[0]?.message ?? "Ungültige Eingabe." }, { status: 400 });
    return errorResponse(err);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) throw new HttpError(400, "ID fehlt.");
    const db = await getDb();
    await db.delete(schema.models).where(eq(schema.models.id, id));
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
