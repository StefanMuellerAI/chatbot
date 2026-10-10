import { z } from "zod";
import { errorResponse, requireAdmin } from "@/lib/auth/session";
import { GuestsInput, idParam, zodResponse } from "@/lib/events/api";
import { addGuests, deleteGuest } from "@/lib/events/store";

/** Weitere Gäste für eine Gruppe erzeugen. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = GuestsInput.parse(await request.json());
    return Response.json({ guests: await addGuests(data.groupId, data.count) });
  } catch (err) {
    if (err instanceof z.ZodError) return zodResponse(err);
    return errorResponse(err);
  }
}

/** Einzelnen Gast löschen – seine Sitzung endet sofort. */
export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    await deleteGuest(idParam(request));
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return zodResponse(err);
    return errorResponse(err);
  }
}
