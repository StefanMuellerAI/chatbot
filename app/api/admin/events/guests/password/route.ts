import { z } from "zod";
import { clearLoginAttempts, errorResponse, requireAdmin } from "@/lib/auth/session";
import { IdInput, zodResponse } from "@/lib/events/api";
import { resetGuestPassword } from "@/lib/events/store";

/** Neues Passwort für einen Gast; das alte gilt sofort nicht mehr, eine Sperre nach Fehlversuchen endet. */
export async function POST(request: Request) {
  try {
    await requireAdmin();
    const { id } = IdInput.parse(await request.json());
    const { password, username } = await resetGuestPassword(id);
    // Ein nach Tippfehlern gesperrter Gast kommt mit dem neuen Passwort sofort hinein.
    await clearLoginAttempts(username);
    return Response.json({ password });
  } catch (err) {
    if (err instanceof z.ZodError) return zodResponse(err);
    return errorResponse(err);
  }
}
