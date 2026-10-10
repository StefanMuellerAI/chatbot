import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { safeEqual } from "@/lib/auth/password";
import { consumeLoginAttempt, errorResponse, HttpError } from "@/lib/auth/session";
import { adminCredentials, SESSION_COOKIE, SESSION_MAX_AGE_S, sessionCookie, signSession, type SessionClaims } from "@/lib/auth/tokens";
import { normalizeUsername } from "@/lib/events/credentials";
import { checkGuestLogin, purgeExpiredGuests } from "@/lib/events/store";
import { formatStart } from "@/lib/events/window";
import { ensureWelcomeMail } from "@/lib/mail/store";
import { getSettings } from "@/lib/settings";

const Body = z.object({ username: z.string().trim().min(1), password: z.string().min(1) });
// Längere Eingaben gelten einfach als falsch (und werden gar nicht erst verglichen).
const MAX_INPUT = 4000;
const WRONG = "Benutzername oder Passwort stimmt nicht.";

/** Eine Anmeldung für alle: Admin (aus der Umgebung) oder Gast eines laufenden Termins. */
export async function POST(request: Request) {
  try {
    const body = Body.parse(await request.json());
    const username = normalizeUsername(body.username.slice(0, MAX_INPUT));
    const password = body.password;
    const admin = adminCredentials();
    const refundAttempt = await consumeLoginAttempt(request, username, username === admin.username);
    const settings = await getSettings({ fresh: true });

    // Sitzungen gelten 12 Stunden; das Termin-Ende prüft der Server bei jeder Anfrage. So bleiben
    // Gäste angemeldet, wenn ein laufender Termin verlängert wird.
    const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_S * 1000);
    let claims: SessionClaims;
    if (username === admin.username) {
      if (!admin.password) throw new HttpError(500, "ADMIN_PASSWORD ist nicht konfiguriert.");
      if (password.length > MAX_INPUT || !safeEqual(password, admin.password)) throw new HttpError(401, WRONG);
      claims = { sid: randomUUID(), v: settings.sessionVersion, role: "admin", name: username };
    } else {
      await purgeExpiredGuests();
      const result = await checkGuestLogin(username, password.slice(0, MAX_INPUT + 1));
      if (!result.ok) {
        if (result.reason === "zu-frueh") throw new HttpError(403, `Dein Termin beginnt am ${formatStart(result.startsAt)}. Die Anmeldung ist ab 30 Minuten vorher möglich.`);
        if (result.reason === "vorbei") throw new HttpError(403, "Dein Zugang ist abgelaufen.");
        throw new HttpError(401, WRONG);
      }
      const { guest, event } = result;
      claims = { sid: randomUUID(), v: settings.sessionVersion, role: "guest", name: guest.username, gid: guest.id, eid: event.id, grp: guest.groupId };
      // Ein leeres Postfach bekommt die Begrüßungs-E-Mail der Kursleitung.
      await ensureWelcomeMail(
        { owner: guest.id, local: guest.username, role: "guest", guestId: guest.id, eventId: event.id, groupId: guest.groupId },
        settings,
      ).catch((err) => console.error("welcome mail failed", err));
    }

    await refundAttempt();
    const jar = await cookies();
    jar.set(SESSION_COOKIE, await signSession(claims, expiresAt), sessionCookie(request, expiresAt));
    // „key“ benennt die lokale Chat-Datenbank des Kontos (Gäste: eigene, Admin: „freebie“).
    return Response.json({ ok: true, role: claims.role, key: claims.gid ?? "admin" });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: "Bitte Benutzername und Passwort eingeben." }, { status: 400 });
    return errorResponse(err);
  }
}
