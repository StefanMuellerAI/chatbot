import { requireAdmin } from "@/lib/auth/session";
import { fundusError, idParam } from "@/lib/fundus/api";
import { readLibraryFile } from "@/lib/library/catalog";

/** Download für die Kursleitung – auch ausgeblendeter und inaktiver Einträge. */
export async function GET(request: Request) {
  try {
    await requireAdmin();
    const id = idParam(request);
    const file = await readLibraryFile(id, { includeHidden: true });
    const ascii =
      file.fileName
        .normalize("NFKD")
        .replace(/[^\x20-\x7e]/g, "")
        .replace(/["\\]/g, "") || id;
    return new Response(new Uint8Array(file.data), {
      headers: {
        "Content-Type": file.mime,
        "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
        "Cache-Control": "private, no-cache",
        "Content-Security-Policy": "sandbox; default-src 'none'",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    return fundusError(err);
  }
}
