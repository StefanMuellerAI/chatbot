import { z } from "zod";
import { errorResponse, requireUser } from "@/lib/auth/session";
import { requireFeature } from "@/lib/guards";
import { libraryAttachment } from "@/lib/library/catalog";

export const maxDuration = 60;

const Body = z.object({ id: z.string().min(1).max(100) });

/** Hängt ein Dokument oder eine E-Mail aus dem Fundus an: Text auslesen (mit Datei-Cache) und Anhang liefern. */
export async function POST(request: Request) {
  try {
    await requireUser();
    const settings = await requireFeature("library");
    const { id } = Body.parse(await request.json());
    const { attachment, cached } = await libraryAttachment(id, { nativePdf: settings.nativePdf });
    return Response.json(attachment, { headers: { "X-Freebie-Cache": cached ? "hit" : "miss" } });
  } catch (err) {
    return errorResponse(err);
  }
}
