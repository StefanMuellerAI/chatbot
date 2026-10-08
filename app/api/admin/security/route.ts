import { cookies } from "next/headers";
import { z } from "zod";
import { hashPassword } from "@/lib/auth/password";
import { errorResponse, requireAdmin } from "@/lib/auth/session";
import { ADMIN_COOKIE, ADMIN_MAX_AGE_S, signAdmin } from "@/lib/auth/tokens";
import { getDb, schema } from "@/lib/db/client";
import { getSettings, updateSettings } from "@/lib/settings";

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set-password"), password: z.string().min(4).max(200) }),
  z.object({ action: z.literal("reset-password") }),
  z.object({ action: z.literal("revoke-sessions") }),
  z.object({ action: z.literal("clear-answer-cache") }),
]);

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = Body.parse(await request.json());
    const settings = await getSettings({ fresh: true });
    if (body.action === "clear-answer-cache") {
      const db = await getDb();
      await db.delete(schema.answerCache);
      return Response.json({ ok: true });
    }
    // Alle anderen Aktionen melden bestehende Sitzungen ab (neue Sitzungsversion).
    const sessionVersion = settings.sessionVersion + 1;
    if (body.action === "set-password") {
      await updateSettings({ appPasswordHash: await hashPassword(body.password), sessionVersion });
    } else if (body.action === "reset-password") {
      await updateSettings({ appPasswordHash: null, sessionVersion });
    } else {
      await updateSettings({ sessionVersion });
    }
    // Admin bleibt angemeldet.
    const jar = await cookies();
    jar.set(ADMIN_COOKIE, await signAdmin({ adm: true, v: sessionVersion }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_MAX_AGE_S,
    });
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: "Ungültige Eingabe (Passwort mind. 4 Zeichen)." }, { status: 400 });
    return errorResponse(err);
  }
}
