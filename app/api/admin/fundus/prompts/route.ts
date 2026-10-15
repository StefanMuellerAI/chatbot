import { z } from "zod";
import { requireAdmin } from "@/lib/auth/session";
import { fundusError, idParam, MoveSchema, PromptSchema } from "@/lib/fundus/api";
import { createPrompt, deletePrompt, movePrompt, setPromptEnabled, updatePrompt } from "@/lib/fundus/store";
import type { PlaceholderSettings } from "@/lib/shared/placeholders";

const UpdateBody = PromptSchema.extend({ id: z.string().min(1).max(100) });
const PatchBody = z.object({ id: z.string().min(1).max(100), move: MoveSchema.optional(), enabled: z.boolean().optional() }).strict();

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = PromptSchema.parse(await request.json());
    const id = await createPrompt({ ...data, placeholders: data.placeholders as PlaceholderSettings });
    return Response.json({ ok: true, id });
  } catch (err) {
    return fundusError(err);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const { id, ...data } = UpdateBody.parse(await request.json());
    await updatePrompt(id, { ...data, placeholders: data.placeholders as PlaceholderSettings });
    return Response.json({ ok: true });
  } catch (err) {
    return fundusError(err);
  }
}

/** Reihenfolge (eine Stelle nach oben/unten) oder Aktiv-Schalter. */
export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const { id, move, enabled } = PatchBody.parse(await request.json());
    if (move) await movePrompt(id, move);
    if (enabled !== undefined) await setPromptEnabled(id, enabled);
    return Response.json({ ok: true });
  } catch (err) {
    return fundusError(err);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    await deletePrompt(idParam(request));
    return Response.json({ ok: true });
  } catch (err) {
    return fundusError(err);
  }
}
