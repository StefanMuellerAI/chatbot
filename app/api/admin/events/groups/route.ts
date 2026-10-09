import { z } from "zod";
import { errorResponse, requireAdmin } from "@/lib/auth/session";
import { GroupInput, IdInput, idParam, zodResponse } from "@/lib/events/api";
import { createGroup, deleteGroup, renameGroup } from "@/lib/events/store";

/** Neue Gruppe, optional gleich mit Gästen. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = GroupInput.parse(await request.json());
    return Response.json(await createGroup(data.eventId, data.name, data.count));
  } catch (err) {
    if (err instanceof z.ZodError) return zodResponse(err);
    return errorResponse(err);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const data = IdInput.extend({ name: GroupInput.shape.name }).parse(await request.json());
    await renameGroup(data.id, data.name);
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return zodResponse(err);
    return errorResponse(err);
  }
}

/** Löscht die Gruppe samt Gästen – deren Sitzungen enden sofort. */
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    await deleteGroup(idParam(request));
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return zodResponse(err);
    return errorResponse(err);
  }
}
