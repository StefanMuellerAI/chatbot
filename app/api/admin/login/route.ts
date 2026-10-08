import { cookies } from "next/headers";
import { z } from "zod";
import { safeEqual } from "@/lib/auth/password";
import {
  checkLoginRateLimit,
  errorResponse,
  HttpError,
  recordLoginFailure,
} from "@/lib/auth/session";
import { ADMIN_COOKIE, ADMIN_MAX_AGE_S, devPassword, signAdmin } from "@/lib/auth/tokens";
import { getSettings } from "@/lib/settings";

const Body = z.object({ password: z.string().min(1).max(200) });

export async function POST(request: Request) {
  try {
    await checkLoginRateLimit(request);
    const { password } = Body.parse(await request.json());
    const expected = devPassword("ADMIN_PASSWORD");
    if (!expected) throw new HttpError(500, "ADMIN_PASSWORD ist nicht konfiguriert.");
    if (!safeEqual(password, expected)) {
      await recordLoginFailure(request);
      throw new HttpError(401, "Das Admin-Passwort stimmt nicht.");
    }
    const settings = await getSettings();
    const token = await signAdmin({ adm: true, v: settings.sessionVersion });
    const jar = await cookies();
    jar.set(ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_MAX_AGE_S,
    });
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof z.ZodError) return Response.json({ error: "Bitte ein Passwort eingeben." }, { status: 400 });
    return errorResponse(err);
  }
}
