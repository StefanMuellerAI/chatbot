import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { hashPassword, verifyHashedPassword } from "@/lib/auth/password";
import { open, seal } from "@/lib/auth/secretbox";
import { adminCredentials } from "@/lib/auth/tokens";
import { getDb, schema } from "@/lib/db/client";
import { HttpError } from "@/lib/errors";
import { generatePassword, generateUsername, normalizeUsername } from "./credentials";
import { EARLY_LOGIN_MS, effectiveEnd, eventStatus, guestAccess, validateEventTimes, type EventStatus, type EventTimes } from "./window";

/** Höchstzahl neuer Gäste je Vorgang (beliebig viele über mehrere Vorgänge). */
export const MAX_GUESTS_PER_ACTION = 200;
/** Wie lange beendete Termine mit ihren Kosten in der Statistik bleiben. */
export const EVENT_RETENTION_DAYS = 90;

export interface GuestView {
  id: string;
  username: string;
  password: string | null;
  lastLoginAt: string | null;
}

export interface GroupView {
  id: string;
  name: string;
  sortOrder: number;
  guestTotal: number;
  guests: GuestView[];
  requests: number;
  costUsd: number;
}

export interface EventView {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  endedEarlyAt: string | null;
  status: EventStatus;
  groups: GroupView[];
  guestTotal: number;
  guestsActive: number;
  guestsLoggedIn: number;
  requests: number;
  costUsd: number;
  savedUsd: number;
}

type EventRow = typeof schema.events.$inferSelect;

const times = (e: EventRow): EventTimes => ({ startsAt: e.startsAt, endsAt: e.endsAt, endedEarlyAt: e.endedEarlyAt });

// ---------------------------------------------------------------- Zwischenspeicher der Sitzungsprüfung

/** Zugangsfenster eines Gasts in ms: ab 30 Minuten vor Beginn bis zum (tatsächlichen) Ende. */
export interface GuestWindow {
  from: number;
  until: number;
}

/**
 * Gast-ID → Zugangsfenster bzw. null (Gast gelöscht). Kurz, damit Änderungen anderer Instanzen schnell
 * greifen. Auf globalThis, damit alle Routen einer Instanz denselben Speicher sehen (wie die DB-Verbindung).
 */
type GuestCache = Map<string, { checkedAt: number; access: GuestWindow | null }>;
const globalForGuests = globalThis as unknown as { freebieGuestCache?: GuestCache };
const guestCache: GuestCache = (globalForGuests.freebieGuestCache ??= new Map());
const GUEST_CACHE_MS = 15_000;

/** Nach jeder Änderung an Terminen, Gruppen oder Gästen: Prüfungen dieser Instanz sofort neu machen. */
export function invalidateGuestCache() {
  guestCache.clear();
}

/** Zugangsfenster des Gasts – null, wenn es ihn (oder seinen Termin) nicht mehr gibt. */
export async function guestWindow(guestId: string): Promise<GuestWindow | null> {
  const now = Date.now();
  const cached = guestCache.get(guestId);
  if (cached && now - cached.checkedAt < GUEST_CACHE_MS) return cached.access;
  const db = await getDb();
  const rows = await db
    .select({ event: schema.events })
    .from(schema.guests)
    .innerJoin(schema.events, eq(schema.guests.eventId, schema.events.id))
    .where(eq(schema.guests.id, guestId))
    .limit(1);
  const event = rows[0]?.event;
  const access = event ? { from: event.startsAt.getTime() - EARLY_LOGIN_MS, until: effectiveEnd(times(event)).getTime() } : null;
  guestCache.set(guestId, { checkedAt: now, access });
  return access;
}

/** Ist der Gast (noch) da und läuft sein Termin? */
export async function guestSessionValid(guestId: string): Promise<boolean> {
  const access = await guestWindow(guestId);
  const now = Date.now();
  return access !== null && access.from <= now && now < access.until;
}

// ---------------------------------------------------------------- Anmeldung

/** Platzhalter-Hash, damit unbekannte Namen gleich lange brauchen wie falsche Passwörter. */
let dummyHash: Promise<string> | null = null;

export type GuestLogin =
  | { ok: true; guest: typeof schema.guests.$inferSelect; event: EventRow }
  | { ok: false; reason: "falsch" }
  | { ok: false; reason: "zu-frueh"; opensAt: Date; startsAt: Date }
  | { ok: false; reason: "vorbei" };

