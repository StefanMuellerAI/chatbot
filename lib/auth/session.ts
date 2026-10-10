import "server-only";
import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import { eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db/client";
import { ZodError } from "zod";
import { HttpError, isProviderError, providerErrorMessage } from "@/lib/errors";
import { getSettings } from "@/lib/settings";
import { guestWindow } from "@/lib/events/store";
import { SESSION_COOKIE, verifySession, type Role } from "./tokens";

export { HttpError };

export interface UserSession {
  sid: string;
  /** Kurzer, nicht umkehrbarer Hash der Sitzungs-ID für Statistiken. */
  sessionHash: string;
  role: Role;
  username: string;
  /** Ablauf der Sitzung (bei Gästen spätestens das Termin-Ende). */
  expiresAt: Date;
  /** Nur Gäste: Ende des Termins – danach verfällt der Zugang. */
  accessUntil?: Date;
  guestId?: string;
  eventId?: string;
  groupId?: string;
}

/** Gültige Sitzung (Admin oder Gast) – Gäste nur, solange es sie und ihren Termin gibt. */
export async function getUserSession(): Promise<UserSession | null> {
  const jar = await cookies();
  const claims = await verifySession(jar.get(SESSION_COOKIE)?.value);
  if (!claims) return null;
  if (!(await versionCurrent(claims.v))) return null;
  let accessUntil: Date | undefined;
  if (claims.role === "guest") {
    const access = await guestWindow(claims.gid!);
    const now = Date.now();
    if (!access || now < access.from || now >= access.until) return null;
    accessUntil = new Date(access.until);
  }
  return {
    sid: claims.sid,
    sessionHash: hashId(claims.sid),
    role: claims.role,
    username: claims.name,
    expiresAt: new Date(claims.exp * 1000),
    accessUntil,
    guestId: claims.gid,
    eventId: claims.eid,
    groupId: claims.grp,
  };
}

export type SessionEnd =
  /** Der Gast-Zugang ist verfallen (Termin vorbei, Gast oder Termin gelöscht) – lokale Chats weg. */
  | { reason: "abgelaufen"; guestKey: string }
  /** Nur die Sitzung ist abgelaufen oder der Termin wurde verschoben – neu anmelden, Chats bleiben. */
  | { reason: "sitzung" };

/**
 * Warum die (echte, aber nicht mehr gültige) Sitzung im Cookie endete. Null, wenn es keine gab
 * oder alle abgemeldet wurden.
 */
export async function sessionEnd(): Promise<SessionEnd | null> {
  const jar = await cookies();
  const claims = await verifySession(jar.get(SESSION_COOKIE)?.value, { allowExpired: true });
  if (!claims || !(await versionCurrent(claims.v))) return null;
  if (claims.role === "guest") {
    const access = await guestWindow(claims.gid!);
    if (!access || Date.now() >= access.until) return { reason: "abgelaufen", guestKey: claims.gid! };
  }
  return { reason: "sitzung" };
}

/**
 * Passt die Sitzungsversion („Alle abmelden“)? Weicht sie vom zwischengespeicherten Stand ab,
 * wird frisch nachgesehen – eine gerade auf einer anderen Instanz erhöhte Version gilt sofort.
 */
async function versionCurrent(v: number): Promise<boolean> {
  if (v === (await getSettings()).sessionVersion) return true;
  return v === (await getSettings({ fresh: true })).sessionVersion;
}

export async function requireUser(): Promise<UserSession> {
  const session = await getUserSession();
  if (!session) throw new HttpError(401, "Bitte melde dich erneut an.");
  return session;
}

export async function requireAdmin(): Promise<UserSession> {
  const session = await requireUser();
  if (session.role !== "admin") throw new HttpError(403, "Dieser Bereich ist nur für die Kursleitung.");
  return session;
}

/** Zuordnung für die Statistik (Rolle, bei Gästen Termin und Gruppe). */
export function usageTag(session: UserSession): { role: Role; eventId: string | null; groupId: string | null } {
  return { role: session.role, eventId: session.eventId ?? null, groupId: session.groupId ?? null };
}

export function hashId(value: string): string {
  return createHash("sha256").update(`freebie:${value}`).digest("hex").slice(0, 16);
}

/** Wandelt Fehler in eine JSON-Antwort um – ohne interne Details nach außen zu geben. */
export function errorResponse(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json({ error: err.message }, { status: err.status });
  }
  if (err instanceof ZodError) return Response.json({ error: "Ungültige Anfrage." }, { status: 400 });
  if (err instanceof SyntaxError) return Response.json({ error: "Ungültige Anfrage (kein gültiges JSON)." }, { status: 400 });
  console.error(err);
  if (isProviderError(err)) return Response.json({ error: providerErrorMessage(err) }, { status: 502 });
  return Response.json({ error: "Es ist ein interner Fehler aufgetreten. Bitte erneut versuchen." }, { status: 500 });
}

