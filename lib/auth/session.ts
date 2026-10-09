import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { getSettings } from "@/lib/settings";
import { ADMIN_COOKIE, USER_COOKIE, verifyAdmin, verifyUser } from "./tokens";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export interface UserSession {
  sid: string;
  /** Kurzer, nicht umkehrbarer Hash der Sitzungs-ID für Statistiken. */
  sessionHash: string;
}

export async function getUserSession(): Promise<UserSession | null> {
  const jar = await cookies();
  const claims = await verifyUser(jar.get(USER_COOKIE)?.value);
  if (!claims) return null;
  const settings = await getSettings();
  if (claims.v !== settings.sessionVersion) return null;
  return { sid: claims.sid, sessionHash: hashId(claims.sid) };
}

export async function requireUser(): Promise<UserSession> {
  const session = await getUserSession();
  if (!session) throw new HttpError(401, "Bitte melde dich erneut an.");
  return session;
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies();
  const claims = await verifyAdmin(jar.get(ADMIN_COOKIE)?.value);
  if (!claims) return false;
  const settings = await getSettings();
  return claims.v === settings.sessionVersion;
}

export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new HttpError(401, "Admin-Anmeldung erforderlich.");
}

export function hashId(value: string): string {
  return createHash("sha256").update(`freebie:${value}`).digest("hex").slice(0, 16);
}

/** Wandelt Fehler in eine JSON-Antwort um. */
export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  console.error(err);
  const message = err instanceof Error ? err.message : "Unbekannter Fehler";
  return Response.json({ error: message }, { status: 500 });
}

const MAX_ATTEMPTS = 30;

/**
 * Brute-Force-Schutz für Logins: höchstens 30 Fehlversuche pro 10 Minuten und IP.
 * Gezählt wird atomar VOR der Passwortprüfung (parallele Anfragen werden mitgezählt);
 * eine erfolgreiche Anmeldung erstattet ihren Versuch zurück. Der Wert ist großzügig,
 * weil eine ganze Schulungsgruppe oft über dieselbe IP-Adresse kommt.
 */
export async function consumeLoginAttempt(request: Request): Promise<() => Promise<void>> {
  const ipHash = hashId(clientIp(request));
  const db = await getDb();
  const res = (await db.execute(sql`
    INSERT INTO login_attempts (ip_hash, window_start, count) VALUES (${ipHash}, now(), 1)
    ON CONFLICT (ip_hash) DO UPDATE SET
      count = CASE WHEN login_attempts.window_start < now() - interval '10 minutes' THEN 1 ELSE login_attempts.count + 1 END,
      window_start = CASE WHEN login_attempts.window_start < now() - interval '10 minutes' THEN now() ELSE login_attempts.window_start END
    RETURNING count
  `)) as unknown as { rows?: { count: number }[] } | { count: number }[];
  const rows = Array.isArray(res) ? res : (res.rows ?? []);
  const count = Number(rows[0]?.count ?? 0);
  const refund = async () => {
    await db
      .update(schema.loginAttempts)
      .set({ count: sql`greatest(${schema.loginAttempts.count} - 1, 0)` })
      .where(eq(schema.loginAttempts.ipHash, ipHash));
  };
  if (count > MAX_ATTEMPTS) {
    throw new HttpError(429, "Zu viele Anmeldeversuche. Bitte warte ein paar Minuten.");
  }
  return refund;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
