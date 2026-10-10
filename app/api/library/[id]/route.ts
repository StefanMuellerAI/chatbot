import { errorResponse, requireUser } from "@/lib/auth/session";
import { requireFeature } from "@/lib/guards";
import { readPreview } from "@/lib/library/catalog";

/** Vorschau-Daten eines Dokuments oder Verlaufs (bei einer E-Mail: der ganze Verlauf). */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    await requireFeature("library");
    const { id } = await ctx.params;
    return Response.json(await readPreview(id), { headers: { "Cache-Control": "private, max-age=3600" } });
  } catch (err) {
    return errorResponse(err);
  }
}
