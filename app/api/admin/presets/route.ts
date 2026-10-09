import { eq } from "drizzle-orm";
import { z } from "zod";
import { errorResponse, HttpError, requireAdmin } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { getModel, listPresets } from "@/lib/models";
import { germanZodMessage } from "@/lib/validation";

const PRESET_ICONS = ["sparkles", "mail", "table", "presentation", "layout", "lightbulb"] as const;

const LABELS: Record<string, string> = {
  id: "ID",
  name: "Name",
  icon: "Symbol",
  description: "Kurzbeschreibung",
  promptAddendum: "Anweisung an das Modell",
  defaultModelId: "Empfohlenes Modell",
  sortOrder: "Reihenfolge",
};

const PresetSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,60}$/, "nur Kleinbuchstaben, Ziffern und Bindestriche (2–60 Zeichen)"),
  name: z.string().trim().min(1).max(60),
  icon: z.enum(PRESET_ICONS).default("sparkles"),
  description: z.string().max(200).default(""),
  promptAddendum: z.string().max(8000).default(""),
  defaultModelId: z.string().max(100).nullable().default(null),
  enabled: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(10000).default(100),
});

export async function GET() {
  try {
    await requireAdmin();
    return Response.json({ presets: await listPresets({ includeDisabled: true }) });
  } catch (err) {
    return errorResponse(err);
  }
}

async function checkModel(id: string | null) {
  if (!id) return;
  const model = await getModel(id);
  if (!model || !model.enabled) throw new HttpError(400, "Empfohlenes Modell: bitte ein aktives Modell wählen.");
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = PresetSchema.parse(await request.json());
    await checkModel(data.defaultModelId);
    const db = await getDb();
    const existing = await db.select({ id: schema.presets.id }).from(schema.presets).where(eq(schema.presets.id, data.id)).limit(1);
    if (existing.length) throw new HttpError(409, "Es gibt bereits eine Vorlage mit dieser ID.");
    await db.insert(schema.presets).values({ ...data, updatedAt: new Date() });
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: germanZodMessage(err, LABELS) }, { status: 400 });
    return errorResponse(err);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const data = PresetSchema.parse(await request.json());
    await checkModel(data.defaultModelId);
    const db = await getDb();
    const updated = await db.update(schema.presets).set({ ...data, updatedAt: new Date() }).where(eq(schema.presets.id, data.id)).returning({ id: schema.presets.id });
    if (updated.length === 0) throw new HttpError(404, "Vorlage nicht gefunden.");
    return Response.json({ ok: true });
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
    const deleted = await db.delete(schema.presets).where(eq(schema.presets.id, id)).returning({ id: schema.presets.id });
    if (deleted.length === 0) throw new HttpError(404, "Vorlage nicht gefunden.");
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
