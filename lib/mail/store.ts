import "server-only";
import { randomUUID } from "node:crypto";
import { and, asc, count, desc, eq, gt, inArray, isNull, sql, type SQL } from "drizzle-orm";
import type { UserSession } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { HttpError } from "@/lib/errors";
import { guestAccess } from "@/lib/events/window";
import type { AppSettings } from "@/lib/shared/settings-defaults";
import {
  MAIL_LIMITS,
  mailAddress,
  mailContact,
  mailPreview,
  parseAddress,
  TEACHER,
  type MailContacts,
  type MailFolder,
  type MailFull,
  type MailStatus,
  type MailSummary,
} from "@/lib/shared/mail";

/** Das Postfach einer Sitzung: Gast (eigene Gruppe) oder Kursleitung. */
export interface Mailbox {
  /** Gast-ID oder „admin“. */
  owner: string;
  /** Lokaler Teil der eigenen Adresse. */
  local: string;
  role: "admin" | "guest";
  guestId: string | null;
  eventId: string | null;
  groupId: string | null;
}

export function mailboxFor(session: UserSession): Mailbox {
  if (session.role === "admin") return { owner: "admin", local: TEACHER, role: "admin", guestId: null, eventId: null, groupId: null };
  return {
    owner: session.guestId!,
    local: session.username,
    role: "guest",
    guestId: session.guestId!,
    eventId: session.eventId ?? null,
    groupId: session.groupId ?? null,
  };
}

type MailRow = typeof schema.mails.$inferSelect;

const notFound = () => new HttpError(404, "Diese E-Mail gibt es nicht (mehr).");

function toSummary(row: Pick<MailRow, "id" | "folder" | "fromAddress" | "toAddresses" | "ccAddresses" | "subject" | "sentAt" | "readAt" | "viaFreebie">, snippet: string): MailSummary {
  return {
    id: row.id,
    folder: row.folder as MailFolder,
    from: row.fromAddress,
    to: (row.toAddresses as string[]) ?? [],
    cc: (row.ccAddresses as string[]) ?? [],
    subject: row.subject,
    preview: mailPreview(snippet),
    sentAt: row.sentAt.toISOString(),
    read: row.folder === "sent" || row.readAt !== null,
    viaFreebie: row.viaFreebie,
  };
}

function toFull(row: MailRow): MailFull {
  return { ...toSummary(row, row.body), body: row.body, inReplyTo: row.inReplyTo };
}

/** Steuerzeichen entfernen (außer Zeilenumbruch und Tab), Zeilenenden vereinheitlichen. */
function cleanText(value: string): string {
  return value.replace(/\r\n?/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "");
}

// ---------------------------------------------------------------- Lesen

export interface ListOptions {
  folder: MailFolder | "all";
  query?: string;
  unreadOnly?: boolean;
  limit?: number;
}

export async function listMails(box: Mailbox, opts: ListOptions): Promise<{ mails: MailSummary[]; total: number; unread: number }> {
  const db = await getDb();
  const m = schema.mails;
  const where: SQL[] = [eq(m.owner, box.owner)];
  if (opts.folder !== "all") where.push(eq(m.folder, opts.folder));
  if (opts.unreadOnly) where.push(eq(m.folder, "inbox"), isNull(m.readAt));
  const q = opts.query?.trim().slice(0, 200);
  if (q) {
    const pattern = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
    where.push(
      sql`(${m.subject} ILIKE ${pattern} OR ${m.body} ILIKE ${pattern} OR ${m.fromAddress} ILIKE ${pattern} OR ${m.toAddresses}::text ILIKE ${pattern} OR ${m.ccAddresses}::text ILIKE ${pattern})`,
    );
  }
  const rows = await db
    .select({
      id: m.id,
      folder: m.folder,
      fromAddress: m.fromAddress,
      toAddresses: m.toAddresses,
      ccAddresses: m.ccAddresses,
      subject: m.subject,
      sentAt: m.sentAt,
      readAt: m.readAt,
      viaFreebie: m.viaFreebie,
      snippet: sql<string>`left(${m.body}, 600)`,
    })
    .from(m)
    .where(and(...where))
    .orderBy(desc(m.sentAt), desc(m.id))
    .limit(Math.min(Math.max(opts.limit ?? MAIL_LIMITS.mailbox, 1), MAIL_LIMITS.mailbox));
  const [{ total }] = (await db.select({ total: count() }).from(m).where(and(...where))) as { total: number }[];
  return { mails: rows.map((r) => toSummary(r, r.snippet)), total: Number(total), unread: await unreadCount(box) };
}

