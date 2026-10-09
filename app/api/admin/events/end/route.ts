import { z } from "zod";
import { errorResponse, requireAdmin } from "@/lib/auth/session";
import { IdInput, zodResponse } from "@/lib/events/api";
import { endEventNow } from "@/lib/events/store";

/** „Jetzt beenden“: Gäste sind sofort abgemeldet, ihre Zugänge gelöscht. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { id } = IdInput.parse(await request.json());
    await endEventNow(id);
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return zodResponse(err);
    return errorResponse(err);
  }
}
