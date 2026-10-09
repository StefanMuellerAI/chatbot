import { eq } from "drizzle-orm";
import { z } from "zod";
import { errorResponse, HttpError, requireAdmin } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { listPresets } from "@/lib/models";

const PresetSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{2,60}$/, "ID: nur Kleinbuchstaben, Ziffern und Bindestriche"),
  name: z.string().min(1).max(60),
  icon: z.string().max(30).default("sparkles"),
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

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = PresetSchema.parse(await request.json());
    const db = await getDb();
    const existing = await db.select({ id: schema.presets.id }).from(schema.presets).where(eq(schema.presets.id, data.id)).limit(1);
    if (existing.length) throw new HttpError(409, "Es gibt bereits eine Vorlage mit dieser ID.");
    await db.insert(schema.presets).values({ ...data, updatedAt: new Date() });
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: err.issues[0]?.message ?? "Ungültige Eingabe." }, { status: 400 });
    return errorResponse(err);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const data = PresetSchema.parse(await request.json());
    const db = await getDb();
    await db.update(schema.presets).set({ ...data, updatedAt: new Date() }).where(eq(schema.presets.id, data.id));
    return Response.json({ ok: true });
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
    await db.delete(schema.presets).where(eq(schema.presets.id, id));
    return Response.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