async function unreadCount(box: Mailbox): Promise<number> {
  const db = await getDb();
  const m = schema.mails;
  const [{ n }] = (await db
    .select({ n: count() })
    .from(m)
    .where(and(eq(m.owner, box.owner), eq(m.folder, "inbox"), isNull(m.readAt)))) as { n: number }[];
  return Number(n);
}

/** Eine eigene Mail vollständig; fremde und unbekannte IDs ergeben 404. */
export async function getMail(box: Mailbox, id: string): Promise<MailFull> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.mails)
    .where(and(eq(schema.mails.id, id), eq(schema.mails.owner, box.owner)))
    .limit(1);
  if (!rows[0]) throw notFound();
  return toFull(rows[0]);
}

/** Mehrere eigene Mails vollständig (für Freebie); unbekannte IDs fehlen im Ergebnis. */
export async function getMails(box: Mailbox, ids: string[]): Promise<MailFull[]> {
  if (ids.length === 0) return [];
  const db = await getDb();
  const rows = await db
    .select()
    .from(schema.mails)
    .where(and(inArray(schema.mails.id, ids), eq(schema.mails.owner, box.owner)));
  return ids.map((id) => rows.find((r) => r.id === id)).filter((r): r is MailRow => Boolean(r)).map(toFull);
}

export async function mailStatus(box: Mailbox): Promise<MailStatus> {
  const db = await getDb();
  const m = schema.mails;
  const latest = await db
    .select({ id: m.id, from: m.fromAddress, subject: m.subject, sentAt: m.sentAt })
    .from(m)
    .where(and(eq(m.owner, box.owner), eq(m.folder, "inbox")))
    .orderBy(desc(m.sentAt), desc(m.id))
    .limit(1);
  const row = latest[0];
  const [{ total }] = (await db.select({ total: count() }).from(m).where(eq(m.owner, box.owner))) as { total: number }[];
  return { unread: await unreadCount(box), total: Number(total), latest: row ? { id: row.id, from: row.from, subject: row.subject, sentAt: row.sentAt.toISOString() } : null };
}

// ---------------------------------------------------------------- Ändern

export async function markRead(box: Mailbox, id: string, read: boolean): Promise<void> {
  const db = await getDb();
  const res = await db
    .update(schema.mails)
    .set({ readAt: read ? new Date() : null })
    .where(and(eq(schema.mails.id, id), eq(schema.mails.owner, box.owner)))
    .returning({ id: schema.mails.id });
  if (res.length === 0) throw notFound();
}

/** Löscht nur die eigene Kopie – bei den anderen bleibt die Mail. */
export async function deleteMail(box: Mailbox, id: string): Promise<void> {
  const db = await getDb();
  const res = await db
    .delete(schema.mails)
    .where(and(eq(schema.mails.id, id), eq(schema.mails.owner, box.owner)))
    .returning({ id: schema.mails.id });
  if (res.length === 0) throw notFound();
}

/** Abmelden: das ganze Postfach (Posteingang und Gesendet) löschen. */
export async function deleteMailbox(owner: string): Promise<number> {
  const db = await getDb();
  const res = await db.delete(schema.mails).where(eq(schema.mails.owner, owner)).returning({ id: schema.mails.id });
  return res.length;
}

/** „Jetzt beenden“: alle Mails des Termins, auch die Kopien bei der Kursleitung. */
export async function deleteEventMails(eventId: string): Promise<void> {
  const db = await getDb();
  await db.delete(schema.mails).where(eq(schema.mails.eventId, eventId));
}

