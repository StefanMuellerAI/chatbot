import { z } from "zod";
import { errorResponse, requireAdmin } from "@/lib/auth/session";
import { EventInput, IdInput, idParam, zodResponse } from "@/lib/events/api";
import { createEvent, deleteEvent, listEvents, updateEvent } from "@/lib/events/store";

/** Alle Termine mit Gruppen, Gästen (inkl. Zugangsdaten) und Kosten. */
export async function GET() {
  try {
    await requireAdmin();
    return Response.json({ events: await listEvents() }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return errorResponse(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const data = EventInput.parse(await request.json());
    return Response.json({ id: await createEvent(data) });
  } catch (err) {
    if (err instanceof z.ZodError) return zodResponse(err);
    return errorResponse(err);
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdmin();
    const data = EventInput.extend(IdInput.shape).parse(await request.json());
    await updateEvent(data.id, data);
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return zodResponse(err);
    return errorResponse(err);
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    await deleteEvent(idParam(request));
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return zodResponse(err);
    return errorResponse(err);
  }
}
