import { requireAdmin } from "@/lib/auth/session";
import { fundusError, idParam } from "@/lib/fundus/api";
import { readPreview } from "@/lib/library/catalog";

/** Vorschau für die Kursleitung – auch ausgeblendeter und inaktiver Einträge, auch bei ausgeschaltetem Fundus. */
export async function GET(request: Request) {
  try {
    await requireAdmin();
    return Response.json(await readPreview(idParam(request), { includeHidden: true }), { headers: { "Cache-Control": "private, no-cache" } });
  } catch (err) {
    return fundusError(err);
  }
}