/** Mails beendeter Termine und Notizen der Kursleitung an sich selbst, die älter als 24 Stunden sind. */
export async function purgeMail(): Promise<number> {
  const db = await getDb();
  const res = (await db.execute(sql`
    DELETE FROM mails WHERE
      (event_id IS NOT NULL AND event_id IN (
        SELECT id FROM events WHERE LEAST(ends_at, coalesce(ended_early_at, ends_at)) <= now()
      ))
      OR (event_id IS NULL AND sent_at < now() - interval '24 hours')
    RETURNING id
  `)) as unknown as { rows?: unknown[] } | unknown[];
  return Array.isArray(res) ? res.length : (res.rows?.length ?? 0);
}

const purgeState = globalThis as unknown as { freebieMailPurgeAt?: number };

/** Nebenbei aufräumen – höchstens einmal pro Minute und Instanz. */
export async function maybePurgeMail(): Promise<void> {
  const now = Date.now();
  if (purgeState.freebieMailPurgeAt && now - purgeState.freebieMailPurgeAt < 60_000) return;
  purgeState.freebieMailPurgeAt = now;
  await purgeMail();
}

// ---------------------------------------------------------------- Adressbuch und Empfänger

interface GuestTarget {
  local: string;
  guestId: string;
  groupId: string;
  eventId: string;
  open: boolean;
}

async function guestsByName(locals: string[]): Promise<GuestTarget[]> {
  if (locals.length === 0) return [];
  const db = await getDb();
  const rows = await db
    .select({ guest: schema.guests, event: schema.events })
    .from(schema.guests)
    .innerJoin(schema.events, eq(schema.guests.eventId, schema.events.id))
    .where(inArray(schema.guests.username, locals));
  return rows.map(({ guest, event }) => ({
    local: guest.username,
    guestId: guest.id,
    groupId: guest.groupId,
    eventId: guest.eventId,
    open: guestAccess({ startsAt: event.startsAt, endsAt: event.endsAt, endedEarlyAt: event.endedEarlyAt }).ok,
  }));
}

/** Gäste: die eigene Gruppe und die Kursleitung. Kursleitung: alle Gruppen laufender Termine. */
export async function contactsFor(box: Mailbox): Promise<MailContacts> {
  const db = await getDb();
  if (box.role === "guest") {
    const group = box.groupId
      ? (await db.select().from(schema.eventGroups).where(eq(schema.eventGroups.id, box.groupId)).limit(1))[0]
      : undefined;
    const members = box.groupId
      ? await db.select({ username: schema.guests.username }).from(schema.guests).where(eq(schema.guests.groupId, box.groupId)).orderBy(asc(schema.guests.username))
      : [];
    return {
      me: mailContact(box.local),
      teacher: mailContact(TEACHER),
      groups: [
        {
          id: box.groupId ?? "",
          name: group?.name ?? "Meine Gruppe",
          eventName: null,
          members: members.filter((g) => g.username !== box.local).map((g) => mailContact(g.username)),
        },
      ],
    };
  }
  const events = (await db.select().from(schema.events).orderBy(asc(schema.events.startsAt))).filter((e) =>
    guestAccess({ startsAt: e.startsAt, endsAt: e.endsAt, endedEarlyAt: e.endedEarlyAt }).ok,
  );
  if (events.length === 0) return { me: mailContact(TEACHER), teacher: null, groups: [] };
  const ids = events.map((e) => e.id);
  const groups = await db.select().from(schema.eventGroups).where(inArray(schema.eventGroups.eventId, ids)).orderBy(asc(schema.eventGroups.sortOrder));
  const guests = await db
    .select({ username: schema.guests.username, groupId: schema.guests.groupId })
    .from(schema.guests)
    .where(inArray(schema.guests.eventId, ids))
    .orderBy(asc(schema.guests.username));
  return {
    me: mailContact(TEACHER),
    teacher: null,
    groups: events.flatMap((e) =>
      groups
        .filter((g) => g.eventId === e.id)
        .map((g) => ({
          id: g.id,
          name: g.name,
          eventName: e.name,
          members: guests.filter((x) => x.groupId === g.id).map((x) => mailContact(x.username)),
        }))
        .filter((g) => g.members.length > 0),
    ),
  };
}

