import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { errorResponse, requireAdmin } from "@/lib/auth/session";
import { SESSION_COOKIE, sessionCookie, signSession } from "@/lib/auth/tokens";
import { getDb, schema } from "@/lib/db/client";
import { getSettings, updateSettings } from "@/lib/settings";
import { germanZodMessage } from "@/lib/validation";

const Body = z.discriminatedUnion("action", [z.object({ action: z.literal("revoke-sessions") }), z.object({ action: z.literal("clear-answer-cache") })]);

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = Body.parse(await request.json());
    if (body.action === "clear-answer-cache") {
      const db = await getDb();
      await db.delete(schema.answerCache);
      return Response.json({ ok: true });
    }
    // Alle abmelden: neue Sitzungsversion – betrifft Gäste und alle anderen Admin-Sitzungen.
    const settings = await getSettings({ fresh: true });
    const sessionVersion = settings.sessionVersion + 1;
    await updateSettings({ sessionVersion });
    // Die eigene Sitzung bleibt bestehen.
    const jar = await cookies();
    jar.set(
      SESSION_COOKIE,
      await signSession({ sid: randomUUID(), v: sessionVersion, role: "admin", name: session.username }, session.expiresAt),
      sessionCookie(request, session.expiresAt),
    );
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: germanZodMessage(err, { action: "Aktion" }) }, { status: 400 });
    return errorResponse(err);
  }
}
