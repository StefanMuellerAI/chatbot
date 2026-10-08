import { errorResponse, HttpError, requireUser } from "@/lib/auth/session";
import { assertSafeKey, getFile } from "@/lib/storage";

const INLINE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf", "audio/mpeg"]);

export async function GET(_request: Request, ctx: { params: Promise<{ key: string[] }> }) {
  try {
    await requireUser();
    const { key: parts } = await ctx.params;
    const key = parts.map(decodeURIComponent).join("/");
    try {
      assertSafeKey(key);
    } catch {
      throw new HttpError(400, "Ungültiger Dateipfad.");
    }
    const file = await getFile(key);
    if (!file) throw new HttpError(404, "Datei nicht gefunden oder bereits gelöscht.");
    const name = key.split("/").pop() ?? "datei";
    const isSvg = file.contentType === "image/svg+xml";
    const inline = INLINE_TYPES.has(file.contentType) || isSvg;
    return new Response(new Uint8Array(file.data), {
      headers: {
        "Content-Type": file.contentType,
        "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${name}"`,
        "Cache-Control": "private, max-age=86400",
        // Hochgeladene Inhalte dürfen nie als aktive Seite auf unserer Domain laufen.
        "Content-Security-Policy": "sandbox; default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