/** Fehlversuche je 10 Minuten: pro IP großzügig (Schulungsgruppe hinter einer IP), pro Name streng. */
const MAX_PER_IP = 50;
const MAX_PER_NAME = 10;

async function countAttempt(key: string): Promise<{ count: number; refund: () => Promise<void> }> {
  const keyHash = hashId(key);
  const db = await getDb();
  const res = (await db.execute(sql`
    INSERT INTO login_attempts (ip_hash, window_start, count) VALUES (${keyHash}, now(), 1)
    ON CONFLICT (ip_hash) DO UPDATE SET
      count = CASE WHEN login_attempts.window_start < now() - interval '10 minutes' THEN 1 ELSE login_attempts.count + 1 END,
      window_start = CASE WHEN login_attempts.window_start < now() - interval '10 minutes' THEN now() ELSE login_attempts.window_start END
    RETURNING count
  `)) as unknown as { rows?: { count: number }[] } | { count: number }[];
  const rows = Array.isArray(res) ? res : (res.rows ?? []);
  const refund = async () => {
    await db
      .update(schema.loginAttempts)
      .set({ count: sql`greatest(${schema.loginAttempts.count} - 1, 0)` })
      .where(eq(schema.loginAttempts.ipHash, keyHash));
  };
  return { count: Number(rows[0]?.count ?? 0), refund };
}

/**
 * Brute-Force-Schutz: höchstens 50 Fehlversuche pro 10 Minuten und IP – 25 gleichzeitige
 * Anmeldungen plus 25 Tippfehler einer Schulungsgruppe sperren noch niemanden aus – und
 * höchstens 10 pro Benutzername (gezieltes Raten bei einem Konto). Gezählt wird atomar VOR der
 * Passwortprüfung; eine erfolgreiche Anmeldung erstattet ihre Versuche zurück. Die Sperre gilt
 * unabhängig davon, ob es den Namen gibt (verrät also nichts).
 */
export async function consumeLoginAttempt(request: Request, username: string, adminName: boolean): Promise<() => Promise<void>> {
  // Versuche mit dem Admin-Namen zählen getrennt: Tippfehler der Gruppe sperren die Kursleitung nicht aus.
  const ip = await countAttempt(`${adminName ? "admin" : "login"}:${clientIp(request)}`);
  const name = await countAttempt(`name:${username}`);
  const refund = async () => {
    await ip.refund();
    await name.refund();
  };
  if (ip.count > MAX_PER_IP) throw new HttpError(429, "Zu viele Anmeldeversuche. Bitte warte ein paar Minuten.");
  if (name.count > MAX_PER_NAME) throw new HttpError(429, "Zu viele Fehlversuche für diesen Benutzernamen. Bitte warte ein paar Minuten.");
  return refund;
}

/** Auf Vercel setzt die Plattform x-forwarded-for selbst (von außen nicht fälschbar). */
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}
