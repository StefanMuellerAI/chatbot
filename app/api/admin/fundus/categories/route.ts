import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { fundusError, idParam, MoveSchema } from "@/lib/fundus/api";
import { createCategory, deleteCategory, moveCategory, renameCategory } from "@/lib/fundus/store";

const CreateBody = z.object({ name: z.string().max(200) });
const UpdateBody = z.object({ id: z.string().min(1).max(100), name: z.string().max(200).optional(), move: MoveSchema.optional() }).strict();

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { name } = CreateBody.parse(await request.json());
    return Response.json({ ok: true, id: await createCategory(name) });
  } catch (err) {
    return fundusError(err);
  }
}

/** Umbenennen oder eine Stelle nach oben/unten. */
export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const { id, name, move } = UpdateBody.parse(await request.json());
    if (name !== undefined) await renameCategory(id, name);
    if (move) await moveCategory(id, move);
    return Response.json({ ok: true });
  } catch (err) {
    return fundusError(err);
  }
}

/** Löschen geht nur, wenn die Kategorie leer ist (sonst 409 mit der Zahl der Prompts). */
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    await deleteCategory(idParam(request));
    return Response.json({ ok: true });
  } catch (err) {
    return fundusError(err);
  }
}
