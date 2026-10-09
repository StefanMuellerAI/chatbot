// Ohne "server-only", weil proxy.ts diese Datei ebenfalls nutzt.
import { createHash } from "node:crypto";
import { errors, jwtVerify, SignJWT, type JWTPayload } from "jose";
import { HttpError } from "@/lib/errors";

/**
 * Secure-Cookies über HTTPS – auf Vercel immer. Lokal (http://localhost) lehnen manche Browser
 * (Safari/WebKit) Secure-Cookies ab, dort wird das Flag daher weggelassen.
 */
export function secureCookie(request: Request): boolean {
  if (process.env.VERCEL) return true;
  const forwarded = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return (forwarded || new URL(request.url).protocol.slice(0, -1)) === "https";
}

/** Ein Cookie für alle: Admin und Gäste unterscheiden sich nur in der Rolle im Token. */
export const SESSION_COOKIE = "freebie_session";
/** Sitzungsdauer in Sekunden – für Admin und Gäste (das Termin-Ende prüft der Server bei jeder Anfrage). */
export const SESSION_MAX_AGE_S = 12 * 60 * 60;

export type Role = "admin" | "guest";

export interface SessionClaims {
  sid: string;
  /** Sitzungsversion – „Alle abmelden“ erhöht sie. */
  v: number;
  role: Role;
  /** Angezeigter Benutzername. */
  name: string;
  /** Nur bei Gästen: Gast, Termin, Gruppe. */
  gid?: string;
  eid?: string;
  grp?: string;
}

export interface VerifiedSession extends SessionClaims {
  /** Ablauf in Sekunden seit 1970. */
  exp: number;
}

/** Schlüsselmaterial für Tokens und die verschlüsselte Druckkopie der Gast-Passwörter. */
export function secretMaterial(): Uint8Array {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 16) return new TextEncoder().encode(explicit);
  // In Produktion Pflicht: ein aus dem Admin-Passwort abgeleiteter Schlüssel wäre zu schwach.
  if (process.env.NODE_ENV === "production") {
    throw new HttpError(500, "SESSION_SECRET fehlt (mindestens 16 Zeichen). Bitte in Vercel setzen.");
  }
  // Lokale Entwicklung: abgeleitet, damit es ohne Extra-Variable läuft.
  const material = `freebie|${adminCredentials().password}`;
  return new Uint8Array(createHash("sha256").update(material).digest());
}

/** Admin-Zugang aus der Umgebung; lokal (nicht Produktion) gibt es ein Standard-Passwort. */
export function adminCredentials(): { username: string; password: string | null } {
  const username = (process.env.ADMIN_USERNAME || "admin").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "admin" : null);
  return { username, password };
}

export async function signSession(claims: SessionClaims, expiresAt: Date): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .setAudience("freebie-session")
    .sign(secretMaterial());
}

/**
 * Prüft Signatur, Empfänger und Ablauf. Mit `allowExpired` gilt auch ein abgelaufenes Token – nur um
 * zu erklären, warum die Sitzung endete (Signatur und Empfänger prüft jose vor dem Ablauf).
 */
export async function verifySession(token: string | undefined, opts: { allowExpired?: boolean } = {}): Promise<VerifiedSession | null> {
  if (!token) return null;
  let payload: JWTPayload;
  try {
    ({ payload } = await jwtVerify(token, secretMaterial(), { audience: "freebie-session" }));
  } catch (err) {
    if (!opts.allowExpired || !(err instanceof errors.JWTExpired)) return null;
    payload = err.payload;
  }
  const { sid, v, role, name, gid, eid, grp, exp } = payload as Record<string, unknown>;
  if (typeof sid !== "string" || typeof v !== "number" || typeof name !== "string" || typeof exp !== "number") return null;
  if (role === "admin") return { sid, v, role, name, exp };
  if (role === "guest" && typeof gid === "string" && typeof eid === "string" && typeof grp === "string") {
    return { sid, v, role, name, gid, eid, grp, exp };
  }
  return null;
}

/** Cookie-Optionen passend zum Ablauf des Tokens. */
export function sessionCookie(request: Request, expiresAt: Date) {
  return {
    httpOnly: true,
    secure: secureCookie(request),
    sameSite: "lax" as const,
    path: "/",
    maxAge: Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000)),
  };
}
