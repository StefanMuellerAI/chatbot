import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
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

const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 10;

/** Brute-Force-Schutz für Logins: 10 Fehlversuche pro 10 Minuten und IP. */
export async function checkLoginRateLimit(request: Request): Promise<void> {
  const ipHash = hashId(clientIp(request));
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.loginAttempts)
    .where(eq(schema.loginAttempts.ipHash, ipHash))
    .limit(1);
  const row = rows[0];
  if (row && Date.now() - row.windowStart.getTime() < WINDOW_MS && row.count >= MAX_ATTEMPTS) {
    throw new HttpError(429, "Zu viele Anmeldeversuche. Bitte warte ein paar Minuten.");
  }
}

export async function recordLoginFailure(request: Request): Promise<void> {
  const ipHash = hashId(clientIp(request));
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.loginAttempts)
    .where(eq(schema.loginAttempts.ipHash, ipHash))
    .limit(1);
  const row = rows[0];
  const now = new Date();
  if (!row || Date.now() - row.windowStart.getTime() >= WINDOW_MS) {
    await db
      .insert(schema.loginAttempts)
      .values({ ipHash, windowStart: now, count: 1 })
      .onConflictDoUpdate({ target: schema.loginAttempts.ipHash, set: { windowStart: now, count: 1 } });
  } else {
    await db
      .update(schema.loginAttempts)
      .set({ count: row.count + 1 })
      .where(eq(schema.loginAttempts.ipHash, ipHash));
  }
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
