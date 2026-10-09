// Ohne "server-only", weil proxy.ts diese Datei ebenfalls nutzt.
import { createHash } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { HttpError } from "@/lib/errors";

export const USER_COOKIE = "freebie_session";
export const ADMIN_COOKIE = "freebie_admin";
export const USER_MAX_AGE_S = 12 * 60 * 60;
export const ADMIN_MAX_AGE_S = 2 * 60 * 60;

export interface UserClaims {
  sid: string;
  v: number;
}

export interface AdminClaims {
  adm: true;
  v: number;
}

function secretKey(): Uint8Array {
  const explicit = process.env.SESSION_SECRET;
  if (explicit && explicit.length >= 16) return new TextEncoder().encode(explicit);
  // In Produktion Pflicht: Ein aus den Passwörtern abgeleiteter Schlüssel wäre für Teilnehmende,
  // die APP_PASSWORD kennen, offline angreifbar.
  if (process.env.NODE_ENV === "production") {
    throw new HttpError(500, "SESSION_SECRET fehlt (mindestens 16 Zeichen). Bitte in Vercel setzen.");
  }
  // Lokale Entwicklung: aus den Passwörtern abgeleitet, damit es ohne Extra-Variable läuft.
  const material = `freebie|${devPassword("APP_PASSWORD")}|${devPassword("ADMIN_PASSWORD")}`;
  return new Uint8Array(createHash("sha256").update(material).digest());
}

/** Passwort aus der Umgebung; lokal (nicht Produktion) gibt es Standardwerte. */
export function devPassword(name: "APP_PASSWORD" | "ADMIN_PASSWORD"): string | null {
  const value = process.env[name];
  if (value) return value;
  if (process.env.NODE_ENV !== "production") return name === "APP_PASSWORD" ? "freebie" : "admin";
  return null;
}

export async function signUser(claims: UserClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${USER_MAX_AGE_S}s`)
    .setAudience("freebie-user")
    .sign(secretKey());
}

export async function signAdmin(claims: AdminClaims): Promise<string> {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${ADMIN_MAX_AGE_S}s`)
    .setAudience("freebie-admin")
    .sign(secretKey());
}

export async function verifyUser(token: string | undefined): Promise<UserClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { audience: "freebie-user" });
    if (typeof payload.sid !== "string" || typeof payload.v !== "number") return null;
    return { sid: payload.sid, v: payload.v };
  } catch {
    return null;
  }
}

export async function verifyAdmin(token: string | undefined): Promise<AdminClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { audience: "freebie-admin" });
    if (payload.adm !== true || typeof payload.v !== "number") return null;
    return { adm: true, v: payload.v };
  } catch {
    return null;
  }
}
