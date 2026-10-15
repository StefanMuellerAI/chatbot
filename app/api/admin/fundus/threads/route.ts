import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { HttpError } from "@/lib/errors";
import { FileRef, fundusError, idParam, MetaSchema, requireConfirmed } from "@/lib/fundus/api";
import { deleteOwnItem, getOwnItem, updateOwnItem } from "@/lib/fundus/store";
import { saveThread } from "@/lib/fundus/upload";
import type { LibraryTag } from "@/lib/library/types";
import { FUNDUS_LIMITS } from "@/lib/shared/fundus";

export const maxDuration = 120;

const SaveBody = MetaSchema.extend({
  confirmed: z.boolean().optional(),
  files: z.array(FileRef).min(1).max(FUNDUS_LIMITS.mailsPerThread),
  // Ohne Datum: Datum der letzten Mail.
  date: MetaSchema.shape.date.optional(),
});

const UpdateBody = MetaSchema.extend({ id: z.string().min(1).max(100), enabled: z.boolean().default(true) });

/** Speichert einen geprüften E-Mail-Verlauf (nur mit Bestätigung „keine echten Daten“). */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { confirmed, files, ...meta } = SaveBody.parse(await request.json());
    requireConfirmed(confirmed);
    const result = await saveThread(files, { ...meta, date: meta.date ?? "", tags: meta.tags as LibraryTag[] });
    return Response.json(result);
  } catch (err) {
    return fundusError(err);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const { id, ...meta } = UpdateBody.parse(await request.json());
    const item = await getOwnItem(id);
    if (!item || item.kind !== "thread") throw new HttpError(404, "Verlauf nicht gefunden.");
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
    if (!item || item.kind !== "thread") throw new HttpError(404, "Verlauf nicht gefunden.");
    return Response.json({ ok: true, ...(await deleteOwnItem(id)) });
  } catch (err) {
    return fundusError(err);
  }
}
