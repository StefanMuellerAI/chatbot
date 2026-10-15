import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { germanZodMessage } from "@/lib/validation";
import { FileRef, fundusError, idParam, LABELS, MetaSchema, requireConfirmed } from "@/lib/fundus/api";
import { deleteOwnItem, getOwnItem, updateOwnItem } from "@/lib/fundus/store";
import { saveDocuments } from "@/lib/fundus/upload";
import { HttpError } from "@/lib/errors";
import type { LibraryTag } from "@/lib/library/types";
import { FUNDUS_LIMITS } from "@/lib/shared/fundus";

export const maxDuration = 120;

const SaveBody = z.object({
  confirmed: z.boolean().optional(),
  files: z.array(z.unknown()).min(1).max(FUNDUS_LIMITS.filesPerUpload),
});

const FileWithMeta = FileRef.extend(MetaSchema.shape);

const UpdateBody = MetaSchema.extend({ id: z.string().min(1).max(100), enabled: z.boolean().default(true) });

/** Speichert geprüfte Dateien als eigene Dokumente (nur mit Bestätigung „keine echten Daten“). */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = SaveBody.parse(await request.json());
    requireConfirmed(body.confirmed);
    const files = body.files.map((raw, i) => {
      const parsed = FileWithMeta.safeParse(raw);
      if (!parsed.success) throw new HttpError(400, `Datei ${i + 1}: ${germanZodMessage(parsed.error, LABELS)}`);
      const { key, name, ...meta } = parsed.data;
      return { key, name, meta: { ...meta, tags: meta.tags as LibraryTag[] } };
    });
    return Response.json(await saveDocuments(files));
  } catch (err) {
    return fundusError(err);
  }
}

/** Ändert die Angaben eines eigenen Dokuments (die Datei selbst bleibt). */
export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const { id, ...meta } = UpdateBody.parse(await request.json());
    const item = await getOwnItem(id);
    if (!item || item.kind !== "document") throw new HttpError(404, "Dokument nicht gefunden.");
    await updateOwnItem(id, { ...meta, tags: meta.tags as LibraryTag[] });
    return Response.json({ ok: true });
  } catch (err) {
    return fundusError(err);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const id = idParam(request);
    const item = await getOwnItem(id);
    if (!item || item.kind !== "document") throw new HttpError(404, "Dokument nicht gefunden.");
    return Response.json({ ok: true, ...(await deleteOwnItem(id)) });
  } catch (err) {
    return fundusError(err);
  }
}
