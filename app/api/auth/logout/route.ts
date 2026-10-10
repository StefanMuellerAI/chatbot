import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySession } from "@/lib/auth/tokens";
import { deleteMailbox } from "@/lib/mail/store";

/** Abmelden: Cookie weg und das eigene Postfach gelöscht (Mails an andere bleiben bei diesen). */
export async function POST() {
  const jar = await cookies();
  const claims = await verifySession(jar.get(SESSION_COOKIE)?.value, { allowExpired: true });
  if (claims) {
    try {
      await deleteMailbox(claims.role === "guest" ? claims.gid! : "admin");
    } catch (err) {
      // Abmelden klappt trotzdem; spätestens zum Termin-Ende räumt der Aufräumjob auf.
      console.error("mailbox cleanup failed", err);
    }
  }
  jar.delete(SESSION_COOKIE);
  return Response.json({ ok: true });
}