export async function checkGuestLogin(rawUsername: string, password: string): Promise<GuestLogin> {
  const username = normalizeUsername(rawUsername);
  const db = await getDb();
  const rows = await db
    .select({ guest: schema.guests, event: schema.events })
    .from(schema.guests)
    .innerJoin(schema.events, eq(schema.guests.eventId, schema.events.id))
    .where(eq(schema.guests.username, username))
    .limit(1);
  const row = rows[0];
  if (!row) {
    dummyHash ??= hashPassword("freebie-platzhalter");
    await verifyHashedPassword(password, await dummyHash);
    return { ok: false, reason: "falsch" };
  }
  if (password.length > 200 || !(await verifyHashedPassword(password, row.guest.passwordHash))) return { ok: false, reason: "falsch" };
  const access = guestAccess(times(row.event));
  if (!access.ok) {
    return access.reason === "zu-frueh" ? { ok: false, reason: "zu-frueh", opensAt: access.opensAt, startsAt: row.event.startsAt } : { ok: false, reason: "vorbei" };
  }
  await db.update(schema.guests).set({ lastLoginAt: new Date() }).where(eq(schema.guests.id, row.guest.id));
  return { ok: true, guest: row.guest, event: row.event };
}

// ---------------------------------------------------------------- Termine

export async function getEventRow(id: string): Promise<EventRow> {
  const db = await getDb();
  const rows = await db.select().from(schema.events).where(eq(schema.events.id, id)).limit(1);
  if (!rows[0]) throw new HttpError(404, "Termin nicht gefunden.");
  return rows[0];
}

export async function createEvent(input: { name: string; startsAt: Date; endsAt: Date }): Promise<string> {
  const problem = validateEventTimes(input.startsAt, input.endsAt);
  if (problem) throw new HttpError(400, problem);
  const db = await getDb();
  const id = randomUUID();
  await db.insert(schema.events).values({ id, name: input.name.trim(), startsAt: input.startsAt, endsAt: input.endsAt });
  return id;
}

export async function updateEvent(id: string, input: { name: string; startsAt: Date; endsAt: Date }): Promise<void> {
  const event = await getEventRow(id);
  if (eventStatus(times(event)) === "vorbei") throw new HttpError(400, "Der Termin ist schon vorbei und kann nicht mehr geändert werden.");
  const problem = validateEventTimes(input.startsAt, input.endsAt);
  if (problem) throw new HttpError(400, problem);
  const db = await getDb();
  await db.update(schema.events).set({ name: input.name.trim(), startsAt: input.startsAt, endsAt: input.endsAt }).where(eq(schema.events.id, id));
  invalidateGuestCache();
}

/** „Jetzt beenden“: alle Gäste sind ab sofort abgemeldet, ihre Zugänge werden gelöscht. */
export async function endEventNow(id: string): Promise<void> {
  const event = await getEventRow(id);
  if (eventStatus(times(event)) === "vorbei") return;
  const db = await getDb();
  await db.update(schema.events).set({ endedEarlyAt: new Date() }).where(eq(schema.events.id, id));
  await db.delete(schema.guests).where(eq(schema.guests.eventId, id));
  invalidateGuestCache();
}

export async function deleteEvent(id: string): Promise<void> {
  await getEventRow(id);
  const db = await getDb();
  await db.delete(schema.events).where(eq(schema.events.id, id));
  invalidateGuestCache();
}

// ---------------------------------------------------------------- Gruppen und Gäste

async function assertEditable(eventId: string): Promise<EventRow> {
  const event = await getEventRow(eventId);
  if (eventStatus(times(event)) === "vorbei") throw new HttpError(400, "Der Termin ist vorbei – Gruppen und Gäste lassen sich nicht mehr ändern.");
  return event;
}

async function getGroupRow(groupId: string) {
  const db = await getDb();
  const rows = await db.select().from(schema.eventGroups).where(eq(schema.eventGroups.id, groupId)).limit(1);
  if (!rows[0]) throw new HttpError(404, "Gruppe nicht gefunden.");
  return rows[0];
}