interface Delivery {
  owner: string;
  guestId: string | null;
}

/**
 * Prüft die Empfänger gegen das Adressbuch der Absenderin und ermittelt die Postfächer sowie den Termin
 * der Mail. Wirft eine verständliche Meldung, wenn eine Adresse nicht zugestellt werden kann.
 */
async function resolveRecipients(box: Mailbox, locals: string[]): Promise<{ deliveries: Delivery[]; eventId: string | null }> {
  const unique = [...new Set(locals)];
  const others = unique.filter((l) => l !== box.local && l !== TEACHER);
  const found = await guestsByName(others);
  const deliveries: Delivery[] = [];
  let eventId: string | null = box.eventId;

  if (box.role === "guest") {
    for (const local of others) {
      const g = found.find((x) => x.local === local);
      if (!g || g.groupId !== box.groupId || !g.open) {
        throw new HttpError(400, `„${mailAddress(local)}“ kann nicht zugestellt werden. Du kannst nur deiner Gruppe und der Kursleitung schreiben.`);
      }
      deliveries.push({ owner: g.guestId, guestId: g.guestId });
    }
  } else {
    for (const local of others) {
      const g = found.find((x) => x.local === local);
      if (!g || !g.open) throw new HttpError(400, `„${mailAddress(local)}“ kann nicht zugestellt werden: Es gibt keinen Gast mit diesem Namen in einem laufenden Termin.`);
      deliveries.push({ owner: g.guestId, guestId: g.guestId });
    }
    const events = new Set(found.filter((g) => others.includes(g.local)).map((g) => g.eventId));
    if (events.size > 1) throw new HttpError(400, "Eine E-Mail kann nur an Personen eines Termins gehen. Bitte für jeden Termin eine eigene E-Mail schreiben.");
    eventId = events.values().next().value ?? null;
  }
  if (unique.includes(TEACHER) && box.role === "guest") deliveries.push({ owner: "admin", guestId: null });
  if (unique.includes(box.local)) deliveries.push({ owner: box.owner, guestId: box.guestId });
  return { deliveries, eventId };
}

// ---------------------------------------------------------------- Senden

export interface SendInput {
  to: string[];
  cc?: string[];
  subject: string;
  body: string;
  inReplyTo?: string | null;
  viaFreebie?: boolean;
}

function parseList(raw: string[], label: string): string[] {
  return raw.map((entry) => {
    const local = parseAddress(entry);
    if (!local) throw new HttpError(400, `${label}: „${entry.trim().slice(0, 80)}“ ist keine Adresse in Freebie (…@freebie.example).`);
    return local;
  });
}

