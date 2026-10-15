import { errorResponse, requireUser } from "@/lib/auth/session";
import { requireFeature } from "@/lib/guards";
import { getFundusCatalog } from "@/lib/library/catalog";

/** Katalog des Fundus: mitgeliefert und eigene Inhalte (nur Metadaten), Kategorien und Prompts. */
export async function GET(request: Request) {
  try {
    await requireUser();
    await requireFeature("library");
    const catalog = await getFundusCatalog();
    const etag = `"fundus-${catalog.version}"`;
    const headers = { ETag: etag, "Cache-Control": "private, no-cache" };
    if (request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
    return Response.json(catalog, { headers });
  } catch (err) {
    return errorResponse(err);
  }
}
