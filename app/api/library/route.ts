import { errorResponse, requireUser } from "@/lib/auth/session";
import { requireFeature } from "@/lib/guards";
import { getCatalog } from "@/lib/library/catalog";

/** Katalog des Fundus (nur Metadaten; Vorschau und Datei gibt es je Eintrag). */
export async function GET(request: Request) {
  try {
    await requireUser();
    await requireFeature("library");
    const catalog = await getCatalog();
    const etag = `"fundus-${catalog.version}"`;
    const headers = { ETag: etag, "Cache-Control": "private, no-cache" };
    if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
    return Response.json(catalog, { headers });
  } catch (err) {
    return errorResponse(err);
  }
}