/** Verschickt eine Mail: Kopie in „Gesendet“ und je eine im Posteingang der Empfänger. */
export async function sendMail(box: Mailbox, input: SendInput): Promise<MailFull> {
  const to = parseList(input.to, "An");
  const cc = parseList(input.cc ?? [], "Cc").filter((l) => !to.includes(l));
  if (to.length === 0) throw new HttpError(400, "Bitte gib mindestens einen Empfänger an.");
  if (new Set([...to, ...cc]).size > MAIL_LIMITS.recipients) throw new HttpError(400, `Höchstens ${MAIL_LIMITS.recipients} Empfänger je E-Mail.`);
  const subject = cleanText(input.subject).replace(/\s*\n\s*/g, " ").trim();
  const body = cleanText(input.body);
  if (subject.length > MAIL_LIMITS.subject) throw new HttpError(400, `Der Betreff ist zu lang (höchstens ${MAIL_LIMITS.subject} Zeichen).`);
  if (body.length > MAIL_LIMITS.body) throw new HttpError(400, `Der Text ist zu lang (höchstens ${MAIL_LIMITS.body.toLocaleString("de-DE")} Zeichen).`);
  if (!subject && !body.trim()) throw new HttpError(400, "Bitte einen Betreff oder Text eingeben.");

  const { deliveries, eventId } = await resolveRecipients(box, [...to, ...cc]);
  const db = await getDb();
  const m = schema.mails;

  const [{ recent }] = (await db
    .select({ recent: count() })
    .from(m)
    .where(and(eq(m.owner, box.owner), eq(m.folder, "sent"), gt(m.sentAt, new Date(Date.now() - 60_000))))) as { recent: number }[];
  if (Number(recent) >= MAIL_LIMITS.perMinute) throw new HttpError(429, "Du hast gerade sehr viele E-Mails verschickt. Bitte warte eine Minute.");

  // Volle Postfächer melden, statt still nichts zuzustellen.
  const owners = [...new Set([box.owner, ...deliveries.map((d) => d.owner)])];
  const sizes = (await db.select({ owner: m.owner, n: count() }).from(m).where(inArray(m.owner, owners)).groupBy(m.owner)) as { owner: string; n: number }[];
  for (const s of sizes) {
    if (Number(s.n) < MAIL_LIMITS.mailbox) continue;
    if (s.owner === box.owner) throw new HttpError(400, "Dein Postfach ist voll. Bitte lösche alte E-Mails.");
    const local = s.owner === "admin" ? TEACHER : ((await db.select({ u: schema.guests.username }).from(schema.guests).where(eq(schema.guests.id, s.owner)).limit(1))[0]?.u ?? "?");
    throw new HttpError(400, `Das Postfach von ${mailAddress(local)} ist voll.`);
  }

  let inReplyTo: string | null = null;
  if (input.inReplyTo) {
    const own = await db.select({ id: m.id }).from(m).where(and(eq(m.id, input.inReplyTo), eq(m.owner, box.owner))).limit(1);
    inReplyTo = own[0]?.id ?? null;
  }

  const sentAt = new Date();
  const base = { eventId, fromAddress: box.local, toAddresses: to, ccAddresses: cc, subject, body, inReplyTo, viaFreebie: Boolean(input.viaFreebie), sentAt };
  const sentId = randomUUID();
  const seen = new Set<string>();
  const rows = [
    { ...base, id: sentId, owner: box.owner, guestId: box.guestId, folder: "sent", readAt: sentAt },
    ...deliveries
      .filter((d) => (seen.has(d.owner) ? false : (seen.add(d.owner), true)))
      .map((d) => ({ ...base, id: randomUUID(), owner: d.owner, guestId: d.guestId, folder: "inbox", readAt: null })),
  ];
  // Eine Anweisung für alle Kopien – entweder kommen alle an oder keine.
  await db.insert(m).values(rows);
  return toFull(rows[0] as MailRow);
}

/**
 * Begrüßung bei der Anmeldung, solange keine im Postfach liegt – auch wenn andere schon vorher
 * geschrieben haben. Nach dem Abmelden (Postfach gelöscht) kommt sie bei der nächsten Anmeldung neu.
 */
export async function ensureWelcomeMail(box: Mailbox, settings: AppSettings): Promise<void> {
  if (box.role !== "guest" || !settings.features.mailbox) return;
  const subject = settings.mailWelcomeSubject.trim();
  const body = settings.mailWelcomeText.trim();
  if (!subject && !body) return;
  const db = await getDb();
  const m = schema.mails;
  const existing = await db
    .select({ id: m.id })
    .from(m)
    .where(and(eq(m.owner, box.owner), eq(m.folder, "inbox"), eq(m.fromAddress, TEACHER), eq(m.subject, subject)))
    .limit(1);
  if (existing.length) return;
  await db.insert(schema.mails).values({
    id: randomUUID(),
    owner: box.owner,
    guestId: box.guestId,
    eventId: box.eventId,
    folder: "inbox",
    fromAddress: TEACHER,
    toAddresses: [box.local],
    ccAddresses: [],
    subject,
    body,
  });
}