export async function createGroup(eventId: string, name: string, count: number): Promise<{ id: string; guests: NewGuest[] }> {
  await assertEditable(eventId);
  const db = await getDb();
  const id = randomUUID();
  const [{ max }] = (await db
    .select({ max: sql<number>`coalesce(max(${schema.eventGroups.sortOrder}), 0)` })
    .from(schema.eventGroups)
    .where(eq(schema.eventGroups.eventId, eventId))) as { max: number }[];
  await db.insert(schema.eventGroups).values({ id, eventId, name: name.trim(), sortOrder: Number(max) + 1 });
  return { id, guests: count > 0 ? await addGuests(id, count) : [] };
}

export async function renameGroup(groupId: string, name: string): Promise<void> {
  const group = await getGroupRow(groupId);
  await assertEditable(group.eventId);
  const db = await getDb();
  await db.update(schema.eventGroups).set({ name: name.trim() }).where(eq(schema.eventGroups.id, groupId));
}

export async function deleteGroup(groupId: string): Promise<void> {
  const group = await getGroupRow(groupId);
  const db = await getDb();
  await db.delete(schema.eventGroups).where(eq(schema.eventGroups.id, group.id));
  invalidateGuestCache();
}

export interface NewGuest {
  id: string;
  username: string;
  password: string;
}

/** Erzeugt Gäste mit eindeutigen, einfachen Zugangsdaten. */
export async function addGuests(groupId: string, count: number): Promise<NewGuest[]> {
  if (!Number.isInteger(count) || count < 1 || count > MAX_GUESTS_PER_ACTION) {
    throw new HttpError(400, `Anzahl der Gäste: 1 bis ${MAX_GUESTS_PER_ACTION} je Vorgang.`);
  }
  const group = await getGroupRow(groupId);
  await assertEditable(group.eventId);
  const db = await getDb();
  for (let attempt = 0; ; attempt++) {
    const taken = new Set((await db.select({ u: schema.guests.username }).from(schema.guests)).map((r) => r.u));
    taken.add(adminCredentials().username);
    const fresh: { username: string; password: string }[] = [];
    for (let i = 0; i < count; i++) {
      const username = generateUsername(taken);
      taken.add(username);
      fresh.push({ username, password: generatePassword() });
    }
    const values = await Promise.all(
      fresh.map(async (c) => ({
        id: randomUUID(),
        eventId: group.eventId,
        groupId,
        username: c.username,
        passwordHash: await hashPassword(c.password),
        passwordEnc: seal(c.password),
      })),
    );
    try {
      await db.insert(schema.guests).values(values);
      await db
        .update(schema.eventGroups)
        .set({ guestTotal: sql`${schema.eventGroups.guestTotal} + ${count}` })
        .where(eq(schema.eventGroups.id, groupId));
      return values.map((v, i) => ({ id: v.id, username: v.username, password: fresh[i].password }));
    } catch (err) {
      // Gleichzeitig vergebener Name: neu würfeln.
      if (attempt >= 2) throw err;
    }
  }
}

async function getGuestRow(guestId: string) {
  const db = await getDb();
  const rows = await db.select().from(schema.guests).where(eq(schema.guests.id, guestId)).limit(1);
  if (!rows[0]) throw new HttpError(404, "Gast nicht gefunden.");
  return rows[0];
}

export async function deleteGuest(guestId: string): Promise<void> {
  const guest = await getGuestRow(guestId);
  const db = await getDb();
  await db.delete(schema.guests).where(eq(schema.guests.id, guest.id));
  await db
    .update(schema.eventGroups)
    .set({ guestTotal: sql`greatest(${schema.eventGroups.guestTotal} - 1, 0)` })
    .where(eq(schema.eventGroups.id, guest.groupId));
  invalidateGuestCache();
}

/** Neues Passwort; das alte gilt sofort nicht mehr (bestehende Sitzung bleibt bestehen). */
export async function resetGuestPassword(guestId: string): Promise<string> {
  const guest = await getGuestRow(guestId);
  await assertEditable(guest.eventId);
  const password = generatePassword();
  const db = await getDb();
  await db
    .update(schema.guests)
    .set({ passwordHash: await hashPassword(password), passwordEnc: seal(password) })
    .where(eq(schema.guests.id, guestId));
  return password;
}

// ---------------------------------------------------------------- Ansicht und Statistik

