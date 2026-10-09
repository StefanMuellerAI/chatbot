import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { z } from "zod";
import { safeEqual, verifyHashedPassword } from "@/lib/auth/password";
import { consumeLoginAttempt, errorResponse, HttpError } from "@/lib/auth/session";
import { devPassword, signUser, USER_COOKIE, USER_MAX_AGE_S } from "@/lib/auth/tokens";
import { getSettings } from "@/lib/settings";

const Body = z.object({ password: z.string().min(1) });
// Längere Eingaben gelten einfach als falsch (und werden gar nicht erst verglichen).
const MAX_PASSWORD = 4000;

export async function POST(request: Request) {
  try {
    const { password } = Body.parse(await request.json());
    const refundAttempt = await consumeLoginAttempt(request, "user");
    const settings = await getSettings();
    let ok = false;
    if (password.length > MAX_PASSWORD) {
      ok = false;
    } else if (settings.appPasswordHash) {
      ok = await verifyHashedPassword(password, settings.appPasswordHash);
    } else {
      const expected = devPassword("APP_PASSWORD");
      if (!expected) throw new HttpError(500, "APP_PASSWORD ist nicht konfiguriert.");
      ok = safeEqual(password, expected);
    }
    if (!ok) {
      throw new HttpError(401, "Das Passwort stimmt nicht.");
    }
    await refundAttempt();
    const token = await signUser({ sid: randomUUID(), v: settings.sessionVersion });
    const jar = await cookies();
    jar.set(USER_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: USER_MAX_AGE_S,
    });
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: "Bitte ein Passwort eingeben." }, { status: 400 });
    return errorResponse(err);
  }
}
