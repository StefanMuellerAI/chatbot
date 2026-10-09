import { z } from "zod";
import { errorResponse, requireAdmin } from "@/lib/auth/session";
import { IdInput, zodResponse } from "@/lib/events/api";
import { resetGuestPassword } from "@/lib/events/store";

/** Neues Passwort für einen Gast; das alte gilt sofort nicht mehr. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { id } = IdInput.parse(await request.json());
    return Response.json({ password: await resetGuestPassword(id) });
  } catch (err) {
    if (err instanceof z.ZodError) return zodResponse(err);
    return errorResponse(err);
  }
}