export async function listEvents(): Promise<EventView[]> {
  await purgeExpiredGuests();
  const db = await getDb();
  const events = await db.select().from(schema.events).orderBy(asc(schema.events.startsAt));
  if (events.length === 0) return [];
  const ids = events.map((e) => e.id);
  const groups = await db.select().from(schema.eventGroups).where(inArray(schema.eventGroups.eventId, ids)).orderBy(asc(schema.eventGroups.sortOrder));
  const guests = await db.select().from(schema.guests).where(inArray(schema.guests.eventId, ids)).orderBy(asc(schema.guests.createdAt), asc(schema.guests.username));
  const usage = (await db
    .select({
      eventId: schema.usageLog.eventId,
      groupId: schema.usageLog.groupId,
      requests: sql<number>`count(*) filter (where ${schema.usageLog.feature} = 'chat')`,
      cost: sql<number>`coalesce(sum(${schema.usageLog.costUsd}), 0)`,
      saved: sql<number>`coalesce(sum(${schema.usageLog.savedUsd}), 0)`,
      sessions: sql<number>`count(distinct ${schema.usageLog.sessionHash})`,
    })
    .from(schema.usageLog)
    .where(and(isNotNull(schema.usageLog.eventId), inArray(schema.usageLog.eventId, ids)))
    .groupBy(schema.usageLog.eventId, schema.usageLog.groupId)) as { eventId: string; groupId: string | null; requests: number; cost: number; saved: number; sessions: number }[];

  return events.map((e) => {
    const eventUsage = usage.filter((u) => u.eventId === e.id);
    const eventGroups = groups
      .filter((g) => g.eventId === e.id)
      .map((g): GroupView => {
        const u = eventUsage.filter((x) => x.groupId === g.id);
        return {
          id: g.id,
          name: g.name,
          sortOrder: g.sortOrder,
          guestTotal: g.guestTotal,
          guests: guests
            .filter((x) => x.groupId === g.id)
            .map((x) => ({ id: x.id, username: x.username, password: open(x.passwordEnc), lastLoginAt: x.lastLoginAt?.toISOString() ?? null })),
          requests: u.reduce((n, x) => n + Number(x.requests), 0),
          costUsd: u.reduce((n, x) => n + Number(x.cost), 0),
        };
      });
    return {
      id: e.id,
      name: e.name,
      startsAt: e.startsAt.toISOString(),
      endsAt: e.endsAt.toISOString(),
      endedEarlyAt: e.endedEarlyAt?.toISOString() ?? null,
      status: eventStatus(times(e)),
      groups: eventGroups,
      guestTotal: eventGroups.reduce((n, g) => n + g.guestTotal, 0),
      guestsActive: eventUsage.reduce((n, x) => n + Number(x.sessions), 0),
      guestsLoggedIn: guests.filter((x) => x.eventId === e.id && x.lastLoginAt).length,
      requests: eventUsage.reduce((n, x) => n + Number(x.requests), 0),
      costUsd: eventUsage.reduce((n, x) => n + Number(x.cost), 0),
      savedUsd: eventUsage.reduce((n, x) => n + Number(x.saved), 0),
    };
  });
}

export async function runningEventCount(): Promise<number> {
  const db = await getDb();
  const rows = await db.select().from(schema.events);
  return rows.filter((e) => eventStatus(times(e)) === "laeuft").length;
}

// ---------------------------------------------------------------- Aufräumen

/** Zugänge beendeter Termine löschen (Passwörter samt Druckkopie). */
export async function purgeExpiredGuests(): Promise<number> {
  const db = await getDb();
  const res = (await db.execute(sql`
    DELETE FROM guests WHERE event_id IN (
      SELECT id FROM events WHERE LEAST(ends_at, coalesce(ended_early_at, ends_at)) <= now()
    ) RETURNING id
  `)) as unknown as { rows?: unknown[] } | unknown[];
  const n = Array.isArray(res) ? res.length : (res.rows?.length ?? 0);
  if (n) invalidateGuestCache();
  return n;
}

/** Termine, die länger als 90 Tage vorbei sind, aus der Statistik entfernen. */
export async function purgeOldEvents(): Promise<number> {
  const db = await getDb();
  const res = (await db.execute(sql`
    DELETE FROM events WHERE LEAST(ends_at, coalesce(ended_early_at, ends_at)) < now() - make_interval(days => ${EVENT_RETENTION_DAYS}) RETURNING id
  `)) as unknown as { rows?: unknown[] } | unknown[];
  return Array.isArray(res) ? res.length : (res.rows?.length ?? 0);
}
