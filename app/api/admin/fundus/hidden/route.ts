import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { HttpError } from "@/lib/errors";
import { fundusError } from "@/lib/fundus/api";
import { setHidden, showAllHidden } from "@/lib/fundus/store";
import { getCatalog } from "@/lib/library/catalog";

const Body = z.union([z.object({ id: z.string().min(1).max(100), hidden: z.boolean() }).strict(), z.object({ all: z.literal(true), hidden: z.literal(false) }).strict()]);

/** Mitgelieferte Dokumente und Verläufe aus- bzw. einblenden (ändern oder löschen lassen sie sich nicht). */
export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const body = Body.parse(await request.json());
    if ("all" in body) return Response.json({ ok: true, shown: await showAllHidden() });
    const catalog = await getCatalog();
    const known = catalog.documents.some((d) => d.id === body.id) || catalog.threads.some((t) => t.id === body.id);
    if (!known) throw new HttpError(404, "Nur mitgelieferte Dokumente und Verläufe lassen sich ausblenden.");
    await setHidden(body.id, body.hidden);
    return Response.json({ ok: true });
  } catch (err) {
    return fundusError(err);
  }
}
