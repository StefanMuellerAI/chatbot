import { errorResponse, requireUser } from "@/lib/auth/session";
import { requireFeature } from "@/lib/guards";
import { readLibraryFile } from "@/lib/library/catalog";

/** Lädt die Originaldatei herunter (Word, Excel, PowerPoint oder E-Mail). */
export async function GET(_request: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireUser();
    await requireFeature("library");
    const { id } = await ctx.params;
    const file = await readLibraryFile(id);
    const ascii =
      file.fileName
        .normalize("NFKD")
        .replace(/[^\x20-\x7e]/g, "")
        .replace(/["\\]/g, "") || `${id}`;
    return new Response(new Uint8Array(file.data), {
      headers: {
        "Content-Type": file.mime,
        "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
        "Cache-Control": "private, max-age=3600",
        "Content-Security-Policy": "sandbox; default-src 'none'",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
